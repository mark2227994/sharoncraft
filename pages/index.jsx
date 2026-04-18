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

      <section className="custom-orders-banner" style={{ maxWidth: 'var(--max-width)', margin: 'var(--space-6) auto', padding: 'var(--space-6) var(--gutter)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 'var(--space-6)', alignItems: 'center' }}>
          <div>
            <h3 className="display-sm">Design With Us</h3>
            <p style={{ marginTop: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: '16px' }}>
              Custom pieces made to your vision
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '15px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--color-terracotta)' }}>✓</span> Fully customizable</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--color-terracotta)' }}>✓</span> Premium materials</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--color-terracotta)' }}>✓</span> 5–10 day delivery</li>
            </ul>
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="/custom-order" className="custom-order-btn">Start Design</a>
          </div>
        </div>
      </section>

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
              <div className="payment-method__icon"><Icon name="dollar" size={24} /></div>
              <span>M-Pesa</span>
            </div>
            <div className="payment-method">
              <div className="payment-method__icon"><Icon name="dollar" size={24} /></div>
              <span>Bank Transfer</span>
            </div>
            <div className="payment-method">
              <div className="payment-method__icon"><Icon name="truck" size={24} /></div>
              <span>Cash on Delivery</span>
              <span className="payment-method__note">(Nairobi)</span>
            </div>
            <div className="payment-method">
              <div className="payment-method__icon"><Icon name="mpesa" size={24} /></div>
              <span>Lipa Na M-Pesa</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="trust-signals" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-8) var(--gutter)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <p className="overline">Trusted</p>
          <h2 className="display-md" style={{ marginTop: 'var(--space-1)' }}>Why SharonCraft</h2>
        </div>

        <div className="trust-grid">
          <div className="trust-item">
            <div className="trust-icon"><Icon name="check" size={32} /></div>
            <h4>Verified Artisans</h4>
            <p>Direct from Kenyan makers</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon"><Icon name="truck" size={32} /></div>
            <h4>Fast & Tracked</h4>
            <p>Next-day Nairobi delivery</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon"><Icon name="star" size={32} /></div>
            <h4>Guaranteed Quality</h4>
            <p>30-day returns, always</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon"><Icon name="heart" size={32} /></div>
            <h4>Fair Trade</h4>
            <p>Artisans paid directly</p>
          </div>
        </div>

        <div className="testimonials">
          <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-4)', fontSize: '18px', fontWeight: 600 }}>Loved</h3>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Stunning craftsmanship. Arrived quickly."</p>
              <div className="testimonial-author">— Sarah K.</div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Custom orders exceeded expectations. Will buy again."</p>
              <div className="testimonial-author">— James M.</div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Beautiful, unique pieces. Supporting Kenyan artisans."</p>
              <div className="testimonial-author">— Amina H.</div>
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

        <section className="featured-artisans-showcase" style={{ maxWidth: 'var(--max-width)', margin: 'var(--space-8) auto', padding: 'var(--space-8) var(--gutter)', background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.05) 0%, rgba(212, 165, 116, 0.02) 100%)', borderRadius: '12px', border: '1px solid rgba(212, 165, 116, 0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <p className="overline">Meet the Makers</p>
            <h2 className="display-md" style={{ marginTop: 'var(--space-1)' }}>The Artisans Behind SharonCraft</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)', maxWidth: '600px', margin: 'var(--space-2) auto 0', fontSize: '16px' }}>
              Master craftspeople with years of traditional beadwork expertise
            </p>
          </div>
          <ArtisanTimeline artisans={artisans} />
          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
            <a href="/artisans" className="artisan-link">Meet All Artisans →</a>
          </div>
        </section>
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

        .trust-signals {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(139, 90, 43, 0.03) 100%);
          border-radius: var(--radius-lg);
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        .trust-item {
          text-align: center;
          padding: var(--space-4);
        }

        .trust-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          margin: 0 auto var(--space-3);
          background: white;
          border-radius: var(--radius-md);
          border: 2px solid var(--color-terracotta);
          color: var(--color-terracotta);
        }

        .trust-item h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 var(--space-2);
          color: var(--text-primary);
        }

        .trust-item p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .text-lg {
          font-size: 1rem;
          line-height: 1.6;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-4);
        }

        .testimonial-card {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .stars {
          color: var(--color-terracotta);
          font-size: 1.1rem;
          margin-bottom: var(--space-2);
          letter-spacing: 2px;
        }

        .testimonial-card p {
          margin: 0 0 var(--space-3);
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-primary);
          font-style: italic;
        }

        .testimonial-author {
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.875rem;
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
        .custom-order-btn {
          display: inline-block;
          padding: 14px 28px;
          background: linear-gradient(135deg, #d4a574 0%, #c49464 100%);
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
        }
        .custom-order-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212, 165, 116, 0.4);
        }
        .artisan-link {
          display: inline-block;
          padding: 12px 24px;
          border: 2px solid var(--color-terracotta);
          color: var(--color-terracotta);
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .artisan-link:hover {
          background: var(--color-terracotta);
          color: white;
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
