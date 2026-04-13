import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatKES } from "../../lib/formatters";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const STATUS_LABELS = {
  pending: { label: "Pending", cls: "admin-pill--pending" },
  confirmed: { label: "Confirmed", cls: "admin-pill--mpesa" },
  completed: { label: "Completed ✅", cls: "admin-pill--completed" },
  cancelled: { label: "Cancelled", cls: "admin-pill--failed" },
};

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

async function updateOrder(payload) {
  const res = await fetch("/api/admin/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

async function deleteOrder(id) {
  const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json();
    },
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const mutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: () => queryClient.invalidateQueries(["admin-orders"]),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => queryClient.invalidateQueries(["admin-orders"]),
  });

  const allOrders = data?.orders || [];
  const orders = filter === "all" ? allOrders : allOrders.filter((o) => o.status === filter);

  // Counts for quick stats
  const pending = allOrders.filter((o) => o.status === "pending").length;
  const confirmed = allOrders.filter((o) => o.status === "confirmed").length;
  const completed = allOrders.filter((o) => o.status === "completed").length;
  const revenue = allOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <AdminLayout title="WhatsApp Orders">
      {/* Quick stats */}
      <section className="admin-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Pending</p>
          <p className="admin-stat-card__value">{pending}</p>
          <p className="admin-stat-card__delta">Need follow-up</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Confirmed</p>
          <p className="admin-stat-card__value">{confirmed}</p>
          <p className="admin-stat-card__delta">Awaiting payment</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Completed</p>
          <p className="admin-stat-card__value">{completed}</p>
          <p className="admin-stat-card__delta">Paid &amp; delivered</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Revenue</p>
          <p className="admin-stat-card__value admin-stat-card__value--terracotta">{formatKES(revenue)}</p>
          <p className="admin-stat-card__delta">From completed orders</p>
        </article>
      </section>

      {/* Filter tabs */}
      <div className="orders-filter-tabs">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            type="button"
            className={`orders-tab ${filter === f ? "orders-tab--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? `All (${allOrders.length})` : STATUS_LABELS[f]?.label || f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="admin-note">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="admin-panel" style={{ padding: "var(--space-6)", textAlign: "center" }}>
          <p className="body-lg">No orders yet.</p>
          <p className="admin-note" style={{ marginTop: "var(--space-2)" }}>
            When customers checkout via WhatsApp, their orders will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <section className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Area</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const s = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                  const busy = mutation.isPending && mutation.variables?.id === order.id;
                  return (
                    <tr key={order.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(order.timestamp)}</td>
                      <td>{order.name}</td>
                      <td>
                        <a
                          href={`https://wa.me/254${order.phone?.replace(/^0/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#25d366", fontWeight: 600 }}
                        >
                          💬 {order.phone}
                        </a>
                      </td>
                      <td>{order.area}</td>
                      <td>
                        {(order.items || []).map((item) => (
                          <div key={item.id} style={{ fontSize: "0.8rem" }}>
                            {item.name} ×{item.quantity}
                          </div>
                        ))}
                      </td>
                      <td>{formatKES(order.total)}</td>
                      <td>
                        <span className={`admin-pill ${s.cls}`}>{s.label}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                          {order.status === "pending" && (
                            <button
                              type="button"
                              className="order-action-btn order-action-btn--confirm"
                              disabled={busy}
                              onClick={() => mutation.mutate({ id: order.id, status: "confirmed" })}
                            >
                              ✅ Confirm
                            </button>
                          )}
                          {order.status === "confirmed" && (
                            <button
                              type="button"
                              className="order-action-btn order-action-btn--complete"
                              disabled={busy}
                              onClick={() => mutation.mutate({ id: order.id, status: "completed" })}
                            >
                              🏁 Mark Complete
                            </button>
                          )}
                          {order.status !== "cancelled" && order.status !== "completed" && (
                            <button
                              type="button"
                              className="order-action-btn order-action-btn--cancel"
                              disabled={busy}
                              onClick={() => mutation.mutate({ id: order.id, status: "cancelled" })}
                            >
                              ✕ Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            className="order-action-btn order-action-btn--delete"
                            disabled={deleteMutation.isPending && deleteMutation.variables === order.id}
                            onClick={() => {
                              if (confirm(`Delete order from ${order.name}?`)) {
                                deleteMutation.mutate(order.id);
                              }
                            }}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Mobile cards */}
          <section className="admin-mobile-cards">
            {orders.map((order) => {
              const s = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
              const busy = mutation.isPending && mutation.variables?.id === order.id;
              return (
                <article key={order.id} className="admin-panel" style={{ padding: "var(--space-4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p className="overline">{formatDate(order.timestamp)}</p>
                      <h2 className="heading-md">{order.name}</h2>
                      <a
                        href={`https://wa.me/254${order.phone?.replace(/^0/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#25d366", fontSize: "0.9rem" }}
                      >
                        💬 {order.phone}
                      </a>
                    </div>
                    <span className={`admin-pill ${s.cls}`}>{s.label}</span>
                  </div>
                  <p className="body-sm" style={{ marginTop: "var(--space-2)" }}>
                    📍 {order.area} · 💰 {formatKES(order.total)}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: "var(--space-3)", flexWrap: "wrap" }}>
                    {order.status === "pending" && (
                      <button
                        type="button"
                        className="order-action-btn order-action-btn--confirm"
                        disabled={busy}
                        onClick={() => mutation.mutate({ id: order.id, status: "confirmed" })}
                      >
                        ✅ Confirm
                      </button>
                    )}
                    {order.status === "confirmed" && (
                      <button
                        type="button"
                        className="order-action-btn order-action-btn--complete"
                        disabled={busy}
                        onClick={() => mutation.mutate({ id: order.id, status: "completed" })}
                      >
                        🏁 Mark Complete
                      </button>
                    )}
                    {order.status !== "cancelled" && order.status !== "completed" && (
                      <button
                        type="button"
                        className="order-action-btn order-action-btn--cancel"
                        disabled={busy}
                        onClick={() => mutation.mutate({ id: order.id, status: "cancelled" })}
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}

      <style jsx>{`
        .orders-filter-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: var(--space-4);
        }
        .orders-tab {
          padding: 6px 14px;
          border: 1px solid var(--border-default);
          border-radius: 9999px;
          background: transparent;
          cursor: pointer;
          font-size: 0.85rem;
          color: var(--color-text);
        }
        .orders-tab--active {
          background: var(--color-terracotta);
          color: #fff;
          border-color: var(--color-terracotta);
          font-weight: 600;
        }
        .order-action-btn {
          padding: 5px 11px;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .order-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .order-action-btn--confirm { background: #22c55e; color: #fff; }
        .order-action-btn--confirm:hover:not(:disabled) { background: #16a34a; }
        .order-action-btn--complete { background: #6366f1; color: #fff; }
        .order-action-btn--complete:hover:not(:disabled) { background: #4f46e5; }
        .order-action-btn--cancel { background: #f59e0b; color: #fff; }
        .order-action-btn--cancel:hover:not(:disabled) { background: #d97706; }
        .order-action-btn--delete { background: #dc2626; color: #fff; }
        .order-action-btn--delete:hover:not(:disabled) { background: #b91c1c; }
      `}</style>
    </AdminLayout>
  );
}
