import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "homepage-content.json");

// Default content
const DEFAULT_CONTENT = {
  trustLine: "40+ hours per piece | Ethically made",
  artisanCount: "47",
  customerCount: "1,247",
  averageTime: "40+",
  heroSubtitle: "Handmade Kenyan Beadwork by 47 Artisans",
  heroDescription: "No shortcuts. Just hands. Just heart.",
  ctaShopText: "Shop Now",
  ctaShopLink: "/shop",
  ctaArtisansText: "Meet All Artisans",
  ctaArtisansLink: "/artisans",
};

function readContent() {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return DEFAULT_CONTENT;
}

function writeContent(content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  } catch (error) {
    console.error("Error writing content:", error);
    throw new Error("Could not save content");
  }
}

export default function handler(req, res) {
  if (req.method === "GET") {
    const content = readContent();
    return res.status(200).json({ content });
  }

  if (req.method === "POST") {
    try {
      const { content } = req.body;
      if (typeof content !== "object" || content === null) {
        return res.status(400).json({ error: "Invalid content format" });
      }
      writeContent(content);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
