import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import Icon from "../components/icons";
import SeoHead from "../components/SeoHead";
import {
  ACTIVE_CATEGORIES,
  AUDIENCE_FILTERS,
  getActiveCategoryBySlug,
  getAudienceBySlug,
  getSubcategoryBySlug,
  SMART_FILTERS,
} from "../lib/categories";

const PAGE_SIZE = 12;
const PRODUCT_SELECT = [
  "id",
  "name",
  "slug",
  "price",
  "original_price",
  "sale_price",
  "images",
  "artisan",
  "category",
  "subcategory",
  "stock_quantity",
  "product_type",
  "production_time",
  "audience",
  "is_new",
  "is_best_seller",
].join(", ");

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
];

function getSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://vonzscriztdcdhobulhy.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

function normalizeQueryValue(value) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function isValidSort(value) {
  return SORT_OPTIONS.some((option) => option.value === value);
}

function getSmartFilter(slug) {
  return SMART_FILTERS.find((filter) => filter.slug === slug);
}

function getHeading({ activeCategory, activeSubcategory, activeAudience, activeFilter }) {
  const parts = [];

  if (activeCategory !== "all") {
    const category = getActiveCategoryBySlug(activeCategory);
    if (category) {
      parts.push(
        activeSubcategory
          ? getSubcategoryBySlug(category.slug, activeSubcategory)?.name || category.name
          : category.name,
      );
    }
  }

  if (activeAudience) {
    const audience = getAudienceBySlug(activeAudience);
    if (audience) parts.push(audience.name);
  }

  if (activeFilter) {
    const filter = getSmartFilter(activeFilter);
    if (filter) parts.push(filter.label);
  }

  return parts.length ? parts.join(" · ") : "Shop";
}

function buildQuery({ category, subcategory, audience, filter, sort }) {
  const query = {};
  if (category && category !== "all") query.cat = category;
  if (subcategory) query.sub = subcategory;
  if (audience) query.audience = audience;
  if (filter) query.filter = filter;
  if (sort && sort !== "featured") query.sort = sort;
  return query;
}

function applySort(query, sortBy) {
  if (sortBy === "newest") {
    return query.order("created_at", { ascending: false });
  }

  if (sortBy === "price_low") {
    return query.order("price", { ascending: true });
  }

  if (sortBy === "price_high") {
    return query.order("price", { ascending: false });
  }

  return query
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
}

async function queryProducts({ category, subcategory, audience, filter, sort, page }) {
  const supabase = getSupabaseClient();
  if (!supabase) return { products: [], total: 0, error: "Supabase is not configured." };

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_visible", true);

  if (category && category !== "all") {
    const selectedCategory = getActiveCategoryBySlug(category);
    if (selectedCategory) {
      query = query.eq("category", selectedCategory.name);
    }
  }

  if (subcategory) {
    const selectedCategory = getActiveCategoryBySlug(category);
    const selectedSubcategory = selectedCategory
      ? getSubcategoryBySlug(selectedCategory.slug, subcategory)
      : null;
    query = query.eq("subcategory", selectedSubcategory?.name || subcategory);
  }

  if (audience) {
    const selectedAudience = getAudienceBySlug(audience);
    if (selectedAudience?.value && selectedAudience.value !== "unisex") {
      query = query.in("audience", [selectedAudience.value, "unisex"]);
    } else if (selectedAudience?.value === "unisex") {
      query = query.eq("audience", "unisex");
    }
  }

  if (filter === "best-sellers") {
    query = query.eq("is_best_seller", true);
  }

  if (filter === "new-arrivals") {
    query = query.eq("is_new", true);
  }

  if (filter === "ready-to-ship") {
    query = query.eq("product_type", "ready_to_ship").gt("stock_quantity", 0);
  }

  if (filter === "made-to-order") {
    query = query.eq("product_type", "made_to_order");
  }

  query = applySort(query, sort);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) {
    return { products: [], total: 0, error: error.message };
  }

  return { products: data || [], total: count || 0, error: "" };
}

