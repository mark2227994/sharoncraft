const fs = require('fs');
const path = require('path');
const { loadCatalogSource } = require('./catalog-source');
const siteUrl = "https://www.sharoncraft.co.ke";
const rootDir = path.resolve(__dirname, "..");
const fallbackImagePath = "assets/images/custom-occasion-beadwork-46mokm-opt.webp";
const maxImageReferenceLength = 2048;
const merchantImageAliasMap = new Map([
  ["assets/images/Africa Beads Necklace_tribal Beads Maasai….webp", "assets/images/circle-mother-necklace-main.webp"],
  ["assets/images/African Kenyan Handmade Pendant Necklace_ Unique….webp", "assets/images/circle-mother-necklace-alt.webp"],
  ["assets/images/Africa Beads Necklace_tribal Beads Maasai….jpg", "assets/images/circle-mother-necklace-main.webp"],
  ["assets/images/African Kenyan Handmade Pendant Necklace_ Unique….jpg", "assets/images/circle-mother-necklace-alt.webp"],
  ["https://vonzscriztdcdhobulhy.supabase.co/storage/v1/object/public/product-images/catalog/1775536669198-elevate-your-style-with-our-stunning-maasai-regal.jpg", "assets/images/bead-jewlery-gift-set-main.jpg"]
]);

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function normalizeImageReference(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed.length > maxImageReferenceLength || /^data:/i.test(trimmed)) {
    return "";
  }

  if (isHttpUrl(trimmed)) {
    return getMerchantImageAliasPath(trimmed);
  }

  if (/^[a-z]+:/i.test(trimmed) || trimmed.startsWith("//")) {
    return "";
  }

  const normalizedLocalPath = trimmed.replace(/^\/+/, '');
  const resolvedLocalPath = resolveLocalAssetPath(normalizedLocalPath);
  return getMerchantImageAliasPath(resolvedLocalPath);
}

function absoluteAssetUrl(assetPath) {
  const normalized = normalizeImageReference(assetPath) || fallbackImagePath;
  if (isHttpUrl(normalized)) {
    return normalized;
  }

  return `${siteUrl}/${normalized.split('/').map((segment) => encodeURIComponent(segment)).join('/')}`;
}

function resolveLocalAssetPath(assetPath) {
  const normalized = String(assetPath || "").trim().replace(/\\/g, "/");
  if (!normalized) {
    return "";
  }

  const resolvedPath = path.join(rootDir, normalized);
  if (fs.existsSync(resolvedPath)) {
    return normalized;
  }

  const ext = path.extname(normalized);
  const base = ext ? normalized.slice(0, -ext.length) : normalized;
  const extensionsToTry = [".webp", ".jpg", ".jpeg", ".png", ".gif"];

  for (const candidateExt of extensionsToTry) {
    const candidate = `${base}${candidateExt}`;
    if (fs.existsSync(path.join(rootDir, candidate))) {
      return candidate.replace(/\\/g, "/");
    }
  }

  return "";
}

function getMerchantImageAliasPath(assetPath) {
  const normalized = String(assetPath || "").trim().replace(/\\/g, "/");
  if (!normalized) {
    return "";
  }

  const aliasPath = merchantImageAliasMap.get(normalized);
  if (!aliasPath) {
    return normalized;
  }

  if (fs.existsSync(path.join(rootDir, aliasPath))) {
    return aliasPath.replace(/\\/g, "/");
  }

  return normalized;
}

// Helper to reliably escape XML payload formats
function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe).replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function normalizeImageList(product) {
  const imageList = []
    .concat(Array.isArray(product && product.images) ? product.images : [])
    .concat(product && product.image ? [product.image] : [])
    .concat(Array.isArray(product && product.gallery) ? product.gallery : [])
    .map((item) => normalizeImageReference(item))
    .filter(Boolean);

  const unique = imageList.filter((image, index) => imageList.indexOf(image) === index);
  return unique.length ? unique : [fallbackImagePath];
}

function normalizeDescription(product) {
  const category = categoryMap.get(String(product && product.category || "").trim()) || {};
  const parts = [
    String(product && (product.shortDescription || product.description || product.name) || "").trim(),
    category && category.name ? `Category: ${String(category.name).trim()}.` : "",
    Array.isArray(product && product.details) && product.details.length ? product.details.slice(0, 2).join(". ") : ""
  ].filter(Boolean);

  return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 4990);
}

function buildProductType(product) {
  const category = categoryMap.get(String(product && product.category || "").trim()) || {};
  const categoryName = String(category.name || "Handmade Beadwork").trim();
  return `${siteName} > ${categoryName}`;
}

function generateItem(product) {
  if (!product || !product.id) return '';
  const url = `${siteUrl}/product.html?id=${encodeURIComponent(product.id)}`;
  const category = categoryMap.get(String(product.category || "").trim()) || {};
  const productImages = normalizeImageList(product);
  const mainImage = absoluteAssetUrl(productImages[0]);
  const additionalImagesXml = productImages
    .slice(1, 10)
    .map((image) => `      <g:additional_image_link>${escapeXml(absoluteAssetUrl(image))}</g:additional_image_link>`)
    .join('\n');
  const productType = buildProductType(product);
  const customLabel0 = product.featured ? "featured" : product.newArrival ? "new-arrival" : "catalog";
  const customLabel1 = String(category.name || product.category || "handmade beadwork").trim();

  return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(normalizeDescription(product))}</g:description>
      <g:link>${escapeXml(url)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
${additionalImagesXml ? `${additionalImagesXml}\n` : ""}      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:condition>new</g:condition>
      <g:availability>${product.soldOut ? 'out of stock' : 'in stock'}</g:availability>
      <g:price>${Math.max(product.price || 0, 0)} KES</g:price>
      <g:brand>${escapeXml(siteName)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:adult>no</g:adult>
      <g:custom_label_0>${escapeXml(customLabel0)}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(customLabel1)}</g:custom_label_1>
    </item>`;
}

let products = [];
let site = {};
let siteName = "SharonCraft";
let categoryMap = new Map();

async function main() {
  const catalogSource = await loadCatalogSource();
  products = Array.isArray(catalogSource.products) ? catalogSource.products : [];
  site = catalogSource.site || {};
  siteName = site.name || "SharonCraft";
  categoryMap = new Map(
    (Array.isArray(catalogSource.categories) ? catalogSource.categories : []).map((category) => [String(category.slug || "").trim(), category || {}])
  );

  const itemsXml = products.map(generateItem).join("");

  const feedXml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(siteName)} Catalog</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(site.tagline || 'Shop Authentic African Beadwork')}</description>
    ${itemsXml}
  </channel>
</rss>`;

  const outputPath = path.join(__dirname, '../google-merchant-feed.xml');
  fs.writeFileSync(outputPath, feedXml, 'utf8');
  console.log('Google Merchant feed generated successfully at: ' + outputPath);
  console.log(`Catalog source: ${catalogSource.source}`);
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});
