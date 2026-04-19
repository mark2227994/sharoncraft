import { useState, useEffect } from "react";
import Link from "next/link";

export default function PromotionBanner() {
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  async function fetchPromotions() {
    try {
      const res = await fetch("/api/admin/promotions");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const activePromo = data.find(p => p.active && new Date(p.startDate) <= new Date() && new Date() <= new Date(p.endDate));
        if (activePromo) {
          setPromotion(activePromo);
        } else if (data[0]) {
          setPromotion(data[0]);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch promotions:", err);
      setLoading(false);
    }
  }

  if (!promotion) return null;

  const getBackgroundColor = () => {
    switch(promotion.type) {
      case 'banner': return 'linear-gradient(135deg, #C04D29 0%, #D4A574 100%)';
      case 'seasonal': return 'linear-gradient(135deg, #2C5F2D 0%, #7CB342 100%)';
      case 'flash_sale': return 'linear-gradient(135deg, #D4A574 0%, #FF6B6B 100%)';
      case 'discount_code': return 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)';
      default: return 'linear-gradient(135deg, #C04D29 0%, #D4A574 100%)';
    }
  };

  const renderContent = () => {
    if (promotion.type === 'banner' || promotion.type === 'seasonal') {
      return (
        <div className="promo-banner__content">
          <h3 className="promo-banner__title">{promotion.title}</h3>
          <p className="promo-banner__description">{promotion.description}</p>
          {promotion.cta && (
            <Link href={promotion.ctaLink || '/shop'} className="promo-banner__cta">
              {promotion.cta} →
            </Link>
          )}
        </div>
      );
    } else if (promotion.type === 'flash_sale') {
      return (
        <div className="promo-banner__content">
          <h3 className="promo-banner__title">⚡ {promotion.title}</h3>
          <p className="promo-banner__description">
            Up to {promotion.discountPercentage}% off for a limited time!
          </p>
          <Link href={promotion.ctaLink || '/shop'} className="promo-banner__cta">
            {promotion.cta || 'Shop Now'} →
          </Link>
        </div>
      );
    } else if (promotion.type === 'discount_code') {
      return (
        <div className="promo-banner__content">
          <h3 className="promo-banner__title">{promotion.title}</h3>
          <p className="promo-banner__code">Code: <strong>{promotion.discountCode}</strong></p>
          <p className="promo-banner__description">{promotion.discountPercentage}% off | {promotion.description}</p>
          <Link href={promotion.ctaLink || '/shop'} className="promo-banner__cta">
            {promotion.cta || 'Use Code'} →
          </Link>
        </div>
      );
    }
  };

  return (
    <div className="promo-banner" style={{ background: getBackgroundColor() }}>
      {renderContent()}

      <style jsx>{`
        .promo-banner {
          padding: var(--space-4) var(--gutter);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          text-align: center;
          color: #fff;
          background-attachment: fixed;
        }

        .promo-banner__content {
          max-width: 600px;
          flex: 1;
        }

        .promo-banner__title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 var(--space-2) 0;
          letter-spacing: -0.02em;
        }

        .promo-banner__description {
          font-size: 0.95rem;
          margin: 0 0 var(--space-3) 0;
          opacity: 0.95;
        }

        .promo-banner__code {
          font-size: 1rem;
          margin: 0 0 var(--space-2) 0;
          font-family: 'Courier New', monospace;
          background: rgba(0, 0, 0, 0.2);
          padding: var(--space-2) var(--space-3);
          border-radius: 4px;
          display: inline-block;
        }

        .promo-banner__cta {
          display: inline-block;
          padding: var(--space-2) var(--space-4);
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #fff;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .promo-banner__cta:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.6);
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .promo-banner {
            flex-direction: column;
          }

          .promo-banner__title {
            font-size: 1.1rem;
          }

          .promo-banner__description {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
