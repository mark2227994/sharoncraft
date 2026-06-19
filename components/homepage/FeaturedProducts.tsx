'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';

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
        <header className="featured-products__header fp-reveal">
          <div>
            <span className="featured-products__label">Signature Edit</span>
            <h2 id="featured-products-title">
              Pieces with a <span className="italic-serif">story.</span>
            </h2>
          </div>

          <Link href="/shop" className="featured-products__view-all">
            View all -&gt;
          </Link>
        </header>

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
                product={product as any}
                size={isMobile ? 'small' : 'default'}
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

        <div className="featured-products__footer">
          <Link href="/shop" className="featured-products__cta">
            <span>Explore the Collection</span>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .featured-products {
          background: #ffffff;
          padding: 80px 80px;
        }

        .featured-products__inner {
          max-width: 1320px;
          margin: 0 auto;
        }

        .featured-products__header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
        }

        .featured-products__label {
          display: block;
          margin-bottom: 8px;
          color: #8b5e3c;
          font-size: 10px;
          font-weight: 400;
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

        .featured-products__view-all {
          color: #888888;
          border-bottom: 1px solid rgba(0, 0, 0, 0.15);
          padding-bottom: 2px;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 0.2s ease, border-color 0.2s ease;
        }

        .featured-products__view-all:hover {
          color: #111111;
          border-color: #111111;
        }

        .featured-products__grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
          margin-top: 40px;
        }

        .featured-products__card-wrapper {
          display: flex;
          width: 100%;
        }

        .featured-products__footer {
          margin-top: 48px;
          text-align: center;
        }

        .featured-products__cta {
          display: inline-flex;
          height: 48px;
          align-items: center;
          gap: 8px;
          border: 1.5px solid #111111;
          background: transparent;
          color: #111111;
          padding: 0 44px;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 3px;
          text-decoration: none;
          text-transform: uppercase;
          transition: background 0.25s ease, color 0.25s ease;
        }

        .featured-products__cta:hover {
          background: #111111;
          color: #ffffff;
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
          .featured-products__grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 899px) {
          .featured-products__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .featured-products {
            padding: 56px 0;
          }

          .featured-products__header {
            padding: 0 20px 28px;
          }

          .featured-products__view-all {
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
            display: flex;
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

          .featured-products__footer {
            margin-top: 32px;
            padding: 0 20px;
          }

          .featured-products__cta {
            width: 100%;
            height: 52px;
            justify-content: center;
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
        }
      `}</style>
    </section>
  );
}
