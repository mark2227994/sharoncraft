const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const assetsDir = path.join(__dirname, "..", "assets", "images");
const projectDir = path.join(__dirname, "..");
const maxLandscapeWidth = 1800;
const maxPortraitHeight = 1800;
const minBytesToProcess = 500 * 1024;
const quality = 68;
const effort = 6;
const referenceExtensions = new Set([".html", ".js", ".css", ".md", ".xml", ".txt"]);
const skipDirs = new Set([".git", "node_modules", "images", "supabase"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) {
        continue;
      }
      files = files.concat(walk(absolutePath));
      continue;
    }

    if (referenceExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function optimizeWebpAsset(fileName) {
  const absolutePath = path.join(assetsDir, fileName);
  const before = fs.statSync(absolutePath).size;

  if (before < minBytesToProcess) {
    return null;
  }

  const image = sharp(absolutePath, { animated: false });
  const metadata = await image.metadata();
  const width = Number(metadata.width) || 0;
  const height = Number(metadata.height) || 0;

  if (!width || !height) {
    return null;
  }

  const isLandscape = width >= height;
  const resizeOptions = isLandscape
    ? { width: Math.min(width, maxLandscapeWidth), withoutEnlargement: true }
    : { height: Math.min(height, maxPortraitHeight), withoutEnlargement: true };

  const optimizedBuffer = await image
    .resize(resizeOptions)
    .webp({ quality, effort })
    .toBuffer();

  if (optimizedBuffer.length >= before) {
    return null;
  }

  const parsed = path.parse(fileName);
  const optimizedFileName = `${parsed.name}-opt.webp`;
  const optimizedPath = path.join(assetsDir, optimizedFileName);
  fs.writeFileSync(optimizedPath, optimizedBuffer);

  return {
    fileName,
    optimizedFileName,
    before,
    after: optimizedBuffer.length,
    width,
    height,
  };
}

function replaceReferences(renameMap) {
  const textFiles = walk(projectDir);
  let updatedFiles = 0;

  for (const filePath of textFiles) {
    const original = fs.readFileSync(filePath, "utf8");
    let next = original;

    for (const [from, to] of renameMap.entries()) {
      if (next.includes(from)) {
        next = next.split(from).join(to);
      }
    }

    if (next !== original) {
      fs.writeFileSync(filePath, next, "utf8");
      updatedFiles += 1;
    }
  }

  return updatedFiles;
}

async function run() {
  const files = fs.readdirSync(assetsDir).filter((file) => file.toLowerCase().endsWith(".webp") && !file.toLowerCase().endsWith("-opt.webp"));
  const results = [];

  for (const fileName of files) {
    const result = await optimizeWebpAsset(fileName);
    if (result) {
      results.push(result);
    }
  }

  results.sort((left, right) => right.before - left.before);

  const renameMap = new Map(
    results.map((item) => [
      `assets/images/${item.fileName}`,
      `assets/images/${item.optimizedFileName}`,
    ])
  );
  const updatedFiles = renameMap.size ? replaceReferences(renameMap) : 0;
  const savedBytes = results.reduce((total, item) => total + (item.before - item.after), 0);

  console.log(`Optimized ${results.length} WebP assets.`);
  console.log(`Saved ${(savedBytes / (1024 * 1024)).toFixed(2)} MB total.`);
  console.log(`Updated references in ${updatedFiles} files.`);

  results.slice(0, 20).forEach((item) => {
    console.log(
      `${item.fileName}: ${(item.before / 1024).toFixed(0)}KB -> ${(item.after / 1024).toFixed(0)}KB (${item.width}x${item.height})`
    );
  });
}

run().catch((error) => {
  console.error("Failed to optimize WebP assets.", error);
  process.exitCode = 1;
});
