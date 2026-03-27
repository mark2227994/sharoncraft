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
  const customizeButton = document.getElementById("product-customize");
  const addCartButton = document.getElementById("product-add-cart");
  const viewCartButton = document.getElementById("product-view-cart");
  const stickyBar = document.getElementById("product-sticky-bar");
  const stickyBuyButton = document.getElementById("product-sticky-buy");
  const stickyCartButton = document.getElementById("product-sticky-cart");
  const stickyTitle = document.getElementById("product-sticky-title");
  const stickyPrice = document.getElementById("product-sticky-price");
  const mainImage = document.getElementById("product-main-image");
  const thumbGrid = document.getElementById("product-thumbs");
  const relatedGrid = document.getElementById("related-products");
  const mpesaCopy = document.getElementById("product-mpesa-copy");
  const limitedCopy = document.getElementById("product-limited-copy");

  if (!product) {
    if (stickyBar) {
      stickyBar.hidden = true;
    }
    if (typeof utils.setPageMetadata === "function") {
      utils.setPageMetadata({
        title: "Product Not Found | SharonCraft",
        description: "This SharonCraft product link may be old. Browse the full collection and order on WhatsApp.",
        path: "/product.html",
        image: "assets/images/IMG-20260226-WA0005.jpg",
        type: "website"
      });
    }
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
  if (stickyBar) {
    stickyBar.hidden = false;
  }
  if (stickyTitle) {
    stickyTitle.textContent = productName;
  }
  if (stickyPrice) {
    stickyPrice.textContent = utils.formatCurrency(product.price);
  }

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
  if (stickyBuyButton) {
    stickyBuyButton.href = buyButton.href;
  }
  if (customizeButton) {
    customizeButton.href = utils.buildWhatsAppUrl(
      `Hello SharonCraft, I would like to ask about custom colors or a similar version of ${productName}.`
    );
  }

  if (typeof utils.setPageMetadata === "function") {
    utils.setPageMetadata({
      title: `${productName} | SharonCraft`,
      description: `${productDescription.slice(0, 140)} Order ${productName} on WhatsApp from SharonCraft.`,
      path: `/product.html?id=${encodeURIComponent(product.id)}`,
      image: productImages[0],
      type: "product"
    });
  }

  if (typeof utils.setStructuredData === "function") {
    utils.setStructuredData("product-page", {
      "@context": "https://schema.org",
      "@type": "Product",
      name: productName,
      image: productImages.map((image) => new URL(image, window.location.origin).href),
      description: productDescription,
      sku: product.id,
      category: productCategory ? productCategory.name : "Collection",
      brand: {
        "@type": "Brand",
        name: "SharonCraft"
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "KES",
        price: String(Number(product.price) || 0),
        availability: "https://schema.org/InStock",
        url: new URL(`/product.html?id=${encodeURIComponent(product.id)}`, window.location.origin).href,
        seller: {
          "@type": "Organization",
          name: "SharonCraft"
        }
      }
    });

    utils.setStructuredData("product-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: new URL("/", window.location.origin).href
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: new URL("/shop.html", window.location.origin).href
        },
        {
          "@type": "ListItem",
          position: 3,
          name: productCategory ? productCategory.name : "Collection",
          item: new URL(`/shop.html?category=${encodeURIComponent(product.category || "")}`, window.location.origin).href
        },
        {
          "@type": "ListItem",
          position: 4,
          name: productName,
          item: new URL(`/product.html?id=${encodeURIComponent(product.id)}`, window.location.origin).href
        }
      ]
    });
  }

  if (typeof utils.trackEvent === "function") {
    utils.trackEvent("product_view", {
      product_id: product.id,
      product_name: productName,
      category: productCategory ? productCategory.name : "Collection",
      value: Number(product.price) || 0,
      currency: "KES"
    });
  }

  if (addCartButton) {
    addCartButton.addEventListener("click", function () {
      utils.addToCart(product.id);
    });
  }

  if (stickyCartButton) {
    stickyCartButton.addEventListener("click", function () {
      utils.addToCart(product.id);
    });
  }

  if (viewCartButton) {
    viewCartButton.addEventListener("click", function () {
      utils.openCart();
    });
  }

  [
    { node: buyButton, label: "Product WhatsApp" },
    { node: customizeButton, label: "Product Custom Colors WhatsApp" },
    { node: stickyBuyButton, label: "Sticky Product WhatsApp" }
  ].forEach(function (entry) {
    if (!entry.node) {
      return;
    }

    entry.node.dataset.analyticsLabel = entry.label;
    entry.node.dataset.productId = product.id;
    entry.node.dataset.productName = productName;
  });

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
