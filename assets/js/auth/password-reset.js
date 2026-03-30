(function () {
  async function sendReset(email, redirectTo) {
    const controller = window.SharonCraftUserController;
    if (!controller || typeof controller.requestPasswordReset !== "function") {
      throw new Error("Password reset is not available yet.");
    }
    return controller.requestPasswordReset(email, redirectTo);
  }

  async function completeReset(password) {
    const controller = window.SharonCraftUserController;
    if (!controller || typeof controller.updatePassword !== "function") {
      throw new Error("Password update is not available yet.");
    }
    return controller.updatePassword(password);
  }

  window.SharonCraftPasswordReset = {
    sendReset,
    completeReset,
  };
}());
