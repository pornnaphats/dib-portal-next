const getWorkloadColor = (hours) => {
  if (typeof window !== 'undefined' && typeof window.getWorkloadColor === 'function') {
    return window.getWorkloadColor(hours);
  }
  if (hours === 0) return 'var(--text-3)';
  if (hours < 50) return '#ef4444';
  if (hours <= 80) return '#facc15';
  if (hours <= 100) return '#22c55e';
  if (hours <= 120) return '#166534';
  return '#991b1b';
};

window.pageSchedule = function() {
    window._scheduleSearch = window._scheduleSearch || '';
    window._scheduleTeamFilter = window._scheduleTeamFilter || '';

    const employees = DATA.employees || [];
    const realDayMap = { 'อา.': 0, 'จ.': 1, 'อ.': 2, 'พ.': 3, 'พฤ.': 4, 'ศ.': 5, 'ส.': 6, 'อาทิตย์': 0, 'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัสบดี': 4, 'ศุกร์': 5, 'เสาร์': 6 };


    let days = [];
    let startDate, endDate;

    if (window._currentDateRange && window._currentDateRange.includes(' to ')) {
      const [s, e] = window._currentDateRange.split(' to ');
      startDate = new Date(s);
      endDate = new Date(e);
      if (startDate.getFullYear() > 2500) startDate.setFullYear(startDate.getFullYear() - 543);
      if (endDate.getFullYear() > 2500) endDate.setFullYear(endDate.getFullYear() - 543);
    } else {
      // Default to this week (Saturday to Friday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToSat = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
      
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diffToSat);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // 6 days after Saturday is Friday
    }

    let curr = new Date(startDate);
    // Capping at 366 days for performance
    let count = 0;
    while (curr <= endDate && count < 400) {
      days.push({
        day: dayNamesFull[curr.getDay()],
        date: `${curr.getDate()} ${monthNamesShort[curr.getMonth()]}`,
        dateIso: `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`, // YYYY-MM-DD for matching
        dateObj: new Date(curr),
        dayIdx: curr.getDay()
      });
      curr.setDate(curr.getDate() + 1);
      count++;
    }

    const formatScheduleName = (fullNameEn) => {
      if (!fullNameEn || fullNameEn === '-') return '';
      const parts = fullNameEn.trim().split(/\s+/);
      if (parts.length < 2) return parts[0];
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    };

    // Fast indexing for tasks (including scheduled tasks and QC plans)
    const tasksByPersonDay = {};
    if (Array.isArray(window.SCHEDULE_TASKS)) {
      window.SCHEDULE_TASKS.forEach(t => {
        if (!t.person || !t.date) return;
        const tPerson = String(t.person).trim().toLowerCase();
        const emp = (DATA.employees || []).find(e => {
          const matchId = String(e.id).trim().toLowerCase() === tPerson;
          const matchName = String(e.name).trim().toLowerCase() === tPerson;
          const matchNameEn = String(e.nameEn).trim().toLowerCase() === tPerson;
          const matchNickname = String(e.nickname).trim().toLowerCase() === tPerson;
          const shortEn = formatScheduleName(e.nameEn).trim().toLowerCase();
          const matchShortEn = shortEn && shortEn === tPerson;
          return matchId || matchName || matchNameEn || matchNickname || matchShortEn;
        });
        const targetId = emp ? emp.id : t.person;
        const key = `${targetId}_${t.date}`;
        if (!tasksByPersonDay[key]) tasksByPersonDay[key] = [];
        if (!t.id || !t.id.startsWith('SCH-') || !tasksByPersonDay[key].some(existing => existing.id === t.id)) {
          tasksByPersonDay[key].push(t);
        }
      });
    }

    if (Array.isArray(window.QC_PLANS)) {
      window.QC_PLANS.forEach(plan => {
        if (!plan.name || !plan.date) return;
        const tPerson = String(plan.name).trim().toLowerCase();
        const emp = (DATA.employees || []).find(e => {
          const matchId = String(e.id).trim().toLowerCase() === tPerson;
          const matchName = String(e.name).trim().toLowerCase() === tPerson;
          const matchNameEn = String(e.nameEn).trim().toLowerCase() === tPerson;
          const matchNickname = String(e.nickname).trim().toLowerCase() === tPerson;
          const shortEn = formatScheduleName(e.nameEn).trim().toLowerCase();
          const matchShortEn = shortEn && shortEn === tPerson;
          return matchId || matchName || matchNameEn || matchNickname || matchShortEn;
        });
        const targetId = emp ? emp.id : plan.name;
        const key = `${targetId}_${plan.date}`;
        const taskId = 'SCH-' + plan.id;
        if (!tasksByPersonDay[key]) tasksByPersonDay[key] = [];
        const exists = tasksByPersonDay[key].some(t => t.id === taskId);
        if (!exists) {
          const dpType = plan.qcType === 'Manual' ? 'Manual' : (plan.qcType === 'QC1' ? 'QC1' : 'QC2');
          const shortChannel = plan.channel === 'Website' ? 'Web' : (plan.channel === 'Social' ? 'Soc' : plan.channel);
          const channelText = shortChannel && shortChannel !== '-' ? ` (${shortChannel})` : '';
          const workDetail = `${dpType}${channelText}`;

          let ratesV2 = {};
          try {
            const raw = localStorage.getItem('qc_workload_rates_v2');
            ratesV2 = (raw && raw !== '{}') ? JSON.parse(raw) : window.DEFAULT_QC_RATES_V2;
          } catch(e) {
            ratesV2 = window.DEFAULT_QC_RATES_V2;
          }
          const rate = typeof window.qcGetRateForTask === 'function' ? window.qcGetRateForTask(ratesV2, plan.category, plan.channel, dpType) : 0;
          const pct = Math.round((plan.cases || 0) * rate);

          tasksByPersonDay[key].push({
            id: taskId,
            date: plan.date,
            person: targetId,
            acc: 'บ.ในเครือ',
            node: 'Monitor',
            title: workDetail,
            hours: pct
          });
        }
      });
    }

    // NEW: Fast indexing for leave requests to boost performance
    const leavesByPersonDay = {};
    if (Array.isArray(DATA.leaveRequests)) {
      DATA.leaveRequests.forEach(r => {
        if (r.status !== 'approved' && r.status !== 'อนุมัติแล้ว') return;

        // Expand leave range into daily map for O(1) lookup
        // Use parseThaiDate as fallback if Raw fields are missing
        const parseThaiDate = (str) => {
          if (!str) return '';
          const parts = str.split(' ');
          if (parts.length < 3) return str; // If already ISO
          const d = parts[0].padStart(2, '0');
          const monthMap = { 'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12' };
          const m = monthMap[parts[1]] || '01';
          const y = parseInt(parts[2]) - 543;
          return `${y}-${m}-${d}`;
        };

        let start = new Date(r.startRaw || parseThaiDate(r.start));
        let end = new Date(r.endRaw || parseThaiDate(r.end));
        let dCurr = new Date(start);
        while (dCurr <= end) {
          const dIso = `${dCurr.getFullYear()}-${String(dCurr.getMonth() + 1).padStart(2, '0')}-${String(dCurr.getDate()).padStart(2, '0')}`;
          // Use trimmed lowercase name for robust matching
          const key = `${(r.name || '').trim().toLowerCase()}_${dIso}`;
          leavesByPersonDay[key] = r;
          dCurr.setDate(dCurr.getDate() + 1);
        }
      });
    }

    // Build holiday task index: key = personName_YYYY-MM-DD
    const holidayByPersonDay = {};
    try {
      const localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
      const parseHolidayDateToISO = (dateStr) => {
        if (!dateStr) return null;
        const s = dateStr.trim();
        // 1. Already ISO YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        // 2. Thai long month "1 มกราคม 2569" or "1 มกราคม 2026"
        const thaiMonthsFull = { 'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08', 'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12' };
        const thaiMonthsShort = { 'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12' };
        const mFull = s.match(/(\d+)\s+(\S+)\s+(\d{4})/);
        if (mFull) {
          const day = mFull[1].padStart(2, '0');
          const mon = thaiMonthsFull[mFull[2]] || thaiMonthsShort[mFull[2]] || null;
          const year = parseInt(mFull[3]) > 2500 ? parseInt(mFull[3]) - 543 : parseInt(mFull[3]);
          if (mon) return `${year}-${mon}-${day}`;
        }
        // 3. English short "1 Jan 2026"
        const enMonths = { 'jan':'01','feb':'02','mar':'03','apr':'04','may':'05','jun':'06','jul':'07','aug':'08','sep':'09','oct':'10','nov':'11','dec':'12' };
        const mEn = s.match(/(\d+)\s+([A-Za-z]+)\s+(\d{4})/);
        if (mEn) {
          const day = mEn[1].padStart(2, '0');
          const mon = enMonths[mEn[2].toLowerCase().substring(0,3)] || null;
          const year = parseInt(mEn[3]) > 2500 ? parseInt(mEn[3]) - 543 : parseInt(mEn[3]);
          if (mon) return `${year}-${mon}-${day}`;
        }
        // 4. DD/MM/YYYY or MM/DD/YYYY -֧ assume DD/MM/YYYY
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
          const parts = s.split('/');
          const year = parseInt(parts[2]) > 2500 ? parseInt(parts[2]) - 543 : parseInt(parts[2]);
          return `${year}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
        }
        // 5. Try native Date parse (handles "Jan 1, 2026" etc.)
        const d = new Date(s);
        if (!isNaN(d)) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        return null;
      };
      console.log('[Schedule] holiday_shifts count:', localShifts.length);
      localShifts.forEach(shift => {
        const isoDate = parseHolidayDateToISO(shift.date);
        console.log('[Schedule] shift:', shift.name, '| raw date:', shift.date, '| iso:', isoDate, '| tasks:', (shift.tasks||[]).length);
        if (!isoDate) return;
        (shift.tasks || []).forEach(task => {
          if (!task.person || task.person === '-') return;
          const key = `${task.person.trim().toLowerCase()}_${isoDate}`;
          console.log('[Schedule] holiday key added:', key);
          if (!holidayByPersonDay[key]) holidayByPersonDay[key] = [];
          holidayByPersonDay[key].push({ holidayName: shift.name, section: task.section, time: task.time, assignments: task.assignments || [] });
        });
      });
    } catch(e) { console.error('[Schedule] holiday index error:', e); }
    // Read hidden employees and ordering from Schedule settings
    let hiddenEmps = [];
    try { hiddenEmps = JSON.parse(localStorage.getItem('schedule_hidden_employees') || '[]'); } catch(e) { hiddenEmps = []; }
    let empOrderMap = {};
    try { empOrderMap = JSON.parse(localStorage.getItem('schedule_employee_order') || '{}'); } catch(e) { empOrderMap = {}; }

    const deptGroups = {};
    employees.forEach(e => {
      const dept = e.dept ? e.dept.trim() : '';
      if (!dept || dept === '-' || dept === 'Other') return;

      // Hide employees marked as hidden in Manage modal
      if (hiddenEmps.includes(String(e.id)) || hiddenEmps.includes(String(e.name))) return;
      if (window._scheduleTeamFilter && dept !== window._scheduleTeamFilter) return;

      // Hide Manager role from Schedule
      const posStr = String(e.pos || '').trim().toLowerCase();
      if (posStr === 'manager') return;

      const searchStr = window._scheduleSearch;
      if (searchStr) {
        const matchName = e.name && e.name.toLowerCase().includes(searchStr);
        const matchNameEn = e.nameEn && e.nameEn.toLowerCase().includes(searchStr);
        const matchNickname = e.nickname && e.nickname.toLowerCase().includes(searchStr);
        if (!(matchName || matchNameEn || matchNickname)) return;
      }

      if (!deptGroups[dept]) deptGroups[dept] = [];

      // Mapping day names to indices
      const realDayMap = { 'อาทิตย์': 0, 'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัสบดี': 4, 'ศุกร์': 5, 'เสาร์': 6 };
      const offDays = (e.offdays || '').split(/[,|\-]/).map(d => realDayMap[d.trim().replace('วัน', '')]).filter(v => v !== undefined);

      deptGroups[dept].push({
        id: e.id,
        name: formatScheduleName(e.nameEn) || e.name,
        fullName: e.name,
        nameEn: e.nameEn,
        nickname: e.nickname,
        pos: e.pos,
        shift: e.shift,
        offdays: e.offdays,
        offDays: offDays,
        rank: e.rank || 999
      });
    });

    const storedCustomOrder = JSON.parse(localStorage.getItem('customEmpOrder') || '{}');
    if (window._customEmpOrder) {
      Object.assign(storedCustomOrder, window._customEmpOrder);
    }

    Object.keys(deptGroups).forEach(dept => {
      deptGroups[dept].sort((a, b) => {
        // Prefer qc_employee_order (shared with RealCyber Plan)
        if (empOrderMap[a.id] !== undefined && empOrderMap[b.id] !== undefined) {
          return empOrderMap[a.id] - empOrderMap[b.id];
        }
        if (empOrderMap[a.id] !== undefined) return -1;
        if (empOrderMap[b.id] !== undefined) return 1;
        if (storedCustomOrder[dept] && Array.isArray(storedCustomOrder[dept])) {
          const orderArr = storedCustomOrder[dept];
          const idxA = orderArr.indexOf(a.id);
          const idxB = orderArr.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
        }
        return (a.rank || 999) - (b.rank || 999);
      });
    });

    const teamsOrder = ['ACE', 'Sertec', 'ONIX', 'Sale Support', 'Call Center'];
    const teams = Object.keys(deptGroups)
      .sort((a, b) => {
        const idxA = teamsOrder.indexOf(a);
        const idxB = teamsOrder.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      })
      .map(dept => ({
        name: dept,
        members: deptGroups[dept]
      }));

    const isManageMode = window.IS_MANAGE_SCHEDULE_MODE || false;
    const manageBtnColor = isManageMode ? 'var(--primary)' : 'var(--text-3)';
    const manageBtnBg = isManageMode ? 'rgba(45,110,247,0.1)' : '#fff';

    const legends = [
      { label: 'น้อยกว่า 50%', color: '#ef4444' },
      { label: '50-80%', color: '#facc15' },
      { label: '81-100%', color: '#22c55e' },
      { label: '101-120%', color: '#166534' },
      { label: 'มากกว่า 120%', color: '#991b1b' }
    ];

    const sidebarRight = window.IS_TASK_SIDEBAR_OPEN ? '0px' : '-380px';
    const mainPaddingRight = window.IS_TASK_SIDEBAR_OPEN ? '380px' : '0px';

    const isReordering = window._isReordering;
    window._isReordering = false;
    const fadeClass = isReordering ? '' : 'fade-in';

    return `
  <style>
    .scheduler-scrollbar::-webkit-scrollbar { width: 3px !important; height: 3px !important; }
    .scheduler-scrollbar::-webkit-scrollbar-track { background: transparent !important; }
    .scheduler-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1 !important; border-radius: 10px !important; }
    .scheduler-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8 !important; }
    .scheduler-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
  </style>
  <div id="scheduleMainContent" style="padding-right:${mainPaddingRight}; transition:padding-right 0.3s ease;">
    <!-- Header Actions -->
    <div class="${fadeClass}" style="margin-bottom:24px; margin-top:-10px; position:relative; z-index:1000">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap">
        <!-- Left: Title -->
        <div style="font-size:0.75rem; color:var(--text-3); white-space:nowrap">
          Last edited by: admin@company.com (5 mins ago)
        </div>

        <!-- Right: Filters and Actions -->
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-left:auto;">
          <div style="height:34px; display:flex; align-items:center">
             ${renderDateFilter('filterScheduleUI()', 'above', '', false)}
          </div>
          <div class="search-box" style="width:160px; background:#fff; height:34px; display:flex; align-items:center; position:relative; border:1px solid var(--border); border-radius:8px; overflow:hidden">
            <i data-lucide="search" style="width:14px; height:14px; position:absolute; left:12px; color:var(--text-3)"></i>
            <input id="schedSearchInput" type="text" placeholder="Search..." value="${window._scheduleSearch}" onkeyup="filterScheduleUI()" style="padding:0 12px 0 32px; height:100%; width:100%; border:none; outline:none; background:transparent; font-size:0.8rem">
          </div>
          <select id="schedTeamFilter" onchange="filterScheduleUI()" style="height:34px; padding:0 12px; border:1px solid var(--border); border-radius:8px; font-size:.8rem; font-family:Kanit; outline:none; background:#fff; cursor:pointer">
            <option value="">All Team</option>
            ${['ACE', 'Sertec', 'ONIX', 'Sale Support', 'Call Center'].map(t => `<option value="${t}" ${window._scheduleTeamFilter === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
          <button class="btn btn-danger btn-sm" onclick="window._currentDateRange=''; window._scheduleSearch=''; window._scheduleTeamFilter=''; document.getElementById('schedSearchInput').value=''; document.getElementById('schedTeamFilter').value=''; filterScheduleUI()" style="height:34px; padding:0 14px; font-size:.7rem; border-radius:8px; background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2); display:flex; align-items:center; gap:4px; cursor:pointer; font-weight:600">
             <i data-lucide="rotate-ccw" style="width:12px; height:12px"></i> Clear All Filter
          </button>
          <div style="width:1px; height:20px; background:var(--border); margin:0 2px"></div>
          <button class="btn btn-sm" onclick="toggleTaskSidebar()" style="height:34px; padding:0 14px; font-size:.7rem; border-radius:8px; background:rgba(45,110,247,0.08); color:var(--primary); border:1px solid rgba(45,110,247,0.2); display:flex; align-items:center; gap:4px; cursor:pointer; font-weight:600">
            <i data-lucide="plus" style="width:12px; height:12px"></i> Add Task
          </button>
          <button class="btn btn-sm" onclick="window.qcShowManageEmployeesModal && window.qcShowManageEmployeesModal('schedule')" style="height:34px; padding:0 14px; font-size:.7rem; border-radius:8px; background:#fff; color:#475569; border:1px solid var(--border); display:flex; align-items:center; gap:4px; cursor:pointer; font-weight:600; font-family:'Kanit'">
            <i data-lucide="users" style="width:12px; height:12px"></i> จัดการพนักงาน
          </button>
          <button class="btn btn-sm" onclick="window.openExportScheduleModal()" style="height:34px; padding:0 14px; font-size:.7rem; border-radius:8px; background:rgba(16,185,129,0.08); color:#10b981; border:1px solid rgba(16,185,129,0.2); display:flex; align-items:center; gap:4px; cursor:pointer; font-weight:600; font-family:'Kanit'">
            <i data-lucide="download" style="width:12px; height:12px"></i> Export ตารางการทำงาน
          </button>

        </div>
      </div>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:20px; padding:0 4px; margin-bottom:12px">
      ${legends.map(l => `
        <div style="display:flex; align-items:center; gap:8px">
          <div style="width:10px; height:10px; border-radius:2px; background:${l.color}"></div>
          <span style="font-size:.7rem; font-weight:400; color:var(--text-3)">${l.label}</span>
        </div>
      `).join('')}
    </div>

    <div class="${fadeClass}" style="width:100%; max-width:calc(100vw - 320px); overflow:hidden">
      <div class="card" style="padding:0; overflow:hidden">
        <div id="scheduleTableWrap" class="table-wrap" style="overflow-x:auto; overflow-y:auto; max-height:calc(100vh - 240px); background:#fff; width:100%">
          <table style="width:max-content; min-width:100%; border-collapse:collapse; table-layout:fixed">
            <thead>
              <tr style="background:#fff">
                <th style="width:260px; min-width:260px; padding:18px 20px; border-bottom:1px solid var(--border); border-right:1px solid var(--border); text-align:left; font-size:.8rem; color:#1e293b; font-weight:700; background:#fff; position:sticky; left:0; top:0; z-index:21; vertical-align:middle; box-shadow:0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
                  <div style="display:flex; align-items:center; gap:8px; height:100%;">
                    <i data-lucide="user-check" style="width:16px; height:16px; color:#475569;"></i>
                    <span>Employee</span>
                  </div>
                </th>
                ${days.map(d => {
      const isWeekend = d.dayIdx === 0 || d.dayIdx === 6;
      const holidayName = isThaiHoliday(d.dateObj);
      const isHoliday = !!holidayName;
      const localNow = new Date();
      const todayStr = `${localNow.getFullYear()}-${String(localNow.getMonth() + 1).padStart(2, '0')}-${String(localNow.getDate()).padStart(2, '0')}`;
      const isToday = d.dateIso === todayStr;
      
      let bg = '#fff';
      let dateColor = '#1e293b';
      let dayColor = '#64748b';
      
      if (isToday) {
        bg = '#eff6ff';
        dateColor = '#2563eb';
        dayColor = '#1d4ed8';
      } else if (isHoliday) {
        bg = '#fff1f2';
        dateColor = '#be123c';
        dayColor = '#e11d48';
      } else if (isWeekend) {
        bg = '#f8fafc';
        dateColor = '#334155';
        dayColor = '#475569';
      }

      const shadowStyle = 'box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)';
      
      // Day name in elegant uppercase and letter-spaced font
      const dayText = `<div style="font-size:0.7rem; color:${dayColor}; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px">${d.day}</div>`;
      
      // Date capsule for today, or simple bold number for others
      let dateText = '';
      if (isToday) {
        dateText = `
          <div style="display:inline-flex; align-items:center; justify-content:center; gap:4px; background:#dbeafe; color:#2563eb; padding:2px 8px; border-radius:99px; font-size:0.82rem; font-weight:700; white-space:nowrap;">
            <span style="width:6px; height:6px; border-radius:50%; background:#2563eb; display:inline-block;"></span>
            Today, ${d.date}
          </div>
        `;
      } else {
        dateText = `<div style="font-size:0.85rem; color:${dateColor}; font-weight:700">${d.date}</div>`;
      }

      const holidayBadge = isHoliday 
        ? `<div style="font-size:0.62rem; color:#be123c; font-weight:600; margin-top:6px; line-height:1.2; width:100%; word-break:break-word; text-align:center">${holidayName}</div>`
        : '';

      return `
                  <th style="padding:18px 12px; border-bottom:1px solid var(--border); border-right:1px solid var(--border); text-align:center; background:${bg}; width:150px; min-width:150px; position:sticky; top:0; z-index:10; vertical-align:middle; ${shadowStyle}" ${isHoliday ? `title="${holidayName}"` : ''}>
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:48px;">
                      ${dayText}
                      ${dateText}
                      ${holidayBadge}
                    </div>
                  </th>
                `}).join('')}
              </tr>
            </thead>
            <tbody id="scheduleTableBody">
              ${teams.map(team => `
                <tr style="background:#f1f5f9">
                  <td style="padding:10px 20px; font-size:.78rem; font-weight:700; color:#334155; border-bottom:2px solid var(--border); position:sticky; left:0; z-index:15; background:#f1f5f9; white-space:nowrap; box-shadow: 2px 0 5px rgba(0,0,0,0.05)">
                    <div style="display:flex; align-items:center; gap:8px">
                      <div style="width:4px; height:18px; border-radius:4px; background:${getTeamColor(team.name)}"></div>
                      <i data-lucide="users" style="width:13px; height:13px; color:${getTeamColor(team.name)}"></i>
                      <span style="letter-spacing:.3px">${team.name}</span>
                      <span style="font-size:.65rem; color:var(--text-3); font-weight:400">(${team.members.length} คน)</span>
                    </div>
                  </td>
                  <td colspan="${days.length}" style="border-bottom:2px solid var(--border); background:#f1f5f9"></td>
                </tr>
                ${team.members.map((p, pIdx) => {
        const rowCursor = isManageMode ? 'cursor:grab' : 'default';
        const posBg = getPosBgColor(p.pos);
        const posText = getPosTextColor(p.pos);
        // Line 1: English Name + Initial
        const line1 = window.getEmployeeDisplayName(p);

        const avatarText = (p.nickname && p.nickname !== '-' ? p.nickname : p.name.trim().split(/\s+/)[0]);
        const avatarFontSize = avatarText.length > 5 ? '0.55rem' : (avatarText.length === 5 ? '0.65rem' : (avatarText.length === 4 ? '0.75rem' : '0.85rem'));

        const tCol = getTeamColor(team.name);

        return `
                    <tr 
                      style="${rowCursor}" 
                      ${isManageMode ? `draggable="true" ondragstart="handleEmpDragStart(event, '${team.name}', ${pIdx})" ondragover="event.preventDefault(); this.style.background='#f0f9ff'" ondragleave="this.style.background='#fff'" ondrop="handleEmpDrop(event, '${team.name}', ${pIdx})"` : ''}
                    >
                      <td style="padding:10px 16px; border-bottom:1px solid var(--border); border-right:1px solid var(--border); background:#fff; position:sticky; left:0; z-index:11; box-shadow: 2px 0 5px rgba(0,0,0,0.03)">
                        <div style="display:flex; align-items:center; gap:8px">
                          <div style="width:52px; height:52px; border-radius:50%; background:${tCol}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:${avatarFontSize}; box-shadow: 0 4px 10px rgba(0,0,0,0.1); flex-shrink:0; text-align:center; padding:2px; overflow:hidden; white-space:nowrap; word-break:keep-all">
                            ${avatarText}
                          </div>
                          <div style="min-width:0; flex:1">
                            <div style="font-size:.8rem; font-weight:700; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${line1}</div>
                            <div style="display:inline-block; padding:2px 10px; border-radius:99px; background:${posBg}; color:${posText}; border:1px solid rgba(0,0,0,0.05); font-size:0.6rem; font-weight:700; margin:3px 0; text-transform:uppercase">${p.pos}</div>
                            <div style="display:flex; align-items:center; gap:4px; font-size:0.62rem; color:var(--text-3); font-weight:500">
                              <i data-lucide="clock" style="width:11px; height:11px"></i> ${p.shift || '-'}
                            </div>
                            <div style="display:flex; align-items:center; gap:4px; font-size:0.62rem; color:var(--text-3); font-weight:400; text-transform:uppercase; margin-top:2px">
                              <i data-lucide="calendar-x" style="width:11px; height:11px"></i> ${p.offdays || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      ${days.map(d => {
          const isWeekend = d.dayIdx === 0 || d.dayIdx === 6;
          const isOff = p.offDays.includes(d.dayIdx);
          const isHoliday = !!isThaiHoliday(d.dateObj);

          // Check leave
          const leave = leavesByPersonDay[`${p.fullName.trim().toLowerCase()}_${d.dateIso}`] ||
            leavesByPersonDay[`${p.name.trim().toLowerCase()}_${d.dateIso}`];

          // Check holiday assignment
          const holidayTasks = holidayByPersonDay[`${p.fullName.trim().toLowerCase()}_${d.dateIso}`] || holidayByPersonDay[`${p.name.trim().toLowerCase()}_${d.dateIso}`] || [];
          const bg = isOff ? '#f1f5f9' : (isHoliday || isWeekend ? '#f8fafc' : '#fff');

          // Tasks for this person & day
          const dayTasks = tasksByPersonDay[`${p.id}_${d.dateIso}`] || [];
          const totalHours = dayTasks.reduce((sum, t) => sum + (Number(t.hours) || 0), 0);
          const wlColor = getWorkloadColor(totalHours);

          let holidayTotalPct = 0;
          let holidayAssignmentCount = 0;
          holidayTasks.forEach(ht => {
            if (ht.assignments && ht.assignments.length > 0) {
              holidayAssignmentCount += ht.assignments.length;
              ht.assignments.forEach(a => {
                holidayTotalPct += (Number(a.percent) || 0);
              });
            } else {
              holidayAssignmentCount += 1;
            }
          });
          const wlColorHoliday = getWorkloadColor(holidayTotalPct);

          return `
                        <td ondragover="event.preventDefault(); this.style.background='rgba(99,102,241,0.05)'" 
                            ondragleave="this.style.background='${bg}'"
                            ondrop="this.style.background='${bg}'; handleTaskDrop(event, '${p.id}', '${d.dateIso}')"
                            style="padding:0; border-bottom:1px solid var(--border); border-right:1px solid var(--border); background:${bg}; vertical-align:top; height:140px; max-width:150px">
                          <div style="height:100%; display:flex; flex-direction:column; padding:4px; position:relative; overflow:hidden">
                            ${dayTasks.length > 0 ? `
                              <div class="scheduler-scrollbar" style="max-height:110px; display:flex; flex-direction:column; gap:3px; overflow-y:auto; padding-right:2px; margin-bottom:22px">
                                ${dayTasks.map(t => {
            const nodeCol = colorForNode(t.node);
            return `
                                    <div draggable="true" ondragstart="handleTaskDragStart(event, 'scheduled-${t.id}')" 
                                         style="padding:5px 8px; border-radius:6px; background:#fff; border:1px solid #e2e8f0; border-left:3px solid ${nodeCol}; font-size:.65rem; cursor:pointer; transition:all 0.2s; position:relative; box-shadow:0 1px 2px rgba(0,0,0,0.02)" 
                                         onclick="openTaskEditor('${t.id}')">
                                      <div style="font-weight:700; color:${nodeCol}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; padding-right:14px; margin-bottom:2px">${t.title}</div>
                                      <div style="font-size:0.55rem; color:#64748b; margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; opacity:0.8; padding-right:14px">${t.acc || ''}</div>
                                      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:3px;">
                                        <div style="font-size:.55rem; font-weight:600; color:#64748b;">${t.node || ''}</div>
                                        <div style="font-size:.6rem; font-weight:700; color:#1e293b;">${t.hours || 0}%</div>
                                      </div>
                                      <button onclick="event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); deleteScheduledTask('${t.id}')" 
                                              style="position:absolute; top:4px; right:4px; background:none; border:none; color:#94a3b8; cursor:pointer; padding:2px; display:flex; align-items:center; justify-content:center; border-radius:4px; transition:all 0.2s"
                                              onmouseover="this.style.background='#f1f5f9'; this.style.color='#ef4444'" onmouseout="this.style.background='none'; this.style.color='#94a3b8'">
                                        <i data-lucide="x" style="width:10px; height:10px; pointer-events:none"></i>
                                      </button>
                                    </div>
                                  `;
          }).join('')}
                              </div>
                              
                              <!-- Total Workload Badge & View More -->
                              <div style="position:absolute; bottom:4px; right:4px; left:4px; display:flex; justify-content:space-between; align-items:center; padding:2px 6px;">
                                <div onclick="showDayDetailModal('${p.id}', '${d.dateIso}')" style="cursor:pointer; font-size:0.55rem; color:var(--primary); font-weight:700; display:flex; align-items:center; gap:2px" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
                                  <i data-lucide="maximize-2" style="width:8px; height:8px"></i> View More (${dayTasks.length})
                                </div>
                                <div onclick="showDayDetailModal('${p.id}', '${d.dateIso}')" style="background:${wlColor}; color:#fff; font-size:0.55rem; font-weight:800; padding:1px 8px; border-radius:99px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); cursor:pointer; transition:transform 0.2s" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                                  ${totalHours}%
                                </div>
                              </div>
                            ` : (isOff ? `
                              <div style="flex:1; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:.65rem; font-weight:700; letter-spacing:1px">DAY OFF</div>
                            ` : (leave ? `
                              <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fff1f2; border:1px dashed #fecaca; border-radius:4px; gap:2px">
                                <span style="color:#e11d48; font-size:.65rem; font-weight:800; text-transform:uppercase">${leave.type}</span>
                                <span style="color:#f43f5e; font-size:.55rem; font-weight:600">${leave.status === 'approved' || leave.status === 'อนุมัติแล้ว' ? 'LEAVE' : ''}</span>
                              </div>
                             ` : (holidayTasks.length > 0 ? `
                               <div class="scheduler-scrollbar" style="max-height:110px; display:flex; flex-direction:column; gap:3px; overflow-y:auto; overflow-x:hidden; padding-right:2px; margin-bottom:22px">
                                 ${holidayTasks.map((ht, hi) => {
                                   if (!ht.assignments || ht.assignments.length === 0) {
                                     return `
                                     <div style="padding:5px 8px; border-radius:6px; background:#fff; border:1px solid #e2e8f0; border-left:3px solid #f59e0b; font-size:.65rem; position:relative; box-shadow:0 1px 2px rgba(0,0,0,0.02); margin-bottom:3px;">
                                       <div style="font-weight:700; color:#f59e0b; line-height:1.2; word-break:break-word; margin-bottom:2px">${ht.section || 'Operation'}</div>
                                       <div style="font-size:0.55rem; color:#64748b; margin-top:1px; line-height:1.2; word-break:break-word; opacity:0.8;">-</div>
                                       <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:3px; gap:4px;">
                                         <div style="font-size:.55rem; font-weight:600; color:#64748b; line-height:1.1; word-break:break-word;">
                                           <span style="font-weight:400; opacity:0.8">(${ht.time || '-'})</span>
                                         </div>
                                         <div style="font-size:.6rem; font-weight:700; color:#1e293b; flex-shrink:0;">0%</div>
                                       </div>
                                     </div>
                                     `;
                                   }
                                   return ht.assignments.map(a => `
                                   <div style="padding:5px 8px; border-radius:6px; background:#fff; border:1px solid #e2e8f0; border-left:3px solid #f59e0b; font-size:.65rem; position:relative; box-shadow:0 1px 2px rgba(0,0,0,0.02); margin-bottom:3px;">
                                     <div style="font-weight:700; color:#f59e0b; line-height:1.2; word-break:break-word; margin-bottom:2px">${a.project || '-'}</div>
                                     <div style="font-size:0.55rem; color:#64748b; margin-top:1px; line-height:1.2; word-break:break-word; opacity:0.8;">${a.job || '-'}</div>
                                     <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:3px; gap:4px;">
                                       <div style="font-size:.55rem; font-weight:600; color:#64748b; line-height:1.1; word-break:break-word;">
                                         ${ht.section || '-'} <br/><span style="font-weight:400; opacity:0.8; font-size:0.5rem;">(${ht.time || '-'})</span>
                                       </div>
                                       <div style="font-size:.6rem; font-weight:700; color:#1e293b; flex-shrink:0;">${a.percent || 0}%</div>
                                     </div>
                                   </div>
                                   `).join('');
                                 }).join('')}
                               </div>
                               <!-- Total Workload Badge & View More -->
                               <div style="position:absolute; bottom:4px; right:4px; left:4px; display:flex; justify-content:space-between; align-items:center; padding:2px 6px;">
                                 <div onclick="showDayDetailModal('${p.id}', '${d.dateIso}')" style="cursor:pointer; font-size:0.55rem; color:var(--primary); font-weight:700; display:flex; align-items:center; gap:2px" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
                                   <i data-lucide="maximize-2" style="width:8px; height:8px"></i> View More (${holidayAssignmentCount})
                                 </div>
                                 <div onclick="showDayDetailModal('${p.id}', '${d.dateIso}')" style="background:${wlColorHoliday}; color:#fff; font-size:0.55rem; font-weight:800; padding:1px 8px; border-radius:99px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); cursor:pointer; transition:transform 0.2s" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                                   ${holidayTotalPct}%
                                 </div>
                               </div>
                             ` : `
                               <div style="position:absolute; bottom:6px; right:8px; font-size:0.55rem; color:#cbd5e1; font-weight:700; font-style:italic">No task</div>
                             `)))}
                          </div>
                        </td>
                      `}).join('')}
                    </tr>
                  `;
      }).join('')}
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Sidebar right placeholder -->
  <div id="taskSidebarContainer" style="position:fixed; top:0; right:${sidebarRight}; width:380px; height:100vh; background:#fff; box-shadow:-10px 0 30px rgba(0,0,0,0.1); z-index:10000; transition:right 0.3s cubic-bezier(0.4, 0, 0.2, 1)">
    ${window.IS_TASK_SIDEBAR_OPEN ? renderTaskSidebar() : ''}
  </div>
  `;
  }

  