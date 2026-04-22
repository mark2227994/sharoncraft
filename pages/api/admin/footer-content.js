import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readAdminContentField, writeAdminContentField } from "../../../lib/admin-content";

const defaultFooterContent = {
  column1: {
    title: "SharonCraft",
    bio: "Connecting hands with hearts. 47 Kenyan artisans crafting stories into every piece.",
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/sharoncraft" },
      { platform: "tiktok", url: "https://tiktok.com/@sharoncraft" },
      { platform: "facebook", url: "https://facebook.com/sharoncraft" },
    ],
    newsletter: {
      title: "Subscribe",
      placeholder: "Enter your email",
      buttonText: "Join",
    },
  },
  column2: {
    title: "Customer Service",
    links: [
      { label: "FAQ", url: "/faq" },
      { label: "Contact", url: "/contact" },
      { label: "Shipping", url: "/shipping" },
      { label: "Returns", url: "/shipping" },
    ],
  },
  column3: {
    title: "About",
    links: [
      { label: "Our Story", url: "/about" },
      { label: "Artisans", url: "/artisans" },
      { label: "Journal", url: "/journal" },
      { label: "Careers", url: "/contact" },
    ],
  },
  column4: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", url: "/privacy" },
      { label: "Terms & Conditions", url: "/terms" },
      { label: "Shipping Policy", url: "/shipping" },
      { label: "Return Policy", url: "/shipping" },
    ],
  },
  bottom: {
    copyright: "(c) 2026 SharonCraft. All rights reserved.",
    paymentMethods: ["Visa", "Mastercard", "M-Pesa", "Apple Pay"],
    trustBadges: ["Handmade", "Fair Trade", "Secure"],
  },
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await readAdminContentField("footerContent", defaultFooterContent);
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const payload = req.body && typeof req.body === "object" ? req.body : defaultFooterContent;
      await writeAdminContentField("footerContent", payload);
      return res.status(200).json({ success: true, data: payload });
    } catch {
      return res.status(500).json({ error: "Failed to save footer content" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
