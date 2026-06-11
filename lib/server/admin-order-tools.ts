import { randomUUID } from "node:crypto";
import {
  DEFAULT_WHATSAPP_TEMPLATES,
  type ManagedOrder,
  type ManagedOrderItem,
  type OrderStatus,
  type WhatsappTemplateKey,
  type WhatsappTemplateRecord,
  buildStatusMessage,
  calculateProfit,
  normalizeManagedOrder,
  normalizePhoneNumber,
  normalizeOrderStatus,
} from "@/lib/order-management";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type OrderInsertInput = {
  customer_name: string;
  customer_phone: string;
  customer_location?: string | null;
  items: ManagedOrderItem[];
  total_amount: number;
  designer_cost?: number;
  payment_method?: string | null;
  payment_status?: string | null;
  order_status?: OrderStatus;
  notes?: string | null;
  rider_name?: string | null;
  rider_phone?: string | null;
  estimated_delivery?: string | null;
  delivered_at?: string | null;
};

function toPlainText(value: unknown) {
  return String(value || "").trim();
}

async function readTemplatesFromTable() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("whatsapp_templates")
    .select("*")
    .order("template_key", { ascending: true });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? (data as WhatsappTemplateRecord[]) : [];
}

async function readTemplatesFromSiteSettings() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "whatsapp_templates")
    .maybeSingle();

  const value = Array.isArray(data?.value) ? data.value : [];
  return value
    .map((template: Record<string, unknown>) => ({
      template_key: String(template.template_key || ""),
      name: String(template.name || ""),
      body: String(template.body || ""),
      description: String(template.description || ""),
    }))
    .filter((template) => template.template_key && template.body) as WhatsappTemplateRecord[];
}

export async function getWhatsappTemplates() {
  try {
    const templates = await readTemplatesFromTable();
    if (templates.length > 0) {
      return templates;
    }
  } catch {
    // Fall through to settings/defaults when the table is not yet migrated.
  }

  try {
    const fallback = await readTemplatesFromSiteSettings();
    if (fallback.length > 0) {
      return fallback;
    }
  } catch {
    // Ignore fallback read failures and return defaults.
  }

  return DEFAULT_WHATSAPP_TEMPLATES;
}

export async function saveWhatsappTemplates(templates: WhatsappTemplateRecord[]) {
  const supabaseAdmin = getSupabaseAdmin();
  const sanitized = templates.map((template) => ({
    template_key: template.template_key,
    name: toPlainText(template.name),
    body: String(template.body || ""),
    description: toPlainText(template.description),
    updated_at: new Date().toISOString(),
  }));

  try {
    const { error } = await supabaseAdmin
      .from("whatsapp_templates")
      .upsert(sanitized, { onConflict: "template_key" });

    if (error) {
      throw error;
    }
  } catch {
    await supabaseAdmin.from("site_settings").upsert(
      {
        key: "whatsapp_templates",
        value: sanitized,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
  }

  return sanitized as WhatsappTemplateRecord[];
}

export async function getManagedOrders() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data.map((order) => normalizeManagedOrder(order as Record<string, unknown>)) : [];
}

export async function generateUniqueOrderId() {
  const supabaseAdmin = getSupabaseAdmin();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = `#SC-${Math.floor(10000 + Math.random() * 90000)}`;
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("order_id", candidate)
      .maybeSingle();

    if (!error && !data) {
      return candidate;
    }
  }

  return `#SC-${String(Date.now()).slice(-5)}`;
}

export async function logWhatsappEvent(input: {
  eventType: string;
  templateKey: WhatsappTemplateKey;
  orderId: string;
  recipientPhone: string;
  message: string;
}) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    await supabaseAdmin.from("whatsapp_notifications").insert({
      event_type: input.eventType,
      template_name: input.templateKey,
      template_language: "en",
      provider: "wa_link",
      recipient_phone: normalizePhoneNumber(input.recipientPhone),
      checkout_reference: "",
      order_ids: [input.orderId],
      status: "pending",
      request_payload: {
        message: input.message,
      },
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Ignore logging failures to keep admin actions responsive.
  }
}

