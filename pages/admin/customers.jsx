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
        <>
          <section className="customers-grid-wrap">
            <div className="customers-grid-header">
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#333" }}>
                Showing {filtered.length} of {customers.length} customers
              </h2>
            </div>

            {filtered.length === 0 ? (
              <div className="customers-empty">
                <p>No customers match your search.</p>
              </div>
            ) : (
              <div className="customers-grid">
                {filtered.map((customer) => (
                  <article key={customer.id} className="customer-card">
                    {/* Header */}
                    <div className="customer-card-header">
                      <div className="customer-card-avatar">
                        {customer.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="customer-card-name-section">
                        <h3 className="customer-card-name">{customer.name || "Unknown"}</h3>
                        <p className="customer-card-joined">
                          Joined {formatDate(customer.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="customer-card-contact">
                      {customer.email && (
                        <a href={`mailto:${customer.email}`} className="customer-contact-item">
                          ✉️ {customer.email}
                        </a>
                      )}
                      {customer.phone && (
                        <a href={`tel:${customer.phone}`} className="customer-contact-item">
                          📱 {customer.phone}
                        </a>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="customer-card-stats">
                      <div className="customer-stat">
                        <span className="customer-stat-label">Orders</span>
                        <span className="customer-stat-value">{customer.totalOrders || 0}</span>
                      </div>
                      <div className="customer-stat">
                        <span className="customer-stat-label">Spent</span>
                        <span className="customer-stat-value">{formatKES(customer.totalSpent || 0)}</span>
                      </div>
                      <div className="customer-stat">
                        <span className="customer-stat-label">Last Order</span>
                        <span className="customer-stat-value">{formatDate(customer.lastOrderDate) || "—"}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {customer.tags && customer.tags.length > 0 && (
                      <div className="customer-card-tags">
                        {customer.tags.map((tag) => (
                          <span key={tag} className="customer-tag">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {customer.notes && (
                      <p className="customer-card-notes">{customer.notes}</p>
                    )}

                    {/* Actions */}
                    <div className="customer-card-actions">
                      <button
                        className="customer-card-btn customer-card-btn--primary"
                        onClick={() => openEdit(customer)}
                      >
                        Edit
                      </button>
                      <button
                        className="customer-card-btn customer-card-btn--danger"
                        onClick={() => {
                          if (confirm("Delete this customer?")) deleteMutation.mutate(customer.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
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

      <style jsx>{`
        /* Grid Layout */
        .customers-grid-wrap {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }

        .customers-grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f5f5f5;
        }

        .customers-empty {
          text-align: center;
          padding: 3rem 2rem;
          color: #999;
          font-size: 1rem;
        }

        .customers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        /* Customer Card */
        .customer-card {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 1.25rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .customer-card:hover {
          border-color: #d4a574;
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
          transform: translateY(-2px);
        }

        /* Header */
        .customer-card-header {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .customer-card-avatar {
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

        .customer-card-name-section {
          flex: 1;
          min-width: 0;
        }

        .customer-card-name {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #333;
        }

        .customer-card-joined {
          margin: 0.25rem 0 0 0;
          font-size: 0.75rem;
          color: #999;
        }

        /* Contact */
        .customer-card-contact {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding: 0.75rem;
          background: #f9f9f9;
          border-radius: 6px;
        }

        .customer-contact-item {
          font-size: 0.8rem;
          color: #666;
          text-decoration: none;
          transition: color 0.2s ease;
          word-break: break-all;
        }

        .customer-contact-item:hover {
          color: #d4a574;
        }

        /* Stats */
        .customer-card-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          padding: 0.75rem;
          background: #fffbf0;
          border-radius: 6px;
        }

        .customer-stat {
          display: flex;
          flex-direction: column;
          text-align: center;
        }

        .customer-stat-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .customer-stat-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: #d4a574;
          margin-top: 0.25rem;
        }

        /* Tags */
        .customer-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .customer-tag {
          display: inline-block;
          padding: 0.3rem 0.6rem;
          background: #e8e8e8;
          color: #666;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Notes */
        .customer-card-notes {
          font-size: 0.8rem;
          color: #666;
          margin: 0.75rem 0;
          padding: 0.75rem;
          background: #f9f9f9;
          border-left: 3px solid #d4a574;
          border-radius: 4px;
          line-height: 1.4;
        }

        /* Actions */
        .customer-card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
        }

        .customer-card-btn {
          flex: 1;
          padding: 0.65rem 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          background: white;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .customer-card-btn:hover {
          border-color: #d4a574;
          color: #d4a574;
          background: #fffbf0;
        }

        .customer-card-btn--primary {
          background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
          color: white;
          border: none;
        }

        .customer-card-btn--primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
        }

        .customer-card-btn--danger {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fca5a5;
        }

        .customer-card-btn--danger:hover {
          background: #fecaca;
          border-color: #f87171;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .customers-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          }
        }

        @media (max-width: 767px) {
          .customers-grid {
            grid-template-columns: 1fr;
          }

          .customer-card-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </AdminLayout>
  );
}