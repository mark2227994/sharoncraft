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
      {finance ? (
        <section className="dashboard-finance-section" style={{ marginBottom: "var(--space-6)" }}>
          <div className="dashboard-finance-hero">
            <div className="dashboard-finance-main">
              <p className="dashboard-overline">📊 Weekly Performance</p>
              <h2 className="dashboard-section-title">{finance.weekLabel}</h2>
              <div className="dashboard-profit-display">
                <div className="dashboard-profit-value">{formatKES(finance.netProfit)}</div>
                <div className="dashboard-profit-label">Net Profit</div>
              </div>
              <p className="dashboard-helper-text">Money In − Money Out</p>
            </div>
            <div className="dashboard-finance-quick-stats">
              <div className="dashboard-quick-stat">
                <span className="dashboard-quick-stat-icon">💰</span>
                <span className="dashboard-quick-stat-label">Money In</span>
                <strong className="dashboard-quick-stat-value">{formatKES(finance.moneyIn)}</strong>
              </div>
              <div className="dashboard-quick-stat">
                <span className="dashboard-quick-stat-icon">📤</span>
                <span className="dashboard-quick-stat-label">Money Out</span>
                <strong className="dashboard-quick-stat-value">{formatKES(finance.moneyOut)}</strong>
              </div>
              <div className="dashboard-quick-stat">
                <span className="dashboard-quick-stat-icon">🎯</span>
                <span className="dashboard-quick-stat-label">Active Orders</span>
                <strong className="dashboard-quick-stat-value">{finance.activeCustomOrders || 0}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-finance-grid">
            <div className="dashboard-finance-card">
              <div className="dashboard-card-header">
                <span className="dashboard-card-icon">💳</span>
                <span className="dashboard-card-label">Sales</span>
              </div>
              <div className="dashboard-card-value">{formatKES(finance.moneyIn)}</div>
              <div className="dashboard-card-subtext">WA + M-Pesa received this week</div>
            </div>
            <div className="dashboard-finance-card">
              <div className="dashboard-card-header">
                <span className="dashboard-card-icon">💳</span>
                <span className="dashboard-card-label">Stripe Fees</span>
              </div>
              <div className="dashboard-card-value">{formatKES(finance.stripeFees)}</div>
              <div className="dashboard-card-subtext">Payment processing costs</div>
            </div>
            <div className="dashboard-finance-card">
              <div className="dashboard-card-header">
                <span className="dashboard-card-icon">📦</span>
                <span className="dashboard-card-label">Material Costs</span>
              </div>
              <div className="dashboard-card-value">{formatKES(finance.materialCosts)}</div>
              <div className="dashboard-card-subtext">Beads, clasps, packaging</div>
            </div>
            <div className="dashboard-finance-card">
              <div className="dashboard-card-header">
                <span className="dashboard-card-icon">🚚</span>
                <span className="dashboard-card-label">Shipping</span>
              </div>
              <div className="dashboard-card-value">{formatKES(finance.shippingCosts)}</div>
              <div className="dashboard-card-subtext">Delivery costs</div>
            </div>
            <div className="dashboard-finance-card">
              <div className="dashboard-card-header">
                <span className="dashboard-card-icon">✨</span>
                <span className="dashboard-card-label">Custom Profit</span>
              </div>
              <div className="dashboard-card-value">{formatKES(finance.customExpectedProfit)}</div>
              <div className="dashboard-card-subtext">Expected from custom orders</div>
            </div>
          </div>

          <div className="dashboard-finance-form-section">
            <h3 className="dashboard-form-title">📝 Update Weekly Costs</h3>
            <form className="dashboard-finance-form" onSubmit={saveWeeklyCosts}>
              <div className="dashboard-form-grid">
                <label className="dashboard-form-field">
                  <span className="dashboard-form-label">Stripe Fees</span>
                  <input
                    type="number"
                    min="0"
                    className="dashboard-form-input"
                    value={costForm.stripeFees}
                    onChange={(event) => setCostForm((current) => ({ ...current, stripeFees: event.target.value }))}
                  />
                </label>
                <label className="dashboard-form-field">
                  <span className="dashboard-form-label">Material Costs</span>
                  <input
                    type="number"
                    min="0"
                    className="dashboard-form-input"
                    value={costForm.materialCosts}
                    onChange={(event) => setCostForm((current) => ({ ...current, materialCosts: event.target.value }))}
                  />
                </label>
                <label className="dashboard-form-field">
                  <span className="dashboard-form-label">Shipping</span>
                  <input
                    type="number"
                    min="0"
                    className="dashboard-form-input"
                    value={costForm.shippingCosts}
                    onChange={(event) => setCostForm((current) => ({ ...current, shippingCosts: event.target.value }))}
                  />
                </label>
              </div>
              <div className="dashboard-form-actions">
                <button type="submit" className="dashboard-btn-primary" disabled={savingFinance}>
                  {savingFinance ? "Saving..." : "Save Weekly Costs"}
                </button>
                {financeMessage ? <p className="dashboard-success-msg">{financeMessage}</p> : null}
                {financeError ? <p className="dashboard-error-msg">{financeError}</p> : null}
              </div>
            </form>
          </div>
        </section>
      ) : null}

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">📈 Product Overview</h2>
          <p className="dashboard-section-subtitle">Catalog performance and inventory status</p>
        </div>
        <div className="dashboard-stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className="dashboard-stat-card">
              <p className="dashboard-stat-label">{stat.label}</p>
              <p className={`dashboard-stat-value ${stat.terracotta ? "dashboard-stat-terracotta" : ""}`}>
                {typeof stat.value === "number" && stat.label.includes("Revenue") ? formatKES(stat.value) : stat.value}
              </p>
              <p className="dashboard-stat-delta">{stat.delta}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">💬 WhatsApp Orders</h2>
          <Link href="/admin/orders" className="dashboard-view-all-link">View all →</Link>
        </div>
        <div className="dashboard-stats-grid">
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-label">Total Orders</p>
            <p className="dashboard-stat-value">{waOrders.length}</p>
            <p className="dashboard-stat-delta">All time</p>
          </article>
          <article className="dashboard-stat-card dashboard-stat-card--warning">
            <p className="dashboard-stat-label">Needs Follow-up</p>
            <p className="dashboard-stat-value">{waPending}</p>
            <p className="dashboard-stat-delta">Pending action</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-label">Delivered</p>
            <p className="dashboard-stat-value">{waCompleted}</p>
            <p className="dashboard-stat-delta">Completed</p>
          </article>
          <article className="dashboard-stat-card dashboard-stat-card--success">
            <p className="dashboard-stat-label">WA Revenue</p>
            <p className="dashboard-stat-value">{formatKES(waRevenue)}</p>
            <p className="dashboard-stat-delta">Paid & delivered</p>
          </article>
        </div>
      </section>

      {waOrders.length > 0 ? (
        <>
          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">📦 Recent WhatsApp Orders</h2>
              <Link href="/admin/orders" className="dashboard-view-all-link">View all →</Link>
            </div>
            <div className="dashboard-orders-grid">
              {waOrders.slice(0, 8).map((order) => (
                <div key={order.id} className="dashboard-order-card">
                  <div className="dashboard-order-header">
                    <div className="dashboard-order-date">{new Date(order.timestamp).toLocaleDateString("en-KE")}</div>
                    <span className={`dashboard-order-status dashboard-order-status--${order.statusClass || "pending"}`}>
                      {order.statusLabel || order.status}
                    </span>
                  </div>
                  <div className="dashboard-order-body">
                    <h4 className="dashboard-order-customer">{order.name}</h4>
                    <a
                      href={`https://wa.me/254${order.phone?.replace(/^0/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dashboard-order-phone"
                    >
                      💬 {order.phone}
                    </a>
                  </div>
                  <div className="dashboard-order-footer">
                    <span className="dashboard-order-amount">{formatKES(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {customOrders.length > 0 ? (
        <>
          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">✨ Custom Orders</h2>
              <Link href="/admin/custom-orders" className="dashboard-view-all-link">View all →</Link>
            </div>
            <div className="dashboard-custom-grid">
              {customOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="dashboard-custom-card">
                  <div className="dashboard-custom-header">
                    <span className={`dashboard-custom-status dashboard-custom-status--${order.statusClass}`}>{order.statusLabel}</span>
                  </div>
                  <h4 className="dashboard-custom-name">{order.orderName}</h4>
                  <p className="dashboard-custom-customer">{order.customerName}</p>
                  <div className="dashboard-custom-qty">Qty: {order.quantity}</div>
                  <div className="dashboard-custom-footer">
                    <div className="dashboard-custom-amount">{formatKES(order.clientTotal)}</div>
                    <div className="dashboard-custom-profit">{formatKES(order.expectedProfit)} profit</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {orders.length > 0 ? (
        <>
          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">💳 M-Pesa Orders</h2>
            </div>
            <div className="dashboard-mpesa-grid">
              {orders.slice(0, 12).map((order) => (
                <div key={order.id} className="dashboard-mpesa-card">
                  <div className="dashboard-mpesa-header">
                    <span className="dashboard-mpesa-id">#{order.id}</span>
                    <span className={`dashboard-mpesa-status dashboard-mpesa-status--${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="dashboard-mpesa-body">
                    <p className="dashboard-mpesa-product">{order.product_name}</p>
                    <p className="dashboard-mpesa-buyer">{order.buyer_name}</p>
                  </div>
                  <div className="dashboard-mpesa-footer">
                    <span className="dashboard-mpesa-amount">{formatKES(order.amount_kes)}</span>
                    <span className={`dashboard-mpesa-via dashboard-mpesa-via--${order.via?.toLowerCase().replace("-", "")}`}>{order.via}</span>
                  </div>
                  <div className="dashboard-mpesa-date">{formatShortDate(order.date)}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <section className="dashboard-quick-actions">
        <h2 className="dashboard-section-title">⚡ Quick Actions</h2>
        <div className="dashboard-actions-grid">
          <Link href="/admin/products/new" className="dashboard-action-btn dashboard-action-btn--primary">
            ➕ Add Product
          </Link>
          <Link href="/admin/orders" className="dashboard-action-btn">
            📋 View Orders
          </Link>
          <Link href="/admin/custom-orders" className="dashboard-action-btn">
            ✨ Custom Tracker
          </Link>
          <Link href="/admin/marketing" className="dashboard-action-btn">
            📢 Marketing
          </Link>
          <Link href="/admin/offers" className="dashboard-action-btn">
            🎁 Offers
          </Link>
          <Link href="/admin/images" className="dashboard-action-btn">
            🖼️ Images
          </Link>
          <Link href="/admin/site-images" className="dashboard-action-btn">
            🎨 Site Content
          </Link>
          <Link href="/admin/health" className="dashboard-action-btn">
            🏥 Storage Health
          </Link>
        </div>
      </section>

      <style jsx>{`
        /* Dashboard Sections */
        .dashboard-section {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .dashboard-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f5f5f5;
        }

        .dashboard-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .dashboard-section-subtitle {
          font-size: 0.875rem;
          color: #999;
          margin: 0;
        }

        .dashboard-view-all-link {
          color: #d4a574;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .dashboard-view-all-link:hover {
          color: #e8c4a0;
        }

        /* Finance Section */
        .dashboard-finance-section {
          margin-bottom: 2rem;
        }

        .dashboard-finance-hero {
          background: linear-gradient(135deg, #fff5e6 0%, #fffbf0 100%);
          border: 1px solid #e8c4a0;
          border-radius: 12px;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .dashboard-finance-main {
          flex: 1;
        }

        .dashboard-overline {
          font-size: 0.875rem;
          font-weight: 600;
          color: #d4a574;
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dashboard-profit-display {
          margin: 1rem 0;
        }

        .dashboard-profit-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #d4a574;
          margin: 0;
        }

        .dashboard-profit-label {
          font-size: 0.875rem;
          color: #999;
          margin-top: 0.25rem;
        }

        .dashboard-helper-text {
          font-size: 0.85rem;
          color: #999;
          margin: 0.5rem 0 0 0;
        }

        .dashboard-finance-quick-stats {
          display: grid;
          gap: 0.75rem;
          min-width: 280px;
        }

        .dashboard-quick-stat {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .dashboard-quick-stat-icon {
          font-size: 1.5rem;
        }

        .dashboard-quick-stat-label {
          font-size: 0.75rem;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dashboard-quick-stat-value {
          font-size: 1rem;
          font-weight: 700;
          color: #d4a574;
          margin-left: auto;
        }

        .dashboard-finance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .dashboard-finance-card {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        .dashboard-finance-card:hover {
          border-color: #d4a574;
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
        }

        .dashboard-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .dashboard-card-icon {
          font-size: 1.5rem;
        }

        .dashboard-card-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #666;
        }

        .dashboard-card-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #d4a574;
          margin-bottom: 0.5rem;
        }

        .dashboard-card-subtext {
          font-size: 0.75rem;
          color: #999;
        }

        .dashboard-finance-form-section {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 1.5rem;
        }

        .dashboard-form-title {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 1rem 0;
        }

        .dashboard-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .dashboard-form-field {
          display: flex;
          flex-direction: column;
        }

        .dashboard-form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .dashboard-form-input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.3s ease;
        }

        .dashboard-form-input:focus {
          outline: none;
          border-color: #d4a574;
          box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
        }

        .dashboard-form-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .dashboard-btn-primary {
          background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dashboard-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
        }

        .dashboard-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .dashboard-success-msg {
          color: #059669;
          font-size: 0.9rem;
          margin: 0;
        }

        .dashboard-error-msg {
          color: #d32f2f;
          font-size: 0.9rem;
          margin: 0;
        }

        /* Stats Grid */
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .dashboard-stat-card {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .dashboard-stat-card:hover {
          border-color: #d4a574;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
        }

        .dashboard-stat-card--warning {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%);
        }

        .dashboard-stat-card--success {
          border-color: #10b981;
          background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%);
        }

        .dashboard-stat-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.75rem 0;
        }

        .dashboard-stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .dashboard-stat-terracotta {
          color: #d4a574;
        }

        .dashboard-stat-delta {
          font-size: 0.875rem;
          color: #999;
          margin: 0;
        }

        /* Orders Grid */
        .dashboard-orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .dashboard-order-card {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        .dashboard-order-card:hover {
          border-color: #d4a574;
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
        }

        .dashboard-order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .dashboard-order-date {
          font-size: 0.8rem;
          font-weight: 600;
          color: #999;
        }

        .dashboard-order-status {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dashboard-order-status--new,
        .dashboard-order-status--seen {
          background: #fef3c7;
          color: #92400e;
        }

        .dashboard-order-status--confirmed,
        .dashboard-order-status--paid {
          background: #dbeafe;
          color: #1e40af;
        }

        .dashboard-order-status--dispatched {
          background: #bfdbfe;
          color: #1e3a8a;
        }

        .dashboard-order-status--delivered {
          background: #d1fae5;
          color: #065f46;
        }

        .dashboard-order-status--pending {
          background: #f3f4f6;
          color: #6b7280;
        }

        .dashboard-order-body {
          margin-bottom: 1rem;
        }

        .dashboard-order-customer {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .dashboard-order-phone {
          color: #25d366;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .dashboard-order-phone:hover {
          color: #1ea952;
        }

        .dashboard-order-footer {
          text-align: right;
        }

        .dashboard-order-amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #d4a574;
        }

        /* Custom Orders Grid */
        .dashboard-custom-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .dashboard-custom-card {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        .dashboard-custom-card:hover {
          border-color: #d4a574;
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
        }

        .dashboard-custom-header {
          margin-bottom: 0.75rem;
        }

        .dashboard-custom-status {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f0f0f0;
          color: #666;
        }

        .dashboard-custom-status--quoted {
          background: #fef3c7;
          color: #92400e;
        }

        .dashboard-custom-status--waiting_deposit {
          background: #fee2e2;
          color: #991b1b;
        }

        .dashboard-custom-status--deposit_received {
          background: #bfdbfe;
          color: #1e40af;
        }

        .dashboard-custom-status--in_production {
          background: #fcd34d;
          color: #78350f;
        }

        .dashboard-custom-status--ready {
          background: #bfdbfe;
          color: #1e40af;
        }

        .dashboard-custom-status--balance_received {
          background: #d1fae5;
          color: #065f46;
        }

        .dashboard-custom-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #333;
          margin: 0.5rem 0;
        }

        .dashboard-custom-customer {
          font-size: 0.85rem;
          color: #666;
          margin: 0.25rem 0;
        }

        .dashboard-custom-qty {
          font-size: 0.8rem;
          color: #999;
          margin: 0.5rem 0;
        }

        .dashboard-custom-footer {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-top: 0.75rem;
          border-top: 1px solid #f0f0f0;
          margin-top: 0.75rem;
        }

        .dashboard-custom-amount {
          font-size: 1rem;
          font-weight: 700;
          color: #d4a574;
        }

        .dashboard-custom-profit {
          font-size: 0.75rem;
          color: #999;
        }

        /* M-Pesa Grid */
        .dashboard-mpesa-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .dashboard-mpesa-card {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        .dashboard-mpesa-card:hover {
          border-color: #d4a574;
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
        }

        .dashboard-mpesa-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .dashboard-mpesa-id {
          font-size: 0.8rem;
          font-weight: 600;
          color: #999;
        }

        .dashboard-mpesa-status {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dashboard-mpesa-status--completed {
          background: #d1fae5;
          color: #065f46;
        }

        .dashboard-mpesa-status--pending {
          background: #fef3c7;
          color: #92400e;
        }

        .dashboard-mpesa-status--failed {
          background: #fee2e2;
          color: #991b1b;
        }

        .dashboard-mpesa-body {
          margin-bottom: 0.75rem;
        }

        .dashboard-mpesa-product {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.25rem 0;
        }

        .dashboard-mpesa-buyer {
          font-size: 0.8rem;
          color: #666;
          margin: 0;
        }

        .dashboard-mpesa-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          padding: 0.75rem 0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
        }

        .dashboard-mpesa-amount {
          font-size: 1rem;
          font-weight: 700;
          color: #d4a574;
        }

        .dashboard-mpesa-via {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          background: #f0f0f0;
          color: #666;
          text-transform: uppercase;
        }

        .dashboard-mpesa-via--mpesa {
          background: #d1fae5;
          color: #065f46;
        }

        .dashboard-mpesa-via--card {
          background: #bfdbfe;
          color: #1e40af;
        }

        .dashboard-mpesa-date {
          font-size: 0.75rem;
          color: #999;
          text-align: right;
        }

        /* Quick Actions */
        .dashboard-quick-actions {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .dashboard-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .dashboard-action-btn {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          text-decoration: none;
          text-align: center;
          font-weight: 500;
          color: #666;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .dashboard-action-btn:hover {
          border-color: #d4a574;
          color: #d4a574;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
        }

        .dashboard-action-btn--primary {
          background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
          color: white;
          border: none;
        }

        .dashboard-action-btn--primary:hover {
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-finance-hero {
            flex-direction: column;
          }

          .dashboard-finance-quick-stats {
            min-width: auto;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
          }

          .dashboard-finance-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .dashboard-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-form-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-section-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
