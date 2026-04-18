import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatDateTime, formatKES } from "../../lib/formatters";
import {
  CUSTOM_ORDER_STATUS_OPTIONS,
  calculateCustomOrderMetrics,
  getCustomOrderStatusMeta,
} from "../../lib/custom-orders";

const defaultForm = {
  id: "",
  customerName: "",
  customerPhone: "",
  orderName: "",
  quantity: 1,
  clientTotal: 0,
  customerDeliveryCharge: 0,
  customerDepositRequired: 0,
  customerDepositPaid: 0,
  customerDepositPaidAt: "",
  customerBalancePaid: 0,
  customerBalancePaidAt: "",
  designerName: "",
  designerTotalPay: 0,
  designerDepositRequired: 0,
  designerDepositPaid: 0,
  designerDepositPaidAt: "",
  designerBalancePaid: 0,
  designerBalancePaidAt: "",
  packagingCost: 0,
  packagingPaidAt: "",
  deliveryCost: 0,
  deliveryPaidAt: "",
  dueDate: "",
  status: "inquiry",
  notes: "",
};

function toInputDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function toIsoOrEmpty(value) {
  return value ? new Date(value).toISOString() : "";
}

function buildPayload(form) {
  return {
    ...form,
    id: String(form.id || "").trim() || `co_${Date.now()}`,
    customerName: String(form.customerName || "").trim(),
    customerPhone: String(form.customerPhone || "").trim(),
    orderName: String(form.orderName || "").trim(),
    designerName: String(form.designerName || "").trim(),
    quantity: Number(form.quantity || 1),
    clientTotal: Number(form.clientTotal || 0),
    customerDeliveryCharge: Number(form.customerDeliveryCharge || 0),
    customerDepositRequired: Number(form.customerDepositRequired || 0),
    customerDepositPaid: Number(form.customerDepositPaid || 0),
    customerDepositPaidAt: toIsoOrEmpty(form.customerDepositPaidAt),
    customerBalancePaid: Number(form.customerBalancePaid || 0),
    customerBalancePaidAt: toIsoOrEmpty(form.customerBalancePaidAt),
    designerTotalPay: Number(form.designerTotalPay || 0),
    designerDepositRequired: Number(form.designerDepositRequired || 0),
    designerDepositPaid: Number(form.designerDepositPaid || 0),
    designerDepositPaidAt: toIsoOrEmpty(form.designerDepositPaidAt),
    designerBalancePaid: Number(form.designerBalancePaid || 0),
    designerBalancePaidAt: toIsoOrEmpty(form.designerBalancePaidAt),
    packagingCost: Number(form.packagingCost || 0),
    packagingPaidAt: toIsoOrEmpty(form.packagingPaidAt),
    deliveryCost: Number(form.deliveryCost || 0),
    deliveryPaidAt: toIsoOrEmpty(form.deliveryPaidAt),
    dueDate: form.dueDate ? String(form.dueDate) : "",
    status: String(form.status || "inquiry"),
    notes: String(form.notes || "").trim(),
  };
}

function hydrateForm(order) {
  return {
    ...defaultForm,
    ...order,
    customerDepositPaidAt: toInputDateTime(order.customerDepositPaidAt),
    customerBalancePaidAt: toInputDateTime(order.customerBalancePaidAt),
    designerDepositPaidAt: toInputDateTime(order.designerDepositPaidAt),
    designerBalancePaidAt: toInputDateTime(order.designerBalancePaidAt),
    packagingPaidAt: toInputDateTime(order.packagingPaidAt),
    deliveryPaidAt: toInputDateTime(order.deliveryPaidAt),
    dueDate: order.dueDate ? String(order.dueDate).slice(0, 10) : "",
  };
}

