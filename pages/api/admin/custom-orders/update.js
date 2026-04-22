import { readWaOrders, writeWaOrders } from "../../../../lib/store";
import { isAuthorizedRequest } from "../../../../lib/admin-auth";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, depositAmount, totalPrice } = req.body;

  if (!orderId || !depositAmount || !totalPrice) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const orders = await readWaOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update order with pricing
    orders[orderIndex].depositAmount = parseInt(depositAmount);
    orders[orderIndex].totalPrice = parseInt(totalPrice);
    orders[orderIndex].paymentStatus = "quote-sent";
    orders[orderIndex].quoteSentAt = new Date().toISOString();

    await writeWaOrders(orders);

    return res.status(200).json({
      ok: true,
      message: "Payment details updated",
      order: orders[orderIndex],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
