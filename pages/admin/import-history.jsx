import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatShortDate } from "../../lib/formatters";

export default function ImportHistoryPage() {
  const { data: history, isLoading, isError } = useQuery({
    queryKey: ["import-history"],
    queryFn: async () => {
      const response = await fetch("/api/admin/import-history", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Failed to load import history");
      return response.json();
    },
  });

  return (
    <>
      <Head>
        <title>Import History - Gallery Admin</title>
      </Head>
      <AdminLayout title="Import History">
        {isLoading ? <p className="admin-note">Loading...</p> : null}
        {isError ? <p className="admin-form-error">Could not load import history.</p> : null}

        {!isLoading && !isError && history ? (
          <>
            {history.length === 0 ? (
              <div className="admin-panel">
                <p className="admin-note" style={{ marginBottom: 0 }}>
                  No imports yet. Start by uploading a CSV from the products page.
                </p>
              </div>
            ) : (
              <div className="admin-table-wrap admin-panel">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Source</th>
                      <th style={{ textAlign: "center" }}>Total</th>
                      <th style={{ textAlign: "center" }}>✓ Success</th>
                      <th style={{ textAlign: "center" }}>✗ Failed</th>
                      <th style={{ textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry) => {
                      const successRate = entry.product_count > 0 
                        ? Math.round((entry.success_count / entry.product_count) * 100)
                        : 0;
                      const hasErrors = entry.failure_count > 0;

                      return (
                        <tr key={entry.id}>
                          <td>
                            <div>
                              <div>{formatShortDate(entry.created_at)}</div>
                              <div className="admin-note" style={{ marginTop: "4px", fontSize: "0.75rem" }}>
                                {new Date(entry.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td>{entry.source === "csv" ? "📥 CSV Upload" : entry.source}</td>
                          <td style={{ textAlign: "center", fontWeight: "bold" }}>
                            {entry.product_count}
                          </td>
                          <td style={{ textAlign: "center", color: "#2E7D32" }}>
                            <strong>{entry.success_count}</strong>
                          </td>
                          <td style={{ textAlign: "center", color: hasErrors ? "#C62828" : "#999" }}>
                            {entry.failure_count > 0 ? <strong>{entry.failure_count}</strong> : "-"}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                background: successRate === 100 ? "#C8E6C9" : hasErrors ? "#FFCDD2" : "#E8F5E9",
                                color: successRate === 100 ? "#1B5E20" : hasErrors ? "#B71C1C" : "#2E7D32",
                              }}
                            >
                              {successRate === 100 ? "✓ Complete" : hasErrors ? "⚠ Partial" : "◐ Processing"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {history.length > 0 && (
              <div className="admin-panel" style={{ marginTop: "16px", background: "rgba(158, 158, 158, 0.08)" }}>
                <p className="caption" style={{ marginBottom: "8px", color: "#666" }}>
                  <strong>Total Imports:</strong> {history.length}
                </p>
                <p className="caption" style={{ color: "#666", marginBottom: 0 }}>
                  <strong>Total Products:</strong>{" "}
                  {history.reduce((sum, entry) => sum + entry.product_count, 0)}
                </p>
              </div>
            )}
          </>
        ) : null}
      </AdminLayout>
    </>
  );
}
