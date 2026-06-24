$content = Get-Content js/pages.js -Raw -Encoding UTF8

$content = $content -replace '<th style="padding: 12px 20px; text-align: center; font-weight: 700; color: #4b5675 !important; font-size: \.8rem; border-bottom: 1px solid #e4e8ef; width: 220px;">พนักงาน</th>', '<th style="padding: 12px 20px; text-align: left; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef; width: 220px;">พนักงาน</th>'

$content = $content -replace '<th style="padding: 8px 8px; text-align: center; font-weight: 700; color: #4b5675 !important; font-size: \.8rem; border-bottom: 1px solid #e4e8ef;">', '<th style="padding: 8px 8px; text-align: left; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef;">'

Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Reverted to left alignment"
