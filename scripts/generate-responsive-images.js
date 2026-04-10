const fs = require("fs");
const path = require("path");
const vm = require("vm");
const sharp = require("sharp");

const projectDir = path.join(__dirname, "..");
const imagesDir = path.join(projectDir, "assets", "images");
const sourceRoots = [
  imagesDir,
  path.join(imagesDir, "dirty"),
  path.join(imagesDir, "live"),
  path.join(imagesDir, "ready"),
  path.join(imagesDir, "archive")
];
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const responsiveProfiles = {
  card: [220, 320, 420, 640],
  hero: [480, 720, 960, 1280],
  favorite: [160, 240, 320, 480],
  detail: [480, 720, 960, 1280],
  portrait: [320, 480, 640]
};
const rootFallbackTargets = new Set([
  "assets/images/kelvin-mark-ceo-portrait.webp"
]);

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(absolutePath));
      continue;
    }
    files.push(absolutePath);
  }

  return files;
}

function readText(relativePath) {
  return fs.readFileSync(path.join(projectDir, relativePath), "utf8");
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function collectReferencedImages(relativePath) {
  const content = readText(relativePath);
  const matches = content.match(/assets\/images\/[^"'`<>()]+?\.(?:png|jpe?g|webp|svg)/gi) || [];
  return matches
    .filter((value, index) => matches.indexOf(value) === index)
    .filter((value) => !/--(?:card|hero|favorite|detail|portrait)-\d+\.(?:avif|webp)$/i.test(value));
}

function loadStorefrontData() {
  const source = readText("assets/js/data.js");
  const noopStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  };
  const sandbox = {
    window: {},
    localStorage: noopStorage,
    sessionStorage: noopStorage,
    console
  };

  sandbox.window.localStorage = noopStorage;
  sandbox.window.sessionStorage = noopStorage;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return sandbox.window.SharonCraftData || {};
}

function buildSourceIndex() {
  const index = new Map();

  for (const root of sourceRoots) {
    for (const filePath of walk(root)) {
      const extension = path.extname(filePath).toLowerCase();
      if (!supportedExtensions.has(extension)) {
        continue;
      }

      const baseName = path.basename(filePath).toLowerCase();
      if (!index.has(baseName)) {
        index.set(baseName, filePath);
      }
    }
  }

  return index;
}

function resolveSourcePath(relativeTargetPath, sourceIndex) {
  const targetPath = path.join(projectDir, relativeTargetPath);
  if (fs.existsSync(targetPath)) {
    return targetPath;
  }

  const parsed = path.parse(relativeTargetPath);
  const candidates = [path.basename(relativeTargetPath)];

  if (parsed.ext.toLowerCase() === ".webp" || parsed.ext.toLowerCase() === ".avif") {
    candidates.push(`${parsed.name}.jpg`, `${parsed.name}.jpeg`, `${parsed.name}.png`);
  }

  for (const candidate of candidates) {
    const sourcePath = sourceIndex.get(candidate.toLowerCase());
    if (sourcePath) {
      return sourcePath;
    }
  }

  return "";
}

function addPlan(plan, relativePath, profile) {
  const normalized = String(relativePath || "").trim();
  const extension = path.extname(normalized).toLowerCase();
  if (!normalized || !supportedExtensions.has(extension)) {
    return;
  }

  if (!plan.has(normalized)) {
    plan.set(normalized, { profiles: new Set(), copyOnly: false, modernFallback: false });
  }

  if (profile) {
    plan.get(normalized).profiles.add(profile);
  }
}

function ensureRootAsset(relativePath, sourcePath) {
  const targetPath = path.join(projectDir, relativePath);
  if (fs.existsSync(targetPath) || !sourcePath) {
    return false;
  }

  if (path.extname(targetPath).toLowerCase() !== path.extname(sourcePath).toLowerCase()) {
    return false;
  }

  ensureDir(targetPath);
  fs.copyFileSync(sourcePath, targetPath);
  return true;
}

async function writeVariant(sourcePath, outputPath, width, format) {
  if (fs.existsSync(outputPath)) {
    const outputStat = fs.statSync(outputPath);
    const sourceStat = fs.statSync(sourcePath);
    if (outputStat.mtimeMs >= sourceStat.mtimeMs) {
      return false;
    }
  }

  const extension = path.extname(sourcePath).toLowerCase();
  const transformer = sharp(sourcePath, { animated: false }).rotate();
  const metadata = await transformer.metadata();
  const resizeOptions = metadata.width && metadata.height && metadata.width >= metadata.height
    ? { width, withoutEnlargement: true }
    : { width, withoutEnlargement: true };

  let pipeline = transformer.resize(resizeOptions);
  if (format === "avif") {
    pipeline = pipeline.avif({ quality: 54, effort: 6 });
  } else if (format === "webp") {
    pipeline = pipeline.webp({ quality: extension === ".png" ? 76 : 70, effort: 6 });
  } else {
    throw new Error(`Unsupported output format: ${format}`);
  }

  ensureDir(outputPath);
  await pipeline.toFile(outputPath);
  return true;
}

async function writeModernFallback(sourcePath, outputPath) {
  if (fs.existsSync(outputPath)) {
    const outputStat = fs.statSync(outputPath);
    const sourceStat = fs.statSync(sourcePath);
    if (outputStat.mtimeMs >= sourceStat.mtimeMs) {
      return false;
    }
  }

  const extension = path.extname(outputPath).toLowerCase();
  const transformer = sharp(sourcePath, { animated: false }).rotate();
  ensureDir(outputPath);

  if (extension === ".webp") {
    await transformer.webp({ quality: 76, effort: 6 }).toFile(outputPath);
    return true;
  }

  if (extension === ".avif") {
    await transformer.avif({ quality: 54, effort: 6 }).toFile(outputPath);
    return true;
  }

  throw new Error(`Unsupported fallback extension: ${extension}`);
}

async function run() {
  const sourceIndex = buildSourceIndex();
  const plan = new Map();
  const restored = [];
  const generated = [];
  const missing = [];
  const storefrontData = loadStorefrontData();
  const firstProductImages = Array.isArray(storefrontData.products)
    ? storefrontData.products
        .map((product) => Array.isArray(product && product.images) ? product.images[0] : "")
        .filter(Boolean)
        .filter((imagePath, index, list) => list.indexOf(imagePath) === index)
    : [];

  collectReferencedImages("index.html").forEach((imagePath) => {
    addPlan(plan, imagePath);
  });
  collectReferencedImages("product.html").forEach((imagePath) => {
    addPlan(plan, imagePath);
  });
  collectReferencedImages("leadership.html").forEach((imagePath) => {
    addPlan(plan, imagePath);
  });

  firstProductImages.forEach((imagePath) => {
    addPlan(plan, imagePath, "card");
    addPlan(plan, imagePath, "detail");
  });

  addPlan(plan, "assets/images/ai-home-hero-editorial.png", "hero");
  addPlan(plan, "assets/images/ai-home-hero-decor-card.png", "favorite");
  addPlan(plan, "assets/images/custom-occasion-beadwork-46mokm-opt.webp", "detail");
  addPlan(plan, "assets/images/kelvin-mark-ceo-portrait.jpg", "portrait");

  if (plan.has("assets/images/kelvin-mark-ceo-portrait.jpg")) {
    plan.get("assets/images/kelvin-mark-ceo-portrait.jpg").modernFallback = true;
  }

  for (const [relativePath, item] of plan.entries()) {
    const sourcePath = resolveSourcePath(relativePath, sourceIndex);
    if (!sourcePath) {
      missing.push(relativePath);
      continue;
    }

    if (ensureRootAsset(relativePath, sourcePath)) {
      restored.push(relativePath);
    }

    const rootPath = path.join(projectDir, relativePath);
    const extension = path.extname(relativePath);
    const baseName = relativePath.slice(0, -extension.length);

    for (const profileName of item.profiles) {
      const widths = responsiveProfiles[profileName] || [];
      for (const width of widths) {
        for (const format of ["webp", "avif"]) {
          const outputRelativePath = `${baseName}--${profileName}-${width}.${format}`;
          const outputPath = path.join(projectDir, outputRelativePath);
          if (await writeVariant(rootPath, outputPath, width, format)) {
            generated.push(outputRelativePath);
          }
        }
      }
    }

    if (item.modernFallback) {
      const modernTarget = `${baseName}.webp`;
      if (await writeModernFallback(rootPath, path.join(projectDir, modernTarget))) {
        generated.push(modernTarget);
      }
    }
  }

  for (const relativePath of rootFallbackTargets) {
    const sourcePath = resolveSourcePath(relativePath.replace(/\.webp$/i, ".jpg"), sourceIndex);
    if (!sourcePath) {
      missing.push(relativePath);
      continue;
    }

    if (await writeModernFallback(sourcePath, path.join(projectDir, relativePath))) {
      generated.push(relativePath);
    }
  }

  console.log(`Restored ${restored.length} storefront image file(s).`);
  console.log(`Generated ${generated.length} responsive or modern image file(s).`);

  if (restored.length) {
    restored.slice(0, 20).forEach((item) => console.log(`restored: ${item}`));
  }

  if (missing.length) {
    console.log(`Missing ${missing.length} referenced source image(s):`);
    missing.slice(0, 40).forEach((item) => console.log(`missing: ${item}`));
  }
}

run().catch((error) => {
  console.error("Failed to generate responsive storefront images.", error);
  process.exitCode = 1;
});
