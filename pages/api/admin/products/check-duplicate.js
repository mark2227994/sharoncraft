import { isAuthorizedRequest } from "../../../../lib/admin-auth";
import { supabase } from "../../../../lib/supabase-server";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Check in Supabase
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .ilike("name", name.trim());

    return res.status(200).json({
      exists: (count || 0) > 0,
      name: name.trim(),
    });
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return res.status(500).json({ error: "Failed to check duplicate" });
  }
}
