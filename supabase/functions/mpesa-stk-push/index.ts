import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type CheckoutItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type CheckoutPayload = {
  amount?: number;
  currency?: string;
  items?: CheckoutItem[];
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    deliveryArea?: string;
  };
  sourcePage?: string;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const MPESA_ENV = (Deno.env.get("MPESA_ENV") || "sandbox").toLowerCase();
const MPESA_CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY") || "";
const MPESA_CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET") || "";
const MPESA_SHORTCODE = Deno.env.get("MPESA_SHORTCODE") || "";
const MPESA_PASSKEY = Deno.env.get("MPESA_PASSKEY") || "";
const MPESA_TRANSACTION_TYPE = Deno.env.get("MPESA_TRANSACTION_TYPE") || "CustomerPayBillOnline";
const MPESA_ACCOUNT_REFERENCE_PREFIX = Deno.env.get("MPESA_ACCOUNT_REFERENCE_PREFIX") || "SHARONCRAFT";
const MPESA_CALLBACK_SECRET = Deno.env.get("MPESA_CALLBACK_SECRET") || "";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

function normalizePhoneNumber(value: unknown) {
  const digits = normalizeText(value).replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
  if (digits.startsWith("1") && digits.length === 9) return `254${digits}`;
  return "";
}

function normalizeEmail(value: unknown) {
  return normalizeText(value).toLowerCase();
}

function timestampInNairobi() {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}

function makeReference() {
  const now = new Date();
  const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const randomPart = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `${MPESA_ACCOUNT_REFERENCE_PREFIX}-${datePart}-${randomPart}`;
}

function getBaseUrl() {
  return MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
}

function buildCallbackUrl() {
  const base = `${SUPABASE_URL.replace(/\/+$/, "")}/functions/v1/mpesa-callback`;
  if (!MPESA_CALLBACK_SECRET) return base;
  return `${base}?secret=${encodeURIComponent(MPESA_CALLBACK_SECRET)}`;
}

async function getAccessToken() {
  const credentials = btoa(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`);
  const response = await fetch(`${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(data.errorMessage || data.error_description || "Unable to get M-Pesa access token.");
  }

  return data.access_token as string;
}

function sanitizeItems(items: unknown) {
  return Array.isArray(items)
    ? items
        .map((item) => ({
          productId: normalizeText(item && (item as Record<string, unknown>).productId),
          productName: normalizeText(item && (item as Record<string, unknown>).productName),
          quantity: Math.max(1, Number(item && (item as Record<string, unknown>).quantity) || 1),
          unitPrice: Math.max(0, Number(item && (item as Record<string, unknown>).unitPrice) || 0),
          lineTotal: Math.max(0, Number(item && (item as Record<string, unknown>).lineTotal) || 0),
        }))
        .filter((item) => item.productId && item.productName)
    : [];
}

async function saveCheckoutRecord(record: Record<string, unknown>) {
  const { error } = await supabaseAdmin.from("mpesa_checkouts").upsert(record, { onConflict: "reference" });
  if (error) {
    console.error("Unable to save M-Pesa checkout record", error);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed." }, 405);
  }

  if (
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !MPESA_CONSUMER_KEY ||
    !MPESA_CONSUMER_SECRET ||
    !MPESA_SHORTCODE ||
    !MPESA_PASSKEY
  ) {
    return jsonResponse(
      {
        ok: false,
        error: "M-Pesa is not configured yet. Add the Daraja and Supabase secrets before going live.",
      },
      500,
    );
  }

  const payload = (await request.json().catch(() => ({}))) as CheckoutPayload;
  const items = sanitizeItems(payload.items);
  const customerName = normalizeText(payload.customer?.name);
  const customerEmail = normalizeEmail(payload.customer?.email);
  const customerPhone = normalizePhoneNumber(payload.customer?.phone);
  const deliveryArea = normalizeText(payload.customer?.deliveryArea);
  const amount = Math.round(Number(payload.amount) || 0);
  const currency = normalizeText(payload.currency) || "KES";

  if (!items.length) {
    return jsonResponse({ ok: false, error: "Add at least one product before starting M-Pesa checkout." }, 400);
  }

  if (!customerName || !customerPhone || !deliveryArea) {
    return jsonResponse({ ok: false, error: "Name, phone number, and delivery area are required." }, 400);
  }

  if (!amount || amount < 1) {
    return jsonResponse({ ok: false, error: "Cart total is invalid for M-Pesa checkout." }, 400);
  }

  const reference = makeReference();
  const timestamp = timestampInNairobi();
  const password = btoa(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`);
  const requestPayload = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: MPESA_TRANSACTION_TYPE,
    Amount: amount,
    PartyA: customerPhone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: customerPhone,
    CallBackURL: buildCallbackUrl(),
    AccountReference: reference,
    TransactionDesc: `SharonCraft checkout for ${items.length} item${items.length === 1 ? "" : "s"}`,
  };

  await saveCheckoutRecord({
    reference,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    delivery_area: deliveryArea,
    amount,
    currency,
    items,
    status: "initiated",
    request_payload: {
      ...requestPayload,
      Password: "[redacted]",
      sourcePage: normalizeText(payload.sourcePage),
    },
    updated_at: new Date().toISOString(),
  });

  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestPayload),
    });

    const data = await response.json().catch(() => ({}));
    const isAccepted = response.ok && normalizeText(data.ResponseCode) === "0";

    await saveCheckoutRecord({
      reference,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      delivery_area: deliveryArea,
      amount,
      currency,
      items,
      status: isAccepted ? "prompted" : "failed",
      merchant_request_id: normalizeText(data.MerchantRequestID),
      checkout_request_id: normalizeText(data.CheckoutRequestID),
      result_code: Number.isFinite(Number(data.ResponseCode)) ? Number(data.ResponseCode) : null,
      result_desc: normalizeText(data.ResponseDescription || data.errorMessage || data.responseDescription),
      request_payload: {
        ...requestPayload,
        Password: "[redacted]",
        sourcePage: normalizeText(payload.sourcePage),
      },
      response_payload: data,
      updated_at: new Date().toISOString(),
    });

    if (!isAccepted) {
      return jsonResponse(
        {
          ok: false,
          error: normalizeText(data.CustomerMessage || data.errorMessage || data.ResponseDescription) || "M-Pesa did not accept the payment request.",
          reference,
        },
        400,
      );
    }

    return jsonResponse({
      ok: true,
      reference,
      merchantRequestId: normalizeText(data.MerchantRequestID),
      checkoutRequestId: normalizeText(data.CheckoutRequestID),
      customerMessage: normalizeText(data.CustomerMessage) || "Check your phone and enter your M-Pesa PIN to complete payment.",
      resultDescription: normalizeText(data.ResponseDescription),
    });
  } catch (error) {
    await saveCheckoutRecord({
      reference,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      delivery_area: deliveryArea,
      amount,
      currency,
      items,
      status: "failed",
      result_desc: normalizeText(error instanceof Error ? error.message : error),
      updated_at: new Date().toISOString(),
    });

    return jsonResponse(
      {
        ok: false,
        error: normalizeText(error instanceof Error ? error.message : error) || "Unable to start M-Pesa right now.",
        reference,
      },
      500,
    );
  }
});
