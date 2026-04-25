import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";
import { isAuthorizedRequest } from "../../../lib/admin-auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);
const MIME_EXTENSION_MAP = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_UPLOAD_BUCKET = process.env.SUPABASE_UPLOAD_BUCKET || "product-images";

function hasSupabaseUploadConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

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

async function uploadToSupabase({ storagePath, fileBuffer, mimeType }) {
  const supabase = getSupabase();
  const { error: uploadError } = await supabase.storage.from(SUPABASE_UPLOAD_BUCKET).upload(storagePath, fileBuffer, {
    upsert: true,
    contentType: mimeType,
  });

  if (uploadError) {
    const message = String(uploadError.message || "Supabase upload failed");
    if (/unauthorized|forbidden|policy/i.test(message)) {
      throw new Error(
        "Supabase storage rejected this upload. Ensure SUPABASE_SERVICE_ROLE_KEY is set and the storage bucket allows writes."
      );
    }
    throw new Error(message);
  }

  const { data } = supabase.storage.from(SUPABASE_UPLOAD_BUCKET).getPublicUrl(storagePath);
  const publicUrl = String(data?.publicUrl || "");
  if (!publicUrl) {
    throw new Error("Supabase did not return a public URL");
  }

  return publicUrl;
}

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session expired. Please sign in again." });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const hasSupabaseConfig = hasSupabaseUploadConfig();
  if (!hasBlobToken && !hasSupabaseConfig) {
    return res.status(500).json({
      error:
        "Upload storage is not configured. Set BLOB_READ_WRITE_TOKEN, or configure SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  // Parse the multipart form
  const form = formidable({
    uploadDir: "/tmp",
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 40 * 1024 * 1024,
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
    return res.status(400).json({ error: "Add an image or video file." });
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

  if (!hasBlobToken && hasSupabaseConfig) {
    try {
      const supabasePath = await uploadToSupabase({
        storagePath: blobKey,
        fileBuffer,
        mimeType: String(file.mimetype || "application/octet-stream"),
      });
      return res.status(200).json({ path: supabasePath });
    } catch (error) {
      return res.status(500).json({
        error: `Could not save file to Supabase storage: ${String(error?.message || error)}`,
      });
    }
  }

  try {
    const uploaded = await put(blobKey, fileBuffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: String(file.mimetype || "application/octet-stream"),
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return res.status(200).json({ path: uploaded.url });
  } catch (error) {
    const message = String(error?.message || error);
    if (message.includes("Cannot use public access on a private store")) {
      if (hasSupabaseConfig) {
        try {
          const fallbackPath = await uploadToSupabase({
            storagePath: blobKey,
            fileBuffer,
            mimeType: String(file.mimetype || "application/octet-stream"),
          });
          return res.status(200).json({ path: fallbackPath });
        } catch (fallbackError) {
          return res.status(500).json({
            error:
              `Blob store is private and Supabase fallback failed: ${String(
                fallbackError?.message || fallbackError
              )}`,
          });
        }
      }

      return res.status(500).json({
        error:
          "Upload storage mismatch: your Vercel Blob store is private, but image uploads require public access. Set Blob store access to public, or configure SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for Supabase upload fallback.",
      });
    }

    return res.status(500).json({ error: `Could not save file to Blob storage: ${String(error?.message || error)}` });
  }
}
