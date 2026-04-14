import Link from "next/link";
import { useMemo, useState } from "react";
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
    extra: `${product.category}${product.jewelryType ? ` · ${product.jewelryType}` : ""}`,
    publishStatus: product.publishStatus,
    imageCount: Array.isArray(product.images) ? product.images.length : 0,
    href: `/admin/products/${product.id}`,
  }));
}

export default function AdminImagesPage({ siteImages, products }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

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

  return (
    <AdminLayout
      title="Images"
      action={
        <Link href="/admin/site-images" className="admin-button">
          Edit Site Content
        </Link>
      }
    >
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
        {entries.map((entry) => (
          <article key={`${entry.type}-${entry.id}`} className="admin-panel image-card">
            {entry.path ? (
              <img src={entry.path} alt="" className="image-card__preview" />
            ) : (
              <div className="image-card__empty">No image linked yet</div>
            )}
            <p className="overline">{entry.type === "site" ? "Site asset" : "Product asset"}</p>
            <h2 className="heading-md">{entry.label}</h2>
            {entry.extra ? <p className="caption">{entry.extra}</p> : null}
            {entry.publishStatus ? <p className="caption">Visibility: {entry.publishStatus}</p> : null}
            {typeof entry.imageCount === "number" ? <p className="caption">Gallery images: {entry.imageCount}</p> : null}
            <code className="image-card__path">{entry.path || "No path yet"}</code>
            <div className="admin-quick-actions" style={{ marginTop: "var(--space-3)" }}>
              <button type="button" className="admin-button admin-button--secondary" onClick={() => copyPath(entry.path || "")}>
                Copy path
              </button>
              <Link href={entry.href} className="admin-button">
                Open editor
              </Link>
            </div>
          </article>
        ))}
      </section>

      <style jsx>{`
        .images-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          gap: var(--space-3);
        }
        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
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
          margin-top: var(--space-3);
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
