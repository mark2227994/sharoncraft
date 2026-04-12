import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import AdminLayout from "../../components/admin/AdminLayout";
import { readProducts } from "../../lib/store";

function ProductStoryPreview({ story }) {
  return (
    <div className="story-preview">
      {story.artisanName ? (
        <p className="overline" style={{ color: "var(--color-ochre)", marginBottom: "4px" }}>
          {story.artisanName} · {story.artisanLocation}
        </p>
      ) : null}
      {story.text ? (
        <p className="body-lg" style={{ whiteSpace: "pre-wrap", marginBottom: "16px" }}>
          {story.text}
        </p>
      ) : null}
      {story.culturalNote ? (
        <div
          style={{
            borderLeft: "3px solid var(--color-bark)",
            paddingLeft: "16px",
            background: "var(--color-cream-dark)",
            borderRadius: "0 var(--radius-md) var(--radius-md) 0",
            padding: "12px 16px",
          }}
        >
          <p className="overline" style={{ marginBottom: "4px" }}>Cultural Significance</p>
          <p className="body-sm">{story.culturalNote}</p>
        </div>
      ) : null}
      {story.materials?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
          {story.materials.map((material) => (
            <span
              key={material}
              style={{
                padding: "3px 10px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--color-bark)",
                fontSize: "0.75rem",
                color: "var(--color-bark)",
                letterSpacing: "0.04em",
              }}
            >
              {material}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ProductStoryPage({ products }) {
  const router = useRouter();
  const initialProductId = router.query.productId || products[0]?.id;
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  const [saved, setSaved] = useState(false);
  const { register, watch, handleSubmit, reset } = useForm();

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || products[0],
    [products, selectedProductId],
  );

  useEffect(() => {
    if (!selectedProduct) return;
    reset({
      artisanName: selectedProduct.story.artisanName,
      artisanLocation: selectedProduct.story.artisanLocation,
      yearsOfPractice: selectedProduct.story.yearsOfPractice,
      materials: selectedProduct.story.materials.join(", "),
      text: selectedProduct.story.text,
      culturalNote: selectedProduct.story.culturalNote,
      behindScenesPhoto: selectedProduct.story.behindScenesPhoto,
    });
  }, [reset, selectedProduct]);

  const preview = watch();

  async function onSubmit(values) {
    await fetch("/api/admin/product-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct.id,
        story: {
          artisanName: values.artisanName,
          artisanLocation: values.artisanLocation,
          yearsOfPractice: Number(values.yearsOfPractice || 0),
          materials: values.materials.split(",").map((item) => item.trim()).filter(Boolean),
          text: values.text,
          culturalNote: values.culturalNote,
          behindScenesPhoto: values.behindScenesPhoto,
        },
      }),
    });

    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AdminLayout title="Product Story Editor" action={saved ? <span className="saved-indicator">Saved ✓</span> : null}>
      <div className="story-split">
        <form className="admin-form-card" onSubmit={handleSubmit(onSubmit)}>
          <label className="admin-field">
            <span>Choose Product</span>
            <select
              className="admin-select"
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field"><span>Artisan Name</span><input className="admin-input" {...register("artisanName")} /></label>
          <label className="admin-field"><span>Artisan Location</span><input className="admin-input" {...register("artisanLocation")} /></label>
          <label className="admin-field"><span>Years of Practice</span><input type="number" className="admin-input" {...register("yearsOfPractice")} /></label>
          <label className="admin-field"><span>Materials Used</span><input className="admin-input" {...register("materials")} /></label>
          <label className="admin-field">
            <span>The Story</span>
            <textarea rows={10} className="admin-textarea" {...register("text")} />
            <span className="admin-note">
              Tell the story of this piece. How was it made? What does it mean? What tradition does it carry? Write as if speaking to a first-time buyer.
            </span>
          </label>
          <label className="admin-field">
            <span>Cultural Significance</span>
            <textarea rows={5} className="admin-textarea" {...register("culturalNote")} />
            <span className="admin-note">What cultural tradition or community does this piece represent?</span>
          </label>
          <label className="admin-field"><span>Behind-the-Scenes Photo</span><input className="admin-input" {...register("behindScenesPhoto")} /></label>
          <button type="submit" className="admin-button">Save Story</button>
        </form>

        <div>
          <p className="overline" style={{ marginBottom: "8px" }}>Live preview</p>
          <ProductStoryPreview
            story={{
              artisanName: preview.artisanName,
              artisanLocation: preview.artisanLocation,
              materials: preview.materials ? preview.materials.split(",").map((item) => item.trim()).filter(Boolean) : [],
              text: preview.text,
              culturalNote: preview.culturalNote,
            }}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  return { props: { products: await readProducts() } };
}
