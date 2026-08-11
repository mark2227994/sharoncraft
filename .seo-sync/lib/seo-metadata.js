import { buildDefaultMetadata, buildOrganizationSchema, buildProductSchema, siteConfig } from "./seo";

export const SITE_NAME = siteConfig.name;
export const SITE_URL = siteConfig.url;

export function getProductMetadata(product) {
  if (!product) return null;

  const price = Number(product.price || 0).toLocaleString("en-KE");
  const artisan = product.artisan || "our artisans";
  const description =
    `${product.name} handmade by ${artisan} in Nairobi, Kenya. KES ${price}. ` +
    `${product.fulfillmentType === "ready_to_ship" ? "Ready to ship." : "Made to order in 5-7 days."}`;

  return {
    ...buildDefaultMetadata({
      title: product.name,
      description,
      path: `/product/${product.slug}`,
      image: product.images?.[0]?.src || product.images?.[0] || "/logo-og.png",
      type: "product",
    }),
    ogTitle: product.name,
    ogDescription: product.description || description,
    ogImage: product.images?.[0]?.src || product.images?.[0] || "/logo-og.png",
    ogType: "product",
  };
}

export function getPageMetadata(page) {
  const pages = {
    "/": buildDefaultMetadata({
      title: "Handmade Kenyan Jewelry — Nairobi",
      description:
        "Shop authentic handmade Kenyan jewelry by Nairobi artisans. Maasai beaded earrings, necklaces, bracelets, and accessories. Free delivery in Nairobi.",
      path: "/",
    }),
    "/shop": buildDefaultMetadata({
      title: "Shop Handmade Jewelry Kenya",
      description:
        "Browse handmade Kenyan jewelry and accessories. Earrings from KES 800, necklaces, bracelets, beaded sandals, and gift-ready artisan pieces.",
      path: "/shop",
    }),
    "/about": buildDefaultMetadata({
      title: "About SharonCraft — Founded by Kelvin Mark",
      description:
        "SharonCraft was founded in 2024 by Kelvin Mark to give Kenyan artisans and handmade craft a world-class stage.",
      path: "/about",
    }),
    "/faq": buildDefaultMetadata({
      title: "SharonCraft FAQ",
      description: "Answers about shipping, custom orders, care, delivery timelines, and handmade SharonCraft pieces.",
      path: "/faq",
    }),
    "/contact": buildDefaultMetadata({
      title: "Contact SharonCraft",
      description: "Reach SharonCraft through WhatsApp or our contact page for orders, product questions, and support.",
      path: "/contact",
    }),
    "/privacy": buildDefaultMetadata({
      title: "Privacy Policy",
      description: "Read how SharonCraft handles customer information and website data responsibly.",
      path: "/privacy",
    }),
    "/terms": buildDefaultMetadata({
      title: "Terms & Conditions",
      description: "Read the SharonCraft terms and conditions for orders, payments, shipping, and returns.",
      path: "/terms",
    }),
    "/shipping": buildDefaultMetadata({
      title: "Shipping & Returns Kenya",
      description: "Free delivery in Nairobi, Kenya-wide shipping, and return guidance for SharonCraft orders.",
      path: "/shipping",
    }),
  };

  return pages[page] || pages["/"];
}

export function generateLocalBusinessSchema() {
  return buildOrganizationSchema();
}

export { buildProductSchema as generateProductSchema };
