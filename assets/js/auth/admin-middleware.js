(function () {
  async function requireAdmin(options) {
    const settings = options && typeof options === "object" ? options : {};
    const sessionMiddleware = window.SharonCraftSessionMiddleware;
    const authState = window.SharonCraftAuthState;
    const catalog = authState && typeof authState.waitForCatalog === "function"
      ? await authState.waitForCatalog()
      : null;

    if (!catalog) {
      const fallbackLogin = "login.html?redirect=admin.html";
      if (settings.redirect !== false) {
        window.location.href = fallbackLogin;
      }
      return null;
    }

    const user = sessionMiddleware
      ? await sessionMiddleware.requireAuth({
          loginPage: settings.loginPage || "login.html",
          redirectTo: settings.redirectTo || "login.html?redirect=admin.html",
          redirect: settings.redirect,
        })
      : await authState.getCurrentUser();

    if (!user) {
      return null;
    }

    const isAdmin = typeof catalog.isAdmin === "function"
      ? await catalog.isAdmin()
      : false;

    if (isAdmin) {
      return user;
    }

    if (settings.redirect !== false) {
      window.location.href = authState.getSafeRedirect(settings.fallback || "account.html", "account.html");
    }

    return null;
  }

  window.SharonCraftAdminMiddleware = {
    requireAdmin,
  };
}());
