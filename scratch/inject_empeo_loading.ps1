$content = [System.IO.File]::ReadAllText("c:\antigravity-project\js\pages.js")

$target = @'
window.renderEmpeoReport = function() {
  const data = window.DATA.empeoReport || [];
  const fmt = (n) => Number(n || 0).toLocaleString();
  
  // Calculate totals
'@

$replacement = @'
window.loadEmpeoData = async function() {
    if (window._empeoDataLoaded || window._empeoDataLoading) return;
    window._empeoDataLoading = true;
    if (window._leaveActiveTab === 'empeo') navigate('leave-management'); // Trigger loading state
    
    try {
        const res = await fetch('https://script.google.com/macros/s/AKfycby-XHUp4Qd3-TULEDQHbZmDU8hGQI_OX69fGcACVpeg_feJn4zquylze2qOM_OSZ70l/exec');
        const json = await res.json();
        window.DATA.empeoRaw = json;
        window.DATA.empeoMonths = Object.keys(json).sort().reverse(); // Show latest first based on name
        if(window.DATA.empeoMonths.length > 0) {
            window.DATA.empeoCurrentMonth = window.DATA.empeoMonths[0];
            window.DATA.empeoReport = json[window.DATA.empeoCurrentMonth] || [];
        } else {
            window.DATA.empeoCurrentMonth = null;
            window.DATA.empeoReport = [];
        }
        window._empeoDataLoaded = true;
    } catch(e) {
        console.error(e);
    } finally {
        window._empeoDataLoading = false;
        if (window._leaveActiveTab === 'empeo') navigate('leave-management'); // Re-render with data
    }
};

window.changeEmpeoMonth = function(month) {
    window.DATA.empeoCurrentMonth = month;
    window.DATA.empeoReport = window.DATA.empeoRaw[month] || [];
    navigate('leave-management');
};

window.renderEmpeoReport = function() {
  if (!window._empeoDataLoaded) {
      window.loadEmpeoData();
      return `
        <div style="padding:100px 0; text-align:center; color:var(--text-3)">
            <i data-lucide="loader-2" class="spin" style="width:40px; height:40px; color:var(--primary); margin-bottom:16px"></i>
            <div style="font-size:1.1rem; font-weight:600">ข้อมูลจาก Google Drive...</div>
            <div style="font-size:.8rem; margin-top:8px">ระบบกำลังตรวจสอบโฟลเดอร์และอ่านไฟล์ Google Sheets อัตโนมัติ</div>
        </div>
      `;
  }

  const data = window.DATA.empeoReport || [];
  const fmt = (n) => Number(n || 0).toLocaleString();
  
  // Calculate totals
'@

if ($content.Contains($target)) {
    $content = $content.Replace($target, $replacement)
} else {
    $target_lf = $target.Replace("`r`n", "`n")
    $replacement_lf = $replacement.Replace("`r`n", "`n")
    $content = $content.Replace($target_lf, $replacement_lf)
}

[System.IO.File]::WriteAllText("c:\antigravity-project\js\pages.js", $content, [System.Text.Encoding]::UTF8)
Write-Host "Injected loadEmpeoData and loading state"
