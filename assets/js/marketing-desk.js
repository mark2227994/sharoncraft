document.addEventListener("DOMContentLoaded", async function () {
  const authView = document.getElementById("marketing-auth");
  const appView = document.getElementById("marketing-app");
  const loginForm = document.getElementById("marketing-login-form");
  const emailInput = document.getElementById("marketing-email");
  const passwordInput = document.getElementById("marketing-password");
  const authStatus = document.getElementById("marketing-auth-status");
  const appStatus = document.getElementById("marketing-app-status");
  const userCopy = document.getElementById("marketing-user-copy");
  const liveChip = document.getElementById("marketing-live-chip");
  const signOutButton = document.getElementById("marketing-sign-out");
  const summaryWrap = document.getElementById("marketing-summary");
  const productSearchInput = document.getElementById("marketing-product-search");
  const productPicks = document.getElementById("marketing-product-picks");
  const productImage = document.getElementById("marketing-product-image");
  const productKicker = document.getElementById("marketing-product-kicker");
  const productName = document.getElementById("marketing-product-name");
  const productStory = document.getElementById("marketing-product-story");
  const instagramCopy = document.getElementById("marketing-copy-instagram");
  const whatsappCopy = document.getElementById("marketing-copy-whatsapp");
  const statusCopy = document.getElementById("marketing-copy-status");
  const linkCopy = document.getElementById("marketing-copy-link");
  const pushTodayWrap = document.getElementById("marketing-push-today");
  const opportunitiesWrap = document.getElementById("marketing-opportunities");
  const ordersWrap = document.getElementById("marketing-orders");
  const topProductsWrap = document.getElementById("marketing-top-products");
  const topPagesWrap = document.getElementById("marketing-top-pages");
  const refreshProductsButton = document.getElementById("marketing-refresh-products");
  const refreshOrdersButton = document.getElementById("marketing-refresh-orders");
  const refreshAnalyticsButton = document.getElementById("marketing-refresh-analytics");
  const rangeButtons = Array.from(document.querySelectorAll("[data-marketing-range]"));

  const catalogApi = window.SharonCraftCatalog || null;
  const userController = window.SharonCraftUserController || null;
  let currentUser = null;
  let products = [];
  let orders = [];
  let analyticsEvents = [];
  let selectedProductId = "";
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
    return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "product";
  }

  function truncateText(value, limit) {
    const text = normalizeText(value);
    return !text || text.length <= limit ? text : `${text.slice(0, Math.max(0, limit - 1)).trim()}…`;
  }

  function setStatus(target, message, tone) {
    if (!target) {
      return;
    }
    target.textContent = message;
    target.dataset.tone = tone || "info";
  }

  async function copyText(value, successMessage) {
    const text = normalizeText(value);
    if (!text) {
      setStatus(appStatus, "There is nothing ready to copy yet.", "warning");
      return;
    }
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      setStatus(appStatus, successMessage || "Copied.", "success");
      return;
    }
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.style.position = "absolute";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
    setStatus(appStatus, successMessage || "Copied.", "success");
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
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
    return `${Math.round(diffHours / 24)}d ago`;
  }

  function buildAbsoluteUrl(path) {
    return new URL(normalizeText(path) || "/", window.location.origin).href;
  }

  function buildProductShareUrl(product) {
    return buildAbsoluteUrl(`/products/${slugify(normalizeText(product && (product.id || product.name)))}.html`);
  }

  function normalizePhoneForWhatsApp(phone) {
    const digits = normalizeText(phone).replace(/\D+/g, "");
    const fallback = normalizeText(window.SharonCraftData && window.SharonCraftData.site && window.SharonCraftData.site.whatsapp);
    if (!digits) {
      return fallback;
    }
    if (/^0\d{9}$/.test(digits)) {
      return `254${digits.slice(1)}`;
    }
    return digits;
  }

  function buildWhatsAppLink(phone, message) {
    return `https://wa.me/${encodeURIComponent(normalizePhoneForWhatsApp(phone))}?text=${encodeURIComponent(normalizeText(message))}`;
  }

  function getCategoryName(product) {
    const slug = normalizeText(product && product.notes).split("|")[0];
    const categories = window.SharonCraftData && Array.isArray(window.SharonCraftData.categories) ? window.SharonCraftData.categories : [];
    const match = categories.find(function (category) {
      return normalizeText(category.slug) === slug;
    });
    return match ? normalizeText(match.name) : "Handmade";
  }

  function getProductSalesFocus(product) {
    const slug = normalizeText(product && product.notes).split("|")[0];
    if (slug === "gift-sets" || slug === "bridal-occasion") {
      return "gifting, celebrations, and memorable occasions";
    }
    if (slug === "home-decor") {
      return "warm homes, meaningful corners, and easy styling";
    }
    if (slug === "bags-accessories") {
      return "personal style and practical everyday carrying";
    }
    return "daily styling, gifting, and standout handmade moments";
  }

  function buildMarketingDraft(product) {
    const name = normalizeText(product && product.name);
    const story = truncateText(normalizeText(product && product.story), 140) || "Handmade in Kenya with a warm, gift-friendly feel.";
    const priceText = Number(product && product.price) > 0 ? formatCurrency(product.price) : "Ask for price";
    const link = buildProductShareUrl(product);
    const focus = getProductSalesFocus(product);
    return {
      instagram: `${name} is now available at SharonCraft for ${priceText}. ${story} It works well for ${focus}. View it here: ${link} Order on WhatsApp today.`,
      whatsapp: `Hi, ${name} is a handmade SharonCraft piece for ${priceText}. ${story} It is a strong fit for ${focus}. Here is the direct link: ${link}`,
      status: `${name}\n${priceText}\nHandmade in Kenya\nGreat for ${focus}\n${link}`,
      link
    };
  }

  function buildOrderMessage(order, type) {
    const customer = normalizeText(order && order.customer) || "there";
    const productLabel = normalizeText(order && order.productName) || "your SharonCraft item";
    const area = normalizeText(order && order.areaName) || "your area";
    if (type === "payment") {
      return `Hello ${customer}, thank you for choosing SharonCraft. ${productLabel} is ready to confirm for delivery to ${area}. Reply here when you are ready and we will guide you through payment and next steps.`;
    }
    if (type === "dispatch") {
      return `Hello ${customer}, your SharonCraft order for ${productLabel} is moving forward well. We are preparing dispatch and will keep you updated on delivery to ${area}.`;
    }
    if (type === "review") {
      return `Hello ${customer}, thank you again for ordering ${productLabel} from SharonCraft. We hope you love it. If you can, please send a short review or a photo when you have a moment.`;
    }
    return `Hello ${customer}, just checking in from SharonCraft about ${productLabel}. If you still want it, I can help with delivery, payment, or choosing the best option for you.`;
  }

  function getRecentEvents(days) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return analyticsEvents.filter(function (event) {
      const timestamp = Date.parse(event && event.timestamp);
      return Number.isFinite(timestamp) && timestamp >= cutoff;
    });
  }

  function getFilteredEvents() {
    const limits = { "7d": 7, "30d": 30, "90d": 90 };
    return getRecentEvents(limits[currentRange] || 7);
  }

  function getProductFromEvent(event) {
    const payload = event && event.payload ? event.payload : {};
    return normalizeText(payload.product_name);
  }

  function getPageLabel(event) {
    const payload = event && event.payload ? event.payload : {};
    return normalizeText(payload.page_title) || normalizeText(payload.page_path) || "Storefront page";
  }

  function getActivityMap(events) {
    const summary = new Map();
    (Array.isArray(events) ? events : []).forEach(function (event) {
      const productName = getProductFromEvent(event);
      if (!productName) {
        return;
      }
      const current = summary.get(productName) || { total: 0, carts: 0, chats: 0, views: 0 };
      current.total += 1;
      const eventName = normalizeText(event && event.name).toLowerCase();
      if (eventName === "add_to_cart") {
        current.carts += 1;
      } else if (eventName.includes("whatsapp")) {
        current.chats += 1;
      } else {
        current.views += 1;
      }
      summary.set(productName, current);
    });
    return summary;
  }

  function findProductByName(name) {
    const normalized = normalizeText(name).toLowerCase();
    return products.find(function (product) {
      return normalizeText(product.name).toLowerCase() === normalized;
    }) || null;
  }

  function getTopPushProduct() {
    const ranked = Array.from(getActivityMap(getRecentEvents(7)).entries()).map(function (entry) {
      return {
        name: entry[0],
        product: findProductByName(entry[0]),
        score: entry[1].carts * 4 + entry[1].chats * 3 + entry[1].views + entry[1].total
      };
    }).sort(function (left, right) {
      return right.score - left.score;
    });
    return (ranked[0] && ranked[0].product) || products.find(function (product) { return !product.soldOut; }) || products[0] || null;
  }

  function getNeedsAttentionProduct() {
    const ranked = Array.from(getActivityMap(getRecentEvents(30)).entries()).map(function (entry) {
      return { product: findProductByName(entry[0]), stats: entry[1] };
    }).filter(function (item) {
      return item.product && item.stats.total >= 2 && item.stats.chats === 0;
    }).sort(function (left, right) {
      return right.stats.total - left.stats.total;
    });
    return ranked[0] ? { product: ranked[0].product, reason: "People are seeing this product, but it is not getting enough WhatsApp interest yet." } : null;
  }

  function buildTodayOfferText() {
    const topProduct = getTopPushProduct();
    const promo = normalizeText(window.SharonCraftData && window.SharonCraftData.site && window.SharonCraftData.site.promo);
    if (!topProduct) {
      return promo || "Handmade SharonCraft pieces are available now. Message on WhatsApp for help choosing the right piece.";
    }
    return `${normalizeText(topProduct.name)} is one of the best products to push today at SharonCraft. ${promo || "Handmade in Kenya and easy to order on WhatsApp."} View it here: ${buildProductShareUrl(topProduct)}`;
  }

  function buildWarmFollowUpText() {
    const pending = orders.find(function (order) {
      return ["new", "confirmed"].includes(normalizeText(order.status));
    });
    return pending ? buildOrderMessage(pending, "followup") : "Hello, just checking in from SharonCraft. If you still want help choosing a gift, decor piece, or handmade accessory, I can guide you quickly on WhatsApp.";
  }

  function getSelectedProduct() {
    return products.find(function (product) {
      return normalizeText(product.id) === selectedProductId;
    }) || getTopPushProduct();
  }

  function renderSummary() {
    if (!summaryWrap) {
      return;
    }
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const ordersToday = orders.filter(function (order) {
      const timestamp = Date.parse(order && order.createdAt);
      return Number.isFinite(timestamp) && timestamp >= dayAgo;
    }).length;
    const pending = orders.filter(function (order) {
      return ["new", "confirmed"].includes(normalizeText(order.status));
    }).length;
    const whatsappTaps = getRecentEvents(7).filter(function (event) {
      return normalizeText(event && event.name).toLowerCase().includes("whatsapp");
    }).length;
    const pushProduct = getTopPushProduct();
    summaryWrap.innerHTML = [
      { label: "Orders 24h", value: String(ordersToday) },
      { label: "Pending Follow-up", value: String(pending) },
      { label: "WhatsApp Taps 7d", value: String(whatsappTaps) },
      { label: "Push Today", value: truncateText(normalizeText(pushProduct && pushProduct.name) || "Choose a product", 26) }
    ].map(function (item) {
      return `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></article>`;
    }).join("");
  }

  function renderProductPicks() {
    const query = normalizeText(productSearchInput && productSearchInput.value).toLowerCase();
    const filtered = products.filter(function (product) {
      return !query || normalizeText(product.name).toLowerCase().includes(query) || getCategoryName(product).toLowerCase().includes(query);
    }).slice(0, 8);
    productPicks.innerHTML = filtered.length ? filtered.map(function (product) {
      const isActive = normalizeText(product.id) === normalizeText(selectedProductId);
      return `<button class="marketing-product-pill${isActive ? " is-active" : ""}" type="button" data-product-pick="${escapeHtml(normalizeText(product.id))}"><strong>${escapeHtml(normalizeText(product.name))}</strong><span>${escapeHtml(getCategoryName(product))} · ${escapeHtml(formatCurrency(product.price))}</span></button>`;
    }).join("") : '<div class="marketing-empty">No products match that search yet.</div>';
  }

  function renderSelectedProduct() {
    const product = getSelectedProduct();
    if (!product) {
      productKicker.textContent = "Ready to market";
      productName.textContent = "Choose a product";
      productStory.textContent = "Pick one product to generate post copy, WhatsApp pitch text, and the direct share link.";
      instagramCopy.value = "";
      whatsappCopy.value = "";
      statusCopy.value = "";
      linkCopy.value = "";
      return;
    }
    selectedProductId = normalizeText(product.id);
    const draft = buildMarketingDraft(product);
    productKicker.textContent = `${getCategoryName(product)} · ${formatCurrency(product.price)}`;
    productName.textContent = normalizeText(product.name);
    productStory.textContent = normalizeText(product.story) || "Handmade SharonCraft product ready for promotion.";
    productImage.src = normalizeText(product.image) || "assets/images/custom-occasion-beadwork-46mokm-opt.webp";
    productImage.alt = normalizeText(product.name) || "Selected SharonCraft product";
    instagramCopy.value = draft.instagram;
    whatsappCopy.value = draft.whatsapp;
    statusCopy.value = draft.status;
    linkCopy.value = draft.link;
    renderProductPicks();
  }

  function renderPushToday() {
    const topProduct = getTopPushProduct();
    pushTodayWrap.innerHTML = topProduct ? `<article class="marketing-opportunity-card"><div class="marketing-copy-head"><strong>${escapeHtml(normalizeText(topProduct.name))}</strong><button class="button button-secondary" type="button" data-quick-copy="push">Copy Post</button></div><p>${escapeHtml(truncateText(normalizeText(topProduct.story) || "This product already has the strongest sales signal right now.", 130))}</p><span>${escapeHtml(`Direct link: ${buildProductShareUrl(topProduct)}`)}</span></article>` : '<div class="marketing-empty">No products are ready to suggest yet.</div>';
  }

  function renderOpportunities() {
    const needsAttention = getNeedsAttentionProduct();
    const pending = orders.find(function (order) {
      return ["new", "confirmed"].includes(normalizeText(order.status));
    });
    const cards = [`<article class="marketing-opportunity-card"><div class="marketing-copy-head"><strong>Offer To Post</strong><button class="button button-secondary" type="button" data-quick-copy="offer">Copy Offer</button></div><p>${escapeHtml(truncateText(buildTodayOfferText(), 120))}</p></article>`];
    if (pending) {
      cards.push(`<article class="marketing-opportunity-card"><div class="marketing-copy-head"><strong>Follow Up Next</strong><button class="button button-secondary" type="button" data-quick-copy="followup">Copy Reply</button></div><p>${escapeHtml(`${normalizeText(pending.customer) || "A waiting customer"} is still open on ${normalizeText(pending.productName) || "a SharonCraft item"}.`)}</p></article>`);
    }
    if (needsAttention && needsAttention.product) {
      cards.push(`<article class="marketing-opportunity-card"><div class="marketing-copy-head"><strong>Fix This Product</strong><button class="button button-secondary" type="button" data-product-focus="${escapeHtml(normalizeText(needsAttention.product.id))}">Open Here</button></div><p>${escapeHtml(normalizeText(needsAttention.product.name))}</p><span>${escapeHtml(needsAttention.reason)}</span></article>`);
    }
    opportunitiesWrap.innerHTML = cards.join("");
  }

  function renderOrders() {
    const priority = orders.filter(function (order) {
      return ["new", "confirmed", "paid"].includes(normalizeText(order.status));
    }).slice(0, 8);
    ordersWrap.innerHTML = priority.length ? priority.map(function (order, index) {
      const status = normalizeText(order.status) || "new";
      const primaryType = status === "paid" ? "dispatch" : "payment";
      const primaryLabel = status === "paid" ? "Copy Dispatch Update" : "Copy Payment Reply";
      return `<article class="marketing-order-item"><div class="marketing-order-row-top"><strong>${escapeHtml(normalizeText(order.customer) || "Unknown customer")}</strong><span class="marketing-order-status">${escapeHtml(status)}</span></div><div class="marketing-order-meta">${escapeHtml(normalizeText(order.productName) || "Product")} · ${escapeHtml(formatCurrency(order.orderTotal))}</div><div class="marketing-order-meta">${escapeHtml(normalizeText(order.phone) || "No phone")} · ${escapeHtml(formatTimeAgo(order.createdAt))}</div><div class="marketing-order-actions"><button class="button button-secondary" type="button" data-order-copy="${escapeHtml(primaryType)}" data-order-index="${escapeHtml(String(index))}">${escapeHtml(primaryLabel)}</button><button class="button button-secondary" type="button" data-order-copy="followup" data-order-index="${escapeHtml(String(index))}">Copy Warm Follow-up</button><button class="button button-secondary" type="button" data-order-whatsapp="${escapeHtml(String(index))}">Open WhatsApp</button></div></article>`;
    }).join("") : '<div class="marketing-empty">No recent orders need follow-up right now.</div>';
  }

  function renderAnalytics() {
    const filtered = getFilteredEvents();
    const productMap = new Map();
    const pageMap = new Map();
    filtered.forEach(function (event) {
      const productLabel = getProductFromEvent(event);
      const pageLabel = getPageLabel(event);
      if (productLabel) {
        productMap.set(productLabel, (productMap.get(productLabel) || 0) + 1);
      }
      if (pageLabel) {
        pageMap.set(pageLabel, (pageMap.get(pageLabel) || 0) + 1);
      }
    });
    const topProducts = Array.from(productMap.entries()).sort(function (left, right) { return right[1] - left[1]; }).slice(0, 5);
    topProductsWrap.innerHTML = topProducts.length ? topProducts.map(function (item) {
      return `<article class="marketing-rank-item"><span>Product</span><strong>${escapeHtml(item[0])}</strong><span>${escapeHtml(String(item[1]))} signals</span></article>`;
    }).join("") : '<div class="marketing-empty">No product activity in this range yet.</div>';
    const topPages = Array.from(pageMap.entries()).sort(function (left, right) { return right[1] - left[1]; }).slice(0, 5);
    topPagesWrap.innerHTML = topPages.length ? topPages.map(function (item) {
      return `<article class="marketing-rank-item"><span>Page</span><strong>${escapeHtml(item[0])}</strong><span>${escapeHtml(String(item[1]))} visits</span></article>`;
    }).join("") : '<div class="marketing-empty">No page visits in this range yet.</div>';
  }

  function renderAll() {
    renderSummary();
    renderProductPicks();
    renderSelectedProduct();
    renderPushToday();
    renderOpportunities();
    renderOrders();
    renderAnalytics();
  }

  async function loadProducts(options) {
    if (!catalogApi || typeof catalogApi.fetchProducts !== "function") {
      throw new Error("Supabase catalog is not ready.");
    }
    products = await catalogApi.fetchProducts();
    if (!selectedProductId) {
      const topProduct = getTopPushProduct();
      selectedProductId = normalizeText(topProduct && topProduct.id);
    }
    renderAll();
    if (!options || options.showStatus !== false) {
      setStatus(appStatus, "Live products refreshed.", "success");
    }
  }

  async function loadOrders(options) {
    if (!catalogApi || typeof catalogApi.fetchOrders !== "function") {
      throw new Error("Orders API is not ready.");
    }
    orders = await catalogApi.fetchOrders();
    renderAll();
    if (!options || options.showStatus !== false) {
      setStatus(appStatus, "Live orders refreshed.", "success");
    }
  }

  async function loadAnalytics(options) {
    if (!catalogApi || typeof catalogApi.fetchAnalyticsEvents !== "function") {
      throw new Error("Analytics API is not ready.");
    }
    analyticsEvents = await catalogApi.fetchAnalyticsEvents(200);
    renderAll();
    if (!options || options.showStatus !== false) {
      setStatus(appStatus, "Live analytics refreshed.", "success");
    }
  }

  async function enterApp(user) {
    currentUser = user;
    authView.hidden = true;
    appView.hidden = false;
    userCopy.textContent = normalizeText(user && user.email) || "Signed in as admin";
    liveChip.textContent = "Live Supabase";
    await loadProducts({ showStatus: false });
    await loadOrders({ showStatus: false });
    await loadAnalytics({ showStatus: false });
    setStatus(appStatus, "Marketing desk ready. Products, orders, and live activity are synced.", "success");
  }

  async function checkExistingSession() {
    if (!catalogApi || typeof catalogApi.isConfigured !== "function" || !catalogApi.isConfigured()) {
      setStatus(authStatus, "Supabase is not configured on this site yet.", "error");
      return;
    }
    const user = await catalogApi.getCurrentUser();
    if (!user) {
      setStatus(authStatus, "Sign in with your admin account to open the marketing workspace.", "info");
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

  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      try {
        setStatus(authStatus, "Signing in...", "info");
        await userController.signIn(emailInput.value, passwordInput.value);
        const isAdmin = typeof catalogApi.isAdmin === "function" ? await catalogApi.isAdmin() : false;
        if (!isAdmin) {
          await catalogApi.signOut();
          setStatus(authStatus, "This account is not allowed into the marketing desk.", "error");
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
      setStatus(authStatus, "Signed out. Sign in again to reopen the marketing desk.", "info");
    });
  }

  if (productSearchInput) {
    productSearchInput.addEventListener("input", renderProductPicks);
  }

  if (productPicks) {
    productPicks.addEventListener("click", function (event) {
      const button = event.target.closest("[data-product-pick]");
      if (!button) {
        return;
      }
      selectedProductId = normalizeText(button.dataset.productPick);
      renderSelectedProduct();
      renderPushToday();
    });
  }

  rangeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentRange = button.dataset.marketingRange;
      rangeButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      renderAnalytics();
      renderSummary();
      renderOpportunities();
    });
  });

  if (refreshProductsButton) {
    refreshProductsButton.addEventListener("click", async function () {
      try {
        await loadProducts();
      } catch (error) {
        setStatus(appStatus, error && error.message ? error.message : "Could not refresh products right now.", "error");
      }
    });
  }

  if (refreshOrdersButton) {
    refreshOrdersButton.addEventListener("click", async function () {
      try {
        await loadOrders();
      } catch (error) {
        setStatus(appStatus, error && error.message ? error.message : "Could not refresh orders right now.", "error");
      }
    });
  }

  if (refreshAnalyticsButton) {
    refreshAnalyticsButton.addEventListener("click", async function () {
      try {
        await loadAnalytics();
      } catch (error) {
        setStatus(appStatus, error && error.message ? error.message : "Could not refresh analytics right now.", "error");
      }
    });
  }

  if (appView) {
    appView.addEventListener("click", function (event) {
      const copyButton = event.target.closest("[data-marketing-copy]");
      if (copyButton) {
        const draft = buildMarketingDraft(getSelectedProduct());
        const value = copyButton.dataset.marketingCopy === "instagram" ? draft.instagram : copyButton.dataset.marketingCopy === "whatsapp" ? draft.whatsapp : copyButton.dataset.marketingCopy === "status" ? draft.status : draft.link;
        copyText(value, `${copyButton.textContent.trim()} copied.`).catch(function (error) {
          setStatus(appStatus, error && error.message ? error.message : "Could not copy that text.", "error");
        });
        return;
      }
      const quickCopyButton = event.target.closest("[data-quick-copy]");
      if (quickCopyButton) {
        const topProduct = getTopPushProduct();
        const value = quickCopyButton.dataset.quickCopy === "offer" ? buildTodayOfferText() : quickCopyButton.dataset.quickCopy === "followup" ? buildWarmFollowUpText() : buildMarketingDraft(topProduct).instagram;
        copyText(value, `${quickCopyButton.textContent.trim()} copied.`).catch(function (error) {
          setStatus(appStatus, error && error.message ? error.message : "Could not copy that quick action.", "error");
        });
        return;
      }
      const quickLinkButton = event.target.closest("[data-quick-link]");
      if (quickLinkButton) {
        const path = quickLinkButton.dataset.quickLink === "gifts" ? "handmade-kenyan-gifts.html" : "shop.html";
        window.open(buildAbsoluteUrl(path), "_blank", "noopener,noreferrer");
        return;
      }
      const productFocusButton = event.target.closest("[data-product-focus]");
      if (productFocusButton) {
        selectedProductId = normalizeText(productFocusButton.dataset.productFocus);
        renderSelectedProduct();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const priority = orders.filter(function (order) {
        return ["new", "confirmed", "paid"].includes(normalizeText(order.status));
      }).slice(0, 8);
      const orderCopyButton = event.target.closest("[data-order-copy]");
      if (orderCopyButton) {
        const order = priority[Number(orderCopyButton.dataset.orderIndex)];
        copyText(buildOrderMessage(order, orderCopyButton.dataset.orderCopy), `${orderCopyButton.textContent.trim()} copied.`).catch(function (error) {
          setStatus(appStatus, error && error.message ? error.message : "Could not copy that order reply.", "error");
        });
        return;
      }
      const orderWhatsAppButton = event.target.closest("[data-order-whatsapp]");
      if (orderWhatsAppButton) {
        const order = priority[Number(orderWhatsAppButton.dataset.orderWhatsapp)];
        window.open(buildWhatsAppLink(order && order.phone, buildOrderMessage(order, "followup")), "_blank", "noopener,noreferrer");
      }
    });
  }

  if (catalogApi && typeof catalogApi.onAuthStateChange === "function") {
    catalogApi.onAuthStateChange(function (user) {
      if (!user && currentUser) {
        currentUser = null;
        appView.hidden = true;
        authView.hidden = false;
        setStatus(authStatus, "Signed out. Sign in again to reopen the marketing desk.", "info");
      }
    });
  }

  await checkExistingSession();
});
