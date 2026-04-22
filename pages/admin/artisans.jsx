import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

const DEFAULT_ARTISAN = {
  name: "",
  location: "",
  craft: "",
  image: "",
  story: "",
  quote: "",
  yearsExperience: "",
  specialties: "",
  whatsapp: "",
  featured: false,
  mediaGallery: [],
  href: "",
};

const STORY_TEMPLATES = {
  custom: {
    label: "Custom - Write your own",
    text: ""
  },
  jewellery_heritage: {
    category: "Jewellery",
    label: "Jewellery - Heritage General",
    text: "[Name] draws from Kenyan beading traditions to create jewelry that celebrates authentic craftsmanship. Each piece is handmade with care, honoring heritage while bringing contemporary elegance to every detail."
  },
  jewellery_ceremonial: {
    category: "Jewellery",
    label: "Jewellery - Ceremonial Bold",
    text: "[Name] specializes in ceremonial beadwork that blends traditional Kenyan aesthetics with bold, balanced color. Each piece is crafted to celebrate significant moments and cultural heritage."
  },
  jewellery_playful: {
    category: "Jewellery",
    label: "Jewellery - Playful Elegance",
    text: "[Name] creates jewelry designed to move well with the body. Drawing from Kenyan traditions, their work brings playful elegance and contemporary style to every handmade piece."
  },
  jewellery_minimalist: {
    category: "Jewellery",
    label: "Jewellery - Minimalist",
    text: "[Name] believes in the power of simplicity. Their jewelry celebrates clean lines and refined craftsmanship, honoring Kenyan beading heritage with a contemporary, understated approach."
  },
  necklace_statement: {
    category: "Necklaces",
    label: "Necklaces - Statement Pieces",
    text: "[Name] creates bold centerpiece necklaces that demand attention. Their work draws from Kenyan traditions while bringing dramatic flair and contemporary vision to each handmade piece."
  },
  necklace_bridal: {
    category: "Necklaces",
    label: "Necklaces - Bridal",
    text: "[Name] specializes in bridal necklaces that capture both tradition and elegance. Each piece is thoughtfully crafted to be the perfect complement for meaningful occasions and celebrations."
  },
  necklace_layerable: {
    category: "Necklaces",
    label: "Necklaces - Layerable",
    text: "[Name] designs necklaces meant to layer and mix. Drawing from Kenyan beading traditions, their work offers flexibility and contemporary style for everyday wear."
  },
  bracelet_bold: {
    category: "Bracelets",
    label: "Bracelets - Bold & Balanced",
    text: "[Name] creates bracelets that balance bold color with wearable elegance. Each piece is handmade with traditional Kenyan techniques, perfect for making a quiet statement."
  },
  bracelet_stacking: {
    category: "Bracelets",
    label: "Bracelets - Stackable",
    text: "[Name] designs bracelets meant to be worn in multiples. Their work celebrates Kenyan beading heritage through pieces that stack beautifully and tell stories together."
  },
  bracelet_everyday: {
    category: "Bracelets",
    label: "Bracelets - Everyday",
    text: "[Name] crafts bracelets designed for daily wear. Honoring traditional Kenyan techniques, their work brings timeless elegance to your everyday style."
  },
  earring_movement: {
    category: "Earrings",
    label: "Earrings - Movement",
    text: "[Name] specializes in earrings that move with you. Their designs celebrate lightweight elegance and Kenyan beading heritage, perfect for those who love dynamic jewelry."
  },
  earring_statement: {
    category: "Earrings",
    label: "Earrings - Statement",
    text: "[Name] creates statement earrings that frame the face beautifully. Drawing from Kenyan traditions, each pair is handcrafted with bold color and confident design."
  },
  earring_delicate: {
    category: "Earrings",
    label: "Earrings - Delicate",
    text: "[Name] designs delicate earrings that bring subtle beauty to your look. Their work honors Kenyan beading traditions with refined craftsmanship and gentle elegance."
  },
  homedecor_wall: {
    category: "Home Decor",
    label: "Home Decor - Wall Art",
    text: "[Name] brings Kenyan beading traditions into your home through thoughtfully designed wall pieces. Each creation celebrates cultural heritage while adding warmth and character to any space."
  },
  homedecor_functional: {
    category: "Home Decor",
    label: "Home Decor - Functional",
    text: "[Name] creates functional home pieces that honor Kenyan craftsmanship. From decorative holders to woven accents, each item brings both beauty and purpose to your everyday life."
  },
  homedecor_accent: {
    category: "Home Decor",
    label: "Home Decor - Accent Pieces",
    text: "[Name] designs accent pieces that become focal points in any room. Their work celebrates Kenyan beading and weaving traditions, bringing artisanal beauty to contemporary homes."
  },
  philosophy_story: {
    category: "Philosophy",
    label: "Philosophy - Story-Driven",
    text: "[Name] believes every piece should tell a story and stand the test of time. Their approach focuses on meaningful craftsmanship, resulting in jewelry that feels both personal and timeless."
  },
  philosophy_timeless: {
    category: "Philosophy",
    label: "Philosophy - Timeless Quality",
    text: "[Name] is committed to creating pieces meant to be treasured for generations. Each handmade item reflects thoughtful design and unwavering attention to quality craftsmanship."
  },
  specialist_color: {
    category: "Specialist",
    label: "Specialist - Master of Color",
    text: "[Name] specializes in color combinations that celebrate Kenyan heritage and contemporary vision. Their expertise lies in creating harmonious, eye-catching pieces through bold, balanced design."
  },
  specialist_technique: {
    category: "Specialist",
    label: "Specialist - Master Craftsperson",
    text: "[Name] is a master of [technique]. Their deep knowledge of traditional Kenyan methods brings exceptional skill to every piece, resulting in jewelry that shows generations of craftsmanship."
  },
};

