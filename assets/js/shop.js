document.addEventListener("DOMContentLoaded", function () {
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

  utils.renderCategorySelect(categorySelect);

  const url = new URL(window.location.href);
  const initialCategory = url.searchParams.get("category") || "";

  if (initialCategory) {
    categorySelect.value = initialCategory;
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
      return copy.sort((left, right) => Number(right.newArrival) - Number(left.newArrival));
    }

    return copy.sort((left, right) => Number(right.featured) - Number(left.featured));
  }

  function renderProducts() {
    const keyword = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const price = priceSelect.value;
    const sort = sortSelect.value;

    const filtered = utils.data.products.filter((product) => {
      const textMatch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.shortDescription.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword);
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
