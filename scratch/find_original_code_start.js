const fs = require('fs');

const file = "c:\\dib-portal\\src\\components\\legacy-pages\\legacyHolidayLogic.js";
const content = fs.readFileSync(file, 'utf8');

console.log("Checking the first 50 lines of restored legacyHolidayLogic.js...");
console.log(content.split('\n').slice(0, 50).join('\n'));
