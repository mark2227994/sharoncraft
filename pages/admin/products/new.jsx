import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import AdminLayout from "../../../components/admin/AdminLayout";
import LocalImageUpload from "../../../components/admin/LocalImageUpload";
import ProductAIAssistant from "../../../components/admin/ProductAIAssistant";
import WearItWithPicker from "../../../components/admin/WearItWithPicker";
import { categoryOptions } from "../../../data/site";
import { formatKES } from "../../../lib/formatters";
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

function MediaPathHelper({ uploadFolder, suggestedFolder }) {
  const [copiedLabel, setCopiedLabel] = useState("");

  async function copyValue(label, value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      window.setTimeout(() => {
        setCopiedLabel((current) => (current === label ? "" : current));
      }, 1800);
    } catch (_error) {
      setCopiedLabel("");
    }
  }

  return (
    <div className="admin-panel admin-media-helper">
      <div className="admin-media-helper__header">
        <div>
          <p className="overline" style={{ marginBottom: "8px" }}>
            Product image destination
          </p>
          <p className="body-sm">
            Uploads from this form go to Supabase Storage. If you manage files manually in the repo, mirror them in the
            local media folder below.
          </p>
        </div>
      </div>

      <div className="admin-media-helper__grid">
        <div className="admin-media-helper__item">
          <p className="caption admin-media-helper__label">Upload storage folder</p>
          <code className="admin-media-helper__code">product-images/catalog/{uploadFolder}</code>
          <button
            type="button"
            className="admin-button admin-button--secondary"
            onClick={() => copyValue("upload", `product-images/catalog/${uploadFolder}`)}
          >
            {copiedLabel === "upload" ? "Copied" : "Copy upload path"}
          </button>
        </div>

        <div className="admin-media-helper__item">
          <p className="caption admin-media-helper__label">Local mirror folder</p>
          <code className="admin-media-helper__code">{suggestedFolder}</code>
          <button
            type="button"
            className="admin-button admin-button--secondary"
            onClick={() => copyValue("local", suggestedFolder)}
          >
            {copiedLabel === "local" ? "Copied" : "Copy local path"}
          </button>
        </div>
      </div>

      <p className="admin-note" style={{ marginBottom: 0 }}>
        Recommended files: <strong>close-up</strong>, <strong>worn/styled</strong>, and <strong>detail</strong>.
      </p>
    </div>
  );
}

const WIZARD_STEPS = [
  { id: 1, label: "Basic Info", icon: "📋" },
  { id: 2, label: "Images", icon: "🖼️" },
  { id: 3, label: "Description", icon: "✍️" },
  { id: 4, label: "Pricing", icon: "💰" },
  { id: 5, label: "Advanced", icon: "⚙️" },
  { id: 6, label: "Review", icon: "✓" },
];

