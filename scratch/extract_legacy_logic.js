const fs = require('fs');
const path = require('path');

const chunkFile = "c:\\dib-portal\\scratch\\raw_next_926.js";
const content = fs.readFileSync(chunkFile, 'utf8');

console.log("Locating legacyHolidayLogic.js module inside raw_next_926.js...");

const moduleId = '"(app-pages-browser)/./src/components/legacy-pages/legacyHolidayLogic.js"';
const modulePos = content.indexOf(moduleId);
if (modulePos === -1) {
  console.log("Could not find module ID in chunk.");
  process.exit(1);
}

console.log(`Found module ID at position ${modulePos}`);

// Find the eval( that occurs after the module ID
const evalIdx = content.indexOf('eval(', modulePos);
if (evalIdx === -1) {
  console.log("Could not find eval after module ID.");
  process.exit(1);
}

console.log(`Found eval( at position ${evalIdx}`);

// Find the string literal start inside eval
const startCharIdx = content.indexOf('"', evalIdx);
if (startCharIdx === -1) {
  console.log("Could not find start of string literal.");
  process.exit(1);
}

// Extract up to matching end quote
let escContent = '';
let inString = true;
let j = startCharIdx + 1;
while (j < content.length && inString) {
  if (content[j] === '"' && content[j - 1] !== '\\') {
    inString = false;
  } else {
    escContent += content[j];
    j++;
  }
}

console.log(`Extracted module string of length ${escContent.length}`);

let cleanJs = escContent
  .replace(/\\n/g, '\n')
  .replace(/\\r/g, '\r')
  .replace(/\\t/g, '\t')
  .replace(/\\"/g, '"')
  .replace(/\\'/g, "'")
  .replace(/\\\\/g, '\\');

// Truncate HMR IIFE wrappers at the end if present
const iifeIdx = cleanJs.indexOf(';\n    // Wrapped in an IIFE');
if (iifeIdx !== -1) {
  cleanJs = cleanJs.substring(0, iifeIdx);
}

// Check first 15 lines of cleanJs
console.log("First 15 lines of cleanJs:");
console.log(cleanJs.split('\n').slice(0, 15).join('\n'));

// Write to final target file
const targetFile = "c:\\dib-portal\\src\\components\\legacy-pages\\legacyHolidayLogic.js";
fs.writeFileSync(targetFile, cleanJs);
console.log(`SUCCESSFULLY RESTORED PURE ${targetFile} (${cleanJs.length} bytes)!`);
