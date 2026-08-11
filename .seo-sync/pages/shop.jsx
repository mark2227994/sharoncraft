import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import ProductCard from "@/components/ui/ProductCard";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import CardWrapper from "@/components/ui/CardWrapper";
import SeoHead from "../components/SeoHead";
import ShopSidebar from "../components/ShopSidebar";
import {
  buildShopHref,
} from "@/lib/categories";
import {
  getProductCardImages,
  getProductCardIsNew,
  getProductCardPricing,
  getProductCardSlug,
  getProductCardStockQuantity,
  getProductCardType,
} from "../lib/product-card";
import {
  flattenShopNodes,
  ITEMS_PER_PAGE,
  normalizeAvailabilityValue,
  normalizePageValue,
  normalizePriceRangeValue,
  normalizeProductTypeValue,
  normalizeSortValue,
  SHOP_SORT_OPTIONS,
} from "../lib/shop-utils";

const RANGE_DASH = "\u2013";
const CHEVRON = "\u203A";
const RECENTLY_VIEWED_KEY = "sc_recently_viewed";

const CATEGORY_HERO_MEDIA = {
  Jewellery: "/media/products/Jewellery.jpg",
  Accessories: "/media/site/collections/ai-explore-gift-path.webp",
  "African Wear": "/media/site/homepage/ai-intent-wear-it.webp",
  "Home & Living": "/media/site/collections/ai-intent-style-home.webp",
  "Art & Craft": "/media/site/artisans/Gemini_Generated_Image_dvxjjhdvxjjhdvxj.png",
  "Gifted Carry": "/media/site/homepage/ai-intent-gift-it.webp",
};

function EmptyStateIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="shop-page__empty-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <circle cx="24" cy="24" r="17" />
      <path d="M15.5 32.5l17-17" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="shop-toolbar__filter-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="square"
    >
      <path d="M4 7h16" />
      <path d="M7 12h10" />
      <path d="M10 17h4" />
    </svg>
  );
}

function formatKes(value) {
  return `KES ${Number(value || 0).toLocaleString("en-KE")}`;
}

function getCategoryHeroImage(categoryId, categoryHeroOverrides = {}) {
  return categoryHeroOverrides[categoryId] || CATEGORY_HERO_MEDIA[categoryId] || null;
}

function getStockState(product) {
  if (product?.isSold || Number(product?.stock || 0) <= 0) {
    return {
      key: "out_of_stock",
      label: "Out of Stock",
      dot: "#cccccc",
      desktopBadge: "",
      mobileClass: "product-card__status-pill--out",
    };
  }

  if (
    product?.fulfillmentType === "made_to_order" ||
    product?.fulfillmentType === "custom_order"
  ) {
    return {
      key: "made_to_order",
      label: "Made to Order",
      dot: "#F59E0B",
      desktopBadge: "",
      mobileClass: "product-card__status-pill--made",
    };
  }

  return {
    key: "in_stock",
    label: "In Stock",
    dot: "#2E7D32",
    desktopBadge: "Ready to Ship",
    mobileClass: "product-card__status-pill--stock",
  };
}

function toRecentlyViewedProduct(product) {
  return {
    id: product?.id,
    slug: product?.slug,
    name: product?.name,
    artisan: product?.artisan,
    price: product?.price,
    originalPrice: product?.originalPrice,
    image: product?.image,
    images: product?.images,
    stock: product?.stock,
    isSold: product?.isSold,
    isNew: product?.isNew,
    newArrival: product?.newArrival,
    badge: product?.badge,
    fulfillmentType: product?.fulfillmentType,
  };
}

function getRecentlyViewedImage(product) {
  if (Array.isArray(product?.images) && product.images[0]) {
    return typeof product.images[0] === "string"
      ? product.images[0]
      : product.images[0]?.src || product?.image || "/media/site/placeholder.svg";
  }

  return product?.image || "/media/site/placeholder.svg";
}

function getHeroTitle(categoryNode) {
  if (!categoryNode || categoryNode.id === "all") {
    return "The Collection";
  }

  return categoryNode.label;
}

