const defaultProducts = [
  {
    image: "images/product1.jpg",
    name: "Savannah Carved Mask",
    price: 3800,
    material: "wood",
    story: "Hand-carved with bold contours inspired by Savannah ceremonial forms.",
    specs: ["Material: Ebony wood", "Finish: Natural oil", "Size: 34 cm"],
    gallery: ["images/product1.jpg"],
  },
  {
    image: "images/product3.jpg",
    name: "Kikuyu Woven Basket",
    price: 2500,
    material: "wood",
    story: "A timeless basket woven for texture-rich, modern interiors.",
    specs: ["Material: Sisal & palm", "Finish: Hand-dyed", "Size: 28 cm"],
    gallery: ["images/product3.jpg"],
  },
  {
    image: "images/product4.jpg",
    name: "Coastal Driftwood Sculpture",
    price: 6100,
    material: "wood",
    story: "Sculpted from Kenyan coastal driftwood with a smooth satin finish.",
    specs: ["Material: Driftwood", "Finish: Satin wax", "Size: 40 cm"],
    gallery: ["images/product4.jpg"],
  },
  {
    image: "images/product6.jpg",
    name: "Rift Valley Beadwork",
    price: 2900,
    material: "bead",
    story: "Layered beadwork inspired by the colors of the Rift Valley.",
    specs: ["Material: Glass beads", "Finish: Handwoven", "Length: 42 cm"],
    gallery: ["images/product6.jpg"],
  },
  {
    image: "images/product7.jpg",
    name: "Tsavo Sunstone Pendant",
    price: 4700,
    material: "brass",
    story: "A warm-toned pendant that glows against minimal styling.",
    specs: ["Material: Brass", "Finish: Polished", "Length: 48 cm"],
    gallery: ["images/product7.jpg"],
  },
  {
    image: "images/kenya bracelete.jpg",
    name: "Kenya Bracelet",
    price: 300,
    material: "bead",
    story: "Everyday bead bracelet with bold Kenyan color accents.",
    specs: ["Material: Beads", "Finish: Hand-strung", "Size: Adjustable"],
    gallery: ["images/kenya bracelete.jpg"],
  },
];

const insights = window.SharonCraftInsights;
const grid = document.getElementById("product-grid");
const heroFeatured = document.getElementById("hero-featured");
const bestSellersSection = document.getElementById("best-sellers-section");
const bestSellersGrid = document.getElementById("best-sellers-grid");
const newThisWeekSection = document.getElementById("new-this-week-section");
const newThisWeekGrid = document.getElementById("new-this-week-grid");
let currencyFormatter = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" });

const searchInput = document.getElementById("search-input");
const materialFilter = document.getElementById("material-filter");
const deliveryFilter = document.getElementById("delivery-filter");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");
const sortSelect = document.getElementById("sort-by");
const clearFiltersBtn = document.getElementById("clear-filters");
const filterChips = document.getElementById("filter-chips");
const showMoreBtn = document.getElementById("show-more");
const viewButtons = document.querySelectorAll(".view-btn");
const categoryCta = document.getElementById("category-cta");
const categoryButtons = categoryCta ? categoryCta.querySelectorAll(".category-btn") : [];
const discoveryCards = document.querySelectorAll(".discovery-card");
const mobileBrowseCards = document.querySelectorAll(".mobile-browse-card");
const productFilters = document.getElementById("product-filters");
const shippingEstimator = document.getElementById("shipping-estimator");
const shopToolbar = document.getElementById("shop-toolbar");
const currencyToggle = document.getElementById("currency-toggle");
const currencyPanel = document.getElementById("currency-panel");
const currencyCode = document.getElementById("currency-code");
const currencySearch = document.getElementById("currency-search");
const currencySelect = document.getElementById("currency-select");
const currencyNote = document.getElementById("currency-note");

const modal = document.getElementById("product-modal");
const modalKicker = document.getElementById("modal-kicker");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalAvailability = document.getElementById("modal-availability");
const modalStory = document.getElementById("modal-story");
const modalSpecs = document.getElementById("modal-specs");
const modalMainImage = document.getElementById("modal-main-image");
const modalThumbs = document.getElementById("modal-thumbs");
const modalRelated = document.getElementById("modal-related");
const modalOrder = document.getElementById("modal-order");
const modalNotify = document.getElementById("modal-notify");
const quickView = document.getElementById("quick-view");
const quickViewMedia = quickView ? quickView.querySelector(".quick-view-media") : null;
const quickViewImage = document.getElementById("quick-view-image");
const quickViewThumbs = document.getElementById("quick-view-thumbs");
const quickViewKicker = document.getElementById("quick-view-kicker");
const quickViewTitle = document.getElementById("quick-view-title");
const quickViewPrice = document.getElementById("quick-view-price");
const quickViewAvailability = document.getElementById("quick-view-availability");
const quickViewStory = document.getElementById("quick-view-story");
const quickViewSpecs = document.getElementById("quick-view-specs");
const quickViewOrder = document.getElementById("quick-view-order");
const cartBar = document.getElementById("cart-bar");
const cartCount = document.getElementById("cart-count");
const cartClear = document.getElementById("cart-clear");
const cartOrder = document.getElementById("cart-order");
const recentSection = document.getElementById("recently-viewed");
const recentGrid = document.getElementById("recent-grid");
const shippingRegion = document.getElementById("shipping-region");
const shippingOutput = document.getElementById("shipping-output");
const wishlistToggle = document.getElementById("wishlist-toggle");
const wishlistPanel = document.getElementById("wishlist-panel");
const wishlistList = document.getElementById("wishlist-list");
const wishlistCount = document.getElementById("wishlist-count");
const wishlistClose = document.getElementById("wishlist-close");
const wishlistClear = document.getElementById("wishlist-clear");
const wishlistOrder = document.getElementById("wishlist-order");
const notifyModal = document.getElementById("notify-modal");
const notifyForm = document.getElementById("notify-form");
const notifyTitle = document.getElementById("notify-title");
const notifyName = document.getElementById("notify-name");
const notifyContact = document.getElementById("notify-contact");
const notifyPreference = document.getElementById("notify-preference");
const notifyStatus = document.getElementById("notify-status");

const normalizeText = (value) => String(value || "").trim();
const VIEW_STORAGE_KEY = "sharoncraft_view_mode";
const CART_STORAGE_KEY = "sharoncraft_cart_v1";
const RECENT_STORAGE_KEY = "sharoncraft_recent_v1";
const WISHLIST_STORAGE_KEY = "sharoncraft_wishlist_v1";
const SHIPPING_STORAGE_KEY = "sharoncraft_shipping_v1";
const BACK_IN_STOCK_STORAGE_KEY = "sharoncraft_back_in_stock_v1";
const ADMIN_DRAFT_KEY = "sharoncraft_admin_draft_v3";
const ADMIN_LEGACY_KEYS = ["sharoncraft_admin_draft_v2", "sharoncraft_admin_data"];
const ADMIN_DRAFT_KEYS = [ADMIN_DRAFT_KEY, ...ADMIN_LEGACY_KEYS];
const WA_NUMBER = "254112222572";
const CURRENCY_STORAGE_KEY = "sharoncraft_currency";
const CURRENCY_RATES_CACHE_KEY = "sharoncraft_currency_rates_v1";
const currencyConfig = window.CURRENCY_API || {};
const currencyApiKey = currencyConfig.apiKey || "";
const currencyApiBase = currencyConfig.base || "USD";
const currencyRateTtlMinutes = Number(currencyConfig.refreshMinutes) || 60;
const currencyProvider = currencyConfig.provider || "currencyapi";
const CHAT_STORAGE_KEY = "sharoncraft_chat_v1";
const SHIPPING_OPTIONS = {
  nairobi: { label: "Nairobi", fee: 200, eta: "Same day or 24-48 hrs" },
  kenya: { label: "Other Kenya Towns", fee: 350, eta: "2-4 days" },
  "east-africa": { label: "East Africa", fee: 1200, eta: "5-8 days" },
  international: { label: "International", fee: 3200, eta: "7-14 days" },
};

const normalizeProduct = (product) => {
  const image = normalizeText(product && product.image);
  const name = normalizeText(product && product.name);
  const price = Number(product && product.price);
  const specs = Array.isArray(product && product.specs)
    ? product.specs.map((item) => normalizeText(item)).filter(Boolean)
    : [];
  const gallery = Array.isArray(product && product.gallery)
    ? product.gallery.map((item) => normalizeText(item)).filter(Boolean)
    : [];
  return {
    id: insights ? insights.buildProductId(product) : `${name.toLowerCase()}-${image.toLowerCase()}`,
    image,
    name,
    price: Number.isFinite(price) ? price : 0,
    material: normalizeText(product && product.material) || "wood",
    story: normalizeText(product && product.story) || "Handmade by SharonCraft artisans.",
    specs: specs.length ? specs : ["Handmade - Limited Edition"],
    gallery: gallery.length ? gallery : (image ? [image] : []),
    soldOut: Boolean(product && product.soldOut),
    bestSeller: Boolean(product && product.bestSeller),
    spotlightUntil: normalizeText(product && product.spotlightUntil),
    spotlightText: normalizeText(product && product.spotlightText),
    updatedAt: normalizeText(product && product.updatedAt),
    newUntil: normalizeText(product && product.newUntil),
  };
};

let currencyRateState = {
  base: currencyApiBase,
  rates: {},
  updatedAt: "",
  fetchedAt: 0,
};

