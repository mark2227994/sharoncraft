import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE_NAME } from "../lib/constants";

const fallbackSiteContent = {
  contactEmail: "hello@sharoncraft.co.ke",
  contactWhatsApp: "0112222572",
  businessHours: "Mon-Sat, 9am-6pm EAT",
  aboutStory: "A warm edit of Kenyan artisan work, chosen for story, craft, and a sense of place.",
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

  const footerGroups = [
    {
      title: "Shop",
      links: [
        { label: "Shop All", href: "/shop" },
        { label: "Gift Sets", href: "/shop?category=Gift%20Sets" },
        { label: "Jewellery", href: "/shop?category=Jewellery" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Artisans", href: "/#artisan-story" },
        { label: "Custom Design", href: "/custom-order" },
        { label: "Checkout", href: "/checkout" },
      ],
    },
    {
      title: "Contact",
      links: [
        {
          label: content.contactEmail || fallbackSiteContent.contactEmail,
          href: `mailto:${content.contactEmail || fallbackSiteContent.contactEmail}`,
        },
        {
          label: formatPhoneForDisplay(content.contactWhatsApp),
          href: formatPhoneHref(content.contactWhatsApp),
        },
        {
          label: content.businessHours || fallbackSiteContent.businessHours,
          href: "/about",
        },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div className="footer__brand">
            <p className="footer__logo">
              Sharon<span style={{ color: "var(--color-terracotta)" }}>*</span>Craft
            </p>
            <p className="body-sm">{content.aboutStory || fallbackSiteContent.aboutStory}</p>
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
          <span>(c) {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span>Built in Nairobi KE</span>
        </div>
      </div>
    </footer>
  );
}
