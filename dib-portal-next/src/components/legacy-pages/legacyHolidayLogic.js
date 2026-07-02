  window.pagePublicHoliday = function() {
    window.currentPage = 'public-holiday';

    // Load local shifts
    let localShifts = [];
    try {
      localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) { }

    const sheetHolidays = window.HOLIDAY_LIST || [];
    const holidays = [];

    function getDynamicHolidayStatus(dateStr, tasks) {
      if (!tasks || tasks.length === 0) return 'not_scheduled';
      const s = String(dateStr || '').replace(/[^0-9a-zA-Z\u0E00-\u0E7F\.]/g, '').toLowerCase();
      
        const thaiMonthsFull = { 'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08', 'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12' };
        const thaiMonthsShort = { 'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12' };
      const engMonths = { 'jan':'01', 'feb':'02', 'mar':'03', 'apr':'04', 'may':'05', 'jun':'06', 'jul':'07', 'aug':'08', 'sep':'09', 'oct':'10', 'nov':'11', 'dec':'12' };

      const mFull = s.match(/^(\d{1,2})(.+?)(\d{2,4})$/);
      let isoDate = null;
      if (mFull) {
        const day = mFull[1].padStart(2, '0');
        const monStr = mFull[2];
        const yearVal = parseInt(mFull[3], 10);
        let mon = thaiMonthsFull[monStr] || thaiMonthsShort[monStr] || engMonths[monStr.substring(0,3)];
        
        let year = yearVal;
        if (year > 2500) year -= 543;
        else if (year < 100) year += 2000;
        
        if (mon) isoDate = `${year}-${mon}-${day}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        isoDate = s;
      } else if (!isNaN(new Date(dateStr).getTime())) {
        const d = new Date(dateStr);
        isoDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      }
      
      const now = new Date();
      const todayIso = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      
      if (!isoDate) {
         window._debugHolidayFail = (window._debugHolidayFail || '') + `|failed:${dateStr}`;
         return 'upcoming';
      }
      return isoDate < todayIso ? 'finished' : 'upcoming';
    }

    if (sheetHolidays.length > 0) {
      // Clean up localShifts that are not in the sheet holidays (mock data)
      localShifts = localShifts.filter(ls => 
        sheetHolidays.some(sh => sh.date === ls.date || sh.name === ls.name)
      );
      localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));

      sheetHolidays.forEach(sh => {
        const matched = localShifts.find(ls => ls.date === sh.date || ls.name === sh.name);
        const t = matched ? (matched.tasks || []) : [];
        holidays.push({
          date: sh.date,
          name: sh.name,
          tasks: t,
          status: getDynamicHolidayStatus(sh.date, t)
        });
      });
      localShifts.forEach(ls => {
        const exists = holidays.some(h => h.date === ls.date || h.name === ls.name);
        if (!exists) {
           holidays.push({
              ...ls,
              status: getDynamicHolidayStatus(ls.date, ls.tasks || [])
           });
        }
      });
    } else {
      holidays.push(...localShifts.map(ls => ({
         ...ls,
         status: getDynamicHolidayStatus(ls.date, ls.tasks || [])
      })));
    }

    const stats = {
      total: holidays.length,
      finished: holidays.filter(h => h.status === 'finished').length,
      upcoming: holidays.filter(h => h.status === 'upcoming').length,
      not_scheduled: holidays.filter(h => h.status === 'not_scheduled').length
    };

    const finishedPct = stats.total > 0 ? ((stats.finished / stats.total) * 100).toFixed(2) : '0.00';
    const upcomingPct = stats.total > 0 ? ((stats.upcoming / stats.total) * 100).toFixed(2) : '0.00';
    const notScheduledPct = stats.total > 0 ? ((stats.not_scheduled / stats.total) * 100).toFixed(2) : '0.00';

    // Extract unique years from holidays
    const yearsSet = new Set();
    holidays.forEach(h => {
      const match = h.date.match(/\d{4}/);
      if (match) {
        yearsSet.add(match[0]);
      } else {
        const parts = h.date.split(/[\s/-]+/);
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.length === 4) {
          yearsSet.add(lastPart);
        }
      }
    });
    const uniqueYears = Array.from(yearsSet).sort((a,b) => b.localeCompare(a));
    const yearOptions = uniqueYears.map(y => `<option value="${y}">ปี ${y}</option>`).join('');

    // Dynamic year filter function
    window.filterHolidaysByYear = function(year) {
      const rows = document.querySelectorAll('#holidayTable tbody tr');
      let visibleCount = 0;
      rows.forEach(row => {
        const dateCell = row.querySelector('td[rowspan]');
        if (dateCell) {
          const text = dateCell.textContent;
          if (!year || text.includes(year)) {
            row.style.display = '';
            visibleCount++;
            let next = row.nextElementSibling;
            while (next && !next.querySelector('td[rowspan]')) {
              next.style.display = '';
              next = next.nextElementSibling;
            }
          } else {
            row.style.display = 'none';
            let next = row.nextElementSibling;
            while (next && !next.querySelector('td[rowspan]')) {
              next.style.display = 'none';
              next = next.nextElementSibling;
            }
          }
        }
      });
      
      const countEl = document.getElementById('holidayDisplayRange');
      if (countEl) {
        countEl.textContent = `แสดงทั้งหมด ${visibleCount} รายการ`;
      }
    };

    const searchHtml = `
      <div class="search-box" style="width: 200px; background: #f1f5f9; height: 38px; display: flex; align-items: center; position: relative; border: none; border-radius: 99px; overflow: hidden">
        <i data-lucide="search" style="width: 14px; height: 14px; position: absolute; left: 16px; color: var(--text-3)"></i>
        <input type="text" id="holidaySearch" placeholder="Search..." style="padding: 0 16px 0 36px; height: 100%; width: 100%; border: none; outline: none; background: transparent; font-size: 0.8rem" onkeyup="filterTable('holidayTable', 'holidaySearch')">
      </div>
    `;

    // PRE-CONSTRUCT TABLE BODY HTML TO AVOID COMPLEX NESTED TEMPLATE LITERALS
    let tableBodyHtml = '';
    if (holidays.length === 0) {
      tableBodyHtml = `
        <tr>
          <td colspan="7" style="padding: 32px; text-align: center; color: #94a3b8; font-size: .85rem; font-style: italic">
            ไม่มีข้อมูลวันหยุดนักขัตฤกษ์ (กรุณาเชื่อมต่อข้อมูลผ่าน Google Sheets)
          </td>
        </tr>
      `;
    } else {
      let rows = [];
      holidays.forEach((h, groupIdx) => {
        const tasks = (h.tasks && h.tasks.length > 0) ? h.tasks : [{ dept: '-', person: '-', time: '-', isEmptyRow: true }];
        tasks.forEach((t, idx) => {
          let rowHtml = '';
          
          // 1. Row element open with group hover effects
          rowHtml += `<tr class="holiday-group-${groupIdx}" style="border-bottom: ${idx === tasks.length - 1 ? '1px solid var(--border)' : 'none'}; transition: background 0.2s" onmouseover="document.querySelectorAll('.holiday-group-${groupIdx}').forEach(tr => { tr.style.background='#f1f5f9'; tr.querySelectorAll('td[rowspan]').forEach(td => td.style.background='#f1f5f9'); })" onmouseout="document.querySelectorAll('.holiday-group-${groupIdx}').forEach(tr => { tr.style.background='none'; tr.querySelectorAll('td[rowspan]').forEach(td => td.style.background='#fff'); })">`;
          
          // 2. Date and Name columns (only for the first task in the group, using rowspan)
          if (idx === 0) {
            rowHtml += `
              <td rowspan="${tasks.length}" style="padding: 16px 24px; font-size: .85rem; color: #1e293b; font-weight: 500; border-bottom: 1px solid var(--border); vertical-align: top; position: sticky; top: 50px; background: var(--surface); z-index: 2; transition: background 0.2s;">${h.date}</td>
              <td rowspan="${tasks.length}" style="padding: 16px 24px; font-size: .85rem; color: #4f46e5; font-weight: 600; width: 200px; max-width: 200px; white-space: normal; line-height: 1.5; border-bottom: 1px solid var(--border); vertical-align: top; position: sticky; top: 50px; background: var(--surface); z-index: 2; transition: background 0.2s;">${h.name}</td>
            `;
          }
          
          // 3. Task / Assignment template HTML
          let taskHtml = '';
          if (t.isEmptyRow) {
            taskHtml = `<span style="font-size: 0.8rem; color: #94a3b8; font-style: italic; font-weight: 500; display: block; margin-top: 4px;">ไม่มีข้อมูลงาน</span>`;
          } else {
            const template = (window.HOLIDAY_TEMPLATES || []).find(tpl => tpl.section === t.section);
            const list = template && template.assignments && template.assignments.length > 0
              ? template.assignments
              : (t.assignments && t.assignments.length > 0 
                ? t.assignments 
                : (t.project && t.project !== '-' ? [{ project: t.project, job: t.job || '-', percent: t.percent || 100 }] : []));
            
            const totalPct = list.reduce((sum, a) => sum + (parseInt(a.percent) || 0), 0);
            
            let assignmentsHtml = '';
            if (list.length === 0) {
              assignmentsHtml = '<div style="font-size:0.75rem; color:#94a3b8; text-align:center; padding:12px 0; font-style:italic;">ไม่มีข้อมูลงาน</div>';
            } else {
              assignmentsHtml = `
                <div style="display:flex; flex-direction:column; gap:12px;">
                  ${list.map(a => `
                    <div>
                      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
                        <div style="display:flex; align-items:baseline; gap:8px; min-width:0;">
                          <span style="font-size: 0.8rem; font-weight: 800; color: #334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100px;" title="${a.project}">${a.project}</span>
                          ${a.job && a.job !== '-' ? `<span style="font-size:0.7rem; color:#64748b; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;" title="${a.job}">${a.job}</span>` : ''}
                        </div>
                        <span style="font-size: 0.75rem; font-weight: 800; color: #6366f1; font-family: 'Inter', sans-serif;">${a.percent || 100}%</span>
                      </div>
                      <div style="height: 6px; background: #f1f5f9; border-radius: 99px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);">
                        <div style="height: 100%; width: ${a.percent || 100}%; background: linear-gradient(90deg, #6366f1, #a855f7); border-radius: 99px;"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `;
            }
            
            taskHtml = `
              <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 8px; box-shadow: var(--shadow); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px -4px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 10px -2px rgba(0,0,0,0.03)'">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 10px; margin-bottom: 12px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:28px; height:28px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #818cf8); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem; font-family:'Inter', sans-serif; box-shadow: var(--shadow);">
                      ${idx + 1}
                    </div>
                    <span style="font-weight: 800; font-size: 0.9rem; color: #1e293b; letter-spacing: -0.01em;">${t.section || '-'}</span>
                  </div>
                  ${list.length > 0 ? `
                  <div style="background: linear-gradient(135deg, #e0e7ff, #e8efff); color: #4338ca; padding: 4px 12px; border-radius: 99px; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(99, 102, 241, 0.1);">
                    <i data-lucide="activity" style="width:12px; height:12px"></i> รวม ${totalPct}%
                  </div>` : ''}
                </div>
                ${assignmentsHtml}
              </div>
            `;
          }
          
          rowHtml += `<td style="padding: 16px 24px; font-size: .8rem; color: #1e293b; font-weight: 600; vertical-align: top">${taskHtml}</td>`;
          
          // 4. Employee column
          let employeeHtml = '';
          if (t.person !== '-') {
            const emp = (window.DATA.employees || []).find(e => e.name === t.person || e.nameEn === t.person || e.nickname === t.person);
            const teamName = emp ? emp.dept : '';
            const tCol = typeof getTeamColor === 'function' ? getTeamColor(teamName) : '#64748b';
            const posBg = typeof getPosBgColor === 'function' ? getPosBgColor(emp ? emp.pos : '') : '#f1f5f9';
            const posText = typeof getPosTextColor === 'function' ? getPosTextColor(emp ? emp.pos : '') : '#475569';
            
            const line1 = window.getEmployeeDisplayName(emp || t.person);

            const avatarText = (emp && emp.nickname && emp.nickname !== '-') ? emp.nickname : t.person.trim().split(/\s+/)[0];
            const holidayAvatarFontSize = avatarText.length > 5 ? '0.5rem' : (avatarText.length === 5 ? '0.58rem' : (avatarText.length === 4 ? '0.68rem' : '0.78rem'));

            employeeHtml = `
              <div style="display: flex; align-items: center; gap: 12px">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: ${tCol}; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: ${holidayAvatarFontSize}; box-shadow: var(--shadow); flex-shrink: 0; text-align: center; padding: 2px; overflow: hidden; white-space: nowrap; word-break: keep-all">
                   ${avatarText}
                </div>
                <div style="min-width: 0">
                  <div style="font-size: .85rem; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis" title="${t.person}">${line1}</div>
                  <div style="display: inline-block; padding: 1px 8px; border-radius: 99px; background: ${posBg}; color: ${posText}; border: 1px solid rgba(0,0,0,0.05); font-size: 0.55rem; font-weight: 700; margin-top: 2px; text-transform: uppercase">${emp ? emp.pos : 'เจ้าหน้าที่'}</div>
                </div>
              </div>
            `;
          } else {
            employeeHtml = `<div style="font-size: .8rem; color: #94a3b8; font-style: italic">ยังไม่ได้กำหนดคนปฏิบัติงาน</div>`;
          }
          
          rowHtml += `<td style="padding: 16px 24px">${employeeHtml}</td>`;
          
          // 5. Time column
          let timeHtml = '';
          if (t.time !== '-') {
            timeHtml = `
              <div style="font-size: .8rem; font-weight: 600; color: #1e293b">${t.time}</div>
              <div style="font-size: .7rem; color: #94a3b8">(8 ชม.)</div>
            `;
          } else {
            timeHtml = `<span style="color: #94a3b8">-</span>`;
          }
          
          rowHtml += `<td style="padding: 16px 24px">${timeHtml}</td>`;
          
          // 6. Status and Action columns (only for the first task in the group, using rowspan)
          if (idx === 0) {
            let statusHtml = '';
            if (h.status === 'finished') {
              statusHtml = `
                <span style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 99px; background: #ecfdf5; color: #10b981; border: 1px solid #a7f3d0; font-size: .72rem; font-weight: 700; white-space: nowrap;">
                  <i data-lucide="check-circle" style="width: 13px; height: 13px; margin-right: 5px; flex-shrink: 0;"></i>
                  เสร็จสิ้นแล้ว
                </span>
              `;
            } else if (h.status === 'upcoming') {
              statusHtml = `
                <span style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 99px; background: #ffedd5; color: #f59e0b; border: 1px solid #fed7aa; font-size: .72rem; font-weight: 700; white-space: nowrap;">
                  <i data-lucide="clock" style="width: 13px; height: 13px; margin-right: 5px; flex-shrink: 0;"></i>
                  กำลังจะถึง
                </span>
              `;
            } else {
              statusHtml = `
                <span style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 99px; background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; font-size: .72rem; font-weight: 700; white-space: nowrap;">
                  <i data-lucide="help-circle" style="width: 13px; height: 13px; margin-right: 5px; flex-shrink: 0;"></i>
                  ยังไม่มีกำหนดรายการ
                </span>
              `;
            }
            
            rowHtml += `
              <td rowspan="${tasks.length}" style="padding: 16px 24px; border-bottom: 1px solid var(--border); vertical-align: top; position: sticky; top: 50px; background: var(--surface); z-index: 2; transition: background 0.2s;">
                ${statusHtml}
              </td>
              <td rowspan="${tasks.length}" style="padding: 16px 24px; text-align: center; border-bottom: 1px solid var(--border); vertical-align: top; position: sticky; top: 50px; background: var(--surface); z-index: 2; transition: background 0.2s;">
                <button class="text-[12px] font-semibold px-4 py-1.5 btn-icon" onclick="toggleHolidayDropdown(event, ${groupIdx}, '${h.name.replace(/'/g, "\\'")}', '${h.date}')" style="background: none; border: none; color: #94a3b8; cursor: pointer">
                  <i data-lucide="more-horizontal" style="width: 18px; height: 18px"></i>
                </button>
              </td>
            `;
          }
          
          rowHtml += `</tr>`;
          rows.push(rowHtml);
        });
      });
      tableBodyHtml = rows.join('\n');
    }

    return `
    <div class="fade-in">
      <!-- HEADER -->
      <!-- Top Action Bar -->
      <div style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:24px; gap:8px">
        <div style="height:38px; display:flex; align-items:center">
          ${typeof renderDateFilter === 'function' ? renderDateFilter("navigate('public-holiday')", 'above', null, true, searchHtml) : ''}
        </div>
        <button onclick="window.openManageTemplatesModal()" class="text-[12px] font-semibold px-4 py-1.5 btn btn-secondary" style="display:flex; align-items:center; gap:6px;  border-radius: 99px;    flex-shrink:0; background:#f1f5f9; color:#475569; border:none; cursor:pointer; transition: background 0.2s;">
          <i data-lucide="settings" style="width:14px; height:14px"></i> จัดการชุดงาน (Templates)
        </button>
      </div>

      <!-- STATS CARDS -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px">
        <!-- Card 1 -->
        <div class="stat-card fade-in" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(99, 102, 241, 0.1); color: #6366f1; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="calendar" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">วันหยุดทั้งหมด</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
              ${stats.total} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
            </div>
            <div style="font-size: .65rem; color: #6366f1; font-weight: 600; margin-top: 4px">ข้อมูลทั้งหมด</div>
          </div>
        </div>
        <!-- Card 2 -->
        <div class="stat-card fade-in delay-1" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="check-circle" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">วันหยุดเสร็จสิ้นแล้ว</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
              ${stats.finished} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
            </div>
            <div style="font-size: .65rem; color: #10b981; font-weight: 600; margin-top: 4px">${finishedPct}% ของทั้งหมด</div>
          </div>
        </div>
        <!-- Card 3 -->
        <div class="stat-card fade-in delay-2" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(245, 158, 11, 0.1); color: #f59e0b; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="clock" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">วันหยุดกำลังจะถึง</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
              ${stats.upcoming} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
            </div>
            <div style="font-size: .65rem; color: #f59e0b; font-weight: 600; margin-top: 4px">${upcomingPct}% ของทั้งหมด</div>
          </div>
        </div>
        <!-- Card 4 -->
        <div class="stat-card fade-in delay-3" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(99, 102, 241, 0.1); color: #818cf8; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="calendar-plus" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">ยังไม่ได้จัดแผน</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
              ${stats.not_scheduled} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
            </div>
            <div style="font-size: .65rem; color: #818cf8; font-weight: 600; margin-top: 4px">${notScheduledPct}% ของทั้งหมด</div>
          </div>
        </div>
      </div>

      <!-- TABLE CARD -->
      <div class="card" style="padding: 0; border-radius: 20px; overflow: hidden; border: none; box-shadow: 0 8px 30px rgba(0,0,0,0.03)">
        <div style="padding: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #1e293b">รายการวันหยุดนักขัตฤกษ์</h3>
          <select class="select-input" style="width: 160px; height: 38px;" onchange="window.filterHolidaysByYear(this.value)">
            <option value="">-- ทั้งหมดทุกปี --</option>
            ${yearOptions}
          </select>
        </div>
        <div style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 260px);">
          <table id="holidayTable" style="width: 100%; border-collapse: collapse; text-align: left">
            <thead style="background: #f8fafc;">
              <tr>
                <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">วันที่</th>
                <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">วันหยุด</th>
                <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">วันหยุด</th>
                <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">วันหยุด</th>
                <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">วันหยุด</th>
                <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">สถานะ</th>
                <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; text-align: center; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              ${tableBodyHtml}
            </tbody>
          </table>
        </div>
        <!-- PAGINATION -->
        <div style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; background: var(--surface)">
          <div id="holidayDisplayRange" style="font-size: .8rem; color: #64748b">แสดงทั้งหมด ${holidays.length} รายการ</div>
          <div style="display: flex; align-items: center; gap: 8px">
            <button style="width: 30px;  border-radius: 6px; border: 1px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer" class="text-[12px] font-semibold px-4 py-1.5"><i data-lucide="chevron-left" style="width: 14px; height: 14px"></i></button>
            <button style="width: 30px;  border-radius: 6px; border: none; background: #4f46e5; color: #fff;   display: flex; align-items: center; justify-content: center; cursor: pointer" class="text-[12px] font-semibold px-4 py-1.5">1</button>
            <button style="width: 30px;  border-radius: 6px; border: 1px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer" class="text-[12px] font-semibold px-4 py-1.5"><i data-lucide="chevron-right" style="width: 14px; height: 14px"></i></button>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; font-size: .8rem; color: #64748b">
            แสดง <span style="font-weight:600; color:#1e293b">${holidays.length}</span> รายการ
          </div>
        </div>
      </div>
    </div>
    `;
  }

  // Floating Dropdown menu for Three-dot Action button
  window.toggleHolidayDropdown = function(event, groupIdx, holidayName, holidayDate) {
    event.stopPropagation();
    const existing = document.getElementById('holiday-action-dropdown');
    if (existing) {
      existing.remove();
      if (window.currentActiveDropdownGroup === groupIdx) {
        window.currentActiveDropdownGroup = null;
        return;
      }
    }

    window.currentActiveDropdownGroup = groupIdx;
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    
    const dropdownHtml = `
      <div id="holiday-action-dropdown" style="
        position: fixed;
        top: ${rect.bottom + 5}px;
        left: ${rect.left - 110}px;
        width: 150px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        z-index: 12000;
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        animation: dropdownFadeIn 0.15s ease-out;
        font-family: Prompt, sans-serif;
      ">
        <button onclick="openManageHolidayModal('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}')" style="
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          color: #334155;
          
          
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        " onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'" class="text-[12px] font-semibold px-4 py-1.5">
          <i data-lucide="edit-3" style="width: 14px; height: 14px; color: #4f46e5;"></i>
          จัดการงาน
        </button>
        <button onclick="deleteHolidayAllTasks('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}')" style="
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          color: #ef4444;
          
          
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        " onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'" class="text-[12px] font-semibold px-4 py-1.5">
          <i data-lucide="trash-2" style="width: 14px; height: 14px; color: #ef4444;"></i>
          ลบงานทั้งหมด
        </button>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dropdownHtml);
    if (window.lucide) lucide.createIcons({ root: document.getElementById('holiday-action-dropdown') });

    const closeDropdown = function(e) {
      if (!e.target.closest('#holiday-action-dropdown') && !e.target.closest('.btn-icon')) {
        const el = document.getElementById('holiday-action-dropdown');
        if (el) el.remove();
        document.removeEventListener('click', closeDropdown);
        window.currentActiveDropdownGroup = null;
      }
    };
    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
    }, 50);
  };

  // Custom styled confirmation delete modal
  window.showConfirmDelete = function(title, message, onConfirm) {
    const modalId = 'confirmDeleteModal';
    const color = '#ef4444'; // Red for delete
    const bgLight = color + '10';
    const icon = 'trash-2';

    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:13000; backdrop-filter:blur(6px); animation: fadeIn 0.2s ease-out">
      <div class="modal-card" style="background: var(--surface); width:400px; border-radius:24px; padding:32px; text-align:center; box-shadow: var(--shadow); font-family:Prompt, sans-serif">
        <div style="width:64px; height:64px; border-radius:20px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; margin:0 auto 20px">
          <i data-lucide="${icon}" style="width:32px; height:32px"></i>
        </div>
        <h3 style="margin:0 0 10px; font-size:1.15rem; font-weight:700; color:#1e293b; font-family:Prompt">${title}</h3>
        <p style="margin:0 0 24px; font-size:.8rem; color:#64748b; line-height:1.5; font-family:Prompt">${message}</p>
        <div style="display:flex; gap:8px">
          <button onclick="document.getElementById('${modalId}').remove()" style="flex:1; background:#f1f5f9; color:#475569; border:none;  border-radius: var(--radius);  font-family:Prompt; cursor:pointer;  transition: background 0.2s" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'" class="text-[12px] font-semibold px-4 py-1.5">ยกเลิก</button>
          <button id="confirmDeleteBtn" style="flex:1; background:${color}; color:#fff; border:none;  border-radius: var(--radius);  font-family:Prompt; cursor:pointer;  box-shadow: var(--shadow); transition: opacity 0.2s" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'" class="text-[12px] font-semibold px-4 py-1.5">ยืนยันการลบ</button>
        </div>
      </div>
    </div>
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });

    document.getElementById('confirmDeleteBtn').onclick = function() {
      document.getElementById(modalId).remove();
      if (typeof onConfirm === 'function') onConfirm();
    };
  };

  // Delete all tasks for this holiday
  window.deleteHolidayAllTasks = function(holidayName, holidayDate) {
    const dropdown = document.getElementById('holiday-action-dropdown');
    if (dropdown) dropdown.remove();

    window.showConfirmDelete(
      'ยืนยันการลบงานทั้งหมด',
      `คุณต้องการลบงานทั้งหมดของวันหยุด "${holidayName}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      function() {
        let localShifts = [];
        try {
          localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
        } catch (e) {}

        const matched = localShifts.find(ls => ls.name === holidayName && ls.date === holidayDate);
        if (matched && matched.tasks) {
          matched.tasks.forEach(t => {
            if (t.id && typeof apiSaveHolidayShift === 'function') {
              apiSaveHolidayShift({ action: 'delete', id: t.id });
            }
          });
        }

        localShifts = localShifts.filter(ls => !(ls.name === holidayName && ls.date === holidayDate));
        localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));

        if (window.showToast) window.showToast('ลบรายการงานวันหยุดทั้งหมดเรียบร้อยแล้ว', 'success');
        navigate('public-holiday');
      }
    );
  };

  window.applyTemplateToHolidayClick = function(holidayName, holidayDate) {
    const select = document.getElementById('applyTemplateSelect');
    const tplId = select ? select.value : '';
    if (!tplId) {
      if (window.showToast) window.showToast('กรุณาเลือกชุดงานมาตรฐานก่อน', 'warning');
      return;
    }
    const modal = document.getElementById('manageHolidayModal');
    if (modal) modal.remove();
    window.openAddHolidayTaskModal(holidayName, holidayDate, null, tplId);
  };

  // Manage Holiday Tasks modal
  window.openManageHolidayModal = function(holidayName, holidayDate) {
    const dropdown = document.getElementById('holiday-action-dropdown');
    if (dropdown) dropdown.remove();

    const modalId = 'manageHolidayModal';
    const existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();

    let localShifts = [];
    try {
      localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) {}

    const matched = localShifts.find(ls => ls.name === holidayName && ls.date === holidayDate);
    const tasks = (matched && matched.tasks) ? matched.tasks : [];

    let tasksHtml = '';
    if (tasks.length === 0) {
      tasksHtml = `
        <div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 0.85rem; font-style: italic;">
          ยังไม่มีชุดงานที่กำหนดสำหรับวันหยุดนี้
        </div>
      `;
    } else {
      tasksHtml = tasks.map((t, idx) => {
        const list = t.assignments && t.assignments.length > 0 
          ? t.assignments 
          : (t.project && t.project !== '-' ? [{ project: t.project, job: t.job || '-', percent: t.percent || 100 }] : []);
        
        const totalPct = list.reduce((sum, a) => sum + (parseInt(a.percent) || 0), 0);

        return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: ${idx === tasks.length - 1 ? 'none' : '1px solid var(--border)'};">
          <div style="min-width: 0; flex: 1; padding-right: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; font-size: 0.85rem; color: #1e293b;">${t.section}</span>
              <span style="background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 99px; font-size: 0.6rem; font-weight: 800; display: inline-flex; align-items: center; gap: 2px;">
                รวม ${totalPct}%
              </span>
            </div>
            <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">
              ผู้ดำเนินการ: <span style="font-weight: 600; color: #334155;">${t.person}</span> | กะ: <span style="font-weight: 600; color: #334155;">${t.time}</span>
            </div>
            <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 2px;">
              งาน: ${list.map(a => `${a.project} (${a.percent}%)`).join(', ') || '-'}
            </div>
          </div>
          <div style="display: flex; gap: 6px; flex-shrink: 0;">
            <button onclick="document.getElementById('manageHolidayModal').remove(); openAddHolidayTaskModal('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}', ${idx});" class="text-[12px] font-semibold px-4 py-1.5 btn" style="
              background: #e0e7ff;
              color: #4f46e5;
              border: none;
              
              border-radius: var(--radius-sm);
              
              
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <i data-lucide="edit-2" style="width: 12px; height: 12px;"></i> แก้ไข
            </button>
            <button onclick="deleteSingleHolidayTask('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}', ${idx});" class="text-[12px] font-semibold px-4 py-1.5 btn" style="
              background: #fee2e2;
              color: #ef4444;
              border: none;
              
              border-radius: var(--radius-sm);
              
              
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i> ลบ
            </button>
          </div>
        </div>
      `;
      }).join('');
    }

    const templates = window.HOLIDAY_TEMPLATES || [];
    let templateOptionsHtml = '';
    if (templates.length > 0) {
      templateOptionsHtml = templates.map((tpl, tplIdx) => `
        <option value="${tpl.id}">ชุดงานที่ ${tplIdx + 1}: ${tpl.section}</option>
      `).join('');
    }

    const html = `
      <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:11000; backdrop-filter:blur(6px); animation: fadeIn 0.2s ease-out">
        <div class="modal-card" style="background: var(--surface); width:550px; border-radius:24px; padding:32px; box-shadow: var(--shadow); font-family:Prompt, sans-serif">
          <h3 style="margin:0 0 6px; font-size:1.2rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px">
            <i data-lucide="settings" style="width:20px; height:20px; color:var(--primary)"></i> จัดการงานวันหยุด
          </h3>
          <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 20px;">
            วันหยุด: <span style="font-weight: 700; color: #4f46e5;">${holidayName}</span> (${holidayDate})
          </div>
          
          <div style="max-height: 320px; overflow-y: auto; margin-bottom: 24px; border: 1px solid var(--border); border-radius: 50%; background: #f8fafc;">
            ${tasksHtml}
          </div>
          
          ${templates.length > 0 ? `
          <div style="margin-bottom: 24px; padding: 16px; border: 1px dashed var(--border); border-radius: 50%; background: #f8fafc; display: flex; align-items: flex-end; gap: 12px;">
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #475569; margin-bottom: 6px;">ดึงจากชุดงานมาตรฐานที่สร้างแล้ว</label>
              <select id="applyTemplateSelect" style="width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.8rem; outline: none; background: var(--surface); color: #1e293b; cursor: pointer;">
                <option value="">-- เลือกชุดงานมาตรฐาน (Templates) --</option>
                ${templateOptionsHtml}
              </select>
            </div>
            <button onclick="window.applyTemplateToHolidayClick('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}')" class="text-[12px] font-semibold px-4 py-1.5 btn" style="background: var(--primary); color: #fff; border: none;  border-radius: var(--radius-sm);   cursor: pointer; display: flex; align-items: center; gap: 6px;  box-shadow: var(--shadow);">
              <i data-lucide="import" style="width: 14px; height: 14px;"></i> ดึงชุดงาน
            </button>
          </div>
          ` : ''}
          
          <div style="display:flex; justify-content:flex-end; align-items:center">
            <button type="button" onclick="document.getElementById('${modalId}').remove()" class="text-[12px] font-semibold px-4 py-1.5 btn" style="background:#f1f5f9; color:#475569; border:none;  border-radius: var(--radius);  cursor:pointer">ปิดหน้าต่าง</button>
          </div>
        </div>
      </div>
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dropdownFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });
  };

  // Delete a single task inside a holiday
  window.deleteSingleHolidayTask = function(holidayName, holidayDate, taskIdx) {
    window.showConfirmDelete(
      'ยืนยันการลบชุดงาน',
      'คุณต้องการลบชุดงานนี้ใช่หรือไม่?',
      function() {
        let localShifts = [];
        try {
          localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
        } catch (e) {}

        const matchedIdx = localShifts.findIndex(ls => ls.name === holidayName && ls.date === holidayDate);
        if (matchedIdx !== -1) {
          const taskToDelete = localShifts[matchedIdx].tasks[taskIdx];
          const taskId = taskToDelete ? taskToDelete.id : null;
          
          if (taskId && typeof apiSaveHolidayShift === 'function') {
            apiSaveHolidayShift({ action: 'delete', id: taskId });
          }

          localShifts[matchedIdx].tasks.splice(taskIdx, 1);
          
          if (localShifts[matchedIdx].tasks.length === 0) {
            localShifts.splice(matchedIdx, 1);
          }
          
          localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));
          
          if (window.showToast) window.showToast('ลบชุดงานเรียบร้อยแล้ว', 'success');
          
          const manageModal = document.getElementById('manageHolidayModal');
          if (manageModal) manageModal.remove();
          
          navigate('public-holiday');
        }
      }
    );
  };

  // Modal handler window globals - Pre-filled Edit and Add Task Modal
  window.openAddHolidayTaskModal = function (editHolidayName, editHolidayDate, editTaskIdx, templateId) {
    const isEditMode = typeof editHolidayName !== 'undefined';
    const isTaskEdit = typeof editTaskIdx !== 'undefined' && editTaskIdx !== null;
    const modalId = 'addHolidayTaskModal';
    const existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();

    let localShifts = [];
    try {
      localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) { }

    const sheetHolidays = window.HOLIDAY_LIST || [];
    const holidays = [];

    function getDynamicHolidayStatus(dateStr, tasks) {
      if (!tasks || tasks.length === 0) return 'not_scheduled';
      const s = String(dateStr || '').replace(/[^0-9a-zA-Z\u0E00-\u0E7F\.]/g, '').toLowerCase();
      
        const thaiMonthsFull = { 'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08', 'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12' };
        const thaiMonthsShort = { 'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12' };
      const engMonths = { 'jan':'01', 'feb':'02', 'mar':'03', 'apr':'04', 'may':'05', 'jun':'06', 'jul':'07', 'aug':'08', 'sep':'09', 'oct':'10', 'nov':'11', 'dec':'12' };

      const mFull = s.match(/^(\d{1,2})(.+?)(\d{2,4})$/);
      let isoDate = null;
      if (mFull) {
        const day = mFull[1].padStart(2, '0');
        const monStr = mFull[2];
        const yearVal = parseInt(mFull[3], 10);
        let mon = thaiMonthsFull[monStr] || thaiMonthsShort[monStr] || engMonths[monStr.substring(0,3)];
        
        let year = yearVal;
        if (year > 2500) year -= 543;
        else if (year < 100) year += 2000;
        
        if (mon) isoDate = `${year}-${mon}-${day}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        isoDate = s;
      } else if (!isNaN(new Date(dateStr).getTime())) {
        const d = new Date(dateStr);
        isoDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      }
      
      const now = new Date();
      const todayIso = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      
      // Also apply a visual debug so we can see isoDate if it fails
      if (!isoDate) {
         window._debugHolidayFail = (window._debugHolidayFail || '') + `|failed:${dateStr}`;
         return 'upcoming';
      }
      return isoDate < todayIso ? 'finished' : 'upcoming';
    }

    if (sheetHolidays.length > 0) {
      sheetHolidays.forEach(sh => {
        const matched = localShifts.find(ls => ls.date === sh.date || ls.name === sh.name);
        const t = matched ? (matched.tasks || []) : [];
        holidays.push({
          date: sh.date,
          name: sh.name,
          tasks: t,
          status: getDynamicHolidayStatus(sh.date, t)
        });
      });
      localShifts.forEach(ls => {
        const exists = holidays.some(h => h.date === ls.date || h.name === ls.name);
        if (!exists) {
           holidays.push({
              ...ls,
              status: getDynamicHolidayStatus(ls.date, ls.tasks || [])
           });
        }
      });
    } else {
      holidays.push(...localShifts.map(ls => ({
         ...ls,
         status: getDynamicHolidayStatus(ls.date, ls.tasks || [])
      })));
    }

    let matchedHoliday = null;
    let matchedTask = null;

    // Pre-populate from standard templates (Templates)
    const chosenTpl = templateId ? (window.HOLIDAY_TEMPLATES || []).find(t => t.id === templateId) : null;
    if (chosenTpl) {
      matchedTask = {
        section: chosenTpl.section,
        assignments: chosenTpl.assignments || [],
        time: chosenTpl.time || '',
        person: ''
      };
    }

    if (isEditMode) {
      matchedHoliday = holidays.find(h => h.name === editHolidayName && h.date === editHolidayDate);
      if (matchedHoliday && isTaskEdit) {
        matchedTask = matchedHoliday.tasks[editTaskIdx];
        if (matchedTask && (!matchedTask.assignments || matchedTask.assignments.length === 0)) {
          if (matchedTask.project && matchedTask.project !== '-') {
            matchedTask.assignments = [{
              project: matchedTask.project,
              job: matchedTask.job || '-',
              percent: matchedTask.percent || 100
            }];
          }
        }
      }
      window.editingHolidayTask = { name: editHolidayName, date: editHolidayDate, idx: editTaskIdx };
    } else {
      window.editingHolidayTask = null;
    }

    // Extract unique years from the holidays list
    const yearsSet = new Set();
    holidays.forEach(h => {
      const match = h.date.match(/\d{4}/);
      if (match) {
        yearsSet.add(match[0]);
      } else {
        const parts = h.date.split(/[\s/-]+/);
        if (parts.length > 0) yearsSet.add(parts[parts.length - 1]);
      }
    });
    
    const uniqueYears = Array.from(yearsSet).sort((a,b) => b.localeCompare(a));
    const yearOptions = uniqueYears.map(y => `<option value="${y}">${y}</option>`).join('');

    // Save for the dropdown change event
    window.currentModalHolidays = holidays;

    const employeeOptions = (window.DATA.employees || []).map(emp => `
      <option value="${emp.name}">${emp.name} (${emp.nickname || emp.pos})</option>
    `).join('');

    const scopeTasks = typeof getTasksFromScope === 'function' ? getTasksFromScope() : [];
    const uniqueProjects = [...new Set(scopeTasks.map(t => t.acc))].sort();
    const projectOptions = uniqueProjects.map(proj => `
      <option value="${proj}">${proj}</option>
    `).join('');

    const uniqueJobsByProject = {};
    scopeTasks.forEach(t => {
      if (!uniqueJobsByProject[t.acc]) {
        uniqueJobsByProject[t.acc] = new Set();
      }
      uniqueJobsByProject[t.acc].add(t.title);
    });
    for (const proj in uniqueJobsByProject) {
      uniqueJobsByProject[proj] = Array.from(uniqueJobsByProject[proj]).sort();
    }

    let projectRowsHtml = '';
    if (matchedTask && matchedTask.assignments && matchedTask.assignments.length > 0) {
      projectRowsHtml = matchedTask.assignments.map((a, idx) => {
        const jobs = uniqueJobsByProject[a.project] || [];
        const jobOptions = jobs.map(j => 
          `<option value="${j}" ${j === a.job ? 'selected' : ''}>${j}</option>`
        ).join('');
        
        return `
        <div class="project-row" style="display:grid; grid-template-columns:1fr 1fr 80px auto; gap:12px; margin-bottom:12px; align-items:center;">
          <select class="htProject" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none" onchange="window.onHolidayProjectChange(this)">
            <option value="">-- เลือกโครงการ --</option>
            ${uniqueProjects.map(proj => `<option value="${proj}" ${proj === a.project ? 'selected' : ''}>${proj}</option>`).join('')}
          </select>
          <select class="htJob" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none" onchange="window.onHolidayJobChange(this)">
            <option value="">-- เลือกงาน --</option>
            ${jobOptions}
          </select>
          <div style="position:relative;">
            <input type="number" class="htPercent" value="${a.percent || 100}" min="0" max="100" style="width:100%; padding:10px 24px 10px 10px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none; text-align:center;" oninput="window.calcHolidayTaskTotalPercent()">
            <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:.8rem; color:#64748b;">%</span>
          </div>
          <button type="button" class="text-[12px] font-semibold px-4 py-1.5 btn-remove-project" onclick="if(document.querySelectorAll('.project-row').length > 1) { this.parentElement.remove(); window.calcHolidayTaskTotalPercent(); }" style="display:${matchedTask.assignments.length > 1 ? 'block' : 'none'}; background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; padding:8px;">
            <i data-lucide="trash-2" style="width:16px; height:16px"></i>
          </button>
        </div>
        `;
      }).join('');
    }

    if (!projectRowsHtml) {
      projectRowsHtml = `
      <div class="project-row" style="display:grid; grid-template-columns:1fr 1fr 80px auto; gap:12px; margin-bottom:12px; align-items:center;">
        <select class="htProject" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none" onchange="window.onHolidayProjectChange(this)">
          <option value="">-- เลือกโครงการ --</option>
          ${uniqueProjects.map(proj => `<option value="${proj}">${proj}</option>`).join('')}
        </select>
        <select class="htJob" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none" onchange="window.onHolidayJobChange(this)">
          <option value="">-- เลือกงาน --</option>
        </select>
        <div style="position:relative;">
          <input type="number" class="htPercent" value="100" min="0" max="100" style="width:100%; padding:10px 24px 10px 10px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none; text-align:center;" oninput="window.calcHolidayTaskTotalPercent()">
          <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:.8rem; color:#64748b;">%</span>
        </div>
        <button type="button" class="text-[12px] font-semibold px-4 py-1.5 btn-remove-project" onclick="if(document.querySelectorAll('.project-row').length > 1) { this.parentElement.remove(); window.calcHolidayTaskTotalPercent(); }" style="display:none; background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; padding:8px;">
          <i data-lucide="trash-2" style="width:16px; height:16px"></i>
        </button>
      </div>
      `;
    }

    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:11000; backdrop-filter:blur(6px); animation: fadeIn 0.2s ease-out">
      <div class="modal-card" style="background: var(--surface); width:550px; max-height:90vh; display:flex; flex-direction:column; border-radius:24px; text-shadow:none; box-shadow: var(--shadow); font-family:Prompt, sans-serif">
        <div style="padding:24px 32px 16px; border-bottom:1px solid var(--border);">
          <h3 style="margin:0 0 8px; font-size:1.25rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px">
            <i data-lucide="calendar-plus" style="width:24px; height:24px; color:var(--primary)"></i>
            ${isEditMode ? 'แก้ไขรายการวันหยุดปฏิบัติงาน' : 'เพิ่มรายการวันหยุดปฏิบัติงาน'}
          </h3>
          <p style="margin:0; font-size:.8rem; color:#64748b">กรอกข้อมูลโครงการ งาน และกะเวลาสำหรับวันหยุดนักขัตฤกษ์</p>
        </div>
        
        <form id="htTaskForm" onsubmit="event.preventDefault(); submitHolidayTaskForm();" style="padding:32px; overflow-y:auto; margin:0; display:flex; flex-direction:column; gap:16px">
          
          <div style="display:grid; grid-template-columns:1fr 2fr; gap:16px;">
            <div>
              <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">ปี (Year)</label>
              <select id="htYearSelect" onchange="window.onHolidayYearChange(this.value)" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none; background: var(--surface)">
                ${yearOptions}
              </select>
            </div>
            <div>
              <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">วันหยุด (Public Holiday)</label>
              <select id="htHolidaySelect" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none; background: var(--surface)">
                <option value="" disabled selected>-- เลือกวันหยุด --</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">แผนก (Section)</label>
            <select id="htSection" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none; background: var(--surface)">
              <option value="" disabled ${!matchedTask ? 'selected' : ''}>-- เลือก Section --</option>
              <option value="Operation" ${matchedTask && matchedTask.section === 'Operation' ? 'selected' : ''}>Operation</option>
              <option value="Content & Graphics" ${matchedTask && matchedTask.section === 'Content & Graphics' ? 'selected' : ''}>Content & Graphics</option>
              <option value="Call Center" ${matchedTask && matchedTask.section === 'Call Center' ? 'selected' : ''}>Call Center</option>
            </select>
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">โครงการและงาน (Project & Job)</label>
            <div id="htProjectContainer">
              ${projectRowsHtml}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
              <button type="button" onclick="window.addHolidayTaskProjectRow()" style="background:none; border:none; color:var(--primary);   cursor:pointer; display:flex; align-items:center; gap:4px; " class="text-[12px] font-semibold px-4 py-1.5">
                <i data-lucide="plus" style="width:12px; height:12px"></i> เพิ่มงานอื่นในกะนี้
              </button>
              <div id="htTotalPercent" style="font-size:.8rem; font-weight:700; color:#10b981;">รวม: 100%</div>
            </div>
          </div>

          <div style="margin-bottom:16px">
            <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">กะเวลาปฏิบัติงาน</label>
            <select id="htTime" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none; background: var(--surface)">
              <option value="" disabled ${!matchedTask ? 'selected' : ''}>-- เลือกกะเวลา --</option>
              <option value="เช้าตรู่ 06.00-15.00 น." ${matchedTask && matchedTask.time === 'เช้าตรู่ 06.00-15.00 น.' ? 'selected' : ''}>เช้าตรู่ 06.00-15.00 น.</option>
              <option value="เช้า 09.00-18.00 น." ${matchedTask && matchedTask.time === 'เช้า 09.00-18.00 น.' ? 'selected' : ''}>เช้า 09.00-18.00 น.</option>
              <option value="สาย 12.00-21.00 น." ${matchedTask && matchedTask.time === 'สาย 12.00-21.00 น.' ? 'selected' : ''}>สาย 12.00-21.00 น.</option>
              <option value="บ่าย 15.00-00.00 น." ${matchedTask && matchedTask.time === 'บ่าย 15.00-00.00 น.' ? 'selected' : ''}>บ่าย 15.00-00.00 น.</option>
              <option value="ดึก 00.00-09.00 น." ${matchedTask && matchedTask.time === 'ดึก 00.00-09.00 น.' ? 'selected' : ''}>ดึก 00.00-09.00 น.</option>
            </select>
          </div>

          ${isEditMode ? `
          <div style="margin-bottom:16px">
            <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">ผู้ดำเนินการ</label>
            <select id="htPerson" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none; background: var(--surface)">
              <option value="">-- เลือกพนักงาน --</option>
              ${(window.DATA.employees || []).map(emp => `
                <option value="${emp.name}" ${matchedTask && matchedTask.person === emp.name ? 'selected' : ''}>${emp.name} (${emp.nickname || emp.pos})</option>
              `).join('')}
            </select>
          </div>
          ` : ''}

          <div style="margin-bottom:24px">
            <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">สถานะ</label>
            <select id="htStatus" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius: var(--radius-sm); font-size:.8rem; outline:none; background: var(--surface)">
              <option value="upcoming" ${matchedHoliday && matchedHoliday.status === 'upcoming' ? 'selected' : ''}>กำลังจะถึง (Upcoming)</option>
              <option value="finished" ${matchedHoliday && matchedHoliday.status === 'finished' ? 'selected' : ''}>เสร็จสิ้นแล้ว (Finished)</option>
            </select>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px">
            <button type="button" onclick="document.getElementById('${modalId}').remove()" class="text-[12px] font-semibold px-4 py-1.5 btn" style="background:#f1f5f9; color:#475569; border:none;  border-radius: var(--radius);  cursor:pointer">ยกเลิก</button>
            <button type="submit" class="text-[12px] font-semibold px-4 py-1.5 btn btn-primary" style="background:var(--primary); color:#fff; border:none;  border-radius: var(--radius);  cursor:pointer">${isEditMode ? 'บันทึกการแก้ไข' : 'ถัดไป: เลือกวันหยุด ➔'}</button>
          </div>
        </form>
      </div>
    </div>
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });
    
    if (typeof TomSelect !== 'undefined') {
      document.querySelectorAll('#' + modalId + ' select.htJob').forEach(el => {
        new TomSelect(el, { create: false, sortField: {field: "text", direction: "asc"} });
      });
    }
    
    if (isEditMode) {
      const yearSelect = document.getElementById('htYearSelect');
      const holidaySelect = document.getElementById('htHolidaySelect');
      const parts = editHolidayDate.split(/[\s/-]+/);
      const year = parts[parts.length - 1];
      yearSelect.innerHTML = `<option value="${year}" selected>${year}</option>`;
      holidaySelect.innerHTML = `<option value="${editHolidayName}" data-date="${editHolidayDate}" selected>${editHolidayName} (${editHolidayDate})</option>`;
      window.calcHolidayTaskTotalPercent();
    } else if (uniqueYears.length > 0) {
      window.onHolidayYearChange(uniqueYears[0]);
    }
  };

  window.onHolidayYearChange = function (year) {
    const sel = document.getElementById('htHolidaySelect');
    if (!sel || !window.currentModalHolidays) return;
    
    const filtered = window.currentModalHolidays.filter(h => h.date.includes(year));
    let opts = '<option value="" disabled selected>-- เลือกวันหยุด --</option>';
    filtered.forEach(h => {
      opts += `<option value="${h.name}" data-date="${h.date}">${h.name} (${h.date})</option>`;
    });
    sel.innerHTML = opts;
  };

  window.addHolidayTaskProjectRow = function() {
    const container = document.getElementById('htProjectContainer');
    if (!container) return;
    const firstRow = container.querySelector('.project-row');
    if (!firstRow) return;
    const clone = firstRow.cloneNode(true);
    
    // Cleanup TomSelect artifacts from the clone
    const tsWrappers = clone.querySelectorAll('.ts-wrapper');
    tsWrappers.forEach(ts => ts.remove());
    
    const selects = clone.querySelectorAll('select.htProject');
    selects.forEach(s => {
      s.value = '';
    });
    
    const jobSelect = clone.querySelector('select.htJob');
    if (jobSelect) {
      jobSelect.style.display = '';
      jobSelect.classList.remove('tomselected', 'ts-hidden-accessible');
      jobSelect.innerHTML = '<option value="">-- เลือกงาน --</option>';
      if (jobSelect.tomselect) {
        jobSelect.tomselect.destroy();
      }
    }

    const pctInput = clone.querySelector('.htPercent');
    if (pctInput) pctInput.value = '0';
    
    const delBtn = clone.querySelector('.btn-remove-project');
    if (delBtn) delBtn.style.display = 'block';
    
    container.appendChild(clone);
    if (window.lucide) lucide.createIcons({ root: clone });
    window.calcHolidayTaskTotalPercent();
  };

  window.calcHolidayTaskTotalPercent = function() {
    let total = 0;
    document.querySelectorAll('.htPercent').forEach(input => {
      total += (parseInt(input.value) || 0);
    });
    const label = document.getElementById('htTotalPercent');
    if (label) {
      label.textContent = `รวม: ${total}%`;
      label.style.color = 'var(--primary)';
    }
  };

  window.onHolidayJobChange = function (el) {
    const row = el.closest('.project-row');
    if (!row) return;
    const projSelect = row.querySelector('.htProject');
    const pctInput = row.querySelector('.htPercent');
    if (!projSelect || !pctInput) return;

    const selectedProj = projSelect.value;
    const selectedJob = el.value;

    if (!selectedProj || !selectedJob) {
      pctInput.value = '0';
      window.calcHolidayTaskTotalPercent();
      return;
    }

    const scopeTasks = typeof getTasksFromScope === 'function' ? getTasksFromScope() : [];
    const matchedTask = scopeTasks.find(t => t.acc === selectedProj && t.title === selectedJob);
    if (matchedTask) {
      pctInput.value = matchedTask.hours || 0; 
    } else {
      pctInput.value = '0';
    }

    window.calcHolidayTaskTotalPercent();
  };

  window.onHolidayProjectChange = function (el) {
    if (!el) {
      el = document.getElementById('htProject') || document.querySelector('.htProject');
    }
    const row = el.closest('.project-row');
    const jobSelect = row ? row.querySelector('.htJob') : document.getElementById('htJob');
    if (!jobSelect) return;

    const selectedProj = el.value;
    
    if (jobSelect.tomselect) {
      jobSelect.tomselect.destroy();
    }
    
    jobSelect.innerHTML = '<option value="">-- เลือกงาน --</option>';

    if (!selectedProj) {
      // Re-initialize empty
      new TomSelect(jobSelect, { create: false, sortField: {field: "text", direction: "asc"} });
      return;
    }

    const scopeTasks = typeof getTasksFromScope === 'function' ? getTasksFromScope() : [];
    const jobs = scopeTasks.filter(t => t.acc === selectedProj).map(t => t.title);
    const uniqueJobs = [...new Set(jobs)].sort();

    uniqueJobs.forEach(job => {
      const opt = document.createElement('option');
      opt.value = job;
      opt.textContent = job;
      jobSelect.appendChild(opt);
    });
    
    // Initialize TomSelect with new options
    new TomSelect(jobSelect, { create: false, sortField: {field: "text", direction: "asc"} });
  };

  window.submitHolidayTaskForm = function () {
    const isEdit = !!window.editingHolidayTask;
    const sel = document.getElementById('htHolidaySelect');
    const sectionInput = document.getElementById('htSection');
    const personInput = document.getElementById('htPerson');
    const timeInput = document.getElementById('htTime');
    const statusInput = document.getElementById('htStatus');

    const holidayName = sel ? sel.value : null;
    const holidayDate = sel && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex]?.getAttribute('data-date') || '' : null;
    const section = sectionInput.value;
    const person = personInput ? personInput.value || "-" : "-";
    const time = timeInput.value;
    const status = statusInput.value;

    const projectRows = document.querySelectorAll('.project-row');
    let assignments = [];
    let totalPct = 0;
    projectRows.forEach(row => {
      const p = row.querySelector('.htProject').value;
      const j = row.querySelector('.htJob').value;
      const pct = parseInt(row.querySelector('.htPercent').value) || 0;
      if (p && j) {
        assignments.push({ project: p, job: j, percent: pct });
        totalPct += pct;
      }
    });

    if (isEdit && (!holidayName || !holidayDate)) {
      if (typeof showToast === 'function') showToast('กรุณาเลือกปีและชื่อวันหยุดให้ครบถ้วน', 'danger');
      else alert('กรุณาเลือกปีและชื่อวันหยุดให้ครบถ้วน');
      return;
    }
    if (!section) {
      if (typeof showToast === 'function') showToast('กรุณาเลือก Section', 'danger');
      else alert('กรุณาเลือก Section');
      return;
    }
    if (assignments.length === 0) {
      if (typeof showToast === 'function') showToast('กรุณาเลือกโครงการและงานให้ครบถ้วนอย่างน้อย 1 รายการ', 'danger');
      else alert('กรุณาเลือกโครงการและงานให้ครบถ้วนอย่างน้อย 1 รายการ');
      return;
    }
    if (!time) {
      if (typeof showToast === 'function') showToast('กรุณาเลือกกะเวลาปฏิบัติงาน', 'danger');
      else alert('กรุณาเลือกปีและชื่อวันหยุดให้ครบถ้วน');
      return;
    }
    
    // --- STEP 1 COMPLETE: If ADD MODE, store pending task and go to Step 2 ---
    if (!isEdit) {
      window.pendingHolidayTask = {
        section: section,
        person: person,
        time: time,
        status: status,
        assignments: assignments
      };
      
      const modal = document.getElementById('addHolidayTaskModal');
      if (modal) modal.remove();
      
      if (typeof window.openSelectHolidaysModal === 'function') {
        window.openSelectHolidaysModal();
      }
      return;
    }

    // --- STEP 2 (or Edit Mode): Saving directly to single holiday ---
    const dept = assignments.map(a => `${a.project} - ${a.job}`).join(', ');
    const project = assignments[0].project;
    const job = assignments[0].job;

    let localShifts = [];
    try {
      localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) { }

    let taskId = '';
    const editInfo = window.editingHolidayTask || {};
    const isActualTaskEdit = editInfo.idx !== undefined && editInfo.idx !== null && editInfo.idx !== '';

    if (isEdit) {
      let matched = localShifts.find(ls => ls.name === editInfo.name && ls.date === editInfo.date);
      if (matched) {
        if (!matched.tasks) matched.tasks = [];
        
        if (isActualTaskEdit) {
          const oldTask = matched.tasks[editInfo.idx] || {};
          taskId = oldTask.id || ('HS-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
          const updatedTask = { id: taskId, dept, project, job, assignments, section, person, time };
          matched.tasks[editInfo.idx] = updatedTask;
        } else {
          taskId = 'HS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
          matched.tasks.push({ id: taskId, dept, project, job, assignments, section, person, time });
        }
        matched.status = status;
      } else {
        taskId = 'HS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        localShifts.push({
          date: holidayDate,
          name: holidayName,
          status: status,
          tasks: [{ id: taskId, dept, project, job, assignments, section, person, time }]
        });
      }
      window.editingHolidayTask = null;
    } else {
      taskId = 'HS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      let matched = localShifts.find(ls => ls.name === holidayName && ls.date === holidayDate);
      if (matched) {
        if (!matched.tasks) matched.tasks = [];
        matched.tasks.push({ id: taskId, dept, project, job, assignments, section, person, time });
        matched.status = status;
      } else {
        localShifts.push({
          date: holidayDate,
          name: holidayName,
          status: status,
          tasks: [{ id: taskId, dept, project, job, assignments, section, person, time }]
        });
      }
    }

    localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));

    if (typeof apiSaveHolidayShift === 'function') {
      apiSaveHolidayShift({
        action: (isEdit && isActualTaskEdit) ? 'edit' : 'add',
        id: taskId,
        date: holidayDate,
        holidayName: holidayName,
        status: status,
        section: section,
        person: person,
        time: time,
        assignments: JSON.stringify(assignments)
      });
    }
    
    document.getElementById('addHolidayTaskModal').remove();

    if (typeof window.showToast === 'function') {
      window.showToast(isEdit ? 'แก้ไขชุดงานวันหยุดเรียบร้อย' : 'เพิ่มชุดงานวันหยุดเรียบร้อย', 'success');
    } else {
      alert(isEdit ? 'แก้ไขชุดงานวันหยุดเรียบร้อย!' : 'เพิ่มชุดงานวันหยุดเรียบร้อย!');
    }

    if (typeof navigate === 'function') {
      navigate('public-holiday');
    }
  };

  window.openSelectHolidaysModal = function() {
    const holidays = window.currentModalHolidays || [];
    if (holidays.length === 0) {
      if (typeof showToast === 'function') showToast('ไม่พบข้อมูลวันหยุด', 'danger');
      else alert('กรุณาเลือกปีและชื่อวันหยุดให้ครบถ้วน');
      return;
    }

    // Group holidays by year
    const grouped = {};
    holidays.forEach(h => {
      const match = h.date.match(/\d{4}/);
      const year = match ? match[0] : h.date.split(/[\s/-]+/).pop();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(h);
    });

    const years = Object.keys(grouped).sort((a,b) => b.localeCompare(a));
    
    let listHtml = '';
    years.forEach(year => {
      listHtml += `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 10px; font-size:.9rem; font-weight:700; color:var(--primary); border-bottom:1px solid var(--border); padding-bottom:6px;">ปี ${year}</h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
      `;
      grouped[year].forEach(h => {
        listHtml += `
          <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:8px 12px; border-radius: var(--radius-sm); border:1px solid var(--border); transition:all 0.2s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='none'">
            <input type="checkbox" class="ht-holiday-checkbox" value='${JSON.stringify({name: h.name, date: h.date}).replace(/'/g, "&#39;")}' style="width:16px; height:16px; accent-color:var(--primary); cursor:pointer;">
            <div style="display:flex; flex-direction:column;">
              <span style="font-size:.8rem; font-weight:600; color:#1e293b;">${h.name}</span>
              <span style="font-size:.7rem; color:#64748b;">${h.date}</span>
            </div>
          </label>
        `;
      });
      listHtml += `</div></div>`;
    });

    const modalId = 'selectHolidaysModal';
    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:11500; backdrop-filter:blur(6px); animation: fadeIn 0.2s ease-out">
      <div class="modal-card" style="background: var(--surface); width:500px; max-height:85vh; display:flex; flex-direction:column; border-radius:24px; text-shadow:none; box-shadow: var(--shadow); font-family:Prompt, sans-serif">
        <div style="padding:24px 32px 16px; border-bottom:1px solid var(--border);">
          <h3 style="margin:0 0 8px; font-size:1.25rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px">
            <i data-lucide="calendar-check" style="width:24px; height:24px; color:var(--primary)"></i> เลือกวันหยุดที่ต้องการเพิ่มงาน
          </h3>
          <p style="margin:0; font-size:.8rem; color:#64748b">กรอกข้อมูลโครงการ งาน และกะเวลาสำหรับวันหยุดนักขัตฤกษ์</p>
        </div>
        <div style="flex:1; overflow-y:auto; padding:24px 32px;">
          ${listHtml}
        </div>
        <div style="padding:16px 32px 24px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:12px;">
          <button onclick="document.getElementById('${modalId}').remove()" style="background:#f1f5f9; color:#64748b; border:none;  border-radius: var(--radius);  cursor:pointer;" class="text-[12px] font-semibold px-4 py-1.5">ยกเลิก</button>
          <button onclick="window.submitHolidayTaskBatch()" style="background:var(--primary); color:#fff; border:none;  border-radius: var(--radius);  cursor:pointer;" class="text-[12px] font-semibold px-4 py-1.5">บันทึก</button>
        </div>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });
  };

  window.submitHolidayTaskBatch = function() {
    const checkboxes = document.querySelectorAll('.ht-holiday-checkbox:checked');
    if (checkboxes.length === 0) {
      if (typeof showToast === 'function') showToast('กรุณาเลือกวันหยุดอย่างน้อย 1 วัน', 'danger');
      else alert('กรุณาเลือกโครงการและงานให้ครบถ้วนอย่างน้อย 1 รายการ');
      return;
    }

    const pending = window.pendingHolidayTask;
    if (!pending) {
      if (typeof showToast === 'function') showToast('ไม่พบข้อมูลงานที่รอดำเนินการ', 'danger');
      else alert('กรุณาเลือกปีและชื่อวันหยุดให้ครบถ้วน');
      return;
    }

    const selectedHolidays = [];
    checkboxes.forEach(cb => {
      try {
        selectedHolidays.push(JSON.parse(cb.value));
      } catch(e) {}
    });

    let localShifts = [];
    try {
      localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) { }

    selectedHolidays.forEach(h => {
      const holidayName = h.name;
      const holidayDate = h.date;

      const dept = pending.assignments.map(a => `${a.project} - ${a.job}`).join(', ');
      const project = pending.assignments[0].project;
      const job = pending.assignments[0].job;

      const taskId = 'HS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      let matched = localShifts.find(ls => ls.name === holidayName && ls.date === holidayDate);
      if (matched) {
        if (!matched.tasks) matched.tasks = [];
        matched.tasks.push({
          id: taskId,
          dept,
          project,
          job,
          assignments: pending.assignments,
          section: pending.section,
          person: pending.person,
          time: pending.time
        });
        matched.status = pending.status;
      } else {
        localShifts.push({
          date: holidayDate,
          name: holidayName,
          status: pending.status,
          tasks: [{
            id: taskId,
            dept,
            project,
            job,
            assignments: pending.assignments,
            section: pending.section,
            person: pending.person,
            time: pending.time
          }]
        });
      }

      if (typeof apiSaveHolidayShift === 'function') {
        apiSaveHolidayShift({
          action: 'add',
          id: taskId,
          date: holidayDate,
          holidayName: holidayName,
          status: pending.status,
          section: pending.section,
          person: pending.person,
          time: pending.time,
          assignments: JSON.stringify(pending.assignments)
        });
      }
    });

    localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));

    document.getElementById('selectHolidaysModal').remove();
    window.pendingHolidayTask = null;

    if (typeof window.showToast === 'function') {
      window.showToast(`เพิ่มชุดงานลงใน ${selectedHolidays.length} วันหยุดเรียบร้อยแล้ว`, 'success');
    } else {
      alert(`เพิ่มชุดงานลงใน ${selectedHolidays.length} วันหยุดเรียบร้อยแล้ว!`);
    }

    if (typeof navigate === 'function') {
      navigate('public-holiday');
    }
  };

  window.showAlert = function(title, message, type = 'warning') {
    const modalId = 'alertModal';
    const color = type === 'danger' ? '#ef4444' : (type === 'success' ? '#10b981' : '#f59e0b');
    const bgLight = color + '10';
    const icon = type === 'danger' ? 'alert-circle' : (type === 'success' ? 'check-circle' : 'alert-triangle');

    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:11000; backdrop-filter:blur(6px); animation: fadeIn 0.2s ease-out">
      <div class="modal-card" style="background: var(--surface); width:380px; border-radius:24px; padding:32px; text-align:center; box-shadow: var(--shadow)">
        <div style="width:64px; height:64px; border-radius:20px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; margin:0 auto 20px">
          <i data-lucide="${icon}" style="width:32px; height:32px"></i>
        </div>
        <h3 style="margin:0 0 10px; font-size:1.15rem; font-weight:700; color:#1e293b; font-family:Prompt">${title}</h3>
        <p style="margin:0 0 24px; font-size:.8rem; color:#64748b; line-height:1.5; font-family:Prompt">${message}</p>
        <button onclick="document.getElementById('${modalId}').remove()" style="width:100%; background:${color}; color:#fff; border:none;  border-radius: var(--radius);  font-family:Prompt; cursor:pointer;  box-shadow: var(--shadow)" class="text-[12px] font-semibold px-4 py-1.5">ตกลง</button>
      </div>
    </div>
    <style>@keyframes fadeIn __OPEN__ from __OPEN__ opacity: 0; __CLOSE__ to __OPEN__ opacity: 1; __CLOSE__ __CLOSE__</style>
  `.replace(/__OPEN__/g, '{').replace(/__CLOSE__/g, '}');
    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });
  }

  window.showConfirmModal = function({ title, message, confirmText, onConfirm, type = 'danger' }) {
    const modalId = 'confirmModal';
    if (document.getElementById(modalId)) document.getElementById(modalId).remove();

    const color = type === 'danger' ? '#ef4444' : '#6366f1';
    const bgLight = type === 'danger' ? '#fef2f2' : '#f5f3ff';
    const icon = type === 'danger' ? 'trash-2' : 'help-circle';

    const html = `
    <div id="${modalId}" class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.4); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:99999; animation: fadeIn 0.3s ease">
      <div class="modal-card" style="background: var(--surface); width:420px; border-radius:24px; padding:40px; text-align:center; box-shadow: var(--shadow); border:1px solid rgba(255,255,255,0.2); transform:scale(1); animation: modalBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)">
        <div style="width:72px; height:72px; border-radius:22px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; transform: rotate(-5deg)">
          <i data-lucide="${icon}" style="width:36px; height:36px"></i>
        </div>
        <h3 style="margin:0 0 12px; font-size:1.3rem; font-weight:700; color:#1e293b; font-family:Prompt">${title}</h3>
        <p style="margin:0 0 32px; font-size:.9rem; color:#64748b; line-height:1.6; font-family:Prompt; padding:0 10px">${message}</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
          <button onclick="document.getElementById('${modalId}').remove()" style="background:#f8fafc; color:#64748b; border: 1px solid var(--border);  border-radius: var(--radius);  font-family:Prompt; cursor:pointer;  transition:all 0.2s" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'" class="text-[12px] font-semibold px-4 py-1.5">Cancel</button>
          <button id="confirmModalBtn" style="background:${color}; color:#fff; border:none;  border-radius: var(--radius);  font-family:Prompt; cursor:pointer;  box-shadow: var(--shadow); transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 25px ${color}40'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px ${color}30'" class="text-[12px] font-semibold px-4 py-1.5">${confirmText}</button>
        </div>
      </div>
    </div>
    <style>
      @keyframes modalBounce __OPEN__ 
        0% __OPEN__ transform: scale(0.8); opacity: 0; __CLOSE__ 
        100% __OPEN__ transform: scale(1); opacity: 1; __CLOSE__ 
      __CLOSE__
      @keyframes fadeIn __OPEN__ from __OPEN__ opacity: 0; __CLOSE__ to __OPEN__ opacity: 1; __CLOSE__ __CLOSE__
    </style>
  `.replace(/__OPEN__/g, '{').replace(/__CLOSE__/g, '}');

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });

    document.getElementById('confirmModalBtn').onclick = () => {
      const card = document.querySelector(`#${modalId} .modal-card`);
      if (card) card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        document.getElementById(modalId).remove();
        if (onConfirm) onConfirm();
      }, 100);
    };
  }

  window.initLeaveCharts = function() {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { display: false } }
    };

    // Leave Type Chart (Bar) - Improved counting and spacing
    const leaveTypes = ['ลาพักร้อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอด / ลาเลี้ยงดูบุตร', 'ลาเพื่อการฌาปนกิจศพ', 'อบรม / สัมมนา', 'วันหยุดชดเชย', 'อื่นๆ'];
    const reqs = window._filteredLeaveRequests || window.DATA.leaveRequests || [];

    const typeData = leaveTypes.map(t => {
      return reqs.filter(r => {
        const rType = (r.type || '').trim();
        if (t === 'วันหยุดชดเชย') return rType === 'วันหยุดชดเชย' || rType === 'Compensatory';
        return rType === t;
      }).length;
    });

    // Add count for types not in the list to "อื่นๆ"
    const knownTypes = new Set(['ลาพักร้อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอด / ลาเลี้ยงดูบุตร', 'ลาเพื่อการฌาปนกิจศพ', 'อบรม / สัมมนา', 'วันหยุดชดเชย', 'Compensatory']);
    const otherCount = reqs.filter(r => !knownTypes.has((r.type || '').trim())).length;
    typeData[7] = typeData[7] + otherCount;

    const typeCtx = document.getElementById('leaveTypeChart')?.getContext('2d');
    if (typeCtx) {
      Chart.getChart(typeCtx.canvas)?.destroy();
      new Chart(typeCtx, {
        type: 'bar',
        data: {
          labels: leaveTypes,
          datasets: [{
            data: typeData,
            backgroundColor: [
              '#A5B4FC', // ลาพักร้อน (Pastel Indigo)
              '#FCD34D', // ลากิจ (Pastel Amber)
              '#FCA5A5', // ลาป่วย (Pastel Red)
              '#FBCFE8', // ลาคลอด (Pastel Pink)
              '#94A3B8', // ฌาปนกิจ (Pastel Slate)
              '#C4B5FD', // อบรม (Pastel Violet)
              '#6EE7B7', // วันหยุดชดเชย (Pastel Emerald)
              '#CBD5E1'  // อื่นๆ (Pastel Blue-gray)
            ],
            borderRadius: 6,
            barThickness: 18
          }]
        },
        options: {
          indexAxis: 'y',
          ...commonOptions,
          layout: { padding: { right: 30 } }, // Add space on the right for numbers
          scales: {
            x: {
              display: false,
              grid: { display: false },
              suggestedMax: Math.max(...typeData) + 2 // Ensure space on right
            },
            y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 9 } } }
          }
        },
        plugins: [{
          id: 'datalabels',
          afterDraw: (chart) => {
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              meta.data.forEach((bar, index) => {
                const data = dataset.data[index];
                if (data > 0) {
                  ctx.fillStyle = '#64748b';
                  ctx.font = 'bold 10px Prompt';
                  ctx.textAlign = 'left';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(data, bar.x + 8, bar.y);
                }
              });
            });
          }
        }]
      });
    }

    // Leave Trend Chart (Line)
    const trendCtx = document.getElementById('leaveTrendChart')?.getContext('2d');
    if (trendCtx) {
      Chart.getChart(trendCtx.canvas)?.destroy();
      new Chart(trendCtx, {
        type: 'line',
        data: {
        labels: ['รายได้จากการขาย', 'ต้นทุนโครงการ', 'ค่าใช้จ่ายในการดำเนินงาน'],
          datasets: [{
            label: 'วันลา (วัน)',
            data: (() => {
              const counts = Array(12).fill(0);
              reqs.forEach(r => {
                if (r.startRaw) {
                  const month = new Date(r.startRaw).getMonth();
                  counts[month] += (Number(r.days) || 1);
                }
              });
              return counts;
            })(),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
            borderWidth: 3
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 10 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Prompt', size: 10 } } }
          }
        }
      });
    }

    // Leave Status Chart (Doughnut) - Use real data
    const sStats = window.DATA.leaveStats || { pending: 0, approved: 0, rejected: 0 };
    const statusCtx = document.getElementById('leaveStatusChart')?.getContext('2d');
    if (statusCtx) {
      Chart.getChart(statusCtx.canvas)?.destroy();
      new Chart(statusCtx, {
        type: 'doughnut',
        data: {
        labels: ['รายได้จากการขาย', 'ต้นทุนโครงการ', 'ค่าใช้จ่ายในการดำเนินงาน'],
          datasets: [{
            data: [sStats.pending, sStats.approved, sStats.rejected],
            backgroundColor: ['#FDE68A', '#7FD1B9', '#FCA5A5'],
            borderWidth: 0,
            cutout: '75%'
          }]
        },
        options: {
          ...commonOptions,
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }


  window.PREMIUM_SCOPE_DATA = window.PREMIUM_SCOPE_DATA || [];

  window.applyScopeDashboardFilters = function() {
    const pVal = document.getElementById('scopeFilterProject')?.value || 'all';
    const nVal = document.getElementById('scopeFilterNode')?.value || 'all';
    const qVal = document.getElementById('scopeSearch')?.value.toLowerCase() || '';

    // Filter logic for Grouped Data
    let filtered = window.PREMIUM_SCOPE_DATA.map(group => {
      // 1. Check Project Filter
      if (pVal !== 'all' && group.account !== pVal) return null;

      // 2. Filter items by Node and Search Query
      let filteredItems = group.items;

      // Node Filter
      if (nVal !== 'all') {
        filteredItems = filteredItems.filter(item => item.node === nVal);
      }

      // Search Query Filter (Project name or Scope name)
      if (qVal) {
        filteredItems = filteredItems.filter(item =>
          item.name.toLowerCase().includes(qVal) ||
          group.account.toLowerCase().includes(qVal)
        );
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
                  <div style="font-size:0.9rem;font-weight:500;font-family:'Prompt', sans-serif;">Applying Filter...</div>
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
      const holidayName = isThaiHoliday ? isThaiHoliday(d.dateObj) : null;
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

    return data.map(group => `
    <!-- Group Header: ${group.account} -->
    <tr style="background: rgba(37, 99, 235, 0.04)">
      <td colspan="${window.isScopeBulkMode ? 2 : 1}" style="padding: 12px 20px; ${window.isScopeBulkMode ? 'padding-left: 56px;' : ''} font-weight: 800; color: #2563eb; border-bottom: 1px solid var(--border); position: sticky; left: 0; z-index: 15; background: #f0f7ff">
        <div style="display: flex; align-items: center; gap: 8px">
          <i data-lucide="layers" style="width: 16px; height: 16px"></i>
          ${group.account}
        </div>
      </td>
      <td colspan="${2 + days.length}" style="border-bottom: 1px solid var(--border); background: #f0f7ff"></td>
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
              <button class="text-[12px] font-semibold px-4 py-1.5 btn-icon" title="แก้ไข" onclick="showEditWorkshipScopeModal('${group.account.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}', '${item.node}', ${item.progress})" style="width: 28px;  border-radius: 50%; background: var(--primary-light); color: var(--primary); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.6; transition: opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">
                <i data-lucide="edit-3" style="width: 14px; height: 14px"></i>
              </button>
              <button class="text-[12px] font-semibold px-4 py-1.5 btn-icon" title="ลบ" onclick="deleteWorkshipScope('${group.account.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}')" style="width: 28px;  border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.6; transition: opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">
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
        const isHoliday = typeof isThaiHoliday === 'function' ? !!isThaiHoliday(d.dateObj) : false;
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
              ${displayNames ? `<div style="font-size: 0.75rem; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 4px 8px; border-radius: 6px; display: inline-block">${displayNames}</div>` : '<span style="color: #e2e8f0">-</span>'}
              ${matchedTasks.length > 0 && !displayNames ? `<span style="color:red; font-size:10px">HIDDEN MATCH</span>` : ''}
            </td>
          `;
      }).join('')}
      </tr>
    `).join('')}
    <tr style="height: 12px; background: transparent"><td colspan="${3 + days.length}"></td></tr>
  `).join('');
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

  window.apiSaveHolidayShift = async function (data) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase config is missing for Holiday Shifts Sync");
      return;
    }

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    };

    console.log("Holiday Shifts Sync: Sending payload to Supabase:", data);

    try {
      if (data.action === 'add' || data.action === 'save_shift' || data.action === 'save_template') {
        let parsedAssignments = [];
        if (typeof data.assignments === 'string') {
          try { parsedAssignments = JSON.parse(data.assignments); } catch(e) { parsedAssignments = []; }
        } else if (Array.isArray(data.assignments)) {
          parsedAssignments = data.assignments;
        }

        const payload = {
          id: data.id || ('HS_' + Date.now()),
          date: data.date || '',
          holiday_name: data.holidayName || data.holiday_name || '',
          status: data.status || 'upcoming',
          section: data.section || '',
          person: data.person || '',
          time_shift: data.time || data.time_shift || '',
          assignments: parsedAssignments
        };

        await fetch(`${supabaseUrl}/rest/v1/holiday_shifts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      } else if (data.action === 'delete') {
        await fetch(`${supabaseUrl}/rest/v1/holiday_shifts?id=eq.${data.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
      }
      console.log("Holiday Shifts Sync: Request completed successfully.");
    } catch (err) {
      console.error("Holiday Shifts Sync Error:", err);
    }
  };