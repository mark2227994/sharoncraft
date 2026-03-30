import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const MPESA_CALLBACK_SECRET = Deno.env.get("MPESA_CALLBACK_SECRET") || "";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

function normalizeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractMetadataValue(items: unknown[], key: string) {
  const match = Array.isArray(items)
    ? items.find((item) => normalizeText(item && (item as Record<string, unknown>).Name) === key)
    : null;
  return match && typeof (match as Record<string, unknown>).Value !== "undefined"
    ? (match as Record<string, unknown>).Value
    : "";
}

async function syncOrdersForPaidCheckout(reference: string) {
  const { data: checkout, error: checkoutError } = await supabaseAdmin
    .from("mpesa_checkouts")
    .select("reference, customer_name, customer_phone, delivery_area, amount, items, mpesa_receipt_number, created_at")
    .eq("reference", reference)
    .maybeSingle();

  if (checkoutError || !checkout) {
    if (checkoutError) {
      console.error("Unable to load paid checkout for order sync", checkoutError);
    }
    return;
  }

  const items = Array.isArray(checkout.items) ? checkout.items : [];
  if (!items.length) {
    return;
  }

  const orderRows = items.map((item, index) => {
    const productId = normalizeText(item?.productId);
    const productName = normalizeText(item?.productName) || "SharonCraft item";
    const quantity = Math.max(1, normalizeNumber(item?.quantity) || 1);
    const lineTotal = Math.max(0, normalizeNumber(item?.lineTotal));
    const orderId = `${reference}-${String(index + 1).padStart(2, "0")}`;
    const noteParts = [
      `Paid via M-Pesa`,
      checkout.mpesa_receipt_number ? `Receipt: ${normalizeText(checkout.mpesa_receipt_number)}` : "",
      `Checkout ref: ${reference}`,
    ].filter(Boolean);

    return {
      id: orderId,
      customer_name: normalizeText(checkout.customer_name),
      customer_phone: normalizeText(checkout.customer_phone),
      product_id: productId,
      product_name: productName,
      quantity,
      delivery_area_id: "",
      delivery_area: normalizeText(checkout.delivery_area),
      status: "paid",
      note: noteParts.join(" | "),
      total_profit: 0,
      order_total: lineTotal,
      created_at: checkout.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const trackingRows = orderRows.map((row) => ({
    id: row.id,
    product_name: row.product_name,
    quantity: row.quantity,
    delivery_area: row.delivery_area,
    status: row.status,
    note: row.note,
    order_total: row.order_total,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  const { error: ordersError } = await supabaseAdmin.from("orders").upsert(orderRows, { onConflict: "id" });
  if (ordersError) {
    console.error("Unable to sync paid checkout into orders", ordersError);
    return;
  }

  const { error: trackingError } = await supabaseAdmin
    .from("order_tracking")
    .upsert(trackingRows, { onConflict: "id" });

  if (trackingError) {
    console.error("Unable to sync paid checkout into order tracking", trackingError);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed." }, 405);
  }

  const url = new URL(request.url);
  if (MPESA_CALLBACK_SECRET && url.searchParams.get("secret") !== MPESA_CALLBACK_SECRET) {
    return jsonResponse({ ok: false, error: "Unauthorized callback." }, 401);
  }

  const payload = await request.json().catch(() => ({}));
  const callback = payload?.Body?.stkCallback || {};
  const checkoutRequestId = normalizeText(callback.CheckoutRequestID);
  const merchantRequestId = normalizeText(callback.MerchantRequestID);
  const resultCode = Number(callback.ResultCode);
  const resultDesc = normalizeText(callback.ResultDesc);
  const metadataItems = Array.isArray(callback.CallbackMetadata?.Item) ? callback.CallbackMetadata.Item : [];

  if (!checkoutRequestId) {
    return jsonResponse({ ok: false, error: "Missing CheckoutRequestID." }, 400);
  }

  const updatePayload = {
    checkout_request_id: checkoutRequestId,
    merchant_request_id: merchantRequestId,
    status: resultCode === 0 ? "paid" : resultCode === 1032 ? "cancelled" : "failed",
    result_code: Number.isFinite(resultCode) ? resultCode : null,
    result_desc: resultDesc,
    mpesa_receipt_number: normalizeText(extractMetadataValue(metadataItems, "MpesaReceiptNumber")),
    callback_payload: payload,
    paid_at: resultCode === 0 ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("mpesa_checkouts")
    .update(updatePayload)
    .eq("checkout_request_id", checkoutRequestId);

  if (error) {
    console.error("Unable to update M-Pesa checkout callback", error);
    return jsonResponse({ ok: false, error: "Unable to save callback." }, 500);
  }

  if (resultCode === 0) {
    const { data: paidCheckout } = await supabaseAdmin
      .from("mpesa_checkouts")
      .select("reference")
      .eq("checkout_request_id", checkoutRequestId)
      .maybeSingle();

    const reference = normalizeText(paidCheckout?.reference);
    if (reference) {
      await syncOrdersForPaidCheckout(reference);
    }
  }

  return jsonResponse({
    ok: true,
    checkoutRequestId,
    resultCode,
    resultDesc,
  });
});
