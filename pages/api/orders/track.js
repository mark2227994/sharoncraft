import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, email } = req.body;

  if (!orderId?.trim()) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  if (!email?.trim()) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query orders table for matching order
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_id, email, status, created_at, total_amount, tracking_number, delivery_estimate, items")
      .eq("order_id", orderId.toUpperCase())
      .eq("email", email.toLowerCase())
      .single();

    if (error || !order) {
      return res.status(404).json({
        error: "No order found with the provided Order ID and email. Please check and try again.",
      });
    }

    // Format response
    const response = {
      orderId: order.order_id,
      email: order.email,
      status: order.status || "pending",
      createdAt: order.created_at,
      totalAmount: order.total_amount,
      trackingNumber: order.tracking_number,
      deliveryEstimate: order.delivery_estimate,
      items: order.items || [],
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Track order error:", error);
    return res.status(500).json({
      error: "Unable to track order. Please try again or contact support.",
    });
  }
}
