import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { groupProductsByStatus } from "../../lib/product-validation";

export default function DashboardAlerts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Failed to load products");
      return response.json();
    },
  });

  const [groupedStatus, setGroupedStatus] = useState(null);

  useEffect(() => {
    if (products) {
      setGroupedStatus(groupProductsByStatus(products));
    }
  }, [products]);

  if (isLoading || !groupedStatus) return null;

  const { incomplete, lowStock, incompleteCount, lowStockCount } = groupedStatus;

  // Don't show if no issues
  if (incompleteCount === 0 && lowStockCount === 0) {
    return (
      <div className="admin-panel" style={{ background: "rgba(76, 175, 80, 0.08)", borderColor: "#4CAF50" }}>
        <p className="body-sm" style={{ color: "#2E7D32", margin: 0 }}>
          ✓ All products are complete and well-stocked
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
      {/* Incomplete Listings Alert */}
      {incompleteCount > 0 && (
        <div className="admin-panel" style={{ background: "rgba(255, 193, 7, 0.08)", borderColor: "#FFC107" }}>
          <div style={{ marginBottom: "12px" }}>
            <p className="heading-sm" style={{ color: "#F57F17", margin: "0 0 4px 0" }}>
              ⚠️ {incompleteCount} Incomplete Listing{incompleteCount !== 1 ? "s" : ""}
            </p>
            <p className="caption" style={{ color: "#666", margin: 0 }}>
              Missing required fields: {incomplete.length > 0 && incomplete[0].missingFields.join(", ")}
            </p>
          </div>

          <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "12px" }}>
            {incomplete.slice(0, 5).map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                style={{
                  display: "block",
                  padding: "8px",
                  marginBottom: "4px",
                  background: "#fff",
                  border: "1px solid #FFC107",
                  borderRadius: "4px",
                  textDecoration: "none",
                  color: "#333",
                  fontSize: "0.875rem",
                }}
              >
                <strong>{product.name}</strong>
                <div style={{ fontSize: "0.75rem", color: "#F57F17" }}>
                  {product.completeness.percentage}% complete · Missing: {product.missingFields.join(", ")}
                </div>
              </Link>
            ))}
            {incomplete.length > 5 && (
              <p className="caption" style={{ color: "#666", marginTop: "8px" }}>
                +{incomplete.length - 5} more incomplete
              </p>
            )}
          </div>

          <Link href="/admin/products" style={{ fontSize: "0.875rem", color: "#F57F17", textDecoration: "none" }}>
            → Fix all incomplete listings
          </Link>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="admin-panel" style={{ background: "rgba(244, 67, 54, 0.08)", borderColor: "#F44336" }}>
          <div style={{ marginBottom: "12px" }}>
            <p className="heading-sm" style={{ color: "#C62828", margin: "0 0 4px 0" }}>
              🔴 {lowStockCount} Low Stock Item{lowStockCount !== 1 ? "s" : ""}
            </p>
            <p className="caption" style={{ color: "#666", margin: 0 }}>
              Stock below 3 units - consider restocking
            </p>
          </div>

          <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "12px" }}>
            {lowStock.slice(0, 5).map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px",
                  marginBottom: "4px",
                  background: "#fff",
                  border: "1px solid #F44336",
                  borderRadius: "4px",
                  textDecoration: "none",
                  color: "#333",
                  fontSize: "0.875rem",
                }}
              >
                <strong>{product.name}</strong>
                <span style={{ background: "#F44336", color: "#fff", padding: "2px 6px", borderRadius: "2px", fontSize: "0.75rem" }}>
                  {product.stock} in stock
                </span>
              </Link>
            ))}
            {lowStock.length > 5 && (
              <p className="caption" style={{ color: "#666", marginTop: "8px" }}>
                +{lowStock.length - 5} more low stock
              </p>
            )}
          </div>

          <Link href="/admin/products" style={{ fontSize: "0.875rem", color: "#C62828", textDecoration: "none" }}>
            → Manage stock levels
          </Link>
        </div>
      )}
    </div>
  );
}
