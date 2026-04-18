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
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-4);
        }
        .image-card {
          padding: var(--space-4);
        }
        .image-card__preview,
        .image-card__empty {
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-3);
          background: var(--bg-card-alt);
        }
        .image-card__preview {
          object-fit: cover;
        }
        .image-card__empty {
          display: grid;
          place-items: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }
        .image-card__path {
          display: block;
          margin-top: var(--space-2);
          padding: 10px 12px;
          border-radius: var(--radius-md);
          background: var(--bg-card-alt);
          font-size: 0.75rem;
          word-break: break-word;
        }
        @media (max-width: 767px) {
          .images-toolbar {
            grid-template-columns: 1fr;
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
