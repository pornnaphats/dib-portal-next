$content = Get-Content js/pages.js -Raw -Encoding UTF8

$content = $content -replace '</div>\s*;\s*setTimeout\(\(\) => \{', "</div>`n    ``;`n`n      setTimeout(() => {"

Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Success!"
