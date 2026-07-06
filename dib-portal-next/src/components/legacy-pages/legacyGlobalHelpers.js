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
    const cleanFn = onchangeFn.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanVar = dateRangeVarName.replace(/[^a-zA-Z0-9]/g, '_');
    const id = `drp_${cleanFn}_${cleanVar}`;
    const wrapperId = id + '_wrap';
    const labelId = id + '_label';
    const prevId = id + '_prev';
    const nextId = id + '_next';

    // Calculate default current week (Saturday to Friday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToSat = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() - diffToSat);
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultStart.getDate() + 6);
    const formatDateISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const defaultRangeStr = `${formatDateISO(defaultStart)} to ${formatDateISO(defaultEnd)}`;

    // Persistence: Check if we have a saved range for this page, otherwise default to current week
    const savedRange = window[dateRangeVarName] || defaultRangeStr;
    if (!window[dateRangeVarName]) {
      window[dateRangeVarName] = defaultRangeStr;
    }

    window['initFlatpickr_' + id] = () => {
      const hiddenEl = document.getElementById(id);
      const wrapper = document.getElementById(wrapperId);
      if (!hiddenEl || !wrapper) return null;
      if (hiddenEl._flatpickr) return hiddenEl._flatpickr;

      const label = document.getElementById(labelId);
      const prevBtn = document.getElementById(prevId);
      const nextBtn = document.getElementById(nextId);

      const fp = flatpickr(hiddenEl, {
        mode: 'range',
        defaultDate: savedRange ? savedRange.split(' to ').map(d => {
          const [y, m, day] = d.split('-').map(Number);
          return new Date(y, m - 1, day);
        }) : null,
        dateFormat: 'Y-m-d',
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
        static: false,
        position: position,
        monthSelectorType: 'dropdown',
        yearSelectorType: 'dropdown',
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

          instance.calendarContainer.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.custom-grid-overlay') && !e.target.closest('.flatpickr-month')) {
              const grid = instance.calendarContainer.querySelector('.custom-grid-overlay');
              if (grid) grid.style.display = 'none';
            }
          });

          updateDisplay(selectedDates);
        },
        onChange: function (selectedDates, dateStr, instance) {
          updateDisplay(selectedDates);
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
        }
      });

      function updateDisplay(selectedDates) {
        if (!label) return;
        if (selectedDates.length > 0) {
          const monthsTH = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
          ];
          const formatThaiDate = (d) => {
            if (!d) return '';
            const day = d.getDate();
            const month = monthsTH[d.getMonth()];
            const year = d.getFullYear() + 543;
            return `${day} ${month} ${year}`;
          };
          if (selectedDates.length === 2) {
            const start = selectedDates[0];
            const end = selectedDates[1];
            const startDay = start.getDate();
            const startMonth = monthsTH[start.getMonth()];
            const startYear = start.getFullYear() + 543;

            const endDay = end.getDate();
            const endMonth = monthsTH[end.getMonth()];
            const endYear = end.getFullYear() + 543;

            if (startYear === endYear) {
              if (start.getMonth() === end.getMonth()) {
                label.textContent = `${startDay} – ${endDay} ${startMonth} ${startYear}`;
              } else {
                label.textContent = `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
              }
            } else {
              label.textContent = `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
            }
          } else {
            label.textContent = formatThaiDate(selectedDates[0]);
          }
        } else {
          label.textContent = 'เลือกช่วงเวลา...';
        }
      }

      // Prev Button shift
      if (prevBtn) {
        prevBtn.onclick = (e) => {
          e.stopPropagation();
          const selected = fp.selectedDates;
          if (selected.length === 2) {
            const diff = Math.round((selected[1] - selected[0]) / (1000 * 60 * 60 * 24)) + 1;
            const newStart = new Date(selected[0]);
            newStart.setDate(newStart.getDate() - diff);
            const newEnd = new Date(selected[1]);
            newEnd.setDate(newEnd.getDate() - diff);
            fp.setDate([newStart, newEnd], true);
          } else {
            const newDate = selected[0] ? new Date(selected[0]) : new Date();
            newDate.setDate(newDate.getDate() - 7);
            fp.setDate([newDate], true);
          }
        };
      }

      // Next Button shift
      if (nextBtn) {
        nextBtn.onclick = (e) => {
          e.stopPropagation();
          const selected = fp.selectedDates;
          if (selected.length === 2) {
            const diff = Math.round((selected[1] - selected[0]) / (1000 * 60 * 60 * 24)) + 1;
            const newStart = new Date(selected[0]);
            newStart.setDate(newStart.getDate() + diff);
            const newEnd = new Date(selected[1]);
            newEnd.setDate(newEnd.getDate() + diff);
            fp.setDate([newStart, newEnd], true);
          } else {
            const newDate = selected[0] ? new Date(selected[0]) : new Date();
            newDate.setDate(newDate.getDate() + 7);
            fp.setDate([newDate], true);
          }
        };
      }

      // Clear function
      const clearBtn = document.getElementById(id + '_clear');
      if (clearBtn) {
        clearBtn.onclick = (e) => {
          e.stopPropagation();
          fp.clear();
          if (onClearFn) {
            try { eval(onClearFn); } catch (err) { }
          } else {
            try { eval(onchangeFn); } catch (err) { }
          }
        };
      }
      return fp;
    };

    setTimeout(() => {
      if (typeof window !== 'undefined' && window['initFlatpickr_' + id]) {
        window['initFlatpickr_' + id]();
      }
    }, 100);

    const iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#635bff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

    return `
    <div id="${wrapperId}" class="date-range-wrapper" style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
      <div style="display:flex; align-items:center; background:#fff; border:1px solid #e4e8ef; border-radius:9999px; overflow:hidden; height:34px; box-shadow:0 2px 8px rgba(0,0,0,0.04); transition:all 0.2s; flex-shrink:0;">
        <button id="${prevId}" style="padding:0 10px; border:none; background:transparent; cursor:pointer; color:#5a6282; display:flex; align-items:center; height:100%; border-right:1px solid #eef2f6; transition:background 0.15s" onmouseover="this.style.background='#f8f9fb'" onmouseout="this.style.background='transparent'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div onclick="const input = this.parentNode.querySelector('input'); if (input) { if (input._flatpickr) { input._flatpickr.open(); } else if (window['initFlatpickr_${id}']) { const fp = window['initFlatpickr_${id}'](); if (fp) fp.open(); } }" style="display:flex; align-items:center; gap:8px; padding:0 14px; font-size:0.8rem; font-weight:700; color:#24204D; cursor:pointer; user-select:none; height:100%; transition:background 0.15s" onmouseover="this.style.background='#f8f9fb'" onmouseout="this.style.background='transparent'">
          ${iconSvg}
          <span id="${labelId}">Select Date Range</span>
        </div>
        <button id="${nextId}" style="padding:0 10px; border:none; background:transparent; cursor:pointer; color:#5a6282; display:flex; align-items:center; height:100%; border-left:1px solid #eef2f6; transition:background 0.15s" onmouseover="this.style.background='#f8f9fb'" onmouseout="this.style.background='transparent'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <input id="${id}" type="text" style="position:absolute; width:0; height:0; opacity:0; pointer-events:none" readonly>
      </div>
      ${extraFilterHtml || ''}
      ${showClear ? `
      <button id="${id}_clear" class="btn btn-danger btn-sm" style="padding:6px 12px; font-size:.7rem; white-space:nowrap; border-radius:99px; background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2); display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-family:'Kanit'; height:34px;">
        <i data-lucide="rotate-ccw" style="width:13px; height:13px"></i>
        Clear All Filter
      </button>
      ` : ''}
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
    const isOpen = menu.style.display === 'flex';

    // Close all other menus
    document.querySelectorAll('[id^="actionMenu_"]').forEach(m => m.style.display = 'none');

    if (!isOpen) {
      menu.style.display = 'flex';
    }
  };

  // Close menus when clicking outside
  if (!window._actionMenuListenerAdded) {
    document.addEventListener('click', function () {
      document.querySelectorAll('[id^="actionMenu_"]').forEach(m => m.style.display = 'none');
    });
    window._actionMenuListenerAdded = true;
  }

  // --- AUTOMATIC CUSTOM DROPDOWN CONVERTER FOR ALL FILTERS ---
  function convertNativeSelectsToCustomDropdowns() {
    if (typeof document === 'undefined') return;
    const selects = document.querySelectorAll('select.select-input:not([data-custom-select]), select.form-input:not([data-custom-select])');
    selects.forEach(select => {
      // Skip if it's already marked as done or hidden
      select.setAttribute('data-custom-select', 'true');
      
      // Keep width and styling from original select
      const originalWidth = select.style.width || select.getAttribute('width') || '';
      const originalHeight = select.style.height || select.getAttribute('height') || '';
      const originalFlex = select.style.flex || '';
      
      // Hide original select
      select.style.display = 'none';

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';
      wrapper.style.cssText = `position: relative; z-index: 90;`;
      if (originalWidth) {
        wrapper.style.width = originalWidth;
      } else if (originalFlex) {
        wrapper.style.flex = originalFlex;
        wrapper.style.width = '0';
        wrapper.style.minWidth = '0';
      } else {
        wrapper.style.width = '100%';
      }
      if (originalHeight) wrapper.style.height = originalHeight;
      if (select.id) wrapper.id = 'custom_wrap_' + select.id;

      // Insert wrapper and place original select inside it
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);

      // Create trigger button replicating select-input class
      const trigger = document.createElement('button');
      trigger.className = 'select-input';
      trigger.style.cssText = `width: 100%; text-align: left; display: flex; align-items: center; justify-content: space-between; font-family: Kanit, sans-serif; font-size: 13px; cursor: pointer;`;
      if (originalHeight) {
        trigger.style.height = originalHeight;
        trigger.style.setProperty('height', originalHeight, 'important');
      }

      
      const triggerText = document.createElement('span');
      triggerText.style.cssText = `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`;
      triggerText.textContent = select.options[select.selectedIndex]?.text || '';
      trigger.appendChild(triggerText);
      
      wrapper.appendChild(trigger);

      // Create custom dropdown container
      const dropdown = document.createElement('div');
      dropdown.className = 'custom-select-dropdown';
      dropdown.style.cssText = `display: none; position: absolute; top: 100%; left: 0; margin-top: 6px; width: 100%; min-width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); z-index: 9999; padding: 4px; max-height: 250px; overflow-y: auto;`;

      // Helper function to update dropdown items based on select options
      const populateOptions = () => {
        dropdown.innerHTML = '';
        Array.from(select.options).forEach((opt, idx) => {
          const optionDiv = document.createElement('div');
          optionDiv.className = 'custom-select-option';
          
          // Check if this option is selected
          const isSelected = select.selectedIndex === idx;
          optionDiv.style.cssText = isSelected 
            ? `padding: 8px 12px !important; font-size: 12.5px !important; cursor: pointer !important; border-radius: 8px !important; color: #635bff !important; background-color: #f5f3ff !important; font-weight: 500 !important; font-family: 'Kanit', sans-serif !important;`
            : `padding: 8px 12px !important; font-size: 12.5px !important; cursor: pointer !important; border-radius: 8px !important; color: #4b5675 !important; background-color: transparent !important; font-weight: 500 !important; font-family: 'Kanit', sans-serif !important; transition: all 0.15s ease !important;`;
          
          optionDiv.textContent = opt.text;

          optionDiv.onclick = (e) => {
            e.stopPropagation();
            select.selectedIndex = idx;
            triggerText.textContent = opt.text;
            dropdown.style.display = 'none';
            wrapper.style.zIndex = '90'; // Reset z-index

            // Dispatch events to trigger any page-level changes
            select.dispatchEvent(new Event('change', { bubbles: true }));
            select.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Re-populate to update checked states
            populateOptions();
          };
          dropdown.appendChild(optionDiv);
        });
      };

      populateOptions();
      wrapper.appendChild(dropdown);

      // Toggle logic
      trigger.onclick = (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.display === 'block';
        
        // Close all other dropdowns and reset their z-indexes
        document.querySelectorAll('.custom-select-dropdown').forEach(d => {
          d.style.display = 'none';
          const p = d.closest('.custom-select-wrapper');
          if (p) p.style.zIndex = '90';
        });
        document.querySelectorAll('[id^="listFilter"]').forEach(l => l.style.display = 'none');

        if (!isOpen) {
          // Re-populate options in case options changed dynamically
          populateOptions();
          dropdown.style.display = 'block';
          wrapper.style.zIndex = '10000'; // Bring active wrapper to front
        } else {
          dropdown.style.display = 'none';
          wrapper.style.zIndex = '90';
        }
      };

      // Watch for changes in native select options (e.g. dynamic years or filter loading)
      const selectObserver = new MutationObserver(() => {
        triggerText.textContent = select.options[select.selectedIndex]?.text || '';
        populateOptions();
      });
      selectObserver.observe(select, { childList: true, attributes: true, characterData: true, subtree: true });
    });
  }

  // Hook global click listener to close dropdowns and reset z-indexes
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-dropdown').forEach(d => {
      d.style.display = 'none';
      const p = d.closest('.custom-select-wrapper');
      if (p) p.style.zIndex = '90';
    });
  });

  // Watch entire DOM to automatically convert any newly added select filters
  setTimeout(convertNativeSelectsToCustomDropdowns, 100);
  const globalObserver = new MutationObserver(() => {
    convertNativeSelectsToCustomDropdowns();
  });
  globalObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // --- GLOBAL CUSTOM CONFIRM MODAL DIALOG ---
  window.showConfirmModal = function({ title, message, confirmText, onConfirm, type = 'danger' }) {
    const modalId = 'confirmModal';
    if (document.getElementById(modalId)) document.getElementById(modalId).remove();

    const color = type === 'danger' ? '#ef4444' : '#6366f1';
    const bgLight = type === 'danger' ? '#fef2f2' : '#f5f3ff';
    const icon = type === 'danger' ? 'trash-2' : 'help-circle';

    const html = `
    <div id="${modalId}" class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.4); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:99999; animation: fadeIn 0.3s ease">
      <div class="modal-card" style="background:#fff; width:420px; border-radius:24px; padding:40px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.15); border:1px solid rgba(255,255,255,0.2); transform:scale(1); animation: modalBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)">
        <div style="width:72px; height:72px; border-radius:22px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; transform: rotate(-5deg)">
          <i data-lucide="${icon}" style="width:36px; height:36px"></i>
        </div>
        <h3 style="margin:0 0 12px; font-size:1.3rem; font-weight:700; color:#1e293b; font-family:Kanit">${title}</h3>
        <p style="margin:0 0 32px; font-size:.9rem; color:#64748b; line-height:1.6; font-family:Kanit; padding:0 10px">${message}</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
          <button onclick="document.getElementById('${modalId}').remove()" class="btn btn-outline" style="background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; padding:14px; border-radius:9999px !important; font-weight:600; font-family:Kanit; cursor:pointer; font-size:.9rem; transition:all 0.2s" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">Cancel</button>
          <button id="confirmModalBtn" class="btn btn-primary" style="background:${color}; color:#fff; border:none; padding:14px; border-radius:9999px !important; font-weight:700; font-family:Kanit; cursor:pointer; font-size:.9rem; box-shadow: 0 8px 20px ${color}30; transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 25px ${color}40'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px ${color}30'">${confirmText}</button>
        </div>
      </div>
    </div>
    <style>
      @keyframes modalBounce {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
    `;

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
  };
  // --- GLOBAL CUSTOM ALERT MODAL DIALOG ---
  window.showAlert = function(title, message, type = 'warning') {
    const modalId = 'alertModal';
    if (document.getElementById(modalId)) document.getElementById(modalId).remove();

    const color = type === 'danger' ? '#ef4444' : (type === 'success' ? '#10b981' : '#f59e0b');
    const bgLight = color + '10';
    const icon = type === 'danger' ? 'alert-circle' : (type === 'success' ? 'check-circle' : 'alert-triangle');

    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.4); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:99999; animation: fadeIn 0.3s ease">
      <div class="modal-card" style="background:#fff; width:380px; border-radius:24px; padding:32px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.15); border:1px solid rgba(255,255,255,0.2); transform:scale(1); animation: modalBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)">
        <div style="width:64px; height:64px; border-radius:20px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; margin:0 auto 20px">
          <i data-lucide="${icon}" style="width:32px; height:32px"></i>
        </div>
        <h3 style="margin:0 0 10px; font-size:1.15rem; font-weight:700; color:#1e293b; font-family:Kanit">${title}</h3>
        <p style="margin:0 0 24px; font-size:.85rem; color:#64748b; line-height:1.5; font-family:Kanit">${message}</p>
        <button onclick="document.getElementById('${modalId}').remove()" class="btn btn-primary" style="width:100%; background:${color}; color:#fff; border:none; padding:12px; border-radius:9999px !important; font-weight:700; font-family:Kanit; cursor:pointer; font-size:.9rem; box-shadow: 0 4px 12px ${color}30; transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">ตกลง</button>
      </div>
    </div>
    <style>
      @keyframes modalBounce {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });
  };

  window.toggleEmployeeFilterDropdown = function(type, event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('listFilter' + type);
    if (!dropdown) return;
    const isOpen = dropdown.style.display === 'block';

    // Close all other dropdowns
    document.querySelectorAll('[id^="listFilter"]').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.custom-select-dropdown').forEach(d => {
      d.style.display = 'none';
      const p = d.closest('.custom-select-wrapper');
      if (p) p.style.zIndex = '90';
    });

    if (!isOpen) {
      dropdown.style.display = 'block';
    }
  };

  window.selectEmployeeFilter = function(type, value, text) {
    const input = document.getElementById('filter' + type);
    const label = document.getElementById('labelFilter' + type);
    if (input) input.value = value;
    if (label) label.textContent = text;
    
    const dropdown = document.getElementById('listFilter' + type);
    if (dropdown) dropdown.style.display = 'none';
    
    // Trigger the filter logic
    if (typeof window.applyEmployeeFilters === 'function') {
      window.applyEmployeeFilters();
    }
  };

  // Close filter dropdowns when clicking outside
  document.addEventListener('click', function() {
    document.querySelectorAll('[id^="listFilter"]').forEach(el => el.style.display = 'none');
  });





