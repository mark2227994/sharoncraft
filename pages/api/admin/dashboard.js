import { getDashboardSnapshot } from "../../../lib/store";

export default async function handler(req, res) {
  const { products, orders, mpesa } = await getDashboardSnapshot();

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
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;

  return res.status(200).json({
    stats: [
      { label: "Total Products", value: products.length, delta: `${products.filter((product) => !product.isSold).length} ready to sell` },
      { label: "Products Sold This Month", value: soldThisMonth, delta: "Completed order count" },
      { label: "Revenue This Month", value: revenueThisMonth, delta: "From successful M-Pesa callbacks", terracotta: true },
      { label: "Pending Orders", value: pendingOrders, delta: "Need follow-up" },
    ],
    orders,
  });
}
