import { supabase } from "../../lib/supabase-server";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }

  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return res.status(200).json({ message: "Already subscribed" });
    }

    // Add subscriber
    const { error } = await supabase.from("newsletter_subscribers").insert([
      {
        email: email.toLowerCase(),
        subscribed_at: new Date().toISOString(),
        status: "active",
      },
    ]);

    if (error) {
      console.error("Newsletter signup error:", error);
      return res.status(500).json({ error: "Failed to subscribe" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Newsletter signup error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
