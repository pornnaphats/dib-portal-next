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

  window.PREMIUM_SCOPE_DATA = window.PREMIUM_SCOPE_DATA || [];

  window.applyScopeDashboardFilters = function() {
    const pVal = document.getElementById('scopeFilterProject')?.value || 'all';
    const nVal = document.getElementById('scopeFilterNode')?.value || 'all';
    const qVal = document.getElementById('scopeSearch')?.value.toLowerCase() || '';

    // Filter logic for Grouped Data
    let filtered = (window.PREMIUM_SCOPE_DATA || []).map(group => {
      if (!group) return null;
      // 1. Check Project Filter
      if (pVal !== 'all' && group.account !== pVal) return null;

      // 2. Filter items by Node and Search Query
      let filteredItems = group.items || [];

      // Node Filter
      if (nVal !== 'all') {
        filteredItems = filteredItems.filter(item => item && item.node === nVal);
      }

      // Search Query Filter (Project name or Scope name)
      if (qVal) {
        filteredItems = filteredItems.filter(item => {
          if (!item) return false;
          const itemName = (item.name || '').toLowerCase();
          const groupAccount = (group.account || '').toLowerCase();
          return itemName.includes(qVal) || groupAccount.includes(qVal);
        });
      }

      if (filteredItems.length === 0) return null;

      return { ...group, items: filteredItems };
    }).filter(g => g !== null);

    // Sort filtered groups based on Cost Sheet order (Column B/C mapping)
    const costOrder = (window.COST_DATA?.projects || []).map(p => p.name);
    filtered.sort((a, b) => {
      const idxA = costOrder.indexOf(a.account);
      const idxB = costOrder.indexOf(b.account);
      if (idxA === -1 && idxB === -1) return a.account.localeCompare(b.account);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    // Generate Days from Range
    const days = getDashboardDays();

    const tbody = document.getElementById('scopeTableBody');
    const thead = document.getElementById('scopeTableHead');
    if (tbody && thead) {
      thead.innerHTML = renderScopeTableHeader(days);
      
      tbody.innerHTML = `<tr>
              <td colspan="100%" style="text-align: center; padding: 60px;">
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; color:var(--text-3);">
                  <div style="width:30px;height:30px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
                  <div style="font-size:0.9rem;font-weight:500;font-family:'Kanit', sans-serif;">Applying Filter...</div>
                </div>
              </td>
            </tr>`;
            
      // Give browser time to paint the "Applying Filter" UI before processing
      setTimeout(() => {
        const currentTbody = document.getElementById('scopeTableBody');
        if (currentTbody) {
            renderScopeTableChunked(filtered, days, currentTbody);
        }
      }, 50);
    }
  }

  window.getDashboardDays = function() {
    let startDate, endDate;
    const monthNamesShort = window.monthNamesShort || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNamesFull = window.dayNamesFull || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (window._currentDateRange && window._currentDateRange.includes(' to ')) {
      const [s, e] = window._currentDateRange.split(' to ');
      startDate = new Date(s);
      endDate = new Date(e);
    } else {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToSat = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
      
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diffToSat);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // 6 days after Saturday is Friday
      endDate.setHours(23, 59, 59, 999);
    }

    const days = [];
    let curr = new Date(startDate);
    let count = 0;
    while (curr <= endDate && count < 60) {
      days.push({
        date: `${curr.getDate()} ${monthNamesShort[curr.getMonth()]}`,
        iso: `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`,
        dayName: dayNamesFull[curr.getDay()],
        dayIdx: curr.getDay(),
        dateObj: new Date(curr)
      });
      curr.setDate(curr.getDate() + 1);
      count++;
    }
    return days;
  }

  window.renderEmployeeCompactProfile = function(displayName) {
    const emp = (window.DATA.employees || []).find(e =>
      e.name === displayName ||
      e.nickname === displayName ||
      e.nameEn === displayName
    );

    if (!emp) return `<div style="font-size: 0.85rem; font-weight: 800; color: #2563eb">${displayName}</div>`;

    // 1. Line 1: English Name + Initial
    const line1 = window.getEmployeeDisplayName(emp);

    // 2. Line 2: Position (Rounded Badge)
    const pos = emp.pos || '-';
    const posBadge = `<div style="display:inline-block; padding:2px 10px; border-radius:99px; background:rgba(37,99,235,0.08); color:#2563eb; border:1px solid rgba(37,99,235,0.2); font-size:0.6rem; font-weight:700; margin:3px 0; text-transform:uppercase">${pos}</div>`;

    // 3. Line 3: Shift
    const shift = emp.shift || '-';

    // 4. Line 4: Offdays
    const off = emp.offdays || '-';

    return `
      <div style="display:flex; flex-direction:column; align-items:center; gap:1px; line-height:1.2">
        <div style="font-size:0.75rem; font-weight:700; color:#1e293b; white-space:nowrap">${line1}</div>
        ${posBadge}
        <div style="font-size:0.6rem; color:var(--text-3); font-weight:500">${shift}</div>
        <div style="font-size:0.6rem; color:#f43f5e; font-weight:600">${off}</div>
      </div>
    `;
  }

  window.renderScopeTableHeader = function(days) {
    const localNow = new Date();
    const todayStr = `${localNow.getFullYear()}-${String(localNow.getMonth() + 1).padStart(2, '0')}-${String(localNow.getDate()).padStart(2, '0')}`;
    const colOffset = window.isScopeBulkMode ? 46 : 0;

    return `
    <tr style="background: var(--surface); position: sticky; top: 0; z-index: 20;">
      ${window.isScopeBulkMode ? `
      <th style="width: 46px; min-width: 46px; padding: 18px 12px; text-align: center; position: sticky; left: 0; top: 0; z-index: 22; background: var(--surface); border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
        <div style="display:flex; align-items:center; justify-content:center; height:100%;">
          <input type="checkbox" id="selectAllScopes" onclick="toggleAllWorkshipScope(this)" style="width: 16px; height: 16px; cursor: pointer;">
        </div>
      </th>
      ` : ''}
      <th style="width: 300px; min-width: 300px; padding: 18px 20px; text-align: left; position: sticky; left: ${colOffset}px; top: 0; z-index: 22; background: var(--surface); border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); color: #1e293b; font-weight: 700; vertical-align: middle; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
        <div style="display:flex; align-items:center; gap:8px; height:100%;">
          <i data-lucide="layers" style="width:16px; height:16px; color:#475569;"></i>
          <span>Project / Scope</span>
        </div>
      </th>
      <th style="width: 120px; min-width: 120px; padding: 18px 12px; text-align: center; position: sticky; left: ${300 + colOffset}px; top: 0; z-index: 22; background: var(--surface); border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); color: #1e293b; font-weight: 700; vertical-align: middle; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
        <div style="display:flex; align-items:center; justify-content:center; gap:6px; height:100%;">
          <i data-lucide="git-branch" style="width:14px; height:14px; color:#64748b;"></i>
          <span>Node</span>
        </div>
      </th>
      <th style="width: 130px; min-width: 130px; padding: 18px 12px; text-align: center; position: sticky; left: ${420 + colOffset}px; top: 0; z-index: 22; background: var(--surface); border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); color: #1e293b; font-weight: 700; vertical-align: middle; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
        <div style="display:flex; align-items:center; justify-content:center; gap:6px; height:100%;">
          <i data-lucide="bar-chart-3" style="width:14px; height:14px; color:#64748b;"></i>
          <span>Workload (%)</span>
        </div>
      </th>
      ${days.map(d => {
      const isWeekend = d.dayIdx === 0 || d.dayIdx === 6;
      const holidayName = (typeof window !== 'undefined' && typeof window.isThaiHoliday === 'function') ? window.isThaiHoliday(d.dateObj) : null;
      const isHoliday = !!holidayName;
      const isToday = d.iso === todayStr;

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
      
      const dayText = `<div style="font-size:0.7rem; color:${dayColor}; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px">${d.dayName}</div>`;
      
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
          <th style="padding:18px 12px; border-bottom: 1px solid var(--border); border-right:1px solid var(--border); text-align:center; background:${bg}; width:150px; min-width:150px; max-width:150px; position: sticky; top: 0; z-index: 20; vertical-align:middle; ${shadowStyle}" ${isHoliday ? `title="${holidayName}"` : ''}>
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:48px; width: 100%; overflow: hidden;">
              ${dayText}
              ${dateText}
              ${holidayBadge}
            </div>
          </th>
        `;
    }).join('')}
    </tr>
  `;
  }

  window.renderScopeTableChunked = function(data, days, tbody) {
    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${3 + days.length}" style="padding: 40px; text-align: center; color: var(--text-3)">No data found matching the selected criteria</td></tr>`;
      return;
    }
    
    tbody.innerHTML = '';
    let index = 0;
    const chunkSize = 2; // Process 2 projects at a time to prevent UI freeze

    function renderNextChunk() {
        // Stop rendering if user navigated away
        if (!document.getElementById('scopeTableBody')) return;

        if (index >= data.length) {
            if (typeof window.lucide !== 'undefined') window.lucide.createIcons({ root: tbody });
            if (typeof window.checkScopeSelection === 'function') window.checkScopeSelection();
            return;
        }

        const chunk = data.slice(index, index + chunkSize);
        const html = renderScopeTableRows(chunk, days);
        tbody.insertAdjacentHTML('beforeend', html);
        index += chunkSize;

        // Yield to browser rendering
        setTimeout(renderNextChunk, 10);
    }

    renderNextChunk();
  };

  window.renderScopeTableRows = function(data, days) {
    const colOffset = window.isScopeBulkMode ? 46 : 0;
    
    if (!data || data.length === 0) {
      return `<tr><td colspan="${(window.isScopeBulkMode ? 4 : 3) + days.length}" style="padding: 40px; text-align: center; color: var(--text-3)">No data found matching the selected criteria</td></tr>`;
    }

    const localNow = new Date();
    const todayStr = `${localNow.getFullYear()}-${String(localNow.getMonth() + 1).padStart(2, '0')}-${String(localNow.getDate()).padStart(2, '0')}`;

    let localShifts = [];
    try {
      localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch(e) {}
    
    const parseHolidayDateToISO = (dateStr) => {
      if (!dateStr) return null;
      const s = dateStr.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        const thaiMonthsFull = { 'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08', 'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12' };
        const thaiMonthsShort = { 'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12' };
      const mFull = s.match(/(\d+)\s+(\S+)\s+(\d{4})/);
      if (mFull) {
        const day = mFull[1].padStart(2, '0');
        const mon = thaiMonthsFull[mFull[2]] || thaiMonthsShort[mFull[2]] || null;
        const year = parseInt(mFull[3]) > 2500 ? parseInt(mFull[3]) - 543 : parseInt(mFull[3]);
        if (mon) return `${year}-${mon}-${day}`;
      }
      const enMonths = { 'jan':'01','feb':'02','mar':'03','apr':'04','may':'05','jun':'06','jul':'07','aug':'08','sep':'09','oct':'10','nov':'11','dec':'12' };
      const mEn = s.match(/(\d+)\s+([A-Za-z]+)\s+(\d{4})/);
      if (mEn) {
        const day = mEn[1].padStart(2, '0');
        const mon = enMonths[mEn[2].toLowerCase().substring(0,3)] || null;
        const year = parseInt(mEn[3]) > 2500 ? parseInt(mEn[3]) - 543 : parseInt(mEn[3]);
        if (mon) return `${year}-${mon}-${day}`;
      }
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        const parts = s.split('/');
        const year = parseInt(parts[2]) > 2500 ? parseInt(parts[2]) - 543 : parseInt(parts[2]);
        return `${year}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
      }
      const d = new Date(s);
      if (!isNaN(d)) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return null;
    };

    const getAccColorStyles = (acc) => {
      const baseColor = (typeof window !== 'undefined' && typeof window.colorForProject === 'function')
        ? window.colorForProject(acc)
        : '#2563eb';
      return {
        text: baseColor,
        bg: baseColor + '0a',
        border: baseColor + '15'
      };
    };

    return data.map(group => {
      const accStyle = getAccColorStyles(group.account);
      return `
      <!-- Group Header: ${group.account} -->
      <tr style="background: ${accStyle.border}">
        <td colspan="${window.isScopeBulkMode ? 2 : 1}" style="padding: 12px 20px; ${window.isScopeBulkMode ? 'padding-left: 56px;' : ''} font-weight: 800; color: ${accStyle.text}; border-bottom: 1px solid var(--border); position: sticky; left: 0; z-index: 15; background: ${accStyle.bg}">
          <div style="display: flex; align-items: center; gap: 8px">
            <i data-lucide="layers" style="width: 16px; height: 16px; color: ${accStyle.text}"></i>
            ${group.account}
          </div>
        </td>
        <td colspan="${2 + days.length}" style="border-bottom: 1px solid var(--border); background: ${accStyle.bg}"></td>
      </tr>
      ${group.items.map(item => `
      <tr class="modern-row">
        ${window.isScopeBulkMode ? `
        <td style="padding: 14px 12px; text-align: center; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--surface); position: sticky; left: 0; z-index: 10; box-shadow: var(--shadow)">
          <div style="display:flex; align-items:center; justify-content:center; height:100%;">
            <input type="checkbox" class="scope-checkbox" value="${encodeURIComponent(group.account)}|${encodeURIComponent(item.name)}" onchange="checkScopeSelection()" style="width: 16px; height: 16px; cursor: pointer;">
          </div>
        </td>
        ` : ''}
        <td style="padding: 14px 20px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--surface); position: sticky; left: ${colOffset}px; z-index: 10; box-shadow: var(--shadow)">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px">
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-2)">${item.name}</div>
            <div style="display: flex; align-items: center; gap: 4px">
              <button class="btn-icon" title="แก้ไข" onclick="showEditWorkshipScopeModal('${group.account.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}', '${item.node}', ${item.progress})" style="width: 28px; height: 28px; padding: 0; border-radius: 50%; background: var(--primary-light); color: var(--primary); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.6; transition: opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">
                <i data-lucide="edit-3" style="width: 14px; height: 14px"></i>
              </button>
              <button class="btn-icon" title="ลบ" onclick="deleteWorkshipScope('${group.account.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}')" style="width: 28px; height: 28px; padding: 0; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.6; transition: opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">
                <i data-lucide="trash-2" style="width: 14px; height: 14px"></i>
              </button>
            </div>
          </div>
        </td>
        <td style="padding: 8px 8px; text-align: center; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--surface); position: sticky; left: ${300 + colOffset}px; z-index: 10; box-shadow: var(--shadow)">
          ${renderNodeBadge(item.node)}
        </td>
        <td style="padding: 8px 8px; text-align: center; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--surface); position: sticky; left: ${420 + colOffset}px; z-index: 10; box-shadow: var(--shadow)">
          <div style="font-size: 0.7rem; font-weight: 700; color: ${item.progress > 120 ? '#991b1b' : 'var(--text-2)'}">${item.progress}%</div>
          <div style="width: 100%; height: 8px; background: #eef2ff; border-radius: 99px; overflow: hidden; margin-top: 4px; border: 1px solid var(--border)">
            <div style="width: ${Math.min(item.progress, 100)}%; height: 100%; background: ${(() => {
        const p = item.progress;
        if (p < 50) return '#ef4444'; // Red
        if (p <= 80) return '#f59e0b'; // Yellow
        if (p <= 100) return '#10b981'; // Light Green
        if (p <= 120) return '#065f46'; // Dark Green
        return '#991b1b'; // Dark Red (>120)
      })()}; border-radius: 99px"></div>
          </div>
        </td>
        ${days.map(d => {
        // Look up assigned people from Schedule
        const matchedTasks = (window.SCHEDULE_TASKS || []).filter(t =>
          t.acc === group.account &&
          t.title === item.name &&
          (t.date === d.iso || t.dateIso === d.iso)
        );

        localShifts.forEach(shift => {
          let isDateMatch = false;
          const sIso = parseHolidayDateToISO(shift.date);
          if (sIso === d.iso) isDateMatch = true;
          if (!isDateMatch && shift.date && d.date) {
             const sDateClean = shift.date.replace(/\s+/g, '').toLowerCase();
             const dDateClean = d.date.replace(/\s+/g, '').toLowerCase();
             if (sDateClean.startsWith(dDateClean)) isDateMatch = true;
          }

          if (isDateMatch) {
            (shift.tasks || []).forEach(ht => {
               let parsedAssignments = ht.assignments || [];
               if (typeof ht.assignments === 'string') {
                  try { parsedAssignments = JSON.parse(ht.assignments); } catch(e) { parsedAssignments = []; }
               }
               if (Array.isArray(parsedAssignments)) {
                  parsedAssignments.forEach(a => {
                     const aProj = (a.project || '').trim().toLowerCase();
                     const aJob = (a.job || '').trim().toLowerCase();
                     const gAcc = (group.account || '').trim().toLowerCase();
                     const iName = (item.name || '').trim().toLowerCase();
                     
                     if (aProj === gAcc && (aJob === iName || aJob.includes(iName) || iName.includes(aJob))) {
                        matchedTasks.push({ person: ht.person });
                     }
                  });
               }
            });
          }
        });

        const assignees = matchedTasks.map(t => {
          const emp = (window.DATA.employees || []).find(e => e.id === t.person || e.name === t.person || e.nickname === t.person);
          return emp ? window.getEmployeeDisplayName(emp) : t.person;
        });

        // Remove duplicates and join
        const uniqueAssignees = [...new Set(assignees.filter(a => a))];
        const displayNames = uniqueAssignees.join(', ');

        const isWeekend = d.dayIdx === 0 || d.dayIdx === 6;
        const isHoliday = (typeof window !== 'undefined' && typeof window.isThaiHoliday === 'function') ? !!window.isThaiHoliday(d.dateObj) : false;
        const isToday = d.iso === todayStr;

        let cellBg = '#fff';
        if (isToday) {
          cellBg = '#eff6ff'; // Today HSL blue
        } else if (isHoliday) {
          cellBg = '#fff1f2'; // Thai Holiday soft rose
        } else if (isWeekend) {
          cellBg = '#f8fafc'; // Weekend
        }

        return `
            <td style="padding: 12px; text-align: center; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: ${cellBg}">
              ${displayNames ? `<div style="font-size: 0.75rem; font-weight: 700; color: ${accStyle.text}; background: ${accStyle.text}10; border: 1px solid ${accStyle.text}20; padding: 4px 8px; border-radius: 6px; display: inline-block">${displayNames}</div>` : '<span style="color: #e2e8f0">-</span>'}
              ${matchedTasks.length > 0 && !displayNames ? `<span style="color:red; font-size:10px">HIDDEN MATCH</span>` : ''}
            </td>
          `;
      }).join('')}
      </tr>
    `).join('')}
    <tr style="height: 12px; background: transparent"><td colspan="${3 + days.length}"></td></tr>
    `;
    }).join('');
  }

  window.renderNodeBadge = function(node) {
    const nodeColors = {
      'Monitor': { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' },
      'Call Center': { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' },
      'Report': { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' },
      'Internal': { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
      'Content': { bg: '#fdf4ff', text: '#c026d3', border: '#fae8ff' },
      'Graphic': { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' },
      'AI': { bg: '#f5f3ff', text: '#7c3aed', border: '#ede9fe' },
      'Coordinator': { bg: '#fff1f2', text: '#e11d48', border: '#ffe4e6' },
      'Adhoc': { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' },
      'Meeting': { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' },
      'AE': { bg: '#ecfeff', text: '#0891b2', border: '#cffafe' },
      'Production': { bg: '#fff1f2', text: '#be123c', border: '#ffe4e6' },
      'Seminar': { bg: '#f0f9ff', text: '#0369a1', border: '#e0f2fe' },
      'Other': { bg: '#f8fafc', text: '#64748b', border: '#f1f5f9' }
    };
    const style = nodeColors[node] || nodeColors['Other'];
    return `
      <div style="display:inline-flex; align-items:center; justify-content:center; padding:4px 12px; border-radius:20px; background:${style.bg}; border:1px solid ${style.border}; color:${style.text}; font-size:.65rem; font-weight:700; white-space:nowrap">
        ${node}
      </div>
    `;
  }

  window.clearScopeDashboardFilters = function() {
    // 1. Reset Selects
    const pSelect = document.getElementById('scopeFilterProject');
    const nSelect = document.getElementById('scopeFilterNode');
    const sInput = document.getElementById('scopeSearch');
    if (pSelect) pSelect.value = 'all';
    if (nSelect) nSelect.value = 'all';
    if (sInput) sInput.value = '';

    // 2. Reset Date Picker
    const wrapper = document.querySelector('.date-range-wrapper');
    if (wrapper) {
      const input = wrapper.querySelector('input[type="text"]');
      if (input && input._flatpickr) {
        input._flatpickr.clear();
        const fromBox = wrapper.querySelector('div[id$="_from"] span');
        const toBox = wrapper.querySelector('div[id$="_to"] span');
        if (fromBox) fromBox.textContent = 'From';
        if (toBox) toBox.textContent = 'To';
        if (wrapper.querySelector('div[id$="_from"]')) wrapper.querySelector('div[id$="_from"]').style.color = 'var(--text-3)';
        if (wrapper.querySelector('div[id$="_to"]')) wrapper.querySelector('div[id$="_to"]').style.color = 'var(--text-3)';
      }
    }

    // 3. Re-apply
    applyScopeDashboardFilters();
  }

  window.renderPremiumScopeDashboard = function() {
    window.currentPage = 'project-scope-portal';

    // Async rendering to prevent UI freeze
    setTimeout(() => {
        const bodyEl = document.getElementById('scopeTableBody');
        if (bodyEl) {
            const days = getDashboardDays();
            
            // Sort data first
            const initialSortedData = [...(window.PREMIUM_SCOPE_DATA || [])];
            const costOrder = (window.COST_DATA?.projects || []).map(p => p.name);
            initialSortedData.sort((a, b) => {
              const idxA = costOrder.indexOf(a.account);
              const idxB = costOrder.indexOf(b.account);
              if (idxA === -1 && idxB === -1) return a.account.localeCompare(b.account);
              if (idxA === -1) return 1;
              if (idxB === -1) return -1;
              return idxA - idxB;
            });
            
            // Start chunked rendering instead of freezing the main thread
            renderScopeTableChunked(initialSortedData, days, bodyEl);
            
            // Re-apply filters after rendering starts
            if (typeof applyScopeDashboardFilters === 'function') {
                setTimeout(applyScopeDashboardFilters, 1000);
            }
        }
    }, 50);

    // Calculate Stats from Real Data
    const allScopes = (window.PREMIUM_SCOPE_DATA || []).flatMap(g => g.items);
    const totalProjects = (window.PREMIUM_SCOPE_DATA || []).length;
    const totalScopes = allScopes.length;
    const avgLoad = totalScopes > 0 ? (allScopes.reduce((s, i) => s + (i.progress || 0), 0) / totalScopes).toFixed(1) : 0;

    const highLoadCount = allScopes.filter(i => i.progress > 50).length;
    const normalLoadCount = allScopes.filter(i => i.progress >= 20 && i.progress <= 50).length;
    const lowLoadCount = allScopes.filter(i => i.progress < 20).length;

    return `
    <div class="fade-in">
      <style>
        /* Custom and Native select input override */
        #scopeFilterProject,
        #scopeFilterNode,
        #custom_wrap_scopeFilterProject .select-input,
        #custom_wrap_scopeFilterNode .select-input {
          height: 38px !important;
          border-radius: 99px !important;
          border: 1.5px solid var(--border) !important;
          background: var(--surface) !important;
          padding: 0 32px 0 16px !important;
          font-weight: 500;
          transition: all 0.2s ease !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
          background-repeat: no-repeat !important;
          background-position: right 14px center !important;
          background-size: 12px !important;
        }
        #scopeFilterProject:hover,
        #scopeFilterNode:hover,
        #custom_wrap_scopeFilterProject .select-input:hover,
        #custom_wrap_scopeFilterNode .select-input:hover {
          border-color: var(--primary) !important;
        }
        
        /* Date range input override */
        div[id$="_from"], 
        div[id$="_to"] { 
          height: 38px !important; 
          border-radius: 99px !important;
          border: 1.5px solid var(--border) !important;
          background: var(--surface) !important;
          padding: 0 16px !important;
          font-size: 0.8rem !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
          transition: all 0.2s ease !important;
        }
        div[id$="_from"]:hover, 
        div[id$="_to"]:hover { 
          border-color: var(--primary) !important;
        }

        /* Search box override */
        .scope-search-box {
          border-radius: 99px !important;
          height: 38px !important;
          border: 1.5px solid var(--border) !important;
          background: var(--surface) !important;
          padding: 0 16px !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
          width: 220px !important;
          min-width: 220px !important;
          flex-shrink: 0 !important;
        }
        .scope-search-box:focus-within {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
        }
        
        /* Stats Cards custom design */
        .scope-stat-card {
          border-radius: 20px !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          background: var(--surface) !important;
        }
        .scope-stat-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 30px rgba(99, 102, 241, 0.08) !important;
          border-color: rgba(99, 102, 241, 0.2) !important;
        }

        /* Buttons styling */
        .scope-btn-pill {
          border-radius: 99px !important;
          height: 38px !important;
          padding: 0 20px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          display: inline-flex;
          align-items: center !important;
          gap: 8px !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
        }

        #scopeFilterProject,
        #custom_wrap_scopeFilterProject {
          min-width: 180px !important;
        }
        #scopeFilterNode,
        #custom_wrap_scopeFilterNode {
          min-width: 160px !important;
        }

        /* Table styling */
        .scope-table-container {
          border-radius: 24px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04) !important;
          border: 1px solid var(--border) !important;
          overflow: auto !important;
        }
      </style>

      <!-- DASHBOARD HEADER AREA -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px">
        <div></div>
        
        <!-- Filter Toolbar -->
        <div style="display: flex; align-items: center; gap: 8px; z-index: 100">
          ${renderDateFilter('applyScopeDashboardFilters()', 'auto', null, false)}

          <!-- Search Box -->
          <div class="search-box scope-search-box" style="width: 220px; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="search" style="width: 14px; height: 14px; color: var(--text-3)"></i>
            <input type="text" id="scopeSearch" oninput="applyScopeDashboardFilters()" placeholder="Search Project or Scope..." style="background: none; border: none; outline: none; font-size: 0.75rem; width: 100%; color: var(--text); font-family: 'Kanit', sans-serif">
          </div>

          <select id="scopeFilterProject" onchange="applyScopeDashboardFilters()" class="select-input" style="height: 38px; min-width: 180px; padding: 0 10px; border-radius: var(--radius-sm); font-size: 0.8rem; border: 1px solid var(--border); background: var(--surface2); color: var(--text); outline: none">
            <option value="all">All Projects</option>
            ${(() => {
        // Use dynamically fetched accounts
        if (!window.PROJECT_ACCOUNTS || window.PROJECT_ACCOUNTS.length === 0) {
          window.PROJECT_ACCOUNTS = [...new Set((window.PREMIUM_SCOPE_DATA || []).map(g => g.account))].filter(Boolean).sort();
        }
        const projects = window.PROJECT_ACCOUNTS.length > 0 ? window.PROJECT_ACCOUNTS : ['AFNC', 'ETDA', 'CALL CENTER', 'Media I Graphic', 'Media I Content', 'TCP', 'GC', 'AI', 'MOC', 'ตรวจจับ'];
        // Get order from Cost Sheet (Column B/C) if available
        const costOrder = (window.COST_DATA?.projects || []).map(p => p.name);

        // Sort based on costOrder
        const sortedProjects = [...projects].sort((a, b) => {
          const idxA = costOrder.indexOf(a);
          const idxB = costOrder.indexOf(b);
          if (idxA === -1 && idxB === -1) return a.localeCompare(b);
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });

        return sortedProjects.map(p => `<option value="${p}">${p}</option>`).join('');
      })()}
          </select>
          <select id="scopeFilterNode" onchange="applyScopeDashboardFilters()" class="select-input" style="height: 38px; min-width: 160px; padding: 0 10px; border-radius: var(--radius-sm); font-size: 0.8rem; border: 1px solid var(--border); background: var(--surface2); color: var(--text); outline: none">
            <option value="all">All Nodes</option>
            ${(() => {
        const nodes = window.PROJECT_NODES || ['Adhoc', 'AE', 'AI', 'Content', 'Coordinator', 'Graphic', 'Internal', 'Meeting', 'Monitor', 'Other', 'Production', 'Report', 'Seminar'];
        return nodes.map(n => `<option value="${n}">${n}</option>`).join('');
      })()}
          </select>

          <button class="scope-btn-pill btn btn-danger" style="background: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);" onclick="clearScopeDashboardFilters()">
            <i data-lucide="rotate-ccw" style="width: 13px; height: 13px"></i> Clear All Filter
          </button>
        </div>
      </div>

      <!-- STATS CARDS GRID -->
      <div class="stats-grid" style="margin-bottom: 24px">
        <!-- Card: Total Projects -->
        <div class="stat-card scope-stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4)">
            <i data-lucide="briefcase" style="width: 20px; height: 20px"></i>
          </div>
          <div style="min-width: 0">
            <div style="font-size: 0.68rem; color: var(--text-3); margin-bottom: 1px">Managed Projects</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--text)">${fmt(totalProjects)}</div>
            <div style="font-size: 0.68rem; color: var(--text-3)">Projects</div>
          </div>
        </div>
        
        <!-- Card: Total Scopes -->
        <div class="stat-card scope-stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4)">
            <i data-lucide="pie-chart" style="width: 20px; height: 20px"></i>
          </div>
          <div style="min-width: 0">
            <div style="font-size: 0.68rem; color: var(--text-3); margin-bottom: 1px">Total Scopes</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--text)">${fmt(totalScopes)}</div>
            <div style="font-size: 0.68rem; color: var(--text-3)">Scopes</div>
          </div>
        </div>

        <!-- Card: Allocation Circle -->
        <div class="stat-card scope-stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 50%; background: var(--warn); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4)">
             <div style="width: 32px; height: 32px; position: relative">
              <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg)">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255, 255, 255, 0.2)" stroke-width="4"></circle>
                <circle cx="18" cy="18" r="16" fill="none" stroke="white" stroke-width="4" stroke-dasharray="${avgLoad}, 100" stroke-linecap="round"></circle>
              </svg>
            </div>
          </div>
          <div style="min-width: 0">
            <div style="font-size: 0.68rem; color: var(--text-3); margin-bottom: 1px">Avg. Workload</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--text)">${avgLoad}%</div>
            <div style="font-size: 0.68rem; color: var(--warn); font-weight: 600">per Project</div>
          </div>
        </div>

        <!-- Card: High Workload -->
        <div class="stat-card scope-stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 50%; background: var(--danger); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4)">
            <i data-lucide="trending-up" style="width: 20px; height: 20px"></i>
          </div>
          <div style="min-width: 0">
            <div style="font-size: 0.68rem; color: var(--text-3); margin-bottom: 1px">High Load (>50%)</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--danger)">${fmt(highLoadCount)}</div>
            <div style="font-size: 0.68rem; color: var(--text-3)">Scopes</div>
          </div>
        </div>

        <!-- Card: Normal Workload -->
        <div class="stat-card scope-stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4)">
            <i data-lucide="bar-chart-2" style="width: 20px; height: 20px"></i>
          </div>
          <div style="min-width: 0">
            <div style="font-size: 0.68rem; color: var(--text-3); margin-bottom: 1px">Normal Load</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--accent)">${fmt(normalLoadCount)}</div>
            <div style="font-size: 0.68rem; color: var(--text-3)">Scopes</div>
          </div>
        </div>

        <!-- Card: Low Workload -->
        <div class="stat-card scope-stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4)">
            <i data-lucide="minus" style="width: 20px; height: 20px"></i>
          </div>
          <div style="min-width: 0">
            <div style="font-size: 0.68rem; color: var(--text-3); margin-bottom: 1px">Low Load</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--primary)">${fmt(lowLoadCount)}</div>
            <div style="font-size: 0.68rem; color: var(--text-3)">Scopes</div>
          </div>
        </div>
      </div>

      <!-- TABLE AREA -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; margin-top: 10px">
        <div style="display: flex; align-items: center; gap: 12px">
          <h3 class="section-title" style="margin: 0">Scope Workload Details</h3>
          <button id="bulkDeleteScopeBtn" onclick="bulkDeleteWorkshipScope()" class="scope-btn-pill btn btn-sm btn-danger" style="display: none; align-items: center;">
            <i data-lucide="trash-2" style="width: 14px; height: 14px"></i> Delete Selected
          </button>
          <button id="bulkDeselectScopeBtn" onclick="toggleAllWorkshipScope({checked: false})" class="scope-btn-pill btn btn-sm btn-outline" style="display: none; align-items: center; background: #fff; border-color: var(--border);">
            <i data-lucide="x-square" style="width: 14px; height: 14px"></i> Clear Selection
          </button>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="toggleScopeBulkMode()" class="scope-btn-pill btn btn-outline" style="background: ${window.isScopeBulkMode ? '#fef2f2' : '#fff'}; color: ${window.isScopeBulkMode ? '#ef4444' : 'var(--text-2)'}; border-color: ${window.isScopeBulkMode ? '#fecaca' : 'var(--border)'}">
            <i data-lucide="check-square" style="width: 16px; height: 16px"></i> ${window.isScopeBulkMode ? 'Cancel Selection' : 'Select Multiple'}
          </button>
          <button onclick="showAddWorkshipScopeModal()" class="scope-btn-pill btn btn-primary">
            <i data-lucide="plus-circle" style="width: 16px; height: 16px"></i> Add Scope
          </button>
        </div>
      </div>

      <div id="scopeTableWrap" class="table-wrap scope-table-container" style="max-height: calc(100vh - 260px); background: var(--surface); width: 100%; max-width: calc(100vw - var(--sidebar-w) - 60px); overflow: auto;">
        <table class="data-table" style="border: none; width: max-content; min-width: 100%; border-collapse: separate; border-spacing: 0">
          <thead id="scopeTableHead">
            ${renderScopeTableHeader(getDashboardDays())}
          </thead>
          <tbody id="scopeTableBody">
            <tr>
              <td colspan="100%" style="text-align: center; padding: 60px;">
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; color:var(--text-3);">
                  <div style="width:30px;height:30px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
                  <div style="font-size:0.9rem;font-weight:500;font-family:'Kanit', sans-serif;">Loading Scope Data...</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  }

  window.handleTaskDragStart = function (e, taskId) {
    e.dataTransfer.setData('taskId', taskId);
  };

  window.handleTaskDragEnd = function (e) {
    e.dataTransfer.clearData();
  };

  window.handleTaskDrop = function (e, person, dayIndex) {
    e.preventDefault();
    const rawTaskId = e.dataTransfer.getData('taskId');
    console.log("Dropped task:", rawTaskId, "to", person, "day", dayIndex);

    if (rawTaskId.startsWith('unassigned-')) {
      const taskId = rawTaskId.replace('unassigned-', '');
      const task = window.UNASSIGNED_TASKS.find(t => t.id === taskId);
      if (task) {
        // Clone the task so it remains in the sidebar for assigning to multiple people
        const clonedTask = { ...task, id: task.id + '_' + Date.now() + Math.floor(Math.random() * 1000), person, day: dayIndex };
        window.SCHEDULE_TASKS.push(clonedTask);
      }
    } else if (rawTaskId.startsWith('scheduled-')) {
      const taskId = rawTaskId.replace('scheduled-', '');
      const task = window.SCHEDULE_TASKS.find(t => t.id === taskId);
      if (task) {
        // Move the task to a new person/day
        task.person = person;
        task.day = dayIndex;
      }
    } else {
      const allUnassigned = [...(window.UNASSIGNED_TASKS || []), ...getTasksFromScope()];
      const task = allUnassigned.find(t => t.id === rawTaskId);
      if (task) {
        const clonedTask = { ...task, id: task.id + '_' + Date.now(), person, day: dayIndex };
        window.SCHEDULE_TASKS.push(clonedTask);
      }
    }

    const contentEl = document.getElementById('pageContent');
    if (contentEl) {
      contentEl.innerHTML = pageSchedule();
      if (window.lucide) lucide.createIcons({ root: contentEl });
    }

    // Re-calculate the filter since we didn't remove it from sidebar, but just in case
    const projectFilter = document.getElementById('projectFilter');
    if (projectFilter) filterByProject();
  };

  window.renderPremiumSubScope = function(date, name, node, progress) {
    const nodeColors = {
      'Monitor': { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' },
      'Report': { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' },
      'Internal': { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
      'Content': { bg: '#fdf4ff', text: '#c026d3', border: '#fae8ff' },
      'Graphic': { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' },
      'Coordinator': { bg: '#fff1f2', text: '#e11d48', border: '#ffe4e6' },
      'AI': { bg: '#f5f3ff', text: '#7c3aed', border: '#ede9fe' },
      'Adhoc': { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' },
      'Meeting': { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' },
      'AE': { bg: '#f0f9ff', text: '#0369a1', border: '#e0f2fe' },
      'Production': { bg: '#faf5ff', text: '#7e22ce', border: '#f3e8ff' },
      'Seminar': { bg: '#f0fdfa', text: '#0f766e', border: '#ccfbf1' },
      'Other': { bg: '#f8fafc', text: '#64748b', border: '#f1f5f9' }
    };

    const style = nodeColors[node] || nodeColors['Other'];
    let barColor = '#3b82f6';
    if (progress >= 80) { barColor = '#10b981'; }
    else if (progress <= 20) { barColor = '#94a3b8'; }
    else if (progress > 50) { barColor = '#f59e0b'; }



    return `
    <tr class="modern-row">
      <td style="padding: 12px 16px; text-align: center; border-bottom: 1px solid var(--border)">
        <div style="font-size: 0.75rem; color: var(--text-2); font-weight: 500">${date}</div>
      </td>
      <td style="padding: 12px 24px; border-bottom: 1px solid var(--border)">
        <div style="font-size: 0.85rem; font-weight: 500; color: var(--text-2)">${name}</div>
      </td>
      <td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid var(--border)">
        <span style="display: inline-flex; align-items: center; padding: 3px 12px; background: ${style.bg}; color: ${style.text}; border: 1px solid ${style.border}; border-radius: 6px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase">
          ${node}
        </span>
      </td>
      <td style="padding: 12px 24px; text-align: center; border-bottom: 1px solid var(--border)">
        <div style="display: flex; align-items: center; gap: 10px; justify-content: center">
          <div style="flex: 1; max-width: 80px; height: 5px; background: var(--bg); border-radius: var(--radius-sm); overflow: hidden">
            <div style="width: ${progress}%; height: 100%; background: ${barColor}; border-radius: var(--radius-sm)"></div>
          </div>
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--text); min-width: 30px">${progress}%</span>
        </div>
      </td>
    </tr>
  `;
  }

  // Add Task Modal Function
  window.showAddWorkshipScopeModal = function () {
    console.log('Workship Scope: Opening Add Scope Modal...');
    if (document.getElementById('addScopeModal')) return;

    const accounts = window.PROJECT_ACCOUNTS || ['AFNC', 'ETDA', 'CALL CENTER', 'Media I Graphic', 'Media I Content', 'TCP', 'GC', 'AI', 'MOC', 'ตรวจจับ'];
    const nodes = window.PROJECT_NODES || ['Adhoc', 'AE', 'AI', 'Call Center', 'Content', 'Coordinator', 'Graphic', 'Internal', 'Meeting', 'Monitor', 'Other', 'Production', 'Report', 'Seminar'];

    const modalHtml = `
    <div id="addScopeModal" style="position: fixed; inset: 0; background: rgba(15,23,42,0.3); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; font-family: 'Kanit', sans-serif;">
      <div style="background: white; width: 480px; border-radius: 24px; padding: 32px; box-shadow: var(--shadow); transform: translateY(0); transition: all 0.3s">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">
          <h2 style="margin: 0; font-size: 1.4rem; font-weight: 800; color: #1e293b">Add New Scope</h2>
          <button onclick="document.getElementById('addScopeModal').remove()" style="background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center">
            <i data-lucide="x" style="width: 18px; height: 18px"></i>
          </button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 20px">
          <!-- Account Selection -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Project</label>
            <div style="display: flex; gap: 8px">
              <select id="scopeAccount" onchange="toggleNewAccountInput(this.value); this.style.color = (this.value && this.value !== 'NEW') ? window.colorForProject(this.value) : '';" style="flex: 1; padding: 12px 20px; border: 1.5px solid #e2e8f0; border-radius: 99px; font-family: inherit; outline: none; background: #f8fafc; font-size: 13px; font-weight: 600; transition: color 0.2s;">
                <option value="" selected disabled style="color: #64748b;">---Select Project---</option>
                ${accounts.map(a => {
                  const c = typeof window.colorForProject === 'function' ? window.colorForProject(a) : '#6366f1';
                  return `<option value="${a}" style="color: ${c}; font-weight: 600;">● ${a}</option>`;
                }).join('')}
                <option value="NEW" style="color: #6366f1; font-weight: 700;">+ Add New Project</option>
              </select>
              <input id="newAccountInput" type="text" placeholder="Enter new project name" style="display: none; flex: 1.5; padding: 12px 20px; border: 1.5px solid #6366f1; border-radius: 99px; font-family: inherit; outline: none; font-size: 13px;">
            </div>
          </div>

          <!-- Node Selection -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Node</label>
            <select id="scopeNode" style="width: 100%; padding: 12px 20px; border: 1.5px solid #e2e8f0; border-radius: 99px; font-family: inherit; outline: none; background: #f8fafc; font-size: 13px;">
              <option value="" selected disabled>--- Select Node ---</option>
              ${nodes.map(n => `<option value="${n}">${n}</option>`).join('')}
            </select>
          </div>

          <!-- Work Detail -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Scope / Details</label>
            <input id="scopeDetail" type="text" placeholder="e.g., Social Monitoring Plan" style="width: 100%; padding: 12px 20px; border: 1.5px solid #e2e8f0; border-radius: 99px; font-family: inherit; outline: none; font-size: 13px;">
          </div>

          <!-- Proportion % -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Workload (%)</label>
            <div style="display: flex; align-items: center; gap: 12px">
              <input id="scopePercent" type="number" value="0" min="0" max="1000" style="width: 80px; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 99px; font-family: inherit; outline: none; text-align: center; font-size: 13px;">
              <input type="range" min="0" max="200" value="0" oninput="document.getElementById('scopePercent').value = this.value" style="flex: 1; accent-color: #6366f1">
            </div>
          </div>

          <button onclick="saveNewWorkshipScope()" class="scope-btn-pill btn btn-primary" style="margin-top: 12px; width: 100%; justify-content: center; box-shadow: 0 4px 12px rgba(99,102,241,0.2);">
            Save Scope
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons({ root: document.body });
  }

  window.toggleNewAccountInput = function (val) {
    const input = document.getElementById('newAccountInput');
    input.style.display = (val === 'NEW') ? 'block' : 'none';
  }

  window.saveNewWorkshipScope = function (isEdit = false) {
    const accSelect = document.getElementById('scopeAccount').value;
    const accNew = document.getElementById('newAccountInput') ? document.getElementById('newAccountInput').value : '';
    const account = (accSelect === 'NEW') ? accNew : accSelect;
    const node = document.getElementById('scopeNode').value;
    const detail = document.getElementById('scopeDetail').value;
    const percent = document.getElementById('scopePercent').value;
    const originalName = isEdit ? document.getElementById('originalScopeName').value : null;

    if (!account || !node || !detail) {
      window.showToast('Please fill in all required fields and selections', 'danger');
      return;
    }

    console.log('Saving scope:', { account, node, detail, percent, isEdit });

    // 1. Optimistic UI Update & ID generation
    let targetItemId = null;
    if (isEdit) {
      // Find and update existing
      window.PREMIUM_SCOPE_DATA.forEach(group => {
        const item = group.items.find(it => it.name === originalName);
        if (item) {
          item.name = detail;
          item.node = node;
          item.progress = parseInt(percent) || 0;
          targetItemId = item.id;
        }
      });
    } else {
      // Add new
      targetItemId = 'SCOPE_' + Date.now() + Math.floor(Math.random() * 1000);
      const newItem = {
        id: targetItemId,
        name: detail,
        node: node,
        progress: parseInt(percent) || 0,
        daily: {}
      };

      let group = (window.PREMIUM_SCOPE_DATA || []).find(g => g.account === account);
      if (!group) {
        group = { account: account, items: [] };
        window.PREMIUM_SCOPE_DATA.push(group);
      }
      group.items.push(newItem);

      // If it's a new project, add to all possible global accounts lists for dropdowns
      if (accSelect === 'NEW') {
        console.log('SaveScope: Adding new project to lists:', account);

        // 1. Update PROJECT_ACCOUNTS (Primary source for filters)
        if (!window.PROJECT_ACCOUNTS) {
          window.PROJECT_ACCOUNTS = (window.PREMIUM_SCOPE_DATA || []).map(g => g.account);
        }
        if (!window.PROJECT_ACCOUNTS.includes(account)) {
          window.PROJECT_ACCOUNTS.push(account);
          window.PROJECT_ACCOUNTS.sort();
        }

        // 2. Update window.WS_DATA.accounts (Secondary source)
        if (window.WS_DATA && window.WS_DATA.accounts) {
          if (!window.WS_DATA.accounts.find(a => a.name === account)) {
            window.WS_DATA.accounts.push({ id: account, name: account, node: node });
          }
        }
      }
    }

    // 2. Re-render UI
    if (typeof navigate === 'function') {
      console.log('SaveScope: Re-navigating to project-scope-portal');
      // Use system-wide navigation for a clean re-render
      navigate('project-scope-portal');
    } else if (typeof applyScopeDashboardFilters === 'function') {
      applyScopeDashboardFilters();
    }

    // 3. Save to Supabase (Async)
    if (accSelect === 'NEW' && !isEdit) {
      window.apiSaveWorkshipScope({
        id: targetItemId,
        action: 'add_workship_scope',
        account, node, category: node, detail, percent
      });
    } else {
      window.apiSaveWorkshipScope({
        id: targetItemId,
        action: isEdit ? 'edit_workship_scope' : 'add_workship_scope',
        account, node, category: node, detail, percent, originalName
      });
    }

    window.showToast(isEdit ? 'Data updated successfully' : 'Data saved successfully');
    document.getElementById('addScopeModal').remove();
  }

  window.showEditWorkshipScopeModal = function (acc, name, node, progress) {
    console.log('Workship Scope: Opening Edit Modal for:', name);
    if (document.getElementById('addScopeModal')) return;

    const accounts = window.PROJECT_ACCOUNTS || ['AFNC', 'ETDA', 'CALL CENTER', 'Media I Graphic', 'Media I Content', 'TCP', 'GC', 'AI', 'MOC', 'ตรวจจับ'];
    const nodes = window.PROJECT_NODES || ['Adhoc', 'AE', 'AI', 'Content', 'Coordinator', 'Graphic', 'Internal', 'Meeting', 'Monitor', 'Other', 'Production', 'Report', 'Seminar'];

    const modalHtml = `
    <div id="addScopeModal" style="position: fixed; inset: 0; background: rgba(15,23,42,0.3); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; font-family: 'Kanit', sans-serif;">
      <div class="fade-in" style="background: white; width: 100%; max-width: 500px; border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; position: relative;">
        <!-- Header -->
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; display: flex; justify-content: space-between; align-items: center">
          <div>
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700">Edit Scope Details</h2>
            <p style="margin: 4px 0 0; font-size: 0.8rem; opacity: 0.9">Update workload and details</p>
          </div>
          <button onclick="document.getElementById('addScopeModal').remove()" style="background: rgba(255,255,255,0.2); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; color: white; display: flex; align-items: center; justify-content: center">
            <i data-lucide="x" style="width: 18px; height: 18px"></i>
          </button>
        </div>

        <!-- Body -->
        <div style="padding: 32px; display: flex; flex-direction: column; gap: 24px">
          <!-- Hidden Field for Original Name (to identify row in Sheet) -->
          <input type="hidden" id="originalScopeName" value="${name}">

          <!-- Account Selection -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Project</label>
            <select id="scopeAccount" onchange="this.style.color = window.colorForProject(this.value);" style="width: 100%; padding: 12px 20px; border: 1.5px solid #e2e8f0; border-radius: 99px; font-family: inherit; outline: none; background: #f8fafc; font-size: 13px; font-weight: 600; color: ${typeof window.colorForProject === 'function' ? window.colorForProject(acc) : '#6366f1'}; transition: color 0.2s;">
              ${accounts.map(a => {
                const c = typeof window.colorForProject === 'function' ? window.colorForProject(a) : '#6366f1';
                return `<option value="${a}" style="color: ${c}; font-weight: 600;" ${a === acc ? 'selected' : ''}>● ${a}</option>`;
              }).join('')}
              ${!accounts.includes(acc) ? `<option value="${acc}" style="color: ${window.colorForProject(acc)}; font-weight: 600;" selected>● ${acc}</option>` : ''}
            </select>
          </div>

          <!-- Node Selection -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Node</label>
            <select id="scopeNode" style="width: 100%; padding: 12px 20px; border: 1.5px solid #e2e8f0; border-radius: 99px; font-family: inherit; outline: none; background: #f8fafc; font-size: 13px;">
              ${nodes.map(n => `<option value="${n}" ${n === node ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
          </div>

          <!-- Work Detail -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Scope / Details</label>
            <input id="scopeDetail" type="text" value="${name}" style="width: 100%; padding: 12px 20px; border: 1.5px solid #e2e8f0; border-radius: 99px; font-family: inherit; outline: none; font-size: 13px;">
          </div>

          <!-- Proportion % -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Workload (%)</label>
            <div style="display: flex; align-items: center; gap: 12px">
              <input id="scopePercent" type="number" value="${progress}" min="0" max="1000" style="width: 80px; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 99px; font-family: inherit; outline: none; text-align: center; font-size: 13px;">
              <input type="range" min="0" max="200" value="${progress}" oninput="document.getElementById('scopePercent').value = this.value" style="flex: 1; accent-color: #6366f1">
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 12px; margin-top: 8px">
            <button onclick="deleteWorkshipScope('${acc.replace(/'/g, "\\'")}', '${name.replace(/'/g, "\\'")}')" class="scope-btn-pill btn btn-danger" style="flex: 1; justify-content: center; background: #fef2f2; color: #ef4444; border: 1.5px solid #fee2e2;">Delete</button>
            <button onclick="document.getElementById('addScopeModal').remove()" class="scope-btn-pill btn btn-outline" style="flex: 1; justify-content: center; background: white; color: #64748b; border: 1.5px solid #e2e8f0;">Cancel</button>
            <button onclick="saveNewWorkshipScope(true)" class="scope-btn-pill btn btn-primary" style="flex: 2; justify-content: center; box-shadow: 0 4px 12px rgba(99,102,241,0.2);">Update Scope</button>
          </div>
        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons({ root: document.getElementById('addScopeModal') });
  }

  window.isScopeBulkMode = false;
  window.toggleScopeBulkMode = function() {
    window.isScopeBulkMode = !window.isScopeBulkMode;
    if (typeof applyScopeDashboardFilters === 'function') {
      applyScopeDashboardFilters();
    }
    setTimeout(checkScopeSelection, 50);
  };

  window.checkScopeSelection = function() {
    const checked = document.querySelectorAll('.scope-checkbox:checked');
    const btn = document.getElementById('bulkDeleteScopeBtn');
    const deselectBtn = document.getElementById('bulkDeselectScopeBtn');
    if (btn) {
      if (window.isScopeBulkMode) {
        btn.style.display = 'inline-flex';
        btn.innerHTML = `<i data-lucide="trash-2" style="width: 14px; height: 14px"></i> Delete Selected (${checked.length})`;
        if (deselectBtn) deselectBtn.style.display = 'inline-flex';
        if (window.lucide) {
          lucide.createIcons({ root: btn });
          if (deselectBtn) lucide.createIcons({ root: deselectBtn });
        }
      } else {
        btn.style.display = 'none';
        if (deselectBtn) deselectBtn.style.display = 'none';
      }
    }
    const checkAll = document.getElementById('selectAllScopes');
    if (checkAll) {
      const all = document.querySelectorAll('.scope-checkbox');
      checkAll.checked = all.length > 0 && checked.length === all.length;
    }
  };

  window.toggleAllWorkshipScope = function(el) {
    const checkboxes = document.querySelectorAll('.scope-checkbox');
    checkboxes.forEach(cb => cb.checked = el.checked);
    checkScopeSelection();
  };

  window.bulkDeleteWorkshipScope = function() {
    const checked = document.querySelectorAll('.scope-checkbox:checked');
    if (checked.length === 0) return;
    
    showConfirmModal({
      title: 'Confirm Bulk Deletion',
      message: `Are you sure you want to delete ${checked.length} selected scopes? <br><br><span style="color: #ef4444; font-weight: 600">This action cannot be undone.</span>`,
      confirmText: 'Delete All',
      type: 'danger',
      onConfirm: () => {
        checked.forEach(cb => {
          const parts = cb.value.split('|');
          const account = decodeURIComponent(parts[0]);
          const name = decodeURIComponent(parts[1]);
          
          const groupIndex = window.PREMIUM_SCOPE_DATA.findIndex(g => g.account === account);
          if (groupIndex > -1) {
            const itemIndex = window.PREMIUM_SCOPE_DATA[groupIndex].items.findIndex(i => i.name === name);
            if (itemIndex > -1) {
              window.PREMIUM_SCOPE_DATA[groupIndex].items.splice(itemIndex, 1);
            }
            if (window.PREMIUM_SCOPE_DATA[groupIndex].items.length === 0) {
              window.PREMIUM_SCOPE_DATA.splice(groupIndex, 1);
            }
          }

          const deletedScopes = JSON.parse(localStorage.getItem('ws_deleted_scopes') || '[]');
          deletedScopes.push({ account, name, time: Date.now() });
          localStorage.setItem('ws_deleted_scopes', JSON.stringify(deletedScopes));

          window.apiSaveWorkshipScope({
            action: 'delete_workship_scope',
            account,
            detail: name
          });
        });
        
        if (typeof applyScopeDashboardFilters === 'function') {
          applyScopeDashboardFilters();
        }
        window.showToast(`${checked.length} items deleted successfully`);
        checkScopeSelection();
      }
    });
  };

  window.deleteWorkshipScope = function (account, name) {
    showConfirmModal({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${name}" from project "${account}"? <br><br><span style="color: #ef4444; font-weight: 600">This action cannot be undone and will permanently delete the record from Google Sheets.</span>`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        console.log('Deleting scope:', { account, name });

        // 1. Optimistic UI Update: Find group and remove item
        const group = window.PREMIUM_SCOPE_DATA.find(g => g.account === account);
        if (group) {
          group.items = group.items.filter(it => it.name !== name);
        }

        // 1.5 Cache deletion to hide it for 5 minutes during Google CDN cache refresh
        const deletedScopes = JSON.parse(localStorage.getItem('ws_deleted_scopes') || '[]');
        deletedScopes.push({ account, name, time: Date.now() });
        localStorage.setItem('ws_deleted_scopes', JSON.stringify(deletedScopes));

        // 2. Re-render table
        if (typeof applyScopeDashboardFilters === 'function') {
          applyScopeDashboardFilters();
        }

        // 3. Save to Google Sheets (Async)
        window.apiSaveWorkshipScope({
          action: 'delete_workship_scope',
          account,
          detail: name
        });

        window.showToast('Item deleted successfully');
        const modal = document.getElementById('addScopeModal');
        if (modal) modal.remove();
      }
    });
  }



  window.apiSaveWorkshipScope = async function (data) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase config is missing for Scope Sync");
      return;
    }

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    };

    console.log("Scope Sync: Sending payload to Supabase:", data);

    try {
      if (data.action === 'add_workship_scope' || data.action === 'edit_workship_scope') {
        const payload = {
          id: data.id || ('SCOPE_' + Date.now()),
          project: data.account,
          node: data.node,
          work_detail: data.detail,
          percentage: parseInt(data.percent) || 0
        };

        await fetch(`${supabaseUrl}/rest/v1/project_scopes`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      } else if (data.action === 'delete_workship_scope') {
        let deleteUrl = `${supabaseUrl}/rest/v1/project_scopes`;
        if (data.id) {
          deleteUrl += `?id=eq.${data.id}`;
        } else {
          deleteUrl += `?project=eq.${encodeURIComponent(data.account)}&work_detail=eq.${encodeURIComponent(data.detail)}`;
        }
        await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
      }
      console.log("Scope Sync: Request completed successfully.");
    } catch (err) {
      console.error("Scope Sync Error:", err);
    }
  };

  window.colorForNode = function (node) {
    const nodeColors = {
      'Monitor': '#2563eb',
      'Report': '#d97706',
      'Internal': '#475569',
      'Content': '#c026d3',
      'Graphic': '#16a34a',
      'Coordinator': '#e11d48',
      'AI': '#7c3aed',
      'Adhoc': '#ea580c',
      'Meeting': '#059669',
      'AE': '#0369a1',
      'Production': '#7e22ce',
      'Seminar': '#0f766e',
      'Other': '#64748b'
    };
    return nodeColors[node] || nodeColors['Other'];
  };

  window.getPremiumDayLabel = function(d) {
    const days = ['ส.', 'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.'];
    return days[(d + 5) % 7];
  }

  // ---------- SCHEDULE ----------

  // Global state for scheduler (module scope)
  window.SCHEDULE_TASKS = window.SCHEDULE_TASKS || [
    { id: 't1', person: 'Nattapol K.', day: 0, title: 'ประชุมทีมโครงการ', acc: 'DIB-Solar Farm', color: '#6366f1', hours: 40 },
    { id: 't2', person: 'Nattapol K.', day: 0, title: 'Review Report', acc: 'DIB-Warehouse', color: '#a855f7', hours: 60 },
    { id: 't3', person: 'Kannika S.', day: 2, title: 'Workshop', acc: 'Project Efficiency', color: '#f97316', hours: 100 },
    { id: 't4', person: 'Phisit T.', day: 3, title: 'วางแผนงานงวดถัดไป', acc: 'Sale Pipeline', color: '#3b82f6', hours: 50 },
    { id: 't5', person: 'Phisit T.', day: 4, title: 'นำเสนอความคืบหน้า', acc: 'DIB-Data Center', color: '#f59e0b', hours: 50 },
    { id: 't6', person: 'Jirawat P.', day: 3, title: 'Training: Excel', acc: 'Internal', color: '#10b981', hours: 30 },
    { id: 't7', person: 'Patchanee K.', day: 4, title: 'Monthly Meeting', acc: 'Admin', color: '#3b82f6', hours: 20 }
  ];

  window.UNASSIGNED_TASKS = window.UNASSIGNED_TASKS || [
    { id: 'u1', title: 'จัดทำรายงานสรุป Q2', acc: 'Management', color: '#6366f1', hours: 40 },
    { id: 'u2', title: 'สำรวจพื้นที่ติดตั้ง Solar', acc: 'DIB-Solar Rooftop', color: '#10b981', hours: 80 },
    { id: 'u3', title: 'ประชุมประสานงาน กฟภ.', acc: 'DIB-Solar Rooftop', color: '#10b981', hours: 30 },
    { id: 'u4', title: 'ประชุมประสานงาน กฟภ.', acc: 'DIB-Other', color: '#f59e0b', hours: 20 },
    { id: 'u5', title: 'ตรวจสอบงบประมาณประจำเดือน', acc: 'Finance', color: '#ef4444', hours: 60 },
    { id: 'u6', title: 'ออกแบบ Dashboard ใหม่', acc: 'DIB-Solar Farm', color: '#6366f1', hours: 50 },
    { id: 'u7', title: 'ทดสอบระบบ Monitoring', acc: 'DIB-Solar Farm', color: '#6366f1', hours: 40 },
    { id: 'u8', title: 'เตรียมเอกสาร Proposal', acc: 'Sale Pipeline', color: '#3b82f6', hours: 30 },
    { id: 'u9', title: 'ติดตามลูกค้ารายใหม่', acc: 'Sale Pipeline', color: '#3b82f6', hours: 20 },
    { id: 'u10', title: 'อบรมพนักงานใหม่', acc: 'Internal', color: '#10b981', hours: 100 },
    { id: 'u11', title: 'จัดทำ KPI Report', acc: 'Management', color: '#6366f1', hours: 30 },
    { id: 'u12', title: 'ตรวจสอบคลังสินค้า', acc: 'DIB-Warehouse', color: '#a855f7', hours: 40 }
  ];

  window.IS_TASK_SIDEBAR_OPEN = window.IS_TASK_SIDEBAR_OPEN || false;

  window.toggleTaskSidebar = function () {
    window.IS_TASK_SIDEBAR_OPEN = !window.IS_TASK_SIDEBAR_OPEN;
    const container = document.getElementById('taskSidebarContainer');
    const mainContent = document.getElementById('scheduleMainContent');

    if (container) {
      container.style.right = window.IS_TASK_SIDEBAR_OPEN ? '0px' : '-380px';
      if (window.IS_TASK_SIDEBAR_OPEN) {
        container.innerHTML = renderTaskSidebar();
        if (window.lucide) lucide.createIcons({ root: container });
      }
    }

    if (mainContent) {
      mainContent.style.paddingRight = window.IS_TASK_SIDEBAR_OPEN ? '380px' : '0px';
    }
  };

  window.handleTaskDragStart = function (e, taskId) {
    e.dataTransfer.setData('taskId', taskId);
    e.target.style.opacity = '0.5';
  };

  window.handleTaskDragEnd = function (e) {
    e.target.style.opacity = '1';
  };

  window.handleTaskDrop = function (e, personId, dateIso) {
    e.preventDefault();
    const rawTaskId = e.dataTransfer.getData('taskId');

    const doDrop = () => {
      let droppedTask = null;

      if (rawTaskId.startsWith('unassigned-')) {
        const taskId = rawTaskId.replace('unassigned-', '');
        const task = window.UNASSIGNED_TASKS.find(t => t.id === taskId);
        if (task) {
          const clonedTask = { ...task, id: task.id + '_' + Date.now() + Math.floor(Math.random() * 1000), person: personId, date: dateIso };
          window.SCHEDULE_TASKS.push(clonedTask);
          droppedTask = clonedTask;
        }
      } else if (rawTaskId.startsWith('scheduled-')) {
        const taskId = rawTaskId.replace('scheduled-', '');
        const task = window.SCHEDULE_TASKS.find(t => t.id === taskId);
        if (task) {
          const oldPersonObj = (window.DATA.employees || []).find(emp => emp.id === task.person);
          task.oldDate = task.date;
          task.oldName = oldPersonObj ? (oldPersonObj.nickname || oldPersonObj.name) : '';

          task.person = personId;
          task.date = dateIso;
          droppedTask = task;
        }
      } else {
        const allUnassigned = [...(window.UNASSIGNED_TASKS || []), ...getTasksFromScope()];
        const task = allUnassigned.find(t => t.id === rawTaskId);
        if (task) {
          const clonedTask = { ...task, id: task.id + '_' + Date.now(), person: personId, date: dateIso };
          window.SCHEDULE_TASKS.push(clonedTask);
          droppedTask = clonedTask;
        }
      }

      const wrap = document.getElementById('scheduleTableWrap');
      const sl = wrap ? wrap.scrollLeft : 0;
      const st = wrap ? wrap.scrollTop : 0;

      const contentEl = document.getElementById('pageContent');
      if (contentEl) {
        contentEl.innerHTML = pageSchedule();
        if (window.lucide) window.lucide.createIcons({ root: contentEl });

        const newWrap = document.getElementById('scheduleTableWrap');
        if (newWrap) {
          newWrap.scrollLeft = sl;
          newWrap.scrollTop = st;
        }
      }


      // Sync to Google Sheets
      if (typeof window.apiSaveScheduleTask === 'function') {
        const personObj = (window.DATA.employees || []).find(emp => emp.id === personId);
        if (droppedTask && personObj) {
          window.apiSaveScheduleTask(droppedTask, personObj, dateIso);
        }
      }
    };

    const dObj = new Date(dateIso);
    const dayIndex = dObj.getDay();
    let isPublic = false;
    if (typeof window !== 'undefined' && typeof window.isThaiHoliday === 'function') {
      isPublic = !!window.isThaiHoliday(dObj);
    }

    const person = (window.DATA.employees || []).find(emp => emp.id === personId);
    let isOffDay = false;
    let isLeave = false;

    if (person) {
      const realDayMap = { 'อาทิตย์': 0, 'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัสบดี': 4, 'ศุกร์': 5, 'เสาร์': 6, 'อา.': 0, 'จ.': 1, 'อ.': 2, 'พ.': 3, 'พฤ.': 4, 'ศ.': 5, 'ส.': 6 };
      const offDays = (person.offdays || '').split(/[,|\-]/).map(d => realDayMap[d.trim().replace('วัน', '')]).filter(v => v !== undefined);
      if (offDays.includes(dayIndex)) isOffDay = true;

      if (window.DATA.leaveRequests) {
        const parseThaiDate = (str) => {
          if (!str) return '';
          const parts = str.split(' ');
          if (parts.length < 3) return str;
          const d = parts[0].padStart(2, '0');
          const monthMap = { 'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12' };
          const m = monthMap[parts[1]] || '01';
          const y = parseInt(parts[2]) - 543;
          return `${y}-${m}-${d}`;
        };
        const onLeave = window.DATA.leaveRequests.some(r => {
          if (r.status !== 'approved' && r.status !== 'อนุมัติแล้ว') return false;
          if ((r.name || '').trim().toLowerCase() !== (person.name || '').trim().toLowerCase() &&
            (r.name || '').trim().toLowerCase() !== (person.nameEn || '').trim().toLowerCase()) return false;
          let start = new Date(r.startRaw || parseThaiDate(r.start));
          let end = new Date(r.endRaw || parseThaiDate(r.end));
          return dObj >= start && dObj <= end;
        });
        if (onLeave) isLeave = true;
      }
    }

    if (isOffDay) {
      let reasons = ["Off Day"];

      if (typeof showConfirmModal === 'function') {
        showConfirmModal({
          title: 'Confirm Assignment',
          message: `You are assigning a task on a <b>${reasons.join(' / ')}</b>.<br><br>Are you sure you want to proceed?`,
          confirmText: 'Confirm',
          type: 'warning',
          onConfirm: () => {
            doDrop();
          }
        });
      } else {
        if (confirm(`You are assigning a task on a ${reasons.join(' / ')}. Are you sure you want to proceed?`)) {
          doDrop();
        }
      }
    } else {
      doDrop();
    }
  };


  window.deleteScheduledTask = function (taskId) {
    showConfirmModal({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to remove this task from the schedule?',
      confirmText: 'Delete Task',
      onConfirm: () => {
        const taskIndex = window.SCHEDULE_TASKS.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          const taskToDelete = window.SCHEDULE_TASKS[taskIndex];
          window.SCHEDULE_TASKS.splice(taskIndex, 1);

          // If this is a synced QC plan task, delete it from QC_PLANS and call the QC sheet delete API
          if (taskId.startsWith('SCH-')) {
            const qcId = taskId.replace('SCH-', '');
            if (window.QC_PLANS) {
              const qIdx = window.QC_PLANS.findIndex(p => p.id === qcId);
              if (qIdx !== -1) {
                const planObj = window.QC_PLANS[qIdx];
                window.QC_PLANS.splice(qIdx, 1);
                
                if (typeof window.qcDeleteLocalPlan === 'function') {
                  window.qcDeleteLocalPlan({ id: qcId });
                }
                
                if (typeof apiSaveQcPlan === 'function') {
                  apiSaveQcPlan({ action: 'delete', id: qcId });
                }
              }
            }
          }

          const wrap = document.getElementById('scheduleTableWrap');
          const sl = wrap ? wrap.scrollLeft : 0;
          const st = wrap ? wrap.scrollTop : 0;

          const contentEl = document.getElementById('pageContent');
          if (contentEl) {
            contentEl.innerHTML = pageSchedule();
            if (window.lucide) lucide.createIcons({ root: contentEl });

            const newWrap = document.getElementById('scheduleTableWrap');
            if (newWrap) {
              newWrap.scrollLeft = sl;
              newWrap.scrollTop = st;
            }
          }

          if (typeof window.apiDeleteScheduleTask === 'function') {
            const personObj = (window.DATA.employees || []).find(emp => emp.id === taskToDelete.person);
            window.apiDeleteScheduleTask(taskToDelete, personObj);
          }
        }
      }
    });
  };


  // Redundant schedule API functions removed. Using global implementations from legacyEmployeeLogic.js.

  window.showDayDetailModal = function (personId, dateIso) {
    const person = window.DATA.employees.find(e => e.id === personId);
    if (!person) return;

    const dayTasks = window.SCHEDULE_TASKS.filter(t => t.person === personId && t.date === dateIso);
    
    // Holiday tasks parsing
    const localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    const parseHolidayDateToISO = (dateStr) => {
      if (!dateStr) return null;
      const s = dateStr.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        const thaiMonthsFull = { 'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08', 'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12' };
        const thaiMonthsShort = { 'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12' };
      const mFull = s.match(/(\d+)\s+(\S+)\s+(\d{4})/);
      if (mFull) {
        const day = mFull[1].padStart(2, '0');
        const mon = thaiMonthsFull[mFull[2]] || thaiMonthsShort[mFull[2]] || null;
        const year = parseInt(mFull[3]) > 2500 ? parseInt(mFull[3]) - 543 : parseInt(mFull[3]);
        if (mon) return `${year}-${mon}-${day}`;
      }
      const enMonths = { 'jan':'01','feb':'02','mar':'03','apr':'04','may':'05','jun':'06','jul':'07','aug':'08','sep':'09','oct':'10','nov':'11','dec':'12' };
      const mEn = s.match(/(\d+)\s+([A-Za-z]+)\s+(\d{4})/);
      if (mEn) {
        const day = mEn[1].padStart(2, '0');
        const mon = enMonths[mEn[2].toLowerCase().substring(0,3)] || null;
        const year = parseInt(mEn[3]) > 2500 ? parseInt(mEn[3]) - 543 : parseInt(mEn[3]);
        if (mon) return `${year}-${mon}-${day}`;
      }
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        const parts = s.split('/');
        const year = parseInt(parts[2]) > 2500 ? parseInt(parts[2]) - 543 : parseInt(parts[2]);
        return `${year}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
      }
      const d = new Date(s);
      if (!isNaN(d)) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return null;
    };
    
    const holidayTasks = [];
    localShifts.forEach(shift => {
      const isoDate = parseHolidayDateToISO(shift.date);
      if (isoDate === dateIso) {
        (shift.tasks || []).forEach(task => {
          const pName = (task.person || '').trim().toLowerCase();
          const matchPerson = pName === (person.fullName || '').trim().toLowerCase() || pName === (person.name || '').trim().toLowerCase();
          if (matchPerson) {
            task.holidayName = shift.name;
            holidayTasks.push(task);
          }
        });
      }
    });

    let holidayTotalPct = 0;
    holidayTasks.forEach(ht => {
      if (ht.assignments) {
        ht.assignments.forEach(a => { holidayTotalPct += (Number(a.percent) || 0); });
      }
    });

    const combinedTotalHours = dayTasks.reduce((sum, t) => sum + (Number(t.hours) || 0), 0) + holidayTotalPct;
    const wlColor = getWorkloadColor(combinedTotalHours);

    const modalId = 'dayDetailModal';
    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:12000; animation:fadeIn 0.2s ease">
      <div style="background: var(--surface); width:100%; max-width:500px; border-radius:28px; box-shadow: var(--shadow); overflow:hidden; animation:modalBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)">
        <div style="padding:24px 32px; background:#f8fafc; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center">
          <div>
            <h3 style="margin:0; font-size:1.1rem; font-weight:800; color:#1e293b; font-family:Kanit">${person.nameEn || person.name}</h3>
            <div style="font-size:0.8rem; color:#64748b; font-weight:500; margin-top:2px">${new Date(dateIso).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
          <button onclick="document.getElementById('${modalId}').remove()" style="background: var(--surface); border: 1px solid var(--border); width:36px; height:36px; border-radius: var(--radius); display:flex; align-items:center; justify-content:center; cursor:pointer; color:#94a3b8; transition:all 0.2s" onmouseover="this.style.color='#ef4444'; this.style.borderColor='#fecaca'" onmouseout="this.style.color='#94a3b8'; this.style.borderColor='#e2e8f0'">
            <i data-lucide="x" style="width:20px; height:20px"></i>
          </button>
        </div>
        
        <div style="padding:32px; max-height:60vh; overflow-y:auto">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
            <span style="font-size:0.85rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px">Assigned Tasks (${dayTasks.length + holidayTasks.reduce((c,ht)=>c+(ht.assignments && ht.assignments.length > 0 ? ht.assignments.length : 1),0)})</span>
            <div style="background:${wlColor}; color:#fff; font-size:0.7rem; font-weight:800; padding:4px 14px; border-radius:99px">Total: ${combinedTotalHours}%</div>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:8px">
            ${dayTasks.length === 0 && holidayTasks.length === 0 ? `
              <div style="padding:40px; text-align:center; background:#f8fafc; border:2px dashed #e2e8f0; border-radius:20px; color:#94a3b8; font-size:0.9rem; font-weight:500">No tasks assigned for this day</div>
            ` : dayTasks.map(t => {
      const nodeCol = colorForNode(t.node);
      const projCol = typeof window.colorForProject === 'function' ? window.colorForProject(t.acc) : nodeCol;
      return `
                <div style="padding:16px; border-radius:16px; background: var(--surface); border:1px solid #f1f5f9; border-left:4px solid ${projCol}; box-shadow: var(--shadow); display:flex; justify-content:space-between; align-items:center">
                  <div style="min-width:0; flex:1">
                    <div style="font-weight:700; color:#1e293b; font-size:0.9rem; margin-bottom:4px">${t.title}</div>
                    <div style="display:flex; align-items:center; gap:8px">
                      <span style="font-size:0.75rem; color:#64748b; font-weight:500">${t.acc || '-'}</span>
                      <span style="width:4px; height:4px; border-radius:50%; background:#cbd5e1"></span>
                      <span style="font-size:0.75rem; font-weight:700; color:${nodeCol}">${t.node}</span>
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; gap:16px">
                    <div style="font-size:1rem; font-weight:800; color:#1e293b">${t.hours}%</div>
                    <button onclick="deleteScheduledTask('${t.id}'); document.getElementById('${modalId}').remove()" style="background:#fef2f2; color:#ef4444; border:none; width:32px; height:32px; border-radius:10px !important; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                      <i data-lucide="trash-2" style="width:16px; height:16px"></i>
                    </button>
                  </div>
                </div>
              `;
    }).join('')}
            ${holidayTasks.map(ht => {
              if (!ht.assignments || ht.assignments.length === 0) {
                return `
                  <div style="padding:16px; border-radius:16px; background: var(--surface); border:1px solid #fcd34d; border-left:4px solid #f59e0b; box-shadow: var(--shadow); display:flex; justify-content:space-between; align-items:center">
                    <div style="min-width:0; flex:1">
                      <div style="font-weight:700; color:#f59e0b; font-size:0.9rem; margin-bottom:4px">${ht.holidayName || 'Holiday'}</div>
                      <div style="display:flex; align-items:center; gap:8px">
                        <span style="font-size:0.75rem; font-weight:700; color:#64748b">${ht.section || 'Operation'}</span>
                        <span style="width:4px; height:4px; border-radius:50%; background:#cbd5e1"></span>
                        <span style="font-size:0.75rem; font-weight:700; color:#f59e0b">${ht.time || '-'}</span>
                      </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px">
                      <div style="font-size:1rem; font-weight:800; color:#1e293b">0%</div>
                    </div>
                  </div>
                `;
              }
              let parsedAssignments = ht.assignments;
              if (typeof ht.assignments === 'string') {
                try {
                  parsedAssignments = JSON.parse(ht.assignments);
                } catch(e) {
                  parsedAssignments = [];
                }
              }
              if (!Array.isArray(parsedAssignments) || parsedAssignments.length === 0) {
                return `
                  <div style="padding:16px; border-radius:16px; background: var(--surface); border:1px solid #fcd34d; border-left:4px solid #f59e0b; box-shadow: var(--shadow); display:flex; justify-content:space-between; align-items:center">
                    <div style="min-width:0; flex:1">
                      <div style="font-weight:700; color:#f59e0b; font-size:0.9rem; margin-bottom:4px">${ht.section || 'Operation'}</div>
                      <div style="display:flex; align-items:center; gap:8px">
                        <span style="font-size:0.75rem; font-weight:700; color:#f59e0b">${ht.time || '-'}</span>
                      </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px">
                      <div style="font-size:1rem; font-weight:800; color:#1e293b">0%</div>
                    </div>
                  </div>
                `;
              }
              return parsedAssignments.map(a => `
                <div style="padding:16px; border-radius:16px; background: var(--surface); border:1px solid #fcd34d; border-left:4px solid #f59e0b; box-shadow: var(--shadow); display:flex; justify-content:space-between; align-items:center">
                  <div style="min-width:0; flex:1">
                    <div style="font-weight:700; color:#f59e0b; font-size:0.9rem; margin-bottom:4px">${a.project || '-'}</div>
                    <div style="display:flex; align-items:center; gap:8px">
                      <span style="font-size:0.75rem; color:#64748b; font-weight:500">${a.job || '-'}</span>
                      <span style="width:4px; height:4px; border-radius:50%; background:#cbd5e1"></span>
                      <span style="font-size:0.75rem; font-weight:700; color:#f59e0b">${ht.section || 'Operation'}</span>
                      <span style="width:4px; height:4px; border-radius:50%; background:#cbd5e1"></span>
                      <span style="font-size:0.75rem; font-weight:700; color:#f59e0b">${ht.time || '-'}</span>
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; gap:16px">
                    <div style="font-size:1rem; font-weight:800; color:#1e293b">${a.percent || 0}%</div>
                  </div>
                </div>
              `).join('');
            }).join('')}
          </div>
        </div>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });
  };
  window.filterScheduleUI = function () {
    window._scheduleSearch = document.getElementById('schedSearchInput')?.value.toLowerCase() || '';
    window._scheduleTeamFilter = document.getElementById('schedTeamFilter')?.value || '';

    const wrap = document.getElementById('scheduleTableWrap');
    const sl = wrap ? wrap.scrollLeft : 0;
    const st = wrap ? wrap.scrollTop : 0;

    const contentEl = document.getElementById('pageContent');
    if (contentEl) {
      const activeInput = document.activeElement && document.activeElement.id === 'schedSearchInput';
      contentEl.innerHTML = pageSchedule();
      if (window.lucide) window.lucide.createIcons({ root: contentEl });

      const newWrap = document.getElementById('scheduleTableWrap');
      if (newWrap) {
        newWrap.scrollLeft = sl;
        newWrap.scrollTop = st;
      }

      if (activeInput) {
        const newInp = document.getElementById('schedSearchInput');
        if (newInp) {
          newInp.focus();
          const val = newInp.value;
          newInp.value = '';
          newInp.value = val;
        }
      }
    }
  };

  // --- SCHEDULER HELPERS ---
  window.getTasksFromScope = function () {
    const scopeData = window.PREMIUM_SCOPE_DATA || [];
    const tasks = [];
    scopeData.forEach(acc => {
      if (!acc.items) return;
      acc.items.forEach((item, idx) => {
        tasks.push({
          id: `scope-${acc.account.replace(/\s+/g, '-')}-${idx}`,
          title: item.name,
          acc: acc.account,
          node: item.node || 'Other',
          hours: item.progress || 0, // Use progress from Scope
          color: typeof window.colorForProject === 'function' ? window.colorForProject(acc.account) : '#6366f1'
        });
      });
    });
    return tasks;
  };

  window.renderUnassignedTasks = function (tasks) {
    if (!tasks || tasks.length === 0) {
      return `<div style="text-align:center; padding:60px 20px; color:var(--text-3); font-size:0.85rem">
        <div style="background:var(--surface2); width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px">
          <i data-lucide="inbox" style="width:24px; height:24px; opacity:0.3"></i>
        </div>
        <p style="font-weight:600; margin:0">No tasks found</p>
        <p style="font-size:0.75rem; opacity:0.7; margin:4px 0 0">Try adjusting your filters</p>
      </div>`;
    }
    return tasks.map(t => {
      const col = typeof window.colorForProject === 'function' ? window.colorForProject(t.acc) : (t.color || '#6366f1');
      return `
        <div class="task-card" draggable="true" 
             ondragstart="handleTaskDragStart(event, '${t.id}')" 
             ondragend="this.style.opacity='1'"
             style="background: var(--surface); padding:14px 16px; border-radius: var(--radius); border:1px solid var(--border); border-left:4px solid ${col}; cursor:grab; transition:all 0.2s ease; position:relative; display:flex; align-items:center; gap:12px; box-shadow: var(--shadow)">
          
          <div style="flex:1; min-width:0">
            <div style="font-size:0.85rem; font-weight:700; color:var(--text); margin-bottom:6px; line-height:1.4; word-break:break-word">${t.title}</div>
            <div style="display:flex; align-items:center; gap:8px">
              <span style="font-size:0.65rem; color:${col}; font-weight:800; background:${col}10; padding:1px 6px; border-radius:4px">${t.acc}</span>
              <span style="font-size:0.6rem; color:var(--text-3); font-weight:500">${t.node}</span>
            </div>
          </div>

          <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:4px">
            <div style="font-size:0.85rem; font-weight:800; color:var(--text)">${t.hours}%</div>
            <div style="opacity:0.2">
              <i data-lucide="grip-vertical" style="width:14px; height:14px"></i>
            </div>
          </div>

          <!-- Hover Effect Overlay -->
          <style>
            .task-card:hover {
              transform: translateY(-2px);
              box-shadow: var(--shadow);
              border-color: ${col}40 !important;
              background: #fafafa !important;
            }
          </style>
        </div>`;
    }).join('');
  };

  window.renderTaskSidebar = function () {
    const tasks = getTasksFromScope();
    const projects = [...new Set(tasks.map(t => t.acc))].sort();
    const nodes = [...new Set(tasks.map(t => t.node))].sort();

    window._sidebarSearch = window._sidebarSearch || '';
    window._sidebarProjectFilter = window._sidebarProjectFilter || 'all';
    window._sidebarNodeFilter = window._sidebarNodeFilter || 'all';

    let filteredTasks = tasks;
    if (window._sidebarSearch || window._sidebarProjectFilter !== 'all' || window._sidebarNodeFilter !== 'all') {
      filteredTasks = tasks.filter(t => {
        const matchQ = window._sidebarSearch ? (t.title.toLowerCase().includes(window._sidebarSearch) || t.acc.toLowerCase().includes(window._sidebarSearch)) : true;
        const matchProj = window._sidebarProjectFilter === 'all' || t.acc === window._sidebarProjectFilter;
        const matchNode = window._sidebarNodeFilter === 'all' || t.node === window._sidebarNodeFilter;
        return matchQ && matchProj && matchNode;
      });
    }

    return `
    <div id="taskSidebar" style="display:flex; flex-direction:column; height:100%; background: var(--surface); font-family:'Kanit', sans-serif">
      <!-- Sidebar Header -->
      <div style="padding:24px 20px; border-bottom:1px solid var(--border); background: var(--surface); position:sticky; top:0; z-index:10; box-shadow: var(--shadow)">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
          <div>
            <h3 style="margin:0; font-size:1.25rem; font-weight:800; color:#1e293b; letter-spacing:-0.5px">Add Task</h3>
            <p style="margin:2px 0 0; font-size:0.75rem; color:#64748b; font-weight:500">Available tasks from Scope</p>
          </div>
          <button onclick="toggleTaskSidebar()" style="background:#f1f5f9; border:none; width:36px; height:36px; border-radius: var(--radius); cursor:pointer; color:#64748b; display:flex; align-items:center; justify-content:center; transition:all 0.2s">
            <i data-lucide="x" style="width:20px; height:20px"></i>
          </button>
        </div>

        <!-- Filters -->
        <div style="display:flex; flex-direction:column; gap:8px">
          <div style="position:relative">
            <i data-lucide="search" style="width:16px; height:16px; position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94a3b8"></i>
            <input type="text" id="sidebarSearch" placeholder="Search tasks or projects..." onkeyup="filterSidebarTasks()" value="${window._sidebarSearch}"
                   style="width:100%; height:44px; padding:0 12px 0 42px; border-radius: var(--radius); border:1.5px solid #f1f5f9; font-size:0.85rem; outline:none; background:#f8fafc; font-family:inherit; transition:all 0.2s; color:#1e293b">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
            <div style="position:relative">
              <select id="sidebarProjectFilter" onchange="filterSidebarTasks()" 
                      style="width:100%; height:40px; padding:0 12px; border-radius: var(--radius); border:1.5px solid #f1f5f9; font-size:0.75rem; font-weight:600; outline:none; background:#f8fafc; cursor:pointer; appearance:none; color:#475569">
                <option value="all">All Projects</option>
                ${projects.map(p => `<option value="${p}" ${window._sidebarProjectFilter === p ? 'selected' : ''}>${p}</option>`).join('')}
              </select>
              <i data-lucide="chevron-down" style="width:14px; height:14px; position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none"></i>
            </div>
            <div style="position:relative">
              <select id="sidebarNodeFilter" onchange="filterSidebarTasks()" 
                      style="width:100%; height:40px; padding:0 12px; border-radius: var(--radius); border:1.5px solid #f1f5f9; font-size:0.75rem; font-weight:600; outline:none; background:#f8fafc; cursor:pointer; appearance:none; color:#475569">
                <option value="all">All Nodes</option>
                ${nodes.map(n => `<option value="${n}" ${window._sidebarNodeFilter === n ? 'selected' : ''}>${n}</option>`).join('')}
              </select>
              <i data-lucide="chevron-down" style="width:14px; height:14px; position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none"></i>
            </div>
          </div>
          <button onclick="clearSidebarFilters()" style="background:none; border:none; color:#ef4444;   cursor:pointer; display:flex; align-items:center; gap:4px; align-self:flex-end;  border-radius:6px; transition:all 0.2s" onmouseover="this.style.background='rgba(239,68,68,0.05)'" onmouseout="this.style.background='none'" class="text-[12px] font-semibold px-4 py-1.5">
            <i data-lucide="rotate-ccw" style="width:12px; height:12px"></i> Clear All Filters
          </button>
        </div>
      </div>

      <!-- Task List Area -->
      <div id="sidebarTaskList" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:14px; background:#f8fafc">
        ${renderUnassignedTasks(filteredTasks)}
      </div>
      
      <style>
        #sidebarSearch:focus {
          border-color: #6366f1 !important;
          background: var(--surface) !important;
          box-shadow: var(--shadow);
        }
        #sidebarProjectFilter:hover, #sidebarNodeFilter:hover {
          border-color: #cbd5e1;
        }
      </style>
    </div>`;
  };

  window.clearSidebarFilters = function () {
    window._sidebarSearch = '';
    window._sidebarProjectFilter = 'all';
    window._sidebarNodeFilter = 'all';
    const s = document.getElementById('sidebarSearch');
    const p = document.getElementById('sidebarProjectFilter');
    const n = document.getElementById('sidebarNodeFilter');
    if (s) s.value = '';
    if (p) p.value = 'all';
    if (n) n.value = 'all';
    filterSidebarTasks();
  };

  window.filterSidebarTasks = function () {
    window._sidebarSearch = document.getElementById('sidebarSearch')?.value.toLowerCase() || '';
    window._sidebarProjectFilter = document.getElementById('sidebarProjectFilter')?.value || 'all';
    window._sidebarNodeFilter = document.getElementById('sidebarNodeFilter')?.value || 'all';

    const allTasks = getTasksFromScope();
    const filtered = allTasks.filter(t => {
      const matchQ = window._sidebarSearch ? (t.title.toLowerCase().includes(window._sidebarSearch) || t.acc.toLowerCase().includes(window._sidebarSearch)) : true;
      const matchProj = window._sidebarProjectFilter === 'all' || t.acc === window._sidebarProjectFilter;
      const matchNode = window._sidebarNodeFilter === 'all' || t.node === window._sidebarNodeFilter;
      return matchQ && matchProj && matchNode;
    });

    const listEl = document.getElementById('sidebarTaskList');
    if (listEl) {
      listEl.innerHTML = renderUnassignedTasks(filtered);
      if (window.lucide) lucide.createIcons({ root: listEl });
    }
  };

  window.toggleManageSchedule = function () {
    window.IS_MANAGE_SCHEDULE_MODE = !window.IS_MANAGE_SCHEDULE_MODE;
    navigate('schedule');
  };

  window.openTaskEditor = function (taskId) {
    console.log("Edit task:", taskId);
    if (typeof showToast === 'function') showToast('Task Editor for: ' + taskId, 'info');
  };
