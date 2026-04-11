(function () {
  const data = window.SharonCraftData;
  const storage = window.SharonCraftStorage;
  const liveCatalog = window.SharonCraftCatalog;
  const pricing = window.SharonCraftPricing || null;
  const fallbackImage = "assets/images/custom-occasion-beadwork-46mokm-opt.webp";
  const siteContentSettingsKey = (storage && storage.siteContentSettingsKey) || "sharoncraft-site-content";
  const liveSiteContentCacheKey = (storage && storage.liveSiteContentCacheKey) || "sharoncraft-live-site-content-cache";
  const normalizeText = (value) => String(value || "").trim();
  const computeCacheVersion = (value) => {
    const input = JSON.stringify(value || {});
    let hash = 0;

    for (let index = 0; index < input.length; index += 1) {
      hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0;
    }

    return Math.abs(hash).toString(36);
  };
  const defaultProductImageMap = new Map(
    (((window.SharonCraftDefaultData && window.SharonCraftDefaultData.products) || []).map((product) => [
      normalizeText(product && product.id),
      Array.isArray(product && product.images) ? product.images.filter(Boolean) : [],
    ]))
  );
  const hostname = String(window.location.hostname || "").toLowerCase();
  const isLocalPreview =
    window.location.protocol === "file:" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1";

  if (!data || !storage) {
    window.SharonCraftLiveSync = { ready: Promise.resolve(null) };
    return;
  }

  const hasLocalCatalogOverride = () => {
    try {
      const raw = window.localStorage.getItem(storage.storageKey);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch (error) {
      return false;
    }
  };

  const hasLocalHomeVisualsOverride = () => {
    try {
      const raw = window.localStorage.getItem(storage.homeVisualsSettingsKey);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw);
      return Boolean(parsed && typeof parsed === "object");
    } catch (error) {
      return false;
    }
  };

  const hasLocalSocialsOverride = () => {
    try {
      const raw = window.localStorage.getItem(storage.socialSettingsKey);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch (error) {
      return false;
    }
  };

  const hasLocalSiteContentOverride = () => {
    try {
      const raw = window.localStorage.getItem(siteContentSettingsKey);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw);
      return Boolean(parsed && typeof parsed === "object");
    } catch (error) {
      return false;
    }
  };

  function normalizeSocials(socials, fallbackSocials) {
    const fallback = Array.isArray(fallbackSocials) ? fallbackSocials : [];
    const savedMap = new Map(
      (Array.isArray(socials) ? socials : [])
        .map((social) => ({
          label: String(social && social.label || "").trim(),
          url: String(social && social.url || "").trim()
        }))
        .filter((social) => social.label)
        .map((social) => [social.label.toLowerCase(), social])
    );

    return fallback.map((social) => {
      const label = String(social && social.label || "").trim();
      const match = savedMap.get(label.toLowerCase());
      return {
        label,
        url: String((match && match.url) || social.url || "#").trim() || "#"
      };
    });
  }

  function normalizeHomeVisuals(visuals, fallbackVisuals) {
    const fallback = fallbackVisuals || {};
    const fallbackHero = fallback.hero || {};
    const fallbackFavorite = fallback.favorite || {};
    const hero = visuals && typeof visuals === "object" ? visuals.hero || {} : {};
    const favorite = visuals && typeof visuals === "object" ? visuals.favorite || {} : {};

    return {
      version: String((visuals && visuals.version) || fallback.version || "").trim(),
      hero: {
        kicker: String(hero.kicker || fallbackHero.kicker || "").trim(),
        title: String(hero.title || fallbackHero.title || "").trim(),
        description: String(hero.description || fallbackHero.description || "").trim(),
        primaryLabel: String(hero.primaryLabel || fallbackHero.primaryLabel || "Shop Now").trim() || "Shop Now",
        primaryHref: String(hero.primaryHref || fallbackHero.primaryHref || "shop.html").trim() || "shop.html",
        secondaryLabel: String(hero.secondaryLabel || fallbackHero.secondaryLabel || "Our Story").trim() || "Our Story",
        secondaryHref: String(hero.secondaryHref || fallbackHero.secondaryHref || "about.html").trim() || "about.html",
        image:
          String(fallbackHero.image || "assets/images/custom-occasion-beadwork-46mokm-opt.webp").trim() ||
          "assets/images/custom-occasion-beadwork-46mokm-opt.webp",
        imageAlt:
          String(hero.imageAlt || fallbackHero.imageAlt || "SharonCraft welcoming beadwork photo").trim() ||
          "SharonCraft welcoming beadwork photo",
      },
      favorite: {
        kicker: String(favorite.kicker || fallbackFavorite.kicker || "Client Favorite").trim() || "Client Favorite",
        title: String(favorite.title || fallbackFavorite.title || "").trim(),
        description: String(favorite.description || fallbackFavorite.description || "").trim(),
        image:
          String(fallbackFavorite.image || "assets/images/kenyan-bead-decor-yhip8u-opt.webp").trim() ||
          "assets/images/kenyan-bead-decor-yhip8u-opt.webp",
        imageAlt:
          String(favorite.imageAlt || fallbackFavorite.imageAlt || "SharonCraft favorite product photo").trim() ||
          "SharonCraft favorite product photo",
        productId: String(favorite.productId || fallbackFavorite.productId || "").trim(),
      },
    };
  }

  const toWebsiteProduct = (product, index, repeatedMainImages) => {
    const categories = Array.isArray(data.categories) ? data.categories : [];
    const material = normalizeText(product && product.material);
    const story = normalizeText(product && product.story);
    const noteParts = normalizeText(product && product.notes).split("|");
    const explicitSlug = normalizeText(noteParts[0]);
    const categoryMatch =
      categories.find((category) => category.slug === explicitSlug) ||
      categories.find((category) => normalizeText(category.name).toLowerCase() === material.toLowerCase()) ||
      categories[0] ||
      { slug: "necklaces" };
    const gallery = Array.isArray(product && product.gallery) ? product.gallery.filter(Boolean) : [];
    const mainImage = normalizeText(product && product.image);
    const images = [mainImage].concat(gallery).filter(Boolean).filter((image, imageIndex, listRef) => listRef.indexOf(image) === imageIndex);
    const id = normalizeText(product && product.id) || `live-product-${Date.now().toString(36)}-${index}`;
    const fallbackImages = defaultProductImageMap.get(id) || [];
    const finalImages = fallbackImages.length ? fallbackImages : (images.length ? images : [fallbackImage]);
    const spotlightUntil = Date.parse(product && product.spotlightUntil);
    const newUntil = Date.parse(product && product.newUntil);

    const normalizedProduct = {
      id,
      name: normalizeText(product && product.name) || "SharonCraft Product",
      category: categoryMatch.slug,
      price: Number(product && product.price) || 0,
      basePrice:
        product &&
        product.basePrice !== null &&
        product.basePrice !== "" &&
        typeof product.basePrice !== "undefined" &&
        Number.isFinite(Number(product.basePrice))
          ? Math.max(0, Number(product.basePrice))
          : null,
      pricingMode: normalizeText(product && product.pricingMode),
      soldOut: Boolean(product && product.soldOut),
      material,
      story,
      spotlightUntil: normalizeText(product && product.spotlightUntil),
      newUntil: normalizeText(product && product.newUntil),
      updatedAt: normalizeText(product && product.updatedAt),
      sortOrder: Number(product && product.sortOrder) || index,
      badge:
        Number.isFinite(spotlightUntil) && spotlightUntil > Date.now()
          ? normalizeText(product && product.spotlightText) || "Featured"
          : Number.isFinite(newUntil) && newUntil > Date.now()
            ? "New"
            : "",
      featured: Number.isFinite(spotlightUntil) && spotlightUntil > Date.now(),
      newArrival: Number.isFinite(newUntil) && newUntil > Date.now(),
      shortDescription: story || "Handmade by SharonCraft artisans.",
      description: story || "Handmade by SharonCraft artisans.",
      details: Array.isArray(product && product.specs) ? product.specs.filter(Boolean) : [],
      images: finalImages,
    };

    return pricing && typeof pricing.applyPricingToProduct === "function"
      ? pricing.applyPricingToProduct(normalizedProduct, data.site)
      : normalizedProduct;
  };

  async function syncProductsFromSupabase() {
    if (isLocalPreview && hasLocalCatalogOverride()) {
      return null;
    }

    if (!liveCatalog || typeof liveCatalog.fetchProducts !== "function" || !liveCatalog.isConfigured()) {
      return null;
    }

    const products = await liveCatalog.fetchProducts();
    const safeProducts = Array.isArray(products) ? products : [];
    const repeatedMainImages = safeProducts.reduce((set, product, _, list) => {
      const image = normalizeText(product && product.image);
      if (!image) {
        return set;
      }
      const count = list.filter((item) => normalizeText(item && item.image) === image).length;
      if (count > 1) {
        set.add(image);
      }
      return set;
    }, new Set());

    const nextProducts = safeProducts
      .map((product, index) => toWebsiteProduct(product, index, repeatedMainImages))
      .filter((product) => product.name && product.images && product.images.length);

    if (!nextProducts.length) {
      return null;
    }

    data.products.length = 0;
    nextProducts.forEach((product) => data.products.push(product));

    if (!isLocalPreview) {
      try {
        window.localStorage.removeItem(storage.storageKey);
      } catch (error) {
        console.warn("Unable to clear stale local catalog override.", error);
      }

      try {
        window.localStorage.setItem(storage.liveCatalogCacheKey, JSON.stringify(nextProducts));
      } catch (error) {
        console.warn("Unable to cache the latest live catalog.", error);
      }
    }

    return nextProducts;
  }

  async function syncHomeVisualsFromSupabase() {
    if (isLocalPreview && hasLocalHomeVisualsOverride()) {
      return null;
    }

    if (
      !liveCatalog ||
      typeof liveCatalog.fetchSetting !== "function" ||
      typeof liveCatalog.isConfigured !== "function" ||
      !liveCatalog.isConfigured()
    ) {
      return null;
    }

    const settingRecord =
      typeof liveCatalog.fetchSettingRecord === "function"
        ? await liveCatalog.fetchSettingRecord("home_visuals")
        : null;
    const setting = settingRecord && typeof settingRecord.value === "object"
      ? settingRecord.value
      : await liveCatalog.fetchSetting("home_visuals");

    if (!setting || typeof setting !== "object") {
      return null;
    }

    const fallback =
      (window.SharonCraftDefaultData && window.SharonCraftDefaultData.homeVisuals) ||
      data.homeVisuals ||
      {};

    data.homeVisuals = {
      ...normalizeHomeVisuals(setting, fallback),
      version: normalizeText(settingRecord && settingRecord.updated_at) || computeCacheVersion(setting),
    };

    if (!isLocalPreview) {
      try {
        window.localStorage.removeItem(storage.homeVisualsSettingsKey);
      } catch (error) {
        console.warn("Unable to clear stale local visual override.", error);
      }

      try {
        window.localStorage.setItem(storage.liveHomeVisualsCacheKey, JSON.stringify(data.homeVisuals));
      } catch (error) {
        console.warn("Unable to cache the latest live homepage visuals.", error);
      }
    }

    return data.homeVisuals;
  }

  async function syncSocialsFromSupabase() {
    if (isLocalPreview && hasLocalSocialsOverride()) {
      return null;
    }

    if (
      !liveCatalog ||
      typeof liveCatalog.fetchSetting !== "function" ||
      typeof liveCatalog.isConfigured !== "function" ||
      !liveCatalog.isConfigured()
    ) {
      return null;
    }

    const setting = await liveCatalog.fetchSetting("social_links");
    if (!Array.isArray(setting)) {
      return null;
    }

    const fallbackSocials =
      (window.SharonCraftDefaultData && window.SharonCraftDefaultData.site && window.SharonCraftDefaultData.site.socials) ||
      data.site.socials ||
      [];

    data.site.socials = normalizeSocials(setting, fallbackSocials);

    if (!isLocalPreview) {
      try {
        window.localStorage.removeItem(storage.socialSettingsKey);
      } catch (error) {
        console.warn("Unable to clear stale local social override.", error);
      }

      try {
        window.localStorage.setItem(storage.liveSocialSettingsCacheKey, JSON.stringify(data.site.socials));
      } catch (error) {
        console.warn("Unable to cache the latest live social links.", error);
      }
    }

    return data.site.socials;
  }

  async function syncSiteContentFromSupabase() {
    if (isLocalPreview && hasLocalSiteContentOverride()) {
      return null;
    }

    if (
      !liveCatalog ||
      typeof liveCatalog.fetchSetting !== "function" ||
      typeof liveCatalog.isConfigured !== "function" ||
      !liveCatalog.isConfigured()
    ) {
      return null;
    }

    const setting = await liveCatalog.fetchSetting("site_content");
    if (!setting || typeof setting !== "object") {
      return null;
    }

    if (!isLocalPreview) {
      try {
        window.localStorage.removeItem(siteContentSettingsKey);
      } catch (error) {
        console.warn("Unable to clear stale local site content override.", error);
      }

      try {
        window.localStorage.setItem(liveSiteContentCacheKey, JSON.stringify(setting));
      } catch (error) {
        console.warn("Unable to cache the latest live site content.", error);
      }
    }

    return setting;
  }

  async function syncFromSupabase() {
    const results = await Promise.allSettled([
      syncProductsFromSupabase(),
      syncHomeVisualsFromSupabase(),
      syncSocialsFromSupabase(),
      syncSiteContentFromSupabase()
    ]);
    return results;
  }

  function scheduleLiveSync() {
    const runSync = function () {
      return syncFromSupabase().catch(function (error) {
        console.error("Unable to sync storefront catalog from Supabase.", error);
        return null;
      });
    };

    return new Promise(function (resolve) {
      const start = function () {
        runSync().then(resolve);
      };

      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(start, { timeout: 1200 });
        return;
      }

      window.setTimeout(start, 250);
    });
  }

  window.SharonCraftLiveSync = {
    ready: scheduleLiveSync(),
  };
}());
