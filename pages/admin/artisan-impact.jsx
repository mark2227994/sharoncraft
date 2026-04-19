import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminArtisanImpactPage() {
  const [artisanMetrics, setArtisanMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load artisans from site-images
      const siteImagesRes = await fetch("/api/admin/site-images");
      const siteImagesData = await siteImagesRes.json();
      let artisans = [];
      if (siteImagesData.artisanStories) {
        try {
          artisans = JSON.parse(siteImagesData.artisanStories);
        } catch {}
      }

      // Load products
      const productsRes = await fetch("/api/admin/products");
      const productsData = await productsRes.json();
      setProducts(Array.isArray(productsData) ? productsData : []);

      // Load orders
      const ordersRes = await fetch("/api/admin/orders");
      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);

      // Calculate metrics per artisan
      const metrics = artisans.map((artisan) => {
        const artisanName = artisan.name || "";
        const artisanProducts = productsData?.filter((p) =>
          p.artisan?.toLowerCase() === artisanName.toLowerCase() ||
          p.artisanId === artisan.id
        ) || [];

        const artisanOrders = ordersData?.filter((order) => {
          if (!Array.isArray(order.items)) return false;
          return order.items.some((item) =>
            artisanProducts.some((p) => p.id === item.productId || p.slug === item.slug)
          );
        }) || [];

        const totalSalesVolume = artisanOrders.reduce((sum, order) => {
          return sum + order.items.reduce((itemSum, item) => {
            return itemSum + (item.quantity || 1);
          }, 0);
        }, 0);

        const totalRevenue = artisanOrders.reduce((sum, order) => {
          return sum + order.items.reduce((itemSum, item) => {
            return itemSum + ((item.price || 0) * (item.quantity || 1));
          }, 0);
        }, 0);

        return {
          id: artisan.id,
          name: artisanName,
          location: artisan.location,
          featured: Boolean(artisan.featured),
          yearsExperience: artisan.yearsExperience,
          specialty: artisan.specialties,
          productCount: artisanProducts.length,
          totalSalesVolume,
          totalRevenue,
          totalOrders: artisanOrders.length,
          topProduct: artisanProducts.length > 0 ? artisanProducts[0]?.name : "—",
        };
      });

      setArtisanMetrics(metrics.sort((a, b) => b.totalRevenue - a.totalRevenue));
    } finally {
      setLoading(false);
    }
  }

  const totalAllRevenue = artisanMetrics.reduce((sum, m) => sum + m.totalRevenue, 0);
  const totalAllSales = artisanMetrics.reduce((sum, m) => sum + m.totalSalesVolume, 0);
  const avgRevenuePerArtisan = artisanMetrics.length > 0 ? totalAllRevenue / artisanMetrics.length : 0;

  if (loading) return <AdminLayout title="Artisan Impact Analytics"><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout title="Artisan Impact Analytics" action="Performance Metrics">
      <div className="admin-panel">
        <h2 className="heading-sm" style={{ marginBottom: "var(--space-4)" }}>
          Artisan Impact & Performance Metrics
        </h2>
        <p className="body-sm" style={{ marginBottom: "var(--space-6)", opacity: 0.7 }}>
          Track artisan visibility, sales performance, and impact across your catalog
        </p>

        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
          <div style={{ padding: "var(--space-4)", background: "#f9f6ee", borderRadius: "8px" }}>
            <p className="caption" style={{ opacity: 0.7, marginBottom: "4px" }}>
              Total Artisans
            </p>
            <p style={{ fontSize: "1.875rem", fontWeight: 600, color: "#C04D29" }}>
              {artisanMetrics.length}
            </p>
          </div>

          <div style={{ padding: "var(--space-4)", background: "#f9f6ee", borderRadius: "8px" }}>
            <p className="caption" style={{ opacity: 0.7, marginBottom: "4px" }}>
              Total Pieces Sold
            </p>
            <p style={{ fontSize: "1.875rem", fontWeight: 600, color: "#C04D29" }}>
              {totalAllSales}
            </p>
          </div>

          <div style={{ padding: "var(--space-4)", background: "#f9f6ee", borderRadius: "8px" }}>
            <p className="caption" style={{ opacity: 0.7, marginBottom: "4px" }}>
              Total Revenue Generated
            </p>
            <p style={{ fontSize: "1.875rem", fontWeight: 600, color: "#C04D29" }}>
              KES {totalAllRevenue.toLocaleString()}
            </p>
          </div>

          <div style={{ padding: "var(--space-4)", background: "#f9f6ee", borderRadius: "8px" }}>
            <p className="caption" style={{ opacity: 0.7, marginBottom: "4px" }}>
              Avg Revenue/Artisan
            </p>
            <p style={{ fontSize: "1.875rem", fontWeight: 600, color: "#C04D29" }}>
              KES {Math.round(avgRevenuePerArtisan).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Artisan Table */}
        <div className="admin-table-wrapper" style={{ marginBottom: "var(--space-8)" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Artisan Name</th>
                <th>Location</th>
                <th>Experience</th>
                <th>Products</th>
                <th>Pieces Sold</th>
                <th>Revenue Generated</th>
                <th>Orders</th>
                <th>Featured</th>
              </tr>
            </thead>
            <tbody>
              {artisanMetrics.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "var(--space-4)", opacity: 0.6 }}>
                    No artisans found. Add artisans from the Artisans admin page.
                  </td>
                </tr>
              ) : (
                artisanMetrics.map((metric) => (
                  <tr key={metric.id}>
                    <td>
                      <strong>{metric.name}</strong>
                    </td>
                    <td>{metric.location}</td>
                    <td>{metric.yearsExperience}</td>
                    <td>{metric.productCount}</td>
                    <td>
                      <strong>{metric.totalSalesVolume}</strong>
                    </td>
                    <td>
                      <strong>KES {metric.totalRevenue.toLocaleString()}</strong>
                    </td>
                    <td>{metric.totalOrders}</td>
                    <td>
                      <span className={`admin-badge ${metric.featured ? "admin-badge--success" : ""}`}>
                        {metric.featured ? "✓ Yes" : "— No"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Insights */}
        <div className="admin-note" style={{ marginTop: "var(--space-8)" }}>
          <strong>Insights & Action Items:</strong>
          <ul>
            <li>
              <strong>Top Performer:</strong> {artisanMetrics.length > 0 ? `${artisanMetrics[0].name} with KES ${artisanMetrics[0].totalRevenue.toLocaleString()}` : "—"}
            </li>
            <li>
              <strong>Featured Artisans:</strong> {artisanMetrics.filter((m) => m.featured).length}/{artisanMetrics.length} - Consider featuring underperformers to boost visibility
            </li>
            <li>
              <strong>Sales Velocity:</strong> {totalAllSales} total pieces sold across {artisanMetrics.length} artisans
            </li>
            <li>
              <strong>Next Step:</strong> Rotate featured artisans weekly to give each maker visibility in the hero slideshow
            </li>
          </ul>
        </div>

        <div className="admin-note">
          <strong>Features Coming Soon:</strong>
          <ul>
            <li>Monthly performance trends per artisan</li>
            <li>Customer review aggregation by artisan</li>
            <li>Payout summaries and payment schedules</li>
            <li>Artisan scorecards (quality, speed, communication)</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
