import { useState } from "react";

export default function BatchEditModal({ selectedIds, products, onClose, onSave }) {
  const [editMode, setEditMode] = useState("stock"); // stock, price, status
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
  const currentValues = selectedProducts.map((p) => {
    if (editMode === "stock") return p.stock;
    if (editMode === "price") return p.price;
    if (editMode === "status") return p.publishStatus;
    return null;
  });

  async function handleSave() {
    if (!editValue && editMode !== "status") {
      setError("Please enter a value");
      return;
    }

    setLoading(true);
    setError("");

    const updates = {};
    if (editMode === "stock") {
      updates.stock = Math.max(0, parseInt(editValue, 10));
    } else if (editMode === "price") {
      updates.price = Math.max(0, parseFloat(editValue));
    } else if (editMode === "status") {
      updates.publishStatus = editValue;
    }

    try {
      const response = await fetch("/api/admin/batch-edit-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          productIds: selectedIds,
          updates,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update");

      onSave();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="admin-panel"
        style={{
          background: "#fff",
          maxWidth: "400px",
          width: "90%",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 16px 0" }}>
          Edit {selectedIds.length} Product{selectedIds.length !== 1 ? "s" : ""}
        </h3>

        <div style={{ marginBottom: "16px" }}>
          <p className="body-sm" style={{ marginBottom: "8px", fontWeight: "bold" }}>
            What to update?
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {["stock", "price", "status"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setEditMode(mode);
                  setEditValue("");
                  setError("");
                }}
                style={{
                  padding: "8px 12px",
                  background: editMode === mode ? "#673AB7" : "#f0f0f0",
                  color: editMode === mode ? "#fff" : "#333",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
              >
                {mode === "stock" ? "Stock" : mode === "price" ? "Price" : "Status"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <p className="body-sm" style={{ marginBottom: "8px", color: "#666" }}>
            {editMode === "stock" && "New stock level"}
            {editMode === "price" && "New price (KES)"}
            {editMode === "status" && "New visibility"}
          </p>

          {editMode === "status" ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "0.875rem",
              }}
            >
              <option value="">-- Select Status --</option>
              <option value="published">Published (Visible)</option>
              <option value="draft">Draft (Hidden)</option>
            </select>
          ) : (
            <input
              type={editMode === "price" ? "number" : "number"}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={editMode === "price" ? "0.00" : "0"}
              min="0"
              step={editMode === "price" ? "0.01" : "1"}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          )}
        </div>

        {error && <p style={{ color: "#D32F2F", fontSize: "0.875rem", marginBottom: "12px" }}>❌ {error}</p>}

        <p className="body-xs" style={{ color: "#999", marginBottom: "16px" }}>
          {selectedProducts.length} products selected
        </p>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="admin-button"
            onClick={handleSave}
            disabled={loading || !editValue}
            style={{ flex: 1, background: "#673AB7" }}
          >
            {loading ? "Updating..." : "Update All"}
          </button>
          <button
            type="button"
            className="admin-button admin-button--secondary"
            onClick={onClose}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
