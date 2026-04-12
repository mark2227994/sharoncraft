import Link from "next/link";
import { SITE_NAME } from "../lib/constants";

const footerGroups = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/shop" },
      { label: "Gift Sets", href: "/shop?category=Textiles" },
      { label: "Jewellery", href: "/shop?category=Jewellery" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about-gallery" },
      { label: "Artisans", href: "/#artisan-story" },
      { label: "Checkout", href: "/checkout" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "hello@sharoncraft.co.ke", href: "mailto:hello@sharoncraft.co.ke" },
      { label: "+254 112 222 572", href: "tel:+254112222572" },
      { label: "Nairobi, Kenya", href: "/checkout" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div className="footer__brand">
            <p className="footer__logo">
              Sharon<span style={{ color: "var(--color-terracotta)" }}>•</span>Craft
            </p>
            <p className="body-sm">
              A warm edit of Kenyan artisan work, chosen for story, craft, and a sense of place.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="footer__title">{group.title}</p>
              <div className="footer__links">
                {group.links.map((link) => (
                  <Link key={link.label} href={link.href} className="footer__link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span>Built in Nairobi 🇰🇪</span>
        </div>
      </div>
    </footer>
  );
}
