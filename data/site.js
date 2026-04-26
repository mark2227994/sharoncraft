export const categoryOptions = [
  "All",
  "Jewellery",
  "Home Decor",
  "Gift Sets",
  "Accessories",
  "Bridal & Occasion",
];

export const shopCategoryTree = [
  {
    id: "all",
    label: "All",
    queryValue: "All",
  },
  {
    id: "jewellery",
    label: "Jewellery",
    queryValue: "Jewellery",
    match: {
      categories: ["Jewellery"],
    },
    children: [
      {
        id: "necklaces",
        label: "Necklaces",
        match: {
          categories: ["Jewellery"],
          jewelryTypes: ["necklace"],
        },
      },
      {
        id: "earrings",
        label: "Earrings",
        match: {
          categories: ["Jewellery"],
          jewelryTypes: ["earring"],
        },
      },
      {
        id: "bracelets",
        label: "Bracelets",
        match: {
          categories: ["Jewellery"],
          jewelryTypes: ["bracelet"],
        },
      },
      {
        id: "bangles",
        label: "Bangles",
        match: {
          categories: ["Jewellery"],
          jewelryTypes: ["bracelet"],
          keywords: ["bangle"],
        },
      },
      {
        id: "anklets",
        label: "Anklets",
        match: {
          categories: ["Jewellery"],
          keywords: ["anklet"],
        },
      },
      {
        id: "rings",
        label: "Rings",
        match: {
          categories: ["Jewellery"],
          keywords: ["ring"],
        },
      },
      {
        id: "hair-accessories",
        label: "Hair Accessories",
        match: {
          categories: ["Jewellery", "Accessories"],
          keywords: ["hair accessory", "hair clip", "hair pin", "hair tie", "scrunchie", "headband"],
        },
      },
    ],
  },
  {
    id: "african-wear",
    label: "African Wear",
    queryValue: "African Wear",
    match: {
      categories: ["African Wear", "Bridal & Occasion"],
    },
    children: [
      {
        id: "t-shirts",
        label: "T-Shirts",
        match: {
          categories: ["African Wear"],
          keywords: ["t-shirt", "tee"],
        },
      },
      {
        id: "embroidered-tops",
        label: "Embroidered Tops",
        match: {
          categories: ["African Wear"],
          keywords: ["embroidered top", "embroidered blouse", "top"],
        },
      },
      {
        id: "maasai-shuka-wraps",
        label: "Maasai Shuka Wraps",
        match: {
          categories: ["African Wear"],
          keywords: ["shuka", "wrap"],
        },
      },
      {
        id: "jumpsuit-suits",
        label: "Jumpsuit Suits",
        match: {
          categories: ["African Wear"],
          keywords: ["jumpsuit", "suit"],
        },
      },
      {
        id: "sudanese-occasion-sets",
        label: "Sudanese Occasion Sets",
        match: {
          categories: ["African Wear", "Bridal & Occasion"],
          keywords: ["sudanese", "occasion set"],
        },
      },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    queryValue: "Accessories",
    match: {
      categories: ["Accessories"],
    },
    children: [
      {
        id: "beaded-sandals",
        label: "Beaded Sandals",
        match: {
          categories: ["Accessories"],
          keywords: ["sandal"],
        },
      },
      {
        id: "kiondos",
        label: "Kiondos",
        match: {
          categories: ["Accessories"],
          keywords: ["kiondo"],
        },
      },
      {
        id: "belts",
        label: "Belts",
        match: {
          categories: ["Accessories"],
          keywords: ["belt"],
        },
      },
      {
        id: "bags-pouches",
        label: "Bags & Pouches",
        match: {
          categories: ["Accessories"],
          keywords: ["bag", "pouch"],
        },
      },
      {
        id: "key-holders",
        label: "Key Holders",
        match: {
          categories: ["Accessories"],
          keywords: ["key holder", "keychain", "key fob"],
        },
      },
    ],
  },
  {
    id: "art-craft",
    label: "Art & Craft",
    queryValue: "Art & Craft",
    match: {
      categories: ["Art & Craft", "Home Decor"],
      keywords: ["carving", "soapstone", "mixed media", "art", "craft"],
    },
    children: [
      {
        id: "wood-carvings",
        label: "Wood Carvings",
        match: {
          categories: ["Art & Craft", "Home Decor"],
          keywords: ["wood carving", "carving", "wood"],
        },
      },
      {
        id: "soapstone",
        label: "Soapstone",
        match: {
          categories: ["Art & Craft", "Home Decor"],
          keywords: ["soapstone"],
        },
      },
      {
        id: "mixed-media",
        label: "Mixed Media",
        match: {
          categories: ["Art & Craft", "Home Decor"],
          keywords: ["mixed media"],
        },
      },
    ],
  },
  {
    id: "home-living",
    label: "Home & Living",
    queryValue: "Home & Living",
    match: {
      categories: ["Home Decor"],
    },
    children: [
      {
        id: "kitchen-serving",
        label: "Kitchen & Serving",
        match: {
          categories: ["Home Decor"],
          keywords: ["kitchen", "serving", "tray", "bowl", "plate"],
        },
      },
      {
        id: "baskets-storage",
        label: "Baskets & Storage",
        match: {
          categories: ["Home Decor", "Accessories"],
          keywords: ["basket", "storage", "organizer"],
        },
      },
      {
        id: "wall-table-decor",
        label: "Wall & Table Decor",
        match: {
          categories: ["Home Decor"],
          keywords: ["wall", "table decor", "centerpiece", "decor"],
        },
      },
    ],
  },
  {
    id: "gifted-carry",
    label: "Gifted Carry",
    queryValue: "Gifted Carry",
    match: {
      categories: ["Gift Sets", "Accessories"],
      keywords: ["gift"],
    },
    children: [
      {
        id: "gift-sets",
        label: "Gift Sets",
        match: {
          categories: ["Gift Sets"],
        },
      },
      {
        id: "gift-wrapping",
        label: "Gift Wrapping",
        match: {
          categories: ["Gift Sets", "Accessories"],
          keywords: ["gift wrapping", "gift wrap"],
        },
      },
      {
        id: "custom-gift-boxes",
        label: "Custom Gift Boxes",
        match: {
          categories: ["Gift Sets"],
          keywords: ["custom gift", "gift box"],
        },
      },
    ],
  },
];

export const collectionCardLayout = [
  { title: "Jewellery", href: "/shop?category=Jewellery", imageKey: "collectionJewellery", itemCount: 24 },
  { title: "Home Objects", href: "/shop?category=Home%20Decor", imageKey: "collectionHome", itemCount: 18 },
  { title: "Gifted Carry", href: "/shop?category=Accessories", imageKey: "collectionAccessories", itemCount: 12 },
  { title: "Bridal & Occasion", href: "/shop?category=Bridal%20%26%20Occasion", imageKey: "collectionBridal", itemCount: 16 },
];

export const defaultAboutStory =
  "SharonCraft brings together handmade Kenyan beadwork, jewellery, and home pieces chosen for craft, warmth, and cultural memory. Each piece is meant to feel personal, giftable, and grounded in the story of the hands that made it.";

export function buildCollectionCards(siteImages) {
  return collectionCardLayout.map((row) => ({
    title: row.title,
    href: row.href,
    image: siteImages[row.imageKey] || "",
    itemCount: row.itemCount || 0,
  }));
}

export const trustItems = [
  { icon: "leaf", label: "Ethically sourced" },
  { icon: "package", label: "Shipped from Nairobi" },
  { icon: "mpesa", label: "M-Pesa & card accepted" },
];

export const primaryNavLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/artisans", label: "Artisans" },
  { href: "/about", label: "About" },
  { href: "/journal", label: "Journal" },
  { href: "/custom-order", label: "Custom Orders" },
];

