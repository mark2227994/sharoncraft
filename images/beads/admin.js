const fallbackProducts = [
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
const DRAFT_STORAGE_KEY = "sharoncraft_admin_draft_v3";
const LEGACY_STORAGE_KEYS = ["sharoncraft_admin_draft_v2", "sharoncraft_admin_data"];
const NEW_ARRIVAL_DAYS = 7;
const EMPTY_PRODUCT = {
  id: "",
  image: "",
  name: "",
  price: 0,
  material: "wood",
  story: "",
  specs: [],
  gallery: [],
  soldOut: false,
  spotlightUntil: "",
  spotlightText: "",
  notes: "",
  updatedAt: "",
  newUntil: "",
};

const list = document.getElementById("product-list");
const addBtn = document.getElementById("add-product");
const saveBtn = document.getElementById("save-products");
const reloadBtn = document.getElementById("reload-products");
const clearBtn = document.getElementById("clear-products");
const previewGrid = document.getElementById("preview-grid");
const reloadStatus = document.getElementById("reload-status");
const saveDockIndicator = document.getElementById("save-dock-indicator");
const saveDockMeta = document.getElementById("save-dock-meta");
const deviceButtons = document.querySelectorAll(".device-btn");
const deviceFrame = document.getElementById("device-frame");
const previewPhoneFrame = document.getElementById("preview-phone-frame");
const deviceToggle = document.getElementById("device-toggle");
const deviceContent = document.getElementById("device-content");
const deviceShell = document.getElementById("device-shell");
const saveIndicator = document.getElementById("save-indicator");
const workspaceTabButtons = document.querySelectorAll("[data-tab]");
const workspacePanels = document.querySelectorAll("[data-panel]");
const workspaceTabLinks = document.querySelectorAll("[data-tab-link]");
const productSearchInput = document.getElementById("product-search");
const helpToggle = document.getElementById("help-toggle");
const helpContent = document.getElementById("help-content");
const resetDashboardBtn = document.getElementById("reset-dashboard");
const bulkValue = document.getElementById("bulk-value");
const bulkType = document.getElementById("bulk-type");
const bulkApply = document.getElementById("bulk-apply");
const bulkMaterial = document.getElementById("bulk-material");
const bulkSoldOut = document.getElementById("bulk-soldout");
const bulkApplyMeta = document.getElementById("bulk-apply-meta");
const analyticsList = document.getElementById("analytics-list");
const metricRevenue = document.getElementById("metric-revenue");
const metricUnitsSold = document.getElementById("metric-units-sold");
const metricWhatsappClicks = document.getElementById("metric-whatsapp-clicks");
const metricSoldOut = document.getElementById("metric-sold-out");
const barChart = document.getElementById("bar-chart");
const chartButtons = document.querySelectorAll(".chart-btn");
const chartSubtitle = document.getElementById("chart-subtitle");
const quickActionButtons = document.querySelectorAll("[data-action]");
const shareTitleInput = document.getElementById("share-title");
const shareSubtitleInput = document.getElementById("share-subtitle");
const shareLinkInput = document.getElementById("share-link");
const shareImageInput = document.getElementById("share-image-url");
const shareFileInput = document.getElementById("share-file");
const sharePickBtn = document.getElementById("share-pick");
const sharePreview = document.getElementById("share-preview");
const shareDownloadBtn = document.getElementById("share-download");
const shareCopyBtn = document.getElementById("share-copy");
const quickNameInput = document.getElementById("quick-product-name");
const quickImageInput = document.getElementById("quick-product-image");
const quickPriceInput = document.getElementById("quick-product-price");
const quickImagePickBtn = document.getElementById("quick-image-pick");
const quickImageFile = document.getElementById("quick-image-file");
const quickAddBtn = document.getElementById("quick-add-product");
const formatter = new Intl.NumberFormat("en-KE");
const CHAT_STORAGE_KEY = "sharoncraft_chat_v1";
const BACK_IN_STOCK_STORAGE_KEY = "sharoncraft_back_in_stock_v1";
const chatAdminFeed = document.getElementById("chat-admin-feed");
const chatAdminForm = document.getElementById("chat-admin-form");
const chatAdminInput = document.getElementById("chat-admin-input");
const restockList = document.getElementById("restock-list");
const restockClear = document.getElementById("restock-clear");
let chartMetric = "whatsappClicks";
const TREND_STORAGE_KEY = "sharoncraft_chart_baseline_v1";
const WORKSPACE_TAB_STORAGE_KEY = "sharoncraft_admin_tab_v1";
const LAST_SAVED_STORAGE_KEY = "sharoncraft_admin_last_saved_v1";

const normalizeText = (value) => String(value || "").trim();

const createUniqueProductId = () =>
  `product-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const buildMetricsSnapshot = (products) => {
  const metrics = {};
  products.forEach((product) => {
    const stats = insights ? insights.getProductMetrics(product.id) : {
      whatsappClicks: 0,
      unitsSold: 0,
      revenue: 0,
    };
    metrics[product.id] = {
      whatsappClicks: Number(stats.whatsappClicks) || 0,
      unitsSold: Number(stats.unitsSold) || 0,
      revenue: Number(stats.revenue) || 0,
    };
  });
  return {
    updatedAt: new Date().toISOString(),
    metrics,
  };
};

const readTrendBaseline = () => {
  try {
    const raw = localStorage.getItem(TREND_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
};

const saveTrendBaseline = (products) => {
  const snapshot = buildMetricsSnapshot(products);
  localStorage.setItem(TREND_STORAGE_KEY, JSON.stringify(snapshot));
};

const sanitizeProduct = (product) => {
  const image = normalizeText(product?.image);
  const name = normalizeText(product?.name);
  const priceValue = Number(product?.price);
  const specs = Array.isArray(product?.specs)
    ? product.specs.map((item) => normalizeText(item)).filter(Boolean)
    : [];
  const gallery = Array.isArray(product?.gallery)
    ? product.gallery.map((item) => normalizeText(item)).filter(Boolean)
    : [];
  const soldOut = Boolean(product?.soldOut);
  const spotlightUntil = normalizeText(product?.spotlightUntil);
  const spotlightText = normalizeText(product?.spotlightText);

  return {
    id: insights ? insights.buildProductId({ ...product, name, image }) : (normalizeText(product?.id) || createUniqueProductId()),
    image,
    name,
    price: Number.isFinite(priceValue) ? priceValue : 0,
    material: normalizeText(product?.material) || "wood",
    story: normalizeText(product?.story) || "Handmade by SharonCraft artisans.",
    specs: specs.length ? specs : ["Handmade - Limited Edition"],
    gallery: gallery.length ? gallery : (image ? [image] : []),
    soldOut,
    spotlightUntil,
    spotlightText,
    notes: normalizeText(product?.notes),
    updatedAt: normalizeText(product?.updatedAt),
    newUntil: normalizeText(product?.newUntil),
  };
};

const sanitizeProducts = (products) => {
  if (!Array.isArray(products)) {
    return [];
  }

  return products
    .map(sanitizeProduct)
    .filter((product) => product.image && product.name);
};

const looksLikeImagePath = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) {
    return false;
  }

  return (
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:") ||
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.includes("/") ||
    /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(normalized)
  );
};

const looksLikeCorruptedDraftProduct = (product) => {
  const imageValue = normalizeText(product?.image);
  const nameValue = normalizeText(product?.name);
  const numericName = nameValue && !Number.isNaN(Number(nameValue));
  const zeroPrice = Number(product?.price) === 0;
  return Boolean(imageValue) && !looksLikeImagePath(imageValue) && (numericName || zeroPrice);
};

const cloneProducts = (products) =>
  products.map((product) => ({
    id: product.id,
    image: product.image,
    name: product.name,
    price: product.price,
    material: product.material,
    story: product.story,
    specs: [...product.specs],
    gallery: [...product.gallery],
    soldOut: Boolean(product.soldOut),
    spotlightUntil: product.spotlightUntil || "",
    spotlightText: product.spotlightText || "",
    notes: product.notes || "",
    updatedAt: product.updatedAt || "",
    newUntil: product.newUntil || "",
  }));

const getProductKey = (product) => normalizeText(product.id) || `${normalizeText(product.name).toLowerCase()}::${normalizeText(product.image).toLowerCase()}`;

const getCatalogSignature = (products) => JSON.stringify(sanitizeProducts(products));

const setStatus = (message, tone = "") => {
  if (!reloadStatus) {
    return;
  }

  reloadStatus.textContent = message;
  reloadStatus.className = `status-pill${tone ? ` ${tone}` : ""}`;
};

const setWorkspaceTab = (tabId) => {
  const nextTab = normalizeText(tabId) || "catalog";
  workspaceTabButtons.forEach((button) => {
    const isActive = button.dataset.tab === nextTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  workspacePanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === nextTab);
  });
  localStorage.setItem(WORKSPACE_TAB_STORAGE_KEY, nextTab);
};

const updateLastSavedMeta = (iso) => {
  if (!saveDockMeta) {
    return;
  }

  if (!iso) {
    saveDockMeta.textContent = "Not saved in this session yet.";
    return;
  }

  saveDockMeta.textContent = `Last saved ${formatUpdatedAt(iso)}`;
};

const markLastSaved = (iso) => {
  const timestamp = normalizeText(iso) || new Date().toISOString();
  localStorage.setItem(LAST_SAVED_STORAGE_KEY, timestamp);
  updateLastSavedMeta(timestamp);
};


const formatUpdatedAt = (iso) => {
  if (!iso) {
    return "Not updated yet";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Not updated yet";
  }
  return date.toLocaleString();
};

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

const markRowUpdated = (row, iso) => {
  const timestamp = iso || new Date().toISOString();
  row.dataset.updatedAt = timestamp;
  const label = row.querySelector("[data-updated-label]");
  if (label) {
    label.textContent = `Last updated: ${formatUpdatedAt(timestamp)}`;
  }
};

const readStoredDraft = () => {
  const nextRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (nextRaw) {
    try {
      const parsed = JSON.parse(nextRaw);
      if (parsed && Array.isArray(parsed.products)) {
        return {
          baseSignature: typeof parsed.baseSignature === "string" ? parsed.baseSignature : "",
          products: sanitizeProducts(parsed.products),
        };
      }
    } catch (error) {
      console.warn("Unable to read admin draft", error);
    }
  }

  for (const key of LEGACY_STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return {
          baseSignature: "",
          products: sanitizeProducts(parsed),
        };
      }

      if (parsed && Array.isArray(parsed.products)) {
        return {
          baseSignature: typeof parsed.baseSignature === "string" ? parsed.baseSignature : "",
          products: sanitizeProducts(parsed.products),
        };
      }
    } catch (error) {
      console.warn("Unable to read legacy admin draft", error);
    }
  }

  return null;
};

const clearStoredDraft = () => {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

const getLocalCatalogProducts = () =>
  sanitizeProducts(Array.isArray(window.PRODUCTS) && window.PRODUCTS.length ? window.PRODUCTS : fallbackProducts);

let savedCatalogProducts = getLocalCatalogProducts();
let savedCatalogSignature = getCatalogSignature(savedCatalogProducts);

const getStorefrontPreviewSrc = () => `index.html?admin-preview=${Date.now()}`;

const getStorefrontPreviewFrames = () => [deviceFrame, previewPhoneFrame].filter(Boolean);

const reloadStorefrontPreviews = () => {
  const nextSrc = getStorefrontPreviewSrc();
  getStorefrontPreviewFrames().forEach((frame) => {
    frame.src = nextSrc;
  });
};

const syncDevicePreview = () => {
  const frames = getStorefrontPreviewFrames().filter((frame) => frame.contentWindow);
  if (!frames.length) {
    return;
  }
  const targetOrigin = window.location.origin === "null" ? "*" : window.location.origin;
  frames.forEach((frame) => {
    frame.contentWindow.postMessage({ type: "sharoncraft-admin-draft-updated" }, targetOrigin);
  });
};

const storeDraft = (products) => {
  localStorage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify({
      version: 3,
      baseSignature: savedCatalogSignature,
      products: sanitizeProducts(products),
    }),
  );
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  syncDevicePreview();
};

const mergeProducts = (baseProducts, draftProducts) => {
  const merged = cloneProducts(baseProducts);
  const indexes = new Map();

  merged.forEach((product, index) => {
    indexes.set(getProductKey(product), index);
  });

  draftProducts.forEach((product) => {
    const key = getProductKey(product);
    const existingIndex = indexes.get(key);
    if (existingIndex === undefined) {
      indexes.set(key, merged.length);
      merged.push({
        ...product,
        specs: [...product.specs],
        gallery: [...product.gallery],
      });
      return;
    }

    merged[existingIndex] = {
      ...product,
      specs: [...product.specs],
      gallery: [...product.gallery],
    };
  });

  return merged;
};

const getInitialProducts = () => {
  const storedDraft = readStoredDraft();
  if (!storedDraft) {
    clearStoredDraft();
    setStatus("Loaded saved catalog", "ok");
    return cloneProducts(savedCatalogProducts);
  }

  const draftProducts = storedDraft.products || [];
  const corruptedDraftCount = draftProducts.filter(looksLikeCorruptedDraftProduct).length;
  if (draftProducts.length && corruptedDraftCount >= Math.ceil(draftProducts.length / 2)) {
    clearStoredDraft();
    setStatus("Reset incompatible draft from saved catalog", "ok");
    return cloneProducts(savedCatalogProducts);
  }

  const draftAllSoldOut = draftProducts.length > 0 && draftProducts.every((product) => product.soldOut);
  const catalogAllSoldOut = savedCatalogProducts.length > 0 && savedCatalogProducts.every((product) => product.soldOut);

  if (draftAllSoldOut && !catalogAllSoldOut) {
    const resetProducts = cloneProducts(savedCatalogProducts);
    storeDraft(resetProducts);
    setStatus("Reset sold-out draft from catalog", "ok");
    return resetProducts;
  }

  if (storedDraft.baseSignature && storedDraft.baseSignature === savedCatalogSignature) {
    setStatus("Restored draft", "ok");
    return cloneProducts(storedDraft.products);
  }

  const mergedProducts = mergeProducts(savedCatalogProducts, storedDraft.products);
  storeDraft(mergedProducts);
  setStatus("Merged draft with saved catalog", "ok");
  return mergedProducts;
};

const createSelect = (value, options) => {
  const select = document.createElement("select");
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    if (option.value === value) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
  return select;
};

const setDirty = (isDirty) => {
  if (saveIndicator) {
    saveIndicator.classList.toggle("is-dirty", isDirty);
    saveIndicator.textContent = isDirty ? "Unsaved changes" : "All changes saved";
  }
  if (saveDockIndicator) {
    saveDockIndicator.classList.toggle("is-dirty", isDirty);
    saveDockIndicator.textContent = isDirty ? "Unsaved changes" : "All changes saved";
  }
};

const setDevicePreset = (device, width, height) => {
  if (!deviceFrame) {
    return;
  }

  const deviceName = normalizeText(device) || "iphone-14";
  const nextWidth = Number(width) || 390;
  const nextHeight = Number(height) || 844;

  deviceButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.device === deviceName);
  });

  if (deviceShell) {
    deviceShell.className = `phone-shell ${deviceName}`;
  }

  deviceFrame.style.width = `${nextWidth}px`;
  deviceFrame.style.height = `${nextHeight}px`;
  reloadStorefrontPreviews();
};

const escapeXml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildShareSvg = ({ title, subtitle, link, image }) => {
  const safeTitle = escapeXml(title || "SharonCraft Atelier");
  const safeSubtitle = escapeXml(subtitle || "Handmade Kenyan artifacts");
  const safeLink = escapeXml(link || "sharoncraft.ke");
  const safeImage = escapeXml(image || "images/product1.jpg");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141110"/>
      <stop offset="55%" stop-color="#1b1714"/>
      <stop offset="100%" stop-color="#2a1d0d"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.2" cy="0.1" r="0.8">
      <stop offset="0%" stop-color="#f0b44c" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="photoClip">
      <rect x="120" y="170" width="840" height="520" rx="38" />
    </clipPath>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <rect width="1080" height="1080" fill="url(#glow)"/>
  <circle cx="880" cy="140" r="120" fill="#f0b44c" opacity="0.08"/>
  <circle cx="170" cy="920" r="140" fill="#f0b44c" opacity="0.08"/>
  <rect x="96" y="140" width="888" height="580" rx="44" fill="#0f0d0b" stroke="#f0b44c" stroke-opacity="0.3" stroke-width="2"/>
  <image href="${safeImage}" x="120" y="170" width="840" height="520" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>
  <rect x="120" y="670" width="840" height="200" rx="28" fill="#191613" opacity="0.9"/>
  <text x="160" y="740" fill="#f6f1ea" font-family="Space Grotesk, Arial, sans-serif" font-size="54" font-weight="700">${safeTitle}</text>
  <text x="160" y="800" fill="#b9b1a7" font-family="Archivo, Arial, sans-serif" font-size="30">${safeSubtitle}</text>
  <rect x="160" y="828" width="540" height="56" rx="28" fill="#f0b44c"/>
  <text x="190" y="864" fill="#1a1208" font-family="Archivo, Arial, sans-serif" font-size="26" font-weight="700">${safeLink}</text>
  <text x="760" y="862" fill="#f6f1ea" font-family="Archivo, Arial, sans-serif" font-size="24" font-weight="600">Tap to Order</text>
  <circle cx="940" cy="860" r="26" fill="#f0b44c"/>
  <text x="930" y="870" fill="#1a1208" font-family="Arial, sans-serif" font-size="24" font-weight="700">+</text>
</svg>
  `.trim();
};

