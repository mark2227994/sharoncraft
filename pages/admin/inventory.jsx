import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatKES } from "../../lib/formatters";

async function fetchInventory() {
  const res = await fetch("/api/admin/inventory");
  if (!res.ok) throw new Error("Failed to load inventory");
  return res.json();
}

async function saveInventoryItem(item) {
  const res = await fetch("/api/admin/inventory", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Failed to save item");
  return res.json();
}

async function fetchProducts() {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

const CATEGORY_OPTIONS = ["Beads", "Wire", "Thread", "Findings", "Packaging", "Tools", "Other"];

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: inventory = [], isLoading } = useQuery({ queryKey: ["inventory"], queryFn: fetchInventory });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ productId: "", name: "", sku: "", quantity: 0, reorderLevel: 5, costPerUnit: 0, category: "Beads", supplier: "" });
  const [saving, setSaving] = useState(false);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Auto-populate from products
  const linkedProducts = useMemo(() => {
    return products.map(p => ({ id: p.id, name: p.name, price: p.price }));
  }, [products]);

  const filtered = useMemo(() => {
    let items = inventory;
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(i => i.name?.toLowerCase().includes(s) || i.sku?.toLowerCase().includes(s));
    }
    if (categoryFilter) items = items.filter(i => i.category === categoryFilter);
    if (lowStockOnly) items = items.filter(i => (i.quantity || 0) <= (i.reorderLevel || 5));
    return items;
  }, [inventory, search, categoryFilter, lowStockOnly]);

  const totalValue = useMemo(() => inventory.reduce((sum, i) => sum + ((i.quantity || 0) * (i.costPerUnit || 0)), 0), [inventory]);
  const lowStockCount = useMemo(() => inventory.filter(i => (i.quantity || 0) <= (i.reorderLevel || 5)).length, [inventory]);

  const saveMutation = useMutation({ mutationFn: saveInventoryItem, onSuccess: () => { queryClient.invalidateQueries(["inventory"]); setShowForm(false); setForm({ productId: "", name: "", sku: "", quantity: 0, reorderLevel: 5, costPerUnit: 0, category: "Beads", supplier: "" }); } });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try { await saveMutation.mutateAsync({ ...form, id: editingId }); } finally { setSaving(false); }
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({ productId: item.productId || "", name: item.name || "", sku: item.sku || "", quantity: item.quantity || 0, reorderLevel: item.reorderLevel || 5, costPerUnit: item.costPerUnit || 0, category: item.category || "Beads", supplier: item.supplier || "" });
    setShowForm(true);
  }

  function openNew() {
    setEditingId(null);
    setForm({ productId: "", name: "", sku: "", quantity: 0, reorderLevel: 5, costPerUnit: 0, category: "Beads", supplier: "" });
    setShowForm(true);
  }

  function onProductSelect(e) {
    const product = linkedProducts.find(p => p.id === e.target.value);
    if (product) {
      setForm(f => ({ ...f, productId: product.id, name: product.name, costPerUnit: product.price * 0.3 }));
    }
  }

  return (
    <AdminLayout title="Inventory Management" action={<button className="admin-button" onClick={openNew}>Add Item</button>}>
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Items</p>
          <p className="admin-stat-value">{inventory.length}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Value</p>
          <p className="admin-stat-value">{formatKES(totalValue)}</p>
        </div>
        <div className="admin-stat-card admin-stat-card--warning">
          <p className="admin-stat-label">Low Stock</p>
          <p className="admin-stat-value">{lowStockCount}</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input type="text" className="admin-search" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="admin-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="admin-checkbox"><input type="checkbox" checked={lowStockOnly} onChange={e => setLowStockOnly(e.target.checked)} /> Low Stock Only</label>
      </div>

      {isLoading ? <p className="admin-note">Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Item</th><th>SKU</th><th>Category</th><th>Qty</th><th>Reorder At</th><th>Unit Cost</th><th>Value</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLow = (item.quantity || 0) <= (item.reorderLevel || 5);
                return (
                  <tr key={item.id} className={isLow ? "admin-row--warning" : ""}>
                    <td><strong>{item.name || "-"}</strong>{item.supplier && <br/><span className="admin-text-muted">{item.supplier}</span>}</td>
                    <td>{item.sku || "-"}</td>
                    <td>{item.category}</td>
                    <td className={isLow ? "admin-text-danger" : ""}>{item.quantity}</td>
                    <td>{item.reorderLevel}</td>
                    <td>{formatKES(item.costPerUnit || 0)}</td>
                    <td>{formatKES((item.quantity || 0) * (item.costPerUnit || 0))}</td>
                    <td>
                      <button className="admin-btn admin-btn--small" onClick={() => openEdit(item)}>Edit</button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="admin-empty">No inventory items found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? "Edit Item" : "Add Inventory Item"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Link to Product (optional)</label>
                <select value={form.productId} onChange={onProductSelect}><option value="">Select product...</option>{linkedProducts.map(p => <option key={p.id} value={p.id}>{p.name} - {formatKES(p.price)}</option>)}</select>
              </div>
              <div className="admin-form-group">
                <label>Item Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>SKU</label>
                  <input type="text" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
                </div>
                <div className="admin-form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}</select>
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Quantity</label>
                  <input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="admin-form-group">
                  <label>Reorder Level</label>
                  <input type="number" min="0" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Cost Per Unit (KES)</label>
                  <input type="number" min="0" value={form.costPerUnit} onChange={e => setForm(f => ({ ...f, costPerUnit: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="admin-form-group">
                  <label>Supplier</label>
                  <input type="text" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
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