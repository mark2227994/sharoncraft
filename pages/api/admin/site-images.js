import { readSiteImages, writeSiteImages } from "../../../lib/site-images";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(await readSiteImages());
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const allowed = [
      "heroImage",
      "artisanPortrait",
      "collectionJewellery",
      "collectionHome",
      "collectionAccessories",
      "pageTexture",
    ];
    const patch = {};
    for (const key of allowed) {
      if (typeof body[key] === "string") {
        patch[key] = body[key].trim();
      }
    }
    const merged = await writeSiteImages(patch);
    return res.status(200).json({ ok: true, siteImages: merged });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
