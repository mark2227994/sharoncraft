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
  const [gridView, setGridView] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shopGridView') || '4-col';
    }
    return '4-col';
  });
  const [wishlist, setWishlist] = useState([]);

  // Persist grid view to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopGridView', gridView);
    }
  }, [gridView]);
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

  const toggleWishlist = (productId) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const getProductBadge = (product) => {
    if (product.badge === "Best Seller") return { text: "BEST SELLER", color: "#111" };
    if (product.badge === "New" || product.newArrival) return { text: "NEW", color: "#D4A574" };
    if (product.badge?.includes("Limited")) return { text: "LIMITED", color: "#D4A574" };
    return null;
  };

  const getStockStatus = (product) => {
    if (product.isSold) return { text: "SOLD OUT", color: "#e74c3c" };
    if (!product.stock || product.stock === 0) return { text: "OUT OF STOCK", color: "#e74c3c" };
    if (product.stock < 3) return { text: "LOW STOCK", color: "#f39c12" };
    return { text: "IN STOCK", color: "#1ABC9C" };
  };

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

    if (sortBy === "recent") return next.slice().sort((left, right) => Number(right.newArrival) - Number(left.newArrival));
    if (sortBy === "best-sellers") return next.slice().sort((left, right) => Number(right.badge === "Best Seller") - Number(left.badge === "Best Seller"));
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
            <p className="shop-page__count-text">{filteredProducts.length} handmade pieces found</p>
          </div>
          <div className="shop-page__header-actions">
            {!isMobile && (
              <div className="shop-page__sort-container">
                <label className="shop-page__sort-label">Sort By:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="shop-page__sort-select"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="shop-page__active-filters">
            <div className="shop-page__active-filters-content">
              <span className="shop-page__filters-label">Active Filters:</span>
              <div className="shop-page__filter-pills">
                {activeCategory !== "All" && (
                  <div className="filter-pill">
                    <span>{activeCategory}</span>
                    <button 
                      onClick={() => { setActiveCategory("All"); setCurrentPage(1); }}
                      aria-label={`Remove ${activeCategory} filter`}
                    >✕</button>
                  </div>
                )}
                {isJewelleryView && activeJewelryType !== "all" && (
                  <div className="filter-pill">
                    <span>{getJewelryTypeLabel(activeJewelryType)}</span>
                    <button 
                      onClick={() => { setActiveJewelryType("all"); setCurrentPage(1); }}
                      aria-label={`Remove jewelry type filter`}
                    >✕</button>
                  </div>
                )}
                {showAvailableOnly && (
                  <div className="filter-pill">
                    <span>In Stock Only</span>
                    <button 
                      onClick={() => { setShowAvailableOnly(false); setCurrentPage(1); }}
                      aria-label="Remove stock filter"
                    >✕</button>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setActiveCategory("All");
                  setActiveJewelryType("all");
                  setShowAvailableOnly(false);
                  setCurrentPage(1);
                }}
                className="shop-page__clear-all"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

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
          <span className="shop-count-text">{filteredProducts.length} products available</span>
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
            gridView={gridView}
            onGridViewChange={setGridView}
            isMobile={isMobile}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />

          <div className="shop-page__grid" data-grid-view={gridView}>
            {paginatedProducts.length === 0 ? (
              <div className="shop-page__no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No products found</h3>
                <p>We couldn't find items matching these filters.</p>
                <div className="no-results-suggestions">
                  <p>Try:</p>
                  <ul>
                    <li>Adjusting your filters</li>
                    <li>Browsing all categories</li>
                    <li>Checking spelling in search</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveCategory("All"); setActiveJewelryType("all"); setShowAvailableOnly(false); setCurrentPage(1); }}
                  className="no-results-btn"
                >
                  Clear Filters & Browse All
                </button>
              </div>
            ) : (
              <>
                {gridView === "masonry" && (
                  <div className="masonry-wrapper">
                    {paginatedProducts.map((product) => {
                      const badge = getProductBadge(product);
                      const isWishlisted = wishlist.includes(product.id);
                      const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
                      return (
                        <div key={product.id} className="masonry-item">
                          <div className="product-card-with-actions">
                            <div className="product-card__image-wrap">
                              <img src={product.image} alt={product.name} className="product-card__image" />
                              {badge && <span className="product-card__badge" style={{ backgroundColor: badge.color }}>{badge.text}</span>}
                              <button 
                                className="product-card__add-to-cart"
                                onClick={() => {
                                  // Add to cart logic here
                                }}
                                aria-label="Add to cart"
                              >
                                <Icon name="cart" size={18} />
                              </button>
                              <button 
                                className={`product-card__wishlist ${isWishlisted ? "active" : ""}`}
                                onClick={() => toggleWishlist(product.id)}
                                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                              >
                                <Icon name="heart" size={20} />
                              </button>
                            </div>
                            <a href={`/product/${product.slug}`} className="product-card__link">
                              <div className="product-card__info">
                                {product.artisan && <span className="product-card__artisan">By {product.artisan}</span>}
                                <h3 className="product-card__name">{product.name}</h3>
                                <div className="product-card__pricing">
                                  <span className="product-card__price">KES {product.price.toLocaleString()}</span>
                                  {product.originalPrice && <span className="product-card__original-price">KES {product.originalPrice.toLocaleString()}</span>}
                                  {discount && <span className="product-card__discount">-{discount}%</span>}
                                </div>
                              </div>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {gridView !== "masonry" && (
                  <div className={`shop-products__${gridView}`}>
                    {paginatedProducts.map((product) => {
                      const badge = getProductBadge(product);
                      const isWishlisted = wishlist.includes(product.id);
                      const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
                      return (
                        <div key={product.id} className="product-card-grid-item">
                          <div className="product-card-with-actions">
                            <div className="product-card__image-wrap">
                              <img src={product.image} alt={product.name} className="product-card__image" />
                              {badge && <span className="product-card__badge" style={{ backgroundColor: badge.color }}>{badge.text}</span>}
                              <button 
                                className="product-card__add-to-cart"
                                onClick={() => {
                                  // Add to cart logic here
                                }}
                                aria-label="Add to cart"
                              >
                                <Icon name="cart" size={18} />
                              </button>
                              <button 
                                className={`product-card__wishlist ${isWishlisted ? "active" : ""}`}
                                onClick={() => toggleWishlist(product.id)}
                                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                              >
                                <Icon name="heart" size={20} />
                              </button>
                            </div>
                            <a href={`/product/${product.slug}`} className="product-card__link">
                              <div className="product-card__info">
                                {product.artisan && <span className="product-card__artisan">By {product.artisan}</span>}
                                <h3 className="product-card__name">{product.name}</h3>
                                <div className="product-card__pricing">
                                  <span className="product-card__price">KES {product.price.toLocaleString()}</span>
                                  {product.originalPrice && <span className="product-card__original-price">KES {product.originalPrice.toLocaleString()}</span>}
                                  {discount && <span className="product-card__discount">-{discount}%</span>}
                                </div>
                              </div>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
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
          color: #666;
        }
        .shop-breadcrumb a {
          color: #111;
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
          background: #fff;
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
          color: #666;
          font-size: 16px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .grid-toggle__btn:hover {
          background: var(--border-light);
          color: #111;
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
          background: #fff;
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
          background: #fff;
          color: #666;
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }
        .shop-page__sub-pill:hover {
          border-color: #111;
          color: #111;
        }
        .shop-page__sub-pill--active {
          background: var(--color-accent);
          border-color: #111;
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
          color: #666;
        }
        .shop-page__clear {
          background: none;
          border: none;
          color: #111;
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
        .shop-products__3-col {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        .shop-products__2-col {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        .shop-products__5-col {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--space-3);
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
          border-color: #111;
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
          color: #111;
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
          color: #666;
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
          color: #111;
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
          color: #666;
        }

        /* Mobile: Load More Button */
        .shop-pagination--mobile {
          padding: var(--space-4) 0;
        }
        .shop-load-more {
          padding: 14px 32px;
          background: #fff;
          border: 2px solid var(--color-accent);
          border-radius: var(--radius-md);
          color: #111;
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
          background: #fff;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: #666;
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .shop-page-btn:hover:not(:disabled) {
          border-color: #111;
          color: #111;
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
          background: #fff;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: #666;
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .shop-page-num:hover {
          border-color: #111;
          color: #111;
        }
        .shop-page-num--active {
          background: var(--color-accent);
          border-color: #111;
          color: var(--color-white);
        }
        .shop-page-ellipsis {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: var(--text-sm);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .shop-products__4-col {
            grid-template-columns: repeat(3, 1fr);
          }
          .shop-products__5-col {
            grid-template-columns: repeat(4, 1fr);
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
          .shop-products__5-col {
            grid-template-columns: repeat(2, 1fr);
          }
          .shop-products__3-col {
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
        @media (max-width: 599px) {
          .shop-products__5-col,
          .shop-products__4-col,
          .shop-products__3-col {
            grid-template-columns: 1fr;
          }
        }

        /* NEW: Sort Dropdown in Header */
        .shop-page__sort-container {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .shop-page__sort-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .shop-page__sort-select {
          padding: 8px 12px;
          background: #fff;
          border: 1px solid var(--border-default);
          border-radius: 6px;
          color: #111;
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .shop-page__sort-select:hover {
          border-color: #111;
        }
        .shop-page__sort-select:focus {
          outline: none;
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(192, 77, 41, 0.1);
        }

        /* NEW: Count text in header */
        .shop-page__count-text {
          margin: 0;
          font-size: var(--text-sm);
          color: #666;
          font-weight: 500;
        }

        /* NEW: Active Filters Display */
        .shop-page__active-filters {
          background: rgba(192, 77, 41, 0.05);
          border-top: 1px solid rgba(192, 77, 41, 0.1);
          border-bottom: 1px solid rgba(192, 77, 41, 0.1);
          padding: var(--space-3) var(--gutter);
          margin: var(--space-3) 0;
        }
        .shop-page__active-filters-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-3);
        }
        .shop-page__filters-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .shop-page__filter-pills {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          align-items: center;
        }
        .filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #C04D29 0%, #D4A574 100%);
          color: var(--color-white);
          border-radius: 20px;
          font-size: var(--text-sm);
          font-weight: 500;
        }
        .filter-pill button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          border-radius: 50%;
          color: var(--color-white);
          font-size: 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .filter-pill button:hover {
          background: rgba(255, 255, 255, 0.6);
        }
        .shop-page__clear-all {
          background: none;
          border: 1px solid #C04D29;
          color: #C04D29;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .shop-page__clear-all:hover {
          background: rgba(192, 77, 41, 0.1);
        }

        /* NEW: No Results State */
        .shop-page__no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: var(--space-8) var(--space-4);
          background: rgba(0, 0, 0, 0.02);
          border-radius: 12px;
          border: 2px dashed var(--border-light);
        }
        .no-results-icon {
          font-size: 4rem;
          margin-bottom: var(--space-3);
        }
        .shop-page__no-results h3 {
          font-size: 1.5rem;
          margin: 0 0 var(--space-2) 0;
          color: #111;
        }
        .shop-page__no-results p {
          color: #666;
          margin: 0 0 var(--space-3) 0;
        }
        .no-results-suggestions {
          text-align: left;
          display: inline-block;
          background: #fff;
          padding: var(--space-3);
          border-radius: 6px;
          margin: var(--space-3) 0;
        }
        .no-results-suggestions p {
          margin: 0 0 var(--space-2) 0;
          font-weight: 600;
          color: #111;
        }
        .no-results-suggestions ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .no-results-suggestions li {
          padding: 4px 0;
          color: #666;
        }
        .no-results-suggestions li:before {
          content: "✓ ";
          color: #111;
          font-weight: 600;
          margin-right: 6px;
        }
        .no-results-btn {
          margin-top: var(--space-3);
          padding: 12px 28px;
          background: var(--color-accent);
          color: var(--color-white);
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .no-results-btn:hover {
          background: #bf5835;
          
          
        }

        /* NEW: Product Card Enhancements */
        .masonry-wrapper {
          column-count: auto;
          column-width: minmax(200px, 1fr);
          gap: var(--space-4);
        }
        .masonry-item {\n          break-inside: avoid;\n          margin-bottom: var(--space-4);\n          border-radius: 6px;\n          transition: box-shadow 0.2s ease;\n        }\n        .masonry-item:hover {\n          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n        }
        .product-card-with-actions {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .product-card-grid-item {\n          display: flex;\n          border-radius: 6px;\n          transition: box-shadow 0.2s ease;\n        }\n        .product-card-grid-item:hover {\n          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n        }
        .product-card__image-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 6px;
          background: #fff;
          aspect-ratio: 1;
        }
        .product-card__image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.2s ease;
        }
        .product-card__image-wrap:hover img {
          opacity: 0.95;
        }
        .product-card__badge {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 4px 10px;
          color: var(--color-white);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border-radius: 4px;
          z-index: 2;
        }
        .product-card__wishlist {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          color: #666;
          cursor: pointer;
          transition: all var(--transition-fast);
          z-index: 3;
          opacity: 0;
        }
        .product-card__image-wrap:hover .product-card__wishlist {
          opacity: 1;
        }
        .product-card__wishlist:hover {
          background: #fff;
          color: #e74c3c;
          ;
        }
        .product-card__wishlist.active {
          opacity: 1;
          color: #e74c3c;
        }
        .product-card__quick-view-btn {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px;
          background: rgba(0, 0, 0, 0.75);
          color: var(--color-white);
          border: none;
          font-weight: 600;
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-base);
          opacity: 0;
          z-index: 2;
        }
        .product-card__image-wrap:hover .product-card__quick-view-btn {
          opacity: 1;
        }
        .product-card__quick-view-btn:hover {
          background: rgba(0, 0, 0, 0.9);
        }
        .product-card__link {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: var(--space-3) 0;
          color: inherit;
        }
        .product-card__title {
          font-size: var(--text-base);
          font-weight: 600;
          color: #111;
          margin: 0 0 var(--space-1) 0;
          line-height: 1.4;
        }
        .product-card__category {
          font-size: var(--text-xs);
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 var(--space-1) 0;
        }
        .product-card__description {
          font-size: var(--text-sm);
          color: #666;
          margin: 0;
          line-height: 1.5;
        }
        .product-card__meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-2);
          padding-top: var(--space-2);
          border-top: 1px solid var(--border-light);
          font-size: var(--text-sm);
        }
        .product-card__price {
          font-weight: 700;
          font-size: var(--text-base);
          color: #111;
        }
        .product-card__stock {
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* NEW: Quick View Modal */
        .quick-view-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
          padding: var(--space-4);
          animation: fadeIn 300ms ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .quick-view-modal__content {
          background: #fff;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
          padding: var(--space-4);
          position: relative;
          animation: slideUp 300ms ease;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .quick-view-modal__close {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.1);
          border: none;
          border-radius: 50%;
          color: #111;
          font-size: 20px;
          cursor: pointer;
          transition: all var(--transition-fast);
          z-index: 1;
        }
        .quick-view-modal__close:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        .quick-view-modal__image-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .quick-view-modal__image-section img {
          width: 100%;
          height: auto;
          border-radius: 6px;
          object-fit: cover;
        }
        .quick-view-modal__thumbnails {
          display: flex;
          gap: var(--space-2);
          overflow-x: auto;
        }
        .quick-view-modal__thumbnail {
          width: 60px;
          height: 60px;
          border: 2px solid var(--border-light);
          border-radius: 6px;
          background: #fff;
          cursor: pointer;
          overflow: hidden;
          flex-shrink: 0;
          transition: all var(--transition-fast);
        }
        .quick-view-modal__thumbnail:hover {
          border-color: #111;
        }
        .quick-view-modal__thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .quick-view-modal__info {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .quick-view-modal__info h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #111;
          line-height: 1.3;
        }
        .quick-view-modal__category {
          font-size: var(--text-sm);
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .quick-view-modal__price {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 1.25rem;
          font-weight: 700;
          color: #111;
        }
        .quick-view-modal__stock {
          font-size: var(--text-sm);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .quick-view-modal__description {
          font-size: var(--text-base);
          color: #666;
          line-height: 1.6;
          margin: var(--space-2) 0;
        }
        .quick-view-modal__actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-4);
        }
        .quick-view-modal__btn-primary {
          padding: 12px 20px;
          background: linear-gradient(135deg, #C04D29 0%, #bf5835 100%);
          color: var(--color-white);
          text-decoration: none;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .quick-view-modal__btn-primary:hover {
          box-shadow: 0 4px 12px rgba(192, 77, 41, 0.3);
          
        }
        .quick-view-modal__btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: 12px 20px;
          background: #fff;
          color: #111;
          border: 2px solid var(--border-light);
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .quick-view-modal__btn-secondary:hover {
          border-color: #111;
          color: #111;
        }
        .quick-view-modal__btn-secondary.active {
          background: rgba(231, 76, 60, 0.1);
          border-color: #e74c3c;
          color: #e74c3c;
        }

        @media (max-width: 768px) {
          .quick-view-modal__content {
            grid-template-columns: 1fr;
            max-height: 95vh;
            padding: var(--space-3);
          }
          .shop-page__header-actions {
            flex-wrap: wrap;
            width: 100%;
          }
          .shop-page__sort-container {
            width: 100%;
          }
          .shop-page__sort-select {
            flex: 1;
            min-width: 150px;
          }
        }

        /* NEW: Sort Dropdown in Header */
        .shop-page__sort-container {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .shop-page__sort-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .shop-page__sort-select {
          padding: 8px 12px;
          background: #fff;
          border: 1px solid var(--border-default);
          border-radius: 6px;
          color: #111;
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .shop-page__sort-select:hover {
          border-color: #111;
        }
        .shop-page__sort-select:focus {
          outline: none;
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(192, 77, 41, 0.1);
        }

        /* NEW: Count text in header */
        .shop-page__count-text {
          margin: 0;
          font-size: var(--text-sm);
          color: #666;
          font-weight: 500;
        }

        /* NEW: Active Filters Display */
        .shop-page__active-filters {
          background: rgba(192, 77, 41, 0.05);
          border-top: 1px solid rgba(192, 77, 41, 0.1);
          border-bottom: 1px solid rgba(192, 77, 41, 0.1);
          padding: var(--space-3) var(--gutter);
          margin: var(--space-3) 0;
        }
        .shop-page__active-filters-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-3);
        }
        .shop-page__filters-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .shop-page__filter-pills {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          align-items: center;
        }
        .filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #C04D29 0%, #D4A574 100%);
          color: var(--color-white);
          border-radius: 20px;
          font-size: var(--text-sm);
          font-weight: 500;
        }
        .filter-pill button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          border-radius: 50%;
          color: var(--color-white);
          font-size: 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .filter-pill button:hover {
          background: rgba(255, 255, 255, 0.6);
        }
        .shop-page__clear-all {
          background: none;
          border: 1px solid #C04D29;
          color: #C04D29;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .shop-page__clear-all:hover {
          background: rgba(192, 77, 41, 0.1);
        }

        /* NEW: No Results State */
        .shop-page__no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: var(--space-8) var(--space-4);
          background: rgba(0, 0, 0, 0.02);
          border-radius: 12px;
          border: 2px dashed var(--border-light);
        }
        .no-results-icon {
          font-size: 4rem;
          margin-bottom: var(--space-3);
        }
        .shop-page__no-results h3 {
          font-size: 1.5rem;
          margin: 0 0 var(--space-2) 0;
          color: #111;
        }
        .shop-page__no-results p {
          color: #666;
          margin: 0 0 var(--space-3) 0;
        }
        .no-results-suggestions {
          text-align: left;
          display: inline-block;
          background: #fff;
          padding: var(--space-3);
          border-radius: 6px;
          margin: var(--space-3) 0;
        }
        .no-results-suggestions p {
          margin: 0 0 var(--space-2) 0;
          font-weight: 600;
          color: #111;
        }
        .no-results-suggestions ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .no-results-suggestions li {
          padding: 4px 0;
          color: #666;
        }
        .no-results-suggestions li:before {
          content: "✓ ";
          color: #111;
          font-weight: 600;
          margin-right: 6px;
        }
        .no-results-btn {
          margin-top: var(--space-3);
          padding: 12px 28px;
          background: var(--color-accent);
          color: var(--color-white);
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .no-results-btn:hover {
          background: #bf5835;
          
          
        }

        /* NEW: Product Card Enhancements */
        .masonry-wrapper {
          column-count: auto;
          column-width: minmax(200px, 1fr);
          gap: var(--space-4);
        }
        .masonry-item {\n          break-inside: avoid;\n          margin-bottom: var(--space-4);\n          border-radius: 6px;\n          transition: box-shadow 0.2s ease;\n        }\n        .masonry-item:hover {\n          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n        }
        .product-card-with-actions {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .product-card-grid-item {\n          display: flex;\n          border-radius: 6px;\n          transition: box-shadow 0.2s ease;\n        }\n        .product-card-grid-item:hover {\n          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n        }
        .product-card__image-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 6px;
          background: #fff;
          aspect-ratio: 1;
        }
        .product-card__image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.2s ease;
        }
        .product-card__image-wrap:hover img {
          opacity: 0.95;
        }
        .product-card__badge {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 4px 10px;
          color: var(--color-white);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border-radius: 4px;
          z-index: 2;
        }
        .product-card__wishlist {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          color: #666;
          cursor: pointer;
          transition: all var(--transition-fast);
          z-index: 3;
          opacity: 0;
        }
        .product-card__image-wrap:hover .product-card__wishlist {
          opacity: 1;
        }
        .product-card__wishlist:hover {
          background: #fff;
          color: #e74c3c;
          ;
        }
        .product-card__wishlist.active {
          opacity: 1;
          color: #e74c3c;
        }
        .product-card__quick-view-btn {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px;
          background: rgba(0, 0, 0, 0.75);
          color: var(--color-white);
          border: none;
          font-weight: 600;
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-base);
          opacity: 0;
          z-index: 2;
        }
        .product-card__image-wrap:hover .product-card__quick-view-btn {
          opacity: 1;
        }
        .product-card__quick-view-btn:hover {
          background: rgba(0, 0, 0, 0.9);
        }
        .product-card__link {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: var(--space-3) 0;
          color: inherit;
        }
        .product-card__title {
          font-size: var(--text-base);
          font-weight: 600;
          color: #111;
          margin: 0 0 var(--space-1) 0;
          line-height: 1.4;
        }
        .product-card__category {
          font-size: var(--text-xs);
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 var(--space-1) 0;
        }
        .product-card__description {
          font-size: var(--text-sm);
          color: #666;
          margin: 0;
          line-height: 1.5;
        }
        .product-card__meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-2);
          padding-top: var(--space-2);
          border-top: 1px solid var(--border-light);
          font-size: var(--text-sm);
        }
        .product-card__price {
          font-weight: 700;
          font-size: var(--text-base);
          color: #111;
        }
        .product-card__stock {
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* NEW: Quick View Modal */
        .quick-view-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
          padding: var(--space-4);
          animation: fadeIn 300ms ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .quick-view-modal__content {
          background: #fff;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
          padding: var(--space-4);
          position: relative;
          animation: slideUp 300ms ease;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .quick-view-modal__close {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.1);
          border: none;
          border-radius: 50%;
          color: #111;
          font-size: 20px;
          cursor: pointer;
          transition: all var(--transition-fast);
          z-index: 1;
        }
        .quick-view-modal__close:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        .quick-view-modal__image-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .quick-view-modal__image-section img {
          width: 100%;
          height: auto;
          border-radius: 6px;
          object-fit: cover;
        }
        .quick-view-modal__thumbnails {
          display: flex;
          gap: var(--space-2);
          overflow-x: auto;
        }
        .quick-view-modal__thumbnail {
          width: 60px;
          height: 60px;
          border: 2px solid var(--border-light);
          border-radius: 6px;
          background: #fff;
          cursor: pointer;
          overflow: hidden;
          flex-shrink: 0;
          transition: all var(--transition-fast);
        }
        .quick-view-modal__thumbnail:hover {
          border-color: #111;
        }
        .quick-view-modal__thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .quick-view-modal__info {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .quick-view-modal__info h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #111;
          line-height: 1.3;
        }
        .quick-view-modal__category {
          font-size: var(--text-sm);
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .quick-view-modal__price {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 1.25rem;
          font-weight: 700;
          color: #111;
        }
        .quick-view-modal__stock {
          font-size: var(--text-sm);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .quick-view-modal__description {
          font-size: var(--text-base);
          color: #666;
          line-height: 1.6;
          margin: var(--space-2) 0;
        }
        .quick-view-modal__actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-4);
        }
        .quick-view-modal__btn-primary {
          padding: 12px 20px;
          background: linear-gradient(135deg, #C04D29 0%, #bf5835 100%);
          color: var(--color-white);
          text-decoration: none;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .quick-view-modal__btn-primary:hover {
          box-shadow: 0 4px 12px rgba(192, 77, 41, 0.3);
          
        }
        .quick-view-modal__btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: 12px 20px;
          background: #fff;
          color: #111;
          border: 2px solid var(--border-light);
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .quick-view-modal__btn-secondary:hover {
          border-color: #111;
          color: #111;
        }
        .quick-view-modal__btn-secondary.active {
          background: rgba(231, 76, 60, 0.1);
          border-color: #e74c3c;
          color: #e74c3c;
        }

        @media (max-width: 768px) {
          .quick-view-modal__content {
            grid-template-columns: 1fr;
            max-height: 95vh;
            padding: var(--space-3);
          }
          .shop-page__header-actions {
            flex-wrap: wrap;
            width: 100%;
          }
          .shop-page__sort-container {
            width: 100%;
          }
          .shop-page__sort-select {
            flex: 1;
            min-width: 150px;
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




