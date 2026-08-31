const fs = require('fs');
const path = require('path');

const scratchDir = "c:\\dib-portal\\scratch";
const files = fs.readdirSync(scratchDir);

console.log("Scanning all raw_next_*.js files for window.pageHolidaySummary...");

for (let file of files) {
  if (!file.startsWith('raw_next_') || !file.endsWith('.js')) continue;
  const fullPath = path.join(scratchDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('window.pageHolidaySummary')) {
    // Let's count how many times it appears, and check for the definition block
    const matches = [];
    let idx = content.indexOf('window.pageHolidaySummary');
    while (idx !== -1) {
      matches.push(idx);
      idx = content.indexOf('window.pageHolidaySummary', idx + 1);
    }
    
    console.log(`\nFile ${file} (size: ${content.length}): Found ${matches.length} matches.`);
    matches.forEach((pos, idx) => {
      console.log(`  Match ${idx + 1} at pos ${pos}:`);
      console.log(`  ` + content.substring(pos - 50, pos + 250).replace(/\n/g, '\\n'));
    });
  }
}
