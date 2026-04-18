import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatShortDate } from "../../lib/formatters";

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [exportMessage, setExportMessage] = useState("");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/newsletter-subscribers", {
        credentials: "same-origin",
      });
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.error("Failed to load subscribers:", err);
    }
    setLoading(false);
  }

  async function handleDelete(email) {
    if (!confirm(`Remove ${email} from subscribers?`)) return;

    try {
      const response = await fetch("/api/admin/newsletter-subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setDeleteMessage(`Removed ${email}`);
        setSubscribers(subscribers.filter((s) => s.email !== email));
        setTimeout(() => setDeleteMessage(""), 3000);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  async function handleExport() {
    try {
      const csv = [["Email", "Subscribed Date", "Status"]].concat(
        subscribers.map((s) => [
          s.email,
          new Date(s.subscribed_at).toLocaleDateString("en-KE"),
          s.status,
        ])
      );

      const csvContent =
        csv.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();

      setExportMessage("✓ Exported successfully");
      setTimeout(() => setExportMessage(""), 3000);
    } catch (err) {
      console.error("Export error:", err);
    }
  }

  return (
    <AdminLayout
      title="Newsletter Subscribers"
      action={
        <button className="admin-button" onClick={handleExport}>
          📥 Export CSV
        </button>
      }
    >
      <section className="admin-section">
        <div className="admin-card">
          <div className="admin-stats-row">
            <div className="admin-stat">
              <span className="admin-stat-label">Total Subscribers</span>
              <span className="admin-stat-value">{subscribers.length}</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-label">Active</span>
              <span className="admin-stat-value">
                {subscribers.filter((s) => s.status === "active").length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {exportMessage && <p className="admin-success-msg">{exportMessage}</p>}
      {deleteMessage && <p className="admin-success-msg">{deleteMessage}</p>}

      <section className="admin-section">
        {loading ? (
          <p className="admin-note">Loading subscribers...</p>
        ) : subscribers.length === 0 ? (
          <p className="admin-note">No subscribers yet.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subscribed</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.email}>
                    <td className="admin-table-email">{subscriber.email}</td>
                    <td className="admin-table-date">
                      {formatShortDate(subscriber.subscribed_at)}
                    </td>
                    <td>
                      <span className="admin-badge admin-badge--success">
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="admin-table-actions">
                      <button
                        className="admin-link-btn"
                        onClick={() => handleDelete(subscriber.email)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style jsx>{`
        .admin-section {
          margin-bottom: var(--space-6);
        }

        .admin-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: var(--space-4);
        }

        .admin-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
        }

        .admin-stat {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .admin-stat-label {
          font-size: 0.875rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .admin-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-ink);
        }

        .admin-success-msg,
        .admin-error-msg {
          padding: var(--space-3) var(--space-4);
          border-radius: 6px;
          margin-bottom: var(--space-4);
          font-size: 0.9375rem;
        }

        .admin-success-msg {
          background: rgba(76, 175, 80, 0.1);
          color: #2e7d32;
          border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .admin-error-msg {
          background: rgba(211, 47, 47, 0.1);
          color: #c62828;
          border: 1px solid rgba(211, 47, 47, 0.3);
        }

        .admin-note {
          padding: var(--space-4);
          background: #fafafa;
          border-radius: 6px;
          color: #666;
          font-size: 0.9375rem;
        }

        .admin-table-wrapper {
          overflow-x: auto;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 6px;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .admin-table thead {
          background: #f5f5f5;
          border-bottom: 2px solid rgba(0, 0, 0, 0.1);
        }

        .admin-table th {
          padding: var(--space-3) var(--space-4);
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-table td {
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 0.9375rem;
        }

        .admin-table tbody tr:hover {
          background: #fafafa;
        }

        .admin-table-email {
          color: #333;
          font-weight: 500;
        }

        .admin-table-date {
          color: #666;
          font-size: 0.875rem;
        }

        .admin-table-actions {
          text-align: right;
        }

        .admin-link-btn {
          background: none;
          border: none;
          color: #d32f2f;
          cursor: pointer;
          font-size: 0.875rem;
          text-decoration: underline;
          padding: 0;
          transition: color 0.2s;
        }

        .admin-link-btn:hover {
          color: #c62828;
        }

        .admin-badge {
          display: inline-block;
          padding: 0.35rem var(--space-2);
          border-radius: 3px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-badge--success {
          background: rgba(76, 175, 80, 0.15);
          color: #2e7d32;
        }
      `}</style>
    </AdminLayout>
  );
}
