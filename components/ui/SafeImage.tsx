'use client';

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  type: "product" | "category" | "hero" | "artisan" | "square";
  className?: string;
  priority?: boolean;
}

const fallbacks = {
  product: "/images/product-fallback.jpg",
  category: "/images/category-fallback.jpg",
  hero: "/images/hero-fallback.jpg",
  artisan: "/images/artisan-fallback.jpg",
  square: "/images/square-fallback.jpg",
} as const;

const styles = {
  product: {
    objectFit: "contain" as const,
    objectPosition: "center",
    padding: "16px",
  },
  category: {
    objectFit: "cover" as const,
    objectPosition: "center",
  },
  hero: {
    objectFit: "cover" as const,
    objectPosition: "center top",
  },
  artisan: {
    objectFit: "cover" as const,
    objectPosition: "center top",
  },
  square: {
    objectFit: "contain" as const,
    objectPosition: "center",
    padding: "12px",
  },
} as const;

function normalizeSource(src: string | null | undefined): string | null {
  const safeSrc = String(src || "").trim().replace(/\\/g, "/");
  if (!safeSrc) return null;

  if (/^(?:https?:|data:|blob:)/i.test(safeSrc)) {
    return safeSrc;
  }

  if (safeSrc.startsWith("//")) {
    return `https:${safeSrc}`;
  }

  let normalized = safeSrc.replace(/^public\//i, "/");
  normalized = normalized.replace(/^(\.\/)+/, "");
  normalized = normalized.replace(/^(?:\.\.\/)+/, "");

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  return normalized.replace(/\/{2,}/g, "/");
}

export default function SafeImage({
  src,
  alt,
  type,
  className = "",
  priority = false,
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const normalizedSrc = useMemo(() => normalizeSource(src), [src]);

  useEffect(() => {
    setError(false);
  }, [normalizedSrc, type]);

  const imageSrc = error || !normalizedSrc ? fallbacks[type] : normalizedSrc;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      priority={priority}
      sizes={
        type === "hero"
          ? "100vw"
          : type === "category"
            ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            : type === "artisan"
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 768px) 50vw, 33vw"
      }
      style={styles[type]}
      onError={() => setError(true)}
      className={className}
    />
  );
}
