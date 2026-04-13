/**
 * POST /api/orders/create-wa  — public endpoint (no auth required).
 * Called from the checkout page when a customer sends a WhatsApp order.
 * Stores the order in Supabase so the admin can track it.
 */
import { readWaOrders, writeWaOrders } from "../../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const { name, phone, area, items, subtotal, total } = body;

  if (!name || !phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const order = {
    id: `wa_${Date.now()}`,
    timestamp: new Date().toISOString(),
    name: String(name).trim(),
    phone: String(phone).trim(),
    area: String(area || "").trim(),
    items,
    subtotal: Number(subtotal) || 0,
    delivery: 300,
    total: Number(total) || 0,
    status: "pending", // pending | confirmed | completed | cancelled
    note: "",
  };

  try {
    const orders = await readWaOrders();
    orders.unshift(order); // newest first
    await writeWaOrders(orders);
    return res.status(200).json({ ok: true, orderId: order.id });
  } catch (error) {
    return res.status(500).json({ error: `Could not save order: ${error.message}` });
  }
}
