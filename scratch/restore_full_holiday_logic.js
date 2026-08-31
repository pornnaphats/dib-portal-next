const fs = require('fs');
const path = require('path');

const chunkFile = "c:\\dib-portal\\scratch\\raw_next_926.js";
const content = fs.readFileSync(chunkFile, 'utf8');

console.log("Reading raw_next_926.js...");

// Find the target string
const target = 'window.pageHolidaySummary = function';
const idx = content.indexOf(target);
if (idx === -1) {
  console.log("Could not find window.pageHolidaySummary in raw_next_926.js");
  process.exit(1);
}

console.log(`Found target at position ${idx}`);

// Backtrack to find eval(
const evalStr = 'eval(';
let evalIdx = content.lastIndexOf(evalStr, idx);
if (evalIdx === -1) {
  console.log("Could not find eval( start index.");
  process.exit(1);
}

console.log(`Found eval( at position ${evalIdx}`);

// Find the string literal within the eval
const startCharIdx = content.indexOf('"', evalIdx);
if (startCharIdx === -1 || startCharIdx > idx) {
  console.log("Could not find start of string literal.");
  process.exit(1);
}

// Find matching end quote
let escContent = '';
let inString = true;
let i = startCharIdx + 1;
while (i < content.length && inString) {
  if (content[i] === '"' && content[i - 1] !== '\\') {
    inString = false;
  } else {
    escContent += content[i];
    i++;
  }
}

console.log(`Extracted escaped content of length ${escContent.length}`);

// Unescape the Javascript escapes
let cleanJs = escContent
  .replace(/\\n/g, '\n')
  .replace(/\\r/g, '\r')
  .replace(/\\t/g, '\t')
  .replace(/\\"/g, '"')
  .replace(/\\'/g, "'")
  .replace(/\\\\/g, '\\');

// Write the recovered content directly to the target file!
const targetFile = "c:\\dib-portal\\src\\components\\legacy-pages\\legacyHolidayLogic.js";
fs.writeFileSync(targetFile, cleanJs);
console.log(`SUCCESSFULLY RESTORED ${targetFile} (${cleanJs.length} bytes)!`);
