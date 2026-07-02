const fs = require('fs');

const files = [
  "c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyWorkshipLogic.js",
  "c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyQcPlanLogic.js",
  "c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyHolidayLogic.js"
];

files.forEach(filepath => {
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');

  // Replace padding and gap
  content = content.replace(/padding:\s*20px;\s*display:\s*flex;\s*flex-direction:\s*column;\s*align-items:\s*flex-start;\s*gap:\s*8px/g, 
                            'padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px');

  // Replace icon container size
  content = content.replace(/width:\s*40px;\s*height:\s*40px;\s*border-radius:\s*8px/g, 
                            'width: 32px; height: 32px; border-radius: 6px');

  // Replace lucide icon size inside those cards
  content = content.replace(/width:\s*20px;\s*height:\s*20px/g, 
                            'width: 16px; height: 16px');

  // Replace text values size from 1.5rem to 1.25rem
  content = content.replace(/font-size:\s*1\.5rem/g, 
                            'font-size: 1.25rem');

  fs.writeFileSync(filepath, content, 'utf8');
});

console.log("Stat cards scaled down successfully!");
