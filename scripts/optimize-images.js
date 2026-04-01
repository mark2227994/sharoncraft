const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');
const PROJECT_DIR = path.join(__dirname, '..');

const genericImageRegex = /^(IMG[-_]|WhatsApp Image ).*\.(jpg|jpeg|png)$/i;

const seoTokens = [
  'handmade-kenyan-beadwork',
  'authentic-maasai-bracelet',
  'sharoncraft-african-necklace',
  'kenyan-bead-decor',
  'traditional-bridal-bead-set',
  'custom-occasion-beadwork',
  'handmade-african-souvenir',
  'nairobi-artisan-jewelry'
];

// Helper to recursively finding files matching extension
function walk(dir, allowedExts, bypassDirs) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!bypassDirs.some(b => file.includes(b))) {
        results = results.concat(walk(file, allowedExts, bypassDirs));
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (allowedExts.includes(ext)) {
        results.push(file);
      }
    }
  });
  return results;
}

async function optimizeImages() {
  console.log("Starting Image SEO Optimization...");

  const files = fs.readdirSync(ASSETS_DIR);
  const genericFiles = files.filter(f => genericImageRegex.test(f));
  
  if (genericFiles.length === 0) {
    console.log("No generic image files found! They might already be optimized.");
    return;
  }

  const renameMap = {};
  let tokenIndex = 0;

  for (let i = 0; i < genericFiles.length; i++) {
    const originalFile = genericFiles[i];
    const ext = path.extname(originalFile).toLowerCase();
    
    const randomToken = seoTokens[tokenIndex % seoTokens.length];
    const uniqueHash = Math.random().toString(36).substr(2, 6);
    const newName = `${randomToken}-${uniqueHash}${ext}`;
    
    const oldPath = path.join(ASSETS_DIR, originalFile);
    const newPath = path.join(ASSETS_DIR, newName);
    
    fs.renameSync(oldPath, newPath);
    renameMap[originalFile] = newName;
    tokenIndex++;
  }

  console.log(`Renamed ${Object.keys(renameMap).length} images.`);

  const textFilesToSearch = walk(PROJECT_DIR, ['.html', '.js', '.css'], ['node_modules', '.git', '.gemini']);

  textFilesToSearch.forEach((filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    for (const [oldName, newName] of Object.entries(renameMap)) {
      const oldEncoded = encodeURIComponent(oldName);
      if (content.includes(oldName) || content.includes(oldEncoded)) {
        content = content.split(oldName).join(newName);
        content = content.split(oldEncoded).join(newName);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated references in: ${path.relative(PROJECT_DIR, filePath)}`);
    }
  });

  console.log("Image SEO Optimization complete!");
}

optimizeImages().catch(console.error);
