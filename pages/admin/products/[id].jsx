import { useQuery, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import AdminLayout from "../../../components/admin/AdminLayout";
import LocalImageUpload from "../../../components/admin/LocalImageUpload";
import ProductAIAssistant from "../../../components/admin/ProductAIAssistant";
import WearItWithPicker from "../../../components/admin/WearItWithPicker";
import { categoryOptions } from "../../../data/site";
import {
  fulfillmentTypeOptions,
  getFulfillmentTypeLabel,
  getJewelryTypeLabel,
  getProductAssetFolder,
  publishStatusOptions,
  getSuggestedProductMediaFolder,
  jewelryTypeOptions,
  slugify,
} from "../../../lib/products";

const categories = categoryOptions.filter((c) => c !== "All");

const defaults = {
  id: "",
  slug: "",
  name: "",
  artisan: "",
  artisanLocation: "",
  yearsOfPractice: 5,
  materialsStr: "",
  category: "Jewellery",
  jewelryType: "necklace",
  publishStatus: "published",
  fulfillmentType: "ready_to_ship",
  productionNote: "",
  price: 0,
  originalPrice: "",
  image: "",
  stylingImage: "",
  detailImage: "",
  stock: 1,
  isSold: false,
  isNew: true,
  featured: false,
  recent: true,
  description: "",
  wearItWithIds: [],
};

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
        Keep every jewellery listing to a clean close-up first, then one worn-on-body frame, then one detail image of
        the clasp, bead texture, or hand-finishing.
      </p>
      <p className="caption">
        That sequence gives necklaces, bracelets, and earrings a more premium feel and makes the pairings section read
        naturally.
      </p>
    </div>
  );
}

function toFormValues(product) {
  if (!product) return defaults;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    artisan: product.artisan,
    artisanLocation: product.artisanLocation ?? "",
    yearsOfPractice: product.yearsOfPractice ?? 0,
    materialsStr: Array.isArray(product.materials) ? product.materials.join(", ") : "",
    category: product.category,
    jewelryType: product.jewelryType || "necklace",
    publishStatus: product.publishStatus || "published",
    fulfillmentType: product.fulfillmentType || "ready_to_ship",
    productionNote: product.productionNote || "",
    price: product.price,
    originalPrice: product.originalPrice ?? "",
    image: product.image ?? "",
    stylingImage: product.images?.[1]?.src ?? "",
    detailImage: product.images?.[2]?.src ?? "",
    stock: product.stock ?? 0,
    isSold: Boolean(product.isSold),
    isNew: Boolean(product.isNew),
    featured: Boolean(product.featured),
    recent: Boolean(product.recent),
    description: product.description ?? "",
    wearItWithIds: Array.isArray(product.wearItWithIds) ? product.wearItWithIds : [],
  };
}

