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
  const [liveContent, setLiveContent] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [persistence, setPersistence] = useState(null);
  const [showLiveComparison, setShowLiveComparison] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Load admin form data
      const response = await fetch("/api/admin/site-images", { credentials: "same-origin" });
      if (!response.ok) return;
      const data = await response.json();
      if (!cancelled) setForm(data);

      // Load live site content
      setLoadingLive(true);
      const liveResponse = await fetch("/api/admin/site-images-live", { credentials: "same-origin" });
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        if (!cancelled) setLiveContent(liveData.liveContent);
      } else {
        if (!cancelled) setLiveError("Could not load live site content");
      }
      setLoadingLive(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function getDiffFields() {
    if (!form || !liveContent) return [];
    const diffs = [];
    const allKeys = new Set([...Object.keys(form), ...Object.keys(liveContent)]);
    for (const key of allKeys) {
      if (form[key] !== liveContent[key]) {
        diffs.push(key);
      }
    }
    return diffs;
  }

  function pullFromLive() {
    if (!liveContent) return;
    setForm(liveContent);
    setMessage("✓ Pulled from live site. Review changes and click 'Save all changes' to confirm.");
  }

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
          <>
            {/* Live Site Comparison Bar */}
            {liveContent && getDiffFields().length > 0 && (
              <div className="live-comparison-bar">
                <div className="live-comparison-content">
                  <p className="live-comparison-title">🔴 {getDiffFields().length} field(s) differ from live site</p>
                  <p className="live-comparison-fields">
                    Changed: {getDiffFields().map((k) => {
                      const field = [...IMAGE_FIELDS, ...TEXT_FIELDS].find((f) => f.key === k);
                      return field ? field.label : k;
                    }).join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-button admin-button--secondary"
                  onClick={pullFromLive}
                >
                  ↓ Pull from live
                </button>
              </div>
            )}

            {loadingLive && (
              <p className="admin-note">Loading live site content...</p>
            )}

            {liveError && (
              <p className="admin-form-error">{liveError}</p>
            )}

            {liveContent && getDiffFields().length === 0 && (
              <p className="admin-note" style={{ backgroundColor: "#dcfce7", borderColor: "#86efac" }}>
                ✓ Admin version matches live site
              </p>
            )}

            {/* Live Site Image Gallery */}
            {liveContent && (
              <section className="site-content-section">
                <h2 className="site-content-section-title">🌐 Live Website Images</h2>
                <p className="admin-note" style={{ marginBottom: "1rem" }}>
                  Here's what's currently published on your live website. Red border = different from admin version.
                </p>
                <div className="live-gallery">
                  {IMAGE_FIELDS.map((field) => {
                    const liveValue = liveContent[field.key];
                    const adminValue = form[field.key];
                    const isDifferent = liveValue !== adminValue;
                    return (
                      <div
                        key={field.key}
                        className={`live-gallery-item ${isDifferent ? "live-gallery-item--different" : ""}`}
                      >
                        <p className="live-gallery-label">
                          {field.label}
                          {isDifferent && <span className="live-gallery-badge">CHANGED</span>}
                        </p>
                        {liveValue ? (
                          <div className="live-image-container">
                            <img
                              src={liveValue}
                              alt={field.label}
                              onError={(e) => {
                                e.target.parentElement.innerHTML =
                                  '<p style="color: #999; padding: 1rem; text-align: center;">Image not found</p>';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="live-image-empty">No image</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Side-by-side Image Comparisons for Changed Fields */}
            {liveContent && getDiffFields().length > 0 && (
              <section className="site-content-section">
                <h2 className="site-content-section-title">🔄 Image Comparisons (Admin vs Live)</h2>
                <div className="comparison-grid">
                  {getDiffFields()
                    .filter((key) => IMAGE_FIELDS.find((f) => f.key === key))
                    .map((key) => {
                      const field = IMAGE_FIELDS.find((f) => f.key === key);
                      const adminValue = form[key];
                      const liveValue = liveContent[key];
                      return (
                        <div key={key} className="comparison-block">
                          <p className="comparison-title">{field.label}</p>
                          <div className="comparison-images">
                            <div className="comparison-image-column">
                              <p className="comparison-label admin">Admin Version</p>
                              {adminValue ? (
                                <img
                                  src={adminValue}
                                  alt="Admin"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="comparison-empty">No image</div>
                              )}
                            </div>
                            <div className="comparison-image-column">
                              <p className="comparison-label live">Live Version</p>
                              {liveValue ? (
                                <img
                                  src={liveValue}
                                  alt="Live"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="comparison-empty">No image</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}

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
              .live-comparison-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1.5rem;
              }

              .live-comparison-content {
                flex: 1;
              }

              .live-comparison-title {
                margin: 0;
                font-weight: 600;
                color: #991b1b;
                font-size: 0.95rem;
              }

              .live-comparison-fields {
                margin: 0.5rem 0 0 0;
                font-size: 0.85rem;
                color: #7f1d1d;
                font-style: italic;
              }

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

              /* Live Gallery Styles */
              .live-gallery {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-top: 1rem;
              }

              .live-gallery-item {
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
                transition: all 0.3s ease;
              }

              .live-gallery-item--different {
                border-color: #ef4444;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
              }

              .live-gallery-label {
                margin: 0;
                padding: 0.75rem 1rem;
                font-size: 0.85rem;
                font-weight: 600;
                color: #333;
                background: #f9f9f9;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }

              .live-gallery-badge {
                display: inline-block;
                background: #ef4444;
                color: white;
                font-size: 0.7rem;
                padding: 0.3rem 0.6rem;
                border-radius: 4px;
                font-weight: 700;
              }

              .live-image-container {
                width: 100%;
                height: 200px;
                overflow: hidden;
                background: #f5f5f5;
              }

              .live-image-container img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }

              .live-image-empty {
                width: 100%;
                height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
                color: #999;
                font-size: 0.9rem;
              }

              /* Comparison Grid Styles */
              .comparison-grid {
                display: grid;
                gap: 2rem;
                margin-top: 1rem;
              }

              .comparison-block {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 1rem;
              }

              .comparison-title {
                margin: 0 0 1rem 0;
                font-weight: 600;
                color: #333;
                font-size: 0.95rem;
              }

              .comparison-images {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
              }

              .comparison-image-column {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
              }

              .comparison-label {
                margin: 0;
                font-size: 0.8rem;
                font-weight: 600;
                padding: 0.5rem 0.75rem;
                border-radius: 4px;
              }

              .comparison-label.admin {
                background: #dbeafe;
                color: #1e40af;
              }

              .comparison-label.live {
                background: #dcfce7;
                color: #166534;
              }

              .comparison-image-column img {
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 6px;
                border: 1px solid #e0e0e0;
              }

              .comparison-empty {
                width: 100%;
                height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
                color: #999;
                font-size: 0.9rem;
                border-radius: 6px;
              }

              @media (max-width: 1200px) {
                .site-content-section {
                  padding: 1.25rem;
                }

                .comparison-images {
                  grid-template-columns: 1fr;
                }
              }

              @media (max-width: 767px) {
                .site-content-form {
                  gap: 1rem;
                }

                .site-content-section {
                  padding: 1rem;
                }

                .live-comparison-bar {
                  flex-direction: column;
                  align-items: flex-start;
                }

                .live-gallery {
                  grid-template-columns: 1fr;
                }

                .comparison-images {
                  grid-template-columns: 1fr;
                }
              }
            `}</style>
            </form>
          </>
        )}
      </AdminLayout>
    </>
  );
}
