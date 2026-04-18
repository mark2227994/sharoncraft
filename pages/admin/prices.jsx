import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { formatKES } from "../../lib/formatters";

async function fetchProducts() {
  const res = await fetch("/api/admin/products", { credentials: "same-origin" });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export default function PriceEditorPage() {
  const { data: products = [], isLoading, refetch } = useQuery({ queryKey: ["admin-products-prices"], queryFn: fetchProducts });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [changes, setChanges] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    const changedEntries = Object.entries(changes).filter(([id, price]) => {
      const product = products.find((item) => item.id === id);
      return product && Number(price) >= 0 && Number(price) !== Number(product.price);
    });
    if (changedEntries.length === 0) return;

    setSaving(true);
    setMessage("");
    setError("");
    try {
      for (const [id, price] of changedEntries) {
        const existing = products.find((item) => item.id === id);
        const payload = { ...existing, price: Number(price) };
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.error || `Failed to update ${existing?.name || id}`);
        }
      }

      setChanges({});
      setMessage(`Updated ${changedEntries.length} product price${changedEntries.length > 1 ? "s" : ""}.`);
      await refetch();
    } catch (err) {
      setError(String(err?.message || "Could not save price changes."));
    } finally {
      setSaving(false);
    }
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
      {message ? <p className="saved-indicator">{message}</p> : null}
      {error ? <p className="admin-form-error">{error}</p> : null}

      {isLoading ? <p className="admin-note">Loading...</p> : (
        <>
          <section className="prices-grid-wrap">
            <div className="prices-grid-header">
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#333" }}>
                Showing {filtered.length} of {products.length} products
              </h2>
            </div>

            {filtered.length === 0 ? (
              <p style={{ color: "#999", textAlign: "center", padding: "2rem" }}>No products found.</p>
            ) : (
              <div className="prices-grid">
                {filtered.map((p) => {
                  const newPrice = changes[p.id];
                  const hasChange = newPrice !== undefined && newPrice !== p.price;
                  const displayPrice = newPrice !== undefined ? newPrice : p.price;
                  
                  return (
                    <article key={p.id} className={`price-card ${hasChange ? "price-card--changed" : ""}`}>
                      <div className="price-card-header">
                        <h3 className="price-card-name">{p.name}</h3>
                        <p className="price-card-category">{p.category}</p>
                      </div>

                      <div className="price-card-info">
                        <div className="price-info-item">
                          <span className="price-info-label">Current Price</span>
                          <span className="price-info-value">{formatKES(p.price)}</span>
                        </div>
                        <div className="price-info-item">
                          <span className="price-info-label">Stock</span>
                          <span className="price-info-value">{p.stock || "—"}</span>
                        </div>
                      </div>

                      <div className="price-card-input-section">
                        <label className="price-label">New Price (KES)</label>
                        <input
                          type="number"
                          className="price-input"
                          value={displayPrice}
                          onChange={(e) => handlePriceChange(p.id, e.target.value)}
                          min="0"
                          step="50"
                        />
                      </div>

                      {hasChange && (
                        <div className="price-card-change">
                          <span className="price-arrow">→</span>
                          <span className="price-new-value">{formatKES(newPrice)}</span>
                          <span className="price-inventory-value">
                            Inventory: {formatKES((newPrice || 0) * (p.stock || 1))}
                          </span>
                        </div>
                      )}

                      <p className="price-card-value">Inventory Value: {formatKES((p.price || 0) * (p.stock || 1))}</p>
                    </article>
                  );
                })}
              </div>
            )}

            <style jsx>{`
              .prices-grid-wrap {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                padding: 1.5rem;
                margin-top: 1.5rem;
              }

              .prices-grid-header {
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 2px solid #f5f5f5;
              }

              .prices-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                gap: 1.25rem;
              }

              .price-card {
                background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
                border: 1px solid #e8e8e8;
                border-radius: 10px;
                padding: 1.25rem;
                transition: all 0.3s ease;
              }

              .price-card:hover {
                border-color: #d4a574;
                box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
                transform: translateY(-2px);
              }

              .price-card--changed {
                border-color: #fcd34d;
                background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
              }

              .price-card-header {
                margin-bottom: 1rem;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid #f0f0f0;
              }

              .price-card-name {
                margin: 0;
                font-size: 0.95rem;
                font-weight: 600;
                color: #333;
              }

              .price-card-category {
                margin: 0.25rem 0 0 0;
                font-size: 0.75rem;
                color: #999;
              }

              .price-card-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0.75rem;
                margin-bottom: 1rem;
                padding: 0.75rem;
                background: #f5f5f5;
                border-radius: 8px;
              }

              .price-info-item {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
              }

              .price-info-label {
                font-size: 0.7rem;
                font-weight: 600;
                color: #999;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }

              .price-info-value {
                font-size: 0.9rem;
                font-weight: 600;
                color: #333;
              }

              .price-card-input-section {
                margin-bottom: 1rem;
              }

              .price-label {
                display: block;
                font-size: 0.75rem;
                font-weight: 600;
                color: #666;
                margin-bottom: 0.5rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }

              .price-input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 0.9rem;
                font-weight: 600;
                color: #d4a574;
              }

              .price-input:focus {
                outline: none;
                border-color: #d4a574;
                box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
              }

              .price-card-change {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                padding: 0.75rem;
                background: #fef3c7;
                border: 1px solid #fcd34d;
                border-radius: 6px;
                margin-bottom: 0.75rem;
              }

              .price-arrow {
                font-size: 1rem;
                color: #f59e0b;
                font-weight: 700;
              }

              .price-new-value {
                font-size: 1.1rem;
                font-weight: 700;
                color: #d4a574;
              }

              .price-inventory-value {
                font-size: 0.75rem;
                color: #999;
                font-weight: 500;
              }

              .price-card-value {
                font-size: 0.75rem;
                color: #999;
                margin: 0;
              }

              @media (max-width: 1200px) {
                .prices-grid {
                  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                }
              }

              @media (max-width: 767px) {
                .prices-grid {
                  grid-template-columns: 1fr;
                }

                .price-card-info {
                  grid-template-columns: 1fr;
                }
              }
            `}</style>
          </section>
        </>
      )}
    </AdminLayout>
  );
}
