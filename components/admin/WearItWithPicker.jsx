import { useMemo, useState } from "react";

function moveItem(list, fromIndex, toIndex) {
  const next = list.slice();
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export default function WearItWithPicker({
  products = [],
  selectedIds = [],
  onChange,
  currentProductId = "",
  currentProductSlug = "",
}) {
  const [query, setQuery] = useState("");

  const selectedProducts = useMemo(() => {
    return selectedIds
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean);
  }, [products, selectedIds]);

  const availableProducts = useMemo(() => {
    const normalizedQuery = String(query || "").trim().toLowerCase();

    return products.filter((product) => {
      if (product.id === currentProductId || product.slug === currentProductSlug) return false;
      if (selectedIds.includes(product.id)) return false;
      if (!normalizedQuery) return true;

      return [product.name, product.category, product.jewelryType, product.artisan]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [currentProductId, currentProductSlug, products, query, selectedIds]);

  function addProduct(productId) {
    if (selectedIds.includes(productId)) return;
    onChange([...selectedIds, productId].slice(0, 4));
  }

  function removeProduct(productId) {
    onChange(selectedIds.filter((id) => id !== productId));
  }

  function moveUp(productId) {
    const index = selectedIds.indexOf(productId);
    if (index <= 0) return;
    onChange(moveItem(selectedIds, index, index - 1));
  }

  function moveDown(productId) {
    const index = selectedIds.indexOf(productId);
    if (index < 0 || index >= selectedIds.length - 1) return;
    onChange(moveItem(selectedIds, index, index + 1));
  }

  return (
    <div className="admin-panel" style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
      <p className="overline" style={{ marginBottom: "8px" }}>
        Wear it with
      </p>
      <p className="body-sm" style={{ marginBottom: "12px" }}>
        Choose up to four exact pieces to show on the product page. These manual picks come first, and the automatic
        matching stays as a backup only when nothing is selected.
      </p>

      <label className="admin-field" style={{ marginBottom: "var(--space-4)" }}>
        <span>Search products</span>
        <input
          className="admin-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, category, artisan, or jewellery type"
        />
      </label>

      <div className="admin-grid-2" style={{ alignItems: "start" }}>
        <div>
          <p className="caption" style={{ marginBottom: "8px" }}>
            Selected pieces
          </p>
          <div style={{ display: "grid", gap: "10px" }}>
            {selectedProducts.length === 0 ? (
              <p className="admin-note">No manual pairings selected yet.</p>
            ) : null}
            {selectedProducts.map((product, index) => (
              <div
                key={product.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-card-alt)",
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "var(--radius-md)" }}
                  />
                  <div>
                    <p className="body-sm" style={{ fontWeight: 500 }}>
                      {index + 1}. {product.name}
                    </p>
                    <p className="caption">
                      {product.category}
                      {product.jewelryType ? ` - ${product.jewelryType}` : ""}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button type="button" className="admin-button admin-button--secondary" onClick={() => moveUp(product.id)}>
                    Up
                  </button>
                  <button type="button" className="admin-button admin-button--secondary" onClick={() => moveDown(product.id)}>
                    Down
                  </button>
                  <button type="button" className="admin-button admin-button--secondary" onClick={() => removeProduct(product.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="caption" style={{ marginBottom: "8px" }}>
            Pick from the catalogue
          </p>
          <div style={{ display: "grid", gap: "10px", maxHeight: 420, overflowY: "auto", paddingRight: "4px" }}>
            {availableProducts.slice(0, 18).map((product) => (
              <div
                key={product.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-white)",
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "var(--radius-md)" }}
                  />
                  <div>
                    <p className="body-sm" style={{ fontWeight: 500 }}>
                      {product.name}
                    </p>
                    <p className="caption">
                      {product.category}
                      {product.jewelryType ? ` - ${product.jewelryType}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-button admin-button--secondary"
                  onClick={() => addProduct(product.id)}
                  disabled={selectedIds.length >= 4}
                >
                  Add
                </button>
              </div>
            ))}
            {availableProducts.length === 0 ? <p className="admin-note">No matching products found.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
