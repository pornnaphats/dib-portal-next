// ===== WORKSHIP PAGE (2 sub-pages) =====

// ---- helpers ----
function getMemberPosition(memberName) {
  if (!memberName) return 'Unknown';
  
  // 1. Try to find in window.WS_DATA.members
  let mem = window.WS_DATA.members.find(m => 
    (m.name && m.name.toLowerCase() === memberName.toLowerCase()) || 
    (m.id && m.id.toLowerCase() === memberName.toLowerCase())
  );
  if (mem && mem.level) return mem.level;

  // 2. Try to find in window.DATA.employees
  if (window.DATA && window.DATA.employees) {
    const emp = window.DATA.employees.find(e => 
      (e.id && e.id.toLowerCase() === memberName.toLowerCase()) ||
      (e.nickname && e.nickname.toLowerCase() === memberName.toLowerCase()) ||
      (e.name && e.name.toLowerCase() === memberName.toLowerCase()) ||
      (e.nameEn && e.nameEn.toLowerCase() === memberName.toLowerCase())
    );
    if (emp && emp.pos) return emp.pos;
  }
  return 'Unknown';
}

function countWorkingDays(startStr, endStr) {
  // Count all calendar days in the selected range
  let start, end;
  if (!startStr || !endStr) {
    if (window.WS_DATA.tasks.length === 0) return 30;
    const timestamps = window.WS_DATA.tasks.map(t => new Date(t.date).getTime());
    start = new Date(Math.min(...timestamps));
    end = new Date(Math.max(...timestamps));
  } else {
    start = new Date(startStr);
    end = new Date(endStr);
  }
  const diffMs = end.getTime() - start.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

function wsFilterTasks(dateFrom, dateTo, accFilter) {
  return window.WS_DATA.tasks.filter(t => {
    const d = new Date(t.date);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (from && d < from) return false;
    if (to && d > to) return false;
    if (accFilter && accFilter !== 'all' && t.acc !== accFilter) return false;
    return true;
  });
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function sumBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    acc[k] = (acc[k] || 0) + item.hours;
    return acc;
  }, {});
}

function colorForType(t) {
  return {
    Operation: 'var(--primary)',
    'Call Center': 'var(--accent)',
    Media: 'var(--warn)',
    AI: '#a855f7',
    Content: '#f97316',
    Graphic: '#ec4899',
    Production: '#84cc16',
    Meeting: '#10b981',
    Coordinator: '#3b82f6',
    Internal: '#8b5cf6',
    Adhoc: '#ef4444',
    Report: '#06b6d4',
  }[t] || 'var(--text-3)';
}

function colorForNode(n) {
  return {
    Monitor: '#2d6ef7',
    Report: '#06b6d4',
    AE: '#f59e0b',
    'Call Center': '#00c896',
    Content: '#f97316',
    Graphic: '#ec4899',
    AI: '#a855f7',
    Meeting: '#10b981',
    Coordinator: '#3b82f6',
    Internal: '#8b5cf6',
    Adhoc: '#ef4444',
    Production: '#84cc16',
    'Event & Seminar': '#f59e0b',
    Other: '#64748b',
  }[n] || '#64748b';
}

function colorForLevel(lv) {
  const l = String(lv).toLowerCase();
  if (l.includes('manager')) return '#a855f7';
  if (l.includes('senior')) return 'var(--warn)';
  if (l.includes('assistant') || l.includes('asistant')) return 'var(--accent)';
  if (l.includes('junior')) return 'var(--primary)';
  return 'var(--primary)';
}

