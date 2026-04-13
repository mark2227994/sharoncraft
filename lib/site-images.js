/**
 * site-images.js — site content data (images + text) backed by Supabase.
 * Falls back to local file for dev environments.
 */
import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://vonzscriztdcdhobulhy.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_3CbiLXuCbqRGjKmBp7Ez3w_NV4HaLXa";

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

const SITE_CONTENT_KEY = "site_content";
const localFile = path.join(process.cwd(), "data", "site-images.json");

export const defaultSiteImages = {
  // Images
  heroImage: "/media/site/placeholder.svg",
  artisanPortrait: "/media/site/placeholder.svg",
  collectionJewellery: "/media/site/placeholder.svg",
  collectionHome: "/media/site/placeholder.svg",
  collectionAccessories: "/media/site/placeholder.svg",
  pageTexture: "/textures/linen-noise.svg",
  // Text content
  heroTitle: "Handmade Kenyan jewellery & home decor",
  heroSubtitle: "Crafted by artisans in Kenya. Every piece tells a story.",
  artisanBio: "Sharon is a Kenyan artisan who has been crafting beaded jewellery for over 10 years.",
  aboutStory: "SharonCraft was born from a passion for preserving Kenya's rich beadwork traditions while sharing them with the world.",
  contactWhatsApp: "0112222572",
  contactEmail: "",
  businessHours: "Mon–Sat, 9am–6pm EAT",
  deliveryNote: "We deliver across Kenya. Standard delivery is KES 300.",
};

export async function readSiteImages() {
  // Try Supabase first
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SITE_CONTENT_KEY)
      .maybeSingle();

    if (!error && data?.value && typeof data.value === "object") {
      return { ...defaultSiteImages, ...data.value };
    }
  } catch {
    // fall through
  }

  // Fallback to local file
  try {
    const raw = await fs.readFile(localFile, "utf8");
    const parsed = JSON.parse(raw);
    return { ...defaultSiteImages, ...parsed };
  } catch {
    return { ...defaultSiteImages };
  }
}

export async function writeSiteImages(patch) {
  const current = await readSiteImages();
  const merged = { ...current, ...patch };

  const supabase = getSupabase();
  const { error } = await supabase.from("site_settings").upsert(
    { key: SITE_CONTENT_KEY, value: merged, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) throw new Error(`writeSiteImages failed: ${error.message}`);
  return merged;
}
