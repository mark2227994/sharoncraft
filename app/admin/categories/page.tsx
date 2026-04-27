"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type CategoryRecord = {
  id: string;
  name: string;
  subcategories: string[] | null;
  image_url: string | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
};

type ProductRecord = {
  category: string | null;
};

type DraftCategory = CategoryRecord & {
  productCount: number;
};

type NewCategoryForm = {
  name: string;
  subcategoryInput: string;
  subcategories: string[];
  imageUrl: string;
};

function emptyNewCategory(): NewCategoryForm {
  return {
    name: "",
    subcategoryInput: "",
    subcategories: [],
    imageUrl: "",
  };
}

function slugify(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeSubcategories(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

async function uploadCategoryImage(file: File, categoryName: string) {
  const extension = file.name.split(".").pop() || "jpg";
  const filePath = `categories/${slugify(categoryName || "category")}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("homepage-images")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("homepage-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<DraftCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState("");
  const [draggedId, setDraggedId] = useState("");
  const [newCategory, setNewCategory] = useState<NewCategoryForm>(emptyNewCategory);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const [categoriesResult, productsResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, subcategories, image_url, is_visible, display_order, created_at")
        .order("display_order", { ascending: true }),
      supabase.from("products").select("category"),
    ]);

    if (categoriesResult.error || productsResult.error) {
      setError(categoriesResult.error?.message || productsResult.error?.message || "Could not load categories.");
      setLoading(false);
      return;
    }

    const counts = new Map<string, number>();
    ((productsResult.data || []) as ProductRecord[]).forEach((product) => {
      const key = String(product.category || "").trim();
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    setCategories(
      ((categoriesResult.data || []) as CategoryRecord[]).map((category) => ({
        ...category,
        subcategories: category.subcategories || [],
        productCount: counts.get(category.name) || 0,
      })),
    );
    setLoading(false);
  }

  function setCategoryField(categoryId: string, patch: Partial<DraftCategory>) {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId ? { ...category, ...patch } : category,
      ),
    );
  }

  async function saveCategory(category: DraftCategory) {
    setSavingId(category.id);
    setError("");
    setMessage("");

    const payload = {
      name: category.name.trim(),
      subcategories: normalizeSubcategories(category.subcategories || []),
      image_url: category.image_url?.trim() || null,
      is_visible: category.is_visible,
      display_order: category.display_order,
    };

    if (!payload.name) {
      setError("Category name is required.");
      setSavingId("");
      return;
    }

    const { error: updateError } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", category.id);

    if (updateError) {
      setError(updateError.message);
      setSavingId("");
      return;
    }

    setMessage(`Saved ${payload.name}.`);
    setSavingId("");
  }

  async function persistOrder(reordered: DraftCategory[]) {
    const updates = reordered.map((category, index) => ({
      id: category.id,
      display_order: index + 1,
    }));

    await Promise.all(
      updates.map((row) =>
        supabase.from("categories").update({ display_order: row.display_order }).eq("id", row.id),
      ),
    );
  }

  async function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) return;

    const current = [...categories];
    const fromIndex = current.findIndex((category) => category.id === draggedId);
    const toIndex = current.findIndex((category) => category.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);

    const reordered = current.map((category, index) => ({
      ...category,
      display_order: index + 1,
    }));

    setCategories(reordered);
    setDraggedId("");
    await persistOrder(reordered);
    setMessage("Category order updated.");
  }

  async function handleDelete(categoryId: string) {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    setSavingId(categoryId);
    const { error: deleteError } = await supabase.from("categories").delete().eq("id", categoryId);

    if (deleteError) {
      setError(deleteError.message);
      setSavingId("");
      return;
    }

    const nextCategories = categories
      .filter((category) => category.id !== categoryId)
      .map((category, index) => ({ ...category, display_order: index + 1 }));

    setCategories(nextCategories);
    await persistOrder(nextCategories);
    setMessage("Category deleted.");
    setSavingId("");
  }

  async function handleVisibility(category: DraftCategory) {
    const nextVisible = !category.is_visible;
    setCategoryField(category.id, { is_visible: nextVisible });

    const { error: updateError } = await supabase
      .from("categories")
      .update({ is_visible: nextVisible })
      .eq("id", category.id);

    if (updateError) {
      setCategoryField(category.id, { is_visible: category.is_visible });
      setError(updateError.message);
      return;
    }

    setMessage(`${category.name} visibility updated.`);
  }

  async function handleRowImageUpload(categoryId: string, file: File | null) {
    if (!file) return;

    const category = categories.find((item) => item.id === categoryId);
    if (!category) return;

    setSavingId(categoryId);
    setError("");

    try {
      const publicUrl = await uploadCategoryImage(file, category.name);
      setCategoryField(categoryId, { image_url: publicUrl });

      const { error: updateError } = await supabase
        .from("categories")
        .update({ image_url: publicUrl })
        .eq("id", categoryId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setMessage(`${category.name} photo updated.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload image.");
    } finally {
      setSavingId("");
    }
  }

  async function handleCreateCategory() {
    setCreating(true);
    setError("");
    setMessage("");

    const name = newCategory.name.trim();
    if (!name) {
      setError("Category name is required.");
      setCreating(false);
      return;
    }

    const payload = {
      name,
      subcategories: normalizeSubcategories(newCategory.subcategories),
      image_url: newCategory.imageUrl.trim() || null,
      is_visible: true,
      display_order: categories.length + 1,
    };

    const { data, error: insertError } = await supabase
      .from("categories")
      .insert([payload])
      .select("id, name, subcategories, image_url, is_visible, display_order, created_at")
      .single();

    if (insertError || !data) {
      setError(insertError?.message || "Could not create category.");
      setCreating(false);
      return;
    }

    setCategories((current) => [
      ...current,
      {
        ...(data as CategoryRecord),
        subcategories: (data.subcategories as string[] | null) || [],
        productCount: 0,
      },
    ]);
    setNewCategory(emptyNewCategory());
    setMessage(`${payload.name} created.`);
    setCreating(false);
  }

  async function handleNewImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    try {
      const publicUrl = await uploadCategoryImage(file, newCategory.name || "category");
      setNewCategory((current) => ({ ...current, imageUrl: publicUrl }));
      setMessage("New category image uploaded.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload image.");
    } finally {
      event.target.value = "";
    }
  }

  function moveSubcategory(categoryId: string, index: number, direction: -1 | 1) {
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId) return category;
        const next = [...(category.subcategories || [])];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= next.length) return category;
        const [item] = next.splice(index, 1);
        next.splice(targetIndex, 0, item);
        return { ...category, subcategories: next };
      }),
    );
  }

  function removeSubcategory(categoryId: string, index: number) {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              subcategories: (category.subcategories || []).filter((_, itemIndex) => itemIndex !== index),
            }
          : category,
      ),
    );
  }

  function addSubcategoryToCategory(categoryId: string, value: string) {
    const nextValue = value.trim();
    if (!nextValue) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              subcategories: normalizeSubcategories([...(category.subcategories || []), nextValue]),
            }
          : category,
      ),
    );
  }

  const totalVisible = useMemo(
    () => categories.filter((category) => category.is_visible).length,
    [categories],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse bg-[#fafaf8]" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-[2px] border border-[#f0f0f0] bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Store Structure</p>
          <p className="mt-2 text-[12px] text-[#555]">
            Organize the catalog categories the product editor and public shop rely on.
          </p>
        </div>
        <p className="text-[11px] text-[#555]">
          {categories.length} categories · {totalVisible} visible
        </p>
      </section>

      {message ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
          <p className="text-[11px] text-[#166534]">{message}</p>
        </section>
      ) : null}

      {error ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
          <p className="text-[11px] text-[#C0392B]">{error}</p>
        </section>
      ) : null}

      <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Add Category</p>
            <p className="mt-2 text-[11px] text-[#555]">Create a new storefront section with its own subcategories.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Category name</label>
              <input
                value={newCategory.name}
                onChange={(event) =>
                  setNewCategory((current) => ({ ...current, name: event.target.value }))
                }
                className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Category image URL</label>
              <input
                value={newCategory.imageUrl}
                onChange={(event) =>
                  setNewCategory((current) => ({ ...current, imageUrl: event.target.value }))
                }
                placeholder="Paste image URL or upload below"
                className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Upload image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleNewImageUpload}
                className="mt-2 block w-full text-[11px] text-[#555] file:mr-3 file:h-9 file:rounded-[2px] file:border file:border-[#e0e0e0] file:bg-white file:px-3 file:text-[11px] file:uppercase file:tracking-[1px] file:text-[#555]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[2px] text-[#999]">Subcategories</label>
              <div className="mt-2 flex gap-3">
                <input
                  value={newCategory.subcategoryInput}
                  onChange={(event) =>
                    setNewCategory((current) => ({ ...current, subcategoryInput: event.target.value }))
                  }
                  placeholder="Add a subcategory"
                  className="h-9 flex-1 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setNewCategory((current) => ({
                      ...current,
                      subcategories: normalizeSubcategories([
                        ...current.subcategories,
                        current.subcategoryInput,
                      ]),
                      subcategoryInput: "",
                    }))
                  }
                  className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555]"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {newCategory.subcategories.map((subcategory, index) => (
                <div
                  key={`${subcategory}-${index}`}
                  className="inline-flex items-center gap-2 rounded-[2px] border border-[#f0f0f0] bg-[#fafafa] px-3 py-2 text-[11px] text-[#555]"
                >
                  <span>{subcategory}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewCategory((current) => ({
                        ...current,
                        subcategories: current.subcategories.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                    className="text-[#C0392B]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void handleCreateCategory()}
              disabled={creating}
              className="inline-flex h-11 items-center rounded-[2px] bg-[#1c1c1c] px-4 text-[11px] uppercase tracking-[2px] text-white disabled:opacity-60"
            >
              {creating ? "Saving" : "Save Category"}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            draggedId={draggedId}
            saving={savingId === category.id}
            onDragStart={(event) => {
              setDraggedId(category.id);
              event.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={async () => {
              await handleDrop(category.id);
            }}
            onFieldChange={setCategoryField}
            onAddSubcategory={addSubcategoryToCategory}
            onMoveSubcategory={moveSubcategory}
            onRemoveSubcategory={removeSubcategory}
            onSave={saveCategory}
            onToggleVisibility={handleVisibility}
            onDelete={handleDelete}
            onUploadImage={handleRowImageUpload}
          />
        ))}
      </section>
    </div>
  );
}

