import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readInventory, writeInventory } from "../../../lib/business-tools";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const inventory = await readInventory();
    return res.status(200).json(inventory);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const inventory = await readInventory();
    const id = body.id;
    if (id) {
      const idx = inventory.findIndex(i => i.id === id);
      if (idx >= 0) inventory[idx] = { ...inventory[idx], ...body, updatedAt: new Date().toISOString() };
    } else {
      inventory.push({ ...body, id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    await writeInventory(inventory);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}