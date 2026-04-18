import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readCustomOrders, writeCustomOrders } from "../../../lib/store";
import { normalizeCustomOrder } from "../../../lib/custom-orders";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const orders = await readCustomOrders();
    return res.status(200).json({ orders });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    if (!body.customerName || !body.orderName) {
      return res.status(400).json({ error: "customerName and orderName are required" });
    }

    const nextOrder = normalizeCustomOrder({
      ...body,
      updatedAt: new Date().toISOString(),
      createdAt: body.createdAt || new Date().toISOString(),
    });

    const orders = await readCustomOrders();
    const index = orders.findIndex((entry) => entry.id === nextOrder.id);
    const nextOrders = [...orders];

    if (index >= 0) {
      nextOrders[index] = nextOrder;
    } else {
      nextOrders.unshift(nextOrder);
    }

    await writeCustomOrders(nextOrders);
    return res.status(200).json({ ok: true, order: nextOrder });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id required" });

    const orders = await readCustomOrders();
    await writeCustomOrders(orders.filter((entry) => entry.id !== id));
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
