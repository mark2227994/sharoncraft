import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";
import SeoHead from "../../../components/SeoHead";

export default function ProductPerformancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const response = await fetch("/api/admin/products/performance", {
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch performance data");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || "Could not load performance data");
      } finally {
        setLoading(false);
      }
    }

    fetchPerformance();
  }, []);

  return (
    <>
      <SeoHead
        title="Product Performance | SharonCraft Admin"
        description="Track product performance and analytics"
        path="/admin/products/performance"
      />
      <AdminLayout title="Product Performance Dashboard">
        <style>{`
          .perf-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .perf-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
          }

          .perf-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .perf-card h3 {
            margin: 0 0 12px 0;
            font-size: 13px;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .perf-card .big-number {
            font-size: 36px;
            font-weight: 700;
            color: #333;
            margin: 0 0 8px 0;
          }

          .perf-card .subtext {
            font-size: 13px;
            color: #999;
          }

          .perf-section {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
          }

          .perf-section h2 {
            margin: 0 0 20px 0;
            font-size: 18px;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #C04D29;
            padding-bottom: 12px;
          }

          .perf-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }

          .perf-table thead {
            background: #f5f5f5;
          }

          .perf-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #666;
            border-bottom: 1px solid #ddd;
          }

          .perf-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
            color: #333;
          }

          .perf-table tr:hover {
            background: #fafafa;
          }

          .perf-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }

          .perf-badge.published {
            background: #e8f5e9;
            color: #2e7d32;
          }

          .perf-badge.draft {
            background: #fff3e0;
            color: #e65100;
          }

          .perf-empty {
            text-align: center;
            padding: 40px 20px;
            color: #999;
          }

          .perf-error {
            background: #ffebee;
            border: 1px solid #f44336;
            border-radius: 8px;
            padding: 16px;
            color: #c62828;
            margin-bottom: 24px;
          }

          .perf-loading {
            text-align: center;
            padding: 40px;
            color: #999;
          }

          .perf-link {
            color: #C04D29;
            text-decoration: none;
            font-weight: 500;
          }

          .perf-link:hover {
            text-decoration: underline;
          }
        `}</style>

        <div className="perf-container">
          {error && <div className="perf-error">⚠️ {error}</div>}

          {loading ? (
            <div className="perf-loading">Loading performance data...</div>
          ) : !data || !data.totals ? (
            <div className="perf-empty">No data available yet</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="perf-grid">
                <div className="perf-card">
                  <h3>Total Products</h3>
                  <p className="big-number">{data.totals.totalProducts}</p>
                  <p className="subtext">
                    {data.totals.publishedProducts} published, {data.totals.draftProducts} draft
                  </p>
                </div>

                <div className="perf-card">
                  <h3>Average Price</h3>
                  <p className="big-number">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                      minimumFractionDigits: 0,
                    }).format(data.totals.averagePrice)}
                  </p>
                  <p className="subtext">Across all products</p>
                </div>

                <div className="perf-card">
                  <h3>Total Inventory Value</h3>
                  <p className="big-number">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                      minimumFractionDigits: 0,
                    }).format(data.totals.totalValue)}
                  </p>
                  <p className="subtext">If all products sold</p>
                </div>

                <div className="perf-card">
                  <h3>Total Categories</h3>
                  <p className="big-number">{data.categories?.length || 0}</p>
                  <p className="subtext">Product classifications</p>
                </div>
              </div>

              {/* Categories Section */}
              {data.categories && data.categories.length > 0 && (
                <div className="perf-section">
                  <h2>Categories Performance</h2>
                  <table className="perf-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Products</th>
                        <th>Published</th>
                        <th>Draft</th>
                        <th>Avg Price</th>
                        <th>Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.categories.map((cat) => (
                        <tr key={cat.category}>
                          <td>
                            <strong>{cat.category}</strong>
                          </td>
                          <td>{cat.count}</td>
                          <td>
                            <span className="perf-badge published">{cat.published}</span>
                          </td>
                          <td>
                            <span className="perf-badge draft">{cat.draft}</span>
                          </td>
                          <td>
                            {new Intl.NumberFormat("en-KE", {
                              style: "currency",
                              currency: "KES",
                              minimumFractionDigits: 0,
                            }).format(cat.avgPrice)}
                          </td>
                          <td>
                            {new Intl.NumberFormat("en-KE", {
                              style: "currency",
                              currency: "KES",
                              minimumFractionDigits: 0,
                            }).format(cat.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Top Products Section */}
              {data.topProducts && data.topProducts.length > 0 && (
                <div className="perf-section">
                  <h2>Top 10 Products by Value</h2>
                  <table className="perf-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <Link href={`/admin/products/${product.id}`} className="perf-link">
                              {product.name}
                            </Link>
                          </td>
                          <td>{product.category}</td>
                          <td>
                            {new Intl.NumberFormat("en-KE", {
                              style: "currency",
                              currency: "KES",
                              minimumFractionDigits: 0,
                            }).format(product.price)}
                          </td>
                          <td>
                            <span
                              className={`perf-badge ${
                                product.publishStatus === "published" ? "published" : "draft"
                              }`}
                            >
                              {product.publishStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* All Products List */}
              {data.products && data.products.length > 0 && (
                <div className="perf-section">
                  <h2>All Products ({data.products.length})</h2>
                  <table className="perf-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <Link href={`/admin/products/${product.id}`} className="perf-link">
                              {product.name}
                            </Link>
                          </td>
                          <td>{product.category}</td>
                          <td>
                            {new Intl.NumberFormat("en-KE", {
                              style: "currency",
                              currency: "KES",
                              minimumFractionDigits: 0,
                            }).format(product.price || 0)}
                          </td>
                          <td>
                            <span
                              className={`perf-badge ${
                                product.publishStatus === "published" ? "published" : "draft"
                              }`}
                            >
                              {product.publishStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link href="/admin/products" style={{ color: "#C04D29", textDecoration: "none", fontWeight: "500" }}>
              ← Back to Products
            </Link>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
