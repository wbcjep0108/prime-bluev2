const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'public', 'images', 'carousel');
const files = fs.readdirSync(INPUT_DIR).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

console.log(`Found ${files.length} carousel images. Compressing...`);

(async () => {
  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    const outputPath = path.join(INPUT_DIR, `${base}.webp`);

    await sharp(inputPath)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(outputPath);

    const inSize  = (fs.statSync(inputPath).size  / 1024).toFixed(1);
    const outSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`  ${file}  ${inSize}KB → ${outputPath.split(path.sep).pop()}  ${outSize}KB`);

    // Remove original if it was a PNG/JPEG (keep if already WebP to avoid deleting output)
    if (ext !== '.webp' && inputPath !== outputPath) {
      fs.unlinkSync(inputPath);
    }
  }

  console.log('\nAll carousel images compressed to WebP ✓');
})();
