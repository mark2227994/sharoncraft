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
                title="2 Columns"
                aria-label="Display 2 columns"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
                <span className="layout-tooltip">2 Columns</span>
              </button>
              <button
                className={`shop-sidebar__layout-btn ${gridView === "3-col" ? "shop-sidebar__layout-btn--active" : ""}`}
                onClick={() => onGridViewChange("3-col")}
                title="3 Columns"
                aria-label="Display 3 columns"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
                <span className="layout-tooltip">3 Columns</span>
              </button>
              <button
                className={`shop-sidebar__layout-btn ${gridView === "4-col" ? "shop-sidebar__layout-btn--active" : ""}`}
                onClick={() => onGridViewChange("4-col")}
                title="4 Columns"
                aria-label="Display 4 columns"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span className="layout-tooltip">4 Columns</span>
              </button>
              <button
                className={`shop-sidebar__layout-btn ${gridView === "5-col" ? "shop-sidebar__layout-btn--active" : ""}`}
                onClick={() => onGridViewChange("5-col")}
                title="5 Columns"
                aria-label="Display 5 columns"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="3" cy="12" r="2"></circle>
                  <circle cx="8" cy="12" r="2"></circle>
                  <circle cx="13" cy="12" r="2"></circle>
                  <circle cx="18" cy="12" r="2"></circle>
                  <circle cx="21" cy="12" r="2"></circle>
                </svg>
                <span className="layout-tooltip">5 Columns</span>
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
        /* LUXURY ECOMMERCE SIDEBAR - 2026 */
        
        .shop-sidebar__desktop {
          width: 260px;
          flex-shrink: 0;
          position: sticky;
          top: calc(var(--nav-height) + 80px);
          height: fit-content;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          transition: opacity 300ms ease, transform 300ms ease;
        }
        
        .shop-sidebar__desktop::-webkit-scrollbar {
          width: 4px;
        }
        
        .shop-sidebar__desktop::-webkit-scrollbar-track {
          background: #f5f5f5;
          border-radius: 10px;
        }
        
        .shop-sidebar__desktop::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
        
        .shop-sidebar__desktop::-webkit-scrollbar-thumb:hover {
          background: #bbb;
        }
        
        @media (max-width: 899px) {
          .shop-sidebar__desktop {
            display: none;
          }
        }

        .shop-sidebar {
          background: #ffffff;
          border: 1px solid #f0f0f0;
          border-radius: 0;
          padding: 0;
          transition: all 300ms ease;
        }

        .shop-sidebar__section {
          margin-bottom: 0;
          padding: 20px 0;
          border-bottom: 1px solid #f5f5f5;
          border-top: none;
        }
        
        .shop-sidebar__section:first-of-type {
          padding-top: 0;
        }
        
        .shop-sidebar__section:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        .shop-sidebar__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 12px;
          color: #000;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .shop-sidebar__select {
          width: 100%;
          padding: 10px 0;
          border: none;
          border-bottom: 1px solid #e5e5e5;
          font-size: 12px;
          background: transparent;
          cursor: pointer;
          color: #000;
          font-weight: 500;
        }
        
        .shop-sidebar__options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .shop-sidebar__radio,
        .shop-sidebar__checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          cursor: pointer;
          padding: 0;
          color: #333;
          transition: color 0.2s ease;
        }
        
        .shop-sidebar__radio:hover,
        .shop-sidebar__checkbox:hover {
          color: #000;
        }
        
        .shop-sidebar__radio input,
        .shop-sidebar__checkbox input {
          display: none;
        }
        
        .shop-sidebar__radio-custom {
          width: 14px;
          height: 14px;
          border: 1.5px solid #999;
          border-radius: 50%;
          position: relative;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        
        .shop-sidebar__radio input:checked + .shop-sidebar__radio-custom {
          border-color: #000;
          background: #000;
        }
        
        .shop-sidebar__radio input:checked + .shop-sidebar__radio-custom::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 4px;
          height: 4px;
          background: #fff;
          border-radius: 50%;
        }
        
        .shop-sidebar__checkbox-custom {
          width: 14px;
          height: 14px;
          border: 1.5px solid #999;
          border-radius: 2px;
          position: relative;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        
        .shop-sidebar__checkbox input:checked + .shop-sidebar__checkbox-custom {
          background: #000;
          border-color: #000;
        }
        
        .shop-sidebar__checkbox input:checked + .shop-sidebar__checkbox-custom::after {
          content: "✓";
          position: absolute;
          top: -3px;
          left: 1px;
          color: white;
          font-size: 10px;
          font-weight: bold;
        }
        
        .shop-sidebar__clear {
          width: 100%;
          padding: 12px 0;
          background: transparent;
          border: 1px solid #000;
          border-radius: 0;
          font-size: 11px;
          color: #000;
          font-weight: 700;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.2s ease;
          margin-top: 8px;
        }
        
        .shop-sidebar__clear:hover {
          background: #000;
          color: #fff;
        }

        /* Mobile drawer styles - Luxury */
        .shop-sidebar__overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1000;
          animation: fadeIn 0.2s;
          backdrop-filter: blur(2px);
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
          background: #ffffff;
          border-radius: 12px 12px 0 0;
          max-height: 85vh;
          animation: slideUp 0.3s ease-out;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.08);
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        .shop-sidebar__drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .shop-sidebar__drawer-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #000;
          letter-spacing: 0.5px;
        }
        
        .shop-sidebar__close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          transition: background 0.2s ease;
          border-radius: 4px;
        }
        
        .shop-sidebar__close:hover {
          background: #f5f5f5;
        }
        
        .shop-sidebar__drawer-content {
          padding: 20px;
          overflow-y: auto;
          max-height: calc(85vh - 70px);
        }

        /* Layout Options - Minimal Luxury */
        .shop-sidebar__layout-options {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 0;
        }
        
        .shop-sidebar__layout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background: #f8f8f8;
          border: 1px solid #e5e5e5;
          border-radius: 0;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #666;
          position: relative;
          line-height: 1;
          width: 100%;
          height: 40px;
          aspect-ratio: 1;
        }
        
        .shop-sidebar__layout-btn svg {
          width: 16px;
          height: 16px;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        
        .shop-sidebar__layout-btn:hover {
          background: #f0f0f0;
          border-color: #999;
          color: #000;
        }
        
        .shop-sidebar__layout-btn--active {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        
        .layout-tooltip {
          position: absolute;
          bottom: -28px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 100;
          letter-spacing: 0.5px;
        }
        
        .shop-sidebar__layout-btn:hover .layout-tooltip {
          opacity: 1;
        }
        
        @media (max-width: 899px) {
          .shop-sidebar__layout-options {
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
          }
          .shop-sidebar__layout-btn {
            width: 100%;
            height: 36px;
            padding: 6px;
          }
          .shop-sidebar__layout-btn svg {
            width: 14px;
            height: 14px;
          }
          .layout-tooltip {
            bottom: -24px;
            font-size: 9px;
          }
        }
      `}</style>
    </>
  );
}