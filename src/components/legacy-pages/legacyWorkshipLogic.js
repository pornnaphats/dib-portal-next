// ===== WORKSHIP PAGE (2 sub-pages) =====

function syncWSData() {
  if (typeof window === 'undefined') return;
  if (!window.WS_DATA) {
    window.WS_DATA = { members: [], tasks: [], accounts: [] };
  }

  const employees = window.DATA?.employees || [];
  window.WS_DATA.members = employees.map(e => ({
    id: e.id,
    name: e.name,
    nameEn: e.nameEn,
    nickname: e.nickname,
    level: e.pos || 'Staff',
    dept: e.dept,
    account: Array.isArray(e.account) ? e.account : (e.account ? [e.account] : [])
  }));

  const tasks = [];
  const accSet = new Set();

  // 1. From PROJECT_ACCOUNTS
  if (Array.isArray(window.PROJECT_ACCOUNTS)) {
    window.PROJECT_ACCOUNTS.forEach(a => {
      if (a && typeof a === 'string') accSet.add(a.trim());
    });
  }

  // 2. From SCHEDULE_TASKS
  if (Array.isArray(window.SCHEDULE_TASKS)) {
    window.SCHEDULE_TASKS.forEach(t => {
      if (!t.date || !t.person) return;
      const accName = (t.acc || t.project || 'General').trim();
      accSet.add(accName);
      tasks.push({
        id: t.id,
        date: t.date,
        acc: accName,
        node: t.node || 'Other',
        member: t.person,
        hours: Number(t.hours) || 0,
        title: t.title || ''
      });
    });
  }

  // 3. From QC_PLANS
  if (Array.isArray(window.QC_PLANS)) {
    window.QC_PLANS.forEach(p => {
      if (!p.date || !p.name) return;
      const schedId = 'SCH-' + p.id;
      if (tasks.some(t => t.id === schedId)) return;

      const emp = employees.find(e => {
        const clean = String(p.name).replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
        return String(e.id).toLowerCase() === clean ||
          String(e.name).replace(/\s*\([^)]*\)/g, '').trim().toLowerCase() === clean ||
          String(e.nickname).toLowerCase() === clean;
      });

      const dpType = p.qcType === 'Manual' ? 'Manual' : (p.qcType === 'QC1' ? 'QC1' : 'QC2');
      const shortChannel = p.channel === 'Website' ? 'Web' : (p.channel === 'Social' ? 'Soc' : p.channel);
      const channelText = shortChannel && shortChannel !== '-' ? ` (${shortChannel})` : '';
      const workDetail = `${dpType}${channelText}`;

      let ratesV2 = {};
      try {
        const raw = localStorage.getItem('qc_workload_rates_v2');
        ratesV2 = (raw && raw !== '{}') ? JSON.parse(raw) : window.DEFAULT_QC_RATES_V2;
      } catch(e) {
        ratesV2 = window.DEFAULT_QC_RATES_V2;
      }
      const rate = typeof window.qcGetRateForTask === 'function' ? window.qcGetRateForTask(ratesV2, p.category, p.channel, dpType) : 0.1;
      const pct = Math.round((p.cases || 0) * rate);

      accSet.add('RealCyber');
      tasks.push({
        id: schedId,
        date: p.date,
        acc: 'RealCyber',
        node: 'Monitor',
        member: emp ? emp.id : p.name,
        hours: pct,
        title: workDetail
      });
    });
  }

  // 4. From PREMIUM_SCOPE_DATA
  if (Array.isArray(window.PREMIUM_SCOPE_DATA)) {
    window.PREMIUM_SCOPE_DATA.forEach(group => {
      if (group.account) accSet.add(group.account.trim());
    });
  }

  // 5. From employees accounts
  employees.forEach(e => {
    if (Array.isArray(e.account)) {
      e.account.forEach(a => { if (a && typeof a === 'string') accSet.add(a.trim()); });
    } else if (e.account && typeof e.account === 'string') {
      accSet.add(e.account.trim());
    }
  });

  // 6. From HOLIDAY_TEMPLATES assignments
  if (Array.isArray(window.HOLIDAY_TEMPLATES)) {
    window.HOLIDAY_TEMPLATES.forEach(t => {
      (t.assignments || []).forEach(a => {
        if (a.project) accSet.add(a.project.trim());
      });
    });
  }

  // 7. Fallback to default real project list if still empty
  if (accSet.size === 0) {
    ['AFNC', 'ETDA', 'CALL CENTER', 'Media I Graphic', 'Media I Content', 'TCP', 'GC', 'AI', 'MOC', 'RealCyber', 'ตรวจจับ'].forEach(a => accSet.add(a));
  }

  window.WS_DATA.tasks = tasks;

  const sortedAccounts = Array.from(accSet)
    .filter(a => a && a !== '-' && a !== 'N/A')
    .sort((a, b) => a.localeCompare(b, 'th'));

  window.WS_DATA.accounts = sortedAccounts.map(a => ({
    id: a,
    name: a,
    node: 'N/A'
  }));

  if (!window.PROJECT_ACCOUNTS || window.PROJECT_ACCOUNTS.length === 0) {
    window.PROJECT_ACCOUNTS = sortedAccounts;
  }
}
window.syncWSData = syncWSData;

