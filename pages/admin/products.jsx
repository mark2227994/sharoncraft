import Link from "next/link";
import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatKES } from "../../lib/formatters";
import { readProducts } from "../../lib/store";

function getThumbnail(product) {
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images[0]) {
    return typeof product.images[0] === "string" ? product.images[0] : product.images[0].src;
  }
  return "";
}

export default function AdminProductsPage({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [deleting, setDeleting] = useState(null);

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product.id);
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (response.ok) {
        setProducts((prev) => prev.filter((item) => item.id !== product.id));
      } else {
        const body = await response.json().catch(() => ({}));
        alert(body.error || "Could not delete product.");
      }
    } catch {
      alert("Network error. Could not delete product.");
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
            {products.map((product) => {
              const thumbnail = getThumbnail(product);
              return (
                <tr key={product.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {thumbnail ? (
                        <img
                          src={thumbnail}
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
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="admin-button admin-button--secondary"
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="admin-button"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        disabled={deleting === product.id}
                        onClick={() => handleDelete(product)}
                      >
                        {deleting === product.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  return { props: { initialProducts: await readProducts() } };
}
