import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "../lib/cart-context";
import Icon from "./icons";

export default function MobileBottomNav() {
  const router = useRouter();
  const { count } = useCart();

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

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <ul className="mobile-bottom-nav__list">
        {navItems.map((item) => (
          <li key={item.href + item.label} className="mobile-bottom-nav__item">
            <Link
              href={item.href}
              className={`mobile-bottom-nav__link ${
                isActive(item.href) ? "mobile-bottom-nav__link--active" : ""
              }`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span className="mobile-bottom-nav__icon-wrapper">
                <Icon name={item.icon} size={24} />
                {item.badge && item.badge > 0 && (
                  <span className="mobile-bottom-nav__badge">{item.badge}</span>
                )}
              </span>
              <span className="mobile-bottom-nav__label">{item.label}</span>
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
          background: #1a1a1a;
          border-top: 1px solid rgba(249, 246, 238, 0.1);
          z-index: 40;
        }

        .mobile-bottom-nav__list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          height: 70px;
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
          color: rgba(249, 246, 238, 0.7);
          text-decoration: none;
          font-size: 0.75rem;
          gap: 4px;
          transition: all 0.3s ease;
          position: relative;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .mobile-bottom-nav__link:active {
          background: rgba(192, 77, 41, 0.1);
        }

        .mobile-bottom-nav__link--active {
          color: #C04D29;
        }

        .mobile-bottom-nav__icon-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
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
          border: 2px solid #1a1a1a;
        }

        .mobile-bottom-nav__label {
          line-height: 1;
        }

        /* Show on mobile only */
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: block;
          }

          body {
            padding-bottom: 70px;
          }
        }

        /* Add padding to footer on mobile to account for bottom nav */
        @media (max-width: 768px) {
          :global(.footer) {
            margin-bottom: 70px;
          }
        }
      `}</style>
    </nav>
  );
}