function miniBarChart(data, colorFn) {
  const max = Math.max(...Object.values(data), 0.01);
  return `<div style="display:flex;flex-direction:column;gap:12px;margin-top:10px">
    ${Object.entries(data).map(([k, v]) => `
      <div style="display:flex;align-items:center;gap:10px">
        <span style="width:110px;font-size:.82rem;font-weight:600;color:var(--text-2);text-align:right;flex-shrink:0;line-height:1.2">${k}</span>
        <div style="flex:1;background:var(--border);border-radius:99px;height:14px;overflow:hidden">
          <div style="width:${Math.round(v / max * 100)}%;height:100%;border-radius:99px;background:${colorFn(k)};transition:width .5s ease"></div>
        </div>
        <span style="font-size:.77rem;color:var(--text-3);width:45px;text-align:right">${v.toFixed(2)}</span>
      </div>`).join('')}
  </div>`;
}

function donutSVG(data, colorFn, size = 100) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 0;
  let offset = 0;
  const r = 38, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  const slices = Object.entries(data).map(([k, v]) => {
    const pct = v / (total || 1);
    const dash = pct * circ;
    const svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colorFn(k)}"
      stroke-width="14" stroke-dasharray="${dash} ${circ - dash}"
      stroke-dashoffset="${-offset * circ}" transform="rotate(-90 ${cx} ${cy})" opacity=".85" />`;
    offset += pct;
    return svg;
  });
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="14"/>
    ${slices.join('')}
    <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle"
      style="font-size:11px;font-weight:700;fill:var(--text);font-family:Kanit,sans-serif">${total > 100 ? total.toLocaleString() : total.toFixed(2)}</text>
  </svg>`;
}

