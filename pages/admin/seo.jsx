import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchSeoSettings() {
  const res = await fetch("/api/admin/seo");
  if (!res.ok) throw new Error("Failed to load SEO settings");
  return res.json();
}

async function saveSeoSettings(settings) {
  const res = await fetch("/api/admin/seo", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to save SEO settings");
  return res.json();
}

export default function SeoToolsPage() {
  const queryClient = useQueryClient();
  const { data: seo, isLoading } = useQuery({ queryKey: ["seo"], queryFn: fetchSeoSettings });
  const [form, setForm] = useState({ metaTitle: "", metaDescription: "", keywords: "", sitemapPriority: "0.8", robotsDirectives: "index,follow" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Initialize form when data loads
  useState(() => {
    if (seo) setForm({ metaTitle: seo.metaTitle || "", metaDescription: seo.metaDescription || "", keywords: (seo.keywords || []).join(", "), sitemapPriority: seo.sitemapPriority || "0.8", robotsDirectives: seo.robotsDirectives || "index,follow" });
  }, [seo]);

  const saveMutation = useMutation({ mutationFn: saveSeoSettings, onSuccess: () => { setMessage("SEO settings saved!"); queryClient.invalidateQueries(["seo"]); setTimeout(() => setMessage(""), 3000); } });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const keywords = form.keywords.split(",").map(k => k.trim()).filter(Boolean);
      await saveMutation.mutateAsync({ ...form, keywords });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <AdminLayout title="SEO Tools"><p className="admin-note">Loading...</p></AdminLayout>;

  return (
    <AdminLayout title="SEO Tools">
      <div className="admin-section">
        <h3>Meta Tags</h3>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>Page Title</label>
            <input type="text" value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} placeholder="SharonCraft - Handmade Kenyan Beadwork" />
            <p className="admin-hint">Recommended: 50-60 characters</p>
          </div>
          <div className="admin-form-group">
            <label>Meta Description</label>
            <textarea value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} rows={3} placeholder="Authentic Kenyan beadwork, Maasai jewelry, and handmade African gifts..." />
            <p className="admin-hint">Recommended: 150-160 characters</p>
          </div>
          <div className="admin-form-group">
            <label>Keywords (comma separated)</label>
            <input type="text" value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} placeholder="kenyan jewelry, maasai beads, handmade gifts" />
          </div>
        </form>
      </div>

      <div className="admin-section">
        <h3>Sitemap Settings</h3>
        <div className="admin-form-group">
          <label>Priority</label>
          <select value={form.sitemapPriority} onChange={e => setForm(f => ({ ...f, sitemapPriority: e.target.value }))}>
            <option value="1.0">1.0 - Highest</option>
            <option value="0.9">0.9</option>
            <option value="0.8">0.8 - Default</option>
            <option value="0.7">0.7</option>
            <option value="0.6">0.6</option>
            <option value="0.5">0.5 - Lowest</option>
          </select>
        </div>
        <div className="admin-form-group">
          <label>Robots Directives</label>
          <select value={form.robotsDirectives} onChange={e => setForm(f => ({ ...f, robotsDirectives: e.target.value }))}>
            <option value="index,follow">Index & Follow</option>
            <option value="index,nofollow">Index & No Follow</option>
            <option value="noindex,follow">No Index & Follow</option>
            <option value="noindex,nofollow">No Index & No Follow</option>
          </select>
        </div>
      </div>

      <div className="admin-section">
        <h3>Preview</h3>
        <div className="admin-seo-preview">
          <p className="admin-seo-preview__title">{form.metaTitle || "Page Title"}</p>
          <p className="admin-seo-preview__url">sharoncraft.co.ke</p>
          <p className="admin-seo-preview__desc">{form.metaDescription || "Meta description will appear here..."}</p>
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="admin-button" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Save SEO Settings"}</button>
      </div>
      {message && <div className="admin-toast">{message}</div>}
    </AdminLayout>
  );
}