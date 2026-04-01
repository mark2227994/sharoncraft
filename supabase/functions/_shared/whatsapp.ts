type NotificationLogInput = {
  checkoutReference: string;
  eventType: string;
  templateName: string;
  templateLanguage: string;
  provider: string;
  recipientPhone: string;
  orderIds: string[];
  status: "pending" | "sent" | "failed" | "skipped";
  providerMessageId?: string;
  errorMessage?: string;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
};

type PaymentNotificationInput = {
  checkoutReference: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  mpesaReceiptNumber: string;
  orderIds: string[];
};

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
  return digits;
}

function formatKesAmount(value: unknown) {
  const amount = Math.max(0, Number(value) || 0);
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function normalizeOrderIds(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((entry) => normalizeText(entry))
        .filter((entry) => /^ORD-\d{8}-[A-Z0-9]{4}$/i.test(entry))
    : [];
}

async function logNotification(supabaseAdmin: any, input: NotificationLogInput) {
  try {
    await supabaseAdmin.from("whatsapp_notifications").insert({
      event_type: normalizeText(input.eventType),
      template_name: normalizeText(input.templateName),
      template_language: normalizeText(input.templateLanguage),
      provider: normalizeText(input.provider),
      recipient_phone: normalizePhoneNumber(input.recipientPhone),
      checkout_reference: normalizeText(input.checkoutReference),
      order_ids: normalizeOrderIds(input.orderIds),
      status: input.status,
      provider_message_id: normalizeText(input.providerMessageId),
      error_message: normalizeText(input.errorMessage),
      request_payload: input.requestPayload || {},
      response_payload: input.responsePayload || {},
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Unable to write WhatsApp notification log", error);
  }
}

export async function sendPaymentReceivedWhatsApp(supabaseAdmin: any, input: PaymentNotificationInput) {
  const provider = normalizeText(Deno.env.get("WHATSAPP_PROVIDER") || "meta_cloud").toLowerCase();
  const accessToken = normalizeText(Deno.env.get("WHATSAPP_ACCESS_TOKEN"));
  const phoneNumberId = normalizeText(Deno.env.get("WHATSAPP_PHONE_NUMBER_ID"));
  const templateName = normalizeText(Deno.env.get("WHATSAPP_TEMPLATE_PAYMENT_RECEIVED"));
  const templateLanguage = normalizeText(Deno.env.get("WHATSAPP_TEMPLATE_LANGUAGE") || "en");
  const graphVersion = normalizeText(Deno.env.get("WHATSAPP_GRAPH_VERSION") || "v23.0");
  const recipientPhone = normalizePhoneNumber(input.customerPhone);
  const orderIds = normalizeOrderIds(input.orderIds);
  const requestPayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: templateLanguage,
      },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: normalizeText(input.customerName) || "Customer" },
            { type: "text", text: orderIds.join(", ") || normalizeText(input.checkoutReference) },
            { type: "text", text: normalizeText(input.mpesaReceiptNumber) || normalizeText(input.checkoutReference) },
            { type: "text", text: formatKesAmount(input.amount) },
          ],
        },
      ],
    },
  };

  if (!recipientPhone) {
    await logNotification(supabaseAdmin, {
      checkoutReference: input.checkoutReference,
      eventType: "payment_received",
      templateName,
      templateLanguage,
      provider,
      recipientPhone: input.customerPhone,
      orderIds,
      status: "skipped",
      errorMessage: "Customer phone number is missing or invalid for WhatsApp.",
      requestPayload,
    });
    return { ok: false, skipped: true };
  }

  if (provider !== "meta_cloud" || !accessToken || !phoneNumberId || !templateName) {
    await logNotification(supabaseAdmin, {
      checkoutReference: input.checkoutReference,
      eventType: "payment_received",
      templateName,
      templateLanguage,
      provider,
      recipientPhone,
      orderIds,
      status: "skipped",
      errorMessage: "WhatsApp provider is not fully configured for automated payment notifications.",
      requestPayload,
    });
    return { ok: false, skipped: true };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestPayload),
      signal: AbortSignal.timeout(10000),
    });

    const responsePayload = await response.json().catch(() => ({}));
    const providerMessageId = normalizeText(
      Array.isArray(responsePayload?.messages) && responsePayload.messages[0]
        ? responsePayload.messages[0].id
        : "",
    );

    if (!response.ok || !providerMessageId) {
      await logNotification(supabaseAdmin, {
        checkoutReference: input.checkoutReference,
        eventType: "payment_received",
        templateName,
        templateLanguage,
        provider,
        recipientPhone,
        orderIds,
        status: "failed",
        providerMessageId,
        errorMessage:
          normalizeText(responsePayload?.error?.message) ||
          normalizeText(response.statusText) ||
          "WhatsApp provider rejected the payment confirmation message.",
        requestPayload,
        responsePayload,
      });
      return { ok: false, skipped: false, responsePayload };
    }

    await logNotification(supabaseAdmin, {
      checkoutReference: input.checkoutReference,
      eventType: "payment_received",
      templateName,
      templateLanguage,
      provider,
      recipientPhone,
      orderIds,
      status: "sent",
      providerMessageId,
      requestPayload,
      responsePayload,
    });

    return { ok: true, skipped: false, providerMessageId, responsePayload };
  } catch (error) {
    await logNotification(supabaseAdmin, {
      checkoutReference: input.checkoutReference,
      eventType: "payment_received",
      templateName,
      templateLanguage,
      provider,
      recipientPhone,
      orderIds,
      status: "failed",
      errorMessage: normalizeText(error instanceof Error ? error.message : error) || "WhatsApp send failed.",
      requestPayload,
    });
    return { ok: false, skipped: false };
  }
}
