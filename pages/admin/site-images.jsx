import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import LocalImageUpload from "../../components/admin/LocalImageUpload";

const IMAGE_FIELDS = [
  { key: "heroImage", label: "Hero banner photo (top of homepage)" },
  { key: "artisanPortrait", label: "Artisan photo (beside quote / about section)" },
  { key: "collectionJewellery", label: "Collection card — Jewellery" },
  { key: "collectionHome", label: "Collection card — Home decor" },
  { key: "collectionAccessories", label: "Collection card — Gifted carry" },
  { key: "pageTexture", label: "Page background texture (SVG or small tile)" },
];

const TEXT_FIELDS = [
  { key: "heroTitle", label: "Hero title", type: "input", placeholder: "Handmade Kenyan jewellery & home decor" },
  { key: "heroSubtitle", label: "Hero subtitle / tagline", type: "input", placeholder: "Every piece tells a story." },
  { key: "artisanBio", label: "Artisan bio (short, shown on homepage)", type: "textarea", placeholder: "Sharon is a Kenyan artisan…" },
  { key: "aboutStory", label: "About / origin story", type: "textarea", placeholder: "SharonCraft was born from…" },
  { key: "deliveryNote", label: "Delivery note", type: "input", placeholder: "We deliver across Kenya. Standard delivery KES 300." },
  { key: "businessHours", label: "Business hours", type: "input", placeholder: "Mon–Sat, 9am–6pm EAT" },
  { key: "contactWhatsApp", label: "WhatsApp contact number (digits only, e.g. 0712345678)", type: "input", placeholder: "0112222572" },
  { key: "contactEmail", label: "Contact email (optional)", type: "input", placeholder: "hello@sharoncraft.co.ke" },
];

export default function AdminSiteImagesPage() {
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
      if (!cancelled) setForm(data);
    })();
    return () => { cancelled = true; };
  }, []);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event) {
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
      setError(body.error || "Could not save. Try again.");
      return;
    }
    const data = await response.json();
    if (data.siteImages) setForm(data.siteImages);
    setMessage("✅ Saved! Refresh the storefront to see changes.");
  }

  return (
    <>
      <Head>
        <title>Site Content — Gallery Admin</title>
      </Head>
      <AdminLayout
        title="Site Content"
        action={
          <Link href="/" className="admin-button admin-button--secondary" target="_blank">
            View site
          </Link>
        }
      >
        {!form ? <p className="admin-note">Loading…</p> : (
          <form className="admin-form-card" onSubmit={onSubmit}>

            {/* ── Photos section ── */}
            <section>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "var(--space-3)" }}>📸 Photos</h2>
              {IMAGE_FIELDS.map((field) => (
                <div key={field.key} className="admin-panel" style={{ padding: "var(--space-4)", marginBottom: "var(--space-3)" }}>
                  <label className="admin-field">
                    <span className="admin-note">{field.label}</span>
                    <input
                      className="admin-input"
                      value={form[field.key] || ""}
                      onChange={(e) => set(field.key, e.target.value)}
                      placeholder="/media/site/…"
                    />
                  </label>
                  {form[field.key] && (
                    <img
                      src={form[field.key]}
                      alt=""
                      style={{ marginTop: 8, maxHeight: 80, maxWidth: 200, objectFit: "cover", borderRadius: 6 }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                  <LocalImageUpload
                    label="Upload from device"
                    onUploaded={(path) => set(field.key, path)}
                  />
                </div>
              ))}
            </section>

            {/* ── Text content section ── */}
            <section style={{ marginTop: "var(--space-5)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "var(--space-3)" }}>✏️ Text Content</h2>
              {TEXT_FIELDS.map((field) => (
                <label key={field.key} className="admin-field" style={{ marginBottom: "var(--space-4)" }}>
                  <span>{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      className="admin-textarea"
                      value={form[field.key] || ""}
                      onChange={(e) => set(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : (
                    <input
                      className="admin-input"
                      value={form[field.key] || ""}
                      onChange={(e) => set(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </label>
              ))}
            </section>

            <div className="admin-quick-actions" style={{ marginTop: "var(--space-4)" }}>
              <button type="submit" className="admin-button" disabled={saving}>
                {saving ? "Saving…" : "Save all changes"}
              </button>
            </div>

            {message && <p className="saved-indicator" style={{ marginTop: "var(--space-3)", color: "#16a34a" }}>{message}</p>}
            {error && <p className="admin-form-error" style={{ marginTop: "var(--space-3)" }}>{error}</p>}
          </form>
        )}
      </AdminLayout>
    </>
  );
}
