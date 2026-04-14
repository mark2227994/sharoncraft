const PRODUCT_PLACEHOLDER_IMAGE = "/media/site/placeholder.svg";

const CATEGORY_MAP = new Map([
  ["jewellery", "Jewellery"],
  ["jewelry", "Jewellery"],
  ["necklace", "Jewellery"],
  ["necklaces", "Jewellery"],
  ["bracelet", "Jewellery"],
  ["bracelets", "Jewellery"],
  ["earring", "Jewellery"],
  ["earrings", "Jewellery"],
  ["beadwork", "Jewellery"],
  ["bridal", "Bridal & Occasion"],
  ["bridal occasion", "Bridal & Occasion"],
  ["bridal-occasion", "Bridal & Occasion"],
  ["occasion", "Bridal & Occasion"],
  ["gift set", "Gift Sets"],
  ["gift sets", "Gift Sets"],
  ["gift-set", "Gift Sets"],
  ["gift-sets", "Gift Sets"],
  ["home decor", "Home Decor"],
  ["home-decor", "Home Decor"],
  ["home object", "Home Decor"],
  ["home objects", "Home Decor"],
  ["woodcarvings", "Home Decor"],
  ["soapstone", "Home Decor"],
  ["ceramics", "Home Decor"],
  ["bags accessories", "Accessories"],
  ["bags-accessories", "Accessories"],
  ["bag", "Accessories"],
  ["bags", "Accessories"],
  ["accessories", "Accessories"],
  ["baskets & weaving", "Accessories"],
  ["baskets and weaving", "Accessories"],
  ["baskets-weaving", "Accessories"],
  ["baskets", "Accessories"],
  ["textiles", "Accessories"],
]);

const CATEGORY_ORDER = [
  "All",
  "Jewellery",
  "Home Decor",
  "Gift Sets",
  "Accessories",
  "Bridal & Occasion",
];

const CATEGORY_PRIORITY = new Map(
  CATEGORY_ORDER.map((category, index) => [category, index]),
);

function compactText(value) {
  return String(value || "").trim();
}

function titleCase(value) {
  return compactText(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeCategoryKey(value) {
  return compactText(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values) {
  return Array.from(
    new Set(
      values
        .map((value) => compactText(value))
        .filter(Boolean),
    ),
  );
}

export function slugify(value) {
  return compactText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeCategory(value) {
  const raw = compactText(value);
  if (!raw) return "Jewellery";

  const normalizedKey = normalizeCategoryKey(raw);
  const mapped =
    CATEGORY_MAP.get(normalizedKey) ||
    CATEGORY_MAP.get(normalizedKey.replace(/\sand\s/g, " ")) ||
    CATEGORY_MAP.get(normalizedKey.replace(/\s/g, "-"));

  return mapped || titleCase(raw);
}

export function normalizeImageEntry(image) {
  const src =
    typeof image === "string"
      ? compactText(image)
      : compactText(image?.src || image?.url || image?.image);

  if (!src) return null;
  return { src };
}

function buildImages(product) {
  const imageEntries = [];
  const primaryImage = normalizeImageEntry(product?.image);

  if (primaryImage) {
    imageEntries.push(primaryImage);
  }

  if (Array.isArray(product?.images)) {
    for (const image of product.images) {
      const normalized = normalizeImageEntry(image);
      if (normalized) {
        imageEntries.push(normalized);
      }
    }
  }

  const deduped = [];
  const seen = new Set();
  for (const image of imageEntries) {
    if (!seen.has(image.src)) {
      seen.add(image.src);
      deduped.push(image);
    }
  }

  if (deduped.length === 0) {
    deduped.push({ src: PRODUCT_PLACEHOLDER_IMAGE });
  }

  return deduped;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeProduct(product) {
  const safeName = compactText(product?.name) || titleCase(product?.id) || "Untitled Piece";
  const slug = slugify(product?.slug || product?.id || safeName);
  const images = buildImages(product);
  const image = images[0]?.src || PRODUCT_PLACEHOLDER_IMAGE;
  const category = normalizeCategory(product?.category);
  const artisan = compactText(product?.artisan) || "Sharon";
  const artisanLocation = compactText(product?.artisanLocation || product?.story?.artisanLocation);
  const yearsOfPractice = Math.max(
    0,
    toNumber(product?.yearsOfPractice ?? product?.story?.yearsOfPractice, 0),
  );
  const materials = uniqueStrings(product?.materials || product?.story?.materials || []);
  const price = Math.max(0, toNumber(product?.price, 0));
  const originalPrice = Math.max(0, toNumber(product?.originalPrice, 0));
  const stock =
    product?.stock === undefined || product?.stock === null
      ? product?.isSold
        ? 0
        : 1
      : Math.max(0, toNumber(product?.stock, 0));

  return {
    ...product,
    id: compactText(product?.id) || slug || `piece-${Date.now()}`,
    slug: slug || `piece-${Date.now()}`,
    name: safeName,
    artisan,
    artisanLocation,
    yearsOfPractice,
    category,
    price,
    originalPrice: originalPrice > price ? originalPrice : null,
    image,
    images,
    stock,
    isSold: Boolean(product?.isSold),
    isNew: Boolean(product?.isNew ?? product?.newArrival),
    featured: Boolean(product?.featured),
    recent: Boolean(product?.recent ?? product?.newArrival),
    badge: compactText(product?.badge),
    shortDescription:
      compactText(product?.shortDescription) ||
      compactText(product?.description) ||
      compactText(product?.heritageStory),
    description:
      compactText(product?.description) ||
      compactText(product?.shortDescription) ||
      compactText(product?.heritageStory),
    details: uniqueStrings(product?.details || []),
    heritageStory: compactText(product?.heritageStory),
    materials,
    story: {
      artisanName: compactText(product?.story?.artisanName) || artisan,
      artisanLocation,
      yearsOfPractice,
      materials,
      text: compactText(product?.story?.text),
      culturalNote: compactText(product?.story?.culturalNote),
      behindScenesPhoto:
        compactText(product?.story?.behindScenesPhoto) ||
        images[1]?.src ||
        image,
    },
  };
}

export function normalizeProducts(products) {
  return Array.isArray(products) ? products.map(normalizeProduct) : [];
}

export function getCatalogCategories(products) {
  const normalizedProducts = normalizeProducts(products);
  const present = new Set(normalizedProducts.map((product) => product.category).filter(Boolean));

  return CATEGORY_ORDER.filter((category) => category === "All" || present.has(category));
}

export function getCategoryPriority(category) {
  return CATEGORY_PRIORITY.get(category) ?? CATEGORY_ORDER.length;
}

export function prioritizeCategories(products) {
  return products.slice().sort((left, right) => {
    const priorityDiff = getCategoryPriority(left.category) - getCategoryPriority(right.category);
    if (priorityDiff !== 0) return priorityDiff;
    return left.name.localeCompare(right.name);
  });
}
