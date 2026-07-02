const fs = require('fs');

const files = [
  'src/components/legacy-pages/legacyGlobalHelpers.js',
  'src/components/legacy-pages/legacyHolidayLogic.js',
  'src/components/legacy-pages/legacyQcPlanLogic.js',
  'src/components/leave-management/legacyLeaveLogic.js',
  'src/components/employee/legacyEmployeeLogic.js',
  'src/components/structure/legacyOrgLogic.js',
];

files.forEach(f => {
  if (!fs.existsSync(f)) { console.log('SKIP (not found):', f); return; }
  let c = fs.readFileSync(f, 'utf8');
  const before = (c.match(/Kanit/g) || []).length;

  // Replace all Kanit occurrences with Prompt
  c = c.replace(/Kanit/g, 'Prompt');

  const after = (c.match(/Prompt/g) || []).length;
  fs.writeFileSync(f, c);
  console.log(f + ': replaced ' + before + ' occurrences');
});

console.log('Done!');
