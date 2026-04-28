/**
 * store.js — data access layer for products, orders, and M-Pesa transactions.
 *
 * Products now prefer the Supabase public.products table used by admin-v2 so
 * the storefront and admin panel share the same live catalog. Falls back to
 * the legacy site_settings catalog and finally the local JSON file if needed.
 *
 * Orders and M-Pesa data still read from local JSON files (read-only on Vercel
 * is fine for those since they are written by the checkout flow directly into
 * Supabase tables already).
 */

import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { normalizeProducts, slugify } from "./products";
import { normalizeWaOrders } from "./wa-orders";
import { normalizeCustomOrders } from "./custom-orders";

// ─── Supabase client ─────────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://vonzscriztdcdhobulhy.supabase.co";

// Server-side only. Use service role key when available so RLS is bypassed safely.
// Fall back to the publishable/anon key for read operations.
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";
const HAS_SUPABASE_SERVICE_ROLE = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

const CATALOG_KEY = "products_catalog";
const MARKETING_KEY = "marketing_studio";
const FINANCE_KEY = "finance_dashboard";
const CUSTOM_ORDERS_KEY = "custom_production_orders";
const DESIGNERS_KEY = "designers_directory";
const NEWSLETTER_KEY = "newsletter_workspace";

// ─── Local file fallback (used during local dev and for orders) ───────────────
const root = process.cwd();
const storeDir = path.join(root, "data", "store");

const FILES = {
  products: path.join(storeDir, "products.json"),
  orders: path.join(storeDir, "orders.json"),
  mpesa: path.join(storeDir, "mpesa-transactions.json"),
  waOrders: path.join(storeDir, "wa-orders.json"),
};

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeText(item)).filter(Boolean);
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function buildStorefrontSlug(product) {
  const nameSlug = slugify(product?.name || product?.subcategory || product?.category || "product");
  const idPrefix = normalizeText(product?.id).split("-")[0];
  return idPrefix ? `${nameSlug}-${idPrefix}` : nameSlug;
}

function mapTableProductToCatalogProduct(product) {
  const basePrice = Math.max(0, toNumber(product?.price, 0));
  const salePrice = toNumber(product?.sale_price, NaN);
  const hasSalePrice = Number.isFinite(salePrice) && salePrice > 0 && salePrice < basePrice;
  const images = normalizeStringList(product?.images);
  const sizes = normalizeStringList(product?.sizes);
  const colors = normalizeStringList(product?.colors);
  const stock = Math.max(0, Math.floor(toNumber(product?.stock_quantity, 0)));
  const subcategory = normalizeText(product?.subcategory);
  const careInstructions = normalizeText(product?.care_instructions);

  return {
    id: normalizeText(product?.id),
    slug: buildStorefrontSlug(product),
    name: normalizeText(product?.name) || "Untitled Piece",
    description: normalizeText(product?.description),
    shortDescription: normalizeText(product?.description),
    category: normalizeText(product?.category),
    subcategory,
    price: hasSalePrice ? salePrice : basePrice,
    originalPrice: hasSalePrice ? basePrice : null,
    stock,
    isSold: stock <= 0,
    image: images[0] || "",
    images,
    featured: Boolean(product?.is_featured),
    recent: Boolean(product?.is_new),
    isNew: Boolean(product?.is_new),
    newArrival: Boolean(product?.is_new),
    publishStatus: product?.is_visible === false ? "draft" : "published",
    artisan: normalizeText(product?.artisan) || "By Sharon",
    careInstructions,
    details: [
      subcategory ? `Subcategory: ${subcategory}` : "",
      sizes.length > 0 ? `Available sizes: ${sizes.join(", ")}` : "",
      colors.length > 0 ? `Available colors: ${colors.join(", ")}` : "",
      careInstructions ? `Care instructions: ${careInstructions}` : "",
    ].filter(Boolean),
    options: sizes,
    story: {
      artisanName: normalizeText(product?.artisan) || "By Sharon",
      text: normalizeText(product?.description),
      materials: [],
    },
  };
}

// ─── Products (Supabase-backed, file fallback) ────────────────────────────────
export async function readProducts() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return normalizeProducts(data.map(mapTableProductToCatalogProduct));
    }
  } catch {
    // Supabase unreachable - fall through to legacy sources
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", CATALOG_KEY)
      .maybeSingle();

    if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
      return normalizeProducts(data.value);
    }
  } catch {
    // Supabase unreachable — fall through to local file
  }

  // Fallback: read from the local JSON file (works in dev, read-only on Vercel)
  try {
    return normalizeProducts(await readJsonFile(FILES.products));
  } catch {
    return [];
  }
}

export async function writeProducts(products) {
  const normalizedProducts = normalizeProducts(products);
  const supabase = getSupabase();
  const { error } = await supabase.from("site_settings").upsert(
    { key: CATALOG_KEY, value: normalizedProducts, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) {
    throw new Error(`writeProducts failed: ${error.message}`);
  }
}

// ─── Orders (local file, read-only on Vercel — checkout flow writes to Supabase) ─
export async function readOrders() {
  try {
    return await readJsonFile(FILES.orders);
  } catch {
    return [];
  }
}

export async function writeOrders(orders) {
  // On Vercel the filesystem is read-only; order data lives in Supabase orders table.
  try {
    await fs.writeFile(FILES.orders, `${JSON.stringify(orders, null, 2)}\n`, "utf8");
  } catch {
    // Silently ignore in serverless environments
  }
}

// ─── M-Pesa transactions (local file, read-only on Vercel) ───────────────────
export async function readMpesaTransactions() {
  try {
    return await readJsonFile(FILES.mpesa);
  } catch {
    return [];
  }
}

export async function writeMpesaTransactions(transactions) {
  try {
    await fs.writeFile(
      FILES.mpesa,
      `${JSON.stringify(transactions, null, 2)}\n`,
      "utf8"
    );
  } catch {
    // Silently ignore in serverless environments
  }
}

// ─── WhatsApp orders (Supabase-backed) ───────────────────────────────────────
export async function readWaOrders() {
  if (HAS_SUPABASE_SERVICE_ROLE) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "wa_orders")
        .maybeSingle();

      if (!error && data?.value && Array.isArray(data.value)) {
        return normalizeWaOrders(data.value);
      }
    } catch {
      // fall through
    }
  }

  try {
    return normalizeWaOrders(await readJsonFile(FILES.waOrders));
  } catch {
    return normalizeWaOrders([]);
  }
}

