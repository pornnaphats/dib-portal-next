$content = [System.IO.File]::ReadAllText("c:\antigravity-project\js\pages.js")

$target = @'
        <div style="font-size:.9rem; font-weight:700">รายงานการเข้างาน (Empeo)</div>
        <div class="search-box" style="width:250px; background:#f8fafc; padding:8px 12px; border:1px solid var(--border); border-radius:10px">
'@

$replacement = @'
        <div style="font-size:.9rem; font-weight:700">รายงานการเข้างาน (Empeo)</div>
        <div style="display:flex; gap:12px; align-items:center;">
          <select id="empeoMonthSelect" onchange="window.changeEmpeoMonth(this.value)" style="padding:6px 12px; border-radius:8px; border:1px solid var(--border); font-family:'Kanit'; font-size:.8rem; background:#fff; outline:none; cursor:pointer">
            ${window.DATA.empeoMonths && window.DATA.empeoMonths.length > 0 ? 
              window.DATA.empeoMonths.map(m => `<option value="${m}" ${m === window.DATA.empeoCurrentMonth ? 'selected' : ''}>${m}</option>`).join('')
              : '<option>ไม่มีข้อมูลเดือน</option>'
            }
          </select>
          <div class="search-box" style="width:250px; background:#f8fafc; padding:8px 12px; border:1px solid var(--border); border-radius:10px; display:flex; align-items:center; gap:8px">
'@

if ($content.Contains($target)) {
    $content = $content.Replace($target, $replacement)
} else {
    $target_lf = $target.Replace("`r`n", "`n")
    $replacement_lf = $replacement.Replace("`r`n", "`n")
    $content = $content.Replace($target_lf, $replacement_lf)
}

# Also need to fix the closing div for the new flex wrapper
$target2 = @'
          <input type="text" id="empeoSearch" onkeyup="window.filterEmpeoTable(this.value)" placeholder="ค้นหาชื่อพนักงาน..." style="background:none; border:none; outline:none; font-size:.7rem; width:100%; font-family:'Kanit', sans-serif; color:var(--text)">
        </div>
      </div>
      <div class="table-wrap" style="overflow-x:auto; max-height: 600px">
'@

$replacement2 = @'
          <input type="text" id="empeoSearch" onkeyup="window.filterEmpeoTable(this.value)" placeholder="ค้นหาชื่อพนักงาน..." style="background:none; border:none; outline:none; font-size:.7rem; width:100%; font-family:'Kanit', sans-serif; color:var(--text)">
          </div>
        </div>
      </div>
      <div class="table-wrap" style="overflow-x:auto; max-height: 600px">
'@

if ($content.Contains($target2)) {
    $content = $content.Replace($target2, $replacement2)
} else {
    $target2_lf = $target2.Replace("`r`n", "`n")
    $replacement2_lf = $replacement2.Replace("`r`n", "`n")
    $content = $content.Replace($target2_lf, $replacement2_lf)
}

[System.IO.File]::WriteAllText("c:\antigravity-project\js\pages.js", $content, [System.Text.Encoding]::UTF8)
Write-Host "Injected dropdown"
