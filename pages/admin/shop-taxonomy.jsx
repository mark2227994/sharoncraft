import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { cloneShopCategoryTree, normalizeShopCategoryTree } from "../../data/site";

function slugifyValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCsv(value) {
  return Array.from(
    new Set(
      String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function stringifyCsv(values) {
  return Array.isArray(values) ? values.join(", ") : "";
}

function cloneTree(tree) {
  return JSON.parse(JSON.stringify(tree));
}

function createNode(label = "New Item") {
  return {
    id: slugifyValue(label) || `item-${Date.now()}`,
    label,
    queryValue: "",
    match: {
      categories: [],
      jewelryTypes: [],
      keywords: [],
    },
    children: [],
  };
}

function updateNodeByPath(nodes, path, updater) {
  return nodes.map((node, index) => {
    if (index !== path[0]) return node;
    if (path.length === 1) {
      return updater(node);
    }
    return {
      ...node,
      children: updateNodeByPath(Array.isArray(node.children) ? node.children : [], path.slice(1), updater),
    };
  });
}

function removeNodeByPath(nodes, path) {
  if (path.length === 1) {
    return nodes.filter((_, index) => index !== path[0]);
  }

  return nodes.map((node, index) => {
    if (index !== path[0]) return node;
    return {
      ...node,
      children: removeNodeByPath(Array.isArray(node.children) ? node.children : [], path.slice(1)),
    };
  });
}

function moveNodeByPath(nodes, path, direction) {
  if (path.length === 1) {
    const next = nodes.slice();
    const fromIndex = path[0];
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= next.length) return next;
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
  }

  return nodes.map((node, index) => {
    if (index !== path[0]) return node;
    return {
      ...node,
      children: moveNodeByPath(Array.isArray(node.children) ? node.children : [], path.slice(1), direction),
    };
  });
}

function TaxonomyNodeEditor({
  node,
  path,
  depth,
  onChange,
  onAddChild,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  const categoriesValue = stringifyCsv(node?.match?.categories);
  const jewelryTypesValue = stringifyCsv(node?.match?.jewelryTypes);
  const keywordsValue = stringifyCsv(node?.match?.keywords);

  return (
    <div className="admin-panel taxonomy-node" style={{ marginLeft: depth === 0 ? 0 : `${depth * 18}px` }}>
      <div className="taxonomy-node__header">
        <div>
          <p className="overline" style={{ marginBottom: "6px" }}>
            {depth === 0 ? "Main Category" : depth === 1 ? "Subcategory" : "Nested Subcategory"}
          </p>
          <p className="heading-sm" style={{ marginBottom: 0 }}>
            {node.label || "Untitled"}
          </p>
        </div>

        <div className="taxonomy-node__actions">
          <button type="button" className="admin-button admin-button--secondary" onClick={onMoveUp}>
            Move up
          </button>
          <button type="button" className="admin-button admin-button--secondary" onClick={onMoveDown}>
            Move down
          </button>
          <button type="button" className="admin-button admin-button--secondary" onClick={onAddChild}>
            Add child
          </button>
          {node.id !== "all" ? (
            <button type="button" className="admin-button admin-button--secondary" onClick={onRemove}>
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <div className="taxonomy-node__grid">
        <label className="admin-field">
          <span className="admin-note">Label</span>
          <input
            className="admin-input"
            value={node.label || ""}
            onChange={(event) => onChange({ label: event.target.value })}
            onBlur={(event) => {
              const nextLabel = event.target.value.trim();
              if (!node.id || node.id.startsWith("item-") || node.id === slugifyValue(node.label)) {
                onChange({ id: slugifyValue(nextLabel) || node.id || `item-${Date.now()}` });
              }
            }}
          />
        </label>

        <label className="admin-field">
          <span className="admin-note">ID</span>
          <input
            className="admin-input"
            value={node.id || ""}
            onChange={(event) => onChange({ id: slugifyValue(event.target.value) })}
          />
        </label>

        <label className="admin-field">
          <span className="admin-note">Query value (main category tabs)</span>
          <input
            className="admin-input"
            value={node.queryValue || ""}
            onChange={(event) => onChange({ queryValue: event.target.value })}
            placeholder="Optional display/query mapping"
          />
        </label>

        <label className="admin-field taxonomy-node__wide">
          <span className="admin-note">Match categories</span>
          <input
            className="admin-input"
            value={categoriesValue}
            onChange={(event) =>
              onChange({
                match: {
                  ...(node.match || {}),
                  categories: parseCsv(event.target.value),
                },
              })
            }
            placeholder="Jewellery, Accessories, Home & Living"
          />
        </label>

        <label className="admin-field">
          <span className="admin-note">Jewellery types</span>
          <input
            className="admin-input"
            value={jewelryTypesValue}
            onChange={(event) =>
              onChange({
                match: {
                  ...(node.match || {}),
                  jewelryTypes: parseCsv(event.target.value),
                },
              })
            }
            placeholder="necklace, bracelet, earring"
          />
        </label>

        <label className="admin-field taxonomy-node__wide">
          <span className="admin-note">Keyword matching</span>
          <input
            className="admin-input"
            value={keywordsValue}
            onChange={(event) =>
              onChange({
                match: {
                  ...(node.match || {}),
                  keywords: parseCsv(event.target.value),
                },
              })
            }
            placeholder="hoop, drop, shuka, basket"
          />
        </label>
      </div>

      {Array.isArray(node.children) && node.children.length > 0 ? (
        <div className="taxonomy-node__children">
          {node.children.map((child, index) => (
            <TaxonomyNodeEditor
              key={`${child.id || "node"}-${path.join("-")}-${index}`}
              node={child}
              path={[...path, index]}
              depth={depth + 1}
              onChange={(patch) => onChange({ children: updateNodeByPath(node.children, [index], (current) => ({ ...current, ...patch })) })}
              onAddChild={() => {
                const nextChild = createNode(`New ${depth + 1 > 1 ? "Subcategory" : "Category"}`);
                onChange({ children: [...(node.children || []), nextChild] });
              }}
              onRemove={() => onChange({ children: removeNodeByPath(node.children || [], [index]) })}
              onMoveUp={() => onChange({ children: moveNodeByPath(node.children || [], [index], -1) })}
              onMoveDown={() => onChange({ children: moveNodeByPath(node.children || [], [index], 1) })}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ShopTaxonomyAdminPage() {
  const [taxonomy, setTaxonomy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/admin/shop-taxonomy", { credentials: "same-origin" });
        if (!response.ok) {
          throw new Error("Could not load shop taxonomy");
        }
        const data = await response.json();
        if (!cancelled) {
          setTaxonomy(normalizeShopCategoryTree(data));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Could not load shop taxonomy");
          setTaxonomy(cloneShopCategoryTree());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateRootNode(index, patch) {
    setTaxonomy((current) =>
      updateNodeByPath(current, [index], (node) => ({
        ...node,
        ...patch,
      })),
    );
  }

  function addRootNode() {
    setTaxonomy((current) => [...current, createNode(`Category ${current.length + 1}`)]);
  }

  function resetToDefault() {
    setTaxonomy(cloneShopCategoryTree());
    setMessage("Reset to the default shop taxonomy. Save to publish it.");
    setError("");
  }

  async function saveTaxonomy() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const normalized = normalizeShopCategoryTree(cloneTree(taxonomy));
      const response = await fetch("/api/admin/shop-taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(normalized),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Could not save shop taxonomy");
      }

      setTaxonomy(normalizeShopCategoryTree(data.data));
      setMessage("Saved shop taxonomy. The shop page will use this structure immediately.");
    } catch (saveError) {
      setError(saveError.message || "Could not save shop taxonomy");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>Shop Taxonomy - Gallery Admin</title>
      </Head>

      <AdminLayout
        title="Shop Taxonomy"
        action={
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/shop" className="admin-button admin-button--secondary" target="_blank">
              View shop
            </Link>
            <button type="button" className="admin-button" onClick={saveTaxonomy} disabled={saving || loading}>
              {saving ? "Saving..." : "Save taxonomy"}
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="admin-note">Loading shop taxonomy...</p>
        ) : (
          <div className="taxonomy-page">
            <section className="admin-panel taxonomy-intro">
              <p className="overline" style={{ marginBottom: "8px" }}>
                Shop Navigation
              </p>
              <p className="heading-sm" style={{ marginBottom: "8px" }}>
                Control the categories and subcategories shown on the shop page
              </p>
              <p className="admin-note" style={{ marginBottom: "12px" }}>
                Each node controls both the menu label and how products are matched. Update the label, then adjust
                category, jewellery type, or keyword rules if the filter should catch a different set of products.
              </p>

              <div className="taxonomy-intro__actions">
                <button type="button" className="admin-button admin-button--secondary" onClick={addRootNode}>
                  Add main category
                </button>
                <button type="button" className="admin-button admin-button--secondary" onClick={resetToDefault}>
                  Reset to default
                </button>
              </div>

              {message ? <p className="admin-note taxonomy-message taxonomy-message--success">{message}</p> : null}
              {error ? <p className="admin-note taxonomy-message taxonomy-message--error">{error}</p> : null}
            </section>

            <section className="taxonomy-page__main">
              <div className="taxonomy-editor">
                {taxonomy.map((node, index) => (
                  <TaxonomyNodeEditor
                    key={`${node.id || "node"}-${index}`}
                    node={node}
                    path={[index]}
                    depth={0}
                    onChange={(patch) => updateRootNode(index, patch)}
                    onAddChild={() => {
                      const nextChild = createNode("New Subcategory");
                      updateRootNode(index, { children: [...(node.children || []), nextChild] });
                    }}
                    onRemove={() => {
                      if (node.id === "all") return;
                      setTaxonomy((current) => removeNodeByPath(current, [index]));
                    }}
                    onMoveUp={() => setTaxonomy((current) => moveNodeByPath(current, [index], -1))}
                    onMoveDown={() => setTaxonomy((current) => moveNodeByPath(current, [index], 1))}
                  />
                ))}
              </div>

              <aside className="admin-panel taxonomy-help">
                <p className="overline" style={{ marginBottom: "8px" }}>
                  Matching Guide
                </p>
                <p className="caption" style={{ marginBottom: "12px" }}>
                  `Match categories` checks the product category field.
                </p>
                <p className="caption" style={{ marginBottom: "12px" }}>
                  `Jewellery types` narrows Jewellery pieces to values like `necklace`, `bracelet`, or `earring`.
                </p>
                <p className="caption" style={{ marginBottom: "12px" }}>
                  `Keyword matching` looks inside the product name, description, materials, and details.
                </p>
                <p className="caption" style={{ marginBottom: "12px" }}>
                  Keep the `all` node at the top so the shop always has an All tab.
                </p>
                <p className="caption" style={{ marginBottom: 0 }}>
                  Changes save into the same durable site-content storage used by other admin sections.
                </p>
              </aside>
            </section>
          </div>
        )}

        <style jsx>{`
          .taxonomy-page {
            display: grid;
            gap: var(--space-5);
          }

          .taxonomy-intro__actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .taxonomy-page__main {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 320px;
            gap: var(--space-5);
            align-items: start;
          }

          .taxonomy-editor {
            display: grid;
            gap: var(--space-4);
          }

          .taxonomy-node {
            border-left: 3px solid rgba(192, 77, 41, 0.12);
          }

          .taxonomy-node__header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: flex-start;
            margin-bottom: 16px;
          }

          .taxonomy-node__actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .taxonomy-node__grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .taxonomy-node__wide {
            grid-column: 1 / -1;
          }

          .taxonomy-node__children {
            display: grid;
            gap: 12px;
            margin-top: 16px;
          }

          .taxonomy-help {
            position: sticky;
            top: 24px;
          }

          .taxonomy-message {
            margin-top: 16px;
            padding: 12px 14px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }

          .taxonomy-message--success {
            background: #ecfdf5;
            border-color: #86efac;
            color: #166534;
          }

          .taxonomy-message--error {
            background: #fef2f2;
            border-color: #fca5a5;
            color: #991b1b;
          }

          @media (max-width: 1100px) {
            .taxonomy-page__main {
              grid-template-columns: 1fr;
            }

            .taxonomy-help {
              position: static;
            }
          }

          @media (max-width: 720px) {
            .taxonomy-node__header,
            .taxonomy-node__grid {
              grid-template-columns: 1fr;
            }

            .taxonomy-node__header {
              flex-direction: column;
            }

            .taxonomy-node__actions {
              justify-content: flex-start;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  );
}
