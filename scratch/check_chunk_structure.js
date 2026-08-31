const fs = require('fs');

const chunkFile = "c:\\dib-portal\\scratch\\raw_next_926.js";
const content = fs.readFileSync(chunkFile, 'utf8');

console.log(content.substring(670, 1100).replace(/\n/g, '\\n'));
