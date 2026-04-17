import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import CategoryStrip from "../components/CategoryStrip";
import FilterDrawer from "../components/FilterDrawer";
import Footer from "../components/Footer";
import MasonryGrid from "../components/MasonryGrid";
import Nav from "../components/Nav";
import Pagination from "../components/Pagination";
import SeoHead from "../components/SeoHead";
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

const PRODUCTS_PER_PAGE = 12;

export default function ShopPage({
  products,
  categories,
  initialCategory,
  initialJewelryType,
  initialShowAvailableOnly,
  initialSortBy,
  initialPage,
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeJewelryType, setActiveJewelryType] = useState(initialJewelryType);
  const [showAvailableOnly, setShowAvailableOnly] = useState(initialShowAvailableOnly);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const listingRef = useRef(null);

  const isJewelleryView = activeCategory === "Jewellery";

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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const nextQuery = {};

    if (activeCategory !== "All") nextQuery.category = activeCategory;
    if (activeCategory === "Jewellery" && activeJewelryType !== "all") nextQuery.jewelryType = activeJewelryType;
    if (showAvailableOnly) nextQuery.available = "1";
    if (sortBy !== "featured") nextQuery.sort = sortBy;
    if (currentPage > 1) nextQuery.page = String(currentPage);

    router.replace(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true, scroll: false },
    );
  }, [activeCategory, activeJewelryType, currentPage, router, showAvailableOnly, sortBy]);

  function scrollToListing() {
    if (!listingRef.current) return;
    const top = listingRef.current.getBoundingClientRect().top + window.scrollY - (60 + 24);
    window.scrollTo({ top, behavior: "smooth" });
  }

  function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;
    setCurrentPage(nextPage);
    window.requestAnimationFrame(scrollToListing);
  }

  function handleCategorySelect(nextCategory) {
    setActiveCategory(nextCategory);
    if (nextCategory !== "Jewellery") {
      setActiveJewelryType("all");
    }
    setCurrentPage(1);
  }

  function handleJewelryTypeSelect(nextType) {
    setActiveJewelryType(nextType);
    setCurrentPage(1);
  }

  function handleAvailableOnly(nextValue) {
    setShowAvailableOnly(nextValue);
    setCurrentPage(1);
  }

  function handleSort(nextSort) {
    setSortBy(nextSort);
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
        <div className="shop-page__hero">
          <div>
            <p className="overline">Kenyan Artisan Gallery</p>
            <h1 className="display-lg">Shop the collection slowly, like a wall of stories.</h1>
          </div>
          <button type="button" className="shop-page__filter-btn" onClick={() => setIsDrawerOpen(true)}>
            <Icon name="filter" size={18} />
            Filters
          </button>
        </div>

        {isJewelleryView ? (
          <div className="shop-page__subcategories">
            <button
              type="button"
              className={`shop-page__sub-pill ${activeJewelryType === "all" ? "shop-page__sub-pill--active" : ""}`}
              onClick={() => handleJewelryTypeSelect("all")}
            >
              All jewellery
            </button>
            {jewelryTypeOptions.map((type) => (
              <button
                key={type}
                type="button"
                className={`shop-page__sub-pill ${activeJewelryType === type ? "shop-page__sub-pill--active" : ""}`}
                onClick={() => handleJewelryTypeSelect(type)}
              >
                {getJewelryTypeLabel(type)}
              </button>
            ))}
          </div>
        ) : null}

        <div ref={listingRef}>
          <MasonryGrid products={currentProducts} animationKey={`page-${currentPage}`} />
        </div>

        <div className="shop-page__pagination">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </main>

      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeCategory={activeCategory}
        setActiveCategory={handleCategorySelect}
        activeJewelryType={activeJewelryType}
        setActiveJewelryType={handleJewelryTypeSelect}
        showAvailableOnly={showAvailableOnly}
        setShowAvailableOnly={handleAvailableOnly}
        sortBy={sortBy}
        setSortBy={handleSort}
        categories={categories}
      />
      <Footer />

      <style jsx>{`
        .shop-page {
          padding-top: calc(var(--nav-height) + 74px);
        }
        .shop-page__hero {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-5) var(--gutter) 0;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: var(--space-4);
        }
        .shop-page__filter-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 12px 16px;
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
        }
        .shop-page__subcategories {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-4) var(--gutter) 0;
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }
        .shop-page__sub-pill {
          padding: 7px 16px;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-pill);
          background: var(--color-white);
          color: var(--text-secondary);
          font-size: 0.8125rem;
          font-weight: 500;
          transition: all var(--transition-fast);
        }
        .shop-page__sub-pill:hover {
          border-color: var(--color-terracotta);
          color: var(--color-terracotta);
        }
        .shop-page__sub-pill--active {
          background: var(--color-terracotta);
          border-color: var(--color-terracotta);
          color: var(--color-white);
        }
        .shop-page__pagination {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--gutter) var(--space-7);
        }
        :global(.pagination) {
          display: grid;
          gap: var(--space-3);
          border-top: 1px solid rgba(28, 18, 9, 0.08);
          padding-top: var(--space-4);
        }
        :global(.pagination__desktop),
        :global(.pagination__mobile) {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
        }
        :global(.pagination__numbers) {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        :global(.pagination__control),
        :global(.pagination__page) {
          min-height: 42px;
          min-width: 42px;
          padding: 0 14px;
          border: 1px solid rgba(28, 18, 9, 0.12);
          background: var(--color-white);
          color: var(--text-primary);
          transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
        }
        :global(.pagination__control:disabled),
        :global(.pagination__page:disabled) {
          opacity: 0.38;
          cursor: not-allowed;
        }
        :global(.pagination__page--active) {
          border-color: var(--color-terracotta);
          color: var(--color-terracotta);
        }
        :global(.pagination__ellipsis),
        :global(.pagination__status) {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        :global(.pagination__mobile) {
          display: none;
        }
        @media (max-width: 767px) {
          .shop-page__hero {
            flex-direction: column;
            align-items: stretch;
          }
          :global(.pagination__desktop) {
            display: none;
          }
          :global(.pagination__mobile) {
            display: flex;
          }
          :global(.pagination__control) {
            flex: 0 0 auto;
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
  const initialShowAvailableOnly = query.available === "1";
  const allowedSorts = new Set(["featured", "recent", "price-asc", "price-desc"]);
  const initialSortBy =
    typeof query.sort === "string" && allowedSorts.has(query.sort) ? query.sort : "featured";
  const parsedPage = Number.parseInt(Array.isArray(query.page) ? query.page[0] : query.page || "1", 10);
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return {
    props: {
      products,
      categories,
      initialCategory,
      initialJewelryType: requestedJewelryType,
      initialShowAvailableOnly,
      initialSortBy,
      initialPage,
    },
  };
}
