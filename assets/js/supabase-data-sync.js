(function () {
  const data = window.SharonCraftData;
  const storage = window.SharonCraftStorage;
  const liveCatalog = window.SharonCraftCatalog;
  const fallbackImage = "assets/images/IMG-20260226-WA0005.jpg";
  const normalizeText = (value) => String(value || "").trim();
  const defaultProductImageMap = new Map(
    (((window.SharonCraftDefaultData && window.SharonCraftDefaultData.products) || []).map((product) => [
      normalizeText(product && product.id),
      Array.isArray(product && product.images) ? product.images.filter(Boolean) : [],
    ]))
  );

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
    const useFallbackImages =
      fallbackImages.length &&
      (!images.length || repeatedMainImages.has(mainImage) || images.length === 1);
    const finalImages = useFallbackImages ? fallbackImages : (images.length ? images : [fallbackImage]);
    const spotlightUntil = Date.parse(product && product.spotlightUntil);
    const newUntil = Date.parse(product && product.newUntil);

    return {
      id,
      name: normalizeText(product && product.name) || "SharonCraft Product",
      category: categoryMatch.slug,
      price: Number(product && product.price) || 0,
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
  };

  async function syncProductsFromSupabase() {
    if (hasLocalCatalogOverride()) {
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
    return nextProducts;
  }

  window.SharonCraftLiveSync = {
    ready: syncProductsFromSupabase().catch(function (error) {
      console.error("Unable to sync storefront catalog from Supabase.", error);
      return null;
    }),
  };
}());
