document.addEventListener("DOMContentLoaded", function () {
  const utils = window.SharonCraftUtils;
  const featuredGrid = document.getElementById("featured-products");
  const categoryGrid = document.getElementById("home-categories");
  const arrivalsGrid = document.getElementById("new-arrivals");

  if (featuredGrid) {
    const featuredProducts = utils.data.products.filter((product) => product.featured).slice(0, 4);
    featuredGrid.innerHTML = featuredProducts.map(utils.createProductCard).join("");
  }

  if (categoryGrid) {
    categoryGrid.innerHTML = utils.data.categories.map(utils.createCategoryCard).join("");
  }

  if (arrivalsGrid) {
    const newItems = utils.data.products.filter((product) => product.newArrival).slice(0, 3);
    arrivalsGrid.innerHTML = newItems.map(utils.createProductCard).join("");
  }

  utils.refreshReveal();
});
