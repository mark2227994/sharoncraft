const fs = require("fs");
const path = require("path");

const SITE_HOST = "www.sharoncraft.co.ke";
const SITE_ORIGIN = `https://${SITE_HOST}`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_KEY = "6e8a6d86-fb64-4afc-a912-0a4c9ee7cb50";
const INDEXNOW_KEY_LOCATION = `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`;
const DEFAULT_SITEMAP = path.resolve(__dirname, "..", "sitemap.xml");

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

  const remoteSitemap = getArgValue("--remote-sitemap");
  if (remoteSitemap) {
    return readUrlsFromRemoteSitemap(remoteSitemap);
  }

  const localSitemap = getArgValue("--sitemap") || DEFAULT_SITEMAP;
  if (!fs.existsSync(localSitemap)) {
    throw new Error(`Sitemap file not found: ${localSitemap}`);
  }

  return readUrlsFromSitemapFile(localSitemap);
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
