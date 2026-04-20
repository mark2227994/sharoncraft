import { readWaOrders, writeWaOrders } from "../../../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, paymentRef, paymentMethod } = req.body;

  if (!orderId || !paymentRef) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const orders = await readWaOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update order with payment proof
    orders[orderIndex].paymentRef = paymentRef.trim();
    orders[orderIndex].paymentMethod = paymentMethod || "mpesa";
    orders[orderIndex].paymentStatus = "deposit-pending";
    orders[orderIndex].paymentSubmittedAt = new Date().toISOString();

    await writeWaOrders(orders);

    return res.status(200).json({
      ok: true,
      message: "Payment proof submitted. We'll verify within 1 hour.",
      order: orders[orderIndex],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
