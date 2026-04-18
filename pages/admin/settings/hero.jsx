import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import LocalImageUpload from "../../../components/admin/LocalImageUpload";

export default function HeroSettingsPage() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch("/api/admin/site-images", { credentials: "same-origin" });
      if (!response.ok) return;
      const data = await response.json();
      if (!cancelled) {
        setForm({
          heroTitle: data.heroTitle || "",
          heroSubtitle: data.heroSubtitle || "",
          heroImage: data.heroImage || "",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!form) return;

    setSaving(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/admin/site-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body?.error || "Could not save hero settings.");
      return;
    }

    const data = await response.json();
    if (data.siteImages) {
      setForm({
        heroTitle: data.siteImages.heroTitle || "",
        heroSubtitle: data.siteImages.heroSubtitle || "",
        heroImage: data.siteImages.heroImage || "",
      });
    }
    setMessage("Hero settings saved.");
  }

  return (
    <AdminLayout title="Homepage Banner">
      {!form ? (
        <p className="admin-note">Loading hero settings...</p>
      ) : (
        <form className="admin-form-card" onSubmit={handleSave}>
          <label className="admin-field">
            <span>Hero title</span>
            <input
              className="admin-input"
              value={form.heroTitle}
              onChange={(event) => setField("heroTitle", event.target.value)}
              placeholder="Handmade Kenyan jewellery and home decor"
            />
          </label>

          <label className="admin-field">
            <span>Hero subtitle</span>
            <input
              className="admin-input"
              value={form.heroSubtitle}
              onChange={(event) => setField("heroSubtitle", event.target.value)}
              placeholder="Every piece tells a story."
            />
          </label>

          <label className="admin-field">
            <span>Hero image path</span>
            <input
              className="admin-input"
              value={form.heroImage}
              onChange={(event) => setField("heroImage", event.target.value)}
              placeholder="/media/site/homepage/..."
            />
          </label>

          <LocalImageUpload
            label="Upload hero image"
            folder="site/homepage"
            onUploaded={(path) => setField("heroImage", path)}
          />

          {form.heroImage ? (
            <img
              src={form.heroImage}
              alt="Hero preview"
              style={{ marginTop: 8, maxHeight: 120, width: "100%", objectFit: "cover", borderRadius: 8 }}
              onError={(event) => {
                event.target.style.display = "none";
              }}
            />
          ) : null}

          <div className="admin-quick-actions" style={{ marginTop: "var(--space-4)" }}>
            <button className="admin-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save hero settings"}
            </button>
          </div>

          {message ? <p className="saved-indicator">{message}</p> : null}
          {error ? <p className="admin-form-error">{error}</p> : null}
        </form>
      )}
    </AdminLayout>
  );
}
