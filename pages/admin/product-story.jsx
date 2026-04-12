import { useQuery, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import LocalImageUpload from "../../components/admin/LocalImageUpload";

const emptyStory = {
  artisanName: "",
  artisanLocation: "",
  yearsOfPractice: "",
  materialsStr: "",
  text: "",
  culturalNote: "",
  behindScenesPhoto: "",
};

export default function AdminProductStoryPage() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState("");
  const [form, setForm] = useState(emptyStory);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Failed");
      return response.json();
    },
  });

  const selected = products?.find((p) => p.id === productId);

  useEffect(() => {
    setSaved(false);
    if (!selected) {
      setForm(emptyStory);
      return;
    }
    const story = selected.story || {};
    setForm({
      artisanName: story.artisanName ?? selected.artisan ?? "",
      artisanLocation: story.artisanLocation ?? selected.artisanLocation ?? "",
      yearsOfPractice: story.yearsOfPractice ?? selected.yearsOfPractice ?? "",
      materialsStr: Array.isArray(story.materials)
        ? story.materials.join(", ")
        : Array.isArray(selected.materials)
          ? selected.materials.join(", ")
          : "",
      text: story.text ?? "",
      culturalNote: story.culturalNote ?? "",
      behindScenesPhoto: story.behindScenesPhoto ?? "",
    });
  }, [selected]);

  async function onSubmit(event) {
    event.preventDefault();
    if (!productId) return;
    setSubmitting(true);
    setSaved(false);
    const materials = form.materialsStr
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const response = await fetch("/api/admin/product-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        productId,
        story: {
          artisanName: form.artisanName.trim(),
          artisanLocation: form.artisanLocation.trim(),
          yearsOfPractice: Number(form.yearsOfPractice) || 0,
          materials,
          text: form.text.trim(),
          culturalNote: form.culturalNote.trim(),
          behindScenesPhoto: form.behindScenesPhoto.trim(),
        },
      }),
    });
    setSubmitting(false);
    if (!response.ok) return;
    setSaved(true);
    await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <>
      <Head>
        <title>Stories — Gallery Admin</title>
      </Head>
      <AdminLayout title="Artisan stories">
        {isLoading ? <p className="admin-note">Loading…</p> : null}

        {!isLoading && products ? (
          <div className="story-split">
            <form className="admin-form-card" onSubmit={onSubmit}>
              <label className="admin-field">
                <span className="admin-note">Piece</span>
                <select
                  className="admin-select"
                  value={productId}
                  onChange={(event) => setProductId(event.target.value)}
                  required
                >
                  <option value="">Choose a piece…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="admin-grid-2">
                <label className="admin-field">
                  <span className="admin-note">Artisan name</span>
                  <input
                    className="admin-input"
                    value={form.artisanName}
                    onChange={(event) => setForm((f) => ({ ...f, artisanName: event.target.value }))}
                  />
                </label>
                <label className="admin-field">
                  <span className="admin-note">Location</span>
                  <input
                    className="admin-input"
                    value={form.artisanLocation}
                    onChange={(event) => setForm((f) => ({ ...f, artisanLocation: event.target.value }))}
                  />
                </label>
              </div>

              <div className="admin-grid-2">
                <label className="admin-field">
                  <span className="admin-note">Years of practice</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={0}
                    value={form.yearsOfPractice}
                    onChange={(event) => setForm((f) => ({ ...f, yearsOfPractice: event.target.value }))}
                  />
                </label>
                <label className="admin-field">
                  <span className="admin-note">Materials (comma separated)</span>
                  <input
                    className="admin-input"
                    value={form.materialsStr}
                    onChange={(event) => setForm((f) => ({ ...f, materialsStr: event.target.value }))}
                  />
                </label>
              </div>

              <label className="admin-field">
                <span className="admin-note">Story text</span>
                <textarea
                  className="admin-textarea"
                  value={form.text}
                  onChange={(event) => setForm((f) => ({ ...f, text: event.target.value }))}
                  rows={6}
                />
              </label>

              <label className="admin-field">
                <span className="admin-note">Cultural note</span>
                <textarea
                  className="admin-textarea"
                  value={form.culturalNote}
                  onChange={(event) => setForm((f) => ({ ...f, culturalNote: event.target.value }))}
                  rows={4}
                />
              </label>

              <label className="admin-field">
                <span className="admin-note">Behind-the-scenes photo path</span>
                <input
                  className="admin-input"
                  placeholder="/media/products/slug-story.webp"
                  value={form.behindScenesPhoto}
                  onChange={(event) => setForm((f) => ({ ...f, behindScenesPhoto: event.target.value }))}
                />
              </label>
              <LocalImageUpload onUploaded={(path) => setForm((f) => ({ ...f, behindScenesPhoto: path }))} />

              <div className="admin-quick-actions">
                <button type="submit" className="admin-button" disabled={submitting || !productId}>
                  {submitting ? "Saving…" : "Save story"}
                </button>
                {saved ? <span className="saved-indicator">Saved</span> : null}
              </div>
            </form>

            <aside className="story-preview">
              <p className="overline" style={{ color: "var(--color-ochre)" }}>
                Preview
              </p>
              <h2 className="heading-sm" style={{ marginTop: "8px" }}>
                {selected?.name || "Select a piece"}
              </h2>
              <p className="admin-note" style={{ marginTop: "12px", whiteSpace: "pre-wrap" }}>
                {form.text || "Story text will appear here."}
              </p>
            </aside>
          </div>
        ) : null}
      </AdminLayout>
    </>
  );
}
