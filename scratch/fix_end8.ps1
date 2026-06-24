$lines = Get-Content "c:\antigravity-project\js\pages.js" -Encoding UTF8
$idx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "^\s*function toggleLeaveBulkMode\(\)\s*\{\s*$") {
        $idx = $i
        break
    }
}

if ($idx -ne -1) {
    # The file currently has:
    # 5922:   </div>
    # 5923:   `;
    # 5924:   }
    # 5925: 
    # 5926:   function toggleLeaveBulkMode() {
    # 5927:     window.isLeaveBulkMode = !window.isLeaveBulkMode;
    # 5928:     if (btn) {
    
    $newLines = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt ($idx - 4); $i++) {
        $newLines.Add($lines[$i])
    }
    
    # Re-build from $idx - 4 to end
    $newLines.Add($lines[$idx - 4]) # 5922:   </div>
    
    # We want:
    #   </div>`}
    #   `;
    #   }
    $newLines[$newLines.Count - 1] = "  </div>`}"
    $newLines.Add("  `;")
    $newLines.Add("  }")
    $newLines.Add("")
    $newLines.Add("  function toggleLeaveBulkMode() {")
    $newLines.Add("    window.isLeaveBulkMode = !window.isLeaveBulkMode;")
    $newLines.Add("    const btn = document.getElementById('btnToggleBulk');")
    
    # Add the rest of the lines starting from what is currently line 5928 "    if (btn) {"
    for ($i = $idx + 2; $i -lt $lines.Length; $i++) {
        $newLines.Add($lines[$i])
    }

    [System.IO.File]::WriteAllLines("c:\antigravity-project\js\pages.js", $newLines, [System.Text.Encoding]::UTF8)
    Write-Host "Fixed perfectly!"
} else {
    Write-Host "Could not find toggleLeaveBulkMode"
}
