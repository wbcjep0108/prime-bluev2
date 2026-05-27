const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'images', 'hydration');

async function optimizeImages() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const tempPath = path.join(dir, `temp_${file}`);
    
    console.log(`Optimizing ${file}...`);
    
    // Resize to max 800px width/height and compress PNG
    await sharp(filePath)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 75, compressionLevel: 9, adaptiveFiltering: true })
      .toFile(tempPath);
      
    // Replace original
    fs.renameSync(tempPath, filePath);
  }
  
  console.log('All images optimized!');
}

optimizeImages().catch(console.error);