function CategoryRow({
  category,
  draggedId,
  saving,
  onDragStart,
  onDragOver,
  onDrop,
  onFieldChange,
  onAddSubcategory,
  onMoveSubcategory,
  onRemoveSubcategory,
  onSave,
  onToggleVisibility,
  onDelete,
  onUploadImage,
}: {
  category: DraftCategory;
  draggedId: string;
  saving: boolean;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: () => Promise<void>;
  onFieldChange: (categoryId: string, patch: Partial<DraftCategory>) => void;
  onAddSubcategory: (categoryId: string, value: string) => void;
  onMoveSubcategory: (categoryId: string, index: number, direction: -1 | 1) => void;
  onRemoveSubcategory: (categoryId: string, index: number) => void;
  onSave: (category: DraftCategory) => Promise<void>;
  onToggleVisibility: (category: DraftCategory) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
  onUploadImage: (categoryId: string, file: File | null) => Promise<void>;
}) {
  const [subcategoryInput, setSubcategoryInput] = useState("");

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={() => void onDrop()}
      className={[
        "rounded-[2px] border border-[#f0f0f0] bg-white p-4",
        draggedId === category.id ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[2px] bg-[#f4f4f2] text-[10px] uppercase tracking-[2px] text-[#999]">
            {category.image_url ? (
              <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
            ) : (
              "No Photo"
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Category name</p>
              <input
                value={category.name}
                onChange={(event) => onFieldChange(category.id, { name: event.target.value })}
                className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Image URL</p>
                <input
                  value={category.image_url || ""}
                  onChange={(event) => onFieldChange(category.id, { image_url: event.target.value })}
                  className="mt-2 h-9 w-full rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Change photo</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => void onUploadImage(category.id, event.target.files?.[0] || null)}
                  className="mt-2 block w-full text-[11px] text-[#555] file:mr-3 file:h-9 file:rounded-[2px] file:border file:border-[#e0e0e0] file:bg-white file:px-3 file:text-[11px] file:uppercase file:tracking-[1px] file:text-[#555]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-[2px] bg-[#fafafa] px-3 py-2 text-[10px] uppercase tracking-[2px] text-[#999]">
            Drag to reorder
          </span>
          <span className="inline-flex rounded-[2px] border border-[#f0f0f0] px-3 py-2 text-[10px] uppercase tracking-[2px] text-[#555]">
            {category.productCount} products
          </span>
          <button
            type="button"
            onClick={() => void onToggleVisibility(category)}
            className={[
              "inline-flex h-9 items-center rounded-[2px] px-3 text-[11px] uppercase tracking-[1px]",
              category.is_visible ? "bg-[#1c1c1c] text-white" : "border border-[#e0e0e0] text-[#555]",
            ].join(" ")}
          >
            {category.is_visible ? "Visible" : "Hidden"}
          </button>
          <button
            type="button"
            onClick={() => void onSave(category)}
            disabled={saving}
            className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555] disabled:opacity-60"
          >
            {saving ? "Saving" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => void onDelete(category.id)}
            disabled={saving}
            className="inline-flex h-9 items-center rounded-[2px] bg-[#C0392B] px-3 text-[11px] uppercase tracking-[1px] text-white disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 border-t border-[#f0f0f0] pt-4">
        <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Subcategories</p>
        <div className="mt-3 flex gap-3">
          <input
            value={subcategoryInput}
            onChange={(event) => setSubcategoryInput(event.target.value)}
            placeholder="Add subcategory"
            className="h-9 flex-1 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
          />
          <button
            type="button"
            onClick={() => {
              onAddSubcategory(category.id, subcategoryInput);
              setSubcategoryInput("");
            }}
            className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555]"
          >
            Add
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {(category.subcategories || []).length ? (
            (category.subcategories || []).map((subcategory, index) => (
              <div
                key={`${subcategory}-${index}`}
                className="flex items-center justify-between gap-3 border border-[#f0f0f0] px-3 py-3 text-[11px] text-[#555]"
              >
                <span>{subcategory}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onMoveSubcategory(category.id, index, -1)}
                    className="h-8 rounded-[2px] border border-[#e0e0e0] px-2 text-[10px] uppercase tracking-[1px] text-[#555]"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSubcategory(category.id, index, 1)}
                    className="h-8 rounded-[2px] border border-[#e0e0e0] px-2 text-[10px] uppercase tracking-[1px] text-[#555]"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveSubcategory(category.id, index)}
                    className="h-8 rounded-[2px] bg-[#C0392B] px-2 text-[10px] uppercase tracking-[1px] text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[2px] border border-[#f0f0f0] bg-[#fafafa] p-3">
              <p className="text-[11px] text-[#555]">No subcategories yet.</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
