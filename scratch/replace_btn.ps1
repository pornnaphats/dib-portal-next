$lines = Get-Content "c:\antigravity-project\js\pages.js" -Encoding UTF8

# The bad block that was injected at 5144:
$badBlock = @'
                <div class="tabs" style="display:flex; gap:8px; background:#fff; padding:6px; border-radius:16px; border:1px solid var(--border); box-shadow:var(--shadow-sm); margin-bottom:0">
        <button class="tab-btn ${window._leaveActiveTab !== 'empeo' ? 'active' : ''}" onclick="window._leaveActiveTab='overview'; navigate('leave-management')" style="padding:10px 24px; border:none; background:${window._leaveActiveTab !== 'empeo' ? '#f1f5f9' : 'none'}; color:${window._leaveActiveTab !== 'empeo' ? 'var(--primary)' : 'var(--text-3)'}; font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
          <i data-lucide="layout-grid" style="width:18px; height:18px"></i> Overview
        </button>
        <button class="tab-btn ${window._leaveActiveTab === 'empeo' ? 'active' : ''}" onclick="window._leaveActiveTab='empeo'; navigate('leave-management')" style="padding:10px 24px; border:none; background:${window._leaveActiveTab === 'empeo' ? '#f1f5f9' : 'none'}; color:${window._leaveActiveTab === 'empeo' ? 'var(--primary)' : 'var(--text-3)'}; font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
          <i data-lucide="bar-chart-2" style="width:18px; height:18px"></i> Empeo Report
        </button>
      </div>
'@
$goodBlock1 = ""

# The old button at ~5600:
$oldBtnBlock = @'
      <div class="tabs" style="display:flex; gap:8px; background:#fff; padding:6px; border-radius:16px; border:1px solid var(--border); box-shadow:var(--shadow-sm); margin-bottom:0">
        <button class="tab-btn active" style="padding:10px 24px; border:none; background:#f1f5f9; color:var(--primary); font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
          <i data-lucide="layout-grid" style="width:18px; height:18px"></i> Overview
        </button>
        <button class="tab-btn" onclick="window.open('https://www.empeocms.com/', '_blank')" style="padding:10px 24px; border:none; background:none; color:var(--text-3); font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
          <i data-lucide="external-link" style="width:18px; height:18px"></i> Empeo
        </button>
      </div>
'@

# The new button at ~5600:
$newBtnBlock = @'
      <div class="tabs" style="display:flex; gap:8px; background:#fff; padding:6px; border-radius:16px; border:1px solid var(--border); box-shadow:var(--shadow-sm); margin-bottom:0">
        <button class="tab-btn ${window._leaveActiveTab !== 'empeo' ? 'active' : ''}" onclick="window._leaveActiveTab='overview'; navigate('leave-management')" style="padding:10px 24px; border:none; background:${window._leaveActiveTab !== 'empeo' ? '#f1f5f9' : 'none'}; color:${window._leaveActiveTab !== 'empeo' ? 'var(--primary)' : 'var(--text-3)'}; font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
          <i data-lucide="layout-grid" style="width:18px; height:18px"></i> Overview
        </button>
        <button class="tab-btn ${window._leaveActiveTab === 'empeo' ? 'active' : ''}" onclick="window._leaveActiveTab='empeo'; navigate('leave-management')" style="padding:10px 24px; border:none; background:${window._leaveActiveTab === 'empeo' ? '#f1f5f9' : 'none'}; color:${window._leaveActiveTab === 'empeo' ? 'var(--primary)' : 'var(--text-3)'}; font-weight:700; border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
          <i data-lucide="bar-chart-2" style="width:18px; height:18px"></i> Empeo Report
        </button>
      </div>
'@

# PowerShell reads as string array. Let's merge it, replace, and rewrite.
$rawText = [System.IO.File]::ReadAllText("c:\antigravity-project\js\pages.js")

# Fix line endings of the blocks to match what's in the file.
# The file has either \r\n or \n. We'll replace with Regex to ignore \r
$badBlockRegex = '(?s)\s*<div class="tabs".*?navigate\(''leave-management''\).*?Empeo Report.*?</div>'
# Actually it's safer to just iterate and find it.
# Let's do exact array replacement.
