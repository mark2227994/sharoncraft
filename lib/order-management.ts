export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "in_production",
  "ready",
  "dispatched",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = [
  "M-Pesa",
  "Cash on Delivery",
  "Bank Transfer",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    textColor: string;
    publicLabel: string;
    step: number;
    templateKey: WhatsappTemplateKey;
  }
> = {
  pending: {
    label: "Pending",
    color: "#F59E0B",
    textColor: "#1c1c1c",
    publicLabel: "Order Received",
    step: 1,
    templateKey: "order_confirmation",
  },
  confirmed: {
    label: "Confirmed",
    color: "#1a56db",
    textColor: "#ffffff",
    publicLabel: "Confirmed",
    step: 2,
    templateKey: "deposit_request",
  },
  in_production: {
    label: "In Production",
    color: "#8B5E3C",
    textColor: "#ffffff",
    publicLabel: "In Production",
    step: 3,
    templateKey: "in_production",
  },
  ready: {
    label: "Ready",
    color: "#7B3F9E",
    textColor: "#ffffff",
    publicLabel: "Ready for Delivery",
    step: 4,
    templateKey: "ready",
  },
  dispatched: {
    label: "Dispatched",
    color: "#E67E22",
    textColor: "#ffffff",
    publicLabel: "Dispatched",
    step: 5,
    templateKey: "dispatched",
  },
  delivered: {
    label: "Delivered",
    color: "#2E7D32",
    textColor: "#ffffff",
    publicLabel: "Delivered",
    step: 6,
    templateKey: "delivered",
  },
  cancelled: {
    label: "Cancelled",
    color: "#C0392B",
    textColor: "#ffffff",
    publicLabel: "Cancelled",
    step: 0,
    templateKey: "cancelled",
  },
};

export const PUBLIC_TRACKING_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "in_production",
  "ready",
  "dispatched",
  "delivered",
];

export const WHATSAPP_TEMPLATE_KEYS = [
  "order_confirmation",
  "deposit_request",
  "in_production",
  "ready",
  "dispatched",
  "delivered",
  "delay",
  "cancelled",
] as const;

export type WhatsappTemplateKey = (typeof WHATSAPP_TEMPLATE_KEYS)[number];

export type WhatsappTemplateRecord = {
  id?: string;
  template_key: WhatsappTemplateKey;
  name: string;
  body: string;
  description: string;
  created_at?: string;
  updated_at?: string;
};

export type ManagedOrderItem = {
  product_id?: string | null;
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
};

export type ManagedOrder = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_location: string | null;
  items: ManagedOrderItem[];
  total_amount: number;
  designer_cost: number;
  profit: number;
  payment_method: string | null;
  payment_status: string | null;
  order_status: OrderStatus;
  notes: string | null;
  rider_name: string | null;
  rider_phone: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at?: string | null;
};

