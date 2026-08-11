import { buildShopHref } from "./categories";
import { SITE_URL } from "./constants";

const SITE_ORIGIN = String(SITE_URL || "https://www.sharoncraft.co.ke").replace(/\/+$/, "");

function normalizeUrl(value) {
  const nextValue = String(value || "").trim();
  if (!nextValue) return "";
  return nextValue.startsWith("http")
    ? nextValue
    : `${SITE_ORIGIN}${nextValue.startsWith("/") ? nextValue : `/${nextValue}`}`;
}

function dedupeUrls(urls) {
  return Array.from(new Set(urls.map(normalizeUrl).filter(Boolean)));
}

export function getProductIndexNowUrls(product) {
  if (!product) return [];

  const urls = ["/", "/shop"];

  if (product.category) {
    urls.push(buildShopHref(product.category));
  }

  if (product.category && product.subcategory) {
    urls.push(buildShopHref(product.category, product.subcategory));
  }

  if (product.slug) {
    urls.push(`/product/${product.slug}`);
  }

  return dedupeUrls(urls);
}

export function getBlogIndexNowUrls(post) {
  if (!post) return [];

  const urls = ["/", "/blog"];

  if (post.slug) {
    urls.push(`/blog/${post.slug}`);
  }

  return dedupeUrls(urls);
}

export async function notifyIndexNow(urls) {
  const urlList = dedupeUrls(Array.isArray(urls) ? urls : [urls]);
  if (urlList.length === 0) return;

  try {
    const response = await fetch("/api/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({ urlList }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.warn("IndexNow request failed", detail);
    }
  } catch (error) {
    console.warn("IndexNow request failed", error);
  }
}

export function notifyIndexNowForProduct(product) {
  return notifyIndexNow(getProductIndexNowUrls(product));
}

export function notifyIndexNowForBlogPost(post) {
  return notifyIndexNow(getBlogIndexNowUrls(post));
}
