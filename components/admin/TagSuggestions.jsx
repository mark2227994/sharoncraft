import { useState } from "react";

export default function TagSuggestions({ name, description, materials, category, jewelryType, onTagsSelected }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  async function handleGetSuggestions() {
    if (!name) {
      setError("Product name required to get tag suggestions");
      return;
    }

    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      const response = await fetch("/api/admin/auto-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, description, materials, category, jewelryType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get suggestions");

      setSuggestions(data.suggestedTags || []);
      setShowSuggestions(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleToggleTag(tag) {
    setSelectedTags((prev) => {
      const updated = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      onTagsSelected(updated);
      return updated;
    });
  }

  function handleApplySuggestions() {
    setSelectedTags(suggestions);
    onTagsSelected(suggestions);
    setShowSuggestions(false);
  }

  return (
    <div className="admin-panel" style={{ background: "rgba(103, 58, 183, 0.05)", border: "1px solid #673AB7" }}>
      <div style={{ marginBottom: "12px" }}>
        <p className="overline" style={{ marginBottom: "4px" }}>🏷️ Smart Tags</p>
        <p className="caption" style={{ color: "#666", marginBottom: "12px" }}>
          Auto-suggest tags based on your product details
        </p>

        <button
          type="button"
          className="admin-button admin-button--secondary"
          onClick={handleGetSuggestions}
          disabled={loading || !name}
          style={{ marginBottom: "12px" }}
        >
          {loading ? "Getting suggestions..." : "Get Tag Suggestions"}
        </button>
      </div>

      {error && <p style={{ color: "#D32F2F", fontSize: "0.875rem", marginBottom: "8px" }}>❌ {error}</p>}

      {/* Show suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <p className="body-sm" style={{ fontWeight: "bold", marginBottom: "8px", color: "#333" }}>
            Suggested: {suggestions.length} tags
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "12px",
            }}
          >
            {suggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                style={{
                  padding: "6px 12px",
                  background: selectedTags.includes(tag) ? "#673AB7" : "#f0f0f0",
                  color: selectedTags.includes(tag) ? "#fff" : "#333",
                  border: `1px solid ${selectedTags.includes(tag) ? "#673AB7" : "#ddd"}`,
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {selectedTags.includes(tag) ? "✓ " : ""}{tag}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="admin-button"
              onClick={handleApplySuggestions}
              style={{ background: "#673AB7", flex: 1 }}
            >
              Apply All Suggestions
            </button>
            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={() => {
                setShowSuggestions(false);
                setSelectedTags([]);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Show selected tags */}
      {selectedTags.length > 0 && (
        <div style={{ padding: "8px", background: "#f9f9f9", borderRadius: "4px" }}>
          <p className="caption" style={{ marginBottom: "8px", color: "#666" }}>
            Selected tags ({selectedTags.length}):
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {selectedTags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px",
                  background: "#673AB7",
                  color: "#fff",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "1rem",
                    padding: "0",
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