function getPageNumbers(currentPage, totalPages) {
  const maxPagesToShow = 5;

  if (totalPages <= maxPagesToShow) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) pages.push("ellipsis-start");
  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }
  if (endPage < totalPages - 1) pages.push("ellipsis-end");
  pages.push(totalPages);

  return pages;
}

function buildApiParams({
  activeCategory,
  activeCategoryNode,
  activeSubcategory,
  activeSubcategoryNode,
  availability,
  activePriceRange,
  activeProductType,
  sortBy,
  currentPage,
}) {
  const params = {};

  if (activeCategory !== "all") {
    params.category =
      activeCategoryNode?.queryValue || activeCategoryNode?.label || activeCategory;
  }

  if (activeSubcategory && activeSubcategoryNode) {
    params.subcategory =
      activeSubcategoryNode.queryValue ||
      activeSubcategoryNode.label ||
      activeSubcategory;
  }

  if (availability === "in_stock") {
    params.availability = "in_stock";
  }

  if (activePriceRange !== "all") {
    params.price = activePriceRange;
  }

  if (activeProductType !== "all") {
    params.productType = activeProductType;
  }

  if (sortBy !== "featured") {
    params.sort = sortBy;
  }

  if (currentPage > 1) {
    params.page = String(currentPage);
  }

  return params;
}