export default function AdminNewProductPage() {
  const router = useRouter();
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm({
    defaultValues: {
      category: "Jewellery",
      jewelryType: "necklace",
      publishStatus: "published",
      fulfillmentType: "ready_to_ship",
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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/admin/products", { credentials: "same-origin" });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setCatalogProducts(Array.isArray(data) ? data : []);
        }
      } catch (_error) {
        // keep the picker empty if loading fails
      }
    })();

    (async () => {
      try {
        const response = await fetch("/api/admin/artisans-list", { credentials: "same-origin" });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data.artisans) {
          setArtisans(data.artisans);
        }
      } catch (_error) {
        // keep artisans empty if loading fails
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function fillSlugFromName() {
    const nextSlug = slugify(nameValue);
    if (!nextSlug) return;
    setValue("slug", nextSlug, { shouldValidate: true });
  }

  function applyAiSuggestions(suggestions) {
    if (!suggestions || typeof suggestions !== "object") return;

    if (suggestions.suggestedName) {
      setValue("name", suggestions.suggestedName, { shouldValidate: true, shouldDirty: true });
    }
    if (suggestions.slug) {
      setValue("slug", suggestions.slug, { shouldValidate: true, shouldDirty: true });
    }
    if (suggestions.jewelryType) {
      setValue("jewelryType", suggestions.jewelryType, { shouldValidate: true, shouldDirty: true });
    }
    if (Array.isArray(suggestions.materials) && suggestions.materials.length > 0) {
      setValue("materials", suggestions.materials.join(", "), { shouldValidate: true, shouldDirty: true });
    }
    if (suggestions.fullDescription) {
      setValue("description", suggestions.fullDescription, { shouldValidate: true, shouldDirty: true });
    }
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
      wearItWithIds,
      publishStatus: values.publishStatus,
      fulfillmentType: values.fulfillmentType,
      productionNote: values.productionNote || "",
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

  function markStepComplete(step) {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  }

  function canProceedToNext() {
    if (currentStep === 1) {
      return getValues("name") && getValues("slug") && getValues("category");
    }
    if (currentStep === 2) {
      return getValues("image");
    }
    if (currentStep === 3) {
      return getValues("description") && getValues("materials");
    }
    if (currentStep === 4) {
      return getValues("price") && getValues("artisanLocation");
    }
    return true;
  }

  function handleNext() {
    if (canProceedToNext()) {
      markStepComplete(currentStep);
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <AdminLayout title="Add Product">
      <div className="product-wizard-container">
        {/* Wizard Header */}
        <div className="product-wizard-intro">
          <div className="product-wizard-intro-copy">
            <h2 className="product-wizard-title">Create New Product</h2>
            <p className="product-wizard-subtitle">Step {currentStep} of {WIZARD_STEPS.length} • {WIZARD_STEPS[currentStep - 1].label}</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="product-wizard-header">
          {WIZARD_STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              className={`product-wizard-step ${currentStep === step.id ? "active" : ""} ${completedSteps.includes(step.id) ? "completed" : ""}`}
              onClick={() => {
                if (completedSteps.includes(step.id) || step.id < currentStep) {
                  setCurrentStep(step.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <div className="product-wizard-circle">
                {completedSteps.includes(step.id) ? "✓" : step.id}
              </div>
              <div className="product-wizard-label">{step.label}</div>
            </button>
          ))}
        </div>

        {/* Success Message */}
        {submitError === "success" && (
          <div className="product-success-banner">
            <span>✓</span>
            <div>
              <strong>Product created!</strong>
              <p>Redirecting to products list...</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Info */}
          <div className={`product-card-section ${currentStep === 1 ? "" : "hidden"}`}>
            <div className="product-section-header">
              <div className="product-section-icon">📋</div>
              <div>
                <h3 className="product-section-title">Basic Information</h3>
                <p className="product-section-hint">Product name, category, and type</p>
              </div>
            </div>

            <div className="product-form-grid">
              <label className="product-form-field required">
                <span>Product Name</span>
                <input 
                  className="admin-input" 
                  placeholder="e.g., Maasai Beaded Necklace"
                  {...register("name", { required: "Name is required" })} 
                />
                {errors.name && <span className="product-form-error">{errors.name.message}</span>}
              </label>

              <label className="product-form-field required">
                <span>URL Slug</span>
                <input 
                  className="admin-input" 
                  placeholder="e.g., maasai-beaded-necklace"
                  {...register("slug", { required: "Slug is required" })} 
                />
                {errors.slug && <span className="product-form-error">{errors.slug.message}</span>}
              </label>

              <div className="product-form-field">
                <button 
                  type="button" 
                  className="product-btn product-btn--secondary" 
                  onClick={fillSlugFromName}
                >
                  Generate from Name
                </button>
              </div>

              <label className="product-form-field required">
                <span>Category</span>
                <select className="admin-input" {...register("category", { required: true })}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>

              {isJewellery && (
                <label className="product-form-field required">
                  <span>Jewellery Type</span>
                  <select className="admin-input" {...register("jewelryType")}>
                    {jewelryTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {getJewelryTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="product-form-field required">
                <span>Artisan Location</span>
                <input 
                  className="admin-input" 
                  placeholder="e.g., Nairobi, Kenya"
                  {...register("artisanLocation", { required: "Location is required" })} 
                />
              </label>

              <label className="product-form-field">
                <span>Artisan</span>
                <select className="admin-input" {...register("artisanId")}>
                  <option value="">-- Select an artisan --</option>
                  {artisans.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.location})
                    </option>
                  ))}
                </select>
                <span className="product-form-hint">Link to the maker of this piece</span>
              </label>

              <label className="product-form-field">
                <span>Years of Practice</span>
                <input 
                  type="number" 
                  className="admin-input" 
                  placeholder="0"
                  {...register("yearsOfPractice")} 
                />
              </label>
            </div>
          </div>

          {/* Step 2: Images */}
          <div className={`product-card-section ${currentStep === 2 ? "" : "hidden"}`}>
            <div className="product-section-header">
              <div className="product-section-icon">🖼️</div>
              <div>
                <h3 className="product-section-title">Product Images</h3>
                <p className="product-section-hint">Upload close-up, styled, and detail photos</p>
              </div>
            </div>

            <MediaPathHelper uploadFolder={uploadFolder} suggestedFolder={suggestedFolder} />
            {isJewellery && <JewelryPhotoGuide />}

            <ProductAIAssistant
              values={{
                ...getValues(),
                image: imageValue,
                stylingImage: stylingImageValue,
                detailImage: detailImageValue,
              }}
              onApply={applyAiSuggestions}
            />

            <div className="product-form-grid">
              <label className="product-form-field required">
                <span>Primary Close-Up Image</span>
                <input 
                  className="admin-input" 
                  placeholder="/product-images/..."
                  {...register("image", { required: "Main image is required" })} 
                />
                {errors.image && <span className="product-form-error">{errors.image.message}</span>}
              </label>

              <LocalImageUpload
                label="Upload Close-Up"
                folder={uploadFolder}
                onUploaded={(path) => setValue("image", path, { shouldValidate: true })}
              />

              <label className="product-form-field">
                <span>Worn/Styled Photo</span>
                <input 
                  className="admin-input" 
                  placeholder="/product-images/..."
                  {...register("stylingImage")} 
                />
              </label>

              <LocalImageUpload
                label="Upload Styled Photo"
                folder={uploadFolder}
                onUploaded={(path) => setValue("stylingImage", path, { shouldValidate: true })}
              />

              <label className="product-form-field">
                <span>Detail Photo</span>
                <input 
                  className="admin-input" 
                  placeholder="/product-images/..."
                  {...register("detailImage")} 
                />
              </label>

              <LocalImageUpload
                label="Upload Detail Photo"
                folder={uploadFolder}
                onUploaded={(path) => setValue("detailImage", path, { shouldValidate: true })}
              />
            </div>

            {imageValue && (
              <div className="product-form-hint" style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(192, 77, 41, 0.05)", borderRadius: "8px", borderLeft: "3px solid #C04D29" }}>
                <strong>Main image:</strong> {imageValue}
              </div>
            )}
          </div>

          {/* Step 3: Description */}
          <div className={`product-card-section ${currentStep === 3 ? "" : "hidden"}`}>
            <div className="product-section-header">
              <div className="product-section-icon">✍️</div>
              <div>
                <h3 className="product-section-title">Product Details</h3>
                <p className="product-section-hint">Materials, description, and style info</p>
              </div>
            </div>

            <div className="product-form-grid">
              <label className="product-form-field required" style={{ gridColumn: "1 / -1" }}>
                <span>Materials Used</span>
                <input 
                  className="admin-input" 
                  placeholder="e.g., Glass beads, brass clasp, leather cord"
                  {...register("materials", { required: "Materials are required" })} 
                />
                {errors.materials && <span className="product-form-error">{errors.materials.message}</span>}
                <span className="product-form-hint">Comma-separated list of materials</span>
              </label>

              <label className="product-form-field required" style={{ gridColumn: "1 / -1" }}>
                <span>Product Description</span>
                <textarea 
                  className="admin-input" 
                  style={{ minHeight: "180px" }}
                  placeholder="Write a compelling description for customers. Include style details, how to wear, care instructions, etc."
                  {...register("description", { required: "Description is required" })} 
                />
                {errors.description && <span className="product-form-error">{errors.description.message}</span>}
                <span className="product-form-hint">Tip: Start with what it is, then mention colors, handmade details, and style occasions</span>
              </label>

              <label className="product-form-field" style={{ gridColumn: "1 / -1" }}>
                <span>Production Notes</span>
                <input 
                  className="admin-input" 
                  placeholder="e.g., 3-5 days after confirmation, confirm colors first"
                  {...register("productionNote")} 
                />
                <span className="product-form-hint">Notes for admin and WhatsApp customer communication</span>
              </label>

              <div style={{ gridColumn: "1 / -1" }}>
                <WearItWithPicker
                  products={catalogProducts}
                  selectedIds={wearItWithIds}
                  onChange={(nextIds) => setValue("wearItWithIds", nextIds)}
                  currentProductId={getValues("id")}
                  currentProductSlug={slugValue}
                />
              </div>
            </div>
          </div>

          {/* Step 4: Pricing & Inventory */}
          <div className={`product-card-section ${currentStep === 4 ? "" : "hidden"}`}>
            <div className="product-section-header">
              <div className="product-section-icon">💰</div>
              <div>
                <h3 className="product-section-title">Pricing & Inventory</h3>
                <p className="product-section-hint">Price, discounts, and stock levels</p>
              </div>
            </div>

            <div className="product-form-grid">
              <label className="product-form-field required">
                <span>Selling Price (KES)</span>
                <input 
                  type="number" 
                  className="admin-input" 
                  placeholder="0"
                  {...register("price", { required: "Price is required" })} 
                />
                {errors.price && <span className="product-form-error">{errors.price.message}</span>}
              </label>

              <label className="product-form-field">
                <span>Original Price (KES)</span>
                <input 
                  type="number" 
                  className="admin-input" 
                  placeholder="Leave blank if no discount"
                  {...register("originalPrice")} 
                />
                <span className="product-form-hint">Show crossed-out original price</span>
              </label>

              <label className="product-form-field">
                <span>Stock Available</span>
                <input 
                  type="number" 
                  className="admin-input" 
                  placeholder="1"
                  {...register("stock")} 
                />
              </label>
            </div>
          </div>

          {/* Step 5: Advanced */}
          <div className={`product-card-section ${currentStep === 5 ? "" : "hidden"}`}>
            <div className="product-section-header">
              <div className="product-section-icon">⚙️</div>
              <div>
                <h3 className="product-section-title">Advanced Settings</h3>
                <p className="product-section-hint">Visibility, fulfillment, and special flags</p>
              </div>
            </div>

            <div className="product-form-grid">
              <label className="product-form-field">
                <span>Visibility</span>
                <select className="admin-input" {...register("publishStatus")}>
                  {publishStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "published" ? "Published (Visible)" : "Draft (Hidden)"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="product-form-field">
                <span>Fulfillment Type</span>
                <select className="admin-input" {...register("fulfillmentType")}>
                  {fulfillmentTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {getFulfillmentTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Step 6: Review */}
          <div className={`product-card-section ${currentStep === 6 ? "" : "hidden"}`}>
            <div className="product-section-header">
              <div className="product-section-icon">✓</div>
              <div>
                <h3 className="product-section-title">Review Your Product</h3>
                <p className="product-section-hint">Double-check everything before publishing</p>
              </div>
            </div>

            <div className="product-review-grid">
              <div className="product-review-item">
                <span className="product-review-label">Name</span>
                <span className="product-review-value">{getValues("name")}</span>
              </div>
              <div className="product-review-item">
                <span className="product-review-label">Slug</span>
                <span className="product-review-value">{getValues("slug")}</span>
              </div>
              <div className="product-review-item">
                <span className="product-review-label">Category</span>
                <span className="product-review-value">{getValues("category")}</span>
              </div>
              <div className="product-review-item">
                <span className="product-review-label">Price</span>
                <span className="product-review-value">{formatKES(getValues("price"))}</span>
              </div>
              <div className="product-review-item">
                <span className="product-review-label">Stock</span>
                <span className="product-review-value">{getValues("stock")} units</span>
              </div>
              <div className="product-review-item">
                <span className="product-review-label">Status</span>
                <span className="product-review-value">
                  <span className={`product-review-badge ${getValues("publishStatus") === "published" ? "published" : "draft"}`}>
                    {getValues("publishStatus") === "published" ? "📢 Published" : "📝 Draft"}
                  </span>
                </span>
              </div>
              {imageValue && (
                <div className="product-review-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="product-review-label">Primary Image</span>
                  <span className="product-review-value" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{imageValue}</span>
                </div>
              )}
              {getValues("description") && (
                <div className="product-review-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="product-review-label">Description Preview</span>
                  <span className="product-review-value" style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                    {getValues("description").substring(0, 200)}...
                  </span>
                </div>
              )}
            </div>

            {submitError && submitError !== "success" && (
              <div className="product-form-error" style={{ marginTop: "1rem", padding: "1rem", background: "rgba(220, 53, 69, 0.1)", borderRadius: "8px", borderLeft: "3px solid #dc3545" }}>
                {submitError}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="product-form-actions">
            <button
              type="button"
              className="product-btn product-btn--secondary"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              ← Back
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                className="product-btn product-btn--primary"
                onClick={handleNext}
                disabled={!canProceedToNext()}
              >
                Next Step →
              </button>
            ) : (
              <button
                type="submit"
                className="product-btn product-btn--primary"
              >
                ✓ Create Product
              </button>
            )}
          </div>
        </form>

        <style jsx>{`
          .product-wizard-container {
            max-width: 100%;
          }

          .product-wizard-intro {
            position: relative;
            overflow: hidden;
            padding: 2.5rem 2rem;
            margin-bottom: 2rem;
            border-radius: 20px;
            background: linear-gradient(135deg, 
              rgba(192, 77, 41, 0.08) 0%,
              rgba(31, 143, 128, 0.05) 100%
            );
            border: 1px solid rgba(192, 77, 41, 0.15);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
          }

          .product-wizard-intro::before {
            content: '';
            position: absolute;
            top: -40%;
            right: -10%;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(242, 201, 76, 0.15), transparent 70%);
            pointer-events: none;
          }

          .product-wizard-intro-copy {
            position: relative;
            z-index: 1;
          }

          .product-wizard-title {
            margin: 0 0 0.5rem 0;
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .product-wizard-subtitle {
            margin: 0;
            font-size: 0.95rem;
            color: var(--text-muted);
          }

          .product-wizard-header {
            display: flex;
            gap: 1rem;
            margin-bottom: 2.5rem;
            overflow-x: auto;
            padding-bottom: 0.5rem;
            scroll-behavior: smooth;
          }

          .product-wizard-header::-webkit-scrollbar {
            height: 4px;
          }

          .product-wizard-header::-webkit-scrollbar-track {
            background: transparent;
          }

          .product-wizard-header::-webkit-scrollbar-thumb {
            background: rgba(192, 77, 41, 0.2);
            border-radius: 2px;
          }

          .product-wizard-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            min-width: 140px;
            position: relative;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            font-family: inherit;
          }

          .product-wizard-step::after {
            content: '';
            position: absolute;
            top: 24px;
            left: 100%;
            width: 32px;
            height: 2px;
            background: linear-gradient(90deg, 
              var(--border-default),
              transparent
            );
          }

          .product-wizard-step:last-child::after {
            display: none;
          }

          .product-wizard-step.active::after {
            background: linear-gradient(90deg, 
              #C04D29,
              rgba(192, 77, 41, 0.4)
            );
          }

          .product-wizard-circle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 2px solid var(--border-default);
            background: white;
            font-weight: 700;
            font-size: 1.1rem;
            color: var(--text-muted);
            transition: all 0.3s ease;
          }

          .product-wizard-step.active .product-wizard-circle {
            border-color: #C04D29;
            background: linear-gradient(135deg, rgba(192, 77, 41, 0.12), rgba(192, 77, 41, 0.04));
            color: #C04D29;
            box-shadow: 0 0 12px rgba(192, 77, 41, 0.2);
          }

          .product-wizard-step.completed .product-wizard-circle {
            border-color: #4CAF50;
            background: #4CAF50;
            color: white;
          }

          .product-wizard-label {
            font-size: 0.875rem;
            font-weight: 600;
            text-align: center;
            color: var(--text-muted);
            transition: color 0.3s ease;
          }

          .product-wizard-step.active .product-wizard-label {
            color: #C04D29;
            font-weight: 700;
          }

          .product-card-section {
            position: relative;
            overflow: hidden;
            padding: 2rem;
            margin-bottom: 2rem;
            border-radius: 16px;
            background: linear-gradient(135deg,
              rgba(255, 255, 255, 0.9),
              rgba(255, 249, 236, 0.95)
            );
            border: 1px solid var(--border-default);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
            animation: slideInUp 0.4s ease-out;
          }

          .product-card-section.hidden {
            display: none;
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .product-section-header {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid var(--border-default);
          }

          .product-section-icon {
            width: 44px;
            height: 44px;
            min-width: 44px;
            border-radius: 12px;
            background: linear-gradient(135deg, rgba(192, 77, 41, 0.15), rgba(212, 165, 116, 0.1));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: #C04D29;
          }

          .product-section-title {
            margin: 0 0 0.25rem 0;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .product-section-hint {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-muted);
          }

          .product-form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .product-form-field {
            display: grid;
            gap: 0.6rem;
          }

          .product-form-field label {
            font-weight: 600;
            font-size: 0.95rem;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .product-form-field > span {
            font-weight: 600;
            font-size: 0.95rem;
            color: var(--text-primary);
          }

          .product-form-field.required > span::after {
            content: '*';
            color: #C04D29;
            font-weight: 700;
            margin-left: 0.25rem;
          }

          .product-form-field input,
          .product-form-field select,
          .product-form-field textarea {
            width: 100%;
            padding: 0.875rem;
            border: 1.5px solid var(--border-default);
            border-radius: 10px;
            background: white;
            font-size: 0.95rem;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          .product-form-field input:focus,
          .product-form-field select:focus,
          .product-form-field textarea:focus {
            outline: none;
            border-color: #C04D29;
            box-shadow: 0 0 0 3px rgba(192, 77, 41, 0.1);
            background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 249, 236, 0.5));
          }

          .product-form-field textarea {
            min-height: 120px;
            resize: vertical;
          }

          .product-form-hint {
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-top: 0.4rem;
            line-height: 1.4;
          }

          .product-form-hint strong {
            color: var(--text-primary);
            font-weight: 600;
          }

          .product-form-error {
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 0.4rem;
          }

          .product-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.875rem 1.75rem;
            border-radius: 10px;
            border: none;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
            font-family: inherit;
          }

          .product-btn--primary {
            background: linear-gradient(135deg, #C04D29, #a8400e);
            color: white;
            box-shadow: 0 4px 12px rgba(192, 77, 41, 0.25);
          }

          .product-btn--primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(192, 77, 41, 0.35);
          }

          .product-btn--secondary {
            background: white;
            color: var(--text-primary);
            border: 1.5px solid var(--border-default);
          }

          .product-btn--secondary:hover:not(:disabled) {
            border-color: #C04D29;
            background: linear-gradient(135deg, rgba(192, 77, 41, 0.05), transparent);
          }

          .product-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: none;
          }

          .product-form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            padding: 2rem;
            margin-top: 2rem;
            border-top: 2px solid var(--border-default);
            background: linear-gradient(135deg,
              rgba(255, 255, 255, 0.5),
              rgba(255, 249, 236, 0.5)
            );
            border-radius: 16px;
          }

          .product-success-banner {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            border-radius: 12px;
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05));
            border: 1.5px solid rgba(76, 175, 80, 0.3);
            color: #2e7d32;
            margin-bottom: 2rem;
            animation: slideInDown 0.4s ease-out;
            font-weight: 600;
          }

          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .product-review-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
          }

          .product-review-item {
            display: grid;
            gap: 0.5rem;
            padding: 1rem;
            background: white;
            border-radius: 10px;
            border: 1px solid var(--border-default);
          }

          .product-review-label {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .product-review-value {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            word-break: break-word;
          }

          .product-review-badge {
            display: inline-block;
            padding: 0.4rem 0.8rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
          }

          .product-review-badge.published {
            background: rgba(76, 175, 80, 0.1);
            color: #2e7d32;
          }

          .product-review-badge.draft {
            background: rgba(255, 152, 0, 0.1);
            color: #e65100;
          }

          @media (max-width: 768px) {
            .product-wizard-step {
              min-width: 110px;
            }

            .product-card-section {
              padding: 1.5rem;
            }

            .product-form-grid {
              grid-template-columns: 1fr;
            }

            .product-form-actions {
              flex-direction: column-reverse;
              gap: 0.75rem;
            }

            .product-btn {
              width: 100%;
            }

            .product-wizard-intro {
              padding: 1.5rem;
            }

            .product-wizard-title {
              font-size: 1.35rem;
            }

            .product-section-header {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
