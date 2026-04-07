const fs = require("fs");
const path = require("path");
const { loadCatalogSource } = require("./catalog-source");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "products");
const siteUrl = (process.env.SITE_URL || "https://www.sharoncraft.co.ke").replace(/\/+$/, "");
const fallbackImage = "assets/images/custom-occasion-beadwork-46mokm-opt.webp";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function absoluteUrl(value) {
  const input = String(value || "").trim();
  if (!input) {
    return `${siteUrl}/${fallbackImage}`;
  }
  if (/^https?:\/\//i.test(input)) {
    return input;
  }
  return `${siteUrl}/${input.replace(/^\/+/, "")}`;
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function getProductImages(product) {
  const list = normalizeList(product && product.images);
  return list.length ? list : [fallbackImage];
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";
}

function buildSharePath(product) {
  return `products/${slugify(product && product.id)}.html`;
}

function normalizeDescription(product, categoryName) {
  const description = String(product && (product.shortDescription || product.description || "")).trim();
  if (description) {
    return description;
  }
  return `Shop ${String(product && product.name || "this SharonCraft piece").trim()} from SharonCraft. Handmade ${String(categoryName || "beadwork").trim().toLowerCase()} in Kenya with WhatsApp ordering support.`;
}

function buildSharePage(product, site, categories) {
  const productName = String(product && product.name || "SharonCraft Product").trim();
  const productId = String(product && product.id || "").trim();
  const categoryMap = new Map((Array.isArray(categories) ? categories : []).map((category) => [String(category.slug || "").trim(), category || {}]));
  const category = categoryMap.get(String(product && product.category || "").trim()) || {};
  const categoryName = String(category.name || product.categoryName || "Handmade Beadwork").trim();
  const description = normalizeDescription(product, categoryName);
  const images = getProductImages(product);
  const imageUrl = absoluteUrl(images[0]);
  const productUrl = `${siteUrl}/product.html?id=${encodeURIComponent(productId)}`;
  const shareUrl = `${siteUrl}/${buildSharePath(product)}`;
  const siteName = String(site && site.name || "SharonCraft").trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(productName)} | ${escapeHtml(siteName)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(productUrl)}" />
  <meta property="og:title" content="${escapeHtml(productName)} | ${escapeHtml(siteName)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="product" />
  <meta property="og:url" content="${escapeHtml(shareUrl)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:image:alt" content="${escapeHtml(productName)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(productName)} | ${escapeHtml(siteName)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  <meta name="twitter:image:alt" content="${escapeHtml(productName)}" />
  <link rel="icon" type="image/png" href="${siteUrl}/assets/images/sharoncraft-favicon.webp" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": ${JSON.stringify(productName)},
      "image": [${JSON.stringify(imageUrl)}],
      "description": ${JSON.stringify(description)},
      "category": ${JSON.stringify(categoryName)},
      "url": ${JSON.stringify(productUrl)},
      "brand": {
        "@type": "Brand",
        "name": ${JSON.stringify(siteName)}
      }
    }
  </script>
  <style>
    body {
      margin: 0;
      font-family: "Nunito", system-ui, sans-serif;
      background: linear-gradient(180deg, #f9f2e8, #fffdfa);
      color: #3d2a22;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 1.25rem;
    }
    .share-card {
      width: min(100%, 34rem);
      background: rgba(255, 255, 255, 0.96);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(92, 64, 51, 0.12);
      border: 1px solid rgba(92, 64, 51, 0.08);
    }
    .share-card img {
      width: 100%;
      display: block;
      aspect-ratio: 4 / 3.1;
      object-fit: cover;
    }
    .share-copy {
      padding: 1.2rem;
      display: grid;
      gap: 0.8rem;
    }
    .share-kicker {
      color: #d96c48;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.78rem;
      font-weight: 800;
    }
    .share-copy h1 {
      margin: 0;
      font-size: 1.45rem;
      line-height: 1.2;
      font-family: "Poppins", system-ui, sans-serif;
    }
    .share-copy p {
      margin: 0;
      line-height: 1.65;
    }
    .share-copy a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 46px;
      padding: 0.85rem 1rem;
      border-radius: 999px;
      background: #d96c48;
      color: #fff;
      text-decoration: none;
      font-weight: 800;
      width: fit-content;
    }
  </style>
</head>
<body>
  <main class="share-card">
    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(productName)}" />
    <div class="share-copy">
      <span class="share-kicker">${escapeHtml(categoryName)}</span>
      <h1>${escapeHtml(productName)}</h1>
      <p>${escapeHtml(description)}</p>
      <a href="${escapeHtml(productUrl)}">Open Product</a>
    </div>
  </main>
  <script>
    window.setTimeout(function () {
      window.location.replace(${JSON.stringify(productUrl)});
    }, 250);
  </script>
</body>
</html>
`;
}

async function generateProductSharePages() {
  const catalog = await loadCatalogSource();
  const site = catalog && catalog.site ? catalog.site : {};
  const products = Array.isArray(catalog && catalog.products) ? catalog.products : [];
  const categories = Array.isArray(catalog && catalog.categories) ? catalog.categories : [];

  fs.mkdirSync(outputDir, { recursive: true });

  fs.readdirSync(outputDir, { withFileTypes: true }).forEach((entry) => {
    if (entry.isFile() && entry.name.endsWith(".html")) {
      fs.unlinkSync(path.join(outputDir, entry.name));
    }
  });

  const generated = products
    .filter((product) => product && product.id)
    .map((product) => {
      const relativePath = buildSharePath(product);
      const absolutePath = path.join(rootDir, relativePath);
      fs.writeFileSync(absolutePath, buildSharePage(product, site, categories), "utf8");
      return relativePath;
    });

  return {
    outputDir,
    count: generated.length
  };
}

module.exports = {
  generateProductSharePages,
  buildSharePath
};

if (require.main === module) {
  generateProductSharePages()
    .then((result) => {
      console.log(`Product share pages generated successfully in: ${result.outputDir}`);
      console.log(`Generated ${result.count} product share pages.`);
    })
    .catch((error) => {
      console.error(error && error.message ? error.message : error);
      process.exit(1);
    });
}
