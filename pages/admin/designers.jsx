import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatKES } from "../../lib/formatters";

const DEFAULT_DESIGNERS = [
  { id: "des_1", name: "Grace Nkirote", location: "Nairobi", specialty: "Maasai Beadwork", phone: "+254700000001", email: "grace@sharoncraft.co.ke", status: "active", totalOrders: 45, totalPaid: 125000, pendingPayment: 15000 },
  { id: "des_2", name: "Faith Wanjiku", location: "Kisumu", specialty: "Bracelets & Necklaces", phone: "+254700000002", email: "faith@sharoncraft.co.ke", status: "active", totalOrders: 32, totalPaid: 85000, pendingPayment: 0 },
  { id: "des_3", name: "Mary Atieno", location: "Mombasa", specialty: "Home Decor Items", phone: "+254700000003", email: "mary@sharoncraft.co.ke", status: "paused", totalOrders: 18, totalPaid: 52000, pendingPayment: 8000 },
];

async function fetchDesigners() {
  const response = await fetch("/api/admin/designers", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Could not load designers");
  const data = await response.json();
  return Array.isArray(data) && data.length > 0 ? data : DEFAULT_DESIGNERS;
}

export default function DesignersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", specialty: "", phone: "", email: "", status: "active" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { data: designers = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-designers"],
    queryFn: fetchDesigners,
  });

  const filtered = useMemo(() => {
    let items = designers;
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(d => d.name?.toLowerCase().includes(s) || d.location?.toLowerCase().includes(s) || d.specialty?.toLowerCase().includes(s));
    }
    if (statusFilter) items = items.filter(d => d.status === statusFilter);
    return items;
  }, [designers, search, statusFilter]);

  const totalPaid = useMemo(() => designers.reduce((sum, d) => sum + (d.totalPaid || 0), 0), [designers]);
  const totalPending = useMemo(() => designers.reduce((sum, d) => sum + (d.pendingPayment || 0), 0), [designers]);

  async function saveDesigner(payload) {
    const response = await fetch("/api/admin/designers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error || "Could not save designer");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await saveDesigner({ ...form, totalOrders: 0, totalPaid: 0, pendingPayment: 0 });
      setShowForm(false);
      setForm({ name: "", location: "", specialty: "", phone: "", email: "", status: "active" });
      await refetch();
      setMessage("Designer saved.");
    } catch (err) {
      setError(String(err?.message || "Could not save designer"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(designer) {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await saveDesigner({ ...designer, status: designer.status === "active" ? "paused" : "active" });
      await refetch();
      setMessage("Designer status updated.");
    } catch (err) {
      setError(String(err?.message || "Could not update status"));
    } finally {
      setSaving(false);
    }
  }

  async function markPendingPaid(designer) {
    if (!designer.pendingPayment) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await saveDesigner({
        ...designer,
        totalPaid: Number(designer.totalPaid || 0) + Number(designer.pendingPayment || 0),
        pendingPayment: 0,
      });
      await refetch();
      setMessage("Pending payout marked as paid.");
    } catch (err) {
      setError(String(err?.message || "Could not update payout"));
    } finally {
      setSaving(false);
    }
  }

  async function removeDesigner(id) {
    if (!confirm("Delete this designer?")) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/admin/designers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Could not delete designer");
      }
      await refetch();
      setMessage("Designer removed.");
    } catch (err) {
      setError(String(err?.message || "Could not delete designer"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Supplier & Designer Management" action={<button className="admin-button" onClick={() => setShowForm(true)}>Add Designer</button>}>
      {message ? <p className="saved-indicator">{message}</p> : null}
      {error ? <p className="admin-form-error">{error}</p> : null}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Designers</p>
          <p className="admin-stat-value">{designers.length}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Paid</p>
          <p className="admin-stat-value">{formatKES(totalPaid)}</p>
        </div>
        <div className="admin-stat-card admin-stat-card--warning">
          <p className="admin-stat-label">Pending Payment</p>
          <p className="admin-stat-value">{formatKES(totalPending)}</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input type="text" className="admin-search" placeholder="Search designers..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Location</th><th>Specialty</th><th>Contact</th><th>Orders</th><th>Paid</th><th>Pending</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={9} className="admin-empty">Loading designers...</td></tr> : null}
            {filtered.map(d => (
              <tr key={d.id}>
                <td><strong>{d.name}</strong></td>
                <td>{d.location}</td>
                <td>{d.specialty}</td>
                <td>{d.email}<br/><span className="admin-text-muted">{d.phone}</span></td>
                <td>{d.totalOrders}</td>
                <td>{formatKES(d.totalPaid)}</td>
                <td className={d.pendingPayment > 0 ? "admin-text-warning" : ""}>{formatKES(d.pendingPayment)}</td>
                <td><span className={`admin-pill ${d.status === "active" ? "admin-pill--success" : "admin-pill--muted"}`}>{d.status}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="admin-btn admin-btn--small" onClick={() => toggleStatus(d)} disabled={saving}>
                      {d.status === "active" ? "Pause" : "Activate"}
                    </button>
                    <button className="admin-btn admin-btn--small admin-btn--success" onClick={() => markPendingPaid(d)} disabled={saving || !d.pendingPayment}>
                      Mark Paid
                    </button>
                    <button className="admin-btn admin-btn--small" onClick={() => removeDesigner(d.id)} disabled={saving}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 ? <tr><td colSpan={9} className="admin-empty">No designers found</td></tr> : null}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>Add Designer</h3>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Location</label>
                  <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="admin-form-group">
                  <label>Specialty</label>
                  <input type="text" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="e.g. Beadwork" />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="admin-form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="admin-button" disabled={saving}>{saving ? "Saving..." : "Add Designer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
