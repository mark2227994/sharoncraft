import { supabase } from "../../../lib/supabase-server";
import { isAuthorizedRequest } from "../../../lib/admin-auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = await isAuthorizedRequest(req);
  if (!auth.authorized) return res.status(401).json({ error: "Unauthorized" });

  const { productIds, updates } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: "Product IDs array required" });
  }

  if (!updates || typeof updates !== "object") {
    return res.status(400).json({ error: "Updates object required" });
  }

  try {
    // Build the update payload - only include fields that are being updated
    const updatePayload = {};
    
    // Allow updating: stock, price, originalPrice, publishStatus, isSold, featured
    const allowedFields = ["stock", "price", "originalPrice", "publishStatus", "isSold", "featured"];
    
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        updatePayload[key] = updates[key];
      }
    });

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Update all products
    const { error: updateError } = await supabase
      .from("products")
      .update(updatePayload)
      .in("id", productIds);

    if (updateError) throw new Error(`Update failed: ${updateError.message}`);

    return res.status(200).json({
      success: true,
      message: `Updated ${productIds.length} product(s)`,
      updated: productIds.length,
      fields: Object.keys(updatePayload),
    });
  } catch (error) {
    console.error("Batch edit error:", error);
    return res.status(500).json({ error: error.message });
  }
}
