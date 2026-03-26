document.addEventListener("DOMContentLoaded", async function () {
  const utils = window.SharonCraftUtils;
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  // Wait for data to be loaded
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

  document.title = `${product.name || 'Artisan Creation'} | SharonCraft`;
  title.textContent = product.name || '✨ Artisan Creation';
  price.textContent = utils.formatCurrency(product.price);
  description.textContent = product.description;
  category.textContent = productCategory ? productCategory.name : "Collection";
  mainImage.src = product.images[0];
  mainImage.alt = product.name || 'SharonCraft artisan product';
  mpesaCopy.textContent = `Confirm ${product.name || 'this beautiful piece'} on WhatsApp, then pay via M-Pesa after the total and delivery fee are shared.`;
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
    <strong>${product.name || '✨ Artisan Creation'}</strong>
  `;

  detailList.innerHTML = product.details.map((item) => `<li>${item}</li>`).join("");
  buyButton.href = utils.buildWhatsAppUrl(
    `Hello SharonCraft, I would like to order the ${product.name || 'beautiful artisan piece'} for ${utils.formatCurrency(product.price)}.`
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

  thumbGrid.innerHTML = product.images
    .map(
      (image, index) => `
        <button class="thumb-button ${index === 0 ? "is-active" : ""}" type="button" data-image="${image}" aria-label="View image ${index + 1}">
          <img src="${image}" alt="${product.name || 'SharonCraft product'} thumbnail ${index + 1}" loading="lazy" />
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
