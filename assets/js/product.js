document.addEventListener("DOMContentLoaded", async function () {
  if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
    await window.SharonCraftLiveSync.ready;
  }

  const utils = window.SharonCraftUtils;
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  await utils.waitForData();

  const product = await utils.getProductById(productId);
  const breadcrumb = document.getElementById("product-breadcrumb");
  const title = document.getElementById("product-title");
  const price = document.getElementById("product-price");
  const description = document.getElementById("product-description");
  const category = document.getElementById("product-category");
  const detailList = document.getElementById("product-details");
  const buyButton = document.getElementById("product-buy");
  const addCartButton = document.getElementById("product-add-cart");
  const viewCartButton = document.getElementById("product-view-cart");
  const mainImage = document.getElementById("product-main-image");
  const thumbGrid = document.getElementById("product-thumbs");
  const relatedGrid = document.getElementById("related-products");
  const mpesaCopy = document.getElementById("product-mpesa-copy");
  const limitedCopy = document.getElementById("product-limited-copy");

  if (!product) {
    title.textContent = "Product not found";
    description.textContent = "The product link may be old. Please return to the shop and choose another item.";
    price.textContent = "";
    category.textContent = "";
    mainImage.src = "assets/images/IMG-20260226-WA0005.jpg";
    mainImage.alt = "SharonCraft featured piece";
    breadcrumb.innerHTML = `<a href="index.html">Home</a><span>/</span><a href="shop.html">Shop</a><span>/</span><strong>Not found</strong>`;
    relatedGrid.innerHTML = utils.data.products.slice(0, 4).map(utils.createProductCard).join("");
    return;
  }

  const productCategory = utils.getCategoryBySlug(product.category);
  const productName = product.name || "Artisan Creation";
  const productDescription = product.description || product.shortDescription || "Handmade by SharonCraft artisans.";
  const productImages = Array.isArray(product.images) && product.images.length
    ? product.images
    : ["assets/images/IMG-20260226-WA0005.jpg"];
  const productDetails = Array.isArray(product.details) && product.details.length
    ? product.details
    : ["Handmade in Kenya", "Shared with care by SharonCraft"];

  document.title = `${productName} | SharonCraft`;
  title.textContent = productName;
  price.textContent = utils.formatCurrency(product.price);
  description.textContent = productDescription;
  category.textContent = productCategory ? productCategory.name : "Collection";
  mainImage.src = productImages[0];
  mainImage.alt = productName;
  mpesaCopy.textContent = `Confirm ${productName} on WhatsApp, then pay via M-Pesa after the total and delivery fee are shared.`;

  if (limitedCopy) {
    limitedCopy.textContent = utils.getScarcityNote(product);
  }

  breadcrumb.innerHTML = `
    <a href="index.html">Home</a>
    <span>/</span>
    <a href="shop.html">Shop</a>
    <span>/</span>
    <a href="shop.html?category=${product.category}">${productCategory ? productCategory.name : "Collection"}</a>
    <span>/</span>
    <strong>${productName}</strong>
  `;

  detailList.innerHTML = productDetails.map((item) => `<li>${item}</li>`).join("");
  buyButton.href = utils.buildWhatsAppUrl(
    `Hello SharonCraft, I would like to order the ${productName} for ${utils.formatCurrency(product.price)}.`
  );

  if (addCartButton) {
    addCartButton.addEventListener("click", function () {
      utils.addToCart(product.id);
    });
  }

  if (viewCartButton) {
    viewCartButton.addEventListener("click", function () {
      utils.openCart();
    });
  }

  thumbGrid.innerHTML = productImages
    .map(
      (image, index) => `
        <button class="thumb-button ${index === 0 ? "is-active" : ""}" type="button" data-image="${image}" aria-label="View image ${index + 1}">
          <img src="${image}" alt="${productName} thumbnail ${index + 1}" loading="lazy" />
        </button>
      `
    )
    .join("");

  thumbGrid.addEventListener("click", function (event) {
    const button = event.target.closest(".thumb-button");

    if (!button) {
      return;
    }

    thumbGrid.querySelectorAll(".thumb-button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    mainImage.src = button.dataset.image;
  });

  relatedGrid.innerHTML = (await utils.getRelatedProducts(product)).map(utils.createProductCard).join("");
  utils.ensureCartTimer();
  utils.refreshReveal();
});
