import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { readSiteImages } from "../../lib/site-images";
import { readProducts } from "../../lib/store";

const SITE_IMAGE_FIELDS = [
  ["heroImage", "Hero image"],
  ["artisanPortrait", "Artisan portrait"],
  ["collectionJewellery", "Jewellery collection card"],
  ["collectionHome", "Home collection card"],
  ["collectionAccessories", "Accessories collection card"],
  ["pageTexture", "Page texture"],
];

function getSiteEntries(siteImages) {
  return SITE_IMAGE_FIELDS.map(([key, label]) => ({
    id: key,
    type: "site",
    label,
    path: siteImages[key] || "",
    href: "/admin/site-images",
  }));
}

function getProductEntries(products) {
  return products.map((product) => ({
    id: product.id,
    type: "product",
    label: product.name,
    path: product.image || "",
    extra: `${product.category}${product.jewelryType ? ` - ${product.jewelryType}` : ""}`,
    publishStatus: product.publishStatus,
    imageCount: Array.isArray(product.images) ? product.images.length : 0,
    href: `/admin/products/${product.id}`,
  }));
}

function toImageSrcList(images) {
  if (!Array.isArray(images)) return [];
  return images
    .map((image) => {
      if (typeof image === "string") return image.trim();
      if (image && typeof image === "object") {
        return String(image.src || image.url || image.image || "").trim();
      }
      return "";
    })
    .filter(Boolean);
}

