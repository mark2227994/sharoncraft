import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import LocalImageUpload from "../../components/admin/LocalImageUpload";

const IMAGE_FIELDS = [
  {
    key: "heroImage",
    label: "Hero banner photo (top of homepage)",
    uploadFolder: "site/homepage",
    localFolder: "public/media/site/homepage",
  },
  {
    key: "artisanPortrait",
    label: "Artisan photo (beside quote / about section)",
    uploadFolder: "site/homepage",
    localFolder: "public/media/site/homepage",
  },
  {
    key: "collectionJewellery",
    label: "Collection card - Jewellery",
    uploadFolder: "site/collections",
    localFolder: "public/media/site/collections",
  },
  {
    key: "collectionHome",
    label: "Collection card - Home decor",
    uploadFolder: "site/collections",
    localFolder: "public/media/site/collections",
  },
  {
    key: "collectionAccessories",
    label: "Collection card - Gifted carry",
    uploadFolder: "site/collections",
    localFolder: "public/media/site/collections",
  },
  {
    key: "pageTexture",
    label: "Page background texture (SVG or small tile)",
    uploadFolder: "site/textures",
    localFolder: "public/media/site/textures",
  },
];

const TEXT_FIELDS = [
  { key: "heroTitle", label: "Hero title", type: "input", placeholder: "Handmade Kenyan jewellery and home decor" },
  { key: "heroSubtitle", label: "Hero subtitle / tagline", type: "input", placeholder: "Every piece tells a story." },
  { key: "artisanBio", label: "Artisan bio (short, shown on homepage)", type: "textarea", placeholder: "Sharon is a Kenyan artisan..." },
  {
    key: "artisanStories",
    label: "Featured artisans carousel (one artisan per line)",
    type: "textarea",
    rows: 6,
    placeholder:
      "Nafula Wambui | Karatina, Nyeri County | Jewellery | /media/site/homepage/nafula.jpg | /shop?category=Jewellery | Nafula creates beadwork with a balanced, ceremonial feel.",
    help:
      "Format: Name | Location | Craft | Image path | Shop link | Short story. Leave image or link empty if you want the site to use a fallback.",
  },
  { key: "aboutStory", label: "About / origin story (homepage About section)", type: "textarea", placeholder: "SharonCraft was born from..." },
  { key: "deliveryNote", label: "Delivery note", type: "input", placeholder: "We deliver across Kenya. Standard delivery KES 300." },
  { key: "businessHours", label: "Business hours", type: "input", placeholder: "Mon-Sat, 9am-6pm EAT" },
  { key: "contactWhatsApp", label: "WhatsApp contact number (digits only, e.g. 0712345678)", type: "input", placeholder: "0112222572" },
  { key: "contactEmail", label: "Contact email (optional)", type: "input", placeholder: "hello@sharoncraft.co.ke" },
];

