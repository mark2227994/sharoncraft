(function () {
  // Shared storefront helpers for layout, formatting, cart state, and reusable rendering.
  const data = window.SharonCraftData;
  const categoryMap = new Map((data.categories || []).map((category) => [category.slug, category]));
  const cartStorageKey = "sharoncraft-cart";
  const wishlistStorageKey = "sharoncraft-wishlist";
  const timerStorageKey = "sharoncraft-cart-timer";
  const analyticsStorageKey = "sharoncraft-analytics-events";
  const analyticsQueueStorageKey = "sharoncraft-analytics-queue";
  const analyticsVisitorKey = "sharoncraft-analytics-visitor-id";
  const analyticsSessionKey = "sharoncraft-analytics-session-id";
  const analyticsAcquisitionKey = "sharoncraft-analytics-acquisition";
  const analyticsDebugKey = "sharoncraft-ga-debug";
  const cookieConsentStorageKey = "sharoncraft-cookie-consent";
  const cookieConsentVersion = "2026-04-07";
  const approvedReviewsCacheKey = "sharoncraft-approved-reviews-cache";
  const storageConfig = window.SharonCraftStorage || {};
  const siteContentSettingsKey = storageConfig.siteContentSettingsKey || "sharoncraft-site-content";
  const liveSiteContentCacheKey = storageConfig.liveSiteContentCacheKey || "sharoncraft-live-site-content-cache";
  let cartTimerInterval = null;
  let analyticsEventsBound = false;
  let gaLoadPromise = null;
  let analyticsFlushPromise = null;
  let analyticsFlushTimer = null;
  let mpesaProfilePromise = null;
  let mpesaStatusPollTimer = null;
  let mpesaStatusPollStartedAt = 0;
  let mpesaLastReference = "";
  let cartEventsBound = false;
  let approvedReviews = [];
  let reviewSummaryMap = new Map();
  let reviewSummaryPromise = null;
  const recentAnalyticsInteractions = new Map();
  const recentListViews = new Map();
  const analyticsDebugState = {
    enabled: false,
    panel: null,
    status: "idle",
    note: "",
    lastEvent: "",
    lastEventAt: "",
    lastGtagHit: "",
    lastGtagHitAt: ""
  };
  let cookieConsent = null;
  const cookieConsentState = {
    root: null,
    banner: null,
    dialog: null,
    overlay: null,
    analyticsToggle: null,
    status: null,
    dialogOpen: false
  };
  let siteContentOverrides = null;
  const pricingUtils = window.SharonCraftPricing || {};

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function buildAssetVersion(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
      return "";
    }

    const parsedTime = Date.parse(normalized);
    if (Number.isFinite(parsedTime) && parsedTime > 0) {
      return parsedTime.toString(36);
    }

    return normalized.replace(/[^a-z0-9]+/gi, "").toLowerCase();
  }

  function addAssetVersion(url, versionValue) {
    const source = normalizeText(url);
    const version = buildAssetVersion(versionValue);

    if (!source || !version || source.startsWith("data:") || source.startsWith("blob:")) {
      return source;
    }

    return `${source}${source.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
  }

  function shouldUseMobilePerformanceMode() {
    const compactViewport = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
    const limitedCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;
    const limitedMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory > 0 && navigator.deviceMemory <= 4;
    const saveDataEnabled = Boolean(navigator.connection && navigator.connection.saveData);
    return compactViewport || limitedCpu || limitedMemory || saveDataEnabled;
  }

  function ensureMobilePerformanceStyles() {
    if (!document || !document.head || !shouldUseMobilePerformanceMode()) {
      return;
    }

    if (document.head.querySelector('link[data-mobile-performance-style="true"]')) {
      return;
    }

    const baseStyle = document.querySelector('link[href*="assets/css/style.css"]');
    const mobilePerformanceHref = baseStyle
      ? String(baseStyle.getAttribute("href") || "").replace(/style\.css[^?#]*/i, "mobile-performance.css")
      : "assets/css/mobile-performance.css?v=20260407-mobile-perf";
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = mobilePerformanceHref.includes("?")
      ? `${mobilePerformanceHref}&mobile_perf=20260407`
      : `${mobilePerformanceHref}?mobile_perf=20260407`;
    style.setAttribute("data-mobile-performance-style", "true");
    document.head.appendChild(style);

    if (document.documentElement) {
      document.documentElement.classList.add("mobile-performance-mode");
    }
  }

  function getDefaultCookieConsent() {
    return {
      version: cookieConsentVersion,
      essential: true,
      analytics: null,
      updatedAt: ""
    };
  }

  function normalizeCookieConsent(value) {
    const source = value && typeof value === "object" ? value : {};
    const analytics = source.analytics === true ? true : source.analytics === false ? false : null;
    return {
      version: normalizeText(source.version) || cookieConsentVersion,
      essential: true,
      analytics,
      updatedAt: normalizeText(source.updatedAt)
    };
  }

  function getCookieConsent() {
    if (cookieConsent) {
      return cookieConsent;
    }

    try {
      cookieConsent = normalizeCookieConsent(JSON.parse(window.localStorage.getItem(cookieConsentStorageKey) || "null"));
      return cookieConsent;
    } catch (error) {
      cookieConsent = getDefaultCookieConsent();
      return cookieConsent;
    }
  }

  function hasCookieConsentDecision() {
    return typeof getCookieConsent().analytics === "boolean";
  }

  function isAnalyticsConsentGranted() {
    return getCookieConsent().analytics === true;
  }

  function persistCookieConsent(nextConsent) {
    cookieConsent = normalizeCookieConsent({
      ...nextConsent,
      version: cookieConsentVersion,
      updatedAt: new Date().toISOString()
    });

    try {
      window.localStorage.setItem(cookieConsentStorageKey, JSON.stringify(cookieConsent));
    } catch (error) {
      console.warn("Unable to store cookie consent locally.", error);
    }

    return cookieConsent;
  }

  function removeStorageKey(storageArea, key) {
    try {
      storageArea.removeItem(key);
    } catch (error) {
      // Ignore browser storage limitations.
    }
  }

  function clearAnalyticsCookies() {
    const cookiePairs = normalizeText(document.cookie)
      .split(";")
      .map((entry) => normalizeText(entry.split("=")[0]))
      .filter((name) => /^_ga($|_)/i.test(name) || /^_gid$/i.test(name) || /^_gat/i.test(name) || /^_gac_/i.test(name));
    const cookieNames = cookiePairs.filter((name, index) => cookiePairs.indexOf(name) === index);
    const hostname = normalizeText(window.location.hostname);
    const domainCandidates = ["", hostname, hostname ? `.${hostname}` : ""].filter((value, index, list) => value || index === 0).filter((value, index, list) => list.indexOf(value) === index);

    cookieNames.forEach((name) => {
      domainCandidates.forEach((domain) => {
        const domainSegment = domain ? `; domain=${domain}` : "";
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainSegment}`;
      });
    });
  }

  function clearAnalyticsLocalState() {
    removeStorageKey(window.localStorage, analyticsStorageKey);
    removeStorageKey(window.localStorage, analyticsQueueStorageKey);
    removeStorageKey(window.localStorage, analyticsVisitorKey);
    removeStorageKey(window.sessionStorage, analyticsSessionKey);
    removeStorageKey(window.sessionStorage, analyticsAcquisitionKey);
    recentAnalyticsInteractions.clear();
    recentListViews.clear();
    clearAnalyticsCookies();
  }

  function setGa4Disabled(disabled) {
    const config = getAnalyticsConfig();
    if (config.ga4MeasurementId) {
      window[`ga-disable-${config.ga4MeasurementId}`] = !!disabled;
    }
  }

  function syncAnalyticsConsentWithGoogle() {
    const granted = isAnalyticsConsentGranted();
    setGa4Disabled(!granted);

    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied"
      });
    }
  }

  function closeCookieSettings() {
    cookieConsentState.dialogOpen = false;
    if (document.body) {
      document.body.classList.remove("cookie-consent-dialog-open");
    }
    updateCookieConsentUi();
  }

  function openCookieSettings() {
    ensureCookieConsentUi();
    cookieConsentState.dialogOpen = true;
    if (document.body) {
      document.body.classList.add("cookie-consent-dialog-open");
    }
    updateCookieConsentUi();
  }

  function getCookieConsentStatusText(consent) {
    if (consent.analytics === true) {
      return "Analytics is currently on. Essential storage stays on to support cart, checkout, sign-in, and saved preferences.";
    }

    if (consent.analytics === false) {
      return "Analytics is currently off. Essential storage stays on to support cart, checkout, sign-in, and saved preferences.";
    }

    return "No analytics choice has been saved yet. Essential storage stays on because the shop needs it to work properly.";
  }

  function updateCookieConsentUi() {
    if (!cookieConsentState.root) {
      return;
    }

    const consent = getCookieConsent();
    const undecided = !hasCookieConsentDecision();
    const dialogOpen = !!cookieConsentState.dialogOpen;

    if (cookieConsentState.banner) {
      cookieConsentState.banner.hidden = !undecided || dialogOpen;
    }

    if (cookieConsentState.overlay) {
      cookieConsentState.overlay.hidden = !dialogOpen;
    }

    if (cookieConsentState.dialog) {
      cookieConsentState.dialog.hidden = !dialogOpen;
    }

    if (cookieConsentState.analyticsToggle) {
      cookieConsentState.analyticsToggle.checked = consent.analytics === true;
    }

    if (cookieConsentState.status) {
      cookieConsentState.status.textContent = getCookieConsentStatusText(consent);
    }
  }

  function bindCookieSettingsTriggers(scope) {
    if (!scope || typeof scope.querySelectorAll !== "function") {
      return;
    }

    scope.querySelectorAll("[data-open-cookie-settings]").forEach((button) => {
      if (button.dataset.cookieSettingsBound === "true") {
        return;
      }

      button.dataset.cookieSettingsBound = "true";
      button.addEventListener("click", function (event) {
        event.preventDefault();
        openCookieSettings();
      });
    });
  }

  function applyCookieConsentChoice(analyticsEnabled) {
    const previousConsent = getCookieConsent().analytics;
    persistCookieConsent({ analytics: !!analyticsEnabled });
    syncAnalyticsConsentWithGoogle();

    if (!analyticsEnabled) {
      clearAnalyticsLocalState();
      analyticsDebugState.note = "Analytics is off until a visitor opts in.";
    } else if (previousConsent !== true) {
      analyticsDebugState.note = "Analytics was enabled from the consent banner.";
    }

    closeCookieSettings();
    updateAnalyticsDebugPanel();

    if (!analyticsEnabled) {
      return;
    }

    scheduleAnalyticsFlush(200);

    if (previousConsent !== true) {
      trackEvent("page_view", {
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }

  function ensureCookieConsentUi() {
    if (!document.body) {
      return;
    }

    if (cookieConsentState.root) {
      updateCookieConsentUi();
      return;
    }

    const root = document.createElement("div");
    root.className = "cookie-consent-root";
    root.innerHTML = `
      <section class="cookie-consent-banner" aria-label="Cookie consent" hidden>
        <div class="cookie-consent-copy">
          <span class="section-kicker">Privacy choices</span>
          <h2>Choose how SharonCraft uses cookies and browser storage.</h2>
          <p>Essential storage keeps your cart, checkout, sign-in, and saved preferences working. Analytics helps us understand which pages and products are useful, but it stays off until you allow it.</p>
        </div>
        <div class="cookie-consent-actions">
          <button class="button button-secondary" type="button" data-cookie-consent-action="reject">Reject non-essential</button>
          <button class="button button-secondary" type="button" data-cookie-consent-action="manage">Manage choices</button>
          <button class="button button-primary" type="button" data-cookie-consent-action="accept">Accept analytics</button>
        </div>
      </section>
      <div class="cookie-consent-overlay" hidden></div>
      <section class="cookie-consent-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title" hidden>
        <div class="cookie-consent-dialog-head">
          <div>
            <span class="section-kicker">Cookies & browser storage</span>
            <h2 id="cookie-consent-title">Manage your privacy choices</h2>
          </div>
          <button class="cookie-consent-close" type="button" aria-label="Close cookie settings" data-cookie-consent-action="close">Close</button>
        </div>
        <p class="cookie-consent-status" data-cookie-consent-status></p>
        <div class="cookie-consent-option-list">
          <label class="cookie-consent-option">
            <div class="cookie-consent-option-copy">
              <strong>Essential</strong>
              <p>Needed for your cart, sign-in, payment flow, and core site preferences.</p>
            </div>
            <span class="cookie-consent-pill is-required">Always on</span>
          </label>
          <label class="cookie-consent-option">
            <div class="cookie-consent-option-copy">
              <strong>Analytics</strong>
              <p>Lets SharonCraft measure page views, product interest, and site performance using first-party analytics and Google Analytics.</p>
            </div>
            <span class="cookie-consent-switch">
              <input type="checkbox" data-cookie-consent-analytics />
              <span aria-hidden="true"></span>
            </span>
          </label>
        </div>
        <div class="cookie-consent-dialog-actions">
          <button class="button button-secondary" type="button" data-cookie-consent-action="reject">Reject non-essential</button>
          <button class="button button-primary" type="button" data-cookie-consent-action="save">Save choices</button>
        </div>
      </section>
    `;

    document.body.appendChild(root);
    cookieConsentState.root = root;
    cookieConsentState.banner = root.querySelector(".cookie-consent-banner");
    cookieConsentState.dialog = root.querySelector(".cookie-consent-dialog");
    cookieConsentState.overlay = root.querySelector(".cookie-consent-overlay");
    cookieConsentState.analyticsToggle = root.querySelector("[data-cookie-consent-analytics]");
    cookieConsentState.status = root.querySelector("[data-cookie-consent-status]");

    root.addEventListener("click", function (event) {
      const actionTrigger = event.target.closest("[data-cookie-consent-action]");
      if (actionTrigger) {
        const action = normalizeText(actionTrigger.dataset.cookieConsentAction);

        if (action === "accept") {
          applyCookieConsentChoice(true);
          return;
        }

        if (action === "reject") {
          applyCookieConsentChoice(false);
          return;
        }

        if (action === "manage") {
          openCookieSettings();
          return;
        }

        if (action === "close") {
          closeCookieSettings();
          return;
        }

        if (action === "save") {
          applyCookieConsentChoice(cookieConsentState.analyticsToggle && cookieConsentState.analyticsToggle.checked);
        }
      }

      if (event.target === cookieConsentState.overlay) {
        closeCookieSettings();
      }
    });

    bindCookieSettingsTriggers(document);
    updateCookieConsentUi();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeWhatsAppNumber(value) {
    const digits = String(value || "").replace(/\D+/g, "");
    if (digits.startsWith("254")) {
      return digits;
    }
    if (digits.startsWith("0")) {
      return `254${digits.slice(1)}`;
    }
    return digits;
  }

  function clampRating(value) {
    return Math.max(1, Math.min(5, Number(value) || 5));
  }

  function normalizeReviewRecord(value) {
    const source = value && typeof value === "object" ? value : {};
    const reviewId = normalizeText(source.id || source.review_id || source.sourceId);

    return {
      id: reviewId || `review-${Date.now().toString(36)}`,
      sourceId: normalizeText(source.sourceId || source.review_id || source.id) || reviewId,
      productId: normalizeText(source.productId || source.product_id),
      productName: normalizeText(source.productName || source.product_name),
      author: normalizeText(source.author || source.review_author || source.name) || "SharonCraft client",
      location: normalizeText(source.location || source.review_location) || "Kenya",
      rating: clampRating(source.rating || source.review_rating),
      message: normalizeText(source.message || source.review_message),
      status: normalizeText(source.status || source.review_status || "approved") || "approved",
      createdAt: normalizeText(source.createdAt || source.created_at) || new Date().toISOString(),
      approvedAt: normalizeText(source.approvedAt || source.approved_at)
    };
  }

  function getCachedApprovedReviews() {
    try {
      const raw = window.localStorage.getItem(approvedReviewsCacheKey) || "[]";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeReviewRecord).filter((review) => review.productId && review.message) : [];
    } catch (error) {
      return [];
    }
  }

  function cacheApprovedReviews(reviews) {
    const safeReviews = (Array.isArray(reviews) ? reviews : [])
      .map(normalizeReviewRecord)
      .filter((review) => review.productId && review.message);

    try {
      window.localStorage.setItem(approvedReviewsCacheKey, JSON.stringify(safeReviews));
    } catch (error) {
      console.warn("Unable to cache approved reviews locally.", error);
    }
  }

  function buildReviewSummaryMap(reviews) {
    const summary = new Map();

    (Array.isArray(reviews) ? reviews : []).forEach((review) => {
      const normalizedReview = normalizeReviewRecord(review);
      if (!normalizedReview.productId || !normalizedReview.message) {
        return;
      }

      const existing = summary.get(normalizedReview.productId) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += clampRating(normalizedReview.rating);
      summary.set(normalizedReview.productId, existing);
    });

    summary.forEach((value, key) => {
      summary.set(key, {
        count: value.count,
        average: value.count ? value.total / value.count : 0
      });
    });

    return summary;
  }

  async function loadReviewSummaries(options) {
    const config = options || {};

    if (reviewSummaryPromise && !config.force) {
      return reviewSummaryPromise;
    }

    reviewSummaryPromise = (async function () {
      let reviews = getCachedApprovedReviews();
      const catalogApi = window.SharonCraftCatalog;

      if (
        catalogApi &&
        typeof catalogApi.isConfigured === "function" &&
        catalogApi.isConfigured() &&
        typeof catalogApi.fetchApprovedReviews === "function"
      ) {
        try {
          const remoteReviews = await catalogApi.fetchApprovedReviews();
          if (Array.isArray(remoteReviews)) {
            reviews = remoteReviews.map(normalizeReviewRecord).filter((review) => review.productId && review.message);
            cacheApprovedReviews(reviews);
          }
        } catch (error) {
          console.warn("Unable to load approved storefront reviews from Supabase.", error);
        }
      }

      approvedReviews = reviews;
      reviewSummaryMap = buildReviewSummaryMap(reviews);
      return reviewSummaryMap;
    }()).finally(function () {
      reviewSummaryPromise = null;
    });

    return reviewSummaryPromise;
  }

  function getApprovedReviewsForProduct(productId) {
    const targetId = normalizeText(productId);
    return approvedReviews
      .filter((review) => review.productId === targetId)
      .sort((left, right) => Date.parse(right.approvedAt || right.createdAt || "") - Date.parse(left.approvedAt || left.createdAt || ""));
  }

  function getProductReviewSummary(productId) {
    const targetId = normalizeText(productId);
    return reviewSummaryMap.get(targetId) || { count: 0, average: 0 };
  }

  function renderReviewStars(value) {
    const rating = Math.max(0, Math.min(5, Number(value) || 0));
    return Array.from({ length: 5 }, (_, index) => `<span aria-hidden="true">${index < rating ? "★" : "☆"}</span>`).join("");
  }

  function buildProductCardReviewMarkup(productId) {
    const summary = getProductReviewSummary(productId);

    if (!summary.count) {
      return `
        <div class="product-card-rating is-empty" aria-label="No approved reviews yet">
          <span class="product-card-rating-stars" aria-hidden="true">${renderReviewStars(0)}</span>
          <span class="product-card-rating-count">No reviews yet</span>
        </div>
      `;
    }

    return `
      <div class="product-card-rating" aria-label="${summary.average.toFixed(1)} out of 5 stars from ${summary.count} reviews">
        <span class="product-card-rating-stars" aria-hidden="true">${renderReviewStars(Math.round(summary.average))}</span>
        <strong>${summary.average.toFixed(1)}</strong>
        <span class="product-card-rating-count">(${summary.count})</span>
      </div>
    `;
  }

  function absoluteUrl(path) {
    const normalized = normalizeText(path);
    return new URL(normalized || window.location.pathname, window.location.origin).href;
  }

  function isTruthyFlag(value) {
    const normalized = normalizeText(value).toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
  }

  function isFalsyFlag(value) {
    const normalized = normalizeText(value).toLowerCase();
    return normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off";
  }

  function setAnalyticsDebugEnabled(enabled) {
    analyticsDebugState.enabled = !!enabled;

    try {
      if (enabled) {
        window.sessionStorage.setItem(analyticsDebugKey, "1");
      } else {
        window.sessionStorage.removeItem(analyticsDebugKey);
      }
    } catch (error) {
      // Ignore session storage limitations.
    }
  }

  function shouldShowAnalyticsDebug() {
    const url = new URL(window.location.href);
    const debugParam = normalizeText(url.searchParams.get("ga_debug"));

    if (isTruthyFlag(debugParam)) {
      setAnalyticsDebugEnabled(true);
      return true;
    }

    if (isFalsyFlag(debugParam)) {
      setAnalyticsDebugEnabled(false);
      return false;
    }

    try {
      return normalizeText(window.sessionStorage.getItem(analyticsDebugKey)) === "1";
    } catch (error) {
      return analyticsDebugState.enabled;
    }
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

  function generateAnalyticsId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function getPersistentAnalyticsId(storageArea, storageKey, prefix) {
    try {
      const existing = normalizeText(storageArea.getItem(storageKey));
      if (existing) {
        return existing;
      }

      const nextValue = generateAnalyticsId(prefix);
      storageArea.setItem(storageKey, nextValue);
      return nextValue;
    } catch (error) {
      return generateAnalyticsId(prefix);
    }
  }

  function getVisitorAnalyticsId() {
    return getPersistentAnalyticsId(window.localStorage, analyticsVisitorKey, "visitor");
  }

  function getSessionAnalyticsId() {
    return getPersistentAnalyticsId(window.sessionStorage, analyticsSessionKey, "session");
  }

  function getHostnameLabel(value) {
    const normalized = normalizeText(value).toLowerCase();
    return normalized.replace(/^www\./, "");
  }

  function classifyReferrerMedium(hostname) {
    const host = getHostnameLabel(hostname);

    if (!host) {
      return "direct";
    }

    if (/google\.|bing\.|yahoo\.|duckduckgo\.|baidu\.|yandex\./i.test(host)) {
      return "organic";
    }

    if (/facebook\.|instagram\.|tiktok\.|x\.com|twitter\.|pinterest\.|linkedin\./i.test(host)) {
      return "social";
    }

    if (/whatsapp\.|wa\.me|telegram\.|messenger\./i.test(host)) {
      return "messaging";
    }

    if (/mail\.|gmail\.|outlook\.|yahoo\./i.test(host)) {
      return "email";
    }

    return "referral";
  }

  function classifyReferrerSource(hostname) {
    const host = getHostnameLabel(hostname);

    if (!host) {
      return "Direct";
    }

    if (/google\./i.test(host)) return "Google";
    if (/bing\./i.test(host)) return "Bing";
    if (/instagram\./i.test(host)) return "Instagram";
    if (/facebook\./i.test(host)) return "Facebook";
    if (/tiktok\./i.test(host)) return "TikTok";
    if (/whatsapp\.|wa\.me/i.test(host)) return "WhatsApp";
    if (/linkedin\./i.test(host)) return "LinkedIn";
    if (/pinterest\./i.test(host)) return "Pinterest";
    if (/twitter\.|x\.com/i.test(host)) return "X";

    return host;
  }

  function buildAnalyticsAcquisition() {
    const url = new URL(window.location.href);
    const referrer = normalizeText(document.referrer);
    let referrerHost = "";
    if (referrer) {
      try {
        referrerHost = getHostnameLabel(new URL(referrer).hostname);
      } catch (error) {
        referrerHost = "";
      }
    }
    const utmSource = normalizeText(url.searchParams.get("utm_source"));
    const utmMedium = normalizeText(url.searchParams.get("utm_medium"));
    const utmCampaign = normalizeText(url.searchParams.get("utm_campaign"));
    const gclid = normalizeText(url.searchParams.get("gclid"));

    if (utmSource || utmMedium || utmCampaign) {
      return {
        source: utmSource || "Campaign",
        medium: utmMedium || "campaign",
        campaign: utmCampaign,
        referrerHost
      };
    }

    if (gclid) {
      return {
        source: "Google Ads",
        medium: "cpc",
        campaign: utmCampaign,
        referrerHost: referrerHost || "google.com"
      };
    }

    if (referrer && (!referrerHost || referrerHost !== getHostnameLabel(window.location.hostname))) {
      return {
        source: classifyReferrerSource(referrerHost),
        medium: classifyReferrerMedium(referrerHost),
        campaign: "",
        referrerHost
      };
    }

    return {
      source: "Direct",
      medium: "direct",
      campaign: "",
      referrerHost
    };
  }

  function getAnalyticsAcquisition() {
    try {
      const stored = JSON.parse(window.sessionStorage.getItem(analyticsAcquisitionKey) || "null");
      if (stored && typeof stored === "object" && normalizeText(stored.source)) {
        return stored;
      }
    } catch (error) {
      // Ignore invalid session payloads and rebuild them.
    }

    const nextAcquisition = buildAnalyticsAcquisition();

    try {
      window.sessionStorage.setItem(analyticsAcquisitionKey, JSON.stringify(nextAcquisition));
    } catch (error) {
      console.warn("Unable to cache analytics acquisition data.", error);
    }

    return nextAcquisition;
  }

  function getQueuedAnalyticsEvents() {
    try {
      const raw = window.localStorage.getItem(analyticsQueueStorageKey) || "[]";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveQueuedAnalyticsEvents(events) {
    try {
      window.localStorage.setItem(analyticsQueueStorageKey, JSON.stringify(events.slice(-200)));
    } catch (error) {
      console.warn("Unable to cache queued analytics events.", error);
    }
  }

  function queueAnalyticsEvent(eventEntry) {
    const queued = getQueuedAnalyticsEvents();
    queued.push(eventEntry);
    saveQueuedAnalyticsEvents(queued);
  }

  async function flushAnalyticsQueue() {
    if (!isAnalyticsConsentGranted()) {
      return false;
    }

    const catalogApi = window.SharonCraftCatalog;
    if (
      !catalogApi ||
      typeof catalogApi.isConfigured !== "function" ||
      !catalogApi.isConfigured() ||
      typeof catalogApi.saveAnalyticsEvents !== "function"
    ) {
      return false;
    }

    if (analyticsFlushPromise) {
      return analyticsFlushPromise;
    }

    analyticsFlushPromise = (async function runAnalyticsFlush() {
      let queue = getQueuedAnalyticsEvents();
      if (!queue.length) {
        return false;
      }

      while (queue.length) {
        const batch = queue.slice(0, 20);

        try {
          await catalogApi.saveAnalyticsEvents(batch);
        } catch (error) {
          console.warn("Unable to sync storefront analytics to Supabase.", error);
          return false;
        }

        const sentIds = new Set(batch.map((event) => normalizeText(event && event.id)).filter(Boolean));
        queue = getQueuedAnalyticsEvents().filter((event) => !sentIds.has(normalizeText(event && event.id)));
        saveQueuedAnalyticsEvents(queue);
      }

      return true;
    }()).finally(function () {
      analyticsFlushPromise = null;
    });

    return analyticsFlushPromise;
  }

  function scheduleAnalyticsFlush(delay) {
    if (analyticsFlushTimer) {
      window.clearTimeout(analyticsFlushTimer);
    }

    analyticsFlushTimer = window.setTimeout(function () {
      analyticsFlushTimer = null;
      flushAnalyticsQueue();
    }, Math.max(0, Number(delay) || 0));
  }

  function shouldTrackAnalytics() {
    if (window.location.protocol === "file:") {
      return false;
    }

    const pathname = normalizeText(window.location.pathname).toLowerCase();
    const pageType = normalizeText(document.body && document.body.dataset && document.body.dataset.page).toLowerCase();

    if (pathname.endsWith("/admin.html") || pathname === "/admin.html" || pageType === "admin") {
      return false;
    }

    return isAnalyticsConsentGranted();
  }

  function getAnalyticsBlockReason() {
    if (window.location.protocol === "file:") {
      return "Blocked on local file previews. Use the live website URL.";
    }

    const pathname = normalizeText(window.location.pathname).toLowerCase();
    const pageType = normalizeText(document.body && document.body.dataset && document.body.dataset.page).toLowerCase();

    if (pathname.endsWith("/admin.html") || pathname === "/admin.html" || pageType === "admin") {
      return "Blocked on admin pages by design.";
    }

    if (!hasCookieConsentDecision()) {
      return "Blocked until the visitor chooses whether analytics cookies and browser storage can be used.";
    }

    if (!isAnalyticsConsentGranted()) {
      return "Blocked because the visitor rejected non-essential analytics storage.";
    }

    return "Tracking allowed on this page.";
  }

  function formatDebugTime(value) {
    const time = normalizeText(value);
    if (!time) {
      return "Not yet";
    }

    try {
      return new Date(time).toLocaleTimeString("en-KE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch (error) {
      return time;
    }
  }

  function buildAnalyticsDebugRow(label, value) {
    return `<div class="analytics-debug-row"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function updateAnalyticsDebugPanel() {
    if (!analyticsDebugState.enabled || !analyticsDebugState.panel) {
      return;
    }

    const config = getAnalyticsConfig();
    const trackingAllowed = shouldTrackAnalytics();
    const queueSize = getQueuedAnalyticsEvents().length;
    const dataLayerSize = Array.isArray(window.dataLayer) ? window.dataLayer.length : 0;
    const protocol = normalizeText(window.location.protocol || "").replace(":", "") || "unknown";
    const pageType = normalizeText(document.body && document.body.dataset && document.body.dataset.page) || "unknown";
    const reason = trackingAllowed ? "Tracking allowed on this page." : getAnalyticsBlockReason();

    analyticsDebugState.panel.innerHTML = `
      <div class="analytics-debug-head">
        <strong>GA Debug</strong>
        <span class="analytics-debug-badge analytics-debug-badge-${trackingAllowed ? "ok" : "warn"}">${trackingAllowed ? "Tracking On" : "Tracking Off"}</span>
      </div>
      <div class="analytics-debug-grid">
        ${buildAnalyticsDebugRow("Measurement ID", normalizeText(config.ga4MeasurementId) || "Missing")}
        ${buildAnalyticsDebugRow("GA Script", analyticsDebugState.status || "idle")}
        ${buildAnalyticsDebugRow("Page Type", pageType)}
        ${buildAnalyticsDebugRow("Protocol", protocol)}
        ${buildAnalyticsDebugRow("Queue", String(queueSize))}
        ${buildAnalyticsDebugRow("dataLayer", String(dataLayerSize))}
        ${buildAnalyticsDebugRow("Last Event", analyticsDebugState.lastEvent || "Not yet")}
        ${buildAnalyticsDebugRow("Last Event Time", formatDebugTime(analyticsDebugState.lastEventAt))}
        ${buildAnalyticsDebugRow("Last GA Hit", analyticsDebugState.lastGtagHit || "Not yet")}
        ${buildAnalyticsDebugRow("Last GA Hit Time", formatDebugTime(analyticsDebugState.lastGtagHitAt))}
      </div>
      <p class="analytics-debug-note">${analyticsDebugState.note || reason}</p>
      <p class="analytics-debug-hint">Append <code>?ga_debug=0</code> to hide this panel.</p>
    `;
  }

  function ensureAnalyticsDebugPanel() {
    if (!shouldShowAnalyticsDebug() || !document.body) {
      return;
    }

    analyticsDebugState.enabled = true;

    if (!analyticsDebugState.panel) {
      const panel = document.createElement("aside");
      panel.className = "analytics-debug-panel";
      document.body.appendChild(panel);
      analyticsDebugState.panel = panel;
    }

    updateAnalyticsDebugPanel();
  }

  function loadGa4IfNeeded() {
    if (!isAnalyticsConsentGranted()) {
      analyticsDebugState.status = "blocked_by_consent";
      analyticsDebugState.note = getAnalyticsBlockReason();
      updateAnalyticsDebugPanel();
      return Promise.resolve(false);
    }

    const config = getAnalyticsConfig();
    if (!config.ga4MeasurementId) {
      analyticsDebugState.status = "missing_id";
      analyticsDebugState.note = "No GA4 measurement ID is configured for this page.";
      updateAnalyticsDebugPanel();
      return Promise.resolve(false);
    }

    if (typeof window.gtag === "function") {
      analyticsDebugState.status = "ready";
      analyticsDebugState.note = "GA is already available on this page.";
      updateAnalyticsDebugPanel();
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
      setGa4Disabled(false);
      window.gtag("consent", "default", {
        analytics_storage: "granted"
      });
      window.gtag("js", new Date());
      window.gtag("config", config.ga4MeasurementId);
      analyticsDebugState.status = "loading";
      analyticsDebugState.note = `Loading Google Analytics for ${config.ga4MeasurementId}.`;
      updateAnalyticsDebugPanel();

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4MeasurementId)}`;
      script.setAttribute("data-ga4-loader", "true");
      script.addEventListener("load", function () {
        analyticsDebugState.status = "loaded";
        analyticsDebugState.note = `GA script loaded for ${config.ga4MeasurementId}.`;
        updateAnalyticsDebugPanel();
        resolve(true);
      });
      script.addEventListener("error", function () {
        analyticsDebugState.status = "error";
        analyticsDebugState.note = "GA script failed to load. This can happen with ad blockers or privacy settings.";
        updateAnalyticsDebugPanel();
        resolve(false);
      });
      document.head.appendChild(script);
    });

    return gaLoadPromise;
  }

  function trackEvent(name, payload) {
    const eventName = normalizeText(name);
    if (!eventName || !shouldTrackAnalytics()) {
      if (eventName) {
        analyticsDebugState.lastEvent = `${eventName} (blocked)`;
        analyticsDebugState.lastEventAt = new Date().toISOString();
        analyticsDebugState.note = getAnalyticsBlockReason();
        updateAnalyticsDebugPanel();
      }
      return;
    }

    const timestamp = new Date().toISOString();
    const acquisition = getAnalyticsAcquisition();
    const eventPayload = {
      page_type: document.body.dataset.page || "unknown",
      page_path: `${window.location.pathname}${window.location.search}`,
      page_title: document.title,
      visitor_id: getVisitorAnalyticsId(),
      session_id: getSessionAnalyticsId(),
      traffic_source: normalizeText(acquisition.source) || "Direct",
      traffic_medium: normalizeText(acquisition.medium) || "direct",
      traffic_campaign: normalizeText(acquisition.campaign),
      referrer_host: normalizeText(acquisition.referrerHost),
      ...payload
    };
    const eventEntry = {
      id: generateAnalyticsId("evt"),
      name: eventName,
      payload: eventPayload,
      timestamp
    };
    analyticsDebugState.lastEvent = eventName;
    analyticsDebugState.lastEventAt = timestamp;
    analyticsDebugState.note = `Queued ${eventName} for local + Supabase analytics.`;
    updateAnalyticsDebugPanel();

    const storedEvents = getStoredAnalyticsEvents();
    storedEvents.push(eventEntry);
    saveAnalyticsEvents(storedEvents);
    queueAnalyticsEvent(eventEntry);
    scheduleAnalyticsFlush(1200);

    loadGa4IfNeeded().then(function (loaded) {
      if (loaded && typeof window.gtag === "function") {
        if (eventName === "page_view") {
          analyticsDebugState.lastGtagHit = "page_view (auto config)";
          analyticsDebugState.lastGtagHitAt = new Date().toISOString();
          analyticsDebugState.note = "GA page view should be sent by the GA config call on this page.";
          updateAnalyticsDebugPanel();
          return;
        }
        window.gtag("event", eventName, eventPayload);
        analyticsDebugState.lastGtagHit = eventName;
        analyticsDebugState.lastGtagHitAt = new Date().toISOString();
        analyticsDebugState.note = `Sent ${eventName} to Google Analytics.`;
        updateAnalyticsDebugPanel();
      } else {
        analyticsDebugState.note = "The site queued the event, but GA was not available to receive it.";
        updateAnalyticsDebugPanel();
      }
    });
  }

  function buildAnalyticsItem(product, options) {
    const config = options || {};
    const category = getCategoryBySlug(product && product.category);

    return {
      item_id: normalizeText(product && product.id),
      item_name: normalizeText((product && product.name) || "SharonCraft product"),
      item_category: normalizeText(category && category.name) || "Collection",
      price: Number(product && product.price) || 0,
      currency: "KES",
      quantity: Math.max(1, Number(config.quantity) || 1),
      index: Number(config.index) || 0,
      item_list_id: normalizeText(config.listId),
      item_list_name: normalizeText(config.listName)
    };
  }

  function buildProductAnalyticsPayload(product, options) {
    const item = buildAnalyticsItem(product, options);

    return {
      currency: "KES",
      value: Number(item.price) || 0,
      items: [item]
    };
  }

  function trackProductListView(config) {
    const listId = normalizeText(config && config.listId);
    const listName = normalizeText(config && config.listName) || listId || "product_list";
    const products = Array.isArray(config && config.products) ? config.products : [];
    const items = products
      .map((product, index) => buildAnalyticsItem(product, { listId, listName, index: index + 1 }))
      .filter((item) => item.item_id);

    if (!items.length) {
      return;
    }

    const signature = JSON.stringify(items.map((item) => item.item_id));
    const viewKey = `${document.body.dataset.page || "unknown"}|${listId || listName}`;

    if (recentListViews.get(viewKey) === signature) {
      return;
    }

    recentListViews.set(viewKey, signature);

    trackEvent("view_item_list", {
      item_list_id: listId || listName,
      item_list_name: listName,
      items
    });
  }

  function trackProductSelection(link) {
    if (!link) {
      return;
    }

    const productId = normalizeText(link.dataset.productId);
    if (!productId) {
      return;
    }

    const interactionKey = [
      "select_item",
      productId,
      normalizeText(link.dataset.itemListId),
      normalizeText(link.dataset.itemListName)
    ].join("|");
    const now = Date.now();
    const lastTrackedAt = recentAnalyticsInteractions.get(interactionKey) || 0;

    if (now - lastTrackedAt < 1500) {
      return;
    }

    recentAnalyticsInteractions.set(interactionKey, now);

    const product = getProductById(productId);
    const item = buildAnalyticsItem(product || {
      id: productId,
      name: link.dataset.productName,
      category: link.dataset.productCategory,
      price: Number(link.dataset.productPrice) || 0
    }, {
      listId: link.dataset.itemListId,
      listName: link.dataset.itemListName,
      index: Number(link.dataset.itemIndex) || 0
    });

    trackEvent("select_item", {
      item_list_id: normalizeText(link.dataset.itemListId) || normalizeText(link.dataset.itemListName),
      item_list_name: normalizeText(link.dataset.itemListName) || normalizeText(link.dataset.itemListId),
      items: [item],
      transport_type: "beacon"
    });
  }

  function trackWhatsAppInteraction(link) {
    if (!link) {
      return;
    }

    const href = normalizeText(link.href);
    if (!href || !/wa\.me\//i.test(href)) {
      return;
    }

    const interactionKey = [
      href,
      normalizeText(link.dataset.analyticsLabel || link.textContent || "WhatsApp"),
      normalizeText(link.dataset.productId),
      normalizeText(link.dataset.productName)
    ].join("|");
    const now = Date.now();
    const lastTrackedAt = recentAnalyticsInteractions.get(interactionKey) || 0;

    if (now - lastTrackedAt < 1500) {
      return;
    }

    recentAnalyticsInteractions.set(interactionKey, now);

    recentAnalyticsInteractions.forEach(function (timestamp, key) {
      if (now - timestamp > 5000) {
        recentAnalyticsInteractions.delete(key);
      }
    });

    trackEvent("whatsapp_click", {
      button_label: normalizeText(link.dataset.analyticsLabel || link.textContent || "WhatsApp"),
      destination: href,
      product_id: normalizeText(link.dataset.productId),
      product_name: normalizeText(link.dataset.productName),
      transport_type: "beacon"
    });

    const buttonLabel = normalizeText(link.dataset.analyticsLabel || link.textContent || "WhatsApp");
    const productId = normalizeText(link.dataset.productId);
    const product = productId ? getProductById(productId) : null;
    const lowerLabel = buttonLabel.toLowerCase();

    if (lowerLabel.includes("checkout")) {
      const checkoutItems = getCartSummary()
        .map((item, index) => buildAnalyticsItem(item.product || {
          id: item.productId,
          name: item.productName,
          category: item.product && item.product.category,
          price: item.productPrice
        }, {
          index: index + 1,
          quantity: item.quantity,
          listId: "cart_checkout",
          listName: "Cart Checkout"
        }))
        .filter((item) => item.item_id);
      const checkoutValue = checkoutItems.reduce(function (total, item) {
        return total + ((Number(item.price) || 0) * Math.max(1, Number(item.quantity) || 1));
      }, 0);

      trackEvent("begin_checkout", {
        currency: "KES",
        value: checkoutValue,
        checkout_channel: "whatsapp",
        transport_type: "beacon",
        items: checkoutItems
      });
      return;
    }

    const leadIntent = lowerLabel.includes("custom")
      ? "custom_order"
      : lowerLabel.includes("gift")
        ? "gift_inquiry"
        : product
          ? "product_order"
          : "general_inquiry";
    const leadPayload = {
      lead_channel: "whatsapp",
      lead_intent: leadIntent,
      button_label: buttonLabel,
      transport_type: "beacon"
    };

    if (product) {
      const productEvent = buildProductAnalyticsPayload(product, {
        index: 1,
        listId: "whatsapp_lead",
        listName: "WhatsApp Lead"
      });
      leadPayload.currency = productEvent.currency;
      leadPayload.value = productEvent.value;
      leadPayload.items = productEvent.items;
      leadPayload.product_id = normalizeText(product.id);
      leadPayload.product_name = normalizeText(product.name);
    }

    trackEvent("generate_lead", leadPayload);
  }

  function bindAnalyticsEvents() {
    if (analyticsEventsBound) {
      return;
    }

    analyticsEventsBound = true;

    function handleAnalyticsPointer(event) {
      const link = event.target.closest("a[href]");
      if (!link) {
        return;
      }

      if (link.matches("[data-analytics-select-item=\"true\"]")) {
        trackProductSelection(link);
      }

      trackWhatsAppInteraction(link);
    }

    document.addEventListener("pointerdown", handleAnalyticsPointer);
    document.addEventListener("click", handleAnalyticsPointer);
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

  function parseStoredSiteContent(key) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function readStoredSiteContent() {
    return parseStoredSiteContent(siteContentSettingsKey);
  }

  function getPathValue(source, path) {
    return String(path || "")
      .split(".")
      .filter(Boolean)
      .reduce(function (current, segment) {
        if (!current || typeof current !== "object") {
          return undefined;
        }

        if (/^\d+$/.test(segment)) {
          return current[Number(segment)];
        }

        return current[segment];
      }, source);
  }

  function applyTextOverride(selector, value, options) {
    const target = document.querySelector(selector);
    const normalizedValue = value === undefined || value === null ? "" : String(value);
    if (!target || !normalizedValue) {
      return;
    }

    if (options && options.html) {
      target.innerHTML = normalizedValue;
      return;
    }

    target.textContent = normalizedValue;
  }

  function applyLinkOverride(selector, config) {
    const target = document.querySelector(selector);
    const settings = config && typeof config === "object" ? config : {};
    if (!target) {
      return;
    }

    if (normalizeText(settings.label)) {
      target.textContent = settings.label;
    }
    if (normalizeText(settings.href)) {
      target.href = settings.href;
    }
  }

  function applyImageOverride(selector, config) {
    const target = document.querySelector(selector);
    const settings = config && typeof config === "object" ? config : {};
    if (!target || !normalizeText(settings.src)) {
      return;
    }

    target.src = settings.src;
    if (normalizeText(settings.alt)) {
      target.alt = settings.alt;
    }
  }

  function mergeBrandingIntoSiteData(branding) {
    const source = branding && typeof branding === "object" ? branding : {};
    if (normalizeText(source.siteName)) {
      data.site.name = normalizeText(source.siteName);
    }
    if (normalizeText(source.siteTagline)) {
      data.site.tagline = normalizeText(source.siteTagline);
    }
    if (normalizeText(source.promo)) {
      data.site.promo = normalizeText(source.promo);
    }
    if (normalizeText(source.phone)) {
      data.site.phone = normalizeText(source.phone);
    }
    if (normalizeText(source.email)) {
      data.site.email = normalizeText(source.email);
    }
    if (normalizeText(source.location)) {
      data.site.location = normalizeText(source.location);
    }
    if (normalizeText(source.whatsapp)) {
      data.site.whatsapp = normalizeWhatsAppNumber(source.whatsapp);
    }
  }

  function mergePricingIntoSiteData(content) {
    const source = content && typeof content === "object" ? content.pricing : null;
    if (!source || typeof source !== "object" || typeof pricingUtils.getPricingSettings !== "function") {
      return;
    }

    data.site.pricing = pricingUtils.getPricingSettings({
      ...data.site,
      pricing: {
        ...data.site.pricing,
        ...source
      }
    });
  }

  function refreshProductPricesFromSitePricing() {
    if (typeof pricingUtils.applyPricingToProduct !== "function") {
      return;
    }

    data.products = (Array.isArray(data.products) ? data.products : []).map(function (product) {
      return pricingUtils.applyPricingToProduct(product, data.site);
    });
  }

  function applyBrandingOverrides(branding) {
    const source = branding && typeof branding === "object" ? branding : {};
    const logoImage = normalizeText(source.logoImage);
    const logoAlt = normalizeText(source.logoAlt) || `${data.site.name || "SharonCraft"} logo`;
    const faviconImage = normalizeText(source.faviconImage);
    const appleTouchIcon = normalizeText(source.appleTouchIcon);

    if (faviconImage) {
      document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(function (node) {
        node.href = faviconImage;
      });
    }

    if (appleTouchIcon) {
      const target = document.head.querySelector('link[rel="apple-touch-icon"]');
      if (target) {
        target.href = appleTouchIcon;
      }
    }

    if (logoImage) {
      document.querySelectorAll(".brand-logo").forEach(function (image) {
        image.src = logoImage;
        image.alt = logoAlt;
      });
    }
  }

  function applyHomeContentOverrides(content) {
    const home = content && content.home;
    if (!home || typeof home !== "object") {
      return;
    }

    [
      { selector: "#home-hero-note-1-title", path: "heroNotes.0.title" },
      { selector: "#home-hero-note-1-text", path: "heroNotes.0.text" },
      { selector: "#home-hero-note-2-title", path: "heroNotes.1.title" },
      { selector: "#home-hero-note-2-text", path: "heroNotes.1.text" },
      { selector: "#home-hero-note-3-title", path: "heroNotes.2.title" },
      { selector: "#home-hero-note-3-text", path: "heroNotes.2.text" },
      { selector: "#home-searches-kicker", path: "popularSearches.kicker" },
      { selector: "#home-searches-title", path: "popularSearches.title" },
      { selector: "#home-searches-description", path: "popularSearches.description" },
      { selector: "#home-guides-kicker", path: "buyingGuides.kicker" },
      { selector: "#home-guides-title", path: "buyingGuides.title" },
      { selector: "#home-guides-description", path: "buyingGuides.description" },
      { selector: "#home-story-kicker", path: "story.kicker" },
      { selector: "#home-story-title", path: "story.title" },
      { selector: "#home-story-description", path: "story.description" },
      { selector: "#home-order-kicker", path: "ordering.kicker" },
      { selector: "#home-order-title", path: "ordering.title" },
      { selector: "#home-order-step-1-title", path: "ordering.steps.0.title" },
      { selector: "#home-order-step-1-text", path: "ordering.steps.0.text" },
      { selector: "#home-order-step-2-title", path: "ordering.steps.1.title" },
      { selector: "#home-order-step-2-text", path: "ordering.steps.1.text" },
      { selector: "#home-order-step-3-title", path: "ordering.steps.2.title" },
      { selector: "#home-order-step-3-text", path: "ordering.steps.2.text" },
      { selector: "#home-client-love-kicker", path: "clientLove.kicker" },
      { selector: "#home-client-love-title", path: "clientLove.title" },
      { selector: "#home-services-kicker", path: "servicesFaq.kicker" },
      { selector: "#home-services-title", path: "servicesFaq.title" },
      { selector: "#home-new-kicker", path: "newArrivals.kicker" },
      { selector: "#home-new-title", path: "newArrivals.title" }
    ].forEach(function (binding) {
      applyTextOverride(binding.selector, getPathValue(home, binding.path));
    });

    [0, 1, 2].forEach(function (index) {
      applyImageOverride(`#home-search-card-${index + 1}-image`, {
        src: getPathValue(home, `popularSearches.cards.${index}.image`),
        alt: getPathValue(home, `popularSearches.cards.${index}.imageAlt`)
      });
      applyTextOverride(`#home-search-card-${index + 1}-title`, getPathValue(home, `popularSearches.cards.${index}.title`));
      applyTextOverride(`#home-search-card-${index + 1}-text`, getPathValue(home, `popularSearches.cards.${index}.text`));
      applyLinkOverride(`#home-search-card-${index + 1}-link`, {
        label: getPathValue(home, `popularSearches.cards.${index}.label`),
        href: getPathValue(home, `popularSearches.cards.${index}.href`)
      });

      applyImageOverride(`#home-guide-card-${index + 1}-image`, {
        src: getPathValue(home, `buyingGuides.cards.${index}.image`),
        alt: getPathValue(home, `buyingGuides.cards.${index}.imageAlt`)
      });
      applyTextOverride(`#home-guide-card-${index + 1}-title`, getPathValue(home, `buyingGuides.cards.${index}.title`));
      applyTextOverride(`#home-guide-card-${index + 1}-text`, getPathValue(home, `buyingGuides.cards.${index}.text`));
      applyLinkOverride(`#home-guide-card-${index + 1}-link`, {
        label: getPathValue(home, `buyingGuides.cards.${index}.label`),
        href: getPathValue(home, `buyingGuides.cards.${index}.href`)
      });

      applyImageOverride(`#home-story-image-${index + 1}`, {
        src: getPathValue(home, `story.images.${index}.src`),
        alt: getPathValue(home, `story.images.${index}.alt`)
      });
    });

    applyLinkOverride("#home-story-primary-link", {
      label: getPathValue(home, "story.primaryLabel"),
      href: getPathValue(home, "story.primaryHref")
    });
    applyLinkOverride("#home-story-secondary-link", {
      label: getPathValue(home, "story.secondaryLabel"),
      href: getPathValue(home, "story.secondaryHref")
    });
    applyLinkOverride("#home-order-primary-link", {
      label: getPathValue(home, "ordering.primaryLabel"),
      href: getPathValue(home, "ordering.primaryHref")
    });
    applyLinkOverride("#home-order-secondary-link", {
      label: getPathValue(home, "ordering.secondaryLabel"),
      href: getPathValue(home, "ordering.secondaryHref")
    });
  }

  function applyAboutContentOverrides(content) {
    const about = content && content.about;
    if (!about || typeof about !== "object") {
      return;
    }

    [
      { selector: "#about-hero-kicker", path: "hero.kicker" },
      { selector: "#about-hero-title", path: "hero.title" },
      { selector: "#about-hero-text-1", path: "hero.text1" },
      { selector: "#about-hero-text-2", path: "hero.text2" },
      { selector: "#about-value-1-title", path: "values.0.title" },
      { selector: "#about-value-1-text", path: "values.0.text" },
      { selector: "#about-value-2-title", path: "values.1.title" },
      { selector: "#about-value-2-text", path: "values.1.text" },
      { selector: "#about-value-3-title", path: "values.2.title" },
      { selector: "#about-value-3-text", path: "values.2.text" },
      { selector: "#about-culture-kicker", path: "culture.kicker" },
      { selector: "#about-culture-title", path: "culture.title" },
      { selector: "#about-culture-text", path: "culture.text" },
      { selector: "#about-faq-kicker", path: "faq.kicker" },
      { selector: "#about-faq-title", path: "faq.title" }
    ].forEach(function (binding) {
      applyTextOverride(binding.selector, getPathValue(about, binding.path), binding.html ? { html: true } : undefined);
    });

    [0, 1].forEach(function (index) {
      applyImageOverride(`#about-gallery-image-${index + 1}`, {
        src: getPathValue(about, `hero.gallery.${index}.src`),
        alt: getPathValue(about, `hero.gallery.${index}.alt`)
      });
    });

    [0, 1, 2].forEach(function (index) {
      applyImageOverride(`#about-culture-image-${index + 1}`, {
        src: getPathValue(about, `culture.images.${index}.src`),
        alt: getPathValue(about, `culture.images.${index}.alt`)
      });
    });

    [0, 1, 2, 3].forEach(function (index) {
      applyTextOverride(`#about-faq-${index + 1}-question`, getPathValue(about, `faq.items.${index}.question`));
      applyTextOverride(`#about-faq-${index + 1}-answer`, getPathValue(about, `faq.items.${index}.answer`), { html: true });
    });
  }

  function applyShopContentOverrides(content) {
    const shop = content && content.shop;
    if (!shop || typeof shop !== "object") {
      return;
    }

    [
      { selector: "#shop-hero-kicker", path: "hero.kicker" },
      { selector: "#shop-hero-title", path: "hero.title" },
      { selector: "#shop-hero-description", path: "hero.description" },
      { selector: "#shop-refine-kicker", path: "refine.kicker" },
      { selector: "#shop-refine-title", path: "refine.title" },
      { selector: "#shop-guides-kicker", path: "guides.kicker" },
      { selector: "#shop-guides-title", path: "guides.title" },
      { selector: "#shop-guides-description", path: "guides.description" },
      { selector: "#shop-help-kicker", path: "help.kicker" },
      { selector: "#shop-help-title", path: "help.title" },
      { selector: "#shop-help-description", path: "help.description" },
      { selector: "#shop-trust-kicker", path: "trust.kicker" },
      { selector: "#shop-trust-title", path: "trust.title" },
      { selector: "#shop-trust-description", path: "trust.description" }
    ].forEach(function (binding) {
      applyTextOverride(binding.selector, getPathValue(shop, binding.path));
    });

    [0, 1, 2].forEach(function (index) {
      applyImageOverride(`#shop-guide-card-${index + 1}-image`, {
        src: getPathValue(shop, `guides.cards.${index}.image`),
        alt: getPathValue(shop, `guides.cards.${index}.imageAlt`)
      });
      applyTextOverride(`#shop-guide-card-${index + 1}-title`, getPathValue(shop, `guides.cards.${index}.title`));
      applyTextOverride(`#shop-guide-card-${index + 1}-text`, getPathValue(shop, `guides.cards.${index}.text`));
      applyLinkOverride(`#shop-guide-card-${index + 1}-link`, {
        label: getPathValue(shop, `guides.cards.${index}.label`),
        href: getPathValue(shop, `guides.cards.${index}.href`)
      });
    });
  }

  function applyJournalContentOverrides(content) {
    const journal = content && content.journal;
    if (!journal || typeof journal !== "object") {
      return;
    }

    [
      { selector: "#journal-hero-kicker", path: "hero.kicker" },
      { selector: "#journal-hero-title", path: "hero.title" },
      { selector: "#journal-hero-description", path: "hero.description" },
      { selector: "#journal-guides-kicker", path: "guides.kicker" },
      { selector: "#journal-guides-title", path: "guides.title" },
      { selector: "#journal-guides-description", path: "guides.description" }
    ].forEach(function (binding) {
      applyTextOverride(binding.selector, getPathValue(journal, binding.path));
    });

    [0, 1, 2, 3, 4].forEach(function (index) {
      applyTextOverride(`#journal-card-${index + 1}-kicker`, getPathValue(journal, `cards.${index}.kicker`));
      applyTextOverride(`#journal-card-${index + 1}-title`, getPathValue(journal, `cards.${index}.title`));
      applyTextOverride(`#journal-card-${index + 1}-text`, getPathValue(journal, `cards.${index}.text`));
      applyLinkOverride(`#journal-card-${index + 1}-link`, {
        label: getPathValue(journal, `cards.${index}.label`),
        href: getPathValue(journal, `cards.${index}.href`)
      });
    });
  }

  function applySiteContentOverrides(content) {
    if (!content || typeof content !== "object") {
      return;
    }

    applyBrandingOverrides(content.branding);

    const currentPage = normalizeText(document.body && document.body.dataset && document.body.dataset.page);
    if (currentPage === "home") {
      applyHomeContentOverrides(content);
    }
    if (currentPage === "about") {
      applyAboutContentOverrides(content);
    }
    if (currentPage === "shop") {
      applyShopContentOverrides(content);
    }
    if (currentPage === "journal") {
      applyJournalContentOverrides(content);
    }
  }

  function setPageMetadata(options) {
    const settings = options || {};
    const title = normalizeText(settings.title) || document.title || data.site.name;
    const description = normalizeText(settings.description) || data.site.tagline;
    const keywords = normalizeText(settings.keywords);
    const path = normalizeText(settings.path) || window.location.pathname;
    const image = normalizeText(settings.image) || "assets/images/custom-occasion-beadwork-46mokm-opt.webp";
    const imageAlt = normalizeText(settings.imageAlt) || title;
    const type = normalizeText(settings.type) || "website";
    const robots = normalizeText(settings.robots) || "index,follow";
    const canonicalUrl = absoluteUrl(path);
    const imageUrl = absoluteUrl(image);

    document.title = title;

    setHeadValue('meta[name="description"]', function () {
      const meta = document.createElement("meta");
      meta.name = "description";
      return meta;
    }, description);

    if (keywords) {
      setHeadValue('meta[name="keywords"]', function () {
        const meta = document.createElement("meta");
        meta.name = "keywords";
        return meta;
      }, keywords);
    }

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
    setHeadValue('meta[property="og:site_name"]', function () {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:site_name");
      return meta;
    }, data.site.name || "SharonCraft");
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
    setHeadValue('meta[property="og:image:alt"]', function () {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:image:alt");
      return meta;
    }, imageAlt);
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
    setHeadValue('meta[name="twitter:image:alt"]', function () {
      const meta = document.createElement("meta");
      meta.name = "twitter:image:alt";
      return meta;
    }, imageAlt);
    setHeadValue('meta[name="robots"]', function () {
      const meta = document.createElement("meta");
      meta.name = "robots";
      return meta;
    }, robots);
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

  function getPublicSocialUrls() {
    return (Array.isArray(data.site && data.site.socials) ? data.site.socials : [])
      .map((social) => normalizeText(social && social.url))
      .filter((url) => url && url !== "#" && !/wa\.me|whatsapp/i.test(url));
  }

  function setSiteStructuredData() {
    const siteUrl = new URL("/", window.location.origin).href;
    const organizationId = `${siteUrl}#organization`;
    const storeId = `${siteUrl}#store`;
    const websiteId = `${siteUrl}#website`;
    const founderId = `${siteUrl}#founder`;
    const leadDesignerId = `${siteUrl}#lead-designer`;
    const storeImage = absoluteUrl("assets/images/custom-occasion-beadwork-46mokm-opt.webp");
    const socialUrls = getPublicSocialUrls();
    const founderName = normalizeText(data.site.founderName) || "Kelvin Mark";
    const founderTitle = normalizeText(data.site.founderTitle) || "Founder and CEO";
    const founderDescription =
      normalizeText(data.site.founderDescription) ||
      "Kelvin Mark is the founder and CEO of SharonCraft. He launched the brand at 21 and leads brand direction, operations, growth, and customer experience.";
    const leadDesignerName = normalizeText(data.site.leadDesignerName) || "Sharon Ruth";
    const leadDesignerTitle = normalizeText(data.site.leadDesignerTitle) || "Lead Designer";
    const leadDesignerDescription =
      normalizeText(data.site.leadDesignerDescription) ||
      "Lead Designer at SharonCraft, guiding the creative direction, color stories, and handcrafted beadwork aesthetic.";
    const description = [
      `${data.site.name} is a handmade Kenyan beadwork shop based in Nairobi.`,
      "The store offers jewelry, bridal bead sets, gift ideas, cultural decor, and WhatsApp-friendly ordering."
    ].join(" ");
    const founder = {
      "@type": "Person",
      "@id": founderId,
      name: founderName,
      jobTitle: founderTitle,
      description: founderDescription,
      worksFor: {
        "@id": organizationId
      }
    };
    const leadDesigner = {
      "@type": "Person",
      "@id": leadDesignerId,
      name: leadDesignerName,
      jobTitle: leadDesignerTitle,
      description: leadDesignerDescription,
      worksFor: {
        "@id": organizationId
      }
    };
    const organization = {
      "@type": "Organization",
      "@id": organizationId,
      name: data.site.name || "SharonCraft",
      url: siteUrl,
      logo: absoluteUrl("assets/images/sharoncraft-logo-transparent.webp"),
      image: storeImage,
      email: normalizeText(data.site.email),
      telephone: normalizeText(data.site.phone),
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nairobi",
        addressCountry: "KE"
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: normalizeText(data.site.email),
        telephone: normalizeText(data.site.phone),
        areaServed: "KE",
        availableLanguage: ["en"]
      },
      founder: {
        "@id": founderId
      },
      employee: [
        {
          "@id": founderId
        },
        {
          "@id": leadDesignerId
        }
      ]
    };

    if (socialUrls.length) {
      organization.sameAs = socialUrls;
    }

    setStructuredData("site-organization", {
      "@context": "https://schema.org",
      "@graph": [
        founder,
        leadDesigner,
        organization,
        {
          "@type": "OnlineStore",
          "@id": storeId,
          name: data.site.name || "SharonCraft",
          url: siteUrl,
          image: storeImage,
          description,
          slogan: normalizeText(data.site.tagline),
          brand: {
            "@id": organizationId
          },
          founder: {
            "@id": founderId
          },
          areaServed: {
            "@type": "Country",
            name: "Kenya"
          },
          paymentAccepted: "M-Pesa",
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            merchantReturnLink: absoluteUrl("returns.html")
          }
        },
        {
          "@type": "WebSite",
          "@id": websiteId,
          url: siteUrl,
          name: data.site.name || "SharonCraft",
          description: normalizeText(data.site.tagline),
          publisher: {
            "@id": organizationId
          }
        }
      ]
    });
  }

  function getProductImages(product) {
    const imageList = []
      .concat(Array.isArray(product && product.images) ? product.images : [])
      .concat(normalizeText(product && product.image))
      .concat(Array.isArray(product && product.gallery) ? product.gallery : [])
      .map(normalizeText)
      .filter(Boolean);

    const uniqueImages = imageList.filter((image, index) => imageList.indexOf(image) === index);
    const versionValue = normalizeText(product && product.updatedAt);
    const finalImages = uniqueImages.length ? uniqueImages : ["assets/images/custom-occasion-beadwork-46mokm-opt.webp"];
    return finalImages.map(function (image) {
      return addAssetVersion(image, versionValue);
    });
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

  function getPricingSettings() {
    if (typeof pricingUtils.getPricingSettings === "function") {
      return pricingUtils.getPricingSettings(data.site);
    }

    return {
      enabled: false,
      deliveryFee: 0,
      packagingFee: 0,
      multiplier: 1
    };
  }

  function calculateWebsitePrice(basePrice) {
    if (typeof pricingUtils.calculateWebsitePrice === "function") {
      return pricingUtils.calculateWebsitePrice(basePrice, data.site);
    }

    return Math.max(0, Number(basePrice) || 0);
  }

  function applyPricingToProduct(product) {
    if (typeof pricingUtils.applyPricingToProduct === "function") {
      return pricingUtils.applyPricingToProduct(product, data.site);
    }

    return product;
  }

  function buildWhatsAppUrl(message) {
    return `https://wa.me/${data.site.whatsapp}?text=${encodeURIComponent(message)}`;
  }

  function slugifyProductId(value) {
    return normalizeText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product";
  }

  function buildProductSharePath(product) {
    const productId = normalizeText(product && product.id);
    if (!productId) {
      return window.location.pathname;
    }
    return `/products/${slugifyProductId(productId)}.html`;
  }

  function buildProductWhatsAppMessage(product, options) {
    const settings = options || {};
    const productName = product && product.name ? product.name : "this SharonCraft piece";
    const productPrice = product && Number.isFinite(Number(product.price)) ? formatCurrency(product.price) : "the listed price";
    const intent = normalizeText(settings.intent) || "order";
    const productPath = product && product.id ? buildProductSharePath(product) : window.location.pathname;
    const productLink = absoluteUrl(productPath);

    if (intent === "custom") {
      return `Hello SharonCraft, I would like to ask about custom colors or a similar version of ${productName}. Product link: ${productLink}`;
    }

    if (intent === "gift") {
      return `Hello SharonCraft, I am considering ${productName} as a gift. Please advise on availability, delivery, and presentation. Product link: ${productLink}`;
    }

    if (intent === "share") {
      return `Hello, I found this SharonCraft piece and thought you may like it: ${productName}. View it here: ${productLink}`;
    }

    return `Hello SharonCraft, I would like to order ${productName} for ${productPrice}. Please confirm availability, delivery, and payment steps. Product link: ${productLink}`;
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
      `,
      account: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
          <path d="M5.2 19.2c1.4-3.2 3.8-4.8 6.8-4.8s5.4 1.6 6.8 4.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path>
          <path d="M18.4 7.2h1.4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path>
        </svg>
      `
      };

    return icons[name] || "";
  }

  function menuIconMarkup() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4.5 7.5h15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.9"></path>
        <path d="M4.5 12h15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.9"></path>
        <path d="M4.5 16.5h15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.9"></path>
      </svg>
    `;
  }

  function whatsappIconMarkup() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 4.2a7.8 7.8 0 0 0-6.7 11.8L4 20l4.2-1.2A7.8 7.8 0 1 0 12 4.2Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
        <path d="M9.2 9.1c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4l.6 1.5c.1.2.1.4 0 .6l-.4.6c-.1.1-.1.3 0 .4.4.8 1 1.4 1.8 1.8.1.1.3.1.4 0l.6-.4c.2-.1.4-.1.6 0l1.5.6c.4.1.4.3.4.5v.5c0 .2 0 .4-.4.6-.5.2-1 .4-1.5.3-1.1-.1-2.1-.6-3.1-1.6s-1.5-2-1.6-3.1c-.1-.5.1-1 .3-1.5Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"></path>
      </svg>
    `;
  }

  function viewPieceIconMarkup() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 12s2.8-4.8 8-4.8 8 4.8 8 4.8-2.8 4.8-8 4.8S4 12 4 12Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"></path>
        <circle cx="12" cy="12" r="2.3" fill="none" stroke="currentColor" stroke-width="1.7"></circle>
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
    return buildWhatsAppUrl(buildProductWhatsAppMessage(product, { intent: "order" }));
  }

  function createProductCard(product, options) {
    const config = options || {};
    const productName = product.name || "Artisan Creation";
    const image = getProductImages(product)[0];
    const wishlisted = isWishlisted(product.id);
    const category = getCategoryBySlug(product.category);
    const categoryAccent = normalizeText(category && category.accent) || "coral";
    const craftSignature = normalizeText(product.material)
      ? `${product.material} detail`
      : "Handmade detail";
    const badgeMarkup = product.badge
      ? `<span class="${buildBadgeClass(product.badge)}">${product.badge}</span>`
      : "";
    const analyticsAttributes = config.listName || config.listId
      ? ` data-analytics-select-item="true" data-product-id="${product.id}" data-product-name="${productName}" data-product-category="${category ? category.name : "Collection"}" data-product-price="${Number(product.price) || 0}" data-item-list-id="${config.listId || ""}" data-item-list-name="${config.listName || ""}" data-item-index="${Number(config.index) || 0}"`
      : ` data-product-id="${product.id}" data-product-name="${productName}"`;

    return `
      <article class="product-card reveal accent-${categoryAccent}">
        <a class="product-card-media" href="product.html?id=${product.id}"${analyticsAttributes}>
          <img src="${image}" alt="${productName}" loading="lazy" decoding="async" />
          ${badgeMarkup}
          <div class="product-card-media-actions">
            <button class="icon-action-button wishlist-icon-button ${wishlisted ? "is-active" : ""}" type="button" data-toggle-wishlist="${product.id}" aria-label="${wishlisted ? "Remove from wishlist" : "Save to wishlist"}" aria-pressed="${wishlisted ? "true" : "false"}">
              ${heartIconMarkup()}
            </button>
          </div>
        </a>
        <div class="product-card-body">
          <div class="product-card-copy">
            <p class="product-card-category">${category ? category.name : "Collection"}</p>
            <div class="product-card-signature" aria-hidden="true">
              <span class="product-card-beads"><i></i><i></i><i></i></span>
              <span>${craftSignature}</span>
            </div>
            <h3 class="product-name"><a href="product.html?id=${product.id}"${analyticsAttributes}>${productName}</a></h3>
          </div>
          <div class="product-card-price-row">
            <strong class="product-price product-price-pill">${formatCurrency(product.price)}</strong>
          </div>
          <div class="product-card-actions">
            <a class="button button-primary product-card-view" href="product.html?id=${product.id}"${analyticsAttributes}>
              <span class="product-card-action-label">View Piece</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  function getCategoryIconMarkup(slug, name) {
    const label = escapeHtml(name || "Category");
    const icons = {
      "necklaces": `
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <path d="M25 27c0 12 10 22 23 22s23-10 23-22" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"/>
          <path d="M22 34c6 15 15 28 26 39 11-11 20-24 26-39" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/>
          <path d="M36 53h24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="3.5" opacity="0.75"/>
          <circle cx="48" cy="59" r="9" fill="currentColor"/>
          <circle cx="32" cy="43" r="4" fill="currentColor" opacity="0.88"/>
          <circle cx="64" cy="43" r="4" fill="currentColor" opacity="0.88"/>
          <circle cx="41" cy="50" r="3.2" fill="currentColor" opacity="0.7"/>
          <circle cx="55" cy="50" r="3.2" fill="currentColor" opacity="0.7"/>
        </svg>
      `,
      "bracelets": `
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <ellipse cx="34" cy="40" rx="17" ry="6" fill="none" stroke="currentColor" stroke-width="3.5"/>
          <path d="M17 40v14c0 4 8 7 17 7s17-3 17-7V40" fill="none" stroke="currentColor" stroke-width="3.5"/>
          <path d="M23 50c3 1 7 2 11 2s8-1 11-2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="3"/>
          <circle cx="30" cy="54" r="1.9" fill="currentColor"/>
          <circle cx="35" cy="54.5" r="1.9" fill="currentColor"/>
          <circle cx="40" cy="54" r="1.9" fill="currentColor"/>
          <ellipse cx="62" cy="38" rx="17" ry="6" fill="none" stroke="currentColor" stroke-width="3.5"/>
          <path d="M45 38v14c0 4 8 7 17 7s17-3 17-7V38" fill="none" stroke="currentColor" stroke-width="3.5"/>
          <path d="M51 48c3 1 7 2 11 2s8-1 11-2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="3"/>
          <circle cx="58" cy="52" r="1.9" fill="currentColor"/>
          <circle cx="63" cy="52.5" r="1.9" fill="currentColor"/>
          <circle cx="68" cy="52" r="1.9" fill="currentColor"/>
        </svg>
      `,
      "earrings": `
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <path d="M33 23c0-5 4-9 9-9s9 4 9 9c0 4-2 7-5 8v7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/>
          <path d="M28 47c0-7 6-12 14-12s14 5 14 12c0 8-6 15-14 20-8-5-14-12-14-20z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"/>
          <circle cx="42" cy="23" r="3" fill="currentColor"/>
          <path d="M57 30c0-4 3-7 7-7s7 3 7 7c0 3-2 6-4 7v5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" opacity="0.9"/>
          <path d="M53 52c0-6 5-11 11-11s11 5 11 11c0 6-5 12-11 16-6-4-11-10-11-16z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"/>
          <circle cx="64" cy="30" r="2.6" fill="currentColor"/>
          <circle cx="42" cy="56" r="3" fill="currentColor" opacity="0.88"/>
          <circle cx="64" cy="59" r="3" fill="currentColor" opacity="0.88"/>
          <path d="M37 69l5 7 5-7M59 72l5 6 5-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.4" opacity="0.7"/>
        </svg>
      `,
      "home-decor": `
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <path d="M18 32h18l-4-12H22z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"/>
          <path d="M27 32v29" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"/>
          <path d="M21 76h12" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"/>
          <path d="M27 61c-4 0-7 3-7 7v8h14v-8c0-4-3-7-7-7z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"/>
          <rect x="48" y="18" width="28" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="4"/>
          <path d="M54 31l7-7 9 9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/>
          <path d="M24 74h52" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4" opacity="0.82"/>
          <path d="M36 54c0-5 4-9 9-9h14c5 0 9 4 9 9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"/>
          <rect x="39" y="49" width="26" height="16" rx="6" fill="none" stroke="currentColor" stroke-width="4"/>
          <path d="M43 53v16M61 53v16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"/>
          <path d="M47 58h10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"/>
          <path d="M36 54v17M68 54v17" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"/>
        </svg>
      `,
      "bags-accessories": `
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <path d="M31 36c0-9 7-15 17-15s17 6 17 15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"/>
          <path d="M24 39h48v30c0 4-3 7-7 7H31c-4 0-7-3-7-7z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"/>
          <path d="M24 47h48" fill="none" stroke="currentColor" stroke-width="3.5" opacity="0.72"/>
          <rect x="38" y="50" width="20" height="12" rx="4" fill="none" stroke="currentColor" stroke-width="3.5"/>
          <circle cx="61" cy="56" r="4" fill="currentColor"/>
        </svg>
      `,
      "gift-sets": `
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <rect x="24" y="41" width="48" height="31" rx="7" fill="none" stroke="currentColor" stroke-width="4"/>
          <path d="M48 41v31M24 53h48" fill="none" stroke="currentColor" stroke-width="4"/>
          <path d="M48 41c-8 0-14-4-14-11 0-5 3-8 8-8 6 0 8 8 6 19zm0 0c8 0 14-4 14-11 0-5-3-8-8-8-6 0-8 8-6 19z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"/>
          <path d="M36 65l12-8 12 8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="3.5" opacity="0.74"/>
        </svg>
      `,
      "bridal-occasion": `
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <path d="M24 72c4-16 9-28 17-38 3-4 5-8 7-12 2 4 4 8 7 12 8 10 13 22 17 38" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/>
          <path d="M37 48c3-4 7-6 11-6s8 2 11 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"/>
          <path d="M40 56c2 2 5 3 8 3s6-1 8-3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="3.5"/>
          <path d="M43 62c2 2 3 3 5 3s3-1 5-3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="3.5"/>
          <path d="M37 48c0 9 5 17 11 17s11-8 11-17" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"/>
          <path d="M48 18l4 6 7 1-5 5 2 7-8-5-8 5 2-7-5-5 7-1z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"/>
          <circle cx="48" cy="28" r="2.6" fill="currentColor"/>
          <path d="M31 52l-4 5 4 4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5"/>
          <path d="M65 52l4 5-4 4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5"/>
          <circle cx="33" cy="57" r="2" fill="currentColor"/>
          <circle cx="63" cy="57" r="2" fill="currentColor"/>
          <path d="M36 72c4-3 8-4 12-4s8 1 12 4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"/>
          <circle cx="40" cy="74" r="2.4" fill="currentColor"/>
          <circle cx="48" cy="77" r="2.8" fill="currentColor"/>
          <circle cx="56" cy="74" r="2.4" fill="currentColor"/>
        </svg>
      `
    };

    return `
      <span class="category-card-icon" aria-label="${label} icon">
        <span class="category-card-icon-halo"></span>
        <span class="category-card-icon-frame"></span>
        <span class="category-card-icon-art">${icons[slug] || icons["gift-sets"]}</span>
      </span>
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
              ${getCategoryIconMarkup(category.slug, category.name)}
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

  function getWishlist() {
    try {
      const stored = window.localStorage.getItem(wishlistStorageKey) || "[]";
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveWishlist(wishlist) {
    window.localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist));
    document.querySelectorAll("[data-wishlist-toggle]").forEach((button) => {
      const productId = button.dataset.productId;
      if (productId) {
        button.classList.toggle("is-active", wishlist.includes(productId));
      }
    });
    window.dispatchEvent(new CustomEvent("sharoncraft-wishlist-updated", { detail: { wishlist } }));
  }

  function toggleWishlist(productId) {
    if (!productId) return;
    let wishlist = getWishlist();
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter((id) => id !== productId);
    } else {
      wishlist.push(productId);
      if (typeof window.showToast === "function") {
        window.showToast("Saved to wishlist", "success");
      } else {
        window.alert("Saved to wishlist");
      }
    }
    saveWishlist(wishlist);
  }

  function removeFromWishlist(productId) {
    if (!productId) return;
    let wishlist = getWishlist();
    wishlist = wishlist.filter((id) => id !== productId);
    saveWishlist(wishlist);
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

  function getCartCheckoutSnapshot() {
    const items = getCartSummary().map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.productPrice,
      lineTotal: item.lineTotal,
    }));

    return {
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.lineTotal, 0),
    };
  }

  function clearCart() {
    saveCart([]);
  }

  function createCartItemNode(item) {
    const article = document.createElement("article");
    article.className = "cart-item";

    const main = document.createElement("div");
    main.className = "cart-item-main";

    const name = document.createElement("strong");
    name.className = "cart-item-name";
    name.textContent = item.displayName;

    const meta = document.createElement("span");
    meta.className = "cart-item-meta";
    meta.textContent = `${formatCurrency(item.displayPrice)} each`;

    main.append(name, meta);

    const side = document.createElement("div");
    side.className = "cart-item-side";

    const controls = document.createElement("div");
    controls.className = "cart-quantity-controls";

    const decreaseButton = document.createElement("button");
    decreaseButton.type = "button";
    decreaseButton.dataset.cartDecrease = item.productId;
    decreaseButton.setAttribute("aria-label", "Reduce quantity");
    decreaseButton.textContent = "-";

    const quantity = document.createElement("span");
    quantity.textContent = String(item.quantity);

    const increaseButton = document.createElement("button");
    increaseButton.type = "button";
    increaseButton.dataset.cartIncrease = item.productId;
    increaseButton.setAttribute("aria-label", "Increase quantity");
    increaseButton.textContent = "+";

    controls.append(decreaseButton, quantity, increaseButton);

    const total = document.createElement("strong");
    total.className = "cart-item-total";
    total.textContent = formatCurrency(item.lineTotal);

    side.append(controls, total);
    article.append(main, side);
    return article;
  }

  function getCheckoutSourcePath() {
    if (/^https?:$/i.test(window.location.protocol)) {
      return window.location.pathname || "/";
    }

    const pageKey = normalizeText(document.body && document.body.dataset && document.body.dataset.page) || "storefront";
    return `/${pageKey}.html`;
  }

  function getFriendlyMpesaStatusMessage(status, resultCode, resultDesc, receiptNumber, orderIds) {
    const normalizedStatus = normalizeText(status).toLowerCase();
    const code = Number(resultCode);
    const normalizedOrderIds = Array.isArray(orderIds)
      ? orderIds.map((entry) => normalizeText(entry)).filter(Boolean)
      : [];
    const orderSummary = normalizedOrderIds.length
      ? normalizedOrderIds.length === 1
        ? ` Track it with order ID ${normalizedOrderIds[0]}.`
        : ` Track these items with order IDs ${normalizedOrderIds.join(", ")}.`
      : "";

    if (normalizedStatus === "paid") {
      return `Payment received${normalizeText(receiptNumber) ? ` - receipt ${normalizeText(receiptNumber)}` : ""}. Your order is now in SharonCraft admin and tracking.${orderSummary}`;
    }

    if (normalizedStatus === "cancelled" || code === 1032) {
      return "You cancelled the M-Pesa prompt. You can try again whenever you're ready.";
    }

    if (code === 1037) {
      return "The M-Pesa prompt timed out because there was no response. Please try again and approve the prompt quickly.";
    }

    if (normalizedStatus === "failed") {
      return normalizeText(resultDesc) || "M-Pesa could not complete this payment. Please try again.";
    }

    if (normalizedStatus === "prompted") {
      return "The M-Pesa prompt has been sent. Please check your phone and enter your PIN.";
    }

    return normalizeText(resultDesc) || "We are still checking your M-Pesa payment status.";
  }

  function stopMpesaStatusPolling() {
    if (mpesaStatusPollTimer) {
      window.clearTimeout(mpesaStatusPollTimer);
      mpesaStatusPollTimer = null;
    }
  }

  async function pollMpesaCheckoutStatus(reference) {
    const normalizedReference = normalizeText(reference);
    const catalog = window.SharonCraftCatalog;

    if (!normalizedReference || !catalog || typeof catalog.fetchMpesaCheckoutStatus !== "function") {
      return;
    }

    mpesaLastReference = normalizedReference;
    mpesaStatusPollStartedAt = Date.now();
    stopMpesaStatusPolling();

    const runCheck = async () => {
      try {
        const result = await catalog.fetchMpesaCheckoutStatus(normalizedReference);
        if (!result || result.ok === false) {
          throw new Error(normalizeText(result && result.error) || "Unable to read M-Pesa payment status.");
        }

        const message = getFriendlyMpesaStatusMessage(
          result.status,
          result.resultCode,
          result.resultDesc,
          result.mpesaReceiptNumber,
          result.orderIds
        );

        if (result.status === "paid") {
          setMpesaCheckoutStatus(message, "success");
          clearCart();
          stopMpesaStatusPolling();
          return;
        }

        if (result.status === "failed" || result.status === "cancelled") {
          setMpesaCheckoutStatus(message, "error");
          stopMpesaStatusPolling();
          return;
        }

        setMpesaCheckoutStatus(message, "info");

        if (Date.now() - mpesaStatusPollStartedAt > 120000) {
          setMpesaCheckoutStatus(
            "We haven't received the final payment result yet. If you approved the prompt, check again shortly or contact SharonCraft on WhatsApp.",
            "info"
          );
          stopMpesaStatusPolling();
          return;
        }

        mpesaStatusPollTimer = window.setTimeout(runCheck, 5000);
      } catch (error) {
        setMpesaCheckoutStatus(
          normalizeText(error && error.message) || "Unable to confirm the M-Pesa result right now.",
          "error"
        );
        stopMpesaStatusPolling();
      }
    };

    runCheck();
  }

  function setMpesaCheckoutStatus(message, tone) {
    const statusNode = document.getElementById("cart-mpesa-status");
    if (!statusNode) {
      return;
    }

    statusNode.textContent = normalizeText(message);
    statusNode.hidden = !normalizeText(message);
    statusNode.classList.remove("is-success", "is-error", "is-info");

    if (!statusNode.hidden) {
      statusNode.classList.add(tone === "success" ? "is-success" : tone === "error" ? "is-error" : "is-info");
    }
  }

  async function prefillMpesaCheckoutForm() {
    const form = document.getElementById("cart-mpesa-form");
    if (!form || form.dataset.prefilled === "true") {
      return;
    }

    const catalog = window.SharonCraftCatalog;
    if (!catalog || typeof catalog.fetchCustomerProfile !== "function") {
      return;
    }

    if (!mpesaProfilePromise) {
      mpesaProfilePromise = catalog.fetchCustomerProfile().catch(() => null);
    }

    const profile = await mpesaProfilePromise;
    if (!profile) {
      return;
    }

    const nameInput = form.querySelector("#cart-mpesa-name");
    const phoneInput = form.querySelector("#cart-mpesa-phone");
    const emailInput = form.querySelector("#cart-mpesa-email");
    const areaInput = form.querySelector("#cart-mpesa-area");

    if (nameInput && !normalizeText(nameInput.value)) {
      nameInput.value = normalizeText(profile.fullName);
    }
    if (phoneInput && !normalizeText(phoneInput.value)) {
      phoneInput.value = normalizeText(profile.phone);
    }
    if (emailInput && !normalizeText(emailInput.value)) {
      emailInput.value = normalizeText(profile.email);
    }
    if (areaInput && !normalizeText(areaInput.value)) {
      areaInput.value = normalizeText(profile.deliveryArea);
    }

    form.dataset.prefilled = "true";
  }

  async function openMpesaCheckoutPanel() {
    const panel = document.getElementById("cart-mpesa-panel");
    if (!panel) {
      return;
    }

    panel.hidden = false;
    await prefillMpesaCheckoutForm();

    const firstEmpty =
      panel.querySelector("#cart-mpesa-name") ||
      panel.querySelector("#cart-mpesa-phone") ||
      panel.querySelector("input");
    if (firstEmpty && typeof firstEmpty.focus === "function") {
      firstEmpty.focus();
    }
  }

  function closeMpesaCheckoutPanel() {
    const panel = document.getElementById("cart-mpesa-panel");
    const submitButton = document.getElementById("cart-mpesa-submit");

    if (panel) {
      panel.hidden = true;
    }
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Continue";
    }
    stopMpesaStatusPolling();
    setMpesaCheckoutStatus("", "info");
  }

  async function handleMpesaCheckoutSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = document.getElementById("cart-mpesa-submit");
    const checkout = getCartCheckoutSnapshot();
    const catalog = window.SharonCraftCatalog;

    if (!checkout.items.length) {
      setMpesaCheckoutStatus("Add at least one product before paying with M-Pesa.", "error");
      return;
    }

    if (!catalog || typeof catalog.startMpesaCheckout !== "function") {
      setMpesaCheckoutStatus("M-Pesa is not ready on this site yet. Finish the Supabase function setup first.", "error");
      return;
    }

    const nameInput = form.querySelector("#cart-mpesa-name");
    const phoneInput = form.querySelector("#cart-mpesa-phone");
    const emailInput = form.querySelector("#cart-mpesa-email");
    const areaInput = form.querySelector("#cart-mpesa-area");

    const payload = {
      amount: checkout.total,
      currency: "KES",
      items: checkout.items,
      sourcePage: getCheckoutSourcePath(),
      customer: {
        name: normalizeText(nameInput && nameInput.value),
        phone: normalizeText(phoneInput && phoneInput.value),
        email: normalizeText(emailInput && emailInput.value),
        deliveryArea: normalizeText(areaInput && areaInput.value),
      },
    };

    if (!payload.customer.name || !payload.customer.phone || !payload.customer.deliveryArea) {
      setMpesaCheckoutStatus("Please add your name, Safaricom phone number, and delivery area.", "error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    setMpesaCheckoutStatus("Requesting your M-Pesa prompt...", "info");

    try {
      const result = await catalog.startMpesaCheckout(payload);
      if (!result || result.ok === false) {
        throw new Error(normalizeText(result && result.error) || "M-Pesa did not accept the payment request.");
      }

      setMpesaCheckoutStatus(
        `${normalizeText(result.customerMessage) || "Check your phone for the M-Pesa prompt."} Reference: ${normalizeText(result.reference)}.`,
        "success"
      );
      await pollMpesaCheckoutStatus(result.reference);
    } catch (error) {
      setMpesaCheckoutStatus(
        normalizeText(error && error.message) || "Unable to start M-Pesa right now. Please try again or use WhatsApp checkout.",
        "error"
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Continue";
      }
    }
  }

  function openCart() {
    if (document.body.dataset.page !== "cart") {
      window.location.href = "cart.html";
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeCart() {
    document.body.classList.remove("cart-open");
    const drawer = document.getElementById("cart-drawer");
    if (drawer) {
      drawer.setAttribute("aria-hidden", "true");
    }
    closeMpesaCheckoutPanel();
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
      value: Number(product.price) || 0,
      currency: "KES",
      items: [
        buildAnalyticsItem(product, {
          index: 1,
          listId: "product_detail",
          listName: "Product Detail"
        })
      ]
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
    const cartSummary = getCartSummary().map((item) => ({
      ...item,
      displayName: item.productName || "Artisan item",
      displayPrice: Number(item.productPrice) || 0,
    }));

    if (cartItemsNode) {
      cartItemsNode.innerHTML = "";
      const fragment = document.createDocumentFragment();
      cartSummary.forEach((item) => {
        fragment.appendChild(createCartItemNode(item));
      });
      cartItemsNode.appendChild(fragment);
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

    const mpesaOpenNode = document.getElementById("cart-mpesa-open");
    if (mpesaOpenNode) {
      mpesaOpenNode.disabled = cart.length === 0;
    }

    const mpesaMetaNode = document.getElementById("cart-mpesa-meta");
    if (mpesaMetaNode) {
      const { itemCount } = getCartCheckoutSnapshot();
      mpesaMetaNode.textContent = itemCount
        ? `${itemCount} item${itemCount === 1 ? "" : "s"} ready for easy follow-up`
        : "Add a few favorites before you message SharonCraft";
    }

    const mpesaPanel = document.getElementById("cart-mpesa-panel");
    const mpesaStatusNode = document.getElementById("cart-mpesa-status");
    const hasSuccessState = Boolean(
      mpesaStatusNode && !mpesaStatusNode.hidden && mpesaStatusNode.classList.contains("is-success")
    );
    if (mpesaPanel && cart.length === 0 && !hasSuccessState) {
      mpesaPanel.hidden = true;
      setMpesaCheckoutStatus("", "info");
    }
    if (mpesaPanel && cart.length === 0 && hasSuccessState) {
      mpesaPanel.hidden = false;
    }
    if (mpesaMetaNode && cart.length === 0 && hasSuccessState) {
      mpesaMetaNode.textContent = "Payment complete";
    }
  }

  function renderHeader() {
    const target = document.querySelector("[data-site-header]");

    if (!target) {
      return;
    }

    const currentPage = document.body.dataset.page || "";
    const isShopFamilyPage = currentPage === "shop" || currentPage === "product";
    const useMinimalCategoriesHeader = currentPage === "categories";
    const collapseMobileSearch = currentPage === "home";
    const showMobileSearch = [
      "home",
      "shop",
      "product",
      "categories",
      "cart",
      "wishlist",
      "journal",
      "landing",
      "about",
      "contact",
      "faq",
      "account",
      "order",
      "login",
      "terms",
      "privacy",
      "returns",
      "article",
      "leadership",
      "404"
    ].includes(currentPage);
    const primaryNavLinks = [
      { href: "index.html", icon: "home", label: "Home", isActive: currentPage === "home" },
      { href: "shop.html", icon: "shop", label: "Shop", isActive: isShopFamilyPage },
      { href: "about.html", icon: "about", label: "About", isActive: currentPage === "about" },
      { href: "contact.html", icon: "contact", label: "Contact", isActive: currentPage === "contact" }
    ];
    const categoryCardsMarkup = (data.categories || [])
      .slice(0, 6)
      .map(
        (category) =>
          `
            <a class="site-nav-category-card" href="shop.html?category=${encodeURIComponent(category.slug)}" data-analytics-label="Header Category Shortcut">
              <strong>${category.name}</strong>
              <small>${normalizeText(category.tip) || "Explore now"}</small>
            </a>
          `
      )
      .join("");
    const primaryNavMarkup = primaryNavLinks
      .map(
        (link) =>
          `<a href="${link.href}" class="${link.isActive ? "is-active" : ""}"><span>${link.label}</span></a>`
      )
      .join("");
    const searchValue = normalizeText(new URL(window.location.href).searchParams.get("q"));

    target.innerHTML = `
      <div class="promo-bar">
        <div class="container promo-bar-inner">
          <p>${data.site.promo}</p>
        </div>
      </div>
      <header class="site-header">
        <div class="container header-shell">
          <div class="header-leading">
            ${
              useMinimalCategoriesHeader
                ? ""
                : `
            <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
              <span class="nav-toggle-icon">${menuIconMarkup()}</span>
              <span class="nav-toggle-label">Menu</span>
            </button>
            `
            }
            <a class="brand-mark" href="index.html" aria-label="SharonCraft home">
              <img class="brand-logo" src="assets/images/sharoncraft-logo-transparent.webp" alt="SharonCraft logo" decoding="async" />
              <span class="brand-copy">
                <strong>${data.site.name}</strong>
                <small>Handmade joy from Kenya</small>
              </span>
            </a>
          </div>
          ${
            useMinimalCategoriesHeader
              ? ""
              : `
          <nav id="site-nav" class="site-nav" aria-label="Main navigation">
            <div class="site-nav-section">
              <span class="site-nav-title">Browse</span>
              <div class="site-nav-links">
                ${primaryNavMarkup}
              </div>
            </div>
            <div class="site-nav-utility-links">
              <a href="account.html">My Account</a>
              <a href="order.html">Track Order</a>
              <a href="contact.html">Contact</a>
            </div>
          </nav>
          <button class="site-nav-backdrop" type="button" aria-label="Close menu"></button>
          `
          }
          <div class="header-actions">
            ${
              showMobileSearch && collapseMobileSearch
                ? `
            <button class="mobile-search-toggle" type="button" id="mobile-search-toggle" aria-expanded="false" aria-controls="mobile-header-search-panel" aria-label="Open search">
              <span class="header-search-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
              </span>
            </button>
            `
                : ""
            }
            <form action="shop.html" method="get" class="global-desktop-search" aria-label="Sitewide search">
              <span class="header-search-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
              </span>
              <input type="search" name="q" placeholder="Search products..." value="${escapeHtml(searchValue)}" aria-label="Search keyword" />
              <button type="submit">Find</button>
            </form>
            <a class="account-header-button ${currentPage === "account" ? "is-active" : ""}" href="account.html" aria-label="Open your SharonCraft account">
              ${navIconMarkup("account")}
              <span class="account-header-label">Account</span>
            </a>
            <button class="cart-header-button" type="button" id="cart-open-button" aria-label="Open cart">
              ${cartIconMarkup()}
              <span>Cart</span>
              <strong data-cart-count>0</strong>
            </button>
          </div>
          <nav class="header-primary-nav" aria-label="Primary page links">
            ${primaryNavMarkup}
          </nav>
        </div>
        ${
          showMobileSearch
            ? `
          <div class="container mobile-header-search-wrap${collapseMobileSearch ? " is-collapsible" : ""}" id="mobile-header-search-panel">
            <form class="mobile-header-search" action="shop.html" method="get">
              <span class="header-search-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
              </span>
              <input type="search" name="q" placeholder="Search products, gifts, decor..." value="${escapeHtml(searchValue)}" aria-label="Search SharonCraft products" />
              <button type="submit">Find</button>
            </form>
          </div>
        `
            : ""
        }
      </header>
    `;

    const toggleButton = target.querySelector(".nav-toggle");
    const nav = target.querySelector(".site-nav");
    const navBackdrop = target.querySelector(".site-nav-backdrop");
    const cartOpenButton = target.querySelector("#cart-open-button");
    const mobileSearchToggleButton = target.querySelector("#mobile-search-toggle");
    const mobileSearchPanel = target.querySelector("#mobile-header-search-panel");
    const mobileSearchInput = mobileSearchPanel ? mobileSearchPanel.querySelector('input[type="search"]') : null;
    let closeMobileSearch = function () {};

    if (mobileSearchToggleButton && mobileSearchPanel) {
      const syncMobileSearchState = function (isOpen) {
        mobileSearchPanel.classList.toggle("is-open", isOpen);
        mobileSearchToggleButton.setAttribute("aria-expanded", String(isOpen));
        mobileSearchToggleButton.setAttribute("aria-label", isOpen ? "Close search" : "Open search");
      };

      closeMobileSearch = function () {
        syncMobileSearchState(false);
      };

      syncMobileSearchState(false);

      mobileSearchToggleButton.addEventListener("click", function () {
        const shouldOpen = !mobileSearchPanel.classList.contains("is-open");
        syncMobileSearchState(shouldOpen);
        if (shouldOpen && mobileSearchInput) {
          window.setTimeout(function () {
            mobileSearchInput.focus();
          }, 60);
        }
      });

      window.addEventListener("resize", function () {
        if (window.innerWidth > 760) {
          closeMobileSearch();
        }
      });
    }

    if (toggleButton && nav) {
      const syncNavState = function (isOpen) {
        nav.classList.toggle("is-open", isOpen);
        if (navBackdrop) {
          navBackdrop.classList.toggle("is-visible", isOpen);
        }
        document.body.classList.toggle("nav-open", isOpen);
        toggleButton.setAttribute("aria-expanded", String(isOpen));

        const mobileMenuButton = document.getElementById("mobile-bottom-menu-button");
        if (mobileMenuButton) {
          mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
        }
      };

      const closeNav = function () {
        syncNavState(false);
      };

      const toggleNav = function () {
        closeMobileSearch();
        syncNavState(!nav.classList.contains("is-open"));
      };

      window.SharonCraftLayout = window.SharonCraftLayout || {};
      window.SharonCraftLayout.closeNav = closeNav;
      window.SharonCraftLayout.toggleNav = toggleNav;

      toggleButton.addEventListener("click", function () {
        toggleNav();
      });

      if (navBackdrop) {
        navBackdrop.addEventListener("click", closeNav);
      }

      nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeNav);
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          closeNav();
        }
      });

      window.addEventListener("resize", function () {
        if (window.innerWidth >= 980) {
          closeNav();
        }
      });
    }

    if (cartOpenButton) {
      cartOpenButton.addEventListener("click", function () {
        closeMobileSearch();
        openCart();
      });
    }
  }

  function renderFooter() {
    const target = document.querySelector("[data-site-footer]");

    if (!target) {
      return;
    }

    const currentPage = document.body.dataset.page || "";
    const visibleSocials = (Array.isArray(data.site.socials) ? data.site.socials : [])
      .filter((social) => normalizeText(social && social.url) && normalizeText(social && social.url) !== "#");

    const socialMarkup = visibleSocials
      .map(
        (social) =>
          `<a href="${social.url}" ${social.url !== "#" ? 'target="_blank" rel="noreferrer"' : ""}>${social.label}</a>`
      )
      .join("");

    const shopLinkMarkup = [
      { href: "shop.html", label: "Shop all" },
      { href: "maasai-jewelry-kenya.html", label: "Jewelry" },
      { href: "gift-sets-kenya.html", label: "Gift sets" },
      { href: "african-home-decor-nairobi.html", label: "Home decor" }
    ]
      .map((link) => `<li><a href="${link.href}">${link.label}</a></li>`)
      .join("");
    const helpLinkMarkup = [
      { href: `https://wa.me/${data.site.whatsapp}?text=${encodeURIComponent("Hello SharonCraft, I would like help choosing a product.")}`, label: "WhatsApp help", external: true },
      { href: "contact.html", label: "Contact" },
      { href: "order.html", label: "Track order" },
      { href: "faq.html", label: "FAQ" },
      { href: "returns.html", label: "Returns" },
      { href: "privacy.html", label: "Privacy" },
      { href: "#", label: "Cookie settings", settings: true }
    ]
      .map((link) => {
        if (link.settings) {
          return `<li><button class="footer-link-button" type="button" data-open-cookie-settings="true">${link.label}</button></li>`;
        }

        return `<li><a href="${link.href}"${link.external ? ' target="_blank" rel="noreferrer"' : ""}>${link.label}</a></li>`;
      })
      .join("");

    target.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <section class="footer-brand">
            <span class="section-kicker">${data.site.name || "SharonCraft"}</span>
            <h2>${data.site.tagline || "Colorful handmade beadwork for homes, gifts, and joyful moments."}</h2>
            <p>Browse the collection, ask what you need, and finish your order in a simple personal way.</p>
          </section>
          <div class="footer-columns">
            <section class="footer-panel footer-panel-contact footer-accordion-panel is-open">
              <button class="footer-accordion-toggle" type="button" aria-expanded="true">
                <span>Contact</span>
                <span class="footer-accordion-icon" aria-hidden="true">&plus;</span>
              </button>
              <ul class="footer-list footer-accordion-content">
                <li><a href="tel:${data.site.phone}">${data.site.phone}</a></li>
                <li><a href="mailto:${data.site.email}">${data.site.email}</a></li>
                <li>${data.site.location}</li>
              </ul>
            </section>
            <section class="footer-panel footer-accordion-panel">
              <button class="footer-accordion-toggle" type="button" aria-expanded="false">
                <span>Shop</span>
                <span class="footer-accordion-icon" aria-hidden="true">&plus;</span>
              </button>
              <ul class="footer-list footer-link-list footer-accordion-content">
                ${shopLinkMarkup}
              </ul>
            </section>
            <section class="footer-panel footer-accordion-panel">
              <button class="footer-accordion-toggle" type="button" aria-expanded="false">
                <span>Help</span>
                <span class="footer-accordion-icon" aria-hidden="true">&plus;</span>
              </button>
              <ul class="footer-list footer-link-list footer-accordion-content">
                ${helpLinkMarkup}
              </ul>
            </section>
            <section class="footer-panel footer-accordion-panel">
              <button class="footer-accordion-toggle" type="button" aria-expanded="false">
                <span>Follow</span>
                <span class="footer-accordion-icon" aria-hidden="true">&plus;</span>
              </button>
              <div class="footer-socials footer-accordion-content">
                ${socialMarkup || '<span class="footer-social-placeholder">Add Facebook and Instagram links in the admin social section.</span>'}
              </div>
            </section>
          </div>
        </div>
      </footer>
      <nav class="mobile-bottom-nav" aria-label="Mobile quick navigation">
        <a class="mobile-bottom-nav-link ${currentPage === "home" ? "is-active" : ""}" href="index.html">
          ${navIconMarkup("home")}
          <span>Home</span>
        </a>
        <a class="mobile-bottom-nav-link ${currentPage === "shop" || currentPage === "product" ? "is-active" : ""}" href="shop.html">
          ${navIconMarkup("shop")}
          <span>Shop</span>
        </a>
        <button class="mobile-bottom-nav-link mobile-bottom-cart" type="button" id="mobile-bottom-cart-button" aria-label="Open cart">
          ${cartIconMarkup()}
          <span>Cart</span>
          <strong data-cart-count>0</strong>
        </button>
        <a class="mobile-bottom-nav-link ${currentPage === "account" ? "is-active" : ""}" href="account.html">
          ${navIconMarkup("account")}
          <span>Account</span>
        </a>
      </nav>
      <div class="cart-backdrop" id="cart-backdrop"></div>
      <aside class="cart-drawer" id="cart-drawer" aria-hidden="true">
        <div class="cart-drawer-header">
          <div>
            <span class="section-kicker">Your Cart</span>
            <h3>Review your picks and finish the order comfortably</h3>
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
          <div class="cart-summary-actions">
            <button id="cart-mpesa-open" class="button button-secondary" type="button">Payment update</button>
            <a id="cart-checkout" class="button button-primary" href="${buildCartMessage()}" target="_blank" rel="noreferrer" data-analytics-label="Cart Checkout WhatsApp">Continue on WhatsApp</a>
          </div>
          <span class="payment-status-badge">M-Pesa temporarily unavailable</span>
        </div>
        <section id="cart-mpesa-panel" class="cart-mpesa-panel" hidden>
          <div class="cart-mpesa-head">
            <div>
              <span class="section-kicker">Payment Update</span>
              <h4>M-Pesa is taking a short break</h4>
            </div>
            <strong id="cart-mpesa-meta">Add a few favorites before you message SharonCraft</strong>
          </div>
          <p class="cart-mpesa-copy">For now, the quickest way to finish your order is on WhatsApp. SharonCraft will guide you to the best available payment option there.</p>
          <div class="cart-mpesa-form">
            <div class="cart-mpesa-actions">
              <a id="cart-mpesa-whatsapp" class="button button-primary" href="${buildCartMessage()}" target="_blank" rel="noreferrer">Continue on WhatsApp</a>
              <button id="cart-mpesa-cancel" class="button button-secondary" type="button">Close</button>
            </div>
          </div>
        </section>
      </aside>
      <a class="floating-whatsapp" href="${buildWhatsAppUrl("Hello SharonCraft, I would like to chat about your products.")}" target="_blank" rel="noreferrer" data-analytics-label="Floating WhatsApp">
        WhatsApp
      </a>
      <button class="scroll-top" type="button" aria-label="Scroll to top">
        <span class="scroll-top-label">Top</span>
        <span class="scroll-top-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M6 14l6-6 6 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </span>
      </button>
    `;

    const scrollButton = target.querySelector(".scroll-top");
    const closeButton = target.querySelector("#cart-close-button");
    const backdrop = target.querySelector("#cart-backdrop");
    const mobileBottomMenuButton = target.querySelector("#mobile-bottom-menu-button");
    const mobileBottomCartButton = target.querySelector("#mobile-bottom-cart-button");
    const mpesaOpenButton = target.querySelector("#cart-mpesa-open");
    const mpesaCancelButton = target.querySelector("#cart-mpesa-cancel");
    const mpesaForm = target.querySelector("#cart-mpesa-form");

    target.querySelectorAll(".footer-accordion-toggle").forEach(function (button) {
      button.addEventListener("click", function () {
        if (window.innerWidth > 700) {
          return;
        }

        const panel = button.closest(".footer-accordion-panel");
        if (!panel) {
          return;
        }

        const isOpen = panel.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
      });
    });

    bindCookieSettingsTriggers(target);

    if (scrollButton) {
      scrollButton.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      let scrollQueued = false;
      const updateScrollButton = function () {
        scrollQueued = false;
        scrollButton.classList.toggle("is-visible", window.scrollY > 420);
      };

      window.addEventListener("scroll", function () {
        if (scrollQueued) {
          return;
        }

        scrollQueued = true;
        if (typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(updateScrollButton);
          return;
        }

        window.setTimeout(updateScrollButton, 16);
      }, { passive: true });
    }

    if (closeButton) {
      closeButton.addEventListener("click", closeCart);
    }

    if (backdrop) {
      backdrop.addEventListener("click", closeCart);
    }

    if (mobileBottomMenuButton) {
      mobileBottomMenuButton.addEventListener("click", function () {
        if (window.SharonCraftLayout && typeof window.SharonCraftLayout.toggleNav === "function") {
          window.SharonCraftLayout.toggleNav();
        }
      });
    }

    if (mobileBottomCartButton) {
      mobileBottomCartButton.addEventListener("click", openCart);
    }

    if (mpesaOpenButton) {
      mpesaOpenButton.addEventListener("click", function () {
        openMpesaCheckoutPanel();
      });
    }

    if (mpesaCancelButton) {
      mpesaCancelButton.addEventListener("click", closeMpesaCheckoutPanel);
    }

    if (mpesaForm) {
      mpesaForm.addEventListener("submit", handleMpesaCheckoutSubmit);
    }
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");

    if (shouldUseMobilePerformanceMode() || !("IntersectionObserver" in window) || !items.length) {
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
    if (cartEventsBound) {
      return;
    }
    cartEventsBound = true;

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
      let removedLegacyRootWorker = false;

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
              removedLegacyRootWorker = true;
            }
          } catch (error) {
            console.warn("Unable to inspect a service worker registration.", error);
          }
        })
      );

      if (removedLegacyRootWorker && "caches" in window) {
        try {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
        } catch (error) {
          console.warn("Unable to clear legacy browser caches.", error);
        }
      }
    } catch (error) {
      console.warn("Unable to check for legacy service workers.", error);
    }
  }

  function scheduleBackgroundTask(task, timeout) {
    const safeTask = typeof task === "function" ? task : function () {};
    const delay = Math.max(0, Number(timeout) || 0);

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(function () {
        safeTask();
      }, { timeout: Math.max(1000, delay || 1000) });
      return;
    }

    window.setTimeout(safeTask, delay);
  }

  async function hydrateSharedShell() {
    siteContentOverrides = readStoredSiteContent();
    if (siteContentOverrides) {
      mergeBrandingIntoSiteData(siteContentOverrides.branding);
      mergePricingIntoSiteData(siteContentOverrides);
      refreshProductPricesFromSitePricing();
    }

    await unregisterLegacyRootServiceWorker();
    ensureCookieConsentUi();
    syncAnalyticsConsentWithGoogle();
    ensureAnalyticsDebugPanel();
    bindAnalyticsEvents();
    bindCookieSettingsTriggers(document);
    window.addEventListener("online", function () {
      scheduleAnalyticsFlush(200);
      analyticsDebugState.note = "Browser is online. Retrying queued analytics sync.";
      updateAnalyticsDebugPanel();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        scheduleAnalyticsFlush(200);
        analyticsDebugState.note = "Page became visible. Checking queued analytics again.";
        updateAnalyticsDebugPanel();
      }
    });
    window.addEventListener("pagehide", function () {
      flushAnalyticsQueue();
    });
    scheduleAnalyticsFlush(200);
    setSiteStructuredData();
    trackEvent("page_view", {
      page_title: document.title,
      page_location: window.location.href
    });
    renderHeader();
    renderFooter();
    applySiteContentOverrides(siteContentOverrides);
    initReveal();
    renderCartUi();
    startCartTimer();
    bindCartEvents();

    if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
      window.SharonCraftLiveSync.ready
        .then(function () {
          data.products = (Array.isArray(data.products) ? data.products : []).map(applyPricingToProduct);
          siteContentOverrides = readStoredSiteContent();
          if (siteContentOverrides) {
            mergeBrandingIntoSiteData(siteContentOverrides.branding);
            mergePricingIntoSiteData(siteContentOverrides);
            refreshProductPricesFromSitePricing();
          }
          renderHeader();
          renderFooter();
          applySiteContentOverrides(siteContentOverrides);
          renderCartUi();
          bindCartEvents();
          initReveal();
        })
        .catch(function (error) {
          console.warn("Unable to refresh shared shell after live storefront sync.", error);
        });
    }
  }

  scheduleBackgroundTask(function () {
    loadReviewSummaries().catch(function (error) {
      console.warn("Unable to load review summaries in the background.", error);
    });
  }, 900);
  ensureMobilePerformanceStyles();
  document.addEventListener("DOMContentLoaded", hydrateSharedShell);

  window.SharonCraftUtils = {
    get data() { return data; }, // Dynamic getter for current data
    formatCurrency,
    buildWhatsAppUrl,
    buildProductSharePath,
    buildProductWhatsAppMessage,
    getProductById,
    getProductImages,
    getCategoryBySlug,
    getProductsByCategory,
    getRelatedProducts,
    loadReviewSummaries,
    getApprovedReviewsForProduct,
    getProductReviewSummary,
    createProductCard,
    createCategoryCard,
    getScarcityNote,
    setPageMetadata,
    setStructuredData,
    trackEvent,
    trackProductListView,
    buildAnalyticsItem,
    getTrackedEvents: getStoredAnalyticsEvents,
    getPricingSettings,
    calculateWebsitePrice,
    applyPricingToProduct,
    renderCategorySelect,
    refreshReveal: initReveal,
    addToCart,
    openCart,
    closeCart,
    getWishlist,
    toggleWishlist,
    removeFromWishlist,
    ensureCartTimer,
    getTimeRemaining,
    formatTimeRemaining,
    waitForData
  };
})();
