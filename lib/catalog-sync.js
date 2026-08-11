/**
 * Maps between Supabase `products` rows and storefront catalog JSON.
 */

import { slugify } from "./products";

function compactText(value) {
  return String(value || "").trim();
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => compactText(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => compactText(item)).filter(Boolean);
      }
    } catch {
      return trimmed
        .split(/[,|\n]/)
        .map((item) => compactText(item))
        .filter(Boolean);
    }
  }
  return [];
}

export function buildStorefrontSlug(product) {
  const explicit = compactText(product?.slug);
  if (explicit) return slugify(explicit) || explicit;
  const nameSlug = slugify(product?.name || product?.subcategory || product?.category || "product");
  const idPrefix = compactText(product?.id).replace(/[^a-z0-9]/gi, "").slice(0, 8);
  return idPrefix ? `${nameSlug}-${idPrefix}` : nameSlug;
}

export function isAdminProductRow(row) {
  if (!row || typeof row !== "object") return false;
  return (
    typeof row.is_visible === "boolean" ||
    typeof row.is_featured === "boolean" ||
    typeof row.stock_quantity === "number" ||
    Array.isArray(row.images)
  );
}

function mapLegacyTableRowToCatalog(row) {
  const gallery = normalizeStringList(row?.gallery);
  const primaryImage = compactText(row?.image);
  const images = Array.from(new Set([primaryImage, ...gallery].filter(Boolean)));
  const spotlightUntil = Date.parse(row?.spotlight_until || row?.spotlightUntil || "");
  const newUntil = Date.parse(row?.new_until || row?.newUntil || "");
  const now = Date.now();
  const specs = normalizeStringList(row?.specs);
  const notes = compactText(row?.notes);
  const categoryFromNotes = notes.split("|")[0]?.trim() || "";

  return {
    id: compactText(row?.id),
    slug: buildStorefrontSlug({ id: row?.id, name: row?.name, slug: row?.id }),
    name: compactText(row?.name) || "Untitled Piece",
    description: compactText(row?.story || row?.description),
    shortDescription: compactText(row?.story || row?.description),
    fullDescription: compactText(row?.story || row?.description),
    category: categoryFromNotes || compactText(row?.material) || "Jewellery",
    subcategory: "",
    price: Math.max(0, toNumber(row?.price, 0)),
    originalPrice: null,
    sale_price: null,
    stock: row?.sold_out || row?.soldOut ? 0 : 1,
    isSold: Boolean(row?.sold_out || row?.soldOut),
    image: images[0] || "",
    images,
    featured:
      Boolean(row?.featured) ||
      (Number.isFinite(spotlightUntil) && spotlightUntil > now),
    featuredOrder: toNumber(row?.sort_order ?? row?.sortOrder, 999),
    recent:
      Boolean(row?.newArrival) ||
      (Number.isFinite(newUntil) && newUntil > now),
    isNew:
      Boolean(row?.newArrival) ||
      (Number.isFinite(newUntil) && newUntil > now),
    newArrival:
      Boolean(row?.newArrival) ||
      (Number.isFinite(newUntil) && newUntil > now),
    publishStatus: "published",
    artisan: "Sharon",
    fulfillmentType: "ready_to_ship",
    careInstructions: "",
    care_instructions: "",
    details: specs,
    heritageStory: "",
    materials: [],
    sku: null,
    badge: compactText(row?.spotlight_text || row?.spotlightText),
    story: {
      artisanName: "Sharon",
      text: compactText(row?.story),
      culturalNote: "",
      materials: [],
    },
  };
}

