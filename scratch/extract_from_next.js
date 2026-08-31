const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (let file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      searchDir(fullPath);
    } else if (file.endsWith('.js')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('pageHolidaySummary') && content.includes('window.pageHolidaySummary')) {
          console.log(`FOUND in file: ${fullPath}`);
          
          // Let's find the Webpack module source map or string
          // In Turbopack, it's usually inside: __op_pack_module__ or similar, or as an eval string
          // Let's look for a block that has `window.pageHolidaySummary`
          // We can extract the block from `window.pageHolidaySummary =` to the end of the function.
          // Or even better: let's extract the whole unescaped code of legacyHolidayLogic.js!
          // Webpack eval or module code starts with something like:
          // "/* webpack/runtime/esm ... */" or standard JS.
          // Let's write the entire raw file to a text file first.
          const suffix = Math.floor(Math.random() * 1000);
          fs.writeFileSync(path.join(__dirname, `raw_next_${suffix}.js`), content);
          console.log(`Saved raw next file to raw_next_${suffix}.js`);
        }
      } catch (e) {}
    }
  }
}

searchDir("c:\\dib-portal\\.next");
