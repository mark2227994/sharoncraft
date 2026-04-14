/**
 * GET  /api/admin/orders  - list all WhatsApp orders
 * POST /api/admin/orders  - update a single order (status, note, contact)
 * DELETE /api/admin/orders?id=wa_xxx - remove an order
 */
import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readWaOrders, writeWaOrders } from "../../../lib/store";
import { updateWaOrder } from "../../../lib/wa-orders";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const orders = await readWaOrders();
    return res.status(200).json({ orders });
  }

  if (req.method === "POST") {
    const { id, status, note, lastContactAt } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });

    const orders = await readWaOrders();
    const index = orders.findIndex((order) => order.id === id);
    if (index === -1) return res.status(404).json({ error: "Order not found" });

    orders[index] = updateWaOrder(orders[index], {
      ...(status ? { status } : {}),
      ...(note !== undefined ? { note: String(note) } : {}),
      ...(lastContactAt ? { lastContactAt: String(lastContactAt) } : {}),
    });

    await writeWaOrders(orders);
    return res.status(200).json({ ok: true, order: orders[index] });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id required" });

    const orders = await readWaOrders();
    const filtered = orders.filter((order) => order.id !== id);
    await writeWaOrders(filtered);
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
