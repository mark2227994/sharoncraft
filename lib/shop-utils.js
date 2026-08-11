export const ITEMS_PER_PAGE = 12;

export const SHOP_SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low" },
  { value: "price_high", label: "Price: High" },
];

export const VALID_PRICE_RANGES = new Set([
  "all",
  "under-1000",
  "1000-3000",
  "3000-5000",
  "above-5000",
]);

export const VALID_PRODUCT_TYPES = new Set([
  "all",
  "ready_to_ship",
  "made_to_order",
  "custom_order",
]);

export function compactText(value) {
  return String(value || "").trim();
}

export function slugifyShopValue(value) {
  return compactText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function flattenShopNodes(nodes = [], trail = []) {
  return (nodes || []).flatMap((node) => [
    { ...node, trail },
    ...(Array.isArray(node.children)
      ? flattenShopNodes(node.children, [...trail, node.id])
      : []),
  ]);
}

export function normalizeSortValue(value) {
  const rawValue = compactText(value).toLowerCase();
  if (!rawValue) return "featured";
  if (rawValue === "recent") return "newest";
  if (rawValue === "price-asc") return "price_low";
  if (rawValue === "price-desc") return "price_high";
  return SHOP_SORT_OPTIONS.some((option) => option.value === rawValue)
    ? rawValue
    : "featured";
}

export function normalizeAvailabilityValue(value) {
  const rawValue = compactText(value).toLowerCase();
  return rawValue === "in_stock" || rawValue === "stock" ? "in_stock" : "all";
}

export function normalizeProductTypeValue(value) {
  const rawValue = compactText(value).toLowerCase();
  return VALID_PRODUCT_TYPES.has(rawValue) ? rawValue : "all";
}

export function normalizePriceRangeValue(value) {
  const rawValue = compactText(value).toLowerCase();
  return VALID_PRICE_RANGES.has(rawValue) ? rawValue : "all";
}

export function normalizePageValue(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 1) {
    return 1;
  }
  return Math.floor(numericValue);
}
