import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";

const ORDER_STATUSES = {
  pending: { label: "Order Received", color: "#FFB84D" },
  confirmed: { label: "Confirmed", color: "#FFB84D" },
  processing: { label: "Being Handcrafted", color: "#FFB84D" },
  ready: { label: "Ready to Ship", color: "#FFB84D" },
  shipped: { label: "In Transit", color: "#3B9E8F" },
  delivered: { label: "Delivered", color: "#3B9E8F" },
  cancelled: { label: "Cancelled", color: "#D84C3C" },
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        router.push("/login?redirect=/account");
        return;
      }

      const userData = await response.json();
      setUser(userData);

      // Fetch orders
      const ordersResponse = await fetch("/api/user/orders");
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData || []);
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <SeoHead title="My Account - SharonCraft" path="/account" />
        <Nav />
        <div style={{ padding: "var(--space-8)", textAlign: "center" }}>Loading...</div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SeoHead title="My Account - SharonCraft" path="/account" />
        <Nav />
        <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
          <p>Please log in to view your account.</p>
          <Link href="/login">Go to Login</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SeoHead title="My Account - SharonCraft" path="/account" />
      <Nav />

      <div className="account-page">
        <div className="container">
          <div className="account__header">
            <h1 className="display-lg">My Account</h1>
            <p className="body-base">Welcome back, {user.name || user.email}!</p>
          </div>

          <div className="account__tabs">
            <button
              className={`account__tab ${activeTab === "orders" ? "account__tab--active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              Order History
            </button>
            <button
              className={`account__tab ${activeTab === "profile" ? "account__tab--active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
            <button
              className={`account__tab ${activeTab === "addresses" ? "account__tab--active" : ""}`}
              onClick={() => setActiveTab("addresses")}
            >
              Saved Addresses
            </button>
          </div>

          {activeTab === "orders" && (
            <section className="account__section">
              <h2 className="section-title">Your Orders</h2>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't placed any orders yet.</p>
                  <Link href="/shop" className="cta-button">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-card__header">
                        <div>
                          <h3 className="order-card__id">Order {order.order_id}</h3>
                          <p className="order-card__date">
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="order-card__status" style={{ borderColor: ORDER_STATUSES[order.status]?.color }}>
                          {ORDER_STATUSES[order.status]?.label || order.status}
                        </div>
                      </div>

                      <div className="order-card__items">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="order-item-line">
                            <span className="order-item-line__name">{item.productName || item.name}</span>
                            <span className="order-item-line__qty">x{item.quantity}</span>
                            <span className="order-item-line__price">KES {item.price?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-card__footer">
                        <div className="order-total">
                          <span>Total:</span>
                          <span className="order-total__amount">KES {order.total_amount?.toLocaleString()}</span>
                        </div>
                        <Link href={`/track-order?order=${order.order_id}`} className="order-card__link">
                          Track Order
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "profile" && (
            <section className="account__section">
              <h2 className="section-title">Profile Information</h2>

              {!editingProfile ? (
                <div className="profile-view">
                  <div className="profile-field">
                    <span className="profile-field__label">Name</span>
                    <span className="profile-field__value">{user.name || "Not provided"}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field__label">Email</span>
                    <span className="profile-field__value">{user.email}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field__label">Phone</span>
                    <span className="profile-field__value">{user.phone || "Not provided"}</span>
                  </div>
                  <button className="profile-edit-btn" onClick={() => setEditingProfile(true)}>
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="profile-edit">
                  <p className="edit-notice">Profile editing features coming soon. Contact support to update your information.</p>
                  <button className="profile-edit-btn" onClick={() => setEditingProfile(false)}>
                    Close
                  </button>
                </div>
              )}
            </section>
          )}

          {activeTab === "addresses" && (
            <section className="account__section">
              <h2 className="section-title">Saved Addresses</h2>
              <div className="addresses-placeholder">
                <p>No saved addresses yet.</p>
                <p className="caption">Addresses will appear here after your first order.</p>
              </div>
            </section>
          )}

          <section className="account__help">
            <h2 className="section-title">Need Help?</h2>
            <div className="help-options">
              <a href="/contact" className="help-option">
                <h3>Contact Support</h3>
                <p>Send us a message and we'll help you right away</p>
              </a>
              <a href={`https://wa.me/254112222572`} className="help-option" target="_blank" rel="noopener noreferrer">
                <h3>WhatsApp Us</h3>
                <p>Chat with us on WhatsApp for quick answers</p>
              </a>
              <a href="/faq" className="help-option">
                <h3>FAQ</h3>
                <p>Find answers to common questions</p>
              </a>
            </div>
          </section>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .account-page {
          min-height: 100vh;
          padding: calc(var(--nav-height) + var(--space-8)) var(--gutter) var(--space-8);
          background: linear-gradient(135deg, #f9f6ee 0%, #fefdfb 100%);
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        .account__header {
          margin-bottom: var(--space-8);
        }

        .account__header h1 {
          margin-bottom: var(--space-2);
        }

        .account__tabs {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-8);
          border-bottom: 1px solid var(--border-default);
          background: white;
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          padding: 0 var(--space-4);
        }

        .account__tab {
          background: none;
          border: none;
          padding: var(--space-4) var(--space-3);
          font-weight: 500;
          cursor: pointer;
          color: var(--text-secondary);
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          position: relative;
          top: 1px;
        }

        .account__tab:hover {
          color: var(--text-primary);
        }

        .account__tab--active {
          color: var(--color-accent);
          border-bottom-color: var(--color-accent);
        }

        .account__section {
          background: white;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 var(--space-6) 0;
          color: var(--text-primary);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-8);
        }

        .empty-state p {
          color: var(--text-secondary);
          margin-bottom: var(--space-4);
        }

        .cta-button {
          display: inline-block;
          padding: 12px 32px;
          background: var(--color-accent);
          color: white;
          text-decoration: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .cta-button:hover {
          background: var(--color-accent-dark);
          transform: translateY(-2px);
        }

        .orders-list {
          display: grid;
          gap: var(--space-4);
        }

        .order-card {
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          transition: all 0.2s ease;
        }

        .order-card:hover {
          border-color: var(--color-accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .order-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--border-default);
        }

        .order-card__id {
          font-weight: 600;
          margin: 0 0 var(--space-1) 0;
          color: var(--text-primary);
        }

        .order-card__date {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .order-card__status {
          padding: 6px 12px;
          border: 2px solid;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .order-card__items {
          margin-bottom: var(--space-4);
        }

        .order-item-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-2) 0;
          font-size: 0.9rem;
        }

        .order-item-line__name {
          flex: 1;
          color: var(--text-primary);
        }

        .order-item-line__qty {
          color: var(--text-secondary);
          margin: 0 var(--space-3);
        }

        .order-item-line__price {
          font-weight: 600;
          color: var(--text-primary);
          min-width: 100px;
          text-align: right;
        }

        .order-card__footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-default);
        }

        .order-total {
          display: flex;
          gap: var(--space-2);
          font-weight: 600;
        }

        .order-total__amount {
          color: var(--color-accent);
        }

        .order-card__link {
          padding: 8px 16px;
          background: var(--color-accent);
          color: white;
          text-decoration: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .order-card__link:hover {
          background: var(--color-accent-dark);
        }

        .profile-view {
          display: grid;
          gap: var(--space-4);
        }

        .profile-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--border-default);
        }

        .profile-field:last-child {
          border-bottom: none;
        }

        .profile-field__label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .profile-field__value {
          color: var(--text-secondary);
        }

        .profile-edit-btn {
          margin-top: var(--space-4);
          padding: 12px 24px;
          background: var(--color-accent);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .profile-edit-btn:hover {
          background: var(--color-accent-dark);
        }

        .edit-notice {
          color: var(--text-secondary);
          padding: var(--space-4);
          background: #f0f8f6;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
        }

        .addresses-placeholder {
          text-align: center;
          padding: var(--space-8);
          color: var(--text-secondary);
        }

        .caption {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .account__help {
          background: #f0f8f6;
          border-radius: var(--radius-lg);
          padding: var(--space-6);
        }

        .help-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-4);
        }

        .help-option {
          background: white;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .help-option:hover {
          border-color: var(--color-accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .help-option h3 {
          margin: 0 0 var(--space-2) 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .help-option p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .account-page {
            padding: calc(var(--nav-height) + var(--space-4)) var(--gutter) var(--space-6);
          }

          .account__tabs {
            padding: 0;
            gap: 0;
          }

          .account__tab {
            flex: 1;
            text-align: center;
            padding: var(--space-3);
          }

          .order-card__header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
          }

          .order-card__footer {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-3);
          }
        }
      `}</style>
    </>
  );
}
