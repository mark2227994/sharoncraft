/**
 * POST /api/orders/create-wa  — public endpoint (no auth required).
 * Called from the checkout page when a customer sends a WhatsApp order.
 * Stores the order in Supabase so the admin can track it.
 */
import { readProducts, readWaOrders, writeWaOrders } from "../../../lib/store";
import { buildOrderReference, normalizeWaOrder } from "../../../lib/wa-orders";

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

  const timestamp = new Date().toISOString();
  const id = `wa_${Date.now()}`;
  const products = await readProducts();
  const matchedProducts = items
    .map((item) => products.find((product) => product.id === item.id || product.slug === item.slug))
    .filter(Boolean);
  const fulfillmentType = matchedProducts.some((product) => product.fulfillmentType === "custom_order")
    ? "custom_order"
    : matchedProducts.some((product) => product.fulfillmentType === "made_to_order")
      ? "made_to_order"
      : "ready_to_ship";
  const productionNotes = Array.from(
    new Set(
      matchedProducts
        .map((product) => String(product.productionNote || "").trim())
        .filter(Boolean),
    ),
  );
  const order = normalizeWaOrder({
    id,
    orderReference: buildOrderReference(id, timestamp),
    timestamp,
    name: String(name).trim(),
    phone: String(phone).trim(),
    area: String(area || "").trim(),
    items,
    subtotal: Number(subtotal) || 0,
    delivery: 300,
    total: Number(total) || 0,
    status: "new",
    fulfillmentType,
    productionNote: productionNotes.join(" | "),
    note: "",
    source: "checkout",
  });

  const whatsappNote =
    fulfillmentType === "made_to_order"
      ? "This order includes a made-to-order piece. Please confirm the production timeline and final details with SharonCraft."
      : fulfillmentType === "custom_order"
        ? "This order includes a custom design item. Please confirm design details, timeline, and next steps with SharonCraft."
        : productionNotes[0] || "";

  try {
    const orders = await readWaOrders();
    orders.unshift(order); // newest first
    await writeWaOrders(orders);
    return res.status(200).json({
      ok: true,
      orderId: order.id,
      orderReference: order.orderReference,
      whatsappNote,
      order,
    });
  } catch (error) {
    return res.status(500).json({ error: `Could not save order: ${error.message}` });
  }
}
