// Business tools - Customer, Inventory, SEO, Expenses management
// This file provides data access functions for the admin tools

import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://vonzscriztdcdhobulhy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_3CbiLXuCbqRGjKmBp7Ez3w_NV4HaLXa";
const HAS_SUPABASE_SERVICE_ROLE = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

const CUSTOMERS_KEY = "customer_database";
const INVENTORY_KEY = "inventory_tracker";
const SEO_KEY = "seo_tools";
const EXPENSES_KEY = "business_expenses";

function compact(value) {
  return String(value || "").trim();
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

// Customers
export async function readCustomers() {
  if (HAS_SUPABASE_SERVICE_ROLE) {
    try {
      const supabase = getSupabase();
      const { data } = await supabase.from("site_settings").select("value").eq("key", CUSTOMERS_KEY).maybeSingle();
      if (data?.value && Array.isArray(data.value)) return data.value;
    } catch {}
  }
  return [];
}

export async function writeCustomers(customers) {
  const normalized = customers.map(c => ({
    id: compact(c.id) || `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: compact(c.name), email: compact(c.email), phone: compact(c.phone),
    totalOrders: Math.max(0, toNumber(c.totalOrders)), totalSpent: toNumber(c.totalSpent),
    firstOrderDate: compact(c.firstOrderDate) || new Date().toISOString(),
    lastOrderDate: compact(c.lastOrderDate) || new Date().toISOString(),
    tags: Array.isArray(c.tags) ? c.tags : [], notes: compact(c.notes),
    createdAt: compact(c.createdAt) || new Date().toISOString(), updatedAt: new Date().toISOString(),
  }));
  if (HAS_SUPABASE_SERVICE_ROLE) {
    const supabase = getSupabase();
    await supabase.from("site_settings").upsert({ key: CUSTOMERS_KEY, value: normalized, updated_at: new Date().toISOString() }, { onConflict: "key" });
  }
}

// Inventory
export async function readInventory() {
  if (HAS_SUPABASE_SERVICE_ROLE) {
    try {
      const supabase = getSupabase();
      const { data } = await supabase.from("site_settings").select("value").eq("key", INVENTORY_KEY).maybeSingle();
      if (data?.value && Array.isArray(data.value)) return data.value;
    } catch {}
  }
  return [];
}

export async function writeInventory(inventory) {
  if (HAS_SUPABASE_SERVICE_ROLE) {
    const supabase = getSupabase();
    await supabase.from("site_settings").upsert({ key: INVENTORY_KEY, value: inventory, updated_at: new Date().toISOString() }, { onConflict: "key" });
  }
}

// SEO
export async function readSeoSettings() {
  if (HAS_SUPABASE_SERVICE_ROLE) {
    try {
      const supabase = getSupabase();
      const { data } = await supabase.from("site_settings").select("value").eq("key", SEO_KEY).maybeSingle();
      if (data?.value) return data.value;
    } catch {}
  }
  return { metaTitle: "SharonCraft", metaDescription: "Handmade Kenyan Beadwork", keywords: [], sitemapPriority: "0.8", robotsDirectives: "index,follow" };
}

export async function writeSeoSettings(seo) {
  const value = { metaTitle: compact(seo.metaTitle), metaDescription: compact(seo.metaDescription), keywords: Array.isArray(seo.keywords) ? seo.keywords : [], sitemapPriority: String(seo.sitemapPriority || "0.8"), robotsDirectives: String(seo.robotsDirectives || "index,follow"), updatedAt: new Date().toISOString() };
  if (HAS_SUPABASE_SERVICE_ROLE) {
    const supabase = getSupabase();
    await supabase.from("site_settings").upsert({ key: SEO_KEY, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  }
}

// Expenses
export async function readExpenses() {
  if (HAS_SUPABASE_SERVICE_ROLE) {
    try {
      const supabase = getSupabase();
      const { data } = await supabase.from("site_settings").select("value").eq("key", EXPENSES_KEY).maybeSingle();
      if (data?.value && Array.isArray(data.value)) return data.value;
    } catch {}
  }
  return [];
}

export async function writeExpenses(expenses) {
  const normalized = expenses.map(e => ({
    id: compact(e.id) || `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    category: compact(e.category) || "other", description: compact(e.description),
    amount: toNumber(e.amount), date: compact(e.date) || new Date().toISOString().split("T")[0],
    vendor: compact(e.vendor), createdAt: compact(e.createdAt) || new Date().toISOString(), updatedAt: new Date().toISOString(),
  }));
  if (HAS_SUPABASE_SERVICE_ROLE) {
    const supabase = getSupabase();
    await supabase.from("site_settings").upsert({ key: EXPENSES_KEY, value: normalized, updated_at: new Date().toISOString() }, { onConflict: "key" });
  }
}