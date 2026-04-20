import { supabase } from "../../../lib/supabase-server";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
    });

    if (error) {
      // Log but don't expose whether email exists (security best practice)
      console.error("Password reset error:", error);
    }

    // Always return success for security (don't leak if email exists)
    return res.status(200).json({
      message: "If an account exists with that email, a reset link has been sent",
    });
  } catch (error) {
    console.error("Password reset endpoint error:", error);
    return res.status(500).json({ error: "Failed to process request" });
  }
}
