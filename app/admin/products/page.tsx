"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/admin/ProductCard";
import { supabase } from "@/lib/supabase/client";

type ProductRow = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  category: string;
  subcategory: string | null;
  stock_quantity: number;
  low_stock_alert: number;
  images: string[] | null;
  is_visible: boolean;
};

type CategoryOption = {
  id: string;
  name: string;
};

type VisibilityFilter = "all" | "visible" | "hidden" | "low-stock";

const ITEMS_PER_PAGE = 20;

function formatCurrency(amount: number) {
  return `KES ${Number(amount || 0).toLocaleString("en-KE")}`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<VisibilityFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    void loadProducts();
    void loadCategories();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("products")
      .select("id, name, price, sale_price, category, subcategory, stock_quantity, low_stock_alert, images, is_visible")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    setProducts((data || []) as ProductRow[]);
    setLoading(false);
  }

  async function loadCategories() {
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .order("display_order", { ascending: true });

    setCategories((data || []) as CategoryOption[]);
  }

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        [product.name, product.category, product.subcategory || ""]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

      const isLowStock = Number(product.stock_quantity || 0) <= Number(product.low_stock_alert || 0);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "visible" && product.is_visible) ||
        (statusFilter === "hidden" && !product.is_visible) ||
        (statusFilter === "low-stock" && isLowStock);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function toggleSelected(productId: string) {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function toggleSelectAllVisible() {
    const visibleIds = paginatedProducts.map((product) => product.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
  }

  async function updateVisibility(productId: string, nextVisible: boolean) {
    setWorking(productId);
    const { error: updateError } = await supabase
      .from("products")
      .update({ is_visible: nextVisible })
      .eq("id", productId);

    if (!updateError) {
      setProducts((current) =>
        current.map((product) =>
          product.id === productId ? { ...product, is_visible: nextVisible } : product,
        ),
      );
    }

    setWorking("");
  }

  async function handleDelete(productId: string) {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    setWorking(productId);
    const { error: deleteError } = await supabase.from("products").delete().eq("id", productId);

    if (!deleteError) {
      setProducts((current) => current.filter((product) => product.id !== productId));
      setSelectedIds((current) => current.filter((id) => id !== productId));
    }

    setWorking("");
  }

  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    setWorking("bulk-delete");
    const { error: deleteError } = await supabase.from("products").delete().in("id", selectedIds);

    if (!deleteError) {
      setProducts((current) => current.filter((product) => !selectedIds.includes(product.id)));
      setSelectedIds([]);
    }

    setWorking("");
  }

  async function handleBulkVisibility(nextVisible: boolean) {
    if (!selectedIds.length) return;

    setWorking("bulk-visibility");
    const { error: updateError } = await supabase
      .from("products")
      .update({ is_visible: nextVisible })
      .in("id", selectedIds);

    if (!updateError) {
      setProducts((current) =>
        current.map((product) =>
          selectedIds.includes(product.id) ? { ...product, is_visible: nextVisible } : product,
        ),
      );
      setSelectedIds([]);
    }

    setWorking("");
  }

  const pageStart = filteredProducts.length ? (page - 1) * ITEMS_PER_PAGE + 1 : 0;
  const pageEnd = Math.min(page * ITEMS_PER_PAGE, filteredProducts.length);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Catalog</p>
          <p className="mt-2 text-[12px] text-[#555]">
            {filteredProducts.length} products
            {filteredProducts.length ? ` · showing ${pageStart}-${pageEnd}` : ""}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center rounded-[2px] bg-[#1c1c1c] px-4 text-[11px] uppercase tracking-[2px] text-white transition-opacity duration-200 ease-in-out hover:opacity-90"
        >
          + Add Product
        </Link>
      </section>

      <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="h-9 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-9 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as VisibilityFilter)}
            className="h-9 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
          >
            <option value="all">All status</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
            <option value="low-stock">Low stock</option>
          </select>
        </div>
      </section>

      {selectedIds.length ? (
        <section className="flex flex-col gap-3 rounded-[2px] border border-[#f0f0f0] bg-white p-4 md:flex-row md:items-center">
          <p className="text-[11px] text-[#555]">{selectedIds.length} items selected</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={working === "bulk-delete"}
              className="inline-flex h-9 items-center rounded-[2px] bg-[#C0392B] px-3 text-[11px] uppercase tracking-[1px] text-white disabled:opacity-60"
            >
              Delete selected
            </button>
            <button
              type="button"
              onClick={() => handleBulkVisibility(true)}
              disabled={working === "bulk-visibility"}
              className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555] disabled:opacity-60"
            >
              Make visible
            </button>
            <button
              type="button"
              onClick={() => handleBulkVisibility(false)}
              disabled={working === "bulk-visibility"}
              className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555] disabled:opacity-60"
            >
              Hide selected
            </button>
          </div>
        </section>
      ) : null}

      {loading ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse bg-[#fafaf8]" />
            ))}
          </div>
        </section>
      ) : error ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-6">
          <p className="text-[12px] text-[#C0392B]">Could not load products.</p>
          <p className="mt-2 text-[11px] text-[#555]">{error}</p>
          <button
            type="button"
            onClick={() => void loadProducts()}
            className="mt-4 inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555]"
          >
            Retry
          </button>
        </section>
      ) : filteredProducts.length === 0 ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-6">
          <p className="text-[12px] text-[#1c1c1c]">No products match these filters.</p>
          <p className="mt-2 text-[11px] text-[#555]">
            Try clearing your search, changing category filters, or add a new product.
          </p>
        </section>
      ) : (
        <>
          <section className="hidden overflow-x-auto rounded-[2px] border border-[#f0f0f0] bg-white lg:block">
            <table className="min-w-full">
              <thead className="bg-[#fafafa]">
                <tr className="text-left text-[9px] uppercase tracking-[2px] text-[#999]">
                  <th className="px-4 py-[10px]">
                    <input
                      type="checkbox"
                      checked={
                        paginatedProducts.length > 0 &&
                        paginatedProducts.every((product) => selectedIds.includes(product.id))
                      }
                      onChange={toggleSelectAllVisible}
                    />
                  </th>
                  <th className="px-4 py-[10px]">Image</th>
                  <th className="px-4 py-[10px]">Name</th>
                  <th className="px-4 py-[10px]">Price</th>
                  <th className="px-4 py-[10px]">Stock</th>
                  <th className="px-4 py-[10px]">Category</th>
                  <th className="px-4 py-[10px]">Visible</th>
                  <th className="px-4 py-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => {
                  const isLowStock = Number(product.stock_quantity || 0) <= Number(product.low_stock_alert || 0);
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-[#f0f0f0] text-[11px] text-[#555] transition-colors duration-200 ease-in-out hover:bg-[#fafaf8]"
                    >
                      <td className="px-4 py-[10px]">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelected(product.id)}
                        />
                      </td>
                      <td className="px-4 py-[10px]">
                        <div className="h-10 w-10 overflow-hidden rounded-[2px] bg-[#f4f4f2]">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-[10px]">
                        <p className="text-[12px] text-[#1c1c1c]">{product.name}</p>
                        <p className="mt-1 text-[10px] text-[#999]">{product.subcategory || "No subcategory"}</p>
                      </td>
                      <td className="px-4 py-[10px]">
                        <p className="text-[#1c1c1c]">{formatCurrency(product.price)}</p>
                        {product.sale_price ? (
                          <p className="mt-1 text-[10px] text-[#999] line-through">
                            {formatCurrency(product.sale_price)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-[10px]">
                        <span className={isLowStock ? "text-[#C0392B]" : "text-[#166534]"}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-[10px]">
                        <span className="inline-flex rounded-[2px] bg-[#fafafa] px-2 py-1 text-[10px] text-[#555]">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-[10px]">
                        <button
                          type="button"
                          onClick={() => void updateVisibility(product.id, !product.is_visible)}
                          disabled={working === product.id}
                          className={[
                            "inline-flex h-8 items-center rounded-[2px] px-3 text-[10px] uppercase tracking-[1px] transition-opacity duration-200 ease-in-out",
                            product.is_visible ? "bg-[#1c1c1c] text-white" : "border border-[#e0e0e0] text-[#555]",
                          ].join(" ")}
                        >
                          {product.is_visible ? "Visible" : "Hidden"}
                        </button>
                      </td>
                      <td className="px-4 py-[10px]">
                        <div className="flex items-center gap-3">
                          <Link href={`/admin/products/${product.id}`} className="text-[#1c1c1c]">
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleDelete(product.id)}
                            disabled={working === product.id}
                            className="text-[#C0392B] disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="grid gap-4 lg:hidden">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <label className="flex items-center gap-2 text-[11px] text-[#555]">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelected(product.id)}
                    />
                    Select
                  </label>
                  <button
                    type="button"
                    onClick={() => void updateVisibility(product.id, !product.is_visible)}
                    disabled={working === product.id}
                    className={[
                      "inline-flex h-8 items-center rounded-[2px] px-3 text-[10px] uppercase tracking-[1px]",
                      product.is_visible ? "bg-[#1c1c1c] text-white" : "border border-[#e0e0e0] text-[#555]",
                    ].join(" ")}
                  >
                    {product.is_visible ? "Visible" : "Hidden"}
                  </button>
                </div>
                <ProductCard
                  imageUrl={product.images?.[0] || null}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  salePrice={product.sale_price}
                  stockQuantity={product.stock_quantity}
                />
                <div className="mt-4 flex items-center justify-between">
                  <Link href={`/admin/products/${product.id}`} className="text-[11px] uppercase tracking-[1px] text-[#1c1c1c]">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleDelete(product.id)}
                    disabled={working === product.id}
                    className="text-[11px] uppercase tracking-[1px] text-[#C0392B]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="flex items-center justify-between rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555] disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-[11px] text-[#555]">
              Page {page} of {totalPages}
            </p>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555] disabled:opacity-50"
            >
              Next
            </button>
          </section>
        </>
      )}
    </div>
  );
}
