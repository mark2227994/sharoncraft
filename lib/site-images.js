/**
 * site-images.js - site content data (images + text) backed by Supabase.
 * Uses Supabase table/storage first with a local file fallback for development.
 */
import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://vonzscriztdcdhobulhy.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

if (
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "production" &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.SUPABASE_ANON_KEY
) {
  console.warn(
    "[site-images] Warning: Supabase key missing in production. Set SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_ANON_KEY."
  );
}

const SITE_CONTENT_KEY = "site_content";
const STORAGE_BUCKET = "product-images";
const STORAGE_SITE_CONTENT_PATH = "site-content/site-images.json";
const BLOB_SITE_CONTENT_PATH = "site-content/site-images.json";
const localFile = path.join(process.cwd(), "data", "site-images.json");

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

function hasServiceRoleKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function writeLocalSiteImagesFile(content) {
  await fs.writeFile(localFile, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

async function readLocalSiteImages() {
  try {
    const raw = await fs.readFile(localFile, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

async function readStorageSiteImages() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(STORAGE_SITE_CONTENT_PATH);
    if (error || !data) return null;

    const payload = JSON.parse(await data.text());
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

async function writeStorageSiteImages(content) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_SITE_CONTENT_PATH, Buffer.from(JSON.stringify(content, null, 2)), {
        upsert: true,
        contentType: "application/json",
      });

    return !error;
  } catch {
    return false;
  }
}

async function readTableSiteImages() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SITE_CONTENT_KEY)
      .maybeSingle();

    if (!error && data?.value && typeof data.value === "object") {
      return data.value;
    }
  } catch {
    return null;
  }

  return null;
}

function getContentTimestamp(value) {
  const stamp = Date.parse(String(value?.siteContentUpdatedAt || ""));
  return Number.isFinite(stamp) ? stamp : 0;
}

function pickNewestContent(candidates) {
  const values = candidates.filter((item) => item && typeof item === "object");
  if (values.length === 0) return null;

  const newest = values.reduce((best, current) => {
    return getContentTimestamp(current) > getContentTimestamp(best) ? current : best;
  });

  if (getContentTimestamp(newest) > 0) {
    return newest;
  }

  // Fallback to first available source when timestamps are missing.
  return values[0];
}

export const defaultSiteImages = {
  // Images
  heroImage: "/media/site/placeholder.svg",
  artisanPortrait: "/media/site/placeholder.svg",
  collectionJewellery: "/media/site/placeholder.svg",
  collectionHome: "/media/site/placeholder.svg",
  collectionAccessories: "/media/site/placeholder.svg",
  collectionBridal: "/media/site/placeholder.svg",
  customOrdersMediaType: "image",
  customOrdersImage: "/media/site/homepage/design.jpg",
  customOrdersVideo: "",
  pageTexture: "/textures/linen-noise.svg",
  // Text content
  heroTitle: "Handmade Kenyan jewellery & home decor",
  heroSubtitle: "Crafted by artisans in Kenya. Every piece tells a story.",
  artisanBio: "Sharon is a Kenyan artisan who has been crafting beaded jewellery for over 10 years.",
  artisanStories: "",
  aboutStory: "SharonCraft was born from a passion for preserving Kenya's rich beadwork traditions while sharing them with the world.",
  contactWhatsApp: "0112222572",
  contactEmail: "",
  businessHours: "Mon-Sat, 9am-6pm EAT",
  deliveryNote: "We deliver across Kenya. Standard delivery is KES 300.",
  siteContentUpdatedAt: "",
};

export async function readSiteImages() {
  const [storageValue, tableValue, localValue] = await Promise.all([
    readStorageSiteImages(),
    readTableSiteImages(),
    readLocalSiteImages(),
  ]);

  const selected = pickNewestContent([storageValue, tableValue, localValue]);
  if (selected) {
    return { ...defaultSiteImages, ...selected };
  }

  return { ...defaultSiteImages };
}

export async function writeSiteImages(patch) {
  const current = await readSiteImages();
  const timestamp = new Date().toISOString();
  const merged = { ...current, ...patch, siteContentUpdatedAt: timestamp };
  const payload = {
    key: SITE_CONTENT_KEY,
    value: merged,
    updated_at: timestamp,
  };
  const persistedTo = [];

  try {
    const supabase = getSupabase();

    if (hasServiceRoleKey()) {
      const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "key" });
      if (!error) {
        persistedTo.push("supabase-table");
      }
    } else {
      const { data: existingRow, error: lookupError } = await supabase
        .from("site_settings")
        .select("key")
        .eq("key", SITE_CONTENT_KEY)
        .maybeSingle();

      if (!lookupError && existingRow?.key === SITE_CONTENT_KEY) {
        const { error: updateError } = await supabase
          .from("site_settings")
          .update({ value: merged, updated_at: payload.updated_at })
          .eq("key", SITE_CONTENT_KEY);

        if (!updateError) {
          persistedTo.push("supabase-table");
        }
      } else if (!lookupError) {
        const { error: insertError } = await supabase.from("site_settings").insert(payload);
        if (!insertError) {
          persistedTo.push("supabase-table");
        }
      }
    }
  } catch {
    // fall through to Blob/local persistence
  }

  const storagePersisted = await writeStorageSiteImages(merged);
  if (storagePersisted) {
    persistedTo.push("supabase-storage");
  }

  try {
    await writeLocalSiteImagesFile(merged);
    persistedTo.push("local-file");
  } catch {
    // ignore local fallback failures in serverless
  }

  if (persistedTo.length === 0) {
    throw new Error(
      "writeSiteImages failed: could not persist site content to Supabase table, Supabase storage, or the local fallback file"
    );
  }

  return {
    siteImages: merged,
    persistence: {
      targets: persistedTo,
      durable: persistedTo.some((target) => target !== "local-file"),
    },
  };
}
