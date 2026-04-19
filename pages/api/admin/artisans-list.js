import { readSiteImages } from "../../../lib/site-images";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const siteImages = await readSiteImages();
    let artisans = [];

    if (siteImages.artisanStories) {
      try {
        const parsed = JSON.parse(siteImages.artisanStories);
        if (Array.isArray(parsed)) {
          artisans = parsed.map((a, index) => ({
            id: a.name?.toLowerCase().replace(/\s+/g, "-") || `artisan-${index}`,
            name: a.name,
            location: a.location,
            craft: a.craft,
          }));
        }
      } catch (_err) {
        // Silently fail if artisanStories is not valid JSON
      }
    }

    return res.status(200).json({ artisans });
  } catch (error) {
    return res.status(500).json({ error: "Could not load artisans" });
  }
}
