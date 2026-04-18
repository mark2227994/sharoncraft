import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatKES } from "../../lib/formatters";

async function fetchExpenses() {
  const res = await fetch("/api/admin/expenses");
  if (!res.ok) throw new Error("Failed to load expenses");
  return res.json();
}

async function saveExpense(expense) {
  const res = await fetch("/api/admin/expenses", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error("Failed to save expense");
  return res.json();
}

async function deleteExpense(id) {
  const res = await fetch(`/api/admin/expenses?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete expense");
  return res.json();
}

const CATEGORY_OPTIONS = ["Beads", "Wire & Findings", "Packaging", "Shipping", "Marketing", "Tools", "Other"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const { data: expenses = [], isLoading } = useQuery({ queryKey: ["expenses"], queryFn: fetchExpenses });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ category: "Beads", description: "", amount: 0, date: new Date().toISOString().split("T")[0], vendor: "" });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let items = expenses;
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(e => e.description?.toLowerCase().includes(s) || e.vendor?.toLowerCase().includes(s));
    }
    if (categoryFilter) items = items.filter(e => e.category === categoryFilter);
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, search, categoryFilter]);

  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + (e.amount || 0), 0), [expenses]);
  const byCategory = useMemo(() => {
    const totals = {};
    expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + (e.amount || 0); });
    return totals;
  }, [expenses]);

  const thisMonth = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const saveMutation = useMutation({ mutationFn: saveExpense, onSuccess: () => { queryClient.invalidateQueries(["expenses"]); setShowForm(false); } });
  const deleteMutation = useMutation({ mutationFn: deleteExpense, onSuccess: () => queryClient.invalidateQueries(["expenses"]) });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try { await saveMutation.mutateAsync({ ...form, id: editingId }); } finally { setSaving(false); }
  }

  function openEdit(expense) {
    setEditingId(expense.id);
    setForm({ category: expense.category || "Beads", description: expense.description || "", amount: expense.amount || 0, date: expense.date || "", vendor: expense.vendor || "" });
    setShowForm(true);
  }

  function openNew() {
    setEditingId(null);
    setForm({ category: "Beads", description: "", amount: 0, date: new Date().toISOString().split("T")[0], vendor: "" });
    setShowForm(true);
  }

  return (
    <AdminLayout title="Expense Tracker" action={<button className="admin-button" onClick={openNew}>Add Expense</button>}>
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Expenses</p>
          <p className="admin-stat-value">{formatKES(totalExpenses)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">This Month</p>
          <p className="admin-stat-value">{formatKES(thisMonth)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Transactions</p>
          <p className="admin-stat-value">{expenses.length}</p>
        </div>
      </div>

      <div className="admin-section">
        <h3>Spending by Category</h3>
        <div className="admin-category-grid">
          {CATEGORY_OPTIONS.map(cat => (
            <div key={cat} className="admin-category-card">
              <p className="admin-category-label">{cat}</p>
              <p className="admin-category-value">{formatKES(byCategory[cat] || 0)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-toolbar">
        <input type="text" className="admin-search" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="admin-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? <p className="admin-note">Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>Category</th><th>Description</th><th>Vendor</th><th>Amount</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(exp => (
                <tr key={exp.id}>
                  <td>{formatDate(exp.date)}</td>
                  <td><span className="admin-pill admin-pill--card">{exp.category}</span></td>
                  <td>{exp.description || "-"}</td>
                  <td>{exp.vendor || "-"}</td>
                  <td><strong>{formatKES(exp.amount || 0)}</strong></td>
                  <td>
                    <button className="admin-btn admin-btn--small" onClick={() => openEdit(exp)}>Edit</button>
                    <button className="admin-btn admin-btn--small admin-btn--danger" onClick={() => { if (confirm("Delete this expense?")) deleteMutation.mutate(exp.id) }}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="admin-empty">No expenses found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? "Edit Expense" : "Add Expense"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}</select>
                </div>
                <div className="admin-form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Amount (KES)</label>
                  <input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} required />
                </div>
                <div className="admin-form-group">
                  <label>Vendor/Supplier</label>
                  <input type="text" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} />
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="admin-button" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}