const parseRatesResponse = (payload) => {
  if (!payload || !payload.data) {
    return null;
  }
  const rates = {};
  Object.keys(payload.data).forEach((code) => {
    const entry = payload.data[code];
    const value = entry && typeof entry.value === "number" ? entry.value : Number(entry && entry.value);
    rates[code] = Number.isFinite(value) ? value : null;
  });
  return {
    base: payload.meta && payload.meta.base_currency ? payload.meta.base_currency : currencyApiBase,
    rates,
    updatedAt: payload.meta && payload.meta.last_updated_at ? payload.meta.last_updated_at : "",
    fetchedAt: Date.now(),
  };
};

const parseOpenErApiResponse = (payload) => {
  if (!payload || !payload.rates) {
    return null;
  }
  return {
    base: payload.base_code || currencyApiBase,
    rates: payload.rates,
    updatedAt: payload.time_last_update_utc || "",
    fetchedAt: Date.now(),
  };
};

const readCachedRates = () => {
  try {
    const raw = localStorage.getItem(CURRENCY_RATES_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed && parsed.rates) {
      return parsed;
    }
  } catch (error) {
    return null;
  }
  return null;
};

const writeCachedRates = (state) => {
  localStorage.setItem(CURRENCY_RATES_CACHE_KEY, JSON.stringify(state));
};

const fetchLiveRates = async () => {
  const wantsCurrencyApi = currencyProvider === "currencyapi" && currencyApiKey && !currencyApiKey.includes("YOUR_CURRENCY_API_KEY");
  if (wantsCurrencyApi) {
    const url = new URL("https://api.currencyapi.com/v3/latest");
    if (currencyApiBase) {
      url.searchParams.set("base_currency", currencyApiBase);
    }
    const response = await fetch(url.toString(), {
      headers: {
        apikey: currencyApiKey,
      },
    });
    if (!response.ok) {
      throw new Error("Rate request failed");
    }
    const payload = await response.json();
    return parseRatesResponse(payload);
  }

  const base = currencyApiBase || "USD";
  const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
  if (!response.ok) {
    throw new Error("Rate request failed");
  }
  const payload = await response.json();
  if (payload && payload.result && payload.result !== "success") {
    throw new Error("Rate response invalid");
  }
  return parseOpenErApiResponse(payload);
};

const ensureRates = async () => {
  const cached = readCachedRates();
  if (cached && cached.fetchedAt) {
    const ageMinutes = (Date.now() - cached.fetchedAt) / 60000;
    if (ageMinutes < currencyRateTtlMinutes) {
      currencyRateState = cached;
      return cached;
    }
  }
  try {
    const live = await fetchLiveRates();
    if (live) {
      currencyRateState = live;
      writeCachedRates(live);
      return live;
    }
  } catch (error) {
    console.warn("Live rates failed", error);
  }
  if (cached) {
    currencyRateState = cached;
    return cached;
  }
  return null;
};

const getRateFor = (code) => {
  if (!currencyRateState || !currencyRateState.rates) {
    return null;
  }
  return currencyRateState.rates[code] || null;
};

const convertFromKes = (value, targetCode) => {
  const amount = Number(value) || 0;
  const target = targetCode || "KES";
  if (target === "KES") {
    return amount;
  }
  const rateKes = currencyRateState.base === "KES" ? 1 : getRateFor("KES");
  const rateTarget = currencyRateState.base === target ? 1 : getRateFor(target);
  if (!rateKes || !rateTarget) {
    return amount;
  }
  return amount * (rateTarget / rateKes);
};

const formatCurrency = (value) => {
  const code = currencyCode ? currencyCode.textContent : "KES";
  const converted = convertFromKes(value, code);
  return currencyFormatter.format(converted);
};

const setCurrencyPanelOpen = (isOpen) => {
  if (!currencyToggle || !currencyPanel) {
    return;
  }
  currencyPanel.classList.toggle("is-open", isOpen);
  currencyPanel.setAttribute("aria-hidden", String(!isOpen));
  currencyToggle.setAttribute("aria-expanded", String(isOpen));
};

const getFallbackCurrencies = () => [
  "AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BRL","BSD","BTN","BWP","BYN","BZD","CAD","CDF","CHF","CLP","CNY","COP","CRC","CUP","CVE","CZK","DJF","DKK","DOP","DZD","EGP","ERN","ETB","EUR","FJD","FKP","GBP","GEL","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF","IDR","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY","KES","KGS","KHR","KMF","KPW","KRW","KWD","KYD","KZT","LAK","LBP","LKR","LRD","LSL","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRU","MUR","MVR","MWK","MXN","MYR","MZN","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SBD","SCR","SDG","SEK","SGD","SHP","SLE","SLL","SOS","SRD","SSP","STN","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","UYU","UZS","VES","VND","VUV","WST","XAF","XCD","XOF","XPF","YER","ZAR","ZMW","ZWL",
];

const buildCurrencyList = () => {
  const codes = typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("currency")
    : getFallbackCurrencies();
  const display = typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "currency" })
    : null;

  return codes.map((code) => {
    const name = display ? display.of(code) : code;
    return { code, label: `${code} - ${name}` };
  }).sort((a, b) => a.label.localeCompare(b.label));
};

const setCurrency = async (code) => {
  const nextCode = code || "KES";
  currencyFormatter = new Intl.NumberFormat(undefined, { style: "currency", currency: nextCode });
  localStorage.setItem(CURRENCY_STORAGE_KEY, nextCode);
  if (currencyCode) {
    currencyCode.textContent = nextCode;
  }
  await ensureRates();
  if (nextCode !== "KES") {
    const rateKes = currencyRateState.base === "KES" ? 1 : getRateFor("KES");
    const rateTarget = currencyRateState.base === nextCode ? 1 : getRateFor(nextCode);
    if (!rateKes || !rateTarget) {
      const fallback = "KES";
      currencyFormatter = new Intl.NumberFormat(undefined, { style: "currency", currency: fallback });
      localStorage.setItem(CURRENCY_STORAGE_KEY, fallback);
      if (currencyCode) {
        currencyCode.textContent = fallback;
      }
      if (currencyNote) {
        currencyNote.textContent = "Live rates unavailable. Showing KES.";
      }
    }
  }
  updateCartBar();
  updateShippingUI();
  updateWishlistUI();
  renderRecentItems();
  renderProducts(currentList, false, 0);
  if (modal && modal.classList.contains("is-open")) {
    const product = products.find((item) => item.id === modalOrder.dataset.productId);
    if (product) {
      modalPrice.textContent = formatCurrency(product.price);
      if (modalAvailability) {
        modalAvailability.textContent = getAvailabilityNote(product);
      }
    }
  }
  if (quickView && quickView.classList.contains("is-open")) {
    const product = products.find((item) => item.id === quickViewOrder.dataset.productId);
    if (product) {
      quickViewPrice.textContent = formatCurrency(product.price);
      quickViewAvailability.textContent = getAvailabilityNote(product);
    }
  }
};

const initCurrencyPicker = () => {
  if (!currencySelect || !currencyToggle || !currencyPanel) {
    return;
  }

  const list = buildCurrencyList();
  const fillOptions = (filter = "") => {
    const term = filter.trim().toLowerCase();
    currencySelect.innerHTML = "";
    list
      .filter((item) =>
        !term ||
        item.code.toLowerCase().includes(term) ||
        item.label.toLowerCase().includes(term),
      )
      .forEach((item) => {
        const option = document.createElement("option");
        option.value = item.code;
        option.textContent = item.label;
        currencySelect.appendChild(option);
      });
  };

  fillOptions();

  const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
  const initial = stored || "KES";
  setCurrency(initial);
  currencySelect.value = initial;

  if (currencyNote) {
    const hasCurrencyApiKey = currencyApiKey && !currencyApiKey.includes("YOUR_CURRENCY_API_KEY");
    if (currencyProvider === "currencyapi" && !hasCurrencyApiKey) {
      currencyNote.textContent = "Using public rates. Add API key for higher limits.";
    } else {
      currencyNote.textContent = "Live rates applied. Prices are estimates.";
    }
  }

  currencyToggle.addEventListener("click", () => {
    setCurrencyPanelOpen(!currencyPanel.classList.contains("is-open"));
  });

  document.addEventListener("click", (event) => {
    if (!currencyPanel.classList.contains("is-open")) {
      return;
    }
    if (currencyPanel.contains(event.target) || currencyToggle.contains(event.target)) {
      return;
    }
    setCurrencyPanelOpen(false);
  });

  currencySelect.addEventListener("change", () => {
    setCurrency(currencySelect.value);
  });

  if (currencySearch) {
    currencySearch.addEventListener("input", () => {
      fillOptions(currencySearch.value);
    });
  }
};

const setActiveMobileBrowseCard = (target) => {
  mobileBrowseCards.forEach((card) => {
    card.classList.toggle("is-active", card.dataset.mobileTarget === target);
  });
};

const focusWithoutScroll = (element) => {
  if (!element || typeof element.focus !== "function") {
    return;
  }
  window.setTimeout(() => {
    try {
      element.focus({ preventScroll: true });
    } catch (error) {
      element.focus();
    }
  }, 360);
};

const getMobileBrowseConfig = (target) => {
  if (target === "categories") {
    return {
      element: shopToolbar || categoryCta,
      focus: categoryButtons[0] || categoryCta,
    };
  }

  if (target === "filters") {
    return {
      element: productFilters,
      focus: searchInput,
    };
  }

  if (target === "delivery") {
    return {
      element: shippingEstimator,
      focus: shippingRegion,
    };
  }

  if (target === "currency") {
    return {
      element: shopToolbar || currencyToggle,
      focus: currencySearch || currencySelect || currencyToggle,
      openCurrency: true,
    };
  }

  return null;
};