const updateSharePreview = () => {
  if (!sharePreview) {
    return;
  }
  const svg = buildShareSvg({
    title: shareTitleInput ? shareTitleInput.value.trim() : "",
    subtitle: shareSubtitleInput ? shareSubtitleInput.value.trim() : "",
    link: shareLinkInput ? shareLinkInput.value.trim() : "",
    image: shareImageInput ? shareImageInput.value.trim() : "",
  });
  const encoded = encodeURIComponent(svg);
  sharePreview.src = `data:image/svg+xml;charset=utf-8,${encoded}`;
  sharePreview.dataset.svg = svg;
};

const downloadShareCard = () => {
  if (!sharePreview || !sharePreview.dataset.svg) {
    return;
  }
  const blob = new Blob([sharePreview.dataset.svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sharoncraft-social-card.svg";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const copyShareLink = async () => {
  if (!shareLinkInput) {
    return;
  }
  const value = shareLinkInput.value.trim();
  if (!value) {
    setStatus("Add a share link first", "err");
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    setStatus("Share link copied", "ok");
  } catch (error) {
    shareLinkInput.select();
    document.execCommand("copy");
    setStatus("Share link copied", "ok");
  }
};

const resetDashboard = () => {
  if (!confirm("Reset dashboard metrics only? This keeps sold-out and stock quantities unchanged.")) {
    return;
  }

  if (insights) {
    insights.writeMetricsState({
      global: {
        whatsappClicks: 0,
        unitsSold: 0,
        revenue: 0,
        lastInterestAt: "",
        lastPurchaseAt: "",
      },
      products: {},
    });
  }

  renderDashboard();
  updateRowAnalytics();
  setStatus("Reset dashboard totals", "ok");
};

const addNewProduct = (prefill = {}) => {
  const { name = "", image = "", previewUrl = "", price = 0 } = prefill;
  const newUntil = new Date(Date.now() + NEW_ARRIVAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const products = collectProducts();
  products.unshift({
    ...EMPTY_PRODUCT,
    id: createUniqueProductId(),
    name,
    image,
    price,
    specs: [],
    gallery: image ? [image] : [],
    newUntil,
  });
  render(products);
  storeDraft(products);
  setStatus("Draft updated", "ok");
  setDirty(true);

  const newRow = list.querySelector(".product-row");
  if (newRow) {
    newRow.classList.add("is-new");
    newRow.dataset.newUntil = newUntil;
    newRow.scrollIntoView({ behavior: "smooth", block: "start" });
    const imageInput = newRow.querySelector(".image-path-input");
    if (imageInput && previewUrl) {
      imageInput.dataset.preview = previewUrl;
      const imageStatus = newRow.querySelector(".image-status");
      if (imageStatus) {
        imageStatus.textContent = "Picked";
        imageStatus.className = "image-status ok";
      }
      const thumb = newRow.querySelector(".row-thumb");
      if (thumb) {
        thumb.src = previewUrl;
      }
    }
    const focusTarget =
      newRow.querySelector(".product-name-input") ||
      imageInput ||
      newRow.querySelector("input, textarea, select");
    if (focusTarget && typeof focusTarget.focus === "function") {
      focusTarget.focus({ preventScroll: true });
    }
    setTimeout(() => {
      newRow.classList.remove("is-new");
    }, 1600);
  }
};

const initAdminChat = () => {
  if (!chatAdminFeed || !chatAdminForm || !chatAdminInput) {
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
    chatAdminFeed.innerHTML = "";
    state.messages.forEach((message) => {
      const item = document.createElement("div");
      item.className = `chat-admin-message ${message.sender}`;
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = message.text;
      const meta = document.createElement("div");
      meta.className = "chat-admin-meta";
      meta.textContent = new Date(message.timestamp).toLocaleTimeString();
      item.append(bubble, meta);
      chatAdminFeed.appendChild(item);
    });
    chatAdminFeed.scrollTop = chatAdminFeed.scrollHeight;
  };

  const markRead = () => {
    const state = readState();
    state.messages.forEach((msg) => {
      if (msg.sender === "client") {
        msg.readByAdmin = true;
      }
    });
    writeState(state);
  };

  const addMessage = (text) => {
    const state = readState();
    state.messages.push({
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: "admin",
      text,
      timestamp: new Date().toISOString(),
      readByAdmin: true,
      readByClient: false,
    });
    writeState(state);
    render();
  };

  chatAdminForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = chatAdminInput.value.trim();
    if (!value) {
      return;
    }
    addMessage(value);
    chatAdminInput.value = "";
  });

  window.addEventListener("storage", (event) => {
    if (event.key === CHAT_STORAGE_KEY) {
      render();
    }
  });

  render();
  markRead();
};

const readRestockRequests = () => {
  try {
    const raw = localStorage.getItem(BACK_IN_STOCK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const renderRestockRequests = () => {
  if (!restockList) {
    return;
  }
  const requests = readRestockRequests();
  restockList.innerHTML = "";
  if (!requests.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No back-in-stock requests yet.";
    restockList.appendChild(empty);
    return;
  }

  requests.slice(0, 30).forEach((item) => {
    const card = document.createElement("div");
    card.className = "restock-item";
    const title = document.createElement("strong");
    title.textContent = item.productName || "Unknown product";
    const meta = document.createElement("div");
    meta.className = "restock-meta";
    const date = item.createdAt ? new Date(item.createdAt).toLocaleString() : "Just now";
    meta.textContent = `${item.name || "Customer"} • ${item.contact || "No contact"} • ${item.preference || "WhatsApp"} • ${date}`;
    card.append(title, meta);
    restockList.appendChild(card);
  });
};

const runQuickAction = (action) => {
  if (action === "add-product" && addBtn) {
    addNewProduct({});
    return;
  }
  if (action === "save-products" && saveBtn) {
    saveBtn.click();
    return;
  }
  if (action === "reload-products" && reloadBtn) {
    reloadBtn.click();
    return;
  }
  if (action === "reset-dashboard") {
    resetDashboard();
  }
};

const collectProducts = () => {
  const rows = Array.from(list.querySelectorAll(".product-row"));
  return rows
    .map((row) => {
      const imageInput = row.querySelector(".image-path-input");
      const nameInput = row.querySelector(".product-name-input");
      const priceInput = row.querySelector(".product-price-input");
      const imageValue = imageInput ? imageInput.value.trim() : "";
      const nameValue = nameInput ? nameInput.value.trim() : "";
      const priceValue = Number(priceInput ? priceInput.value : 0);
      const materialValue = row.querySelector(".row-details select").value;
      const storyInput = row.querySelector(".story-input");
      const spotlightInput = row.querySelector(".spotlight-input");
      const specsInput = row.querySelector(".specs-input");
      const galleryInput = row.querySelector(".gallery-input");
      const storyValue = storyInput ? storyInput.value.trim() : "";
      const specsValue = specsInput ? specsInput.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        : [];
      const galleryValue = galleryInput ? galleryInput.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        : [];
      const notesInput = row.querySelector(".row-notes");
      const soldOutToggle = row.querySelector(".sold-toggle input");
      const updatedAt = row.dataset.updatedAt || "";
      const newUntil = row.dataset.newUntil || "";

      return sanitizeProduct({
        id: row.dataset.productId || createUniqueProductId(),
        image: imageValue,
        name: nameValue,
        price: priceValue,
        material: materialValue,
        story: storyValue,
        specs: specsValue,
        gallery: galleryValue.length ? galleryValue : (imageValue ? [imageValue] : []),
        soldOut: Boolean(soldOutToggle && soldOutToggle.checked),
        spotlightUntil: row.dataset.spotlightUntil || "",
        spotlightText: spotlightInput ? spotlightInput.value.trim() : "",
        notes: notesInput ? notesInput.value : "",
        updatedAt,
        newUntil,
      });
    })
    .filter((product) => product.image && product.name);
};

const renderDashboard = () => {
  const products = collectProducts();
  const summary = insights ? insights.getSummary(products) : {
    revenue: 0,
    unitsSold: 0,
    whatsappClicks: 0,
    soldOutCount: products.filter((product) => product.soldOut).length,
  };

  if (metricRevenue) {
    metricRevenue.textContent = `KES ${formatter.format(summary.revenue)}`;
  }
  if (metricUnitsSold) {
    metricUnitsSold.textContent = String(summary.unitsSold);
  }
  if (metricWhatsappClicks) {
    metricWhatsappClicks.textContent = String(summary.whatsappClicks);
  }
  if (metricSoldOut) {
    metricSoldOut.textContent = String(summary.soldOutCount);
  }

  renderBarChart(products);

  if (!analyticsList) {
    return;
  }

  analyticsList.innerHTML = "";
  const leaderboard = products
    .map((product) => {
      const metrics = insights ? insights.getProductMetrics(product.id) : {
        whatsappClicks: 0,
        unitsSold: 0,
        revenue: 0,
      };

      return { product, metrics };
    })
    .sort((left, right) => {
      const rightScore = right.metrics.revenue + right.metrics.whatsappClicks * 50 + right.metrics.unitsSold * 100;
      const leftScore = left.metrics.revenue + left.metrics.whatsappClicks * 50 + left.metrics.unitsSold * 100;
      return rightScore - leftScore;
    });

  if (!leaderboard.length) {
    const empty = document.createElement("p");
    empty.className = "analytics-empty";
    empty.textContent = "No products in the current draft yet.";
    analyticsList.appendChild(empty);
    return;
  }

  leaderboard.forEach(({ product, metrics }) => {
    const item = document.createElement("article");
    item.className = "analytics-item";

    const header = document.createElement("div");
    header.className = "analytics-item-header";

    const title = document.createElement("h4");
    title.textContent = product.name;

    const badge = document.createElement("span");
    badge.className = product.soldOut ? "analytics-badge sold-out" : "analytics-badge live";
    badge.textContent = product.soldOut ? "Sold Out" : "Live";

    header.append(title, badge);

    const values = document.createElement("div");
    values.className = "analytics-values";

    const interest = document.createElement("span");
    interest.textContent = `${metrics.whatsappClicks} interest`;

    const sold = document.createElement("span");
    sold.textContent = `${metrics.unitsSold} sold`;

    const revenue = document.createElement("span");
    revenue.textContent = `KES ${formatter.format(metrics.revenue)}`;

    values.append(interest, sold, revenue);
    item.append(header, values);
    analyticsList.appendChild(item);
  });
};

const renderBarChart = (products) => {
  if (!barChart) {
    return;
  }
  const chartData = products.map((product) => {
    const metrics = insights ? insights.getProductMetrics(product.id) : {
      whatsappClicks: 0,
      unitsSold: 0,
      revenue: 0,
    };
    return { product, metrics };
  });

  const metricLabelMap = {
    whatsappClicks: "interest",
    unitsSold: "sold",
    revenue: "revenue",
  };

  const metricLabel = metricLabelMap[chartMetric] || "interest";
  if (chartSubtitle) {
    chartSubtitle.textContent = `Top pieces by ${metricLabel}`;
  }

  const sorted = chartData.sort((a, b) => {
    const left = chartMetric === "revenue" ? a.metrics.revenue : a.metrics[chartMetric] || 0;
    const right = chartMetric === "revenue" ? b.metrics.revenue : b.metrics[chartMetric] || 0;
    return right - left;
  });

  const top = sorted.slice(0, 3);
  barChart.innerHTML = "";

  if (!top.length) {
    const empty = document.createElement("p");
    empty.className = "analytics-empty";
    empty.textContent = "No data yet. Add products and confirm sales to see bars.";
    barChart.appendChild(empty);
    return;
  }

  const values = top.map((item) =>
    chartMetric === "revenue" ? item.metrics.revenue : item.metrics[chartMetric] || 0,
  );
  const max = Math.max(...values, 1);

  const baseline = readTrendBaseline();
  const baselineMetrics = baseline && baseline.metrics ? baseline.metrics : {};

  top.forEach(({ product, metrics }, index) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    if (index === 0) {
      row.classList.add("is-top");
    }

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = product.name;

    const previous = baselineMetrics[product.id] ? baselineMetrics[product.id][chartMetric] : 0;
    const current = chartMetric === "revenue" ? metrics.revenue : metrics[chartMetric] || 0;
    const delta = Number.isFinite(current - previous) ? current - previous : 0;
    const trend = document.createElement("span");
    if (delta > 0) {
      trend.className = "trend trend-up";
      trend.textContent = chartMetric === "revenue"
        ? `▲ KES ${formatter.format(Math.abs(delta))}`
        : `▲ ${Math.abs(delta)}`;
    } else if (delta < 0) {
      trend.className = "trend trend-down";
      trend.textContent = chartMetric === "revenue"
        ? `▼ KES ${formatter.format(Math.abs(delta))}`
        : `▼ ${Math.abs(delta)}`;
    } else {
      trend.className = "trend trend-flat";
      trend.textContent = "→ 0";
    }
    label.appendChild(trend);

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    const value = current;
    fill.style.width = `${Math.max(6, (value / max) * 100)}%`;
    track.appendChild(fill);

    const valueLabel = document.createElement("div");
    valueLabel.className = "bar-value";
    valueLabel.textContent = chartMetric === "revenue"
      ? `KES ${formatter.format(value)}`
      : String(value);

    row.append(label, track, valueLabel);
    barChart.appendChild(row);
  });
};

const updateRowAnalytics = () => {
  const rows = Array.from(list.querySelectorAll(".product-row"));
  rows.forEach((row) => {
    const metrics = insights ? insights.getProductMetrics(row.dataset.productId) : {
      whatsappClicks: 0,
      unitsSold: 0,
      revenue: 0,
    };
    const summary = row.querySelector("[data-row-metrics]");
    if (!summary) {
      return;
    }

    summary.textContent = `${metrics.whatsappClicks} WhatsApp clicks - ${metrics.unitsSold} sold - KES ${formatter.format(metrics.revenue)} revenue`;

    const panel = row.querySelector("[data-row-performance]");
    if (panel) {
      panel.textContent = `${metrics.whatsappClicks} WhatsApp clicks · ${metrics.unitsSold} sold · KES ${formatter.format(metrics.revenue)} revenue`;
    }
  });
};

const renderPreview = () => {
  const products = collectProducts();
  previewGrid.innerHTML = "";
  products.forEach((product, index) => {
    const row = list.querySelectorAll(".product-row")[index];
    const imageInput = row ? row.querySelector(".image-path-input") : null;

    const card = document.createElement("div");
    card.className = `preview-card${product.soldOut ? " is-sold-out" : ""}`;

    const media = document.createElement("div");
    media.className = "preview-media";

    const img = document.createElement("img");
    img.src = imageInput && imageInput.dataset.preview ? imageInput.dataset.preview : product.image;
    img.alt = product.name;

    media.appendChild(img);

    if (isNewArrival(product) && !product.soldOut) {
      const badge = document.createElement("span");
      badge.className = "preview-badge new";
      badge.textContent = "New Arrival";
      media.appendChild(badge);
    }

    if (isSpotlight(product) && !product.soldOut) {
      const badge = document.createElement("span");
      badge.className = "preview-badge spotlight";
      badge.textContent = "Spotlight";
      media.appendChild(badge);
    }

    if (product.soldOut) {
      const badge = document.createElement("span");
      badge.className = "preview-badge";
      badge.textContent = "Sold Out";
      media.appendChild(badge);
    }

    const title = document.createElement("h4");
    title.textContent = product.name;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = `KES ${formatter.format(product.price)}`;

    card.append(media, title, price);
    previewGrid.appendChild(card);
  });

  renderDashboard();
  updateRowAnalytics();
};

const persistDraftFromUI = () => {
  const products = collectProducts();
  storeDraft(products);
  renderPreview();
  setDirty(true);
};

const handleConfirmPurchase = (productId) => {
  const products = collectProducts();
  const productIndex = products.findIndex((item) => item.id === productId);
  const product = productIndex >= 0 ? products[productIndex] : null;
  if (!product) {
    return;
  }

  if (insights) {
    insights.confirmPurchase(product, 1);
  }

  renderDashboard();
  updateRowAnalytics();

  setStatus(`Recorded sale for ${product.name}`, "ok");
};

const createRow = (product) => {
  const normalizedProduct = sanitizeProduct(product);
  const row = document.createElement("div");
  row.className = "product-row";
  row.draggable = true;
  row.dataset.productId = normalizedProduct.id;
  row.dataset.updatedAt = normalizedProduct.updatedAt || "";
  row.dataset.newUntil = normalizedProduct.newUntil || "";
  const dragHandle = document.createElement("div");
  dragHandle.className = "drag-handle";
  dragHandle.textContent = "::";

  const thumb = document.createElement("img");
  thumb.className = "row-thumb";
  thumb.alt = "";

  const image = document.createElement("input");
  image.className = "image-path-input";
  image.value = normalizedProduct.image;
  image.placeholder = "images/product.jpg";

  const imageStatus = document.createElement("span");
  imageStatus.className = "image-status";
  imageStatus.textContent = "Check image";

  const pick = document.createElement("button");
  pick.className = "ghost";
  pick.type = "button";
  pick.textContent = "Choose Image";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";

  pick.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      return;
    }

    const safeName = file.name.replace(/\s+/g, " ").trim();
    image.value = `images/${safeName}`;
    image.dataset.preview = URL.createObjectURL(file);
    thumb.src = image.dataset.preview;
    imageStatus.textContent = "Picked";
    imageStatus.className = "image-status ok";
    persistDraftFromUI();
  });

  const name = document.createElement("input");
  name.className = "product-name-input";
  name.value = normalizedProduct.name;
  name.placeholder = "Product Name";

  const price = document.createElement("input");
  price.className = "product-price-input";
  price.value = normalizedProduct.price;
  price.type = "number";
  price.min = "0";
  price.placeholder = "Price (KES)";

  const material = createSelect(normalizedProduct.material, [
    { value: "wood", label: "Wood" },
    { value: "bead", label: "Bead" },
    { value: "brass", label: "Brass" },
    { value: "clay", label: "Clay" },
  ]);

  const story = document.createElement("input");
  story.className = "story-input";
  story.value = normalizedProduct.story;
  story.placeholder = "Short story or description";

  const specs = document.createElement("input");
  specs.className = "specs-input";
  specs.value = normalizedProduct.specs.join(", ");
  specs.placeholder = "Specs (comma separated)";

  const gallery = document.createElement("input");
  gallery.className = "gallery-input";
  gallery.value = normalizedProduct.gallery.join(", ");
  gallery.placeholder = "Gallery images (comma separated)";

  const cloneGalleryBtn = document.createElement("button");
  cloneGalleryBtn.className = "ghost";
  cloneGalleryBtn.type = "button";
  cloneGalleryBtn.textContent = "Copy image to gallery";
  cloneGalleryBtn.addEventListener("click", () => {
    const imagePath = image.value.trim();
    if (!imagePath) {
      setStatus("Add an image path first", "err");
      return;
    }
    gallery.value = imagePath;
    markRowUpdated(row);
    persistDraftFromUI();
  });

  const notes = document.createElement("textarea");
  notes.className = "row-notes";
  notes.rows = 2;
  notes.placeholder = "Private notes (not shown on website)";
  notes.value = normalizedProduct.notes || "";

  const spotlight = document.createElement("input");
  spotlight.className = "spotlight-input";
  spotlight.value = normalizedProduct.spotlightText || "";
  spotlight.placeholder = "Spotlight line (e.g. Crafted under the Nairobi sun)";

  const soldToggleLabel = document.createElement("label");
  soldToggleLabel.className = "sold-toggle";

  const soldToggle = document.createElement("input");
  soldToggle.type = "checkbox";
  soldToggle.checked = normalizedProduct.soldOut;

  const soldToggleText = document.createElement("span");
  soldToggleText.textContent = "Mark as sold out";

  soldToggleLabel.append(soldToggle, soldToggleText);

  const spotlightToggleLabel = document.createElement("label");
  spotlightToggleLabel.className = "spotlight-toggle";

  const spotlightToggle = document.createElement("input");
  spotlightToggle.type = "checkbox";
  spotlightToggle.checked = isSpotlight(normalizedProduct);

  const spotlightToggleText = document.createElement("span");
  spotlightToggleText.textContent = "Spotlight Drop (7 days)";

  spotlightToggleLabel.append(spotlightToggle, spotlightToggleText);

  const confirmPurchaseBtn = document.createElement("button");
  confirmPurchaseBtn.className = "primary confirm-purchase";
  confirmPurchaseBtn.type = "button";
  confirmPurchaseBtn.textContent = "Confirm Purchase";
  confirmPurchaseBtn.addEventListener("click", () => {
    handleConfirmPurchase(row.dataset.productId);
  });

  const rowMetrics = document.createElement("p");
  rowMetrics.className = "row-metrics";
  rowMetrics.setAttribute("data-row-metrics", "true");

  const performanceToggle = document.createElement("button");
  performanceToggle.className = "ghost performance-toggle";
  performanceToggle.type = "button";
  performanceToggle.textContent = "Performance";

  const performancePanel = document.createElement("div");
  performancePanel.className = "performance-panel";
  performancePanel.setAttribute("data-row-performance", "true");
  performancePanel.setAttribute("aria-hidden", "true");
  performancePanel.textContent = "0 WhatsApp clicks · 0 sold · KES 0 revenue";

  performanceToggle.addEventListener("click", () => {
    const isOpen = performancePanel.classList.toggle("is-open");
    performancePanel.setAttribute("aria-hidden", String(!isOpen));
  });

  const updatedLabel = document.createElement("span");
  updatedLabel.className = "row-updated";
  updatedLabel.setAttribute("data-updated-label", "true");
  updatedLabel.textContent = `Last updated: ${formatUpdatedAt(row.dataset.updatedAt)}`;

  const priceSliderWrap = document.createElement("label");
  priceSliderWrap.className = "price-slider";
  const priceSliderText = document.createElement("span");
  priceSliderText.textContent = `Quick price slider · KES ${formatter.format(Number(normalizedProduct.price) || 0)}`;
  const priceSlider = document.createElement("input");
  priceSlider.type = "range";
  priceSlider.min = "0";
  priceSlider.max = "20000";
  priceSlider.step = "10";
  priceSlider.value = String(normalizedProduct.price);
  priceSlider.addEventListener("input", () => {
    price.value = priceSlider.value;
    priceSliderText.textContent = `Quick price slider · KES ${formatter.format(Number(priceSlider.value) || 0)}`;
    markRowUpdated(row);
    persistDraftFromUI();
  });

  priceSlider.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  priceSlider.addEventListener("mousedown", (event) => {
    if (event.button !== 2) {
      return;
    }
    event.preventDefault();
    const startX = event.clientX;
    const startValue = Number(priceSlider.value);
    const min = Number(priceSlider.min);
    const max = Number(priceSlider.max);
    const step = Number(priceSlider.step) || 10;
    const sensitivity = 0.2;

    const onMove = (moveEvent) => {
      const delta = (moveEvent.clientX - startX) * sensitivity;
      const nextValue = Math.min(max, Math.max(min, startValue + delta));
      const snapped = Math.round(nextValue / step) * step;
      priceSlider.value = String(snapped);
      price.value = String(snapped);
      priceSliderText.textContent = `Quick price slider · KES ${formatter.format(Number(snapped) || 0)}`;
      markRowUpdated(row);
      persistDraftFromUI();
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  });
  priceSliderWrap.append(priceSliderText, priceSlider);

  const remove = document.createElement("button");
  remove.className = "ghost";
  remove.type = "button";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    row.remove();
    persistDraftFromUI();
  });

  const duplicate = document.createElement("button");
  duplicate.className = "ghost";
  duplicate.type = "button";
  duplicate.textContent = "Duplicate";
  duplicate.addEventListener("click", () => {
    const rows = Array.from(list.querySelectorAll(".product-row"));
    const index = rows.indexOf(row);
    const products = collectProducts();
    const current = products[index];
    if (!current) {
      return;
    }

    products.splice(index + 1, 0, {
      ...current,
      id: createUniqueProductId(),
      specs: [...current.specs],
      gallery: [...current.gallery],
    });
    render(products);
    storeDraft(products);
    setStatus("Duplicated product", "ok");
    setDirty(true);
  });

  const actions = document.createElement("div");
  actions.className = "row-summary-actions";

  const summary = document.createElement("div");
  summary.className = "row-summary";

  const summaryMain = document.createElement("button");
  summaryMain.className = "row-summary-main";
  summaryMain.type = "button";

  const summaryCopy = document.createElement("div");
  summaryCopy.className = "row-summary-copy";

  const summaryTitle = document.createElement("strong");
  summaryTitle.className = "row-summary-title";

  const summaryMeta = document.createElement("span");
  summaryMeta.className = "row-summary-meta";

  const summaryPrice = document.createElement("span");
  summaryPrice.className = "row-summary-price";

  const summaryState = document.createElement("span");
  summaryState.className = "row-summary-state";

  summaryCopy.append(summaryTitle, summaryMeta);
  summaryMain.append(thumb, summaryCopy, summaryPrice, summaryState);

  const toggleEditor = document.createElement("button");
  toggleEditor.className = "ghost row-toggle";
  toggleEditor.type = "button";

  actions.append(duplicate, remove, toggleEditor);
  summary.append(dragHandle, summaryMain, actions);

  const top = document.createElement("div");
  top.className = "row-top";
  top.append(name, price, image, pick, imageStatus, fileInput);

  const details = document.createElement("div");
  details.className = "row-details";
  details.append(material, story, specs, gallery, cloneGalleryBtn);

  const footer = document.createElement("div");
  footer.className = "row-footer";
  footer.append(soldToggleLabel, updatedLabel);

  const editor = document.createElement("div");
  editor.className = "row-editor";
  editor.append(top, details, footer);

  const syncSummary = () => {
    const nameValue = name.value.trim() || "Untitled product";
    const materialValue = material.value ? material.value.toUpperCase() : "PRODUCT";
    const priceValue = Number(price.value) || 0;
    summaryTitle.textContent = nameValue;
    summaryMeta.textContent = `${materialValue} · ${image.value.trim() ? "Image added" : "Missing image"}`;
    summaryPrice.textContent = `KES ${formatter.format(priceValue)}`;
    summaryState.textContent = soldToggle.checked ? "Sold Out" : "Available";
    summaryState.classList.toggle("is-sold-out", soldToggle.checked);
  };

  const setExpanded = (expanded) => {
    row.classList.toggle("is-open", expanded);
    summaryMain.setAttribute("aria-expanded", String(expanded));
    toggleEditor.textContent = expanded ? "Done" : "Edit";
  };

  summaryMain.addEventListener("click", () => {
    setExpanded(!row.classList.contains("is-open"));
  });

  toggleEditor.addEventListener("click", () => {
    setExpanded(!row.classList.contains("is-open"));
  });

  row.append(summary, editor);
  row.dataset.spotlightUntil = normalizedProduct.spotlightUntil || "";

  const validateImage = () => {
    const path = image.value.trim();
    if (!path) {
      imageStatus.textContent = "Missing";
      imageStatus.className = "image-status err";
      thumb.removeAttribute("src");
      return;
    }

    const tester = new Image();
    tester.onload = () => {
      imageStatus.textContent = "OK";
      imageStatus.className = "image-status ok";
      thumb.src = path;
    };
    tester.onerror = () => {
      imageStatus.textContent = "Not found";
      imageStatus.className = "image-status err";
      thumb.removeAttribute("src");
    };
    tester.src = path;
  };

  image.addEventListener("input", validateImage);
  row.addEventListener("input", () => {
    markRowUpdated(row);
    syncSummary();
    persistDraftFromUI();
  });
  soldToggle.addEventListener("change", () => {
    markRowUpdated(row);
    syncSummary();
    persistDraftFromUI();
  });
  spotlightToggle.addEventListener("change", () => {
    if (spotlightToggle.checked) {
      const end = new Date();
      end.setDate(end.getDate() + 7);
      row.dataset.spotlightUntil = end.toISOString();
      if (!spotlight.value.trim()) {
        spotlight.value = `Spotlight Drop — ${name.value.trim() || "Signature Piece"}`;
      }
    } else {
      row.dataset.spotlightUntil = "";
    }
    markRowUpdated(row);
    persistDraftFromUI();
  });
  setTimeout(() => {
    validateImage();
    syncSummary();
    setExpanded(!normalizedProduct.name || !normalizedProduct.image);
  }, 0);
  return row;
};

