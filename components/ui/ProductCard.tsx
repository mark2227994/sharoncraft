'use client';

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { useCart } from "../../lib/cart-context";
import { resolveProductImageSource } from "../../lib/products";
import { getStockStatus } from "../../lib/utils";
import Image from "next/image";

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
  original_price?: number | null;
  image?: string | null;
  images?: ImageLike[];
  isSold?: boolean;
  stock?: number | null;
  stock_quantity?: number | null;
  badge?: string | null;
  featured?: boolean;
  newArrival?: boolean;
  isNew?: boolean;
  product_type?: string | null;
  productType?: string | null;
  fulfillmentType?: string | null;
  low_stock_alert?: number | null;
};

type ProductCardProps = {
  product?: ProductLike;
  id?: string;
  name?: string;
  price?: number;
  original_price?: number;
  images?: string[] | ImageLike[];
  artisan?: string | null;
  category?: string | null;
  slug?: string;
  is_new?: boolean;
  is_featured?: boolean;
  product_type?: string;
  stock_quantity?: number;
  low_stock_alert?: number;
  size?: 'default' | 'small' | 'large';
  showArtisan?: boolean;
  onOpen?: () => void;
  variant?: string;
};

const PLACEHOLDER_IMAGE = "/media/site/placeholder.svg";

