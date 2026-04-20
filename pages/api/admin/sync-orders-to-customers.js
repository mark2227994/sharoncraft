import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readWaOrders } from "../../../lib/store";
import { readCustomers, writeCustomers } from "../../../lib/business-tools";

/**
 * Syncs customer data from WhatsApp orders to the customers database.
 * Creates new customer records from orders and updates existing ones with order history.
 */
export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const waOrders = await readWaOrders();
    const customers = await readCustomers();

    // Create a map of existing customers by phone for easy lookup
    const customerMap = new Map(
      customers.map(c => [normalizePhone(c.phone), c])
    );

    // Group orders by phone number
    const ordersByPhone = {};
    waOrders.forEach(order => {
      const phone = normalizePhone(order.phone);
      if (!ordersByPhone[phone]) ordersByPhone[phone] = [];
      ordersByPhone[phone].push(order);
    });

    // Process each customer and their orders
    const updatedCustomers = [...customers];
    const newCustomers = [];

    Object.entries(ordersByPhone).forEach(([phone, orders]) => {
      const existingCustomer = customerMap.get(phone);
      
      // Calculate stats from orders
      const cartOrders = orders.filter(o => o.source === "checkout");
      const customOrders = orders.filter(o => o.source === "custom-design");
      const totalSpent = orders
        .filter(o => o.status === "paid" || o.status === "delivered")
        .reduce((sum, o) => sum + (o.total || 0), 0);
      const lastOrderDate = orders[0]?.timestamp;

      const orderSummary = {
        totalOrders: orders.length,
        cartOrders: cartOrders.length,
        customOrders: customOrders.length,
        totalSpent,
        lastOrderDate,
        orderReferences: orders.map(o => o.orderReference),
      };

      if (existingCustomer) {
        // Update existing customer with order info
        const idx = updatedCustomers.findIndex(c => c.id === existingCustomer.id);
        updatedCustomers[idx] = {
          ...existingCustomer,
          totalOrders: orderSummary.totalOrders,
          totalSpent: orderSummary.totalSpent,
          lastOrderDate: orderSummary.lastOrderDate,
          orderSummary,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Create new customer from first order
        const firstOrder = orders[0];
        newCustomers.push({
          id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: firstOrder.name || "Unknown",
          phone,
          email: firstOrder.email || "",
          totalOrders: orderSummary.totalOrders,
          totalSpent: orderSummary.totalSpent,
          lastOrderDate: orderSummary.lastOrderDate,
          orderSummary,
          notes: `Auto-created from orders. Cart orders: ${orderSummary.cartOrders}, Custom orders: ${orderSummary.customOrders}`,
          tags: [
            orderSummary.customOrders > 0 ? "Custom Requester" : null,
            orderSummary.cartOrders > 0 ? "Shop Buyer" : null,
          ].filter(Boolean),
          createdAt: firstOrder.timestamp,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    // Save updated customers list
    const finalCustomers = [...updatedCustomers, ...newCustomers];
    await writeCustomers(finalCustomers);

    return res.status(200).json({
      ok: true,
      customersProcessed: Object.keys(ordersByPhone).length,
      customersCreated: newCustomers.length,
      customersUpdated: Object.keys(ordersByPhone).length - newCustomers.length,
      summary: {
        totalCustomersInSystem: finalCustomers.length,
        totalOrders: waOrders.length,
        totalSpent: finalCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
      },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return res.status(500).json({
      error: `Failed to sync customers: ${error.message}`,
    });
  }
}

function normalizePhone(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}
