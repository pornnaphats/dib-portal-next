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

  // Restore corrupted colors
  // var(--surface)7ed -> #ffedd5
  // var(--surface)1f2 -> #fee2e2
  content = content.replace(/var\(--surface\)7ed/g, '#ffedd5');
  content = content.replace(/var\(--surface\)1f2/g, '#fee2e2');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Restored color variables in: ${path.basename(filePath)}`);
  }
});
