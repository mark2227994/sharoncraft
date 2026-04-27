"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type OrderItem = {
  product_id?: string;
  name?: string;
  quantity?: number;
  price?: number;
  image?: string;
};

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

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type FilterTab = "all" | OrderStatus;

const FILTER_TABS: FilterTab[] = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];
const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusStyles: Record<OrderStatus, string> = {
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

function cleanPhone(rawPhone: string | null) {
  return String(rawPhone || "").replace(/\D/g, "");
}

function buildItemsText(items: OrderItem[] | null) {
  const safeItems = items || [];
  if (!safeItems.length) return "No items";

  return safeItems
    .map((item) => `${item.name || "Item"} x${item.quantity || 1}`)
    .join(", ");
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
  const phone = cleanPhone(order.customer_whatsapp || order.customer_phone);
  if (!phone) return "#";
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage(order))}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [workingId, setWorkingId] = useState("");

  useEffect(() => {
    void loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("orders")
      .select(
        "id, customer_name, customer_phone, customer_email, customer_location, customer_whatsapp, items, total_amount, payment_method, payment_status, order_status, tracking_number, notes, created_at",
      )
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    setOrders(((data || []) as OrderRecord[]).map((order) => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : [],
    })));
    setLoading(false);
  }

  async function updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
    setWorkingId(orderId);

    const { error: updateError } = await supabase
      .from("orders")
      .update({ order_status: nextStatus })
      .eq("id", orderId);

    if (updateError) {
      setError(updateError.message);
      setWorkingId("");
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, order_status: nextStatus } : order,
      ),
    );
    setWorkingId("");
  }

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.order_status === filter);
  }, [filter, orders]);

  const hasOrders = filteredOrders.length > 0;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[2px] text-[#999]">WhatsApp First</p>
          <p className="mt-2 text-[12px] text-[#555]">
            Open the customer conversation fast, then keep order status precise.
          </p>
        </div>
        <p className="text-[11px] text-[#555]">{orders.length} orders total</p>
      </section>

      <section className="overflow-x-auto rounded-[2px] border border-[#f0f0f0] bg-white">
        <div className="flex min-w-max gap-2 p-3">
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab;
            const count =
              tab === "all"
                ? orders.length
                : orders.filter((order) => order.order_status === tab).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={[
                  "inline-flex h-9 items-center rounded-[2px] border px-3 text-[11px] uppercase tracking-[1px] transition-all duration-200 ease-in-out",
                  isActive
                    ? "border-[#1c1c1c] bg-[#1c1c1c] text-white"
                    : "border-[#e0e0e0] bg-white text-[#555] hover:bg-[#fafaf8]",
                ].join(" ")}
              >
                {tab === "all" ? "All" : tab}
                <span className="ml-2 text-[10px] opacity-80">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {loading ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse bg-[#fafaf8]" />
            ))}
          </div>
        </section>
      ) : error ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-6">
          <p className="text-[12px] text-[#C0392B]">Could not load orders.</p>
          <p className="mt-2 text-[11px] text-[#555]">{error}</p>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="mt-4 inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555]"
          >
            Retry
          </button>
        </section>
      ) : !hasOrders ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-6">
          <p className="text-[12px] text-[#1c1c1c]">No orders in this view yet.</p>
          <p className="mt-2 text-[11px] text-[#555]">
            New orders will appear here once customers place them on the public website.
          </p>
        </section>
      ) : (
        <>
          <section className="hidden overflow-x-auto rounded-[2px] border border-[#f0f0f0] bg-white lg:block">
            <table className="min-w-full">
              <thead className="bg-[#fafafa]">
                <tr className="text-left text-[9px] uppercase tracking-[2px] text-[#999]">
                  <th className="px-4 py-[10px]">Order ID</th>
                  <th className="px-4 py-[10px]">Customer + Phone</th>
                  <th className="px-4 py-[10px]">Items</th>
                  <th className="px-4 py-[10px]">Total</th>
                  <th className="px-4 py-[10px]">Status</th>
                  <th className="px-4 py-[10px]">Date</th>
                  <th className="px-4 py-[10px]">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#f0f0f0] text-[11px] text-[#555] transition-colors duration-200 ease-in-out hover:bg-[#fafaf8]"
                  >
                    <td className="px-4 py-[10px]">
                      <Link href={`/admin/orders/${order.id}`} className="text-[#1c1c1c]">
                        #SC-{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-[10px]">
                      <p className="text-[12px] text-[#1c1c1c]">{order.customer_name}</p>
                      <p className="mt-1 text-[10px] text-[#999]">
                        {order.customer_phone || order.customer_whatsapp || "No phone"}
                      </p>
                    </td>
                    <td className="px-4 py-[10px]">{buildItemsText(order.items)}</td>
                    <td className="px-4 py-[10px] text-[#1c1c1c]">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-4 py-[10px]">
                      <select
                        value={order.order_status}
                        onChange={(event) =>
                          void updateOrderStatus(order.id, event.target.value as OrderStatus)
                        }
                        disabled={workingId === order.id}
                        className={[
                          "h-8 rounded-[2px] border-0 px-2 text-[10px] uppercase tracking-[1px] outline-none disabled:opacity-60",
                          statusStyles[order.order_status],
                        ].join(" ")}
                      >
                        {STATUS_FLOW.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-[10px]">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-[10px]">
                      <a
                        href={buildWhatsAppHref(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center rounded-[2px] bg-[#25D366] px-[10px] text-[10px] uppercase tracking-[1px] text-white transition-opacity duration-200 ease-in-out hover:opacity-90"
                      >
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="grid gap-4 lg:hidden">
            {filteredOrders.map((order) => (
              <article key={order.id} className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/admin/orders/${order.id}`} className="text-[12px] text-[#1c1c1c]">
                      #SC-{order.id.slice(0, 8).toUpperCase()}
                    </Link>
                    <p className="mt-2 text-[12px] text-[#1c1c1c]">{order.customer_name}</p>
                    <p className="mt-1 text-[10px] text-[#999]">
                      {order.customer_phone || order.customer_whatsapp || "No phone"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-[2px] px-2 py-1 text-[10px] uppercase tracking-[1px] ${statusStyles[order.order_status]}`}
                  >
                    {order.order_status}
                  </span>
                </div>

                <div className="mt-4 space-y-3 border-t border-[#f0f0f0] pt-4 text-[11px] text-[#555]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[#999]">Items</span>
                    <span className="max-w-[70%] text-right">{buildItemsText(order.items)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#999]">Total</span>
                    <span className="text-[#1c1c1c]">{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#999]">Date</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <select
                    value={order.order_status}
                    onChange={(event) =>
                      void updateOrderStatus(order.id, event.target.value as OrderStatus)
                    }
                    disabled={workingId === order.id}
                    className="h-9 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none focus:border-[#8B5E3C]"
                  >
                    {STATUS_FLOW.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-[2px] border border-[#e0e0e0] text-[11px] uppercase tracking-[1px] text-[#555]"
                    >
                      Open Order
                    </Link>
                    <a
                      href={buildWhatsAppHref(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center justify-center rounded-[2px] bg-[#25D366] text-[11px] uppercase tracking-[1px] text-white"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
