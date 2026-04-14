import Link from "next/link";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";
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
  const { addItem } = useCart();

  return (
    <>
      <Nav />
      <main className="product-page">
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
            <p className="body-base">{product.description}</p>

            <div className="product-page__actions">
              <button type="button" className="product-page__cta" onClick={() => addItem(product)}>
                Add to Cart
              </button>
              <button type="button" className="product-page__ghost">
                <Icon name="heart" size={18} /> Wishlist
              </button>
              <button type="button" className="product-page__ghost">
                <Icon name="share" size={18} /> Share
              </button>
            </div>

            <div className="product-page__facts">
              {product.jewelryType ? (
                <div>
                  <span className="overline">Type</span>
                  <p>{getJewelryTypeLabel(product.jewelryType)}</p>
                </div>
              ) : null}
              <div>
                <span className="overline">Location</span>
                <p>{product.artisanLocation || "Kenya"}</p>
              </div>
              <div>
                <span className="overline">Years of Practice</span>
                <p>{product.yearsOfPractice || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="product-page__story">
          <SectionTitle title="The Story of the Piece" />
          <ProductStoryPreview story={product.story} />
        </section>

        <section className="product-page__story-grid">
          <div>
            <SectionTitle title="Behind the Scenes" />
            <img
              src={product.story.behindScenesPhoto}
              alt={`Behind the scenes with ${product.story.artisanName}`}
              loading="lazy"
              decoding="async"
              className="product-page__bts"
            />
          </div>
          <div>
            <SectionTitle title={wearItWithTitle} />
            <div className="product-page__related">
              {wearItWithProducts.map((item) => (
                <Link key={item.id} href={`/product/${item.slug}`} className="product-page__related-card">
                  <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                  <span className="overline" style={{ marginTop: "12px", color: "var(--color-ochre)" }}>
                    {item.collectionLabel}
                  </span>
                  <span>{item.name}</span>
                  <span className="price" style={{ marginTop: "6px" }}>
                    KES {item.price.toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
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
        .product-page__grid,
        .product-page__story-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }
        .product-page__gallery {
          display: grid;
          gap: var(--space-3);
        }
        .product-page__gallery img,
        .product-page__bts {
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
        .product-page__related {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--space-3);
        }
        .product-page__related-card span {
          display: block;
          font-size: 0.875rem;
        }
        .product-page__related-card img {
          border-radius: var(--radius-md);
        }
        @media (min-width: 960px) {
          .product-page__grid {
            grid-template-columns: 1.05fr 0.95fr;
          }
          .product-page__story-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 767px) {
          .product-page__related {
            grid-template-columns: 1fr;
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

  for (const candidate of [...preferredProducts, ...fallbackJewellery, ...fallbackGallery]) {
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
