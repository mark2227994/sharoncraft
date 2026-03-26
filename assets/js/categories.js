document.addEventListener("DOMContentLoaded", async function () {
  const utils = window.SharonCraftUtils;
  const grid = document.getElementById("categories-grid");

  if (!grid) {
    return;
  }

  // Wait for data to be loaded
  await utils.waitForData();

  grid.innerHTML = await Promise.all(
    utils.data.categories.map(async (category) => {
      const products = (await utils.getProductsByCategory(category.slug)).slice(0, 3);
      const allProducts = await utils.getProductsByCategory(category.slug);

      return `
        <article class="category-feature-card reveal accent-${category.accent}">
          <div class="category-feature-media">
            <img src="${category.image}" alt="${category.name}" loading="lazy" />
          </div>
          <div class="category-feature-copy">
            <span class="section-kicker">${category.name}</span>
            <h2>${category.description}</h2>
            <p>${allProducts ? allProducts.length : 'Several'} products ready to explore.</p>
            <div class="category-preview-list">
              ${products.map((product, index) => {
                const creativeNames = [
                  "✨ Artisan Treasure",
                  "🌟 Handcrafted Gem", 
                  "🎨 Colorful Creation",
                  "💎 Beaded Beauty",
                  "🌈 Kenyan Craft",
                  "🎭 Unique Piece"
                ];
                const displayName = product.name || `✨ ${category.name} Exclusive`;
                return `<span>${displayName}</span>`;
              }).join("")}
            </div>
            <a class="button button-primary" href="shop.html?category=${category.slug}">Shop ${category.name}</a>
          </div>
        </article>
      `;
    })
  ).then(results => results.join(""));

  utils.refreshReveal();
});
