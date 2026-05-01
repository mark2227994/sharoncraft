import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const MIDDLE_DOT = "\u00B7";
const COPYRIGHT_SYMBOL = "\u00A9";

const FALLBACK_SITE_CONTENT = {
  contactEmail: "hello@sharoncraft.co.ke",
  contactWhatsApp: "0112222572",
  aboutStory:
    "Handmade jewelry and lifestyle pieces crafted by Kenyan artisans in Nairobi. Every piece tells a story.",
};

const FALLBACK_FOOTER_CONTENT = {
  column1: {
    socialLinks: [
      { platform: "Instagram", url: "https://instagram.com/sharoncraft" },
      { platform: "TikTok", url: "https://tiktok.com/@sharoncraft" },
      { platform: "WhatsApp", url: "" },
      { platform: "Facebook", url: "https://facebook.com/sharoncraft" },
    ],
  },
  bottom: {
    paymentMethods: ["M-Pesa", "Bank Transfer", "Cash on Delivery", "Visa", "Mastercard"],
  },
};

function compact(value) {
  return String(value || "").trim();
}

function formatPhoneForWhatsApp(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "254112222572";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

function useInViewOnce(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible || typeof window === "undefined") return undefined;

    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? "0px 0px -5% 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold, visible]);

  return [ref, visible];
}

function IconWhatsApp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M20 11.3c0 4.9-3.9 8.7-8.8 8.7-1.6 0-3.1-.4-4.4-1.1L3 20l1.2-3.6A8.5 8.5 0 013 11.3C3 6.5 6.9 2.7 11.8 2.7 16.1 2.7 20 6.4 20 11.3z" />
      <path d="M8.7 8.3c.2-.4.4-.4.7-.4h.6c.2 0 .5 0 .7.5.2.4.7 1.7.8 1.8.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.4.4c-.2.2-.3.3-.1.6.2.4.9 1.5 2 2.4 1.4 1.2 2.5 1.5 2.9 1.7.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 1.8.8 2.1 1 .3.1.5.2.5.4 0 .2 0 1-.4 1.8-.4.8-2.1 1.7-2.9 1.7-.8 0-1.5.1-5-1.4-4-1.8-6.5-6.2-6.7-6.5-.2-.3-1.6-2.1-1.6-4s1-2.8 1.3-3.1z" />
    </svg>
  );
}

