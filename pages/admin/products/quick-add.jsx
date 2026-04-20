import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";
import SeoHead from "../../../components/SeoHead";
import { categoryOptions } from "../../../data/site";
import { validateQuickAddForm, checkDuplicateProduct } from "../../../lib/product-validation";
import { processImageFile, formatFileSize } from "../../../lib/image-optimization";

export default function QuickAddProductPage() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Jewellery",
    image: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [savedId, setSavedId] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState({ loading: true, configured: false });
  const [imageInfo, setImageInfo] = useState({ original: 0, compressed: 0 });
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const fileInputRef = useRef(null);

  // Check AI status on mount
  useEffect(() => {
    let ignore = false;
    async function checkAI() {
      try {
        const response = await fetch("/api/admin/ai-status", {
          credentials: "same-origin",
        });
        const data = await response.json().catch(() => ({}));
        if (!ignore) {
          setAiStatus({
            loading: false,
            configured: Boolean(data?.configured),
          });
        }
      } catch {
        if (!ignore) {
          setAiStatus({ loading: false, configured: false });
        }
      }
    }
    checkAI();
    return () => { ignore = true; };
  }, []);

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    
    try {
      const result = await processImageFile(file);
      setForm({ ...form, image: result.base64 });
      setImageInfo({
        original: result.originalSize,
        compressed: result.compressedSize,
        ratio: result.compressionRatio,
      });
    } catch (err) {
      setError(err.message || "Failed to process image");
    }
  }

  async function handleAIGenerate() {
    if (!form.image) {
      setError("Please upload an image first");
      return;
    }

    setAiLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/generate-product-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: form.name || "Unknown Product",
          category: form.category,
          image: form.image,
          notes: "Quick product generation from image",
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "AI generation failed");
      }

      // Apply AI suggestions
      const suggestions = data.suggestions || {};
      setForm({
        ...form,
        name: suggestions.suggestedName || form.name,
        price: suggestions.suggestedPrice ? String(suggestions.suggestedPrice) : form.price,
        category: suggestions.category || form.category,
      });
      
      setMessage("✓ AI suggestions applied! Review price and adjust if needed.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Could not generate with AI");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    
    // Clear previous errors
    setError("");
    setMessage("");
    setValidationErrors({});

    // Validate form
    const validation = validateQuickAddForm(form);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setError(Object.values(validation.errors)[0] || "Please fix the errors below");
      return;
    }

    // Check for duplicates
    setCheckingDuplicate(true);
    try {
      const isDuplicate = await checkDuplicateProduct(form.name);
      if (isDuplicate) {
        setError("A product with this name already exists");
        setCheckingDuplicate(false);
        return;
      }
    } catch (err) {
      console.error("Error checking duplicate:", err);
      // Continue anyway - duplicate check is not critical
    }
    setCheckingDuplicate(false);

    setSaving(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: form.name.trim(),
          price: parseFloat(form.price),
          category: form.category,
          publishStatus: "draft",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save product");
      }

      const data = await response.json();
      const newProduct = data.products?.[0];
      setSavedId(newProduct?.id || "");
      setMessage(`✓ Product "${form.name}" added successfully!`);
      
      // Reset form
      setForm({ name: "", price: "", category: "Jewellery", image: "" });
      setImageInfo({ original: 0, compressed: 0 });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SeoHead
        title="Quick Add Product | SharonCraft Admin"
        description="Quickly add a new product"
        path="/admin/products/quick-add"
      />
      <AdminLayout title="Quick Add Product">
        <style>{`
          .quick-add-container {
            max-width: 500px;
            margin: 0 auto;
          }

          .quick-add-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 32px;
            margin-bottom: 24px;
          }

          .quick-add-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .quick-add-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .quick-add-label {
            font-weight: 500;
            font-size: 14px;
            color: #333;
          }

          .quick-add-input,
          .quick-add-select {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
            transition: border-color 0.2s;
          }

          .quick-add-input:focus,
          .quick-add-select:focus {
            outline: none;
            border-color: #C04D29;
            box-shadow: 0 0 0 3px rgba(192, 77, 41, 0.1);
          }

          .quick-add-buttons {
            display: flex;
            gap: 12px;
            margin-top: 24px;
          }

          .quick-add-btn {
            flex: 1;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }

          .quick-add-btn-save {
            background: #C04D29;
            color: white;
          }

          .quick-add-btn-save:hover:not(:disabled) {
            background: #a63e20;
          }

          .quick-add-btn-save:disabled {
            background: #ccc;
            cursor: not-allowed;
          }

          .quick-add-btn-cancel {
            background: #f5f5f5;
            color: #333;
          }

          .quick-add-btn-cancel:hover {
            background: #e8e8e8;
          }

          .quick-add-message {
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .quick-add-message.success {
            background: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #4caf50;
          }

          .quick-add-message.error {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #f44336;
          }

          .quick-add-hint {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }

          .quick-add-tips {
            background: #f9f9f9;
            border-left: 3px solid #C04D29;
            padding: 16px;
            border-radius: 4px;
            margin-top: 24px;
          }

          .quick-add-tips h3 {
            margin: 0 0 12px 0;
            font-size: 13px;
            font-weight: 600;
            color: #333;
          }

          .quick-add-tips ul {
            margin: 0;
            padding-left: 20px;
            font-size: 13px;
            color: #666;
            line-height: 1.6;
          }

          .quick-add-tips li {
            margin: 6px 0;
          }

          .quick-add-link {
            color: #C04D29;
            text-decoration: none;
            font-weight: 500;
          }

          .quick-add-link:hover {
            text-decoration: underline;
          }

          .quick-add-after-save {
            display: flex;
            gap: 12px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #eee;
          }

          .quick-add-after-save a,
          .quick-add-after-save button {
            flex: 1;
            padding: 10px;
            text-align: center;
            font-size: 13px;
            text-decoration: none;
            border-radius: 4px;
            border: 1px solid #ddd;
            background: white;
            color: #333;
            cursor: pointer;
            transition: all 0.2s;
          }

          .quick-add-after-save a:hover,
          .quick-add-after-save button:hover {
            background: #f5f5f5;
          }
        `}</style>

        <div className="quick-add-container">
          <div className="quick-add-card">
            {message && (
              <div className="quick-add-message success">
                <span>✓ {message}</span>
                {savedId && (
                  <div className="quick-add-after-save">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ name: "", price: "", category: "Jewellery", image: "" });
                        setMessage("");
                        setSavedId("");
                      }}
                    >
                      + Add Another
                    </button>
                    <Link href={`/admin/products/${savedId}`}>
                      Edit Details →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="quick-add-message error">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="quick-add-form">
              <div className="quick-add-field">
                <label className="quick-add-label">Product Image (Optional)</label>
                <div style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start"
                }}>
                  <div style={{ flex: 1 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="quick-add-input"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        cursor: "pointer",
                        background: "white"
                      }}
                    >
                      {form.image ? "✓ Image selected" : "📤 Choose image"}
                    </button>
                  </div>
                  {form.image && aiStatus.configured && (
                    <button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={aiLoading}
                      style={{
                        padding: "12px 16px",
                        background: "#673AB7",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: aiLoading ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        opacity: aiLoading ? 0.7 : 1
                      }}
                    >
                      {aiLoading ? "🤖 Generating..." : "✨ AI Name"}
                    </button>
                  )}
                </div>
                {form.image && (
                  <div>
                    <img
                      src={form.image}
                      alt="Preview"
                      style={{
                        marginTop: "12px",
                        maxWidth: "100%",
                        maxHeight: "200px",
                        borderRadius: "6px",
                        border: "1px solid #ddd"
                      }}
                    />
                    {imageInfo.original > 0 && (
                      <p className="quick-add-hint" style={{ marginTop: "8px", fontSize: "12px" }}>
                        Original: {formatFileSize(imageInfo.original)} → Optimized: {formatFileSize(imageInfo.compressed)} 
                        {imageInfo.ratio > 0 && ` (${imageInfo.ratio}% smaller)`}
                      </p>
                    )}
                  </div>
                )}
                <div className="quick-add-hint">
                  {aiStatus.loading 
                    ? "Checking AI..." 
                    : aiStatus.configured
                      ? "Upload a photo to generate product name and category with AI"
                      : "AI is not available in this environment"}
                </div>
              </div>

              <div className="quick-add-field">
                <label className="quick-add-label">Product Name *</label>
                <input
                  type="text"
                  className="quick-add-input"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    setValidationErrors({ ...validationErrors, name: "" });
                  }}
                  placeholder="e.g. Maasai Beaded Bracelet"
                  autoFocus={!form.image}
                  style={{
                    borderColor: validationErrors.name ? "#f44336" : undefined,
                  }}
                />
                {validationErrors.name && (
                  <div className="quick-add-hint" style={{ color: "#f44336" }}>
                    ✗ {validationErrors.name}
                  </div>
                )}
                <div className="quick-add-hint">What is this product called? (3-120 characters)</div>
              </div>

              <div className="quick-add-field">
                <label className="quick-add-label">Price (KES) *</label>
                <input
                  type="number"
                  className="quick-add-input"
                  value={form.price}
                  onChange={(e) => {
                    setForm({ ...form, price: e.target.value });
                    setValidationErrors({ ...validationErrors, price: "" });
                  }}
                  placeholder="e.g. 8500"
                  min="0"
                  step="100"
                  style={{
                    borderColor: validationErrors.price ? "#f44336" : undefined,
                  }}
                />
                {validationErrors.price && (
                  <div className="quick-add-hint" style={{ color: "#f44336" }}>
                    ✗ {validationErrors.price}
                  </div>
                )}
                <div className="quick-add-hint">Selling price in Kenyan Shillings (KES 50 - KES 500,000)</div>
              </div>

              <div className="quick-add-field">
                <label className="quick-add-label">Category *</label>
                <select
                  className="quick-add-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="quick-add-hint">Where does this belong in the shop?</div>
              </div>

              <div className="quick-add-buttons">
                <button
                  type="submit"
                  className="quick-add-btn quick-add-btn-save"
                  disabled={saving || checkingDuplicate}
                >
                  {checkingDuplicate ? "Checking..." : saving ? "Saving..." : "Save Product"}
                </button>
                <Link href="/admin/products" className="quick-add-btn quick-add-btn-cancel">
                  Cancel
                </Link>
              </div>
            </form>

            <div className="quick-add-tips">
              <h3>What happens next?</h3>
              <ul>
                <li>Product saves as a <strong>Draft</strong> (not visible in shop yet)</li>
                <li>You can add photos, description, and more details later</li>
                <li>Click "<strong>Edit Details</strong>" to fill in the rest</li>
                <li>When ready, <strong>Publish</strong> to make it live</li>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <Link href="/admin/products" className="quick-add-link">
              ← Back to Products
            </Link>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
