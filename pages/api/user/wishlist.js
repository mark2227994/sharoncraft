import { supabase } from "../../../lib/supabase-server";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return handleGetWishlist(req, res);
  }
  if (req.method === "POST") {
    return handleUpdateWishlist(req, res);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGetWishlist(req, res) {
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

    const { data: wishlist, error } = await supabase
      .from("wishlists")
      .select("product_ids")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return res.status(500).json({ error: "Failed to fetch wishlist" });
    }

    return res.status(200).json({
      product_ids: wishlist?.product_ids || [],
    });
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch wishlist" });
  }
}

async function handleUpdateWishlist(req, res) {
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

    const { product_ids } = req.body;

    const { data, error } = await supabase
      .from("wishlists")
      .upsert(
        {
          user_id: user.id,
          product_ids: product_ids || [],
          updated_at: new Date(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to update wishlist" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Wishlist update error:", error);
    return res.status(500).json({ error: "Failed to update wishlist" });
  }
}
