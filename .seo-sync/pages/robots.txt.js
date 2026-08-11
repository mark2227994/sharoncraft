import { siteConfig } from "../lib/seo";

export async function getServerSideProps({ res }) {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Allow: /_next/static/",
    "Allow: /api/openapi.json",
    "Allow: /api/search",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /admin-v2",
    "Disallow: /admin-v2/",
    "Disallow: /api/",
    "Disallow: /checkout",
    "Disallow: /order-confirmation",
    "Disallow: /track-order",
    "Disallow: /cart",
    "Disallow: /wishlist",
    "Disallow: /login",
    "Disallow: /register",
    "Disallow: /account",
    "Disallow: /account/",
    "Disallow: /*.html",
    "",
    "User-agent: GPTBot",
    "Allow: /",
    "Allow: /api/openapi.json",
    "Allow: /api/search",
    "Disallow: /admin/",
    "Disallow: /admin-v2/",
    "Disallow: /api/",
    "Disallow: /checkout",
    "",
    "User-agent: ClaudeBot",
    "Allow: /",
    "Allow: /api/openapi.json",
    "Allow: /api/search",
    "Disallow: /admin/",
    "Disallow: /admin-v2/",
    "Disallow: /api/",
    "Disallow: /checkout",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "Allow: /api/openapi.json",
    "Allow: /api/search",
    "Disallow: /admin/",
    "Disallow: /admin-v2/",
    "Disallow: /checkout",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "Allow: /api/openapi.json",
    "Allow: /api/search",
    "Disallow: /admin/",
    "Disallow: /admin-v2/",
    "Disallow: /checkout",
    "",
    `Host: ${siteConfig.url}`,
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
  ].join("\n");

  res.setHeader("Content-Type", "text/plain");
  res.write(body);
  res.end();

  return { props: {} };
}

export default function RobotsTxt() {
  return null;
}
