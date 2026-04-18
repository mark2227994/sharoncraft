import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readCustomers, writeCustomers } from "../../../lib/business-tools";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const customers = await readCustomers();
    return res.status(200).json(customers);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const customers = await readCustomers();
    const id = body.id;
    if (id) {
      const idx = customers.findIndex(c => c.id === id);
      if (idx >= 0) customers[idx] = { ...customers[idx], ...body, updatedAt: new Date().toISOString() };
    } else {
      customers.push({ ...body, id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    await writeCustomers(customers);
    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "ID required" });
    const customers = await readCustomers();
    const filtered = customers.filter(c => c.id !== id);
    await writeCustomers(filtered);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}