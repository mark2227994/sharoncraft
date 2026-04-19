import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "./icons";
import { useCart } from "../lib/cart-context";

export default function StickyMiniCart() {
  const { items: cart } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  // Calculate total dynamically from cart items
  const cartTotal = cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const cartCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible || cartCount === 0) return null;

  return (
    <>
      <Link href="/cart">
        <a className="sticky-mini-cart">
          <div className="sticky-mini-cart__content">
            <div className="sticky-mini-cart__icon-wrapper">
              <Icon name="shopping-bag" size={20} />
              {cartCount > 0 && (
                <span className="sticky-mini-cart__badge">{cartCount}</span>
              )}
            </div>
            <div className="sticky-mini-cart__info">
              <span className="sticky-mini-cart__label">Your Cart</span>
              <span className="sticky-mini-cart__total">${cartTotal.toFixed(2)}</span>
            </div>
          </div>
          <Icon name="arrowR" size={18} />
        </a>
      </Link>

      <style jsx>{`
        .sticky-mini-cart {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #C04D29 0%, #D4A574 100%);
          color: white;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          z-index: 35;
          animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .sticky-mini-cart:hover {
          background: linear-gradient(135deg, #a83a1a 0%, #C49464 100%);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .sticky-mini-cart__content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .sticky-mini-cart__icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sticky-mini-cart__badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: white;
          color: #C04D29;
          font-size: 11px;
          font-weight: 700;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .sticky-mini-cart__info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sticky-mini-cart__label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          opacity: 0.9;
        }

        .sticky-mini-cart__total {
          font-size: 14px;
          font-weight: 700;
        }

        .sticky-mini-cart svg {
          opacity: 0.8;
          transition: transform 0.3s ease;
        }

        .sticky-mini-cart:hover svg {
          transform: translateX(2px);
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pop {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .sticky-mini-cart {
            padding: 10px 14px;
          }

          .sticky-mini-cart__label {
            font-size: 10px;
          }

          .sticky-mini-cart__total {
            font-size: 13px;
          }
        }

        @media (min-width: 769px) {
          .sticky-mini-cart {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
