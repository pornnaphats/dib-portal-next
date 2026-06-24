$lines = Get-Content js/pages.js -Encoding UTF8
$newLines = @()
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($i -eq 3248) {
        if ($lines[$i].Trim() -eq "</div>") {
            # Skip this line
            continue
        }
    }
    $newLines += $lines[$i]
}
Set-Content js/pages.js $newLines -Encoding UTF8
Write-Host "Done!"