export default function Footer({ siteContent: initialSiteContent }) {
  const [ref, visible] = useInViewOnce();
  const [siteContent, setSiteContent] = useState({
    ...FALLBACK_SITE_CONTENT,
    ...(initialSiteContent || {}),
  });
  const [footerContent, setFooterContent] = useState(FALLBACK_FOOTER_CONTENT);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [siteResponse, footerResponse] = await Promise.all([
          fetch("/api/site-images"),
          fetch("/api/admin/footer-content"),
        ]);

        if (siteResponse.ok) {
          const siteData = await siteResponse.json();
          if (!cancelled && siteData && typeof siteData === "object") {
            setSiteContent((current) => ({ ...current, ...siteData }));
          }
        }

        if (footerResponse.ok) {
          const footerData = await footerResponse.json();
          if (!cancelled && footerData && typeof footerData === "object") {
            setFooterContent((current) => ({ ...current, ...footerData }));
          }
        }
      } catch {
        // Keep graceful fallbacks if public footer data cannot be fetched.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const whatsappNumber = useMemo(
    () => formatPhoneForWhatsApp(siteContent.contactWhatsApp),
    [siteContent.contactWhatsApp],
  );
  const socialLinks = Array.isArray(footerContent?.column1?.socialLinks)
    ? footerContent.column1.socialLinks
    : FALLBACK_FOOTER_CONTENT.column1.socialLinks;
  const contactEmail = compact(siteContent.contactEmail) || FALLBACK_SITE_CONTENT.contactEmail;
  const aboutStory = compact(siteContent.aboutStory) || FALLBACK_SITE_CONTENT.aboutStory;

  const shopLinks = [
    { label: "All Products", href: "/shop" },
    { label: "Jewellery", href: "/shop?category=Jewellery" },
    { label: "Accessories", href: "/shop?category=Accessories" },
    { label: "African Wear", href: "/shop?category=African%20Wear" },
    { label: "Home & Living", href: "/shop?category=Home%20%26%20Living" },
    { label: "Art & Craft", href: "/shop?category=Art%20%26%20Craft" },
    { label: "Custom Orders", href: "/custom-order" },
  ];

  const supportLinks = [
    { label: "About Us", href: "/about" },
    { label: "Our Artisans", href: "/artisans" },
    { label: "Shipping & Returns", href: "/shipping" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
    { label: "Track Your Order", href: "/track-order" },
    { label: "Privacy Policy", href: "/privacy" },
  ];

  const contactLinks = [
    { label: "WhatsApp Us", href: `https://wa.me/${whatsappNumber}` },
    { label: "Email Us", href: `mailto:${contactEmail}` },
    { label: "Nairobi, Kenya", href: "/contact" },
    { label: "sharoncraft.co.ke", href: "https://sharoncraft.co.ke" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Returns Policy", href: "/shipping" },
  ];

  const payments =
    Array.isArray(footerContent?.bottom?.paymentMethods) && footerContent.bottom.paymentMethods.length > 0
      ? footerContent.bottom.paymentMethods
      : FALLBACK_FOOTER_CONTENT.bottom.paymentMethods;

  const columns = [
    {
      key: "brand",
      content: (
        <>
          <span className="mb-[14px] block text-[13px] font-medium uppercase tracking-[4px] text-white/85">
            SHARONCRAFT
          </span>
          <p className="mb-6 max-w-[220px] text-[11px] leading-[1.9] text-white/[0.22]">{aboutStory}</p>
          <div className="flex flex-wrap gap-4">
            {socialLinks.map((item) => {
              const label = compact(item?.platform) || "Social";
              const href =
                label.toLowerCase() === "whatsapp"
                  ? `https://wa.me/${whatsappNumber}`
                  : compact(item?.url) || "#";

              return (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="border-b border-transparent pb-[2px] text-[9px] uppercase tracking-[2px] text-white/[0.22] transition-all duration-200 hover:border-white/30 hover:text-white/60"
                >
                  {label}
                </a>
              );
            })}
          </div>
        </>
      ),
    },
    {
      key: "shop",
      title: "Shop",
      links: shopLinks,
    },
    {
      key: "support",
      title: "Support",
      links: supportLinks,
    },
    {
      key: "contact",
      title: "Contact",
      links: contactLinks,
      extra: (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-fit items-center gap-2 border border-white/[0.1] px-4 py-2.5 text-[10px] uppercase tracking-[2px] text-white/50 transition-all duration-200 hover:border-white/30 hover:text-white/80"
        >
          <IconWhatsApp className="h-[14px] w-[14px]" />
          Chat on WhatsApp
        </a>
      ),
    },
  ];

  return (
    <>
      <footer id="footer" ref={ref} className="bg-[#080808] text-white">
        <div className="px-5 pb-0 pt-12 md:px-10 md:pt-16">
          <div className="mx-auto max-w-[1440px] border-b border-white/[0.08] pb-12 md:grid md:grid-cols-[1.8fr_1fr_1fr_1fr] md:gap-12 md:pb-14">
            {columns.map((column, index) => (
              <div
                key={column.key}
                className={column.key === "brand" ? "mb-10 md:mb-0" : "mb-8 md:mb-0"}
                style={visible ? { animation: `storefrontFadeUp 0.6s ease ${index * 80}ms both` } : undefined}
              >
                {column.content ? (
                  column.content
                ) : (
                  <>
                    <span className="mb-5 block text-[9px] uppercase tracking-[3px] text-white/[0.18]">
                      {column.title}
                    </span>
                    <div className={`space-y-1 ${column.key === "contact" ? "hidden md:block" : ""}`}>
                      {column.links.map((link) => {
                        const external = link.href.startsWith("http") || link.href.startsWith("mailto:");

                        if (external) {
                          return (
                            <a
                              key={link.label}
                              href={link.href}
                              target={link.href.startsWith("http") ? "_blank" : undefined}
                              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                              className="block py-1 text-[11px] tracking-[0.5px] text-white/[0.32] transition-colors duration-200 hover:text-white/70"
                            >
                              {link.label}
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={link.label}
                            href={link.href}
                            className="block py-1 text-[11px] tracking-[0.5px] text-white/[0.32] transition-colors duration-200 hover:text-white/70"
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>

                    {column.key === "contact" ? (
                      <>
                        <div className="grid grid-cols-2 gap-8 md:hidden">
                          <div>
                            {column.links.map((link) => {
                              const external = link.href.startsWith("http") || link.href.startsWith("mailto:");

                              if (external) {
                                return (
                                  <a
                                    key={link.label}
                                    href={link.href}
                                    target={link.href.startsWith("http") ? "_blank" : undefined}
                                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                                    className="block py-1 text-[11px] tracking-[0.5px] text-white/[0.32] transition-colors duration-200 hover:text-white/70"
                                  >
                                    {link.label}
                                  </a>
                                );
                              }

                              return (
                                <Link
                                  key={link.label}
                                  href={link.href}
                                  className="block py-1 text-[11px] tracking-[0.5px] text-white/[0.32] transition-colors duration-200 hover:text-white/70"
                                >
                                  {link.label}
                                </Link>
                              );
                            })}
                            {column.extra}
                          </div>
                          <div>
                            <span className="mb-5 block text-[9px] uppercase tracking-[3px] text-white/[0.18]">
                              Legal
                            </span>
                            {legalLinks.map((link) => (
                              <Link
                                key={link.label}
                                href={link.href}
                                className="block py-1 text-[11px] tracking-[0.5px] text-white/[0.32] transition-colors duration-200 hover:text-white/70"
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                        <div className="hidden md:block">{column.extra}</div>
                      </>
                    ) : null}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-white/[0.08] px-5 py-5 md:px-10 md:py-6">
          <div className="mx-auto flex max-w-[1440px] items-center gap-5 overflow-x-auto">
            <span className="shrink-0 border-r border-white/[0.08] pr-5 text-[9px] uppercase tracking-[3px] text-white/[0.15]">
              We Accept
            </span>
            {payments.map((item) => (
              <span
                key={item}
                className={`shrink-0 px-3 py-[5px] text-[9px] uppercase tracking-[1.5px] ${
                  item.toLowerCase() === "m-pesa"
                    ? "border border-[rgba(139,94,60,0.35)] text-[rgba(139,94,60,0.65)]"
                    : "border border-[#1f1f1f] text-white/[0.18]"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="px-5 pb-8 pt-5 md:px-10 md:pb-7">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <p className="text-[10px] tracking-[0.5px] text-white/[0.12]">
              {COPYRIGHT_SYMBOL} 2026 SharonCraft {MIDDLE_DOT} Handmade in Nairobi, Kenya {MIDDLE_DOT} All rights reserved
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-white/[0.12] md:justify-end">
              {legalLinks.map((link, index) => (
                <span key={link.label} className="flex items-center gap-2">
                  <Link href={link.href} className="transition-colors duration-200 hover:text-white/[0.35]">
                    {link.label}
                  </Link>
                  {index < legalLinks.length - 1 ? <span>{MIDDLE_DOT}</span> : null}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes storefrontFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
