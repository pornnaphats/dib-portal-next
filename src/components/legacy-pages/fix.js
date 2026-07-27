const fs = require('fs');
const files = [
  'legacyQcPlanLogic.js',
  'legacyHolidayLogic.js',
  'legacyScopeLogic.js',
  'legacyWorkshipLogic.js'
];
files.forEach(f => {
  const path = 'c:/antigravity-project/dib-portal-next/src/components/legacy-pages/' + f;
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/(?<!window\.)\bDATA\./g, 'window.DATA.');
  content = content.replace(/(?<!window\.)\bWS_DATA\./g, 'window.WS_DATA.');
  content = content.replace(/typeof DATA !== 'undefined'/g, "typeof window.DATA !== 'undefined'");
  content = content.replace(/typeof WS_DATA !== 'undefined'/g, "typeof window.WS_DATA !== 'undefined'");
  fs.writeFileSync(path, content);
});
