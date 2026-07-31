import flatpickr from 'flatpickr';
if (typeof window !== 'undefined') {
  window.flatpickr = flatpickr;
}

  if (typeof window !== 'undefined' && window.logLoad) window.logLoad("pages.js: Loading...");
  // ===== PAGE RENDERERS =====

  window.fmt = function(n) { return Number(n).toLocaleString('en-US'); }

  window.colorForProject = function (project) {
    const proj = (project || 'General').trim();
    const presetColors = {
      'DIB-Solar Farm': '#0284c7',      // Sky
      'DIB-Warehouse': '#7c3aed',       // Violet
      'Project Efficiency': '#ea580c',  // Orange
      'Sale Pipeline': '#2563eb',       // Blue
      'DIB-Data Center': '#d97706',     // Amber
      'Internal': '#059669',            // Emerald
      'Admin': '#475569',               // Slate
      'Management': '#db2777',          // Pink
      'DIB-Solar Rooftop': '#16a34a',   // Green
      'DIB-Other': '#4f46e5',           // Indigo
      'Finance': '#e11d48',             // Rose
      'บ.ในเครือ': '#0891b2',            // Cyan
      'AFNC': '#8b5cf6',                // Purple
      'ETDA': '#06b6d4',                // Light Cyan
      'CALL CENTER': '#f43f5e',         // Rose-Red
      'Media I Graphic': '#84cc16',     // Lime
      'Media I Content': '#c026d3',     // Fuchsia
      'TCP': '#3b82f6',                 // Light Blue
      'GC': '#0f766e',                  // Teal
      'AI': '#eab308',                  // Yellow
      'MOC': '#b45309',                 // Brown/Amber
      'ตรวจจับ': '#be123c'               // Crimson
    };
    if (presetColors[proj]) return presetColors[proj];
    
    const clean = proj.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes('call') && (clean.includes('center') || clean.includes('cetnter') || clean.includes('cntr') || clean.includes('cen'))) {
      return presetColors['CALL CENTER'];
    }
    if (clean === 'aoc') {
      return '#8b5cf6'; // AOC / AFNC color
    }

    const lowerProj = proj.toLowerCase();
    for (const key in presetColors) {
      if (key.toLowerCase() === lowerProj) {
        return presetColors[key];
      }
    }

    const palette = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#3b82f6', '#06b6d4', '#14b8a6', '#10b981',
      '#22c55e', '#eab308', '#f97316', '#ef4444', '#64748b', '#a855f7', '#0284c7', '#b45309'
    ];
    let hash = 0;
    for (let i = 0; i < proj.length; i++) {
      hash = proj.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palette.length;
    return palette[index];
  };

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
    const color = type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1';
    
    // Choose inline SVG based on status
    const svgIcon = type === 'danger'
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : type === 'warning'
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 999999;
      background: white; padding: 10px 16px; border-radius: 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.10); border-left: 3px solid ${color};
      display: flex; align-items: center; gap: 8px; font-family: 'Kanit', sans-serif;
      font-size: 0.78rem; font-weight: 600; color: #1e293b; max-width: 320px;
      transform: translateX(120%); transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    toast.innerHTML = `${svgIcon} ${msg}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.style.transform = 'translateX(0)');

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 350);
    }, 3000);
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
    const isScope = dateRangeVarName === '_scopeDateRange';
    const savedRange = window[dateRangeVarName] || (isScope ? '' : defaultRangeStr);
    if (!window[dateRangeVarName] && !isScope) {
      window[dateRangeVarName] = defaultRangeStr;
    }

    function toggleClearButtonVisibility(selectedDates, dateStr, instance) {
      const clearBtn = document.getElementById(id + '_clear');
      if (!clearBtn) return;
      const filterWrapper = document.getElementById(wrapperId);
      if (!filterWrapper) return;
      const searchInput = filterWrapper.querySelector('input[type="text"]:not([readonly])');
      const hasSearch = searchInput && searchInput.value !== '';
      
      let hasSelectFilter = false;
      const parent = filterWrapper.parentNode;
      if (parent) {
        const siblingSelects = parent.querySelectorAll('select');
        hasSelectFilter = Array.from(siblingSelects).some(s => s.value && s.value !== 'all' && s.value !== '');
      }

      const isDefault = !dateStr || dateStr === defaultRangeStr;
      clearBtn.style.display = (hasSearch || hasSelectFilter || (selectedDates && selectedDates.length > 0 && !isDefault)) ? 'flex' : 'none';
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
          toggleClearButtonVisibility(selectedDates, dateStr, instance);
        },
        onChange: function (selectedDates, dateStr, instance) {
          updateDisplay(selectedDates);
          const rangeVal = selectedDates[0] ? (instance.formatDate(selectedDates[0], 'Y-m-d') + (selectedDates[1] ? ' to ' + instance.formatDate(selectedDates[1], 'Y-m-d') : '')) : '';
          hiddenEl.value = rangeVal;
          window[dateRangeVarName] = rangeVal;

          toggleClearButtonVisibility(selectedDates, dateStr, instance);

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
          clearBtn.style.display = 'none';
          
          // Clear any search inputs
          const searchInput = wrapper.querySelector('input[type="text"]:not([readonly])');
          if (searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.dispatchEvent(new Event('keyup'));
          }

          // Reset sibling select filters
          const parent = wrapper.parentNode;
          if (parent) {
            const siblingSelects = parent.querySelectorAll('select');
            siblingSelects.forEach(sel => {
              sel.value = sel.options[0].value;
              sel.dispatchEvent(new Event('change'));
            });
          }

          if (onClearFn) {
            try { eval(onClearFn); } catch (err) { }
          } else {
            try { eval(onchangeFn); } catch (err) { }
          }
        };
      }
      // Listen to sibling filters and search inputs
      setTimeout(() => {
        const parent = wrapper.parentNode;
        if (parent) {
          const siblingSelects = parent.querySelectorAll('select');
          siblingSelects.forEach(sel => {
            sel.addEventListener('change', () => {
              toggleClearButtonVisibility(fp.selectedDates, hiddenEl.value, fp);
            });
          });
          const searchInput = wrapper.querySelector('input[type="text"]:not([readonly])');
          if (searchInput) {
            const handler = () => {
              toggleClearButtonVisibility(fp.selectedDates, hiddenEl.value, fp);
            };
            searchInput.addEventListener('input', handler);
            searchInput.addEventListener('keyup', handler);
          }
        }
      }, 300);

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
      <button id="${id}_clear" style="display: none; background: none; border: none; color: #ef4444; font-family: Kanit; font-size: 0.75rem; font-weight: 700; cursor: pointer; align-items: center; gap: 4px; padding: 0 12px; height: 34px; white-space: nowrap;">
        <span style="font-weight:bold;font-size:13px">✕</span> Clear
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
      const targetName = (emp.name && emp.name !== '-') ? emp.name : ((emp.nameEn && emp.nameEn !== '-') ? emp.nameEn : emp.nickname);
      return targetName.trim();
    }
    
    if (empOrName && typeof empOrName === 'string') {
      return empOrName.trim();
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
            ? `padding: 10px 14px !important; font-size: 13px !important; cursor: pointer !important; border-radius: 8px !important; color: #4f46e5 !important; background-color: #f0efff !important; font-weight: 600 !important; font-family: 'Kanit', sans-serif !important; line-height: 1.4 !important; white-space: nowrap !important;`
            : `padding: 10px 14px !important; font-size: 13px !important; cursor: pointer !important; border-radius: 8px !important; color: #374151 !important; background-color: transparent !important; font-weight: 500 !important; font-family: 'Kanit', sans-serif !important; line-height: 1.4 !important; white-space: nowrap !important; transition: background-color 0.12s ease !important;`;
          
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
          <button onclick="document.getElementById('${modalId}').remove()" class="btn btn-outline" style="display:flex !important; align-items:center !important; justify-content:center !important; text-align:center !important; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; padding:14px; border-radius:9999px !important; font-weight:600; font-family:Kanit; cursor:pointer; font-size:.9rem; transition:all 0.2s" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">Cancel</button>
          <button id="confirmModalBtn" class="btn btn-primary" style="display:flex !important; align-items:center !important; justify-content:center !important; text-align:center !important; background:${color}; color:#fff; border:none; padding:14px; border-radius:9999px !important; font-weight:700; font-family:Kanit; cursor:pointer; font-size:.9rem; box-shadow: 0 8px 20px ${color}30">${confirmText}</button>
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
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.4); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:160000; animation: fadeIn 0.3s ease">
      <div class="modal-card" style="background:#fff; width:380px; border-radius:24px; padding:32px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.15); border:1px solid rgba(255,255,255,0.2); transform:scale(1); animation: modalBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)">
        <div style="width:64px; height:64px; border-radius:20px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; margin:0 auto 20px">
          <i data-lucide="${icon}" style="width:32px; height:32px"></i>
        </div>
        <h3 style="margin:0 0 10px; font-size:1.15rem; font-weight:700; color:#1e293b; font-family:Kanit">${title}</h3>
        <p style="margin:0 0 24px; font-size:.85rem; color:#64748b; line-height:1.5; font-family:Kanit">${message}</p>
        <button onclick="document.getElementById('${modalId}').remove()" class="btn btn-primary" style="display:inline-flex !important; align-items:center !important; justify-content:center !important; text-align:center !important; width:100%; background:${color}; color:#fff; border:none; height:34px; border-radius:99px !important; font-weight:600; font-family:Kanit; cursor:pointer; font-size:.78rem; box-shadow: 0 2px 8px ${color}20">ตกลง</button>
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
  
  window.filterTable = function(tableId, inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const filter = input.value.toLowerCase().trim();
    const table = document.getElementById(tableId);
    if (!table) return;

    if (tableId === 'holidayTable') {
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      const groups = {};
      rows.forEach(row => {
        const match = row.className.match(/holiday-group-(\d+)/);
        if (match) {
          const groupIdx = match[1];
          if (!groups[groupIdx]) groups[groupIdx] = [];
          groups[groupIdx].push(row);
        }
      });

      Object.values(groups).forEach(groupRows => {
        const matches = groupRows.some(row => row.textContent.toLowerCase().includes(filter));
        groupRows.forEach(row => {
          row.style.display = matches ? '' : 'none';
        });
      });
      return;
    }

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      if (row.textContent.toLowerCase().includes(filter)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  };

  window.apiSaveHolidayShift = async function(payload) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const { action, id, date, holidayName, status, section, person, time, assignments } = payload;

    try {
      if (action === 'delete') {
        await fetch(`${supabaseUrl}/rest/v1/holiday_shifts?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
          }
        });
      } else if (action === 'add') {
        await fetch(`${supabaseUrl}/rest/v1/holiday_shifts`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify({
            id,
            date,
            holiday_name: holidayName,
            status,
            section,
            person,
            time_shift: time,
            assignments
          })
        });
      } else if (action === 'edit') {
        await fetch(`${supabaseUrl}/rest/v1/holiday_shifts?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date,
            holiday_name: holidayName,
            status,
            section,
            person,
            time_shift: time,
            assignments
          })
        });
      }
    } catch (err) {
      console.error('Error in apiSaveHolidayShift:', err);
    }
  };

  window.openManageTemplatesModal = function() {
    const modalId = 'manageTemplatesModal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modalHtml = `
      <div id="${modalId}" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15, 23, 42, 0.4); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:99999; animation: fadeIn 0.2s ease-out; font-family:Prompt, sans-serif;">
        <div style="background:#fff; width:650px; max-height:85vh; display:flex; flex-direction:column; border-radius:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.15); overflow:hidden;">
          <div style="padding:24px 32px 16px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 style="margin:0; font-size:1.2rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#635bff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                จัดการชุดงานมาตรฐาน (Templates)
              </h3>
              <p style="margin:4px 0 0 0; font-size:.78rem; color:#64748b">จัดการรายการเทมเพลตงานสำหรับวันหยุดนักขัตฤกษ์</p>
            </div>
            <button onclick="document.getElementById('${modalId}').remove()" style="background:none; border:none; cursor:pointer; color:#8f97b0; padding:4px; font-size:1.2rem;">✕</button>
          </div>
          
          <div id="templatesModalBody" style="flex:1; overflow-y:auto; padding:24px 32px;">
            <!-- Content populated by renderTemplatesList() -->
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    window.renderTemplatesList();
  };

  window.renderTemplatesList = function() {
    const body = document.getElementById('templatesModalBody');
    if (!body) return;

    const templates = window.HOLIDAY_TEMPLATES || [];
    
    let listHtml = `
      <div style="display:flex; justify-content:flex-end; margin-bottom:16px;">
        <button onclick="window.renderTemplateForm()" style="background:#635bff; color:#fff; border:none; padding:8px 16px; border-radius:10px; font-size:.8rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(99,91,255,0.3);">
          + เพิ่มเทมเพลตใหม่
        </button>
      </div>
    `;

    if (templates.length === 0) {
      listHtml += `
        <div style="padding:48px; text-align:center; color:#94a3b8; font-size:.85rem; font-style:italic; border:1px dashed #cbd5e1; border-radius:16px; background:#f8fafc;">
          ไม่มีข้อมูลเทมเพลตมาตรฐาน
        </div>
      `;
    } else {
      listHtml += `<div style="display:flex; flex-direction:column; gap:12px;">`;
      templates.forEach((tpl, idx) => {
        const assignmentsStr = (tpl.assignments || []).map(a => `${a.project} - ${a.job} (${a.percent}%)`).join(', ') || '-';
        listHtml += `
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.02);">
            <div style="min-width:0; flex:1; padding-right:16px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-weight:700; font-size:0.9rem; color:#1e293b;">${tpl.section || '-'}</span>
                <span style="background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:99px; font-size:0.65rem; font-weight:700;">
                  ${tpl.time || '-'}
                </span>
              </div>
              <div style="font-size:0.75rem; color:#64748b; margin-top:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${assignmentsStr}">
                งาน: ${assignmentsStr}
              </div>
            </div>
            <div style="display:flex; gap:8px; flex-shrink:0;">
              <button onclick="window.renderTemplateForm('${tpl.id}')" style="background:#e0e7ff; color:#4f46e5; border:none; padding:6px 12px; border-radius:8px; font-size:0.75rem; font-weight:700; cursor:pointer;">
                แก้ไข
              </button>
              <button onclick="window.deleteTemplate('${tpl.id}')" style="background:#fee2e2; color:#ef4444; border:none; padding:6px 12px; border-radius:8px; font-size:0.75rem; font-weight:700; cursor:pointer;">
                ลบ
              </button>
            </div>
          </div>
        `;
      });
      listHtml += `</div>`;
    }

    body.innerHTML = listHtml;
  };

  window.renderTemplateForm = function(templateId = '') {
    const body = document.getElementById('templatesModalBody');
    if (!body) return;

    const isEdit = !!templateId;
    const tpl = isEdit ? (window.HOLIDAY_TEMPLATES || []).find(t => t.id === templateId) : null;

    const scopeTasks = typeof window.getTasksFromScope === 'function' ? window.getTasksFromScope() : [];
    const uniqueProjects = [...new Set(scopeTasks.map(t => t.acc))].sort();

    let projectRowsHtml = '';
    if (tpl && tpl.assignments && tpl.assignments.length > 0) {
      projectRowsHtml = tpl.assignments.map((a, idx) => `
        <div class="tpl-project-row" style="display:grid; grid-template-columns:1fr 1fr 80px auto; gap:12px; margin-bottom:12px; align-items:center;">
          <select class="tplProject" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:.8rem; outline:none; background:#fff">
            <option value="">-- เลือกโครงการ --</option>
            ${uniqueProjects.map(proj => `<option value="${proj}" ${proj === a.project ? 'selected' : ''}>${proj}</option>`).join('')}
          </select>
          <input type="text" class="tplJob" placeholder="ชื่องาน" value="${a.job || ''}" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:.8rem; outline:none">
          <div style="position:relative;">
            <input type="number" class="tplPercent" value="${a.percent || 100}" min="0" max="100" style="width:100%; padding:10px 24px 10px 10px; border:1px solid #cbd5e1; border-radius:10px; font-size:.8rem; outline:none; text-align:center;" oninput="window.calcTemplateTotalPercent()">
            <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:.8rem; color:#64748b;">%</span>
          </div>
          <button type="button" onclick="if(document.querySelectorAll('.tpl-project-row').length > 1) { this.parentElement.remove(); window.calcTemplateTotalPercent(); }" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; padding:8px;">
            ✕
          </button>
        </div>
      `).join('');
    } else {
      projectRowsHtml = `
        <div class="tpl-project-row" style="display:grid; grid-template-columns:1fr 1fr 80px auto; gap:12px; margin-bottom:12px; align-items:center;">
          <select class="tplProject" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:.8rem; outline:none; background:#fff">
            <option value="">-- เลือกโครงการ --</option>
            ${uniqueProjects.map(proj => `<option value="${proj}">${proj}</option>`).join('')}
          </select>
          <input type="text" class="tplJob" placeholder="ชื่องาน" value="" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:.8rem; outline:none">
          <div style="position:relative;">
            <input type="number" class="tplPercent" value="100" min="0" max="100" style="width:100%; padding:10px 24px 10px 10px; border:1px solid #cbd5e1; border-radius:10px; font-size:.8rem; outline:none; text-align:center;" oninput="window.calcTemplateTotalPercent()">
            <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:.8rem; color:#64748b;">%</span>
          </div>
          <button type="button" onclick="if(document.querySelectorAll('.tpl-project-row').length > 1) { this.parentElement.remove(); window.calcTemplateTotalPercent(); }" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; padding:8px; display:none;">
            ✕
          </button>
        </div>
      `;
    }

    body.innerHTML = `
      <form id="tplForm" onsubmit="event.preventDefault(); window.submitTemplateForm('${templateId}');" style="display:flex; flex-direction:column; gap:16px">
        <div>
          <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">แผนก (Section)</label>
          <select id="tplSection" required style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:.8rem; outline:none; background:#fff">
            <option value="" disabled selected>-- เลือก Section --</option>
            <option value="Operation" ${tpl && tpl.section === 'Operation' ? 'selected' : ''}>Operation</option>
            <option value="Content & Graphics" ${tpl && tpl.section === 'Content & Graphics' ? 'selected' : ''}>Content & Graphics</option>
            <option value="Call Center" ${tpl && tpl.section === 'Call Center' ? 'selected' : ''}>Call Center</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">กะเวลาปฏิบัติงาน</label>
          <select id="tplTime" required style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:.8rem; outline:none; background:#fff">
            <option value="" disabled selected>-- เลือกกะเวลา --</option>
            <option value="เช้าตรู่ 06.00-15.00 น." ${tpl && tpl.time === 'เช้าตรู่ 06.00-15.00 น.' ? 'selected' : ''}>เช้าตรู่ 06.00-15.00 น.</option>
            <option value="เช้า 09.00-18.00 น." ${tpl && tpl.time === 'เช้า 09.00-18.00 น.' ? 'selected' : ''}>เช้า 09.00-18.00 น.</option>
            <option value="สาย 12.00-21.00 น." ${tpl && tpl.time === 'สาย 12.00-21.00 น.' ? 'selected' : ''}>สาย 12.00-21.00 น.</option>
            <option value="บ่าย 15.00-00.00 น." ${tpl && tpl.time === 'บ่าย 15.00-00.00 น.' ? 'selected' : ''}>บ่าย 15.00-00.00 น.</option>
            <option value="ดึก 00.00-09.00 น." ${tpl && tpl.time === 'ดึก 00.00-09.00 น.' ? 'selected' : ''}>ดึก 00.00-09.00 น.</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">โครงการและงาน (Project & Job)</label>
          <div id="tplProjectContainer">
            ${projectRowsHtml}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <button type="button" onclick="window.addTemplateProjectRow()" style="background:none; border:none; color:#635bff; font-size:.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px; padding:0;">
              + เพิ่มงานในกะนี้
            </button>
            <div id="tplTotalPercent" style="font-size:.8rem; font-weight:700; color:#10b981;">รวม: 100%</div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
          <button type="button" onclick="window.renderTemplatesList()" style="background:#f1f5f9; color:#475569; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:500; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">
            ย้อนกลับ
          </button>
          <button type="submit" id="btnSubmitTpl" style="background:#635bff; color:#fff; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:600; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">
            บันทึก
          </button>
        </div>
      </form>
    `;
    window.calcTemplateTotalPercent();
  };

  window.addTemplateProjectRow = function() {
    const container = document.getElementById('tplProjectContainer');
    if (!container) return;

    const scopeTasks = typeof window.getTasksFromScope === 'function' ? window.getTasksFromScope() : [];
    const uniqueProjects = [...new Set(scopeTasks.map(t => t.acc))].sort();

    const row = document.createElement('div');
    row.className = 'tpl-project-row';
    row.style.cssText = 'display:grid; grid-template-columns:1fr 1fr 80px auto; gap:12px; margin-bottom:12px; align-items:center;';
    row.innerHTML = `
      <select class="tplProject" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:.8rem; outline:none; background:#fff">
        <option value="">-- เลือกโครงการ --</option>
        ${uniqueProjects.map(proj => `<option value="${proj}">${proj}</option>`).join('')}
      </select>
      <input type="text" class="tplJob" placeholder="ชื่องาน" value="" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:.8rem; outline:none">
      <div style="position:relative;">
        <input type="number" class="tplPercent" value="100" min="0" max="100" style="width:100%; padding:10px 24px 10px 10px; border:1px solid #cbd5e1; border-radius:10px; font-size:.8rem; outline:none; text-align:center;" oninput="window.calcTemplateTotalPercent()">
        <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:.8rem; color:#64748b;">%</span>
      </div>
      <button type="button" onclick="this.parentElement.remove(); window.calcTemplateTotalPercent();" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; padding:8px;">
        ✕
      </button>
    `;
    container.appendChild(row);
    window.calcTemplateTotalPercent();
  };

  window.calcTemplateTotalPercent = function() {
    const percents = document.querySelectorAll('.tplPercent');
    let total = 0;
    percents.forEach(input => {
      total += parseInt(input.value) || 0;
    });
    const label = document.getElementById('tplTotalPercent');
    if (label) {
      label.textContent = `รวม: ${total}%`;
      if (total === 100) {
        label.style.color = '#10b981';
      } else {
        label.style.color = '#ef4444';
      }
    }
  };

  window.submitTemplateForm = async function(templateId = '') {
    const isEdit = !!templateId;
    const section = document.getElementById('tplSection').value;
    const time = document.getElementById('tplTime').value;

    const rows = document.querySelectorAll('.tpl-project-row');
    const assignments = [];
    let totalPercent = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const project = row.querySelector('.tplProject').value;
      const job = row.querySelector('.tplJob').value;
      const percent = parseInt(row.querySelector('.tplPercent').value) || 0;

      if (!project) {
        window.showAlert('เกิดข้อผิดพลาด', 'กรุณาเลือกโครงการ', 'danger');
        return;
      }
      assignments.push({ project, job: job || '-', percent });
      totalPercent += percent;
    }

    if (totalPercent !== 100) {
      window.showAlert('เกิดข้อผิดพลาด', `สัดส่วนงานรวมต้องเท่ากับ 100% (ปัจจุบัน ${totalPercent}%)`, 'danger');
      return;
    }

    const btnSubmit = document.getElementById('btnSubmitTpl');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'กำลังบันทึก...';

    const id = isEdit ? templateId : 'tpl_' + Date.now();
    const payload = {
      action: isEdit ? 'edit' : 'add',
      id,
      date: 'TEMPLATE',
      holidayName: 'TEMPLATE',
      status: 'upcoming',
      section,
      person: '',
      time,
      assignments: JSON.stringify(assignments)
    };

    await window.apiSaveHolidayShift(payload);

    if (!window.HOLIDAY_TEMPLATES) window.HOLIDAY_TEMPLATES = [];
    const tplIndex = window.HOLIDAY_TEMPLATES.findIndex(t => t.id === id);

    const updatedTemplate = { id, section, time, assignments };
    if (tplIndex !== -1) {
      window.HOLIDAY_TEMPLATES[tplIndex] = updatedTemplate;
    } else {
      window.HOLIDAY_TEMPLATES.push(updatedTemplate);
    }

    localStorage.setItem('holiday_templates', JSON.stringify(window.HOLIDAY_TEMPLATES));

    window.showAlert('สำเร็จ', 'บันทึกชุดงานมาตรฐานสำเร็จ', 'success');
    window.renderTemplatesList();
  };

  window.deleteTemplate = function(templateId) {
    window.showConfirmDelete('ยืนยันการลบเทมเพลต', 'คุณต้องการลบชุดงานมาตรฐานนี้ใช่หรือไม่? การลบนี้จะลบงานจริงทั้งหมดในตารางที่ใช้ชุดงานนี้ออกด้วย', async () => {
      const tpl = (window.HOLIDAY_TEMPLATES || []).find(t => t.id === templateId);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // 1. Delete the template itself
      await window.apiSaveHolidayShift({
        action: 'delete',
        id: templateId
      });

      // 2. Delete all real holiday shifts matching the template's section and time
      if (tpl && tpl.section && tpl.time) {
        try {
          await fetch(`${supabaseUrl}/rest/v1/holiday_shifts?section=eq.${encodeURIComponent(tpl.section)}&time_shift=eq.${encodeURIComponent(tpl.time)}`, {
            method: 'DELETE',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`
            }
          });
        } catch (e) {
          console.error('Error deleting applied holiday shifts:', e);
        }
      }

      if (window.HOLIDAY_TEMPLATES) {
        window.HOLIDAY_TEMPLATES = window.HOLIDAY_TEMPLATES.filter(t => t.id !== templateId);
        localStorage.setItem('holiday_templates', JSON.stringify(window.HOLIDAY_TEMPLATES));
      }

      // 3. Clear cache and pull fresh data
      window.HOLIDAY_LIST = null;
      window.HOLIDAY_TEMPLATES = null;
      
      import("./legacyDataFetcher.js").then(mod => {
        if (mod?.fetchAndSetLegacyData) {
          mod.fetchAndSetLegacyData().then(() => {
            window.showAlert('สำเร็จ', 'ลบชุดงานมาตรฐานและลบงานในตารางเรียบร้อยแล้ว', 'success');
            window.renderTemplatesList();
            if (typeof window.navigate === 'function') {
              window.navigate('public-holiday');
            }
          });
        } else {
          window.showAlert('สำเร็จ', 'ลบชุดงานมาตรฐานเรียบร้อยแล้ว', 'success');
          window.renderTemplatesList();
        }
      }).catch(() => {
        window.showAlert('สำเร็จ', 'ลบชุดงานมาตรฐานเรียบร้อยแล้ว', 'success');
        window.renderTemplatesList();
      });
    });
  };






