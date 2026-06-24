try {
  if (window.logLoad) logLoad("pages.js: Loading...");
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
    const icon = type === 'danger' ? 'alert-circle' : 'check-circle';

    toast.style.cssText = `
      position: fixed; top: 24px; right: 24px; z-index: 99999;
      background: white; padding: 16px 24px; border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-left: 5px solid ${color};
      display: flex; align-items: center; gap: 12px; font-family: 'Kanit', sans-serif;
      font-size: 0.9rem; font-weight: 700; color: #1e293b;
      transform: translateX(120%); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    toast.innerHTML = `<i data-lucide="${icon}" style="width: 20px; height: 20px; color: ${color}"></i> ${msg}`;
    document.body.appendChild(toast);
    if (window.lucide) window.lucide.createIcons({ root: toast });

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
  let _datePickerCounter = 0;

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const thaiHolidays = {
    '1-1': 'วันขึ้นปีใหม่', '2-10': 'วันมาฆบูชา', '4-6': 'วันจักรี', '4-13': 'วันสงกรานต์', '4-14': 'วันสงกรานต์', '4-15': 'วันสงกรานต์',
    '5-1': 'วันแรงงานแห่งชาติ', '5-4': 'วันฉัตรมงคล', '5-12': 'วันวิสาขบูชา', '6-3': 'วันเฉลิมพระชนมพรรษา สมเด็จพระราชินี',
    '7-10': 'วันอาสาฬหบูชา', '7-11': 'วันเข้าพรรษา', '7-28': 'วันเฉลิมพระชนมพรรษา ร.10', '8-12': 'วันเฉลิมพระชนมพรรษา สมเด็จพระบรมราชชนนี / วันแม่',
    '10-13': 'วันคล้ายวันสวรรคต ร.9', '10-23': 'วันปิยมหาราช', '12-5': 'วันคล้ายวันพระบรมราชสมภพ ร.9 / วันพ่อ', '12-10': 'วันรัฐธรรมนูญ', '12-31': 'วันสิ้นปี'
  };
  const isThaiHoliday = (dateObj) => {
    if (!dateObj) return null;
    const key = `${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
    if (window.HOLIDAYS && window.HOLIDAYS[key]) return window.HOLIDAYS[key];
    return thaiHolidays[key] || null;
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
    background:#f8f9fb;border:1px solid var(--border);border-radius:8px;
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
        <span style="color:var(--text-3);font-size:.7rem;flex-shrink:0">-֧</span>
        <div id="${toId}" style="${boxStyle}color:var(--text-3)" onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='var(--border)'">
          <span>To</span>${iconSvg}
        </div>
        ${extraFilterHtml || ''}
        ${showClear ? `
        <button id="${id}_clear" class="btn btn-danger btn-sm" style="padding:7px 12px; font-size:.7rem; white-space:nowrap; border-radius:8px; background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2); display:flex; align-items:center; gap:6px">
          <i data-lucide="rotate-ccw" style="width:13px; height:13px"></i>
          Clear All Filter
        </button>
        ` : ''}
      </div>
      <input id="${id}" type="text" style="position:absolute;width:0;height:0;opacity:0;pointer-events:none" readonly>
    </div>`;
  }


  // ---------- COST ----------
  window.pageCost = function() {
    const s = COST_DATA.summary;
    const projects = COST_DATA.projects;
    const totalRev = projects.reduce((sum, p) => sum + p.rev, 0);
    const totalGP = totalRev - s.total;
    const gpMargin = totalRev > 0 ? (totalGP / totalRev * 100).toFixed(1) : '0';

    // Trigger chart init after a short delay to ensure DOM is ready
    setTimeout(initCostCharts, 100);

    const tblData = [
      { p: 'DIB-Solar Farm', b: '3,000,000', c: '2,450,000', u: '82%', r: '-550,000', s: 'ปกติ', sc: '#10b981' },
      { p: 'DIB-Warehouse', b: '2,500,000', c: '2,100,000', u: '84%', r: '-400,000', s: 'เกินงบ', sc: '#ef4444' },
      { p: 'DIB-Office Building', b: '2,000,000', c: '1,650,000', u: '83%', r: '-350,000', s: 'เกินงบ', sc: '#ef4444' },
      { p: 'DIB-Retrofit', b: '1,500,000', c: '1,100,000', u: '73%', r: '-400,000', s: 'ปกติ', sc: '#10b981' },
      { p: 'DIB-Data Center', b: '1,200,000', c: '950,000', u: '79%', r: '-250,000', s: 'ปกติ', sc: '#10b981' },
      { p: 'DIB-Other', b: '300,000', c: '180,000', u: '60%', r: '-120,000', s: 'ปกติ', sc: '#10b981' },
    ];

    return `
  <!-- Topbar Actions -->
  <div style="display:flex;justify-content:flex-end;gap:12px;margin-bottom:18px">
    ${renderDateFilter('initCostCharts()')}
    <button class="btn" style="background:rgba(99,102,241,0.08);color:#6366f1;border:1px solid rgba(99,102,241,0.2);display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Export
    </button>
  </div>

  <!-- KPIs Row -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:48px;height:48px;border-radius:12px;background:#fee2e2;display:flex;align-items:center;justify-content:center;color:#ef4444;flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Total Cost</div>
        <div style="font-size:1.4rem;font-weight:700;color:var(--text);margin:2px 0">฿ 8.21M</div>
        <div style="font-size:.7rem;color:var(--text-2)"><span style="color:#10b981;font-weight:600">↓ 8.3%</span> จากปีที่แล้ว (฿ 8.95M)</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:48px;height:48px;border-radius:12px;background:#e0e7ff;display:flex;align-items:center;justify-content:center;color:#6366f1;flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Budget Used</div>
        <div style="font-size:1.4rem;font-weight:700;color:var(--text);margin:2px 0">68%</div>
        <div style="font-size:.7rem;color:var(--text-2)"><span style="color:#10b981;font-weight:600">↓ 4.5%</span> จากปีที่แล้ว (72%)</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:48px;height:48px;border-radius:12px;background:#fef3c7;display:flex;align-items:center;justify-content:center;color:#f59e0b;flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Over Budget Projects</div>
        <div style="font-size:1.4rem;font-weight:700;color:var(--text);margin:2px 0">3 <span style="font-size:1rem">โครงการ</span></div>
        <div style="font-size:.7rem;color:var(--text-2)"><span style="color:#ef4444;font-weight:600">↑ 1 โครงการ</span> จากปีที่แล้ว</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:48px;height:48px;border-radius:12px;background:#d1fae5;display:flex;align-items:center;justify-content:center;color:#10b981;flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 10h6"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Pending PO</div>
        <div style="font-size:1.4rem;font-weight:700;color:var(--text);margin:2px 0">฿ 2.45M</div>
        <div style="font-size:.7rem;color:var(--text-2)"><span style="color:#10b981;font-weight:600">↓ 8.3%</span> จากปีที่แล้ว (฿ 8.95M)</div>
      </div>
    </div>
  </div>

  <!-- Charts Row -->
  <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:.95rem;font-weight:700">Cost by Project</div>
        <div style="font-size:.7rem;color:var(--text-3)">(บาท)</div>
      </div>
      <div style="flex:1;min-height:280px;width:100%"><canvas id="costByProjectChart"></canvas></div>
    </div>
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:.95rem;font-weight:700">Cost Trend</div>
        <div style="font-size:.7rem;color:var(--text-3)">(บาท)</div>
      </div>
      <div style="flex:1;min-height:280px;width:100%"><canvas id="costTrendChart"></canvas></div>
    </div>
  </div>

  <!-- Bottom Row -->
  <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:.95rem;font-weight:700">Cost Summary by Project</div>
        <div style="font-size:.7rem;color:var(--text-3)">(บาท)</div>
      </div>
      <div style="overflow-x:auto;flex:1">
        <table style="width:100%;border-collapse:collapse;font-size:.8rem;text-align:left">
          <thead>
            <tr style="color:var(--text-3);border-bottom:1px solid var(--border)">
              <th style="padding:10px 8px;font-weight:600">โครงการ</th>
              <th style="padding:10px 8px;font-weight:600;text-align:right">งบประมาณ</th>
              <th style="padding:10px 8px;font-weight:600;text-align:right">ค่าใช้จ่ายจริง</th>
              <th style="padding:10px 8px;font-weight:600;text-align:right">ใช้ไป (%)</th>
              <th style="padding:10px 8px;font-weight:600;text-align:right">คงเหลือ</th>
              <th style="padding:10px 8px;font-weight:600;text-align:center">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            ${tblData.map(r => `
            <tr style="border-bottom:1px solid var(--border)">
              <td style="padding:12px 8px;font-weight:600;color:var(--text-2)">${r.p}</td>
              <td style="padding:12px 8px;text-align:right;color:var(--text-2)">${r.b}</td>
              <td style="padding:12px 8px;text-align:right;color:var(--text-2)">${r.c}</td>
              <td style="padding:12px 8px;text-align:right;color:var(--text-2)">${r.u}</td>
              <td style="padding:12px 8px;text-align:right;color:var(--text-2)">${r.r}</td>
              <td style="padding:12px 8px;text-align:center"><div style="display:inline-flex;align-items:center;gap:6px;font-size:.7rem;color:var(--text-3)"><div style="width:6px;height:6px;border-radius:50%;background:${r.sc}"></div>${r.s}</div></td>
            </tr>
            `).join('')}
            <tr style="font-weight:700">
              <td style="padding:12px 8px">รวมทั้งหมด</td>
              <td style="padding:12px 8px;text-align:right">10,500,000</td>
              <td style="padding:12px 8px;text-align:right">8,430,000</td>
              <td style="padding:12px 8px;text-align:right">80%</td>
              <td style="padding:12px 8px;text-align:right">-2,070,000</td>
              <td style="padding:12px 8px"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:.95rem;font-weight:700">Cost by Category</div>
        <div style="font-size:.7rem;color:var(--text-3)">(บาท)</div>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;min-height:240px">
        <canvas id="costCategoryChart"></canvas>
      </div>
      <div style="text-align:right;margin-top:12px;padding-right:8px">
        <a href="#" style="color:var(--primary);text-decoration:none;font-size:.75rem;font-weight:500">ดูรายละเอียดทั้งหมด ></a>
      </div>
    </div>
  </div>`;
  }

  // ---------- PROJECT PROFITABILITY ----------
  window.pageProjectProfitability = function() {
    setTimeout(initProfitabilityCharts, 100);

    const tblData = [
      { p: 'DIB-Solar Farm', r: '6,200,000', c: '3,750,000', gp: '2,450,000', gm: '39.6%', np: '2,000,000', nm: '32.3%' },
      { p: 'DIB-Warehouse', r: '4,900,000', c: '3,175,000', gp: '1,725,000', gm: '35.2%', np: '1,350,000', nm: '27.6%' },
      { p: 'DIB-Office Building', r: '2,200,000', c: '1,650,000', gp: '550,000', gm: '25.0%', np: '420,000', nm: '19.1%' },
      { p: 'DIB-Retrofit', r: '1,600,000', c: '1,000,000', gp: '600,000', gm: '37.5%', np: '480,000', nm: '30.0%' },
      { p: 'DIB-Data Center', r: '1,000,000', c: '670,000', gp: '330,000', gm: '33.3%', np: '250,000', nm: '25.0%' },
      { p: 'DIB-Other', r: '900,000', c: '390,000', gp: '510,000', gm: '45.7%', np: '330,000', nm: '36.7%' },
    ];

    return `
  <div style="display:flex;justify-content:flex-end;gap:12px;margin-bottom:18px">
    ${renderDateFilter('initProfitabilityCharts()')}
    <button class="btn" style="background:rgba(99,102,241,0.08);color:#6366f1;border:1px solid rgba(99,102,241,0.2);display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Export
    </button>
  </div>

  <!-- KPIs Row -->
  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:18px">
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6;flex-shrink:0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
      </div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">Total Revenue</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">฿ 16.80M</div>
      </div>
    </div>
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#10b981;flex-shrink:0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M17 2H7v5h10V2z"/></svg>
      </div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">Total Cost</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">฿ 8.21M</div>
      </div>
    </div>
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#fffbeb;display:flex;align-items:center;justify-content:center;color:#f59e0b;flex-shrink:0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">Gross Profit</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">฿ 8.59M</div>
      </div>
    </div>
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#f5f3ff;display:flex;align-items:center;justify-content:center;color:#8b5cf6;flex-shrink:0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">GP Margin</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">51.1%</div>
      </div>
    </div>
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6;flex-shrink:0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">Net Profit</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">฿ 4.24M</div>
      </div>
    </div>
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#10b981;flex-shrink:0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">Net Margin</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">25.2%</div>
      </div>
    </div>
  </div>

  <!-- Row 2 -->
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:16px">Profitability by Project</div>
      <div style="flex:1;min-height:300px;width:100%"><canvas id="profProjectChart"></canvas></div>
    </div>
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:16px">Profit Margin by Project</div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;min-height:300px">
        <canvas id="profMarginDonut"></canvas>
      </div>
    </div>
  </div>

  <!-- Row 3 -->
  <div style="display:grid;grid-template-columns:2.1fr 1fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:16px">Profitability Summary</div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.7rem;text-align:left">
          <thead>
            <tr style="color:var(--text-3);border-bottom:1px solid var(--border)">
              <th style="padding:8px 4px;font-weight:600">โครงการ</th>
              <th style="padding:8px 4px;font-weight:600;text-align:right">Revenue</th>
              <th style="padding:8px 4px;font-weight:600;text-align:right">Cost</th>
              <th style="padding:8px 4px;font-weight:600;text-align:right">Gross Profit</th>
              <th style="padding:8px 4px;font-weight:600;text-align:right">GM (%)</th>
              <th style="padding:8px 4px;font-weight:600;text-align:right">Net Profit</th>
              <th style="padding:8px 4px;font-weight:600;text-align:right">NM (%)</th>
            </tr>
          </thead>
          <tbody>
            ${tblData.map(r => `
            <tr style="border-bottom:1px solid var(--border)">
              <td style="padding:10px 4px;font-weight:600;color:var(--text-2)">${r.p}</td>
              <td style="padding:10px 4px;text-align:right;color:var(--text-2)">${r.r}</td>
              <td style="padding:10px 4px;text-align:right;color:var(--text-2)">${r.c}</td>
              <td style="padding:10px 4px;text-align:right;color:var(--text-2)">${r.gp}</td>
              <td style="padding:10px 4px;text-align:right;color:var(--text-2)">${r.gm}</td>
              <td style="padding:10px 4px;text-align:right;color:var(--text-2)">${r.np}</td>
              <td style="padding:10px 4px;text-align:right;color:var(--text-2)">${r.nm}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:16px">Profitability Trend</div>
      <div style="flex:1;min-height:260px;width:100%"><canvas id="profTrendChart"></canvas></div>
    </div>
  </div>`;
  }

  window.renderCostTableRows = function(projects) {
    return projects.map(p => {
      const gpPct = p.rev > 0 ? (p.gp / p.rev * 100) : 0;
      const gpColor = p.gp < 0 ? 'var(--danger)' : (gpPct < 30 ? 'var(--warn)' : 'var(--accent)');
      const healthStatus = p.gp < 0 ? 'Critical' : (gpPct < 20 ? 'Risk' : (gpPct < 40 ? 'Fair' : 'Healthy'));
      const healthBadge = p.gp < 0 ? 'badge-red' : (gpPct < 20 ? 'badge-red' : (gpPct < 40 ? 'badge-yellow' : 'badge-green'));

      return `
    <tr>
      <td>
        <div style="font-weight:600">${p.name}</div>
        <div style="font-size:.72rem; color:var(--text-3)">ID: ${p.id || '-'}</div>
      </td>
      <td><span class="badge badge-gray">${p.size || '-'}</span></td>
      <td>฿${fmt(p.total)}</td>
      <td>฿${fmt(p.rev)}</td>
      <td><strong style="color:${gpColor}">฿${fmt(p.gp)}</strong></td>
      <td>
        <div style="display:flex; align-items:center; gap:8px; min-width:120px">
          <div class="progress-bar" style="flex:1; height:6px"><div class="progress-fill" style="width:${Math.max(0, Math.min(100, gpPct))}%; background:${gpColor}"></div></div>
          <span style="font-size:.8rem; font-weight:600">${gpPct.toFixed(1)}%</span>
        </div>
      </td>
      <td><span class="badge ${healthBadge}">${healthStatus}</span></td>
    </tr>`;
    }).join('');
  }

  window.initCostCharts = function() {
    if (typeof Chart === 'undefined') return;
    console.log("Cost: Initializing Charts...");

    const ctxByProj = document.getElementById('costByProjectChart');
    const ctxTrend = document.getElementById('costTrendChart');
    const ctxCat = document.getElementById('costCategoryChart');

    if (!ctxByProj || !ctxTrend || !ctxCat) return;

    if (Chart.getChart(ctxByProj)) Chart.getChart(ctxByProj).destroy();
    if (Chart.getChart(ctxTrend)) Chart.getChart(ctxTrend).destroy();
    if (Chart.getChart(ctxCat)) Chart.getChart(ctxCat).destroy();

    const projLabels = ['DIB-Solar Farm', 'DIB-Warehouse', 'DIB-Office Building', 'DIB-Retrofit', 'DIB-Data Center', 'DIB-Other'];
    const projData = [2.45, 1.63, 1.25, 0.95, 0.75, 0.18];

    new Chart(ctxByProj, {
      type: 'bar',
      data: {
        labels: projLabels,
        datasets: [{
          data: projData,
          backgroundColor: '#2563eb',
          borderRadius: 4,
          barPercentage: 0.5
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: '#f3f4f6' }, border: { display: false } },
          y: { grid: { display: false }, border: { display: false } }
        }
      }
    });

    const lbs = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const actData = [1.8, 2.8, 3.8, 3.1, 4.2, 5.2, 5.5, 6.5, 6.9, 8.0, 8.2, 8.8];
    const budData = [1.6, 2.0, 2.4, 2.5, 2.8, 3.2, 3.8, 4.4, 4.8, 5.8, 6.2, 6.4];

    new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: lbs,
        datasets: [
          { label: 'Actual', data: actData, borderColor: '#6366f1', borderWidth: 2, tension: 0.4 },
          { label: 'Budget', data: budData, borderColor: '#a5b4fc', borderWidth: 2, borderDash: [6, 4], tension: 0.4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { usePointStyle: true, pointStyle: 'line', boxWidth: 30 } } },
        scales: {
          y: { grid: { color: '#f3f4f6' }, border: { display: false } },
          x: { grid: { display: false }, border: { display: false } }
        }
      }
    });

    new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: ['Direct Cost', 'Indirect Cost', 'Labor Cost', 'Other Cost'],
        datasets: [{
          data: [4.56, 2.35, 1.05, 0.25],
          backgroundColor: ['#6366f1', '#818cf8', '#93c5fd', '#8ecead']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%'
      }
    });
  }

  // ---------- PROCUREMENT ----------
  window.pageProcurement = function() {
    setTimeout(initProcurementCharts, 100);

    const tblData = [
      { po: 'PO-6805-0123', pr: 'PR-6805-0458', v: 'บจก. สยามวัสดุก่อสร้าง', p: 'DIB-Solar Farm', date: '15 พ.ค. 2568', dlv: '30 พ.ค. 2568', val: '1,250,000', s: 'Completed', sc: '#10b981', r: '100%', rc: '#10b981' },
      { po: 'PO-6805-0122', pr: 'PR-6805-0455', v: 'บจก. พาวเวอร์เทค', p: 'DIB-Warehouse', date: '14 พ.ค. 2568', dlv: '28 พ.ค. 2568', val: '850,000', s: 'In Progress', sc: '#3b82f6', r: '60%', rc: '#3b82f6' },
      { po: 'PO-6805-0121', pr: 'PR-6805-0454', v: 'บจก. อินฟราเทค ซิสเต็ม', p: 'DIB-Office Building', date: '13 พ.ค. 2568', dlv: '27 พ.ค. 2568', val: '2,350,000', s: 'In Progress', sc: '#3b82f6', r: '40%', rc: '#3b82f6' },
      { po: 'PO-6805-0120', pr: 'PR-6805-0453', v: 'บจก. โกลบอลเน็ตเวิร์ค', p: 'DIB-Retrofit', date: '12 พ.ค. 2568', dlv: '26 พ.ค. 2568', val: '1,120,000', s: 'Partially Received', sc: '#f59e0b', r: '80%', rc: '#f59e0b' },
      { po: 'PO-6805-0119', pr: 'PR-6805-0452', v: 'บจก. ไทยมอลล์ ซัพพลาย', p: 'DIB-Data Center', date: '9 พ.ค. 2568', dlv: '20 พ.ค. 2568', val: '3,680,000', s: 'Pending', sc: '#6366f1', r: '0%', rc: '#94a3b8' },
    ];

    return `
  <!-- Topbar Actions -->
  <div style="display:flex;justify-content:flex-end;gap:12px;margin-bottom:18px">
    ${renderDateFilter('initProcurementCharts()')}
    <button class="btn" style="background:rgba(99,102,241,0.08);color:#6366f1;border:1px solid rgba(99,102,241,0.2);display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      สร้าง PR
    </button>
  </div>

  <!-- KPIs Row -->
  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:18px">
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">Total PR</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">312</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 15.3% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (271)</span></div>
      </div>
    </div>
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#10b981;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">Total PO</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">287</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 15.3% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (271)</span></div>
      </div>
    </div>
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#f5f3ff;display:flex;align-items:center;justify-content:center;color:#8b5cf6;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">Total PO Value</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">฿ 45.62M</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 18.4% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (฿ 38.56M)</span></div>
      </div>
    </div>
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#10b981;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">PO Closed</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">198</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 15.3% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (271)</span></div>
      </div>
    </div>
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#fff7ed;display:flex;align-items:center;justify-content:center;color:#f97316;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polyline points="16 8 20 8 23 11 23 16 16 16"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">On-Time Delivery</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">92.5%</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 15.3% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (271)</span></div>
      </div>
    </div>
    <div class="card" style="padding:14px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#fef2f2;display:flex;align-items:center;justify-content:center;color:#ef4444;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">Avg. PO Cycle Time</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:2px 0">5.2 วัน</div>
        <div style="font-size:.6rem;color:#ef4444;font-weight:600">▼ -1.3 วัน <span style="color:var(--text-3);font-weight:400">จากปีก่อน (6.5 วัน)</span></div>
      </div>
    </div>
  </div>

  <!-- Row 2 Charts -->
  <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:16px">PO Value by Month (฿)</div>
      <div style="flex:1;min-height:240px"><canvas id="poValueMonthChart"></canvas></div>
    </div>
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:16px">PO Value by Status (฿)</div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;min-height:240px">
        <canvas id="poStatusDonut"></canvas>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:16px">PR to PO Conversion</div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:10px">
        <div style="width:100%;max-width:180px;background:#f8fafc;border-radius:10px;padding:12px;text-align:center;position:relative;margin-bottom:25px">
           <div style="font-size:.7rem;color:var(--text-3);margin-bottom:2px">PR Created</div>
           <div style="font-size:1.3rem;font-weight:700">312</div>
           <div style="position:absolute;bottom:-25px;left:50%;transform:translateX(-50%);border-left:10px solid transparent;border-right:10px solid transparent;border-top:15px solid #f1f5f9"></div>
        </div>
        <div style="width:85%;max-width:150px;background:#f0fdf4;border-radius:10px;padding:12px;text-align:center;position:relative;margin-bottom:20px">
           <div style="font-size:.7rem;color:var(--text-3);margin-bottom:2px">PO Created</div>
           <div style="font-size:1.3rem;font-weight:700;color:#10b981">287</div>
        </div>
        <div style="text-align:center;margin-top:5px">
           <div style="font-size:.7rem;color:var(--text-3)">Conversion Rate</div>
           <div style="font-size:1.1rem;font-weight:700">92.0%</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Row 3 Table & Right Sidebar -->
  <div style="display:grid;grid-template-columns:2.5fr 1fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:16px">Latest Purchase Orders</div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.7rem;text-align:left">
          <thead>
            <tr style="color:var(--text-3);border-bottom:1px solid var(--border)">
              <th style="padding:10px 4px;font-weight:600">PO No.</th>
              <th style="padding:10px 4px;font-weight:600">PR No.</th>
              <th style="padding:10px 4px;font-weight:600">ผู้ขาย</th>
              <th style="padding:10px 4px;font-weight:600">โครงการ</th>
              <th style="padding:10px 4px;font-weight:600">PO Date</th>
              <th style="padding:10px 4px;font-weight:600;text-align:right">มูลค่า PO (฿)</th>
              <th style="padding:10px 4px;font-weight:600;text-align:center">สถานะ</th>
              <th style="padding:10px 4px;font-weight:600">การรับสินค้า</th>
              <th style="padding:10px 4px;text-align:center">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${tblData.map(r => `
            <tr style="border-bottom:1px solid var(--border)">
              <td style="padding:12px 4px;font-weight:600;color:var(--text-2)">${r.po}</td>
              <td style="padding:12px 4px;color:var(--text-3)">${r.pr}</td>
              <td style="padding:12px 4px;color:var(--text-2)">${r.v}</td>
              <td style="padding:12px 4px;color:var(--text-2)">${r.p}</td>
              <td style="padding:12px 4px;color:var(--text-3)">${r.date}</td>
              <td style="padding:12px 4px;text-align:right;font-weight:600">${r.val}</td>
              <td style="padding:12px 4px;text-align:center"><span style="background:${r.sc}15;color:${r.sc};padding:4px 8px;border-radius:12px;font-size:.65rem;font-weight:600">${r.s}</span></td>
              <td style="padding:12px 4px">
                <div style="display:flex;align-items:center;gap:6px">
                  <div style="flex:1;height:6px;background:#f1f5f9;border-radius:10px;overflow:hidden;min-width:60px"><div style="width:${r.r};height:100%;background:${r.rc}"></div></div>
                  <span style="font-size:.65rem;color:var(--text-3);min-width:25px">${r.r}</span>
                </div>
              </td>
              <td style="padding:12px 4px;text-align:center">
                <div style="display:flex;justify-content:center;gap:4px">
                   <button style="padding:4px;background:none;border:none;color:var(--text-3);cursor:pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                   <button style="padding:4px;background:none;border:none;color:var(--text-3);cursor:pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="text-align:center;margin-top:16px"><a href="#" style="color:var(--primary);text-decoration:none;font-size:.75rem;font-weight:600">ดูทั้งหมด ❯</a></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card" style="padding:16px">
        <div style="font-size:.8rem;font-weight:700;margin-bottom:16px">Top 5 Suppliers by PO Value</div>
        <div style="height:200px"><canvas id="topSuppliersChart"></canvas></div>
      </div>
      <div class="card" style="padding:16px">
        <div style="font-size:.8rem;font-weight:700;margin-bottom:16px">PO Delivery Performance</div>
        <div style="height:140px;position:relative"><canvas id="poDeliveryGauge"></canvas></div>
        <div style="display:flex;justify-content:space-around;margin-top:10px;font-size:.65rem">
           <div style="display:flex;align-items:center;gap:4px"><div style="width:8px;height:8px;border-radius:50%;background:#10b981"></div>On Time <span style="font-weight:700">92.5%</span></div>
           <div style="display:flex;align-items:center;gap:4px"><div style="width:8px;height:8px;border-radius:50%;background:#f59e0b"></div>Late <span style="font-weight:700">6.2%</span></div>
           <div style="display:flex;align-items:center;gap:4px"><div style="width:8px;height:8px;border-radius:50%;background:#ef4444"></div>Overdue <span style="font-weight:700">1.3%</span></div>
        </div>
      </div>
      <div class="card" style="padding:16px">
        <div style="font-size:.8rem;font-weight:700;margin-bottom:16px">Quick Actions</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
           <button style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;background:#f8fafc;border:none;border-radius:10px;cursor:pointer;color:var(--text-2)">
             <div style="width:32px;height:32px;border-radius:8px;background:#eff6ff;color:#3b82f6;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg></div>
             <span style="font-size:.7rem;font-weight:600">สร้าง PR</span>
           </button>
           <button style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;background:#f8fafc;border:none;border-radius:10px;cursor:pointer;color:var(--text-2)">
             <div style="width:32px;height:32px;border-radius:8px;background:#f0fdf4;color:#10b981;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg></div>
             <span style="font-size:.7rem;font-weight:600">สร้าง PO</span>
           </button>
           <button style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;background:#f8fafc;border:none;border-radius:10px;cursor:pointer;color:var(--text-2)">
             <div style="width:32px;height:32px;border-radius:8px;background:#fffbeb;color:#f59e0b;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
             <span style="font-size:.7rem;font-weight:600">อนุมัติ</span>
           </button>
           <button style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;background:#f8fafc;border:none;border-radius:10px;cursor:pointer;color:var(--text-2)">
             <div style="width:32px;height:32px;border-radius:8px;background:#f5f3ff;color:#8b5cf6;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
             <span style="font-size:.7rem;font-weight:600">รายงาน</span>
           </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Row: Procurement Summary -->
  <div class="card" style="padding:20px;background:#f8fafc;border:none">
    <div style="font-size:.9rem;font-weight:700;margin-bottom:16px">Procurement Summary</div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:20px">
      <div>
        <div style="font-size:.7rem;color:var(--text-3);margin-bottom:4px">Total PR Value</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text)">฿ 52.18M</div>
        <div style="font-size:.6rem;color:#10b981;margin-top:2px">?-? 17.2%</div>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);margin-bottom:4px">Total PO Value</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text)">฿ 45.62M</div>
        <div style="font-size:.6rem;color:#10b981;margin-top:2px">?-? 18.4%</div>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);margin-bottom:4px">Total Received</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text)">฿ 38.26M</div>
        <div style="font-size:.6rem;color:#10b981;margin-top:2px">?-? 16.8%</div>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);margin-bottom:4px">Total Paid</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text)">฿ 32.18M</div>
        <div style="font-size:.6rem;color:#10b981;margin-top:2px">?-? 15.6%</div>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);margin-bottom:4px">Total Outstanding</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text)">฿ 13.44M</div>
        <div style="font-size:.6rem;color:#10b981;margin-top:2px">?-? 21.3%</div>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);margin-bottom:4px">Avg. Savings</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text)">฿ 2.45M (5.3%)</div>
        <div style="font-size:.6rem;color:#10b981;margin-top:2px">?-? 8.6%</div>
      </div>
    </div>
  </div>
  `;
  }

  // ---------- SALE PIPELINE ----------
  window.pageSalePipeline = function() {
    setTimeout(initSalePipelineCharts, 100);

    const tblData = [
      { p: 'DIB-Solar Farm', c: 'บจก. พลังงานสีเขียว', s: 'Proposal', sc: '#10b981', val: '12,500,000', prob: '60%', wval: '7,500,000', d: '30 มิ.ย. 2568', o: 'Jirawat P.' },
      { p: 'DIB-Warehouse', c: 'บจก. โลจิสติกส์ อินโนเวท', s: 'Negotiation', sc: '#f59e0b', val: '9,800,000', prob: '70%', wval: '6,860,000', d: '15 ก.ค. 2568', o: 'Nattapol K.' },
      { p: 'DIB-Office Building', c: 'บจก. ดีไซน์บิลด์-ดีเวลลอปเม้นท์', s: 'Proposal', sc: '#10b981', val: '8,750,000', prob: '50%', wval: '4,375,000', d: '31 ส.ค. 2568', o: 'Kannika S.' },
      { p: 'DIB-Data Center', c: 'บจก. คลาวด์เทค โซลูชัน', s: 'Qualified', sc: '#3b82f6', val: '7,600,000', prob: '40%', wval: '3,040,000', d: '30 ก.ย. 2568', o: 'Jirawat P.' },
      { p: 'DIB-Retrofit', c: 'บจก. สร้างสรรค์อาคาร', s: 'Lead', sc: '#6366f1', val: '6,300,000', prob: '20%', wval: '1,260,000', d: '31 ต.ค. 2568', o: 'Nattapol K.' },
    ];

    return `
  <!-- Topbar Actions -->
  <div style="display:flex;justify-content:flex-end;gap:12px;margin-bottom:18px">
    ${renderDateFilter('initSalePipelineCharts()')}
    <button class="btn" style="background:rgba(99,102,241,0.08);color:#6366f1;border:1px solid rgba(99,102,241,0.2);display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Export
    </button>
  </div>

  <!-- KPIs Row -->
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg></div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Total Pipeline Value</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text);margin:2px 0">฿ 85.36M</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 18.4% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (฿ 38.56M)</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#10b981;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Total Opportunities</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text);margin:2px 0">48</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 15.3% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (271)</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:#fffbeb;display:flex;align-items:center;justify-content:center;color:#f59e0b;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 12 12 8"/></svg></div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Weighted Pipeline</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text);margin:2px 0">฿ 32.68M</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 18.4% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (฿ 38.56M)</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20v-6M6 20V10M18 20V4"/></svg></div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Win Rate</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text);margin:2px 0">28.6%</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 15.3% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (271)</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:#fef2f2;display:flex;align-items:center;justify-content:center;color:#ef4444;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Avg. Sales Cycle</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text);margin:2px 0">78 วัน</div>
        <div style="font-size:.6rem;color:#ef4444;font-weight:600">▼ -1.3 วัน <span style="color:var(--text-3);font-weight:400">จากปีก่อน (6.5 วัน)</span></div>
      </div>
    </div>
  </div>

  <!-- Row 2 Charts -->
  <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:20px">Pipeline by Stage</div>
      <div style="display:flex;gap:20px;align-items:center;flex:1">
        <!-- Funnel Visualization -->
        <div style="display:flex;flex-direction:column;gap:4px;width:240px;align-items:center">
          <div style="width:100%;height:40px;background:#e0e7ff;clip-path:polygon(0 0, 100% 0, 90% 100%, 10% 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#4338ca">
            <span style="font-size:.65rem;font-weight:600">1. Lead</span>
            <span style="font-size:.8rem;font-weight:700">฿ 22.35M (26.2%)</span>
          </div>
          <div style="width:90%;height:40px;background:#dbeafe;clip-path:polygon(0 0, 100% 0, 88% 100%, 12% 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#1d4ed8">
            <span style="font-size:.65rem;font-weight:600">2. Qualified</span>
            <span style="font-size:.8rem;font-weight:700">฿ 18.42M (21.6%)</span>
          </div>
          <div style="width:80%;height:40px;background:#dcfce7;clip-path:polygon(0 0, 100% 0, 85% 100%, 15% 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#15803d">
            <span style="font-size:.65rem;font-weight:600">3. Proposal</span>
            <span style="font-size:.8rem;font-weight:700">฿ 16.87M (19.8%)</span>
          </div>
          <div style="width:70%;height:40px;background:#fef3c7;clip-path:polygon(0 0, 100% 0, 82% 100%, 18% 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#b45309">
            <span style="font-size:.65rem;font-weight:600">4. Negotiation</span>
            <span style="font-size:.8rem;font-weight:700">฿ 12.54M (14.7%)</span>
          </div>
          <div style="width:60%;height:40px;background:#f0fdf4;clip-path:polygon(0 0, 100% 0, 100% 100%, 0 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#16a34a">
            <span style="font-size:.65rem;font-weight:600">5. Closed Won</span>
            <span style="font-size:.8rem;font-weight:700">฿ 15.18M (17.8%)</span>
          </div>
        </div>
        <!-- Funnel Table -->
        <div style="flex:1">
          <table style="width:100%;font-size:.7rem;border-collapse:collapse">
            <thead>
              <tr style="color:var(--text-3);border-bottom:1px solid var(--border)">
                <th style="padding:6px 4px;text-align:left;font-weight:600">Stage</th>
                <th style="padding:6px 4px;text-align:right;font-weight:600">Value (฿)</th>
                <th style="padding:6px 4px;text-align:right;font-weight:600">%</th>
                <th style="padding:6px 4px;text-align:right;font-weight:600">Opportunities</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding:8px 4px">1. Lead</td><td style="padding:8px 4px;text-align:right">22,350,000</td><td style="padding:8px 4px;text-align:right">26.2%</td><td style="padding:8px 4px;text-align:right">18</td></tr>
              <tr><td style="padding:8px 4px">2. Qualified</td><td style="padding:8px 4px;text-align:right">18,420,000</td><td style="padding:8px 4px;text-align:right">21.6%</td><td style="padding:8px 4px;text-align:right">12</td></tr>
              <tr><td style="padding:8px 4px">3. Proposal</td><td style="padding:8px 4px;text-align:right">16,870,000</td><td style="padding:8px 4px;text-align:right">19.8%</td><td style="padding:8px 4px;text-align:right">9</td></tr>
              <tr><td style="padding:8px 4px">4. Negotiation</td><td style="padding:8px 4px;text-align:right">12,540,000</td><td style="padding:8px 4px;text-align:right">14.7%</td><td style="padding:8px 4px;text-align:right">6</td></tr>
              <tr><td style="padding:8px 4px">5. Closed Won</td><td style="padding:8px 4px;text-align:right">15,180,000</td><td style="padding:8px 4px;text-align:right">17.8%</td><td style="padding:8px 4px;text-align:right">3</td></tr>
              <tr style="font-weight:700;border-top:1px solid var(--border)"><td style="padding:8px 4px">รวมทั้งหมด</td><td style="padding:8px 4px;text-align:right">85,360,000</td><td style="padding:8px 4px;text-align:right">100%</td><td style="padding:8px 4px;text-align:right">48</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:20px">Pipeline Value Trend</div>
      <div style="flex:1;min-height:240px;width:100%"><canvas id="pipelineTrendChart"></canvas></div>
    </div>
  </div>

  <!-- Row 3 Details & Industry -->
  <div style="display:grid;grid-template-columns:2.5fr 1.5fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:16px">Pipeline Details</div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.7rem;text-align:left">
          <thead>
            <tr style="color:var(--text-3);border-bottom:1px solid var(--border)">
              <th style="padding:10px 4px;font-weight:600">Project / Opportunity</th>
              <th style="padding:10px 4px;font-weight:600">ลูกค้า</th>
              <th style="padding:10px 4px;font-weight:600">Stage</th>
              <th style="padding:10px 4px;font-weight:600;text-align:right">Value (฿)</th>
              <th style="padding:10px 4px;font-weight:600;text-align:right">Probability</th>
              <th style="padding:10px 4px;font-weight:600;text-align:right">Weighted Value (฿)</th>
              <th style="padding:10px 4px;font-weight:600">Expected Close Date</th>
              <th style="padding:10px 4px;font-weight:600">Owner</th>
              <th style="padding:10px 4px"></th>
            </tr>
          </thead>
          <tbody>
            ${tblData.map(r => `
            <tr style="border-bottom:1px solid var(--border)">
              <td style="padding:12px 4px;font-weight:600;color:var(--text-2)">${r.p}</td>
              <td style="padding:12px 4px;color:var(--text-3)">${r.c}</td>
              <td style="padding:12px 4px"><span style="background:${r.sc}15;color:${r.sc};padding:4px 8px;border-radius:12px;font-size:.65rem;font-weight:600">${r.s}</span></td>
              <td style="padding:12px 4px;text-align:right;font-weight:600;color:var(--text-2)">${r.val}</td>
              <td style="padding:12px 4px;text-align:right;color:var(--text-3)">${r.prob}</td>
              <td style="padding:12px 4px;text-align:right;font-weight:600;color:var(--text-2)">${r.wval}</td>
              <td style="padding:12px 4px;color:var(--text-3)">${r.d}</td>
              <td style="padding:12px 4px;color:var(--text-2)">${r.o}</td>
              <td style="padding:12px 4px;text-align:center"><button style="background:none;border:none;cursor:pointer;color:var(--text-3)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
        <div style="text-align:center;margin-top:16px"><a href="#" style="font-size:.75rem;color:var(--primary);text-decoration:none;font-weight:600">ดูทั้งหมด</a></div>
    </div>
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:20px">Pipeline by Industry</div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;min-height:280px">
        <canvas id="pipelineIndustryChart"></canvas>
      </div>
    </div>
  </div>

  <!-- Row 4 Owners, Conversion, Milestones -->
  <div style="display:grid;grid-template-columns:1.2fr 1fr 1.2fr;gap:16px">
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:20px">Top Pipeline Owners</div>
      <div style="flex:1;min-height:200px"><canvas id="topOwnersChart"></canvas></div>
    </div>
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:20px">Pipeline Conversion Rate</div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative;min-height:200px">
        <div style="width:100%;height:140px"><canvas id="conversionGaugeChart"></canvas></div>
        <div style="text-align:center;margin-top:-20px">
          <div style="font-size:1.6rem;font-weight:700;color:var(--text)">28.6%</div>
          <div style="font-size:.7rem;color:var(--text-3)">Win Rate</div>
          <div style="font-size:.65rem;color:#10b981;font-weight:600;margin-top:4px">▲ 3.2% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (25.4%)</span></div>
        </div>
      </div>
    </div>
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:20px">Upcoming Milestones</div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid #f1f5f9">
           <div style="width:36px;height:36px;border-radius:8px;background:#eff6ff;color:#3b82f6;display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
           <div style="flex:1">
             <div style="font-size:.75rem;font-weight:700;color:var(--text-2)">DIB-Warehouse - เสนอราคาขั้นสุดท้าย</div>
             <div style="font-size:.65rem;color:var(--text-3)">Negotiation Stage - Nattapol K.</div>
           </div>
           <div style="font-size:.7rem;font-weight:700;color:#ef4444">15 พ.ค. 2568</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid #f1f5f9">
           <div style="width:36px;height:36px;border-radius:8px;background:#f0fdf4;color:#10b981;display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
           <div style="flex:1">
             <div style="font-size:.75rem;font-weight:700;color:var(--text-2)">DIB-Solar Farm - ประชุมสรุปเงื่อนไขสัญญา</div>
             <div style="font-size:.65rem;color:var(--text-3)">Proposal Stage - Jirawat P.</div>
           </div>
           <div style="font-size:.7rem;font-weight:700;color:var(--text-2)">20 พ.ค. 2568</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
           <div style="width:36px;height:36px;border-radius:8px;background:#fffbeb;color:#f59e0b;display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
           <div style="flex:1">
             <div style="font-size:.75rem;font-weight:700;color:var(--text-2)">DIB-Office Building - นำเสนอข้อมูลลูกค้า</div>
             <div style="font-size:.65rem;color:var(--text-3)">Proposal Stage - Kannika S.</div>
           </div>
           <div style="font-size:.7rem;font-weight:700;color:var(--text-2)">28 พ.ค. 2568</div>
        </div>
      </div>
    </div>
  </div>
  `;
  }

  // ---------- COST ESTIMATE ----------
  window.pageCostEstimate = function() {
    setTimeout(initCostEstimateCharts, 100);

    const estimates = DATA.costEstimates;

    return `
  <!-- Header Actions -->
  <div class="fade-in" style="display:flex; justify-content:flex-end; align-items:center; gap:12px; margin-bottom:20px; margin-top:-10px">
    <div class="search-box" style="width:250px; background:#fff">
      <i data-lucide="search" style="width:14px; height:14px; color:var(--text-3)"></i>
      <input type="text" placeholder="ค้นหาโครงการ, งาน, รายการ..." style="font-size:.75rem">
    </div>
    <button class="btn btn-sm" style="background:#fff; border:1px solid var(--border); color:var(--text-2); display:flex; align-items:center; gap:8px; padding:8px 14px">
      <i data-lucide="filter" style="width:14px; height:14px"></i> ตัวกรอง
    </button>
    <div style="display:flex; border:1px solid var(--border); border-radius:8px; overflow:hidden; background:#fff">
      <button style="padding:8px; background:#fff; color:var(--text-3); border:none; cursor:pointer"><i data-lucide="layout-grid" style="width:14px; height:14px"></i></button>
      <button style="padding:8px; background:#f5f3ff; color:#6366f1; border:none; cursor:pointer; border-left:1px solid var(--border)"><i data-lucide="list" style="width:14px; height:14px"></i></button>
    </div>
    <button class="btn btn-primary" style="display:flex; align-items:center; gap:8px; padding:8px 16px; font-weight:600">
      <i data-lucide="plus" style="width:16px; height:16px"></i> สร้าง Cost Estimate
    </button>
  </div>

  <!-- KPIs Row -->
  <div class="fade-in" style="display:grid; grid-template-columns:repeat(5,1fr); gap:16px; margin-bottom:24px">
    <div class="stat-card" style="padding:16px; align-items:center; gap:12px; flex-direction:row">
      <div style="width:44px;height:44px;border-radius:12px;background:#f5f3ff;color:#6366f1;display:flex;align-items:center;justify-content:center"><i data-lucide="file-text" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">จำนวนทั้งหมด</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text)">42 <span style="font-size:.7rem; font-weight:400; color:var(--text-3)">รายการ</span></div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:16px; align-items:center; gap:12px; flex-direction:row">
      <div style="width:44px;height:44px;border-radius:12px;background:#f0fdf4;color:#10b981;display:flex;align-items:center;justify-content:center"><i data-lucide="file-edit" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">กำลังดำเนินการ</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text)">18 <span style="font-size:.7rem; font-weight:400; color:var(--text-3)">รายการ</span></div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:16px; align-items:center; gap:12px; flex-direction:row">
      <div style="width:44px;height:44px;border-radius:12px;background:#f5f3ff;color:#6366f1;display:flex;align-items:center;justify-content:center"><i data-lucide="check-circle" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">อนุมัติแล้ว</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text)">16 <span style="font-size:.7rem; font-weight:400; color:var(--text-3)">รายการ</span></div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:16px; align-items:center; gap:12px; flex-direction:row">
      <div style="width:44px;height:44px;border-radius:12px;background:#fff7ed;color:#f97316;display:flex;align-items:center;justify-content:center"><i data-lucide="clock" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">รออนุมัติ</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text)">6 <span style="font-size:.7rem; font-weight:400; color:var(--text-3)">รายการ</span></div>
        <div style="font-size:.6rem;color:#ef4444;font-weight:600">▼ -15.4% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:16px; align-items:center; gap:12px; flex-direction:row">
      <div style="width:44px;height:44px;border-radius:12px;background:#eff6ff;color:#3b82f6;display:flex;align-items:center;justify-content:center"><i data-lucide="wallet" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">มูลค่ารวม (ประมาณการ)</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text)">฿ 25.68M</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 18.7% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน (฿ 21.65M)</span></div>
      </div>
    </div>
  </div>

  <!-- Charts Row -->
  <div class="fade-in delay-1" style="display:grid; grid-template-columns:1.1fr 1.6fr 0.9fr; gap:20px; margin-bottom:24px">
    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
        <div style="font-size:.9rem; font-weight:700">ภาพรวมมูลค่าโดยสรุป (YTD)</div>
        <select class="select-input" style="width:90px; padding:4px 8px; font-size:.7rem"><option>ปีนี้ (YTD)</option></select>
      </div>
      <div style="display:flex; align-items:center; gap:10px">
        <div style="position:relative; width:160px; height:160px">
          <canvas id="ceValueOverviewChart"></canvas>
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center">
            <div style="font-size:1.1rem; font-weight:700">฿ 25.68M</div>
            <div style="font-size:.6rem; color:var(--text-3)">มูลค่ารวมประมาณการ</div>
          </div>
        </div>
        <div id="ceValueLegend" style="flex:1; display:grid; grid-template-columns:1fr; gap:8px"></div>
      </div>
    </div>
    <div class="card" style="padding:20px">
      <div style="font-size:.9rem; font-weight:700; margin-bottom:20px">มูลค่าประมาณการรายเดือน (YTD)</div>
      <div style="height:220px">
        <canvas id="ceMonthlyChart"></canvas>
      </div>
      <div style="display:flex; justify-content:center; gap:20px; margin-top:10px">
        <div style="display:flex; align-items:center; gap:8px"><div style="width:12px; height:12px; border-radius:3px; background:#6366f1"></div><span style="font-size:.7rem; color:var(--text-3)">มูลค่าประมาณการ</span></div>
        <div style="display:flex; align-items:center; gap:8px"><div style="width:12px; height:3px; background:#10b981"></div><span style="font-size:.7rem; color:var(--text-3)">จำนวนรายการ</span></div>
      </div>
    </div>
    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
        <div style="font-size:.9rem; font-weight:700">สถานะของรายการ</div>
        <a href="#" style="font-size:.7rem; color:var(--primary); font-weight:600; text-decoration:none">ดูทั้งหมด</a>
      </div>
      <div style="position:relative; height:160px; margin-bottom:20px">
        <canvas id="ceStatusChart"></canvas>
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center">
          <div style="font-size:1.4rem; font-weight:700">42</div>
          <div style="font-size:.65rem; color:var(--text-3)">รายการ</div>
        </div>
      </div>
      <div id="ceStatusLegend" style="display:grid; grid-template-columns:1fr; gap:8px"></div>
    </div>
  </div>

  <!-- Bottom Content Area -->
  <div style="display:grid; grid-template-columns:2.8fr 1.2fr; gap:20px">
    <!-- Left: Data Table -->
    <div class="card fade-in" style="padding:0; overflow:hidden">
      <!-- Table Filters -->
      <div style="padding:20px; border-bottom:1px solid var(--border); display:flex; gap:12px; align-items:center; flex-wrap:wrap">
        <select class="select-input" style="width:140px"><option>สถานะทั้งหมด</option></select>
        <select class="select-input" style="width:160px"><option>หมวดหมู่ทั้งหมด</option></select>
        <div class="search-box" style="flex:1; min-width:250px; background:#f8fafc">
          <i data-lucide="search" style="width:14px; height:14px; color:var(--text-3)"></i>
          <input type="text" placeholder="ค้นหารายการ, โครงการ, ลูกค้า..." id="ceSearch" oninput="filterTable('ceTable','ceSearch')">
        </div>
        <div style="position:relative; width:200px">
          <input type="text" class="select-input" style="width:100%" placeholder="ช่วงวันที่สร้าง" readonly>
          <i data-lucide="calendar" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:var(--text-3)"></i>
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table" id="ceTable">
          <thead>
            <tr>
              <th style="padding-left:20px">รหัสรายการ</th>
              <th>ชื่อรายการ</th>
              <th>โครงการ</th>
              <th>โครงการ</th>
              <th>หมวดหมู่</th>
              <th style="text-align:right">มูลค่าประมาณการ</th>
              <th>สถานะ</th>
              <th>โครงการ</th>
              <th>โครงการ</th>
              <th>ผู้รับผิดชอบ</th>
              <th style="text-align:center">การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            ${estimates.map(e => `
              <tr>
                <td style="padding-left:20px"><span style="font-size:.7rem; color:var(--text-3); font-family:monospace">${e.id}</span></td>
                <td><span style="font-weight:600; color:var(--text-2)">${e.name}</span></td>
                <td><span style="font-size:.7rem; color:var(--text-3)">${e.project}</span></td>
                <td><span style="font-size:.7rem; color:var(--text-3)">${e.customer}</span></td>
                <td><span style="font-size:.7rem; color:var(--text-3)">${e.category}</span></td>
                <td style="text-align:right; font-weight:700; color:var(--text-2)">฿ ${fmt(e.value)}</td>
                <td><span class="badge ${e.status === 'approved' ? 'badge-green' : e.status === 'inprog' ? 'badge-blue' : e.status === 'pending' ? 'badge-yellow' : 'badge-red'}">${e.status === 'approved' ? 'อนุมัติแล้ว' : e.status === 'inprog' ? 'กำลังดำเนินการ' : e.status === 'pending' ? 'รออนุมัติ' : 'ยกเลิก'}</span></td>
                <td style="font-size:.7rem; color:var(--text-3)">${e.created}</td>
                <td style="font-size:.7rem; color:var(--text-3)">${e.due}</td>
                <td><span style="font-size:.7rem; color:var(--text-2)">${e.owner}</span></td>
                <td>
                  <div style="display:flex; justify-content:center; gap:8px">
                    <button style="background:none; border:none; color:var(--text-3); cursor:pointer"><i data-lucide="eye" style="width:14px; height:14px"></i></button>
                    <button style="background:none; border:none; color:var(--text-3); cursor:pointer"><i data-lucide="edit-3" style="width:14px; height:14px"></i></button>
                    <button style="background:none; border:none; color:var(--text-3); cursor:pointer"><i data-lucide="more-vertical" style="width:14px; height:14px"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="padding:16px 20px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border-top:1px solid var(--border)">
        <div style="font-size:.75rem; color:var(--text-3)">แสดง <select style="padding:2px 4px; border:1px solid var(--border); border-radius:4px"><option>10</option></select> รายการ</div>
        <div style="display:flex; gap:8px; align-items:center">
          <button style="width:30px; height:30px; border-radius:6px; border:1px solid var(--border); background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer"><i data-lucide="chevron-left" style="width:14px; height:14px"></i></button>
          <button style="width:30px; height:30px; border-radius:6px; border:none; background:#6366f1; color:#fff; font-size:.7rem; font-weight:700">1</button>
          <button style="width:30px; height:30px; border-radius:6px; border:none; background:transparent; color:var(--text-2); font-size:.75rem">2</button>
          <button style="width:30px; height:30px; border-radius:6px; border:none; background:transparent; color:var(--text-2); font-size:.75rem">3</button>
          <button style="width:30px; height:30px; border-radius:6px; border:none; background:transparent; color:var(--text-2); font-size:.75rem">4</button>
          <button style="width:30px; height:30px; border-radius:6px; border:none; background:transparent; color:var(--text-2); font-size:.75rem">5</button>
          <span style="font-size:.7rem; color:var(--text-3)">...</span>
          <button style="width:30px; height:30px; border-radius:6px; border:none; background:transparent; color:var(--text-2); font-size:.75rem">5</button>
          <button style="width:30px; height:30px; border-radius:6px; border:1px solid var(--border); background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer"><i data-lucide="chevron-right" style="width:14px; height:14px"></i></button>
        </div>
      </div>
    </div>

    <!-- Right: Sidebar Info -->
    <div style="display:flex; flex-direction:column; gap:20px">
      <!-- Upcoming Deadlines -->
      <div class="card fade-in delay-3" style="padding:20px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
        <div style="font-size:.9rem; font-weight:700">สถานะของรายการ</div>
        <a href="#" style="font-size:.7rem; color:var(--primary); font-weight:600; text-decoration:none">ดูทั้งหมด</a>
        </div>
        <div style="display:flex; flex-direction:column; gap:16px">
          ${[
        { name: 'Electrical System Upgrade', project: 'DIB-Office Building', value: '฿ 2,950,000', day: '25', month: 'พ.ค.' },
        { name: 'Solar Carport 250kW', project: 'DIB-Solar Carport', value: '฿ 2,150,000', day: '26', month: 'พ.ค.' },
        { name: 'CCTV & Security System', project: 'DIB-Data Center', value: '฿ 980,000', day: '27', month: 'พ.ค.' }
      ].map(item => `
            <div style="display:flex; gap:12px; align-items:flex-start; padding-bottom:12px; border-bottom:1px solid #f1f5f9">
              <div style="width:44px; height:54px; background:#f8fafc; border:1px solid var(--border); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0">
                <div style="font-size:.9rem; font-weight:800; color:var(--text)">${item.day}</div>
                <div style="font-size:.55rem; font-weight:600; color:var(--text-3); text-transform:uppercase">${item.month}</div>
              </div>
              <div style="flex:1">
                <div style="font-size:.7rem; font-weight:700; color:var(--text-2); margin-bottom:2px">${item.name}</div>
                <div style="font-size:.65rem; color:var(--text-3); margin-bottom:4px">${item.project}</div>
                <div style="font-size:.65rem; color:var(--text-2)">มูลค่า: <span style="font-weight:600">${item.value}</span></div>
              </div>
              <span style="background:#fff7ed; color:#f97316; font-size:.55rem; font-weight:700; padding:2px 6px; border-radius:4px; border:1px solid rgba(249,115,22,0.1)">ใกล้ถึงกำหนด</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Recent Approvals -->
      <div class="card fade-in delay-3" style="padding:20px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
        <div style="font-size:.9rem; font-weight:700">สถานะของรายการ</div>
        <a href="#" style="font-size:.7rem; color:var(--primary); font-weight:600; text-decoration:none">ดูทั้งหมด</a>
        </div>
        <div style="display:flex; flex-direction:column; gap:16px">
          ${[
        { user: 'Nattapol K.', id: 'CE-2025-0041', date: '19 พ.ค. 2568' },
        { user: 'Kannika S.', id: 'CE-2025-0038', date: '18 พ.ค. 2568' },
        { user: 'Jirawat P.', id: 'CE-2025-0033', date: '12 พ.ค. 2568' }
      ].map(appr => `
            <div style="display:flex; gap:12px; align-items:center">
              <div style="width:32px; height:32px; border-radius:50%; background:#f0fdf4; color:#10b981; display:flex; align-items:center; justify-content:center; flex-shrink:0"><i data-lucide="check" style="width:16px; height:16px"></i></div>
              <div>
                <div style="font-size:.75rem; font-weight:600; color:var(--text-2)">อนุมัติ โดย ${appr.user}</div>
                <div style="font-size:.65rem; color:var(--text-3)">${appr.id} - ${appr.date}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
  `;
  }

  window.initCostEstimateCharts = function() {
    const ctxVal = document.getElementById('ceValueOverviewChart');
    const ctxMon = document.getElementById('ceMonthlyChart');
    const ctxStatus = document.getElementById('ceStatusChart');
    if (!ctxVal || !ctxMon || !ctxStatus) return;

    if (Chart.getChart(ctxVal)) Chart.getChart(ctxVal).destroy();
    if (Chart.getChart(ctxMon)) Chart.getChart(ctxMon).destroy();
    if (Chart.getChart(ctxStatus)) Chart.getChart(ctxStatus).destroy();

    // 1. Value Overview by Category (Donut)
    const cats = [
      { label: 'งานระบบไฟฟ้า', value: 8.75, color: '#6366f1' },
      { label: 'งานระบบโซลาร์', value: 6.45, color: '#3b82f6' },
      { label: 'งานระบบเครื่องกล', value: 4.20, color: '#f59e0b' },
      { label: 'งานก่อสร้าง', value: 3.35, color: '#10b981' },
      { label: 'งานระบบไอที', value: 1.85, color: '#ef4444' },
      { label: 'อื่นๆ', value: 1.08, color: '#94a3b8' }
    ];

    new Chart(ctxVal, {
      type: 'doughnut',
      data: {
        labels: cats.map(c => c.label),
        datasets: [{
          data: cats.map(c => c.value),
          backgroundColor: cats.map(c => c.color),
          borderWidth: 0, cutout: '75%'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, datalabels: { display: false } }
      }
    });

    const ceValueLegend = document.getElementById('ceValueLegend');
    if (ceValueLegend) {
      ceValueLegend.innerHTML = cats.map(c => `
      <div style="display:flex; align-items:center; gap:8px">
        <div style="width:8px; height:8px; border-radius:50%; background:${c.color}"></div>
        <div style="flex:1; font-size:.65rem; color:var(--text-2)">${c.label}</div>
        <div style="font-size:.65rem; font-weight:700">฿ ${c.value.toFixed(2)}M <span style="font-weight:400; color:var(--text-3); font-size:.6rem">(${(c.value * 100 / 25.68).toFixed(1)}%)</span></div>
      </div>
    `).join('');
    }

    // 2. Monthly Value & Count (Mixed Bar/Line)
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    new Chart(ctxMon, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'มูลค่าประมาณการ',
            data: [2.5, 4.8, 3.2, 1.8, 3.45, 2.1, 3.8, 5.2, 2.4, 1.5, 2.1, 2.8],
            backgroundColor: '#6366f1', borderRadius: 4, barThickness: 16, order: 2
          },
          {
            label: 'จำนวนรายการ',
            data: [15, 32, 24, 12, 28, 18, 25, 38, 20, 14, 18, 22],
            borderColor: '#10b981', backgroundColor: '#10b981', type: 'line', tension: 0.4, borderWidth: 2, pointRadius: 3, order: 1, yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, datalabels: { display: false } },
        scales: {
          y: { ticks: { font: { family: 'Kanit', size: 9 }, callback: v => v + 'M' }, grid: { color: '#f1f5f9' }, border: { display: false } },
          y1: { position: 'right', ticks: { font: { family: 'Kanit', size: 9 } }, grid: { display: false }, border: { display: false } },
          x: { ticks: { font: { family: 'Kanit', size: 9 } }, grid: { display: false }, border: { display: false } }
        }
      }
    });

    // 3. Status Overview (Doughnut)
    const statusData = [
      { label: 'กำลังดำเนินการ', value: 18, color: '#6366f1', pct: 42.9 },
      { label: 'อนุมัติแล้ว', value: 16, color: '#10b981', pct: 38.1 },
      { label: 'รออนุมัติ', value: 6, color: '#f59e0b', pct: 14.3 },
      { label: 'ยกเลิก', value: 2, color: '#ef4444', pct: 4.7 }
    ];

    new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: statusData.map(s => s.label),
        datasets: [{
          data: statusData.map(s => s.value),
          backgroundColor: statusData.map(s => s.color),
          borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '80%',
        plugins: { legend: { display: false }, datalabels: { display: false } }
      }
    });

    const ceStatusLegend = document.getElementById('ceStatusLegend');
    if (ceStatusLegend) {
      ceStatusLegend.innerHTML = statusData.map(s => `
      <div style="display:flex; align-items:center; gap:8px">
        <div style="width:8px; height:8px; border-radius:50%; background:${s.color}"></div>
        <div style="flex:1; font-size:.7rem; color:var(--text-2)">${s.label}</div>
        <div style="font-size:.7rem; font-weight:700">${s.value} <span style="font-weight:400; color:var(--text-3); font-size:.65rem">(${s.pct}%)</span></div>
      </div>
    `).join('');
    }
  }

  // ---------- SALE SUPPORT ----------
  window.pageSaleSupport = function() {
    const tickets = [
      { id: 'SS-2505-0078', priority: 'high', status: 'รอดำเนินการ', title: 'ขอใบเสนอราคาโครงการ Solar Rooftop 500kW', customer: 'บริษัท พลังงานดี จำกัด', time: '10:24 น.', assignee: 'https://i.pravatar.cc/150?u=a1' },
      { id: 'SS-2505-0077', priority: 'medium', status: 'กำลังดำเนินการ', title: 'ขอข้อมูลจำเพาะของแผงโซล่าร์เซลล์', customer: 'บริษัท แสงอาทิตย์ จำกัด', time: '09:15 น.', assignee: 'https://i.pravatar.cc/150?u=a2' },
      { id: 'SS-2505-0076', priority: 'medium', status: 'รอดำเนินการ', title: 'สไลด์นำเสนอสำหรับลูกค้ารายใหญ่', customer: 'บริษัท กรีนโซลูชั่น จำกัด', time: 'เมื่อวาน', assignee: 'https://i.pravatar.cc/150?u=a3' },
      { id: 'SS-2505-0075', priority: 'low', status: 'รอข้อมูลเพิ่มเติม', title: 'สอบถามเงื่อนไขการชำระเงิน', customer: 'บริษัท ไทยแลนด์ รีเทล จำกัด', time: 'เมื่อวาน', assignee: 'https://i.pravatar.cc/150?u=a4' },
      { id: 'SS-2505-0074', priority: 'low', status: 'เสร็จสิ้น', title: 'ขอใบประชุมเพื่อเสนอโครงการ', customer: 'บริษัท อินโนเวท จำกัด', time: '20 พ.ค.', assignee: 'https://i.pravatar.cc/150?u=a5' },
      { id: 'SS-2505-0073', priority: 'medium', status: 'กำลังดำเนินการ', title: 'ขอเอกสารรับรองมาตรฐานสินค้า', customer: 'บริษัท ฟิวเจอร์ แอนเนอร์จี จำกัด', time: '20 พ.ค.', assignee: 'https://i.pravatar.cc/150?u=a6' },
      { id: 'SS-2505-0072', priority: 'high', status: 'รอดำเนินการ', title: 'เปรียบเทียบสเปคและราคาสินค้า', customer: 'บริษัท ดีไซน์แอนด์บิลด์ จำกัด', time: '19 พ.ค.', assignee: 'https://i.pravatar.cc/150?u=a7' },
    ];

    return `
  <!-- Header Row -->
  <div class="fade-in" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; margin-top:-10px">
    <div>
      <div style="font-size:1.5rem; font-weight:700; color:var(--text)">Sale Support</div>
      <div style="font-size:.85rem; color:var(--text-3)">ให้ความช่วยเหลือทีมขายและลูกค้า</div>
    </div>
    <div style="display:flex; align-items:center; gap:8px">
      <div class="search-box" style="width:320px; background:#fff">
        <i data-lucide="search" style="width:14px; height:14px; color:var(--text-3)"></i>
        <input type="text" placeholder="ค้นหา Ticket, ลูกค้า, หัวข้อ..." style="font-size:.75rem">
      </div>
      <button class="btn btn-sm" style="background:#fff; border:1px solid var(--border); color:var(--text-2); display:flex; align-items:center; gap:8px; padding:8px 14px">
      <i data-lucide="filter" style="width:14px; height:14px"></i> ตัวกรอง
      </button>
      <button class="btn btn-danger btn-sm" style="padding:8px 14px; font-size:.7rem; border-radius:8px; background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2); display:flex; align-items:center; gap:6px">
        <i data-lucide="rotate-ccw" style="width:13px; height:13px"></i> Clear All Filter
      </button>
      <button class="btn btn-primary" style="display:flex; align-items:center; gap:8px; padding:8px 16px; font-weight:600">
        <i data-lucide="plus" style="width:16px; height:16px"></i> สร้าง Ticket ใหม่
      </button>
    </div>
  </div>

  <div class="fade-in" style="display:grid; grid-template-columns:320px 1fr 300px; gap:20px; align-items:start">
    
    <!-- Left: Ticket List -->
    <div class="card" style="padding:0; display:flex; flex-direction:column; height:calc(100vh - 160px)">
      <div style="padding:20px 20px 10px 20px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
          <div style="font-size:.9rem; font-weight:700">Ticket ของฉัน <span style="color:var(--primary); margin-left:4px">24</span></div>
        </div>
        <div class="tabs" style="margin-bottom:16px">
          <button class="tab-btn active" style="padding:6px 12px; font-size:.7rem">ทั้งหมด <span style="font-size:.6rem; opacity:.7; margin-left:2px">78</span></button>
          <button class="tab-btn" style="padding:6px 12px; font-size:.7rem">ของฉัน <span style="font-size:.6rem; opacity:.7; margin-left:2px">24</span></button>
          <button class="tab-btn" style="padding:6px 12px; font-size:.7rem">รอดำเนินการ <span style="font-size:.6rem; opacity:.7; margin-left:2px">18</span></button>
        </div>
        <div style="display:flex; gap:8px; margin-bottom:12px">
          <div class="search-box" style="flex:1; background:#f8fafc; padding:6px 10px">
            <i data-lucide="search" style="width:12px; height:12px"></i>
            <input type="text" placeholder="ค้นหาในรายการ..." style="font-size:.7rem">
          </div>
          <div style="display:flex; border:1px solid var(--border); border-radius:6px; overflow:hidden">
            <button style="padding:6px; border:none; background:#fff; cursor:pointer"><i data-lucide="clock" style="width:12px; height:12px; color:var(--text-3)"></i></button>
            <button style="padding:6px; border:none; background:#6366f1; color:#fff; cursor:pointer"><i data-lucide="layout-list" style="width:12px; height:12px"></i></button>
          </div>
          <button style="padding:6px; border:1px solid var(--border); border-radius:6px; background:#fff; cursor:pointer"><i data-lucide="sliders-horizontal" style="width:12px; height:12px; color:var(--text-3)"></i></button>
        </div>
      </div>

      <div style="flex:1; overflow-y:auto; padding:0 12px 12px 12px">
        ${tickets.map((t, idx) => `
          <div class="ticket-card ${idx === 0 ? 'active' : ''}" style="padding:12px; border-radius:10px; border:1px solid ${idx === 0 ? '#6366f1' : 'transparent'}; background:${idx === 0 ? '#f5f3ff' : 'transparent'}; cursor:pointer; margin-bottom:8px; transition:all .2s">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
              <div style="display:flex; align-items:center; gap:6px">
                <div style="width:8px; height:8px; border-radius:50%; background:${t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#10b981'}"></div>
                <span style="font-size:.65rem; font-weight:700; color:var(--text-3)">${t.id}</span>
              </div>
              <span style="font-size:.6rem; color:var(--text-3)">${t.time}</span>
            </div>
            <div style="font-size:.7rem; font-weight:700; color:var(--text-2); margin-bottom:4px; line-height:1.4">${t.title}</div>
            <div style="font-size:.65rem; color:var(--text-3); margin-bottom:8px">${t.customer}</div>
            <div style="display:flex; justify-content:space-between; align-items:center">
              <span class="badge ${t.status === 'เสร็จสิ้น' ? 'badge-green' : t.status === 'กำลังดำเนินการ' ? 'badge-blue' : t.status === 'รอข้อมูลเพิ่มเติม' ? 'badge-yellow' : 'badge-gray'}" style="font-size:.55rem; padding:2px 6px">${t.status}</span>
              <img src="${t.assignee}" style="width:20px; height:20px; border-radius:50%; border:1px solid #fff">
            </div>
          </div>
        `).join('')}
      </div>

      <div style="padding:12px; border-top:1px solid var(--border); display:flex; justify-content:center; gap:8px">
        <button style="width:24px; height:24px; border-radius:4px; border:1px solid var(--border); background:#fff; display:flex; align-items:center; justify-content:center"><i data-lucide="chevron-left" style="width:12px; height:12px"></i></button>
        <button style="width:24px; height:24px; border-radius:4px; border:none; background:#6366f1; color:#fff; font-size:.65rem; font-weight:700">1</button>
        <button style="width:24px; height:24px; border-radius:4px; border:none; background:transparent; color:var(--text-3); font-size:.65rem">2</button>
        <button style="width:24px; height:24px; border-radius:4px; border:none; background:transparent; color:var(--text-3); font-size:.65rem">3</button>
        <span style="font-size:.65rem; color:var(--text-3)">...</span>
        <button style="width:24px; height:24px; border-radius:4px; border:none; background:transparent; color:var(--text-3); font-size:.65rem">10</button>
        <button style="width:24px; height:24px; border-radius:4px; border:1px solid var(--border); background:#fff; display:flex; align-items:center; justify-content:center"><i data-lucide="chevron-right" style="width:12px; height:12px"></i></button>
      </div>
    </div>

    <!-- Center: Conversation -->
    <div class="card" style="padding:0; display:flex; flex-direction:column; height:calc(100vh - 160px)">
      <div style="padding:20px; border-bottom:1px solid var(--border)">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px">
              <span style="font-size:1rem; font-weight:700; color:var(--text)">#SS-2505-0078</span>
              <span class="badge badge-red" style="padding:2px 8px"><i data-lucide="alert-circle" style="width:10px; height:10px; margin-right:4px"></i> High</span>
              <select class="select-input" style="width:120px; padding:2px 8px; font-size:.7rem; height:24px; border-radius:6px">
                <option>รอดำเนินการ</option>
                <option>กำลังดำเนินการ</option>
                <option>เสร็จสิ้น</option>
              </select>
            </div>
            <div style="font-size:1.1rem; font-weight:700; color:var(--text-2)">ขอใบเสนอราคาโครงการ Solar Rooftop 500kW</div>
          </div>
          <div style="display:flex; gap:8px">
            <button class="btn btn-sm" style="background:#f8fafc; border:1px solid var(--border); color:var(--text-2); font-size:.7rem; padding:6px 12px"><i data-lucide="edit-3" style="width:12px; height:12px; margin-right:4px"></i> แก้ไข</button>
            <button class="btn btn-sm" style="background:#f8fafc; border:1px solid var(--border); color:var(--text-2); padding:6px; min-width:32px"><i data-lucide="more-vertical" style="width:14px; height:14px"></i></button>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:8px">
          <div><div style="font-size:.65rem; color:var(--text-3); margin-bottom:4px">ลูกค้า</div><div style="font-size:.75rem; font-weight:700">บริษัท พลังงานดี จำกัด</div></div>
          <div><div style="font-size:.65rem; color:var(--text-3); margin-bottom:4px">ผู้ติดต่อ</div><div style="font-size:.75rem; font-weight:700">คุณณัฐพล ก.</div><div style="font-size:.6rem; color:var(--text-3)">081-234-5678</div></div>
          <div><div style="font-size:.65rem; color:var(--text-3); margin-bottom:4px">ช่องทาง</div><div style="font-size:.75rem; font-weight:700">Email</div></div>
          <div><div style="font-size:.65rem; color:var(--text-3); margin-bottom:4px">สร้างเมื่อ</div><div style="font-size:.75rem; font-weight:700">20 พ.ค. 2568</div><div style="font-size:.6rem; color:var(--text-3)">10:24 น.</div></div>
          <div><div style="font-size:.65rem; color:var(--text-3); margin-bottom:4px">กำหนดเสร็จ</div><div style="font-size:.75rem; font-weight:700">24 พ.ค. 2568</div></div>
        </div>
      </div>

      <div class="tabs" style="padding:0 20px; border-bottom:1px solid var(--border)">
        <button class="tab-btn" style="padding:12px 16px">รายละเอียด</button>
        <button class="tab-btn active" style="padding:12px 16px">การสนทนา</button>
        <button class="tab-btn" style="padding:12px 16px">ไฟล์แนบ <span style="font-size:.65rem; opacity:.7; margin-left:4px">3</span></button>
        <button class="tab-btn" style="padding:12px 16px">ประวัติดำเนินการ</button>
      </div>

      <div style="flex:1; overflow-y:auto; padding:20px; background:#fcfcfd">
        <div style="text-align:center; margin-bottom:24px"><span style="font-size:.65rem; color:var(--text-3); background:#fff; padding:4px 12px; border-radius:10px; border:1px solid var(--border)">วันนี้</span></div>
        
        <div style="display:flex; gap:12px; margin-bottom:20px">
          <img src="https://i.pravatar.cc/150?u=customer" style="width:36px; height:36px; border-radius:8px; flex-shrink:0">
          <div>
            <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:6px">
              <span style="font-size:.75rem; font-weight:700">ณัฐพล ก. (ลูกค้า)</span>
              <span style="font-size:.65rem; color:var(--text-3)">10:24 น.</span>
            </div>
            <div style="background:#fff; border:1px solid var(--border); padding:12px 16px; border-radius:0 12px 12px 12px; font-size:.8rem; color:var(--text-2); line-height:1.6; max-width:400px">
              สวัสดีครับ ขอใบเสนอราคาโครงการ Solar Rooftop ขนาด 500kW ต้องการติดตั้งที่ จังหวัดชลบุรีครับ
            </div>
          </div>
        </div>

        <div style="display:flex; gap:12px; margin-bottom:20px; flex-direction:row-reverse">
          <img src="https://i.pravatar.cc/150?u=kannika" style="width:36px; height:36px; border-radius:8px; flex-shrink:0">
          <div style="display:flex; flex-direction:column; align-items:flex-end">
            <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:6px; flex-direction:row-reverse">
              <span style="font-size:.7rem; font-weight:700">Kannika S. (Sale Support)</span>
              <span style="font-size:.65rem; color:var(--text-3)">10:28 น.</span>
            </div>
            <div style="background:#f5f3ff; border:1px solid rgba(99,102,241,0.1); padding:12px 16px; border-radius:12px 0 12px 12px; font-size:.8rem; color:var(--text-2); line-height:1.6; max-width:400px">
              ได้รับข้อมูลเรียบร้อยค่ะ ขอรายละเอียดเพิ่มเติมดังนี้ค่ะ:<br>
              1. พื้นที่ติดตั้งโดยประมาณ (ตารางเมตร)<br>
              2. การใช้ไฟฟ้าต่อเดือน<br>
              3. รูปแบบหลังคา
            </div>
          </div>
        </div>

        <div style="display:flex; gap:12px; margin-bottom:20px">
          <img src="https://i.pravatar.cc/150?u=customer" style="width:36px; height:36px; border-radius:8px; flex-shrink:0">
          <div>
            <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:6px">
              <span style="font-size:.75rem; font-weight:700">ณัฐพล ก. (ลูกค้า)</span>
              <span style="font-size:.65rem; color:var(--text-3)">10:35 น.</span>
            </div>
            <div style="background:#fff; border:1px solid var(--border); padding:12px 16px; border-radius:0 12px 12px 12px; font-size:.8rem; color:var(--text-2); line-height:1.6; max-width:400px">
              1. ประมาณ 3,000 ตร.ม.<br>
              2. เฉลี่ย 150,000 หน่วย/เดือน<br>
              3. หลังคาเมทัลชีท<br><br>
              ขอบคุณครับ
            </div>
          </div>
        </div>

        <div style="display:flex; gap:12px; margin-bottom:20px; flex-direction:row-reverse">
          <img src="https://i.pravatar.cc/150?u=kannika" style="width:36px; height:36px; border-radius:8px; flex-shrink:0">
          <div style="display:flex; flex-direction:column; align-items:flex-end">
            <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:6px; flex-direction:row-reverse">
              <span style="font-size:.7rem; font-weight:700">Kannika S. (Sale Support)</span>
              <span style="font-size:.65rem; color:var(--text-3)">10:40 น.</span>
            </div>
            <div style="background:#f5f3ff; border:1px solid rgba(99,102,241,0.1); padding:12px 16px; border-radius:12px 0 12px 12px; font-size:.8rem; color:var(--text-2); line-height:1.6; max-width:400px">
              ขอบคุณค่ะ กำลังจัดทำใบเสนอราคาให้ค่ะ คาดว่าจะส่งภายในวันนี้ 17:00 น. ค่ะ
            </div>
          </div>
        </div>
      </div>

      <div style="padding:16px 20px; border-top:1px solid var(--border)">
        <div style="background:#f8fafc; border:1px solid var(--border); border-radius:12px; padding:8px 12px">
          <textarea placeholder="พิมพ์ข้อความ..." style="width:100%; border:none; background:transparent; font-size:.8rem; min-height:40px; resize:none; padding:4px 0"></textarea>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px">
            <div style="display:flex; gap:8px">
              <button style="background:none; border:none; cursor:pointer; color:var(--text-3)"><i data-lucide="paperclip" style="width:16px; height:16px"></i></button>
              <button style="background:none; border:none; cursor:pointer; color:var(--text-3)"><i data-lucide="image" style="width:16px; height:16px"></i></button>
              <button style="background:none; border:none; cursor:pointer; color:var(--text-3)"><i data-lucide="smile" style="width:16px; height:16px"></i></button>
              <button style="background:none; border:none; cursor:pointer; color:var(--text-3)"><i data-lucide="at-sign" style="width:16px; height:16px"></i></button>
            </div>
            <button style="width:32px; height:32px; border-radius:8px; background:#6366f1; color:#fff; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer"><i data-lucide="send" style="width:16px; height:16px"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Sidebar -->
    <div style="display:flex; flex-direction:column; gap:20px">
      <!-- Summary Info -->
      <div class="card" style="padding:20px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
        <div style="font-size:.9rem; font-weight:700">สถานะของรายการ</div>
        <a href="#" style="font-size:.7rem; color:var(--primary); font-weight:600; text-decoration:none">ดูทั้งหมด</a>
        </div>
        <div style="display:flex; flex-direction:column; gap:16px">
          <div style="display:flex; justify-content:space-between; align-items:center"><span style="font-size:.75rem; color:var(--text-3)">ประเภทงาน</span><span style="font-size:.75rem; font-weight:700">ขอใบเสนอราคา</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center"><span style="font-size:.75rem; color:var(--text-3)">หมวดหมู่</span><span style="font-size:.75rem; font-weight:700">เอกสารและใบเสนอราคา</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center"><span style="font-size:.75rem; color:var(--text-3)">สินค้า/บริการ</span><span style="font-size:.75rem; font-weight:700">Solar Rooftop</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center"><span style="font-size:.75rem; color:var(--text-3)">ความเร่งด่วน</span><span style="font-size:.75rem; font-weight:700; color:#ef4444">● High</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center"><span style="font-size:.75rem; color:var(--text-3)">สถานะ</span><span class="badge badge-yellow" style="font-size:.65rem">รอดำเนินการ</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center">
            <span style="font-size:.75rem; color:var(--text-3)">ผู้รับผิดชอบ</span>
            <div style="display:flex; align-items:center; gap:8px">
              <img src="https://i.pravatar.cc/150?u=kannika" style="width:24px; height:24px; border-radius:50%">
              <span style="font-size:.7rem; font-weight:700">Kannika S.</span>
              <a href="#" style="font-size:.6rem; color:var(--primary); text-decoration:none">เปลี่ยน</a>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center"><span style="font-size:.75rem; color:var(--text-3)">ทีม</span><span style="font-size:.75rem; font-weight:700">Sale Support Team</span></div>
        </div>
      </div>

      <!-- Actions -->
      <div class="card" style="padding:20px">
        <div style="font-size:.9rem; font-weight:700; margin-bottom:16px">การดำเนินการ</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
          <button style="padding:12px; background:#fff; border:1px solid var(--border); border-radius:10px; display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; transition:all .2s">
            <i data-lucide="user-plus" style="width:20px; height:20px; color:var(--primary)"></i>
            <span style="font-size:.65rem; font-weight:600; color:var(--text-2)">มอบหมายงาน</span>
          </button>
          <button style="padding:12px; background:#fff; border:1px solid var(--border); border-radius:10px; display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; transition:all .2s">
            <i data-lucide="refresh-cw" style="width:20px; height:20px; color:#10b981"></i>
            <span style="font-size:.65rem; font-weight:600; color:var(--text-2)">เปลี่ยนสถานะ</span>
          </button>
          <button style="padding:12px; background:#fff; border:1px solid var(--border); border-radius:10px; display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; transition:all .2s">
            <i data-lucide="file-text" style="width:20px; height:20px; color:#f59e0b"></i>
            <span style="font-size:.65rem; font-weight:600; color:var(--text-2)">เพิ่มโน้ต</span>
          </button>
          <button style="padding:12px; background:#fff; border:1px solid var(--border); border-radius:10px; display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; transition:all .2s">
            <i data-lucide="paperclip" style="width:20px; height:20px; color:#3b82f6"></i>
            <span style="font-size:.65rem; font-weight:600; color:var(--text-2)">แนบไฟล์</span>
          </button>
        </div>
      </div>

      <!-- Timeline -->
      <div class="card" style="padding:20px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
          <div style="font-size:.9rem; font-weight:700">Timeline</div>
          <a href="#" style="font-size:.7rem; color:var(--primary); font-weight:600; text-decoration:none">ดูทั้งหมด</a>
        </div>
        <div style="position:relative; padding-left:24px">
          <div style="position:absolute; left:7px; top:0; bottom:0; width:1px; background:var(--border)"></div>
          <div style="font-size:.75rem; font-weight:700; color:var(--text-3); margin-bottom:16px">20 พ.ค. 2568</div>
          
          <div style="position:relative; margin-bottom:20px">
            <div style="position:absolute; left:-24px; top:2px; width:15px; height:15px; border-radius:50%; background:#f0fdf4; border:2px solid #10b981; z-index:1"></div>
            <div style="display:flex; justify-content:space-between; align-items:baseline">
              <span style="font-size:.7rem; font-weight:700">10:24</span>
              <span style="font-size:.65rem; color:var(--text-2)">สร้าง Ticket</span>
            </div>
            <div style="font-size:.6rem; color:var(--text-3)">โดย ณัฐพล ก.</div>
          </div>

          <div style="position:relative; margin-bottom:20px">
            <div style="position:absolute; left:-24px; top:2px; width:15px; height:15px; border-radius:50%; background:#eff6ff; border:2px solid #3b82f6; z-index:1"></div>
            <div style="display:flex; justify-content:space-between; align-items:baseline">
              <span style="font-size:.7rem; font-weight:700">10:28</span>
              <span style="font-size:.65rem; color:var(--text-2)">มอบหมายให้ Kannika S.</span>
            </div>
            <div style="font-size:.6rem; color:var(--text-3)">โดย Admin</div>
          </div>

          <div style="position:relative; margin-bottom:20px">
            <div style="position:absolute; left:-24px; top:2px; width:15px; height:15px; border-radius:50%; background:#fff7ed; border:2px solid #f97316; z-index:1"></div>
            <div style="display:flex; justify-content:space-between; align-items:baseline">
              <span style="font-size:.7rem; font-weight:700">10:35</span>
              <span style="font-size:.65rem; color:var(--text-2)">ลูกค้าตอบกลับ</span>
            </div>
          </div>

          <div style="position:relative">
            <div style="position:absolute; left:-24px; top:2px; width:15px; height:15px; border-radius:50%; background:#f5f3ff; border:2px solid #6366f1; z-index:1"></div>
            <div style="display:flex; justify-content:space-between; align-items:baseline">
              <span style="font-size:.7rem; font-weight:700">10:40</span>
              <span style="font-size:.65rem; color:var(--text-2)">Sale Support ตอบกลับ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
  }

  // ---------- SALE DOCUMENT ----------
  window.pageSaleDoc = function() {
    setTimeout(initDocumentCharts, 100);

    const docs = [
      { n: 'Contract_DIB-Solar Farm.pdf', p: 'DIB-Solar Farm', cat: 'สัญญา', cc: '#6366f1', by: 'Jirawat P.', d: '28 พ.ค. 2568 14:32', sz: '2.45 MB', st: 'สำคัญ', sc: '#ef4444' },
      { n: 'BOQ_Rev02.xlsx', p: 'DIB-Warehouse', cat: 'BOQ', cc: '#10b981', by: 'Nattapol K.', d: '27 พ.ค. 2568 11:15', sz: '1.28 MB', st: '-', sc: '#94a3b8' },
      { n: 'Drawing_Structure.pdf', p: 'DIB-Office Building', cat: 'แบบก่อสร้าง', cc: '#3b82f6', by: 'Kannika S.', d: '25 พ.ค. 2568 09:41', sz: '8.75 MB', st: 'สำคัญ', sc: '#ef4444' },
      { n: 'Progress_Report_May2025.pdf', p: 'DIB-Retrofit', cat: 'รายงาน', cc: '#a855f7', by: 'Jirawat P.', d: '24 พ.ค. 2568 16:20', sz: '3.12 MB', st: '-', sc: '#94a3b8' },
      { n: 'Invoice_INV-6805.pdf', p: 'DIB-Data Center', cat: 'ใบแจ้งหนี้', cc: '#f59e0b', by: 'Sutthida M.', d: '23 พ.ค. 2568 13:05', sz: '1.03 MB', st: '-', sc: '#94a3b8' },
      { n: 'Material_Approval.xlsx', p: 'DIB-Warehouse', cat: 'อนุมัติวัสดุ', cc: '#10b981', by: 'Nattapol K.', d: '20 พ.ค. 2568 10:18', sz: '2.01 MB', st: '-', sc: '#94a3b8' },
      { n: 'Meeting_Minutes_20250519.pdf', p: 'DIB-Office Building', cat: 'การประชุม', cc: '#ec4899', by: 'Kannika S.', d: '19 พ.ค. 2568 15:48', sz: '1.45 MB', st: '-', sc: '#94a3b8' },
      { n: 'Warranty_Document.pdf', p: 'DIB-Solar Farm', cat: 'รับประกัน', cc: '#ef4444', by: 'Jirawat P.', d: '18 พ.ค. 2568 09:30', sz: '4.67 MB', st: '-', sc: '#94a3b8' },
      { n: 'Change_Order_CO-03.pdf', p: 'DIB-Data Center', cat: 'เปลี่ยนแปลง', cc: '#f59e0b', by: 'Sutthida M.', d: '17 พ.ค. 2568 11:27', sz: '1.86 MB', st: 'สำคัญ', sc: '#ef4444' },
      { n: 'Safety_Plan_Rev01.pdf', p: 'DIB-Retrofit', cat: 'ความปลอดภัย', cc: '#6366f1', by: 'Jirawat P.', d: '15 พ.ค. 2568 14:10', sz: '3.21 MB', st: '-', sc: '#94a3b8' },
    ];

    return `
  <!-- Topbar Actions -->
  <div style="display:flex;justify-content:flex-end;gap:12px;margin-bottom:18px;align-items:center">
    ${renderDateFilter('initDocumentCharts()')}
    <button class="btn" style="background:rgba(99,102,241,0.08);color:#6366f1;border:1px solid rgba(99,102,241,0.2);display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      อัปโหลดเอกสาร
    </button>
  </div>

  <!-- KPIs Row -->
  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">เอกสารทั้งหมด</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text);margin:2px 0">2,458</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 15.3% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (271)</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#10b981;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">เอกสารใหม่</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text);margin:2px 0">362</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 15.3% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (271)</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:#f5f3ff;display:flex;align-items:center;justify-content:center;color:#8b5cf6;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">ดาวน์โหลด</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text);margin:2px 0">1,854</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 15.3% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (271)</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:#fff7ed;display:flex;align-items:center;justify-content:center;color:#f97316;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">ขนาดรวมทั้งหมด</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text);margin:2px 0">125.68 GB</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 9.8% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (114.45 GB)</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:#fff1f2;display:flex;align-items:center;justify-content:center;color:#e11d48;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">เอกสารที่แชร์</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text);margin:2px 0">328</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 15.3% <span style="color:var(--text-3);font-weight:400">จากปีก่อน (271)</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#10b981;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">ครบกำหนดตรวจสอบ</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text);margin:2px 0">24</div>
        <div style="font-size:.6rem;color:#ef4444;font-weight:600">▼ -1.3 วัน <span style="color:var(--text-3);font-weight:400">จากปีก่อน (6.5 วัน)</span></div>
      </div>
    </div>
  </div>

  <!-- Main Content Layout -->
  <div style="display:grid;grid-template-columns:1fr;gap:20px">
    <!-- Left: Table Section -->
    <div class="card" style="padding:0;display:flex;flex-direction:column;overflow:hidden">
      <!-- Tabs -->
      <div style="display:flex;padding:0 20px;border-bottom:1px solid var(--border);background:#fff">
        <div style="padding:16px 20px;color:var(--primary);font-weight:600;font-size:.85rem;border-bottom:2px solid var(--primary);cursor:pointer">ทั้งหมด</div>
        <div style="padding:16px 20px;color:var(--text-3);font-size:.85rem;cursor:pointer">เอกสารของฉัน</div>
        <div style="padding:16px 20px;color:var(--text-3);font-size:.85rem;cursor:pointer">แชร์กับฉัน</div>
        <div style="padding:16px 20px;color:var(--text-3);font-size:.85rem;cursor:pointer">แชร์กับฉัน</div>
        <div style="padding:16px 20px;color:var(--text-3);font-size:.85rem;cursor:pointer">ถังขยะ</div>
      </div>
      
      <!-- Toolbar -->
      <div style="display:flex;justify-content:space-between;padding:16px 20px;align-items:center;background:#fff">
        <div style="position:relative;width:300px">
          <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-3)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="ค้นหาเอกสาร, โครงการ, แท็ก..." style="width:100%;padding:8px 12px 8px 36px;border-radius:8px;border:1px solid var(--border);font-size:.8rem;outline:none">
        </div>
        <div style="display:flex;gap:8px">
          <button style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:#fff;border:1px solid var(--border);border-radius:8px;font-size:.8rem;color:var(--text-2);cursor:pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> ตัวกรอง
          </button>
          <div style="display:flex;border:1px solid var(--border);border-radius:8px;overflow:hidden">
            <button style="padding:8px;background:#f8fafc;border:none;color:var(--primary);cursor:pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
            <button style="padding:8px;background:#fff;border:none;color:var(--text-3);cursor:pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div style="flex:1;overflow:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.7rem;text-align:left">
          <thead>
            <tr style="color:var(--text-3);border-bottom:1px solid var(--border);background:#f8fafc">
              <th style="padding:12px 16px;width:30px"><input type="checkbox"></th>
              <th style="padding:12px 10px;font-weight:600">ชื่อเอกสาร</th>
              <th style="padding:12px 10px;font-weight:600">โครงการ</th>
              <th style="padding:12px 10px;font-weight:600">โครงการ</th>
              <th style="padding:12px 10px;font-weight:600">โครงการ</th>
              <th style="padding:12px 10px;font-weight:600">โครงการ</th>
              <th style="padding:12px 10px;font-weight:600">โครงการ</th>
              <th style="padding:12px 10px;font-weight:600">สถานะ</th>
              <th style="padding:12px 10px;text-align:center">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            ${docs.map(d => `
            <tr style="border-bottom:1px solid var(--border);transition:background 0.2s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
              <td style="padding:12px 16px"><input type="checkbox"></td>
              <td style="padding:12px 10px">
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:32px;height:32px;border-radius:6px;background:${d.n.endsWith('pdf') ? '#fef2f2' : '#f0fdf4'};color:${d.n.endsWith('pdf') ? '#ef4444' : '#10b981'};display:flex;align-items:center;justify-content:center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <span style="font-weight:500;color:var(--text-2)">${d.n}</span>
                </div>
              </td>
              <td style="padding:12px 10px;color:var(--text-3)">${d.p}</td>
              <td style="padding:12px 10px"><span style="background:${d.cc}10;color:${d.cc};padding:4px 10px;border-radius:6px;font-size:.65rem;font-weight:600">${d.cat}</span></td>
              <td style="padding:12px 10px;color:var(--text-2)">${d.by}</td>
              <td style="padding:12px 10px;color:var(--text-3);line-height:1.2">${d.d.split(' ')[0]}<br><span style="font-size:.65rem">${d.d.split(' ')[1]}</span></td>
              <td style="padding:12px 10px;color:var(--text-3)">${d.sz}</td>
              <td style="padding:12px 10px">${d.st !== '-' ? `<span style="background:${d.sc}10;color:${d.sc};padding:4px 10px;border-radius:6px;font-size:.65rem;font-weight:600">${d.st}</span>` : '-'}</td>
              <td style="padding:12px 10px">
                <div style="display:flex;justify-content:center;gap:8px">
                  <button style="background:none;border:none;color:var(--primary);cursor:pointer;padding:4px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
                  <button style="background:none;border:none;color:var(--text-3);cursor:pointer;padding:4px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
                  <button style="background:none;border:none;color:var(--text-3);cursor:pointer;padding:4px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div style="display:flex;justify-content:space-between;padding:16px 20px;align-items:center;border-top:1px solid var(--border)">
        <div style="font-size:.75rem;color:var(--text-3)">แสดง <select style="padding:2px 6px;border-radius:4px;border:1px solid var(--border)"><option>10</option></select> รายการ</div>
        <div style="display:flex;gap:4px;align-items:center">
          <button style="padding:6px;background:none;border:none;color:var(--text-3);cursor:pointer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button style="width:28px;height:28px;border-radius:6px;background:var(--primary);color:#fff;border:none;font-size:.7rem;font-weight:600">1</button>
          <button style="width:28px;height:28px;border-radius:6px;background:none;color:var(--text-2);border:none;font-size:.75rem">2</button>
          <button style="width:28px;height:28px;border-radius:6px;background:none;color:var(--text-2);border:none;font-size:.75rem">3</button>
          <button style="width:28px;height:28px;border-radius:6px;background:none;color:var(--text-2);border:none;font-size:.75rem">4</button>
          <button style="width:28px;height:28px;border-radius:6px;background:none;color:var(--text-2);border:none;font-size:.75rem">5</button>
          <span style="color:var(--text-3);font-size:.75rem">...</span>
          <button style="width:28px;height:28px;border-radius:6px;background:none;color:var(--text-2);border:none;font-size:.75rem">25</button>
          <button style="padding:6px;background:none;border:none;color:var(--text-3);cursor:pointer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>

    <!-- Right: Sidebar -->
    <div style="display:flex;flex-direction:column;gap:20px">
      <!-- Storage Card -->
      <div class="card" style="padding:20px">
        <div style="font-size:.9rem;font-weight:700;margin-bottom:20px">พื้นที่จัดเก็บเอกสาร</div>
        <div style="position:relative;height:160px;margin-bottom:20px">
          <canvas id="storageDonutChart"></canvas>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
             <div style="font-size:1.1rem;font-weight:700">125.68 GB</div>
             <div style="font-size:.65rem;color:var(--text-3)">จาก 200 GB</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:.75rem">
            <div style="display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:50%;background:#3b82f6"></div>ใช้งานแล้ว</div>
            <div style="font-weight:600">125.68 GB (62.8%)</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:.75rem">
            <div style="display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:50%;background:#f1f5f9"></div>เหลือ</div>
            <div style="font-weight:600">74.32 GB (37.2%)</div>
          </div>
        </div>
        <div style="margin-top:16px;height:6px;background:#f1f5f9;border-radius:10px;overflow:hidden">
          <div style="width:62.8%;height:100%;background:#3b82f6"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:8px">
          <div style="font-size:.65rem;color:var(--text-3)">ใช้งานไป 62.8%</div>
          <a href="#" style="font-size:.65rem;color:var(--primary);text-decoration:none;font-weight:600">ดูรายละเอียด</a>
        </div>
      </div>

      <!-- Categories Card -->
      <div class="card" style="padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">เอกสารตามหมวดหมู่</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          ${[
        { l: 'สัญญา', v: 486, p: '19.8%', c: '#6366f1' },
        { l: 'แบบก่อสร้าง', v: 612, p: '24.9%', c: '#3b82f6' },
        { l: 'รายงาน', v: 398, p: '16.2%', c: '#a855f7' },
        { l: 'ใบแจ้งหนี้', v: 245, p: '10.0%', c: '#f59e0b' },
        { l: 'การประชุม', v: 210, p: '8.6%', c: '#ec4899' },
        { l: 'อื่นๆ', v: 507, p: '20.5%', c: '#10b981' }
      ].map(c => `
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:8px;height:8px;border-radius:50%;background:${c.c}"></div>
            <div style="flex:1;font-size:.7rem;color:var(--text-2)">${c.l}</div>
            <div style="font-size:.7rem;font-weight:700">${c.v} <span style="font-weight:400;color:var(--text-3);margin-left:4px">(${c.p})</span></div>
          </div>`).join('')}
        </div>
        <div style="text-align:center;margin-top:16px"><a href="#" style="font-size:.75rem;color:var(--primary);text-decoration:none;font-weight:600">ดูทั้งหมด</a></div>
      </div>

      <!-- Activity Card -->
      <div class="card" style="padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">กิจกรรมล่าสุด</div>
          <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูทั้งหมด</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="display:flex;gap:8px">
            <div style="width:32px;height:32px;border-radius:50%;background:#eff6ff;color:#3b82f6;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
            <div>
              <div style="font-size:.7rem;color:var(--text-2)"><span style="font-weight:700">คุณ Jirawat P.</span> อัปโหลดเอกสาร</div>
              <div style="font-size:.7rem;color:var(--primary);font-weight:500;margin:2px 0">Contract_DIB-Solar Farm.pdf</div>
              <div style="font-size:.6rem;color:var(--text-3)">28 พ.ค. 2568 14:32</div>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <div style="width:32px;height:32px;border-radius:50%;background:#f5f3ff;color:#8b5cf6;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg></div>
            <div>
              <div style="font-size:.7rem;color:var(--text-2)"><span style="font-weight:700">คุณ Nattapol K.</span> แชร์เอกสาร</div>
              <div style="font-size:.7rem;color:var(--primary);font-weight:500;margin:2px 0">BOQ_Rev02.xlsx</div>
              <div style="font-size:.6rem;color:var(--text-3)">27 พ.ค. 2568 11:15</div>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <div style="width:32px;height:32px;border-radius:50%;background:#eff6ff;color:#3b82f6;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
            <div>
              <div style="font-size:.7rem;color:var(--text-2)"><span style="font-weight:700">คุณ Kannika S.</span> แก้ไขเอกสาร</div>
              <div style="font-size:.7rem;color:var(--primary);font-weight:500;margin:2px 0">Drawing_Structure.pdf</div>
              <div style="font-size:.6rem;color:var(--text-3)">25 พ.ค. 2568 09:41</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
  }

  window.renderDocRows = function(docs) {
    const icons = { PDF: '', Excel: '', Word: '' };
    return docs.map(d => `<tr>
    <td><span style="margin-right:6px">${icons[d.type] || '-֧?'}</span><strong>${d.name}</strong></td>
    <td><span class="badge badge-gray">${d.type}</span></td>
    <td>${d.size}</td><td>${d.updated}</td><td>${d.by}</td>
    <td><button class="btn btn-outline btn-sm">Download</button></td>
  </tr>`).join('');
  }

  window.filterSaleDoc = function() {
    const q = document.getElementById('docSearch').value.toLowerCase();
    const type = document.getElementById('docTypeFilter').value;

    const filtered = DATA.documents.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(q) || d.by.toLowerCase().includes(q);
      const matchesType = type === 'all' || d.type === type;
      return matchesSearch && matchesType;
    });

    document.getElementById('docTableBody').innerHTML = renderDocRows(filtered);
  }

  // ---------- LEARNING SKILLS ----------
  window.pageLearningSkills = function() {
    setTimeout(initLearningCharts, 100);

    const ongoing = [
      { n: 'Advanced Excel for Data Analysis', cat: 'ทักษะด้านดิจิทัล', lvl: 'ระดับ Advanced', t: '3 ชม. 45 นาที', p: 100, s: 'จบแล้ว', sc: '#10b981' },
      { n: 'Project Risk Management', cat: 'ทักษะด้านการบริหาร', lvl: 'ระดับ Intermediate', t: '4 ชม. 20 นาที', p: 75, s: 'เหลือ 1 ชม. 5 นาที', sc: '#3b82f6' },
      { n: 'Power BI for Business Intelligence', cat: 'ทักษะด้านดิจิทัล', lvl: 'ระดับ Intermediate', t: '3 ชม. 30 นาที', p: 10, s: 'เหลือ 3 ชม. 10 นาที', sc: '#6366f1' },
      { n: 'Effective Communication Skills', cat: 'ทักษะด้านการสื่อสาร', lvl: 'ระดับ Basic', t: '2 ชม. 15 นาที', p: 40, s: 'เหลือ 1 ชม. 15 นาที', sc: '#f59e0b' },
      { n: 'Cost Estimation Techniques', cat: 'ทักษะด้านเทคนิค', lvl: 'ระดับ Advanced', t: '3 ชม. 0 นาที', p: 60, s: 'เหลือ 1 ชม. 12 นาที', sc: '#8b5cf6' },
    ];

    const recommended = [
      { n: 'Agile Project Management', lvl: 'ระดับ Intermediate', r: 4.5, c: 128, t: '3 ชม. 20 นาที', isNew: true },
      { n: 'Data Visualization with Tableau', lvl: 'ระดับ Intermediate', r: 4.7, c: 86, t: '2 ชม. 40 นาที', isNew: false },
      { n: 'Leadership Fundamentals', lvl: 'ระดับ Basic', r: 4.6, c: 73, t: '2 ชม. 15 นาที', isNew: false },
    ];

    return `
  <!-- Top Search Bar -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:18px">
    <div style="position:relative;width:300px">
      <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-3)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="ค้นหาคอร์ส, ทักษะ, หมวดหมู่..." style="width:100%;padding:8px 12px 8px 36px;border-radius:8px;border:1px solid var(--border);font-size:.8rem;outline:none;background:#fff">
    </div>
  </div>

  <!-- KPIs Row -->
  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">คอร์สทั้งหมด</div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text)">128</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#10b981"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">คอร์สที่เรียนจบ</div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text)">48</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#f5f3ff;display:flex;align-items:center;justify-content:center;color:#8b5cf6"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">กำลังเรียน</div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text)">6</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#fff7ed;display:flex;align-items:center;justify-content:center;color:#f97316"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">ชั่วโมงการเรียนรวม</div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text)">78.5 ชม.</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#fef2f2;display:flex;align-items:center;justify-content:center;color:#ef4444"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">ทักษะที่พัฒนา</div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text)">16</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">คะแนนรวม</div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text)">2,450</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
  </div>

  <!-- Row 2: Stats & Skills -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:20px">ความคืบหน้าการเรียนรู้</div>
      <div style="display:flex;gap:24px;align-items:center;flex:1">
        <div style="position:relative;width:120px;height:120px">
          <canvas id="learningProgressDonut"></canvas>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
            <div style="font-size:1.4rem;font-weight:700;color:var(--text)">68%</div>
            <div style="font-size:.6rem;color:var(--text-3)">ความคืบหน้าโดยรวม</div>
          </div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          ${[
        { l: 'ทักษะด้านเทคนิค', p: 72, c: '#6366f1' },
        { l: 'ทักษะด้านการบริหาร', p: 64, c: '#3b82f6' },
        { l: 'ทักษะด้านการสื่อสาร', p: 60, c: '#f59e0b' },
        { l: 'ทักษะด้านดิจิทัล', p: 76, c: '#10b981' }
      ].map(s => `
          <div>
            <div style="display:flex;justify-content:space-between;font-size:.65rem;margin-bottom:4px">
              <span style="color:var(--text-3)">${s.l}</span>
              <span style="font-weight:700">${s.p}%</span>
            </div>
            <div style="height:4px;background:#f1f5f9;border-radius:10px;overflow:hidden">
              <div style="width:${s.p}%;height:100%;background:${s.c}"></div>
            </div>
          </div>`).join('')}
        </div>
      </div>
        <div style="text-align:center;margin-top:16px"><a href="#" style="font-size:.75rem;color:var(--primary);text-decoration:none;font-weight:600">ดูทั้งหมด</a></div>
    </div>

    <div class="card" style="padding:20px">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:20px">ทักษะเด่นของคุณ</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
        { n: 'Project Management', l: 'Advanced', c: '#eff6ff', tc: '#3b82f6' },
        { n: 'Cost Estimation', l: 'Advanced', c: '#f0fdf4', tc: '#10b981' },
        { n: 'Data Analysis', l: 'Intermediate', c: '#fff7ed', tc: '#f97316' },
        { n: 'Microsoft Excel', l: 'Intermediate', c: '#f5f3ff', tc: '#8b5cf6' },
        { n: 'Communication', l: 'Basic', c: '#f8fafc', tc: '#64748b' }
      ].map(s => `
        <div style="background:${s.c}50;padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:.7rem;font-weight:600;color:var(--text-2)">${s.n}</span>
          <span style="font-size:.6rem;font-weight:700;color:${s.tc};background:#fff;padding:2px 6px;border-radius:4px">${s.l}</span>
        </div>`).join('')}
      </div>
        <div style="text-align:center;margin-top:16px"><a href="#" style="font-size:.75rem;color:var(--primary);text-decoration:none;font-weight:600">ดูทั้งหมด</a></div>
    </div>

    <div class="card" style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">กิจกรรมล่าสุด</div>
          <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูทั้งหมด</a>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;gap:8px">
          <div style="width:28px;height:28px;border-radius:6px;background:#eff6ff;color:#3b82f6;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
          <div style="flex:1">
            <div style="font-size:.7rem;font-weight:700;color:var(--text-2)">จบคอร์ส: Advanced Excel for Data Analysis</div>
            <div style="display:flex;justify-content:space-between;margin-top:2px">
              <span style="font-size:.6rem;color:var(--text-3)">20 พ.ค. 2568</span>
              <span style="font-size:.6rem;color:#10b981;font-weight:700">100%</span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <div style="width:28px;height:28px;border-radius:6px;background:#f5f3ff;color:#8b5cf6;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10M18 17l-6 5-6-5M12 12V2"/></svg></div>
          <div style="flex:1">
            <div style="font-size:.7rem;font-weight:700;color:var(--text-2)">เรียนต่อ: Project Risk Management</div>
            <div style="display:flex;justify-content:space-between;margin-top:2px">
              <span style="font-size:.6rem;color:var(--text-3)">19 พ.ค. 2568</span>
              <span style="font-size:.6rem;color:#3b82f6;font-weight:700">75%</span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <div style="width:28px;height:28px;border-radius:6px;background:#fff7ed;color:#f97316;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>
          <div style="flex:1">
            <div style="font-size:.7rem;font-weight:700;color:var(--text-2)">เริ่มเรียนคอร์สใหม่: Power BI for BI</div>
            <div style="display:flex;justify-content:space-between;margin-top:2px">
              <span style="font-size:.6rem;color:var(--text-3)">18 พ.ค. 2568</span>
              <span style="font-size:.6rem;color:#f59e0b;font-weight:700">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Row 3: Ongoing & Recommendations -->
  <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div style="font-size:.9rem;font-weight:700">กิจกรรมล่าสุด</div>
        <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูเส้นทางอาชีพทั้งหมด</a>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        ${ongoing.map(c => `
        <div style="display:flex;gap:16px;align-items:center;padding-bottom:12px;border-bottom:1px solid #f1f5f9">
          <div style="width:80px;height:50px;border-radius:6px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#cbd5e1;overflow:hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
          </div>
          <div style="flex:1">
            <div style="font-size:.8rem;font-weight:700;color:var(--text-2)">${c.n}</div>
            <div style="font-size:.65rem;color:var(--text-3);margin-top:2px">${c.cat} - ${c.lvl} - ${c.t}</div>
          </div>
          <div style="width:120px;text-align:right">
            <div style="font-size:.7rem;font-weight:700">${c.p}%</div>
            <div style="font-size:.6rem;color:${c.p === 100 ? '#10b981' : 'var(--text-3)'}">${c.s}</div>
          </div>
          <button class="btn btn-outline" style="padding:6px 14px;font-size:.7rem;border-radius:6px">${c.p === 100 ? 'ดูรายละเอียด' : 'เรียนต่อ'}</button>
        </div>`).join('')}
      </div>
        <div style="text-align:center;margin-top:16px"><a href="#" style="font-size:.75rem;color:var(--primary);text-decoration:none;font-weight:600">ดูทั้งหมด</a></div>
    </div>

    <div class="card" style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div style="font-size:.9rem;font-weight:700">กิจกรรมล่าสุด</div>
        <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูเส้นทางอาชีพทั้งหมด</a>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${recommended.map(r => `
        <div style="display:flex;gap:12px;align-items:center;background:#f8fafc;padding:12px;border-radius:10px;position:relative">
          ${r.isNew ? `<span style="position:absolute;top:8px;left:8px;background:#ef4444;color:#fff;font-size:.5rem;font-weight:700;padding:2px 6px;border-radius:4px;z-index:1">NEW</span>` : ''}
          <div style="width:100px;height:65px;border-radius:6px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;color:#94a3b8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div style="flex:1">
            <div style="font-size:.7rem;font-weight:700;color:var(--text-2)">${r.n}</div>
            <div style="font-size:.65rem;color:var(--text-3);margin:4px 0">${r.lvl}</div>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="display:flex;align-items:center;gap:2px;color:#f59e0b"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span style="font-size:.65rem;font-weight:700">${r.r} (${r.c})</span></div>
              <span style="font-size:.65rem;color:var(--text-3)">${r.t}</span>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Row 4: Categories & Leaderboard -->
  <div style="display:grid;grid-template-columns:1fr 1fr 2fr;gap:16px">
    <div class="card" style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">กิจกรรมล่าสุด</div>
          <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูทั้งหมด</a>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
        { n: 'ทักษะด้านการบริหาร', v: 32, i: 'briefcase', c: '#3b82f6' },
        { n: 'ทักษะด้านดิจิทัล', v: 28, i: 'monitor', c: '#6366f1' },
        { n: 'ทักษะด้านเทคนิค', v: 24, i: 'tool', c: '#10b981' },
        { n: 'ทักษะด้านการสื่อสาร', v: 18, i: 'message-square', c: '#f59e0b' },
        { n: 'ทักษะด้านการเงิน', v: 16, i: 'dollar-sign', c: '#14b8a6' }
      ].map(cat => `
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:30px;height:30px;border-radius:6px;background:${cat.c}15;color:${cat.c};display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg></div>
          <div style="flex:1;font-size:.7rem;color:var(--text-2)">${cat.n}</div>
          <div style="font-size:.7rem;font-weight:600;color:var(--text-3)">${cat.v} คอร์ส</div>
        </div>`).join('')}
      </div>
    </div>

    <div class="card" style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:.9rem;font-weight:700">Leaderboard</div>
        <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูทั้งหมด</a>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
        { n: 'Nattapol K.', p: 3150, r: 1 },
        { n: 'Kannika S.', p: 2780, r: 2 },
        { n: 'Jirawat P.', p: 2450, r: 3 },
        { n: 'Sutthida M.', p: 2120, r: 4 },
        { n: 'Phisit T.', p: 1980, r: 5 }
      ].map(l => `
        <div style="display:flex;align-items:center;gap:10px;padding:6px;border-radius:8px;${l.r === 3 ? 'background:#eff6ff' : ''}">
          <div style="width:22px;height:22px;border-radius:50%;background:${l.r === 1 ? '#f59e0b' : l.r === 2 ? '#94a3b8' : l.r === 3 ? '#b45309' : '#f1f5f9'};color:${l.r <= 3 ? '#fff' : 'var(--text-3)'};display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700">${l.r}</div>
          <div style="flex:1;font-size:.75rem;font-weight:600;color:var(--text-2)">${l.n} ${l.r === 3 ? '<span style="color:var(--primary);font-weight:400;font-size:.65rem">(คุณ)</span>' : ''}</div>
          <div style="font-size:.7rem;font-weight:700;color:var(--text-2)">${l.p.toLocaleString()} <span style="font-weight:400;color:var(--text-3);font-size:.6rem">คะแนน</span></div>
        </div>`).join('')}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card" style="padding:20px;display:flex;gap:20px;align-items:center">
        <div style="width:48px;height:48px;border-radius:50%;background:#eff6ff;color:#3b82f6;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>
        <div style="flex:1">
          <div style="font-size:.85rem;font-weight:700;margin-bottom:8px">เป้าหมายการเรียนรู้ของคุณ</div>
          <div style="display:flex;justify-content:space-between;font-size:.7rem;margin-bottom:6px">
            <span style="color:var(--text-3)">เรียนรู้ 100 ชั่วโมงในปี 2568</span>
            <span style="font-weight:700;color:var(--text-2)">78.5 / 100 ชม.</span>
          </div>
          <div style="height:6px;background:#f1f5f9;border-radius:10px;overflow:hidden">
            <div style="width:78.5%;height:100%;background:#3b82f6"></div>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="card" style="padding:16px;display:flex;gap:12px;align-items:center">
          <div style="width:36px;height:36px;border-radius:50%;background:#f5f3ff;color:#8b5cf6;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
          <div>
            <div style="font-size:.7rem;color:var(--text-3)">เป้าหมายถัดไป</div>
            <div style="font-size:.75rem;font-weight:700;color:var(--text-2)">เรียนจบอีก 2 คอร์ส</div>
            <a href="#" style="font-size:.65rem;color:var(--primary);text-decoration:none">ดูรายละเอียดเป้าหมาย ❯</a>
          </div>
        </div>
        <div class="card" style="padding:16px;display:flex;gap:12px;align-items:center">
          <div style="width:36px;height:36px;border-radius:50%;background:#f8fafc;color:#64748b;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div>
            <div style="font-size:.7rem;color:var(--text-3)">เป้าหมายถัดไป</div>
            <div style="font-size:.75rem;font-weight:700;color:var(--text-2)">21 พ.ค. 2568</div>
            <div style="font-size:.65rem;color:var(--text-3)">Workshop: Power BI Advanced</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
  }

  // ---------- CAREER PATH ----------
  window.pageCareerPath = function() {
    setTimeout(initCareerCharts, 100);

    const roadmap = [
      { lvl: 1, role: 'Junior Cost Estimator', s: 'completed', d: '1 ก.พ. 2566 - 31 ม.ค. 2567' },
      { lvl: 2, role: 'Cost Estimator', s: 'current', d: '1 ก.พ. 2567 - ปัจจุบัน' },
      { lvl: 3, role: 'Senior Cost Estimator', s: 'target', d: 'คาดว่าจะถึง: ก.พ. 2569' },
      { lvl: 4, role: 'Cost Estimation Manager', s: 'locked', d: 'คาดว่าจะถึง: ก.พ. 2571' },
      { lvl: 5, role: 'Head of Cost Management', s: 'locked', d: 'คาดว่าจะถึง: ก.พ. 2574' },
    ];

    const skillGaps = [
      { n: 'Advanced Excel', p: 40, s: 'สำคัญ', sc: '#ef4444' },
      { n: 'Project Risk Management', p: 60, s: 'สำคัญ', sc: '#ef4444' },
      { n: 'Negotiation', p: 50, s: 'ปานกลาง', sc: '#f59e0b' },
      { n: 'Leadership', p: 30, s: 'ปานกลาง', sc: '#f59e0b' },
      { n: 'Strategic Thinking', p: 20, s: 'ต่ำ', sc: '#10b981' },
    ];

    const recommended = [
      { r: 'Senior Cost Estimator', d: 'DIB-Construction Division', m: 85, c: '#10b981' },
      { r: 'Cost Estimation Specialist', d: 'DIB-Solar Division', m: 78, c: '#f59e0b' },
      { r: 'Project Cost Analyst', d: 'DIB-Data Center Division', m: 72, c: '#3b82f6' },
      { r: 'Cost Control Engineer', d: 'DIB-Industrial Division', m: 68, c: '#ef4444' },
    ];

    return `
  <!-- Top Search/Dropdown -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:18px">
    <div style="display:flex;flex-direction:column;gap:4px">
      <div style="font-size:.65rem;color:var(--text-3);text-align:right">ตำแหน่งปัจจุบัน</div>
      <select class="select-input" style="width:220px;padding:8px 12px;border-radius:8px;font-size:.8rem;border:1px solid var(--border);outline:none;background:#fff;font-weight:600">
        <option>Cost Estimator</option>
      </select>
    </div>
  </div>

  <!-- KPIs Row -->
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">ระดับอาชีพปัจจุบัน</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text)">Level 2</div>
        <div style="font-size:.65rem;color:var(--text-3)">Cost Estimator</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;flex-direction:column;justify-content:center;gap:6px">
       <div style="display:flex;justify-content:space-between;align-items:center">
         <span style="font-size:.65rem;color:var(--text-3);font-weight:600">คะแนนความก้าวหน้า</span>
         <span style="font-size:.8rem;font-weight:700;color:var(--primary)">62%</span>
       </div>
       <div style="height:6px;background:#f1f5f9;border-radius:10px;overflow:hidden">
         <div style="width:62%;height:100%;background:var(--primary)"></div>
       </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#f5f3ff;display:flex;align-items:center;justify-content:center;color:#8b5cf6"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">ประสบการณ์ทำงาน</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text)">2 ปี 4 เดือน</div>
        <div style="font-size:.6rem;color:var(--text-3)">ตั้งแต่ 1 ก.พ. 2566</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#10b981"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">ทักษะทั้งหมด</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text)">28 ทักษะ</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">เชี่ยวชาญ 12 ทักษะ</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#fff7ed;display:flex;align-items:center;justify-content:center;color:#f97316"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">ตำแหน่งเป้าหมาย</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text)">Senior Cost Est.</div>
        <div style="font-size:.6rem;color:var(--text-3)">Level 3</div>
      </div>
    </div>
  </div>

  <!-- Row 2: Timeline & Target -->
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:30px">
        <div style="font-size:.95rem;font-weight:700">เส้นทางความก้าวหน้าในสายอาชีพ</div>
        <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูเส้นทางอาชีพทั้งหมด</a>
      </div>
      <div style="display:flex;justify-content:space-between;padding:0 20px;position:relative;flex:1">
        <!-- Connecting Line -->
        <div style="position:absolute;top:40px;left:40px;right:40px;height:2px;background:#e2e8f0;z-index:1"></div>
        <div style="position:absolute;top:40px;left:40px;width:25%;height:2px;background:#10b981;z-index:2"></div>
        
        ${roadmap.map(r => `
        <div style="display:flex;flex-direction:column;align-items:center;width:120px;z-index:3;text-align:center">
           <div style="font-size:.65rem;color:var(--text-3);margin-bottom:8px">Level ${r.lvl}</div>
           <div style="font-size:.7rem;font-weight:700;color:var(--text-2);margin-bottom:12px;min-height:32px">${r.role}</div>
           <div style="width:40px;height:40px;border-radius:50%;background:${r.s === 'completed' ? '#f0fdf4' : r.s === 'current' ? '#eff6ff' : '#fff'};border:2px solid ${r.s === 'completed' ? '#10b981' : r.s === 'current' ? '#3b82f6' : '#e2e8f0'};display:flex;align-items:center;justify-content:center;color:${r.s === 'completed' ? '#10b981' : r.s === 'current' ? '#3b82f6' : '#94a3b8'}">
             ${r.s === 'completed' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' :
        r.s === 'current' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' :
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'}
           </div>
           <div style="margin-top:12px">
             <div style="font-size:.6rem;font-weight:700;color:${r.s === 'completed' ? '#10b981' : r.s === 'current' ? '#3b82f6' : 'var(--text-3)'}">${r.s === 'completed' ? 'สำเร็จแล้ว' : r.s === 'current' ? 'ปัจจุบัน' : 'เป้าหมาย'}</div>
             <div style="font-size:.55rem;color:var(--text-3);margin-top:2px">${r.d}</div>
           </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="card" style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">กิจกรรมล่าสุด</div>
          <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูทั้งหมด</a>
      </div>
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px">
        <div style="width:48px;height:48px;border-radius:10px;background:#f5f3ff;color:#8b5cf6;display:flex;align-items:center;justify-content:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
        <div>
          <div style="font-size:.8rem;font-weight:700;color:var(--text-2)">Senior Cost Estimator</div>
          <div style="font-size:.7rem;color:var(--text-3)">Level 3</div>
        </div>
      </div>
      <div style="font-size:.7rem;color:var(--text-3);margin-bottom:16px;line-height:1.5">รับผิดชอบการประมาณราคาที่ซับซ้อน วิเคราะห์ต้นทุนโครงการขนาดใหญ่ และให้คำแนะนำเชิงกลยุทธ์ด้านต้นทุน...</div>
      <div style="font-size:.75rem;font-weight:700;margin-bottom:10px">ทักษะที่ต้องการ</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${[
        { n: 'Cost Estimation', l: 'Advanced', c: '#f0fdf4', tc: '#10b981' },
        { n: 'Project Management', l: 'Advanced', c: '#eff6ff', tc: '#3b82f6' },
        { n: 'Data Analysis', l: 'Advanced', c: '#fff7ed', tc: '#f97316' },
        { n: 'Negotiation', l: 'Intermediate', c: '#fef2f2', tc: '#ef4444' },
        { n: 'Leadership', l: 'Intermediate', c: '#f5f3ff', tc: '#8b5cf6' }
      ].map(s => `<div style="background:${s.c};padding:4px 8px;border-radius:6px;display:flex;gap:6px;align-items:center"><span style="font-size:.6rem;color:var(--text-2);font-weight:600">${s.n}</span><span style="font-size:.5rem;background:#fff;padding:1px 4px;border-radius:4px;color:${s.tc}">${s.l}</span></div>`).join('')}
      </div>
      <div style="text-align:right;margin-top:12px"><a href="#" style="font-size:.65rem;color:var(--primary);text-decoration:none">ดูทักษะทั้งหมด (12) ❯</a></div>
    </div>
  </div>

  <!-- Row 3: Skill Radar & Gap -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:10px">ทักษะของคุณ</div>
      <div style="flex:1;min-height:240px;position:relative">
        <canvas id="skillRadarChart"></canvas>
      </div>
      <div style="display:flex;justify-content:center;gap:16px;margin-top:10px">
        <div style="display:flex;align-items:center;gap:6px"><div style="width:8px;height:8px;border-radius:50%;background:#6366f1"></div><span style="font-size:.6rem;color:var(--text-3)">ระดับของคุณ</span></div>
        <div style="display:flex;align-items:center;gap:6px"><div style="width:8px;height:8px;border-radius:50%;background:#e2e8f0"></div><span style="font-size:.6rem;color:var(--text-3)">ระดับที่ต้องการ</span></div>
      </div>
    </div>

    <div class="card" style="padding:20px">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:6px">ช่องว่างทักษะ (Skill Gap)</div>
      <div style="font-size:.65rem;color:var(--text-3);margin-bottom:20px">ทักษะที่ควรพัฒนาเพื่อไปสู่ตำแหน่งเป้าหมาย</div>
      <div style="display:flex;flex-direction:column;gap:14px">
        ${skillGaps.map(g => `
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;align-items:center">
             <span style="font-size:.7rem;font-weight:600;color:var(--text-2)">${g.n}</span>
             <div style="display:flex;align-items:center;gap:10px">
               <span style="font-size:.7rem;font-weight:700;color:var(--text-3)">${g.p}%</span>
               <span style="background:${g.sc}10;color:${g.sc};padding:2px 8px;border-radius:4px;font-size:.6rem;font-weight:700">${g.s}</span>
             </div>
          </div>
          <div style="height:6px;background:#f1f5f9;border-radius:10px;overflow:hidden">
            <div style="width:${g.p}%;height:100%;background:${g.sc}"></div>
          </div>
        </div>`).join('')}
      </div>
      <div style="text-align:center;margin-top:20px"><button class="btn btn-primary" style="padding:8px 20px;font-size:.75rem;border-radius:8px">ดูแผนพัฒนาทักษะ ❯</button></div>
    </div>

    <div class="card" style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div style="font-size:.9rem;font-weight:700">ตำแหน่งที่แนะนำสำหรับคุณ</div>
          <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูทั้งหมด</a>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${recommended.map(r => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;background:#f8fafc;cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='none'">
          <div style="width:36px;height:36px;border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;color:var(--primary);border:1px solid #e2e8f0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div style="flex:1">
            <div style="font-size:.7rem;font-weight:700;color:var(--text-2)">${r.r}</div>
            <div style="font-size:.6rem;color:var(--text-3)">${r.d}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:.7rem;font-weight:700;color:${r.c}">${r.m}%</div>
            <div style="font-size:.55rem;color:var(--text-3)">Match</div>
          </div>
          <svg style="color:var(--text-3)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>`).join('')}
      </div>
        <div style="text-align:center;margin-top:16px"><a href="#" style="font-size:.75rem;color:var(--primary);text-decoration:none;font-weight:600">ดูทั้งหมด</a></div>
    </div>
  </div>

  <!-- Row 4: Dev Plan & Resources -->
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px">
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:24px">แผนการพัฒนาของคุณ</div>
      <div style="display:flex;justify-content:space-between;padding:0 20px;position:relative;flex:1">
        <div style="position:absolute;top:20px;left:40px;right:40px;height:2px;background:#e2e8f0;z-index:1"></div>
        ${[
        { t: 'ปัจจุบัน', d: 'พัฒนาทักษะพื้นฐาน', s: '6/8 ทักษะ', i: 'target', c: '#6366f1' },
        { t: 'ภายใน 6 เดือน', d: 'เสริมทักษะเชิงลึก', s: '4/6 ทักษะ', i: 'user', c: '#8b5cf6' },
        { t: 'ภายใน 1 ปี', d: 'เตรียมพร้อมเลื่อนระดับ', s: '3/5 ทักษะ', i: 'briefcase', c: '#3b82f6' },
        { t: 'ภายใน 2 ปี', d: 'ก้าวสู่เป้าหมาย', s: '0/6 ทักษะ', i: 'lock', c: '#94a3b8' }
      ].map((p, i) => `
        <div style="display:flex;flex-direction:column;align-items:center;width:120px;z-index:2">
          <div style="width:40px;height:40px;border-radius:50%;background:#fff;border:2px solid ${p.c};color:${p.c};display:flex;align-items:center;justify-content:center;margin-bottom:12px">
            ${i === 3 ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/></svg>`}
          </div>
          <div style="text-align:center">
            <div style="font-size:.65rem;color:var(--text-3);margin-bottom:4px">${p.t}</div>
            <div style="font-size:.7rem;font-weight:700;color:var(--text-2);margin-bottom:2px">${p.d}</div>
            <div style="font-size:.6rem;color:${p.c}">${p.s}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="card" style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">กิจกรรมล่าสุด</div>
          <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูทั้งหมด</a>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
        { t: 'หลักสูตรแนะนำ', d: '12 หลักสูตร', i: 'book' },
        { t: 'บทความน่าอ่าน', d: '28 บทความ', i: 'file-text' },
        { t: 'วิดีโอแนะนำ', d: '18 วิดีโอ', i: 'play' },
        { t: 'เวิร์กช็อป', d: '5 เวิร์กช็อป', i: 'users' }
      ].map(r => `
        <div style="background:#f8fafc;padding:12px;border-radius:10px;text-align:center;cursor:pointer;border:1px solid transparent;transition:all 0.2s" onmouseover="this.style.background='#fff';this.style.borderColor='#e2e8f0';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.05)'" onmouseout="this.style.background='#f8fafc';this.style.borderColor='transparent';this.style.boxShadow='none'">
          <div style="width:32px;height:32px;border-radius:8px;background:#eff6ff;color:#3b82f6;display:flex;align-items:center;justify-content:center;margin:0 auto 8px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg></div>
          <div style="font-size:.65rem;font-weight:700;color:var(--text-2);margin-bottom:2px">${r.t}</div>
          <div style="font-size:.55rem;color:var(--text-3)">${r.d}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>
  `;
  }

  // ---------- CORE VALUES ----------
  window.pageCoreValues = function() {
    setTimeout(initCoreValuesCharts, 100);

    const values = [
      { t: 'ลูกค้าเป็นศูนย์กลาง', st: 'Customer Focus', d: 'เราเข้าใจความต้องการของลูกค้าและส่งมอบคุณค่าที่เหนือความคาดหวัง', b: ['รับฟังอย่างตั้งใจ', 'เข้าใจความต้องการที่แท้จริง', 'ส่งมอบคุณค่าอย่างต่อเนื่อง'], c: '#6366f1' },
      { t: 'มุ่งมั่นสู่ผลลัพธ์', st: 'Results Driven', d: 'เรากำหนดเป้าหมายที่ท้าทายและมุ่งมั่นเพื่อให้บรรลุผลสำเร็จ', b: ['ตั้งเป้าหมายที่ชัดเจน', 'ยึดมั่นในความรับผิดชอบ', 'วัดผลและพัฒนาต่อเนื่อง'], c: '#10b981' },
      { t: 'คิดสร้างสรรค์', st: 'Innovative', d: 'เราคิดค้นสิ่งใหม่ๆ เพื่อพัฒนาและสร้างคุณค่าให้กับองค์กร', b: ['เปิดรับแนวคิดใหม่', 'กล้าทดลองและเรียนรู้', 'พัฒนาอย่างไม่หยุดนิ่ง'], c: '#f59e0b' },
      { t: 'ซื่อสัตย์และโปร่งใส', st: 'Integrity', d: 'เรายึดมั่นในความซื่อสัตย์และดำเนินงานอย่างโปร่งใส', b: ['ซื่อสัตย์ต่อหน้าที่', 'โปร่งใสตรวจสอบได้', 'ยึดมั่นในจรรยาบรรณ'], c: '#3b82f6' },
      { t: 'ร่วมมือและเคารพกัน', st: 'Collaboration', d: 'เราทำงานร่วมกันด้วยความเคารพและเชื่อมั่นในพลังของทีม', b: ['เคารพความแตกต่าง', 'สื่อสารและช่วยเหลือกัน', 'ทำงานเป็นหนึ่งเดียวกัน'], c: '#a855f7' },
    ];

    return `
  <!-- Top Search Bar -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:18px">
    <div style="position:relative;width:300px">
      <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-3)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="ค้นหาคอร์ส, ทักษะ, หมวดหมู่..." style="width:100%;padding:8px 12px 8px 36px;border-radius:8px;border:1px solid var(--border);font-size:.8rem;outline:none;background:#fff">
    </div>
  </div>

  <!-- KPIs Row -->
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#f5f3ff;display:flex;align-items:center;justify-content:center;color:#8b5cf6"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
      <div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text)">5</div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">ค่านิยมองค์กร</div>
        <div style="font-size:.6rem;color:var(--text-3)">Core Values</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#10b981"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
      <div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text)">92%</div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">การรับรู้และเข้าใจ</div>
        <div style="font-size:.6rem;color:var(--text-3)">Awareness</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#fff7ed;display:flex;align-items:center;justify-content:center;color:#f97316"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.82-8.82 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
      <div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text)">4.8/5</div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">คะแนนความผูกพัน</div>
        <div style="font-size:.6rem;color:var(--text-3)">Engagement Score</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
      <div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text)">1,248</div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">พนักงานที่มีส่วนร่วม</div>
        <div style="font-size:.6rem;color:var(--text-3)">Employees Engaged</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:center;gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#fef2f2;display:flex;align-items:center;justify-content:center;color:#ef4444"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text)">12</div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">กิจกรรมปีนี้</div>
        <div style="font-size:.6rem;color:var(--text-3)">Activities This Year</div>
      </div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 300px;gap:20px">
    <div style="display:flex;flex-direction:column;gap:20px">
      <!-- Core Value Cards -->
      <div class="card" style="padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div style="font-size:1rem;font-weight:700">ค่านิยมองค์กรของเรา (Our Core Values)</div>
          <div style="font-size:.75rem;color:var(--primary);text-decoration:none">ดูทั้งหมด</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">
          ${values.map(v => `
          <div style="border:1px solid var(--border);border-radius:12px;padding:20px 16px;text-align:center;position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;transition:all 0.3s" onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';this.style.borderColor='${v.c}'" onmouseout="this.style.boxShadow='none';this.style.borderColor='var(--border)'">
            <div style="position:absolute;top:12px;right:12px;color:var(--text-3);cursor:pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.82-8.82 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
            <div style="width:56px;height:56px;border-radius:50%;background:${v.c}10;color:${v.c};display:flex;align-items:center;justify-content:center;margin-bottom:4px">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <div style="font-size:.8rem;font-weight:700;color:var(--text-2)">${v.t}</div>
              <div style="font-size:.65rem;color:var(--text-3);margin-top:2px">${v.st}</div>
            </div>
            <div style="font-size:.6rem;color:var(--text-3);line-height:1.4">${v.d}</div>
            <div style="width:100%;text-align:left;display:flex;flex-direction:column;gap:6px;margin-top:8px">
              ${v.b.map(bullet => `<div style="display:flex;align-items:center;gap:6px;font-size:.6rem;color:var(--text-2)"><div style="width:4px;height:4px;border-radius:50%;background:${v.c}"></div>${bullet}</div>`).join('')}
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Values in Action & Survey -->
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:20px">
        <div class="card" style="padding:20px">
          <div style="font-size:1rem;font-weight:700;margin-bottom:8px">การนำค่านิยมไปใช้ในการทำงาน</div>
          <div style="font-size:.7rem;color:var(--text-3);margin-bottom:20px">ตัวอย่างพฤติกรรมที่สอดคล้องกับค่านิยมองค์กร</div>
          <table style="width:100%;border-collapse:collapse;font-size:.75rem">
            <thead>
              <tr style="text-align:left;color:var(--text-3);border-bottom:1px solid var(--border)">
                <th style="padding:10px 0;font-weight:600;white-space:nowrap">ชื่อพนักงาน</th>
                <th style="padding:10px 0;font-weight:600;white-space:nowrap">ตำแหน่ง/แผนก</th>
              </tr>
            </thead>
            <tbody>
              ${values.map(v => `
              <tr style="border-bottom:1px solid #f8fafc">
                <td style="padding:12px 0;white-space:nowrap">
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:24px;height:24px;border-radius:50%;background:${v.c}10;color:${v.c};display:flex;align-items:center;justify-content:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                    <span style="font-weight:500">${v.t}</span>
                  </div>
                </td>
                <td style="padding:12px 0;color:var(--text-3);line-height:1.4;white-space:nowrap">${v.d}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="card" style="padding:20px">
          <div style="font-size:1rem;font-weight:700;margin-bottom:6px">ผลสำรวจการรับรู้ค่านิยม</div>
          <div style="font-size:.7rem;color:var(--text-3);margin-bottom:24px">จากพนักงานทั้งหมด</div>
          <div style="display:flex;gap:24px;align-items:center">
            <div style="position:relative;width:140px;height:140px">
               <canvas id="awarenessDonutChart"></canvas>
               <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
                 <div style="font-size:1.6rem;font-weight:700;color:var(--text)">92%</div>
                 <div style="font-size:.65rem;color:var(--text-3)">รับรู้และเข้าใจ</div>
               </div>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:8px">
              ${[
        { l: 'เข้าใจอย่างดี', p: 59, c: '#10b981' },
        { l: 'เข้าใจ', p: 33, c: '#3b82f6' },
        { l: 'ไม่แน่ใจ', p: 6, c: '#f59e0b' },
        { l: 'ไม่เข้าใจ', p: 2, c: '#ef4444' }
      ].map(item => `
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:.75rem">
                <div style="display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:50%;background:${item.c}"></div>${item.l}</div>
                <div style="font-weight:700">${item.p}%</div>
              </div>`).join('')}
            </div>
          </div>
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:.6rem;color:#10b981;font-weight:600">เชี่ยวชาญ 12 ทักษะ</div>
            <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูผลสำรวจฉบับเต็ม ❯</a>
          </div>
        </div>
      </div>

      <!-- Movement Cards -->
      <div style="margin-top:10px">
        <div style="font-size:1rem;font-weight:700;margin-bottom:16px">คุณสามารถร่วมขับเคลื่อนค่านิยมองค์กรได้อย่างไร?</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px">
          ${[
        { t: 'เข้าใจ', d: 'ทำความเข้าใจค่านิยมอย่างลึกซึ้ง', i: 'heart', c: '#ef4444' },
        { t: 'นำไปใช้', d: 'ปฏิบัติในการทำงานในทุกๆ วัน', i: 'users', c: '#10b981' },
        { t: 'บอกต่อ', d: 'แบ่งปันและชวนเพื่อนร่วมงานให้เห็นความสำคัญ', i: 'message-square', c: '#3b82f6' },
        { t: 'เป็นแบบอย่าง', d: 'เป็นต้นแบบที่ดีและสร้างอิทธิพลเชิงบวก', i: 'star', c: '#6366f1' },
        { t: 'พัฒนาอย่างต่อเนื่อง', d: 'เรียนรู้และพัฒนาตนเองให้สอดคล้องกับค่านิยม', i: 'trending-up', c: '#a855f7' },
      ].map(item => `
          <div class="card" style="padding:16px;display:flex;gap:12px;align-items:center;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
            <div style="width:36px;height:36px;border-radius:8px;background:${item.c}10;color:${item.c};display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <div style="font-size:.8rem;font-weight:700;color:var(--text-2)">${item.t}</div>
              <div style="font-size:.6rem;color:var(--text-3);margin-top:2px">${item.d}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div style="display:flex;flex-direction:column;gap:20px">
      <!-- News -->
      <div class="card" style="padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">กิจกรรมล่าสุด</div>
          <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูทั้งหมด</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          ${[
        { t: 'งาน Core Values Day 2025', d: 'เชิญชวนพนักงานร่วมกิจกรรมเฉลิมฉลองค่านิยมองค์กรของเรา', date: '15 พ.ค. 2568' },
        { t: 'Core Values ในการทำงานจริง', d: 'เรื่องราวจากพนักงานที่นำค่านิยมองค์กรไปใช้จนเกิดผลลัพธ์ที่ยอดเยี่ยม', date: '2 พ.ค. 2568' },
        { t: 'ร่วมแชร์! คุณใช้ค่านิยมอย่างไร?', d: 'ร่วมแบ่งปันประสบการณ์การใช้ค่านิยมในการทำงาน', date: '28 เม.ย. 2568' }
      ].map(news => `
          <div style="display:flex;gap:8px">
            <div style="width:60px;height:60px;border-radius:8px;background:#f1f5f9;flex-shrink:0;overflow:hidden">
              <div style="width:100%;height:100%;background:linear-gradient(45deg,#3b82f6,#6366f1);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.5rem;font-weight:700;text-align:center">CORE<br>VALUES</div>
            </div>
            <div>
              <div style="font-size:.7rem;font-weight:700;color:var(--text-2);line-height:1.3">${news.t}</div>
              <div style="font-size:.6rem;color:var(--text-3);margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${news.d}</div>
              <div style="font-size:.55rem;color:var(--text-3);margin-top:4px">${news.date}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="card" style="padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">กิจกรรมล่าสุด</div>
          <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูทั้งหมด</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${[
        { t: 'Core Values Workshop', d: '20 พ.ค. 2568 • 13:00 - 16:00 น.' },
        { t: 'Core Values Talk', d: '5 มิ.ย. 2568 • 10:00 - 11:30 น.' },
        { t: 'Core Values Day 2025', d: '18 มิ.ย. 2568 • ทั้งวัน' }
      ].map(ev => `
          <div style="display:flex;gap:12px;align-items:center">
             <div style="width:32px;height:32px;border-radius:8px;background:#f5f3ff;color:#8b5cf6;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
             <div>
               <div style="font-size:.7rem;font-weight:700;color:var(--text-2)">${ev.t}</div>
               <div style="font-size:.6rem;color:var(--text-3)">${ev.d}</div>
             </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Recognition -->
      <div class="card" style="padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">กิจกรรมล่าสุด</div>
          <a href="#" style="font-size:.7rem;color:var(--primary);text-decoration:none">ดูทั้งหมด</a>
        </div>
        <div style="text-align:center;padding:10px 0">
           <div style="width:40px;height:40px;border-radius:50%;background:#fff7ed;color:#f59e0b;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;box-shadow:0 4px 12px rgba(245,158,11,0.2)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
           <div style="font-size:.8rem;font-weight:700;color:var(--text-2)">คนต้นแบบค่านิยม</div>
           <div style="font-size:.65rem;color:var(--text-3);margin-top:2px">ประจำเดือน เมษายน 2568</div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:16px;padding:0 10px">
           ${[
        { n: 'Kannika S.', d: 'Project Control' },
        { n: 'Jirawat P.', d: 'Cost Estimation' },
        { n: 'Nattapol K.', d: 'Procurement' }
      ].map(person => `
           <div style="text-align:center">
             <div style="width:44px;height:44px;border-radius:50%;background:#f1f5f9;margin-bottom:8px;overflow:hidden;border:2px solid #fff;box-shadow:0 4px 8px rgba(0,0,0,0.05)">
               <div style="width:100%;height:100%;background:linear-gradient(135deg,#6366f1,#a855f7)"></div>
             </div>
             <div style="font-size:.65rem;font-weight:700;color:var(--text-2)">${person.n.split(' ')[0]}</div>
             <div style="font-size:.55rem;color:var(--text-3)">${person.d}</div>
           </div>`).join('')}
        </div>
        <div style="display:flex;justify-content:center;gap:6px;margin-top:16px">
           <div style="width:6px;height:6px;border-radius:50%;background:var(--primary)"></div>
           <div style="width:6px;height:6px;border-radius:50%;background:#e2e8f0"></div>
           <div style="width:6px;height:6px;border-radius:50%;background:#e2e8f0"></div>
        </div>
      </div>
    </div>
  </div>
  `;
  }

  // ---------- EMPLOYEE ----------
  window.pageEmployee = function() {
    setTimeout(() => {
      const contentEl = document.getElementById('pageContent');
      if (contentEl) {
        contentEl.innerHTML = window._renderEmployeeContent();
        if (typeof lucide !== 'undefined') lucide.createIcons({ root: contentEl });
        if (typeof window.bindEmployeeFilters === 'function') setTimeout(window.bindEmployeeFilters, 50);
      }
    }, 50);

    return `
    <div style="min-height:400px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-3); gap:12px;">
       <div style="width:30px;height:30px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
       <div style="font-size:0.9rem;font-weight:500;">Loading Employee Data...</div>
    </div>`;
  }

  window._renderEmployeeContent = function() {
    const employees = DATA.employees || [];
    const totalEmployees = employees.length;

    // Calculate dynamic status counts
    const stActive = employees.filter(e => e.empType === 'พนักงานประจำ' && e.status !== 'resigned').length;
    const stOnLeave = employees.filter(e => e.status === 'on-leave').length;
    const stSick = employees.filter(e => e.status === 'sick-leave').length;
    const stProbation = employees.filter(e => e.status === 'probation' || e.empType === 'พนักงานทดลองงาน').length;
    const stResigned = employees.filter(e => e.status === 'resigned').length;
    const stContract = employees.filter(e => e.empType === 'พนักงานสัญญาจ้าง').length;
    const stLeaveToday = stOnLeave + stSick;
    const stNew = 0; // Set to 0 as requested
    const displayTotal = totalEmployees || 1;

    // Sync to window for chart access if needed
    window._stActive = stActive;
    window._stProbation = stProbation;
    window._stOnLeave = stOnLeave;
    window._stSick = stSick;

    // Pagination state
    if (typeof window.empCurrentPage === 'undefined') window.empCurrentPage = 1;
    window.empPageSize = 10;

    // Helper function to format birthday
    const formatBirthdate = (str) => {
      if (!str || str === '-') return '-';
      const parts = str.split('/');
      if (parts.length < 2) return str;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const d = parts[0].padStart(2, '0');
      const m = months[parseInt(parts[1]) - 1] || parts[1];
      return `${d}-${m}`;
    };

    // Helper for avatar text
    const getAvatarText = (e) => {
      if (e.nickname && e.nickname !== '-') return e.nickname;
      if (!e.name || e.name === '-') return '-';
      // Use first part of Thai name (First Name)
      return e.name.trim().split(/\s+/)[0];
    };

    // Helper function to render rows based on filter state
    window.renderEmployeeRows = (data) => {
      const totalFiltered = data.length;
      const startIndex = (window.empCurrentPage - 1) * window.empPageSize;
      const paginatedData = data.slice(startIndex, startIndex + window.empPageSize);

      if (paginatedData.length === 0 && totalFiltered > 0) {
        window.empCurrentPage = 1;
        return renderEmployeeRows(data);
      }

      return paginatedData.length > 0 ? paginatedData.map(e => `
      <tr>
        <td style="padding: 6px 10px">
          <div style="display:flex; align-items:center; gap:8px">
            <div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, #6366f1, #8b5cf6); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:.7rem; box-shadow: 0 4px 10px rgba(99,102,241,0.2); flex-shrink:0">${getAvatarText(e)}</div>
            <div style="display:flex; flex-direction:column; gap:2px">
              <div style="font-weight:700; color:var(--text); font-size:.8rem; line-height:1.2; white-space:nowrap">${e.name}</div>
              <div style="font-size:.65rem; color:var(--text-3); font-weight:500; white-space:nowrap">${e.nameEn || '-'}</div>
              <div style="font-size:.65rem; color:var(--primary); font-weight:600; letter-spacing:0.5px">${e.id}</div>
            </div>
          </div>
        </td>
        <td style="font-size:.7rem; font-weight:500; color:var(--text-2)">${e.pos}</td>
        <td style="font-size:.7rem; font-weight:500; color:var(--text-2)">${e.dept}</td>
        <td style="font-size:.7rem; color:var(--text-2)">${e.email || '-'}</td>
        <td style="font-size:.7rem; color:var(--text-3); white-space:nowrap">${e.shift || '-'}</td>
        <td style="font-size:.7rem; color:var(--text-3); white-space:nowrap">${e.offdays || '-'}</td>
        <td style="font-size:.7rem; color:var(--text-3)">${formatBirthdate(e.birthdate)}</td>
        <td style="font-size:.7rem; color:var(--text-3)">${e.empType || '-'}</td>
        <td>
          <div id="emp_status_${e.id}" style="display:inline-flex; align-items:center">
            ${(() => {
          let label = 'ปฏิบัติงาน';
          let color = '#10b981';
          let bg = '#ecfdf5';
          let border = '#d1fae5';

          if (e.status === 'resigned' || e.status === 'ลาออก') {
            label = 'ลาออก'; color = '#64748b'; bg = '#f8fafc'; border = '#e2e8f0';
          } else {
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            const leave = (DATA.leaveRequests || []).find(r =>
              r.name === e.name &&
              (r.status === 'approved' || r.status === 'อนุมัติแล้ว') &&
              r.startRaw <= todayStr && r.endRaw >= todayStr
            );
            if (leave) {
              label = leave.type; color = '#0ea5e9'; bg = '#f0f9ff'; border = '#e0f2fe';
            } else {
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const todayName = dayNames[now.getDay()];
              const offDays = (e.offdays || '').split(/[,|\-]/).map(d => d.trim());
              if (offDays.some(d => d.includes(todayName) || (todayName === 'Sun' && d.includes('อา')) || (todayName === 'Mon' && d.includes('จ')) || (todayName === 'Tue' && d.includes('อ')) || (todayName === 'Wed' && d.includes('พ')) || (todayName === 'Thu' && d.includes('พฤ')) || (todayName === 'Fri' && d.includes('ศ')) || (todayName === 'Sat' && d.includes('ส')))) {
                label = 'วันหยุด'; color = '#f59e0b'; bg = '#fffbeb'; border = '#fef3c7';
              }
            }
          }

          return `
                <div style="display:flex; align-items:center; gap:6px; padding:4px 12px; border-radius:20px; background:${bg}; border:1px solid ${border}; color:${color}; font-size:.65rem; font-weight:700; white-space:nowrap">
                  <div style="width:5px; height:5px; border-radius:50%; background:${color}; box-shadow:0 0 8px ${color}60"></div>
                  ${label}
                </div>
              `;
        })()}
          </div>
        </td>
        <td style="text-align:center; position:relative">
          <button onclick="toggleActionMenu('${e.id}', event)" style="background:none; border:none; color:var(--text-3); cursor:pointer; padding:4px"><i data-lucide="more-vertical" style="width:16px; height:16px"></i></button>
          <div id="actionMenu_${e.id}" style="display:none; position:absolute; right:100%; top:50%; transform:translateY(-50%); background:#fff; border:1px solid var(--border); border-radius:8px; box-shadow:var(--shadow-md); z-index:100; min-width:100px; padding:4px">
            <button onclick="editEmployee('${e.id}')" style="width:100%; text-align:left; padding:8px 12px; background:none; border:none; font-family:Kanit; font-size:.75rem; cursor:pointer; color:var(--text-2); border-radius:6px" onmouseover="this.style.background='#f4f7fe'" onmouseout="this.style.background='none'"><i data-lucide="edit-2" style="width:12px; height:12px; margin-right:6px; vertical-align:middle"></i> แก้ไข</button>
            <button onclick="deleteEmployee('${e.id}')" style="width:100%; text-align:left; padding:8px 12px; background:none; border:none; font-family:Kanit; font-size:.75rem; cursor:pointer; color:#ef4444; border-radius:6px" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'"><i data-lucide="trash-2" style="width:12px; height:12px; margin-right:6px; vertical-align:middle"></i> ลบ</button>
          </div>
        </td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="9" style="text-align:center; padding:40px; color:var(--text-3); font-size:.8rem;">
          <i data-lucide="users" style="width:32px; height:32px; margin-bottom:8px; color:#cbd5e1; display:block; margin:0 auto"></i>
          ไม่พบข้อมูลที่ตรงกับการค้นหา
        </td>
      </tr>
    `;
    };

    window.renderEmployeePagination = (totalFiltered) => {
      const totalPages = Math.ceil(totalFiltered / window.empPageSize);
      const pagin = document.getElementById('empPagination');
      const info = document.getElementById('tableInfo');
      if (!pagin || !info) return;

      const start = totalFiltered > 0 ? (window.empCurrentPage - 1) * window.empPageSize + 1 : 0;
      const end = Math.min(window.empCurrentPage * window.empPageSize, totalFiltered);
      info.innerText = `แสดง ${start} - ${end} จาก ${totalFiltered} คน`;

      let btns = `
      <button onclick="changeEmployeePage(${window.empCurrentPage - 1})" class="btn btn-icon-sm" style="background:#fff; border:1px solid var(--border)" ${window.empCurrentPage === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed"' : ''}>
        <i data-lucide="chevron-left" style="width:14px; height:14px"></i>
      </button>
    `;

      const maxVisible = 5;
      let startPage = Math.max(1, window.empCurrentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

      if (startPage > 1) {
        btns += `<button onclick="changeEmployeePage(1)" class="btn btn-sm" style="background:transparent; border:none; color:var(--text-3)">1</button>`;
        if (startPage > 2) btns += `<span style="color:var(--text-3); font-size:.75rem">...</span>`;
      }

      for (let i = startPage; i <= endPage; i++) {
        const active = i === window.empCurrentPage;
        btns += `<button onclick="changeEmployeePage(${i})" class="btn btn-sm" style="${active ? 'background:var(--primary); color:#fff; border:none; font-weight:700' : 'background:transparent; border:none; color:var(--text-3)'}">${i}</button>`;
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) btns += `<span style="color:var(--text-3); font-size:.75rem">...</span>`;
        btns += `<button onclick="changeEmployeePage(${totalPages})" class="btn btn-sm" style="background:transparent; border:none; color:var(--text-3)">${totalPages}</button>`;
      }

      btns += `
      <button onclick="changeEmployeePage(${window.empCurrentPage + 1})" class="btn btn-icon-sm" style="background:#fff; border:1px solid var(--border)" ${window.empCurrentPage === totalPages || totalPages === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed"' : ''}>
        <i data-lucide="chevron-right" style="width:14px; height:14px"></i>
      </button>
    `;

      pagin.innerHTML = btns;
      if (window.lucide) lucide.createIcons({ root: pagin });
    };

    window.changeEmployeePage = (p) => {
      window.empCurrentPage = p;
      applyEmployeeFilters();
    };

    window.applyEmployeeFilters = () => {
      const allEmps = DATA.employees;
      const totalEmps = allEmps.length;

      const pos = document.getElementById('filterPos').value;
      const team = document.getElementById('filterTeam').value;
      const status = document.getElementById('filterStatus').value;
      const search = document.getElementById('filterSearch').value.toLowerCase();

      const filtered = allEmps.filter(e => {
        return (!pos || e.pos === pos) &&
          (!team || e.dept === team) &&
          (!status || e.status === status) &&
          (!search ||
            e.name.toLowerCase().includes(search) ||
            (e.nameEn && e.nameEn.toLowerCase().includes(search)) ||
            (e.nickname && e.nickname.toLowerCase().includes(search)) ||
            e.id.toLowerCase().includes(search)
          );
      });

      const tableBody = document.getElementById('employeeTableBody');
      tableBody.innerHTML = renderEmployeeRows(filtered);
      if (window.lucide) lucide.createIcons({ root: tableBody });
      renderEmployeePagination(filtered.length);
    };

    window.clearEmployeeFilters = () => {
      document.getElementById('filterPos').value = "";
      document.getElementById('filterTeam').value = "";
      document.getElementById('filterStatus').value = "";
      document.getElementById('filterSearch').value = "";
      applyEmployeeFilters();
    };

    const html = `

  <div class="fade-in" style="display:grid; grid-template-columns:repeat(6,1fr); gap:16px; margin-bottom:24px">
    <div class="stat-card" style="padding:20px; align-items:flex-start; gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#f5f3ff;color:#6366f1;display:flex;align-items:center;justify-content:center"><i data-lucide="users" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600;margin-bottom:4px">พนักงานทั้งหมด</div>
        <div style="font-size:1.5rem;font-weight:700;color:var(--text)">${totalEmployees} <span style="font-size:.75rem; font-weight:400; color:var(--text-3)">คน</span></div>
        <div style="font-size:.65rem;color:#10b981;font-weight:600;margin-top:4px">↑ 0 คน <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:20px; align-items:flex-start; gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#eff6ff;color:#3b82f6;display:flex;align-items:center;justify-content:center"><i data-lucide="user-check" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600;margin-bottom:4px">พนักงานประจำ</div>
        <div style="font-size:1.5rem;font-weight:700;color:var(--text)">${stActive} <span style="font-size:.75rem; font-weight:400; color:var(--text-3)">คน</span></div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:400;margin-top:4px">${((stActive / displayTotal) * 100).toFixed(1)}% <span style="color:var(--text-3)">ของทั้งหมด</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:20px; align-items:flex-start; gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#fff7ed;color:#f97316;display:flex;align-items:center;justify-content:center"><i data-lucide="user" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600;margin-bottom:4px">พนักงานสัญญาจ้าง</div>
        <div style="font-size:1.5rem;font-weight:700;color:var(--text)">${stContract} <span style="font-size:.75rem; font-weight:400; color:var(--text-3)">คน</span></div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:400;margin-top:4px">${((stContract / displayTotal) * 100).toFixed(1)}% <span style="color:var(--text-3)">ของทั้งหมด</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:20px; align-items:flex-start; gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#f0fdf4;color:#10b981;display:flex;align-items:center;justify-content:center"><i data-lucide="user-plus" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600;margin-bottom:4px">ทดลองงาน</div>
        <div style="font-size:1.5rem;font-weight:700;color:var(--text)">${stProbation} <span style="font-size:.75rem; font-weight:400; color:var(--text-3)">คน</span></div>
        <div style="font-size:.65rem;color:#10b981;font-weight:600;margin-top:4px">${((stProbation / displayTotal) * 100).toFixed(1)}% <span style="color:var(--text-3);font-weight:400">ของทั้งหมด</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:20px; align-items:flex-start; gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#f1f5f9;color:#64748b;display:flex;align-items:center;justify-content:center"><i data-lucide="user-minus" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600;margin-bottom:4px">พนักงานลาออก</div>
        <div style="font-size:1.5rem;font-weight:700;color:var(--text)">${stResigned} <span style="font-size:.75rem; font-weight:400; color:var(--text-3)">คน</span></div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:400;margin-top:4px">${((stResigned / displayTotal) * 100).toFixed(1)}% <span style="color:var(--text-3)">ของทั้งหมด</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:20px; align-items:flex-start; gap:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:#fff1f2;color:#f43f5e;display:flex;align-items:center;justify-content:center"><i data-lucide="calendar-off" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600;margin-bottom:4px">พนักงานที่ลางานวันนี้</div>
        <div style="font-size:1.5rem;font-weight:700;color:var(--text)">${stLeaveToday} <span style="font-size:.75rem; font-weight:400; color:var(--text-3)">คน</span></div>
        <div style="font-size:.65rem;color:#f43f5e;font-weight:500;margin-top:4px">ลาพักร้อน ${stOnLeave} | ลาป่วย ${stSick}</div>
      </div>
    </div>
  </div>

  <!-- Charts Row -->
  <div class="fade-in delay-1" style="display:grid; grid-template-columns:1fr 1fr 1.2fr 1fr; gap:16px; margin-bottom:24px">
    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
        <div style="font-size:.9rem; font-weight:700">พนักงานตามระดับตำแหน่ง</div>
      </div>
      <div style="height:240px">
        <canvas id="empLevelChart"></canvas>
      </div>
    </div>
    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
        <div style="font-size:.9rem; font-weight:700">พนักงานตามระดับตำแหน่ง</div>
      </div>
      <div style="height:240px; position:relative">
        <canvas id="empDeptChart"></canvas>
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center">
          <div style="font-size:1.8rem; font-weight:700">${totalEmployees}</div>
          <div style="font-size:.7rem; color:var(--text-3)">คน</div>
        </div>
      </div>
    </div>
    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
        <div style="font-size:.9rem; font-weight:700">สถานะพนักงาน (Employee Status)</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:16px; justify-content:center; height:240px">
        ${[
        { name: 'ปฏิบัติงาน (Active)', val: stActive, color: '#10b981' },
        { name: 'ทดลองงาน (Probation)', val: stProbation, color: '#6366f1' },
        { name: 'ลาพักร้อน (On Leave)', val: stOnLeave, color: '#f59e0b' },
        { name: 'ลาป่วย (Sick Leave)', val: stSick, color: '#f43f5e' }
      ].map(s => `
          <div>
            <div style="display:flex; justify-content:space-between; font-size:.7rem; margin-bottom:6px">
              <span style="color:var(--text-2); font-weight:500">${s.name}</span>
              <span style="font-weight:700">${s.val} คน</span>
            </div>
            <div style="height:8px; background:#f1f5f9; border-radius:10px; overflow:hidden">
              <div style="width:${(s.val / displayTotal * 100)}%; height:100%; background:${s.color}; border-radius:10px"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
        <div style="font-size:.9rem; font-weight:700">พนักงานตามระดับตำแหน่ง</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:16px; height:240px; overflow-y:auto; padding-right:5px">
        ${(() => {
          const currentMonth = new Date().getMonth() + 1;
          const bdayEmps = DATA.employees.filter(e => {
            if (!e.birthdate) return false;
            const parts = e.birthdate.split('/');
            return parts.length >= 2 && parseInt(parts[1]) === currentMonth;
          }).sort((a, b) => {
            const dayA = parseInt(a.birthdate.split('/')[0]);
            const dayB = parseInt(b.birthdate.split('/')[0]);
            return dayA - dayB;
          });
  
          return bdayEmps.length > 0 ? bdayEmps.map(e => `
            <div style="display:flex; align-items:center; gap:8px">
              <div style="width:36px; height:36px; border-radius:50%; background:#fff1f2; color:#f43f5e; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:.65rem; border:1px solid #ffe4e6">${getAvatarText(e)}</div>
              <div style="flex:1">
                <div style="font-size:.7rem; font-weight:700; color:var(--text-2)">${e.name}</div>
                  <div style="font-size:.65rem; color:var(--text-3)">วันเกิด: ${e.birthdate.split('/')[0]} ${['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][currentMonth - 1]}</div>
              </div>
              <div style="color:#f43f5e"><i data-lucide="cake" style="width:16px; height:16px"></i></div>
            </div>
          `).join('') : `
              <div style="text-align:center; padding:20px; color:var(--text-3); font-size:.7rem">ไม่มีพนักงานเกิดในเดือนนี้</div>
          `;
        })()}
      </div>
    </div>
  </div>

  <div style="display:grid; grid-template-columns:1fr; gap:20px">
    <!-- Left: Data Table -->
    <div class="card fade-in" style="padding:0; overflow:hidden">
      <div style="padding:16px 20px; border-bottom:1px solid var(--border); display:flex; gap:10px; align-items:center; flex-wrap:nowrap; overflow-x:auto">
        <select id="filterPos" onchange="applyEmployeeFilters()" class="select-input" style="width:140px; flex-shrink:0">
          <option value="">ตำแหน่งทั้งหมด</option>
          <option value="Director">Director</option>
          <option value="Manager">Manager</option>
          <option value="Assistant Manager">Assistant Manager</option>
          <option value="Senior">Senior</option>
          <option value="Junior">Junior</option>
        </select>
        <select id="filterTeam" onchange="applyEmployeeFilters()" class="select-input" style="width:130px; flex-shrink:0">
          <option value="">ทีมทั้งหมด</option>
          <option value="ACE">ACE</option>
          <option value="Sertec">Sertec</option>
          <option value="ONIX">ONIX</option>
          <option value="Sale Support">Sale Support</option>
          <option value="Call Center">Call Center</option>
        </select>
        <select id="filterStatus" onchange="applyEmployeeFilters()" class="select-input" style="width:130px; flex-shrink:0">
          <option value="">สถานะทั้งหมด</option>
          <option value="active">ปฏิบัติงาน</option>
          <option value="resigned">ลาออก</option>
        </select>
        <div class="search-box" style="flex:1; min-width:200px; background:#f8fafc">
          <i data-lucide="search" style="width:14px; height:14px; color:var(--text-3)"></i>
          <input type="text" id="filterSearch" oninput="applyEmployeeFilters()" placeholder="Search..." style="font-size:.75rem">
        </div>
        <button onclick="clearEmployeeFilters()" style="background:#fef2f2; border:1px solid #fecaca; color:#ef4444; font-family:Kanit; font-size:.7rem; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; white-space:nowrap; transition:all 0.2s" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
          <i data-lucide="rotate-ccw" style="width:14px; height:14px"></i> Clear All Filter
        </button>
        <div style="width:1px; height:20px; background:var(--border); margin:0 4px"></div>
        <button onclick="openEmployeeModal()" class="btn btn-primary" style="display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; font-size:.7rem; flex-shrink:0">
          <i data-lucide="user-plus" style="width:16px; height:16px"></i> เพิ่มพนักงาน
        </button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead style="display: table-header-group !important;">
            <tr style="background: #f8f9fb !important;">
              <th style="padding: 12px 20px; text-align: left; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef; width: 220px;">พนักงาน</th>
              <th style="padding: 8px 8px; text-align: left; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef;">ตำแหน่ง</th>
              <th style="padding: 8px 8px; text-align: left; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef;">ทีม</th>
              <th style="padding: 8px 8px; text-align: left; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef;">E-mail</th>
              <th style="padding: 8px 8px; text-align: left; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef;">กะเวลา</th>
              <th style="padding: 8px 8px; text-align: left; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef;">วันหยุด</th>
              <th style="padding: 8px 8px; text-align: left; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef;">วันเกิด</th>
              <th style="padding: 8px 8px; text-align: left; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef;">ประเภทพนักงาน</th>
              <th style="padding: 8px 8px; text-align: left; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef;">สถานะ</th>
              <th style="padding: 8px 8px; text-align: center; font-weight: 700; color: #4b5675 !important; font-size: .8rem; border-bottom: 1px solid #e4e8ef; width: 80px; white-space: nowrap;">จัดการ</th>
            </tr>
          </thead>
          <tbody id="employeeTableBody">
            ${renderEmployeeRows(employees)}
          </tbody>
        </table>
      </div>

      <div style="padding:16px 20px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
        <div id="tableInfo" style="font-size:.75rem; color:var(--text-3)">แสดง 1 - 10 จาก ${totalEmployees} คน</div>
        <div id="empPagination" style="display:flex; gap:8px; align-items:center">
          <!-- Dynamic Pagination Buttons -->
        </div>
      </div>
    </div>

    </div>
    `;

      setTimeout(() => {
      if (typeof initEmployeeCharts === 'function') initEmployeeCharts();
      renderEmployeePagination(employees.length);
    }, 150);

    return html;
  }

  window.initEmployeeCharts = function() {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    };

    // Department Chart (Doughnut)
    const deptCtx = document.getElementById('empDeptChart')?.getContext('2d');
    if (deptCtx) {
      const emps = DATA.employees || [];
      const depts = ['ACE', 'Sertec', 'ONIX', 'Sale Support', 'Call Center'];
      const deptData = depts.map(d => emps.filter(e => e.dept === d).length);

      Chart.getChart(deptCtx.canvas)?.destroy();
      new Chart(deptCtx, {
        type: 'doughnut',
        data: {
          labels: depts,
          datasets: [{
            data: deptData,
            backgroundColor: ['#6366f1', '#3b82f6', '#818cf8', '#93c5fd', '#8ecead', '#10b981'],
            borderWidth: 0,
            cutout: '75%'
          }]
        },
        options: {
          ...commonOptions,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 6,
                font: { family: 'Kanit', size: 10 }
              }
            }
          }
        }
      });
    }

    // Level Chart (Horizontal Bar)
    const levelCtx = document.getElementById('empLevelChart')?.getContext('2d');
    if (levelCtx) {
      const emps = DATA.employees || [];
      const levels = ['Director', 'Manager', 'Assistant Manager', 'Senior', 'Junior', 'Probation'];
      const levelData = levels.map(l => emps.filter(e => e.pos === l).length);

      Chart.getChart(levelCtx.canvas)?.destroy();
      new Chart(levelCtx, {
        type: 'bar',
        data: {
          labels: levels,
          datasets: [{
            label: 'จำนวนพนักงาน',
            data: levelData,
            backgroundColor: ['#7FD1B9', '#818cf8', '#FCA5A5', '#FDE68A', '#93c5fd', '#c084fc'],
            borderRadius: 6,
            barThickness: 20
          }]
        },
        options: {
          indexAxis: 'y',
          ...commonOptions,
          scales: {
            x: {
              display: false,
              grid: { display: false },
              suggestedMax: Math.max(...levelData) + 5
            },
            y: { grid: { display: false }, ticks: { font: { family: 'Kanit', size: 10 } } }
          },
          plugins: {
            legend: { display: false }
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
                  ctx.fillStyle = '#4b5563';
                  ctx.font = 'bold 11px Kanit';
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
  }

  // ---------- WORKSHOP ----------
  window.pageWorkshop = function() {
    return `
  <div class="grid-2" style="margin-bottom:20px">
    <div class="card">
      <div class="card-title">Plan Workshop</div>
      <div class="workshop-timeline">
        ${DATA.workshops.map((w, i) => `
          <div class="ws-item">
            <div style="display:flex;flex-direction:column;align-items:center">
              <div class="ws-dot" style="background:${w.status == 'done' ? 'var(--accent)' : w.status == 'upcoming' ? 'var(--primary)' : 'var(--border)'}"></div>
              ${i < DATA.workshops.length - 1 ? `<div style="width:2px;flex:1;background:var(--border);min-height:16px;margin:3px 0"></div>` : ''}
            </div>
            <div class="ws-body">
              <div class="ws-title">${w.title}</div>
              <div class="ws-meta">📅 ${w.date} • 👤 ${w.trainer} • 👥 ${w.participants} คน • ${statusBadge(w.status)}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-title"><span>➕</span> เพิ่ม Workshop ใหม่</div>
      <div class="form-group"><label class="form-label">ชื่อ Workshop</label><input class="form-input" placeholder="เช่น SQL Advanced Training" /></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">วันที่</label><input class="form-input" type="date" /></div>
        <div class="form-group"><label class="form-label">วิทยากร</label><input class="form-input" placeholder="ชื่อวิทยากร" /></div>
      </div>
      <div class="form-group"><label class="form-label">จำนวนผู้เข้าร่วม</label><input class="form-input" type="number" placeholder="0" /></div>
      <button class="btn btn-primary" style="width:100%">+ บันทึก Workshop</button>
    </div>
  </div>`;
  }

  // ---------- PRODUCT SERVICE ----------
  window.pageProductService = function() {
    setTimeout(initProductServiceCharts, 100);

    const products = DATA.products;

    return `
  <!-- Header Actions -->
  <div style="display:flex; justify-content:flex-end; align-items:center; gap:12px; margin-bottom:20px; margin-top:-10px">
    <div class="search-box" style="width:250px; background:#fff">
      <i data-lucide="search" style="width:14px; height:14px; color:var(--text-3)"></i>
      <input type="text" placeholder="ค้นหาโครงการ, งาน, รายการ..." style="font-size:.75rem">
    </div>
    <button class="btn btn-sm" style="background:#fff; border:1px solid var(--border); color:var(--text-2); display:flex; align-items:center; gap:8px; padding:8px 14px">
      <i data-lucide="filter" style="width:14px; height:14px"></i> ตัวกรอง
    </button>
    <button class="btn btn-danger btn-sm" style="padding:8px 14px; font-size:.7rem; border-radius:8px; background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2); display:flex; align-items:center; gap:6px">
      <i data-lucide="rotate-ccw" style="width:13px; height:13px"></i> Clear All Filter
    </button>

    <div style="display:flex; border:1px solid var(--border); border-radius:8px; overflow:hidden; background:#fff">
      <button style="padding:8px; background:#f5f3ff; color:#6366f1; border:none; cursor:pointer"><i data-lucide="layout-grid" style="width:14px; height:14px"></i></button>
      <button style="padding:8px; background:#fff; border:none; color:var(--text-3); cursor:pointer; border-left:1px solid var(--border)"><i data-lucide="list" style="width:14px; height:14px"></i></button>
    </div>
    <button class="btn btn-primary" style="display:flex; align-items:center; gap:8px; padding:8px 16px; font-weight:600">
      <i data-lucide="plus" style="width:16px; height:16px"></i> เพิ่มบริการ
    </button>
  </div>

  <!-- KPIs Section -->
  <div class="fade-in" style="display:grid; grid-template-columns:repeat(6,1fr); gap:16px; margin-bottom:24px">
    <div class="stat-card" style="padding:16px; align-items:center; gap:12px; flex-direction:row">
      <div style="width:44px;height:44px;border-radius:12px;background:#f5f3ff;color:#6366f1;display:flex;align-items:center;justify-content:center"><i data-lucide="box" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">บริการทั้งหมด</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text)">24</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:16px; align-items:center; gap:12px; flex-direction:row">
      <div style="width:44px;height:44px;border-radius:12px;background:#f0fdf4;color:#10b981;display:flex;align-items:center;justify-content:center"><i data-lucide="briefcase" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">บริการที่ใช้งานอยู่</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text)">18</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:16px; align-items:center; gap:12px; flex-direction:row">
      <div style="width:44px;height:44px;border-radius:12px;background:#fff7ed;color:#f97316;display:flex;align-items:center;justify-content:center"><i data-lucide="dollar-sign" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">รายได้รวม (YTD)</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text)">฿ 12.40M</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 18.7% <span style="color:var(--text-3);font-weight:400">จากปีก่อน</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:16px; align-items:center; gap:12px; flex-direction:row">
      <div style="width:44px;height:44px;border-radius:12px;background:#eff6ff;color:#3b82f6;display:flex;align-items:center;justify-content:center"><i data-lucide="bar-chart-2" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">โครงการรวม</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text)">86</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:16px; align-items:center; gap:12px; flex-direction:row">
      <div style="width:44px;height:44px;border-radius:12px;background:#fef2f2;color:#ef4444;display:flex;align-items:center;justify-content:center"><i data-lucide="users" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">ลูกค้ารวม</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text)">56</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
    <div class="stat-card" style="padding:16px; align-items:center; gap:12px; flex-direction:row">
      <div style="width:44px;height:44px;border-radius:12px;background:#eff6ff;color:#3b82f6;display:flex;align-items:center;justify-content:center"><i data-lucide="clock" style="width:20px;height:20px"></i></div>
      <div>
        <div style="font-size:.65rem;color:var(--text-3);font-weight:600">อัตราการต่อสัญญา</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--text)">74%</div>
        <div style="font-size:.6rem;color:#10b981;font-weight:600">▲ 12.5% <span style="color:var(--text-3);font-weight:400">จากเดือนก่อน</span></div>
      </div>
    </div>
  </div>

  <!-- Filter & View Controls -->
  <div class="fade-in" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; gap:16px">
    <div style="display:flex; gap:12px; align-items:center; flex:1">
      <select class="select-input" style="width:180px"><option>หมวดหมู่ทั้งหมด</option></select>
      <select class="select-input" style="width:160px"><option>สถานะทั้งหมด</option></select>
      <div class="search-box" style="flex:1; max-width:400px; background:#fff">
        <i data-lucide="search" style="width:16px; height:16px; color:var(--text-3)"></i>
        <input type="text" placeholder="ค้นหาบริการหรือคำอธิบาย..." id="prodSearch" oninput="filterTable('prodTable','prodSearch')">
      </div>
    </div>
    <div style="display:flex; gap:12px; align-items:center">
      <div style="font-size:.8rem; color:var(--text-3)">เรียงตาม: <span style="color:var(--text-2); font-weight:600">รายได้ (มากไปน้อย)</span></div>
      <div style="display:flex; border:1px solid var(--border); border-radius:8px; overflow:hidden; background:#fff">
        <button style="padding:8px; background:#f5f3ff; color:#6366f1; border:none; cursor:pointer"><i data-lucide="layout-grid" style="width:14px; height:14px"></i></button>
        <button style="padding:8px; background:#fff; border:none; color:var(--text-3); cursor:pointer; border-left:1px solid var(--border)"><i data-lucide="list" style="width:14px; height:14px"></i></button>
        <button style="padding:8px; background:#fff; color:var(--text-3); border:none; cursor:pointer; border-left:1px solid var(--border)"><i data-lucide="align-left" style="width:14px; height:14px"></i></button>
      </div>
    </div>
  </div>

  <!-- Product Cards Grid -->
  <div class="fade-in delay-2" style="display:grid; grid-template-columns:repeat(5,1fr); gap:16px; margin-bottom:32px">
    ${products.slice(0, 5).map(p => `
      <div class="stat-card" style="padding:0; overflow:hidden; border:none; box-shadow:0 10px 25px rgba(0,0,0,0.05)">
        <div style="position:relative; height:140px">
          <img src="${p.img}" style="width:100%; height:100%; object-fit:cover">
          <div style="position:absolute; top:12px; left:12px">
            <span class="badge ${p.status === 'active' ? 'badge-green' : 'badge-yellow'}" style="text-transform:capitalize">${p.status}</span>
          </div>
          <button style="position:absolute; top:12px; right:12px; width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.8); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--text-3)"><i data-lucide="star" style="width:14px; height:14px"></i></button>
        </div>
        <div style="padding:16px">
          <div style="font-weight:700; font-size:.9rem; margin-bottom:4px; height:40px; overflow:hidden">${p.name}</div>
          <div style="font-size:.65rem; color:var(--primary); font-weight:600; margin-bottom:10px">${p.category}</div>
          <div style="font-size:.7rem; color:var(--text-3); margin-bottom:16px; line-height:1.4; height:38px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical">${p.desc}</div>
          
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px; border-top:1px solid #f1f5f9; padding-top:12px">
            <div>
              <div style="font-size:.55rem; color:var(--text-3)">รายได้ (YTD)</div>
              <div style="font-size:.7rem; font-weight:700">฿ ${(p.revenue / 1e6).toFixed(2)}M</div>
            </div>
            <div>
              <div style="font-size:.55rem; color:var(--text-3)">โครงการ</div>
              <div style="font-size:.7rem; font-weight:700">${p.projects}</div>
            </div>
            <div>
              <div style="font-size:.55rem; color:var(--text-3)">ลูกค้า</div>
              <div style="font-size:.7rem; font-weight:700">${p.customers}</div>
            </div>
          </div>
          
          <div style="display:flex; gap:6px">
            <button class="btn btn-sm" style="flex:1; font-size:.65rem; padding:6px; border:1px solid var(--border); background:#fff; color:var(--text-2)">ดูรายละเอียด</button>
            <button class="btn btn-sm" style="flex:1; font-size:.65rem; padding:6px; border:1px solid var(--border); background:#fff; color:var(--text-2)">โครงการที่เกี่ยวข้อง</button>
            <button style="width:28px; height:28px; border-radius:6px; border:1px solid var(--border); background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--text-3)"><i data-lucide="more-vertical" style="width:14px; height:14px"></i></button>
          </div>
        </div>
      </div>
    `).join('')}
  </div>

  <!-- Charts Row -->
  <div class="fade-in delay-2" style="display:grid; grid-template-columns:1.2fr 1.5fr 1fr; gap:20px; margin-bottom:32px">
    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
        <div style="font-size:.9rem; font-weight:700">ภาพรวมมูลค่าโดยสรุป (YTD)</div>
        <select class="select-input" style="width:90px; padding:4px 8px; font-size:.7rem"><option>YTD</option></select>
      </div>
      <div style="height:240px">
        <canvas id="revenueByServiceChart"></canvas>
      </div>
    </div>
    <div class="card" style="padding:20px">
      <div style="font-size:.9rem; font-weight:700; margin-bottom:20px">สัดส่วนรายได้ตามหมวดหมู่บริการ (YTD)</div>
      <div style="display:flex; align-items:center; gap:20px">
        <div style="position:relative; width:180px; height:180px">
          <canvas id="revenueShareChart"></canvas>
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center">
            <div style="font-size:1.1rem; font-weight:700">฿ 12.40M</div>
            <div style="font-size:.65rem; color:var(--text-3)">Total Revenue</div>
          </div>
        </div>
        <div id="revenueShareLegend" style="flex:1; display:grid; grid-template-columns:1fr; gap:10px"></div>
      </div>
    </div>
    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
        <div style="font-size:.9rem; font-weight:700">สถานะของรายการ</div>
        <a href="#" style="font-size:.7rem; color:var(--primary); font-weight:600; text-decoration:none">ดูทั้งหมด</a>
      </div>
      <div style="position:relative; height:180px; margin-bottom:20px">
        <canvas id="serviceStatusChart"></canvas>
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center">
          <div style="font-size:1.4rem; font-weight:700">24</div>
          <div style="font-size:.65rem; color:var(--text-3)">Total Services</div>
        </div>
      </div>
      <div id="statusLegend" style="display:grid; grid-template-columns:1fr; gap:10px"></div>
    </div>
  </div>

  <!-- Service List Table -->
  <div class="card fade-in delay-3" style="padding:0; overflow:hidden">
    <div style="padding:20px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border)">
      <div style="font-size:.95rem; font-weight:700">รายการบริการทั้งหมด</div>
      <div style="display:flex; gap:12px; align-items:center">
        <button style="display:flex; align-items:center; gap:6px; padding:8px 14px; background:#fff; border:1px solid var(--border); border-radius:8px; font-size:.8rem; color:var(--text-2); cursor:pointer">
          <i data-lucide="download" style="width:14px; height:14px"></i> ส่งออกข้อมูล
        </button>
        <a href="#" style="font-size:.8rem; color:var(--primary); font-weight:600; text-decoration:none">ดูทั้งหมด</a>
      </div>
    </div>
    <div class="table-wrap">
      <table class="data-table" id="prodTable">
        <thead>
          <tr>
              <th style="padding-left:20px">รหัสรายการ</th>
            <th>หมวดหมู่</th>
            <th>รายได้ (YTD)</th>
            <th>โครงการ</th>
            <th>ลูกค้า</th>
            <th style="width:180px">อัตราการใช้งาน</th>
            <th>สถานะ</th>
              <th>ผู้รับผิดชอบ</th>
              <th style="text-align:center">การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td style="padding-left:20px">
                <div style="display:flex; align-items:center; gap:8px">
                  <div style="width:32px; height:32px; border-radius:8px; background:#f8fafc; border:1px solid var(--border); overflow:hidden">
                    <img src="${p.img}" style="width:100%; height:100%; object-fit:cover">
                  </div>
                  <span style="font-weight:600; color:var(--text-2)">${p.name}</span>
                </div>
              </td>
              <td><span style="font-size:.7rem; color:var(--text-3)">${p.category}</span></td>
              <td style="font-weight:600">฿ ${fmt(p.revenue)}</td>
              <td>${p.projects}</td>
              <td>${p.customers}</td>
              <td>
                <div style="display:flex; align-items:center; gap:10px">
                  <div style="flex:1; height:6px; background:#f1f5f9; border-radius:10px; overflow:hidden">
                    <div style="width:${p.usage}%; height:100%; background:#6366f1"></div>
                  </div>
                  <span style="font-size:.7rem; font-weight:700; color:var(--text-2); width:30px">${p.usage}%</span>
                </div>
              </td>
              <td><span class="badge ${p.status === 'active' ? 'badge-green' : 'badge-yellow'}" style="text-transform:capitalize">${p.status}</span></td>
              <td style="font-size:.7rem; color:var(--text-3)">${p.updated}</td>
              <td>
                <div style="display:flex; justify-content:center; gap:10px">
                  <button style="background:none; border:none; color:var(--text-3); cursor:pointer"><i data-lucide="eye" style="width:14px; height:14px"></i></button>
                  <button style="background:none; border:none; color:var(--text-3); cursor:pointer"><i data-lucide="edit-3" style="width:14px; height:14px"></i></button>
                  <button style="background:none; border:none; color:var(--text-3); cursor:pointer"><i data-lucide="more-horizontal" style="width:14px; height:14px"></i></button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
  `;
  }

  window.initProductServiceCharts = function() {
    const ctxRev = document.getElementById('revenueByServiceChart');
    const ctxShare = document.getElementById('revenueShareChart');
    const ctxStatus = document.getElementById('serviceStatusChart');
    if (!ctxRev || !ctxShare || !ctxStatus) return;

    if (Chart.getChart(ctxRev)) Chart.getChart(ctxRev).destroy();
    if (Chart.getChart(ctxShare)) Chart.getChart(ctxShare).destroy();
    if (Chart.getChart(ctxStatus)) Chart.getChart(ctxStatus).destroy();

    // 1. Revenue by Service (Bar)
    const products = DATA.products;
    new Chart(ctxRev, {
      type: 'bar',
      data: {
        labels: products.map(p => p.name.split(' ')[0]),
        datasets: [{
          data: products.map(p => p.revenue / 1e6),
          backgroundColor: '#6366f1', borderRadius: 4, barThickness: 24
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            display: true, align: 'top', color: '#6366f1',
            font: { family: 'Kanit', weight: '700', size: 10 },
            formatter: v => v.toFixed(2) + 'M'
          }
        },
        scales: {
          y: { ticks: { font: { family: 'Kanit' }, callback: v => v + 'M' }, grid: { color: '#f1f5f9' }, border: { display: false } },
          x: { ticks: { font: { family: 'Kanit', size: 9 } }, grid: { display: false }, border: { display: false } }
        }
      }
    });

    // 2. Revenue Share by Category (Donut)
    const cats = [
      { label: 'Energy Solution', value: 4.20, color: '#6366f1' },
      { label: 'Technology Solution', value: 2.80, color: '#3b82f6' },
      { label: 'Consulting Service', value: 2.15, color: '#f59e0b' },
      { label: 'Maintenance Service', value: 1.35, color: '#10b981' },
      { label: 'Security Solution', value: 0.95, color: '#ef4444' },
      { label: 'Others', value: 0.70, color: '#94a3b8' }
    ];

    new Chart(ctxShare, {
      type: 'doughnut',
      data: {
        labels: cats.map(c => c.label),
        datasets: [{
          data: cats.map(c => c.value),
          backgroundColor: cats.map(c => c.color),
          borderWidth: 0, cutout: '75%'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, datalabels: { display: false } }
      }
    });

    const shareLegend = document.getElementById('revenueShareLegend');
    if (shareLegend) {
      shareLegend.innerHTML = cats.map(c => `
      <div style="display:flex; align-items:center; gap:10px">
        <div style="width:8px; height:8px; border-radius:50%; background:${c.color}"></div>
        <div style="flex:1; font-size:.7rem; color:var(--text-2)">${c.label}</div>
        <div style="font-size:.75rem; font-weight:700">${(c.value * 100 / 12.4).toFixed(1)}% <span style="font-weight:400; color:var(--text-3); margin-left:4px">(฿ ${c.value.toFixed(2)}M)</span></div>
      </div>
    `).join('');
    }

    // 3. Service Status (Doughnut)
    const statusData = [
      { label: 'Active', value: 18, color: '#10b981', pct: 75 },
      { label: 'Maintenance', value: 3, color: '#f59e0b', pct: 12.5 },
      { label: 'Development', value: 2, color: '#3b82f6', pct: 8.3 },
      { label: 'Inactive', value: 1, color: '#94a3b8', pct: 4.2 }
    ];

    new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: statusData.map(s => s.label),
        datasets: [{
          data: statusData.map(s => s.value),
          backgroundColor: statusData.map(s => s.color),
          borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '80%',
        plugins: { legend: { display: false }, datalabels: { display: false } }
      }
    });

    const statusLegend = document.getElementById('statusLegend');
    if (statusLegend) {
      statusLegend.innerHTML = statusData.map(s => `
      <div style="display:flex; align-items:center; gap:10px">
        <div style="width:8px; height:8px; border-radius:50%; background:${s.color}"></div>
        <div style="flex:1; font-size:.7rem; color:var(--text-2)">${s.label}</div>
        <div style="font-size:.7rem; font-weight:700">${s.value} <span style="font-weight:400; color:var(--text-3); margin-left:4px">(${s.pct}%)</span></div>
      </div>
    `).join('');
    }
  }

  // ---------- REAL vs FORECAST ANALYSIS ----------
  window.pageRealVsForecast = function() {
    setTimeout(initComparisonCharts, 100);

    const projectTable = [
      { p: 'DIB-Solar Farm', f: '3,100,000', r: '2,450,000', v: '-650,000', vp: '-21.0%' },
      { p: 'DIB-Warehouse', f: '2,800,000', r: '2,100,000', v: '-700,000', vp: '-25.0%' },
      { p: 'DIB-Office Building', f: '2,200,000', r: '1,650,000', v: '-550,000', vp: '-25.0%' },
      { p: 'DIB-Retrofit', f: '1,600,000', r: '1,000,000', v: '-600,000', vp: '-37.5%' },
      { p: 'DIB-Data Center', f: '1,000,000', r: '950,000', v: '-50,000', vp: '-5.0%' },
      { p: 'DIB-Other', f: '2,100,000', r: '2,300,000', v: '200,000', vp: '+9.5%' },
    ];

    const summaryTable = [
      { n: 'รายได้จากการขาย', f: '16,800,000', r: '12,450,000', v: '-4,450,000', vp: '-25.9%', a: '74.1%' },
      { n: 'ต้นทุนโครงการ', f: '8,210,000', r: '6,550,000', v: '-1,660,000', vp: '-20.2%', a: '79.8%' },
      { n: 'กำไรขั้นต้น', f: '8,590,000', r: '5,900,000', v: '-2,690,000', vp: '-31.3%', a: '68.7%' },
      { n: 'ค่าใช้จ่ายในการดำเนินงาน', f: '2,300,000', r: '2,150,000', v: '-150,000', vp: '-6.5%', a: '93.5%' },
      { n: 'กำไรก่อนภาษี', f: '6,290,000', r: '3,750,000', v: '-2,540,000', vp: '-40.4%', a: '59.6%' },
    ];

    return `
  <!-- Topbar Actions -->
  <div style="display:flex;justify-content:flex-end;gap:12px;margin-bottom:18px">
    ${renderDateFilter('initComparisonCharts()')}
    <button class="btn" style="background:rgba(99,102,241,0.08);color:#6366f1;border:1px solid rgba(99,102,241,0.2);display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Export
    </button>
  </div>

  <!-- KPIs Row -->
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:40px;height:40px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6;flex-shrink:0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Total Forecast</div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text);margin:2px 0">฿ 16.80M</div>
        <div style="font-size:.65rem;color:var(--text-2)">จากปีที่แล้ว (฿ 14.25M)</div>
        <div style="font-size:.65rem;color:#10b981;font-weight:600">?-? 17.9%</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:40px;height:40px;border-radius:10px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#10b981;flex-shrink:0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Total Real</div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text);margin:2px 0">฿ 12.45M</div>
        <div style="font-size:.65rem;color:var(--text-2)">จากปีที่แล้ว (฿ 10.32M)</div>
        <div style="font-size:.65rem;color:#10b981;font-weight:600">?-? 20.6%</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:40px;height:40px;border-radius:10px;background:#fef2f2;display:flex;align-items:center;justify-content:center;color:#ef4444;flex-shrink:0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Variance (฿)</div>
        <div style="font-size:1.2rem;font-weight:700;color:#ef4444;margin:2px 0">-฿ 4.35M</div>
        <div style="font-size:.65rem;color:var(--text-2)">จากปีที่แล้ว (-฿ 3.93M)</div>
        <div style="font-size:.65rem;color:#ef4444;font-weight:600">?-? -10.7%</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:40px;height:40px;border-radius:10px;background:#fffbeb;display:flex;align-items:center;justify-content:center;color:#f59e0b;flex-shrink:0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Variance (%)</div>
        <div style="font-size:1.2rem;font-weight:700;color:#ef4444;margin:2px 0">-25.9%</div>
        <div style="font-size:.65rem;color:var(--text-2)">จากปีที่แล้ว (-27.6%)</div>
        <div style="font-size:.65rem;color:#10b981;font-weight:600">?-? 1.7%</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:10px">
      <div style="width:40px;height:40px;border-radius:10px;background:#f5f3ff;display:flex;align-items:center;justify-content:center;color:#8b5cf6;flex-shrink:0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Accuracy</div>
        <div style="font-size:1.2rem;font-weight:700;color:var(--text);margin:2px 0">74.1%</div>
        <div style="font-size:.65rem;color:var(--text-2)">จากปีที่แล้ว (72.4%)</div>
        <div style="font-size:.65rem;color:#10b981;font-weight:600">?-? 1.7%</div>
      </div>
    </div>
  </div>

  <!-- Middle Row -->
  <div style="display:grid;grid-template-columns:1.5fr 1fr 1.5fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:16px">Real vs Forecast</div>
      <div style="flex:1;min-height:220px;width:100%"><canvas id="realVsForecastLineChart"></canvas></div>
    </div>
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:16px">Variance by Month (฿)</div>
      <div style="flex:1;min-height:220px;width:100%"><canvas id="varianceMonthChart"></canvas></div>
    </div>
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:16px">Forecast vs Real by Project</div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.7rem;text-align:left">
          <thead>
            <tr style="color:var(--text-3);border-bottom:1px solid var(--border)">
              <th style="padding:8px 4px;font-weight:600">โครงการ</th>
              <th style="padding:8px 4px;font-weight:600;text-align:right">Forecast (฿)</th>
              <th style="padding:8px 4px;font-weight:600;text-align:right">Real (฿)</th>
              <th style="padding:8px 4px;font-weight:600;text-align:right">Variance (฿)</th>
              <th style="padding:8px 4px;font-weight:600;text-align:right">Variance (%)</th>
            </tr>
          </thead>
          <tbody>
            ${projectTable.map(r => `
            <tr style="border-bottom:1px solid var(--border)">
              <td style="padding:10px 4px;font-weight:600;color:var(--text-2)">${r.p}</td>
              <td style="padding:10px 4px;text-align:right;color:var(--text-2)">${r.f}</td>
              <td style="padding:10px 4px;text-align:right;color:var(--text-2)">${r.r}</td>
              <td style="padding:10px 4px;text-align:right;color:${r.v.startsWith('-') ? '#ef4444' : '#10b981'}">${r.v}</td>
              <td style="padding:10px 4px;text-align:right;color:${r.vp.startsWith('-') ? '#ef4444' : '#10b981'}">${r.vp}</td>
            </tr>`).join('')}
            <tr style="font-weight:700;background:#f8fafc">
              <td style="padding:10px 4px">รวมทั้งหมด</td>
              <td style="padding:10px 4px;text-align:right">12,800,000</td>
              <td style="padding:10px 4px;text-align:right">10,450,000</td>
              <td style="padding:10px 4px;text-align:right;color:#ef4444">-2,350,000</td>
              <td style="padding:10px 4px;text-align:right;color:#ef4444">-18.4%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Bottom Row -->
  <div style="display:grid;grid-template-columns:2.5fr 1.5fr;gap:16px;margin-bottom:18px">
    <div>
      <div class="card" style="padding:16px;margin-bottom:16px">
        <div style="font-size:.95rem;font-weight:700;margin-bottom:16px">Summary</div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:.78rem;text-align:left">
            <thead>
              <tr style="color:var(--text-3);border-bottom:1px solid var(--border)">
                <th style="padding:10px 8px;font-weight:600">รายการ</th>
                <th style="padding:10px 8px;font-weight:600;text-align:right">Forecast (฿)</th>
                <th style="padding:10px 8px;font-weight:600;text-align:right">Real (฿)</th>
                <th style="padding:10px 8px;font-weight:600;text-align:right">Variance (฿)</th>
                <th style="padding:10px 8px;font-weight:600;text-align:right">Variance (%)</th>
                <th style="padding:10px 8px;font-weight:600;text-align:right">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              ${summaryTable.map(r => `
              <tr style="border-bottom:1px solid var(--border)">
                <td style="padding:12px 8px;font-weight:600;color:var(--text-2)">${r.n}</td>
                <td style="padding:12px 8px;text-align:right;color:var(--text-2)">${r.f}</td>
                <td style="padding:12px 8px;text-align:right;color:var(--text-2)">${r.r}</td>
                <td style="padding:12px 8px;text-align:right;color:#ef4444">${r.v}</td>
                <td style="padding:12px 8px;text-align:right;color:#ef4444">${r.vp}</td>
                <td style="padding:12px 8px;text-align:right;color:var(--text-2)">${r.a}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="card" style="padding:16px">
          <div style="font-size:.9rem;font-weight:700;margin-bottom:16px">Insight</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;gap:10px">
              <div style="width:32px;height:32px;border-radius:6px;background:#fef2f2;color:#ef4444;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg></div>
              <div>
                <div style="font-size:.8rem;font-weight:600">รายได้ต่ำกว่าแผน 4.35M บาท (-25.9%)</div>
                <div style="font-size:.7rem;color:var(--text-3)">สาเหตุหลักมาจากโครงการ DIB-Solar Farm และ DIB-Warehouse ล่าช้ากว่ากำหนด</div>
              </div>
            </div>
            <div style="display:flex;gap:10px">
              <div style="width:32px;height:32px;border-radius:6px;background:#fffbeb;color:#f59e0b;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/></svg></div>
              <div>
                <div style="font-size:.8rem;font-weight:600">กำไรขั้นต้นต่ำกว่าแผน 31.3%</div>
                <div style="font-size:.7rem;color:var(--text-3)">ควรควบคุมต้นทุนโครงการ และติดตามความก้าวหน้าการรับรู้รายได้</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card" style="padding:16px">
          <div style="font-size:.9rem;font-weight:700;margin-bottom:16px">Top Variance Projects</div>
          <table style="width:100%;border-collapse:collapse;font-size:.75rem">
            <thead><tr style="color:var(--text-3);border-bottom:1px solid var(--border)">
              <th style="padding:6px 4px;text-align:left">#</th><th style="padding:6px 4px;text-align:left">โครงการ</th><th style="padding:6px 4px;text-align:right">Variance (฿)</th><th style="padding:6px 4px;text-align:right">Variance (%)</th>
            </tr></thead>
            <tbody>
              <tr><td style="padding:8px 4px">1</td><td style="padding:8px 4px;font-weight:600">DIB-Retrofit</td><td style="padding:8px 4px;text-align:right;color:#ef4444">-600,000</td><td style="padding:8px 4px;text-align:right;color:#ef4444">-37.5%</td></tr>
              <tr><td style="padding:8px 4px">2</td><td style="padding:8px 4px;font-weight:600">DIB-Warehouse</td><td style="padding:8px 4px;text-align:right;color:#ef4444">-700,000</td><td style="padding:8px 4px;text-align:right;color:#ef4444">-25.0%</td></tr>
              <tr><td style="padding:8px 4px">3</td><td style="padding:8px 4px;font-weight:600">DIB-Solar Farm</td><td style="padding:8px 4px;text-align:right;color:#ef4444">-650,000</td><td style="padding:8px 4px;text-align:right;color:#ef4444">-21.0%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:16px">Forecast vs Real by Category</div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;min-height:280px">
        <canvas id="compCategoryDonut"></canvas>
      </div>
      <div style="margin-top:16px;font-size:.7rem;color:var(--text-3)">
        <div style="font-weight:700;margin-bottom:8px">หมายเหตุ</div>
        <div>ข้อมูล ณ วันที่ 31 ธ.ค. 2568 | YTD = Year To Date</div>
      </div>
    </div>
  </div>`;
  }

  window.initComparisonCharts = function() {
    const ctxLine = document.getElementById('realVsForecastLineChart');
    const ctxVar = document.getElementById('varianceMonthChart');
    const ctxDonut = document.getElementById('compCategoryDonut');
    if (!ctxLine || !ctxVar || !ctxDonut) return;

    if (Chart.getChart(ctxLine)) Chart.getChart(ctxLine).destroy();
    if (Chart.getChart(ctxVar)) Chart.getChart(ctxVar).destroy();
    if (Chart.getChart(ctxDonut)) Chart.getChart(ctxDonut).destroy();

    const lbs = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    // 1. Line Chart: Real vs Forecast
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: lbs,
        datasets: [
          { label: 'Real', data: [2.5, 3.8, 5.2, 6.5, 7.8, 9.2, 10.5, 12, 14.5, 16, 17.5, 18.5], borderColor: '#6366f1', backgroundColor: '#6366f1', borderWidth: 3, tension: 0.4, pointRadius: 0 },
          { label: 'Forecast', data: [2.2, 3.2, 4.5, 5.5, 6.8, 7.8, 8.8, 10, 11.5, 13, 14.2, 15.5], borderColor: '#a5b4fc', backgroundColor: '#a5b4fc', borderWidth: 2, borderDash: [6, 4], tension: 0.4, pointRadius: 0 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { font: { family: 'Kanit' }, usePointStyle: true, pointStyle: 'line' } },
          datalabels: { display: false }
        },
        scales: {
          y: { ticks: { font: { family: 'Kanit' }, callback: v => v + 'M' }, grid: { color: '#f1f5f9' }, border: { display: false } },
          x: { ticks: { font: { family: 'Kanit' } }, grid: { display: false }, border: { display: false } }
        }
      }
    });

    // 2. Bar Chart: Variance by Month
    new Chart(ctxVar, {
      type: 'bar',
      data: {
        labels: lbs,
        datasets: [{
          data: [0.3, 0.6, 0.7, 1.0, 1.0, 1.4, -0.6, -1.4, -2.2, -1.5, -0.8, -0.1],
          backgroundColor: (c) => c.raw < 0 ? '#ef4444' : '#10b981',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, datalabels: { display: false } },
        scales: {
          y: { ticks: { font: { family: 'Kanit' }, callback: v => v + 'M' }, grid: { color: '#f1f5f9' }, border: { display: false } },
          x: { ticks: { font: { family: 'Kanit' } }, grid: { display: false }, border: { display: false } }
        }
      }
    });

    // 3. Donut Chart: Category
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart) => {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta.data || !meta.data[0]) return;
        const { x, y } = meta.data[0];
        ctx.save();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '700 1.2rem Kanit'; ctx.fillStyle = '#1e293b';
        ctx.fillText('฿ 12.45M', x, y - 8);
        ctx.font = '400 .75rem Kanit'; ctx.fillStyle = '#64748b';
        ctx.fillText('Total Real', x, y + 15);
        ctx.restore();
      }
    };

    new Chart(ctxDonut, {
      type: 'doughnut',
      plugins: [centerTextPlugin],
      data: {
        labels: ['รายได้จากการขาย', 'ต้นทุนโครงการ', 'ค่าใช้จ่ายในการดำเนินงาน'],
        datasets: [{
          data: [12.45, 6.55, 2.15],
          backgroundColor: ['#6366f1', '#3b82f6', '#8ecead'],
          borderWidth: 2, borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '75%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { family: 'Kanit', size: 10 }, usePointStyle: true, padding: 15 },
            generateLabels: (chart) => {
              const ds = chart.data.datasets[0];
              return chart.data.labels.map((l, i) => ({
                text: `${l}     ${ds.data[i]}M`,
                fillStyle: ds.backgroundColor[i],
                hidden: false, index: i
              }));
            }
          },
          datalabels: { display: false }
        }
      }
    });

    console.log("Comparison: Charts rendered successfully.");
  }

  window.showProjectDetails = function(id) {
    const p = COST_DATA.projects.find(x => x.id === id);
    if (!p) return;

    const content = `
    <div style="font-family:'Kanit',sans-serif; position:relative">
      <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()" style="position:absolute; top:-15px; right:-15px; width:30px; height:30px; border-radius:50%; border:none; background:white; box-shadow:0 2px 10px rgba(0,0,0,0.1); cursor:pointer; font-weight:bold; display:flex; align-items:center; justify-content:center">??.</button>
      <h3 style="margin-bottom:15px; color:var(--primary)">-֧? Project Breakdown: ${p.name}</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px">
        <div class="stat-card" style="padding:15px; background:#f8fafc">
          <div style="font-size:.8rem; color:var(--text-3)">Revenue</div>
          <div style="font-weight:700">฿${fmt(p.rev)}</div>
        </div>
        <div class="stat-card" style="padding:15px; background:#f8fafc">
          <div style="font-size:.8rem; color:var(--text-3)">Total Cost</div>
          <div style="font-weight:700">฿${fmt(p.total)}</div>
        </div>
        <div class="stat-card" style="padding:15px; background:#fefce8">
          <div style="font-size:.8rem; color:var(--text-3)">Staff Perf</div>
          <div style="font-weight:700">฿${fmt(p.staffPerf || 0)}</div>
        </div>
        <div class="stat-card" style="padding:15px; background:#f0f9ff">
          <div style="font-size:.8rem; color:var(--text-3)">CL Cost (KA+KB)</div>
          <div style="font-weight:700">฿${fmt((p.clKA || 0) + (p.clKB || 0))}</div>
        </div>
      </div>
      <div style="margin-top:20px; padding:15px; background:var(--primary-bg); border-radius:8px">
        <div style="font-weight:700; color:var(--primary)">Net Profit: ฿${fmt(p.gp)}</div>
        <div style="font-size:.8rem; margin-top:5px">Margin: ${(p.gp / p.rev * 100).toFixed(1)}%</div>
      </div>
    </div>
  `;

    const modal = document.createElement('div');
    modal.className = "modal-backdrop";
    modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:10001; backdrop-filter:blur(4px)";
    modal.innerHTML = `<div class="card" style="width:450px; max-width:90%; padding:25px; animation: slideUp 0.3s ease-out">${content}</div>`;
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
  }

  // ---------- PROJECT EFFICIENCY & ROI ----------
  window.pageProjectEfficiency = function() {
    setTimeout(initEfficiencyCharts, 100);

    const tblData = [
      { p: 'DIB-Solar Farm', prg: 65, eff: '77%', pend: '30 มิ.ย. 2568', aend: '-', s: 'ปกติ', sc: '#10b981' },
      { p: 'DIB-Warehouse', prg: 100, eff: '72%', pend: '25 ส.ค. 2567', aend: '10 ก.ค. 2567', s: 'เสร็จ', sc: '#10b981' },
      { p: 'DIB-Office Building', prg: 45, eff: '46%', pend: '30 ก.ย. 2567', aend: '-', s: 'เสี่ยง', sc: '#f59e0b' },
      { p: 'DIB-Retrofit', prg: 30, eff: '30%', pend: '15 พ.ย. 2567', aend: '-', s: 'เสี่ยง', sc: '#f59e0b' },
      { p: 'DIB-Data Center', prg: 85, eff: '80%', pend: '30 ก.ย. 2567', aend: '-', s: 'ปกติ', sc: '#10b981' },
      { p: 'DIB-Other', prg: 75, eff: '75%', pend: '31 ธ.ค. 2567', aend: '-', s: 'ปกติ', sc: '#10b981' },
    ];

    return `
  <!-- Topbar Actions -->
  <div style="display:flex;justify-content:flex-end;gap:12px;margin-bottom:18px">
    ${renderDateFilter('initEfficiencyCharts()')}
    <button class="btn" style="background:rgba(99,102,241,0.08);color:#6366f1;border:1px solid rgba(99,102,241,0.2);display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Export
    </button>
  </div>

  <!-- KPIs Row -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:48px;height:48px;border-radius:12px;background:#e0e7ff;display:flex;align-items:center;justify-content:center;color:#6366f1;flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Average Efficiency</div>
        <div style="font-size:1.4rem;font-weight:700;color:var(--text);margin:2px 0">78%</div>
        <div style="font-size:.7rem;color:var(--text-2)"><span style="color:#10b981;font-weight:600">↓ 4.5%</span> จากปีที่แล้ว (72%)</div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:48px;height:48px;border-radius:12px;background:#d1fae5;display:flex;align-items:center;justify-content:center;color:#10b981;flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="m9 10 2 2 4-4"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">On-time Projects</div>
        <div style="font-size:1.4rem;font-weight:700;color:var(--text);margin:2px 0">16 <span style="font-size:.9rem;font-weight:500">โครงการ</span></div>
        <div style="font-size:.7rem;color:var(--text-2)"><span style="color:#10b981;font-weight:600">?-? 60%</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:48px;height:48px;border-radius:12px;background:#fee2e2;display:flex;align-items:center;justify-content:center;color:#ef4444;flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">Delayed Projects</div>
        <div style="font-size:1.4rem;font-weight:700;color:var(--text);margin:2px 0">4 <span style="font-size:.9rem;font-weight:500">โครงการ</span></div>
        <div style="font-size:.7rem;color:var(--text-2)"><span style="color:#ef4444;font-weight:600">?-? 33%</span></div>
      </div>
    </div>
    <div class="card" style="padding:16px;display:flex;align-items:flex-start;gap:8px">
      <div style="width:48px;height:48px;border-radius:12px;background:#fef3c7;display:flex;align-items:center;justify-content:center;color:#f59e0b;flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
      </div>
      <div>
        <div style="font-size:.7rem;color:var(--text-3);font-weight:600">At Risk Projects</div>
        <div style="font-size:1.4rem;font-weight:700;color:var(--text);margin:2px 0">2 <span style="font-size:.9rem;font-weight:500">โครงการ</span></div>
        <div style="font-size:.7rem;color:var(--text-2)"><span style="color:#ef4444;font-weight:600">?-? 20%</span></div>
      </div>
    </div>
  </div>

  <!-- Middle Row -->
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:.95rem;font-weight:700">Efficiency by Project</div>
      </div>
      <div style="overflow-x:auto;flex:1">
        <table style="width:100%;border-collapse:collapse;font-size:.8rem;text-align:left">
          <thead>
            <tr style="color:var(--text-3);border-bottom:1px solid var(--border)">
              <th style="padding:10px 8px;font-weight:600">โครงการ</th>
              <th style="padding:10px 8px;font-weight:600;min-width:100px">Progress</th>
              <th style="padding:10px 8px;font-weight:600;text-align:center">Efficiency</th>
              <th style="padding:10px 8px;font-weight:600">Planned End</th>
              <th style="padding:10px 8px;font-weight:600">Actual End</th>
              <th style="padding:10px 8px;font-weight:600;text-align:center">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            ${tblData.map(r => `
            <tr style="border-bottom:1px solid var(--border)">
              <td style="padding:12px 8px;font-weight:600;color:var(--text-2)">${r.p}</td>
              <td style="padding:12px 8px">
                <div style="width:80px;height:6px;background:#f1f5f9;border-radius:10px;overflow:hidden">
                  <div style="width:${r.prg}%;height:100%;background:#6366f1"></div>
                </div>
              </td>
              <td style="padding:12px 8px;text-align:center;color:var(--text-2)">${r.eff}</td>
              <td style="padding:12px 8px;color:var(--text-3)">${r.pend}</td>
              <td style="padding:12px 8px;color:var(--text-3)">${r.aend}</td>
              <td style="padding:12px 8px;text-align:center"><div style="display:inline-flex;align-items:center;gap:6px;font-size:.7rem;color:var(--text-3)"><div style="width:6px;height:6px;border-radius:50%;background:${r.sc}"></div>${r.s}</div></td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="card" style="padding:16px;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:.95rem;font-weight:700">Project Status</div>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;min-height:220px">
        <!-- Text inside Donut -->
        <div id="projectStatusCenterText" style="position:absolute;top:50%;left:30%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;z-index:10;display:none">
          <div style="font-size:1.4rem;font-weight:700;color:var(--text)">22</div>
          <div style="font-size:.7rem;color:var(--text-3)">โครงการ</div>
        </div>
        <canvas id="projectStatusDonut"></canvas>
      </div>
    </div>
  </div>

  <!-- Bottom Row -->
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:18px">
    <div class="card" style="padding:20px;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div style="font-size:.95rem;font-weight:700">Efficiency Trend</div>
      </div>
      <div style="flex:1;min-height:240px;width:100%"><canvas id="efficiencyTrendChart"></canvas></div>
      
      <!-- Summary Boxes below chart -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px">
        <div style="background:#f8fafc;padding:12px;border-radius:10px;text-align:center">
          <div style="font-size:.75rem;color:var(--text-3);margin-bottom:4px">Efficiency เฉลี่ย</div>
          <div style="font-size:1.3rem;font-weight:700;color:var(--text)">78%</div>
        </div>
        <div style="background:#f8fafc;padding:12px;border-radius:10px;text-align:center">
          <div style="font-size:.75rem;color:var(--text-3);margin-bottom:4px">เป้าหมาย (Target)</div>
          <div style="font-size:1.3rem;font-weight:700;color:var(--text)">85%</div>
        </div>
        <div style="background:#fff1f2;padding:12px;border-radius:10px;text-align:center">
          <div style="font-size:.7rem;color:#e11d48;margin-bottom:4px">Gap</div>
          <div style="font-size:1.3rem;font-weight:700;color:#e11d48">-7%</div>
        </div>
      </div>
    </div>

    <div class="card" style="padding:16px">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:20px">Project Efficiency Summary</div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:36px;height:36px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center;color:#3b82f6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 10h6"/></svg>
          </div>
          <div style="flex:1;font-size:.85rem;color:var(--text-2)">โครงการทั้งหมด</div>
          <div style="font-weight:700;font-size:.9rem">22 <span style="font-size:.75rem;color:var(--text-3);font-weight:400">โครงการ</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:36px;height:36px;border-radius:8px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:#22c55e">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style="flex:1;font-size:.85rem;color:var(--text-2)">เสร็จตามแผน</div>
          <div style="font-weight:700;font-size:.9rem;color:#22c55e">16 <span style="font-size:.75rem;color:var(--text-3);font-weight:400">โครงการ (73%)</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:36px;height:36px;border-radius:8px;background:#fef2f2;display:flex;align-items:center;justify-content:center;color:#ef4444">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
          </div>
          <div style="flex:1;font-size:.85rem;color:var(--text-2)">ล่าช้า</div>
          <div style="font-weight:700;font-size:.9rem;color:#ef4444">4 <span style="font-size:.75rem;color:var(--text-3);font-weight:400">โครงการ (18%)</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:36px;height:36px;border-radius:8px;background:#fffbeb;display:flex;align-items:center;justify-content:center;color:#f59e0b">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          </div>
          <div style="flex:1;font-size:.85rem;color:var(--text-2)">เสี่ยง</div>
          <div style="font-weight:700;font-size:.9rem;color:#f59e0b">2 <span style="font-size:.75rem;color:var(--text-3);font-weight:400">โครงการ (9%)</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:36px;height:36px;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#64748b">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div style="flex:1;font-size:.85rem;color:var(--text-2)">ยังไม่เริ่ม</div>
          <div style="font-weight:700;font-size:.9rem;color:#64748b">0 <span style="font-size:.75rem;color:var(--text-3);font-weight:400">โครงการ (0%)</span></div>
        </div>
      </div>
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:8px;color:#3b82f6;font-size:.8rem;background:#eff6ff;padding:10px 16px;border-radius:8px">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    <span>หมายเหตุ: คำนวณประสิทธิภาพจาก (ผลงานจริง / แผนงาน) โดยรวมเวลาที่ใช้และคุณภาพของงาน</span>
  </div>
  `;
  }

  window.initProfitabilityCharts = function() {
    const ctxProf = document.getElementById('profProjectChart');
    const ctxMargin = document.getElementById('profMarginDonut');
    const ctxTrend = document.getElementById('profTrendChart');
    if (!ctxProf || !ctxMargin || !ctxTrend) return;

    if (Chart.getChart(ctxProf)) Chart.getChart(ctxProf).destroy();
    if (Chart.getChart(ctxMargin)) Chart.getChart(ctxMargin).destroy();
    if (Chart.getChart(ctxTrend)) Chart.getChart(ctxTrend).destroy();

    const labels = ['DIB-Solar Farm', 'DIB-Warehouse', 'DIB-Office Building', 'DIB-Retrofit', 'DIB-Data Center', 'DIB-Other'];

    // 1. Profitability by Project (Bar + Line)
    new Chart(ctxProf, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Revenue', data: [7, 6, 4.5, 4.2, 4, 5.2], backgroundColor: '#6366f1', borderRadius: 4, barThickness: 15 },
          { label: 'Cost', data: [4.2, 4.5, 3.5, 2.8, 2.5, 2.8], backgroundColor: '#ef4444', borderRadius: 4, barThickness: 15 },
          { label: 'Net Profit', data: [2.8, 1.5, 1, 1.4, 1.5, 2.4], backgroundColor: '#10b981', borderRadius: 4, barThickness: 15 },
          { label: 'Net Profit Margin (%)', data: [39.6, 35.2, 25.0, 37.5, 33.3, 45.7], type: 'line', borderColor: '#8b5cf6', backgroundColor: '#8b5cf6', borderWidth: 2, tension: 0.4, yAxisID: 'y1', pointRadius: 3 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { font: { family: 'Kanit', size: 10 }, boxWidth: 10, usePointStyle: true } },
          datalabels: {
            display: (c) => c.dataset.type === 'line',
            align: 'top', color: '#8b5cf6', font: { family: 'Kanit', weight: '700', size: 10 },
            formatter: v => v + '%'
          }
        },
        scales: {
          y: { ticks: { font: { family: 'Kanit' }, callback: v => v + 'M' }, grid: { color: '#f1f5f9' }, border: { display: false } },
          y1: { position: 'right', min: 0, max: 100, ticks: { font: { family: 'Kanit' }, callback: v => v + '%' }, grid: { display: false }, border: { display: false } },
          x: { ticks: { font: { family: 'Kanit' } }, grid: { display: false }, border: { display: false } }
        }
      }
    });

    // 2. Profit Margin Donut
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart) => {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta.data || !meta.data[0]) return;
        const { x, y } = meta.data[0];
        ctx.save();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '700 1.4rem Kanit'; ctx.fillStyle = '#1e293b';
        ctx.fillText('25.2%', x, y - 8);
        ctx.font = '400 .75rem Kanit'; ctx.fillStyle = '#64748b';
        ctx.fillText('Net Profit Margin', x, y + 15);
        ctx.restore();
      }
    };

    new Chart(ctxMargin, {
      type: 'doughnut',
      plugins: [centerTextPlugin],
      data: {
        labels: labels,
        datasets: [{
          data: [39.6, 35.2, 37.5, 25.0, 33.3, 45.7],
          backgroundColor: ['#6366f1', '#3b82f6', '#818cf8', '#93c5fd', '#8ecead', '#10b981'],
          borderWidth: 2, borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '75%',
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { family: 'Kanit', size: 10 }, usePointStyle: true, padding: 12 },
            generateLabels: (chart) => {
              const ds = chart.data.datasets[0];
              return chart.data.labels.map((l, i) => ({
                text: `${l}     ${ds.data[i]}%`,
                fillStyle: ds.backgroundColor[i],
                hidden: false, index: i
              }));
            }
          },
          datalabels: { display: false }
        }
      }
    });

    // 3. Profitability Trend
    const lbs = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: lbs,
        datasets: [{
          label: 'Net Profit Margin (%)',
          data: [20.1, 21.3, 22.8, 24.0, 23.6, 24.5, 25.9, 26.2, 26.8, 27.1, 27.6, 28.7],
          borderColor: '#6366f1', backgroundColor: '#6366f1', borderWidth: 2, tension: 0.4, pointRadius: 3
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            display: (c) => c.dataIndex % 2 === 0 || c.dataIndex === 11,
            align: 'top', color: '#6366f1', font: { family: 'Kanit', weight: '700', size: 10 },
            formatter: v => v + '%'
          }
        },
        scales: {
          y: { min: 0, max: 40, ticks: { stepSize: 10, font: { family: 'Kanit' }, callback: v => v + '%' }, grid: { color: '#f1f5f9' }, border: { display: false } },
          x: { ticks: { font: { family: 'Kanit' } }, grid: { display: false }, border: { display: false } }
        }
      }
    });

    console.log("Profitability Analysis: Charts rendered successfully.");
  }

  window.initEfficiencyCharts = function() {
    const ctxDonut = document.getElementById('projectStatusDonut');
    const ctxTrend = document.getElementById('efficiencyTrendChart');
    if (!ctxDonut || !ctxTrend) return;

    if (Chart.getChart(ctxDonut)) Chart.getChart(ctxDonut).destroy();
    if (Chart.getChart(ctxTrend)) Chart.getChart(ctxTrend).destroy();

    // 1. Project Status Donut
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart) => {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta.data || !meta.data[0]) return;
        const { x, y } = meta.data[0];
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 1.5rem Kanit';
        ctx.fillStyle = '#1e293b';
        ctx.fillText('22', x, y - 8);
        ctx.font = '400 .75rem Kanit';
        ctx.fillStyle = '#64748b';
        ctx.fillText('โครงการ', x, y + 15);
        ctx.restore();
      }
    };

    new Chart(ctxDonut, {
      type: 'doughnut',
      plugins: [centerTextPlugin],
      data: {
        labels: ['รายได้จากการขาย', 'ต้นทุนโครงการ', 'ค่าใช้จ่ายในการดำเนินงาน'],
        datasets: [{
          data: [16, 2, 4],
          backgroundColor: ['#8ecead', '#93c5fd', '#6366f1'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { family: 'Kanit', size: 11, color: '#64748b' }, usePointStyle: true, pointStyle: 'circle', padding: 20 },
            generateLabels: (chart) => {
              const ds = chart.data.datasets[0];
              const sum = ds.data.reduce((a, b) => a + b, 0);
              return chart.data.labels.map((l, i) => ({
                text: `${l}     ${ds.data[i]} (${(ds.data[i] * 100 / sum).toFixed(0)}%)`,
                fillStyle: ds.backgroundColor[i],
                hidden: false, index: i
              }));
            }
          },
          datalabels: { display: false }
        }
      }
    });

    // 2. Efficiency Trend Line
    const lbs = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const trendData = [60, 62, 63, 65, 68, 70, 73, 75, 78, 78, 78, 78];

    new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: lbs,
        datasets: [{
          label: 'Efficiency (%)',
          data: trendData,
          borderColor: '#6366f1',
          backgroundColor: '#6366f1',
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            display: true,
            align: 'top',
            color: '#6366f1',
            font: { family: 'Kanit', weight: '700', size: 11 },
            formatter: (v, ctx) => (ctx.dataIndex % 2 === 0 || ctx.dataIndex === 11) ? v + '%' : ''
          }
        },
        scales: {
          y: { min: 0, max: 100, ticks: { stepSize: 25, callback: v => v + '%', font: { family: 'Kanit', color: '#94a3b8' } }, grid: { color: '#f1f5f9' }, border: { display: false } },
          x: { ticks: { font: { family: 'Kanit', color: '#94a3b8' } }, grid: { display: false }, border: { display: false } }
        }
      }
    });

    console.log("Efficiency: Charts rendered successfully.");
  }

  window.initCoreValuesCharts = function() {
    const ctxAware = document.getElementById('awarenessDonutChart');
    if (!ctxAware) return;

    if (Chart.getChart(ctxAware)) Chart.getChart(ctxAware).destroy();

    new Chart(ctxAware, {
      type: 'doughnut',
      data: {
        labels: ['รายได้จากการขาย', 'ต้นทุนโครงการ', 'ค่าใช้จ่ายในการดำเนินงาน'],
        datasets: [{
          data: [59, 33, 6, 2],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
          borderWidth: 0,
          cutout: '80%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false }
        }
      }
    });

    console.log("Core Values: Charts rendered successfully.");
  }

  window.initProcurementCharts = function() {
    const ctxVal = document.getElementById('poValueMonthChart');
    const ctxStatus = document.getElementById('poStatusDonut');
    const ctxSupp = document.getElementById('topSuppliersChart');
    const ctxGauge = document.getElementById('poDeliveryGauge');
    if (!ctxVal || !ctxStatus || !ctxSupp || !ctxGauge) return;

    if (Chart.getChart(ctxVal)) Chart.getChart(ctxVal).destroy();
    if (Chart.getChart(ctxStatus)) Chart.getChart(ctxStatus).destroy();
    if (Chart.getChart(ctxSupp)) Chart.getChart(ctxSupp).destroy();
    if (Chart.getChart(ctxGauge)) Chart.getChart(ctxGauge).destroy();

    const lbs = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    // 1. PO Value by Month (Bar)
    new Chart(ctxVal, {
      type: 'bar',
      data: {
        labels: lbs,
        datasets: [{
          label: 'PO Value (M)',
          data: [2.8, 3.1, 3.9, 3.2, 3.8, 4.1, 4.3, 4.2, 4.6, 5.7, 5.1, 5.4],
          backgroundColor: '#6366f1', borderRadius: 4, barThickness: 12
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            display: (c) => c.dataIndex % 2 === 0 || c.dataIndex === 11,
            align: 'top', color: '#6366f1', font: { family: 'Kanit', weight: '700', size: 9 },
            formatter: v => v + 'M'
          }
        },
        scales: {
          y: { ticks: { font: { family: 'Kanit' }, callback: v => v + 'M' }, grid: { color: '#f1f5f9' }, border: { display: false } },
          x: { ticks: { font: { family: 'Kanit' } }, grid: { display: false }, border: { display: false } }
        }
      }
    });

    // 2. PO Status Donut
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart) => {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta.data || !meta.data[0]) return;
        const { x, y } = meta.data[0];
        ctx.save();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '700 1.2rem Kanit'; ctx.fillStyle = '#1e293b';
        ctx.fillText('฿ 45.62M', x, y - 8);
        ctx.font = '400 .75rem Kanit'; ctx.fillStyle = '#64748b';
        ctx.fillText('Total Value', x, y + 15);
        ctx.restore();
      }
    };

    new Chart(ctxStatus, {
      type: 'doughnut',
      plugins: [centerTextPlugin],
      data: {
        labels: ['Completed', 'In Progress', 'Partially Received', 'Pending'],
        datasets: [{
          data: [29.45, 10.25, 3.62, 2.30],
          backgroundColor: ['#10b981', '#3b82f6', '#93c5fd', '#6366f1'],
          borderWidth: 2, borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '75%',
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { family: 'Kanit', size: 9 }, usePointStyle: true, padding: 12 },
            generateLabels: (chart) => {
              const ds = chart.data.datasets[0];
              const total = ds.data.reduce((a, b) => a + b, 0);
              return chart.data.labels.map((l, i) => ({
                text: `${l}   ฿ ${ds.data[i].toFixed(2)}M (${(ds.data[i] * 100 / total).toFixed(1)}%)`,
                fillStyle: ds.backgroundColor[i],
                hidden: false, index: i
              }));
            }
          },
          datalabels: { display: false }
        }
      }
    });

    // 3. Top Suppliers (Horizontal Bar)
    new Chart(ctxSupp, {
      type: 'bar',
      data: {
        labels: ['รายได้จากการขาย', 'ต้นทุนโครงการ', 'ค่าใช้จ่ายในการดำเนินงาน'],
        datasets: [{
          data: [9.85, 7.45, 6.20, 5.15, 3.62],
          backgroundColor: '#6366f1', borderRadius: 4, barThickness: 10
        }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, datalabels: { display: false } },
        scales: {
          x: { ticks: { font: { family: 'Kanit' }, callback: v => v + 'M' }, grid: { display: false }, border: { display: false } },
          y: { ticks: { font: { family: 'Kanit', size: 9 } }, grid: { display: false }, border: { display: false } }
        }
      }
    });

    // 4. Delivery Performance Gauge (Simplified using Gauge style)
    new Chart(ctxGauge, {
      type: 'doughnut',
      data: {
        labels: ['On Time', 'Late', 'Overdue'],
        datasets: [{
          data: [92.5, 6.2, 1.3],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          circumference: 180, rotation: 270, cutout: '80%', borderWidth: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false }
        },
        animation: {
          onComplete: (chart) => {
            const { ctx, chartArea: { left, right, bottom } } = chart.chart;
            ctx.save();
            ctx.font = '700 1.5rem Kanit'; ctx.fillStyle = '#1e293b'; ctx.textAlign = 'center';
            ctx.fillText('92.5%', (left + right) / 2, bottom - 10);
            ctx.font = '400 .75rem Kanit'; ctx.fillStyle = '#64748b';
            ctx.fillText('On-Time Delivery', (left + right) / 2, bottom + 10);
            ctx.restore();
          }
        }
      }
    });

    console.log("Procurement Analysis: Charts rendered successfully.");
  }
  window.initSalePipelineCharts = function() {
    const ctxTrend = document.getElementById('pipelineTrendChart');
    const ctxIndus = document.getElementById('pipelineIndustryChart');
    const ctxOwn = document.getElementById('topOwnersChart');
    const ctxConv = document.getElementById('conversionGaugeChart');
    if (!ctxTrend || !ctxIndus || !ctxOwn || !ctxConv) return;

    if (Chart.getChart(ctxTrend)) Chart.getChart(ctxTrend).destroy();
    if (Chart.getChart(ctxIndus)) Chart.getChart(ctxIndus).destroy();
    if (Chart.getChart(ctxOwn)) Chart.getChart(ctxOwn).destroy();
    if (Chart.getChart(ctxConv)) Chart.getChart(ctxConv).destroy();

    const lbs = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    // 1. Pipeline Value Trend (Area)
    new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: lbs,
        datasets: [{
          label: 'Pipeline Value',
          data: [5.2, 6.1, 6.8, 7.3, 7.9, 8.6, 9.1, 9.8, 10.5, 11.7, 13.6, 15.2, 22.4],
          borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#6366f1'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            display: (c) => c.dataIndex % 2 === 0 || c.dataIndex === 12,
            align: 'top', color: '#6366f1', font: { family: 'Kanit', weight: '700', size: 9 },
            formatter: v => v + 'M'
          }
        },
        scales: {
          y: { ticks: { font: { family: 'Kanit' }, callback: v => v + 'M' }, grid: { color: '#f1f5f9' }, border: { display: false } },
          x: { ticks: { font: { family: 'Kanit' } }, grid: { display: false }, border: { display: false } }
        }
      }
    });

    // 2. Pipeline by Industry (Donut)
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart) => {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta.data || !meta.data[0]) return;
        const { x, y } = meta.data[0];
        ctx.save();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '700 1.2rem Kanit'; ctx.fillStyle = '#1e293b';
        ctx.fillText('฿ 85.36M', x, y - 8);
        ctx.font = '400 .75rem Kanit'; ctx.fillStyle = '#64748b';
        ctx.fillText('Total Pipeline', x, y + 15);
        ctx.restore();
      }
    };

    new Chart(ctxIndus, {
      type: 'doughnut',
      plugins: [centerTextPlugin],
      data: {
        labels: ['รายได้จากการขาย', 'ต้นทุนโครงการ', 'ค่าใช้จ่ายในการดำเนินงาน'],
        datasets: [{
          data: [29.45, 22.18, 15.37, 10.25, 8.11],
          backgroundColor: ['#6366f1', '#3b82f6', '#8ecead', '#f59e0b', '#94a3b8'],
          borderWidth: 2, borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '75%',
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { family: 'Kanit', size: 9 }, usePointStyle: true, padding: 12 },
            generateLabels: (chart) => {
              const ds = chart.data.datasets[0];
              const total = ds.data.reduce((a, b) => a + b, 0);
              return chart.data.labels.map((l, i) => ({
                text: `${l}   ${ds.data[i]}M (${(ds.data[i] * 100 / total).toFixed(1)}%)`,
                fillStyle: ds.backgroundColor[i],
                hidden: false, index: i
              }));
            }
          },
          datalabels: { display: false }
        }
      }
    });

    // 3. Top Owners (Horizontal Bar)
    new Chart(ctxOwn, {
      type: 'bar',
      data: {
        labels: ['Jirawat P.', 'Nattapol K.', 'Kannika S.', 'Pitsanulok T.'],
        datasets: [{
          data: [28.75, 22.40, 18.35, 15.86],
          backgroundColor: '#6366f1', borderRadius: 4, barThickness: 12
        }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, datalabels: { display: false } },
        scales: {
          x: { ticks: { font: { family: 'Kanit' }, callback: v => v + 'M' }, grid: { display: false }, border: { display: false } },
          y: { ticks: { font: { family: 'Kanit', size: 9 } }, grid: { display: false }, border: { display: false } }
        }
      }
    });

    // 4. Conversion Gauge
    new Chart(ctxConv, {
      type: 'doughnut',
      data: {
        labels: ['Win', 'Loss'],
        datasets: [{
          data: [28.6, 71.4],
          backgroundColor: ['#10b981', '#f1f5f9'],
          circumference: 180, rotation: 270, cutout: '80%', borderWidth: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false }
        }
      }
    });

    console.log("Sale Pipeline: Charts rendered successfully.");
  }
  window.initDocumentCharts = function() {
    const ctxStorage = document.getElementById('storageDonutChart');
    if (!ctxStorage) return;

    if (Chart.getChart(ctxStorage)) Chart.getChart(ctxStorage).destroy();

    new Chart(ctxStorage, {
      type: 'doughnut',
      data: {
        labels: ['Used', 'Free'],
        datasets: [{
          data: [125.68, 74.32],
          backgroundColor: ['#3b82f6', '#f1f5f9'],
          borderWidth: 0,
          cutout: '85%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false }
        }
      }
    });

    console.log("Documents: Charts rendered successfully.");
  }
  window.initLearningCharts = function() {
    const ctxProg = document.getElementById('learningProgressDonut');
    if (!ctxProg) return;

    if (Chart.getChart(ctxProg)) Chart.getChart(ctxProg).destroy();

    new Chart(ctxProg, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          data: [68, 32],
          backgroundColor: ['#6366f1', '#f1f5f9'],
          borderWidth: 0,
          cutout: '85%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false }
        }
      }
    });

    console.log("Learning Skills: Charts rendered successfully.");
  }
  window.initCareerCharts = function() {
    const ctxRadar = document.getElementById('skillRadarChart');
    if (!ctxRadar) return;

    if (Chart.getChart(ctxRadar)) Chart.getChart(ctxRadar).destroy();

    new Chart(ctxRadar, {
      type: 'radar',
      data: {
        labels: ['Cost Estimation', 'Data Analysis', 'Microsoft Excel', 'Project Management', 'Communication', 'Leadership'],
        datasets: [
          {
            label: 'ระดับของคุณ',
            data: [85, 70, 75, 80, 60, 55],
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: '#6366f1',
            pointBackgroundColor: '#6366f1',
            borderWidth: 2
          },
          {
            label: 'ระดับที่ต้องการ',
            data: [95, 85, 90, 90, 80, 75],
            backgroundColor: 'rgba(226, 232, 240, 0.2)',
            borderColor: '#94a3b8',
            pointBackgroundColor: '#94a3b8',
            borderWidth: 1,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { usePointStyle: true, pointStyle: 'line' } } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: { color: '#f1f5f9' },
            pointLabels: { font: { family: 'Kanit', size: 9 }, color: '#64748b' }
          }
        },
        plugins: {
          legend: { display: false },
          datalabels: { display: false }
        }
      }
    });

    console.log("Career Path: Charts rendered successfully.");
  }

  // ---------- LEAVE MODAL LOGIC ----------
  window.showLeaveModal = function(editId = null) {
    const modalId = 'leaveModal';
    if (document.getElementById(modalId)) document.getElementById(modalId).remove();

    const req = editId ? DATA.leaveRequests.find(r => r.id === editId) : null;
    const isComp = req ? (req.type === 'วันหยุดชดเชย') : false;

    // Robust Thai/Generic Date Parser
    const robustParseDate = (str) => {
      if (!str || str === '-') return '';
      if (str.includes('-')) return str; // ISO
      if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 3) {
          let y = parseInt(parts[2]);
          if (y > 2500) y -= 543; // Thai to Christian
          return `${y}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      const parts = str.split(/\s+/);
      if (parts.length < 3) return str;
      const day = parts[0].padStart(2, '0');
      const monthMap = {
        'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12',
        'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08', 'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
      };
      const month = monthMap[parts[1]] || '01';
      let year = parseInt(parts[2]);
      if (year > 2500) year -= 543;
      return `${year}-${month}-${day}`;
    };

    const startVal = req ? (req.startRaw || robustParseDate(req.start)) : '';
    const endVal = req ? (req.endRaw || robustParseDate(req.end)) : '';
    const refDateVal = req ? (req.refDateRaw || robustParseDate(req.refDate)) : '';

    const modalHtml = `
    <div id="${modalId}" class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999; backdrop-filter:blur(4px)">
      <div class="modal-card fade-in" style="background:#fff; width:500px; border-radius:16px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); overflow:hidden">
        <div style="padding:20px 24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#f8fafc">
          <h3 style="margin:0; font-size:1.1rem; font-weight:700; color:#1e293b">${editId ? 'แก้ไขรายการลาพนักงาน' : 'เพิ่มรายการลาพนักงาน'}</h3>
          <button onclick="closeLeaveModal()" style="background:none; border:none; color:#64748b; cursor:pointer; padding:4px"><i data-lucide="x" style="width:20px; height:20px"></i></button>
        </div>
        <div style="padding:24px; display:flex; flex-direction:column; gap:20px">
          <!-- Mode Selection -->
          <div style="display:flex; gap:20px; padding:12px; background:#f8fafc; border-radius:12px; margin-bottom:4px">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:.8rem; font-weight:600; color:#475569">
              <input type="radio" name="leaveMode" value="leave" ${!isComp ? 'checked' : ''} onclick="toggleLeaveMode('leave')" style="width:16px; height:16px; accent-color:var(--primary)"> 
              <span>ลาปกติ (Leave)</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:.8rem; font-weight:600; color:#475569">
              <input type="radio" name="leaveMode" value="comp" ${isComp ? 'checked' : ''} onclick="toggleLeaveMode('comp')" style="width:16px; height:16px; accent-color:var(--primary)"> 
              <span>วันหยุดชดเชย (Compensatory)</span>
            </label>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
            <div style="position:relative">
              <label style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">ชื่อพนักงาน</label>
              <input type="text" id="leaveEmpName" class="select-input" value="${req ? req.name : ''}" style="width:100%; font-family:'Kanit', sans-serif" placeholder="พิมพ์ค้นหาชื่อพนักงาน..." autocomplete="off" onkeyup="filterLeaveEmployees(this.value)">
              <div id="leaveEmpSuggestions" style="position:absolute; top:100%; left:0; width:100%; background:#fff; border:1px solid var(--border); border-radius:8px; margin-top:4px; max-height:200px; overflow-y:auto; z-index:100; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); display:none">
                ${(DATA.employees || []).map(e => `
                  <div class="suggestion-item" onclick="selectLeaveEmployee('${e.name}')" style="padding:10px 12px; cursor:pointer; font-size:.7rem; border-bottom:1px solid #f1f5f9">
                    <div style="font-weight:600">${e.name}</div>
                    <div style="font-size:.65rem; color:var(--text-3)">${e.dept} | ${e.nickname}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div id="leaveTypeContainer" style="display: ${isComp ? 'none' : 'block'}">
              <label style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">ประเภทการลา</label>
              <select id="leaveType" class="select-input" style="width:100%; font-family:'Kanit', sans-serif">
                ${['ลาพักร้อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอด / ลาเลี้ยงดูบุตร', 'ลาเพื่อการฌาปนกิจศพ', 'อบรม / สัมมนา', 'อื่นๆ'].map(t => `
                  <option ${req && req.type === t ? 'selected' : ''}>${t}</option>
                `).join('')}
              </select>
            </div>
            <div id="compDateContainer" style="display: ${isComp ? 'block' : 'none'}">
              <label style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">ใช้ของวันที่เท่าไร (Ref. Date)</label>
              <div style="position:relative">
                <input type="text" id="leaveRefDate" class="select-input" style="width:100%; font-family:'Kanit', sans-serif" placeholder="เลือกวันที่ชดเชย...">
                <i data-lucide="calendar" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:var(--text-3)"></i>
              </div>
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
            <div>
              <label style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">วันที่ต้องการลา (เริ่ม)</label>
              <div style="position:relative">
                <input type="text" id="leaveStart" class="select-input" style="width:100%; font-family:'Kanit', sans-serif" placeholder="เลือกวันที่...">
                <i data-lucide="calendar" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:var(--text-3)"></i>
              </div>
            </div>
            <div>
              <label style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">วันที่ต้องการลา (สิ้นสุด)</label>
              <div style="position:relative">
                <input type="text" id="leaveEnd" class="select-input" style="width:100%; font-family:'Kanit', sans-serif" placeholder="เลือกวันที่...">
                <i data-lucide="calendar" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:var(--text-3)"></i>
              </div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
            <div>
              <label style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">จำนวนวัน</label>
              <input type="text" id="leaveDays" class="select-input" style="width:100%; background:#f8fafc; font-weight:700; font-family:'Kanit', sans-serif" readonly value="${req ? req.days : '0'}">
            </div>
            <div>
              <label style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">สถานะ</label>
              <select id="leaveStatus" class="select-input" style="width:100%; font-family:'Kanit', sans-serif">
                <option value="pending" ${req && req.status === 'pending' ? 'selected' : ''}>รอการอนุมัติ</option>
                <option value="approved" ${req && (req.status === 'approved' || req.status === 'อนุมัติแล้ว') ? 'selected' : ''}>อนุมัติแล้ว</option>
                <option value="rejected" ${req && req.status === 'rejected' ? 'selected' : ''}>ไม่อนุมัติ</option>
              </select>
            </div>
          </div>

          <div>
            <label style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">หมายเหตุ (Note)</label>
            <textarea id="leaveNote" class="select-input" style="width:100%; height:80px; font-family:'Kanit', sans-serif; resize:none; padding:10px" placeholder="ใส่ข้อมูลเพิ่มเติมที่นี่...">${req ? (req.note || '') : ''}</textarea>
          </div>

        </div>
        <div style="padding:16px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:8px">
          <button onclick="closeLeaveModal()" class="btn btn-sm" style="background:#fff; border:1px solid #e2e8f0; color:#64748b; padding:8px 16px; font-family:'Kanit', sans-serif">ยกเลิก</button>
          <button onclick="saveLeaveRequest()" class="btn btn-primary" style="padding:8px 24px; font-weight:600; font-family:'Kanit', sans-serif">${editId ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}</button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });
    window._editingLeaveId = editId;

    // Init Flatpickr
    const fpConfig = {
      locale: {
        firstDayOfWeek: 0, // Sunday
        weekdays: {
            shorthand: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
            longhand: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
        },
        months: {
            shorthand: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
            longhand: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        }
      },
      dateFormat: 'Y-m-d',
      disableMobile: "true",
      monthSelectorType: 'dropdown',
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
            for (let y = curYear - 6; y <= curYear + 5; y++) {
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

        // Direct click handlers for month and year labels in Leave Modal
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
      },
      onChange: updateLeaveDays,
      onOpen: (selectedDates, dateStr, instance) => {
        instance.calendarContainer.style.zIndex = "10000";
      }
    };
    flatpickr('#leaveStart', { ...fpConfig, defaultDate: startVal });
    flatpickr('#leaveEnd', { ...fpConfig, defaultDate: endVal });
    flatpickr('#leaveRefDate', { ...fpConfig, defaultDate: refDateVal });

    // Helper function for toggling mode inside modal
    window.toggleLeaveMode = function (mode) {
      const typeCont = document.getElementById('leaveTypeContainer');
      const compCont = document.getElementById('compDateContainer');
      if (mode === 'comp') {
        typeCont.style.display = 'none';
        compCont.style.display = 'block';
      } else {
        typeCont.style.display = 'block';
        compCont.style.display = 'none';
      }
    };

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#leaveEmpName') && !e.target.closest('#leaveEmpSuggestions')) {
        const sug = document.getElementById('leaveEmpSuggestions');
        if (sug) sug.style.display = 'none';
      }
    });
  }

  window.filterLeaveEmployees = function(q) {
    const container = document.getElementById('leaveEmpSuggestions');
    if (!q) { container.style.display = 'none'; return; }

    const query = q.toLowerCase();
    const items = container.querySelectorAll('.suggestion-item');
    let hasMatch = false;

    items.forEach(item => {
      const isMatch = item.textContent.toLowerCase().includes(query);
      item.style.display = isMatch ? 'block' : 'none';
      if (isMatch) hasMatch = true;
    });

    container.style.display = hasMatch ? 'block' : 'none';
  }

  window.selectLeaveEmployee = function(name) {
    document.getElementById('leaveEmpName').value = name;
    document.getElementById('leaveEmpSuggestions').style.display = 'none';
  }

  window.closeLeaveModal = function() {
    document.getElementById('leaveModal')?.remove();
  }

  window.updateLeaveDays = function() {
    const s = document.getElementById('leaveStart').value;
    const e = document.getElementById('leaveEnd').value;
    if (s && e) {
      const d1 = new Date(s);
      const d2 = new Date(e);
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      const finalDays = diff >= 0 ? diff + 1 : 0;
      document.getElementById('leaveDays').value = finalDays;
    }
  }

  window.saveLeaveRequest = function() {
    const empName = document.getElementById('leaveEmpName').value;
    const mode = document.querySelector('input[name="leaveMode"]:checked').value;
    const type = mode === 'leave' ? document.getElementById('leaveType').value : 'วันหยุดชดเชย';
    const refInput = document.getElementById('leaveRefDate');
    const refDate = mode === 'comp' ? (refInput._flatpickr ? refInput._flatpickr.input.value : refInput.value) : '';
    const note = document.getElementById('leaveNote').value;

    const start = document.getElementById('leaveStart').value;
    const end = document.getElementById('leaveEnd').value;
    const days = parseInt(document.getElementById('leaveDays').value);
    const status = document.getElementById('leaveStatus').value;

    if (!empName || !start || !end) {
      if (typeof showToast === 'function') showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (mode === 'comp' && !refDate) {
      if (typeof showToast === 'function') showToast('Please select a reference date (Ref. Date).', 'error');
      return;
    }

    const isEditing = !!window._editingLeaveId;

    // Generate ID in Format: LR-ddmmyyyy-xx (xx is sequence)
    let id = window._editingLeaveId;
    if (!isEditing) {
      const d = new Date();
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear(); // Christian Era
      const datePrefix = `${day}${month}${year}`;

      // Count how many requests today to get the next sequence
      const todayPrefix = `LR-${datePrefix}-`;
      const todayCount = (DATA.leaveRequests || []).filter(r => r.id && r.id.startsWith(todayPrefix)).length;
      const sequence = (todayCount + 1).toString().padStart(2, '0');

      id = `LR-${datePrefix}-${sequence}`;
    }

    const now = new Date();
    const reqDate = `${now.getDate()} ${['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][now.getMonth()]} ${now.getFullYear() + 543}`;

    // Format dates for display
    const dStart = new Date(start);
    const dEnd = new Date(end);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const startStr = `${dStart.getDate()} ${months[dStart.getMonth()]} ${dStart.getFullYear() + 543}`;
    const endStr = `${dEnd.getDate()} ${months[dEnd.getMonth()]} ${dEnd.getFullYear() + 543}`;

    if (isEditing) {
      // Update existing record
      const idx = DATA.leaveRequests.findIndex(r => r.id === id);
      if (idx !== -1) {
        // Format refDate to Thai if it's compensatory
        let refDateStr = refDate;
        if (mode === 'comp' && refDate && refDate.includes('-')) {
          const dRef = new Date(refDate);
          refDateStr = `${dRef.getDate()} ${months[dRef.getMonth()]} ${dRef.getFullYear() + 543}`;
        }

        DATA.leaveRequests[idx] = {
          ...DATA.leaveRequests[idx],
          name: empName,
          type,
          refDate: refDateStr,
          refDateRaw: refDate, // Keep ISO for logic
          note, // Store note
          start: startStr,
          end: endStr,
          startRaw: start,
          endRaw: end,
          days,
          status,
          approvedBy: (status === 'pending' || status === 'รอการอนุมัติ') ? '-' : (DATA.leaveRequests[idx].approvedBy === '-' ? 'Admin User' : DATA.leaveRequests[idx].approvedBy),
        };

        // Save update to Google Sheets
        apiSaveLeave({ ...DATA.leaveRequests[idx], action: 'edit' }).then((success) => {
          if (!success) {
            showAlert('Error', 'บันทึกข้อมูลลง Google Sheets ไม่สำเร็จ', 'error');
          }
        });
      }
      window._editingLeaveId = null;
    } else {
      // Format refDate to Thai if it's compensatory
      let refDateStr = refDate;
      if (mode === 'comp' && refDate && refDate.includes('-')) {
        const dRef = new Date(refDate);
        refDateStr = `${dRef.getDate()} ${months[dRef.getMonth()]} ${dRef.getFullYear() + 543}`;
      }

      // Create new record
      const newReq = {
        id,
        name: empName,
        type,
        refDate: refDateStr,
        refDateRaw: refDate,
        note, // Store note
        start: startStr,
        end: endStr,
        startRaw: start,
        endRaw: end,
        days,
        status,
        approvedBy: (status === 'pending' || status === 'รอการอนุมัติ') ? '-' : 'Admin User',
        requestDate: reqDate,
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(empName) + '&background=random'
      };

      DATA.leaveRequests.unshift(newReq);

      // Save to Google Sheets
      apiSaveLeave({ ...newReq, action: 'add' }).then((success) => {
        if (!success) {
            showAlert('Error', 'บันทึกข้อมูลลง Google Sheets ไม่สำเร็จ', 'error');
        }
      });
    }

    closeLeaveModal();

    // Re-render immediately so user sees it in memory
    if (typeof navigate === 'function') navigate('leave-management');
  }

  // ---------- LEAVE EDIT & DELETE ----------
  window.editLeaveRequest = function(id) {
    showLeaveModal(id);
  }

  window.deleteLeaveRequest = function(id) {
    const req = DATA.leaveRequests.find(r => r.id === id);
    if (!req) return;

    showConfirmModal({
      title: 'Confirm Deletion',
      message: `Are you sure you want to permanently delete the leave request for "${req.name}" (${req.id})? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        // Remove from local data
        DATA.leaveRequests = DATA.leaveRequests.filter(r => r.id !== id);

        // Recalculate stats
        const data = DATA.leaveRequests;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const onLeaveToday = data.filter(r =>
          (r.status === 'approved' || r.status === 'อนุมัติแล้ว') &&
          r.startRaw <= todayStr &&
          r.endRaw >= todayStr
        );

        DATA.leaveStats = {
          total: data.length,
          approved: data.filter(d => d.status === 'approved' || d.status === 'อนุมัติแล้ว').length,
          pending: data.filter(d => d.status === 'pending' || d.status === 'รอการอนุมัติ').length,
          rejected: data.filter(d => d.status === 'rejected' || d.status === 'ไม่อนุมัติ').length,
          peopleOnLeave: onLeaveToday.length,
          totalDays: data.reduce((sum, d) => sum + d.days, 0)
        };

        // Re-render immediately
        if (typeof navigate === 'function') navigate('leave-management');

        try {
          // Send to Google Sheets
          const success = await apiSaveLeave({ id, action: 'delete' });
          if (success) {
            console.log('Leave deletion sent to sheets');
            if (typeof showToast === 'function') showToast('Data deleted successfully', 'success');
            setTimeout(loadLeavesFromSheets, 2000);
          } else {
            if (typeof showToast === 'function') showToast('Error deleting data', 'error');
          }
        } catch (err) {
          console.error('Error deleting leave:', err);
          if (typeof showToast === 'function') showToast('Error deleting data', 'error');
        }
      }
    });
  }

  // ---------- LEAVE MANAGEMENT ----------
  window.pageLeaveManagement = function() {
    setTimeout(() => {
      const contentEl = document.getElementById('pageContent');
      if (contentEl) {
        contentEl.innerHTML = window._renderLeaveManagementContent();
        if (typeof lucide !== 'undefined') lucide.createIcons({ root: contentEl });
        if (window._leaveActiveTab === 'overview') { setTimeout(initLeaveCharts, 100); }
      }
    }, 50);

    return `
    <div style="min-height:400px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-3); gap:12px;">
       <div style="width:30px;height:30px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
       <div style="font-size:0.9rem;font-weight:500;">Loading Leave Data...</div>
    </div>`;
  }

  window._renderLeaveManagementContent = function() {
    window._leaveActiveTab = window._leaveActiveTab || 'overview';

    // 0. Date Range Logic: 
    let dateStart = null, dateEnd = null;
    if (window._leaveDateRange) {
      const parts = window._leaveDateRange.split(' to ');
      if (parts.length >= 1) {
        dateStart = new Date(parts[0]);
        dateEnd = parts[1] ? new Date(parts[1]) : new Date(parts[0]);
        dateStart.setHours(0, 0, 0, 0);
        dateEnd.setHours(23, 59, 59, 999);
      }
    }

    const allRequests = DATA.leaveRequests || [];
    const requests = !dateStart ? allRequests : allRequests.filter(r => {
      if (!r.startRaw || !r.endRaw) return false;

      const [sy, sm, sd] = r.startRaw.split('-').map(Number);
      const [ey, em, ed] = r.endRaw.split('-').map(Number);
      const rs = new Date(sy, sm - 1, sd);
      const re = new Date(ey, em - 1, ed);

      rs.setHours(0, 0, 0, 0);
      re.setHours(0, 0, 0, 0);
      return (rs <= dateEnd && re >= dateStart);
    });

    window._filteredLeaveRequests = requests;

    const stats = {
      total: requests.length,
      approved: requests.filter(d => d.status === 'approved' || d.status === '͹--ѵ-----').length,
      pending: requests.filter(d => d.status === 'pending' || d.status === '-͡--͹--ѵ-').length,
      rejected: requests.filter(d => d.status === 'rejected' || d.status === '---͹--ѵ-').length,
      peopleOnLeave: 0,
      totalDays: requests.reduce((sum, d) => sum + (Number(d.days) || 0), 0)
    };

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    stats.peopleOnLeave = requests.filter(r =>
      (r.status === 'approved' || r.status === 'อนุมัติแล้ว') &&
      r.startRaw <= todayStr &&
      r.endRaw >= todayStr
    ).length;

    const employees = DATA.employees || [];
    const totalEmp = employees.length || 1;
    const pctApproved = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : '0.0';
    const pctPending = stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : '0.0';
    const pctRejected = stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(1) : '0.0';

    return `
  <!-- Top Action Bar -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
    <div class="tabs" style="display:flex; gap:8px; background:transparent; padding:0; border:none; border-bottom:none; box-shadow:none; margin-bottom:0; align-items:center">
      <button class="tab-btn ${window._leaveActiveTab !== 'empeo' ? 'active' : ''}" onclick="window._leaveActiveTab='overview'; navigate('leave-management')" style="border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
        <i data-lucide="layout-grid" style="width:18px; height:18px"></i> Overview
      </button>
      <button class="tab-btn ${window._leaveActiveTab === 'empeo' ? 'active' : ''}" onclick="window._leaveActiveTab='empeo'; navigate('leave-management')" style="border-radius:12px; cursor:pointer; font-size:.85rem; display:flex; align-items:center; gap:8px; transition:all 0.2s">
        <i data-lucide="bar-chart-2" style="width:18px; height:18px"></i> Empeo Report
      </button>
    </div>
    <div style="display:flex; gap:12px; align-items:center">
      ${renderDateFilter(
        "navigate('leave-management')", 
        'auto', 
        null, 
        true, 
        window._leaveActiveTab === 'empeo' ? `
        <div class="search-box" style="width:200px; background:#fff; padding:0 12px; border:1px solid var(--border); border-radius:8px; display:flex; align-items:center; gap:8px; height: 34px">
          <i data-lucide="search" style="width:14px; height:14px; color:var(--text-3)"></i>
          <input type="text" id="empeoSearch" onkeyup="window.filterEmpeoTable(this.value)" placeholder="ค้นหาพนักงาน, รหัส หรือแผนก..." style="background:none; border:none; outline:none; font-size:.8rem; width:100%; font-family:'Kanit', sans-serif; color:var(--text)">
        </div>` : '',
        '_leaveDateRange'
      )}
    </div>
  </div>

  ${window._leaveActiveTab === 'empeo' ? renderEmpeoReport() : `
  <!-- KPI Row -->
  <div class="fade-in" style="display:grid; grid-template-columns:repeat(6,1fr); gap:16px; margin-bottom:24px">
    ${[
        { label: 'ยอดการลาทั้งหมด', val: stats.total, sub: 'รายการทั้งหมดในระบบ', icon: 'calendar', color: '#A5B4FC' },
        { label: 'อนุมัติแล้ว', val: stats.approved, sub: pctApproved + '% ของทั้งหมด', icon: 'check-circle', color: '#7FD1B9' },
        { label: 'รอการอนุมัติ', val: stats.pending, sub: pctPending + '% ของทั้งหมด', icon: 'clock', color: '#FDE68A' },
        { label: 'ไม่อนุมัติ', val: stats.rejected, sub: pctRejected + '% ของทั้งหมด', icon: 'x-circle', color: '#FCA5A5' },
        { label: 'จำนวนผู้ลา', val: stats.peopleOnLeave, sub: 'จากทั้งหมด ' + totalEmp + ' คน', icon: 'users', color: '#93C5FD' },
        { label: 'วันลาทั้งหมด', val: stats.totalDays, sub: 'รวมทุกประเภทการลา', icon: 'file-text', color: '#C084FC' }
      ].map(k => `
      <div class="stat-card" style="padding:16px; display:flex; flex-direction:column; gap:8px">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <div style="width:32px; height:32px; border-radius:8px; background:${k.color}15; color:${k.color}; display:flex; align-items:center; justify-content:center">
            <i data-lucide="${k.icon}" style="width:18px; height:18px"></i>
          </div>
          <div style="font-size:.65rem; color:var(--text-3); font-weight:600">${k.label}</div>
        </div>
        <div style="font-size:1.4rem; font-weight:700; color:var(--text)">${k.val.toLocaleString()}</div>
        <div style="font-size:.6rem; color:${k.sub.includes('?-?') ? '#10b981' : 'var(--text-3)'}">${k.sub}</div>
      </div>
    `).join('')}
  </div>


  <!-- Floating Bulk Action Bar (Popup Style) -->
  <div id="leaveBulkActions" class="fade-in" style="display:none; position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:rgba(30, 41, 59, 0.9); backdrop-filter:blur(10px); color:#fff; padding:8px 12px 8px 24px; border-radius:40px; align-items:center; gap:20px; box-shadow:0 15px 30px rgba(0,0,0,0.3); z-index:10000; border:1px solid rgba(255,255,255,0.1)">
      <div id="leaveSelectedCount" style="font-weight:700; font-size:.85rem; white-space:nowrap; color:#e2e8f0">0 รายการที่เลือก</div>
      <div style="width:1px; height:20px; background:rgba(255,255,255,0.2)"></div>
      <div style="display:flex; gap:6px">
        <button onclick="bulkDeleteLeaves()" class="btn btn-sm" style="background:#ef4444; color:#fff; border:none; font-weight:700; border-radius:30px; padding:6px 14px; font-size:.7rem; display:flex; align-items:center; gap:6px; margin-left:10px">
          <i data-lucide="trash-2" style="width:14px; height:14px"></i> ลบ
        </button>
      </div>
      <button onclick="toggleSelectAllLeaves(false)" style="background:none; border:none; color:#94a3b8; cursor:pointer; padding:6px; margin-left:4px" title="ยกเลิกการเลือก">
        <i data-lucide="x" style="width:16px; height:16px"></i>
      </button>
  </div>

  <!-- Charts Row -->
  <div class="fade-in" style="display:grid; grid-template-columns:420px 1fr 260px 260px; gap:16px; margin-bottom:24px">
    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">เอกสารตามหมวดหมู่</div>
      </div>
      <div style="height:220px">
        <canvas id="leaveTypeChart"></canvas>
      </div>
    </div>

    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">เอกสารตามหมวดหมู่</div>
      </div>
      <div style="height:220px">
        <canvas id="leaveTrendChart"></canvas>
      </div>
    </div>

    <div class="card" style="padding:16px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
        <div style="font-size:.8rem; font-weight:700">สถานะการลา</div>
      </div>
      <div style="height:180px; position:relative; margin-bottom:15px">
        <canvas id="leaveStatusChart"></canvas>
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center">
          <div style="font-size:1.6rem; font-weight:700; color:var(--text)">${stats.total || 0}</div>
          <div style="font-size:.65rem; color:var(--text-3)">รายการ</div>
        </div>
      </div>
      <!-- Chart Legend -->
      <div style="display:flex; flex-direction:column; gap:8px; padding-top:10px; border-top:1px solid #f8fafc">
        ${[
        { label: 'รอการอนุมัติ', color: '#FDE68A', count: stats.pending },
        { label: 'อนุมัติแล้ว', color: '#7FD1B9', count: stats.approved },
        { label: 'ไม่อนุมัติ', color: '#FCA5A5', count: stats.rejected }
      ].map(l => `
          <div style="display:flex; justify-content:space-between; align-items:center">
            <div style="display:flex; align-items:center; gap:8px">
              <div style="width:8px; height:8px; border-radius:50%; background:${l.color}"></div>
              <span style="font-size:.7rem; color:var(--text-2); font-weight:500">${l.label}</span>
            </div>
            <span style="font-size:.7rem; color:var(--text); font-weight:700">${l.count}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Calendar -->
    <div class="card" style="padding:16px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
        <div style="font-size:.8rem; font-weight:700">ปฏิทินการลา</div>
        <div style="display:flex; gap:6px">
          <button style="background:none; border:none; color:var(--text-3); cursor:pointer"><i data-lucide="chevron-left" style="width:12px; height:12px"></i></button>
          <div style="font-size:.7rem; font-weight:700">พฤษภาคม 2569</div>
          <button style="background:none; border:none; color:var(--text-3); cursor:pointer"><i data-lucide="chevron-right" style="width:12px; height:12px"></i></button>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:2px; text-align:center">
        ${['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map(d => `<div style="font-size:.6rem; color:var(--text-3); font-weight:600; padding:2px 0">${d}</div>`).join('')}
        ${(() => {
        const now = new Date();
        const year = 2026; // Force Gregorian for calculation
        const month = 4; // May (0-indexed)
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = now.getDate();

        let html = '';
        // Add padding for first day (Sunday=0, so Fri=5)
        for (let p = 0; p < firstDay; p++) html += '<div></div>';

        // Add days
        for (let d = 1; d <= daysInMonth; d++) {
          const isToday = d === today;
          const hasLeave = [15, 17, 18, 20, 25, 28].includes(d);
          html += `
              <div style="height:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; font-size:.65rem; color:var(--text-2); background:${isToday ? 'var(--primary)' : 'transparent'}; color:${isToday ? '#fff' : 'inherit'}; border-radius:4px; cursor:pointer">
                ${d}
                ${hasLeave ? `<div style="width:3px; height:3px; border-radius:50%; background:${isToday ? '#fff' : '#f59e0b'}; margin-top:1px"></div>` : ''}
              </div>
            `;
        }
        return html;
      })()}
      </div>
      <div style="margin-top:12px; display:flex; flex-wrap:wrap; gap:8px; justify-content:center">
        ${[
        { label: 'ลาพักร้อน', color: '#6366f1' },
        { label: 'ลาป่วย', color: '#10b981' },
        { label: 'ลากิจ', color: '#f59e0b' },
        { label: 'ลาอบรม', color: '#a855f7' },
        { label: 'อื่นๆ', color: '#64748b' }
      ].map(l => `
          <div style="display:flex; align-items:center; gap:4px">
            <div style="width:4px; height:4px; border-radius:50%; background:${l.color}"></div>
            <span style="font-size:.6rem; color:var(--text-3)">${l.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>

  <!-- On Leave Today Card -->
  ${(() => {
        const onLeaveToday = requests.filter(r =>
          (r.status === 'approved' || r.status === 'อนุมัติแล้ว') &&
          r.startRaw <= todayStr && r.endRaw >= todayStr
        );
        const todayDisplay = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        return `
  <div class="card fade-in" style="padding:18px 24px; margin-bottom:20px; background:linear-gradient(135deg, #f8faff 0%, #fff 100%); border:1px solid #e8edff">
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:${onLeaveToday.length > 0 ? '14px' : '0'}">
      <div style="display:flex; align-items:center; gap:10px">
        <div style="width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(99,102,241,0.25)">
          <i data-lucide="user-check" style="width:16px; height:16px; color:#fff"></i>
        </div>
        <div>
          <div style="font-size:.9rem; font-weight:700; color:var(--text)">On Leave Today</div>
          <div style="font-size:.7rem; color:var(--text-3)">${todayDisplay}</div>
        </div>
      </div>
      <div style="background:${onLeaveToday.length > 0 ? 'linear-gradient(135deg,#f43f5e,#e11d48)' : '#e2e8f0'}; color:${onLeaveToday.length > 0 ? '#fff' : 'var(--text-3)'}; font-size:.7rem; font-weight:700; padding:4px 14px; border-radius:20px; box-shadow:${onLeaveToday.length > 0 ? '0 4px 12px rgba(244,63,94,0.25)' : 'none'}">
        ${onLeaveToday.length} person${onLeaveToday.length !== 1 ? 's' : ''}
      </div>
    </div>
    ${onLeaveToday.length === 0
            ? `<div style="color:var(--text-3); font-size:.8rem; font-style:italic; text-align:center; padding:6px 0">No one is on leave today</div>`
            : `<div style="display:flex; flex-wrap:wrap; gap:8px">
        ${onLeaveToday.map(r => {
              const emp = (DATA.employees || []).find(e => e.name === r.name) || {};
              const nick = (emp.nickname && emp.nickname !== '-') ? emp.nickname : (r.name || '').trim().split(/\s+/)[0];
              const leaveTypeColor = r.type === 'ลาพักร้อน' ? '#0ea5e9' : r.type === 'ลากิจ' ? '#f97316' : r.type === 'ลาป่วย' ? '#ef4444' : r.type === 'วันหยุดชดเชย' ? '#10b981' : '#8b5cf6';
              const leaveLabel = r.type === 'ลาพักร้อน' ? 'Annual' : r.type === 'ลากิจ' ? 'Personal' : r.type === 'ลาป่วย' ? 'Sick' : r.type === 'วันหยุดชดเชย' ? 'Comp.' : r.type;
              return `
          <div style="display:flex; align-items:center; gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:10px 16px; min-width:200px; transition:all 0.2s" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
            <div style="width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:.7rem; flex-shrink:0; box-shadow:0 4px 10px rgba(99,102,241,0.2)">${nick}</div>
            <div style="min-width:0">
              <div style="font-weight:700; font-size:.8rem; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${r.name}</div>
              <div style="display:flex; align-items:center; gap:6px; margin-top:3px">
                <span style="background:${leaveTypeColor}15; color:${leaveTypeColor}; font-size:.6rem; font-weight:700; padding:2px 8px; border-radius:6px">${leaveLabel}</span>
                <span style="font-size:.6rem; color:var(--text-3)">${r.days > 1 ? r.start + ' -֧ ' + r.end : r.start}</span>
              </div>
            </div>
          </div>`;
            }).join('')}
      </div>`
          }
  </div>`;
      })()}

  <!-- Bottom Row -->
  <div class="fade-in" style="display:grid; grid-template-columns:1fr; gap:20px">

    <!-- Table -->
    <div class="card" style="padding:0; overflow:hidden">
      <div style="padding:20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
        <div style="font-size:.9rem; font-weight:700">รายการลาทั้งหมด</div>
        <div></div>
        <div style="display:flex; gap:12px; align-items:center">
          <div class="search-box" style="width:200px; background:#f8fafc; padding:8px 12px; border:1px solid var(--border); border-radius:10px">
            <i data-lucide="search" style="width:14px; height:14px; color:var(--text-3)"></i>
            <input type="text" id="leaveSearch" oninput="window._leaveSearchQuery=this.value; searchLeaveTable()" value="${window._leaveSearchQuery || ''}" placeholder="Search..." style="background:none; border:none; outline:none; font-size:.7rem; width:100%; font-family:'Kanit', sans-serif; color:var(--text)">
          </div>
          <button onclick="toggleLeaveBulkMode()" id="btnToggleBulk" style="background:var(--primary)15; color:var(--primary); border:1px solid var(--primary)30; font-weight:600; padding:6px 12px; border-radius:10px; display:flex; align-items:center; gap:6px; font-size:.7rem; cursor:pointer">
            <i data-lucide="check-square" style="width:14px; height:14px"></i> เลือกรายการ
          </button>
          <button class="btn btn-primary" onclick="showLeaveModal()" style="display:flex; align-items:center; gap:6px; padding:6px 12px; font-size:.7rem; font-weight:600">
            <i data-lucide="plus" style="width:14px; height:14px"></i> เพิ่มการลา
          </button>
        </div>
      </div>
      <div class="table-wrap" style="overflow-x:auto">
        <table class="data-table" id="leaveTable" style="width:100%">
          <colgroup>
            <col class="bulk-col" style="width:36px; display:${window.isLeaveBulkMode ? 'table-column' : 'none'}">
            <col style="width:11%">
            <col style="width:20%">
            <col style="width:14%">
            <col style="width:10%">
            <col style="width:15%">
            <col style="width:8%">
            <col style="width:18%">
            <col style="width:4%">
          </colgroup>
          <thead>
            <tr>
              <th class="bulk-col" style="padding-left:12px; width:36px; display:${window.isLeaveBulkMode ? 'table-cell' : 'none'}"><input type="checkbox" id="selectAllLeaves" onclick="toggleSelectAllLeaves(this.checked)" style="cursor:pointer; width:16px; height:16px"></th>
              <th style="padding-left:12px; white-space:nowrap">Request Date</th>
              <th>Employee</th>
              <th style="white-space:nowrap">Leave Type</th>
              <th style="white-space:nowrap">Comp. Day</th>
              <th style="white-space:nowrap">Leave Period</th>
              <th>Days</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="leaveTableBody">
            ${requests.map(r => {
        // Cross-reference with employee data for English name and nickname
        const emp = (DATA.employees || []).find(e => e.name === r.name) || {};
        const nameEn = emp.nameEn || '-';
        const nickname = (emp.nickname && emp.nickname !== '-') ? emp.nickname : (r.name || '').trim().split(/\s+/)[0];
        return `
              <tr id="row_leave_${r.id}" data-status="${r.status}" data-start="${r.startRaw}" data-end="${r.endRaw}">
                <td class="bulk-col" style="padding-left:20px; display:${window.isLeaveBulkMode ? 'table-cell' : 'none'}"><input type="checkbox" class="leave-checkbox" data-id="${r.id}" onclick="updateLeaveSelection()" style="cursor:pointer; width:16px; height:16px"></td>
                <td style="font-size:.7rem; color:var(--text-3); padding-left:12px; white-space:nowrap">${r.requestDate}</td>
                <td>
                  <div style="display:flex; align-items:center; gap:8px">
                    <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, #6366f1, #8b5cf6); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:.68rem; box-shadow: 0 4px 10px rgba(99,102,241,0.2); flex-shrink:0; text-align:center; line-height:1.2; padding:2px">${nickname}</div>
                    <div style="display:flex; flex-direction:column; gap:1px; min-width:0">
                      <div style="font-weight:700; color:var(--text); font-size:.7rem; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${r.name}</div>
                      <div style="font-size:.6rem; color:var(--text-3); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${nameEn}</div>
                      <div style="font-size:.6rem; color:var(--primary); font-weight:600; letter-spacing:0.3px">${r.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  ${(() => {
            let color = '#94a3b8';
            let bg = '#94a3b815';
            if (r.type === 'ลาพักร้อน') { color = '#0ea5e9'; bg = '#0ea5e915'; }
            else if (r.type === 'ลากิจ') { color = '#f97316'; bg = '#f9731615'; }
            else if (r.type === 'ลาป่วย') { color = '#ef4444'; bg = '#ef444415'; }
            else if (r.type.includes('ลาคลอด')) { color = '#ec4899'; bg = '#ec489915'; }
            else if (r.type.includes('ฌาปนกิจ')) { color = '#1e293b'; bg = '#1e293b15'; }
            else if (r.type.includes('อบรม')) { color = '#2563eb'; bg = '#2563eb15'; }
            else if (r.type === 'อื่นๆ' || r.type === 'วันหยุดชดเชย') { color = '#10b981'; bg = '#10b98115'; }
            return `<span class="badge" style="background:${bg}; color:${color}; font-size:.65rem">${r.type}</span>`;
          })()}
                </td>
                <td style="font-size:.7rem; color:var(--text-2)">${r.refDate && r.refDate !== '-' ? r.refDate : '-'}</td>
                <td style="font-size:.7rem; color:var(--text-2)">${r.days > 1 ? `${r.start} - ${r.end}` : r.start}</td>
                <td style="font-size:.7rem; color:var(--text-2); text-align:center">${r.days}</td>
                <td style="font-size:.7rem; color:var(--text-3); overflow:hidden; text-overflow:ellipsis; white-space:nowrap" title="${r.note || ''}">${r.note || '-'}</td>
                <td style="text-align:center; position:relative">
                  <button onclick="toggleActionMenu('leave_${r.id}', event)" style="background:none; border:none; color:var(--text-3); cursor:pointer; padding:4px"><i data-lucide="more-vertical" style="width:14px; height:14px"></i></button>
                  <div id="actionMenu_leave_${r.id}" style="display:none; position:absolute; right:100%; top:50%; transform:translateY(-50%); background:#fff; border:1px solid var(--border); border-radius:8px; box-shadow:var(--shadow-md); z-index:100; min-width:100px; padding:4px">
                    <button onclick="editLeaveRequest('${r.id}')" style="width:100%; text-align:left; padding:8px 12px; background:none; border:none; font-family:Kanit; font-size:.75rem; cursor:pointer; color:var(--text-2); border-radius:6px" onmouseover="this.style.background='#f4f7fe'" onmouseout="this.style.background='none'"><i data-lucide="edit-2" style="width:12px; height:12px; margin-right:6px; vertical-align:middle"></i> แก้ไข</button>
                    <button onclick="deleteLeaveRequest('${r.id}')" style="width:100%; text-align:left; padding:8px 12px; background:none; border:none; font-family:Kanit; font-size:.75rem; cursor:pointer; color:#ef4444; border-radius:6px" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'"><i data-lucide="trash-2" style="width:12px; height:12px; margin-right:6px; vertical-align:middle"></i> ลบ</button>
                  </div>
                </td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`}
  `;
  }

  window.toggleLeaveBulkMode = function() {
    window.isLeaveBulkMode = !window.isLeaveBulkMode;
    const btn = document.getElementById('btnToggleBulk');
    if (btn) {
      if (window.isLeaveBulkMode) {
        btn.innerHTML = '<i data-lucide="x" style="width:14px; height:14px"></i> ยกเลิกการเลือก';
        btn.style.background = '#fef2f2';
        btn.style.color = '#ef4444';
        btn.style.borderColor = '#fecaca';
      } else {
        btn.innerHTML = '<i data-lucide="check-square" style="width:14px; height:14px"></i> เลือกรายการ';
        btn.style.background = 'var(--primary)15';
        btn.style.color = 'var(--primary)';
        btn.style.borderColor = 'var(--primary)30';

        // Hide bulk bar and clear checkboxes
        toggleSelectAllLeaves(false);
      }
      if (window.lucide) lucide.createIcons({ root: btn });
    }

    // Toggle column visibility
    const bulkCols = document.querySelectorAll('.bulk-col');
    bulkCols.forEach(col => {
      col.style.display = window.isLeaveBulkMode ? 'table-cell' : 'none';
    });
  }

  window.toggleSelectAllLeaves = function(checked) {
    const checkboxes = document.querySelectorAll('.leave-checkbox');
    checkboxes.forEach(cb => cb.checked = checked);
    const mainCb = document.getElementById('selectAllLeaves');
    if (mainCb) mainCb.checked = checked;
    updateLeaveSelection();
  }

  window.updateLeaveSelection = function() {
    const checkboxes = document.querySelectorAll('.leave-checkbox:checked');
    const count = checkboxes.length;
    let bulkContainer = document.getElementById('leaveBulkContainer');
    
    if (!bulkContainer) {
        const table = document.getElementById('leaveTable');
        bulkContainer = document.createElement('div');
        bulkContainer.id = 'leaveBulkContainer';
        bulkContainer.style.cssText = 'padding:10px 20px; background:#f8fafc; border-bottom:1px solid var(--border); display:none; align-items:center; justify-content:space-between; gap:10px; font-size:.8rem';
        table.parentNode.insertBefore(bulkContainer, table);
    }

    if (count > 0) {
      bulkContainer.style.display = 'flex';
      bulkContainer.innerHTML = `
        <span style="font-weight:600; color:var(--text)">${count} selected</span>
        <div style="display:flex; gap:8px">
            <button onclick="bulkDeleteLeaves()" style="padding:4px 12px; border-radius:6px; border:1px solid #64748b; background:#64748b15; color:#64748b; cursor:pointer; font-family:inherit; font-size:.7rem">Delete</button>
        </div>
      `;
    } else {
      bulkContainer.style.display = 'none';
    }
  }

  async function bulkUpdateLeaveStatus(newStatus) {
    const checkboxes = document.querySelectorAll('.leave-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.getAttribute('data-id'));
    const statusText = newStatus === 'approved' ? 'Approved' : 'Rejected';

    showConfirmModal({
      title: 'Confirm Status Change',
      message: `Are you sure you want to change the status of ${ids.length} selected items to "${statusText}"?`,
      confirmText: 'Confirm',
      type: 'primary',
      onConfirm: () => {
        // Update in DATA
        ids.forEach(id => {
          const req = DATA.leaveRequests.find(r => r.id === id);
          if (req) {
            req.status = newStatus;
            if (newStatus === 'approved') {
              req.approvedBy = 'Admin User';
            }
            // Sync each to Google Sheets
            apiSaveLeave({ ...req, action: 'edit' });
          }
        });

        // Re-calculate stats and refresh
        if (typeof calculateLeaveStats === 'function') calculateLeaveStats();

        const contentEl = document.getElementById('pageContent');
        if (contentEl) {
          contentEl.innerHTML = pageLeaveManagement();
          if (window.lucide) lucide.createIcons({ root: contentEl });
          if (typeof initLeaveCharts === 'function') setTimeout(initLeaveCharts, 100);
        }

        showAlert('Success', `Status changed to ${statusText} for ${ids.length} items`, 'success');
      }
    });
  }

  async function bulkDeleteLeaves() {
    const checkboxes = document.querySelectorAll('.leave-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.getAttribute('data-id'));

    showConfirmModal({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete all ${ids.length} selected items? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        // Remove from DATA
        DATA.leaveRequests = DATA.leaveRequests.filter(r => !ids.includes(r.id));

        // Re-calculate stats and refresh
        if (typeof calculateLeaveStats === 'function') calculateLeaveStats();

        const contentEl = document.getElementById('pageContent');
        if (contentEl) {
          contentEl.innerHTML = pageLeaveManagement();
          if (window.lucide) lucide.createIcons({ root: contentEl });
          if (typeof initLeaveCharts === 'function') setTimeout(initLeaveCharts, 100);
        }
      }
    });
  }

  window.showOrgEmployeeDetails = function(nodeId) {
    const sidebar = document.getElementById('teamStructureSidebar');
    if (!sidebar) return;

    // find node in org structure
    function findNode(node, id) {
      if (node.id === id) return node;
      if (node.children) {
        for (let child of node.children) {
          const found = findNode(child, id);
          if (found) return found;
        }
      }
      return null;
    }

    let structure = null;
    try {
      structure = JSON.parse(localStorage.getItem('org_structure'));
    } catch(e) {}
    
    if (!structure) return;
    
    const node = findNode(structure, nodeId);
    if (!node) return;

    let emp = null;
    if (node.empId) {
      emp = (DATA.employees || []).find(e => e.id === node.empId);
    }

    const name = emp ? emp.name : (node.customName || 'Unassigned');
    const nameEn = emp ? (emp.nameEn || '') : '';
    const pos = node.title || (emp ? emp.pos : 'Unknown Position');
    const dept = node.dept || (emp ? emp.dept : '-');
    const email = emp ? emp.email : '-';
    const phone = emp ? (emp.phone || '-') : '-';
    
    let avatarHtml = '';
    if (emp && emp.avatar && emp.avatar.startsWith('http') && !emp.avatar.includes('ui-avatars.com')) {
        avatarHtml = `<img src="${emp.avatar}" style="width:90px; height:90px; border-radius:50%; border:3px solid var(--primary); box-shadow:0 8px 16px rgba(0,0,0,0.1); object-fit:cover;">`;
    } else {
        const posBg = typeof getPosBgColor === 'function' ? getPosBgColor(pos) : '#93c5fd';
        const posText = typeof getPosTextColor === 'function' ? getPosTextColor(pos) : '#000';
        const nick = (emp && emp.nickname && emp.nickname !== '-') ? emp.nickname : name.split(' ')[0];
        avatarHtml = `<div style="width:90px; height:90px; border-radius:50%; background-color:${posBg}; color:${posText}; display:flex; align-items:center; justify-content:center; font-family:'Kanit', sans-serif; font-weight:600; font-size:32px; border:3px solid #f1f5f9; box-shadow:0 8px 16px rgba(0,0,0,0.1); margin: 0 auto;">${nick.substring(0,4)}</div>`;
    }
    
    // Calculate team size (descendants)
    function countDescendants(n) {
      let count = 0;
      if (n.children) {
        count += n.children.length;
        n.children.forEach(c => count += countDescendants(c));
      }
      return count;
    }
    const teamSize = countDescendants(node);

    // Find reporting to
    let reporting = '-';
    function findParent(current, targetId) {
      if (current.children) {
        if (current.children.some(c => c.id === targetId)) return current;
        for (let child of current.children) {
          const p = findParent(child, targetId);
          if (p) return p;
        }
      }
      return null;
    }
    const parentNode = findParent(structure, nodeId);
    if (parentNode) {
       let parentEmp = parentNode.empId ? (DATA.employees || []).find(e => e.id === parentNode.empId) : null;
       reporting = parentEmp ? parentEmp.name : (parentNode.customName || 'Unassigned');
    }

    // Render premium slide-out sidebar details
    sidebar.innerHTML = `
      <div style="padding: 24px; font-family: 'Kanit', sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <h3 style="margin:0; font-size:1.1rem; font-weight:700; color:var(--text)">Employee Details</h3>
          <button onclick="document.getElementById('teamStructureSidebar').style.display='none'" style="background:none; border:none; color:var(--text-3); font-size:1.2rem; cursor:pointer">&times;</button>
        </div>
        <div style="text-align:center; margin-bottom:24px">
          ${avatarHtml}
          <h4 style="margin:12px 0 4px; font-size:1rem; font-weight:700; color:var(--text)">${name}</h4>
          <div style="font-size:0.75rem; color:var(--text-3); font-weight:500">${nameEn}</div>
          <span style="display:inline-block; margin-top:8px; padding:4px 12px; border-radius:12px; background:var(--primary)15; color:var(--primary); font-size:0.7rem; font-weight:600">${pos}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px; border-top:1px solid var(--border); padding-top:20px">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem"><span style="color:var(--text-3)">Department</span><span style="font-weight:600; color:var(--text-2)">${dept}</span></div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem"><span style="color:var(--text-3)">Reporting to</span><span style="font-weight:600; color:var(--text-2)">${reporting}</span></div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem"><span style="color:var(--text-3)">Team Size</span><span style="font-weight:600; color:var(--primary)">${teamSize} members</span></div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem"><span style="color:var(--text-3)">Email</span><span style="font-weight:600; color:var(--text-2); font-size:0.75rem">${email}</span></div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem"><span style="color:var(--text-3)">Phone</span><span style="font-weight:600; color:var(--text-2)">${phone}</span></div>
        </div>
      </div>
    `;
    sidebar.style.display = 'block';
  };

  // --- Org Tree Logic (Global) ---
  window.orgIsEditMode = false;
  
  window.orgGetDefaultStructure = function() {
     return {
  "id": "ceo",
  "title": "Director",
  "jobTitle": "Director",
  "empId": "RS004",
  "children": [
    {
      "id": "node_1780283866689363",
      "empId": "RS021",
      "title": "Manager",
      "dept": "-",
      "children": [
        {
          "id": "node_1780283973040117",
          "empId": "RS638",
          "title": "Senior",
          "dept": "-",
          "children": [],
          "extraParentIds": []
        },
        {
          "id": "node_1780283921601470",
          "empId": "RS254",
          "title": "Assistant Manager",
          "dept": "-",
          "children": [
            {
              "id": "node_178028398470412",
              "empId": "RS092,RS455",
              "title": "Senior",
              "dept": "-",
              "children": [],
              "extraParentIds": []
            }
          ],
          "extraParentIds": []
        },
        {
          "id": "node_1780284639682348",
          "empId": "RS147",
          "title": "Senior",
          "dept": "-",
          "children": [
            {
              "id": "node_17802849230784",
              "empId": "RS474",
              "title": "Junior",
              "dept": "-",
              "children": []
            },
            {
              "id": "node_1780284934606314",
              "empId": "RS542",
              "title": "Junior",
              "dept": "-",
              "children": []
            }
          ]
        },
        {
          "id": "node_yuro8jw3q",
          "empId": "RS257",
          "title": "Senior",
          "dept": "-",
          "children": [
            {
              "id": "node_1780285550297360",
              "empId": "RS544",
              "title": "Junior",
              "dept": "-",
              "children": []
            },
            {
              "id": "node_1780285563021123",
              "empId": "RS545",
              "title": "Junior",
              "dept": "-",
              "children": []
            }
          ]
        },
        {
          "id": "node_7k68bono5",
          "empId": "RS310",
          "title": "Senior",
          "dept": "-",
          "children": [
            {
              "id": "node_1780285581703437",
              "empId": "RS518",
              "title": "Junior",
              "dept": "-",
              "children": []
            },
            {
              "id": "node_1780285598172874",
              "empId": "RS642",
              "title": "Junior",
              "dept": "-",
              "children": []
            }
          ]
        },
        {
          "id": "node_panqil76i",
          "empId": "RS423",
          "title": "Senior",
          "dept": "-",
          "children": [
            {
              "id": "node_1780285611382138",
              "empId": "RS612",
              "title": "Junior",
              "dept": "-",
              "children": []
            },
            {
              "id": "node_1780285624658549",
              "empId": "RS676",
              "title": "Junior",
              "dept": "-",
              "children": []
            }
          ]
        }
      ],
      "extraParentIds": []
    },
    {
      "id": "node_1780162791689251",
      "empId": "RS028",
      "title": "Manager",
      "dept": "-",
      "children": [
        {
          "id": "node_1780233458214259",
          "empId": "RS122",
          "title": "Assistant Manager",
          "dept": "-",
          "children": [
            {
              "id": "node_1780233552027645",
              "empId": "RS200",
              "title": "Senior",
              "dept": "-",
              "children": [
                {
                  "id": "node_1780236194305768",
                  "empId": "RS191",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": [
                    "node_1780233561418210"
                  ]
                },
                {
                  "id": "node_1780236231492891",
                  "empId": "RS458",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": [
                    "node_1780233561418210"
                  ]
                },
                {
                  "id": "node_1780236242142935",
                  "empId": "RS507",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": [
                    "node_1780233561418210"
                  ]
                },
                {
                  "id": "node_178023625722558",
                  "empId": "RS613",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": [
                    "node_1780233561418210"
                  ]
                }
              ],
              "extraParentIds": []
            },
            {
              "id": "node_1780238405899404",
              "empId": "RS203",
              "title": "Senior",
              "dept": "-",
              "children": [
                {
                  "id": "node_1780236211966665",
                  "empId": "RS447",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236286067427",
                  "empId": "RS664",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236269715402",
                  "empId": "RS658",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                }
              ],
              "extraParentIds": []
            },
            {
              "id": "node_1780233622128745",
              "empId": "RS359",
              "title": "Senior",
              "dept": "-",
              "children": [
                {
                  "id": "node_1780234539314600",
                  "empId": "RS461",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_17802345536617",
                  "empId": "RS467",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780234568555492",
                  "empId": "RS475",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780234628467916",
                  "empId": "RS515",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780234646267692",
                  "empId": "RS519",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780234672139294",
                  "empId": "RS547",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780234682838813",
                  "empId": "RS565",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780234714854739",
                  "empId": "RS648",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780234808885101",
                  "empId": "RS684",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                }
              ],
              "extraParentIds": []
            }
          ],
          "extraParentIds": []
        },
        {
          "id": "node_1780233502706545",
          "empId": "RS192",
          "title": "Senior",
          "dept": "-",
          "children": [],
          "extraParentIds": []
        }
      ],
      "extraParentIds": []
    },
    {
      "id": "node_1780162800799748",
      "empId": "RS000",
      "title": "Assistant Manager",
      "dept": "-",
      "children": [],
      "extraParentIds": []
    },
    {
      "id": "node_1780200720057164",
      "empId": "RS019",
      "title": "Manager",
      "dept": "-",
      "children": [
        {
          "id": "node_1780233470627246",
          "empId": "RS165",
          "title": "Assistant Manager",
          "dept": "-",
          "children": [
            {
              "id": "node_1780235465438755",
              "empId": "RS426",
              "title": "Senior",
              "dept": "-",
              "children": [
                {
                  "id": "node_1780236471024448",
                  "empId": "RS430",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236484107154",
                  "empId": "RS434",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236497293823",
                  "empId": "RS442",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236509707646",
                  "empId": "RS452",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236519799664",
                  "empId": "RS453",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236530658430",
                  "empId": "RS454",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236539623338",
                  "empId": "RS459",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236548989863",
                  "empId": "RS488",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236560760394",
                  "empId": "RS511",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_178023657364515",
                  "empId": "RS530",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236585592751",
                  "empId": "RS538",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236596015179",
                  "empId": "RS539",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236607280679",
                  "empId": "RS543",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236620561484",
                  "empId": "RS549",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236631105670",
                  "empId": "RS554",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236643621448",
                  "empId": "RS555",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                }
              ],
              "extraParentIds": []
            },
            {
              "id": "node_1780235499255726",
              "empId": "RS265",
              "title": "Senior",
              "dept": "-",
              "children": [],
              "extraParentIds": []
            }
          ],
          "extraParentIds": []
        },
        {
          "id": "node_1780233480365993",
          "empId": "RS385",
          "title": "Assistant Manager",
          "dept": "-",
          "children": [
            {
              "id": "node_1780235526445622",
              "empId": "RS253",
              "title": "Senior",
              "dept": "-",
              "children": [
                {
                  "id": "node_1780236032270561",
                  "empId": "RS485",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                },
                {
                  "id": "node_1780236041598700",
                  "empId": "RS486",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                }
              ],
              "extraParentIds": []
            }
          ],
          "extraParentIds": []
        }
      ],
      "extraParentIds": []
    },
    {
      "id": "node_1780200735724957",
      "empId": "RS362",
      "title": "Manager",
      "dept": "-",
      "children": [
        {
          "id": "node_1780200798211998",
          "empId": "RS136",
          "title": "Assistant Manager",
          "dept": "-",
          "children": [
            {
              "id": "node_178020127779052",
              "empId": "RS522",
              "title": "Junior",
              "dept": "-",
              "children": [],
              "extraParentIds": []
            },
            {
              "id": "node_1780201287351689",
              "empId": "RS655",
              "title": "Junior",
              "dept": "-",
              "children": [],
              "extraParentIds": []
            }
          ],
          "extraParentIds": []
        },
        {
          "id": "node_1780201173187894",
          "empId": "RS451",
          "title": "Senior",
          "dept": "-",
          "children": [],
          "extraParentIds": []
        },
        {
          "id": "node_1780200815744228",
          "empId": "RS170",
          "title": "Assistant Manager",
          "dept": "-",
          "children": [
            {
              "id": "node_1780201131267686",
              "empId": "RS094",
              "title": "Senior",
              "dept": "-",
              "children": [],
              "extraParentIds": []
            },
            {
              "id": "node_1780201141706178",
              "empId": "RS105",
              "title": "Senior",
              "dept": "-",
              "children": [],
              "extraParentIds": []
            },
            {
              "id": "node_1780201228124995",
              "empId": "RS532",
              "title": "Senior",
              "dept": "-",
              "children": [],
              "extraParentIds": []
            }
          ],
          "extraParentIds": []
        },
        {
          "id": "node_1780201020654383",
          "empId": "RS229",
          "title": "Assistant Manager",
          "dept": "-",
          "children": [
            {
              "id": "node_1780201238328251",
              "empId": "RS552",
              "title": "Senior",
              "dept": "-",
              "children": [],
              "extraParentIds": []
            }
          ],
          "extraParentIds": []
        },
        {
          "id": "node_1780201046732800",
          "empId": "RS084",
          "title": "Assistant Manager",
          "dept": "-",
          "children": [],
          "extraParentIds": []
        },
        {
          "id": "node_1780201057484440",
          "empId": "RS154",
          "title": "Assistant Manager",
          "dept": "-",
          "children": [
            {
              "id": "node_178020107579933",
              "empId": "RS324",
              "title": "Senior",
              "dept": "-",
              "children": [
                {
                  "id": "node_1780201094883586",
                  "empId": "RS476",
                  "title": "Junior",
                  "dept": "-",
                  "children": [],
                  "extraParentIds": []
                }
              ],
              "extraParentIds": []
            }
          ],
          "extraParentIds": []
        },
        {
          "id": "node_1780201066350884",
          "empId": "RS559",
          "title": "Assistant Manager",
          "dept": "-",
          "children": [],
          "extraParentIds": []
        }
      ],
      "extraParentIds": []
    }
  ]
}
;
  };

  window.orgLoadStructure = function() {
     let struct = null;
     try {
        struct = JSON.parse(localStorage.getItem('org_structure'));
     } catch(e) {}
     if (!struct) {
        struct = window.orgGetDefaultStructure();
        window.orgSaveStructure(struct);
     }
     
     // Remove hardcoded Pattaphong Thonglamai from root node if it exists in LocalStorage
     if (struct && struct.title === 'ภัฏพงษ์ ทองละมัย') {
         struct.title = 'Director';
         window.orgSaveStructure(struct);
     }
     
     return struct;
  };

  window.orgSaveStructure = function(struct) {
     localStorage.setItem('org_structure', JSON.stringify(struct));
  };

  window.orgExportStructure = function() {
     const struct = window.orgLoadStructure();
     const jsonStr = JSON.stringify(struct, null, 2);
     const modal = document.createElement('div');
     modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center;";
     modal.innerHTML = `
        <div style="background:#fff; padding:20px; border-radius:12px; width:600px; max-width:90%;">
           <h3 style="margin-top:0;">Export Structure Code</h3>
           <p style="font-size:0.85rem; color:#64748b;">Copy โค้ดด้านล่างนี้ไปทับในฟังก์ชัน <code>window.orgGetDefaultStructure</code> ในไฟล์ <code>pages.js</code> เพื่อตั้งเป็นโครงสร้างเริ่มต้นบนเว็บ</p>
           <textarea style="width:100%; height:300px; padding:10px; font-family:monospace; font-size:12px; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:16px;">return ${jsonStr};</textarea>
           <div style="text-align:right;">
              <button onclick="this.parentNode.parentNode.parentNode.remove()" style="padding:8px 16px; background:#e2e8f0; border:none; border-radius:8px; cursor:pointer;">Close</button>
           </div>
        </div>
     `;
     document.body.appendChild(modal);
  };

  window.orgAutoPopulate = function() {
     if (confirm("This will reset the current structure and put all employees under the root so you can arrange them manually. Proceed?")) {
        const struct = window.orgGetDefaultStructure();
        window.orgSaveStructure(struct);
        window.orgRenderTree();
     }
  };

  window.orgToggleEditMode = function() {
     window.orgIsEditMode = !window.orgIsEditMode;
     window.orgRenderTree();
  };

  // Move a node left (-1) or right (+1) among its siblings
  window.orgMoveNode = function(nodeId, direction) {
     const struct = window.orgLoadStructure();
     
     function findParent(node, targetId) {
        if (node.children) {
           for (let c of node.children) {
              if (c.id === targetId) return node;
              const found = findParent(c, targetId);
              if (found) return found;
           }
        }
        return null;
     }
     
     const parent = findParent(struct, nodeId);
     if (!parent || !parent.children) return;
     
     const idx = parent.children.findIndex(c => c.id === nodeId);
     if (idx === -1) return;
     
     const newIdx = idx + direction;
     if (newIdx < 0 || newIdx >= parent.children.length) return;
     
     // Swap
     const temp = parent.children[idx];
     parent.children[idx] = parent.children[newIdx];
     parent.children[newIdx] = temp;
     
     window.orgSaveStructure(struct);
     window.orgRenderTree();
  };

  window.orgAddNode = function(parentId) {
     const struct = window.orgLoadStructure();
     
     function addChild(node, pId) {
        if (node.id === pId) {
           if (!node.children) node.children = [];
           node.children.push({
              id: 'node_' + Date.now() + Math.floor(Math.random() * 1000),
              empId: null,
              title: 'New Position',
              dept: node.dept || '-',
              children: []
           });
           return true;
        }
        if (node.children) {
           for (let c of node.children) {
              if (addChild(c, pId)) return true;
           }
        }
        return false;
     }
     
     addChild(struct, parentId);
     window.orgSaveStructure(struct);
     window.orgRenderTree();
  };

  window.orgRemoveNode = function(nodeId) {
     const struct = window.orgLoadStructure();
     if (struct.id === nodeId) {
         alert("Cannot remove the root node.");
         return;
     }
     
     function removeChild(node, nId) {
        if (!node.children) return false;
        const idx = node.children.findIndex(c => c.id === nId);
        if (idx > -1) {
           node.children.splice(idx, 1);
           return true;
        }
        for (let c of node.children) {
           if (removeChild(c, nId)) return true;
        }
        return false;
     }
     
     removeChild(struct, nodeId);
     window.orgSaveStructure(struct);
     window.orgRenderTree();
  };

   window.orgEditNode = function(nodeId) {
     try {
         window.currentEditNodeId = nodeId;
         const struct = window.orgLoadStructure();
         
         function findNode(node, id) {
            if (node.id === id) return node;
            if (node.children) {
               for (let c of node.children) {
                  const f = findNode(c, id);
                  if (f) return f;
               }
            }
            return null;
         }
         
         const node = findNode(struct, nodeId);
         if (!node) {
             alert('Node not found: ' + nodeId);
             return;
         }
         
         // Populate Title dropdown dynamically from DATA.employees
         const titleSelect = document.getElementById('orgEditTitle');
         if (titleSelect && typeof DATA !== 'undefined' && DATA.employees) {
             const posOrder = ['director', 'manager', 'assistant manager', 'senior', 'junior'];
             const uniquePositions = [...new Set(DATA.employees.map(e => (e.pos || '').trim()).filter(Boolean))].sort((a, b) => {
                 const ai = posOrder.findIndex(o => a.toLowerCase().includes(o));
                 const bi = posOrder.findIndex(o => b.toLowerCase().includes(o));
                 if (ai !== -1 && bi !== -1) return ai - bi;
                 if (ai !== -1) return -1;
                 if (bi !== -1) return 1;
                 return a.localeCompare(b);
             });
             let titleOptions = '<option value="">-- กรุณาเลือกตำแหน่ง... --</option>';
             uniquePositions.forEach(p => {
                 titleOptions += `<option value="${p}" ${node.title === p ? 'selected' : ''}>${p}</option>`;
             });
             if (node.title && node.title !== 'New Position' && !uniquePositions.includes(node.title)) {
                 titleOptions += `<option value="${node.title}" selected>${node.title}</option>`;
             }
             titleSelect.innerHTML = titleOptions;
         } else if (titleSelect) {
             titleSelect.value = node.title || '';
         }
         // Department input removed
         
         window._currentEditEmpId = node.empId;
         
         window.orgRenderEmpOptions = function(query = '') {
             const empSelect = document.getElementById('orgEditEmp');
             if (!empSelect) return;
             let empOptions = '<option value="">-- เลือกพนักงาน (Unassigned) --</option>';
             if (typeof DATA !== 'undefined' && DATA.employees) {
                 const q = query.toLowerCase().trim();
                 const emps = DATA.employees.filter(e => {
                     if (window._currentEditEmpId && window._currentEditEmpId.split(',').includes(e.id)) return true;
                     if (!q) return true;
                     return (e.id && e.id.toLowerCase().includes(q)) || 
                            (e.name && e.name.toLowerCase().includes(q)) || 
                            (e.nameEn && e.nameEn.toLowerCase().includes(q));
                 });
                 emps.forEach(e => {
                     const name = e.name + (e.nameEn ? ' (' + e.nameEn + ')' : '');
                     const isSelected = (window._currentEditEmpId && window._currentEditEmpId.split(',').includes(e.id)) ? 'selected' : '';
                     empOptions += `<option value="${e.id}" ${isSelected}>${e.id} - ${name}</option>`;
                 });
             }
             empSelect.innerHTML = empOptions;
         };
         
         const empSearchInput = document.getElementById('orgEditEmpSearch');
         if (empSearchInput) empSearchInput.value = '';
         window.orgRenderEmpOptions();
         
         const empSelect = document.getElementById('orgEditEmp');
         if (empSelect) {
             empSelect.onchange = function() {
                 window._currentEditEmpId = Array.from(this.selectedOptions).map(o => o.value).join(',');
             };
         }
         
         // Populate parent dropdown
         const parentSelect = document.getElementById('orgEditParent');
         if (parentSelect) {
             let currentParentIds = [];
             let allNodes = [];
             
             function traverseAndFindParent(n, parentId) {
                 allNodes.push(n);
                 if (n.id === nodeId && parentId) {
                     currentParentIds.push(parentId);
                 }
                 if (n.children) {
                     for (let c of n.children) {
                         traverseAndFindParent(c, n.id);
                     }
                 }
             }
             traverseAndFindParent(struct, null);

             if (currentParentIds.length === 0 && struct.id === nodeId) {
                 parentSelect.innerHTML = '<option value="">-- This is the Root Node --</option>';
                 parentSelect.disabled = true;
             } else {
                 let parentOptions = '';
                 
                 // Prevent circular reference
                 function isDescendant(n, targetId) {
                     if (!n.children) return false;
                     for (let c of n.children) {
                         if (c.id === targetId || isDescendant(c, targetId)) return true;
                     }
                     return false;
                 }
                 
                 allNodes.forEach(n => {
                     if (n.id !== nodeId && !isDescendant(node, n.id)) {
                         let empName = n.title;
                         if (n.empId && typeof DATA !== 'undefined' && DATA.employees) {
                             const ids = n.empId.split(',');
                             const emps = ids.map(id => DATA.employees.find(x => x.id === id)).filter(Boolean);
                             if (emps.length > 0) empName = emps.map(e => e.name).join(' & ');
                         }
                         parentOptions += `<option value="${n.id}" ${currentParentIds.includes(n.id) ? 'selected' : ''}>${empName} (${n.dept || n.title})</option>`;
                     }
                 });
                 parentSelect.innerHTML = parentOptions;
                 parentSelect.disabled = false;
             }
         }
         
         document.getElementById('orgEditModal').style.display = 'flex';
     } catch (err) {
         alert('Error opening edit modal: ' + err.message);
     }
  };

  window.orgSaveEdit = function() {
     const title = document.getElementById('orgEditTitle').value;
     // Department input removed
     const empId = window._currentEditEmpId || '';
     const parentSelect = document.getElementById('orgEditParent');
     const newParentIds = parentSelect && !parentSelect.disabled ? Array.from(parentSelect.selectedOptions).map(o => o.value) : [];
     
     const struct = window.orgLoadStructure();
     
     // Variables for move logic
     let nodeToMove = null;
     
     function updateNode(node, id) {
        let updated = false;
        if (node.id === id) {
           node.title = title;
           node.empId = empId || null;
           nodeToMove = JSON.parse(JSON.stringify(node));
           updated = true;
        }
        if (node.children) {
           for (let c of node.children) {
              if (updateNode(c, id)) updated = true;
           }
        }
        return updated;
     }
     
     if (window.currentEditNodeId) {
         updateNode(struct, window.currentEditNodeId);
         
         // Handle moving node to new parent(s)
         if (nodeToMove && newParentIds.length > 0) {
             let currentParentId = null;
             function findCurrentParent(n) {
                 if (!n.children) return;
                 if (n.children.some(c => c.id === nodeToMove.id)) currentParentId = n.id;
                 for (let c of n.children) findCurrentParent(c);
             }
             findCurrentParent(struct);
             if (currentParentId !== newParentIds[0]) {
             // 1. Remove from all existing parents
             function removeFromAllParents(n) {
                 if (!n.children) return;
                 n.children = n.children.filter(c => c.id !== nodeToMove.id);
                 for (let c of n.children) {
                     removeFromAllParents(c);
                 }
             }
             removeFromAllParents(struct);
             
             // 2. Add to all new parents (first is primary, rest are extra)
             const nodeCopy = JSON.parse(JSON.stringify(nodeToMove));
             nodeCopy.extraParentIds = newParentIds.slice(1);
             let primaryAdded = false;
             
             function findAndAppend(n) {
                 if (!primaryAdded && newParentIds[0] === n.id) {
                     if (!n.children) n.children = [];
                     n.children.push(nodeCopy);
                     primaryAdded = true;
                 }
                 if (n.children) {
                     for (let c of n.children) {
                         findAndAppend(c);
                     }
                 }
             }
             findAndAppend(struct);
             }
             // Cleanup extraParentIds that are no longer valid (deleted nodes)
             // But here we just set them. We can let drawExtraLines handle missing nodes gracefully.
         }
         
         window.orgSaveStructure(struct);
         window.orgRenderTree();
     }
     document.getElementById('orgEditModal').style.display = 'none';
  };
  
  window.orgCloseModal = function() {
     document.getElementById('orgEditModal').style.display = 'none';
  };

  window.orgRenderTree = function() {
     const container = document.getElementById('orgTreeContainer');
     if (!container) return;
     const struct = window.orgLoadStructure();
     
     function countPeople(node) {
         let count = node.empId ? 1 : 0;
         if (node.children) {
             node.children.forEach(c => {
                 count += countPeople(c);
             });
         }
         return count;
     }

     function renderNode(node, level = 0, isVerticalStack = false, branchIndex = 0) {
         let emps = [];
         if (node.empId && typeof DATA !== 'undefined' && DATA.employees) {
             const ids = node.empId.split(',');
             emps = ids.map(id => DATA.employees.find(e => e.id === id)).filter(Boolean);
         }
         let emp = emps.length > 0 ? emps[0] : null;
         
         const name = emp ? emp.name : (node.customName || 'Unassigned');
         const pos = node.title || (emp ? emp.pos : '-');
         const dept = node.dept || (emp ? emp.dept : '-');
         const totalPeople = countPeople(node);
         
         const branchColors = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#ef4444'];
         const bColor = level === 0 ? '#3b82f6' : branchColors[branchIndex % branchColors.length];
         
         let editControls = '';
         if (window.orgIsEditMode) {
             editControls = `
               <div style="position:absolute; top:-12px; right:-12px; display:flex; gap:4px; z-index:10;">
                  <button onclick="event.stopPropagation(); window.orgEditNode('${node.id}')" style="background:#3b82f6; color:#fff; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm)" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  ${level > 0 ? `
                  <button onclick="event.stopPropagation(); window.orgRemoveNode('${node.id}')" style="background:#ef4444; color:#fff; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm)" title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>` : ''}
               </div>
               ${level > 0 ? `
               <button onclick="event.stopPropagation(); window.orgMoveNode('${node.id}', -1)" style="position:absolute; left:-16px; top:50%; transform:translateY(-50%); background:#f59e0b; color:#fff; border:none; width:26px; height:26px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); z-index:10; transition:all 0.15s;" title="Move Left" onmouseover="this.style.background='#d97706';this.style.transform='translateY(-50%) scale(1.15)'" onmouseout="this.style.background='#f59e0b';this.style.transform='translateY(-50%) scale(1)'">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
               </button>
               <button onclick="event.stopPropagation(); window.orgMoveNode('${node.id}', 1)" style="position:absolute; right:-16px; top:50%; transform:translateY(-50%); background:#f59e0b; color:#fff; border:none; width:26px; height:26px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); z-index:10; transition:all 0.15s;" title="Move Right" onmouseover="this.style.background='#d97706';this.style.transform='translateY(-50%) scale(1.15)'" onmouseout="this.style.background='#f59e0b';this.style.transform='translateY(-50%) scale(1)'">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
               </button>` : ''}
               <button onclick="event.stopPropagation(); window.orgAddNode('${node.id}')" style="position:absolute; bottom:-14px; left:50%; transform:translateX(-50%); background:#10b981; color:#fff; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); z-index:10;" title="Add Subordinate">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
               </button>
             `;
         }


         let cardHtml = '';
         
         const isDepartment = (level >= 2) && (emp == null && emps.length === 0) && (/ฝ่าย|แผนก|ส่วน|ศูนย์|กลุ่ม|ทีม|สาขา|แผน|งาน|dept|department|division|section|team|group/i.test(pos));
         const isProfileCard = !isDepartment;

         if (isProfileCard) { 
             let cardsHtml = '';
             const peopleToRender = emps.length > 0 ? emps : [null]; // fallback for customName nodes

             peopleToRender.forEach((p, idx) => {
                 let avatarHtml = '';
                 const size = 50;
                 const pName = p ? p.name : (node.customName || 'Unassigned');
                 const pPos = (node.title && node.title !== 'New Position') ? node.title : (p ? p.pos : pos);

                 if (p && p.avatar && p.avatar.startsWith('http') && !p.avatar.includes('ui-avatars.com')) {
                     avatarHtml = `<img src="${p.avatar}" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; border:2px solid #f1f5f9;">`;
                 } else {
                     const posBg = typeof getPosBgColor === 'function' ? getPosBgColor(pPos) : '#93c5fd';
                     const posText = typeof getPosTextColor === 'function' ? getPosTextColor(pPos) : '#000';
                     const nick = (p && p.nickname && p.nickname !== '-') ? p.nickname : pName.split(' ')[0];
                     avatarHtml = `<div style="width:${size}px; height:${size}px; border-radius:50%; background-color:${posBg}; color:${posText}; display:flex; align-items:center; justify-content:center; font-family:'Kanit', sans-serif; font-weight:600; font-size:15px; line-height:1.2; border:2px solid #f1f5f9; box-shadow:0 2px 4px rgba(0,0,0,0.05); padding:0 4px; box-sizing:border-box; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${nick}</div>`;
                 }
                 
                 cardsHtml += `
                   <div class="card org-card" onclick="if(!window.orgIsEditMode) window.showOrgEmployeeDetails('${node.id}')" style="width:240px; padding:16px; border-radius:12px; border:1px solid ${bColor}; position:relative; background:#fff; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); transition:all 0.3s; cursor:${window.orgIsEditMode ? 'default' : 'pointer'};" onmouseover="this.style.transform='${window.orgIsEditMode?'none':'translateY(-2px)'}'" onmouseout="this.style.transform='none'">
                      ${peopleToRender.length === 1 ? editControls : ''}
                      <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                         ${avatarHtml}
                         <div style="text-align:left; flex:1; min-width:0;">
                            <div style="font-weight:700; font-size:0.9rem; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${pName}">${pName}</div>
                            <div style="font-size:0.75rem; color:#64748b; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${pPos}">${pPos}</div>
                         </div>
                      </div>
                      <div style="border-top:1px dashed #e2e8f0; padding-top:8px; font-size:0.75rem; color:#64748b; display:flex; align-items:center; justify-content:center; gap:6px;">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                          ${totalPeople} คน
                      </div>
                   </div>
                 `;
             });
             
             if (peopleToRender.length > 1) {
                 // Add horizontal connecting lines for multiple managers
                 const verticalLinesHtml = peopleToRender.map(() => 
                    `<div style="width:240px; display:flex; justify-content:center;"><div style="width:2px; height:20px; background:var(--border);"></div></div>`
                 ).join('');
                 
                 cardHtml = `
                   <div style="display:flex; flex-direction:column; align-items:center; width:max-content; margin:0 auto; position:relative; z-index:5;">
                      <!-- Absolute vertical line to guarantee connection to parent! -->
                      <div style="position:absolute; top:-20px; left:50%; width:2px; height:20px; background:var(--border); transform:translateX(-50%); z-index:10;"></div>
                      
                      <!-- Robust horizontal line in document flow -->
                      <div style="width:calc(100% - 240px); height:2px; min-height:2px; background:var(--border); flex-shrink:0;"></div>
                      
                      <!-- Vertical lines dropping to cards -->
                      <div style="display:flex; justify-content:center; gap:20px; width:100%; flex-shrink:0; min-height:20px;">
                         ${peopleToRender.map(() => 
                            `<div style="width:240px; display:flex; justify-content:center; flex-shrink:0;"><div style="width:2px; height:20px; min-height:20px; background:var(--border); flex-shrink:0;"></div></div>`
                         ).join('')}
                      </div>
                      
                      <!-- The cards row -->
                      <div style="display:flex; justify-content:center; gap:20px; position:relative; flex-shrink:0;">
                         ${editControls}
                         ${cardsHtml}
                      </div>
                      
                      <!-- Bottom connection block to children -->
                      ${node.children && node.children.length > 0 ? `
                      <div style="display:flex; flex-direction:column; align-items:center; width:100%; flex-shrink:0; margin-top:0;">
                         <div id="orgScrollWrapper" style="overflow: auto; min-height: 600px; padding-bottom: 60px; background-color: #f8fafc; background-image: radial-gradient(rgba(148, 163, 184, 0.25) 1.5px, transparent 1.5px); background-size: 24px 24px;">
                            <div id="orgTreeContainer" style="display:inline-block; min-width: 100%; text-align:center; padding-top: 30px; animation: orgFadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0;">
                               <!-- Tree renders here -->
                            </div>
                         </div>
                         <!-- Vertical lines dropping from cards -->
                         <div style="display:flex; justify-content:center; gap:20px; width:100%; flex-shrink:0; min-height:20px;">
                            ${peopleToRender.map(() => 
                               `<div style="width:240px; display:flex; justify-content:center; flex-shrink:0;"><div style="width:2px; height:20px; min-height:20px; background:var(--border); flex-shrink:0;"></div></div>`
                            ).join('')}
                         </div>
                         <!-- Horizontal line gathering them -->
                         <div style="width:calc(100% - 240px); height:2px; min-height:2px; background:var(--border); flex-shrink:0;"></div>
                      </div>
                      ` : ''}
                   </div>
                 `;
             } else {
                 cardHtml = `<div style="position:relative; z-index:5;">${cardsHtml}</div>`;
             }

         } else { 
             const bgAlpha = bColor + '15'; 
             const isSubDept = level > 2;
             const w = isSubDept ? 200 : 220;
             const p = isSubDept ? '10px 12px' : '12px 16px';
             cardHtml = `
               <div class="card org-card" onclick="if(!window.orgIsEditMode) window.showOrgEmployeeDetails('${node.id}')" style="width:${w}px; padding:${p}; border-radius:12px; border:1px solid ${bColor}40; position:relative; z-index:5; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.02); display:flex; flex-direction:column; align-items:flex-start; transition:all 0.3s; cursor:${window.orgIsEditMode ? 'default' : 'pointer'};" onmouseover="this.style.transform='${window.orgIsEditMode?'none':'translateY(-2px)'}'" onmouseout="this.style.transform='none'">
                  ${editControls}
                  <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px; width:100%;">
                      <div style="width:28px; height:28px; border-radius:8px; background:${bgAlpha}; color:${bColor}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                          ${isSubDept 
                            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>` 
                            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
                          }
                      </div>
                      <div style="font-weight:700; font-size:${isSubDept ? '0.8rem' : '0.85rem'}; color:#1e293b; text-align:left; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${node.title || 'Department'}">${node.title || 'Department'}</div>
                  </div>
                  <div style="font-size:0.75rem; color:#64748b; padding-left:38px; display:flex; align-items:center; gap:6px;">
                      ${totalPeople} คน
                  </div>
               </div>
             `;
         }

         let html = `
           <li class="${isVerticalStack ? 'org-vertical-li' : 'org-horizontal-li'} ${level === 0 ? 'org-root-li' : ''}" style="position:relative; ${isVerticalStack ? '' : 'flex:0 0 auto;'} text-align:center; transition:all 0.5s;">
              <div id="node-${node.id}" class="org-node-container" style="position:relative; display:inline-block; width:100%;">
                 <div style="display:flex; justify-content:center;">
                    ${cardHtml}
                 </div>
              </div>
         `;
         
         if (node.children && node.children.length > 0) {
             const willBeVertical = false; 
             html += `<ul class="${willBeVertical ? 'org-vertical-ul' : 'org-horizontal-ul'}" style="position:relative; padding-top:20px; display:flex; ${willBeVertical ? 'flex-direction:column; align-items:center;' : 'justify-content:center;'} margin:0; padding-left:0; list-style:none;">`;
             
             if (willBeVertical) {
                 html += `<div class="org-vertical-line" style="position:absolute; top:0; bottom:0; left:50%; width:2px; background:var(--border); transform:translateX(-50%); z-index:0;"></div>`;
             }
             
             node.children.forEach((c, idx) => {
                 const childBranchIndex = level === 0 ? idx : branchIndex;
                 html += renderNode(c, level + 1, willBeVertical, childBranchIndex);
             });
             html += `</ul>`;
         }
         html += `</li>`;
         return html;
     }
     
     container.innerHTML = `<div class="org-tree-wrapper" style="display:inline-block; transform-origin:top center; transition:all 0.2s; position:relative;"><svg id="org-extra-lines" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0;"></svg><ul style="position:relative; display:table; margin:0 auto; padding-left:0; list-style:none; z-index:1;">${renderNode(struct, 0, false, 0)}</ul></div>`;
     
     // Update Edit Mode Button text
     const btnToggle = document.getElementById('btnToggleOrgEdit');
     if (btnToggle) {
         if (window.orgIsEditMode) {
             btnToggle.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M18 6L6 18M6 6l12 12"></path></svg> Exit Edit Mode';
             btnToggle.style.background = '#fef2f2';
             btnToggle.style.color = '#ef4444';
             btnToggle.style.border = 'none';
         } else {
             btnToggle.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg> Edit Structure';
             btnToggle.style.background = 'transparent';
             btnToggle.style.color = 'var(--primary)';
             btnToggle.style.border = 'none';
         }
     }

     // Draw extra lines for multiple parents
     setTimeout(() => {
         const svg = document.getElementById('org-extra-lines');
         const wrapper = document.querySelector('.org-tree-wrapper');
         if (!svg || !wrapper) return;
         
         svg.innerHTML = '';
         
         const wrapperRect = wrapper.getBoundingClientRect();
         
         function findNodesWithExtraParents(n, list) {
             if (n.extraParentIds && n.extraParentIds.length > 0) {
                 list.push(n);
             }
             if (n.children) {
                 for (let c of n.children) {
                     findNodesWithExtraParents(c, list);
                 }
             }
         }
         
         const extraList = [];
         findNodesWithExtraParents(struct, extraList);
         
         extraList.forEach(child => {
             const childEl = document.getElementById('node-' + child.id);
             if (!childEl) return;
             const childRect = childEl.getBoundingClientRect();
             const zoom = window.orgCurrentZoom || 1;
             const childX = (childRect.left + childRect.width / 2 - wrapperRect.left) / zoom;
             const childY = (childRect.top - wrapperRect.top) / zoom; // top center of child card
             
             child.extraParentIds.forEach(parentId => {
                 const parentEl = document.getElementById('node-' + parentId);
                 if (!parentEl) return;
                 const parentRect = parentEl.getBoundingClientRect();
                 const parentX = (parentRect.left + parentRect.width / 2 - wrapperRect.left) / zoom;
                 const parentY = (parentRect.bottom - wrapperRect.top) / zoom; // bottom center of parent card
                 
                 // draw path using orthogonal lines to match regular tree
                 const midY = (parentY + childY) / 2;
                 const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                 path.setAttribute('d', `M ${parentX} ${parentY} L ${parentX} ${midY} L ${childX} ${midY} L ${childX} ${childY}`);
                 path.setAttribute('fill', 'none');
                 path.setAttribute('stroke', '#cbd5e1'); // solid border color
                 path.setAttribute('stroke-width', '2');
                 svg.appendChild(path);
             });
         });
     }, 100);
  };

  window.pageStructureTeam = function() {
    window.currentPage = 'structure-team';
    
    // CSS to attach directly
    const styleId = 'org-tree-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          .org-tree-wrapper ul {
            position: relative;
          }
          /* Horizontal Tree Styles */
          .org-horizontal-li {
            position: relative;
            padding: 20px 10px 0 10px;
          }
          .org-horizontal-li::before {
            content: '';
            position: absolute;
            top: 0;
            right: calc(50% + 1px);
            border-top: 2px solid var(--border);
            width: calc(50% - 1px);
            height: 20px;
          }
          .org-horizontal-li::after {
            content: '';
            position: absolute;
            top: 0;
            left: calc(50% - 1px);
            border-top: 2px solid var(--border);
            border-left: 2px solid var(--border);
            width: calc(50% + 1px);
            height: 20px;
          }
          .org-horizontal-li:only-child::after { display: none; } .org-horizontal-li:only-child::before { content: ''; position: absolute; top: 0; left: 50%; width: 2px; height: 20px; background: var(--border); transform: translateX(-50%); border: none; display: block; }
          .org-root-li::before, .org-root-li::after { display: none !important; } .org-horizontal-li:first-child::before, .org-horizontal-li:last-child::after {
            border: 0 none;
          }
          .org-horizontal-li:last-child::before {
            border-right: 2px solid var(--border);
            border-radius: 0 5px 0 0;
          }
          .org-horizontal-li:first-child::after {
            border-radius: 5px 0 0 0;
          }
          .org-horizontal-ul::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            border-left: 2px solid var(--border);
            width: 0;
            height: 20px;
            transform: translateX(-50%);
          }
          /* Vertical Tree Styles */
          .org-vertical-li {
            position: relative;
            padding: 20px 0 0 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .org-vertical-ul {
             position: relative;
             width: 100%;
          }
          /* Edit Modal Overlay */
          .org-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 2000;
            display: none;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
          }
          .org-modal-content {
            background: #fff;
            padding: 24px;
            border-radius: 16px;
            width: 400px;
            max-width: 90%;
            box-shadow: var(--shadow-lg);
          }
          .org-modal-title {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 16px;
            color: var(--text);
          }
          .org-input-group {
            margin-bottom: 16px;
            text-align: left;
          }
          .org-input-group label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--text-2);
            margin-bottom: 6px;
          }
          .org-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            font-family: 'Kanit', sans-serif;
            font-size: 0.9rem;
            outline: none;
            box-sizing: border-box;
          }
          .org-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary)15;
          }
          .org-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
          }
        `;
        document.head.appendChild(style);
    }
    
    if (typeof window.orgCurrentZoom === 'undefined') {
        window.orgCurrentZoom = 1;
        window.orgApplyZoom = function() {
            const wrapper = document.querySelector('.org-tree-wrapper');
            const label = document.getElementById('orgZoomLabel');
            if (wrapper) {
                // native zoom
                wrapper.style.zoom = window.orgCurrentZoom;
                // fallback for some firefox versions
                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && !CSS.supports("zoom", "1")) {
                    wrapper.style.transform = `scale(${window.orgCurrentZoom})`;
                }
            }
            if (label) {
                label.innerText = Math.round(window.orgCurrentZoom * 100) + '%';
            }
        };
        window.orgZoomIn = function() {
            window.orgCurrentZoom = Math.min(window.orgCurrentZoom + 0.1, 2);
            window.orgApplyZoom();
        };
        window.orgZoomOut = function() {
            window.orgCurrentZoom = Math.max(window.orgCurrentZoom - 0.1, 0.3);
            window.orgApplyZoom();
        };
        window.orgZoomReset = function() {
            window.orgCurrentZoom = 1;
            window.orgApplyZoom();
        };
        window.orgZoomFit = function() {
            const wrapper = document.querySelector('.org-tree-wrapper');
            const scrollWrap = document.getElementById('orgScrollWrapper');
            if (wrapper && scrollWrap) {
                window.orgCurrentZoom = 1;
                window.orgApplyZoom();
                setTimeout(() => {
                    const wWidth = wrapper.offsetWidth;
                    const sWidth = scrollWrap.clientWidth;
                    if (wWidth > 0 && sWidth > 0) {
                        const scale = (sWidth - 40) / wWidth;
                        window.orgCurrentZoom = Math.max(0.2, Math.min(scale, 1));
                        window.orgApplyZoom();
                    }
                }, 10);
            }
        };
        
        const originalRender = window.orgRenderTree;
        if (originalRender && !originalRender.isZoomWrapped) {
            window.orgRenderTree = function() {
                const scrollWrap = document.getElementById('orgScrollWrapper');
                let scrollX = scrollWrap ? scrollWrap.scrollLeft : 0;
                let scrollY = scrollWrap ? scrollWrap.scrollTop : 0;
                originalRender();
                window.orgApplyZoom();

                  // Center the scroll area on the director (root node)
                  setTimeout(() => {
                      const scrollWrap = document.getElementById('orgScrollWrapper');
                      if (scrollWrap) {
                          if (!window._orgInitialZoomDone) { window.orgZoomFit(); window._orgInitialZoomDone = true; scrollWrap.scrollTop = 0; } else { scrollWrap.scrollLeft = scrollX; scrollWrap.scrollTop = scrollY; }
                      }
                  }, 50);

            };
            window.orgRenderTree.isZoomWrapped = true;
        }
    }

    setTimeout(() => {
        if (window.currentPage === 'structure-team' && window.orgRenderTree) window.orgRenderTree();
    }, 100);
    
    return `
      <div class="fade-in" style="padding:20px; font-family: 'Kanit', sans-serif;">
        <div style="margin-bottom:20px">
          <h2 style="margin:0; font-size:1.4rem; font-weight:700; color:var(--text)">Organization Structure</h2>
          <p style="margin:4px 0 0; font-size:0.8rem; color:var(--text-3)">Department Hierarchy</p>
        </div>
        
        <div style="position:relative; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
            <!-- Toolbar Controls (Edit & Zoom Combined) - above scroll area -->
            <div style="position:sticky; top:0; z-index:50; background:#f8fafc; padding:12px 16px; display:flex; justify-content:flex-end; border-bottom:1px solid #e2e8f0;">
               <div style="display:flex; align-items:center; background:#fff; padding:4px; border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
               
               <div style="width:1px; height:20px; background:#e2e8f0; margin:0 4px;"></div>
               
               <button id="btnToggleOrgEdit" onclick="window.orgToggleEditMode()" style="background:transparent; color:var(--primary); border:none; font-weight:600; padding:6px 12px; border-radius:8px; display:flex; align-items:center; font-size:0.8rem; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background=window.orgIsEditMode?'#fee2e2':'#f1f5f9'" onmouseout="this.style.background=window.orgIsEditMode?'#fef2f2':'transparent'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  Edit Structure
               </button>
               
               <div style="width:1px; height:20px; background:#e2e8f0; margin:0 4px;"></div>
               
               <div style="display:inline-flex; gap:2px; align-items:center;">
                   <button onclick="window.orgZoomIn()" style="width:32px; height:32px; background:transparent; color:var(--primary); border:none; border-radius:8px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Zoom In">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                   </button>
                   <button onclick="window.orgZoomOut()" style="width:32px; height:32px; background:transparent; color:#64748b; border:none; border-radius:8px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Zoom Out">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                   </button>
                   <div style="width:1px; height:18px; background:#e2e8f0; margin:0 4px;"></div>
                   <button onclick="window.orgZoomReset()" style="height:32px; padding:0 8px; background:transparent; color:#475569; border:none; border-radius:8px; font-weight:600; font-size:0.8rem; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Reset Zoom">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                      <span id="orgZoomLabel">100%</span>
                   </button>
                   <div style="width:1px; height:18px; background:#e2e8f0; margin:0 4px;"></div>
                   <button onclick="window.orgZoomFit()" style="height:32px; padding:0 8px; background:transparent; color:var(--primary); border:none; border-radius:8px; font-weight:600; font-size:0.8rem; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Fit to Screen">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                      แสดงทั้งหมด
                   </button>
               </div>
               </div>
            </div>

            <div id="orgScrollWrapper" style="overflow: auto; min-height: 600px; padding-bottom: 60px;">
               <div id="orgTreeContainer" style="display:inline-block; min-width: 100%; text-align:center; padding-top: 30px;">
                  <!-- Tree renders here -->
               </div>
            </div>
        </div>
        
        <!-- Sidebar Container Element -->
        <div id="teamStructureSidebar" style="display:none; position:fixed; top:70px; right:0; width:340px; height:calc(100vh - 70px); background:#fff; border-left:1px solid var(--border); box-shadow:var(--shadow-lg); z-index:1000; overflow-y:auto; animation:slideIn 0.3s ease-out"></div>
        
        <!-- Edit Modal Overlay -->
        <div class="org-modal-overlay" id="orgEditModal">
           <div class="org-modal-content">
              <div class="org-modal-title">แก้ไขตำแหน่ง</div>
              
              <div class="org-input-group">
                 <label>ชื่อตำแหน่ง</label>
                 <select id="orgEditTitle" class="org-input"></select>
              </div>
              
              <!-- Department input removed -->
              
              <div class="org-input-group">
                 <label>มอบหมายพนักงาน <small style="color:#94a3b8; font-weight:normal;">(กดปุ่ม Ctrl หรือ Cmd ค้างไว้ เพื่อเลือกหลายคน หรือกรณี Co-Heads)</small></label>
                 <div style="position:relative; margin-bottom:8px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="position:absolute; left:10px; top:50%; transform:translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="orgEditEmpSearch" placeholder="ค้นหาชื่อพนักงานที่ต้องการมอบหมาย..." class="org-input" style="padding-left:32px; font-size:0.85rem; background:#f8fafc;" onkeyup="window.orgRenderEmpOptions(this.value)">
                 </div>
                 <select id="orgEditEmp" class="org-input" multiple style="height:100px;">
                    <!-- Options populated by JS -->
                 </select>
              </div>
              
              <div class="org-input-group">
                 <label>รายงานตรงต่อ (หัวหน้า)</label>
                 <select id="orgEditParent" class="org-input">
                    <!-- Options populated by JS -->
                 </select>
              </div>
              
              <div class="org-modal-actions">
                 <button onclick="window.orgCloseModal()" style="padding:8px 16px; background:#f1f5f9; color:#475569; border:none; border-radius:8px; cursor:pointer; font-weight:600;">ยกเลิก</button>
                 <button onclick="window.orgSaveEdit()" style="padding:8px 16px; background:var(--primary); color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:600; box-shadow:var(--shadow-sm);">บันทึกข้อมูล</button>
              </div>
           </div>
        </div>
      </div>
    `;
  }

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
      <div class="search-box" style="width: 200px; background: #fff; height: 34px; display: flex; align-items: center; position: relative; border: 1px solid var(--border); border-radius: 8px; overflow: hidden">
        <i data-lucide="search" style="width: 14px; height: 14px; position: absolute; left: 12px; color: var(--text-3)"></i>
        <input type="text" id="holidaySearch" placeholder="Search..." style="padding: 0 12px 0 32px; height: 100%; width: 100%; border: none; outline: none; background: transparent; font-size: 0.8rem" onkeyup="filterTable('holidayTable', 'holidaySearch')">
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
              <td rowspan="${tasks.length}" style="padding: 16px 24px; font-size: .85rem; color: #1e293b; font-weight: 500; border-bottom: 1px solid var(--border); vertical-align: top; position: sticky; top: 50px; background: #fff; z-index: 2; transition: background 0.2s;">${h.date}</td>
              <td rowspan="${tasks.length}" style="padding: 16px 24px; font-size: .85rem; color: #4f46e5; font-weight: 600; width: 200px; max-width: 200px; white-space: normal; line-height: 1.5; border-bottom: 1px solid var(--border); vertical-align: top; position: sticky; top: 50px; background: #fff; z-index: 2; transition: background 0.2s;">${h.name}</td>
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
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 16px; margin-bottom: 8px; box-shadow: 0 4px 10px -2px rgba(0,0,0,0.03); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px -4px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 10px -2px rgba(0,0,0,0.03)'">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 10px; margin-bottom: 12px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:28px; height:28px; border-radius:8px; background: linear-gradient(135deg, #4f46e5, #818cf8); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem; font-family:'Inter', sans-serif; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
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
            const emp = (DATA.employees || []).find(e => e.name === t.person || e.nameEn === t.person || e.nickname === t.person);
            const teamName = emp ? emp.dept : '';
            const tCol = typeof getTeamColor === 'function' ? getTeamColor(teamName) : '#64748b';
            const posBg = typeof getPosBgColor === 'function' ? getPosBgColor(emp ? emp.pos : '') : '#f1f5f9';
            const posText = typeof getPosTextColor === 'function' ? getPosTextColor(emp ? emp.pos : '') : '#475569';
            
            const line1 = window.getEmployeeDisplayName(emp || t.person);

            const avatarText = (emp && emp.nickname && emp.nickname !== '-') ? emp.nickname : t.person.trim().split(/\s+/)[0];
            const holidayAvatarFontSize = avatarText.length > 5 ? '0.5rem' : (avatarText.length === 5 ? '0.58rem' : (avatarText.length === 4 ? '0.68rem' : '0.78rem'));

            employeeHtml = `
              <div style="display: flex; align-items: center; gap: 12px">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: ${tCol}; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: ${holidayAvatarFontSize}; box-shadow: 0 4px 10px rgba(0,0,0,0.1); flex-shrink: 0; text-align: center; padding: 2px; overflow: hidden; white-space: nowrap; word-break: keep-all">
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
                <span style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 99px; background: #fff7ed; color: #f59e0b; border: 1px solid #fed7aa; font-size: .72rem; font-weight: 700; white-space: nowrap;">
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
              <td rowspan="${tasks.length}" style="padding: 16px 24px; border-bottom: 1px solid var(--border); vertical-align: top; position: sticky; top: 50px; background: #fff; z-index: 2; transition: background 0.2s;">
                ${statusHtml}
              </td>
              <td rowspan="${tasks.length}" style="padding: 16px 24px; text-align: center; border-bottom: 1px solid var(--border); vertical-align: top; position: sticky; top: 50px; background: #fff; z-index: 2; transition: background 0.2s;">
                <button class="btn-icon" onclick="toggleHolidayDropdown(event, ${groupIdx}, '${h.name.replace(/'/g, "\\'")}', '${h.date}')" style="background: none; border: none; color: #94a3b8; cursor: pointer">
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
        <div style="height:34px; display:flex; align-items:center">
          ${typeof renderDateFilter === 'function' ? renderDateFilter("navigate('public-holiday')", 'above', null, true, searchHtml) : ''}
        </div>
        <button onclick="window.openManageTemplatesModal()" class="btn" style="display:flex; align-items:center; gap:6px; padding:0 16px; border-radius:8px; height:34px; font-size:.7rem; font-weight:600; flex-shrink:0; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
          <i data-lucide="settings" style="width:14px; height:14px"></i> จัดการชุดงาน (Templates)
        </button>
      </div>

      <!-- STATS CARDS -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px">
        <!-- Card 1 -->
        <div class="card" style="display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 20px">
          <div style="width: 54px; height: 54px; border-radius: 16px; background: rgba(99, 102, 241, 0.1); color: #6366f1; display: flex; align-items: center; justify-content: center">
            <i data-lucide="calendar" style="width: 28px; height: 28px"></i>
          </div>
          <div>
            <div style="font-size: .8rem; color: #64748b; margin-bottom: 4px">วันหยุดทั้งหมด</div>
            <div style="display: flex; align-items: baseline; gap: 8px">
              <span style="font-size: 1.8rem; font-weight: 700; color: #1e293b">${stats.total}</span>
              <span style="font-size: .8rem; color: #64748b">วัน</span>
            </div>
            <div style="font-size: .7rem; color: #94a3b8; margin-top: 4px">ข้อมูลทั้งหมด</div>
          </div>
        </div>
        <!-- Card 2 -->
        <div class="card" style="display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 20px">
          <div style="width: 54px; height: 54px; border-radius: 16px; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center">
            <i data-lucide="check-circle" style="width: 28px; height: 28px"></i>
          </div>
          <div>
            <div style="font-size: .8rem; color: #64748b; margin-bottom: 4px">วันหยุดทั้งหมด</div>
            <div style="display: flex; align-items: baseline; gap: 8px">
              <span style="font-size: 1.8rem; font-weight: 700; color: #1e293b">${stats.finished}</span>
              <span style="font-size: .8rem; color: #64748b">วัน</span>
            </div>
            <div style="font-size: .7rem; color: #10b981; font-weight: 600; margin-top: 4px">${finishedPct}%</div>
          </div>
        </div>
        <!-- Card 3 -->
        <div class="card" style="display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 20px">
          <div style="width: 54px; height: 54px; border-radius: 16px; background: rgba(245, 158, 11, 0.1); color: #f59e0b; display: flex; align-items: center; justify-content: center">
            <i data-lucide="clock" style="width: 28px; height: 28px"></i>
          </div>
          <div>
            <div style="font-size: .8rem; color: #64748b; margin-bottom: 4px">วันหยุดทั้งหมด</div>
            <div style="display: flex; align-items: baseline; gap: 8px">
              <span style="font-size: 1.8rem; font-weight: 700; color: #1e293b">${stats.upcoming}</span>
              <span style="font-size: .8rem; color: #64748b">วัน</span>
            </div>
            <div style="font-size: .7rem; color: #f59e0b; font-weight: 600; margin-top: 4px">${upcomingPct}%</div>
          </div>
        </div>
        <!-- Card 4 -->
        <div class="card" style="display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 20px">
          <div style="width: 54px; height: 54px; border-radius: 16px; background: rgba(99, 102, 241, 0.1); color: #818cf8; display: flex; align-items: center; justify-content: center">
            <i data-lucide="calendar-plus" style="width: 28px; height: 28px"></i>
          </div>
          <div>
            <div style="font-size: .8rem; color: #64748b; margin-bottom: 4px">วันหยุดทั้งหมด</div>
            <div style="display: flex; align-items: baseline; gap: 8px">
              <span style="font-size: 1.8rem; font-weight: 700; color: #1e293b">${stats.not_scheduled}</span>
              <span style="font-size: .8rem; color: #64748b">วัน</span>
            </div>
            <div style="font-size: .7rem; color: #818cf8; font-weight: 600; margin-top: 4px">${notScheduledPct}%</div>
          </div>
        </div>
      </div>

      <!-- TABLE CARD -->
      <div class="card" style="padding: 0; border-radius: 20px; overflow: hidden; border: 1px solid var(--border)">
        <div style="padding: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #1e293b">รายการวันหยุดนักขัตฤกษ์</h3>
          <select class="select-input" style="width: 140px; padding: 6px 12px; border-radius: 10px; font-size: .8rem" onchange="window.filterHolidaysByYear(this.value)">
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
        <div style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; background: #fff">
          <div id="holidayDisplayRange" style="font-size: .8rem; color: #64748b">แสดงทั้งหมด ${holidays.length} รายการ</div>
          <div style="display: flex; align-items: center; gap: 8px">
            <button style="width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border); background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer"><i data-lucide="chevron-left" style="width: 14px; height: 14px"></i></button>
            <button style="width: 30px; height: 30px; border-radius: 6px; border: none; background: #4f46e5; color: #fff; font-size: .75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer">1</button>
            <button style="width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border); background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer"><i data-lucide="chevron-right" style="width: 14px; height: 14px"></i></button>
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
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
        z-index: 12000;
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        animation: dropdownFadeIn 0.15s ease-out;
        font-family: Kanit, sans-serif;
      ">
        <button onclick="openManageHolidayModal('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}')" style="
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 8px;
          color: #334155;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        " onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'">
          <i data-lucide="edit-3" style="width: 14px; height: 14px; color: #4f46e5;"></i>
          จัดการงาน
        </button>
        <button onclick="deleteHolidayAllTasks('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}')" style="
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        " onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'">
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
      <div class="modal-card" style="background:#fff; width:400px; border-radius:24px; padding:32px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.2); font-family:Kanit, sans-serif">
        <div style="width:64px; height:64px; border-radius:20px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; margin:0 auto 20px">
          <i data-lucide="${icon}" style="width:32px; height:32px"></i>
        </div>
        <h3 style="margin:0 0 10px; font-size:1.15rem; font-weight:700; color:#1e293b; font-family:Kanit">${title}</h3>
        <p style="margin:0 0 24px; font-size:.8rem; color:#64748b; line-height:1.5; font-family:Kanit">${message}</p>
        <div style="display:flex; gap:8px">
          <button onclick="document.getElementById('${modalId}').remove()" style="flex:1; background:#f1f5f9; color:#475569; border:none; padding:12px; border-radius:14px; font-weight:700; font-family:Kanit; cursor:pointer; font-size:.9rem; transition: background 0.2s" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">ยกเลิก</button>
          <button id="confirmDeleteBtn" style="flex:1; background:${color}; color:#fff; border:none; padding:12px; border-radius:14px; font-weight:700; font-family:Kanit; cursor:pointer; font-size:.9rem; box-shadow: 0 4px 12px ${color}30; transition: opacity 0.2s" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">ยืนยันการลบ</button>
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
            <button onclick="document.getElementById('manageHolidayModal').remove(); openAddHolidayTaskModal('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}', ${idx});" class="btn" style="
              background: #e0e7ff;
              color: #4f46e5;
              border: none;
              padding: 6px 12px;
              border-radius: 8px;
              font-size: 0.7rem;
              font-weight: 700;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <i data-lucide="edit-2" style="width: 12px; height: 12px;"></i> แก้ไข
            </button>
            <button onclick="deleteSingleHolidayTask('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}', ${idx});" class="btn" style="
              background: #fee2e2;
              color: #ef4444;
              border: none;
              padding: 6px 12px;
              border-radius: 8px;
              font-size: 0.7rem;
              font-weight: 700;
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
        <div class="modal-card" style="background:#fff; width:550px; border-radius:24px; padding:32px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.2); font-family:Kanit, sans-serif">
          <h3 style="margin:0 0 6px; font-size:1.2rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px">
            <i data-lucide="settings" style="width:22px; height:22px; color:var(--primary)"></i> จัดการงานวันหยุด
          </h3>
          <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 20px;">
            วันหยุด: <span style="font-weight: 700; color: #4f46e5;">${holidayName}</span> (${holidayDate})
          </div>
          
          <div style="max-height: 320px; overflow-y: auto; margin-bottom: 24px; border: 1px solid var(--border); border-radius: 12px; background: #f8fafc;">
            ${tasksHtml}
          </div>
          
          ${templates.length > 0 ? `
          <div style="margin-bottom: 24px; padding: 16px; border: 1px dashed var(--border); border-radius: 16px; background: #f8fafc; display: flex; align-items: flex-end; gap: 12px;">
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #475569; margin-bottom: 6px;">ดึงจากชุดงานมาตรฐานที่สร้างแล้ว</label>
              <select id="applyTemplateSelect" style="width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px; font-size: 0.8rem; outline: none; background: #fff; color: #1e293b; cursor: pointer;">
                <option value="">-- เลือกชุดงานมาตรฐาน (Templates) --</option>
                ${templateOptionsHtml}
              </select>
            </div>
            <button onclick="window.applyTemplateToHolidayClick('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}')" class="btn" style="background: var(--primary); color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; height: 40px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
              <i data-lucide="import" style="width: 14px; height: 14px;"></i> ดึงชุดงาน
            </button>
          </div>
          ` : ''}
          
          <div style="display:flex; justify-content:flex-end; align-items:center">
            <button type="button" onclick="document.getElementById('${modalId}').remove()" class="btn" style="background:#f1f5f9; color:#475569; border:none; padding:10px 20px; border-radius:12px; font-weight:600; cursor:pointer">ปิดหน้าต่าง</button>
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

    const employeeOptions = (DATA.employees || []).map(emp => `
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
          <select class="htProject" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none" onchange="window.onHolidayProjectChange(this)">
            <option value="">-- เลือกโครงการ --</option>
            ${uniqueProjects.map(proj => `<option value="${proj}" ${proj === a.project ? 'selected' : ''}>${proj}</option>`).join('')}
          </select>
          <select class="htJob" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none" onchange="window.onHolidayJobChange(this)">
            <option value="">-- เลือกงาน --</option>
            ${jobOptions}
          </select>
          <div style="position:relative;">
            <input type="number" class="htPercent" value="${a.percent || 100}" min="0" max="100" style="width:100%; padding:10px 24px 10px 10px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; text-align:center;" oninput="window.calcHolidayTaskTotalPercent()">
            <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:.8rem; color:#64748b;">%</span>
          </div>
          <button type="button" class="btn-remove-project" onclick="if(document.querySelectorAll('.project-row').length > 1) { this.parentElement.remove(); window.calcHolidayTaskTotalPercent(); }" style="display:${matchedTask.assignments.length > 1 ? 'block' : 'none'}; background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; padding:8px;">
            <i data-lucide="trash-2" style="width:16px; height:16px"></i>
          </button>
        </div>
        `;
      }).join('');
    }

    if (!projectRowsHtml) {
      projectRowsHtml = `
      <div class="project-row" style="display:grid; grid-template-columns:1fr 1fr 80px auto; gap:12px; margin-bottom:12px; align-items:center;">
        <select class="htProject" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none" onchange="window.onHolidayProjectChange(this)">
          <option value="">-- เลือกโครงการ --</option>
          ${uniqueProjects.map(proj => `<option value="${proj}">${proj}</option>`).join('')}
        </select>
        <select class="htJob" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none" onchange="window.onHolidayJobChange(this)">
          <option value="">-- เลือกงาน --</option>
        </select>
        <div style="position:relative;">
          <input type="number" class="htPercent" value="100" min="0" max="100" style="width:100%; padding:10px 24px 10px 10px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; text-align:center;" oninput="window.calcHolidayTaskTotalPercent()">
          <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:.8rem; color:#64748b;">%</span>
        </div>
        <button type="button" class="btn-remove-project" onclick="if(document.querySelectorAll('.project-row').length > 1) { this.parentElement.remove(); window.calcHolidayTaskTotalPercent(); }" style="display:none; background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; padding:8px;">
          <i data-lucide="trash-2" style="width:16px; height:16px"></i>
        </button>
      </div>
      `;
    }

    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:11000; backdrop-filter:blur(6px); animation: fadeIn 0.2s ease-out">
      <div class="modal-card" style="background:#fff; width:550px; max-height:90vh; display:flex; flex-direction:column; border-radius:24px; text-shadow:none; box-shadow:0 25px 50px -12px rgba(0,0,0,0.2); font-family:Kanit, sans-serif">
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
              <select id="htYearSelect" onchange="window.onHolidayYearChange(this.value)" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; background:#fff">
                ${yearOptions}
              </select>
            </div>
            <div>
              <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">วันหยุด (Public Holiday)</label>
              <select id="htHolidaySelect" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; background:#fff">
                <option value="" disabled selected>-- เลือกวันหยุด --</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">แผนก (Section)</label>
            <select id="htSection" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; background:#fff">
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
              <button type="button" onclick="window.addHolidayTaskProjectRow()" style="background:none; border:none; color:var(--primary); font-size:.7rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px; padding:0;">
                <i data-lucide="plus" style="width:12px; height:12px"></i> เพิ่มงานอื่นในกะนี้
              </button>
              <div id="htTotalPercent" style="font-size:.8rem; font-weight:700; color:#10b981;">รวม: 100%</div>
            </div>
          </div>

          <div style="margin-bottom:16px">
            <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">กะเวลาปฏิบัติงาน</label>
            <select id="htTime" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; background:#fff">
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
            <select id="htPerson" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; background:#fff">
              <option value="">-- เลือกพนักงาน --</option>
              ${(DATA.employees || []).map(emp => `
                <option value="${emp.name}" ${matchedTask && matchedTask.person === emp.name ? 'selected' : ''}>${emp.name} (${emp.nickname || emp.pos})</option>
              `).join('')}
            </select>
          </div>
          ` : ''}

          <div style="margin-bottom:24px">
            <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">สถานะ</label>
            <select id="htStatus" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; background:#fff">
              <option value="upcoming" ${matchedHoliday && matchedHoliday.status === 'upcoming' ? 'selected' : ''}>กำลังจะถึง (Upcoming)</option>
              <option value="finished" ${matchedHoliday && matchedHoliday.status === 'finished' ? 'selected' : ''}>เสร็จสิ้นแล้ว (Finished)</option>
            </select>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px">
            <button type="button" onclick="document.getElementById('${modalId}').remove()" class="btn" style="background:#f1f5f9; color:#475569; border:none; padding:10px 20px; border-radius:12px; font-weight:600; cursor:pointer">ยกเลิก</button>
            <button type="submit" class="btn btn-primary" style="background:var(--primary); color:#fff; border:none; padding:10px 20px; border-radius:12px; font-weight:700; cursor:pointer">${isEditMode ? 'บันทึกการแก้ไข' : 'ถัดไป: เลือกวันหยุด ➔'}</button>
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
          <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:8px 12px; border-radius:8px; border:1px solid var(--border); transition:all 0.2s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='none'">
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
      <div class="modal-card" style="background:#fff; width:500px; max-height:85vh; display:flex; flex-direction:column; border-radius:24px; text-shadow:none; box-shadow:0 25px 50px -12px rgba(0,0,0,0.2); font-family:Kanit, sans-serif">
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
          <button onclick="document.getElementById('${modalId}').remove()" style="background:#f1f5f9; color:#64748b; border:none; padding:10px 20px; border-radius:12px; font-weight:600; cursor:pointer;">ยกเลิก</button>
          <button onclick="window.submitHolidayTaskBatch()" style="background:var(--primary); color:#fff; border:none; padding:10px 20px; border-radius:12px; font-weight:600; cursor:pointer;">บันทึก</button>
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
      <div class="modal-card" style="background:#fff; width:380px; border-radius:24px; padding:32px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.2)">
        <div style="width:64px; height:64px; border-radius:20px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; margin:0 auto 20px">
          <i data-lucide="${icon}" style="width:32px; height:32px"></i>
        </div>
        <h3 style="margin:0 0 10px; font-size:1.15rem; font-weight:700; color:#1e293b; font-family:Kanit">${title}</h3>
        <p style="margin:0 0 24px; font-size:.8rem; color:#64748b; line-height:1.5; font-family:Kanit">${message}</p>
        <button onclick="document.getElementById('${modalId}').remove()" style="width:100%; background:${color}; color:#fff; border:none; padding:12px; border-radius:14px; font-weight:700; font-family:Kanit; cursor:pointer; font-size:.9rem; box-shadow: 0 4px 12px ${color}30">ตกลง</button>
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
      <div class="modal-card" style="background:#fff; width:420px; border-radius:24px; padding:40px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.15); border:1px solid rgba(255,255,255,0.2); transform:scale(1); animation: modalBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)">
        <div style="width:72px; height:72px; border-radius:22px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; transform: rotate(-5deg)">
          <i data-lucide="${icon}" style="width:36px; height:36px"></i>
        </div>
        <h3 style="margin:0 0 12px; font-size:1.3rem; font-weight:700; color:#1e293b; font-family:Kanit">${title}</h3>
        <p style="margin:0 0 32px; font-size:.9rem; color:#64748b; line-height:1.6; font-family:Kanit; padding:0 10px">${message}</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
          <button onclick="document.getElementById('${modalId}').remove()" style="background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; padding:14px; border-radius:16px; font-weight:600; font-family:Kanit; cursor:pointer; font-size:.9rem; transition:all 0.2s" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">Cancel</button>
          <button id="confirmModalBtn" style="background:${color}; color:#fff; border:none; padding:14px; border-radius:16px; font-weight:700; font-family:Kanit; cursor:pointer; font-size:.9rem; box-shadow: 0 8px 20px ${color}30; transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 25px ${color}40'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px ${color}30'">${confirmText}</button>
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
    const reqs = window._filteredLeaveRequests || DATA.leaveRequests || [];

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
            y: { grid: { display: false }, ticks: { font: { family: 'Kanit', size: 9 } } }
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
                  ctx.font = 'bold 10px Kanit';
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
            x: { grid: { display: false }, ticks: { font: { family: 'Kanit', size: 10 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Kanit', size: 10 } } }
          }
        }
      });
    }

    // Leave Status Chart (Doughnut) - Use real data
    const sStats = DATA.leaveStats || { pending: 0, approved: 0, rejected: 0 };
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
    const emp = (DATA.employees || []).find(e =>
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
    <tr style="background:#fff; position: sticky; top: 0; z-index: 20;">
      ${window.isScopeBulkMode ? `
      <th style="width: 46px; min-width: 46px; padding: 18px 12px; text-align: center; position: sticky; left: 0; top: 0; z-index: 22; background: #fff; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
        <div style="display:flex; align-items:center; justify-content:center; height:100%;">
        </div>
      </th>
      ` : ''}
      <th style="width: 300px; min-width: 300px; padding: 18px 20px; text-align: left; position: sticky; left: ${colOffset}px; top: 0; z-index: 22; background: #fff; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); color: #1e293b; font-weight: 700; vertical-align: middle; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
        <div style="display:flex; align-items:center; gap:8px; height:100%;">
          <i data-lucide="layers" style="width:16px; height:16px; color:#475569;"></i>
          <span>Project / Scope</span>
        </div>
      </th>
      <th style="width: 120px; min-width: 120px; padding: 18px 12px; text-align: center; position: sticky; left: ${300 + colOffset}px; top: 0; z-index: 22; background: #fff; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); color: #1e293b; font-weight: 700; vertical-align: middle; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
        <div style="display:flex; align-items:center; justify-content:center; gap:6px; height:100%;">
          <i data-lucide="git-branch" style="width:14px; height:14px; color:#64748b;"></i>
          <span>Node</span>
        </div>
      </th>
      <th style="width: 130px; min-width: 130px; padding: 18px 12px; text-align: center; position: sticky; left: ${420 + colOffset}px; top: 0; z-index: 22; background: #fff; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); color: #1e293b; font-weight: 700; vertical-align: middle; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
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
        <td style="padding: 14px 12px; text-align: center; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--surface); position: sticky; left: 0; z-index: 10; box-shadow: 2px 0 5px rgba(0,0,0,0.02)">
          <div style="display:flex; align-items:center; justify-content:center; height:100%;">
            <input type="checkbox" class="scope-checkbox" value="${encodeURIComponent(group.account)}|${encodeURIComponent(item.name)}" onchange="checkScopeSelection()" style="width: 16px; height: 16px; cursor: pointer;">
          </div>
        </td>
        ` : ''}
        <td style="padding: 14px 20px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--surface); position: sticky; left: ${colOffset}px; z-index: 10; box-shadow: 2px 0 5px rgba(0,0,0,0.02)">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px">
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-2)">${item.name}</div>
            <div style="display: flex; align-items: center; gap: 4px">
              <button class="btn-icon" title="แก้ไข" onclick="showEditWorkshipScopeModal('${group.account.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}', '${item.node}', ${item.progress})" style="width: 28px; height: 28px; border-radius: 6px; background: var(--primary-light); color: var(--primary); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.6; transition: opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">
                <i data-lucide="edit-3" style="width: 14px; height: 14px"></i>
              </button>
              <button class="btn-icon" title="ลบ" onclick="deleteWorkshipScope('${group.account.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}')" style="width: 28px; height: 28px; border-radius: 6px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.6; transition: opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">
                <i data-lucide="trash-2" style="width: 14px; height: 14px"></i>
              </button>
            </div>
          </div>
        </td>
        <td style="padding: 8px 8px; text-align: center; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--surface); position: sticky; left: ${300 + colOffset}px; z-index: 10; box-shadow: 2px 0 5px rgba(0,0,0,0.02)">
          ${renderNodeBadge(item.node)}
        </td>
        <td style="padding: 8px 8px; text-align: center; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--surface); position: sticky; left: ${420 + colOffset}px; z-index: 10; box-shadow: 2px 0 5px rgba(0,0,0,0.02)">
          <div style="font-size: 0.7rem; font-weight: 700; color: ${item.progress > 120 ? '#991b1b' : 'var(--text-2)'}">${item.progress}%</div>
          <div style="width: 100%; height: 8px; background: #eef2ff; border-radius: 99px; overflow: hidden; margin-top: 4px; border: 1px solid #e2e8f0">
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
          const emp = (DATA.employees || []).find(e => e.id === t.person || e.name === t.person || e.nickname === t.person);
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

  window.renderPremiumScopeDashboard = function() {
    window.currentPage = 'project-scope-portal';

    // Async rendering to prevent UI freeze
    setTimeout(() => {
        const bodyEl = document.getElementById('scopeTableBody');
        if (bodyEl) {
            const days = getDashboardDays();
            // Start chunked rendering instead of freezing the main thread
            renderScopeTableChunked(window.PREMIUM_SCOPE_DATA, days, bodyEl);
            
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
      <!-- DASHBOARD HEADER AREA -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px">
        <div></div>
        
        <!-- Filter Toolbar -->
        <div style="display: flex; align-items: center; gap: 8px; z-index: 100">
          <style>
            .date-range-wrapper div[id$="_from"], 
            .date-range-wrapper div[id$="_to"] { 
              height: 34px !important; 
              font-size: 0.8rem !important;
            }
          </style>
          ${renderDateFilter('applyScopeDashboardFilters()', 'auto', null, false)}

          <!-- Search Box -->
          <div class="search-box" style="width: 200px; background: #f8f9fb; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; gap: 8px; height: 34px">
            <i data-lucide="search" style="width: 14px; height: 14px; color: var(--text-3)"></i>
            <input type="text" id="scopeSearch" oninput="applyScopeDashboardFilters()" placeholder="Search Project or Scope..." style="background: none; border: none; outline: none; font-size: 0.75rem; width: 100%; color: var(--text); font-family: 'Kanit', sans-serif">
          </div>

          <select id="scopeFilterProject" onchange="applyScopeDashboardFilters()" class="select-input" style="height: 34px; min-width: 140px; padding: 0 10px; border-radius: 8px; font-size: 0.8rem; border: 1px solid var(--border); background: #f8f9fb; color: var(--text); outline: none">
            <option value="all">All Projects</option>
            ${(() => {
        // Use dynamically fetched accounts
        const projects = window.PROJECT_ACCOUNTS || [];
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
          <select id="scopeFilterNode" onchange="applyScopeDashboardFilters()" class="select-input" style="height: 34px; min-width: 130px; padding: 0 10px; border-radius: 8px; font-size: 0.8rem; border: 1px solid var(--border); background: #f8f9fb; color: var(--text); outline: none">
            <option value="all">All Nodes</option>
            ${(() => {
        const nodes = window.PROJECT_NODES || ['Adhoc', 'AE', 'AI', 'Content', 'Coordinator', 'Graphic', 'Internal', 'Meeting', 'Monitor', 'Other', 'Production', 'Report', 'Seminar'];
        return nodes.map(n => `<option value="${n}">${n}</option>`).join('');
      })()}
          </select>

          <button class="btn" style="height: 34px; padding: 0 12px; font-size: 0.75rem; white-space: nowrap; border-radius: 8px; background: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; gap: 6px; font-weight: 600; cursor: pointer" onclick="clearScopeDashboardFilters()">
            <i data-lucide="rotate-ccw" style="width: 13px; height: 13px"></i> Clear All Filter
          </button>
        </div>
      </div>

      <!-- STATS CARDS GRID -->
      <div class="stats-grid" style="margin-bottom: 24px">
        <!-- Card: Total Projects -->
        <div class="stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: var(--primary-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="briefcase" style="width: 22px; height: 22px; color: var(--primary)"></i>
          </div>
          <div style="min-width: 0">
            <div style="font-size: 0.68rem; color: var(--text-3); margin-bottom: 1px">Managed Projects</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--text)">${fmt(totalProjects)}</div>
            <div style="font-size: 0.68rem; color: var(--text-3)">Projects</div>
          </div>
        </div>
        
        <!-- Card: Total Scopes -->
        <div class="stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: var(--primary-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="pie-chart" style="width: 22px; height: 22px; color: var(--primary)"></i>
          </div>
          <div style="min-width: 0">
            <div style="font-size: 0.68rem; color: var(--text-3); margin-bottom: 1px">Total Scopes</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--text)">${fmt(totalScopes)}</div>
            <div style="font-size: 0.68rem; color: var(--text-3)">Scopes</div>
          </div>
        </div>

        <!-- Card: Allocation Circle -->
        <div class="stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: var(--warn-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0">
             <div style="width: 32px; height: 32px; position: relative">
              <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg)">
                <circle cx="18" cy="18" r="16" fill="none" stroke="white" stroke-width="4"></circle>
                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--warn)" stroke-width="4" stroke-dasharray="${avgLoad}, 100" stroke-linecap="round"></circle>
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
        <div class="stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: var(--danger-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="trending-up" style="width: 22px; height: 22px; color: var(--danger)"></i>
          </div>
          <div style="min-width: 0">
            <div style="font-size: 0.68rem; color: var(--text-3); margin-bottom: 1px">High Load (>50%)</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--danger)">${fmt(highLoadCount)}</div>
            <div style="font-size: 0.68rem; color: var(--text-3)">Scopes</div>
          </div>
        </div>

        <!-- Card: Normal Workload -->
        <div class="stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: var(--accent-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="bar-chart-2" style="width: 22px; height: 22px; color: var(--accent)"></i>
          </div>
          <div style="min-width: 0">
            <div style="font-size: 0.68rem; color: var(--text-3); margin-bottom: 1px">Normal Load</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--accent)">${fmt(normalLoadCount)}</div>
            <div style="font-size: 0.68rem; color: var(--text-3)">Scopes</div>
          </div>
        </div>

        <!-- Card: Low Workload -->
        <div class="stat-card" style="flex-direction: row; align-items: center; gap: 12px; padding: 16px 18px">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: var(--primary-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="minus" style="width: 22px; height: 22px; color: var(--primary)"></i>
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
          <button id="bulkDeleteScopeBtn" onclick="bulkDeleteWorkshipScope()" class="btn btn-sm btn-danger" style="display: none; height: 34px; align-items: center; gap: 6px; padding: 0 12px; border-radius: 8px;">
            <i data-lucide="trash-2" style="width: 14px; height: 14px"></i> Delete Selected
          </button>
          <button id="bulkDeselectScopeBtn" onclick="toggleAllWorkshipScope({checked: false})" class="btn btn-sm btn-outline" style="display: none; height: 34px; align-items: center; gap: 6px; padding: 0 12px; border-radius: 8px;">
            <i data-lucide="x-square" style="width: 14px; height: 14px"></i> Clear Selection
          </button>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="toggleScopeBulkMode()" class="btn btn-outline" style="height: 34px; font-size: 0.8rem; background: ${window.isScopeBulkMode ? '#fef2f2' : '#fff'}; color: ${window.isScopeBulkMode ? '#ef4444' : 'var(--text-2)'}; border-color: ${window.isScopeBulkMode ? '#fecaca' : 'var(--border)'}">
            <i data-lucide="check-square" style="width: 16px; height: 16px"></i> ${window.isScopeBulkMode ? 'Cancel Selection' : 'Select Multiple'}
          </button>
          <button onclick="showAddWorkshipScopeModal()" class="btn btn-primary" style="height: 34px; font-size: 0.8rem">
            <i data-lucide="plus-circle" style="width: 16px; height: 16px"></i> Add Scope
          </button>
        </div>
      </div>

      <div id="scopeTableWrap" class="table-wrap" style="border: 1px solid var(--border); border-radius: 16px; overflow: auto; max-height: calc(100vh - 380px); background: var(--surface); width: 100%; max-width: calc(100vw - 320px)">
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
          <div style="flex: 1; max-width: 80px; height: 5px; background: var(--bg); border-radius: 10px; overflow: hidden">
            <div style="width: ${progress}%; height: 100%; background: ${barColor}; border-radius: 10px"></div>
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
    <div id="addScopeModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; font-family: 'Kanit', sans-serif;">
      <div style="background: white; width: 480px; border-radius: 24px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); transform: translateY(0); transition: all 0.3s">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">
          <h2 style="margin: 0; font-size: 1.4rem; font-weight: 800; color: #1e293b">Add New Scope</h2>
          <button onclick="document.getElementById('addScopeModal').remove()" style="background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center">
            <i data-lucide="x" style="width: 18px; height: 18px"></i>
          </button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 20px">
          <!-- Account Selection -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Project</label>
            <div style="display: flex; gap: 8px">
              <select id="scopeAccount" onchange="toggleNewAccountInput(this.value)" style="flex: 1; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: inherit; outline: none; background: #f8fafc">
                <option value="" selected disabled>---Select Project---</option>
                ${accounts.map(a => `<option value="${a}">${a}</option>`).join('')}
                <option value="NEW">+ Add New Project</option>
              </select>
              <input id="newAccountInput" type="text" placeholder="Enter new project name" style="display: none; flex: 1.5; padding: 12px 16px; border: 1.5px solid #6366f1; border-radius: 12px; font-family: inherit; outline: none;">
            </div>
          </div>

          <!-- Node Selection -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Node</label>
            <select id="scopeNode" style="width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: inherit; outline: none; background: #f8fafc">
              <option value="" selected disabled>--- Select Node ---</option>
              ${nodes.map(n => `<option value="${n}">${n}</option>`).join('')}
            </select>
          </div>

          <!-- Work Detail -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Scope / Details</label>
            <input id="scopeDetail" type="text" placeholder="e.g., Social Monitoring Plan" style="width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: inherit; outline: none;">
          </div>

          <!-- Proportion % -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Workload (%)</label>
            <div style="display: flex; align-items: center; gap: 12px">
              <input id="scopePercent" type="number" value="0" min="0" max="1000" style="width: 80px; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: inherit; outline: none; text-align: center">
              <input type="range" min="0" max="200" value="0" oninput="document.getElementById('scopePercent').value = this.value" style="flex: 1; accent-color: #6366f1">
            </div>
          </div>

          <button onclick="saveNewWorkshipScope()" style="margin-top: 12px; padding: 14px; background: #6366f1; color: white; border: none; border-radius: 16px; font-weight: 700; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3)">
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

    // 1. Optimistic UI Update
    if (isEdit) {
      // Find and update existing
      window.PREMIUM_SCOPE_DATA.forEach(group => {
        const item = group.items.find(it => it.name === originalName);
        if (item) {
          item.name = detail;
          item.node = node;
          item.progress = parseInt(percent) || 0;
        }
      });
    } else {
      // Add new
      const newItem = {
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

        // 2. Update WS_DATA.accounts (Secondary source)
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

    // 3. Save to Google Sheets (Async)
    if (accSelect === 'NEW' && !isEdit) {
      // First, save the new project to the Project sheet
      window.apiSaveWorkshipScope({
        action: 'add_project',
        project_name: account,
        project: account,
        account: account
      });

      // Then save the scope detail with a longer delay to ensure project is saved
      setTimeout(() => {
        window.apiSaveWorkshipScope({
          action: 'add_workship_scope',
          account, node, category: node, detail, percent
        });
      }, 2000);
    } else {
      window.apiSaveWorkshipScope({
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
    <div id="addScopeModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; font-family: 'Kanit', sans-serif;">
      <div class="fade-in" style="background: white; width: 100%; max-width: 500px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2); overflow: hidden; position: relative;">
        <!-- Header -->
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; display: flex; justify-content: space-between; align-items: center">
          <div>
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700">Edit Scope Details</h2>
            <p style="margin: 4px 0 0; font-size: 0.8rem; opacity: 0.9">Update workload and details</p>
          </div>
          <button onclick="document.getElementById('addScopeModal').remove()" style="background: rgba(255,255,255,0.2); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: white; display: flex; align-items: center; justify-content: center">
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
            <select id="scopeAccount" style="width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: inherit; outline: none; background: #f8fafc">
              ${accounts.map(a => `<option value="${a}" ${a === acc ? 'selected' : ''}>${a}</option>`).join('')}
              ${!accounts.includes(acc) ? `<option value="${acc}" selected>${acc}</option>` : ''}
            </select>
          </div>

          <!-- Node Selection -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Node</label>
            <select id="scopeNode" style="width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: inherit; outline: none; background: #f8fafc">
              ${nodes.map(n => `<option value="${n}" ${n === node ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
          </div>

          <!-- Work Detail -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Scope / Details</label>
            <input id="scopeDetail" type="text" value="${name}" style="width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: inherit; outline: none;">
          </div>

          <!-- Proportion % -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px">Workload (%)</label>
            <div style="display: flex; align-items: center; gap: 12px">
              <input id="scopePercent" type="number" value="${progress}" min="0" max="1000" style="width: 80px; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: inherit; outline: none; text-align: center">
              <input type="range" min="0" max="200" value="${progress}" oninput="document.getElementById('scopePercent').value = this.value" style="flex: 1; accent-color: #6366f1">
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 12px; margin-top: 8px">
            <button onclick="deleteWorkshipScope('${acc.replace(/'/g, "\\'")}', '${name.replace(/'/g, "\\'")}')" style="flex: 1; padding: 14px; border: 1.5px solid #fee2e2; border-radius: 12px; background: #fef2f2; color: #ef4444; font-weight: 700; cursor: pointer; transition: all 0.2s">Delete</button>
            <button onclick="document.getElementById('addScopeModal').remove()" style="flex: 1; padding: 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: white; color: #64748b; font-weight: 700; cursor: pointer; transition: all 0.2s">Cancel</button>
            <button onclick="saveNewWorkshipScope(true)" style="flex: 2; padding: 14px; border: none; border-radius: 12px; background: #6366f1; color: white; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4)">Update Scope</button>
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
      if (checked.length > 0) {
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



  window.apiSaveWorkshipScope = function (data) {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';
    const payload = {
      ...data,
      timestamp: new Date().toISOString()
    };

    console.log("Scope Sync: Sending payload:", payload);

    try {
      // Create a unique iframe for each request to avoid collisions
      const iframeId = 'sync_iframe_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.name = iframeId;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = GAS_URL;
      form.target = iframeId;

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = JSON.stringify(payload);
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();

      // Cleanup after a while
      setTimeout(() => {
        if (form && form.parentNode) document.body.removeChild(form);
        if (iframe && iframe.parentNode) document.body.removeChild(iframe);
      }, 5000);

      console.log("Scope Sync: Request submitted successfully.");
    } catch (err) {
      console.error("Scope Sync Error:", err);
    }
  }

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
          const oldPersonObj = (DATA.employees || []).find(emp => emp.id === task.person);
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
        const personObj = (DATA.employees || []).find(emp => emp.id === personId);
        if (droppedTask && personObj) {
          window.apiSaveScheduleTask(droppedTask, personObj, dateIso);
        }
      }
    };

    const dObj = new Date(dateIso);
    const dayIndex = dObj.getDay();
    let isPublic = false;
    if (typeof isThaiHoliday === 'function') {
      isPublic = !!isThaiHoliday(dObj);
    }

    const person = (DATA.employees || []).find(emp => emp.id === personId);
    let isOffDay = false;
    let isLeave = false;

    if (person) {
      const realDayMap = { 'อาทิตย์': 0, 'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัสบดี': 4, 'ศุกร์': 5, 'เสาร์': 6, 'อา.': 0, 'จ.': 1, 'อ.': 2, 'พ.': 3, 'พฤ.': 4, 'ศ.': 5, 'ส.': 6 };
      const offDays = (person.offdays || '').split(/[,|\-]/).map(d => realDayMap[d.trim().replace('วัน', '')]).filter(v => v !== undefined);
      if (offDays.includes(dayIndex)) isOffDay = true;

      if (DATA.leaveRequests) {
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
        const onLeave = DATA.leaveRequests.some(r => {
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
            const personObj = (DATA.employees || []).find(emp => emp.id === taskToDelete.person);
            window.apiDeleteScheduleTask(taskToDelete, personObj);
          }
        }
      }
    });
  };


  window.apiSaveScheduleTask = async function (task, person, dateIso) {
    // URL for Workship Scope & Schedule backend
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';
    const payload = {
      action: 'update_schedule',
      date: dateIso,
      name: person.nickname || person.name,
      project: task.acc || '',
      node: task.node || '',
      work_detail: task.title || '',
      percentage: task.hours || 0,
      old_date: task.oldDate || '',
      old_name: task.oldName || '',
      taskId: task.id // Passed in case backend wants to use it for matching
    };

    try {
      let iframe = document.getElementById('hidden_schedule_sync_iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'hidden_schedule_sync_iframe';
        iframe.name = 'hidden_schedule_sync_iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = WEB_APP_URL;
      form.target = 'hidden_schedule_sync_iframe';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = JSON.stringify(payload);
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();

      setTimeout(() => {
        if (form.parentNode) document.body.removeChild(form);
      }, 1000);

      if (typeof window.showToast === 'function') {
        window.showToast('Saving schedule data...', 'success');
      }
    } catch (err) {
      console.error('Error syncing schedule:', err);
      if (typeof window.showToast === 'function') {
        window.showToast('Error saving schedule data', 'error');
      }
    }
  };

  window.apiDeleteScheduleTask = async function (task, person) {
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';
    const payload = {
      action: 'delete_schedule',
      old_date: task.date || '',
      old_name: person ? (person.nickname || person.name) : '',
      work_detail: task.title || ''
    };

    try {
      let iframe = document.getElementById('hidden_schedule_sync_iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'hidden_schedule_sync_iframe';
        iframe.name = 'hidden_schedule_sync_iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = WEB_APP_URL;
      form.target = 'hidden_schedule_sync_iframe';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = JSON.stringify(payload);
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();

      setTimeout(() => {
        if (form.parentNode) document.body.removeChild(form);
      }, 1000);

      if (typeof window.showToast === 'function') {
        window.showToast('Task removed from schedule', 'success');
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  window.showDayDetailModal = function (personId, dateIso) {
    const person = DATA.employees.find(e => e.id === personId);
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
      <div style="background:#fff; width:100%; max-width:500px; border-radius:28px; box-shadow:0 30px 60px -12px rgba(0,0,0,0.2); overflow:hidden; animation:modalBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)">
        <div style="padding:24px 32px; background:#f8fafc; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center">
          <div>
            <h3 style="margin:0; font-size:1.1rem; font-weight:800; color:#1e293b; font-family:Kanit">${person.nameEn || person.name}</h3>
            <div style="font-size:0.8rem; color:#64748b; font-weight:500; margin-top:2px">${new Date(dateIso).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
          <button onclick="document.getElementById('${modalId}').remove()" style="background:#fff; border:1px solid #e2e8f0; width:36px; height:36px; border-radius:12px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#94a3b8; transition:all 0.2s" onmouseover="this.style.color='#ef4444'; this.style.borderColor='#fecaca'" onmouseout="this.style.color='#94a3b8'; this.style.borderColor='#e2e8f0'">
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
      return `
                <div style="padding:16px; border-radius:16px; background:#fff; border:1px solid #f1f5f9; border-left:4px solid ${nodeCol}; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center">
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
                    <button onclick="deleteScheduledTask('${t.id}'); document.getElementById('${modalId}').remove()" style="background:#fef2f2; color:#ef4444; border:none; width:32px; height:32px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                      <i data-lucide="trash-2" style="width:16px; height:16px"></i>
                    </button>
                  </div>
                </div>
              `;
    }).join('')}
            ${holidayTasks.map(ht => {
              if (!ht.assignments || ht.assignments.length === 0) {
                return `
                  <div style="padding:16px; border-radius:16px; background:#fff; border:1px solid #fcd34d; border-left:4px solid #f59e0b; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center">
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
                  <div style="padding:16px; border-radius:16px; background:#fff; border:1px solid #fcd34d; border-left:4px solid #f59e0b; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center">
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
                <div style="padding:16px; border-radius:16px; background:#fff; border:1px solid #fcd34d; border-left:4px solid #f59e0b; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center">
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
          color: typeof colorForNode === 'function' ? colorForNode(item.node) : '#6366f1'
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
      const col = t.color || '#6366f1';
      return `
        <div class="task-card" draggable="true" 
             ondragstart="handleTaskDragStart(event, '${t.id}')" 
             ondragend="this.style.opacity='1'"
             style="background:#fff; padding:14px 16px; border-radius:14px; border:1px solid var(--border); border-left:4px solid ${col}; cursor:grab; transition:all 0.2s ease; position:relative; display:flex; align-items:center; gap:12px; box-shadow:0 2px 4px rgba(0,0,0,0.02)">
          
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
              box-shadow: 0 8px 16px rgba(0,0,0,0.06) !important;
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
    <div id="taskSidebar" style="display:flex; flex-direction:column; height:100%; background:#fff; font-family:'Kanit', sans-serif">
      <!-- Sidebar Header -->
      <div style="padding:24px 20px; border-bottom:1px solid var(--border); background:#fff; position:sticky; top:0; z-index:10; box-shadow:0 4px 12px rgba(0,0,0,0.02)">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
          <div>
            <h3 style="margin:0; font-size:1.25rem; font-weight:800; color:#1e293b; letter-spacing:-0.5px">Add Task</h3>
            <p style="margin:2px 0 0; font-size:0.75rem; color:#64748b; font-weight:500">Available tasks from Scope</p>
          </div>
          <button onclick="toggleTaskSidebar()" style="background:#f1f5f9; border:none; width:36px; height:36px; border-radius:12px; cursor:pointer; color:#64748b; display:flex; align-items:center; justify-content:center; transition:all 0.2s">
            <i data-lucide="x" style="width:20px; height:20px"></i>
          </button>
        </div>

        <!-- Filters -->
        <div style="display:flex; flex-direction:column; gap:8px">
          <div style="position:relative">
            <i data-lucide="search" style="width:16px; height:16px; position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94a3b8"></i>
            <input type="text" id="sidebarSearch" placeholder="Search tasks or projects..." onkeyup="filterSidebarTasks()" value="${window._sidebarSearch}"
                   style="width:100%; height:44px; padding:0 12px 0 42px; border-radius:14px; border:1.5px solid #f1f5f9; font-size:0.85rem; outline:none; background:#f8fafc; font-family:inherit; transition:all 0.2s; color:#1e293b">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
            <div style="position:relative">
              <select id="sidebarProjectFilter" onchange="filterSidebarTasks()" 
                      style="width:100%; height:40px; padding:0 12px; border-radius:12px; border:1.5px solid #f1f5f9; font-size:0.75rem; font-weight:600; outline:none; background:#f8fafc; cursor:pointer; appearance:none; color:#475569">
                <option value="all">All Projects</option>
                ${projects.map(p => `<option value="${p}" ${window._sidebarProjectFilter === p ? 'selected' : ''}>${p}</option>`).join('')}
              </select>
              <i data-lucide="chevron-down" style="width:14px; height:14px; position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none"></i>
            </div>
            <div style="position:relative">
              <select id="sidebarNodeFilter" onchange="filterSidebarTasks()" 
                      style="width:100%; height:40px; padding:0 12px; border-radius:12px; border:1.5px solid #f1f5f9; font-size:0.75rem; font-weight:600; outline:none; background:#f8fafc; cursor:pointer; appearance:none; color:#475569">
                <option value="all">All Nodes</option>
                ${nodes.map(n => `<option value="${n}" ${window._sidebarNodeFilter === n ? 'selected' : ''}>${n}</option>`).join('')}
              </select>
              <i data-lucide="chevron-down" style="width:14px; height:14px; position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none"></i>
            </div>
          </div>
          <button onclick="clearSidebarFilters()" style="background:none; border:none; color:#ef4444; font-size:0.7rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px; align-self:flex-end; padding:4px 8px; border-radius:6px; transition:all 0.2s" onmouseover="this.style.background='rgba(239,68,68,0.05)'" onmouseout="this.style.background='none'">
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
          background: #fff !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
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
  <div id="taskSidebarContainer" style="position:fixed; top:0; right:${sidebarRight}; width:380px; height:100vh; background:#fff; box-shadow:-10px 0 30px rgba(0,0,0,0.1); z-index:1500; transition:right 0.3s cubic-bezier(0.4, 0, 0.2, 1)">
    ${window.IS_TASK_SIDEBAR_OPEN ? renderTaskSidebar() : ''}
  </div>
  `;
  }

  window.openEmployeeModal = function (editId = "") {
    const isEdit = !!editId;
    const modalId = 'addEmployeeModal';
    const emp = isEdit ? DATA.employees.find(e => e.id === editId) : null;

    if (isEdit && !emp) {
      showAlert('ไม่พบข้อมูล', 'ไม่พบข้อมูลพนักงานที่ต้องการแก้ไข', 'error');
      return;
    }

    const posOrder = ['director', 'manager', 'assistant manager', 'senior', 'junior'];
    const uniquePositions = [...new Set(window.DATA.employees.map(e => (e.pos || '').trim()).filter(Boolean))].sort((a, b) => {
        const ai = posOrder.findIndex(o => a.toLowerCase().includes(o));
        const bi = posOrder.findIndex(o => b.toLowerCase().includes(o));
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.localeCompare(b);
    });

    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); z-index:2000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px)">
      <div style="background:#fff; width:100%; max-width:550px; border-radius:20px; box-shadow:0 15px 40px rgba(0,0,0,0.15); display:flex; flex-direction:column; overflow:hidden; animation: modalIn 0.3s ease-out">
        <div style="padding:24px; background:var(--surface2); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
          <h3 style="font-family:Kanit; font-size:1.1rem; font-weight:700; color:var(--text); margin:0">${isEdit ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}</h3>
          <button onclick="document.getElementById('${modalId}').remove()" style="background:none; border:none; cursor:pointer; color:var(--text-3)"><i data-lucide="x" style="width:20px; height:20px"></i></button>
        </div>
        
        <div style="padding:24px; overflow-y:auto; max-height:calc(100vh - 150px)">
          <!-- Row 1: ID, Nickname -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px">
            <div class="form-group">
              <label class="form-label">รหัสพนักงาน</label>
              <div style="display:flex; align-items:center; background:#f8fafc; border:1px solid var(--border); border-radius:10px; overflow:hidden; height:42px">
                <span style="padding:0 10px; font-family:Kanit; font-weight:700; color:var(--text-3); background:#f1f5f9; border-right:1px solid var(--border); height:100%; display:flex; align-items:center; font-size:.75rem">RS</span>
                <input type="text" id="empIdDigits" class="form-input" style="border:none; flex:1; padding:0 10px; height:100%; background:transparent" placeholder="000" value="${isEdit ? emp.id.replace('RS', '') : ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">ชื่อเล่น</label>
              <input type="text" id="empNick" class="form-input" style="height:42px" value="${isEdit ? emp.nickname : ''}" placeholder="ชื่อเล่น">
            </div>
          </div>
          
          <!-- Row 2: Name Thai, Name English -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px">
            <div class="form-group">
              <label class="form-label">ชื่อ-นามสกุล (ไทย)</label>
              <input type="text" id="empName" class="form-input" style="height:42px" value="${isEdit ? emp.name : ''}" placeholder="ระบุชื่อภาษาไทย">
            </div>
            <div class="form-group">
              <label class="form-label">ชื่อ-นามสกุล (อังกฤษ)</label>
              <input type="text" id="empNameEn" class="form-input" style="height:42px" value="${isEdit ? (emp.nameEn || '') : ''}" placeholder="Name in English">
            </div>
          </div>

          <!-- Row 3: Email, Birthday -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px">
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <div style="display:flex; align-items:center; background:#f8fafc; border:1px solid var(--border); border-radius:10px; overflow:hidden; height:42px">
                <input type="text" id="empEmailUser" class="form-input" style="border:none; flex:1; padding:0 10px; height:100%; background:transparent" placeholder="username" value="${isEdit ? (emp.email || '').split('@')[0] : ''}">
                <span style="padding:0 10px; font-family:Kanit; font-weight:600; color:var(--text-3); background:#f1f5f9; border-left:1px solid var(--border); height:100%; display:flex; align-items:center; font-size:.7rem">@realsmart.co.th</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">วันเกิด</label>
              <div style="display:flex; gap:4px; height:42px">
                <select id="empBirthDay" class="form-input" style="flex:1; appearance:auto; padding:0 4px; font-size:.7rem; height:100%">
                  <option value="" disabled selected>วัน</option>
                  ${Array.from({ length: 31 }, (_, i) => i + 1).map(d => `<option value="${d}" ${isEdit && emp.birthdate && emp.birthdate.split('/')[0] == d ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
                <select id="empBirthMonth" class="form-input" style="flex:1.5; appearance:auto; padding:0 4px; font-size:.7rem; height:100%">
                  <option value="" disabled selected>เดือน</option>
                  ${['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'].map((m, i) => `<option value="${i + 1}" ${isEdit && emp.birthdate && emp.birthdate.split('/')[1] == i + 1 ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
                <select id="empBirthYear" class="form-input" style="flex:1.2; appearance:auto; padding:0 4px; font-size:.7rem; height:100%">
                  <option value="" disabled selected>พ.ศ.</option>
                  ${Array.from({ length: 80 }, (_, i) => 2567 - i).map(y => `<option value="${y}" ${isEdit && emp.birthdate && emp.birthdate.split('/')[2] == y ? 'selected' : ''}>${y}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Row 4: Position, Team -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px">
            <div class="form-group">
              <label class="form-label">ตำแหน่ง</label>
              <select id="empPos" onchange="handlePosChange()" class="form-input" style="appearance:auto">
                <option value="" disabled ${!isEdit ? 'selected' : ''}>เลือกตำแหน่ง</option>
                ${uniquePositions.map(p => `<option value="${p}" ${isEdit && emp.pos === p ? 'selected' : ''}>${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">ทีม</label>
              <select id="empTeam" onchange="handleTeamChange()" class="form-input" style="appearance:auto">
                <option value="" disabled ${!isEdit ? 'selected' : ''}>เลือกทีม</option>
                <option value="ACE" ${isEdit && emp.dept === 'ACE' ? 'selected' : ''}>ACE</option>
                <option value="Sertec" ${isEdit && emp.dept === 'Sertec' ? 'selected' : ''}>Sertec</option>
                <option value="ONIX" ${isEdit && emp.dept === 'ONIX' ? 'selected' : ''}>ONIX</option>
                <option value="Sale Support" ${isEdit && emp.dept === 'Sale Support' ? 'selected' : ''}>Sale Support</option>
                <option value="Call Center" ${isEdit && emp.dept === 'Call Center' ? 'selected' : ''}>Call Center</option>
              </select>
            </div>
          </div>

          <!-- Row 5: Shift, Offdays -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px">
            <div class="form-group">
              <label class="form-label">กะเวลาทำงาน</label>
              <select id="empShift" class="form-input" style="appearance:auto">
                <option value="" disabled ${!isEdit ? 'selected' : ''}>เลือกกะเวลา</option>
                <option value="06:00 - 15:00" ${isEdit && emp.shift === '06:00 - 15:00' ? 'selected' : ''}>06:00 - 15:00</option>
                <option value="09:00 - 18:00" ${isEdit && emp.shift === '09:00 - 18:00' ? 'selected' : ''}>09:00 - 18:00</option>
                <option value="15:00 - 00:00" ${isEdit && emp.shift === '15:00 - 00:00' ? 'selected' : ''}>15:00 - 00:00</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">วันหยุด</label>
              <select id="empOff" class="form-input" style="appearance:auto">
                <option value="" disabled ${!isEdit ? 'selected' : ''}>เลือกวันหยุด</option>
                <option value="เสาร์ - อาทิตย์" ${isEdit && emp.offdays === 'เสาร์ - อาทิตย์' ? 'selected' : ''}>เสาร์ - อาทิตย์</option>
                <option value="จันทร์ - อังคาร" ${isEdit && emp.offdays === 'จันทร์ - อังคาร' ? 'selected' : ''}>จันทร์ - อังคาร</option>
                <option value="พุธ - พฤหัสบดี" ${isEdit && emp.offdays === 'พุธ - พฤหัสบดี' ? 'selected' : ''}>พุธ - พฤหัสบดี</option>
              </select>
            </div>
          </div>

          <!-- Row 6: Type, Status -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
            <div class="form-group">
              <label class="form-label">ประเภทพนักงาน</label>
              <select id="empType" onchange="handleTypeChange()" class="form-input" style="appearance:auto">
                <option value="" disabled ${!isEdit ? 'selected' : ''}>เลือกประเภท</option>
                <option value="พนักงานประจำ" ${isEdit && emp.empType === 'พนักงานประจำ' ? 'selected' : ''}>พนักงานประจำ</option>
                <option value="พนักงานสัญญาจ้าง" ${isEdit && emp.empType === 'พนักงานสัญญาจ้าง' ? 'selected' : ''}>พนักงานสัญญาจ้าง</option>
                <option value="พนักงานทดลองงาน" ${isEdit && emp.empType === 'พนักงานทดลองงาน' ? 'selected' : ''}>พนักงานทดลองงาน</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">สถานะ</label>
              <select id="empStatus" class="form-input" style="appearance:auto">
                <option value="active" ${(!isEdit || emp.status === 'active') ? 'selected' : ''}>ปฏิบัติงาน</option>
                <option value="resigned" ${isEdit && emp.status === 'resigned' ? 'selected' : ''}>ลาออก</option>
              </select>
            </div>
          </div>

        </div>

        <div style="padding:20px 28px; background:var(--surface2); border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:8px">
          <button onclick="document.getElementById('${modalId}').remove()" class="btn btn-outline">ยกเลิก</button>
          <button id="saveEmpBtn" onclick="submitEmployeeData('${editId || ''}')" class="btn btn-primary" style="min-width:140px">
            <i data-lucide="save" style="width:16px; height:16px"></i> ${isEdit ? 'อัปเดตข้อมูล' : 'บันทึกพนักงาน'}
          </button>
        </div>
      </div>
    </div>
    <style>
      @keyframes modalIn __OPEN__ from __OPEN__ opacity: 0; transform: translateY(20px); __CLOSE__ to __OPEN__ opacity: 1; transform: translateY(0); __CLOSE__ __CLOSE__
    </style>
  `.replace(/__OPEN__/g, '{').replace(/__CLOSE__/g, '}');

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });

    // Pre-select birthday dropdowns if editing
    if (isEdit && emp.birthdate) {
      const parts = emp.birthdate.split('/');
      if (parts.length === 3) {
        document.getElementById('empBirthDay').value = parseInt(parts[0]);
        document.getElementById('empBirthMonth').value = parseInt(parts[1]);
      }
    }

    // Handle position/team/type changes to disable/enable fields
    window.handlePosChange = function () {
      const pos = document.getElementById('empPos').value;
      const teamSelect = document.getElementById('empTeam');
      const shiftSelect = document.getElementById('empShift');
      const offSelect = document.getElementById('empOff');
      const type = document.getElementById('empType').value;
      const team = teamSelect.value;

      // Director or Contract: No team
      if (pos === 'Director' || type === 'พนักงานสัญญาจ้าง') {
        teamSelect.value = "";
        teamSelect.disabled = true;
        teamSelect.style.background = "#f1f5f9";
      } else {
        teamSelect.disabled = false;
        teamSelect.style.background = "#fff";
      }

      // Team Call Center: No shift, no offdays
      if (team === 'Call Center') {
        shiftSelect.value = "";
        shiftSelect.disabled = true;
        shiftSelect.style.background = "#f1f5f9";
        offSelect.value = "";
        offSelect.disabled = true;
        offSelect.style.background = "#f1f5f9";
      } else {
        shiftSelect.disabled = false;
        shiftSelect.style.background = "#fff";
        offSelect.disabled = false;
        offSelect.style.background = "#fff";
      }
    };

    window.handleTypeChange = function () {
      handlePosChange();
    };

    window.handleTeamChange = function () {
      handlePosChange();
    };

    // Initial call if editing
    if (isEdit) handlePosChange();
  }

  window.submitEmployeeData = async function (editId = "") {
    const isEdit = !!editId;
    const btn = document.getElementById('saveEmpBtn');

    // Get digits and combine with RS prefix
    const digits = document.getElementById('empIdDigits').value.trim();
    const id = "RS" + digits;

    const name = document.getElementById('empName').value;
    const nameEn = document.getElementById('empNameEn').value;
    const nick = document.getElementById('empNick').value;


    // Get birthday from 3 dropdowns
    const bDay = document.getElementById('empBirthDay').value;
    const bMonth = document.getElementById('empBirthMonth').value;
    const bYear = document.getElementById('empBirthYear').value;
    // ปีเกิดไม่จำเป็นต้องระบุ ถ้าระบุวันและเดือนแล้ว ปีจะใส่เป็น - หากไม่ได้เลือก
    const birth = (bDay && bMonth) ? `${bDay}/${bMonth}/${bYear || '-'}` : "-";

    const pos = document.getElementById('empPos').value;
    const team = document.getElementById('empTeam').value;
    const status = document.getElementById('empStatus').value;
    const shift = document.getElementById('empShift').value;
    const off = document.getElementById('empOff').value;
    const empType = document.getElementById('empType').value;

    // New Email logic with domain lock
    const emailUser = document.getElementById('empEmailUser').value.trim();
    const email = emailUser ? `${emailUser}@realsmart.co.th` : '';

    if (!digits || !name || !nick) { showAlert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกรหัส ชื่อ และชื่อเล่นพนักงาน', 'warning'); return; }

    if ((bDay || bMonth) && (!bDay || !bMonth)) {
      showAlert('ข้อมูลไม่สมบูรณ์', 'กรุณาเลือกทั้งวันและเดือนเกิดให้ครบถ้วน', 'warning');
      return;
    }
    if (!pos) { showAlert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกตำแหน่งของพนักงาน', 'warning'); return; }

    if (pos !== 'Director' && empType !== 'พนักงานสัญญาจ้าง' && !team) { showAlert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกทีมที่พนักงานสังกัด', 'warning'); return; }
    if (team !== 'Call Center' && !shift) { showAlert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกกะเวลาทำงาน', 'warning'); return; }
    if (team !== 'Call Center' && !off) { showAlert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกวันหยุดพนักงาน', 'warning'); return; }

    if (!empType) { showAlert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกประเภทพนักงาน', 'warning'); return; }
    if (!status) { showAlert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกสถานะปัจจุบัน', 'warning'); return; }

    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="spin" data-lucide="refresh-cw" style="width:16px; height:16px; animation:spin 1s linear infinite"></i> กำลังบันทึก...';
    btn.disabled = true;
    if (window.lucide) lucide.createIcons({ root: btn });

    const payload = {
      action: isEdit ? 'edit' : 'add',
      id: id.trim(),
      name: name.trim(),
      nameEn: nameEn.trim(),
      nickname: nick || '-',
      email: email || '-', // Capture email
      birthdate: birth || '-',
      position: pos || '-',
      team: team || '-',
      shift: shift || '-',
      offdays: off || '-',
      status: status,
      empType: empType
    };

    try {
      const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';

      console.log("Submitting Employee Data...", payload);

      // ส่งข้อมูลแบบ fetch
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });

      console.log("Sync request sent to Google Sheets");

      // อัปเดตข้อมูลใน DATA object (Client-side)
      if (isEdit) {
        const idx = DATA.employees.findIndex(e => e.id === editId);
        if (idx !== -1) {
          DATA.employees[idx] = {
            ...DATA.employees[idx],
            ...payload,
            dept: payload.team,
            pos: payload.position
          };
        }
      } else {
        DATA.employees.push({
          ...payload,
          dept: payload.team,
          pos: payload.position
        });
      }

      // ปิด Modal และแสดงผลใหม่
      if (document.getElementById('addEmployeeModal')) {
        document.getElementById('addEmployeeModal').remove();
      }
      const contentEl = document.getElementById('pageContent');
      if (contentEl) {
        contentEl.innerHTML = pageEmployee();
        if (window.lucide) lucide.createIcons({ root: contentEl });
        setTimeout(initEmployeeCharts, 100);
      }

      showToast(isEdit ? 'Data updated successfully' : 'New employee added successfully', 'success');

    } catch (err) {
      console.error("Submission Error:", err);
      if (typeof showToast === 'function') showToast('Error submitting data', 'error');
    } finally {
      if (btn) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        if (window.lucide) lucide.createIcons({ root: btn });
      }
    }
  }

  window.editEmployee = function (id) {
    window.openEmployeeModal(id);
  }

  window.deleteEmployee = async function (id) {
    showConfirmModal({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to permanently delete employee ' + id + '? This action cannot be undone.',
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';

          // ส่งคำสั่งลบไปที่ GAS แบบ fetch
          await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'delete', id: id })
          });

          // ลบออกจากตัวแปรในเครื่องด้วยเพื่อให้หน้าจออัปเดตทันที
          DATA.employees = DATA.employees.filter(e => e.id !== id);

          const contentEl = document.getElementById('pageContent');
          if (contentEl) {
            contentEl.innerHTML = pageEmployee();
            if (window.lucide) lucide.createIcons({ root: contentEl });
            setTimeout(initEmployeeCharts, 100);
          }

          showToast('Data deleted successfully', 'success');
        } catch (err) {
          console.error("Error deleting employee:", err);
          showToast('Error deleting data', 'error');
        }
      }
    });
  }

  window.showConfirmModal = function (options) {
    const modalId = 'confirmModal_' + Date.now();
    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.4); backdrop-filter:blur(4px); z-index:9999; display:flex; align-items:center; justify-content:center; animation: fadeIn 0.2s ease-out">
      <div style="background:#fff; width:100%; max-width:400px; border-radius:20px; box-shadow:0 20px 50px rgba(0,0,0,0.15); padding:30px; position:relative; animation: slideUp 0.3s ease-out">
        <div style="text-align:center; margin-bottom:20px">
          <div style="width:60px; height:60px; background:${options.type === 'danger' ? '#fee2e2' : '#e0f2fe'}; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px">
            <i data-lucide="${options.type === 'danger' ? 'trash-2' : 'alert-circle'}" style="width:28px; height:28px; color:${options.type === 'danger' ? '#ef4444' : '#0ea5e9'}"></i>
          </div>
          <h3 style="font-family:Kanit; font-size:1.2rem; font-weight:700; color:#1e293b; margin:0 0 10px">${options.title}</h3>
          <p style="font-family:Kanit; font-size:.9rem; color:#64748b; line-height:1.6; margin:0">${options.message}</p>
        </div>
        <div style="display:flex; gap:8px">
          <button id="cancelBtn_${modalId}" style="flex:1; padding:12px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-family:Kanit; font-size:.9rem; font-weight:600; color:#64748b; cursor:pointer; transition:all 0.2s">
            ${options.cancelText || 'ยกเลิก'}
          </button>
          <button id="confirmBtn_${modalId}" style="flex:1; padding:12px; border-radius:12px; border:none; background:${options.type === 'danger' ? '#ef4444' : '#6366f1'}; font-family:Kanit; font-size:.9rem; font-weight:600; color:#fff; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 12px ${options.type === 'danger' ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}">
            ${options.confirmText || 'ยืนยัน'}
          </button>
        </div>
      </div>
    </div>
    <style>
      @keyframes slideUp __OPEN__
        from __OPEN__ transform: translateY(20px); opacity: 0; __CLOSE__
        to __OPEN__ transform: translateY(0); opacity: 1; __CLOSE__
      __CLOSE__
      #cancelBtn_${modalId}:hover __OPEN__ background: #f8fafc; color: #1e293b; __CLOSE__
      #confirmBtn_${modalId}:hover __OPEN__ transform: translateY(-2px); box-shadow: 0 6px 15px ${options.type === 'danger' ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.4)'}; __CLOSE__
    </style>
  `.replace(/__OPEN__/g, '{').replace(/__CLOSE__/g, '}');

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });

    const modalEl = document.getElementById(modalId);
    const confirmBtn = document.getElementById('confirmBtn_' + modalId);
    const cancelBtn = document.getElementById('cancelBtn_' + modalId);

    const closeModal = () => {
      modalEl.style.opacity = '0';
      modalEl.style.transition = 'opacity 0.2s';
      setTimeout(() => modalEl.remove(), 200);
    };

    confirmBtn.onclick = () => {
      closeModal();
      if (options.onConfirm) options.onConfirm();
    };

    cancelBtn.onclick = () => {
      closeModal();
      if (options.onCancel) options.onCancel();
    };
  }

  window.showToast = function (message, type = 'success') {
    const toastId = 'toast_' + Date.now();
    const html = `
    <div id="${toastId}" style="position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.1); padding:12px 20px; display:flex; align-items:center; gap:12px; z-index:99999; animation: toastIn 0.3s ease-out; border-left:4px solid ${type === 'success' ? '#10b981' : '#ef4444'}">
      <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" style="width:18px; height:18px; color:${type === 'success' ? '#10b981' : '#ef4444'}"></i>
      <span style="font-family:Kanit; font-size:.8rem; font-weight:600; color:#1e293b">${message}</span>
    </div>
    <style>
      @keyframes toastIn __OPEN__
        from __OPEN__ transform: translate(-50%, 20px); opacity: 0; __CLOSE__
        to __OPEN__ transform: translate(-50%, 0); opacity: 1; __CLOSE__
      __CLOSE__
    </style>
  `.replace(/__OPEN__/g, '{').replace(/__CLOSE__/g, '}');
    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(toastId) });
    setTimeout(() => {
      const el = document.getElementById(toastId);
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, -10px)';
        el.style.transition = 'all 0.3s';
        setTimeout(() => el.remove(), 300);
      }
    }, 3000);
  }

  window.toggleActionMenu = function (id, event) {
    event.stopPropagation();
    const menu = document.getElementById('actionMenu_' + id);
    const isOpen = menu.style.display === 'block';

    // Close all other menus
    document.querySelectorAll('[id^="actionMenu_"]').forEach(m => m.style.display = 'none');

    if (!isOpen) {
      menu.style.display = 'block';
    }
  }

  // Close menus when clicking outside
  document.addEventListener('click', function () {
    document.querySelectorAll('[id^="actionMenu_"]').forEach(m => m.style.display = 'none');
  });

  window.searchLeaveTable = function () {
    const query = document.getElementById('leaveSearch').value.toLowerCase();
    const activeTab = document.querySelector('.leave-tab.active');
    let status = 'all';
    if (activeTab) {
      const onclickAttr = activeTab.getAttribute('onclick');
      const match = onclickAttr.match(/'([^']+)'/);
      if (match) status = match[1];
    }
    window.filterLeaveTable(status, activeTab, query);
  }

  window.filterLeaveTable = function (status, el, query = '') {
    // Update Sidebar UI
    if (el) {
      document.querySelectorAll('.leave-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.background = 'transparent';
        tab.style.color = '#64748b';
      });
      el.classList.add('active');
      el.style.background = 'var(--primary)10';
      el.style.color = 'var(--primary)';
    }

    // Get search query if not provided
    if (!query) {
      const searchInput = document.getElementById('leaveSearch');
      query = searchInput ? searchInput.value.toLowerCase() : '';
    }

    // Get Date Range from Flatpickr
    let dateStart = null, dateEnd = null;
    const drpInput = document.querySelector('[id^="drp_"]:not([id$="_from"]):not([id$="_to"]):not([id$="_wrap"])');
    if (drpInput && drpInput._flatpickr && drpInput._flatpickr.selectedDates.length > 0) {
      const dates = drpInput._flatpickr.selectedDates;
      dateStart = dates[0];
      dateEnd = dates[1] || dates[0]; // If single date selected, use it for both

      // Set to start/end of day for accurate comparison
      dateStart.setHours(0, 0, 0, 0);
      dateEnd.setHours(23, 59, 59, 999);
    }

    // Filter Table Rows
    const rows = document.querySelectorAll('#leaveTableBody tr');
    rows.forEach(row => {
      const rowStatus = row.getAttribute('data-status');
      const rowStart = row.getAttribute('data-start');
      const rowEnd = row.getAttribute('data-end');
      const rowText = row.innerText.toLowerCase();

      // Normalize status names
      const statusMap = {
        'pending': 'pending', 'รอการอนุมัติ': 'pending',
        'approved': 'approved', 'อนุมัติแล้ว': 'approved',
        'rejected': 'rejected', 'ไม่นุมัติ': 'rejected'
      };
      const normalizedRowStatus = statusMap[rowStatus] || rowStatus;

      const matchesStatus = (status === 'all' || normalizedRowStatus === status);
      const matchesSearch = rowText.includes(query);

      // Date Filtering
      let matchesDate = true;
      if (dateStart && rowStart && rowEnd) {
        const rs = new Date(rowStart);
        const re = new Date(rowEnd);
        rs.setHours(0, 0, 0, 0);
        re.setHours(0, 0, 0, 0);

        // Check overlap: (LeaveStart <= RangeEnd) AND (LeaveEnd >= RangeStart)
        matchesDate = (rs <= dateEnd && re >= dateStart);
      }

      if (matchesStatus && matchesSearch && matchesDate) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  window.handleEmpDragStart = function (e, dept, index) {
    window._draggedEmp = { dept: dept, index: index };
    e.dataTransfer.setData('text/plain', 'dragging_employee'); // Dummy data for browser compatibility
    e.target.closest('tr').style.opacity = '0.5';
  };

  window.handleEmpDrop = function (e, dept, dropIndex) {
    e.preventDefault();
    const tr = e.target.closest('tr');
    if (tr) tr.style.background = '#fcfdfe';

    try {
      if (!window._draggedEmp) return;

      const dragIndex = window._draggedEmp.index;
      const dragDept = window._draggedEmp.dept;

      // Clear global state
      window._draggedEmp = null;

      if (dragDept !== dept) {
        if (typeof showToast === 'function') showToast('Cannot move across teams at this time.', 'error');
        return;
      }
      if (dragIndex === dropIndex) return;

      const employees = DATA.employees || [];
      const storedCustomOrder = JSON.parse(localStorage.getItem('customEmpOrder') || '{}');
      if (window._customEmpOrder) Object.assign(storedCustomOrder, window._customEmpOrder);

      const deptMembers = employees
        .filter(emp => {
          const eDept = String(emp.dept || 'Other').trim().toLowerCase();
          const tDept = String(dept).trim().toLowerCase();
          return eDept === tDept;
        })
        .sort((a, b) => {
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

      let customOrder = deptMembers.map(emp => emp.id);

      // Move element
      const movedItemId = customOrder.splice(dragIndex, 1)[0];
      customOrder.splice(dropIndex, 0, movedItemId);

      // Save locally
      const newStored = JSON.parse(localStorage.getItem('customEmpOrder') || '{}');
      newStored[dept] = customOrder;
      localStorage.setItem('customEmpOrder', JSON.stringify(newStored));
      window._customEmpOrder = newStored;

      // Send to Google Sheets via Hidden Form
      apiUpdateEmployeeRanks(dept, customOrder);

      // Save scroll position and update UI smoothly
      window._isReordering = true;
      const wrap = document.getElementById('scheduleTableWrap');
      const sTop = wrap ? wrap.scrollTop : 0;
      const sLeft = wrap ? wrap.scrollLeft : 0;

      const contentEl = document.getElementById('pageContent');
      if (contentEl) {
        contentEl.innerHTML = pageSchedule();
        if (window.lucide) window.lucide.createIcons({ root: contentEl });

        const newWrap = document.getElementById('scheduleTableWrap');
        if (newWrap) {
          newWrap.scrollTop = sTop;
          newWrap.scrollLeft = sLeft;
        }
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
  };
  window.toggleManageSchedule = function () {
    window.IS_MANAGE_SCHEDULE_MODE = !window.IS_MANAGE_SCHEDULE_MODE;

    const btn = document.querySelector('button[onclick="toggleManageSchedule()"]');
    if (btn) {
      if (window.IS_MANAGE_SCHEDULE_MODE) {
        btn.style.background = 'var(--primary)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--primary)';
      } else {
        btn.style.background = '#fff';
        btn.style.color = '#text-2';
        btn.style.borderColor = 'var(--border)';
      }
    }

    const contentEl = document.getElementById('pageContent');
    if (contentEl) {
      contentEl.innerHTML = pageSchedule();
      if (window.lucide) window.lucide.createIcons({ root: contentEl });
    }
  }

  window.renderEmpeoReport = function() {
  if (!window._empeoDataLoaded) {
      window.loadEmpeoData();
      return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; color: var(--text-3);">
          <div style="width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: rotation 1s linear infinite; margin-bottom: 16px;"></div>
          <div style="font-size: 1.1rem; font-weight: 600; font-family: Kanit, sans-serif; color: var(--text-2);">Loading...</div>
        </div>
      `;
  }

  let startDate, endDate;
  if (window._leaveDateRange && window._leaveDateRange.includes(' to ')) {
      const [s, e] = window._leaveDateRange.split(' to ');
      startDate = new Date(s);
      endDate = new Date(e);
  } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  
  startDate.setHours(0,0,0,0);
  endDate.setHours(23,59,59,999);

  const days = [];
  const thNames = ['อา','จ','อ','พ','พฤ','ศ','ส'];
  let curr = new Date(startDate);
  let count = 0;
  const toLocalISOString = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
  };

  while (curr <= endDate && count < 100) {
      days.push({
          dateObj: new Date(curr),
          isoStr: toLocalISOString(curr),
          dayNum: curr.getDate(),
          dayOfWeek: thNames[curr.getDay()],
          monthNum: curr.getMonth() + 1,
          yearNum: curr.getFullYear()
      });
      curr.setDate(curr.getDate() + 1);
      count++;
  }
  
  const deptEmployees = window.DATA.employees || [];
  const deptEmpIds = new Set(deptEmployees.map(e => String(e.id).trim()));
  const allEmpeoEmployees = window.DATA.empeoEmployees || [];
  const employees = deptEmpIds.size > 0 
      ? allEmpeoEmployees.filter(e => deptEmpIds.has(String(e.id).trim()))
      : allEmpeoEmployees;
  
  // Custom Thai Date formatting helper
  window.formatDateRangeTH = function(sDate, eDate) {
      const monthNamesShortTH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
      const sy = sDate.getFullYear() + 543;
      const sm = monthNamesShortTH[sDate.getMonth()];
      const sd = sDate.getDate();
      
      const ey = eDate.getFullYear() + 543;
      const em = monthNamesShortTH[eDate.getMonth()];
      const ed = eDate.getDate();
      
      if (sy === ey && sDate.getMonth() === eDate.getMonth()) {
          return `${sd} - ${ed} ${sm} ${sy}`;
      } else if (sy === ey) {
          return `${sd} ${sm} - ${ed} ${em} ${sy}`;
      } else {
          return `${sd} ${sm} ${sy} - ${ed} ${em} ${ey}`;
      }
  }

    const monthNamesTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const monthTitle = (window._leaveDateRange && window._leaveDateRange.includes(' to '))
    ? formatDateRangeTH(startDate, endDate)
    : `${monthNamesTH[startDate.getMonth()]} ${startDate.getFullYear() + 543}`;
  
  let totalLateMins = 0;
  let totalLeaveEarlyMins = 0;
  let totalAbsent = 0;
  let totalSick = 0;
  let totalVacation = 0;
  let totalPersonal = 0;
  let totalOther = 0;

  // Pre-calculate dynamic summaries for all employees to use for KPI and table rows
  const employeeSummaries = {};
  
  employees.forEach(r => {
      let sum = {
          absent: 0,
          lateTimes: 0,
          lateMins: 0,
          leaveEarlyTimes: 0,
          leaveEarlyMins: 0,
          forgetIn: 0,
          forgetOut: 0,
          sickLeave: 0,
          personalLeave: 0,
          vacationLeave: 0,
          otherLeave: 0
      };
      
      const cal = (window.DATA.empeoCalendar && window.DATA.empeoCalendar[r.id]) || {};
      const dailyLateMins = (window.DATA.empeoDailyLateMins && window.DATA.empeoDailyLateMins[r.id]) || {};
      const dailyLeaveEarlyMins = (window.DATA.empeoDailyLeaveEarlyMins && window.DATA.empeoDailyLeaveEarlyMins[r.id]) || {};
      
      days.forEach(d => {
          let status = cal[d.isoStr] ? String(cal[d.isoStr]).trim() : '';
          if (status === 'A') {
              sum.absent++;
          } else if (status === 'L') {
              sum.lateTimes++;
              sum.lateMins += (dailyLateMins[d.isoStr] || 0);
          } else if (status === 'E') {
              sum.leaveEarlyTimes++;
              sum.leaveEarlyMins += (dailyLeaveEarlyMins[d.isoStr] || 0);
          } else if (status === 'NI') {
              sum.forgetIn++;
          } else if (status === 'NO') {
              sum.forgetOut++;
          } else if (status === 'S' || status === 'SO') {
              sum.sickLeave++;
          } else if (status === 'B' || status === 'BO') {
              sum.personalLeave++;
          } else if (status === 'V') {
              sum.vacationLeave++;
          } else if (status === 'OL') {
              sum.otherLeave++;
          }
      });
      
      sum.lateMins = Math.round(sum.lateMins);
      sum.leaveEarlyMins = Math.round(sum.leaveEarlyMins);
      
      employeeSummaries[r.id] = sum;
      
      totalLateMins += sum.lateMins;
      totalLeaveEarlyMins += sum.leaveEarlyMins;
      totalAbsent += sum.absent;
      totalSick += sum.sickLeave;
      totalVacation += sum.vacationLeave;
      totalPersonal += sum.personalLeave;
      totalOther += sum.otherLeave;
  });

  const fmt = (n) => Number(n || 0).toLocaleString();

  const holidays = window.HOLIDAYS || {};
  const getHolidayName = d => holidays[`${d.monthNum}-${d.dayNum}`] || '';
  const cellBg = d => {
    if (getHolidayName(d)) return '#fff7ed';
    const dow = d.dateObj.getDay();
    return (dow===0 || dow===6) ? '#f1f5f9' : '';
  };
  const headerBg = d => {
    if (getHolidayName(d)) return '#fed7aa';
    const dow = d.dateObj.getDay();
    return (dow===0 || dow===6) ? '#e2e8f0' : '#f8fafc';
  };
  
  let daysHeadersCombined = days.map(d => {
    const hName = getHolidayName(d);
    const title = hName ? ` title="${hName}"` : '';
    const starMark = hName ? `<span style='color:#f97316;font-size:.5rem'>??.</span>` : '';
    return `<th class="empeo-day-th" style="font-size:.6rem; text-align:center; position:sticky; top:36px; background:${headerBg(d)}; z-index:10; min-width:26px; padding:3px 2px 4px; border-bottom:2px solid var(--border); white-space:nowrap; line-height:1.4; cursor:${hName?'help':'default'}"${title}>${d.dayNum}${starMark}<br><span style='font-size:.55rem;color:${hName?'#f97316':'var(--text-3)'}'>${d.dayOfWeek}</span></th>`;
  }).join('');
  
  let rowsHtml = employees.map(r => {
      let sum = employeeSummaries[r.id] || {};
      let cal = (window.DATA.empeoCalendar && window.DATA.empeoCalendar[r.id]) || {};
      
      let dailyCells = days.map(d => {
         let dStr = d.isoStr;
         let status = cal[dStr] ? String(cal[dStr]).trim() : '';
         let color = '#000000';
         let bgColor = cellBg(d) || 'transparent';
         
         const hName = getHolidayName(d);
         if (!status && hName) bgColor = '#fff7ed';
         
         const hTitle = hName ? ` title="${hName}"` : '';
         return `<td style="font-size:.65rem; text-align:center; font-weight:normal; color:${color}; padding:4px; background:${bgColor}"${hTitle}>${status}</td>`;
      }).join('');
      
      return `
        <tr class="empeo-row">
          <td style="font-size:.7rem; text-align:center; font-family:'Kanit', sans-serif; position:sticky; left:0; background:#fff; z-index:5; box-shadow: 2px 0 5px -2px rgba(0,0,0,0.05); min-width:60px">${r.id || '-'}</td>
          <td style="font-size:.7rem; font-weight:500; position:sticky; left:60px; background:#fff; z-index:5; box-shadow: 2px 0 5px -2px rgba(0,0,0,0.05); min-width:120px" class="emp-name">${r.name || '-'}</td>
          ${dailyCells}
          <td style="font-size:.7rem; text-align:center; background:#fef2f2; color:${sum.absent > 0 ? '#ef4444' : 'inherit'}; font-weight:${sum.absent > 0 ? '700' : 'normal'}">${sum.absent || 0}</td>
          <td style="font-size:.7rem; text-align:center; background:#fffbeb; color:${sum.lateTimes > 0 ? '#f59e0b' : 'inherit'}; font-weight:${sum.lateTimes > 0 ? '700' : 'normal'}">${sum.lateTimes || 0}</td>
          <td style="font-size:.7rem; text-align:center; background:#fffbeb; color:${sum.lateMins > 0 ? '#f59e0b' : 'inherit'}; font-weight:${sum.lateMins > 0 ? '700' : 'normal'}">${sum.lateMins || 0}</td>
          <td style="font-size:.7rem; text-align:center; background:#fffbeb">${sum.leaveEarlyTimes || 0}</td>
          <td style="font-size:.7rem; text-align:center; background:#fffbeb">${sum.leaveEarlyMins || 0}</td>
          <td style="font-size:.7rem; text-align:center; background:#fdf4ff">${sum.forgetIn || 0}</td>
          <td style="font-size:.7rem; text-align:center; background:#fdf4ff">${sum.forgetOut || 0}</td>
          <td style="font-size:.7rem; text-align:center; background:#f0fdf4">${sum.sickLeave || 0}</td>
          <td style="font-size:.7rem; text-align:center; background:#f0fdfa">${sum.personalLeave || 0}</td>
          <td style="font-size:.7rem; text-align:center; background:#f5f3ff">${sum.vacationLeave || 0}</td>
          <td style="font-size:.7rem; text-align:center; background:#f8fafc">${sum.otherLeave || 0}</td>
        </tr>
      `;
  }).join('');

  return `
    <!-- KPI Row for Empeo -->
    <div class="fade-in" style="display:grid; grid-template-columns:repeat(7,1fr); gap:16px; margin-bottom:24px">
      ${[
          { label: 'ขาดงาน', val: fmt(totalAbsent) + ' วัน', sub: 'ไม่รวมวันหยุด', icon: 'user-x', color: '#EF4444' },
          { label: 'มาสาย', val: fmt(totalLateMins) + ' นาที', sub: 'รวมทุกแผนก', icon: 'clock', color: '#F87171' },
          { label: 'กลับก่อน', val: fmt(totalLeaveEarlyMins) + ' นาที', sub: 'รวมทุกแผนก', icon: 'log-out', color: '#FBBF24' },
          { label: 'ลาป่วย', val: fmt(totalSick) + ' วัน', sub: 'รวมทุกแผนก', icon: 'thermometer', color: '#60A5FA' },
          { label: 'ลากิจ', val: fmt(totalPersonal) + ' วัน', sub: 'รวมทุกแผนก', icon: 'briefcase', color: '#A78BFA' },
          { label: 'ลาพักร้อน', val: fmt(totalVacation) + ' วัน', sub: 'รวมทุกแผนก', icon: 'sun', color: '#34D399' },
          { label: 'ลาอื่นๆ', val: fmt(totalOther) + ' วัน', sub: 'รวมทุกแผนก', icon: 'more-horizontal', color: '#6B7280' }
      ].map(k => `
      <div class="stat-card" style="padding:16px; display:flex; flex-direction:column; gap:8px">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <div style="width:32px; height:32px; border-radius:8px; background:${k.color}15; color:${k.color}; display:flex; align-items:center; justify-content:center">
            <i data-lucide="${k.icon}" style="width:18px; height:18px"></i>
          </div>
        </div>
        <div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--text); margin-bottom:4px; font-family:'Kanit', sans-serif">${k.val}</div>
          <div style="font-size:.7rem; font-weight:600; color:var(--text-2)">${k.label}</div>
          <div style="font-size:.65rem; color:var(--text-3); margin-top:4px">${k.sub}</div>
        </div>
      </div>
      `).join('')}
    </div>
    
    <!-- Data Table -->
    <div class="card fade-in" style="padding:0; overflow:hidden">
      <div style="padding:20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
        <div style="font-size:.9rem; font-weight:700">รายงานการเข้างาน (Empeo)</div>
      </div>
      <div class="table-wrap" id="empeoTableWrap" style="overflow-x:auto; overflow-y:auto; max-height: 450px">
        <table class="data-table" id="empeoTable" style="width: max-content; min-width: 100%; border-collapse: separate; border-spacing: 0;">
          <thead id="empeoThead">
            <tr id="empeoTR1" style="height:36px">
              <th rowspan="2" style="font-size:.7rem; text-align:center; position:sticky; top:0; left:0; background:#f8fafc; z-index:30; box-shadow: 2px 0 5px -2px rgba(0,0,0,0.05); min-width:60px; padding:6px 16px; border-bottom: 2px solid var(--border);">รหัส</th>
              <th rowspan="2" style="font-size:.7rem; text-align:left; position:sticky; top:0; left:60px; background:#f8fafc; z-index:30; box-shadow: 2px 0 5px -2px rgba(0,0,0,0.05); min-width:120px; padding:6px 16px; border-bottom: 2px solid var(--border);">ชื่อ - นามสกุล</th>
              ${days.length > 0 ? `<th colspan="${days.length}" style="font-size:.75rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:20; border-bottom: 1px solid var(--border); padding:6px;">รายละเอียดการเข้างานประจำเดือน ${monthTitle}</th>` : ''}
              <th colspan="11" style="font-size:.75rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:20; border-bottom: 1px solid var(--border); border-left: 2px solid var(--border); padding:6px;">สรุปข้อมูลการเข้างาน</th>
            </tr>
            <tr id="empeoTR2">
              ${daysHeadersCombined}
              <th style="font-size:.6rem; text-align:center; background:#fef2f2; z-index:20; border-left: 2px solid var(--border); padding:6px 4px; white-space:nowrap; border-bottom: 2px solid var(--border); position:sticky; top:36px;">ขาดงาน<br>(วัน)</th>
              <th style="font-size:.6rem; text-align:center; background:#fffbeb; z-index:20; padding:6px 4px; white-space:nowrap; border-bottom: 2px solid var(--border); position:sticky; top:36px;">มาสาย<br>(ครั้ง)</th>
              <th style="font-size:.6rem; text-align:center; background:#fffbeb; z-index:20; padding:6px 4px; white-space:nowrap; border-bottom: 2px solid var(--border); position:sticky; top:36px;">มาสาย<br>(นาที)</th>
              <th style="font-size:.6rem; text-align:center; background:#fffbeb; z-index:20; padding:6px 4px; white-space:nowrap; border-bottom: 2px solid var(--border); position:sticky; top:36px;">กลับก่อน<br>(ครั้ง)</th>
              <th style="font-size:.6rem; text-align:center; background:#fffbeb; z-index:20; padding:6px 4px; white-space:nowrap; border-bottom: 2px solid var(--border); position:sticky; top:36px;">กลับก่อน<br>(นาที)</th>
              <th style="font-size:.6rem; text-align:center; background:#fdf4ff; z-index:20; padding:6px 4px; white-space:nowrap; border-bottom: 2px solid var(--border); position:sticky; top:36px;">เวลาทำโอที<br>(ชั่วโมง)</th>
              <th style="font-size:.6rem; text-align:center; background:#fdf4ff; z-index:20; padding:6px 4px; white-space:nowrap; border-bottom: 2px solid var(--border); position:sticky; top:36px;">เวลาทำโอที<br>(นาที)</th>
              <th style="font-size:.6rem; text-align:center; background:#f0fdf4; z-index:20; padding:6px 4px; white-space:nowrap; border-bottom: 2px solid var(--border); position:sticky; top:36px;">ลาป่วย<br>(วัน)</th>
              <th style="font-size:.6rem; text-align:center; background:#f0fdfa; z-index:20; padding:6px 4px; white-space:nowrap; border-bottom: 2px solid var(--border); position:sticky; top:36px;">ลากิจ<br>(วัน)</th>
              <th style="font-size:.6rem; text-align:center; background:#f5f3ff; z-index:20; padding:6px 4px; white-space:nowrap; border-bottom: 2px solid var(--border); position:sticky; top:36px;">ลาพักร้อน<br>(วัน)</th>
              <th style="font-size:.6rem; text-align:center; background:#f8fafc; z-index:20; padding:6px 4px; white-space:nowrap; border-bottom: 2px solid var(--border); position:sticky; top:36px;">ลาอื่นๆ<br>(วัน)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
      
      <div style="padding:16px 20px; font-size:.65rem; color:var(--text-3); background:#f8fafc; border-top:1px solid var(--border); border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
          <b style="color:var(--text-2)">คำอธิบายสัญลักษณ์:</b> &nbsp;
          / = ทำงานปกติ, A = ขาดงาน, L = ลาหยุด, E = มาสาย/กลับก่อน, NI = ไม่ได้สแกนเข้า, NO = ไม่ได้สแกนออก, H = วันหยุด, HW = ทำงานวันหยุด, ET = ล่วงเวลา, 
          S = ลาป่วย, B = ลากิจ, SO = ลาป่วยไม่รับค่าจ้าง, BO = ลากิจไม่รับค่าจ้าง, V = ลาพักร้อน, OL = ลาอื่นๆ
      </div>
    </div>
  `;

};

  async function apiUpdateEmployeeRanks(dept, orderedIds) {
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';

    const payload = {
      action: 'update_ranks',
      dept: dept,
      orderedIds: orderedIds
    };

    try {
      // วิธีส่งแบบ "Hidden Form" เพื่อข้ามการบล็อก CORS ของเบราว์เซอร์
      let iframe = document.getElementById('hidden_sync_iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'hidden_sync_iframe';
        iframe.name = 'hidden_sync_iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = WEB_APP_URL;
      form.target = 'hidden_sync_iframe';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = JSON.stringify(payload);
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();

      setTimeout(() => {
        document.body.removeChild(form);
      }, 1000);

      console.log("Rank Sync: Sent via Hidden Form (Bypass Mode)");
    } catch (err) {
      console.error("Rank Sync Error:", err);
    }
  }

  // --- TEMPLATE MANAGEMENT FUNCTIONALITY ---

  window.openManageTemplatesModal = function () {
    const modalId = 'manageTemplatesModal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const templates = window.HOLIDAY_TEMPLATES || [];
    
    let listHtml = '';
    if (templates.length === 0) {
      listHtml = `
      <div style="text-align:center; padding:40px 20px; color:#64748b;">
        <i data-lucide="folder-open" style="width:48px; height:48px; margin:0 auto 12px; color:#cbd5e1; display:block"></i>
        <p style="margin:0; font-size:.9rem; font-weight:600">ยังไม่มีชุดงานมาตรฐาน (Templates)</p>
        <p style="margin:4px 0 0; font-size:.8rem">กดปุ่ม "เพิ่มชุดงานมาตรฐาน" ด้านบนเพื่อเริ่มต้นสร้าง</p>
      </div>
      `;
    } else {
      templates.forEach((tpl, tplIdx) => {
        const assignments = tpl.assignments || [];
        const totalPct = assignments.reduce((sum, a) => sum + (parseInt(a.percent) || 0), 0);
        
        let assignmentsHtml = assignments.map((a, idx) => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f1f5f9; font-size:.8rem; color:#475569">
            <div style="display:flex; align-items:center; gap:8px">
              <span style="background:#e0f2fe; color:#0369a1; width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.7rem; font-weight:700">${idx + 1}</span>
              <span style="font-weight:600; color:#1e293b">${a.project}</span>
              <span style="color:#64748b; font-size:.75rem">(${a.job})</span>
            </div>
            <span style="background:#f1f5f9; padding:2px 8px; border-radius:6px; font-weight:700; color:#475569">${a.percent}%</span>
          </div>
        `).join('');

        listHtml += `
        <div class="card" style="padding:20px; border-radius:16px; border:1px solid var(--border); margin-bottom:16px; background:#fff; transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.05)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
            <h4 style="margin:0; font-size:1rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px">
              <span style="background: rgba(79, 70, 229, 0.1); color: var(--primary); padding: 4px 10px; border-radius: 8px; font-size: .75rem; font-weight: 700">ชุดงานที่ ${tplIdx + 1}</span>
              <span style="background:linear-gradient(135deg, var(--primary) 0%, #818cf8 100%); color:#fff; padding:4px 10px; border-radius:8px; font-size:.7rem; font-weight:700">Section</span>
              ${tpl.section}
            </h4>
            <div style="display:flex; gap:8px">
              <button onclick="window.openEditTemplateModal('${tpl.id}')" style="background:#e0f2fe; border:none; color:#0369a1; padding:6px 12px; border-radius:8px; font-size:.75rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px"><i data-lucide="edit-3" style="width:12px; height:12px"></i> แก้ไข</button>
              <button onclick="window.deleteHolidayTemplate('${tpl.id}')" style="background:#fee2e2; border:none; color:#b91c1c; padding:6px 12px; border-radius:8px; font-size:.75rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px"><i data-lucide="trash-2" style="width:12px; height:12px"></i> ลบ</button>
            </div>
          </div>
          
          <div style="margin-bottom:12px">
            ${assignmentsHtml}
          </div>
          
          <div style="display:flex; align-items:center; justify-content:space-between">
            <div style="width:80%; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden">
              <div style="width:${totalPct}%; height:100%; background:linear-gradient(90deg, var(--primary) 0%, #818cf8 100%)"></div>
            </div>
            <span style="font-size:.8rem; font-weight:700; color:var(--primary)">รวม: ${totalPct}%</span>
          </div>
        </div>
        `;
      });
    }

    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:11000; backdrop-filter:blur(6px); animation: fadeIn 0.2s ease-out">
      <div class="modal-card" style="background:#fff; width:550px; max-height:85vh; display:flex; flex-direction:column; border-radius:24px; text-shadow:none; box-shadow:0 25px 50px -12px rgba(0,0,0,0.2); font-family:Kanit, sans-serif">
        <div style="padding:24px 32px 16px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
          <div>
            <h3 style="margin:0 0 4px; font-size:1.2rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px">
              <i data-lucide="settings" style="width:22px; height:22px; color:var(--primary)"></i> จัดการชุดงานมาตรฐาน (Templates)
            </h3>
            <p style="margin:0; font-size:.8rem; color:#64748b;">ชุดงานเหล่านี้จะแสดงตามการจับคู่ Section ในหน้าวันหยุดทั้งหมดทันที</p>
          </div>
          <button onclick="window.openEditTemplateModal()" class="btn btn-primary" style="display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; font-size:.7rem; font-weight:700; background:var(--primary); color:#fff; border:none; cursor:pointer">
            <i data-lucide="plus" style="width:14px; height:14px"></i> เพิ่มชุดงานมาตรฐาน
          </button>
        </div>
        
        <div style="padding:24px 32px; overflow-y:auto; flex:1; background:#f8fafc">
          ${listHtml}
        </div>

        <div style="padding:20px 32px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; flex-shrink:0;">
          <button onclick="document.getElementById('${modalId}').remove()" class="btn" style="background:#e2e8f0; color:#475569; border:none; padding:10px 24px; border-radius:12px; font-weight:700; cursor:pointer">ปิด</button>
        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });
  };

  window.openEditTemplateModal = function (tplId = null) {
    const modalId = 'editTemplateModal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const tpl = tplId ? (window.HOLIDAY_TEMPLATES || []).find(t => t.id === tplId) : null;
    const isEdit = !!tpl;

    const scopeTasks = typeof getTasksFromScope === 'function' ? getTasksFromScope() : [];
    const uniqueProjects = [...new Set(scopeTasks.map(t => t.acc))].sort();
    const projectOptions = uniqueProjects.map(proj => `
      <option value="${proj}">${proj}</option>
    `).join('');

    let projectRowsHtml = '';
    if (isEdit && tpl.assignments && tpl.assignments.length > 0) {
      projectRowsHtml = tpl.assignments.map((a, aIdx) => {
        const jobs = scopeTasks.filter(t => t.acc === a.project).map(t => t.title);
        const uniqueJobs = [...new Set(jobs)].sort();
        const jobOptions = uniqueJobs.map(job => `
          <option value="${job}" ${job === a.job ? 'selected' : ''}>${job}</option>
        `).join('');

        return `
        <div class="tpl-project-row" style="display:grid; grid-template-columns:1fr 1fr 80px auto; gap:12px; margin-bottom:12px; align-items:center;">
          <select class="htProject" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none" onchange="window.onTplProjectChange(this)">
            <option value="">-- เลือกโครงการ --</option>
            ${uniqueProjects.map(proj => `
              <option value="${proj}" ${proj === a.project ? 'selected' : ''}>${proj}</option>
            `).join('')}
          </select>
          <select class="htJob" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none" onchange="window.onTplJobChange(this)">
            <option value="">-- เลือกงาน --</option>
            ${jobOptions}
          </select>
          <div style="position:relative;">
            <input type="number" class="htPercent" value="${a.percent || 100}" min="0" max="100" readonly style="width:100%; padding:10px 24px 10px 10px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; text-align:center; background:#f1f5f9; color:#475569; font-weight:600;">
            <span style="position:absolute; right:10px; top:12px; font-size:.8rem; color:#64748b; pointer-events:none;">%</span>
          </div>
          <button type="button" class="btn-remove-project" onclick="if(document.querySelectorAll('.tpl-project-row').length > 1) { this.parentElement.remove(); window.calcTplTotalPercent(); }" style="display:${tpl.assignments.length > 1 ? 'block' : 'none'}; background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; padding:8px;">
            <i data-lucide="x" style="width:16px; height:16px; pointer-events:none"></i>
          </button>
        </div>
        `;
      }).join('');
    } else {
      projectRowsHtml = `
      <div class="tpl-project-row" style="display:grid; grid-template-columns:1fr 1fr 80px auto; gap:12px; margin-bottom:12px; align-items:center;">
        <select class="htProject" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none" onchange="window.onTplProjectChange(this)">
          <option value="">-- เลือกโครงการ --</option>
          ${projectOptions}
        </select>
        <select class="htJob" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none" onchange="window.onTplJobChange(this)">
          <option value="">-- เลือกงาน --</option>
        </select>
        <div style="position:relative;">
          <input type="number" class="htPercent" value="0" min="0" max="100" readonly style="width:100%; padding:10px 24px 10px 10px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; text-align:center; background:#f1f5f9; color:#475569; font-weight:600;">
          <span style="position:absolute; right:10px; top:12px; font-size:.8rem; color:#64748b; pointer-events:none;">%</span>
        </div>
        <button type="button" class="btn-remove-project" onclick="if(document.querySelectorAll('.tpl-project-row').length > 1) { this.parentElement.remove(); window.calcTplTotalPercent(); }" style="display:none; background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; padding:8px;">
          <i data-lucide="x" style="width:16px; height:16px; pointer-events:none"></i>
        </button>
      </div>
      `;
    }

    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:11500; backdrop-filter:blur(6px); animation: fadeIn 0.2s ease-out">
      <div class="modal-card" style="background:#fff; width:480px; max-height:90vh; overflow-y:auto; border-radius:24px; padding:32px; text-shadow:none; box-shadow:0 25px 50px -12px rgba(0,0,0,0.2); font-family:Kanit, sans-serif">
        <h3 style="margin:0 0 20px; font-size:1.25rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px">
          <i data-lucide="${isEdit ? 'edit' : 'plus-circle'}" style="width:24px; height:24px; color:var(--primary)"></i> ${isEdit ? 'แก้ไขชุดงานมาตรฐาน' : 'เพิ่มชุดงานมาตรฐาน'}
        </h3>
        
        <form id="editTemplateForm" onsubmit="event.preventDefault(); window.saveHolidayTemplate('${tplId || ''}');">
          <style>
            .ts-control {
              border-radius: 10px !important;
              padding: 10px 14px !important;
              border: 1px solid var(--border) !important;
              box-shadow: none !important;
            }
            .ts-wrapper.focus .ts-control {
              border-color: var(--primary) !important;
              box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1) !important;
            }
          </style>

          <div style="margin-bottom:20px">
            <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">เลือกชุดงาน (Section)</label>
            <select id="tplName" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none" required>
              <option value="" disabled ${!isEdit ? 'selected' : ''}>-- เลือก Section --</option>
              <option value="Operation" ${isEdit && tpl.section === 'Operation' ? 'selected' : ''}>Operation</option>
              <option value="Content & Graphics" ${isEdit && tpl.section === 'Content & Graphics' ? 'selected' : ''}>Content & Graphics</option>
              <option value="Call Center" ${isEdit && tpl.section === 'Call Center' ? 'selected' : ''}>Call Center</option>
            </select>
          </div>

          <div style="margin-bottom:20px">
            <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">กะเวลาปฏิบัติงาน (Time Shift)</label>
            <select id="tplTime" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none" required>
              <option value="" disabled ${!isEdit ? 'selected' : ''}>-- เลือกกะเวลา --</option>
              <option value="เช้าตรู่ 06.00-15.00 น." ${isEdit && tpl.time === 'เช้าตรู่ 06.00-15.00 น.' ? 'selected' : ''}>เช้าตรู่ 06.00-15.00 น.</option>
              <option value="เช้า 09.00-18.00 น." ${isEdit && tpl.time === 'เช้า 09.00-18.00 น.' ? 'selected' : ''}>เช้า 09.00-18.00 น.</option>
              <option value="สาย 12.00-21.00 น." ${isEdit && tpl.time === 'สาย 12.00-21.00 น.' ? 'selected' : ''}>สาย 12.00-21.00 น.</option>
              <option value="บ่าย 15.00-00.00 น." ${isEdit && tpl.time === 'บ่าย 15.00-00.00 น.' ? 'selected' : ''}>บ่าย 15.00-00.00 น.</option>
              <option value="ดึก 00.00-09.00 น." ${isEdit && tpl.time === 'ดึก 00.00-09.00 น.' ? 'selected' : ''}>ดึก 00.00-09.00 น.</option>
            </select>
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">โครงการและงาน (Project & Job)</label>
            <div id="tplProjectContainer">
              ${projectRowsHtml}
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
              <button type="button" onclick="window.addTplProjectRow()" style="background:none; border:none; color:var(--primary); font-size:.8rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px">
                <i data-lucide="plus-circle" style="width:16px; height:16px"></i> เพิ่มงานอื่นในเซ็ตนี้
              </button>
              <span id="tplTotalPercent" style="font-size:.8rem; font-weight:700; color:#64748b">รวม: 0%</span>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px">
            <button type="button" onclick="document.getElementById('${modalId}').remove()" class="btn" style="background:#f1f5f9; color:#475569; border:none; padding:10px 20px; border-radius:12px; font-weight:600; cursor:pointer">ยกเลิก</button>
            <button type="submit" class="btn btn-primary" style="background:var(--primary); color:#fff; border:none; padding:10px 20px; border-radius:12px; font-weight:700; cursor:pointer">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });

    // Initialize Tom Select
    if (typeof TomSelect !== 'undefined') {
      document.querySelectorAll('#' + modalId + ' select.htJob').forEach(el => {
        new TomSelect(el, { create: false, sortField: {field: "text", direction: "asc"} });
      });
    }

    window.calcTplTotalPercent();
  };

  window.addTplProjectRow = function() {
    const container = document.getElementById('tplProjectContainer');
    if (!container) return;
    const firstRow = container.querySelector('.tpl-project-row');
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
    window.calcTplTotalPercent();
  };

  window.calcTplTotalPercent = function() {
    let total = 0;
    const modal = document.getElementById('editTemplateModal');
    if (!modal) return;
    modal.querySelectorAll('.htPercent').forEach(input => {
      total += (parseInt(input.value) || 0);
    });
    const label = document.getElementById('tplTotalPercent');
    if (label) {
      label.textContent = `รวม: ${total}%`;
      label.style.color = 'var(--primary)';
    }
  };

  window.onTplProjectChange = function(el) {
    const row = el.closest('.tpl-project-row');
    const jobSelect = row ? row.querySelector('.htJob') : null;
    if (!jobSelect) return;

    const selectedProj = el.value;
    
    if (jobSelect.tomselect) {
      jobSelect.tomselect.destroy();
    }
    
    jobSelect.innerHTML = '<option value="">-- เลือกงาน --</option>';

    if (!selectedProj) {
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
    
    new TomSelect(jobSelect, { create: false, sortField: {field: "text", direction: "asc"} });
  };

  window.onTplJobChange = function (el) {
    const row = el.closest('.tpl-project-row');
    if (!row) return;
    const projSelect = row.querySelector('.htProject');
    const pctInput = row.querySelector('.htPercent');
    if (!projSelect || !pctInput) return;

    const selectedProj = projSelect.value;
    const selectedJob = el.value;

    if (!selectedProj || !selectedJob) {
      pctInput.value = '0';
      window.calcTplTotalPercent();
      return;
    }

    const scopeTasks = typeof getTasksFromScope === 'function' ? getTasksFromScope() : [];
    const matchedTask = scopeTasks.find(t => t.acc === selectedProj && t.title === selectedJob);
    if (matchedTask) {
      pctInput.value = matchedTask.hours || 0; 
    } else {
      pctInput.value = '0';
    }

    window.calcTplTotalPercent();
  };

  window.saveHolidayTemplate = function(id) {
    const nameInput = document.getElementById('tplName');
    if (!nameInput || !nameInput.value.trim()) {
      alert("กรุณากรอกชื่อชุดงาน (Section)");
      return;
    }
    const sectionName = nameInput.value.trim();
    
    const assignments = [];
    const rows = document.querySelectorAll('.tpl-project-row');
    let hasEmpty = false;
    rows.forEach(row => {
      const proj = row.querySelector('.htProject').value;
      const job = row.querySelector('.htJob').value;
      const pct = parseInt(row.querySelector('.htPercent').value) || 0;
      if (!proj || !job) {
        hasEmpty = true;
      }
      assignments.push({ project: proj, job: job, percent: pct });
    });
    
    if (hasEmpty) {
      alert("กรุณาเลือกโครงการและงานให้ครบทุกแถว");
      return;
    }
    
    const totalPct = assignments.reduce((sum, a) => sum + a.percent, 0);
    if (totalPct > 100) {
      if (!confirm(`เปอร์เซ็นต์รวมของงานอยู่ที่ ${totalPct}% (เกิน 100%) ต้องการดำเนินการต่อใช่หรือไม่?`)) {
        return;
      }
    }
    
    const tplId = id || ('HS-TPL-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    
    const timeInput = document.getElementById('tplTime');
    const timeValue = timeInput ? timeInput.value : '-';

    const tplData = {
      action: id ? 'edit' : 'add',
      id: tplId,
      date: 'TEMPLATE',
      holidayName: 'TEMPLATE',
      status: 'active',
      section: sectionName,
      person: '-',
      time: timeValue,
      assignments: JSON.stringify(assignments)
    };
    
    if (typeof apiSaveHolidayShift === 'function') {
      apiSaveHolidayShift(tplData);
    }
    
    // Update local list
    const newTpl = { id: tplId, section: sectionName, time: timeValue, assignments: assignments };
    window.HOLIDAY_TEMPLATES = window.HOLIDAY_TEMPLATES || [];
    if (id) {
      const idx = window.HOLIDAY_TEMPLATES.findIndex(t => t.id === id);
      if (idx !== -1) window.HOLIDAY_TEMPLATES[idx] = newTpl;
    } else {
      window.HOLIDAY_TEMPLATES.push(newTpl);
    }
    localStorage.setItem('holiday_templates', JSON.stringify(window.HOLIDAY_TEMPLATES));
    
    // Clear from deleted tracking if present
    let deletedIds = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem('deleted_template_ids') || '[]');
    } catch(e){}
    deletedIds = deletedIds.filter(x => x !== tplId);
    localStorage.setItem('deleted_template_ids', JSON.stringify(deletedIds));
    
    // Close template editor
    const editModal = document.getElementById('editTemplateModal');
    if (editModal) editModal.remove();
    
    // Re-open Manage Templates modal
    window.openManageTemplatesModal();
    
    // Refresh page
    if (window.currentPage === 'public-holiday') {
      navigate('public-holiday');
    }
  };

  window.deleteHolidayTemplate = function(id) {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบชุดงานมาตรฐานนี้? การลบจะทำให้ตารางวันหยุดทุกวันหยุดเปลี่ยนไปใช้ค่าดั้งเดิมที่เคยเซฟไว้")) return;
    if (typeof apiSaveHolidayShift === 'function') {
      apiSaveHolidayShift({ action: 'delete', id: id });
    }
    
    // Also update local list and re-render
    window.HOLIDAY_TEMPLATES = (window.HOLIDAY_TEMPLATES || []).filter(t => t.id !== id);
    localStorage.setItem('holiday_templates', JSON.stringify(window.HOLIDAY_TEMPLATES));
    
    // Add to deleted tracking to prevent reappearances from stale CSV
    let deletedIds = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem('deleted_template_ids') || '[]');
    } catch(e){}
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
    }
    localStorage.setItem('deleted_template_ids', JSON.stringify(deletedIds));
    
    // Re-render templates list if modal is open
    window.openManageTemplatesModal();
    
  };

  // ==========================================
  // --- SCHEDULE EXPORT SYSTEM ---
  // ==========================================
  
  window.toggleAllExportEmps = function (checked) {
    const labels = document.querySelectorAll('.export-emp-label');
    labels.forEach(label => {
      if (label.style.display !== 'none') {
        const cb = label.querySelector('.export-emp-checkbox');
        if (cb) cb.checked = checked;
      }
    });
  };

  window.copyExportedText = function () {
    const textarea = document.getElementById('exportTextResultTextarea');
    if (!textarea) return;
    textarea.select();
    document.execCommand('copy');
        if (typeof showToast === 'function') showToast('ดาวน์โหลดรูปภาพตารางเวรสำเร็จ!', 'success');
  };

  window.downloadExportedTextFile = function () {
    const textarea = document.getElementById('exportTextResultTextarea');
    if (!textarea || !textarea.value) return;
    const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DIB_Work_Schedule_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  window.openExportScheduleModal = function () {
    const modalId = 'exportScheduleModal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const employees = DATA.employees || [];
    let hiddenEmps = [];
    try { hiddenEmps = JSON.parse(localStorage.getItem('schedule_hidden_employees') || '[]'); } catch(e) { hiddenEmps = []; }
    
    let visibleEmps = [];
    employees.forEach(e => {
      const dept = e.dept ? e.dept.trim() : '';
      if (!dept || dept === '-' || dept === 'Other') return;
      if (hiddenEmps.includes(String(e.id)) || hiddenEmps.includes(String(e.name))) return;
      if (window._scheduleTeamFilter && dept !== window._scheduleTeamFilter) return;

      const searchStr = window._scheduleSearch;
      if (searchStr) {
        const matchName = e.name && e.name.toLowerCase().includes(searchStr);
        const matchNameEn = e.nameEn && e.nameEn.toLowerCase().includes(searchStr);
        const matchNickname = e.nickname && e.nickname.toLowerCase().includes(searchStr);
        if (!(matchName || matchNameEn || matchNickname)) return;
      }
      visibleEmps.push(e);
    });

    const defaultRange = window._currentDateRange || '';

    const empChecklistHtml = visibleEmps.map(e => {
      const displayName = e.nickname && e.nickname !== '-' ? `${e.name} (${e.nickname})` : e.name;
      const searchName = `${e.name.toLowerCase()} ${e.nameEn ? e.nameEn.toLowerCase() : ''} ${e.nickname ? e.nickname.toLowerCase() : ''}`;
      return `
        <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid var(--border); border-radius:10px; cursor:pointer; background:#f8fafc; transition:all 0.2s" class="export-emp-label" data-search-name="${searchName}">
          <input type="checkbox" class="export-emp-checkbox" value="${e.id}" checked style="width:16px; height:16px; accent-color:var(--primary)">
          <div style="font-size:0.8rem; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px">${displayName}</div>
          <div style="font-size:0.65rem; color:var(--text-3); margin-left:auto; background:#fff; padding:2px 8px; border-radius:99px; border:1.5px solid #f1f5f9; flex-shrink:0">${e.pos}</div>
        </label>
      `;
    }).join('');

    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); z-index:2000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); font-family:'Kanit', sans-serif">
      <div style="background:#fff; width:100%; max-width:650px; border-radius:20px; box-shadow:0 15px 40px rgba(0,0,0,0.15); display:flex; flex-direction:column; overflow:hidden; animation: modalIn 0.3s ease-out">
        
        <!-- Modal Header -->
        <div style="padding:20px 24px; background:var(--surface2); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
          <div style="display:flex; align-items:center; gap:10px">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(16,185,129,0.1); color:#10b981; display:flex; align-items:center; justify-content:center">
              <i data-lucide="download" style="width:20px; height:20px"></i>
            </div>
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:#1e293b; margin:0; letter-spacing:-0.5px">Export ตารางการทำงาน</h3>
              <p style="margin:2px 0 0; font-size:0.75rem; color:#64748b; font-weight:500">ส่งออกข้อมูลตารางเวรของพนักงานที่เลือกเป็นไฟล์ Text หรือ รูปภาพ (PNG) เพื่อนำไปใช้งานต่อได้ทันที</p>
            </div>
          </div>
          <button onclick="document.getElementById('${modalId}').remove()" style="background:#f1f5f9; border:none; width:32px; height:32px; border-radius:10px; cursor:pointer; color:#64748b; display:flex; align-items:center; justify-content:center; transition:all 0.2s">
            <i data-lucide="x" style="width:18px; height:18px"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div style="padding:24px; overflow-y:auto; max-height:calc(100vh - 200px); display:flex; flex-direction:column; gap:20px">
          
          <!-- Section 1: Choose Date Range -->
          <div>
            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:8px">1. เลือกช่วงเวลา (วันที่เริ่มต้น - วันที่สิ้นสุด)</label>
            <div style="position:relative; width:100%">
              <i data-lucide="calendar" style="width:16px; height:16px; position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none"></i>
              <input type="text" id="exportDateRangeInput" placeholder="เลือกช่วงเวลาเริ่มต้น - สิ้นสุด..." value="${defaultRange}" 
                     style="width:100%; height:42px; padding:0 12px 0 42px; border-radius:12px; border:1.5px solid #cbd5e1; font-size:0.85rem; outline:none; background:#fff; font-family:inherit; cursor:pointer">
            </div>
          </div>

          <!-- Section 2: Choose Employees -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
              <label style="font-size:0.8rem; font-weight:700; color:#334155; margin:0">2. เลือกรายชื่อพนักงานที่ต้องการส่งออก (<span id="exportEmpCount">${visibleEmps.length}</span> คน)</label>
              <div style="display:flex; gap:8px">
                <button onclick="window.toggleAllExportEmps(true)" style="background:none; border:none; color:var(--primary); font-size:0.7rem; font-weight:700; cursor:pointer">เลือกทั้งหมด</button>
                <span style="color:#cbd5e1; font-size:0.7rem">|</span>
                <button onclick="window.toggleAllExportEmps(false)" style="background:none; border:none; color:#ef4444; font-size:0.7rem; font-weight:700; cursor:pointer">ยกเลิกทั้งหมด</button>
              </div>
            </div>
            
            <!-- Search input bar -->
            <div style="position:relative; width:100%; margin-bottom:8px">
              <i data-lucide="search" style="width:14px; height:14px; position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none"></i>
              <input type="text" id="exportEmpSearchInput" placeholder="ค้นหาชื่อพนักงาน..." 
                     style="width:100%; height:36px; padding:0 12px 0 36px; border-radius:10px; border:1.5px solid #cbd5e1; font-size:0.8rem; outline:none; background:#fff; font-family:inherit; box-sizing:border-box">
            </div>
            
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; max-height:220px; overflow-y:auto; padding:4px; border:1.5px solid #cbd5e1; border-radius:12px" class="scheduler-scrollbar">
              ${empChecklistHtml || `<div style="grid-column: span 2; text-align:center; padding:20px; color:#64748b; font-size:0.8rem">ไม่พบรายชื่อพนักงาน</div>`}
            </div>
          </div>

          <!-- Section 3: Text Output Area -->
          <div id="exportTextResultArea" style="display:none; flex-direction:column; gap:8px; animation: fadeIn 0.2s ease">
            <label style="font-size:0.8rem; font-weight:700; color:#334155; margin:0">ดูตัวอย่างข้อมูลก่อนส่งออก</label>
            <textarea id="exportTextResultTextarea" readonly style="width:100%; height:150px; padding:12px; border-radius:12px; border:1.5px solid #cbd5e1; background:#f8fafc; font-family:monospace; font-size:0.8rem; outline:none; resize:none" class="scheduler-scrollbar"></textarea>
            <div style="display:flex; gap:10px">
              <button onclick="window.copyExportedText()" class="btn" style="flex:1; background:var(--primary); color:#fff; border:none; height:38px; border-radius:10px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; font-size:0.8rem">
                <i data-lucide="copy" style="width:16px; height:16px"></i> คัดลอกข้อความ
              </button>
              <button onclick="window.downloadExportedTextFile()" class="btn" style="flex:1; background:#fff; color:#475569; border:1.5px solid var(--border); height:38px; border-radius:10px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; font-size:0.8rem">
                <i data-lucide="file-text" style="width:16px; height:16px"></i> ดาวน์โหลดไฟล์ .txt
              </button>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div style="padding:16px 24px; background:#f8fafc; border-top:1px solid var(--border); display:flex; gap:12px">
          <button onclick="window.generateScheduleImageExport()" class="btn" style="flex:1; background:#10b981; color:#fff; border:none; height:44px; border-radius:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; font-size:0.85rem; transition:all 0.2s" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
            <i data-lucide="image" style="width:18px; height:18px"></i> Export เป็นรูปภาพ (PNG)
          </button>
          <button onclick="window.generateScheduleTextExport()" class="btn" style="flex:1; background:#6366f1; color:#fff; border:none; height:44px; border-radius:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; font-size:0.85rem; transition:all 0.2s" onmouseover="this.style.background='#4f46e5'" onmouseout="this.style.background='#6366f1'">
            <i data-lucide="file-text" style="width:18px; height:18px"></i> Export เป็นข้อความ (Text)
          </button>
        </div>

      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });

    setTimeout(() => {
      const input = document.getElementById('exportDateRangeInput');
      if (input) {
        flatpickr(input, {
          mode: 'range',
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
          defaultDate: defaultRange ? defaultRange.split(' to ') : []
        });
      }

      const searchInput = document.getElementById('exportEmpSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', function (e) {
          const query = e.target.value.toLowerCase().trim();
          const labels = document.querySelectorAll('.export-emp-label');
          let visibleCount = 0;
          labels.forEach(label => {
            const searchName = label.getAttribute('data-search-name') || '';
            if (searchName.includes(query)) {
              label.style.display = 'flex';
              visibleCount++;
            } else {
              label.style.display = 'none';
            }
          });
          const countSpan = document.getElementById('exportEmpCount');
          if (countSpan) countSpan.textContent = visibleCount;
        });
      }
    }, 50);
  };

  window.generateScheduleTextExport = function () {
    const checkedBoxes = document.querySelectorAll('.export-emp-checkbox:checked');
    if (checkedBoxes.length === 0) {
      if (typeof showAlert === 'function') showAlert('กรุณาเลือกพนักงาน', 'กรุณาเลือกพนักงานอย่างน้อย 1 คน', 'warning');
      return;
    }
    const checkedIds = Array.from(checkedBoxes).map(cb => cb.value);
    const range = document.getElementById('exportDateRangeInput')?.value || '';

    let startDate, endDate;
    if (range && range.includes(' to ')) {
      const parts = range.split(' to ');
      const s = parts[0].trim();
      const e = parts[1] ? parts[1].trim() : '';
      
      startDate = new Date(s);
      endDate = e ? new Date(e) : new Date(s);
      
      if (isNaN(startDate.getTime())) startDate = new Date();
      if (isNaN(endDate.getTime())) endDate = new Date(startDate);
    } else if (range && range.trim()) {
      startDate = new Date(range.trim());
      if (isNaN(startDate.getTime())) startDate = new Date();
      endDate = new Date(startDate);
    } else {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(now);
      startDate.setDate(now.getDate() + diffToMon);
      startDate.setHours(0,0,0,0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    }

    if (startDate && startDate.getFullYear() > 2500) {
      startDate.setFullYear(startDate.getFullYear() - 543);
    }
    if (endDate && endDate.getFullYear() > 2500) {
      endDate.setFullYear(endDate.getFullYear() - 543);
    }

    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,999);

    const days = [];
    const dayNamesTH = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const monthNamesTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const thaiMonthsFull = { 'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08', 'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12' };

    let curr = new Date(startDate);
    let count = 0;
    while (curr <= endDate && count < 100) {
      days.push({
        dayTH: dayNamesTH[curr.getDay()],
        dateStr: `${curr.getDate()} ${monthNamesTH[curr.getMonth()]}`,
        dateIso: `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`,
        dateObj: new Date(curr)
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

    const tasksByPersonDay = {};
    if (Array.isArray(window.SCHEDULE_TASKS)) {
      window.SCHEDULE_TASKS.forEach(t => {
        if (!t.person || !t.date) return;
        const tPerson = String(t.person).trim().toLowerCase();
        
        // Find which employee this matches
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

    const leavesByPersonDay = {};
    if (Array.isArray(DATA.leaveRequests)) {
      DATA.leaveRequests.forEach(r => {
        if (r.status !== 'approved' && r.status !== 'อนุมัติแล้ว') return;
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
        let start = new Date(r.startRaw || parseThaiDate(r.start));
        let end = new Date(r.endRaw || parseThaiDate(r.end));
        let dCurr = new Date(start);
        while (dCurr <= end) {
          const dIso = `${dCurr.getFullYear()}-${String(dCurr.getMonth() + 1).padStart(2, '0')}-${String(dCurr.getDate()).padStart(2, '0')}`;
          const key = `${(r.name || '').trim().toLowerCase()}_${dIso}`;
          leavesByPersonDay[key] = r;
          dCurr.setDate(dCurr.getDate() + 1);
        }
      });
    }

    const holidayByPersonDay = {};
    try {
      const localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
      const parseHolidayDateToISO = (dateStr) => {
        if (!dateStr) return null;
        const s = dateStr.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        const mFull = s.match(/(\d+)\s+(\S+)\s+(\d{4})/);
        if (mFull) {
          const day = mFull[1].padStart(2, '0');
          const thaiMonthsFullMap = { 'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08', 'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12' };
          const thaiMonthsShortMap = { 'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12' };
          const mon = thaiMonthsFullMap[mFull[2]] || thaiMonthsShortMap[mFull[2]] || null;
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
      localShifts.forEach(shift => {
        const isoDate = parseHolidayDateToISO(shift.date);
        if (!isoDate) return;
        (shift.tasks || []).forEach(task => {
          if (!task.person || task.person === '-') return;
          const key = `${task.person.trim().toLowerCase()}_${isoDate}`;
          if (!holidayByPersonDay[key]) holidayByPersonDay[key] = [];
          holidayByPersonDay[key].push({ holidayName: shift.name, section: task.section, time: task.time, assignments: task.assignments || [] });
        });
      });
    } catch(e) { console.error('[Schedule Export] holiday index error:', e); }

    let txt = `ตารางการทำงาน ทีม RealSmart DIB\n`;
    txt += `วันที่: ${startDate.getDate()} ${thaiMonthsFull[startDate.getMonth()]} ${startDate.getFullYear() + 543} - ${endDate.getDate()} ${thaiMonthsFull[endDate.getMonth()]} ${endDate.getFullYear() + 543}\n`;
    txt += `--------------------------------------------------\n\n`;

    const employees = DATA.employees || [];
    checkedIds.forEach(empId => {
      const e = employees.find(emp => String(emp.id) === String(empId));
      if (!e) return;

      const displayName = e.nickname && e.nickname !== '-' ? `${e.name} (${e.nickname})` : e.name;
      txt += `พนักงาน: ${displayName} - ${e.pos}\n`;
      txt += `กะการทำงาน: ${e.shift || '-'} | วันหยุด: ${e.offdays || '-'}\n`;

      const realDayMap = { 'อาทิตย์': 0, 'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัสบดี': 4, 'ศุกร์': 5, 'เสาร์': 6 };
      const offDays = (e.offdays || '').split(/[,|\-]/).map(d => realDayMap[d.trim().replace('วัน', '')]).filter(v => v !== undefined);

      days.forEach(d => {
        const isOff = offDays.includes(d.dateObj.getDay());
        const leave = leavesByPersonDay[`${e.name.trim().toLowerCase()}_${d.dateIso}`] || 
                      leavesByPersonDay[`${(e.nameEn || '').trim().toLowerCase()}_${d.dateIso}`];
        
        const shortEn = formatScheduleName(e.nameEn) || e.name;
        const holidayTasks = holidayByPersonDay[`${e.name.trim().toLowerCase()}_${d.dateIso}`] || 
                             holidayByPersonDay[`${shortEn.trim().toLowerCase()}_${d.dateIso}`] ||
                             holidayByPersonDay[`${(e.nameEn || '').trim().toLowerCase()}_${d.dateIso}`] ||
                             holidayByPersonDay[`${(e.nickname || '').trim().toLowerCase()}_${d.dateIso}`] || [];

        let statusText = '';
        if (isOff) {
          statusText = 'วันหยุด (DAY OFF)';
        } else if (leave) {
          statusText = `ลาหยุด (${leave.type.toUpperCase()})`;
        } else {
          const dayTasks = tasksByPersonDay[`${e.id}_${d.dateIso}`] || [];
          if (dayTasks.length > 0) {
            statusText = dayTasks.map(t => `${t.title} [${t.acc}]`).join(', ');
          } else if (holidayTasks.length > 0) {
            statusText = holidayTasks.map(ht => {
              if (ht.assignments && ht.assignments.length > 0) {
                return ht.assignments.map(a => `${a.project || ht.holidayName} [${ht.section}]`).join(', ');
              }
              return `${ht.holidayName} [${ht.section || 'Operation'}]`;
            }).join(', ');
          } else {
            statusText = 'ไม่มีการมอบหมายงาน (No task)';
          }
        }

        txt += `  - ${d.dayTH} ${d.dateStr}: ${statusText}\n`;
      });
      txt += `\n`;
    });

    txt += `--------------------------------------------------\n`;
    txt += `ดาวน์โหลดจากระบบ DIB Portal ณ วันที่ ${new Date().toLocaleDateString('th-TH')}`;

    const textarea = document.getElementById('exportTextResultTextarea');
    const area = document.getElementById('exportTextResultArea');
    if (textarea && area) {
      textarea.value = txt;
      area.style.display = 'flex';
      if (window.lucide) lucide.createIcons({ root: area });
    }
  };

  window.generateScheduleImageExport = function () {
    const checkedBoxes = document.querySelectorAll('.export-emp-checkbox:checked');
    if (checkedBoxes.length === 0) {
      if (typeof showAlert === 'function') showAlert('กรุณาเลือกพนักงาน', 'กรุณาเลือกพนักงานอย่างน้อย 1 คน', 'warning');
      return;
    }
    const checkedIds = Array.from(checkedBoxes).map(cb => cb.value);
    const range = document.getElementById('exportDateRangeInput')?.value || '';

    let startDate, endDate;
    if (range && range.includes(' to ')) {
      const parts = range.split(' to ');
      const s = parts[0].trim();
      const e = parts[1] ? parts[1].trim() : '';
      
      startDate = new Date(s);
      endDate = e ? new Date(e) : new Date(s);
      
      if (isNaN(startDate.getTime())) startDate = new Date();
      if (isNaN(endDate.getTime())) endDate = new Date(startDate);
    } else if (range && range.trim()) {
      startDate = new Date(range.trim());
      if (isNaN(startDate.getTime())) startDate = new Date();
      endDate = new Date(startDate);
    } else {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(now);
      startDate.setDate(now.getDate() + diffToMon);
      startDate.setHours(0,0,0,0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    }

    if (startDate && startDate.getFullYear() > 2500) {
      startDate.setFullYear(startDate.getFullYear() - 543);
    }
    if (endDate && endDate.getFullYear() > 2500) {
      endDate.setFullYear(endDate.getFullYear() - 543);
    }

    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,999);

    const days = [];
    const dayNamesTH = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const monthNamesTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const thaiMonthsFull = { 'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08', 'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12' };

    let curr = new Date(startDate);
    let count = 0;
    while (curr <= endDate && count < 100) {
      days.push({
        dayTH: dayNamesTH[curr.getDay()],
        dateStr: `${curr.getDate()} ${monthNamesTH[curr.getMonth()]}`,
        dateIso: `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`,
        dateObj: new Date(curr)
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

    const tasksByPersonDay = {};
    if (Array.isArray(window.SCHEDULE_TASKS)) {
      window.SCHEDULE_TASKS.forEach(t => {
        if (!t.person || !t.date) return;
        const tPerson = String(t.person).trim().toLowerCase();
        
        // Find which employee this matches
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

    const leavesByPersonDay = {};
    if (Array.isArray(DATA.leaveRequests)) {
      DATA.leaveRequests.forEach(r => {
        if (r.status !== 'approved' && r.status !== 'อนุมัติแล้ว') return;
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
        let start = new Date(r.startRaw || parseThaiDate(r.start));
        let end = new Date(r.endRaw || parseThaiDate(r.end));
        let dCurr = new Date(start);
        while (dCurr <= end) {
          const dIso = `${dCurr.getFullYear()}-${String(dCurr.getMonth() + 1).padStart(2, '0')}-${String(dCurr.getDate()).padStart(2, '0')}`;
          const key = `${(r.name || '').trim().toLowerCase()}_${dIso}`;
          leavesByPersonDay[key] = r;
          dCurr.setDate(dCurr.getDate() + 1);
        }
      });
    }

    const holidayByPersonDay = {};
    try {
      const localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
      const parseHolidayDateToISO = (dateStr) => {
        if (!dateStr) return null;
        const s = dateStr.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        const mFull = s.match(/(\d+)\s+(\S+)\s+(\d{4})/);
        if (mFull) {
          const day = mFull[1].padStart(2, '0');
          const thaiMonthsFullMap = { 'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08', 'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12' };
          const thaiMonthsShortMap = { 'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12' };
          const mon = thaiMonthsFullMap[mFull[2]] || thaiMonthsShortMap[mFull[2]] || null;
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
      localShifts.forEach(shift => {
        const isoDate = parseHolidayDateToISO(shift.date);
        if (!isoDate) return;
        (shift.tasks || []).forEach(task => {
          if (!task.person || task.person === '-') return;
          const key = `${task.person.trim().toLowerCase()}_${isoDate}`;
          if (!holidayByPersonDay[key]) holidayByPersonDay[key] = [];
          holidayByPersonDay[key].push({ holidayName: shift.name, section: task.section, time: task.time, assignments: task.assignments || [] });
        });
      });
    } catch(e) { console.error('[Schedule Export] holiday index error:', e); }

    const mixWithWhite = (hex, weight) => {
      const cleanHex = (hex || '#64748b').replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      const rMix = Math.round(r * weight + 255 * (1 - weight));
      const gMix = Math.round(g * weight + 255 * (1 - weight));
      const bMix = Math.round(b * weight + 255 * (1 - weight));
      const rHex = rMix.toString(16).padStart(2, '0');
      const gHex = gMix.toString(16).padStart(2, '0');
      const bHex = bMix.toString(16).padStart(2, '0');
      return `#${rHex}${gHex}${bHex}`;
    };

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '1420px';
    tempDiv.style.padding = '40px';
    tempDiv.style.background = '#f8fafc';
    tempDiv.style.borderRadius = '24px';
    tempDiv.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.1)';
    tempDiv.style.fontFamily = "'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

    const chunkArray = (array, size) => {
      const result = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    };
    const dayChunks = chunkArray(days, 7);

    let tablesHtml = '';
    const employees = DATA.employees || [];

    dayChunks.forEach((chunk, chunkIdx) => {
      let rowsHtml = '';
      checkedIds.forEach(empId => {
        const e = employees.find(emp => String(emp.id) === String(empId));
        if (!e) return;

        const displayName = e.nickname && e.nickname !== '-' ? `${e.name} (${e.nickname})` : e.name;
      const realDayMap = { 'อาทิตย์': 0, 'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัสบดี': 4, 'ศุกร์': 5, 'เสาร์': 6 };
      const offDays = (e.offdays || '').split(/[,|\-]/).map(d => realDayMap[d.trim().replace('วัน', '')]).filter(v => v !== undefined);

        let cellsHtml = '';
        chunk.forEach(d => {
          const isOff = offDays.includes(d.dateObj.getDay());
          const leave = leavesByPersonDay[`${e.name.trim().toLowerCase()}_${d.dateIso}`] || 
                        leavesByPersonDay[`${(e.nameEn || '').trim().toLowerCase()}_${d.dateIso}`];
          const shortEn = formatScheduleName(e.nameEn) || e.name;
          const holidayTasks = holidayByPersonDay[`${e.name.trim().toLowerCase()}_${d.dateIso}`] || 
                               holidayByPersonDay[`${shortEn.trim().toLowerCase()}_${d.dateIso}`] ||
                               holidayByPersonDay[`${(e.nameEn || '').trim().toLowerCase()}_${d.dateIso}`] ||
                               holidayByPersonDay[`${(e.nickname || '').trim().toLowerCase()}_${d.dateIso}`] || [];

          let cellContent = '';
          let cellBg = isOff ? '#f1f5f9' : '#ffffff';

          if (isOff) {
            cellContent = `<div style="display:flex; align-items:center; justify-content:center; height:115px; width:100%; background:#f1f5f9; color:#94a3b8; font-size:11px; font-weight:700; letter-spacing:1.5px">DAY OFF</div>`;
          } else if (leave) {
            cellBg = '#fff1f2';
            cellContent = `<div style="display:flex; align-items:center; justify-content:center; height:115px; width:100%; background:#fee2e2; color:#be123c; font-size:11px; font-weight:800; text-transform:uppercase">${leave.type}</div>`;
          } else {
            const dayTasks = tasksByPersonDay[`${e.id}_${d.dateIso}`] || [];
            const totalHours = dayTasks.reduce((sum, t) => sum + (Number(t.hours) || 0), 0);
            const wlColor = getWorkloadColor(totalHours);

            if (dayTasks.length > 0) {
              const tasksList = dayTasks.map(t => {
                const nodeCol = colorForNode(t.node);
                const borderColor = mixWithWhite(nodeCol, 0.25);
                return `
                  <div style="display: flex; align-items: stretch; gap: 8px; padding: 8px 10px; border-radius: 10px; background: #ffffff; border: 1px solid ${borderColor}; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.02)">
                    <div style="width: 4px; background: ${nodeCol}; border-radius: 99px; flex-shrink: 0;"></div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="color: ${nodeCol}; font-weight: 700; font-size: 11.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3" title="${t.title}">${t.title}</div>
                      <div style="font-size: 9.5px; color: #64748b; margin-top: 4px; display: flex; justify-content: space-between; align-items: center">
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75px">${t.acc}</span>
                        <span style="color: #94a3b8; font-size: 8.5px">${t.node}</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('');

              cellContent = `
                <div style="display:flex; flex-direction:column; height:100%; gap:4px">
                  <div style="flex:1">${tasksList}</div>
                </div>
              `;
            } else if (holidayTasks.length > 0) {
              let holidayTotalPct = 0;
              const hTasksList = holidayTasks.map(ht => {
                if (ht.assignments && ht.assignments.length > 0) {
                  return ht.assignments.map(a => {
                    holidayTotalPct += (Number(a.percent) || 0);
                    const hBorderColor = mixWithWhite('#f59e0b', 0.25);
                    return `
                      <div style="display: flex; align-items: stretch; gap: 8px; padding: 8px 10px; border-radius: 10px; background: #ffffff; border: 1px solid ${hBorderColor}; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.02)">
                        <div style="width: 4px; background: #f59e0b; border-radius: 99px; flex-shrink: 0;"></div>
                        <div style="flex: 1; min-width: 0;">
                          <div style="color: #f59e0b; font-weight: 700; font-size: 11.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3" title="${a.project || ht.holidayName}">${a.project || ht.holidayName}</div>
                          <div style="font-size: 9.5px; color: #64748b; margin-top: 4px; display: flex; justify-content: space-between; align-items: center">
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75px">${ht.section}</span>
                            <span style="color: #94a3b8; font-size: 8.5px">Holiday</span>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('');
                } else {
                  const hBorderColor = mixWithWhite('#f59e0b', 0.25);
                  return `
                    <div style="display: flex; align-items: stretch; gap: 8px; padding: 8px 10px; border-radius: 10px; background: #ffffff; border: 1px solid ${hBorderColor}; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.02)">
                      <div style="width: 4px; background: #f59e0b; border-radius: 99px; flex-shrink: 0;"></div>
                      <div style="flex: 1; min-width: 0;">
                        <div style="color: #f59e0b; font-weight: 700; font-size: 11.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3" title="${ht.holidayName}">${ht.holidayName}</div>
                        <div style="font-size: 9.5px; color: #64748b; margin-top: 4px; display: flex; justify-content: space-between; align-items: center">
                          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75px">${ht.section || 'Operation'}</span>
                          <span style="color: #94a3b8; font-size: 8.5px">${ht.time || '-'}</span>
                        </div>
                      </div>
                    </div>
                  `;
                }
              }).join('');

              cellContent = `
                <div style="display:flex; flex-direction:column; height:100%; gap:4px">
                  <div style="flex:1">${hTasksList}</div>
                </div>
              `;
            } else {
              cellContent = `<div style="padding:24px 15px; color:#cbd5e1; font-size:12px; font-weight:normal; text-align:center">-</div>`;
            }
          }

          cellsHtml += `
            <td style="padding:${isOff || leave ? '0' : '10px'}; border-bottom:1px solid #e2e8f0; border-right:1px solid #e2e8f0; background:${cellBg}; vertical-align:top; width:135px; min-width:135px; height:115px">
              ${cellContent}
            </td>
          `;
        });

        // Add dummy columns if chunk length is less than 7
        const dummyCount = 7 - chunk.length;
        for (let i = 0; i < dummyCount; i++) {
          cellsHtml += `
            <td style="padding:10px; border-bottom:1px solid #e2e8f0; border-right:1px solid #e2e8f0; background:#f8fafc; vertical-align:top; width:135px; min-width:135px; height:115px"></td>
          `;
        }

        rowsHtml += `
          <tr style="background:#ffffff">
            <td style="padding:16px; border-bottom:1px solid #e2e8f0; border-right:1px solid #e2e8f0; vertical-align:middle; width:220px; min-width:220px; background:#ffffff">
              <div style="font-weight:700; color:#0f172a; font-size:14px; line-height:1.4">${displayName}</div>
              <div style="display:inline-block; padding:3px 10px; border-radius:99px; background:${getPosBgColor(e.pos)}; color:${getPosTextColor(e.pos)}; font-size:9.5px; font-weight:700; margin-top:6px; text-transform:uppercase; letter-spacing:0.5px; border:1px solid rgba(0,0,0,0.03)">${e.pos}</div>
              <div style="font-size:10.5px; color:#64748b; margin-top:8px; line-height:1.5; font-weight:500">
                <span style="color:#94a3b8">กะ:</span> ${e.shift || '-'} <br/>
                <span style="color:#94a3b8">วันหยุด:</span> ${e.offdays || '-'}
              </div>
            </td>
            ${cellsHtml}
          </tr>
        `;
      });

      const thsHtml = chunk.map(d => {
        const isWeekend = d.dateObj.getDay() === 0 || d.dateObj.getDay() === 6;
        const holidayName = typeof isThaiHoliday === 'function' ? isThaiHoliday(d.dateObj) : null;
        const isHoliday = !!holidayName;

        let thBg = '#f8fafc';
        let dayColor = '#64748b';
        let dateColor = '#1e293b';

        if (isHoliday) {
          thBg = '#ffe4e6';
          dayColor = '#e11d48';
          dateColor = '#be123c';
        } else if (isWeekend) {
          thBg = '#f1f5f9';
          dayColor = '#475569';
          dateColor = '#334155';
        }

        return `
          <th style="padding:14px 10px; border-bottom:1.5px solid #e2e8f0; border-right:1px solid #e2e8f0; text-align:center; background:${thBg}; font-size:12px; color:#475569; font-weight:700; width:135px" ${isHoliday ? `title="${holidayName}"` : ''}>
            <div style="font-size:10px; color:${dayColor}; font-weight:600; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px">${d.dayTH}</div>
            <div style="font-size:13px; color:${dateColor}; font-weight:700">${d.dateStr}</div>
            ${isHoliday ? `<div style="font-size:8.5px; color:#be123c; font-weight:600; margin-top:3px; line-height:1.1">${holidayName}</div>` : ''}
          </th>
        `;
      }).join('');

      let dummyThsHtml = '';
      const dummyCount = 7 - chunk.length;
      for (let i = 0; i < dummyCount; i++) {
        dummyThsHtml += `
          <th style="padding:14px 10px; border-bottom:1.5px solid #e2e8f0; border-right:1px solid #e2e8f0; background:#f8fafc; width:135px"></th>
        `;
      }

      tablesHtml += `
        <div style="border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.02); margin-bottom: 24px;">
          <table style="width:100%; border-collapse:collapse; table-layout:fixed">
            <thead>
              <tr style="background:#f8fafc">
                <th style="padding:16px; border-bottom:1.5px solid #e2e8f0; border-right:1px solid #e2e8f0; text-align:left; font-size:13px; color:#475569; font-weight:700; width:220px">ข้อมูลพนักงาน</th>
                ${thsHtml}
                ${dummyThsHtml}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;
    });

    const headerHtml = `
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 18px 28px; border-radius: 16px; color: #ffffff; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.15)">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 10px; border-radius: 99px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 6px; border: 1px solid rgba(56, 189, 248, 0.2)">
            RealSmart DIB
          </div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; font-family: 'Kanit', sans-serif">ระบบจัดการตารางเวลาพนักงาน RealSmart DIB</h1>
          <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px; font-size: 12px; color: #cbd5e1; font-weight: 500">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; background: rgba(255, 255, 255, 0.1); border-radius: 50%"><span style="width: 5px; height: 5px; border-radius: 50%; background: #38bdf8"></span></span>
            วันที่: ${startDate.getDate()} ${thaiMonthsFull[startDate.getMonth()]} ${startDate.getFullYear() + 543} - ${endDate.getDate()} ${thaiMonthsFull[endDate.getMonth()]} ${endDate.getFullYear() + 543}
          </div>
        </div>
        <div style="text-align: right; display: flex; flex-direction: column; gap: 4px">
          <div style="font-size: 11px; color: #94a3b8; font-weight: 500">อัปเดตข้อมูล ณ วันที่ ${new Date().toLocaleDateString('th-TH')}</div>
          <div style="font-size: 12.5px; font-weight: 700; color: #38bdf8; letter-spacing: 0.5px">RealSmart Department Portal</div>
        </div>
      </div>
    `;

    tempDiv.innerHTML = headerHtml + tablesHtml;
    document.body.appendChild(tempDiv);

    if (typeof showToast === 'function') showToast('กำลังประมวลผลข้อมูล...', 'info');

    setTimeout(() => {
      html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      }).then(canvas => {
        const link = document.createElement('a');
        const toISODateString = (date) => {
          if (!date || isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };
        link.download = `DIB_Schedule_${toISODateString(startDate)}_to_${toISODateString(endDate)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        tempDiv.remove();
        if (typeof showToast === 'function') showToast('ดาวน์โหลดรูปภาพตารางเวรสำเร็จ!', 'success');
      }).catch(err => {
        console.error('Export image error:', err);
        if (typeof showAlert === 'function') showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกรูปภาพได้: ' + err.message, 'error');
        tempDiv.remove();
      });
    }, 100);
  };

  if (window.logLoad) logLoad("pages.js: Loaded.");
} catch (e) {
  console.error("pages.js: Fatal Load Error", e);
  window._pagesJsError = { message: e.message, stack: e.stack, line: e.lineNumber || 'unknown' };
  if (window.logLoad) logLoad("pages.js: ERROR - " + e.message);
}


















window.filterEmpeoTable = function(query) {
  const rows = document.querySelectorAll('.empeo-row');
  const q = query.toLowerCase();
  rows.forEach(r => {
    const name = r.querySelector('.emp-name').innerText.toLowerCase();
    if (name.includes(q)) {
      r.style.display = '';
    } else {
      r.style.display = 'none';
    }
  });
};

(function autoFixLayout() {
   return; // Disabled
   setTimeout(() => {
      try {
         const structStr = localStorage.getItem('org_structure');
         if (!structStr) return;
         let struct = JSON.parse(structStr);
         let bellNode = null;
         let parentOfBell = null;
         
         function findBell(node, parent) {
            if (node.empId && node.empId.includes('RS147')) {
               bellNode = node;
               parentOfBell = parent;
               return true;
            }
            if (node.children) {
               for (let c of node.children) {
                  if (findBell(c, node)) return true;
               }
            }
            return false;
         }
         
         findBell(struct, null);
         
         if (bellNode && parentOfBell && !bellNode.empId.includes('RS257')) {
            bellNode.empId = "RS147,RS257,RS310,RS423";
            parentOfBell.children = parentOfBell.children.filter(c => {
                if (c.id === bellNode.id) return true;
                if (c.empId === "RS257" || c.empId === "RS310" || c.empId === "RS423") return false;
                return true;
            });
            localStorage.setItem('org_structure', JSON.stringify(struct));
            if (typeof window.orgRenderTree === 'function') window.orgRenderTree();
         }
      } catch(e) {}
   }, 500);
})();

(function autoFixLayout2() {
   return; // Disabled
   setTimeout(() => {
      try {
         const structStr = localStorage.getItem('org_structure');
         if (!structStr) return;
         let struct = JSON.parse(structStr);
         let benzNode = null;
         let parentOfBenz = null;
         
         function findBenz(node, parent) {
            if (node.empId && node.empId.includes('RS092')) {
               benzNode = node;
               parentOfBenz = parent;
               return true;
            }
            if (node.children) {
               for (let c of node.children) {
                  if (findBenz(c, node)) return true;
               }
            }
            return false;
         }
         
         findBenz(struct, null);
         
         if (benzNode && parentOfBenz && !benzNode.empId.includes('RS455')) {
            benzNode.empId = "RS092,RS455";
            parentOfBenz.children = parentOfBenz.children.filter(c => {
                if (c.id === benzNode.id) return true;
                if (c.empId === "RS455") return false;
                return true;
            });
            localStorage.setItem('org_structure', JSON.stringify(struct));
            if (typeof window.orgRenderTree === 'function') window.orgRenderTree();
         }
      } catch(e) {}
   }, 500);
})();












(function() {
    try {
        const structStr = localStorage.getItem('org_structure');
        if (!structStr) return;
        let struct = JSON.parse(structStr);
        let modified = false;
        
        function splitBenzArt(node, parent) {
            if (node.empId && node.empId.includes('RS092') && node.empId.includes('RS455')) {
                node.empId = 'RS092';
                
                let newNode = JSON.parse(JSON.stringify(node));
                newNode.id = 'node_' + Date.now() + Math.floor(Math.random()*1000);
                newNode.empId = 'RS455';
                newNode.children = [];
                
                if (parent && parent.children) {
                    parent.children.push(newNode);
                }
                modified = true;
            }
            if (node.children) {
                for (let c of node.children) {
                    splitBenzArt(c, node);
                }
            }
        }
        
        splitBenzArt(struct, null);
        
        if (modified) {
            localStorage.setItem('org_structure', JSON.stringify(struct));
            if (typeof window.orgRenderTree === 'function') window.orgRenderTree();
        }
    } catch(e) {}
})();