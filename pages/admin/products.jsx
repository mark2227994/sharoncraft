import Link from "next/link";
import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { categoryOptions } from "../../data/site";
import { formatKES } from "../../lib/formatters";
import { getJewelryTypeLabel } from "../../lib/products";
import { readProducts } from "../../lib/store";

const BULK_ACTIONS = [
  { value: "", label: "Bulk action" },
  { value: "publish", label: "Publish selected" },
  { value: "draft", label: "Move selected to draft" },
  { value: "feature", label: "Mark selected featured" },
  { value: "unfeature", label: "Remove featured flag" },
  { value: "mark-sold", label: "Mark selected sold" },
  { value: "mark-available", label: "Mark selected available" },
  { value: "delete", label: "Delete selected" },
];

function getThumbnail(product) {
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images[0]) {
    return typeof product.images[0] === "string" ? product.images[0] : product.images[0].src;
  }
  return "";
}

function hasMissingImages(product) {
  return !product.image || !Array.isArray(product.images) || product.images.length < 3;
}

function getAvailability(product) {
  if (product.isSold) return "sold";
  if ((product.stock || 0) <= 2) return "low-stock";
  return "available";
}

function ProductBadge({ children, tone }) {
  return <span className={`products-badge products-badge--${tone}`}>{children}</span>;
}

