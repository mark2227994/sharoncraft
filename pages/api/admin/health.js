import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { get as getBlob } from "@vercel/blob";
import { isAuthorizedRequest } from "../../../lib/admin-auth";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://vonzscriztdcdhobulhy.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_3CbiLXuCbqRGjKmBp7Ez3w_NV4HaLXa";

const BLOB_SITE_CONTENT_PATH = "site-content/site-images.json";
const STORAGE_BUCKET = "product-images";
const STORAGE_SITE_CONTENT_PATH = "site-content/site-images.json";

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function checkSupabaseTable() {
  try {
    const supabase = getSupabase();
    const readResult = await supabase
      .from("site_settings")
      .select("key, updated_at")
      .eq("key", "site_content")
      .maybeSingle();

    const canRead = !readResult.error;
    let canWrite = false;

    const testKey = `health_check_${Date.now()}`;
    const write = await supabase
      .from("site_settings")
      .upsert({ key: testKey, value: { ok: true }, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (!write.error) {
      canWrite = true;
      await supabase.from("site_settings").delete().eq("key", testKey);
    }

    return {
      connected: canRead || canWrite,
      canRead,
      canWrite,
      error: readResult.error?.message || write.error?.message || "",
    };
  } catch (error) {
    return {
      connected: false,
      canRead: false,
      canWrite: false,
      error: String(error?.message || "Supabase table check failed"),
    };
  }
}

async function checkSupabaseStorage() {
  try {
    const supabase = getSupabase();
    const read = await supabase.storage.from(STORAGE_BUCKET).download(STORAGE_SITE_CONTENT_PATH);
    if (!read.error && read.data) {
      return {
        connected: true,
        canRead: true,
        error: "",
      };
    }

    const list = await supabase.storage.from(STORAGE_BUCKET).list("site-content", { limit: 1 });
    return {
      connected: !list.error,
      canRead: !list.error,
      error: read.error?.message || list.error?.message || "",
    };
  } catch (error) {
    return {
      connected: false,
      canRead: false,
      error: String(error?.message || "Supabase storage check failed"),
    };
  }
}

async function checkBlob() {
  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  if (!configured) {
    return {
      connected: false,
      configured: false,
      canRead: false,
      error: "BLOB_READ_WRITE_TOKEN not set",
    };
  }

  try {
    const result = await getBlob(BLOB_SITE_CONTENT_PATH, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      connected: Boolean(result && result.statusCode === 200),
      configured: true,
      canRead: Boolean(result && result.statusCode === 200),
      error: "",
    };
  } catch (error) {
    return {
      connected: false,
      configured: true,
      canRead: false,
      error: String(error?.message || "Blob check failed"),
    };
  }
}

async function checkLocalFallback() {
  const storeDir = path.join(process.cwd(), "data", "store");
  const testFile = path.join(storeDir, ".health-write-check.json");
  try {
    await fs.mkdir(storeDir, { recursive: true });
    await fs.writeFile(testFile, JSON.stringify({ ok: true, at: new Date().toISOString() }), "utf8");
    await fs.unlink(testFile);
    return {
      connected: true,
      canWrite: true,
      error: "",
    };
  } catch (error) {
    return {
      connected: false,
      canWrite: false,
      error: String(error?.message || "Local fallback check failed"),
    };
  }
}

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const [supabaseTable, supabaseStorage, blob, localFallback] = await Promise.all([
    checkSupabaseTable(),
    checkSupabaseStorage(),
    checkBlob(),
    checkLocalFallback(),
  ]);

  return res.status(200).json({
    checkedAt: new Date().toISOString(),
    targets: {
      supabaseTable,
      supabaseStorage,
      blob,
      localFallback,
    },
  });
}
