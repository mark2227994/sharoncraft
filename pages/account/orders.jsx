import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import SeoHead from "../../components/SeoHead";
import AccountNav from "../../components/AccountNav";
import Icon from "../../components/icons";

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
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

        const ordersRes = await fetch("/api/user/orders");
        const ordersData = await ordersRes.json();

        setOrders(ordersData.orders || ordersData || []);
      } catch (error) {
        console.error("Load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: "Pending", class: "orders-list__status--pending" },
      confirmed: { text: "Confirmed", class: "orders-list__status--completed" },
      completed: { text: "Completed", class: "orders-list__status--completed" },
      cancelled: { text: "Cancelled", class: "orders-list__status--cancelled" },
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <>
        <SeoHead title="My Orders" description="View your orders" path="/account/orders" noindex />
        <Nav />
        <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <SeoHead title="My Orders - SharonCraft" description="View your SharonCraft orders" path="/account/orders" noindex />
      <Nav />
      <main className="account-page">
        <div style={{ position: "relative", width: "100%" }}>
          <div style={{ display: "none" }} className="account-page-mobile-header">
            <button
              className="account-page__nav-button"
              onClick={() => setNavOpen(!navOpen)}
              aria-label="Toggle navigation"
            >
              <Icon name="menu" size={20} />
              Menu
            </button>
          </div>

          {navOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 99,
              }}
              onClick={() => setNavOpen(false)}
            />
          )}

          <div className={`account-nav ${navOpen ? "account-nav--open" : ""}`}>
            <AccountNav isMobile onClose={() => setNavOpen(false)} />
          </div>

          <div className="account-page__layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "var(--space-8)" }}>
            <div style={{ display: "none" }}>
              <AccountNav />
            </div>

            <div className="account-content">
              <div className="account-card">
                <div className="account-card__header">
                  <h1 className="account-card__title">Order History</h1>
                </div>

                {orders.length === 0 ? (
                  <div className="orders-list__empty">
                    <Icon name="package" size={48} style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }} />
                    <p style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>No orders yet</p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                      Start shopping to see your orders here
                    </p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => {
                      const statusBadge = getStatusBadge(order.status);
                      const orderDate = order.timestamp || order.created_at;
                      const formattedDate = orderDate
                        ? new Date(orderDate).toLocaleDateString("en-KE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Date unknown";

                      return (
                        <div key={order.id || order.email} className="orders-list__item">
                          <div className="orders-list__item-info">
                            <p className="orders-list__order-id">
                              {order.order_reference || `Order from ${formattedDate}`}
                            </p>
                            <p className="orders-list__date">{formattedDate}</p>
                            {order.items && order.items.length > 0 && (
                              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                                {order.items.length} item(s)
                              </p>
                            )}
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-2)" }}>
                            <div className={`orders-list__status ${statusBadge.class}`}>
                              {statusBadge.text}
                            </div>
                            <p className="orders-list__amount">
                              KES {(order.total || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        .account-page-mobile-header {
          display: none;
        }

        @media (max-width: 900px) {
          .account-page-mobile-header {
            display: block;
            padding: var(--space-4) var(--gutter);
            border-bottom: 1px solid var(--border-default);
          }

          .account-page__layout {
            grid-template-columns: 1fr !important;
          }

          .account-nav {
            display: none;
          }

          .account-nav--open {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
