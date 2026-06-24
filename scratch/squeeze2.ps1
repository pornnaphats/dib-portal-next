$content = Get-Content js/pages.js -Raw -Encoding UTF8

# Make the right panel even narrower (200px)
$content = $content -replace 'grid-template-columns:1fr 230px;', 'grid-template-columns:1fr 200px;'

# Shrink the Employee Name column width
$content = $content -replace 'width: 200px;">ѡҹ</th>', 'width: 180px;">ѡҹ</th>'
$content = $content -replace 'width: 220px;">ѡҹ</th>', 'width: 180px;">ѡҹ</th>'

# Shrink table cell paddings drastically to save space
$content = $content -replace '<td style="padding: 10px 12px">', '<td style="padding: 6px 10px">'
$content = $content -replace '<td style="padding: 12px 20px">', '<td style="padding: 6px 10px">'
$content = $content -replace 'padding: 12px 10px;', 'padding: 8px 8px;'
$content = $content -replace 'padding: 12px 14px;', 'padding: 8px 8px;'

# Reduce the font sizes a tiny bit for the table data
$content = $content -replace 'font-size:\.85rem;', 'font-size:.8rem;'
$content = $content -replace 'font-size:\.75rem;', 'font-size:.7rem;'

Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Success!"
