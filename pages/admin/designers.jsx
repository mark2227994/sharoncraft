import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatKES } from "../../lib/formatters";

const DEFAULT_DESIGNERS = [
  { id: "des_1", name: "Grace Nkirote", location: "Nairobi", specialty: "Maasai Beadwork", phone: "+254700000001", email: "grace@sharoncraft.co.ke", status: "active", totalOrders: 45, totalPaid: 125000, pendingPayment: 15000 },
  { id: "des_2", name: "Faith Wanjiku", location: "Kisumu", specialty: "Bracelets & Necklaces", phone: "+254700000002", email: "faith@sharoncraft.co.ke", status: "active", totalOrders: 32, totalPaid: 85000, pendingPayment: 0 },
  { id: "des_3", name: "Mary Atieno", location: "Mombasa", specialty: "Home Decor Items", phone: "+254700000003", email: "mary@sharoncraft.co.ke", status: "paused", totalOrders: 18, totalPaid: 52000, pendingPayment: 8000 },
];

export default function DesignersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", specialty: "", phone: "", email: "", status: "active" });
  const [designers, setDesigners] = useState(DEFAULT_DESIGNERS);

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

  function handleSubmit(e) {
    e.preventDefault();
    const newDesigner = { ...form, id: `des_${Date.now()}`, totalOrders: 0, totalPaid: 0, pendingPayment: 0 };
    setDesigners([...designers, newDesigner]);
    setShowForm(false);
    setForm({ name: "", location: "", specialty: "", phone: "", email: "", status: "active" });
  }

  return (
    <AdminLayout title="Supplier & Designer Management" action={<button className="admin-button" onClick={() => setShowForm(true)}>Add Designer</button>}>
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
            <tr><th>Name</th><th>Location</th><th>Specialty</th><th>Contact</th><th>Orders</th><th>Paid</th><th>Pending</th><th>Status</th></tr>
          </thead>
          <tbody>
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
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="admin-empty">No designers found</td></tr>}
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
                <button type="submit" className="admin-button">Add Designer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}