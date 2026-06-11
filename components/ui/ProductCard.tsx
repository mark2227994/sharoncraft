'use client';

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { useCart } from "../../lib/cart-context";
import { resolveProductImageSource } from "../../lib/products";
import SafeImage from "./SafeImage";

type ImageLike =
  | string
  | {
      src?: string | null;
      url?: string | null;
      image?: string | null;
    }
  | null
  | undefined;

type ProductLike = {
  id: string;
  slug: string;
  name: string;
  artisan?: string | null;
  price?: number | null;
  sale_price?: number | null;
  originalPrice?: number | null;
  image?: string | null;
  images?: ImageLike[];
  isSold?: boolean;
  stock?: number | null;
  badge?: string | null;
  newArrival?: boolean;
  isNew?: boolean;
};

type ProductCardProps = {
  product: ProductLike;
  variant?: string;
};

const PLACEHOLDER_IMAGE = "/media/site/placeholder.svg";

function readImageSource(image: ImageLike): string | null {
  return resolveProductImageSource(image) || null;
}

function formatKes(value: number): string {
  return `KES ${Number(value || 0).toLocaleString("en-KE")}`;
}

function normalizeArtisanLabel(artisan: string | null | undefined): string {
  const safeArtisan = String(artisan || "SHARON").trim() || "SHARON";
  const withoutPrefix = safeArtisan.replace(/^by\s+/i, "").trim() || "SHARON";
  return `BY ${withoutPrefix.toUpperCase()}`;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 20.4 4.9 13.9C3.1 12.2 2 10.7 2 8.8 2 5.9 4.2 4 6.9 4c1.7 0 3.4.8 4.5 2.1C12.6 4.8 14.3 4 16 4 18.8 4 21 5.9 21 8.8c0 1.9-1.1 3.4-2.9 5.1L12 20.4Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useCart() as any;
  const [hovered, setHovered] = useState(false);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const imageSources = useMemo(() => {
    const sources = [
      readImageSource(product.image),
      ...(Array.isArray(product.images) ? product.images.map(readImageSource) : []),
    ].filter((value): value is string => Boolean(value));

    const deduped = Array.from(new Set(sources));
    return deduped.length > 0 ? deduped : [PLACEHOLDER_IMAGE];
  }, [product.image, product.images]);

  const primaryImage = imageSources[0] || PLACEHOLDER_IMAGE;
  const secondaryImage = imageSources[1] || null;
  const hasSecondImage =
    Array.isArray(imageSources) &&
    imageSources.length > 1 &&
    Boolean(imageSources[1]);

  const basePrice = Math.max(0, Number(product.price || 0));
  const salePrice = Math.max(0, Number(product.sale_price || 0));
  const originalPriceCandidate = Math.max(0, Number(product.originalPrice || 0));
  const displayPrice = salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;
  const originalPrice =
    salePrice > 0 && salePrice < basePrice
      ? basePrice
      : originalPriceCandidate > displayPrice
        ? originalPriceCandidate
        : 0;

  const isSoldOut = Boolean(product.isSold) || Number(product.stock || 0) <= 0;
  const hasSale = originalPrice > displayPrice && !isSoldOut;
  const salePercent = hasSale ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  const showNewBadge =
    Boolean(product.isNew || product.newArrival) ||
    String(product.badge || "").trim().toLowerCase() === "new";
  const artisanLabel = normalizeArtisanLabel(product.artisan);
  const saved = isWishlisted(product.id);
  const showSecondaryImage = hasSecondImage && (isCoarsePointer ? mobileImageIndex === 1 : hovered);

  useEffect(() => {
    const current = cardRef.current;

    if (!current || typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "160px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const syncPointerMode = () => setIsCoarsePointer(mediaQuery.matches);

    syncPointerMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncPointerMode);
      return () => mediaQuery.removeEventListener("change", syncPointerMode);
    }

    mediaQuery.addListener(syncPointerMode);
    return () => mediaQuery.removeListener(syncPointerMode);
  }, []);

  useEffect(() => {
    if (!isInView || !hasSecondImage || !secondaryImage || typeof window === "undefined") {
      return;
    }

    const image = new window.Image();
    image.src = secondaryImage;
  }, [hasSecondImage, isInView, secondaryImage]);

  function handleToggleWishlist(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
  }

  function handleTouchStart(event: TouchEvent<HTMLAnchorElement>) {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLAnchorElement>) {
    if (!hasSecondImage || touchStartXRef.current === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const delta = touchStartXRef.current - touchEndX;

    if (delta > 40) {
      setMobileImageIndex(1);
    } else if (delta < -40) {
      setMobileImageIndex(0);
    }

    touchStartXRef.current = null;
  }

  return (
    <article
      ref={cardRef}
      className="product-card-shell"
      data-variant={variant}
      onMouseEnter={() => {
        if (!isCoarsePointer) {
          setHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (!isCoarsePointer) {
          setHovered(false);
        }
      }}
    >
      <div className="product-card-shell__media">
        <Link
          href={`/product/${product.slug}`}
          className="product-card-shell__image-link"
          aria-label={`View ${product.name}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="product-card-shell__image-wrap">
            {(showNewBadge || hasSale) ? (
              <div className="product-card-shell__badges">
                {showNewBadge ? (
                  <span className="product-card-shell__badge product-card-shell__badge--new">NEW</span>
                ) : null}
                {hasSale ? (
                  <span className="product-card-shell__badge product-card-shell__badge--sale">
                    SAVE {salePercent}%
                  </span>
                ) : null}
              </div>
            ) : null}

            <SafeImage
              src={primaryImage}
              alt={product.name}
              type="product"
              className="product-card-shell__image product-card-shell__image--primary"
              priority={false}
            />

            {hasSecondImage && secondaryImage ? (
              <SafeImage
                src={secondaryImage}
                alt={`${product.name} - alternate view`}
                type="product"
                className="product-card-shell__image product-card-shell__image--secondary"
                priority={false}
              />
            ) : null}

            <span
              className="product-card-shell__cta"
              style={{
                transform: hovered ? "translateY(0)" : "translateY(100%)",
              }}
            >
              VIEW PIECE
            </span>
          </div>
        </Link>

        <button
          type="button"
          className="product-card-shell__wishlist"
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          onClick={handleToggleWishlist}
          style={{
            color: saved
              ? "rgba(255,255,255,0.95)"
              : hovered
                ? "rgba(255,255,255,0.7)"
                : "rgba(255,255,255,0)",
          }}
        >
          <HeartIcon filled={saved} />
        </button>
      </div>

      {hasSecondImage ? (
        <div className="product-card-shell__dots" aria-hidden="true">
          <span className={`product-card-shell__dot${mobileImageIndex === 0 ? " is-active" : ""}`} />
          <span className={`product-card-shell__dot${mobileImageIndex === 1 ? " is-active" : ""}`} />
        </div>
      ) : null}

      <div className="product-card-shell__content">
        <Link
          href={`/product/${product.slug}`}
          className="product-card-shell__content-link"
          aria-label={`View ${product.name}`}
        >
          <span className="product-card-shell__artisan">{artisanLabel}</span>
          <h3 className="product-card-shell__name">{product.name}</h3>
          <div className="product-card-shell__pricing">
            <span className="product-card-shell__price">
              {isSoldOut ? "Sold Out" : formatKes(displayPrice)}
            </span>
            {hasSale ? (
              <span className="product-card-shell__original-price">{formatKes(originalPrice)}</span>
            ) : null}
          </div>
        </Link>
      </div>

      <style jsx>{`
        .product-card-shell {
          --cream: #fafaf8;
          --black: #080808;
          --dark: #1c1c1c;
          --brown: #8b5e3c;
          --border: rgba(0, 0, 0, 0.08);
          --card-bg: #f5f0eb;
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          color: var(--dark);
          background: transparent;
        }

        .product-card-shell__media {
          position: relative;
        }

        .product-card-shell__image-link,
        .product-card-shell__content-link {
          color: inherit;
          text-decoration: none;
        }

        .product-card-shell__image-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
          aspect-ratio: 1 / 1.25;
          background: var(--card-bg);
          border-radius: 0;
          flex-shrink: 0;
        }

        .product-card-shell__image {
          z-index: 1;
          background: transparent;
          transition:
            opacity 0.55s ease,
            transform 0.55s ease;
        }

        .product-card-shell__image--primary {
          opacity: ${showSecondaryImage ? 0 : 1};
        }

        .product-card-shell__image--secondary {
          z-index: 2;
          opacity: ${showSecondaryImage ? 1 : 0};
          transform: ${showSecondaryImage ? "scale(1)" : "scale(1.04)"};
        }

        .product-card-shell__cta {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: rgba(28, 28, 28, 0.88);
          color: #fff;
          font-size: 10px;
          letter-spacing: 3px;
          text-align: center;
          text-transform: uppercase;
          transition: transform 0.35s ease;
        }

        .product-card-shell__badges {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 4;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .product-card-shell__badge {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          justify-content: center;
          padding: 3px 8px;
          border-radius: 0;
          color: #fff;
          font-size: 8px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .product-card-shell__badge--new {
          background: var(--dark);
        }

        .product-card-shell__badge--sale {
          background: var(--brown);
        }

        .product-card-shell__wishlist {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 4;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          border: none;
          background: transparent;
          transition: color 0.3s ease;
          cursor: pointer;
        }

        .product-card-shell__wishlist :global(svg) {
          display: block;
          width: 16px;
          height: 16px;
        }

        .product-card-shell__dots {
          display: none;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 8px;
        }

        .product-card-shell__dot {
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: #ccc;
          transition: all 0.3s ease;
        }

        .product-card-shell__dot.is-active {
          width: 16px;
          height: 4px;
          border-radius: 2px;
          background: var(--dark);
        }

        .product-card-shell__content {
          padding: 12px 0 0;
        }

        .product-card-shell__artisan {
          display: block;
          margin-bottom: 4px;
          color: #bbb;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-card-shell__name {
          display: -webkit-box;
          margin: 0 0 5px;
          overflow: hidden;
          color: var(--dark);
          font-size: 12px;
          font-weight: 400;
          line-height: 1.4;
          letter-spacing: 0.3px;
          text-overflow: ellipsis;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .product-card-shell__pricing {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
        }

        .product-card-shell__price {
          color: var(--dark);
          font-size: 12px;
          font-weight: 500;
        }

        .product-card-shell__original-price {
          color: #ccc;
          font-size: 11px;
          text-decoration: line-through;
        }

        @media (max-width: 767px) {
          .product-card-shell__image {
            transition:
              opacity 0.4s ease,
              transform 0.4s ease;
          }

          .product-card-shell__cta {
            height: 36px;
            transform: translateY(0) !important;
            font-size: 9px;
          }

          .product-card-shell__dots {
            display: flex;
          }

          .product-card-shell__wishlist {
            color: rgba(255, 255, 255, 0.72) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .product-card-shell__image,
          .product-card-shell__cta,
          .product-card-shell__dot,
          .product-card-shell__wishlist {
            transition: none;
          }
        }
      `}</style>
    </article>
  );
}
