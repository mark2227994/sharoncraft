import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readAdminContentField, writeAdminContentField } from "../../../lib/admin-content";

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

export default async function handler(req, res) {
  if (req.method === "GET") {
    const content = await readAdminContentField("homepageContent", DEFAULT_CONTENT);
    return res.status(200).json({ content });
  }

  if (req.method === "POST") {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { content } = req.body || {};
      if (typeof content !== "object" || content === null) {
        return res.status(400).json({ error: "Invalid content format" });
      }
      await writeAdminContentField("homepageContent", { ...DEFAULT_CONTENT, ...content });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: String(error?.message || "Could not save content") });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