function AdminCustomOrdersPage() {
  const [form, setForm] = useState(defaultForm);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-custom-orders"],
    queryFn: async () => {
      const response = await fetch("/api/admin/custom-orders", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Could not load custom orders");
      return response.json();
    },
  });

  const orders = data?.orders || [];
  const metrics = useMemo(() => calculateCustomOrderMetrics(form), [form]);

  async function saveOrder(event) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveMessage("");

    const response = await fetch("/api/admin/custom-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(buildPayload(form)),
    });

    setSaving(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setSaveError(body?.error || "Could not save this custom order.");
      return;
    }

    setSaveMessage("Custom order saved.");
    setForm(defaultForm);
    await refetch();
  }

  async function removeOrder(id) {
    const confirmed = window.confirm("Delete this custom order?");
    if (!confirmed) return;

    await fetch(`/api/admin/custom-orders?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (form.id === id) {
      setForm(defaultForm);
    }
    await refetch();
  }

  return (
    <AdminLayout title="Custom Orders">
      <section className="admin-panel" style={{ marginBottom: "var(--space-5)" }}>
        <p className="overline" style={{ marginBottom: "8px" }}>
          Production tracker
        </p>
        <p className="body-sm">
          Track client payments, designer payouts, packaging, delivery, and profit for made-to-order or bulk custom work.
        </p>
      </section>

      <form className="admin-form-card" onSubmit={saveOrder}>
        <div className="admin-grid-2">
          <label className="admin-field">
            <span>Customer name</span>
            <input
              className="admin-input"
              value={form.customerName}
              onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Customer phone</span>
            <input
              className="admin-input"
              value={form.customerPhone}
              onChange={(event) => setForm((current) => ({ ...current, customerPhone: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Order / design name</span>
            <input
              className="admin-input"
              value={form.orderName}
              onChange={(event) => setForm((current) => ({ ...current, orderName: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Quantity</span>
            <input
              type="number"
              min="1"
              className="admin-input"
              value={form.quantity}
              onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Designer name</span>
            <input
              className="admin-input"
              value={form.designerName}
              onChange={(event) => setForm((current) => ({ ...current, designerName: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Status</span>
            <select
              className="admin-select"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              {CUSTOM_ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {getCustomOrderStatusMeta(status).label}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Client total</span>
            <input
              type="number"
              min="0"
              className="admin-input"
              value={form.clientTotal}
              onChange={(event) => setForm((current) => ({ ...current, clientTotal: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Customer delivery charge</span>
            <input
              type="number"
              min="0"
              className="admin-input"
              value={form.customerDeliveryCharge}
              onChange={(event) => setForm((current) => ({ ...current, customerDeliveryCharge: event.target.value }))}
            />
          </label>
        </div>

        <div className="admin-grid-2">
          <label className="admin-field">
            <span>Customer deposit required</span>
            <input
              type="number"
              min="0"
              className="admin-input"
              value={form.customerDepositRequired}
              onChange={(event) => setForm((current) => ({ ...current, customerDepositRequired: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Customer deposit paid</span>
            <input
              type="number"
              min="0"
              className="admin-input"
              value={form.customerDepositPaid}
              onChange={(event) => setForm((current) => ({ ...current, customerDepositPaid: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Deposit paid at</span>
            <input
              type="datetime-local"
              className="admin-input"
              value={form.customerDepositPaidAt}
              onChange={(event) => setForm((current) => ({ ...current, customerDepositPaidAt: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Customer balance paid</span>
            <input
              type="number"
              min="0"
              className="admin-input"
              value={form.customerBalancePaid}
              onChange={(event) => setForm((current) => ({ ...current, customerBalancePaid: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Balance paid at</span>
            <input
              type="datetime-local"
              className="admin-input"
              value={form.customerBalancePaidAt}
              onChange={(event) => setForm((current) => ({ ...current, customerBalancePaidAt: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Due date</span>
            <input
              type="date"
              className="admin-input"
              value={form.dueDate}
              onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
            />
          </label>
        </div>

        <div className="admin-grid-2">
          <label className="admin-field">
            <span>Designer total pay</span>
            <input
              type="number"
              min="0"
              className="admin-input"
              value={form.designerTotalPay}
              onChange={(event) => setForm((current) => ({ ...current, designerTotalPay: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Designer deposit required</span>
            <input
              type="number"
              min="0"
              className="admin-input"
              value={form.designerDepositRequired}
              onChange={(event) => setForm((current) => ({ ...current, designerDepositRequired: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Designer deposit paid</span>
            <input
              type="number"
              min="0"
              className="admin-input"
              value={form.designerDepositPaid}
              onChange={(event) => setForm((current) => ({ ...current, designerDepositPaid: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Designer deposit paid at</span>
            <input
              type="datetime-local"
              className="admin-input"
              value={form.designerDepositPaidAt}
              onChange={(event) => setForm((current) => ({ ...current, designerDepositPaidAt: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Designer balance paid</span>
            <input
              type="number"
              min="0"
              className="admin-input"
              value={form.designerBalancePaid}
              onChange={(event) => setForm((current) => ({ ...current, designerBalancePaid: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Designer balance paid at</span>
            <input
              type="datetime-local"
              className="admin-input"
              value={form.designerBalancePaidAt}
              onChange={(event) => setForm((current) => ({ ...current, designerBalancePaidAt: event.target.value }))}
            />
          </label>
        </div>

        <div className="admin-grid-2">
          <label className="admin-field">
            <span>Packaging cost</span>
            <input
              type="number"
              min="0"
              className="admin-input"
              value={form.packagingCost}
              onChange={(event) => setForm((current) => ({ ...current, packagingCost: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Packaging paid at</span>
            <input
              type="datetime-local"
              className="admin-input"
              value={form.packagingPaidAt}
              onChange={(event) => setForm((current) => ({ ...current, packagingPaidAt: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Delivery cost</span>
            <input
              type="number"
              min="0"
              className="admin-input"
              value={form.deliveryCost}
              onChange={(event) => setForm((current) => ({ ...current, deliveryCost: event.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Delivery paid at</span>
            <input
              type="datetime-local"
              className="admin-input"
              value={form.deliveryPaidAt}
              onChange={(event) => setForm((current) => ({ ...current, deliveryPaidAt: event.target.value }))}
            />
          </label>
        </div>

        <label className="admin-field">
          <span>Notes</span>
          <textarea
            className="admin-textarea"
            rows={3}
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          />
        </label>

        <section className="admin-stats-grid" style={{ marginBottom: "var(--space-4)" }}>
          <article className="admin-stat-card">
            <p className="admin-stat-card__label">Customer Received</p>
            <p className="admin-stat-card__value">{formatKES(metrics.customerPaymentsReceived)}</p>
          </article>
          <article className="admin-stat-card">
            <p className="admin-stat-card__label">Designer Paid</p>
            <p className="admin-stat-card__value">{formatKES(metrics.designerPaymentsSent)}</p>
          </article>
          <article className="admin-stat-card">
            <p className="admin-stat-card__label">Expected Profit</p>
            <p className="admin-stat-card__value admin-stat-card__value--terracotta">{formatKES(metrics.expectedProfit)}</p>
          </article>
          <article className="admin-stat-card">
            <p className="admin-stat-card__label">Cash Position</p>
            <p className="admin-stat-card__value">{formatKES(metrics.realizedCashProfit)}</p>
          </article>
        </section>

        <div className="admin-quick-actions" style={{ marginTop: 0 }}>
          <button type="submit" className="admin-button" disabled={saving}>
            {saving ? "Saving..." : "Save custom order"}
          </button>
          <button type="button" className="admin-button admin-button--secondary" onClick={() => setForm(defaultForm)}>
            Clear form
          </button>
          {saveMessage ? <p className="admin-note">{saveMessage}</p> : null}
          {saveError ? <p className="admin-form-error">{saveError}</p> : null}
        </div>
      </form>

      <section className="custom-orders-grid-wrap" style={{ marginTop: "var(--space-5)" }}>
        <div className="custom-orders-header">
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#333" }}>
            {isLoading ? "Loading..." : `${orders.length} Custom Order${orders.length !== 1 ? "s" : ""}`}
          </h2>
        </div>

        {isLoading ? (
          <p style={{ color: "#999", textAlign: "center", padding: "2rem" }}>Loading custom orders...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", padding: "2rem" }}>No custom orders tracked yet.</p>
        ) : (
          <div className="custom-orders-grid">
            {orders.map((order) => {
              const statusMeta = getCustomOrderStatusMeta(order.status);
              return (
                <article key={order.id} className="custom-order-card">
                  <div className="custom-order-header">
                    <div>
                      <p className="custom-order-ref">{order.id}</p>
                      <h3 className="custom-order-name">{order.orderName}</h3>
                      <p className="custom-order-qty">Qty: {order.quantity}</p>
                    </div>
                    <span className={`custom-order-status ${statusMeta.cls}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="custom-order-details">
                    <div className="custom-order-detail">
                      <span className="custom-order-label">Customer</span>
                      <span className="custom-order-value">{order.customerName}</span>
                    </div>
                    <div className="custom-order-detail">
                      <span className="custom-order-label">Phone</span>
                      <span className="custom-order-value">{order.customerPhone || "—"}</span>
                    </div>
                    <div className="custom-order-detail">
                      <span className="custom-order-label">Client Total</span>
                      <span className="custom-order-value">{formatKES(order.clientTotal)}</span>
                    </div>
                    <div className="custom-order-detail">
                      <span className="custom-order-label">Designer Pay</span>
                      <span className="custom-order-value">{formatKES(order.designerTotalPay)}</span>
                    </div>
                  </div>

                  <div className="custom-order-profit">
                    <span className="custom-order-label">Expected Profit</span>
                    <span className="custom-order-profit-value">{formatKES(order.expectedProfit)}</span>
                  </div>

                  <div className="custom-order-actions">
                    <button
                      type="button"
                      className="custom-order-btn custom-order-btn--primary"
                      onClick={() => setForm(hydrateForm(order))}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="custom-order-btn custom-order-btn--danger"
                      onClick={() => removeOrder(order.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <style jsx>{`
          .custom-orders-grid-wrap {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 1.5rem;
          }

          .custom-orders-header {
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f5f5f5;
          }

          .custom-orders-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.25rem;
          }

          .custom-order-card {
            background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
            border: 1px solid #e8e8e8;
            border-radius: 10px;
            padding: 1.25rem;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
          }

          .custom-order-card:hover {
            border-color: #d4a574;
            box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
            transform: translateY(-2px);
          }

          .custom-order-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #f0f0f0;
          }

          .custom-order-ref {
            font-size: 0.7rem;
            font-weight: 600;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
          }

          .custom-order-name {
            font-size: 0.95rem;
            font-weight: 600;
            color: #333;
            margin: 0.25rem 0 0 0;
          }

          .custom-order-qty {
            font-size: 0.75rem;
            color: #999;
            margin: 0.25rem 0 0 0;
          }

          .custom-order-status {
            display: inline-block;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 0.4rem 0.75rem;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
          }

          .custom-order-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            margin-bottom: 1rem;
            padding: 0.75rem;
            background: #f5f5f5;
            border-radius: 8px;
          }

          .custom-order-detail {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .custom-order-label {
            font-size: 0.7rem;
            font-weight: 600;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .custom-order-value {
            font-size: 0.85rem;
            font-weight: 600;
            color: #333;
          }

          .custom-order-profit {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: #fffbf0;
            border-radius: 8px;
            margin-bottom: 1rem;
          }

          .custom-order-profit-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: #d4a574;
          }

          .custom-order-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: auto;
          }

          .custom-order-btn {
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
          }

          .custom-order-btn:hover {
            border-color: #d4a574;
            color: #d4a574;
            background: #fffbf0;
          }

          .custom-order-btn--primary {
            background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
            color: white;
            border: none;
          }

          .custom-order-btn--primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
          }

          .custom-order-btn--danger {
            background: #fee2e2;
            color: #991b1b;
            border-color: #fca5a5;
          }

          .custom-order-btn--danger:hover {
            background: #fecaca;
            border-color: #f87171;
          }

          @media (max-width: 767px) {
            .custom-orders-grid {
              grid-template-columns: 1fr;
            }

            .custom-order-details {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </section>
    </AdminLayout>
  );
}

export default AdminCustomOrdersPage;
