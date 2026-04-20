import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readWaOrders, writeWaOrders, readCustomOrders, writeCustomOrders } from "../../../lib/store";
import { readCustomers, writeCustomers } from "../../../lib/business-tools";

/**
 * Admin cleanup tool for clearing test data
 * DELETE /api/admin/cleanup?action=preview&type=orders
 * POST /api/admin/cleanup with action=execute
 */

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET - Preview what will be deleted
  if (req.method === "GET") {
    const { action, type } = req.query;

    if (action !== "preview") {
      return res.status(400).json({ error: "GET only supports ?action=preview" });
    }

    try {
      const stats = {};

      if (!type || type === "orders") {
        const waOrders = await readWaOrders();
        stats.waOrders = {
          count: waOrders.length,
          summary: waOrders.length > 0 ? `${waOrders.length} WhatsApp/checkout orders` : "No orders",
        };
      }

      if (!type || type === "custom") {
        const customOrders = await readCustomOrders();
        stats.customOrders = {
          count: customOrders.length,
          summary: customOrders.length > 0 ? `${customOrders.length} custom design orders` : "No custom orders",
        };
      }

      if (!type || type === "customers") {
        const customers = await readCustomers();
        stats.customers = {
          count: customers.length,
          summary: customers.length > 0 ? `${customers.length} customer records` : "No customers",
        };
      }

      const totalItems = Object.values(stats).reduce((sum, s) => sum + s.count, 0);

      return res.status(200).json({
        success: true,
        totalItems,
        stats,
      });
    } catch (error) {
      console.error("Preview error:", error);
      return res.status(500).json({ error: `Preview failed: ${error.message}` });
    }
  }

  // POST - Execute cleanup
  if (req.method === "POST") {
    const { action, types } = req.body;

    if (action !== "execute") {
      return res.status(400).json({ error: "POST requires action=execute" });
    }

    if (!Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ error: "types array required" });
    }

    try {
      const results = {
        waOrders: { deleted: 0, success: false },
        customOrders: { deleted: 0, success: false },
        customers: { deleted: 0, success: false },
      };

      if (types.includes("orders")) {
        await writeWaOrders([]);
        const waOrders = await readWaOrders();
        results.waOrders.success = true;
        results.waOrders.deleted = 0;
      }

      if (types.includes("custom")) {
        await writeCustomOrders([]);
        const customOrders = await readCustomOrders();
        results.customOrders.success = true;
        results.customOrders.deleted = 0;
      }

      if (types.includes("customers")) {
        await writeCustomers([]);
        const customers = await readCustomers();
        results.customers.success = true;
        results.customers.deleted = 0;
      }

      return res.status(200).json({
        success: true,
        message: "Cleanup completed successfully",
        results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Cleanup error:", error);
      return res.status(500).json({ error: `Cleanup failed: ${error.message}` });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
