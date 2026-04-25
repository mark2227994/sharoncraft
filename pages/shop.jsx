import { useEffect, useMemo, useState } from "react";
import CategoryStrip from "../components/CategoryStrip";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import ProductCard from "../components/ProductCard";
import SeoHead from "../components/SeoHead";
import ShopSidebar from "../components/ShopSidebar";
import Icon from "../components/icons";
import { shopCategoryTree } from "../data/site";
import { filterPublishedProducts, getCategoryPriority, getJewelryTypePriority } from "../lib/products";
import { readProducts } from "../lib/store";

const SHOP_TABS = shopCategoryTree.map((node) => node.label);

function flattenShopNodes(nodes, trail = []) {
  return nodes.flatMap((node) => [
    { ...node, trail },
    ...(Array.isArray(node.children) ? flattenShopNodes(node.children, [...trail, node.id]) : []),
  ]);
}

const FLAT_SHOP_NODES = flattenShopNodes(shopCategoryTree);
const SHOP_NODE_BY_ID = new Map(FLAT_SHOP_NODES.map((node) => [node.id, node]));
const SHOP_NODE_BY_LABEL = new Map(shopCategoryTree.map((node) => [node.label, node]));
const LEGACY_CATEGORY_MAP = new Map([
  ["All", "all"],
  ["Jewellery", "jewellery"],
  ["Accessories", "accessories"],
  ["Home Decor", "home-living"],
  ["Gift Sets", "gifted-carry"],
  ["Bridal & Occasion", "african-wear"],
  ["African Wear", "african-wear"],
  ["Art & Craft", "art-craft"],
  ["Home & Living", "home-living"],
  ["Gifted Carry", "gifted-carry"],
]);
const LEGACY_SUBCATEGORY_MAP = new Map([
  ["necklace", "necklaces"],
  ["bracelet", "bracelets"],
  ["earring", "earrings"],
]);

function getProductSearchText(product) {
  return [
    product?.name,
    product?.description,
    product?.shortDescription,
    product?.heritageStory,
    product?.category,
    product?.jewelryType,
    ...(Array.isArray(product?.materials) ? product.materials : []),
    ...(Array.isArray(product?.details) ? product.details : []),
  ]
    .join(" ")
    .toLowerCase();
}

function matchesRule(product, match) {
  if (!match) return true;

  if (Array.isArray(match.categories) && match.categories.length > 0 && !match.categories.includes(product.category)) {
    return false;
  }

  if (
    Array.isArray(match.jewelryTypes) &&
    match.jewelryTypes.length > 0 &&
    !match.jewelryTypes.includes(product.jewelryType)
  ) {
    return false;
  }

  if (Array.isArray(match.keywords) && match.keywords.length > 0) {
    const haystack = getProductSearchText(product);
    if (!match.keywords.some((keyword) => haystack.includes(String(keyword).toLowerCase()))) {
      return false;
    }
  }

  return true;
}

function resolveCategoryId(queryCategory) {
  const raw = typeof queryCategory === "string" ? queryCategory.trim() : "";
  if (!raw) return "all";
  return LEGACY_CATEGORY_MAP.get(raw) || SHOP_NODE_BY_ID.get(raw)?.id || "all";
}

function resolveSubcategoryId(querySubcategory, queryJewelryType) {
  const rawSubcategory = typeof querySubcategory === "string" ? querySubcategory.trim() : "";
  if (rawSubcategory && SHOP_NODE_BY_ID.has(rawSubcategory)) {
    return rawSubcategory;
  }

  const rawJewelryType = typeof queryJewelryType === "string" ? queryJewelryType.trim() : "";
  if (rawJewelryType) {
    return LEGACY_SUBCATEGORY_MAP.get(rawJewelryType) || "";
  }

  return "";
}

function matchesPriceRange(product, activePriceRange) {
  const price = Number(product?.price || 0);

  if (activePriceRange === "under-1000") return price < 1000;
  if (activePriceRange === "1000-3000") return price >= 1000 && price <= 3000;
  if (activePriceRange === "3000-5000") return price > 3000 && price <= 5000;
  if (activePriceRange === "above-5000") return price > 5000;

  return true;
}

