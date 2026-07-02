import flatpickr from 'flatpickr';
if (typeof window !== 'undefined') {
  window.flatpickr = flatpickr;
}

  if (typeof window !== 'undefined' && window.logLoad) window.logLoad("pages.js: Loading...");
  // ===== PAGE RENDERERS =====

  window.fmt = function(n) { return Number(n).toLocaleString('en-US'); }

  // Global Helpers for Schedule/Dashboard
  window.getWorkloadColor = (percent) => {
    if (percent === 0) return 'var(--text-3)';
    if (percent < 50) return '#ef4444';
    if (percent <= 80) return '#facc15';
    if (percent <= 100) return '#22c55e';
    if (percent <= 120) return '#166534';
    return '#991b1b';
  };

  window.getTeamColor = (team) => {
    const t = String(team || '').toLowerCase();
    if (t.includes('ace')) return '#f97316';
    if (t.includes('sertec')) return '#8b5cf6';
    if (t.includes('onix')) return '#2563eb';
    if (t.includes('sale support')) return '#ef4444';
    if (t.includes('call center')) return '#10b981';
    return '#64748b';
  };

  window.getPosBgColor = (pos) => {
    const p = String(pos || '').toLowerCase();
    if (p.includes('director')) return '#e9d5ff'; // Purple
    if (p.includes('assistant manager')) return '#dbeafe'; // Light Blue
    if (p.includes('manager')) return '#e0f2fe'; // Sky Blue
    if (p.includes('senior')) return '#d1fae5'; // Light Green
    if (p.includes('junior')) return '#e0e7ff'; // Indigo
    return '#f1f5f9';
  };

  window.getPosTextColor = (pos) => {
    const p = String(pos || '').toLowerCase();
    if (p.includes('director')) return '#581c87'; 
    if (p.includes('assistant manager')) return '#1e40af';
    if (p.includes('manager')) return '#0369a1'; // Sky Blue Dark
    if (p.includes('senior')) return '#047857';
    if (p.includes('junior')) return '#4338ca';
    return '#475569';
  };
  window.showToast = function (msg, type = 'info') {
    const toast = document.createElement('div');
    const color = type === 'danger' ? '#ef4444' : '#6366f1';
    
    // Choose inline SVG based on status
    const svgIcon = type === 'danger'
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    toast.style.cssText = `
      position: fixed; top: 24px; right: 24px; z-index: 99999;
      background: white; padding: 16px 24px; border-radius: var(--radius);
      box-shadow: var(--shadow); border-left: 5px solid ${color};
      display: flex; align-items: center; gap: 12px; font-family: 'Prompt', sans-serif;
      font-size: 0.9rem; font-weight: 700; color: #1e293b;
      transform: translateX(120%); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    toast.innerHTML = `${svgIcon} ${msg}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.style.transform = 'translateX(0)');

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  };

  window.statusBadge = function(s) {
    const map = {
      paid: 'badge-green', approved: 'badge-green', done: 'badge-green', active: 'badge-green',
      pending: 'badge-yellow', review: 'badge-yellow', inprog: 'badge-blue', upcoming: 'badge-blue',
      planned: 'badge-gray', probation: 'badge-yellow',
      high: 'badge-red', medium: 'badge-yellow', low: 'badge-gray'
    };
    const labels = {
      paid: 'Paid', approved: 'Approved', done: 'Done', active: 'Active',
      pending: 'Pending', review: 'Review', inprog: 'In Progress', upcoming: 'Upcoming',
      planned: 'Planned', probation: 'Probation', high: 'High', medium: 'Medium', low: 'Low'
    };
    return `<span class="badge ${map[s] || 'badge-gray'}">${labels[s] || s}</span>`;
  }

  // ---------- HOME (pageDashboard) ----------
  // Defined in js/home.js


  // ---------- DATE RANGE PICKER ----------
  window._datePickerCounter = 0;

  window.monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  window.dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  window.thaiHolidays = {
    '1-1': 'วันขึ้นปีใหม่', '2-10': 'วันมาฆบูชา', '4-6': 'วันจักรี', '4-13': 'วันสงกรานต์', '4-14': 'วันสงกรานต์', '4-15': 'วันสงกรานต์',
    '5-1': 'วันแรงงานแห่งชาติ', '5-4': 'วันฉัตรมงคล', '5-12': 'วันวิสาขบูชา', '6-3': 'วันเฉลิมพระชนมพรรษา สมเด็จพระราชินี',
    '7-10': 'วันอาสาฬหบูชา', '7-11': 'วันเข้าพรรษา', '7-28': 'วันเฉลิมพระชนมพรรษา ร.10', '8-12': 'วันเฉลิมพระชนมพรรษา สมเด็จพระบรมราชชนนี / วันแม่',
    '10-13': 'วันคล้ายวันสวรรคต ร.9', '10-23': 'วันปิยมหาราช', '12-5': 'วันคล้ายวันพระบรมราชสมภพ ร.9 / วันพ่อ', '12-10': 'วันรัฐธรรมนูญ', '12-31': 'วันสิ้นปี'
  };
  window.isThaiHoliday = (dateObj) => {
    if (!dateObj) return null;
    const key = `${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
    if (window.HOLIDAYS && window.HOLIDAYS[key]) return window.HOLIDAYS[key];
    return window.thaiHolidays[key] || null;
  };

  window.renderDateFilter = function(onchangeFn = 'initCostCharts()', position = 'auto', onClearFn = null, showClear = true, extraFilterHtml = '', dateRangeVarName = '_currentDateRange') {
    const id = 'drp_' + (++_datePickerCounter);
    const fromId = id + '_from';
    const toId = id + '_to';
    const wrapperId = id + '_wrap';

    // Persistence: Check if we have a saved range for this page
    const savedRange = window[dateRangeVarName] || '';

    setTimeout(() => {
      const hiddenEl = document.getElementById(id);
      const wrapper = document.getElementById(wrapperId);
      if (!hiddenEl || hiddenEl._flatpickr || !wrapper) return;

      const fp = flatpickr(hiddenEl, {
        mode: 'range',
        defaultDate: savedRange ? savedRange.split(' to ').map(d => {
          const [y, m, day] = d.split('-').map(Number);
          return new Date(y, m - 1, day);
        }) : null,
        dateFormat: 'd/m/Y',
        locale: {
          firstDayOfWeek: 0,
          rangeSeparator: ' to ',
          weekdays: {
            shorthand: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
            longhand: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
          },
          months: {
            shorthand: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
            longhand: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
          }
        },
        showMonths: 1,
        showOutsideDays: false,
        disableMobile: true,
        allowInput: false,
        static: true,
        position: position,
        monthSelectorType: 'dropdown', // enable click to show month dropdown
        yearSelectorType: 'dropdown', // enable click to show year dropdown
        onReady: function (selectedDates, dateStr, instance) {
          const createGrid = (type) => {
            const container = instance.calendarContainer;
            let grid = container.querySelector('.custom-grid-overlay');
            if (!grid) {
              grid = document.createElement('div');
              grid.className = 'custom-grid-overlay';
              container.appendChild(grid);
            }
            grid.innerHTML = '';
            grid.style.display = 'grid';

            if (type === 'month') {
              const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
              months.forEach((m, i) => {
                const btn = document.createElement('div');
                btn.className = 'grid-item' + (instance.currentMonth === i ? ' active' : '');
                btn.textContent = m;
                btn.onclick = (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  instance.changeMonth(i, false);
                  grid.style.display = 'none';
                };
                grid.appendChild(btn);
              });
            } else {
              const curYear = instance.currentYear;
              const startYear = Math.min(2022, curYear - 6);
              const endYear = Math.max(2027, curYear + 6);
              for (let y = startYear; y <= endYear; y++) {
                const btn = document.createElement('div');
                btn.className = 'grid-item' + (curYear === y ? ' active' : '');
                btn.textContent = y + 543; // Thai year
                btn.onclick = (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  instance.changeYear(y);
                  grid.style.display = 'none';
                };
                grid.appendChild(btn);
              }
            }
          };

          // Direct click handlers for month and year labels (using Flatpickr classes)
          const monthLabel = instance.calendarContainer.querySelector('.flatpickr-monthDropdown-month');
          const yearLabel = instance.calendarContainer.querySelector('.cur-year');
          if (monthLabel) {
            monthLabel.style.cursor = 'pointer';
            monthLabel.onclick = () => createGrid('month');
          }
          if (yearLabel) {
            yearLabel.style.cursor = 'pointer';
            yearLabel.onclick = () => createGrid('year');
          }

          // Hide grid when clicking elsewhere in calendar
          instance.calendarContainer.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.custom-grid-overlay') && !e.target.closest('.flatpickr-month')) {
              const grid = instance.calendarContainer.querySelector('.custom-grid-overlay');
              if (grid) grid.style.display = 'none';
            }
          });
        },
        onChange: function (selectedDates, dateStr, instance) {
          const fromBox = document.getElementById(fromId);
          const toBox = document.getElementById(toId);

          const fmtDisp = d => {
            if (!d) return '';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear() + 543;
            return `${day}/${month}/${year}`;
          };

          if (fromBox && toBox) {
            fromBox.querySelector('span').textContent = selectedDates[0] ? fmtDisp(selectedDates[0]) : 'From';
            fromBox.style.color = selectedDates[0] ? 'var(--text)' : 'var(--text-3)';
            toBox.querySelector('span').textContent = selectedDates[1] ? fmtDisp(selectedDates[1]) : 'To';
            toBox.style.color = selectedDates[1] ? 'var(--text)' : 'var(--text-3)';
          }

          // Store globally for persistence
          const rangeVal = selectedDates[0] ? (instance.formatDate(selectedDates[0], 'Y-m-d') + (selectedDates[1] ? ' to ' + instance.formatDate(selectedDates[1], 'Y-m-d') : '')) : '';
          hiddenEl.value = rangeVal;
          window[dateRangeVarName] = rangeVal;

          if (selectedDates.length === 2) {
            try { eval(onchangeFn); } catch (e) { }
          }
        },
        onClose: function (selectedDates, dateStr, instance) {
          if (selectedDates.length === 1) {
            try { eval(onchangeFn); } catch (e) { }
          }
        },
        onReady: function (selectedDates, dateStr, instance) {
          const fromBox = document.getElementById(fromId);
          const toBox = document.getElementById(toId);
          const fmtDisp = d => {
            if (!d) return '';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear() + 543;
            return `${day}/${month}/${year}`;
          };

          if (fromBox && toBox && selectedDates.length > 0) {
            fromBox.querySelector('span').textContent = fmtDisp(selectedDates[0]);
            fromBox.style.color = 'var(--text)';
            if (selectedDates[1]) {
              toBox.querySelector('span').textContent = fmtDisp(selectedDates[1]);
              toBox.style.color = 'var(--text)';
            }
          }
        }
      });

      // Explicitly open on click
      const openFp = (e) => {
        e.stopPropagation();
        fp.open();
      };
      document.getElementById(fromId)?.addEventListener('click', openFp);
      document.getElementById(toId)?.addEventListener('click', openFp);

      // Clear function
      const clearBtn = document.getElementById(id + '_clear');
      if (clearBtn) {
        clearBtn.onclick = (e) => {
          e.stopPropagation();
          fp.clear();
          document.getElementById(fromId).querySelector('span').textContent = 'From';
          document.getElementById(fromId).style.color = 'var(--text-3)';
          document.getElementById(toId).querySelector('span').textContent = 'To';
          document.getElementById(toId).style.color = 'var(--text-3)';
          if (onClearFn) {
            try { eval(onClearFn); } catch (err) { }
          } else {
            try { eval(onchangeFn); } catch (err) { }
          }
        };
      }
    }, 100);

    const boxStyle = `display:flex;align-items:center;justify-content:space-between;gap:8px;
    background: var(--surface2);border:1px solid var(--border);border-radius: var(--radius-sm);
    padding:0 12px;font-size:.8rem;cursor:pointer;min-width:120px;height:34px;box-sizing:border-box;
    transition:border-color .2s;`;
    const iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" stroke-width="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

    return `
    <div id="${wrapperId}" class="date-range-wrapper" style="display:flex;flex-direction:column;position:relative">
      <div style="display:flex;align-items:center;gap:8px">
        <div id="${fromId}" style="${boxStyle}color:var(--text-3)" onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='var(--border)'">
          <span>From</span>${iconSvg}
        </div>
        <span style="color:var(--text-3);font-size:.7rem;flex-shrink:0">-</span>
        <div id="${toId}" style="${boxStyle}color:var(--text-3)" onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='var(--border)'">
          <span>To</span>${iconSvg}
        </div>
        ${extraFilterHtml || ''}
        ${showClear ? `
        <button id="${id}_clear" class="text-[12px] font-semibold px-4 py-1.5 btn btn-danger btn-sm" style="  white-space:nowrap; border-radius: 99px; background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2); display:flex; align-items:center; gap:6px">
          <i data-lucide="rotate-ccw" style="width:13px; height:13px"></i>
          Clear All Filter
        </button>
        ` : ''}
      </div>
      <input id="${id}" type="text" style="position:absolute;width:0;height:0;opacity:0;pointer-events:none" readonly>
    </div>`;
  }

  window.getEmployeeDisplayName = function(empOrName) {
    let emp = null;
    if (empOrName && typeof empOrName === 'object') {
      emp = empOrName;
    } else if (empOrName) {
      const searchVal = String(empOrName).trim().toLowerCase();
      emp = (window.DATA && window.DATA.employees || []).find(e => 
        String(e.id).trim().toLowerCase() === searchVal ||
        String(e.name).trim().toLowerCase() === searchVal ||
        String(e.nickname).trim().toLowerCase() === searchVal ||
        String(e.nameEn).trim().toLowerCase() === searchVal
      );
    }
    
    if (emp) {
      if (emp.nickname && emp.nickname !== '-' && emp.nickname.trim() !== '') {
        return emp.nickname.trim();
      }
      const targetName = (emp.nameEn && emp.nameEn !== '-') ? emp.nameEn : emp.name;
      const parts = targetName.trim().split(/\s+/);
      if (parts.length > 1) {
        return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
      }
      return parts[0];
    }
    
    if (empOrName && typeof empOrName === 'string') {
      const cleanName = empOrName.trim();
      if (/^[A-Za-z\s]+$/.test(cleanName)) {
        const parts = cleanName.split(/\s+/);
        if (parts.length > 1) {
          return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
        }
        return parts[0];
      }
      return cleanName.split(' ')[0];
    }
    
    return '-';
  };

  window.toggleActionMenu = function (id, event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('actionMenu_' + id);
    if (!menu) return;
    const isOpen = menu.style.display === 'block';

    // Close all other menus
    document.querySelectorAll('[id^="actionMenu_"]').forEach(m => m.style.display = 'none');

    if (!isOpen) {
      menu.style.display = 'block';
    }
  };

  // Close menus when clicking outside
  if (!window._actionMenuListenerAdded) {
    document.addEventListener('click', function () {
      document.querySelectorAll('[id^="actionMenu_"]').forEach(m => m.style.display = 'none');
    });
    window._actionMenuListenerAdded = true;
  }