export default function AdminSiteImagesPage() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [persistence, setPersistence] = useState(null);

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
    setPersistence(data.persistence || null);
    if (data.persistence?.durable) {
      setMessage("Saved and synced to durable storage for the live storefront.");
    } else {
      setMessage("Saved locally, but durable storage is not configured yet.");
    }
  }

  return (
    <>
      <Head>
        <title>Site Content - Gallery Admin</title>
      </Head>
      <AdminLayout
        title="Site Content"
        action={
          <Link href="/" className="admin-button admin-button--secondary" target="_blank">
            View site
          </Link>
        }
      >
        {!form ? (
          <p className="admin-note">Loading...</p>
        ) : (
          <form className="site-content-form" onSubmit={onSubmit}>
            <section className="site-content-section">
              <h2 className="site-content-section-title">📷 Photos</h2>
              <div className="site-content-fields">
                {IMAGE_FIELDS.map((field) => (
                  <div key={field.key} className="site-image-field">
                    <label className="admin-field">
                      <span className="admin-note">{field.label}</span>
                      <input
                        className="admin-input"
                        value={form[field.key] || ""}
                        onChange={(event) => set(field.key, event.target.value)}
                        placeholder="/media/site/..."
                      />
                    </label>
                    <p className="caption" style={{ marginBottom: "8px" }}>
                      Upload folder: <code>product-images/catalog/{field.uploadFolder}</code>
                    </p>
                    <p className="caption" style={{ marginBottom: "8px" }}>
                      Local mirror: <code>{field.localFolder}</code>
                    </p>
                    {form[field.key] ? (
                      <img
                        src={form[field.key]}
                        alt=""
                        style={{ marginTop: 8, maxHeight: 80, maxWidth: 200, objectFit: "cover", borderRadius: 6 }}
                        onError={(event) => {
                          event.target.style.display = "none";
                        }}
                      />
                    ) : null}
                    <LocalImageUpload
                      label="Upload from device"
                      folder={field.uploadFolder}
                      onUploaded={(path) => set(field.key, path)}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="site-content-section">
              <h2 className="site-content-section-title">✍️ Text Content</h2>
              <div className="site-content-fields">
                {TEXT_FIELDS.map((field) => (
                  <label key={field.key} className="admin-field site-content-text-field">
                    <span>{field.label}</span>
                    {field.type === "textarea" ? (
                      <textarea
                        className="admin-textarea"
                        value={form[field.key] || ""}
                        onChange={(event) => set(field.key, event.target.value)}
                        placeholder={field.placeholder}
                        rows={field.rows || 3}
                      />
                    ) : (
                      <input
                        className="admin-input"
                        value={form[field.key] || ""}
                        onChange={(event) => set(field.key, event.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}
                    {field.help ? <p className="admin-note" style={{ marginTop: "8px" }}>{field.help}</p> : null}
                  </label>
                ))}
              </div>
            </section>

            <section className="site-content-section site-content-section--actions">
              <button type="submit" className="admin-button site-content-submit-btn" disabled={saving}>
                {saving ? "Saving..." : "Save all changes"}
              </button>
            </section>

            {message ? (
              <p className="saved-indicator" style={{ marginTop: "var(--space-3)", color: "#16a34a" }}>
                {message}
              </p>
            ) : null}
            {persistence ? (
              <p className="admin-note" style={{ marginTop: "var(--space-2)" }}>
                Saved to: <code>{persistence.targets.join(", ")}</code>
              </p>
            ) : null}
            {persistence && !persistence.durable ? (
              <p className="admin-form-error" style={{ marginTop: "var(--space-2)" }}>
                This environment only saved a local fallback file. On Vercel, set durable storage like Supabase or
                Vercel Blob so edits appear reliably on the live site.
              </p>
            ) : null}
            {error ? <p className="admin-form-error" style={{ marginTop: "var(--space-3)" }}>{error}</p> : null}

            <style jsx>{`
              .site-content-form {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
              }

              .site-content-section {
                background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                padding: 1.5rem;
                transition: all 0.3s ease;
              }

              .site-content-section:hover {
                border-color: #d4a574;
                box-shadow: 0 2px 8px rgba(212, 165, 116, 0.08);
              }

              .site-content-section--actions {
                background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
                border: 2px solid #d4a574;
              }

              .site-content-section-title {
                margin: 0 0 1.25rem 0;
                font-size: 1rem;
                font-weight: 700;
                color: #333;
                padding-bottom: 0.75rem;
                border-bottom: 2px solid #f0f0f0;
              }

              .site-content-fields {
                display: flex;
                flex-direction: column;
                gap: 1rem;
              }

              .site-image-field {
                background: white;
                border: 1px solid #e8e8e8;
                border-radius: 8px;
                padding: 1rem;
                transition: all 0.2s ease;
              }

              .site-image-field:hover {
                border-color: #d4a574;
                box-shadow: 0 2px 6px rgba(212, 165, 116, 0.1);
              }

              .site-content-text-field {
                background: white;
                border: 1px solid #e8e8e8;
                border-radius: 8px;
                padding: 1rem;
                margin: 0;
                transition: all 0.2s ease;
              }

              .site-content-text-field:hover {
                border-color: #d4a574;
                box-shadow: 0 2px 6px rgba(212, 165, 116, 0.1);
              }

              .site-content-submit-btn {
                background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
                color: white;
                border: none;
                padding: 0.85rem 2rem;
                font-size: 0.95rem;
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
              }

              .site-content-submit-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
              }

              .site-content-submit-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
              }

              @media (max-width: 1200px) {
                .site-content-section {
                  padding: 1.25rem;
                }
              }

              @media (max-width: 767px) {
                .site-content-form {
                  gap: 1rem;
                }

                .site-content-section {
                  padding: 1rem;
                }
              }
            `}</style>
          </form>
        )}
      </AdminLayout>
    </>
  );
}
