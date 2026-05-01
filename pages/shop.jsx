import { useEffect, useMemo, useState } from "react";
import CategoryStrip from "../components/CategoryStrip";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import ProductCard from "../components/ProductCard";
import SeoHead from "../components/SeoHead";
import ShopSidebar from "../components/ShopSidebar";
import { normalizeShopCategoryTree, shopCategoryTree } from "../data/site";
import { readAdminContentField } from "../lib/admin-content";
import {
  filterPublishedProducts,
  getCategoryPriority,
  getJewelryTypePriority,
} from "../lib/products";
import { readProducts } from "../lib/store";

const ITEMS_PER_PAGE = 20;
const CHEVRON = "\u203A";
const RANGE_DASH = "\u2013";
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "recent", label: "Newest" },
  { value: "price-asc", label: "Price: Low" },
  { value: "price-desc", label: "Price: High" },
];

function flattenShopNodes(nodes, trail = []) {
  return nodes.flatMap((node) => [
    { ...node, trail },
    ...(Array.isArray(node.children)
      ? flattenShopNodes(node.children, [...trail, node.id])
      : []),
  ]);
}

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

function compactText(value) {
  return String(value || "").trim();
}

function slugifyShopValue(value) {
  return compactText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveShopCategoryId(value) {
  const rawValue = compactText(value);
  if (!rawValue) return "";

  return (
    LEGACY_CATEGORY_MAP.get(rawValue) ||
    LEGACY_CATEGORY_MAP.get(rawValue.replace(/\s+/g, " ")) ||
    LEGACY_CATEGORY_MAP.get(rawValue.replace(/\sand\s/gi, " & ")) ||
    LEGACY_CATEGORY_MAP.get(rawValue.replace(/\s&\s/g, " and ")) ||
    LEGACY_CATEGORY_MAP.get(rawValue.replace(/-/g, " ")) ||
    slugifyShopValue(rawValue)
  );
}

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

  if (Array.isArray(match.categories) && match.categories.length > 0) {
    const productCategoryId = resolveShopCategoryId(product?.category);
    const categoryMatch = match.categories.some((category) => {
      const matchCategoryId = resolveShopCategoryId(category);
      return matchCategoryId
        ? matchCategoryId === productCategoryId
        : category === product.category;
    });

    if (!categoryMatch) {
      return false;
    }
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
    if (
      !match.keywords.some((keyword) =>
        haystack.includes(String(keyword).toLowerCase()),
      )
    ) {
      return false;
    }
  }

  return true;
}

function productMatchesCategoryNode(product, node) {
  if (!node) return false;
  return resolveShopCategoryId(product?.category) === node.id;
}

function getShopNodeLookupValues(node) {
  return Array.from(
    new Set(
      [node?.id, node?.label, node?.queryValue]
        .flatMap((value) => {
          const safeValue = compactText(value);
          return safeValue ? [safeValue, slugifyShopValue(safeValue)] : [];
        })
        .filter(Boolean),
    ),
  );
}

function productMatchesSubcategory(product, node) {
  const productSubcategory = compactText(product?.subcategory);
  if (!productSubcategory || !node) return false;

  const productValues = new Set(
    [productSubcategory, slugifyShopValue(productSubcategory)].filter(Boolean),
  );
  return getShopNodeLookupValues(node).some((value) =>
    productValues.has(value),
  );
}

