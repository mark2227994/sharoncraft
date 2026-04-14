import CategoryStrip from "../components/CategoryStrip";
import Footer from "../components/Footer";
import HeroBanner from "../components/HeroBanner";
import MasonryGrid from "../components/MasonryGrid";
import Nav from "../components/Nav";
import Icon from "../components/icons";
import { artisanFeature, buildCollectionCards, trustItems } from "../data/site";
import { getCatalogCategories, prioritizeCategories } from "../lib/products";
import { readProducts } from "../lib/store";
import { readSiteImages } from "../lib/site-images";

function SectionHeading({ title, kicker }) {
  return (
    <div className="section-heading">
      <div>
        {kicker ? <p className="overline">{kicker}</p> : null}
        <h2 className="display-md">{title}</h2>
      </div>
      <span className="section-heading__rule" aria-hidden="true" />
    </div>
  );
}

export default function HomePage({
  featuredProducts,
  recentProducts,
  collectionCards,
  artisanSpotlight,
  categories,
}) {
  return (
    <>
      <Nav />
      <HeroBanner
        heroImage={artisanSpotlight.heroImage}
        heroImageAlt="Kenyan artisan wearing richly beaded adornment"
      />
      <CategoryStrip categories={categories} activeCategory="All" />

      <main>
        <section>
          <SectionHeading title="Featured This Week" kicker="Curated now" />
          <MasonryGrid products={featuredProducts} />
        </section>

        <section id="artisan-story" className="editorial-feature">
          <div className="editorial-feature__image">
            <img src={artisanSpotlight.portrait} alt={artisanFeature.name} loading="lazy" decoding="async" />
          </div>
          <div className="editorial-feature__copy">
            <p className="overline">The Artisan Behind It</p>
            <p className="editorial-feature__quote">"{artisanFeature.quote}"</p>
            <p className="body-base">
              {artisanFeature.name}
              <br />
              <span className="caption" style={{ color: "var(--text-secondary)" }}>
                {artisanFeature.location}
              </span>
            </p>
          </div>
        </section>

        <section id="about-gallery" className="collections-section">
          <SectionHeading title="Browse All Collections" kicker="Explore by mood" />
          <div className="collections-grid">
            {collectionCards.map((collection) => (
              <a key={collection.title} href={collection.href} className="collection-card">
                <img src={collection.image} alt={collection.title} loading="lazy" decoding="async" />
                <span className="collection-card__overlay" />
                <span className="collection-card__title display-md">{collection.title}</span>
              </a>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="Recently Added" kicker="Fresh in the gallery" />
          <MasonryGrid products={recentProducts} />
        </section>

        <section className="trust-bar">
          {trustItems.map((item) => (
            <div key={item.label} className="trust-bar__item">
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </section>
      </main>

      <Footer />

      <style jsx>{`
        main {
          padding-bottom: var(--space-7);
        }
        .section-heading {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--gutter) 0;
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .section-heading__rule {
          height: 1px;
          flex: 1;
          background: var(--color-terracotta);
          opacity: 0.45;
          margin-top: 18px;
        }
        .editorial-feature {
          max-width: var(--max-width);
          margin: var(--space-7) auto;
          padding: 0 var(--gutter);
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-5);
        }
        .editorial-feature__image img {
          width: 100%;
          border-radius: var(--radius-lg);
          object-fit: cover;
          min-height: 320px;
        }
        .editorial-feature__copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: var(--space-3);
        }
        .editorial-feature__quote {
          font-family: var(--font-display);
          font-style: italic;
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          line-height: 1.25;
        }
        .collections-section {
          padding: var(--space-3) 0 var(--space-4);
        }
        .collections-grid {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-4) var(--gutter);
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-3);
        }
        .collection-card {
          position: relative;
          min-height: 220px;
          overflow: hidden;
          border-radius: var(--radius-lg);
        }
        .collection-card img,
        .collection-card__overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .collection-card img {
          object-fit: cover;
        }
        .collection-card__overlay {
          background: linear-gradient(to top, rgba(28, 18, 9, 0.7), transparent 70%);
        }
        .collection-card__title {
          position: absolute;
          left: 18px;
          bottom: 18px;
          color: var(--color-cream);
          z-index: 1;
        }
        .trust-bar {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--gutter) 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-3);
        }
        .trust-bar__item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: var(--color-white);
          padding: 18px;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
        }
        @media (min-width: 900px) {
          .editorial-feature {
            grid-template-columns: 1fr 1fr;
          }
          .collections-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .trust-bar {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  const [products, siteImages] = await Promise.all([readProducts(), readSiteImages()]);

  return {
    props: {
      featuredProducts: prioritizeCategories(products.filter((product) => product.featured)).slice(0, 8),
      recentProducts: prioritizeCategories(products.filter((product) => product.recent)).slice(0, 12),
      collectionCards: buildCollectionCards(siteImages),
      categories: getCatalogCategories(products),
      artisanSpotlight: {
        heroImage: siteImages.heroImage,
        portrait: siteImages.artisanPortrait,
      },
    },
  };
}
