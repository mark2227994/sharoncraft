import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import SeoHead from "../../components/SeoHead";
import AccountNav from "../../components/AccountNav";
import Icon from "../../components/icons";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();

        if (!sessionData.user) {
          router.push("/login");
          return;
        }

        setUser(sessionData.user);

        // Fetch orders
        const ordersRes = await fetch("/api/user/orders");
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);

        // Fetch wishlist
        const wishlistRes = await fetch("/api/user/wishlist");
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          setWishlistCount(wishlistData.product_ids?.length || 0);
        }
      } catch (error) {
        console.error("Load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <>
        <SeoHead title="Account" description="Your SharonCraft account" path="/account" noindex />
        <Nav />
        <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null;
  }

  const recentOrders = orders.slice(0, 5);
  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <>
      <SeoHead
        title="My Account - SharonCraft"
        description="Manage your SharonCraft account, orders, and wishlist"
        path="/account"
        noindex
      />
      <Nav />
      <main className="account-page">
        <div className="account-page-mobile-header">
          <button
            className="account-page__nav-button"
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle navigation"
          >
            <Icon name="menu" size={20} />
            <span>Menu</span>
          </button>
        </div>

        {navOpen && (
          <div
            className="account-page__overlay"
            onClick={() => setNavOpen(false)}
          />
        )}

        <div className={`account-nav ${navOpen ? "account-nav--open" : ""}`}>
          <AccountNav isMobile onClose={() => setNavOpen(false)} />
        </div>

        <div className="account-page__layout">
          <aside className="account-page__sidebar">
            <AccountNav />
          </aside>

          <div className="account-content">
            {/* Welcome Card */}
            <div className="account-card">
              <div className="account-card__header">
                <h1 className="account-card__title">Welcome back, {user.name || user.email.split("@")[0]}!</h1>
                <Link href="/account/profile" className="account-card__action">
                  Edit Profile
                </Link>
              </div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
                Manage your account details, view orders, and track your wishlist.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="account-stats-grid">
              <div className="account-stat-card">
                <div className="account-stat-card__icon">
                  <Icon name="package" size={24} />
                </div>
                <p className="account-stat-card__label">Total Orders</p>
                <p className="account-stat-card__value">{orders.length}</p>
              </div>

              <div className="account-stat-card">
                <div className="account-stat-card__icon">
                  <Icon name="heart" size={24} />
                </div>
                <p className="account-stat-card__label">Wishlist Items</p>
                <p className="account-stat-card__value">{wishlistCount}</p>
              </div>

              <div className="account-stat-card">
                <div className="account-stat-card__icon">
                  <Icon name="money" size={24} />
                </div>
                <p className="account-stat-card__label">Total Spent</p>
                <p className="account-stat-card__value">KES {totalSpent.toLocaleString()}</p>
              </div>

              <div className="account-stat-card">
                <div className="account-stat-card__icon">
                  <Icon name="check" size={24} />
                </div>
                <p className="account-stat-card__label">Account Status</p>
                <p className="account-stat-card__value">{user.email_confirmed_at ? "Verified" : "Pending"}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="account-card">
              <div className="account-card__header">
                <h2 className="account-card__title">Recent Orders</h2>
                <Link href="/account/orders" className="account-card__action">
                  View All
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="orders-list">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="orders-list__item">
                      <div className="orders-list__item-info">
                        <p className="orders-list__order-id">Order #{order.id?.slice(0, 8) || "N/A"}</p>
                        <p className="orders-list__date">
                          {order.timestamp ? new Date(order.timestamp).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p className="orders-list__amount">KES {(order.total || 0).toLocaleString()}</p>
                        <span className="orders-list__status orders-list__status--pending">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="orders-list__empty">
                  <p>No orders yet. <Link href="/shop">Start shopping</Link></p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="account-card">
              <h2 className="account-card__title" style={{ marginBottom: "var(--space-4)" }}>Quick Actions</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--space-4)" }}>
                <Link href="/account/profile" className="account-action-button">
                  <Icon name="settings" size={20} />
                  Edit Profile
                </Link>
                <Link href="/account/orders" className="account-action-button">
                  <Icon name="package" size={20} />
                  View Orders
                </Link>
                <Link href="/account/wishlist" className="account-action-button">
                  <Icon name="heart" size={20} />
                  My Wishlist
                </Link>
                <Link href="/shop" className="account-action-button">
                  <Icon name="shopping-bag" size={20} />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        .account-page {
          min-height: 100vh;
          background: var(--color-white);
        }

        .account-page-mobile-header {
          display: none;
          padding: var(--space-4) var(--gutter);
          border-bottom: 1px solid var(--border-default);
        }

        .account-page__nav-button {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: none;
          border: 1px solid var(--border-default);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 600;
          color: var(--text-primary);
        }

        .account-page__overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99;
        }

        .account-page__layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--space-8);
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-8) var(--gutter);
        }

        .account-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
        }

        .account-stat-card {
          padding: var(--space-4);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .account-stat-card__icon {
          display: flex;
          justify-content: center;
          margin-bottom: var(--space-3);
          color: var(--color-terracotta);
        }

        .account-stat-card__label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--space-2);
        }

        .account-stat-card__value {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .account-action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-4);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 600;
          transition: all 0.2s;
        }

        .account-action-button:hover {
          border-color: var(--color-terracotta);
          background: rgba(192, 77, 41, 0.03);
        }

        @media (max-width: 900px) {
          .account-page-mobile-header {
            display: block;
          }

          .account-page__overlay {
            display: none;
          }

          .account-page__overlay.visible {
            display: block;
          }

          .account-page__layout {
            grid-template-columns: 1fr;
            gap: var(--space-6);
            padding: var(--space-6) var(--gutter);
          }

          .account-page__sidebar {
            display: none;
          }

          .account-nav {
            position: fixed;
            left: -280px;
            top: 0;
            bottom: 0;
            width: 280px;
            background: var(--color-white);
            border-right: 1px solid var(--border-default);
            padding: var(--space-6);
            transition: left 0.3s ease;
            z-index: 100;
            overflow-y: auto;
          }

          .account-nav--open {
            left: 0;
          }
        }
      `}</style>
    </>
  );
}
