// Business tools - Customer, Inventory, SEO, Expenses management
// This file provides data access functions for the admin tools

import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://vonzscriztdcdhobulhy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_3CbiLXuCbqRGjKmBp7Ez3w_NV4HaLXa";

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

const CUSTOMERS_KEY = "customer_database";
const INVENTORY_KEY = "inventory_tracker";
const SEO_KEY = "seo_tools";
const EXPENSES_KEY = "business_expenses";

const root = process.cwd();
const storeDir = path.join(root, "data", "store");
const LOCAL_FILES = {
  [CUSTOMERS_KEY]: path.join(storeDir, "customers.json"),
  [INVENTORY_KEY]: path.join(storeDir, "inventory.json"),
  [SEO_KEY]: path.join(storeDir, "seo-settings.json"),
  [EXPENSES_KEY]: path.join(storeDir, "expenses.json"),
};

function compact(value) {
  return String(value || "").trim();
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

async function readLocalValue(key, fallback) {
  const filePath = LOCAL_FILES[key];
  if (!filePath) return fallback;

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed === undefined || parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

async function writeLocalValue(key, value) {
  const filePath = LOCAL_FILES[key];
  if (!filePath) return false;

  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function readSetting(key, fallback) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (!error && data && data.value !== undefined && data.value !== null) {
      return data.value;
    }
  } catch {
    // fall through to local fallback
  }

  return readLocalValue(key, fallback);
}

async function writeSetting(key, value) {
  const timestamp = new Date().toISOString();
  const payload = { key, value, updated_at: timestamp };
  let tablePersisted = false;

  try {
    const supabase = getSupabase();

    // Try full upsert first (works with service role and some anon policies).
    const upsert = await supabase.from("site_settings").upsert(payload, { onConflict: "key" });
    if (!upsert.error) {
      tablePersisted = true;
    } else {
      // Fallback to update/insert path for stricter anon policies.
      const lookup = await supabase
        .from("site_settings")
        .select("key")
        .eq("key", key)
        .maybeSingle();

      if (!lookup.error && lookup.data?.key === key) {
        const update = await supabase
          .from("site_settings")
          .update({ value, updated_at: timestamp })
          .eq("key", key);
        if (!update.error) {
          tablePersisted = true;
        }
      } else if (!lookup.error) {
        const insert = await supabase.from("site_settings").insert(payload);
        if (!insert.error) {
          tablePersisted = true;
        }
      }
    }
  } catch {
    // fall through to local fallback
  }

  const localPersisted = await writeLocalValue(key, value);

  if (!tablePersisted && !localPersisted) {
    throw new Error(`Could not persist ${key}`);
  }
}

// Customers
export async function readCustomers() {
  const value = await readSetting(CUSTOMERS_KEY, []);
  return Array.isArray(value) ? value : [];
}

export async function writeCustomers(customers) {
  const normalized = customers.map((customer) => ({
    id: compact(customer.id) || `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: compact(customer.name),
    email: compact(customer.email),
    phone: compact(customer.phone),
    totalOrders: Math.max(0, toNumber(customer.totalOrders)),
    totalSpent: toNumber(customer.totalSpent),
    firstOrderDate: compact(customer.firstOrderDate) || new Date().toISOString(),
    lastOrderDate: compact(customer.lastOrderDate) || new Date().toISOString(),
    tags: Array.isArray(customer.tags) ? customer.tags : [],
    notes: compact(customer.notes),
    createdAt: compact(customer.createdAt) || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  await writeSetting(CUSTOMERS_KEY, normalized);
}

// Inventory
export async function readInventory() {
  const value = await readSetting(INVENTORY_KEY, []);
  return Array.isArray(value) ? value : [];
}

export async function writeInventory(inventory) {
  const value = Array.isArray(inventory) ? inventory : [];
  await writeSetting(INVENTORY_KEY, value);
}

// SEO
export async function readSeoSettings() {
  const fallback = {
    metaTitle: "SharonCraft",
    metaDescription: "Handmade Kenyan Beadwork",
    keywords: [],
    sitemapPriority: "0.8",
    robotsDirectives: "index,follow",
  };

  const value = await readSetting(SEO_KEY, fallback);
  return value && typeof value === "object" ? { ...fallback, ...value } : fallback;
}

export async function writeSeoSettings(seo) {
  const value = {
    metaTitle: compact(seo.metaTitle),
    metaDescription: compact(seo.metaDescription),
    keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
    sitemapPriority: String(seo.sitemapPriority || "0.8"),
    robotsDirectives: String(seo.robotsDirectives || "index,follow"),
    updatedAt: new Date().toISOString(),
  };

  await writeSetting(SEO_KEY, value);
}

// Expenses
export async function readExpenses() {
  const value = await readSetting(EXPENSES_KEY, []);
  return Array.isArray(value) ? value : [];
}

export async function writeExpenses(expenses) {
  const normalized = expenses.map((expense) => ({
    id: compact(expense.id) || `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    category: compact(expense.category) || "other",
    description: compact(expense.description),
    amount: toNumber(expense.amount),
    date: compact(expense.date) || new Date().toISOString().split("T")[0],
    vendor: compact(expense.vendor),
    createdAt: compact(expense.createdAt) || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  await writeSetting(EXPENSES_KEY, normalized);
}
