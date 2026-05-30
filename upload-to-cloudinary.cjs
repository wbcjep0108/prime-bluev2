const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_DIR = path.join(__dirname, 'public', 'images');

async function uploadImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await uploadImages(fullPath);
    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(entry.name)) {
      try {
        // Create public_id relative to public/ so that /images/... matches images/...
        const relativePath = path.relative(path.join(__dirname, 'public'), fullPath);
        // Remove extension for the public_id
        const publicId = relativePath.replace(/\\/g, '/').replace(/\.[^/.]+$/, "");
        
        console.log(`Uploading ${relativePath}...`);
        const result = await cloudinary.uploader.upload(fullPath, {
          public_id: publicId,
          overwrite: true
        });
        console.log(`Successfully uploaded: ${result.secure_url}`);
      } catch (error) {
        console.error(`Error uploading ${entry.name}:`, error);
      }
    }
  }
}

async function run() {
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Missing Cloudinary credentials in .env.local!");
    process.exit(1);
  }
  
  console.log('Starting Cloudinary upload...');
  await uploadImages(IMAGES_DIR);
  console.log('Upload complete! You can now safely delete the local images.');
}

run();