const render = (products) => {
  const normalizedProducts = Array.isArray(products) ? products.map(sanitizeProduct) : [];
  list.innerHTML = "";
  const query = productSearchInput ? productSearchInput.value.trim().toLowerCase() : "";
  normalizedProducts
    .filter((product) => !query || product.name.toLowerCase().includes(query))
    .forEach((product) => {
    list.appendChild(createRow(product));
  });
  renderPreview();
};

const saveToFile = async (products) => {
  const content = `window.PRODUCTS = ${JSON.stringify(products, null, 2)};\n`;

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "products-data.js",
        types: [
          {
            description: "JavaScript",
            accept: { "text/javascript": [".js"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return true;
    } catch (error) {
      console.log("Save cancelled", error);
      return false;
    }
  }

  const blob = new Blob([content], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products-data.js";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
};

let draggedRow = null;
list.addEventListener("dragstart", (event) => {
  const row = event.target.closest(".product-row");
  if (!row) {
    return;
  }

  draggedRow = row;
  event.dataTransfer.effectAllowed = "move";
});

list.addEventListener("dragover", (event) => {
  event.preventDefault();
  const targetRow = event.target.closest(".product-row");
  if (!targetRow || targetRow === draggedRow) {
    return;
  }

  const rect = targetRow.getBoundingClientRect();
  const offset = event.clientY - rect.top;
  if (offset > rect.height / 2) {
    targetRow.after(draggedRow);
  } else {
    targetRow.before(draggedRow);
  }
});

list.addEventListener("drop", () => {
  draggedRow = null;
  persistDraftFromUI();
});

if (addBtn) {
  addBtn.addEventListener("click", () => {
    addNewProduct({});
  });
}

if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const products = collectProducts();
    const saved = await saveToFile(products);
    if (!saved) {
      setStatus("Save cancelled", "err");
      return;
    }

    savedCatalogProducts = cloneProducts(products);
    savedCatalogSignature = getCatalogSignature(savedCatalogProducts);
    storeDraft(products);
    window.PRODUCTS = cloneProducts(products);
    setStatus("Saved products-data.js locally. Push your repo to GitHub to publish.", "ok");
    setDirty(false);
    markLastSaved(new Date().toISOString());
    saveBtn.textContent = "Saved";
    setTimeout(() => {
      saveBtn.textContent = "Save Products";
    }, 1200);

    saveTrendBaseline(products);
    renderDashboard();

    reloadStorefrontPreviews();
  });
}

