document.addEventListener("DOMContentLoaded", async function () {
  const accountApi = window.SharonCraftCatalog;
  const userController = window.SharonCraftUserController;
  const utils = window.SharonCraftUtils;
  const statusNode = document.getElementById("account-status");
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("customer-login-form");
  const profileForm = document.getElementById("profile-form");
  const logoutButton = document.getElementById("account-logout");
  const editToggleButton = document.getElementById("account-edit-toggle");
  const managePanel = document.getElementById("account-manage-panel");
  const switchToRegisterButton = document.getElementById("switch-to-register");
  const summaryGreeting = document.getElementById("account-summary-greeting");
  const panelNodes = {
    register: document.getElementById("auth-panel-register"),
    login: document.getElementById("auth-panel-login"),
    summary: document.getElementById("auth-panel-summary"),
  };
  const switchNodes = Array.from(document.querySelectorAll("[data-auth-target]"));

  function setStatus(message, tone) {
    statusNode.textContent = String(message || "").trim();
    statusNode.className = "account-status";
    if (tone === "error" || tone === "success") {
      statusNode.classList.add(tone);
    }
  }

  function switchPanel(name) {
    Object.keys(panelNodes).forEach(function (panelName) {
      const panel = panelNodes[panelName];
      if (!panel) {
        return;
      }
      panel.classList.toggle("is-active", panelName === name);
    });

    switchNodes.forEach(function (button) {
      const active = button.dataset.authTarget === name;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  function getProfileFromForm(form) {
    const formData = new FormData(form);
    return {
      fullName: String(formData.get("full_name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      deliveryArea: String(formData.get("delivery_area") || "").trim(),
    };
  }

  function fillProfileForm(profile) {
    const safeProfile = profile || {};
    const fullNameInput = document.getElementById("profile-full-name");
    const phoneInput = document.getElementById("profile-phone");
    const areaInput = document.getElementById("profile-delivery-area");

    if (fullNameInput) {
      fullNameInput.value = safeProfile.fullName || "";
    }
    if (phoneInput) {
      phoneInput.value = safeProfile.phone || "";
    }
    if (areaInput) {
      areaInput.value = safeProfile.deliveryArea || "";
    }
  }

  function setManagePanel(open) {
    if (!managePanel) {
      return;
    }
    managePanel.hidden = !open;
    if (editToggleButton) {
      editToggleButton.textContent = open ? "Hide Edit Form" : "Update Saved Details";
    }
  }

  function renderSummary(user, profile) {
    const safeProfile = profile || {};
    const displayName = safeProfile.fullName || user.email || "SharonCraft client";

    summaryGreeting.textContent = `Welcome, ${displayName.split(" ")[0] || "friend"}`;
    fillProfileForm(safeProfile);
    setManagePanel(false);
    switchPanel("summary");
  }

  async function loadSignedInState(statusMessage) {
    if (!accountApi || !accountApi.isConfigured || !accountApi.isConfigured() || !userController) {
      setStatus("Supabase is not configured yet. Add your project URL and publishable key first.", "error");
      return;
    }

    const user = await userController.getCurrentUser();
    if (!user) {
      if (statusMessage) {
        setStatus(statusMessage, "success");
      }
      return;
    }

    const profile = await userController.getCustomerProfile();
    renderSummary(user, profile);
    setStatus(statusMessage || "You are signed in. Your details stay saved privately for future orders.", "success");
  }

  if (utils && typeof utils.setPageMetadata === "function") {
    utils.setPageMetadata({
      title: "SharonCraft Account | Login or Register",
      description: "Create or sign in to your SharonCraft customer account and keep your details ready for future orders.",
      path: "/account.html",
      image: "assets/images/sharoncraft-logo-transparent.png",
      type: "website",
    });
  }

  switchNodes.forEach(function (button) {
    button.addEventListener("click", function () {
      switchPanel(button.dataset.authTarget || "register");
      setStatus("");
    });
  });

  if (switchToRegisterButton) {
    switchToRegisterButton.addEventListener("click", function () {
      switchPanel("register");
      setStatus("");
    });
  }

  if (editToggleButton) {
    editToggleButton.addEventListener("click", function () {
      const willOpen = managePanel ? managePanel.hidden : false;
      setManagePanel(willOpen);
      if (willOpen) {
        setStatus("You can update your saved details here. They will stay private after saving.");
      }
    });
  }

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!accountApi || !accountApi.isConfigured || !accountApi.isConfigured() || !userController) {
      setStatus("Supabase is not configured yet. Please connect this page to your Supabase project first.", "error");
      return;
    }

    const profile = getProfileFromForm(registerForm);
    const password = String(document.getElementById("register-password").value || "");
    const passwordConfirm = String(document.getElementById("register-password-confirm").value || "");

    if (!profile.fullName || !profile.email || !profile.phone || !profile.deliveryArea || !password) {
      setStatus("Please fill in all registration fields before creating your account.", "error");
      return;
    }

    if (password.length < 6) {
      setStatus("Use a password with at least 6 characters.", "error");
      return;
    }

    if (password !== passwordConfirm) {
      setStatus("Your passwords do not match yet. Please re-enter them.", "error");
      return;
    }

    setStatus("Creating your SharonCraft account...");

    try {
      const result = await userController.signUpCustomer(profile, password);
      registerForm.reset();

      if (result && result.session && result.user) {
        await loadSignedInState("Your account has been created and your details were saved.");
        return;
      }

      switchPanel("login");
      setStatus("Your account has been created. Check your email if confirmation is enabled, then sign in here.", "success");
    } catch (error) {
      setStatus((error && error.message) || "We could not create your account right now.", "error");
    }
  });

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!accountApi || !accountApi.isConfigured || !accountApi.isConfigured() || !userController) {
      setStatus("Supabase is not configured yet. Please connect this page to your Supabase project first.", "error");
      return;
    }

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setStatus("Enter both your email and password to continue.", "error");
      return;
    }

    setStatus("Signing you in...");

    try {
      await userController.signIn(email, password);
      await loadSignedInState("Welcome back. Your saved details are ready.");
      loginForm.reset();
    } catch (error) {
      setStatus((error && error.message) || "We could not sign you in right now.", "error");
    }
  });

  profileForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!accountApi || !accountApi.isConfigured || !accountApi.isConfigured() || !userController) {
      setStatus("Supabase is not configured yet. Please connect this page to your Supabase project first.", "error");
      return;
    }

    const profile = getProfileFromForm(profileForm);
    if (!profile.fullName || !profile.phone || !profile.deliveryArea) {
      setStatus("Please complete your saved details before updating your profile.", "error");
      return;
    }

    setStatus("Saving your profile...");

    try {
      const savedProfile = await userController.saveCustomerProfile(profile);
      const user = await userController.getCurrentUser();
      if (user) {
        renderSummary(user, savedProfile);
      }
      setStatus("Your customer details are saved privately.", "success");
    } catch (error) {
      setStatus((error && error.message) || "We could not save your profile right now.", "error");
    }
  });

  if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
      try {
        await userController.signOut();
        setManagePanel(false);
        switchPanel("login");
        setStatus("You are now logged out.");
      } catch (error) {
        setStatus((error && error.message) || "We could not log you out cleanly.", "error");
      }
    });
  }

  if (accountApi && typeof accountApi.onAuthStateChange === "function" && accountApi.isConfigured()) {
    accountApi.onAuthStateChange(async function (user) {
      if (!user) {
        setManagePanel(false);
        switchPanel("login");
        return;
      }
      try {
        const profile = await userController.getCustomerProfile();
        renderSummary(user, profile);
      } catch (error) {
        console.warn("Unable to refresh the signed-in customer profile.", error);
      }
    });
  }

  try {
    await loadSignedInState("");
  } catch (error) {
    setStatus((error && error.message) || "We could not load your account state yet.", "error");
  }
});
