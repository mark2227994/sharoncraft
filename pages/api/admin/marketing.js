import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readMarketingStudio, writeMarketingStudio, readProducts } from "../../../lib/store";

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const [studio, products] = await Promise.all([readMarketingStudio(), readProducts()]);
    return res.status(200).json({ studio, products });
  }

  if (req.method === "POST") {
    const { section, item } = req.body || {};
    if (!section || !["campaigns", "planner", "leads"].includes(section)) {
      return res.status(400).json({ error: "Valid section required" });
    }

    const studio = await readMarketingStudio();
    const nextItem = {
      id: item?.id || createId(section.slice(0, -1)),
      createdAt: item?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item,
    };

    studio[section] = [...(studio[section] || []).filter((entry) => entry.id !== nextItem.id), nextItem];
    await writeMarketingStudio(studio);
    return res.status(200).json({ ok: true, item: nextItem, studio });
  }

  if (req.method === "DELETE") {
    const { section, id } = req.query;
    if (!section || !id || !["campaigns", "planner", "leads"].includes(section)) {
      return res.status(400).json({ error: "section and id required" });
    }

    const studio = await readMarketingStudio();
    studio[section] = (studio[section] || []).filter((entry) => entry.id !== id);
    await writeMarketingStudio(studio);
    return res.status(200).json({ ok: true, studio });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
