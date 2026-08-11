export const CATEGORIES = [
  {
    name: 'Jewellery',
    slug: 'jewellery',
    subcategories: [
      { name: 'Necklaces', slug: 'necklaces' },
      { name: 'Earrings', slug: 'earrings' },
      { name: 'Bracelets', slug: 'bracelets' },
      { name: 'Bangles', slug: 'bangles' },
      { name: 'Anklets', slug: 'anklets' },
      { name: 'Rings', slug: 'rings' },
      { name: 'Hair Accessories', slug: 'hair-accessories' },
      { name: 'Sets & Collections', slug: 'sets-collections' },
    ],
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    subcategories: [
      { name: 'Beaded Sandals', slug: 'beaded-sandals' },
      { name: 'Kiondos & Bags', slug: 'kiondos-bags' },
      { name: 'Belts', slug: 'belts' },
      { name: 'Key Holders', slug: 'key-holders' },
      { name: 'Bags & Pouches', slug: 'bags-pouches' },
    ],
  },
  {
    name: 'African Wear',
    slug: 'african-wear',
    subcategories: [
      { name: 'Maasai Shuka Wraps', slug: 'maasai-shuka-wraps' },
      { name: 'Embroidered Tops', slug: 'embroidered-tops' },
      { name: 'T-Shirts', slug: 't-shirts' },
      { name: 'Jumpsuits & Dresses', slug: 'jumpsuits-dresses' },
      { name: 'Occasion Wear', slug: 'occasion-wear' },
    ],
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    subcategories: [
      { name: 'Baskets & Storage', slug: 'baskets-storage' },
      { name: 'Kitchen & Serving', slug: 'kitchen-serving' },
      { name: 'Wall Decor', slug: 'wall-decor' },
      { name: 'Table Decor', slug: 'table-decor' },
      { name: 'Mugs & Cups', slug: 'mugs-cups' },
    ],
  },
  {
    name: 'Art & Craft',
    slug: 'art-craft',
    subcategories: [
      { name: 'Soapstone Carvings', slug: 'soapstone-carvings' },
      { name: 'Wooden Carvings', slug: 'wooden-carvings' },
      { name: 'Paintings & Prints', slug: 'paintings-prints' },
      { name: 'Beaded Art', slug: 'beaded-art' },
      { name: 'Mixed Media', slug: 'mixed-media' },
    ],
  },
  {
    name: 'Gifted Carry',
    slug: 'gifted-carry',
    subcategories: [
      { name: 'Gift Sets', slug: 'gift-sets' },
      { name: 'Gift Wrapping', slug: 'gift-wrapping' },
      { name: 'Corporate Gifts', slug: 'corporate-gifts' },
      { name: 'Occasion Gifts', slug: 'occasion-gifts' },
    ],
  },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]['name'];
export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

type CategoryConfig = (typeof CATEGORIES)[number];
type SubcategoryConfig = CategoryConfig['subcategories'][number];

export const CATEGORY_NAMES = CATEGORIES.map((category) => category.name);
export const CATEGORY_SLUGS = CATEGORIES.map((category) => category.slug);

const categoryBySlug = new Map<string, CategoryConfig>(
  CATEGORIES.map((category) => [category.slug, category]),
);
const categoryByName = new Map<string, CategoryConfig>(
  CATEGORIES.map((category) => [category.name, category]),
);

function compactText(value: unknown) {
  return String(value || '').trim();
}