const DEFAULT_ARTISANS = [
  {
    id: 1,
    name: "Nafula Wambui",
    location: "Karatina, Nyeri County",
    craft: "Jewellery",
    image: "",
    story: "Nafula creates beadwork with a balanced, ceremonial feel.",
    quote: "Every bead must feel like it belongs to the hand that wears it.",
    yearsExperience: "15+",
    specialties: "Ceremonial beadwork, bold color",
    whatsapp: "",
    featured: true,
    mediaGallery: [],
    href: "/shop?category=Jewellery",
  },
  {
    id: 2,
    name: "Achieng Atieno",
    location: "Kisumu County",
    craft: "Earrings",
    image: "",
    story: "Achieng focuses on lighter jewellery meant to move well with the body.",
    quote: "Lighter jewelry meant to move well with the body.",
    yearsExperience: "12+",
    specialties: "Earrings, playful elegance",
    whatsapp: "",
    featured: false,
    mediaGallery: [],
    href: "/shop?category=Jewellery&jewelryType=earring",
  },
  {
    id: 3,
    name: "Muthoni Wairimu",
    location: "Nairobi",
    craft: "Necklaces",
    image: "",
    story: "Muthoni's necklace work leans toward bold centerpieces and bridal styling.",
    quote: "I never want a piece to look repeated, only remembered.",
    yearsExperience: "18+",
    specialties: "Home decor, bold pieces",
    whatsapp: "",
    featured: false,
    mediaGallery: [],
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
    quote: String(entry?.quote || "").trim(),
    yearsExperience: String(entry?.yearsExperience || "").trim(),
    specialties: String(entry?.specialties || "").trim(),
    whatsapp: String(entry?.whatsapp || "").trim(),
    featured: Boolean(entry?.featured),
    mediaGallery: Array.isArray(entry?.mediaGallery) ? entry.mediaGallery : [],
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
    quote: artisan.quote,
    yearsExperience: artisan.yearsExperience,
    specialties: artisan.specialties,
    whatsapp: artisan.whatsapp,
    featured: artisan.featured,
    mediaGallery: artisan.mediaGallery,
    href: artisan.href,
  }));
}

