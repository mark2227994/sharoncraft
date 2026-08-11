import { normalizeShopCategoryTree, shopCategoryTree } from "../../../data/site";
import { readAdminContentField } from "../../../lib/admin-content";
import {
  flattenShopNodes,
  getShopNodeLookupValues,
  LEGACY_CATEGORY_MAP,
  normalizeAvailabilityValue,
  normalizePageValue,
  normalizePriceRangeValue,
  normalizeProductTypeValue,
  normalizeSortValue,
  resolveSubcategoryId,
} from "../../../lib/shop-utils";
import { queryShopProducts } from "../../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const categoryTree = normalizeShopCategoryTree(
      await readAdminContentField("shopTaxonomy", shopCategoryTree),
    );
    const flatNodes = flattenShopNodes(categoryTree);
    const nodeById = new Map(flatNodes.map((node) => [node.id, node]));
    const nodeByLookup = new Map(
      flatNodes.flatMap((node) =>
        getShopNodeLookupValues(node).map((value) => [value, node.id]),
      ),
    );
    const nodeByQueryValue = new Map(
      categoryTree
        .map((node) => [String(node.queryValue || "").trim(), node.id])
        .filter(([queryValue]) => Boolean(queryValue)),
    );

    const rawCategory =
      typeof req.query.category === "string" ? req.query.category.trim() : "";
    const activeCategory =
      LEGACY_CATEGORY_MAP.get(rawCategory) ||
      nodeByQueryValue.get(rawCategory) ||
      (rawCategory && nodeById.has(rawCategory) ? rawCategory : "all");

    const activeSubcategory = resolveSubcategoryId(
      req.query.subcategory,
      req.query.jewelryType,
      nodeByLookup,
    );

    const result = await queryShopProducts({
      categoryTree,
      activeCategory,
      activeSubcategory,
      availability: normalizeAvailabilityValue(req.query.availability),
      activePriceRange: normalizePriceRangeValue(req.query.price),
      activeProductType: normalizeProductTypeValue(req.query.productType),
      sortBy: normalizeSortValue(req.query.sort),
      page: normalizePageValue(req.query.page),
    });

    return res.status(200).json({
      products: result.products,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Unable to fetch shop products",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
