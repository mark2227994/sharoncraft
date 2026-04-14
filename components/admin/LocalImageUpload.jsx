import { useState } from "react";

export default function LocalImageUpload({
  onUploaded,
  label = "Choose image from your device",
  folder = "",
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onChange(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    setError("");
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
        <p className="admin-note" style={{ marginTop: "6px" }}>
          Uploading...
        </p>
      ) : null}
      {error ? (
        <p className="admin-form-error" style={{ marginTop: "6px", marginBottom: 0 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
