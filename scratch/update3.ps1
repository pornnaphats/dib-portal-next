$content = Get-Content js/pages.js -Raw -Encoding UTF8

# 1. Add Empeo Tab in pageLeaveManagement
$oldLeaveHeader = @'
  <!-- Top Action Bar -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
    <div style="font-size:1.1rem; font-weight:700; color:var(--text)"></div>
    <div style="display:flex; gap:12px; align-items:center">
'@

$newLeaveHeader = @'
  <!-- Top Action Bar -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
    <div style="display:flex; gap:8px;">
      <button class="tab-btn active" style="padding:10px 24px; border:none; background:#f1f5f9; color:var(--primary); font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
        <i data-lucide="layout-grid" style="width:18px; height:18px"></i> Overview
      </button>
      <button class="tab-btn" onclick="window.open('https://www.myempeo.com/', '_blank')" style="padding:10px 24px; border:none; background:none; color:var(--text-3); font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
        <i data-lucide="external-link" style="width:18px; height:18px"></i> Empeo
      </button>
    </div>
    <div style="display:flex; gap:12px; align-items:center">
'@

$content = $content.Replace($oldLeaveHeader, $newLeaveHeader)

# 2. Move Birthday panel to row 2 (change grid-template-columns to 1fr)
$content = $content -replace 'grid-template-columns:1fr 200px;', 'grid-template-columns:1fr;'
$content = $content -replace 'grid-template-columns:1fr 230px;', 'grid-template-columns:1fr;'
$content = $content -replace 'grid-template-columns:1fr 260px;', 'grid-template-columns:1fr;'
$content = $content -replace 'grid-template-columns:1fr 340px;', 'grid-template-columns:1fr;'

Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Success!"
