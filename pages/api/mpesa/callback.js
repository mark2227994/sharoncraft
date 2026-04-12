import { buildMpesaTransaction, extractMpesaCallback } from "../../../lib/mpesa";
import { readMpesaTransactions, readOrders, writeMpesaTransactions, writeOrders } from "../../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parsed = extractMpesaCallback(req.body || {});
    const [transactions, orders] = await Promise.all([readMpesaTransactions(), readOrders()]);
    const matchedOrder = orders.find((order) => order.checkout_reference === parsed.accountReference);

    const transaction = buildMpesaTransaction(parsed, req.body, matchedOrder?.id || null);
    const nextTransactions = [transaction, ...transactions.filter((entry) => entry.id !== transaction.id)];
    const nextOrders = orders.map((order) => {
      if (order.checkout_reference !== parsed.accountReference) return order;
      return {
        ...order,
        status: parsed.resultCode === 0 ? "Completed" : "Failed",
        payment_reference: parsed.mpesaReceipt || order.payment_reference,
        payment_method: "mpesa",
      };
    });

    await Promise.all([writeMpesaTransactions(nextTransactions), writeOrders(nextOrders)]);

    return res.status(200).json({
      ok: true,
      resultCode: parsed.resultCode,
      saved: true,
      matchedOrderId: matchedOrder?.id || null,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to process callback" });
  }
}
