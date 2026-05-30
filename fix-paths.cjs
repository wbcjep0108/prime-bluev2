const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'data');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.ts')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Only update if it contains '/images/'
    if (content.includes('/images/') && !content.includes('getCldImageUrl(\'/images/')) {
      if (!content.includes('getCldImageUrl')) {
        content = "import { getCldImageUrl } from '../lib/cloudinary';\n" + content;
      }
      
      // Replace both single quotes and backticks containing /images/
      content = content.replace(/(['`])(\/images\/.*?)\1/g, "getCldImageUrl('$2')");
      
      fs.writeFileSync(fullPath, content);
      console.log('Updated', file);
    }
  }
}
