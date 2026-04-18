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

      <section className="designers-grid-wrap">
        <div className="designers-header">
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#333" }}>
            {isLoading ? "Loading..." : `${filtered.length} Designer${filtered.length !== 1 ? "s" : ""}`}
          </h2>
        </div>

        {isLoading ? (
          <p style={{ color: "#999", textAlign: "center", padding: "2rem" }}>Loading designers...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", padding: "2rem" }}>No designers found.</p>
        ) : (
          <div className="designers-grid">
            {filtered.map((d) => (
              <article key={d.id} className="designer-card">
                <div className="designer-card-header">
                  <div className="designer-avatar">
                    {d.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="designer-name-section">
                    <h3 className="designer-name">{d.name}</h3>
                    <p className="designer-location">📍 {d.location}</p>
                  </div>
                  <span className={`designer-status ${d.status === "active" ? "designer-status--active" : "designer-status--paused"}`}>
                    {d.status === "active" ? "✓ Active" : "⊝ Paused"}
                  </span>
                </div>

                <div className="designer-specialty">
                  <p className="designer-specialty-label">Specialty</p>
                  <p className="designer-specialty-value">{d.specialty}</p>
                </div>

                <div className="designer-contact">
                  <a href={`mailto:${d.email}`} className="designer-contact-item">
                    ✉️ {d.email}
                  </a>
                  <a href={`tel:${d.phone}`} className="designer-contact-item">
                    📱 {d.phone}
                  </a>
                </div>

                <div className="designer-stats">
                  <div className="designer-stat">
                    <span className="designer-stat-label">Orders</span>
                    <span className="designer-stat-value">{d.totalOrders}</span>
                  </div>
                  <div className="designer-stat">
                    <span className="designer-stat-label">Paid</span>
                    <span className="designer-stat-value">{formatKES(d.totalPaid)}</span>
                  </div>
                  <div className="designer-stat">
                    <span className="designer-stat-label">Pending</span>
                    <span className={`designer-stat-value ${d.pendingPayment > 0 ? "designer-stat-value--warning" : ""}`}>
                      {formatKES(d.pendingPayment)}
                    </span>
                  </div>
                </div>

                <div className="designer-actions">
                  <button
                    className="designer-btn designer-btn--secondary"
                    onClick={() => toggleStatus(d)}
                    disabled={saving}
                  >
                    {d.status === "active" ? "Pause" : "Activate"}
                  </button>
                  <button
                    className="designer-btn designer-btn--success"
                    onClick={() => markPendingPaid(d)}
                    disabled={saving || !d.pendingPayment}
                  >
                    Mark Paid
                  </button>
                  <button
                    className="designer-btn designer-btn--danger"
                    onClick={() => removeDesigner(d.id)}
                    disabled={saving}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <style jsx>{`
          .designers-grid-wrap {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 1.5rem;
          }

          .designers-header {
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f5f5f5;
          }

          .designers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.25rem;
          }

          .designer-card {
            background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
            border: 1px solid #e8e8e8;
            border-radius: 10px;
            padding: 1.25rem;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
          }

          .designer-card:hover {
            border-color: #d4a574;
            box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
            transform: translateY(-2px);
          }

          .designer-card-header {
            display: flex;
            gap: 1rem;
            align-items: flex-start;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #f0f0f0;
          }

          .designer-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
            flex-shrink: 0;
          }

          .designer-name-section {
            flex: 1;
            min-width: 0;
          }

          .designer-name {
            margin: 0;
            font-size: 0.95rem;
            font-weight: 600;
            color: #333;
          }

          .designer-location {
            margin: 0.25rem 0 0 0;
            font-size: 0.8rem;
            color: #999;
          }

          .designer-status {
            display: inline-block;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 0.4rem 0.75rem;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
          }

          .designer-status--active {
            background: #d1fae5;
            color: #065f46;
          }

          .designer-status--paused {
            background: #f3f4f6;
            color: #6b7280;
          }

          .designer-specialty {
            margin-bottom: 0.75rem;
          }

          .designer-specialty-label {
            font-size: 0.7rem;
            font-weight: 600;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 0.25rem 0;
          }

          .designer-specialty-value {
            font-size: 0.9rem;
            font-weight: 600;
            color: #333;
            margin: 0;
          }

          .designer-contact {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
            padding: 0.75rem;
            background: #f9f9f9;
            border-radius: 6px;
          }

          .designer-contact-item {
            font-size: 0.8rem;
            color: #666;
            text-decoration: none;
            transition: color 0.2s ease;
            word-break: break-all;
          }

          .designer-contact-item:hover {
            color: #d4a574;
          }

          .designer-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
            margin-bottom: 0.75rem;
            padding: 0.75rem;
            background: #fffbf0;
            border-radius: 6px;
          }

          .designer-stat {
            display: flex;
            flex-direction: column;
            text-align: center;
          }

          .designer-stat-label {
            font-size: 0.7rem;
            font-weight: 600;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .designer-stat-value {
            font-size: 0.9rem;
            font-weight: 700;
            color: #d4a574;
            margin-top: 0.25rem;
          }

          .designer-stat-value--warning {
            color: #f59e0b;
          }

          .designer-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: auto;
          }

          .designer-btn {
            flex: 1;
            padding: 0.65rem 0.75rem;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            background: white;
            color: #666;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .designer-btn:hover:not(:disabled) {
            border-color: #d4a574;
            color: #d4a574;
            background: #fffbf0;
          }

          .designer-btn--secondary {
            background: #f5f5f5;
          }

          .designer-btn--success {
            background: #d1fae5;
            color: #065f46;
            border-color: #a7f3d0;
          }

          .designer-btn--success:hover:not(:disabled) {
            background: #a7f3d0;
          }

          .designer-btn--danger {
            background: #fee2e2;
            color: #991b1b;
            border-color: #fca5a5;
          }

          .designer-btn--danger:hover:not(:disabled) {
            background: #fecaca;
            border-color: #f87171;
          }

          .designer-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 1200px) {
            .designers-grid {
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            }
          }

          @media (max-width: 767px) {
            .designers-grid {
              grid-template-columns: 1fr;
            }

            .designer-stats {
              grid-template-columns: 1fr;
            }

            .designer-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </section>

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
