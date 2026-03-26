document.addEventListener("DOMContentLoaded", function () {
  const utils = window.SharonCraftUtils;
  const grid = document.getElementById("categories-grid");

  if (!grid) {
    return;
  }

  grid.innerHTML = utils.data.categories
    .map((category) => {
      const products = utils.getProductsByCategory(category.slug).slice(0, 3);

      return `
        <article class="category-feature-card reveal accent-${category.accent}">
          <div class="category-feature-media">
            <img src="${category.image}" alt="${category.name}" loading="lazy" />
          </div>
          <div class="category-feature-copy">
            <span class="section-kicker">${category.name}</span>
            <h2>${category.description}</h2>
            <p>${utils.getProductsByCategory(category.slug).length} products ready to explore.</p>
            <div class="category-preview-list">
              ${products.map((product) => `<span>${product.name}</span>`).join("")}
            </div>
            <a class="button button-primary" href="shop.html?category=${category.slug}">Shop ${category.name}</a>
          </div>
        </article>
      `;
    })
    .join("");

  utils.refreshReveal();
});
