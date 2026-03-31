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
  const giftButton = document.getElementById("product-gift");
  const shareButton = document.getElementById("product-share");
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
  const customerProof = document.getElementById("product-customer-proof");
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
    const fallbackProducts = utils.data.products.slice(0, 4);
    relatedGrid.innerHTML = fallbackProducts
      .map((item, index) =>
        utils.createProductCard(item, {
          listId: "related_products",
          listName: "Related Products",
          index: index + 1
        })
      )
      .join("");
    if (typeof utils.trackProductListView === "function") {
      utils.trackProductListView({
        listId: "related_products",
        listName: "Related Products",
        products: fallbackProducts
      });
    }
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
  const site = utils.data && utils.data.site ? utils.data.site : {};
  const siteName = site.name || "SharonCraft";
  const siteUrl = new URL("/", window.location.origin).href;
  const productUrl = new URL(`/product.html?id=${encodeURIComponent(product.id)}`, window.location.origin).href;
  const socialLinks = (Array.isArray(site.socials) ? site.socials : [])
    .map((item) => String(item && item.url || "").trim())
    .filter((url) => url && url !== "#");
  const availabilityUrl = product.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";
  const categoryName = productCategory ? productCategory.name : "Collection";
  const seoDescription = `${productName} by SharonCraft. ${productDescription.slice(0, 120)} Order handmade ${categoryName.toLowerCase()} in Kenya on WhatsApp.`;

  document.title = `${productName} | SharonCraft`;
  title.textContent = productName;
  price.textContent = utils.formatCurrency(product.price);
  description.textContent = productDescription;
  category.textContent = categoryName;
  mainImage.src = productImages[0];
  mainImage.alt = productName;
  mpesaCopy.textContent = `Add ${productName} to cart, open the cart, and pay by M-Pesa with the STK prompt sent to your phone.`;
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

  if (customerProof) {
    const testimonials = (utils.data.site && Array.isArray(utils.data.site.testimonials) ? utils.data.site.testimonials : []).slice(0, 2);
    customerProof.innerHTML = `
      <article class="customer-proof-card reveal">
        <span class="section-kicker">Delivery Confidence</span>
        <h3>Ask before you order</h3>
        <p>Buyers can confirm availability, delivery area, and gifting details on WhatsApp before paying for ${productName}.</p>
      </article>
      <article class="customer-proof-card reveal">
        <span class="section-kicker">Handmade Detail</span>
        <h3>Every piece keeps a crafted finish</h3>
        <p>${productName} is presented with close-up images, clear pricing, and a simple support path so first-time shoppers know what to expect.</p>
      </article>
      ${testimonials.map((item) => `
        <article class="customer-proof-card reveal">
          <span class="section-kicker">Client Review</span>
          <h3>${item.name}</h3>
          <p>"${item.quote}"</p>
        </article>
      `).join("")}
    `;
  }

  breadcrumb.innerHTML = `
    <a href="index.html">Home</a>
    <span>/</span>
    <a href="shop.html">Shop</a>
    <span>/</span>
    <a href="shop.html?category=${product.category}">${categoryName}</a>
    <span>/</span>
    <strong>${productName}</strong>
  `;

  detailList.innerHTML = productDetails.map((item) => `<li>${item}</li>`).join("");
  buyButton.href = utils.buildWhatsAppUrl(utils.buildProductWhatsAppMessage(product, { intent: "order" }));
  if (stickyBuyButton) {
    stickyBuyButton.href = buyButton.href;
  }
  if (customizeButton) {
    customizeButton.href = utils.buildWhatsAppUrl(utils.buildProductWhatsAppMessage(product, { intent: "custom" }));
  }
  if (giftButton) {
    giftButton.href = utils.buildWhatsAppUrl(utils.buildProductWhatsAppMessage(product, { intent: "gift" }));
  }

  if (typeof utils.setPageMetadata === "function") {
    utils.setPageMetadata({
      title: `${productName} | SharonCraft`,
      description: seoDescription,
      path: `/product.html?id=${encodeURIComponent(product.id)}`,
      image: productImages[0],
      imageAlt: productName,
      type: "product"
    });
  }

  if (typeof utils.setStructuredData === "function") {
    utils.setStructuredData("product-page", {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${productUrl}#product`,
      name: productName,
      url: productUrl,
      mainEntityOfPage: productUrl,
      image: productImages.map((image) => new URL(image, window.location.origin).href),
      description: seoDescription,
      sku: product.id,
      category: categoryName,
      brand: {
        "@type": "Brand",
        name: "SharonCraft"
      },
      keywords: [categoryName, "handmade beadwork", "Kenya", "SharonCraft"].join(", "),
      offers: {
        "@type": "Offer",
        priceCurrency: "KES",
        price: String(Number(product.price) || 0),
        availability: availabilityUrl,
        itemCondition: "https://schema.org/NewCondition",
        url: productUrl,
        seller: {
          "@type": "Organization",
          name: siteName,
          url: siteUrl,
          telephone: site.phone || "",
          email: site.email || "",
          sameAs: socialLinks
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
          item: productUrl
        }
      ]
    });
  }

  if (typeof utils.trackEvent === "function") {
    const productAnalyticsItem = typeof utils.buildAnalyticsItem === "function"
      ? utils.buildAnalyticsItem(product, {
          index: 1,
          listId: "product_detail",
          listName: "Product Detail"
        })
      : {
          item_id: product.id,
          item_name: productName,
          item_category: categoryName,
          price: Number(product.price) || 0,
          quantity: 1
        };

    utils.trackEvent("view_item", {
      currency: "KES",
      value: Number(product.price) || 0,
      items: [productAnalyticsItem]
    });

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

  if (shareButton) {
    shareButton.addEventListener("click", async function () {
      const sharePayload = {
        title: `${productName} | SharonCraft`,
        text: `I found this handmade SharonCraft piece: ${productName}`,
        url: productUrl
      };

      try {
        if (navigator.share) {
          await navigator.share(sharePayload);
          if (typeof utils.trackEvent === "function") {
            utils.trackEvent("share", {
              method: "native",
              product_id: product.id,
              product_name: productName
            });
          }
          if (typeof window.showToast === "function") {
            window.showToast("Product ready to share.", "success");
          }
          return;
        }
      } catch (error) {
        if (error && error.name === "AbortError") {
          return;
        }
      }

      window.open(
        utils.buildWhatsAppUrl(utils.buildProductWhatsAppMessage(product, { intent: "share" })),
        "_blank",
        "noopener"
      );
      if (typeof utils.trackEvent === "function") {
        utils.trackEvent("share", {
          method: "whatsapp",
          product_id: product.id,
          product_name: productName
        });
      }
    });
  }

  [
    { node: buyButton, label: "Product WhatsApp" },
    { node: customizeButton, label: "Product Custom Colors WhatsApp" },
    { node: giftButton, label: "Product Gift WhatsApp" },
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
          <img src="${image}" alt="${productName} thumbnail ${index + 1}" loading="lazy" decoding="async" />
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

  const relatedProducts = await utils.getRelatedProducts(product);
  relatedGrid.innerHTML = relatedProducts
    .map((item, index) =>
      utils.createProductCard(item, {
        listId: "related_products",
        listName: "Related Products",
        index: index + 1
      })
    )
    .join("");
  if (typeof utils.trackProductListView === "function") {
    utils.trackProductListView({
      listId: "related_products",
      listName: "Related Products",
      products: relatedProducts
    });
  }
  utils.ensureCartTimer();
  utils.refreshReveal();
});