const initMobileBrowseDeck = () => {
  if (!mobileBrowseCards.length) {
    return;
  }

  mobileBrowseCards.forEach((card) => {
    card.addEventListener("click", () => {
      const target = card.dataset.mobileTarget || "";
      const config = getMobileBrowseConfig(target);

      setActiveMobileBrowseCard(target);

      if (target !== "currency") {
        setCurrencyPanelOpen(false);
      }

      if (!config || !config.element) {
        return;
      }

      config.element.scrollIntoView({ behavior: "smooth", block: "start" });

      if (config.openCurrency) {
        window.setTimeout(() => {
          setCurrencyPanelOpen(true);
        }, 220);
      }

      focusWithoutScroll(config.focus);
    });
  });
};

const refreshCatalogFromAdminDraft = () => {
  products = loadLocalProducts();
  defaultOrderIds = products.map((product) => product.id);
  renderHeroFeatured(products);
  renderCuratedShelves(products);
  currentList = sortProducts(getActiveProducts());
  renderProducts(currentList, false, 0);
  renderRecentItems();
  updateCartBar();
  updateWishlistUI();
};

const sanitizeDraftProduct = (product) => {
  const image = normalizeText(product && product.image);
  const name = normalizeText(product && product.name);
  const price = Number(product && product.price);
  const specs = Array.isArray(product && product.specs)
    ? product.specs.map((item) => normalizeText(item)).filter(Boolean)
    : [];
  const gallery = Array.isArray(product && product.gallery)
    ? product.gallery.map((item) => normalizeText(item)).filter(Boolean)
    : [];
  return {
    id: normalizeText(product && product.id),
    image,
    name,
    price: Number.isFinite(price) ? price : 0,
    material: normalizeText(product && product.material) || "wood",
    story: normalizeText(product && product.story) || "Handmade by SharonCraft artisans.",
    specs: specs.length ? specs : ["Handmade - Limited Edition"],
    gallery: gallery.length ? gallery : (image ? [image] : []),
    soldOut: Boolean(product && product.soldOut),
    bestSeller: Boolean(product && product.bestSeller),
    notes: normalizeText(product && product.notes),
    spotlightUntil: normalizeText(product && product.spotlightUntil),
    spotlightText: normalizeText(product && product.spotlightText),
    updatedAt: normalizeText(product && product.updatedAt),
    newUntil: normalizeText(product && product.newUntil),
  };
};

const sanitizeDraftProducts = (products) =>
  Array.isArray(products)
    ? products.map(sanitizeDraftProduct).filter((product) => product.image && product.name)
    : [];

const getProductKey = (product) =>
  normalizeText(product.id) ||
  `${normalizeText(product.name).toLowerCase()}::${normalizeText(product.image).toLowerCase()}`;

const getCatalogSignature = (products) => JSON.stringify(sanitizeDraftProducts(products));

const mergeProducts = (baseProducts, draftProducts) => {
  const merged = sanitizeDraftProducts(baseProducts);
  const indexes = new Map();
  merged.forEach((product, index) => {
    indexes.set(getProductKey(product), index);
  });

  sanitizeDraftProducts(draftProducts).forEach((product) => {
    const key = getProductKey(product);
    const existingIndex = indexes.get(key);
    if (existingIndex === undefined) {
      indexes.set(key, merged.length);
      merged.push({ ...product, specs: [...product.specs], gallery: [...product.gallery] });
      return;
    }
    merged[existingIndex] = { ...product, specs: [...product.specs], gallery: [...product.gallery] };
  });

  return merged;
};

const readAdminDraft = () => {
  try {
    const raw = localStorage.getItem(ADMIN_DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products)) {
        return {
          baseSignature: typeof parsed.baseSignature === "string" ? parsed.baseSignature : "",
          products: parsed.products,
        };
      }
    }
  } catch (error) {
    console.warn("Unable to read admin draft", error);
  }

  for (const key of ADMIN_LEGACY_KEYS) {
    try {
      const legacyRaw = localStorage.getItem(key);
      if (!legacyRaw) {
        continue;
      }
      const parsed = JSON.parse(legacyRaw);
      if (Array.isArray(parsed)) {
        return { baseSignature: "", products: parsed };
      }
      if (parsed && Array.isArray(parsed.products)) {
        return {
          baseSignature: typeof parsed.baseSignature === "string" ? parsed.baseSignature : "",
          products: parsed.products,
        };
      }
    } catch (error) {
      console.warn("Unable to read legacy draft", error);
    }
  }

  return null;
};

const loadLocalProducts = () => {
  const baseProducts = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : defaultProducts;
  const draft = readAdminDraft();
  if (!draft || !draft.products || !draft.products.length) {
    return baseProducts.map(normalizeProduct);
  }
  const baseSignature = getCatalogSignature(baseProducts);
  const merged = draft.baseSignature && draft.baseSignature === baseSignature
    ? sanitizeDraftProducts(draft.products)
    : mergeProducts(baseProducts, draft.products);
  return merged.map(normalizeProduct);
};

let products = [];
let defaultOrderIds = [];
let cartItems = [];
let recentItems = [];
let wishlistItems = [];
let activeNotifyProduct = null;
let spotlightProductId = null;
let quickViewGallery = [];
let quickViewGalleryIndex = 0;
let quickViewTouchStartX = 0;
let quickViewTouchStartY = 0;
let isHandlingPopstate = false;

const sortProducts = (list) => {
  const sortValue = sortSelect ? sortSelect.value : "featured";
  const nextList = [...list];

  if (sortValue === "price-low") {
    nextList.sort((a, b) => a.price - b.price);
    return nextList;
  }
  if (sortValue === "price-high") {
    nextList.sort((a, b) => b.price - a.price);
    return nextList;
  }

  nextList.sort((a, b) => defaultOrderIds.indexOf(a.id) - defaultOrderIds.indexOf(b.id));
  return nextList;
};

const loadStoredList = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const saveStoredList = (key, list) => {
  localStorage.setItem(key, JSON.stringify(list));
};

const getShippingSelection = () => {
  if (!shippingRegion) {
    return null;
  }
  const value = shippingRegion.value || localStorage.getItem(SHIPPING_STORAGE_KEY) || "";
  if (!value || !SHIPPING_OPTIONS[value]) {
    return null;
  }
  return { key: value, ...SHIPPING_OPTIONS[value] };
};

const updateShippingUI = () => {
  if (!shippingRegion || !shippingOutput) {
    return;
  }
  const selection = getShippingSelection();
  if (!selection) {
    shippingOutput.textContent = "Select a region to preview delivery.";
    return;
  }
  shippingOutput.textContent = `Est. fee: ${formatCurrency(selection.fee)} • ETA: ${selection.eta}`;
};

const updateWishlistUI = () => {
  if (!wishlistCount || !wishlistList || !wishlistOrder) {
    return;
  }
  const items = wishlistItems
    .map((id) => getProductById(id))
    .filter(Boolean);
  const validIds = items.map((item) => item.id);
  if (validIds.length !== wishlistItems.length) {
    wishlistItems = validIds;
    saveStoredList(WISHLIST_STORAGE_KEY, wishlistItems);
  }
  wishlistCount.textContent = String(wishlistItems.length);
  wishlistList.innerHTML = "";
  if (!wishlistItems.length) {
    const empty = document.createElement("p");
    empty.className = "subtext small";
    empty.textContent = "No saved pieces yet. Tap the heart to save one.";
    wishlistList.appendChild(empty);
    wishlistOrder.href = "#";
    return;
  }
  items.forEach((product) => {
    const row = document.createElement("div");
    row.className = "wishlist-item";
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    const name = document.createElement("div");
    name.textContent = product.name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      wishlistItems = wishlistItems.filter((id) => id !== product.id);
      saveStoredList(WISHLIST_STORAGE_KEY, wishlistItems);
      const toggle = document.querySelector(`.wishlist-cta[data-wishlist-id="${product.id}"]`);
      if (toggle) {
        toggle.classList.remove("is-active");
        toggle.setAttribute("aria-pressed", "false");
        const icon = toggle.querySelector("i");
        if (icon) {
          icon.className = "fa-regular fa-heart";
        }
      }
      updateWishlistUI();
    });
    row.append(img, name, remove);
    wishlistList.appendChild(row);
  });

  const lines = items.map((product, index) => `${index + 1}. ${product.name} - ${formatCurrency(product.price)}`);
  const shipping = getShippingSelection();
  const shippingLine = shipping
    ? `Delivery estimate: ${formatCurrency(shipping.fee)} • ${shipping.eta}`
    : "Delivery estimate: [choose region]";
  const message = `Hello SharonCraft Atelier, I want to save and order these wishlist pieces:\n${lines.join("\n")}\n\n${shippingLine}\nDelivery area: [Nairobi / Outside Nairobi]\nName: [enter]\nPhone: [enter]\nPayment: [M-Pesa / Cash]\n\nPlease confirm availability and final delivery cost.`;
  wishlistOrder.href = buildWhatsAppLink(message);
};

const toggleWishlistItem = (product) => {
  const index = wishlistItems.indexOf(product.id);
  if (index >= 0) {
    wishlistItems.splice(index, 1);
  } else {
    wishlistItems.unshift(product.id);
  }
  wishlistItems = wishlistItems.slice(0, 12);
  saveStoredList(WISHLIST_STORAGE_KEY, wishlistItems);
  updateWishlistUI();
};

const getProductById = (id) => products.find((product) => product.id === id);