function SortSelect({ value, onChange, id = "shop-sort" }) {
  return (
    <label className="shop-sort" htmlFor={id}>
      <span className="sr-only">Sort products</span>
      <span className="shop-sort__label">Sort by:</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </label>
  );
}

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      className={`shop-filter-chip ${active ? "shop-filter-chip--active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function ShopPage({ initialProducts = [], initialTotal = 0 }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [activeAudience, setActiveAudience] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasHydratedQuery, setHasHydratedQuery] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filterStuck, setFilterStuck] = useState(false);
  const latestRequestRef = useRef(0);
  const applyingPopStateRef = useRef(false);
  const lastUrlRef = useRef("");
  const filterSentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = filterSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFilterStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const activeCategoryData = activeCategory !== "all" ? getActiveCategoryBySlug(activeCategory) : null;
  const activeFilterData = activeFilter ? getSmartFilter(activeFilter) : null;
  const activeAudienceData = activeAudience ? getAudienceBySlug(activeAudience) : null;
  const heading = getHeading({ activeCategory, activeSubcategory, activeAudience, activeFilter });
  const descriptionText = useMemo(() => {
    if (activeFilterData) {
      return activeFilterData.description || "";
    }
    if (activeAudienceData) {
      return activeAudienceData.description || "";
    }
    if (activeCategoryData) {
      return activeCategoryData.description || "";
    }
    return "Handcrafted beadwork, jewelry, and lifestyle accessories made in Nairobi.";
  }, [activeAudienceData, activeCategoryData, activeFilterData]);

  const hasActiveFilter = activeCategory !== "all" || activeSubcategory || activeAudience || activeFilter;
  const activeFilterCount = [
    activeCategory !== "all",
    activeSubcategory,
    activeAudience,
    activeFilter,
  ].filter(Boolean).length;
  const shownCount = products.length;
  const canLoadMore = shownCount < total;

  const subcategories = useMemo(
    () => activeCategoryData?.subcategories || [],
    [activeCategoryData],
  );

  const fetchProducts = useCallback(
    async ({ nextPage = 1, append = false } = {}) => {
      const requestId = latestRequestRef.current + 1;
      latestRequestRef.current = requestId;
      if (append) setLoadingMore(true);
      else setLoading(true);

      const result = await queryProducts({
        category: activeCategory,
        subcategory: activeSubcategory,
        audience: activeAudience,
        filter: activeFilter,
        sort: sortBy,
        page: nextPage,
      });

      if (requestId === latestRequestRef.current) {
        setProducts((current) => (append ? [...current, ...result.products] : result.products));
        setTotal(result.total);
        setPage(nextPage);
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [activeCategory, activeSubcategory, activeAudience, activeFilter, sortBy],
  );

  const applyUrlState = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const nextCategory = normalizeQueryValue(params.get("cat")) || "all";
    const nextSubcategory = normalizeQueryValue(params.get("sub"));
    const nextAudience = normalizeQueryValue(params.get("audience"));
    const nextFilter = normalizeQueryValue(params.get("filter"));
    const nextSort = normalizeQueryValue(params.get("sort"));

    setActiveCategory(getActiveCategoryBySlug(nextCategory) ? nextCategory : "all");
    setActiveSubcategory(nextSubcategory || "");
    setActiveAudience(getAudienceBySlug(nextAudience) ? nextAudience : "");
    setActiveFilter(getSmartFilter(nextFilter) ? nextFilter : "");
    setSortBy(isValidSort(nextSort) ? nextSort : "featured");
  }, []);

  useEffect(() => {
    applyUrlState();
    lastUrlRef.current = `${window.location.pathname}${window.location.search}`;
    setHasHydratedQuery(true);

    function handlePopState() {
      applyingPopStateRef.current = true;
      applyUrlState();
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [applyUrlState]);

  useEffect(() => {
    if (!hasHydratedQuery) return;
    const query = buildQuery({
      category: activeCategory,
      subcategory: activeSubcategory,
      audience: activeAudience,
      filter: activeFilter,
      sort: sortBy,
    });
    const search = new URLSearchParams(query).toString();
    const nextUrl = search ? `/shop?${search}` : "/shop";

    if (lastUrlRef.current !== nextUrl) {
      if (applyingPopStateRef.current) {
        applyingPopStateRef.current = false;
      } else {
        window.history.pushState(null, "", nextUrl);
      }
      lastUrlRef.current = nextUrl;
    }
    fetchProducts({ nextPage: 1, append: false });
  }, [activeCategory, activeSubcategory, activeAudience, activeFilter, sortBy, hasHydratedQuery, fetchProducts]);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      const filterShell = document.querySelector(".shop-filter-shell");
      if (filterShell) {
        const rect = filterShell.getBoundingClientRect();
        const absoluteTop = window.pageYOffset + rect.top;
        const offset = 86; // height of fixed header + announcement
        if (window.pageYOffset > absoluteTop - offset) {
          window.scrollTo({ top: absoluteTop - offset, behavior: "auto" });
        }
      } else if (window.pageYOffset > 140) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  };

  function selectAll() {
    setActiveCategory("all");
    setActiveSubcategory("");
    setActiveAudience("");
    setActiveFilter("");
    setMobileFiltersOpen(false);
    scrollToTop();
  }

  function selectCategory(categorySlug) {
    setActiveCategory((current) => (current === categorySlug ? "all" : categorySlug));
    setActiveSubcategory("");
    scrollToTop();
  }

  function selectSmartFilter(filterSlug) {
    setActiveFilter((current) => (current === filterSlug ? "" : filterSlug));
    scrollToTop();
  }

  function selectAudience(audienceSlug) {
    setActiveAudience((current) => (current === audienceSlug ? "" : audienceSlug));
    scrollToTop();
  }

  function clearFilters() {
    setActiveCategory("all");
    setActiveSubcategory("");
    setActiveAudience("");
    setActiveFilter("");
    setSortBy("featured");
    setMobileFiltersOpen(false);
    scrollToTop();
  }

  async function loadMore() {
    if (loadingMore || !canLoadMore) return;
    await fetchProducts({ nextPage: page + 1, append: true });
  }
  return (
    <>
      <SeoHead
        title="Shop Handmade Kenyan Jewellery, Gifts And Decor"
        description="Browse SharonCraft necklaces, bracelets, earrings, and artisan-made pieces from Kenya."
        path="/shop"
      />
      <Nav />
      <main className="shop-page shop-page--clean">
        <header className="shop-header">
          <div className="shop-header__content">
            <span className="shop-header__label">Collection // SharonCraft</span>
            <h1 className="shop-header__title">
              {heading}
            </h1>
            <span className="shop-header__count-badge">
              {loading ? "..." : total} {total === 1 ? "piece" : "pieces"}
            </span>
            <p className="shop-header__description">{descriptionText}</p>
          </div>
        </header>

        <div ref={filterSentinelRef} className="shop-filter-sentinel" aria-hidden="true" />
        
        {/* Sticky Toolbar Bar replacing old scrollable chip rows */}
        <div className={`shop-toolbar-bar${filterStuck ? " is-stuck" : ""}`}>
          <div className="shop-toolbar-bar__info">
            <span>{loading ? "Loading..." : `${total} ${total === 1 ? "piece" : "pieces"}`}</span>
          </div>
          <div className="shop-toolbar-bar__actions">
            <button
              type="button"
              className={`shop-toolbar-filter-btn ${mobileFiltersOpen ? "is-active" : ""}`}
              onClick={() => setMobileFiltersOpen((current) => !current)}
            >
              <Icon name="sliders" size={16} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="shop-toolbar-filter-count">{activeFilterCount}</span>
              )}
            </button>
            <div className="shop-toolbar-sort-wrap">
              <SortSelect value={sortBy} onChange={setSortBy} id="shop-sort-toolbar" />
            </div>
          </div>
        </div>

        {/* Slide-out Filter Drawer for desktop (side) & mobile (bottom-sheet) */}
        <div className={`shop-filter-drawer ${mobileFiltersOpen ? "is-open" : ""}`} aria-modal="true" role="dialog">
          <div className="shop-filter-drawer__overlay" onClick={() => setMobileFiltersOpen(false)} />
          <div className="shop-filter-drawer__content">
            <div className="shop-filter-drawer__header">
              <h3>Filters</h3>
              <button type="button" className="shop-filter-drawer__close" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                &times;
              </button>
            </div>
            
            <div className="shop-filter-drawer__body">
              {/* Categories */}
              <div className="shop-filter-drawer__section">
                <h4>Category</h4>
                <div className="shop-filter-drawer__chips">
                  <FilterChip active={activeCategory === "all"} onClick={selectAll}>
                    All
                  </FilterChip>
                  {ACTIVE_CATEGORIES.map((category) => (
                    <FilterChip
                      key={category.slug}
                      active={activeCategory === category.slug}
                      onClick={() => selectCategory(category.slug)}
                    >
                      {category.name}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Subcategories (Dynamic type filtering) */}
              {activeCategoryData && subcategories.length > 0 && (
                <div className="shop-filter-drawer__section">
                  <h4>Type</h4>
                  <div className="shop-filter-drawer__chips">
                    <FilterChip
                      active={!activeSubcategory}
                      onClick={() => {
                        setActiveSubcategory("");
                        scrollToTop();
                      }}
                    >
                      All {activeCategoryData.name}
                    </FilterChip>
                    {subcategories.map((subcategory) => (
                      <FilterChip
                        key={subcategory.slug}
                        active={activeSubcategory === subcategory.slug}
                        onClick={() => {
                          setActiveSubcategory(subcategory.slug);
                          scrollToTop();
                        }}
                      >
                        {subcategory.name}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              )}

              {/* Audience */}
              <div className="shop-filter-drawer__section">
                <h4>For</h4>
                <div className="shop-filter-drawer__chips">
                  <FilterChip
                    active={!activeAudience}
                    onClick={() => {
                      setActiveAudience("");
                      scrollToTop();
                    }}
                  >
                    Everyone
                  </FilterChip>
                  {AUDIENCE_FILTERS.map((audience) => (
                    <FilterChip
                      key={audience.slug}
                      active={activeAudience === audience.slug}
                      onClick={() => selectAudience(audience.slug)}
                    >
                      {audience.name}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Smart Collections */}
              <div className="shop-filter-drawer__section">
                <h4>Collections</h4>
                <div className="shop-filter-drawer__chips">
                  {SMART_FILTERS.map((filter) => (
                    <FilterChip
                      key={filter.slug}
                      active={activeFilter === filter.slug}
                      onClick={() => selectSmartFilter(filter.slug)}
                    >
                      {filter.label}
                    </FilterChip>
                  ))}
                </div>
              </div>
            </div>

            <div className="shop-filter-drawer__footer">
              {hasActiveFilter && (
                <button type="button" className="shop-filter-drawer__clear-btn" onClick={clearFilters}>
                  Clear All
                </button>
              )}
              <button type="button" className="shop-filter-drawer__apply-btn" onClick={() => setMobileFiltersOpen(false)}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <section className="shop-grid-wrap" aria-live="polite">
          {loading ? (
            <div className="shop-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <ProductCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="shop-empty">
              <h3>No pieces found.</h3>
              <p>
                Nothing matched this filter. Try a different category or browse everything.
              </p>
              <button type="button" className="no-results-btn" onClick={clearFilters}>
                Clear filter
              </button>
            </div>
          ) : (
            <div className="shop-grid" style={{ minHeight: "400px" }}>
              {products.map((product, index) => (
                <ProductCard key={product.id || product.slug} product={product} index={index} />
              ))}
            </div>
          )}
        </section>

        {total > PAGE_SIZE && products.length > 0 ? (
          <section className="shop-load-more">
            <p>
              Showing {Math.min(shownCount, total)} of {total} pieces
            </p>
            <div className="shop-load-more__track" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (shownCount / total) * 100)}%` }} />
            </div>
            {canLoadMore ? (
              <button type="button" disabled={loadingMore} onClick={loadMore}>
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            ) : null}
          </section>
        ) : null}
      </main>

      <Footer />
    </>
  );
}

export async function getStaticProps() {
  const result = await queryProducts({
    category: "all",
    subcategory: "",
    audience: "",
    filter: "",
    sort: "featured",
    page: 1,
  });

  return {
    props: {
      initialProducts: result.products,
      initialTotal: result.total,
    },
    revalidate: 300,
  };
}
