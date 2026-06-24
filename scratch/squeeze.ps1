$content = Get-Content js/pages.js -Raw -Encoding UTF8

# Reduce right panel width
$content = $content -replace 'grid-template-columns:1fr 260px;', 'grid-template-columns:1fr 230px;'

# Reduce employee column width
$content = $content -replace 'width: 220px;">ѡҹ</th>', 'width: 200px;">ѡҹ</th>'

# Reduce padding on employee td
$content = $content -replace '<td style="padding: 12px 20px">', '<td style="padding: 10px 12px">'

# Reduce gap in employee td
$content = $content -replace 'gap:12px">', 'gap:8px">'

# Reduce padding on headers
$content = $content -replace 'padding: 12px 14px;', 'padding: 12px 10px;'

# Reduce font-size slightly for td to fit more content (optional but helpful)
# Let's just rely on the padding and width changes for now.

Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Success!"
