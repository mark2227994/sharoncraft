import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";
import Icon from "../components/icons";
import { formatKES, formatShortDate } from "../lib/formatters";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (!data.user) { router.push("/login"); return; }
      setUser(data.user);

      // Load user orders
      const ordersRes = await fetch("/api/user/orders");
      const ordersData = await ordersRes.json();
      if (ordersData.orders) {
        setOrders(ordersData.orders);
      }
    } catch (e) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "DELETE" });
    router.push("/");
  }

  function getStatusColor(status) {
    const colors = {
      new: "var(--color-ochre)",
      seen: "var(--color-moss)",
      confirmed: "var(--color-terracotta)",
      paid: "var(--color-terracotta-dark)",
      dispatched: "#2563eb",
      delivered: "#059669",
      cancelled: "#dc2626",
    };
    return colors[status] || "var(--text-muted)";
  }

  function getStatusLabel(status) {
    const labels = {
      new: "New Order",
      seen: "Reviewed",
      confirmed: "Confirmed",
      paid: "Paid",
      dispatched: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  }

  if (loading) return (
    <>
      <SeoHead title="Account"/>
      <Nav/>
      <main style={{padding:"2rem", textAlign:"center"}}>Loading your account...</main>
      <Footer/>
    </>
  );

  if (!user) return null;

  return (
    <>
      <SeoHead title="My Account - SharonCraft" path="/account"/>
      <Nav />

      <main className="account-page">
        <div className="account-container">
          {/* Header */}
          <div className="account-header">
            <div className="account-welcome">
              <h1 className="account-title">
                Welcome back{user.name ? `, ${user.name}` : ""}!
              </h1>
              <p className="account-subtitle">Manage your account and view your orders</p>
            </div>
            <button onClick={handleLogout} className="account-logout-btn">
              <Icon name="logOut" size={16} />
              Logout
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="account-tabs">
            <button
              className={`account-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`account-tab ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              Orders ({orders.length})
            </button>
            <button
              className={`account-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
          </div>

          {/* Tab Content */}
          <div className="account-content">
            {activeTab === "overview" && (
              <div className="account-overview">
                {/* Quick Stats */}
                <div className="account-stats">
                  <div className="stat-card">
                    <div className="stat-number">{orders.length}</div>
                    <div className="stat-label">Total Orders</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {orders.filter(o => o.status === "delivered").length}
                    </div>
                    <div className="stat-label">Delivered</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {orders.filter(o => ["new", "seen", "confirmed", "paid", "dispatched"].includes(o.status)).length}
                    </div>
                    <div className="stat-label">In Progress</div>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                {orders.length > 0 && (
                  <div className="account-section">
                    <h3 className="section-title">Recent Orders</h3>
                    <div className="recent-orders">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="order-preview">
                          <div className="order-preview-header">
                            <span className="order-id">#{order.orderReference}</span>
                            <span
                              className="order-status"
                              style={{ color: getStatusColor(order.status) }}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <div className="order-preview-details">
                            <span>{formatShortDate(order.timestamp)}</span>
                            <span>{formatKES(order.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {orders.length > 3 && (
                      <button
                        className="view-all-btn"
                        onClick={() => setActiveTab("orders")}
                      >
                        View All Orders â†’
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="account-section">
                  <h3 className="section-title">Quick Actions</h3>
                  <div className="quick-actions">
                    <Link href="/wishlist" className="action-card">
                      <Icon name="heart" size={24} />
                      <span>My Wishlist</span>
                    </Link>
                    <Link href="/shop" className="action-card">
                      <Icon name="shoppingBag" size={24} />
                      <span>Continue Shopping</span>
                    </Link>
                    <a
                      href="https://wa.me/254112222572"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-card"
                    >
                      <Icon name="messageCircle" size={24} />
                      <span>Contact Support</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="account-orders">
                <h3 className="section-title">Order History</h3>
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <Icon name="package" size={48} />
                    <h4>No orders yet</h4>
                    <p>You haven't placed any orders yet.</p>
                    <Link href="/shop" className="empty-action">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div className="order-info">
                            <h4 className="order-reference">#{order.orderReference}</h4>
                            <p className="order-date">{formatShortDate(order.timestamp)}</p>
                          </div>
                          <div className="order-status-section">
                            <span
                              className="order-status-badge"
                              style={{
                                backgroundColor: getStatusColor(order.status) + "20",
                                color: getStatusColor(order.status)
                              }}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                        </div>

                        <div className="order-details">
                          <div className="order-items">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="order-item">
                                <span className="item-name">{item.name}</span>
                                <span className="item-qty">Ã—{item.quantity}</span>
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <div className="order-item-more">
                                +{order.items.length - 2} more items
                              </div>
                            )}
                          </div>

                          <div className="order-total">
                            <span className="total-label">Total</span>
                            <span className="total-amount">{formatKES(order.total)}</span>
                          </div>
                        </div>

                        {order.note && (
                          <div className="order-note">
                            <Icon name="messageSquare" size={14} />
                            <span>{order.note}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="account-profile">
                <h3 className="section-title">Profile Information</h3>
                <div className="profile-card">
                  <div className="profile-field">
                    <label className="field-label">Email Address</label>
                    <div className="field-value">
                      {user.email}
                      {user.email_confirmed_at && (
                        <span className="verified-badge">
                          <Icon name="check" size={12} />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="profile-field">
                    <label className="field-label">Full Name</label>
                    <div className="field-value">
                      {user.name || "Not provided"}
                    </div>
                  </div>

                  <div className="profile-field">
                    <label className="field-label">Account Created</label>
                    <div className="field-value">
                      {user.email_confirmed_at
                        ? formatShortDate(user.email_confirmed_at)
                        : "Not verified"
                      }
                    </div>
                  </div>

                  <div className="profile-field">
                    <label className="field-label">Account Status</label>
                    <div className="field-value">
                      <span className="status-active">Active</span>
                    </div>
                  </div>
                </div>

                <div className="profile-actions">
                  <p className="profile-note">
                    Need to update your information? Contact our support team.
                  </p>
                  <a
                    href="https://wa.me/254112222572?text=Hi%20SharonCraft!%20I%20need%20help%20updating%20my%20account%20information."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-support-btn"
                  >
                    <Icon name="messageCircle" size={16} />
                    Contact Support
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .account-page {
          min-height: 70vh;
          padding: var(--space-6) var(--gutter);
          background: var(--bg-page);
        }

        .account-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .account-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--border-default);
        }

        .account-welcome h1 {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: var(--space-2);
          color: var(--text-primary);
        }

        .account-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .account-logout-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: transparent;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .account-logout-btn:hover {
          background: var(--color-cream-dark);
          border-color: var(--color-terracotta);
          color: var(--color-terracotta);
        }

        .account-tabs {
          display: flex;
          gap: var(--space-1);
          margin-bottom: var(--space-6);
          border-bottom: 1px solid var(--border-default);
        }

        .account-tab {
          padding: var(--space-3) var(--space-4);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .account-tab:hover {
          color: var(--color-terracotta);
        }

        .account-tab.active {
          color: var(--color-terracotta);
          border-bottom-color: var(--color-terracotta);
        }

        .account-content {
          min-height: 400px;
        }

        /* Overview Tab */
        .account-overview {
          display: grid;
          gap: var(--space-6);
        }

        .account-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--space-4);
        }

        .stat-card {
          background: var(--color-white);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-default);
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 600;
          color: var(--color-terracotta);
          margin-bottom: var(--space-1);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .account-section {
          background: var(--color-white);
          padding: var(--space-5);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-default);
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: var(--space-4);
          color: var(--text-primary);
        }

        .recent-orders {
          display: grid;
          gap: var(--space-3);
        }

        .order-preview {
          padding: var(--space-3);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: var(--bg-card);
        }

        .order-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .order-id {
          font-weight: 600;
          color: var(--text-primary);
        }

        .order-status {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .order-preview-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .view-all-btn {
          margin-top: var(--space-4);
          padding: var(--space-2) var(--space-4);
          background: var(--color-terracotta);
          color: var(--color-white);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background var(--transition-fast);
        }

        .view-all-btn:hover {
          background: var(--color-terracotta-dark);
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--space-3);
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4);
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          color: var(--text-primary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .action-card:hover {
          border-color: var(--color-terracotta);
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
        }

        .action-card span {
          font-size: 0.875rem;
          font-weight: 500;
          text-align: center;
        }

        /* Orders Tab */
        .account-orders {
          max-width: 800px;
        }

        .empty-state {
          text-align: center;
          padding: var(--space-8) var(--space-4);
          color: var(--text-secondary);
        }

        .empty-state h4 {
          font-size: 1.25rem;
          margin: var(--space-3) 0 var(--space-2);
          color: var(--text-primary);
        }

        .empty-action {
          display: inline-block;
          margin-top: var(--space-4);
          padding: var(--space-3) var(--space-5);
          background: var(--color-terracotta);
          color: var(--color-white);
          text-decoration: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: background var(--transition-fast);
        }

        .empty-action:hover {
          background: var(--color-terracotta-dark);
        }

        .orders-list {
          display: grid;
          gap: var(--space-4);
        }

        .order-card {
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-4);
        }

        .order-info h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: var(--space-1);
          color: var(--text-primary);
        }

        .order-date {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .order-status-section {
          text-align: right;
        }

        .order-status-badge {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .order-details {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: var(--space-4);
        }

        .order-items {
          flex: 1;
          margin-right: var(--space-4);
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-1);
        }

        .order-item-more {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .order-total {
          text-align: right;
        }

        .total-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-1);
        }

        .total-amount {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-terracotta);
        }

        .order-note {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--color-cream-dark);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        /* Profile Tab */
        .account-profile {
          max-width: 600px;
        }

        .profile-card {
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin-bottom: var(--space-5);
        }

        .profile-field {
          margin-bottom: var(--space-4);
        }

        .profile-field:last-child {
          margin-bottom: 0;
        }

        .field-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: var(--space-2);
        }

        .field-value {
          font-size: 1rem;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-2);
          background: #dcfce7;
          color: #166534;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-active {
          color: #059669;
          font-weight: 500;
        }

        .profile-actions {
          text-align: center;
        }

        .profile-note {
          color: var(--text-secondary);
          margin-bottom: var(--space-4);
          font-size: 0.875rem;
        }

        .contact-support-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          background: var(--color-terracotta);
          color: var(--color-white);
          text-decoration: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: background var(--transition-fast);
        }

        .contact-support-btn:hover {
          background: var(--color-terracotta-dark);
        }

        @media (max-width: 768px) {
          .account-header {
            flex-direction: column;
            gap: var(--space-4);
            align-items: stretch;
          }

          .account-logout-btn {
            align-self: flex-end;
          }

          .account-tabs {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .account-stats {
            grid-template-columns: repeat(3, 1fr);
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }

          .order-header {
            flex-direction: column;
            gap: var(--space-2);
            align-items: flex-start;
          }

          .order-status-section {
            align-self: flex-end;
          }

          .order-details {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-3);
          }

          .order-items {
            margin-right: 0;
          }

          .order-total {
            align-self: flex-end;
          }
        }
      `}</style>
    </>
  );
}

function getStatusColor(status) {
  const colors = {
    new: "var(--color-ochre)",
    seen: "var(--color-moss)",
    confirmed: "var(--color-terracotta)",
    paid: "var(--color-terracotta-dark)",
    dispatched: "#2563eb",
    delivered: "#059669",
    cancelled: "#dc2626",
  };
  return colors[status] || "var(--text-muted)";
}

function getStatusLabel(status) {
  const labels = {
    new: "New Order",
    seen: "Reviewed",
    confirmed: "Confirmed",
    paid: "Paid",
    dispatched: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}
