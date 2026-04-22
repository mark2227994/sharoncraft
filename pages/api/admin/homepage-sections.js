import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readAdminContentField, writeAdminContentField } from "../../../lib/admin-content";

const defaultSections = [
  { id: 1, name: "Hero Slideshow", enabled: true, order: 1, type: "hero" },
  { id: 2, name: "Featured Products", enabled: true, order: 2, type: "featured", title: "Shop Fan Favorites", description: "" },
  { id: 3, name: "Artisan Stories", enabled: true, order: 3, type: "artisans", title: "Meet Our Makers", description: "" },
  { id: 4, name: "Testimonials", enabled: true, order: 4, type: "testimonials", title: "What Our Customers Say", description: "" },
  { id: 5, name: "Gift Guides", enabled: false, order: 5, type: "collections", title: "Perfect Gifts", description: "" },
  { id: 6, name: "Newsletter", enabled: true, order: 6, type: "newsletter", title: "Stay in the Loop", description: "Get exclusive offers & artisan stories" },
  { id: 7, name: "Trust Stats", enabled: true, order: 7, type: "stats", title: "By The Numbers", description: "" },
];

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await readAdminContentField("homepageSections", defaultSections);
    return res.status(200).json(Array.isArray(data) ? data : defaultSections);
  }

  if (req.method === "POST") {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const payload = Array.isArray(req.body) ? req.body : defaultSections;
      await writeAdminContentField("homepageSections", payload);
      return res.status(200).json({ success: true, data: payload });
    } catch (error) {
      return res.status(500).json({ error: "Failed to save homepage sections" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
