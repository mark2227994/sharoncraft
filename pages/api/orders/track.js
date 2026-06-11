import { getSupabaseAdmin } from "../../../lib/supabase/server";
import { normalizeManagedOrder, normalizePhoneNumber } from "../../../lib/order-management";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, phone, email } = req.body || {};

  if (!String(orderId || "").trim()) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedPhone && !normalizedEmail) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin.from("orders").select("*").eq("order_id", String(orderId).trim().toUpperCase());

    if (normalizedPhone) {
      query = query.eq("customer_phone", normalizedPhone);
    } else {
      query = query.eq("email", normalizedEmail);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return res.status(404).json({
        error: "No order found with the provided Order ID and phone number. Please check and try again.",
      });
    }

    const normalizedOrder = normalizeManagedOrder(order);

    return res.status(200).json({
      orderId: normalizedOrder.order_id,
      status: normalizedOrder.order_status,
      createdAt: normalizedOrder.created_at,
      totalAmount: normalizedOrder.total_amount,
      deliveryEstimate: normalizedOrder.estimated_delivery,
      deliveredAt: normalizedOrder.delivered_at,
      riderName: normalizedOrder.rider_name,
      riderPhone: normalizedOrder.rider_phone,
      items: normalizedOrder.items || [],
      customerLocation: normalizedOrder.customer_location,
      notes: normalizedOrder.notes,
    });
  } catch (error) {
    console.error("Track order error:", error);
    return res.status(500).json({
      error: "Unable to track order. Please try again or contact support.",
    });
  }
}