export default function AdminProductEditorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saveError, setSaveError] = useState("");
  const rawId = router.query.id;
  const id = typeof rawId === "string" ? rawId : null;
  const isNew = id === "new";

  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm({ defaultValues: defaults });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    enabled: router.isReady,
    queryFn: async () => {
      const response = await fetch("/api/admin/products", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Failed");
      return response.json();
    },
  });

  const existing = useMemo(() => (products && id && !isNew ? products.find((product) => product.id === id) : null), [
    products,
    id,
    isNew,
  ]);

  useEffect(() => {
    if (!router.isReady || !id) return;
    if (isNew) {
      reset(defaults);
      return;
    }
    if (products && existing) {
      reset(toFormValues(existing));
    }
  }, [router.isReady, id, isNew, products, existing, reset]);

  const nameValue = watch("name");
  const categoryValue = watch("category") || "Jewellery";
  const jewelryTypeValue = watch("jewelryType") || "";
  const slugValue = watch("slug");
  const primaryImageValue = watch("image");
  const stylingImageValue = watch("stylingImage");
  const detailImageValue = watch("detailImage");
  const wearItWithIds = watch("wearItWithIds") || [];

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

  function fillIdsFromName() {
    const base = slugify(nameValue);
    if (!base) return;
    setValue("slug", base);
    if (isNew) setValue("id", `sc-${base}`);
  }

  function applyAiSuggestions(suggestions) {
    if (!suggestions || typeof suggestions !== "object") return;

    if (suggestions.suggestedName) {
      setValue("name", suggestions.suggestedName, { shouldValidate: true, shouldDirty: true });
    }
    if (suggestions.slug) {
      setValue("slug", suggestions.slug, { shouldValidate: true, shouldDirty: true });
      if (isNew && !getValues("id")) {
        setValue("id", `sc-${suggestions.slug}`, { shouldValidate: true, shouldDirty: true });
      }
    }
    if (suggestions.jewelryType) {
      setValue("jewelryType", suggestions.jewelryType, { shouldValidate: true, shouldDirty: true });
    }
    if (Array.isArray(suggestions.materials) && suggestions.materials.length > 0) {
      setValue("materialsStr", suggestions.materials.join(", "), { shouldValidate: true, shouldDirty: true });
    }
    if (suggestions.fullDescription) {
      setValue("description", suggestions.fullDescription, { shouldValidate: true, shouldDirty: true });
    }
  }

  async function onSubmit(values) {
    setSaveError("");

    const materials = values.materialsStr
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const originalPrice =
      values.originalPrice === "" || values.originalPrice === null ? null : Number(values.originalPrice);
    const payload = {
      id: values.id.trim(),
      slug: values.slug.trim(),
      name: values.name.trim(),
      artisan: values.artisan.trim(),
      artisanLocation: values.artisanLocation.trim(),
      yearsOfPractice: Number(values.yearsOfPractice) || 0,
      materials,
      category: values.category,
      jewelryType: values.category === "Jewellery" ? values.jewelryType : "",
      wearItWithIds,
      publishStatus: values.publishStatus,
      fulfillmentType: values.fulfillmentType,
      productionNote: values.productionNote || "",
      price: Number(values.price),
      originalPrice,
      image: values.image.trim(),
      images: buildGalleryImages(values),
      stock: Number(values.stock),
      isSold: Boolean(values.isSold),
      isNew: Boolean(values.isNew),
      featured: Boolean(values.featured),
      recent: Boolean(values.recent),
      description: values.description.trim(),
      story: {
        ...(existing?.story ?? {}),
        artisanName: values.artisan.trim(),
        artisanLocation: values.artisanLocation.trim(),
        yearsOfPractice: Number(values.yearsOfPractice) || 0,
        materials,
        text: existing?.story?.text || values.description.trim(),
        culturalNote: existing?.story?.culturalNote || "",
        behindScenesPhoto:
          values.stylingImage.trim() ||
          values.detailImage.trim() ||
          existing?.story?.behindScenesPhoto ||
          values.image.trim(),
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
        setSaveError("Your admin session expired. Please log in again.");
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

      setSaveError(message);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    router.push("/admin/products");
  }

  const notFound = router.isReady && !isNew && products && !existing;

  return (
    <>
      <Head>
        <title>{isNew ? "New piece" : "Edit piece"} - Gallery Admin</title>
      </Head>
      <AdminLayout
        title={isNew ? "New piece" : "Edit piece"}
        action={
          <Link href="/admin/products" className="admin-button admin-button--secondary">
            Back to stock
          </Link>
        }
      >
        {!router.isReady || isLoading ? <p className="admin-note">Loading...</p> : null}

        {notFound ? <p className="admin-form-error">This piece is not in the catalogue.</p> : null}

        {!notFound && router.isReady && (isNew || existing) ? (
          <form className="admin-form-card" onSubmit={handleSubmit(onSubmit)}>
            <div className="admin-grid-2">
              <label className="admin-field">
                <span className="admin-note">Name</span>
                <input className="admin-input" {...register("name", { required: true })} />
              </label>
              <div className="admin-field">
                <span className="admin-note">Ids from name</span>
                <button type="button" className="admin-button admin-button--secondary" onClick={fillIdsFromName}>
                  Fill slug &amp; id
                </button>
              </div>
            </div>

            <div className="admin-grid-2">
              <label className="admin-field">
                <span className="admin-note">Product id</span>
                <input className="admin-input" {...register("id", { required: true })} readOnly={!isNew} />
              </label>
              <label className="admin-field">
                <span className="admin-note">URL slug</span>
                <input className="admin-input" {...register("slug", { required: true })} />
              </label>
            </div>

            <div className="admin-grid-2">
              <label className="admin-field">
                <span className="admin-note">Artisan</span>
                <input className="admin-input" {...register("artisan", { required: true })} />
              </label>
              <label className="admin-field">
                <span className="admin-note">County / location</span>
                <input className="admin-input" {...register("artisanLocation")} />
              </label>
            </div>

            <label className="admin-field">
              <span className="admin-note">Materials (comma separated)</span>
              <input className="admin-input" {...register("materialsStr")} />
            </label>
            <label className="admin-field">
              <span className="admin-note">Production note for admin / WhatsApp</span>
              <input
                className="admin-input"
                placeholder="Example: 3 to 5 days after confirmation, confirm colours first"
                {...register("productionNote")}
              />
            </label>

            <WearItWithPicker
              products={Array.isArray(products) ? products : []}
              selectedIds={wearItWithIds}
              onChange={(nextIds) => setValue("wearItWithIds", nextIds, { shouldDirty: true, shouldValidate: false })}
              currentProductId={getValues("id")}
              currentProductSlug={slugValue}
            />

            <div className="admin-grid-2">
              <label className="admin-field">
                <span className="admin-note">Category</span>
                <select className="admin-select" {...register("category")}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              {isJewellery ? (
                <label className="admin-field">
                  <span className="admin-note">Jewellery type</span>
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
                <span className="admin-note">Visibility</span>
                <select className="admin-select" {...register("publishStatus")}>
                  {publishStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "published" ? "Published" : "Draft"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-note">Fulfillment</span>
                <select className="admin-select" {...register("fulfillmentType")}>
                  {fulfillmentTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {getFulfillmentTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-note">Years of practice</span>
                <input className="admin-input" type="number" min={0} {...register("yearsOfPractice")} />
              </label>
            </div>

            <div className="admin-grid-2">
              <label className="admin-field">
                <span className="admin-note">Price (KES)</span>
                <input className="admin-input" type="number" min={0} {...register("price", { required: true })} />
              </label>
              <label className="admin-field">
                <span className="admin-note">Original price (optional)</span>
                <input className="admin-input" type="number" min={0} {...register("originalPrice")} />
              </label>
            </div>

            <div className="admin-grid-2">
              <label className="admin-field">
                <span className="admin-note">Stock</span>
                <input className="admin-input" type="number" min={0} {...register("stock", { required: true })} />
              </label>
            </div>

            <div className="admin-panel" style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <p className="overline" style={{ marginBottom: "8px" }}>
                Suggested project folder
              </p>
              <p className="body-sm">{suggestedFolder}</p>
            </div>

            {isJewellery ? <JewelryPhotoGuide /> : null}

            <ProductAIAssistant
              values={{
                ...getValues(),
                image: primaryImageValue,
                stylingImage: stylingImageValue,
                detailImage: detailImageValue,
              }}
              onApply={applyAiSuggestions}
            />

            <div className="admin-grid-2">
              <label className="admin-field">
                <span className="admin-note">Primary close-up image</span>
                <input
                  className="admin-input"
                  placeholder="/media/products/slug-main.webp"
                  {...register("image", { required: true })}
                />
              </label>
              <LocalImageUpload
                label="Upload close-up image"
                folder={uploadFolder}
                onUploaded={(uploadedPath) => setValue("image", uploadedPath)}
              />
              <label className="admin-field">
                <span className="admin-note">Worn-on-body or styled photo</span>
                <input
                  className="admin-input"
                  placeholder="Optional second gallery image"
                  {...register("stylingImage")}
                />
              </label>
              <LocalImageUpload
                label="Upload second gallery image"
                folder={uploadFolder}
                onUploaded={(uploadedPath) => setValue("stylingImage", uploadedPath)}
              />
              <label className="admin-field">
                <span className="admin-note">Detail photo</span>
                <input
                  className="admin-input"
                  placeholder="Optional clasp or texture detail image"
                  {...register("detailImage")}
                />
              </label>
              <LocalImageUpload
                label="Upload detail image"
                folder={uploadFolder}
                onUploaded={(uploadedPath) => setValue("detailImage", uploadedPath)}
              />
            </div>

            <label className="admin-field">
              <span className="admin-note">Short description</span>
              <textarea className="admin-textarea" {...register("description")} />
            </label>

            <div className="admin-quick-actions" style={{ marginTop: 0 }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem" }}>
                <input type="checkbox" {...register("isNew")} />
                New arrival
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem" }}>
                <input type="checkbox" {...register("featured")} />
                Featured
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem" }}>
                <input type="checkbox" {...register("recent")} />
                Recent
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem" }}>
                <input type="checkbox" {...register("isSold")} />
                Mark sold
              </label>
            </div>

            <div className="admin-quick-actions">
              <button type="submit" className="admin-button">
                Save piece
              </button>
            </div>
            {saveError ? <p className="admin-form-error">{saveError}</p> : null}
          </form>
        ) : null}
      </AdminLayout>
    </>
  );
}
