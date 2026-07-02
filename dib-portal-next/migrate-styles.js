const fs = require('fs');

const files = [
  'src/components/employee/legacyEmployeeLogic.js',
  'src/components/legacy-pages/legacyGlobalHelpers.js',
  'src/components/legacy-pages/legacyHolidayLogic.js',
  'src/components/legacy-pages/legacyQcPlanLogic.js',
  'src/components/legacy-pages/legacyScopeLogic.js',
  'src/components/legacy-pages/legacyWorkshipLogic.js'
];

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.log('Skipping', f);
    return;
  }
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace colors and shadows
  content = content.replace(/background:\s*#fff/g, 'background: var(--surface)');
  content = content.replace(/background:\s*#f8f9fb/g, 'background: var(--surface2)');
  content = content.replace(/background:\s*#f4f7fe/g, 'background: var(--bg)');
  content = content.replace(/border:\s*1px solid #e2e8f0/g, 'border: 1px solid var(--border)');
  content = content.replace(/border-color:\s*#e2e8f0/g, 'border-color: var(--border)');
  content = content.replace(/border-bottom:\s*1px solid #e2e8f0/g, 'border-bottom: 1px solid var(--border)');
  content = content.replace(/border-top:\s*1px solid #e2e8f0/g, 'border-top: 1px solid var(--border)');
  
  // Replace radii
  content = content.replace(/border-radius:\s*8px/g, 'border-radius: var(--radius-sm)');
  content = content.replace(/border-radius:\s*10px/g, 'border-radius: var(--radius-sm)');
  content = content.replace(/border-radius:\s*12px/g, 'border-radius: var(--radius)');
  content = content.replace(/border-radius:\s*14px/g, 'border-radius: var(--radius)');
  content = content.replace(/border-radius:\s*16px/g, 'border-radius: var(--radius)');
  
  // Replace box-shadow (exclude none and inset)
  content = content.replace(/box-shadow:[^;'\"]+/g, (match) => {
    if (match.includes('inset')) return match;
    if (match.includes('none')) return match;
    if (match.includes('var(--shadow)')) return match; // Already migrated
    return 'box-shadow: var(--shadow)';
  });
  
  fs.writeFileSync(f, content);
  console.log('Updated', f);
});
