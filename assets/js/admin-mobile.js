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
  const generateDraftButton = document.getElementById("admin-mobile-generate-draft");
  const draftPalette = document.getElementById("admin-mobile-draft-palette");
  const draftStatus = document.getElementById("admin-mobile-draft-status");
  const generateSeoButton = document.getElementById("admin-mobile-generate-seo");
  const seoTitleInput = document.getElementById("admin-mobile-seo-title");
  const seoDescriptionInput = document.getElementById("admin-mobile-seo-description");
  const seoKeywordsInput = document.getElementById("admin-mobile-seo-keywords");
  const seoPreviewUrl = document.getElementById("admin-mobile-seo-preview-url");
  const seoPreviewTitle = document.getElementById("admin-mobile-seo-preview-title");
  const seoPreviewDescription = document.getElementById("admin-mobile-seo-preview-description");
  const seoStatus = document.getElementById("admin-mobile-seo-status");
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
  let latestPhotoAnalysis = null;
  let productSeoOverrides = {};

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

  function parseKeywords(value) {
    const unique = new Set();
    return parseList(value).filter(function (item) {
      const normalized = item.toLowerCase();
      if (!normalized || unique.has(normalized)) {
        return false;
      }
      unique.add(normalized);
      return true;
    });
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

  function formatBytes(value) {
    const size = Math.max(0, Number(value) || 0);
    if (!size) {
      return "0 KB";
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(size < 1024 * 100 ? 0 : 1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  function titleCase(value) {
    return normalizeText(value)
      .split(/\s+/)
      .filter(Boolean)
      .map(function (word) {
        return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
      })
      .join(" ");
  }

  function hashText(value) {
    return normalizeText(value)
      .split("")
      .reduce(function (hash, character) {
        return ((hash * 31) + character.charCodeAt(0)) | 0;
      }, 11);
  }

  function truncateText(value, maxLength) {
    const text = normalizeText(value).replace(/\s+/g, " ");
    const limit = Math.max(0, Number(maxLength) || 0);
    if (!limit || text.length <= limit) {
      return text;
    }

    const clipped = text.slice(0, Math.max(1, limit - 1));
    const trimmed = clipped.replace(/\s+\S*$/, "").trim() || clipped.trim();
    return `${trimmed}...`;
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
    latestPhotoAnalysis = null;
    productSeoOverrides = productSeoOverrides && typeof productSeoOverrides === "object" ? productSeoOverrides : {};
    renderDraftPalette();
    setStatus(uploadStatus, "Snap a product photo here and the phone admin will resize and compress it before live upload.", "info");
    setStatus(draftStatus, "The helper uses your category plus the uploaded photo's dominant colors to create a clean draft starter.", "info");
    if (seoTitleInput) {
      seoTitleInput.value = "";
    }
    if (seoDescriptionInput) {
      seoDescriptionInput.value = "";
    }
    if (seoKeywordsInput) {
      seoKeywordsInput.value = "";
    }
    updateSeoPreview();
    setStatus(seoStatus, "SEO copy saved here will override the product page title, description, and keyword metadata on the live site.", "info");
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
    setStatus(draftStatus, "Generate a fresh draft if you want the phone helper to rewrite the title and description.", "info");
    fillSeoFields(product.id);
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

  function rgbToHsl(red, green, blue) {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    let hue = 0;
    let saturation = 0;

    if (max !== min) {
      const delta = max - min;
      saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      switch (max) {
        case r:
          hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          hue = ((b - r) / delta + 2) / 6;
          break;
        default:
          hue = ((r - g) / delta + 4) / 6;
          break;
      }
    }

    return {
      h: hue * 360,
      s: saturation,
      l: lightness
    };
  }

  function describeColor(rgb) {
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (hsl.l <= 0.16) {
      return "Onyx";
    }
    if (hsl.l >= 0.88 && hsl.s <= 0.16) {
      return "Ivory";
    }
    if (hsl.s <= 0.12) {
      return hsl.l > 0.6 ? "Stone" : "Charcoal";
    }
    if (hsl.h < 15 || hsl.h >= 345) {
      return hsl.l > 0.6 ? "Coral" : "Ruby";
    }
    if (hsl.h < 38) {
      return hsl.l > 0.62 ? "Amber" : "Terracotta";
    }
    if (hsl.h < 62) {
      return "Gold";
    }
    if (hsl.h < 90) {
      return "Olive";
    }
    if (hsl.h < 155) {
      return hsl.l > 0.55 ? "Emerald" : "Forest";
    }
    if (hsl.h < 190) {
      return "Teal";
    }
    if (hsl.h < 235) {
      return hsl.l > 0.6 ? "Sky" : "Cobalt";
    }
    if (hsl.h < 290) {
      return "Violet";
    }
    return hsl.l > 0.65 ? "Blush" : "Berry";
  }

  function renderDraftPalette() {
    if (!draftPalette) {
      return;
    }

    const swatches = latestPhotoAnalysis && Array.isArray(latestPhotoAnalysis.palette)
      ? latestPhotoAnalysis.palette
      : [];

    draftPalette.innerHTML = swatches.length
      ? swatches.map(function (item) {
          return `
            <span class="admin-mobile-draft-chip">
              <span class="admin-mobile-draft-chip-swatch" style="background:${escapeHtml(item.hex)}"></span>
              ${escapeHtml(item.name)}
            </span>
          `;
        }).join("")
      : "";
  }

  function normalizeSeoOverride(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      title: normalizeText(source.title),
      description: normalizeText(source.description),
      keywords: Array.isArray(source.keywords) ? parseKeywords(source.keywords.join(", ")) : parseKeywords(source.keywords),
      updatedAt: normalizeText(source.updatedAt)
    };
  }

  function getCurrentSeoProductId() {
    const existingId = normalizeText(productIdInput && productIdInput.value);
    const nameValue = normalizeText(nameInput && nameInput.value);
    return existingId || (nameValue ? slugify(nameValue) : "");
  }

  function getSeoOverrideForProduct(productId) {
    const normalizedId = normalizeText(productId);
    if (!normalizedId || !productSeoOverrides || typeof productSeoOverrides !== "object") {
      return normalizeSeoOverride({});
    }
    return normalizeSeoOverride(productSeoOverrides[normalizedId]);
  }

  function readSeoFields() {
    return normalizeSeoOverride({
      title: seoTitleInput && seoTitleInput.value,
      description: seoDescriptionInput && seoDescriptionInput.value,
      keywords: seoKeywordsInput && seoKeywordsInput.value
    });
  }

  function hasSeoFields() {
    const seo = readSeoFields();
    return Boolean(seo.title || seo.description || seo.keywords.length);
  }

  function updateSeoPreview() {
    const previewId = getCurrentSeoProductId() || "new-product";
    const fallbackTitle = normalizeText(nameInput && nameInput.value)
      ? `${normalizeText(nameInput.value)} | SharonCraft`
      : "Your SEO title preview will appear here.";
    const seo = readSeoFields();

    if (seoPreviewUrl) {
      seoPreviewUrl.textContent = `www.sharoncraft.co.ke/product.html?id=${encodeURIComponent(previewId)}`;
    }
    if (seoPreviewTitle) {
      seoPreviewTitle.textContent = seo.title || fallbackTitle;
    }
    if (seoPreviewDescription) {
      seoPreviewDescription.textContent = seo.description || "The meta description preview updates as you type so you can keep it clean and client-friendly.";
    }
  }

  function fillSeoFields(productId) {
    const seo = getSeoOverrideForProduct(productId);
    if (seoTitleInput) {
      seoTitleInput.value = seo.title;
    }
    if (seoDescriptionInput) {
      seoDescriptionInput.value = seo.description;
    }
    if (seoKeywordsInput) {
      seoKeywordsInput.value = seo.keywords.join(", ");
    }
    updateSeoPreview();
    setStatus(
      seoStatus,
      seo.title || seo.description || seo.keywords.length
        ? "This product already has live SEO overrides saved from the admin."
        : "No saved SEO override yet. Generate one here and it will control the live product metadata.",
      seo.title || seo.description || seo.keywords.length ? "success" : "info"
    );
  }

  async function analyzeImageColors(file) {
    const image = await loadFileImage(file);
    const sampleSize = 48;
    const canvas = document.createElement("canvas");
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      return null;
    }

    ctx.drawImage(image, 0, 0, sampleSize, sampleSize);
    const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
    const buckets = new Map();

    for (let index = 0; index < data.length; index += 16) {
      const alpha = data[index + 3];
      if (alpha < 120) {
        continue;
      }

      const red = Math.round(data[index] / 32) * 32;
      const green = Math.round(data[index + 1] / 32) * 32;
      const blue = Math.round(data[index + 2] / 32) * 32;
      const key = `${red},${green},${blue}`;
      if (!buckets.has(key)) {
        buckets.set(key, { r: red, g: green, b: blue, count: 0 });
      }
      buckets.get(key).count += 1;
    }

    const palette = Array.from(buckets.values())
      .sort(function (left, right) {
        return right.count - left.count;
      })
      .slice(0, 3)
      .map(function (item) {
        return {
          hex: `rgb(${item.r}, ${item.g}, ${item.b})`,
          name: describeColor(item),
          count: item.count
        };
      });

    return {
      palette,
      colorNames: palette.map(function (item) {
        return item.name;
      })
    };
  }

  function buildDraftFromContext() {
    const categorySlug = normalizeText(categoryInput.value);
    const categoryName = getCategoryName(categorySlug);
    const badge = normalizeText(badgeInput.value);
    const analysis = latestPhotoAnalysis || { colorNames: [], palette: [] };
    const colors = analysis.colorNames.length ? analysis.colorNames : ["Handmade"];
    const primaryColor = colors[0];
    const secondaryColor = colors[1] && colors[1] !== colors[0] ? colors[1] : "";
    const seed = hashText(`${categorySlug}|${primaryColor}|${secondaryColor}|${badge}`);
    const categoryDrafts = {
      necklaces: {
        nouns: ["Statement Necklace", "Collar Necklace", "Beaded Necklace"],
        use: "weddings, gifting, and standout everyday styling"
      },
      bracelets: {
        nouns: ["Beaded Bracelet", "Stack Bracelet", "Handmade Bracelet"],
        use: "easy gifting, repeat wear, and coordinated looks"
      },
      "home-decor": {
        nouns: ["Decor Accent", "Beaded Home Piece", "Home Decor Accent"],
        use: "living rooms, bedrooms, and housewarming gifting"
      },
      "bags-accessories": {
        nouns: ["Beaded Accessory", "Carry Accent", "Handmade Accessory"],
        use: "daily styling, travel looks, and thoughtful gifting"
      },
      "gift-sets": {
        nouns: ["Gift Set", "Curated Gift Piece", "Handmade Gift Set"],
        use: "birthdays, celebrations, and memorable gifting"
      },
      "bridal-occasion": {
        nouns: ["Occasion Set", "Bridal Bead Set", "Ceremony Piece"],
        use: "weddings, ceremonies, and photo-ready styling"
      }
    };
    const config = categoryDrafts[categorySlug] || {
      nouns: [titleCase(categoryName || "Handmade Piece"), "Handmade Piece", "SharonCraft Favorite"],
      use: "gifting, styling, and quick WhatsApp orders"
    };
    const noun = config.nouns[Math.abs(seed) % config.nouns.length];
    const titleParts = [primaryColor];
    if (secondaryColor && secondaryColor !== primaryColor && Math.abs(seed) % 2 === 0) {
      titleParts.push(secondaryColor);
    }
    titleParts.push(noun);
    const title = titleCase(titleParts.join(" "));

    const palettePhrase = secondaryColor
      ? `${primaryColor.toLowerCase()} and ${secondaryColor.toLowerCase()} tones`
      : `${primaryColor.toLowerCase()} tones`;
    const badgePhrase = badge ? `${badge.toLowerCase()} SharonCraft ` : "SharonCraft ";
    const description = `A ${badgePhrase}${normalizeText(categoryName).toLowerCase() || "handmade"} piece with ${palettePhrase} and a clean handcrafted finish. It works well for ${config.use}, and gives clients an easy option to style, gift, or order on WhatsApp.`;
    const details = [
      `Handmade ${normalizeText(categoryName).toLowerCase() || "piece"} with ${palettePhrase}`,
      "Client-friendly finish for gifting or easy styling",
      "Fast to share and order through SharonCraft WhatsApp support"
    ];

    return {
      title,
      description,
      details
    };
  }

  function buildSeoDraft() {
    const categorySlug = normalizeText(categoryInput && categoryInput.value) || "necklaces";
    const categoryName = getCategoryName(categorySlug);
    const draft = buildDraftFromContext();
    const productName = normalizeText(nameInput && nameInput.value) || draft.title;
    const productDescription = normalizeText(descriptionInput && descriptionInput.value) || draft.description;
    const colorNames = latestPhotoAnalysis && Array.isArray(latestPhotoAnalysis.colorNames)
      ? latestPhotoAnalysis.colorNames.filter(Boolean)
      : [];
    const colorPhrase = colorNames.length
      ? `${colorNames.slice(0, 2).join(" and ").toLowerCase()} tones`
      : "handmade detail";
    const categorySeo = {
      necklaces: {
        lead: "Kenyan beaded necklaces",
        keywords: ["kenyan beaded necklace", "maasai jewelry kenya", "handmade necklace kenya"],
        use: "weddings, gifting, and standout styling"
      },
      bracelets: {
        lead: "Kenyan beaded bracelets",
        keywords: ["kenyan beaded bracelet", "handmade bracelet kenya", "african bead bracelet"],
        use: "easy gifting, stacking, and everyday styling"
      },
      "home-decor": {
        lead: "Kenyan home decor",
        keywords: ["kenyan home decor", "african beaded decor", "handmade decor nairobi"],
        use: "warm interiors, housewarming gifts, and statement spaces"
      },
      "bags-accessories": {
        lead: "Kenyan beaded accessories",
        keywords: ["kenyan beaded accessories", "beaded bag kenya", "handmade accessories nairobi"],
        use: "daily carry, gifting, and standout accessories"
      },
      "gift-sets": {
        lead: "Handmade Kenyan gifts",
        keywords: ["handmade kenyan gifts", "kenyan gift set", "african bead gift set"],
        use: "birthdays, celebrations, and memorable gifting"
      },
      "bridal-occasion": {
        lead: "Kenyan bridal beadwork",
        keywords: ["bridal bead set kenya", "maasai bridal jewelry", "kenyan wedding accessories"],
        use: "weddings, ceremonies, and occasion styling"
      }
    };
    const seoConfig = categorySeo[categorySlug] || {
      lead: `${categoryName} in Kenya`,
      keywords: [`${categoryName.toLowerCase()} kenya`, `handmade ${categoryName.toLowerCase()}`, "sharoncraft kenya"],
      use: "gifting and easy WhatsApp ordering"
    };

    const candidateTitle = productName.toLowerCase().includes(seoConfig.lead.toLowerCase())
      ? `${productName} | SharonCraft`
      : `${productName} | ${seoConfig.lead} | SharonCraft`;
    const title = truncateText(candidateTitle, 68);
    const description = truncateText(
      `Shop ${productName} at SharonCraft. ${productDescription} Designed with ${colorPhrase} for ${seoConfig.use} in Kenya. Order easily on WhatsApp.`,
      170
    );
    const keywords = parseKeywords([
      productName,
      categoryName,
      seoConfig.lead,
      seoConfig.keywords.join(", "),
      colorNames.length ? `${colorNames[0].toLowerCase()} ${categoryName.toLowerCase()}` : "",
      "SharonCraft",
      "handmade in Kenya",
      "Nairobi gifts"
    ].join(", "));

    return {
      title,
      description,
      keywords
    };
  }

  function applySmartDraft(options) {
    const settings = options || {};
    const draft = buildDraftFromContext();

    if (!normalizeText(nameInput.value) || settings.force) {
      nameInput.value = draft.title;
    }
    if (!normalizeText(descriptionInput.value) || settings.force) {
      descriptionInput.value = draft.description;
    }
    if (!normalizeText(detailsInput.value) || settings.force) {
      detailsInput.value = draft.details.join(", ");
    }

    renderDraftPalette();
    applySeoDraft({ force: settings.force });
    setStatus(
      draftStatus,
      latestPhotoAnalysis && latestPhotoAnalysis.colorNames && latestPhotoAnalysis.colorNames.length
        ? `Draft built from ${latestPhotoAnalysis.colorNames.join(", ").toLowerCase()} color cues and the selected category.`
        : "Draft built from the selected category. Add or upload a photo first for color-led suggestions.",
      "success"
    );
  }

  function applySeoDraft(options) {
    const settings = options || {};
    const draft = buildSeoDraft();

    if (seoTitleInput && (!normalizeText(seoTitleInput.value) || settings.force)) {
      seoTitleInput.value = draft.title;
    }
    if (seoDescriptionInput && (!normalizeText(seoDescriptionInput.value) || settings.force)) {
      seoDescriptionInput.value = draft.description;
    }
    if (seoKeywordsInput && (!parseKeywords(seoKeywordsInput.value).length || settings.force)) {
      seoKeywordsInput.value = draft.keywords.join(", ");
    }

    updateSeoPreview();
    setStatus(
      seoStatus,
      `SEO copy built around ${getCategoryName(categoryInput && categoryInput.value).toLowerCase()} search intent${latestPhotoAnalysis && latestPhotoAnalysis.colorNames && latestPhotoAnalysis.colorNames.length ? ` and ${latestPhotoAnalysis.colorNames.join(", ").toLowerCase()} color cues` : ""}.`,
      "success"
    );
    return draft;
  }

  function loadFileImage(file) {
    return new Promise(function (resolve, reject) {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = function () {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("The photo could not be opened for resizing."));
      };
      image.src = objectUrl;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("The photo could not be compressed right now."));
      }, type, quality);
    });
  }

  async function optimizeImageForUpload(file) {
    const maxDimension = 1600;
    const quality = 0.82;
    const image = await loadFileImage(file);
    const width = image.naturalWidth || image.width || 0;
    const height = image.naturalHeight || image.height || 0;

    if (!width || !height) {
      return {
        file,
        originalSize: file.size || 0,
        optimizedSize: file.size || 0,
        compressed: false
      };
    }

    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return {
        file,
        originalSize: file.size || 0,
        optimizedSize: file.size || 0,
        compressed: false
      };
    }

    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await canvasToBlob(canvas, outputType, quality);
    const extension = outputType === "image/png" ? ".png" : ".jpg";
    const baseName = normalizeText(file.name).replace(/\.[a-z0-9]+$/i, "") || "product-photo";
    const optimizedFile = new File([blob], `${baseName}-optimized${extension}`, {
      type: outputType,
      lastModified: Date.now()
    });

    const originalSize = file.size || 0;
    const optimizedSize = optimizedFile.size || 0;
    const compressed = optimizedSize > 0 && optimizedSize < originalSize;

    return {
      file: optimizedFile,
      originalSize,
      optimizedSize,
      compressed,
      width: targetWidth,
      height: targetHeight
    };
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
      latestPhotoAnalysis = await analyzeImageColors(file);
      renderDraftPalette();
      setStatus(uploadStatus, `Optimizing ${file.name} for faster upload...`, "info");
      const optimized = await optimizeImageForUpload(file);
      const fileToUpload = optimized && optimized.file ? optimized.file : file;
      const sizeSummary = optimized
        ? `${formatBytes(optimized.originalSize)} to ${formatBytes(optimized.optimizedSize)}`
        : formatBytes(file.size || 0);

      setStatus(uploadStatus, `Uploading optimized photo (${sizeSummary})...`, "info");
      const uploaded = await catalogApi.uploadProductImage(fileToUpload);
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
        setStatus(
          uploadStatus,
          optimized && optimized.compressed
            ? `Photo compressed from ${formatBytes(optimized.originalSize)} to ${formatBytes(optimized.optimizedSize)} and added to the gallery.`
            : `Photo uploaded at ${formatBytes((optimized && optimized.optimizedSize) || file.size || 0)} and added to the gallery.`,
          "success"
        );
      } else {
        imageInput.value = publicUrl;
        setStatus(
          uploadStatus,
          optimized && optimized.compressed
            ? `Photo compressed from ${formatBytes(optimized.originalSize)} to ${formatBytes(optimized.optimizedSize)} and set as the main image.`
            : `Photo uploaded at ${formatBytes((optimized && optimized.optimizedSize) || file.size || 0)} and set as the main image.`,
          "success"
        );
      }

      if (!normalizeText(nameInput.value) || !normalizeText(descriptionInput.value)) {
        applySmartDraft({ force: false });
      } else if (latestPhotoAnalysis && latestPhotoAnalysis.colorNames && latestPhotoAnalysis.colorNames.length) {
        setStatus(
          draftStatus,
          `Photo colors detected: ${latestPhotoAnalysis.colorNames.join(", ")}. Tap Generate Smart Draft any time to refresh the title and description.`,
          "info"
        );
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

  async function loadSeoOverrides() {
    if (!catalogApi || typeof catalogApi.fetchSetting !== "function") {
      productSeoOverrides = {};
      return productSeoOverrides;
    }

    try {
      const value = await catalogApi.fetchSetting("product_seo_overrides");
      productSeoOverrides = value && typeof value === "object" ? value : {};
    } catch (error) {
      console.warn("Could not load product SEO overrides.", error);
      productSeoOverrides = {};
    }

    return productSeoOverrides;
  }

  async function saveSeoOverride(productId) {
    if (!catalogApi || typeof catalogApi.saveSetting !== "function") {
      return false;
    }

    const normalizedId = normalizeText(productId);
    if (!normalizedId) {
      return false;
    }

    const seo = readSeoFields();
    const nextOverrides = {
      ...(productSeoOverrides && typeof productSeoOverrides === "object" ? productSeoOverrides : {})
    };

    if (seo.title || seo.description || seo.keywords.length) {
      nextOverrides[normalizedId] = {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        updatedAt: new Date().toISOString()
      };
    } else {
      delete nextOverrides[normalizedId];
    }

    await catalogApi.saveSetting("product_seo_overrides", nextOverrides);
    productSeoOverrides = nextOverrides;
    return true;
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

    if (!hasSeoFields()) {
      applySeoDraft({ force: false });
    }

    const nextProducts = existingProduct
      ? products.map(function (product) {
          return normalizeText(product.id) === existingId ? payload : product;
        })
      : [payload].concat(products);

    setStatus(appStatus, "Saving product to the live catalog...", "info");
    await catalogApi.saveProducts(nextProducts);
    let seoSaved = true;
    try {
      await saveSeoOverride(payload.id);
    } catch (error) {
      seoSaved = false;
      console.warn("Product saved but SEO overrides could not be synced.", error);
    }
    products = nextProducts;
    resetForm();
    renderProducts();
    setStatus(
      appStatus,
      seoSaved
        ? `${payload.name} is live in the catalog, and its SEO copy is synced.`
        : `${payload.name} is live in the catalog, but its SEO override could not sync right now.`,
      seoSaved ? "success" : "info"
    );
    activateTab("catalog");
  }

  async function enterApp(user) {
    currentUser = user;
    authView.hidden = true;
    appView.hidden = false;
    userCopy.textContent = normalizeText(user.email) || "Signed in as admin";
    liveChip.textContent = "Live Supabase";
    populateCategorySelect();
    await loadSeoOverrides();
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
        await loadSeoOverrides();
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

  if (generateDraftButton) {
    generateDraftButton.addEventListener("click", function () {
      applySmartDraft({ force: true });
    });
  }

  if (generateSeoButton) {
    generateSeoButton.addEventListener("click", function () {
      applySeoDraft({ force: true });
    });
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

  [nameInput, categoryInput, descriptionInput, productIdInput].forEach(function (field) {
    if (!field) {
      return;
    }
    field.addEventListener("input", updateSeoPreview);
    field.addEventListener("change", updateSeoPreview);
  });

  [seoTitleInput, seoDescriptionInput, seoKeywordsInput].forEach(function (field) {
    if (!field) {
      return;
    }
    field.addEventListener("input", updateSeoPreview);
    field.addEventListener("change", updateSeoPreview);
  });

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
