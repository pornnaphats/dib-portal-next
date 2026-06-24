const fs = require('fs');
let c = fs.readFileSync('js/pages.js', 'utf8');

c = c.replace(
    '<div style="font-weight:700; color:var(--text); font-size:.85rem; line-height:1.2">${e.name}</div>',
    '<div style="font-weight:700; color:var(--text); font-size:.85rem; line-height:1.2; white-space:nowrap">${e.name}</div>'
);

c = c.replace(
    '<div style="font-size:.65rem; color:var(--text-3); font-weight:500">${e.nameEn || \'-\'}</div>',
    '<div style="font-size:.65rem; color:var(--text-3); font-weight:500; white-space:nowrap">${e.nameEn || \'-\'}</div>'
);

c = c.replace(
    '<td style="font-size:.75rem; color:var(--text-3)">${e.shift || \'-\'}</td>',
    '<td style="font-size:.75rem; color:var(--text-3); white-space:nowrap">${e.shift || \'-\'}</td>'
);

c = c.replace(
    '<td style="font-size:.75rem; color:var(--text-3)">${e.offdays || \'-\'}</td>',
    '<td style="font-size:.75rem; color:var(--text-3); white-space:nowrap">${e.offdays || \'-\'}</td>'
);

fs.writeFileSync('js/pages.js', c);
console.log('Fixed js/pages.js wrapping');