/** Admin `products` table row → storefront catalog item (pre-normalizeProduct). */
export function mapTableRowToCatalogProduct(row) {
  if (!isAdminProductRow(row)) {
    return mapLegacyTableRowToCatalog(row);
  }

  const basePrice = Math.max(0, toNumber(row?.price, 0));
  const salePrice = toNumber(row?.sale_price, NaN);
  const hasSalePrice = Number.isFinite(salePrice) && salePrice > 0 && salePrice < basePrice;
  const images = normalizeStringList(row?.images);
  const sizes = normalizeStringList(row?.sizes);
  const colors = normalizeStringList(row?.colors);
  const stock = Math.max(0, Math.floor(toNumber(row?.stock_quantity, 0)));
  const subcategory = compactText(row?.subcategory);
  const careInstructions = compactText(row?.care_instructions || row?.careInstructions);
  const materials = normalizeStringList(row?.materials);
  const detailsFromDb = normalizeStringList(row?.details);
  const description = compactText(row?.description);
  const fullDescription = compactText(row?.full_description || row?.fullDescription) || description;
  const heritageStory = compactText(row?.heritage_story || row?.heritageStory);
  const storyText = compactText(row?.story_text || row?.story?.text) || description;
  const storyCulturalNote = compactText(row?.story_cultural_note || row?.story?.culturalNote);

  const details = [
    ...detailsFromDb,
    subcategory && !detailsFromDb.some((d) => d.includes(subcategory)) ? `Subcategory: ${subcategory}` : "",
    sizes.length > 0 ? `Available sizes: ${sizes.join(", ")}` : "",
    colors.length > 0 ? `Available colors: ${colors.join(", ")}` : "",
    careInstructions &&
    !detailsFromDb.some((d) => /care/i.test(d)) &&
    !detailsFromDb.includes(careInstructions)
      ? `Care: ${careInstructions}`
      : "",
  ].filter(Boolean);

  return {
    id: compactText(row?.id),
    slug: buildStorefrontSlug(row),
    name: compactText(row?.name) || "Untitled Piece",
    description,
    shortDescription: compactText(row?.short_description || row?.shortDescription) || description,
    fullDescription,
    heritageStory,
    category: compactText(row?.category),
    subcategory,
    price: hasSalePrice ? salePrice : basePrice,
    originalPrice: hasSalePrice ? basePrice : null,
    sale_price: hasSalePrice ? salePrice : null,
    stock,
    stock_quantity: stock,
    isSold: stock <= 0,
    image: images[0] || "",
    images,
    featured: Boolean(row?.is_featured ?? row?.featured),
    featuredOrder: toNumber(row?.featured_order ?? row?.featuredOrder, 999),
    recent: Boolean(row?.is_new ?? row?.recent ?? row?.newArrival),
    isNew: Boolean(row?.is_new ?? row?.isNew ?? row?.newArrival),
    newArrival: Boolean(row?.is_new ?? row?.newArrival),
    publishStatus: row?.is_visible === false ? "draft" : "published",
    is_visible: row?.is_visible !== false,
    artisan: compactText(row?.artisan) || "Sharon",
    fulfillmentType: compactText(row?.fulfillment_type || row?.fulfillmentType) || "ready_to_ship",
    careInstructions,
    care_instructions: careInstructions,
    details,
    materials,
    sizes,
    colors,
    sku: compactText(row?.sku) || null,
    badge: compactText(row?.badge),
    options: sizes,
    story: {
      artisanName: compactText(row?.artisan) || "Sharon",
      text: storyText,
      culturalNote: storyCulturalNote,
      materials,
    },
  };
}

/** Storefront catalog item → admin `products` table row (upsert). */
export function mapCatalogProductToTableRow(product) {
  const basePrice = Math.max(0, toNumber(product?.originalPrice || product?.price, 0));
  const displayPrice = Math.max(0, toNumber(product?.price, 0));
  const salePrice =
    product?.sale_price != null
      ? toNumber(product.sale_price, NaN)
      : product?.originalPrice && displayPrice < basePrice
        ? displayPrice
        : null;
  const hasSale = Number.isFinite(salePrice) && salePrice > 0 && salePrice < basePrice;
  const images = normalizeStringList(product?.images);
  const primary = compactText(product?.image);
  if (primary && !images.includes(primary)) {
    images.unshift(primary);
  }

  return {
    name: compactText(product?.name),
    slug: buildStorefrontSlug(product),
    description: compactText(product?.description || product?.shortDescription),
    full_description: compactText(product?.fullDescription || product?.full_description),
    heritage_story: compactText(product?.heritageStory || product?.heritage_story),
    price: hasSale ? basePrice : displayPrice,
    sale_price: hasSale ? salePrice : null,
    category: compactText(product?.category) || "Jewellery",
    subcategory: compactText(product?.subcategory) || null,
    stock_quantity: Math.max(0, Math.floor(toNumber(product?.stock ?? product?.stock_quantity, 0))),
    images,
    sizes: normalizeStringList(product?.sizes || product?.options),
    colors: normalizeStringList(product?.colors),
    artisan: compactText(product?.artisan) || "By Sharon",
    care_instructions: compactText(product?.care_instructions || product?.careInstructions),
    sku: compactText(product?.sku) || null,
    is_visible: product?.is_visible !== false && product?.publishStatus !== "draft",
    is_featured: Boolean(product?.featured ?? product?.is_featured),
    is_new: Boolean(product?.is_new ?? product?.isNew ?? product?.recent ?? product?.newArrival),
    featured_order: toNumber(product?.featuredOrder ?? product?.featured_order, 999),
    fulfillment_type: compactText(product?.fulfillmentType || product?.fulfillment_type) || "ready_to_ship",
    materials: Array.isArray(product?.materials)
      ? product.materials
      : compactText(product?.materials)
        ? [compactText(product.materials)]
        : [],
    details: normalizeStringList(product?.details),
    story_text: compactText(product?.story?.text),
    story_cultural_note: compactText(product?.story?.culturalNote),
    badge: compactText(product?.badge) || null,
    updated_at: new Date().toISOString(),
  };
}

export function sortByFeaturedOrder(products) {
  return products.slice().sort((left, right) => {
    const orderDiff =
      toNumber(left?.featuredOrder, 999) - toNumber(right?.featuredOrder, 999);
    if (orderDiff !== 0) return orderDiff;
    return String(left?.name || "").localeCompare(String(right?.name || ""));
  });
}
