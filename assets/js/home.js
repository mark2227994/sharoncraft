document.addEventListener("DOMContentLoaded", async function () {
  if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
    await window.SharonCraftLiveSync.ready;
  }
  const utils = window.SharonCraftUtils;
  const heroKicker = document.getElementById("home-hero-kicker");
  const heroTitle = document.getElementById("home-hero-title");
  const heroDescription = document.getElementById("home-hero-description");
  const heroPrimary = document.getElementById("home-hero-primary");
  const heroSecondary = document.getElementById("home-hero-secondary");
  const heroImage = document.getElementById("home-hero-image");
  const favoriteKicker = document.getElementById("home-favorite-kicker");
  const favoriteTitle = document.getElementById("home-favorite-title");
  const favoriteDescription = document.getElementById("home-favorite-description");
  const favoriteImage = document.getElementById("home-favorite-image");
  const featuredGrid = document.getElementById("featured-products");
  const categoryGrid = document.getElementById("home-categories");
  const arrivalsGrid = document.getElementById("new-arrivals");

  await utils.waitForData();
  const allProducts = Array.isArray(utils.data.products) ? utils.data.products : [];
  const visuals = utils.data.homeVisuals || {};
  const hero = visuals.hero || {};
  const favorite = visuals.favorite || {};
  const favoriteProduct = allProducts.find((product) => product.id === favorite.productId);
  const favoriteFallbackImage =
    favoriteProduct && Array.isArray(favoriteProduct.images) && favoriteProduct.images[0]
      ? favoriteProduct.images[0]
      : "assets/images/IMG-20260214-WA0006.jpg";

  if (heroKicker) {
    heroKicker.textContent = hero.kicker || "Welcome to SharonCraft";
  }
  if (heroTitle) {
    heroTitle.textContent = hero.title || "Clean, colorful handmade beadwork for happy homes and beautiful gifting.";
  }
  if (heroDescription) {
    heroDescription.textContent =
      hero.description ||
      "Discover bracelets, necklaces, decor, and occasion sets made with a bright East African spirit. Ordering is simple, mobile-friendly, and ready for WhatsApp and M-Pesa.";
  }
  if (heroPrimary) {
    heroPrimary.textContent = hero.primaryLabel || "Shop Now";
    heroPrimary.href = hero.primaryHref || "shop.html";
  }
  if (heroSecondary) {
    heroSecondary.textContent = hero.secondaryLabel || "Our Story";
    heroSecondary.href = hero.secondaryHref || "about.html";
  }
  if (heroImage) {
    heroImage.src = hero.image || "assets/images/IMG-20260226-WA0005.jpg";
    heroImage.alt = hero.imageAlt || "Model wearing SharonCraft occasion beadwork";
  }
  if (favoriteKicker) {
    favoriteKicker.textContent = favorite.kicker || "Client Favorite";
  }
  if (favoriteTitle) {
    favoriteTitle.textContent = favorite.title || (favoriteProduct && favoriteProduct.name) || "Client Favorite";
  }
  if (favoriteDescription) {
    favoriteDescription.textContent =
      favorite.description ||
      (favoriteProduct && (favoriteProduct.shortDescription || favoriteProduct.description)) ||
      "A well-loved SharonCraft piece chosen for everyday beauty and easy gifting.";
  }
  if (favoriteImage) {
    favoriteImage.src = favorite.image || favoriteFallbackImage;
    favoriteImage.alt = favorite.imageAlt || (favoriteProduct && favoriteProduct.name) || "SharonCraft favorite product photo";
  }

  if (featuredGrid) {
    const featuredProducts = allProducts.filter((product) => product.featured).slice(0, 4);
    const visibleProducts = featuredProducts.length ? featuredProducts : allProducts.slice(0, 4);
    featuredGrid.innerHTML = visibleProducts.map(utils.createProductCard).join("");
  }

  if (categoryGrid) {
    categoryGrid.innerHTML = utils.data.categories.map(utils.createCategoryCard).join("");
  }

  if (arrivalsGrid) {
    const newItems = allProducts.filter((product) => product.newArrival).slice(0, 3);
    const visibleNewItems = newItems.length ? newItems : allProducts.slice(0, 3);
    arrivalsGrid.innerHTML = visibleNewItems.map(utils.createProductCard).join("");
  }

  utils.refreshReveal();
});
