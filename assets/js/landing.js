(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    if (window.SharonCraftLiveSync && window.SharonCraftLiveSync.ready) {
      await window.SharonCraftLiveSync.ready;
    }

    const utils = window.SharonCraftUtils;
    const config = window.SharonCraftLandingConfig || {};

    if (!utils || typeof utils.waitForData !== "function") {
      return;
    }

    await utils.waitForData();

    const productIds = Array.isArray(config.productIds) ? config.productIds : [];
    const fallbackCategory = String(config.category || "").trim();
    const products = productIds.length
      ? productIds.map((id) => utils.getProductById(id)).filter(Boolean)
      : utils.getProductsByCategory(fallbackCategory).slice(0, Number(config.limit) || 4);
    const testimonials = (utils.data.site && Array.isArray(utils.data.site.testimonials) ? utils.data.site.testimonials : []).slice(0, 3);
    const productGrid = document.getElementById("landing-products");
    const testimonialGrid = document.getElementById("landing-testimonials");
    const whatsappLink = document.getElementById("landing-whatsapp");
    const categoryLink = document.getElementById("landing-category-link");

    if (whatsappLink) {
      whatsappLink.href = utils.buildWhatsAppUrl(
        String(config.whatsappMessage || "Hello SharonCraft, I would like help choosing the right beadwork for my needs.")
      );
    }

    if (categoryLink) {
      categoryLink.href = fallbackCategory ? `shop.html?category=${encodeURIComponent(fallbackCategory)}` : "shop.html";
    }

    if (productGrid) {
      productGrid.innerHTML = products
        .map((product, index) =>
          utils.createProductCard(product, {
            listId: String(config.listId || "landing_page"),
            listName: String(config.listName || "Landing Page"),
            index: index + 1
          })
        )
        .join("");

      if (typeof utils.trackProductListView === "function") {
        utils.trackProductListView({
          listId: String(config.listId || "landing_page"),
          listName: String(config.listName || "Landing Page"),
          products
        });
      }
    }

    if (testimonialGrid) {
      testimonialGrid.innerHTML = testimonials
        .map(
          (item) => `
            <article class="testimonial-card reveal">
              <p>"${item.quote}"</p>
              <strong>${item.name}</strong>
            </article>
          `
        )
        .join("");
    }

    if (typeof utils.setPageMetadata === "function") {
      utils.setPageMetadata({
        title: String(config.title || document.title),
        description: String(config.description || ""),
        path: String(config.path || window.location.pathname),
        image: String(config.image || "assets/images/IMG-20260226-WA0005.jpg"),
        imageAlt: String(config.imageAlt || config.heading || "SharonCraft collection"),
        type: "website"
      });
    }

    if (typeof utils.setStructuredData === "function") {
      const pageUrl = new URL(String(config.path || window.location.pathname), window.location.origin).href;
      const faqItems = Array.isArray(config.faqs) ? config.faqs : [];
      const itemListElements = products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: new URL(`/product.html?id=${encodeURIComponent(product.id)}`, window.location.origin).href,
        name: product.name || "SharonCraft product"
      }));

      utils.setStructuredData("landing-page", {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        name: String(config.heading || config.title || document.title),
        url: pageUrl,
        description: String(config.description || ""),
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: itemListElements
        }
      });

      utils.setStructuredData("landing-breadcrumb", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: new URL("/", window.location.origin).href
          },
          {
            "@type": "ListItem",
            position: 2,
            name: String(config.heading || config.title || document.title),
            item: pageUrl
          }
        ]
      });

      utils.setStructuredData(
        "landing-faq",
        faqItems.length
          ? {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((item) => ({
                "@type": "Question",
                name: String(item.question || ""),
                acceptedAnswer: {
                  "@type": "Answer",
                  text: String(item.answer || "")
                }
              }))
            }
          : null
      );
    }

    utils.refreshReveal();
  });
}());
