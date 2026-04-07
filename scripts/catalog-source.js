const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dataModulePath = path.join(rootDir, "assets", "js", "data.js");
const supabaseConfigPath = path.join(rootDir, "supabase", "supabase-config.js");
const siteUrl = (process.env.SITE_URL || "https://www.sharoncraft.co.ke").replace(/\/+$/, "");

function bootstrapWindow() {
  global.window = {
    localStorage: {
      getItem: function () {
        return null;
      },
      setItem: function () {
        return null;
      }
    },
    location: {
      origin: siteUrl
    }
  };
}

function clearModule(modulePath) {
  try {
    delete require.cache[require.resolve(modulePath)];
  } catch (error) {
    return;
  }
}

function loadStaticData() {
  bootstrapWindow();
  clearModule(dataModulePath);
  require(dataModulePath);
  return global.window.SharonCraftData || {};
}

function loadSupabaseConfig() {
  bootstrapWindow();
  clearModule(supabaseConfigPath);
  require(supabaseConfigPath);
  return global.window.SUPABASE_CONFIG || {};
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => normalizeText(item)).filter(Boolean);
      }
    } catch (error) {
      return trimmed
        .split(",")
        .map((item) => normalizeText(item))
        .filter(Boolean);
    }
  }
  return [];
}

function mapSupabaseRowToProduct(row, index, staticData, repeatedMainImages) {
  const categories = Array.isArray(staticData.categories) ? staticData.categories : [];
  const staticProducts = Array.isArray(staticData.products) ? staticData.products : [];
  const defaultProductImageMap = new Map(
    staticProducts.map((product) => [
      normalizeText(product && product.id),
      Array.isArray(product && product.images) ? product.images.filter(Boolean) : []
    ])
  );
  const material = normalizeText(row && row.material);
  const story = normalizeText(row && row.story);
  const noteParts = normalizeText(row && row.notes).split("|");
  const explicitSlug = normalizeText(noteParts[0]);
  const categoryMatch =
    categories.find((category) => category.slug === explicitSlug) ||
    categories.find((category) => normalizeText(category.name).toLowerCase() === material.toLowerCase()) ||
    categories[0] ||
    { slug: "necklaces", name: "Necklaces" };
  const mainImage = normalizeText(row && row.image);
  const gallery = normalizeList(row && row.gallery);
  const images = [mainImage].concat(gallery).filter(Boolean).filter((image, imageIndex, listRef) => listRef.indexOf(image) === imageIndex);
  const id = normalizeText(row && row.id) || `live-product-${Date.now().toString(36)}-${index}`;
  const fallbackImages = defaultProductImageMap.get(id) || [];
  const useFallbackImages =
    fallbackImages.length &&
    (!images.length || repeatedMainImages.has(mainImage));
  const finalImages = useFallbackImages ? fallbackImages : (images.length ? images : ["assets/images/custom-occasion-beadwork-46mokm-opt.webp"]);
  const spotlightUntil = Date.parse(row && row.spotlight_until);
  const newUntil = Date.parse(row && row.new_until);

  return {
    id,
    name: normalizeText(row && row.name) || "SharonCraft Product",
    category: categoryMatch.slug,
    categoryName: normalizeText(categoryMatch.name) || "Handmade Beadwork",
    price: Number(row && row.price) || 0,
    soldOut: Boolean(row && row.sold_out),
    story,
    description: story || "Handmade by SharonCraft artisans.",
    shortDescription: story || "Handmade by SharonCraft artisans.",
    details: normalizeList(row && row.specs),
    images: finalImages,
    updatedAt: normalizeText(row && row.updated_at),
    featured: Number.isFinite(spotlightUntil) && spotlightUntil > Date.now(),
    newArrival: Number.isFinite(newUntil) && newUntil > Date.now(),
    sortOrder: Number(row && row.sort_order) || index
  };
}

async function loadLiveProducts(staticData) {
  const config = loadSupabaseConfig();
  const url = normalizeText(config.url);
  const anonKey = normalizeText(config.anonKey);
  const productsTable = normalizeText(config.productsTable) || "products";

  if (!url || !anonKey) {
    return null;
  }

  const endpoint = `${url}/rest/v1/${encodeURIComponent(productsTable)}?select=*&order=sort_order.asc.nullslast,updated_at.desc.nullslast`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase catalog fetch failed: ${response.status} ${response.statusText}`);
  }

  const rows = await response.json();
  const safeRows = Array.isArray(rows) ? rows : [];
  const repeatedMainImages = safeRows.reduce((set, product, _, list) => {
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

  return safeRows.map((row, index) => mapSupabaseRowToProduct(row, index, staticData, repeatedMainImages));
}

async function loadCatalogSource() {
  const staticData = loadStaticData();
  const staticProducts = Array.isArray(staticData.products) ? staticData.products : [];

  try {
    const liveProducts = await loadLiveProducts(staticData);
    if (Array.isArray(liveProducts) && liveProducts.length) {
      return {
        source: "supabase-live",
        site: staticData.site || {},
        categories: staticData.categories || [],
        products: liveProducts
      };
    }
  } catch (error) {
    console.warn(`Falling back to static catalog for build artifacts. ${error.message}`);
  }

  return {
    source: "static-data",
    site: staticData.site || {},
    categories: staticData.categories || [],
    products: staticProducts
  };
}

module.exports = {
  loadCatalogSource
};
