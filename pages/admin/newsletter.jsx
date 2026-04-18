import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../components/admin/AdminLayout";

const DEFAULT_SUBSCRIBERS = [
  { id: "sub_1", email: "john@example.com", name: "John Doe", status: "active", joinedAt: "2024-01-15", campaigns: 5 },
  { id: "sub_2", email: "jane@example.com", name: "Jane Smith", status: "active", joinedAt: "2024-02-20", campaigns: 3 },
  { id: "sub_3", email: "bob@example.com", name: "Bob Wilson", status: "unsubscribed", joinedAt: "2023-11-10", campaigns: 12 },
];

const CAMPAIGN_TEMPLATES = [
  { id: "new_collection", name: "New Collection Launch", subject: "New Arrivals: Fresh Beadwork Collection" },
  { id: "discount", name: "Special Offer", subject: "Special Discount Just for You" },
  { id: "event", name: "Event/Newsletter", subject: "Upcoming Events & Stories" },
];

async function fetchNewsletterWorkspace() {
  const response = await fetch("/api/admin/newsletter", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Could not load newsletter workspace");
  const data = await response.json();
  return {
    subscribers: Array.isArray(data?.subscribers) && data.subscribers.length > 0 ? data.subscribers : DEFAULT_SUBSCRIBERS,
    campaigns: Array.isArray(data?.campaigns) ? data.campaigns : [],
  };
}

export default function NewsletterPage() {
  const [showCompose, setShowCompose] = useState(false);
  const [showAddSubscriber, setShowAddSubscriber] = useState(false);
  const [form, setForm] = useState({ to: "all", subject: "", body: "", template: "" });
  const [subscriberForm, setSubscriberForm] = useState({ name: "", email: "", status: "active" });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: fetchNewsletterWorkspace,
  });

  const subscribers = data?.subscribers || [];
  const campaigns = data?.campaigns || [];
  const activeCount = subscribers.filter((subscriber) => subscriber.status === "active").length;

  const recentCampaigns = useMemo(() => {
    return campaigns
      .slice()
      .sort((left, right) => new Date(right.sentAt || right.updatedAt || 0) - new Date(left.sentAt || left.updatedAt || 0))
      .slice(0, 8);
  }, [campaigns]);

  function handleTemplateSelect(templateId) {
    const tmpl = CAMPAIGN_TEMPLATES.find((template) => template.id === templateId);
    if (tmpl) setForm((current) => ({ ...current, template: templateId, subject: tmpl.subject }));
  }

  async function saveSubscriber(subscriber) {
    const response = await fetch("/api/admin/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ section: "subscribers", item: subscriber }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error || "Could not save subscriber");
    }
  }

  async function addSubscriber(event) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setError("");
    try {
      await saveSubscriber(subscriberForm);
      setSubscriberForm({ name: "", email: "", status: "active" });
      setShowAddSubscriber(false);
      await refetch();
      setMessage("Subscriber added.");
    } catch (err) {
      setError(String(err?.message || "Could not add subscriber"));
    } finally {
      setSending(false);
    }
  }

  async function handleSend(event) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          section: "campaigns",
          item: {
            to: form.to,
            template: form.template,
            subject: form.subject,
            body: form.body,
            status: "sent",
            sentAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Could not save campaign");
      }

      setShowCompose(false);
      setForm({ to: "all", subject: "", body: "", template: "" });
      await refetch();
      setMessage("Campaign recorded as sent.");
    } catch (err) {
      setError(String(err?.message || "Could not save campaign"));
    } finally {
      setSending(false);
    }
  }

  async function toggleSubscriberStatus(subscriber) {
    setSending(true);
    setMessage("");
    setError("");
    try {
      await saveSubscriber({ ...subscriber, status: subscriber.status === "active" ? "unsubscribed" : "active" });
      await refetch();
      setMessage("Subscriber status updated.");
    } catch (err) {
      setError(String(err?.message || "Could not update subscriber"));
    } finally {
      setSending(false);
    }
  }

  async function removeCampaign(id) {
    if (!confirm("Delete this campaign record?")) return;
    setSending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/admin/newsletter?section=campaigns&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Could not delete campaign");
      }
      await refetch();
      setMessage("Campaign record deleted.");
    } catch (err) {
      setError(String(err?.message || "Could not delete campaign"));
    } finally {
      setSending(false);
    }
  }

  return (
    <AdminLayout title="Email / Newsletter Manager">
      {message ? <p className="saved-indicator">{message}</p> : null}
      {error ? <p className="admin-form-error">{error}</p> : null}

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
          <p className="admin-stat-label">Campaigns Sent</p>
          <p className="admin-stat-value">{campaigns.length}</p>
        </div>
      </div>

      <div className="admin-section">
        <h3>Quick Actions</h3>
        <div className="admin-action-grid">
          <button className="admin-action-card" onClick={() => setShowCompose(true)}>
            <span className="admin-action-icon">Send</span>
            <span>Compose Campaign</span>
          </button>
          <button className="admin-action-card" onClick={() => setShowAddSubscriber(true)}>
            <span className="admin-action-icon">Add</span>
            <span>Add Subscriber</span>
          </button>
          <button className="admin-action-card" onClick={() => refetch()}>
            <span className="admin-action-icon">Sync</span>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h3>Subscribers</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th>Campaigns</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6} className="admin-empty">Loading...</td></tr> : null}
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td>{subscriber.name || "-"}</td>
                  <td>{subscriber.email}</td>
                  <td><span className={`admin-pill ${subscriber.status === "active" ? "admin-pill--success" : "admin-pill--muted"}`}>{subscriber.status}</span></td>
                  <td>{subscriber.joinedAt}</td>
                  <td>{subscriber.campaigns || 0}</td>
                  <td>
                    <button className="admin-btn admin-btn--small" onClick={() => toggleSubscriberStatus(subscriber)} disabled={sending}>
                      {subscriber.status === "active" ? "Unsubscribe" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <h3>Campaign History</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Sent</th><th>Audience</th><th>Subject</th><th>Template</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {recentCampaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>{new Date(campaign.sentAt || campaign.updatedAt).toLocaleString("en-KE")}</td>
                  <td>{campaign.to}</td>
                  <td>{campaign.subject || "-"}</td>
                  <td>{campaign.template || "custom"}</td>
                  <td><span className="admin-pill admin-pill--success">{campaign.status || "sent"}</span></td>
                  <td><button className="admin-btn admin-btn--small" onClick={() => removeCampaign(campaign.id)} disabled={sending}>Delete</button></td>
                </tr>
              ))}
              {recentCampaigns.length === 0 ? <tr><td colSpan={6} className="admin-empty">No campaigns yet</td></tr> : null}
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
                  {CAMPAIGN_TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
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
                <button type="submit" className="admin-button" disabled={sending}>{sending ? "Saving..." : "Record Campaign"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddSubscriber && (
        <div className="admin-modal-overlay" onClick={() => setShowAddSubscriber(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Add Subscriber</h3>
            <form onSubmit={addSubscriber}>
              <div className="admin-form-group">
                <label>Name</label>
                <input type="text" value={subscriberForm.name} onChange={(event) => setSubscriberForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input type="email" value={subscriberForm.email} onChange={(event) => setSubscriberForm((current) => ({ ...current, email: event.target.value }))} required />
              </div>
              <div className="admin-form-group">
                <label>Status</label>
                <select value={subscriberForm.status} onChange={(event) => setSubscriberForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="active">Active</option>
                  <option value="unsubscribed">Unsubscribed</option>
                </select>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn" onClick={() => setShowAddSubscriber(false)}>Cancel</button>
                <button type="submit" className="admin-button" disabled={sending}>{sending ? "Saving..." : "Add Subscriber"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
