const fs = require('fs');
const path = require('path');

// 1. Revert to original clean file
const targetFile = "c:\\dib-portal\\src\\components\\legacy-pages\\legacyHolidayLogic.js";
const { execSync } = require('child_process');
execSync(`git checkout HEAD -- ${targetFile}`);
console.log("Reverted targetFile to git HEAD.");

// 2. Read the clean original logic
const originalLogic = fs.readFileSync(targetFile, 'utf8');

// 3. Extract the clean summary logic from raw_next_926.js
// The summary logic starts around window.pageHolidaySummary and ends at the end of the user code in that module.
// In raw_next_926.js, the user code is followed by standard Webpack HMR runtime wrapper (e.g. module.hot.dispose)
const chunkFile = "c:\\dib-portal\\scratch\\raw_next_926.js";
const content = fs.readFileSync(chunkFile, 'utf8');

const target = 'window.pageHolidaySummary = function';
const idx = content.indexOf(target);
if (idx === -1) {
  console.log("Could not find summary target.");
  process.exit(1);
}

// We want to capture from "window.pageHolidaySummary = function" up to the end of the module.
// Let's find "//# sourceURL=" which marks the end of the module file.
const sourceUrlIdx = content.indexOf('//# sourceURL=', idx);
let moduleContent = content.substring(idx, sourceUrlIdx !== -1 ? sourceUrlIdx : content.length);

// Let's clean up webpack/HMR boilerplate at the end if present
// Typically it looks like:
// ;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {
const iifeIdx = moduleContent.indexOf(';\n    // Wrapped in an IIFE');
if (iifeIdx !== -1) {
  moduleContent = moduleContent.substring(0, iifeIdx);
}

// Unescape escapes
let cleanJs = moduleContent
  .replace(/\\n/g, '\n')
  .replace(/\\r/g, '\r')
  .replace(/\\t/g, '\t')
  .replace(/\\"/g, '"')
  .replace(/\\'/g, "'")
  .replace(/\\\\/g, '\\');

// Append the new functions to the clean original logic
const finalLogic = originalLogic + '\n\n' + cleanJs;

fs.writeFileSync(targetFile, finalLogic);
console.log(`SUCCESSFULLY RESTORED CLEAN ${targetFile} (${finalLogic.length} bytes)!`);
