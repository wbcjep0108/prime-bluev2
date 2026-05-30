// revert-cloudinary.cjs
// This script scans the project for usages of getCldImageUrl and replaces them with plain string paths.
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  // Replace getCldImageUrl('/images/...') with '/images/...'
  content = content.replace(/getCldImageUrl\((['"])(\/images\/[^'"\)]+)\1\)/g, (m, q, p) => `${q}${p}${q}`);
  // Replace JSX src={getCldImageUrl('/images/...')} with src="/images/..."
  content = content.replace(/src=\{\s*getCldImageUrl\((['"])(\/images\/[^'"\)]+)\1\)\s*\}/g, (m, q, p) => `src=${q}${p}${q}`);
  // Remove import lines for getCldImageUrl
  content = content.replace(/^\s*import\s+\{[^}]*getCldImageUrl[^}]*\}\s+from\s+['"][^'\"]+['"];?\s*$/gm, '');
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Reverted', path.relative(projectRoot, filePath));
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules and .git
      if (['node_modules', '.git', 'public'].includes(entry.name)) continue;
      walk(full);
    } else if (entry.isFile()) {
      if (full.endsWith('.tsx') || full.endsWith('.ts')) {
        processFile(full);
      }
    }
  }
}

walk(projectRoot);

// Finally, revert lib/cloudinary.ts to a simple pass‑through helper (no Cloudinary)
const cloudinaryPath = path.join(projectRoot, 'lib', 'cloudinary.ts');
if (fs.existsSync(cloudinaryPath)) {
  const fallback = `export function getCldImageUrl(path: string) { return path; }\n`;
  fs.writeFileSync(cloudinaryPath, fallback, 'utf8');
  console.log('Reverted lib/cloudinary.ts to identity');
}
