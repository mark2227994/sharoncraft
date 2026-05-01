import Head from "next/head";
import { SITE_NAME, SITE_URL } from "../lib/constants";

function normalizeUrl(path = "/") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL.replace(/\/$/, "")}${cleanPath}`;
}

export default function SeoHead({
  title,
  description,
  path = "/",
  image = "/logo-og.png", // Updated default OG image
  type = "website",
  noindex = false,
  structuredData = [],
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = normalizeUrl(path);
  const imageUrl = image.startsWith("http") ? image : normalizeUrl(image);
  const baseStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": ["Organization", "LocalBusiness"],
      name: SITE_NAME,
      description: "Handmade Kenyan jewelry, gifts, accessories, and home decor by local artisans.",
      url: SITE_URL,
      logo: normalizeUrl("/logo-og.png"),
      image: normalizeUrl("/logo-og.png"),
      email: "hello@sharoncraft.co.ke",
      telephone: "+254112222572",
      areaServed: "KE",
      address: {
        "@type": "PostalAddress",
        addressCountry: "KE",
        addressRegion: "Nairobi County",
        addressLocality: "Nairobi",
      },
      sameAs: [
        "https://www.instagram.com/sharoncraft",
        "https://www.facebook.com/sharoncraft",
        "https://www.tiktok.com/@sharoncraft",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["en", "sw"],
        url: "https://wa.me/254112222572",
      },
      priceRange: "KES",
      currenciesAccepted: "KES",
      isBasedNear: {
        "@type": "Place",
        name: "Nairobi, Kenya",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL.replace(/\/$/, "")}/shop?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
  const allStructuredData = [...baseStructuredData, ...structuredData].filter(Boolean);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}

      {/* SEO Icons and Manifest */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
      <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {allStructuredData.map((item, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item),
          }}
        />
      ))}
    </Head>
  );
}
