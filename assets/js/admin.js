document.addEventListener("DOMContentLoaded", async function () {
  // Browser-based admin state for the static storefront.
  const storageKey = (window.SharonCraftStorage && window.SharonCraftStorage.storageKey) || "sharoncraft-admin-catalog";
  const socialSettingsKey =
    (window.SharonCraftStorage && window.SharonCraftStorage.socialSettingsKey) || "sharoncraft-social-settings";
  const categoriesSettingsKey =
    (window.SharonCraftStorage && window.SharonCraftStorage.categoriesSettingsKey) || "sharoncraft-category-settings";
  const homeVisualsSettingsKey =
    (window.SharonCraftStorage && window.SharonCraftStorage.homeVisualsSettingsKey) || "sharoncraft-home-visuals";
  const socialPlannerKey = "sharoncraft-social-planner";
  const ordersKey = "sharoncraft-orders";
  const deliveryAreasKey = "sharoncraft-delivery-areas";
  const expensesKey = "sharoncraft-expenses";
  const bundlesKey = "sharoncraft-bundles";
  const replyTemplatesKey = "sharoncraft-reply-templates";
  const goalKey = "sharoncraft-kiosk-goal";
  const mpesaDashboardKey = "sharoncraft-mpesa-dashboard";
  const storefrontAnalyticsKey = "sharoncraft-analytics-events";
  const utils = window.SharonCraftUtils;
  // Wait for data to be loaded
  await utils.waitForData();
  const liveCatalogApi = window.SharonCraftCatalog || null;
  const fallbackAvailableImages = [
    "assets/images/2f81aa6f-be3f-4284-bafc-39349accfd40_0_watermark.jpeg",
    "assets/images/d2801c4b-e113-440b-8eaf-fa52ac5703a8_0_watermark.jpeg",
    "assets/images/IMG-20260212-WA0020.jpeg",
    "assets/images/IMG-20260214-WA0004.jpg",
    "assets/images/IMG-20260214-WA0005.jpg",
    "assets/images/IMG-20260214-WA0006.jpg",
    "assets/images/IMG-20260214-WA0007.jpg",
    "assets/images/IMG-20260221-WA0000.jpg",
    "assets/images/IMG-20260221-WA0003.jpg",
    "assets/images/IMG-20260226-WA0005.jpg",
    "assets/images/IMG-20260304-WA0001.jpg",
    "assets/images/IMG-20260305-WA0001.jpg",
    "assets/images/IMG-20260317-WA0003.jpg",
    "assets/images/IMG_20230923_150506.jpg",
    "assets/images/IMG_20230923_150515.jpg",
    "assets/images/IMG_20230923_150524.jpg",
    "assets/images/IMG_20230923_150542.jpg",
    "assets/images/IMG_20230927_135101.jpg",
    "assets/images/IMG_20230927_135109.jpg",
    "assets/images/IMG_20230927_135118.jpg",
    "assets/images/IMG_20230927_135122.jpg",
    "assets/images/IMG_20240316_151005.jpg",
    "assets/images/IMG_20240316_151014.jpg",
    "assets/images/IMG_20240316_151021.jpg",
    "assets/images/IMG_20240316_151041.jpg",
    "assets/images/IMG_20240719_100801.jpg",
    "assets/images/IMG_20240729_131535.jpg",
    "assets/images/IMG_20240729_131552.jpg",
    "assets/images/IMG_20240729_131556.jpg",
    "assets/images/IMG_20250604_103830.jpg",
    "assets/images/IMG_20250606_113904.jpg",
    "assets/images/IMG_20250606_113910.jpg",
    "assets/images/IMG_20250606_113919.jpg",
    "assets/images/IMG_20250606_113933.jpg",
    "assets/images/IMG_20250606_113948.jpg",
    "assets/images/IMG_20250610_114035.jpg",
    "assets/images/IMG_20250712_135532.jpg",
    "assets/images/IMG_20250816_095238.jpg",
    "assets/images/IMG_20250819_123219.jpg",
    "assets/images/IMG_20260115_111952.jpg",
    "assets/images/IMG_20260116_135128.jpg",
    "assets/images/IMG_20260116_135132.jpg",
    "assets/images/IMG_20260116_135140.jpg",
    "assets/images/IMG_20260116_135153.jpg",
    "assets/images/kenya bracelete.jpg",
    "assets/images/kenya-flag.svg",
    "assets/images/WhatsApp Image 2026-03-21 at 14.21.15.jpeg",
    "assets/images/WhatsApp Image 2026-03-21 at 14.22.49.jpeg",
    "assets/images/WhatsApp Image 2026-03-21 at 14.23.21.jpeg",
    "assets/images/WhatsApp Image 2026-03-21 at 14.26.24.jpeg",
    "assets/images/WhatsApp Image 2026-03-21 at 14.27.00.jpeg",
    "assets/images/WhatsApp Image 2026-03-21 at 14.27.14.jpeg",
    "assets/images/WhatsApp Image 2026-03-21 at 15.48.32 (1).jpeg",
    "assets/images/WhatsApp Image 2026-03-21 at 15.48.32.jpeg"
  ];
  let availableImages = [];
  const fallbackImage = "assets/images/IMG-20260226-WA0005.jpg";
  const defaultCategorySource =
    (window.SharonCraftDefaultData && window.SharonCraftDefaultData.categories) || utils.data.categories;
  const defaultHomeVisualSource =
    (window.SharonCraftDefaultData && window.SharonCraftDefaultData.homeVisuals) || utils.data.homeVisuals || {};
  const defaultProductSource = (window.SharonCraftDefaultData && window.SharonCraftDefaultData.products) || utils.data.products;
  let curatedLibraryImages = [];
  let categoryCatalog = (utils.data.categories || []).map((category) => normalizeCategory(category));
  let categoryMap = new Map(categoryCatalog.map((category) => [category.slug, category.name]));

  const defaultProducts = defaultProductSource.map((product, index) => normalizeProduct(product, index));
  const defaultProductImageMap = new Map(defaultProducts.map((product) => [product.id, product.images]));
  let defaultCategoryImageMap = buildDefaultCategoryImageMap(categoryCatalog);

  function setAvailableImages(imageList) {
    availableImages = Array.from(
      new Set(
        (Array.isArray(imageList) ? imageList : [])
          .concat(fallbackAvailableImages)
          .map((image) => String(image || "").trim())
          .filter(Boolean)
      )
    );
    curatedLibraryImages = availableImages.filter(
      (image) => /\.(jpe?g|png|webp|svg)$/i.test(image) && !/logo|favicon/i.test(image)
    );
  }

  setAvailableImages(Array.isArray(window.SharonCraftImageManifest) ? window.SharonCraftImageManifest : []);

  function defaultAnalytics(product, index) {
    const unitsSold = (index + 2) * (product.featured ? 4 : 2);
    const whatsappClicks = unitsSold * 3 + (product.newArrival ? 9 : 5);
    return {
      whatsappClicks,
      unitsSold,
      revenue: unitsSold * Number(product.price || 0)
    };
  }

  function normalizeProduct(product, index) {
    const rawImages = Array.isArray(product.images) ? product.images : [];
    const rawGallery = Array.isArray(product.gallery) ? product.gallery : [];
    const noteParts = String(product.notes || "").split("|");
    const categoryFromNotes = String(noteParts[0] || "").trim();
    const sourceFromNotes = String(noteParts[1] || "").trim();
    const material = String(product.material || "").trim().toLowerCase();
    const fallbackCategory =
      categoryFromNotes ||
      product.category ||
      ((categoryCatalog || []).find((category) => String(category.name || "").trim().toLowerCase() === material) || {}).slug ||
      ((defaultCategorySource || []).find((category) => String(category.name || "").trim().toLowerCase() === material) || {}).slug ||
      "necklaces";
    const spotlightUntil = Date.parse(product.spotlightUntil || "");
    const newUntil = Date.parse(product.newUntil || "");
    const mainImage =
      cleanImagePath(product.image) ||
      cleanImagePath(rawImages[0]) ||
      cleanImagePath(rawGallery[0]) ||
      fallbackImage;
    const gallery = dedupeImages([mainImage].concat(rawImages, rawGallery));
    return {
      id: product.id,
      name: product.name,
      category: fallbackCategory,
      price: Number(product.price) || 0,
      momPrice: Number(product.momPrice) || 0,
      deliveryCharge: Number(product.deliveryCharge) || 0,
      deliveryCost: Number(product.deliveryCost) || 0,
      source: product.source || sourceFromNotes || "mom-kiosk",
      stockQty: Number(product.stockQty) || 0,
      reservedQty: Number(product.reservedQty) || 0,
      badge: product.badge || product.spotlightText || "",
      featured: Boolean(product.featured) || (Number.isFinite(spotlightUntil) && spotlightUntil > Date.now()),
      newArrival: Boolean(product.newArrival) || (Number.isFinite(newUntil) && newUntil > Date.now()),
      shortDescription: product.shortDescription || product.description || product.story || "",
      description: product.description || product.shortDescription || product.story || "",
      details: Array.isArray(product.details) ? product.details : Array.isArray(product.specs) ? product.specs : [],
      images: gallery,
      analytics: product.analytics || defaultAnalytics(product, index)
    };
  }

  function normalizeCategory(category) {
    const allowedAccents = ["coral", "teal", "ochre", "terracotta"];
    const slug = String(category.slug || "").trim();
    const fallbackCategory = (defaultCategorySource || []).find((item) => item.slug === slug) || {};
    const accent = String(category.accent || fallbackCategory.accent || "coral").trim().toLowerCase();

    return {
      slug,
      name: String(category.name || fallbackCategory.name || "Category").trim() || "Category",
      description: String(category.description || fallbackCategory.description || "").trim(),
      image:
        cleanImagePath(category.image) ||
        cleanImagePath(fallbackCategory.image) ||
        fallbackImage,
      tip: String(category.tip || category.homeTip || fallbackCategory.tip || "").trim(),
      accent: allowedAccents.includes(accent) ? accent : "coral"
    };
  }

  function normalizeHomeVisuals(visuals) {
    const fallback = defaultHomeVisualSource || {};
    const fallbackHero = fallback.hero || {};
    const fallbackFavorite = fallback.favorite || {};
    const hero = visuals && typeof visuals === "object" ? visuals.hero || {} : {};
    const favorite = visuals && typeof visuals === "object" ? visuals.favorite || {} : {};

    return {
      hero: {
        kicker: String(hero.kicker || fallbackHero.kicker || "Welcome to SharonCraft").trim() || "Welcome to SharonCraft",
        title:
          String(hero.title || fallbackHero.title || "Clean, colorful handmade beadwork for happy homes and beautiful gifting.").trim() ||
          "Clean, colorful handmade beadwork for happy homes and beautiful gifting.",
        description:
          String(
            hero.description ||
              fallbackHero.description ||
              "Discover bracelets, necklaces, decor, and occasion sets made with a bright East African spirit."
          ).trim() || "Discover bracelets, necklaces, decor, and occasion sets made with a bright East African spirit.",
        primaryLabel: String(hero.primaryLabel || fallbackHero.primaryLabel || "Shop Now").trim() || "Shop Now",
        primaryHref: String(hero.primaryHref || fallbackHero.primaryHref || "shop.html").trim() || "shop.html",
        secondaryLabel: String(hero.secondaryLabel || fallbackHero.secondaryLabel || "Our Story").trim() || "Our Story",
        secondaryHref: String(hero.secondaryHref || fallbackHero.secondaryHref || "about.html").trim() || "about.html",
        image: cleanImagePath(hero.image) || cleanImagePath(fallbackHero.image) || fallbackImage,
        imageAlt:
          String(hero.imageAlt || fallbackHero.imageAlt || "SharonCraft welcoming photo").trim() ||
          "SharonCraft welcoming photo"
      },
      favorite: {
        kicker: String(favorite.kicker || fallbackFavorite.kicker || "Client Favorite").trim() || "Client Favorite",
        title: String(favorite.title || fallbackFavorite.title || "").trim(),
        description: String(favorite.description || fallbackFavorite.description || "").trim(),
        image: cleanImagePath(favorite.image) || cleanImagePath(fallbackFavorite.image) || fallbackImage,
        imageAlt:
          String(favorite.imageAlt || fallbackFavorite.imageAlt || "Favorite product photo").trim() ||
          "Favorite product photo",
        productId: String(favorite.productId || fallbackFavorite.productId || "").trim()
      }
    };
  }

  function normalizeOrderStatus(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return ["new", "confirmed", "paid", "delivered", "cancelled"].includes(normalized) ? normalized : "new";
  }

  function isPublicOrderId(value) {
    return /^ORD-\d{8}-[A-Z0-9]{4}$/i.test(String(value || "").trim());
  }

  function formatOrderDateSegment(value) {
    const parsed = value ? new Date(value) : new Date();
    const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    const year = safeDate.getFullYear();
    const month = String(safeDate.getMonth() + 1).padStart(2, "0");
    const day = String(safeDate.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  function hashText(value) {
    return String(value || "")
      .split("")
      .reduce((hash, char) => ((hash * 31 + char.charCodeAt(0)) | 0), 7);
  }

  function buildOrderId(existingIds, createdAt, seedText) {
    const reservedIds = existingIds instanceof Set ? existingIds : new Set();
    const dateSegment = formatOrderDateSegment(createdAt);
    let counter = 0;
    let candidate = "";

    do {
      const suffixSource = Math.abs(hashText(`${seedText || createdAt || dateSegment}:${counter}`))
        .toString(36)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      const suffix = (suffixSource + "0000").slice(0, 4);
      candidate = `ORD-${dateSegment}-${suffix}`;
      counter += 1;
    } while (reservedIds.has(candidate));

    reservedIds.add(candidate);
    return candidate;
  }

  function buildTrackOrderUrl(orderId) {
    return new URL(`order.html?id=${encodeURIComponent(orderId)}`, window.location.href).href;
  }

  function getOrderTotal(product, quantity, area) {
    return Math.max(0, (Number(product && product.price) || 0) * Math.max(1, Number(quantity) || 1) + (Number(area && area.clientCharge) || 0));
  }

  function normalizeOrderCompareValue(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getOrderDraftSignature(order) {
    return [
      normalizeOrderCompareValue(order && order.customer),
      normalizeOrderCompareValue(order && order.phone),
      normalizeOrderCompareValue(order && order.productId),
      String(Math.max(1, Number(order && order.quantity) || 1)),
      normalizeOrderCompareValue(order && order.areaId),
      String(Math.max(0, Number(order && order.orderTotal) || 0))
    ].join("|");
  }

  function findRecentDuplicateOrder(draftOrder) {
    const draftSignature = getOrderDraftSignature(draftOrder);
    const now = Date.now();
    const duplicateWindowMs = 2 * 60 * 1000;

    return orders.find((order) => {
      const createdTime = new Date(order.createdAt || 0).getTime();
      if (!createdTime || now - createdTime > duplicateWindowMs) {
        return false;
      }
      return getOrderDraftSignature(order) === draftSignature;
    }) || null;
  }

  function getOrderStatusLabel(statusValue) {
    return (ORDER_STATUS_OPTIONS.find((status) => status.value === normalizeOrderStatus(statusValue)) || ORDER_STATUS_OPTIONS[0]).label;
  }

  function getOrderStatusClass(statusValue) {
    return `is-${normalizeOrderStatus(statusValue)}`;
  }

  function getVisibleOrders() {
    const normalizedSearch = String(orderSearchTerm || "").trim().toLowerCase();
    const normalizedFilter = normalizeOrderStatus(orderStatusFilter === "all" ? "" : orderStatusFilter);

    return orders.filter((order) => {
      if (orderStatusFilter !== "all" && normalizeOrderStatus(order.status) !== normalizedFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        order.orderId,
        order.customer,
        order.phone,
        order.productName,
        order.areaName,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      return haystack.includes(normalizedSearch);
    });
  }

  function clearOrderFeedback() {
    if (!orderFeedback) {
      return;
    }

    orderFeedback.hidden = true;
    orderFeedback.innerHTML = "";
  }

  function renderOrderFeedback(order, mode = "saved") {
    if (!orderFeedback || !order) {
      return;
    }

    const actionLabel = mode === "updated" ? "Order updated" : "Order saved";
    orderFeedback.hidden = false;
    orderFeedback.innerHTML = `
      <strong>${actionLabel}: ${order.orderId || order.id}</strong>
      <p>${order.customer || "Customer"} can now track this order with the link below.</p>
      <div class="admin-order-feedback-actions">
        <button type="button" data-order-feedback-copy="${order.id}">Copy Tracking Link</button>
        <button type="button" data-order-feedback-open="${order.id}">Open Tracking Page</button>
      </div>
    `;
  }

  function resetOrderFormState() {
    editingOrderId = null;
    if (orderForm) {
      orderForm.reset();
    }
    if (orderQuantityInput) {
      orderQuantityInput.value = 1;
    }
    if (orderStatusSelect) {
      orderStatusSelect.value = "new";
    }
    if (orderProductSelect && orderProductSelect.options.length) {
      orderProductSelect.selectedIndex = 0;
    }
    if (orderAreaSelect) {
      orderAreaSelect.value = "";
    }
    if (orderSaveButton) {
      orderSaveButton.textContent = "Save Order";
    }
    if (orderCancelEditButton) {
      orderCancelEditButton.hidden = true;
    }
  }

  function loadOrderIntoForm(orderId) {
    const order = orders.find((item) => item.id === orderId);
    if (!order) {
      return;
    }

    editingOrderId = order.id;
    orderCustomerInput.value = order.customer || "";
    orderPhoneInput.value = order.phone || "";
    orderProductSelect.value = order.productId || "";
    orderAreaSelect.value = order.areaId || "";
    orderQuantityInput.value = Math.max(1, Number(order.quantity) || 1);
    orderStatusSelect.value = normalizeOrderStatus(order.status);
    orderNoteInput.value = order.note || "";
    if (orderSaveButton) {
      orderSaveButton.textContent = "Update Order";
    }
    if (orderCancelEditButton) {
      orderCancelEditButton.hidden = false;
    }
    clearOrderFeedback();
    orderForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function normalizeOrder(order, reservedIds) {
    const createdAt = String((order && (order.createdAt || order.date)) || "").trim() || new Date().toISOString();
    const updatedAt = String((order && order.updatedAt) || "").trim() || createdAt;
    const seedText = String(
      (order && (order.orderId || order.id)) ||
      (order && order.phone) ||
      (order && order.customer) ||
      createdAt
    ).trim();
    let orderId = String((order && (order.orderId || order.id)) || "").trim();

    if (!isPublicOrderId(orderId) || (reservedIds instanceof Set && reservedIds.has(orderId))) {
      orderId = buildOrderId(reservedIds, createdAt, seedText);
    } else if (reservedIds instanceof Set) {
      reservedIds.add(orderId);
    }

    return {
      id: orderId,
      orderId,
      customer: String((order && (order.customer || order.customerName)) || "").trim() || "Walk-in customer",
      phone: String((order && order.phone) || "").trim(),
      productId: String((order && order.productId) || "").trim(),
      productName: String((order && (order.productName || order.product)) || "").trim(),
      quantity: Math.max(1, Number(order && (order.quantity || order.qty)) || 1),
      areaId: String((order && order.areaId) || "").trim(),
      areaName: String((order && (order.areaName || order.area || order.deliveryArea)) || "").trim(),
      status: normalizeOrderStatus(order && order.status),
      note: String((order && (order.note || order.adminNote)) || "").trim(),
      totalProfit: Math.max(0, Number(order && order.totalProfit) || 0),
      orderTotal: Math.max(0, Number(order && (order.orderTotal || order.total || order.price)) || 0),
      createdAt,
      updatedAt
    };
  }

  function loadLocalOrders() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(ordersKey) || "[]");
      if (!Array.isArray(saved)) {
        return [];
      }
      const reservedIds = new Set();
      return saved.map((order) => normalizeOrder(order, reservedIds));
    } catch (error) {
      return [];
    }
  }

  function mergeOrders(remoteOrders, localOrders) {
    const merged = new Map();
    const reservedIds = new Set();

    remoteOrders.map((order) => normalizeOrder(order, reservedIds)).forEach((order) => {
      merged.set(order.id, order);
    });

    localOrders.map((order) => normalizeOrder(order, reservedIds)).forEach((order) => {
      const existing = merged.get(order.id);
      if (!existing) {
        merged.set(order.id, order);
        return;
      }

      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const nextTime = new Date(order.updatedAt || order.createdAt || 0).getTime();
      if (nextTime >= existingTime) {
        merged.set(order.id, order);
      }
    });

    return Array.from(merged.values()).sort(
      (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
    );
  }

  function needsRemoteOrderSync(remoteOrders, mergedOrders) {
    const remoteMap = new Map(
      (remoteOrders || []).map((order) => [
        String(order.id || "").trim(),
        String(order.updatedAt || order.createdAt || "").trim()
      ])
    );

    if (remoteMap.size !== mergedOrders.length) {
      return true;
    }

    return mergedOrders.some((order) => remoteMap.get(order.id) !== String(order.updatedAt || order.createdAt || "").trim());
  }

  function buildDefaultCategoryImageMap(categories) {
    return new Map(
      (categories || []).map((category) => [
        category.slug,
        dedupeImages(
          defaultProducts
            .filter((product) => product.category === category.slug)
            .flatMap((product) => product.images)
            .concat(category.image || [])
        ),
      ])
    );
  }

  function getImageSeed(value, fallback = 0) {
    return String(value || fallback)
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }

  function rotateImagePool(pool, seed, count = 3) {
    if (!pool.length) {
      return [fallbackImage];
    }

    const start = seed % pool.length;
    const ordered = pool.slice(start).concat(pool.slice(0, start));
    return ordered.slice(0, Math.min(count, ordered.length));
  }

  function hasLikelyRepeatedImageIssue(products) {
    const mainImages = products.map((product) => cleanImagePath(product.images && product.images[0])).filter(Boolean);
    if (!mainImages.length) {
      return false;
    }

    const counts = mainImages.reduce((map, image) => {
      map.set(image, (map.get(image) || 0) + 1);
      return map;
    }, new Map());
    const repeatedCount = Math.max(...counts.values());
    const uniqueCount = counts.size;
    const fallbackCount = mainImages.filter((image) => image === fallbackImage).length;

    return repeatedCount >= Math.ceil(mainImages.length / 2) || fallbackCount >= Math.ceil(mainImages.length / 3) || uniqueCount <= Math.max(2, Math.floor(mainImages.length / 3));
  }

  function getRepairImagePool(product, index) {
    const currentImages = dedupeImages([].concat(product.images || []).filter(Boolean));
    const defaultImages = defaultProductImageMap.get(product.id) || [];
    const categoryImages = defaultCategoryImageMap.get(product.category) || [];
    const pool = dedupeImages(
      defaultImages
        .concat(currentImages.filter((image) => image !== fallbackImage))
        .concat(categoryImages)
        .concat(curatedLibraryImages)
    );

    return rotateImagePool(pool, getImageSeed(product.id, index), 3);
  }

  function repairCatalogImages(products) {
    const normalizedProducts = products.map((product, index) => normalizeProduct(product, index));
    const mainImageCounts = normalizedProducts.reduce((map, product) => {
      const image = cleanImagePath(product.images && product.images[0]) || fallbackImage;
      map.set(image, (map.get(image) || 0) + 1);
      return map;
    }, new Map());

    return normalizedProducts.map((product, index) => {
      const currentMain = cleanImagePath(product.images && product.images[0]) || fallbackImage;
      const hasDefaultMapping = defaultProductImageMap.has(product.id);
      const currentImages = dedupeImages((product.images || []).filter(Boolean));
      const needsRepair =
        hasDefaultMapping ||
        currentImages.length < 2 ||
        currentMain === fallbackImage ||
        (mainImageCounts.get(currentMain) || 0) > 1;

      if (!needsRepair) {
        return product;
      }

      return {
        ...product,
        images: getRepairImagePool(product, index),
      };
    });
  }

  async function loadCatalog() {
    try {
      // Try to load from Supabase first
      if (window.SharonCraftCatalog && window.SharonCraftCatalog.isConfigured()) {
        const supabaseProducts = await window.SharonCraftCatalog.fetchProducts();
        if (supabaseProducts && supabaseProducts.length > 0) {
          console.log('Loaded catalog from Supabase:', supabaseProducts.length, 'products');
          return supabaseProducts.map((product, index) => normalizeProduct(product, index));
        }
      }

      // Fallback to localStorage
      const saved = window.localStorage.getItem(storageKey);
      const raw = saved ? JSON.parse(saved) : defaultProducts;
      console.log('Loaded catalog from localStorage');
      return raw.map((product, index) => normalizeProduct(product, index));
    } catch (error) {
      console.error('Failed to load catalog:', error);
      return defaultProducts.map((product, index) => normalizeProduct(product, index));
    }
  }

  let catalog = await loadCatalog();
  const repairedCatalogOnLoad = hasLikelyRepeatedImageIssue(catalog);
  if (repairedCatalogOnLoad) {
    catalog = repairCatalogImages(catalog);
    safeLocalStorageSetItem(storageKey, JSON.stringify(catalog), "catalog");
  }
  let editingId = null;
  let temporaryMainPreviewSrc = "";
  const socialDefaults = utils.data.site.socials.map((social) => ({ label: social.label, url: social.url }));
  const socialLabels = ["WhatsApp", "Instagram", "Facebook", "TikTok"];
  const defaultDeliveryAreas = [
    { id: "delivery-nairobi-town", name: "Nairobi Town", clientCharge: 500, realCost: 200 },
    { id: "delivery-nearby-stage", name: "Nearby Stage", clientCharge: 300, realCost: 120 },
    { id: "delivery-outskirts", name: "Outskirts", clientCharge: 800, realCost: 450 }
  ];
  const defaultPlanner = [
    { day: "Monday", theme: "New arrival spotlight", note: "Show one fresh product with a bright detail shot." },
    { day: "Tuesday", theme: "Customer style idea", note: "Post one simple way to wear or use a SharonCraft piece." },
    { day: "Wednesday", theme: "Behind the craft", note: "Share a making process, bead pattern, or close-up texture." },
    { day: "Thursday", theme: "Gift reminder", note: "Push gifting, birthdays, weddings, and thank-you moments." },
    { day: "Friday", theme: "Weekend feature", note: "Highlight your boldest product and invite WhatsApp orders." }
  ];
  const ORDER_STATUS_OPTIONS = [
    { value: "new", label: "New" },
    { value: "confirmed", label: "Confirmed" },
    { value: "paid", label: "Paid" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];
  const defaultReplyTemplates = [
    {
      id: "reply-new-inquiry",
      title: "Warm first reply",
      category: "new-inquiry",
      message:
        "Hi [Customer Name], thank you for reaching SharonCraft. [Product Name] is available for [Price]. I can help you order and share delivery details right away."
    },
    {
      id: "reply-payment-guide",
      title: "M-Pesa payment guide",
      category: "payment",
      message:
        "Thank you for your order. You can send payment to [M-Pesa Number]. After payment, kindly share the confirmation message so I can prepare your delivery."
    },
    {
      id: "reply-delivery-update",
      title: "Delivery update",
      category: "delivery",
      message:
        "Hello [Customer Name], your order is on the way to [Delivery Area]. I will update you again once it is close. Thank you for shopping with SharonCraft."
    }
  ];

  const list = document.getElementById("admin-product-list");
  const form = document.getElementById("admin-form");
  const nameInput = document.getElementById("admin-name");
  const suggestNameButton = document.getElementById("admin-suggest-name");
  const categoryInput = document.getElementById("admin-category");
  const priceInput = document.getElementById("admin-price");
  const momPriceInput = document.getElementById("admin-mom-price");
  const deliveryChargeInput = document.getElementById("admin-delivery-charge");
  const deliveryCostInput = document.getElementById("admin-delivery-cost");
  const totalProfitInput = document.getElementById("admin-total-profit");
  const sourceInput = document.getElementById("admin-source");
  const stockQtyInput = document.getElementById("admin-stock-qty");
  const reservedQtyInput = document.getElementById("admin-reserved-qty");
  const badgeInput = document.getElementById("admin-badge");
  const imageInput = document.getElementById("admin-image");
  const galleryInput = document.getElementById("admin-gallery-images");
  const imageFileInput = document.getElementById("admin-image-file");
  const imagePreview = document.getElementById("admin-image-preview");
  const selectedGallery = document.getElementById("admin-selected-gallery");
  const imageLibrary = document.getElementById("admin-image-library");
  const imageLibrarySearch = document.getElementById("admin-image-search");
  const refreshGalleryButton = document.getElementById("admin-refresh-gallery");
  const inlineImageLibrary = document.getElementById("admin-inline-image-library");
  const inlineImageSearch = document.getElementById("admin-inline-image-search");
  const inlineRefreshGalleryButton = document.getElementById("admin-inline-refresh-gallery");
  const descriptionInput = document.getElementById("admin-description");
  const descriptionStarterButton = document.getElementById("admin-description-starter");
  const detailsInput = document.getElementById("admin-details");
  const featuredInput = document.getElementById("admin-featured");
  const newInput = document.getElementById("admin-new");
  const formTitle = document.getElementById("admin-form-title");
  const status = document.getElementById("admin-status");
  const preview = document.getElementById("admin-json-preview");
  const addButton = document.getElementById("admin-add-product");
  const resetButton = document.getElementById("admin-reset");
  const repairImagesButton = document.getElementById("admin-repair-images");
  const saveButton = document.getElementById("admin-save");
  const previewPageSelect = document.getElementById("admin-preview-page");
  const previewReloadButton = document.getElementById("admin-preview-reload");
  const previewOpenLink = document.getElementById("admin-preview-open");
  const previewFrame = document.getElementById("admin-preview-frame");
  const searchInput = document.getElementById("admin-product-search");
  const categoryFilter = document.getElementById("admin-product-filter");
  const catalogSummary = document.getElementById("admin-catalog-summary");
  const categoryList = document.getElementById("admin-category-list");
  const categoryEditorForm = document.getElementById("admin-category-form");
  const categoryNameInput = document.getElementById("admin-category-name");
  const categoryAccentInput = document.getElementById("admin-category-accent");
  const categoryTipInput = document.getElementById("admin-category-tip");
  const categoryDescriptionInput = document.getElementById("admin-category-description");
  const categoryImageInput = document.getElementById("admin-category-image");
  const categoryImageSearchInput = document.getElementById("admin-category-image-search");
  const categoryImageLibrary = document.getElementById("admin-category-image-library");
  const categoryPreviewCard = document.getElementById("admin-category-preview-card");
  const categoryPreviewImage = document.getElementById("admin-category-preview-image");
  const categoryPreviewName = document.getElementById("admin-category-preview-name");
  const categoryPreviewTip = document.getElementById("admin-category-preview-tip");
  const categoryPreviewCount = document.getElementById("admin-category-preview-count");
  const visualStoryForm = document.getElementById("admin-visual-story-form");
  const visualNavButtons = document.querySelectorAll("[data-visual-section]");
  const visualPanels = document.querySelectorAll("[data-visual-panel]");
  const heroKickerInput = document.getElementById("admin-hero-kicker");
  const heroTitleInput = document.getElementById("admin-hero-title");
  const heroDescriptionInput = document.getElementById("admin-hero-description");
  const heroPrimaryLabelInput = document.getElementById("admin-hero-primary-label");
  const heroPrimaryHrefInput = document.getElementById("admin-hero-primary-href");
  const heroSecondaryLabelInput = document.getElementById("admin-hero-secondary-label");
  const heroSecondaryHrefInput = document.getElementById("admin-hero-secondary-href");
  const heroImageInput = document.getElementById("admin-hero-image");
  const heroImageAltInput = document.getElementById("admin-hero-image-alt");
  const heroImageUploadInput = document.getElementById("admin-hero-image-upload");
  const heroImagePreview = document.getElementById("admin-hero-image-preview");
  const favoriteKickerInput = document.getElementById("admin-favorite-kicker");
  const favoriteProductSelect = document.getElementById("admin-favorite-product");
  const favoriteTitleInput = document.getElementById("admin-favorite-title");
  const favoriteDescriptionInput = document.getElementById("admin-favorite-description");
  const favoriteImageInput = document.getElementById("admin-favorite-image");
  const favoriteImageAltInput = document.getElementById("admin-favorite-image-alt");
  const favoriteImageUploadInput = document.getElementById("admin-favorite-image-upload");
  const favoriteImagePreview = document.getElementById("admin-favorite-image-preview");
  const visualImageSearchInput = document.getElementById("admin-visual-image-search");
  const visualImageLibrary = document.getElementById("admin-visual-image-library");
  const visualPreviewKicker = document.getElementById("admin-visual-preview-kicker");
  const visualPreviewTitle = document.getElementById("admin-visual-preview-title");
  const visualPreviewDescription = document.getElementById("admin-visual-preview-description");
  const visualPreviewPrimary = document.getElementById("admin-visual-preview-primary");
  const visualPreviewSecondary = document.getElementById("admin-visual-preview-secondary");
  const visualPreviewImage = document.getElementById("admin-visual-preview-image");
  const visualFavoritePreviewImage = document.getElementById("admin-visual-favorite-preview-image");
  const visualFavoritePreviewKicker = document.getElementById("admin-visual-favorite-preview-kicker");
  const visualFavoritePreviewTitle = document.getElementById("admin-visual-favorite-preview-title");
  const visualFavoritePreviewDescription = document.getElementById("admin-visual-favorite-preview-description");
  const featureFilter = document.getElementById("admin-feature-filter");
  const featuredSummary = document.getElementById("admin-featured-summary");
  const featuredManager = document.getElementById("admin-featured-manager");
  const featuredSearchInput = document.getElementById("admin-featured-search");
  const featuredCandidates = document.getElementById("admin-featured-candidates");
  const salesMetrics = document.getElementById("admin-sales-metrics");
  const salesChart = document.getElementById("admin-sales-chart");
  const salesTable = document.getElementById("admin-sales-table");
  const resetSalesButton = document.getElementById("admin-reset-sales");
  const orderForm = document.getElementById("admin-order-form");
  const orderSaveButton = orderForm ? orderForm.querySelector('button[type="submit"]') : null;
  const orderCustomerInput = document.getElementById("admin-order-customer");
  const orderPhoneInput = document.getElementById("admin-order-phone");
  const orderProductSelect = document.getElementById("admin-order-product");
  const orderAreaSelect = document.getElementById("admin-order-area");
  const orderQuantityInput = document.getElementById("admin-order-quantity");
  const orderStatusSelect = document.getElementById("admin-order-status");
  const orderNoteInput = document.getElementById("admin-order-note");
  const orderFeedback = document.getElementById("admin-order-feedback");
  const orderMetrics = document.getElementById("admin-order-metrics");
  const orderSearchInput = document.getElementById("admin-order-search");
  const orderFilterSelect = document.getElementById("admin-order-filter");
  const orderList = document.getElementById("admin-order-list");
  const orderClearButton = document.getElementById("admin-order-clear");
  const orderCancelEditButton = document.getElementById("admin-order-cancel-edit");
  const deliveryForm = document.getElementById("admin-delivery-form");
  const deliveryNameInput = document.getElementById("admin-delivery-name");
  const deliveryClientChargeInput = document.getElementById("admin-delivery-client-charge");
  const deliveryRealCostInput = document.getElementById("admin-delivery-real-cost");
  const deliveryList = document.getElementById("admin-delivery-list");
  const expenseForm = document.getElementById("admin-expense-form");
  const expenseNameInput = document.getElementById("admin-expense-name");
  const expenseAmountInput = document.getElementById("admin-expense-amount");
  const expenseNoteInput = document.getElementById("admin-expense-note");
  const expenseSummary = document.getElementById("admin-expense-summary");
  const expenseList = document.getElementById("admin-expense-list");
  const stockList = document.getElementById("admin-stock-list");
  const draftBadge = document.getElementById("admin-draft-badge");
  const draftImage = document.getElementById("admin-draft-image");
  const draftCategory = document.getElementById("admin-draft-category");
  const draftTitle = document.getElementById("admin-draft-title");
  const draftDescription = document.getElementById("admin-draft-description");
  const draftPrice = document.getElementById("admin-draft-price");
  const draftProfit = document.getElementById("admin-draft-profit");
  const draftGallery = document.getElementById("admin-draft-gallery");
  const adminTabButtons = document.querySelectorAll("[data-admin-tab]");
  const adminTabPanels = document.querySelectorAll("[data-admin-panel]");
  const adminTabGroups = document.querySelectorAll("[data-admin-group]");
  const adminGroupToggleButtons = document.querySelectorAll("[data-admin-group-toggle]");
  const adminTabSearchInput = document.getElementById("admin-tab-search");
  const adminSearchResults = document.getElementById("admin-search-results");
  const adminToggleGuidanceButton = document.getElementById("admin-toggle-guidance");
  const adminCollapsePanelsButton = document.getElementById("admin-collapse-panels");
  const adminExpandPanelsButton = document.getElementById("admin-expand-panels");
  const profitMetrics = document.getElementById("admin-profit-metrics");
  const profitTable = document.getElementById("admin-profit-table");
  const resetProfitButton = document.getElementById("admin-reset-profit");
  const profitProductSelect = document.getElementById("admin-profit-product");
  const profitQuantityInput = document.getElementById("admin-profit-quantity");
  const profitOrderMomPriceInput = document.getElementById("admin-profit-order-mom-price");
  const profitOrderPriceInput = document.getElementById("admin-profit-order-price");
  const profitOrderDeliveryChargeInput = document.getElementById("admin-profit-order-delivery-charge");
  const profitOrderDeliveryCostInput = document.getElementById("admin-profit-order-delivery-cost");
  const profitBreakdown = document.getElementById("admin-profit-breakdown");
  const socialForm = document.getElementById("admin-social-form");
  const socialWhatsappInput = document.getElementById("admin-social-whatsapp");
  const socialInstagramInput = document.getElementById("admin-social-instagram");
  const socialFacebookInput = document.getElementById("admin-social-facebook");
  const socialTiktokInput = document.getElementById("admin-social-tiktok");
  const socialProductSelect = document.getElementById("admin-social-product");
  const socialToneSelect = document.getElementById("admin-social-tone");
  const socialCaption = document.getElementById("admin-social-caption");
  const generateCaptionButton = document.getElementById("admin-generate-caption");
  const copyCaptionButton = document.getElementById("admin-copy-caption");
  const socialCalendar = document.getElementById("admin-social-calendar");
  const socialLinksPreview = document.getElementById("admin-social-links-preview");
  const socialMedia = document.getElementById("admin-social-media");
  const socialTracker = document.getElementById("admin-social-tracker");
  const goalForm = document.getElementById("admin-goal-form");
  const goalTargetInput = document.getElementById("admin-goal-target");
  const goalSavedInput = document.getElementById("admin-goal-saved");
  const goalNoteInput = document.getElementById("admin-goal-note");
  const goalCard = document.getElementById("admin-goal-card");
  const growthMetrics = document.getElementById("admin-growth-metrics");
  const growthMonthly = document.getElementById("admin-growth-monthly");
  const customerSearchInput = document.getElementById("admin-customer-search");
  const customerMetrics = document.getElementById("admin-customer-metrics");
  const customerList = document.getElementById("admin-customer-list");
  const customerHighlight = document.getElementById("admin-customer-highlight");
  const customerFollowups = document.getElementById("admin-customer-followups");
  const bundleForm = document.getElementById("admin-bundle-form");
  const bundleNameInput = document.getElementById("admin-bundle-name");
  const bundlePriceInput = document.getElementById("admin-bundle-price");
  const bundleNoteInput = document.getElementById("admin-bundle-note");
  const bundleProductPicker = document.getElementById("admin-bundle-product-picker");
  const bundleMetrics = document.getElementById("admin-bundle-metrics");
  const bundleList = document.getElementById("admin-bundle-list");
  const deliveryMetrics = document.getElementById("admin-delivery-metrics");
  const deliveryBoard = document.getElementById("admin-delivery-board");
  const deliveryFocus = document.getElementById("admin-delivery-focus");
  const replyForm = document.getElementById("admin-reply-form");
  const replyTitleInput = document.getElementById("admin-reply-title");
  const replyCategoryInput = document.getElementById("admin-reply-category");
  const replyMessageInput = document.getElementById("admin-reply-message");
  const replyList = document.getElementById("admin-reply-list");
  const adminOverviewGrid = document.getElementById("admin-overview-grid");
  const adminCommandSummary = document.getElementById("admin-command-summary");
  const adminGlobalSearchInput = document.getElementById("admin-global-search");
  const adminGlobalResults = document.getElementById("admin-global-results");
  const adminLowStockList = document.getElementById("admin-low-stock-list");
  const mpesaClearAllButton = document.getElementById("admin-mpesa-clear-all");
  const mpesaOverview = document.getElementById("admin-mpesa-overview");
  const mpesaQueue = document.getElementById("admin-mpesa-queue");
  const mpesaLog = document.getElementById("admin-mpesa-log");
  const mpesaRecon = document.getElementById("admin-mpesa-recon");
  const mpesaReconNote = document.getElementById("admin-mpesa-recon-note");
  const mpesaReconActions = document.getElementById("admin-mpesa-recon-actions");
  const analyticsSummary = document.getElementById("admin-analytics-summary");
  const analyticsConversions = document.getElementById("admin-analytics-conversions");
  const analyticsProductsTitle = document.getElementById("admin-analytics-products-title");
  const analyticsProducts = document.getElementById("admin-analytics-products");
  const analyticsSources = document.getElementById("admin-analytics-sources");
  const analyticsPages = document.getElementById("admin-analytics-pages");
  const analyticsFeed = document.getElementById("admin-analytics-feed");
  const analyticsRangeLabel = document.getElementById("admin-analytics-range-label");
  const analyticsRefreshButton = document.getElementById("admin-analytics-refresh");
  const analyticsClearButton = document.getElementById("admin-analytics-clear");
  const analyticsRangeButtons = document.querySelectorAll("[data-analytics-range]");
  const liveAuthState = document.getElementById("admin-live-auth-state");
  const liveAuthForm = document.getElementById("admin-live-auth-form");
  const liveEmailInput = document.getElementById("admin-live-email");
  const livePasswordInput = document.getElementById("admin-live-password");
  const liveSignOutButton = document.getElementById("admin-live-sign-out");
  const adminTabStorageKey = "sharoncraft-admin-active-tab";
  const analyticsRangeStorageKey = "sharoncraft-admin-analytics-range";
  const adminGuidanceStorageKey = "sharoncraft-admin-guidance-hidden";
  const adminCollapsedPanelsStorageKey = "sharoncraft-admin-collapsed-panels";
  const adminCollapsedGroupsStorageKey = "sharoncraft-admin-collapsed-groups";
  const defaultMpesaMarkup = {
    overview: mpesaOverview ? mpesaOverview.innerHTML : "",
    queue: mpesaQueue ? mpesaQueue.innerHTML : "",
    log: mpesaLog ? mpesaLog.innerHTML : "",
    recon: mpesaRecon ? mpesaRecon.innerHTML : "",
    reconNote: mpesaReconNote ? mpesaReconNote.textContent : ""
  };
  let currentLiveUser = null;
  let isSavingOrder = false;
  let editingOrderId = null;
  let orderSearchTerm = "";
  let orderStatusFilter = "all";
  let expandedOrderId = null;
  let customerSearchTerm = "";
  let selectedCustomerKey = "";
  let selectedDeliveryOrderId = "";
  let remoteStorefrontAnalyticsEvents = [];
  let analyticsDataSource = "browser";
  let analyticsRange = String(window.localStorage.getItem(analyticsRangeStorageKey) || "7d").trim() || "7d";
  let mpesaDashboard = loadMpesaDashboard();
  let adminGuidanceHidden = loadStoredFlag(adminGuidanceStorageKey, true);
  let collapsedAdminPanels = loadStoredStringArray(adminCollapsedPanelsStorageKey);
  let collapsedAdminGroups = loadStoredStringArray(adminCollapsedGroupsStorageKey);

  function loadSocialSettings() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(socialSettingsKey) || "null");
      if (!Array.isArray(saved)) {
        return socialDefaults.map((social) => ({ ...social }));
      }

      return socialLabels.map((label) => {
        const match = saved.find((social) => String(social.label || "").toLowerCase() === label.toLowerCase());
        const fallback = socialDefaults.find((social) => social.label === label) || { label, url: "#" };
        return {
          label,
          url: match && String(match.url || "").trim() ? String(match.url || "").trim() : fallback.url
        };
      });
    } catch (error) {
      return socialDefaults.map((social) => ({ ...social }));
    }
  }

  function loadSocialPlanner() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(socialPlannerKey) || "null");
      if (!Array.isArray(saved)) {
        return defaultPlanner.map((item) => ({ ...item }));
      }

      return defaultPlanner.map((item, index) => ({
        day: item.day,
        theme: String((saved[index] && saved[index].theme) || item.theme),
        note: String((saved[index] && saved[index].note) || item.note)
      }));
    } catch (error) {
      return defaultPlanner.map((item) => ({ ...item }));
    }
  }

  async function loadOrders() {
    const localOrders = loadLocalOrders();

    if (
      !liveCatalogApi ||
      typeof liveCatalogApi.isConfigured !== "function" ||
      typeof liveCatalogApi.fetchOrders !== "function" ||
      typeof liveCatalogApi.saveOrders !== "function" ||
      !liveCatalogApi.isConfigured()
    ) {
      return localOrders;
    }

    const user = await refreshLiveUser();
    if (!user) {
      return localOrders;
    }

    try {
      const remoteOrders = (await liveCatalogApi.fetchOrders()).map((order) => normalizeOrder(order));
      const mergedOrders = mergeOrders(remoteOrders, localOrders);
      safeLocalStorageSetItem(ordersKey, JSON.stringify(mergedOrders), "orders");

      return mergedOrders;
    } catch (error) {
      console.error("Unable to load live orders from Supabase.", error);
      return localOrders;
    }
  }

  function loadDeliveryAreas() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(deliveryAreasKey) || "null");
      return Array.isArray(saved) && saved.length ? saved : defaultDeliveryAreas.map((area) => ({ ...area }));
    } catch (error) {
      return defaultDeliveryAreas.map((area) => ({ ...area }));
    }
  }

  function loadExpenses() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(expensesKey) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function loadGoal() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(goalKey) || "null");
      if (!saved || typeof saved !== "object") {
        return { target: 0, saved: 0, note: "" };
      }

      return {
        target: Number(saved.target) || 0,
        saved: Number(saved.saved) || 0,
        note: String(saved.note || "")
      };
    } catch (error) {
      return { target: 0, saved: 0, note: "" };
    }
  }

  function loadBundles() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(bundlesKey) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function loadHomeVisuals() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(homeVisualsSettingsKey) || "null");
      return normalizeHomeVisuals(saved || defaultHomeVisualSource);
    } catch (error) {
      return normalizeHomeVisuals(defaultHomeVisualSource);
    }
  }

  function loadReplyTemplates() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(replyTemplatesKey) || "null");
      if (!Array.isArray(saved) || !saved.length) {
        return defaultReplyTemplates.map((template) => ({ ...template }));
      }
      return saved;
    } catch (error) {
      return defaultReplyTemplates.map((template) => ({ ...template }));
    }
  }

  let socialSettings = loadSocialSettings();
  let homeVisuals = loadHomeVisuals();
  let socialPlanner = loadSocialPlanner();
  let orders = await loadOrders();
  let deliveryAreas = loadDeliveryAreas();
  let expenses = loadExpenses();
  let bundles = loadBundles();
  let replyTemplates = loadReplyTemplates();
  let kioskGoal = loadGoal();
  let editingBundleId = null;
  let editingReplyId = null;
  let editingCategorySlug = categoryCatalog[0] ? categoryCatalog[0].slug : "";
  let activeVisualSection = "hero";
  let activeFeaturedSlotIndex = 0;
  let uploadedImageCounter = 0;
  const uploadedImageTokenPrefix = "__uploaded_image__:";
  const uploadedImageRegistry = new Map();
  const FEATURED_SLOT_COUNT = 4;

  function safeLocalStorageSetItem(key, value, label) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Unable to save ${label || key} to localStorage.`, error);
      return false;
    }
  }

  function dedupeImages(images) {
    return images.map(cleanImagePath).filter(Boolean).filter((path, index, listRef) => listRef.indexOf(path) === index);
  }

  function cleanImagePath(path) {
    return (path || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getImageLabel(image) {
    const normalized = cleanImagePath(image);
    return normalized.split("/").pop() || normalized || "Image";
  }

  function getFilteredProjectImages(query, options) {
    const settings = options || {};
    const normalizedQuery = String(query || "").trim().toLowerCase();
    const sourceImages = Array.isArray(settings.pool) && settings.pool.length ? settings.pool : availableImages;
    const filtered = sourceImages.filter((image) => {
      if (settings.extensions && !settings.extensions.test(image)) {
        return false;
      }

      return !normalizedQuery || image.toLowerCase().includes(normalizedQuery);
    });

    return Number.isFinite(settings.limit) ? filtered.slice(0, settings.limit) : filtered;
  }

  function renderProjectImageLibrary(target, images, emptyTitle, emptyText) {
    if (!target) {
      return;
    }

    target.innerHTML = images.length
      ? images
        .map(
          (image) => `
            <article class="admin-library-item">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(getImageLabel(image))}" loading="lazy" />
              <div class="admin-library-copy">
                <span>${escapeHtml(getImageLabel(image))}</span>
                <div class="admin-library-actions">
                  <button type="button" data-action="main" data-image="${escapeHtml(image)}">Use as Main</button>
                  <button type="button" data-action="gallery" data-image="${escapeHtml(image)}">Add to Gallery</button>
                </div>
              </div>
            </article>
          `
        )
        .join("")
      : `
          <article class="empty-state-card">
            <strong>${escapeHtml(emptyTitle)}</strong>
            <p>${escapeHtml(emptyText)}</p>
          </article>
        `;
  }

  function isEmbeddedImage(path) {
    return cleanImagePath(path).startsWith("data:image/");
  }

  function createUploadedImageToken() {
    uploadedImageCounter += 1;
    return `${uploadedImageTokenPrefix}${Date.now()}-${uploadedImageCounter}`;
  }

  function registerUploadedImage(source) {
    const normalized = cleanImagePath(source);
    if (!isEmbeddedImage(normalized)) {
      return normalized;
    }

    const existingEntry = Array.from(uploadedImageRegistry.entries()).find((entry) => entry[1] === normalized);
    if (existingEntry) {
      return existingEntry[0];
    }

    const token = createUploadedImageToken();
    uploadedImageRegistry.set(token, normalized);
    return token;
  }

  function resolveImageSource(path) {
    const normalized = cleanImagePath(path);
    return uploadedImageRegistry.get(normalized) || normalized;
  }

  function toFormImageValue(path) {
    const normalized = cleanImagePath(path);
    return isEmbeddedImage(normalized) ? registerUploadedImage(normalized) : normalized;
  }

  function slugify(value) {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function formatPrice(value) {
    return utils.formatCurrency(Number(value) || 0);
  }

  function formatDate(value) {
    if (!value) {
      return "No date";
    }

    try {
      return new Date(value).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch (error) {
      return String(value);
    }
  }

  function toTitleCase(value) {
    return String(value || "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function findKeywordLabel(text, entries) {
    const source = String(text || "").toLowerCase();
    const match = entries.find((entry) => entry.patterns.some((pattern) => source.includes(pattern)));
    return match ? match.label : "";
  }

  function uniquePhrases(values) {
    return values.filter(Boolean).filter((value, index, listRef) => listRef.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index);
  }

  function inferProductType(category, text) {
    const source = String(text || "").toLowerCase();

    if (source.includes("mirror")) {
      return "mirror set";
    }
    if (source.includes("placemat") || source.includes("table")) {
      return "placemat set";
    }
    if (source.includes("bag") || source.includes("carry")) {
      return "beaded bag";
    }
    if (source.includes("bracelet")) {
      return "bracelet";
    }
    if (source.includes("collar")) {
      return "collar necklace";
    }
    if (source.includes("necklace")) {
      return "necklace";
    }
    if (source.includes("gift set") || source.includes("matching set") || source.includes("set")) {
      return "gift set";
    }

    const categoryTypeMap = {
      necklaces: "necklace",
      bracelets: "bracelet",
      "home-decor": "decor piece",
      "bags-accessories": "beaded bag",
      "gift-sets": "gift set",
      "bridal-occasion": "occasion set"
    };

    return categoryTypeMap[category] || "handmade piece";
  }

  function buildSuggestedProductName() {
    const category = categoryInput.value;
    const source = [descriptionInput.value, detailsInput.value, badgeInput.value].join(" ").toLowerCase();
    const colorLabel = findKeywordLabel(source, [
      { patterns: ["sky blue", "blue", "navy", "turquoise"], label: "Blue" },
      { patterns: ["white", "ivory", "cream"], label: "Ivory" },
      { patterns: ["green", "kijani"], label: "Green" },
      { patterns: ["yellow", "gold", "golden"], label: "Golden" },
      { patterns: ["red", "coral"], label: "Coral" },
      { patterns: ["black"], label: "Black" },
      { patterns: ["pink"], label: "Pink" },
      { patterns: ["purple"], label: "Purple" },
      { patterns: ["orange"], label: "Orange" },
      { patterns: ["rainbow", "colorful", "colourful", "multicolor", "multi-color"], label: "Color Pop" }
    ]);
    const moodLabel = findKeywordLabel(source, [
      { patterns: ["bridal", "wedding", "bride"], label: "Bridal" },
      { patterns: ["royal", "regal"], label: "Royal" },
      { patterns: ["gift"], label: "Gift" },
      { patterns: ["kenya", "kenyan"], label: "Kenya Pride" },
      { patterns: ["fringe", "tassel"], label: "Fringe" },
      { patterns: ["loop"], label: "Loop" },
      { patterns: ["layered", "cascade"], label: "Cascade" },
      { patterns: ["bold", "statement"], label: "Statement" },
      { patterns: ["mirror"], label: "Mirror" },
      { patterns: ["home", "decor"], label: "Home" },
      { patterns: ["elegant", "graceful"], label: "Elegant" },
      { patterns: ["round"], label: "Round" }
    ]);
    const defaultLabelMap = {
      necklaces: "Beaded",
      bracelets: "Handmade",
      "home-decor": "Handmade",
      "bags-accessories": "Artisan",
      "gift-sets": "Gift",
      "bridal-occasion": "Occasion"
    };
    const typeLabel = inferProductType(category, source);
    const typeNameMap = {
      "mirror set": "Mirror Set",
      "placemat set": "Placemat Set",
      "beaded bag": "Bag",
      bracelet: "Bracelet",
      "collar necklace": "Collar Necklace",
      necklace: "Necklace",
      "gift set": "Gift Set",
      "occasion set": "Occasion Set",
      "decor piece": "Decor Piece",
      "handmade piece": "Handmade Piece"
    };
    const typeLabelTitle = typeNameMap[typeLabel] || toTitleCase(typeLabel);
    const suggestion = uniquePhrases([colorLabel, moodLabel, defaultLabelMap[category], typeLabelTitle]).join(" ");
    return suggestion || "Handmade Product";
  }

  function buildDescriptionStarter() {
    const category = categoryInput.value;
    const source = [descriptionInput.value, detailsInput.value, badgeInput.value, nameInput.value].join(" ").toLowerCase();
    const typeLabel = inferProductType(category, source);
    const useCaseMap = {
      necklace: "birthdays, events, and everyday styling",
      "collar necklace": "celebrations, photos, and bold outfits",
      bracelet: "daily wear, gifting, and matching sets",
      "mirror set": "bedrooms, hallways, and warm home styling",
      "placemat set": "hosting, dining tables, and thoughtful house gifts",
      "beaded bag": "casual outings, gifting, and statement looks",
      "gift set": "birthdays, thank-you gifts, and special surprises",
      "occasion set": "weddings, traditional events, and standout moments",
      "decor piece": "home styling, gifting, and bright everyday spaces",
      "handmade piece": "gifting, personal use, and special moments"
    };
    const highlightLabel = findKeywordLabel(source, [
      { patterns: ["sky blue", "blue", "navy", "turquoise"], label: "beautiful blue tones" },
      { patterns: ["white", "ivory", "cream"], label: "a clean ivory finish" },
      { patterns: ["green", "kijani"], label: "fresh green detail" },
      { patterns: ["yellow", "gold", "golden"], label: "warm golden highlights" },
      { patterns: ["rainbow", "colorful", "colourful", "multicolor", "multi-color"], label: "bright colorful beadwork" },
      { patterns: ["fringe", "tassel"], label: "soft fringe movement" },
      { patterns: ["mirror"], label: "a handmade beaded frame" },
      { patterns: ["layered", "cascade"], label: "a layered handcrafted look" }
    ]);
    const useCase = useCaseMap[typeLabel] || useCaseMap["handmade piece"];
    const productName = nameInput.value.trim() || buildSuggestedProductName();
    const opening = `${productName} is a handmade ${typeLabel}${highlightLabel ? ` with ${highlightLabel}` : ""}.`;
    const closing = `It works well for ${useCase} and makes a thoughtful gift or special statement piece.`;
    return `${opening} ${closing}`;
  }

  function formatDateLabel(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return "Recent";
    }
    return date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  }

  function getMonthKey(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      const fallback = new Date();
      return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, "0")}`;
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function formatMonthKey(monthKey) {
    const [year, month] = String(monthKey || "").split("-");
    if (!year || !month) {
      return "This month";
    }
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-KE", {
      month: "short",
      year: "numeric"
    });
  }

  function getCustomerKey(order) {
    return String(order.phone || order.customer || `customer-${order.id || ""}`).trim().toLowerCase();
  }

  function getCustomerRecords() {
    const customerMap = new Map();

    orders.forEach((order) => {
      const key = getCustomerKey(order);
      const existing = customerMap.get(key) || {
        key,
        customer: order.customer || "Customer",
        phone: order.phone || "",
        orders: 0,
        totalProfit: 0,
        totalUnits: 0,
        lastOrderAt: order.createdAt || "",
        products: new Set()
      };

      existing.customer = order.customer || existing.customer;
      existing.phone = order.phone || existing.phone;
      existing.orders += 1;
      existing.totalProfit += Number(order.totalProfit) || 0;
      existing.totalUnits += Number(order.quantity) || 0;
      existing.lastOrderAt =
        new Date(order.createdAt || 0).getTime() > new Date(existing.lastOrderAt || 0).getTime()
          ? order.createdAt
          : existing.lastOrderAt;
      if (order.productName) {
        existing.products.add(order.productName);
      }

      customerMap.set(key, existing);
    });

    return Array.from(customerMap.values())
      .map((customer) => ({
        ...customer,
        products: Array.from(customer.products)
      }))
      .sort((left, right) => {
        if (right.orders !== left.orders) {
          return right.orders - left.orders;
        }
        return right.totalProfit - left.totalProfit;
      });
  }

  function getFilteredCustomerRecords() {
    const normalizedQuery = String(customerSearchTerm || "").trim().toLowerCase();
    const customers = getCustomerRecords();
    if (!normalizedQuery) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.customer,
        customer.phone,
        customer.products.join(" "),
        formatDateLabel(customer.lastOrderAt)
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }

  function getOrdersForCustomer(customerKey) {
    return orders
      .filter((order) => getCustomerKey(order) === customerKey)
      .sort((left, right) => new Date(right.updatedAt || right.createdAt || 0).getTime() - new Date(left.updatedAt || left.createdAt || 0).getTime());
  }

  function buildWhatsappLink(phone) {
    const digits = String(phone || "").replace(/[^\d]/g, "");
    return digits ? `https://wa.me/${digits}` : "";
  }

  const deliveryStatusFlow = ["new", "confirmed", "paid", "delivered"];

  function getNextOrderStatusValue(statusValue) {
    const normalized = normalizeOrderStatus(statusValue);
    const currentIndex = deliveryStatusFlow.indexOf(normalized);
    if (currentIndex < 0 || currentIndex === deliveryStatusFlow.length - 1) {
      return normalized;
    }
    return deliveryStatusFlow[currentIndex + 1];
  }

  function getPreviousOrderStatusValue(statusValue) {
    const normalized = normalizeOrderStatus(statusValue);
    const currentIndex = deliveryStatusFlow.indexOf(normalized);
    if (currentIndex <= 0) {
      return normalized;
    }
    return deliveryStatusFlow[currentIndex - 1];
  }

  function getOrderPriorityWeight(order) {
    const normalized = normalizeOrderStatus(order && order.status);
    const weights = {
      paid: 0,
      confirmed: 1,
      new: 2,
      delivered: 3,
      cancelled: 4
    };
    return weights[normalized] != null ? weights[normalized] : 5;
  }

  function getMonthlyGrowthData() {
    const monthMap = new Map();

    function ensureMonth(monthKey) {
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          monthKey,
          orderProfit: 0,
          expenses: 0,
          orders: 0
        });
      }
      return monthMap.get(monthKey);
    }

    for (let offset = 3; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - offset);
      ensureMonth(getMonthKey(date.toISOString()));
    }

    orders.forEach((order) => {
      const bucket = ensureMonth(getMonthKey(order.createdAt));
      bucket.orders += 1;
      bucket.orderProfit += Number(order.totalProfit) || 0;
    });

    expenses.forEach((expense) => {
      const bucket = ensureMonth(getMonthKey(expense.createdAt));
      bucket.expenses += Number(expense.amount) || 0;
    });

    return Array.from(monthMap.values())
      .map((item) => ({
        ...item,
        net: item.orderProfit - item.expenses
      }))
      .sort((left, right) => left.monthKey.localeCompare(right.monthKey));
  }

  function getProductProfit(product, quantity = 1, sellingPriceOverride) {
    const sellingPrice = Number(sellingPriceOverride != null ? sellingPriceOverride : product.price) || 0;
    const momPrice = Number(product.momPrice) || 0;
    if (!momPrice || !sellingPrice) {
      return 0;
    }
    return Math.max(0, (sellingPrice - momPrice) * Math.max(1, Number(quantity) || 1));
  }

  function getDeliveryProfit(product, quantity = 1, deliveryChargeOverride, deliveryCostOverride) {
    const charge = Number(deliveryChargeOverride != null ? deliveryChargeOverride : product.deliveryCharge) || 0;
    const cost = Number(deliveryCostOverride != null ? deliveryCostOverride : product.deliveryCost) || 0;
    if (!charge && !cost) {
      return 0;
    }
    return Math.max(0, (charge - cost) * Math.max(1, Number(quantity) || 1));
  }

  function getTotalProfit(product, quantity = 1, sellingPriceOverride, deliveryChargeOverride, deliveryCostOverride) {
    return (
      getProductProfit(product, quantity, sellingPriceOverride) +
      getDeliveryProfit(product, quantity, deliveryChargeOverride, deliveryCostOverride)
    );
  }

  function hasProfitHistory(product) {
    return Boolean(Number(product.momPrice) || Number(product.deliveryCharge) || Number(product.deliveryCost));
  }

  function badgeClass(badge) {
    if (!badge) {
      return "badge badge-ochre";
    }
    if (badge.toLowerCase().includes("best")) {
      return "badge badge-coral";
    }
    if (badge.toLowerCase().includes("new")) {
      return "badge badge-teal";
    }
    return "badge badge-ochre";
  }

  function getFormGalleryImages() {
    const galleryItems = galleryInput.value
      .split(",")
      .map(cleanImagePath)
      .filter(Boolean)
      .map(resolveImageSource);

    return dedupeImages([resolveImageSource(imageInput.value)].concat(galleryItems));
  }

  function syncGalleryTextarea(images) {
    galleryInput.value = images
      .slice(1)
      .map(toFormImageValue)
      .join(", ");
  }

  function applyGalleryImageToDraft(image, action) {
    const normalizedImage = cleanImagePath(image);
    if (!normalizedImage) {
      return;
    }

    let images = getFormGalleryImages();

    if (action === "main") {
      images = dedupeImages([normalizedImage].concat(images.filter((item) => item !== normalizedImage)));
      imageInput.value = toFormImageValue(normalizedImage);
      temporaryMainPreviewSrc = "";
      syncGalleryTextarea(images);
      renderDraftPreview();
      setStatus(`${getImageLabel(normalizedImage)} is now the main draft image.`);
      activateAdminTab("workspace");
      return;
    }

    if (action === "gallery") {
      images = dedupeImages(images.concat(normalizedImage));
      if (!imageInput.value.trim()) {
        imageInput.value = toFormImageValue(normalizedImage);
      }
      temporaryMainPreviewSrc = "";
      syncGalleryTextarea(images);
      renderDraftPreview();
      setStatus(`${getImageLabel(normalizedImage)} added to the draft gallery.`);
      activateAdminTab("workspace");
    }
  }

  function syncPreviewJson() {
    if (!preview) {
      return;
    }

    preview.value = JSON.stringify(catalog, null, 2);
  }

  function saveSocialSettings(message) {
    utils.data.site.socials = socialSettings.map((social) => ({ ...social }));
    const saved = safeLocalStorageSetItem(socialSettingsKey, JSON.stringify(socialSettings), "social settings");
    if (message) {
      setStatus(saved ? message : `${message} Local save failed because browser storage is full.`);
    }
  }

  function saveSocialPlanner(message) {
    const saved = safeLocalStorageSetItem(socialPlannerKey, JSON.stringify(socialPlanner), "social planner");
    if (message) {
      setStatus(saved ? message : `${message} Local save failed because browser storage is full.`);
    }
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function loadStoredFlag(key, fallbackValue) {
    try {
      const value = window.localStorage.getItem(key);
      if (value === null) {
        return fallbackValue;
      }
      return value === "1";
    } catch (error) {
      return fallbackValue;
    }
  }

  function loadStoredStringArray(key) {
    try {
      const saved = JSON.parse(window.localStorage.getItem(key) || "[]");
      return Array.isArray(saved) ? saved.map((item) => String(item || "").trim()).filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function saveStoredStringArray(key, values) {
    safeLocalStorageSetItem(key, JSON.stringify(Array.from(new Set(values))), key);
  }

  function saveStoredFlag(key, value) {
    safeLocalStorageSetItem(key, value ? "1" : "0", key);
  }

  function applyGuidanceMode() {
    document.body.classList.toggle("admin-guidance-hidden", adminGuidanceHidden);
    if (adminToggleGuidanceButton) {
      adminToggleGuidanceButton.textContent = adminGuidanceHidden ? "Show Guidance" : "Hide Guidance";
    }
  }

  function updateGroupToggleLabel(button, expanded) {
    if (!button) {
      return;
    }

    button.setAttribute("aria-expanded", expanded ? "true" : "false");
    button.classList.toggle("is-collapsed", !expanded);
  }

  function setAdminGroupCollapsed(groupName, collapsed) {
    const group = Array.from(adminTabGroups).find((item) => item.dataset.adminGroup === groupName);
    if (!group) {
      return;
    }

    group.classList.toggle("is-collapsed", collapsed);
    const toggle = group.querySelector("[data-admin-group-toggle]");
    updateGroupToggleLabel(toggle, !collapsed);

    collapsedAdminGroups = collapsed
      ? collapsedAdminGroups.concat(groupName)
      : collapsedAdminGroups.filter((item) => item !== groupName);
    saveStoredStringArray(adminCollapsedGroupsStorageKey, collapsedAdminGroups);
  }

  function revealAdminGroupForTab(tabName) {
    const button = Array.from(adminTabButtons).find((item) => item.dataset.adminTab === tabName);
    if (!button) {
      return;
    }

    const group = button.closest("[data-admin-group]");
    if (!group) {
      return;
    }

    const groupName = group.dataset.adminGroup;
    if (groupName) {
      setAdminGroupCollapsed(groupName, false);
    }
  }

  function setPanelCollapsed(panel, collapsed) {
    const panelId = panel.dataset.panelId;
    panel.classList.toggle("is-collapsed", collapsed);
    const toggle = panel.querySelector(".admin-panel-toggle");
    if (toggle) {
      toggle.textContent = collapsed ? "Open" : "Hide";
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    }

    collapsedAdminPanels = collapsed
      ? collapsedAdminPanels.concat(panelId)
      : collapsedAdminPanels.filter((item) => item !== panelId);
    saveStoredStringArray(adminCollapsedPanelsStorageKey, collapsedAdminPanels);
  }

  function setupPanelCollapsing() {
    document.querySelectorAll(".admin-panel").forEach((panel, index) => {
      const header = Array.from(panel.children).find(
        (child) => child.classList && child.classList.contains("admin-panel-header")
      );
      if (!header || panel.dataset.panelReady === "1" || panel.classList.contains("admin-comfort-bar")) {
        return;
      }

      panel.dataset.panelReady = "1";
      panel.dataset.panelId = panel.dataset.panelId || `admin-panel-${index + 1}`;
      panel.classList.add("is-collapsible");

      const body = document.createElement("div");
      body.className = "admin-panel-body";

      while (header.nextSibling) {
        body.appendChild(header.nextSibling);
      }

      panel.appendChild(body);

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "admin-panel-toggle";
      header.appendChild(toggle);

      const shouldCollapse = collapsedAdminPanels.includes(panel.dataset.panelId);
      toggle.addEventListener("click", function () {
        setPanelCollapsed(panel, !panel.classList.contains("is-collapsed"));
      });

      setPanelCollapsed(panel, shouldCollapse);
    });
  }

  function renderAdminSearchResults(query) {
    if (!adminSearchResults) {
      return;
    }

    const normalizedQuery = String(query || "").trim().toLowerCase();
    const matches = Array.from(adminTabButtons).filter((button) => {
      const content = `${button.textContent || ""} ${button.dataset.adminTab || ""}`.toLowerCase();
      return normalizedQuery && content.includes(normalizedQuery);
    });

    if (!normalizedQuery || !matches.length) {
      adminSearchResults.hidden = true;
      adminSearchResults.innerHTML = "";
      return;
    }

    adminSearchResults.hidden = false;
    adminSearchResults.innerHTML = matches
      .map((button) => {
        const tabName = button.dataset.adminTab || "";
        return `
          <button class="admin-search-result" type="button" data-admin-search-jump="${tabName}">
            <strong>${getAdminTabLabel(tabName)}</strong>
            <span>${button.querySelector("small") ? button.querySelector("small").textContent : "Open section"}</span>
          </button>
        `;
      })
      .join("");
  }

  function filterAdminTabs(query) {
    const normalizedQuery = String(query || "").trim().toLowerCase();

    adminTabButtons.forEach((button) => {
      const content = `${button.textContent || ""} ${button.dataset.adminTab || ""}`.toLowerCase();
      const matches = !normalizedQuery || content.includes(normalizedQuery);
      button.classList.toggle("is-filtered-out", !matches);
    });

    adminTabGroups.forEach((group) => {
      const visibleButtons = group.querySelectorAll(".admin-tab-button:not(.is-filtered-out)");
      group.classList.toggle("is-empty", visibleButtons.length === 0);

      if (normalizedQuery && visibleButtons.length > 0) {
        setAdminGroupCollapsed(group.dataset.adminGroup, false);
      }
    });

    renderAdminSearchResults(normalizedQuery);
  }

  function loadMpesaDashboard() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(mpesaDashboardKey) || "null");
      if (saved && typeof saved === "object") {
        return {
          cleared: Boolean(saved.cleared)
        };
      }
    } catch (error) {
      // Ignore bad local state and rebuild from defaults.
    }

    return {
      cleared: false
    };
  }

  function saveMpesaDashboard(message) {
    const saved = safeLocalStorageSetItem(mpesaDashboardKey, JSON.stringify(mpesaDashboard), "m-pesa dashboard");
    if (message) {
      setStatus(saved ? message : `${message} Local save failed because browser storage is full.`);
    }
  }

  function renderMpesaDashboard() {
    if (!mpesaOverview || !mpesaQueue || !mpesaLog || !mpesaRecon) {
      return;
    }

    if (mpesaDashboard.cleared) {
      mpesaOverview.innerHTML = `
        <article class="empty-state-card">
          <strong>M-Pesa overview cleared</strong>
          <p>No payment totals are showing in this browser right now.</p>
        </article>
      `;
      mpesaQueue.innerHTML = `
        <article class="empty-state-card">
          <strong>No pending confirmations</strong>
          <p>The M-Pesa queue has been cleared. New payment items can be added again whenever you are ready.</p>
        </article>
      `;
      mpesaLog.innerHTML = `
        <article class="empty-state-card">
          <strong>No transaction log</strong>
          <p>The recent activity list has been cleared from this browser.</p>
        </article>
      `;
      mpesaRecon.innerHTML = `
        <article class="empty-state-card">
          <strong>No reconciliation figures</strong>
          <p>The balance check has been cleared from this browser.</p>
        </article>
      `;

      if (mpesaReconNote) {
        mpesaReconNote.textContent = "All M-Pesa reconciliation data has been cleared from this browser.";
      }

      if (mpesaReconActions) {
        mpesaReconActions.hidden = true;
      }

      return;
    }

    mpesaOverview.innerHTML = defaultMpesaMarkup.overview;
    mpesaQueue.innerHTML = defaultMpesaMarkup.queue;
    mpesaLog.innerHTML = defaultMpesaMarkup.log;
    mpesaRecon.innerHTML = defaultMpesaMarkup.recon;

    if (mpesaReconNote) {
      mpesaReconNote.textContent = defaultMpesaMarkup.reconNote;
    }

    if (mpesaReconActions) {
      mpesaReconActions.hidden = false;
    }
  }

  function syncCategoryRuntimeData(saveToStorage) {
    categoryCatalog = categoryCatalog.map((category) => normalizeCategory(category));
    categoryMap = new Map(categoryCatalog.map((category) => [category.slug, category.name]));
    defaultCategoryImageMap = buildDefaultCategoryImageMap(categoryCatalog);
    utils.data.categories = categoryCatalog.map((category) => ({ ...category }));

    if (saveToStorage) {
      return safeLocalStorageSetItem(categoriesSettingsKey, JSON.stringify(categoryCatalog), "category settings");
    }

    return true;
  }

  function renderCategorySelectControls() {
    const currentCategoryValue = categoryInput ? categoryInput.value : "";
    const currentFilterValue = categoryFilter ? categoryFilter.value : "";
    const options = categoryCatalog
      .map((category) => `<option value="${category.slug}">${category.name}</option>`)
      .join("");

    if (categoryInput) {
      categoryInput.innerHTML = options;
      categoryInput.value = categoryCatalog.some((category) => category.slug === currentCategoryValue)
        ? currentCategoryValue
        : (categoryCatalog[0] || {}).slug || "";
    }

    if (categoryFilter) {
      categoryFilter.innerHTML = `<option value="">All categories</option>${options}`;
      categoryFilter.value = categoryCatalog.some((category) => category.slug === currentFilterValue)
        ? currentFilterValue
        : "";
    }
  }

  function getCategoryProductCount(slug) {
    return catalog.filter((product) => product.category === slug).length;
  }

  function getEditingCategory() {
    return categoryCatalog.find((category) => category.slug === editingCategorySlug) || categoryCatalog[0] || null;
  }

  function renderCategoryList() {
    if (!categoryList) {
      return;
    }

    categoryList.innerHTML = categoryCatalog
      .map((category) => {
        const productCount = getCategoryProductCount(category.slug);
        const activeClass = category.slug === editingCategorySlug ? "is-active" : "";
        const tip = category.tip || "Homepage label";

        return `
          <button class="admin-category-item ${activeClass}" type="button" data-category-edit="${category.slug}">
            <img src="${category.image}" alt="${category.name}" loading="lazy" />
            <div class="admin-category-item-copy">
              <strong>${category.name}</strong>
              <span>${tip}</span>
            </div>
            <small>${productCount} product${productCount === 1 ? "" : "s"}</small>
          </button>
        `;
      })
      .join("");
  }

  function renderCategoryPreview() {
    if (!categoryPreviewCard || !categoryPreviewImage || !categoryPreviewName || !categoryPreviewTip) {
      return;
    }

    const category = getEditingCategory();
    const previewName = categoryNameInput && categoryNameInput.value.trim()
      ? categoryNameInput.value.trim()
      : (category && category.name) || "Category";
    const previewTip = categoryTipInput && categoryTipInput.value.trim()
      ? categoryTipInput.value.trim()
      : (category && category.tip) || "Explore";
    const previewImage = cleanImagePath(categoryImageInput && categoryImageInput.value) || (category && category.image) || fallbackImage;
    const previewAccent = (categoryAccentInput && categoryAccentInput.value) || (category && category.accent) || "coral";
    const previewCount = category ? getCategoryProductCount(category.slug) : 0;

    categoryPreviewCard.className = `admin-category-preview-card category-card accent-${previewAccent}`;
    categoryPreviewImage.src = previewImage;
    categoryPreviewName.textContent = previewName;
    categoryPreviewTip.textContent = previewTip;

    if (categoryPreviewCount) {
      categoryPreviewCount.textContent = `${previewCount} product${previewCount === 1 ? "" : "s"} in this category`;
    }
  }

  function populateCategoryForm(categorySlug) {
    const category = categoryCatalog.find((item) => item.slug === categorySlug) || categoryCatalog[0];
    if (!category) {
      return;
    }

    editingCategorySlug = category.slug;

    if (categoryNameInput) {
      categoryNameInput.value = category.name;
    }
    if (categoryAccentInput) {
      categoryAccentInput.value = category.accent;
    }
    if (categoryTipInput) {
      categoryTipInput.value = category.tip || "";
    }
    if (categoryDescriptionInput) {
      categoryDescriptionInput.value = category.description || "";
    }
    if (categoryImageInput) {
      categoryImageInput.value = category.image || fallbackImage;
    }

    renderCategoryList();
    renderCategoryPreview();
    renderCategoryImageLibrary();
  }

  function renderCategoryImageLibrary() {
    if (!categoryImageLibrary) {
      return;
    }

    const filteredImages = getFilteredProjectImages(categoryImageSearchInput ? categoryImageSearchInput.value : "", {
      extensions: /\.(jpe?g|png|webp|svg)$/i,
      limit: 18
    });

    categoryImageLibrary.innerHTML = filteredImages.length
      ? filteredImages
        .map(
          (image) => `
            <button class="admin-category-image-option" type="button" data-category-image="${escapeHtml(image)}">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(getImageLabel(image))}" loading="lazy" />
              <span>${escapeHtml(getImageLabel(image))}</span>
            </button>
          `
        )
        .join("")
      : `
          <article class="empty-state-card">
            <strong>No matching icon images</strong>
            <p>Try a shorter search or clear it to browse more category image options.</p>
          </article>
        `;
  }

  function saveCategoryState(message) {
    const saved = syncCategoryRuntimeData(true);
    renderCategorySelectControls();
    renderCategoryList();
    renderCategoryPreview();
    renderFavoriteProductSelect();
    renderVisualPreview();
    renderList();
    renderFeaturedManager();
    renderSalesDashboard();
    renderProfitDashboard();
    renderOrders();
    renderCustomerDashboard();
    renderStockList();
    renderSocialMedia();
    renderSocialTracker();
    renderAdminOverview();
    renderDraftPreview();
    setStatus(saved ? message : `${message} Local save failed because browser storage is full.`);
  }

  function syncHomeVisualsRuntimeData(saveToStorage) {
    homeVisuals = normalizeHomeVisuals(homeVisuals);
    utils.data.homeVisuals = JSON.parse(JSON.stringify(homeVisuals));

    if (saveToStorage) {
      return safeLocalStorageSetItem(homeVisualsSettingsKey, JSON.stringify(homeVisuals), "homepage visuals");
    }

    return true;
  }

  function renderFavoriteProductSelect() {
    if (!favoriteProductSelect) {
      return;
    }

    const currentValue = favoriteProductSelect.value || homeVisuals.favorite.productId || "";
    favoriteProductSelect.innerHTML = [`<option value="">Choose favorite product</option>`]
      .concat(catalog.map((product) => `<option value="${product.id}">${product.name}</option>`))
      .join("");
    favoriteProductSelect.value = catalog.some((product) => product.id === currentValue) ? currentValue : "";
  }

  function activateVisualSection(sectionName) {
    activeVisualSection = sectionName;
    visualNavButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.visualSection === sectionName);
    });
    visualPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.visualPanel === sectionName);
    });
  }

  function populateVisualStoryForm() {
    const hero = homeVisuals.hero || {};
    const favorite = homeVisuals.favorite || {};

    if (heroKickerInput) heroKickerInput.value = hero.kicker || "";
    if (heroTitleInput) heroTitleInput.value = hero.title || "";
    if (heroDescriptionInput) heroDescriptionInput.value = hero.description || "";
    if (heroPrimaryLabelInput) heroPrimaryLabelInput.value = hero.primaryLabel || "";
    if (heroPrimaryHrefInput) heroPrimaryHrefInput.value = hero.primaryHref || "";
    if (heroSecondaryLabelInput) heroSecondaryLabelInput.value = hero.secondaryLabel || "";
    if (heroSecondaryHrefInput) heroSecondaryHrefInput.value = hero.secondaryHref || "";
    if (heroImageInput) heroImageInput.value = hero.image || "";
    if (heroImageAltInput) heroImageAltInput.value = hero.imageAlt || "";
    if (favoriteKickerInput) favoriteKickerInput.value = favorite.kicker || "";
    if (favoriteTitleInput) favoriteTitleInput.value = favorite.title || "";
    if (favoriteDescriptionInput) favoriteDescriptionInput.value = favorite.description || "";
    if (favoriteImageInput) favoriteImageInput.value = favorite.image || "";
    if (favoriteImageAltInput) favoriteImageAltInput.value = favorite.imageAlt || "";

    renderFavoriteProductSelect();
    if (favoriteProductSelect) {
      favoriteProductSelect.value = favorite.productId || "";
    }

    renderVisualPreview();
  }

  function getSelectedFavoriteProduct() {
    return catalog.find((product) => product.id === (favoriteProductSelect && favoriteProductSelect.value)) || null;
  }

  function renderVisualPreview() {
    const selectedProduct = getSelectedFavoriteProduct();
    const previewHeroImage = cleanImagePath(heroImageInput && heroImageInput.value) || homeVisuals.hero.image || fallbackImage;
    const previewFavoriteImage =
      cleanImagePath(favoriteImageInput && favoriteImageInput.value) ||
      (selectedProduct && selectedProduct.images && selectedProduct.images[0]) ||
      homeVisuals.favorite.image ||
      fallbackImage;

    if (visualPreviewKicker) {
      visualPreviewKicker.textContent =
        (heroKickerInput && heroKickerInput.value.trim()) || homeVisuals.hero.kicker || "Welcome to SharonCraft";
    }
    if (visualPreviewTitle) {
      visualPreviewTitle.textContent =
        (heroTitleInput && heroTitleInput.value.trim()) ||
        homeVisuals.hero.title ||
        "Clean, colorful handmade beadwork for happy homes and beautiful gifting.";
    }
    if (visualPreviewDescription) {
      visualPreviewDescription.textContent =
        (heroDescriptionInput && heroDescriptionInput.value.trim()) ||
        homeVisuals.hero.description ||
        "Discover bracelets, necklaces, decor, and occasion sets made with a bright East African spirit.";
    }
    if (visualPreviewPrimary) {
      visualPreviewPrimary.textContent =
        (heroPrimaryLabelInput && heroPrimaryLabelInput.value.trim()) || homeVisuals.hero.primaryLabel || "Shop Now";
    }
    if (visualPreviewSecondary) {
      visualPreviewSecondary.textContent =
        (heroSecondaryLabelInput && heroSecondaryLabelInput.value.trim()) || homeVisuals.hero.secondaryLabel || "Our Story";
    }
    if (visualPreviewImage) {
      visualPreviewImage.src = previewHeroImage;
      visualPreviewImage.alt =
        (heroImageAltInput && heroImageAltInput.value.trim()) || homeVisuals.hero.imageAlt || "Hero preview";
    }
    if (visualFavoritePreviewKicker) {
      visualFavoritePreviewKicker.textContent =
        (favoriteKickerInput && favoriteKickerInput.value.trim()) || homeVisuals.favorite.kicker || "Client Favorite";
    }
    if (visualFavoritePreviewTitle) {
      visualFavoritePreviewTitle.textContent =
        (favoriteTitleInput && favoriteTitleInput.value.trim()) ||
        (selectedProduct && selectedProduct.name) ||
        homeVisuals.favorite.title ||
        "Client Favorite";
    }
    if (visualFavoritePreviewDescription) {
      visualFavoritePreviewDescription.textContent =
        (favoriteDescriptionInput && favoriteDescriptionInput.value.trim()) ||
        (selectedProduct && (selectedProduct.shortDescription || selectedProduct.description)) ||
        homeVisuals.favorite.description ||
        "A well-loved SharonCraft piece chosen for everyday beauty and easy gifting.";
    }
    if (visualFavoritePreviewImage) {
      visualFavoritePreviewImage.src = previewFavoriteImage;
      visualFavoritePreviewImage.alt =
        (favoriteImageAltInput && favoriteImageAltInput.value.trim()) ||
        homeVisuals.favorite.imageAlt ||
        (selectedProduct && selectedProduct.name) ||
        "Favorite preview";
    }
  }

  function renderVisualImageLibrary() {
    if (!visualImageLibrary) {
      return;
    }

    const filteredImages = getFilteredProjectImages(visualImageSearchInput ? visualImageSearchInput.value : "", {
      extensions: /\.(jpe?g|png|webp|svg)$/i,
      limit: 18
    });

    visualImageLibrary.innerHTML = filteredImages.length
      ? filteredImages
        .map(
          (image) => `
            <button class="admin-category-image-option" type="button" data-visual-image="${escapeHtml(image)}">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(getImageLabel(image))}" loading="lazy" />
              <span>${escapeHtml(getImageLabel(image))}</span>
            </button>
          `
        )
        .join("")
      : `
          <article class="empty-state-card">
            <strong>No matching wallpaper images</strong>
            <p>Try a shorter search or clear it to browse the full project image library.</p>
          </article>
        `;
  }

  function saveHomeVisualState(message) {
    const savedLocally = syncHomeVisualsRuntimeData(true);
    renderVisualPreview();
    setStatus(savedLocally ? message : `${message} (Local save failed - storage full. Publishing to Supabase still runs.)`);
    publishHomeVisualsToSupabase(message).catch(function (error) {
      console.error("Unable to publish home visuals to Supabase.", error);
      setStatus(`${message} Saved locally only. Supabase publish failed.`);
    });
  }

  if (repairedCatalogOnLoad) {
    setStatus("Repeated product images were repaired from the photo library. Save once to publish the refreshed pictures live.");
  }

  function setLiveAuthState(message, tone) {
    if (!liveAuthState) {
      return;
    }

    liveAuthState.textContent = message;
    liveAuthState.classList.remove("is-connected", "is-warning", "is-error");

    if (tone) {
      liveAuthState.classList.add(`is-${tone}`);
    }
  }

  function renderLiveAuthState() {
    if (!liveAuthState) {
      return;
    }

    if (!liveCatalogApi || typeof liveCatalogApi.isConfigured !== "function" || !liveCatalogApi.isConfigured()) {
      setLiveAuthState("Supabase is not configured on this admin yet.", "warning");
      return;
    }

    if (currentLiveUser && currentLiveUser.email) {
      setLiveAuthState(`Live publish ready as ${currentLiveUser.email}`, "connected");
      return;
    }

    setLiveAuthState("Not signed in. Local saves will not reach the live website yet.", "warning");
  }

  function buildLiveCatalogProducts() {
    const now = Date.now();

    return catalog.map((product, index) => {
      const trackedStock = Number(product.stockQty) || 0;
      const reservedStock = Number(product.reservedQty) || 0;
      const hasTrackedStock = trackedStock > 0;

      return {
        id: product.id,
        image: product.images && product.images.length ? product.images[0] : "",
        name: product.name,
        price: Number(product.price) || 0,
        material: categoryMap.get(product.category) || product.category || "Handmade",
        story: product.description || product.shortDescription || "Handmade by SharonCraft artisans.",
        specs: Array.isArray(product.details) ? product.details : [],
        gallery: Array.isArray(product.images) ? product.images.slice(1) : [],
        soldOut: hasTrackedStock ? reservedStock >= trackedStock : false,
        spotlightUntil: product.featured ? new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString() : "",
        spotlightText: product.badge || "Featured",
        notes: `${product.category || ""}|${product.source || ""}`,
        updatedAt: new Date().toISOString(),
        newUntil: product.newArrival ? new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString() : "",
        sortOrder: index,
      };
    });
  }

  async function refreshLiveUser() {
    if (!liveCatalogApi || typeof liveCatalogApi.getCurrentUser !== "function" || !liveCatalogApi.isConfigured()) {
      currentLiveUser = null;
      renderLiveAuthState();
      return null;
    }

    try {
      currentLiveUser = await liveCatalogApi.getCurrentUser();
    } catch (error) {
      currentLiveUser = null;
      console.error("Unable to read current Supabase user.", error);
    }

    renderLiveAuthState();
    return currentLiveUser;
  }

  async function refreshOrdersFromLive(options = {}) {
    if (
      !liveCatalogApi ||
      typeof liveCatalogApi.isConfigured !== "function" ||
      typeof liveCatalogApi.fetchOrders !== "function" ||
      !liveCatalogApi.isConfigured()
    ) {
      return false;
    }

    const user = currentLiveUser || (await refreshLiveUser());
    if (!user) {
      return false;
    }

    try {
      const remoteOrders = (await liveCatalogApi.fetchOrders()).map((order) => normalizeOrder(order));
      const mergedOrders = mergeOrders(remoteOrders, loadLocalOrders());
      orders = mergedOrders;
      safeLocalStorageSetItem(ordersKey, JSON.stringify(orders), "orders");

      renderOrders();
      renderCustomerDashboard();
      renderGoalCard();
      renderAdminOverview();

      if (options.showStatus) {
        setStatus("Live orders refreshed from Supabase.");
      }
      return true;
    } catch (error) {
      console.error("Unable to refresh live orders.", error);
      if (options.showStatus) {
        setStatus("Could not refresh live orders from Supabase.");
      }
      return false;
    }
  }

  async function publishCatalogToSupabase(localMessage) {
    if (!liveCatalogApi || typeof liveCatalogApi.saveProducts !== "function" || !liveCatalogApi.isConfigured()) {
      renderLiveAuthState();
      if (localMessage) {
        setStatus(`${localMessage} Saved locally only because Supabase is not configured here.`);
      }
      return false;
    }

    const user = currentLiveUser || (await refreshLiveUser());
    if (!user) {
      if (localMessage) {
        setStatus(`${localMessage} Saved locally only. Sign in to Supabase to update the live website.`);
      }
      return false;
    }

    try {
      await liveCatalogApi.saveProducts(buildLiveCatalogProducts());
      renderLiveAuthState();
      if (localMessage) {
        setStatus(`${localMessage} Supabase live catalog updated too.`);
      }
      return true;
    } catch (error) {
      console.error("Unable to publish catalog to Supabase.", error);
      if (error && /sign in/i.test(String(error.message || ""))) {
        currentLiveUser = null;
        renderLiveAuthState();
      } else {
        setLiveAuthState("Signed in, but live publish failed. Check Supabase table or permissions.", "error");
      }
      if (localMessage) {
        setStatus(`${localMessage} Saved locally, but live publish failed.`);
      }
      return false;
    }
  }

  async function publishHomeVisualsToSupabase(localMessage) {
    renderLiveAuthState();

    if (!localMessage) {
      localMessage = "Homepage visual story saved.";
    }

    if (!liveCatalogApi || typeof liveCatalogApi.saveSetting !== "function" || !liveCatalogApi.isConfigured()) {
      setStatus(`${localMessage} Saved locally only because Supabase is not configured here.`);
      return false;
    }

    const user = currentLiveUser || (await refreshLiveUser());
    if (!user) {
      setStatus(`${localMessage} Saved locally only. Sign in to Supabase to update the live website.`);
      return false;
    }

    try {
      await liveCatalogApi.saveSetting("home_visuals", homeVisuals);
      renderLiveAuthState();
      setStatus(`${localMessage} Supabase live visual story updated too.`);
      return true;
    } catch (error) {
      console.error("Unable to publish home visuals to Supabase.", error);
      if (error && /sign in/i.test(String(error.message || ""))) {
        setStatus(`${localMessage} Saved locally only. Sign in to Supabase to update the live website.`);
        return false;
      }
      setStatus(`${localMessage} Saved locally only. Supabase publish failed.`);
      return false;
    }
  }

  async function publishSocialSettingsToSupabase(localMessage) {
    renderLiveAuthState();

    if (!localMessage) {
      localMessage = "Social links saved.";
    }

    if (!liveCatalogApi || typeof liveCatalogApi.saveSetting !== "function" || !liveCatalogApi.isConfigured()) {
      setStatus(`${localMessage} Saved locally only because Supabase is not configured here.`);
      return false;
    }

    const user = currentLiveUser || (await refreshLiveUser());
    if (!user) {
      setStatus(`${localMessage} Saved locally only. Sign in to Supabase to update the live website.`);
      return false;
    }

    try {
      await liveCatalogApi.saveSetting("social_links", socialSettings);
      renderLiveAuthState();
      setStatus(`${localMessage} Supabase live social links updated too.`);
      return true;
    } catch (error) {
      console.error("Unable to publish social links to Supabase.", error);
      if (error && /sign in/i.test(String(error.message || ""))) {
        setStatus(`${localMessage} Saved locally only. Sign in to Supabase to update the live website.`);
        return false;
      }
      setStatus(`${localMessage} Saved locally only. Supabase publish failed.`);
      return false;
    }
  }

  function getAdminTabLabel(tabName) {
    const labels = {
      workspace: "Add Product",
      catalog: "Product List",
      categories: "Categories",
      visuals: "Visual Story",
      preview: "Phone Preview",
      orders: "Orders",
      customers: "Customers",
      delivery: "Delivery Desk",
      mpesa: "M-Pesa",
      operations: "Delivery & Stock",
      profit: "Profit",
      bundles: "Bundles & Growth",
      analytics: "Analytics",
      social: "Social Tools",
      replies: "Quick Replies",
      assets: "Photo Library"
    };

    return labels[tabName] || tabName;
  }

  function calculatePercentDelta(currentValue, previousValue) {
    const current = Number(currentValue) || 0;
    const previous = Number(previousValue) || 0;

    if (!previous) {
      return current > 0 ? 100 : 0;
    }

    return ((current - previous) / previous) * 100;
  }

  function formatTrendPercent(value) {
    const rounded = Math.round((Number(value) || 0) * 10) / 10;
    const normalized = Object.is(rounded, -0) ? 0 : rounded;
    const hasDecimal = Math.abs(normalized % 1) > 0;
    const prefix = normalized > 0 ? "+" : "";
    return `${prefix}${normalized.toFixed(hasDecimal ? 1 : 0)}%`;
  }

  function buildAdminOverviewIcon(type) {
    const icons = {
      products: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5z" fill="none" stroke="currentColor" stroke-width="1.8"></path>
          <path d="M8 10h8M8 13h8M8 16h5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path>
        </svg>
      `,
      orders: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 6h13l-1.2 6.2a2 2 0 0 1-2 1.8H10a2 2 0 0 1-2-1.6L6 4H3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
          <circle cx="10" cy="19" r="1.6" fill="currentColor"></circle>
          <circle cx="17" cy="19" r="1.6" fill="currentColor"></circle>
        </svg>
      `,
      revenue: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2v20M17 6.5c0-1.9-2.2-3.5-5-3.5s-5 1.6-5 3.5 1.8 3 5 3 5 1.2 5 3.5-2.2 4-5 4-5-1.7-5-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path>
        </svg>
      `,
      growth: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 16l5-5 3 3 6-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          <path d="M14 7h5v5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
        </svg>
      `
    };

    return icons[type] || icons.products;
  }

  function renderAdminOverview() {
    if (!adminOverviewGrid) {
      return;
    }

    const trackedEvents = getStorefrontAnalyticsEvents();
    const paidStatuses = new Set(["paid", "delivered"]);
    const thirtyDayWindow = 1000 * 60 * 60 * 24 * 30;
    const now = Date.now();
    const recentOrders = orders.filter((order) => now - new Date(order.createdAt || order.updatedAt || 0).getTime() <= thirtyDayWindow);
    const previousOrders = orders.filter((order) => {
      const orderTime = new Date(order.createdAt || order.updatedAt || 0).getTime();
      return now - orderTime > thirtyDayWindow && now - orderTime <= thirtyDayWindow * 2;
    });
    const paidRevenue = orders.reduce((sum, order) => {
      return paidStatuses.has(normalizeOrderStatus(order.status)) ? sum + (Number(order.orderTotal) || 0) : sum;
    }, 0);
    const recentRevenue = recentOrders.reduce((sum, order) => {
      return paidStatuses.has(normalizeOrderStatus(order.status)) ? sum + (Number(order.orderTotal) || 0) : sum;
    }, 0);
    const previousRevenue = previousOrders.reduce((sum, order) => {
      return paidStatuses.has(normalizeOrderStatus(order.status)) ? sum + (Number(order.orderTotal) || 0) : sum;
    }, 0);
    const featuredShare = catalog.length ? (catalog.filter((product) => product.featured).length / catalog.length) * 100 : 0;
    const ordersGrowth = calculatePercentDelta(recentOrders.length, previousOrders.length);
    const revenueGrowth = calculatePercentDelta(recentRevenue, previousRevenue);
    const blendedGrowth = Math.round(((ordersGrowth + revenueGrowth) / 2) * 10) / 10;
    const whatsappClicks = trackedEvents.filter((event) => event.name === "whatsapp_click").length;

    const cards = [
      {
        label: "Total Products",
        value: catalog.length,
        change: formatTrendPercent(featuredShare),
        positive: true,
        meta: `${catalog.filter((product) => getAvailableProductStock(product) > 0).length} ready to sell`,
        icon: buildAdminOverviewIcon("products")
      },
      {
        label: "Total Orders",
        value: orders.length,
        change: formatTrendPercent(ordersGrowth),
        positive: ordersGrowth >= 0,
        meta: `${recentOrders.length} in the last 30 days`,
        icon: buildAdminOverviewIcon("orders")
      },
      {
        label: "Revenue",
        value: formatPrice(paidRevenue),
        change: formatTrendPercent(revenueGrowth),
        positive: revenueGrowth >= 0,
        meta: `${formatPrice(recentRevenue)} recent paid revenue`,
        icon: buildAdminOverviewIcon("revenue")
      },
      {
        label: "Growth %",
        value: formatTrendPercent(blendedGrowth),
        change: formatTrendPercent(trackedEvents.length ? (whatsappClicks / trackedEvents.length) * 100 : 0),
        positive: blendedGrowth >= 0,
        meta: `${whatsappClicks} WhatsApp taps`,
        icon: buildAdminOverviewIcon("growth")
      }
    ];

    adminOverviewGrid.innerHTML = cards
      .map(
        (card) => `
          <article class="admin-overview-card">
            <div class="admin-overview-card-head">
              <div class="admin-overview-card-copy">
                <span class="admin-overview-card-label">${card.label}</span>
                <strong>${card.value}</strong>
              </div>
              <span class="admin-overview-icon">${card.icon}</span>
            </div>
            <div class="admin-overview-card-foot">
              <span class="admin-overview-change ${card.positive ? "is-positive" : "is-negative"}">${card.change}</span>
              <small class="admin-overview-meta">${card.meta}</small>
            </div>
          </article>
        `
      )
      .join("");

    renderAdminCommandSummary();
    renderAdminLowStockWatch();
    renderAdminGlobalSearchResults(adminGlobalSearchInput ? adminGlobalSearchInput.value : "");
    window.dispatchEvent(new CustomEvent("sharoncraft:admin-refresh"));
  }

  function getAvailableProductStock(product) {
    return Math.max(0, (Number(product && product.stockQty) || 0) - (Number(product && product.reservedQty) || 0));
  }

  function getLowStockProducts(limit) {
    const lowStockProducts = catalog
      .map((product) => ({
        ...product,
        availableStock: getAvailableProductStock(product)
      }))
      .filter((product) => product.availableStock <= 3)
      .sort((firstProduct, secondProduct) => {
        if (firstProduct.availableStock !== secondProduct.availableStock) {
          return firstProduct.availableStock - secondProduct.availableStock;
        }

        return firstProduct.name.localeCompare(secondProduct.name);
      });

    return typeof limit === "number" ? lowStockProducts.slice(0, limit) : lowStockProducts;
  }

  function renderAdminCommandSummary() {
    if (!adminCommandSummary) {
      return;
    }

    const paidStatuses = new Set(["paid", "delivered"]);
    const pendingStatuses = new Set(["new", "confirmed"]);
    const paidRevenue = orders.reduce((sum, order) => {
      return paidStatuses.has(normalizeOrderStatus(order.status)) ? sum + (Number(order.orderTotal) || 0) : sum;
    }, 0);
    const pendingOrders = orders.filter((order) => pendingStatuses.has(normalizeOrderStatus(order.status))).length;
    const readyDispatch = orders.filter((order) => normalizeOrderStatus(order.status) === "paid").length;
    const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

    const cards = [
      { label: "Paid Revenue", value: formatPrice(paidRevenue) },
      { label: "Pending Orders", value: pendingOrders },
      { label: "Ready To Deliver", value: readyDispatch },
      { label: "Expenses Logged", value: formatPrice(totalExpenses) }
    ];

    adminCommandSummary.innerHTML = cards
      .map(
        (card) => `
          <article class="admin-command-card">
            <span>${card.label}</span>
            <strong>${card.value}</strong>
          </article>
        `
      )
      .join("");
  }

  function buildAdminSearchResults(query) {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    const matches = [];

    catalog.forEach((product) => {
      const categoryName = categoryMap.get(product.category) || product.category;
      const haystack = [product.name, categoryName, product.description, product.badge].join(" ").toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return;
      }

      matches.push({
        type: "Product",
        title: product.name,
        meta: `${categoryName} | ${formatPrice(product.price)}`,
        tab: "catalog",
        targetId: "admin-product-search",
        targetValue: product.name
      });
    });

    orders.forEach((order) => {
      const haystack = [order.orderId, order.customer, order.phone, order.productName, order.areaName].join(" ").toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return;
      }

      matches.push({
        type: "Order",
        title: order.orderId || order.id,
        meta: `${order.customer || "Customer"} | ${order.productName || "Product"} | ${getOrderStatusLabel(order.status)}`,
        tab: "orders",
        targetId: "admin-order-search",
        targetValue: order.orderId || order.customer || order.phone || ""
      });
    });

    categoryCatalog.forEach((category) => {
      const haystack = [category.name, category.tip, category.description].join(" ").toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return;
      }

      matches.push({
        type: "Category",
        title: category.name,
        meta: category.tip || category.description || "Open category editor",
        tab: "categories"
      });
    });

    deliveryAreas.forEach((area) => {
      const haystack = [area.name, area.id].join(" ").toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return;
      }

      matches.push({
        type: "Delivery",
        title: area.name,
        meta: `Client ${formatPrice(area.clientCharge)} | Real cost ${formatPrice(area.realCost)}`,
        tab: "operations"
      });
    });

    replyTemplates.forEach((template) => {
      const haystack = [template.title, template.category, template.message].join(" ").toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return;
      }

      matches.push({
        type: "Reply",
        title: template.title,
        meta: template.category || "Quick reply template",
        tab: "replies"
      });
    });

    return matches.slice(0, 8);
  }

  function renderAdminGlobalSearchResults(query) {
    if (!adminGlobalResults) {
      return;
    }

    const normalizedQuery = String(query || "").trim();
    if (!normalizedQuery) {
      adminGlobalResults.innerHTML = `
        <article class="empty-state-card">
          <strong>Search the whole admin from here</strong>
          <p>Try a product name, order ID, customer phone, category, area, or quick reply title.</p>
        </article>
      `;
      return;
    }

    const matches = buildAdminSearchResults(normalizedQuery);
    if (!matches.length) {
      adminGlobalResults.innerHTML = `
        <article class="empty-state-card">
          <strong>No matching admin result</strong>
          <p>Try a shorter name, a phone number, or part of the order ID.</p>
        </article>
      `;
      return;
    }

    adminGlobalResults.innerHTML = matches
      .map(
        (match) => `
          <button
            class="admin-command-result"
            type="button"
            data-admin-command-open="${escapeHtml(match.tab)}"
            ${match.targetId ? `data-admin-command-query-target="${escapeHtml(match.targetId)}"` : ""}
            ${match.targetValue ? `data-admin-command-query-value="${escapeHtml(match.targetValue)}"` : ""}
          >
            <div class="admin-command-result-head">
              <strong>${escapeHtml(match.title)}</strong>
              <span class="admin-command-tag">${escapeHtml(match.type)}</span>
            </div>
            <p>${escapeHtml(match.meta)}</p>
          </button>
        `
      )
      .join("");
  }

  function renderAdminLowStockWatch() {
    if (!adminLowStockList) {
      return;
    }

    const riskyProducts = getLowStockProducts(6);
    if (!riskyProducts.length) {
      adminLowStockList.innerHTML = `
        <article class="empty-state-card">
          <strong>No urgent stock warning</strong>
          <p>Everything with tracked stock is above the low-stock line right now.</p>
        </article>
      `;
      return;
    }

    adminLowStockList.innerHTML = riskyProducts
      .map((product) => {
        const badgeClass = product.availableStock === 0 ? "is-out" : "is-low";
        const badgeLabel = product.availableStock === 0 ? "Out" : `Only ${product.availableStock} left`;

        return `
          <button
            class="admin-stock-watch-row"
            type="button"
            data-admin-command-open="catalog"
            data-admin-command-query-target="admin-product-search"
            data-admin-command-query-value="${escapeHtml(product.name)}"
          >
            <div class="admin-stock-watch-copy">
              <strong>${escapeHtml(product.name)}</strong>
              <p>${escapeHtml(categoryMap.get(product.category) || product.category)} | Stock ${product.stockQty || 0} | Reserved ${product.reservedQty || 0}</p>
            </div>
            <span class="admin-stock-watch-badge ${badgeClass}">${escapeHtml(badgeLabel)}</span>
          </button>
        `;
      })
      .join("");
  }

  function loadLocalStorefrontAnalyticsEvents() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storefrontAnalyticsKey) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function getStorefrontAnalyticsEvents() {
    const sourceEvents = analyticsDataSource === "supabase" ? remoteStorefrontAnalyticsEvents : loadLocalStorefrontAnalyticsEvents();
    return sourceEvents.filter(isStorefrontAnalyticsEvent);
  }

  function getAnalyticsSourceLabel() {
    return analyticsDataSource === "supabase" ? "Supabase live" : "This browser";
  }

  function getAnalyticsRangeLabel() {
    const labels = {
      today: "Today",
      "7d": "Last 7 days",
      "30d": "Last 30 days"
    };

    return labels[analyticsRange] || "Last 7 days";
  }

  function getAnalyticsRangeCutoff() {
    const now = Date.now();

    if (analyticsRange === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return start.getTime();
    }

    if (analyticsRange === "30d") {
      return now - 30 * 24 * 60 * 60 * 1000;
    }

    return now - 7 * 24 * 60 * 60 * 1000;
  }

  function filterAnalyticsEventsByRange(events) {
    const cutoff = getAnalyticsRangeCutoff();

    return (Array.isArray(events) ? events : []).filter((event) => {
      const timestamp = Date.parse(event && event.timestamp);
      return Number.isFinite(timestamp) && timestamp >= cutoff;
    });
  }

  function syncAnalyticsRangeUi() {
    analyticsRangeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.analyticsRange === analyticsRange);
    });

    if (analyticsRangeLabel) {
      analyticsRangeLabel.textContent = `${getAnalyticsRangeLabel()} from ${getAnalyticsSourceLabel().toLowerCase()} activity.`;
    }
  }

  function isStorefrontAnalyticsEvent(event) {
    if (!event || typeof event !== "object" || !event.name) {
      return false;
    }

    const payload = event.payload && typeof event.payload === "object" ? event.payload : {};
    const pagePath = String(payload.page_path || "").trim().toLowerCase();
    const pageLocation = String(payload.page_location || "").trim().toLowerCase();
    const pathValue = pagePath || pageLocation;

    if (!pathValue) {
      return true;
    }

    if (pathValue.startsWith("/c:/") || pathValue.startsWith("file:/") || /^[a-z]:\\/i.test(pathValue)) {
      return false;
    }

    if (pathValue.includes("admin.html")) {
      return false;
    }

    return true;
  }

  function getAnalyticsEventProduct(payload) {
    const safePayload = payload && typeof payload === "object" ? payload : {};
    const items = Array.isArray(safePayload.items) ? safePayload.items : [];
    const firstItem = items[0] && typeof items[0] === "object" ? items[0] : {};

    return {
      id: String(safePayload.product_id || firstItem.item_id || "").trim(),
      name: String(safePayload.product_name || firstItem.item_name || "").trim()
    };
  }

  function formatAnalyticsPageLabel(payload) {
    const safePayload = payload && typeof payload === "object" ? payload : {};
    const pagePath = String(safePayload.page_path || "").trim();
    const pageTitle = String(safePayload.page_title || "").trim();
    const rawLabel = pageTitle || pagePath || "Storefront page";

    if (!pagePath) {
      return rawLabel;
    }

    if (pagePath === "/") {
      return "Homepage";
    }

    if (pagePath.startsWith("/product.html")) {
      return pageTitle && !/^product\b/i.test(pageTitle) ? pageTitle : "Product Page";
    }

    if (pagePath.startsWith("/shop.html")) {
      return "Shop";
    }

    if (pagePath.startsWith("/categories.html")) {
      return "Categories";
    }

    if (pagePath.startsWith("/about.html")) {
      return "About";
    }

    if (pagePath.startsWith("/contact.html")) {
      return "Contact";
    }

    return rawLabel;
  }

  function formatAnalyticsSourceLabel(payload) {
    const safePayload = payload && typeof payload === "object" ? payload : {};
    const source = String(safePayload.traffic_source || "").trim() || "Direct";
    const medium = String(safePayload.traffic_medium || "").trim() || "direct";
    const campaign = String(safePayload.traffic_campaign || "").trim();

    return {
      label: source,
      detail: campaign ? `${medium} - ${campaign}` : medium
    };
  }

  async function refreshStorefrontAnalytics(options) {
    const config = options || {};
    remoteStorefrontAnalyticsEvents = [];
    analyticsDataSource = "browser";

    if (
      liveCatalogApi &&
      typeof liveCatalogApi.fetchAnalyticsEvents === "function" &&
      typeof liveCatalogApi.isConfigured === "function" &&
      liveCatalogApi.isConfigured()
    ) {
      const user = currentLiveUser || (await refreshLiveUser());

      if (user) {
        try {
          const remoteEvents = await liveCatalogApi.fetchAnalyticsEvents(200);
          if (Array.isArray(remoteEvents)) {
            remoteStorefrontAnalyticsEvents = remoteEvents;
            analyticsDataSource = "supabase";
          }
        } catch (error) {
          console.error("Unable to load storefront analytics from Supabase.", error);
        }
      }
    }

    renderAnalyticsDashboard();
    renderAdminOverview();

    if (config.showStatus) {
      setStatus(
        analyticsDataSource === "supabase"
          ? "Storefront analytics refreshed from Supabase live activity."
          : "Storefront analytics refreshed from this browser."
      );
    }
  }

  function formatAnalyticsTime(value) {
    const parsed = Date.parse(value || "");
    if (!Number.isFinite(parsed)) {
      return "Unknown time";
    }

    const diffMinutes = Math.max(0, Math.round((Date.now() - parsed) / 60000));
    if (diffMinutes < 1) {
      return "Just now";
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hr ago`;
    }

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  function getAnalyticsEventLabel(name) {
    const labels = {
      page_view: "Page View",
      product_view: "Product View",
      add_to_cart: "Add To Cart",
      whatsapp_click: "WhatsApp Click",
      view_item_list: "List View",
      select_item: "Product Open"
    };

    return labels[name] || String(name || "Event").replace(/_/g, " ");
  }

  function renderAnalyticsDashboard() {
    if (!analyticsSummary || !analyticsConversions || !analyticsProducts || !analyticsSources || !analyticsPages || !analyticsFeed) {
      return;
    }

    const events = filterAnalyticsEventsByRange(
      getStorefrontAnalyticsEvents()
      .filter((event) => event && typeof event === "object" && event.name)
      .sort((left, right) => Date.parse(right.timestamp || "") - Date.parse(left.timestamp || ""))
    );

    const eventCounts = events.reduce(
      (totals, event) => {
        totals.total += 1;
        if (event.name === "product_view") totals.views += 1;
        if (event.name === "add_to_cart") totals.carts += 1;
        if (event.name === "whatsapp_click") totals.whatsapp += 1;
        return totals;
      },
      { total: 0, views: 0, carts: 0, whatsapp: 0 }
    );

    const pageStats = events.reduce((map, event) => {
      if (event.name !== "page_view") {
        return map;
      }

      const payload = event.payload && typeof event.payload === "object" ? event.payload : {};
      const pagePath = String(payload.page_path || "").trim();
      if (!pagePath) {
        return map;
      }

      const key = pagePath;
      if (!map.has(key)) {
        map.set(key, {
          path: pagePath,
          label: formatAnalyticsPageLabel(payload),
          views: 0
        });
      }

      map.get(key).views += 1;
      return map;
    }, new Map());

    const sourceStats = events.reduce((map, event) => {
      if (event.name !== "page_view") {
        return map;
      }

      const payload = event.payload && typeof event.payload === "object" ? event.payload : {};
      const sourceInfo = formatAnalyticsSourceLabel(payload);
      const key = `${sourceInfo.label}|${sourceInfo.detail}`;

      if (!map.has(key)) {
        map.set(key, {
          label: sourceInfo.label,
          detail: sourceInfo.detail,
          visits: 0
        });
      }

      map.get(key).visits += 1;
      return map;
    }, new Map());

    const conversionStats = events.reduce((map, event) => {
      const payload = event.payload && typeof event.payload === "object" ? event.payload : {};
      const productDetails = getAnalyticsEventProduct(payload);
      const productId = productDetails.id;
      const productName = productDetails.name;
      if (!productId && !productName) {
        return map;
      }

      const key = productId || productName;
      if (!map.has(key)) {
        map.set(key, {
          id: productId,
          name: productName || productId || "Unknown product",
          views: 0,
          carts: 0,
          whatsapp: 0,
          intentActions: 0,
          actionRate: 0
        });
      }

      const current = map.get(key);
      if (event.name === "product_view") current.views += 1;
      if (event.name === "add_to_cart") {
        current.carts += 1;
        current.intentActions += 1;
      }
      if (event.name === "whatsapp_click") {
        current.whatsapp += 1;
        current.intentActions += 1;
      }
      current.actionRate = current.views ? Math.round((current.intentActions / current.views) * 100) : 0;
      return map;
    }, new Map());

    const productStats = events.reduce((map, event) => {
      const payload = event.payload && typeof event.payload === "object" ? event.payload : {};
      const productDetails = getAnalyticsEventProduct(payload);
      const productId = productDetails.id;
      const productName = productDetails.name;
      if (!productId && !productName) {
        return map;
      }

      const key = productId || productName;
      if (!map.has(key)) {
        map.set(key, {
          id: productId,
          name: productName || productId || "Unknown product",
          views: 0,
          carts: 0,
          whatsapp: 0,
          score: 0
        });
      }

      const current = map.get(key);
      if (event.name === "product_view") current.views += 1;
      if (event.name === "add_to_cart") current.carts += 1;
      if (event.name === "whatsapp_click") current.whatsapp += 1;
      current.score = current.views + current.carts * 2 + current.whatsapp * 3;
      return map;
    }, new Map());

    const topProducts = Array.from(productStats.values())
      .sort((left, right) => right.score - left.score)
      .slice(0, 6);
    const topSources = Array.from(sourceStats.values())
      .sort((left, right) => right.visits - left.visits)
      .slice(0, 6);
    const topPages = Array.from(pageStats.values())
      .sort((left, right) => right.views - left.views)
      .slice(0, 6);
    const topConversions = Array.from(conversionStats.values())
      .filter((product) => product.intentActions > 0 || product.views > 0)
      .sort((left, right) => {
        if (right.intentActions !== left.intentActions) {
          return right.intentActions - left.intentActions;
        }
        if (right.whatsapp !== left.whatsapp) {
          return right.whatsapp - left.whatsapp;
        }
        if (right.carts !== left.carts) {
          return right.carts - left.carts;
        }
        if (right.actionRate !== left.actionRate) {
          return right.actionRate - left.actionRate;
        }
        return right.views - left.views;
      })
      .slice(0, 6);

    if (analyticsProductsTitle) {
      analyticsProductsTitle.textContent =
        analyticsDataSource === "supabase"
          ? `Most active products across ${getAnalyticsRangeLabel().toLowerCase()}`
          : `Most active products in this browser for ${getAnalyticsRangeLabel().toLowerCase()}`;
    }
    syncAnalyticsRangeUi();

    analyticsSummary.innerHTML = `
      <article class="admin-metric-card">
        <span>Total Events</span>
        <strong>${eventCounts.total}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Product Views</span>
        <strong>${eventCounts.views}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Add To Cart</span>
        <strong>${eventCounts.carts}</strong>
      </article>
      <article class="admin-metric-card">
        <span>WhatsApp Clicks</span>
        <strong>${eventCounts.whatsapp}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Data Source</span>
        <strong>${escapeHtml(getAnalyticsSourceLabel())}</strong>
      </article>
    `;

    analyticsConversions.innerHTML = topConversions.length
      ? topConversions
          .map(
            (product) => `
              <article class="admin-analytics-product-row is-conversion">
                <div class="admin-analytics-product-copy">
                  <strong>${escapeHtml(product.name)}</strong>
                  <span>${product.id ? escapeHtml(product.id) : "Tracked from storefront activity"}</span>
                </div>
                <div class="admin-analytics-product-stats">
                  <strong>${product.intentActions} intent action${product.intentActions === 1 ? "" : "s"}</strong>
                  <span>${product.views} views</span>
                  <span>${product.carts} carts</span>
                  <span>${product.whatsapp} chats</span>
                  <span>${product.actionRate}% action rate</span>
                </div>
              </article>
            `
          )
          .join("")
      : `
          <article class="empty-state-card">
            <strong>No conversion signals in this range</strong>
            <p>Try a wider date range or drive a few product views, cart adds, and WhatsApp taps from the live store.</p>
          </article>
        `;

    analyticsProducts.innerHTML = topProducts.length
      ? topProducts
          .map(
            (product) => `
              <article class="admin-analytics-product-row">
                <div class="admin-analytics-product-copy">
                  <strong>${escapeHtml(product.name)}</strong>
                  <span>${product.id ? escapeHtml(product.id) : "Tracked from storefront activity"}</span>
                </div>
                <div class="admin-analytics-product-stats">
                  <span>${product.views} views</span>
                  <span>${product.carts} carts</span>
                  <span>${product.whatsapp} chats</span>
                </div>
              </article>
            `
          )
          .join("")
      : `
          <article class="empty-state-card">
            <strong>No tracked product activity yet</strong>
            <p>Open the storefront and tap through products, or widen the date range to pull in more live activity.</p>
          </article>
        `;

    analyticsSources.innerHTML = topSources.length
      ? topSources
          .map(
            (source) => `
              <article class="admin-analytics-product-row">
                <div class="admin-analytics-product-copy">
                  <strong>${escapeHtml(source.label)}</strong>
                  <span>${escapeHtml(source.detail)}</span>
                </div>
                <div class="admin-analytics-product-stats">
                  <strong>${source.visits} visit${source.visits === 1 ? "" : "s"}</strong>
                </div>
              </article>
            `
          )
          .join("")
      : `
          <article class="empty-state-card">
            <strong>No source data in this range</strong>
            <p>Share the live website link in a few places or open it from another channel to start seeing source patterns.</p>
          </article>
        `;

    analyticsPages.innerHTML = topPages.length
      ? topPages
          .map(
            (page) => `
              <article class="admin-analytics-product-row">
                <div class="admin-analytics-product-copy">
                  <strong>${escapeHtml(page.label)}</strong>
                  <span>${escapeHtml(page.path)}</span>
                </div>
                <div class="admin-analytics-product-stats">
                  <strong>${page.views} view${page.views === 1 ? "" : "s"}</strong>
                </div>
              </article>
            `
          )
          .join("")
      : `
          <article class="empty-state-card">
            <strong>No page traffic in this range</strong>
            <p>Open a few storefront pages or widen the date range to see which pages are attracting visitors.</p>
          </article>
        `;

    analyticsFeed.innerHTML = events.length
      ? events
          .slice(0, 14)
          .map((event) => {
            const payload = event.payload && typeof event.payload === "object" ? event.payload : {};
            const productDetails = getAnalyticsEventProduct(payload);
            const detail = String(productDetails.name || payload.button_label || payload.page_path || "Storefront action").trim();
            return `
              <article class="admin-analytics-event-row">
                <div class="admin-analytics-event-copy">
                  <strong>${escapeHtml(getAnalyticsEventLabel(event.name))}</strong>
                  <span>${escapeHtml(detail)}</span>
                </div>
                <small>${escapeHtml(formatAnalyticsTime(event.timestamp))}</small>
              </article>
            `;
          })
          .join("")
      : `
          <article class="empty-state-card">
            <strong>No storefront events yet</strong>
            <p>Visit the live store, or widen the date range to pull in older shared activity from Supabase.</p>
          </article>
        `;
  }

  function activateAdminTab(tabName) {
    revealAdminGroupForTab(tabName);

    adminTabButtons.forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute('data-admin-tab') === tabName);
    });

    adminTabPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.getAttribute('data-admin-panel') === tabName);
    });

    switch (tabName) {
      case "workspace":
        renderInlineImageLibrary();
        break;
      case "catalog":
        renderList();
        renderFeaturedManager();
        break;
      case "categories":
        renderCategoryList();
        renderCategoryPreview();
        renderCategoryImageLibrary();
        renderCategoryKanban();
        break;
      case "visuals":
        renderFavoriteProductSelect();
        renderVisualImageLibrary();
        renderVisualPreview();
        break;
      case "preview":
        syncLivePreviewFrame();
        break;
      case "customers":
        renderCustomerDashboard();
        break;
      case "delivery":
        renderDeliveryDesk();
        break;
      case "sales":
        renderSalesDashboard();
        break;
      case "profit":
        renderProfitDashboard();
        break;
      case "analytics":
        renderAnalyticsDashboard();
        break;
      case "social":
        renderSocialCalendar();
        renderSocialMedia();
        renderSocialTracker();
        break;
      case "bundles":
        renderBundles();
        renderGoalCard();
        break;
      default:
        break;
    }
    window.localStorage.setItem(adminTabStorageKey, tabName);
  }

  function syncLivePreviewFrame() {
    if (!previewPageSelect || !previewFrame || !previewOpenLink) {
      return;
    }
    previewFrame.src = previewPageSelect.value;
    previewOpenLink.href = previewPageSelect.value;
  }

  function setPreviewTarget(url, label) {
    if (!previewPageSelect) {
      return;
    }

    const existingOption = Array.from(previewPageSelect.options).find((option) => option.value === url);
    if (!existingOption) {
      const option = document.createElement("option");
      option.value = url;
      option.textContent = label || "Product Page";
      previewPageSelect.appendChild(option);
    }

    previewPageSelect.value = url;
  }

  function renderSelectedGallery() {
    const images = getFormGalleryImages();
    selectedGallery.innerHTML = images
      .map(
        (image, index) => `
          <article class="admin-gallery-chip ${index === 0 ? "is-main" : ""}">
            <img src="${escapeHtml(image)}" alt="Selected gallery image ${index + 1}" />
            <div class="admin-gallery-chip-actions">
              <strong>${index === 0 ? "Main" : "Gallery"}</strong>
              <div>
                ${index === 0 ? "" : `<button type="button" data-action="set-main" data-image="${escapeHtml(image)}">Set Main</button>`}
                ${images.length > 1 ? `<button type="button" data-action="remove" data-image="${escapeHtml(image)}">Remove</button>` : ""}
              </div>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderImageLibrary() {
    const filteredImages = getFilteredProjectImages(imageLibrarySearch ? imageLibrarySearch.value : "", {
      pool: curatedLibraryImages
    });

    renderProjectImageLibrary(
      imageLibrary,
      filteredImages,
      "No matching images",
      "Try a shorter file name or clear the search to see the full project library again."
    );
  }

  function renderInlineImageLibrary() {
    const filteredImages = getFilteredProjectImages(inlineImageSearch ? inlineImageSearch.value : "", {
      pool: curatedLibraryImages,
      limit: 12
    });

    renderProjectImageLibrary(
      inlineImageLibrary,
      filteredImages,
      "No matching product photos",
      "Try part of the file name or clear the search to browse more saved product images."
    );
  }

  async function refreshGalleryManifest() {
    const manifestUrl = `assets/js/image-manifest.js?v=${Date.now()}`;
    const buttons = [refreshGalleryButton, inlineRefreshGalleryButton].filter(Boolean);

    buttons.forEach((button) => {
      button.disabled = true;
      button.textContent = "Refreshing...";
    });

    try {
      const response = await fetch(manifestUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Manifest request failed with status ${response.status}`);
      }

      const scriptText = await response.text();
      const match = scriptText.match(/window\.SharonCraftImageManifest\s*=\s*(\[[\s\S]*\]);?/);
      if (!match) {
        throw new Error("Manifest file format is invalid.");
      }

      const nextManifest = JSON.parse(match[1]);
      if (!Array.isArray(nextManifest)) {
        throw new Error("Manifest data is not a valid image list.");
      }

      window.SharonCraftImageManifest = nextManifest.slice();
      setAvailableImages(nextManifest);
      renderImageLibrary();
      renderInlineImageLibrary();
      renderCategoryImageLibrary();
      renderVisualImageLibrary();
      setStatus(`Project gallery refreshed. ${curatedLibraryImages.length} product photos are ready to use.`);
    } catch (error) {
      console.error("Unable to refresh the image manifest.", error);
      setStatus("Gallery refresh failed. If you added new files, run refresh-image-manifest.ps1 first, then try again.");
    } finally {
      buttons.forEach((button) => {
        button.disabled = false;
        button.textContent = "Refresh Gallery";
      });
    }
  }

  function renderDraftPreview() {
    const images = getFormGalleryImages();
    const currentCategory = categoryMap.get(categoryInput.value) || "Collection";
    const currentBadge = badgeInput.value.trim() || "New";
    const previewSource = temporaryMainPreviewSrc || images[0] || "assets/images/IMG-20260226-WA0005.jpg";
    const currentMomPrice = Number(momPriceInput.value) || 0;
    const currentDeliveryCharge = Number(deliveryChargeInput.value) || 0;
    const currentDeliveryCost = Number(deliveryCostInput.value) || 0;
    const currentProductProfit = Math.max(0, (Number(priceInput.value) || 0) - currentMomPrice);
    const currentDeliveryProfit = Math.max(0, currentDeliveryCharge - currentDeliveryCost);
    const currentTotalProfit = currentProductProfit + currentDeliveryProfit;
    draftBadge.className = badgeClass(currentBadge);
    draftBadge.textContent = currentBadge;
    draftImage.src = previewSource;
    draftCategory.textContent = currentCategory;
    draftTitle.textContent = nameInput.value.trim() || "Your product title";
    draftDescription.textContent =
      descriptionInput.value.trim() || "Your short product description will appear here as you type.";
    draftPrice.textContent = formatPrice(priceInput.value);
    draftProfit.textContent = `Product profit ${formatPrice(currentProductProfit)} + delivery profit ${formatPrice(currentDeliveryProfit)} = total ${formatPrice(currentTotalProfit)}`;
    totalProfitInput.value = formatPrice(currentTotalProfit);
    draftGallery.innerHTML = images
      .slice(0, 4)
      .map((image) => `<img src="${escapeHtml(image)}" alt="Draft gallery preview" loading="lazy" />`)
      .join("");
    imagePreview.src = previewSource;
    renderSelectedGallery();
  }

  function renderList() {
    const keyword = (searchInput.value || "").trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedFeature = featureFilter.value;

    const filtered = catalog.filter((product) => {
      const keywordMatch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword);
      const categoryMatch = !selectedCategory || product.category === selectedCategory;
      const featureMatch =
        !selectedFeature ||
        (selectedFeature === "featured" && product.featured) ||
        (selectedFeature === "new" && product.newArrival);
      return keywordMatch && categoryMatch && featureMatch;
    });

    list.innerHTML = filtered
      .map(
        (product) => `
          <article class="admin-item">
            <img src="${product.images[0]}" alt="${product.name}" />
            <div class="admin-item-copy">
              <strong>${product.name}</strong>
              <span>${categoryMap.get(product.category) || product.category}</span>
              <span>${formatPrice(product.price)}</span>
              <small>${product.featured ? "Featured" : "Standard"} • ${product.newArrival ? "New" : "Collection"} • Profit ${formatPrice(getTotalProfit(product))}</small>
            </div>
            <div class="admin-item-actions">
              <button type="button" data-action="edit" data-id="${product.id}">Edit</button>
              <button type="button" data-action="preview" data-id="${product.id}">Preview</button>
              <button type="button" data-action="delete" data-id="${product.id}">Delete</button>
            </div>
          </article>
        `
      )
      .join("");

    syncPreviewJson();
  }

  function renderList() {
    const keyword = (searchInput.value || "").trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedFeature = featureFilter.value;

    const filtered = catalog.filter((product) => {
      const keywordMatch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword);
      const categoryMatch = !selectedCategory || product.category === selectedCategory;
      const featureMatch =
        !selectedFeature ||
        (selectedFeature === "featured" && product.featured) ||
        (selectedFeature === "new" && product.newArrival);
      return keywordMatch && categoryMatch && featureMatch;
    });

    const visibleFeaturedCount = filtered.filter((product) => product.featured).length;
    const visibleNewCount = filtered.filter((product) => product.newArrival).length;
    const visibleValue = filtered.reduce((sum, product) => sum + (Number(product.price) || 0), 0);

    if (catalogSummary) {
      catalogSummary.innerHTML = `
        <article class="admin-metric-card">
          <span>Showing</span>
          <strong>${filtered.length}</strong>
        </article>
        <article class="admin-metric-card">
          <span>Featured In View</span>
          <strong>${visibleFeaturedCount}</strong>
        </article>
        <article class="admin-metric-card">
          <span>New In View</span>
          <strong>${visibleNewCount}</strong>
        </article>
        <article class="admin-metric-card">
          <span>Visible Value</span>
          <strong>${formatPrice(visibleValue)}</strong>
        </article>
      `;
    }

    if (!filtered.length) {
      list.innerHTML = `
        <article class="empty-state-card admin-catalog-empty">
          <strong>No products match these filters</strong>
          <p>Try a shorter search, change the category, or clear the featured filter to bring products back into view.</p>
        </article>
      `;
      syncPreviewJson();
      return;
    }

    list.innerHTML = filtered
      .map((product) => {
        const categoryName = categoryMap.get(product.category) || product.category;
        const statusLabel = product.featured ? "Featured" : "Standard";
        const freshnessLabel = product.newArrival ? "New Arrival" : "Catalog";
        const description = String(product.shortDescription || product.description || "No description yet.")
          .trim()
          .slice(0, 120);
        const descriptionSuffix = description.length === 120 ? "..." : "";

        return `
          <article class="admin-item">
            <div class="admin-item-media">
              <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
            </div>
            <div class="admin-item-copy">
              <div class="admin-item-head">
                <div class="admin-item-title-group">
                  <strong>${product.name}</strong>
                  <span class="admin-item-category">${categoryName}</span>
                </div>
                <strong class="admin-item-price">${formatPrice(product.price)}</strong>
              </div>
              <p class="admin-item-description">${description}${descriptionSuffix}</p>
              <div class="admin-item-meta-row">
                <span class="admin-item-chip">${statusLabel}</span>
                <span class="admin-item-chip">${freshnessLabel}</span>
                <span class="admin-item-chip">Profit ${formatPrice(getTotalProfit(product))}</span>
              </div>
            </div>
            <div class="admin-item-actions">
              <button type="button" data-action="edit" data-id="${product.id}">Edit</button>
              <button type="button" data-action="preview" data-id="${product.id}">Preview</button>
              <button type="button" data-action="delete" data-id="${product.id}">Delete</button>
            </div>
          </article>
        `;
      })
      .join("");

    syncPreviewJson();
  }

  function getFeaturedProducts() {
    return catalog.filter((product) => product.featured);
  }

  function getHomepageFeaturedProducts() {
    return getFeaturedProducts().slice(0, FEATURED_SLOT_COUNT);
  }

  function swapCatalogProducts(firstId, secondId) {
    const firstIndex = catalog.findIndex((product) => product.id === firstId);
    const secondIndex = catalog.findIndex((product) => product.id === secondId);

    if (firstIndex < 0 || secondIndex < 0 || firstIndex === secondIndex) {
      return;
    }

    const nextCatalog = catalog.slice();
    const firstProduct = nextCatalog[firstIndex];
    nextCatalog[firstIndex] = nextCatalog[secondIndex];
    nextCatalog[secondIndex] = firstProduct;
    catalog = nextCatalog;
  }

  function moveCatalogProductToIndex(productId, targetIndex) {
    const currentIndex = catalog.findIndex((product) => product.id === productId);
    if (currentIndex < 0) {
      return;
    }

    const boundedIndex = Math.max(0, Math.min(targetIndex, catalog.length - 1));
    if (currentIndex === boundedIndex) {
      return;
    }

    const nextCatalog = catalog.slice();
    const [movedProduct] = nextCatalog.splice(currentIndex, 1);
    nextCatalog.splice(boundedIndex, 0, movedProduct);
    catalog = nextCatalog;
  }

  function setProductFeatured(productId, nextFeatured) {
    catalog = catalog.map((product) =>
      product.id === productId ? { ...product, featured: nextFeatured } : product
    );
  }

  function replaceHomepageSlot(slotIndex, nextProductId) {
    const featuredProducts = getHomepageFeaturedProducts();
    const currentProduct = featuredProducts[slotIndex];
    const nextProduct = catalog.find((product) => product.id === nextProductId);

    if (!nextProduct) {
      return false;
    }

    if (currentProduct && currentProduct.id === nextProductId) {
      return false;
    }

    if (currentProduct) {
      const currentIndex = catalog.findIndex((product) => product.id === currentProduct.id);
      setProductFeatured(currentProduct.id, false);
      setProductFeatured(nextProductId, true);
      moveCatalogProductToIndex(nextProductId, currentIndex);
    } else {
      setProductFeatured(nextProductId, true);
      if (slotIndex === 0) {
        moveCatalogProductToIndex(nextProductId, 0);
      } else {
        const previousSlot = featuredProducts[Math.max(0, slotIndex - 1)];
        if (previousSlot) {
          const previousIndex = catalog.findIndex((product) => product.id === previousSlot.id);
          moveCatalogProductToIndex(nextProductId, previousIndex + 1);
        } else {
          moveCatalogProductToIndex(nextProductId, slotIndex);
        }
      }
    }

    return true;
  }

  function moveFeaturedSlot(productId, direction) {
    const featuredProducts = getHomepageFeaturedProducts();
    const currentIndex = featuredProducts.findIndex((product) => product.id === productId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= featuredProducts.length) {
      return false;
    }

    swapCatalogProducts(featuredProducts[currentIndex].id, featuredProducts[targetIndex].id);
    activeFeaturedSlotIndex = targetIndex;
    return true;
  }

  function getFeaturedCategoryRepeatCount(products) {
    const counts = products.reduce((map, product) => {
      const key = product.category || "";
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map());

    return Array.from(counts.values()).reduce((total, count) => total + Math.max(0, count - 1), 0);
  }

  function renderFeaturedManager() {
    const featuredProducts = getFeaturedProducts();
    const homepageFeatured = featuredProducts.slice(0, FEATURED_SLOT_COUNT);
    const overflowCount = Math.max(0, featuredProducts.length - FEATURED_SLOT_COUNT);
    const repeatedCategories = getFeaturedCategoryRepeatCount(homepageFeatured);
    const newCount = homepageFeatured.filter((product) => product.newArrival).length;
    const candidateQuery = featuredSearchInput ? featuredSearchInput.value.trim().toLowerCase() : "";
    const candidateProducts = catalog
      .filter((product) => !homepageFeatured.some((featuredProduct) => featuredProduct.id === product.id))
      .filter((product) => {
        if (!candidateQuery) {
          return true;
        }

        return (
          product.name.toLowerCase().includes(candidateQuery) ||
          product.category.toLowerCase().includes(candidateQuery) ||
          String(product.description || "").toLowerCase().includes(candidateQuery)
        );
      })
      .slice(0, 12);

    if (activeFeaturedSlotIndex >= FEATURED_SLOT_COUNT) {
      activeFeaturedSlotIndex = 0;
    }

    featuredSummary.innerHTML = `
      <div class="admin-summary-pill">${homepageFeatured.length} of ${FEATURED_SLOT_COUNT} homepage spots used</div>
      <div class="admin-summary-pill">${newCount} new arrivals in view</div>
      <div class="admin-summary-pill">${repeatedCategories} repeated categories</div>
      ${overflowCount ? `<div class="admin-summary-pill">${overflowCount} extra featured item${overflowCount === 1 ? "" : "s"} hidden from homepage</div>` : ""}
      ${homepageFeatured.map((product) => `<span class="admin-summary-tag">${product.name}</span>`).join("")}
    `;

    featuredManager.innerHTML = Array.from({ length: FEATURED_SLOT_COUNT }, (_, slotIndex) => {
      const product = homepageFeatured[slotIndex];
      const isActive = slotIndex === activeFeaturedSlotIndex;

      if (!product) {
        return `
          <article class="admin-featured-slot ${isActive ? "is-active" : ""}" data-featured-slot="${slotIndex}">
            <button class="admin-featured-slot-select" type="button" data-featured-slot-select="${slotIndex}">
              <span class="admin-summary-pill">Slot ${slotIndex + 1}</span>
              <strong>Empty homepage spot</strong>
              <p>Choose this slot, then add a product from the candidate shelf.</p>
            </button>
          </article>
        `;
      }

      return `
        <article class="admin-featured-slot ${isActive ? "is-active" : ""}" data-featured-slot="${slotIndex}">
          <button class="admin-featured-slot-select" type="button" data-featured-slot-select="${slotIndex}">
            <span class="admin-summary-pill">Slot ${slotIndex + 1}</span>
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
            <div class="admin-featured-slot-copy">
              <strong>${product.name}</strong>
              <span>${categoryMap.get(product.category) || product.category}</span>
              <span class="admin-featured-slot-price">${formatPrice(product.price)}</span>
            </div>
          </button>
          <div class="admin-featured-slot-actions">
            <button type="button" data-featured-move="${product.id}" data-direction="-1" ${slotIndex === 0 ? "disabled" : ""}>Left</button>
            <button type="button" data-featured-move="${product.id}" data-direction="1" ${slotIndex === homepageFeatured.length - 1 ? "disabled" : ""}>Right</button>
            <button type="button" data-featured-edit="${product.id}">Edit</button>
            <button type="button" data-featured-remove="${product.id}">Remove</button>
          </div>
        </article>
      `;
    }).join("");

    if (featuredCandidates) {
      featuredCandidates.innerHTML = candidateProducts.length
        ? candidateProducts
            .map((product) => `
              <article class="admin-featured-candidate">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
                <div class="admin-featured-candidate-copy">
                  <strong>${product.name}</strong>
                  <span>${categoryMap.get(product.category) || product.category}</span>
                  <span>${formatPrice(product.price)}</span>
                </div>
                <button type="button" data-featured-add="${product.id}">
                  ${homepageFeatured[activeFeaturedSlotIndex] ? `Use In Slot ${activeFeaturedSlotIndex + 1}` : "Add To Homepage"}
                </button>
              </article>
            `)
            .join("")
        : `
            <article class="empty-state-card admin-featured-empty">
              <strong>No matching candidate products</strong>
              <p>Try a shorter search or remove a homepage slot product to make space for another choice.</p>
            </article>
          `;
    }
  }

  function renderProfitProductSelect() {
    if (!profitProductSelect) {
      return;
    }

    profitProductSelect.innerHTML = [`<option value="">Choose product</option>`]
      .concat(catalog.map((product) => `<option value="${product.id}">${product.name}</option>`))
      .join("");
  }

  function renderProfitBreakdown() {
    if (!profitBreakdown || !profitProductSelect) {
      return;
    }

    const product = catalog.find((item) => item.id === profitProductSelect.value);
    if (!product) {
      profitBreakdown.innerHTML = `
        <article class="admin-profit-break-card">
          <div><span>No saved profit history yet.</span><strong>Start by adding Mom price and delivery values.</strong></div>
        </article>
      `;
      return;
    }

    const quantity = Math.max(1, Number(profitQuantityInput.value) || 1);
    const momPrice = Number(profitOrderMomPriceInput.value || product.momPrice) || 0;
    const sellingPrice = Number(profitOrderPriceInput.value || product.price) || 0;
    const deliveryCharge = Number(profitOrderDeliveryChargeInput.value || product.deliveryCharge) || 0;
    const deliveryCost = Number(profitOrderDeliveryCostInput.value || product.deliveryCost) || 0;
    const costTotal = momPrice * quantity;
    const productProfit = momPrice && sellingPrice ? Math.max(0, (sellingPrice - momPrice) * quantity) : 0;
    const deliveryProfit = getDeliveryProfit(product, quantity, deliveryCharge, deliveryCost);
    const totalProfit = productProfit + deliveryProfit;

    profitBreakdown.innerHTML = `
      <article class="admin-profit-break-card">
        <div><span>Mom cost total</span><strong>${formatPrice(costTotal)}</strong></div>
        <div><span>Selling total</span><strong>${formatPrice(sellingPrice * quantity)}</strong></div>
        <div><span>Product profit</span><strong>${formatPrice(productProfit)}</strong></div>
        <div><span>Delivery profit</span><strong>${formatPrice(deliveryProfit)}</strong></div>
        <div><span>Total profit</span><strong>${formatPrice(totalProfit)}</strong></div>
      </article>
    `;
  }

  function renderProfitDashboard() {
    if (!profitMetrics || !profitTable) {
      return;
    }

    const productsWithProfit = catalog.filter(hasProfitHistory);

    const totals = catalog.reduce(
      (accumulator, product) => {
        accumulator.momCost += Number(product.momPrice) || 0;
        accumulator.productProfit += getProductProfit(product);
        accumulator.deliveryProfit += getDeliveryProfit(product);
        accumulator.totalProfit += getTotalProfit(product);
        return accumulator;
      },
      { momCost: 0, productProfit: 0, deliveryProfit: 0, totalProfit: 0 }
    );

    profitMetrics.innerHTML = `
      <article class="admin-metric-card">
        <span>Mom Cost Total</span>
        <strong>${formatPrice(totals.momCost)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Product Profit</span>
        <strong>${formatPrice(totals.productProfit)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Delivery Profit</span>
        <strong>${formatPrice(totals.deliveryProfit)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Total Profit</span>
        <strong>${formatPrice(totals.totalProfit)}</strong>
      </article>
    `;

    profitTable.innerHTML = productsWithProfit.length
      ? productsWithProfit
          .map(
            (product) => `
              <article class="admin-profit-row">
                <div>
                  <strong>${product.name}</strong>
                  <span>${categoryMap.get(product.category) || product.category}</span>
                </div>
                <span>Mom ${formatPrice(product.momPrice)}</span>
                <span>Sell ${formatPrice(product.price)}</span>
                <span>Delivery ${formatPrice(product.deliveryCharge)} / Cost ${formatPrice(product.deliveryCost)}</span>
                <strong>${formatPrice(getTotalProfit(product))}</strong>
              </article>
            `
          )
          .join("")
      : `
          <article class="admin-profit-row">
            <div>
              <strong>No profit history yet</strong>
              <span>Reset cleared the old entries. Add new Mom price and delivery values to see products here again.</span>
            </div>
            <strong>${formatPrice(0)}</strong>
          </article>
        `;

    renderProfitBreakdown();
  }

  function syncProfitCalculatorFromSelection() {
    if (!profitProductSelect) {
      return;
    }

    const product = catalog.find((item) => item.id === profitProductSelect.value);
    if (!product) {
      profitOrderMomPriceInput.value = "";
      profitOrderPriceInput.value = "";
      profitOrderDeliveryChargeInput.value = "";
      profitOrderDeliveryCostInput.value = "";
      return;
    }

    profitOrderMomPriceInput.value = product.momPrice || "";
    profitOrderPriceInput.value = product.price || "";
    profitOrderDeliveryChargeInput.value = product.deliveryCharge || "";
    profitOrderDeliveryCostInput.value = product.deliveryCost || "";
    if (!profitQuantityInput.value) {
      profitQuantityInput.value = 1;
    }
    renderProfitBreakdown();
  }

  async function saveOrders(message) {
    const savedLocally = safeLocalStorageSetItem(ordersKey, JSON.stringify(orders), "orders");
    renderOrders();
    renderCustomerDashboard();
    renderDeliveryDesk();
    renderGoalCard();
    renderAdminOverview();

    if (
      !liveCatalogApi ||
      typeof liveCatalogApi.isConfigured !== "function" ||
      typeof liveCatalogApi.saveOrders !== "function" ||
      !liveCatalogApi.isConfigured()
    ) {
      if (message) {
        setStatus(savedLocally ? `${message} Saved locally only because Supabase order sync is not configured here.` : `${message} Local save failed because browser storage is full.`);
      }
      return false;
    }

    const user = currentLiveUser || (await refreshLiveUser());
    if (!user) {
      if (message) {
        const prefix = savedLocally ? message : `${message} Local save failed because browser storage is full.`;
        setStatus(`${prefix} Sign in to Supabase so customers can track this order online.`);
      }
      return false;
    }

    try {
      await liveCatalogApi.saveOrders(orders);
      if (message) {
        setStatus(`${message} Customer tracking is live too.`);
      }
      return true;
    } catch (error) {
      console.error("Unable to sync orders to Supabase.", error);
      if (error && /sign in/i.test(String(error.message || ""))) {
        currentLiveUser = null;
        renderLiveAuthState();
      } else {
        setLiveAuthState("Signed in, but live order sync failed. Check Supabase order tables or permissions.", "error");
      }
      if (message) {
        const prefix = savedLocally ? message : `${message} Local save failed because browser storage is full.`;
        setStatus(`${prefix} Online order tracking did not sync.`);
      }
      return false;
    }
  }

  async function removeOrder(orderId, message) {
    const savedLocally = safeLocalStorageSetItem(ordersKey, JSON.stringify(orders), "orders");
    renderOrders();
    renderCustomerDashboard();
    renderDeliveryDesk();
    renderGoalCard();
    renderAdminOverview();

    if (
      !liveCatalogApi ||
      typeof liveCatalogApi.isConfigured !== "function" ||
      typeof liveCatalogApi.deleteOrder !== "function" ||
      !liveCatalogApi.isConfigured()
    ) {
      if (message) {
        setStatus(savedLocally ? `${message} Removed locally only because Supabase order sync is not configured here.` : `${message} Local save failed because browser storage is full.`);
      }
      return false;
    }

    const user = currentLiveUser || (await refreshLiveUser());
    if (!user) {
      if (message) {
        const prefix = savedLocally ? message : `${message} Local save failed because browser storage is full.`;
        setStatus(`${prefix} Sign in to Supabase so the live tracking record can be removed too.`);
      }
      return false;
    }

    try {
      await liveCatalogApi.deleteOrder(orderId);
      if (message) {
        setStatus(`${message} Live tracking record removed too.`);
      }
      return true;
    } catch (error) {
      console.error("Unable to delete order from Supabase.", error);
      if (message) {
        const prefix = savedLocally ? message : `${message} Local save failed because browser storage is full.`;
        setStatus(`${prefix} The live tracking record could not be removed.`);
      }
      return false;
    }
  }

  async function clearAllOrders(message) {
    const savedLocally = safeLocalStorageSetItem(ordersKey, JSON.stringify(orders), "orders");
    renderOrders();
    renderCustomerDashboard();
    renderDeliveryDesk();
    renderGoalCard();
    renderAdminOverview();

    if (
      !liveCatalogApi ||
      typeof liveCatalogApi.isConfigured !== "function" ||
      typeof liveCatalogApi.clearOrders !== "function" ||
      !liveCatalogApi.isConfigured()
    ) {
      if (message) {
        setStatus(savedLocally ? `${message} Cleared locally only because Supabase order sync is not configured here.` : `${message} Local save failed because browser storage is full.`);
      }
      return false;
    }

    const user = currentLiveUser || (await refreshLiveUser());
    if (!user) {
      if (message) {
        const prefix = savedLocally ? message : `${message} Local save failed because browser storage is full.`;
        setStatus(`${prefix} Sign in to Supabase to clear the live order list too.`);
      }
      return false;
    }

    try {
      await liveCatalogApi.clearOrders();
      if (message) {
        setStatus(`${message} Live order tracking was cleared too.`);
      }
      return true;
    } catch (error) {
      console.error("Unable to clear orders from Supabase.", error);
      if (message) {
        const prefix = savedLocally ? message : `${message} Local save failed because browser storage is full.`;
        setStatus(`${prefix} The live order list could not be cleared.`);
      }
      return false;
    }
  }

  function saveDeliveryAreas(message) {
    window.localStorage.setItem(deliveryAreasKey, JSON.stringify(deliveryAreas));
    renderDeliveryAreas();
    renderOrderAreaSelect();
    renderDeliveryDesk();
    if (message) {
      setStatus(message);
    }
  }

  function saveExpenses(message) {
    window.localStorage.setItem(expensesKey, JSON.stringify(expenses));
    renderExpenses();
    renderGoalCard();
    if (message) {
      setStatus(message);
    }
  }

  function saveGoal(message) {
    window.localStorage.setItem(goalKey, JSON.stringify(kioskGoal));
    renderGoalCard();
    if (message) {
      setStatus(message);
    }
  }

  function saveBundles(message) {
    window.localStorage.setItem(bundlesKey, JSON.stringify(bundles));
    renderBundles();
    renderAdminOverview();
    if (message) {
      setStatus(message);
    }
  }

  function saveReplyTemplates(message) {
    window.localStorage.setItem(replyTemplatesKey, JSON.stringify(replyTemplates));
    renderReplyTemplates();
    renderAdminOverview();
    if (message) {
      setStatus(message);
    }
  }

  function renderOrderProductSelect() {
    if (!orderProductSelect) {
      return;
    }

    orderProductSelect.innerHTML = catalog
      .map((product) => `<option value="${product.id}">${product.name}</option>`)
      .join("");
  }

  function renderOrderAreaSelect() {
    if (!orderAreaSelect) {
      return;
    }

    orderAreaSelect.innerHTML = [`<option value="">Choose delivery area</option>`]
      .concat(deliveryAreas.map((area) => `<option value="${area.id}">${area.name}</option>`))
      .join("");
  }

  function renderOrdersOld() {
    if (!orderList || !orderMetrics) {
      return;
    }

    const totals = orders.reduce(
      (accumulator, order) => {
        accumulator.count += 1;
        accumulator.profit += Number(order.totalProfit) || 0;
        if (order.status === "paid" || order.status === "delivered") {
          accumulator.completed += 1;
        }
        return accumulator;
      },
      { count: 0, completed: 0, profit: 0 }
    );

    orderMetrics.innerHTML = `
      <article class="admin-metric-card">
        <span>Orders</span>
        <strong>${totals.count}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Completed</span>
        <strong>${totals.completed}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Order Profit</span>
        <strong>${formatPrice(totals.profit)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Pending</span>
        <strong>${Math.max(0, totals.count - totals.completed)}</strong>
      </article>
    `;

    orderList.innerHTML = orders.length
      ? orders
          .map(
            (order) => `
              <article class="admin-order-row">
                <div>
                  <strong>${order.customer}</strong>
                  <span>${order.productName} x${order.quantity}</span>
                  <span>${order.areaName || "No area"} · ${order.phone || "No phone"}</span>
                </div>
                <span>${formatPrice(order.totalProfit)}</span>
                <select data-order-status="${order.id}">
                  <option value="new" ${order.status === "new" ? "selected" : ""}>New</option>
                  <option value="confirmed" ${order.status === "confirmed" ? "selected" : ""}>Confirmed</option>
                  <option value="paid" ${order.status === "paid" ? "selected" : ""}>Paid</option>
                  <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Delivered</option>
                </select>
                <button type="button" data-order-delete="${order.id}">Delete</button>
              </article>
            `
          )
          .join("")
      : `
          <article class="admin-order-row">
            <div>
              <strong>No orders yet</strong>
              <span>Orders you save here will help you track customers, profit, and delivery progress.</span>
            </div>
          </article>
        `;
  }

  function renderOrdersLegacy() {
    if (!orderList || !orderMetrics) {
      return;
    }

    const totals = orders.reduce(
      (accumulator, order) => {
        accumulator.count += 1;
        accumulator.profit += Number(order.totalProfit) || 0;
        if (order.status === "delivered") {
          accumulator.delivered += 1;
        } else if (order.status === "cancelled") {
          accumulator.cancelled += 1;
        } else {
          accumulator.active += 1;
        }
        return accumulator;
      },
      { count: 0, delivered: 0, active: 0, cancelled: 0, profit: 0 }
    );

    orderMetrics.innerHTML = `
      <article class="admin-metric-card">
        <span>Orders</span>
        <strong>${totals.count}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Active</span>
        <strong>${totals.active}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Order Profit</span>
        <strong>${formatPrice(totals.profit)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Delivered</span>
        <strong>${totals.delivered}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Cancelled</span>
        <strong>${totals.cancelled}</strong>
      </article>
    `;

    orderList.innerHTML = orders.length
      ? orders
          .map(
            (order) => `
              <article class="admin-order-row">
                <div>
                  <strong>${order.customer}</strong>
                  <span>${order.productName} x${order.quantity}</span>
                  <span>Order ID: ${order.orderId || order.id}</span>
                  <span>${order.areaName || "No area"} · ${order.phone || "No phone"}</span>
                  <span>${formatDate(order.createdAt)} · ${order.orderTotal ? formatPrice(order.orderTotal) : "Total not set"}</span>
                  <div class="admin-inline-actions">
                    <button type="button" data-order-copy-id="${order.id}">Copy ID</button>
                    <button type="button" data-order-copy-link="${order.id}">Copy Track Link</button>
                    <button type="button" data-order-open-link="${order.id}">Open Tracking</button>
                  </div>
                </div>
                <span>${formatPrice(order.totalProfit)}</span>
                <select data-order-status="${order.id}">
                  ${ORDER_STATUS_OPTIONS.map(
                    (status) => `<option value="${status.value}" ${order.status === status.value ? "selected" : ""}>${status.label}</option>`
                  ).join("")}
                </select>
                <button type="button" data-order-delete="${order.id}">Delete</button>
              </article>
            `
          )
          .join("")
      : `
          <article class="admin-order-row">
            <div>
              <strong>No orders yet</strong>
              <span>Orders you save here will help you track customers, profit, and delivery progress.</span>
            </div>
          </article>
        `;
  }

  function renderOrders() {
    if (!orderList || !orderMetrics) {
      return;
    }

    const totals = orders.reduce(
      (accumulator, order) => {
        accumulator.count += 1;
        accumulator.profit += Number(order.totalProfit) || 0;
        if (order.status === "delivered") {
          accumulator.delivered += 1;
        } else if (order.status === "cancelled") {
          accumulator.cancelled += 1;
        } else {
          accumulator.active += 1;
        }
        return accumulator;
      },
      { count: 0, delivered: 0, active: 0, cancelled: 0, profit: 0 }
    );
    const visibleOrders = getVisibleOrders();

    orderMetrics.innerHTML = `
      <article class="admin-metric-card">
        <span>Orders</span>
        <strong>${totals.count}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Active</span>
        <strong>${totals.active}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Order Profit</span>
        <strong>${formatPrice(totals.profit)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Delivered</span>
        <strong>${totals.delivered}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Cancelled</span>
        <strong>${totals.cancelled}</strong>
      </article>
    `;

    orderList.innerHTML = visibleOrders.length
      ? visibleOrders
          .map(
            (order) => `
              <article class="admin-order-row">
                <div class="admin-order-main">
                  <div class="admin-order-summary">
                    <strong>${order.productName} x${order.quantity}</strong>
                    <span>${order.customer || "Walk-in customer"}</span>
                  </div>
                  <div class="admin-order-meta">
                    <span>Order ID: ${order.orderId || order.id}</span>
                    <span>${order.phone || "No phone"}</span>
                    <span>${formatDate(order.createdAt)}</span>
                    <span>${order.orderTotal ? formatPrice(order.orderTotal) : "Total not set"}</span>
                  </div>
                </div>
                <div class="admin-order-status-cell">
                  <span class="admin-order-chip ${getOrderStatusClass(order.status)}">${getOrderStatusLabel(order.status)}</span>
                  <select data-order-status="${order.id}">
                    ${ORDER_STATUS_OPTIONS.map(
                      (status) => `<option value="${status.value}" ${order.status === status.value ? "selected" : ""}>${status.label}</option>`
                    ).join("")}
                  </select>
                </div>
                <div class="admin-order-actions">
                  <button type="button" data-order-track="${order.id}">Track</button>
                  <button type="button" data-order-edit="${order.id}">Edit</button>
                  <button type="button" data-order-toggle="${order.id}">${expandedOrderId === order.id ? "Hide Details" : "Details"}</button>
                  <button type="button" data-order-delete="${order.id}">Delete</button>
                </div>
                ${expandedOrderId === order.id ? `
                  <div class="admin-order-detail-grid">
                    <div class="admin-order-detail-card">
                      <label>Customer</label>
                      <strong>${order.customer || "Walk-in customer"}</strong>
                      <span>${order.phone || "No phone saved"}</span>
                    </div>
                    <div class="admin-order-detail-card">
                      <label>Delivery</label>
                      <strong>${order.areaName || "No area selected"}</strong>
                      <span>Quantity ${order.quantity}</span>
                    </div>
                    <div class="admin-order-detail-card">
                      <label>Money</label>
                      <strong>${order.orderTotal ? formatPrice(order.orderTotal) : "Total not set"}</strong>
                      <span>Profit ${formatPrice(order.totalProfit)}</span>
                    </div>
                    <div class="admin-order-detail-card">
                      <label>Tracking Note</label>
                      <strong>${order.note || "No customer note"}</strong>
                      <span>Updated ${formatDate(order.updatedAt || order.createdAt)}</span>
                    </div>
                  </div>
                ` : ""}
              </article>
            `
          )
          .join("")
      : `
          <article class="admin-order-row admin-order-empty">
            <div>
              <strong>${orders.length ? "No matching orders" : "No orders yet"}</strong>
              <span>${orders.length ? "Try a different search term or switch the status filter." : "Orders you save here will help you track customers, profit, and delivery progress."}</span>
            </div>
          </article>
        `;
  }

  function renderCustomerDashboard() {
    if (!customerMetrics || !customerList || !customerHighlight) {
      return;
    }

    const allCustomers = getCustomerRecords();
    const customers = getFilteredCustomerRecords();
    const repeatCustomers = allCustomers.filter((customer) => customer.orders > 1);
    const defaultCustomer = customers[0] || allCustomers[0] || null;
    if (customers.length && !customers.some((customer) => customer.key === selectedCustomerKey)) {
      selectedCustomerKey = customers[0].key;
    } else if (!selectedCustomerKey || !allCustomers.some((customer) => customer.key === selectedCustomerKey)) {
      selectedCustomerKey = defaultCustomer ? defaultCustomer.key : "";
    }

    const selectedCustomer =
      allCustomers.find((customer) => customer.key === selectedCustomerKey) ||
      defaultCustomer;
    const selectedCustomerOrders = selectedCustomer ? getOrdersForCustomer(selectedCustomer.key) : [];
    const repeatOrderCount = repeatCustomers.reduce((sum, customer) => sum + customer.orders, 0);
    const repeatRate = orders.length ? Math.round((repeatOrderCount / orders.length) * 100) : 0;
    const followupCustomers = allCustomers
      .filter((customer) => customer.phone || customer.orders > 1)
      .sort((left, right) => {
        const leftAge = new Date(left.lastOrderAt || 0).getTime();
        const rightAge = new Date(right.lastOrderAt || 0).getTime();
        if (right.orders !== left.orders) {
          return right.orders - left.orders;
        }
        return leftAge - rightAge;
      })
      .slice(0, 4);

    if (customerSearchInput) {
      customerSearchInput.value = customerSearchTerm;
    }

    customerMetrics.innerHTML = `
      <article class="admin-metric-card">
        <span>Unique Customers</span>
        <strong>${allCustomers.length}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Repeat Customers</span>
        <strong>${allCustomers.filter((customer) => customer.orders > 1).length}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Repeat Order Rate</span>
        <strong>${repeatRate}%</strong>
      </article>
      <article class="admin-metric-card">
        <span>Best Customer Profit</span>
        <strong>${allCustomers[0] ? formatPrice(allCustomers[0].totalProfit) : formatPrice(0)}</strong>
      </article>
    `;

    customerHighlight.innerHTML = selectedCustomer
      ? `
          <article class="admin-customer-focus">
            <strong>${escapeHtml(selectedCustomer.customer)}</strong>
            <span>${escapeHtml(selectedCustomer.phone || "No phone saved")}</span>
            <p>${selectedCustomer.orders} orders, ${selectedCustomer.totalUnits} items, and ${formatPrice(selectedCustomer.totalProfit)} profit so far.</p>
            <div class="admin-customer-tags">
              ${selectedCustomer.products.slice(0, 6).map((product) => `<span class="admin-summary-tag">${escapeHtml(product)}</span>`).join("")}
            </div>
            <div class="admin-inline-actions">
              ${selectedCustomer.phone ? `<button type="button" data-customer-copy="${escapeHtml(selectedCustomer.phone)}">Copy Phone</button>` : ""}
              <button type="button" data-customer-orders="${escapeHtml(selectedCustomer.key)}">Open Orders</button>
              ${buildWhatsappLink(selectedCustomer.phone) ? `<a class="button button-secondary" href="${escapeHtml(buildWhatsappLink(selectedCustomer.phone))}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}
            </div>
            <div class="admin-order-detail-grid">
              ${selectedCustomerOrders
                .slice(0, 3)
                .map(
                  (order) => `
                    <div class="admin-order-detail-card">
                      <label>${escapeHtml(getOrderStatusLabel(order.status))}</label>
                      <strong>${escapeHtml(order.productName || "Product")}</strong>
                      <span>${escapeHtml(formatDateLabel(order.updatedAt || order.createdAt))}</span>
                    </div>
                  `
                )
                .join("")}
            </div>
          </article>
        `
      : `
          <article class="admin-customer-focus">
            <strong>No customer data yet</strong>
            <p>Save a few orders first and this tab will show your repeat buyers and strongest customer relationships.</p>
          </article>
        `;

    customerList.innerHTML = customers.length
      ? customers
          .map(
            (customer) => `
              <article class="admin-customer-row ${selectedCustomerKey === customer.key ? "is-active" : ""}" data-customer-select="${escapeHtml(customer.key)}">
                <div>
                  <strong>${escapeHtml(customer.customer)}</strong>
                  <span>${escapeHtml(customer.phone || "No phone saved")}</span>
                  <span>Last order ${escapeHtml(formatDateLabel(customer.lastOrderAt))}</span>
                </div>
                <span>${customer.orders} orders</span>
                <span>${customer.totalUnits} items</span>
                <strong>${formatPrice(customer.totalProfit)}</strong>
              </article>
            `
          )
          .join("")
      : `
          <article class="admin-customer-row">
            <div>
              <strong>${allCustomers.length ? "No matching customers" : "No repeat customers yet"}</strong>
              <span>${allCustomers.length ? "Try a shorter search term or clear the search box." : "Customer names will appear here automatically from the Orders tab."}</span>
            </div>
          </article>
        `;

    if (customerFollowups) {
      customerFollowups.innerHTML = followupCustomers.length
        ? followupCustomers
            .map(
              (customer) => `
                <article class="admin-customer-row" data-customer-select="${escapeHtml(customer.key)}">
                  <div>
                    <strong>${escapeHtml(customer.customer)}</strong>
                    <span>${customer.orders > 1 ? "Repeat buyer worth checking in on" : "Recent buyer who may be ready for a follow-up"}</span>
                  </div>
                  <span>${escapeHtml(formatDateLabel(customer.lastOrderAt))}</span>
                </article>
              `
            )
            .join("")
        : `
            <article class="admin-customer-row">
              <div>
                <strong>No follow-up ideas yet</strong>
                <span>Save more orders and this space will surface warm customer reminders.</span>
              </div>
            </article>
          `;
    }
  }

  function renderDeliveryDesk() {
    if (!deliveryMetrics || !deliveryBoard || !deliveryFocus) {
      return;
    }

    const statusDefinitions = [
      { value: "new", label: "New", helper: "Just saved or still waiting for confirmation" },
      { value: "confirmed", label: "Confirmed", helper: "Customer is committed but payment or dispatch is still pending" },
      { value: "paid", label: "Paid", helper: "Ready for dispatch or final handoff" },
      { value: "delivered", label: "Delivered", helper: "Completed orders" },
      { value: "cancelled", label: "Cancelled", helper: "Stopped before completion" }
    ];

    const sortedOrders = [...orders].sort((left, right) => {
      const weightDifference = getOrderPriorityWeight(left) - getOrderPriorityWeight(right);
      if (weightDifference !== 0) {
        return weightDifference;
      }
      return new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime();
    });

    const needsAttention = sortedOrders.filter((order) => ["new", "confirmed"].includes(normalizeOrderStatus(order.status))).length;
    const readyToDispatch = sortedOrders.filter((order) => normalizeOrderStatus(order.status) === "paid").length;
    const deliveredCount = sortedOrders.filter((order) => normalizeOrderStatus(order.status) === "delivered").length;
    const overdueCount = sortedOrders.filter((order) => {
      const status = normalizeOrderStatus(order.status);
      const age = Date.now() - new Date(order.createdAt || 0).getTime();
      return ["new", "confirmed", "paid"].includes(status) && age > 2 * 24 * 60 * 60 * 1000;
    }).length;

    deliveryMetrics.innerHTML = `
      <article class="admin-metric-card">
        <span>Need Attention</span>
        <strong>${needsAttention}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Ready to Dispatch</span>
        <strong>${readyToDispatch}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Delivered</span>
        <strong>${deliveredCount}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Over 2 Days Old</span>
        <strong>${overdueCount}</strong>
      </article>
    `;

    deliveryBoard.innerHTML = statusDefinitions
      .map((statusDefinition) => {
        const columnOrders = sortedOrders.filter((order) => normalizeOrderStatus(order.status) === statusDefinition.value);
        return `
          <article class="admin-delivery-column">
            <div class="admin-delivery-column-head">
              <div>
                <strong>${statusDefinition.label}</strong>
                <span>${statusDefinition.helper}</span>
              </div>
              <span class="admin-summary-pill">${columnOrders.length}</span>
            </div>
            <div class="admin-delivery-column-body">
              ${columnOrders.length
                ? columnOrders
                    .map((order) => {
                      const nextStatus = getNextOrderStatusValue(order.status);
                      const previousStatus = getPreviousOrderStatusValue(order.status);
                      return `
                        <article class="admin-delivery-card">
                          <div class="admin-delivery-card-copy">
                            <strong>${escapeHtml(order.customer || "Walk-in customer")}</strong>
                            <span>${escapeHtml(order.productName || "Product")} | ${Math.max(1, Number(order.quantity) || 1)} item${Math.max(1, Number(order.quantity) || 1) === 1 ? "" : "s"}</span>
                            <span>${escapeHtml(order.areaName || "Area not set")} | ${escapeHtml(order.id || "")}</span>
                          </div>
                          <div class="admin-inline-actions">
                            ${previousStatus !== normalizeOrderStatus(order.status) ? `<button type="button" data-delivery-move="${escapeHtml(order.id)}" data-delivery-status="${previousStatus}">Back</button>` : ""}
                            ${nextStatus !== normalizeOrderStatus(order.status) ? `<button type="button" data-delivery-move="${escapeHtml(order.id)}" data-delivery-status="${nextStatus}">Next</button>` : ""}
                            <button type="button" data-delivery-focus-order="${escapeHtml(order.id)}">View</button>
                          </div>
                        </article>
                      `;
                    })
                    .join("")
                : `<div class="empty-state-card"><strong>No ${statusDefinition.label.toLowerCase()} orders</strong><p>This stage is clear right now.</p></div>`}
            </div>
          </article>
        `;
      })
      .join("");

    if (selectedDeliveryOrderId && !sortedOrders.some((order) => order.id === selectedDeliveryOrderId)) {
      selectedDeliveryOrderId = "";
    }

    const focusOrder =
      sortedOrders.find((order) => order.id === selectedDeliveryOrderId) ||
      sortedOrders.find((order) => normalizeOrderStatus(order.status) === "paid") ||
      sortedOrders.find((order) => normalizeOrderStatus(order.status) === "confirmed") ||
      sortedOrders.find((order) => normalizeOrderStatus(order.status) === "new") ||
      sortedOrders[0] ||
      null;

    if (focusOrder) {
      selectedDeliveryOrderId = focusOrder.id || "";
    }

    deliveryFocus.innerHTML = focusOrder
      ? `
          <article class="admin-customer-focus">
            <strong>${escapeHtml(focusOrder.customer || "Walk-in customer")}</strong>
            <span>${escapeHtml(getOrderStatusLabel(focusOrder.status))} | ${escapeHtml(focusOrder.id || "")}</span>
            <p>${escapeHtml(focusOrder.productName || "Product")} for ${escapeHtml(focusOrder.areaName || "delivery area not set")}. ${focusOrder.note ? escapeHtml(focusOrder.note) : "No customer note saved yet."}</p>
            <div class="admin-order-detail-grid">
              <div class="admin-order-detail-card">
                <label>Phone</label>
                <strong>${escapeHtml(focusOrder.phone || "No phone saved")}</strong>
                <span>${escapeHtml(formatDateLabel(focusOrder.updatedAt || focusOrder.createdAt))}</span>
              </div>
              <div class="admin-order-detail-card">
                <label>Total</label>
                <strong>${formatPrice(focusOrder.orderTotal)}</strong>
                <span>Profit ${formatPrice(focusOrder.totalProfit)}</span>
              </div>
              <div class="admin-order-detail-card">
                <label>Next move</label>
                <strong>${escapeHtml(getOrderStatusLabel(getNextOrderStatusValue(focusOrder.status)))}</strong>
                <span>${escapeHtml(getOrderStatusLabel(getPreviousOrderStatusValue(focusOrder.status))) === escapeHtml(getOrderStatusLabel(focusOrder.status)) ? "No previous step" : "You can still step this order back if needed."}</span>
              </div>
            </div>
            <div class="admin-inline-actions">
              ${getPreviousOrderStatusValue(focusOrder.status) !== normalizeOrderStatus(focusOrder.status) ? `<button type="button" data-delivery-move="${escapeHtml(focusOrder.id)}" data-delivery-status="${getPreviousOrderStatusValue(focusOrder.status)}">Move Back</button>` : ""}
              ${getNextOrderStatusValue(focusOrder.status) !== normalizeOrderStatus(focusOrder.status) ? `<button type="button" data-delivery-move="${escapeHtml(focusOrder.id)}" data-delivery-status="${getNextOrderStatusValue(focusOrder.status)}">Move Forward</button>` : ""}
              <button type="button" data-delivery-edit-order="${escapeHtml(focusOrder.id)}">Edit Order</button>
              <button type="button" data-delivery-track-order="${escapeHtml(focusOrder.id)}">Track Page</button>
            </div>
          </article>
        `
      : `
          <article class="admin-customer-focus">
            <strong>No delivery work yet</strong>
            <p>Save a few orders first and this desk will start showing the next order that needs attention.</p>
          </article>
        `;
  }

  function renderDeliveryAreas() {
    if (!deliveryList) {
      return;
    }

    deliveryList.innerHTML = deliveryAreas
      .map(
        (area) => `
          <article class="admin-ops-row">
            <div>
              <strong>${area.name}</strong>
              <span>Client ${formatPrice(area.clientCharge)} · Real cost ${formatPrice(area.realCost)}</span>
            </div>
            <strong>${formatPrice(Math.max(0, Number(area.clientCharge) - Number(area.realCost)))}</strong>
            <button type="button" data-delivery-delete="${area.id}">Delete</button>
          </article>
        `
      )
      .join("");
  }

  function getSelectedBundleProductIds() {
    if (!bundleProductPicker) {
      return [];
    }

    return Array.from(bundleProductPicker.querySelectorAll("input[data-bundle-product]:checked")).map(
      (input) => input.value
    );
  }

  function renderBundleProductPicker(selectedIds = getSelectedBundleProductIds()) {
    if (!bundleProductPicker) {
      return;
    }

    const selected = new Set(selectedIds);
    bundleProductPicker.innerHTML = catalog
      .map(
        (product) => `
          <label class="admin-bundle-option">
            <input type="checkbox" data-bundle-product value="${product.id}" ${selected.has(product.id) ? "checked" : ""} />
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
            <div>
              <strong>${product.name}</strong>
              <span>${formatPrice(product.price)}</span>
            </div>
          </label>
        `
      )
      .join("");
  }

  function resetBundleForm() {
    editingBundleId = null;
    if (bundleForm) {
      bundleForm.reset();
    }
    renderBundleProductPicker([]);
  }

  function renderBundles() {
    if (!bundleMetrics || !bundleList) {
      return;
    }

    const savings = bundles.map((bundle) => {
      const regularTotal = (bundle.productIds || []).reduce((sum, productId) => {
        const product = catalog.find((item) => item.id === productId);
        return sum + (product ? Number(product.price) || 0 : 0);
      }, 0);
      return Math.max(0, regularTotal - (Number(bundle.price) || 0));
    });
    const totalPotential = bundles.reduce((sum, bundle) => sum + (Number(bundle.price) || 0), 0);
    const averageItems = bundles.length
      ? Math.round(
          bundles.reduce((sum, bundle) => sum + ((bundle.productIds && bundle.productIds.length) || 0), 0) / bundles.length
        )
      : 0;

    bundleMetrics.innerHTML = `
      <article class="admin-metric-card">
        <span>Total Bundles</span>
        <strong>${bundles.length}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Potential Bundle Value</span>
        <strong>${formatPrice(totalPotential)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Average Items</span>
        <strong>${averageItems}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Best Saving</span>
        <strong>${formatPrice(savings.length ? Math.max(...savings) : 0)}</strong>
      </article>
    `;

    bundleList.innerHTML = bundles.length
      ? bundles
          .map((bundle) => {
            const bundleProducts = (bundle.productIds || [])
              .map((productId) => catalog.find((item) => item.id === productId))
              .filter(Boolean);
            const regularTotal = bundleProducts.reduce((sum, product) => sum + (Number(product.price) || 0), 0);
            const saving = Math.max(0, regularTotal - (Number(bundle.price) || 0));

            return `
              <article class="admin-bundle-row">
                <div>
                  <strong>${bundle.name}</strong>
                  <span>${bundle.note || "Bundle offer ready for WhatsApp and social selling."}</span>
                  <div class="admin-customer-tags">
                    ${bundleProducts.map((product) => `<span class="admin-summary-tag">${product.name}</span>`).join("")}
                  </div>
                </div>
                <span>Regular ${formatPrice(regularTotal)}</span>
                <span>Bundle ${formatPrice(bundle.price)}</span>
                <span>Save ${formatPrice(saving)}</span>
                <div class="admin-inline-actions">
                  <button type="button" data-bundle-edit="${bundle.id}">Load</button>
                  <button type="button" data-bundle-delete="${bundle.id}">Delete</button>
                </div>
              </article>
            `;
          })
          .join("")
      : `
          <article class="admin-bundle-row">
            <div>
              <strong>No bundles yet</strong>
              <span>Create a few matching sets so you can sell faster on WhatsApp and Instagram.</span>
            </div>
          </article>
        `;
  }

  function renderExpenses() {
    if (!expenseSummary || !expenseList) {
      return;
    }

    const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    expenseSummary.innerHTML = `
      <article class="admin-metric-card">
        <span>Total Expenses</span>
        <strong>${formatPrice(totalExpenses)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Entries</span>
        <strong>${expenses.length}</strong>
      </article>
    `;

    expenseList.innerHTML = expenses.length
      ? expenses
          .map(
            (expense) => `
              <article class="admin-ops-row">
                <div>
                  <strong>${expense.name}</strong>
                  <span>${expense.note || "No note"}</span>
                </div>
                <strong>${formatPrice(expense.amount)}</strong>
                <button type="button" data-expense-delete="${expense.id}">Delete</button>
              </article>
            `
          )
          .join("")
      : `
          <article class="admin-ops-row">
            <div>
              <strong>No expenses yet</strong>
              <span>Add packaging, transport, ads, or airtime so you can see your true net progress.</span>
            </div>
          </article>
        `;
  }

  function renderStockList() {
    if (!stockList) {
      return;
    }

    const sourceLabels = {
      "mom-kiosk": "Mom's kiosk",
      "my-stock": "My own stock",
      "shared-stock": "Shared stock"
    };

    stockList.innerHTML = catalog
      .map((product) => {
        const available = Math.max(0, (Number(product.stockQty) || 0) - (Number(product.reservedQty) || 0));
        return `
          <article class="admin-stock-row">
            <div>
              <strong>${product.name}</strong>
              <span>${sourceLabels[product.source] || "Source not set"}</span>
            </div>
            <span>Stock ${product.stockQty || 0}</span>
            <span>Reserved ${product.reservedQty || 0}</span>
            <strong>Available ${available}</strong>
          </article>
        `;
      })
      .join("");
  }

  function renderGoalCard() {
    if (!goalCard || !growthMetrics || !growthMonthly) {
      return;
    }

    const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    const workingProfit = orders.reduce((sum, order) => sum + (Number(order.totalProfit) || 0), 0);
    const netProgress = Math.max(0, Number(kioskGoal.saved) || 0);
    const target = Number(kioskGoal.target) || 0;
    const netBusinessProfit = workingProfit - totalExpenses;
    const remaining = Math.max(0, target - netProgress);
    const percent = target ? Math.min(100, Math.round((netProgress / target) * 100)) : 0;
    const customers = getCustomerRecords();
    const repeatCustomers = customers.filter((customer) => customer.orders > 1).length;
    const monthlyGrowth = getMonthlyGrowthData();
    const currentMonth = monthlyGrowth[monthlyGrowth.length - 1] || { orderProfit: 0, expenses: 0, net: 0, orders: 0 };

    goalTargetInput.value = target || "";
    goalSavedInput.value = netProgress || "";
    goalNoteInput.value = kioskGoal.note || "";

    growthMetrics.innerHTML = `
      <article class="admin-metric-card">
        <span>Saved for Kiosk</span>
        <strong>${formatPrice(netProgress)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Remaining to Goal</span>
        <strong>${formatPrice(remaining)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>This Month Net</span>
        <strong>${formatPrice(currentMonth.net)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Repeat Customers</span>
        <strong>${repeatCustomers}</strong>
      </article>
    `;

    goalCard.innerHTML = `
      <article class="admin-goal-panel">
        <div class="admin-goal-top">
          <strong>${target ? `${percent}% to your kiosk goal` : "Set your kiosk target"}</strong>
          <span>${formatPrice(netProgress)} saved</span>
        </div>
        <div class="admin-goal-track">
          <div class="admin-goal-bar" style="width: ${percent}%"></div>
        </div>
        <div class="admin-goal-meta">
          <span>Target ${formatPrice(target)}</span>
          <span>Website profit view ${formatPrice(workingProfit)}</span>
          <span>Expenses tracked ${formatPrice(totalExpenses)}</span>
          <span>Net business profit ${formatPrice(netBusinessProfit)}</span>
        </div>
        <p>${kioskGoal.note || "Use this goal card to keep your kiosk dream visible and measurable."}</p>
      </article>
    `;

    growthMonthly.innerHTML = monthlyGrowth
      .map(
        (month) => `
          <article class="admin-growth-row">
            <div>
              <strong>${formatMonthKey(month.monthKey)}</strong>
              <span>${month.orders} orders saved</span>
            </div>
            <span>Profit ${formatPrice(month.orderProfit)}</span>
            <span>Expenses ${formatPrice(month.expenses)}</span>
            <strong>Net ${formatPrice(month.net)}</strong>
          </article>
        `
      )
      .join("");
  }

  function resetReplyForm() {
    editingReplyId = null;
    if (replyForm) {
      replyForm.reset();
    }
    if (replyCategoryInput) {
      replyCategoryInput.value = "new-inquiry";
    }
  }

  function populateReplyForm(template) {
    editingReplyId = template.id;
    replyTitleInput.value = template.title || "";
    replyCategoryInput.value = template.category || "new-inquiry";
    replyMessageInput.value = template.message || "";
  }

  function renderReplyTemplates() {
    if (!replyList) {
      return;
    }

    replyList.innerHTML = replyTemplates.length
      ? replyTemplates
          .map(
            (template) => `
              <article class="admin-reply-row">
                <div>
                  <strong>${template.title}</strong>
                  <span>${String(template.category || "template").replace(/-/g, " ")}</span>
                  <p>${template.message}</p>
                </div>
                <div class="admin-inline-actions">
                  <button type="button" data-reply-copy="${template.id}">Copy</button>
                  <button type="button" data-reply-edit="${template.id}">Load</button>
                  <button type="button" data-reply-delete="${template.id}">Delete</button>
                </div>
              </article>
            `
          )
          .join("")
      : `
          <article class="admin-reply-row">
            <div>
              <strong>No templates yet</strong>
              <p>Save simple WhatsApp replies here so you can answer customers faster without sounding rushed.</p>
            </div>
          </article>
        `;
  }

  function populateSocialForm() {
    if (!socialWhatsappInput || !socialInstagramInput || !socialFacebookInput || !socialTiktokInput) {
      return;
    }

    const map = new Map(socialSettings.map((social) => [social.label, social.url]));
    socialWhatsappInput.value = map.get("WhatsApp") || "";
    socialInstagramInput.value = map.get("Instagram") || "";
    socialFacebookInput.value = map.get("Facebook") || "";
    socialTiktokInput.value = map.get("TikTok") || "";
  }

  function isLiveSocialUrl(url) {
    const normalized = String(url || "").trim();
    return normalized && normalized !== "#";
  }

  function renderSocialLinksPreview() {
    if (!socialLinksPreview) {
      return;
    }

    socialLinksPreview.innerHTML = socialSettings
      .map((social) => {
        const liveUrl = isLiveSocialUrl(social.url);
        return `
          <article class="admin-social-link-row">
            <div class="admin-social-link-head">
              <strong>${social.label}</strong>
              <span class="admin-social-link-status ${liveUrl ? "live" : "missing"}">${liveUrl ? "Ready" : "Missing"}</span>
            </div>
            <div class="admin-social-link-url">${liveUrl ? social.url : `Add your ${social.label} URL above to show it on the website.`}</div>
            <div class="admin-social-link-actions">
              ${liveUrl ? `<a href="${social.url}" target="_blank" rel="noreferrer">Open ${social.label}</a>` : ""}
              ${liveUrl ? `<button type="button" data-social-copy-link="${social.label}">Copy Link</button>` : ""}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderSocialProductSelect() {
    if (!socialProductSelect) {
      return;
    }

    socialProductSelect.innerHTML = catalog
      .map((product) => `<option value="${product.id}">${product.name}</option>`)
      .join("");
  }

  function buildCaption(product, tone) {
    if (!product) {
      return "";
    }

    const categoryName = categoryMap.get(product.category) || product.category;
    const captions = {
      warm: `Say hello to ${product.name}. A handmade ${categoryName.toLowerCase()} piece with joyful color and an easy everyday feel. ${product.description} Order on WhatsApp today.`,
      sales: `${product.name} is ready for your next order. Handmade, eye-catching, and available now for ${formatPrice(product.price)}. Message SharonCraft on WhatsApp before this batch sells out.`,
      gift: `Looking for a thoughtful gift? ${product.name} is a beautiful handmade ${categoryName.toLowerCase()} choice for birthdays, housewarmings, and special moments. Ask for it on WhatsApp today.`
    };

    const hashtags = "#SharonCraft #HandmadeInKenya #AfricanInspired #Beadwork";
    return `${captions[tone] || captions.warm}\n\n${hashtags}`;
  }

  function renderSocialCalendar() {
    if (!socialCalendar) {
      return;
    }

    socialCalendar.innerHTML = socialPlanner
      .map(
        (item, index) => `
          <article class="admin-social-day">
            <div class="admin-social-day-head">
              <strong>${item.day}</strong>
              <span>${index + 1}</span>
            </div>
            <input type="text" data-social-theme="${index}" value="${item.theme}" aria-label="${item.day} theme" />
            <textarea data-social-note="${index}" aria-label="${item.day} note">${item.note}</textarea>
          </article>
        `
      )
      .join("");
  }

  function renderSocialMedia() {
    if (!socialMedia) {
      return;
    }

    const featuredFirst = [...catalog].sort((left, right) => {
      const leftScore = left.featured ? 0 : 1;
      const rightScore = right.featured ? 0 : 1;
      return leftScore - rightScore;
    });

    socialMedia.innerHTML = featuredFirst.length
      ? featuredFirst
      .slice(0, 6)
      .map(
        (product) => `
          <article class="admin-social-media-card">
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
            <div>
              <strong>${product.name}</strong>
              <span>${categoryMap.get(product.category) || product.category}</span>
              <button type="button" data-social-pick="${product.id}">Use in Caption</button>
            </div>
          </article>
        `
      )
      .join("")
      : `<article class="admin-social-media-card"><div><strong>No products yet</strong><span>Add products first, then this section will help you create Facebook and Instagram posts faster.</span></div></article>`;
  }

  function renderSocialTracker() {
    if (!socialTracker) {
      return;
    }

    const topChatProducts = [...catalog]
      .sort((left, right) => (right.analytics.whatsappClicks || 0) - (left.analytics.whatsappClicks || 0))
      .slice(0, 4);

    socialTracker.innerHTML = topChatProducts.length
      ? topChatProducts
      .map(
        (product, index) => `
          <article class="admin-social-track-row">
            <div>
              <strong>${index + 1}. ${product.name}</strong>
              <span>${categoryMap.get(product.category) || product.category}</span>
            </div>
            <strong>${product.analytics.whatsappClicks} chats</strong>
          </article>
        `
      )
      .join("")
      : `
          <article class="admin-social-track-row">
            <div>
              <strong>No chat history yet</strong>
              <span>Once customers start tapping WhatsApp from the storefront, this panel will highlight your best social media candidates.</span>
            </div>
          </article>
        `;
  }

  function renderSalesDashboard() {
    if (!salesMetrics || !salesChart || !salesTable) {
      return;
    }

    const totals = catalog.reduce(
      (accumulator, product) => {
        accumulator.revenue += product.analytics.revenue;
        accumulator.units += product.analytics.unitsSold;
        accumulator.clicks += product.analytics.whatsappClicks;
        return accumulator;
      },
      { revenue: 0, units: 0, clicks: 0 }
    );

    const avgOrder = totals.units ? Math.round(totals.revenue / totals.units) : 0;
    salesMetrics.innerHTML = `
      <article class="admin-metric-card">
        <span>Total Revenue</span>
        <strong>${formatPrice(totals.revenue)}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Items Sold</span>
        <strong>${totals.units}</strong>
      </article>
      <article class="admin-metric-card">
        <span>WhatsApp Clicks</span>
        <strong>${totals.clicks}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Average Order</span>
        <strong>${formatPrice(avgOrder)}</strong>
      </article>
    `;

    const topRevenue = [...catalog]
      .sort((left, right) => right.analytics.revenue - left.analytics.revenue)
      .slice(0, 6);
    const maxRevenue = topRevenue[0] ? topRevenue[0].analytics.revenue : 1;

    salesChart.innerHTML = topRevenue
      .map(
        (product) => `
          <div class="admin-chart-row">
            <span>${product.name}</span>
            <div class="admin-chart-track">
              <div class="admin-chart-bar" style="width: ${(product.analytics.revenue / maxRevenue) * 100}%"></div>
            </div>
            <strong>${formatPrice(product.analytics.revenue)}</strong>
          </div>
        `
      )
      .join("");

    salesTable.innerHTML = catalog
      .map(
        (product) => `
          <article class="admin-sales-row">
            <div>
              <strong>${product.name}</strong>
              <span>${categoryMap.get(product.category) || product.category}</span>
            </div>
            <span>${product.analytics.unitsSold} sold</span>
            <span>${product.analytics.whatsappClicks} clicks</span>
            <strong>${formatPrice(product.analytics.revenue)}</strong>
          </article>
        `
      )
      .join("");
  }

  async function saveCatalogState(message, options = {}) {
    const savedLocally = safeLocalStorageSetItem(storageKey, JSON.stringify(catalog), "catalog");
    renderCategoryList();
    renderCategoryPreview();
    renderList();
    renderFeaturedManager();
    renderSalesDashboard();
    renderProfitProductSelect();
    syncProfitCalculatorFromSelection();
    renderProfitDashboard();
    renderOrderProductSelect();
    renderStockList();
    renderSocialProductSelect();
    renderSocialMedia();
    renderSocialTracker();
    renderBundleProductPicker();
    renderBundles();
    renderGoalCard();
    renderAdminOverview();
    if (options.publishLive) {
      await publishCatalogToSupabase(message);
      return;
    }
    if (message) {
      setStatus(savedLocally ? message : `${message} Local save failed because browser storage is full.`);
    }
  }

  async function repairCatalogImagesFromLibrary() {
    catalog = repairCatalogImages(catalog);
    await saveCatalogState("Product images refreshed from the photo library.", { publishLive: true });
  }

  function resetSalesDashboard() {
    const confirmed = window.confirm(
      "Reset all sales dashboard numbers to 0? This will clear revenue, sold items, and WhatsApp clicks for every product."
    );

    if (!confirmed) {
      return;
    }

    catalog = catalog.map((product) => ({
      ...product,
      analytics: {
        whatsappClicks: 0,
        unitsSold: 0,
        revenue: 0
      }
    }));

    saveCatalogState("Sales dashboard reset to 0.", { publishLive: false });
  }

  function resetProfitHistory() {
    const confirmed = window.confirm(
      "Reset all saved profit values? This will clear Mom price, delivery charged, and actual delivery cost for every product."
    );

    if (!confirmed) {
      return;
    }

    catalog = catalog.map((product) => ({
      ...product,
      momPrice: 0,
      deliveryCharge: 0,
      deliveryCost: 0
    }));

    if (profitQuantityInput) {
      profitQuantityInput.value = 1;
    }
    if (profitOrderMomPriceInput) {
      profitOrderMomPriceInput.value = "";
    }
    if (profitOrderPriceInput) {
      profitOrderPriceInput.value = "";
    }
    if (profitOrderDeliveryChargeInput) {
      profitOrderDeliveryChargeInput.value = "";
    }
    if (profitOrderDeliveryCostInput) {
      profitOrderDeliveryCostInput.value = "";
    }
    if (profitProductSelect) {
      profitProductSelect.value = "";
    }

    resetForm();
    saveCatalogState("Profit history cleared.", { publishLive: false });
    activateAdminTab("profit");
  }

  function resetForm() {
    form.reset();
    editingId = null;
    formTitle.textContent = "Add Product";
    categoryInput.value = (categoryCatalog[0] || {}).slug || "necklaces";
    updateCategoryChipSelection();
    momPriceInput.value = "";
    deliveryChargeInput.value = "";
    deliveryCostInput.value = "";
    totalProfitInput.value = "";
    sourceInput.value = "mom-kiosk";
    stockQtyInput.value = "";
    reservedQtyInput.value = "";
    badgeInput.value = "New";
    featuredInput.checked = false;
    newInput.checked = true;
    imageInput.value = "assets/images/IMG-20260226-WA0005.jpg";
    galleryInput.value = "";
    temporaryMainPreviewSrc = "";
    renderDraftPreview();
  }

  function populateForm(product) {
    editingId = product.id;
    formTitle.textContent = `Edit ${product.name}`;
    nameInput.value = product.name;
    categoryInput.value = product.category;
    updateCategoryChipSelection();
    priceInput.value = product.price;
    momPriceInput.value = product.momPrice || "";
    deliveryChargeInput.value = product.deliveryCharge || "";
    deliveryCostInput.value = product.deliveryCost || "";
    sourceInput.value = product.source || "mom-kiosk";
    stockQtyInput.value = product.stockQty || "";
    reservedQtyInput.value = product.reservedQty || "";
    badgeInput.value = product.badge || "";
    imageInput.value = toFormImageValue(product.images[0]);
    syncGalleryTextarea(product.images);
    descriptionInput.value = product.description;
    detailsInput.value = product.details.join(", ");
    featuredInput.checked = Boolean(product.featured);
    newInput.checked = Boolean(product.newArrival);
    temporaryMainPreviewSrc = "";
    renderDraftPreview();
    setPreviewTarget(`product.html?id=${product.id}`, `${product.name} Page`);
    syncLivePreviewFrame();
  }

  imageFileInput.addEventListener("change", function () {
    const file = imageFileInput.files && imageFileInput.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", function () {
      const uploadedSource = typeof reader.result === "string" ? reader.result : "";
      if (!uploadedSource) {
        setStatus(`Could not read ${file.name}. Please try another image.`);
        return;
      }

      const galleryItems = galleryInput.value
        .split(",")
        .map(cleanImagePath)
        .filter(Boolean)
        .map(resolveImageSource);
      const images = dedupeImages([uploadedSource].concat(galleryItems));
      imageInput.value = registerUploadedImage(uploadedSource);
      syncGalleryTextarea(images);
      temporaryMainPreviewSrc = uploadedSource;
      renderDraftPreview();
      setStatus(`${file.name} uploaded and saved in this browser, so product cards can show it immediately.`);
      imageFileInput.value = "";
    });

    reader.readAsDataURL(file);
  });

  selectedGallery.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    const image = button.dataset.image;
    let images = getFormGalleryImages();

    if (button.dataset.action === "set-main") {
      images = dedupeImages([image].concat(images.filter((item) => item !== image)));
      imageInput.value = toFormImageValue(images[0]);
      temporaryMainPreviewSrc = "";
      syncGalleryTextarea(images);
      renderDraftPreview();
      setStatus("Main image updated.");
    }

    if (button.dataset.action === "remove") {
      images = images.filter((item) => item !== image);
      imageInput.value = toFormImageValue(images[0] || "assets/images/IMG-20260226-WA0005.jpg");
      temporaryMainPreviewSrc = "";
      syncGalleryTextarea(images.length ? images : [imageInput.value]);
      renderDraftPreview();
      setStatus("Image removed from the gallery.");
    }
  });

  function handleImageLibrarySelection(event) {
    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    applyGalleryImageToDraft(button.dataset.image, button.dataset.action);
  }

  if (imageLibrary) {
    imageLibrary.addEventListener("click", handleImageLibrarySelection);
  }

  if (inlineImageLibrary) {
    inlineImageLibrary.addEventListener("click", handleImageLibrarySelection);
  }

  [nameInput, categoryInput, priceInput, momPriceInput, deliveryChargeInput, deliveryCostInput, sourceInput, stockQtyInput, reservedQtyInput, badgeInput, imageInput, galleryInput, descriptionInput, detailsInput, featuredInput, newInput].forEach(
    (input) => {
      input.addEventListener("input", renderDraftPreview);
      input.addEventListener("change", renderDraftPreview);
    }
  );

  // Visual category chip selector
  document.querySelectorAll(".admin-category-chip").forEach((chip) => {
    chip.addEventListener("click", function (e) {
      e.preventDefault();
      const categoryValue = this.dataset.category;
      categoryInput.value = categoryValue;
      
      // Update visual state
      document.querySelectorAll(".admin-category-chip").forEach((c) => {
        c.classList.remove("is-selected");
      });
      this.classList.add("is-selected");
      
      renderDraftPreview();
      setStatus(`Category set to ${this.textContent.trim()}`);
    });
  });

  // Set initial selected category chip
  function updateCategoryChipSelection() {
    const currentCategory = categoryInput.value;
    document.querySelectorAll(".admin-category-chip").forEach((chip) => {
      if (chip.dataset.category === currentCategory) {
        chip.classList.add("is-selected");
      } else {
        chip.classList.remove("is-selected");
      }
    });
  }

  // Kanban board for product categorization
  function renderCategoryKanban() {
    const kanbanContainer = document.getElementById("admin-category-kanban");
    if (!kanbanContainer) return;

    const categoryEmojis = {
      "necklaces": "👑",
      "bracelets": "💍",
      "home-decor": "🏡",
      "bags-accessories": "👜",
      "gift-sets": "🎁",
      "bridal-occasion": "💐"
    };

    const categoryNames = {
      "necklaces": "Necklaces",
      "bracelets": "Bracelets",
      "home-decor": "Home Decor",
      "bags-accessories": "Bags & Accessories",
      "gift-sets": "Gift Sets",
      "bridal-occasion": "Bridal & Occasion"
    };

    const validCategories = Object.keys(categoryEmojis);
    const uncategorizedProducts = catalog.filter((p) => !validCategories.includes(p.category));
    const totalProducts = catalog.length;

    // Build uncategorized column first
    let html = `
      <div class="admin-kanban-column admin-kanban-column-inbox" data-category="uncategorized">
        <div class="admin-kanban-header">
          <h3 class="admin-kanban-title">
            <span>📥</span>
            Inbox
          </h3>
          <span class="admin-kanban-badge admin-kanban-badge-warning">${uncategorizedProducts.length}</span>
        </div>
        <div class="admin-kanban-items">
          ${
            uncategorizedProducts.length > 0
              ? uncategorizedProducts
                  .map(
                    (product) => `
                  <div class="admin-kanban-item admin-kanban-item-inbox" draggable="true" data-product-id="${product.id}">
                    <div class="admin-kanban-item-meta">
                      <p class="admin-kanban-item-name">${product.name}</p>
                      <p class="admin-kanban-item-price">${formatPrice(product.price)}</p>
                    </div>
                    <span class="admin-kanban-item-icon">⭐</span>
                  </div>
                `
                  )
                  .join("")
              : '<div class="admin-kanban-empty admin-kanban-inbox-empty">✓ All products organized!</div>'
          }
        </div>
      </div>
    `;

    // Add categorized columns
    html += defaultCategorySource.map((category) => {
      const productsInCategory = catalog.filter((p) => p.category === category.slug);
      return `
        <div class="admin-kanban-column" data-category="${category.slug}">
          <div class="admin-kanban-header">
            <h3 class="admin-kanban-title">
              <span>${categoryEmojis[category.slug] || "📦"}</span>
              ${categoryNames[category.slug] || category.slug}
            </h3>
            <span class="admin-kanban-badge">${productsInCategory.length}</span>
          </div>
          <div class="admin-kanban-items">
            ${
              productsInCategory.length > 0
                ? productsInCategory
                    .map(
                      (product) => `
                    <div class="admin-kanban-item" draggable="true" data-product-id="${product.id}">
                      <div class="admin-kanban-item-meta">
                        <p class="admin-kanban-item-name">${product.name}</p>
                        <p class="admin-kanban-item-price">${formatPrice(product.price)}</p>
                      </div>
                      <span class="admin-kanban-item-icon">move</span>
                    </div>
                  `
                    )
                    .join("")
                : '<div class="admin-kanban-empty">-</div>'
            }
          </div>
        </div>
      `;
    }).join("");

    kanbanContainer.innerHTML = html;

    // Add drag and drop functionality
    setTimeout(() => {
      setupKanbanDragDrop();
    }, 0);
  }

  function setupKanbanDragDrop() {
    let draggedItem = null;

    document.querySelectorAll(".admin-kanban-item").forEach((item) => {
      item.addEventListener("dragstart", function () {
        draggedItem = this;
        this.style.opacity = "0.5";
      });

      item.addEventListener("dragend", function () {
        this.style.opacity = "1";
        draggedItem = null;
        document.querySelectorAll(".admin-kanban-column").forEach((col) => {
          col.classList.remove("is-dragging-over");
        });
      });
    });

    document.querySelectorAll(".admin-kanban-column").forEach((column) => {
      column.addEventListener("dragover", function (e) {
        e.preventDefault();
        this.classList.add("is-dragging-over");
      });

      column.addEventListener("dragleave", function () {
        this.classList.remove("is-dragging-over");
      });

      column.addEventListener("drop", function (e) {
        e.preventDefault();
        this.classList.remove("is-dragging-over");

        if (!draggedItem) return;

        const productId = draggedItem.dataset.productId;
        const newCategory = this.dataset.category;

        // Find and update the product
        catalog = catalog.map((p) =>
          p.id === productId ? { ...p, category: newCategory } : p
        );

        const categoryNames = {
          "necklaces": "Necklaces",
          "bracelets": "Bracelets",
          "home-decor": "Home Decor",
          "bags-accessories": "Bags & Accessories",
          "gift-sets": "Gift Sets",
          "bridal-occasion": "Bridal & Occasion"
        };

        saveCatalogState(`Product moved to ${categoryNames[newCategory] || newCategory}.`, { publishLive: true });
        updateCategoryChipSelection();
        renderCategoryKanban();
      });
    });
  }

  if (suggestNameButton) {
    suggestNameButton.addEventListener("click", function () {
      const suggestedName = buildSuggestedProductName();
      nameInput.value = suggestedName;
      renderDraftPreview();
      setStatus(`Starter product name added: ${suggestedName}. You can edit it anytime.`);
    });
  }

  if (descriptionStarterButton) {
    descriptionStarterButton.addEventListener("click", function () {
      if (!nameInput.value.trim()) {
        nameInput.value = buildSuggestedProductName();
      }

      descriptionInput.value = buildDescriptionStarter();
      renderDraftPreview();
      setStatus("Description starter added. Edit the wording so it matches the product perfectly.");
    });
  }

  if (previewPageSelect && previewReloadButton && previewFrame && previewOpenLink) {
    previewPageSelect.addEventListener("change", function () {
      syncLivePreviewFrame();
      setStatus("Live mobile preview updated.");
    });

    previewReloadButton.addEventListener("click", function () {
      previewFrame.src = previewPageSelect.value;
      setStatus("Live mobile preview reloaded.");
    });
  }

  [searchInput, categoryFilter, featureFilter].forEach((input) => {
    input.addEventListener("input", renderList);
    input.addEventListener("change", renderList);
  });

  if (imageLibrarySearch) {
    imageLibrarySearch.addEventListener("input", renderImageLibrary);
    imageLibrarySearch.addEventListener("change", renderImageLibrary);
  }

  if (refreshGalleryButton) {
    refreshGalleryButton.addEventListener("click", refreshGalleryManifest);
  }

  if (analyticsRefreshButton) {
    analyticsRefreshButton.addEventListener("click", async function () {
      await refreshStorefrontAnalytics({ showStatus: true });
    });
  }

  analyticsRangeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const nextRange = String(button.dataset.analyticsRange || "").trim();
      if (!nextRange || nextRange === analyticsRange) {
        return;
      }

      analyticsRange = nextRange;
      window.localStorage.setItem(analyticsRangeStorageKey, analyticsRange);
      renderAnalyticsDashboard();
      renderAdminOverview();
    });
  });

  if (analyticsClearButton) {
    analyticsClearButton.addEventListener("click", async function () {
      if (!window.confirm("Clear the storefront analytics log in this browser and, if available, from Supabase live analytics too?")) {
        return;
      }

      window.localStorage.removeItem(storefrontAnalyticsKey);
      window.localStorage.removeItem("sharoncraft-analytics-queue");
      remoteStorefrontAnalyticsEvents = [];
      analyticsDataSource = "browser";

      if (
        liveCatalogApi &&
        typeof liveCatalogApi.clearAnalyticsEvents === "function" &&
        typeof liveCatalogApi.isConfigured === "function" &&
        liveCatalogApi.isConfigured()
      ) {
        const user = currentLiveUser || (await refreshLiveUser());

        if (user) {
          try {
            await liveCatalogApi.clearAnalyticsEvents();
          } catch (error) {
            console.error("Unable to clear Supabase analytics events.", error);
          }
        }
      }

      await refreshStorefrontAnalytics();
      setStatus("Storefront analytics log cleared.");
    });
  }

  if (inlineImageSearch) {
    inlineImageSearch.addEventListener("input", renderInlineImageLibrary);
    inlineImageSearch.addEventListener("change", renderInlineImageLibrary);
  }

  if (inlineRefreshGalleryButton) {
    inlineRefreshGalleryButton.addEventListener("click", refreshGalleryManifest);
  }

  if (categoryImageSearchInput) {
    categoryImageSearchInput.addEventListener("input", renderCategoryImageLibrary);
    categoryImageSearchInput.addEventListener("change", renderCategoryImageLibrary);
  }

  if (visualImageSearchInput) {
    visualImageSearchInput.addEventListener("input", renderVisualImageLibrary);
    visualImageSearchInput.addEventListener("change", renderVisualImageLibrary);
  }

  if (categoryList) {
    categoryList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-category-edit]");
      if (!button) {
        return;
      }

      populateCategoryForm(button.dataset.categoryEdit);
      setStatus(`${categoryMap.get(button.dataset.categoryEdit) || "Category"} loaded into the category editor.`);
    });
  }

  if (categoryImageLibrary) {
    categoryImageLibrary.addEventListener("click", function (event) {
      const button = event.target.closest("[data-category-image]");
      if (!button || !categoryImageInput) {
        return;
      }

      categoryImageInput.value = button.dataset.categoryImage;
      renderCategoryPreview();
      setStatus("Category icon image updated in the preview.");
    });
  }

  [categoryNameInput, categoryAccentInput, categoryTipInput, categoryDescriptionInput, categoryImageInput].forEach((input) => {
    if (!input) {
      return;
    }

    input.addEventListener("input", renderCategoryPreview);
    input.addEventListener("change", renderCategoryPreview);
  });

  visualNavButtons.forEach((button) => {
    button.addEventListener("click", function () {
      activateVisualSection(button.dataset.visualSection);
      setStatus(`${button.querySelector("strong") ? button.querySelector("strong").textContent : "Visual section"} opened.`);
    });
  });

  if (visualImageLibrary) {
    visualImageLibrary.addEventListener("click", function (event) {
      const button = event.target.closest("[data-visual-image]");
      if (!button) {
        return;
      }

      if (activeVisualSection === "favorite" && favoriteImageInput) {
        favoriteImageInput.value = button.dataset.visualImage;
      } else if (heroImageInput) {
        heroImageInput.value = button.dataset.visualImage;
      }

      renderVisualPreview();
      setStatus("Wallpaper image updated in the homepage preview.");
    });
  }

  [heroKickerInput, heroTitleInput, heroDescriptionInput, heroPrimaryLabelInput, heroPrimaryHrefInput, heroSecondaryLabelInput, heroSecondaryHrefInput, heroImageInput, heroImageAltInput, favoriteKickerInput, favoriteTitleInput, favoriteDescriptionInput, favoriteImageInput, favoriteImageAltInput].forEach((input) => {
    if (!input) {
      return;
    }

    input.addEventListener("input", renderVisualPreview);
    input.addEventListener("change", renderVisualPreview);
  });

  if (favoriteProductSelect) {
    favoriteProductSelect.addEventListener("change", function () {
      const selectedProduct = getSelectedFavoriteProduct();
      if (!selectedProduct) {
        renderVisualPreview();
        return;
      }

      if (favoriteTitleInput && !favoriteTitleInput.value.trim()) {
        favoriteTitleInput.value = selectedProduct.name;
      }
      if (favoriteDescriptionInput && !favoriteDescriptionInput.value.trim()) {
        favoriteDescriptionInput.value = selectedProduct.shortDescription || selectedProduct.description || "";
      }
      if (favoriteImageInput && !favoriteImageInput.value.trim()) {
        favoriteImageInput.value = (selectedProduct.images && selectedProduct.images[0]) || "";
      }

      renderVisualPreview();
      setStatus(`${selectedProduct.name} linked to the client favorite spotlight.`);
    });
  }

  if (categoryEditorForm) {
    categoryEditorForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const currentCategory = getEditingCategory();
      if (!currentCategory) {
        setStatus("Choose a category before saving.");
        return;
      }

      const updatedCategory = normalizeCategory({
        ...currentCategory,
        name: categoryNameInput ? categoryNameInput.value : currentCategory.name,
        accent: categoryAccentInput ? categoryAccentInput.value : currentCategory.accent,
        tip: categoryTipInput ? categoryTipInput.value : currentCategory.tip,
        description: categoryDescriptionInput ? categoryDescriptionInput.value : currentCategory.description,
        image: categoryImageInput ? categoryImageInput.value : currentCategory.image
      });

      categoryCatalog = categoryCatalog.map((category) =>
        category.slug === currentCategory.slug ? updatedCategory : category
      );

      populateCategoryForm(updatedCategory.slug);
      saveCategoryState(`${updatedCategory.name} category saved. Refresh the homepage preview to see the new category icon there too.`);
      activateAdminTab("categories");
    });
  }

  if (visualStoryForm) {
    visualStoryForm.addEventListener("submit", function (event) {
      event.preventDefault();

      homeVisuals = normalizeHomeVisuals({
        hero: {
          kicker: heroKickerInput ? heroKickerInput.value : "",
          title: heroTitleInput ? heroTitleInput.value : "",
          description: heroDescriptionInput ? heroDescriptionInput.value : "",
          primaryLabel: heroPrimaryLabelInput ? heroPrimaryLabelInput.value : "",
          primaryHref: heroPrimaryHrefInput ? heroPrimaryHrefInput.value : "",
          secondaryLabel: heroSecondaryLabelInput ? heroSecondaryLabelInput.value : "",
          secondaryHref: heroSecondaryHrefInput ? heroSecondaryHrefInput.value : "",
          image: heroImageInput ? heroImageInput.value : "",
          imageAlt: heroImageAltInput ? heroImageAltInput.value : ""
        },
        favorite: {
          kicker: favoriteKickerInput ? favoriteKickerInput.value : "",
          title: favoriteTitleInput ? favoriteTitleInput.value : "",
          description: favoriteDescriptionInput ? favoriteDescriptionInput.value : "",
          image: favoriteImageInput ? favoriteImageInput.value : "",
          imageAlt: favoriteImageAltInput ? favoriteImageAltInput.value : "",
          productId: favoriteProductSelect ? favoriteProductSelect.value : ""
        }
      });

      saveHomeVisualState("Homepage visual story saved. Refresh the home preview or homepage tab to see the new welcome and favorite photos.");
      activateAdminTab("visuals");
    });
  }

  // File upload handlers for visual story
  function handleImageUpload(fileInput, textInput, previewElement) {
    if (!fileInput) return;
    
    fileInput.addEventListener("change", async function (event) {
      const file = event.target && event.target.files ? event.target.files[0] : null;
      if (!file) return;

      const canUploadToSupabase =
        liveCatalogApi &&
        typeof liveCatalogApi.uploadProductImage === "function" &&
        typeof liveCatalogApi.isConfigured === "function" &&
        liveCatalogApi.isConfigured();

      if (canUploadToSupabase) {
        const user = currentLiveUser || (await refreshLiveUser());
        if (user) {
          try {
            setStatus(`Uploading ${file.name}...`);
            const uploaded = await liveCatalogApi.uploadProductImage(file);
            const publicUrl = uploaded && uploaded.publicUrl ? uploaded.publicUrl : "";

            if (publicUrl) {
              if (previewElement) {
                previewElement.classList.add("is-visible");
                previewElement.innerHTML = `<img src="${publicUrl}" alt="Preview" />`;
              }

              if (textInput) {
                textInput.value = publicUrl;
                textInput.dispatchEvent(new Event("change", { bubbles: true }));
              }

              setStatus(`Image uploaded to Supabase: ${file.name}`);
              return;
            }
          } catch (error) {
            console.error("Unable to upload visual image to Supabase.", error);
            setStatus("Supabase upload failed. Falling back to local preview (may not persist).", "warning");
          }
        }
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const dataUrl = e && e.target ? e.target.result : "";
        if (!dataUrl) {
          setStatus("Error reading image file.", "error");
          return;
        }

        if (previewElement) {
          previewElement.classList.add("is-visible");
          previewElement.innerHTML = `<img src="${dataUrl}" alt="Preview" />`;
        }

        if (textInput) {
          textInput.value = dataUrl;
          textInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        setStatus(`Image preview loaded: ${file.name} (Tip: sign in to publish so it doesn't revert)`);
      };

      reader.onerror = function () {
        setStatus("Error reading image file.", "error");
      };

      reader.readAsDataURL(file);
    });
  }

  handleImageUpload(heroImageUploadInput, heroImageInput, heroImagePreview);
  handleImageUpload(favoriteImageUploadInput, favoriteImageInput, favoriteImagePreview);

  setupPanelCollapsing();
  applyGuidanceMode();
  adminTabGroups.forEach((group) => {
    const groupName = group.dataset.adminGroup;
    if (!groupName) {
      return;
    }
    setAdminGroupCollapsed(groupName, collapsedAdminGroups.includes(groupName));
  });

  adminTabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      activateAdminTab(button.dataset.adminTab);
    });
  });

  adminGroupToggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const groupName = button.dataset.adminGroupToggle;
      if (!groupName) {
        return;
      }

      const group = button.closest("[data-admin-group]");
      const willCollapse = group ? !group.classList.contains("is-collapsed") : false;
      setAdminGroupCollapsed(groupName, willCollapse);
    });
  });

  if (adminTabSearchInput) {
    adminTabSearchInput.addEventListener("input", function () {
      filterAdminTabs(adminTabSearchInput.value);
    });
  }

  if (adminGlobalSearchInput) {
    adminGlobalSearchInput.addEventListener("input", function () {
      renderAdminGlobalSearchResults(adminGlobalSearchInput.value);
    });
  }

  if (adminToggleGuidanceButton) {
    adminToggleGuidanceButton.addEventListener("click", function () {
      adminGuidanceHidden = !adminGuidanceHidden;
      applyGuidanceMode();
      saveStoredFlag(adminGuidanceStorageKey, adminGuidanceHidden);
    });
  }

  if (adminCollapsePanelsButton) {
    adminCollapsePanelsButton.addEventListener("click", function () {
      document.querySelectorAll(".admin-panel.is-collapsible").forEach((panel) => {
        setPanelCollapsed(panel, true);
      });
      setStatus("All admin sections collapsed.");
    });
  }

  if (adminExpandPanelsButton) {
    adminExpandPanelsButton.addEventListener("click", function () {
      document.querySelectorAll(".admin-panel.is-collapsible").forEach((panel) => {
        setPanelCollapsed(panel, false);
      });
      setStatus("All admin sections expanded.");
    });
  }

  document.addEventListener("click", function (event) {
    const commandButton = event.target.closest("[data-admin-command-open]");
    const jumpButton = event.target.closest("[data-admin-jump]");
    const searchButton = event.target.closest("[data-admin-search-jump]");

    if (commandButton) {
      const targetTab = commandButton.dataset.adminCommandOpen;
      if (!targetTab) {
        return;
      }

      activateAdminTab(targetTab);

      const targetFieldId = commandButton.dataset.adminCommandQueryTarget;
      const targetFieldValue = commandButton.dataset.adminCommandQueryValue || "";
      if (targetFieldId) {
        const targetField = document.getElementById(targetFieldId);
        if (targetField) {
          targetField.value = targetFieldValue;
          targetField.dispatchEvent(new Event("input", { bubbles: true }));
          targetField.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      setStatus(`${getAdminTabLabel(targetTab)} opened from search.`);
      return;
    }

    if (searchButton) {
      const targetTab = searchButton.dataset.adminSearchJump;
      if (!targetTab) {
        return;
      }

      activateAdminTab(targetTab);
      if (adminTabSearchInput) {
        adminTabSearchInput.value = "";
        filterAdminTabs("");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStatus(`${getAdminTabLabel(targetTab)} opened from quick find.`);
      return;
    }

    if (!jumpButton) {
      return;
    }

    const targetTab = jumpButton.dataset.adminJump;
    if (!targetTab) {
      return;
    }

    activateAdminTab(targetTab);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStatus(`${getAdminTabLabel(targetTab)} opened from the guide.`);
  });

  addButton.addEventListener("click", function () {
    resetForm();
    setStatus("Ready to add a new product.");
    activateAdminTab("workspace");
  });

  if (resetSalesButton) {
    resetSalesButton.addEventListener("click", resetSalesDashboard);
  }

  if (resetProfitButton) {
    resetProfitButton.addEventListener("click", resetProfitHistory);
  }

  renderMpesaDashboard();

  if (mpesaClearAllButton) {
    mpesaClearAllButton.addEventListener("click", function () {
      const confirmed = window.confirm(
        "Clear the entire M-Pesa workspace? This will remove the overview cards, pending confirmations, reconciliation, and transaction log in this browser."
      );
      if (!confirmed) {
        return;
      }

      mpesaDashboard = { cleared: true };
      renderMpesaDashboard();
      saveMpesaDashboard("M-Pesa workspace cleared in this browser.");
    });
  }

  [profitProductSelect, profitQuantityInput, profitOrderMomPriceInput, profitOrderPriceInput, profitOrderDeliveryChargeInput, profitOrderDeliveryCostInput].forEach(
    (input) => {
      if (!input) {
        return;
      }

      input.addEventListener("input", function () {
        if (input === profitProductSelect) {
          syncProfitCalculatorFromSelection();
          return;
        }

        renderProfitBreakdown();
      });

      input.addEventListener("change", function () {
        if (input === profitProductSelect) {
          syncProfitCalculatorFromSelection();
          return;
        }

        renderProfitBreakdown();
      });
    }
  );

  if (socialForm) {
    socialForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      socialSettings = [
        { label: "WhatsApp", url: socialWhatsappInput.value.trim() || "#" },
        { label: "Instagram", url: socialInstagramInput.value.trim() || "#" },
        { label: "Facebook", url: socialFacebookInput.value.trim() || "#" },
        { label: "TikTok", url: socialTiktokInput.value.trim() || "#" }
      ];
      saveSocialSettings("Social links saved locally.");
      renderSocialLinksPreview();
      await publishSocialSettingsToSupabase("Social links saved.");
      activateAdminTab("social");
    });
  }

  if (generateCaptionButton) {
    generateCaptionButton.addEventListener("click", function () {
      const product = catalog.find((item) => item.id === socialProductSelect.value) || catalog[0];
      socialCaption.value = buildCaption(product, socialToneSelect.value);
      setStatus(`Caption ready for ${product ? product.name : "your selected product"}.`);
    });
  }

  if (copyCaptionButton) {
    copyCaptionButton.addEventListener("click", async function () {
      if (!socialCaption.value.trim()) {
        setStatus("Generate a caption first.");
        return;
      }

      try {
        await navigator.clipboard.writeText(socialCaption.value);
        setStatus("Caption copied to clipboard.");
      } catch (error) {
        socialCaption.focus();
        socialCaption.select();
        setStatus("Caption selected. Press Ctrl+C to copy.");
      }
    });
  }

  if (socialCalendar) {
    socialCalendar.addEventListener("input", function (event) {
      const themeInput = event.target.closest("[data-social-theme]");
      const noteInput = event.target.closest("[data-social-note]");

      if (themeInput) {
        socialPlanner[Number(themeInput.dataset.socialTheme)].theme = themeInput.value;
        saveSocialPlanner("Content calendar updated.");
      }

      if (noteInput) {
        socialPlanner[Number(noteInput.dataset.socialNote)].note = noteInput.value;
        saveSocialPlanner("Content calendar updated.");
      }
    });
  }

  if (socialMedia) {
    socialMedia.addEventListener("click", function (event) {
      const button = event.target.closest("[data-social-pick]");
      if (!button) {
        return;
      }

      socialProductSelect.value = button.dataset.socialPick;
      const product = catalog.find((item) => item.id === button.dataset.socialPick);
      socialCaption.value = buildCaption(product, socialToneSelect.value);
      activateAdminTab("social");
      setStatus(`${product ? product.name : "Product"} loaded into the caption studio.`);
    });
  }

  if (bundleForm) {
    bundleForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const productIds = getSelectedBundleProductIds();

      if (!bundleNameInput.value.trim() || !productIds.length) {
        setStatus("Add a bundle name and choose at least one product.");
        return;
      }

      const payload = {
        id: editingBundleId || `bundle-${Date.now()}`,
        name: bundleNameInput.value.trim(),
        price: Number(bundlePriceInput.value) || 0,
        note: bundleNoteInput.value.trim(),
        productIds
      };

      if (editingBundleId) {
        bundles = bundles.map((bundle) => (bundle.id === editingBundleId ? payload : bundle));
        saveBundles(`${payload.name} updated.`);
      } else {
        bundles.unshift(payload);
        saveBundles(`${payload.name} saved.`);
      }

      resetBundleForm();
      activateAdminTab("bundles");
    });
  }

  if (bundleList) {
    bundleList.addEventListener("click", function (event) {
      const editButton = event.target.closest("[data-bundle-edit]");
      const deleteButton = event.target.closest("[data-bundle-delete]");

      if (editButton) {
        const bundle = bundles.find((item) => item.id === editButton.dataset.bundleEdit);
        if (!bundle) {
          return;
        }

        editingBundleId = bundle.id;
        bundleNameInput.value = bundle.name || "";
        bundlePriceInput.value = bundle.price || "";
        bundleNoteInput.value = bundle.note || "";
        renderBundleProductPicker(bundle.productIds || []);
        setStatus(`${bundle.name} loaded into the bundle builder.`);
        activateAdminTab("bundles");
      }

      if (deleteButton) {
        bundles = bundles.filter((bundle) => bundle.id !== deleteButton.dataset.bundleDelete);
        saveBundles("Bundle removed.");
      }
    });
  }

  if (replyForm) {
    replyForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!replyTitleInput.value.trim() || !replyMessageInput.value.trim()) {
        setStatus("Add a template title and message before saving.");
        return;
      }

      const payload = {
        id: editingReplyId || `reply-${Date.now()}`,
        title: replyTitleInput.value.trim(),
        category: replyCategoryInput.value,
        message: replyMessageInput.value.trim()
      };

      if (editingReplyId) {
        replyTemplates = replyTemplates.map((template) => (template.id === editingReplyId ? payload : template));
        saveReplyTemplates(`${payload.title} updated.`);
      } else {
        replyTemplates.unshift(payload);
        saveReplyTemplates(`${payload.title} saved.`);
      }

      resetReplyForm();
      activateAdminTab("replies");
    });
  }

  if (replyList) {
    replyList.addEventListener("click", async function (event) {
      const copyButton = event.target.closest("[data-reply-copy]");
      const editButton = event.target.closest("[data-reply-edit]");
      const deleteButton = event.target.closest("[data-reply-delete]");

      if (copyButton) {
        const template = replyTemplates.find((item) => item.id === copyButton.dataset.replyCopy);
        if (!template) {
          return;
        }

        try {
          await navigator.clipboard.writeText(template.message);
          setStatus(`${template.title} copied to clipboard.`);
        } catch (error) {
          replyMessageInput.value = template.message;
          replyMessageInput.focus();
          replyMessageInput.select();
          setStatus("Template selected. Press Ctrl+C to copy.");
        }
      }

      if (editButton) {
        const template = replyTemplates.find((item) => item.id === editButton.dataset.replyEdit);
        if (!template) {
          return;
        }

        populateReplyForm(template);
        setStatus(`${template.title} loaded into the reply editor.`);
        activateAdminTab("replies");
      }

      if (deleteButton) {
        replyTemplates = replyTemplates.filter((template) => template.id !== deleteButton.dataset.replyDelete);
        saveReplyTemplates("Reply template removed.");
      }
    });
  }

  if (orderForm) {
    orderForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (isSavingOrder) {
        return;
      }

      const product = catalog.find((item) => item.id === orderProductSelect.value);
      const area = deliveryAreas.find((item) => item.id === orderAreaSelect.value);
      if (!product) {
        setStatus("Choose a product before saving the order.");
        return;
      }

      const quantity = Math.max(1, Number(orderQuantityInput.value) || 1);
      const productProfit = getProductProfit(product, quantity);
      const deliveryProfit = area ? Math.max(0, Number(area.clientCharge || 0) - Number(area.realCost || 0)) : 0;
      const totalProfit = productProfit + deliveryProfit;
      const orderTotal = getOrderTotal(product, quantity, area);
      const createdAt = new Date().toISOString();
      const draftOrder = {
        customer: orderCustomerInput.value.trim() || "Walk-in customer",
        phone: orderPhoneInput.value.trim(),
        productId: product.id,
        productName: product.name,
        quantity,
        areaId: area ? area.id : "",
        areaName: area ? area.name : "",
        status: normalizeOrderStatus(orderStatusSelect.value),
        note: orderNoteInput.value.trim(),
        totalProfit,
        orderTotal,
        createdAt,
        updatedAt: createdAt
      };
      const recentDuplicate = editingOrderId ? null : findRecentDuplicateOrder(draftOrder);

      if (recentDuplicate) {
        orders = orders.map((order) =>
          order.id === recentDuplicate.id
            ? {
                ...order,
                status: draftOrder.status,
                note: draftOrder.note,
                totalProfit: draftOrder.totalProfit,
                orderTotal: draftOrder.orderTotal,
                updatedAt: createdAt
              }
            : order
        );
        renderOrderFeedback({ ...recentDuplicate, ...draftOrder, updatedAt: createdAt }, "updated");
        await saveOrders(`A matching order was already saved as ${recentDuplicate.id}. I updated that order instead of creating another copy.`);
        resetOrderFormState();
        activateAdminTab("orders");
        return;
      }

      isSavingOrder = true;
      if (orderSaveButton) {
        orderSaveButton.disabled = true;
        orderSaveButton.textContent = "Saving...";
      }

      try {
        if (editingOrderId) {
          orders = orders.map((order) =>
            order.id === editingOrderId
              ? {
                  ...order,
                  customer: draftOrder.customer,
                  phone: draftOrder.phone,
                  productId: draftOrder.productId,
                  productName: draftOrder.productName,
                  quantity: draftOrder.quantity,
                  areaId: draftOrder.areaId,
                  areaName: draftOrder.areaName,
                  status: draftOrder.status,
                  note: draftOrder.note,
                  totalProfit: draftOrder.totalProfit,
                  orderTotal: draftOrder.orderTotal,
                  updatedAt: createdAt
                }
              : order
          );
          const updatedOrder = orders.find((order) => order.id === editingOrderId);
          renderOrderFeedback(updatedOrder, "updated");
          await saveOrders(`Order ${editingOrderId} updated.`);
        } else {
          const orderId = buildOrderId(
            new Set(orders.map((order) => order.id)),
            createdAt,
            `${orderPhoneInput.value.trim()}:${product.id}:${createdAt}`
          );

          const nextOrder = {
            id: orderId,
            orderId,
            customer: draftOrder.customer,
            phone: draftOrder.phone,
            productId: draftOrder.productId,
            productName: draftOrder.productName,
            quantity: draftOrder.quantity,
            areaId: draftOrder.areaId,
            areaName: draftOrder.areaName,
            status: draftOrder.status,
            note: draftOrder.note,
            totalProfit: draftOrder.totalProfit,
            orderTotal: draftOrder.orderTotal,
            createdAt: draftOrder.createdAt,
            updatedAt: draftOrder.updatedAt
          };

          orders.unshift(nextOrder);
          renderOrderFeedback(nextOrder, "saved");
          await saveOrders(`Order ${orderId} saved.`);
        }

        resetOrderFormState();
        activateAdminTab("orders");
      } finally {
        isSavingOrder = false;
        if (orderSaveButton) {
          orderSaveButton.disabled = false;
        }
      }
    });
  }

  if (socialLinksPreview) {
    socialLinksPreview.addEventListener("click", async function (event) {
      const button = event.target.closest("[data-social-copy-link]");
      if (!button) {
        return;
      }

      const social = socialSettings.find((item) => item.label === button.dataset.socialCopyLink);
      if (!social || !isLiveSocialUrl(social.url)) {
        setStatus("That social link is still empty.");
        return;
      }

      try {
        await navigator.clipboard.writeText(social.url);
        setStatus(`${social.label} link copied.`);
      } catch (error) {
        setStatus(`Unable to copy the ${social.label} link right now.`);
      }
    });
  }

  if (orderList) {
    orderList.addEventListener("change", async function (event) {
      const select = event.target.closest("[data-order-status]");
      if (!select) {
        return;
      }

      orders = orders.map((order) =>
        order.id === select.dataset.orderStatus
          ? { ...order, status: normalizeOrderStatus(select.value), updatedAt: new Date().toISOString() }
          : order
      );
      await saveOrders("Order status updated.");
    });

    orderList.addEventListener("click", async function (event) {
      const trackButton = event.target.closest("[data-order-track]");
      const editButton = event.target.closest("[data-order-edit]");
      const toggleButton = event.target.closest("[data-order-toggle]");
      const button = event.target.closest("[data-order-delete]");

      if (trackButton) {
        const orderId = trackButton.dataset.orderTrack;
        window.open(buildTrackOrderUrl(orderId), "_blank", "noopener");
        setStatus(`Opened the tracking page for ${orderId}.`);
        return;
      }

      if (editButton) {
        loadOrderIntoForm(editButton.dataset.orderEdit);
        setStatus(`Editing order ${editButton.dataset.orderEdit}.`);
        return;
      }

      if (toggleButton) {
        expandedOrderId = expandedOrderId === toggleButton.dataset.orderToggle ? null : toggleButton.dataset.orderToggle;
        renderOrders();
        return;
      }

      if (!button) {
        return;
      }

      if (editingOrderId === button.dataset.orderDelete) {
        resetOrderFormState();
      }
      clearOrderFeedback();
      expandedOrderId = expandedOrderId === button.dataset.orderDelete ? null : expandedOrderId;
      orders = orders.filter((order) => order.id !== button.dataset.orderDelete);
      await removeOrder(button.dataset.orderDelete, "Order removed.");
    });
  }

  if (orderSearchInput) {
    orderSearchInput.addEventListener("input", function () {
      orderSearchTerm = orderSearchInput.value || "";
      renderOrders();
    });
  }

  if (orderFilterSelect) {
    orderFilterSelect.addEventListener("change", function () {
      orderStatusFilter = orderFilterSelect.value || "all";
      renderOrders();
    });
  }

  if (orderCancelEditButton) {
    orderCancelEditButton.addEventListener("click", function () {
      resetOrderFormState();
      clearOrderFeedback();
      setStatus("Order edit cancelled.");
    });
  }

  if (orderFeedback) {
    orderFeedback.addEventListener("click", async function (event) {
      const copyButton = event.target.closest("[data-order-feedback-copy]");
      const openButton = event.target.closest("[data-order-feedback-open]");

      if (copyButton) {
        const orderId = copyButton.dataset.orderFeedbackCopy;
        const trackingUrl = buildTrackOrderUrl(orderId);
        try {
          await navigator.clipboard.writeText(trackingUrl);
          setStatus(`Tracking link for ${orderId} copied.`);
        } catch (error) {
          setStatus(`Could not copy the tracking link for ${orderId}.`);
        }
      }

      if (openButton) {
        const orderId = openButton.dataset.orderFeedbackOpen;
        window.open(buildTrackOrderUrl(orderId), "_blank", "noopener");
        setStatus(`Opened the tracking page for ${orderId}.`);
      }
    });
  }

  if (orderClearButton) {
    orderClearButton.addEventListener("click", async function () {
      if (!orders.length) {
        setStatus("There are no saved orders to clear.");
        return;
      }

      const confirmed = window.confirm("Clear the entire saved order list? This will also remove live tracking records for those orders.");
      if (!confirmed) {
        return;
      }

      resetOrderFormState();
      clearOrderFeedback();
      expandedOrderId = null;
      orders = [];
      await clearAllOrders("Order list cleared.");
    });
  }

  if (customerSearchInput) {
    customerSearchInput.addEventListener("input", function () {
      customerSearchTerm = customerSearchInput.value || "";
      renderCustomerDashboard();
    });
  }

  if (customerList) {
    customerList.addEventListener("click", function (event) {
      const row = event.target.closest("[data-customer-select]");
      if (!row) {
        return;
      }

      selectedCustomerKey = row.dataset.customerSelect || "";
      renderCustomerDashboard();
    });
  }

  if (customerFollowups) {
    customerFollowups.addEventListener("click", function (event) {
      const row = event.target.closest("[data-customer-select]");
      if (!row) {
        return;
      }

      selectedCustomerKey = row.dataset.customerSelect || "";
      activateAdminTab("customers");
      renderCustomerDashboard();
      setStatus("Customer detail opened from follow-up ideas.");
    });
  }

  if (customerHighlight) {
    customerHighlight.addEventListener("click", async function (event) {
      const copyButton = event.target.closest("[data-customer-copy]");
      const ordersButton = event.target.closest("[data-customer-orders]");

      if (copyButton) {
        try {
          await navigator.clipboard.writeText(copyButton.dataset.customerCopy || "");
          setStatus("Customer phone copied.");
        } catch (error) {
          setStatus("Could not copy the customer phone right now.");
        }
        return;
      }

      if (ordersButton) {
        const customer = getCustomerRecords().find((item) => item.key === ordersButton.dataset.customerOrders);
        selectedCustomerKey = ordersButton.dataset.customerOrders || selectedCustomerKey;
        activateAdminTab("orders");
        orderSearchTerm = customer ? customer.customer || customer.phone || "" : "";
        if (orderSearchInput) {
          orderSearchInput.value = orderSearchTerm;
        }
        renderOrders();
        setStatus("Filtered the order list for this customer.");
      }
    });
  }

  async function handleDeliveryAction(event) {
    const moveButton = event.target.closest("[data-delivery-move]");
    const focusButton = event.target.closest("[data-delivery-focus-order]");
    const editButton = event.target.closest("[data-delivery-edit-order]");
    const trackButton = event.target.closest("[data-delivery-track-order]");

    if (moveButton) {
      const orderId = moveButton.dataset.deliveryMove;
      const nextStatus = normalizeOrderStatus(moveButton.dataset.deliveryStatus);
      selectedDeliveryOrderId = orderId || "";
      orders = orders.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus, updatedAt: new Date().toISOString() } : order
      );
      await saveOrders(`Order ${orderId} moved to ${getOrderStatusLabel(nextStatus)}.`);
      return;
    }

    if (focusButton) {
      const order = orders.find((item) => item.id === focusButton.dataset.deliveryFocusOrder);
      if (!order) {
        return;
      }
      selectedDeliveryOrderId = order.id || "";
      renderDeliveryDesk();
      setStatus(`Opened the delivery view for ${order.id}.`);
      return;
    }

    if (editButton) {
      const orderId = editButton.dataset.deliveryEditOrder;
      loadOrderIntoForm(orderId);
      activateAdminTab("orders");
      setStatus(`Editing order ${orderId}.`);
      return;
    }

    if (trackButton) {
      const orderId = trackButton.dataset.deliveryTrackOrder;
      window.open(buildTrackOrderUrl(orderId), "_blank", "noopener");
      setStatus(`Opened the tracking page for ${orderId}.`);
    }
  }

  if (deliveryBoard) {
    deliveryBoard.addEventListener("click", handleDeliveryAction);
  }

  if (deliveryFocus) {
    deliveryFocus.addEventListener("click", handleDeliveryAction);
  }

  if (deliveryForm) {
    deliveryForm.addEventListener("submit", function (event) {
      event.preventDefault();
      deliveryAreas.unshift({
        id: `delivery-${Date.now()}`,
        name: deliveryNameInput.value.trim() || "New area",
        clientCharge: Number(deliveryClientChargeInput.value) || 0,
        realCost: Number(deliveryRealCostInput.value) || 0
      });
      deliveryForm.reset();
      saveDeliveryAreas("Delivery area saved.");
      activateAdminTab("operations");
    });
  }

  if (deliveryList) {
    deliveryList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-delivery-delete]");
      if (!button) {
        return;
      }

      deliveryAreas = deliveryAreas.filter((area) => area.id !== button.dataset.deliveryDelete);
      saveDeliveryAreas("Delivery area removed.");
    });
  }

  if (expenseForm) {
    expenseForm.addEventListener("submit", function (event) {
      event.preventDefault();
      expenses.unshift({
        id: `expense-${Date.now()}`,
        name: expenseNameInput.value.trim() || "Expense",
        amount: Number(expenseAmountInput.value) || 0,
        note: expenseNoteInput.value.trim(),
        createdAt: new Date().toISOString()
      });
      expenseForm.reset();
      saveExpenses("Expense saved.");
      activateAdminTab("operations");
    });
  }

  if (expenseList) {
    expenseList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-expense-delete]");
      if (!button) {
        return;
      }

      expenses = expenses.filter((expense) => expense.id !== button.dataset.expenseDelete);
      saveExpenses("Expense removed.");
    });
  }

  if (liveAuthForm) {
    liveAuthForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!liveCatalogApi || typeof liveCatalogApi.signInWithPassword !== "function" || !liveCatalogApi.isConfigured()) {
        setLiveAuthState("Supabase is not configured on this admin yet.", "warning");
        setStatus("Supabase is not configured, so live publish is unavailable.");
        return;
      }

      if (!liveEmailInput.value.trim() || !livePasswordInput.value.trim()) {
        setStatus("Add your Supabase email and password to sign in for live publishing.");
        return;
      }

      setLiveAuthState("Signing in to Supabase...", "warning");

      try {
        await liveCatalogApi.signInWithPassword(liveEmailInput.value, livePasswordInput.value);
        await refreshLiveUser();
        livePasswordInput.value = "";
        setStatus("Supabase sign-in successful. Product saves can now publish to the live website.");
      } catch (error) {
        console.error("Unable to sign in to Supabase.", error);
        currentLiveUser = null;
        setLiveAuthState("Supabase sign-in failed. Check your email or password.", "error");
        setStatus("Supabase sign-in failed. Please check your email and password.");
      }
    });
  }

  if (liveSignOutButton) {
    liveSignOutButton.addEventListener("click", async function () {
      if (!liveCatalogApi || typeof liveCatalogApi.signOut !== "function" || !liveCatalogApi.isConfigured()) {
        currentLiveUser = null;
        renderLiveAuthState();
        return;
      }

      try {
        await liveCatalogApi.signOut();
      } catch (error) {
        console.error("Unable to sign out from Supabase.", error);
      }

      currentLiveUser = null;
      if (livePasswordInput) {
        livePasswordInput.value = "";
      }
      renderLiveAuthState();
      setStatus("Signed out of Supabase. Future saves will stay local until you sign in again.");
    });
  }

  if (goalForm) {
    goalForm.addEventListener("submit", function (event) {
      event.preventDefault();
      kioskGoal = {
        target: Number(goalTargetInput.value) || 0,
        saved: Number(goalSavedInput.value) || 0,
        note: goalNoteInput.value.trim()
      };
      saveGoal("Kiosk goal saved.");
      activateAdminTab("growth");
    });
  }

  resetButton.addEventListener("click", function () {
    catalog = defaultProducts.map((product, index) => normalizeProduct(product, index));
    resetBundleForm();
    resetReplyForm();
    resetForm();
    saveCatalogState("Default catalog restored.", { publishLive: true });
  });

  if (repairImagesButton) {
    repairImagesButton.addEventListener("click", function () {
      repairCatalogImagesFromLibrary();
    });
  }

  saveButton.addEventListener("click", function () {
    saveCatalogState("Catalog saved. Storefront pages in this browser now use the updated products.", { publishLive: true });
  });

  list.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    const product = catalog.find((item) => item.id === button.dataset.id);
    if (!product) {
      return;
    }

    if (button.dataset.action === "edit") {
      populateForm(product);
      setStatus(`Editing ${product.name}.`);
      activateAdminTab("workspace");
    }

    if (button.dataset.action === "preview") {
      setPreviewTarget(`product.html?id=${product.id}`, `${product.name} Page`);
      syncLivePreviewFrame();
      setStatus(`Now previewing ${product.name} in the phone view.`);
      activateAdminTab("preview");
    }

    if (button.dataset.action === "delete") {
      catalog = catalog.filter((item) => item.id !== product.id);
      saveCatalogState(`${product.name} removed from the catalog.`, { publishLive: true });
      resetForm();
    }
  });

  if (featuredSearchInput) {
    featuredSearchInput.addEventListener("input", renderFeaturedManager);
  }

  featuredManager.addEventListener("click", function (event) {
    const slotButton = event.target.closest("[data-featured-slot-select]");
    if (slotButton) {
      activeFeaturedSlotIndex = Number(slotButton.dataset.featuredSlotSelect) || 0;
      renderFeaturedManager();
      return;
    }

    const moveButton = event.target.closest("[data-featured-move]");
    if (moveButton) {
      const moved = moveFeaturedSlot(moveButton.dataset.featuredMove, Number(moveButton.dataset.direction) || 0);
      if (moved) {
        saveCatalogState("Homepage featured product order updated.", { publishLive: true });
      }
      return;
    }

    const editButton = event.target.closest("[data-featured-edit]");
    if (editButton) {
      const product = catalog.find((item) => item.id === editButton.dataset.featuredEdit);
      if (product) {
        populateForm(product);
        setStatus(`Editing ${product.name} from the homepage slots.`);
        activateAdminTab("workspace");
      }
      return;
    }

    const removeButton = event.target.closest("[data-featured-remove]");
    if (removeButton) {
      const product = catalog.find((item) => item.id === removeButton.dataset.featuredRemove);
      setProductFeatured(removeButton.dataset.featuredRemove, false);
      if (editingId === removeButton.dataset.featuredRemove) {
        featuredInput.checked = false;
      }
      activeFeaturedSlotIndex = Math.max(0, Math.min(activeFeaturedSlotIndex, FEATURED_SLOT_COUNT - 1));
      saveCatalogState(product ? `${product.name} removed from homepage slots.` : "Homepage featured products updated.", { publishLive: true });
      renderDraftPreview();
    }
  });

  if (featuredCandidates) {
    featuredCandidates.addEventListener("click", function (event) {
      const addButton = event.target.closest("[data-featured-add]");
      if (!addButton) {
        return;
      }

      const productId = addButton.dataset.featuredAdd;
      const homepageFeatured = getHomepageFeaturedProducts();
      const targetSlotIndex =
        activeFeaturedSlotIndex < FEATURED_SLOT_COUNT ? activeFeaturedSlotIndex : Math.max(0, homepageFeatured.length - 1);
      const updated = replaceHomepageSlot(targetSlotIndex, productId);
      const product = catalog.find((item) => item.id === productId);

      if (!updated) {
        setStatus("That product is already in the selected homepage slot.");
        return;
      }

      if (editingId === productId) {
        featuredInput.checked = true;
      }

      saveCatalogState(
        product ? `${product.name} placed into homepage slot ${targetSlotIndex + 1}.` : "Homepage featured products updated.",
        { publishLive: true }
      );
      renderDraftPreview();
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const resolvedName = nameInput.value.trim() || buildSuggestedProductName();
    nameInput.value = resolvedName;
    const details = detailsInput.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const images = getFormGalleryImages();
    const existingAnalytics = editingId ? (catalog.find((product) => product.id === editingId) || {}).analytics : null;

    const payload = normalizeProduct(
      {
        id: editingId || slugify(nameInput.value) || `product-${Date.now()}`,
        name: resolvedName,
        category: categoryInput.value,
        price: Number(priceInput.value),
        momPrice: Number(momPriceInput.value),
        deliveryCharge: Number(deliveryChargeInput.value),
        deliveryCost: Number(deliveryCostInput.value),
        source: sourceInput.value,
        stockQty: Number(stockQtyInput.value),
        reservedQty: Number(reservedQtyInput.value),
        badge: badgeInput.value.trim(),
        featured: featuredInput.checked,
        newArrival: newInput.checked,
        shortDescription: descriptionInput.value.trim(),
        description: descriptionInput.value.trim(),
        details,
        images,
        analytics: existingAnalytics || defaultAnalytics({ price: Number(priceInput.value), featured: featuredInput.checked, newArrival: newInput.checked }, catalog.length)
      },
      catalog.length
    );

    if (editingId) {
      catalog = catalog.map((product) => (product.id === editingId ? payload : product));
      saveCatalogState(`${payload.name} updated in the catalog.`, { publishLive: true });
    } else {
      catalog.unshift(payload);
      saveCatalogState(`${payload.name} added to the catalog.`, { publishLive: true });
    }

    temporaryMainPreviewSrc = "";
    setPreviewTarget(`product.html?id=${payload.id}`, `${payload.name} Page`);
    syncLivePreviewFrame();
    resetForm();
  });

  syncCategoryRuntimeData(false);
  syncHomeVisualsRuntimeData(false);
  renderCategorySelectControls();
  renderCategoryImageLibrary();
  populateCategoryForm(editingCategorySlug);
  renderFavoriteProductSelect();
  renderVisualImageLibrary();
  populateVisualStoryForm();
  activateVisualSection(activeVisualSection);
  renderImageLibrary();
  renderInlineImageLibrary();
  resetForm();
  updateCategoryChipSelection();
  renderList();
  renderFeaturedManager();
  renderSalesDashboard();
  renderProfitProductSelect();
  if (profitProductSelect) {
    profitProductSelect.value = "";
  }
  syncProfitCalculatorFromSelection();
  renderProfitDashboard();
  renderOrderProductSelect();
  renderOrderAreaSelect();
  resetOrderFormState();
  renderOrders();
  renderCustomerDashboard();
  renderDeliveryDesk();
  renderDeliveryAreas();
  renderExpenses();
  renderStockList();
  renderBundleProductPicker([]);
  renderBundles();
  resetReplyForm();
  renderReplyTemplates();
  renderAnalyticsDashboard();
  populateSocialForm();
  renderSocialLinksPreview();
  renderSocialProductSelect();
  renderSocialCalendar();
  renderSocialMedia();
  renderSocialTracker();
  renderGoalCard();
  renderAdminOverview();
  renderLiveAuthState();
  if (liveCatalogApi && typeof liveCatalogApi.onAuthStateChange === "function" && liveCatalogApi.isConfigured()) {
    liveCatalogApi.onAuthStateChange(async function (user) {
      currentLiveUser = user || null;
      renderLiveAuthState();
      if (user) {
        await refreshOrdersFromLive();
      }
      await refreshStorefrontAnalytics();
    });
    refreshLiveUser().then(async function () {
      await refreshOrdersFromLive();
      refreshStorefrontAnalytics();
    });
  } else {
    refreshStorefrontAnalytics();
  }
  if (catalog[0] && socialProductSelect && socialCaption && socialToneSelect) {
    socialProductSelect.value = catalog[0].id;
    socialCaption.value = buildCaption(catalog[0], socialToneSelect.value);
  }
  syncLivePreviewFrame();
  const savedAdminTab = window.localStorage.getItem(adminTabStorageKey);
  if (savedAdminTab && Array.from(adminTabButtons).some((button) => button.dataset.adminTab === savedAdminTab)) {
    activateAdminTab(savedAdminTab);
  } else {
    activateAdminTab("workspace");
  }
  if (!repairedCatalogOnLoad) {
    setStatus("Admin panel ready. Saved catalog changes now drive the storefront in this browser.");
  }
});