const updateCartBar = () => {
  if (!cartBar || !cartCount || !cartOrder) {
    return;
  }
  const count = cartItems.length;
  cartCount.textContent = count === 1 ? "1 item" : `${count} items`;
  cartBar.classList.toggle("is-hidden", count === 0);
  if (count === 0) {
    cartOrder.href = "#";
    return;
  }

  const total = cartItems.reduce((sum, id) => {
    const product = getProductById(id);
    return sum + (product ? product.price : 0);
  }, 0);
  const deliveryArea = deliveryFilter && deliveryFilter.value ? deliveryFilter.value : "[Nairobi / Outside Nairobi]";
  const shipping = getShippingSelection();
  const shippingLine = shipping
    ? `Delivery estimate: ${formatCurrency(shipping.fee)} • ${shipping.eta}`
    : "Delivery estimate: [choose region]";
  const lines = cartItems
    .map((id, index) => {
      const product = getProductById(id);
      if (!product) {
        return null;
      }
      return `${index + 1}. ${product.name} - ${formatCurrency(product.price)}`;
    })
    .filter(Boolean);
  const message = `Hello SharonCraft Atelier, I want to order these items:\n${lines.join("\n")}\n\nTotal: ${formatCurrency(total)} (estimate)\n${shippingLine}\nDelivery area: ${deliveryArea}\nExact location: [enter]\nPreferred delivery date/time: [enter]\nName: [enter]\nPhone: [enter]\nPayment: [M-Pesa / Cash]\n\nPlease confirm availability and total price (including delivery).`;
  cartOrder.href = buildWhatsAppLink(message);
};

const toggleCartItem = (product) => {
  const index = cartItems.indexOf(product.id);
  if (index >= 0) {
    cartItems.splice(index, 1);
  } else {
    cartItems.push(product.id);
  }
  saveStoredList(CART_STORAGE_KEY, cartItems);
  updateCartBar();
};

const renderRecentItems = () => {
  if (!recentSection || !recentGrid) {
    return;
  }
  const list = recentItems
    .map((id) => getProductById(id))
    .filter(Boolean);
  if (!list.length) {
    recentSection.classList.add("is-hidden");
    recentGrid.innerHTML = "";
    return;
  }

  recentSection.classList.remove("is-hidden");
  recentGrid.innerHTML = "";
  list.slice(0, 3).forEach((product) => {
    recentGrid.appendChild(createProductCard(product));
  });
};

const trackRecentView = (product) => {
  recentItems = recentItems.filter((id) => id !== product.id);
  recentItems.unshift(product.id);
  recentItems = recentItems.slice(0, 3);
  saveStoredList(RECENT_STORAGE_KEY, recentItems);
  renderRecentItems();
};

const openQuickView = (product) => {
  if (!quickView) {
    openModal(product);
    return;
  }
  const gallery = product.gallery && product.gallery.length ? product.gallery : [product.image];
  quickViewGallery = gallery;
  quickViewGalleryIndex = 0;
  const materialLabel = product.material
    ? `${product.material.charAt(0).toUpperCase()}${product.material.slice(1)} atelier piece`
    : "Kenyan atelier piece";
  quickViewImage.src = gallery[0];
  quickViewImage.alt = product.name;
  if (quickViewKicker) {
    quickViewKicker.textContent = materialLabel;
  }
  quickViewTitle.textContent = product.name;
  quickViewPrice.textContent = formatCurrency(product.price);
  quickViewAvailability.textContent = getAvailabilityNote(product);
  quickViewAvailability.className = `availability-note${product.soldOut ? " is-sold-out" : ""}${
    !product.soldOut && isNewArrival(product) ? " is-new" : ""
  }`;
  if (quickViewStory) {
    quickViewStory.textContent = product.story;
  }
  if (quickViewSpecs) {
    quickViewSpecs.innerHTML = "";
    product.specs.forEach((spec) => {
      const li = document.createElement("li");
      li.textContent = spec;
      quickViewSpecs.appendChild(li);
    });
  }
  renderGalleryThumbs(quickViewThumbs, gallery, product.name, (src) => {
    const nextIndex = quickViewGallery.indexOf(src);
    setQuickViewGalleryIndex(nextIndex >= 0 ? nextIndex : 0);
  });
  setQuickViewGalleryIndex(0);
  quickViewOrder.href = buildWhatsAppLink(createOrderMessage(product));
  quickViewOrder.dataset.productId = product.id;
  quickView.classList.add("is-open");
  quickView.setAttribute("aria-hidden", "false");
  if (!history.state || history.state.overlay !== "quick-view") {
    history.pushState({ overlay: "quick-view" }, "");
  }
  trackRecentView(product);
};

const closeQuickView = () => {
  if (!quickView) {
    return;
  }
  quickViewGallery = [];
  quickViewGalleryIndex = 0;
  quickView.classList.remove("is-open");
  quickView.setAttribute("aria-hidden", "true");
  if (!isHandlingPopstate && history.state && history.state.overlay === "quick-view") {
    history.back();
  }
};

const applyViewMode = (mode) => {
  if (!grid) {
    return;
  }

  const nextMode = mode === "one" ? "one" : "two";
  grid.classList.remove("is-one-column", "is-two-column");
  grid.classList.add(nextMode === "one" ? "is-one-column" : "is-two-column");
  viewButtons.forEach((btn) => {
    const isActive = btn.dataset.view === nextMode;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
  localStorage.setItem(VIEW_STORAGE_KEY, nextMode);
};

const updateCategoryButtons = (value) => {
  if (!categoryButtons.length) {
    return;
  }
  categoryButtons.forEach((btn) => {
    const isActive = btn.dataset.material === value;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
};

const setMaterialFilterValue = (value, shouldApply = true) => {
  materialFilter.value = value;
  filterChips.querySelectorAll(".chip").forEach((btn) => {
    if (btn.dataset.filter === "material") {
      btn.classList.toggle("active", btn.dataset.value === value);
    }
  });
  updateCategoryButtons(value);
  updateDiscoveryCards(value);
  if (shouldApply) {
    applyFilters();
  }
};

const setPriceFilterValue = (value) => {
  if (value === "under-3000") {
    minPriceInput.value = "";
    maxPriceInput.value = "3000";
  } else if (value === "3000-5000") {
    minPriceInput.value = "3000";
    maxPriceInput.value = "5000";
  }

  filterChips.querySelectorAll(".chip").forEach((btn) => {
    if (btn.dataset.filter === "price") {
      btn.classList.toggle("active", btn.dataset.value === value);
    }
  });
  applyFilters();
};

const createOrderMessage = (product) => {
  const deliveryArea = deliveryFilter && deliveryFilter.value ? deliveryFilter.value : "[Nairobi / Outside Nairobi]";
  const shipping = getShippingSelection();
  const shippingLine = shipping
    ? `- Delivery estimate: ${formatCurrency(shipping.fee)} • ${shipping.eta}`
    : "- Delivery estimate: [choose region]";
  if (product.soldOut) {
    return `Hello SharonCraft Atelier, I am interested in "${product.name}". I can see it is sold out, so please let me know if a similar piece or a custom version is available.`;
  }

  return `Hello SharonCraft Atelier, I want to order:\n- Product: ${product.name}\n- Price: ${formatCurrency(product.price)} (estimate)\n- Quantity: [enter]\n${shippingLine}\n- Delivery area: ${deliveryArea}\n- Exact location: [enter]\n- Preferred delivery date/time: [enter]\n- Name: [enter]\n- Phone: [enter]\n- Payment: [M-Pesa / Cash]\n\nPlease confirm availability and total price (including delivery).`;
};

const createNotifyMessage = (product) =>
  `Hello SharonCraft Atelier, please notify me when "${product.name}" is back in stock.`;

const openNotifyModal = (product) => {
  if (!notifyModal || !notifyTitle || !notifyForm) {
    return;
  }
  isHandlingPopstate = true;
  if (modal && modal.classList.contains("is-open")) {
    closeModal();
  }
  if (quickView && quickView.classList.contains("is-open")) {
    closeQuickView();
  }
  isHandlingPopstate = false;
  activeNotifyProduct = product;
  notifyTitle.textContent = `Get notified when "${product.name}" returns`;
  if (notifyStatus) {
    notifyStatus.textContent = "";
  }
  if (notifyName) {
    notifyName.value = "";
  }
  if (notifyContact) {
    notifyContact.value = "";
  }
  if (notifyPreference) {
    notifyPreference.value = "WhatsApp";
  }
  notifyModal.classList.add("is-open");
  notifyModal.setAttribute("aria-hidden", "false");
  if (!history.state || history.state.overlay !== "notify-modal") {
    history.pushState({ overlay: "notify-modal" }, "");
  }
};

const closeNotifyModal = () => {
  if (!notifyModal) {
    return;
  }
  notifyModal.classList.remove("is-open");
  notifyModal.setAttribute("aria-hidden", "true");
  activeNotifyProduct = null;
  if (!isHandlingPopstate && history.state && history.state.overlay === "notify-modal") {
    history.back();
  }
};

const buildWhatsAppLink = (message) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

const isNewArrival = (product) => {
  if (!product || !product.newUntil) {
    return false;
  }
  if (product.soldOut) {
    return false;
  }
  const end = Date.parse(product.newUntil);
  return Number.isFinite(end) ? Date.now() < end : false;
};

const isSpotlight = (product) => {
  if (!product || !product.spotlightUntil) {
    return false;
  }
  if (product.soldOut) {
    return false;
  }
  const end = Date.parse(product.spotlightUntil);
  return Number.isFinite(end) ? Date.now() < end : false;
};

const isBestSeller = (product) => Boolean(product && product.bestSeller);

const getFreshnessStamp = (product) => {
  if (!product) {
    return 0;
  }
  const updatedAt = Date.parse(product.updatedAt);
  if (Number.isFinite(updatedAt)) {
    return updatedAt;
  }
  const newUntil = Date.parse(product.newUntil);
  if (Number.isFinite(newUntil)) {
    return newUntil;
  }
  return 0;
};

const isNewThisWeek = (product) => {
  if (!product || product.soldOut) {
    return false;
  }
  if (isNewArrival(product)) {
    return true;
  }
  const freshness = getFreshnessStamp(product);
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return freshness >= weekAgo;
};

const getSpotlightProductId = (list) => {
  const match = list.find((product) => isSpotlight(product));
  return match ? match.id : null;
};

const getHeroFeaturedProducts = (list) => {
  const items = Array.isArray(list) ? [...list] : [];
  items.sort((a, b) => {
    const score = (product) => {
      if (isSpotlight(product)) return 3;
      if (isNewArrival(product)) return 2;
      if (!product.soldOut) return 1;
      return 0;
    };
    return score(b) - score(a);
  });
  return items.slice(0, 3);
};

const getBestSellerProducts = (list) => {
  const available = (Array.isArray(list) ? list : []).filter((product) => !product.soldOut);
  const tagged = available
    .filter((product) => isBestSeller(product))
    .sort((a, b) => b.price - a.price);
  const fallback = available
    .filter((product) => !isBestSeller(product))
    .sort((a, b) => {
      const score = (product) => {
        let value = 0;
        if (isSpotlight(product)) value += 60;
        if (isNewArrival(product)) value += 18;
        value += Math.min(product.price, 12000) / 100;
        value += Math.min((product.gallery || []).length, 4) * 3;
        return value;
      };
      return score(b) - score(a);
    });
  return [...tagged, ...fallback].slice(0, 3);
};

const getNewThisWeekProducts = (list) => {
  const available = (Array.isArray(list) ? list : []).filter((product) => !product.soldOut);
  const fresh = available
    .filter((product) => isNewThisWeek(product))
    .sort((a, b) => getFreshnessStamp(b) - getFreshnessStamp(a));
  if (fresh.length >= 3) {
    return fresh.slice(0, 3);
  }
  const usedIds = new Set(fresh.map((product) => product.id));
  const fallback = available
    .filter((product) => !usedIds.has(product.id))
    .sort((a, b) => getFreshnessStamp(b) - getFreshnessStamp(a) || b.price - a.price);
  return [...fresh, ...fallback].slice(0, 3);
};

const renderHeroFeatured = (list) => {
  if (!heroFeatured) {
    return;
  }

  heroFeatured.innerHTML = "";
  getHeroFeaturedProducts(list).forEach((product, index) => {
    const card = document.createElement("article");
    card.className = `hero-featured-card${index === 0 ? " is-large" : ""}`;
    card.style.animationDelay = `${index * 0.45}s`;

    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;

    const copy = document.createElement("div");
    copy.className = "hero-featured-copy";

    const label = document.createElement("span");
    label.className = "hero-featured-label";
    label.textContent = isSpotlight(product)
      ? "Spotlight"
      : (isNewArrival(product) ? "New Arrival" : "Featured");

    const title = document.createElement("strong");
    title.textContent = product.name;

    const meta = document.createElement("span");
    meta.textContent = formatCurrency(product.price);

    copy.append(label, title, meta);
    card.append(img, copy);
    card.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 720px)").matches) {
        openQuickView(product);
      } else {
        openModal(product);
      }
    });
    heroFeatured.appendChild(card);
    requestAnimationFrame(() => {
      card.style.transitionDelay = `${index * 110}ms`;
      card.classList.add("is-visible");
    });
  });
};

