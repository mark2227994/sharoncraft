const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, '../assets/images');

async function processImages() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const oldPath = path.join(dir, file);
      // Remove the old extension safely (handling multiple dots if any)
      const newFileName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const newPath = path.join(dir, newFileName);

      try {
        await sharp(oldPath)
          .webp({ quality: 80, effort: 4 })
          .toFile(newPath);
        
        console.log(`Converted: ${file} -> ${newFileName}`);
        // Remove the original to save space as requested
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error(`Failed to convert ${file}:`, err);
      }
    }
  }
}

processImages().then(() => console.log('All images converted correctly!'));
