import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const imagesDir = path.join(process.cwd(), "public", "media", "site", "artisans");

    // Create directory if it doesn't exist
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const files = fs.readdirSync(imagesDir);

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