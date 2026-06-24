$content = [System.IO.File]::ReadAllText("c:\antigravity-project\js\pages.js")

$target = @'
    <!-- KPI Row -->
    <div class="fade-in" style="display:grid; grid-template-columns:repeat(6,1fr); gap:16px; margin-bottom:24px">
      ${[
          { label: 'ยอดการลาทั้งหมด', val: stats.total, sub: 'รายการทั้งหมดในระบบ', icon: 'calendar', color: '#A5B4FC' },
          { label: 'อนุมัติแล้ว', val: stats.approved, sub: pctApproved + '% ของทั้งหมด', icon: 'check-circle', color: '#7FD1B9' },
          { label: 'รอการอนุมัติ', val: stats.pending, sub: pctPending + '% ของทั้งหมด', icon: 'clock', color: '#FDE68A' },
          { label: 'ไม่อนุมัติ', val: stats.rejected, sub: pctRejected + '% ของทั้งหมด', icon: 'x-circle', color: '#FCA5A5' },
          { label: 'จำนวนผู้ลา', val: stats.peopleOnLeave, sub: 'จากทั้งหมด ' + totalEmp + ' คน', icon: 'users', color: '#93C5FD' },
          { label: 'วันลาทั้งหมด', val: stats.totalDays, sub: 'รวมทุกประเภทการลา', icon: 'file-text', color: '#C084FC' }
      ].map(k => `
'@

$replacement = @'
    <!-- KPI Row -->
    <div class="fade-in" style="display:grid; grid-template-columns:repeat(6,1fr); gap:16px; margin-bottom:24px">
      ${[
          { label: 'ยอดการลาทั้งหมด', val: Number(stats.total).toLocaleString(), sub: 'รายการทั้งหมดในระบบ', icon: 'calendar', color: '#A5B4FC' },
          { label: 'อนุมัติแล้ว', val: Number(stats.approved).toLocaleString(), sub: pctApproved + '% ของทั้งหมด', icon: 'check-circle', color: '#7FD1B9' },
          { label: 'รอการอนุมัติ', val: Number(stats.pending).toLocaleString(), sub: pctPending + '% ของทั้งหมด', icon: 'clock', color: '#FDE68A' },
          { label: 'ไม่อนุมัติ', val: Number(stats.rejected).toLocaleString(), sub: pctRejected + '% ของทั้งหมด', icon: 'x-circle', color: '#FCA5A5' },
          { label: 'จำนวนผู้ลา', val: Number(stats.peopleOnLeave).toLocaleString(), sub: 'จากทั้งหมด ' + totalEmp.toLocaleString() + ' คน', icon: 'users', color: '#93C5FD' },
          { label: 'วันลาทั้งหมด', val: Number(stats.totalDays).toLocaleString(), sub: 'รวมทุกประเภทการลา', icon: 'file-text', color: '#C084FC' }
      ].map(k => `
'@

if ($content.Contains($target)) {
    $content = $content.Replace($target, $replacement)
} else {
    $target_lf = $target.Replace("`r`n", "`n")
    $replacement_lf = $replacement.Replace("`r`n", "`n")
    $content = $content.Replace($target_lf, $replacement_lf)
}

$target_tabs = @'
            <button class="tab-btn active leave-tab" onclick="filterLeaveTable('all', this)" style="padding:6px 12px; font-size:.7rem">ทั้งหมด (${stats.total})</button>
            <button class="tab-btn leave-tab" onclick="filterLeaveTable('pending', this)" style="padding:6px 12px; font-size:.7rem">รอการอนุมัติ (${stats.pending})</button>
            <button class="tab-btn leave-tab" onclick="filterLeaveTable('approved', this)" style="padding:6px 12px; font-size:.7rem">อนุมัติแล้ว (${stats.approved})</button>
            <button class="tab-btn leave-tab" onclick="filterLeaveTable('rejected', this)" style="padding:6px 12px; font-size:.7rem">ไม่อนุมัติ (${stats.rejected})</button>
'@

$replacement_tabs = @'
            <button class="tab-btn active leave-tab" onclick="filterLeaveTable('all', this)" style="padding:6px 12px; font-size:.7rem">ทั้งหมด (${Number(stats.total).toLocaleString()})</button>
            <button class="tab-btn leave-tab" onclick="filterLeaveTable('pending', this)" style="padding:6px 12px; font-size:.7rem">รอการอนุมัติ (${Number(stats.pending).toLocaleString()})</button>
            <button class="tab-btn leave-tab" onclick="filterLeaveTable('approved', this)" style="padding:6px 12px; font-size:.7rem">อนุมัติแล้ว (${Number(stats.approved).toLocaleString()})</button>
            <button class="tab-btn leave-tab" onclick="filterLeaveTable('rejected', this)" style="padding:6px 12px; font-size:.7rem">ไม่อนุมัติ (${Number(stats.rejected).toLocaleString()})</button>
'@

if ($content.Contains($target_tabs)) {
    $content = $content.Replace($target_tabs, $replacement_tabs)
} else {
    $target_tabs_lf = $target_tabs.Replace("`r`n", "`n")
    $replacement_tabs_lf = $replacement_tabs.Replace("`r`n", "`n")
    $content = $content.Replace($target_tabs_lf, $replacement_tabs_lf)
}


[System.IO.File]::WriteAllText("c:\antigravity-project\js\pages.js", $content, [System.Text.Encoding]::UTF8)
Write-Host "Formatting applied to overview"
