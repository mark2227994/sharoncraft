import { SITE_NAME, SITE_URL } from "./constants";

const DEFAULT_OG_IMAGE = "/logo-og.png";
const DEFAULT_DESCRIPTION =
  "Shop authentic handmade Kenyan jewelry by Nairobi artisans. Maasai beaded earrings, necklaces, bracelets, accessories, gifts, and custom pieces crafted with care.";

export const siteConfig = {
  name: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  url: SITE_URL.replace(/\/$/, ""),
  founder: "Kelvin Mark",
  leadDesigner: "Sharon Ruth",
  location: "Nairobi, Kenya",
  country: "KE",
  currency: "KES",
  instagram: "https://www.instagram.com/sharoncraft.ke",
  tiktok: "https://www.tiktok.com/@sharoncraft",
  facebook: "https://www.facebook.com/sharoncraft",
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_CONTACT_PHONE || "254112222572",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@sharoncraft.co.ke",
  keywords: [
    "handmade jewelry Nairobi",
    "Maasai beaded jewelry Kenya",
    "Kenyan artisan jewelry",
    "African jewelry Kenya",
    "beaded earrings Kenya",
    "custom jewelry Nairobi",
    "handmade accessories Kenya",
    "Maasai bracelets",
    "beaded sandals Kenya",
    "SharonCraft",
    "Kelvin Mark",
    "Sharon Ruth",
  ],
};

export function buildCanonicalUrl(path = "/") {
  const rawPath = String(path || "/").trim();
  const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  return `${siteConfig.url}${cleanPath}`.replace(/(?<!:)\/{2,}/g, "/");
}

export function toAbsoluteUrl(value = DEFAULT_OG_IMAGE) {
  const rawValue = String(value || "").trim();
  if (!rawValue) return buildCanonicalUrl(DEFAULT_OG_IMAGE);
  if (/^https?:\/\//i.test(rawValue)) return rawValue;
  return buildCanonicalUrl(rawValue.startsWith("/") ? rawValue : `/${rawValue}`);
}

export function buildDefaultMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
  keywords,
} = {}) {
  const fullTitle = title
    ? title.includes(siteConfig.name)
      ? title
      : `${title} | ${siteConfig.name}`
    : `${siteConfig.name} | Handmade Kenyan Jewelry`;

  return {
    title: fullTitle,
    description,
    canonical: buildCanonicalUrl(path),
    image: toAbsoluteUrl(image),
    type,
    noindex,
    keywords:
      Array.isArray(keywords) ? keywords.filter(Boolean).join(", ") : String(keywords || siteConfig.keywords.join(", ")),
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    image: `${siteConfig.url}/logo-og.png`,
    description:
      "SharonCraft is a Nairobi-based handmade jewelry and craft brand founded by Kelvin Mark in 2024 and led creatively by Sharon Ruth.",
    founder: {
      "@type": "Person",
      name: siteConfig.founder,
      jobTitle: "Founder and CEO",
    },
    employee: {
      "@type": "Person",
      name: siteConfig.leadDesigner,
      jobTitle: "Lead Designer",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nairobi",
      addressCountry: siteConfig.country,
    },
    areaServed: siteConfig.country,
    sameAs: [siteConfig.instagram, siteConfig.tiktok, siteConfig.facebook],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: `+${String(siteConfig.whatsappNumber).replace(/\D/g, "")}`,
      email: siteConfig.contactEmail,
      availableLanguage: ["en", "sw"],
    },
    priceRange: "KES 650 - KES 15,000",
    currenciesAccepted: siteConfig.currency,
    paymentAccepted: "M-Pesa, Cash, Bank Transfer",
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbSchema(items = []) {
  const listItems = items
    .filter((item) => item?.name && item?.item)
    .map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  };
}

export function buildProductSchema(product = {}) {
  const rawImages = Array.isArray(product.images)
    ? product.images
    : product.images
      ? [product.images]
      : [];
  const images = rawImages.map((image) => toAbsoluteUrl(image?.src || image?.url || image)).filter(Boolean);
  const slug = String(product.slug || "").trim();
  const price = Number(product.price || 0);
  const stock = Number(product.stock_quantity ?? product.stock ?? 0);
  const productType = String(product.product_type || product.fulfillmentType || "ready_to_ship").trim();
  const inStock = productType === "ready_to_ship" ? stock > 0 : true;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    manufacturer: {
      "@type": "Organization",
      name: siteConfig.name,
      founder: {
        "@type": "Person",
        name: siteConfig.founder,
      },
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: siteConfig.currency,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: slug ? `${siteConfig.url}/product/${slug}` : siteConfig.url,
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
    additionalProperty: [
      product.subcategory
        ? {
            "@type": "PropertyValue",
            name: "Subcategory",
            value: product.subcategory,
          }
        : null,
      product.artisan
        ? {
            "@type": "PropertyValue",
            name: "Artisan",
            value: product.artisan,
          }
        : null,
    ].filter(Boolean),
  };
}

export function buildArticleSchema(post = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image_url ? toAbsoluteUrl(post.cover_image_url) : undefined,
    author: {
      "@type": "Person",
      name: post.author || siteConfig.founder,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    mainEntityOfPage: post.slug ? `${siteConfig.url}/blog/${post.slug}` : `${siteConfig.url}/blog`,
  };
}
