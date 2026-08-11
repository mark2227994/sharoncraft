import { isPublishedProduct, normalizeProducts } from "../../lib/products";
import { readProducts } from "../../lib/store";

function compact(value) {
  return String(value || "").trim();
}

function normalizeLimit(value) {
  const parsed = Number.parseInt(String(value || "20"), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 20;
  return Math.min(parsed, 50);
}

function toExcerpt(value) {
  return compact(value).slice(0, 220);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const q = compact(req.query.q).toLowerCase();
    const category = compact(req.query.category);
    const subcategory = compact(req.query.subcategory);
    const limit = normalizeLimit(req.query.limit);

    const allProducts = normalizeProducts(await readProducts()).filter(
      (product) => isPublishedProduct(product) && product?.is_visible !== false,
    );

    const filtered = allProducts.filter((product) => {
      if (category && product.category !== category) return false;
      if (subcategory && product.subcategory !== subcategory) return false;
      if (!q) return true;

      const haystack = [
        product.name,
        product.slug,
        product.category,
        product.subcategory,
        product.description,
        product.shortDescription,
        product.artisan,
      ]
        .map((value) => compact(value).toLowerCase())
        .join(" ");

      return haystack.includes(q);
    });

    const results = filtered.slice(0, limit).map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category || null,
      subcategory: product.subcategory || null,
      price: Number(product.price || 0),
      images: Array.isArray(product.images)
        ? product.images.map((image) => image?.src || image?.url || image).filter(Boolean)
        : [],
      artisan: product.artisan || null,
      availability:
        product.fulfillmentType === "ready_to_ship" && Number(product.stock || 0) <= 0
          ? "preorder"
          : product.fulfillmentType === "ready_to_ship"
            ? "in_stock"
            : "made_to_order",
      product_type: product.fulfillmentType || "ready_to_ship",
      excerpt: toExcerpt(product.shortDescription || product.description),
      url: `https://www.sharoncraft.co.ke/product/${product.slug}`,
    }));

    return res.status(200).json({
      query: {
        q,
        category: category || null,
        subcategory: subcategory || null,
        limit,
      },
      total: filtered.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Unable to fetch search results",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
