import { SITE_URL } from "../lib/constants";

export async function getServerSideProps({ res }) {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /api/admin",
    "Disallow: /api/admin/",
    "",
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /api/admin",
    "Disallow: /api/admin/",
    `Sitemap: ${SITE_URL.replace(/\/$/, "")}/sitemap.xml`,
  ].join("\n");

  res.setHeader("Content-Type", "text/plain");
  res.write(body);
  res.end();

  return { props: {} };
}

export default function RobotsTxt() {
  return null;
}
