const LEGACY_STATUS_MAP = {
  pending: "new",
  confirmed: "confirmed",
  completed: "delivered",
  cancelled: "cancelled",
};

export const WA_ORDER_STATUS_FLOW = [
  "new",
  "seen",
  "confirmed",
  "paid",
  "dispatched",
  "delivered",
  "cancelled",
];

export const WA_ORDER_STATUS_META = {
  new: {
    label: "New",
    cls: "admin-pill--pending",
    tone: "new",
    description: "Fresh from checkout",
  },
  seen: {
    label: "Seen",
    cls: "admin-pill--card",
    tone: "seen",
    description: "Reviewed by admin",
  },
  confirmed: {
    label: "Confirmed",
    cls: "admin-pill--mpesa",
    tone: "confirm",
    description: "Customer order confirmed",
  },
  paid: {
    label: "Paid",
    cls: "admin-pill--mpesa",
    tone: "complete",
    description: "Payment received",
  },
  dispatched: {
    label: "Dispatched",
    cls: "admin-pill--card",
    tone: "dispatch",
    description: "Sent out for delivery",
  },
  delivered: {
    label: "Delivered",
    cls: "admin-pill--completed",
    tone: "complete",
    description: "Order completed",
  },
  cancelled: {
    label: "Cancelled",
    cls: "admin-pill--failed",
    tone: "cancel",
    description: "Order cancelled",
  },
};

export const FULFILLMENT_TYPE_META = {
  ready_to_ship: { label: "Ready to Ship" },
  made_to_order: { label: "Made to Order" },
  custom_order: { label: "Custom Order" },
};

const STATUS_TIMESTAMP_MAP = {
  seen: "seenAt",
  confirmed: "confirmedAt",
  paid: "paidAt",
  dispatched: "dispatchedAt",
  delivered: "deliveredAt",
  cancelled: "cancelledAt",
};

function compact(value) {
  return String(value || "").trim();
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeWaOrderStatus(status) {
  const raw = compact(status).toLowerCase();
  return LEGACY_STATUS_MAP[raw] || (WA_ORDER_STATUS_FLOW.includes(raw) ? raw : "new");
}

export function getWaOrderStatusMeta(status) {
  return WA_ORDER_STATUS_META[normalizeWaOrderStatus(status)] || WA_ORDER_STATUS_META.new;
}

export function normalizeFulfillmentType(value) {
  const raw = compact(value).toLowerCase();
  if (raw === "made_to_order") return "made_to_order";
  if (raw === "custom_order") return "custom_order";
  return "ready_to_ship";
}

export function getFulfillmentTypeMeta(value) {
  return FULFILLMENT_TYPE_META[normalizeFulfillmentType(value)] || FULFILLMENT_TYPE_META.ready_to_ship;
}

export function buildOrderReference(id, timestamp = new Date().toISOString()) {
  const stamp = compact(timestamp).replace(/[^0-9]/g, "").slice(2, 10) || Date.now().toString().slice(-8);
  const suffix = compact(id).replace(/^wa_?/i, "").slice(-4) || Date.now().toString().slice(-4);
  return `SC-WA-${stamp}-${suffix}`;
}

export function normalizeWaOrder(order) {
  const timestamp = compact(order?.timestamp) || new Date().toISOString();
  const status = normalizeWaOrderStatus(order?.status);
  const subtotal = toNumber(order?.subtotal, 0);
  const delivery = toNumber(order?.delivery, 300);
  const total = toNumber(order?.total, subtotal + delivery);

  return {
    id: compact(order?.id) || `wa_${Date.now()}`,
    orderReference: compact(order?.orderReference) || buildOrderReference(order?.id, timestamp),
    timestamp,
    updatedAt: compact(order?.updatedAt) || timestamp,
    name: compact(order?.name),
    phone: compact(order?.phone),
    area: compact(order?.area),
    items: Array.isArray(order?.items) ? order.items : [],
    subtotal,
    delivery,
    total,
    status,
    source: compact(order?.source) || "checkout",
    fulfillmentType: normalizeFulfillmentType(order?.fulfillmentType),
    productionNote: compact(order?.productionNote),
    customRequest: order?.customRequest && typeof order.customRequest === "object" ? {
      designType: compact(order.customRequest.designType),
      colors: compact(order.customRequest.colors),
      occasion: compact(order.customRequest.occasion),
      budgetRange: compact(order.customRequest.budgetRange),
      neededBy: compact(order.customRequest.neededBy),
      designBrief: compact(order.customRequest.designBrief),
      referenceImage: compact(order.customRequest.referenceImage),
    } : null,
    note: compact(order?.note),
    seenAt: compact(order?.seenAt),
    confirmedAt: compact(order?.confirmedAt),
    paidAt: compact(order?.paidAt),
    dispatchedAt: compact(order?.dispatchedAt),
    deliveredAt: compact(order?.deliveredAt),
    cancelledAt: compact(order?.cancelledAt),
    lastContactAt: compact(order?.lastContactAt),
  };
}

export function normalizeWaOrders(orders) {
  const list = Array.isArray(orders) ? orders : [];
  return list
    .map(normalizeWaOrder)
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
}

export function updateWaOrder(order, patch) {
  const current = normalizeWaOrder(order);
  const next = {
    ...current,
    ...patch,
  };
  const now = new Date().toISOString();

  if (patch.status) {
    const normalizedStatus = normalizeWaOrderStatus(patch.status);
    next.status = normalizedStatus;
    const timestampKey = STATUS_TIMESTAMP_MAP[normalizedStatus];
    if (timestampKey && !next[timestampKey]) {
      next[timestampKey] = now;
    }
    if (normalizedStatus !== "new" && !next.seenAt) {
      next.seenAt = now;
    }
  }

  next.updatedAt = now;
  return normalizeWaOrder(next);
}

function normalizePhoneForWhatsApp(phone) {
  const digits = compact(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

export function buildOrderWhatsAppHref(order, message) {
  const digits = normalizePhoneForWhatsApp(order?.phone);
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function buildAdminWhatsAppMessage(order, variant = "seen") {
  const normalized = normalizeWaOrder(order);
  const name = normalized.name || "there";
  const ref = normalized.orderReference;
  const fulfillmentNote =
    normalized.fulfillmentType === "made_to_order"
      ? " This piece is made after confirmation, so we will confirm the production timeline with you."
      : normalized.fulfillmentType === "custom_order"
        ? " This is a custom design request, so we will confirm your design details, timeline, and next step with you."
        : "";

  if (variant === "confirmed") {
    return `Hello ${name}, your SharonCraft order ${ref} has been confirmed.${fulfillmentNote} We are preparing the next step and will update you shortly.`;
  }
  if (variant === "paid") {
    return `Hello ${name}, payment for your SharonCraft order ${ref} has been received. Thank you.${fulfillmentNote} We will share dispatch details as soon as the order is ready.`;
  }
  if (variant === "dispatched") {
    return `Hello ${name}, your SharonCraft order ${ref} has been dispatched and is on the way.`;
  }
  if (variant === "delivered") {
    return `Hello ${name}, your SharonCraft order ${ref} has been marked delivered. Thank you for shopping with SharonCraft.`;
  }
  return `Hello ${name}, we have seen your SharonCraft order ${ref}.${fulfillmentNote} We will follow up with you shortly.`;
}
