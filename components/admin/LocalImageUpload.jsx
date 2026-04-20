import { useState } from "react";

export default function LocalImageUpload({
  onUploaded,
  label = "Choose image from your device",
  folder = "",
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  async function onChange(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    setError("");
    setUploadedUrl("");
    setBusy(true);

    const body = new FormData();
    body.append("file", file);
    if (folder) {
      body.append("folder", folder);
    }

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body,
      credentials: "same-origin",
    });

    setBusy(false);
    input.value = "";

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Upload failed");
      return;
    }

    if (data.path) {
      setUploadedUrl(data.path);
      onUploaded(data.path);
    }
  }

  return (
    <div className="admin-field" style={{ marginBottom: 0 }}>
      <span className="admin-note">{label}</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.svg"
        onChange={onChange}
        disabled={busy}
        className="admin-input admin-input--file"
      />
      {busy ? (
        <p className="admin-note" style={{ marginTop: "6px", color: "#2E7D32" }}>
          ✓ Uploading...
        </p>
      ) : null}
      {error ? (
        <p className="admin-form-error" style={{ marginTop: "6px", marginBottom: 0 }}>
          ❌ {error}
        </p>
      ) : null}
      {uploadedUrl && !busy ? (
        <div style={{ marginTop: "8px" }}>
          <img 
            src={uploadedUrl} 
            alt="Uploaded preview" 
            style={{ 
              maxWidth: "120px", 
              maxHeight: "120px", 
              borderRadius: "4px",
              border: "2px solid #4CAF50",
              padding: "4px"
            }} 
          />
          <p className="admin-note" style={{ marginTop: "6px", color: "#2E7D32" }}>
            ✓ Image uploaded successfully
          </p>
        </div>
      ) : null}
    </div>
  );
}
