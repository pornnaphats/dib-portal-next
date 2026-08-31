const fs = require('fs');
const path = require('path');

const snippetFile = "c:\\dib-portal\\scratch\\recovered_snippet.txt";
const rawText = fs.readFileSync(snippetFile, 'utf8');

console.log("Parsing snippet...");

// The snippet contains eval(__webpack_require__.ts("...")) or similar.
// Inside it, newlines are represented as \n and tabs as \t.
// Let's write a parser that extracts the code containing "window.pageHolidaySummary" and unescapes it.
// We want to unescape the entire webpack module code that contains pageHolidaySummary.
// The snippet has the webpack module code. Let's find the start of the module containing "window.pageHolidaySummary"
// Module start usually has something like: eval(__webpack_require__.ts("
// Let's find "window.pageHolidaySummary" and backtrack to find the nearest eval(" or eval(__webpack_require__.ts("

const targetStr = 'window.pageHolidaySummary';
const idx = rawText.indexOf(targetStr);
if (idx === -1) {
  console.log("Could not find window.pageHolidaySummary in snippet.");
  process.exit(1);
}

// Backtrack to find eval(__webpack_require__.ts(" or similar
const evalStr = 'eval(';
let evalIdx = rawText.lastIndexOf(evalStr, idx);
if (evalIdx === -1) {
  evalIdx = rawText.lastIndexOf('eval(__webpack_require__.ts("', idx);
}

if (evalIdx === -1) {
  console.log("Could not find eval( start index.");
  process.exit(1);
}

// Find the string literal within the eval
// It usually starts with " or ` or ' right after eval( or eval(__webpack_require__.ts(
const startCharIdx = rawText.indexOf('"', evalIdx);
if (startCharIdx === -1 || startCharIdx > idx) {
  console.log("Could not find start of string literal.");
  process.exit(1);
}

// Find the matching end quote
// Let's extract the string content
let escContent = '';
let inString = true;
let i = startCharIdx + 1;
while (i < rawText.length && inString) {
  if (rawText[i] === '"' && rawText[i - 1] !== '\\') {
    inString = false;
  } else {
    escContent += rawText[i];
    i++;
  }
}

console.log(`Extracted escaped content of length ${escContent.length}`);

// Now unescape the string: convert \n to real newlines, \t to tabs, \" to ", \\ to \, etc.
// Node.js eval can do this, or we can use JSON.parse('"' + escContent + '"') or a replace loop.
// Let's use a safe replace loop for javascript escapes
let cleanJs = escContent
  .replace(/\\n/g, '\n')
  .replace(/\\r/g, '\r')
  .replace(/\\t/g, '\t')
  .replace(/\\"/g, '"')
  .replace(/\\'/g, "'")
  .replace(/\\\\/g, '\\');

// Write the recovered Javascript file!
fs.writeFileSync(path.join(__dirname, 'recovered_holiday_logic.js'), cleanJs);
console.log("Successfully recovered clean Javascript to scratch/recovered_holiday_logic.js!");