const renderCuratedShelf = (section, gridElement, items) => {
  if (!section || !gridElement) {
    return;
  }

  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!list.length) {
    section.classList.add("is-hidden");
    gridElement.innerHTML = "";
    return;
  }

  section.classList.remove("is-hidden");
  gridElement.innerHTML = "";
  list.forEach((product) => {
    const card = createProductCard(product);
    card.classList.add("curated-card");
    gridElement.appendChild(card);
  });
};

const renderCuratedShelves = (list) => {
  renderCuratedShelf(bestSellersSection, bestSellersGrid, getBestSellerProducts(list));
  renderCuratedShelf(newThisWeekSection, newThisWeekGrid, getNewThisWeekProducts(list));
};

const getAvailabilityLabel = (product) => {
  if (product.soldOut) {
    return "Sold Out";
  }
  return isNewArrival(product) ? "New Arrival" : "Available";
};

const getAvailabilityNote = (product) => {
  if (product.soldOut) {
    return "Sold out - ask us for a similar piece or custom remake.";
  }
  if (isNewArrival(product)) {
    return "New arrival - freshly added and ready to reserve.";
  }
  return "Available now - message SharonCraft to reserve it.";
};

const createTrackedOrderLink = (product, label, className = "") => {
  const link = document.createElement("a");
  link.href = buildWhatsAppLink(createOrderMessage(product));
  link.target = "_blank";
  link.rel = "noreferrer";
  link.className = `product-order-link${product.soldOut ? " sold-out-cta" : ""}${className ? ` ${className}` : ""}`;
  link.dataset.productId = product.id;
  link.textContent = label;

  link.addEventListener("click", () => {
    if (insights) {
      insights.recordWhatsAppClick(product);
    }
  });

  return link;
};

const createNotifyLink = (product) => {
  const link = document.createElement("button");
  link.className = "notify-link";
  link.type = "button";
  link.dataset.notify = product.id;
  link.textContent = "Notify me when back";
  return link;
};

const attachInteractiveTilt = (element, options = {}) => {
  if (!element) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (prefersReducedMotion || !finePointer) {
    return;
  }

  const {
    tilt = 6,
    shift = 8,
    glowTarget = element,
    tiltXVar = "--card-tilt-x",
    tiltYVar = "--card-tilt-y",
    glowXVar = "--card-glow-x",
    glowYVar = "--card-glow-y",
    shiftXVar = "--card-shift-x",
    shiftYVar = "--card-shift-y",
  } = options;

  const reset = () => {
    element.style.setProperty(tiltXVar, "0deg");
    element.style.setProperty(tiltYVar, "0deg");
    glowTarget.style.setProperty(glowXVar, "50%");
    glowTarget.style.setProperty(glowYVar, "50%");
    element.style.setProperty(shiftXVar, "0px");
    element.style.setProperty(shiftYVar, "0px");
  };

  element.addEventListener("pointermove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * tilt * 2;
    const rotateX = (0.5 - y) * tilt * 2;
    const shiftX = (x - 0.5) * shift * 2;
    const shiftY = (y - 0.5) * shift * 2;

    element.style.setProperty(tiltXVar, `${rotateX.toFixed(2)}deg`);
    element.style.setProperty(tiltYVar, `${rotateY.toFixed(2)}deg`);
    glowTarget.style.setProperty(glowXVar, `${(x * 100).toFixed(1)}%`);
    glowTarget.style.setProperty(glowYVar, `${(y * 100).toFixed(1)}%`);
    element.style.setProperty(shiftXVar, `${shiftX.toFixed(1)}px`);
    element.style.setProperty(shiftYVar, `${shiftY.toFixed(1)}px`);
  });

  element.addEventListener("pointerleave", reset);
  element.addEventListener("pointercancel", reset);
};