// ========================
// PAGE 1 — OVERVIEW
// ========================
function wsPageOverview(dateFrom = '', dateTo = '', rerender) {
  const tasks = wsFilterTasks(dateFrom, dateTo, null);
  const totalMembers = window.WS_DATA.members.length;
  const totalAccounts = window.WS_DATA.accounts.length;
  const workingDays = countWorkingDays(dateFrom, dateTo);
  const totalPercent = tasks.reduce((s, t) => s + t.hours, 0);
  const avgManpower = (totalPercent / workingDays / 100).toFixed(2);

  // 1. Calculate stats based on tasks
  const byNodeSum = sumBy(tasks, 'node');
  const types = Object.keys(byNodeSum).sort();

  // 2. Build Matrix (Manpower): Position (Level) x Node (Type)
  const matrix = {};
  const nodeManpowerCount = {}; // Total manpower per node

  tasks.forEach(t => {
    const level = getMemberPosition(t.member);
    const node = t.node || 'Monitor';

    if (!matrix[level]) matrix[level] = {};
    matrix[level][node] = (matrix[level][node] || 0) + t.hours;
    nodeManpowerCount[node] = (nodeManpowerCount[node] || 0) + t.hours;
  });

  // Convert to Manpower (hours / days / 100)
  const divisor = (workingDays * 100);
  Object.keys(matrix).forEach(lv => {
    Object.keys(matrix[lv]).forEach(n => {
      matrix[lv][n] = matrix[lv][n] / divisor;
    });
  });
  Object.keys(nodeManpowerCount).forEach(n => {
    nodeManpowerCount[n] = nodeManpowerCount[n] / divisor;
  });

  const levels = Object.keys(matrix).sort();
  const totalManpower = Object.values(nodeManpowerCount).reduce((a, b) => a + b, 0);

  const byAccount = sumBy(tasks, 'acc');
  const topAccounts = Object.entries(byAccount)
    .map(([acc, pct]) => [acc, (pct / divisor).toFixed(2)])
    .sort((a, b) => b[1] - a[1]);
  const maxPH = Math.max(...topAccounts.map(p => p[1]), 0.01);

  return `
  <!-- FILTERS -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; position:relative; z-index:100">
    <div style="display:flex; flex-direction:column; gap:4px">
      <h2 style="font-size:1.4rem; font-weight:700; color:var(--text); letter-spacing:-0.02em">Manpower Overview</h2>
      <p style="font-size:.82rem; color:var(--text-3)">Tracking team utilization and resource distribution</p>
    </div>
    <div style="display:flex; align-items:center; gap:12px; margin-left:auto; position:relative; z-index:100">
      ${renderDateFilter('wsReload1()')}
    </div>
  </div>

  <!-- STAT ROW (3 cards) -->
  <div class="stats-grid" style="grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:24px">
    <div class="stat-card" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
      <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4)">
        <i data-lucide="users" style="width: 20px; height: 20px"></i>
      </div>
      <div>
        <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">Team Capacity</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
          ${totalMembers.toLocaleString()} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">Members</span>
        </div>
        <div style="font-size: .65rem; color: var(--primary); font-weight: 600; margin-top: 4px">Active Members</div>
      </div>
    </div>
    <div class="stat-card" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
      <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--warn); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.4)">
        <i data-lucide="briefcase" style="width: 20px; height: 20px"></i>
      </div>
      <div>
        <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">Project Focus</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
          ${totalAccounts.toLocaleString()} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">Accounts</span>
        </div>
        <div style="font-size: .65rem; color: var(--warn); font-weight: 600; margin-top: 4px">Managed Accounts</div>
      </div>
    </div>
    <div class="stat-card" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
      <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4)">
        <i data-lucide="trending-up" style="width: 20px; height: 20px"></i>
      </div>
      <div>
        <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">Daily Manpower</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
          ${totalManpower.toFixed(2)} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">Manpower</span>
        </div>
        <div style="font-size: .65rem; color: var(--accent); font-weight: 600; margin-top: 4px">Avg. Load Per Day</div>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <!-- Donut by node -->
    <div class="card" style="border-radius:20px; box-shadow: var(--shadow)">
      <div class="card-title" style="margin-bottom:20px; font-weight:700">Manpower Distribution by Node</div>
      <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
        <div style="flex-shrink:0">${donutSVG(nodeManpowerCount, colorForNode, 130)}</div>
        <div style="flex:1; max-height:200px; overflow-y:auto">
          ${Object.entries(nodeManpowerCount).sort((a, b) => b[1] - a[1]).map(([t, c]) => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <div style="width:12px;height:12px;border-radius:3px;background:${colorForNode(t)};flex-shrink:0"></div>
              <span style="font-size:.85rem;font-weight:600">${t}</span>
              <span style="margin-left:auto;font-size:.85rem;font-weight:700">${c.toFixed(2)} Manpower</span>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Top accounts by manpower -->
    <div class="card" style="border-radius:20px; box-shadow: var(--shadow)">
      <div class="card-title" style="margin-bottom:20px; font-weight:700">Manpower by Account</div>
      <div style="max-height:220px; overflow-y:auto; padding-right:8px; display:flex; flex-direction:column; gap:10px">
        ${topAccounts.slice(0, 10).map(([acc, hrs], i) => `
          <div>
            <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:4px">
              <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:10px"><strong>${acc}</strong></span>
              <strong>${hrs} Manpower</strong>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${i === 0 ? 'red' : i === 1 ? 'yellow' : 'blue'}" style="width:${Math.round(hrs / maxPH * 100)}%"></div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Level x Node Matrix -->
  <div class="card" style="margin-top:18px">
    <div class="card-title">Manpower Matrix by Position & Node</div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Position (HR)</th>
            ${types.map(t => `<th style="color:${colorForNode(t)}; font-size:.72rem; text-align:center; min-width:80px">${t}</th>`).join('')}
            <th style="text-align:center">Total Manpower</th>
          </tr>
        </thead>
        <tbody>
          ${levels.map(lv => {
    const row = matrix[lv] || {};
    const rowTotal = types.reduce((s, t) => s + (row[t] || 0), 0);
    return `<tr>
              <td><div style="font-size:.8rem; font-weight:600">${lv}</div></td>
              ${types.map(t => {
      const val = row[t] || 0;
      return `<td style="text-align:center">${val > 0
        ? `<div style="display:inline-flex;align-items:center;justify-content:center;padding:0 8px;height:24px;border-radius: 50%; background:${colorForNode(t)}10;color:${colorForNode(t)};font-weight:600;font-size:.78rem">${val.toFixed(2)}</div>`
        : `<span style="color:var(--border)">—</span>`}</td>`;
    }).join('')}
              <td style="text-align:center"><strong>${rowTotal > 0 ? rowTotal.toFixed(2) : '—'}</strong></td>
            </tr>`;
  }).join('')}
          <tr style="background:var(--surface2)">
            <td><strong>Total Manpower by Node</strong></td>
            ${types.map(t => `<td style="text-align:center"><strong style="color:${colorForNode(t)}">${(nodeManpowerCount[t] || 0).toFixed(2)}</strong></td>`).join('')}
            <td style="text-align:center"><strong>${totalManpower.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

// ========================
// PAGE 2 — DETAIL
// ========================
function wsPageDetail(dateFrom = '', dateTo = '', accFilter = 'all', rerender) {
  const tasks = wsFilterTasks(dateFrom, dateTo, accFilter);
  const relevantMemberIds = [...new Set(tasks.map(t => t.member))];
  const activeMembers = window.WS_DATA.members.filter(m => relevantMemberIds.includes(m.id));
  const memberCount = accFilter === 'all' ? window.WS_DATA.members.length : activeMembers.length;

  const relevantAccIds = accFilter === 'all'
    ? [...new Set(window.WS_DATA.members.flatMap(m => m.account))]
    : [accFilter];
  const accCount = relevantAccIds.length;

  const workingDays = countWorkingDays(dateFrom, dateTo);
  const totalPercent = tasks.reduce((s, t) => s + t.hours, 0);
  const avgManpower = (totalPercent / workingDays / 100).toFixed(2);

  const relevantMembers = accFilter === 'all' ? window.WS_DATA.members : activeMembers;

  // Calculate Manpower by Level
  const byLevelSum = {};
  tasks.forEach(t => {
    const level = getMemberPosition(t.member);
    byLevelSum[level] = (byLevelSum[level] || 0) + t.hours;
  });
  const byLevelManpower = {};
  Object.entries(byLevelSum).forEach(([lv, pct]) => {
    byLevelManpower[lv] = (pct / workingDays / 100);
  });

  const byNodeSum = sumBy(tasks, 'node');
  const byNodeManpower = {};
  Object.entries(byNodeSum).forEach(([n, pct]) => {
    byNodeManpower[n] = (pct / workingDays / 100);
  });

  const nodes = Object.keys(byNodeManpower).sort((a, b) => byNodeManpower[b] - byNodeManpower[a]);
  const nodeTotalManpower = Object.values(byNodeManpower).reduce((a, b) => a + b, 0) || 0.01;

  // Optimization: Member lookup map
  const memberMap = {};
  window.WS_DATA.members.forEach(m => memberMap[m.id] = m.name);
  const displayTasks = tasks.slice(0, 150); // Show top 150 for performance

  return `
  <!-- FILTERS -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; position:relative; z-index:100">
    <div style="display:flex; flex-direction:column; gap:4px">
      <h2 style="font-size:1.4rem; font-weight:700; color:var(--text); letter-spacing:-0.02em">Detailed Analytics</h2>
      <p style="font-size:.82rem; color:var(--text-3)">Drill down into project and position specific data</p>
    </div>
    <div style="display:flex; align-items:center; gap:12px; margin-left:auto; position:relative; z-index:100">
      <select class="select-input" id="ws2Acc" onchange="wsReload2()" style="min-width:180px; height:38px; border-radius: 99px; border:none; background:#f1f5f9; padding: 0 16px;">
        <option value="all" ${accFilter === 'all' ? 'selected' : ''}>All Accounts</option>
        ${window.WS_DATA.accounts.map(a => `<option value="${a.id}" ${accFilter === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
      </select>
      ${renderDateFilter('wsReload2()', 'auto', 'wsClear2()')}
    </div>
  </div>

  <!-- STATS -->
  <div class="stats-grid" style="grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:24px">
    <div class="stat-card" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
      <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4)">
        <i data-lucide="users" style="width: 20px; height: 20px"></i>
      </div>
      <div>
        <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">People in View</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
          ${memberCount.toLocaleString()} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">Members</span>
        </div>
        <div style="font-size: .65rem; color: var(--primary); font-weight: 600; margin-top: 4px">Team Members</div>
      </div>
    </div>
    <div class="stat-card" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
      <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--warn); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.4)">
        <i data-lucide="briefcase" style="width: 20px; height: 20px"></i>
      </div>
      <div>
        <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">Accounts Filtered</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
          ${accCount.toLocaleString()} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">Accounts</span>
        </div>
        <div style="font-size: .65rem; color: var(--warn); font-weight: 600; margin-top: 4px">Current Project Set</div>
      </div>
    </div>
    <div class="stat-card" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
      <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4)">
        <i data-lucide="trending-up" style="width: 20px; height: 20px"></i>
      </div>
      <div>
        <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">Filter Load</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
          ${avgManpower} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">Manpower</span>
        </div>
        <div style="font-size: .65rem; color: var(--accent); font-weight: 600; margin-top: 4px">Avg. Load In Range</div>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <!-- Manpower by level -->
    <div class="card" style="border-radius:20px; box-shadow: var(--shadow)">
      <div class="card-title" style="margin-bottom:20px; font-weight:700">Manpower by Position</div>
      <div style="display:flex;align-items:center;gap:30px;flex-wrap:wrap; justify-content:center">
        <div style="flex-shrink:0">${donutSVG(byLevelManpower, colorForLevel, 140)}</div>
        <div style="flex:1;min-width:240px">
          ${miniBarChart(byLevelManpower, colorForLevel)}
        </div>
      </div>
    </div>

    <!-- Tasks by node -->
    <div class="card" style="border-radius:20px; box-shadow: var(--shadow)">
      <div class="card-title" style="margin-bottom:20px; font-weight:700">Tasks Distribution by Node</div>
      <div style="max-height:220px; overflow-y:auto; padding-right:8px; display:flex; flex-direction:column; gap:6px">
        ${nodes.map(n => {
          const mp = byNodeManpower[n] || 0;
          const pct = Math.round((mp / (nodeTotalManpower || 1)) * 100);
          return `<div>
                  <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:3px">
                    <span style="font-weight:600;color:${colorForNode(n)}">${n}</span>
                     <span>${mp.toFixed(2)} Manpower</span>
                  </div>
                  <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${colorForNode(n)}"></div></div>
                </div>`;
        }).join('')}
      </div>
    </div>
  </div>

  <div class="stat-card" style="margin-top:24px; margin-bottom:24px; background:var(--surface); border:none; display:flex; flex-direction:column; align-items:flex-start; gap:8px">
    <div class="stat-label" style="font-size: .7rem; color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em">Total Task Records</div>
    <div class="stat-value" style="font-size: 1.25rem; font-weight: 700; color: var(--text)">${tasks.length.toLocaleString()}</div>
    <div class="stat-sub" style="font-size: .65rem; color: var(--text-3)">Found in selected range</div>
  </div>

  <!-- Task log table — Account = Project -->
  <div class="card" style="border-radius:20px; box-shadow: var(--shadow)">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
      <div class="card-title" style="margin-bottom:0; font-weight:700">Recent Task Log List</div>
      <div style="font-size:.75rem; color:var(--text-3)">Showing top ${displayTasks.length} of ${tasks.length} items</div>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>Date</th><th>Account / Project</th><th>Node</th><th>Name</th><th>Manpower</th></tr>
        </thead>
        <tbody>
          ${tasks.length === 0
            ? `<tr><td colspan="5" style="text-align:center;color:var(--text-3);padding:24px">No data available in the selected range</td></tr>`
            : displayTasks.map(t => {
              return `<tr>
                        <td>${t.date}</td>
                        <td><strong>${t.acc}</strong></td>
                        <td><span class="badge" style="background:${colorForNode(t.node)}22;color:${colorForNode(t.node)}">${t.node}</span></td>
                        <td>${memberMap[t.member] || t.member}</td>
                        <td><strong>${(t.hours / workingDays / 100).toFixed(3)}</strong></td>
                      </tr>`;
            }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ========================
// MAIN pageWorkship()
// ========================
function pageWorkship() {
  setTimeout(() => { 
    const contentEl = document.getElementById('wsOverviewContent');
    if (contentEl) {
      contentEl.innerHTML = wsPageOverview('', '', false);
      if (typeof lucide !== 'undefined') lucide.createIcons({root: document.getElementById('wsOverviewPanel')});
    }
  }, 50);

  setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons({root: document.getElementById('wsTabs')}); }, 10);
  
  return `
  <div class="tabs" id="wsTabs" style="margin-bottom:24px">
    <button class="text-[12px] font-semibold px-4 py-1.5 tab-btn active" onclick="wsTab(this,'wsOverviewPanel')">
      <i data-lucide="layout-dashboard" style="width:16px; height:16px"></i> Overview
    </button>
    <button class="text-[12px] font-semibold px-4 py-1.5 tab-btn" onclick="wsTab(this,'wsDetailPanel')">
      <i data-lucide="list" style="width:16px; height:16px"></i> Details
    </button>
  </div>

  <div id="wsOverviewPanel" class="ws-tab-panel">
    <div id="wsOverviewContent">
       <div style="min-height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-3); gap:12px;">
         <div style="width:30px;height:30px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
         <div style="font-size:0.9rem;font-weight:500;">Loading Overview...</div>
       </div>
    </div>
  </div>
  <div id="wsDetailPanel" class="ws-tab-panel" style="display:none">
    <div id="wsDetailContent">
       <div style="min-height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-3); gap:12px;">
         <div style="width:30px;height:30px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
         <div style="font-size:0.9rem;font-weight:500;">Loading Details...</div>
       </div>
    </div>
  </div>`;
}

