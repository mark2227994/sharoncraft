document.addEventListener("DOMContentLoaded", async function () {
  if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
    await window.SharonCraftLiveSync.ready;
  }

  const utils = window.SharonCraftUtils;
  const catalog = window.SharonCraftCatalog;
  const cartStorageKey = "sharoncraft-cart";

  const listNode = document.getElementById("cart-page-list");
  const emptyNode = document.getElementById("cart-page-empty");
  const countNode = document.getElementById("cart-page-count");
  const summaryCountNode = document.getElementById("cart-page-summary-count");
  const totalNode = document.getElementById("cart-page-total");
  const clearButton = document.getElementById("cart-page-clear");
  const whatsappNode = document.getElementById("cart-page-whatsapp");
  const statusNode = document.getElementById("cart-page-mpesa-status");
  const form = document.getElementById("cart-page-mpesa-form");
  const submitButton = document.getElementById("cart-page-mpesa-submit");
  const nameInput = document.getElementById("cart-page-name");
  const phoneInput = document.getElementById("cart-page-phone");
  const areaInput = document.getElementById("cart-page-area");
  const emailInput = document.getElementById("cart-page-email");

  let pollTimer = null;
  let pollStartedAt = 0;

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function getCart() {
    try {
      const stored = window.localStorage.getItem(cartStorageKey) || "[]";
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && item.productId)
        .map((item) => ({
          productId: normalizeText(item.productId),
          productName: normalizeText(item.productName),
          productPrice: Number(item.productPrice) || 0,
          quantity: Math.max(0, Number(item.quantity) || 0),
        }))
        .filter((item) => item.productId && item.quantity > 0);
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }

  function getCartSummary() {
    return getCart()
      .map((item) => {
        const product = typeof utils.getProductById === "function" ? utils.getProductById(item.productId) : null;
        const displayName = item.productName || normalizeText(product && product.name) || "SharonCraft item";
        const displayPrice = Number(item.productPrice || (product && product.price) || 0);

        return {
          ...item,
          product,
          displayName,
          displayPrice,
          lineTotal: displayPrice * item.quantity,
        };
      })
      .filter((item) => item.displayName);
  }

  function buildWhatsAppUrl() {
    const items = getCartSummary();
    if (!items.length) {
      return utils.buildWhatsAppUrl("Hello SharonCraft, I would like help choosing a product.");
    }

    const lines = items.map(
      (item, index) => `${index + 1}. ${item.displayName} x${item.quantity} - ${utils.formatCurrency(item.lineTotal)}`
    );
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    return utils.buildWhatsAppUrl(
      `Hello SharonCraft, I would like to order these items:\n${lines.join("\n")}\nTotal: ${utils.formatCurrency(total)}`
    );
  }

  function setStatus(message, tone) {
    if (!statusNode) return;
    statusNode.textContent = normalizeText(message);
    statusNode.hidden = !normalizeText(message);
    statusNode.classList.remove("is-success", "is-error", "is-info");
    if (!statusNode.hidden) {
      statusNode.classList.add(tone === "success" ? "is-success" : tone === "error" ? "is-error" : "is-info");
    }
  }

  function stopPolling() {
    if (pollTimer) {
      window.clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  function setQuantity(productId, nextQuantity) {
    const cart = getCart()
      .map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item))
      .filter((item) => item.quantity > 0);
    saveCart(cart);
    render();
  }

  function createItemCard(item) {
    const article = document.createElement("article");
    article.className = "cart-page-item";

    const copy = document.createElement("div");
    copy.className = "cart-page-item-copy";

    const title = document.createElement("h3");
    title.textContent = item.displayName;

    const meta = document.createElement("p");
    meta.textContent = `${utils.formatCurrency(item.displayPrice)} each`;

    copy.append(title, meta);

    const controls = document.createElement("div");
    controls.className = "cart-page-item-controls";

    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.textContent = "-";
    decrease.setAttribute("aria-label", "Reduce quantity");
    decrease.addEventListener("click", function () {
      setQuantity(item.productId, item.quantity - 1);
    });

    const quantity = document.createElement("span");
    quantity.textContent = String(item.quantity);

    const increase = document.createElement("button");
    increase.type = "button";
    increase.textContent = "+";
    increase.setAttribute("aria-label", "Increase quantity");
    increase.addEventListener("click", function () {
      setQuantity(item.productId, item.quantity + 1);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-page-item-remove";
    remove.textContent = "Remove";
    remove.addEventListener("click", function () {
      setQuantity(item.productId, 0);
    });

    controls.append(decrease, quantity, increase, remove);

    const total = document.createElement("strong");
    total.className = "cart-page-item-total";
    total.textContent = utils.formatCurrency(item.lineTotal);

    article.append(copy, controls, total);
    return article;
  }

  function render() {
    const items = getCartSummary();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

    if (countNode) {
      countNode.textContent = `${itemCount} item${itemCount === 1 ? "" : "s"}`;
    }
    if (summaryCountNode) {
      summaryCountNode.textContent = String(itemCount);
    }
    if (totalNode) {
      totalNode.textContent = utils.formatCurrency(total);
    }
    if (whatsappNode) {
      whatsappNode.href = buildWhatsAppUrl();
    }
    if (clearButton) {
      clearButton.disabled = items.length === 0;
    }

    if (emptyNode) {
      emptyNode.hidden = items.length > 0;
    }

    if (listNode) {
      listNode.innerHTML = "";
      const fragment = document.createDocumentFragment();
      items.forEach((item) => fragment.appendChild(createItemCard(item)));
      listNode.appendChild(fragment);
      listNode.hidden = items.length === 0;
    }
  }

  async function prefillProfile() {
    if (!catalog || typeof catalog.fetchCustomerProfile !== "function") {
      return;
    }

    try {
      const profile = await catalog.fetchCustomerProfile();
      if (!profile) return;
      if (nameInput && !normalizeText(nameInput.value)) nameInput.value = normalizeText(profile.fullName);
      if (phoneInput && !normalizeText(phoneInput.value)) phoneInput.value = normalizeText(profile.phone);
      if (areaInput && !normalizeText(areaInput.value)) areaInput.value = normalizeText(profile.deliveryArea);
      if (emailInput && !normalizeText(emailInput.value)) emailInput.value = normalizeText(profile.email);
    } catch (error) {
      // ignore quiet prefill errors
    }
  }

  function getFriendlyStatus(result) {
    const status = normalizeText(result && result.status).toLowerCase();
    const code = Number(result && result.resultCode);
    const resultDesc = normalizeText(result && result.resultDesc);
    const receipt = normalizeText(result && result.mpesaReceiptNumber);
    const orderIds = Array.isArray(result && result.orderIds)
      ? result.orderIds.map((entry) => normalizeText(entry)).filter(Boolean)
      : [];
    const orderSummary = orderIds.length
      ? orderIds.length === 1
        ? ` Track it with order ID ${orderIds[0]}.`
        : ` Track these items with order IDs ${orderIds.join(", ")}.`
      : "";

    if (status === "paid") {
      return {
        message: `Payment received${receipt ? ` - receipt ${receipt}` : ""}. Your order is now in SharonCraft admin and tracking.${orderSummary}`,
        tone: "success",
      };
    }
    if (status === "cancelled" || code === 1032) {
      return { message: "You cancelled the M-Pesa prompt. You can try again whenever you're ready.", tone: "error" };
    }
    if (code === 1037) {
      return { message: "The M-Pesa prompt timed out because there was no response. Please try again and approve it quickly.", tone: "error" };
    }
    if (status === "failed") {
      return { message: resultDesc || "M-Pesa could not complete this payment. Please try again.", tone: "error" };
    }
    return { message: "The M-Pesa prompt has been sent. Please check your phone and enter your PIN.", tone: "info" };
  }

  async function pollStatus(reference) {
    stopPolling();
    pollStartedAt = Date.now();

    async function check() {
      try {
        const result = await catalog.fetchMpesaCheckoutStatus(reference);
        if (!result || result.ok === false) {
          throw new Error(normalizeText(result && result.error) || "Unable to read M-Pesa payment status.");
        }

        const friendly = getFriendlyStatus(result);
        setStatus(friendly.message, friendly.tone);

        if (normalizeText(result.status).toLowerCase() === "paid") {
          saveCart([]);
          render();
          stopPolling();
          return;
        }

        if (friendly.tone === "error") {
          stopPolling();
          return;
        }

        if (Date.now() - pollStartedAt > 120000) {
          setStatus("We have not received the final payment result yet. Check again shortly or contact SharonCraft on WhatsApp.", "info");
          stopPolling();
          return;
        }

        pollTimer = window.setTimeout(check, 5000);
      } catch (error) {
        setStatus(normalizeText(error && error.message) || "Unable to confirm the M-Pesa result right now.", "error");
        stopPolling();
      }
    }

    check();
  }

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      saveCart([]);
      render();
      setStatus("", "info");
    });
  }

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const items = getCartSummary();
      const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

      if (!items.length) {
        setStatus("Add at least one product before paying with M-Pesa.", "error");
        return;
      }

      if (!catalog || typeof catalog.startMpesaCheckout !== "function") {
        setStatus("M-Pesa is not ready on this site yet. Finish the Supabase function setup first.", "error");
        return;
      }

      const payload = {
        amount: total,
        currency: "KES",
        sourcePage: "/cart.html",
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.displayName,
          quantity: item.quantity,
          unitPrice: item.displayPrice,
          lineTotal: item.lineTotal,
        })),
        customer: {
          name: normalizeText(nameInput && nameInput.value),
          phone: normalizeText(phoneInput && phoneInput.value),
          deliveryArea: normalizeText(areaInput && areaInput.value),
          email: normalizeText(emailInput && emailInput.value),
        },
      };

      if (!payload.customer.name || !payload.customer.phone || !payload.customer.deliveryArea) {
        setStatus("Please add your name, Safaricom phone number, and delivery area.", "error");
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      setStatus("Requesting your M-Pesa prompt...", "info");

      try {
        const result = await catalog.startMpesaCheckout(payload);
        if (!result || result.ok === false) {
          throw new Error(normalizeText(result && result.error) || "M-Pesa did not accept the payment request.");
        }

        setStatus(
          `${normalizeText(result.customerMessage) || "Check your phone for the M-Pesa prompt."} Reference: ${normalizeText(result.reference)}.`,
          "success"
        );

        await pollStatus(result.reference);
      } catch (error) {
        setStatus(
          normalizeText(error && error.message) || "Unable to start M-Pesa right now. Please try again or use WhatsApp checkout.",
          "error"
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send STK Push";
        }
      }
    });
  }

  await prefillProfile();
  render();
});
