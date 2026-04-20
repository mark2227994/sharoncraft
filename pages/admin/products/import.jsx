import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";

export default function AdminImportProductsPage() {
  const [csvText, setCsvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  async function handleParse() {
    if (!csvText.trim()) {
      setError("Please paste CSV data");
      return;
    }

    setLoading(true);
    setError("");
    setPreview(null);

    try {
      const response = await fetch("/api/admin/import-products-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ csvData: csvText }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse CSV");
      }

      setPreview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!preview?.productsToImport) return;

    setImporting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          _bulkImport: true,
          products: preview.productsToImport,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      alert(`Successfully imported ${preview.productsToImport.length} products!`);
      setCsvText("");
      setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <AdminLayout title="Import Products from CSV">
      <div className="admin-panel">
        <div style={{ marginBottom: "var(--space-4)" }}>
          <p className="heading-sm" style={{ marginBottom: "8px" }}>
            Import Products via CSV
          </p>
          <p className="body-sm" style={{ marginBottom: "var(--space-3)" }}>
            Bulk import multiple products at once. CSV must have columns: name, price, category
          </p>

          <div className="admin-field">
            <span className="admin-label">Required Columns:</span>
            <code style={{ display: "block", padding: "8px", background: "#f5f5f5", borderRadius: "4px", fontSize: "12px" }}>
              name, price, category
            </code>
          </div>

          <div className="admin-field">
            <span className="admin-label">Optional Columns:</span>
            <code style={{ display: "block", padding: "8px", background: "#f5f5f5", borderRadius: "4px", fontSize: "12px" }}>
              description, materials, jewelryType, stock, artisanId, tags (semicolon-separated)
            </code>
          </div>

          <div className="admin-field">
            <span className="admin-label">Example CSV:</span>
            <pre style={{ 
              padding: "8px", 
              background: "#f5f5f5", 
              borderRadius: "4px", 
              fontSize: "11px",
              overflow: "auto"
            }}>
name,price,category,jewelryType,description,materials,stock
Gold Maasai Necklace,15000,Jewellery,necklace,Hand-beaded statement necklace,Beads;Gold,5
Burgundy Bracelet,8000,Jewellery,bracelet,Bold statement piece,Beads;Leather,3
Home Decor Set,12000,Home Decor,,Beautiful centerpiece,Beads;Wood,2
            </pre>
          </div>

          <div className="admin-field">
            <span className="admin-label">Paste CSV Data:</span>
            <textarea
              className="admin-textarea"
              rows={12}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="name,price,category
Gold Maasai Necklace,15000,Jewellery
Burgundy Bracelet,8000,Jewellery"
            />
          </div>

          {error && (
            <p className="admin-form-error">{error}</p>
          )}

          <button
            type="button"
            className="admin-button"
            onClick={handleParse}
            disabled={loading}
          >
            {loading ? "Parsing..." : "Preview Import"}
          </button>
        </div>
      </div>

      {preview && (
        <div className="admin-panel" style={{ marginTop: "var(--space-4)" }}>
          <p className="heading-sm" style={{ marginBottom: "var(--space-3)" }}>
            Preview: {preview.totalCount} products ready to import
          </p>

          {preview.errors && preview.errors.length > 0 && (
            <div style={{ 
              padding: "12px", 
              background: "rgba(255, 152, 0, 0.1)", 
              border: "1px solid #FF9800",
              borderRadius: "4px",
              marginBottom: "var(--space-3)"
            }}>
              <p className="caption" style={{ marginBottom: "6px", color: "#E65100", fontWeight: "bold" }}>
                ⚠️ {preview.errors.length} errors found:
              </p>
              {preview.errors.map((err, idx) => (
                <p key={idx} className="caption" style={{ color: "#E65100", margin: "4px 0" }}>
                  • {err}
                </p>
              ))}
            </div>
          )}

          <div style={{ maxHeight: "400px", overflow: "auto", marginBottom: "var(--space-3)" }}>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse",
              fontSize: "12px"
            }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ddd" }}>Name</th>
                  <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ddd" }}>Price (KES)</th>
                  <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ddd" }}>Category</th>
                  <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ddd" }}>Type</th>
                  <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ddd" }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {preview.productsToImport.map((product, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "8px" }}>{product.name}</td>
                    <td style={{ padding: "8px" }}>{product.price.toLocaleString()}</td>
                    <td style={{ padding: "8px" }}>{product.category}</td>
                    <td style={{ padding: "8px" }}>{product.jewelryType || "-"}</td>
                    <td style={{ padding: "8px" }}>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="admin-button"
            onClick={handleImport}
            disabled={importing}
            style={{ background: "#4CAF50" }}
          >
            {importing ? "Importing..." : `✓ Import ${preview.totalCount} Products`}
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
