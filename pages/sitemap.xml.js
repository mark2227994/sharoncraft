import { SITE_URL } from "../lib/constants";
import { filterPublishedProducts } from "../lib/products";
import { readProducts } from "../lib/store";

function buildUrl(loc, lastmod, changefreq, priority) {
  return [
    "<url>",
    `<loc>${loc}</loc>`,
    lastmod ? `<lastmod>${lastmod}</lastmod>` : "",
    changefreq ? `<changefreq>${changefreq}</changefreq>` : "",
    priority ? `<priority>${priority}</priority>` : "",
    "</url>",
  ]
    .filter(Boolean)
    .join("");
}

export async function getServerSideProps({ res }) {
  const products = filterPublishedProducts(await readProducts());
  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = [
    buildUrl(`${SITE_URL}/`, today, "weekly", "1.0"),
    buildUrl(`${SITE_URL}/about`, today, "monthly", "0.7"),
    buildUrl(`${SITE_URL}/artisans`, today, "monthly", "0.7"),
    buildUrl(`${SITE_URL}/shop`, today, "daily", "0.9"),
    buildUrl(`${SITE_URL}/journal`, today, "weekly", "0.7"),
    buildUrl(`${SITE_URL}/contact`, today, "monthly", "0.6"),
    buildUrl(`${SITE_URL}/faq`, today, "monthly", "0.6"),
    buildUrl(`${SITE_URL}/shipping`, today, "monthly", "0.5"),
    buildUrl(`${SITE_URL}/privacy`, today, "yearly", "0.3"),
    buildUrl(`${SITE_URL}/terms`, today, "yearly", "0.3"),
    buildUrl(`${SITE_URL}/track-order`, today, "monthly", "0.4"),
    buildUrl(`${SITE_URL}/wishlist`, today, "weekly", "0.5"),
    buildUrl(`${SITE_URL}/cart`, today, "weekly", "0.4"),
    buildUrl(`${SITE_URL}/checkout`, today, "weekly", "0.4"),
    buildUrl(`${SITE_URL}/custom-order`, today, "weekly", "0.7"),
  ];

  const productUrls = products.map((product) =>
    buildUrl(`${SITE_URL}/product/${product.slug}`, today, "weekly", "0.8"),
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticUrls,
    ...productUrls,
    "</urlset>",
  ].join("");

  res.setHeader("Content-Type", "application/xml");
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function SitemapXml() {
  return null;
}
