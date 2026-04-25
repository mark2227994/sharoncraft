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
              aria-label={item.label}
              title={item.label}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span className="mobile-bottom-nav__icon-wrapper">
                <Icon name={item.icon} size={22} strokeWidth={1.8} />
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
          gap: 4px;
          width: 100%;
          height: 100%;
          color: #888888;
          text-decoration: none;
          transition: color 0.2s ease;
          position: relative;
          cursor: pointer;
        }

        .mobile-bottom-nav__link--active {
          color: #1c1c1c;
        }

        .mobile-bottom-nav__icon-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .mobile-bottom-nav__label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.5px;
          line-height: 1;
          color: currentColor;
          transition: color 0.2s ease;
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
          border: 2px solid #ffffff;
        }

        /* Show on mobile only */
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 56px;
            padding-bottom: env(safe-area-inset-bottom);
            background: #ffffff;
            border-top: 1px solid #efefef;
            z-index: 40;
            box-shadow: none;
          }

          .mobile-bottom-nav__list {
            height: 56px;
          }

          .mobile-bottom-nav__link :global(svg) {
            color: currentColor;
          }

          body {
            padding-bottom: calc(56px + env(safe-area-inset-bottom));
          }
        }

        /* Add padding to footer on mobile to account for bottom nav */
        @media (max-width: 768px) {
          :global(.footer) {
            margin-bottom: calc(56px + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </nav>
  );
}
