import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readAdminContentField, writeAdminContentField } from "../../../lib/admin-content";

const defaultFaqs = [
  {
    id: 1,
    category: 'Shipping',
    question: 'How long does shipping take?',
    answer: 'Shipping times vary by location. Kenya: 2-3 days, East Africa: 5-7 days, Worldwide: 10-21 days.',
    keywords: ['shipping', 'delivery', 'time'],
    featured: true,
    views: 234
  },
  {
    id: 2,
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We offer 30-day returns on items in original condition with receipt.',
    keywords: ['return', 'refund', 'policy'],
    featured: true,
    views: 189
  },
  {
    id: 3,
    category: 'Products',
    question: 'Is all jewelry genuine handmade?',
    answer: 'Yes! Every piece is handcrafted by our artisan partners. Each item is unique.',
    keywords: ['handmade', 'authentic', 'genuine'],
    featured: true,
    views: 156
  },
  {
    id: 4,
    category: 'Artisans',
    question: 'How do I know which artisan made my piece?',
    answer: 'Each product page displays the artisan\'s name, story, and location. You can learn more about them!',
    keywords: ['artisan', 'maker', 'who'],
    featured: false,
    views: 92
  }
];

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await readAdminContentField("faqs", defaultFaqs);
    return res.status(200).json(Array.isArray(data) ? data : defaultFaqs);
  }

  if (req.method === "POST") {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const payload = Array.isArray(req.body) ? req.body : defaultFaqs;
      await writeAdminContentField("faqs", payload);
      return res.status(200).json({ success: true, data: payload });
    } catch (error) {
      console.error("Error saving FAQs:", error);
      return res.status(500).json({ error: "Failed to save FAQs" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
