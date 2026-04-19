import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

const DEFAULT_TESTIMONIAL = {
  id: 1,
  name: "",
  location: "",
  rating: 5,
  quote: "",
  productId: "",
  approved: false,
  image: "",
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_TESTIMONIAL);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadTestimonials();
    loadProducts();
  }, []);

  async function loadTestimonials() {
    try {
      const response = await fetch("/api/admin/testimonials");
      const data = await response.json();
      setTestimonials(data.testimonials || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const response = await fetch("/api/admin/products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch {}
  }

  async function saveTestimonials(nextTestimonials) {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonials: nextTestimonials }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Could not save testimonials");
      }
      setTestimonials(nextTestimonials);
      setMessage("Testimonials saved successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(String(error?.message || "Could not save testimonials"));
      setTimeout(() => setMessage(""), 3500);
    } finally {
      setSaving(false);
    }
  }

  function handleAddTestimonial() {
    setFormData({ ...DEFAULT_TESTIMONIAL, id: Date.now() });
    setEditingId(null);
    setShowForm(true);
  }

  function handleEditTestimonial(testimonial) {
    setFormData(testimonial);
    setEditingId(testimonial.id);
    setShowForm(true);
  }

  function handleSaveTestimonial() {
    if (!formData.name || !formData.quote) {
      setMessage("Name and quote are required");
      return;
    }

    let nextTestimonials;
    if (editingId) {
      nextTestimonials = testimonials.map((t) => (t.id === editingId ? formData : t));
    } else {
      nextTestimonials = [...testimonials, formData];
    }

    saveTestimonials(nextTestimonials);
    setShowForm(false);
    setFormData(DEFAULT_TESTIMONIAL);
  }

  function handleDeleteTestimonial(id) {
    if (window.confirm("Delete this testimonial?")) {
      const nextTestimonials = testimonials.filter((t) => t.id !== id);
      saveTestimonials(nextTestimonials);
    }
  }

  function toggleApproval(id) {
    const next = testimonials.map((t) =>
      t.id === id ? { ...t, approved: !t.approved } : t
    );
    saveTestimonials(next);
  }

  function handleFormChange(field, value) {
    setFormData({ ...formData, [field]: value });
  }

  const approvedCount = testimonials.filter((t) => t.approved).length;

  if (loading) return <AdminLayout title="Testimonials Manager"><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout title="Customer Testimonials" action="Manage reviews">
      <div className="admin-panel">
        {message && <p className={`admin-form-${message.includes("error") ? "error" : "success"}`}>{message}</p>}

        <div style={{ marginBottom: "var(--space-6)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="heading-sm">Customer Testimonials ({approvedCount}/{testimonials.length})</h2>
            <p className="body-sm" style={{ marginTop: "4px", opacity: 0.7 }}>
              Curate customer reviews to feature on the hero slideshow
            </p>
          </div>
          <button className="admin-button" onClick={handleAddTestimonial} disabled={showForm || saving}>
            + Add Testimonial
          </button>
        </div>

        {showForm && (
          <div className="admin-form-panel" style={{ marginBottom: "var(--space-6)", padding: "var(--space-4)", background: "#f9f6ee", borderRadius: "8px" }}>
            <h3 className="heading-sm" style={{ marginBottom: "var(--space-4)" }}>
              {editingId ? "Edit Testimonial" : "New Testimonial"}
            </h3>

            <label className="admin-field">
              <span>Customer Name</span>
              <input
                type="text"
                className="admin-input"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="e.g., Sarah, London"
              />
            </label>

            <label className="admin-field">
              <span>Location</span>
              <input
                type="text"
                className="admin-input"
                value={formData.location}
                onChange={(e) => handleFormChange("location", e.target.value)}
                placeholder="e.g., London, UK"
              />
            </label>

            <label className="admin-field">
              <span>Rating (1-5 stars)</span>
              <select className="admin-select" value={formData.rating} onChange={(e) => handleFormChange("rating", Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {"⭐".repeat(r)} ({r} stars)
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Review Quote</span>
              <textarea
                className="admin-textarea"
                rows={4}
                value={formData.quote}
                onChange={(e) => handleFormChange("quote", e.target.value)}
                placeholder="Customer's review or testimonial"
              />
            </label>

            <label className="admin-field">
              <span>Product (Optional)</span>
              <select className="admin-select" value={formData.productId} onChange={(e) => handleFormChange("productId", e.target.value)}>
                <option value="">-- Select a product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Image URL (Optional)</span>
              <input
                type="text"
                className="admin-input"
                value={formData.image}
                onChange={(e) => handleFormChange("image", e.target.value)}
                placeholder="Lifestyle photo of customer"
              />
            </label>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={formData.approved}
                onChange={(e) => handleFormChange("approved", e.target.checked)}
              />
              <span>Approved for hero slideshow</span>
            </label>

            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
              <button className="admin-button admin-button--secondary" onClick={() => setShowForm(false)} disabled={saving}>
                Cancel
              </button>
              <button className="admin-button" onClick={handleSaveTestimonial} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        )}

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Quote</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "var(--space-4)", opacity: 0.6 }}>
                    No testimonials yet.
                  </td>
                </tr>
              ) : (
                testimonials.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>{t.location}</div>
                    </td>
                    <td>{"⭐".repeat(t.rating)}</td>
                    <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      "{t.quote}"
                    </td>
                    <td>
                      <span className={`admin-badge ${t.approved ? "admin-badge--success" : ""}`}>
                        {t.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-link"
                        onClick={() => toggleApproval(t.id)}
                        style={{ marginRight: "var(--space-2)" }}
                      >
                        {t.approved ? "Unapprove" : "Approve"}
                      </button>
                      <button className="admin-link" onClick={() => handleEditTestimonial(t)}>
                        Edit
                      </button>
                      <button className="admin-link admin-link--danger" onClick={() => handleDeleteTestimonial(t.id)}>
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
          <strong>Workflow:</strong>
          <ul>
            <li>Collect reviews from customers via email or form</li>
            <li>Add testimonials here with permission</li>
            <li>Mark "Approved" to feature on hero slideshow</li>
            <li>Rotate featured testimonials weekly</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
