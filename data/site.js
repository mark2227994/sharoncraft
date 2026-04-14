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
  { href: "/shop", label: "Shop" },
  { href: "/shop#collections", label: "Collections" },
  { href: "/#artisan-story", label: "Artisans" },
  { href: "/#about-gallery", label: "About" },
];

export const mobileNavLinks = [
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