if (reloadBtn) {
  reloadBtn.addEventListener("click", () => {
    clearStoredDraft();
    render(savedCatalogProducts);
    setStatus("Reloaded saved catalog", "ok");
    setDirty(false);
  });
}

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear all products from the admin draft?")) {
      return;
    }

    render([]);
    storeDraft([]);
    setStatus("Cleared draft", "ok");
    setDirty(true);
  });
}

if (bulkApply) {
  bulkApply.addEventListener("click", () => {
    const amount = Number(bulkValue && bulkValue.value);
    if (!Number.isFinite(amount)) {
      setStatus("Enter a valid amount", "err");
      return;
    }

    const products = collectProducts().map((product) => {
      let nextPrice = product.price;
      if (bulkType && bulkType.value === "subtract") {
        nextPrice = product.price - amount;
      } else if (bulkType && bulkType.value === "percent") {
        nextPrice = product.price + (product.price * amount) / 100;
      } else {
        nextPrice = product.price + amount;
      }

      return {
        ...product,
        price: Math.max(0, Math.round(nextPrice)),
      };
    });

    render(products);
    storeDraft(products);
    setStatus("Updated all prices", "ok");
  });
}

if (bulkApplyMeta) {
  bulkApplyMeta.addEventListener("click", () => {
    const nextMaterial = bulkMaterial ? bulkMaterial.value : "";
    const soldOutValue = bulkSoldOut ? bulkSoldOut.value : "";

    if (!nextMaterial && soldOutValue === "") {
      setStatus("Choose a material or sold-out value", "err");
      return;
    }

    const products = collectProducts().map((product) => {
      let soldOut = product.soldOut;

      if (soldOutValue === "true") {
        soldOut = true;
      } else if (soldOutValue === "false") {
        soldOut = false;
      }

      return {
        ...product,
        material: nextMaterial || product.material,
        soldOut,
      };
    });

    render(products);
    storeDraft(products);
    setStatus("Updated product details", "ok");
    setDirty(true);
  });
}

