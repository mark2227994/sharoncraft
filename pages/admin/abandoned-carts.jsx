import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatKES } from "../../lib/formatters";

const DEFAULT_ABANDONED = [
  { id: "ab_1", customerName: "John Doe", email: "john@example.com", phone: "+254700000001", cartItems: 3, cartValue: 8500, abandonedAt: "2024-03-15T10:30:00", status: "pending", remindersSent: 0 },
  { id: "ab_2", customerName: "Jane Smith", email: "jane@example.com", phone: "+254700000002", cartItems: 2, cartValue: 4200, abandonedAt: "2024-03-14T14:20:00", status: "recovered", remindersSent: 2, recoveredAt: "2024-03-16T09:15:00" },
  { id: "ab_3", customerName: "Bob Wilson", email: "bob@example.com", phone: "+254700000003", cartItems: 1, cartValue: 2500, abandonedAt: "2024-03-13T16:45:00", status: "lost", remindersSent: 3, lastReminder: "2024-03-15T16:45:00" },
];

async function fetchAbandoned() {
  const response = await fetch("/api/admin/marketing", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Could not load abandoned carts");
  const data = await response.json();
  const entries = Array.isArray(data?.studio?.abandonedCheckouts) ? data.studio.abandonedCheckouts : [];

  if (entries.length === 0) {
    return DEFAULT_ABANDONED;
  }

  return entries.map((entry) => ({
    id: entry.id,
    customerName: entry.name || entry.customerName || "Unknown",
    email: entry.email || "",
    phone: entry.phone || "",
    cartItems: Array.isArray(entry.items) ? entry.items.length : Number(entry.cartItems || 0),
    cartValue: Number(entry.total || entry.cartValue || 0),
    abandonedAt: entry.createdAt || entry.abandonedAt || entry.updatedAt,
    status: entry.status || "pending",
    remindersSent: Number(entry.remindersSent || 0),
    recoveredAt: entry.recoveredAt || "",
    lastReminder: entry.lastReminder || "",
    area: entry.area || "",
    items: Array.isArray(entry.items) ? entry.items : [],
    source: entry.source || "manual",
  }));
}

export default function AbandonedCartPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { data: abandonedCarts = [], refetch, isLoading } = useQuery({
    queryKey: ["admin-abandoned-carts"],
    queryFn: fetchAbandoned,
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return abandonedCarts;
    return abandonedCarts.filter((cart) => cart.status === statusFilter);
  }, [abandonedCarts, statusFilter]);

  const stats = useMemo(() => {
    const total = abandonedCarts.reduce((sum, cart) => sum + (cart.cartValue || 0), 0);
    const pending = abandonedCarts.filter((cart) => cart.status === "pending").reduce((sum, cart) => sum + (cart.cartValue || 0), 0);
    const recovered = abandonedCarts.filter((cart) => cart.status === "recovered").reduce((sum, cart) => sum + (cart.cartValue || 0), 0);
    const lost = abandonedCarts.filter((cart) => cart.status === "lost").reduce((sum, cart) => sum + (cart.cartValue || 0), 0);
    return { total, pending, recovered, lost };
  }, [abandonedCarts]);

  const recoveryRate = stats.total > 0 ? ((stats.recovered / stats.total) * 100).toFixed(1) : 0;

  async function persistCart(nextCart) {
    const response = await fetch("/api/admin/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        section: "abandonedCheckouts",
        item: {
          id: nextCart.id,
          name: nextCart.customerName,
          email: nextCart.email,
          phone: nextCart.phone,
          items: nextCart.items,
          total: Number(nextCart.cartValue || 0),
          status: nextCart.status,
          remindersSent: Number(nextCart.remindersSent || 0),
          recoveredAt: nextCart.recoveredAt || "",
          lastReminder: nextCart.lastReminder || "",
          source: nextCart.source || "admin",
          area: nextCart.area || "",
          cartItems: Number(nextCart.cartItems || 0),
          abandonedAt: nextCart.abandonedAt,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error || "Could not update cart");
    }
  }

  async function sendReminder(cart) {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await persistCart({
        ...cart,
        status: cart.status === "recovered" ? "recovered" : "pending",
        remindersSent: Number(cart.remindersSent || 0) + 1,
        lastReminder: new Date().toISOString(),
      });
      await refetch();
      setMessage("Reminder logged.");
    } catch (err) {
      setError(String(err?.message || "Could not log reminder"));
    } finally {
      setSaving(false);
    }
  }

  async function markRecovered(cart) {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await persistCart({
        ...cart,
        status: "recovered",
        recoveredAt: new Date().toISOString(),
      });
      await refetch();
      setMessage("Cart marked recovered.");
    } catch (err) {
      setError(String(err?.message || "Could not update cart"));
    } finally {
      setSaving(false);
    }
  }

  async function markLost(cart) {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await persistCart({
        ...cart,
        status: "lost",
      });
      await refetch();
      setMessage("Cart marked lost.");
    } catch (err) {
      setError(String(err?.message || "Could not update cart"));
    } finally {
      setSaving(false);
    }
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
  }

  return (
    <AdminLayout title="Abandoned Cart Recovery">
      {message ? <p className="saved-indicator">{message}</p> : null}
      {error ? <p className="admin-form-error">{error}</p> : null}
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
        <select className="admin-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
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
            {isLoading ? <tr><td colSpan={7} className="admin-empty">Loading abandoned carts...</td></tr> : null}
            {filtered.map((cart) => (
              <tr key={cart.id}>
                <td>
                  <strong>{cart.customerName}</strong>
                  <br /><span className="admin-text-muted">{cart.email || "No email"}</span>
                  <br /><span className="admin-text-muted">{cart.phone || "No phone"}</span>
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
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="admin-btn admin-btn--small" onClick={() => sendReminder(cart)} disabled={saving}>Send Reminder</button>
                    <button className="admin-btn admin-btn--small admin-btn--success" onClick={() => markRecovered(cart)} disabled={saving || cart.status === "recovered"}>Mark Recovered</button>
                    <button className="admin-btn admin-btn--small" onClick={() => markLost(cart)} disabled={saving || cart.status === "lost"}>Mark Lost</button>
                  </div>
                  {cart.status === "recovered" ? <span className="admin-text-muted">Recovered {formatDateTime(cart.recoveredAt)}</span> : null}
                  {cart.lastReminder ? <span className="admin-text-muted">Last reminder {formatDateTime(cart.lastReminder)}</span> : null}
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 ? <tr><td colSpan={7} className="admin-empty">No abandoned carts found</td></tr> : null}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
