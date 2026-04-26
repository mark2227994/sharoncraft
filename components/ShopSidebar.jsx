import { useEffect, useMemo, useState } from "react";
import Icon from "./icons";

const PRICE_OPTIONS = [
  { value: "under-1000", label: "Under KES 1,000" },
  { value: "1000-3000", label: "KES 1,000 – 3,000" },
  { value: "3000-5000", label: "KES 3,000 – 5,000" },
  { value: "above-5000", label: "Above KES 5,000" },
];

/**
 * Find the parent chain for a given node id.
 * Returns array of parent ids leading to (and including) the target.
 */
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
  /* ───────────────────────────────────────────
     STATE: Accordion — only one parent open at a time
     ─────────────────────────────────────────── */
  const activeChain = useMemo(
    () =>
      activeSubcategory
        ? findParentChain(categoryTree, activeSubcategory)
        : findParentChain(categoryTree, activeCategory),
    [activeCategory, activeSubcategory, categoryTree],
  );

  // Determine default expanded parent from URL/active state
  const defaultExpanded = useMemo(() => {
    if (activeChain.length > 0) return activeChain[0];
    if (activeCategory && activeCategory !== "all") return activeCategory;
    return null;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [expandedCategory, setExpandedCategory] = useState(defaultExpanded);

  // Keep expanded in sync if user navigates via tabs/breadcrumb
  useEffect(() => {
    const target = activeChain.length > 0 ? activeChain[0] : activeCategory !== "all" ? activeCategory : null;
    if (target && target !== "all") {
      setExpandedCategory((current) => (current === target ? current : target));
    }
  }, [activeChain, activeCategory]);

  function toggleCategory(nodeId) {
    setExpandedCategory((current) => (current === nodeId ? null : nodeId));
  }

  function selectSubcat(parentId, subId) {
    onCategoryChange(parentId);
    onSubcategoryChange(subId);
    if (isMobile) onClose?.();
  }

  function selectCategory(node) {
    const isAll = node.id === "all";
    onCategoryChange(node.id);
    onSubcategoryChange("");
    if (!isAll && node.children?.length) {
      setExpandedCategory(node.id);
    }
    if (isMobile) onClose?.();
  }

  function selectPriceRange(value) {
    onPriceRangeChange(value);
    if (isMobile) onClose?.();
  }

  function handleClear() {
    onCategoryChange("all");
    onSubcategoryChange("");
    onPriceRangeChange("all");
    onShowAvailableChange(false);
    setExpandedCategory(null);
    if (isMobile) onClose?.();
  }

  /* ───────────────────────────────────────────
     SECTION: Collection (Categories)
     ─────────────────────────────────────────── */
  function renderCollectionSection() {
    return (
      <div className="shop-sidebar__section">
        <span className="shop-sidebar__title shop-sidebar__title--first">Collection</span>

        <div className="shop-sidebar__options-list" role="list">
          {categoryTree.map((node) => {
            const isAll = node.id === "all";
            if (!isAll && !node.children?.length) return null; // skip empty parents

            const isActive = isAll
              ? activeCategory === "all" && !activeSubcategory
              : activeCategory === node.id && !activeSubcategory;
            const isExpanded = expandedCategory === node.id;
            const hasChildren = Array.isArray(node.children) && node.children.length > 0;

            return (
              <div key={node.id} className="shop-sidebar__option-item" role="listitem">
                {/* Parent category row */}
                <div className="shop-sidebar__row" onClick={() => (hasChildren ? toggleCategory(node.id) : selectCategory(node))}>
                  <button
                    type="button"
                    className={`shop-sidebar__parent-link${isActive ? " shop-sidebar__parent-link--active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectCategory(node);
                    }}
                  >
                    {isAll ? "All Products" : node.label}
                  </button>

                  {hasChildren ? (
                    <button
                      type="button"
                      className={`shop-sidebar__arrow-btn${isExpanded ? " shop-sidebar__arrow-btn--open" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(node.id);
                      }}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.label}`}
                    >
                      <span className="shop-sidebar__arrow">›</span>
                    </button>
                  ) : null}
                </div>

                {/* Subcategory list — accordion */}
                {hasChildren ? (
                  <div className={`shop-sidebar__subcats${isExpanded ? " shop-sidebar__subcats--open" : ""}`}>
                    {node.children.map((sub) => {
                      const isSubActive = activeSubcategory === sub.id;
                      return (
                        <span
                          key={sub.id}
                          className={`shop-sidebar__subcat${isSubActive ? " shop-sidebar__subcat--active" : ""}`}
                          onClick={() => selectSubcat(node.id, sub.id)}
                          role="button"
                          tabIndex={0}
                        >
                          {sub.label}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────
     SECTION: Availability
     ─────────────────────────────────────────── */
  function renderAvailabilitySection() {
    return (
      <div className="shop-sidebar__section">
        <span className="shop-sidebar__title">Availability</span>
        <div className="shop-sidebar__availability" aria-label="Availability filter">
          <span
            className={`shop-sidebar__availability-option${!showAvailableOnly ? " shop-sidebar__availability-option--active" : ""}`}
            onClick={() => {
              onShowAvailableChange(false);
              if (isMobile) onClose?.();
            }}
            role="button"
            tabIndex={0}
          >
            All
          </span>
          <span
            className={`shop-sidebar__availability-option${showAvailableOnly ? " shop-sidebar__availability-option--active" : ""}`}
            onClick={() => {
              onShowAvailableChange(true);
              if (isMobile) onClose?.();
            }}
            role="button"
            tabIndex={0}
          >
            In Stock
          </span>
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────
     SECTION: Price Range
     ─────────────────────────────────────────── */
  function renderPriceSection() {
    return (
      <div className="shop-sidebar__section">
        <span className="shop-sidebar__title">Price Range</span>
        <div className="shop-sidebar__options-list" role="list">
          {PRICE_OPTIONS.map((option) => (
            <div key={option.value} className="shop-sidebar__option-item" role="listitem">
              <button
                type="button"
                className={`shop-sidebar__parent-link${activePriceRange === option.value ? " shop-sidebar__parent-link--active" : ""}`}
                onClick={() => selectPriceRange(option.value)}
              >
                {option.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────
     CLEAR ALL
     ─────────────────────────────────────────── */
  function renderClear() {
    return (
      <button type="button" onClick={handleClear} className="shop-sidebar__clear">
        Clear All
      </button>
    );
  }

  function renderSidebarContent() {
    return (
      <div className="shop-sidebar">
        {renderCollectionSection()}
        {renderAvailabilitySection()}
        {renderPriceSection()}
        {renderClear()}
      </div>
    );
  }

  return (
    <>
      <aside className="shop-sidebar__desktop">{renderSidebarContent()}</aside>

      {isMobile ? (
        <div className={`shop-sidebar__overlay${isOpen ? " shop-sidebar__overlay--open" : ""}`} onClick={onClose}>
          <div
            className={`shop-sidebar__drawer${isOpen ? " shop-sidebar__drawer--open" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
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
        /* ── Layout ── */
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

        /* ── Section Labels ── */
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

        /* ── Category List ── */
        .shop-sidebar__options-list {
          display: block;
        }

        .shop-sidebar__option-item {
          display: block;
        }

        .shop-sidebar__row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        /* ── Parent Link ── */
        .shop-sidebar__parent-link {
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

        .shop-sidebar__parent-link:hover {
          color: #8b5e3c;
        }

        .shop-sidebar__parent-link--active {
          color: #1c1c1c;
          font-weight: 500;
          border-left-color: #8b5e3c;
          padding-left: 8px;
          margin-left: -10px;
        }

        /* ── Arrow Button ── */
        .shop-sidebar__arrow-btn {
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

        .shop-sidebar__arrow-btn:hover {
          color: #8b5e3c;
        }

        .shop-sidebar__arrow {
          display: inline-block;
          font-size: 9px;
          color: #999;
          line-height: 1;
          transition: transform 0.2s ease;
        }

        .shop-sidebar__arrow-btn--open .shop-sidebar__arrow {
          transform: rotate(90deg);
        }

        /* ── Subcategory List ── */
        .shop-sidebar__subcats {
          overflow: hidden;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          max-height: 0;
          opacity: 0;
        }

        .shop-sidebar__subcats--open {
          max-height: 400px;
          opacity: 1;
        }

        .shop-sidebar__subcat {
          display: block;
          font-size: 10px;
          color: #888;
          padding: 3px 0 3px 8px;
          border-left: 0.5px solid #e8e8e8;
          margin-left: 4px;
          line-height: 1.6;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .shop-sidebar__subcat:hover {
          color: #8b5e3c;
        }

        .shop-sidebar__subcat--active {
          color: #8b5e3c;
          font-weight: 500;
          border-left: 2px solid #8b5e3c;
        }

        /* ── Availability ── */
        .shop-sidebar__availability {
          display: flex;
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

        /* ── Clear All ── */
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

        /* ── Mobile Drawer ── */
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

