$csvPath = "scratch/sheet_data.csv"
$lines = Get-Content $csvPath -Encoding UTF8
$employees = @()

for ($i = 13; $i -lt $lines.Length; $i++) {
    $line = $lines[$i].Trim()
    if (-not $line) { continue }
    if ($line.StartsWith(",รวม")) { break }
    
    if ($line.Contains("แผนก") -and $line.Split(',').Where({$_.Trim() -ne ""}).Count -le 3) {
        continue
    }

    $cols = $line.Split(',')
    if ($cols.Length -lt 50) { continue }

    $id = $cols[1].Trim()
    $name = $cols[3].Trim()
    
    if (-not $id -or -not $name) { continue }

    $present = if ($cols[33] -eq "-") { 0 } else { [int]$cols[33] }
    $absent = if ($cols[34] -eq "-") { 0 } else { [int]$cols[34] }
    $lateTimes = if ($cols[35] -eq "-") { 0 } else { [int]$cols[35] }
    $lateMins = if ($cols[36] -eq "-") { 0 } else { [int]$cols[36] }
    $leaveEarlyTimes = if ($cols[37] -eq "-") { 0 } else { [int]$cols[37] }
    $leaveEarlyMins = if ($cols[38] -eq "-") { 0 } else { [int]$cols[38] }
    $forgetIn = if ($cols[39] -eq "-") { 0 } else { [int]$cols[39] }
    $forgetOut = if ($cols[40] -eq "-") { 0 } else { [int]$cols[40] }

    $sickLeave = if ($cols[41] -eq "-") { 0 } else { [double](($cols[41] -replace '([0-9]+)\.([0-9]+):[0-9]+', '$1.$2') -replace '[^0-9\.]', '') }
    $personalLeave = if ($cols[43] -eq "-") { 0 } else { [double](($cols[43] -replace '([0-9]+)\.([0-9]+):[0-9]+', '$1.$2') -replace '[^0-9\.]', '') }
    $vacationLeave = if ($cols[45] -eq "-") { 0 } else { [double](($cols[45] -replace '([0-9]+)\.([0-9]+):[0-9]+', '$1.$2') -replace '[^0-9\.]', '') }
    $otherLeave = if ($cols[46] -eq "-") { 0 } else { [double](($cols[46] -replace '([0-9]+)\.([0-9]+):[0-9]+', '$1.$2') -replace '[^0-9\.]', '') }

    $emp = @{
        id = $id
        name = $name
        present = $present
        absent = $absent
        lateTimes = $lateTimes
        lateMins = $lateMins
        leaveEarlyTimes = $leaveEarlyTimes
        leaveEarlyMins = $leaveEarlyMins
        forgetIn = $forgetIn
        forgetOut = $forgetOut
        sickLeave = $sickLeave
        personalLeave = $personalLeave
        vacationLeave = $vacationLeave
        otherLeave = $otherLeave
    }
    $employees += $emp
}

$json = $employees | ConvertTo-Json
$jsContent = "window.DATA = window.DATA || {};`nwindow.DATA.empeoReport = $json;`n"
Set-Content -Path "js/empeo_data.js" -Value $jsContent -Encoding UTF8
Write-Host "Successfully generated js/empeo_data.js with $($employees.Length) records."
