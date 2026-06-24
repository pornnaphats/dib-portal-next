$content = Get-Content js/pages.js -Raw -Encoding UTF8

$content = $content -replace '<div style="font-weight:700; color:var\(--text\); font-size:\.85rem; line-height:1\.2">\$\{e\.name\}</div>', '<div style="font-weight:700; color:var(--text); font-size:.85rem; line-height:1.2; white-space:nowrap">${e.name}</div>'

$content = $content -replace '<div style="font-size:\.65rem; color:var\(--text-3\); font-weight:500">\$\{e\.nameEn \|\| ''-''\}</div>', '<div style="font-size:.65rem; color:var(--text-3); font-weight:500; white-space:nowrap">${e.nameEn || ''-''}</div>'

$content = $content -replace '<td style="font-size:\.75rem; color:var\(--text-3\)">\$\{e\.shift \|\| ''-''\}</td>', '<td style="font-size:.75rem; color:var(--text-3); white-space:nowrap">${e.shift || ''-''}</td>'

$content = $content -replace '<td style="font-size:\.75rem; color:var\(--text-3\)">\$\{e\.offdays \|\| ''-''\}</td>', '<td style="font-size:.75rem; color:var(--text-3); white-space:nowrap">${e.offdays || ''-''}</td>'

Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Success!"
