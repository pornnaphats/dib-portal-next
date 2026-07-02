const fs = require('fs');
const path = require('path');

const files = [
  "c:/antigravity-project/dib-portal-next/src/components/employee/legacyEmployeeLogic.js",
  "c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyHolidayLogic.js",
  "c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyScopeLogic.js",
  "c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyQcPlanLogic.js",
  "c:/antigravity-project/dib-portal-next/src/components/structure/legacyOrgLogic.js"
];

files.forEach(filepath => {
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // Replace card border with shadow
  content = content.replace(/class="card"\s+style="padding:\s*0;\s*border-radius:\s*20px;\s*overflow:\s*hidden;\s*border:\s*1px\s+solid\s+var\(--border\)"/gi,
                            `class="card" style="padding: 0; border-radius: 20px; overflow: hidden; border: none; box-shadow: 0 8px 30px rgba(0,0,0,0.03)"`);
  
  content = content.replace(/class="card"\s+style="padding:\s*0;\s*border-radius:\s*20px;\s*overflow:\s*hidden;\s*border:\s*1px\s+solid\s+var\(--border\);\s*"/gi,
                            `class="card" style="padding: 0; border-radius: 20px; overflow: hidden; border: none; box-shadow: 0 8px 30px rgba(0,0,0,0.03)"`);

  // Scope table wrapper
  content = content.replace(/id="scopeTableWrap"\s+class="table-wrap"\s+style="border:\s*1px\s+solid\s+var\(--border\);\s*border-radius:\s*var\(--radius\);\s*overflow:\s*auto;/gi,
                            `id="scopeTableWrap" class="table-wrap" style="border: none; box-shadow: 0 8px 30px rgba(0,0,0,0.03); border-radius: 20px; overflow: auto;`);

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Removed borders and added shadow in: ${path.basename(filepath)}`);
  }
});
