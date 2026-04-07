const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const SITE_HOST = "www.sharoncraft.co.ke";
const SITE_ORIGIN = `https://${SITE_HOST}`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_KEY = "6e8a6d86-fb64-4afc-a912-0a4c9ee7cb50";
const INDEXNOW_KEY_LOCATION = `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`;
const DEFAULT_SITEMAP = path.resolve(__dirname, "..", "sitemap.xml");
const ROOT_DIR = path.resolve(__dirname, "..");
const PRODUCT_DATA_PATH = "assets/js/data.js";
const SHARED_FULL_RESUBMIT_PATHS = new Set([
  "assets/js/app.js",
  "assets/css/style.css",
  "assets/css/mobile-performance.css",
  "scripts/generate-sitemap.js",
  "sitemap.xml"
]);
const HOMEPAGE_TRIGGER_PATHS = new Set([
  "index.html",
  "assets/js/home.js",
  "assets/css/home-hero-refine.css"
]);
const SHOP_TRIGGER_PATHS = new Set([
  "shop.html",
  "assets/js/shop.js",
  "assets/css/shop-filters.css",
  "assets/css/mobile-product-grid-comfort.css"
]);
const PRODUCT_TRIGGER_PATHS = new Set([
  "product.html",
  "assets/js/product.js",
  PRODUCT_DATA_PATH,
  "supabase/supabase-catalog.js",
  "supabase/supabase-config.js",
  "assets/js/supabase-data-sync.js"
]);
const PUBLIC_ROOT_PAGES = new Set([
  "index.html",
  "about.html",
  "contact.html",
  "faq.html",
  "journal.html",
  "kenyan-artifacts.html",
  "beaded-earrings-kenya.html",
  "maasai-jewelry-kenya.html",
  "handmade-kenyan-gifts.html",
  "african-home-decor-nairobi.html",
  "bridal-bead-sets-kenya.html",
  "gift-sets-kenya.html",
  "maasai-inspired-bracelets-kenya.html",
  "privacy.html",
  "returns.html",
  "terms.html"
]);

function getArgValue(flag) {
  const args = process.argv.slice(2);
  const index = args.indexOf(flag);
  if (index === -1) {
    return "";
  }
  return String(args[index + 1] || "").trim();
}

function hasFlag(flag) {
  return process.argv.slice(2).includes(flag);
}

function parseUrlsFromSitemap(xml) {
  const matches = Array.from(String(xml || "").matchAll(/<loc>([^<]+)<\/loc>/g));
  return Array.from(
    new Set(
      matches
        .map((match) => String(match[1] || "").trim())
        .filter(Boolean)
    )
  );
}

function readUrlsFromSitemapFile(filePath) {
  const xml = fs.readFileSync(filePath, "utf8");
  return parseUrlsFromSitemap(xml);
}

function urlsFromLocalSitemap() {
  if (!fs.existsSync(DEFAULT_SITEMAP)) {
    throw new Error(`Sitemap file not found: ${DEFAULT_SITEMAP}`);
  }

  return readUrlsFromSitemapFile(DEFAULT_SITEMAP);
}

