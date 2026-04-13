import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { isAuthorizedRequest } from "../../../lib/admin-auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Use /tmp as the upload directory — the only writable folder on Vercel
  const tmpDir = "/tmp";

  const form = formidable({
    uploadDir: tmpDir,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 8 * 1024 * 1024,
    filter: ({ mimetype }) => mimetype != null && ALLOWED.has(String(mimetype)),
  });

  let files;
  try {
    [, files] = await form.parse(req);
  } catch (error) {
    return res.status(400).json({ error: "Upload failed", detail: String(error.message || error) });
  }

  const list = files.file;
  if (!list?.length) {
    return res.status(400).json({ error: "Add an image (JPEG, PNG, WebP, GIF, or SVG)." });
  }

  const file = list[0];
  if (!ALLOWED.has(file.mimetype)) {
    await fs.unlink(file.filepath).catch(() => {});
    return res.status(400).json({ error: "Invalid file type" });
  }

  // Read the temp file and upload to Vercel Blob
  let fileBuffer;
  try {
    fileBuffer = await fs.readFile(file.filepath);
  } catch (error) {
    return res.status(500).json({ error: "Could not read uploaded file" });
  } finally {
    // Clean up the temp file
    await fs.unlink(file.filepath).catch(() => {});
  }

  // Create a clean filename from the original name
  const originalName = file.originalFilename || "upload";
  const ext = path.extname(originalName) || ".webp";
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  const blobName = `products/${baseName}-${Date.now()}${ext}`;

  try {
    const blob = await put(blobName, fileBuffer, {
      access: "public",
      contentType: file.mimetype,
    });
    return res.status(200).json({ path: blob.url });
  } catch (error) {
    return res.status(500).json({
      error: "Upload to storage failed",
      detail: String(error.message || error),
    });
  }
}
