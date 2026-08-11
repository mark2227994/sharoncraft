import {
  buildShopCategoryTree,
  buildShopHref,
  getCategoryBySlug,
  getSmartFilterBySlug,
  getSubcategoryBySlug,
  normalizeCategoryName,
  normalizeSubcategoryName,
} from "../categories";
import {
  flattenShopNodes,
  ITEMS_PER_PAGE,
  normalizeAvailabilityValue,
  normalizePageValue,
  normalizePriceRangeValue,
  normalizeProductTypeValue,
  normalizeSortValue,
} from "../shop-utils";
import { queryShopProducts } from "../store";

const LEGACY_JEWELRY_TYPE_TO_SUBCATEGORY = {
  necklace: "Necklaces",
  necklaces: "Necklaces",
  earring: "Earrings",
  earrings: "Earrings",
  bracelet: "Bracelets",
  bracelets: "Bracelets",
  bangle: "Bangles",
  bangles: "Bangles",
  anklet: "Anklets",
  anklets: "Anklets",
  ring: "Rings",
  rings: "Rings",
};

function normalizeLegacyJewelryType(value) {
  return LEGACY_JEWELRY_TYPE_TO_SUBCATEGORY[String(value || "").trim().toLowerCase()] || "";
}

function onlyContainsCategoryRoutingQuery(query = {}) {
  const allowedKeys = new Set(["category", "subcategory", "jewelryType"]);
  return Object.keys(query).every((key) => allowedKeys.has(key));
}

function resolveCategorySelection(params = {}, query = {}) {
  const routeCategorySlug =
    typeof params.category === "string" ? params.category.trim() : "";
  const routeSubcategorySlug =
    typeof params.subcategory === "string" ? params.subcategory.trim() : "";
  const queryCategory =
    typeof query.category === "string" ? query.category.trim() : "";
  const querySubcategory =
    typeof query.subcategory === "string" ? query.subcategory.trim() : "";
  const legacyJewelryType =
    typeof query.jewelryType === "string" ? query.jewelryType.trim() : "";

  let categoryId = "";
  let categoryName = "";
  let subcategoryId = "";
  let subcategoryName = "";
  let smartFilter = "";

  if (routeCategorySlug) {
    const matchedSmartFilter = getSmartFilterBySlug(routeCategorySlug);
    if (matchedSmartFilter) {
      smartFilter = matchedSmartFilter.slug;
    } else {
      const matchedCategory = getCategoryBySlug(routeCategorySlug);
      categoryId = matchedCategory?.id || routeCategorySlug;
      categoryName = matchedCategory?.name || "";
    }
    if (categoryName && routeSubcategorySlug) {
      const matchedSubcategory = getSubcategoryBySlug(categoryName, routeSubcategorySlug);
      subcategoryId = matchedSubcategory?.slug || routeSubcategorySlug;
      subcategoryName = matchedSubcategory?.name || "";
    }
  } else if (queryCategory) {
    categoryName = normalizeCategoryName(queryCategory);
    if (categoryName) {
      const subcategoryName_ =
        normalizeSubcategoryName(categoryName, querySubcategory) ||
        normalizeSubcategoryName(categoryName, normalizeLegacyJewelryType(legacyJewelryType));
      if (subcategoryName_) {
        subcategoryName = subcategoryName_;
        const matched = getSubcategoryBySlug(categoryName, subcategoryName_);
        subcategoryId = matched?.slug || subcategoryName_.toLowerCase().replace(/\s+/g, "-");
      }
      // Try to find the ID for this category name
      categoryId = categoryName.toLowerCase().replace(/\s+/g, "-");
    }
  }

  return {
    initialCategory: categoryId || categoryName || "all",
    initialSubcategory: subcategoryId || subcategoryName,
    initialSmartFilter: smartFilter,
  };
}

function getCanonicalShopPath(initialCategory, initialSubcategory, initialSmartFilter = "") {
  if (initialSmartFilter) {
    return `/shop/${initialSmartFilter}`;
  }

  return buildShopHref(
    initialCategory === "all" ? "" : initialCategory,
    initialSubcategory || "",
  );
}

export async function getServerSideProps(context) {
  const { params = {}, query = {}, resolvedUrl = "" } = context;
  const [{ readSiteImageSlotMap }] = await Promise.all([
    import("../site-images"),
  ]);

  const categoryTree = buildShopCategoryTree({ publicOnly: true });
  const flatNodes = flattenShopNodes(categoryTree);
  const nodeById = new Map(flatNodes.map((node) => [node.id, node]));
  const siteImageSlots = await readSiteImageSlotMap();
  const categoryHeroOverrides = {
    ...(siteImageSlots?.shop_cat_hero_jewellery?.resolved_url
      ? { Jewellery: siteImageSlots.shop_cat_hero_jewellery.resolved_url }
      : {}),
    ...(siteImageSlots?.shop_cat_hero_accessories?.resolved_url
      ? { Accessories: siteImageSlots.shop_cat_hero_accessories.resolved_url }
      : {}),
    ...(siteImageSlots?.shop_cat_hero_the_kenya_edit?.resolved_url
      ? { "The Kenya Edit": siteImageSlots.shop_cat_hero_the_kenya_edit.resolved_url }
      : {}),
    ...(siteImageSlots?.shop_cat_hero_african_wear?.resolved_url
      ? { "African Wear": siteImageSlots.shop_cat_hero_african_wear.resolved_url }
      : {}),
  };

  const { initialCategory, initialSubcategory, initialSmartFilter } = resolveCategorySelection(params, query);
  const querySmartFilter =
    typeof query.filter === "string" ? getSmartFilterBySlug(query.filter)?.slug || "" : "";
  const smartFilter = initialSmartFilter || querySmartFilter;
  const canonicalPath = getCanonicalShopPath(initialCategory, initialSubcategory, smartFilter);

  if (
    !params.category &&
    onlyContainsCategoryRoutingQuery(query) &&
    canonicalPath !== "/shop"
  ) {
    return {
      redirect: {
        destination: canonicalPath,
        permanent: true,
      },
    };
  }

  const routeCategorySlug =
    typeof params.category === "string" ? params.category.trim() : "";

  if (
    params.category &&
    !smartFilter &&
    !nodeById.has(routeCategorySlug || (initialCategory === "all" ? "all" : initialCategory))
  ) {
    return { notFound: true };
  }

  if (params.subcategory && !initialSubcategory) {
    return { notFound: true };
  }

  const initialAvailability = normalizeAvailabilityValue(query.availability);
  const initialPriceRange = normalizePriceRangeValue(query.price);
  const initialProductType = normalizeProductTypeValue(query.productType);
  const initialSort = normalizeSortValue(query.sort);
  const initialPage = normalizePageValue(query.page);
  const initialResults = await queryShopProducts({
    activeCategory: initialCategory,
    activeSubcategory: initialSubcategory,
    availability: initialAvailability,
    smartFilter,
    activePriceRange: initialPriceRange,
    activeProductType: initialProductType,
    sortBy: initialSort,
    page: initialPage,
    limit: ITEMS_PER_PAGE,
  });

  return {
    props: {
      products: initialResults.products,
      initialTotalCount: initialResults.totalCount,
      initialCategory,
      initialSubcategory,
      initialAvailability,
      initialSmartFilter: smartFilter,
      initialPriceRange,
      initialProductType,
      initialSort,
      initialPage,
      categoryTree,
      categoryHeroOverrides,
      canonicalPath,
      initialResolvedUrl: resolvedUrl || canonicalPath,
    },
  };
}
