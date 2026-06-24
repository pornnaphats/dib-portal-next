$content = Get-Content js/pages.js -Raw -Encoding UTF8

$content = $content -replace '        `\)\.join\(''''\)\}\s*</div>\s*</div>\s*</div>\s*<div class="card" style="padding:20px">\s*<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">\s*<div style="font-size:\.9rem; font-weight:700">ѹԴѡҹ͹</div>', "        `).join('')}`n      </div>`n    </div>`n    <div class=`"card`" style=`"padding:20px`">`n      <div style=`"display:flex; justify-content:space-between; align-items:center; margin-bottom:20px`">`n        <div style=`"font-size:.9rem; font-weight:700`">วันเกิดพนักงานในเดือนนี้</div>"

Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Replaced!"
