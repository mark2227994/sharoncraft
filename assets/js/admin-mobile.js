document.addEventListener("DOMContentLoaded", async function () {
  const authView = document.getElementById("admin-mobile-auth-view");
  const appView = document.getElementById("admin-mobile-app");
  const loginForm = document.getElementById("admin-mobile-login-form");
  const emailInput = document.getElementById("admin-mobile-email");
  const passwordInput = document.getElementById("admin-mobile-password");
  const authStatus = document.getElementById("admin-mobile-auth-status");
  const appStatus = document.getElementById("admin-mobile-app-status");
  const logoutButton = document.getElementById("admin-mobile-logout");
  const userCopy = document.getElementById("admin-mobile-user-copy");
  const liveChip = document.getElementById("admin-mobile-live-chip");
  const tabButtons = Array.from(document.querySelectorAll("[data-mobile-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-mobile-panel]"));
  const productForm = document.getElementById("admin-mobile-product-form");
  const formKicker = document.getElementById("admin-mobile-form-kicker");
  const formTitle = document.getElementById("admin-mobile-form-title");
  const resetFormButton = document.getElementById("admin-mobile-reset-form");
  const saveProductButton = document.getElementById("admin-mobile-save-product");
  const productIdInput = document.getElementById("admin-mobile-product-id");
  const nameInput = document.getElementById("admin-mobile-name");
  const categoryInput = document.getElementById("admin-mobile-category");
  const priceInput = document.getElementById("admin-mobile-price");
  const badgeInput = document.getElementById("admin-mobile-badge");
  const imageInput = document.getElementById("admin-mobile-image");
  const uploadTargetInput = document.getElementById("admin-mobile-upload-target");
  const cameraInput = document.getElementById("admin-mobile-camera-input");
  const uploadPreview = document.getElementById("admin-mobile-upload-preview");
  const uploadPreviewImage = document.getElementById("admin-mobile-upload-preview-image");
  const uploadStatus = document.getElementById("admin-mobile-upload-status");
  const galleryInput = document.getElementById("admin-mobile-gallery");
  const descriptionInput = document.getElementById("admin-mobile-description");
  const detailsInput = document.getElementById("admin-mobile-details");
  const featuredInput = document.getElementById("admin-mobile-featured");
  const newInput = document.getElementById("admin-mobile-new");
  const soldOutInput = document.getElementById("admin-mobile-soldout");
  const searchInput = document.getElementById("admin-mobile-product-search");
  const productList = document.getElementById("admin-mobile-product-list");
  const refreshProductsButton = document.getElementById("admin-mobile-refresh-products");
  const refreshAnalyticsButton = document.getElementById("admin-mobile-refresh-analytics");
  const analyticsSummary = document.getElementById("admin-mobile-analytics-summary");
  const analyticsProducts = document.getElementById("admin-mobile-analytics-products");
  const analyticsPages = document.getElementById("admin-mobile-analytics-pages");
  const analyticsFeed = document.getElementById("admin-mobile-analytics-feed");
  const rangeButtons = Array.from(document.querySelectorAll("[data-mobile-range]"));

  const catalogApi = window.SharonCraftCatalog || null;
  const userController = window.SharonCraftUserController || null;
  const categories = window.SharonCraftData && Array.isArray(window.SharonCraftData.categories)
    ? window.SharonCraftData.categories
    : [];

  let products = [];
  let analyticsEvents = [];
  let currentRange = "7d";
  let currentUser = null;
  let isUploadingPhoto = false;

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

  function getCategoryName(slug) {
    const match = categories.find(function (category) {
      return category.slug === slug;
    });
    return match ? match.name : "Handmade";
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
      button.classList.toggle("is-active", button.dataset.mobileTab === name);
    });
    panels.forEach(function (panel) {
      panel.classList.toggle("is-active", panel.dataset.mobilePanel === name);
    });
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

  function resetForm() {
    if (!productForm) {
      return;
    }

    productForm.reset();
    productIdInput.value = "";
    if (categories[0]) {
      categoryInput.value = categories[0].slug;
    }
    formKicker.textContent = "New Product";
    formTitle.textContent = "Add from anywhere";
    saveProductButton.textContent = "Save To Live Catalog";
    if (uploadPreview) {
      uploadPreview.hidden = true;
    }
    if (cameraInput) {
      cameraInput.value = "";
    }
    setStatus(uploadStatus, "Snap a product photo here and the phone admin will upload it to live storage for you.", "info");
  }

  function fillForm(product) {
    const parts = normalizeText(product.notes).split("|");
    const categorySlug = normalizeText(parts[0]) || categories[0] && categories[0].slug || "";
    productIdInput.value = normalizeText(product.id);
    nameInput.value = normalizeText(product.name);
    categoryInput.value = categorySlug;
    priceInput.value = Number(product.price) || 0;
    badgeInput.value = normalizeText(product.spotlightText);
    imageInput.value = normalizeText(product.image);
    galleryInput.value = Array.isArray(product.gallery) ? product.gallery.join(", ") : "";
    descriptionInput.value = normalizeText(product.story);
    detailsInput.value = Array.isArray(product.specs) ? product.specs.join(", ") : "";
    featuredInput.checked = Boolean(normalizeText(product.spotlightUntil));
    newInput.checked = Boolean(normalizeText(product.newUntil));
    soldOutInput.checked = Boolean(product.soldOut);
    formKicker.textContent = "Editing Product";
    formTitle.textContent = normalizeText(product.name) || "Edit product";
    saveProductButton.textContent = "Update Live Product";
    setStatus(uploadStatus, "You can replace the main photo or add a gallery shot from your phone camera.", "info");
    activateTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function appendGalleryImage(url) {
    const existing = parseList(galleryInput.value);
    if (!existing.includes(url)) {
      existing.push(url);
      galleryInput.value = existing.join(", ");
    }
  }

  async function uploadPhoneImage(file) {
    if (!file) {
      return;
    }

    if (isUploadingPhoto) {
      return;
    }

    if (!catalogApi || typeof catalogApi.uploadProductImage !== "function") {
      setStatus(uploadStatus, "Live image upload is not available on this page yet.", "error");
      return;
    }

    isUploadingPhoto = true;
    if (cameraInput) {
      cameraInput.disabled = true;
    }

    try {
      setStatus(uploadStatus, `Uploading ${file.name}...`, "info");
      const uploaded = await catalogApi.uploadProductImage(file);
      const publicUrl = normalizeText(uploaded && uploaded.publicUrl);

      if (!publicUrl) {
        throw new Error("The upload finished but no public image URL was returned.");
      }

      if (uploadPreview && uploadPreviewImage) {
        uploadPreview.hidden = false;
        uploadPreviewImage.src = publicUrl;
      }

      if (uploadTargetInput && uploadTargetInput.value === "gallery") {
        appendGalleryImage(publicUrl);
        setStatus(uploadStatus, "Photo uploaded and added to the gallery list.", "success");
      } else {
        imageInput.value = publicUrl;
        setStatus(uploadStatus, "Photo uploaded and set as the main product image.", "success");
      }
    } catch (error) {
      console.error("Unable to upload phone image.", error);
      setStatus(uploadStatus, error && error.message ? error.message : "Phone image upload failed.", "error");
    } finally {
      isUploadingPhoto = false;
      if (cameraInput) {
        cameraInput.disabled = false;
        cameraInput.value = "";
      }
    }
  }

  function buildProductPayload(existingProduct) {
    const productId = normalizeText(productIdInput.value) || slugify(nameInput.value);
    const categorySlug = normalizeText(categoryInput.value) || categories[0] && categories[0].slug || "necklaces";
    const now = Date.now();

    return {
      id: productId,
      image: normalizeText(imageInput.value),
      name: normalizeText(nameInput.value),
      price: Number(priceInput.value) || 0,
      material: getCategoryName(categorySlug),
      story: normalizeText(descriptionInput.value),
      specs: parseList(detailsInput.value),
      gallery: parseList(galleryInput.value),
      soldOut: soldOutInput.checked,
      spotlightUntil: featuredInput.checked ? new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString() : "",
      spotlightText: normalizeText(badgeInput.value) || (featuredInput.checked ? "Featured" : ""),
      notes: `${categorySlug}|mobile-admin`,
      updatedAt: new Date().toISOString(),
      newUntil: newInput.checked ? new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString() : "",
      sortOrder: existingProduct && Number.isFinite(Number(existingProduct.sortOrder)) ? Number(existingProduct.sortOrder) : 0
    };
  }

  function renderProducts() {
    if (!productList) {
      return;
    }

    const query = normalizeText(searchInput && searchInput.value).toLowerCase();
    const filtered = products.filter(function (product) {
      const notes = normalizeText(product.notes);
      return !query ||
        normalizeText(product.name).toLowerCase().includes(query) ||
        normalizeText(product.material).toLowerCase().includes(query) ||
        notes.toLowerCase().includes(query);
    });

    if (!filtered.length) {
      productList.innerHTML = '<div class="admin-mobile-empty">No matching products yet.</div>';
      return;
    }

    productList.innerHTML = filtered
      .map(function (product) {
        const categorySlug = normalizeText(normalizeText(product.notes).split("|")[0]);
        return `
          <article class="admin-mobile-product-card">
            <img src="${escapeHtml(normalizeText(product.image) || "assets/images/custom-occasion-beadwork-46mokm.webp")}" alt="${escapeHtml(product.name)}" loading="lazy" />
            <div class="admin-mobile-product-copy">
              <div class="admin-mobile-inline-meta">
                <strong>${escapeHtml(product.name)}</strong>
                <span>${escapeHtml(formatCurrency(product.price))}</span>
              </div>
              <p>${escapeHtml(getCategoryName(categorySlug) || product.material || "Handmade")}</p>
              <div class="admin-mobile-inline-meta">
                <span>${product.soldOut ? "Sold out" : normalizeText(product.spotlightUntil) ? "Featured" : normalizeText(product.newUntil) ? "New" : "Live"}</span>
                <span>${escapeHtml(formatTimeAgo(product.updatedAt))}</span>
              </div>
              <div class="admin-mobile-card-actions">
                <button class="button button-secondary" type="button" data-product-edit="${escapeHtml(product.id)}">Edit</button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function getFilteredAnalyticsEvents() {
    const days = currentRange === "90d" ? 90 : currentRange === "30d" ? 30 : 7;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return analyticsEvents.filter(function (event) {
      return Date.parse(event.timestamp || "") >= cutoff;
    });
  }

  function getProductFromEvent(event) {
    const payload = event && event.payload && typeof event.payload === "object" ? event.payload : {};
    return {
      id: normalizeText(payload.product_id || (payload.items && payload.items[0] && payload.items[0].item_id)),
      name: normalizeText(payload.product_name || (payload.items && payload.items[0] && payload.items[0].item_name))
    };
  }

  function getPageLabel(event) {
    const payload = event && event.payload && typeof event.payload === "object" ? event.payload : {};
    const path = normalizeText(payload.page_path);
    if (path === "/") {
      return "Homepage";
    }
    if (path.indexOf("/product.html") === 0) {
      return "Product Page";
    }
    if (path.indexOf("/shop.html") === 0) {
      return "Shop";
    }
    return normalizeText(payload.page_title) || path || "Storefront";
  }

  function renderAnalytics() {
    if (!analyticsSummary || !analyticsProducts || !analyticsPages || !analyticsFeed) {
      return;
    }

    const filtered = getFilteredAnalyticsEvents().sort(function (left, right) {
      return Date.parse(right.timestamp || "") - Date.parse(left.timestamp || "");
    });

    const counts = filtered.reduce(function (totals, event) {
      totals.events += 1;
      if (event.name === "page_view") totals.pageViews += 1;
      if (event.name === "product_view") totals.productViews += 1;
      if (event.name === "add_to_cart") totals.carts += 1;
      if (event.name === "whatsapp_click") totals.whatsapp += 1;
      return totals;
    }, { events: 0, pageViews: 0, productViews: 0, carts: 0, whatsapp: 0 });

    analyticsSummary.innerHTML = [
      { label: "Page views", value: counts.pageViews },
      { label: "Product opens", value: counts.productViews },
      { label: "Add to cart", value: counts.carts },
      { label: "WhatsApp taps", value: counts.whatsapp }
    ].map(function (item) {
      return `
        <article class="admin-mobile-metric-card">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(String(item.value))}</strong>
        </article>
      `;
    }).join("");

    const productMap = new Map();
    filtered.forEach(function (event) {
      const product = getProductFromEvent(event);
      if (!product.id && !product.name) {
        return;
      }
      const key = product.id || product.name;
      if (!productMap.has(key)) {
        productMap.set(key, { name: product.name || "Product", count: 0 });
      }
      productMap.get(key).count += 1;
    });

    const pageMap = new Map();
    filtered.filter(function (event) {
      return event.name === "page_view";
    }).forEach(function (event) {
      const label = getPageLabel(event);
      if (!pageMap.has(label)) {
        pageMap.set(label, 0);
      }
      pageMap.set(label, pageMap.get(label) + 1);
    });

    const rankedProducts = Array.from(productMap.values()).sort(function (left, right) {
      return right.count - left.count;
    }).slice(0, 5);
    analyticsProducts.innerHTML = rankedProducts.length
      ? rankedProducts.map(function (item) {
          return `
            <article class="admin-mobile-rank-item">
              <div>
                <span>Product</span>
                <strong>${escapeHtml(item.name)}</strong>
              </div>
              <strong>${escapeHtml(String(item.count))}</strong>
            </article>
          `;
        }).join("")
      : '<div class="admin-mobile-empty">No product activity in this range yet.</div>';

    const rankedPages = Array.from(pageMap.entries()).sort(function (left, right) {
      return right[1] - left[1];
    }).slice(0, 5);
    analyticsPages.innerHTML = rankedPages.length
      ? rankedPages.map(function (item) {
          return `
            <article class="admin-mobile-rank-item">
              <div>
                <span>Page</span>
                <strong>${escapeHtml(item[0])}</strong>
              </div>
              <strong>${escapeHtml(String(item[1]))}</strong>
            </article>
          `;
        }).join("")
      : '<div class="admin-mobile-empty">No page visits in this range yet.</div>';

    analyticsFeed.innerHTML = filtered.slice(0, 8).length
      ? filtered.slice(0, 8).map(function (event) {
          const product = getProductFromEvent(event);
          return `
            <article class="admin-mobile-feed-item">
              <div class="admin-mobile-feed-copy">
                <span>${escapeHtml(String(event.name || "").replace(/_/g, " "))}</span>
                <strong>${escapeHtml(product.name || getPageLabel(event))}</strong>
              </div>
              <span>${escapeHtml(formatTimeAgo(event.timestamp))}</span>
            </article>
          `;
        }).join("")
      : '<div class="admin-mobile-empty">No recent live events for this range yet.</div>';
  }

  async function loadProducts(options) {
    if (!catalogApi || typeof catalogApi.fetchProducts !== "function") {
      throw new Error("Supabase catalog is not ready.");
    }
    products = await catalogApi.fetchProducts();
    renderProducts();
    if (!options || options.showStatus !== false) {
      setStatus(appStatus, "Live products refreshed.", "success");
    }
  }

  async function loadAnalytics(options) {
    if (!catalogApi || typeof catalogApi.fetchAnalyticsEvents !== "function") {
      throw new Error("Analytics API is not ready.");
    }
    analyticsEvents = await catalogApi.fetchAnalyticsEvents(200);
    renderAnalytics();
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

    if (!payload.name || !payload.image) {
      setStatus(appStatus, "Add at least a product name and image before saving.", "error");
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
    resetForm();
    renderProducts();
    setStatus(appStatus, `${payload.name} is live in the catalog.`, "success");
    activateTab("catalog");
  }

  async function enterApp(user) {
    currentUser = user;
    authView.hidden = true;
    appView.hidden = false;
    userCopy.textContent = normalizeText(user.email) || "Signed in as admin";
    liveChip.textContent = "Live Supabase";
    populateCategorySelect();
    resetForm();
    await loadProducts({ showStatus: false });
    await loadAnalytics({ showStatus: false });
    setStatus(appStatus, "Mobile admin ready. Products and live analytics are synced.", "success");
  }

  async function checkExistingSession() {
    if (!catalogApi || typeof catalogApi.isConfigured !== "function" || !catalogApi.isConfigured()) {
      setStatus(authStatus, "Supabase is not configured on this site yet.", "error");
      return;
    }

    const user = await catalogApi.getCurrentUser();
    if (!user) {
      setStatus(authStatus, "Sign in with your admin account to open the phone workspace.", "info");
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
      activateTab(button.dataset.mobileTab);
    });
  });

  rangeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentRange = button.dataset.mobileRange;
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
          setStatus(authStatus, "This account is not allowed into mobile admin.", "error");
          return;
        }
        const user = await catalogApi.getCurrentUser();
        await enterApp(user);
      } catch (error) {
        setStatus(authStatus, error && error.message ? error.message : "Sign-in failed.", "error");
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
      try {
        await userController.signOut();
      } catch (error) {
        // Ignore sign-out errors and still reset the UI.
      }
      currentUser = null;
      appView.hidden = true;
      authView.hidden = false;
      if (emailInput) {
        emailInput.value = "";
      }
      if (passwordInput) {
        passwordInput.value = "";
      }
      setStatus(authStatus, "Signed out. Sign in again to reopen mobile admin.", "info");
    });
  }

  if (productForm) {
    productForm.addEventListener("submit", async function (event) {
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

  if (refreshProductsButton) {
    refreshProductsButton.addEventListener("click", async function () {
      try {
        await loadProducts();
      } catch (error) {
        setStatus(appStatus, "Could not refresh products right now.", "error");
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

  if (searchInput) {
    searchInput.addEventListener("input", renderProducts);
  }

  if (cameraInput) {
    cameraInput.addEventListener("change", async function (event) {
      const file = event.target && event.target.files ? event.target.files[0] : null;
      if (!file) {
        return;
      }

      await uploadPhoneImage(file);
    });
  }

  if (productList) {
    productList.addEventListener("click", function (event) {
      const editButton = event.target.closest("[data-product-edit]");
      if (!editButton) {
        return;
      }

      const product = products.find(function (item) {
        return normalizeText(item.id) === normalizeText(editButton.dataset.productEdit);
      });
      if (product) {
        fillForm(product);
      }
    });
  }

  if (catalogApi && typeof catalogApi.onAuthStateChange === "function") {
    catalogApi.onAuthStateChange(async function (user) {
      if (!user && currentUser) {
        currentUser = null;
        appView.hidden = true;
        authView.hidden = false;
        setStatus(authStatus, "Your session ended. Sign in again to continue.", "info");
      }
    });
  }

  populateCategorySelect();
  resetForm();
  activateTab("add");
  await checkExistingSession();
});
