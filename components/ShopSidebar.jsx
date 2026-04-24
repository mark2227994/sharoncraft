import Icon from "./icons";

export default function ShopSidebar({
  categories = [],
  activeCategory,
  onCategoryChange,
  activeJewelryType,
  onJewelryTypeChange,
  sortBy,
  onSortChange,
  showAvailableOnly,
  onShowAvailableChange,
  isMobile,
  isOpen,
  onClose,
}) {
  const categoryOptions =
    categories.length > 0
      ? ["All", ...categories.filter((category) => category !== "All")].map((category) => ({
          value: category,
          label: category === "All" ? "All Products" : category,
        }))
      : [
          { value: "All", label: "All Products" },
          { value: "Jewellery", label: "Jewellery" },
          { value: "Home Decor", label: "Home Decor" },
          { value: "Gift Sets", label: "Gift Sets" },
          { value: "Accessories", label: "Accessories" },
        ];

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "recent", label: "Newest" },
    { value: "best-sellers", label: "Best Sellers" },
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

  function handleClear() {
    onCategoryChange("All");
    onJewelryTypeChange("all");
    onSortChange("featured");
    onShowAvailableChange(false);
  }

  function renderTextOptions(options, activeValue, onChange) {
    return (
      <div className="shop-sidebar__options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`shop-sidebar__text-link ${activeValue === option.value ? "shop-sidebar__text-link--active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  function renderSidebarContent() {
    return (
      <div className="shop-sidebar">
        <div className="shop-sidebar__section">
          <h3 className="shop-sidebar__title">Sort By</h3>
          <div className="shop-sidebar__select-wrap">
            <select value={sortBy} onChange={(event) => onSortChange(event.target.value)} className="shop-sidebar__select">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="shop-sidebar__section">
          <h3 className="shop-sidebar__title">Categories</h3>
          {renderTextOptions(categoryOptions, activeCategory, onCategoryChange)}
        </div>

        {activeCategory === "Jewellery" ? (
          <div className="shop-sidebar__section">
            <h3 className="shop-sidebar__title">Jewellery Type</h3>
            {renderTextOptions(jewelryTypes, activeJewelryType, onJewelryTypeChange)}
          </div>
        ) : null}

        <div className="shop-sidebar__section">
          <label className={`shop-sidebar__checkbox ${showAvailableOnly ? "shop-sidebar__checkbox--active" : ""}`}>
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(event) => onShowAvailableChange(event.target.checked)}
            />
            <span className="shop-sidebar__checkbox-custom" aria-hidden="true" />
            <span className="shop-sidebar__checkbox-label">In Stock Only</span>
          </label>
        </div>

        <button type="button" onClick={handleClear} className="shop-sidebar__clear">
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <>
      <aside className="shop-sidebar__desktop">{renderSidebarContent()}</aside>

      {isMobile && isOpen ? (
        <div className="shop-sidebar__overlay" onClick={onClose}>
          <div className="shop-sidebar__drawer" onClick={(event) => event.stopPropagation()}>
            <div className="shop-sidebar__drawer-header">
              <h3>Filters</h3>
              <button type="button" onClick={onClose} className="shop-sidebar__close" aria-label="Close filters">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="shop-sidebar__drawer-content">{renderSidebarContent()}</div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .shop-sidebar__desktop {
          width: 220px;
          flex-shrink: 0;
          position: sticky;
          top: calc(var(--announcement-height) + var(--nav-height) + 44px);
          align-self: start;
        }

        @media (max-width: 899px) {
          .shop-sidebar__desktop {
            display: none;
          }
        }

        .shop-sidebar {
          display: grid;
          gap: 0;
          color: #171717;
        }

        .shop-sidebar__section {
          padding: 0 0 22px;
          margin-bottom: 22px;
          border-bottom: 1px solid rgba(30, 26, 21, 0.09);
        }

        .shop-sidebar__title {
          margin: 0 0 14px;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #7d776f;
        }

        .shop-sidebar__select-wrap {
          position: relative;
        }

        .shop-sidebar__select {
          width: 100%;
          padding: 0 0 10px;
          border: none;
          border-bottom: 1px solid rgba(30, 26, 21, 0.18);
          background: transparent;
          color: #171717;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          outline: none;
        }

        .shop-sidebar__options {
          display: grid;
          gap: 10px;
        }

        .shop-sidebar__text-link {
          width: fit-content;
          padding: 0;
          border: none;
          background: transparent;
          color: #5f5a52;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-align: left;
          transition: color 180ms ease;
        }

        .shop-sidebar__text-link:hover {
          color: #171717;
        }

        .shop-sidebar__text-link--active {
          color: #171717;
          font-weight: 500;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 5px;
        }

        .shop-sidebar__checkbox {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          width: fit-content;
          cursor: pointer;
          color: #5f5a52;
        }

        .shop-sidebar__checkbox input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .shop-sidebar__checkbox-custom {
          width: 14px;
          height: 14px;
          border: 1px solid rgba(30, 26, 21, 0.36);
          background: transparent;
          transition: all 180ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .shop-sidebar__checkbox-custom::after {
          content: "";
          width: 6px;
          height: 6px;
          background: #171717;
          transform: scale(0);
          transition: transform 180ms ease;
        }

        .shop-sidebar__checkbox-label {
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .shop-sidebar__checkbox--active {
          color: #171717;
        }

        .shop-sidebar__checkbox--active .shop-sidebar__checkbox-custom {
          border-color: #171717;
        }

        .shop-sidebar__checkbox--active .shop-sidebar__checkbox-custom::after {
          transform: scale(1);
        }

        .shop-sidebar__clear {
          width: fit-content;
          padding: 0;
          border: none;
          background: transparent;
          color: #171717;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(23, 23, 23, 0.28);
          transition: border-color 180ms ease, color 180ms ease;
        }

        .shop-sidebar__clear:hover {
          color: #8b6b47;
          border-color: #8b6b47;
        }

        .shop-sidebar__overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          background: rgba(20, 18, 15, 0.28);
          backdrop-filter: blur(10px);
        }

        .shop-sidebar__drawer {
          position: absolute;
          inset: auto 0 0 0;
          background: #fafafa;
          border-radius: 18px 18px 0 0;
          border-top: 1px solid rgba(30, 26, 21, 0.08);
          box-shadow: 0 -24px 60px rgba(20, 18, 15, 0.12);
          animation: slideUp 220ms ease;
        }

        .shop-sidebar__drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(30, 26, 21, 0.08);
        }

        .shop-sidebar__drawer-header h3 {
          margin: 0;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #171717;
        }

        .shop-sidebar__close {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(30, 26, 21, 0.12);
          border-radius: 999px;
          background: #fff;
          color: #171717;
        }

        .shop-sidebar__drawer-content {
          max-height: min(75vh, 640px);
          overflow-y: auto;
          padding: 20px;
        }

        @keyframes slideUp {
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
