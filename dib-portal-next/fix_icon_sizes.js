const fs = require('fs');

const files = [
  'src/components/legacy-pages/legacyWorkshipLogic.js',
  'src/components/legacy-pages/legacyHolidayLogic.js',
  'src/components/legacy-pages/legacyScopeLogic.js',
  'src/components/legacy-pages/legacyQcPlanLogic.js'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');

  // Replace 32px stat circle containers -> 40px to match Employee (40px circles)
  c = c.split('width: 32px; height: 32px; border-radius: 50%;').join('width: 40px; height: 40px; border-radius: 50%;');
  c = c.split('width:32px; height:32px; border-radius: 50%;').join('width:40px; height:40px; border-radius: 50%;');
  c = c.split('width:32px; height:32px; border-radius:50%;').join('width:40px; height:40px; border-radius:50%;');

  // Replace 22px standalone stat icons -> 20px for consistency
  c = c.split('width: 22px; height: 22px; color: var(--primary)').join('width: 20px; height: 20px; color: var(--primary)');
  c = c.split('width: 22px; height: 22px; color: var(--danger)').join('width: 20px; height: 20px; color: var(--danger)');
  c = c.split('width: 22px; height: 22px; color: var(--accent)').join('width: 20px; height: 20px; color: var(--accent)');
  c = c.split('width:22px; height:22px; color:var(--primary)').join('width:20px; height:20px; color:var(--primary)');
  c = c.split('width: 22px; height: 22px; color: #3b82f6').join('width: 20px; height: 20px; color: #3b82f6');

  // Now fix icon size INSIDE stat circles: use regex to find pattern
  // Pattern: inside a 40px circle div, find <i data-lucide="..." style="width: 16px; height: 16px">
  // Replace width:16px height:16px inside circle context -> 20px
  // We do this with a targeted regex on the actual stat card block
  c = c.replace(
    /(width: 40px; height: 40px; border-radius: 50%;[^>]+>\s*<i data-lucide="[^"]*" style="width: )16px; height: 16px/g,
    '$120px; height: 20px'
  );
  c = c.replace(
    /(width:40px; height:40px; border-radius: 50%;[^>]+>\s*<i data-lucide="[^"]*" style="width: )16px; height: 16px/g,
    '$120px; height: 20px'
  );

  fs.writeFileSync(f, c, 'utf8');
  console.log('Fixed:', f);
});

console.log('All done!');
