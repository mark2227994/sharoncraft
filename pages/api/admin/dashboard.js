import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { getDashboardSnapshot, writeFinanceDashboard } from "../../../lib/store";
import { getWaOrderStatusMeta } from "../../../lib/wa-orders";
import { endOfWeek, format, isWithinInterval, startOfWeek } from "date-fns";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const weekStart = String(body.weekStart || "").trim();
    if (!weekStart) {
      return res.status(400).json({ error: "weekStart required" });
    }

    const { finance } = await getDashboardSnapshot();
    const currentWeeklyCosts = Array.isArray(finance?.weeklyCosts) ? finance.weeklyCosts : [];
    const nextEntry = {
      weekStart,
      stripeFees: Number(body.stripeFees || 0),
      materialCosts: Number(body.materialCosts || 0),
      shippingCosts: Number(body.shippingCosts || 0),
      updatedAt: new Date().toISOString(),
    };

    const nextFinance = {
      weeklyCosts: [nextEntry, ...currentWeeklyCosts.filter((entry) => entry.weekStart !== weekStart)].slice(0, 24),
    };

    await writeFinanceDashboard(nextFinance);
    return res.status(200).json({ ok: true, finance: nextFinance });
  }

  const { products, orders, mpesa, waOrders, finance } = await getDashboardSnapshot();

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const weekStartDate = startOfWeek(now, { weekStartsOn: 1 });
  const weekEndDate = endOfWeek(now, { weekStartsOn: 1 });
  const weekStart = format(weekStartDate, "yyyy-MM-dd");
  const inThisMonth = (value) => {
    const date = new Date(value);
    return date.getMonth() === month && date.getFullYear() === year;
  };
  const isThisWeek = (value) => {
    if (!value) return false;
    const date = new Date(value);
    return isWithinInterval(date, { start: weekStartDate, end: weekEndDate });
  };

  const soldThisMonth = orders.filter((order) => order.status === "Completed" && inThisMonth(order.date)).length;
  const revenueThisMonth = mpesa
    .filter((transaction) => transaction.status === "Success" && inThisMonth(transaction.timestamp))
    .reduce((total, transaction) => total + Number(transaction.amount_kes || 0), 0);
  const pendingOrders = waOrders.filter((order) =>
    ["new", "seen", "confirmed", "paid", "dispatched"].includes(order.status),
  ).length;
  const draftProducts = products.filter((product) => product.publishStatus === "draft").length;
  const weeklyFinance = Array.isArray(finance?.weeklyCosts)
    ? finance.weeklyCosts.find((entry) => entry.weekStart === weekStart)
    : null;

  const weeklyWaSales = waOrders
    .filter((order) => ["paid", "delivered"].includes(order.status) && isThisWeek(order.paidAt || order.deliveredAt || order.updatedAt || order.timestamp))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const weeklyMpesaSales = mpesa
    .filter((transaction) => transaction.status === "Success" && isThisWeek(transaction.timestamp))
    .reduce((sum, transaction) => sum + Number(transaction.amount_kes || 0), 0);
  const moneyIn = weeklyWaSales + weeklyMpesaSales;
  const stripeFees = Number(weeklyFinance?.stripeFees || 0);
  const materialCosts = Number(weeklyFinance?.materialCosts || 0);
  const shippingCosts = Number(weeklyFinance?.shippingCosts || 0);
  const moneyOut = stripeFees + materialCosts + shippingCosts;
  const netProfit = moneyIn - moneyOut;

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
    finance: {
      weekStart,
      weekLabel: `${format(weekStartDate, "dd MMM")} - ${format(weekEndDate, "dd MMM")}`,
      moneyIn,
      moneyOut,
      netProfit,
      stripeFees,
      materialCosts,
      shippingCosts,
      waSales: weeklyWaSales,
      mpesaSales: weeklyMpesaSales,
    },
  });
}
