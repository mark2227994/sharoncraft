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

      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleVisibleSelection}
                  aria-label="Select all visible products"
                />
              </th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Visibility</th>
              <th>Status</th>
              <th>Images</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const thumbnail = getThumbnail(product);
              const availability = getAvailability(product);
              return (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSet.has(product.id)}
                      onChange={() =>
                        setSelectedIds((prev) =>
                          prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id],
                        )
                      }
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                  <td>
                    <div className="products-product">
                      {thumbnail ? <img src={thumbnail} alt="" className="products-thumb" /> : null}
                      <div>
                        <strong>{product.name}</strong>
                        <div className="caption">{product.slug}</div>
                        <div className="caption">
                          {product.artisan}
                          {product.jewelryType ? ` · ${getJewelryTypeLabel(product.jewelryType)}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{formatKES(product.price)}</td>
                  <td>
                    <ProductBadge tone={product.publishStatus === "published" ? "published" : "draft"}>
                      {product.publishStatus === "published" ? "Published" : "Draft"}
                    </ProductBadge>
                  </td>
                  <td>
                    <div className="products-status-stack">
                      <ProductBadge tone={availability}>
                        {availability === "low-stock" ? "Low stock" : availability === "sold" ? "Sold" : "Available"}
                      </ProductBadge>
                      {product.featured ? <ProductBadge tone="featured">Featured</ProductBadge> : null}
                    </div>
                  </td>
                  <td>
                    <div className="products-status-stack">
                      <ProductBadge tone={hasMissingImages(product) ? "warning" : "published"}>
                        {Array.isArray(product.images) ? product.images.length : 0} image
                        {Array.isArray(product.images) && product.images.length === 1 ? "" : "s"}
                      </ProductBadge>
                      {hasMissingImages(product) ? <span className="caption">Needs full set</span> : null}
                    </div>
                  </td>
                  <td>
                    <div className="products-actions">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="admin-button admin-button--secondary"
                        style={{ padding: "7px 12px", fontSize: "0.8rem" }}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="products-delete"
                        disabled={working}
                        onClick={() => handleDelete(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="admin-mobile-cards">
        {filteredProducts.map((product) => {
          const thumbnail = getThumbnail(product);
          const availability = getAvailability(product);
          return (
            <article key={product.id} className="admin-panel products-mobile-card">
              <div className="products-mobile-card__top">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedSet.has(product.id)}
                    onChange={() =>
                      setSelectedIds((prev) =>
                        prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id],
                      )
                    }
                  />
                </label>
                {thumbnail ? <img src={thumbnail} alt="" className="products-thumb" /> : null}
                <div>
                  <h2 className="heading-md">{product.name}</h2>
                  <p className="caption">{product.artisan}</p>
                  <p className="body-sm">{formatKES(product.price)}</p>
                </div>
              </div>
              <div className="products-status-stack" style={{ marginTop: "var(--space-3)" }}>
                <ProductBadge tone={product.publishStatus === "published" ? "published" : "draft"}>
                  {product.publishStatus === "published" ? "Published" : "Draft"}
                </ProductBadge>
                <ProductBadge tone={availability}>
                  {availability === "low-stock" ? "Low stock" : availability === "sold" ? "Sold" : "Available"}
                </ProductBadge>
              </div>
              <div className="products-actions" style={{ marginTop: "var(--space-3)" }}>
                <Link href={`/admin/products/${product.id}`} className="admin-button admin-button--secondary">
                  Edit
                </Link>
                <button type="button" className="products-delete" onClick={() => handleDelete(product)}>
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <style jsx>{`
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
        @media (max-width: 1023px) {
          .products-toolbar,
          .products-bulkbar {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 767px) {
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
