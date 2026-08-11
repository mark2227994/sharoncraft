import { fetchPublishedBlogPosts } from "../lib/blog";
import { CATEGORIES, buildShopHref } from "../lib/categories";
import { filterPublishedProducts } from "../lib/products";
import { siteConfig } from "../lib/seo";
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
  const today = new Date().toISOString().slice(0, 10);
  const products = filterPublishedProducts(await readProducts()).filter((product) => product?.is_visible !== false);
  const blogPosts = await fetchPublishedBlogPosts();

  const visibleCategories = new Set(products.map((product) => product.category).filter(Boolean));
  const visibleSubcategories = new Set(
    products
      .filter((product) => product.category && product.subcategory)
      .map((product) => `${product.category}::${product.subcategory}`),
  );

  const staticUrls = [
    buildUrl(`${siteConfig.url}/`, today, "weekly", "1.0"),
    buildUrl(`${siteConfig.url}/shop`, today, "daily", "0.9"),
    buildUrl(`${siteConfig.url}/blog`, today, "daily", "0.8"),
    buildUrl(`${siteConfig.url}/about`, today, "monthly", "0.7"),
    buildUrl(`${siteConfig.url}/artisans`, today, "monthly", "0.7"),
    buildUrl(`${siteConfig.url}/custom-order`, today, "weekly", "0.7"),
    buildUrl(`${siteConfig.url}/faq`, today, "monthly", "0.5"),
    buildUrl(`${siteConfig.url}/shipping`, today, "monthly", "0.5"),
    buildUrl(`${siteConfig.url}/reviews`, today, "monthly", "0.5"),
  ];

  const categoryUrls = CATEGORIES.flatMap((category) => [
    ...(visibleCategories.has(category.name)
      ? [buildUrl(`${siteConfig.url}${buildShopHref(category.name)}`, today, "weekly", "0.8")]
      : []),
    ...category.subcategories
      .filter((subcategory) => visibleSubcategories.has(`${category.name}::${subcategory.name}`))
      .map((subcategory) =>
        buildUrl(`${siteConfig.url}${buildShopHref(category.name, subcategory.name)}`, today, "weekly", "0.7"),
      ),
  ]);

  const productUrls = products.map((product) =>
    buildUrl(
      `${siteConfig.url}/product/${product.slug}`,
      String(product.updated_at || product.created_at || today).slice(0, 10),
      "weekly",
      "0.8",
    ),
  );

  const blogUrls = blogPosts.map((post) =>
    buildUrl(
      `${siteConfig.url}/blog/${post.slug}`,
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
