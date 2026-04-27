"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type OrderItem = {
  product_id?: string;
  name?: string;
  quantity?: number;
  price?: number;
  image?: string;
};

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

type OrderRecord = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_location: string | null;
  customer_whatsapp: string | null;
  items: OrderItem[] | null;
  total_amount: number;
  payment_method: string | null;
  payment_status: string | null;
  order_status: OrderStatus;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
};

const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusTone: Record<OrderStatus, string> = {
  pending: "bg-[#fef3cd] text-[#856404]",
  processing: "bg-[#cfe2ff] text-[#084298]",
  shipped: "bg-[#e8d5ff] text-[#5b21b6]",
  delivered: "bg-[#d1f0da] text-[#166534]",
  cancelled: "bg-[#fde8e8] text-[#C0392B]",
};

function formatCurrency(amount: number) {
  return `KES ${Number(amount || 0).toLocaleString("en-KE")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function sanitizePhone(phone: string | null) {
  return String(phone || "").replace(/\D/g, "");
}

function buildWhatsAppMessage(order: OrderRecord) {
  const itemLines = (order.items || []).length
    ? (order.items || [])
        .map((item) => `- ${item.name || "Item"} x${item.quantity || 1}`)
        .join("\n")
    : "- Your SharonCraft piece";

  return [
    `Hi ${order.customer_name} 👋 Thank you for your SharonCraft order!`,
    "",
    "Your order:",
    itemLines,
    "",
    `Total: ${formatCurrency(order.total_amount)}`,
    "",
    "Kindly confirm your delivery address and preferred payment method (M-Pesa / Cash on Delivery).",
    "",
    "We will process your order within 24 hours. 🙏",
    "",
    "— SharonCraft",
  ].join("\n");
}

function buildWhatsAppHref(order: OrderRecord) {
  const phone = sanitizePhone(order.customer_whatsapp || order.customer_phone);
  if (!phone) return "#";
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage(order))}`;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = typeof params?.id === "string" ? params.id : "";
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusDraft, setStatusDraft] = useState<OrderStatus>("pending");
  const [trackingDraft, setTrackingDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    if (!orderId) return;
    void loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (!order) return;
    setStatusDraft(order.order_status);
    setTrackingDraft(order.tracking_number || "");
    setNoteDraft(order.notes || "");
  }, [order]);

  async function loadOrder() {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("orders")
      .select(
        "id, customer_name, customer_phone, customer_email, customer_location, customer_whatsapp, items, total_amount, payment_method, payment_status, order_status, tracking_number, notes, created_at",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (queryError || !data) {
      setError(queryError?.message || "Order not found.");
      setLoading(false);
      return;
    }

    setOrder({
      ...(data as OrderRecord),
      items: Array.isArray(data.items) ? (data.items as OrderItem[]) : [],
    });
    setLoading(false);
  }

  async function saveChanges() {
    if (!order) return;
    setSaving(true);
    setError("");

    const { data, error: updateError } = await supabase
      .from("orders")
      .update({
        order_status: statusDraft,
        tracking_number: trackingDraft.trim() || null,
        notes: noteDraft.trim() || null,
      })
      .eq("id", order.id)
      .select(
        "id, customer_name, customer_phone, customer_email, customer_location, customer_whatsapp, items, total_amount, payment_method, payment_status, order_status, tracking_number, notes, created_at",
      )
      .single();

    if (updateError || !data) {
      setError(updateError?.message || "Could not save order.");
      setSaving(false);
      return;
    }

    setOrder({
      ...(data as OrderRecord),
      items: Array.isArray(data.items) ? (data.items as OrderItem[]) : [],
    });
    setSaving(false);
  }

  const timeline = useMemo(() => {
    const currentIndex = STATUS_FLOW.indexOf(statusDraft);
    return [
      {
        label: "Placed",
        active: true,
        detail: order?.created_at ? formatDate(order.created_at) : "",
      },
      ...STATUS_FLOW.map((status, index) => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        active:
          statusDraft === "cancelled"
            ? status === "cancelled"
            : index <= currentIndex && status !== "cancelled",
        detail:
          status === statusDraft
            ? status === "shipped" && trackingDraft.trim()
              ? `Tracking: ${trackingDraft.trim()}`
              : "Current stage"
            : "",
      })),
    ];
  }, [order?.created_at, statusDraft, trackingDraft]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse bg-[#fafaf8]" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-72 animate-pulse rounded-[2px] border border-[#f0f0f0] bg-white" />
          <div className="h-72 animate-pulse rounded-[2px] border border-[#f0f0f0] bg-white" />
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-6">
        <p className="text-[12px] text-[#C0392B]">Could not load this order.</p>
        <p className="mt-2 text-[11px] text-[#555]">{error}</p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => void loadOrder()}
            className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555]"
          >
            Retry
          </button>
          <Link
            href="/admin/orders"
            className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555]"
          >
            Back to orders
          </Link>
        </div>
      </section>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Order Detail</p>
          <h2 className="mt-2 text-[13px] font-medium text-[#1c1c1c]">
            #SC-{order.id.slice(0, 8).toUpperCase()}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555]"
          >
            Back to orders
          </button>
          <a
            href={buildWhatsAppHref(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center rounded-[2px] bg-[#25D366] px-4 text-[11px] uppercase tracking-[1px] text-white"
          >
            WhatsApp customer
          </a>
        </div>
      </section>

      {error ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
          <p className="text-[11px] text-[#C0392B]">{error}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Customer</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Name</p>
                <p className="mt-2 text-[12px] text-[#1c1c1c]">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Phone</p>
                <p className="mt-2 text-[12px] text-[#1c1c1c]">
                  {order.customer_phone || order.customer_whatsapp || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Email</p>
                <p className="mt-2 text-[12px] text-[#1c1c1c]">{order.customer_email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Location</p>
                <p className="mt-2 text-[12px] text-[#1c1c1c]">{order.customer_location || "Not provided"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Items</p>
            <div className="mt-4 space-y-3">
              {(order.items || []).length ? (
                (order.items || []).map((item, index) => (
                  <div
                    key={`${order.id}-${item.product_id || item.name || index}`}
                    className="flex items-center gap-3 border border-[#f0f0f0] p-3"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-[2px] bg-[#f4f4f2]">
                      {item.image ? (
                        <img src={item.image} alt={item.name || "Order item"} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#1c1c1c]">{item.name || "Item"}</p>
                      <p className="mt-1 text-[10px] text-[#999]">
                        Qty {item.quantity || 1}
                        {item.price ? ` · ${formatCurrency(item.price)}` : ""}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#1c1c1c]">
                      {formatCurrency((item.price || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-[#555]">No line items were stored for this order.</p>
              )}
            </div>
          </section>

          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Order Timeline</p>
            <div className="mt-4 space-y-3">
              {timeline.map((step) => (
                <div
                  key={step.label}
                  className={[
                    "flex items-start gap-3 border p-3",
                    step.active ? "border-[#8B5E3C] bg-[#fafaf8]" : "border-[#f0f0f0] bg-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mt-[2px] inline-block h-2.5 w-2.5 rounded-full",
                      step.active ? "bg-[#8B5E3C]" : "bg-[#d9d9d5]",
                    ].join(" ")}
                  />
                  <div>
                    <p className="text-[11px] uppercase tracking-[1px] text-[#1c1c1c]">{step.label}</p>
                    {step.detail ? (
                      <p className="mt-1 text-[10px] text-[#999]">{step.detail}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Status</p>
            <div className="mt-4">
              <span
                className={`inline-flex rounded-[2px] px-2 py-1 text-[10px] uppercase tracking-[1px] ${statusTone[statusDraft]}`}
              >
                {statusDraft}
              </span>
            </div>

            <label className="mt-4 block">
              <span className="text-[10px] uppercase tracking-[2px] text-[#999]">Workflow stage</span>
              <select
                value={statusDraft}
                onChange={(event) => setStatusDraft(event.target.value as OrderStatus)}
                className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
              >
                {STATUS_FLOW.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="text-[10px] uppercase tracking-[2px] text-[#999]">Tracking number</span>
              <input
                value={trackingDraft}
                onChange={(event) => setTrackingDraft(event.target.value)}
                placeholder="Add courier reference"
                className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-[10px] uppercase tracking-[2px] text-[#999]">Admin note</span>
              <textarea
                rows={5}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Add delivery notes, payment context, or follow-up details"
                className="mt-2 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 py-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
              />
            </label>

            <button
              type="button"
              onClick={() => void saveChanges()}
              disabled={saving}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[2px] bg-[#1c1c1c] text-[11px] uppercase tracking-[2px] text-white disabled:opacity-60"
            >
              {saving ? "Saving" : "Save Changes"}
            </button>
          </section>

          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Summary</p>
            <div className="mt-4 space-y-3 text-[11px] text-[#555]">
              <div className="flex items-center justify-between gap-3">
                <span>Order total</span>
                <span className="text-[#1c1c1c]">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Payment method</span>
                <span className="text-[#1c1c1c]">{order.payment_method || "Pending"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Payment status</span>
                <span className="text-[#1c1c1c]">{order.payment_status || "pending"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Created</span>
                <span className="text-[#1c1c1c]">{formatDate(order.created_at)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
