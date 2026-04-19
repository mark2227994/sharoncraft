import { useState } from "react";
import Icon from "./icons";

export default function QuickFiltersDrawer({ categories = [], onFilterChange, maxPrice = 500 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, maxPrice]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilterChange?.({ category, priceRange });
  };

  const handlePriceChange = (type, value) => {
    const newRange = type === "min" ? [value, priceRange[1]] : [priceRange[0], value];
    setPriceRange(newRange);
    onFilterChange?.({ category: selectedCategory, priceRange: newRange });
  };

  const handleReset = () => {
    setSelectedCategory("all");
    setPriceRange([0, maxPrice]);
    onFilterChange?.({ category: "all", priceRange: [0, maxPrice] });
  };

  const defaultCategories = [
    { id: "all", name: "All Products", count: 120 },
    { id: "jewelry", name: "Jewelry", count: 45 },
    { id: "gifts", name: "Gifts", count: 30 },
    { id: "home", name: "Home Decor", count: 25 },
    { id: "limited", name: "Limited Edition", count: 20 },
  ];

  const categoryList = categories.length > 0 ? categories : defaultCategories;

  return (
    <>
      {/* Trigger Button */}
      <button
        className="filter-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Open filters"
      >
        <Icon name="filter" size={20} />
        <span>Filter</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="filter-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`filter-drawer ${isOpen ? "filter-drawer--open" : ""}`}>
        <div className="filter-drawer__header">
          <h3>Filter Products</h3>
          <button
            className="filter-drawer__close"
            onClick={() => setIsOpen(false)}
            aria-label="Close filters"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <div className="filter-drawer__content">
          {/* Category Section */}
          <div className="filter-section">
            <h4 className="filter-section__title">Category</h4>
            <div className="filter-section__items">
              {categoryList.map((category) => (
                <button
                  key={category.id}
                  className={`filter-item ${
                    selectedCategory === category.id ? "filter-item--active" : ""
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <span className="filter-item__name">{category.name}</span>
                  <span className="filter-item__count">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Section */}
          <div className="filter-section">
            <h4 className="filter-section__title">Price Range</h4>
            <div className="filter-price">
              <div className="filter-price__inputs">
                <div className="filter-price__input-group">
                  <label>Min</label>
                  <input
                    type="number"
                    min="0"
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange("min", parseInt(e.target.value))}
                  />
                </div>
                <div className="filter-price__input-group">
                  <label>Max</label>
                  <input
                    type="number"
                    min={priceRange[0]}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange("max", parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="filter-price__display">
                ${priceRange[0]} - ${priceRange[1]}
              </div>
            </div>
          </div>
        </div>

        <div className="filter-drawer__footer">
          <button
            className="filter-btn filter-btn--secondary"
            onClick={handleReset}
          >
            Reset All
          </button>
          <button
            className="filter-btn filter-btn--primary"
            onClick={() => setIsOpen(false)}
          >
            Apply Filters
          </button>
        </div>
      </div>

      <style jsx>{`
        .filter-trigger {
          display: none;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: white;
          border: 1px solid #E0E0E0;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          color: #2a2a2a;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-trigger:hover {
          background: #F5F5F5;
          border-color: #C04D29;
          color: #C04D29;
        }

        @media (max-width: 768px) {
          .filter-trigger {
            display: flex;
          }
        }

        .filter-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 98;
          animation: fadeIn 0.3s ease;
        }

        @media (max-width: 768px) {
          .filter-overlay {
            display: block;
          }
        }

        .filter-drawer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-radius: 16px 16px 0 0;
          z-index: 99;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          transform: translateY(100%);
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
        }

        .filter-drawer--open {
          transform: translateY(0);
        }

        .filter-drawer__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid #E0E0E0;
        }

        .filter-drawer__header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #2a2a2a;
        }

        .filter-drawer__close {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          transition: color 0.3s ease;
          padding: 4px;
        }

        .filter-drawer__close:hover {
          color: #C04D29;
        }

        .filter-drawer__content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .filter-section {
          margin-bottom: 24px;
        }

        .filter-section__title {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #C04D29;
        }

        .filter-section__items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #F9F6EE;
          border: 2px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
          color: #2a2a2a;
        }

        .filter-item:hover {
          background: #F0E8DE;
        }

        .filter-item--active {
          background: #C04D29;
          color: white;
          border-color: #C04D29;
        }

        .filter-item__name {
          font-weight: 600;
        }

        .filter-item__count {
          font-size: 12px;
          opacity: 0.7;
        }

        .filter-price {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-price__inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .filter-price__input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-price__input-group label {
          font-size: 12px;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-price__input-group input {
          padding: 10px;
          border: 2px solid #E0E0E0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .filter-price__input-group input:focus {
          outline: none;
          border-color: #C04D29;
        }

        .filter-price__display {
          text-align: center;
          font-weight: 700;
          font-size: 16px;
          color: #C04D29;
          padding: 8px;
          background: rgba(192, 77, 41, 0.1);
          border-radius: 6px;
        }

        .filter-drawer__footer {
          display: flex;
          gap: 10px;
          padding: 16px;
          border-top: 1px solid #E0E0E0;
        }

        .filter-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-btn--primary {
          background: #C04D29;
          color: white;
        }

        .filter-btn--primary:active {
          background: #a83a1a;
        }

        .filter-btn--secondary {
          background: white;
          color: #C04D29;
          border: 2px solid #C04D29;
        }

        .filter-btn--secondary:active {
          background: #F9F6EE;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (min-width: 769px) {
          .filter-trigger,
          .filter-overlay,
          .filter-drawer {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