if (resetDashboardBtn) {
  resetDashboardBtn.addEventListener("click", () => {
    resetDashboard();
  });
}

if (productSearchInput) {
  productSearchInput.addEventListener("input", () => {
    render(collectProducts());
  });
}

if (helpToggle && helpContent) {
  helpToggle.addEventListener("click", () => {
    const isOpen = helpContent.classList.toggle("is-open");
    helpContent.setAttribute("aria-hidden", String(!isOpen));
    helpToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (workspaceTabButtons.length) {
  workspaceTabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setWorkspaceTab(button.dataset.tab);
    });
  });
}

if (workspaceTabLinks.length) {
  workspaceTabLinks.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tabLink || "catalog";
      const scrollTarget = button.dataset.scrollTarget;
      setWorkspaceTab(targetTab);
      if (scrollTarget) {
        setTimeout(() => {
          const element = document.querySelector(scrollTarget);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 20);
      }
    });
  });
}

if (quickActionButtons && quickActionButtons.length) {
  quickActionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      runQuickAction(btn.dataset.action);
    });
  });
}

  if (quickAddBtn && quickNameInput) {
  quickAddBtn.addEventListener("click", () => {
    const nameValue = quickNameInput.value.trim();
    const imageValue = quickImageInput ? quickImageInput.value.trim() : "";
    const previewUrl = quickImageInput ? quickImageInput.dataset.preview || "" : "";
    const priceValue = quickPriceInput ? Number(quickPriceInput.value) : 0;
    const normalizedPrice = Number.isFinite(priceValue) ? priceValue : 0;
    if (!nameValue && !imageValue) {
      setStatus("Enter a product name or image first", "err");
      quickNameInput.focus();
      return;
    }
    addNewProduct({ name: nameValue, image: imageValue, previewUrl, price: normalizedPrice });
    quickNameInput.value = "";
    if (quickImageInput) {
      quickImageInput.value = "";
      delete quickImageInput.dataset.preview;
    }
    if (quickPriceInput) {
      quickPriceInput.value = "";
    }
  });

  quickNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      quickAddBtn.click();
    }
  });
}

