import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { getDashboardSnapshot } from "../../../lib/store";
import { getWaOrderStatusMeta } from "../../../lib/wa-orders";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { products, orders, mpesa, waOrders } = await getDashboardSnapshot();

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const inThisMonth = (value) => {
    const date = new Date(value);
    return date.getMonth() === month && date.getFullYear() === year;
  };

  const soldThisMonth = orders.filter((order) => order.status === "Completed" && inThisMonth(order.date)).length;
  const revenueThisMonth = mpesa
    .filter((transaction) => transaction.status === "Success" && inThisMonth(transaction.timestamp))
    .reduce((total, transaction) => total + Number(transaction.amount_kes || 0), 0);
  const pendingOrders = waOrders.filter((order) =>
    ["new", "seen", "confirmed", "paid", "dispatched"].includes(order.status),
  ).length;
  const draftProducts = products.filter((product) => product.publishStatus === "draft").length;

  return res.status(200).json({
    stats: [
      { label: "Total Products", value: products.length, delta: `${draftProducts} drafts in progress` },
      { label: "Products Sold This Month", value: soldThisMonth, delta: "Completed order count" },
      { label: "Revenue This Month", value: revenueThisMonth, delta: "From successful M-Pesa callbacks", terracotta: true },
      { label: "Active WA Orders", value: pendingOrders, delta: "Need follow-up" },
    ],
    orders,
    waOrders: waOrders.map((order) => ({
      ...order,
      statusLabel: getWaOrderStatusMeta(order.status).label,
      statusClass: getWaOrderStatusMeta(order.status).cls,
    })),
  });
}
