const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'images', 'sequence');

async function compressImages() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));
  console.log(`Found ${files.length} images to compress. Processing...`);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const tempPath = path.join(dir, `temp_${file}`);

    try {
      // Resize to 1280px max width and compress to 60% quality
      await sharp(filePath)
        .resize(1280, null, { withoutEnlargement: true })
        .jpeg({ quality: 60, progressive: true, optimizeScans: true })
        .toFile(tempPath);

      // Overwrite original
      fs.renameSync(tempPath, filePath);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  console.log('All images compressed successfully!');
}

compressImages();
