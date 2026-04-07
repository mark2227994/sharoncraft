const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const publicHtmlDirs = [rootDir, path.join(rootDir, "articles")];
const requiredPages = [
  "index.html",
  "shop.html",
  "product.html",
  "account.html",
  "contact.html",
  "404.html",
  "privacy.html"
];
const requiredSupportFiles = [
  "robots.txt",
  "llms.txt",
  "6e8a6d86-fb64-4afc-a912-0a4c9ee7cb50.txt"
];
const generatedFiles = [
  {
    path: "sitemap.xml",
    validator: function (content) {
      const urlCount = (content.match(/<url>/g) || []).length;
      if (!content.includes("<urlset") || urlCount < 5) {
        throw new Error("sitemap.xml is missing a valid <urlset> or has too few URLs.");
      }
      return `contains ${urlCount} URLs`;
    }
  },
  {
    path: "google-merchant-feed.xml",
    validator: function (content) {
      const itemCount = (content.match(/<item>/g) || []).length;
      if (!content.includes("<rss") || itemCount < 1) {
        throw new Error("google-merchant-feed.xml is missing a valid <rss> feed or has no items.");
      }
      return `contains ${itemCount} product items`;
    }
  }
];

function ensureFileExists(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
  return absolutePath;
}

function listHtmlFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(function (entry) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory() && [".git", "node_modules", "images", "supabase"].includes(entry.name)) {
      return [];
    }
    if (entry.isDirectory()) {
      return listHtmlFiles(absolutePath);
    }

    return entry.name.endsWith(".html") ? [absolutePath] : [];
  });
}

function normalizeLocalReference(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return null;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//") ||
    value.startsWith("#") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("javascript:") ||
    value.startsWith("data:")
  ) {
    return null;
  }

  return value.split("#")[0].split("?")[0];
}

function collectMissingReferences(htmlFilePath) {
  const html = fs.readFileSync(htmlFilePath, "utf8");
  const matches = html.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi);
  const missing = [];

  for (const match of matches) {
    const normalized = normalizeLocalReference(match[1]);
    if (!normalized) {
      continue;
    }

    const candidatePath = normalized.startsWith("/")
      ? path.join(rootDir, normalized.slice(1))
      : path.resolve(path.dirname(htmlFilePath), normalized);

    if (!fs.existsSync(candidatePath)) {
      missing.push({
        file: path.relative(rootDir, htmlFilePath).replace(/\\/g, "/"),
        reference: normalized
      });
    }
  }

  return missing;
}

function verifyRequiredPages() {
  requiredPages.forEach(ensureFileExists);
}

function verifySupportFiles() {
  requiredSupportFiles.forEach(ensureFileExists);
}

function verifyGeneratedFiles() {
  return generatedFiles.map(function (file) {
    const absolutePath = ensureFileExists(file.path);
    const content = fs.readFileSync(absolutePath, "utf8");
    const result = file.validator(content);
    return `${file.path}: ${result}`;
  });
}

function getReferenceSeverity(reference) {
  const extension = path.extname(reference).toLowerCase();

  if ([".css", ".js", ".html", ".xml", ".json", ".webmanifest"].includes(extension)) {
    return "error";
  }

  if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".mp4"].includes(extension)) {
    return "warning";
  }

  return "warning";
}

function verifyHtmlReferences() {
  const htmlFiles = publicHtmlDirs.flatMap(listHtmlFiles);
  const missing = htmlFiles.flatMap(collectMissingReferences);
  const critical = missing.filter(function (item) {
    return getReferenceSeverity(item.reference) === "error";
  });
  const warnings = missing.filter(function (item) {
    return getReferenceSeverity(item.reference) === "warning";
  });

  if (critical.length) {
    const preview = critical
      .slice(0, 10)
      .map(function (item) {
        return `${item.file} -> ${item.reference}`;
      })
      .join("\n");

    throw new Error(`Found broken critical HTML references:\n${preview}`);
  }

  return {
    checkedFiles: htmlFiles.length,
    warningCount: warnings.length,
    warningPreview: warnings
      .slice(0, 10)
      .map(function (item) {
        return `${item.file} -> ${item.reference}`;
      })
      .join("\n")
  };
}

function runReleaseVerification() {
  verifyRequiredPages();
  verifySupportFiles();
  const generatedSummary = verifyGeneratedFiles();
  const htmlSummary = verifyHtmlReferences();

  console.log("Release verification passed.");
  generatedSummary.forEach(function (line) {
    console.log(`- ${line}`);
  });
  console.log(`- ${htmlSummary.checkedFiles} HTML files checked for critical local references`);
  if (htmlSummary.warningCount) {
    console.log(`- ${htmlSummary.warningCount} missing media references detected (warning only)`);
    if (htmlSummary.warningPreview) {
      console.log(htmlSummary.warningPreview);
    }
  }
}

if (require.main === module) {
  runReleaseVerification();
}

module.exports = {
  runReleaseVerification
};