const createProductCard = (product) => {
  const isSpotlightCard = Boolean(spotlightProductId && product.id === spotlightProductId);
  const isNewCard = !product.soldOut && isNewArrival(product);
  const card = document.createElement("div");
  card.className = `product${product.soldOut ? " is-sold-out" : ""}${isSpotlightCard ? " is-spotlight-card" : ""}${isNewCard ? " is-new-card" : ""}`;
  card.tabIndex = 0;
  const materialLabel = product.material
    ? `${product.material.charAt(0).toUpperCase()}${product.material.slice(1)}`
    : "Kenyan";
  const storyExcerpt = String(product.story || "Handmade by SharonCraft artisans.")
    .replace(/\s+/g, " ")
    .trim();

  const media = document.createElement("div");
  media.className = "product-media";

  const img = document.createElement("img");
  img.src = product.image;
  img.alt = product.name;
  img.onerror = () => {
    card.remove();
  };

  media.appendChild(img);

  let spotlightLine = null;
  if (isSpotlightCard) {
    const ribbon = document.createElement("div");
    ribbon.className = "spotlight-ribbon";
    ribbon.innerHTML = "<span>Spotlight Drop</span>";
    media.appendChild(ribbon);

    spotlightLine = document.createElement("p");
    spotlightLine.className = "spotlight-line";
    spotlightLine.textContent = product.spotlightText || "Crafted under the Nairobi sun.";
  }

  const cartBtn = document.createElement("button");
  cartBtn.className = `cart-cta${cartItems.includes(product.id) ? " is-active" : ""}`;
  cartBtn.type = "button";
  cartBtn.setAttribute("aria-pressed", String(cartItems.includes(product.id)));
  cartBtn.setAttribute("aria-label", cartItems.includes(product.id) ? "Remove from cart" : "Add to cart");
  cartBtn.title = cartItems.includes(product.id) ? "Remove from cart" : "Add to cart";
  const cartIcon = document.createElement("i");
  cartIcon.className = cartItems.includes(product.id)
    ? "fa-solid fa-check"
    : "fa-solid fa-bag-shopping";
  cartBtn.appendChild(cartIcon);
  cartBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleCartItem(product);
    cartBtn.classList.toggle("is-active", cartItems.includes(product.id));
    cartBtn.setAttribute("aria-pressed", String(cartItems.includes(product.id)));
    cartBtn.setAttribute("aria-label", cartItems.includes(product.id) ? "Remove from cart" : "Add to cart");
    cartBtn.title = cartItems.includes(product.id) ? "Remove from cart" : "Add to cart";
    cartIcon.className = cartItems.includes(product.id)
      ? "fa-solid fa-check"
      : "fa-solid fa-bag-shopping";
  });

  const wishlistBtn = document.createElement("button");
  wishlistBtn.className = `wishlist-cta${wishlistItems.includes(product.id) ? " is-active" : ""}`;
  wishlistBtn.type = "button";
  wishlistBtn.dataset.wishlistId = product.id;
  wishlistBtn.setAttribute("aria-pressed", String(wishlistItems.includes(product.id)));
  wishlistBtn.setAttribute("aria-label", wishlistItems.includes(product.id) ? "Remove from wishlist" : "Save to wishlist");
  const wishlistIcon = document.createElement("i");
  wishlistIcon.className = wishlistItems.includes(product.id) ? "fa-solid fa-heart" : "fa-regular fa-heart";
  wishlistBtn.appendChild(wishlistIcon);
  wishlistBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleWishlistItem(product);
    wishlistBtn.classList.toggle("is-active", wishlistItems.includes(product.id));
    wishlistBtn.setAttribute("aria-pressed", String(wishlistItems.includes(product.id)));
    wishlistBtn.setAttribute("aria-label", wishlistItems.includes(product.id) ? "Remove from wishlist" : "Save to wishlist");
    wishlistIcon.className = wishlistItems.includes(product.id) ? "fa-solid fa-heart" : "fa-regular fa-heart";
  });

  if (product.soldOut) {
    const badge = document.createElement("span");
    badge.className = "sold-out-badge";
    badge.textContent = "Sold Out";

    const veil = document.createElement("div");
    veil.className = "sold-out-veil";
    veil.innerHTML = "<strong>Collected</strong><span>This piece is no longer available.</span>";

    media.append(badge, veil);
  }

  const title = document.createElement("h3");
  title.className = "product-title";
  title.textContent = product.name;

  const kicker = document.createElement("p");
  kicker.className = "product-kicker";
  kicker.textContent = `${materialLabel} atelier piece`;

  const meta = document.createElement("div");
  meta.className = "product-meta";

  const availability = document.createElement("span");
  const availabilityLabel = getAvailabilityLabel(product);
  availability.className = `availability-pill${product.soldOut ? " is-sold-out" : ""}${
    !product.soldOut && isNewArrival(product) ? " is-new" : ""
  }`;
  availability.textContent = availabilityLabel;

  const materialTag = document.createElement("span");
  materialTag.className = "material-tag";
  materialTag.textContent = product.material || "Material";

  meta.append(availability, materialTag);

  const story = document.createElement("p");
  story.className = "product-story";
  story.textContent = storyExcerpt.length > 110 ? `${storyExcerpt.slice(0, 107).trim()}...` : storyExcerpt;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = formatCurrency(product.price);

  const priceRow = document.createElement("div");
  priceRow.className = "price-row";
  priceRow.append(price, cartBtn);

  const offer = document.createElement("p");
  offer.className = `offer${product.soldOut ? " sold-out-text" : ""}`;
  offer.textContent = product.soldOut
    ? "Sold out - Ask for a similar piece"
    : (isNewArrival(product) ? "New arrival - Limited Edition" : "Handmade - Limited Edition");

  const detailBtn = document.createElement("button");
  detailBtn.className = "product-detail-btn";
  detailBtn.type = "button";
  detailBtn.textContent = "View Details";
  detailBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (window.matchMedia("(max-width: 720px)").matches) {
      openQuickView(product);
    } else {
      openModal(product);
    }
  });

  const link = createTrackedOrderLink(
    product,
    product.soldOut ? "Request Similar on WhatsApp" : "Order on WhatsApp",
  );
  const actions = document.createElement("div");
  actions.className = "product-actions";
  actions.append(detailBtn, link);

  const content = document.createElement("div");
  content.className = "product-content";

  media.append(wishlistBtn, cartBtn);
  content.append(kicker, title);
  if (spotlightLine) {
    content.append(spotlightLine);
  }
  content.append(meta, story, priceRow, offer, actions);

  card.append(media, content);

  if (product.soldOut) {
    content.append(createNotifyLink(product));
  }

  card.addEventListener("click", (event) => {
    if (
      event.target.closest("a") ||
      event.target.closest(".wishlist-cta") ||
      event.target.closest(".cart-cta") ||
      event.target.closest(".notify-link")
    ) {
      return;
    }
    if (window.matchMedia("(max-width: 720px)").matches) {
      openQuickView(product);
    } else {
      openModal(product);
    }
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      openModal(product);
    }
  });

  return card;
};

let visibleCount = 5;
let currentList = [];
let initialRevealDone = false;

const updateShowMoreButton = (hasMore) => {
  if (!showMoreBtn) {
    return;
  }
  const label = hasMore ? "Reveal More Pieces" : "Show Fewer Pieces";
  const icon = hasMore ? "▼" : "▲";
  showMoreBtn.innerHTML = `<span class="label">${label}</span><span class="icon" aria-hidden="true">${icon}</span>`;
  showMoreBtn.setAttribute("aria-label", label);
  showMoreBtn.classList.toggle("is-expanded", hasMore);
};

const appendProducts = (productsToRender, start, end, animate) => {
  productsToRender.slice(start, end).forEach((product, index) => {
    const card = createProductCard(product);
    if (animate) {
      card.classList.add("reveal");
      card.style.transitionDelay = `${index * 60}ms`;
    }
    grid.appendChild(card);
    if (animate) {
      requestAnimationFrame(() => {
        card.classList.add("reveal-in");
      });
    }
  });
};

const renderProducts = (productsToRender, animateNew = false, previousCount = 0) => {
  grid.innerHTML = "";
  spotlightProductId = getSpotlightProductId(productsToRender);
  const animateAll = !initialRevealDone;
  appendProducts(productsToRender, 0, visibleCount, animateAll || (animateNew && previousCount > 0));
  initialRevealDone = true;
  if (showMoreBtn) {
    const hasMore = productsToRender.length > visibleCount;
    showMoreBtn.style.display = productsToRender.length > 5 ? "inline-flex" : "none";
    showMoreBtn.setAttribute("aria-expanded", String(!hasMore));
    updateShowMoreButton(hasMore);
  }
};

const setChipState = (chip) => {
  const filter = chip.dataset.filter;
  const value = chip.dataset.value;

  if (filter === "material") {
    setMaterialFilterValue(value);
    return;
  }
  if (filter === "price") {
    setPriceFilterValue(value);
    return;
  }
};

const getActiveProducts = () => {
  const query = searchInput.value.trim().toLowerCase();
  const material = materialFilter.value;
  const minPrice = Number(minPriceInput.value) || 0;
  const maxPrice = Number(maxPriceInput.value) || Number.POSITIVE_INFINITY;

  return products.filter((product) => {
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.story.toLowerCase().includes(query);
    const matchesMaterial = !material || product.material === material;
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
    return matchesQuery && matchesMaterial && matchesPrice;
  });
};

const applyFilters = () => {
  const nextList = sortProducts(getActiveProducts());
  visibleCount = 5;
  currentList = nextList;
  renderProducts(nextList, false, 0);
};

const clearFilters = () => {
  searchInput.value = "";
  materialFilter.value = "";
  minPriceInput.value = "";
  maxPriceInput.value = "";
  if (sortSelect) {
    sortSelect.value = "featured";
  }
  filterChips.querySelectorAll(".chip").forEach((btn) => btn.classList.remove("active"));
  updateCategoryButtons("");
  updateDiscoveryCards("");
  applyFilters();
};

const updateDiscoveryCards = (material) => {
  discoveryCards.forEach((card) => {
    card.classList.toggle("is-active", card.dataset.discovery === material);
  });
};

const getRelatedProducts = (product) => {
  if (!product) {
    return [];
  }

  const sameMaterial = products.filter((item) => item.id !== product.id && item.material === product.material && !item.soldOut);
  const fallback = products.filter((item) => item.id !== product.id && !item.soldOut);
  return [...sameMaterial, ...fallback.filter((item) => item.material !== product.material)].slice(0, 3);
};

const renderGalleryThumbs = (container, gallery, productName, onSelect) => {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  if (!gallery || gallery.length <= 1) {
    return;
  }

  const updateActive = (src) => {
    Array.from(container.querySelectorAll(".thumb")).forEach((thumb) => {
      const isActive = thumb.dataset.src === src;
      thumb.classList.toggle("is-active", isActive);
      thumb.setAttribute("aria-pressed", String(isActive));
    });
  };

  gallery.forEach((src, index) => {
    const thumb = document.createElement("button");
    thumb.className = "thumb";
    thumb.type = "button";
    thumb.dataset.src = src;
    thumb.setAttribute("aria-label", `Show ${productName} image ${index + 1}`);
    thumb.setAttribute("aria-pressed", String(index === 0));

    const img = document.createElement("img");
    img.src = src;
    img.alt = productName;
    thumb.appendChild(img);

    thumb.addEventListener("click", () => {
      onSelect(src);
      updateActive(src);
    });

    container.appendChild(thumb);
  });

  updateActive(gallery[0]);
};

const setQuickViewGalleryIndex = (index) => {
  if (!quickViewGallery.length || !quickViewImage) {
    return;
  }

  const safeIndex = Math.max(0, Math.min(index, quickViewGallery.length - 1));
  quickViewGalleryIndex = safeIndex;
  const src = quickViewGallery[safeIndex];
  quickViewImage.src = src;

  Array.from((quickViewThumbs && quickViewThumbs.querySelectorAll(".thumb")) || []).forEach((thumb) => {
    const isActive = thumb.dataset.src === src;
    thumb.classList.toggle("is-active", isActive);
    thumb.setAttribute("aria-pressed", String(isActive));
  });
};

const renderModalRelated = (product) => {
  if (!modalRelated) {
    return;
  }

  modalRelated.innerHTML = "";
  getRelatedProducts(product).forEach((item) => {
    const button = document.createElement("button");
    button.className = "modal-related-card";
    button.type = "button";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;

    const copy = document.createElement("div");
    copy.className = "modal-related-copy";

    const title = document.createElement("strong");
    title.textContent = item.name;

    const meta = document.createElement("span");
    meta.textContent = formatCurrency(item.price);

    copy.append(title, meta);
    button.append(img, copy);
    button.addEventListener("click", () => openModal(item));
    modalRelated.appendChild(button);
  });
};

