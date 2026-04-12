import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatKES } from "../../lib/formatters";
import { readProducts } from "../../lib/store";

export default function AdminProductsPage({ products }) {
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
              <th>Artisan</th>
              <th>Price</th>
              <th>Status</th>
              <th>Story</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.artisan}</td>
                <td>{formatKES(product.price)}</td>
                <td>
                  <span className={`admin-pill ${product.isSold ? "admin-pill--failed" : "admin-pill--completed"}`}>
                    {product.isSold ? "Sold" : "Available"}
                  </span>
                </td>
                <td>
                  <Link href={`/admin/product-story?productId=${product.id}`} style={{ color: "var(--color-terracotta)" }}>
                    Edit Story →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  return { props: { products: await readProducts() } };
}
