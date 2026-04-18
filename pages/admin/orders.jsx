import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatKES } from "../../lib/formatters";
import {
  buildAdminWhatsAppMessage,
  buildOrderWhatsAppHref,
  getFulfillmentTypeMeta,
  getWaOrderStatusMeta,
  WA_ORDER_STATUS_FLOW,
} from "../../lib/wa-orders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const STATUS_LABELS = {
  all: "All orders",
  attention: "Needs follow-up",
  new: "New",
  seen: "Seen",
  confirmed: "Confirmed",
  paid: "Paid",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ATTENTION_STATUSES = new Set(["new", "seen", "confirmed", "paid", "dispatched"]);

function formatDate(timestamp) {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

function getOrderActions(order) {
  if (!order) return [];
  if (order.status === "new") return ["seen", "confirmed", "cancelled"];
  if (order.status === "seen") return ["confirmed", "cancelled"];
  if (order.status === "confirmed") return ["paid", "dispatched", "cancelled"];
  if (order.status === "paid") return ["dispatched", "delivered"];
  if (order.status === "dispatched") return ["delivered"];
  return [];
}

function getSourceLabel(order) {
  return order?.source === "custom-design" ? "Custom Design" : "Checkout";
}

async function fetchOrders() {
  const response = await fetch("/api/admin/orders", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Failed to load orders");
  return response.json();
}

async function saveOrder(payload) {
  const response = await fetch("/api/admin/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Could not update order");
  return response.json();
}

async function removeOrder(id) {
  const response = await fetch(`/api/admin/orders?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("Could not delete order");
  return response.json();
}

function OrderStats({ orders }) {
  const newCount = orders.filter((order) => order.status === "new").length;
  const attentionCount = orders.filter((order) => ATTENTION_STATUSES.has(order.status)).length;
  const deliveredCount = orders.filter((order) => order.status === "delivered").length;
  const revenue = orders
    .filter((order) => order.status === "paid" || order.status === "delivered")
    .reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <section className="admin-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
      <article className="admin-stat-card">
        <p className="admin-stat-card__label">New Orders</p>
        <p className="admin-stat-card__value">{newCount}</p>
        <p className="admin-stat-card__delta">Fresh from checkout</p>
      </article>
      <article className="admin-stat-card">
        <p className="admin-stat-card__label">Needs Follow-up</p>
        <p className="admin-stat-card__value">{attentionCount}</p>
        <p className="admin-stat-card__delta">Seen, confirmed, paid, or dispatched</p>
      </article>
      <article className="admin-stat-card">
        <p className="admin-stat-card__label">Delivered</p>
        <p className="admin-stat-card__value">{deliveredCount}</p>
        <p className="admin-stat-card__delta">Finished orders</p>
      </article>
      <article className="admin-stat-card">
        <p className="admin-stat-card__label">Tracked Revenue</p>
        <p className="admin-stat-card__value admin-stat-card__value--terracotta">{formatKES(revenue)}</p>
        <p className="admin-stat-card__delta">Paid and delivered orders</p>
      </article>
    </section>
  );
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("attention");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [statusDraft, setStatusDraft] = useState("new");
  const [noteDraft, setNoteDraft] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
    refetchInterval: 30000,
  });

  const saveMutation = useMutation({
    mutationFn: saveOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: removeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedId("");
    },
  });

  const allOrders = data?.orders || [];
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allOrders.filter((order) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "attention"
            ? ATTENTION_STATUSES.has(order.status)
            : order.status === filter;

      if (!matchesFilter) return false;
      if (!query) return true;

      return [
        order.orderReference,
        order.name,
        order.phone,
        order.area,
        order.note,
        ...(Array.isArray(order.items) ? order.items.map((item) => item.name) : []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [allOrders, filter, search]);

  const selectedOrder = useMemo(
    () => filteredOrders.find((order) => order.id === selectedId) || allOrders.find((order) => order.id === selectedId) || null,
    [allOrders, filteredOrders, selectedId],
  );

  useEffect(() => {
    if (!selectedOrder) return;
    setStatusDraft(selectedOrder.status);
    setNoteDraft(selectedOrder.note || "");
  }, [selectedOrder]);

  async function handleSave() {
    if (!selectedOrder) return;
    await saveMutation.mutateAsync({
      id: selectedOrder.id,
      status: statusDraft,
      note: noteDraft,
    });
  }

  async function handleStatusStep(nextStatus) {
    if (!selectedOrder) return;
    await saveMutation.mutateAsync({
      id: selectedOrder.id,
      status: nextStatus,
    });
    setStatusDraft(nextStatus);
  }

  async function handleWhatsAppAction(variant) {
    if (!selectedOrder) return;
    const statusMap = {
      seen: "seen",
      confirmed: "confirmed",
      paid: "paid",
      dispatched: "dispatched",
      delivered: "delivered",
    };
    const nextStatus = statusMap[variant];
    const href = buildOrderWhatsAppHref(selectedOrder, buildAdminWhatsAppMessage(selectedOrder, variant));

    await saveMutation.mutateAsync({
      id: selectedOrder.id,
      ...(nextStatus ? { status: nextStatus } : {}),
      lastContactAt: new Date().toISOString(),
      note: noteDraft,
    });

    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <AdminLayout title="Orders">
      <OrderStats orders={allOrders} />

      <section className="admin-panel" style={{ marginBottom: "var(--space-4)" }}>
        <div className="orders-toolbar">
          <input
            className="admin-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer, phone, order ref, or item"
          />
          <select className="admin-select" value={filter} onChange={(event) => setFilter(event.target.value)}>
            {["attention", "all", ...WA_ORDER_STATUS_FLOW].map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value] || value}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading ? (
        <p className="admin-note">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-panel" style={{ padding: "var(--space-6)", textAlign: "center" }}>
          <p className="body-lg">No orders match this view.</p>
          <p className="admin-note" style={{ marginTop: "var(--space-2)" }}>
            Checkout orders will appear here automatically once a customer submits their details.
          </p>
        </div>
      ) : (
        <>
          <section className="orders-grid-wrap">
            <div className="orders-grid-header">
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#333" }}>
                Showing {filteredOrders.length} orders
              </h2>
            </div>

            <div className="orders-grid">
              {filteredOrders.map((order) => {
                const statusMeta = getWaOrderStatusMeta(order.status);
                const fulfillmentMeta = getFulfillmentTypeMeta(order.fulfillmentType);
                return (
                  <article key={order.id} className="order-card">
                    {/* Header Section */}
                    <div className="order-card-header">
                      <div>
                        <p className="order-card-ref">{order.orderReference}</p>
                        <h3 className="order-card-customer">{order.name}</h3>
                      </div>
                      <span className={`order-status-badge ${statusMeta.cls}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Details Section */}
                    <div className="order-card-details">
                      <div className="order-detail-item">
                        <span className="order-detail-label">Phone</span>
                        <a
                          href={buildOrderWhatsAppHref(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="order-detail-value order-whatsapp-link"
                        >
                          💬 {order.phone}
                        </a>
                      </div>
                      <div className="order-detail-item">
                        <span className="order-detail-label">Area</span>
                        <span className="order-detail-value">{order.area || "—"}</span>
                      </div>
                      <div className="order-detail-item">
                        <span className="order-detail-label">Type</span>
                        <span className="order-detail-value">{fulfillmentMeta.label}</span>
                      </div>
                      <div className="order-detail-item">
                        <span className="order-detail-label">Source</span>
                        <span className="order-detail-value">{getSourceLabel(order)}</span>
                      </div>
                    </div>

                    {/* Total Section */}
                    <div className="order-card-total">
                      <span className="order-total-label">Total</span>
                      <span className="order-total-value">{formatKES(order.total)}</span>
                    </div>

                    {/* Actions Section */}
                    <div className="order-card-actions">
                      <button
                        type="button"
                        className="order-card-btn order-card-btn--primary"
                        onClick={() => setSelectedId(order.id)}
                      >
                        Manage
                      </button>
                      <a
                        href={buildOrderWhatsAppHref(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="order-card-btn order-card-btn--secondary"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}

      {selectedOrder ? (
        <div className="manual-match-drawer" role="dialog" aria-modal="true" aria-label="Manage order">
          <button type="button" className="manual-match-drawer__overlay" onClick={() => setSelectedId("")} />
          <aside className="manual-match-drawer__panel order-drawer">
            <div className="order-drawer__header">
              <div>
                <p className="overline">{selectedOrder.orderReference}</p>
                <h2 className="display-md">Manage order</h2>
              </div>
              <button type="button" className="admin-button admin-button--secondary" onClick={() => setSelectedId("")}>
                Close
              </button>
            </div>

            <div className="order-drawer__meta">
              <div>
                <span className="caption">Customer</span>
                <p>{selectedOrder.name}</p>
              </div>
              <div>
                <span className="caption">Request Source</span>
                <p>{getSourceLabel(selectedOrder)}</p>
              </div>
              <div>
                <span className="caption">Phone</span>
                <p>{selectedOrder.phone}</p>
              </div>
              <div>
                <span className="caption">Area</span>
                <p>{selectedOrder.area || "-"}</p>
              </div>
              <div>
                <span className="caption">Total</span>
                <p>{formatKES(selectedOrder.total)}</p>
              </div>
              <div>
                <span className="caption">Fulfillment</span>
                <p>{getFulfillmentTypeMeta(selectedOrder.fulfillmentType).label}</p>
              </div>
            </div>

            {selectedOrder.productionNote ? (
              <div className="order-drawer__section">
                <p className="overline">Production note</p>
                <p className="body-sm" style={{ marginTop: "var(--space-2)" }}>{selectedOrder.productionNote}</p>
              </div>
            ) : null}

            {selectedOrder.customRequest ? (
              <div className="order-drawer__section">
                <p className="overline">Custom request</p>
                <div className="order-drawer__timeline">
                  {selectedOrder.customRequest.designType ? (
                    <div className="order-drawer__item"><span>Design type</span><span>{selectedOrder.customRequest.designType}</span></div>
                  ) : null}
                  {selectedOrder.customRequest.colors ? (
                    <div className="order-drawer__item"><span>Colors</span><span>{selectedOrder.customRequest.colors}</span></div>
                  ) : null}
                  {selectedOrder.customRequest.occasion ? (
                    <div className="order-drawer__item"><span>Occasion</span><span>{selectedOrder.customRequest.occasion}</span></div>
                  ) : null}
                  {selectedOrder.customRequest.budgetRange ? (
                    <div className="order-drawer__item"><span>Budget</span><span>{selectedOrder.customRequest.budgetRange}</span></div>
                  ) : null}
                  {selectedOrder.customRequest.neededBy ? (
                    <div className="order-drawer__item"><span>Needed by</span><span>{selectedOrder.customRequest.neededBy}</span></div>
                  ) : null}
                </div>
                {selectedOrder.customRequest.designBrief ? (
                  <p className="body-sm" style={{ marginTop: "var(--space-3)" }}>{selectedOrder.customRequest.designBrief}</p>
                ) : null}
                {selectedOrder.customRequest.referenceImage ? (
                  <a
                    href={selectedOrder.customRequest.referenceImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-link"
                    style={{ marginTop: "var(--space-2)", display: "inline-flex" }}
                  >
                    Open reference image
                  </a>
                ) : null}
              </div>
            ) : null}

            <div className="order-drawer__section">
              <p className="overline">Quick steps</p>
              <div className="order-drawer__actions">
                {getOrderActions(selectedOrder).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`order-step-btn order-step-btn--${getWaOrderStatusMeta(status).tone}`}
                    onClick={() => handleStatusStep(status)}
                    disabled={saveMutation.isPending}
                  >
                    Mark {getWaOrderStatusMeta(status).label}
                  </button>
                ))}
              </div>
            </div>

            <div className="order-drawer__section">
              <p className="overline">Status and notes</p>
              <label className="admin-field">
                <span className="caption">Workflow stage</span>
                <select className="admin-select" value={statusDraft} onChange={(event) => setStatusDraft(event.target.value)}>
                  {WA_ORDER_STATUS_FLOW.map((status) => (
                    <option key={status} value={status}>
                      {getWaOrderStatusMeta(status).label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field">
                <span className="caption">Admin note</span>
                <textarea
                  className="admin-textarea"
                  rows={5}
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder="Add follow-up notes, payment context, delivery details, or customer preferences."
                />
              </label>
              <div className="admin-quick-actions" style={{ marginTop: 0 }}>
                <button type="button" className="admin-button" onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save order changes"}
                </button>
                <button
                  type="button"
                  className="admin-button admin-button--secondary"
                  onClick={() => window.open(buildOrderWhatsAppHref(selectedOrder), "_blank", "noopener,noreferrer")}
                >
                  Open WhatsApp
                </button>
              </div>
            </div>

            <div className="order-drawer__section">
              <p className="overline">WhatsApp follow-up</p>
              <div className="order-drawer__actions">
                {["seen", "confirmed", "paid", "dispatched", "delivered"].map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    className="admin-button admin-button--secondary"
                    onClick={() => handleWhatsAppAction(variant)}
                    disabled={saveMutation.isPending}
                  >
                    {getWaOrderStatusMeta(variant).label} message
                  </button>
                ))}
              </div>
              <p className="caption" style={{ marginTop: "8px" }}>
                Last contact: {selectedOrder.lastContactAt ? formatDate(selectedOrder.lastContactAt) : "Not recorded yet"}
              </p>
            </div>

            <div className="order-drawer__section">
              <p className="overline">Items</p>
              <div className="order-drawer__items">
                {(selectedOrder.items || []).map((item) => (
                  <div key={`${selectedOrder.id}-${item.id}`} className="order-drawer__item">
                    <span>{item.name}</span>
                    <span>
                      x{item.quantity} · {formatKES((item.price || 0) * (item.quantity || 0))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-drawer__section">
              <p className="overline">Timeline</p>
              <div className="order-drawer__timeline">
                {[
                  ["Placed", selectedOrder.timestamp],
                  ["Seen", selectedOrder.seenAt],
                  ["Confirmed", selectedOrder.confirmedAt],
                  ["Paid", selectedOrder.paidAt],
                  ["Dispatched", selectedOrder.dispatchedAt],
                  ["Delivered", selectedOrder.deliveredAt],
                  ["Cancelled", selectedOrder.cancelledAt],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label} className="order-drawer__item">
                      <span>{label}</span>
                      <span>{formatDate(value)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <button
              type="button"
              className="order-step-btn order-step-btn--delete"
              onClick={() => {
                if (confirm(`Delete order ${selectedOrder.orderReference}?`)) {
                  deleteMutation.mutate(selectedOrder.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete order"}
            </button>
          </aside>
        </div>
      ) : null}

      <style jsx>{`
        /* Grid Layout */
        .orders-grid-wrap {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }

        .orders-grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f5f5f5;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        /* Order Card */
        .order-card {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 1.25rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .order-card:hover {
          border-color: #d4a574;
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
          transform: translateY(-2px);
        }

        /* Header Section */
        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .order-card-ref {
          font-size: 0.75rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .order-card-customer {
          font-size: 0.95rem;
          font-weight: 600;
          color: #333;
          margin: 0.25rem 0 0 0;
        }

        .order-status-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .order-status-badge.admin-pill-new {
          background: #fef3c7;
          color: #92400e;
        }

        .order-status-badge.admin-pill-seen {
          background: #bfdbfe;
          color: #1e40af;
        }

        .order-status-badge.admin-pill-confirmed {
          background: #bfdbfe;
          color: #1e40af;
        }

        .order-status-badge.admin-pill-paid {
          background: #d1fae5;
          color: #065f46;
        }

        .order-status-badge.admin-pill-dispatched {
          background: #dbeafe;
          color: #0c4a6e;
        }

        .order-status-badge.admin-pill-delivered {
          background: #d1fae5;
          color: #065f46;
        }

        .order-status-badge.admin-pill-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        /* Details Section */
        .order-card-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .order-detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .order-detail-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .order-detail-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: #333;
        }

        .order-whatsapp-link {
          color: #25d366;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .order-whatsapp-link:hover {
          color: #1ea952;
        }

        /* Total Section */
        .order-card-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #fffbf0;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .order-total-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
        }

        .order-total-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #d4a574;
        }

        /* Actions Section */
        .order-card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
        }

        .order-card-btn {
          flex: 1;
          padding: 0.65rem 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          background: white;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .order-card-btn:hover {
          border-color: #d4a574;
          color: #d4a574;
          background: #fffbf0;
        }

        .order-card-btn--primary {
          background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
          color: white;
          border: none;
        }

        .order-card-btn--primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
        }

        .order-card-btn--secondary {
          background: white;
          color: #25d366;
          border-color: #d0f0c0;
        }

        .order-card-btn--secondary:hover {
          background: #d0f0c0;
          border-color: #a8e6a1;
        }

        /* Existing CSS */
        .orders-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          gap: var(--space-3);
        }

        .order-card-mobile {
          padding: var(--space-4);
        }

        .order-card-mobile__top {
          display: flex;
          justify-content: space-between;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .order-drawer {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .order-drawer__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-3);
        }

        .order-drawer__meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-3);
          padding: var(--space-4);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: var(--bg-card-alt);
        }

        .order-drawer__meta p {
          margin-top: 4px;
        }

        .order-drawer__section {
          border-top: 1px solid var(--border-default);
          padding-top: var(--space-4);
        }

        .order-drawer__actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-3);
        }

        .order-drawer__items,
        .order-drawer__timeline {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-3);
        }

        .order-drawer__item {
          display: flex;
          justify-content: space-between;
          gap: var(--space-3);
          padding: 10px 12px;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: var(--color-white);
          font-size: 0.875rem;
        }

        .order-step-btn {
          padding: 9px 14px;
          border-radius: var(--radius-md);
          color: var(--color-white);
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .order-step-btn--new {
          background: var(--color-ochre);
        }

        .order-step-btn--seen,
        .order-step-btn--dispatch {
          background: var(--color-bark);
        }

        .order-step-btn--confirm,
        .order-step-btn--complete {
          background: var(--color-moss);
        }

        .order-step-btn--cancel,
        .order-step-btn--delete {
          background: var(--color-terracotta);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .orders-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          }
        }

        @media (max-width: 767px) {
          .orders-toolbar,
          .order-drawer__meta {
            grid-template-columns: 1fr;
          }

          .orders-grid {
            grid-template-columns: 1fr;
          }

          .order-drawer__header,
          .order-drawer__item,
          .order-card-mobile__top {
            flex-direction: column;
          }

          .order-card-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
