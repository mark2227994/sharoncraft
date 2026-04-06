document.addEventListener("DOMContentLoaded", async function () {
  const authView = document.getElementById("assistant-auth");
  const appView = document.getElementById("assistant-app");
  const loginForm = document.getElementById("assistant-login-form");
  const emailInput = document.getElementById("assistant-email");
  const passwordInput = document.getElementById("assistant-password");
  const authStatus = document.getElementById("assistant-auth-status");
  const appStatus = document.getElementById("assistant-app-status");
  const userCopy = document.getElementById("assistant-user-copy");
  const liveChip = document.getElementById("assistant-live-chip");
  const signOutButton = document.getElementById("assistant-sign-out");
  const tabButtons = Array.from(document.querySelectorAll("[data-assistant-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-assistant-panel]"));
  const rangeButtons = Array.from(document.querySelectorAll("[data-assistant-range]"));
  const form = document.getElementById("assistant-product-form");
  const formKicker = document.getElementById("assistant-form-kicker");
  const formTitle = document.getElementById("assistant-form-title");
  const resetFormButton = document.getElementById("assistant-reset-form");
  const saveProductButton = document.getElementById("assistant-save-product");
  const productIdInput = document.getElementById("assistant-product-id");
  const nameInput = document.getElementById("assistant-name");
  const categoryInput = document.getElementById("assistant-category");
  const priceInput = document.getElementById("assistant-price");
  const autoPriceInput = document.getElementById("assistant-auto-price");
  const priceFormulaNote = document.getElementById("assistant-price-formula");
  const calculatedPriceInput = document.getElementById("assistant-calculated-price");
  const imageInput = document.getElementById("assistant-image");
  const imageStageInput = document.getElementById("assistant-image-stage");
  const imageStageStatus = document.getElementById("assistant-image-stage-status");
  const imageFileInput = document.getElementById("assistant-image-file");
  const galleryInput = document.getElementById("assistant-gallery");
  const descriptionInput = document.getElementById("assistant-description");
  const templateHint = document.getElementById("assistant-template-hint");
  const templateButtons = Array.from(document.querySelectorAll("[data-assistant-description-template]"));
  const detailsInput = document.getElementById("assistant-details");
  const badgeInput = document.getElementById("assistant-badge");
  const featuredInput = document.getElementById("assistant-featured");
  const newInput = document.getElementById("assistant-new");
  const soldOutInput = document.getElementById("assistant-soldout");
  const imagePreviewWrap = document.getElementById("assistant-image-preview-wrap");
  const imagePreview = document.getElementById("assistant-image-preview");
  const miniMetrics = document.getElementById("assistant-mini-metrics");
  const refreshOrdersButton = document.getElementById("assistant-refresh-orders");
  const orderSearchInput = document.getElementById("assistant-order-search");
  const orderFilterInput = document.getElementById("assistant-order-filter");
  const orderSummary = document.getElementById("assistant-order-summary");
  const orderList = document.getElementById("assistant-order-list");
  const refreshProductsButton = document.getElementById("assistant-refresh-products");
  const productSearchInput = document.getElementById("assistant-product-search");
  const productList = document.getElementById("assistant-product-list");
  const refreshAnalyticsButton = document.getElementById("assistant-refresh-analytics");
  const analyticsSummary = document.getElementById("assistant-analytics-summary");
  const analyticsProducts = document.getElementById("assistant-analytics-products");
  const analyticsPages = document.getElementById("assistant-analytics-pages");
  const analyticsFeed = document.getElementById("assistant-analytics-feed");

  const catalogApi = window.SharonCraftCatalog || null;
  const pricing = window.SharonCraftPricing || null;
  const userController = window.SharonCraftUserController || null;
  const categories = window.SharonCraftData && Array.isArray(window.SharonCraftData.categories)
    ? window.SharonCraftData.categories
    : [];
  const imageWorkflowFolders = Object.freeze({
    ready: "assets/images/ready",
    live: "assets/images/live",
    archive: "assets/images/archive"
  });
  const imageWorkflowStages = Object.freeze(["ready", "live", "archive"]);

  let currentUser = null;
  let products = [];
  let orders = [];
  let analyticsEvents = [];
  let currentRange = "7d";

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slugify(value) {
    return normalizeText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `product-${Date.now()}`;
  }

  function parseList(value) {
    return normalizeText(value)
      .split(",")
      .map(function (item) {
        return normalizeText(item);
      })
      .filter(Boolean);
  }

  function normalizeImageStage(stage) {
    const normalized = normalizeText(stage).toLowerCase();
    return imageWorkflowStages.includes(normalized) ? normalized : "";
  }

  function getImageStageLabel(stage) {
    const normalized = normalizeImageStage(stage);
    if (normalized === "archive") {
      return "Archive";
    }
    if (normalized === "live") {
      return "Live in market";
    }
    return "Ready for sale";
  }

  function getImageStageFolder(stage) {
    const normalized = normalizeImageStage(stage) || "ready";
    return imageWorkflowFolders[normalized] || imageWorkflowFolders.ready;
  }

  function getImageStageFromNotes(notes) {
    const stageEntry = normalizeText(notes)
      .split("|")
      .find(function (part) {
        return /^stage:/i.test(normalizeText(part));
      });
    return normalizeImageStage(normalizeText(stageEntry).replace(/^stage:/i, ""));
  }

  function inferImageStageFromPath(path) {
    const normalized = normalizeText(path).toLowerCase();
    if (!normalized) {
      return "ready";
    }
    if (normalized.includes("/ready/") || normalized.includes("/ready-for-sale/")) {
      return "ready";
    }
    if (normalized.includes("/archive/")) {
      return "archive";
    }
    if (normalized.includes("/live/") || normalized.includes("/live-products/")) {
      return "live";
    }
    if (
      normalized.startsWith("http://") ||
      normalized.startsWith("https://") ||
      normalized.startsWith("assets/images/")
    ) {
      return "live";
    }
    if (normalized.startsWith("data:") || normalized.startsWith("blob:")) {
      return "ready";
    }
    return "live";
  }

  function isManagedWorkflowImage(path) {
    const normalized = normalizeText(path).toLowerCase();
    return normalized.includes("/ready/") || normalized.includes("/ready-for-sale/") || normalized.includes("/live/") || normalized.includes("/live-products/") || normalized.includes("/archive/");
  }

  function rewriteImagePathForStage(path, stage) {
    const normalizedPath = normalizeText(path);
    const normalizedStage = normalizeImageStage(stage) || "ready";
    if (!normalizedPath || !isManagedWorkflowImage(normalizedPath)) {
      return normalizedPath;
    }
    const fileName = normalizedPath.split("/").pop();
    return fileName ? `${getImageStageFolder(normalizedStage)}/${fileName}` : normalizedPath;
  }

  function rewriteImagesForStage(images, stage) {
    return Array.from(new Set((Array.isArray(images) ? images : []).map(function (image) {
      return rewriteImagePathForStage(image, stage);
    }).filter(Boolean)));
  }

  function getSelectedImageStage() {
    return normalizeImageStage(imageStageInput && imageStageInput.value) || "ready";
  }

  function buildProductNotes(categorySlug, imageStage) {
    const parts = [normalizeText(categorySlug), "assistant-admin"].filter(Boolean);
    const normalizedStage = normalizeImageStage(imageStage);
    if (normalizedStage) {
      parts.push(`stage:${normalizedStage}`);
    }
    return parts.join("|");
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function getProductPricingMode(product) {
    if (product && typeof product === "object") {
      return normalizeText(product.pricingMode).toLowerCase() === "formula" ? "formula" : "manual";
    }

    return autoPriceInput && autoPriceInput.checked ? "formula" : "manual";
  }

  function getEditablePrice(product) {
    if (getProductPricingMode(product) === "formula") {
      return Math.max(0, Number(product && (product.basePrice ?? product.price)) || 0);
    }

    return Math.max(0, Number(product && product.price) || 0);
  }

  function getPublishedPrice(basePrice, pricingMode) {
    const normalizedBasePrice = Math.max(0, Number(basePrice) || 0);

    if (pricingMode === "formula" && pricing && typeof pricing.calculateWebsitePrice === "function") {
      return pricing.calculateWebsitePrice(normalizedBasePrice, window.SharonCraftData && window.SharonCraftData.site);
    }

    return normalizedBasePrice;
  }

  function getPricingSettings() {
    if (pricing && typeof pricing.getPricingSettings === "function") {
      return pricing.getPricingSettings(window.SharonCraftData && window.SharonCraftData.site);
    }

    return {
      enabled: false,
      deliveryFee: 0,
      packagingFee: 0,
      multiplier: 1
    };
  }

  function updatePricingFormulaNote() {
    if (!priceFormulaNote) {
      return;
    }

    const pricingMode = getProductPricingMode();
    const basePrice = Math.max(0, Number(priceInput && priceInput.value) || 0);
    const websitePrice = getPublishedPrice(basePrice, pricingMode);
    const settings = getPricingSettings();

    if (calculatedPriceInput) {
      calculatedPriceInput.value = formatCurrency(websitePrice);
    }

    if (pricingMode === "formula" && settings.enabled) {
      priceFormulaNote.textContent = `Website price = (${formatCurrency(basePrice)} + ${formatCurrency(settings.deliveryFee)} delivery + ${formatCurrency(settings.packagingFee)} packaging) x ${settings.multiplier} = ${formatCurrency(websitePrice)}.`;
      return;
    }

    priceFormulaNote.textContent = `Manual website price is ${formatCurrency(websitePrice)}. Turn auto pricing on to calculate from the base price.`;
  }

  function formatTimeAgo(value) {
    const timestamp = Date.parse(value || "");
    if (!Number.isFinite(timestamp)) {
      return "Recently";
    }
    const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
    if (diffMinutes < 1) {
      return "Just now";
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  }

  function setStatus(target, message, tone) {
    if (!target) {
      return;
    }
    target.textContent = message;
    target.dataset.tone = tone || "info";
  }

  function activateTab(name) {
    tabButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.assistantTab === name);
    });
    panels.forEach(function (panel) {
      panel.classList.toggle("is-active", panel.dataset.assistantPanel === name);
    });
  }

  function getCategorySlug(product) {
    return normalizeText(product && product.notes).split("|")[0] || (categories[0] && categories[0].slug) || "necklaces";
  }

  function getCategoryName(slug) {
    const match = categories.find(function (category) {
      return category.slug === slug;
    });
    return match ? match.name : "Handmade";
  }

  function getRecommendedTemplateKey(categorySlug) {
    const normalized = normalizeText(categorySlug).toLowerCase();
    if (normalized === "home-decor") {
      return "decor";
    }
    if (normalized === "gift-sets" || normalized === "bridal-occasion") {
      return "gift";
    }
    return "everyday";
  }

  function buildDescriptionTemplate(templateKey) {
    const categorySlug = normalizeText(categoryInput && categoryInput.value);
    const categoryName = getCategoryName(categorySlug).toLowerCase();
    const productName = normalizeText(nameInput && nameInput.value);
    const subject = productName || `This ${categoryName} piece`;

    if (templateKey === "gift") {
      return `${subject} makes a thoughtful gift for birthdays, thank-you moments, weddings, and simple surprises. SharonCraft made it by hand so it feels warm, personal, and easy to remember.`;
    }

    if (templateKey === "decor") {
      return `${subject} adds color and handmade character without making the space feel busy. It works well when you want a home piece that feels warm, memorable, and easy to place.`;
    }

    if (templateKey === "custom") {
      return `${subject} is handmade by SharonCraft and you can still ask about colors, gifting, delivery, or the right match before you order. It is a simple choice when you want something personal with clear help along the way.`;
    }

    return `${subject} is handmade by SharonCraft with a comfortable feel and a clean finish. It is easy to wear, gift, or keep for days when you want something personal and full of color.`;
  }

  function updateTemplateRecommendation() {
    const recommendedKey = getRecommendedTemplateKey(categoryInput && categoryInput.value);
    templateButtons.forEach(function (button) {
      button.classList.toggle("is-recommended", button.dataset.assistantDescriptionTemplate === recommendedKey);
    });

    if (templateHint) {
      const categoryName = getCategoryName(categoryInput && categoryInput.value);
      const labels = {
        everyday: "Everyday",
        gift: "Gift-ready",
        decor: "Home styling",
        custom: "Custom help"
      };
      templateHint.textContent = `Recommended now: ${labels[recommendedKey] || "Everyday"} for ${categoryName}. Pick a starter, then edit it to match the photo.`;
    }
  }

  function populateCategorySelect() {
    if (!categoryInput) {
      return;
    }
    categoryInput.innerHTML = categories
      .map(function (category) {
        return `<option value="${escapeHtml(category.slug)}">${escapeHtml(category.name)}</option>`;
      })
      .join("");
  }

  function updatePreview() {
    const source = normalizeText(imageInput && imageInput.value);
    if (!imagePreviewWrap || !imagePreview) {
      return;
    }
    if (!source) {
      imagePreviewWrap.hidden = true;
      return;
    }
    imagePreviewWrap.hidden = false;
    imagePreview.src = source;
    if (imageStageStatus) {
      if (!source) {
        imageStageStatus.textContent = `Fresh local project photos usually begin in ${imageWorkflowFolders.ready}.`;
      } else if (source.startsWith("data:") || source.startsWith("blob:")) {
        imageStageStatus.textContent = "This upload is still a browser draft preview until you save a real project path or live URL.";
      } else if (isManagedWorkflowImage(source)) {
        imageStageStatus.textContent = `This product is marked ${getImageStageLabel(getSelectedImageStage()).toLowerCase()} and the current path is using ${getImageStageFolder(getSelectedImageStage())}.`;
      } else {
        imageStageStatus.textContent = `This image is outside the local stage folders. The product will still work, but the clearest local workflow is ${imageWorkflowFolders.ready} first, then ${imageWorkflowFolders.live}.`;
      }
    }
  }

  function resetForm() {
    if (!form) {
      return;
    }
    form.reset();
    productIdInput.value = "";
    if (categories[0]) {
      categoryInput.value = categories[0].slug;
    }
    if (imageStageInput) {
      imageStageInput.value = "ready";
    }
    if (autoPriceInput) {
      autoPriceInput.checked = true;
    }
    formKicker.textContent = "New Product";
    formTitle.textContent = "Add a product simply";
    saveProductButton.textContent = "Save To Live Catalog";
    updateTemplateRecommendation();
    updatePreview();
    updatePricingFormulaNote();
  }

  function fillForm(product) {
    if (!product) {
      return;
    }
    productIdInput.value = normalizeText(product.id);
    nameInput.value = normalizeText(product.name);
    categoryInput.value = getCategorySlug(product);
    priceInput.value = getEditablePrice(product);
    if (autoPriceInput) {
      autoPriceInput.checked = getProductPricingMode(product) === "formula";
    }
    imageInput.value = normalizeText(product.image);
    if (imageStageInput) {
      imageStageInput.value = normalizeImageStage(product.imageStage || getImageStageFromNotes(product.notes) || inferImageStageFromPath(product.image)) || "live";
    }
    galleryInput.value = Array.isArray(product.gallery) ? product.gallery.join(", ") : "";
    descriptionInput.value = normalizeText(product.story);
    detailsInput.value = Array.isArray(product.specs) ? product.specs.join(", ") : "";
    badgeInput.value = normalizeText(product.spotlightText);
    featuredInput.checked = Boolean(normalizeText(product.spotlightUntil));
    newInput.checked = Boolean(normalizeText(product.newUntil));
    soldOutInput.checked = Boolean(product.soldOut);
    formKicker.textContent = "Editing Product";
    formTitle.textContent = normalizeText(product.name) || "Edit product";
    saveProductButton.textContent = "Update Live Product";
    updateTemplateRecommendation();
    updatePreview();
    updatePricingFormulaNote();
    activateTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildProductPayload(existingProduct) {
    const productId = normalizeText(productIdInput.value) || slugify(nameInput.value);
    const categorySlug = normalizeText(categoryInput.value) || (categories[0] && categories[0].slug) || "necklaces";
    const now = Date.now();
    const imageStage = getSelectedImageStage();
    const image = rewriteImagePathForStage(normalizeText(imageInput.value), imageStage);
    const gallery = rewriteImagesForStage(parseList(galleryInput.value), imageStage);
    const pricingMode = getProductPricingMode();
    const basePrice = Math.max(0, Number(priceInput.value) || 0);
    return {
      id: productId,
      image,
      name: normalizeText(nameInput.value),
      price: getPublishedPrice(basePrice, pricingMode),
      basePrice: pricingMode === "formula" ? basePrice : null,
      pricingMode,
      material: getCategoryName(categorySlug),
      story: normalizeText(descriptionInput.value),
      specs: parseList(detailsInput.value),
      gallery,
      soldOut: soldOutInput.checked,
      spotlightUntil: featuredInput.checked ? new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString() : "",
      spotlightText: normalizeText(badgeInput.value) || (featuredInput.checked ? "Featured" : ""),
      imageStage,
      notes: buildProductNotes(categorySlug, imageStage),
      updatedAt: new Date().toISOString(),
      newUntil: newInput.checked ? new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString() : "",
      sortOrder: existingProduct && Number.isFinite(Number(existingProduct.sortOrder)) ? Number(existingProduct.sortOrder) : 0
    };
  }

  function renderMiniMetrics() {
    if (!miniMetrics) {
      return;
    }
    const activeOrders = orders.filter(function (order) {
      return ["new", "confirmed", "paid"].includes(normalizeText(order.status));
    }).length;
    const readyPhotos = products.filter(function (product) {
      return normalizeImageStage(product.imageStage || getImageStageFromNotes(product.notes) || inferImageStageFromPath(product.image)) === "ready";
    }).length;
    miniMetrics.innerHTML = [
      { label: "Products", value: products.length },
      { label: "Orders", value: orders.length },
      { label: "Active Orders", value: activeOrders },
      { label: "Ready Photos", value: readyPhotos }
    ].map(function (item) {
      return `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(String(item.value))}</strong></article>`;
    }).join("");
  }

  function renderProducts() {
    if (!productList) {
      return;
    }
    const query = normalizeText(productSearchInput && productSearchInput.value).toLowerCase();
    const filtered = products.filter(function (product) {
      const categoryName = getCategoryName(getCategorySlug(product)).toLowerCase();
      return !query ||
        normalizeText(product.name).toLowerCase().includes(query) ||
        categoryName.includes(query);
    });
    if (!filtered.length) {
      productList.innerHTML = '<div class="assistant-empty">No matching products yet.</div>';
      return;
    }
    productList.innerHTML = filtered.map(function (product) {
      const categoryName = getCategoryName(getCategorySlug(product));
      const imageStage = normalizeImageStage(product.imageStage || getImageStageFromNotes(product.notes) || inferImageStageFromPath(product.image)) || "live";
      const unavailableLabel = product && product.soldOut ? ' <span class="assistant-unavailable-tag">Unavailable</span>' : "";
      return `
        <article class="assistant-list-item assistant-product-row">
          <img class="assistant-product-media" src="${escapeHtml(normalizeText(product.image) || "assets/images/custom-occasion-beadwork-46mokm-opt.webp")}" alt="${escapeHtml(normalizeText(product.name) || "Product image")}" loading="lazy" decoding="async" />
          <div class="assistant-product-copy">
            <strong>${escapeHtml(normalizeText(product.name) || "Untitled product")}${unavailableLabel}</strong>
            <div class="assistant-product-meta">${escapeHtml(categoryName)} - ${escapeHtml(formatCurrency(product.price))}</div>
            <div class="assistant-product-meta">${escapeHtml(getImageStageLabel(imageStage))}</div>
            <div class="assistant-product-meta">${escapeHtml(normalizeText(product.story) || "No description yet.")}</div>
          </div>
          <div class="assistant-list-actions">
            <button class="button button-secondary" type="button" data-product-edit="${escapeHtml(normalizeText(product.id))}">Edit</button>
            <button class="button button-secondary" type="button" data-product-delete="${escapeHtml(normalizeText(product.id))}">Delete</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderOrders() {
    if (!orderSummary || !orderList) {
      return;
    }
    const query = normalizeText(orderSearchInput && orderSearchInput.value).toLowerCase();
    const statusFilter = normalizeText(orderFilterInput && orderFilterInput.value).toLowerCase() || "all";
    const filtered = orders.filter(function (order) {
      const status = normalizeText(order.status).toLowerCase();
      const haystack = [
        normalizeText(order.customer),
        normalizeText(order.phone),
        normalizeText(order.productName),
        normalizeText(order.areaName)
      ].join(" ").toLowerCase();
      return (statusFilter === "all" || status === statusFilter) && (!query || haystack.includes(query));
    });

    const summaryItems = [
      { label: "All", value: orders.length },
      { label: "New", value: orders.filter(function (order) { return normalizeText(order.status) === "new"; }).length },
      { label: "Paid", value: orders.filter(function (order) { return normalizeText(order.status) === "paid"; }).length },
      { label: "Delivered", value: orders.filter(function (order) { return normalizeText(order.status) === "delivered"; }).length }
    ];
    orderSummary.innerHTML = summaryItems.map(function (item) {
      return `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(String(item.value))}</strong></article>`;
    }).join("");

    if (!filtered.length) {
      orderList.innerHTML = '<div class="assistant-empty">No orders match this search yet.</div>';
      return;
    }
    orderList.innerHTML = filtered.map(function (order) {
      return `
        <article class="assistant-list-item assistant-order-row">
          <div class="assistant-order-copy">
            <strong>${escapeHtml(normalizeText(order.customer) || "Unknown customer")}</strong>
            <div class="assistant-order-meta">${escapeHtml(normalizeText(order.productName) || "Product")} · Qty ${escapeHtml(String(Math.max(1, Number(order.quantity) || 1)))}</div>
            <div class="assistant-order-meta">${escapeHtml(normalizeText(order.phone) || "No phone")} · ${escapeHtml(normalizeText(order.areaName) || "Area not set")}</div>
            <div class="assistant-order-meta">${escapeHtml(formatCurrency(order.orderTotal))} · ${escapeHtml(formatTimeAgo(order.createdAt))}</div>
            ${normalizeText(order.note) ? `<div class="assistant-order-meta">Note: ${escapeHtml(normalizeText(order.note))}</div>` : ""}
          </div>
          <div class="assistant-list-actions">
            <span class="assistant-order-status" data-status="${escapeHtml(normalizeText(order.status) || "new")}">${escapeHtml(normalizeText(order.status) || "new")}</span>
          </div>
        </article>
      `;
    }).join("");
  }

  function getFilteredAnalyticsEvents() {
    const limits = { "7d": 7, "30d": 30, "90d": 90 };
    const cutoff = Date.now() - (limits[currentRange] || 7) * 24 * 60 * 60 * 1000;
    return analyticsEvents.filter(function (event) {
      const timestamp = Date.parse(event && event.timestamp);
      return Number.isFinite(timestamp) && timestamp >= cutoff;
    });
  }

  function getProductFromEvent(event) {
    const payload = event && event.payload ? event.payload : {};
    return {
      id: normalizeText(payload.product_id),
      name: normalizeText(payload.product_name)
    };
  }

  function getPageLabel(event) {
    const payload = event && event.payload ? event.payload : {};
    return normalizeText(payload.page_title) || normalizeText(payload.page_path) || "Storefront page";
  }

  function renderAnalytics() {
    if (!analyticsSummary || !analyticsProducts || !analyticsPages || !analyticsFeed) {
      return;
    }

    const filtered = getFilteredAnalyticsEvents();
    const productMap = new Map();
    const pageMap = new Map();

    filtered.forEach(function (event) {
      const product = getProductFromEvent(event);
      const page = getPageLabel(event);
      if (product.name) {
        productMap.set(product.name, (productMap.get(product.name) || 0) + 1);
      }
      if (page) {
        pageMap.set(page, (pageMap.get(page) || 0) + 1);
      }
    });

    const views = filtered.filter(function (event) { return normalizeText(event.name) === "page_view"; }).length;
    const carts = filtered.filter(function (event) { return normalizeText(event.name) === "add_to_cart"; }).length;
    const chats = filtered.filter(function (event) { return normalizeText(event.name).includes("whatsapp"); }).length;

    analyticsSummary.innerHTML = [
      { label: "Events", value: filtered.length },
      { label: "Page Views", value: views },
      { label: "Add To Cart", value: carts },
      { label: "WhatsApp Taps", value: chats }
    ].map(function (item) {
      return `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(String(item.value))}</strong></article>`;
    }).join("");

    const rankedProducts = Array.from(productMap.entries()).sort(function (left, right) {
      return right[1] - left[1];
    }).slice(0, 5);
    analyticsProducts.innerHTML = rankedProducts.length
      ? rankedProducts.map(function (item) {
          return `
            <article class="assistant-rank-item">
              <div>
                <span>Product</span>
                <strong>${escapeHtml(item[0])}</strong>
              </div>
              <strong>${escapeHtml(String(item[1]))}</strong>
            </article>
          `;
        }).join("")
      : '<div class="assistant-empty">No product activity in this range yet.</div>';

    const rankedPages = Array.from(pageMap.entries()).sort(function (left, right) {
      return right[1] - left[1];
    }).slice(0, 5);
    analyticsPages.innerHTML = rankedPages.length
      ? rankedPages.map(function (item) {
          return `
            <article class="assistant-rank-item">
              <div>
                <span>Page</span>
                <strong>${escapeHtml(item[0])}</strong>
              </div>
              <strong>${escapeHtml(String(item[1]))}</strong>
            </article>
          `;
        }).join("")
      : '<div class="assistant-empty">No page visits in this range yet.</div>';

    analyticsFeed.innerHTML = filtered.slice(0, 8).length
      ? filtered.slice(0, 8).map(function (event) {
          const product = getProductFromEvent(event);
          return `
            <article class="assistant-feed-item">
              <div class="assistant-feed-copy">
                <span>${escapeHtml(normalizeText(event.name).replace(/_/g, " ") || "activity")}</span>
                <strong>${escapeHtml(product.name || getPageLabel(event))}</strong>
              </div>
              <span>${escapeHtml(formatTimeAgo(event.timestamp))}</span>
            </article>
          `;
        }).join("")
      : '<div class="assistant-empty">No recent live events for this range yet.</div>';
  }

  async function loadProducts(options) {
    if (!catalogApi || typeof catalogApi.fetchProducts !== "function") {
      throw new Error("Supabase catalog is not ready.");
    }
    products = await catalogApi.fetchProducts();
    renderProducts();
    renderMiniMetrics();
    if (!options || options.showStatus !== false) {
      setStatus(appStatus, "Live products refreshed.", "success");
    }
  }

  async function loadOrders(options) {
    if (!catalogApi || typeof catalogApi.fetchOrders !== "function") {
      throw new Error("Orders API is not ready.");
    }
    orders = await catalogApi.fetchOrders();
    renderOrders();
    renderMiniMetrics();
    if (!options || options.showStatus !== false) {
      setStatus(appStatus, "Live orders refreshed.", "success");
    }
  }

  async function loadAnalytics(options) {
    if (!catalogApi || typeof catalogApi.fetchAnalyticsEvents !== "function") {
      throw new Error("Analytics API is not ready.");
    }
    analyticsEvents = await catalogApi.fetchAnalyticsEvents(200);
    renderAnalytics();
    renderMiniMetrics();
    if (!options || options.showStatus !== false) {
      setStatus(appStatus, "Live analytics refreshed.", "success");
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    const existingId = normalizeText(productIdInput.value);
    const existingProduct = products.find(function (product) {
      return normalizeText(product.id) === existingId;
    });
    const payload = buildProductPayload(existingProduct);

    if (!payload.name || !payload.image || !payload.story) {
      setStatus(appStatus, "Add the name, main image, and description before saving.", "error");
      return;
    }

    const nextProducts = existingProduct
      ? products.map(function (product) {
          return normalizeText(product.id) === existingId ? payload : product;
        })
      : [payload].concat(products);

    setStatus(appStatus, "Saving product to the live catalog...", "info");
    await catalogApi.saveProducts(nextProducts);
    products = nextProducts;
    renderProducts();
    renderMiniMetrics();
    resetForm();
    setStatus(appStatus, `${payload.name} is live in the catalog with photo stage set to ${getImageStageLabel(payload.imageStage)}.`, "success");
    activateTab("catalog");
  }

  async function deleteProduct(productId) {
    const normalizedId = normalizeText(productId);
    if (!normalizedId) {
      return;
    }

    const product = products.find(function (item) {
      return normalizeText(item.id) === normalizedId;
    });

    if (!product) {
      setStatus(appStatus, "That product could not be found anymore.", "error");
      return;
    }

    const confirmed = window.confirm(`Delete "${normalizeText(product.name) || "this product"}" from the live catalog?`);
    if (!confirmed) {
      return;
    }

    const nextProducts = products.filter(function (item) {
      return normalizeText(item.id) !== normalizedId;
    });

    setStatus(appStatus, `Deleting ${normalizeText(product.name) || "product"} from the live catalog...`, "info");
    await catalogApi.saveProducts(nextProducts);
    products = nextProducts;
    renderProducts();
    renderMiniMetrics();

    if (normalizeText(productIdInput.value) === normalizedId) {
      resetForm();
    }

    setStatus(appStatus, `${normalizeText(product.name) || "Product"} was removed from the live catalog.`, "success");
  }

  async function uploadImage(file) {
    if (!file) {
      return;
    }
    if (!catalogApi || typeof catalogApi.uploadProductImage !== "function") {
      setStatus(appStatus, "Image upload is not ready on this site.", "error");
      return;
    }

    setStatus(appStatus, `Uploading ${file.name}...`, "info");
    const uploaded = await catalogApi.uploadProductImage(file);
    const publicUrl = uploaded && uploaded.publicUrl ? uploaded.publicUrl : "";
    if (!publicUrl) {
      throw new Error("Image upload finished, but no public image URL was returned.");
    }

    imageInput.value = publicUrl;
    updatePreview();
    setStatus(
      appStatus,
      `${file.name} uploaded and ready to save with the product. If you also keep local project files, match its stage in ${getImageStageFolder(getSelectedImageStage())}.`,
      "success"
    );
  }

  async function enterApp(user) {
    currentUser = user;
    authView.hidden = true;
    appView.hidden = false;
    userCopy.textContent = normalizeText(user && user.email) || "Signed in as admin";
    liveChip.textContent = "Live Supabase";
    populateCategorySelect();
    resetForm();
    await loadProducts({ showStatus: false });
    await loadOrders({ showStatus: false });
    await loadAnalytics({ showStatus: false });
    setStatus(appStatus, "Assistant admin ready. Products, orders, and live analytics are synced.", "success");
  }

  async function checkExistingSession() {
    if (!catalogApi || typeof catalogApi.isConfigured !== "function" || !catalogApi.isConfigured()) {
      setStatus(authStatus, "Supabase is not configured on this site yet.", "error");
      return;
    }

    const user = await catalogApi.getCurrentUser();
    if (!user) {
      setStatus(authStatus, "Sign in with your admin account to open the assistant workspace.", "info");
      return;
    }

    const isAdmin = typeof catalogApi.isAdmin === "function" ? await catalogApi.isAdmin() : false;
    if (!isAdmin) {
      await catalogApi.signOut();
      setStatus(authStatus, "This account is not on the admin list.", "error");
      return;
    }

    await enterApp(user);
  }

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activateTab(button.dataset.assistantTab);
    });
  });

  rangeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentRange = button.dataset.assistantRange;
      rangeButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      renderAnalytics();
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      try {
        setStatus(authStatus, "Signing in...", "info");
        await userController.signIn(emailInput.value, passwordInput.value);
        const isAdmin = typeof catalogApi.isAdmin === "function" ? await catalogApi.isAdmin() : false;
        if (!isAdmin) {
          await catalogApi.signOut();
          setStatus(authStatus, "This account is not allowed into assistant admin.", "error");
          return;
        }
        const user = await catalogApi.getCurrentUser();
        await enterApp(user);
      } catch (error) {
        setStatus(authStatus, error && error.message ? error.message : "Sign-in failed.", "error");
      }
    });
  }

  if (signOutButton) {
    signOutButton.addEventListener("click", async function () {
      try {
        await userController.signOut();
      } catch (error) {
        // Ignore sign-out errors and still reset the UI.
      }
      currentUser = null;
      appView.hidden = true;
      authView.hidden = false;
      setStatus(authStatus, "Signed out. Sign in again to reopen assistant admin.", "info");
    });
  }

  if (form) {
    form.addEventListener("submit", async function (event) {
      try {
        await saveProduct(event);
      } catch (error) {
        setStatus(appStatus, error && error.message ? error.message : "Could not save the product live.", "error");
      }
    });
  }

  if (resetFormButton) {
    resetFormButton.addEventListener("click", function () {
      resetForm();
      setStatus(appStatus, "Ready for a fresh product.", "info");
    });
  }

  if (imageInput) {
    imageInput.addEventListener("input", updatePreview);
    imageInput.addEventListener("change", updatePreview);
  }

  if (categoryInput) {
    categoryInput.addEventListener("change", updateTemplateRecommendation);
    categoryInput.addEventListener("input", updateTemplateRecommendation);
  }

  [priceInput, autoPriceInput].forEach(function (input) {
    if (!input) {
      return;
    }

    input.addEventListener("input", updatePricingFormulaNote);
    input.addEventListener("change", updatePricingFormulaNote);
  });

  templateButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (!descriptionInput) {
        return;
      }
      descriptionInput.value = buildDescriptionTemplate(button.dataset.assistantDescriptionTemplate);
      descriptionInput.focus();
      descriptionInput.setSelectionRange(descriptionInput.value.length, descriptionInput.value.length);
      setStatus(appStatus, "Description starter added. Edit it to match the photo.", "info");
    });
  });

  if (imageStageInput) {
    imageStageInput.addEventListener("change", function () {
      const image = normalizeText(imageInput && imageInput.value);
      const gallery = parseList(galleryInput && galleryInput.value);
      const stage = getSelectedImageStage();
      const nextImage = rewriteImagePathForStage(image, stage);
      const nextGallery = rewriteImagesForStage(gallery, stage);
      if (nextImage !== image) {
        imageInput.value = nextImage;
      }
      if (galleryInput) {
        galleryInput.value = nextGallery.join(", ");
      }
      updatePreview();
      setStatus(appStatus, `Photo stage set to ${getImageStageLabel(stage)}.`, "info");
    });
  }

  if (imageFileInput) {
    imageFileInput.addEventListener("change", async function () {
      const file = imageFileInput.files && imageFileInput.files[0];
      if (!file) {
        return;
      }
      try {
        await uploadImage(file);
      } catch (error) {
        setStatus(appStatus, error && error.message ? error.message : "Image upload failed.", "error");
      } finally {
        imageFileInput.value = "";
      }
    });
  }

  if (refreshProductsButton) {
    refreshProductsButton.addEventListener("click", async function () {
      try {
        await loadProducts();
      } catch (error) {
        setStatus(appStatus, "Could not refresh products right now.", "error");
      }
    });
  }

  if (refreshOrdersButton) {
    refreshOrdersButton.addEventListener("click", async function () {
      try {
        await loadOrders();
      } catch (error) {
        setStatus(appStatus, "Could not refresh orders right now.", "error");
      }
    });
  }

  if (refreshAnalyticsButton) {
    refreshAnalyticsButton.addEventListener("click", async function () {
      try {
        await loadAnalytics();
      } catch (error) {
        setStatus(appStatus, "Could not refresh analytics right now.", "error");
      }
    });
  }

  if (productSearchInput) {
    productSearchInput.addEventListener("input", renderProducts);
  }

  if (orderSearchInput) {
    orderSearchInput.addEventListener("input", renderOrders);
  }

  if (orderFilterInput) {
    orderFilterInput.addEventListener("change", renderOrders);
  }

  if (productList) {
    productList.addEventListener("click", function (event) {
      const editButton = event.target.closest("[data-product-edit]");
      if (editButton) {
        const product = products.find(function (item) {
          return normalizeText(item.id) === normalizeText(editButton.dataset.productEdit);
        });
        if (product) {
          fillForm(product);
        }
        return;
      }

      const deleteButton = event.target.closest("[data-product-delete]");
      if (deleteButton) {
        deleteProduct(deleteButton.dataset.productDelete).catch(function (error) {
          setStatus(appStatus, error && error.message ? error.message : "Could not delete the product right now.", "error");
        });
      }
    });
  }

  if (catalogApi && typeof catalogApi.onAuthStateChange === "function") {
    catalogApi.onAuthStateChange(function (user) {
      if (!user && currentUser) {
        currentUser = null;
        appView.hidden = true;
        authView.hidden = false;
        setStatus(authStatus, "Signed out. Sign in again to reopen assistant admin.", "info");
      }
    });
  }

  await checkExistingSession();
});
