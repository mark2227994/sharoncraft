import Link from "next/link";
import { useState } from "react";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";
import SeoHead from "../../components/SeoHead";
import Icon from "../../components/icons";
import { useCart } from "../../lib/cart-context";
import { getComplementaryJewelryTypes, getJewelryTypeLabel, isPublishedProduct } from "../../lib/products";
import { readProducts } from "../../lib/store";

function ProductStoryPreview({ story }) {
  const artisanMeta = [story.artisanName, story.artisanLocation].filter(Boolean).join(" | ");

  return (
    <div className="story-preview">
      {artisanMeta ? (
        <p className="overline" style={{ color: "var(--color-ochre)", marginBottom: "4px" }}>
          {artisanMeta}
        </p>
      ) : null}
      {story.text ? (
        <p className="body-lg" style={{ whiteSpace: "pre-wrap", marginBottom: "16px" }}>
          {story.text}
        </p>
      ) : null}
      {story.culturalNote ? (
        <div
          style={{
            borderLeft: "3px solid var(--color-bark)",
            paddingLeft: "16px",
            background: "var(--color-cream-dark)",
            borderRadius: "0 var(--radius-md) var(--radius-md) 0",
            padding: "12px 16px",
          }}
        >
          <p className="overline" style={{ marginBottom: "4px" }}>
            Cultural Significance
          </p>
          <p className="body-sm">{story.culturalNote}</p>
        </div>
      ) : null}
      {story.materials?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
          {story.materials.map((material) => (
            <span
              key={material}
              style={{
                padding: "3px 10px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--color-bark)",
                fontSize: "0.75rem",
                color: "var(--color-bark)",
                letterSpacing: "0.04em",
              }}
            >
              {material}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h2 className="display-md" style={{ marginBottom: "16px" }}>
      {title}
    </h2>
  );
}

export default function ProductDetailPage({ product, wearItWithProducts, wearItWithTitle }) {
  const { addItem, isWishlisted, toggleWishlist } = useCart();
  const saved = isWishlisted(product.id);
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleWhatsApp = () => {
    const message = `Hi SharonCraft! I'm interested in: ${product.name} (KES ${product.price.toLocaleString()})`;
    window.open(`https://wa.me/254112222572?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <>
      <SeoHead
        title={product.name}
        description={product.description}
        path={`/product/${product.slug}`}
        image={product.image}
        type="product"
      />
      <Nav />
      <main className="product-page">
        {/* Breadcrumb */}
        <nav style={{ marginBottom: "16px", fontSize: "13px", color: "var(--text-secondary)" }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/shop" style={{ color: "inherit", textDecoration: "none" }}>Shop</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href={`/shop?category=${product.category}`} style={{ color: "inherit", textDecoration: "none" }}>{product.category}</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
        </nav>

        <div className="product-page__grid">
          <div className="product-page__gallery">
            {product.images.map((image) => (
              <img key={image.src} src={image.src} alt={product.name} loading="lazy" decoding="async" />
            ))}
          </div>

          <div className="product-page__summary">
            <p className="overline">{product.artisan}</p>
            <h1 className="display-lg">{product.name}</h1>
            <p className="price--large">KES {product.price.toLocaleString()}</p>

            {/* Stock Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }}></span>
              <span style={{ fontSize: "14px", color: "#166534", fontWeight: 500 }}>In Stock</span>
            </div>

            {/* Reviews */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <span style={{ color: "#f59e0b" }}>★★★★☆</span>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>(12 reviews)</span>
            </div>

            <p className="body-base">{product.description}</p>

            <div className="product-page__actions">
              <button type="button" className="product-page__cta" onClick={() => addItem(product)}>
                Add to Cart
              </button>
              <button type="button" onClick={handleWhatsApp} style={{ background: "#25d366", color: "white", padding: "12px 20px", borderRadius: "4px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", border: "none", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.162-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Order on WhatsApp
              </button>
              <button
                type="button"
                className="product-page__ghost"
                onClick={() => toggleWishlist(product)}
                style={{
                  color: saved ? "var(--color-terracotta)" : undefined,
                  borderColor: saved ? "rgba(192,77,41,0.22)" : undefined,
                }}
              >
                <Icon name="heart" size={18} /> Wishlist
              </button>
            </div>

            {/* Collapsible Sections */}
            <div style={{ marginTop: "24px" }}>
              <button onClick={() => toggleSection("details")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                <span className="overline">Details</span>
                <Icon name={openSection === "details" ? "chevronR" : "chevronR"} size={18} style={{ transform: openSection === "details" ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }} />
              </button>
              {openSection === "details" && (
                <div style={{ padding: "12px 0", display: "grid", gap: "8px" }}>
                  {product.jewelryType && <div><span className="overline" style={{ fontSize: "10px" }}>Type</span><p style={{ margin: 0 }}>{getJewelryTypeLabel(product.jewelryType)}</p></div>}
                  <div><span className="overline" style={{ fontSize: "10px" }}>Location</span><p style={{ margin: 0 }}>{product.artisanLocation || "Kenya"}</p></div>
                  {product.story?.materials?.length && <div><span className="overline" style={{ fontSize: "10px" }}>Materials</span><p style={{ margin: 0 }}>{product.story.materials.join(", ")}</p></div>}
                </div>
              )}

              <button onClick={() => toggleSection("care")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                <span className="overline">Care Instructions</span>
                <Icon name="chevronR" size={18} style={{ transform: openSection === "care" ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }} />
              </button>
              {openSection === "care" && (
                <div style={{ padding: "12px 0" }}>
                  <p style={{ margin: 0, fontSize: "14px" }}>Wipe with a soft, dry cloth after each use. Store in a cool, dry place away from direct sunlight. Avoid exposure to water, perfumes, or harsh chemicals.</p>
                </div>
              )}

              <button onClick={() => toggleSection("artisan")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                <span className="overline">About the Artisan</span>
                <Icon name="chevronR" size={18} style={{ transform: openSection === "artisan" ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }} />
              </button>
              {openSection === "artisan" && (
                <div style={{ padding: "12px 0" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "14px" }}>{product.story?.text?.substring(0, 200)}...</p>
                  <Link href="/artisans" style={{ fontSize: "14px", color: "var(--color-terracotta)" }}>View all artisans →</Link>
                </div>
              )}
            </div>

            {/* Shipping Info */}
            <div style={{ marginTop: "16px", padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Icon name="truck" size={18} />
                <span style={{ fontWeight: 600, fontSize: "14px" }}>Free Delivery in Nairobi</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>Delivery within 2-3 business days. KES 500 for other areas.</p>
            </div>

            {/* SKU */}
            <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
              SKU: {product.id?.substring(0, 8).toUpperCase() || "SC-" + product.name?.split(" ").slice(0, 2).join("").toUpperCase()}
            </div>
          </div>
        </div>

        <section className="wear-it-with">
          <SectionTitle title={wearItWithTitle} />
          <div className="wear-it-with__items">
            {wearItWithProducts.map((item, index) => (
              <Link key={item.id} href={`/product/${item.slug}`} className="wear-it-with__link" title={item.name}>
                <span className="wear-it-with__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </span>
                <span className="wear-it-with__name">{item.name}</span>
                <span className="wear-it-with__price">KES {item.price.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />

      <style jsx>{`
        .product-page {
          padding: calc(var(--nav-height) + var(--space-6)) var(--gutter) var(--space-7);
          max-width: var(--max-width);
          margin: 0 auto;
        }
        .product-page__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }
        .product-page__gallery {
          display: grid;
          gap: var(--space-3);
        }
        .product-page__gallery img {
          width: 100%;
          border-radius: var(--radius-lg);
          background: var(--color-cream-dark);
        }
        .product-page__summary {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .product-page__actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
        }
        .product-page__cta,
        .product-page__ghost {
          padding: 14px 22px;
          border-radius: var(--radius-md);
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
        }
        .product-page__cta {
          background: var(--color-terracotta);
          color: var(--color-white);
        }
        .product-page__ghost {
          border: 1px solid var(--border-default);
          background: var(--color-white);
        }
        .product-page__facts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-default);
        }
        .product-page__story {
          margin-top: var(--space-7);
        }
        .wear-it-with {
          margin-top: var(--space-5);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-default);
        }
        .wear-it-with__items {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          margin-top: var(--space-3);
        }
        .wear-it-with__link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .wear-it-with__link:hover {
          border-color: var(--color-ochre);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .wear-it-with__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-ochre);
        }
        .wear-it-with__name {
          font-size: 12px;
          color: var(--text-primary);
          font-weight: 500;
        }
        .wear-it-with__price {
          font-size: 11px;
          color: var(--color-ochre);
          font-weight: 600;
        }
        @media (min-width: 960px) {
          .product-page__grid {
            grid-template-columns: 1.05fr 0.95fr;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const products = await readProducts();
  const product = products.find((item) => item.slug === params.slug && isPublishedProduct(item));

  if (!product) {
    return { notFound: true };
  }

  const otherProducts = products.filter((item) => item.id !== product.id && !item.isSold && isPublishedProduct(item));
  const manualWearItWith = (product.wearItWithIds || [])
    .map((id) => otherProducts.find((item) => item.id === id))
    .filter(Boolean);
  const preferredTypes = getComplementaryJewelryTypes(product.jewelryType);
  const preferredProducts = preferredTypes.flatMap((type) =>
    otherProducts.filter((item) => item.category === "Jewellery" && item.jewelryType === type),
  );
  const fallbackJewellery = otherProducts.filter(
    (item) =>
      item.category === "Jewellery" &&
      item.jewelryType &&
      item.jewelryType !== product.jewelryType,
  );
  const fallbackGallery = otherProducts;
  const wearItWithProducts = [];
  const seen = new Set();

  for (const candidate of [...manualWearItWith, ...preferredProducts, ...fallbackJewellery, ...fallbackGallery]) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    wearItWithProducts.push(candidate);
    if (wearItWithProducts.length === 3) break;
  }

  return {
    props: {
      product,
      wearItWithTitle: product.jewelryType ? "Wear it with" : "More From the Gallery",
      wearItWithProducts,
    },
  };
}