export const mobileUtilityNavLinks = [
  { href: "/wishlist", label: "Wishlist" },
  { href: "/cart", label: "Cart" },
];

export const mobileNavLinks = [
  ...primaryNavLinks,
  ...mobileUtilityNavLinks,
];

export const artisanFeature = {
  name: "Nafula Wambui",
  location: "Karatina, Nyeri County",
  quote:
    "Every bead must feel like it belongs to the hand that wears it. I never want a piece to look repeated, only remembered.",
};

export const featuredArtisans = [
  {
    name: "Nafula Wambui",
    location: "Karatina, Nyeri County",
    craft: "Jewellery",
    image: "",
    href: "/shop?category=Jewellery",
    story:
      "Nafula creates beadwork with a balanced, ceremonial feel. Her pieces are known for clean lines, confident color, and the kind of finish that still feels handmade in the best way.",
  },
  {
    name: "Achieng Atieno",
    location: "Kisumu County, Kenya",
    craft: "Earrings",
    image: "",
    href: "/shop?category=Jewellery&jewelryType=earring",
    story:
      "Achieng focuses on lighter jewellery meant to move well with the body. Her earrings carry bright rhythm and a playful elegance that works beautifully for gifting and celebrations.",
  },
  {
    name: "Muthoni Wairimu",
    location: "Nairobi, Kenya",
    craft: "Necklaces",
    image: "",
    href: "/shop?category=Jewellery&jewelryType=necklace",
    story:
      "Muthoni's necklace work leans toward bold centerpieces and bridal styling. She builds each design to frame the neckline softly while still holding its own as the main statement.",
  },
];

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function compactText(value) {
  return String(value || "").trim();
}