export const DEFAULT_WHATSAPP_TEMPLATES: WhatsappTemplateRecord[] = [
  {
    template_key: "order_confirmation",
    name: "Order Confirmation",
    description: "Sent when an order is created or returned to pending.",
    body:
      "Hi {{name}} 👋 Thank you for your order!\n\nI can confirm your pieces are available:\n\n{{items}}\n\nTotal: {{total}}\nPayment: {{payment_method}}\n\nPlease share:\n1. Delivery location\n2. Preferred delivery time\n3. Contact number for rider\n\n— Sharon | SharonCraft 💎",
  },
  {
    template_key: "deposit_request",
    name: "Deposit Request",
    description: "Sent when the order is confirmed and a deposit is needed.",
    body:
      "Hi {{name}} 😊\n\nTo confirm your order {{order_id}}\nI require a 50% deposit of\n{{deposit_amount}}.\n\nM-Pesa: {{mpesa_number}}\nName: Sharon\n\nOnce received I begin your\norder immediately 🙏\n\n— SharonCraft 💎",
  },
  {
    template_key: "in_production",
    name: "In Production",
    description: "Sent when the artisan starts working on the order.",
    body:
      "Hi {{name}} 👋 Great news!\n\nYour order {{order_id}} is now\nin production with our artisan.\n\nEstimated ready date: {{date}}\n\nI will send you photos as soon\nas it is complete 💎\n\n— Sharon | SharonCraft",
  },
  {
    template_key: "ready",
    name: "Ready",
    description: "Sent when the order is complete and ready for delivery.",
    body:
      "Hi {{name}} ✨ Your piece is ready!\n\n[Attach photos before sending]\n\n{{items}} ✓\n\nBalance due on delivery: {{balance}}\n\nReady to arrange delivery —\nwhat time works best for you? 😊\n\n— Sharon | SharonCraft 💎",
  },
  {
    template_key: "dispatched",
    name: "Dispatched",
    description: "Sent when the rider is on the way.",
    body:
      "Hi {{name}} 🚀 Your order is\non the way!\n\nRider: {{rider}}\nContact: {{rider_phone}}\nETA: {{eta}}\n\nPlease have {{total}} ready\nif paying cash on delivery.\n\nTrack your order:\n{{track_url}}\n\n— SharonCraft 💎",
  },
  {
    template_key: "delivered",
    name: "Delivered",
    description: "Sent after successful delivery.",
    body:
      "Hi {{name}} 🙏 Thank you so much!\n\nWe hope you love your pieces 💎\n\nIf you are happy please leave\nus a review — it helps us grow:\nsharoncraft.co.ke\n\nTag us on Instagram @sharoncraft\nto show off your pieces! 📸\n\n— Sharon | SharonCraft",
  },
  {
    template_key: "delay",
    name: "Delay",
    description: "Manual delay update template editable from settings.",
    body:
      "Hi {{name}} 🙏 I sincerely\napologize for the delay on\nyour order {{order_id}}.\n\nNew expected date: {{date}}\n\nThank you for your patience —\nI promise it will be worth\nthe wait 💎\n\n— Sharon | SharonCraft",
  },
  {
    template_key: "cancelled",
    name: "Cancelled",
    description: "Sent when an order is cancelled.",
    body:
      "Hi {{name}},\n\nYour order {{order_id}} has been cancelled.\nIf you would like, we can help you place a new order for:\n{{items}}\n\nPlease message us if you need any help.\n\n— Sharon | SharonCraft 💎",
  },
];

export function normalizePhoneNumber(value: unknown) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if ((digits.startsWith("7") || digits.startsWith("1")) && digits.length === 9) return `254${digits}`;
  return digits;
}

