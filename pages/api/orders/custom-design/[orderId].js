import { readWaOrders } from "../../../../lib/store";

export default async function handler(req, res) {
  const { orderId } = req.query;

  if (req.method === "GET") {
    try {
      const orders = await readWaOrders();
      const order = orders.find(o => o.id === orderId || o.orderReference === orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      return res.status(200).json({
        ok: true,
        order: {
          id: order.id,
          orderReference: order.orderReference,
          name: order.name,
          email: order.email,
          phone: order.phone,
          customRequest: order.customRequest,
          depositAmount: order.depositAmount || 0,
          totalPrice: order.totalPrice || 0,
          paymentStatus: order.paymentStatus || "pending-quote",
          paymentRef: order.paymentRef || null,
          createdAt: order.timestamp,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
}
