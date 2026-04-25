import ArtisanTimeline from "../components/ArtisanTimeline";
import ArtisanExpandingCards from "../components/ArtisanExpandingCards";
import CategoryStrip from "../components/CategoryStrip";
import EditorialCuratedSection from "../components/EditorialCuratedSection";
import Footer from "../components/Footer";
import HeroSlideshow from "../components/HeroSlideshow";
import MasonryGrid from "../components/MasonryGrid";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import TrustBadges from "../components/TrustBadges";
import Testimonials from "../components/Testimonials";
import CtaSection from "../components/CtaSection";
import NewsletterSignup from "../components/NewsletterSignup";
import MobileProductShowcase from "../components/MobileProductShowcase";
import ArticleCarousel from "../components/ArticleCarousel";
import QuickStatsBar from "../components/QuickStatsBar";
import Icon from "../components/icons";
import { buildCollectionCards, buildFeaturedArtisans, trustItems } from "../data/site";
import { readAdminContentField } from "../lib/admin-content";
import { filterPublishedProducts, getCatalogCategories, prioritizeCategories } from "../lib/products";
import { readProducts } from "../lib/store";
import { readSiteImages } from "../lib/site-images";
import { useEffect, useState } from "react";

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
      <span className="section-heading__rule" aria-hidden="true" />
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
  heroSlides,
}) {
  const curatedProducts = (
    featuredProducts.length
      ? featuredProducts
      : recentProducts.length
        ? recentProducts
        : allProducts
  ).slice(0, 3);

  useEffect(() => {
    document.body.classList.add("home-page--hero-refresh");
    return () => document.body.classList.remove("home-page--hero-refresh");
  }, []);

  return (
    <>
      <SeoHead
        title="Kenya Handmade Jewelry, Gifts And Decor"
        description="Shop SharonCraft for handmade Kenyan jewellery, beaded gifts, home decor, and custom artisan pieces with simple WhatsApp ordering."
        path="/"
      />
      <Nav />
      <HeroSlideshow slides={heroSlides} />

      <QuickStatsBar />

      {/* Collections - Moved up for visual impact */}
      <section id="about-gallery" className="collections-section">
        <SectionHeading title="Shop by Category" kicker="Browse collections" />
        <div className="collections-grid">
          {collectionCards.map((collection) => (
            <a key={collection.title} href={collection.href} className="collection-card">
              <img src={collection.image} alt={collection.title} className="collection-card__image" loading="lazy" decoding="async" />
              <span className="collection-card__overlay" />
              {/* Text layer kept inside the card so overlay and positioning stay section-specific. */}
              <span className="collection-card__content">
                {collection.itemCount && <span className="collection-card__badge">{collection.itemCount} items</span>}
                <span className="collection-card__title display-md">{collection.title}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Custom Orders - Minimal Gold Card */}
      <section className="custom-orders-section">
        <div className="custom-orders-card">
          <div className="custom-orders-media" aria-hidden="true">
            {/* MEDIA: Replace src="" with your video or image URL here */}
            <video
              className="custom-orders-media__video"
              autoPlay
              muted
              loop
              playsInline
              src=""
            />
            <img
              className="custom-orders-media__image"
              src="/media/site/homepage/design.jpg"
              alt="Jewelry being handcrafted"
              loading="lazy"
              decoding="async"
            />
            <span className="custom-orders-media__overlay" />
          </div>

          <div className="custom-orders-content">
            <p className="custom-orders-card__label">Custom Orders</p>
            <h3 className="custom-orders-card__title">Design With Us</h3>
            <p className="custom-orders-card__description">
              Tell us your vision. We work with Kenya&apos;s finest artisans to craft a piece made entirely for you.
            </p>
            <a href="/custom-order" className="custom-orders-button">Start Design</a>
            <a href="/custom-order" className="custom-orders-link">See past custom work →</a>
          </div>
        </div>
      </section>

      {/* Payment Methods - Gold Card Grid */}
      <section className="payment-methods-section">
        <div className="payment-methods-heading">
          <p className="payment-methods-heading__kicker">Flexible Payment</p>
          <h3 className="payment-methods-heading__title">Multiple Payment Methods</h3>
        </div>
        <div className="payment-methods-grid">
          <div className="payment-method">
            <div className="payment-method__icon"><Icon name="dollar" size={24} /></div>
            <span className="payment-method__text">M-Pesa</span>
          </div>
          <div className="payment-method">
            <div className="payment-method__icon"><Icon name="dollar" size={24} /></div>
            <span className="payment-method__text">Bank Transfer</span>
          </div>
          <div className="payment-method">
            <div className="payment-method__icon"><Icon name="truck" size={24} /></div>
            <span className="payment-method__text">Cash on Delivery</span>
          </div>
          <div className="payment-method">
            <div className="payment-method__icon"><Icon name="mpesa" size={24} /></div>
            <span className="payment-method__text">Lipa Na M-Pesa</span>
          </div>
        </div>
      </section>

      {/* Trust Signals - Simplified, icons only */}
      <section className="trust-signals" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-6) var(--gutter)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 className="display-md">Why SharonCraft</h2>
        </div>

        <div className="trust-grid">
          <div className="trust-item">
            <div className="trust-icon"><Icon name="check" size={32} /></div>
            <h4>Verified Artisans</h4>
          </div>
          <div className="trust-item">
            <div className="trust-icon"><Icon name="truck" size={32} /></div>
            <h4>Fast Delivery</h4>
          </div>
          <div className="trust-item">
            <div className="trust-icon"><Icon name="star" size={32} /></div>
            <h4>Quality Guaranteed</h4>
          </div>
          <div className="trust-item">
            <div className="trust-icon"><Icon name="heart" size={32} /></div>
            <h4>Fair Trade</h4>
          </div>
        </div>
      </section>

      <main>
        <EditorialCuratedSection products={curatedProducts} />

        <section className="how-it-made-section" style={{ maxWidth: 'var(--max-width)', margin: 'var(--space-8) auto', padding: 'var(--space-8) var(--gutter)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h2 className="display-md">How It's Made</h2>
          </div>

          <div className="how-it-made-grid">
            <div className="how-it-made-step">
              <div className="how-it-made-number">1</div>
              <h3 className="how-it-made-title">Sourced</h3>
              <p className="how-it-made-description">Premium Kenyan materials</p>
            </div>

            <div className="how-it-made-step">
              <div className="how-it-made-number">2</div>
              <h3 className="how-it-made-title">Designed</h3>
              <p className="how-it-made-description">Master artisan sketches</p>
            </div>

            <div className="how-it-made-step">
              <div className="how-it-made-number">3</div>
              <h3 className="how-it-made-title">Crafted</h3>
              <p className="how-it-made-description">40+ hours handwork</p>
            </div>

            <div className="how-it-made-step">
              <div className="how-it-made-number">4</div>
              <h3 className="how-it-made-title">Verified</h3>
              <p className="how-it-made-description">Quality authenticated</p>
            </div>
          </div>
        </section>

        <TrustBadges />

        <ArtisanExpandingCards artisans={artisans} />

        <ArticleCarousel />

        <Testimonials />

        <CtaSection />

        <NewsletterSignup />
      </main>

      <Footer siteContent={siteContent} />

      <style jsx global>{`
        /* =========================
           Homepage announcement bar
           ========================= */
        body.home-page--hero-refresh {
          --announcement-height: 23px;
        }

        body.home-page--hero-refresh .nav__announcement {
          min-height: var(--announcement-height);
          padding: 5px 0;
        }

        body.home-page--hero-refresh .nav__announcement p {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 2.5px;
          text-transform: uppercase;
        }
      `}</style>

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
        /* Collections styling moved to assets/css/collections-section.css */
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
        /* Payment methods styling moved to assets/css/payment-methods.css */
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

        @media (max-width: 599px) {
          /* Collections responsive styles moved to assets/css/collections-section.css */
        }
        @media (min-width: 600px) and (max-width: 899px) {
          /* Collections responsive styles moved to assets/css/collections-section.css */
        }
        @media (min-width: 900px) {
          /* Collections responsive styles moved to assets/css/collections-section.css */
        }
        /* Custom orders button styling moved to assets/css/custom-orders-card.css */
        .how-it-made-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }
        .how-it-made-step {
          text-align: center;
          padding: var(--space-4);
        }
        .how-it-made-number {
          font-size: 3rem;
          font-weight: 700;
          color: var(--color-terracotta);
          line-height: 1;
          margin-bottom: var(--space-3);
        }
        .how-it-made-title {
          font-size: 1.25rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-primary);
          margin: 0 0 var(--space-2);
        }
        .how-it-made-description {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
        }
        @media (max-width: 599px) {
          .how-it-made-grid {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }
          .how-it-made-number {
            font-size: 2.5rem;
          }
        }
        @media (min-width: 600px) and (max-width: 899px) {
          .how-it-made-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-5);
          }
        }
        .how-it-made-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }
        .how-it-made-step {
          text-align: center;
          padding: var(--space-4);
        }
        .how-it-made-number {
          font-size: 3rem;
          font-weight: 700;
          color: var(--color-terracotta);
          line-height: 1;
          margin-bottom: var(--space-3);
        }
        .how-it-made-title {
          font-size: 1.25rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-primary);
          margin: 0 0 var(--space-2);
        }
        .how-it-made-description {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
        }
        @media (max-width: 599px) {
          .how-it-made-grid {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }
          .how-it-made-number {
            font-size: 2.5rem;
          }
        }
        @media (min-width: 600px) and (max-width: 899px) {
          .how-it-made-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-5);
          }
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
  const defaultHeroSlides = [
    {
      id: 1,
      type: "artisan",
      image: "/media/site/homepage/design.jpg",
      imageDesktop: "/media/site/homepage/design.jpg",
      imageMobile: "/media/site/homepage/design.jpg",
      title: "Nafula's Vision",
      subtitle: "Ceremonial Beadwork",
      description: "15+ years of crafting bold, ceremonial pieces",
      duration: 6,
      cta: "Meet Nafula",
      ctaLink: "/artisans/nafula",
    },
    {
      id: 2,
      type: "discount",
      image: "/media/site/homepage/ai-home-hero-decor-card.jpg",
      imageDesktop: "/media/site/homepage/ai-home-hero-decor-card.jpg",
      imageMobile: "/media/site/homepage/ai-home-hero-decor-card.jpg",
      title: "20% Off",
      subtitle: "Gift Collections",
      description: "This week only",
      duration: 5,
      cta: "Shop Gift Sets",
      ctaLink: "/shop?category=gifts",
    },
    {
      id: 3,
      type: "product",
      image: "/media/site/homepage/design.jpg",
      imageDesktop: "/media/site/homepage/design.jpg",
      imageMobile: "/media/site/homepage/design.jpg",
      title: "Featured: Wedding Jewelry",
      subtitle: "Bridal Beadwork",
      description: "From Achieng's collection",
      price: "$129",
      duration: 7,
      cta: "View Collection",
      ctaLink: "/shop?category=wedding",
    },
    {
      id: 4,
      type: "testimonial",
      image: "/media/site/homepage/design.jpg",
      imageDesktop: "/media/site/homepage/design.jpg",
      imageMobile: "/media/site/homepage/design.jpg",
      title: "Sarah's Wedding",
      subtitle: '"Every bead told a story"',
      description: "London, UK",
      duration: 6,
      cta: "Read Reviews",
      ctaLink: "/reviews",
    },
    {
      id: 5,
      type: "bundle",
      image: "/media/site/homepage/design.jpg",
      imageDesktop: "/media/site/homepage/design.jpg",
      imageMobile: "/media/site/homepage/design.jpg",
      title: "Bundle & Save",
      subtitle: "3-Piece Collection",
      description: "Get 3 pieces for $129",
      duration: 5,
      cta: "Shop Bundles",
      ctaLink: "/shop?category=bundles",
    },
    {
      id: 6,
      type: "brand",
      image: "/media/site/homepage/design.jpg",
      imageDesktop: "/media/site/homepage/design.jpg",
      imageMobile: "/media/site/homepage/design.jpg",
      title: "SharonCraft",
      subtitle: "47 Artisans. 40+ Hours. One Piece.",
      description: "Handmade in Kenya",
      duration: 6,
      cta: "Our Story",
      ctaLink: "/about",
    },
    {
      id: 7,
      type: "artisan",
      image: "/media/site/homepage/design.jpg",
      imageDesktop: "/media/site/homepage/design.jpg",
      imageMobile: "/media/site/homepage/design.jpg",
      title: "Muthoni's Wisdom",
      subtitle: '"I never want a piece to look repeated"',
      description: "18+ years perfecting her craft",
      duration: 7,
      cta: "Explore Home Decor",
      ctaLink: "/shop?category=home-decor",
    },
    {
      id: 8,
      type: "shipping",
      image: "/media/site/homepage/design.jpg",
      imageDesktop: "/media/site/homepage/design.jpg",
      imageMobile: "/media/site/homepage/design.jpg",
      title: "Free Shipping",
      subtitle: "On orders over $50",
      description: "Worldwide delivery",
      duration: 5,
      cta: "Shop Now",
      ctaLink: "/shop",
    },
  ];

  const [products, siteImages, heroSlides] = await Promise.all([
    readProducts(),
    readSiteImages(),
    readAdminContentField("heroSlides", defaultHeroSlides),
  ]);
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
      heroSlides,
    },
  };
}
