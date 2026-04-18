import { supabase } from "../../../lib/supabase-server";

export default async function handler(req, res) {
  // Verify admin session
  const sessionToken = req.cookies.admin_session;
  if (!sessionToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const { data: subscribers, error } = await supabase
        .from("newsletter_subscribers")
        .select("email, subscribed_at, status")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({ subscribers: subscribers || [] });
    } catch (err) {
      console.error("Fetch subscribers error:", err);
      return res.status(500).json({ error: "Failed to load subscribers" });
    }
  }

  if (req.method === "DELETE") {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("email", email.toLowerCase());

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Delete subscriber error:", err);
      return res.status(500).json({ error: "Failed to delete" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
