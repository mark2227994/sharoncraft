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

  function renderOptionList({ label, options, activeValue, onChange }) {
    return (
      <div className="shop-sidebar__section">
        {/* Section heading */}
        <p className="shop-sidebar__title">{label}</p>

        {/* Block list fixes merged-link rendering by giving each option its own row */}
        <ul className="shop-sidebar__options-list" role="list">
          {options.map((option) => (
            <li key={option.value} className="shop-sidebar__option-item">
              <button
                type="button"
                className={`shop-sidebar__text-link ${activeValue === option.value ? "shop-sidebar__text-link--active" : ""}`}
                onClick={() => onChange(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function renderSidebarContent() {
    const availabilityOptions = [
      { value: "all", label: "All" },
      { value: "available", label: "Available Now" },
    ];

    return (
      <div className="shop-sidebar">
        {/* Collection filters */}
        {renderOptionList({
          label: "Collection",
          options: categoryOptions,
          activeValue: activeCategory,
          onChange: onCategoryChange,
        })}

        {activeCategory === "Jewellery" ? (
          renderOptionList({
            label: "Jewellery Type",
            options: jewelryTypes,
            activeValue: activeJewelryType,
            onChange: onJewelryTypeChange,
          })
        ) : null}

        {/* Availability filters */}
        <div className="shop-sidebar__section">
          <p className="shop-sidebar__title">Available Now</p>

          {/* Separate block rows remove the merged availability rendering */}
          <ul className="shop-sidebar__options-list" role="list" aria-label="Availability filter">
            {availabilityOptions.map((option) => {
              const isActive = option.value === "available" ? showAvailableOnly : !showAvailableOnly;
              return (
                <li key={option.value} className="shop-sidebar__option-item">
                  <button
                    type="button"
                    className={`shop-sidebar__text-link shop-sidebar__toggle-option ${isActive ? "shop-sidebar__text-link--active" : ""}`}
                    onClick={() => onShowAvailableChange(option.value === "available")}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Clear action */}
        <button type="button" onClick={handleClear} className="shop-sidebar__clear">
          Clear All
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
        /* =========================
           Sidebar shell
           ========================= */
        .shop-sidebar__desktop {
          width: 220px;
          flex-shrink: 0;
          position: sticky;
          top: calc(var(--announcement-height) + var(--nav-height) + 36px);
          align-self: start;
        }

        @media (max-width: 899px) {
          .shop-sidebar__desktop {
            display: none;
          }
        }

        /* =========================
           Sidebar container
           ========================= */
        .shop-sidebar {
          display: grid;
          gap: 0;
          padding: 0 24px 0 0;
          color: #1c1c1c;
          background: transparent;
          border: none;
          box-shadow: none;
        }

        /* =========================
           Sidebar sections
           ========================= */
        .shop-sidebar__section {
          margin: 0;
          padding: 0;
          border: none;
        }

        /* =========================
           Sidebar headings
           ========================= */
        .shop-sidebar__title {
          display: block;
          margin: 24px 0 10px;
          color: #999;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        /* =========================
           Option list structure
           ========================= */
        .shop-sidebar__options-list {
          margin: 0;
          padding: 0;
          display: block;
        }

        .shop-sidebar__option-item {
          display: block;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        /* =========================
           Filter links
           ========================= */
        .shop-sidebar__text-link {
          display: block;
          width: 100%;
          padding: 0 0 10px 0;
          border: none;
          border-left: 2px solid transparent;
          background: transparent;
          color: #666;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 1px;
          line-height: 1.8;
          text-align: left;
          text-decoration: none;
          transition: color 0.35s ease, border-color 0.35s ease, padding-left 0.35s ease;
          cursor: pointer;
        }

        .shop-sidebar__text-link:hover {
          color: #8b5e3c;
        }

        .shop-sidebar__text-link--active {
          color: #1c1c1c;
          font-weight: 500;
          border-left-color: #8b5e3c;
          padding-left: 8px;
        }

        /* =========================
           Availability options
           ========================= */
        .shop-sidebar__toggle-option {
          font-size: 11px;
          letter-spacing: 1px;
        }

        /* =========================
           Clear action
           ========================= */
        .shop-sidebar__clear {
          display: block;
          width: 100%;
          margin-top: 24px;
          padding: 0;
          border: none;
          background: transparent;
          color: #bbb;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-align: left;
          text-decoration: none;
          transition: color 0.35s ease;
          cursor: pointer;
        }

        .shop-sidebar__clear:hover {
          color: #1c1c1c;
        }

        /* =========================
           Mobile drawer
           ========================= */
        .shop-sidebar__overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          background: rgba(28, 28, 28, 0.18);
        }

        .shop-sidebar__drawer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          max-height: 80vh;
          overflow-y: auto;
          background: #fafaf8;
          border-top: 1px solid #e8e8e8;
          border-radius: 2px 2px 0 0;
        }

        .shop-sidebar__drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px var(--gutter);
          border-bottom: 1px solid #e8e8e8;
          background: #fafaf8;
        }

        .shop-sidebar__drawer-header h3 {
          margin: 0;
          color: #1c1c1c;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .shop-sidebar__close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border: none;
          background: transparent;
          color: #1c1c1c;
          transition: color 0.35s ease;
        }

        .shop-sidebar__close:hover {
          color: #8b5e3c;
        }

        .shop-sidebar__drawer-content {
          padding: 18px var(--gutter) 20px;
        }
      `}</style>
    </>
  );
}
