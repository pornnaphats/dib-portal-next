$content = Get-Content js/pages.js -Encoding UTF8
if ($content[3248].Trim() -eq "</div>") {
    # Line 3249 is index 3248
    $content = $content | Select-Object -SkipIndex 3248
    Set-Content js/pages.js $content -Encoding UTF8
    Write-Host "Removed line 3249"
} else {
    Write-Host "Line 3249 is not a closing div: $($content[3248])"
}
