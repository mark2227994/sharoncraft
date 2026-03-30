(function () {
  async function requireAuth(options) {
    const settings = options && typeof options === "object" ? options : {};
    const authState = window.SharonCraftAuthState;
    if (!authState) {
      throw new Error("Auth state is not available.");
    }

    const user = await authState.getCurrentUser();
    if (user) {
      return user;
    }

    const loginPage = String(settings.loginPage || "account.html").trim() || "account.html";
    const fallback = loginPage.includes("?") ? loginPage : `${loginPage}?redirect=${authState.buildRedirectParam()}`;
    const redirectTo = settings.redirectTo
      ? authState.getSafeRedirect(settings.redirectTo, fallback)
      : fallback;

    if (settings.redirect !== false) {
      window.location.href = redirectTo;
    }

    return null;
  }

  async function redirectIfAuthenticated(target, fallback) {
    const authState = window.SharonCraftAuthState;
    if (!authState) {
      return false;
    }

    const user = await authState.getCurrentUser();
    if (!user) {
      return false;
    }

    window.location.href = authState.getSafeRedirect(target, fallback || "index.html");
    return true;
  }

  window.SharonCraftSessionMiddleware = {
    requireAuth,
    redirectIfAuthenticated,
  };
}());
