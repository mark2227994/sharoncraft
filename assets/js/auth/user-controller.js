(function () {
  async function requireCatalog() {
    const authState = window.SharonCraftAuthState;
    const catalog = authState && typeof authState.waitForCatalog === "function"
      ? await authState.waitForCatalog()
      : null;

    if (!catalog) {
      throw new Error("Supabase is not configured yet.");
    }

    return catalog;
  }

  function normalizeProfile(profile) {
    const source = profile && typeof profile === "object" ? profile : {};
    return {
      email: String(source.email || "").trim(),
      fullName: String(source.fullName || source.full_name || source.name || "").trim(),
      phone: String(source.phone || "").trim(),
      deliveryArea: String(source.deliveryArea || source.delivery_area || source.location || "").trim(),
    };
  }

  async function signIn(email, password) {
    const catalog = await requireCatalog();
    return catalog.signInWithPassword(email, password);
  }

  async function signOut() {
    const catalog = await requireCatalog();
    return catalog.signOut();
  }

  async function signUpCustomer(profile, password) {
    const catalog = await requireCatalog();
    const normalized = normalizeProfile(profile);
    return catalog.signUpWithPassword(normalized.email, password, normalized);
  }

  async function getCurrentUser() {
    const authState = window.SharonCraftAuthState;
    if (!authState || typeof authState.getCurrentUser !== "function") {
      return null;
    }
    return authState.getCurrentUser();
  }

  async function getCustomerProfile() {
    const catalog = await requireCatalog();
    return catalog.fetchCustomerProfile();
  }

  async function saveCustomerProfile(profile) {
    const catalog = await requireCatalog();
    return catalog.saveCustomerProfile(normalizeProfile(profile));
  }

  async function requestPasswordReset(email, redirectTo) {
    const catalog = await requireCatalog();
    const client = catalog.getClient();
    const emailAddress = String(email || "").trim();
    if (!emailAddress) {
      throw new Error("Email is required.");
    }

    const redirectUrl = String(redirectTo || "").trim() || window.location.href;
    const result = await client.auth.resetPasswordForEmail(emailAddress, {
      redirectTo: redirectUrl,
    });

    if (result.error) {
      throw result.error;
    }

    return true;
  }

  async function updatePassword(nextPassword) {
    const catalog = await requireCatalog();
    const client = catalog.getClient();
    const password = String(nextPassword || "");
    if (password.length < 6) {
      throw new Error("Use a password with at least 6 characters.");
    }

    const result = await client.auth.updateUser({ password });
    if (result.error) {
      throw result.error;
    }

    return result.data;
  }

  window.SharonCraftUserController = {
    normalizeProfile,
    signIn,
    signOut,
    signUpCustomer,
    getCurrentUser,
    getCustomerProfile,
    saveCustomerProfile,
    requestPasswordReset,
    updatePassword,
  };
}());
