import { useEffect, useMemo, useState } from "react";

const PRICE_OPTIONS = [
  { value: "under-1000", label: "Under KES 1,000" },
  { value: "1000-3000", label: "KES 1,000 - 3,000" },
  { value: "3000-5000", label: "KES 3,000 - 5,000" },
  { value: "above-5000", label: "Above KES 5,000" },
];
const CHEVRON = "\u203A";
const MIDDLE_DOT = "\u00B7";

function findParentChain(nodes, targetId, parents = []) {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [...parents, node.id];
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
      const match = findParentChain(node.children, targetId, [
        ...parents,
        node.id,
      ]);
      if (match.length > 0) {
        return match;
      }
    }
  }

  return [];
}

function getExpandedCategory(categoryTree, activeCategory, activeSubcategory) {
  const activeChain = activeSubcategory
    ? findParentChain(categoryTree, activeSubcategory)
    : findParentChain(categoryTree, activeCategory);

  if (activeChain.length > 1) {
    return activeChain[0];
  }

  if (activeCategory && activeCategory !== "all") {
    return activeCategory;
  }

  return null;
}

function SidebarSection({ first = false, label, children }) {
  return (
    <section className="shop-sidebar__section">
      <span
        className={`shop-sidebar__label ${first ? "shop-sidebar__label--first" : ""}`}
      >
        {label}
      </span>
      {children}
    </section>
  );
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
    () =>
      activeSubcategory
        ? findParentChain(categoryTree, activeSubcategory)
        : findParentChain(categoryTree, activeCategory),
    [activeCategory, activeSubcategory, categoryTree],
  );

  const [expandedCategory, setExpandedCategory] = useState(() =>
    getExpandedCategory(categoryTree, activeCategory, activeSubcategory),
  );

  useEffect(() => {
    const nextExpanded = getExpandedCategory(
      categoryTree,
      activeCategory,
      activeSubcategory,
    );
    if (nextExpanded && nextExpanded !== "all") {
      setExpandedCategory((current) =>
        current === nextExpanded ? current : nextExpanded,
      );
      return;
    }

    if (activeCategory === "all" && !activeSubcategory) {
      setExpandedCategory(null);
    }
  }, [activeCategory, activeSubcategory, categoryTree]);

  function selectCategory(node) {
    onCategoryChange(node.id);
    onSubcategoryChange("");

    if (node.children?.length) {
      setExpandedCategory(node.id);
    } else {
      setExpandedCategory(null);
    }

    if (isMobile) {
      onClose?.();
    }
  }

  function toggleCategory(nodeId) {
    setExpandedCategory((current) => (current === nodeId ? null : nodeId));
  }

  function selectSubcategory(parentId, subcategoryId) {
    onCategoryChange(parentId);
    onSubcategoryChange(subcategoryId);
    setExpandedCategory(parentId);

    if (isMobile) {
      onClose?.();
    }
  }

  function selectAvailability(nextValue) {
    onShowAvailableChange(nextValue);
    if (isMobile) {
      onClose?.();
    }
  }

  function selectPriceRange(nextValue) {
    onPriceRangeChange(nextValue);
    if (isMobile) {
      onClose?.();
    }
  }

  function clearAll() {
    onCategoryChange("all");
    onSubcategoryChange("");
    onPriceRangeChange("all");
    onShowAvailableChange(false);
    setExpandedCategory(null);

    if (isMobile) {
      onClose?.();
    }
  }

  function renderCollectionSection() {
    return (
      <SidebarSection first label="Collection">
        <div className="shop-sidebar__stack" role="list">
          {categoryTree.map((node) => {
            const isActiveParent =
              node.id === "all"
                ? activeCategory === "all" && !activeSubcategory
                : activeCategory === node.id;
            const isExpanded = expandedCategory === node.id;
            const hasChildren =
              Array.isArray(node.children) && node.children.length > 0;

            return (
              <div key={node.id} className="shop-sidebar__item" role="listitem">
                <div className="shop-sidebar__parent-row">
                  <button
                    type="button"
                    className={`shop-sidebar__parent-link ${isActiveParent ? "shop-sidebar__parent-link--active" : ""}`}
                    onClick={() => selectCategory(node)}
                  >
                    <span>
                      {node.id === "all" ? "All Products" : node.label}
                    </span>
                  </button>

                  {hasChildren ? (
                    <button
                      type="button"
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.label}`}
                      aria-expanded={isExpanded}
                      className={`shop-sidebar__arrow ${isExpanded ? "shop-sidebar__arrow--open" : ""}`}
                      onClick={() => {
                        if (!isActiveParent) {
                          onCategoryChange(node.id);
                          onSubcategoryChange("");
                          setExpandedCategory(node.id);
                          return;
                        }

                        toggleCategory(node.id);
                      }}
                    >
                      <span className="shop-sidebar__arrow-glyph">
                        {CHEVRON}
                      </span>
                    </button>
                  ) : null}
                </div>

                {hasChildren ? (
                  <div
                    className={`shop-sidebar__subcats ${
                      isActiveParent && isExpanded
                        ? "shop-sidebar__subcats--open"
                        : ""
                    }`}
                  >
                    {node.children.map((sub) => {
                      const isSubcategoryActive = activeSubcategory === sub.id;
                      return (
                        <div key={sub.id} className="shop-sidebar__subcat-row">
                          <button
                            type="button"
                            className={`shop-sidebar__subcat-link ${
                              isSubcategoryActive
                                ? "shop-sidebar__subcat-link--active"
                                : ""
                            }`}
                            onClick={() => selectSubcategory(node.id, sub.id)}
                          >
                            {sub.label}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </SidebarSection>
    );
  }

  function renderAvailabilitySection() {
    return (
      <SidebarSection label="Availability">
        <div
          className="shop-sidebar__availability"
          aria-label="Availability filter"
        >
          <button
            type="button"
            className={`shop-sidebar__availability-link ${!showAvailableOnly ? "shop-sidebar__availability-link--active" : ""}`}
            onClick={() => selectAvailability(false)}
          >
            All
          </button>
          <span className="shop-sidebar__availability-separator">
            {MIDDLE_DOT}
          </span>
          <button
            type="button"
            className={`shop-sidebar__availability-link ${showAvailableOnly ? "shop-sidebar__availability-link--active" : ""}`}
            onClick={() => selectAvailability(true)}
          >
            In Stock
          </button>
        </div>
      </SidebarSection>
    );
  }

  function renderPriceSection() {
    return (
      <SidebarSection label="Price Range">
        <div className="shop-sidebar__stack" role="list">
          {PRICE_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="shop-sidebar__item"
              role="listitem"
            >
              <button
                type="button"
                className={`shop-sidebar__parent-link ${
                  activePriceRange === option.value
                    ? "shop-sidebar__parent-link--active"
                    : ""
                }`}
                onClick={() => selectPriceRange(option.value)}
              >
                <span>{option.label}</span>
              </button>
            </div>
          ))}
        </div>
      </SidebarSection>
    );
  }

  const sidebarContent = (
    <div className="shop-sidebar">
      {renderCollectionSection()}
      {renderAvailabilitySection()}
      {renderPriceSection()}

      <button type="button" className="shop-sidebar__clear" onClick={clearAll}>
        Clear All
      </button>
    </div>
  );

  return (
    <>
      <aside className="shop-sidebar__desktop" aria-label="Shop filters">
        {sidebarContent}
      </aside>

      {isMobile ? (
        <div
          className={`shop-sidebar__overlay ${isOpen ? "shop-sidebar__overlay--open" : ""}`}
          aria-hidden={!isOpen}
          onClick={onClose}
        >
          <div
            className={`shop-sidebar__drawer ${isOpen ? "shop-sidebar__drawer--open" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shop-sidebar__drawer-header">
              <span className="shop-sidebar__drawer-title">Filter Pieces</span>
              <button
                type="button"
                className="shop-sidebar__drawer-close"
                onClick={onClose}
              >
                ✕ Close
              </button>
            </div>
            <div className="shop-sidebar__drawer-body">{sidebarContent}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
