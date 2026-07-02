const fs = require('fs');
const filepath = "c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyHolidayLogic.js";

let content = fs.readFileSync(filepath, 'utf8');

// 1. Search Box
const oldSearch = `    const searchHtml = \`
      <div class="search-box" style="width: 200px; background: var(--surface); height: 34px; display: flex; align-items: center; position: relative; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden">
        <i data-lucide="search" style="width: 14px; height: 14px; position: absolute; left: 12px; color: var(--text-3)"></i>
        <input type="text" id="holidaySearch" placeholder="Search..." style="padding: 0 12px 0 32px; height: 100%; width: 100%; border: none; outline: none; background: transparent; font-size: 0.8rem" onkeyup="filterTable('holidayTable', 'holidaySearch')">
      </div>
    \`;`;

const newSearch = `    const searchHtml = \`
      <div class="search-box" style="width: 200px; background: #f1f5f9; height: 38px; display: flex; align-items: center; position: relative; border: none; border-radius: 99px; overflow: hidden">
        <i data-lucide="search" style="width: 14px; height: 14px; position: absolute; left: 16px; color: var(--text-3)"></i>
        <input type="text" id="holidaySearch" placeholder="Search..." style="padding: 0 16px 0 36px; height: 100%; width: 100%; border: none; outline: none; background: transparent; font-size: 0.8rem" onkeyup="filterTable('holidayTable', 'holidaySearch')">
      </div>
    \`;`;

content = content.replace(oldSearch, newSearch);
content = content.replace(oldSearch.replace(/\n/g, '\r\n'), newSearch.replace(/\n/g, '\r\n'));

// 2. Action Bar
const oldActionBar = `      <!-- Top Action Bar -->
      <div style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:24px; gap:8px">
        <div style="height:34px; display:flex; align-items:center">
          \${typeof renderDateFilter === 'function' ? renderDateFilter("navigate('public-holiday')", 'above', null, true, searchHtml) : ''}
        </div>
        <button onclick="window.openManageTemplatesModal()" class="btn" style="display:flex; align-items:center; gap:6px; padding:0 16px; border-radius: var(--radius-sm); height:34px; font-size:.7rem; font-weight:600; flex-shrink:0; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
          <i data-lucide="settings" style="width:14px; height:14px"></i> จัดการชุดงาน (Templates)
        </button>
      </div>`;

const newActionBar = `      <!-- Top Action Bar -->
      <div style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:24px; gap:8px">
        <div style="height:38px; display:flex; align-items:center">
          \${typeof renderDateFilter === 'function' ? renderDateFilter("navigate('public-holiday')", 'above', null, true, searchHtml) : ''}
        </div>
        <button onclick="window.openManageTemplatesModal()" class="btn btn-secondary" style="display:flex; align-items:center; gap:6px; padding:0 20px; border-radius: 99px; height:38px; font-size:.8rem; font-weight:600; flex-shrink:0; background:#f1f5f9; color:#475569; border:none; cursor:pointer; transition: background 0.2s;">
          <i data-lucide="settings" style="width:14px; height:14px"></i> จัดการชุดงาน (Templates)
        </button>
      </div>`;

content = content.replace(oldActionBar, newActionBar);
content = content.replace(oldActionBar.replace(/\n/g, '\r\n'), newActionBar.replace(/\n/g, '\r\n'));

