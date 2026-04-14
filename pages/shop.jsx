import { useMemo, useState } from "react";
import CategoryStrip from "../components/CategoryStrip";
import FilterDrawer from "../components/FilterDrawer";
import Footer from "../components/Footer";
import MasonryGrid from "../components/MasonryGrid";
import Nav from "../components/Nav";
import Icon from "../components/icons";
import { categoryOptions } from "../data/site";
import { getCatalogCategories, getCategoryPriority } from "../lib/products";
import { readProducts } from "../lib/store";

export default function ShopPage({ products, categories, initialCategory }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const next = products
      .filter((product) => (activeCategory === "All" ? true : product.category === activeCategory))
      .filter((product) => (showAvailableOnly ? !product.isSold && product.stock > 0 : true));

    if (sortBy === "recent") return next.slice().sort((left, right) => Number(right.recent) - Number(left.recent));
    if (sortBy === "price-asc") return next.slice().sort((left, right) => left.price - right.price);
    if (sortBy === "price-desc") return next.slice().sort((left, right) => right.price - left.price);
    return next.slice().sort((left, right) => {
      const featuredDiff = Number(right.featured) - Number(left.featured);
      if (featuredDiff !== 0) return featuredDiff;
      const categoryDiff = getCategoryPriority(left.category) - getCategoryPriority(right.category);
      if (categoryDiff !== 0) return categoryDiff;
      return left.name.localeCompare(right.name);
    });
  }, [activeCategory, products, showAvailableOnly, sortBy]);

  return (
    <>
      <Nav />
      <CategoryStrip categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />

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

        <MasonryGrid products={filteredProducts} />
      </main>

      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
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

  return { props: { products, categories, initialCategory } };
}
