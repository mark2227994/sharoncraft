import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { getDashboardSnapshot } from "../../../lib/store";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const range = req.query.range || "30days";
  const now = new Date();
  let startDate = now;

  if (range === "7days") startDate = subDays(now, 7);
  else if (range === "30days") startDate = subDays(now, 30);
  else if (range === "90days") startDate = subDays(now, 90);
  else startDate = new Date("2020-01-01");

  const { orders = [], mpesa = [], waOrders = [], products = [], customOrders = [] } = await getDashboardSnapshot();

  // Filter orders by date range
  const isInRange = (timestamp) => {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    return isWithinInterval(date, { start: startDate, end: endOfDay(now) });
  };

  // Revenue calculations
  const allOrders = [...waOrders, ...customOrders];
  const rangeOrders = allOrders.filter((order) => isInRange(order.paidAt || order.deliveredAt || order.timestamp || order.createdAt));
  const totalRevenue = rangeOrders
    .filter((order) => ["paid", "delivered"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.total || order.totalPrice || 0), 0);

  const totalOrders = rangeOrders.filter((order) => ["paid", "delivered"].includes(order.status)).length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Conversion rate (rough estimation based on completed vs all orders in range)
  const allRangeOrders = rangeOrders.length;
  const completedOrders = rangeOrders.filter((order) => order.status === "delivered").length;
  const conversionRate = allRangeOrders > 0 ? (completedOrders / allRangeOrders) * 100 : 0;

  // Revenue by status
  const revenueByStatus = {};
  ["new", "seen", "confirmed", "paid", "dispatched", "delivered", "cancelled"].forEach((status) => {
    revenueByStatus[status] = rangeOrders
      .filter((order) => order.status === status)
      .reduce((sum, order) => sum + Number(order.total || order.totalPrice || 0), 0);
  });

  // Top products
  const productSales = {};
  rangeOrders.forEach((order) => {
    const items = order.items || [];
    items.forEach((item) => {
      const productId = item.productId || item.id;
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.productName || item.name || "Unknown Product",
          count: 0,
          revenue: 0,
        };
      }
      productSales[productId].count += 1;
      productSales[productId].revenue += Number(item.price || 0) * (item.quantity || 1);
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top artisans
  const artisanSales = {};
  rangeOrders.forEach((order) => {
    const items = order.items || [];
    items.forEach((item) => {
      const artisanId = item.artisanId || item.createdBy || "unknown";
      if (!artisanSales[artisanId]) {
        artisanSales[artisanId] = {
          name: item.artisanName || item.artisanId || "Unknown Artisan",
          productsSold: 0,
          revenue: 0,
        };
      }
      artisanSales[artisanId].productsSold += 1;
      artisanSales[artisanId].revenue += Number(item.price || 0) * (item.quantity || 1);
    });
  });

  const topArtisans = Object.values(artisanSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Daily orders
  const ordersByDay = [];
  for (let i = 0; i < 30; i++) {
    const dayStart = startOfDay(subDays(now, i));
    const dayEnd = endOfDay(dayStart);
    const dayOrders = rangeOrders.filter((order) => {
      const orderDate = new Date(order.paidAt || order.deliveredAt || order.timestamp || order.createdAt);
      return isWithinInterval(orderDate, { start: dayStart, end: dayEnd });
    });

    if (dayOrders.length > 0) {
      ordersByDay.unshift({
        date: format(dayStart, "MMM dd"),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + Number(order.total || order.totalPrice || 0), 0),
      });
    }
  }

  res.status(200).json({
    totalRevenue,
    totalOrders,
    averageOrderValue,
    conversionRate,
    revenueByStatus,
    topProducts,
    topArtisans,
    ordersByDay,
  });
}
