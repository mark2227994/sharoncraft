import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

const DEFAULT_CONTENT = {
  trustLine: "40+ hours per piece | Ethically made",
  artisanCount: "47",
  customerCount: "1,247",
  averageTime: "40+",
  heroSubtitle: "Handmade Kenyan Beadwork by 47 Artisans",
  heroDescription: "No shortcuts. Just hands. Just heart.",
  ctaShopText: "Shop Now",
  ctaShopLink: "/shop",
  ctaArtisansText: "Meet All Artisans",
  ctaArtisansLink: "/artisans",
};

export default function AdminHomepageContentPage() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    try {
      const response = await fetch("/api/admin/homepage-content");
      const data = await response.json();
      if (data.content) {
        setContent({ ...DEFAULT_CONTENT, ...data.content });
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveContent() {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/homepage-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Could not save content");
      }
      setMessage("Homepage content saved successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(String(error?.message || "Could not save content"));
      setTimeout(() => setMessage(""), 3500);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field, value) {
    setContent({ ...content, [field]: value });
  }

  if (loading) return <AdminLayout title="Homepage Content"><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout title="Homepage Content Hub" action="Manage marketing copy">
      <div className="admin-panel">
        {message && <p className={`admin-form-${message.includes("error") ? "error" : "success"}`}>{message}</p>}

        <h2 className="heading-sm" style={{ marginBottom: "var(--space-4)" }}>
          Homepage & Marketing Content
        </h2>
        <p className="body-sm" style={{ marginBottom: "var(--space-6)", opacity: 0.7 }}>
          Centralized management of homepage copy, trust lines, CTAs, and brand statistics
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveContent();
          }}
        >
          {/* TRUST & SOCIAL PROOF */}
          <fieldset style={{ marginBottom: "var(--space-8)", paddingBottom: "var(--space-6)", borderBottom: "1px solid #ddd" }}>
            <legend className="heading-xs" style={{ marginBottom: "var(--space-4)" }}>
              Trust & Social Proof
            </legend>

            <label className="admin-field">
              <span>Trust Line (footer text)</span>
              <input
                type="text"
                className="admin-input"
                value={content.trustLine}
                onChange={(e) => handleChange("trustLine", e.target.value)}
                placeholder="40+ hours per piece | Ethically made"
              />
              <p className="caption" style={{ marginTop: "4px", opacity: 0.7 }}>
                Shown on hero, product pages, and footer
              </p>
            </label>

            <label className="admin-field">
              <span>Number of Artisans</span>
              <input
                type="text"
                className="admin-input"
                value={content.artisanCount}
                onChange={(e) => handleChange("artisanCount", e.target.value)}
                placeholder="47"
              />
            </label>

            <label className="admin-field">
              <span>Number of Happy Customers</span>
              <input
                type="text"
                className="admin-input"
                value={content.customerCount}
                onChange={(e) => handleChange("customerCount", e.target.value)}
                placeholder="1,247+"
              />
            </label>

            <label className="admin-field">
              <span>Average Hours Per Piece</span>
              <input
                type="text"
                className="admin-input"
                value={content.averageTime}
                onChange={(e) => handleChange("averageTime", e.target.value)}
                placeholder="40+"
              />
            </label>
          </fieldset>

          {/* HERO SECTION */}
          <fieldset style={{ marginBottom: "var(--space-8)", paddingBottom: "var(--space-6)", borderBottom: "1px solid #ddd" }}>
            <legend className="heading-xs" style={{ marginBottom: "var(--space-4)" }}>
              Hero Section Copy
            </legend>

            <label className="admin-field">
              <span>Hero Subtitle</span>
              <input
                type="text"
                className="admin-input"
                value={content.heroSubtitle}
                onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                placeholder="Handmade Kenyan Beadwork by 47 Artisans"
              />
              <p className="caption" style={{ marginTop: "4px", opacity: 0.7 }}>
                Main headline for hero section
              </p>
            </label>

            <label className="admin-field">
              <span>Hero Description</span>
              <textarea
                className="admin-textarea"
                rows={3}
                value={content.heroDescription}
                onChange={(e) => handleChange("heroDescription", e.target.value)}
                placeholder="No shortcuts. Just hands. Just heart."
              />
              <p className="caption" style={{ marginTop: "4px", opacity: 0.7 }}>
                Supporting text, keeps it authentic and honest
              </p>
            </label>
          </fieldset>

          {/* CTAs */}
          <fieldset style={{ marginBottom: "var(--space-8)", paddingBottom: "var(--space-6)", borderBottom: "1px solid #ddd" }}>
            <legend className="heading-xs" style={{ marginBottom: "var(--space-4)" }}>
              Call-to-Action Buttons
            </legend>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <label className="admin-field">
                <span>Shop CTA Text</span>
                <input
                  type="text"
                  className="admin-input"
                  value={content.ctaShopText}
                  onChange={(e) => handleChange("ctaShopText", e.target.value)}
                  placeholder="Shop Now"
                />
              </label>

              <label className="admin-field">
                <span>Shop CTA Link</span>
                <input
                  type="text"
                  className="admin-input"
                  value={content.ctaShopLink}
                  onChange={(e) => handleChange("ctaShopLink", e.target.value)}
                  placeholder="/shop"
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <label className="admin-field">
                <span>Artisans CTA Text</span>
                <input
                  type="text"
                  className="admin-input"
                  value={content.ctaArtisansText}
                  onChange={(e) => handleChange("ctaArtisansText", e.target.value)}
                  placeholder="Meet All Artisans"
                />
              </label>

              <label className="admin-field">
                <span>Artisans CTA Link</span>
                <input
                  type="text"
                  className="admin-input"
                  value={content.ctaArtisansLink}
                  onChange={(e) => handleChange("ctaArtisansLink", e.target.value)}
                  placeholder="/artisans"
                />
              </label>
            </div>
          </fieldset>

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button type="submit" className="admin-button" disabled={saving}>
              {saving ? "Saving..." : "Save All Changes"}
            </button>
            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={() => setContent(DEFAULT_CONTENT)}
              disabled={saving}
            >
              Reset to Defaults
            </button>
          </div>
        </form>

        <div className="admin-note" style={{ marginTop: "var(--space-8)" }}>
          <strong>Quick Reference:</strong>
          <ul>
            <li><strong>Trust Line:</strong> Builds credibility and showcases key value props</li>
            <li><strong>Artisan Count:</strong> Updates globally - used in hero, about, and footer</li>
            <li><strong>Hero Copy:</strong> Drives first impression - keep it honest and authentic</li>
            <li><strong>CTAs:</strong> Controls navigation and conversion paths</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
