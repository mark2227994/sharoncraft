import Icon from "./icons";

export default function ShopSidebar({
  activeCategory,
  onCategoryChange,
  activeJewelryType,
  onJewelryTypeChange,
  sortBy,
  onSortChange,
  showAvailableOnly,
  onShowAvailableChange,
  gridView,
  onGridViewChange,
  isMobile,
  isOpen,
  onClose
}) {
  const categoryOptions = [
    { value: "All", label: "All Products" },
    { value: "Jewellery", label: "Jewellery" },
    { value: "Home Decor", label: "Home Decor" },
    { value: "Gift Sets", label: "Gift Sets" },
    { value: "Accessories", label: "Accessories" },
  ];

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "recent", label: "Newest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
  ];

  const jewelryTypes = [
    { value: "all", label: "All Types" },
    { value: "necklace", label: "Necklaces" },
    { value: "bracelet", label: "Bracelets" },
    { value: "earring", label: "Earrings" },
    { value: "anklet", label: "Anklets" },
  ];

  const handleClear = () => {
    onCategoryChange("All");
    onJewelryTypeChange("all");
    onSortChange("featured");
    onShowAvailableChange(false);
  };

  return (
    <>
      {/* Desktop sidebar - always rendered, hidden on mobile */}
      <aside className="shop-sidebar__desktop">
        <div className="shop-sidebar">
          <div className="shop-sidebar__section">
            <h3 className="shop-sidebar__title">View</h3>
            <div className="shop-sidebar__layout-options">
              <button
                className={`shop-sidebar__layout-btn ${gridView === "2-col" ? "shop-sidebar__layout-btn--active" : ""}`}
                onClick={() => onGridViewChange("2-col")}
                title="2 columns"
                aria-label="Display 2 columns"
              >
                <span className="layout-icon">⊟ ⊟</span>
                <span className="layout-label">2</span>
              </button>
              <button
                className={`shop-sidebar__layout-btn ${gridView === "3-col" ? "shop-sidebar__layout-btn--active" : ""}`}
                onClick={() => onGridViewChange("3-col")}
                title="3 columns"
                aria-label="Display 3 columns"
              >
                <span className="layout-icon">⊟ ⊟ ⊟</span>
                <span className="layout-label">3</span>
              </button>
              <button
                className={`shop-sidebar__layout-btn ${gridView === "4-col" ? "shop-sidebar__layout-btn--active" : ""}`}
                onClick={() => onGridViewChange("4-col")}
                title="4 columns"
                aria-label="Display 4 columns"
              >
                <span className="layout-icon">⊟ ⊟ ⊟ ⊟</span>
                <span className="layout-label">4</span>
              </button>
              <button
                className={`shop-sidebar__layout-btn ${gridView === "5-col" ? "shop-sidebar__layout-btn--active" : ""}`}
                onClick={() => onGridViewChange("5-col")}
                title="5 columns"
                aria-label="Display 5 columns"
              >
                <span className="layout-icon">⊟ ⊟ ⊟ ⊟ ⊟</span>
                <span className="layout-label">5</span>
              </button>
            </div>
          </div>

          <div className="shop-sidebar__section">
            <h3 className="shop-sidebar__title">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="shop-sidebar__select"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="shop-sidebar__section">
            <h3 className="shop-sidebar__title">Categories</h3>
            <div className="shop-sidebar__options">
              {categoryOptions.map((cat) => (
                <label key={cat.value} className="shop-sidebar__radio">
                  <input
                    type="radio"
                    name="category"
                    checked={activeCategory === cat.value}
                    onChange={() => onCategoryChange(cat.value)}
                  />
                  <span className="shop-sidebar__radio-custom" />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {activeCategory === "Jewellery" && (
            <div className="shop-sidebar__section">
              <h3 className="shop-sidebar__title">Jewellery Type</h3>
              <div className="shop-sidebar__options">
                {jewelryTypes.map((type) => (
                  <label key={type.value} className="shop-sidebar__radio">
                    <input
                      type="radio"
                      name="jewelryType"
                      checked={activeJewelryType === type.value}
                      onChange={() => onJewelryTypeChange(type.value)}
                    />
                    <span className="shop-sidebar__radio-custom" />
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="shop-sidebar__section">
            <label className="shop-sidebar__checkbox">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => onShowAvailableChange(e.target.checked)}
              />
              <span className="shop-sidebar__checkbox-custom" />
              <span>In Stock Only</span>
            </label>
          </div>

          <button onClick={handleClear} className="shop-sidebar__clear">
            Clear All Filters
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {isMobile && isOpen && (
        <div className="shop-sidebar__overlay" onClick={onClose}>
          <div className="shop-sidebar__drawer" onClick={(e) => e.stopPropagation()}>
            <div className="shop-sidebar__drawer-header">
              <h3>Filters</h3>
              <button onClick={onClose} className="shop-sidebar__close">
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="shop-sidebar__drawer-content">
              <div className="shop-sidebar">
                <div className="shop-sidebar__section">
                  <h3 className="shop-sidebar__title">View</h3>
                  <div className="shop-sidebar__layout-options">
                    <button
                      className={`shop-sidebar__layout-btn ${gridView === "2-col" ? "shop-sidebar__layout-btn--active" : ""}`}
                      onClick={() => onGridViewChange("2-col")}
                      title="2 columns"
                      aria-label="Display 2 columns"
                    >
                      <span className="layout-icon">⊟ ⊟</span>
                      <span className="layout-label">2</span>
                    </button>
                    <button
                      className={`shop-sidebar__layout-btn ${gridView === "3-col" ? "shop-sidebar__layout-btn--active" : ""}`}
                      onClick={() => onGridViewChange("3-col")}
                      title="3 columns"
                      aria-label="Display 3 columns"
                    >
                      <span className="layout-icon">⊟ ⊟ ⊟</span>
                      <span className="layout-label">3</span>
                    </button>
                    <button
                      className={`shop-sidebar__layout-btn ${gridView === "4-col" ? "shop-sidebar__layout-btn--active" : ""}`}
                      onClick={() => onGridViewChange("4-col")}
                      title="4 columns"
                      aria-label="Display 4 columns"
                    >
                      <span className="layout-icon">⊟ ⊟ ⊟ ⊟</span>
                      <span className="layout-label">4</span>
                    </button>
                    <button
                      className={`shop-sidebar__layout-btn ${gridView === "5-col" ? "shop-sidebar__layout-btn--active" : ""}`}
                      onClick={() => onGridViewChange("5-col")}
                      title="5 columns"
                      aria-label="Display 5 columns"
                    >
                      <span className="layout-icon">⊟ ⊟ ⊟ ⊟ ⊟</span>
                      <span className="layout-label">5</span>
                    </button>
                  </div>
                </div>

                <div className="shop-sidebar__section">
                  <h3 className="shop-sidebar__title">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="shop-sidebar__select"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="shop-sidebar__section">
                  <h3 className="shop-sidebar__title">Categories</h3>
                  <div className="shop-sidebar__options">
                    {categoryOptions.map((cat) => (
                      <label key={cat.value} className="shop-sidebar__radio">
                        <input
                          type="radio"
                          name="category-mobile"
                          checked={activeCategory === cat.value}
                          onChange={() => onCategoryChange(cat.value)}
                        />
                        <span className="shop-sidebar__radio-custom" />
                        <span>{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {activeCategory === "Jewellery" && (
                  <div className="shop-sidebar__section">
                    <h3 className="shop-sidebar__title">Jewellery Type</h3>
                    <div className="shop-sidebar__options">
                      {jewelryTypes.map((type) => (
                        <label key={type.value} className="shop-sidebar__radio">
                          <input
                            type="radio"
                            name="jewelryType-mobile"
                            checked={activeJewelryType === type.value}
                            onChange={() => onJewelryTypeChange(type.value)}
                          />
                          <span className="shop-sidebar__radio-custom" />
                          <span>{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="shop-sidebar__section">
                  <label className="shop-sidebar__checkbox">
                    <input
                      type="checkbox"
                      checked={showAvailableOnly}
                      onChange={(e) => onShowAvailableChange(e.target.checked)}
                    />
                    <span className="shop-sidebar__checkbox-custom" />
                    <span>In Stock Only</span>
                  </label>
                </div>

                <button onClick={handleClear} className="shop-sidebar__clear">
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .shop-sidebar__desktop {
          width: 240px;
          flex-shrink: 0;
          position: sticky;
          top: calc(var(--nav-height) + 80px);
          height: fit-content;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          transition: opacity 300ms ease, transform 300ms ease;
        }
        @media (max-width: 899px) {
          .shop-sidebar__desktop {
            display: none;
          }
        }

        .shop-sidebar {
          background: var(--color-white);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          transition: box-shadow 300ms ease;
        }
        @media (hover: hover) {
          .shop-sidebar:hover {
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          }
        }
        .shop-sidebar__section {
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--border-default);
        }
        .shop-sidebar__section:last-of-type {
          border-bottom: none;
          margin-bottom: var(--space-3);
        }
        .shop-sidebar__title {
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: var(--space-3);
          color: var(--text-primary);
        }
        .shop-sidebar__select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          background: var(--color-white);
          cursor: pointer;
        }
        .shop-sidebar__options {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .shop-sidebar__radio,
        .shop-sidebar__checkbox {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          cursor: pointer;
          padding: 4px 0;
        }
        .shop-sidebar__radio input,
        .shop-sidebar__checkbox input {
          display: none;
        }
        .shop-sidebar__radio-custom {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-default);
          border-radius: 50%;
          position: relative;
          flex-shrink: 0;
        }
        .shop-sidebar__radio input:checked + .shop-sidebar__radio-custom {
          border-color: var(--color-terracotta);
        }
        .shop-sidebar__radio input:checked + .shop-sidebar__radio-custom::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 6px;
          height: 6px;
          background: var(--color-terracotta);
          border-radius: 50%;
        }
        .shop-sidebar__checkbox-custom {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border-default);
          border-radius: 4px;
          position: relative;
          flex-shrink: 0;
        }
        .shop-sidebar__checkbox input:checked + .shop-sidebar__checkbox-custom {
          background: var(--color-terracotta);
          border-color: var(--color-terracotta);
        }
        .shop-sidebar__checkbox input:checked + .shop-sidebar__checkbox-custom::after {
          content: "✓";
          position: absolute;
          top: -2px;
          left: 2px;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        .shop-sidebar__clear {
          width: 100%;
          padding: 10px;
          background: var(--color-terracotta);
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        /* Mobile drawer styles */
        .shop-sidebar__overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .shop-sidebar__drawer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-white);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          max-height: 85vh;
          animation: slideUp 0.3s;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .shop-sidebar__drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-default);
        }
        .shop-sidebar__drawer-header h3 {
          font-size: var(--text-lg);
          font-weight: 600;
        }
        .shop-sidebar__close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .shop-sidebar__drawer-content {
          padding: var(--space-4);
          overflow-y: auto;
          max-height: calc(85vh - 60px);
        }

        /* Layout Options Styles - Professional Ecommerce */
        .shop-sidebar__layout-options {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: var(--space-2);
        }
        .shop-sidebar__layout-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 10px 8px;
          background: var(--color-white);
          border: 2px solid var(--border-default);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-secondary);
          aspect-ratio: 1;
        }
        .shop-sidebar__layout-btn:hover {
          border-color: var(--color-terracotta);
          background: rgba(192, 77, 41, 0.03);
        }
        .shop-sidebar__layout-btn--active {
          background: linear-gradient(135deg, #C04D29 0%, #D4A574 100%);
          color: var(--color-white);
          border-color: #C04D29;
          box-shadow: 0 2px 8px rgba(192, 77, 41, 0.25);
        }
        .layout-icon {
          font-size: 12px;
          line-height: 1;
          letter-spacing: 1px;
          opacity: 0.8;
        }
        .layout-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          opacity: 0.9;
        }
        
        @media (max-width: 899px) {
          .shop-sidebar__layout-options {
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
          }
          .shop-sidebar__layout-btn {
            padding: 8px 6px;
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
}