const openModal = (product) => {
  if (modalKicker) {
    const materialLabel = product.material
      ? `${product.material.charAt(0).toUpperCase()}${product.material.slice(1)} atelier piece`
      : "Kenyan atelier piece";
    modalKicker.textContent = materialLabel;
  }
  modalTitle.textContent = product.name;
  modalPrice.textContent = formatCurrency(product.price);
  modalStory.textContent = product.story;
  if (modalAvailability) {
    modalAvailability.textContent = getAvailabilityNote(product);
    modalAvailability.className = `availability-note${product.soldOut ? " is-sold-out" : ""}${
      !product.soldOut && isNewArrival(product) ? " is-new" : ""
    }`;
  }

  modalSpecs.innerHTML = "";
  product.specs.forEach((spec) => {
    const li = document.createElement("li");
    li.textContent = spec;
    modalSpecs.appendChild(li);
  });

  const gallery = product.gallery && product.gallery.length ? product.gallery : [product.image];
  modalMainImage.src = gallery[0];
  modalMainImage.alt = product.name;
  renderGalleryThumbs(modalThumbs, gallery, product.name, (src) => {
    modalMainImage.src = src;
  });

  renderModalRelated(product);
  modalOrder.href = buildWhatsAppLink(createOrderMessage(product));
  modalOrder.textContent = product.soldOut ? "Request Similar Piece" : "Order This Piece";
  modalOrder.dataset.productId = product.id;
  modalOrder.dataset.soldOut = String(product.soldOut);
  trackRecentView(product);

  if (modalNotify) {
    if (product.soldOut) {
      modalNotify.dataset.notify = product.id;
      modalNotify.classList.remove("is-hidden");
    } else {
      modalNotify.classList.add("is-hidden");
      modalNotify.removeAttribute("data-notify");
    }
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  if (!history.state || history.state.overlay !== "product-modal") {
    history.pushState({ overlay: "product-modal" }, "");
  }
};

const closeModal = () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  if (!isHandlingPopstate && history.state && history.state.overlay === "product-modal") {
    history.back();
  }
};

modal.addEventListener("click", (event) => {
  if (event.target.dataset.close === "true") {
    closeModal();
  }
});

modalOrder.addEventListener("click", () => {
  const product = products.find((item) => item.id === modalOrder.dataset.productId);
  if (product && insights) {
    insights.recordWhatsAppClick(product);
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    closeQuickView();
    closeNotifyModal();
  }
});

window.addEventListener("popstate", () => {
  if (notifyModal && notifyModal.classList.contains("is-open")) {
    isHandlingPopstate = true;
    closeNotifyModal();
    isHandlingPopstate = false;
    return;
  }
  if (quickView && quickView.classList.contains("is-open")) {
    isHandlingPopstate = true;
    closeQuickView();
    isHandlingPopstate = false;
    return;
  }
  if (modal && modal.classList.contains("is-open")) {
    isHandlingPopstate = true;
    closeModal();
    isHandlingPopstate = false;
  }
});

searchInput.addEventListener("input", applyFilters);
materialFilter.addEventListener("change", () => setMaterialFilterValue(materialFilter.value));
minPriceInput.addEventListener("input", applyFilters);
maxPriceInput.addEventListener("input", applyFilters);
if (sortSelect) {
  sortSelect.addEventListener("change", applyFilters);
}

if (quickViewOrder) {
  quickViewOrder.addEventListener("click", () => {
    const product = products.find((item) => item.id === quickViewOrder.dataset.productId);
    if (product && insights) {
      insights.recordWhatsAppClick(product);
    }
  });
}
if (deliveryFilter) {
  deliveryFilter.addEventListener("change", updateCartBar);
}
if (shippingRegion) {
  const savedShipping = localStorage.getItem(SHIPPING_STORAGE_KEY) || "";
  if (savedShipping) {
    shippingRegion.value = savedShipping;
  }
  updateShippingUI();
  shippingRegion.addEventListener("change", () => {
    localStorage.setItem(SHIPPING_STORAGE_KEY, shippingRegion.value);
    updateShippingUI();
    updateCartBar();
    updateWishlistUI();
  });
}
clearFiltersBtn.addEventListener("click", clearFilters);
filterChips.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) {
    return;
  }
  setChipState(chip);
  if (chip.dataset.filter !== "price" && chip.dataset.filter !== "material") {
    applyFilters();
  }
});

viewButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    applyViewMode(btn.dataset.view);
  });
});

categoryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setMaterialFilterValue(btn.dataset.material);
  });
});

discoveryCards.forEach((card) => {
  card.addEventListener("click", () => {
    const material = card.dataset.discovery || "";
    updateDiscoveryCards(material);
    setMaterialFilterValue(material);
    document.getElementById("products").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (wishlistToggle && wishlistPanel) {
  wishlistToggle.addEventListener("click", () => {
    const isOpen = wishlistPanel.classList.toggle("is-open");
    wishlistPanel.setAttribute("aria-hidden", String(!isOpen));
    wishlistToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (wishlistClose && wishlistPanel && wishlistToggle) {
  wishlistClose.addEventListener("click", () => {
    wishlistPanel.classList.remove("is-open");
    wishlistPanel.setAttribute("aria-hidden", "true");
    wishlistToggle.setAttribute("aria-expanded", "false");
  });
}

if (wishlistClear) {
  wishlistClear.addEventListener("click", () => {
    wishlistItems = [];
    saveStoredList(WISHLIST_STORAGE_KEY, wishlistItems);
    document.querySelectorAll(".wishlist-cta.is-active").forEach((btn) => {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-pressed", "false");
      const icon = btn.querySelector("i");
      if (icon) {
        icon.className = "fa-regular fa-heart";
      }
    });
    updateWishlistUI();
  });
}

if (notifyModal) {
  notifyModal.addEventListener("click", (event) => {
    if (event.target && event.target.dataset && event.target.dataset.notifyClose === "true") {
      closeNotifyModal();
    }
  });
}

if (notifyForm) {
  notifyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!activeNotifyProduct) {
      return;
    }
    const entry = {
      id: `restock-${Date.now()}`,
      productId: activeNotifyProduct.id,
      productName: activeNotifyProduct.name,
      name: notifyName ? notifyName.value.trim() : "",
      contact: notifyContact ? notifyContact.value.trim() : "",
      preference: notifyPreference ? notifyPreference.value : "WhatsApp",
      createdAt: new Date().toISOString(),
    };
    if (!entry.name || !entry.contact) {
      if (notifyStatus) {
        notifyStatus.textContent = "Please add a name and contact.";
      }
      return;
    }
    const list = loadStoredList(BACK_IN_STOCK_STORAGE_KEY);
    list.unshift(entry);
    saveStoredList(BACK_IN_STOCK_STORAGE_KEY, list);
    if (notifyStatus) {
      notifyStatus.textContent = "Saved. We will reach out when it returns.";
    }
    setTimeout(closeNotifyModal, 900);
  });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-notify]");
  if (!trigger) {
    return;
  }
  const id = trigger.dataset.notify;
  const product = products.find((item) => item.id === id);
  if (product) {
    openNotifyModal(product);
  }
});

if (showMoreBtn) {
  showMoreBtn.addEventListener("click", () => {
    const active = sortProducts(getActiveProducts());
    if (visibleCount < active.length) {
      const previousCount = visibleCount;
      visibleCount = Math.min(active.length, visibleCount + 5);
      currentList = active;
      grid.innerHTML = "";
      appendProducts(active, 0, previousCount, false);
      appendProducts(active, previousCount, visibleCount, true);
      if (showMoreBtn) {
        const hasMore = active.length > visibleCount;
        showMoreBtn.style.display = active.length > 5 ? "inline-flex" : "none";
        showMoreBtn.setAttribute("aria-expanded", String(!hasMore));
        updateShowMoreButton(hasMore);
      }
      return;
    }

    visibleCount = 5;
    currentList = active;
    renderProducts(active, false, 0);
  });
}

products = loadLocalProducts();
defaultOrderIds = products.map((product) => product.id);
currentList = products;
applyViewMode(localStorage.getItem(VIEW_STORAGE_KEY) || "two");
updateCategoryButtons(materialFilter.value || "");
updateDiscoveryCards(materialFilter.value || "");
cartItems = loadStoredList(CART_STORAGE_KEY);
recentItems = loadStoredList(RECENT_STORAGE_KEY);
wishlistItems = loadStoredList(WISHLIST_STORAGE_KEY);
updateCartBar();
renderRecentItems();
renderHeroFeatured(products);
renderCuratedShelves(products);
renderProducts(products, false, 0);
updateWishlistUI();
initCurrencyPicker();
initMobileBrowseDeck();

if (cartClear) {
  cartClear.addEventListener("click", () => {
    cartItems = [];
    saveStoredList(CART_STORAGE_KEY, cartItems);
    updateCartBar();
  });
}

if (cartOrder) {
  cartOrder.addEventListener("click", () => {
    if (!insights) {
      return;
    }
    cartItems.forEach((id) => {
      const product = getProductById(id);
      if (product) {
        insights.recordWhatsAppClick(product);
      }
    });
  });
}

if (quickView) {
  quickView.addEventListener("click", (event) => {
    if (event.target && event.target.dataset && event.target.dataset.quickClose === "true") {
      closeQuickView();
    }
  });
}

if (quickViewMedia) {
  quickViewMedia.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches && event.changedTouches[0];
    if (!touch) {
      return;
    }
    quickViewTouchStartX = touch.clientX;
    quickViewTouchStartY = touch.clientY;
  }, { passive: true });

  quickViewMedia.addEventListener("touchend", (event) => {
    if (!quickView.classList.contains("is-open") || quickViewGallery.length <= 1) {
      return;
    }

    const touch = event.changedTouches && event.changedTouches[0];
    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - quickViewTouchStartX;
    const deltaY = touch.clientY - quickViewTouchStartY;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      setQuickViewGalleryIndex(quickViewGalleryIndex + 1);
      return;
    }

    setQuickViewGalleryIndex(quickViewGalleryIndex - 1);
  }, { passive: true });
}

