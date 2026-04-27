"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import PublishPanel from "@/components/admin/PublishPanel";
import { supabase } from "@/lib/supabase/client";

type CategoryRecord = {
  name: string;
  subcategories: string[] | null;
};

type RelatedProduct = {
  id: string;
  name: string;
  category: string;
};

type ProductRecord = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category: string;
  subcategory: string | null;
  stock_quantity: number;
  low_stock_alert: number;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  artisan: string | null;
  care_instructions: string | null;
  sku: string | null;
  is_visible: boolean;
  is_featured: boolean;
  is_new: boolean;
};

type FormState = {
  name: string;
  description: string;
  price: string;
  sale_price: string;
  category: string;
  subcategory: string;
  stock_quantity: string;
  low_stock_alert: string;
  images: string[];
  artisan: string;
  care_instructions: string;
  sku: string;
  sizes: string[];
  colors: string[];
  is_visible: boolean;
  is_featured: boolean;
  is_new: boolean;
};

const AFRICAN_WEAR_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const ACCESSORY_SIZES = ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42"];
const COLOR_OPTIONS = ["White", "Black", "Red", "Brown", "Green", "Blue", "Cream", "Terracotta"];

function emptyState(): FormState {
  return {
    name: "",
    description: "",
    price: "",
    sale_price: "",
    category: "",
    subcategory: "",
    stock_quantity: "5",
    low_stock_alert: "2",
    images: [],
    artisan: "By Sharon",
    care_instructions: "",
    sku: "",
    sizes: [],
    colors: [],
    is_visible: true,
    is_featured: false,
    is_new: true,
  };
}

function categoryInitials(category: string) {
  return category
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 3) || "SC";
}

