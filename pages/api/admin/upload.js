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
const MIME_EXTENSION_MAP = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

function sanitizeFolderPath(value) {
  return String(value || "")
    .split(/[\\/]+/)
    .map((segment) =>
      segment
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    )
    .filter(Boolean)
    .join("/");
}

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "Upload storage is not configured (missing BLOB_READ_WRITE_TOKEN)." });
  }

  // Parse the multipart form
  const form = formidable({
    uploadDir: "/tmp",
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 8 * 1024 * 1024,
    filter: ({ mimetype }) => mimetype != null && ALLOWED.has(String(mimetype)),
  });

  let fields;
  let files;
  try {
    [fields, files] = await form.parse(req);
  } catch (error) {
    return res.status(400).json({ error: `Parse error: ${String(error.message || error)}` });
  }

  const list = files.file;
  const file = Array.isArray(list) ? list[0] : list;
  if (!file) {
    return res.status(400).json({ error: "Add an image (JPEG, PNG, WebP, GIF, or SVG)." });
  }

  if (!ALLOWED.has(String(file.mimetype || ""))) {
    await fs.unlink(file.filepath).catch(() => {});
    return res.status(400).json({ error: "Invalid file type" });
  }

  // Read the temp file into memory
  let fileBuffer;
  try {
    fileBuffer = await fs.readFile(file.filepath);
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: "Uploaded file is empty. Please choose a valid image." });
    }
  } catch (error) {
    return res.status(500).json({ error: `Could not read file: ${String(error.message || error)}` });
  } finally {
    await fs.unlink(file.filepath).catch(() => {});
  }

  // Build a clean path for storage
  const originalName = String(file.originalFilename || "upload");
  const derivedExtension = path.extname(originalName);
  const ext = derivedExtension || MIME_EXTENSION_MAP[file.mimetype] || ".webp";
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "upload";
  const fileName = `${baseName}-${Date.now()}${ext}`;
  const requestedFolder = Array.isArray(fields?.folder) ? fields.folder[0] : fields?.folder;
  const cleanFolder = sanitizeFolderPath(requestedFolder);
  const blobKey = cleanFolder ? `uploads/${cleanFolder}/${fileName}` : `uploads/${fileName}`;

  try {
    const uploaded = await put(blobKey, fileBuffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: String(file.mimetype || "application/octet-stream"),
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return res.status(200).json({ path: uploaded.url });
  } catch (error) {
    return res.status(500).json({ error: `Could not save file to Blob storage: ${String(error?.message || error)}` });
  }
}
