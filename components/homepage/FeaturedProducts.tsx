'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import ProductCard from '../ui/ProductCard';

export interface FeaturedProduct {
  id: string;
  name: string;
  slug?: string | null;
  price?: number | null;
  sale_price?: number | null;
  original_price?: number | null;
  originalPrice?: number | null;
  images?: string[] | null;
  image?: string | null;
  artisan?: string | null;
  category?: string | null;
  subcategory?: string | null;
  stock_quantity?: number | null;
  product_type?: string | null;
  production_time?: string | null;
  low_stock_alert?: number | null;
  is_new?: boolean | null;
  isNew?: boolean | null;
  is_best_seller?: boolean | null;
  isBestSeller?: boolean | null;
}

interface FeaturedProductsProps {
  products: FeaturedProduct[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const progressThumbRef = useRef<HTMLDivElement | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products.filter((product) => product?.id).slice(0, 8) : []),
    [products],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHint(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth <= 768) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    sectionRef.current
      ?.querySelectorAll('.fp-reveal')
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [safeProducts]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;

    let frameId = 0;
    const thumbWidth = 25; // thumb width as a percentage of track width

    const updateProgress = () => {
      frameId = 0;
      const thumb = progressThumbRef.current;
      if (!thumb) return;

      const maxScroll = node.scrollWidth - node.clientWidth;
      if (maxScroll <= 0) {
        thumb.style.transform = 'translateX(0)';
        return;
      }

      const progress = (node.scrollLeft / maxScroll) * 100;
      const maxTranslatePercent = ((100 - thumbWidth) / thumbWidth) * 100;
      const translateVal = (progress / 100) * maxTranslatePercent;
      thumb.style.transform = `translateX(${translateVal}%)`;
    };

    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateProgress);
    };

    node.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();

    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      node.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [safeProducts.length]);

  if (safeProducts.length === 0) return null;

  return (
    <section ref={sectionRef} className="featured-products" aria-labelledby="featured-products-title">
      <div className="featured-products__inner">
        {/* Campaign Narrative Left Column */}
        <div className="featured-products__narrative fp-reveal">
          <div>
            <span className="featured-products__label">Signature Edit</span>
            <h2 id="featured-products-title" className="featured-products__title">
              Pieces with a <span className="italic-serif">story.</span>
            </h2>
          </div>
          <p className="featured-products__description">
            A curated showcase of our most coveted hand-beaded creations. Meticulously crafted by master artisans in Nairobi, blending traditional African heritage with contemporary minimalist design.
          </p>
          <div className="featured-products__cta-wrapper">
            <Link href="/shop" className="featured-products__cta">
              <span>Explore the Collection</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Product Grid / Slider Right Column */}
        <div className="featured-products__products-area">
          <div className="featured-products__header-row">
            <Link href="/shop" className="featured-products__view-all">
              View all -&gt;
            </Link>
          </div>

          <div
            ref={scrollRef}
            className="featured-products__grid"
            aria-label="Featured products"
          >
            {safeProducts.map((product, index) => (
              <div
                key={product.id}
                className="fp-reveal featured-products__card-wrapper"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <ProductCard
                  product={product}
                  index={index}
                  priority={index < 4}
                />
              </div>
            ))}
          </div>

          <div className="featured-products__progress-bar max-md:block hidden">
            <div
              ref={progressThumbRef}
              className="featured-products__progress-thumb"
              style={{ width: '25%', transform: 'translateX(0)' }}
            />
          </div>

          {showHint ? <p className="featured-products__hint">Swipe to explore</p> : null}
        </div>
      </div>

      <style jsx>{`
        .featured-products {
          background: #ffffff;
          padding: 80px clamp(24px, 6vw, 80px);
          overflow: hidden;
        }

        .featured-products__inner {
          max-width: 1320px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 64px;
          align-items: start;
        }

        /* Scoped product card overrides for homepage featured products */
        .featured-products :global(.product-card-wrapper) {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .featured-products :global(.product-card__image-area) {
          background: #f5f1ec !important;
          border: none !important;
        }

        .featured-products__narrative {
          background: #f5f0eb;
          padding: 56px 40px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 0.5px solid rgba(139, 94, 60, 0.08);
        }

        .featured-products__label {
          display: block;
          margin-bottom: 8px;
          color: #8b5e3c;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .featured-products h2 {
          margin: 0;
          color: #1c1c1c;
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -0.3px;
        }

        .italic-serif {
          font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-weight: 400;
          color: #8b5e3c;
        }

        .featured-products__description {
          color: #555555;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 300;
          margin: 8px 0 16px;
          font-family: inherit;
        }

        .featured-products__cta-wrapper {
          margin-top: 8px;
        }

        :global(.featured-products__cta) {
          display: inline-flex;
          height: 48px;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          background: #1c1c1c;
          color: #fafaf8;
          padding: 0 36px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3px;
          text-decoration: none;
          text-transform: uppercase;
          border-radius: 24px;
          transition: background-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }

        :global(.featured-products__cta:hover) {
          background: #8b5e3c;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 94, 60, 0.15);
        }

        :global(.featured-products__cta svg) {
          width: 12px;
          height: 12px;
          stroke: currentColor;
          stroke-width: 1.75px;
          transition: transform 0.25s ease;
        }

        :global(.featured-products__cta:hover svg) {
          transform: translateX(4px);
        }

        .featured-products__products-area {
          display: flex;
          flex-direction: column;
        }

        .featured-products__header-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 24px;
        }

        :global(.featured-products__view-all) {
          color: #888888;
          border-bottom: 1px solid rgba(0, 0, 0, 0.15);
          padding-bottom: 2px;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 0.2s ease, border-color 0.2s ease;
        }

        :global(.featured-products__view-all:hover) {
          color: #111111;
          border-color: #111111;
        }

        .featured-products__grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .featured-products__card-wrapper {
          display: flex;
          width: 100%;
        }

        .featured-products__hint {
          display: none;
        }

        .fp-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .fp-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 1100px) {
          .featured-products__inner {
            gap: 40px;
            grid-template-columns: 300px 1fr;
          }

          .featured-products__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 900px) {
          .featured-products__inner {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .featured-products__narrative {
            padding: 44px 32px;
            text-align: center;
            align-items: center;
          }

          .featured-products__description {
            max-width: 540px;
          }

          .featured-products__header-row {
            display: none;
          }

          .featured-products__grid {
            display: flex;
            gap: 16px;
            margin-top: 0;
            overflow-x: auto;
            padding: 4px 20px 24px;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }

          .featured-products__grid::-webkit-scrollbar {
            display: none;
          }

          .featured-products__card-wrapper {
            flex: 0 0 48vw;
            max-width: 200px;
            scroll-snap-align: start;
          }

          .featured-products__hint {
            display: block;
            margin: 12px 0 0;
            color: #bbbbbb;
            font-size: 9px;
            letter-spacing: 2px;
            text-align: center;
            text-transform: uppercase;
          }

          .fp-reveal {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }

          .featured-products__progress-bar {
            height: 2px;
            background: rgba(139, 94, 60, 0.08);
            border-radius: 1px;
            margin: 0 20px;
            position: relative;
            overflow: hidden;
          }

          .featured-products__progress-thumb {
            height: 100%;
            background: #8b5e3c;
            border-radius: 1px;
            transition: transform 0.15s ease-out;
          }

          :global(.featured-products__cta) {
            width: 100%;
            height: 52px;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .featured-products {
            padding: 56px 0;
          }
        }
      `}</style>
    </section>
  );
}