if (quickImagePickBtn && quickImageFile && quickImageInput) {
  quickImagePickBtn.addEventListener("click", () => {
    quickImageFile.click();
  });

  quickImageFile.addEventListener("change", () => {
    const file = quickImageFile.files && quickImageFile.files[0];
    if (!file) {
      return;
    }
    const safeName = file.name.replace(/\s+/g, " ").trim();
    quickImageInput.value = `images/${safeName}`;
    quickImageInput.dataset.preview = URL.createObjectURL(file);
  });
}

if (sharePickBtn && shareFileInput) {
  sharePickBtn.addEventListener("click", () => {
    shareFileInput.click();
  });
}

if (shareFileInput) {
  shareFileInput.addEventListener("change", () => {
    const file = shareFileInput.files && shareFileInput.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (shareImageInput) {
        shareImageInput.value = String(reader.result || "");
      }
      updateSharePreview();
    };
    reader.readAsDataURL(file);
  });
}

if (shareDownloadBtn) {
  shareDownloadBtn.addEventListener("click", () => {
    downloadShareCard();
  });
}

if (shareCopyBtn) {
  shareCopyBtn.addEventListener("click", () => {
    copyShareLink();
  });
}

if (shareTitleInput || shareSubtitleInput || shareLinkInput || shareImageInput) {
  const update = () => updateSharePreview();
  if (shareTitleInput) shareTitleInput.addEventListener("input", update);
  if (shareSubtitleInput) shareSubtitleInput.addEventListener("input", update);
  if (shareLinkInput) shareLinkInput.addEventListener("input", update);
  if (shareImageInput) shareImageInput.addEventListener("input", update);
}

