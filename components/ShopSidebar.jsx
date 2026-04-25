import { useEffect, useMemo, useState } from "react";
import Icon from "./icons";

const PRICE_OPTIONS = [
  { value: "all", label: "All Prices" },
  { value: "under-1000", label: "Under KES 1,000" },
  { value: "1000-3000", label: "KES 1,000 - 3,000" },
  { value: "3000-5000", label: "KES 3,000 - 5,000" },
  { value: "above-5000", label: "Above KES 5,000" },
];

function findParentChain(nodes, targetId, parents = []) {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [...parents, node.id];
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      const match = findParentChain(node.children, targetId, [...parents, node.id]);
      if (match.length > 0) return match;
    }
  }
  return [];
}

export default function ShopSidebar({
  categoryTree = [],
  activeCategory,
  onCategoryChange,
  activeSubcategory,
  onSubcategoryChange,
  activePriceRange,
  onPriceRangeChange,
  showAvailableOnly,
  onShowAvailableChange,
  isMobile,
  isOpen,
  onClose,
}) {
  const activeChain = useMemo(
    () => (activeSubcategory ? findParentChain(categoryTree, activeSubcategory) : findParentChain(categoryTree, activeCategory)),
    [activeCategory, activeSubcategory, categoryTree],
  );

  const [expanded, setExpanded] = useState(() => {
    const seeded = new Set(activeChain.filter(Boolean));
    seeded.add("jewellery");
    return seeded;
  });

  useEffect(() => {
    if (activeChain.length === 0) return;
    setExpanded((current) => {
      const next = new Set(current);
      activeChain.forEach((id) => next.add(id));
      return next;
    });
  }, [activeChain]);

  function toggleExpanded(nodeId) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  function handleParentSelect(node) {
    onCategoryChange(node.id);
    onSubcategoryChange("");
    if (node.children?.length) {
      setExpanded((current) => {
        const next = new Set(current);
        next.add(node.id);
        return next;
      });
    }
    if (isMobile) onClose?.();
  }

  function handleNestedSelect(parentId, nodeId) {
    onCategoryChange(parentId);
    onSubcategoryChange(nodeId);
    if (isMobile) onClose?.();
  }

  function handleClear() {
    onCategoryChange("all");
    onSubcategoryChange("");
    onPriceRangeChange("all");
    onShowAvailableChange(false);
    if (isMobile) onClose?.();
  }

  function renderNestedItems(items, parentId, level = 1) {
    return (
      <div className={`shop-sidebar__nested-level shop-sidebar__nested-level--${level}`}>
        {items.map((item) => {
          const isActive = activeSubcategory === item.id;
          const isExpanded = expanded.has(item.id);
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;

          return (
            <div key={item.id} className="shop-sidebar__nested-item">
              <div className="shop-sidebar__row">
                <button
                  type="button"
                  className={`shop-sidebar__text-link shop-sidebar__text-link--sub shop-sidebar__text-link--level-${level}${isActive ? " shop-sidebar__text-link--active" : ""}`}
                  onClick={() => handleNestedSelect(parentId, item.id)}
                >
                  {item.label}
                </button>

                {hasChildren ? (
                  <button
                    type="button"
                    className={`shop-sidebar__expand-btn${isExpanded ? " shop-sidebar__expand-btn--open" : ""}`}
                    onClick={() => toggleExpanded(item.id)}
                    aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.label}`}
                  >
                    <span className="shop-sidebar__arrow">›</span>
                  </button>
                ) : null}
              </div>

              {hasChildren ? (
                <div className={`shop-sidebar__nested${isExpanded ? " shop-sidebar__nested--open" : ""}`}>
                  {renderNestedItems(item.children, parentId, level + 1)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  function renderCollectionSection() {
    return (
      <div className="shop-sidebar__section">
        <p className="shop-sidebar__title shop-sidebar__title--first">Collection</p>

        <div className="shop-sidebar__options-list" role="list">
          {categoryTree.map((node) => {
            const isAll = node.id === "all";
            const isActive = isAll ? activeCategory === "all" && !activeSubcategory : activeCategory === node.id && !activeSubcategory;
            const isExpanded = expanded.has(node.id);
            const hasChildren = Array.isArray(node.children) && node.children.length > 0;

            return (
              <div key={node.id} className="shop-sidebar__option-item" role="listitem">
                <div className="shop-sidebar__row">
                  <button
                    type="button"
                    className={`shop-sidebar__text-link${isActive ? " shop-sidebar__text-link--active" : ""}`}
                    onClick={() => handleParentSelect(node)}
                  >
                    {isAll ? "All Products" : node.label}
                  </button>

                  {hasChildren ? (
                    <button
                      type="button"
                      className={`shop-sidebar__expand-btn${isExpanded ? " shop-sidebar__expand-btn--open" : ""}`}
                      onClick={() => toggleExpanded(node.id)}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.label}`}
                    >
                      <span className="shop-sidebar__arrow">›</span>
                    </button>
                  ) : null}
                </div>

                {hasChildren ? (
                  <div className={`shop-sidebar__nested${isExpanded ? " shop-sidebar__nested--open" : ""}`}>
                    {renderNestedItems(node.children, node.id)}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderAvailabilitySection() {
    return (
      <div className="shop-sidebar__section">
        <p className="shop-sidebar__title">Availability</p>
        <div className="shop-sidebar__availability" aria-label="Availability filter">
          <button
            type="button"
            className={`shop-sidebar__availability-option${!showAvailableOnly ? " shop-sidebar__availability-option--active" : ""}`}
            onClick={() => {
              onShowAvailableChange(false);
              if (isMobile) onClose?.();
            }}
          >
            All
          </button>
          <button
            type="button"
            className={`shop-sidebar__availability-option${showAvailableOnly ? " shop-sidebar__availability-option--active" : ""}`}
            onClick={() => {
              onShowAvailableChange(true);
              if (isMobile) onClose?.();
            }}
          >
            In Stock
          </button>
        </div>
      </div>
    );
  }

  function renderPriceSection() {
    return (
      <div className="shop-sidebar__section">
        <p className="shop-sidebar__title">Price Range</p>
        <div className="shop-sidebar__options-list" role="list">
          {PRICE_OPTIONS.filter((option) => option.value !== "all").map((option) => (
            <div key={option.value} className="shop-sidebar__option-item" role="listitem">
              <button
                type="button"
                className={`shop-sidebar__text-link${activePriceRange === option.value ? " shop-sidebar__text-link--active" : ""}`}
                onClick={() => {
                  onPriceRangeChange(option.value);
                  if (isMobile) onClose?.();
                }}
              >
                {option.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderSidebarContent() {
    return (
      <div className="shop-sidebar">
        {renderCollectionSection()}
        {renderAvailabilitySection()}
        {renderPriceSection()}

        <button type="button" onClick={handleClear} className="shop-sidebar__clear">
          Clear All
        </button>
      </div>
    );
  }

  return (
    <>
      <aside className="shop-sidebar__desktop">{renderSidebarContent()}</aside>

      {isMobile ? (
        <div className={`shop-sidebar__overlay${isOpen ? " shop-sidebar__overlay--open" : ""}`} onClick={onClose}>
          <div className={`shop-sidebar__drawer${isOpen ? " shop-sidebar__drawer--open" : ""}`} onClick={(event) => event.stopPropagation()}>
            <div className="shop-sidebar__drawer-header">
              <h3>Filters</h3>
              <button type="button" onClick={onClose} className="shop-sidebar__close" aria-label="Close filters">
                <Icon name="close" size={14} />
              </button>
            </div>
            <div className="shop-sidebar__drawer-content">{renderSidebarContent()}</div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .shop-sidebar__desktop {
          width: 180px;
          min-width: 180px;
          flex: 0 0 180px;
          align-self: stretch;
          border-right: 0.5px solid #f0f0f0;
          background: #ffffff;
        }

        @media (max-width: 767px) {
          .shop-sidebar__desktop {
            display: none;
          }
        }

        .shop-sidebar {
          width: 100%;
          padding: 24px 20px 24px 24px;
          background: #ffffff;
        }

        .shop-sidebar__section {
          margin: 0;
        }

        .shop-sidebar__title {
          display: block;
          margin: 20px 0 10px;
          padding-top: 20px;
          border-top: 0.5px solid #f0f0f0;
          color: #999;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .shop-sidebar__title--first {
          margin-top: 0;
          padding-top: 0;
          border-top: none;
        }

        .shop-sidebar__options-list {
          display: block;
        }

        .shop-sidebar__option-item {
          display: block;
        }

        .shop-sidebar__row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .shop-sidebar__text-link {
          display: block;
          flex: 1;
          padding: 5px 0;
          margin: 0;
          border: none;
          border-left: 2px solid transparent;
          background: transparent;
          color: #666;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.5px;
          line-height: 1.6;
          text-align: left;
          text-decoration: none;
          transition: color 0.2s ease, border-left-width 0.2s ease, padding-left 0.2s ease, margin-left 0.2s ease;
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
          margin-left: -10px;
        }

        .shop-sidebar__expand-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          min-width: 18px;
          padding: 5px 0;
          border: none;
          background: transparent;
          color: #999;
          transition: transform 0.2s ease, color 0.2s ease;
          cursor: pointer;
        }

        .shop-sidebar__expand-btn:hover {
          color: #8b5e3c;
        }

        .shop-sidebar__arrow {
          display: inline-block;
          font-size: 9px;
          line-height: 1;
          transition: transform 0.2s ease;
        }

        .shop-sidebar__expand-btn--open .shop-sidebar__arrow {
          transform: rotate(90deg);
        }

        .shop-sidebar__nested {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, opacity 0.3s ease;
        }

        .shop-sidebar__nested--open {
          max-height: 300px;
          opacity: 1;
        }

        .shop-sidebar__nested-level {
          margin-left: 4px;
          padding-left: 10px;
          border-left: 0.5px solid #f0f0f0;
        }

        .shop-sidebar__nested-item {
          display: block;
        }

        .shop-sidebar__text-link--sub {
          padding: 3px 0 3px 8px;
          color: #888;
          font-size: 10px;
        }

        .shop-sidebar__text-link--sub.shop-sidebar__text-link--active {
          color: #8b5e3c;
          border-left-color: #8b5e3c;
          font-weight: 500;
        }

        .shop-sidebar__text-link--level-2 {
          padding-left: 16px;
          color: #aaa;
          font-size: 9px;
        }

        .shop-sidebar__availability {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .shop-sidebar__availability-option {
          padding: 0;
          border: none;
          border-bottom: 1px solid transparent;
          background: transparent;
          color: #999;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.5px;
          transition: color 0.2s ease, border-color 0.2s ease;
          cursor: pointer;
        }

        .shop-sidebar__availability-option:hover {
          color: #1c1c1c;
        }

        .shop-sidebar__availability-option--active {
          color: #1c1c1c;
          font-weight: 500;
          border-bottom-color: #1c1c1c;
        }

        .shop-sidebar__clear {
          display: block;
          margin-top: 20px;
          padding: 20px 0 0;
          border: none;
          border-top: 0.5px solid #f0f0f0;
          background: transparent;
          color: #bbb;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-align: left;
          transition: color 0.2s ease;
          cursor: pointer;
        }

        .shop-sidebar__clear:hover {
          color: #1c1c1c;
        }

        .shop-sidebar__overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          background: rgba(28, 28, 28, 0.14);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .shop-sidebar__overlay--open {
          opacity: 1;
          pointer-events: auto;
        }

        .shop-sidebar__drawer {
          position: absolute;
          inset: 0 auto 0 0;
          width: 100vw;
          max-width: 100vw;
          background: #ffffff;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          overflow-y: auto;
        }

        .shop-sidebar__drawer--open {
          transform: translateX(0);
        }

        .shop-sidebar__drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 12px;
          border-bottom: 0.5px solid #f0f0f0;
          background: #ffffff;
        }

        .shop-sidebar__drawer-header h3 {
          margin: 0;
          color: #1c1c1c;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .shop-sidebar__close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: none;
          background: transparent;
          color: #999;
          transition: color 0.2s ease;
          cursor: pointer;
        }

        .shop-sidebar__close:hover {
          color: #1c1c1c;
        }

        .shop-sidebar__drawer-content {
          padding: 0;
        }

        @media (min-width: 768px) {
          .shop-sidebar__overlay {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
