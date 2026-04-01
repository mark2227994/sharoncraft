document.addEventListener("DOMContentLoaded", async function () {
  if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
    await window.SharonCraftLiveSync.ready;
  }
  const utils = window.SharonCraftUtils;
  const grid = document.getElementById("shop-grid");
  const searchInput = document.getElementById("shop-search");
  const categorySelect = document.getElementById("shop-category");
  const priceSelect = document.getElementById("shop-price");
  const sortSelect = document.getElementById("shop-sort");
  const countLabel = document.getElementById("shop-count");
  const clearButton = document.getElementById("clear-shop-filters");
  const helpWhatsapp = document.getElementById("shop-help-whatsapp");
  const customerProof = document.getElementById("shop-customer-proof");
  let discoveryAnalyticsTimer = null;
  let lastDiscoverySignature = "";

  if (!grid) {
    return;
  }

  await utils.waitForData();

  if (helpWhatsapp) {
    helpWhatsapp.href = utils.buildWhatsAppUrl(
      "Hello SharonCraft, please help me choose the right beadwork based on my budget, occasion, or preferred style."
    );
  }

  utils.renderCategorySelect(categorySelect);

  if (customerProof) {
    const testimonials = (utils.data.site && Array.isArray(utils.data.site.testimonials) ? utils.data.site.testimonials : []).slice(0, 2);
    customerProof.innerHTML = `
      ${testimonials.map((item) => `
        <article class="customer-proof-card reveal">
          <span class="section-kicker">Client Review</span>
          <h3>${item.name}</h3>
          <p>"${item.quote}"</p>
        </article>
      `).join("")}
      <article class="customer-proof-card reveal">
        <span class="section-kicker">Order Support</span>
        <h3>WhatsApp first, confusion last</h3>
        <p>Buyers can ask about budget, delivery area, custom colors, and gifting before they commit, which reduces hesitation and improves conversion.</p>
      </article>
      <article class="customer-proof-card reveal">
        <span class="section-kicker">Payment Clarity</span>
        <h3>M-Pesa checkout stays familiar</h3>
        <p>The checkout flow keeps payment in a trusted local flow with STK push support, then SharonCraft confirms the order details after payment.</p>
      </article>
    `;
  }

  const url = new URL(window.location.href);
  const initialCategory = url.searchParams.get("category") || "";
  const initialQuery = url.searchParams.get("q") || "";

  if (initialCategory) {
    categorySelect.value = initialCategory;
  }

  if (initialQuery) {
    searchInput.value = initialQuery;
  }

  const chipContainer = document.getElementById("shop-chips");
  const filterGrid = document.getElementById("shop-filter-grid");
  const toggleFiltersButton = document.getElementById("shop-toggle-filters");

  function buildChips() {
    if (!chipContainer) return;

    const categories = [
      { value: "", label: "All" },
      ...Array.from(categorySelect.options)
        .filter((option) => option.value)
        .map((option) => ({ value: option.value, label: option.textContent }))
    ];

    chipContainer.innerHTML = categories
      .map(
        (cat) => `
          <button type="button" class="filter-chip ${cat.value === categorySelect.value ? "is-active" : ""}" data-chip="${cat.value}">
            ${cat.label}
          </button>
        `
      )
      .join("");
  }

  function setFilterOpen(open) {
    if (!filterGrid) return;
    filterGrid.classList.toggle("is-open", open);
    if (toggleFiltersButton) {
      toggleFiltersButton.setAttribute("aria-expanded", open);
      toggleFiltersButton.querySelector(".shop-filter-toggle-text").textContent = open ? "Close" : "Refine";
    }
  }

  if (toggleFiltersButton) {
    toggleFiltersButton.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = filterGrid.classList.contains("is-open");
      setFilterOpen(!isOpen);
    });
  }

  if (chipContainer) {
    chipContainer.addEventListener("click", function (event) {
      const button = event.target.closest("[data-chip]");
      if (!button) return;
      const value = button.dataset.chip;
      categorySelect.value = value;
      renderProducts();
    });
  }

  function matchesPrice(product, priceFilter) {
    if (!priceFilter) {
      return true;
    }

    if (priceFilter === "under-2000") {
      return product.price < 2000;
    }

    if (priceFilter === "2000-5000") {
      return product.price >= 2000 && product.price <= 5000;
    }

    if (priceFilter === "over-5000") {
      return product.price > 5000;
    }

    return true;
  }

  function applySort(products, value) {
    const copy = [...products];

    if (value === "price-asc") {
      return copy.sort((left, right) => left.price - right.price);
    }

    if (value === "price-desc") {
      return copy.sort((left, right) => right.price - left.price);
    }

    if (value === "newest") {
      return copy.sort((left, right) => {
        const leftScore = left.newArrival ? 1 : 0;
        const rightScore = right.newArrival ? 1 : 0;
        return rightScore - leftScore;
      });
    }

    return copy.sort((left, right) => {
      const leftFeatured = left.featured ? 1 : 0;
      const rightFeatured = right.featured ? 1 : 0;
      if (leftFeatured !== rightFeatured) {
        return rightFeatured - leftFeatured;
      }

      const leftNew = left.newArrival ? 1 : 0;
      const rightNew = right.newArrival ? 1 : 0;
      return rightNew - leftNew;
    });
  }

  function renderProducts() {
    const keyword = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const price = priceSelect.value;
    const sort = sortSelect.value;
    const site = utils.data && utils.data.site ? utils.data.site : {};
    const siteName = site.name || "SharonCraft";
    const siteUrl = new URL("/", window.location.origin).href;
    const socialLinks = (Array.isArray(site.socials) ? site.socials : [])
      .map((item) => String(item && item.url || "").trim())
      .filter((url) => url && url !== "#");

    buildChips();

    const filtered = utils.data.products.filter((product) => {
      const categoryLabel = (utils.getCategoryBySlug(product.category) || {}).name || "";
      const textMatch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        (product.shortDescription || "").toLowerCase().includes(keyword) ||
        (product.description || "").toLowerCase().includes(keyword) ||
        categoryLabel.toLowerCase().includes(keyword);
      const categoryMatch = !category || product.category === category;
      const priceMatch = matchesPrice(product, price);
      return textMatch && categoryMatch && priceMatch;
    });

    const sorted = applySort(filtered, sort);
    grid.innerHTML = sorted.length
      ? sorted
          .map((product, index) =>
            utils.createProductCard(product, {
              listId: "shop_results",
              listName: "Shop Results",
              index: index + 1
            })
          )
          .join("")
      : `
        <article class="category-feature-card reveal">
          <div class="category-feature-copy">
            <span class="section-kicker">No matches yet</span>
            <h2>Try a different filter combination.</h2>
            <p>Clear the search or category filters to see more SharonCraft products.</p>
          </div>
        </article>
      `;
    countLabel.textContent = `${sorted.length} piece${sorted.length === 1 ? "" : "s"}`;
    utils.trackProductListView({
      listId: "shop_results",
      listName: "Shop Results",
      products: sorted
    });

    const discoverySignature = JSON.stringify({
      keyword,
      category,
      price,
      sort,
      results: sorted.map((product) => product.id)
    });

    if (discoveryAnalyticsTimer) {
      window.clearTimeout(discoveryAnalyticsTimer);
    }

    discoveryAnalyticsTimer = window.setTimeout(function () {
      if (discoverySignature === lastDiscoverySignature || typeof utils.trackEvent !== "function") {
        return;
      }

      lastDiscoverySignature = discoverySignature;

      if (keyword) {
        utils.trackEvent("search", {
          search_term: keyword,
          results_count: sorted.length,
          category_filter: category || "all",
          price_filter: price || "all",
          sort_order: sort || "featured"
        });
      }

      if (category) {
        const activeCategory = utils.getCategoryBySlug(category);
        utils.trackEvent("browse_category", {
          category_slug: category,
          category_name: activeCategory && activeCategory.name ? activeCategory.name : category,
          results_count: sorted.length,
          search_term: keyword,
          price_filter: price || "all",
          sort_order: sort || "featured"
        });
      }

      if (keyword || category || price || sort !== "featured") {
        utils.trackEvent("filter_products", {
          search_term: keyword,
          category_filter: category || "all",
          price_filter: price || "all",
          sort_order: sort || "featured",
          results_count: sorted.length
        });
      }
    }, 350);

    if (typeof utils.setPageMetadata === "function") {
      const categoryName = category ? ((utils.getCategoryBySlug(category) || {}).name || "SharonCraft collection") : "handmade beadwork in Kenya";
      const querySuffix = keyword ? ` for "${keyword}"` : "";
      const metadataPath = `/shop.html${category || keyword ? `?${new URLSearchParams({ ...(category ? { category } : {}), ...(keyword ? { q: keyword } : {}) }).toString()}` : ""}`;
      utils.setPageMetadata({
        title: category
          ? `${categoryName}${querySuffix} | Shop SharonCraft`
          : keyword
            ? `${keyword} | Shop SharonCraft`
            : "Shop SharonCraft | Handmade Beadwork in Kenya",
        description: category
          ? `Browse ${categoryName}${querySuffix} from SharonCraft and order quickly on WhatsApp from anywhere in Kenya.`
          : keyword
            ? `Browse SharonCraft results for ${keyword} and order handmade beadwork quickly on WhatsApp.`
            : "Browse SharonCraft necklaces, bracelets, decor, gift sets, and occasion beadwork, then order quickly on WhatsApp.",
        path: metadataPath,
        image: sorted[0] && Array.isArray(sorted[0].images) && sorted[0].images[0] ? sorted[0].images[0] : "assets/images/IMG-20260226-WA0005.webp",
        imageAlt: sorted[0] && sorted[0].name ? sorted[0].name : "SharonCraft featured collection",
        type: "website"
      });
    }

    if (typeof utils.setStructuredData === "function") {
      const categoryName = ((utils.getCategoryBySlug(category) || {}).name || "Collection");
      const collectionUrl = new URL(category ? `/shop.html?category=${encodeURIComponent(category)}` : "/shop.html", window.location.origin).href;
      const visibleItems = sorted.slice(0, 12).map((product, index) => {
        const productCategory = utils.getCategoryBySlug(product.category);
        const productImages = Array.isArray(product.images) && product.images.length
          ? product.images
          : ["assets/images/IMG-20260226-WA0005.webp"];
        const productUrl = new URL(`/product.html?id=${encodeURIComponent(product.id)}`, window.location.origin).href;

        return {
          "@type": "ListItem",
          position: index + 1,
          url: productUrl,
          item: {
            "@type": "Product",
            "@id": `${productUrl}#product`,
            name: product.name || "SharonCraft product",
            url: productUrl,
            image: productImages.map((image) => new URL(image, window.location.origin).href),
            description: product.description || product.shortDescription || "Handmade by SharonCraft artisans.",
            sku: product.id,
            category: productCategory ? productCategory.name : "Collection",
            brand: {
              "@type": "Brand",
              name: siteName
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "KES",
              price: String(Number(product.price) || 0),
              availability: product.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
              url: productUrl,
              seller: {
                "@type": "Organization",
                name: siteName,
                url: siteUrl,
                telephone: site.phone || "",
                email: site.email || "",
                founder: {
                  "@type": "Person",
                  name: "Kelvin Mark",
                  jobTitle: "CEO"
                },
                sameAs: socialLinks
              }
            }
          }
        };
      });

      utils.setStructuredData("shop-collection", {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${collectionUrl}#collection`,
        name: category ? `${categoryName} | SharonCraft` : "Shop SharonCraft",
        url: collectionUrl,
        description: category
          ? `Browse ${categoryName} from SharonCraft and order on WhatsApp.`
          : "Browse SharonCraft handmade beadwork and order on WhatsApp.",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: sorted.length,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: visibleItems
        }
      });

      utils.setStructuredData("shop-breadcrumb", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: new URL("/shop.html", window.location.origin).href
          },
          ...(category
            ? [{
                "@type": "ListItem",
                position: 3,
                name: categoryName,
                item: collectionUrl
              }]
            : [])
        ]
      });
    }

    utils.refreshReveal();
  }

  [searchInput, categorySelect, priceSelect, sortSelect].forEach((element) => {
    element.addEventListener("input", renderProducts);
    element.addEventListener("change", renderProducts);
  });

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      searchInput.value = "";
      categorySelect.value = "";
      priceSelect.value = "";
      sortSelect.value = "featured";
      renderProducts();
    });
  }

  renderProducts();
});
