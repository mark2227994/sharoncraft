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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        {/* Header */}
        <div className="account-header">
          <div className="account-welcome">
            <h1 className="account-title">
              Welcome back{user.name ? `, ${user.name}` : ""}!
            </h1>
            <p className="account-subtitle">Manage your account and view your orders</p>
          </div>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <button onClick={handleLogout} className="account-logout-btn">
            <Icon name="logOut" size={16} />
            Logout
          </button>
        </div>

        <div className="account-container">
          {/* Sidebar Navigation */}
          <nav className={`account-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
            <div className="sidebar-header">
              <h3>Account</h3>
            </div>
            <div className="sidebar-sections">
              <button className={`sidebar-item ${activeTab === "overview" ? "active" : ""}`} onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}>
                <Icon name="user" size={18} /> <span>Dashboard</span> {activeTab === "overview" && <span className="sidebar-indicator">→</span>}
              </button>
              <button className={`sidebar-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => { setActiveTab("orders"); setMobileMenuOpen(false); }}>
                <Icon name="package" size={18} /> <span>Order History</span> {activeTab === "orders" && <span className="sidebar-indicator">→</span>} {orders.length > 0 && <span className="sidebar-badge">{orders.length}</span>}
              </button>
              <Link href="/wishlist" className="sidebar-item sidebar-link">
                <Icon name="heart" size={18} /> <span>Wishlist</span>
              </Link>
              <button className={`sidebar-item ${activeTab === "addresses" ? "active" : ""}`} onClick={() => { setActiveTab("addresses"); setMobileMenuOpen(false); }}>
                <Icon name="mapPin" size={18} /> <span>Addresses</span> {activeTab === "addresses" && <span className="sidebar-indicator">→</span>}
              </button>
              <button className={`sidebar-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}>
                <Icon name="settings" size={18} /> <span>Settings</span> {activeTab === "settings" && <span className="sidebar-indicator">→</span>}
              </button>
              <a href="https://wa.me/254112222572" target="_blank" rel="noopener noreferrer" className="sidebar-item sidebar-link support">
                <Icon name="messageCircle" size={18} /> <span>Support</span>
              </a>
            </div>
          </nav>

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
        }

        /* Sidebar Navigation */
        .account-page {
          display: flex;
          flex-direction: column;
        }

        .account-header {
          display: flex !important;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--border-default);
        }

        .account-welcome {
          flex: 1;
        }

        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          background: transparent;
          border: none;
          cursor: pointer;
          gap: 6px;
          padding: 0;
          margin: 0 var(--space-3);
        }

        .mobile-menu-toggle span {
          width: 24px;
          height: 2px;
          background: var(--text-primary);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .account-container {
          display: grid !important;
          grid-template-columns: 260px 1fr;
          gap: var(--space-5);
          max-width: 1200px;
          margin: 0 auto !important;
        }

        .account-sidebar {
          position: sticky;
          top: var(--space-4);
          background: white;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 0;
          height: fit-content;
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }

        .sidebar-header {
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-light);
        }

        .sidebar-header h3 {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          margin: 0;
        }

        .sidebar-sections {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.938rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          position: relative;
          text-decoration: none;
        }

        .sidebar-item:hover {
          background: var(--color-cream);
          color: var(--color-accent);
        }

        .sidebar-item.active {
          background: rgba(212, 175, 55, 0.1);
          color: var(--color-accent);
          border-right: 3px solid var(--color-accent);
        }

        .sidebar-item svg {
          flex-shrink: 0;
          opacity: 0.7;
        }

        .sidebar-item.active svg {
          opacity: 1;
        }

        .sidebar-indicator {
          margin-left: auto;
          font-size: 1rem;
          opacity: 0.6;
        }

        .sidebar-badge {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 600;
          width: 24px;
          height: 24px;
          min-width: 24px;
        }

        .sidebar-link {
          text-decoration: none;
        }

        .sidebar-link.support {
          border-top: 1px solid var(--border-light);
          margin-top: var(--space-2);
          padding-top: var(--space-3);
        }

        .account-content {
          display: grid !important;
          min-height: 400px;
          gap: var(--space-4);
        }

        @media (max-width: 768px) {
          .account-header {
            flex-wrap: wrap;
            gap: var(--space-2);
          }

          .account-welcome {
            flex-basis: 100%;
            order: 1;
          }

          .mobile-menu-toggle {
            display: flex;
            order: 2;
          }

          .account-logout-btn {
            order: 3;
            width: 100%;
          }

          .account-container {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }

          .account-sidebar {
            position: fixed;
            left: -280px;
            top: 0;
            width: 280px;
            height: 100vh;
            z-index: 999;
            border-radius: 0;
            border-right: 1px solid var(--border-default);
            border-bottom: none;
            max-height: none;
            transition: left 0.3s ease;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
          }

          .account-sidebar.mobile-open {
            left: 0;
          }

          .account-content {
            min-height: auto;
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
