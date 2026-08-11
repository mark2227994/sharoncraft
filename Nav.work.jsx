import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import { shopCategoryTree } from "../data/site";
import siteImages from "../data/site-images.json";
import { useCart } from "../lib/cart-context";

const NavMountContext = createContext({ suppressPageNavMounts: false });

const DEFAULT_ANNOUNCEMENT_ITEMS = [
  "Handmade in Kenya",
  "New Maasai-inspired pieces",
  "Made to order 5-7 days",
  "Free delivery in Nairobi",
  "Secure M-Pesa checkout",
];

const PRIMARY_LINKS = [
  { label: "SHOP", href: "/shop" },
  { label: "ARTISANS", href: "/artisans" },
  { label: "ABOUT", href: "/about" },
];

const DESKTOP_CTA = { label: "Custom Orders", href: "/custom-order" };

const MOBILE_SHOP_LINKS = [
  { label: "Jewellery", href: "/shop?category=Jewellery" },
  { label: "Accessories", href: "/shop?category=Accessories" },
  { label: "African Wear", href: "/shop?category=African%20Wear" },
  { label: "Home & Living", href: "/shop?category=Home%20%26%20Living" },
  { label: "Art & Craft", href: "/shop?category=Art%20%26%20Craft" },
  { label: "Gifted Carry", href: "/shop?category=Gifted%20Carry" },
];

const MEGA_COLUMNS = [
  {
    label: "Jewellery",
    items: [
      { label: "Necklaces", href: "/shop?category=Jewellery&subcategory=Necklaces" },
      { label: "Earrings", href: "/shop?category=Jewellery&subcategory=Earrings" },
      { label: "Bracelets", href: "/shop?category=Jewellery&subcategory=Bracelets" },
      { label: "Bangles", href: "/shop?category=Jewellery&subcategory=Bangles" },
      { label: "Anklets", href: "/shop?category=Jewellery&subcategory=Anklets" },
      { label: "Rings", href: "/shop?category=Jewellery&subcategory=Rings" },
    ],
  },
  {
    label: "Accessories",
    items: [
      { label: "Beaded Sandals", href: "/shop?category=Accessories&subcategory=Beaded%20Sandals" },
      { label: "Kiondos", href: "/shop?category=Accessories&subcategory=Kiondos" },
      { label: "Belts", href: "/shop?category=Accessories&subcategory=Belts" },
      { label: "Bags & Pouches", href: "/shop?category=Accessories&subcategory=Bags%20%26%20Pouches" },
      { label: "Key Holders", href: "/shop?category=Accessories&subcategory=Key%20Holders" },
    ],
  },
  {
    label: "More Collections",
    items: [
      { label: "African Wear", href: "/shop?category=African%20Wear" },
      { label: "Home & Living", href: "/shop?category=Home%20%26%20Living" },
      { label: "Art & Craft", href: "/shop?category=Art%20%26%20Craft" },
      { label: "Gifted Carry", href: "/shop?category=Gifted%20Carry" },
    ],
  },
];

const DESKTOP_ANNOUNCEMENT_HEIGHT = 32;
const MOBILE_ANNOUNCEMENT_HEIGHT = 28;
const DESKTOP_NAV_HEIGHT = 60;
const MOBILE_NAV_HEIGHT = 52;

function formatWhatsappNumber(rawValue) {
  const digits = String(rawValue || "").replace(/\D+/g, "");
  if (!digits) return "254112222572";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

function isActiveLink(pathname, href) {
  if (!pathname || !href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getChromeMetrics() {
  if (typeof window === "undefined") {
    return {
      announcementHeight: DESKTOP_ANNOUNCEMENT_HEIGHT,
      navHeight: DESKTOP_NAV_HEIGHT,
    };
  }

  return window.innerWidth >= 768
    ? { announcementHeight: DESKTOP_ANNOUNCEMENT_HEIGHT, navHeight: DESKTOP_NAV_HEIGHT }
    : { announcementHeight: MOBILE_ANNOUNCEMENT_HEIGHT, navHeight: MOBILE_NAV_HEIGHT };
}

function ShopSearchIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.4-3.4" />
    </svg>
  );
}

function HeartIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.7 5.3a5 5 0 0 0-7.1 0L12 6.8l-1.6-1.5a5 5 0 1 0-7.1 7.1L12 21l8.7-8.6a5 5 0 0 0 0-7.1Z" />
    </svg>
  );
}

function BagIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8h14l-1.1 11.2A2 2 0 0 1 15.9 21H8.1a2 2 0 0 1-2-1.8L5 8Z" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MobileSocialLink({ href, label, onClick }) {
  return (
    <a href={href} onClick={onClick} className="site-nav__mobile-social-link">
      {label}
    </a>
  );
}

export function NavMountProvider({ children, suppressPageNavMounts = false }) {
  const value = useMemo(
    () => ({ suppressPageNavMounts }),
    [suppressPageNavMounts],
  );

  return <NavMountContext.Provider value={value}>{children}</NavMountContext.Provider>;
}

export default function Nav({
  announcementItems = DEFAULT_ANNOUNCEMENT_ITEMS,
  globalMount = false,
}) {
  const router = useRouter();
  const { suppressPageNavMounts } = useContext(NavMountContext);
  const { count, wishlistCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [megaOpen, setMegaOpen] = useState(false);
  const [collectionCount, setCollectionCount] = useState(null);
  const [navState, setNavState] = useState(() => ({
    scrollY: 0,
    hidden: false,
    navTop: DESKTOP_ANNOUNCEMENT_HEIGHT,
    announcementHeight: DESKTOP_ANNOUNCEMENT_HEIGHT,
    navHeight: DESKTOP_NAV_HEIGHT,
  }));
  const lastScrollYRef = useRef(0);
  const closeMegaTimeoutRef = useRef(null);
  const menuButtonRef = useRef(null);
  const menuPanelRef = useRef(null);
  const mobileCloseButtonRef = useRef(null);
  const searchButtonRef = useRef(null);
  const searchTrayRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const isHomePage = router.pathname === "/";
  const heroThreshold = navState.announcementHeight + 80;
  const isHeroState =
    isHomePage && navState.scrollY < heroThreshold && !menuOpen && !searchOpen;
  const isSolidState = !isHeroState;
  const whatsappNumber = formatWhatsappNumber(siteImages?.contactWhatsApp);
  const instagramUrl =
    siteImages?.footerContent?.column1?.socialLinks?.find(
      (item) => item?.platform === "instagram",
    )?.url || "https://instagram.com/sharoncraft";
  const tiktokUrl =
    siteImages?.footerContent?.column1?.socialLinks?.find(
      (item) => item?.platform === "tiktok",
    )?.url || "https://tiktok.com/@sharoncraft";

  const announcementTrack = useMemo(() => {
    const items = Array.isArray(announcementItems) && announcementItems.length
      ? announcementItems
      : DEFAULT_ANNOUNCEMENT_ITEMS;

    return [...items, ...items];
  }, [announcementItems]);

  const shopCategoryCount = useMemo(() => {
    return shopCategoryTree.filter((node) => node.id !== "all").length;
  }, []);

  useEffect(() => {
    if (suppressPageNavMounts && !globalMount) {
      return undefined;
    }

    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.pageYOffset || 0;
      const metrics = getChromeMetrics();
      const nextTop = Math.max(metrics.announcementHeight - currentScrollY, 0);
      const scrollingDown = currentScrollY > lastScrollYRef.current;
      const shouldHide =
        !menuOpen &&
        !searchOpen &&
        scrollingDown &&
        currentScrollY > metrics.announcementHeight + 120;

      setNavState({
        scrollY: currentScrollY,
        hidden: shouldHide,
        navTop: nextTop,
        announcementHeight: metrics.announcementHeight,
        navHeight: metrics.navHeight,
      });
      lastScrollYRef.current = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(handleScroll);
    };

    handleScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [globalMount, menuOpen, searchOpen, suppressPageNavMounts]);

  useEffect(() => {
    setMenuOpen(false);
    setShopMenuOpen(false);
    setSearchOpen(false);
    setMegaOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!searchOpen) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;
      if (
        searchTrayRef.current?.contains(target) ||
        searchButtonRef.current?.contains(target) ||
        searchContainerRef.current?.contains(target)
      ) {
        return;
      }
      setSearchOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
        setMegaOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return undefined;

    searchInputRef.current?.focus();
    return undefined;
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) {
      menuButtonRef.current?.focus();
      return undefined;
    }

    const panel = menuPanelRef.current;
    const firstFocusable = mobileCloseButtonRef.current;
    firstFocusable?.focus();

    const trapFocus = (event) => {
      if (event.key !== "Tab" || !panel) return;
      const focusable = panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel?.addEventListener("keydown", trapFocus);
    return () => panel?.removeEventListener("keydown", trapFocus);
  }, [menuOpen]);

  useEffect(() => {
    let cancelled = false;

    const fetchCollectionCount = async () => {
      try {
        const response = await fetch("/api/shop/products");
        if (!response.ok) return;
        const payload = await response.json();
        if (!cancelled && Number.isFinite(Number(payload?.totalCount))) {
          setCollectionCount(Number(payload.totalCount));
        }
      } catch {
        // Keep the dropdown functional without a dynamic total.
      }
    };

    void fetchCollectionCount();

    return () => {
      cancelled = true;
    };
  }, []);

  if (suppressPageNavMounts && !globalMount) {
    return null;
  }

  const navTextColor = isSolidState ? "#888" : "rgba(255,255,255,0.85)";
  const navLogoColor = isSolidState ? "#1c1c1c" : "#ffffff";
  const badgeBackground = isSolidState ? "#1c1c1c" : "rgba(255,255,255,0.94)";
  const badgeColor = isSolidState ? "#ffffff" : "#080808";
  const mobileCartBadgeBackground = badgeBackground;
  const mobileCartBadgeColor = badgeColor;
  const customOrderActive = isActiveLink(router.pathname, DESKTOP_CTA.href);

  const handleSearchToggle = () => {
    setMegaOpen(false);
    setMenuOpen(false);
    setSearchOpen((current) => !current);
  };

  const handleMobileMenuToggle = () => {
    setSearchOpen(false);
    setMegaOpen(false);
    setMenuOpen((current) => !current);
  };

  const handleDesktopShopEnter = () => {
    window.clearTimeout(closeMegaTimeoutRef.current);
    setMegaOpen(true);
  };

  const handleDesktopShopLeave = () => {
    window.clearTimeout(closeMegaTimeoutRef.current);
    closeMegaTimeoutRef.current = window.setTimeout(() => {
      setMegaOpen(false);
    }, 150);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const nextQuery = searchQuery.trim();
    setSearchOpen(false);
    void router.push(nextQuery ? `/shop?search=${encodeURIComponent(nextQuery)}` : "/shop");
  };

  const mobileSocialClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <a href="#main-content" className="site-nav__skip-link">
        Skip to main content
      </a>

      <div className="site-nav__announcement" aria-label="Store announcement">
        <div className="site-nav__announcement-track">
          {announcementTrack.map((item, index) => (
            <span key={`${item}-${index}`} className="site-nav__announcement-item">
              <span>{item}</span>
              <span className="site-nav__announcement-separator">-</span>
            </span>
          ))}
        </div>
      </div>

      <header
        className={`site-nav${isSolidState ? " is-solid" : " is-hero"}${navState.hidden ? " is-hidden" : ""}`}
        style={{
          top: `${navState.navTop}px`,
          "--site-nav-text": navTextColor,
          "--site-nav-logo": navLogoColor,
          "--site-nav-badge-bg": badgeBackground,
          "--site-nav-badge-color": badgeColor,
        }}
      >
        <nav className="site-nav__inner" aria-label="Main navigation">
          <div className="site-nav__desktop-links">
            <Link
              href="/shop"
              className={`site-nav__link${isActiveLink(router.pathname, "/shop") ? " is-active" : ""}`}
              aria-label="Browse the SharonCraft shop"
              onMouseEnter={handleDesktopShopEnter}
              onMouseLeave={handleDesktopShopLeave}
            >
              SHOP
            </Link>
            {PRIMARY_LINKS.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav__link${isActiveLink(router.pathname, link.href) ? " is-active" : ""}`}
                aria-label={`Go to ${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className={`site-nav__mobile-toggle${menuOpen ? " is-open" : ""}`}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={handleMobileMenuToggle}
          >
            <span />
            <span />
            <span />
          </button>

          <Link href="/" className="site-nav__logo" aria-label="Go to the SharonCraft homepage">
            SHARONCRAFT
          </Link>

          <div className="site-nav__desktop-actions">
            <button
              ref={searchButtonRef}
              type="button"
              className="site-nav__icon-button"
              aria-label="Open search"
              onClick={handleSearchToggle}
            >
              <ShopSearchIcon className="site-nav__icon" />
            </button>
            <Link href="/wishlist" className="site-nav__icon-button" aria-label="Open wishlist">
              <HeartIcon className="site-nav__icon" />
              {wishlistCount > 0 ? (
                <span className="site-nav__badge">{wishlistCount}</span>
              ) : null}
            </Link>
            <button
              type="button"
              className="site-nav__icon-button"
              aria-label="Open cart"
              onClick={openCart}
            >
              <BagIcon className="site-nav__icon" />
              {count > 0 ? <span className="site-nav__badge">{count}</span> : null}
            </button>
            <Link
              href={DESKTOP_CTA.href}
              className={`site-nav__cta${customOrderActive ? " is-active" : ""}`}
              aria-label="Start a custom order"
            >
              {DESKTOP_CTA.label}
            </Link>
          </div>

          <button
            type="button"
            className="site-nav__mobile-cart"
            aria-label="Open cart"
            onClick={openCart}
          >
            <BagIcon className="site-nav__icon" />
            {count > 0 ? (
              <span
                className="site-nav__badge"
                style={{
                  background: mobileCartBadgeBackground,
                  color: mobileCartBadgeColor,
                }}
              >
                {count}
              </span>
            ) : null}
          </button>
        </nav>
      </header>

      <div
        ref={searchContainerRef}
        className={`site-nav__search${searchOpen ? " is-open" : ""}`}
        style={{ top: `${navState.navTop + navState.navHeight}px` }}
      >
        <form
          ref={searchTrayRef}
          className="site-nav__search-form"
          onSubmit={handleSearchSubmit}
        >
          <ShopSearchIcon className="site-nav__search-icon" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search pieces..."
            className="site-nav__search-input"
            aria-label="Search SharonCraft pieces"
          />
          <button
            type="button"
            className="site-nav__search-close"
            onClick={() => setSearchOpen(false)}
          >
            ESC
          </button>
        </form>
      </div>

      <div
        className={`site-nav__mega${megaOpen ? " is-open" : ""}`}
        style={{ top: `${navState.navTop + navState.navHeight}px` }}
        onMouseEnter={handleDesktopShopEnter}
        onMouseLeave={handleDesktopShopLeave}
      >
        <div className="site-nav__mega-inner">
          <div className="site-nav__mega-grid">
            {MEGA_COLUMNS.map((column) => (
              <div key={column.label} className="site-nav__mega-column">
                <span className="site-nav__mega-label">{column.label}</span>
                {column.items.map((item) => (
                  <Link key={item.href} href={item.href} className="site-nav__mega-link">
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className="site-nav__mega-footer">
            <Link href="/shop" className="site-nav__mega-all">
              View all pieces {'>'}
            </Link>
            <span className="site-nav__mega-count">
              {collectionCount ? `${collectionCount} pieces` : `${shopCategoryCount} collections`}
            </span>
          </div>
        </div>
      </div>

      <div className={`site-nav__mobile-backdrop${menuOpen ? " is-open" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside
        ref={menuPanelRef}
        className={`site-nav__mobile-panel${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="site-nav__mobile-panel-top">
          <span className="site-nav__mobile-panel-brand">SHARONCRAFT</span>
          <button
            ref={mobileCloseButtonRef}
            type="button"
            className="site-nav__mobile-close"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          >
            Ã—
          </button>
        </div>

        <div className="site-nav__mobile-panel-body">
          <button
            type="button"
            className="site-nav__mobile-link site-nav__mobile-link--shop"
            onClick={() => setShopMenuOpen((current) => !current)}
          >
            <span>SHOP</span>
            <ChevronDownIcon className={`site-nav__mobile-chevron${shopMenuOpen ? " is-open" : ""}`} />
          </button>
          <div className={`site-nav__mobile-submenu${shopMenuOpen ? " is-open" : ""}`}>
            {MOBILE_SHOP_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="site-nav__mobile-sublink"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {PRIMARY_LINKS.slice(1).map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="site-nav__mobile-link"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href={DESKTOP_CTA.href}
            onClick={() => setMenuOpen(false)}
            className="site-nav__mobile-link site-nav__mobile-link--cta"
            style={{ animationDelay: "0.2s" }}
          >
            CUSTOM ORDERS
          </Link>
        </div>

        <div className="site-nav__mobile-panel-bottom">
          <div className="site-nav__mobile-socials">
            <MobileSocialLink href={instagramUrl} label="Instagram" onClick={mobileSocialClick} />
            <MobileSocialLink href={tiktokUrl} label="TikTok" onClick={mobileSocialClick} />
            <MobileSocialLink
              href={`https://wa.me/${whatsappNumber}`}
              label="WhatsApp"
              onClick={mobileSocialClick}
            />
          </div>
        </div>
      </aside>

      <style jsx global>{`
        @keyframes siteNavMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes siteNavMenuItemIn {
          from {
            opacity: 0;
            transform: translateX(-16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .site-nav__skip-link {
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 2100;
          transform: translateY(-160%);
          border: 1px solid #8b5e3c;
          background: #fafaf8;
          color: #1c1c1c;
          padding: 10px 14px;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: transform 0.2s ease;
        }

        .site-nav__skip-link:focus {
          transform: translateY(0);
        }

        .site-nav__announcement {
          position: relative;
          z-index: 1001;
          display: flex;
          height: var(--announcement-height);
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #080808;
        }

        .site-nav__announcement-track {
          display: flex;
          min-width: max-content;
          white-space: nowrap;
          animation: siteNavMarquee 30s linear infinite;
        }

        .site-nav__announcement-item {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 0 10px;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }

        .site-nav__announcement-separator {
          color: #8b5e3c;
        }

        .site-nav {
          position: fixed;
          left: 0;
          right: 0;
          z-index: 1000;
          height: var(--nav-height);
          transform: translateY(0);
          transition:
            top 0.4s ease,
            transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
            background 0.4s ease,
            border-color 0.4s ease,
            backdrop-filter 0.4s ease,
            color 0.4s ease;
        }

        .site-nav.is-hidden {
          transform: translateY(-100%);
        }

        .site-nav.is-hero {
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.55) 0%,
            rgba(0, 0, 0, 0) 100%
          );
          border-bottom: none;
          box-shadow: none;
          color: rgba(255, 255, 255, 0.85);
        }

        .site-nav.is-solid {
          background: rgba(250, 250, 248, 0.96);
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          color: #888;
        }

        .site-nav__inner {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 100%;
          padding: 0 40px;
        }

        .site-nav__desktop-links,
        .site-nav__desktop-actions {
          display: none;
          align-items: center;
        }

        .site-nav__desktop-links {
          gap: 32px;
        }

        .site-nav__desktop-actions {
          justify-content: flex-end;
          gap: 20px;
        }

        .site-nav__link,
        .site-nav__logo,
        .site-nav__icon-button,
        .site-nav__mobile-cart {
          color: inherit;
        }

        .site-nav__link {
          display: inline-flex;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid transparent;
          color: var(--site-nav-text);
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .site-nav__link:hover,
        .site-nav__link.is-active {
          color: var(--site-nav-logo);
          border-bottom-color: currentColor;
        }

        .site-nav__logo {
          justify-self: center;
          color: var(--site-nav-logo);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 5px;
          text-transform: uppercase;
          text-align: center;
          transition: color 0.3s ease, opacity 0.2s ease;
        }

        .site-nav__logo:hover {
          opacity: 0.7;
        }

        .site-nav__icon-button,
        .site-nav__mobile-cart {
          position: relative;
          display: inline-flex;
          min-width: 28px;
          min-height: 28px;
          align-items: center;
          justify-content: center;
          color: var(--site-nav-text);
          transition: opacity 0.2s ease, color 0.2s ease;
        }

        .site-nav__icon-button:hover,
        .site-nav__mobile-cart:hover {
          color: var(--site-nav-logo);
          opacity: 0.7;
        }

        .site-nav__icon {
          width: 16px;
          height: 16px;
        }

        .site-nav__badge {
          position: absolute;
          top: -6px;
          right: -8px;
          display: inline-flex;
          width: 16px;
          height: 16px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: var(--site-nav-badge-bg);
          color: var(--site-nav-badge-color);
          font-size: 9px;
          font-weight: 500;
          line-height: 1;
          transition: background 0.3s ease, color 0.3s ease;
        }

        .site-nav__cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid currentColor;
          border-radius: 2px;
          color: var(--site-nav-text);
          font-size: 10px;
          letter-spacing: 2px;
          padding: 7px 14px;
          text-transform: uppercase;
          transition: all 0.25s ease;
        }

        .site-nav.is-solid .site-nav__cta:hover,
        .site-nav__cta.is-active {
          background: #1c1c1c;
          border-color: #1c1c1c;
          color: #ffffff;
        }

        .site-nav.is-hero .site-nav__cta:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .site-nav__search {
          position: fixed;
          left: 0;
          right: 0;
          z-index: 999;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
          background: rgba(250, 250, 248, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 16px 40px;
          pointer-events: none;
          transform: translateY(-100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .site-nav__search.is-open {
          pointer-events: auto;
          transform: translateY(0);
        }

        .site-nav__search-form {
          display: flex;
          max-width: 640px;
          margin: 0 auto;
          align-items: center;
          gap: 12px;
        }

        .site-nav__search-icon {
          width: 16px;
          height: 16px;
          color: #bbb;
        }

        .site-nav__search-input {
          flex: 1;
          border: none;
          background: transparent;
          color: #1c1c1c;
          font-size: 16px;
          font-weight: 300;
          outline: none;
        }

        .site-nav__search-input::placeholder {
          color: #bbb;
        }

        .site-nav__search-close {
          color: #bbb;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .site-nav__mega {
          position: fixed;
          left: 0;
          right: 0;
          z-index: 998;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-8px);
          transition:
            transform 0.25s ease,
            opacity 0.25s ease;
        }

        .site-nav__mega.is-open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }

        .site-nav__mega-inner {
          margin: 0 auto;
          max-width: 960px;
          border-top: 2px solid #8b5e3c;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
          background: #ffffff;
          padding: 28px 40px 24px;
        }

        .site-nav__mega-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }

        .site-nav__mega-column {
          padding-right: 24px;
        }

        .site-nav__mega-label {
          display: block;
          margin-bottom: 12px;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
          color: #ccc;
          font-size: 9px;
          letter-spacing: 3px;
          padding-bottom: 8px;
          text-transform: uppercase;
        }

        .site-nav__mega-link {
          display: block;
          border-left: 2px solid transparent;
          color: #666;
          font-size: 11px;
          padding: 5px 0;
          transition: all 0.15s ease;
        }

        .site-nav__mega-link:hover {
          border-left-color: #8b5e3c;
          color: #1c1c1c;
          padding-left: 8px;
        }

        .site-nav__mega-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          border-top: 0.5px solid rgba(0, 0, 0, 0.06);
          padding-top: 14px;
        }

        .site-nav__mega-all {
          border-bottom: 1px solid #1c1c1c;
          color: #1c1c1c;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .site-nav__mega-count {
          color: #ccc;
          font-size: 10px;
        }

        .site-nav__mobile-toggle,
        .site-nav__mobile-cart {
          display: inline-flex;
        }

        .site-nav__mobile-toggle {
          position: relative;
          width: 22px;
          height: 16px;
          align-items: center;
          justify-content: center;
        }

        .site-nav__mobile-toggle span {
          position: absolute;
          left: 0;
          width: 22px;
          height: 1.5px;
          background: var(--site-nav-logo);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .site-nav__mobile-toggle span:nth-child(1) {
          transform: translateY(-6.5px);
        }

        .site-nav__mobile-toggle span:nth-child(3) {
          transform: translateY(6.5px);
        }

        .site-nav__mobile-toggle.is-open span:nth-child(1) {
          transform: rotate(45deg);
        }

        .site-nav__mobile-toggle.is-open span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .site-nav__mobile-toggle.is-open span:nth-child(3) {
          transform: rotate(-45deg);
        }

        .site-nav__mobile-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1999;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .site-nav__mobile-backdrop.is-open {
          opacity: 1;
          pointer-events: auto;
        }

        .site-nav__mobile-panel {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 2000;
          display: flex;
          width: min(88vw, 420px);
          flex-direction: column;
          overflow-y: auto;
          background: #080808;
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .site-nav__mobile-panel.is-open {
          transform: translateX(0);
        }

        .site-nav__mobile-panel-top {
          display: flex;
          height: 52px;
          align-items: center;
          justify-content: space-between;
          border-bottom: 0.5px solid #1a1a1a;
          padding: 16px 24px;
        }

        .site-nav__mobile-panel-brand {
          color: rgba(255, 255, 255, 0.5);
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .site-nav__mobile-close {
          color: rgba(255, 255, 255, 0.3);
          font-size: 20px;
          line-height: 1;
        }

        .site-nav__mobile-panel-body {
          flex: 1;
          padding: 24px 0;
        }

        .site-nav__mobile-link {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          border-bottom: 0.5px solid #111;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          letter-spacing: 3px;
          padding: 14px 24px;
          text-transform: uppercase;
          animation: siteNavMenuItemIn 0.3s both;
        }

        .site-nav__mobile-link--cta {
          color: #8b5e3c;
        }

        .site-nav__mobile-submenu {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition:
            max-height 0.35s ease,
            opacity 0.35s ease;
        }

        .site-nav__mobile-submenu.is-open {
          max-height: 400px;
          opacity: 1;
        }

        .site-nav__mobile-sublink {
          display: block;
          border-bottom: 0.5px solid #111;
          color: rgba(255, 255, 255, 0.3);
          font-size: 11px;
          letter-spacing: 2px;
          padding: 10px 24px 10px 40px;
          text-transform: uppercase;
        }

        .site-nav__mobile-chevron {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .site-nav__mobile-chevron.is-open {
          transform: rotate(180deg);
        }

        .site-nav__mobile-panel-bottom {
          border-top: 0.5px solid #1a1a1a;
          padding: 20px 24px;
        }

        .site-nav__mobile-socials {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .site-nav__mobile-social-link {
          color: rgba(255, 255, 255, 0.2);
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        @media (min-width: 768px) {
          .site-nav__desktop-links,
          .site-nav__desktop-actions {
            display: flex;
          }

          .site-nav__mobile-toggle,
          .site-nav__mobile-cart,
          .site-nav__mobile-panel,
          .site-nav__mobile-backdrop {
            display: none;
          }
        }

        @media (max-width: 767px) {
          .site-nav__inner {
            grid-template-columns: auto 1fr auto;
            gap: 0;
            padding: 0 20px;
          }

          .site-nav__logo {
            font-size: 12px;
            letter-spacing: 4px;
          }

          .site-nav__search,
          .site-nav__mega {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .site-nav,
          .site-nav__announcement-track,
          .site-nav__mobile-backdrop,
          .site-nav__mobile-panel,
          .site-nav__search,
          .site-nav__mega,
          .site-nav__mobile-toggle span {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}


