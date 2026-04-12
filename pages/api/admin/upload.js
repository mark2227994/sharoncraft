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

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uploadRoot = path.join(process.cwd(), "public", "media", "uploads");
  await fs.mkdir(uploadRoot, { recursive: true });

  const form = formidable({
    uploadDir: uploadRoot,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 8 * 1024 * 1024,
    filter: ({ mimetype }) => mimetype != null && ALLOWED.has(String(mimetype)),
    createDirsFromUploads: true,
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

  const publicRoot = path.join(process.cwd(), "public");
  const rel = path.relative(publicRoot, file.filepath);
  const urlPath = `/${rel.split(path.sep).join("/")}`;

  if (!urlPath.startsWith("/media/uploads/")) {
    await fs.unlink(file.filepath).catch(() => {});
    return res.status(500).json({ error: "Invalid save path" });
  }

  return res.status(200).json({ path: urlPath });
}