// 3. Stats Cards
const oldStats = `      <!-- STATS CARDS -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px">
        <!-- Card 1 -->
        <div class="card" style="display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 20px">
          <div style="width: 54px; height: 54px; border-radius: var(--radius); background: rgba(99, 102, 241, 0.1); color: #6366f1; display: flex; align-items: center; justify-content: center">
            <i data-lucide="calendar" style="width: 28px; height: 28px"></i>
          </div>
          <div>
            <div style="font-size: .8rem; color: #64748b; margin-bottom: 4px">วันหยุดทั้งหมด</div>
            <div style="display: flex; align-items: baseline; gap: 8px">
              <span style="font-size: 1.8rem; font-weight: 700; color: #1e293b">\${stats.total}</span>
              <span style="font-size: .8rem; color: #64748b">วัน</span>
            </div>
            <div style="font-size: .7rem; color: #94a3b8; margin-top: 4px">ข้อมูลทั้งหมด</div>
          </div>
        </div>
        <!-- Card 2 -->
        <div class="card" style="display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 20px">
          <div style="width: 54px; height: 54px; border-radius: var(--radius); background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center">
            <i data-lucide="check-circle" style="width: 28px; height: 28px"></i>
          </div>
          <div>
            <div style="font-size: .8rem; color: #64748b; margin-bottom: 4px">วันหยุดทั้งหมด</div>
            <div style="display: flex; align-items: baseline; gap: 8px">
              <span style="font-size: 1.8rem; font-weight: 700; color: #1e293b">\${stats.finished}</span>
              <span style="font-size: .8rem; color: #64748b">วัน</span>
            </div>
            <div style="font-size: .7rem; color: #10b981; font-weight: 600; margin-top: 4px">\${finishedPct}%</div>
          </div>
        </div>
        <!-- Card 3 -->
        <div class="card" style="display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 20px">
          <div style="width: 54px; height: 54px; border-radius: var(--radius); background: rgba(245, 158, 11, 0.1); color: #f59e0b; display: flex; align-items: center; justify-content: center">
            <i data-lucide="clock" style="width: 28px; height: 28px"></i>
          </div>
          <div>
            <div style="font-size: .8rem; color: #64748b; margin-bottom: 4px">วันหยุดทั้งหมด</div>
            <div style="display: flex; align-items: baseline; gap: 8px">
              <span style="font-size: 1.8rem; font-weight: 700; color: #1e293b">\${stats.upcoming}</span>
              <span style="font-size: .8rem; color: #64748b">วัน</span>
            </div>
            <div style="font-size: .7rem; color: #f59e0b; font-weight: 600; margin-top: 4px">\${upcomingPct}%</div>
          </div>
        </div>
        <!-- Card 4 -->
        <div class="card" style="display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 20px">
          <div style="width: 54px; height: 54px; border-radius: var(--radius); background: rgba(99, 102, 241, 0.1); color: #818cf8; display: flex; align-items: center; justify-content: center">
            <i data-lucide="calendar-plus" style="width: 28px; height: 28px"></i>
          </div>
          <div>
            <div style="font-size: .8rem; color: #64748b; margin-bottom: 4px">วันหยุดทั้งหมด</div>
            <div style="display: flex; align-items: baseline; gap: 8px">
              <span style="font-size: 1.8rem; font-weight: 700; color: #1e293b">\${stats.not_scheduled}</span>
              <span style="font-size: .8rem; color: #64748b">วัน</span>
            </div>
            <div style="font-size: .7rem; color: #818cf8; font-weight: 600; margin-top: 4px">\${notScheduledPct}%</div>
          </div>
        </div>
      </div>`;

const newStats = `      <!-- STATS CARDS -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px">
        <!-- Card 1 -->
        <div class="stat-card fade-in" style="padding: 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
          <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(99, 102, 241, 0.1); color: #6366f1; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="calendar" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">วันหยุดทั้งหมด</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text)">
              \${stats.total} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
            </div>
            <div style="font-size: .65rem; color: #6366f1; font-weight: 600; margin-top: 4px">ข้อมูลทั้งหมด</div>
          </div>
        </div>
        <!-- Card 2 -->
        <div class="stat-card fade-in delay-1" style="padding: 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
          <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="check-circle" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">วันหยุดเสร็จสิ้นแล้ว</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text)">
              \${stats.finished} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
            </div>
            <div style="font-size: .65rem; color: #10b981; font-weight: 600; margin-top: 4px">\${finishedPct}% ของทั้งหมด</div>
          </div>
        </div>
        <!-- Card 3 -->
        <div class="stat-card fade-in delay-2" style="padding: 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
          <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(245, 158, 11, 0.1); color: #f59e0b; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="clock" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">วันหยุดกำลังจะถึง</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text)">
              \${stats.upcoming} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
            </div>
            <div style="font-size: .65rem; color: #f59e0b; font-weight: 600; margin-top: 4px">\${upcomingPct}% ของทั้งหมด</div>
          </div>
        </div>
        <!-- Card 4 -->
        <div class="stat-card fade-in delay-3" style="padding: 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
          <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(99, 102, 241, 0.1); color: #818cf8; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="calendar-plus" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">ยังไม่ได้จัดแผน</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text)">
              \${stats.not_scheduled} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
            </div>
            <div style="font-size: .65rem; color: #818cf8; font-weight: 600; margin-top: 4px">\${notScheduledPct}% ของทั้งหมด</div>
          </div>
        </div>
      </div>`;

content = content.replace(oldStats, newStats);
content = content.replace(oldStats.replace(/\n/g, '\r\n'), newStats.replace(/\n/g, '\r\n'));

// 4. Year Selector Dropdown
content = content.replace('class="select-input" style="width: 140px; padding: 6px 12px; border-radius: var(--radius-sm); font-size: .8rem"', 'class="select-input" style="width: 160px; height: 38px;"');

fs.writeFileSync(filepath, content, 'utf8');
console.log("Public Holiday design updated!");
