import { useEffect, useMemo, useState } from "react";
import CategoryStrip from "../components/CategoryStrip";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import ProductCard from "../components/ProductCard";
import SeoHead from "../components/SeoHead";
import ShopSidebar from "../components/ShopSidebar";
import Icon from "../components/icons";
import { categoryOptions } from "../data/site";
import {
  filterPublishedProducts,
  getCatalogCategories,
  getCategoryPriority,
  getJewelryTypeLabel,
  getJewelryTypePriority,
  jewelryTypeOptions,
} from "../lib/products";
import { readProducts } from "../lib/store";

export default function ShopPage({ products, categories, initialCategory, initialJewelryType }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeJewelryType, setActiveJewelryType] = useState(initialJewelryType);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE_DESKTOP = 24;
  const ITEMS_PER_PAGE_MOBILE = 12;

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "recent", label: "Newest Arrivals" },
    { value: "best-sellers", label: "Best Sellers" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isJewelleryView = activeCategory === "Jewellery";
  const hasActiveFilters = activeCategory !== "All" || activeJewelryType !== "all" || showAvailableOnly;

  const filteredProducts = useMemo(() => {
    const next = products
      .filter((product) => (activeCategory === "All" ? true : product.category === activeCategory))
      .filter((product) => {
        if (!isJewelleryView) return true;
        if (activeJewelryType === "all") return true;
        return product.jewelryType === activeJewelryType;
      })
      .filter((product) => (showAvailableOnly ? !product.isSold && product.stock > 0 : true));

    if (sortBy === "recent") {
      return next.slice().sort((left, right) => Number(right.newArrival) - Number(left.newArrival));
    }
    if (sortBy === "best-sellers") {
      return next
        .slice()
        .sort((left, right) => Number(right.badge === "Best Seller") - Number(left.badge === "Best Seller"));
    }
    if (sortBy === "price-asc") return next.slice().sort((left, right) => left.price - right.price);
    if (sortBy === "price-desc") return next.slice().sort((left, right) => right.price - left.price);

    return next.slice().sort((left, right) => {
      const featuredDiff = Number(right.featured) - Number(left.featured);
      if (featuredDiff !== 0) return featuredDiff;

      const categoryDiff = getCategoryPriority(left.category) - getCategoryPriority(right.category);
      if (categoryDiff !== 0) return categoryDiff;

      const jewelryDiff = getJewelryTypePriority(left.jewelryType) - getJewelryTypePriority(right.jewelryType);
      if (jewelryDiff !== 0) return jewelryDiff;

      return left.name.localeCompare(right.name);
    });
  }, [activeCategory, activeJewelryType, isJewelleryView, products, showAvailableOnly, sortBy]);

  const itemsPerPage = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeJewelryType, showAvailableOnly, sortBy]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const getPageNumbers = () => {
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
  };

  function handleCategorySelect(nextCategory) {
    setActiveCategory(nextCategory);
    if (nextCategory !== "Jewellery") {
      setActiveJewelryType("all");
    }
  }

  function clearAllFilters() {
    setActiveCategory("All");
    setActiveJewelryType("all");
    setShowAvailableOnly(false);
    setCurrentPage(1);
  }

  return (
    <>
      <SeoHead
        title="Shop Handmade Kenyan Jewellery, Gifts And Decor"
        description="Browse SharonCraft necklaces, bracelets, earrings, home decor, gift sets, and artisan-made pieces from Kenya."
        path="/shop"
      />

      <Nav />
      <CategoryStrip categories={categories} activeCategory={activeCategory} onSelect={handleCategorySelect} />

      <main className="shop-page">
        <div className="shop-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/shop">Shop</a>
          {activeCategory !== "All" ? (
            <>
              <span>/</span>
              <span>{activeCategory}</span>
            </>
          ) : null}
          {activeJewelryType !== "all" ? (
            <>
              <span>/</span>
              <span>{getJewelryTypeLabel(activeJewelryType)}</span>
            </>
          ) : null}
        </div>

        <section className="shop-page__header">
          <div className="shop-page__header-left">
            <h1 className="display-lg">Shop the collection</h1>
          </div>

          {!isMobile ? (
            <div className="shop-page__sort-container">
              <label className="shop-page__sort-label" htmlFor="shop-sort-desktop">
                Sort By
              </label>
              <select
                id="shop-sort-desktop"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="shop-page__sort-select"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </section>

        {hasActiveFilters ? (
          <section className="shop-page__active-filters" aria-label="Active filters">
            <div className="shop-page__active-filters-content">
              <div className="shop-page__filter-pills">
                {activeCategory !== "All" ? (
                  <div className="filter-pill">
                    <span>{activeCategory}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory("All");
                        setCurrentPage(1);
                      }}
                      aria-label={`Remove ${activeCategory} filter`}
                    >
                      ×
                    </button>
                  </div>
                ) : null}

                {isJewelleryView && activeJewelryType !== "all" ? (
                  <div className="filter-pill">
                    <span>{getJewelryTypeLabel(activeJewelryType)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveJewelryType("all");
                        setCurrentPage(1);
                      }}
                      aria-label="Remove jewellery type filter"
                    >
                      ×
                    </button>
                  </div>
                ) : null}

                {showAvailableOnly ? (
                  <div className="filter-pill">
                    <span>In Stock Only</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAvailableOnly(false);
                        setCurrentPage(1);
                      }}
                      aria-label="Remove stock filter"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
              </div>

              <button type="button" onClick={clearAllFilters} className="shop-page__clear-all">
                Clear All
              </button>
            </div>
          </section>
        ) : null}

        <div className="shop-page__layout">
          <ShopSidebar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={(category) => {
              setActiveCategory(category);
              if (category !== "Jewellery") setActiveJewelryType("all");
            }}
            activeJewelryType={activeJewelryType}
            onJewelryTypeChange={setActiveJewelryType}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showAvailableOnly={showAvailableOnly}
            onShowAvailableChange={setShowAvailableOnly}
            isMobile={isMobile}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />

          <section className="shop-page__results">
            <div className="shop-page__results-bar">
              {isMobile ? (
                <button type="button" className="shop-page__filter-btn" onClick={() => setIsDrawerOpen(true)}>
                  <Icon name="filter" size={16} />
                  <span>Filters</span>
                  {hasActiveFilters ? <span className="shop-page__filter-dot" /> : null}
                </button>
              ) : null}

              <p className="shop-page__count-text">{filteredProducts.length} handmade pieces found</p>
            </div>

            {paginatedProducts.length === 0 ? (
              <div className="shop-page__no-results">
                <div className="no-results-icon">⌕</div>
                <h3>No products found</h3>
                <p>We couldn&apos;t find items matching these filters.</p>
                <div className="no-results-suggestions">
                  <p>Try adjusting the category, availability, or sort selection.</p>
                </div>
                <button type="button" onClick={clearAllFilters} className="no-results-btn">
                  Clear Filters &amp; Browse All
                </button>
              </div>
            ) : (
              <div className="shop-products__catalog">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="product-card-grid-item">
                    <ProductCard product={product} variant="shop-catalog" />
                  </div>
                ))}
              </div>
            )}

            {!isMobile && totalPages > 1 ? (
              <div className="shop-pagination shop-pagination--desktop">
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

export async function getServerSideProps({ query }) {
  const products = filterPublishedProducts(await readProducts());
  const categories = getCatalogCategories(products);
  const requestedCategory = typeof query.category === "string" ? query.category : "Jewellery";
  const initialCategory = categories.includes(requestedCategory) ? requestedCategory : categoryOptions[0];
  const requestedJewelryType =
    typeof query.jewelryType === "string" && jewelryTypeOptions.includes(query.jewelryType)
      ? query.jewelryType
      : "all";

  return { props: { products, categories, initialCategory, initialJewelryType: requestedJewelryType } };
}
