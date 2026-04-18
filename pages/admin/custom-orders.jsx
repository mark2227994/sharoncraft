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

      <section className="admin-table-wrap" style={{ marginTop: "var(--space-5)" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Client Total</th>
              <th>Designer Pay</th>
              <th>Expected Profit</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8">Loading custom orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8">No custom orders tracked yet.</td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusMeta = getCustomOrderStatusMeta(order.status);
                return (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderName}</strong>
                      <div className="admin-note">Qty {order.quantity}</div>
                    </td>
                    <td>
                      {order.customerName}
                      {order.customerPhone ? <div className="admin-note">{order.customerPhone}</div> : null}
                    </td>
                    <td>{formatKES(order.clientTotal)}</td>
                    <td>{formatKES(order.designerTotalPay)}</td>
                    <td>{formatKES(order.expectedProfit)}</td>
                    <td>
                      <span className={`admin-pill ${statusMeta.cls}`}>{statusMeta.label}</span>
                    </td>
                    <td>{formatDateTime(order.updatedAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="admin-button admin-button--secondary"
                          onClick={() => setForm(hydrateForm(order))}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-button admin-button--danger"
                          onClick={() => removeOrder(order.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}

export default AdminCustomOrdersPage;
