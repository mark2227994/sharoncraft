import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import AdminLayout from "../../../components/admin/AdminLayout";
import LocalImageUpload from "../../../components/admin/LocalImageUpload";
import { categoryOptions } from "../../../data/site";
import {
  getJewelryTypeLabel,
  getProductAssetFolder,
  getSuggestedProductMediaFolder,
  jewelryTypeOptions,
  slugify,
} from "../../../lib/products";

const categories = categoryOptions.filter((category) => category !== "All");

function buildGalleryImages(values) {
  return [values.image, values.stylingImage, values.detailImage]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .map((src) => ({ src }));
}

function JewelryPhotoGuide() {
  return (
    <div className="admin-panel" style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
      <p className="overline" style={{ marginBottom: "8px" }}>
        Jewellery photo guide
      </p>
      <p className="body-sm" style={{ marginBottom: "8px" }}>
        1. Lead with one clean close-up. 2. Add one worn-on-body shot if possible. 3. Finish with one detail shot of
        the bead texture, clasp, or handwork.
      </p>
      <p className="caption">
        This gives necklaces, bracelets, and earrings a calmer premium feel and makes matching sets easier to style on
        the product page.
      </p>
    </div>
  );
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      category: "Jewellery",
      jewelryType: "necklace",
      stock: 1,
    },
  });
  const [submitError, setSubmitError] = useState("");
  const imageValue = watch("image");
  const nameValue = watch("name");
  const slugValue = watch("slug");
  const categoryValue = watch("category") || "Jewellery";
  const jewelryTypeValue = watch("jewelryType") || "";
  const stylingImageValue = watch("stylingImage");
  const detailImageValue = watch("detailImage");

  const isJewellery = categoryValue === "Jewellery";
  const suggestedFolder = getSuggestedProductMediaFolder({
    category: categoryValue,
    jewelryType: jewelryTypeValue,
    slug: slugValue || nameValue,
  });
  const uploadFolder = getProductAssetFolder({
    category: categoryValue,
    jewelryType: jewelryTypeValue,
    slug: slugValue || nameValue,
  });

  useEffect(() => {
    if (isJewellery && !jewelryTypeValue) {
      setValue("jewelryType", "necklace");
    }
    if (!isJewellery && jewelryTypeValue) {
      setValue("jewelryType", "");
    }
  }, [isJewellery, jewelryTypeValue, setValue]);

  function fillSlugFromName() {
    const nextSlug = slugify(nameValue);
    if (!nextSlug) return;
    setValue("slug", nextSlug, { shouldValidate: true });
  }

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
      jewelryType: values.category === "Jewellery" ? values.jewelryType : "",
      price: Number(values.price || 0),
      originalPrice: values.originalPrice ? Number(values.originalPrice) : null,
      image: values.image,
      images: buildGalleryImages(values),
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
        behindScenesPhoto: values.stylingImage || values.detailImage || values.image,
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
          <div className="admin-field">
            <span>Fill from product name</span>
            <button type="button" className="admin-button admin-button--secondary" onClick={fillSlugFromName}>
              Generate slug
            </button>
          </div>
          <label className="admin-field">
            <span>Category</span>
            <select className="admin-select" defaultValue="Jewellery" {...register("category", { required: true })}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          {isJewellery ? (
            <label className="admin-field">
              <span>Jewellery type</span>
              <select className="admin-select" {...register("jewelryType")}>
                {jewelryTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {getJewelryTypeLabel(type)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
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
        </div>

        <div className="admin-panel" style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
          <p className="overline" style={{ marginBottom: "8px" }}>
            Suggested project folder
          </p>
          <p className="body-sm">{suggestedFolder}</p>
        </div>

        {isJewellery ? <JewelryPhotoGuide /> : null}

        <div className="admin-grid-2">
          <label className="admin-field">
            <span>Primary close-up image</span>
            <input className="admin-input" {...register("image", { required: true })} />
          </label>
          <LocalImageUpload
            label="Upload close-up image"
            folder={uploadFolder}
            onUploaded={(uploadedPath) => setValue("image", uploadedPath, { shouldValidate: true })}
          />
          <label className="admin-field">
            <span>Worn-on-body or styled photo</span>
            <input className="admin-input" {...register("stylingImage")} />
          </label>
          <LocalImageUpload
            label="Upload worn-on-body or styled photo"
            folder={uploadFolder}
            onUploaded={(uploadedPath) => setValue("stylingImage", uploadedPath, { shouldValidate: true })}
          />
          <label className="admin-field">
            <span>Detail photo</span>
            <input className="admin-input" {...register("detailImage")} />
          </label>
          <LocalImageUpload
            label="Upload detail photo"
            folder={uploadFolder}
            onUploaded={(uploadedPath) => setValue("detailImage", uploadedPath, { shouldValidate: true })}
          />
        </div>

        {imageValue ? (
          <p className="admin-note" style={{ marginBottom: "8px" }}>
            Main image path: <code>{imageValue}</code>
          </p>
        ) : null}
        {stylingImageValue ? (
          <p className="admin-note" style={{ marginBottom: "8px" }}>
            Second image path: <code>{stylingImageValue}</code>
          </p>
        ) : null}
        {detailImageValue ? (
          <p className="admin-note" style={{ marginBottom: "16px" }}>
            Detail image path: <code>{detailImageValue}</code>
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
