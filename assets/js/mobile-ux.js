// Mobile-specific UX enhancements kept intentionally lightweight.
(function () {
  const isMobile = () => window.innerWidth <= 540;
  let currentBreakpoint = isMobile() ? "mobile" : "desktop";
  let mobileMenuBound = false;
  let touchFeedbackBound = false;
  let smoothScrollBound = false;
  let toastReady = false;

  function setupMobileMenuClosing() {
    if (!isMobile() || mobileMenuBound) {
      return;
    }

    const navToggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    if (!nav || !navToggle) {
      return;
    }

    mobileMenuBound = true;

    const closeSharedNav = function () {
      if (window.SharonCraftLayout && typeof window.SharonCraftLayout.closeNav === "function") {
        window.SharonCraftLayout.closeNav();
        return;
      }

      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    };

    document.addEventListener("click", function (event) {
      const link = event.target.closest(".site-nav a");
      if (link) {
        closeSharedNav();
        return;
      }

      if (!nav.contains(event.target) && !navToggle.contains(event.target) && nav.classList.contains("is-open")) {
        closeSharedNav();
      }
    });
  }

  function setupTouchFeedback() {
    if (!isMobile() || touchFeedbackBound) {
      return;
    }

    touchFeedbackBound = true;
    document.addEventListener("touchstart", function (event) {
      const target = event.target.closest("button, .button");
      if (target) {
        target.style.opacity = "0.78";
      }
    }, { passive: true });

    document.addEventListener("touchend", function (event) {
      const target = event.target.closest("button, .button");
      if (target) {
        target.style.opacity = "";
      }
    }, { passive: true });
  }

  function preventInputZoom() {
    document.querySelectorAll("input, select, textarea").forEach((input) => {
      input.style.fontSize = "16px";
    });
  }

  function setupSmoothScroll() {
    if (smoothScrollBound) {
      return;
    }

    smoothScrollBound = true;
    document.addEventListener("click", function (event) {
      const link = event.target.closest('a[href^="#"]');
      if (!link) {
        return;
      }

      const target = document.querySelector(link.getAttribute("href"));
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function setupImageOptimization() {
    document.querySelectorAll("img").forEach((image) => {
      if (!image.hasAttribute("loading")) {
        image.setAttribute("loading", "lazy");
      }
      image.decoding = "async";
    });
  }

  function setupToastNotifications() {
    if (toastReady || document.getElementById("toast-container")) {
      toastReady = true;
      return;
    }

    toastReady = true;

    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      z-index: 1000;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);

    window.showToast = function (message, type = "info", duration = 2600) {
      const toast = document.createElement("div");
      toast.textContent = message;
      toast.style.cssText = `
        background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
        color: white;
        padding: 12px 16px;
        border-radius: 12px;
        margin-bottom: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        font-weight: 600;
        pointer-events: auto;
        animation: toastSlideIn 0.25s ease-out;
      `;

      toastContainer.appendChild(toast);

      window.setTimeout(function () {
        toast.style.animation = "toastSlideOut 0.25s ease-in";
        window.setTimeout(function () {
          toast.remove();
        }, 250);
      }, duration);
    };

    const style = document.createElement("style");
    style.textContent = `
      @keyframes toastSlideIn {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes toastSlideOut {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    setupMobileMenuClosing();
    setupTouchFeedback();
    preventInputZoom();
    setupSmoothScroll();
    setupImageOptimization();
    setupToastNotifications();
  }

  window.addEventListener("resize", function () {
    const nextBreakpoint = isMobile() ? "mobile" : "desktop";
    if (nextBreakpoint !== currentBreakpoint) {
      currentBreakpoint = nextBreakpoint;
      init();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.MobileUX = {
    isMobile,
    init,
  };
})();
