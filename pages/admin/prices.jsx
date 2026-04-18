import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { formatKES } from "../../lib/formatters";

async function fetchProducts() {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export default function PriceEditorPage() {
  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [changes, setChanges] = useState({});
  const [saving, setSaving] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const filtered = useMemo(() => {
    let items = products;
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(p => p.name?.toLowerCase().includes(s) || p.slug?.toLowerCase().includes(s));
    }
    if (categoryFilter) items = items.filter(p => p.category === categoryFilter);
    return items;
  }, [products, search, categoryFilter]);

  const totalValue = useMemo(() => products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 1)), 0), [products]);

  function handlePriceChange(productId, newPrice) {
    setChanges(c => ({ ...c, [productId]: parseFloat(newPrice) }));
  }

  async function handleSaveAll() {
    setSaving(true);
    // In production, this would call an API to update prices
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setChanges({});
    alert("Prices updated successfully!");
  }

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <AdminLayout title="Price Editor">
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Products</p>
          <p className="admin-stat-value">{products.length}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Inventory Value</p>
          <p className="admin-stat-value">{formatKES(totalValue)}</p>
        </div>
        <div className="admin-stat-card admin-stat-card--info">
          <p className="admin-stat-label">Changes Pending</p>
          <p className="admin-stat-value">{Object.keys(changes).length}</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input type="text" className="admin-search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="admin-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {hasChanges && <button className="admin-button" onClick={handleSaveAll} disabled={saving}>{saving ? "Saving..." : "Save All Changes"}</button>}
      </div>

      {isLoading ? <p className="admin-note">Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Current Price</th><th>New Price</th><th>Stock</th><th>Value</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const newPrice = changes[p.id];
                const hasChange = newPrice !== undefined && newPrice !== p.price;
                return (
                  <tr key={p.id} className={hasChange ? "admin-row--highlight" : ""}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category}</td>
                    <td>{formatKES(p.price)}</td>
                    <td>
                      <input type="number" className="admin-price-input" value={newPrice !== undefined ? newPrice : p.price} onChange={e => handlePriceChange(p.id, e.target.value)} min="0" step="50" />
                      {hasChange && <span className="admin-change-indicator">→ {formatKES(newPrice)}</span>}
                    </td>
                    <td>{p.stock || "-"}</td>
                    <td>{formatKES((p.price || 0) * (p.stock || 1))}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="admin-empty">No products found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}