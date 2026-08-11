import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE_NAME } from "../lib/constants";
import { buildWhatsAppUrl, CONTACT_EMAIL, CONTACT_WHATSAPP } from "../lib/contact";

const fallbackSiteContent = {
  contactEmail: CONTACT_EMAIL,
  contactWhatsApp: CONTACT_WHATSAPP,
  businessHours: "Mon-Sat, 9am-6pm EAT",
  aboutStory: "A warm edit of Kenyan artisan work, chosen for story, craft, and a sense of place.",
  mission: "Connecting global patrons with authentic Kenyan artisanship, celebrating tradition through contemporary design.",
};

export default function Footer({ siteContent }) {
  const [content, setContent] = useState({ ...fallbackSiteContent, ...(siteContent || {}) });
  const [email, setEmail] = useState("");
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/site-images");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data && typeof data === "object") {
          setContent((current) => ({ ...current, ...data }));
        }
      } catch {
        // Keep fallback content when public site settings cannot be fetched.
      }
    })();

    // Scroll reveal observer
    const footerEl = document.getElementById("site-footer");
    let observer;
    if (footerEl && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (observer) observer.disconnect();
          }
        },
        { threshold: 0.02, rootMargin: "0px 0px -20px 0px" }
      );
      observer.observe(footerEl);
    } else {
      setIsVisible(true);
    }

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
    };
  }, []);

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      const response = await fetch("/api/newsletter-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setSubscriptionMessage("✓ Thank you for subscribing!");
        setEmail("");
        setTimeout(() => setSubscriptionMessage(""), 3000);
      } else {
        setSubscriptionMessage("Please try again");
        setTimeout(() => setSubscriptionMessage(""), 3000);
      }
    } catch {
      setSubscriptionMessage("Connection error");
      setTimeout(() => setSubscriptionMessage(""), 3000);
    }
  };

  return (
    <footer id="site-footer" className={`footer ${isVisible ? "footer--visible" : ""}`}>
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Column 1: Brand & Identity */}
          <div className="footer__column footer__brand-col footer__animate">
            <p className="footer__logo">
              Sharon<span style={{ color: "var(--color-terracotta)" }}>*</span>Craft
            </p>
            <p className="body-sm footer__tagline">
              Kenyan artisan work, celebrating tradition through contemporary design.
            </p>
            
            {/* Social Media Icons */}
            <div className="footer__socials">
              <a href="https://instagram.com/sharoncraft" className="footer__social" title="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://facebook.com/sharoncraft" className="footer__social" title="Facebook" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={buildWhatsAppUrl(content.contactWhatsApp || fallbackSiteContent.contactWhatsApp)}
                className="footer__social"
                title="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.686 11.183c0-.29-.184-.538-.46-.623-.278-.085-.576-.085-.854 0l-2.508 1.16a.632.632 0 0 1-.528 0l-1.78-1.078c-.278-.085-.576-.085-.854 0-.276.085-.46.333-.46.623v8.38c0 .29.184.538.46.623.278.085.576.085.854 0l2.508-1.16a.632.632 0 0 1 .528 0l1.78 1.078c.278.085.576.085.854 0 .276-.085.46-.333.46-.623v-8.38zM3 2h18a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer__column footer__links-col footer__animate">
            <p className="footer__title">Quick Links</p>
            <div className="footer__links-grid">
              <div className="footer__links-group">
                <p className="footer__group-title">Shop</p>
                <Link href="/shop" className="footer__link">Shop All</Link>
                <Link href="/custom-order" className="footer__link">Custom Design</Link>
                <Link href="/track-order" className="footer__link">Track Order</Link>
              </div>
              <div className="footer__links-group">
                <p className="footer__group-title">Care & Story</p>
                <Link href="/about" className="footer__link">About Us</Link>
                <Link href="/faq" className="footer__link">FAQ</Link>
                <Link href="/shipping" className="footer__link">Shipping</Link>
                <Link href="/contact" className="footer__link">Contact</Link>
              </div>
            </div>
          </div>

          {/* Column 3: Newsletter */}
          <div className="footer__column footer__news-col footer__animate">
            <p className="footer__title">Newsletter</p>
            <p className="footer__subtitle">Join for exclusive arrivals & artisan stories.</p>
            <form className="footer__newsletter" onSubmit={handleNewsletterSubscribe}>
              <div className="footer__input-wrapper">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="footer__input"
                  required
                />
                <span className="footer__input-line"></span>
              </div>
              <button type="submit" className="footer__btn">Subscribe</button>
            </form>
            {subscriptionMessage && <p className="footer__message">{subscriptionMessage}</p>}
            
            <div className="footer__payments">
              <span className="footer__payments-title">We Accept</span>
              <p className="footer__payments-list">M-Pesa · Card · EFT · Cash on Delivery</p>
            </div>
          </div>
        </div>

        <div className="footer__divider footer__animate"></div>

        <div className="footer__bottom footer__animate">
          <div className="footer__bottom-text">
            <span>&copy; {new Date().getFullYear()} {SITE_NAME}.</span>
            <span className="footer__sep">•</span>
            <span>Made in Nairobi, Kenya</span>
          </div>
          <div className="footer__policies">
            <Link href="/privacy" className="footer__policy-link">Privacy</Link>
            <span className="footer__sep">•</span>
            <Link href="/terms" className="footer__policy-link">Terms</Link>
            <span className="footer__sep">•</span>
            <Link href="/shipping" className="footer__policy-link">Returns</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #0b0b0b;
          color: #f9f6ee;
          padding: var(--space-7) var(--gutter) var(--space-5);
          margin-top: var(--space-8);
          border-top: 1px solid rgba(249, 246, 238, 0.05);
        }

        .footer__inner {
          max-width: var(--max-width);
          margin: 0 auto;
        }

        .footer__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }

        .footer__column {
          min-width: 0;
        }

        .footer__brand-col {
          max-width: 300px;
        }

        .footer__logo {
          font-family: var(--font-display);
          font-size: 1.625rem;
          font-weight: 600;
          margin-bottom: var(--space-2);
          letter-spacing: -0.02em;
        }

        .footer__tagline {
          color: rgba(249, 246, 238, 0.65);
          line-height: 1.5;
          margin-bottom: var(--space-4);
          font-size: 0.875rem;
        }

        .footer__socials {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-3);
        }

        .footer__social {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(249, 246, 238, 0.04);
          border-radius: 50%;
          color: rgba(249, 246, 238, 0.65);
          transition: all var(--transition-fast) cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(249, 246, 238, 0.08);
        }

        .footer__social:hover {
          background: var(--color-accent);
          color: var(--color-ink);
          transform: translateY(-2px);
          border-color: var(--color-accent);
        }

        .footer__title {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: var(--space-3);
          color: rgba(249, 246, 238, 0.45);
        }

        .footer__links-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .footer__links-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .footer__group-title {
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(249, 246, 238, 0.3);
          margin-bottom: 4px;
        }

        .footer__link {
          color: rgba(249, 246, 238, 0.75);
          font-size: 0.875rem;
          transition: color var(--transition-fast);
          text-decoration: none;
          display: inline-block;
          align-self: flex-start;
          position: relative;
          padding-bottom: 2px;
        }

        .footer__link::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--color-accent);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .footer__link:hover {
          color: var(--color-cream);
        }

        .footer__link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .footer__news-col {
          max-width: 320px;
        }

        .footer__subtitle {
          font-size: 0.875rem;
          color: rgba(249, 246, 238, 0.65);
          margin-bottom: var(--space-3);
          line-height: 1.5;
        }

        .footer__newsletter {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .footer__input-wrapper {
          position: relative;
          width: 100%;
        }

        .footer__input {
          width: 100%;
          padding: 10px 0;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(249, 246, 238, 0.15);
          color: var(--color-cream);
          font-size: 0.9375rem;
          transition: border-color var(--transition-fast);
          border-radius: 0;
          font-family: inherit;
        }

        .footer__input::placeholder {
          color: rgba(249, 246, 238, 0.35);
        }

        .footer__input:focus {
          outline: none;
        }

        .footer__input-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1.5px;
          background: var(--color-accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .footer__input:focus ~ .footer__input-line {
          transform: scaleX(1);
        }

        .footer__btn {
          padding: 10px var(--space-3);
          background: transparent;
          color: var(--color-cream);
          border: 1px solid rgba(249, 246, 238, 0.2);
          border-radius: 4px;
          font-weight: 500;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all var(--transition-fast) cubic-bezier(0.16, 1, 0.3, 1);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .footer__btn:hover {
          background: var(--color-cream);
          color: #0b0b0b;
          border-color: var(--color-cream);
        }

        .footer__message {
          font-size: 0.8125rem;
          color: rgba(249, 246, 238, 0.85);
          margin-top: var(--space-2);
        }

        .footer__payments {
          margin-top: var(--space-4);
          border-top: 1px solid rgba(249, 246, 238, 0.05);
          padding-top: var(--space-3);
        }

        .footer__payments-title {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(249, 246, 238, 0.3);
          display: block;
          margin-bottom: 4px;
        }

        .footer__payments-list {
          font-size: 0.75rem;
          color: rgba(249, 246, 238, 0.5);
          margin: 0;
          letter-spacing: 0.02em;
        }

        .footer__divider {
          height: 1px;
          background: rgba(249, 246, 238, 0.06);
          margin: var(--space-5) 0 var(--space-4);
        }

        .footer__bottom {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          font-size: 0.75rem;
          color: rgba(249, 246, 238, 0.45);
        }

        .footer__bottom-text,
        .footer__policies {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-2);
        }

        .footer__sep {
          opacity: 0.3;
        }

        .footer__policy-link {
          color: rgba(249, 246, 238, 0.55);
          text-decoration: none;
          transition: color var(--transition-fast);
          position: relative;
          padding-bottom: 1px;
        }

        .footer__policy-link::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: rgba(249, 246, 238, 0.35);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .footer__policy-link:hover {
          color: var(--color-cream);
        }

        .footer__policy-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* Scroll Reveal Animation Styles */
        .footer__animate {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .footer--visible .footer__animate {
          opacity: 1;
          transform: translateY(0);
        }

        .footer--visible .footer__column:nth-child(1) {
          transition-delay: 0.05s;
        }

        .footer--visible .footer__column:nth-child(2) {
          transition-delay: 0.15s;
        }

        .footer--visible .footer__column:nth-child(3) {
          transition-delay: 0.25s;
        }

        .footer--visible .footer__divider {
          transition-delay: 0.35s;
          opacity: 1;
          transform: none;
        }

        .footer--visible .footer__bottom {
          transition-delay: 0.4s;
          opacity: 1;
          transform: none;
        }

        /* Tablet & Desktop Layout */
        @media (min-width: 768px) {
          .footer__grid {
            grid-template-columns: 1.2fr 1.5fr 1.3fr;
            gap: var(--space-7);
          }

          .footer__bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        /* Mobile Responsive */
        @media (max-width: 767px) {
          .footer {
            padding: var(--space-6) var(--gutter) var(--space-5);
          }

          .footer__grid {
            gap: var(--space-5);
          }

          .footer__brand-col,
          .footer__news-col {
            max-width: 100%;
          }

          .footer__logo {
            font-size: 1.5rem;
          }

          .footer__tagline {
            font-size: 0.8125rem;
          }

          .footer__bottom {
            gap: var(--space-3);
          }
        }
      `}</style>
    </footer>
  );
}
