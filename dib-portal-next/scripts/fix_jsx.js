const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let totalModified = 0;

walkDir('c:/antigravity-project/dib-portal-next/src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix broken arrow functions in JSX: () = class=... >
    content = content.replace(/\(\) = class=\"text-\[12px\] font-semibold px-4 py-1\.5\">\s*/g, '() => ');
    content = content.replace(/\(e\) = class=\"text-\[12px\] font-semibold px-4 py-1\.5\">\s*/g, '(e) => ');
    // Handle any other argument
    content = content.replace(/\(([a-zA-Z0-9_, ]*)\) = class=\"text-\[12px\] font-semibold px-4 py-1\.5\">\s*/g, '($1) => ');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalModified++;
      console.log('Fixed arrow functions in ' + filePath);
    }
  }
});

console.log('Done fixing arrow functions. Modified: ' + totalModified);
