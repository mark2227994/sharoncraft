import { filterPublishedProducts } from "../lib/products";
import { fetchPublishedBlogPosts } from "../lib/blog";
import { CATEGORIES, buildShopHref } from "../lib/categories";
import { readProducts } from "../lib/store";

const SITE_URL = "https://www.sharoncraft.co.ke";

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
  const blogPosts = await fetchPublishedBlogPosts();
  const today = new Date().toISOString().slice(0, 10);
  const visibleCategories = new Set(products.map((product) => product.category).filter(Boolean));
  const visibleSubcategories = new Set(
    products
      .filter((product) => product.category && product.subcategory)
      .map((product) => `${product.category}::${product.subcategory}`),
  );

  const staticUrls = [
    buildUrl(`${SITE_URL}/`, today, "weekly", "1.0"),
    buildUrl(`${SITE_URL}/shop`, today, "daily", "0.9"),
    buildUrl(`${SITE_URL}/blog`, today, "weekly", "0.8"),
    buildUrl(`${SITE_URL}/about`, today, "monthly", "0.7"),
    buildUrl(`${SITE_URL}/artisans`, today, "monthly", "0.7"),
    buildUrl(`${SITE_URL}/custom-order`, today, "weekly", "0.7"),
    buildUrl(`${SITE_URL}/faq`, today, "monthly", "0.5"),
    buildUrl(`${SITE_URL}/shipping`, today, "monthly", "0.5"),
    buildUrl(`${SITE_URL}/reviews`, today, "monthly", "0.5"),
  ];

  const categoryUrls = CATEGORIES.flatMap((category) => [
    ...(visibleCategories.has(category.name)
      ? [buildUrl(`${SITE_URL}${buildShopHref(category.name)}`, today, "weekly", "0.8")]
      : []),
    ...category.subcategories
      .filter((subcategory) => visibleSubcategories.has(`${category.name}::${subcategory.name}`))
      .map((subcategory) =>
        buildUrl(`${SITE_URL}${buildShopHref(category.name, subcategory.name)}`, today, "weekly", "0.7"),
      ),
  ]);

  const productUrls = products.map((product) =>
    buildUrl(`${SITE_URL}/product/${product.slug}`, today, "weekly", "0.8"),
  );

  const blogUrls = blogPosts.map((post) =>
    buildUrl(
      `${SITE_URL}/blog/${post.slug}`,
      String(post.updated_at || post.published_at || today).slice(0, 10),
      "monthly",
      "0.7",
    ),
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticUrls,
    ...categoryUrls,
    ...productUrls,
    ...blogUrls,
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
