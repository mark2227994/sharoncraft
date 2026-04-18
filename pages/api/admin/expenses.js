import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readExpenses, writeExpenses } from "../../../lib/business-tools";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const expenses = await readExpenses();
    return res.status(200).json(expenses);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const expenses = await readExpenses();
    const id = body.id;
    if (id) {
      const idx = expenses.findIndex(e => e.id === id);
      if (idx >= 0) expenses[idx] = { ...expenses[idx], ...body, updatedAt: new Date().toISOString() };
    } else {
      expenses.push({ ...body, id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    await writeExpenses(expenses);
    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "ID required" });
    const expenses = await readExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    await writeExpenses(filtered);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}