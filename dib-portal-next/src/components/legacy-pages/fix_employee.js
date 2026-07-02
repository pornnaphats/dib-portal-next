const fs = require('fs');
const files = [
  'c:/antigravity-project/dib-portal-next/src/components/employee/legacyEmployeeLogic.js'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/(?<!window\.)\bDATA\./g, 'window.DATA.');
  content = content.replace(/(?<!window\.)\bWS_DATA\./g, 'window.WS_DATA.');
  content = content.replace(/typeof DATA !== 'undefined'/g, "typeof window.DATA !== 'undefined'");
  content = content.replace(/typeof WS_DATA !== 'undefined'/g, "typeof window.WS_DATA !== 'undefined'");
  fs.writeFileSync(f, content);
});
