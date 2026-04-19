import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "./icons";

export default function MobileProductShowcase({ products = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Default products if none provided
  const defaultProducts = [
    {
      id: 1,
      name: "Maasai Beaded Necklace",
      price: 45,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop",
      category: "Jewelry",
      badge: "Best Seller",
    },
    {
      id: 2,
      name: "Terracotta Home Decor",
      price: 35,
      image: "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop",
      category: "Home",
      badge: "New",
    },
    {
      id: 3,
      name: "Beaded Earring Set",
      price: 28,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop",
      category: "Jewelry",
      badge: "Limited",
    },
  ];

  const displayProducts = products.length > 0 ? products : defaultProducts;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayProducts.length]);

  const currentProduct = displayProducts[activeIndex];

  return (
    <section className="mobile-showcase">
      <div className="mobile-showcase__container">
        {/* Image Carousel */}
        <div className="mobile-showcase__carousel">
          <div className="mobile-showcase__image-wrapper">
            <img
              src={currentProduct.image}
              alt={currentProduct.name}
              className="mobile-showcase__image"
            />
            <div className="mobile-showcase__badge">{currentProduct.badge}</div>
          </div>

          {/* Dot Indicators */}
          <div className="mobile-showcase__indicators">
            {displayProducts.map((_, idx) => (
              <button
                key={idx}
                className={`mobile-showcase__dot ${
                  idx === activeIndex ? "mobile-showcase__dot--active" : ""
                }`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Product ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="mobile-showcase__content">
          <div className="mobile-showcase__category">{currentProduct.category}</div>
          
          <h3 className="mobile-showcase__title">{currentProduct.name}</h3>

          <div className="mobile-showcase__price">
            <span className="mobile-showcase__amount">${currentProduct.price}</span>
            <span className="mobile-showcase__rating">
              <Icon name="star" size={14} /> 4.9 (320)
            </span>
          </div>

          <Link href={`/product/${currentProduct.id}`}>
            <a className="mobile-showcase__button">
              <span>View Product</span>
              <Icon name="arrow-right" size={18} />
            </a>
          </Link>

          {/* Quick Stats */}
          <div className="mobile-showcase__stats">
            <div className="mobile-showcase__stat">
              <Icon name="check-circle" size={16} />
              <span>Handcrafted</span>
            </div>
            <div className="mobile-showcase__stat">
              <Icon name="truck" size={16} />
              <span>Fast Ship</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mobile-showcase {
          display: none;
          padding: var(--space-4) var(--gutter);
          background: linear-gradient(135deg, rgba(192, 77, 41, 0.08) 0%, rgba(212, 165, 116, 0.06) 100%);
          border-top: 2px solid #C04D29;
        }

        @media (max-width: 768px) {
          .mobile-showcase {
            display: block;
          }
        }

        .mobile-showcase__container {
          max-width: 100%;
        }

        .mobile-showcase__carousel {
          position: relative;
          margin-bottom: var(--space-4);
        }

        .mobile-showcase__image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 100%;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .mobile-showcase__image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          animation: fadeIn 0.4s ease;
        }

        .mobile-showcase__badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #C04D29;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 8px rgba(192, 77, 41, 0.3);
          animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .mobile-showcase__indicators {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: var(--space-3);
        }

        .mobile-showcase__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(192, 77, 41, 0.3);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .mobile-showcase__dot--active {
          background: #C04D29;
          width: 24px;
          border-radius: 4px;
        }

        .mobile-showcase__content {
          animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
          opacity: 0;
        }

        .mobile-showcase__category {
          font-size: 0.75rem;
          font-weight: 700;
          color: #C04D29;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .mobile-showcase__title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2a2a2a;
          margin: 0 0 var(--space-2) 0;
          line-height: 1.3;
        }

        .mobile-showcase__price {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .mobile-showcase__amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #C04D29;
        }

        .mobile-showcase__rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.875rem;
          color: #666;
        }

        .mobile-showcase__rating svg {
          color: #D4A574;
        }

        .mobile-showcase__button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          width: 100%;
          padding: 12px 16px;
          background: #C04D29;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9375rem;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-3);
        }

        .mobile-showcase__button:active {
          background: #a83a1a;
          transform: scale(0.98);
        }

        .mobile-showcase__stats {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-3);
          background: white;
          border-radius: 8px;
          border: 1px solid rgba(192, 77, 41, 0.1);
        }

        .mobile-showcase__stat {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: #666;
          font-weight: 500;
        }

        .mobile-showcase__stat svg {
          color: #C04D29;
          flex-shrink: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