if (insights) {
  insights.subscribe(() => {
    renderDashboard();
    updateRowAnalytics();
  });
}

const initAdminPage = async () => {
  render(getInitialProducts());
  setDirty(false);
  updateLastSavedMeta(localStorage.getItem(LAST_SAVED_STORAGE_KEY) || "");
  initAdminChat();
  renderRestockRequests();
  setWorkspaceTab(localStorage.getItem(WORKSPACE_TAB_STORAGE_KEY) || "catalog");
};

initAdminPage();

if (restockClear) {
  restockClear.addEventListener("click", () => {
    localStorage.removeItem(BACK_IN_STOCK_STORAGE_KEY);
    renderRestockRequests();
  });
}

window.addEventListener("storage", (event) => {
  if (event.key === BACK_IN_STOCK_STORAGE_KEY) {
    renderRestockRequests();
  }
});

if (deviceToggle && deviceContent) {
  deviceToggle.addEventListener("click", () => {
    const isOpen = deviceContent.classList.toggle("is-open");
    deviceContent.setAttribute("aria-hidden", String(!isOpen));
    deviceToggle.setAttribute("aria-expanded", String(isOpen));
    deviceToggle.textContent = isOpen ? "Hide Preview" : "Show Preview";
    if (isOpen) {
      reloadStorefrontPreviews();
    }
  });
}

if (shareTitleInput && !shareTitleInput.value) {
  shareTitleInput.value = "SharonCraft Atelier";
}
if (shareSubtitleInput && !shareSubtitleInput.value) {
  shareSubtitleInput.value = "Handmade Kenyan artifacts";
}
if (shareLinkInput && !shareLinkInput.value) {
  const origin = window.location.origin === "null" ? "https://your-site.com" : window.location.origin;
  shareLinkInput.value = `${origin}/index.html`;
}
if (shareImageInput && !shareImageInput.value) {
  shareImageInput.value = "images/product1.jpg";
}
updateSharePreview();

deviceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setDevicePreset(btn.dataset.device, btn.dataset.width, btn.dataset.height);
  });
});

if (deviceButtons.length) {
  const activeDeviceButton =
    Array.from(deviceButtons).find((button) => button.classList.contains("is-active")) ||
    deviceButtons[0];
  setDevicePreset(
    activeDeviceButton.dataset.device,
    activeDeviceButton.dataset.width,
    activeDeviceButton.dataset.height,
  );
}

chartButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    chartButtons.forEach((item) => item.classList.remove("is-active"));
    btn.classList.add("is-active");
    chartMetric = btn.dataset.metric || "whatsappClicks";
    renderDashboard();
  });
});