function resolveSubcategoryId(
  querySubcategory,
  queryJewelryType,
  nodeByLookup,
) {
  const rawSubcategory = compactText(querySubcategory);
  if (rawSubcategory) {
    const lookupKey = slugifyShopValue(rawSubcategory);
    return (
      nodeByLookup.get(rawSubcategory) || nodeByLookup.get(lookupKey) || ""
    );
  }

  const rawJewelryType = compactText(queryJewelryType);
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

export default function ShopPage({
  products,
  initialCategory,
  initialSubcategory,
  categoryTree,
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSubcategory, setActiveSubcategory] =
    useState(initialSubcategory);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [activePriceRange, setActivePriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedCategoryTree = useMemo(
    () => normalizeShopCategoryTree(categoryTree),
    [categoryTree],
  );
  const shopTabs = useMemo(
    () => normalizedCategoryTree.map((node) => node.label),
    [normalizedCategoryTree],
  );
  const flatShopNodes = useMemo(
    () => flattenShopNodes(normalizedCategoryTree),
    [normalizedCategoryTree],
  );
  const shopNodeById = useMemo(
    () => new Map(flatShopNodes.map((node) => [node.id, node])),
    [flatShopNodes],
  );
  const shopNodeByLabel = useMemo(
    () => new Map(normalizedCategoryTree.map((node) => [node.label, node])),
    [normalizedCategoryTree],
  );

  const activeCategoryNode =
    shopNodeById.get(activeCategory) || shopNodeById.get("all");
  const activeSubcategoryNode = activeSubcategory
    ? shopNodeById.get(activeSubcategory)
    : null;
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
      setIsSortOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || (!isDrawerOpen && !isSortOpen)) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen, isMobile, isSortOpen]);

  const filteredProducts = useMemo(() => {
    const next = products
      .filter((product) => {
        if (activeCategory === "all") return true;
        return (
          productMatchesCategoryNode(product, activeCategoryNode) ||
          matchesRule(product, activeCategoryNode?.match)
        );
      })
      .filter((product) => {
        if (!activeSubcategoryNode) return true;
        return (
          productMatchesSubcategory(product, activeSubcategoryNode) ||
          matchesRule(product, activeSubcategoryNode.match)
        );
      })
      .filter((product) =>
        showAvailableOnly ? !product.isSold && product.stock > 0 : true,
      )
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

    if (sortBy === "price-asc")
      return next.slice().sort((left, right) => left.price - right.price);
    if (sortBy === "price-desc")
      return next.slice().sort((left, right) => right.price - left.price);

    return next.slice().sort((left, right) => {
      const featuredDiff =
        Number(Boolean(right.featured)) - Number(Boolean(left.featured));
      if (featuredDiff !== 0) return featuredDiff;

      const categoryDiff =
        getCategoryPriority(left.category) -
        getCategoryPriority(right.category);
      if (categoryDiff !== 0) return categoryDiff;

      const jewelryDiff =
        getJewelryTypePriority(left.jewelryType) -
        getJewelryTypePriority(right.jewelryType);
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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  const gridRenderKey = [
    activeCategory,
    activeSubcategory,
    showAvailableOnly ? "stock" : "all-stock",
    activePriceRange,
    sortBy,
    currentPage,
  ].join("|");

  const activeFilterCount = [
    activeCategory !== "all",
    Boolean(activeSubcategory),
    showAvailableOnly,
    activePriceRange !== "all",
  ].filter(Boolean).length;

  const showingFrom =
    filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingTo =
    filteredProducts.length === 0
      ? 0
      : Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);
  const shouldShowPagination = filteredProducts.length > ITEMS_PER_PAGE;
  const resultsLabel = `${filteredProducts.length} pieces found`;

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeCategory,
    activePriceRange,
    activeSubcategory,
    showAvailableOnly,
    sortBy,
  ]);

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

    if (startPage > 2) pages.push("ellipsis-start");
    for (let page = startPage; page <= endPage; page += 1) pages.push(page);
    if (endPage < totalPages - 1) pages.push("ellipsis-end");
    pages.push(totalPages);

    return pages;
  }

  function handleCategorySelect(label) {
    const node = shopNodeByLabel.get(label);
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
    setIsDrawerOpen(false);
    setIsSortOpen(false);
  }

  function handleSortChange(nextSort) {
    setSortBy(nextSort);
    setIsSortOpen(false);
  }

  function openFilters() {
    setIsSortOpen(false);
    setIsDrawerOpen(true);
  }

  function openSort() {
    setIsDrawerOpen(false);
    setIsSortOpen(true);
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
        categories={shopTabs}
        activeCategory={activeTabLabel}
        onSelect={handleCategorySelect}
      />

      <main className="shop-page">
        <div className="shop-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span className="shop-breadcrumb__separator">{CHEVRON}</span>
          <a href="/shop">Shop</a>
          {activeCategory !== "all" ? (
            <>
              <span className="shop-breadcrumb__separator">{CHEVRON}</span>
              <span className="shop-breadcrumb__current">
                {activeCategoryNode?.label}
              </span>
            </>
          ) : null}
          {activeSubcategoryNode ? (
            <>
              <span className="shop-breadcrumb__separator">{CHEVRON}</span>
              <span className="shop-breadcrumb__current">
                {activeSubcategoryNode.label}
              </span>
            </>
          ) : null}
        </div>

        <div className="shop-page__layout">
          <ShopSidebar
            categoryTree={normalizedCategoryTree}
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
                <>
                  <button
                    type="button"
                    className="shop-page__filter-btn"
                    onClick={openFilters}
                  >
                    <span>Filter</span>
                    {activeFilterCount > 0 ? (
                      <span className="shop-page__filter-count">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </button>

                  <p className="shop-page__count-text">{resultsLabel}</p>

                  <button
                    type="button"
                    className="shop-page__sort-trigger"
                    onClick={openSort}
                  >
                    <span>Sort</span>
                  </button>
                </>
              ) : (
                <>
                  <p className="shop-page__count-text">{resultsLabel}</p>

                  <div
                    className="shop-page__sort-links"
                    aria-label="Sort products"
                  >
                    {SORT_OPTIONS.map((option, index) => (
                      <div key={option.value} className="shop-page__sort-item">
                        <button
                          type="button"
                          className={`shop-page__sort-link ${sortBy === option.value ? "shop-page__sort-link--active" : ""}`}
                          onClick={() => handleSortChange(option.value)}
                        >
                          {option.label}
                        </button>
                        {index < SORT_OPTIONS.length - 1 ? (
                          <span className="shop-page__sort-separator">|</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {paginatedProducts.length === 0 ? (
              <div className="shop-page__no-results">
                <EmptyStateIcon />
                <h3>No pieces found</h3>
                <p>Try adjusting your filters or browse all pieces</p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="shop-page__empty-button"
                >
                  View All Pieces
                </button>
              </div>
            ) : (
              <div key={gridRenderKey} className="shop-products__catalog">
                {paginatedProducts.map((product, index) => (
                  <div
                    key={`${product.id}-${gridRenderKey}`}
                    className="product-card-grid-item shop-products__catalog-item"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <ProductCard product={product} variant="shop-catalog" />
                  </div>
                ))}
              </div>
            )}

            {shouldShowPagination ? (
              <>
                {!isMobile ? (
                  <div className="shop-pagination shop-pagination--desktop">
                    <button
                      type="button"
                      className="shop-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => page - 1)}
                    >
                      ← Prev
                    </button>

                    <div className="shop-page-numbers">
                      {getPageNumbers().map((pageNum) =>
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
                          <span key={pageNum} className="shop-page-ellipsis">
                            …
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
                      Next →
                    </button>
                  </div>
                ) : (
                  <div className="shop-pagination shop-pagination--mobile">
                    <button
                      type="button"
                      className="shop-pagination__mobile-link"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => page - 1)}
                    >
                      ← Previous
                    </button>
                    <span className="shop-pagination__mobile-status">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="shop-pagination__mobile-link"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((page) => page + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}

                <p className="shop-page__showing-text">
                  Showing {`${showingFrom}${RANGE_DASH}${showingTo}`} of{" "}
                  {filteredProducts.length} pieces
                </p>
              </>
            ) : paginatedProducts.length > 0 ? (
              <p className="shop-page__showing-text">
                Showing {`${showingFrom}${RANGE_DASH}${showingTo}`} of{" "}
                {filteredProducts.length} pieces
              </p>
            ) : null}
          </section>
        </div>
      </main>

      <Footer />

      {isMobile ? (
        <div
          className={`shop-page__sort-overlay ${isSortOpen ? "shop-page__sort-overlay--open" : ""}`}
          aria-hidden={!isSortOpen}
          onClick={() => setIsSortOpen(false)}
        >
          <div
            className="shop-page__sort-sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shop-page__sort-sheet-header">
              <span className="shop-page__sort-sheet-title">Sort Pieces</span>
              <button
                type="button"
                className="shop-page__sort-sheet-close"
                onClick={() => setIsSortOpen(false)}
              >
                ✕ Close
              </button>
            </div>

            <div className="shop-page__sort-sheet-options">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`shop-page__sort-sheet-option ${
                    sortBy === option.value
                      ? "shop-page__sort-sheet-option--active"
                      : ""
                  }`}
                  onClick={() => handleSortChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export async function getServerSideProps({ query }) {
  const products = filterPublishedProducts(await readProducts());
  const categoryTree = normalizeShopCategoryTree(
    await readAdminContentField("shopTaxonomy", shopCategoryTree),
  );
  const flatNodes = flattenShopNodes(categoryTree);
  const nodeById = new Map(flatNodes.map((node) => [node.id, node]));
  const nodeByLookup = new Map(
    flatNodes.flatMap((node) =>
      getShopNodeLookupValues(node).map((value) => [value, node.id]),
    ),
  );
  const nodeByQueryValue = new Map(
    categoryTree
      .map((node) => [String(node.queryValue || "").trim(), node.id])
      .filter(([queryValue]) => Boolean(queryValue)),
  );
  const rawCategory =
    typeof query.category === "string" ? query.category.trim() : "";
  const initialCategory =
    LEGACY_CATEGORY_MAP.get(rawCategory) ||
    nodeByQueryValue.get(rawCategory) ||
    (rawCategory && nodeById.has(rawCategory) ? rawCategory : "all");
  const initialSubcategory = resolveSubcategoryId(
    query.subcategory,
    query.jewelryType,
    nodeByLookup,
  );

  return {
    props: {
      products,
      initialCategory,
      initialSubcategory,
      categoryTree,
    },
  };
}