export async function createManagedOrder(input: OrderInsertInput) {
  const supabaseAdmin = getSupabaseAdmin();
  const order_id = await generateUniqueOrderId();
  const id = randomUUID();
  const total_amount = Math.max(0, Number(input.total_amount || 0));
  const designer_cost = Math.max(0, Number(input.designer_cost || 0));
  const order_status = normalizeOrderStatus(input.order_status || "pending");
  const payload = {
    id,
    order_id,
    customer_name: toPlainText(input.customer_name),
    customer_phone: normalizePhoneNumber(input.customer_phone),
    customer_location: toPlainText(input.customer_location),
    items: Array.isArray(input.items) ? input.items : [],
    total_amount,
    designer_cost,
    profit: calculateProfit(total_amount, designer_cost),
    order_total: total_amount,
    total_profit: Math.max(0, calculateProfit(total_amount, designer_cost)),
    payment_method: toPlainText(input.payment_method),
    payment_status: toPlainText(input.payment_status || "pending"),
    order_status,
    status: order_status,
    notes: String(input.notes || ""),
    note: String(input.notes || ""),
    rider_name: toPlainText(input.rider_name),
    rider_phone: normalizePhoneNumber(input.rider_phone),
    estimated_delivery: input.estimated_delivery || null,
    delivered_at: input.delivered_at || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin.from("orders").insert(payload).select("*").single();

  if (error) {
    throw error;
  }

  return normalizeManagedOrder(data as Record<string, unknown>);
}

export async function updateManagedOrder(
  id: string,
  input: Partial<OrderInsertInput>,
) {
  const supabaseAdmin = getSupabaseAdmin();
  const currentOrders = await getManagedOrders();
  const currentOrder = currentOrders.find((order) => order.id === id);

  if (!currentOrder) {
    throw new Error("Order not found");
  }

  const total_amount =
    input.total_amount !== undefined ? Math.max(0, Number(input.total_amount || 0)) : currentOrder.total_amount;
  const designer_cost =
    input.designer_cost !== undefined ? Math.max(0, Number(input.designer_cost || 0)) : currentOrder.designer_cost;
  const nextStatus =
    input.order_status !== undefined ? normalizeOrderStatus(input.order_status) : currentOrder.order_status;

  const payload = {
    customer_name:
      input.customer_name !== undefined ? toPlainText(input.customer_name) : currentOrder.customer_name,
    customer_phone:
      input.customer_phone !== undefined ? normalizePhoneNumber(input.customer_phone) : currentOrder.customer_phone,
    customer_location:
      input.customer_location !== undefined
        ? toPlainText(input.customer_location)
        : currentOrder.customer_location || "",
    items: input.items !== undefined ? input.items : currentOrder.items,
    total_amount,
    designer_cost,
    profit: calculateProfit(total_amount, designer_cost),
    order_total: total_amount,
    total_profit: Math.max(0, calculateProfit(total_amount, designer_cost)),
    payment_method:
      input.payment_method !== undefined ? toPlainText(input.payment_method) : currentOrder.payment_method || "",
    payment_status:
      input.payment_status !== undefined ? toPlainText(input.payment_status) : currentOrder.payment_status || "pending",
    order_status: nextStatus,
    status: nextStatus,
    notes: input.notes !== undefined ? String(input.notes || "") : currentOrder.notes || "",
    note: input.notes !== undefined ? String(input.notes || "") : currentOrder.notes || "",
    rider_name: input.rider_name !== undefined ? toPlainText(input.rider_name) : currentOrder.rider_name || "",
    rider_phone:
      input.rider_phone !== undefined ? normalizePhoneNumber(input.rider_phone) : currentOrder.rider_phone || "",
    estimated_delivery:
      input.estimated_delivery !== undefined ? input.estimated_delivery || null : currentOrder.estimated_delivery || null,
    delivered_at:
      nextStatus === "delivered"
        ? currentOrder.delivered_at || new Date().toISOString()
        : input.delivered_at !== undefined
          ? input.delivered_at || null
          : currentOrder.delivered_at || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin.from("orders").update(payload).eq("id", id).select("*").single();

  if (error) {
    throw error;
  }

  return normalizeManagedOrder(data as Record<string, unknown>);
}

export async function getOrderWhatsappMessage(order: ManagedOrder) {
  const templates = await getWhatsappTemplates();
  const message = buildStatusMessage(order, templates, {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  });

  await logWhatsappEvent({
    eventType: `order_${order.order_status}`,
    templateKey: message.templateKey,
    orderId: order.order_id,
    recipientPhone: order.customer_phone,
    message: message.message,
  });

  return message;
}