function normalizeArtisanLabel(artisan: string | null | undefined): string {
  const safeArtisan = String(artisan || "SHARON").trim() || "SHARON";
  const withoutPrefix = safeArtisan.replace(/^by\s+/i, "").trim() || "SHARON";
  return `BY ${withoutPrefix.toUpperCase()}`;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" style={{ display: 'block' }}>
      <path
        d="M12 20.4 4.9 13.9C3.1 12.2 2 10.7 2 8.8 2 5.9 4.2 4 6.9 4c1.7 0 3.4.8 4.5 2.1C12.6 4.8 14.3 4 16 4 18.8 4 21 5.9 21 8.8c0 1.9-1.1 3.4-2.9 5.1L12 20.4Z"
        fill={filled ? "#C0392B" : "none"}
        stroke={filled ? "#C0392B" : "currentColor"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ display: 'block' }}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export default function ProductCard({
  product,
  id,
  name,
  price,
  original_price,
  images,
  artisan,
  category,
  slug,
  is_new,
  is_featured,
  product_type,
  stock_quantity,
  low_stock_alert,
  size = 'default',
  showArtisan = true,
  onOpen,
  variant = 'default',
}: ProductCardProps) {
  const { addToCart, openCart, isWishlisted, toggleWishlist } = useCart() as any;
  
  const [hovered, setHovered] = useState(false);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  
  const cardRef = useRef<HTMLElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isSwipingRef = useRef<boolean>(false);

  // Normalize inputs from either props or product object
  const p = product || ({} as Partial<ProductLike>);
  const safeId = id ?? p.id ?? '';
  const safeName = name ?? p.name ?? 'SharonCraft Piece';
  const safeSlug = slug ?? p.slug ?? safeId ?? 'piece';
  const artisanVal = artisan ?? p.artisan ?? null;
  const isNewVal = is_new ?? p.isNew ?? p.newArrival ?? (p.badge?.trim().toLowerCase() === 'new');
  const isFeaturedVal = is_featured ?? p.featured ?? false;

  const rawProductType = product_type ?? p.product_type ?? p.productType ?? p.fulfillmentType ?? 'ready_to_ship';
  const stockQuantity = stock_quantity ?? p.stock ?? p.stock_quantity ?? 1;
  const lowStockAlert = low_stock_alert ?? p.low_stock_alert ?? 2;

  // Pricing calculations
  const basePrice = Math.max(0, Number(price ?? p.price ?? 0));
  const salePrice = Math.max(0, Number(p.sale_price ?? 0));
  const originalPriceCandidate = Math.max(0, Number(original_price ?? p.originalPrice ?? p.original_price ?? 0));
  
  let displayPrice = basePrice;
  let originalPrice = originalPriceCandidate;

  if (salePrice > 0 && salePrice < basePrice) {
    displayPrice = salePrice;
    originalPrice = basePrice;
  } else if (originalPriceCandidate > basePrice) {
    displayPrice = basePrice;
    originalPrice = originalPriceCandidate;
  } else {
    displayPrice = basePrice;
    originalPrice = 0;
  }

  // Stock status using utils helper
  const statusProductObj = useMemo(() => ({
    product_type: rawProductType,
    stock_quantity: stockQuantity,
    low_stock_alert: lowStockAlert,
  }), [rawProductType, stockQuantity, lowStockAlert]);
  
  const stockStatus = useMemo(() => getStockStatus(statusProductObj), [statusProductObj]);

  const customStatusColor = useMemo(() => {
    if (stockStatus.type === 'mto') return '#8B5E3C'; // Clay/terracotta
    if (stockStatus.type === 'out') return '#666666'; // Gray
    if (stockStatus.type === 'low') return '#D35400'; // Orange
    return '#2E7D32'; // Forest Green
  }, [stockStatus.type]);

  const isSoldOut = stockStatus.isOutOfStock || Boolean(p.isSold);
  const hasSale = originalPrice > displayPrice && !isSoldOut;
  const salePercent = hasSale ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  const showNewBadge = isNewVal && !hasSale;

  const artisanLabel = normalizeArtisanLabel(artisanVal);
  const saved = isWishlisted(safeId);

  // Image calculations
  const imageSources = useMemo(() => {
    const rawVal = images ?? p.images ?? (p.image ? [p.image] : []);
    const sources = (Array.isArray(rawVal) ? rawVal.map(resolveProductImageSource) : [])
      .filter((value): value is string => Boolean(value));
    
    const deduped = Array.from(new Set(sources));
    return deduped.length > 0 ? deduped : [PLACEHOLDER_IMAGE];
  }, [images, p.images, p.image]);

  const primaryImage = imageSources[0] || PLACEHOLDER_IMAGE;
  const secondaryImage = imageSources[1] || null;
  const hasSecondImage = imageSources.length > 1;
  const showSecondaryImage = hasSecondImage && (isCoarsePointer ? mobileImageIndex === 1 : hovered);

  // Lazy loading intersection observer
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
      { rootMargin: "160px 0px", threshold: 0.1 }
    );

    observer.observe(current);
    return () => observer.disconnect();
  }, []);

  // Coarse pointer detection (touchscreen vs mouse hover)
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

  // Preload secondary image on hover
  useEffect(() => {
    if (!isInView || !hasSecondImage || !secondaryImage || typeof window === "undefined") {
      return;
    }
    const imageObj = new window.Image();
    imageObj.src = secondaryImage;
  }, [hasSecondImage, isInView, secondaryImage]);

  // Event handlers
  function handleToggleWishlist(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist({
      id: safeId,
      slug: safeSlug,
      name: safeName,
      artisan: artisanVal,
      price: displayPrice,
      originalPrice: originalPrice || undefined,
      image: primaryImage,
      images: imageSources,
      stock: stockQuantity,
      isSold: isSoldOut,
      isNew: isNewVal,
      featured: isFeaturedVal,
    });
  }

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    
    if (isSoldOut) return;
    
    addToCart({
      id: safeId,
      slug: safeSlug,
      name: safeName,
      artisan: artisanVal,
      price: displayPrice,
      originalPrice: originalPrice || undefined,
      image: primaryImage,
      images: imageSources,
      stock: stockQuantity,
      isSold: isSoldOut,
      isNew: isNewVal,
      featured: isFeaturedVal,
    });
    openCart();
  }

  function handleTouchStart(event: TouchEvent<HTMLAnchorElement>) {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
    touchStartYRef.current = event.changedTouches[0]?.clientY ?? null;
    isSwipingRef.current = false;
  }

  function handleTouchEnd(event: TouchEvent<HTMLAnchorElement>) {
    if (!hasSecondImage || touchStartXRef.current === null || touchStartYRef.current === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const touchEndY = event.changedTouches[0]?.clientY ?? touchStartYRef.current;
    
    const deltaX = touchStartXRef.current - touchEndX;
    const deltaY = touchStartYRef.current - touchEndY;

    // Detect horizontal swipe: if horizontal movement is larger than vertical and exceeds 30px
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwipingRef.current = true;
      if (deltaX > 0) {
        setMobileImageIndex(1);
      } else {
        setMobileImageIndex(0);
      }
    }
    
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  }

  function handleLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (isSwipingRef.current) {
      event.preventDefault();
      event.stopPropagation();
      isSwipingRef.current = false;
      return;
    }
    if (onOpen) {
      onOpen();
    }
  }

  return (
    <article
      ref={cardRef}
      className="product-card-shell"
      data-variant={variant}
      onMouseEnter={() => {
        if (!isCoarsePointer) setHovered(true);
      }}
      onMouseLeave={() => {
        if (!isCoarsePointer) setHovered(false);
      }}
    >
      <div className="product-card-shell__media">
        <Link
          href={`/product/${safeSlug}`}
          className="product-card-shell__image-link"
          aria-label={`View ${safeName}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleLinkClick}
        >
          <div className="product-card-shell__image-wrap">
            {showNewBadge || hasSale || isFeaturedVal ? (
              <div className="product-card-shell__badges">
                {isFeaturedVal ? (
                  <span className="product-card-shell__badge product-card-shell__badge--featured">
                    Featured
                  </span>
                ) : null}
                {showNewBadge ? (
                  <span className="product-card-shell__badge product-card-shell__badge--new">New</span>
                ) : null}
                {hasSale ? (
                  <span className="product-card-shell__badge product-card-shell__badge--sale">
                    Save {salePercent}%
                  </span>
                ) : null}
              </div>
            ) : null}

            {isSoldOut ? (
              <div className="product-card-shell__sold-overlay">
                <span className="product-card-shell__sold-text">Sold Out</span>
              </div>
            ) : null}

            {isInView ? (
              <Image
                src={primaryImage}
                alt={safeName}
                fill
                quality={76}
                sizes="(max-width: 767px) 50vw, 33vw"
                className={`product-card-shell__image product-card-shell__image--primary ${showSecondaryImage ? "is-hidden" : ""} ${hovered ? "is-hovered" : ""}`}
                style={{ objectFit: 'contain', objectPosition: 'center', padding: '16px' }}
                priority={false}
                onError={() => {}}
              />
            ) : (
              <div className="product-card-shell__placeholder" />
            )}

            {hasSecondImage && secondaryImage && isInView ? (
              <Image
                src={secondaryImage}
                alt={`${safeName} - alternate view`}
                fill
                quality={76}
                sizes="(max-width: 767px) 50vw, 33vw"
                className={`product-card-shell__image product-card-shell__image--secondary ${showSecondaryImage ? "is-visible" : ""} ${hovered ? "is-hovered" : ""}`}
                style={{ objectFit: 'contain', objectPosition: 'center', padding: '16px' }}
                priority={false}
                onError={() => {}}
              />
            ) : null}

            {/* Desktop Add to Cart Hover Overlay */}
            {!isCoarsePointer && (
              <button
                type="button"
                className="product-card-shell__cta"
                onClick={handleAddToCart}
                disabled={isSoldOut}
              >
                {isSoldOut ? "SOLD OUT" : "ADD TO CART"}
              </button>
            )}
          </div>
        </Link>

        {/* Wishlist Heart Icon Button */}
        <button
          type="button"
          className={`product-card-shell__wishlist ${saved ? 'is-saved' : ''}`}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          onClick={handleToggleWishlist}
        >
          <HeartIcon filled={saved} />
        </button>

        {/* Mobile Quick Cart Icon Button */}
        {isCoarsePointer && !isSoldOut && (
          <button
            type="button"
            className="product-card-shell__quick-cart"
            aria-label="Add to cart"
            onClick={handleAddToCart}
          >
            <CartIcon />
          </button>
        )}
      </div>

      {hasSecondImage ? (
        <div className="product-card-shell__dots" aria-hidden="true">
          <span className={`product-card-shell__dot ${mobileImageIndex === 0 ? "is-active" : ""}`} />
          <span className={`product-card-shell__dot ${mobileImageIndex === 1 ? "is-active" : ""}`} />
        </div>
      ) : null}

      <div className="product-card-shell__content">
        <Link
          href={`/product/${safeSlug}`}
          className="product-card-shell__content-link"
          aria-label={`View ${safeName}`}
          onClick={onOpen}
        >
          {showArtisan && artisanVal ? (
            <span className="product-card-shell__artisan">{artisanLabel}</span>
          ) : null}
          
          <h3 className="product-card-shell__name" title={safeName}>{safeName}</h3>
          
          <div className="product-card-shell__pricing">
            <span className="product-card-shell__price">
              {isSoldOut ? "Sold Out" : `KES ${displayPrice.toLocaleString("en-KE")}`}
            </span>
            {hasSale && originalPrice > 0 ? (
              <>
                <span className="product-card-shell__original-price">
                  KES {originalPrice.toLocaleString("en-KE")}
                </span>
                <span className="product-card-shell__save-amount">
                  Save KES {(originalPrice - displayPrice).toLocaleString("en-KE")}
                </span>
              </>
            ) : null}
          </div>

          {/* Fulfillment stock status label */}
          {size !== 'small' ? (
            <div className="product-card-shell__status-row">
              <span className="product-card-shell__status-dot" style={{ background: customStatusColor }} />
              <span className="product-card-shell__status-text" style={{ color: customStatusColor }}>
                {stockStatus.label}
              </span>
            </div>
          ) : null}
        </Link>
      </div>

      <style jsx>{`
        .product-card-shell {
          --cream: #fafaf8;
          --black: #080808;
          --dark: #1c1c1c;
          --brown: #8b5e3c;
          --border: rgba(96, 52, 20, 0.125);
          --card-bg: #f5f0eb;
          
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          color: var(--dark);
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 6px;
          box-shadow: ${hovered ? '0 12px 28px rgba(96, 52, 20, 0.08)' : '0 4px 14px rgba(96, 52, 20, 0.02)'};
          transform: ${hovered ? 'translateY(-4px)' : 'translateY(0)'};
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          overflow: hidden;
        }

        .product-card-shell__media {
          position: relative;
          width: 100%;
          overflow: hidden;
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
          aspect-ratio: ${size === 'small' ? '1 / 1.2' : size === 'large' ? '1 / 1.35' : '1 / 1.25'};
          background: var(--card-bg);
          border-radius: 0;
          flex-shrink: 0;
        }

        .product-card-shell__placeholder {
          width: 100%;
          height: 100%;
          background: var(--card-bg);
        }

        .product-card-shell__image-wrap :global(.product-card-shell__image) {
          z-index: 1;
          background: transparent;
          opacity: 1 !important;
          transform: scale(1);
          transition: opacity 0.55s ease, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .product-card-shell__image-wrap :global(.product-card-shell__image--primary) {
          z-index: 1;
        }

        .product-card-shell__image-wrap :global(.product-card-shell__image--primary.is-hidden) {
          opacity: 0 !important;
        }

        .product-card-shell__image-wrap :global(.product-card-shell__image--secondary) {
          z-index: 2 !important;
          opacity: 0 !important;
          transform: scale(1.04);
        }

        .product-card-shell__image-wrap :global(.product-card-shell__image--secondary.is-visible) {
          opacity: 1 !important;
          transform: scale(1);
        }

        .product-card-shell__image-wrap :global(.product-card-shell__image.is-hovered) {
          transform: scale(1.04) !important;
        }

        .product-card-shell__image-wrap :global(.product-card-shell__image--secondary.is-visible.is-hovered) {
          transform: scale(1.04) !important;
        }

        .product-card-shell__sold-overlay {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(250, 250, 248, 0.72);
          pointer-events: none;
        }

        .product-card-shell__sold-text {
          background: #ffffff;
          border: 0.5px solid #e0e0e0;
          color: #bbb;
          font-size: 9px;
          letter-spacing: 2px;
          padding: 6px 14px;
          text-transform: uppercase;
        }

        .product-card-shell__cta {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          padding: 0;
          border: none;
          background: rgba(28, 28, 28, 0.92);
          color: #ffffff;
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-align: center;
          text-transform: uppercase;
          cursor: pointer;
          transform: ${hovered ? "translateY(0)" : "translateY(100%)"};
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
        }

        .product-card-shell__cta:hover {
          background: #000000;
        }

        .product-card-shell__cta:disabled {
          background: rgba(120, 120, 120, 0.92);
          cursor: not-allowed;
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
          padding: 4px 10px;
          background: rgba(252, 250, 247, 0.92);
          border: 1px solid rgba(139, 94, 60, 0.15);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: var(--dark);
          font-size: 8px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          border-radius: 2px;
        }

        .product-card-shell__badge--featured {
          color: var(--brown);
          border-color: rgba(139, 94, 60, 0.35);
        }

        .product-card-shell__badge--sale {
          color: #C0392B;
          border-color: rgba(192, 57, 43, 0.25);
        }

        .product-card-shell__wishlist {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          padding: 0;
          border: 1px solid rgba(96, 52, 20, 0.08);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          color: rgba(28, 28, 28, 0.6);
          transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease, opacity 0.25s ease;
          cursor: pointer;
          opacity: ${hovered ? 1 : 0};
        }

        .product-card-shell__wishlist.is-saved {
          opacity: 1;
          color: #C0392B;
          background: #ffffff;
        }

        .product-card-shell__wishlist:hover {
          transform: scale(1.05);
          background: #ffffff;
          color: #C0392B;
        }

        .product-card-shell__wishlist:active :global(svg) {
          animation: heartPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Mobile Quick Cart Button */
        .product-card-shell__quick-cart {
          position: absolute;
          bottom: 10px;
          right: 10px;
          z-index: 5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid rgba(96, 52, 20, 0.08);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          color: rgba(28, 28, 28, 0.75);
          transition: transform 0.2s ease, background 0.2s ease;
          cursor: pointer;
        }

        .product-card-shell__quick-cart:hover {
          transform: scale(1.05);
          background: #ffffff;
          color: var(--brown);
        }

        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1); }
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
          width: 14px;
          height: 4px;
          border-radius: 2px;
          background: var(--dark);
        }

        .product-card-shell__content {
          padding: ${size === 'small' ? '8px 10px 10px' : '12px 14px 14px'};
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .product-card-shell__artisan {
          display: block;
          margin-bottom: 2px;
          color: rgba(28, 28, 28, 0.65);
          font-size: ${size === 'small' ? '8.5px' : '10px'};
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .product-card-shell__name {
          display: -webkit-box;
          margin: 0;
          overflow: hidden;
          color: var(--dark);
          font-size: ${size === 'small' ? '12px' : '14px'};
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: 0.2px;
          text-overflow: ellipsis;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          min-height: 2.8em;
        }

        .product-card-shell__pricing {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 2px;
        }

        .product-card-shell__price {
          color: ${hasSale ? '#C0392B' : hovered ? '#8B5E3C' : 'var(--dark)'};
          font-size: ${size === 'small' ? '12px' : '14px'};
          font-weight: 700;
          transition: color 0.3s ease;
        }

        .product-card-shell__original-price {
          color: rgba(28, 28, 28, 0.45);
          font-size: 11px;
          text-decoration: line-through;
        }

        .product-card-shell__save-amount {
          color: var(--brown);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .product-card-shell__status-row {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 6px;
        }

        .product-card-shell__status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .product-card-shell__status-text {
          font-size: ${size === 'small' ? '8.5px' : '10px'};
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 600;
        }

        @media (max-width: 767px) {
          .product-card-shell {
            box-shadow: 0 4px 12px rgba(96, 52, 20, 0.02);
            transform: none !important;
          }

          .product-card-shell__image {
            transition: opacity 0.4s ease, transform 0.4s ease;
          }

          .product-card-shell__dots {
            display: flex;
          }

          .product-card-shell__wishlist {
            opacity: 1 !important;
            width: 36px;
            height: 36px;
          }

          .product-card-shell__artisan {
            font-size: 9px;
          }

          .product-card-shell__name {
            font-size: 12px;
          }

          .product-card-shell__price {
            font-size: 12.5px;
          }

          .product-card-shell__status-text {
            font-size: 9px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .product-card-shell,
          .product-card-shell__image,
          .product-card-shell__cta,
          .product-card-shell__dot,
          .product-card-shell__wishlist,
          .product-card-shell__quick-cart {
            transition: none;
            transform: none !important;
          }
        }
      `}</style>
    </article>
  );
}
