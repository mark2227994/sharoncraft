'use client';

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
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
  featured?: boolean;
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

function getStockStatus(product: ProductLike) {
  const stock = Math.max(0, Number(product.stock ?? 0));
  const isMadeToOrder =
    String((product as any).fulfillmentType || (product as any).fulfillment_type || "").toLowerCase() ===
    "made_to_order";

  if (isMadeToOrder) {
    return { label: "Made to order", color: "#F59E0B" };
  }

  if (stock === 0 || Boolean(product.isSold)) {
    return { label: "Out of stock", color: "#bbb" };
  }

  if (stock <= 2) {
    return { label: `Only ${stock} left`, color: "#E67E22" };
  }

  return { label: "In stock", color: "#2E7D32" };
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
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
  const hasSecondImage = Boolean(secondaryImage);

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
  const showNewBadge =
    Boolean(product.isNew || product.newArrival) ||
    String(product.badge || "").trim().toLowerCase() === "new";
  const showFeaturedBadge = Boolean(product.featured);
  const artisanLabel = normalizeArtisanLabel(product.artisan);
  const status = getStockStatus(product);
  const showSecondaryImage = hasSecondImage && (isCoarsePointer ? mobileImageIndex === 1 : hovered);

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
    if (!hasSecondImage || typeof window === "undefined") {
      return;
    }

    const image = new window.Image();
    image.src = secondaryImage as string;
  }, [hasSecondImage, secondaryImage]);

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
    <Link
      href={`/product/${product.slug}`}
      className="product-card-shell"
      data-variant={variant}
      aria-label={`View ${product.name}`}
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="product-card-shell__media">
        <div className="product-card-shell__image-wrap">
          {(showNewBadge || hasSale || showFeaturedBadge) ? (
            <div className="product-card-shell__badges">
              {showFeaturedBadge ? <span className="product-card-shell__badge">FEATURED</span> : null}
              {showNewBadge ? <span className="product-card-shell__badge">NEW</span> : null}
              {hasSale ? <span className="product-card-shell__badge">SALE</span> : null}
            </div>
          ) : null}

          {isSoldOut && !String((product as any).fulfillmentType || (product as any).fulfillment_type || "").includes("made_to_order") ? (
            <div className="product-card-shell__unavailable">
              <span>UNAVAILABLE</span>
            </div>
          ) : null}

          <SafeImage
            src={primaryImage}
            alt={product.name}
            type="product"
            className="product-card-shell__image product-card-shell__image--primary"
            priority={false}
          />

          {hasSecondImage ? (
            <SafeImage
              src={secondaryImage as string}
              alt={`${product.name} - alternate view`}
              type="product"
              className="product-card-shell__image product-card-shell__image--secondary"
              priority={false}
            />
          ) : null}
        </div>
      </div>

      {hasSecondImage ? (
        <div className="product-card-shell__dots" aria-hidden="true">
          <span className={`product-card-shell__dot${mobileImageIndex === 0 ? " is-active" : ""}`} />
          <span className={`product-card-shell__dot${mobileImageIndex === 1 ? " is-active" : ""}`} />
        </div>
      ) : null}

      <div className="product-card-shell__content">
        <span className="product-card-shell__artisan">{artisanLabel}</span>
        <h3 className="product-card-shell__name">{product.name}</h3>
        <div className="product-card-shell__pricing">
          <span className="product-card-shell__price">{isSoldOut ? "Sold Out" : formatKes(displayPrice)}</span>
          {hasSale ? <span className="product-card-shell__original-price">{formatKes(originalPrice)}</span> : null}
        </div>

        <div className="product-card-shell__status" aria-label={status.label}>
          <span className="product-card-shell__status-dot" style={{ background: status.color }} />
          <span className="product-card-shell__status-label" style={{ color: status.color }}>
            {status.label}
          </span>
        </div>
      </div>

    </Link>
  );
}

