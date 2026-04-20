import { supabase } from "../../../lib/supabase-server";
import { isAuthorizedRequest } from "../../../lib/admin-auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Check authorization
  const auth = await isAuthorizedRequest(req);
  if (!auth.authorized) return res.status(401).json({ error: "Unauthorized" });

  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "Product ID required" });

  try {
    // Get the product to duplicate
    const { data: originalProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError) throw new Error(`Failed to fetch product: ${fetchError.message}`);
    if (!originalProduct) return res.status(404).json({ error: "Product not found" });

    // Create a new product with duplicated data
    const newProduct = {
      ...originalProduct,
      id: undefined, // Let the database generate a new ID
      name: `${originalProduct.name} (Copy)`,
      slug: `${originalProduct.slug}-copy-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Insert the new product
    const { data: duplicatedProduct, error: insertError } = await supabase
      .from("products")
      .insert([newProduct])
      .select()
      .single();

    if (insertError) throw new Error(`Failed to duplicate product: ${insertError.message}`);

    return res.status(200).json({
      success: true,
      product: duplicatedProduct,
      message: `Product "${originalProduct.name}" duplicated successfully as "${duplicatedProduct.name}"`,
    });
  } catch (error) {
    console.error("Duplicate product error:", error);
    return res.status(500).json({ error: error.message });
  }
}
