import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatDateTime, formatKES } from "../../lib/formatters";

function orderStatusClass(status) {
  if (status === "Completed") return "admin-pill admin-pill--completed";
  if (status === "Pending") return "admin-pill admin-pill--pending";
  if (status === "Failed") return "admin-pill admin-pill--failed";
  return "admin-pill";
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Failed to load");
      return response.json();
    },
  });

  const stats = data?.stats ?? [];
  const orders = data?.orders ?? [];

  return (
    <>
      <Head>
        <title>Overview — Gallery Admin</title>
      </Head>
      <AdminLayout
        title="Overview"
        action={
          <Link href="/admin/products/new" className="admin-button">
            Add piece
          </Link>
        }
      >
        {isLoading ? <p className="admin-note">Loading…</p> : null}
        {isError ? <p className="admin-form-error">Could not load this page. Check your connection.</p> : null}

        {!isLoading && data ? (
          <>
            <div className="admin-stats-grid">
              {stats.map((stat) => (
                <div key={stat.label} className="admin-stat-card">
                  <p className="admin-stat-card__label">{stat.label}</p>
                  <p
                    className={`admin-stat-card__value ${stat.terracotta ? "admin-stat-card__value--terracotta" : ""}`}
                  >
                    {typeof stat.value === "number" && stat.label.includes("Revenue")
                      ? formatKES(stat.value)
                      : stat.value}
                  </p>
                  <p className="admin-stat-card__delta">{stat.delta}</p>
                </div>
              ))}
            </div>

            <div className="admin-panel">
              <h2 className="heading-sm" style={{ marginBottom: "var(--space-4)" }}>
                Recent orders
              </h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Buyer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.buyer_name}</td>
                        <td>{formatKES(order.amount_kes)}</td>
                        <td>
                          <span className={orderStatusClass(order.status)}>{order.status}</span>
                        </td>
                        <td>{formatDateTime(order.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-mobile-cards">
                {orders.map((order) => (
                  <div key={order.id} className="admin-form-card" style={{ padding: "var(--space-4)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
                      <strong>{order.id}</strong>
                      <span className={orderStatusClass(order.status)}>{order.status}</span>
                    </div>
                    <p className="admin-note">{order.buyer_name}</p>
                    <p style={{ marginTop: "8px", fontWeight: 600 }}>{formatKES(order.amount_kes)}</p>
                    <p className="admin-note" style={{ marginTop: "4px" }}>
                      {formatDateTime(order.date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </AdminLayout>
    </>
  );
}
