document.addEventListener("DOMContentLoaded", async function () {
  if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
    await window.SharonCraftLiveSync.ready;
  }
  const utils = window.SharonCraftUtils;
  const featuredGrid = document.getElementById("featured-products");
  const categoryGrid = document.getElementById("home-categories");
  const arrivalsGrid = document.getElementById("new-arrivals");

  // Wait for data to be loaded
  await utils.waitForData();

  if (featuredGrid) {
    // For Supabase products, show spotlight items or first 4 products
    const allProducts = utils.data.products;
    const featuredProducts = allProducts.filter((product) => product.spotlightUntil || product.spotlightText).slice(0, 4);
    if (featuredProducts.length === 0) {
      // Fallback to first 4 products if no spotlight items
      featuredProducts.push(...allProducts.slice(0, 4));
    }
    featuredGrid.innerHTML = featuredProducts.map(utils.createProductCard).join("");
  }

  if (categoryGrid) {
    categoryGrid.innerHTML = utils.data.categories.map(utils.createCategoryCard).join("");
  }

  if (arrivalsGrid) {
    // Show products marked as new (with new_until date) or recent updates
    const newItems = utils.data.products
      .filter((product) => product.newUntil || (product.updatedAt && new Date(product.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
      .slice(0, 3);
    arrivalsGrid.innerHTML = newItems.map(utils.createProductCard).join("");
  }

  utils.refreshReveal();
});
