document.addEventListener("DOMContentLoaded", async function () {
  const utils = window.SharonCraftUtils;
  if (!utils) return;

  await utils.waitForData();
  const reviewSummaryPromise = typeof utils.loadReviewSummaries === "function"
    ? utils.loadReviewSummaries().catch(function () { return null; })
    : Promise.resolve(null);

  const emptyState = document.getElementById("wishlist-page-empty");
  const listNode = document.getElementById("wishlist-page-list");
  const countNode = document.getElementById("wishlist-page-count");

  function renderWishlistUi() {
    const savedIds = utils.getWishlist();
    const count = savedIds.length;
    
    if (countNode) {
      countNode.textContent = `${count} piece${count === 1 ? "" : "s"}`;
    }

    if (emptyState) {
      emptyState.classList.toggle("is-hidden", count > 0);
    }

    if (!listNode) return;

    if (count === 0) {
      listNode.innerHTML = "";
      return;
    }

    // Map IDs to product objects securely and render standard product cards
    const products = savedIds
      .map(id => utils.getProductById(id))
      .filter(Boolean);

    listNode.innerHTML = products.map((product, index) => 
      utils.createProductCard(product, {
        listId: "wishlist",
        listName: "User Wishlist",
        index: index + 1
      })
    ).join("");

    utils.refreshReveal();
  }

  // Bind render function directly to window so app.js can trigger it if needed
  window.renderWishlistUi = renderWishlistUi;

  // Listen to cross-page wishlist updates
  window.addEventListener("sharoncraft-wishlist-updated", renderWishlistUi);

  // Initial render
  renderWishlistUi();

  reviewSummaryPromise.then(renderWishlistUi);

  if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
    window.SharonCraftLiveSync.ready
      .then(renderWishlistUi)
      .catch(function () {
        return null;
      });
  }
});
