import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readSiteImages, writeSiteImages } from "../../../lib/site-images";

const ALLOWED_KEYS = [
  // Image paths
  "heroImage",
  "artisanPortrait",
  "collectionJewellery",
  "collectionHome",
  "collectionAccessories",
  "pageTexture",
  // Text content
  "heroTitle",
  "heroSubtitle",
  "artisanBio",
  "artisanStories",
  "aboutStory",
  "contactWhatsApp",
  "contactEmail",
  "businessHours",
  "deliveryNote",
];

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(await readSiteImages());
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const patch = {};
    for (const key of ALLOWED_KEYS) {
      if (typeof body[key] === "string") {
        patch[key] = body[key].trim();
      }
    }
    try {
      const result = await writeSiteImages(patch);
      return res.status(200).json({ ok: true, siteImages: result.siteImages, persistence: result.persistence });
    } catch (error) {
      return res.status(500).json({ error: `Save failed: ${error.message}` });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
