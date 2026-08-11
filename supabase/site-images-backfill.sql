WITH site_content AS (
  SELECT value
  FROM site_settings
  WHERE key = 'site_content'
  LIMIT 1
),
about_content AS (
  SELECT
    content->>'image_url' AS image_url,
    content->>'secondary_image_url' AS secondary_image_url
  FROM homepage_content
  WHERE section = 'about'
    AND is_visible = true
  LIMIT 1
),
featured_artisan AS (
  SELECT image_url
  FROM artisans
  WHERE is_featured = true
  LIMIT 1
),
custom_order_slide AS (
  SELECT
    image_url AS resolved_image
  FROM hero_slides
  WHERE is_visible = true
    AND (
      OR lower(COALESCE(headline, '')) LIKE '%custom order%'
      OR lower(COALESCE(subtitle, '')) LIKE '%custom order%'
    )
  ORDER BY display_order ASC
  LIMIT 1
)
UPDATE site_images
SET
  image_url = CASE key
    WHEN 'homepage_hero' THEN COALESCE(
      (SELECT value->>'heroImage' FROM site_content),
      '/media/products/Gemini_Generated_Image_p3e0hup3e0hup3e0.jpg'
    )
    WHEN 'homepage_artisan_split' THEN COALESCE(
      (SELECT value->>'artisanPortrait' FROM site_content),
      '/media/site/artisans/Gemini_Generated_Image_35m6ig35m6ig35m6.png'
    )
    WHEN 'homepage_cat_jewellery' THEN COALESCE(
      (SELECT value->>'collectionJewellery' FROM site_content),
      '/media/products/Gemini_Generated_Image_uwdxzguwdxzguwdx.png'
    )
    WHEN 'homepage_cat_accessories' THEN COALESCE(
      (SELECT value->>'collectionAccessories' FROM site_content),
      '/media/products/Gemini_Generated_Image_9vevmr9vevmr9vev.png'
    )
    WHEN 'homepage_cat_african_wear' THEN COALESCE(
      (SELECT value->>'collectionBridal' FROM site_content),
      '/media/products/Gemini_Generated_Image_cji2fcji2fcji2fc.png'
    )
    WHEN 'homepage_cat_home_living' THEN COALESCE(
      (SELECT value->>'collectionHome' FROM site_content),
      '/media/products/Gemini_Generated_Image_xj81bfxj81bfxj81.png'
    )
    WHEN 'homepage_cat_art_craft' THEN '/media/site/artisans/Gemini_Generated_Image_dvxjjhdvxjjhdvxj.png'
    WHEN 'homepage_cat_gifted_carry' THEN '/media/site/homepage/ai-intent-gift-it.webp'
    WHEN 'about_hero' THEN COALESCE(
      (SELECT image_url FROM about_content),
      '/images/hero-fallback.jpg'
    )
    WHEN 'about_story_image' THEN COALESCE(
      (SELECT secondary_image_url FROM about_content),
      '/media/site/placeholder.svg'
    )
    WHEN 'about_founder_portrait' THEN COALESCE(
      (SELECT image_url FROM featured_artisan),
      '/media/site/placeholder.svg'
    )
    WHEN 'about_process_1' THEN '/media/site/placeholder.svg'
    WHEN 'about_process_2' THEN '/media/site/placeholder.svg'
    WHEN 'artisans_hero' THEN '/images/hero-fallback.jpg'
    WHEN 'artisans_featured_image' THEN COALESCE(
      (SELECT image_url FROM featured_artisan),
      '/images/hero-fallback.jpg'
    )
    WHEN 'artisans_process_1' THEN NULL
    WHEN 'artisans_process_2' THEN NULL
    WHEN 'custom_orders_hero' THEN COALESCE(
      (SELECT resolved_image FROM custom_order_slide),
      (SELECT value->>'customOrdersImage' FROM site_content),
      '/media/site/homepage/design.jpg'
    )
    WHEN 'shop_cat_hero_jewellery' THEN '/media/products/Jewellery.jpg'
    WHEN 'shop_cat_hero_accessories' THEN '/media/site/collections/ai-explore-gift-path.webp'
    WHEN 'shop_cat_hero_african_wear' THEN '/media/site/homepage/ai-intent-wear-it.webp'
    ELSE image_url
  END,
  updated_at = now(),
  updated_by = 'sql-backfill'
WHERE key IN (
  'homepage_hero',
  'homepage_artisan_split',
  'homepage_cat_jewellery',
  'homepage_cat_accessories',
  'homepage_cat_african_wear',
  'homepage_cat_home_living',
  'homepage_cat_art_craft',
  'homepage_cat_gifted_carry',
  'about_hero',
  'about_story_image',
  'about_founder_portrait',
  'about_process_1',
  'about_process_2',
  'artisans_hero',
  'artisans_featured_image',
  'artisans_process_1',
  'artisans_process_2',
  'custom_orders_hero',
  'shop_cat_hero_jewellery',
  'shop_cat_hero_accessories',
  'shop_cat_hero_african_wear'
);

SELECT
  COUNT(*) AS total_slots,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL AND image_url <> '') AS populated_slots,
  COUNT(*) FILTER (WHERE image_url IS NULL OR image_url = '') AS empty_slots
FROM site_images;
