import ProductCard from "./ProductCard";

export default function EditorialCuratedSection({ products = [] }) {
  return (
    <section className="editorial-curated" aria-labelledby="editorial-curated-title">
      <div className="editorial-curated__header">
        <p className="editorial-curated__eyebrow">Selected For You</p>
        <h2 id="editorial-curated-title" className="editorial-curated__title">A Considered Edit</h2>
        <p className="editorial-curated__intro">
          A quieter selection of signature SharonCraft pieces, chosen to let craftsmanship lead.
        </p>
      </div>

      <div className="editorial-curated__grid">
        {products.slice(0, 4).map((product, index) => (
          <div
            key={product.id}
            className={`editorial-curated__item editorial-curated__item--${index}`}
          >
            <ProductCard
              product={product}
              size={index === 0 ? 'large' : index === 1 ? 'default' : 'small'}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .editorial-curated {
          background: #FCFAF7;
          padding: 64px 0;
          border-top: 1px solid rgba(139, 94, 60, 0.08);
          border-bottom: 1px solid rgba(139, 94, 60, 0.08);
        }

        .editorial-curated__header {
          max-width: var(--max-width);
          margin: 0 auto 36px;
          padding: 0 var(--gutter);
          display: grid;
          gap: 12px;
          text-align: center;
        }

        .editorial-curated__eyebrow {
          margin: 0;
          color: #8b5e3c;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .editorial-curated__title {
          margin: 0;
          color: #1c1c1c;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(1.85rem, 2.5vw, 2.5rem);
          font-weight: 400;
          line-height: 1.15;
        }

        .editorial-curated__intro {
          max-width: 40rem;
          margin: 0 auto;
          color: #5c554e;
          font-size: 13px;
          line-height: 1.8;
          font-style: italic;
        }

        .editorial-curated__grid {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--gutter);
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }

        .editorial-curated__item {
          transition: transform 0.3s ease;
        }

        /* Asymmetric grid mappings for desktop */
        .editorial-curated__item--0 {
          grid-column: span 2;
          grid-row: span 2;
        }

        .editorial-curated__item--1 {
          grid-column: span 2;
          grid-row: span 1;
        }

        .editorial-curated__item--2 {
          grid-column: span 1;
          grid-row: span 1;
        }

        .editorial-curated__item--3 {
          grid-column: span 1;
          grid-row: span 1;
        }

        @media (max-width: 899px) {
          .editorial-curated__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .editorial-curated__item {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }

        @media (max-width: 767px) {
          .editorial-curated {
            padding: 48px 0;
          }

          .editorial-curated__header {
            text-align: left;
            margin-bottom: 24px;
          }

          .editorial-curated__intro {
            margin: 0;
          }

          .editorial-curated__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
        }
      `}</style>
    </section>
  );
}
