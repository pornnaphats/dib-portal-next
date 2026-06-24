$lines = Get-Content "c:\antigravity-project\js\pages.js" -Encoding UTF8
$idx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "^\s*function toggleLeaveBulkMode\(\)\s*\{\s*$") {
        $idx = $i
        break
    }
}

if ($idx -ne -1) {
    $newLines = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt ($idx - 4); $i++) {
        $newLines.Add($lines[$i])
    }
    
    $newLines.Add('  </div>`}')
    $newLines.Add('  `;')
    $newLines.Add('  }')
    $newLines.Add('')
    $newLines.Add('  function toggleLeaveBulkMode() {')
    $newLines.Add('    window.isLeaveBulkMode = !window.isLeaveBulkMode;')
    $newLines.Add("    const btn = document.getElementById('btnToggleBulk');")
    
    for ($i = $idx + 3; $i -lt $lines.Length; $i++) {
        $newLines.Add($lines[$i])
    }

    [System.IO.File]::WriteAllLines("c:\antigravity-project\js\pages.js", $newLines, [System.Text.Encoding]::UTF8)
    Write-Host "Fixed perfectly with single quotes!"
} else {
    Write-Host "Could not find toggleLeaveBulkMode"
}