function toSiteUrl(relativePath) {
  const clean = String(relativePath || "").trim().replace(/\\/g, "/").replace(/^\/+/, "");
  return clean === "index.html" || clean === "" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${clean}`;
}

function readGitChangedFiles(fromRef, toRef) {
  const args = ["diff", "--name-only"];

  if (fromRef && toRef) {
    args.push(`${fromRef}..${toRef}`);
  } else if (fromRef) {
    args.push(`${fromRef}..HEAD`);
  }

  const output = execFileSync("git", args, {
    cwd: ROOT_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  return output
    .split(/\r?\n/)
    .map((line) => String(line || "").trim().replace(/\\/g, "/"))
    .filter(Boolean);
}

function collectProductUrlsFromSitemap(urls) {
  return urls.filter((url) => /\/product\.html\?id=/i.test(url));
}

function buildChangedUrlsFromGit() {
  const explicitFrom = getArgValue("--from");
  const explicitTo = getArgValue("--to") || "HEAD";
  const gitRef = getArgValue("--git-ref");
  const useChangedMode = hasFlag("--changed") || !!explicitFrom || !!gitRef;

  if (!useChangedMode) {
    return [];
  }

  const fromRef = explicitFrom || gitRef || "HEAD~1";
  const toRef = explicitTo;
  const changedFiles = readGitChangedFiles(fromRef, toRef);

  if (!changedFiles.length) {
    return [];
  }

  const sitemapUrls = urlsFromLocalSitemap();
  const urls = new Set();
  let fullResubmit = false;
  let includeProducts = false;

  changedFiles.forEach((filePath) => {
    if (SHARED_FULL_RESUBMIT_PATHS.has(filePath)) {
      fullResubmit = true;
      return;
    }

    if (HOMEPAGE_TRIGGER_PATHS.has(filePath)) {
      urls.add(`${SITE_ORIGIN}/`);
      return;
    }

    if (SHOP_TRIGGER_PATHS.has(filePath)) {
      urls.add(toSiteUrl("shop.html"));
      return;
    }

    if (PRODUCT_TRIGGER_PATHS.has(filePath)) {
      includeProducts = true;
      urls.add(`${SITE_ORIGIN}/`);
      urls.add(toSiteUrl("shop.html"));
      return;
    }

    if (PUBLIC_ROOT_PAGES.has(filePath)) {
      urls.add(toSiteUrl(filePath));
      return;
    }

    if (filePath.startsWith("articles/") && filePath.endsWith(".html")) {
      urls.add(toSiteUrl(filePath));
    }
  });

  if (fullResubmit) {
    return sitemapUrls;
  }

  if (includeProducts) {
    collectProductUrlsFromSitemap(sitemapUrls).forEach((url) => urls.add(url));
  }

  return Array.from(urls);
}

async function readUrlsFromRemoteSitemap(sitemapUrl) {
  const response = await fetch(sitemapUrl, {
    headers: {
      "user-agent": "SharonCraftIndexNowNotifier/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Could not fetch remote sitemap: ${response.status} ${response.statusText}`);
  }

  return parseUrlsFromSitemap(await response.text());
}

async function buildUrlList() {
  const singleUrl = getArgValue("--url");
  if (singleUrl) {
    return [singleUrl];
  }

  const changedUrls = buildChangedUrlsFromGit();
  if (changedUrls.length) {
    return changedUrls;
  }

  const remoteSitemap = getArgValue("--remote-sitemap");
  if (remoteSitemap) {
    return readUrlsFromRemoteSitemap(remoteSitemap);
  }

  const localSitemap = getArgValue("--sitemap");
  if (localSitemap) {
    if (!fs.existsSync(localSitemap)) {
      throw new Error(`Sitemap file not found: ${localSitemap}`);
    }
    return readUrlsFromSitemapFile(localSitemap);
  }

  return urlsFromLocalSitemap();
}

async function submitIndexNow(urls) {
  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
      "user-agent": "SharonCraftIndexNowNotifier/1.0"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`IndexNow request failed: ${response.status} ${response.statusText} ${body}`.trim());
  }

  return payload;
}

async function main() {
  const urls = await buildUrlList();
  const limit = Number(getArgValue("--limit")) || 0;
  const finalUrls = (limit > 0 ? urls.slice(0, limit) : urls).filter((url) => url.startsWith(SITE_ORIGIN));

  if (!finalUrls.length) {
    if (hasFlag("--changed") || getArgValue("--from") || getArgValue("--git-ref")) {
      console.log("No changed public SharonCraft URLs were found for IndexNow submission.");
      return;
    }
    throw new Error("No valid SharonCraft URLs were found to submit to IndexNow.");
  }

  if (hasFlag("--dry-run")) {
    console.log(`IndexNow dry run ready.`);
    console.log(`Host: ${SITE_HOST}`);
    console.log(`Key location: ${INDEXNOW_KEY_LOCATION}`);
    console.log(`URLs queued: ${finalUrls.length}`);
    finalUrls.slice(0, 10).forEach((url) => console.log(`- ${url}`));
    if (finalUrls.length > 10) {
      console.log(`...and ${finalUrls.length - 10} more URLs`);
    }
    return;
  }

  const payload = await submitIndexNow(finalUrls);
  console.log(`IndexNow notified successfully for ${payload.urlList.length} URL(s).`);
  console.log(`Key location: ${payload.keyLocation}`);
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});
