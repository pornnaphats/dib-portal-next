const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const targetDir = "c:/antigravity-project/dib-portal-next/src";

walkDir(targetDir, (filePath) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx') && !filePath.endsWith('.css')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace CSS/HTML border-radius inside style strings to 50% for background wrapper elements
  content = content.replace(/border-radius:\s*6px;\s*background:/gi, 'border-radius: 50%; background:');
  content = content.replace(/border-radius:\s*8px;\s*background:/gi, 'border-radius: 50%; background:');
  content = content.replace(/border-radius:\s*12px;\s*background:/gi, 'border-radius: 50%; background:');
  content = content.replace(/border-radius:\s*var\(--radius\);\s*background:/gi, 'border-radius: 50%; background:');
  content = content.replace(/border-radius:\s*var\(--radius-sm\);\s*background:/gi, 'border-radius: 50%; background:');

  // React inline style objects
  content = content.replace(/borderRadius:\s*['"]8px['"]\s*,\s*background:/g, "borderRadius: '50%', background:");
  content = content.replace(/borderRadius:\s*['"]6px['"]\s*,\s*background:/g, "borderRadius: '50%', background:");
  content = content.replace(/borderRadius:\s*['"]var\(--radius\)['"]\s*,\s*background:/g, "borderRadius: '50%', background:");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated KPI icons to circle in: ${path.basename(filePath)}`);
  }
});
