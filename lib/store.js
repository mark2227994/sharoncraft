/**
 * store.js — data access layer for products, orders, and M-Pesa transactions.
 *
 * Products are stored in Supabase (site_settings table, key = "products_catalog")
 * so they survive Vercel serverless deploys.  Falls back to the local JSON file
 * the first time, or when running locally without Supabase credentials.
 *
 * Orders and M-Pesa data still read from local JSON files (read-only on Vercel
 * is fine for those since they are written by the checkout flow directly into
 * Supabase tables already).
 */

import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client ─────────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://vonzscriztdcdhobulhy.supabase.co";

// Server-side only. Use service role key when available so RLS is bypassed safely.
// Fall back to the publishable/anon key for read operations.
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_3CbiLXuCbqRGjKmBp7Ez3w_NV4HaLXa";

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

const CATALOG_KEY = "products_catalog";

// ─── Local file fallback (used during local dev and for orders) ───────────────
const root = process.cwd();
const storeDir = path.join(root, "data", "store");

const FILES = {
  products: path.join(storeDir, "products.json"),
  orders: path.join(storeDir, "orders.json"),
  mpesa: path.join(storeDir, "mpesa-transactions.json"),
};

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

// ─── Products (Supabase-backed, file fallback) ────────────────────────────────
export async function readProducts() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", CATALOG_KEY)
      .maybeSingle();

    if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
      return data.value;
    }
  } catch {
    // Supabase unreachable — fall through to local file
  }

  // Fallback: read from the local JSON file (works in dev, read-only on Vercel)
  try {
    return await readJsonFile(FILES.products);
  } catch {
    return [];
  }
}

export async function writeProducts(products) {
  const supabase = getSupabase();
  const { error } = await supabase.from("site_settings").upsert(
    { key: CATALOG_KEY, value: products, updated_at: new Date().toISOString() },
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
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "wa_orders")
      .maybeSingle();

    if (!error && data?.value && Array.isArray(data.value)) {
      return data.value;
    }
  } catch {
    // fall through
  }
  return [];
}

export async function writeWaOrders(orders) {
  const supabase = getSupabase();
  const { error } = await supabase.from("site_settings").upsert(
    { key: "wa_orders", value: orders, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) throw new Error(`writeWaOrders failed: ${error.message}`);
}

// ─── Dashboard snapshot ───────────────────────────────────────────────────────
export async function getDashboardSnapshot() {
  const [products, orders, mpesa, waOrders] = await Promise.all([
    readProducts(),
    readOrders(),
    readMpesaTransactions(),
    readWaOrders(),
  ]);
  return { products, orders, mpesa, waOrders };
}
