import ArtisanTimeline from "../components/ArtisanTimeline";
import CategoryStrip from "../components/CategoryStrip";
import Footer from "../components/Footer";
import HeroBanner from "../components/HeroBanner";
import MasonryGrid from "../components/MasonryGrid";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import Icon from "../components/icons";
import { buildCollectionCards, buildFeaturedArtisans, trustItems } from "../data/site";
import { filterPublishedProducts, getCatalogCategories, prioritizeCategories } from "../lib/products";
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
  allProducts,
  collectionCards,
  artisans,
  categories,
  siteContent,
}) {
  return (
    <>
      <SeoHead
        title="Kenya Handmade Jewelry, Gifts And Decor"
        description="Shop SharonCraft for handmade Kenyan jewellery, beaded gifts, home decor, and custom artisan pieces with simple WhatsApp ordering."
        path="/"
      />
      <Nav />
      <HeroBanner
        heroImage={siteContent.heroImage}
        heroImageAlt="Kenyan artisan wearing richly beaded adornment"
        title={siteContent.heroTitle}
        subtitle={siteContent.heroSubtitle}
        trustLine={siteContent.deliveryNote}
      />

      <section className="trust-bar" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-4) var(--gutter)' }}>
        {trustItems.map((item) => (
          <div key={item.label} className="trust-bar__item">
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <CategoryStrip categories={categories} activeCategory="All" />

      <main>
        <section>
          <SectionHeading title="Best Sellers" kicker="Customer favorites" />
          <MasonryGrid products={featuredProducts} />
        </section>

        <section>
          <SectionHeading title="New This Week" kicker="Just arrived" />
          <MasonryGrid products={recentProducts} />
        </section>

        <section id="about-gallery" className="collections-section">
          <SectionHeading title="Shop by Category" kicker="Browse collections" />
          <div className="collections-grid">
            {collectionCards.map((collection) => (
              <a key={collection.title} href={collection.href} className="collection-card">
                <img src={collection.image} alt={collection.title} className="collection-card__image" loading="lazy" decoding="async" />
                <span className="collection-card__overlay" />
                {collection.itemCount && <span className="collection-card__badge">{collection.itemCount} items</span>}
                <span className="collection-card__title display-md">{collection.title}</span>
              </a>
            ))}
          </div>
        </section>

        <ArtisanTimeline artisans={artisans} />
      </main>

      <Footer siteContent={siteContent} />

      <style jsx>{`
        main {
          padding-bottom: var(--space-7);
        }
        .section-heading {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--gutter) var(--space-4);
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
        .collections-section {
          padding: var(--space-3) 0 var(--space-4);
        }
        .collections-grid {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-4) var(--gutter);
          display: flex;
          gap: var(--space-3);
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          position: relative;
          background: linear-gradient(to right, transparent 0%, transparent calc(100% - 40px), rgba(249, 246, 238, 0.8) 100%);
        }
        .collections-grid::-webkit-scrollbar {
          display: none;
        }
        .collections-intro {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--gutter);
        }
        .collection-card {
          flex: 0 0 85vw;
          scroll-snap-align: start;
          position: relative;
          min-height: 200px;
          overflow: hidden;
          border-radius: var(--radius-lg);
        }
        .collection-card:hover .collection-card__image {
          transform: scale(1.08);
        }
        .collection-card__image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
          animation: fadeInImage 0.5s ease-in;
        }
        @keyframes fadeInImage {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .collection-card__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(28, 18, 9, 0.7), transparent 70%);
        }
        .collection-card__badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--color-white);
          color: var(--text-primary);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: var(--text-xs);
          font-weight: 600;
        }
        .collection-card__title {
          position: absolute;
          left: 18px;
          bottom: 18px;
          color: var(--color-cream);
          z-index: 1;
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
          animation: slideInFromLeft 0.5s ease-out backwards;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .trust-bar__item:nth-child(1) {
          animation-delay: 0s;
        }
        .trust-bar__item:nth-child(2) {
          animation-delay: 0.1s;
        }
        .trust-bar__item:nth-child(3) {
          animation-delay: 0.2s;
        }
        .trust-bar__item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @media (min-width: 600px) {
          .collection-card {
            flex: 0 0 45vw;
          }
        }
        @media (min-width: 900px) {
          .collections-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            overflow: visible;
          }
          .collection-card {
            flex: none;
            min-height: 260px;
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
  const publishedProducts = filterPublishedProducts(products);

  return {
    props: {
      allProducts: prioritizeCategories(publishedProducts),
      featuredProducts: prioritizeCategories(publishedProducts.filter((product) => product.featured)).slice(0, 8),
      recentProducts: prioritizeCategories(publishedProducts.filter((product) => product.recent)).slice(0, 12),
      collectionCards: buildCollectionCards(siteImages),
      categories: getCatalogCategories(publishedProducts),
      artisans: buildFeaturedArtisans(siteImages),
      siteContent: siteImages,
    },
  };
}
