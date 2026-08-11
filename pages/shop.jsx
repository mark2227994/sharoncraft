import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import CategoryStrip from "../components/CategoryStrip";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import ProductCard from "../components/ProductCard";
import SafeImage from "../components/ui/SafeImage";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import SeoHead from "../components/SeoHead";
import ShopSidebar from "../components/ShopSidebar";
import Icon from "../components/icons";
import {
  buildShopCategoryTree,
  buildShopHref,
  getCategoryByName,
  getCategoryBySlug,
  getSubcategoryBySlug,
  normalizeCategoryName,
  normalizeSubcategoryName,
} from "../lib/categories";
import { filterPublishedProducts, getCategoryPriority, getJewelryTypePriority } from "../lib/products";

const HERO_CONTENT = {
  all: {
    title: "The SharonCraft Catalog",
    description: "Explore our curated collection of premium handmade Kenyan beadwork. Each piece tells a unique story of culture, precision, and raw textured beauty.",
    image: "/media/site/homepage/ai-intent-wear-it.webp"
  },
  jewellery: {
    title: "Boutique Jewellery",
    description: "Elevate your style with our signature hand-beaded necklaces, earrings, and bracelets. Made from premium glass beads and organic components.",
    image: "/media/site/homepage/ai-intent-wear-it.webp"
  },
  accessories: {
    title: "Handcrafted Accessories",
    description: "Timeless handcrafted items from beaded sandals to beautifully woven kiondo bags. Designed for natural texture and premium durability.",
    image: "/media/site/collections/Gemini_Generated_Image_mqtg1imqtg1imqtg.png"
  },
  "african-wear": {
    title: "African Wear & Shukas",
    description: "Vibrant occasion wear, authentic Maasai Shukas, and statement bridal sets that embody rich cultural pride and premium editorial design.",
    image: "/media/site/homepage/Wedding Jewelry Around the World - Kenya.webp"
  },
  "home-living": {
    title: "Home & Living Accents",
    description: "Infuse your home with handcrafted warmth. Explore soapstone carvings, hand-woven storage baskets, and clay-terracotta table accent decor.",
    image: "/media/site/collections/ai-intent-style-home.webp"
  },
  "art-craft": {
    title: "Art & Heritage Craft",
    description: "Collector's carvings and heritage artifact sculptures, curated to anchor modern living spaces with organic texture and cultural stories.",
    image: "/media/site/collections/Gemini_Generated_Image_mqtg1imqtg1imqtg.png"
  },
  "gifted-carry": {
    title: "Curated Gift Sets",
    description: "Give the gift of human touch. Hand-packed corporate sets, custom wrapping, and curated occasion bundles of authentic Kenyan artistry.",
    image: "/media/site/collections/ai-explore-gift-path.webp"
  }
};

function matchesPriceRange(product, activePriceRange) {
  const price = Number(product?.price || 0);

  if (activePriceRange === "under-1000") return price < 1000;
  if (activePriceRange === "1000-3000") return price >= 1000 && price <= 3000;
  if (activePriceRange === "3000-5000") return price > 3000 && price <= 5000;
  if (activePriceRange === "above-5000") return price > 5000;

  return true;
}

function buildCanonicalPath(categorySlug, subcategorySlug = "") {
  if (!categorySlug || categorySlug === "all") return "/shop";

  const category = getCategoryBySlug(categorySlug);
  if (!category) return "/shop";

  const subcategory = subcategorySlug ? getSubcategoryBySlug(category.slug, subcategorySlug) : null;
  return buildShopHref(category.name, subcategory?.name);
}

