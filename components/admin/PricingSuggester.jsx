import { useState } from "react";

export default function PricingSuggester({ name, description, materials, jewelryType, category, onApplyPrice }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [expanded, setExpanded] = useState(false);

  async function handleSuggest() {
    if (!name || !description) {
      setError("Add a product name and description first");
      return;
    }

    setLoading(true);
    setError("");
    setSuggestion(null);

    try {
      const response = await fetch("/api/admin/suggest-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, description, materials, jewelryType, category }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to suggest pricing");
      }

      setSuggestion(data.pricing);
      setExpanded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-panel" style={{ background: "rgba(76, 175, 80, 0.05)", border: "1px solid #4CAF50" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div>
          <p className="overline" style={{ marginBottom: "4px" }}>💰 AI Pricing Suggestion</p>
          <p className="caption">Analyze materials & craftsmanship to suggest optimal price</p>
        </div>
        <button
          type="button"
          className="admin-button admin-button--secondary"
          onClick={handleSuggest}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Get Price Suggestion"}
        </button>
      </div>

      {error && (
        <p className="admin-form-error" style={{ marginBottom: "12px" }}>
          {error}
        </p>
      )}

      {suggestion && (
        <div style={{ 
          padding: "12px", 
          background: "#fff",
          border: "1px solid #4CAF50",
          borderRadius: "4px",
          marginTop: "12px"
        }}>
          <p style={{ marginBottom: "8px", fontWeight: "bold", color: "#2E7D32" }}>
            Recommended Price: KES {suggestion.recommendedPrice?.toLocaleString() || "N/A"}
          </p>
          
          <div style={{ 
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "12px"
          }}>
            <div>
              <p className="caption" style={{ color: "#666" }}>Min Price (Safe)</p>
              <p className="heading-sm">KES {suggestion.minPrice?.toLocaleString() || "N/A"}</p>
            </div>
            <div>
              <p className="caption" style={{ color: "#666" }}>Max Price (Premium)</p>
              <p className="heading-sm">KES {suggestion.maxPrice?.toLocaleString() || "N/A"}</p>
            </div>
          </div>

          {suggestion.reasoning && (
            <p className="body-sm" style={{ 
              padding: "8px", 
              background: "#f9f9f9", 
              borderRadius: "4px",
              marginBottom: "12px",
              color: "#555"
            }}>
              <strong>Why?</strong> {suggestion.reasoning}
            </p>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="admin-button"
              onClick={() => {
                onApplyPrice(suggestion.recommendedPrice);
                setSuggestion(null);
              }}
              style={{ background: "#4CAF50" }}
            >
              ✓ Use Recommended (KES {suggestion.recommendedPrice?.toLocaleString()})
            </button>
            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={() => setSuggestion(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
