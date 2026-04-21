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

function isLambda() {
  return process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME || process.cwd().includes("/var/task");
}

function getStorageDir() {
  if (isLambda()) {
    return "/tmp/uploads";
  }
  return path.join(process.cwd(), "public", "uploads");
}

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
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
  if (!list?.length) {
    return res.status(400).json({ error: "Add an image (JPEG, PNG, WebP, GIF, or SVG)." });
  }

  const file = list[0];
  if (!ALLOWED.has(file.mimetype)) {
    await fs.unlink(file.filepath).catch(() => {});
    return res.status(400).json({ error: "Invalid file type" });
  }

  // Read the temp file into memory
  let fileBuffer;
  try {
    fileBuffer = await fs.readFile(file.filepath);
  } catch (error) {
    return res.status(500).json({ error: `Could not read file: ${String(error.message || error)}` });
  } finally {
    await fs.unlink(file.filepath).catch(() => {});
  }

  // Build a clean path for storage
  const originalName = file.originalFilename || "upload";
  const ext = path.extname(originalName) || ".webp";
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  const fileName = `${baseName}-${Date.now()}${ext}`;
  const requestedFolder = Array.isArray(fields?.folder) ? fields.folder[0] : fields?.folder;
  const cleanFolder = sanitizeFolderPath(requestedFolder);
  
  // Get the appropriate storage directory (handles Lambda and local)
  const storageBaseDir = getStorageDir();
  const storageDir = cleanFolder ? path.join(storageBaseDir, cleanFolder) : storageBaseDir;
  
  try {
    await fs.mkdir(storageDir, { recursive: true });
  } catch (error) {
    console.error("Storage error:", error);
    return res.status(500).json({ 
      error: `Could not create storage directory. This may be a temporary Lambda limitation. Please try again.`
    });
  }

  const filePath = path.join(storageDir, fileName);
  try {
    await fs.writeFile(filePath, fileBuffer);
  } catch (error) {
    console.error("Write error:", error);
    return res.status(500).json({ error: `Could not save file: ${String(error.message || error)}` });
  }

  // Return public URL path
  const publicPath = `/uploads/${cleanFolder}/${fileName}`.replace(/\/+/g, "/");
  return res.status(200).json({ path: publicPath });
}
