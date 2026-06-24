$content = [System.IO.File]::ReadAllText("c:\antigravity-project\js\pages.js")

# 1. Insert helper function
$target1 = "  const data = window.DATA.empeoReport || [];"
$replacement1 = "  const data = window.DATA.empeoReport || [];`r`n  const fmt = (n) => Number(n || 0).toLocaleString();"
$content = $content.Replace($target1, $replacement1)

# 2. Format KPI row
$target2 = @'
      ${[
          { label: 'มาสายสะสม', val: totalLateMins + ' นาที', sub: 'รวมทุกคน', icon: 'clock', color: '#F87171' },
          { label: 'กลับก่อนสะสม', val: totalLeaveEarlyMins + ' นาที', sub: 'รวมทุกคน', icon: 'log-out', color: '#FBBF24' },
          { label: 'ขาดงาน', val: totalAbsent + ' วัน', sub: 'รวมทุกคน', icon: 'user-x', color: '#EF4444' },
          { label: 'ลาป่วย', val: totalSick + ' วัน', sub: 'รวมทุกคน', icon: 'thermometer', color: '#60A5FA' },
          { label: 'ลากิจ', val: totalPersonal + ' วัน', sub: 'รวมทุกคน', icon: 'briefcase', color: '#A78BFA' },
          { label: 'ลาพักร้อน', val: totalVacation + ' วัน', sub: 'รวมทุกคน', icon: 'sun', color: '#34D399' }
      ].map(k => `
'@
$replacement2 = @'
      ${[
          { label: 'มาสายสะสม', val: fmt(totalLateMins) + ' นาที', sub: 'รวมทุกคน', icon: 'clock', color: '#F87171' },
          { label: 'กลับก่อนสะสม', val: fmt(totalLeaveEarlyMins) + ' นาที', sub: 'รวมทุกคน', icon: 'log-out', color: '#FBBF24' },
          { label: 'ขาดงาน', val: fmt(totalAbsent) + ' วัน', sub: 'รวมทุกคน', icon: 'user-x', color: '#EF4444' },
          { label: 'ลาป่วย', val: fmt(totalSick) + ' วัน', sub: 'รวมทุกคน', icon: 'thermometer', color: '#60A5FA' },
          { label: 'ลากิจ', val: fmt(totalPersonal) + ' วัน', sub: 'รวมทุกคน', icon: 'briefcase', color: '#A78BFA' },
          { label: 'ลาพักร้อน', val: fmt(totalVacation) + ' วัน', sub: 'รวมทุกคน', icon: 'sun', color: '#34D399' }
      ].map(k => `
'@

# We need to support \n and \r\n
if ($content.Contains($target2)) {
    $content = $content.Replace($target2, $replacement2)
} else {
    $target2_lf = $target2.Replace("`r`n", "`n")
    $replacement2_lf = $replacement2.Replace("`r`n", "`n")
    $content = $content.Replace($target2_lf, $replacement2_lf)
}

# 3. Format Table rows
$target3 = @'
                <td style="font-size:.75rem; text-align:center; color:${r.absent > 0 ? '#ef4444' : 'inherit'}; font-weight:${r.absent > 0 ? '700' : 'normal'}">${r.absent || 0}</td>
                <td style="font-size:.75rem; text-align:center; color:${r.lateTimes > 0 ? '#f59e0b' : 'inherit'}; font-weight:${r.lateTimes > 0 ? '700' : 'normal'}">${r.lateTimes || 0}</td>
                <td style="font-size:.75rem; text-align:center; color:${r.lateMins > 0 ? '#f59e0b' : 'inherit'}; font-weight:${r.lateMins > 0 ? '700' : 'normal'}">${r.lateMins || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.leaveEarlyTimes || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.leaveEarlyMins || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.forgetIn || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.forgetOut || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.sickLeave || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.personalLeave || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.vacationLeave || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.otherLeave || 0}</td>
'@
$replacement3 = @'
                <td style="font-size:.75rem; text-align:center; color:${r.absent > 0 ? '#ef4444' : 'inherit'}; font-weight:${r.absent > 0 ? '700' : 'normal'}">${fmt(r.absent)}</td>
                <td style="font-size:.75rem; text-align:center; color:${r.lateTimes > 0 ? '#f59e0b' : 'inherit'}; font-weight:${r.lateTimes > 0 ? '700' : 'normal'}">${fmt(r.lateTimes)}</td>
                <td style="font-size:.75rem; text-align:center; color:${r.lateMins > 0 ? '#f59e0b' : 'inherit'}; font-weight:${r.lateMins > 0 ? '700' : 'normal'}">${fmt(r.lateMins)}</td>
                <td style="font-size:.75rem; text-align:center">${fmt(r.leaveEarlyTimes)}</td>
                <td style="font-size:.75rem; text-align:center">${fmt(r.leaveEarlyMins)}</td>
                <td style="font-size:.75rem; text-align:center">${fmt(r.forgetIn)}</td>
                <td style="font-size:.75rem; text-align:center">${fmt(r.forgetOut)}</td>
                <td style="font-size:.75rem; text-align:center">${fmt(r.sickLeave)}</td>
                <td style="font-size:.75rem; text-align:center">${fmt(r.personalLeave)}</td>
                <td style="font-size:.75rem; text-align:center">${fmt(r.vacationLeave)}</td>
                <td style="font-size:.75rem; text-align:center">${fmt(r.otherLeave)}</td>
'@

if ($content.Contains($target3)) {
    $content = $content.Replace($target3, $replacement3)
} else {
    $target3_lf = $target3.Replace("`r`n", "`n")
    $replacement3_lf = $replacement3.Replace("`r`n", "`n")
    $content = $content.Replace($target3_lf, $replacement3_lf)
}

[System.IO.File]::WriteAllText("c:\antigravity-project\js\pages.js", $content, [System.Text.Encoding]::UTF8)
Write-Host "Formatting applied"
