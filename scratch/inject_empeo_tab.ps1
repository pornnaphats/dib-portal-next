$content = Get-Content js/pages.js -Raw -Encoding UTF8

$oldStart = "  // ---------- LEAVE MANAGEMENT ----------`r`n  function pageLeaveManagement() {`r`n    setTimeout(initLeaveCharts, 100);"
$newStart = "  // ---------- LEAVE MANAGEMENT ----------`r`n  function pageLeaveManagement() {`r`n    window._leaveActiveTab = window._leaveActiveTab || 'overview';`r`n    if (window._leaveActiveTab === 'overview') { setTimeout(initLeaveCharts, 100); }"

$content = $content.Replace($oldStart, $newStart)

# Make the buttons toggle window._leaveActiveTab
$oldButtons = '      <button class="tab-btn active" style="padding:10px 24px; border:none; background:#f1f5f9; color:var(--primary); font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
        <i data-lucide="layout-grid" style="width:18px; height:18px"></i> Overview
      </button>
      <button class="tab-btn" onclick="window.open(''https://www.empeocms.com/'', ''_blank'')" style="padding:10px 24px; border:none; background:none; color:var(--text-3); font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
        <i data-lucide="external-link" style="width:18px; height:18px"></i> Empeo
      </button>'

$newButtons = '      <button onclick="window._leaveActiveTab=''overview''; navigate(''leave-management'')" class="tab-btn ${window._leaveActiveTab === ''overview'' ? ''active'' : ''''}" style="padding:10px 24px; border:none; background:${window._leaveActiveTab === ''overview'' ? ''#f1f5f9'' : ''transparent''}; color:${window._leaveActiveTab === ''overview'' ? ''var(--primary)'' : ''var(--text-3)''}; font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
        <i data-lucide="layout-grid" style="width:18px; height:18px"></i> Overview
      </button>
      <button onclick="window._leaveActiveTab=''empeo''; navigate(''leave-management'')" class="tab-btn ${window._leaveActiveTab === ''empeo'' ? ''active'' : ''''}" style="padding:10px 24px; border:none; background:${window._leaveActiveTab === ''empeo'' ? ''#f1f5f9'' : ''transparent''}; color:${window._leaveActiveTab === ''empeo'' ? ''var(--primary)'' : ''var(--text-3)''}; font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
        <i data-lucide="file-text" style="width:18px; height:18px"></i> Empeo Report
      </button>'

$content = $content.Replace($oldButtons, $newButtons)

Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Replaced buttons and logic"
