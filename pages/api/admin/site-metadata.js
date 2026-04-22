import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readAdminContentField, writeAdminContentField } from "../../../lib/admin-content";

const defaultMetadata = {
  branding: {
    siteTitle: "SharonCraft",
    siteDescription: "Handmade Kenyan jewelry, gifts, and home decor. Direct from artisans.",
    tagline: "No shortcuts. Just hands. Just heart.",
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
  },
  colors: {
    primary: "#C04D29",
    secondary: "#D4A574",
    accent: "#0f0f0f",
    background: "#f9f6ee",
  },
  social: {
    instagram: "https://instagram.com/sharoncraft",
    tiktok: "https://tiktok.com/@sharoncraft",
    whatsapp: "+254700000000",
    facebook: "https://facebook.com/sharoncraft",
    twitter: "https://twitter.com/sharoncraft",
  },
  contact: {
    supportEmail: "support@sharoncraft.com",
    businessEmail: "hello@sharoncraft.com",
    whatsappNumber: "+254700000000",
    address: "Nairobi, Kenya",
    businessHours: "Monday-Friday: 9AM-6PM EAT",
    phone: "+254 700 000 000",
  },
  seo: {
    googleAnalyticsId: "",
    sitemapUrl: "/sitemap.xml",
    robotsRules: "User-agent: *\nAllow: /",
  },
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await readAdminContentField("siteMetadata", defaultMetadata);
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const payload = req.body && typeof req.body === "object" ? req.body : defaultMetadata;
      await writeAdminContentField("siteMetadata", payload);
      return res.status(200).json({ success: true, data: payload });
    } catch {
      return res.status(500).json({ error: "Failed to save site metadata" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
