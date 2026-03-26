(function () {
  const data = window.SharonCraftData;
  const storage = window.SharonCraftStorage;
  const liveCatalog = window.SharonCraftCatalog;

  if (!data || !storage) {
    window.SharonCraftLiveSync = { ready: Promise.resolve(null) };
    return;
  }

  const normalizeText = (value) => String(value || "").trim();

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

  const toWebsiteProduct = (product, index) => {
    const categories = Array.isArray(data.categories) ? data.categories : [];
    const material = normalizeText(product && product.material);
    const noteParts = normalizeText(product && product.notes).split("|");
    const explicitSlug = normalizeText(noteParts[0]);
    const categoryMatch =
      categories.find((category) => category.slug === explicitSlug) ||
      categories.find((category) => normalizeText(category.name).toLowerCase() === material.toLowerCase()) ||
      categories[0] ||
      { slug: "necklaces" };
    const gallery = Array.isArray(product && product.gallery) ? product.gallery.filter(Boolean) : [];
    const mainImage = normalizeText(product && product.image);
    const images = [mainImage].concat(gallery).filter(Boolean);
    const spotlightUntil = Date.parse(product && product.spotlightUntil);
    const newUntil = Date.parse(product && product.newUntil);

    return {
      id: normalizeText(product && product.id) || `live-product-${Date.now().toString(36)}-${index}`,
      name: normalizeText(product && product.name) || "SharonCraft Product",
      category: categoryMatch.slug,
      price: Number(product && product.price) || 0,
      badge:
        Number.isFinite(spotlightUntil) && spotlightUntil > Date.now()
          ? normalizeText(product && product.spotlightText) || "Featured"
          : Number.isFinite(newUntil) && newUntil > Date.now()
            ? "New"
            : "",
      featured: Number.isFinite(spotlightUntil) && spotlightUntil > Date.now(),
      newArrival: Number.isFinite(newUntil) && newUntil > Date.now(),
      shortDescription: normalizeText(product && product.story) || "Handmade by SharonCraft artisans.",
      description: normalizeText(product && product.story) || "Handmade by SharonCraft artisans.",
      details: Array.isArray(product && product.specs) ? product.specs.filter(Boolean) : [],
      images: images.length ? images : ["assets/images/IMG-20260226-WA0005.jpg"],
    };
  };

  async function syncProductsFromSupabase() {
    if (hasLocalCatalogOverride()) {
      return null;
    }

    if (!liveCatalog || typeof liveCatalog.fetchProducts !== "function" || !liveCatalog.isConfigured()) {
      return null;
    }

    const products = await liveCatalog.fetchProducts();
    const nextProducts = (Array.isArray(products) ? products : [])
      .map(toWebsiteProduct)
      .filter((product) => product.name && product.images && product.images.length);

    if (!nextProducts.length) {
      return null;
    }

    data.products.length = 0;
    nextProducts.forEach((product) => data.products.push(product));
    return nextProducts;
  }

  window.SharonCraftLiveSync = {
    ready: syncProductsFromSupabase().catch(function (error) {
      console.error("Unable to sync storefront catalog from Supabase.", error);
      return null;
    }),
  };
}());