export default function AdminImagesPage({ siteImages: initialSiteImages, products: initialProducts }) {
  const [siteImages, setSiteImages] = useState(initialSiteImages || {});
  const [products, setProducts] = useState(initialProducts || []);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [draftPaths, setDraftPaths] = useState({});
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const nextDrafts = {};
    for (const entry of [...getSiteEntries(siteImages), ...getProductEntries(products)]) {
      nextDrafts[`${entry.type}:${entry.id}`] = entry.path || "";
    }
    setDraftPaths(nextDrafts);
  }, [products, siteImages]);

  const entries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...getSiteEntries(siteImages), ...getProductEntries(products)].filter((entry) => {
      if (typeFilter !== "all" && entry.type !== typeFilter) return false;
      if (!query) return true;
      return [entry.label, entry.path, entry.extra].join(" ").toLowerCase().includes(query);
    });
  }, [products, search, siteImages, typeFilter]);

  async function copyPath(path) {
    try {
      await navigator.clipboard.writeText(path);
    } catch {
      // Keep it lightweight if clipboard is unavailable.
    }
  }

  function getDraftKey(entry) {
    return `${entry.type}:${entry.id}`;
  }

  function getDraftPath(entry) {
    return draftPaths[getDraftKey(entry)] ?? entry.path ?? "";
  }

  async function saveEntry(entry) {
    const key = getDraftKey(entry);
    const nextPath = String(draftPaths[key] || "").trim();

    setSavingId(key);
    setMessage("");
    setError("");

    try {
      if (entry.type === "site") {
        const response = await fetch("/api/admin/site-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ [entry.id]: nextPath }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.error || "Could not save site image path");
        }

        const payload = await response.json();
        if (payload?.siteImages) {
          setSiteImages(payload.siteImages);
        } else {
          setSiteImages((current) => ({ ...current, [entry.id]: nextPath }));
        }
      }

      if (entry.type === "product") {
        const product = products.find((item) => item.id === entry.id);
        if (!product) {
          throw new Error("Product not found");
        }

        const existingGallery = toImageSrcList(product.images);
        const nextGallery = [nextPath, ...existingGallery.filter((src) => src !== nextPath)].filter(Boolean);

        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            ...product,
            image: nextPath,
            images: nextGallery,
          }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.error || "Could not save product image path");
        }

        setProducts((current) =>
          current.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  image: nextPath,
                  images: nextGallery,
                }
              : item,
          ),
        );
      }

      setMessage(`${entry.label} image path saved.`);
    } catch (saveError) {
      setError(String(saveError?.message || "Could not save image path"));
    } finally {
      setSavingId("");
    }
  }

  return (
    <AdminLayout
      title="Images"
      action={
        <Link href="/admin/site-images" className="admin-button">
          Edit Site Content
        </Link>
      }
    >
      {message ? <p className="saved-indicator">{message}</p> : null}
      {error ? <p className="admin-form-error">{error}</p> : null}

      <section className="admin-panel" style={{ marginBottom: "var(--space-4)" }}>
        <div className="images-toolbar">
          <input
            className="admin-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by image label, path, or category"
          />
          <select className="admin-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">All images</option>
            <option value="site">Site content</option>
            <option value="product">Product images</option>
          </select>
        </div>
      </section>

      <section className="images-grid">
        {entries.map((entry) => {
          const draft = getDraftPath(entry);
          const key = getDraftKey(entry);
          const isSaving = savingId === key;

          return (
            <article key={key} className="admin-panel image-card">
              {draft ? (
                <img src={draft} alt="" className="image-card__preview" />
              ) : (
                <div className="image-card__empty">No image linked yet</div>
              )}
              <p className="overline">{entry.type === "site" ? "Site asset" : "Product asset"}</p>
              <h2 className="heading-md">{entry.label}</h2>
              {entry.extra ? <p className="caption">{entry.extra}</p> : null}
              {entry.publishStatus ? <p className="caption">Visibility: {entry.publishStatus}</p> : null}
              {typeof entry.imageCount === "number" ? <p className="caption">Gallery images: {entry.imageCount}</p> : null}

              <label className="admin-field" style={{ marginTop: "var(--space-3)" }}>
                <span className="caption">Image path</span>
                <input
                  className="admin-input"
                  value={draft}
                  onChange={(event) =>
                    setDraftPaths((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  placeholder="/media/site/..."
                />
              </label>

              <code className="image-card__path">{draft || "No path yet"}</code>
              <div className="admin-quick-actions" style={{ marginTop: "var(--space-3)" }}>
                <button type="button" className="admin-button admin-button--secondary" onClick={() => copyPath(draft || "")}>
                  Copy path
                </button>
                <button type="button" className="admin-button" onClick={() => saveEntry(entry)} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <Link href={entry.href} className="admin-button admin-button--secondary">
                  Open editor
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <style jsx>{`
        .images-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          gap: var(--space-3);
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-top: 1.5rem;
        }

        .image-card {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 1rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .image-card:hover {
          border-color: #d4a574;
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
          transform: translateY(-2px);
        }

        .image-card__preview,
        .image-card__empty {
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 8px;
          margin-bottom: 1rem;
          background: #f5f5f5;
          border: 1px solid #e8e8e8;
        }

        .image-card__preview {
          object-fit: cover;
        }

        .image-card__empty {
          display: grid;
          place-items: center;
          color: #999;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .image-card__path {
          display: block;
          margin: 0.75rem 0;
          padding: 0.75rem;
          border-radius: 6px;
          background: #f5f5f5;
          border: 1px solid #e8e8e8;
          font-size: 0.7rem;
          word-break: break-word;
          color: #666;
          font-family: 'Courier New', monospace;
        }

        .image-card .heading-md {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
        }

        .image-card .overline {
          font-size: 0.7rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .image-card .caption {
          margin: 0.25rem 0;
          font-size: 0.8rem;
          color: #666;
        }

        .image-card .admin-field {
          margin: 0.75rem 0 !important;
        }

        .image-card .admin-input {
          font-size: 0.85rem;
        }

        .image-card .admin-quick-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto !important;
        }

        .image-card .admin-quick-actions button,
        .image-card .admin-quick-actions a {
          flex: 1;
          padding: 0.65rem 0.75rem;
          font-size: 0.8rem;
        }

        .image-card .admin-button {
          background: linear-gradient(135deg, #d4a574 0%, #e8c4a0 100%);
          color: white;
          border: none;
        }

        .image-card .admin-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
        }

        .image-card .admin-button--secondary {
          background: white;
          color: #666;
          border: 1px solid #ddd;
        }

        .image-card .admin-button--secondary:hover:not(:disabled) {
          border-color: #d4a574;
          color: #d4a574;
          background: #fffbf0;
          transform: none;
        }

        .saved-indicator {
          background: #d1fae5;
          color: #065f46;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .admin-form-error {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        @media (max-width: 1200px) {
          .images-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          }
        }

        @media (max-width: 767px) {
          .images-toolbar {
            grid-template-columns: 1fr;
          }

          .images-grid {
            grid-template-columns: 1fr;
          }

          .image-card .admin-quick-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  const [siteImages, products] = await Promise.all([readSiteImages(), readProducts()]);
  return {
    props: {
      siteImages,
      products,
    },
  };
}
