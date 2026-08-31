const fs = require('fs');
const path = require('path');

const chunkFile = "c:\\dib-portal\\scratch\\raw_next_926.js";
const content = fs.readFileSync(chunkFile, 'utf8');

console.log("Extracting pure legacyHolidayLogic.js source...");

// Find where legacyHolidayLogic.js module starts
const target = 'window.pageHolidaySummary = function';
const targetIdx = content.indexOf(target);
if (targetIdx === -1) {
  console.log("Could not find window.pageHolidaySummary.");
  process.exit(1);
}

// Find the eval( that wraps the module code
// We backtrack from targetIdx to find the eval
const evalStr = 'eval(';
const evalIdx = content.lastIndexOf(evalStr, targetIdx);
if (evalIdx === -1) {
  console.log("Could not find wrapping eval.");
  process.exit(1);
}

// Find the string literal start inside eval
const startCharIdx = content.indexOf('"', evalIdx);
if (startCharIdx === -1 || startCharIdx > targetIdx) {
  console.log("Could not find start of string literal.");
  process.exit(1);
}

// Extract the string literal contents
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

console.log(`Extracted module string of length ${escContent.length}`);

// Unescape JS escapes to get pure raw JS
let cleanJs = escContent
  .replace(/\\n/g, '\n')
  .replace(/\\r/g, '\r')
  .replace(/\\t/g, '\t')
  .replace(/\\"/g, '"')
  .replace(/\\'/g, "'")
  .replace(/\\\\/g, '\\');

// Truncate any HMR IIFE wrappers at the end if present
const iifeIdx = cleanJs.indexOf(';\n    // Wrapped in an IIFE');
if (iifeIdx !== -1) {
  cleanJs = cleanJs.substring(0, iifeIdx);
}

// Write the restored pure file
const targetFile = "c:\\dib-portal\\src\\components\\legacy-pages\\legacyHolidayLogic.js";
fs.writeFileSync(targetFile, cleanJs);
console.log(`SUCCESSFULLY RESTORED PURE ${targetFile} (${cleanJs.length} bytes)!`);
