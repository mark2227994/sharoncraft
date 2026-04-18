export const CUSTOM_ORDER_STATUS_OPTIONS = [
  "inquiry",
  "quoted",
  "waiting_deposit",
  "deposit_received",
  "in_production",
  "ready",
  "balance_received",
  "delivered",
  "completed",
  "cancelled",
];

export const CUSTOM_ORDER_STATUS_META = {
  inquiry: { label: "Inquiry", cls: "admin-pill--pending" },
  quoted: { label: "Quoted", cls: "admin-pill--card" },
  waiting_deposit: { label: "Waiting Deposit", cls: "admin-pill--pending" },
  deposit_received: { label: "Deposit Received", cls: "admin-pill--mpesa" },
  in_production: { label: "In Production", cls: "admin-pill--card" },
  ready: { label: "Ready", cls: "admin-pill--card" },
  balance_received: { label: "Balance Received", cls: "admin-pill--mpesa" },
  delivered: { label: "Delivered", cls: "admin-pill--completed" },
  completed: { label: "Completed", cls: "admin-pill--completed" },
  cancelled: { label: "Cancelled", cls: "admin-pill--failed" },
};

function compact(value) {
  return String(value || "").trim();
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function normalizeCustomOrderStatus(value) {
  const raw = compact(value).toLowerCase();
  return CUSTOM_ORDER_STATUS_OPTIONS.includes(raw) ? raw : "inquiry";
}

export function getCustomOrderStatusMeta(value) {
  return CUSTOM_ORDER_STATUS_META[normalizeCustomOrderStatus(value)] || CUSTOM_ORDER_STATUS_META.inquiry;
}

export function calculateCustomOrderMetrics(order) {
  const clientTotal = toNumber(order?.clientTotal);
  const customerDeliveryCharge = toNumber(order?.customerDeliveryCharge);
  const customerDepositPaid = toNumber(order?.customerDepositPaid);
  const customerBalancePaid = toNumber(order?.customerBalancePaid);
  const designerTotalPay = toNumber(order?.designerTotalPay);
  const designerDepositPaid = toNumber(order?.designerDepositPaid);
  const designerBalancePaid = toNumber(order?.designerBalancePaid);
  const packagingCost = toNumber(order?.packagingCost);
  const deliveryCost = toNumber(order?.deliveryCost);

  const customerPaymentsReceived = customerDepositPaid + customerBalancePaid;
  const customerBalanceDue = Math.max(clientTotal - customerPaymentsReceived, 0);
  const designerPaymentsSent = designerDepositPaid + designerBalancePaid;
  const designerBalanceDue = Math.max(designerTotalPay - designerPaymentsSent, 0);
  const expectedProfit = clientTotal + customerDeliveryCharge - designerTotalPay - packagingCost - deliveryCost;
  const realizedCashProfit =
    customerPaymentsReceived + customerDeliveryCharge - designerPaymentsSent - packagingCost - deliveryCost;

  return {
    customerPaymentsReceived,
    customerBalanceDue,
    designerPaymentsSent,
    designerBalanceDue,
    expectedProfit,
    realizedCashProfit,
  };
}

export function normalizeCustomOrder(order) {
  const createdAt = compact(order?.createdAt) || new Date().toISOString();
  const normalized = {
    id: compact(order?.id) || `co_${Date.now()}`,
    createdAt,
    updatedAt: compact(order?.updatedAt) || createdAt,
    customerName: compact(order?.customerName),
    customerPhone: compact(order?.customerPhone),
    orderName: compact(order?.orderName),
    quantity: Math.max(1, toNumber(order?.quantity, 1)),
    clientTotal: toNumber(order?.clientTotal),
    customerDeliveryCharge: toNumber(order?.customerDeliveryCharge),
    customerDepositRequired: toNumber(order?.customerDepositRequired),
    customerDepositPaid: toNumber(order?.customerDepositPaid),
    customerDepositPaidAt: compact(order?.customerDepositPaidAt),
    customerBalancePaid: toNumber(order?.customerBalancePaid),
    customerBalancePaidAt: compact(order?.customerBalancePaidAt),
    designerName: compact(order?.designerName),
    designerTotalPay: toNumber(order?.designerTotalPay),
    designerDepositRequired: toNumber(order?.designerDepositRequired),
    designerDepositPaid: toNumber(order?.designerDepositPaid),
    designerDepositPaidAt: compact(order?.designerDepositPaidAt),
    designerBalancePaid: toNumber(order?.designerBalancePaid),
    designerBalancePaidAt: compact(order?.designerBalancePaidAt),
    packagingCost: toNumber(order?.packagingCost),
    packagingPaidAt: compact(order?.packagingPaidAt),
    deliveryCost: toNumber(order?.deliveryCost),
    deliveryPaidAt: compact(order?.deliveryPaidAt),
    dueDate: compact(order?.dueDate),
    status: normalizeCustomOrderStatus(order?.status),
    notes: compact(order?.notes),
  };

  return { ...normalized, ...calculateCustomOrderMetrics(normalized) };
}

export function normalizeCustomOrders(orders) {
  const list = Array.isArray(orders) ? orders : [];
  return list
    .map(normalizeCustomOrder)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}
