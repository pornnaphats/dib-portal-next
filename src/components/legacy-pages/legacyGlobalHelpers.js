import flatpickr from 'flatpickr';
if (typeof window !== 'undefined') {
  window.flatpickr = flatpickr;
}

  if (typeof window !== 'undefined' && window.logLoad) window.logLoad("pages.js: Loading...");

  // ===== INLINE CUSTOM SELECT RENDERER (available immediately) =====
  // Renders a pill-style custom dropdown directly in HTML templates.
  // Usage: ${window.renderCustomSelect({id, value, options:[{value,label}], onChange})}
  window.renderCustomSelect = function(opts) {
    var id = opts.id || ('csd_' + Math.random().toString(36).slice(2));
    var value = String(opts.value != null ? opts.value : '');
    var options = opts.options || [];
    var onChange = opts.onChange || '';
    var placeholder = opts.placeholder || 'เลือก...';
    var width = opts.width || '100%';
    var height = opts.height || '34px';

    var selectedOption = null;
    for (var i = 0; i < options.length; i++) {
      if (String(options[i].value) === value) { selectedOption = options[i]; break; }
    }
    if (!selectedOption) selectedOption = options[0] || { label: placeholder, value: '' };

    var optionsHtml = options.map(function(o) {
      var isSelected = String(o.value) === value;
      var bg = isSelected ? '#f0efff' : 'transparent';
      var color = isSelected ? '#4f46e5' : '#374151';
      var fw = isSelected ? '600' : '500';
      var safeLabel = String(o.label).replace(/\\/g, '\\\\').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      var safeValue = String(o.value).replace(/"/g, '&quot;');
      return '<div class="csd-option" data-value="' + safeValue + '" data-label="' + safeLabel + '" onclick="(function(el){var wrap=el.closest(\'.csd-wrapper\');var hidden=wrap.querySelector(\'input[type=hidden]\');if(hidden){hidden.value=el.dataset.value;hidden.dispatchEvent(new Event(\'change\',{bubbles:true}));}wrap.querySelector(\'.csd-label\').textContent=el.dataset.label;wrap.querySelector(\'.csd-menu\').style.display=\'none\';wrap.style.zIndex=\'90\';' + onChange + ';})(this)" style="padding:10px 14px;font-size:12px;cursor:pointer;border-radius:8px;font-family:\'Kanit\',\'Prompt\',sans-serif;line-height:1.4;white-space:nowrap;background:' + bg + ';color:' + color + ';font-weight:' + fw + ';transition:background 0.12s;" onmouseover="if(this.style.backgroundColor!==\'rgb(240, 239, 255)\')this.style.background=\'#f8fafc\'" onmouseout="if(this.style.backgroundColor===\'rgb(248, 250, 252)\')this.style.background=\'transparent\'">' + o.label + '</div>';
    }).join('');

    return '<div class="csd-wrapper" id="csd_wrap_' + id + '" style="position:relative;width:' + width + ';z-index:90;display:inline-block;">' +
      '<input type="hidden" id="' + id + '" value="' + value + '">' +
      '<button type="button" class="csd-trigger" onclick="(function(btn){var wrap=btn.closest(\'.csd-wrapper\');var menu=wrap.querySelector(\'.csd-menu\');document.querySelectorAll(\'.csd-menu\').forEach(function(m){if(m!==menu){m.style.display=\'none\';m.closest(\'.csd-wrapper\').style.zIndex=\'90\';}});if(menu.style.display===\'block\'){menu.style.display=\'none\';wrap.style.zIndex=\'90\';}else{menu.style.display=\'block\';wrap.style.zIndex=\'10000\';}})(this)" style="width:100%;height:' + height + ';display:flex;align-items:center;justify-content:space-between;padding:0 14px 0 16px;border:1px solid #e2e8f0;border-radius:9999px;background:#fff;cursor:pointer;font-family:\'Kanit\',\'Prompt\',sans-serif;font-size:12px;font-weight:500;color:#24204D;box-shadow:0 1px 2px rgba(15,23,42,0.04);transition:border-color 0.2s;box-sizing:border-box;outline:none;" onmouseover="this.style.borderColor=\'#cbd5e1\'" onmouseout="this.style.borderColor=\'#e2e8f0\'">' +
        '<span class="csd-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;text-align:left;">' + selectedOption.label + '</span>' +
        '<svg width="12" height="12" fill="none" stroke="#94a3b8" stroke-width="2.5" viewBox="0 0 24 24" style="flex-shrink:0;margin-left:6px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>' +
      '</button>' +
      '<div class="csd-menu" style="display:none;position:absolute;top:calc(100% + 6px);left:0;min-width:100%;width:max-content;max-width:260px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.08);z-index:9999;padding:4px;max-height:240px;overflow-y:auto;">' + optionsHtml + '</div>' +
    '</div>';
  };

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
  window.dayNamesFull = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
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
      <div style="display:flex; align-items:center; background:#fff; border:1px solid #e2e8f0; border-radius:9999px; overflow:hidden; height:34px; max-height:34px; box-shadow:0 1px 2px rgba(15,23,42,0.04); transition:all 0.2s; flex-shrink:0; box-sizing:border-box;">
        <button id="${prevId}" style="padding:0 8px; border:none; background:transparent; cursor:pointer; color:#94a3b8; display:flex; align-items:center; justify-content:center; height:34px; max-height:34px; border-right:1px solid #e2e8f0; transition:background 0.15s; flex-shrink:0; box-sizing:border-box;" onmouseover="this.style.background='#f8f9fb'" onmouseout="this.style.background='transparent'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div onclick="const input = this.parentNode.querySelector('input'); if (input) { if (input._flatpickr) { input._flatpickr.open(); } else if (window['initFlatpickr_${id}']) { const fp = window['initFlatpickr_${id}'](); if (fp) fp.open(); } }" style="display:flex; align-items:center; gap:6px; padding:0 10px; font-size:12px; font-weight:500; line-height:1; color:#24204D; cursor:pointer; user-select:none; height:34px; max-height:34px; transition:background 0.15s; font-family:'Kanit',sans-serif; box-sizing:border-box; overflow:hidden;" onmouseover="this.style.background='#f8f9fb'" onmouseout="this.style.background='transparent'">
          ${iconSvg}
          <span id="${labelId}" style="max-width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1;">Select Date Range</span>
        </div>
        <button id="${nextId}" style="padding:0 8px; border:none; background:transparent; cursor:pointer; color:#94a3b8; display:flex; align-items:center; justify-content:center; height:34px; max-height:34px; border-left:1px solid #e2e8f0; transition:background 0.15s; flex-shrink:0; box-sizing:border-box;" onmouseover="this.style.background='#f8f9fb'" onmouseout="this.style.background='transparent'">
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

  // Global helper to rename a team across all employees and org structure
  window.renameTeamName = async function(oldTeamName) {
    if (!oldTeamName) return;
    
    window.showPromptModal({
      title: 'แก้ไขชื่อทีม',
      message: `แก้ไขชื่อทีมจาก "${oldTeamName}" เป็น:`,
      defaultValue: oldTeamName.trim(),
      placeholder: 'พิมพ์ชื่อทีมใหม่...',
      onConfirm: async (newTeamName) => {
        if (!newTeamName || newTeamName.trim() === '') {
          const alertFn = window.showAlert || (typeof showAlert === 'function' ? showAlert : alert);
          alertFn('คำเตือน', 'กรุณาระบุชื่อทีมใหม่', 'warning');
          return;
        }
        if (newTeamName.trim().toLowerCase() === oldTeamName.trim().toLowerCase()) {
          const alertFn = window.showAlert || (typeof showAlert === 'function' ? showAlert : alert);
          alertFn('คำเตือน', 'ชื่อทีมใหม่ซ้ำกับชื่อทีมเดิม', 'warning');
          return;
        }
        
        const trimmedOldName = oldTeamName.trim();
        const trimmedNewName = newTeamName.trim();
        
        const alertFn = window.showAlert || (typeof showAlert === 'function' ? showAlert : alert);
        if (typeof showToast === 'function') {
          showToast(`กำลังเปลี่ยนชื่อทีม "${trimmedOldName}" เป็น "${trimmedNewName}"...`, 'info');
        }
        
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';
          
          // 1. Update Supabase
          const response = await fetch(`${supabaseUrl}/rest/v1/employees?team=eq.${encodeURIComponent(trimmedOldName)}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ 
              team: trimmedNewName
            })
          });
          if (!response.ok) {
            const errBody = await response.text();
            console.error(`Supabase employee update error:`, errBody);
            const alertFn = window.showAlert || (typeof showAlert === 'function' ? showAlert : alert);
            alertFn('Error', `Failed to update team: ${errBody}`, 'danger');
            throw new Error(`Failed to update team: ${errBody}`);
          }
          
          // ---- อัปเดต window.DATA.employees ในหน่วยความจำทันที ----
          if (window.DATA && window.DATA.employees) {
            window.DATA.employees = window.DATA.employees.map(e => {
              const matchesDept = e.dept && e.dept.trim().toLowerCase() === trimmedOldName.toLowerCase();
              const matchesTeam = e.team && e.team.trim().toLowerCase() === trimmedOldName.toLowerCase();
              if (matchesDept || matchesTeam) {
                return { 
                  ...e, 
                  dept: trimmedNewName,
                  team: trimmedNewName 
                };
              }
              return e;
            });
          }
          
          // Update local storage org structure if it exists
          const structStr = localStorage.getItem('org_structure');
          if (structStr) {
            try {
              const struct = JSON.parse(structStr);
              let changed = false;
              function updateDept(node) {
                const matchesTitle = node.title && node.title.trim().toLowerCase() === trimmedOldName.toLowerCase();
                const matchesDept = node.dept && node.dept.trim().toLowerCase() === trimmedOldName.toLowerCase();
                if (matchesTitle || matchesDept) {
                  if (matchesTitle) node.title = trimmedNewName;
                  if (matchesDept) node.dept = trimmedNewName;
                  changed = true;
                }
                if (node.children) {
                  node.children.forEach(updateDept);
                }
              }
              updateDept(struct);
              if (changed) {
                localStorage.setItem('org_structure', JSON.stringify(struct));
                await fetch(`${supabaseUrl}/rest/v1/org_structure?id=eq.default`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                  },
                  body: JSON.stringify({ structure: struct })
                });
              }
            } catch (e) {
              console.error(e);
            }
          }
          
          // Refetch all data using the background logic helper if it exists
          if (window.fetchAndSetLegacyData) {
            await window.fetchAndSetLegacyData();
          } else {
            const fetchMod = await import('./legacyDataFetcher.js');
            if (fetchMod && fetchMod.fetchAndSetLegacyData) {
              await fetchMod.fetchAndSetLegacyData();
            }
          }

          // Dynamically update any select options on the page containing the old team name
          const isModalOpen = !!document.getElementById('addEmployeeModal');
          document.querySelectorAll('select').forEach(select => {
            let optionsChanged = false;
            Array.from(select.options).forEach(opt => {
              if (opt.value && opt.value.trim().toLowerCase() === trimmedOldName.toLowerCase()) {
                opt.value = trimmedNewName;
                opt.text = trimmedNewName;
                optionsChanged = true;
              }
            });
            if (optionsChanged) {
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });

          const alertFn = window.showAlert || (typeof showAlert === 'function' ? showAlert : alert);
          if (typeof showToast === 'function') {
            showToast(`เปลี่ยนชื่อทีมเป็น "${trimmedNewName}" สำเร็จแล้ว!`, 'success');
          } else {
            alertFn('สำเร็จ', `เปลี่ยนชื่อทีมเป็น "${trimmedNewName}" สำเร็จแล้ว!`, 'success');
          }

          if (!isModalOpen) {
            // Force page reload to ensure React component state and active filters are re-rendered correctly
            setTimeout(() => {
              window.location.reload();
            }, 800);
          }
          
        } catch (err) {
          console.error(err);
          const alertFn = window.showAlert || (typeof showAlert === 'function' ? showAlert : alert);
          alertFn('เกิดข้อผิดพลาด', `เกิดข้อผิดพลาดในการยิงข้อมูล: ${err.message}`, 'danger');
        }
      }
    });
  };

  // --- AUTOMATIC CUSTOM DROPDOWN CONVERTER FOR ALL FILTERS ---
  let _convertDebounceTimer = null;
  let _globalObserver = null;
  let _isConverting = false;


  function convertNativeSelectsToCustomDropdowns() {
    if (typeof document === 'undefined') return;
    if (_isConverting) return; // prevent re-entry
    _isConverting = true;

    // Temporarily disconnect observer so our DOM changes don't re-trigger us
    if (_globalObserver) _globalObserver.disconnect();

    try {
      // Remove orphaned wrappers: a wrapper is orphaned if its inner select has been detached
      document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
        const hiddenSelect = wrapper.querySelector('select[data-custom-select]');
        // If the wrapper itself is no longer in the live document, skip (already detached)
        if (!document.contains(wrapper)) return;
        // If the select inside it is missing, remove the ghost wrapper
        if (!hiddenSelect) wrapper.remove();
      });

      const selects = document.querySelectorAll('select.select-input:not([data-custom-select]), select.form-input:not([data-custom-select]), select:not([data-custom-select])');
      selects.forEach(select => {
        if (select.classList.contains('flatpickr-monthDropdown-month') || select.closest('.flatpickr-calendar')) {
          select.setAttribute('data-custom-select', 'skip');
          return;
        }
        // Skip hidden selects (e.g. inside other custom wrappers already processed)
        // Keep width and styling from original select
        const originalWidth = select.style.width || select.getAttribute('width') || '';
        const originalHeight = select.style.height || select.getAttribute('height') || '';
        const originalFlex = select.style.flex || '';
        
        // Mark as handled
        select.setAttribute('data-custom-select', 'true');

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
      trigger.type = 'button';
      trigger.className = 'select-input';
      trigger.disabled = select.disabled;
      const updateTriggerStyle = () => {
        if (select.disabled) {
          trigger.style.backgroundColor = '#f8fafc';
          trigger.style.color = '#cbd5e1';
          trigger.style.cursor = 'not-allowed';
          trigger.style.borderColor = '#e2e8f0';
          trigger.style.opacity = '0.7';
        } else {
          trigger.style.backgroundColor = '';
          trigger.style.color = '';
          trigger.style.cursor = 'pointer';
          trigger.style.borderColor = '';
          trigger.style.opacity = '';
        }
      };
      updateTriggerStyle();
      trigger.style.cssText += ` width: 100%; text-align: left; display: flex; align-items: center; justify-content: space-between; font-family: 'Kanit', 'Prompt', sans-serif; font-size: 12px; font-weight: 500; background-image: none !important; padding-right: 14px !important; padding-left: 16px !important; border-radius: 9999px !important; box-sizing: border-box;`;
      if (originalHeight) {
        trigger.style.height = originalHeight;
        trigger.style.setProperty('height', originalHeight, 'important');
      }

      const triggerText = document.createElement('span');
      triggerText.style.cssText = `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`;
      triggerText.textContent = select.options[select.selectedIndex]?.text || '';
      trigger.appendChild(triggerText);

      const triggerIcon = document.createElement('span');
      triggerIcon.style.cssText = `display: flex; align-items: center; justify-content: center; margin-left: 8px; flex-shrink: 0;`;
      triggerIcon.innerHTML = `<svg class="w-3.5 h-3.5 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>`;
      trigger.appendChild(triggerIcon);
      
      wrapper.appendChild(trigger);

      // Create custom dropdown container
      const dropdown = document.createElement('div');
      dropdown.className = 'custom-select-dropdown';
      dropdown.style.cssText = `display: none; position: absolute; top: 100%; right: 0; margin-top: 6px; width: 100%; min-width: 160px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); z-index: 9999; padding: 4px; max-height: 240px; overflow-x: hidden; overflow-y: auto;`;

      // Helper function to update dropdown items based on select options
      const populateOptions = (filterText = '') => {
        dropdown.innerHTML = '';

        // Add search input if options count > 5 and not disabled via data-no-search
        if (select.options.length > 5 && select.getAttribute('data-no-search') !== 'true') {
          const searchInput = document.createElement('input');
          searchInput.type = 'text';
          searchInput.placeholder = 'ค้นหา...';
          searchInput.className = 'custom-select-search-input';
          searchInput.value = filterText;
          searchInput.style.cssText = `width: calc(100% - 16px); height: 28px; margin: 4px 8px 8px; padding: 0 12px; border: 1px solid #cbd5e1; border-radius: 9999px; font-size: 11px; outline: none; font-family: 'Kanit', 'Prompt', sans-serif; box-sizing: border-box;`;
          
          searchInput.onclick = (e) => {
            e.stopPropagation(); // Prevent dropdown from closing when clicking search
          };
          
          searchInput.oninput = (e) => {
            const val = e.target.value;
            // Re-populate passing filter text to keep focus and input value
            populateOptions(val);
            // Refocus the newly created search input and put cursor at end
            const newSearchInput = dropdown.querySelector('.custom-select-search-input');
            if (newSearchInput) {
              newSearchInput.focus();
              newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
            }
          };
          dropdown.appendChild(searchInput);
        }

        const optionsContainer = document.createElement('div');
        optionsContainer.style.cssText = `max-height: 180px; overflow-y: auto;`;

        Array.from(select.options).forEach((opt, idx) => {
          if (filterText && !opt.text.toLowerCase().includes(filterText.toLowerCase().trim())) {
            return;
          }
          
          const optionDiv = document.createElement('div');
          optionDiv.className = 'custom-select-option';
          
          // Check if this option is selected
          const isSelected = select.selectedIndex === idx;
          optionDiv.style.cssText = isSelected 
            ? `padding: 10px 14px; font-size: 12px; cursor: pointer; border-radius: 8px; color: #4f46e5; background-color: #f0efff; font-weight: 600; font-family: 'Kanit', 'Prompt', sans-serif; line-height: 1.4; white-space: nowrap; display: flex; align-items: center; justify-content: space-between; gap: 8px;`
            : `padding: 10px 14px; font-size: 12px; cursor: pointer; border-radius: 8px; color: #374151; background-color: transparent; font-weight: 500; font-family: 'Kanit', 'Prompt', sans-serif; line-height: 1.4; white-space: nowrap; transition: background-color 0.12s ease; display: flex; align-items: center; justify-content: space-between; gap: 8px;`;
          
          const textSpan = document.createElement('span');
          textSpan.textContent = opt.text;
          optionDiv.appendChild(textSpan);


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
          optionsContainer.appendChild(optionDiv);
        });
        dropdown.appendChild(optionsContainer);
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
        trigger.disabled = select.disabled;
        updateTriggerStyle();
        triggerText.textContent = select.options[select.selectedIndex]?.text || '';
        populateOptions();
      });
      selectObserver.observe(select, { childList: true, attributes: true, characterData: true, subtree: true });

      // Listen for native select change events (e.g. programmatically dispatched changes) to sync trigger text
      select.addEventListener('change', () => {
        trigger.disabled = select.disabled;
        updateTriggerStyle();
        triggerText.textContent = select.options[select.selectedIndex]?.text || '';
        populateOptions();
      });
    }); // end selects.forEach
    } catch(e) { console.warn('[customSelect] convert error:', e); }
    finally {
      _isConverting = false;
      // Reconnect observer
      if (_globalObserver) {
        _globalObserver.observe(document.documentElement, { childList: true, subtree: true });
      }
    }
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
  _globalObserver = new MutationObserver(() => {
    clearTimeout(_convertDebounceTimer);
    _convertDebounceTimer = setTimeout(convertNativeSelectsToCustomDropdowns, 80);
  });
  _globalObserver.observe(document.documentElement, {
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
      <div class="modal-card" style="background:#fff; width:460px; border-radius:24px; padding:40px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.15); border:1px solid rgba(255,255,255,0.2); transform:scale(1); animation: modalBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)">
        <div style="width:72px; height:72px; border-radius:22px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; transform: rotate(-5deg)">
          <i data-lucide="${icon}" style="width:36px; height:36px"></i>
        </div>
        <h3 style="margin:0 0 12px; font-size:1.3rem; font-weight:700; color:#1e293b; font-family:Kanit">${title}</h3>
        <p style="margin:0 0 32px; font-size:.9rem; color:#64748b; line-height:1.6; font-family:Kanit; padding:0 10px">${message}</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
          <button onclick="document.getElementById('${modalId}').remove()" class="btn btn-outline" style="display:flex !important; align-items:center !important; justify-content:center !important; text-align:center !important; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; height:34px; padding:0 16px; border-radius:9999px !important; font-weight:600; font-family:Kanit; cursor:pointer; font-size:.82rem; transition:all 0.2s; box-sizing:border-box; white-space:nowrap !important;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'"><i data-lucide="x" style="width:16px; height:16px; margin-right:6px"></i>Cancel</button>
          <button id="confirmModalBtn" class="btn btn-primary" style="display:flex !important; align-items:center !important; justify-content:center !important; text-align:center !important; background:${color}; color:#fff; border:none; height:34px; padding:0 16px; border-radius:9999px !important; font-weight:700; font-family:Kanit; cursor:pointer; font-size:.82rem; box-shadow: 0 8px 20px ${color}30; box-sizing:border-box; white-space:nowrap !important;" onmouseover="this.style.background='${color}'" onmouseout="this.style.background='${color}'"><i data-lucide="${icon}" style="width:16px; height:16px; margin-right:6px"></i>${confirmText}</button>
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
        <button onclick="document.getElementById('${modalId}').remove()" class="btn btn-primary" style="display:inline-flex !important; align-items:center !important; justify-content:center !important; text-align:center !important; width:100%; background:${color}; color:#fff; border:none; height:34px; border-radius:99px !important; font-weight:600; font-family:Kanit; cursor:pointer; font-size:.78rem; box-shadow: 0 2px 8px ${color}20">OK</button>
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

  // --- GLOBAL CUSTOM PROMPT MODAL DIALOG ---
  window.showPromptModal = function({ title, message, placeholder = '', defaultValue = '', onConfirm }) {
    const modalId = 'promptModal';
    if (document.getElementById(modalId)) document.getElementById(modalId).remove();

    const color = '#635BFF';
    const bgLight = '#f5f3ff';
    const icon = 'edit-3';

    const html = `
    <div id="${modalId}" class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.4); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:99999; animation: fadeIn 0.3s ease">
      <div class="modal-card" style="background:#fff; width:440px; border-radius:24px; padding:32px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.15); border:1px solid rgba(255,255,255,0.2); transform:scale(1); animation: modalBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); display:flex; flex-direction:column; gap:16px;">
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:4px;">
          <div style="width:48px; height:48px; border-radius:14px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <i data-lucide="${icon}" style="width:24px; height:24px"></i>
          </div>
          <div style="text-align:left;">
            <h3 style="margin:0; font-size:1.15rem; font-weight:700; color:#1e293b; font-family:Kanit">${title}</h3>
            <p style="margin:2px 0 0; font-size:.8rem; color:#64748b; font-family:Kanit">${message}</p>
          </div>
        </div>
        
        <div>
          <input type="text" id="promptModalInput" class="form-input" value="${defaultValue}" placeholder="" style="width:100%; height:34px !important; border-radius:9999px !important; font-family:'Kanit', 'Prompt', sans-serif; font-size:.88rem; outline:none; padding:0 16px; border:1px solid #e2e8f0; box-sizing:border-box;" autocomplete="off">
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
          <button type="button" onclick="document.getElementById('${modalId}').remove()" class="btn btn-outline" style="border-radius:99px !important; height:32px !important; font-size:0.75rem !important; padding:0 16px !important; font-family:Kanit; display:inline-flex; align-items:center; gap:6px;"><i data-lucide="x" style="width:14px; height:14px"></i>Cancel</button>
          <button type="button" id="promptModalConfirmBtn" class="btn btn-primary" style="border-radius:99px !important; height:32px !important; font-size:0.75rem !important; padding:0 16px !important; font-family:Kanit; background:${color} !important; color:#fff; display:inline-flex; align-items:center; gap:6px;"><i data-lucide="save" style="width:14px; height:14px"></i>Save</button>
        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });
    
    const input = document.getElementById('promptModalInput');
    if (input) {
      input.focus();
      input.select();
      
      input.onkeydown = function(e) {
        if (e.key === 'Enter') {
          confirmAction();
        } else if (e.key === 'Escape') {
          document.getElementById(modalId).remove();
        }
      };
    }

    const confirmBtn = document.getElementById('promptModalConfirmBtn');
    
    function confirmAction(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const val = input.value;
      document.getElementById(modalId).remove();
      if (typeof onConfirm === 'function') {
        onConfirm(val);
      }
    }
    
    if (confirmBtn) {
      confirmBtn.onclick = confirmAction;
    }
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
        // Use Supabase UPSERT (POST with Prefer: resolution=merge) to handle both insert and update
        await fetch(`${supabaseUrl}/rest/v1/holiday_shifts`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge'
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
      }
    } catch (err) {
      console.error('Error in apiSaveHolidayShift:', err);
      throw err;
    }
  };

  // ─── Section Management Helpers ────────────────────────────────────────────
  const DEFAULT_SECTIONS = ['Operation', 'Content', 'Graphics', 'ETDA Call Center', 'OR Call Center'];

  window.getHolidaySections = function() {
    try {
      let custom = JSON.parse(localStorage.getItem('custom_holiday_sections') || '[]');
      // Automatically clean up 'test' (case-insensitive) from localStorage if found
      if (custom.some(s => s && s.toLowerCase() === 'test')) {
        custom = custom.filter(s => !s || s.toLowerCase() !== 'test');
        localStorage.setItem('custom_holiday_sections', JSON.stringify(custom));
      }
      const all = [...DEFAULT_SECTIONS];
      custom.forEach(s => { if (s && !all.includes(s)) all.push(s); });
      return all;
    } catch(e) { return [...DEFAULT_SECTIONS]; }
  };

  window.addHolidaySection = function(name) {
    name = (name || '').trim();
    if (!name || name.toLowerCase() === 'test') return false;
    const sections = window.getHolidaySections();
    if (sections.includes(name)) return false;
    try {
      const custom = JSON.parse(localStorage.getItem('custom_holiday_sections') || '[]');
      custom.push(name);
      localStorage.setItem('custom_holiday_sections', JSON.stringify(custom));
    } catch(e) {}
    return true;
  };

  window.removeHolidaySection = function(name) {
    if (DEFAULT_SECTIONS.includes(name)) return; // cannot remove defaults
    try {
      let custom = JSON.parse(localStorage.getItem('custom_holiday_sections') || '[]');
      custom = custom.filter(s => s !== name);
      localStorage.setItem('custom_holiday_sections', JSON.stringify(custom));
    } catch(e) {}
  };

  /** Build <option> HTML for a section select. Pass currentValue to pre-select. */
  window.buildSectionOptions = function(currentValue, placeholderText) {
    placeholderText = placeholderText || '-- เลือก Section --';
    const sections = window.getHolidaySections();
    const isSelected = v => v === currentValue ? 'selected' : '';
    let html = `<option value="" disabled ${!currentValue ? 'selected' : ''}>${placeholderText}</option>`;
    sections.forEach(s => {
      html += `<option value="${s}" ${isSelected(s)}>${s}</option>`;
    });
    html += `<option value="_add_new_section_">＋ Add New Section...</option>`;
    return html;
  };

  /** Call this via onchange on any section <select>. Handles the "+ Add new" option. */
  window.onSectionSelectChange = function(selectEl) {
    if (!selectEl || selectEl.value !== '_add_new_section_') return;
    // Reset select to previous value while prompting
    const prev = selectEl.dataset.prevValue || '';
    selectEl.value = prev;
    window.showPromptModal({
      title: 'เพิ่ม Section ใหม่',
      message: 'กรอกชื่อ Section ที่ต้องการเพิ่ม',
      placeholder: '',
      onConfirm: function(name) {
        name = (name || '').trim();
        if (!name) return;
        const added = window.addHolidaySection(name);
        if (!added) {
          window.showAlert('Notice', `Section "${name}" already exists`, 'warning');
          return;
        }
        // Re-populate all open section selects
        document.querySelectorAll('select.section-select').forEach(sel => {
          const cur = sel.value;
          sel.innerHTML = window.buildSectionOptions(cur);
          sel.value = cur;
          sel.dataset.prevValue = cur;
        });
        // Select the new section in the triggering element
        selectEl.innerHTML = window.buildSectionOptions(name);
        selectEl.value = name;
        selectEl.dataset.prevValue = name;
        window.showAlert('Done', `Section "${name}" has been added`, 'success');
      }
    });
  };

  /** Open the Section Manager panel */
  window.openManageSectionsPanel = function() {
    const existing = document.getElementById('manageSectionsPanel');
    if (existing) { existing.remove(); return; }

    const render = () => {
      const sections = window.getHolidaySections();
      let rows = sections.map(s => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0;">
          <span style="font-size:.82rem; font-weight:600; color:#1e293b;">${s}</span>
          ${DEFAULT_SECTIONS.includes(s)
            ? `<span style="font-size:.7rem; color:#94a3b8; font-style:italic;">ค่าเริ่มต้น</span>`
            : `<button onclick="window.removeHolidaySection('${s}'); window._rerenderSectionsPanel();" style="background:#fee2e2; color:#ef4444; border:none; padding:3px 8px; border-radius:6px; font-size:.7rem; font-weight:700; cursor:pointer;">ลบ</button>`
          }
        </div>
      `).join('');
      return rows;
    };

    window._rerenderSectionsPanel = function() {
      const list = document.getElementById('sectionPanelList');
      if (list) list.innerHTML = render();
      // Refresh all open section selects
      document.querySelectorAll('select.section-select').forEach(sel => {
        const cur = sel.value;
        sel.innerHTML = window.buildSectionOptions(cur);
        sel.value = cur;
      });
    };

    const panelHtml = `
      <div id="manageSectionsPanel" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:200000; animation:fadeIn 0.2s ease-out; font-family:Prompt,sans-serif;">
        <div style="background:#fff; width:420px; border-radius:20px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.2); overflow:hidden;">
          <div style="padding:20px 24px 14px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:1rem; font-weight:700; color:#1e293b;">⚙️ จัดการ Section</div>
              <div style="font-size:.72rem; color:#64748b; margin-top:2px;">เพิ่มหรือลบ Section สำหรับใช้ใน Template</div>
            </div>
            <button onclick="document.getElementById('manageSectionsPanel').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8; font-size:1.2rem;">✕</button>
          </div>
          <div style="padding:16px 24px; max-height:50vh; overflow-y:auto;">
            <div id="sectionPanelList" style="display:flex; flex-direction:column; gap:8px;">${render()}</div>
          </div>
          <div style="padding:14px 24px; border-top:1px solid #e2e8f0; display:flex; gap:8px;">
            <input id="newSectionInput" type="text" placeholder="ชื่อ Section ใหม่..." style="flex:1; height:36px; padding:0 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:.82rem; outline:none; font-family:Prompt,sans-serif;" />
            <button onclick="
              const v = document.getElementById('newSectionInput').value.trim();
              if(!v) return;
              const ok = window.addHolidaySection(v);
              if(ok){ document.getElementById('newSectionInput').value=''; window._rerenderSectionsPanel(); }
              else window.showAlert('แจ้งเตือน','Section นี้มีอยู่แล้ว','warning');
            " style="background:#635bff; color:#fff; border:none; padding:0 16px; border-radius:8px; font-size:.8rem; font-weight:700; cursor:pointer; white-space:nowrap;">+ เพิ่ม</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', panelHtml);
    setTimeout(() => document.getElementById('newSectionInput')?.focus(), 100);
  };
  // ────────────────────────────────────────────────────────────────────────────

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
      <style>
        .template-card:hover {
          background-color: #f8fafc !important;
        }
        .template-card .template-actions {
          display: none !important;
        }
        .template-card:hover .template-actions {
          display: flex !important;
        }
        .template-card .right-column {
          width: 80px !important;
        }
        .template-card:hover .right-column {
          width: 220px !important;
        }
      </style>
      <div style="display:flex; justify-content:flex-end; margin-bottom:16px;">
        <button onclick="window.renderTemplateForm()" style="background:#635bff; color:#fff; border:none; padding:8px 16px; border-radius:10px; font-size:.8rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(99,91,255,0.3);">
          + Add New Templetes
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
        const totalPct = (tpl.assignments || []).reduce((sum, a) => sum + (parseInt(a.percent) || 0), 0);
        listHtml += `
          <div class="template-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.02); transition: background-color 0.2s;">
            <div style="min-width:0; flex:1; padding-right:16px;">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:#635bff; color:#ffffff; font-size:0.75rem; font-weight:700; flex-shrink:0;">${idx + 1}</span>
                <span style="font-weight:700; font-size:0.9rem; color:#1e293b;">${tpl.name || tpl.section || '-'}</span>
                ${tpl.name ? `<span style="background:#f1e9ff; color:#635bff; padding:2px 8px; border-radius:99px; font-size:0.65rem; font-weight:700;">${tpl.section || '-'}</span>` : ''}
                <span style="background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:99px; font-size:0.65rem; font-weight:700;">
                  ${tpl.time || '-'}
                </span>
              </div>
              <div style="margin-top:10px; display:flex; flex-direction:column; gap:6px; border-top:1px solid #f1f5f9; padding-top:8px;">
                ${(tpl.assignments || []).map(a => `
                  <div style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:#475569;">
                    <span style="display:inline-block; width:5px; height:5px; border-radius:50%; background:#818cf8; flex-shrink:0;"></span>
                    <span style="font-weight:600; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;" title="${a.project}">${a.project}</span>
                    <span style="color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:260px;" title="${a.job || '-'}">- ${a.job || '-'}</span>
                    <span style="background:#f1f5f9; color:#635bff; padding:1px 6px; border-radius:99px; font-size:0.65rem; font-weight:700; margin-left:auto; flex-shrink:0;">${a.percent}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="right-column" style="display:flex; align-items:center; justify-content:flex-end; gap:16px; flex-shrink:0; transition: width 0.2s ease;">
              <span style="background:#e0f2fe; color:#0369a1; padding:4px 10px; border-radius:99px; font-size:0.7rem; font-weight:700; white-space:nowrap;">
                รวม ${totalPct}%
              </span>
              <div class="template-actions" style="display:none; gap:8px;">
                <button onclick="window.renderTemplateForm('${tpl.id}')" style="background:#e0e7ff; color:#4f46e5; border:none; padding:6px 12px; border-radius:8px; font-size:0.75rem; font-weight:700; cursor:pointer;">
                  Edit
                </button>
                <button onclick="window.deleteTemplate('${tpl.id}')" style="background:#fee2e2; color:#ef4444; border:none; padding:6px 12px; border-radius:8px; font-size:0.75rem; font-weight:700; cursor:pointer;">
                  Delete
                </button>
              </div>
            </div>
          </div>
        `;
      });
      listHtml += `</div>`;
    }

    body.innerHTML = listHtml;
    // Restore scroll position saved before switching to form view
    if (window._tplListScrollTop != null) {
      body.scrollTop = window._tplListScrollTop;
      window._tplListScrollTop = null;
    }
  };

  window.renderTemplateForm = function(templateId = '') {
    const body = document.getElementById('templatesModalBody');
    if (!body) return;
    // Save current scroll position so we can restore it when returning to list
    window._tplListScrollTop = body.scrollTop;

    const isEdit = !!templateId;
    const tpl = isEdit ? (window.HOLIDAY_TEMPLATES || []).find(t => t.id === templateId) : null;

    const scopeTasks = typeof window.getTasksFromScope === 'function' ? window.getTasksFromScope() : [];
    const uniqueProjects = [...new Set(scopeTasks.map(t => t.acc))].sort();

    let projectRowsHtml = '';
    if (tpl && tpl.assignments && tpl.assignments.length > 0) {
      projectRowsHtml = tpl.assignments.map((a, idx) => {
        // Ensure the saved project is always available as an option even if scope hasn't loaded
        const projectsForRow = (a.project && !uniqueProjects.includes(a.project))
          ? [a.project, ...uniqueProjects]
          : uniqueProjects;
        return `
        <div class="tpl-project-row" style="display:grid; grid-template-columns:1fr 1fr 80px auto; gap:12px; margin-bottom:12px; align-items:center;">
          <select class="tplProject" style="width:100%; height:34px; padding:0 14px; border:1px solid #cbd5e1; border-radius:9999px; font-size:.8rem; outline:none; background:#fff; box-sizing:border-box;">
            <option value="">-- เลือกโครงการ --</option>
            ${projectsForRow.map(proj => `<option value="${proj}" ${proj === a.project ? 'selected' : ''}>${proj}</option>`).join('')}
          </select>
          <input type="text" class="tplJob" placeholder="ชื่องาน" value="${a.job || ''}" style="width:100%; height:34px; padding:0 16px; border:1px solid #cbd5e1; border-radius:9999px; font-size:.8rem; outline:none; box-sizing:border-box;">
          <div style="position:relative;">
            <input type="number" class="tplPercent" value="${a.percent ?? ''}" min="0" style="width:100%; height:34px; padding:0 28px 0 14px; border:1px solid #cbd5e1; border-radius:9999px; font-size:.8rem; outline:none; text-align:center; box-sizing:border-box;" oninput="window.calcTemplateTotalPercent()">
            <span style="position:absolute; right:14px; top:50%; transform:translateY(-50%); font-size:.8rem; color:#64748b;">%</span>
          </div>
          <button type="button" onclick="if(document.querySelectorAll('.tpl-project-row').length > 1) { this.parentElement.remove(); window.calcTemplateTotalPercent(); }" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; padding:8px;">
            ✕
          </button>
        </div>
      `;
      }).join('');
    } else {
      projectRowsHtml = `
        <div class="tpl-project-row" style="display:grid; grid-template-columns:1fr 1fr 80px auto; gap:12px; margin-bottom:12px; align-items:center;">
          <select class="tplProject" style="width:100%; height:34px; padding:0 14px; border:1px solid #cbd5e1; border-radius:9999px; font-size:.8rem; outline:none; background:#fff; box-sizing:border-box;">
            <option value="">-- เลือกโครงการ --</option>
            ${uniqueProjects.map(proj => `<option value="${proj}">${proj}</option>`).join('')}
          </select>
          <input type="text" class="tplJob" placeholder="ชื่องาน" value="" style="width:100%; height:34px; padding:0 16px; border:1px solid #cbd5e1; border-radius:9999px; font-size:.8rem; outline:none; box-sizing:border-box;">
          <div style="position:relative;">
            <input type="number" class="tplPercent" value="" min="0" style="width:100%; height:34px; padding:0 28px 0 14px; border:1px solid #cbd5e1; border-radius:9999px; font-size:.8rem; outline:none; text-align:center; box-sizing:border-box;" oninput="window.calcTemplateTotalPercent()">
            <span style="position:absolute; right:14px; top:50%; transform:translateY(-50%); font-size:.8rem; color:#64748b;">%</span>
          </div>
          <button type="button" onclick="if(document.querySelectorAll('.tpl-project-row').length > 1) { this.parentElement.remove(); window.calcTemplateTotalPercent(); }" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; padding:8px; display:none;">
            ✕
          </button>
        </div>
      `;
    }

    body.innerHTML = `
      <form id="tplForm" onsubmit="event.preventDefault();" style="display:flex; flex-direction:column; gap:16px">
        <div>
          <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">ชื่อ Template (Template Name)</label>
          <input type="text" id="tplName" placeholder="ระบุชื่อชุดงานมาตรฐาน" value="${tpl && tpl.name ? tpl.name : ''}" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:9999px !important; font-size:.8rem; outline:none; font-family:'Kanit', sans-serif; box-sizing:border-box;">
        </div>

        <div>
          <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">ส่วนงาน (Section)</label>
          <select id="tplSection" required class="section-select" data-prev-value="${tpl && tpl.section ? tpl.section : ''}"
            onchange="window.onSectionSelectChange(this); this.dataset.prevValue = this.value !== '_add_new_section_' ? this.value : this.dataset.prevValue;"
            style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:9999px; font-size:.8rem; outline:none; background:#fff">
            ${window.buildSectionOptions(tpl && tpl.section ? tpl.section : '')}
          </select>
        </div>

        <div>
          <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">กะเวลาปฏิบัติงาน (Work Shift)</label>
          <select id="tplTime" required data-no-search="true" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:9999px; font-size:.8rem; outline:none; background:#fff">
            <option value="" disabled selected>-- เลือกกะเวลา --</option>
            <option value="เช้าตรู่ 06.00-15.00 น." ${tpl && tpl.time === 'เช้าตรู่ 06.00-15.00 น.' ? 'selected' : ''}>เช้าตรู่ 06.00-15.00 น.</option>
            <option value="เช้า 07.00-16.00 น." ${tpl && tpl.time === 'เช้า 07.00-16.00 น.' ? 'selected' : ''}>เช้า 07.00-16.00 น.</option>
            <option value="เช้า 08.00-17.00 น." ${tpl && tpl.time === 'เช้า 08.00-17.00 น.' ? 'selected' : ''}>เช้า 08.00-17.00 น.</option>
            <option value="เช้า 09.00-18.00 น." ${tpl && tpl.time === 'เช้า 09.00-18.00 น.' ? 'selected' : ''}>เช้า 09.00-18.00 น.</option>
            <option value="สาย 10.00-19.00 น." ${tpl && tpl.time === 'สาย 10.00-19.00 น.' ? 'selected' : ''}>สาย 10.00-19.00 น.</option>
            <option value="สาย 12.00-21.00 น." ${tpl && tpl.time === 'สาย 12.00-21.00 น.' ? 'selected' : ''}>สาย 12.00-21.00 น.</option>
            <option value="บ่าย 13.00-22.00 น." ${tpl && tpl.time === 'บ่าย 13.00-22.00 น.' ? 'selected' : ''}>บ่าย 13.00-22.00 น.</option>
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
              + Add task
            </button>
            <div id="tplTotalPercent" style="font-size:.8rem; font-weight:700; color:#10b981;">Total: 100%</div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
          <button type="button" onclick="window.renderTemplatesList()" style="background:#f1f5f9; color:#475569; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:500; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
            <i data-lucide="arrow-left" style="width:14px; height:14px;"></i> Back
          </button>
          <button type="button" onclick="window.submitTemplateForm('${templateId}');" id="btnSubmitTpl" style="background:#635bff; color:#fff; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:600; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
            <i data-lucide="save" style="width:14px; height:14px;"></i> Save
          </button>
        </div>
      </form>
    `;
    window.calcTemplateTotalPercent();
    if (window.lucide) window.lucide.createIcons({ root: document.getElementById('tplForm') });
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
      <select class="tplProject" style="width:100%; height:34px; padding:0 14px; border:1px solid #cbd5e1; border-radius:9999px; font-size:.8rem; outline:none; background:#fff; box-sizing:border-box;">
        <option value="">-- เลือกโครงการ --</option>
        ${uniqueProjects.map(proj => `<option value="${proj}">${proj}</option>`).join('')}
      </select>
      <input type="text" class="tplJob" placeholder="ชื่องาน" value="" style="width:100%; height:34px; padding:0 16px; border:1px solid #cbd5e1; border-radius:9999px; font-size:.8rem; outline:none; box-sizing:border-box;">
      <div style="position:relative;">
        <input type="number" class="tplPercent" value="" min="0" style="width:100%; height:34px; padding:0 28px 0 14px; border:1px solid #cbd5e1; border-radius:9999px; font-size:.8rem; outline:none; text-align:center; box-sizing:border-box;" oninput="window.calcTemplateTotalPercent()">
        <span style="position:absolute; right:14px; top:50%; transform:translateY(-50%); font-size:.8rem; color:#64748b;">%</span>
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
      label.textContent = `Total: ${total}%`;
      label.style.color = '#635bff';
    }
  };

  window.submitTemplateForm = async function(templateId = '') {
    const isEdit = !!templateId;
    const name = document.getElementById('tplName')?.value?.trim() || '';
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
        window.showAlert('Error', 'Please select a project', 'danger');
        return;
      }
      assignments.push({ project, job: job || '-', percent });
      totalPercent += percent;
    }

    // No strict 100% total check anymore - can be less or more

    const btnSubmit = document.getElementById('btnSubmitTpl');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'saving...';

    const id = isEdit ? templateId : 'tpl_' + Date.now();
    const payload = {
      action: isEdit ? 'edit' : 'add',
      id,
      date: 'TEMPLATE',
      holidayName: name || 'TEMPLATE',
      status: 'upcoming',
      section,
      person: '',
      time,
      assignments: JSON.stringify(assignments)
    };

    try {
      await window.apiSaveHolidayShift(payload);

      if (!window.HOLIDAY_TEMPLATES) window.HOLIDAY_TEMPLATES = [];
      const tplIndex = window.HOLIDAY_TEMPLATES.findIndex(t => t.id === id);

      const updatedTemplate = { id, name, section, time, assignments };
      if (tplIndex !== -1) {
        window.HOLIDAY_TEMPLATES[tplIndex] = updatedTemplate;
      } else {
        window.HOLIDAY_TEMPLATES.push(updatedTemplate);
      }

      localStorage.setItem('holiday_templates', JSON.stringify(window.HOLIDAY_TEMPLATES));

      window.showAlert('Success', 'Template saved successfully', 'success');
      window.renderTemplatesList();
    } catch (err) {
      window.showAlert('Error', 'Failed to save template: ' + (err.message || err), 'danger');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Save';
    }
  };

  window.deleteTemplate = function(templateId) {
    window.showConfirmDelete('Confirm Delete Template', 'Are you sure you want to delete this template? This will also remove all applied tasks in the calendar using this template.', async () => {
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
            window.showAlert('Success', 'Template and applied tasks deleted successfully', 'success');
            window.renderTemplatesList();
            if (typeof window.navigate === 'function') {
              window.navigate('public-holiday');
            }
          });
        } else {
          window.showAlert('Success', 'Template deleted successfully', 'success');
          window.renderTemplatesList();
        }
      }).catch(() => {
        window.showAlert('Success', 'Template deleted successfully', 'success');
        window.renderTemplatesList();
      });
    });
  };







