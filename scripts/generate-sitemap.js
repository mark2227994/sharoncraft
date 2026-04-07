const fs = require("fs");
const path = require("path");
const { loadCatalogSource } = require("./catalog-source");

const rootDir = path.resolve(__dirname, "..");
const productTemplatePath = path.join(rootDir, "product.html");
const articlesDir = path.join(rootDir, "articles");
const outputPath = path.join(rootDir, "sitemap.xml");
const siteUrl = (process.env.SITE_URL || "https://www.sharoncraft.co.ke").replace(/\/+$/, "");

const excludedRootPages = new Set([
  "404.html",
  "account.html",
  "admin.html",
  "admin-mobile.html",
  "assistant-admin.html",
  "cart.html",
  "categories.html",
  "login.html",
  "order.html",
  "product.html",
  "supabase-test.html",
  "wishlist.html"
]);

const pageMetadata = {
  "index.html": { changefreq: "weekly", priority: "1.0", order: 1 },
  "shop.html": { changefreq: "daily", priority: "0.9", order: 2 },
  "journal.html": { changefreq: "monthly", priority: "0.7", order: 3 },
  "why-trust-sharoncraft.html": { changefreq: "monthly", priority: "0.8", order: 4 },
  "kenyan-artifacts.html": { changefreq: "weekly", priority: "0.8", order: 5 },
  "beaded-earrings-kenya.html": { changefreq: "weekly", priority: "0.8", order: 6 },
  "maasai-jewelry-kenya.html": { changefreq: "weekly", priority: "0.8", order: 7 },
  "handmade-kenyan-gifts.html": { changefreq: "weekly", priority: "0.8", order: 8 },
  "african-home-decor-nairobi.html": { changefreq: "weekly", priority: "0.8", order: 9 },
  "bridal-bead-sets-kenya.html": { changefreq: "weekly", priority: "0.8", order: 10 },
  "gift-sets-kenya.html": { changefreq: "weekly", priority: "0.8", order: 11 },
  "maasai-inspired-bracelets-kenya.html": { changefreq: "weekly", priority: "0.8", order: 12 },
  "about.html": { changefreq: "monthly", priority: "0.6", order: 13 },
  "contact.html": { changefreq: "monthly", priority: "0.7", order: 14 },
  "faq.html": { changefreq: "yearly", priority: "0.5", order: 15 },
  "returns.html": { changefreq: "yearly", priority: "0.4", order: 16 },
  "privacy.html": { changefreq: "yearly", priority: "0.3", order: 17 },
  "terms.html": { changefreq: "yearly", priority: "0.3", order: 18 }
};

function escapeXml(value) {
  return String(value || "").replace(/[<>&'"]/g, function (character) {
    switch (character) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return character;
    }
  });
}

function toLastmod(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function getFileLastmod(filePath) {
  return toLastmod(fs.statSync(filePath).mtime);
}

function getDefaultPageMeta(fileName) {
  const stem = path.basename(fileName, ".html");

  if (stem.includes("privacy") || stem.includes("terms")) {
    return { changefreq: "yearly", priority: "0.3", order: 100 };
  }

  if (stem.includes("return") || stem.includes("faq")) {
    return { changefreq: "yearly", priority: "0.4", order: 100 };
  }

  if (stem.includes("shop") || stem.includes("category")) {
    return { changefreq: "weekly", priority: "0.7", order: 100 };
  }

  return { changefreq: "monthly", priority: "0.5", order: 100 };
}

function listArticleFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap(function (entry) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listArticleFiles(fullPath);
    }

    return entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function buildRootPageEntries() {
  return fs
    .readdirSync(rootDir)
    .filter(function (fileName) {
      return fileName.endsWith(".html") && !excludedRootPages.has(fileName);
    })
    .map(function (fileName) {
      const filePath = path.join(rootDir, fileName);
      const metadata = pageMetadata[fileName] || getDefaultPageMeta(fileName);

      return {
        loc: fileName === "index.html" ? `${siteUrl}/` : `${siteUrl}/${fileName}`,
        lastmod: getFileLastmod(filePath),
        changefreq: metadata.changefreq,
        priority: metadata.priority,
        order: metadata.order,
        sortKey: fileName
      };
    })
    .sort(function (left, right) {
      if (left.order !== right.order) {
        return left.order - right.order;
      }

      return left.sortKey.localeCompare(right.sortKey);
    });
}

function buildProductEntries(products) {
  if (!Array.isArray(products) || !products.length) {
    return [];
  }

  const dataUpdatedAt = Date.now();
  const productTemplateUpdatedAt = fs.existsSync(productTemplatePath) ? fs.statSync(productTemplatePath).mtimeMs : 0;
  const lastmod = toLastmod(Math.max(dataUpdatedAt, productTemplateUpdatedAt));

  return products
    .filter(function (product) {
      return product && product.id;
    })
    .map(function (product) {
      return {
        loc: `${siteUrl}/product.html?id=${encodeURIComponent(product.id)}`,
        lastmod,
        changefreq: product.newArrival || product.featured ? "weekly" : "monthly",
        priority: product.soldOut ? "0.6" : product.featured ? "0.8" : "0.7"
      };
    })
    .sort(function (left, right) {
      return left.loc.localeCompare(right.loc);
    });
}

function buildArticleEntries() {
  return listArticleFiles(articlesDir)
    .map(function (filePath) {
      const relativePath = path.relative(rootDir, filePath).replace(/\\/g, "/");
      return {
        loc: `${siteUrl}/${relativePath}`,
        lastmod: getFileLastmod(filePath),
        changefreq: "yearly",
        priority: "0.6"
      };
    })
    .sort(function (left, right) {
      return left.loc.localeCompare(right.loc);
    });
}

function buildXml(entries) {
  const body = entries
    .map(function (entry) {
      return [
        "  <url>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`,
        `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`,
        `    <priority>${escapeXml(entry.priority)}</priority>`,
        "  </url>"
      ].join("\n");
    })
    .join("\n");

  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', body, "</urlset>", ""].join("\n");
}

async function generateSitemap() {
  const data = await loadCatalogSource();

  if (!data || !Array.isArray(data.products)) {
    throw new Error("Unable to load SharonCraft catalog data for sitemap generation.");
  }

  const entries = [];
  const seen = new Set();

  [buildRootPageEntries(), buildProductEntries(data.products), buildArticleEntries()].forEach(function (group) {
    group.forEach(function (entry) {
      if (!seen.has(entry.loc)) {
        seen.add(entry.loc);
        entries.push(entry);
      }
    });
  });

  fs.writeFileSync(outputPath, buildXml(entries), "utf8");
  return {
    outputPath,
    count: entries.length
  };
}

module.exports = {
  generateSitemap
};

if (require.main === module) {
  generateSitemap()
    .then((result) => {
      console.log(`Sitemap generated successfully at: ${result.outputPath}`);
      console.log(`Included ${result.count} URLs.`);
    })
    .catch((error) => {
      console.error(error && error.message ? error.message : error);
      process.exit(1);
    });
}

