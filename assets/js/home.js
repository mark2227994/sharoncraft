document.addEventListener("DOMContentLoaded", async function () {
  const utils = window.SharonCraftUtils;
  const heroKicker = document.getElementById("home-hero-kicker");
  const heroTitle = document.getElementById("home-hero-title");
  const heroDescription = document.getElementById("home-hero-description");
  const heroPrimary = document.getElementById("home-hero-primary");
  const heroSecondary = document.getElementById("home-hero-secondary");
  const heroImage = document.getElementById("home-hero-image");
  const favoriteKicker = document.getElementById("home-favorite-kicker");
  const favoriteTitle = document.getElementById("home-favorite-title");
  const favoriteDescription = document.getElementById("home-favorite-description");
  const favoriteImage = document.getElementById("home-favorite-image");
  const featuredGrid = document.getElementById("featured-products");
  const categoryGrid = document.getElementById("home-categories");
  const arrivalsGrid = document.getElementById("new-arrivals");
  const testimonialStack = document.getElementById("home-testimonials");

  await utils.waitForData();
  const addImageVersion = (image, version) => {
    const source = String(image || "").trim();
    const cacheVersion = String(version || "").trim();

    if (!source || !cacheVersion || source.startsWith("data:") || source.startsWith("blob:")) {
      return source;
    }

    const joiner = source.includes("?") ? "&" : "?";
    return `${source}${joiner}v=${encodeURIComponent(cacheVersion)}`;
  };

  function renderHome() {
    const allProducts = Array.isArray(utils.data.products) ? utils.data.products : [];
    const visuals = utils.data.homeVisuals || {};
    const hero = visuals.hero || {};
    const favorite = visuals.favorite || {};
    const favoriteProduct = allProducts.find((product) => product.id === favorite.productId);
    const favoriteFallbackImage =
      favoriteProduct && Array.isArray(favoriteProduct.images) && favoriteProduct.images[0]
        ? favoriteProduct.images[0]
        : "assets/images/IMG-20260214-WA0006.jpg";

    if (heroKicker) {
      heroKicker.textContent = hero.kicker || "Welcome to SharonCraft";
    }
    if (heroTitle) {
      heroTitle.textContent = hero.title || "Clean, colorful handmade beadwork for happy homes and beautiful gifting.";
    }
    if (heroDescription) {
      heroDescription.textContent =
        hero.description ||
        "Discover bracelets, necklaces, decor, and occasion sets made with a bright East African spirit. Ordering is simple, mobile-friendly, and ready for WhatsApp and M-Pesa.";
    }
    if (heroPrimary) {
      heroPrimary.textContent = hero.primaryLabel || "Shop Now";
      heroPrimary.href = hero.primaryHref || "shop.html";
    }
    if (heroSecondary) {
      heroSecondary.textContent = hero.secondaryLabel || "Our Story";
      heroSecondary.href = hero.secondaryHref || "about.html";
    }
    if (heroImage) {
      heroImage.src = addImageVersion(hero.image || "assets/images/IMG-20260226-WA0005.jpg", visuals.version);
      heroImage.alt = hero.imageAlt || "Model wearing SharonCraft occasion beadwork";
    }
    if (favoriteKicker) {
      favoriteKicker.textContent = favorite.kicker || "Client Favorite";
    }
    if (favoriteTitle) {
      favoriteTitle.textContent = favorite.title || (favoriteProduct && favoriteProduct.name) || "Client Favorite";
    }
    if (favoriteDescription) {
      favoriteDescription.textContent =
        favorite.description ||
        (favoriteProduct && (favoriteProduct.shortDescription || favoriteProduct.description)) ||
        "A well-loved SharonCraft piece chosen for everyday beauty and easy gifting.";
    }
    if (favoriteImage) {
      favoriteImage.src = addImageVersion(favorite.image || favoriteFallbackImage, visuals.version);
      favoriteImage.alt =
        favorite.imageAlt || (favoriteProduct && favoriteProduct.name) || "SharonCraft favorite product photo";
    }

    if (testimonialStack) {
      const testimonials = (utils.data.site && Array.isArray(utils.data.site.testimonials) ? utils.data.site.testimonials : []).slice(0, 3);
      testimonialStack.innerHTML = testimonials
        .map(
          (item) => `
            <article class="testimonial-card">
              <p>"${item.quote}"</p>
              <strong>${item.name}</strong>
            </article>
          `
        )
        .join("");
    }

    if (featuredGrid) {
      const featuredProducts = allProducts.filter((product) => product.featured).slice(0, 4);
      const visibleProducts = featuredProducts.length ? featuredProducts : allProducts.slice(0, 4);
      featuredGrid.innerHTML = visibleProducts.map(utils.createProductCard).join("");
    }

    if (categoryGrid) {
      categoryGrid.innerHTML = utils.data.categories.map(utils.createCategoryCard).join("");
    }

    if (arrivalsGrid) {
      const newItems = allProducts.filter((product) => product.newArrival).slice(0, 3);
      const visibleNewItems = newItems.length ? newItems : allProducts.slice(0, 3);
      arrivalsGrid.innerHTML = visibleNewItems.map(utils.createProductCard).join("");
    }

    if (typeof utils.setPageMetadata === "function") {
      utils.setPageMetadata({
        title: "SharonCraft | Handmade Beadwork and African-Inspired Gifts in Kenya",
        description:
          "Shop SharonCraft for handmade beaded necklaces, bracelets, decor, gift sets, and occasion pieces with easy WhatsApp ordering in Kenya.",
        path: "/",
        image: hero.image || "assets/images/IMG-20260226-WA0005.jpg",
        type: "website"
      });
    }

    if (typeof utils.setStructuredData === "function") {
      const socialLinks = ((utils.data.site && utils.data.site.socials) || [])
        .map((item) => String(item.url || "").trim())
        .filter((url) => url && url !== "#");

      utils.setStructuredData("home-organization", {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: utils.data.site.name || "SharonCraft",
        url: new URL("/", window.location.origin).href,
        logo: new URL("assets/images/sharoncraft-logo-transparent.png", window.location.origin).href,
        image: new URL(hero.image || "assets/images/IMG-20260226-WA0005.jpg", window.location.origin).href,
        telephone: utils.data.site.phone || "",
        email: utils.data.site.email || "",
        address: {
          "@type": "PostalAddress",
          addressLocality: utils.data.site.location || "Nairobi, Kenya",
          addressCountry: "KE"
        },
        sameAs: socialLinks
      });

      utils.setStructuredData("home-website", {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: utils.data.site.name || "SharonCraft",
        url: new URL("/", window.location.origin).href,
        description: hero.description || utils.data.site.tagline || ""
      });
    }

    utils.refreshReveal();
  }

  renderHome();

  if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
    await window.SharonCraftLiveSync.ready;
    renderHome();
  }
});
