const fs = require('fs');

const chunkFile = "c:\\dib-portal\\scratch\\raw_next_511.js";
const content = fs.readFileSync(chunkFile, 'utf8');

console.log(`Chunk size: ${content.length} characters`);

const target = 'window.pageHolidaySummary';
let idx = content.indexOf(target);
let count = 0;

while (idx !== -1) {
  count++;
  console.log(`\nMatch ${count} at index ${idx}:`);
  console.log(content.substring(idx - 100, idx + 200).replace(/\n/g, '\\n'));
  idx = content.indexOf(target, idx + 1);
}
