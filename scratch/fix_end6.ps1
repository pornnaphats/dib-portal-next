$content = [System.IO.File]::ReadAllText("c:\antigravity-project\js\pages.js")

$pattern = '(?s)\s*</div>`;\s*\}\s*function toggleLeaveBulkMode\(\) \{'
$replacement = "`r`n  </div>`}`r`n  `;`r`n  }`r`n`r`n  function toggleLeaveBulkMode() {"

$content = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, $replacement)

[System.IO.File]::WriteAllText("c:\antigravity-project\js\pages.js", $content, [System.Text.Encoding]::UTF8)
Write-Host "Done with robust regex"
