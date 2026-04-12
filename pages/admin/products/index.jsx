import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";
import { formatKES } from "../../../lib/formatters";

export default function AdminProductsPage() {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Failed");
      return response.json();
    },
  });

  return (
    <>
      <Head>
        <title>Stock — Gallery Admin</title>
      </Head>
      <AdminLayout
        title="Stock"
        action={
          <Link href="/admin/products/new" className="admin-button">
            New piece
          </Link>
        }
      >
        {isLoading ? <p className="admin-note">Loading…</p> : null}
        {isError ? <p className="admin-form-error">Could not load stock. Check your connection.</p> : null}

        {!isLoading && products ? (
          <>
            <div className="admin-table-wrap admin-panel">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Piece</th>
                    <th>Artisan</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.artisan}</td>
                      <td>{product.isSold ? "Sold" : formatKES(product.price)}</td>
                      <td>{product.isSold ? "—" : product.stock}</td>
                      <td>
                        <Link href={`/admin/products/${product.id}`} className="admin-link">
                          Edit
                        </Link>
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
                      </p>
                    </div>
                    <Link href={`/admin/products/${product.id}`} className="admin-link">
                      Edit
                    </Link>
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
          </>
        ) : null}
      </AdminLayout>
    </>
  );
}
