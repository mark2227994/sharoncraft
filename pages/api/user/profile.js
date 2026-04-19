import { supabase } from "../../../lib/supabase-server";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return handleGetProfile(req, res);
  }
  if (req.method === "PUT") {
    return handleUpdateProfile(req, res);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGetProfile(req, res) {
  try {
    const token = req.cookies["auth-token"];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      ...profile,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
}

async function handleUpdateProfile(req, res) {
  try {
    const token = req.cookies["auth-token"];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, phone, addresses } = req.body;

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: user.id,
          name,
          phone,
          addresses: addresses || [],
          updated_at: new Date(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to update profile" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}
