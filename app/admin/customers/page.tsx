"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type CustomerRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
};

type OrderRecord = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_whatsapp: string | null;
  total_amount: number;
  created_at: string;
};

type SortMode = "most-orders" | "most-spent" | "most-recent";

function formatCurrency(amount: number) {
  return `KES ${Number(amount || 0).toLocaleString("en-KE")}`;
}

function formatDate(value: string | null) {
  if (!value) return "No orders yet";
  return new Date(value).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function cleanPhone(value: string | null) {
  return String(value || "").replace(/\D/g, "");
}

function matchOrderToCustomer(order: OrderRecord, customer: CustomerRecord) {
  const emailMatch =
    customer.email &&
    order.customer_email &&
    customer.email.trim().toLowerCase() === order.customer_email.trim().toLowerCase();

  const phoneMatch =
    cleanPhone(customer.phone || customer.whatsapp) &&
    cleanPhone(order.customer_phone || order.customer_whatsapp) &&
    cleanPhone(customer.phone || customer.whatsapp) ===
      cleanPhone(order.customer_phone || order.customer_whatsapp);

  const nameMatch =
    customer.name.trim().toLowerCase() === order.customer_name.trim().toLowerCase();

  return Boolean(emailMatch || phoneMatch || nameMatch);
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("most-recent");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const [customersResult, ordersResult] = await Promise.all([
      supabase
        .from("customers")
        .select("id, name, email, phone, whatsapp, location, total_orders, total_spent, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("id, customer_name, customer_phone, customer_email, customer_whatsapp, total_amount, created_at")
        .order("created_at", { ascending: false }),
    ]);

    if (customersResult.error || ordersResult.error) {
      setError(customersResult.error?.message || ordersResult.error?.message || "Could not load customers.");
      setLoading(false);
      return;
    }

    setCustomers((customersResult.data || []) as CustomerRecord[]);
    setOrders((ordersResult.data || []) as OrderRecord[]);
    setLoading(false);
  }

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    const enriched = customers.map((customer) => {
      const customerOrders = orders.filter((order) => matchOrderToCustomer(order, customer));
      const lastOrder = customerOrders[0] || null;

      return {
        ...customer,
        ordersHistory: customerOrders,
        lastOrderAt: lastOrder?.created_at || null,
      };
    });

    const filtered = enriched.filter((customer) => {
      if (!query) return true;

      return [customer.name, customer.phone || "", customer.whatsapp || "", customer.email || ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    return filtered.sort((a, b) => {
      if (sortMode === "most-orders") {
        return Number(b.total_orders || 0) - Number(a.total_orders || 0);
      }

      if (sortMode === "most-spent") {
        return Number(b.total_spent || 0) - Number(a.total_spent || 0);
      }

      return new Date(b.lastOrderAt || b.created_at).getTime() - new Date(a.lastOrderAt || a.created_at).getTime();
    });
  }, [customers, orders, search, sortMode]);

  const selectedCustomer = useMemo(
    () => rows.find((customer) => customer.id === selectedCustomerId) || null,
    [rows, selectedCustomerId],
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Customer Database</p>
          <p className="mt-2 text-[12px] text-[#555]">
            Keep buyer contact details close to their order history and WhatsApp follow-up.
          </p>
        </div>
        <p className="text-[11px] text-[#555]">{customers.length} customers total</p>
      </section>

      <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or phone"
            className="h-9 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
          />
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="h-9 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
          >
            <option value="most-recent">Most recent</option>
            <option value="most-orders">Most orders</option>
            <option value="most-spent">Most spent</option>
          </select>
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
          <p className="text-[12px] text-[#C0392B]">Could not load customers.</p>
          <p className="mt-2 text-[11px] text-[#555]">{error}</p>
          <button
            type="button"
            onClick={() => void loadData()}
            className="mt-4 inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555]"
          >
            Retry
          </button>
        </section>
      ) : rows.length === 0 ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-6">
          <p className="text-[12px] text-[#1c1c1c]">No customers match this view.</p>
          <p className="mt-2 text-[11px] text-[#555]">
            Customer records will appear here after orders are synced into the `customers` table.
          </p>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-x-auto rounded-[2px] border border-[#f0f0f0] bg-white">
            <table className="min-w-full">
              <thead className="bg-[#fafafa]">
                <tr className="text-left text-[9px] uppercase tracking-[2px] text-[#999]">
                  <th className="px-4 py-[10px]">Name</th>
                  <th className="px-4 py-[10px]">Phone</th>
                  <th className="px-4 py-[10px]">Location</th>
                  <th className="px-4 py-[10px]">Orders</th>
                  <th className="px-4 py-[10px]">Spent</th>
                  <th className="px-4 py-[10px]">Last Order</th>
                  <th className="px-4 py-[10px]">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((customer) => {
                  const phone = customer.whatsapp || customer.phone;
                  const waHref = cleanPhone(phone) ? `https://wa.me/${cleanPhone(phone)}` : "#";

                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-[#f0f0f0] text-[11px] text-[#555] transition-colors duration-200 ease-in-out hover:bg-[#fafaf8]"
                    >
                      <td className="px-4 py-[10px]">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className="text-left"
                        >
                          <p className="text-[12px] text-[#1c1c1c]">{customer.name}</p>
                          <p className="mt-1 text-[10px] text-[#999]">{customer.email || "No email"}</p>
                        </button>
                      </td>
                      <td className="px-4 py-[10px]">{phone || "No phone"}</td>
                      <td className="px-4 py-[10px]">{customer.location || "Not set"}</td>
                      <td className="px-4 py-[10px] text-[#1c1c1c]">{customer.total_orders || 0}</td>
                      <td className="px-4 py-[10px] text-[#1c1c1c]">{formatCurrency(customer.total_spent || 0)}</td>
                      <td className="px-4 py-[10px]">{formatDate(customer.lastOrderAt)}</td>
                      <td className="px-4 py-[10px]">
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center rounded-[2px] bg-[#25D366] px-[10px] text-[10px] uppercase tracking-[1px] text-white transition-opacity duration-200 ease-in-out hover:opacity-90"
                        >
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <aside className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Customer Detail</p>

            {selectedCustomer ? (
              <div className="mt-4 space-y-4">
                <div className="border border-[#f0f0f0] p-3">
                  <p className="text-[12px] text-[#1c1c1c]">{selectedCustomer.name}</p>
                  <p className="mt-2 text-[11px] text-[#555]">
                    {selectedCustomer.phone || selectedCustomer.whatsapp || "No phone"}
                  </p>
                  <p className="mt-1 text-[11px] text-[#555]">{selectedCustomer.email || "No email"}</p>
                  <p className="mt-1 text-[11px] text-[#555]">{selectedCustomer.location || "No location"}</p>
                </div>

                <div className="border border-[#f0f0f0] p-3 text-[11px] text-[#555]">
                  <div className="flex items-center justify-between gap-3">
                    <span>Total lifetime value</span>
                    <span className="text-[#1c1c1c]">{formatCurrency(selectedCustomer.total_spent || 0)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span>Total orders</span>
                    <span className="text-[#1c1c1c]">{selectedCustomer.total_orders || 0}</span>
                  </div>
                </div>

                <a
                  href={
                    cleanPhone(selectedCustomer.whatsapp || selectedCustomer.phone)
                      ? `https://wa.me/${cleanPhone(selectedCustomer.whatsapp || selectedCustomer.phone)}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-full items-center justify-center rounded-[2px] bg-[#25D366] text-[11px] uppercase tracking-[1px] text-white"
                >
                  WhatsApp customer
                </a>

                <div>
                  <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Orders History</p>
                  <div className="mt-3 space-y-2">
                    {selectedCustomer.ordersHistory.length ? (
                      selectedCustomer.ordersHistory.map((order) => (
                        <div key={order.id} className="border border-[#f0f0f0] p-3 text-[11px] text-[#555]">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[#1c1c1c]">#SC-{order.id.slice(0, 8).toUpperCase()}</span>
                            <span>{formatCurrency(order.total_amount)}</span>
                          </div>
                          <p className="mt-2 text-[10px] text-[#999]">{formatDate(order.created_at)}</p>
                        </div>
                      ))
                    ) : (
                      <div className="border border-[#f0f0f0] p-3">
                        <p className="text-[11px] text-[#555]">No matched orders yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 border border-[#f0f0f0] p-3">
                <p className="text-[11px] text-[#555]">
                  Select a customer row to see their contact details and order history.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
