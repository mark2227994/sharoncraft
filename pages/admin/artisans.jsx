import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

const DEFAULT_ARTISAN = {
  name: "",
  location: "",
  craft: "",
  image: "",
  story: "",
  href: "",
};

const DEFAULT_ARTISANS = [
  {
    id: 1,
    name: "Nafula Wambui",
    location: "Karatina, Nyeri County",
    craft: "Jewellery",
    image: "",
    story: "Nafula creates beadwork with a balanced, ceremonial feel.",
    href: "/shop?category=Jewellery",
  },
  {
    id: 2,
    name: "Achieng Atieno",
    location: "Kisumu County",
    craft: "Earrings",
    image: "",
    story: "Achieng focuses on lighter jewellery meant to move well with the body.",
    href: "/shop?category=Jewellery&jewelryType=earring",
  },
  {
    id: 3,
    name: "Muthoni Wairimu",
    location: "Nairobi",
    craft: "Necklaces",
    image: "",
    story: "Muthoni's necklace work leans toward bold centerpieces and bridal styling.",
    href: "/shop?category=Jewellery&jewelryType=necklace",
  },
];

function normalizeArtisanEntry(entry, index) {
  return {
    id: Number(entry?.id) || Date.now() + index,
    name: String(entry?.name || "").trim(),
    location: String(entry?.location || "").trim(),
    craft: String(entry?.craft || "").trim(),
    image: String(entry?.image || "").trim(),
    story: String(entry?.story || "").trim(),
    href: String(entry?.href || "").trim(),
  };
}

function parseArtisanStories(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeArtisanEntry).filter((entry) => entry.name);
  }

  const raw = String(value || "").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeArtisanEntry).filter((entry) => entry.name);
  } catch {
    return [];
  }
}

function toPersistedArtisans(artisans) {
  return artisans.map((artisan) => ({
    name: artisan.name,
    location: artisan.location,
    craft: artisan.craft,
    image: artisan.image,
    story: artisan.story,
    href: artisan.href,
  }));
}

