import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import SeoHead from "../components/SeoHead";
import { useCart } from "../lib/cart-context";
import { formatKES } from "../lib/formatters";
import { readAdminContentField } from "../lib/admin-content";
import { readSiteImages } from "../lib/site-images";
import { readProducts } from "../lib/store";
import { supabase } from "../lib/supabase-server";

const PAGE_TOKENS = {
  "--cream": "#fafaf8",
  "--black": "#080808",
  "--dark": "#1c1c1c",
  "--brown": "#8B5E3C",
  "--dark-brown": "#3D1F0D",
  "--red": "#C0392B",
  "--border": "rgba(0,0,0,0.08)",
  "--border-light": "rgba(255,255,255,0.08)",
  "--text-primary": "#1c1c1c",
  "--text-secondary": "#888",
  "--text-muted": "#bbb",
  "--card-bg": "#F5F0EB",
};

const MIDDLE_DOT = "\u00B7";
const EN_DASH = "\u2013";
const EM_DASH = "\u2014";
const RIGHT_ARROW = "\u2192";
const COPYRIGHT_SYMBOL = "\u00A9";
const BULLET_SYMBOL = "\u2022";
const WAVE_EMOJI = "\u{1F44B}";

const FALLBACK_ANNOUNCEMENT_ITEMS = [
  "Handmade in Kenya",
  "New Maasai-inspired pieces",
  `Made to order ${MIDDLE_DOT} 5${EN_DASH}7 days`,
  "Free delivery in Nairobi",
  "Secure M-Pesa checkout",
];

const FALLBACK_HERO = {
  image_url: "/media/site/homepage/design.jpg",
  headline: "Handmade",
  subtitle: "in Kenya",
  description: "Beaded jewelry crafted by Nairobi artisans",
  button_text: "Shop the Collection",
  button_link: "/shop",
  secondary_text: "Our Story",
  secondary_link: "/about",
};

const FALLBACK_ARTISAN = {
  image_url: "/media/site/artisans/a24ade36-f8fa-4fb2-9391-f4c5e113f4b8.jpg",
  quote:
    `Every bead is placed with intention. This is not a product ${EM_DASH} it is a piece of Kenya.`,
  author: `Sharon ${MIDDLE_DOT} Founder, Nairobi`,
  link_text: "Meet Our Makers",
  link_href: "/artisans",
};

