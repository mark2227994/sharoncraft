import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatKES } from "../../lib/formatters";

const DEFAULT_ABANDONED = [
  { id: "ab_1", customerName: "John Doe", email: "john@example.com", phone: "+254700000001", cartItems: 3, cartValue: 8500, abandonedAt: "2024-03-15T10:30:00", status: "pending", remindersSent: 0 },
  { id: "ab_2", customerName: "Jane Smith", email: "jane@example.com", phone: "+254700000002", cartItems: 2, cartValue: 4200, abandonedAt: "2024-03-14T14:20:00", status: "recovered", remindersSent: 2, recoveredAt: "2024-03-16T09:15:00" },
  { id: "ab_3", customerName: "Bob Wilson", email: "bob@example.com", phone: "+254700000003", cartItems: 1, cartValue: 2500, abandonedAt: "2024-03-13T16:45:00", status: "lost", remindersSent: 3, lastReminder: "2024-03-15T16:45:00" },
];

export default function AbandonedCartPage() {
  const [abandonedCarts, setAbandonedCarts] = useState(DEFAULT_ABANDONED);
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    if (!statusFilter) return abandonedCarts;
    return abandonedCarts.filter(c => c.status === statusFilter);
  }, [abandonedCarts, statusFilter]);

  const stats = useMemo(() => {
    const total = abandonedCarts.reduce((sum, c) => sum + (c.cartValue || 0), 0);
    const pending = abandonedCarts.filter(c => c.status === "pending").reduce((sum, c) => sum + (c.cartValue || 0), 0);
    const recovered = abandonedCarts.filter(c => c.status === "recovered").reduce((sum, c) => sum + (c.cartValue || 0), 0);
    const lost = abandonedCarts.filter(c => c.status === "lost").reduce((sum, c) => sum + (c.cartValue || 0), 0);
    return { total, pending, recovered, lost };
  }, [abandonedCarts]);

  const recoveryRate = stats.total > 0 ? ((stats.recovered / stats.total) * 100).toFixed(1) : 0;

  function sendReminder(cartId) {
    setAbandonedCarts(carts => carts.map(c => {
      if (c.id === cartId) {
        return { ...c, remindersSent: (c.remindersSent || 0) + 1 };
      }
      return c;
    }));
    alert("Reminder sent!");
  }

  function markRecovered(cartId) {
    setAbandonedCarts(carts => carts.map(c => {
      if (c.id === cartId) {
        return { ...c, status: "recovered", recoveredAt: new Date().toISOString() };
      }
      return c;
    }));
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
  }

  return (
    <AdminLayout title="Abandoned Cart Recovery">
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Abandoned</p>
          <p className="admin-stat-value">{formatKES(stats.total)}</p>
        </div>
        <div className="admin-stat-card admin-stat-card--warning">
          <p className="admin-stat-label">Pending</p>
          <p className="admin-stat-value">{formatKES(stats.pending)}</p>
        </div>
        <div className="admin-stat-card admin-stat-card--success">
          <p className="admin-stat-label">Recovered</p>
          <p className="admin-stat-value">{formatKES(stats.recovered)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Recovery Rate</p>
          <p className="admin-stat-value">{recoveryRate}%</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Carts</option>
          <option value="pending">Pending</option>
          <option value="recovered">Recovered</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th>Customer</th><th>Items</th><th>Value</th><th>Abandoned</th><th>Reminders</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(cart => (
              <tr key={cart.id}>
                <td>
                  <strong>{cart.customerName}</strong>
                  <br /><span className="admin-text-muted">{cart.email}</span>
                  <br /><span className="admin-text-muted">{cart.phone}</span>
                </td>
                <td>{cart.cartItems} items</td>
                <td><strong>{formatKES(cart.cartValue)}</strong></td>
                <td>{formatDateTime(cart.abandonedAt)}</td>
                <td>{cart.remindersSent || 0}</td>
                <td>
                  <span className={`admin-pill ${
                    cart.status === "recovered" ? "admin-pill--success" :
                    cart.status === "lost" ? "admin-pill--muted" : "admin-pill--warning"
                  }`}>{cart.status}</span>
                </td>
                <td>
                  {cart.status === "pending" && (
                    <>
                      <button className="admin-btn admin-btn--small" onClick={() => sendReminder(cart.id)}>Send Reminder</button>
                      <button className="admin-btn admin-btn--small admin-btn--success" onClick={() => markRecovered(cart.id)}>Mark Recovered</button>
                    </>
                  )}
                  {cart.status === "recovered" && <span className="admin-text-muted">Recovered {formatDateTime(cart.recoveredAt)}</span>}
                  {cart.status === "lost" && <span className="admin-text-muted">No response</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="admin-empty">No abandoned carts found</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}