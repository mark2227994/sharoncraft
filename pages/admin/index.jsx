import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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

  // WA order quick stats
  const waPending = waOrders.filter((o) => o.status === "pending").length;
  const waCompleted = waOrders.filter((o) => o.status === "completed").length;
  const waRevenue = waOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <AdminLayout
      title="Dashboard"
      action={
        <Link href="/admin/products/new" className="admin-button">
          Add New Product
        </Link>
      }
    >
      {/* Product stats */}
      <p className="overline" style={{ marginBottom: "var(--space-2)" }}>Product Overview</p>
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

      {/* WhatsApp order stats */}
      <p className="overline" style={{ marginBottom: "var(--space-2)" }}>
        💬 WhatsApp Orders{" "}
        <Link href="/admin/orders" style={{ color: "var(--color-terracotta)", marginLeft: 8, fontWeight: 600 }}>
          View all →
        </Link>
      </p>
      <section className="admin-stats-grid" style={{ marginBottom: "var(--space-6)" }}>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Total WA Orders</p>
          <p className="admin-stat-card__value">{waOrders.length}</p>
          <p className="admin-stat-card__delta">All time</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Pending</p>
          <p className="admin-stat-card__value" style={waPending > 0 ? { color: "#f59e0b" } : {}}>
            {waPending}
          </p>
          <p className="admin-stat-card__delta">Need follow-up</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Completed</p>
          <p className="admin-stat-card__value">{waCompleted}</p>
          <p className="admin-stat-card__delta">Paid &amp; delivered</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">WA Revenue</p>
          <p className="admin-stat-card__value admin-stat-card__value--terracotta">{formatKES(waRevenue)}</p>
          <p className="admin-stat-card__delta">From completed orders</p>
        </article>
      </section>

      {/* Recent WhatsApp orders */}
      {waOrders.length > 0 && (
        <>
          <p className="overline" style={{ marginBottom: "var(--space-2)" }}>Recent WhatsApp Orders</p>
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
                        💬 {order.phone}
                      </a>
                    </td>
                    <td>{formatKES(order.total)}</td>
                    <td>
                      <span className={`admin-pill ${
                        order.status === "completed" ? "admin-pill--completed"
                        : order.status === "confirmed" ? "admin-pill--mpesa"
                        : order.status === "cancelled" ? "admin-pill--failed"
                        : "admin-pill--pending"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {/* M-Pesa orders (legacy) */}
      {orders.length > 0 && (
        <>
          <p className="overline" style={{ marginBottom: "var(--space-2)" }}>M-Pesa Orders</p>
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
      )}

      <section className="admin-quick-actions" style={{ marginTop: "var(--space-5)" }}>
        <Link href="/admin/products/new" className="admin-button">
          Add New Product
        </Link>
        <Link href="/admin/orders" className="admin-button admin-button--secondary">
          💬 View WA Orders
        </Link>
        <Link href="/admin/site-images" className="admin-button admin-button--secondary">
          Edit Site Content
        </Link>
      </section>
    </AdminLayout>
  );
}
