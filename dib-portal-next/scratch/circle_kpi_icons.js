const fs = require('fs');

const files = [
  "c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyWorkshipLogic.js",
  "c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyQcPlanLogic.js",
  "c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyHolidayLogic.js"
];

files.forEach(filepath => {
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');

  // Change border-radius of the icon wrapper inside KPI cards to 50% (circle)
  content = content.replace(/border-radius:\s*6px;\s*background:/g, 'border-radius: 50%; background:');
  content = content.replace(/border-radius:\s*8px;\s*background:/g, 'border-radius: 50%; background:');
  content = content.replace(/border-radius:\s*var\(--radius\);\s*background:/g, 'border-radius: 50%; background:');

  fs.writeFileSync(filepath, content, 'utf8');
});

console.log("Stat card icons adjusted to circle shape successfully!");
