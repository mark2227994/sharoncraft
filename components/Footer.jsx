import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE_NAME } from "../lib/constants";

const fallbackSiteContent = {
  contactEmail: "sharoncraft@gmail.com",
  contactWhatsApp: "0112222572",
  businessHours: "Mon-Sat, 9am-6pm EAT",
  aboutStory: "A warm edit of Kenyan artisan work, chosen for story, craft, and a sense of place.",
  mission: "Connecting global patrons with authentic Kenyan artisanship, celebrating tradition through contemporary design.",
};

function formatPhoneForDisplay(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "+254 112 222 572";
  if (digits.startsWith("254")) return `+${digits}`;
  if (digits.startsWith("0")) return `+254 ${digits.slice(1)}`;
  return `+${digits}`;
}

function formatPhoneHref(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "tel:+254112222572";
  if (digits.startsWith("254")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+254${digits.slice(1)}`;
  return `tel:+${digits}`;
}

export default function Footer({ siteContent }) {
  const [content, setContent] = useState({ ...fallbackSiteContent, ...(siteContent || {}) });
  const [email, setEmail] = useState("");
  const [subscriptionMessage, setSubscriptionMessage] = useState("");

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

    return () => {
      cancelled = true;
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
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Column 1: Brand & About */}
          <div className="footer__column footer__brand-col">
            <p className="footer__logo">
              Sharon<span style={{ color: "var(--color-terracotta)" }}>*</span>Craft
            </p>
            <p className="body-sm">{content.aboutStory || fallbackSiteContent.aboutStory}</p>
            
            {/* Social Media Icons */}
            <div className="footer__socials">
              <a href="https://instagram.com/sharoncraft" className="footer__social" title="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://facebook.com/sharoncraft" className="footer__social" title="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href={`https://wa.me/254${(content.contactWhatsApp || fallbackSiteContent.contactWhatsApp).replace(/\D/g, "").replace(/^0/, "")}`} className="footer__social" title="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.686 11.183c0-.29-.184-.538-.46-.623-.278-.085-.576-.085-.854 0l-2.508 1.16a.632.632 0 0 1-.528 0l-1.78-1.078c-.278-.085-.576-.085-.854 0-.276.085-.46.333-.46.623v8.38c0 .29.184.538.46.623.278.085.576.085.854 0l2.508-1.16a.632.632 0 0 1 .528 0l1.78 1.078c.278.085.576.085.854 0 .276-.085.46-.333.46-.623v-8.38zM3 2h18a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Shop & Browse */}
          <div className="footer__column">
            <p className="footer__title">Shop</p>
            <div className="footer__links">
              <Link href="/shop" className="footer__link">Shop All Products</Link>
              <Link href="/shop?category=Jewellery" className="footer__link">Jewellery</Link>
              <Link href="/shop?category=Home%20Decor" className="footer__link">Home Decor</Link>
              <Link href="/shop?category=Gift%20Sets" className="footer__link">Gift Sets</Link>
              <Link href="/custom-order" className="footer__link">Custom Design</Link>
            </div>
          </div>

          {/* Column 3: Support */}
          <div className="footer__column">
            <p className="footer__title">Support</p>
            <div className="footer__links">
              <Link href="/about" className="footer__link">About Us</Link>
              <Link href="/#artisan-story" className="footer__link">Meet Our Artisans</Link>
              <Link href="/faq" className="footer__link">FAQ</Link>
              <Link href="/about" className="footer__link">Shipping & Returns</Link>
              <a href={formatPhoneHref(content.contactWhatsApp)} className="footer__link">Contact Support</a>
            </div>
          </div>

          {/* Column 4: Newsletter Signup */}
          <div className="footer__column">
            <p className="footer__title">Stay Updated</p>
            <p className="footer__subtitle">Join our newsletter for exclusive offers & new arrivals</p>
            <form className="footer__newsletter" onSubmit={handleNewsletterSubscribe}>
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="footer__input"
                required
              />
              <button type="submit" className="footer__btn">Subscribe</button>
            </form>
            {subscriptionMessage && <p className="footer__message">{subscriptionMessage}</p>}
            
            <p className="footer__title" style={{ marginTop: "var(--space-5)" }}>We Accept</p>
            <div className="footer__payments">
              <div className="footer__payment-badge">M-Pesa</div>
              <div className="footer__payment-badge">Bank Transfer</div>
              <div className="footer__payment-badge">Cash on Delivery</div>
            </div>
          </div>
        </div>

        <div className="footer__divider"></div>

        <div className="footer__bottom">
          <div className="footer__bottom-text">
            <span>(c) {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
            <span className="footer__sep">•</span>
            <span>Made in Nairobi, Kenya</span>
          </div>
          <div className="footer__policies">
            <Link href="/about" className="footer__policy-link">Privacy Policy</Link>
            <span className="footer__sep">•</span>
            <Link href="/about" className="footer__policy-link">Terms of Service</Link>
            <span className="footer__sep">•</span>
            <Link href="/about" className="footer__policy-link">Returns</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #1a1a1a;
          color: #f9f6ee;
          padding: var(--space-7) var(--gutter) var(--space-5);
          margin-top: var(--space-8);
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
          max-width: 320px;
        }

        .footer__logo {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: var(--space-2);
          letter-spacing: -0.02em;
        }

        .footer__brand-col .body-sm {
          color: rgba(249, 246, 238, 0.85);
          line-height: 1.6;
          margin-bottom: var(--space-4);
        }

        .footer__socials {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-4);
        }

        .footer__social {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(249, 246, 238, 0.08);
          border-radius: 50%;
          color: var(--color-cream);
          transition: all var(--transition-fast);
          border: 1px solid rgba(249, 246, 238, 0.15);
        }

        .footer__social:hover {
          background: var(--color-accent);
          color: var(--color-ink);
          transform: translateY(-2px);
          border-color: var(--color-accent);
        }

        .footer__title {
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: var(--space-3);
          color: rgba(249, 246, 238, 0.95);
          display: flex;
          align-items: center;
        }

        .footer__subtitle {
          font-size: 0.875rem;
          color: rgba(249, 246, 238, 0.8);
          margin-bottom: var(--space-3);
          line-height: 1.5;
        }

        .footer__links {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .footer__link {
          color: rgba(249, 246, 238, 0.85);
          font-size: 0.9375rem;
          transition: color var(--transition-fast);
          text-decoration: none;
          overflow-wrap: break-word;
        }

        .footer__link:hover {
          color: var(--color-accent);
        }

        .footer__newsletter {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }

        .footer__input {
          flex: 1;
          padding: 0.75rem var(--space-2);
          background: rgba(249, 246, 238, 0.08);
          border: 1px solid rgba(249, 246, 238, 0.2);
          border-radius: 4px;
          color: var(--color-cream);
          font-size: 0.9375rem;
          transition: all var(--transition-fast);
          font-family: inherit;
        }

        .footer__input::placeholder {
          color: rgba(249, 246, 238, 0.5);
        }

        .footer__input:focus {
          outline: none;
          border-color: var(--color-accent);
          background: rgba(249, 246, 238, 0.12);
        }

        .footer__btn {
          padding: 0.75rem var(--space-3);
          background: var(--color-accent);
          color: var(--color-ink);
          border: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .footer__btn:hover {
          background: var(--color-terracotta);
          transform: translateY(-1px);
        }

        .footer__message {
          font-size: 0.8125rem;
          color: rgba(249, 246, 238, 0.8);
          margin-top: var(--space-2);
        }

        .footer__payments {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .footer__payment-badge {
          display: inline-block;
          padding: 0.5rem var(--space-2);
          background: rgba(249, 246, 238, 0.08);
          border: 1px solid rgba(249, 246, 238, 0.2);
          border-radius: 4px;
          font-size: 0.8125rem;
          color: rgba(249, 246, 238, 0.9);
        }

        .footer__divider {
          height: 1px;
          background: rgba(249, 246, 238, 0.1);
          margin: var(--space-5) 0;
        }

        .footer__bottom {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          font-size: 0.8125rem;
          color: rgba(249, 246, 238, 0.75);
        }

        .footer__bottom-text,
        .footer__policies {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-2);
        }

        .footer__sep {
          opacity: 0.5;
        }

        .footer__policy-link {
          color: rgba(249, 246, 238, 0.85);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer__policy-link:hover {
          color: var(--color-accent);
          text-decoration: underline;
        }

        /* Tablet & Desktop Layout */
        @media (min-width: 768px) {
          .footer__grid {
            grid-template-columns: 1.2fr 1fr 1fr 1.3fr;
            gap: var(--space-7);
          }

          .footer__bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        /* Mobile Responsive */
        @media (max-width: 567px) {
          .footer {
            padding: var(--space-6) var(--gutter) var(--space-5);
          }

          .footer__grid {
            gap: var(--space-5);
          }

          .footer__title {
            font-size: 0.75rem;
          }

          .footer__link {
            font-size: 0.875rem;
          }

          .footer__newsletter {
            flex-direction: column;
          }

          .footer__btn {
            width: 100%;
          }

          .footer__bottom {
            gap: var(--space-4);
            font-size: 0.75rem;
          }

          .footer__socials {
            gap: var(--space-2);
          }

          .footer__social {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </footer>
  );
}
