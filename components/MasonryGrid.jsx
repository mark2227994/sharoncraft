import { useCallback, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";

function readMasonryGutter() {
  if (typeof window === "undefined") return 10;
  if (window.matchMedia("(max-width: 359px)").matches) return 0;
  if (window.matchMedia("(min-width: 640px)").matches) return 12;
  return 8;
}

export default function MasonryGrid({ products, animationKey }) {
  const gridRef = useRef(null);
  const masonryRef = useRef(null);
  const roRef = useRef(null);

  const initMasonry = useCallback(async () => {
    if (!gridRef.current) return;
    const Masonry = (await import("masonry-layout")).default;
    if (masonryRef.current) masonryRef.current.destroy();
    masonryRef.current = null;
    if (products.length === 0) return;

    const gutter = readMasonryGutter();
    masonryRef.current = new Masonry(gridRef.current, {
      itemSelector: ".masonry-item",
      columnWidth: ".masonry-sizer",
      percentPosition: true,
      gutter,
      transitionDuration: 0,
    });
    masonryRef.current.layout();
  }, [products.length]);

  const layoutWhenImagesReady = useCallback(() => {
    const grid = gridRef.current;
    const masonry = masonryRef.current;
    if (!grid || !masonry) return;

    const images = grid.querySelectorAll("img");
    let remaining = 0;
    const done = () => {
      remaining -= 1;
      if (remaining <= 0) masonry.layout();
    };

    images.forEach((img) => {
      if (img.complete && img.naturalWidth > 0) return;
      remaining += 1;
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });

    if (remaining === 0) masonry.layout();
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await initMasonry();
      if (cancelled) return;
      layoutWhenImagesReady();
    })();

    const onResize = () => {
      initMasonry().then(() => {
        if (!cancelled) layoutWhenImagesReady();
      });
    };

    window.addEventListener("resize", onResize);

    const grid = gridRef.current;
    if (grid && typeof ResizeObserver !== "undefined") {
      roRef.current = new ResizeObserver(() => {
        masonryRef.current?.layout();
      });
      roRef.current.observe(grid);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      roRef.current?.disconnect();
      roRef.current = null;
      if (masonryRef.current) masonryRef.current.destroy();
      masonryRef.current = null;
    };
  }, [animationKey, products.length, initMasonry, layoutWhenImagesReady]);

  return (
    <div className="masonry-grid-wrapper">
      <div ref={gridRef} className="masonry-grid">
        {products.length > 0 ? <div className="masonry-sizer" aria-hidden="true" /> : null}
        {products.length === 0 ? (
          <p className="masonry-empty">No pieces match these filters yet.</p>
        ) : (
          products.map((product, index) => (
            <div
              key={`${animationKey || "base"}-${product.id}`}
              className="masonry-item"
              style={{ animationDelay: `${Math.min(index, 20) * 35}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
