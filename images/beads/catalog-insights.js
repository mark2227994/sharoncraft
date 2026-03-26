(function () {
  const METRICS_STORAGE_KEY = "sharoncraft_metrics_v1";
  const METRICS_EVENT = "sharoncraft:metrics-updated";

  const normalizeText = (value) => String(value || "").trim();

  const slugify = (value) =>
    normalizeText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

  const buildProductId = (product) => {
    const explicitId = slugify(product && product.id);
    if (explicitId) {
      return explicitId;
    }

    const seededId = slugify(`${product && product.name} ${product && product.image}`);
    return seededId ? `product-${seededId}` : `product-${Date.now()}`;
  };

  const sanitizeMetricEntry = (entry) => {
    const whatsappClicks = Number(entry && entry.whatsappClicks);
    const unitsSold = Number(entry && entry.unitsSold);
    const revenue = Number(entry && entry.revenue);

    return {
      whatsappClicks: Number.isFinite(whatsappClicks) ? whatsappClicks : 0,
      unitsSold: Number.isFinite(unitsSold) ? unitsSold : 0,
      revenue: Number.isFinite(revenue) ? revenue : 0,
      lastInterestAt: normalizeText(entry && entry.lastInterestAt),
      lastPurchaseAt: normalizeText(entry && entry.lastPurchaseAt),
    };
  };

  const sanitizeMetricsState = (state) => {
    const nextState = state && typeof state === "object" ? state : {};
    const products = {};
    const rawProducts = nextState.products && typeof nextState.products === "object" ? nextState.products : {};

    Object.keys(rawProducts).forEach((productId) => {
      products[productId] = sanitizeMetricEntry(rawProducts[productId]);
    });

    return {
      global: sanitizeMetricEntry(nextState.global),
      products,
    };
  };

  const readMetricsState = () => {
    try {
      const raw = localStorage.getItem(METRICS_STORAGE_KEY);
      if (!raw) {
        return sanitizeMetricsState({});
      }
      return sanitizeMetricsState(JSON.parse(raw));
    } catch (error) {
      console.warn("Unable to read SharonCraft metrics", error);
      return sanitizeMetricsState({});
    }
  };

  const writeMetricsState = (state) => {
    const sanitized = sanitizeMetricsState(state);
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent(METRICS_EVENT, { detail: sanitized }));
    return sanitized;
  };

  const updateMetricsState = (updater) => {
    const current = readMetricsState();
    const draft = sanitizeMetricsState(current);
    const result = updater(draft) || draft;
    return writeMetricsState(result);
  };

  const ensureProductMetrics = (state, productId) => {
    const id = normalizeText(productId);
    if (!id) {
      return sanitizeMetricEntry({});
    }

    if (!state.products[id]) {
      state.products[id] = sanitizeMetricEntry({});
    }

    return state.products[id];
  };

  const recordWhatsAppClick = (product) => {
    const productId = buildProductId(product);
    return updateMetricsState((state) => {
      const productMetrics = ensureProductMetrics(state, productId);
      const timestamp = new Date().toISOString();

      productMetrics.whatsappClicks += 1;
      productMetrics.lastInterestAt = timestamp;
      state.global.whatsappClicks += 1;
      state.global.lastInterestAt = timestamp;
      return state;
    });
  };

  const confirmPurchase = (product, quantity) => {
    const productId = buildProductId(product);
    const qty = Math.max(1, Math.round(Number(quantity) || 1));
    const unitPrice = Number(product && product.price);
    const revenueDelta = (Number.isFinite(unitPrice) ? unitPrice : 0) * qty;

    return updateMetricsState((state) => {
      const productMetrics = ensureProductMetrics(state, productId);
      const timestamp = new Date().toISOString();

      productMetrics.unitsSold += qty;
      productMetrics.revenue += revenueDelta;
      productMetrics.lastPurchaseAt = timestamp;

      state.global.unitsSold += qty;
      state.global.revenue += revenueDelta;
      state.global.lastPurchaseAt = timestamp;
      return state;
    });
  };

  const getProductMetrics = (productId) => {
    const state = readMetricsState();
    return sanitizeMetricEntry(state.products[normalizeText(productId)]);
  };

  const getSummary = (products) => {
    const state = readMetricsState();
    const productList = Array.isArray(products) ? products : [];
    const soldOutCount = productList.filter((product) => Boolean(product && product.soldOut)).length;

    return {
      revenue: state.global.revenue,
      unitsSold: state.global.unitsSold,
      whatsappClicks: state.global.whatsappClicks,
      soldOutCount,
    };
  };

  const subscribe = (callback) => {
    const run = () => {
      callback(readMetricsState());
    };

    const onStorage = (event) => {
      if (event.key === METRICS_STORAGE_KEY) {
        run();
      }
    };

    const onCustomEvent = () => {
      run();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(METRICS_EVENT, onCustomEvent);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(METRICS_EVENT, onCustomEvent);
    };
  };

  window.SharonCraftInsights = {
    METRICS_STORAGE_KEY,
    buildProductId,
    readMetricsState,
    writeMetricsState,
    recordWhatsAppClick,
    confirmPurchase,
    getProductMetrics,
    getSummary,
    subscribe,
  };
})();
