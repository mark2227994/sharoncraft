document.addEventListener("DOMContentLoaded", async function () {
  const utils = window.SharonCraftUtils;
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  await utils.waitForData();
  const reviewSummaryPromise = typeof utils.loadReviewSummaries === "function"
    ? utils.loadReviewSummaries().catch(function () { return null; })
    : Promise.resolve(null);

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
  const wishlistButton = document.getElementById("product-wishlist");
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
  const reviewSummary = document.getElementById("product-review-summary");
  const reviewList = document.getElementById("product-review-list");
  const reviewEmpty = document.getElementById("product-review-empty");
  const reviewForm = document.getElementById("product-review-form");
  const reviewNameField = document.getElementById("product-review-name");
  const reviewLocationField = document.getElementById("product-review-location");
  const reviewRatingField = document.getElementById("product-review-rating");
  const reviewMessageField = document.getElementById("product-review-message");
  const reviewWhatsAppButton = document.getElementById("product-review-whatsapp");
  const reviewStorageKey = "sharoncraft_product_reviews";
  const liveCatalogApi = window.SharonCraftCatalog || null;

  const normalizeReviewText = (value) => String(value || "").trim();
  const normalizeSeoKeywords = (value) => {
    const source = Array.isArray(value) ? value.join(",") : String(value || "");
    const unique = new Set();
    return source
      .split(",")
      .map((item) => normalizeReviewText(item))
      .filter((item) => {
        const normalized = item.toLowerCase();
        if (!normalized || unique.has(normalized)) {
          return false;
        }
        unique.add(normalized);
        return true;
      });
  };
  const normalizeSeoOverride = (value) => {
    const source = value && typeof value === "object" ? value : {};
    return {
      title: normalizeReviewText(source.title),
      description: normalizeReviewText(source.description),
      keywords: normalizeSeoKeywords(source.keywords)
    };
  };
  const loadProductSeoOverride = async (id) => {
    if (
      !id ||
      !liveCatalogApi ||
      typeof liveCatalogApi.fetchSetting !== "function"
    ) {
      return normalizeSeoOverride({});
    }

    try {
      const overrides = await liveCatalogApi.fetchSetting("product_seo_overrides");
      if (!overrides || typeof overrides !== "object") {
        return normalizeSeoOverride({});
      }
      return normalizeSeoOverride(overrides[id]);
    } catch (error) {
      console.warn("Could not load product SEO overrides.", error);
      return normalizeSeoOverride({});
    }
  };
  const escapeReviewHtml = (value) =>
    normalizeReviewText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const formatReviewDate = (value) => {
    if (!value) {
      return "Just now";
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "Recently";
    }
    return new Intl.DateTimeFormat("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(parsed);
  };
  const clampReviewRating = (value) => Math.max(1, Math.min(5, Number(value) || 5));
  const createStarsMarkup = (value) => {
    const ratingValue = clampReviewRating(value);
    return `
      <span class="review-stars" aria-label="${ratingValue} out of 5 stars">
        ${Array.from({ length: 5 }, (_, index) => `<span aria-hidden="true">${index < ratingValue ? "&#9733;" : "&#9734;"}</span>`).join("")}
      </span>
    `;
  };
  const loadStoredReviewMap = () => {
    try {
      const raw = window.localStorage.getItem(reviewStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  };
  const saveStoredReviewMap = (reviewMap) => {
    try {
      window.localStorage.setItem(reviewStorageKey, JSON.stringify(reviewMap));
    } catch (error) {
      console.warn("Could not save product review locally.", error);
    }
  };
  const getLocalProductReviews = (id) => {
    const reviewMap = loadStoredReviewMap();
    const productReviews = reviewMap[id];
    return Array.isArray(productReviews)
      ? productReviews.filter((item) => item && normalizeReviewText(item.message))
      : [];
  };
  const saveLocalProductReview = (id, review) => {
    const reviewMap = loadStoredReviewMap();
    const existing = Array.isArray(reviewMap[id]) ? reviewMap[id] : [];
    reviewMap[id] = [review, ...existing].slice(0, 20);
    saveStoredReviewMap(reviewMap);
    return reviewMap[id];
  };
  const buildReviewMarkup = (review) => {
    const author = escapeReviewHtml(review.author || "SharonCraft client");
    const location = escapeReviewHtml(review.location || "Kenya");
    const message = escapeReviewHtml(review.message || "");
    const badge = review.status === "pending"
      ? '<span class="review-badge is-pending">Pending approval</span>'
      : '<span class="review-badge">Approved client review</span>';
    return `
      <article class="review-card reveal">
        <div class="review-card-top">
          <div>
            <strong>${author}</strong>
            <span>${location}</span>
          </div>
          <time datetime="${escapeReviewHtml(review.createdAt || "")}">${formatReviewDate(review.createdAt)}</time>
        </div>
        <div class="review-card-rating">
          ${createStarsMarkup(review.rating)}
          ${badge}
        </div>
        <p>${message}</p>
      </article>
    `;
  };
  const renderReviews = (reviews, metrics) => {
    if (!reviewList || !reviewSummary || !reviewEmpty) {
      return;
    }

    const reviewMetrics = metrics && typeof metrics === "object" ? metrics : {};
    const approvedCount = Number(reviewMetrics.approvedCount) || 0;
    const pendingCount = Number(reviewMetrics.pendingCount) || 0;
    const averageRating = Number(reviewMetrics.averageRating) || 0;

    if (!reviews.length) {
      reviewList.innerHTML = "";
      reviewEmpty.hidden = false;
      reviewSummary.textContent = "Reviews from SharonCraft clients will appear here as they come in.";
      return;
    }

    reviewEmpty.hidden = true;
    reviewList.innerHTML = reviews.map(buildReviewMarkup).join("");
    if (approvedCount > 0) {
      reviewSummary.textContent = `${approvedCount} approved review${approvedCount === 1 ? "" : "s"} with an average of ${averageRating.toFixed(1)}/5.${pendingCount ? ` ${pendingCount} more waiting for approval.` : ""}`;
      return;
    }

    reviewSummary.textContent = pendingCount
      ? `${pendingCount} review${pendingCount === 1 ? "" : "s"} waiting for approval. Clients can still submit feedback below.`
      : "Reviews from SharonCraft clients will appear here as they come in.";
  };
  const syncReviewWhatsAppLink = (currentProductName) => {
    if (!reviewWhatsAppButton) {
      return;
    }

    const reviewName = normalizeReviewText(reviewNameField && reviewNameField.value) || "A SharonCraft client";
    const reviewLocation = normalizeReviewText(reviewLocationField && reviewLocationField.value) || "Kenya";
    const reviewRating = clampReviewRating(reviewRatingField && reviewRatingField.value);
    const reviewMessage = normalizeReviewText(reviewMessageField && reviewMessageField.value) || `I would like to review ${currentProductName}.`;
    const reviewLines = [
      `Hello SharonCraft, I would like to leave a review for ${currentProductName}.`,
      `Name: ${reviewName}`,
      `Location: ${reviewLocation}`,
      `Rating: ${reviewRating}/5`,
      `Review: ${reviewMessage}`
    ];
    reviewWhatsAppButton.href = utils.buildWhatsAppUrl(reviewLines.join("\n"));
  };

  if (!product) {
    if (stickyBar) {
      stickyBar.hidden = true;
    }
    if (typeof utils.setPageMetadata === "function") {
      utils.setPageMetadata({
        title: "Product Not Found | SharonCraft",
        description: "This SharonCraft product link may be old. Browse the full collection and order on WhatsApp.",
        path: "/product.html",
        image: "assets/images/custom-occasion-beadwork-46mokm-opt.webp",
        type: "website"
      });
    }
    title.textContent = "Product not found";
    description.textContent = "The product link may be old. Please return to the shop and choose another item.";
    price.textContent = "";
    category.textContent = "";
    mainImage.src = "assets/images/custom-occasion-beadwork-46mokm-opt.webp";
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
    : ["assets/images/custom-occasion-beadwork-46mokm-opt.webp"];
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
  let seoOverride = normalizeSeoOverride({});
  const seoTitle = seoOverride.title || `${productName} | SharonCraft`;
  const seoDescription = seoOverride.description || `${productName} by SharonCraft. ${productDescription.slice(0, 120)} Order handmade ${categoryName.toLowerCase()} in Kenya on WhatsApp.`;
  const seoKeywords = seoOverride.keywords.length
    ? seoOverride.keywords.join(", ")
    : [categoryName, "handmade beadwork", "Kenya", "SharonCraft"].join(", ");
  const approvedReviews = typeof utils.getApprovedReviewsForProduct === "function"
    ? utils.getApprovedReviewsForProduct(product.id).map((item) => ({
        id: normalizeReviewText(item.id || item.sourceId),
        author: normalizeReviewText(item.author) || "SharonCraft client",
        location: normalizeReviewText(item.location) || "Kenya",
        rating: clampReviewRating(item.rating),
        message: normalizeReviewText(item.message),
        createdAt: normalizeReviewText(item.approvedAt || item.createdAt),
        status: "approved"
      }))
    : [];
  const approvedIds = new Set(approvedReviews.map((item) => item.id).filter(Boolean));
  const localReviews = getLocalProductReviews(product.id)
    .map((item, index) => ({
      id: normalizeReviewText(item.id) || `local-${index + 1}`,
      author: normalizeReviewText(item.author) || "SharonCraft client",
      location: normalizeReviewText(item.location) || "Kenya",
      rating: clampReviewRating(item.rating),
      message: normalizeReviewText(item.message),
      createdAt: normalizeReviewText(item.createdAt) || "",
      status: normalizeReviewText(item.status) || "pending"
    }))
    .filter((item) => item.message && !approvedIds.has(item.id));
  const allReviews = [...localReviews, ...approvedReviews];
  const reviewMetrics = {
    approvedCount: approvedReviews.length,
    pendingCount: localReviews.length,
    averageRating: approvedReviews.length
      ? approvedReviews.reduce((sum, item) => sum + clampReviewRating(item.rating), 0) / approvedReviews.length
      : 0
  };

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

  if (wishlistButton) {
    wishlistButton.dataset.toggleWishlist = product.id;
    const updateWishlistUI = () => {
      const isSaved = utils.getWishlist().includes(product.id);
      wishlistButton.classList.toggle("is-active", isSaved);
      wishlistButton.textContent = isSaved ? "Remove from Wishlist" : "Save to Wishlist";
    };
    updateWishlistUI();
    window.addEventListener("sharoncraft-wishlist-updated", updateWishlistUI);
  }

  if (limitedCopy) {
    limitedCopy.textContent = utils.getScarcityNote(product);
  }

  renderReviews(allReviews, reviewMetrics);
  syncReviewWhatsAppLink(productName);

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

  if (reviewForm) {
    const syncReviewLink = () => syncReviewWhatsAppLink(productName);
    [reviewNameField, reviewLocationField, reviewRatingField, reviewMessageField].forEach((field) => {
      if (field) {
        field.addEventListener("input", syncReviewLink);
        field.addEventListener("change", syncReviewLink);
      }
    });

    reviewForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const nextReview = {
        id: `review-${Date.now()}`,
        productId: product.id,
        productName,
        category: categoryName,
        author: normalizeReviewText(reviewNameField && reviewNameField.value) || "SharonCraft client",
        location: normalizeReviewText(reviewLocationField && reviewLocationField.value) || "Kenya",
        rating: clampReviewRating(reviewRatingField && reviewRatingField.value),
        message: normalizeReviewText(reviewMessageField && reviewMessageField.value),
        createdAt: new Date().toISOString(),
        status: "pending"
      };

      if (!nextReview.message) {
        if (typeof window.showToast === "function") {
          window.showToast("Please write a short review before posting.", "warning");
        }
        return;
      }

      const updatedLocalReviews = saveLocalProductReview(product.id, nextReview).map((item, index) => ({
        id: normalizeReviewText(item.id) || `local-${index + 1}`,
        author: normalizeReviewText(item.author) || "SharonCraft client",
        location: normalizeReviewText(item.location) || "Kenya",
        rating: clampReviewRating(item.rating),
        message: normalizeReviewText(item.message),
        createdAt: normalizeReviewText(item.createdAt) || "",
        status: normalizeReviewText(item.status) || "pending"
      }));
      const mergedReviews = [...updatedLocalReviews, ...approvedReviews];

      let submittedToLive = false;
      if (
        liveCatalogApi &&
        typeof liveCatalogApi.isConfigured === "function" &&
        liveCatalogApi.isConfigured() &&
        typeof liveCatalogApi.submitProductReview === "function"
      ) {
        try {
          await liveCatalogApi.submitProductReview(nextReview);
          submittedToLive = true;
        } catch (error) {
          console.warn("Unable to send review submission to Supabase.", error);
        }
      }

      renderReviews(mergedReviews, {
        approvedCount: approvedReviews.length,
        pendingCount: updatedLocalReviews.length,
        averageRating: reviewMetrics.averageRating
      });
      reviewForm.reset();
      if (reviewRatingField) {
        reviewRatingField.value = "5";
      }
      syncReviewWhatsAppLink(productName);
      utils.refreshReveal();

      if (typeof window.showToast === "function") {
        window.showToast(
          submittedToLive
            ? "Your review was sent for approval and saved on this device."
            : "Your review was saved on this device. You can also send it on WhatsApp.",
          "success"
        );
      }

      if (typeof utils.trackEvent === "function") {
        utils.trackEvent("submit_review", {
          product_id: product.id,
          product_name: productName,
          rating: nextReview.rating
        });
      }
    });
  }

  if (typeof utils.setPageMetadata === "function") {
    utils.setPageMetadata({
      title: seoTitle,
      description: seoDescription,
      keywords: seoKeywords,
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
      keywords: seoKeywords,
      ...(reviewMetrics.approvedCount
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: reviewMetrics.averageRating.toFixed(1),
              reviewCount: String(reviewMetrics.approvedCount)
            }
          }
        : {}),
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
          founder: {
            "@type": "Person",
            name: "Kelvin Mark",
            jobTitle: "CEO"
          },
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

  async function refreshDeferredProductContent() {
    if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
      try {
        await window.SharonCraftLiveSync.ready;
      } catch (error) {
        console.warn("Unable to finish live product sync.", error);
      }
    }

    await reviewSummaryPromise;

    seoOverride = await loadProductSeoOverride(product.id);
    const nextSeoTitle = seoOverride.title || `${productName} | SharonCraft`;
    const nextSeoDescription = seoOverride.description || `${productName} by SharonCraft. ${productDescription.slice(0, 120)} Order handmade ${categoryName.toLowerCase()} in Kenya on WhatsApp.`;
    const nextSeoKeywords = seoOverride.keywords.length
      ? seoOverride.keywords.join(", ")
      : [categoryName, "handmade beadwork", "Kenya", "SharonCraft"].join(", ");
    const nextApprovedReviews = typeof utils.getApprovedReviewsForProduct === "function"
      ? utils.getApprovedReviewsForProduct(product.id).map((item) => ({
          id: normalizeReviewText(item.id || item.sourceId),
          author: normalizeReviewText(item.author) || "SharonCraft client",
          location: normalizeReviewText(item.location) || "Kenya",
          rating: clampReviewRating(item.rating),
          message: normalizeReviewText(item.message),
          createdAt: normalizeReviewText(item.approvedAt || item.createdAt),
          status: "approved"
        }))
      : [];
    const nextApprovedIds = new Set(nextApprovedReviews.map((item) => item.id).filter(Boolean));
    const nextLocalReviews = getLocalProductReviews(product.id)
      .map((item, index) => ({
        id: normalizeReviewText(item.id) || `local-${index + 1}`,
        author: normalizeReviewText(item.author) || "SharonCraft client",
        location: normalizeReviewText(item.location) || "Kenya",
        rating: clampReviewRating(item.rating),
        message: normalizeReviewText(item.message),
        createdAt: normalizeReviewText(item.createdAt) || "",
        status: normalizeReviewText(item.status) || "pending"
      }))
      .filter((item) => item.message && !nextApprovedIds.has(item.id));
    const nextReviewMetrics = {
      approvedCount: nextApprovedReviews.length,
      pendingCount: nextLocalReviews.length,
      averageRating: nextApprovedReviews.length
        ? nextApprovedReviews.reduce((sum, item) => sum + clampReviewRating(item.rating), 0) / nextApprovedReviews.length
        : 0
    };

    renderReviews([...nextLocalReviews, ...nextApprovedReviews], nextReviewMetrics);

    if (typeof utils.setPageMetadata === "function") {
      utils.setPageMetadata({
        title: nextSeoTitle,
        description: nextSeoDescription,
        keywords: nextSeoKeywords,
        path: `/product.html?id=${encodeURIComponent(product.id)}`,
        image: productImages[0],
        imageAlt: productName,
        type: "product"
      });
    }

    utils.refreshReveal();
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
  refreshDeferredProductContent();
});
