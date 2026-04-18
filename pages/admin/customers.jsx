import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatKES } from "../../lib/formatters";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchCustomers() {
  const res = await fetch("/api/admin/customers");
  if (!res.ok) throw new Error("Failed to load customers");
  return res.json();
}

async function saveCustomer(customer) {
  const res = await fetch("/api/admin/customers", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  if (!res.ok) throw new Error("Failed to save customer");
  return res.json();
}

async function deleteCustomer(id) {
  const res = await fetch(`/api/admin/customers?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete customer");
  return res.json();
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

const TAG_OPTIONS = ["VIP", "Repeat Buyer", "Wholesale", "Gift Buyer", "Event Planner", "Collector"];

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const { data: customers = [], isLoading } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", tags: [] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    if (!search) return customers;
    const s = search.toLowerCase();
    return customers.filter(c => c.name?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s) || c.phone?.includes(s));
  }, [customers, search]);

  const totalRevenue = useMemo(() => customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0), [customers]);
  const totalOrders = useMemo(() => customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0), [customers]);

  const saveMutation = useMutation({ mutationFn: saveCustomer, onSuccess: () => { queryClient.invalidateQueries(["customers"]); setMessage("Customer saved!"); setShowForm(false); setForm({ name: "", email: "", phone: "", notes: "", tags: [] }); } });

  const deleteMutation = useMutation({ mutationFn: deleteCustomer, onSuccess: () => queryClient.invalidateQueries(["customers"]) });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try { await saveMutation.mutateAsync({ ...form, id: editingId }); } finally { setSaving(false); }
  }

  function openEdit(customer) {
    setEditingId(customer.id);
    setForm({ name: customer.name || "", email: customer.email || "", phone: customer.phone || "", notes: customer.notes || "", tags: customer.tags || [] });
    setShowForm(true);
  }

  function openNew() {
    setEditingId(null);
    setForm({ name: "", email: "", phone: "", notes: "", tags: [] });
    setShowForm(true);
  }

  function toggleTag(tag) {
    const tags = form.tags.includes(tag) ? form.tags.filter(t => t !== tag) : [...form.tags, tag];
    setForm(f => ({ ...f, tags }));
  }

  return (
    <AdminLayout title="Customer Database" action={<button className="admin-button" onClick={openNew}>Add Customer</button>}>
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Customers</p>
          <p className="admin-stat-value">{customers.length}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Orders</p>
          <p className="admin-stat-value">{totalOrders}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Revenue</p>
          <p className="admin-stat-value">{formatKES(totalRevenue)}</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input type="text" className="admin-search" placeholder="Search by name, email, or phone..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? <p className="admin-note">Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Contact</th><th>Orders</th><th>Spent</th><th>Last Order</th><th>Tags</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name || "-"}</strong></td>
                  <td>{c.email || "-"}<br/><span className="admin-text-muted">{c.phone || "-"}</span></td>
                  <td>{c.totalOrders || 0}</td>
                  <td>{formatKES(c.totalSpent || 0)}</td>
                  <td>{formatDate(c.lastOrderDate)}</td>
                  <td>{c.tags?.map(t => <span key={t} className="admin-tag">{t}</span>)}</td>
                  <td>
                    <button className="admin-btn admin-btn--small" onClick={() => openEdit(c)}>Edit</button>
                    <button className="admin-btn admin-btn--small admin-btn--danger" onClick={() => { if (confirm("Delete this customer?")) deleteMutation.mutate(c.id) }}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="admin-empty">No customers found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? "Edit Customer" : "Add Customer"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="admin-form-group">
                <label>Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="admin-form-group">
                <label>Tags</label>
                <div className="admin-tags-input">{TAG_OPTIONS.map(t => (
                  <button type="button" key={t} className={`admin-tag-toggle ${form.tags.includes(t) ? "active" : ""}`} onClick={() => toggleTag(t)}>{t}</button>
                ))}</div>
              </div>
              <div className="admin-form-group">
                <label>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="admin-button" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {message && <div className="admin-toast">{message}</div>}
    </AdminLayout>
  );
}