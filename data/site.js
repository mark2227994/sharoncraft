export const categoryOptions = [
  "All",
  "Jewellery",
  "Home Decor",
  "Gift Sets",
  "Accessories",
  "Bridal & Occasion",
];

export const collectionCardLayout = [
  { title: "Jewellery", href: "/shop?category=Jewellery", imageKey: "collectionJewellery" },
  { title: "Home Objects", href: "/shop?category=Home%20Decor", imageKey: "collectionHome" },
  { title: "Gifted Carry", href: "/shop?category=Accessories", imageKey: "collectionAccessories" },
];

export function buildCollectionCards(siteImages) {
  return collectionCardLayout.map((row) => ({
    title: row.title,
    href: row.href,
    image: siteImages[row.imageKey] || "",
  }));
}

export const trustItems = [
  { icon: "leaf", label: "Ethically sourced" },
  { icon: "package", label: "Shipped from Nairobi" },
  { icon: "mpesa", label: "M-Pesa & card accepted" },
];

export const primaryNavLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop#collections", label: "Collections" },
  { href: "/#artisan-story", label: "Artisans" },
  { href: "/#about-gallery", label: "About" },
];

export const mobileNavLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop#collections", label: "Collections" },
  { href: "/#artisan-story", label: "Artisans" },
  { href: "/#about-gallery", label: "About" },
  { href: "/cart", label: "Cart" },
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

function compactText(value) {
  return String(value || "").trim();
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
  const fromSiteContent = parseArtisanStories(siteImages.artisanStories, fallbackImage);

  if (fromSiteContent.length > 0) {
    return fromSiteContent;
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
    .filter(Boolean);
}
