import { useState } from "react";

export default function SocialMediaAssistant({ productName, description, price, materials, category }) {
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generateCaption() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/generate-social-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          productName,
          description,
          price,
          materials,
          category,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate caption");
      }

      setCaption(data.caption);
    } catch (err) {
      setError(err.message || "Could not generate caption");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(caption).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        background: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "600" }}>
        📱 Instagram Caption
      </h3>

      {error && (
        <div
          style={{
            background: "#ffebee",
            color: "#c62828",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "12px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {!caption ? (
        <button
          type="button"
          onClick={generateCaption}
          disabled={loading || !productName}
          style={{
            padding: "12px 20px",
            background: "#673AB7",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "14px",
            opacity: loading || !productName ? 0.6 : 1,
          }}
        >
          {loading ? "🔄 Generating..." : "✨ Generate Caption"}
        </button>
      ) : (
        <div>
          <div
            style={{
              background: "white",
              border: "1px solid #C04D29",
              borderRadius: "6px",
              padding: "16px",
              marginBottom: "12px",
              fontStyle: "italic",
              color: "#333",
              lineHeight: "1.5",
            }}
          >
            "{caption}"
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={copyToClipboard}
              style={{
                padding: "10px 16px",
                background: "#C04D29",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>

            <button
              type="button"
              onClick={() => {
                setCaption("");
                setError("");
              }}
              style={{
                padding: "10px 16px",
                background: "#f5f5f5",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              🔄 Regenerate
            </button>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#999",
              marginTop: "12px",
            }}
          >
            💡 Tip: Includes #SharonCraft and Kenyan cultural references
          </p>
        </div>
      )}
    </div>
  );
}
