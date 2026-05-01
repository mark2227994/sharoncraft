import { supabase } from "../../lib/supabase-server";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!supabase) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ announcement: null });
  }

  try {
    const { data } = await supabase
      .from("announcement")
      .select("*")
      .eq("is_visible", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ announcement: data || null });
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ announcement: null });
  }
}
