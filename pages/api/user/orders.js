/**
 * GET /api/user/orders - Get orders for the authenticated user
 */
import { supabase } from "../../../lib/supabase-server";
import { readWaOrders } from "../../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user from session
    const cookieHeader = req.headers.cookie || "";
    const tokenPair = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("auth-token="));
    const token = tokenPair ? decodeURIComponent(tokenPair.split("=")[1] || "") : "";

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid session" });
    }

    // Get user's WhatsApp orders (matched by email)
    const allOrders = await readWaOrders();
    const userOrders = allOrders
      .filter((order) => order.email && order.email.toLowerCase() === user.email.toLowerCase())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10); // Last 10 orders

    return res.status(200).json({
      orders: userOrders,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || null,
        email_confirmed_at: user.email_confirmed_at,
      },
    });
  } catch (error) {
    console.error("User orders error:", error);
    return res.status(500).json({ error: "Failed to load orders" });
  }
}