import { useState } from "react";
import { isAuthorizedRequest } from "../../lib/admin-auth";
import AdminLayout from "../../components/admin/AdminLayout";
import SeoHead from "../../components/SeoHead";

export async function getServerSideProps(context) {
  const authorized = isAuthorizedRequest(context.req);
  if (!authorized) {
    return {
      redirect: { destination: "/admin", permanent: false },
    };
  }
  return { props: {} };
}

export default function SyncOrdersPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSync() {
    setSyncing(true);
    setError("");
    setSyncResult(null);

    try {
      const response = await fetch("/api/admin/sync-orders-to-customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      const data = await response.json();
      setSyncResult(data);
    } catch (err) {
      setError(err.message || "Failed to sync orders");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <>
      <SeoHead
        title="Sync Orders | SharonCraft Admin"
        description="Sync customer orders from checkout and custom requests"
        path="/admin/sync-orders"
      />
      <AdminLayout title="Sync Orders to Customers">
        <div className="sync-panel">
          <style>{`
            .sync-panel {
              max-width: 600px;
              margin: 0 auto;
            }

            .sync-card {
              background: white;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 24px;
              margin-bottom: 24px;
            }

            .sync-card h2 {
              font-size: 18px;
              font-weight: 600;
              margin: 0 0 12px 0;
              color: #333;
            }

            .sync-description {
              color: #666;
              line-height: 1.6;
              margin-bottom: 20px;
              font-size: 14px;
            }

            .sync-benefits {
              background: #f9f9f9;
              border-left: 3px solid #C04D29;
              padding: 12px;
              border-radius: 4px;
              margin-bottom: 20px;
              font-size: 13px;
              line-height: 1.6;
              color: #555;
            }

            .sync-benefits ul {
              margin: 0;
              padding-left: 20px;
            }

            .sync-benefits li {
              margin: 6px 0;
            }

            .sync-button {
              background: #C04D29;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.3s;
              width: 100%;
            }

            .sync-button:hover:not(:disabled) {
              background: #a63e20;
            }

            .sync-button:disabled {
              background: #ccc;
              cursor: not-allowed;
            }

            .sync-result {
              background: #e8f5e9;
              border: 1px solid #4caf50;
              border-radius: 6px;
              padding: 16px;
              margin-top: 20px;
            }

            .sync-result h3 {
              margin: 0 0 12px 0;
              color: #2e7d32;
              font-size: 14px;
            }

            .sync-result-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #c8e6c9;
              font-size: 13px;
            }

            .sync-result-item:last-child {
              border-bottom: none;
            }

            .sync-result-label {
              color: #555;
              font-weight: 500;
            }

            .sync-result-value {
              color: #2e7d32;
              font-weight: 600;
            }

            .sync-error {
              background: #ffebee;
              border: 1px solid #f44336;
              border-radius: 6px;
              padding: 16px;
              margin-top: 20px;
              color: #c62828;
              font-size: 13px;
            }

            .sync-info {
              background: #e3f2fd;
              border: 1px solid #2196f3;
              border-radius: 6px;
              padding: 16px;
              margin-top: 20px;
              font-size: 13px;
              color: #1565c0;
              line-height: 1.6;
            }

            .sync-info strong {
              color: #0d47a1;
            }

            .loading-spinner {
              display: inline-block;
              width: 16px;
              height: 16px;
              border: 2px solid #ccc;
              border-top-color: #C04D29;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin-right: 8px;
              vertical-align: middle;
            }

            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>

          {/* Main Card */}
          <div className="sync-card">
            <h2>Sync Orders to Customer Database</h2>
            <p className="sync-description">
              This tool automatically creates customer records from your checkout and custom order submissions. 
              Each customer's profile will include their complete order history and spending summary.
            </p>

            <div className="sync-benefits">
              <strong>What this does:</strong>
              <ul>
                <li>Creates customer records from cart orders and custom design requests</li>
                <li>Links phone numbers to match returning customers</li>
                <li>Tracks total orders, spending, and order types per customer</li>
                <li>Tags customers as "Custom Requester" or "Shop Buyer" for follow-up</li>
                <li>Updates existing customer records with latest order data</li>
              </ul>
            </div>

            <button
              className="sync-button"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <span className="loading-spinner"></span>
                  Syncing...
                </>
              ) : (
                "Run Sync Now"
              )}
            </button>
          </div>

          {/* Results */}
          {syncResult && (
            <div className="sync-result">
              <h3>Sync Complete</h3>
              <div className="sync-result-item">
                <span className="sync-result-label">Customers Processed:</span>
                <span className="sync-result-value">{syncResult.customersProcessed}</span>
              </div>
              <div className="sync-result-item">
                <span className="sync-result-label">New Customers Created:</span>
                <span className="sync-result-value">{syncResult.customersCreated}</span>
              </div>
              <div className="sync-result-item">
                <span className="sync-result-label">Existing Customers Updated:</span>
                <span className="sync-result-value">{syncResult.customersUpdated}</span>
              </div>
              <div className="sync-result-item" style={{ borderBottom: "none", paddingTop: "12px", marginTop: "12px", borderTop: "1px solid #c8e6c9" }}>
                <span className="sync-result-label">Total Customers in System:</span>
                <span className="sync-result-value">{syncResult.summary.totalCustomersInSystem}</span>
              </div>
              <div className="sync-result-item">
                <span className="sync-result-label">Total Orders Tracked:</span>
                <span className="sync-result-value">{syncResult.summary.totalOrders}</span>
              </div>
              <div className="sync-result-item">
                <span className="sync-result-label">Total Customer Spending:</span>
                <span className="sync-result-value">KES {syncResult.summary.totalSpent.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="sync-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Info */}
          <div className="sync-info">
            <strong>How to use this:</strong>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
              <li>Run this sync after you receive new custom order or checkout orders</li>
              <li>You can run it manually anytime - it's safe to run multiple times</li>
              <li>View synced customers in <strong>Admin → Customers</strong></li>
              <li>Each customer card shows their order history and spending</li>
              <li>Use customer tags to filter and organize for follow-up</li>
            </ul>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
