import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Icon from "../../components/icons";
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
    <AdminLayout title="Expense Tracker" action={<button className="expenses-btn-primary" onClick={openNew}>+ Add Expense</button>}>
      {/* KPIs Section */}
      <div className="expenses-kpi-grid">
        <div className="expenses-kpi-card">
          <Icon name="dollar" size={24} className="expenses-kpi-icon" />
          <div className="expenses-kpi-content">
            <p className="expenses-kpi-label">Total Expenses</p>
            <p className="expenses-kpi-value">{formatKES(totalExpenses)}</p>
            <p className="expenses-kpi-subtext">{expenses.length} transactions</p>
          </div>
        </div>
        <div className="expenses-kpi-card expenses-kpi-card--highlight">
          <div className="expenses-kpi-icon">📊</div>
          <div className="expenses-kpi-content">
            <p className="expenses-kpi-label">This Month</p>
            <p className="expenses-kpi-value">{formatKES(thisMonth)}</p>
            <p className="expenses-kpi-subtext">Current period spending</p>
          </div>
        </div>
        <div className="expenses-kpi-card">
          <div className="expenses-kpi-icon">📈</div>
          <div className="expenses-kpi-content">
            <p className="expenses-kpi-label">Average</p>
            <p className="expenses-kpi-value">{formatKES(expenses.length > 0 ? totalExpenses / expenses.length : 0)}</p>
            <p className="expenses-kpi-subtext">Per transaction</p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="expenses-section">
        <div className="expenses-section-header">
          <h2 className="expenses-section-title">Spending by Category</h2>
          <p className="expenses-section-subtitle">Breakdown of expenses across all categories</p>
        </div>
        <div className="expenses-category-grid">
          {CATEGORY_OPTIONS.map(cat => {
            const amount = byCategory[cat] || 0;
            const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0;
            return (
              <div key={cat} className="expenses-category-card" onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)} style={{cursor: "pointer"}}>
                <div className="expenses-category-header">
                  <p className="expenses-category-label">{cat}</p>
                  <span className="expenses-category-percent">{percentage}%</span>
                </div>
                <p className="expenses-category-value">{formatKES(amount)}</p>
                <div className="expenses-category-bar">
                  <div className="expenses-category-bar-fill" style={{width: `${percentage}%`}}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters Section */}
      <div className="expenses-section">
        <div className="expenses-filter-bar">
          <div className="expenses-search-group">
            <span className="expenses-search-icon">🔍</span>
            <input 
              type="text" 
              className="expenses-search" 
              placeholder="Search by description or vendor..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <select 
            className="expenses-filter-select" 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Transactions List Section */}
      <div className="expenses-section">
        <div className="expenses-section-header">
          <h2 className="expenses-section-title">Recent Transactions</h2>
          <p className="expenses-section-subtitle">{filtered.length} expense{filtered.length !== 1 ? 's' : ''} {categoryFilter ? `in ${categoryFilter}` : ''}</p>
        </div>
        
        {isLoading ? (
          <div className="expenses-loading">
            <p className="expenses-loading-text">Loading expenses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="expenses-empty-state">
            <p className="expenses-empty-icon">📭</p>
            <h3 className="expenses-empty-title">No expenses found</h3>
            <p className="expenses-empty-text">{search || categoryFilter ? "Try adjusting your filters" : "Start tracking expenses by clicking 'Add Expense'"}</p>
          </div>
        ) : (
          <div className="expenses-list">
            {filtered.map(exp => (
              <div key={exp.id} className="expenses-item">
                <div className="expenses-item-main">
                  <div className="expenses-item-date-icon">
                    <span className="expenses-item-date">{new Date(exp.date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <div className="expenses-item-details">
                    <h4 className="expenses-item-description">{exp.description || "Unnamed Expense"}</h4>
                    <div className="expenses-item-meta">
                      <span className="expenses-item-category">{exp.category}</span>
                      {exp.vendor && <span className="expenses-item-vendor">from {exp.vendor}</span>}
                    </div>
                  </div>
                </div>
                <div className="expenses-item-actions">
                  <p className="expenses-item-amount">{formatKES(exp.amount || 0)}</p>
                  <div className="expenses-item-buttons">
                    <button className="expenses-btn-icon expenses-btn-edit" onClick={() => openEdit(exp)} title="Edit">✎</button>
                    <button className="expenses-btn-icon expenses-btn-delete" onClick={() => { if (confirm("Delete this expense?")) deleteMutation.mutate(exp.id) }} title="Delete">🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="expenses-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="expenses-modal" onClick={e => e.stopPropagation()}>
            <div className="expenses-modal-header">
              <h3 className="expenses-modal-title">{editingId ? "📝 Edit Expense" : "➕ Add New Expense"}</h3>
              <button className="expenses-modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="expenses-form">
              <div className="expenses-form-row">
                <div className="expenses-form-group">
                  <label className="expenses-form-label">Category *</label>
                  <select 
                    className="expenses-form-input" 
                    value={form.category} 
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="expenses-form-group">
                  <label className="expenses-form-label">Date *</label>
                  <input 
                    type="date" 
                    className="expenses-form-input" 
                    value={form.date} 
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
                    required
                  />
                </div>
              </div>
              
              <div className="expenses-form-group">
                <label className="expenses-form-label">Description *</label>
                <input 
                  type="text" 
                  className="expenses-form-input" 
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  placeholder="What was this expense for?"
                  required 
                />
              </div>
              
              <div className="expenses-form-row">
                <div className="expenses-form-group">
                  <label className="expenses-form-label">Amount (KES) *</label>
                  <input 
                    type="number" 
                    className="expenses-form-input" 
                    min="0" 
                    value={form.amount} 
                    onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} 
                    placeholder="0.00"
                    required 
                  />
                </div>
                <div className="expenses-form-group">
                  <label className="expenses-form-label">Vendor/Supplier</label>
                  <input 
                    type="text" 
                    className="expenses-form-input" 
                    value={form.vendor} 
                    onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} 
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div className="expenses-form-actions">
                <button type="button" className="expenses-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="expenses-btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Expense" : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        /* KPI Grid */
        .expenses-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .expenses-kpi-card {
          background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .expenses-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
          border-color: #d0d0d0;
        }

        .expenses-kpi-card--highlight {
          background: linear-gradient(135deg, #fff5e6 0%, #fffbf0 100%);
          border-color: #e8c4a0;
        }

        .expenses-kpi-icon {
          font-size: 2.5rem;
          line-height: 1;
        }

        .expenses-kpi-content {
          flex: 1;
        }

        .expenses-kpi-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #666;
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .expenses-kpi-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 0.25rem 0;
        }

        .expenses-kpi-subtext {
          font-size: 0.8rem;
          color: #999;
          margin: 0;
        }

        /* Section */
        .expenses-section {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .expenses-section-header {
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #f5f5f5;
          padding-bottom: 1rem;
        }

        .expenses-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .expenses-section-subtitle {
          font-size: 0.875rem;
          color: #999;
          margin: 0;
        }

        /* Category Grid */
        .expenses-category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }

        .expenses-category-card {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        .expenses-category-card:hover {
          border-color: #d4a574;
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
          transform: translateY(-2px);
        }

        .expenses-category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .expenses-category-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .expenses-category-percent {
          font-size: 0.75rem;
          font-weight: 700;
          background: #f0f0f0;
          color: #666;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .expenses-category-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #d4a574;
          margin: 0 0 0.75rem 0;
        }

        .expenses-category-bar {
          background: #f0f0f0;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }

        .expenses-category-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #d4a574 0%, #e8c4a0 100%);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        /* Filter Bar */
        .expenses-filter-bar {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .expenses-search-group {
          flex: 1;
          min-width: 250px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .expenses-search-icon {
          position: absolute;
          left: 1rem;
          color: #999;
          pointer-events: none;
        }

        .expenses-search {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: border-color 0.3s ease;
        }

        .expenses-search:focus {
          outline: none;
          border-color: #d4a574;
          box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
        }

        .expenses-filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
          min-width: 180px;
          transition: border-color 0.3s ease;
        }

        .expenses-filter-select:focus {
          outline: none;
          border-color: #d4a574;
          box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
        }

        /* Loading State */
        .expenses-loading {
          padding: 3rem 2rem;
          text-align: center;
        }

        .expenses-loading-text {
          color: #999;
          font-size: 0.9rem;
        }

        /* Empty State */
        .expenses-empty-state {
          padding: 3rem 2rem;
          text-align: center;
          color: #999;
        }

        .expenses-empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
        }

        .expenses-empty-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #666;
          margin: 0 0 0.5rem 0;
        }

        .expenses-empty-text {
          font-size: 0.875rem;
          color: #999;
          margin: 0;
        }

        /* List View */
        .expenses-list {
          display: grid;
          gap: 1rem;
        }

        .expenses-item {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .expenses-item:hover {
          border-color: #d4a574;
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
          transform: translateY(-2px);
        }

        .expenses-item-main {
          display: flex;
          gap: 1rem;
          flex: 1;
        }

        .expenses-item-date-icon {
          background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
          color: white;
          border-radius: 8px;
          padding: 0.75rem;
          min-width: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .expenses-item-date {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .expenses-item-details {
          flex: 1;
        }

        .expenses-item-description {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .expenses-item-meta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .expenses-item-category {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          background: #f0f0f0;
          color: #666;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .expenses-item-vendor {
          font-size: 0.875rem;
          color: #999;
          font-style: italic;
        }

        .expenses-item-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: 1rem;
        }

        .expenses-item-amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #d4a574;
          margin: 0;
          min-width: 120px;
          text-align: right;
        }

        .expenses-item-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .expenses-btn-icon {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .expenses-btn-edit:hover {
          background: #f0f0f0;
          color: #d4a574;
        }

        .expenses-btn-delete:hover {
          background: #ffe8e8;
          color: #d32f2f;
        }

        /* Buttons */
        .expenses-btn-primary {
          background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .expenses-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
        }

        .expenses-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .expenses-btn-secondary {
          background: white;
          color: #666;
          border: 1px solid #ddd;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .expenses-btn-secondary:hover {
          border-color: #d4a574;
          color: #d4a574;
        }

        /* Modal */
        .expenses-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .expenses-modal {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .expenses-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .expenses-modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .expenses-modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s ease;
        }

        .expenses-modal-close:hover {
          color: #333;
        }

        .expenses-form {
          padding: 1.5rem;
        }

        .expenses-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .expenses-form-group {
          display: flex;
          flex-direction: column;
        }

        .expenses-form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .expenses-form-input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.3s ease;
        }

        .expenses-form-input:focus {
          outline: none;
          border-color: #d4a574;
          box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
        }

        .expenses-form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .expenses-kpi-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .expenses-category-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .expenses-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .expenses-item-actions {
            width: 100%;
            margin-left: 0;
            margin-top: 1rem;
            justify-content: space-between;
          }

          .expenses-item-amount {
            text-align: left;
          }

          .expenses-form-row {
            grid-template-columns: 1fr;
          }

          .expenses-filter-bar {
            flex-direction: column;
          }

          .expenses-search-group {
            min-width: auto;
          }
        }
      `}</style>
    </AdminLayout>
  );
}