// ===== TAB / RELOAD HELPERS =====
function wsTab(btn, panelId) {
  const tabs = document.querySelectorAll('#wsTabs .tab-btn');
  tabs.forEach(b => {
    b.classList.remove('active');
  });
  
  btn.classList.add('active');

  document.querySelectorAll('.ws-tab-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById(panelId);
  panel.style.display = '';

  // Lazy load Detail panel content
  if (panelId === 'wsDetailPanel') {
     const content = document.getElementById('wsDetailContent');
     // Check if it's still showing loader
     if (content.innerHTML.includes('Loading')) {
        setTimeout(() => {
           content.style.display = 'block'; // Reset from flex
           content.style.minHeight = '';
           content.style.alignItems = '';
           content.style.justifyContent = '';
           content.style.color = '';
           content.innerHTML = wsPageDetail('', '', 'all', false);
           if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 50);
     }
  }
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function wsReload1() {
  const drp = document.querySelector('#wsOverviewContent .date-range-wrapper input');
  let from = '', to = '';
  if (drp && drp.value.includes(' to ')) {
    const parts = drp.value.split(' to ');
    from = parts[0];
    to = parts[1];
  }
  document.getElementById('wsOverviewContent').innerHTML = wsPageOverview(from, to, true);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function wsReload2() {
  const acc = document.getElementById('ws2Acc')?.value || 'all';
  const drp = document.querySelector('#wsDetailContent .date-range-wrapper input');
  let from = '', to = '';
  if (drp && drp.value.includes(' to ')) {
    const parts = drp.value.split(' to ');
    from = parts[0];
    to = parts[1];
  }
  document.getElementById('wsDetailContent').innerHTML = wsPageDetail(from, to, acc, true);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function wsClear2() {
  const accSel = document.getElementById('ws2Acc');
  if (accSel) {
    accSel.value = 'all';
    accSel.dispatchEvent(new Event('change'));
  }
  wsReload2();
}

window.pageWorkship = pageWorkship;

window.wsTab = wsTab;
window.wsReload1 = wsReload1;
window.wsReload2 = wsReload2;
window.wsClear2 = wsClear2;
