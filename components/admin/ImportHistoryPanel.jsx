import { useEffect, useState } from "react";

export default function ImportHistoryPanel() {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchImportHistory();
  }, []);

  async function fetchImportHistory() {
    try {
      const response = await fetch("/api/admin/import-history?limit=20", {
        credentials: "same-origin",
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch");

      setImports(Array.isArray(data) ? data : data.imports || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-panel">
        <p style={{ color: "#999" }}>Loading import history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <p style={{ color: "#D32F2F" }}>❌ {error}</p>
      </div>
    );
  }

  if (imports.length === 0) {
    return (
      <div className="admin-panel">
        <p style={{ color: "#999" }}>No imports yet</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h3 style={{ margin: "0 0 16px 0" }}>Recent Imports</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "8px", fontWeight: "bold" }}>Date</th>
              <th style={{ textAlign: "left", padding: "8px", fontWeight: "bold" }}>User</th>
              <th style={{ textAlign: "center", padding: "8px", fontWeight: "bold" }}>Total</th>
              <th style={{ textAlign: "center", padding: "8px", fontWeight: "bold" }}>Success</th>
              <th style={{ textAlign: "center", padding: "8px", fontWeight: "bold" }}>Failed</th>
              <th style={{ textAlign: "center", padding: "8px", fontWeight: "bold" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {imports.map((imp, idx) => {
              const timestamp = new Date(imp.timestamp || imp.created_at);
              const date = timestamp.toLocaleDateString();
              const time = timestamp.toLocaleTimeString();
              const user = imp.userEmail || imp.userId || "Unknown";
              const total = imp.totalCount || imp.product_count || 0;
              const success = imp.successCount || imp.success_count || 0;
              const failed = imp.failureCount || imp.failure_count || 0;
              const successRate = total > 0 ? ((success / total) * 100).toFixed(0) : 0;

              return (
                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#666" }}>
                      {date}
                      <br />
                      {time}
                    </div>
                  </td>
                  <td style={{ padding: "8px", fontSize: "0.75rem", color: "#666" }}>{user}</td>
                  <td style={{ textAlign: "center", padding: "8px", fontWeight: "bold" }}>{total}</td>
                  <td style={{ textAlign: "center", padding: "8px", color: "#4CAF50" }}>{success}</td>
                  <td style={{ textAlign: "center", padding: "8px", color: "#D32F2F" }}>{failed}</td>
                  <td style={{ textAlign: "center", padding: "8px" }}>
                    <span
                      style={{
                        background: failed === 0 ? "#E8F5E9" : "#FFF3E0",
                        color: failed === 0 ? "#2E7D32" : "#E65100",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                      }}
                    >
                      {successRate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
