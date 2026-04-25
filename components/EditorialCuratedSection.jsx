import Link from "next/link";

function formatPrice(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

export default function EditorialCuratedSection({ products = [] }) {
  return (
    <section className="editorial-curated" aria-labelledby="editorial-curated-title">
      <div className="editorial-curated__header">
        <p className="overline">Selected For You</p>
        <h2 id="editorial-curated-title" className="display-md">A Considered Edit</h2>
        <p className="editorial-curated__intro">
          A quieter selection of signature SharonCraft pieces, chosen to let craftsmanship lead.
        </p>
      </div>

      <div className="editorial-curated__grid">
        {products.map((product) => {
          const imageSrc = product.image || product.images?.[0]?.src || "/media/site/placeholder.svg";

          return (
            <Link key={product.id} href={`/product/${product.slug}`} className="editorial-curated__card">
              <div className="editorial-curated__media">
                <img
                  src={imageSrc}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="editorial-curated__image"
                />
              </div>

              <div className="editorial-curated__content">
                <p className="editorial-curated__artisan">
                  {product.artisan ? `By ${product.artisan}` : "By SharonCraft"}
                </p>
                <h3 className="editorial-curated__name">{product.name}</h3>
                <div className="editorial-curated__pricing">
                  <span className="editorial-curated__price">{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price ? (
                    <span className="editorial-curated__original-price">{formatPrice(product.originalPrice)}</span>
                  ) : null}
                </div>
                <span className="editorial-curated__view">View Piece</span>
              </div>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .editorial-curated {
          padding: var(--space-8) 0 var(--space-5);
        }

        .editorial-curated__header {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--gutter) var(--space-5);
          display: grid;
          gap: var(--space-2);
          text-align: center;
        }

        .editorial-curated__header .overline {
          margin: 0;
          color: #7d6c5d;
        }

        .editorial-curated__header .display-md {
          margin: 0;
          color: #201813;
        }

        .editorial-curated__intro {
          max-width: 34rem;
          margin: 0 auto;
          color: #736659;
          font-size: 0.98rem;
          line-height: 1.7;
        }

        .editorial-curated__grid {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--gutter);
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        .editorial-curated__card {
          display: flex;
          flex-direction: column;
          color: inherit;
          text-decoration: none;
          border-radius: 24px;
        }

        .editorial-curated__media {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          background: #f5eee5;
          aspect-ratio: 0.88;
          box-shadow: 0 24px 44px rgba(36, 24, 17, 0.08);
        }

        .editorial-curated__image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .editorial-curated__content {
          display: grid;
          gap: 8px;
          padding: 18px 8px 0;
        }

        .editorial-curated__artisan {
          margin: 0;
          color: #847669;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .editorial-curated__name {
          margin: 0;
          color: #1f1812;
          font-size: 1.18rem;
          font-weight: 500;
          line-height: 1.35;
          font-family: var(--font-display);
        }

        .editorial-curated__pricing {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
        }

        .editorial-curated__price {
          color: #201813;
          font-size: 1rem;
          font-weight: 600;
        }

        .editorial-curated__original-price {
          color: #9b8e82;
          font-size: 0.9rem;
          text-decoration: line-through;
        }

        .editorial-curated__view {
          display: inline-flex;
          width: fit-content;
          color: #6f6256;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding-top: 4px;
          opacity: 0.72;
          transition: opacity 240ms ease, color 240ms ease;
        }

        @media (hover: hover) and (pointer: fine) {
          .editorial-curated__card {
            transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .editorial-curated__card:hover,
          .editorial-curated__card:focus-visible {
            transform: translateY(-4px);
          }

          .editorial-curated__card:hover .editorial-curated__image,
          .editorial-curated__card:focus-visible .editorial-curated__image {
            transform: scale(1.02);
          }

          .editorial-curated__card:hover .editorial-curated__view,
          .editorial-curated__card:focus-visible .editorial-curated__view {
            opacity: 1;
            color: #1f1812;
          }
        }

        @media (min-width: 900px) {
          .editorial-curated__grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: var(--space-5);
          }
        }

        @media (max-width: 767px) {
          .editorial-curated {
            padding-top: var(--space-6);
          }

          .editorial-curated__header {
            text-align: left;
            padding-bottom: var(--space-4);
          }

          .editorial-curated__intro {
            margin: 0;
            font-size: 0.94rem;
          }

          .editorial-curated__content {
            padding-top: 16px;
          }

          .editorial-curated__name {
            font-size: 1.08rem;
          }
        }
      `}</style>
    </section>
  );
}
