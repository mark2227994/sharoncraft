import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readMarketingStudio, readProducts, writeMarketingStudio } from "../../../lib/store";

function createId() {
  return `offer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const [studio, products] = await Promise.all([readMarketingStudio(), readProducts()]);
    return res.status(200).json({ offers: studio.offers || [], products });
  }

  if (req.method === "POST") {
    const { item } = req.body || {};
    if (!item || !item.title) {
      return res.status(400).json({ error: "Offer title required" });
    }

    const studio = await readMarketingStudio();
    const nextItem = {
      id: item.id || createId(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item,
    };

    studio.offers = [...(studio.offers || []).filter((entry) => entry.id !== nextItem.id), nextItem];
    await writeMarketingStudio(studio);
    return res.status(200).json({ ok: true, item: nextItem, offers: studio.offers });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "id required" });
    }

    const studio = await readMarketingStudio();
    studio.offers = (studio.offers || []).filter((entry) => entry.id !== id);
    await writeMarketingStudio(studio);
    return res.status(200).json({ ok: true, offers: studio.offers });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
