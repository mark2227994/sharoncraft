import { categoryOptions } from "../data/site";

export default function CategoryStrip({
  activeCategory = "All",
  onSelect,
  className = "",
  categories = categoryOptions,
}) {
  return (
    <div className={`category-strip-shell ${className}`.trim()}>
      <div className="category-strip">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-pill ${activeCategory === category ? "category-pill--active" : ""}`}
            onClick={() => onSelect?.(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
