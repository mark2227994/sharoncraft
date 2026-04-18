import { useMemo, useState, useEffect } from "react";
import CategoryStrip from "../components/CategoryStrip";
import Footer from "../components/Footer";
import MasonryGrid from "../components/MasonryGrid";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";
import Icon from "../components/icons";
import ShopSidebar from "../components/ShopSidebar";
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
  const [gridView, setGridView] = useState("masonry"); // "masonry" | "4-col" | "2-col" | "list"
  const ITEMS_PER_PAGE_DESKTOP = 24;
  const ITEMS_PER_PAGE_MOBILE = 12;

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

    if (sortBy === "recent") return next.slice().sort((left, right) => Number(right.recent) - Number(left.recent));
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

  // Pagination
  const itemsPerPage = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeJewelryType, showAvailableOnly, sortBy]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Calculate page range info
  const firstItemNum = (currentPage - 1) * itemsPerPage + 1;
  const lastItemNum = Math.min(currentPage * itemsPerPage, filteredProducts.length);
  
  // Smart page numbers (show ellipsis if too many pages)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    pages.push(1);
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    if (startPage > 2) pages.push('...');
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  function handleCategorySelect(nextCategory) {
    setActiveCategory(nextCategory);
    if (nextCategory !== "Jewellery") {
      setActiveJewelryType("all");
    }
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
        {/* Breadcrumb Navigation */}
        <div className="shop-breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/shop">Shop</a>
          {activeCategory !== "All" && (
            <>
              <span>/</span>
              <span>{activeCategory}</span>
            </>
          )}
          {activeJewelryType !== "all" && (
            <>
              <span>/</span>
              <span>{getJewelryTypeLabel(activeJewelryType)}</span>
            </>
          )}
        </div>

        {/* Mobile: Show Filter button, Desktop: Hide (sidebar instead) */}
        <div className="shop-page__header">
          <div className="shop-page__header-left">
            <p className="overline">Kenyan Artisan Gallery</p>
            <h1 className="display-lg">Shop the collection</h1>
          </div>
          <div className="shop-page__header-actions">
            {!isMobile && (
              <div className="grid-toggle">
                <button
                  title="Masonry view"
                  className={`grid-toggle__btn ${gridView === "masonry" ? "active" : ""}`}
                  onClick={() => setGridView("masonry")}
                >
                  ≡
                </button>
                <button
                  title="4-column grid"
                  className={`grid-toggle__btn ${gridView === "4-col" ? "active" : ""}`}
                  onClick={() => setGridView("4-col")}
                >
                  ⊞⊞
                </button>
                <button
                  title="2-column grid"
                  className={`grid-toggle__btn ${gridView === "2-col" ? "active" : ""}`}
                  onClick={() => setGridView("2-col")}
                >
                  ⊞
                </button>
                <button
                  title="List view"
                  className={`grid-toggle__btn ${gridView === "list" ? "active" : ""}`}
                  onClick={() => setGridView("list")}
                >
                  ☰
                </button>
              </div>
            )}
            {isMobile && (
              <button type="button" className="shop-page__filter-btn" onClick={() => setIsDrawerOpen(true)}>
                <Icon name="filter" size={18} />
                Filters
                {hasActiveFilters && <span className="shop-page__filter-dot" />}
              </button>
            )}
          </div>
        </div>

        {/* Jewellery subcategories - horizontal scroll */}
        {activeCategory === "Jewellery" && (
          <div className="shop-page__subcategories">
            <button
              type="button"
              className={`shop-page__sub-pill ${activeJewelryType === "all" ? "shop-page__sub-pill--active" : ""}`}
              onClick={() => setActiveJewelryType("all")}
            >
              All
            </button>
            {jewelryTypeOptions.map((type) => (
              <button
                key={type}
                type="button"
                className={`shop-page__sub-pill ${activeJewelryType === type ? "shop-page__sub-pill--active" : ""}`}
                onClick={() => setActiveJewelryType(type)}
              >
                {getJewelryTypeLabel(type)}
              </button>
            ))}
          </div>
        )}

        {/* Product count */}
        <div className="shop-page__count">
          <span>{filteredProducts.length} products</span>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setActiveCategory("All");
                setActiveJewelryType("all");
                setShowAvailableOnly(false);
              }}
              className="shop-page__clear"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Main content with sidebar */}
        <div className="shop-page__layout">
          <ShopSidebar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={(cat) => {
              setActiveCategory(cat);
              if (cat !== "Jewellery") setActiveJewelryType("all");
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

          <div className="shop-page__grid" data-grid-view={gridView}>
            {gridView === "masonry" && <MasonryGrid products={paginatedProducts} />}
            {gridView !== "masonry" && (
              <div className={`shop-products__${gridView}`}>
                {paginatedProducts.map((product) => (
                  <a href={`/product/${product.slug}`} key={product.id} className="product-card-link">
                    <div className="product-card">
                      <div className="product-card__image-wrap">
                        <img src={product.image} alt={product.name} className="product-card__image" />
                        {product.badge && <span className="product-card__badge">{product.badge}</span>}
                      </div>
                      <div className="product-card__info">
                        {gridView === "list" && <p className="product-card__category">{product.category}</p>}
                        <h3 className="product-card__title">{product.name}</h3>
                        {gridView === "list" && product.description && (
                          <p className="product-card__description">{product.description.substring(0, 100)}...</p>
                        )}
                        <div className="product-card__footer">
                          <span className="product-card__price">KES {product.price.toLocaleString()}</span>
                          {gridView === "list" && (
                            <button className="product-card__quick-btn">View Details</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Item count and pagination info */}
            <div className="shop-pagination__info">
              <span className="pagination-range">Showing {firstItemNum}–{lastItemNum} of {filteredProducts.length} products</span>
              <span className="pagination-page-info">Page {currentPage} of {totalPages}</span>
            </div>

            {/* Mobile: Load More Button */}
            {isMobile && currentPage < totalPages && (
              <div className="shop-pagination shop-pagination--mobile">
                <button
                  className="shop-load-more"
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Load More ({filteredProducts.length - lastItemNum} remaining)
                </button>
              </div>
            )}

            {/* Desktop: Numbered Pages */}
            {!isMobile && totalPages > 1 && (
              <div className="shop-pagination shop-pagination--desktop">
                <button
                  className="shop-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <Icon name="chevronR" size={16} style={{ transform: 'rotate(180deg)' }} />
                  Previous
                </button>

                <div className="shop-page-numbers">
                  {getPageNumbers().map((pageNum, idx) => (
                    typeof pageNum === 'number' ? (
                      <button
                        key={pageNum}
                        className={`shop-page-num ${currentPage === pageNum ? 'shop-page-num--active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ) : (
                      <span key={`ellipsis-${idx}`} className="shop-page-ellipsis">
                        {pageNum}
                      </span>
                    )
                  ))}
                </div>

                <button
                  className="shop-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                  <Icon name="chevronR" size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        /* Breadcrumb Navigation */
        .shop-breadcrumb {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-3) var(--gutter);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .shop-breadcrumb a {
          color: var(--color-accent);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .shop-breadcrumb a:hover {
          text-decoration: underline;
        }
        .shop-breadcrumb span {
          color: var(--border-default);
        }

        .shop-page {
          padding-top: calc(var(--nav-height) + 20px);
          min-height: 100vh;
        }
        .shop-page__header {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-2) var(--gutter);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-3);
        }
        .shop-page__header-left p {
          margin-bottom: 4px;
        }
        .shop-page__header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        /* Grid Toggle */
        .grid-toggle {
          display: inline-flex;
          gap: 4px;
          padding: 4px;
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
        }
        .grid-toggle__btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--text-secondary);
          font-size: 16px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .grid-toggle__btn:hover {
          background: var(--border-light);
          color: var(--text-primary);
        }
        .grid-toggle__btn.active {
          background: var(--color-accent);
          color: var(--color-white);
        }

        .shop-page__filter-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 12px 16px;
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          cursor: pointer;
          position: relative;
        }
        .shop-page__filter-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--color-accent);
          border-radius: 50%;
        }

        /* Subcategories */
        .shop-page__subcategories {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-3) var(--gutter);
          display: flex;
          gap: var(--space-2);
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .shop-page__subcategories::-webkit-scrollbar {
          display: none;
        }
        .shop-page__sub-pill {
          flex-shrink: 0;
          padding: 8px 16px;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-pill);
          background: var(--color-white);
          color: var(--text-secondary);
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }
        .shop-page__sub-pill:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }
        .shop-page__sub-pill--active {
          background: var(--color-accent);
          border-color: var(--color-accent);
          color: var(--color-white);
        }

        /* Product Count */
        .shop-page__count {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--gutter) var(--space-3);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .shop-page__clear {
          background: none;
          border: none;
          color: var(--color-accent);
          font-size: var(--text-sm);
          cursor: pointer;
          text-decoration: underline;
        }

        /* Main Layout */
        .shop-page__layout {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--gutter) var(--space-7);
          display: flex;
          gap: var(--space-5);
          align-items: flex-start;
        }
        .shop-page__grid {
          flex: 1;
          min-width: 0;
        }

        /* Different Grid Views */
        .shop-products__4-col {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        .shop-products__2-col {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        .shop-products__list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        /* Product Card Link Styling */
        .product-card-link {
          text-decoration: none;
          color: inherit;
        }

        /* List View Product Card */
        .shop-products__list .product-card {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-3);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .shop-products__list .product-card:hover {
          border-color: var(--color-accent);
          box-shadow: 0 4px 12px rgba(139, 90, 43, 0.1);
        }
        .shop-products__list .product-card__image-wrap {
          width: 150px;
          height: 150px;
          flex-shrink: 0;
        }
        .shop-products__list .product-card__info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .product-card__category {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-accent);
          text-transform: uppercase;
          margin: 0;
        }
        .product-card__title {
          font-size: var(--text-base);
          font-weight: 600;
          margin: 0;
          line-height: 1.4;
        }
        .product-card__description {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }
        .product-card__footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        .product-card__price {
          font-weight: 700;
          font-size: var(--text-base);
          color: var(--text-primary);
        }
        .product-card__quick-btn {
          padding: 8px 16px;
          background: var(--color-accent);
          color: var(--color-white);
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .product-card__quick-btn:hover {
          background: var(--color-accent-dark);
        }

        /* Pagination */
        .shop-pagination {
          margin-top: var(--space-6);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Pagination info */
        .shop-pagination__info {
          margin-top: var(--space-5);
          padding: var(--space-3) 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        /* Mobile: Load More Button */
        .shop-pagination--mobile {
          padding: var(--space-4) 0;
        }
        .shop-load-more {
          padding: 14px 32px;
          background: var(--color-white);
          border: 2px solid var(--color-accent);
          border-radius: var(--radius-md);
          color: var(--color-accent);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .shop-load-more:hover {
          background: var(--color-accent);
          color: var(--color-white);
        }

        /* Desktop: Numbered Pages */
        .shop-pagination--desktop {
          gap: var(--space-4);
          padding: var(--space-5) 0;
        }
        .shop-page-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 10px 16px;
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .shop-page-btn:hover:not(:disabled) {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }
        .shop-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .shop-page-numbers {
          display: flex;
          gap: var(--space-1);
          align-items: center;
        }
        .shop-page-num {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .shop-page-num:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }
        .shop-page-num--active {
          background: var(--color-accent);
          border-color: var(--color-accent);
          color: var(--color-white);
        }
        .shop-page-ellipsis {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .shop-products__4-col {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 899px) {
          .shop-page__header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-3);
          }
          .shop-page__layout {
            flex-direction: column;
            padding: 0 var(--gutter) var(--space-5);
          }
          .shop-page__grid {
            width: 100%;
          }
          .shop-pagination__info {
            flex-direction: column;
            gap: var(--space-2);
          }
          .grid-toggle {
            display: none;
          }
          .shop-products__4-col {
            grid-template-columns: repeat(2, 1fr);
          }
          .shop-products__2-col {
            grid-template-columns: 1fr;
          }
          .shop-products__list .product-card {
            flex-direction: column;
          }
          .shop-products__list .product-card__image-wrap {
            width: 100%;
            height: 200px;
          }
        }
      `}</style>
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
