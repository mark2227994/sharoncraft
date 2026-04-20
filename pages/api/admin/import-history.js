import { supabase } from "../../../lib/supabase-server";
import { isAuthorizedRequest } from "../../../lib/admin-auth";

/**
 * Import history tracking for CSV bulk imports
 */

export default async function handler(req, res) {
  const auth = await isAuthorizedRequest(req);
  if (!auth.authorized) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    // Get import history
    try {
      const { data, error } = await supabase
        .from("import_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (error) {
      console.error("Get import history error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    // Log new import
    const { productCount, successCount, failureCount, errors, source } = req.body;

    if (!productCount) {
      return res.status(400).json({ error: "productCount required" });
    }

    try {
      const { data, error } = await supabase
        .from("import_history")
        .insert([
          {
            product_count: productCount,
            success_count: successCount || productCount,
            failure_count: failureCount || 0,
            errors: errors || [],
            source: source || "csv",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    } catch (error) {
      console.error("Log import history error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