export default function AdminArtisansPage() {
  const fileInputRef = useRef(null);
  const [artisans, setArtisans] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_ARTISAN);
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
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
      setArtisans(parsed);
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
    setSelectedTemplate("custom");
    setShowImagePicker(false);
  }

  function handleEdit(artisan) {
    setEditingId(artisan.id);
    setFormData(artisan);
    setSelectedTemplate("custom");
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
    setSelectedTemplate("custom");
    setShowImagePicker(false);
  }

  function handleCancel() {
    setEditingId(null);
    setShowForm(false);
    setFormData(DEFAULT_ARTISAN);
    setSelectedTemplate("custom");
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
              {String(formData.image || "").startsWith("/uploads/") ? (
                <p style={{ marginTop: 8, color: "#b45309", fontSize: 12 }}>
                  Legacy path detected (`/uploads/...`). Please re-upload this image.
                </p>
              ) : null}
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
              <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Story Template *</label>
              <select 
                value={selectedTemplate} 
                onChange={(e) => {
                  const templateKey = e.target.value;
                  const template = STORY_TEMPLATES[templateKey];
                  setSelectedTemplate(templateKey);
                  if (template && template.text) {
                    setFormData({...formData, story: template.text});
                  } else {
                    setFormData({...formData, story: ""});
                  }
                }}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 14, marginBottom: 12 }}
              >
                <option value="custom">{STORY_TEMPLATES.custom.label}</option>
                
                <optgroup label="— Jewellery —">
                  {Object.entries(STORY_TEMPLATES)
                    .filter(([_, t]) => t.category === "Jewellery")
                    .map(([key, template]) => (
                      <option key={key} value={key}>{template.label}</option>
                    ))}
                </optgroup>
                
                <optgroup label="— Necklaces —">
                  {Object.entries(STORY_TEMPLATES)
                    .filter(([_, t]) => t.category === "Necklaces")
                    .map(([key, template]) => (
                      <option key={key} value={key}>{template.label}</option>
                    ))}
                </optgroup>
                
                <optgroup label="— Bracelets —">
                  {Object.entries(STORY_TEMPLATES)
                    .filter(([_, t]) => t.category === "Bracelets")
                    .map(([key, template]) => (
                      <option key={key} value={key}>{template.label}</option>
                    ))}
                </optgroup>
                
                <optgroup label="— Earrings —">
                  {Object.entries(STORY_TEMPLATES)
                    .filter(([_, t]) => t.category === "Earrings")
                    .map(([key, template]) => (
                      <option key={key} value={key}>{template.label}</option>
                    ))}
                </optgroup>
                
                <optgroup label="— Home Decor —">
                  {Object.entries(STORY_TEMPLATES)
                    .filter(([_, t]) => t.category === "Home Decor")
                    .map(([key, template]) => (
                      <option key={key} value={key}>{template.label}</option>
                    ))}
                </optgroup>
                
                <optgroup label="— Philosophy —">
                  {Object.entries(STORY_TEMPLATES)
                    .filter(([_, t]) => t.category === "Philosophy")
                    .map(([key, template]) => (
                      <option key={key} value={key}>{template.label}</option>
                    ))}
                </optgroup>
                
                <optgroup label="— Specialist —">
                  {Object.entries(STORY_TEMPLATES)
                    .filter(([_, t]) => t.category === "Specialist")
                    .map(([key, template]) => (
                      <option key={key} value={key}>{template.label}</option>
                    ))}
                </optgroup>
              </select>
              
              <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Story Text *</label>
              <textarea 
                value={formData.story} 
                onChange={e => setFormData({...formData, story: e.target.value})} 
                rows={4} 
                placeholder="Choose a template above, then customize here..."
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: 6, resize: "vertical", fontSize: 14 }} 
              />
              <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Keep it 1-2 sentences. Focus on heritage, craft style, or philosophy.</p>
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
            <button
              type="button"
              onClick={handleNew}
              className="artisan-btn artisan-btn--header"
              disabled={savingArtisans}
            >
              Add Artisan
            </button>
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
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 0.75rem;
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

            .artisan-btn--header {
              flex: 0 0 auto;
              min-width: 130px;
              background: #C04D29;
              color: #fff;
              border-color: #C04D29;
            }

            .artisan-btn--header:hover:not(:disabled) {
              background: #a43f21;
              border-color: #a43f21;
              color: #fff;
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
              .artisans-header {
                align-items: stretch;
                flex-direction: column;
              }

              .artisan-btn--header {
                width: 100%;
              }

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
