import Head from "next/head";
import { SITE_NAME, SITE_URL } from "../lib/constants";
import { CONTACT_EMAIL, CONTACT_PHONE_E164, CONTACT_WHATSAPP } from "../lib/contact";

function normalizeUrl(path = "/") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL.replace(/\/$/, "")}${cleanPath}`;
}

export default function SeoHead({
  title,
  description,
  keywords,
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
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <link rel="canonical" href={canonical} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}

      {/* SEO Icons and Manifest */}
      <link rel="icon" href="/favicon.ico?v=2" />
      <link rel="icon" href="/favicon-32x32.png?v=2" sizes="32x32" type="image/png" />
      <link rel="icon" href="/favicon-16x16.png?v=2" sizes="16x16" type="image/png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
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
            "url": SITE_URL,
            "logo": `${SITE_URL}/logo-og.png`,
            "image": `${SITE_URL}/logo-og.png`,
            "email": CONTACT_EMAIL,
            "telephone": CONTACT_PHONE_E164,
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
              "email": CONTACT_EMAIL,
              "telephone": CONTACT_PHONE_E164,
              "url": `https://wa.me/${CONTACT_WHATSAPP}`
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