function slugifyCategoryValue(value: string) {
  return compactText(value)
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const HOMEPAGE_CATEGORY_IMAGE_KEYS = {
  jewellery: 'homepage_cat_jewellery',
  accessories: 'homepage_cat_accessories',
  'african-wear': 'homepage_cat_african_wear',
  'home-living': 'homepage_cat_home_living',
  'art-craft': 'homepage_cat_art_craft',
  'gifted-carry': 'homepage_cat_gifted_carry',
} as const;

export const SHOP_CATEGORY_IMAGE_KEYS = {
  jewellery: 'shop_cat_hero_jewellery',
  accessories: 'shop_cat_hero_accessories',
  'african-wear': 'shop_cat_hero_african_wear',
} as const;

export function getCategoryBySlug(slug: string) {
  const normalizedSlug = slugifyCategoryValue(slug);
  return categoryBySlug.get(normalizedSlug);
}

export function getCategoryByName(name: string) {
  const safeName = compactText(name);
  return categoryByName.get(safeName) || getCategoryBySlug(safeName);
}

export function getCategoryName(value: string) {
  return getCategoryByName(value)?.name || '';
}

export function getCategorySlug(name: string): string {
  return getCategoryByName(name)?.slug || slugifyCategoryValue(name);
}

export function getSubcategories(categoryName: string) {
  return getCategoryByName(categoryName)?.subcategories ?? [];
}

export function getSubcategoryByName(categoryName: string, subcategoryName: string) {
  const safeName = compactText(subcategoryName);
  const category = getCategoryByName(categoryName);
  if (!category || !safeName) return undefined;

  return category.subcategories.find((subcategory) => subcategory.name === safeName)
    || category.subcategories.find((subcategory) => subcategory.slug === slugifyCategoryValue(safeName));
}

export function getSubcategorySlug(categoryName: string, subcategoryName: string) {
  return getSubcategoryByName(categoryName, subcategoryName)?.slug || slugifyCategoryValue(subcategoryName);
}

export function normalizeCategoryName(value: string) {
  return getCategoryByName(value)?.name || '';
}

export function normalizeSubcategoryName(categoryName: string, value: string) {
  return getSubcategoryByName(categoryName, value)?.name || '';
}

export function getSubcategoryBySlug(categoryName: string, subcategorySlug: string) {
  const safeSlug = slugifyCategoryValue(subcategorySlug);
  const category = getCategoryByName(categoryName);
  if (!category || !safeSlug) return undefined;

  return category.subcategories.find((subcategory) => subcategory.slug === safeSlug);
}

export function findCategoryBySubcategory(subcategoryValue: string) {
  const safeValue = compactText(subcategoryValue);
  const safeSlug = slugifyCategoryValue(safeValue);

  return CATEGORIES.find((category) =>
    category.subcategories.some(
      (subcategory) =>
        subcategory.name === safeValue || subcategory.slug === safeSlug,
    ),
  );
}

export function buildShopHref(categoryName?: string | null, subcategoryName?: string | null) {
  const normalizedCategory = normalizeCategoryName(String(categoryName || ''));
  const normalizedSubcategory = normalizedCategory
    ? normalizeSubcategoryName(normalizedCategory, String(subcategoryName || ''))
    : '';

  if (!normalizedCategory) {
    return '/shop';
  }

  const categorySlug = getCategorySlug(normalizedCategory);

  if (!normalizedSubcategory) {
    return `/shop/${categorySlug}`;
  }

  return `/shop/${categorySlug}/${getSubcategorySlug(normalizedCategory, normalizedSubcategory)}`;
}

export function buildShopCategoryTree() {
  return [
    {
      id: 'all',
      label: 'All',
      queryValue: 'All',
    },
    ...CATEGORIES.map((category) => ({
      id: category.name,
      label: category.name,
      queryValue: category.name,
      match: {
        categories: [category.name],
      },
      children: category.subcategories.map((subcategory) => ({
        id: subcategory.name,
        label: subcategory.name,
        queryValue: subcategory.name,
        match: {
          categories: [category.name],
          subcategories: [subcategory.name],
        },
      })),
    })),
  ];
}

export function getMegaMenuColumns() {
  return [
    [CATEGORIES[0], CATEGORIES[1]],
    [CATEGORIES[2], CATEGORIES[3]],
    [CATEGORIES[4], CATEGORIES[5]],
  ];
}

export function getHomepageFallbackCategories(imageLookup: Record<string, string> = {}) {
  return CATEGORIES.map((category, index) => ({
    id: category.slug,
    name: category.name,
    subcategories: category.subcategories.map((subcategory) => subcategory.name),
    image_url: imageLookup[HOMEPAGE_CATEGORY_IMAGE_KEYS[category.slug as keyof typeof HOMEPAGE_CATEGORY_IMAGE_KEYS]] || '',
    is_visible: true,
    display_order: index + 1,
  }));
}
