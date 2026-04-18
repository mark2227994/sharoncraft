import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatKES, formatShortDate } from "../../lib/formatters";

export default function AdminDashboardPage() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) throw new Error("Unable to load dashboard");
      return response.json();
    },
  });

  const stats = data?.stats || [];
  const orders = data?.orders || [];
  const waOrders = data?.waOrders || [];
  const customOrders = data?.customOrders || [];
  const finance = data?.finance || null;
  const [costForm, setCostForm] = useState({
    stripeFees: 0,
    materialCosts: 0,
    shippingCosts: 0,
  });
  const [financeMessage, setFinanceMessage] = useState("");
  const [financeError, setFinanceError] = useState("");
  const [savingFinance, setSavingFinance] = useState(false);

  useEffect(() => {
    if (!finance) return;
    setCostForm({
      stripeFees: finance.stripeFees || 0,
      materialCosts: finance.materialCosts || 0,
      shippingCosts: finance.shippingCosts || 0,
    });
  }, [finance]);

  const waPending = waOrders.filter((order) =>
    ["new", "seen", "confirmed", "paid", "dispatched"].includes(order.status),
  ).length;
  const waCompleted = waOrders.filter((order) => order.status === "delivered").length;
  const waRevenue = waOrders
    .filter((order) => order.status === "paid" || order.status === "delivered")
    .reduce((sum, order) => sum + (order.total || 0), 0);

  async function saveWeeklyCosts(event) {
    event.preventDefault();
    if (!finance?.weekStart) return;

    setSavingFinance(true);
    setFinanceMessage("");
    setFinanceError("");

    const response = await fetch("/api/admin/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekStart: finance.weekStart,
        stripeFees: Number(costForm.stripeFees || 0),
        materialCosts: Number(costForm.materialCosts || 0),
        shippingCosts: Number(costForm.shippingCosts || 0),
      }),
    });

    setSavingFinance(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setFinanceError(body?.error || "Could not save weekly costs.");
      return;
    }

    setFinanceMessage("Weekly cost totals saved.");
    window.location.reload();
  }

  return (
    <AdminLayout
      title="Dashboard"
      action={
        <Link href="/admin/products/new" className="admin-button">
          Add New Product
        </Link>
      }
    >
      <p className="overline" style={{ marginBottom: "var(--space-2)" }}>
        Product Overview
      </p>

      {finance ? (
        <section className="admin-panel admin-finance-panel" style={{ marginBottom: "var(--space-6)" }}>
          <div className="admin-finance-panel__hero">
            <div>
              <p className="overline" style={{ color: "var(--color-ochre)", marginBottom: "8px" }}>
                Weekly Profit
              </p>
              <p className="caption">{finance.weekLabel}</p>
              <p className="admin-finance-panel__profit">{formatKES(finance.netProfit)}</p>
              <p className="body-sm" style={{ color: "var(--text-secondary)" }}>
                Net Profit = Money In - Money Out
              </p>
            </div>
            <div className="admin-finance-panel__money-grid">
              <div className="admin-finance-mini">
                <span className="admin-finance-mini__label">Money In</span>
                <strong>{formatKES(finance.moneyIn)}</strong>
              </div>
              <div className="admin-finance-mini">
                <span className="admin-finance-mini__label">Money Out</span>
                <strong>{formatKES(finance.moneyOut)}</strong>
              </div>
              <div className="admin-finance-mini">
                <span className="admin-finance-mini__label">Active Custom Orders</span>
                <strong>{finance.activeCustomOrders || 0}</strong>
              </div>
            </div>
          </div>

          <div className="admin-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
            <article className="admin-stat-card">
              <p className="admin-stat-card__label">Sales</p>
              <p className="admin-stat-card__value">{formatKES(finance.moneyIn)}</p>
              <p className="admin-stat-card__delta">WA + M-Pesa received this week</p>
            </article>
            <article className="admin-stat-card">
              <p className="admin-stat-card__label">Stripe Fees</p>
              <p className="admin-stat-card__value">{formatKES(finance.stripeFees)}</p>
              <p className="admin-stat-card__delta">Enter your total this week</p>
            </article>
            <article className="admin-stat-card">
              <p className="admin-stat-card__label">Material Costs</p>
              <p className="admin-stat-card__value">{formatKES(finance.materialCosts)}</p>
              <p className="admin-stat-card__delta">Beads, clasps, packaging, and supplies</p>
            </article>
            <article className="admin-stat-card">
              <p className="admin-stat-card__label">Shipping</p>
              <p className="admin-stat-card__value">{formatKES(finance.shippingCosts)}</p>
              <p className="admin-stat-card__delta">Your actual outgoing delivery cost</p>
            </article>
            <article className="admin-stat-card">
              <p className="admin-stat-card__label">Custom Order Profit</p>
              <p className="admin-stat-card__value">{formatKES(finance.customExpectedProfit)}</p>
              <p className="admin-stat-card__delta">Expected profit across tracked custom orders</p>
            </article>
          </div>

          <form className="admin-finance-form" onSubmit={saveWeeklyCosts}>
            <label className="admin-field">
              <span>Stripe fees</span>
              <input
                type="number"
                min="0"
                className="admin-input"
                value={costForm.stripeFees}
                onChange={(event) => setCostForm((current) => ({ ...current, stripeFees: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Material costs</span>
              <input
                type="number"
                min="0"
                className="admin-input"
                value={costForm.materialCosts}
                onChange={(event) => setCostForm((current) => ({ ...current, materialCosts: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Shipping</span>
              <input
                type="number"
                min="0"
                className="admin-input"
                value={costForm.shippingCosts}
                onChange={(event) => setCostForm((current) => ({ ...current, shippingCosts: event.target.value }))}
              />
            </label>
            <div className="admin-finance-form__actions">
              <button type="submit" className="admin-button" disabled={savingFinance}>
                {savingFinance ? "Saving..." : "Save weekly costs"}
              </button>
              {financeMessage ? <p className="admin-note">{financeMessage}</p> : null}
              {financeError ? <p className="admin-form-error">{financeError}</p> : null}
            </div>
          </form>
        </section>
      ) : null}

      <section className="admin-stats-grid" style={{ marginBottom: "var(--space-6)" }}>
        {stats.map((stat) => (
          <article key={stat.label} className="admin-stat-card">
            <p className="admin-stat-card__label">{stat.label}</p>
            <p className={`admin-stat-card__value ${stat.terracotta ? "admin-stat-card__value--terracotta" : ""}`}>
              {typeof stat.value === "number" && stat.label.includes("Revenue") ? formatKES(stat.value) : stat.value}
            </p>
            <p className="admin-stat-card__delta">{stat.delta}</p>
          </article>
        ))}
      </section>

      <p className="overline" style={{ marginBottom: "var(--space-2)" }}>
        WhatsApp Orders
        <Link href="/admin/orders" style={{ color: "var(--color-terracotta)", marginLeft: 8, fontWeight: 600 }}>
          View all
        </Link>
      </p>
      <section className="admin-stats-grid" style={{ marginBottom: "var(--space-6)" }}>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Total WA Orders</p>
          <p className="admin-stat-card__value">{waOrders.length}</p>
          <p className="admin-stat-card__delta">All time</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Needs Follow-up</p>
          <p className="admin-stat-card__value" style={waPending > 0 ? { color: "#f59e0b" } : {}}>
            {waPending}
          </p>
          <p className="admin-stat-card__delta">Need follow-up</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Delivered</p>
          <p className="admin-stat-card__value">{waCompleted}</p>
          <p className="admin-stat-card__delta">Completed customer orders</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">WA Revenue</p>
          <p className="admin-stat-card__value admin-stat-card__value--terracotta">{formatKES(waRevenue)}</p>
          <p className="admin-stat-card__delta">From paid and delivered orders</p>
        </article>
      </section>

      {waOrders.length > 0 ? (
        <>
          <p className="overline" style={{ marginBottom: "var(--space-2)" }}>
            Recent WhatsApp Orders
          </p>
          <section className="admin-table-wrap" style={{ marginBottom: "var(--space-6)" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {waOrders.slice(0, 8).map((order) => (
                  <tr key={order.id}>
                    <td>{new Date(order.timestamp).toLocaleDateString("en-KE")}</td>
                    <td>{order.name}</td>
                    <td>
                      <a
                        href={`https://wa.me/254${order.phone?.replace(/^0/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#25d366", fontWeight: 600 }}
                      >
                        WhatsApp: {order.phone}
                      </a>
                    </td>
                    <td>{formatKES(order.total)}</td>
                    <td>
                      <span className={`admin-pill ${order.statusClass || "admin-pill--pending"}`}>
                        {order.statusLabel || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : null}

      {customOrders.length > 0 ? (
        <>
          <p className="overline" style={{ marginBottom: "var(--space-2)" }}>
            Custom Production Orders
            <Link href="/admin/custom-orders" style={{ color: "var(--color-terracotta)", marginLeft: 8, fontWeight: 600 }}>
              View all
            </Link>
          </p>
          <section className="admin-table-wrap" style={{ marginBottom: "var(--space-6)" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Client Total</th>
                  <th>Expected Profit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customOrders.slice(0, 6).map((order) => (
                  <tr key={order.id}>
                    <td>
                      {order.orderName}
                      <div className="admin-note">Qty {order.quantity}</div>
                    </td>
                    <td>{order.customerName}</td>
                    <td>{formatKES(order.clientTotal)}</td>
                    <td>{formatKES(order.expectedProfit)}</td>
                    <td>
                      <span className={`admin-pill ${order.statusClass}`}>{order.statusLabel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : null}

      {orders.length > 0 ? (
        <>
          <p className="overline" style={{ marginBottom: "var(--space-2)" }}>
            M-Pesa Orders
          </p>
          <section className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Item</th>
                  <th>Buyer Name</th>
                  <th>Amount (KES)</th>
                  <th>Via</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.product_name}</td>
                    <td>{order.buyer_name}</td>
                    <td>{formatKES(order.amount_kes)}</td>
                    <td>
                      <span className={`admin-pill ${order.via === "M-Pesa" ? "admin-pill--mpesa" : "admin-pill--card"}`}>
                        {order.via}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-pill ${
                          order.status === "Completed"
                            ? "admin-pill--completed"
                            : order.status === "Pending"
                              ? "admin-pill--pending"
                              : "admin-pill--failed"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>{formatShortDate(order.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : null}

      <section className="admin-quick-actions" style={{ marginTop: "var(--space-5)" }}>
        <Link href="/admin/products/new" className="admin-button">
          Add New Product
        </Link>
        <Link href="/admin/orders" className="admin-button admin-button--secondary">
          View WA Orders
        </Link>
        <Link href="/admin/custom-orders" className="admin-button admin-button--secondary">
          Open Custom Tracker
        </Link>
        <Link href="/admin/marketing" className="admin-button admin-button--secondary">
          Open Marketing Studio
        </Link>
        <Link href="/admin/offers" className="admin-button admin-button--secondary">
          Manage Offers
        </Link>
        <Link href="/admin/images" className="admin-button admin-button--secondary">
          Open Image Manager
        </Link>
        <Link href="/admin/site-images" className="admin-button admin-button--secondary">
          Edit Site Content
        </Link>
      </section>

      <style jsx>{`
        .admin-finance-panel__hero {
          display: flex;
          justify-content: space-between;
          gap: var(--space-5);
          align-items: flex-start;
          margin-bottom: var(--space-5);
        }
        .admin-finance-panel__profit {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          line-height: 1;
          color: var(--color-terracotta);
          margin: 12px 0;
        }
        .admin-finance-panel__money-grid {
          display: grid;
          gap: var(--space-3);
          min-width: 240px;
        }
        .admin-finance-mini {
          padding: var(--space-4);
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          display: grid;
          gap: 6px;
        }
        .admin-finance-mini__label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }
        .admin-finance-form {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--space-4);
          align-items: end;
        }
        .admin-finance-form__actions {
          display: grid;
          gap: 8px;
        }
        @media (max-width: 900px) {
          .admin-finance-panel__hero,
          .admin-finance-form {
            grid-template-columns: 1fr;
            display: grid;
          }
          .admin-finance-panel__money-grid {
            min-width: 0;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
