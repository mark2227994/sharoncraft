import { readMarketingStudio, writeMarketingStudio } from "../../../lib/store";

function normalizeItem(item) {
  return {
    id: String(item?.id || "").trim(),
    name: String(item?.name || "").trim(),
    price: Number(item?.price || 0),
    quantity: Number(item?.quantity || 0),
    image: String(item?.image || "").trim(),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const { draftId, name, phone, area, items, subtotal, total, status = "open" } = body;

  if (!draftId) {
    return res.status(400).json({ error: "draftId required" });
  }

  const normalizedItems = Array.isArray(items) ? items.map(normalizeItem).filter((item) => item.id || item.name) : [];
  if (normalizedItems.length === 0) {
    return res.status(400).json({ error: "items required" });
  }

  const studio = await readMarketingStudio();
  const current = Array.isArray(studio.abandonedCheckouts) ? studio.abandonedCheckouts : [];
  const existing = current.find((entry) => entry.id === draftId);
  const now = new Date().toISOString();

  const nextItem = {
    id: draftId,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    lastTouchedAt: now,
    status: String(status || "open").trim(),
    name: String(name || "").trim(),
    phone: String(phone || "").trim(),
    area: String(area || "").trim(),
    items: normalizedItems,
    subtotal: Number(subtotal || 0),
    total: Number(total || 0),
    source: "checkout",
  };

  studio.abandonedCheckouts = [nextItem, ...current.filter((entry) => entry.id !== draftId)];
  await writeMarketingStudio(studio);

  return res.status(200).json({ ok: true, item: nextItem });
}
