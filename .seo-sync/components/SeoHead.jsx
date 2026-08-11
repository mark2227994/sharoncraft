import Head from "next/head";
import { buildDefaultMetadata, buildOrganizationSchema, buildWebsiteSchema } from "../lib/seo";

export default function SeoHead({
  title,
  description,
  keywords,
  path = "/",
  image = "/logo-og.png",
  type = "website",
  noindex = false,
  structuredData = [],
  articleMeta = {},
}) {
  const metadata = buildDefaultMetadata({
    title,
    description,
    keywords,
    path,
    image,
    type,
    noindex,
  });

  const allStructuredData = [buildOrganizationSchema(), buildWebsiteSchema(), ...structuredData]
    .flat()
    .filter(Boolean);
  const normalizedArticleMeta = Object.entries(articleMeta || {}).filter(([, value]) => value);

  return (
    <Head>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      {metadata.keywords ? <meta name="keywords" content={metadata.keywords} /> : null}
      <link rel="canonical" href={metadata.canonical} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}

      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
      <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.webmanifest" />

      <meta property="og:site_name" content="SharonCraft" />
      <meta property="og:type" content={metadata.type} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:url" content={metadata.canonical} />
      <meta property="og:image" content={metadata.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_KE" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={metadata.image} />
      <meta name="twitter:site" content="@sharoncraft" />

      {normalizedArticleMeta.map(([property, value]) => (
        <meta key={property} property={property} content={String(value)} />
      ))}

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
