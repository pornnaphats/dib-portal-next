$lines = Get-Content "c:\antigravity-project\js\pages.js" -Encoding UTF8

$newLines = New-Object System.Collections.Generic.List[string]

$skipLines = 0
$foundBad = $false
$foundGood = $false

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($skipLines -gt 0) {
        $skipLines--
        continue
    }

    $line = $lines[$i]

    # Look for the bad insertion near "leaveRefDate" (line ~5144)
    # The bad insertion starts with `<div class="tabs"` right above `<input type="text" id="leaveRefDate"`
    if (-not $foundBad -and $line -match '<div class="tabs" style="display:flex; gap:8px;') {
        if ($i + 9 -lt $lines.Length -and $lines[$i+9] -match 'id="leaveRefDate"') {
            # This is the bad block! Skip the next 9 lines.
            $skipLines = 8
            $foundBad = $true
            continue
        }
    }

    # Look for the old external-link button block (line ~5600)
    # The block is 9 lines long. It contains "external-link" on line $i+6.
    if (-not $foundGood -and $line -match '<div class="tabs" style="display:flex; gap:8px; background:#fff;') {
        if ($i + 6 -lt $lines.Length -and $lines[$i+6] -match 'external-link') {
            # This is the old button block! Replace it with the new code.
            $newLines.Add('      <div class="tabs" style="display:flex; gap:8px; background:#fff; padding:6px; border-radius:16px; border:1px solid var(--border); box-shadow:var(--shadow-sm); margin-bottom:0">')
            $newLines.Add('        <button class="tab-btn ${window._leaveActiveTab !== ''empeo'' ? ''active'' : ''}" onclick="window._leaveActiveTab=''overview''; navigate(''leave-management'')" style="padding:10px 24px; border:none; background:${window._leaveActiveTab !== ''empeo'' ? ''#f1f5f9'' : ''none''}; color:${window._leaveActiveTab !== ''empeo'' ? ''var(--primary)'' : ''var(--text-3)''}; font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">')
            $newLines.Add('          <i data-lucide="layout-grid" style="width:18px; height:18px"></i> Overview')
            $newLines.Add('        </button>')
            $newLines.Add('        <button class="tab-btn ${window._leaveActiveTab === ''empeo'' ? ''active'' : ''}" onclick="window._leaveActiveTab=''empeo''; navigate(''leave-management'')" style="padding:10px 24px; border:none; background:${window._leaveActiveTab === ''empeo'' ? ''#f1f5f9'' : ''none''}; color:${window._leaveActiveTab === ''empeo'' ? ''var(--primary)'' : ''var(--text-3)''}; font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">')
            $newLines.Add('          <i data-lucide="bar-chart-2" style="width:18px; height:18px"></i> Empeo Report')
            $newLines.Add('        </button>')
            $newLines.Add('      </div>')
            $skipLines = 8
            $foundGood = $true
            continue
        }
    }

    $newLines.Add($line)
}

[System.IO.File]::WriteAllLines("c:\antigravity-project\js\pages.js", $newLines, [System.Text.Encoding]::UTF8)
Write-Host "Removed bad block: $foundBad"
Write-Host "Replaced old button: $foundGood"
