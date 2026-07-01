const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    }
    callback(dirPath, isDirectory);
  });
}

// 1. Rename assets/node_modules to assets/vendor_modules
const oldNodeModulesDir = path.join(__dirname, '../dist/assets/node_modules');
const newVendorModulesDir = path.join(__dirname, '../dist/assets/vendor_modules');

if (fs.existsSync(oldNodeModulesDir)) {
  if (fs.existsSync(newVendorModulesDir)) {
    // If it already exists, remove it first
    fs.rmSync(newVendorModulesDir, { recursive: true, force: true });
  }
  fs.renameSync(oldNodeModulesDir, newVendorModulesDir);
  console.log('Renamed node_modules to vendor_modules');
} else {
  console.log('node_modules dir not found in assets, skipping rename');
}

// 2. Replace occurrences in js, html, css files
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  walkDir(distDir, (filePath, isDirectory) => {
    if (!isDirectory) {
      const ext = path.extname(filePath);
      if (['.js', '.html', '.css', '.json'].includes(ext)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        if (content.includes('assets/node_modules')) {
          content = content.replace(/assets\/node_modules/g, 'assets/vendor_modules');
          updated = true;
        }
        if (content.includes('assets%2Fnode_modules')) {
          content = content.replace(/assets%2Fnode_modules/g, 'assets%2Fvendor_modules');
          updated = true;
        }
        
        if (ext === '.html' && content.includes('"_expo/static/')) {
          content = content.replace(/"_expo\/static\//g, '"/_expo/static/');
          updated = true;
        }

        if (updated) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Updated paths in: ${path.relative(distDir, filePath)}`);
        }
      }
    }
  });
}
console.log('Post-export routing fix complete!');

// 3. Always overwrite dist/vercel.json with correct SPA rewrites config
const vercelConfig = {
  cleanUrls: true,
  rewrites: [
    { source: '/(.*)', destination: '/index.html' }
  ]
};
const distVercelPath = path.join(__dirname, '../dist/vercel.json');
fs.writeFileSync(distVercelPath, JSON.stringify(vercelConfig, null, 2), 'utf8');
console.log('Wrote correct SPA vercel.json to dist/');
