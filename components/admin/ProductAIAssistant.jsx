import { useEffect, useState } from "react";

function formatList(items) {
  if (!Array.isArray(items) || items.length === 0) return "None yet";
  return items.join(", ");
}

export default function ProductAIAssistant({ values, onApply }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [applied, setApplied] = useState(false);
  const [status, setStatus] = useState({ loading: true, configured: false, textModel: "", visionModel: "" });

  useEffect(() => {
    let ignore = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/admin/ai-status", {
          credentials: "same-origin",
        });
        const body = await response.json().catch(() => ({}));

        if (!ignore) {
          setStatus({
            loading: false,
            configured: Boolean(body?.configured),
            textModel: String(body?.textModel || ""),
            visionModel: String(body?.visionModel || ""),
          });
        }
      } catch (_error) {
        if (!ignore) {
          setStatus({ loading: false, configured: false, textModel: "", visionModel: "" });
        }
      }
    }

    loadStatus();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setApplied(false);

    try {
      const response = await fetch("/api/admin/generate-product-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ...values, notes }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || "Could not generate product copy right now.");
      }

      setResult(body);
      onApply?.(body?.suggestions || {});
      setApplied(true);
    } catch (requestError) {
      setError(String(requestError?.message || requestError || "Could not generate product copy right now."));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-panel admin-ai-panel">
      <div className="admin-ai-panel__header">
        <div>
          <p className="overline" style={{ marginBottom: "8px" }}>
            AI product helper
          </p>
          <p className="body-sm">
            Uses Cloudflare AI to read your current product images and suggest a stronger name, copy, materials, and
            shopper-friendly tags.
          </p>
          <p className={`caption admin-ai-status ${status.configured ? "admin-ai-status--ok" : "admin-ai-status--warning"}`}>
            {status.loading
              ? "Checking Cloudflare AI connection..."
              : status.configured
                ? `Cloudflare AI connected. Text: ${status.textModel} · Vision: ${status.visionModel}`
                : "Cloudflare AI is not configured yet. Add the account id and API token to your env first."}
          </p>
        </div>
        <button
          type="button"
          className="admin-button"
          onClick={handleGenerate}
          disabled={loading || !status.configured || (!values.image && !values.description)}
        >
          {loading ? "Generating..." : "Generate with AI"}
        </button>
      </div>

      <label className="admin-field" style={{ marginBottom: "var(--space-3)" }}>
        <span>Notes for AI</span>
        <textarea
          className="admin-textarea"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional guidance like: bridal customer, bold statement piece, keep title simple, focus on beadwork."
        />
      </label>

      {!values.image && !values.description ? (
        <p className="admin-note" style={{ marginBottom: 0 }}>
          Add at least one image or a short description first, then the AI can help.
        </p>
      ) : null}

      {error ? <p className="admin-form-error">{error}</p> : null}
      {applied ? <p className="saved-indicator">Suggestions applied. Review them, then save the product.</p> : null}

      {result?.suggestions ? (
        <div className="admin-ai-result">
          <div className="admin-ai-result__grid">
            <div className="admin-ai-result__card">
              <p className="caption admin-media-helper__label">Suggested name</p>
              <p className="heading-sm">{result.suggestions.suggestedName || "No name returned"}</p>
              <p className="caption" style={{ marginTop: "6px" }}>
                Slug: {result.suggestions.slug || "n/a"}
              </p>
            </div>
            <div className="admin-ai-result__card">
              <p className="caption admin-media-helper__label">Category path used</p>
              <p className="body-sm">
                {result.suggestions.category}
                {result.suggestions.jewelryType ? ` · ${result.suggestions.jewelryType}` : ""}
              </p>
              <p className="caption" style={{ marginTop: "6px" }}>
                Tags: {formatList(result.suggestions.tags)}
              </p>
            </div>
          </div>

          <div className="admin-ai-result__copy">
            <div className="admin-ai-result__card">
              <p className="caption admin-media-helper__label">Short description</p>
              <p className="body-sm">{result.suggestions.shortDescription || "No short description returned."}</p>
            </div>
            <div className="admin-ai-result__card">
              <p className="caption admin-media-helper__label">Photography notes</p>
              <p className="body-sm">{formatList(result.suggestions.photographyNotes)}</p>
            </div>
          </div>

          {Array.isArray(result.imageSummaries) && result.imageSummaries.length > 0 ? (
            <div className="admin-ai-result__card">
              <p className="caption admin-media-helper__label">What the AI saw</p>
              <div className="admin-ai-observations">
                {result.imageSummaries.map((summary, index) => (
                  <p key={`${index}-${summary}`} className="body-sm">
                    {index + 1}. {summary}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
