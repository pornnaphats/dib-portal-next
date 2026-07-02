const fs = require('fs');
const filepath = "c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyQcPlanLogic.js";

let content = fs.readFileSync(filepath, 'utf8');

const oldButtonsBlock = `          <button class="btn" onclick="qcClearFilters()" style="height:34px; padding:0 14px; font-size:.75rem; border-radius: var(--radius-sm); background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2); display:flex; align-items:center; gap:4px; cursor:pointer; font-weight:600; font-family:'Prompt';">
             <i data-lucide="rotate-ccw" style="width:12px; height:12px"></i> Clear All Filter
          </button>
          <div style="width:1px; height:20px; background:#e2e8f0; margin:0 2px"></div>

          <button class="btn" onclick="qcShowManageEmployeesModal()" style="height:34px; padding:0 14px; font-size:.75rem; border-radius: var(--radius-sm); background: var(--surface); color:#475569; border:1px solid #cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-family:'Prompt';">
             <i data-lucide="users" style="width:14px; height:14px"></i> จัดการพนักงาน
          </button>
          
          <button class="btn" onclick="qcShowSettingsModal()" style="height:34px; padding:0 14px; font-size:.75rem; border-radius: var(--radius-sm); background: var(--surface); color:#475569; border:1px solid #cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-family:'Prompt';">
             <i data-lucide="settings" style="width:14px; height:14px"></i> ตั้งค่า % งาน
          </button>


          <button class="btn-auto-plan" onclick="qcShowAutoPlanModal()" style="height:34px; display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg, #8b5cf6, #6d28d9); color:#fff; border:none; border-radius: var(--radius-sm); padding:0 16px; font-size:0.8rem; font-weight:600; cursor:pointer; font-family:'Prompt'; box-shadow: var(--shadow); margin-top:0; transition: all 0.2s;">
            <i data-lucide="zap" style="width:14px; height:14px;"></i> จัดแผนงานอัตโนมัติ
          </button>`;

const newButtonsBlock = `          <button class="btn btn-danger" onclick="qcClearFilters()" style="height:38px; padding:0 20px; font-size:.8rem; border-radius: 99px; background:rgba(239,68,68,0.08); color:#ef4444; border:none; display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-family:'Prompt'; transition: all 0.2s;">
             <i data-lucide="rotate-ccw" style="width:14px; height:14px"></i> Clear All Filter
          </button>
          <div style="width:1px; height:20px; background:#e2e8f0; margin:0 2px"></div>

          <button class="btn btn-secondary" onclick="qcShowManageEmployeesModal()" style="height:38px; padding:0 20px; font-size:.8rem; border-radius: 99px; background: #f1f5f9; color:#475569; border:none; display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-family:'Prompt'; transition: all 0.2s;">
             <i data-lucide="users" style="width:14px; height:14px"></i> จัดการพนักงาน
          </button>
          
          <button class="btn btn-secondary" onclick="qcShowSettingsModal()" style="height:38px; padding:0 20px; font-size:.8rem; border-radius: 99px; background: #f1f5f9; color:#475569; border:none; display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-family:'Prompt'; transition: all 0.2s;">
             <i data-lucide="settings" style="width:14px; height:14px"></i> ตั้งค่า % งาน
          </button>

          <button class="btn btn-primary" onclick="qcShowAutoPlanModal()" style="height:38px; display:inline-flex; align-items:center; gap:6px; background:var(--primary); color:#fff; border:none; border-radius: 99px; padding:0 20px; font-size:0.8rem; font-weight:600; cursor:pointer; font-family:'Prompt'; box-shadow: 0 4px 12px rgba(108, 92, 231, 0.2); transition: all 0.2s;">
            <i data-lucide="zap" style="width:14px; height:14px;"></i> จัดแผนงานอัตโนมัติ
          </button>`;

content = content.replace(oldButtonsBlock, newButtonsBlock);
content = content.replace(oldButtonsBlock.replace(/\n/g, '\r\n'), newButtonsBlock.replace(/\n/g, '\r\n'));

fs.writeFileSync(filepath, content, 'utf8');
console.log("Updated buttons successfully!");
