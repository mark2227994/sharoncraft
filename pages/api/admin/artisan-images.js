import fs from "fs/promises";
import path from "path";
import { isAuthorizedRequest } from "../../../lib/admin-auth";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const imagesDir = path.join(process.cwd(), "public", "media", "site", "artisans");
    let files = [];
    try {
      files = await fs.readdir(imagesDir);
    } catch (error) {
      if (error?.code === "ENOENT") {
        return res.status(200).json({ images: [] });
      }
      throw error;
    }

    const images = files
      .filter(file => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file))
      .map(file => ({
        name: file,
        url: `/media/site/artisans/${file}`
      }));

    return res.status(200).json({ images });
  } catch (error) {
    console.error("Error reading artisan images:", error);
    return res.status(500).json({ error: "Failed to load images" });
  }
}
