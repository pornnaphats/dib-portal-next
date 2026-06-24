$content = Get-Content js/pages.js -Raw -Encoding UTF8

$content = $content -replace '<th style="padding: 12px 14px; text-align: center; font-weight: 700; color: #4b5675 !important; font-size: \.8rem; border-bottom: 1px solid #e4e8ef;">(.*?)</th>', '<th style="padding: 12px 14px; text-align: center; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef; width: 80px; white-space: nowrap;">$1</th>'

Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Success!"
