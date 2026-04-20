import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";
import ArtisanFilter from "../../../components/admin/ArtisanFilter";
import BatchEditModal from "../../../components/admin/BatchEditModal";
import { formatKES } from "../../../lib/formatters";
import { getJewelryTypeLabel } from "../../../lib/products";

export default function AdminProductsPage() {
  const [deleting, setDeleting] = useState(null);
  const [selectedArtisan, setSelectedArtisan] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBatchEdit, setShowBatchEdit] = useState(false);

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Failed");
      return response.json();
    },
  });

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product.id);
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        alert(body.error || "Could not delete product.");
        return;
      }
      window.location.reload();
    } catch {
      alert("Network error. Could not delete product.");
    } finally {
      setDeleting(null);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selectAll() {
    if (selectedIds.length === products?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products?.map((p) => p.id) || []);
    }
  }

  function handleBatchEditSaved() {
    setSelectedIds([]);
    setShowBatchEdit(false);
    // Refetch products
    window.location.reload();
  }

  return (
    <>
      <Head>
        <title>Stock - Gallery Admin</title>
      </Head>
      <AdminLayout
        title="Stock"
        action={
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href="/admin/products/import" className="admin-button admin-button--secondary">
              📥 Bulk Import
            </Link>
            <Link href="/admin/products/new" className="admin-button">
              New piece
            </Link>
          </div>
        }
      >
        {isLoading ? <p className="admin-note">Loading...</p> : null}
        {isError ? <p className="admin-form-error">Could not load stock. Check your connection.</p> : null}

        {!isLoading && products ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "16px", flexWrap: "wrap" }}>
              <ArtisanFilter
                products={products}
                onFilterChange={setSelectedArtisan}
              />
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  className="admin-button"
                  onClick={() => setShowBatchEdit(true)}
                  style={{ background: "#673AB7" }}
                >
                  ✏️ Edit {selectedIds.length}
                </button>
              )}
            </div>

            <div className="admin-table-wrap admin-panel">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.length === products.length && products.length > 0}
                        onChange={selectAll}
                        style={{ cursor: "pointer" }}
                      />
                    </th>
                    <th>Piece</th>
                    <th>Artisan</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter((p) => !selectedArtisan || p.artisan === selectedArtisan)
                    .map((product) => (
                    <tr key={product.id}>
                      <td style={{ width: "40px" }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td>
                        <div>
                          <div>{product.name}</div>
                          <div className="admin-note" style={{ marginTop: "4px" }}>
                            {product.category}
                            {product.jewelryType ? ` | ${getJewelryTypeLabel(product.jewelryType)}` : ""}
                          </div>
                        </div>
                      </td>
                      <td>{product.artisan}</td>
                      <td>{product.isSold ? "Sold" : formatKES(product.price)}</td>
                      <td>{product.isSold ? "-" : product.stock}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                          <Link href={`/admin/products/${product.id}`} className="admin-link">
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
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-mobile-cards">
              {products.map((product) => (
                <div key={product.id} className="admin-form-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div>
                      <p className="heading-sm" style={{ fontSize: "1rem" }}>
                        {product.name}
                      </p>
                      <p className="admin-note" style={{ marginTop: "4px" }}>
                        {product.artisan}
                        {product.jewelryType ? ` | ${getJewelryTypeLabel(product.jewelryType)}` : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <Link href={`/admin/products/${product.id}`} className="admin-link">
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
                  </div>
                  <p style={{ marginTop: "12px", fontWeight: 600 }}>
                    {product.isSold ? "Sold" : formatKES(product.price)}
                  </p>
                  {!product.isSold ? (
                    <p className="admin-note" style={{ marginTop: "4px" }}>
                      {product.stock} in stock
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            {showBatchEdit && (
              <BatchEditModal
                selectedIds={selectedIds}
                products={products}
                onClose={() => setShowBatchEdit(false)}
                onSave={handleBatchEditSaved}
              />
            )}
          </>
        ) : null}
      </AdminLayout>
    </>
  );
}
