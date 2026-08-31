const fs = require('fs');
const path = require('path');

const chunkFile = "c:\\dib-portal\\scratch\\raw_next_926.js";
const content = fs.readFileSync(chunkFile, 'utf8');

console.log("Extracting pure legacyHolidayLogic.js from position 165...");

const evalIdx = 165;

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

// Remove webpack harmony exports or other webpack wrappers if present at the top
// A webpack module typically starts with:
// __webpack_require__.r(__webpack_exports__);\n...
// Let's strip these lines!
// The original file is a legacy script that defines globals on window. It does not export anything.
// So let's look at the first 10 lines of cleanJs to see if it has webpack export definitions.
console.log("First 15 lines of cleanJs:");
console.log(cleanJs.split('\n').slice(0, 15).join('\n'));

// Write to final target file
const targetFile = "c:\\dib-portal\\src\\components\\legacy-pages\\legacyHolidayLogic.js";
fs.writeFileSync(targetFile, cleanJs);
console.log(`SUCCESSFULLY RESTORED PURE ${targetFile} (${cleanJs.length} bytes)!`);
