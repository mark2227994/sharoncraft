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
          <section className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Fulfillment</th>
                  <th>WhatsApp</th>
                  <th>Area</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusMeta = getWaOrderStatusMeta(order.status);
                  const fulfillmentMeta = getFulfillmentTypeMeta(order.fulfillmentType);
                  return (
                    <tr key={order.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{order.orderReference}</td>
                      <td>
                        <strong>{order.name}</strong>
                        <div className="caption">{getSourceLabel(order)} - {formatDate(order.timestamp)}</div>
                      </td>
                      <td>
                        <span className="caption" style={{ color: "var(--color-bark)", fontWeight: 600 }}>
                          {fulfillmentMeta.label}
                        </span>
                      </td>
                      <td>
                        <a
                          href={buildOrderWhatsAppHref(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-link"
                        >
                          {order.phone}
                        </a>
                      </td>
                      <td>{order.area || "-"}</td>
                      <td>{formatKES(order.total)}</td>
                      <td>
                        <span className={`admin-pill ${statusMeta.cls}`}>{statusMeta.label}</span>
                      </td>
                      <td>{formatDate(order.updatedAt)}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="admin-button admin-button--secondary"
                          style={{ padding: "8px 12px", fontSize: "0.8rem" }}
                          onClick={() => setSelectedId(order.id)}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="admin-mobile-cards">
            {filteredOrders.map((order) => {
              const statusMeta = getWaOrderStatusMeta(order.status);
              const fulfillmentMeta = getFulfillmentTypeMeta(order.fulfillmentType);
              return (
                <article key={order.id} className="admin-panel order-card-mobile">
                  <div className="order-card-mobile__top">
                    <div>
                      <p className="overline">{order.orderReference}</p>
                      <h2 className="heading-md">{order.name}</h2>
                      <p className="body-sm">{order.area || getSourceLabel(order)}</p>
                      <p className="caption" style={{ marginTop: "4px" }}>{fulfillmentMeta.label}</p>
                    </div>
                    <span className={`admin-pill ${statusMeta.cls}`}>{statusMeta.label}</span>
                  </div>
                  <p className="body-sm">{formatKES(order.total)}</p>
                  <a href={buildOrderWhatsAppHref(order)} target="_blank" rel="noopener noreferrer" className="admin-link">
                    Open WhatsApp
                  </a>
                  <button
                    type="button"
                    className="admin-button admin-button--secondary"
                    style={{ marginTop: "var(--space-3)" }}
                    onClick={() => setSelectedId(order.id)}
                  >
                    Manage Order
                  </button>
                </article>
              );
            })}
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
        @media (max-width: 767px) {
          .orders-toolbar,
          .order-drawer__meta {
            grid-template-columns: 1fr;
          }
          .order-drawer__header,
          .order-drawer__item,
          .order-card-mobile__top {
            flex-direction: column;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
