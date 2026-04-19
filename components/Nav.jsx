import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../lib/cart-context";
import { mobileNavLinks, primaryNavLinks } from "../data/site";
import Icon from "./icons";

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [navItems, setNavItems] = useState(primaryNavLinks);
  const [mobileItems, setMobileItems] = useState(mobileNavLinks);
  const { count, wishlistCount, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    checkSession();
    fetchNavigation();
  }, []);

  async function fetchNavigation() {
    try {
      const res = await fetch("/api/admin/navigation");
      const data = await res.json();
      if (data.header && Array.isArray(data.header)) {
        setNavItems(data.header.map(h => ({ href: h.url, label: h.label })));
        setMobileItems(data.header.map(h => ({ href: h.url, label: h.label })));
      }
    } catch (e) {
      // Keep default nav items
    }
  }

  async function checkSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      setUser(null);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="nav__announcement">
        <p><Icon name="star" size={16} /> New collection: Limited edition Maasai-inspired pieces now available!</p>
      </div>

      <header className={`nav ${isScrolled ? "nav--scrolled" : ""}`}>
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

        {/* Search Bar */}
        <form className="nav__search-form" onSubmit={handleSearch} style={{ display: searchActive ? "flex" : "none" }}>
          <input
            type="text"
            placeholder="Search products..."
            className="nav__search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="nav__search-btn" aria-label="Search">
            <Icon name="search" size={18} />
          </button>
        </form>

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

        <div className="nav__actions">
          <Link href={user ? "/account" : "/login"} className="nav__icon-btn" aria-label={user ? "My account" : "Login"}>
            <Icon name="user" size={18} />
          </Link>
          <Link href="/wishlist" className="nav__icon-btn" aria-label="View wishlist">
            <Icon name="heart" size={18} />
            {wishlistCount > 0 ? <span className="cart-badge">{wishlistCount}</span> : null}
          </Link>
          <button type="button" className="nav__icon-btn" aria-label="View cart" onClick={openCart}>
            <Icon name="cart" size={18} />
            {count > 0 ? <span className="cart-badge">{count}</span> : null}
          </button>
          <button
            type="button"
            className="nav__icon-btn"
            onClick={() => setSearchActive(!searchActive)}
            aria-label="Search products"
          >
            <Icon name="search" size={18} />
          </button>
          <button
            type="button"
            className="nav__icon-btn nav__hamburger"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      </header>

      {isOpen ? (
        <div className="side-drawer" role="dialog" aria-modal="true" aria-label="Site navigation">
          <div className="side-drawer__panel">
            <button
              type="button"
              className="nav__icon-btn"
              style={{ color: "var(--color-cream)", alignSelf: "flex-end" }}
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
            >
              <Icon name="close" size={20} />
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
