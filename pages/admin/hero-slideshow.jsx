import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

const SLIDE_TYPES = [
  { value: "artisan", label: "Artisan Story" },
  { value: "discount", label: "Flash Discount" },
  { value: "product", label: "Featured Product" },
  { value: "testimonial", label: "Customer Testimonial" },
  { value: "bundle", label: "Bundle Deal" },
  { value: "brand", label: "Brand Story" },
  { value: "shipping", label: "Shipping Offer" },
];

const DEFAULT_SLIDE = {
  id: 1,
  type: "artisan",
  image: "/media/site/homepage/design.jpg",
  title: "",
  subtitle: "",
  description: "",
  duration: 6,
  cta: "Learn More",
  ctaLink: "/shop",
};

export default function AdminHeroSlideshowPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_SLIDE);
  const [artisans, setArtisans] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadSlides();
    loadArtisans();
    loadProducts();
  }, []);

  async function loadSlides() {
    try {
      const response = await fetch("/api/admin/hero-slides");
      const data = await response.json();
      setSlides(data.slides || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadArtisans() {
    try {
      const response = await fetch("/api/admin/site-images");
      const data = await response.json();
      const parsed = JSON.parse(data?.artisanStories || "[]");
      setArtisans(parsed);
    } catch {}
  }

  async function loadProducts() {
    try {
      const response = await fetch("/api/admin/products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch {}
  }

  async function saveSlides(nextSlides) {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: nextSlides }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Could not save slides");
      }
      setSlides(nextSlides);
      setMessage("Slides saved successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(String(error?.message || "Could not save slides"));
      setTimeout(() => setMessage(""), 3500);
    } finally {
      setSaving(false);
    }
  }

  function handleAddSlide() {
    setFormData({ ...DEFAULT_SLIDE, id: Date.now() });
    setEditingId(null);
    setShowForm(true);
  }

  function handleEditSlide(slide) {
    setFormData(slide);
    setEditingId(slide.id);
    setShowForm(true);
  }

  function handleSaveSlide() {
    if (!formData.title) {
      setMessage("Title is required");
      return;
    }

    let nextSlides;
    if (editingId) {
      nextSlides = slides.map((s) => (s.id === editingId ? formData : s));
    } else {
      nextSlides = [...slides, formData];
    }

    saveSlides(nextSlides);
    setShowForm(false);
    setFormData(DEFAULT_SLIDE);
  }

  function handleDeleteSlide(id) {
    if (window.confirm("Delete this slide?")) {
      const nextSlides = slides.filter((s) => s.id !== id);
      saveSlides(nextSlides);
    }
  }

  function handleFormChange(field, value) {
    setFormData({ ...formData, [field]: value });
  }

  if (loading) return <AdminLayout title="Hero Slideshow Manager"><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout title="Hero Slideshow Manager" action="Manage slides">
      <div className="admin-panel">
        {message && <p className={`admin-form-${message.includes("error") ? "error" : "success"}`}>{message}</p>}

        <div style={{ marginBottom: "var(--space-6)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="heading-sm">Slideshow Slides ({slides.length})</h2>
            <p className="body-sm" style={{ marginTop: "4px", opacity: 0.7 }}>
              Manage the 8 auto-rotating hero slides with stories, discounts, and products
            </p>
          </div>
          <button className="admin-button" onClick={handleAddSlide} disabled={showForm || saving}>
            + Add Slide
          </button>
        </div>

        {showForm && (
          <div className="admin-form-panel" style={{ marginBottom: "var(--space-6)", padding: "var(--space-4)", background: "#f9f6ee", borderRadius: "8px" }}>
            <h3 className="heading-sm" style={{ marginBottom: "var(--space-4)" }}>
              {editingId ? "Edit Slide" : "New Slide"}
            </h3>

            <label className="admin-field">
              <span>Slide Type</span>
              <select className="admin-select" value={formData.type} onChange={(e) => handleFormChange("type", e.target.value)}>
                {SLIDE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Image URL</span>
              <input
                type="text"
                className="admin-input"
                value={formData.image}
                onChange={(e) => handleFormChange("image", e.target.value)}
                placeholder="/media/site/homepage/image.jpg"
              />
            </label>

            <label className="admin-field">
              <span>Title</span>
              <input
                type="text"
                className="admin-input"
                value={formData.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder="Main heading"
              />
            </label>

            <label className="admin-field">
              <span>Subtitle</span>
              <input
                type="text"
                className="admin-input"
                value={formData.subtitle}
                onChange={(e) => handleFormChange("subtitle", e.target.value)}
                placeholder="Secondary text"
              />
            </label>

            <label className="admin-field">
              <span>Description</span>
              <textarea
                className="admin-textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                placeholder="Additional details"
              />
            </label>

            <label className="admin-field">
              <span>CTA Button Text</span>
              <input
                type="text"
                className="admin-input"
                value={formData.cta}
                onChange={(e) => handleFormChange("cta", e.target.value)}
              />
            </label>

            <label className="admin-field">
              <span>CTA Link</span>
              <input
                type="text"
                className="admin-input"
                value={formData.ctaLink}
                onChange={(e) => handleFormChange("ctaLink", e.target.value)}
              />
            </label>

            <label className="admin-field">
              <span>Duration (seconds)</span>
              <input
                type="number"
                className="admin-input"
                value={formData.duration}
                onChange={(e) => handleFormChange("duration", Number(e.target.value))}
                min="3"
                max="15"
              />
            </label>

            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
              <button className="admin-button admin-button--secondary" onClick={() => setShowForm(false)} disabled={saving}>
                Cancel
              </button>
              <button className="admin-button" onClick={handleSaveSlide} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Slide" : "Add Slide"}
              </button>
            </div>
          </div>
        )}

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "var(--space-4)", opacity: 0.6 }}>
                    No slides yet. Create your first slide to get started.
                  </td>
                </tr>
              ) : (
                slides.map((slide) => (
                  <tr key={slide.id}>
                    <td>
                      <span className="admin-badge">{SLIDE_TYPES.find((t) => t.value === slide.type)?.label}</span>
                    </td>
                    <td>{slide.title}</td>
                    <td>{slide.duration}s</td>
                    <td>
                      <button className="admin-link" onClick={() => handleEditSlide(slide)}>
                        Edit
                      </button>
                      <button className="admin-link admin-link--danger" onClick={() => handleDeleteSlide(slide.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-note" style={{ marginTop: "var(--space-6)" }}>
          <strong>Tips:</strong>
          <ul>
            <li>Keep slides between 5-7 seconds for optimal viewing</li>
            <li>Use high-quality images (1400x700px recommended)</li>
            <li>Test on mobile to ensure text readability</li>
            <li>Rotate featured artisans weekly for freshness</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
