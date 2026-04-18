import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

const DEFAULT_ARTISAN = {
  name: "",
  location: "",
  craft: "",
  image: "",
  story: "",
  href: ""
};

export default function AdminArtisansPage() {
  const [artisans, setArtisans] = useState([
    { id: 1, name: "Nafula Wambui", location: "Karatina, Nyeri County", craft: "Jewellery", image: "", story: "Nafula creates beadwork with a balanced, ceremonial feel.", href: "/shop?category=Jewellery" },
    { id: 2, name: "Achieng Atieno", location: "Kisumu County", craft: "Earrings", image: "", story: "Achieng focuses on lighter jewellery meant to move well with the body.", href: "/shop?category=Jewellery&jewelryType=earring" },
    { id: 3, name: "Muthoni Wairimu", location: "Nairobi", craft: "Necklaces", image: "", story: "Muthoni's necklace work leans toward bold centerpieces and bridal styling.", href: "/shop?category=Jewellery&jewelryType=necklace" },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_ARTISAN);
  const [message, setMessage] = useState("");
  const [availableImages, setAvailableImages] = useState([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    fetch("/api/admin/artisan-images")
      .then(res => res.json())
      .then(data => {
        setAvailableImages(data.images || []);
        setLoadingImages(false);
      })
      .catch(() => setLoadingImages(false));
  }, []);

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

  function handleDelete(id) {
    if (confirm("Delete this artisan?")) {
      setArtisans(artisans.filter(a => a.id !== id));
      setMessage("Artisan deleted");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  function handleSave() {
    if (!formData.name || !formData.story) {
      setMessage("Name and story are required");
      return;
    }

    if (editingId) {
      setArtisans(artisans.map(a => a.id === editingId ? { ...formData } : a));
      setMessage("Artisan updated!");
    } else {
      setArtisans([...artisans, { ...formData, id: Date.now() }]);
      setMessage("New artisan added!");
    }

    setEditingId(null);
    setShowForm(false);
    setFormData(DEFAULT_ARTISAN);
    setShowImagePicker(false);
    setTimeout(() => setMessage(""), 3000);
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
              Copy this JSON to update artisans in data/site.js later:
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
                {formData.image && (
                  <button type="button" onClick={() => setFormData({...formData, image: ""})} style={{ padding: "8px 16px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer" }}>
                    Remove
                  </button>
                )}
              </div>
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
              <button onClick={handleSave} style={{ padding: "10px 20px", background: "#C04D29", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
                {editingId ? "Save Changes" : "Add Artisan"}
              </button>
              <button onClick={handleCancel} style={{ padding: "10px 20px", background: "#f5f5f5", color: "#333", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <h3 style={{ marginBottom: 16 }}>Current Artisans ({artisans.length})</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {artisans.map(artisan => (
            <div key={artisan.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "white", border: "1px solid #e5e5e5", borderRadius: 6 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {artisan.image ? (
                  <img src={artisan.image} alt={artisan.name} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 60, height: 60, background: "#f5f5f5", borderRadius: 6 }} />
                )}
                <div>
                  <h4 style={{ marginBottom: 4 }}>{artisan.name}</h4>
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>{artisan.location} · {artisan.craft}</p>
                  <p style={{ fontSize: 14, color: "#666" }}>{artisan.story?.substring(0, 80)}...</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleEdit(artisan)} style={{ padding: "6px 12px", background: "#f5f5f5", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}>Edit</button>
                <button onClick={() => handleDelete(artisan.id)} style={{ padding: "6px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}