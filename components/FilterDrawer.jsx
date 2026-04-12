export default function FilterDrawer({
  isOpen,
  onClose,
  activeCategory,
  setActiveCategory,
  showAvailableOnly,
  setShowAvailableOnly,
  sortBy,
  setSortBy,
  categories,
}) {
  if (!isOpen) return null;

  return (
    <div className="filter-drawer" role="dialog" aria-modal="true" aria-label="Filter products">
      <button type="button" className="filter-drawer__overlay" onClick={onClose} aria-label="Close filters" />
      <div className="filter-drawer__panel">
        <div>
          <p className="overline" style={{ marginBottom: "8px" }}>
            Refine the gallery
          </p>
          <h2 className="display-md">Filters</h2>
        </div>

        <div className="filter-drawer__group">
          <label className="heading-sm" htmlFor="filter-category">
            Category
          </label>
          <select
            id="filter-category"
            className="admin-select"
            value={activeCategory}
            onChange={(event) => setActiveCategory(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-drawer__group">
          <span className="heading-sm">Availability</span>
          <label className="filter-drawer__option">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(event) => setShowAvailableOnly(event.target.checked)}
            />
            In stock only
          </label>
        </div>

        <div className="filter-drawer__group">
          <label className="heading-sm" htmlFor="filter-sort">
            Sort
          </label>
          <select
            id="filter-sort"
            className="admin-select"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="featured">Featured first</option>
            <option value="recent">Recently added</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div className="filter-drawer__footer">
          <button
            type="button"
            className="filter-drawer__action"
            onClick={() => {
              setActiveCategory("All");
              setShowAvailableOnly(false);
              setSortBy("featured");
            }}
          >
            Reset
          </button>
          <button type="button" className="filter-drawer__action filter-drawer__action--primary" onClick={onClose}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