export default function ShopPage({ products, initialCategory, initialSubcategory }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [activePriceRange, setActivePriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE_DESKTOP = 24;
  const ITEMS_PER_PAGE_MOBILE = 12;
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "recent", label: "Newest" },
    { value: "price-asc", label: "Price: Low" },
    { value: "price-desc", label: "Price: High" },
  ];

  const activeCategoryNode = SHOP_NODE_BY_ID.get(activeCategory) || SHOP_NODE_BY_ID.get("all");
  const activeSubcategoryNode = activeSubcategory ? SHOP_NODE_BY_ID.get(activeSubcategory) : null;
  const activeTabLabel = activeCategoryNode?.label || "All";

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
      .filter((product) => (activeCategory === "all" ? true : matchesRule(product, activeCategoryNode?.match)))
      .filter((product) => (activeSubcategoryNode ? matchesRule(product, activeSubcategoryNode.match) : true))
      .filter((product) => (showAvailableOnly ? !product.isSold && product.stock > 0 : true))
      .filter((product) => matchesPriceRange(product, activePriceRange));

    if (sortBy === "recent") {
      return next
        .slice()
        .sort((left, right) => Number(Boolean(right.recent || right.isNew || right.newArrival)) - Number(Boolean(left.recent || left.isNew || left.newArrival)));
    }

    if (sortBy === "price-asc") return next.slice().sort((left, right) => left.price - right.price);
    if (sortBy === "price-desc") return next.slice().sort((left, right) => right.price - left.price);

    return next.slice().sort((left, right) => {
      const featuredDiff = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
      if (featuredDiff !== 0) return featuredDiff;

      const categoryDiff = getCategoryPriority(left.category) - getCategoryPriority(right.category);
      if (categoryDiff !== 0) return categoryDiff;

      const jewelryDiff = getJewelryTypePriority(left.jewelryType) - getJewelryTypePriority(right.jewelryType);
      if (jewelryDiff !== 0) return jewelryDiff;

      return left.name.localeCompare(right.name);
    });
  }, [
    activeCategory,
    activeCategoryNode,
    activePriceRange,
    activeSubcategoryNode,
    products,
    showAvailableOnly,
    sortBy,
  ]);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  function handleCategorySelect(label) {
    const node = SHOP_NODE_BY_LABEL.get(label);
    if (!node) return;
    setActiveCategory(node.id);
    setActiveSubcategory("");
  }

  function clearAllFilters() {
    setActiveCategory("all");
    setActiveSubcategory("");
    setShowAvailableOnly(false);
    setActivePriceRange("all");
    setSortBy("featured");
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
      <CategoryStrip
        className="shop-category-strip"
        categories={SHOP_TABS}
        activeCategory={activeTabLabel}
        onSelect={handleCategorySelect}
      />

      <main className="shop-page">
        <div className="shop-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span className="shop-breadcrumb__separator">›</span>
          <a href="/shop">Shop</a>
          {activeCategory !== "all" ? (
            <>
              <span className="shop-breadcrumb__separator">›</span>
              <span className="shop-breadcrumb__current">{activeCategoryNode?.label}</span>
            </>
          ) : null}
          {activeSubcategoryNode ? (
            <>
              <span className="shop-breadcrumb__separator">›</span>
              <span className="shop-breadcrumb__current">{activeSubcategoryNode.label}</span>
            </>
          ) : null}
        </div>

        <div className="shop-page__layout">
          <ShopSidebar
            categoryTree={shopCategoryTree}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            activeSubcategory={activeSubcategory}
            onSubcategoryChange={setActiveSubcategory}
            activePriceRange={activePriceRange}
            onPriceRangeChange={setActivePriceRange}
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
                  <span>Filter</span>
                </button>
              ) : (
                <p className="shop-page__count-text">{filteredProducts.length} pieces found</p>
              )}

              {isMobile ? (
                <div className="shop-page__results-controls">
                  <p className="shop-page__count-text">{filteredProducts.length} pieces found</p>
                  <label className="shop-page__sort-select-wrap">
                    <span className="shop-page__sort-select-label">Sort</span>
                    <select
                      className="shop-page__sort-select"
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
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

            {paginatedProducts.length === 0 ? (
              <div className="shop-page__no-results">
                <div className="no-results-icon">?</div>
                <h3>No products found</h3>
                <p>We couldn&apos;t find items matching these filters.</p>
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
  const initialCategory = resolveCategoryId(query.category);
  const initialSubcategory = resolveSubcategoryId(query.subcategory, query.jewelryType);

  return {
    props: {
      products,
      initialCategory,
      initialSubcategory,
    },
  };
}