export function formatKes(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function calculateProfit(totalAmount: number | string, designerCost: number | string) {
  const total = Number(totalAmount || 0);
  const designer = Number(designerCost || 0);
  return total - designer;
}

export function getOrderFirstName(name: string | null | undefined) {
  return String(name || "").trim().split(/\s+/).filter(Boolean)[0] || "there";
}

export function getItemsSummary(items: ManagedOrderItem[] | null | undefined) {
  return Array.isArray(items)
    ? items
        .filter((item) => item?.name)
        .map((item) => `${item.name} x${Math.max(1, Number(item.quantity || 1))}`)
        .join("\n")
    : "";
}

export function getOrderBalance(order: Pick<ManagedOrder, "total_amount" | "payment_method">) {
  if (String(order.payment_method || "").toLowerCase() === "cash on delivery") {
    return Number(order.total_amount || 0);
  }
  return Math.max(0, Number(order.total_amount || 0) - Number(order.total_amount || 0) * 0.5);
}

export function buildTrackOrderUrl(orderId: string, phone: string, siteUrl?: string) {
  const baseUrl = String(siteUrl || "").trim().replace(/\/$/, "");
  const searchParams = new URLSearchParams({
    order: orderId,
    phone,
  });
  return `${baseUrl || "https://sharoncraft.co.ke"}/track-order?${searchParams.toString()}`;
}

export function buildTemplateVariables(
  order: ManagedOrder,
  extras?: {
    siteUrl?: string;
    whatsappNumber?: string;
    eta?: string | null;
  },
) {
  const normalizedPhone = normalizePhoneNumber(order.customer_phone);
  return {
    name: getOrderFirstName(order.customer_name),
    order_id: order.order_id,
    items: getItemsSummary(order.items),
    total: formatKes(order.total_amount),
    date: order.estimated_delivery || "To be confirmed",
    rider: order.rider_name || "To be assigned",
    rider_phone: order.rider_phone || "To be shared",
    track_url: buildTrackOrderUrl(order.order_id, normalizedPhone, extras?.siteUrl),
    payment_method: order.payment_method || "To be confirmed",
    deposit_amount: formatKes(Number(order.total_amount || 0) * 0.5),
    mpesa_number: extras?.whatsappNumber || "",
    balance: formatKes(getOrderBalance(order)),
    eta: extras?.eta || order.estimated_delivery || "To be confirmed",
  };
}

export function renderTemplate(templateBody: string, variables: Record<string, string>) {
  return Object.entries(variables).reduce((message, [key, value]) => {
    return message.split(`{{${key}}}`).join(value || "");
  }, templateBody);
}

export function getTemplateByKey(
  templates: WhatsappTemplateRecord[] | null | undefined,
  key: WhatsappTemplateKey,
) {
  const matched = Array.isArray(templates) ? templates.find((template) => template.template_key === key) : null;
  return matched || DEFAULT_WHATSAPP_TEMPLATES.find((template) => template.template_key === key) || null;
}

export function buildWhatsAppUrl(recipientPhone: string, message: string) {
  const phone = normalizePhoneNumber(recipientPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildStatusMessage(
  order: ManagedOrder,
  templates: WhatsappTemplateRecord[] | null | undefined,
  extras?: {
    siteUrl?: string;
    whatsappNumber?: string;
    eta?: string | null;
  },
) {
  const statusMeta = ORDER_STATUS_META[order.order_status] || ORDER_STATUS_META.pending;
  const template = getTemplateByKey(templates, statusMeta.templateKey);
  const variables = buildTemplateVariables(order, extras);
  const message = renderTemplate(template?.body || "", variables);
  return {
    templateKey: statusMeta.templateKey,
    message,
    whatsappUrl: buildWhatsAppUrl(order.customer_phone, message),
  };
}

export function normalizeOrderStatus(value: unknown): OrderStatus {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "in production") return "in_production";
  if (raw === "processing") return "in_production";
  if (raw === "shipped") return "dispatched";
  if (raw === "new") return "pending";
  return ORDER_STATUSES.includes(raw as OrderStatus) ? (raw as OrderStatus) : "pending";
}

export function normalizeManagedOrder(order: Record<string, unknown>): ManagedOrder {
  const items = Array.isArray(order.items) ? (order.items as ManagedOrderItem[]) : [];
  const totalAmount = Number(order.total_amount || order.order_total || 0);
  const designerCost = Number(order.designer_cost || 0);
  return {
    id: String(order.id || ""),
    order_id: String(order.order_id || order.id || ""),
    customer_name: String(order.customer_name || ""),
    customer_phone: String(order.customer_phone || ""),
    customer_location: order.customer_location ? String(order.customer_location) : "",
    items,
    total_amount: totalAmount,
    designer_cost: designerCost,
    profit:
      order.profit !== undefined && order.profit !== null
        ? Number(order.profit)
        : calculateProfit(totalAmount, designerCost),
    payment_method: order.payment_method ? String(order.payment_method) : "",
    payment_status: order.payment_status ? String(order.payment_status) : "pending",
    order_status: normalizeOrderStatus(order.order_status),
    notes: order.notes ? String(order.notes) : order.note ? String(order.note) : "",
    rider_name: order.rider_name ? String(order.rider_name) : "",
    rider_phone: order.rider_phone ? String(order.rider_phone) : "",
    estimated_delivery: order.estimated_delivery ? String(order.estimated_delivery) : "",
    delivered_at: order.delivered_at ? String(order.delivered_at) : "",
    created_at: String(order.created_at || new Date().toISOString()),
    updated_at: order.updated_at ? String(order.updated_at) : "",
  };
}
