(function () {
  const logoutButton = document.getElementById("admin-logout");
  let authChecked = false;

  async function checkAdminAuth() {
    try {
      const adminMiddleware = window.SharonCraftAdminMiddleware;
      if (!adminMiddleware || typeof adminMiddleware.requireAdmin !== "function") {
        throw new Error("Admin middleware is not available.");
      }

      const user = await adminMiddleware.requireAdmin({
        loginPage: "login.html",
        redirectTo: "login.html?redirect=admin.html",
        fallback: "account.html",
      });

      if (!user) {
        return;
      }

      showLogoutButton();
      authChecked = true;
    } catch (error) {
      console.error("Admin auth error:", error);
      window.location.href = "login.html?redirect=admin.html";
    }
  }

  function showLogoutButton() {
    if (!logoutButton) {
      return;
    }

    logoutButton.style.display = "block";
    logoutButton.addEventListener("click", handleLogout);
  }

  async function handleLogout() {
    try {
      const controller = window.SharonCraftUserController;
      if (controller && typeof controller.signOut === "function") {
        await controller.signOut();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    window.location.href = "index.html";
  }

  checkAdminAuth();

  window.AdminAuth = {
    checkAdminAuth,
    authChecked: function () {
      return authChecked;
    },
  };
}());
