(function () {
  const wait = (ms) => new Promise(function (resolve) {
    window.setTimeout(resolve, ms);
  });

  function getCatalog() {
    if (!window.SharonCraftCatalog || typeof window.SharonCraftCatalog.isConfigured !== "function") {
      return null;
    }
    return window.SharonCraftCatalog.isConfigured() ? window.SharonCraftCatalog : null;
  }

  async function waitForCatalog(timeoutMs) {
    const timeout = Math.max(500, Number(timeoutMs) || 5000);
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeout) {
      const catalog = getCatalog();
      if (catalog) {
        return catalog;
      }
      await wait(120);
    }

    return getCatalog();
  }

  function getSafeRedirect(target, fallback) {
    const safeFallback = String(fallback || "index.html").trim() || "index.html";
    const raw = String(target || "").trim();
    if (!raw) {
      return safeFallback;
    }

    try {
      const url = new URL(raw, window.location.href);
      if (url.origin !== window.location.origin) {
        return safeFallback;
      }
      return `${url.pathname}${url.search}${url.hash}`;
    } catch (error) {
      return safeFallback;
    }
  }

  function buildRedirectParam(pathname) {
    const target = String(pathname || `${window.location.pathname}${window.location.search}` || "").trim();
    return encodeURIComponent(target || "index.html");
  }

  async function getCurrentUser() {
    const catalog = await waitForCatalog();
    if (!catalog || typeof catalog.getCurrentUser !== "function") {
      return null;
    }
    return catalog.getCurrentUser();
  }

  async function getSession() {
    const catalog = await waitForCatalog();
    if (!catalog || typeof catalog.getClient !== "function") {
      return null;
    }

    const client = catalog.getClient();
    if (!client || !client.auth || typeof client.auth.getSession !== "function") {
      return null;
    }

    const result = await client.auth.getSession();
    if (result.error) {
      throw result.error;
    }

    return result.data && result.data.session ? result.data.session : null;
  }

  async function redirectTo(target, fallback) {
    window.location.href = getSafeRedirect(target, fallback);
  }

  function onAuthStateChange(callback) {
    const catalog = getCatalog();
    if (!catalog || typeof catalog.onAuthStateChange !== "function") {
      return function noop() {};
    }
    return catalog.onAuthStateChange(callback);
  }

  window.SharonCraftAuthState = {
    waitForCatalog,
    getCatalog,
    getCurrentUser,
    getSession,
    onAuthStateChange,
    getSafeRedirect,
    buildRedirectParam,
    redirectTo,
  };
}());
