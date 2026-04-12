import { useQuery, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import AdminLayout from "../../../components/admin/AdminLayout";
import LocalImageUpload from "../../../components/admin/LocalImageUpload";
import { categoryOptions } from "../../../data/site";

const categories = categoryOptions.filter((c) => c !== "All");

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

const defaults = {
  id: "",
  slug: "",
  name: "",
  artisan: "",
  artisanLocation: "",
  yearsOfPractice: 5,
  materialsStr: "",
  category: "Jewellery",
  price: 0,
  originalPrice: "",
  image: "",
  stock: 1,
  isSold: false,
  isNew: true,
  featured: false,
  recent: true,
  description: "",
};

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
    price: product.price,
    originalPrice: product.originalPrice ?? "",
    image: product.image ?? "",
    stock: product.stock ?? 0,
    isSold: Boolean(product.isSold),
    isNew: Boolean(product.isNew),
    featured: Boolean(product.featured),
    recent: Boolean(product.recent),
    description: product.description ?? "",
  };
}

export default function AdminProductEditorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawId = router.query.id;
  const id = typeof rawId === "string" ? rawId : null;
  const isNew = id === "new";

  const { register, handleSubmit, reset, watch, setValue } = useForm({ defaultValues: defaults });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    enabled: router.isReady,
    queryFn: async () => {
      const response = await fetch("/api/admin/products", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Failed");
      return response.json();
    },
  });

  const existing = useMemo(() => (products && id && !isNew ? products.find((p) => p.id === id) : null), [
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

  function fillIdsFromName() {
    const base = slugify(nameValue);
    if (!base) return;
    setValue("slug", base);
    if (isNew) setValue("id", `sc-${base}`);
  }

  async function onSubmit(values) {
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
      price: Number(values.price),
      originalPrice,
      image: values.image.trim(),
      images: values.image.trim() ? [{ src: values.image.trim() }] : [],
      stock: Number(values.stock),
      isSold: Boolean(values.isSold),
      isNew: Boolean(values.isNew),
      featured: Boolean(values.featured),
      recent: Boolean(values.recent),
      description: values.description.trim(),
      story: existing?.story ?? {
        artisanName: values.artisan.trim(),
        artisanLocation: values.artisanLocation.trim(),
        yearsOfPractice: Number(values.yearsOfPractice) || 0,
        materials,
        text: "",
        culturalNote: "",
        behindScenesPhoto: "",
      },
    };

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
    if (!response.ok) return;
    await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    router.push("/admin/products");
  }

  const notFound = router.isReady && !isNew && products && !existing;

  return (
    <>
      <Head>
        <title>{isNew ? "New piece" : "Edit piece"} — Gallery Admin</title>
      </Head>
      <AdminLayout
        title={isNew ? "New piece" : "Edit piece"}
        action={
          <Link href="/admin/products" className="admin-button admin-button--secondary">
            Back to stock
          </Link>
        }
      >
        {!router.isReady || isLoading ? <p className="admin-note">Loading…</p> : null}

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
              <label className="admin-field">
                <span className="admin-note">Image path</span>
                <input
                  className="admin-input"
                  placeholder="/media/products/slug-main.webp"
                  {...register("image", { required: true })}
                />
              </label>
            </div>

            <LocalImageUpload onUploaded={(uploadedPath) => setValue("image", uploadedPath)} />

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
          </form>
        ) : null}
      </AdminLayout>
    </>
  );
}
