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
        {/* Mobile: Show Filter button, Desktop: Hide (sidebar instead) */}
        <div className="shop-page__header">
          <div className="shop-page__header-left">
            <p className="overline">Kenyan Artisan Gallery</p>
            <h1 className="display-lg">Shop the collection</h1>
          </div>
          {isMobile && (
            <button type="button" className="shop-page__filter-btn" onClick={() => setIsDrawerOpen(true)}>
              <Icon name="filter" size={18} />
              Filters
              {hasActiveFilters && <span className="shop-page__filter-dot" />}
            </button>
          )}
        </div>

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

          <div className="shop-page__grid">
            <MasonryGrid products={filteredProducts} />
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .shop-page {
          padding-top: calc(var(--nav-height) + 74px);
        }
        .shop-page__header {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: var(--space-4) var(--gutter);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .shop-page__header-left p {
          margin-bottom: 4px;
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
          background: var(--color-terracotta);
          border-radius: 50%;
        }
        .shop-page__count {
          max-width: var(--max-width);
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
          color: var(--color-terracotta);
          font-size: var(--text-sm);
          cursor: pointer;
          text-decoration: underline;
        }
        .shop-page__layout {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--gutter) var(--space-7);
          display: flex;
          gap: var(--space-5);
        }
        .shop-page__grid {
          flex: 1;
          min-width: 0;
        }
        @media (max-width: 899px) {
          .shop-page__header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-3);
          }
          .shop-page__layout {
            flex-direction: column;
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
