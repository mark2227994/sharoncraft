import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../lib/cart-context";
import { mobileNavLinks, mobileUtilityNavLinks, primaryNavLinks } from "../data/site";
import Icon from "./icons";

function buildMobileNavItems(items) {
  return [...items, ...mobileUtilityNavLinks];
}

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [navItems, setNavItems] = useState(primaryNavLinks);
  const [mobileItems, setMobileItems] = useState(mobileNavLinks);
  const searchInputRef = useRef(null);
  const { count, wishlistCount, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    checkSession();
    fetchNavigation();
  }, []);

  useEffect(() => {
    if (searchActive) {
      searchInputRef.current?.focus();
    }
  }, [searchActive]);

  useEffect(() => {
    if (!searchActive) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSearchActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchActive]);

  async function fetchNavigation() {
    try {
      const response = await fetch("/api/admin/navigation");
      const data = await response.json();

      if (data.header && Array.isArray(data.header)) {
        const headerItems = data.header.map((item) => ({ href: item.url, label: item.label }));
        setNavItems(headerItems);
        setMobileItems(buildMobileNavItems(headerItems));
      }
    } catch (error) {
      // Keep default nav items.
    }
  }

  async function checkSession() {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      setUser(null);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  }

  return (
    <>
      <div className="nav__announcement">
        <p>Handmade in Kenya | Limited edition Maasai-inspired pieces now available</p>
      </div>

      <header className={`nav ${isScrolled ? "nav--scrolled" : ""} ${searchActive ? "nav--search-open" : ""}`}>
        <nav aria-label="Primary" className="nav__desktop-nav">
          <ul className="nav__links">
            {navItems.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="nav__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link href="/" className="nav__logo-lockup" aria-label="SharonCraft home">
          <img
            src="/apple-touch-icon.png"
            alt="SharonCraft Logo"
            className="nav__logo-mark"
            loading="eager"
            decoding="async"
          />
          <span className="nav__brand-name">SharonCraft</span>
        </Link>

        <div className="nav__actions">
          <button
            type="button"
            className={`nav__icon-btn nav__search-toggle ${searchActive ? "nav__icon-btn--active" : ""}`}
            aria-label={searchActive ? "Close search" : "Open search"}
            aria-expanded={searchActive}
            onClick={() => setSearchActive((current) => !current)}
          >
            <Icon name={searchActive ? "close" : "search"} size={17} />
          </button>

          <Link
            href={user ? "/account" : "/login"}
            className="nav__icon-btn nav__utility-btn"
            aria-label={user ? "My account" : "Login"}
          >
            <Icon name="user" size={17} />
          </Link>

          <Link href="/wishlist" className="nav__icon-btn nav__utility-btn" aria-label="View wishlist">
            <Icon name="heart" size={17} />
            {wishlistCount > 0 ? <span className="nav__badge">{wishlistCount}</span> : null}
          </Link>

          <button
            type="button"
            className="nav__icon-btn nav__utility-btn nav__cart-btn"
            aria-label="View cart"
            onClick={openCart}
          >
            <Icon name="shopping-bag" size={17} />
            {count > 0 ? <span className="nav__badge">{count}</span> : null}
          </button>

          <button
            type="button"
            className="nav__icon-btn nav__hamburger"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
          >
            <Icon name="menu" size={19} />
          </button>
        </div>

        <form className={`nav__search-panel ${searchActive ? "nav__search-panel--active" : ""}`} onSubmit={handleSearch}>
          <div className="nav__search-shell">
            <Icon name="search" size={16} className="nav__search-shell-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products"
              className="nav__search-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button type="submit" className="nav__search-submit">
              Search
            </button>
          </div>
        </form>
      </header>

      {isOpen ? (
        <div className="side-drawer" role="dialog" aria-modal="true" aria-label="Site navigation">
          <div className="side-drawer__panel">
            <button
              type="button"
              className="nav__icon-btn side-drawer__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
            >
              <Icon name="close" size={18} />
            </button>
            <nav>
              <ul className="side-drawer__nav-links">
                {mobileItems.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="side-drawer__nav-link" onClick={() => setIsOpen(false)}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <button
            type="button"
            className="side-drawer__overlay"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
          />
        </div>
      ) : null}
    </>
  );
}