function slugifyShopTaxonomyValue(value) {
  return compactText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeStringList(values) {
  const list = Array.isArray(values) ? values : String(values || "").split(",");
  return Array.from(
    new Set(
      list
        .map((value) => compactText(value))
        .filter(Boolean),
    ),
  );
}

function normalizeShopNode(node, fallbackLabel = "Untitled") {
  const label = compactText(node?.label) || fallbackLabel;
  const id = compactText(node?.id) || slugifyShopTaxonomyValue(label) || slugifyShopTaxonomyValue(fallbackLabel) || "item";
  const queryValue = compactText(node?.queryValue);
  const categories = normalizeStringList(node?.match?.categories);
  const jewelryTypes = normalizeStringList(node?.match?.jewelryTypes);
  const keywords = normalizeStringList(node?.match?.keywords);
  const children = Array.isArray(node?.children)
    ? node.children.map((child, index) => normalizeShopNode(child, `${label} ${index + 1}`))
    : [];

  const normalized = {
    id,
    label,
  };

  if (queryValue) {
    normalized.queryValue = queryValue;
  }

  if (categories.length > 0 || jewelryTypes.length > 0 || keywords.length > 0) {
    normalized.match = {};
    if (categories.length > 0) normalized.match.categories = categories;
    if (jewelryTypes.length > 0) normalized.match.jewelryTypes = jewelryTypes;
    if (keywords.length > 0) normalized.match.keywords = keywords;
  }

  if (children.length > 0) {
    normalized.children = children;
  }

  return normalized;
}

export function cloneShopCategoryTree() {
  return cloneJson(shopCategoryTree);
}

export function normalizeShopCategoryTree(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return cloneShopCategoryTree();
  }

  const normalized = value.map((node, index) => normalizeShopNode(node, `Category ${index + 1}`));
  const hasAllNode = normalized.some((node) => node.id === "all");

  if (!hasAllNode) {
    return cloneShopCategoryTree();
  }

  return normalized;
}

function resolveArtisanHref(craft, href) {
  const explicitHref = compactText(href);
  if (explicitHref) return explicitHref;

  const normalizedCraft = compactText(craft).toLowerCase();
  if (normalizedCraft.includes("necklace")) return "/shop?category=Jewellery&jewelryType=necklace";
  if (normalizedCraft.includes("bracelet")) return "/shop?category=Jewellery&jewelryType=bracelet";
  if (normalizedCraft.includes("earring")) return "/shop?category=Jewellery&jewelryType=earring";
  if (normalizedCraft.includes("home")) return "/shop?category=Home%20Decor";
  if (normalizedCraft.includes("gift")) return "/shop?category=Gift%20Sets";
  if (normalizedCraft.includes("accessor")) return "/shop?category=Accessories";
  return "/shop?category=Jewellery";
}

function normalizeArtisanEntry(entry, fallbackImage) {
  const name = compactText(entry?.name);
  if (!name) return null;

  return {
    name,
    location: compactText(entry?.location) || "Kenya",
    craft: compactText(entry?.craft) || "Jewellery",
    image: compactText(entry?.image) || fallbackImage || "/media/site/placeholder.svg",
    href: resolveArtisanHref(entry?.craft, entry?.href),
    story: compactText(entry?.story),
  };
}

function withVersion(url, version) {
  const safeUrl = compactText(url);
  const safeVersion = compactText(version);
  if (!safeUrl || !safeVersion) return safeUrl;
  return `${safeUrl}${safeUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(safeVersion)}`;
}

function parseArtisanStories(value, fallbackImage) {
  const raw = compactText(value);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => normalizeArtisanEntry(entry, fallbackImage)).filter(Boolean);
    }
  } catch {
    // fall back to pipe-separated parsing
  }

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, location, craft, image, href, story] = line.split("|").map((part) => part.trim());
      return normalizeArtisanEntry({ name, location, craft, image, href, story }, fallbackImage);
    })
    .filter(Boolean);
}

export function buildFeaturedArtisans(siteImages = {}) {
  const fallbackImage = compactText(siteImages.artisanPortrait) || "/media/site/placeholder.svg";
  const contentVersion = compactText(siteImages.siteContentUpdatedAt);
  const fromSiteContent = parseArtisanStories(siteImages.artisanStories, fallbackImage);

  if (fromSiteContent.length > 0) {
    return fromSiteContent.map((artisan) => ({
      ...artisan,
      image: withVersion(artisan.image, contentVersion),
    }));
  }

  return featuredArtisans
    .map((entry, index) =>
      normalizeArtisanEntry(
        {
          ...entry,
          image: index === 0 ? compactText(entry.image) || fallbackImage : entry.image,
        },
        fallbackImage,
      ),
    )
    .map((artisan) => ({
      ...artisan,
      image: withVersion(artisan.image, contentVersion),
    }))
    .filter(Boolean);
}
