import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readAdminContentField, writeAdminContentField } from "../../../lib/admin-content";

const defaultPromotions = [
  {
    id: 1,
    title: '20% OFF GIFTS',
    type: 'banner',
    position: 'hero',
    discountCode: 'GIFT20',
    discountPercentage: 20,
    description: 'Perfect for any occasion',
    startDate: '2025-04-15',
    endDate: '2025-04-30',
    cta: 'Shop Gifted Carry',
    ctaLink: '/shop?category=Gifted%20Carry',
    image: '',
    active: true
  },
  {
    id: 2,
    title: 'Free shipping $50+',
    type: 'badge',
    position: 'footer',
    description: 'On all orders over 50',
    active: true
  },
  {
    id: 3,
    title: 'Summer Collection',
    type: 'seasonal',
    collectionId: 'summer-2025',
    description: 'New colors & designs for summer',
    startDate: '2025-05-01',
    endDate: '2025-08-31',
    featured: true,
    active: false
  }
];

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await readAdminContentField("promotions", defaultPromotions);
    return res.status(200).json(Array.isArray(data) ? data : defaultPromotions);
  }

  if (req.method === "POST") {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const payload = Array.isArray(req.body) ? req.body : defaultPromotions;
      await writeAdminContentField("promotions", payload);
      return res.status(200).json({ success: true, data: payload });
    } catch (error) {
      console.error("Error saving promotions:", error);
      return res.status(500).json({ error: "Failed to save promotions" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
