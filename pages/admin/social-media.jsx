import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";
import SeoHead from "../../components/SeoHead";

export default function SocialMediaManagerPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [templates, setTemplates] = useState([]);
  const [library, setLibrary] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [liveProducts, setLiveProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [generatedCaptions, setGeneratedCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("Kenyan Cultural Heritage");

  // Template data
  const defaultTemplates = [
    {
      id: "earrings",
      name: "Earrings",
      template: "Introducing our new Uhuru Drop Earrings 💫 Handcrafted with love by Kenyan artisans. Each pair tells a story of African heritage and timeless beauty. Perfect for everyday elegance. Shop now! 🛍️ #SharonCraft #MaasaiJewelry #KenyanArt",
    },
    {
      id: "necklace",
      name: "Necklace",
      template: "Meet the Malkia Statement Necklace 👑 Bold, authentic, and unapologetically African. Hand-beaded with traditional Maasai techniques. Wear your culture, wear your pride. ✨ #SharonCraft #BeadedNecklace #KenyanCraft",
    },
    {
      id: "bracelet",
      name: "Bracelet",
      template: "Our Swahili-inspired bracelets are more than just jewelry—they're a celebration of heritage 🌍 Each bead is placed with intention. Each color tells a story. Which one speaks to you? #SharonCraft #AfricanJewelry #Handmade",
    },
    {
      id: "homedecor",
      name: "Home & Living",
      template: "Transform your space with authentic African home decor 🏠✨ Hand-woven by skilled artisans. Each piece brings warmth, color, and stories of Kenya into your home. Limited pieces available! #SharonCraft #HomeArt #KenyanCraft",
    },
    {
      id: "giftset",
      name: "Gifted Carry",
      template: "Looking for the perfect gift? 🎁 Our curated gift sets bring Kenyan craftsmanship and cultural beauty. Packaged with love, ready to give. Surprise someone special today! #SharonCraft #GiftIdeas #SupportLocal",
    },
  ];

  async function loadLibrary() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/social-media/library", {
        credentials: "same-origin",
      });
      const data = await response.json();
      setLibrary(data.captions || []);
    } catch (err) {
      console.error("Error loading library:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCalendar() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/social-media/calendar", {
        credentials: "same-origin",
      });
      const data = await response.json();
      setCalendar(data.posts || []);
    } catch (err) {
      console.error("Error loading calendar:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/social-media/products", {
        credentials: "same-origin",
      });
      const data = await response.json();
      setLiveProducts(data.products || []);
      if (data.total === 0) {
        setError("No published products found. Add products first!");
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function generateCaptionsForProducts() {
    if (selectedProducts.length === 0) {
      setError("Select at least one product");
      return;
    }

    setGenerating(true);
    setError("");
    setGeneratedCaptions([]);

    try {
      const captions = [];
      
      for (const productId of selectedProducts) {
        const product = liveProducts.find((p) => p.id === productId);
        if (!product) continue;

        const response = await fetch("/api/admin/generate-social-caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            productName: product.name,
            description: product.description,
            price: product.price,
            materials: product.materials,
            category: product.category,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          captions.push({
            productId,
            productName: product.name,
            caption: data.caption,
          });
        }
      }

      setGeneratedCaptions(captions);
      setMessage(`✓ Generated ${captions.length} captions!`);
    } catch (err) {
      setError(err.message || "Failed to generate captions");
    } finally {
      setGenerating(false);
    }
  }

  function toggleProductSelection(productId) {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  function selectAllByCategory(category) {
    const categoryProducts = liveProducts
      .filter((p) => p.category === category)
      .map((p) => p.id);
    
    const allSelected = categoryProducts.every((id) =>
      selectedProducts.includes(id)
    );

    if (allSelected) {
      setSelectedProducts((prev) =>
        prev.filter((id) => !categoryProducts.includes(id))
      );
    } else {
      setSelectedProducts((prev) => [
        ...new Set([...prev, ...categoryProducts]),
      ]);
    }
  }

  async function saveCaption(caption) {
    try {
      const response = await fetch("/api/admin/social-media/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(caption),
      });

      if (!response.ok) throw new Error("Failed to save");

      setMessage("✓ Caption saved!");
      setTimeout(() => setMessage(""), 2000);
      await loadLibrary();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteCaption(id) {
    if (!confirm("Delete this caption?")) return;

    try {
      const response = await fetch(`/api/admin/social-media/library?id=${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setMessage("✓ Caption deleted!");
      setTimeout(() => setMessage(""), 2000);
      await loadLibrary();
    } catch (err) {
      setError(err.message);
    }
  }

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
    setMessage("✓ Copied to clipboard!");
    setTimeout(() => setMessage(""), 1500);
  }

  useEffect(() => {
    if (activeTab === "library") loadLibrary();
    else if (activeTab === "calendar") loadCalendar();
    else if (activeTab === "products") loadProducts();
  }, [activeTab]);

  return (
    <>
      <SeoHead
        title="Social Media Manager | SharonCraft Admin"
        description="Manage social media captions, templates, and calendar"
        path="/admin/social-media"
      />
      <AdminLayout title="Social Media Manager">
        <style>{`
          .social-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .social-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            border-bottom: 2px solid #eee;
          }

          .social-tab {
            padding: 12px 20px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            color: #999;
            border-bottom: 3px solid transparent;
            transition: all 0.2s;
          }

          .social-tab.active {
            color: #C04D29;
            border-bottom-color: #C04D29;
          }

          .social-tab:hover {
            color: #333;
          }

          .social-message {
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .social-message.success {
            background: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #4caf50;
          }

          .social-message.error {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #f44336;
          }

          .social-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
          }

          .social-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .social-card h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }

          .social-card-text {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 16px;
            font-style: italic;
            border-left: 3px solid #C04D29;
            padding-left: 12px;
          }

          .social-card-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .social-btn {
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .social-btn-primary {
            background: #C04D29;
            color: white;
          }

          .social-btn-primary:hover {
            background: #a63e20;
          }

          .social-btn-secondary {
            background: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
          }

          .social-btn-secondary:hover {
            background: #eee;
          }

          .social-btn-danger {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #f44336;
          }

          .social-btn-danger:hover {
            background: #ffcdd2;
          }

          .social-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }

          .social-table thead {
            background: #f5f5f5;
          }

          .social-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #666;
            border-bottom: 1px solid #ddd;
          }

          .social-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
            color: #333;
          }

          .social-table tr:hover {
            background: #fafafa;
          }

          .social-empty {
            text-align: center;
            padding: 40px 20px;
            color: #999;
          }

          .social-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }

          .social-badge.instagram {
            background: #f0f0f0;
            color: #E4405F;
          }

          .social-badge.tiktok {
            background: #f0f0f0;
            color: #000;
          }

          .social-badge.whatsapp {
            background: #e8f5e9;
            color: #25d366;
          }

          .social-form {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
          }

          .social-form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
          }

          .social-form-group label {
            font-weight: 600;
            font-size: 14px;
            color: #333;
          }

          .social-form-group input,
          .social-form-group textarea,
          .social-form-group select {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
          }

          .social-form-group textarea {
            resize: vertical;
            min-height: 100px;
          }

          .social-form-group input:focus,
          .social-form-group textarea:focus,
          .social-form-group select:focus {
            outline: none;
            border-color: #C04D29;
            box-shadow: 0 0 0 3px rgba(192, 77, 41, 0.1);
          }

          .social-hint {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
        `}</style>

        <div className="social-container">
          {message && (
            <div className="social-message success">
              {message}
              <button onClick={() => setMessage("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>×</button>
            </div>
          )}

          {error && (
            <div className="social-message error">
              {error}
              <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>×</button>
            </div>
          )}

          {/* Tabs */}
          <div className="social-tabs">
            <button
              className={`social-tab ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              📦 Your Products
            </button>
            <button
              className={`social-tab ${activeTab === "templates" ? "active" : ""}`}
              onClick={() => setActiveTab("templates")}
            >
              📋 Templates
            </button>
            <button
              className={`social-tab ${activeTab === "library" ? "active" : ""}`}
              onClick={() => setActiveTab("library")}
            >
              📚 Library
            </button>
            <button
              className={`social-tab ${activeTab === "calendar" ? "active" : ""}`}
              onClick={() => setActiveTab("calendar")}
            >
              📅 Calendar
            </button>
            <button
              className={`social-tab ${activeTab === "guidelines" ? "active" : ""}`}
              onClick={() => setActiveTab("guidelines")}
            >
              ✨ Brand Guide
            </button>
          </div>

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <div>
              <p style={{ color: "#666", marginBottom: "24px" }}>
                Select your live products and generate Instagram captions in bulk. 
                {liveProducts.length === 0 && " (No published products yet - add them in Products page first)"}
              </p>

              {liveProducts.length > 0 && (
                <>
                  <div style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      style={{
                        padding: "10px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                    >
                      <option>Kenyan Cultural Heritage</option>
                      <option>Modern & Minimalist</option>
                      <option>Luxury Handmade</option>
                      <option>Community-Focused</option>
                    </select>
                    <button
                      onClick={generateCaptionsForProducts}
                      disabled={selectedProducts.length === 0 || generating}
                      style={{
                        padding: "10px 20px",
                        background: selectedProducts.length === 0 ? "#ccc" : "#673AB7",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: selectedProducts.length === 0 ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      {generating ? "🔄 Generating..." : `✨ Generate (${selectedProducts.length})`}
                    </button>
                  </div>

                  {/* Products by Category */}
                  {Object.entries(
                    liveProducts.reduce((acc, product) => {
                      if (!acc[product.category]) acc[product.category] = [];
                      acc[product.category].push(product);
                      return acc;
                    }, {})
                  ).map(([category, products]) => (
                    <div key={category} style={{ marginBottom: "24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "12px",
                          paddingBottom: "8px",
                          borderBottom: "2px solid #eee",
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                          {category} ({products.length})
                        </h3>
                        <button
                          onClick={() => selectAllByCategory(category)}
                          style={{
                            padding: "6px 12px",
                            background: products.every((p) =>
                              selectedProducts.includes(p.id)
                            )
                              ? "#C04D29"
                              : "#f5f5f5",
                            color: products.every((p) =>
                              selectedProducts.includes(p.id)
                            )
                              ? "white"
                              : "#333",
                            border:
                              products.every((p) =>
                                selectedProducts.includes(p.id)
                              ) === false
                                ? "1px solid #ddd"
                                : "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {products.every((p) =>
                            selectedProducts.includes(p.id)
                          )
                            ? "✓ All Selected"
                            : "Select All"}
                        </button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(300px, 1fr))",
                          gap: "12px",
                        }}
                      >
                        {products.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => toggleProductSelection(product.id)}
                            style={{
                              padding: "12px",
                              border: selectedProducts.includes(product.id)
                                ? "2px solid #C04D29"
                                : "1px solid #ddd",
                              borderRadius: "6px",
                              cursor: "pointer",
                              background: selectedProducts.includes(
                                product.id
                              )
                                ? "#fff5f0"
                                : "white",
                              transition: "all 0.2s",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(
                                  product.id
                                )}
                                onChange={() => {}}
                                style={{
                                  marginTop: "4px",
                                  cursor: "pointer",
                                  width: "18px",
                                  height: "18px",
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <p
                                  style={{
                                    margin: "0 0 4px 0",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    color: "#333",
                                  }}
                                >
                                  {product.name}
                                </p>
                                <p
                                  style={{
                                    margin: "0 0 8px 0",
                                    fontSize: "13px",
                                    color: "#666",
                                  }}
                                >
                                  KES {product.price?.toLocaleString()}
                                </p>
                                {product.materials && (
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: "12px",
                                      color: "#999",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    {product.materials}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Generated Captions */}
              {generatedCaptions.length > 0 && (
                <div style={{ marginTop: "32px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
                    ✨ Generated Captions
                  </h3>
                  <div className="social-grid">
                    {generatedCaptions.map((item, index) => (
                      <div key={index} className="social-card">
                        <h3>{item.productName}</h3>
                        <div className="social-card-text">{item.caption}</div>
                        <div className="social-card-actions">
                          <button
                            className="social-btn social-btn-primary"
                            onClick={() => {
                              navigator.clipboard.writeText(item.caption);
                              setMessage("✓ Copied!");
                              setTimeout(() => setMessage(""), 1500);
                            }}
                          >
                            📋 Copy
                          </button>
                          <button
                            className="social-btn social-btn-secondary"
                            onClick={() => saveCaption({ ...item, template: item.caption })}
                          >
                            💾 Save
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATES TAB */}
          {activeTab === "templates" && (
            <div>
              <p style={{ color: "#666", marginBottom: "24px" }}>
                Pre-made caption templates for different product types. Copy, customize, and use!
              </p>
              <div className="social-grid">
                {defaultTemplates.map((template) => (
                  <div key={template.id} className="social-card">
                    <h3>{template.name}</h3>
                    <div className="social-card-text">{template.template}</div>
                    <div className="social-card-actions">
                      <button
                        className="social-btn social-btn-primary"
                        onClick={() => copyToClipboard(template.template)}
                      >
                        📋 Copy
                      </button>
                      <button
                        className="social-btn social-btn-secondary"
                        onClick={() => saveCaption({ ...template, savedAt: new Date().toISOString() })}
                      >
                        💾 Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIBRARY TAB */}
          {activeTab === "library" && (
            <div>
              <p style={{ color: "#666", marginBottom: "24px" }}>
                Your saved captions. Reuse and adapt for new products.
              </p>
              {loading ? (
                <div className="social-empty">Loading...</div>
              ) : library.length === 0 ? (
                <div className="social-empty">
                  No captions saved yet. Save templates or create new ones!
                </div>
              ) : (
                <div className="social-grid">
                  {library.map((caption) => (
                    <div key={caption.id} className="social-card">
                      <h3>{caption.name || "Untitled"}</h3>
                      <div className="social-card-text">{caption.template || caption.caption}</div>
                      <p className="social-hint">
                        Saved {new Date(caption.savedAt).toLocaleDateString()}
                      </p>
                      <div className="social-card-actions">
                        <button
                          className="social-btn social-btn-primary"
                          onClick={() => copyToClipboard(caption.template || caption.caption)}
                        >
                          📋 Copy
                        </button>
                        <button
                          className="social-btn social-btn-danger"
                          onClick={() => deleteCaption(caption.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === "calendar" && (
            <div>
              <p style={{ color: "#666", marginBottom: "24px" }}>
                Plan your social media posts. Note: scheduling to platforms coming soon!
              </p>
              {loading ? (
                <div className="social-empty">Loading...</div>
              ) : calendar.length === 0 ? (
                <div className="social-empty">
                  No scheduled posts yet. Start planning your content!
                </div>
              ) : (
                <table className="social-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Platform</th>
                      <th>Caption Preview</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calendar.map((post) => (
                      <tr key={post.id}>
                        <td>{new Date(post.scheduledFor).toLocaleDateString()}</td>
                        <td>
                          <span className={`social-badge ${post.platform}`}>
                            {post.platform.toUpperCase()}
                          </span>
                        </td>
                        <td>{post.caption?.substring(0, 50)}...</td>
                        <td>{post.status || "Scheduled"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* BRAND GUIDELINES TAB */}
          {activeTab === "guidelines" && (
            <div>
              <div className="social-form">
                <h3>✨ SharonCraft Brand Voice</h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  <strong>Tone:</strong> Authentic, culturally proud, warm, and empowering
                </p>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  <strong>Keywords:</strong> African heritage, handmade, artisan, Kenyan, authentic, sustainable, cultural pride
                </p>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  <strong>Cultural References:</strong> Use Swahili & Maasai words naturally - Uhuru (freedom), Malkia (queen), Twiga (giraffe), Kijani (green), Swahili traditions
                </p>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  <strong>Always Include:</strong> #SharonCraft hashtag, call-to-action emoji, mention of handmade/artisan
                </p>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  <strong>Platforms:</strong> Instagram (primary), TikTok (trending), WhatsApp (community)
                </p>

                <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #ddd" }} />

                <h3>📱 Platform Tips</h3>
                <p style={{ color: "#666" }}>
                  <strong>Instagram:</strong> Use storytelling. Focus on artisan stories, behind-the-scenes, cultural significance.
                </p>
                <p style={{ color: "#666" }}>
                  <strong>TikTok:</strong> Keep it snappy. Show beadwork process, quick tips, trending sounds with cultural twist.
                </p>
                <p style={{ color: "#666" }}>
                  <strong>WhatsApp:</strong> Personal touch. Announce new items, special discounts, community updates.
                </p>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
