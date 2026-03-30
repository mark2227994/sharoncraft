document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const statusDiv = document.getElementById("login-status");
  const urlParams = new URLSearchParams(window.location.search);
  const authState = window.SharonCraftAuthState;
  const userController = window.SharonCraftUserController;
  const sessionMiddleware = window.SharonCraftSessionMiddleware;
  const redirect = authState
    ? authState.getSafeRedirect(urlParams.get("redirect"), "admin.html")
    : "admin.html";

  function setStatus(message, isError) {
    statusDiv.textContent = String(message || "").trim();
    statusDiv.className = `login-status ${isError ? "error" : "success"}`;
  }

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = String(document.getElementById("email").value || "").trim();
    const password = String(document.getElementById("password").value || "");

    if (!email || !password) {
      setStatus("Please enter both email and password.", true);
      return;
    }

    setStatus("Logging in...");

    try {
      if (!userController || typeof userController.signIn !== "function") {
        throw new Error("User controller is not ready yet.");
      }

      await userController.signIn(email, password);
      setStatus("Login successful. Redirecting...");
      window.setTimeout(function () {
        window.location.href = redirect;
      }, 500);
    } catch (error) {
      setStatus(`Login failed: ${(error && error.message) || "Unknown server error"}`, true);
    }
  });

  async function checkAuth() {
    try {
      if (sessionMiddleware && typeof sessionMiddleware.redirectIfAuthenticated === "function") {
        await sessionMiddleware.redirectIfAuthenticated(redirect, "admin.html");
      }
    } catch (error) {
      console.error("Auth check error:", error);
    }
  }

  checkAuth();
});
