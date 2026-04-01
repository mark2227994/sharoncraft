const fs = require('fs');
const path = require('path');

// Mock window for data.js execution
global.window = {
  localStorage: {
    getItem: () => null,
    setItem: () => null
  },
  location: {
    origin: 'https://www.sharoncraft.co.ke'
  }
};

// Require triggers the IIFE in data.js to populate global.window
require('../assets/js/data.js');

const data = global.window.SharonCraftData;

if (!data || !data.products) {
  console.error("Failed to load catalog data mapping.");
  process.exit(1);
}

const products = data.products;
const site = data.site || {};
const siteName = site.name || "SharonCraft";
const siteUrl = "https://www.sharoncraft.co.ke";

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

function generateItem(product) {
  if (!product || !product.id) return '';
  const url = `${siteUrl}/product.html?id=${encodeURIComponent(product.id)}`;
  const firstImage = Array.isArray(product.images) && product.images[0] ? product.images[0] : "assets/images/IMG-20260226-WA0005.webp";
  // The replace-image-paths.js will convert existing .jpg paths inside codebase, but just to be safe in the XML generation:
  const webpImage = firstImage.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const imgUrl = `${siteUrl}/${webpImage}`;
        
  // Note: g:price must be strictly numeric with currency standard formatted.
  return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.description || product.shortDescription || product.name)}</g:description>
      <g:link>${escapeXml(url)}</g:link>
      <g:image_link>${escapeXml(imgUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${product.soldOut ? 'out of stock' : 'in stock'}</g:availability>
      <g:price>${Math.max(product.price || 0, 0)} KES</g:price>
      <g:brand>${escapeXml(siteName)}</g:brand>
      <!-- Standardized jewelry category mapped by standard feed specifications -->
      <g:google_product_category>188</g:google_product_category>
    </item>`;
}

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
