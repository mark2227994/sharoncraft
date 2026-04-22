import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readAdminContentField, writeAdminContentField } from "../../../lib/admin-content";

const defaultNavigation = {
  header: [
    { id: 1, label: "Shop", url: "/shop", order: 1 },
    { id: 2, label: "Artisans", url: "/artisans", order: 2 },
    { id: 3, label: "About", url: "/about", order: 3 },
    { id: 4, label: "Journal", url: "/articles", order: 4 },
    { id: 5, label: "Custom Orders", url: "/custom-order", order: 5 },
  ],
  footer: [
    {
      section: "Customer Service",
      items: [
        { label: "FAQ", url: "/faq" },
        { label: "Contact", url: "/contact" },
        { label: "Returns", url: "/returns" },
      ],
    },
    {
      section: "About",
      items: [
        { label: "Our Story", url: "/about" },
        { label: "Artisans", url: "/artisans" },
        { label: "Careers", url: "/careers" },
      ],
    },
    {
      section: "Legal",
      items: [
        { label: "Privacy Policy", url: "/privacy" },
        { label: "Terms", url: "/terms" },
        { label: "Shipping", url: "/shipping" },
      ],
    },
  ],
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await readAdminContentField("navigation", defaultNavigation);
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const payload = req.body && typeof req.body === "object" ? req.body : defaultNavigation;
      await writeAdminContentField("navigation", payload);
      return res.status(200).json({ success: true, data: payload });
    } catch {
      return res.status(500).json({ error: "Failed to save navigation" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
