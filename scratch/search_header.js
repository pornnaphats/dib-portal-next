const fs = require('fs');

const chunkFile = "c:\\dib-portal\\scratch\\raw_next_926.js";
const content = fs.readFileSync(chunkFile, 'utf8');

console.log("Searching for STATS CARDS in raw_next_926.js...");

const target = '<!-- STATS CARDS (COMPACT ROW WITH ICON LEFT, TEXT RIGHT) -->';
const idx = content.indexOf(target);
if (idx === -1) {
  console.log("Could not find STATS CARDS in chunk.");
  process.exit(1);
}

console.log(`Found STATS CARDS at index ${idx}`);
console.log(content.substring(idx, idx + 4000).replace(/\n/g, '\\n'));
