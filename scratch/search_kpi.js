const fs = require('fs');

const chunkFile = "c:\\dib-portal\\scratch\\raw_next_926.js";
const content = fs.readFileSync(chunkFile, 'utf8');

const target = '<!-- STATS CARDS (COMPACT ROW WITH ICON LEFT, TEXT RIGHT) -->';
const idx = content.indexOf(target);
if (idx === -1) {
  console.log("Could not find stats cards.");
  process.exit(1);
}

// Print the next 6000 chars and unescape it
const rawText = content.substring(idx, idx + 6000);
const cleanText = rawText
  .replace(/\\n/g, '\n')
  .replace(/\\t/g, '\t')
  .replace(/\\"/g, '"')
  .replace(/\\'/g, "'")
  .replace(/\\\\/g, '\\');

console.log(cleanText);
