import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { sendPaymentReceivedWhatsApp } from "../_shared/whatsapp.ts";

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

function normalizeOrderIdList(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((entry) => normalizeText(entry))
        .filter((entry) => /^ORD-\d{8}-[A-Z0-9]{4}$/i.test(entry))
    : [];
}

function formatOrderDateSegment(value: unknown) {
  const parsed = new Date(normalizeText(value) || Date.now());
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const year = safeDate.getUTCFullYear();
  const month = String(safeDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(safeDate.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function hashText(value: unknown) {
  return String(value || "")
    .split("")
    .reduce((hash, char) => ((hash * 31 + char.charCodeAt(0)) | 0), 7);
}

function buildPublicOrderId(createdAt: unknown, seedText: string, attempt = 0) {
  const dateSegment = formatOrderDateSegment(createdAt);
  const suffixSource = Math.abs(hashText(`${seedText}:${dateSegment}:${attempt}`))
    .toString(36)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const suffix = (suffixSource + "0000").slice(0, 4);
  return `ORD-${dateSegment}-${suffix}`;
}

function extractMetadataValue(items: unknown[], key: string) {
  const match = Array.isArray(items)
    ? items.find((item) => normalizeText(item && (item as Record<string, unknown>).Name) === key)
    : null;
  return match && typeof (match as Record<string, unknown>).Value !== "undefined"
    ? (match as Record<string, unknown>).Value
    : "";
}

async function resolvePublicOrderIds(reference: string, createdAt: unknown, count: number, savedIds: unknown) {
  const normalizedSavedIds = normalizeOrderIdList(savedIds);
  if (normalizedSavedIds.length === count) {
    return normalizedSavedIds;
  }

  const { data: existingOrders, error: existingOrdersError } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("checkout_reference", reference)
    .order("created_at", { ascending: true });

  if (existingOrdersError) {
    throw existingOrdersError;
  }

  const normalizedExistingIds = normalizeOrderIdList(existingOrders?.map((row) => row.id) || []);
  if (normalizedExistingIds.length === count) {
    return normalizedExistingIds;
  }

  const nextIds: string[] = [];

  for (let index = 0; index < count; index += 1) {
    let attempt = 0;
    let resolvedId = "";

    while (!resolvedId && attempt < 50) {
      const candidate = buildPublicOrderId(createdAt, `${reference}:${index + 1}`, attempt);
      if (nextIds.includes(candidate)) {
        attempt += 1;
        continue;
      }

      const { data: existingOrder, error: lookupError } = await supabaseAdmin
        .from("orders")
        .select("id, checkout_reference")
        .eq("id", candidate)
        .maybeSingle();

      if (lookupError) {
        throw lookupError;
      }

      if (!existingOrder || normalizeText(existingOrder.checkout_reference) === reference) {
        resolvedId = candidate;
        nextIds.push(candidate);
        continue;
      }

      attempt += 1;
    }

    if (!resolvedId) {
      throw new Error(`Unable to reserve a public order ID for checkout ${reference}.`);
    }
  }

  return nextIds;
}

async function syncOrdersForPaidCheckout(reference: string) {
  const { data: checkout, error: checkoutError } = await supabaseAdmin
    .from("mpesa_checkouts")
    .select("reference, customer_name, customer_phone, delivery_area, amount, items, mpesa_receipt_number, created_at, order_ids")
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

  const orderIds = await resolvePublicOrderIds(reference, checkout.created_at, items.length, checkout.order_ids);
  const orderRows = items.map((item, index) => {
    const productId = normalizeText(item?.productId);
    const productName = normalizeText(item?.productName) || "SharonCraft item";
    const quantity = Math.max(1, normalizeNumber(item?.quantity) || 1);
    const lineTotal = Math.max(0, normalizeNumber(item?.lineTotal));
    const orderId = orderIds[index];
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
      checkout_reference: reference,
      payment_method: "mpesa",
      payment_reference: normalizeText(checkout.mpesa_receipt_number),
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

  const { error: checkoutSyncError } = await supabaseAdmin
    .from("mpesa_checkouts")
    .update({
      order_ids: orderIds,
      updated_at: new Date().toISOString(),
    })
    .eq("reference", reference);

  if (checkoutSyncError) {
    console.error("Unable to save generated order IDs back to the checkout record", checkoutSyncError);
  }

  const { error: trackingError } = await supabaseAdmin
    .from("order_tracking")
    .upsert(trackingRows, { onConflict: "id" });

  if (trackingError) {
    console.error("Unable to sync paid checkout into order tracking", trackingError);
  }

  return {
    reference,
    customerName: normalizeText(checkout.customer_name),
    customerPhone: normalizeText(checkout.customer_phone),
    amount: Math.max(0, normalizeNumber(checkout.amount)),
    mpesaReceiptNumber: normalizeText(checkout.mpesa_receipt_number),
    orderIds,
  };
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
      const syncResult = await syncOrdersForPaidCheckout(reference);
      if (syncResult) {
        await sendPaymentReceivedWhatsApp(supabaseAdmin, {
          checkoutReference: syncResult.reference,
          customerName: syncResult.customerName,
          customerPhone: syncResult.customerPhone,
          amount: syncResult.amount,
          mpesaReceiptNumber: syncResult.mpesaReceiptNumber,
          orderIds: syncResult.orderIds,
        });
      }
    }
  }

  return jsonResponse({
    ok: true,
    checkoutRequestId,
    resultCode,
    resultDesc,
  });
});