function generateSku(category: string) {
  const initials = categoryInitials(category);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SC-${initials}-${random}`;
}

function normalizeItems(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function priceNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function defaultSubcategory(categories: CategoryRecord[], categoryName: string) {
  const record = categories.find((category) => category.name === categoryName);
  return record?.subcategories?.[0] || "";
}

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const isEditing = Boolean(productId);
  const [form, setForm] = useState<FormState>(emptyState);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [artisans, setArtisans] = useState<string[]>(["By Sharon"]);
  const [allProducts, setAllProducts] = useState<RelatedProduct[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [relatedSearch, setRelatedSearch] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void bootstrap();
  }, [productId]);

  async function bootstrap() {
    setLoading(isEditing);
    setError("");

    const [categoriesResult, artisansResult, productsResult] = await Promise.all([
      supabase.from("categories").select("name, subcategories").order("display_order", { ascending: true }),
      supabase.from("products").select("artisan"),
      supabase.from("products").select("id, name, category").order("name", { ascending: true }),
    ]);

    if (categoriesResult.data) {
      setCategories((categoriesResult.data as CategoryRecord[]) || []);
    }

    if (artisansResult.data) {
      const values = Array.from(
        new Set(
          artisansResult.data
            .map((row) => String(row.artisan || "").trim())
            .filter(Boolean),
        ),
      );
      setArtisans(values.length ? values : ["By Sharon"]);
    }

    if (productsResult.data) {
      setAllProducts((productsResult.data as RelatedProduct[]) || []);
    }

    if (!isEditing || !productId) {
      setLoading(false);
      return;
    }

    const [productResult, relationsResult] = await Promise.all([
      supabase.from("products").select("*").eq("id", productId).maybeSingle(),
      supabase
        .from("product_relations")
        .select("related_product_id")
        .eq("product_id", productId)
        .order("display_order", { ascending: true }),
    ]);

    if (productResult.error || !productResult.data) {
      setError(productResult.error?.message || "Could not load product.");
      setLoading(false);
      return;
    }

    const product = productResult.data as ProductRecord;
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price || ""),
      sale_price: product.sale_price ? String(product.sale_price) : "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      stock_quantity: String(product.stock_quantity ?? 0),
      low_stock_alert: String(product.low_stock_alert ?? 2),
      images: product.images || [],
      artisan: product.artisan || "By Sharon",
      care_instructions: product.care_instructions || "",
      sku: product.sku || "",
      sizes: product.sizes || [],
      colors: product.colors || [],
      is_visible: product.is_visible,
      is_featured: product.is_featured,
      is_new: product.is_new,
    });

    setPinnedIds((relationsResult.data || []).map((row) => String(row.related_product_id)));
    setLoading(false);
  }

  const availableSubcategories = useMemo(() => {
    return categories.find((category) => category.name === form.category)?.subcategories || [];
  }, [categories, form.category]);

  const availableSizes = useMemo(() => {
    if (form.category === "African Wear") return AFRICAN_WEAR_SIZES;
    if (form.category === "Accessories") return ACCESSORY_SIZES;
    return [];
  }, [form.category]);

  const relatedSuggestions = useMemo(() => {
    const query = relatedSearch.trim().toLowerCase();
    return allProducts
      .filter((product) => product.id !== productId)
      .filter((product) => product.category === form.category)
      .filter((product) => !pinnedIds.includes(product.id))
      .filter((product) => !query || product.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [allProducts, form.category, pinnedIds, productId, relatedSearch]);

  const pinnedProducts = useMemo(() => {
    const byId = new Map(allProducts.map((product) => [product.id, product]));
    return pinnedIds.map((id) => byId.get(id)).filter(Boolean) as RelatedProduct[];
  }, [allProducts, pinnedIds]);

  const autoSuggestions = useMemo(() => {
    return allProducts
      .filter((product) => product.id !== productId)
      .filter((product) => product.category === form.category)
      .filter((product) => !pinnedIds.includes(product.id))
      .slice(0, 4);
  }, [allProducts, form.category, pinnedIds, productId]);

  const checklist = useMemo(() => {
    return [
      { label: "At least 1 photo uploaded", complete: form.images.length >= 1 },
      { label: "Product name entered", complete: Boolean(form.name.trim()) },
      { label: "Category selected", complete: Boolean(form.category) },
      { label: "Price set in KES", complete: Number(form.price) > 0 },
      { label: "Stock quantity set", complete: form.stock_quantity.trim() !== "" },
      { label: "Description written", complete: Boolean(form.description.trim()) },
    ];
  }, [form]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleCollectionValue(field: "sizes" | "colors", value: string) {
    const currentValues = form[field];
    setField(
      field,
      currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value],
    );
  }

  function addImage() {
    const next = imageInput.trim();
    if (!next) return;
    setForm((current) => ({ ...current, images: normalizeItems([...current.images, next]) }));
    setImageInput("");
  }

  function moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= form.images.length) return;

    const nextImages = [...form.images];
    const [image] = nextImages.splice(index, 1);
    nextImages.splice(nextIndex, 0, image);
    setField("images", nextImages);
  }

  function removeImage(index: number) {
    setField(
      "images",
      form.images.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  function pinRelatedProduct(id: string) {
    if (pinnedIds.includes(id) || pinnedIds.length >= 4) return;
    setPinnedIds((current) => [...current, id]);
  }

  function unpinRelatedProduct(id: string) {
    setPinnedIds((current) => current.filter((item) => item !== id));
  }

  function validateForPublish() {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.category) return "Category is required.";
    if (priceNumber(form.price) <= 0) return "Price must be greater than zero.";
    if (form.stock_quantity.trim() === "") return "Stock quantity is required.";
    if (!form.images.length) return "At least one image is required to publish.";
    return "";
  }

  async function saveProduct(mode: "publish" | "draft") {
    const validationError = mode === "publish" ? validateForPublish() : "";
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: priceNumber(form.price),
      sale_price: form.sale_price.trim() ? priceNumber(form.sale_price) : null,
      category: form.category,
      subcategory: form.subcategory || null,
      stock_quantity: Math.max(0, Number(form.stock_quantity || 0)),
      low_stock_alert: Math.max(0, Number(form.low_stock_alert || 0)),
      images: normalizeItems(form.images),
      sizes: form.sizes,
      colors: form.colors,
      artisan: form.artisan.trim() || "By Sharon",
      care_instructions: form.care_instructions.trim() || null,
      sku: form.sku.trim() || generateSku(form.category),
      is_visible: mode === "draft" ? false : form.is_visible,
      is_featured: form.is_featured,
      is_new: form.is_new,
    };

    let savedProductId = productId || "";

    if (isEditing && productId) {
      const { error: updateError } = await supabase.from("products").update(payload).eq("id", productId);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
      savedProductId = productId;
    } else {
      const { data, error: insertError } = await supabase
        .from("products")
        .insert([payload])
        .select("id")
        .single();

      if (insertError || !data) {
        setError(insertError?.message || "Could not create product.");
        setSaving(false);
        return;
      }

      savedProductId = String(data.id);
    }

    await supabase.from("product_relations").delete().eq("product_id", savedProductId);

    if (pinnedIds.length) {
      const relationRows = pinnedIds.slice(0, 4).map((relatedProductId, index) => ({
        product_id: savedProductId,
        related_product_id: relatedProductId,
        display_order: index + 1,
      }));

      const { error: relationsError } = await supabase.from("product_relations").insert(relationRows);
      if (relationsError) {
        setError(relationsError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    router.push("/admin/products");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse bg-[#fafaf8]" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-[2px] border border-[#f0f0f0] bg-white" />
            <div className="h-64 animate-pulse rounded-[2px] border border-[#f0f0f0] bg-white" />
          </div>
          <div className="h-64 animate-pulse rounded-[2px] border border-[#f0f0f0] bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[2px] text-[#999]">
            {isEditing ? "Edit Product" : "Add Product"}
          </p>
          <p className="mt-2 text-[12px] text-[#555]">
            Keep every field precise. The public site will read directly from this product.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555]"
        >
          Back to products
        </Link>
      </section>

      {error ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
          <p className="text-[11px] text-[#C0392B]">{error}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Images</p>
            <div className="mt-4">
              <ImageUpload />
            </div>
            <div className="mt-4 flex gap-3">
              <input
                value={imageInput}
                onChange={(event) => setImageInput(event.target.value)}
                placeholder="Paste image URL"
                className="h-9 flex-1 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
              />
              <button
                type="button"
                onClick={addImage}
                className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555]"
              >
                Add URL
              </button>
            </div>
            <p className="mt-3 text-[11px] text-[#999]">
              Adding more photos increases sales — try to add 3+
            </p>
            <div className="mt-4 space-y-3">
              {form.images.map((image, index) => (
                <div key={`${image}-${index}`} className="flex items-center gap-3 border border-[#f0f0f0] p-3">
                  <div className="h-14 w-14 overflow-hidden rounded-[2px] bg-[#f4f4f2]">
                    <img src={image} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] text-[#1c1c1c]">{image}</p>
                    <p className="mt-1 text-[10px] text-[#999]">
                      {index === 0 ? "Main card image" : `Image ${index + 1}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => moveImage(index, -1)} className="h-8 rounded-[2px] border border-[#e0e0e0] px-2 text-[10px] uppercase tracking-[1px] text-[#555]">
                      Up
                    </button>
                    <button type="button" onClick={() => moveImage(index, 1)} className="h-8 rounded-[2px] border border-[#e0e0e0] px-2 text-[10px] uppercase tracking-[1px] text-[#555]">
                      Down
                    </button>
                    <button type="button" onClick={() => removeImage(index)} className="h-8 rounded-[2px] bg-[#C0392B] px-2 text-[10px] uppercase tracking-[1px] text-white">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Details</p>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Product name</label>
                <input
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                  placeholder="Describe the piece — its Swahili name meaning, how it's made, how to wear it, care instructions"
                  rows={5}
                  className="mt-2 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 py-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Artisan</label>
                  <select
                    value={form.artisan}
                    onChange={(event) => setField("artisan", event.target.value)}
                    className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                  >
                    {artisans.map((artisan) => (
                      <option key={artisan} value={artisan}>
                        {artisan}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Care instructions</label>
                  <input
                    value={form.care_instructions}
                    onChange={(event) => setField("care_instructions", event.target.value)}
                    className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Category</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Category</label>
                <select
                  value={form.category}
                  onChange={(event) => {
                    const nextCategory = event.target.value;
                    setForm((current) => ({
                      ...current,
                      category: nextCategory,
                      subcategory: defaultSubcategory(categories, nextCategory),
                      sku: current.sku || generateSku(nextCategory),
                    }));
                  }}
                  className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Subcategory</label>
                <select
                  value={form.subcategory}
                  onChange={(event) => setField("subcategory", event.target.value)}
                  className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                >
                  <option value="">Select subcategory</option>
                  {availableSubcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Pricing</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Price KES</label>
                <input
                  value={form.price}
                  onChange={(event) => setField("price", event.target.value)}
                  type="number"
                  min="0"
                  className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Sale price KES</label>
                <input
                  value={form.sale_price}
                  onChange={(event) => setField("sale_price", event.target.value)}
                  type="number"
                  min="0"
                  className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Stock quantity</label>
                <input
                  value={form.stock_quantity}
                  onChange={(event) => setField("stock_quantity", event.target.value)}
                  type="number"
                  min="0"
                  className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Low stock alert</label>
                <input
                  value={form.low_stock_alert}
                  onChange={(event) => setField("low_stock_alert", event.target.value)}
                  type="number"
                  min="0"
                  className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-[2px] text-[#999]">SKU</label>
                <div className="mt-2 flex gap-3">
                  <input
                    value={form.sku}
                    onChange={(event) => setField("sku", event.target.value)}
                    className="h-9 flex-1 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                  />
                  <button
                    type="button"
                    onClick={() => setField("sku", generateSku(form.category || "SharonCraft"))}
                    className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555]"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Variants</p>
            <div className="mt-4 space-y-4">
              {availableSizes.length ? (
                <div>
                  <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Sizes</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleCollectionValue("sizes", size)}
                        className={[
                          "h-9 rounded-[2px] border px-3 text-[11px] uppercase tracking-[1px]",
                          form.sizes.includes(size)
                            ? "border-[#1c1c1c] bg-[#1c1c1c] text-white"
                            : "border-[#e0e0e0] text-[#555]",
                        ].join(" ")}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {form.category === "African Wear" || form.category === "Accessories" ? (
                <div>
                  <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Colors</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleCollectionValue("colors", color)}
                        className={[
                          "h-9 rounded-[2px] border px-3 text-[11px] uppercase tracking-[1px]",
                          form.colors.includes(color)
                            ? "border-[#1c1c1c] bg-[#1c1c1c] text-white"
                            : "border-[#e0e0e0] text-[#555]",
                        ].join(" ")}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Publish</p>
            <div className="mt-4 space-y-3 text-[11px] text-[#555]">
              <label className="flex items-center justify-between gap-3">
                <span>Visible on shop</span>
                <input
                  type="checkbox"
                  checked={form.is_visible}
                  onChange={(event) => setField("is_visible", event.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Featured on homepage</span>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(event) => setField("is_featured", event.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Mark as New</span>
                <input
                  type="checkbox"
                  checked={form.is_new}
                  onChange={(event) => setField("is_new", event.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>In Stock</span>
                <input
                  type="checkbox"
                  checked={Number(form.stock_quantity || 0) > 0}
                  onChange={(event) => setField("stock_quantity", event.target.checked ? "1" : "0")}
                />
              </label>
            </div>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => void saveProduct("publish")}
                disabled={saving}
                className="inline-flex h-11 w-full items-center justify-center rounded-[2px] bg-[#1c1c1c] text-[11px] uppercase tracking-[3px] text-white disabled:opacity-60"
              >
                {saving ? "Saving" : "Publish Product"}
              </button>
              <button
                type="button"
                onClick={() => void saveProduct("draft")}
                disabled={saving}
                className="inline-flex h-11 w-full items-center justify-center rounded-[2px] border border-[#e0e0e0] text-[11px] uppercase tracking-[2px] text-[#555] disabled:opacity-60"
              >
                Save as Draft
              </button>
            </div>
          </section>

          <PublishPanel checklist={checklist} />

          <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">You May Also Like</p>
            <p className="mt-2 text-[11px] text-[#555]">
              Pin up to 4 products. Pinned products appear first on the public product page.
            </p>
            <input
              value={relatedSearch}
              onChange={(event) => setRelatedSearch(event.target.value)}
              placeholder="Search products to pin"
              className="mt-4 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
            />

            {pinnedProducts.length ? (
              <div className="mt-4 space-y-2">
                {pinnedProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between border border-[#f0f0f0] px-3 py-3">
                    <div>
                      <p className="text-[11px] text-[#1c1c1c]">{product.name}</p>
                      <p className="mt-1 text-[10px] text-[#999]">{product.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => unpinRelatedProduct(product.id)}
                      className="text-[10px] uppercase tracking-[1px] text-[#C0392B]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 space-y-2">
              {relatedSuggestions.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => pinRelatedProduct(product.id)}
                  disabled={pinnedIds.length >= 4}
                  className="flex w-full items-center justify-between border border-[#f0f0f0] px-3 py-3 text-left disabled:opacity-50"
                >
                  <div>
                    <p className="text-[11px] text-[#1c1c1c]">{product.name}</p>
                    <p className="mt-1 text-[10px] text-[#999]">{product.category}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[1px] text-[#555]">Pin</span>
                </button>
              ))}
            </div>

            {!relatedSuggestions.length && form.category ? (
              <div className="mt-4 rounded-[2px] border border-[#f0f0f0] bg-[#fafafa] p-3">
                <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Auto Suggestions</p>
                <div className="mt-3 space-y-2">
                  {autoSuggestions.length ? (
                    autoSuggestions.map((product) => (
                      <div key={product.id} className="border border-[#f0f0f0] bg-white px-3 py-3">
                        <p className="text-[11px] text-[#1c1c1c]">{product.name}</p>
                        <p className="mt-1 text-[10px] text-[#999]">{product.category}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#555]">No same-category suggestions yet.</p>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function EditProductPage() {
  const params = useParams();
  const productId = typeof params?.id === "string" ? params.id : "";
  return <ProductEditor productId={productId} />;
}
