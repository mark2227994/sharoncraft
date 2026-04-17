import { useState } from "react";
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
  const [formData, setFormData] = useState(DEFAULT_ARTISAN);
  const [message, setMessage] = useState("");

  function handleNew() {
    setEditingId(null);
    setFormData({ ...DEFAULT_ARTISAN, id: Date.now() });
  }

  function handleEdit(artisan) {
    setEditingId(artisan.id);
    setFormData(artisan);
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
    setFormData(DEFAULT_ARTISAN);
    setTimeout(() => setMessage(""), 3000);
  }

  function handleCancel() {
    setEditingId(null);
    setFormData(DEFAULT_ARTISAN);
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

        {(editingId || !editingId && formData.name) && (
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
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Image URL</label>
                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: 6 }} />
              </div>
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
              <div>
                <h4 style={{ marginBottom: 4 }}>{artisan.name}</h4>
                <p style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>{artisan.location} · {artisan.craft}</p>
                <p style={{ fontSize: 14, color: "#666" }}>{artisan.story?.substring(0, 80)}...</p>
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