import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import SeoHead from "../../components/SeoHead";

export default function AdminCleanupPage() {
  const [selected, setSelected] = useState({
    orders: true,
    custom: true,
    customers: false,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handlePreview() {
    setLoading(true);
    setError("");
    setPreview(null);

    try {
      const types = Object.keys(selected).filter(k => selected[k]);
      const params = new URLSearchParams();
      params.set("action", "preview");
      if (types.length === 1) {
        params.set("type", types[0]);
      }

      const response = await fetch(`/api/admin/cleanup?${params}`, {
        credentials: "same-origin",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Preview failed");
      }

      setPreview(data);
    } catch (err) {
      setError(err.message || "Could not load preview");
    } finally {
      setLoading(false);
    }
  }

  async function handleExecute() {
    const types = Object.keys(selected).filter(k => selected[k]);
    
    if (types.length === 0) {
      setError("Select at least one data type to clear");
      return;
    }

    const confirmMsg = preview 
      ? `Are you sure? This will delete ${preview.totalItems} items.`
      : "Are you sure? This will delete all selected test data.";

    if (!confirm(confirmMsg)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "execute",
          types,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Cleanup failed");
      }

      setResult(data);
      setPreview(null);
    } catch (err) {
      setError(err.message || "Could not execute cleanup");
    } finally {
      setLoading(false);
    }
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <>
      <SeoHead
        title="Admin Cleanup | SharonCraft Admin"
        description="Clear test data and reset admin panel"
        path="/admin/cleanup"
      />
      <AdminLayout title="Admin Cleanup Tool">
        <style>{`
          .cleanup-container {
            max-width: 700px;
            margin: 0 auto;
          }

          .cleanup-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 32px;
            margin-bottom: 24px;
          }

          .cleanup-warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            color: #856404;
            font-size: 14px;
            line-height: 1.6;
          }

          .cleanup-warning strong {
            color: #721c24;
          }

          .cleanup-section {
            margin-bottom: 28px;
          }

          .cleanup-section-title {
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            color: #999;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
          }

          .cleanup-checklist {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .cleanup-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: #f9f9f9;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
          }

          .cleanup-item:hover {
            background: #f0f0f0;
          }

          .cleanup-item input {
            cursor: pointer;
            width: 18px;
            height: 18px;
          }

          .cleanup-item-label {
            flex: 1;
            cursor: pointer;
          }

          .cleanup-item-title {
            font-weight: 500;
            color: #333;
            margin-bottom: 2px;
          }

          .cleanup-item-desc {
            font-size: 12px;
            color: #999;
          }

          .cleanup-buttons {
            display: flex;
            gap: 12px;
            margin-top: 28px;
          }

          .cleanup-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }

          .cleanup-btn-preview {
            flex: 1;
            background: #2196F3;
            color: white;
          }

          .cleanup-btn-preview:hover:not(:disabled) {
            background: #0b7dda;
          }

          .cleanup-btn-execute {
            flex: 1;
            background: #f44336;
            color: white;
          }

          .cleanup-btn-execute:hover:not(:disabled) {
            background: #d32f2f;
          }

          .cleanup-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .cleanup-preview {
            background: #e3f2fd;
            border: 1px solid #90caf9;
            border-radius: 8px;
            padding: 20px;
            margin-top: 24px;
          }

          .cleanup-preview-title {
            font-weight: 600;
            color: #1565c0;
            margin-bottom: 16px;
            font-size: 14px;
          }

          .cleanup-preview-item {
            padding: 12px 0;
            border-bottom: 1px solid #bbdefb;
            font-size: 13px;
          }

          .cleanup-preview-item:last-child {
            border-bottom: none;
          }

          .cleanup-preview-label {
            color: #0d47a1;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .cleanup-preview-count {
            color: #1565c0;
            font-size: 18px;
            font-weight: 700;
          }

          .cleanup-result {
            background: #e8f5e9;
            border: 1px solid #4caf50;
            border-radius: 8px;
            padding: 20px;
            margin-top: 24px;
          }

          .cleanup-result-title {
            font-weight: 600;
            color: #2e7d32;
            margin-bottom: 16px;
            font-size: 14px;
          }

          .cleanup-result-item {
            padding: 12px 0;
            border-bottom: 1px solid #c8e6c9;
            display: flex;
            justify-content: space-between;
            font-size: 13px;
          }

          .cleanup-result-item:last-child {
            border-bottom: none;
          }

          .cleanup-result-label {
            color: #1b5e20;
            font-weight: 500;
          }

          .cleanup-result-status {
            color: #2e7d32;
            font-weight: 600;
          }

          .cleanup-error {
            background: #ffebee;
            border: 1px solid #f44336;
            border-radius: 8px;
            padding: 16px;
            margin-top: 24px;
            color: #c62828;
            font-size: 13px;
          }

          .cleanup-timestamp {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #c8e6c9;
            font-size: 11px;
            color: #558b2f;
          }
        `}</style>

        <div className="cleanup-container">
          <div className="cleanup-warning">
            <strong>⚠️ Warning:</strong> This tool deletes test data permanently. Make sure you're not deleting live production data. This action cannot be undone.
          </div>

          <div className="cleanup-card">
            <div className="cleanup-section">
              <div className="cleanup-section-title">Select Data to Clear</div>
              
              <div className="cleanup-checklist">
                <label className="cleanup-item">
                  <input
                    type="checkbox"
                    checked={selected.orders}
                    onChange={(e) => setSelected({ ...selected, orders: e.target.checked })}
                  />
                  <div className="cleanup-item-label">
                    <div className="cleanup-item-title">WhatsApp Orders</div>
                    <div className="cleanup-item-desc">All checkout orders via WhatsApp</div>
                  </div>
                </label>

                <label className="cleanup-item">
                  <input
                    type="checkbox"
                    checked={selected.custom}
                    onChange={(e) => setSelected({ ...selected, custom: e.target.checked })}
                  />
                  <div className="cleanup-item-label">
                    <div className="cleanup-item-title">Custom Orders</div>
                    <div className="cleanup-item-desc">All custom design requests and tracking</div>
                  </div>
                </label>

                <label className="cleanup-item">
                  <input
                    type="checkbox"
                    checked={selected.customers}
                    onChange={(e) => setSelected({ ...selected, customers: e.target.checked })}
                  />
                  <div className="cleanup-item-label">
                    <div className="cleanup-item-title">Customers</div>
                    <div className="cleanup-item-desc">All customer records (auto-synced and manual)</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="cleanup-buttons">
              <button
                className="cleanup-btn cleanup-btn-preview"
                onClick={handlePreview}
                disabled={loading || selectedCount === 0}
              >
                {loading ? "Loading..." : "👁️ Preview"}
              </button>
              <button
                className="cleanup-btn cleanup-btn-execute"
                onClick={handleExecute}
                disabled={loading || selectedCount === 0}
              >
                {loading ? "Processing..." : "🗑️ Clear Data"}
              </button>
            </div>
          </div>

          {error && (
            <div className="cleanup-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {preview && (
            <div className="cleanup-preview">
              <div className="cleanup-preview-title">
                ✓ Preview: {preview.totalItems} item(s) will be deleted
              </div>
              {preview.stats.waOrders && (
                <div className="cleanup-preview-item">
                  <div className="cleanup-preview-label">WhatsApp Orders</div>
                  <div className="cleanup-preview-count">{preview.stats.waOrders.count}</div>
                  <div className="cleanup-item-desc">{preview.stats.waOrders.summary}</div>
                </div>
              )}
              {preview.stats.customOrders && (
                <div className="cleanup-preview-item">
                  <div className="cleanup-preview-label">Custom Orders</div>
                  <div className="cleanup-preview-count">{preview.stats.customOrders.count}</div>
                  <div className="cleanup-item-desc">{preview.stats.customOrders.summary}</div>
                </div>
              )}
              {preview.stats.customers && (
                <div className="cleanup-preview-item">
                  <div className="cleanup-preview-label">Customers</div>
                  <div className="cleanup-preview-count">{preview.stats.customers.count}</div>
                  <div className="cleanup-item-desc">{preview.stats.customers.summary}</div>
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="cleanup-result">
              <div className="cleanup-result-title">
                ✓ Cleanup completed successfully
              </div>
              {result.results.waOrders.success && (
                <div className="cleanup-result-item">
                  <span className="cleanup-result-label">WhatsApp Orders</span>
                  <span className="cleanup-result-status">Cleared</span>
                </div>
              )}
              {result.results.customOrders.success && (
                <div className="cleanup-result-item">
                  <span className="cleanup-result-label">Custom Orders</span>
                  <span className="cleanup-result-status">Cleared</span>
                </div>
              )}
              {result.results.customers.success && (
                <div className="cleanup-result-item">
                  <span className="cleanup-result-label">Customers</span>
                  <span className="cleanup-result-status">Cleared</span>
                </div>
              )}
              <div className="cleanup-timestamp">
                Completed at {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
