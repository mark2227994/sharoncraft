import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { isAuthorizedRequest } from "../../../lib/admin-auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

// Supabase project config (public values — safe to use server-side)
const SUPABASE_URL = "https://vonzscriztdcdhobulhy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_3CbiLXuCbqRGjKmBp7Ez3w_NV4HaLXa";
const STORAGE_BUCKET = "product-images";
const STORAGE_FOLDER = "catalog";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse the multipart form — write to /tmp (only writable dir on Vercel)
  const form = formidable({
    uploadDir: "/tmp",
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

  // Read the temp file
  let fileBuffer;
  try {
    fileBuffer = await fs.readFile(file.filepath);
  } catch (error) {
    return res.status(500).json({ error: "Could not read uploaded file" });
  } finally {
    await fs.unlink(file.filepath).catch(() => {});
  }

  // Build a clean filename
  const originalName = file.originalFilename || "upload";
  const ext = path.extname(originalName) || ".webp";
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  const fileName = `${baseName}-${Date.now()}${ext}`;
  const storagePath = `${STORAGE_FOLDER}/${fileName}`;

  // Upload to Supabase Storage
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`;
  let uploadRes;
  try {
    uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": file.mimetype,
        "x-upsert": "true",
      },
      body: fileBuffer,
    });
  } catch (error) {
    return res.status(500).json({ error: "Upload to storage failed", detail: String(error.message || error) });
  }

  if (!uploadRes.ok) {
    const detail = await uploadRes.text().catch(() => "");
    return res.status(500).json({ error: "Upload to storage failed", detail });
  }

  // Return the public URL for the uploaded file
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
  return res.status(200).json({ path: publicUrl });
}
