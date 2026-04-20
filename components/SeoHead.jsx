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
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = normalizeUrl(path);
  const imageUrl = image.startsWith("http") ? image : normalizeUrl(image);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}

      {/* SEO Icons and Manifest */}
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
      <link rel="icon" href="/favicon-96x96.png" sizes="96x96" />
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

      {/* JSON-LD Organization + LocalBusiness schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["Organization", "LocalBusiness"],
            "name": "SharonCraft",
            "description": "Handmade Kenyan jewelry, gifts, and home decor by local artisans",
            "url": "https://www.sharoncraft.co.ke",
            "logo": "https://www.sharoncraft.co.ke/logo-og.png",
            "image": "https://www.sharoncraft.co.ke/logo-og.png",
            "email": "support@sharoncraft.co.ke",
            "telephone": "+254112222572",
            "areaServed": "KE",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "KE",
              "addressRegion": "Kenya",
              "addressLocality": "Nairobi"
            },
            "sameAs": [
              "https://www.instagram.com/sharoncraft",
              "https://www.facebook.com/sharoncraft",
              "https://www.tiktok.com/@sharoncraft"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Service",
              "availableLanguageId": "en",
              "contactOption": "TollFree",
              "url": "https://wa.me/254112222572"
            },
            "priceRange": "$",
            "isBasedNear": {
              "@type": "Place",
              "name": "Nairobi, Kenya"
            }
          })
        }}
      />
    </Head>
  );
}