export default function ShopPage({ products, initialCategory, initialSubcategory }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [activePriceRange, setActivePriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url) => {
      if (url.includes("/shop")) {
        setIsFilterLoading(true);
      }
    };
    const handleComplete = () => setIsFilterLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  useEffect(() => {
    setIsFilterLoading(true);
    const timer = setTimeout(() => {
      setIsFilterLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [activePriceRange, sortBy, showAvailableOnly]);

  const trendingProducts = useMemo(() => {
    return (products || []).filter((p) => p.featured).slice(0, 4);
  }, [products]);

  const ITEMS_PER_PAGE_DESKTOP = 16;
  const ITEMS_PER_PAGE_MOBILE = 16;
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "recent", label: "Newest" },
    { value: "price-asc", label: "Price: Low" },
    { value: "price-desc", label: "Price: High" },
  ];

  const categoryTree = useMemo(() => buildShopCategoryTree(), []);
  const shopTabs = useMemo(() => categoryTree.map((node) => node.label), [categoryTree]);
  const activeCategoryData = activeCategory !== "all" ? getCategoryBySlug(activeCategory) : null;
  const activeSubcategoryData =
    activeCategoryData && activeSubcategory ? getSubcategoryBySlug(activeCategoryData.slug, activeSubcategory) : null;
  const activeTabLabel = activeCategoryData?.name || "All";
  const canonicalPath = buildCanonicalPath(activeCategory, activeSubcategory);

  useEffect(() => {
    setActiveCategory(initialCategory);
    setActiveSubcategory(initialSubcategory);
  }, [initialCategory, initialSubcategory]);

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
    if (!isMobile) {
      setIsDrawerOpen(false);
    }
  }, [isMobile]);

  const filteredProducts = useMemo(() => {
    const next = products
      .filter((product) => (activeCategoryData ? product.category === activeCategoryData.name : true))
      .filter((product) => (activeSubcategoryData ? product.subcategory === activeSubcategoryData.name : true))
      .filter((product) => (showAvailableOnly ? !product.isSold && product.stock > 0 : true))
      .filter((product) => matchesPriceRange(product, activePriceRange));

    if (sortBy === "recent") {
      return next
        .slice()
        .sort(
          (left, right) =>
            Number(Boolean(right.recent || right.isNew || right.newArrival)) -
            Number(Boolean(left.recent || left.isNew || left.newArrival)),
        );
    }

    if (sortBy === "price-asc") return next.slice().sort((left, right) => left.price - right.price);
    if (sortBy === "price-desc") return next.slice().sort((left, right) => right.price - left.price);

    return next.slice().sort((left, right) => {
      const featuredDiff = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
      if (featuredDiff !== 0) return featuredDiff;

      const orderDiff =
        Number(left.featuredOrder ?? 999) - Number(right.featuredOrder ?? 999);
      if (orderDiff !== 0) return orderDiff;

      const categoryDiff = getCategoryPriority(left.category) - getCategoryPriority(right.category);
      if (categoryDiff !== 0) return categoryDiff;

      const jewelryDiff = getJewelryTypePriority(left.jewelryType) - getJewelryTypePriority(right.jewelryType);
      if (jewelryDiff !== 0) return jewelryDiff;

      return left.name.localeCompare(right.name);
    });
  }, [activeCategoryData, activePriceRange, activeSubcategoryData, products, showAvailableOnly, sortBy]);

  const itemsPerPage = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [currentPage, filteredProducts, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activePriceRange, activeSubcategory, showAvailableOnly, sortBy]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentPage]);

  function getPageNumbers() {
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1];
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) pages.push("...");
    for (let page = startPage; page <= endPage; page += 1) pages.push(page);
    if (endPage < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  }

  function routeToSelection(nextCategorySlug = "all", nextSubcategorySlug = "") {
    const resolvedCategorySlug = nextCategorySlug || "all";
    const resolvedSubcategorySlug = resolvedCategorySlug === "all" ? "" : nextSubcategorySlug || "";
    const href = buildCanonicalPath(resolvedCategorySlug, resolvedSubcategorySlug);

    setActiveCategory(resolvedCategorySlug);
    setActiveSubcategory(resolvedSubcategorySlug);
    router.push(href, undefined, { scroll: false });
  }

  function handleCategorySelect(label) {
    if (label === "All") {
      routeToSelection("all");
      return;
    }

    const category = getCategoryByName(label);
    if (!category) return;
    routeToSelection(category.slug);
  }

  function clearAllFilters() {
    routeToSelection("all");
    setShowAvailableOnly(false);
    setActivePriceRange("all");
    setSortBy("featured");
    setCurrentPage(1);
  }

  const currentHero = HERO_CONTENT[activeCategory] || HERO_CONTENT.all;

  return (
    <>
      <SeoHead
        title="Shop Handmade Kenyan Jewellery, Gifts And Decor"
        description="Browse SharonCraft necklaces, bracelets, earrings, home decor, gift sets, and artisan-made pieces from Kenya."
        path={canonicalPath}
      />

      <Nav />
      <CategoryStrip
        className="shop-category-strip"
        categories={shopTabs}
        activeCategory={activeTabLabel}
        onSelect={handleCategorySelect}
      />

      <main className="shop-page">
        <div className="shop-hero">
          <div className="shop-hero__copy-pane">
            <div className="shop-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="shop-breadcrumb__separator">›</span>
              <Link href="/shop">Shop</Link>
              {activeCategoryData ? (
                <>
                  <span className="shop-breadcrumb__separator">›</span>
                  <Link href={buildShopHref(activeCategoryData.name)}>{activeCategoryData.name}</Link>
                </>
              ) : null}
              {activeSubcategoryData ? (
                <>
                  <span className="shop-breadcrumb__separator">›</span>
                  <span className="shop-breadcrumb__current">{activeSubcategoryData.name}</span>
                </>
              ) : null}
            </div>

            <span className="shop-hero__vintage-label">SHARONCRAFT EST. 2021</span>
            <h1 className="shop-hero__heading">
              {activeSubcategoryData ? activeSubcategoryData.name : currentHero.title}
            </h1>
            <p className="shop-hero__description">
              {currentHero.description}
            </p>
            <div className="shop-hero__meta">
              <span className="shop-hero__count">{filteredProducts.length} curated pieces</span>
            </div>
          </div>

          <div className="shop-hero__media-pane">
            <div className="shop-hero__image-frame">
              <SafeImage
                src={currentHero.image}
                alt={activeSubcategoryData ? activeSubcategoryData.name : currentHero.title}
                type="hero"
                className="shop-hero__image"
              />
            </div>
          </div>
        </div>

        <div className="shop-page__layout">
          <ShopSidebar
            categoryTree={categoryTree}
            activeCategory={activeCategory}
            onCategoryChange={(categorySlug) => routeToSelection(categorySlug)}
            activeSubcategory={activeSubcategory}
            onSubcategoryChange={(subcategorySlug) => routeToSelection(activeCategory, subcategorySlug)}
            onSelectionChange={routeToSelection}
            activePriceRange={activePriceRange}
            onPriceRangeChange={setActivePriceRange}
            showAvailableOnly={showAvailableOnly}
            onShowAvailableChange={setShowAvailableOnly}
            isMobile={isMobile}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOptions={sortOptions}
          />

          <section className="shop-page__results">
            <div className="shop-page__results-bar">
              {isMobile ? (
                <button type="button" className="shop-page__filter-btn" onClick={() => setIsDrawerOpen(true)}>
                  <span>Filter &amp; Sort</span>
                </button>
              ) : (
                <p className="shop-page__count-text">{filteredProducts.length} pieces found</p>
              )}

              {isMobile ? (
                <div className="shop-page__results-controls">
                  <p className="shop-page__count-text">{filteredProducts.length} pieces found</p>
                </div>
              ) : (
                <div className="shop-page__sort-links" aria-label="Sort products">
                  {sortOptions.map((option, index) => (
                    <div key={option.value} className="shop-page__sort-item">
                      <button
                        type="button"
                        className={`shop-page__sort-link ${sortBy === option.value ? "shop-page__sort-link--active" : ""}`}
                        onClick={() => setSortBy(option.value)}
                      >
                        {option.label}
                      </button>
                      {index < sortOptions.length - 1 ? <span className="shop-page__sort-separator">|</span> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="shop-products-container" style={{ position: "relative" }}>
              {paginatedProducts.length === 0 ? (
                isFilterLoading ? (
                  <div className="shop-products__catalog">
                    {Array.from({ length: isMobile ? 4 : 8 }).map((_, index) => (
                      <div key={`skeleton-${index}`} className="product-card-grid-item">
                        <ProductCardSkeleton />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="shop-page__no-results-container">
                    <div className="shop-page__no-results">
                      <div className="no-results-icon">?</div>
                      <h3>No products found</h3>
                      <p>We couldn&apos;t find items matching these filters.</p>
                      <button type="button" onClick={clearAllFilters} className="no-results-btn">
                        Clear Filters &amp; Browse All
                      </button>
                    </div>
                    {trendingProducts.length > 0 ? (
                      <div className="shop-page__no-results-suggestions">
                        <h4 className="shop-page__suggestions-title">Artisan Favorites</h4>
                        <div className="shop-products__catalog">
                          {trendingProducts.map((product) => (
                            <div key={product.id} className="product-card-grid-item">
                              <ProductCard product={product} variant="shop-catalog" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              ) : (
                <div
                  key={`${activeCategory}-${activeSubcategory}-${activePriceRange}-${sortBy}-${showAvailableOnly}-${currentPage}`}
                  className="shop-products__catalog"
                  style={{
                    opacity: isFilterLoading ? 0.6 : 1,
                    pointerEvents: isFilterLoading ? "none" : "auto",
                    transition: "opacity 0.25s ease",
                    minHeight: "400px"
                  }}
                >
                  {paginatedProducts.map((product) => (
                    <div key={product.id} className="product-card-grid-item">
                      <ProductCard product={product} variant="shop-catalog" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 ? (
              <div className="shop-pagination">
                <button
                  type="button"
                  className="shop-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                >
                  <Icon name="chevronR" size={14} className="shop-page-btn__icon--prev" />
                  <span>Previous</span>
                </button>

                <div className="shop-page-numbers">
                  {getPageNumbers().map((pageNum, index) =>
                    typeof pageNum === "number" ? (
                      <button
                        key={pageNum}
                        type="button"
                        className={`shop-page-num ${currentPage === pageNum ? "shop-page-num--active" : ""}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="shop-page-ellipsis">
                        {pageNum}
                      </span>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  className="shop-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  <span>Next</span>
                  <Icon name="chevronR" size={14} />
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export { getServerSideProps } from "../lib/server/shop-page";
