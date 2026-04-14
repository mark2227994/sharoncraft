import { useMemo, useState } from "react";
import CategoryStrip from "../components/CategoryStrip";
import FilterDrawer from "../components/FilterDrawer";
import Footer from "../components/Footer";
import MasonryGrid from "../components/MasonryGrid";
import Nav from "../components/Nav";
import Icon from "../components/icons";
import { categoryOptions } from "../data/site";
import {
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

  function handleCategorySelect(nextCategory) {
    setActiveCategory(nextCategory);
    if (nextCategory !== "Jewellery") {
      setActiveJewelryType("all");
    }
  }

  return (
    <>
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
              onClick={() => setActiveJewelryType("all")}
            >
              All jewellery
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
        ) : null}

        <MasonryGrid products={filteredProducts} />
      </main>

      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeCategory={activeCategory}
        setActiveCategory={handleCategorySelect}
        activeJewelryType={activeJewelryType}
        setActiveJewelryType={setActiveJewelryType}
        showAvailableOnly={showAvailableOnly}
        setShowAvailableOnly={setShowAvailableOnly}
        sortBy={sortBy}
        setSortBy={setSortBy}
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
        @media (max-width: 767px) {
          .shop-page__hero {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ query }) {
  const products = await readProducts();
  const categories = getCatalogCategories(products);
  const requestedCategory = typeof query.category === "string" ? query.category : "Jewellery";
  const initialCategory = categories.includes(requestedCategory) ? requestedCategory : categoryOptions[0];
  const requestedJewelryType =
    typeof query.jewelryType === "string" && jewelryTypeOptions.includes(query.jewelryType)
      ? query.jewelryType
      : "all";

  return { props: { products, categories, initialCategory, initialJewelryType: requestedJewelryType } };
}
