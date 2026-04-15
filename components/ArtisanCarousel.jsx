import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Icon from "./icons";

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getFallbackProducts(artisan, products) {
  const craft = normalizeText(artisan?.craft);

  if (craft.includes("necklace")) {
    return products.filter((product) => product.category === "Jewellery" && product.jewelryType === "necklace");
  }
  if (craft.includes("bracelet")) {
    return products.filter((product) => product.category === "Jewellery" && product.jewelryType === "bracelet");
  }
  if (craft.includes("earring")) {
    return products.filter((product) => product.category === "Jewellery" && product.jewelryType === "earring");
  }
  if (craft.includes("home")) {
    return products.filter((product) => product.category === "Home Decor");
  }

  return products.filter((product) => product.category === "Jewellery");
}

export default function ArtisanCarousel({ artisans = [], products = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeArtisans = Array.isArray(artisans) ? artisans.filter(Boolean) : [];

  useEffect(() => {
    if (safeArtisans.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeArtisans.length);
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, [safeArtisans.length]);

  useEffect(() => {
    if (activeIndex <= safeArtisans.length - 1) return;
    setActiveIndex(0);
  }, [activeIndex, safeArtisans.length]);

  const activeArtisan = safeArtisans[activeIndex] || null;

  const relatedProducts = useMemo(() => {
    if (!activeArtisan) return [];

    const artisanName = normalizeText(activeArtisan.name);
    const directMatches = products.filter((product) => {
      const productArtisan = normalizeText(product.artisan || product.story?.artisanName);
      return productArtisan && (productArtisan.includes(artisanName) || artisanName.includes(productArtisan));
    });

    return (directMatches.length ? directMatches : getFallbackProducts(activeArtisan, products)).slice(0, 3);
  }, [activeArtisan, products]);

  if (!activeArtisan) return null;

  const multipleArtisans = safeArtisans.length > 1;

  function goPrevious() {
    setActiveIndex((current) => (current === 0 ? safeArtisans.length - 1 : current - 1));
  }

  function goNext() {
    setActiveIndex((current) => (current + 1) % safeArtisans.length);
  }

  return (
    <section id="artisan-story" className="artisan-carousel">
      <div className="artisan-carousel__header">
        <div>
          <p className="overline">Meet Our Artisans</p>
          <h2 className="display-md">One maker at a time, with room for the story.</h2>
        </div>
        {multipleArtisans ? (
          <div className="artisan-carousel__controls">
            <button type="button" className="artisan-carousel__control" onClick={goPrevious} aria-label="Previous artisan">
              <span className="artisan-carousel__control-icon artisan-carousel__control-icon--left">
                <Icon name="chevronR" size={18} />
              </span>
            </button>
            <button type="button" className="artisan-carousel__control" onClick={goNext} aria-label="Next artisan">
              <Icon name="chevronR" size={18} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="artisan-carousel__panel">
        <div className="artisan-carousel__image-wrap">
          <img src={activeArtisan.image} alt={activeArtisan.name} loading="lazy" decoding="async" />
        </div>

        <div className="artisan-carousel__copy">
          <p className="caption artisan-carousel__meta">
            {activeArtisan.location} - {activeArtisan.craft}
          </p>
          <h3 className="display-md artisan-carousel__name">{activeArtisan.name}</h3>
          <p className="body-base artisan-carousel__story">{activeArtisan.story}</p>

          {relatedProducts.length ? (
            <div className="artisan-carousel__pieces">
              <p className="overline">Pieces to start with</p>
              <div className="artisan-carousel__piece-list">
                {relatedProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.slug}`} className="artisan-carousel__piece-card">
                    <span className="heading-sm">{product.name}</span>
                    <span className="price">{`KES ${product.price.toLocaleString()}`}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="artisan-carousel__actions">
            <Link href={activeArtisan.href || "/shop?category=Jewellery"} className="artisan-carousel__cta">
              Shop this artisan
            </Link>
            {multipleArtisans ? (
              <div className="artisan-carousel__dots" aria-label="Artisan slides">
                {safeArtisans.map((artisan, index) => (
                  <button
                    key={`${artisan.name}-${index}`}
                    type="button"
                    className={`artisan-carousel__dot ${index === activeIndex ? "artisan-carousel__dot--active" : ""}`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show artisan ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        .artisan-carousel {
          max-width: var(--max-width);
          margin: var(--space-7) auto;
          padding: 0 var(--gutter);
        }
        .artisan-carousel__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: var(--space-4);
          margin-bottom: var(--space-4);
        }
        .artisan-carousel__controls {
          display: flex;
          gap: var(--space-2);
        }
        .artisan-carousel__control {
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: var(--color-white);
          transition: border-color var(--transition-fast), color var(--transition-fast);
        }
        .artisan-carousel__control:hover {
          border-color: var(--color-terracotta);
          color: var(--color-terracotta);
        }
        .artisan-carousel__control-icon--left {
          display: inline-flex;
          transform: rotate(180deg);
        }
        .artisan-carousel__panel {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-5);
          padding: var(--space-5);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(237, 232, 222, 0.88));
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
        }
        .artisan-carousel__image-wrap img {
          width: 100%;
          min-height: 340px;
          object-fit: cover;
          border-radius: var(--radius-lg);
        }
        .artisan-carousel__copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: var(--space-3);
        }
        .artisan-carousel__meta {
          color: var(--color-ochre);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .artisan-carousel__name {
          line-height: 1.1;
        }
        .artisan-carousel__story {
          max-width: 56ch;
        }
        .artisan-carousel__pieces {
          display: grid;
          gap: var(--space-3);
          padding-top: var(--space-2);
        }
        .artisan-carousel__piece-list {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--space-3);
        }
        .artisan-carousel__piece-card {
          display: grid;
          gap: 6px;
          padding: var(--space-3);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.72);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .artisan-carousel__piece-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-card);
        }
        .artisan-carousel__actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding-top: var(--space-2);
        }
        .artisan-carousel__cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: var(--radius-md);
          background: var(--color-terracotta);
          color: var(--color-white);
          font-weight: 600;
        }
        .artisan-carousel__dots {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .artisan-carousel__dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(107, 76, 42, 0.2);
        }
        .artisan-carousel__dot--active {
          width: 26px;
          background: var(--color-terracotta);
        }
        @media (min-width: 980px) {
          .artisan-carousel__panel {
            grid-template-columns: 1.05fr 1fr;
          }
        }
        @media (max-width: 900px) {
          .artisan-carousel__piece-list {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 767px) {
          .artisan-carousel__header,
          .artisan-carousel__actions {
            flex-direction: column;
            align-items: flex-start;
          }
          .artisan-carousel__panel {
            padding: var(--space-4);
          }
          .artisan-carousel__image-wrap img {
            min-height: 280px;
          }
        }
      `}</style>
    </section>
  );
}
