const fs = require('fs');
const path = require('path');

const chunkFile = "c:\\dib-portal\\scratch\\raw_next_511.js";
const content = fs.readFileSync(chunkFile, 'utf8');

console.log("Searching chunk for window.pageHolidaySummary = function...");

const targetStr = 'window.pageHolidaySummary = function';
const idx = content.indexOf(targetStr);
if (idx === -1) {
  console.log("Could not find window.pageHolidaySummary = function definition in chunk.");
  process.exit(1);
}

console.log(`Found definition at position ${idx}`);

// Let's extract from 2000 characters before to 80000 characters after
const start = Math.max(0, idx - 2000);
const end = Math.min(content.length, idx + 80000);
const rawSnippet = content.substring(start, end);

fs.writeFileSync(path.join(__dirname, 'recovered_snippet_logic.txt'), rawSnippet);
console.log("Saved snippet to recovered_snippet_logic.txt");
