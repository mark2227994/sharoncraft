import Link from "next/link";
import Icon from "./icons";
import { useState } from "react";

export default function ProductQuickView({ product, onViewClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = product.images?.[0]?.url || product.image || "/placeholder.jpg";
  const price = product.price || 0;
  const rating = product.rating || 0;
  const reviews = product.reviews || 0;

  return (
    <div
      className="quick-view-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="quick-view-image">
        <img src={imageUrl} alt={product.name} />
        
        {isHovered && (
          <div className="quick-view-overlay">
            <button
              className="quick-view-button"
              onClick={() => onViewClick?.(product)}
              aria-label={`Quick view ${product.name}`}
            >
              <Icon name="eye" size={24} />
              <span>Quick View</span>
            </button>
          </div>
        )}

        {product.badge && (
          <div className="quick-view-badge">{product.badge}</div>
        )}
      </div>

      <div className="quick-view-content">
        <div className="quick-view-category">{product.category}</div>
        <Link href={`/product/${product.id || product.slug}`}>
          <a className="quick-view-title">{product.name}</a>
        </Link>

        {rating > 0 && (
          <div className="quick-view-rating">
            <div className="quick-view-stars">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  name={i < Math.round(rating) ? "star-fill" : "star"}
                  size={14}
                  className={i < Math.round(rating) ? "filled" : ""}
                />
              ))}
            </div>
            <span className="quick-view-reviews">({reviews})</span>
          </div>
        )}

        <div className="quick-view-price">
          <span className="quick-view-price-value">${price.toFixed(2)}</span>
        </div>

        <Link href={`/product/${product.id || product.slug}`}>
          <a className="quick-view-add-to-cart">
            <Icon name="shopping-bag" size={18} />
            <span>View Product</span>
          </a>
        </Link>
      </div>

      <style jsx>{`
        .quick-view-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .quick-view-container:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }

        .quick-view-image {
          position: relative;
          width: 100%;
          padding-top: 100%;
          background: #f9f6ee;
          overflow: hidden;
        }

        .quick-view-image img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .quick-view-container:hover .quick-view-image img {
          transform: scale(1.08);
        }

        .quick-view-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .quick-view-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: white;
          color: #C04D29;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: scale(0.9);
          animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .quick-view-button:hover {
          background: #C04D29;
          color: white;
          transform: scale(1);
        }

        .quick-view-button svg {
          width: 24px;
          height: 24px;
        }

        .quick-view-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #C04D29;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .quick-view-content {
          flex: 1;
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
        }

        .quick-view-category {
          font-size: 0.75rem;
          font-weight: 700;
          color: #C04D29;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .quick-view-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #2a2a2a;
          text-decoration: none;
          margin-bottom: 8px;
          line-height: 1.4;
          transition: color 0.3s ease;
          flex: 1;
        }

        .quick-view-title:hover {
          color: #C04D29;
        }

        .quick-view-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
        }

        .quick-view-stars {
          display: flex;
          gap: 2px;
          color: #D4A574;
        }

        .quick-view-stars :global(.filled) {
          color: #C04D29;
        }

        .quick-view-reviews {
          font-size: 0.8125rem;
          color: #999;
        }

        .quick-view-price {
          margin-bottom: var(--space-2);
        }

        .quick-view-price-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #C04D29;
        }

        .quick-view-add-to-cart {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          background: #C04D29;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .quick-view-add-to-cart:hover {
          background: #a83a1a;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(192, 77, 41, 0.3);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes popIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
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

        @media (max-width: 768px) {
          .quick-view-button {
            transform: scale(1);
          }

          .quick-view-overlay {
            background: rgba(0, 0, 0, 0.7);
          }
        }
      `}</style>
    </div>
  );
}
