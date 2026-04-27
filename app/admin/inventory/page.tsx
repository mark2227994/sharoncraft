"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type ProductRecord = {
  id: string;
  name: string;
  category: string;
  stock_quantity: number;
  low_stock_alert: number;
  images: string[] | null;
};

function stockTone(stockQuantity: number, lowStockAlert: number) {
  if (stockQuantity <= lowStockAlert) return "text-[#C0392B]";
  if (stockQuantity <= lowStockAlert + 2) return "text-[#8B5E3C]";
  return "text-[#166534]";
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkValue, setBulkValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingKey, setSavingKey] = useState("");

  useEffect(() => {
    void loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("products")
      .select("id, name, category, stock_quantity, low_stock_alert, images")
      .order("stock_quantity", { ascending: true });

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    const safeProducts = (data || []) as ProductRecord[];
    setProducts(safeProducts);
    setDrafts(
      Object.fromEntries(
        safeProducts.map((product) => [product.id, String(product.stock_quantity ?? 0)]),
      ),
    );
    setLoading(false);
  }

  function toggleSelected(productId: string) {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function toggleAll() {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(products.map((product) => product.id));
  }

  async function saveStock(productId: string, quantity: number) {
    setSavingKey(productId);
    setError("");
    setMessage("");

    const safeQuantity = Math.max(0, quantity);
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock_quantity: safeQuantity })
      .eq("id", productId);

    if (updateError) {
      setError(updateError.message);
      setSavingKey("");
      return;
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, stock_quantity: safeQuantity } : product,
      ),
    );
    setDrafts((current) => ({ ...current, [productId]: String(safeQuantity) }));
    setMessage("Stock updated.");
    setSavingKey("");
  }

  async function applyBulkUpdate() {
    const nextValue = Number(bulkValue);
    if (!selectedIds.length || !Number.isFinite(nextValue) || nextValue < 0) {
      setError("Enter a valid bulk stock value.");
      return;
    }

    setSavingKey("bulk");
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock_quantity: nextValue })
      .in("id", selectedIds);

    if (updateError) {
      setError(updateError.message);
      setSavingKey("");
      return;
    }

    setProducts((current) =>
      current.map((product) =>
        selectedIds.includes(product.id) ? { ...product, stock_quantity: nextValue } : product,
      ),
    );
    setDrafts((current) => ({
      ...current,
      ...Object.fromEntries(selectedIds.map((id) => [id, String(nextValue)])),
    }));
    setSelectedIds([]);
    setBulkValue("");
    setMessage("Bulk stock update applied.");
    setSavingKey("");
  }

  const lowStockItems = useMemo(
    () =>
      products.filter(
        (product) => Number(product.stock_quantity || 0) <= Number(product.low_stock_alert || 0),
      ),
    [products],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse bg-[#fafaf8]" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-[2px] border border-[#f0f0f0] bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Stock Control</p>
          <p className="mt-2 text-[12px] text-[#555]">
            Keep stock quantities current so low-stock alerts and product publishing stay accurate.
          </p>
        </div>
        <p className="text-[11px] text-[#555]">{products.length} products tracked</p>
      </section>

      {lowStockItems.length ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
          <p className="text-[10px] uppercase tracking-[2px] text-[#C0392B]">Restock Alert</p>
          <p className="mt-2 text-[11px] text-[#555]">
            {lowStockItems.length} products need restocking.
          </p>
        </section>
      ) : null}

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

      {selectedIds.length ? (
        <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <p className="text-[11px] text-[#555]">{selectedIds.length} products selected</p>
            <div className="flex flex-1 flex-wrap gap-3">
              <input
                type="number"
                min="0"
                value={bulkValue}
                onChange={(event) => setBulkValue(event.target.value)}
                placeholder="New stock value"
                className="h-9 w-[180px] rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
              />
              <button
                type="button"
                onClick={() => void applyBulkUpdate()}
                disabled={savingKey === "bulk"}
                className="inline-flex h-9 items-center rounded-[2px] bg-[#1c1c1c] px-3 text-[11px] uppercase tracking-[1px] text-white disabled:opacity-60"
              >
                {savingKey === "bulk" ? "Applying" : "Apply to selected"}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="hidden overflow-x-auto rounded-[2px] border border-[#f0f0f0] bg-white lg:block">
        <table className="min-w-full">
          <thead className="bg-[#fafafa]">
            <tr className="text-left text-[9px] uppercase tracking-[2px] text-[#999]">
              <th className="px-4 py-[10px]">
                <input
                  type="checkbox"
                  checked={products.length > 0 && selectedIds.length === products.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-[10px]">Image</th>
              <th className="px-4 py-[10px]">Product</th>
              <th className="px-4 py-[10px]">Category</th>
              <th className="px-4 py-[10px]">Stock</th>
              <th className="px-4 py-[10px]">Alert</th>
              <th className="px-4 py-[10px]">Update</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
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
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-[10px] text-[#1c1c1c]">{product.name}</td>
                <td className="px-4 py-[10px]">{product.category}</td>
                <td className={`px-4 py-[10px] ${stockTone(product.stock_quantity, product.low_stock_alert)}`}>
                  {product.stock_quantity}
                </td>
                <td className="px-4 py-[10px]">{product.low_stock_alert}</td>
                <td className="px-4 py-[10px]">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      value={drafts[product.id] ?? String(product.stock_quantity)}
                      onChange={(event) =>
                        setDrafts((current) => ({ ...current, [product.id]: event.target.value }))
                      }
                      className="h-9 w-24 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
                    />
                    <button
                      type="button"
                      onClick={() => void saveStock(product.id, Number(drafts[product.id] || 0))}
                      disabled={savingKey === product.id}
                      className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555] disabled:opacity-60"
                    >
                      {savingKey === product.id ? "Saving" : "Save"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 lg:hidden">
        {products.map((product) => (
          <article key={product.id} className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <label className="flex items-center gap-2 text-[11px] text-[#555]">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(product.id)}
                  onChange={() => toggleSelected(product.id)}
                />
                Select
              </label>
              <span className={`text-[11px] ${stockTone(product.stock_quantity, product.low_stock_alert)}`}>
                {product.stock_quantity} in stock
              </span>
            </div>

            <div className="flex gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-[2px] bg-[#f4f4f2]">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div>
                <p className="text-[12px] text-[#1c1c1c]">{product.name}</p>
                <p className="mt-1 text-[10px] text-[#999]">{product.category}</p>
                <p className="mt-1 text-[10px] text-[#999]">Alert at {product.low_stock_alert}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={drafts[product.id] ?? String(product.stock_quantity)}
                onChange={(event) =>
                  setDrafts((current) => ({ ...current, [product.id]: event.target.value }))
                }
                className="h-9 flex-1 rounded-[2px] border border-[#e0e0e0] bg-[#fafafa] px-3 text-[12px] text-[#1c1c1c] outline-none transition-colors duration-200 ease-in-out focus:border-[#8B5E3C]"
              />
              <button
                type="button"
                onClick={() => void saveStock(product.id, Number(drafts[product.id] || 0))}
                disabled={savingKey === product.id}
                className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555] disabled:opacity-60"
              >
                {savingKey === product.id ? "Saving" : "Save"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
