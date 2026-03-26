document.addEventListener("DOMContentLoaded", async function () {
  if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
    await window.SharonCraftLiveSync.ready;
  }
  const utils = window.SharonCraftUtils;
  const grid = document.getElementById("shop-grid");
  const searchInput = document.getElementById("shop-search");
  const categorySelect = document.getElementById("shop-category");
  const priceSelect = document.getElementById("shop-price");
  const sortSelect = document.getElementById("shop-sort");
  const countLabel = document.getElementById("shop-count");
  const clearButton = document.getElementById("clear-shop-filters");

  if (!grid) {
    return;
  }

  // Wait for data to be loaded
  await utils.waitForData();

  utils.renderCategorySelect(categorySelect);

  const url = new URL(window.location.href);
  const initialCategory = url.searchParams.get("category") || "";

  if (initialCategory) {
    categorySelect.value = initialCategory;
  }

  const chipContainer = document.getElementById("shop-chips");
  const filterGrid = document.getElementById("shop-filter-grid");
  const toggleFiltersButton = document.getElementById("shop-toggle-filters");

  function buildChips() {
    if (!chipContainer) return;

    const categories = [
      { value: "", label: "All" },
      ...Array.from(categorySelect.options)
        .filter((option) => option.value)
        .map((option) => ({ value: option.value, label: option.textContent }))
        .slice(0, 4)
    ];

    chipContainer.innerHTML = categories
      .map(
        (cat) => `
          <button type="button" class="filter-chip ${cat.value === categorySelect.value ? "is-active" : ""}" data-chip="${cat.value}">
            ${cat.label}
          </button>
        `
      )
      .join("");
  }

  function setFilterOpen(open) {
    if (!filterGrid) return;
    filterGrid.classList.toggle("is-open", open);
    if (toggleFiltersButton) {
      toggleFiltersButton.textContent = open ? "Hide Filters" : "Show Filters";
    }
  }

  if (toggleFiltersButton) {
    toggleFiltersButton.addEventListener("click", () => setFilterOpen(!filterGrid.classList.contains("is-open")));
  }

  if (chipContainer) {
    chipContainer.addEventListener("click", function (event) {
      const button = event.target.closest("[data-chip]");
      if (!button) return;
      const value = button.dataset.chip;
      categorySelect.value = value;
      renderProducts();
    });
  }

  function matchesPrice(product, priceFilter) {
    if (!priceFilter) {
      return true;
    }

    if (priceFilter === "under-2000") {
      return product.price < 2000;
    }

    if (priceFilter === "2000-5000") {
      return product.price >= 2000 && product.price <= 5000;
    }

    if (priceFilter === "over-5000") {
      return product.price > 5000;
    }

    return true;
  }

  function applySort(products, value) {
    const copy = [...products];

    if (value === "price-asc") {
      return copy.sort((left, right) => left.price - right.price);
    }

    if (value === "price-desc") {
      return copy.sort((left, right) => right.price - left.price);
    }

    if (value === "newest") {
      return copy.sort((left, right) => {
        // Sort by new_until date or updated_at for Supabase products
        const leftDate = left.newUntil ? new Date(left.newUntil) : new Date(left.updatedAt || 0);
        const rightDate = right.newUntil ? new Date(right.newUntil) : new Date(right.updatedAt || 0);
        return rightDate - leftDate;
      });
    }

    return copy.sort((left, right) => {
      // Sort by spotlight first, then by sort_order
      const leftSpotlight = Boolean(left.spotlightUntil || left.spotlightText);
      const rightSpotlight = Boolean(right.spotlightUntil || right.spotlightText);
      if (leftSpotlight !== rightSpotlight) {
        return rightSpotlight ? 1 : -1;
      }
      return (left.sortOrder || 0) - (right.sortOrder || 0);
    });
  }

  function renderProducts() {
    const keyword = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const price = priceSelect.value;
    const sort = sortSelect.value;

    buildChips();

    const filtered = utils.data.products.filter((product) => {
      const textMatch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        (product.story || "").toLowerCase().includes(keyword) ||
        (product.material || "").toLowerCase().includes(keyword);
      const categoryMatch = !category || product.category === category;
      const priceMatch = matchesPrice(product, price);
      return textMatch && categoryMatch && priceMatch;
    });

    const sorted = applySort(filtered, sort);
    grid.innerHTML = sorted.map(utils.createProductCard).join("");
    countLabel.textContent = `${sorted.length} product${sorted.length === 1 ? "" : "s"} found`;
    utils.refreshReveal();
  }

  [searchInput, categorySelect, priceSelect, sortSelect].forEach((element) => {
    element.addEventListener("input", renderProducts);
    element.addEventListener("change", renderProducts);
  });

  clearButton.addEventListener("click", function () {
    searchInput.value = "";
    categorySelect.value = "";
    priceSelect.value = "";
    sortSelect.value = "featured";
    renderProducts();
  });

  renderProducts();
});
