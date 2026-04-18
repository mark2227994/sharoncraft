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
import { useState } from "react";

function CuratedSection({ bestSellers, newArrivals }) {
  const [activeTab, setActiveTab] = useState("best-sellers");
  const currentProducts = activeTab === "best-sellers" ? bestSellers : newArrivals;
  const tabLabel = activeTab === "best-sellers" ? "Most Loved" : "Latest Arrivals";
  const tabKicker = activeTab === "best-sellers" ? "Customer's Top Picks" : "Recently Added";

  return (
    <section className="curated-section">
      <div className="curated-header">
        <div>
          <p className="overline">{tabKicker}</p>
          <h2 className="display-md">{tabLabel}</h2>
        </div>
        <div className="curated-tabs">
          <button
            className={`curated-tab ${activeTab === "best-sellers" ? "curated-tab--active" : ""}`}
            onClick={() => setActiveTab("best-sellers")}
          >
            <span className="curated-tab-icon">★</span>
            Most Loved
          </button>
          <button
            className={`curated-tab ${activeTab === "new" ? "curated-tab--active" : ""}`}
            onClick={() => setActiveTab("new")}
          >
            <span className="curated-tab-icon">+</span>
            Latest Arrivals
          </button>
        </div>
        <span className="section-heading__rule" aria-hidden="true" />
      </div>
      <MasonryGrid products={currentProducts} />

      <style jsx>{`
        .curated-section {
          padding: var(--space-6) 0 var(--space-4);
        }

        .curated-header {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--gutter) var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex-wrap: wrap;
          justify-content: space-between;
        }

        .curated-header > div {
          flex: 1;
          min-width: 200px;
        }

        .curated-header .overline {
          margin: 0;
          color: var(--text-secondary);
        }

        .curated-header .display-md {
          margin: var(--space-1) 0 0;
          color: var(--text-primary);
        }

        .curated-tabs {
          display: flex;
          gap: var(--space-2);
          align-items: center;
          background: var(--color-white);
          padding: 6px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
        }

        .curated-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: var(--text-sm);
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .curated-tab:hover {
          background: rgba(139, 90, 43, 0.1);
          color: var(--color-accent);
        }

        .curated-tab--active {
          background: linear-gradient(135deg, #8B5A2B 0%, #A0826D 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(139, 90, 43, 0.2);
        }

        .curated-tab-icon {
          font-size: 1.1rem;
        }

        .section-heading__rule {
          height: 1px;
          flex: 1;
          background: var(--color-terracotta);
          opacity: 0.45;
          margin-top: 18px;
          display: none;
        }

        @media (min-width: 768px) {
          .curated-header {
            flex-wrap: nowrap;
          }

          .section-heading__rule {
            display: block;
          }
        }

        @media (max-width: 767px) {
          .curated-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-3);
          }

          .curated-tabs {
            width: 100%;
            justify-content: space-between;
          }

          .curated-tab {
            flex: 1;
            justify-content: center;
            padding: 10px 12px;
          }
        }
      `}</style>
    </section>
  );
}

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

      <section className="payment-methods-section" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-6) var(--gutter)' }}>
        <div className="payment-methods-content">
          <div>
            <p className="overline">Flexible Payment</p>
            <h3 className="display-sm" style={{ margin: 'var(--space-1) 0 var(--space-2)' }}>We Accept Multiple Payment Methods</h3>
          </div>
          <div className="payment-methods-grid">
            <div className="payment-method">
              <div className="payment-method__icon">💳</div>
              <span>M-Pesa</span>
            </div>
            <div className="payment-method">
              <div className="payment-method__icon">🏦</div>
              <span>Bank Transfer</span>
            </div>
            <div className="payment-method">
              <div className="payment-method__icon">💵</div>
              <span>Cash on Delivery</span>
              <span className="payment-method__note">(Nairobi)</span>
            </div>
            <div className="payment-method">
              <div className="payment-method__icon">📱</div>
              <span>Lipa Na M-Pesa</span>
            </div>
          </div>
        </div>
      </section>

      <CategoryStrip categories={categories} activeCategory="All" />

      <main>
        <CuratedSection 
          bestSellers={featuredProducts}
          newArrivals={recentProducts}
        />

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
        .payment-methods-section {
          background: linear-gradient(135deg, #F5F3F0 0%, #FAF8F6 100%);
          border-top: 1px solid var(--border-default);
          border-bottom: 1px solid var(--border-default);
          margin-top: var(--space-6);
        }
        .payment-methods-content {
          display: grid;
          gap: var(--space-4);
        }
        .payment-methods-content > div:first-child {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: var(--space-4);
        }
        .payment-methods-content .overline {
          margin: 0;
          color: var(--text-secondary);
        }
        .payment-methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--space-3);
        }
        .payment-method {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4);
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          text-align: center;
          transition: all 0.2s ease;
        }
        .payment-method:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: var(--color-terracotta);
        }
        .payment-method__icon {
          font-size: 2rem;
          line-height: 1;
        }
        .payment-method span {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        .payment-method__note {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--text-secondary);
          margin-top: -2px;
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