export default function AdminProductsPage({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [working, setWorking] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
      if (publishFilter !== "all" && product.publishStatus !== publishFilter) return false;
      if (availabilityFilter !== "all") {
        if (availabilityFilter === "missing-images" && !hasMissingImages(product)) return false;
        if (availabilityFilter !== "missing-images" && getAvailability(product) !== availabilityFilter) return false;
      }
      if (!query) return true;
      return [product.name, product.slug, product.artisan, product.category, product.jewelryType]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [availabilityFilter, categoryFilter, products, publishFilter, search]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected = filteredProducts.length > 0 && filteredProducts.every((product) => selectedSet.has(product.id));

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setWorking(true);
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Could not delete product.");
      }
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setSelectedIds((prev) => prev.filter((id) => id !== product.id));
    } catch (error) {
      alert(error.message || "Could not delete product.");
    } finally {
      setWorking(false);
    }
  }

  async function handleBulkApply() {
    if (!bulkAction || selectedIds.length === 0) return;
    if (bulkAction === "delete" && !confirm(`Delete ${selectedIds.length} selected product(s)?`)) return;

    setWorking(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ids: selectedIds, action: bulkAction }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || "Could not apply bulk action.");
      }
      setProducts(body.products || []);
      setSelectedIds([]);
      setBulkAction("");
    } catch (error) {
      alert(error.message || "Could not apply bulk action.");
    } finally {
      setWorking(false);
    }
  }

  function toggleVisibleSelection() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredProducts.some((product) => product.id === id)));
      return;
    }

    setSelectedIds((prev) => {
      const merged = new Set(prev);
      filteredProducts.forEach((product) => merged.add(product.id));
      return Array.from(merged);
    });
  }

  return (
    <AdminLayout
      title="Products"
      action={
        <Link href="/admin/products/new" className="admin-button">
          Add Product
        </Link>
      }
    >
      <section className="admin-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Total Products</p>
          <p className="admin-stat-card__value">{products.length}</p>
          <p className="admin-stat-card__delta">Full catalog</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Published</p>
          <p className="admin-stat-card__value">{products.filter((product) => product.publishStatus === "published").length}</p>
          <p className="admin-stat-card__delta">Visible on storefront</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Drafts</p>
          <p className="admin-stat-card__value">{products.filter((product) => product.publishStatus === "draft").length}</p>
          <p className="admin-stat-card__delta">Hidden until ready</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Missing Images</p>
          <p className="admin-stat-card__value admin-stat-card__value--terracotta">
            {products.filter(hasMissingImages).length}
          </p>
          <p className="admin-stat-card__delta">Need closer attention</p>
        </article>
      </section>

      <section className="admin-panel" style={{ marginBottom: "var(--space-4)" }}>
        <div className="products-toolbar">
          <input
            className="admin-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, slug, artisan, or type"
          />
          <select className="admin-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {categoryOptions.filter((category) => category !== "All").map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select className="admin-select" value={publishFilter} onChange={(event) => setPublishFilter(event.target.value)}>
            <option value="all">All visibility</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select className="admin-select" value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)}>
            <option value="all">All stock states</option>
            <option value="available">Available</option>
            <option value="low-stock">Low stock</option>
            <option value="sold">Sold</option>
            <option value="missing-images">Missing images</option>
          </select>
        </div>
      </section>

      <section className="admin-panel" style={{ marginBottom: "var(--space-4)" }}>
        <div className="products-bulkbar">
          <button type="button" className="admin-button admin-button--secondary" onClick={toggleVisibleSelection}>
            {allVisibleSelected ? "Clear visible selection" : "Select visible"}
          </button>
          <p className="admin-note">{selectedIds.length} selected</p>
          <select className="admin-select" value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
            {BULK_ACTIONS.map((action) => (
              <option key={action.value || "none"} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="admin-button"
            disabled={!bulkAction || selectedIds.length === 0 || working}
            onClick={handleBulkApply}
          >
            {working ? "Applying..." : "Apply"}
          </button>
        </div>
      </section>

      <section className="products-grid-wrap">
        <div className="products-grid-header">
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#333" }}>
            Showing {filteredProducts.length} of {products.length} products
          </h2>
          <button
            type="button"
            className="products-select-toggle"
            onClick={toggleVisibleSelection}
          >
            {allVisibleSelected ? "✕ Clear" : "✓ Select all"}
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="products-empty">
            <p>No products match your filters.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const thumbnail = getThumbnail(product);
              const availability = getAvailability(product);
              const isSelected = selectedSet.has(product.id);

              return (
                <article key={product.id} className={`products-card ${isSelected ? "products-card--selected" : ""}`}>
                  {/* Image Section */}
                  <div className="products-card-image-wrap">
                    {thumbnail ? (
                      <img src={thumbnail} alt={product.name} className="products-card-image" />
                    ) : (
                      <div className="products-card-image-empty">No image</div>
                    )}
                    <label className="products-card-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(product.id)
                              ? prev.filter((id) => id !== product.id)
                              : [...prev, product.id]
                          )
                        }
                      />
                    </label>
                  </div>

                  {/* Content Section */}
                  <div className="products-card-content">
                    <div className="products-card-header">
                      <h3 className="products-card-title">{product.name}</h3>
                      <p className="products-card-artisan">{product.artisan}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="products-card-details">
                      <div className="products-detail-item">
                        <span className="products-detail-label">Price</span>
                        <span className="products-detail-value">{formatKES(product.price)}</span>
                      </div>
                      <div className="products-detail-item">
                        <span className="products-detail-label">Category</span>
                        <span className="products-detail-value">{product.category}</span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="products-card-badges">
                      <ProductBadge tone={product.publishStatus === "published" ? "published" : "draft"}>
                        {product.publishStatus === "published" ? "Published" : "Draft"}
                      </ProductBadge>
                      <ProductBadge tone={availability}>
                        {availability === "low-stock"
                          ? "Low stock"
                          : availability === "sold"
                            ? "Sold"
                            : "Available"}
                      </ProductBadge>
                      {product.featured ? <ProductBadge tone="featured">Featured</ProductBadge> : null}
                      <ProductBadge tone={hasMissingImages(product) ? "warning" : "published"}>
                        {Array.isArray(product.images) ? product.images.length : 0} 📷
                      </ProductBadge>
                    </div>

                    {/* Actions */}
                    <div className="products-card-actions">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="products-card-btn products-card-btn--primary"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="products-card-btn products-card-btn--danger"
                        disabled={working}
                        onClick={() => handleDelete(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <style jsx>{`
        /* Grid Layout */
        .products-grid-wrap {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }

        .products-grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f5f5f5;
        }

        .products-select-toggle {
          padding: 0.5rem 1rem;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .products-select-toggle:hover {
          background: #efefef;
          border-color: #d4a574;
        }

        .products-empty {
          text-align: center;
          padding: 3rem 2rem;
          color: #999;
          font-size: 1rem;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        /* Product Card */
        .products-card {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .products-card:hover {
          border-color: #d4a574;
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
          transform: translateY(-2px);
        }

        .products-card--selected {
          border-color: #d4a574;
          background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
        }

        /* Image Section */
        .products-card-image-wrap {
          position: relative;
          width: 100%;
          height: 180px;
          background: #f5f5f5;
          overflow: hidden;
        }

        .products-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .products-card-image-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, #f0f0f0 0%, #fafafa 100%);
          color: #999;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .products-card-checkbox {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          width: 24px;
          height: 24px;
          background: white;
          border: 2px solid #ddd;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .products-card-checkbox input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #d4a574;
        }

        .products-card-checkbox:hover {
          border-color: #d4a574;
          background: #fffbf0;
        }

        /* Content Section */
        .products-card-content {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .products-card-header {
          margin-bottom: 0.75rem;
        }

        .products-card-title {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #333;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .products-card-artisan {
          margin: 0;
          font-size: 0.8rem;
          color: #999;
        }

        /* Details Grid */
        .products-card-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          padding: 0.75rem 0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
        }

        .products-detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .products-detail-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .products-detail-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #d4a574;
        }

        /* Badges */
        .products-card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        /* Actions */
        .products-card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
        }

        .products-card-btn {
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
          text-decoration: none;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .products-card-btn:hover:not(:disabled) {
          border-color: #d4a574;
          color: #d4a574;
          background: #fffbf0;
        }

        .products-card-btn--primary {
          background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
          color: white;
          border: none;
        }

        .products-card-btn--primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
        }

        .products-card-btn--danger {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fca5a5;
        }

        .products-card-btn--danger:hover:not(:disabled) {
          background: #fecaca;
          border-color: #f87171;
        }

        .products-card-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Existing CSS */
        .products-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 0.8fr));
          gap: var(--space-3);
        }
        .products-bulkbar {
          display: grid;
          grid-template-columns: auto auto minmax(220px, 280px) auto;
          gap: var(--space-3);
          align-items: center;
        }
        .products-product {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .products-thumb {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .products-status-stack {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
        }
        .products-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 600;
        }
        .products-badge--published {
          background: rgba(74, 82, 64, 0.12);
          color: var(--color-moss);
        }
        .products-badge--draft {
          background: rgba(107, 76, 42, 0.12);
          color: var(--color-bark);
        }
        .products-badge--available {
          background: rgba(74, 82, 64, 0.12);
          color: var(--color-moss);
        }
        .products-badge--low-stock,
        .products-badge--warning {
          background: rgba(184, 115, 51, 0.12);
          color: var(--color-ochre);
        }
        .products-badge--sold {
          background: rgba(192, 77, 41, 0.12);
          color: var(--color-terracotta);
        }
        .products-badge--featured {
          background: rgba(184, 115, 51, 0.12);
          color: var(--color-ochre);
        }
        .products-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }
        .products-delete {
          padding: 8px 12px;
          border-radius: var(--radius-md);
          background: var(--color-terracotta);
          color: var(--color-white);
          font-size: 0.8rem;
          font-weight: 600;
        }
        .products-mobile-card {
          padding: var(--space-4);
        }
        .products-mobile-card__top {
          display: grid;
          grid-template-columns: auto auto 1fr;
          gap: var(--space-3);
          align-items: center;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }
        }

        @media (max-width: 1023px) {
          .products-toolbar,
          .products-bulkbar {
            grid-template-columns: 1fr;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          }
        }

        @media (max-width: 767px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          }

          .products-card-image-wrap {
            height: 140px;
          }

          .products-card-content {
            padding: 0.75rem;
          }

          .products-card-details {
            font-size: 0.75rem;
          }

          .products-card-title {
            font-size: 0.85rem;
          }

          .products-mobile-card__top {
            grid-template-columns: auto 1fr;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  return { props: { initialProducts: await readProducts() } };
}
