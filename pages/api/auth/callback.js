import { supabase } from "../../../lib/supabase-server";
import { serialize } from "cookie";

const COOKIE_NAME = "auth-token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export default async function handler(req, res) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      console.error("OAuth callback error:", error);
      return res.redirect("/login?error=oauth_failed");
    }

    // Set cookie with session token
    const cookie = serialize(COOKIE_NAME, data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);

    // Redirect to account page
    return res.redirect("/account");
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.redirect("/login?error=oauth_error");
  }
}
