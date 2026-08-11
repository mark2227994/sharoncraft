export const CATEGORIES = [
  {
    name: "Jewellery",
    slug: "jewellery",
    aliases: ["jewelry", "beadwork"],
    subcategories: [
      { name: "Necklaces", slug: "necklaces", aliases: ["necklace", "collar", "pendant"] },
      { name: "Earrings", slug: "earrings", aliases: ["earring", "studs", "hoops", "drops"] },
      { name: "Bracelets", slug: "bracelets", aliases: ["bracelet", "wristband", "wrist"] },
      { name: "Bangles", slug: "bangles", aliases: ["bangle", "cuff"] },
      { name: "Anklets", slug: "anklets", aliases: ["anklet", "ankle"] },
      { name: "Rings", slug: "rings", aliases: ["ring", "finger ring"] },
      {
        name: "Hair Accessories",
        slug: "hair-accessories",
        aliases: ["hair accessory", "hair clip", "hair pin", "hair tie", "headband", "scrunchie"],
      },
      { name: "Sets & Collections", slug: "sets-collections", aliases: ["set", "sets", "collection", "collections"] },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    aliases: ["accessory", "bags accessories", "baskets weaving", "textiles"],
    subcategories: [
      { name: "Beaded Sandals", slug: "beaded-sandals", aliases: ["sandal", "sandals", "footwear", "shoes"] },
      { name: "Kiondos & Bags", slug: "kiondos-bags", aliases: ["kiondo", "kiondos", "bag", "bags", "tote", "woven bag"] },
      { name: "Belts", slug: "belts", aliases: ["belt"] },
      { name: "Key Holders", slug: "key-holders", aliases: ["key holder", "keychain", "keychains", "key ring", "key fob"] },
      { name: "Bags & Pouches", slug: "bags-pouches", aliases: ["pouch", "pouches"] },
    ],
  },
  {
    name: "African Wear",
    slug: "african-wear",
    aliases: ["bridal occasion", "bridal", "occasion", "fashion", "clothing", "clothes", "wear"],
    subcategories: [
      { name: "Maasai Shuka Wraps", slug: "maasai-shuka-wraps", aliases: ["shuka", "wrap", "wraps"] },
      { name: "Embroidered Tops", slug: "embroidered-tops", aliases: ["embroidered top", "embroidered blouse", "top", "tops"] },
      { name: "T-Shirts", slug: "t-shirts", aliases: ["t-shirt", "tee", "tees"] },
      { name: "Jumpsuits & Dresses", slug: "jumpsuits-dresses", aliases: ["jumpsuit", "jumpsuits", "dress", "dresses", "jumpsuit suits"] },
      { name: "Occasion Wear", slug: "occasion-wear", aliases: ["occasion wear", "bridal set", "bridal bead sets", "occasion sets", "sudanese occasion sets"] },
    ],
  },
  {
    name: "Home & Living",
    slug: "home-living",
    aliases: ["home decor", "home object", "home objects", "homeware", "decor", "home and living"],
    subcategories: [
      { name: "Baskets & Storage", slug: "baskets-storage", aliases: ["basket", "baskets", "storage", "organizer"] },
      { name: "Kitchen & Serving", slug: "kitchen-serving", aliases: ["kitchen", "serving", "tray", "bowl", "plate"] },
      { name: "Wall Decor", slug: "wall-decor", aliases: ["wall decor", "wall"] },
      { name: "Table Decor", slug: "table-decor", aliases: ["table decor", "centerpiece"] },
      { name: "Mugs & Cups", slug: "mugs-cups", aliases: ["mug", "mugs", "cup", "cups"] },
    ],
  },
  {
    name: "Art & Craft",
    slug: "art-craft",
    aliases: ["art and craft", "art", "craft", "arts crafts", "kenyan artifacts"],
    subcategories: [
      { name: "Soapstone Carvings", slug: "soapstone-carvings", aliases: ["soapstone", "soapstone carving", "soapstone carvings"] },
      { name: "Wooden Carvings", slug: "wooden-carvings", aliases: ["wood carvings", "wood carving", "woodcarvings", "wooden carving"] },
      { name: "Paintings & Prints", slug: "paintings-prints", aliases: ["painting", "paintings", "print", "prints"] },
      { name: "Beaded Art", slug: "beaded-art", aliases: ["beaded art"] },
      { name: "Mixed Media", slug: "mixed-media", aliases: ["mixed media"] },
    ],
  },
  {
    name: "Gifted Carry",
    slug: "gifted-carry",
    aliases: ["gift sets", "gift set", "gifts", "gift", "bundles", "bundle"],
    subcategories: [
      { name: "Gift Sets", slug: "gift-sets", aliases: ["gift set", "gift sets"] },
      { name: "Gift Wrapping", slug: "gift-wrapping", aliases: ["gift wrap", "gift wrapping"] },
      { name: "Corporate Gifts", slug: "corporate-gifts", aliases: ["corporate gifts"] },
      { name: "Occasion Gifts", slug: "occasion-gifts", aliases: ["occasion gifts", "custom gift boxes", "gift box", "gift boxes"] },
    ],
  },
];

function compactText(value) {
  return String(value || "").trim();
}

function normalizeLookupValue(value) {
  return compactText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueLookupValues(values) {
  return Array.from(new Set(values.map(normalizeLookupValue).filter(Boolean)));
}

function matchesLookup(target, values) {
  const normalizedTarget = normalizeLookupValue(target);
  return values.some((value) => normalizeLookupValue(value) === normalizedTarget);
}

function buildCategoryLookup(category) {
  return uniqueLookupValues([category.name, category.slug, ...(Array.isArray(category.aliases) ? category.aliases : [])]);
}

function buildSubcategoryLookup(subcategory) {
  return uniqueLookupValues([
    subcategory.name,
    subcategory.slug,
    ...(Array.isArray(subcategory.aliases) ? subcategory.aliases : []),
  ]);
}

export function getCategoryByName(name) {
  return CATEGORIES.find((category) => category.name === name) || null;
}

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((category) => category.slug === slug) || null;
}

export function getCategorySlug(name) {
  return getCategoryByName(name)?.slug || "";
}

export function normalizeCategoryName(value) {
  if (!compactText(value)) return "";

  for (const category of CATEGORIES) {
    if (matchesLookup(value, buildCategoryLookup(category))) {
      return category.name;
    }
  }

  return "";
}

export function getSubcategories(categoryName) {
  return getCategoryByName(categoryName)?.subcategories || [];
}

export function getSubcategoryByName(categoryName, subcategoryName) {
  return getSubcategories(categoryName).find((subcategory) => subcategory.name === subcategoryName) || null;
}

export function getSubcategoryBySlug(categorySlug, subcategorySlug) {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;
  return category.subcategories.find((subcategory) => subcategory.slug === subcategorySlug) || null;
}

export function normalizeSubcategoryName(categoryName, value) {
  const category = getCategoryByName(categoryName);
  if (!category || !compactText(value)) return "";

  for (const subcategory of category.subcategories) {
    if (matchesLookup(value, buildSubcategoryLookup(subcategory))) {
      return subcategory.name;
    }
  }

  return "";
}

export function findCategoryBySubcategory(value) {
  if (!compactText(value)) {
    return { category: null, subcategory: null };
  }

  for (const category of CATEGORIES) {
    const subcategoryName = normalizeSubcategoryName(category.name, value);
    if (subcategoryName) {
      return {
        category,
        subcategory: getSubcategoryByName(category.name, subcategoryName),
      };
    }
  }

  return { category: null, subcategory: null };
}

export function buildShopHref(categoryName, subcategoryName) {
  const category = categoryName ? getCategoryByName(categoryName) : null;
  if (!category) return "/shop";

  const subcategory = subcategoryName ? getSubcategoryByName(category.name, subcategoryName) : null;
  return subcategory ? `/shop/${category.slug}/${subcategory.slug}` : `/shop/${category.slug}`;
}

export function buildShopCategoryTree() {
  return [
    { id: "all", label: "All", children: [] },
    ...CATEGORIES.map((category) => ({
      id: category.slug,
      label: category.name,
      children: category.subcategories.map((subcategory) => ({
        id: subcategory.slug,
        label: subcategory.name,
      })),
    })),
  ];
}

export const CATEGORY_NAMES = CATEGORIES.map((category) => category.name);

export function getSmartFilterBySlug(slug) {
  if (!slug) return null;
  return { name: slug, slug, label: slug };
}
