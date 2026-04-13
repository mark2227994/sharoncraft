import Link from "next/link";
import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatKES } from "../../lib/formatters";
import { readProducts } from "../../lib/store";

export default function AdminProductsPage({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [deleting, setDeleting] = useState(null);

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product.id);
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
      } else {
        const body = await res.json().catch(() => ({}));
        alert(body.error || "Could not delete product.");
      }
    } catch {
      alert("Network error — could not delete product.");
    } finally {
      setDeleting(null);
    }
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
      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {product.image || (product.images && product.images[0]) ? (
                      <img
                        src={product.image || product.images[0]}
                        alt=""
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                      />
                    ) : null}
                    <span>{product.name}</span>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{formatKES(product.price)}</td>
                <td>
                  <span className={`admin-pill ${product.isSold ? "admin-pill--failed" : "admin-pill--completed"}`}>
                    {product.isSold ? "Sold" : "Available"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="admin-button admin-button--secondary admin-button--sm"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      type="button"
                      className="admin-button admin-button--danger admin-button--sm"
                      disabled={deleting === product.id}
                      onClick={() => handleDelete(product)}
                    >
                      {deleting === product.id ? "…" : "🗑 Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <style jsx>{`
        .admin-button--sm {
          padding: 6px 12px;
          font-size: 0.8rem;
        }
        .admin-button--danger {
          background: #dc2626;
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 600;
        }
        .admin-button--danger:hover:not(:disabled) {
          background: #b91c1c;
        }
        .admin-button--danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  return { props: { initialProducts: await readProducts() } };
}
