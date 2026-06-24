$content = [System.IO.File]::ReadAllText("c:\antigravity-project\js\pages.js")

# Step 1: Remove from renderEmpeoReport
$target1 = @'
      <div style="padding:20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
        <div style="font-size:.9rem; font-weight:700">รายงานการเข้างาน (Empeo)</div>
        <div style="display:flex; gap:12px; align-items:center;">
          <select id="empeoMonthSelect" onchange="window.changeEmpeoMonth(this.value)" style="padding:6px 12px; border-radius:8px; border:1px solid var(--border); font-family:'Kanit'; font-size:.8rem; background:#fff; outline:none; cursor:pointer">
            ${window.DATA.empeoMonths && window.DATA.empeoMonths.length > 0 ? 
              window.DATA.empeoMonths.map(m => `<option value="${m}" ${m === window.DATA.empeoCurrentMonth ? 'selected' : ''}>${m}</option>`).join('')
              : '<option>ไม่มีข้อมูลเดือน</option>'
            }
          </select>
          <div class="search-box" style="width:250px; background:#f8fafc; padding:8px 12px; border:1px solid var(--border); border-radius:10px; display:flex; align-items:center; gap:8px">
          <i data-lucide="search" style="width:14px; height:14px; color:var(--text-3)"></i>
          <input type="text" id="empeoSearch" onkeyup="window.filterEmpeoTable(this.value)" placeholder="ค้นหาชื่อพนักงาน..." style="background:none; border:none; outline:none; font-size:.7rem; width:100%; font-family:'Kanit', sans-serif; color:var(--text)">
          </div>
        </div>
      </div>
'@

$replacement1 = @'
      <div style="padding:20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
        <div style="font-size:.9rem; font-weight:700">รายงานการเข้างาน (Empeo)</div>
      </div>
'@

$target1_lf = $target1.Replace("`r`n", "`n")
$replacement1_lf = $replacement1.Replace("`r`n", "`n")
$content = $content.Replace($target1_lf, $replacement1_lf)

# Step 2: Inject into pageLeaveManagement
$target2 = @'
    <div style="display:flex; gap:12px; align-items:center">
      ${renderDateFilter("window._isDateFiltering=true; navigate('leave-management')")}
    </div>
'@

$replacement2 = @'
    <div style="display:flex; gap:12px; align-items:center">
      ${window._leaveActiveTab === 'empeo' ? `
        <select id="empeoMonthSelect" onchange="window.changeEmpeoMonth(this.value)" style="padding:8px 12px; border-radius:8px; border:1px solid var(--border); font-family:'Kanit'; font-size:.8rem; background:#fff; outline:none; cursor:pointer">
          ${window.DATA.empeoMonths && window.DATA.empeoMonths.length > 0 ? 
            window.DATA.empeoMonths.map(m => \`<option value="\${m}" \${m === window.DATA.empeoCurrentMonth ? 'selected' : ''}>\${m}</option>\`).join('')
            : '<option>ไม่มีข้อมูลเดือน</option>'
          }
        </select>
        <div class="search-box" style="width:250px; background:#fff; padding:8px 12px; border:1px solid var(--border); border-radius:10px; display:flex; align-items:center; gap:8px">
          <i data-lucide="search" style="width:14px; height:14px; color:var(--text-3)"></i>
          <input type="text" id="empeoSearch" onkeyup="window.filterEmpeoTable(this.value)" placeholder="ค้นหาชื่อพนักงาน..." style="background:none; border:none; outline:none; font-size:.7rem; width:100%; font-family:'Kanit', sans-serif; color:var(--text)">
        </div>
      ` : ''}
      ${renderDateFilter("window._isDateFiltering=true; navigate('leave-management')")}
    </div>
'@

$target2_lf = $target2.Replace("`r`n", "`n")
$replacement2_lf = $replacement2.Replace("`r`n", "`n")
$content = $content.Replace($target2_lf, $replacement2_lf)

[System.IO.File]::WriteAllText("c:\antigravity-project\js\pages.js", $content, [System.Text.Encoding]::UTF8)
Write-Host "Moved Empeo UI controls"
