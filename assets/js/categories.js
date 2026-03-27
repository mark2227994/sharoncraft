document.addEventListener("DOMContentLoaded", async function () {
  if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
    await window.SharonCraftLiveSync.ready;
  }

  const utils = window.SharonCraftUtils;
  const grid = document.getElementById("categories-grid");

  if (!grid) {
    return;
  }

  await utils.waitForData();

  grid.innerHTML = utils.data.categories
    .map((category) => {
      const allProducts = utils.getProductsByCategory(category.slug);
      const previewProducts = allProducts.slice(0, 3);
      const previewMarkup = previewProducts.length
        ? previewProducts.map((product) => `<span>${product.name || `${category.name} piece`}</span>`).join("")
        : "<span>Fresh pieces coming soon</span>";

      return `
        <article class="category-feature-card reveal accent-${category.accent}">
          <div class="category-feature-media">
            <img src="${category.image}" alt="${category.name}" loading="lazy" />
          </div>
          <div class="category-feature-copy">
            <span class="section-kicker">${category.name}</span>
            <h2>${category.description}</h2>
            <p>${allProducts.length} product${allProducts.length === 1 ? "" : "s"} ready to explore.</p>
            <div class="category-preview-list">
              ${previewMarkup}
            </div>
            <a class="button button-primary" href="shop.html?category=${category.slug}">Shop ${category.name}</a>
          </div>
        </article>
      `;
    })
    .join("");

  utils.refreshReveal();
});
