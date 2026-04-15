import { readWaOrders, writeWaOrders } from "../../../lib/store";
import { buildOrderReference, normalizeWaOrder } from "../../../lib/wa-orders";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const { name, phone, designType, colors, occasion, budgetRange, neededBy, designBrief, referenceImage } = body;

  if (!name || !phone || !designType || !designBrief) {
    return res.status(400).json({ error: "Missing required custom design fields" });
  }

  const timestamp = new Date().toISOString();
  const id = `wa_${Date.now()}`;
  const order = normalizeWaOrder({
    id,
    orderReference: buildOrderReference(id, timestamp),
    timestamp,
    name: String(name).trim(),
    phone: String(phone).trim(),
    area: "",
    items: [{ id: "custom-design", name: `Custom Design - ${String(designType).trim()}`, price: 0, quantity: 1 }],
    subtotal: 0,
    delivery: 0,
    total: 0,
    status: "new",
    source: "custom-design",
    fulfillmentType: "custom_order",
    productionNote: "Custom design request needs design review, pricing, and timeline confirmation.",
    note: "",
    customRequest: {
      designType,
      colors,
      occasion,
      budgetRange,
      neededBy,
      designBrief,
      referenceImage,
    },
  });

  try {
    const orders = await readWaOrders();
    orders.unshift(order);
    await writeWaOrders(orders);
    return res.status(200).json({
      ok: true,
      orderReference: order.orderReference,
      order,
    });
  } catch (error) {
    return res.status(500).json({ error: `Could not save custom design request: ${error.message}` });
  }
}