const FALLBACK_NAVIGATION = {
  header: [
    { label: "Shop", url: "/shop" },
    { label: "Artisans", url: "/artisans" },
    { label: "About", url: "/about" },
    { label: "Custom Orders", url: "/custom-order" },
  ],
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

const FALLBACK_NEWSLETTER = {
  label: "Stay in the Loop",
  heading: "New pieces, artisan stories and exclusive offers",
  note: "No spam. Unsubscribe anytime.",
  placeholder: "Your email address",
  buttonText: "Subscribe",
};

const FALLBACK_TRUSTED_BRANDS = [
  "Nairobi Fashion Week",
  "Kenya Craft Council",
  "Made in Africa",
  "Artisan Collective",
  "Kenya Tourism Board",
];

const FALLBACK_SITE_CONTENT = {
  contactEmail: "hello@sharoncraft.co.ke",
  contactWhatsApp: "0112222572",
  businessHours: "Mon-Sat, 9am-6pm EAT",
  aboutStory:
    "Handmade jewelry and lifestyle pieces crafted by Kenyan artisans in Nairobi. Every piece tells a story.",
  heroImage: "/media/site/homepage/design.jpg",
  artisanPortrait: "/media/site/artisans/a24ade36-f8fa-4fb2-9391-f4c5e113f4b8.jpg",
};

const FALLBACK_STATS = [
  { kind: "count", value: 500, suffix: "+", label: "Handmade Pieces" },
  { kind: "text", value: `5${EN_DASH}10`, label: "Day Delivery" },
  { kind: "count", value: 100, suffix: "%", label: "Authentic" },
  { kind: "text", value: "Made", label: "To Order" },
];

const CATEGORY_BLUEPRINTS = [
  {
    key: "jewellery",
    title: "Jewellery",
    aliases: ["jewellery", "jewelry"],
    href: "/shop?category=Jewellery",
    gradient: "linear-gradient(160deg, #C0392B, #5D1F0D)",
  },
  {
    key: "accessories",
    title: "Accessories",
    aliases: ["accessories"],
    href: "/shop?category=Accessories",
    gradient: "linear-gradient(160deg, #2C1810, #8B5E3C)",
  },
  {
    key: "african-wear",
    title: "African Wear",
    aliases: ["african wear", "bridal & occasion", "bridal and occasion"],
    href: "/shop?category=African%20Wear",
    gradient: "linear-gradient(160deg, #0e0e0e, #3D1F0D)",
  },
  {
    key: "home-living",
    title: "Home & Living",
    aliases: ["home & living", "home and living", "home decor", "home decor & living"],
    href: "/shop?category=Home%20%26%20Living",
    gradient: "linear-gradient(160deg, #8B5E3C, #C0392B)",
  },
];

function compact(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return compact(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

function isPlaceholderAsset(value) {
  return compact(value).includes("/media/site/placeholder.svg");
}

function createBlurDataURL(background = "#f5f0eb", foreground = "#ebe2d9") {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${background}" offset="0%"/>
          <stop stop-color="${foreground}" offset="100%"/>
        </linearGradient>
      </defs>
      <rect width="8" height="8" fill="url(#g)"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const LIGHT_BLUR = createBlurDataURL("#f5f0eb", "#e9dfd5");
const DARK_BLUR = createBlurDataURL("#1c1c1c", "#3d1f0d");

function formatPhoneForWhatsApp(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "254112222572";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

function toTitleCase(value) {
  return compact(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function cleanArtisanLabel(value) {
  const label = compact(value).replace(/^by\s+/i, "");
  return label ? `By ${toTitleCase(label)}` : "By Sharon";
}

function buildAnnouncementItems(record) {
  const text = compact(record?.text);
  if (!text) return FALLBACK_ANNOUNCEMENT_ITEMS;

  const parsed = text
    .split(new RegExp(`[|${BULLET_SYMBOL}]`))
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : [text];
}

function normalizeVisibleProducts(products) {
  return Array.isArray(products)
    ? products.filter((product) => product && product.publishStatus !== "draft")
    : [];
}

function buildFeaturedProducts(products) {
  const visibleProducts = normalizeVisibleProducts(products);
  const featured = visibleProducts.filter((product) => product.featured);

  if (featured.length >= 6) {
    return featured.slice(0, 6);
  }

  const seen = new Set(featured.map((product) => product.id));
  const recentFill = visibleProducts.filter((product) => !seen.has(product.id)).slice(0, 6 - featured.length);
  return featured.concat(recentFill);
}

function getProductImage(product) {
  return product?.image || product?.images?.[0] || "/media/site/placeholder.svg";
}

function mapSupabaseProduct(row) {
  const basePrice = Number(row?.price || 0);
  const salePrice = Number(row?.sale_price || 0);
  const hasSalePrice = salePrice > 0 && salePrice < basePrice;
  const primaryImage = Array.isArray(row?.images) ? compact(row.images[0]) : "";
  const idPrefix = compact(row?.id).split("-")[0];

  return {
    id: compact(row?.id),
    slug: idPrefix ? `${slugify(row?.name || "piece")}-${idPrefix}` : slugify(row?.name || "piece"),
    name: compact(row?.name) || "Untitled Piece",
    category: compact(row?.category),
    artisan: compact(row?.artisan) || "By Sharon",
    image: primaryImage || "/media/site/placeholder.svg",
    images: Array.isArray(row?.images) ? row.images.filter(Boolean) : [],
    price: hasSalePrice ? salePrice : basePrice,
    originalPrice: hasSalePrice ? basePrice : null,
    featured: Boolean(row?.is_featured),
    recent: Boolean(row?.is_new),
    isNew: Boolean(row?.is_new),
    newArrival: Boolean(row?.is_new),
    publishStatus: row?.is_visible === false ? "draft" : "published",
  };
}

function getProductCategoryKey(productCategory) {
  const value = slugify(productCategory);

  if (["jewellery", "jewelry"].includes(value)) return "jewellery";
  if (value === "accessories") return "accessories";
  if (["african-wear", "bridal-occasion", "bridal-and-occasion"].includes(value)) return "african-wear";
  if (["home-decor", "home-living", "home-and-living"].includes(value)) return "home-living";
  return value;
}

function buildCategoryCards(categoryRows, products, siteContent) {
  const rows = Array.isArray(categoryRows) ? categoryRows : [];
  const visibleProducts = normalizeVisibleProducts(products);
  const imageByKey = new Map();
  const homepageImageByKey = new Map([
    ["jewellery", isPlaceholderAsset(siteContent?.collectionJewellery) ? "" : compact(siteContent?.collectionJewellery)],
    ["accessories", isPlaceholderAsset(siteContent?.collectionAccessories) ? "" : compact(siteContent?.collectionAccessories)],
    ["african-wear", isPlaceholderAsset(siteContent?.collectionBridal) ? "" : compact(siteContent?.collectionBridal)],
    ["home-living", isPlaceholderAsset(siteContent?.collectionHome) ? "" : compact(siteContent?.collectionHome)],
  ]);

  for (const product of visibleProducts) {
    const key = getProductCategoryKey(product?.category);
    if (key && !imageByKey.has(key)) {
      imageByKey.set(key, getProductImage(product));
    }
  }

  return CATEGORY_BLUEPRINTS.map((blueprint) => {
    const matchedRow = rows.find((row) => blueprint.aliases.includes(slugify(row?.name)));
    const image =
      homepageImageByKey.get(blueprint.key) ||
      (isPlaceholderAsset(matchedRow?.image_url) ? "" : compact(matchedRow?.image_url)) ||
      imageByKey.get(blueprint.key) ||
      null;

    return {
      key: blueprint.key,
      title: blueprint.title,
      href: blueprint.href,
      image,
      gradient: blueprint.gradient,
      sourceName: matchedRow?.name || blueprint.title,
    };
  });
}

function deriveHeroData(heroRow, siteContent, homepageContent) {
  return {
    image:
      compact(heroRow?.image_url) ||
      (isPlaceholderAsset(siteContent?.heroImage) ? "" : compact(siteContent?.heroImage)) ||
      FALLBACK_HERO.image_url,
    label: compact(homepageContent?.heroLabel) || `NAIROBI, KENYA ${MIDDLE_DOT} EST. 2024`,
    headline: compact(heroRow?.headline) || FALLBACK_HERO.headline,
    subtitle: compact(heroRow?.subtitle) || FALLBACK_HERO.subtitle,
    description: compact(heroRow?.description) || FALLBACK_HERO.description,
    buttonText: compact(heroRow?.button_text) || FALLBACK_HERO.button_text,
    buttonLink: compact(heroRow?.button_link) || FALLBACK_HERO.button_link,
    secondaryText: compact(homepageContent?.ctaArtisansText) || FALLBACK_HERO.secondary_text,
    secondaryLink: compact(homepageContent?.ctaArtisansLink) || FALLBACK_HERO.secondary_link,
    slideCount: 1,
  };
}

function deriveArtisanData(sectionContent, siteContent) {
  const content = sectionContent && typeof sectionContent === "object" ? sectionContent : {};
  return {
    image:
      compact(content?.image_url) ||
      (isPlaceholderAsset(siteContent?.artisanPortrait) ? "" : compact(siteContent?.artisanPortrait)) ||
      FALLBACK_ARTISAN.image_url,
    quote: compact(content?.quote) || FALLBACK_ARTISAN.quote,
    author: compact(content?.author) || FALLBACK_ARTISAN.author,
    linkText: compact(content?.link_text) || FALLBACK_ARTISAN.link_text,
    linkHref: compact(content?.link_href) || FALLBACK_ARTISAN.link_href,
  };
}

function deriveNewsletterData(sectionContent) {
  const content = sectionContent && typeof sectionContent === "object" ? sectionContent : {};
  return {
    label: compact(content?.label) || FALLBACK_NEWSLETTER.label,
    heading: compact(content?.heading) || FALLBACK_NEWSLETTER.heading,
    note: compact(content?.note) || FALLBACK_NEWSLETTER.note,
    placeholder: compact(content?.placeholder) || FALLBACK_NEWSLETTER.placeholder,
    buttonText: compact(content?.button_text) || FALLBACK_NEWSLETTER.buttonText,
  };
}

function deriveTrustedBrands(sectionContent) {
  if (Array.isArray(sectionContent?.items) && sectionContent.items.length > 0) {
    return sectionContent.items.map((item) => compact(item)).filter(Boolean);
  }

  if (Array.isArray(sectionContent) && sectionContent.length > 0) {
    return sectionContent.map((item) => compact(item)).filter(Boolean);
  }

  return FALLBACK_TRUSTED_BRANDS;
}

function resolveNavigationLinks(navigation) {
  const header = Array.isArray(navigation?.header) ? navigation.header : [];
  const byLabel = new Map(header.map((item) => [slugify(item?.label), item]));

  return [
    { label: "Shop", url: byLabel.get("shop")?.url || "/shop" },
    { label: "Artisans", url: byLabel.get("artisans")?.url || "/artisans" },
    { label: "About", url: byLabel.get("about")?.url || "/about" },
    { label: "Custom Orders", url: byLabel.get("custom-orders")?.url || "/custom-order" },
  ];
}

function getSaleBadge(product) {
  const originalPrice = Number(product?.originalPrice || 0);
  const price = Number(product?.price || 0);

  if (originalPrice > price && price > 0) {
    const percentage = Math.round(((originalPrice - price) / originalPrice) * 100);
    return percentage > 0 ? `SAVE ${percentage}%` : "";
  }

  if (product?.isNew || product?.newArrival) {
    return "NEW";
  }

  return "";
}

function useBodyClass(className) {
  useEffect(() => {
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [className]);
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
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
        threshold: options.threshold ?? 0.2,
        rootMargin: options.rootMargin ?? "0px 0px -10% 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold, visible]);

  return [ref, visible];
}

function useScrollNavigationState() {
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = 0;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setAtTop(currentScrollY < 10);

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { hidden, atTop };
}

function useAnimatedNumber(target, active, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;

    let animationFrame = 0;
    let startTime = 0;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [active, duration, target]);

  return value;
}

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

function IconHeart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M12 20.4l-1.1-1C5.2 14.3 2 11.4 2 7.8 2 5 4.2 3 7 3c1.8 0 3.5.8 5 2.6C13.5 3.8 15.2 3 17 3c2.8 0 5 2 5 4.8 0 3.6-3.2 6.5-8.9 11.6l-1.1 1z" />
    </svg>
  );
}

function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M7 8h10l1 12H6L7 8z" />
      <path d="M9 8a3 3 0 016 0" />
    </svg>
  );
}

function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconArrow(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function IconWhatsApp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M20 11.3c0 4.9-3.9 8.7-8.8 8.7-1.6 0-3.1-.4-4.4-1.1L3 20l1.2-3.6A8.5 8.5 0 013 11.3C3 6.5 6.9 2.7 11.8 2.7 16.1 2.7 20 6.4 20 11.3z" />
      <path d="M8.7 8.3c.2-.4.4-.4.7-.4h.6c.2 0 .5 0 .7.5.2.4.7 1.7.8 1.8.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.4.4c-.2.2-.3.3-.1.6.2.4.9 1.5 2 2.4 1.4 1.2 2.5 1.5 2.9 1.7.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 1.8.8 2.1 1 .3.1.5.2.5.4 0 .2 0 1-.4 1.8-.4.8-2.1 1.7-2.9 1.7-.8 0-1.5.1-5-1.4-4-1.8-6.5-6.2-6.7-6.5-.2-.3-1.6-2.1-1.6-4s1-2.8 1.3-3.1z" />
    </svg>
  );
}

function StatusSkeleton({ className }) {
  return <div className={`animate-pulse bg-[rgba(0,0,0,0.05)] ${className}`} />;
}

function AnnouncementBar({ items }) {
  const track = [...items, ...items];

  return (
    <div className="fixed inset-x-0 top-0 z-[1001] h-[28px] overflow-hidden bg-[var(--black)] md:h-[32px]">
      <div className="group flex h-full items-center overflow-hidden">
        <div className="flex min-w-max items-center gap-3 whitespace-nowrap px-4 text-[9px] font-light uppercase tracking-[2.5px] text-white/40 animate-[marquee_30s_linear_infinite] group-hover:[animation-play-state:paused] md:text-[10px]">
          {track.map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-3">
              <span>{item}</span>
              <span className="text-[var(--brown)]">{MIDDLE_DOT}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeNavigation({ links, atTop, hidden }) {
  const { count, wishlistCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const shellClass = atTop
    ? "border-transparent bg-transparent text-white/70"
    : "border-[var(--border)] bg-[rgba(250,250,248,0.92)] text-[var(--text-secondary)] backdrop-blur-[16px]";

  return (
    <>
      <header
        className={`fixed inset-x-0 z-[1000] top-[28px] h-[52px] transition-transform duration-300 ease-out md:top-[32px] md:h-[60px] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <nav
          aria-label="Homepage navigation"
          className={`mx-auto flex h-full w-full items-center border-b px-5 transition-all duration-300 ease-out md:px-10 ${shellClass}`}
        >
          <div className="hidden md:grid md:flex-1 md:grid-cols-[repeat(4,max-content)] md:gap-7">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.url}
                className={`text-[10px] uppercase tracking-[2px] transition-colors duration-200 ${
                  atTop ? "hover:text-white" : "hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-1 items-center md:hidden">
            <button
              type="button"
              aria-label="Open cart"
              onClick={openCart}
              className={`relative inline-flex h-9 w-9 items-center justify-center transition-colors duration-300 ${
                atTop ? "text-white/70 hover:text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <IconBag className="h-[18px] w-[18px]" />
              {count > 0 ? (
                <span className="absolute right-0 top-0 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[var(--dark)] text-[8px] font-normal text-white">
                  {count}
                </span>
              ) : null}
            </button>
          </div>

          <Link
            href="/"
            className={`flex flex-1 items-center justify-center text-center text-[13px] font-medium uppercase tracking-[4px] transition-colors duration-300 ${
              atTop ? "text-white" : "text-[var(--text-primary)]"
            }`}
          >
            SHARONCRAFT
          </Link>

          <div className="hidden flex-1 items-center justify-end gap-5 md:flex">
            <Link
              href="/shop"
              aria-label="Search"
              className={`transition-colors duration-200 ${
                atTop ? "text-white/70 hover:text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <IconSearch className="h-[15px] w-[15px]" />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={`relative transition-colors duration-200 ${
                atTop ? "text-white/70 hover:text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <IconHeart className="h-[15px] w-[15px]" />
              {wishlistCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[var(--dark)] text-[8px] font-normal text-white">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label="Cart"
              className={`relative transition-colors duration-200 ${
                atTop ? "text-white/70 hover:text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <IconBag className="h-[15px] w-[15px]" />
              {count > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[var(--dark)] text-[8px] font-normal text-white">
                  {count}
                </span>
              ) : null}
            </button>
          </div>

          <div className="flex flex-1 justify-end md:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className={`inline-flex h-9 w-9 items-center justify-center transition-colors duration-300 ${
                atTop ? "text-white/70 hover:text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <IconMenu className="h-[18px] w-[18px]" />
            </button>
          </div>
        </nav>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[1100] bg-[var(--black)]">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center text-white/70 transition-colors duration-200 hover:text-white"
          >
            <IconClose className="h-[18px] w-[18px]" />
          </button>

          <nav className="flex h-full items-center justify-center px-8">
            <div className="w-full max-w-[320px]">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.url}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-white/[0.08] py-4 text-center text-[14px] uppercase tracking-[3px] text-white/70 transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="block border-b border-white/[0.08] py-4 text-center text-[14px] uppercase tracking-[3px] text-white/70 transition-colors duration-200 hover:text-white"
              >
                Wishlist
              </Link>
              <Link
                href="/shop"
                onClick={() => setMenuOpen(false)}
                className="block border-b border-white/[0.08] py-4 text-center text-[14px] uppercase tracking-[3px] text-white/70 transition-colors duration-200 hover:text-white"
              >
                Search
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}

function HeroSection({ hero, prefersReducedMotion }) {
  const router = useRouter();

  return (
    <section className="relative h-[75vh] min-h-[500px] overflow-hidden md:h-screen md:min-h-[600px]">
      <div className="absolute inset-0">
        <Image
          src={hero.image}
          alt="SharonCraft hero"
          fill
          priority
          loading="eager"
          placeholder="blur"
          blurDataURL={DARK_BLUR}
          sizes="100vw"
          unoptimized={isRemoteUrl(hero.image)}
          className={`object-cover object-center ${prefersReducedMotion ? "" : "animate-[heroZoom_8s_ease_forwards]"}`}
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(8,8,8,0.65)_0%,rgba(8,8,8,0.2)_50%,rgba(8,8,8,0.05)_100%),linear-gradient(to_top,rgba(8,8,8,0.4)_0%,transparent_40%)]" />

      <div
        className={`absolute bottom-[10%] left-[20px] z-10 max-w-[320px] text-white min-[480px]:max-w-[360px] md:left-[6%] md:max-w-[520px] ${
          prefersReducedMotion ? "" : "animate-[heroFadeUp_1s_ease_0.3s_both]"
        }`}
      >
        <p className="mb-4 text-[10px] uppercase tracking-[5px] text-white/40">{hero.label}</p>
        <h1 className="font-['Cormorant_Garamond','Georgia',serif] text-[32px] font-light leading-[1.05] tracking-[-0.8px] min-[480px]:text-[36px] md:text-[52px] md:tracking-[-1px]">
          <span className="block text-white">{hero.headline}</span>
          <span className="block italic text-white/65">{hero.subtitle}</span>
        </h1>
        <p className="mt-4 hidden text-[12px] tracking-[1px] text-white/40 md:block">{hero.description}</p>

        <div className="mt-7 flex flex-col gap-3 md:flex-row md:items-center">
          <Link
            href={hero.buttonLink}
            onMouseEnter={() => router.prefetch("/shop")}
            className="inline-flex w-full items-center justify-center border border-white/50 px-8 py-[13px] text-center text-[10px] uppercase tracking-[4px] text-white transition-all duration-300 ease-out hover:border-white hover:bg-white/10 md:w-auto"
          >
            {hero.buttonText}
          </Link>
          <Link
            href={hero.secondaryLink}
            className="mx-auto inline-flex items-center justify-center border-b border-white/20 pb-[2px] text-[10px] uppercase tracking-[2px] text-white/40 transition-colors duration-300 ease-out hover:text-white/70 md:mx-0 md:ml-6"
          >
            {hero.secondaryText} <span className="ml-2">{RIGHT_ARROW}</span>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 right-10 z-10 hidden flex-col items-center gap-2 md:flex">
        <div className="h-12 w-px origin-top bg-white/20 animate-[scrollPulse_2s_ease_infinite]" />
        <span className="text-[8px] uppercase tracking-[3px] text-white/20 [writing-mode:vertical-rl]">
          Scroll
        </span>
      </div>

      <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        {Array.from({ length: Math.max(hero.slideCount || 1, 1) }).map((_, index) => (
          <span
            key={`dot-${index}`}
            className={index === 0
              ? "h-[4px] w-5 rounded-full bg-[var(--brown)]"
              : "h-[4px] w-[4px] rounded-full bg-white/30"}
          />
        ))}
      </div>
    </section>
  );
}

function StatCell({ item, active, index }) {
  const animatedValue = useAnimatedNumber(item.kind === "count" ? item.value : 0, active);
  const numberText =
    item.kind === "count" ? `${animatedValue}${item.suffix || ""}` : item.value;

  const borderClass = index === 0
    ? "border-b border-r md:border-b-0 md:border-r"
    : index === 1
      ? "border-b md:border-b-0 md:border-r"
      : index === 2
        ? "border-r md:border-r"
        : "";

  return (
    <div
      className={`flex min-h-[96px] flex-col items-center justify-center px-4 py-6 text-center transition-colors duration-200 hover:bg-black/[0.02] md:min-h-[120px] md:py-8 ${borderClass} border-[var(--border)]`}
    >
      <span className="mb-1.5 block text-[20px] font-light tracking-[-0.5px] text-[var(--text-primary)] md:text-[24px]">
        {numberText}
      </span>
      <span className="text-[9px] uppercase tracking-[3px] text-[var(--text-muted)]">
        {item.label}
      </span>
    </div>
  );
}

function StatsBar() {
  const [ref, visible] = useInViewOnce({ threshold: 0.4 });

  return (
    <section ref={ref} className="border-b border-[var(--border)]">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {FALLBACK_STATS.map((item, index) => (
          <StatCell key={item.label} item={item} active={visible} index={index} />
        ))}
      </div>
    </section>
  );
}

function CategoryGrid({ categories, status }) {
  const [ref, visible] = useInViewOnce();

  if (status === "empty") return null;

  if (status === "loading") {
    return (
    <section id="collections" className="grid grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatusSkeleton key={`category-skeleton-${index}`} className="h-[200px] md:h-[320px]" />
        ))}
      </section>
    );
  }

  return (
    <section id="collections" ref={ref} className="grid grid-cols-2 lg:grid-cols-4">
      {categories.map((category, index) => (
        <Link
          key={category.key}
          href={category.href}
          className={`group relative block h-[200px] overflow-hidden min-[480px]:h-[220px] md:h-[320px] ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          style={visible ? { animation: `fadeUp 0.6s ease ${index * 100}ms both` } : undefined}
        >
          {category.image ? (
            <Image
              src={category.image}
              alt={category.title}
              fill
              placeholder="blur"
              blurDataURL={DARK_BLUR}
              sizes="(max-width: 768px) 50vw, 25vw"
              loading="lazy"
              unoptimized={isRemoteUrl(category.image)}
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ background: category.gradient }}
            />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,8,0.78)_0%,rgba(8,8,8,0.2)_45%,rgba(8,8,8,0.05)_100%)] transition-opacity duration-300 ease-out group-hover:opacity-100" />

          <div className="absolute inset-x-0 bottom-0 p-[14px] md:p-5">
            <span className="mb-1 block text-[13px] font-light tracking-[0.5px] text-white md:text-[17px]">
              {category.title}
            </span>
            <span className="block text-[9px] uppercase tracking-[2px] text-white/0 transition-colors duration-300 ease-out group-hover:text-white/55">
              {`Explore ${RIGHT_ARROW}`}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

function ProductCard({ product, visible, delay }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const saved = isWishlisted(product.id);
  const badge = getSaleBadge(product);
  const image = getProductImage(product);
  const artisan = cleanArtisanLabel(product.artisan);

  return (
    <article
      className={visible ? "opacity-100" : "opacity-0"}
      style={visible ? { animation: `fadeUp 0.6s ease ${delay}ms both` } : undefined}
    >
      <div className="group">
        <div className="relative mb-[14px] overflow-hidden bg-[var(--card-bg)]">
          <Link href={`/product/${product.slug}`} className="block">
            <div className="relative aspect-[1/1.3] min-[1024px]:aspect-[1/1.25]">
              <Image
                src={image}
                alt={product.name}
                fill
                placeholder="blur"
                blurDataURL={LIGHT_BLUR}
                sizes="(max-width: 768px) 50vw, 33vw"
                loading="lazy"
                unoptimized={isRemoteUrl(image)}
                className="object-cover transition-[filter] duration-500 ease-out group-hover:brightness-[0.87]"
              />
            </div>
          </Link>

          {badge ? (
            <span className="absolute left-[10px] top-[10px] bg-[var(--dark)] px-2 py-[3px] text-[8px] uppercase tracking-[1.5px] text-white">
              {badge}
            </span>
          ) : null}

          <button
            type="button"
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => toggleWishlist(product)}
            className={`absolute right-[10px] top-[10px] transition-colors duration-300 ease-out md:text-white/0 md:group-hover:text-white/70 ${
              saved ? "text-white md:text-white/90" : "text-white/70"
            }`}
          >
            <IconHeart className="h-[14px] w-[14px]" />
          </button>

          <button
            type="button"
            onClick={() => addToCart(product)}
            className="absolute inset-x-0 bottom-0 translate-y-0 bg-[rgba(28,28,28,0.88)] px-[13px] py-[13px] text-center text-[9px] uppercase tracking-[3px] text-white transition-transform duration-300 ease-out md:translate-y-full md:group-hover:translate-y-0 md:text-[10px]"
          >
            Add to Cart
          </button>
        </div>

        <div>
          <span className="mb-[5px] block text-[9px] uppercase tracking-[2px] text-[var(--text-muted)]">
            {artisan.toUpperCase()}
          </span>
          <Link
            href={`/product/${product.slug}`}
            className="mb-[5px] block overflow-hidden text-[11px] leading-[1.4] tracking-[0.3px] text-[var(--text-primary)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:text-[12px]"
          >
            {product.name}
          </Link>
          <div className="flex items-center text-[11px] md:text-[12px]">
            <span className="font-medium text-[var(--text-primary)]">{formatKES(product.price)}</span>
            {product.originalPrice ? (
              <span className="ml-2 text-[11px] text-[#ccc] line-through">{formatKES(product.originalPrice)}</span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function FeaturedProductsSection({ products, status }) {
  const [ref, visible] = useInViewOnce();

  if (status === "empty") return null;

  return (
    <section id="our-pieces" ref={ref} className="px-5 py-12 md:px-10 md:py-[88px]">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex items-end justify-between gap-4">
          <p className="text-[10px] uppercase tracking-[5px] text-[var(--text-muted)]">Our Pieces</p>
          <Link
            href="/shop"
            className="hidden border-b border-[#e0e0e0] pb-[2px] text-[10px] uppercase tracking-[2px] text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] md:inline-flex"
          >
                {`View all ${RIGHT_ARROW}`}
          </Link>
        </div>

        {status === "loading" ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <StatusSkeleton key={`product-skeleton-${index}`} className="aspect-[1/1.45]" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {products.map((product, index) => (
                <div key={product.id} className={index > 3 ? "hidden md:block" : ""}>
                  <ProductCard product={product} visible={visible} delay={index * 80} />
                </div>
              ))}
            </div>

            <div className="mt-6 md:hidden">
              <Link
                href="/shop"
                className="inline-flex border-b border-[#e0e0e0] pb-[2px] text-[10px] uppercase tracking-[2px] text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
              >
                {`View all ${RIGHT_ARROW}`}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ArtisanSection({ artisan, status }) {
  const [ref, visible] = useInViewOnce();

  if (status === "empty") return null;

  if (status === "loading") {
    return (
      <section id="makers" className="border-t border-[var(--border)]">
        <div className="grid md:grid-cols-2">
          <StatusSkeleton className="h-[280px] md:h-[440px]" />
          <StatusSkeleton className="h-[260px] md:h-[440px]" />
        </div>
      </section>
    );
  }

  return (
    <section id="makers" ref={ref} className="border-t border-[var(--border)]">
      <div className="grid md:min-h-[440px] md:grid-cols-2">
        <div
          className="group relative h-[280px] overflow-hidden bg-[#1a0e08] md:h-auto"
          style={visible ? { animation: "fadeLeft 0.7s ease both" } : undefined}
        >
          <Image
            src={artisan.image}
            alt={artisan.author}
            fill
            placeholder="blur"
            blurDataURL={DARK_BLUR}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={isRemoteUrl(artisan.image)}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_60px,rgba(255,255,255,0.015)_60px,rgba(255,255,255,0.015)_61px)]" />
        </div>

        <div className="flex flex-col justify-center bg-[var(--cream)] px-5 py-10 md:px-14 md:py-[72px]">
          <p
            className="mb-6 text-[9px] uppercase tracking-[5px] text-[var(--text-muted)]"
            style={visible ? { animation: "fadeRight 0.6s ease both" } : undefined}
          >
            The Maker
          </p>
          <blockquote
            className="mb-4 max-w-[36rem] font-['Cormorant_Garamond','Georgia',serif] text-[16px] font-light italic leading-[1.7] tracking-[0.2px] text-[var(--text-primary)] md:text-[20px]"
            style={visible ? { animation: "fadeRight 0.6s ease 0.15s both" } : undefined}
          >
            "{artisan.quote}"
          </blockquote>
          <p
            className="mb-10 text-[9px] uppercase tracking-[3px] text-[var(--text-muted)] md:text-[10px]"
            style={visible ? { animation: "fadeRight 0.6s ease 0.25s both" } : undefined}
          >
            {artisan.author}
          </p>
          <Link
            href={artisan.linkHref}
            className="inline-flex w-fit border-b border-[var(--text-primary)] pb-[3px] text-[10px] uppercase tracking-[3px] text-[var(--text-primary)] transition-opacity duration-200 hover:opacity-50"
            style={visible ? { animation: "fadeRight 0.6s ease 0.35s both" } : undefined}
          >
            {artisan.linkText} {RIGHT_ARROW}
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustedBrandsBar({ items }) {
  const marquee = [...items, ...items];

  return (
    <section id="trusted-by" className="border-y border-[var(--border)] bg-[var(--cream)] px-5 py-5 md:px-10 md:py-6">
      <div className="mx-auto flex max-w-[1440px] items-center gap-0">
        <div className="hidden shrink-0 border-r border-[var(--border)] pr-8 text-[9px] uppercase tracking-[3px] text-[#ccc] md:block">
          As Seen In / Trusted By
        </div>
        <div className="group flex-1 overflow-hidden">
          <div className="flex min-w-max items-center whitespace-nowrap text-[9px] uppercase tracking-[3px] text-[#ccc] animate-[marqueeReverse_25s_linear_infinite] group-hover:[animation-play-state:paused] md:text-[10px]">
            {marquee.map((item, index) => (
              <span key={`${item}-${index}`} className="px-8">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection({ newsletter }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("You're on the list.");
        setEmail("");
        return;
      }

      setStatus("error");
      setMessage("We couldn't save your email right now.");
    } catch {
      setStatus("error");
      setMessage("We couldn't save your email right now.");
    }
  }

  return (
    <section id="newsletter" className="bg-[var(--card-bg)] px-5 py-10 md:px-10 md:py-14">
      <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-[1.5fr_1fr] md:items-center">
        <div>
          <p className="mb-3 text-[9px] uppercase tracking-[4px] text-[var(--brown)]">{newsletter.label}</p>
          <h2 className="max-w-[340px] text-[16px] font-light leading-[1.4] text-[var(--text-primary)] md:text-[20px]">
            {newsletter.heading}
          </h2>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 min-[480px]:flex-row">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={newsletter.placeholder}
              className="w-full rounded-none border border-black/15 bg-white px-[18px] py-[13px] text-[12px] text-[var(--text-primary)] outline-none transition-colors duration-300 placeholder:text-[var(--text-muted)] focus:border-[var(--brown)] min-[480px]:max-w-[220px] md:max-w-none"
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-none bg-[var(--dark)] px-6 py-[13px] text-[10px] uppercase tracking-[3px] text-white transition-colors duration-200 hover:bg-[var(--brown)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? "Sending" : newsletter.buttonText}
            </button>
          </form>
          <p className="mt-3 text-[10px] tracking-[0.5px] text-[var(--text-muted)]">{newsletter.note}</p>
          {message ? (
            <p className={`mt-2 text-[10px] ${status === "error" ? "text-[var(--red)]" : "text-[var(--brown)]"}`}>
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function LuxuryFooter({ siteContent, footerContent }) {
  const [ref, visible] = useInViewOnce({ threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
  const whatsappNumber = formatPhoneForWhatsApp(siteContent.contactWhatsApp);
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

  const payments = Array.isArray(footerContent?.bottom?.paymentMethods) && footerContent.bottom.paymentMethods.length > 0
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
          <p className="mb-6 max-w-[220px] text-[11px] leading-[1.9] text-white/[0.22]">
            {aboutStory}
          </p>
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
    <footer id="footer" ref={ref} className="bg-[var(--black)] text-white">
      <div className="px-5 pb-0 pt-12 md:px-10 md:pt-16">
        <div className="mx-auto max-w-[1440px] border-b border-white/[0.08] pb-12 md:grid md:grid-cols-[1.8fr_1fr_1fr_1fr] md:gap-12 md:pb-14">
          {columns.map((column, index) => (
            <div
              key={column.key}
              className={column.key === "brand" ? "mb-10 md:mb-0" : "mb-8 md:mb-0"}
              style={visible ? { animation: `fadeUp 0.6s ease ${index * 80}ms both` } : undefined}
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
  );
}

function FloatingWhatsAppButton({ phoneNumber }) {
  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    `Hi Sharon ${WAVE_EMOJI} I saw your jewelry on sharoncraft.co.ke and would love to know more!`,
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group fixed bottom-20 right-6 z-[999] inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dark)] text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-200 ease-out hover:scale-[1.08] hover:bg-[var(--brown)] md:bottom-6"
      aria-label="Chat with us"
    >
      <IconWhatsApp className="h-[14px] w-[14px]" />
      <span className="pointer-events-none absolute right-14 whitespace-nowrap bg-[var(--dark)] px-[10px] py-[5px] text-[10px] tracking-[1px] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        Chat with us
      </span>
    </a>
  );
}

export default function HomePage(props) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { hidden, atTop } = useScrollNavigationState();
  const navigationLinks = useMemo(() => resolveNavigationLinks(props.navigation), [props.navigation]);
  const phoneNumber = useMemo(() => formatPhoneForWhatsApp(props.siteContent.contactWhatsApp), [props.siteContent.contactWhatsApp]);

  useBodyClass("homepage-quiet-luxury");

  return (
    <>
      <SeoHead
        title="Quiet Luxury Kenyan Jewelry"
        description="Handmade jewelry, accessories and lifestyle pieces crafted in Nairobi by SharonCraft artisans."
        path="/"
      />

      <div style={PAGE_TOKENS} className="bg-[var(--cream)] text-[var(--text-primary)] animate-[pageFade_0.6s_ease_both]">
        <AnnouncementBar items={props.announcementItems} />
        <HomeNavigation links={navigationLinks} atTop={atTop} hidden={hidden} />
        <HeroSection hero={props.hero} prefersReducedMotion={prefersReducedMotion} />
        <StatsBar />
        <CategoryGrid categories={props.categoryCards} status={props.sectionStatus.categories} />
        <FeaturedProductsSection products={props.featuredProducts} status={props.sectionStatus.products} />
        <ArtisanSection artisan={props.artisan} status={props.sectionStatus.artisan} />
        <TrustedBrandsBar items={props.trustedBrands} />
        <NewsletterSection newsletter={props.newsletter} />
        <LuxuryFooter siteContent={props.siteContent} footerContent={props.footerContent} />
        <FloatingWhatsAppButton phoneNumber={phoneNumber} />
      </div>

      <style jsx global>{`
        body.homepage-quiet-luxury {
          background: var(--cream);
          background-image: none !important;
          color: var(--text-primary);
        }

        body.homepage-quiet-luxury .mobile-bottom-nav,
        body.homepage-quiet-luxury .whatsapp-fab,
        body.homepage-quiet-luxury .sticky-mini-cart {
          display: none !important;
        }

        body.homepage-quiet-luxury main {
          margin-top: 0 !important;
          scroll-margin-top: 0 !important;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes marqueeReverse {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes heroZoom {
          from {
            transform: scale(1.06);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes heroFadeUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scrollPulse {
          0%,
          100% {
            opacity: 0.2;
            transform: scaleY(0.5);
          }
          50% {
            opacity: 0.8;
            transform: scaleY(1);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeLeft {
          from {
            opacity: 0;
            transform: translateX(-24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeRight {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pageFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  const sectionStatus = {
    announcement: "fallback",
    hero: "fallback",
    categories: "loading",
    products: "loading",
    artisan: "fallback",
  };

  let siteContent = { ...FALLBACK_SITE_CONTENT };
  let navigation = FALLBACK_NAVIGATION;
  let footerContent = FALLBACK_FOOTER_CONTENT;
  let homepageContent = {};
  let categories = [];
  let heroRow = null;
  let artisanSection = null;
  let trustedBrandsSection = null;
  let newsletterSection = null;
  let announcementRow = null;
  let products = [];

  try {
    siteContent = { ...FALLBACK_SITE_CONTENT, ...(await readSiteImages()) };
  } catch {
    siteContent = { ...FALLBACK_SITE_CONTENT };
  }

  try {
    navigation = await readAdminContentField("navigation", FALLBACK_NAVIGATION);
  } catch {
    navigation = FALLBACK_NAVIGATION;
  }

  try {
    footerContent = await readAdminContentField("footerContent", FALLBACK_FOOTER_CONTENT);
  } catch {
    footerContent = FALLBACK_FOOTER_CONTENT;
  }

  try {
    homepageContent = await readAdminContentField("homepageContent", {});
  } catch {
    homepageContent = {};
  }

  if (supabase) {
    try {
      const [announcementRes, heroRes, categoriesRes, homepageRes, productsRes] = await Promise.all([
        supabase
          .from("announcement")
          .select("*")
          .eq("is_visible", true)
          .order("updated_at", { ascending: false })
          .limit(1),
        supabase
          .from("hero_slides")
          .select("*")
          .eq("is_visible", true)
          .order("display_order")
          .limit(1),
        supabase
          .from("categories")
          .select("*")
          .eq("is_visible", true)
          .order("display_order"),
        supabase
          .from("homepage_content")
          .select("*")
          .eq("is_visible", true),
        supabase
          .from("products")
          .select("*")
          .eq("is_visible", true)
          .order("created_at", { ascending: false }),
      ]);

      announcementRow = announcementRes.data?.[0] || null;
      heroRow = heroRes.data?.[0] || null;
      categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      products = Array.isArray(productsRes.data) ? productsRes.data.map(mapSupabaseProduct) : [];

      if (announcementRow) sectionStatus.announcement = "ready";
      if (heroRow) sectionStatus.hero = "ready";
      sectionStatus.categories = categories.length > 0 ? "ready" : "fallback";
      sectionStatus.products = products.length > 0 ? "ready" : "empty";

      const homepageRows = Array.isArray(homepageRes.data) ? homepageRes.data : [];
      const sectionMap = new Map(homepageRows.map((row) => [compact(row.section).toLowerCase(), row.content]));

      artisanSection = sectionMap.get("artisan") || null;
      trustedBrandsSection = sectionMap.get("trusted_brands") || sectionMap.get("trusted-brands") || null;
      newsletterSection = sectionMap.get("newsletter") || null;

      if (artisanSection) sectionStatus.artisan = "ready";
    } catch {
      sectionStatus.categories = "fallback";
      sectionStatus.artisan = "fallback";
    }
  } else {
    sectionStatus.categories = "fallback";
    sectionStatus.artisan = "fallback";
  }

  if (products.length === 0) {
    try {
      products = await readProducts();
      sectionStatus.products = normalizeVisibleProducts(products).length > 0 ? "ready" : "empty";
    } catch {
      products = [];
      sectionStatus.products = "empty";
    }
  }

  const featuredProducts = buildFeaturedProducts(products);
  const hero = deriveHeroData(heroRow, siteContent, homepageContent);
  const artisan = deriveArtisanData(artisanSection, siteContent);
  const categoryCards = buildCategoryCards(categories, products, siteContent);
  const announcementItems = buildAnnouncementItems(announcementRow);
  const trustedBrands = deriveTrustedBrands(trustedBrandsSection);
  const newsletter = deriveNewsletterData(newsletterSection);

  return {
    props: {
      announcementItems,
      hero,
      categoryCards,
      featuredProducts,
      artisan,
      trustedBrands,
      newsletter,
      siteContent,
      navigation,
      footerContent,
      sectionStatus,
    },
  };
}
