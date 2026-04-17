import { supabase } from "../../../lib/supabase-server";
import { serialize } from "cookie";

const COOKIE_NAME = "auth-token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export default async function handler(req, res) {
  const { auth } = req.query;
  const action = auth?.[0];

  if (req.method === "POST") {
    if (action === "login") {
      return handleLogin(req, res);
    }
    if (action === "register") {
      return handleRegister(req, res);
    }
  }

  if (req.method === "DELETE") {
    if (action === "logout") {
      return handleLogout(req, res);
    }
  }

  if (req.method === "GET") {
    if (action === "session") {
      return handleSession(req, res);
    }
  }

  return res.status(404).json({ error: "Not found" });
}

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Set cookie
    const cookie = serialize(COOKIE_NAME, data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
}

async function handleRegister(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || "",
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.session) {
      const cookie = serialize(COOKIE_NAME, data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MAX_AGE,
        path: "/",
      });

      res.setHeader("Set-Cookie", cookie);
    }

    return res.status(200).json({
      user: data.user,
      message: data.session ? "Registered successfully" : "Check email to confirm",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
}

async function handleLogout(req, res) {
  try {
    const token = req.cookies?.get(COOKIE_NAME)?.value;

    if (token) {
      await supabase.auth.signOut(token);
    }

    // Clear cookie
    const cookie = serialize(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Logout failed" });
  }
}

async function handleSession(req, res) {
  try {
    const token = req.cookies?.get(COOKIE_NAME)?.value;

    if (!token) {
      return res.status(200).json({ user: null });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(200).json({ user: null });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
      },
    });
  } catch (error) {
    return res.status(200).json({ user: null });
  }
}