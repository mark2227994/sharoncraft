(function () {
  // Shared storefront helpers for layout, formatting, cart state, and reusable rendering.
  const data = window.SharonCraftData;
  const categoryMap = new Map(data.categories.map((category) => [category.slug, category]));
  const cartStorageKey = "sharoncraft-cart";
  const timerStorageKey = "sharoncraft-cart-timer";
  let cartTimerInterval = null;

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0
    }).format(value);
  }

  function buildWhatsAppUrl(message) {
    return `https://wa.me/${data.site.whatsapp}?text=${encodeURIComponent(message)}`;
  }

  function getProductById(id) {
    return data.products.find((product) => product.id === id);
  }

  function getCategoryBySlug(slug) {
    return categoryMap.get(slug);
  }

  function getProductsByCategory(slug) {
    return data.products.filter((product) => product.category === slug);
  }

  function getRelatedProducts(product, limit = 4) {
    return data.products
      .filter((item) => item.id !== product.id)
      .sort((left, right) => {
        const leftScore = left.category === product.category ? 0 : 1;
        const rightScore = right.category === product.category ? 0 : 1;
        return leftScore - rightScore;
      })
      .slice(0, limit);
  }

  function buildBadgeClass(badge) {
    if (!badge) {
      return "";
    }

    if (badge.toLowerCase().includes("best")) {
      return "badge badge-coral";
    }

    if (badge.toLowerCase().includes("new")) {
      return "badge badge-teal";
    }

    return "badge badge-ochre";
  }

  function cartIconMarkup() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 4h2l2.3 9.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
        <circle cx="10" cy="19" r="1.5" fill="currentColor"></circle>
        <circle cx="17" cy="19" r="1.5" fill="currentColor"></circle>
      </svg>
    `;
  }

  function navIconMarkup(name) {
    const icons = {
      home: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.8v-6.2H9.8V21H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
        </svg>
      `,
      shop: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 8h12l-1 12H7L6 8Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"></path>
          <path d="M9 9V7a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path>
        </svg>
      `,
      categories: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
        </svg>
      `,
      about: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
          <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path>
        </svg>
      `,
      contact: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5z" fill="none" stroke="currentColor" stroke-width="1.8"></path>
          <path d="m5 8 7 5 7-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
        </svg>
      `
    };

    return icons[name] || "";
  }

  function whatsappIconMarkup() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 4.2a7.8 7.8 0 0 0-6.7 11.8L4 20l4.2-1.2A7.8 7.8 0 1 0 12 4.2Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
        <path d="M9.2 9.1c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4l.6 1.5c.1.2.1.4 0 .6l-.4.6c-.1.1-.1.3 0 .4.4.8 1 1.4 1.8 1.8.1.1.3.1.4 0l.6-.4c.2-.1.4-.1.6 0l1.5.6c.4.1.4.3.4.5v.5c0 .2 0 .4-.4.6-.5.2-1 .4-1.5.3-1.1-.1-2.1-.6-3.1-1.6s-1.5-2-1.6-3.1c-.1-.5.1-1 .3-1.5Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"></path>
      </svg>
    `;
  }

  function createProductCard(product) {
    const category = getCategoryBySlug(product.category);
    const badgeMarkup = product.badge
      ? `<span class="${buildBadgeClass(product.badge)}">${product.badge}</span>`
      : "";

    return `
      <article class="product-card reveal">
        <a class="product-card-media" href="product.html?id=${product.id}">
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
          ${badgeMarkup}
        </a>
        <div class="product-card-body">
          <div class="product-card-topline">
            <p class="product-card-category">${category ? category.name : "Collection"}</p>
            <button class="cart-icon-button" type="button" data-add-to-cart="${product.id}" aria-label="Add ${product.name} to cart">
              ${cartIconMarkup()}
            </button>
          </div>
          <h3><a href="product.html?id=${product.id}">${product.name}</a></h3>
          <div class="product-card-meta">
            <strong>${formatCurrency(product.price)}</strong>
            <span>Handmade</span>
          </div>
          <div class="product-card-actions">
            <a class="button button-secondary" href="product.html?id=${product.id}">View Product</a>
            <button class="button button-primary" type="button" data-add-to-cart="${product.id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `;
  }

  function createCategoryCard(category) {
    const count = getProductsByCategory(category.slug).length;

    return `
      <article class="category-card reveal accent-${category.accent}">
        <a href="shop.html?category=${category.slug}" class="category-card-link">
          <div class="category-card-media">
            <img src="${category.image}" alt="${category.name}" loading="lazy" />
          </div>
          <div class="category-card-body">
            <span class="section-kicker">Shop ${category.name}</span>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
            <span class="category-count">${count} products</span>
          </div>
        </a>
      </article>
    `;
  }

  function getCart() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(cartStorageKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => getProductById(item.productId) && item.quantity > 0) : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    renderCartUi();
  }

  function getScarcityCount(product) {
    const seed = product.id.split("").reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
    return (seed % 5) + 3;
  }

  function getScarcityNote(product) {
    const count = getScarcityCount(product);
    return `Only ${count} left in this week's batch.`;
  }

  function ensureCartTimer() {
    const existing = Number(window.localStorage.getItem(timerStorageKey) || 0);
    if (existing > Date.now()) {
      return existing;
    }

    const nextExpiry = Date.now() + 5 * 60 * 1000;
    window.localStorage.setItem(timerStorageKey, String(nextExpiry));
    return nextExpiry;
  }

  function getTimeRemaining() {
    const expiry = Number(window.localStorage.getItem(timerStorageKey) || 0);
    if (!expiry) {
      return 0;
    }
    return Math.max(0, expiry - Date.now());
  }

  function formatTimeRemaining(milliseconds) {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function startCartTimer() {
    if (cartTimerInterval) {
      window.clearInterval(cartTimerInterval);
    }

    renderCartTimer();
    cartTimerInterval = window.setInterval(renderCartTimer, 1000);
  }

  function renderCartTimer() {
    let remaining = getTimeRemaining();
    const timerNodes = document.querySelectorAll("[data-cart-timer]");
    const urgencyNodes = document.querySelectorAll("[data-cart-urgency]");
    const alwaysOn = Array.from(urgencyNodes).some((node) => node.dataset.cartUrgency === "always");
    const hasCartItems = getCart().length > 0;

    if (!hasCartItems && !alwaysOn) {
      timerNodes.forEach((node) => {
        node.textContent = "05:00";
      });
      urgencyNodes.forEach((node) => node.classList.remove("is-visible"));
      return;
    }

    if (!remaining) {
      ensureCartTimer();
      remaining = getTimeRemaining();
    }

    timerNodes.forEach((node) => {
      node.textContent = formatTimeRemaining(remaining);
    });

    urgencyNodes.forEach((node) => {
      const shouldShow = node.dataset.cartUrgency === "always" || hasCartItems;
      node.classList.toggle("is-visible", shouldShow);
    });
  }

  function getCartSummary() {
    return getCart()
      .map((item) => {
        const product = getProductById(item.productId);
        return {
          ...item,
          product,
          lineTotal: product.price * item.quantity
        };
      })
      .filter((item) => item.product);
  }

  function buildCartMessage() {
    const items = getCartSummary();
    if (!items.length) {
      return buildWhatsAppUrl("Hello SharonCraft, I would like help choosing a product.");
    }

    const lines = items.map(
      (item, index) => `${index + 1}. ${item.product.name} x${item.quantity} - ${formatCurrency(item.lineTotal)}`
    );
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    return buildWhatsAppUrl(
      `Hello SharonCraft, I would like to order these items:\n${lines.join("\n")}\nTotal: ${formatCurrency(total)}`
    );
  }

  function openCart() {
    document.body.classList.add("cart-open");
    const drawer = document.getElementById("cart-drawer");
    if (drawer) {
      drawer.setAttribute("aria-hidden", "false");
    }
  }

  function closeCart() {
    document.body.classList.remove("cart-open");
    const drawer = document.getElementById("cart-drawer");
    if (drawer) {
      drawer.setAttribute("aria-hidden", "true");
    }
  }

  function addToCart(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product) {
      return;
    }

    const cart = getCart();
    const existing = cart.find((item) => item.productId === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    ensureCartTimer();
    saveCart(cart);
    openCart();
  }

  function updateCartQuantity(productId, nextQuantity) {
    let cart = getCart();

    if (nextQuantity <= 0) {
      cart = cart.filter((item) => item.productId !== productId);
    } else {
      cart = cart.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item));
    }

    saveCart(cart);
  }

  function renderCartUi() {
    const summary = getCartSummary();
    const totalItems = summary.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = summary.reduce((sum, item) => sum + item.lineTotal, 0);
    const countNodes = document.querySelectorAll("[data-cart-count]");
    const totalNode = document.getElementById("cart-total-price");
    const listNode = document.getElementById("cart-items");
    const checkoutNode = document.getElementById("cart-checkout");
    const emptyNode = document.getElementById("cart-empty");

    countNodes.forEach((node) => {
      node.textContent = String(totalItems);
    });

    if (totalNode) {
      totalNode.textContent = formatCurrency(totalPrice);
    }

    if (checkoutNode) {
      checkoutNode.href = buildCartMessage();
    }

    if (listNode) {
      listNode.innerHTML = summary
        .map(
          (item) => `
            <article class="cart-item">
              <img src="${item.product.images[0]}" alt="${item.product.name}" />
              <div class="cart-item-copy">
                <strong>${item.product.name}</strong>
                <span>${formatCurrency(item.product.price)} each</span>
                <div class="cart-quantity-controls">
                  <button type="button" data-cart-decrease="${item.productId}" aria-label="Reduce ${item.product.name} quantity">-</button>
                  <span>${item.quantity}</span>
                  <button type="button" data-cart-increase="${item.productId}" aria-label="Increase ${item.product.name} quantity">+</button>
                </div>
              </div>
              <strong>${formatCurrency(item.lineTotal)}</strong>
            </article>
          `
        )
        .join("");
    }

    if (emptyNode) {
      emptyNode.classList.toggle("is-hidden", summary.length > 0);
    }

    renderCartTimer();
  }

  function renderHeader() {
    const target = document.querySelector("[data-site-header]");

    if (!target) {
      return;
    }

    const currentPage = document.body.dataset.page || "";

    target.innerHTML = `
      <div class="promo-bar">
        <div class="container promo-bar-inner">
          <p>${data.site.promo}</p>
          <a href="${buildWhatsAppUrl("Hello SharonCraft, I would like to claim the current delivery offer.")}" target="_blank" rel="noreferrer">Claim on WhatsApp</a>
        </div>
      </div>
      <header class="site-header">
        <div class="container header-shell">
          <a class="brand-mark" href="index.html" aria-label="SharonCraft home">
            <img class="brand-logo" src="assets/images/sharoncraft-logo-transparent.png" alt="SharonCraft logo" />
            <span class="brand-copy">
              <strong>${data.site.name}</strong>
              <small>Handmade joy from Kenya</small>
            </span>
          </a>
          <nav id="site-nav" class="site-nav" aria-label="Main navigation">
            <a href="index.html" class="${currentPage === "home" ? "is-active" : ""}">${navIconMarkup("home")}<span>Home</span></a>
            <a href="shop.html" class="${currentPage === "shop" ? "is-active" : ""}">${navIconMarkup("shop")}<span>Shop</span></a>
            <a href="categories.html" class="${currentPage === "categories" ? "is-active" : ""}">${navIconMarkup("categories")}<span>Categories</span></a>
            <a href="about.html" class="${currentPage === "about" ? "is-active" : ""}">${navIconMarkup("about")}<span>About</span></a>
            <a href="contact.html" class="${currentPage === "contact" ? "is-active" : ""}">${navIconMarkup("contact")}<span>Contact</span></a>
            <a class="button button-primary nav-cta" href="${buildWhatsAppUrl("Hello SharonCraft, I would like help choosing a product.")}" target="_blank" rel="noreferrer">
              <span class="nav-cta-icon">
                ${whatsappIconMarkup()}
              </span>
              <span class="nav-cta-copy">
                <strong>Order on WhatsApp</strong>
              </span>
            </a>
          </nav>
          <div class="header-actions">
            <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
              Menu
            </button>
            <button class="cart-header-button" type="button" id="cart-open-button" aria-label="Open cart">
              ${cartIconMarkup()}
              <span>Cart</span>
              <strong data-cart-count>0</strong>
            </button>
          </div>
        </div>
      </header>
    `;

    const toggleButton = target.querySelector(".nav-toggle");
    const nav = target.querySelector(".site-nav");
    const cartOpenButton = target.querySelector("#cart-open-button");

    if (toggleButton && nav) {
      toggleButton.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("is-open");
        toggleButton.setAttribute("aria-expanded", String(isOpen));
      });
    }

    if (cartOpenButton) {
      cartOpenButton.addEventListener("click", openCart);
    }
  }

  function renderFooter() {
    const target = document.querySelector("[data-site-footer]");

    if (!target) {
      return;
    }

    const socialMarkup = data.site.socials
      .map(
        (social) =>
          `<a href="${social.url}" ${social.url !== "#" ? 'target="_blank" rel="noreferrer"' : ""}>${social.label}</a>`
      )
      .join("");

    const mpesaMarkup = data.site.mpesaSteps.map((step) => `<li>${step}</li>`).join("");

    target.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <section>
            <span class="section-kicker">SharonCraft</span>
            <h2>Colorful handmade beadwork for homes, gifts, and joyful moments.</h2>
            <p>${data.site.tagline}</p>
          </section>
          <section>
            <h3>Contact</h3>
            <ul class="footer-list">
              <li><a href="tel:${data.site.whatsapp}">${data.site.phone}</a></li>
              <li><a href="mailto:${data.site.email}">${data.site.email}</a></li>
              <li>${data.site.location}</li>
            </ul>
          </section>
          <section>
            <h3>M-Pesa Guide</h3>
            <ol class="footer-list footer-steps">
              ${mpesaMarkup}
            </ol>
          </section>
          <section>
            <h3>Social</h3>
            <div class="footer-socials">
              ${socialMarkup}
            </div>
          </section>
        </div>
      </footer>
      <div class="cart-backdrop" id="cart-backdrop"></div>
      <aside class="cart-drawer" id="cart-drawer" aria-hidden="true">
        <div class="cart-drawer-header">
          <div>
            <span class="section-kicker">Your Cart</span>
            <h3>Comfortable, quick checkout</h3>
          </div>
          <button class="cart-close-button" type="button" id="cart-close-button" aria-label="Close cart">Close</button>
        </div>
        <div class="cart-urgency" data-cart-urgency>
          <strong>Limited hold</strong>
          <span>Your basket stays reserved for <b data-cart-timer>05:00</b></span>
        </div>
        <p id="cart-empty" class="cart-empty">Your cart is empty. Add a few favorites and we will keep them in view here.</p>
        <div id="cart-items" class="cart-items"></div>
        <div class="cart-summary">
          <div>
            <span>Total</span>
            <strong id="cart-total-price">${formatCurrency(0)}</strong>
          </div>
          <a id="cart-checkout" class="button button-primary" href="${buildCartMessage()}" target="_blank" rel="noreferrer">Checkout on WhatsApp</a>
        </div>
      </aside>
      <a class="floating-whatsapp" href="${buildWhatsAppUrl("Hello SharonCraft, I would like to chat about your products.")}" target="_blank" rel="noreferrer">WhatsApp</a>
      <button class="scroll-top" type="button" aria-label="Scroll to top">Top</button>
    `;

    const scrollButton = target.querySelector(".scroll-top");
    const closeButton = target.querySelector("#cart-close-button");
    const backdrop = target.querySelector("#cart-backdrop");

    if (scrollButton) {
      scrollButton.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      window.addEventListener("scroll", function () {
        scrollButton.classList.toggle("is-visible", window.scrollY > 420);
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", closeCart);
    }

    if (backdrop) {
      backdrop.addEventListener("click", closeCart);
    }
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window) || !items.length) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((item) => observer.observe(item));
  }

  function renderCategorySelect(select) {
    if (!select) {
      return;
    }

    select.innerHTML = `
      <option value="">All categories</option>
      ${data.categories
        .map((category) => `<option value="${category.slug}">${category.name}</option>`)
        .join("")}
    `;
  }

  function bindCartEvents() {
    document.addEventListener("click", function (event) {
      const addButton = event.target.closest("[data-add-to-cart]");
      const increaseButton = event.target.closest("[data-cart-increase]");
      const decreaseButton = event.target.closest("[data-cart-decrease]");

      if (addButton) {
        addToCart(addButton.dataset.addToCart, 1);
      }

      if (increaseButton) {
        const item = getCart().find((entry) => entry.productId === increaseButton.dataset.cartIncrease);
        if (item) {
          updateCartQuantity(item.productId, item.quantity + 1);
          openCart();
        }
      }

      if (decreaseButton) {
        const item = getCart().find((entry) => entry.productId === decreaseButton.dataset.cartDecrease);
        if (item) {
          updateCartQuantity(item.productId, item.quantity - 1);
        }
      }
    });
  }

  function hydrateSharedShell() {
    renderHeader();
    renderFooter();
    initReveal();
    renderCartUi();
    startCartTimer();
    bindCartEvents();
  }

  document.addEventListener("DOMContentLoaded", hydrateSharedShell);

  window.SharonCraftUtils = {
    data,
    formatCurrency,
    buildWhatsAppUrl,
    getProductById,
    getCategoryBySlug,
    getProductsByCategory,
    getRelatedProducts,
    createProductCard,
    createCategoryCard,
    getScarcityNote,
    renderCategorySelect,
    refreshReveal: initReveal,
    addToCart,
    openCart,
    closeCart,
    ensureCartTimer,
    getTimeRemaining,
    formatTimeRemaining
  };
})();
