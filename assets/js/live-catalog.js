document.addEventListener("DOMContentLoaded", function () {
  const mounts = Array.from(document.querySelectorAll("[data-live-catalog]"));
  if (!mounts.length) {
    return;
  }

  const utils = window.SharonCraftUtils || {};
  const staticProducts = utils.data && Array.isArray(utils.data.products)
    ? utils.data.products
    : [];
  const stateNodes = document.querySelectorAll("[data-live-state]");
  const countNodes = document.querySelectorAll("[data-live-count]");
  const updatedNodes = document.querySelectorAll("[data-live-updated]");
  const fallbackWhatsapp = "254112222572";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatCurrency(value) {
    if (utils.formatCurrency) {
      return utils.formatCurrency(value);
    }

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function formatShortDate(value) {
    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) {
      return "Recently updated";
    }

    return new Intl.DateTimeFormat("en-KE", {
      day: "numeric",
      month: "short"
    }).format(new Date(timestamp));
  }

  function isFutureDate(value) {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && timestamp > Date.now();
  }

  function truncate(value, maxLength) {
    const text = normalizeText(value);
    if (!text || text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength - 1).trim()}...`;
  }

  function buildWhatsAppUrl(message) {
    if (utils.buildWhatsAppUrl) {
      return utils.buildWhatsAppUrl(message);
    }

    return `https://wa.me/${fallbackWhatsapp}?text=${encodeURIComponent(message)}`;
  }

  function mapStaticProduct(product) {
    return {
      id: normalizeText(product && product.id),
      image: normalizeText(product && product.images && product.images[0]),
      name: normalizeText(product && product.name),
      price: Number(product && product.price) || 0,
      material: normalizeText(product && product.category).replace(/-/g, " ") || "collection",
      story: normalizeText(product && (product.shortDescription || product.description)),
      specs: Array.isArray(product && product.details) ? product.details.filter(Boolean) : [],
      gallery: Array.isArray(product && product.images) ? product.images.filter(Boolean) : [],
      soldOut: false,
      spotlightUntil: product && product.featured ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : "",
      spotlightText: normalizeText(product && product.badge) || "Website Pick",
      updatedAt: "",
      newUntil: product && product.newArrival ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : "",
      catalogSource: "website"
    };
  }

  function normalizeLiveProduct(product) {
    const normalized = {
      id: normalizeText(product && product.id),
      image: normalizeText(product && product.image),
      name: normalizeText(product && product.name),
      price: Number(product && product.price) || 0,
      basePrice:
        product &&
        product.basePrice !== null &&
        product.basePrice !== "" &&
        typeof product.basePrice !== "undefined" &&
        Number.isFinite(Number(product.basePrice))
          ? Math.max(0, Number(product.basePrice))
          : null,
      pricingMode: normalizeText(product && product.pricingMode),
      material: normalizeText(product && product.material) || "handmade",
      story: normalizeText(product && product.story),
      specs: Array.isArray(product && product.specs) ? product.specs.filter(Boolean) : [],
      gallery: Array.isArray(product && product.gallery) ? product.gallery.filter(Boolean) : [],
      soldOut: Boolean(product && product.soldOut),
      spotlightUntil: normalizeText(product && product.spotlightUntil),
      spotlightText: normalizeText(product && product.spotlightText),
      updatedAt: normalizeText(product && product.updatedAt),
      newUntil: normalizeText(product && product.newUntil),
      catalogSource: "live"
    };

    return typeof utils.applyPricingToProduct === "function"
      ? utils.applyPricingToProduct(normalized)
      : normalized;
  }

  function buildPrimaryMessage(product) {
    return `Hello SharonCraft, I would like to order the ${product.name} for ${formatCurrency(product.price)}.`;
  }

  function buildSecondaryMessage(product) {
    return `Hello SharonCraft, I would like more details about the ${product.name} and whether it can be customized.`;
  }

  function getBadges(product) {
    const badges = [];

    if (product.catalogSource === "live") {
      badges.push('<span class="badge badge-teal">Live</span>');
    } else {
      badges.push('<span class="badge badge-ochre">Website Pick</span>');
    }

    if (product.soldOut) {
      badges.push('<span class="badge badge-coral">Sold Out</span>');
    } else if (isFutureDate(product.spotlightUntil)) {
      badges.push(`<span class="badge badge-coral">${escapeHtml(product.spotlightText || "Spotlight")}</span>`);
    } else if (isFutureDate(product.newUntil)) {
      badges.push('<span class="badge badge-teal">New</span>');
    }

    return badges.join("");
  }

  function renderMeta(stateText, count, updatedText) {
    stateNodes.forEach(function (node) {
      node.textContent = stateText;
    });
    countNodes.forEach(function (node) {
      node.textContent = String(count);
    });
    updatedNodes.forEach(function (node) {
      node.textContent = updatedText;
    });
  }

  function buildEmptyState(title, body) {
    return `
      <article class="empty-state-card reveal">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(body)}</p>
      </article>
    `;
  }

  function buildCard(product) {
    const galleryCount = product.gallery.length || (product.image ? 1 : 0);
    const story = truncate(product.story || "Handmade by SharonCraft artisans.", 120);

    return `
      <article class="product-card live-product-card">
        <div class="product-card-media">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" fetchpriority="low" />
          <div class="live-product-badge-row">
            ${getBadges(product)}
          </div>
        </div>
        <div class="product-card-body">
          <div class="product-card-topline">
            <p class="product-card-category">${escapeHtml(product.material)}</p>
            <span class="live-price-chip">${escapeHtml(formatCurrency(product.price))}</span>
          </div>
          <h3>${escapeHtml(product.name)}</h3>
          <p class="product-card-text live-product-story">${escapeHtml(story)}</p>
          <div class="live-product-meta">
            <span>${product.specs.length} details</span>
            <span>${galleryCount} photo${galleryCount === 1 ? "" : "s"}</span>
            <span>${escapeHtml(formatShortDate(product.updatedAt))}</span>
          </div>
          <div class="product-card-actions">
            <a class="button button-primary" href="${buildWhatsAppUrl(buildPrimaryMessage(product))}" target="_blank" rel="noreferrer">Order on WhatsApp</a>
            <a class="button button-secondary" href="${buildWhatsAppUrl(buildSecondaryMessage(product))}" target="_blank" rel="noreferrer">Ask for Details</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderProducts(products) {
    mounts.forEach(function (mount) {
      const limit = Number(mount.dataset.limit) || 4;
      const items = products.slice(0, limit);

      if (!items.length) {
        mount.innerHTML = buildEmptyState(
          "No products to show yet",
          "The live catalog is ready, but there are no visible products in the current feed."
        );
        return;
      }

      mount.innerHTML = items.map(buildCard).join("");
    });

    if (utils.refreshReveal) {
      utils.refreshReveal();
    }
  }

  function renderLoadingState() {
    mounts.forEach(function (mount) {
      mount.innerHTML = buildEmptyState(
        "Loading live catalog",
        "Checking Supabase for the latest SharonCraft products."
      );
    });
  }

  async function initLiveCatalog() {
    renderLoadingState();

    const liveCatalog = window.SharonCraftCatalog;
    const fallbackProducts = staticProducts.map(mapStaticProduct).filter(function (product) {
      return product.image && product.name;
    });

    if (!liveCatalog || typeof liveCatalog.fetchProducts !== "function" || !liveCatalog.isConfigured()) {
      renderProducts(fallbackProducts);
      renderMeta("Website catalog in view", fallbackProducts.length, "Supabase is not active on this page yet");
      return;
    }

    try {
      const products = await liveCatalog.fetchProducts();
      const liveProducts = (Array.isArray(products) ? products : [])
        .map(normalizeLiveProduct)
        .filter(function (product) {
          return product.image && product.name;
        });

      if (!liveProducts.length) {
        renderProducts(fallbackProducts);
        renderMeta("Supabase connected", 0, "No live products were returned, so website picks are showing");
        return;
      }

      renderProducts(liveProducts);
      renderMeta("Supabase live", liveProducts.length, `Last product refresh: ${formatShortDate(liveProducts[0].updatedAt)}`);
    } catch (error) {
      console.error("Unable to load live Supabase products.", error);
      renderProducts(fallbackProducts);
      renderMeta("Live sync unavailable", fallbackProducts.length, "Showing website picks while Supabase reconnects");
    }
  }

  initLiveCatalog();
});
