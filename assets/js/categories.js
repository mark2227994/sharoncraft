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

  const isCompactMobile = window.matchMedia && window.matchMedia("(max-width: 640px)").matches;

  grid.innerHTML = utils.data.categories
    .map((category) => {
      const allProducts = utils.getProductsByCategory(category.slug);
      const previewProducts = allProducts.slice(0, isCompactMobile ? 2 : 3);
      const categoryCount = `${allProducts.length} ${allProducts.length === 1 ? "piece" : "pieces"}`;
      const categoryTip = category.tip || "Comfortable, easy browsing starts here.";
      const previewMarkup = previewProducts.length
        ? previewProducts.map((product) => `<span>${product.name || `${category.name} piece`}</span>`).join("")
        : "<span>Fresh pieces coming soon</span>";

      return `
        <article class="category-feature-card reveal accent-${category.accent}">
          <div class="category-feature-media">
            <img src="${category.image}" alt="${category.name}" loading="lazy" />
          </div>
          <div class="category-feature-copy">
            <div class="category-feature-head">
              <span class="section-kicker">${category.name}</span>
              <span class="category-feature-count">${categoryCount}</span>
            </div>
            <h2>${category.description}</h2>
            <p class="category-feature-note">${categoryTip}</p>
            <div class="category-preview-list">
              ${previewMarkup}
            </div>
            <div class="category-feature-actions">
              <a class="button button-primary" href="shop.html?category=${category.slug}">Explore ${category.name}</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  utils.refreshReveal();
});
