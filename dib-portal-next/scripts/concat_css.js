const fs = require('fs');
const css1 = fs.readFileSync('../css/style.css', 'utf8');
const css2 = fs.readFileSync('../css/style_append.css', 'utf8');
fs.writeFileSync('./src/app/legacy.css', css1 + '\n\n' + css2);
