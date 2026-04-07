document.addEventListener("DOMContentLoaded", async function () {
  const utils = window.SharonCraftUtils;
  const heroKicker = document.getElementById("home-hero-kicker");
  const heroTitle = document.getElementById("home-hero-title");
  const heroDescription = document.getElementById("home-hero-description");
  const heroPrimary = document.getElementById("home-hero-primary");
  const heroWhatsapp = document.getElementById("home-hero-whatsapp");
  const intentWhatsapp = document.getElementById("home-intent-whatsapp");
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
  const reviewSummaryPromise = typeof utils.loadReviewSummaries === "function"
    ? utils.loadReviewSummaries().catch(function () { return null; })
    : Promise.resolve(null);

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
      favoriteProduct && typeof utils.getProductImages === "function" && utils.getProductImages(favoriteProduct)[0]
        ? utils.getProductImages(favoriteProduct)[0]
        : "assets/images/kenyan-bead-decor-yhip8u-opt.webp";

    if (heroKicker) {
      heroKicker.textContent = hero.kicker || "Welcome to SharonCraft";
    }
    if (heroTitle) {
      heroTitle.textContent = hero.title || "Step into handmade color.";
    }
    if (heroDescription) {
      heroDescription.textContent =
        hero.description ||
        "Jewelry, gifts, and home pieces made in Kenya. Browse slowly, ask what you need, and choose what feels right.";
    }
    if (heroPrimary) {
      heroPrimary.textContent = hero.primaryLabel || "Enter Collection";
      heroPrimary.href = hero.primaryHref || "shop.html";
    }
    if (heroWhatsapp) {
      heroWhatsapp.href = utils.buildWhatsAppUrl("Hello SharonCraft, I would like help choosing the right handmade beadwork for me.");
    }
    if (intentWhatsapp) {
      intentWhatsapp.href = utils.buildWhatsAppUrl("Hello SharonCraft, I am choosing between jewelry, gifts, and home decor. Which path do you recommend?");
    }
    if (heroSecondary) {
      heroSecondary.textContent = hero.secondaryLabel || "Our Story";
      heroSecondary.href = hero.secondaryHref || "about.html";
    }
    if (heroImage) {
      heroImage.src = addImageVersion(hero.image || "assets/images/custom-occasion-beadwork-46mokm-opt.webp", visuals.version);
      heroImage.alt = hero.imageAlt || "Model wearing SharonCraft occasion beadwork";
    }
    if (favoriteKicker) {
      favoriteKicker.textContent = favorite.kicker || "A quiet favorite";
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
      featuredGrid.innerHTML = visibleProducts
        .map((product, index) =>
          utils.createProductCard(product, {
            listId: "home_featured",
            listName: "Homepage Featured",
            index: index + 1
          })
        )
        .join("");
      utils.trackProductListView({
        listId: "home_featured",
        listName: "Homepage Featured",
        products: visibleProducts
      });
    }

    if (categoryGrid) {
      categoryGrid.innerHTML = utils.data.categories.map(utils.createCategoryCard).join("");
    }

    if (arrivalsGrid) {
      const newItems = allProducts.filter((product) => product.newArrival).slice(0, 3);
      const visibleNewItems = newItems.length ? newItems : allProducts.slice(0, 3);
      arrivalsGrid.innerHTML = visibleNewItems
        .map((product, index) =>
          utils.createProductCard(product, {
            listId: "home_new_arrivals",
            listName: "Homepage New Arrivals",
            index: index + 1
          })
        )
        .join("");
      utils.trackProductListView({
        listId: "home_new_arrivals",
        listName: "Homepage New Arrivals",
        products: visibleNewItems
      });
    }

    if (typeof utils.setPageMetadata === "function") {
      utils.setPageMetadata({
        title: "SharonCraft | Handmade Beadwork and African-Inspired Gifts in Kenya",
        description:
          "Shop SharonCraft for handmade beadwork, warm gift ideas, and home decor with clear WhatsApp support in Kenya.",
        path: "/",
        image: hero.image || "assets/images/custom-occasion-beadwork-46mokm-opt.webp",
        imageAlt: hero.imageAlt || "SharonCraft handmade beadwork hero image",
        type: "website"
      });
    }

    if (typeof utils.setStructuredData === "function") {
      const socialLinks = ((utils.data.site && utils.data.site.socials) || [])
        .map((item) => String(item.url || "").trim())
        .filter((url) => url && url !== "#");

      utils.setStructuredData("home-organization", {
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        name: utils.data.site.name || "SharonCraft",
        url: new URL("/", window.location.origin).href,
        logo: new URL("assets/images/sharoncraft-logo-transparent.webp", window.location.origin).href,
        image: new URL(hero.image || "assets/images/custom-occasion-beadwork-46mokm-opt.webp", window.location.origin).href,
        telephone: utils.data.site.phone || "",
        email: utils.data.site.email || "",
        description: utils.data.site.tagline || "",
        address: {
          "@type": "PostalAddress",
          addressLocality: utils.data.site.location || "Nairobi, Kenya",
          addressCountry: "KE"
        },
        founder: {
          "@type": "Person",
          name: utils.data.site.founderName || "Kelvin Mark",
          jobTitle: utils.data.site.founderTitle || "Founder & CEO"
        },
        sameAs: socialLinks
      });

      utils.setStructuredData("home-website", {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: utils.data.site.name || "SharonCraft",
        url: new URL("/", window.location.origin).href,
        description: hero.description || utils.data.site.tagline || "",
        potentialAction: {
          "@type": "SearchAction",
          target: `${new URL("/shop.html", window.location.origin).href}?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      });

      utils.setStructuredData("home-featured-items", {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Featured SharonCraft products",
        itemListElement: (allProducts.filter((product) => product.featured).slice(0, 4).length
          ? allProducts.filter((product) => product.featured).slice(0, 4)
          : allProducts.slice(0, 4)
        ).map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: new URL(`/product.html?id=${encodeURIComponent(product.id)}`, window.location.origin).href,
          name: product.name || "SharonCraft product"
        }))
      });
    }

    utils.refreshReveal();
  }

  renderHome();

  reviewSummaryPromise.then(function () {
    renderHome();
  });

  if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
    window.SharonCraftLiveSync.ready
      .then(renderHome)
      .catch(function (error) {
        console.warn("Unable to refresh homepage after live sync.", error);
      });
  }
});
