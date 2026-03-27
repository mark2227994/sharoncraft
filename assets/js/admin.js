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
  const utils = window.SharonCraftUtils;
  // Wait for data to be loaded
  await utils.waitForData();
  const liveCatalogApi = window.SharonCraftCatalog || null;
  const availableImages = [
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
  const fallbackImage = "assets/images/IMG-20260226-WA0005.jpg";
  const defaultCategorySource =
    (window.SharonCraftDefaultData && window.SharonCraftDefaultData.categories) || utils.data.categories;
  const defaultHomeVisualSource =
    (window.SharonCraftDefaultData && window.SharonCraftDefaultData.homeVisuals) || utils.data.homeVisuals || {};
  const defaultProductSource = (window.SharonCraftDefaultData && window.SharonCraftDefaultData.products) || utils.data.products;
  const curatedLibraryImages = availableImages.filter(
    (image) => /\.(jpe?g|png|webp)$/i.test(image) && !/logo|favicon/i.test(image)
  );
  let categoryCatalog = (utils.data.categories || []).map((category) => normalizeCategory(category));
  let categoryMap = new Map(categoryCatalog.map((category) => [category.slug, category.name]));

  const defaultProducts = defaultProductSource.map((product, index) => normalizeProduct(product, index));
  const defaultProductImageMap = new Map(defaultProducts.map((product) => [product.id, product.images]));
  let defaultCategoryImageMap = buildDefaultCategoryImageMap(categoryCatalog);

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
    const mainImage =
      cleanImagePath(product.image) ||
      cleanImagePath(rawImages[0]) ||
      cleanImagePath(rawGallery[0]) ||
      fallbackImage;
    const gallery = dedupeImages([mainImage].concat(rawImages, rawGallery));
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: Number(product.price) || 0,
      momPrice: Number(product.momPrice) || 0,
      deliveryCharge: Number(product.deliveryCharge) || 0,
      deliveryCost: Number(product.deliveryCost) || 0,
      source: product.source || "mom-kiosk",
      stockQty: Number(product.stockQty) || 0,
      reservedQty: Number(product.reservedQty) || 0,
      badge: product.badge || "",
      featured: Boolean(product.featured),
      newArrival: Boolean(product.newArrival),
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
    window.localStorage.setItem(storageKey, JSON.stringify(catalog));
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
  const salesMetrics = document.getElementById("admin-sales-metrics");
  const salesChart = document.getElementById("admin-sales-chart");
  const salesTable = document.getElementById("admin-sales-table");
  const resetSalesButton = document.getElementById("admin-reset-sales");
  const orderForm = document.getElementById("admin-order-form");
  const orderCustomerInput = document.getElementById("admin-order-customer");
  const orderPhoneInput = document.getElementById("admin-order-phone");
  const orderProductSelect = document.getElementById("admin-order-product");
  const orderAreaSelect = document.getElementById("admin-order-area");
  const orderQuantityInput = document.getElementById("admin-order-quantity");
  const orderStatusSelect = document.getElementById("admin-order-status");
  const orderNoteInput = document.getElementById("admin-order-note");
  const orderMetrics = document.getElementById("admin-order-metrics");
  const orderList = document.getElementById("admin-order-list");
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
  const socialMedia = document.getElementById("admin-social-media");
  const socialTracker = document.getElementById("admin-social-tracker");
  const goalForm = document.getElementById("admin-goal-form");
  const goalTargetInput = document.getElementById("admin-goal-target");
  const goalSavedInput = document.getElementById("admin-goal-saved");
  const goalNoteInput = document.getElementById("admin-goal-note");
  const goalCard = document.getElementById("admin-goal-card");
  const growthMetrics = document.getElementById("admin-growth-metrics");
  const growthMonthly = document.getElementById("admin-growth-monthly");
  const customerMetrics = document.getElementById("admin-customer-metrics");
  const customerList = document.getElementById("admin-customer-list");
  const customerHighlight = document.getElementById("admin-customer-highlight");
  const bundleForm = document.getElementById("admin-bundle-form");
  const bundleNameInput = document.getElementById("admin-bundle-name");
  const bundlePriceInput = document.getElementById("admin-bundle-price");
  const bundleNoteInput = document.getElementById("admin-bundle-note");
  const bundleProductPicker = document.getElementById("admin-bundle-product-picker");
  const bundleMetrics = document.getElementById("admin-bundle-metrics");
  const bundleList = document.getElementById("admin-bundle-list");
  const replyForm = document.getElementById("admin-reply-form");
  const replyTitleInput = document.getElementById("admin-reply-title");
  const replyCategoryInput = document.getElementById("admin-reply-category");
  const replyMessageInput = document.getElementById("admin-reply-message");
  const replyList = document.getElementById("admin-reply-list");
  const adminOverviewGrid = document.getElementById("admin-overview-grid");
  const liveAuthState = document.getElementById("admin-live-auth-state");
  const liveAuthForm = document.getElementById("admin-live-auth-form");
  const liveEmailInput = document.getElementById("admin-live-email");
  const livePasswordInput = document.getElementById("admin-live-password");
  const liveSignOutButton = document.getElementById("admin-live-sign-out");
  const adminTabStorageKey = "sharoncraft-admin-active-tab";
  let currentLiveUser = null;

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

  function loadOrders() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(ordersKey) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
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
  let orders = loadOrders();
  let deliveryAreas = loadDeliveryAreas();
  let expenses = loadExpenses();
  let bundles = loadBundles();
  let replyTemplates = loadReplyTemplates();
  let kioskGoal = loadGoal();
  let editingBundleId = null;
  let editingReplyId = null;
  let editingCategorySlug = categoryCatalog[0] ? categoryCatalog[0].slug : "";
  let activeVisualSection = "hero";
  let uploadedImageCounter = 0;
  const uploadedImageTokenPrefix = "__uploaded_image__:";
  const uploadedImageRegistry = new Map();

  function dedupeImages(images) {
    return images.map(cleanImagePath).filter(Boolean).filter((path, index, listRef) => listRef.indexOf(path) === index);
  }

  function cleanImagePath(path) {
    return (path || "").trim();
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

  function syncPreviewJson() {
    if (!preview) {
      return;
    }

    preview.value = JSON.stringify(catalog, null, 2);
  }

  function saveSocialSettings(message) {
    window.localStorage.setItem(socialSettingsKey, JSON.stringify(socialSettings));
    if (message) {
      setStatus(message);
    }
  }

  function saveSocialPlanner(message) {
    window.localStorage.setItem(socialPlannerKey, JSON.stringify(socialPlanner));
    if (message) {
      setStatus(message);
    }
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function syncCategoryRuntimeData(saveToStorage) {
    categoryCatalog = categoryCatalog.map((category) => normalizeCategory(category));
    categoryMap = new Map(categoryCatalog.map((category) => [category.slug, category.name]));
    defaultCategoryImageMap = buildDefaultCategoryImageMap(categoryCatalog);
    utils.data.categories = categoryCatalog.map((category) => ({ ...category }));

    if (saveToStorage) {
      window.localStorage.setItem(categoriesSettingsKey, JSON.stringify(categoryCatalog));
    }
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

    const query = categoryImageSearchInput ? categoryImageSearchInput.value.trim().toLowerCase() : "";
    const filteredImages = availableImages
      .filter((image) => /\.(jpe?g|png|webp|svg)$/i.test(image))
      .filter((image) => !query || image.toLowerCase().includes(query))
      .slice(0, 18);

    categoryImageLibrary.innerHTML = filteredImages.length
      ? filteredImages
        .map(
          (image) => `
            <button class="admin-category-image-option" type="button" data-category-image="${image}">
              <img src="${image}" alt="${image.split("/").pop()}" loading="lazy" />
              <span>${image.split("/").pop()}</span>
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
    syncCategoryRuntimeData(true);
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
    setStatus(message);
  }

  function syncHomeVisualsRuntimeData(saveToStorage) {
    homeVisuals = normalizeHomeVisuals(homeVisuals);
    utils.data.homeVisuals = JSON.parse(JSON.stringify(homeVisuals));

    if (saveToStorage) {
      window.localStorage.setItem(homeVisualsSettingsKey, JSON.stringify(homeVisuals));
    }
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

    const query = visualImageSearchInput ? visualImageSearchInput.value.trim().toLowerCase() : "";
    const filteredImages = availableImages
      .filter((image) => /\.(jpe?g|png|webp)$/i.test(image))
      .filter((image) => !query || image.toLowerCase().includes(query))
      .slice(0, 18);

    visualImageLibrary.innerHTML = filteredImages.length
      ? filteredImages
        .map(
          (image) => `
            <button class="admin-category-image-option" type="button" data-visual-image="${image}">
              <img src="${image}" alt="${image.split("/").pop()}" loading="lazy" />
              <span>${image.split("/").pop()}</span>
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
    syncHomeVisualsRuntimeData(true);
    renderVisualPreview();
    setStatus(message);
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

  function getAdminTabLabel(tabName) {
    const labels = {
      workspace: "Add Product",
      catalog: "Product List",
      categories: "Categories",
      visuals: "Visual Story",
      preview: "Phone Preview",
      orders: "Orders",
      operations: "Delivery & Stock",
      profit: "Profit",
      social: "Social Tools",
      replies: "Quick Replies",
      assets: "Photo Library"
    };

    return labels[tabName] || tabName;
  }

  function renderAdminOverview() {
    if (!adminOverviewGrid) {
      return;
    }

    const cards = [
      { label: "Products", value: catalog.length },
      { label: "Categories", value: categoryCatalog.length },
      { label: "Featured", value: catalog.filter((product) => product.featured).length },
      { label: "Orders", value: orders.length },
      { label: "Delivery Areas", value: deliveryAreas.length }
    ];

    adminOverviewGrid.innerHTML = cards
      .map(
        (card) => `
          <article class="admin-overview-card">
            <span>${card.label}</span>
            <strong>${card.value}</strong>
          </article>
        `
      )
      .join("");
  }

  function activateAdminTab(tabName) {
    adminTabButtons.forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute('data-admin-tab') === tabName);
    });

    adminTabPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.getAttribute('data-admin-panel') === tabName);
    });

    switch (tabName) {
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
      case "sales":
        renderSalesDashboard();
        break;
      case "profit":
        renderProfitDashboard();
        break;
      case "social":
        renderSocialCalendar();
        renderSocialMedia();
        renderSocialTracker();
        break;
      case "bundles":
        renderBundles();
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
            <img src="${image}" alt="Selected gallery image ${index + 1}" />
            <div class="admin-gallery-chip-actions">
              <strong>${index === 0 ? "Main" : "Gallery"}</strong>
              <div>
                ${index === 0 ? "" : `<button type="button" data-action="set-main" data-image="${image}">Set Main</button>`}
                ${images.length > 1 ? `<button type="button" data-action="remove" data-image="${image}">Remove</button>` : ""}
              </div>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderImageLibrary() {
    const query = imageLibrarySearch ? imageLibrarySearch.value.trim().toLowerCase() : "";
    const filteredImages = availableImages.filter((image) => {
      return !query || image.toLowerCase().includes(query);
    });

    imageLibrary.innerHTML = filteredImages.length
      ? filteredImages
      .map(
        (image) => `
          <article class="admin-library-item">
            <img src="${image}" alt="${image.split("/").pop()}" loading="lazy" />
            <div class="admin-library-copy">
              <span>${image.split("/").pop()}</span>
              <div class="admin-library-actions">
                <button type="button" data-action="main" data-image="${image}">Use as Main</button>
                <button type="button" data-action="gallery" data-image="${image}">Add to Gallery</button>
              </div>
            </div>
          </article>
        `
      )
      .join("")
      : `
          <article class="empty-state-card">
            <strong>No matching images</strong>
            <p>Try a shorter file name or clear the search to see the full library again.</p>
          </article>
        `;
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
      .map((image) => `<img src="${image}" alt="Draft gallery preview" loading="lazy" />`)
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

  function renderFeaturedManager() {
    const featuredProducts = catalog.filter((product) => product.featured);
    featuredSummary.innerHTML = `
      <div class="admin-summary-pill">${featuredProducts.length} featured products selected</div>
      ${featuredProducts
        .slice(0, 6)
        .map((product) => `<span class="admin-summary-tag">${product.name}</span>`)
        .join("")}
    `;

    featuredManager.innerHTML = catalog
      .map(
        (product) => `
          <label class="admin-featured-item">
            <input type="checkbox" data-featured-id="${product.id}" ${product.featured ? "checked" : ""} />
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
            <div>
              <strong>${product.name}</strong>
              <span>${categoryMap.get(product.category) || product.category}</span>
            </div>
          </label>
        `
      )
      .join("");
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

  function saveOrders(message) {
    window.localStorage.setItem(ordersKey, JSON.stringify(orders));
    renderOrders();
    renderCustomerDashboard();
    renderGoalCard();
    renderAdminOverview();
    if (message) {
      setStatus(message);
    }
  }

  function saveDeliveryAreas(message) {
    window.localStorage.setItem(deliveryAreasKey, JSON.stringify(deliveryAreas));
    renderDeliveryAreas();
    renderOrderAreaSelect();
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

  function renderOrders() {
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

  function renderCustomerDashboard() {
    if (!customerMetrics || !customerList || !customerHighlight) {
      return;
    }

    const customers = getCustomerRecords();
    const repeatCustomers = customers.filter((customer) => customer.orders > 1);
    const topCustomer = customers[0];
    const repeatOrderCount = repeatCustomers.reduce((sum, customer) => sum + customer.orders, 0);
    const repeatRate = orders.length ? Math.round((repeatOrderCount / orders.length) * 100) : 0;

    customerMetrics.innerHTML = `
      <article class="admin-metric-card">
        <span>Unique Customers</span>
        <strong>${customers.length}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Repeat Customers</span>
        <strong>${repeatCustomers.length}</strong>
      </article>
      <article class="admin-metric-card">
        <span>Repeat Order Rate</span>
        <strong>${repeatRate}%</strong>
      </article>
      <article class="admin-metric-card">
        <span>Best Customer Profit</span>
        <strong>${topCustomer ? formatPrice(topCustomer.totalProfit) : formatPrice(0)}</strong>
      </article>
    `;

    customerHighlight.innerHTML = topCustomer
      ? `
          <article class="admin-customer-focus">
            <strong>${topCustomer.customer}</strong>
            <span>${topCustomer.phone || "No phone saved"}</span>
            <p>${topCustomer.orders} orders, ${topCustomer.totalUnits} items, and ${formatPrice(topCustomer.totalProfit)} profit so far.</p>
            <div class="admin-customer-tags">
              ${topCustomer.products.slice(0, 4).map((product) => `<span class="admin-summary-tag">${product}</span>`).join("")}
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
              <article class="admin-customer-row">
                <div>
                  <strong>${customer.customer}</strong>
                  <span>${customer.phone || "No phone saved"}</span>
                  <span>Last order ${formatDateLabel(customer.lastOrderAt)}</span>
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
              <strong>No repeat customers yet</strong>
              <span>Customer names will appear here automatically from the Orders tab.</span>
            </div>
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

    socialMedia.innerHTML = featuredFirst
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
      .join("");
  }

  function renderSocialTracker() {
    if (!socialTracker) {
      return;
    }

    const topChatProducts = [...catalog]
      .sort((left, right) => (right.analytics.whatsappClicks || 0) - (left.analytics.whatsappClicks || 0))
      .slice(0, 4);

    socialTracker.innerHTML = topChatProducts
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
      .join("");
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
    window.localStorage.setItem(storageKey, JSON.stringify(catalog));
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
      setStatus(message);
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

  imageLibrary.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    const image = button.dataset.image;
    let images = getFormGalleryImages();

    if (button.dataset.action === "main") {
      images = dedupeImages([image].concat(images.filter((item) => item !== image)));
      imageInput.value = toFormImageValue(image);
      temporaryMainPreviewSrc = "";
    }

    if (button.dataset.action === "gallery") {
      images = dedupeImages(images.concat(image));
      if (!imageInput.value.trim()) {
        imageInput.value = image;
      }
    }

    syncGalleryTextarea(images);
    renderDraftPreview();
    setStatus(`${image.split("/").pop()} added to the draft.`);
    activateAdminTab("workspace");
  });

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
    
    fileInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        // Show preview
        if (previewElement) {
          previewElement.classList.add("is-visible");
          previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
        }

        // Save as data URL in the text input
        if (textInput) {
          textInput.value = e.target.result;
          textInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        setStatus(`Image uploaded: ${file.name}`);
      };

      reader.onerror = function () {
        setStatus("Error reading image file.", "error");
      };

      reader.readAsDataURL(file);
    });
  }

  handleImageUpload(heroImageUploadInput, heroImageInput, heroImagePreview);
  handleImageUpload(favoriteImageUploadInput, favoriteImageInput, favoriteImagePreview);

  adminTabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      activateAdminTab(button.dataset.adminTab);
    });
  });

  document.addEventListener("click", function (event) {
    const jumpButton = event.target.closest("[data-admin-jump]");
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
    socialForm.addEventListener("submit", function (event) {
      event.preventDefault();
      socialSettings = [
        { label: "WhatsApp", url: socialWhatsappInput.value.trim() || "#" },
        { label: "Instagram", url: socialInstagramInput.value.trim() || "#" },
        { label: "Facebook", url: socialFacebookInput.value.trim() || "#" },
        { label: "TikTok", url: socialTiktokInput.value.trim() || "#" }
      ];
      saveSocialSettings("Social links saved. Refresh the storefront preview to see footer link updates.");
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
    orderForm.addEventListener("submit", function (event) {
      event.preventDefault();
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

      orders.unshift({
        id: `order-${Date.now()}`,
        customer: orderCustomerInput.value.trim() || "Walk-in customer",
        phone: orderPhoneInput.value.trim(),
        productId: product.id,
        productName: product.name,
        quantity,
        areaId: area ? area.id : "",
        areaName: area ? area.name : "",
        status: orderStatusSelect.value,
        note: orderNoteInput.value.trim(),
        totalProfit,
        createdAt: new Date().toISOString()
      });

      orderForm.reset();
      orderQuantityInput.value = 1;
      saveOrders("Order saved.");
      activateAdminTab("orders");
    });
  }

  if (orderList) {
    orderList.addEventListener("change", function (event) {
      const select = event.target.closest("[data-order-status]");
      if (!select) {
        return;
      }

      orders = orders.map((order) => (order.id === select.dataset.orderStatus ? { ...order, status: select.value } : order));
      saveOrders("Order status updated.");
    });

    orderList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-order-delete]");
      if (!button) {
        return;
      }

      orders = orders.filter((order) => order.id !== button.dataset.orderDelete);
      saveOrders("Order removed.");
    });
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

  featuredManager.addEventListener("change", function (event) {
    const input = event.target.closest("input[data-featured-id]");
    if (!input) {
      return;
    }

    catalog = catalog.map((product) =>
      product.id === input.dataset.featuredId ? { ...product, featured: input.checked } : product
    );
    if (editingId === input.dataset.featuredId) {
      featuredInput.checked = input.checked;
    }
    saveCatalogState("Homepage featured products updated.", { publishLive: true });
    renderDraftPreview();
  });

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
  renderOrders();
  renderCustomerDashboard();
  renderDeliveryAreas();
  renderExpenses();
  renderStockList();
  renderBundleProductPicker([]);
  renderBundles();
  resetReplyForm();
  renderReplyTemplates();
  populateSocialForm();
  renderSocialProductSelect();
  renderSocialCalendar();
  renderSocialMedia();
  renderSocialTracker();
  renderGoalCard();
  renderAdminOverview();
  renderLiveAuthState();
  if (liveCatalogApi && typeof liveCatalogApi.onAuthStateChange === "function" && liveCatalogApi.isConfigured()) {
    liveCatalogApi.onAuthStateChange(function (user) {
      currentLiveUser = user || null;
      renderLiveAuthState();
    });
    refreshLiveUser();
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
