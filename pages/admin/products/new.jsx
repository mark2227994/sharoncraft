import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import LocalImageUpload from "../../../components/admin/LocalImageUpload";

export default function AdminNewProductPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch } = useForm();
  const [submitError, setSubmitError] = useState("");
  const imageValue = watch("image");

  async function onSubmit(values) {
    setSubmitError("");

    const payload = {
      id: values.slug,
      slug: values.slug,
      name: values.name,
      artisan: values.artisan,
      artisanLocation: values.artisanLocation,
      yearsOfPractice: Number(values.yearsOfPractice || 0),
      materials: values.materials.split(",").map((item) => item.trim()).filter(Boolean),
      category: values.category,
      price: Number(values.price || 0),
      originalPrice: values.originalPrice ? Number(values.originalPrice) : null,
      image: values.image,
      images: [{ src: values.image }],
      isSold: false,
      isNew: true,
      stock: Number(values.stock || 1),
      featured: false,
      recent: true,
      description: values.description,
      story: {
        artisanName: values.artisan,
        artisanLocation: values.artisanLocation,
        yearsOfPractice: Number(values.yearsOfPractice || 0),
        materials: values.materials.split(",").map((item) => item.trim()).filter(Boolean),
        text: values.description,
        culturalNote: "Add a cultural significance note from the Story editor.",
        behindScenesPhoto: "/media/artisan-portrait.jpg",
      },
    };

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) {
        setSubmitError("Your admin session expired. Please log in again.");
        router.push("/admin/login");
        return;
      }

      let message = "Could not save this product. Please try again.";
      try {
        const body = await response.json();
        if (body && body.error) {
          message = String(body.error);
        }
      } catch (_error) {
        // Keep fallback message when response body is not JSON.
      }

      setSubmitError(message);
      return;
    }

    router.push("/admin/products");
  }

  return (
    <AdminLayout title="Add Product">
      <form className="admin-form-card" onSubmit={handleSubmit(onSubmit)}>
        <div className="admin-grid-2">
          <label className="admin-field">
            <span>Name</span>
            <input className="admin-input" {...register("name", { required: true })} />
          </label>
          <label className="admin-field">
            <span>Slug</span>
            <input className="admin-input" {...register("slug", { required: true })} />
          </label>
          <label className="admin-field">
            <span>Category</span>
            <input className="admin-input" {...register("category", { required: true })} />
          </label>
          <label className="admin-field">
            <span>Artisan</span>
            <input className="admin-input" {...register("artisan", { required: true })} />
          </label>
          <label className="admin-field">
            <span>Artisan Location</span>
            <input className="admin-input" {...register("artisanLocation", { required: true })} />
          </label>
          <label className="admin-field">
            <span>Years of Practice</span>
            <input type="number" className="admin-input" {...register("yearsOfPractice")} />
          </label>
          <label className="admin-field">
            <span>Price</span>
            <input type="number" className="admin-input" {...register("price", { required: true })} />
          </label>
          <label className="admin-field">
            <span>Original Price</span>
            <input type="number" className="admin-input" {...register("originalPrice")} />
          </label>
          <label className="admin-field">
            <span>Stock</span>
            <input type="number" className="admin-input" {...register("stock")} />
          </label>
          <label className="admin-field">
            <span>Primary Image URL</span>
            <input className="admin-input" defaultValue="/media/product-necklace-a.webp" {...register("image", { required: true })} />
          </label>
        </div>
        <LocalImageUpload onUploaded={(uploadedPath) => setValue("image", uploadedPath, { shouldValidate: true })} />
        {imageValue ? (
          <p className="admin-note" style={{ marginBottom: "16px" }}>
            Uploaded image path: <code>{imageValue}</code>
          </p>
        ) : null}
        <label className="admin-field">
          <span>Materials Used</span>
          <input className="admin-input" placeholder="Glass beads, brass clasp" {...register("materials")} />
        </label>
        <label className="admin-field">
          <span>Description</span>
          <textarea className="admin-textarea" {...register("description", { required: true })} />
        </label>
        <button type="submit" className="admin-button">
          Save Product
        </button>
        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AdminLayout>
  );
}
