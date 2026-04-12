import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import LocalImageUpload from "../../components/admin/LocalImageUpload";

const fields = [
  { key: "heroImage", label: "Hero (top banner)" },
  { key: "artisanPortrait", label: "Artisan story (photo beside quote)" },
  { key: "collectionJewellery", label: "Collection card — Jewellery" },
  { key: "collectionHome", label: "Collection card — Home objects" },
  { key: "collectionAccessories", label: "Collection card — Gifted carry" },
  { key: "pageTexture", label: "Page background texture (SVG or small tile)" },
];

export default function AdminSiteImagesPage() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch("/api/admin/site-images", { credentials: "same-origin" });
      if (!response.ok) return;
      const data = await response.json();
      if (!cancelled) setForm(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/site-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!response.ok) {
      setMessage("Could not save. Try again.");
      return;
    }
    const data = await response.json();
    if (data.siteImages) setForm(data.siteImages);
    setMessage("Saved. Refresh the storefront to see hero, collections, and artisan photo. Do a full refresh (Ctrl+Shift+R) to update the background texture.");
  }

  return (
    <>
      <Head>
        <title>Site look — Gallery Admin</title>
      </Head>
      <AdminLayout
        title="Site look"
        action={
          <Link href="/" className="admin-button admin-button--secondary">
            View home
          </Link>
        }
      >
        <p className="admin-note" style={{ marginBottom: "var(--space-5)", maxWidth: "42rem" }}>
          Homepage photos live in <code style={{ fontSize: "0.85em" }}>public/media/site/</code> (see{" "}
          <code>LAYOUT.txt</code> there). Catalog photos go in <code>public/media/products/</code>. Background patterns:{" "}
          <code>public/textures/</code>. Web paths always start with <code>/media/…</code> or <code>/textures/…</code>.
        </p>

        {!form ? <p className="admin-note">Loading…</p> : null}

        {form ? (
          <form className="admin-form-card" onSubmit={onSubmit}>
            {fields.map((field) => (
              <div key={field.key} className="admin-panel" style={{ padding: "var(--space-4)", marginBottom: "var(--space-3)" }}>
                <label className="admin-field">
                  <span className="admin-note">{field.label}</span>
                  <input
                    className="admin-input"
                    value={form[field.key] || ""}
                    onChange={(event) => setForm((previous) => ({ ...previous, [field.key]: event.target.value }))}
                    placeholder="/media/site/…"
                  />
                </label>
                <LocalImageUpload
                  label="Choose from your device (fills path above)"
                  onUploaded={(uploadedPath) => setForm((previous) => ({ ...previous, [field.key]: uploadedPath }))}
                />
              </div>
            ))}

            <div className="admin-quick-actions">
              <button type="submit" className="admin-button" disabled={saving}>
                {saving ? "Saving…" : "Save paths"}
              </button>
            </div>
            {message ? <p className="saved-indicator" style={{ marginTop: "var(--space-4)" }}>{message}</p> : null}
          </form>
        ) : null}
      </AdminLayout>
    </>
  );
}
