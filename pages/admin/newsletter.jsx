import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

const DEFAULT_SUBSCRIBERS = [
  { id: "sub_1", email: "john@example.com", name: "John Doe", status: "active", joinedAt: "2024-01-15", campaigns: 5 },
  { id: "sub_2", email: "jane@example.com", name: "Jane Smith", status: "active", joinedAt: "2024-02-20", campaigns: 3 },
  { id: "sub_3", email: "bob@example.com", name: "Bob Wilson", status: "unsubscribed", joinedAt: "2023-11-10", campaigns: 12 },
];

const CAMPAIGN_TEMPLATES = [
  { id: "new_collection", name: "New Collection Launch", subject: "🌟 New Arrivals: Fresh Beadwork Collection" },
  { id: "discount", name: "Special Offer", subject: "🎁 Special Discount Just for You!" },
  { id: "event", name: "Event/Newsletter", subject: "Upcoming Events & Stories" },
];

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState(DEFAULT_SUBSCRIBERS);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ to: "all", subject: "", body: "", template: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const activeCount = subscribers.filter(s => s.status === "active").length;

  function handleTemplateSelect(templateId) {
    const tmpl = CAMPAIGN_TEMPLATES.find(t => t.id === templateId);
    if (tmpl) setForm(f => ({ ...f, template: templateId, subject: tmpl.subject }));
  }

  async function handleSend(e) {
    e.preventDefault();
    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setShowCompose(false);
    setForm({ to: "all", subject: "", body: "", template: "" });
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <AdminLayout title="Email / Newsletter Manager">
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Subscribers</p>
          <p className="admin-stat-value">{subscribers.length}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Active</p>
          <p className="admin-stat-value">{activeCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Unsubscribed</p>
          <p className="admin-stat-value">{subscribers.filter(s => s.status === "unsubscribed").length}</p>
        </div>
      </div>

      <div className="admin-section">
        <h3>Quick Actions</h3>
        <div className="admin-action-grid">
          <button className="admin-action-card" onClick={() => setShowCompose(true)}>
            <span className="admin-action-icon">✉️</span>
            <span>Compose Campaign</span>
          </button>
          <button className="admin-action-card">
            <span className="admin-action-icon">📋</span>
            <span>View Templates</span>
          </button>
          <button className="admin-action-card">
            <span className="admin-action-icon">📊</span>
            <span>Campaign History</span>
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h3>Recent Subscribers</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th>Campaigns</th></tr></thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td><span className={`admin-pill ${s.status === "active" ? "admin-pill--success" : "admin-pill--muted"}`}>{s.status}</span></td>
                  <td>{s.joinedAt}</td>
                  <td>{s.campaigns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCompose && (
        <div className="admin-modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="admin-modal admin-modal--wide" onClick={e => e.stopPropagation()}>
            <h3>Compose Campaign</h3>
            <form onSubmit={handleSend}>
              <div className="admin-form-group">
                <label>Recipients</label>
                <select value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}>
                  <option value="all">All Subscribers ({activeCount})</option>
                  <option value="active">Active Only</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>Template</label>
                <select value={form.template} onChange={e => handleTemplateSelect(e.target.value)}>
                  <option value="">Select template...</option>
                  {CAMPAIGN_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Subject Line</label>
                <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required placeholder="Enter subject..." />
              </div>
              <div className="admin-form-group">
                <label>Message</label>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={8} placeholder="Write your message..." />
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn" onClick={() => setShowCompose(false)}>Cancel</button>
                <button type="submit" className="admin-button" disabled={sending}>{sending ? "Sending..." : "Send Campaign"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sent && <div className="admin-toast">Campaign sent successfully!</div>}
    </AdminLayout>
  );
}