// ---- helpers ----
function getMemberPosition(memberName) {
  if (!memberName) return 'Staff';
  
  if (window.DATA && window.DATA.employees) {
    const emp = window.DATA.employees.find(e => 
      (e.id && String(e.id).toLowerCase() === String(memberName).toLowerCase()) ||
      (e.nickname && String(e.nickname).toLowerCase() === String(memberName).toLowerCase()) ||
      (e.name && String(e.name).toLowerCase() === String(memberName).toLowerCase()) ||
      (e.nameEn && String(e.nameEn).toLowerCase() === String(memberName).toLowerCase())
    );
    if (emp && emp.pos) return emp.pos;
  }

  let mem = (window.WS_DATA?.members || []).find(m => 
    (m.name && String(m.name).toLowerCase() === String(memberName).toLowerCase()) || 
    (m.id && String(m.id).toLowerCase() === String(memberName).toLowerCase())
  );
  if (mem && mem.level) return mem.level;

  return 'Staff';
}

function countWorkingDays(startStr, endStr) {
  let start, end;
  if (!startStr || !endStr) {
    const tasks = window.WS_DATA?.tasks || [];
    if (tasks.length === 0) return 30;
    const timestamps = tasks.map(t => new Date(t.date).getTime()).filter(t => !isNaN(t));
    if (timestamps.length === 0) return 30;
    start = new Date(Math.min(...timestamps));
    end = new Date(Math.max(...timestamps));
  } else {
    start = new Date(startStr);
    end = new Date(endStr);
  }
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 30;
  const diffMs = end.getTime() - start.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

function wsFilterTasks(dateFrom, dateTo, accFilter) {
  if (!window.WS_DATA || !Array.isArray(window.WS_DATA.tasks)) return [];
  return window.WS_DATA.tasks.filter(t => {
    if (!t.date) return false;
    const d = new Date(t.date);
    if (isNaN(d.getTime())) return false;
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (from && !isNaN(from.getTime()) && d < from) return false;
    if (to && !isNaN(to.getTime()) && d > to) return false;
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
      <div style="display:flex;align-items:center;gap:12px">
        <span style="width:110px;font-size:.82rem;font-weight:600;color:var(--text-2);text-align:right;flex-shrink:0;line-height:1.2">${k}</span>
        <div style="flex:1;background:#f1f5f9;border-radius:99px;height:12px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.04)">
          <div style="width:${Math.round(v / max * 100)}%;height:100%;border-radius:99px;background:${colorFn(k)};transition:width .5s ease"></div>
        </div>
        <span style="font-size:.78rem;font-weight:700;color:var(--text);width:45px;text-align:right">${v.toFixed(2)}</span>
      </div>`).join('')}
  </div>`;
}

function donutSVG(data, colorFn, size = 120) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 0;
  let offset = 0;
  const r = 38, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  const slices = Object.entries(data).map(([k, v]) => {
    const pct = v / (total || 1);
    const dash = pct * circ;
    const svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colorFn(k)}"
      stroke-width="12" stroke-dasharray="${dash} ${circ - dash}"
      stroke-dashoffset="${-offset * circ}" transform="rotate(-90 ${cx} ${cy})" opacity=".9" stroke-linecap="round" />`;
    offset += pct;
    return svg;
  });
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="12"/>
    ${slices.join('')}
    <text x="${cx}" y="${cy - 2}" text-anchor="middle" dominant-baseline="middle"
      style="font-size:12px;font-weight:800;fill:var(--text);font-family:'Kanit',sans-serif">${total > 100 ? total.toLocaleString() : total.toFixed(2)}</text>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" dominant-baseline="middle"
      style="font-size:6px;font-weight:700;fill:var(--text-3);font-family:'Kanit',sans-serif">MANPOWER</text>
  </svg>`;
}

function getWSDefaultWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToSat = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
  const defaultStart = new Date(now);
  defaultStart.setDate(now.getDate() - diffToSat);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultStart.getDate() + 6);
  const formatDateISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return {
    from: formatDateISO(defaultStart),
    to: formatDateISO(defaultEnd),
    str: `${formatDateISO(defaultStart)} to ${formatDateISO(defaultEnd)}`
  };
}

// ========================
// PAGE 1 — OVERVIEW
// ========================
function wsPageOverview(dateFrom = '', dateTo = '', rerender) {
  syncWSData();
  if (!dateFrom || !dateTo) {
    const defWeek = getWSDefaultWeekRange();
    dateFrom = dateFrom || defWeek.from;
    dateTo = dateTo || defWeek.to;
  }
  const tasks = wsFilterTasks(dateFrom, dateTo, null);
  const totalMembers = window.WS_DATA.members.length;
  const totalAccounts = [...new Set(tasks.map(t => t.acc))].filter(Boolean).length;
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
  <!-- FILTERS & HEADER -->
  <div style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:20px; position:relative; z-index:100">
    <div style="display:flex; align-items:center; gap:12px; margin-left:auto; position:relative; z-index:100">
      ${renderDateFilter('wsReload1()')}
    </div>
  </div>

  <!-- STAT ROW (3 cards) -->
  <div class="stats-grid" style="grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:24px">
    <!-- Stat 1 -->
    <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%); border: 1px solid rgba(226, 232, 240, 0.9); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04); transition: transform 0.2s, box-shadow 0.2s">
      <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 8px 16px -3px rgba(99, 102, 241, 0.35)">
        <i data-lucide="users" style="width: 24px; height: 24px"></i>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center">
        <div style="font-size: .72rem; color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-family:'Kanit'; margin-bottom: 2px">Team Capacity</div>
        <div style="font-size: 1.45rem; font-weight: 800; color: var(--text); font-family:'Kanit'; line-height: 1.2">
          ${totalMembers.toLocaleString()} <span style="font-size: .8rem; font-weight: 500; color: var(--text-3)">Members</span>
        </div>
        <div style="margin-top: 4px; display: flex; align-items: center; justify-content: center">
          <span style="background: #eef2ff; color: #4f46e5; border-radius: 99px; padding: 2px 10px; font-size: 0.68rem; font-weight: 600; font-family:'Kanit'">Active Members</span>
        </div>
      </div>
    </div>

    <!-- Stat 2 -->
    <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%); border: 1px solid rgba(226, 232, 240, 0.9); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04); transition: transform 0.2s, box-shadow 0.2s">
      <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 8px 16px -3px rgba(249, 115, 22, 0.35)">
        <i data-lucide="briefcase" style="width: 24px; height: 24px"></i>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center">
        <div style="font-size: .72rem; color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-family:'Kanit'; margin-bottom: 2px">Project Focus</div>
        <div style="font-size: 1.45rem; font-weight: 800; color: var(--text); font-family:'Kanit'; line-height: 1.2">
          ${totalAccounts.toLocaleString()} <span style="font-size: .8rem; font-weight: 500; color: var(--text-3)">Accounts</span>
        </div>
        <div style="margin-top: 4px; display: flex; align-items: center; justify-content: center">
          <span style="background: #fff7ed; color: #c2410c; border-radius: 99px; padding: 2px 10px; font-size: 0.68rem; font-weight: 600; font-family:'Kanit'">Managed Projects</span>
        </div>
      </div>
    </div>

    <!-- Stat 3 -->
    <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%); border: 1px solid rgba(226, 232, 240, 0.9); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04); transition: transform 0.2s, box-shadow 0.2s">
      <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 8px 16px -3px rgba(59, 130, 246, 0.35)">
        <i data-lucide="trending-up" style="width: 24px; height: 24px"></i>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center">
        <div style="font-size: .72rem; color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-family:'Kanit'; margin-bottom: 2px">Daily Load</div>
        <div style="font-size: 1.45rem; font-weight: 800; color: var(--text); font-family:'Kanit'; line-height: 1.2">
          ${totalManpower.toFixed(2)} <span style="font-size: .8rem; font-weight: 500; color: var(--text-3)">Manpower</span>
        </div>
        <div style="margin-top: 4px; display: flex; align-items: center; justify-content: center">
          <span style="background: #eff6ff; color: #1d4ed8; border-radius: 99px; padding: 2px 10px; font-size: 0.68rem; font-weight: 600; font-family:'Kanit'">Avg. Load / Day</span>
        </div>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <!-- Donut by node -->
    <div style="background:#fff; border-radius:20px; border:1px solid #e2e8f0; padding:22px; box-shadow: 0 8px 20px rgba(0,0,0,0.03)">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px">
        <div style="width:36px; height:36px; border-radius:50%; background:#eff6ff; color:#3b82f6; display:flex; align-items:center; justify-content:center; flex-shrink:0">
          <i data-lucide="pie-chart" style="width:18px; height:18px"></i>
        </div>
        <h3 style="font-size:1.05rem; font-weight:700; color:#0f172a; font-family:'Kanit'; margin:0">Manpower Distribution by Node</h3>
      </div>
      ${Object.keys(nodeManpowerCount).length > 0 ? `
      <div style="display:flex; align-items:center; gap:24px; flex-wrap:wrap">
        <div style="flex-shrink:0; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.06))">${donutSVG(nodeManpowerCount, colorForNode, 140)}</div>
        <div style="flex:1; max-height:220px; overflow-y:auto; padding-right:4px">
          ${Object.entries(nodeManpowerCount).sort((a, b) => b[1] - a[1]).map(([t, c]) => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; margin-bottom:6px; border-radius:99px; background:#f8fafc; transition:all 0.2s" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
              <div style="display:flex; align-items:center; gap:10px">
                <div style="width:12px; height:12px; border-radius:50%; background:${colorForNode(t)}; flex-shrink:0; box-shadow:0 0 6px ${colorForNode(t)}80"></div>
                <span style="font-size:.85rem; font-weight:600; color:#334155; font-family:'Kanit'">${t}</span>
              </div>
              <span style="font-size:.85rem; font-weight:700; color:#0f172a; font-family:'Kanit'; background:#f1f5f9; padding:2px 10px; border-radius:99px">${c.toFixed(2)} MP</span>
            </div>`).join('')}
        </div>
      </div>
      ` : `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:36px 20px; text-align:center; background:#f8fafc; border-radius:16px; border:1px dashed #e2e8f0; min-height:170px;">
        <div style="width:48px; height:48px; border-radius:50%; background:#eff6ff; color:#3b82f6; display:flex; align-items:center; justify-content:center; margin-bottom:12px; box-shadow:0 4px 12px rgba(59,130,246,0.12);">
          <i data-lucide="pie-chart" style="width:24px; height:24px;"></i>
        </div>
        <div style="font-size:0.92rem; font-weight:700; color:#1e293b; font-family:'Kanit'; margin-bottom:4px;">ไม่พบสถิติ Manpower ตาม Node</div>
        <div style="font-size:0.78rem; color:#64748b; font-family:'Kanit'; max-width:280px; line-height:1.4;">ไม่มีการลงบันทึกงานในช่วงวันที่เลือก</div>
      </div>
      `}
    </div>

    <!-- Top accounts by manpower -->
    <div style="background:#fff; border-radius:20px; border:1px solid #e2e8f0; padding:22px; box-shadow: 0 8px 20px rgba(0,0,0,0.03)">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px">
        <div style="width:36px; height:36px; border-radius:50%; background:#fff7ed; color:#ea580c; display:flex; align-items:center; justify-content:center; flex-shrink:0">
          <i data-lucide="bar-chart-3" style="width:18px; height:18px"></i>
        </div>
        <h3 style="font-size:1.05rem; font-weight:700; color:#0f172a; font-family:'Kanit'; margin:0">Manpower by Account</h3>
      </div>
      ${topAccounts.length > 0 ? `
      <div style="max-height:220px; overflow-y:auto; padding-right:8px; display:flex; flex-direction:column; gap:12px">
        ${topAccounts.slice(0, 10).map(([acc, hrs], i) => {
          const barGradient = i === 0 
            ? 'linear-gradient(90deg, #6366f1, #818cf8)' 
            : i === 1 
            ? 'linear-gradient(90deg, #f97316, #fb923c)' 
            : i === 2 
            ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' 
            : 'linear-gradient(90deg, #64748b, #94a3b8)';
          const rankBg = i === 0 ? '#eef2ff' : i === 1 ? '#fff7ed' : i === 2 ? '#eff6ff' : '#f1f5f9';
          const rankColor = i === 0 ? '#4f46e5' : i === 1 ? '#c2410c' : i === 2 ? '#1d4ed8' : '#475569';
          return `
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:.82rem; margin-bottom:6px">
              <div style="display:flex; align-items:center; gap:8px; overflow:hidden">
                <span style="width:20px; height:20px; border-radius:50%; background:${rankBg}; color:${rankColor}; font-size:0.68rem; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:'Kanit'">#${i+1}</span>
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:700; color:#1e293b; font-family:'Kanit'">${acc}</span>
              </div>
              <span style="font-weight:700; color:#0f172a; font-family:'Kanit'; background:#f8fafc; padding:2px 10px; border-radius:99px; font-size:0.75rem">${hrs} MP</span>
            </div>
            <div style="height:8px; border-radius:99px; background:#f1f5f9; overflow:hidden">
              <div style="height:100%; width:${Math.round(hrs / maxPH * 100)}%; background:${barGradient}; border-radius:99px; transition:width 0.4s ease"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
      ` : `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:36px 20px; text-align:center; background:#f8fafc; border-radius:16px; border:1px dashed #e2e8f0; min-height:170px;">
        <div style="width:48px; height:48px; border-radius:50%; background:#fff7ed; color:#f97316; display:flex; align-items:center; justify-content:center; margin-bottom:12px; box-shadow:0 4px 12px rgba(249,115,22,0.12);">
          <i data-lucide="folder-search" style="width:24px; height:24px;"></i>
        </div>
        <div style="font-size:0.92rem; font-weight:700; color:#1e293b; font-family:'Kanit'; margin-bottom:4px;">ไม่พบข้อมูล Manpower แยกตาม Account</div>
        <div style="font-size:0.78rem; color:#64748b; font-family:'Kanit'; max-width:280px; line-height:1.4;">ไม่มีการลงบันทึกงานในช่วงวันที่เลือก</div>
      </div>
      `}
    </div>
  </div>

  <!-- Level x Node Matrix -->
  <div style="margin-top:24px; background:#fff; border-radius:20px; border:1px solid #e2e8f0; padding:22px; box-shadow: 0 8px 20px rgba(0,0,0,0.03)">
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px">
      <div style="width:36px; height:36px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; flex-shrink:0">
        <i data-lucide="grid" style="width:18px; height:18px"></i>
      </div>
      <h3 style="font-size:1.05rem; font-weight:700; color:#0f172a; font-family:'Kanit'; margin:0">Manpower Matrix by Position & Node</h3>
    </div>
    ${levels.length > 0 ? `
    <div class="table-wrap" style="border-radius:12px; border:1px solid #e2e8f0; overflow:hidden">
      <table class="data-table" style="width:100%; border-collapse:collapse">
        <thead>
          <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0">
            <th style="padding:12px 16px; font-weight:700; color:#475569; font-size:0.78rem; text-transform:uppercase; font-family:'Kanit'">Position (HR)</th>
            ${types.map(t => `<th style="color:${colorForNode(t)}; font-size:.75rem; text-align:center; min-width:85px; padding:12px 8px; font-weight:700; font-family:'Kanit'">${t}</th>`).join('')}
            <th style="text-align:center; padding:12px 16px; font-weight:700; color:#0f172a; font-size:0.78rem; text-transform:uppercase; font-family:'Kanit'">Total Manpower</th>
          </tr>
        </thead>
        <tbody>
          ${levels.map(lv => {
            const row = matrix[lv] || {};
            const rowTotal = types.reduce((s, t) => s + (row[t] || 0), 0);
            return `<tr style="border-bottom:1px solid #f1f5f9; transition:background 0.15s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
                      <td style="padding:10px 16px"><span style="font-size:.82rem; font-weight:700; color:#1e293b; font-family:'Kanit'; background:#f1f5f9; padding:3px 12px; border-radius:99px; display:inline-block">${lv}</span></td>
                      ${types.map(t => {
                        const val = row[t] || 0;
                        return `<td style="text-align:center; padding:10px 8px">${val > 0
                          ? `<div style="display:inline-flex; align-items:center; justify-content:center; padding:3px 10px; border-radius:99px; background:${colorForNode(t)}12; color:${colorForNode(t)}; font-weight:700; font-size:.78rem; font-family:'Kanit'">${val.toFixed(2)}</div>`
                          : `<span style="color:#cbd5e1">—</span>`}</td>`;
                      }).join('')}
                      <td style="text-align:center; padding:10px 16px"><strong style="font-size:.85rem; color:#0f172a; font-family:'Kanit'">${rowTotal > 0 ? rowTotal.toFixed(2) : '—'}</strong></td>
                    </tr>`;
          }).join('')}
          <tr style="background:linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%); font-weight:800">
            <td style="padding:12px 16px"><strong style="font-size:0.85rem; color:#0f172a; font-family:'Kanit'">Total Manpower by Node</strong></td>
            ${types.map(t => `<td style="text-align:center; padding:12px 8px"><strong style="color:${colorForNode(t)}; font-size:0.88rem; font-family:'Kanit'">${(nodeManpowerCount[t] || 0).toFixed(2)}</strong></td>`).join('')}
            <td style="text-align:center; padding:12px 16px"><strong style="font-size:0.95rem; color:#4f46e5; font-family:'Kanit'">${totalManpower.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:36px 20px; text-align:center; background:#f8fafc; border-radius:16px; border:1px dashed #e2e8f0; margin-top:12px;">
      <div style="width:52px; height:52px; border-radius:50%; background:#eef2ff; color:#6366f1; display:flex; align-items:center; justify-content:center; margin-bottom:12px; box-shadow:0 4px 12px rgba(99,102,241,0.12);">
        <i data-lucide="grid" style="width:26px; height:26px;"></i>
      </div>
      <div style="font-size:0.95rem; font-weight:700; color:#1e293b; font-family:'Kanit'; margin-bottom:4px;">ไม่พบข้อมูลตาราง Manpower Matrix</div>
      <div style="font-size:0.78rem; color:#64748b; font-family:'Kanit'; max-width:340px; line-height:1.4; margin-bottom:14px;">ไม่มีรายการบันทึกการกระจาย Manpower ตามตำแหน่งในช่วงเวลานี้</div>
      ${(dateFrom || dateTo) ? `
      <button onclick="window.wsClearOverviewDates && window.wsClearOverviewDates()" style="background:#fff; border:1px solid #cbd5e1; border-radius:99px; padding:6px 18px; font-size:0.78rem; font-weight:600; color:#475569; cursor:pointer; font-family:'Kanit'; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#fff'">
        <i data-lucide="rotate-ccw" style="width:14px; height:14px;"></i>
        แสดงข้อมูลทั้งหมด
      </button>
      ` : ''}
    </div>
    `}
  </div>`;
}

// ========================
// PAGE 2 — DETAIL
// ========================
function wsPageDetail(dateFrom = '', dateTo = '', accFilter = 'all', rerender) {
  syncWSData();
  if (!dateFrom || !dateTo) {
    const defWeek = getWSDefaultWeekRange();
    dateFrom = dateFrom || defWeek.from;
    dateTo = dateTo || defWeek.to;
  }

  // Filter available accounts dropdown options based on tasks in the selected date range
  const dateRangeTasks = wsFilterTasks(dateFrom, dateTo, 'all');
  const accountsWithData = [...new Set(dateRangeTasks.map(t => t.acc))].filter(Boolean);

  let availableAccounts = window.WS_DATA.accounts || [];
  if (dateFrom || dateTo) {
    availableAccounts = availableAccounts.filter(a => accountsWithData.includes(a.id || a.name));
  } else if (window.WS_DATA.tasks && window.WS_DATA.tasks.length > 0) {
    const allTaskAccs = [...new Set(window.WS_DATA.tasks.map(t => t.acc))].filter(Boolean);
    if (allTaskAccs.length > 0) {
      availableAccounts = availableAccounts.filter(a => allTaskAccs.includes(a.id || a.name));
    }
  }

  // If selected accFilter has no tasks in this date range, reset to 'all'
  if (accFilter !== 'all' && (dateFrom || dateTo) && !accountsWithData.includes(accFilter)) {
    accFilter = 'all';
  }

  const tasks = wsFilterTasks(dateFrom, dateTo, accFilter);
  const relevantMemberIds = [...new Set(tasks.map(t => t.member))];
  const activeMembers = window.WS_DATA.members.filter(m => relevantMemberIds.includes(m.id));
  const memberCount = accFilter === 'all' ? window.WS_DATA.members.length : activeMembers.length;

  const accCount = accFilter === 'all'
    ? [...new Set(tasks.map(t => t.acc))].filter(Boolean).length
    : (tasks.length > 0 ? 1 : 0);

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
  <div style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:20px; position:relative; z-index:100">
    <div style="display:flex; align-items:center; gap:12px; margin-left:auto; position:relative; z-index:100">
      <select class="select-input" id="ws2Acc" onchange="wsReload2()" style="min-width:180px; height:34px; border-radius: 99px; border:none; background:#f1f5f9; padding: 0 16px;">
        <option value="all" ${accFilter === 'all' ? 'selected' : ''}>All Accounts</option>
        ${availableAccounts.map(a => `<option value="${a.id || a.name}" ${accFilter === (a.id || a.name) ? 'selected' : ''}>${a.name || a.id}</option>`).join('')}
      </select>
      ${renderDateFilter('wsReload2()', 'auto', 'wsClear2()')}
    </div>
  </div>

  <!-- STATS -->
  <div class="stats-grid" style="grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:24px">
    <!-- Stat 1 -->
    <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%); border: 1px solid rgba(226, 232, 240, 0.9); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04); transition: transform 0.2s, box-shadow 0.2s">
      <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 8px 16px -3px rgba(99, 102, 241, 0.35)">
        <i data-lucide="users" style="width: 22px; height: 22px"></i>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center">
        <div style="font-size: .72rem; color: var(--text-3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-family:'Kanit'; margin-bottom: 2px">Team Capacity</div>
        <div style="font-size: 1.45rem; font-weight: 800; color: var(--text); font-family:'Kanit'; line-height: 1.2">
          ${memberCount.toLocaleString()} <span style="font-size: .8rem; font-weight: 500; color: var(--text-3)">Members</span>
        </div>
        <div style="margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 5px">
          <span style="background: #eef2ff; color: #4f46e5; border-radius: 99px; padding: 2px 10px; font-size: 0.68rem; font-weight: 600; font-family:'Kanit'; display: inline-flex; align-items: center; gap: 5px">
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#4f46e5"></span> Active Members
          </span>
        </div>
      </div>
    </div>

    <!-- Stat 2 -->
    <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%); border: 1px solid rgba(226, 232, 240, 0.9); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04); transition: transform 0.2s, box-shadow 0.2s">
      <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 8px 16px -3px rgba(249, 115, 22, 0.35)">
        <i data-lucide="briefcase" style="width: 22px; height: 22px"></i>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center">
        <div style="font-size: .72rem; color: var(--text-3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-family:'Kanit'; margin-bottom: 2px">Project Focus</div>
        <div style="font-size: 1.45rem; font-weight: 800; color: var(--text); font-family:'Kanit'; line-height: 1.2">
          ${accCount.toLocaleString()} <span style="font-size: .8rem; font-weight: 500; color: var(--text-3)">Accounts</span>
        </div>
        <div style="margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 5px">
          <span style="background: #fff7ed; color: #c2410c; border-radius: 99px; padding: 2px 10px; font-size: 0.68rem; font-weight: 600; font-family:'Kanit'; display: inline-flex; align-items: center; gap: 5px">
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#c2410c"></span> ${accFilter === 'all' ? 'Managed Projects' : 'Selected Project'}
          </span>
        </div>
      </div>
    </div>

    <!-- Stat 3 -->
    <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%); border: 1px solid rgba(226, 232, 240, 0.9); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04); transition: transform 0.2s, box-shadow 0.2s">
      <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 8px 16px -3px rgba(16, 185, 129, 0.35)">
        <i data-lucide="trending-up" style="width: 22px; height: 22px"></i>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center">
        <div style="font-size: .72rem; color: var(--text-3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-family:'Kanit'; margin-bottom: 2px">Daily Load</div>
        <div style="font-size: 1.45rem; font-weight: 800; color: var(--text); font-family:'Kanit'; line-height: 1.2">
          ${avgManpower} <span style="font-size: .8rem; font-weight: 500; color: var(--text-3)">Manpower</span>
        </div>
        <div style="margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 5px">
          <span style="background: #ecfdf5; color: #047857; border-radius: 99px; padding: 2px 10px; font-size: 0.68rem; font-weight: 600; font-family:'Kanit'; display: inline-flex; align-items: center; gap: 5px">
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#047857"></span> Avg. Load / Day
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <!-- Manpower by level -->
    <div class="card" style="border-radius:24px; border:1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03); padding: 22px;">
      <div class="card-title" style="margin-bottom:20px; font-size:1.05rem; font-weight:800; color:var(--text);">Manpower by Position</div>
      ${Object.keys(byLevelManpower).length > 0 ? `
      <div style="display:flex;align-items:center;gap:30px;flex-wrap:wrap; justify-content:center">
        <div style="flex-shrink:0">${donutSVG(byLevelManpower, colorForLevel, 140)}</div>
        <div style="flex:1;min-width:240px">
          ${miniBarChart(byLevelManpower, colorForLevel)}
        </div>
      </div>
      ` : `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 20px; text-align:center; background:#f8fafc; border-radius:16px; border:1px dashed #e2e8f0; min-height:160px;">
        <div style="width:48px; height:48px; border-radius:50%; background:#eef2ff; color:#6366f1; display:flex; align-items:center; justify-content:center; margin-bottom:12px; box-shadow:0 4px 12px rgba(99,102,241,0.12);">
          <i data-lucide="users" style="width:24px; height:24px;"></i>
        </div>
        <div style="font-size:0.92rem; font-weight:700; color:#1e293b; font-family:'Kanit'; margin-bottom:4px;">ไม่พบข้อมูล Manpower ตามตำแหน่ง</div>
        <div style="font-size:0.78rem; color:#64748b; font-family:'Kanit'; max-width:280px; line-height:1.4;">ไม่มีการลงบันทึกงานในช่วงวันที่เลือก</div>
      </div>
      `}
    </div>

    <!-- Tasks by node -->
    <div class="card" style="border-radius:24px; border:1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03); padding: 22px;">
      <div class="card-title" style="margin-bottom:20px; font-size:1.05rem; font-weight:800; color:var(--text);">Tasks Distribution by Node</div>
      ${nodes.length > 0 ? `
      <div style="max-height:220px; overflow-y:auto; padding-right:8px; display:flex; flex-direction:column; gap:12px">
        ${nodes.map(n => {
          const mp = byNodeManpower[n] || 0;
          const pct = Math.round((mp / (nodeTotalManpower || 1)) * 100);
          const nColor = colorForNode(n);
          return `<div>
                  <div style="display:flex;justify-content:space-between;align-items:center;font-size:.84rem;margin-bottom:6px">
                    <span style="font-weight:700;color:${nColor}; display:flex; align-items:center; gap:6px;">
                      <span style="width:8px; height:8px; border-radius:50%; background:${nColor}"></span> ${n}
                    </span>
                    <span style="font-weight:800; color:var(--text)">${mp.toFixed(2)} <span style="font-size:0.7rem; font-weight:500; color:var(--text-3)">MP</span></span>
                  </div>
                  <div style="background:#f1f5f9; border-radius:99px; height:8px; overflow:hidden; box-shadow:inset 0 1px 2px rgba(0,0,0,0.04)">
                    <div style="width:${pct}%;height:100%;border-radius:99px;background:linear-gradient(90deg, ${nColor}, ${nColor}cc);transition:width .5s ease"></div>
                  </div>
                </div>`;
        }).join('')}
      </div>
      ` : `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 20px; text-align:center; background:#f8fafc; border-radius:16px; border:1px dashed #e2e8f0; min-height:160px;">
        <div style="width:48px; height:48px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; margin-bottom:12px; box-shadow:0 4px 12px rgba(22,163,74,0.12);">
          <i data-lucide="layers" style="width:24px; height:24px;"></i>
        </div>
        <div style="font-size:0.92rem; font-weight:700; color:#1e293b; font-family:'Kanit'; margin-bottom:4px;">ไม่พบสถิติงานกระจายตาม Node</div>
        <div style="font-size:0.78rem; color:#64748b; font-family:'Kanit'; max-width:280px; line-height:1.4;">ไม่มีการลงบันทึกงานในช่วงวันที่เลือก</div>
      </div>
      `}
    </div>
  </div>

  <!-- Task log table — Account = Project -->
  <div class="card" style="border-radius:24px; border:1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03); padding:22px; margin-top:24px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
      <div>
        <div class="card-title" style="margin-bottom:2px; font-size:1.05rem; font-weight:800; color:var(--text)">Recent Task Log List</div>
        <div style="font-size:.78rem; color:var(--text-3)">Detailed breakdown of recorded task logs in selected range</div>
      </div>
      <div style="font-size:.75rem; font-weight:700; color:#6366f1; background:#eef2ff; border:1px solid #e0e7ff; padding:4px 12px; border-radius:99px;">Showing top ${displayTasks.length} of ${tasks.length} items</div>
    </div>
    <div class="table-wrap" style="border-radius:16px; border:1px solid #e2e8f0; overflow:hidden;">
      <table class="data-table" style="width:100%; border-collapse:separate; border-spacing:0;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:14px 18px; font-size:0.78rem; font-weight:700; color:var(--text-2);">Date</th>
            <th style="padding:14px 18px; font-size:0.78rem; font-weight:700; color:var(--text-2);">Account / Project</th>
            <th style="padding:14px 18px; font-size:0.78rem; font-weight:700; color:var(--text-2); text-align:center;">Node</th>
            <th style="padding:14px 18px; font-size:0.78rem; font-weight:700; color:var(--text-2);">Member Name</th>
            <th style="padding:14px 18px; font-size:0.78rem; font-weight:700; color:var(--text-2); text-align:right;">Manpower</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.length === 0
            ? `<tr><td colspan="5" style="text-align:center; padding:44px 20px; background:#f8fafc;">
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px;">
                  <div style="width:48px; height:48px; border-radius:50%; background:#eef2ff; color:#6366f1; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(99,102,241,0.12);">
                    <i data-lucide="inbox" style="width:24px; height:24px;"></i>
                  </div>
                  <div style="font-size:0.92rem; font-weight:700; color:#1e293b; font-family:'Kanit';">ไม่พบรายการบันทึกงานในช่วงนี้</div>
                  <div style="font-size:0.78rem; color:#64748b; font-family:'Kanit';">ลองเลือก Account หรือปรับช่วงเวลาค้นหาให้กว้างขึ้น</div>
                </div>
              </td></tr>`
            : displayTasks.map(t => {
              const accColor = typeof window.colorForProject === 'function' ? window.colorForProject(t.acc) : '#6366f1';
              const nodeColor = colorForNode(t.node);
              const mpVal = (t.hours / workingDays / 100).toFixed(3);
              return `<tr style="border-bottom:1px solid #f1f5f9; transition:background 0.15s ease;">
                        <td style="padding:14px 18px; font-size:0.82rem; font-weight:600; color:#475569;">${t.date}</td>
                        <td style="padding:14px 18px;">
                          <span style="display:inline-flex; align-items:center; gap:6px; font-weight:700; color:${accColor}; font-size:0.85rem;">
                            <span style="width:8px; height:8px; border-radius:50%; background:${accColor};"></span>
                            ${t.acc}
                          </span>
                        </td>
                        <td style="padding:14px 18px; text-align:center;">
                          <span class="badge" style="background:${nodeColor}14; color:${nodeColor}; padding:3px 12px; border-radius:99px; font-weight:700; font-size:0.72rem;">${t.node}</span>
                        </td>
                        <td style="padding:14px 18px; font-size:0.85rem; font-weight:600; color:var(--text);">
                          <div style="display:flex; align-items:center; gap:8px;">
                            <div style="width:26px; height:26px; border-radius:50%; background:#f1f5f9; color:#64748b; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center;">
                              <i data-lucide="user" style="width:13px; height:13px"></i>
                            </div>
                            ${memberMap[t.member] || t.member}
                          </div>
                        </td>
                        <td style="padding:14px 18px; text-align:right;">
                          <span style="display:inline-flex; align-items:center; justify-content:center; padding:4px 12px; border-radius:99px; background:#eff6ff; color:#4f46e5; font-weight:800; font-size:0.82rem;">${mpVal}</span>
                        </td>
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
  <div id="wsTabs" class="ws-segmented-tabs" style="display:inline-flex; align-items:center; background:#f1f5f9; padding:4px; border-radius:9999px; gap:4px; margin-bottom:24px; border:1px solid #e2e8f0; box-shadow: inset 0 1px 2px rgba(0,0,0,0.03);">
    <button class="ws-tab-btn active" onclick="wsTab(this,'wsOverviewPanel')" style="display:inline-flex; align-items:center; gap:8px; padding:8px 22px; border-radius:9999px; font-family:'Kanit', sans-serif; font-size:0.85rem; font-weight:700; border:none; cursor:pointer; background:#ffffff; color:#635bff; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.14); transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
      <i data-lucide="layout-dashboard" style="width:16px; height:16px"></i> Overview
    </button>
    <button class="ws-tab-btn" onclick="wsTab(this,'wsDetailPanel')" style="display:inline-flex; align-items:center; gap:8px; padding:8px 22px; border-radius:9999px; font-family:'Kanit', sans-serif; font-size:0.85rem; font-weight:500; border:none; cursor:pointer; background:transparent; color:#64748b; transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
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
  const tabs = document.querySelectorAll('#wsTabs button');
  tabs.forEach(b => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.color = '#64748b';
    b.style.fontWeight = '500';
    b.style.boxShadow = 'none';
  });
  
  btn.classList.add('active');
  btn.style.background = '#ffffff';
  btn.style.color = '#635bff';
  btn.style.fontWeight = '700';
  btn.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.14)';

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
  } else {
    const defWeek = getWSDefaultWeekRange();
    from = defWeek.from;
    to = defWeek.to;
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
  } else {
    const defWeek = getWSDefaultWeekRange();
    from = defWeek.from;
    to = defWeek.to;
  }
  document.getElementById('wsDetailContent').innerHTML = wsPageDetail(from, to, acc, true);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function wsClear2() {
  const accSel = document.getElementById('ws2Acc');
  if (accSel) {
    accSel.value = 'all';
  }
  const defWeek = getWSDefaultWeekRange();
  document.getElementById('wsDetailContent').innerHTML = wsPageDetail(defWeek.from, defWeek.to, 'all', true);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function wsClearOverviewDates() {
  const defWeek = getWSDefaultWeekRange();
  document.getElementById('wsOverviewContent').innerHTML = wsPageOverview(defWeek.from, defWeek.to, true);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.pageWorkship = pageWorkship;

window.wsTab = wsTab;
window.wsReload1 = wsReload1;
window.wsReload2 = wsReload2;
window.wsClear2 = wsClear2;
window.wsClearOverviewDates = wsClearOverviewDates;
