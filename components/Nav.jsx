import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../lib/cart-context";

const MIDDLE_DOT = "\u00B7";

const FALLBACK_ANNOUNCEMENT_ITEMS = [
  "Handmade in Kenya",
  "New Maasai-inspired pieces",
  "Made to order \u00B7 5\u20137 days",
  "Free delivery in Nairobi",
  "Secure M-Pesa checkout",
];

const FALLBACK_NAV_LINKS = [
  { label: "Shop", url: "/shop" },
  { label: "Artisans", url: "/artisans" },
  { label: "About", url: "/about" },
  { label: "Custom Orders", url: "/custom-order" },
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

function buildAnnouncementItems(record) {
  const text = compact(record?.text);
  if (!text) return FALLBACK_ANNOUNCEMENT_ITEMS;

  const parsed = text
    .split(/[|\u2022]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : [text];
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

function useScrollNavigationState() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = 0;

    const onScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide/show on scroll
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      // Change background when scrolled
      setScrolled(currentScrollY > 20);

      lastScrollY = currentScrollY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { hidden, scrolled };
}

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
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

function AnnouncementBar({ items }) {
  const track = [...items, ...items];

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[1001] h-[28px] overflow-hidden bg-[#080808] md:h-[32px]">
        <div className="group flex h-full items-center overflow-hidden">
          <div className="flex min-w-max items-center gap-3 whitespace-nowrap px-4 text-[9px] font-light uppercase tracking-[2.5px] text-white/40 animate-[storefrontMarquee_30s_linear_infinite] group-hover:[animation-play-state:paused] md:text-[10px]">
            {track.map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-3">
                <span>{item}</span>
                <span className="text-[#8B5E3C]">{MIDDLE_DOT}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes storefrontMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: scale(1);
          }
          40%, 43% {
            transform: scale(1.3);
          }
          70% {
            transform: scale(1.1);
          }
          90% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
}

export default function Nav() {
  const { count, openCart } = useCart();
  const { hidden, scrolled } = useScrollNavigationState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcementItems, setAnnouncementItems] = useState(FALLBACK_ANNOUNCEMENT_ITEMS);
  const [navigation, setNavigation] = useState({ header: FALLBACK_NAV_LINKS });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [navigationResponse, announcementResponse] = await Promise.all([
          fetch("/api/admin/navigation"),
          fetch("/api/announcement"),
        ]);

        if (navigationResponse.ok) {
          const data = await navigationResponse.json();
          if (!cancelled) {
            setNavigation(data);
          }
        }

        if (announcementResponse.ok) {
          const data = await announcementResponse.json();
          if (!cancelled) {
            setAnnouncementItems(buildAnnouncementItems(data?.announcement));
          }
        }
      } catch {
        // Keep graceful fallbacks if public shell data cannot be fetched.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const links = useMemo(() => resolveNavigationLinks(navigation), [navigation]);
  const shellClass = scrolled
    ? "border-[rgba(0,0,0,0.12)] bg-[rgba(250,250,248,0.98)] text-[#888] backdrop-blur-[20px] shadow-sm"
    : "border-[rgba(0,0,0,0.08)] bg-[rgba(250,250,248,0.92)] text-[#888] backdrop-blur-[16px]";

  return (
    <>
      <AnnouncementBar items={announcementItems} />

      <header
        className={`fixed inset-x-0 top-[28px] z-[1000] h-[52px] transition-transform duration-[400ms] ease-out md:top-[32px] md:h-[60px] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <nav
          aria-label="Storefront navigation"
          className={`mx-auto flex h-full w-full items-center border-b px-5 transition-all duration-300 ease-out md:px-10 ${shellClass}`}
        >
          <div className="hidden md:grid md:flex-1 md:grid-cols-[repeat(4,max-content)] md:gap-7">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.url}
                className="text-[10px] uppercase tracking-[2px] transition-all duration-300 hover:text-[#1c1c1c] relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#8B5E3C] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          <div className="flex flex-1 items-center md:hidden">
            <button
              type="button"
              aria-label="Open cart"
              onClick={openCart}
              className="relative inline-flex h-9 w-9 items-center justify-center text-[#888] transition-all duration-300 hover:text-[#1c1c1c] hover:scale-110 active:scale-95"
            >
              <IconBag className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" />
              {count > 0 ? (
                <span className="absolute right-0 top-0 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#1c1c1c] text-[8px] font-normal text-white animate-[bounce_0.5s_ease-out]">
                  {count}
                </span>
              ) : null}
            </button>
          </div>

          <Link
            href="/"
            className="flex flex-1 items-center justify-center text-center text-[13px] font-medium uppercase tracking-[4px] text-[#1c1c1c] transition-colors duration-300"
          >
            SHARONCRAFT
          </Link>

          <div className="hidden flex-1 items-center justify-end gap-5 md:flex">
            <Link
              href="/shop"
              aria-label="Search"
              className="text-[#888] transition-all duration-300 hover:text-[#1c1c1c] hover:scale-110 active:scale-95"
            >
              <IconSearch className="h-[15px] w-[15px] transition-transform duration-300" />
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label="Cart"
              className="relative text-[#888] transition-all duration-300 hover:text-[#1c1c1c] hover:scale-110 active:scale-95"
            >
              <IconBag className="h-[15px] w-[15px] transition-transform duration-300" />
              {count > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#1c1c1c] text-[8px] font-normal text-white animate-[bounce_0.5s_ease-out]">
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
              className="inline-flex h-9 w-9 items-center justify-center text-[#888] transition-colors duration-300 hover:text-[#1c1c1c]"
            >
              <IconMenu className="h-[18px] w-[18px]" />
            </button>
          </div>
        </nav>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[1100] bg-[#080808] animate-[slideIn_0.3s_ease-out]">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center text-white/70 transition-all duration-300 hover:text-white hover:rotate-90"
          >
            <IconClose className="h-[18px] w-[18px]" />
          </button>

          <nav className="flex h-full items-center justify-center px-8">
            <div className="w-full max-w-[320px]">
              {links.map((link, index) => (
                <Link
                  key={link.label}
                  href={link.url}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-[#1a1a1a] py-4 text-center text-[14px] uppercase tracking-[3px] text-white/70 transition-all duration-300 hover:text-white hover:translate-x-2"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/shop"
                onClick={() => setMenuOpen(false)}
                className="block border-b border-[#1a1a1a] py-4 text-center text-[14px] uppercase tracking-[3px] text-white/70 transition-all duration-300 hover:text-white hover:translate-x-2"
                style={{
                  animation: `fadeInUp 0.4s ease-out ${links.length * 0.1}s both`
                }}
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
