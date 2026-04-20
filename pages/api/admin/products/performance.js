import { isAuthorizedRequest } from "../../../../lib/admin-auth";
import { supabase } from "../../../../lib/supabase-server";
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

    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        products: [],
        categories: [],
        topProducts: [],
        totals: {
          totalProducts: 0,
          publishedProducts: 0,
          draftProducts: 0,
          averagePrice: 0,
        },
      });
    }

    // Calculate category stats
    const categoryStats = {};
    const publishedCount = products.filter((p) => p.publishStatus === "published").length;
    const draftCount = products.filter((p) => p.publishStatus === "draft").length;

    products.forEach((product) => {
      const cat = product.category || "Uncategorized";
      if (!categoryStats[cat]) {
        categoryStats[cat] = {
          category: cat,
          count: 0,
          totalPrice: 0,
          avgPrice: 0,
          published: 0,
          draft: 0,
        };
      }
      categoryStats[cat].count += 1;
      categoryStats[cat].totalPrice += product.price || 0;
      if (product.publishStatus === "published") {
        categoryStats[cat].published += 1;
      } else {
        categoryStats[cat].draft += 1;
      }
    });

    // Add average prices
    Object.keys(categoryStats).forEach((cat) => {
      categoryStats[cat].avgPrice = Math.round(
        categoryStats[cat].totalPrice / categoryStats[cat].count
      );
    });

    const categories = Object.values(categoryStats).sort((a, b) => b.count - a.count);

    // Top products by price
    const topProducts = products
      .filter((p) => p.publishStatus === "published")
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        publishStatus: p.publishStatus,
      }));

    // Calculate totals
    const totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);
    const averagePrice = Math.round(totalPrice / products.length);

    const totals = {
      totalProducts: products.length,
      publishedProducts: publishedCount,
      draftProducts: draftCount,
      averagePrice,
      totalValue: totalPrice,
    };

    return res.status(200).json({
      success: true,
      products,
      categories,
      topProducts,
      totals,
    });
  } catch (error) {
    console.error("Error fetching product performance:", error);
    return res.status(500).json({ 
      error: "Failed to fetch product performance", 
      details: error.message 
    });
  }
}
