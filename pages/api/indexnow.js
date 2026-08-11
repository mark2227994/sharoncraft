import { SITE_URL } from "../../lib/constants";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const DEFAULT_INDEXNOW_KEY = "6e8a6d86-fb64-4afc-a912-0a4c9ee7cb50";
const SITE_ORIGIN = String(SITE_URL || "https://www.sharoncraft.co.ke").replace(/\/+$/, "");
const HOST = new URL(SITE_ORIGIN).host;

function normalizeUrls(input) {
  const list = Array.isArray(input) ? input : [input];
  return list
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .map((value) =>
      value.startsWith("http")
        ? value
        : `${SITE_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`
    );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const urlList = normalizeUrls(body.urlList || body.url);

    if (urlList.length === 0) {
      return res.status(400).json({ error: "Provide url or urlList" });
    }

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `${SITE_ORIGIN}/${key}.txt`,
        urlList,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(response.status).json({
        error: "IndexNow request failed",
        detail,
      });
    }

    return res.status(200).json({
      success: true,
      host: HOST,
      keyLocation: `${SITE_ORIGIN}/${key}.txt`,
      urlList,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Unable to submit IndexNow request",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
