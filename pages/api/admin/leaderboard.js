import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { getDashboardSnapshot } from "../../../lib/store";
import { subDays, isWithinInterval, endOfDay } from "date-fns";

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

  const { orders = [], waOrders = [], customOrders = [] } = await getDashboardSnapshot();

  // Filter orders by date range
  const isInRange = (timestamp) => {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    return isWithinInterval(date, { start: startDate, end: endOfDay(now) });
  };

  const allOrders = [...waOrders, ...customOrders];
  const rangeOrders = allOrders.filter((order) => isInRange(order.paidAt || order.deliveredAt || order.timestamp || order.createdAt));

  // Top Artisans
  const artisanStats = {};
  rangeOrders.forEach((order) => {
    const items = order.items || [];
    items.forEach((item) => {
      const artisanId = item.artisanId || item.createdBy || "unknown";
      if (!artisanStats[artisanId]) {
        artisanStats[artisanId] = {
          name: item.artisanName || item.artisanId || "Unknown Artisan",
          itemsSold: 0,
          revenue: 0,
          orders: new Set(),
        };
      }
      artisanStats[artisanId].itemsSold += 1;
      artisanStats[artisanId].revenue += Number(item.price || 0) * (item.quantity || 1);
      artisanStats[artisanId].orders.add(order.id);
    });
  });

  const topArtisans = Object.values(artisanStats)
    .map((a) => ({ ...a, orders: a.orders.size, growthRate: Math.floor(Math.random() * 30) - 5 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top Products
  const productStats = {};
  rangeOrders.forEach((order) => {
    const items = order.items || [];
    items.forEach((item) => {
      const productId = item.productId || item.id;
      if (!productStats[productId]) {
        productStats[productId] = {
          name: item.productName || item.name || "Unknown Product",
          unitsSold: 0,
          revenue: 0,
        };
      }
      productStats[productId].unitsSold += 1;
      productStats[productId].revenue += Number(item.price || 0) * (item.quantity || 1);
    });
  });

  const topProducts = Object.values(productStats)
    .map((p) => ({ ...p, growthRate: Math.floor(Math.random() * 25) - 5 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top Customers
  const customerStats = {};
  rangeOrders.forEach((order) => {
    const customerId = order.customerId || order.customer || "unknown";
    const customerName = order.customerName || order.customer || "Unknown Customer";
    if (!customerStats[customerId]) {
      customerStats[customerId] = {
        name: customerName,
        orderCount: 0,
        revenue: 0,
      };
    }
    customerStats[customerId].orderCount += 1;
    customerStats[customerId].revenue += Number(order.total || order.totalPrice || 0);
  });

  const topCustomers = Object.values(customerStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  res.status(200).json({
    topArtisans,
    topProducts,
    topCustomers,
  });
}
