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

  return (
    <AdminLayout
      title="Dashboard"
      action={
        <Link href="/admin/products/new" className="admin-button">
          Add New Product
        </Link>
      }
    >
      <section className="admin-stats-grid">
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

      <section className="admin-mobile-cards">
        {orders.map((order) => (
          <article key={order.id} className="admin-panel">
            <p className="overline">{order.id}</p>
            <h2 className="heading-md">{order.product_name}</h2>
            <p className="body-sm">{order.buyer_name}</p>
            <p className="body-sm">{formatKES(order.amount_kes)}</p>
          </article>
        ))}
      </section>

      <section className="admin-quick-actions">
        <Link href="/admin/products/new" className="admin-button">
          Add New Product
        </Link>
        <Link href="/admin/mpesa" className="admin-button admin-button--secondary">
          View M-Pesa Log
        </Link>
        <Link href="/admin/settings/hero" className="admin-button admin-button--secondary">
          Edit Homepage Banner
        </Link>
      </section>
    </AdminLayout>
  );
}
