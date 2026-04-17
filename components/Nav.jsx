import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../lib/cart-context";
import { mobileNavLinks, primaryNavLinks } from "../data/site";
import Icon from "./icons";

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { count, wishlistCount, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      setUser(null);
    }
  }

  return (
    <>
      <header className={`nav ${isScrolled ? "nav--scrolled" : ""}`}>
        <Link href="/" className="nav__logo" aria-label="SharonCraft home">
          <img
            src="/media/site/Gemini_Generated_Image_bxwnt0bxwnt0bxwn.png"
            alt="SharonCraft"
            className="nav__logo-image"
            loading="eager"
            decoding="async"
          />
        </Link>

        <nav aria-label="Primary">
          <ul className="nav__links">
            {primaryNavLinks.map((link) => (
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
          <Link href="/shop" className="nav__icon-btn nav__search" aria-label="Search the shop">
            <Icon name="search" size={18} />
          </Link>
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
                {mobileNavLinks.map((link) => (
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
