import { isAuthorizedRequest } from "../../../../lib/admin-auth";
import { readProducts } from "../../../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const products = await readProducts();
    
    // Filter to only published products and format for social media
    const liveProducts = (products || [])
      .filter((p) => p.publishStatus === "published")
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description || "",
        materials: Array.isArray(p.materials) ? p.materials.join(", ") : p.materials || "",
        jewelryType: p.jewelryType || "",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Group by category
    const byCategory = {};
    liveProducts.forEach((product) => {
      if (!byCategory[product.category]) {
        byCategory[product.category] = [];
      }
      byCategory[product.category].push(product);
    });

    return res.status(200).json({
      success: true,
      total: liveProducts.length,
      products: liveProducts,
      byCategory,
    });
  } catch (error) {
    console.error("Error fetching live products:", error);
    return res.status(500).json({ 
      error: "Failed to fetch products", 
      details: error.message 
    });
  }
}