function buildBrowserUrl({
  activeCategoryNode,
  activeSubcategoryNode,
  availability,
  activePriceRange,
  activeProductType,
  sortBy,
  currentPage,
}) {
  const basePath = buildShopHref(
    activeCategoryNode?.id === "all" ? "" : activeCategoryNode?.label,
    activeSubcategoryNode?.label || "",
  );
  const params = new URLSearchParams();

  if (availability === "in_stock") {
    params.set("availability", "in_stock");
  }

  if (activePriceRange !== "all") {
    params.set("price", activePriceRange);
  }

  if (activeProductType !== "all") {
    params.set("productType", activeProductType);
  }

  if (sortBy !== "featured") {
    params.set("sort", sortBy);
  }

  if (currentPage > 1) {
    params.set("page", String(currentPage));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function ShopPage({
  initialProducts,
  initialTotalCount,
  initialCategory,
  initialSubcategory,
  initialAvailability,
  initialPriceRange,
  initialProductType,
  initialSort,
  initialPage,
  categoryTree,
  categoryHeroOverrides,
  canonicalPath,
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory);
  const [availability, setAvailability] = useState(initialAvailability);
  const [activePriceRange, setActivePriceRange] = useState(initialPriceRange);
  const [activeProductType, setActiveProductType] = useState(initialProductType);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGridLoading, setIsGridLoading] = useState(false);
  const [shopProducts, setShopProducts] = useState(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [heroMedia, setHeroMedia] = useState(() => ({
    current: getCategoryHeroImage(initialCategory, categoryHeroOverrides),
    previous: null,
  }));
  const gridAnimationFrame = useRef(null);
  const firstRequestRef = useRef(true);

  const normalizedCategoryTree = useMemo(() => categoryTree, [categoryTree]);
  const flatShopNodes = useMemo(
    () => flattenShopNodes(normalizedCategoryTree),
    [normalizedCategoryTree],
  );
  const shopNodeById = useMemo(
    () => new Map(flatShopNodes.map((node) => [node.id, node])),
    [flatShopNodes],
  );
  const topLevelNodeByLabel = useMemo(
    () => new Map(normalizedCategoryTree.map((node) => [node.label, node])),
    [normalizedCategoryTree],
  );
  const productLookup = useMemo(
    () => new Map(shopProducts.map((product) => [product.id, product])),
    [shopProducts],
  );

  const activeCategoryNode =
    shopNodeById.get(activeCategory) || shopNodeById.get("all");
  const activeSubcategoryNode = activeSubcategory
    ? shopNodeById.get(activeSubcategory)
    : null;
  const heroTitle = getHeroTitle(activeCategoryNode);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    document.body.classList.add("shop-page--boutique");
    return () => document.body.classList.remove("shop-page--boutique");
  }, []);

  useEffect(() => {
    if (!isMobile || !isFilterOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFilterOpen, isMobile]);

  useEffect(() => {
    const nextHeroImage = getCategoryHeroImage(activeCategory, categoryHeroOverrides);
    setHeroMedia((currentState) => {
      if (currentState.current === nextHeroImage) {
        return currentState;
      }

      return {
        current: nextHeroImage,
        previous: currentState.current,
      };
    });

    const timeoutId = window.setTimeout(() => {
      setHeroMedia((currentState) => ({
        ...currentState,
        previous: null,
      }));
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [activeCategory, categoryHeroOverrides]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const showingFrom =
    totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingTo =
    totalCount === 0
      ? 0
      : Math.min(currentPage * ITEMS_PER_PAGE, totalCount);
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const gridTransitionKey = [
    activeCategory,
    activeSubcategory,
    availability,
    activePriceRange,
    activeProductType,
    sortBy,
    currentPage,
  ].join("|");
  const hasActiveFilters =
    activeCategory !== "all" ||
    Boolean(activeSubcategory) ||
    availability !== "all" ||
    activePriceRange !== "all" ||
    activeProductType !== "all" ||
    sortBy !== "featured";

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const stored = JSON.parse(
      window.localStorage.getItem(RECENTLY_VIEWED_KEY) ?? "[]",
    );

    const hydrated = stored
      .map((item) => productLookup.get(item?.id) || item)
      .filter((item) => item?.id);

    setRecentlyViewed(hydrated);
    return undefined;
  }, [productLookup]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    if (gridAnimationFrame.current) {
      window.clearTimeout(gridAnimationFrame.current);
    }

    if (!isGridLoading) {
      gridAnimationFrame.current = window.setTimeout(() => {
        const cards = document.querySelectorAll(".shop-grid .product-card");
        cards.forEach((card, index) => {
          card.style.opacity = "0";
          card.style.transform = "translateY(12px)";

          window.setTimeout(() => {
            card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, index * 50);
        });
      }, 30);
    }

    return () => {
      if (gridAnimationFrame.current) {
        window.clearTimeout(gridAnimationFrame.current);
      }
    };
  }, [gridTransitionKey, isGridLoading]);

  useEffect(() => {
    if (firstRequestRef.current) {
      firstRequestRef.current = false;
      return undefined;
    }

    let isActive = true;
    const controller = new AbortController();

    async function loadProducts() {
      setIsGridLoading(true);

      try {
        const params = buildApiParams({
          activeCategory,
          activeCategoryNode,
          activeSubcategory,
          activeSubcategoryNode,
          availability,
          activePriceRange,
          activeProductType,
          sortBy,
          currentPage,
        });

        const search = new URLSearchParams(params).toString();
        const response = await fetch(`/api/shop/products?${search}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Shop fetch failed with ${response.status}`);
        }

        const payload = await response.json();

        if (!isActive) return;

        setShopProducts(Array.isArray(payload.products) ? payload.products : []);
        setTotalCount(Number(payload.totalCount || 0));
      } catch (error) {
        if (!isActive || error?.name === "AbortError") {
          return;
        }

        console.error("Failed to refresh shop products.", error);
      } finally {
        if (isActive) {
          setIsGridLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    activeCategory,
    activeCategoryNode,
    activePriceRange,
    activeProductType,
    activeSubcategory,
    activeSubcategoryNode,
    availability,
    currentPage,
    sortBy,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const nextPath = buildBrowserUrl({
      activeCategoryNode,
      activeSubcategoryNode,
      availability,
      activePriceRange,
      activeProductType,
      sortBy,
      currentPage,
    });
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (nextPath !== currentPath) {
      window.history.pushState({}, "", nextPath);
    }

    return undefined;
  }, [
    activeCategory,
    activeCategoryNode,
    activePriceRange,
    activeProductType,
    activeSubcategory,
    activeSubcategoryNode,
    availability,
    currentPage,
    sortBy,
  ]);

  function updateCategory(categoryId) {
    setActiveCategory(categoryId);
    setActiveSubcategory("");
    setCurrentPage(1);
  }

  function updateSubcategory(subcategoryId, parentId) {
    setActiveCategory(parentId);
    setActiveSubcategory(subcategoryId);
    setCurrentPage(1);
  }

  function updateAvailability(nextAvailability) {
    setAvailability(nextAvailability);
    setCurrentPage(1);
  }

  function updatePriceRange(nextPriceRange) {
    setActivePriceRange(nextPriceRange);
    setCurrentPage(1);
  }

  function updateProductType(nextProductType) {
    setActiveProductType(nextProductType);
    setCurrentPage(1);
  }

  function updateSort(nextSort) {
    setSortBy(nextSort);
    setCurrentPage(1);
  }

  function updatePage(nextPage) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;

    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearAllFilters() {
    setActiveCategory("all");
    setActiveSubcategory("");
    setAvailability("all");
    setActivePriceRange("all");
    setActiveProductType("all");
    setSortBy("featured");
    setCurrentPage(1);
    setIsFilterOpen(false);
  }

  function handleTopLevelTab(label) {
    const node = topLevelNodeByLabel.get(label);
    if (!node) return;
    updateCategory(node.id);
  }

  function handleProductOpen(product) {
    if (typeof window === "undefined" || !product?.id) return;

    const payload = toRecentlyViewedProduct(product);
    const existing = JSON.parse(
      window.localStorage.getItem(RECENTLY_VIEWED_KEY) ?? "[]",
    );
    const filtered = existing.filter((item) => item?.id !== payload.id);
    const updated = [payload, ...filtered].slice(0, 8);

    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    setRecentlyViewed(updated);
  }

  function clearRecentlyViewed() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(RECENTLY_VIEWED_KEY);
    }

    setRecentlyViewed([]);
  }

  const heroCountText = `${totalCount.toLocaleString("en-KE")} ${
    totalCount === 1 ? "PIECE" : "PIECES"
  }`;
  const countText = `${totalCount.toLocaleString("en-KE")} PIECES FOUND`;
  const skeletonCount = isMobile ? 4 : 6;

  const categoryTitle = activeSubcategory
    ? activeSubcategory
    : activeCategory !== "all"
    ? Array.from(topLevelNodeByLabel.keys()).find(label => topLevelNodeByLabel.get(label)?.id === activeCategory) || "Shop"
    : "Shop";

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryTitle,
    description: `Browse ${categoryTitle.toLowerCase()} handmade items from SharonCraft.`,
    url: `https://www.sharoncraft.co.ke${canonicalPath || "/shop"}`,
  };

  return (
    <>
      <SeoHead
        title={
          categoryTitle === 'Shop'
            ? 'Shop Handmade Jewelry Kenya'
            : `${categoryTitle} | SharonCraft`
        }
        description={
          categoryTitle === 'Shop'
            ? 'Browse handmade Maasai jewelry and Kenyan accessories. Earrings from KES 800, necklaces, bracelets, beaded sandals. Ships Kenya-wide.'
            : `Browse ${categoryTitle?.toLowerCase()} handmade items from SharonCraft. Made to order. Ships Kenya-wide.`
        }
        keywords={`${categoryTitle?.toLowerCase() || 'handmade'} Kenya, handmade ${categoryTitle?.toLowerCase() || 'products'}, Maasai jewelry, artisan gifts, Kenyan handcrafts, SharonCraft`}
        path={canonicalPath || "/shop"}
        structuredData={[collectionSchema]}
      />

      <Nav />

      <main className="shop-page">
        <section className="shop-hero" aria-label="Shop category hero">
          <div className="shop-hero__media">
            {heroMedia.previous ? (
              <div className="shop-hero__layer shop-hero__layer--previous">
                <Image
                  src={heroMedia.previous}
                  alt=""
                  fill
                  priority={false}
                  sizes="100vw"
                  className="shop-hero__image"
                />
              </div>
            ) : null}

            {heroMedia.current ? (
              <div className="shop-hero__layer shop-hero__layer--current">
                <Image
                  src={heroMedia.current}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="shop-hero__image"
                />
              </div>
            ) : (
              <div className="shop-hero__gradient" aria-hidden="true" />
            )}

            <div className="shop-hero__overlay" aria-hidden="true" />
            <div className="shop-hero__pattern" aria-hidden="true" />
          </div>

          <div
            className="shop-hero__content"
            key={`${activeCategory}-${activeSubcategory}-${totalCount}`}
          >
            <p className="shop-hero__breadcrumb">
              <Link href="/">Home</Link>
              <span>{CHEVRON}</span>
              <span>Shop</span>
              {activeCategory !== "all" ? (
                <>
                  <span>{CHEVRON}</span>
                  <span>{activeCategoryNode?.label}</span>
                </>
              ) : null}
            </p>
            <h1 className="shop-hero__title">{heroTitle}</h1>
            <p className="shop-hero__count">{heroCountText}</p>
          </div>
        </section>

        <section className="shop-tabs" aria-label="Shop categories">
          <div className="shop-tabs__scroll">
            {normalizedCategoryTree.map((node) => {
              const isActive = activeCategory === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  className={`shop-tabs__tab ${
                    isActive ? "shop-tabs__tab--active" : ""
                  }`}
                  onClick={() => handleTopLevelTab(node.label)}
                >
                  {node.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="shop-toolbar">
          <div className="shop-toolbar__left">
            <p className="shop-toolbar__count">{countText}</p>
            <button
              type="button"
              className="shop-toolbar__filter-button"
              aria-expanded={isFilterOpen}
              aria-controls="shop-filters-drawer"
              onClick={() => setIsFilterOpen(true)}
            >
              <FilterIcon />
              <span>Filter</span>
            </button>
          </div>

          <div className="shop-toolbar__right">
            <div className="shop-toolbar__sort-links" aria-label="Sort options">
              {SHOP_SORT_OPTIONS.map((option, index) => (
                <div key={option.value} className="shop-toolbar__sort-item">
                  <button
                    type="button"
                    className={`shop-toolbar__sort-link ${
                      sortBy === option.value
                        ? "shop-toolbar__sort-link--active"
                        : ""
                    }`}
                    onClick={() => updateSort(option.value)}
                  >
                    {option.label}
                  </button>
                  {index < SHOP_SORT_OPTIONS.length - 1 ? (
                    <span className="shop-toolbar__sort-separator">|</span>
                  ) : null}
                </div>
              ))}
            </div>

            <label className="shop-toolbar__mobile-sort">
              <span className="shop-toolbar__mobile-sort-label">Sort</span>
              <select
                value={sortBy}
                onChange={(event) => updateSort(event.target.value)}
                aria-label="Sort pieces"
              >
                {SHOP_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="shop-page__shell">
          <div className="shop-page__layout">
            <ShopSidebar
              categoryTree={normalizedCategoryTree}
              activeCategory={activeCategory}
              onCategoryChange={updateCategory}
              activeSubcategory={activeSubcategory}
              onSubcategoryChange={updateSubcategory}
              availability={availability}
              onAvailabilityChange={updateAvailability}
              activePriceRange={activePriceRange}
              onPriceRangeChange={updatePriceRange}
              activeProductType={activeProductType}
              onProductTypeChange={updateProductType}
              hasActiveFilters={hasActiveFilters}
              isMobile={isMobile}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onApply={() => setIsFilterOpen(false)}
            />

            <section className="shop-page__products">
              {isGridLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-4 lg:gap-5 px-4 lg:px-0">
                  {Array.from({ length: skeletonCount }).map((_, index) => (
                    <ProductCardSkeleton key={`skeleton-${index + 1}`} />
                  ))}
                </div>
              ) : shopProducts.length === 0 ? (
                <div className="shop-page__empty-state">
                  <EmptyStateIcon />
                  <h2>No pieces found</h2>
                  <p>Try adjusting your filters or browse all pieces</p>
                  <button
                    type="button"
                    className="shop-page__empty-button"
                    onClick={clearAllFilters}
                  >
                    View All Pieces
                  </button>
                </div>
              ) : (
                <div key={gridTransitionKey} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-4 lg:gap-5 px-4 lg:px-0">
                  {shopProducts.map((product, index) => (
                    <CardWrapper key={`${product.id}-${gridTransitionKey}`} delay={(index % 3) * 80}>
                      {(() => {
                        const pricing = getProductCardPricing(product);
                        return (
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        price={pricing.price}
                        original_price={pricing.original_price}
                        images={getProductCardImages(product)}
                        artisan={product.artisan}
                        category={product.category}
                        slug={getProductCardSlug(product)}
                        is_new={getProductCardIsNew(product)}
                        product_type={getProductCardType(product)}
                        stock_quantity={getProductCardStockQuantity(product)}
                        size="default"
                      />
                        );
                      })()}
                    </CardWrapper>
                  ))}
                </div>
              )}

              <div className="shop-pagination">
                <p className="shop-pagination__showing">
                  Showing {showingFrom}
                  {RANGE_DASH}
                  {showingTo} of {totalCount.toLocaleString("en-KE")}{" "}
                  pieces
                </p>

                <div className="shop-pagination__desktop">
                  <button
                    type="button"
                    className="shop-pagination__button"
                    disabled={currentPage === 1}
                    onClick={() => updatePage(currentPage - 1)}
                  >
                    {String.fromCharCode(8592)} Prev
                  </button>

                  <div className="shop-pagination__numbers">
                    {pageNumbers.map((entry) =>
                      typeof entry === "number" ? (
                        <button
                          key={entry}
                          type="button"
                          className={`shop-pagination__number ${
                            currentPage === entry
                              ? "shop-pagination__number--active"
                              : ""
                          }`}
                          onClick={() => updatePage(entry)}
                        >
                          {entry}
                        </button>
                      ) : (
                        <span key={entry} className="shop-pagination__ellipsis">
                          ...
                        </span>
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    className="shop-pagination__button"
                    disabled={currentPage === totalPages}
                    onClick={() => updatePage(currentPage + 1)}
                  >
                    Next {String.fromCharCode(8594)}
                  </button>
                </div>

                <div className="shop-pagination__mobile">
                  <button
                    type="button"
                    className="shop-pagination__mobile-link"
                    disabled={currentPage === 1}
                    onClick={() => updatePage(currentPage - 1)}
                  >
                    {String.fromCharCode(8592)} Previous
                  </button>
                  <span className="shop-pagination__mobile-copy">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="shop-pagination__mobile-link"
                    disabled={currentPage === totalPages}
                    onClick={() => updatePage(currentPage + 1)}
                  >
                    Next {String.fromCharCode(8594)}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </section>

        {recentlyViewed.length > 1 ? (
          <section className="shop-recently-viewed">
            <div className="shop-recently-viewed__header">
              <span className="shop-recently-viewed__title">Recently Viewed</span>
              <button
                type="button"
                className="shop-recently-viewed__clear"
                onClick={clearRecentlyViewed}
              >
                Clear
              </button>
            </div>

            <div className="shop-recently-viewed__row">
              {recentlyViewed.map((product) => {
                const pricing = getProductCardPricing(product);

                return (
                  <div
                    key={product.id}
                    className="shop-recently-viewed__card"
                    onClick={() => handleProductOpen(product)}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={pricing.price}
                      original_price={pricing.original_price}
                      images={getProductCardImages(product)}
                      artisan={product.artisan}
                      category={product.category}
                      slug={getProductCardSlug(product)}
                      is_new={getProductCardIsNew(product)}
                      product_type={getProductCardType(product)}
                      stock_quantity={getProductCardStockQuantity(product)}
                      size="small"
                      showArtisan={false}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>

      <Footer />
    </>
  );
}

export { getServerSideProps } from "../lib/server/shop-page";