export async function writeWaOrders(orders) {
  const normalizedOrders = normalizeWaOrders(orders);

  if (HAS_SUPABASE_SERVICE_ROLE) {
    const supabase = getSupabase();
    const { error } = await supabase.from("site_settings").upsert(
      { key: "wa_orders", value: normalizedOrders, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    if (!error) {
      return;
    }

    throw new Error(`writeWaOrders failed: ${error.message}`);
  }

  try {
    await fs.writeFile(FILES.waOrders, `${JSON.stringify(normalizedOrders, null, 2)}\n`, "utf8");
    return;
  } catch {
    throw new Error(
      "WhatsApp order saves need SUPABASE_SERVICE_ROLE_KEY in your env on Vercel, or a writable local file fallback in development."
    );
  }
}

export async function readMarketingStudio() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", MARKETING_KEY)
      .maybeSingle();

    if (!error && data?.value && typeof data.value === "object") {
      return data.value;
    }
  } catch {
    // fall through
  }

  return {
    campaigns: [],
    planner: [],
    leads: [],
    offers: [],
    abandonedCheckouts: [],
  };
}

export async function writeMarketingStudio(studio) {
  const value = {
    campaigns: Array.isArray(studio?.campaigns) ? studio.campaigns : [],
    planner: Array.isArray(studio?.planner) ? studio.planner : [],
    leads: Array.isArray(studio?.leads) ? studio.leads : [],
    offers: Array.isArray(studio?.offers) ? studio.offers : [],
    abandonedCheckouts: Array.isArray(studio?.abandonedCheckouts) ? studio.abandonedCheckouts : [],
  };

  const supabase = getSupabase();
  const { error } = await supabase.from("site_settings").upsert(
    { key: MARKETING_KEY, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) throw new Error(`writeMarketingStudio failed: ${error.message}`);
}

export async function readFinanceDashboard() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", FINANCE_KEY)
      .maybeSingle();

    if (!error && data?.value && typeof data.value === "object") {
      return data.value;
    }
  } catch {
    // fall through
  }

  return {
    weeklyCosts: [],
  };
}

export async function writeFinanceDashboard(finance) {
  const value = {
    weeklyCosts: Array.isArray(finance?.weeklyCosts) ? finance.weeklyCosts : [],
  };

  const supabase = getSupabase();
  const { error } = await supabase.from("site_settings").upsert(
    { key: FINANCE_KEY, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) throw new Error(`writeFinanceDashboard failed: ${error.message}`);
}

export async function readCustomOrders() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", CUSTOM_ORDERS_KEY)
      .maybeSingle();

    if (!error && Array.isArray(data?.value)) {
      return normalizeCustomOrders(data.value);
    }
  } catch {
    // fall through
  }

  return normalizeCustomOrders([]);
}

export async function writeCustomOrders(customOrders) {
  const value = normalizeCustomOrders(customOrders);
  const supabase = getSupabase();
  const { error } = await supabase.from("site_settings").upsert(
    { key: CUSTOM_ORDERS_KEY, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) throw new Error(`writeCustomOrders failed: ${error.message}`);
}

export async function readDesigners() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", DESIGNERS_KEY)
      .maybeSingle();

    if (!error && Array.isArray(data?.value)) {
      return data.value;
    }
  } catch {
    // fall through
  }

  return [];
}

export async function writeDesigners(designers) {
  const value = Array.isArray(designers) ? designers : [];
  const supabase = getSupabase();
  const { error } = await supabase.from("site_settings").upsert(
    { key: DESIGNERS_KEY, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) throw new Error(`writeDesigners failed: ${error.message}`);
}

export async function readNewsletterWorkspace() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", NEWSLETTER_KEY)
      .maybeSingle();

    if (!error && data?.value && typeof data.value === "object") {
      return {
        subscribers: Array.isArray(data.value.subscribers) ? data.value.subscribers : [],
        campaigns: Array.isArray(data.value.campaigns) ? data.value.campaigns : [],
      };
    }
  } catch {
    // fall through
  }

  return {
    subscribers: [],
    campaigns: [],
  };
}

export async function writeNewsletterWorkspace(workspace) {
  const value = {
    subscribers: Array.isArray(workspace?.subscribers) ? workspace.subscribers : [],
    campaigns: Array.isArray(workspace?.campaigns) ? workspace.campaigns : [],
  };

  const supabase = getSupabase();
  const { error } = await supabase.from("site_settings").upsert(
    { key: NEWSLETTER_KEY, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) throw new Error(`writeNewsletterWorkspace failed: ${error.message}`);
}

// ─── Dashboard snapshot ───────────────────────────────────────────────────────
export async function getDashboardSnapshot() {
  const [products, orders, mpesa, waOrders, finance, customOrders] = await Promise.all([
    readProducts(),
    readOrders(),
    readMpesaTransactions(),
    readWaOrders(),
    readFinanceDashboard(),
    readCustomOrders(),
  ]);
  return { products, orders, mpesa, waOrders, finance, customOrders };
}
