import ArtisanExpandingCards from "../components/ArtisanExpandingCards";
import ArticleCarousel from "../components/ArticleCarousel";
import CtaSection from "../components/CtaSection";
import Footer from "../components/Footer";
import HeroSection from "../components/homepage/HeroSection";
import FeaturedProducts from "../components/homepage/FeaturedProducts";
import CollectionsSection from "../components/homepage/CollectionsSection";
import LifestyleSection from "../components/homepage/LifestyleSection";
import Nav from "../components/Nav";
import NewsletterSignup from "../components/NewsletterSignup";
import QuickStatsBar from "../components/QuickStatsBar";
import SafeImage from "../components/ui/SafeImage";
import SeoHead from "../components/SeoHead";
import Testimonials from "../components/Testimonials";
import TrustBadges from "../components/TrustBadges";
import Icon from "../components/icons";
import { buildCollectionCards, buildFeaturedArtisans } from "../data/site";
import { sortByFeaturedOrder } from "../lib/catalog-sync";
import { filterPublishedProducts, getCatalogCategories, prioritizeCategories } from "../lib/products";
import { readProducts } from "../lib/store";
import { readSiteImages } from "../lib/site-images";
import { useEffect, useMemo } from "react";

export default function HomePage({
  featuredProducts = [],
  recentProducts = [],
  bestSellers = [],
  allProducts = [],
  collectionCards = [],
  artisans = [],
  categories = [],
  siteContent = {},
  heroConfig = null,
  lifestyleImages = [],
}) {
  const displayProducts = useMemo(() => {
    return featuredProducts.length
      ? featuredProducts
      : recentProducts.length
        ? recentProducts
        : allProducts;
  }, [featuredProducts, recentProducts, allProducts]);

  const formattedCollections = useMemo(() => {
    return (collectionCards || []).map((card, idx) => ({
      id: `col-${idx}`,
      name: card.title,
      slug: card.href ? card.href.replace('/shop/', '').replace('/shop', '') : 'jewellery',
      description: card.itemCount ? `${card.itemCount} items` : 'Handcrafted collection',
      cover_image: card.image,
    }));
  }, [collectionCards]);

  const customOrdersMediaType = siteContent?.customOrdersMediaType === "video" ? "video" : "image";
  const customOrdersImage = siteContent?.customOrdersImage || "/media/site/homepage/design.jpg";
  const customOrdersVideo = siteContent?.customOrdersVideo || "";
  const showCustomOrdersVideo = customOrdersMediaType === "video" && Boolean(customOrdersVideo);

  useEffect(() => {
    document.body.classList.add("home-page--hero-refresh");
    return () => document.body.classList.remove("home-page--hero-refresh");
  }, []);

  return (
    <>
      <SeoHead
        title="SharonCraft — Handmade Kenyan Jewelry, Accessories & Gifts"
        description="Discover handmade Kenyan jewelry, accessories, artisan gifts, and lifestyle pieces curated in Nairobi. Nairobi delivery KES 300, free over KES 5,000. Ships Kenya-wide."
        keywords="handmade jewelry Nairobi, Maasai beaded bracelets Kenya, Kenyan jewelry gifts, beaded earrings Nairobi, handmade accessories Kenya, Maasai necklace Kenya, Nairobi jewelry shop, African beaded jewelry, gifts from Kenya, handmade Kenyan key holders"
        path="/"
      />
      <Nav />
      
      {/* Editorial Hero Banner */}
      <HeroSection hero={heroConfig} />

      {/* Quick Service Highlights */}
      <QuickStatsBar />

      {/* Featured Editorial Products Showcase */}
      <FeaturedProducts products={displayProducts} />

      {/* Curated Category Edits */}
      <CollectionsSection collections={formattedCollections} />

      {/* Custom Orders Banner */}
      <section className="custom-orders-section">
        <div className="custom-orders-card">
          <div className="custom-orders-media" aria-hidden="true">
            {showCustomOrdersVideo ? (
              <video
                className="custom-orders-media__video"
                autoPlay
                muted
                loop
                playsInline
                src={customOrdersVideo}
                poster={customOrdersImage}
              />
            ) : (
              <SafeImage
                className="custom-orders-media__image"
                src={customOrdersImage}
                alt="Jewelry being handcrafted"
                type="hero"
              />
            )}
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

      {/* Flexible Payment Banner */}
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

      {/* Nairobi Lifestyle Gallery */}
      <LifestyleSection images={lifestyleImages} />

      <main>
        <TrustBadges />

        <ArtisanExpandingCards artisans={artisans} />

        <ArticleCarousel />

        <Testimonials />

        <CtaSection />

        <NewsletterSignup />
      </main>

      <Footer siteContent={siteContent} />

      <style jsx global>{`
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

        @media (max-width: 768px) {
          body.home-page--hero-refresh {
            --announcement-height: 28px;
          }

          body.home-page--hero-refresh .nav__announcement {
            height: var(--announcement-height);
            min-height: var(--announcement-height);
            padding: 0;
            overflow: hidden;
            display: flex;
            align-items: center;
          }

          body.home-page--hero-refresh .nav__announcement p {
            display: inline-block;
            white-space: nowrap;
            padding-left: 100%;
            font-size: 10px;
            line-height: 1;
            animation: homeAnnouncementMarquee 20s linear infinite;
          }
        }

        @keyframes homeAnnouncementMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  let heroConfig = null;
  let lifestyleImages = [];

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      const [heroRes, lifestyleRes] = await Promise.all([
        supabase.from('hero_config').select('*').eq('is_active', true).limit(1).maybeSingle(),
        supabase.from('lifestyle_images').select('*').eq('is_active', true).order('display_order', { ascending: true }),
      ]);

      if (heroRes?.data) heroConfig = heroRes.data;
      if (lifestyleRes?.data) lifestyleImages = lifestyleRes.data;
    }
  } catch (_e) {
    // Fallback to defaults inside components
  }

  const [products, siteImages] = await Promise.all([
    readProducts(),
    readSiteImages(),
  ]);
  const publishedProducts = filterPublishedProducts(products);

  return {
    props: {
      allProducts: prioritizeCategories(publishedProducts),
      featuredProducts: sortByFeaturedOrder(
        prioritizeCategories(publishedProducts.filter((product) => product.featured)),
      ).slice(0, 8),
      recentProducts: prioritizeCategories(
        publishedProducts.filter((product) => product.recent || product.isNew || product.newArrival),
      ).slice(0, 12),
      bestSellers: prioritizeCategories(
        publishedProducts.filter(
          (product) =>
            product.featured || /best seller/i.test(String(product.badge || "")),
        ),
      ).slice(0, 12),
      collectionCards: buildCollectionCards(siteImages),
      categories: getCatalogCategories(publishedProducts),
      artisans: buildFeaturedArtisans(siteImages),
      siteContent: siteImages,
      heroConfig: heroConfig || null,
      lifestyleImages: lifestyleImages || [],
    },
  };
}
