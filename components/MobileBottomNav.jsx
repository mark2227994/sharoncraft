import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "../lib/cart-context";
import Icon from "./icons";
import { useState, useEffect } from "react";

export default function MobileBottomNav() {
  const router = useRouter();
  const { count } = useCart();
  const [indicatorPosition, setIndicatorPosition] = useState(0);

  const navItems = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/shop", label: "Shop", icon: "shopping-bag" },
    { href: "/shop", label: "Search", icon: "search" },
    { href: "/cart", label: "Cart", icon: "cart", badge: count },
    { href: "/account", label: "Account", icon: "user" },
  ];

  const isActive = (href) => {
    if (href === "/") return router.pathname === "/";
    return router.pathname.startsWith(href);
  };

  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => {
      if (item.href === "/") return router.pathname === "/";
      return router.pathname.startsWith(item.href);
    });
    if (activeIndex !== -1) {
      setIndicatorPosition((activeIndex / navItems.length) * 100);
    }
  }, [router.pathname]);

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <div className="mobile-bottom-nav__indicator" style={{ left: `${indicatorPosition}%` }} />
      <ul className="mobile-bottom-nav__list">
        {navItems.map((item) => (
          <li key={item.href + item.label} className="mobile-bottom-nav__item">
            <Link
              href={item.href}
              className={`mobile-bottom-nav__link ${
                isActive(item.href) ? "mobile-bottom-nav__link--active" : ""
              }`}
              aria-label={item.label}
              title={item.label}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span className="mobile-bottom-nav__icon-wrapper">
                <Icon name={item.icon} size={24} />
                {item.badge && item.badge > 0 && (
                  <span className="mobile-bottom-nav__badge">{item.badge}</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #f9f6ee;
          border-top: 2px solid #C04D29;
          z-index: 40;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
        }

        .mobile-bottom-nav__indicator {
          position: absolute;
          bottom: 0;
          height: 3px;
          width: 20%;
          background: #C04D29;
          transition: left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: 3px 3px 0 0;
        }

        .mobile-bottom-nav__list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          height: 60px;
          align-items: center;
          justify-content: space-around;
        }

        .mobile-bottom-nav__item {
          flex: 1;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-bottom-nav__link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: #2a2a2a;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          opacity: 0.7;
          cursor: pointer;
        }

        .mobile-bottom-nav__link:active {
          background: rgba(192, 77, 41, 0.08);
        }

        .mobile-bottom-nav__link--active {
          color: #C04D29;
          opacity: 1;
        }

        .mobile-bottom-nav__icon-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .mobile-bottom-nav__link--active .mobile-bottom-nav__icon-wrapper {
          transform: scale(1.2);
        }

        .mobile-bottom-nav__link:hover .mobile-bottom-nav__icon-wrapper {
          transform: scale(1.15);
        }

        .mobile-bottom-nav__badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: #C04D29;
          color: #f9f6ee;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          border: 2px solid #f9f6ee;
          animation: badge-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes badge-pop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Show on mobile only */
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: block;
          }

          body {
            padding-bottom: 60px;
          }
        }

        /* Add padding to footer on mobile to account for bottom nav */
        @media (max-width: 768px) {
          :global(.footer) {
            margin-bottom: 60px;
          }
        }
      `}</style>
    </nav>
  );
}
