import { isAuthorizedRequest } from "../../../lib/admin-auth";

function resolveLiveSiteBaseUrl(req) {
  const fromEnv = (process.env.NEXT_PUBLIC_LIVE_SITE_URL || "").trim().replace(/\/+$/, "");
  if (fromEnv) {
    return fromEnv;
  }
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "")
    .split(",")[0]
    .trim();
  if (host) {
    return `${proto}://${host}`;
  }
  return "https://www.sharoncraft.co.ke";
}

/**
 * Fetches the current live website's site content.
 * This allows admins to see what's actually published and pull it back for editing.
 */
export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    res.setHeader("Cache-Control", "no-store");

    const LIVE_URL = resolveLiveSiteBaseUrl(req);
    const siteImagesPath = "site-content/site-images.json";

    // Try Supabase first (production source of truth)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const bucket = "product-images";

        const response = await fetch(
          `${supabaseUrl}/storage/v1/object/public/${bucket}/${siteImagesPath}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          return res.status(200).json({ liveContent: data, source: "supabase" });
        }
      } catch (err) {
        console.log("Supabase fetch failed, falling back to website fetch:", err.message);
      }
    }

    // Fallback: fetch from live website
    const liveResponse = await fetch(`${LIVE_URL}/site-content/site-images.json`, {
      cache: "no-store",
    });

    if (!liveResponse.ok) {
      return res.status(404).json({
        error: "Could not fetch live site content",
        details: `Status ${liveResponse.status} from ${LIVE_URL}`,
      });
    }

    const liveContent = await liveResponse.json();
    return res.status(200).json({ liveContent, source: "website" });
  } catch (error) {
    console.error("Error fetching live site images:", error);
    return res.status(500).json({
      error: "Failed to fetch live site content",
      details: error.message,
    });
  }
}
