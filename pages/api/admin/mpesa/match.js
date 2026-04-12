import { isAuthorizedRequest } from "../../../../lib/admin-auth";
import { readMpesaTransactions, readOrders, writeMpesaTransactions, writeOrders } from "../../../../lib/store";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transactionId, orderId } = req.body || {};
  const [transactions, orders] = await Promise.all([readMpesaTransactions(), readOrders()]);

  const nextTransactions = transactions.map((transaction) =>
    transaction.id === transactionId ? { ...transaction, matched_order_id: orderId } : transaction,
  );
  const nextOrders = orders.map((order) =>
    order.id === orderId ? { ...order, status: "Completed", payment_method: "mpesa" } : order,
  );

  await Promise.all([writeMpesaTransactions(nextTransactions), writeOrders(nextOrders)]);

  return res.status(200).json({ ok: true });
}