export default function AdminArtisansPage() {
  const fileInputRef = useRef(null);
  const [artisans, setArtisans] = useState(DEFAULT_ARTISANS);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_ARTISAN);
  const [message, setMessage] = useState("");
  const [availableImages, setAvailableImages] = useState([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingArtisans, setSavingArtisans] = useState(false);

  async function persistArtisans(nextArtisans, successMessage) {
    setSavingArtisans(true);
    try {
      const response = await fetch("/api/admin/site-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisanStories: JSON.stringify(toPersistedArtisans(nextArtisans)),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Could not save artisan stories");
      }

      setArtisans(nextArtisans);
      setMessage(successMessage);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(String(error?.message || "Could not save artisan stories"));
      setTimeout(() => setMessage(""), 3500);
    } finally {
      setSavingArtisans(false);
    }
  }

  async function loadSavedArtisans() {
    try {
      const response = await fetch("/api/admin/site-images");
      if (!response.ok) return;

      const result = await response.json();
      const parsed = parseArtisanStories(result?.artisanStories);
      if (parsed.length > 0) {
        setArtisans(parsed);
      }
    } catch {
      // keep defaults if loading fails
    }
  }

  async function loadAvailableImages() {
    setLoadingImages(true);
    try {
      const response = await fetch("/api/admin/artisan-images");
      const data = await response.json();
      setAvailableImages(data.images || []);
    } finally {
      setLoadingImages(false);
    }
  }

  useEffect(() => {
    loadAvailableImages().catch(() => {});
    loadSavedArtisans().catch(() => {});
  }, []);

  async function handleLocalImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("folder", "site/artisans");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: payload,
      });

      const result = await response.json();
      if (!response.ok || !result?.path) {
        throw new Error(result?.error || "Could not upload image");
      }

      setFormData((current) => ({ ...current, image: result.path }));
      setShowImagePicker(false);
      setMessage("Image uploaded and selected.");
      await loadAvailableImages();
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      setMessage(String(error?.message || "Could not upload image"));
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleNew() {
    setEditingId(null);
    setShowForm(true);
    setFormData({ ...DEFAULT_ARTISAN, id: Date.now() });
    setShowImagePicker(false);
  }

  function handleEdit(artisan) {
    setEditingId(artisan.id);
    setFormData(artisan);
    setShowImagePicker(false);
  }

  async function handleDelete(id) {
    if (confirm("Delete this artisan?")) {
      const nextArtisans = artisans.filter((artisan) => artisan.id !== id);
      await persistArtisans(nextArtisans, "Artisan deleted");
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.story) {
      setMessage("Name and story are required");
      return;
    }

    let nextArtisans = artisans;
    if (editingId) {
      nextArtisans = artisans.map((artisan) => (artisan.id === editingId ? { ...formData } : artisan));
    } else {
      nextArtisans = [...artisans, { ...formData, id: Date.now() }];
    }

    await persistArtisans(nextArtisans, editingId ? "Artisan updated!" : "New artisan added!");

    setEditingId(null);
    setShowForm(false);
    setFormData(DEFAULT_ARTISAN);
    setShowImagePicker(false);
  }

  function handleCancel() {
    setEditingId(null);
    setShowForm(false);
    setFormData(DEFAULT_ARTISAN);
    setShowImagePicker(false);
  }

  function selectImage(imageUrl) {
    setFormData({ ...formData, image: imageUrl });
    setShowImagePicker(false);
  }

  return (
    <AdminLayout title="Manage Artisans">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              Saved here appears live on Home and Artisans pages:
            </p>
            <pre style={{ background: "#f5f5f5", padding: 8, fontSize: 10, overflow: "auto", maxHeight: 100 }}>
              {JSON.stringify(artisans, null, 2)}
            </pre>
          </div>
          <button onClick={handleNew} style={{ padding: "10px 20px", background: "#C04D29", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
            + Add New Artisan
          </button>
        </div>

        {message && <div style={{ padding: 12, background: "#d4edda", color: "#155724", borderRadius: 6, marginBottom: 16 }}>{message}</div>}

        {(editingId != null || showForm) && (
          <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 8, padding: 20, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>{editingId ? "Edit Artisan" : "Add New Artisan"}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: 6 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: 6 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Craft</label>
                <select value={formData.craft} onChange={e => setFormData({...formData, craft: e.target.value})} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: 6 }}>
                  <option value="">Select craft</option>
                  <option value="Jewellery">Jewellery</option>
                  <option value="Necklaces">Necklaces</option>
                  <option value="Bracelets">Bracelets</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Home Decor">Home Decor</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Image</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {formData.image ? (
                  <img src={formData.image} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e5e5" }} />
                ) : (
                  <div style={{ width: 80, height: 80, background: "#f5f5f5", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#999" }}>No image</div>
                )}
                <button type="button" onClick={() => setShowImagePicker(!showImagePicker)} style={{ padding: "8px 16px", background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 6, cursor: "pointer" }}>
                  {showImagePicker ? "Hide Images" : "Choose Image"}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: "8px 16px", background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 6, cursor: uploadingImage ? "wait" : "pointer" }}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Uploading..." : "Upload From Computer"}
                </button>
                {formData.image && (
                  <button type="button" onClick={() => setFormData({...formData, image: ""})} style={{ padding: "8px 16px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer" }}>
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLocalImageUpload}
                style={{ display: "none" }}
              />
              {formData.image && (
                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} style={{ width: "100%", marginTop: 8, padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 12 }} placeholder="Or paste a custom URL" />
              )}
              {showImagePicker && (
                <div style={{ marginTop: 12, maxHeight: 200, overflowY: "auto", border: "1px solid #e5e5e5", borderRadius: 6, padding: 8 }}>
                  {loadingImages ? (
                    <p style={{ color: "#666" }}>Loading images...</p>
                  ) : availableImages.length === 0 ? (
                    <div>
                      <p style={{ color: "#666", marginBottom: 8 }}>No images found in /public/media/site/artisans/</p>
                      <p style={{ fontSize: 12, color: "#999" }}>Add images to that folder, then they'll appear here.</p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {availableImages.map(img => (
                        <div key={img.url} onClick={() => selectImage(img.url)} style={{ cursor: "pointer", border: formData.image === img.url ? "2px solid #C04D29" : "2px solid transparent", borderRadius: 4, overflow: "hidden" }}>
                          <img src={img.url} alt={img.name} style={{ width: "100%", height: 60, objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Story *</label>
              <textarea value={formData.story} onChange={e => setFormData({...formData, story: e.target.value})} rows={4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: 6, resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleSave}
                style={{ padding: "10px 20px", background: "#C04D29", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: savingArtisans ? "wait" : "pointer", opacity: savingArtisans ? 0.8 : 1 }}
                disabled={savingArtisans}
              >
                {savingArtisans ? "Saving..." : editingId ? "Save Changes" : "Add Artisan"}
              </button>
              <button onClick={handleCancel} style={{ padding: "10px 20px", background: "#f5f5f5", color: "#333", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <section className="artisans-section">
          <div className="artisans-header">
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#333" }}>
              Current Artisans ({artisans.length})
            </h3>
          </div>
          <div className="artisans-grid">
            {artisans.map(artisan => (
              <article key={artisan.id} className="artisan-card">
                <div className="artisan-card-image">
                  {artisan.image ? (
                    <img src={artisan.image} alt={artisan.name} />
                  ) : (
                    <div className="artisan-card-image-placeholder" />
                  )}
                </div>

                <div className="artisan-card-content">
                  <div className="artisan-card-header">
                    <h4 className="artisan-card-name">{artisan.name}</h4>
                    <div className="artisan-card-meta">
                      <p className="artisan-card-location">📍 {artisan.location}</p>
                      <span className="artisan-card-craft">{artisan.craft}</span>
                    </div>
                  </div>

                  <p className="artisan-card-story">{artisan.story?.substring(0, 100)}...</p>

                  <div className="artisan-card-actions">
                    <button 
                      onClick={() => handleEdit(artisan)}
                      className="artisan-btn artisan-btn--primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(artisan.id)}
                      className="artisan-btn artisan-btn--danger"
                      disabled={savingArtisans}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <style jsx>{`
            .artisans-section {
              background: white;
              border: 1px solid #e0e0e0;
              border-radius: 12px;
              padding: 1.5rem;
              margin-top: 1.5rem;
            }

            .artisans-header {
              margin-bottom: 1.5rem;
              padding-bottom: 1rem;
              border-bottom: 2px solid #f5f5f5;
            }

            .artisans-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
              gap: 1.25rem;
            }

            .artisan-card {
              background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
              border: 1px solid #e8e8e8;
              border-radius: 10px;
              overflow: hidden;
              transition: all 0.3s ease;
              display: flex;
              flex-direction: column;
            }

            .artisan-card:hover {
              border-color: #d4a574;
              box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
              transform: translateY(-2px);
            }

            .artisan-card-image {
              width: 100%;
              height: 160px;
              overflow: hidden;
              background: #f5f5f5;
              position: relative;
            }

            .artisan-card-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .artisan-card-image-placeholder {
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
            }

            .artisan-card-content {
              padding: 1rem;
              display: flex;
              flex-direction: column;
              flex: 1;
            }

            .artisan-card-header {
              margin-bottom: 0.75rem;
              padding-bottom: 0.75rem;
              border-bottom: 1px solid #f0f0f0;
            }

            .artisan-card-name {
              margin: 0;
              font-size: 0.95rem;
              font-weight: 600;
              color: #333;
            }

            .artisan-card-meta {
              margin-top: 0.5rem;
              display: flex;
              gap: 0.5rem;
              align-items: center;
              flex-wrap: wrap;
            }

            .artisan-card-location {
              margin: 0;
              font-size: 0.75rem;
              color: #999;
            }

            .artisan-card-craft {
              display: inline-block;
              font-size: 0.7rem;
              font-weight: 600;
              background: #fffbf0;
              color: #d4a574;
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }

            .artisan-card-story {
              margin: 0 0 0.75rem 0;
              font-size: 0.8rem;
              color: #666;
              line-height: 1.4;
              flex: 1;
            }

            .artisan-card-actions {
              display: flex;
              gap: 0.5rem;
            }

            .artisan-btn {
              flex: 1;
              padding: 0.6rem 0.75rem;
              border: 1px solid #ddd;
              border-radius: 6px;
              font-size: 0.75rem;
              font-weight: 600;
              background: white;
              color: #666;
              cursor: pointer;
              transition: all 0.2s ease;
            }

            .artisan-btn:hover:not(:disabled) {
              border-color: #d4a574;
              color: #d4a574;
              background: #fffbf0;
            }

            .artisan-btn--primary {
              background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
              color: white;
              border: none;
            }

            .artisan-btn--primary:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
            }

            .artisan-btn--danger {
              background: #fee2e2;
              color: #991b1b;
              border-color: #fca5a5;
            }

            .artisan-btn--danger:hover:not(:disabled) {
              background: #fecaca;
              border-color: #f87171;
            }

            .artisan-btn:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            @media (max-width: 1200px) {
              .artisans-grid {
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
              }
            }

            @media (max-width: 768px) {
              .artisans-grid {
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
              }

              .artisan-card-image {
                height: 140px;
              }

              .artisan-card-content {
                padding: 0.75rem;
              }
            }
          `}</style>
        </section>
      </div>
    </AdminLayout>
  );
}
