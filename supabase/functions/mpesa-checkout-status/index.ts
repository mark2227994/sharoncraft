import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed." }, 405);
  }

  const payload = await request.json().catch(() => ({}));
  const reference = normalizeText(payload?.reference);

  if (!reference) {
    return jsonResponse({ ok: false, error: "Checkout reference is required." }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from("mpesa_checkouts")
    .select("reference, status, result_code, result_desc, mpesa_receipt_number, paid_at, updated_at")
    .eq("reference", reference)
    .maybeSingle();

  if (error) {
    return jsonResponse({ ok: false, error: error.message || "Unable to fetch checkout status." }, 500);
  }

  if (!data) {
    return jsonResponse({ ok: false, error: "Checkout not found." }, 404);
  }

  return jsonResponse({
    ok: true,
    reference: normalizeText(data.reference),
    status: normalizeText(data.status),
    resultCode: typeof data.result_code === "number" ? data.result_code : null,
    resultDesc: normalizeText(data.result_desc),
    mpesaReceiptNumber: normalizeText(data.mpesa_receipt_number),
    paidAt: data.paid_at || null,
    updatedAt: data.updated_at || null,
  });
});