const initCountdown = () => {
  const daysEl = document.getElementById("countdown-days");
  const hoursEl = document.getElementById("countdown-hours");
  const minutesEl = document.getElementById("countdown-minutes");
  const secondsEl = document.getElementById("countdown-seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
    return;
  }

  const now = new Date();
  const target = new Date(now);
  const day = now.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  target.setDate(now.getDate() + daysUntilFriday);
  target.setHours(23, 59, 59, 0);

  const update = () => {
    const nowTick = new Date();
    const diff = Math.max(0, target - nowTick);

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");

    if (diff === 0) {
      initCountdown();
    }
  };

  update();
  setInterval(update, 1000);
};

initCountdown();

const initFlagCta = () => {
  const flagCta = document.getElementById("flag-cta");
  const quoteEl = flagCta ? flagCta.querySelector(".flag-quote") : null;
  const facts = [
    "Did you know? Kenya is home to over 40 ethnic communities, each with distinct craft traditions.",
    "Did you know? The Maasai are renowned for intricate beadwork that carries symbolic meaning.",
    "Did you know? Kenya's coastal artisans blend Swahili, Arab, and African design influences.",
    "Did you know? Basket weaving in Kenya often uses sisal and doum palm for strength and beauty.",
    "Did you know? Many Kenyan artisans pass skills through generations, preserving heritage in every piece.",
  ];

  let factIndex = 0;
  if (!flagCta) {
    return;
  }

  const setNextFact = () => {
    if (!quoteEl) {
      return;
    }
    quoteEl.textContent = facts[factIndex % facts.length];
    factIndex += 1;
  };

  setNextFact();
  setInterval(setNextFact, 7000);
  flagCta.addEventListener("click", () => {
    const isOpen = flagCta.classList.toggle("is-open");
    flagCta.setAttribute("aria-expanded", String(isOpen));
    setNextFact();
  });
};

initFlagCta();

const initFaq = () => {
  const items = Array.from(document.querySelectorAll(".faq-item"));
  if (!items.length) {
    return;
  }
  items.forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!button || !answer) {
      return;
    }
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      items.forEach((other) => {
        const otherButton = other.querySelector(".faq-question");
        const otherAnswer = other.querySelector(".faq-answer");
        if (otherButton && otherAnswer) {
          otherButton.setAttribute("aria-expanded", "false");
          otherAnswer.classList.remove("is-open");
          otherAnswer.setAttribute("aria-hidden", "true");
        }
      });
      button.setAttribute("aria-expanded", String(!isOpen));
      answer.classList.toggle("is-open", !isOpen);
      answer.setAttribute("aria-hidden", String(isOpen));
    });
  });
};

const initTestimonialSlider = () => {
  const slides = Array.from(document.querySelectorAll(".testimonial-slide"));
  const prevBtn = document.querySelector(".slider-btn.prev");
  const nextBtn = document.querySelector(".slider-btn.next");
  const track = document.querySelector(".testimonial-track");
  if (!slides.length || !track) {
    return;
  }
  let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (index < 0) {
    index = 0;
    slides[0].classList.add("is-active");
  }

  const show = (nextIndex) => {
    slides.forEach((slide, idx) => {
      slide.classList.toggle("is-active", idx === nextIndex);
    });
  };

  const step = (delta) => {
    index = (index + delta + slides.length) % slides.length;
    show(index);
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => step(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => step(1));
  }

  let timer = setInterval(() => step(1), 6500);

  track.addEventListener("mouseenter", () => {
    clearInterval(timer);
  });
  track.addEventListener("mouseleave", () => {
    timer = setInterval(() => step(1), 6500);
  });
};

initFaq();
initTestimonialSlider();

const initStoryStrip = () => {
  const strip = document.getElementById("story-strip");
  if (!strip) {
    return;
  }
  const slides = Array.from(strip.querySelectorAll(".story-slide"));
  const dots = Array.from(strip.querySelectorAll(".story-dot"));
  if (!slides.length) {
    return;
  }
  let index = 0;
  let timer = null;

  const setActive = (nextIndex) => {
    const safeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === safeIndex));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === safeIndex));
    index = safeIndex;
  };

  const start = () => {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(() => {
      setActive(index + 1);
    }, 4500);
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const next = Number(dot.dataset.slide) || 0;
      setActive(next);
      start();
    });
  });

  setActive(0);
  start();
};

const initCustomRequest = () => {
  const form = document.getElementById("custom-form");
  if (!form) {
    return;
  }
  const product = document.getElementById("custom-product");
  const name = document.getElementById("custom-name");
  const colors = document.getElementById("custom-colors");
  const size = document.getElementById("custom-size");
  const budget = document.getElementById("custom-budget");
  const delivery = document.getElementById("custom-delivery");
  const notes = document.getElementById("custom-notes");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = [
      "Hello SharonCraft Atelier, I want a custom piece:",
      `- Product idea: ${product && product.value ? product.value : "[enter]"}`,
      `- Name/initials: ${name && name.value ? name.value : "[enter]"}`,
      `- Colors: ${colors && colors.value ? colors.value : "[enter]"}`,
      `- Size: ${size && size.value ? size.value : "[enter]"}`,
      `- Budget (KES): ${budget && budget.value ? budget.value : "[enter]"}`,
      `- Delivery area: ${delivery && delivery.value ? delivery.value : "[enter]"}`,
      `- Extra details: ${notes && notes.value ? notes.value : "[enter]"}`,
    ].join("\n");

    const link = buildWhatsAppLink(message);
    window.open(link, "_blank", "noreferrer");
  });
};

const initScrollReveal = () => {
  const items = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!items.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  items.forEach((item) => {
    const delay = Number(item.dataset.delay || 0);
    if (delay) {
      item.style.transitionDelay = `${delay}ms`;
    }
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  });

  items.forEach((item) => observer.observe(item));
};

const initHeroCtaMotion = () => {
  const heroPrimaryCta = document.querySelector(".hero-primary-cta");
  if (!heroPrimaryCta) {
    return;
  }

  attachInteractiveTilt(heroPrimaryCta, {
    tilt: 7,
    shift: 0,
    tiltXVar: "--hero-tilt-x",
    tiltYVar: "--hero-tilt-y",
    glowXVar: "--hero-glow-x",
    glowYVar: "--hero-glow-y",
    shiftXVar: "--hero-shift-x",
    shiftYVar: "--hero-shift-y",
  });
};

initCustomRequest();
initStoryStrip();
initScrollReveal();
initHeroCtaMotion();

const initChatWidget = () => {
  const toggle = document.getElementById("chat-toggle");
  const panel = document.getElementById("chat-panel");
  const closeBtn = document.getElementById("chat-close");
  const feed = document.getElementById("chat-feed");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const badge = document.getElementById("chat-badge");
  if (!toggle || !panel || !feed || !form || !input) {
    return;
  }

  const readState = () => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) {
        return { messages: [] };
      }
      const parsed = JSON.parse(raw);
      return parsed && Array.isArray(parsed.messages) ? parsed : { messages: [] };
    } catch (error) {
      return { messages: [] };
    }
  };

  const writeState = (state) => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state));
  };

  const render = () => {
    const state = readState();
    feed.innerHTML = "";
    state.messages.forEach((message) => {
      const item = document.createElement("div");
      item.className = `chat-message ${message.sender}`;
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = message.text;
      const meta = document.createElement("div");
      meta.className = "chat-meta";
      meta.textContent = new Date(message.timestamp).toLocaleTimeString();
      item.append(bubble, meta);
      feed.appendChild(item);
    });
    feed.scrollTop = feed.scrollHeight;

    const unread = state.messages.filter((msg) => msg.sender === "admin" && !msg.readByClient).length;
    if (badge) {
      badge.textContent = unread > 9 ? "9+" : String(unread);
      badge.style.display = unread > 0 ? "inline-flex" : "none";
    }
  };

  const markRead = () => {
    const state = readState();
    state.messages.forEach((msg) => {
      if (msg.sender === "admin") {
        msg.readByClient = true;
      }
    });
    writeState(state);
    render();
  };

  const addMessage = (text, sender) => {
    const state = readState();
    state.messages.push({
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender,
      text,
      timestamp: new Date().toISOString(),
      readByClient: sender === "client",
      readByAdmin: sender === "admin" ? false : true,
    });
    writeState(state);
    render();
  };

  const open = () => {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    markRead();
    input.focus();
  };

  const close = () => {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    if (panel.classList.contains("is-open")) {
      close();
    } else {
      open();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => close());
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) {
      return;
    }
    addMessage(value, "client");
    input.value = "";
  });

  window.addEventListener("storage", (event) => {
    if (event.key === CHAT_STORAGE_KEY) {
      render();
    }
  });

  render();
};

window.addEventListener("storage", (event) => {
  if (event.key && ADMIN_DRAFT_KEYS.includes(event.key)) {
    refreshCatalogFromAdminDraft();
  }
});

window.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "sharoncraft-admin-draft-updated") {
    return;
  }
  refreshCatalogFromAdminDraft();
});

initChatWidget();
