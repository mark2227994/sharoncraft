(function () {
  // Shared storefront helpers for layout, formatting, cart state, and reusable rendering.
  const data = window.SharonCraftData;
  const categoryMap = new Map((data.categories || []).map((category) => [category.slug, category]));
  const cartStorageKey = "sharoncraft-cart";
  const wishlistStorageKey = "sharoncraft-wishlist";
  const timerStorageKey = "sharoncraft-cart-timer";
  const analyticsStorageKey = "sharoncraft-analytics-events";
  let cartTimerInterval = null;
  let analyticsEventsBound = false;
  let gaLoadPromise = null;

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function absoluteUrl(path) {
    const normalized = normalizeText(path);
    return new URL(normalized || window.location.pathname, window.location.origin).href;
  }

  function getAnalyticsConfig() {
    const siteAnalytics = data && data.site && data.site.analytics ? data.site.analytics : {};
    return {
      ga4MeasurementId:
        normalizeText(siteAnalytics.ga4MeasurementId) ||
        normalizeText(window.SHARONCRAFT_GA4_ID) ||
        ""
    };
  }

  function getStoredAnalyticsEvents() {
    try {
      const raw = window.localStorage.getItem(analyticsStorageKey) || "[]";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveAnalyticsEvents(events) {
    try {
      window.localStorage.setItem(analyticsStorageKey, JSON.stringify(events.slice(-150)));
    } catch (error) {
      console.warn("Unable to save analytics events locally.", error);
    }
  }

  function loadGa4IfNeeded() {
    const config = getAnalyticsConfig();
    if (!config.ga4MeasurementId) {
      return Promise.resolve(false);
    }

    if (typeof window.gtag === "function") {
      return Promise.resolve(true);
    }

    if (gaLoadPromise) {
      return gaLoadPromise;
    }

    gaLoadPromise = new Promise((resolve) => {
      const existingScript = document.querySelector('script[data-ga4-loader="true"]');
      if (existingScript) {
        resolve(true);
        return;
      }

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", config.ga4MeasurementId, { send_page_view: false });

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4MeasurementId)}`;
      script.setAttribute("data-ga4-loader", "true");
      script.addEventListener("load", function () {
        resolve(true);
      });
      script.addEventListener("error", function () {
        resolve(false);
      });
      document.head.appendChild(script);
    });

    return gaLoadPromise;
  }

  function trackEvent(name, payload) {
    const eventName = normalizeText(name);
    if (!eventName) {
      return;
    }

    const eventPayload = {
      page_type: document.body.dataset.page || "unknown",
      page_path: `${window.location.pathname}${window.location.search}`,
      ...payload
    };

    const storedEvents = getStoredAnalyticsEvents();
    storedEvents.push({
      name: eventName,
      payload: eventPayload,
      timestamp: new Date().toISOString()
    });
    saveAnalyticsEvents(storedEvents);

    loadGa4IfNeeded().then(function (loaded) {
      if (loaded && typeof window.gtag === "function") {
        window.gtag("event", eventName, eventPayload);
      }
    });
  }

  function bindAnalyticsEvents() {
    if (analyticsEventsBound) {
      return;
    }

    analyticsEventsBound = true;

    document.addEventListener("click", function (event) {
      const link = event.target.closest("a[href]");
      if (!link) {
        return;
      }

      const href = normalizeText(link.href);
      if (!href || !/wa\.me\//i.test(href)) {
        return;
      }

      trackEvent("whatsapp_click", {
        button_label: normalizeText(link.dataset.analyticsLabel || link.textContent || "WhatsApp"),
        destination: href,
        product_id: normalizeText(link.dataset.productId),
        product_name: normalizeText(link.dataset.productName)
      });
    });
  }

  function setHeadValue(selector, builder, value) {
    if (!document || !document.head) {
      return;
    }

    let node = document.head.querySelector(selector);
    if (!node) {
      node = builder();
      document.head.appendChild(node);
    }

    node.setAttribute("content", value);
  }

  function setPageMetadata(options) {
    const settings = options || {};
    const title = normalizeText(settings.title) || document.title || data.site.name;
    const description = normalizeText(settings.description) || data.site.tagline;
    const path = normalizeText(settings.path) || window.location.pathname;
    const image = normalizeText(settings.image) || "assets/images/IMG-20260226-WA0005.jpg";
    const type = normalizeText(settings.type) || "website";
    const canonicalUrl = absoluteUrl(path);
    const imageUrl = absoluteUrl(image);

    document.title = title;

    setHeadValue('meta[name="description"]', function () {
      const meta = document.createElement("meta");
      meta.name = "description";
      return meta;
    }, description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    setHeadValue('meta[property="og:title"]', function () {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:title");
      return meta;
    }, title);
    setHeadValue('meta[property="og:description"]', function () {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:description");
      return meta;
    }, description);
    setHeadValue('meta[property="og:type"]', function () {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:type");
      return meta;
    }, type);
    setHeadValue('meta[property="og:url"]', function () {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:url");
      return meta;
    }, canonicalUrl);
    setHeadValue('meta[property="og:image"]', function () {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:image");
      return meta;
    }, imageUrl);
    setHeadValue('meta[name="twitter:card"]', function () {
      const meta = document.createElement("meta");
      meta.name = "twitter:card";
      return meta;
    }, "summary_large_image");
    setHeadValue('meta[name="twitter:title"]', function () {
      const meta = document.createElement("meta");
      meta.name = "twitter:title";
      return meta;
    }, title);
    setHeadValue('meta[name="twitter:description"]', function () {
      const meta = document.createElement("meta");
      meta.name = "twitter:description";
      return meta;
    }, description);
    setHeadValue('meta[name="twitter:image"]', function () {
      const meta = document.createElement("meta");
      meta.name = "twitter:image";
      return meta;
    }, imageUrl);
  }

  function setStructuredData(schemaId, payload) {
    if (!document || !document.head || !schemaId) {
      return;
    }

    let node = document.head.querySelector(`script[data-schema-id="${schemaId}"]`);
    if (!payload) {
      if (node) {
        node.remove();
      }
      return;
    }

    if (!node) {
      node = document.createElement("script");
      node.type = "application/ld+json";
      node.setAttribute("data-schema-id", schemaId);
      document.head.appendChild(node);
    }

    node.textContent = JSON.stringify(payload);
  }

  function getProductImages(product) {
    const imageList = []
      .concat(Array.isArray(product && product.images) ? product.images : [])
      .concat(normalizeText(product && product.image))
      .concat(Array.isArray(product && product.gallery) ? product.gallery : [])
      .map(normalizeText)
      .filter(Boolean);

    const uniqueImages = imageList.filter((image, index) => imageList.indexOf(image) === index);
    return uniqueImages.length ? uniqueImages : ["assets/images/IMG-20260226-WA0005.jpg"];
  }

  function formatCurrency(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return "KES 0";
    }

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function buildWhatsAppUrl(message) {
    return `https://wa.me/${data.site.whatsapp}?text=${encodeURIComponent(message)}`;
  }

  function waitForData() {
    return Promise.resolve(data);
  }

  function getProductById(id) {
    return (data.products || []).find((product) => product.id === id);
  }

  function findProductById(id) {
    return (data.products || []).find((product) => product.id === id);
  }

  function getCategoryBySlug(slug) {
    return categoryMap.get(slug);
  }

  function getProductsByCategory(slug) {
    return (data.products || []).filter((product) => product.category === slug);
  }

  function getRelatedProducts(product, limit = 4) {
    return (data.products || [])
      .filter((item) => item.id !== product.id)
      .sort((left, right) => {
        const leftScore = left.category === product.category ? 0 : 1;
        const rightScore = right.category === product.category ? 0 : 1;
        return leftScore - rightScore;
      })
      .slice(0, limit);
  }

  function buildBadgeClass(badge) {
    if (!badge) {
      return "";
    }

    if (badge.toLowerCase().includes("best")) {
      return "badge badge-coral";
    }

    if (badge.toLowerCase().includes("new")) {
      return "badge badge-teal";
    }

    return "badge badge-ochre";
  }

  function cartIconMarkup() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 4h2l2.3 9.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
        <circle cx="10" cy="19" r="1.5" fill="currentColor"></circle>
        <circle cx="17" cy="19" r="1.5" fill="currentColor"></circle>
      </svg>
    `;
  }

  function heartIconMarkup() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 20.3 4.8 13.4A4.7 4.7 0 0 1 11.7 7l.3.4.3-.4a4.7 4.7 0 0 1 6.9 6.4L12 20.3Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
      </svg>
    `;
  }

  function navIconMarkup(name) {
    const icons = {
      home: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.8v-6.2H9.8V21H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
        </svg>
      `,
      shop: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 8h12l-1 12H7L6 8Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"></path>
          <path d="M9 9V7a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path>
        </svg>
      `,
      categories: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
        </svg>
      `,
      about: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
          <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path>
        </svg>
      `,
      contact: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5z" fill="none" stroke="currentColor" stroke-width="1.8"></path>
          <path d="m5 8 7 5 7-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
        </svg>
      `
    };

    return icons[name] || "";
  }

  function whatsappIconMarkup() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 4.2a7.8 7.8 0 0 0-6.7 11.8L4 20l4.2-1.2A7.8 7.8 0 1 0 12 4.2Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
        <path d="M9.2 9.1c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4l.6 1.5c.1.2.1.4 0 .6l-.4.6c-.1.1-.1.3 0 .4.4.8 1 1.4 1.8 1.8.1.1.3.1.4 0l.6-.4c.2-.1.4-.1.6 0l1.5.6c.4.1.4.3.4.5v.5c0 .2 0 .4-.4.6-.5.2-1 .4-1.5.3-1.1-.1-2.1-.6-3.1-1.6s-1.5-2-1.6-3.1c-.1-.5.1-1 .3-1.5Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"></path>
      </svg>
    `;
  }

  function getWishlist() {
    try {
      const stored = window.localStorage.getItem(wishlistStorageKey) || "[]";
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(normalizeText).filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function saveWishlist(wishlist) {
    window.localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist));
  }

  function isWishlisted(productId) {
    return getWishlist().includes(productId);
  }

  function syncWishlistButtons(productId) {
    const active = isWishlisted(productId);
    document.querySelectorAll(`[data-toggle-wishlist="${productId}"]`).forEach((button) => {
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", active ? "Remove from wishlist" : "Save to wishlist");
    });
  }

  function toggleWishlist(productId) {
    const wishlist = getWishlist();
    const nextWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : wishlist.concat(productId);
    const added = nextWishlist.length > wishlist.length;

    saveWishlist(nextWishlist);
    syncWishlistButtons(productId);

    const product = getProductById(productId);
    const productName = product && product.name ? product.name : "Item";
    const message = added ? `${productName} saved to wishlist.` : `${productName} removed from wishlist.`;

    if (typeof window.showToast === "function") {
      window.showToast(message, added ? "success" : "info");
    }
  }

  function buildProductOrderUrl(product) {
    const productName = product && product.name ? product.name : "this SharonCraft piece";
    const productPrice = product && Number.isFinite(Number(product.price)) ? formatCurrency(product.price) : "the listed price";
    return buildWhatsAppUrl(
      `Hello SharonCraft, I would like to order ${productName} for ${productPrice}.`
    );
  }

  function createProductCard(product) {
    const productName = product.name || "Artisan Creation";
    const image = getProductImages(product)[0];
    const description = product.shortDescription || product.description || "Handmade by SharonCraft artisans.";
    const wishlisted = isWishlisted(product.id);
    const category = getCategoryBySlug(product.category);
    const badgeMarkup = product.badge
      ? `<span class="${buildBadgeClass(product.badge)}">${product.badge}</span>`
      : "";

    return `
      <article class="product-card reveal">
        <a class="product-card-media" href="product.html?id=${product.id}">
          <img src="${image}" alt="${productName}" loading="lazy" />
          ${badgeMarkup}
        </a>
        <div class="product-card-body">
          <div class="product-card-head">
            <div>
              <p class="product-card-category">${category ? category.name : "Collection"}</p>
              <h3 class="product-name"><a href="product.html?id=${product.id}">${productName}</a></h3>
            </div>
            <div class="product-card-icon-row">
              <button class="icon-action-button wishlist-icon-button ${wishlisted ? "is-active" : ""}" type="button" data-toggle-wishlist="${product.id}" aria-label="${wishlisted ? "Remove from wishlist" : "Save to wishlist"}" aria-pressed="${wishlisted ? "true" : "false"}">
                ${heartIconMarkup()}
              </button>
              <button class="icon-action-button cart-icon-button" type="button" data-add-to-cart="${product.id}" aria-label="Add ${productName} to cart">
                ${cartIconMarkup()}
              </button>
            </div>
          </div>
          <p class="product-card-text product-story">${description}</p>
          <div class="product-card-price-row">
            <strong class="product-price">${formatCurrency(product.price)}</strong>
            <span class="product-card-stock">${getScarcityNote(product)}</span>
          </div>
          <div class="product-card-actions">
            <a class="button button-primary product-card-order" href="${buildProductOrderUrl(product)}" target="_blank" rel="noreferrer" data-analytics-label="Product Card WhatsApp" data-product-id="${product.id}" data-product-name="${productName}">
              Order on WhatsApp
            </a>
            <a class="button button-secondary product-card-view" href="product.html?id=${product.id}">
              View Details
            </a>
          </div>
        </div>
      </article>
    `;
  }

  function createCategoryCard(category) {
    const suggestion = normalizeText(category.tip) || "Explore";

    return `
      <article class="category-card reveal accent-${category.accent}">
        <a href="shop.html?category=${category.slug}" class="category-card-link">
          <div class="category-card-orbit" aria-hidden="true">
            <span class="category-card-ring"></span>
            <span class="category-card-ring category-card-ring-secondary"></span>
            <div class="category-card-media">
              <img src="${category.image}" alt="${category.name}" loading="lazy" />
            </div>
          </div>
          <div class="category-card-body">
            <h3>${category.name}</h3>
            <p class="category-card-tip">${suggestion}</p>
            <span class="category-card-cta">Open <span aria-hidden="true">&rarr;</span></span>
          </div>
        </a>
      </article>
    `;
  }

  function getCart() {
    try {
      const stored = window.localStorage.getItem(cartStorageKey) || "[]";
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item.productId && item.quantity > 0)
        .map((item) => ({ ...item, quantity: Number(item.quantity) || 0 }))
        .filter((item) => item.quantity > 0);
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    renderCartUi();
  }

  function getScarcityCount(product) {
    const seed = product.id.split("").reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
    return (seed % 5) + 3;
  }

  function getScarcityNote(product) {
    const count = getScarcityCount(product);
    return `Only ${count} left in this week's batch.`;
  }

  function ensureCartTimer() {
    const existing = Number(window.localStorage.getItem(timerStorageKey) || 0);
    if (existing > Date.now()) {
      return existing;
    }

    const nextExpiry = Date.now() + 5 * 60 * 1000;
    window.localStorage.setItem(timerStorageKey, String(nextExpiry));
    return nextExpiry;
  }

  function getTimeRemaining() {
    const expiry = Number(window.localStorage.getItem(timerStorageKey) || 0);
    if (!expiry) {
      return 0;
    }
    return Math.max(0, expiry - Date.now());
  }

  function formatTimeRemaining(milliseconds) {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function startCartTimer() {
    if (cartTimerInterval) {
      window.clearInterval(cartTimerInterval);
    }

    renderCartTimer();
    cartTimerInterval = window.setInterval(renderCartTimer, 1000);
  }

  function renderCartTimer() {
    let remaining = getTimeRemaining();
    const timerNodes = document.querySelectorAll("[data-cart-timer]");
    const urgencyNodes = document.querySelectorAll("[data-cart-urgency]");
    const alwaysOn = Array.from(urgencyNodes).some((node) => node.dataset.cartUrgency === "always");
    const hasCartItems = getCart().length > 0;

    if (!hasCartItems && !alwaysOn) {
      timerNodes.forEach((node) => {
        node.textContent = "05:00";
      });
      urgencyNodes.forEach((node) => node.classList.remove("is-visible"));
      return;
    }

    if (!remaining) {
      ensureCartTimer();
      remaining = getTimeRemaining();
    }

    timerNodes.forEach((node) => {
      node.textContent = formatTimeRemaining(remaining);
    });

    urgencyNodes.forEach((node) => {
      const shouldShow = node.dataset.cartUrgency === "always" || hasCartItems;
      node.classList.toggle("is-visible", shouldShow);
    });
  }

  function getCartSummary() {
    return getCart()
      .map((item) => {
        const product = findProductById(item.productId);
        const price = Number(item.productPrice || (product && product.price) || 0);
        const name = item.productName || (product && product.name) || "SharonCraft item";

        return {
          ...item,
          product,
          productName: name,
          productPrice: price,
          lineTotal: price * item.quantity,
        };
      })
      .filter((item) => item.product || item.productName);
  }

  function buildCartMessage() {
    const items = getCartSummary();
    if (!items.length) {
      return buildWhatsAppUrl("Hello SharonCraft, I would like help choosing a product.");
    }

    const lines = items.map(
      (item, index) => `${index + 1}. ${item.productName} x${item.quantity} - ${formatCurrency(item.lineTotal)}`
    );
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    return buildWhatsAppUrl(
      `Hello SharonCraft, I would like to order these items:\n${lines.join("\n")}\nTotal: ${formatCurrency(total)}`
    );
  }

  function openCart() {
    document.body.classList.add("cart-open");
    const drawer = document.getElementById("cart-drawer");
    if (drawer) {
      drawer.setAttribute("aria-hidden", "false");
    }
  }

  function closeCart() {
    document.body.classList.remove("cart-open");
    const drawer = document.getElementById("cart-drawer");
    if (drawer) {
      drawer.setAttribute("aria-hidden", "true");
    }
  }

  function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) {
      console.error("addToCart: product not found", productId);
      return;
    }

    const cart = getCart();
    const existingItem = cart.find((item) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId,
        productName: product.name || "Unnamed Product",
        productPrice: Number(product.price) || 0,
        quantity: 1,
      });
    }

    saveCart(cart);
    trackEvent("add_to_cart", {
      product_id: product.id,
      product_name: product.name || "Unnamed Product",
      value: Number(product.price) || 0,
      currency: "KES"
    });

    const message = `${product.name || "Item"} added to your cart.`;
    if (typeof window.showToast === "function") {
      window.showToast(message, "success");
      return;
    }

    window.alert(message);
  }

  function updateCartQuantity(productId, nextQuantity) {
    let cart = getCart();

    if (nextQuantity <= 0) {
      cart = cart.filter((item) => item.productId !== productId);
    } else {
      cart = cart.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item));
    }

    saveCart(cart);
  }

  function renderCartUi() {
    const cart = getCart();
    const cartItemsNode = document.getElementById("cart-items");
    const cartTotalNode = document.getElementById("cart-total-price");
    const cartEmptyNode = document.getElementById("cart-empty");
    const cartCountNodes = document.querySelectorAll("[data-cart-count]");

    const cartSummary = cart
      .map((item) => {
        const product = data.products.find((p) => p.id === item.productId) || {};
        const displayPrice = Number(item.productPrice) || Number(product.price) || 0;
        return {
          ...item,
          product,
          lineTotal: displayPrice * item.quantity,
          displayName: item.productName || product.name || "Artisan item",
          displayPrice,
        };
      });

    if (cartItemsNode) {
      cartItemsNode.innerHTML = cartSummary
        .map(
          (item) => `
            <article class="cart-item">
              <strong>${item.displayName}</strong>
              <span>${formatCurrency(item.displayPrice)} each</span>
              <div class="cart-quantity-controls">
                <button type="button" data-cart-decrease="${item.productId}" aria-label="Reduce quantity">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-cart-increase="${item.productId}" aria-label="Increase quantity">+</button>
              </div>
              <strong>${formatCurrency(item.lineTotal)}</strong>
            </article>
          `
        )
        .join("");
    }

    const totalPrice = cartSummary.reduce((sum, item) => sum + item.lineTotal, 0);

    if (cartTotalNode) {
      cartTotalNode.textContent = formatCurrency(totalPrice);
    }

    if (cartEmptyNode) {
      cartEmptyNode.classList.toggle("is-hidden", cart.length > 0);
    }

    cartCountNodes.forEach((node) => {
      node.textContent = String(cart.reduce((sum, item) => sum + item.quantity, 0));
    });

    const checkoutNode = document.getElementById("cart-checkout");
    if (checkoutNode) {
      checkoutNode.href = buildCartMessage();
    }
  }

  function renderHeader() {
    const target = document.querySelector("[data-site-header]");

    if (!target) {
      return;
    }

    const currentPage = document.body.dataset.page || "";
    const isShopFamilyPage = currentPage === "shop" || currentPage === "product";

    target.innerHTML = `
      <div class="promo-bar">
        <div class="container promo-bar-inner">
          <p>${data.site.promo}</p>
          <a href="${buildWhatsAppUrl("Hello SharonCraft, I would like to claim the current delivery offer.")}" target="_blank" rel="noreferrer" data-analytics-label="Promo WhatsApp">
            Claim on WhatsApp
          </a>
        </div>
      </div>
      <header class="site-header">
        <div class="container header-shell">
          <a class="brand-mark" href="index.html" aria-label="SharonCraft home">
            <img class="brand-logo" src="assets/images/sharoncraft-logo-transparent.png" alt="SharonCraft logo" />
            <span class="brand-copy">
              <strong>${data.site.name}</strong>
              <small>Handmade joy from Kenya</small>
            </span>
          </a>
          <nav id="site-nav" class="site-nav" aria-label="Main navigation">
            <a href="index.html" class="${currentPage === "home" ? "is-active" : ""}">${navIconMarkup("home")}<span>Home</span></a>
            <a href="shop.html" class="${isShopFamilyPage ? "is-active" : ""}">${navIconMarkup("shop")}<span>Shop</span></a>
            <a href="categories.html" class="${currentPage === "categories" ? "is-active" : ""}">${navIconMarkup("categories")}<span>Categories</span></a>
            <a href="about.html" class="${currentPage === "about" ? "is-active" : ""}">${navIconMarkup("about")}<span>About</span></a>
            <a href="contact.html" class="${currentPage === "contact" ? "is-active" : ""}">${navIconMarkup("contact")}<span>Contact</span></a>
            <a class="button button-primary nav-cta" href="${buildWhatsAppUrl("Hello SharonCraft, I would like help choosing a product.")}" target="_blank" rel="noreferrer" data-analytics-label="Header WhatsApp">
              <span class="nav-cta-icon">
                ${whatsappIconMarkup()}
              </span>
              <span class="nav-cta-copy">
                <strong>Order on WhatsApp</strong>
              </span>
            </a>
          </nav>
          <div class="header-actions">
            <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
              Menu
            </button>
            <button class="cart-header-button" type="button" id="cart-open-button" aria-label="Open cart">
              ${cartIconMarkup()}
              <span>Cart</span>
              <strong data-cart-count>0</strong>
            </button>
          </div>
        </div>
      </header>
    `;

    const toggleButton = target.querySelector(".nav-toggle");
    const nav = target.querySelector(".site-nav");
    const cartOpenButton = target.querySelector("#cart-open-button");

    if (toggleButton && nav) {
      toggleButton.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("is-open");
        toggleButton.setAttribute("aria-expanded", String(isOpen));
      });
    }

    if (cartOpenButton) {
      cartOpenButton.addEventListener("click", openCart);
    }
  }

  function renderFooter() {
    const target = document.querySelector("[data-site-footer]");

    if (!target) {
      return;
    }

    const socialMarkup = data.site.socials
      .map(
        (social) =>
          `<a href="${social.url}" ${social.url !== "#" ? 'target="_blank" rel="noreferrer"' : ""}>${social.label}</a>`
      )
      .join("");

    const mpesaMarkup = data.site.mpesaSteps.map((step) => `<li>${step}</li>`).join("");

    target.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <section>
            <span class="section-kicker">SharonCraft</span>
            <h2>Colorful handmade beadwork for homes, gifts, and joyful moments.</h2>
            <p>${data.site.tagline}</p>
          </section>
          <section>
            <h3>Contact</h3>
            <ul class="footer-list">
              <li><a href="tel:${data.site.whatsapp}">${data.site.phone}</a></li>
              <li><a href="mailto:${data.site.email}">${data.site.email}</a></li>
              <li>${data.site.location}</li>
            </ul>
          </section>
          <section>
            <h3>M-Pesa Guide</h3>
            <ol class="footer-list footer-steps">
              ${mpesaMarkup}
            </ol>
          </section>
          <section>
            <h3>Social</h3>
            <div class="footer-socials">
              ${socialMarkup}
            </div>
          </section>
        </div>
      </footer>
      <div class="cart-backdrop" id="cart-backdrop"></div>
      <aside class="cart-drawer" id="cart-drawer" aria-hidden="true">
        <div class="cart-drawer-header">
          <div>
            <span class="section-kicker">Your Cart</span>
            <h3>Comfortable, quick checkout</h3>
          </div>
          <button class="cart-close-button" type="button" id="cart-close-button" aria-label="Close cart">Close</button>
        </div>
        <div class="cart-urgency" data-cart-urgency>
          <strong>Limited hold</strong>
          <span>Your basket stays reserved for <b data-cart-timer>05:00</b></span>
        </div>
        <p id="cart-empty" class="cart-empty">Your cart is empty. Add a few favorites and we will keep them in view here.</p>
        <div id="cart-items" class="cart-items"></div>
        <div class="cart-summary">
          <div>
            <span>Total</span>
            <strong id="cart-total-price">${formatCurrency(0)}</strong>
          </div>
          <a id="cart-checkout" class="button button-primary" href="${buildCartMessage()}" target="_blank" rel="noreferrer" data-analytics-label="Cart Checkout WhatsApp">Checkout on WhatsApp</a>
        </div>
      </aside>
      <a class="floating-whatsapp" href="${buildWhatsAppUrl("Hello SharonCraft, I would like to chat about your products.")}" target="_blank" rel="noreferrer" data-analytics-label="Floating WhatsApp">
        WhatsApp
      </a>
      <button class="scroll-top" type="button" aria-label="Scroll to top">Top</button>
    `;

    const scrollButton = target.querySelector(".scroll-top");
    const closeButton = target.querySelector("#cart-close-button");
    const backdrop = target.querySelector("#cart-backdrop");

    if (scrollButton) {
      scrollButton.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      window.addEventListener("scroll", function () {
        scrollButton.classList.toggle("is-visible", window.scrollY > 420);
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", closeCart);
    }

    if (backdrop) {
      backdrop.addEventListener("click", closeCart);
    }
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window) || !items.length) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((item) => observer.observe(item));
  }

  function renderCategorySelect(select) {
    if (!select) {
      return;
    }

    select.innerHTML = `
      <option value="">All categories</option>
      ${data.categories
        .map((category) => `<option value="${category.slug}">${category.name}</option>`)
        .join("")}
    `;
  }

  function bindCartEvents() {
    document.addEventListener("click", function (event) {
      const addButton = event.target.closest("[data-add-to-cart]");
      const wishlistButton = event.target.closest("[data-toggle-wishlist]");
      const increaseButton = event.target.closest("[data-cart-increase]");
      const decreaseButton = event.target.closest("[data-cart-decrease]");

      if (addButton) {
        addToCart(addButton.dataset.addToCart);
      }

      if (wishlistButton) {
        toggleWishlist(wishlistButton.dataset.toggleWishlist);
      }

      if (increaseButton) {
        const item = getCart().find((entry) => entry.productId === increaseButton.dataset.cartIncrease);
        if (item) {
          updateCartQuantity(item.productId, item.quantity + 1);
          openCart();
        }
      }

      if (decreaseButton) {
        const item = getCart().find((entry) => entry.productId === decreaseButton.dataset.cartDecrease);
        if (item) {
          updateCartQuantity(item.productId, item.quantity - 1);
        }
      }
    });
  }

  async function unregisterLegacyRootServiceWorker() {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const currentOrigin = window.location.origin;

      await Promise.all(
        registrations.map(async function (registration) {
          try {
            const scriptUrl = new URL(
              (registration.active && registration.active.scriptURL) ||
                (registration.waiting && registration.waiting.scriptURL) ||
                (registration.installing && registration.installing.scriptURL) ||
                "",
              currentOrigin
            );
            const scopeUrl = new URL(registration.scope, currentOrigin);
            const isRootScope = scopeUrl.origin === currentOrigin && scopeUrl.pathname === "/";
            const isRootSw = scriptUrl.origin === currentOrigin && scriptUrl.pathname === "/sw.js";

            if (isRootScope && isRootSw) {
              await registration.unregister();
            }
          } catch (error) {
            console.warn("Unable to inspect a service worker registration.", error);
          }
        })
      );
    } catch (error) {
      console.warn("Unable to check for legacy service workers.", error);
    }
  }

  async function hydrateSharedShell() {
    await unregisterLegacyRootServiceWorker();
    bindAnalyticsEvents();
    trackEvent("page_view", {
      page_title: document.title,
      page_location: window.location.href
    });
    renderHeader();
    renderFooter();
    initReveal();
    renderCartUi();
    startCartTimer();
    bindCartEvents();
  }

  document.addEventListener("DOMContentLoaded", hydrateSharedShell);

  window.SharonCraftUtils = {
    get data() { return data; }, // Dynamic getter for current data
    formatCurrency,
    buildWhatsAppUrl,
    getProductById,
    getCategoryBySlug,
    getProductsByCategory,
    getRelatedProducts,
    createProductCard,
    createCategoryCard,
    getScarcityNote,
    setPageMetadata,
    setStructuredData,
    trackEvent,
    getTrackedEvents: getStoredAnalyticsEvents,
    renderCategorySelect,
    refreshReveal: initReveal,
    addToCart,
    openCart,
    closeCart,
    ensureCartTimer,
    getTimeRemaining,
    formatTimeRemaining,
    waitForData
  };
})();
