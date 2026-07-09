  if (!window.toggleCustomDropdown) {
    window.toggleCustomDropdown = function(id) {
      const menu = document.getElementById(id);
      if (!menu) return;
      
      const isVisible = menu.style.display === 'block';
      // Close all other menus
      document.querySelectorAll('.custom-dropdown-menu').forEach(el => el.style.display = 'none');
      
      menu.style.display = isVisible ? 'none' : 'block';
    }

    // Close when click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-dropdown-container')) {
        document.querySelectorAll('.custom-dropdown-menu').forEach(el => el.style.display = 'none');
      }
    });
  }

  if (!window.selectFormCustomDropdown) {
    window.selectFormCustomDropdown = function(inputId, value, label, callbackName) {
      const input = document.getElementById(inputId);
      const labelSpan = document.getElementById('label_' + inputId);
      const menu = document.getElementById(inputId + '_dropdown');
      
      if (input) input.value = value;
      if (labelSpan) labelSpan.textContent = label;
      if (menu) menu.style.display = 'none';

      // Trigger change event manually
      if (input) {
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      }

      if (callbackName && typeof window[callbackName] === 'function') {
        window[callbackName](value);
      }
    }
  }

  if (!window.renderFormCustomDropdown) {
    window.renderFormCustomDropdown = (id, defaultLabel, options, selectedValue, callbackName) => {
      const selectedOpt = options.find(o => String(o.value) === String(selectedValue));
      const displayLabel = selectedOpt ? selectedOpt.label : defaultLabel;
      const actualValue = selectedValue || '';

      let minWidthStyle = 'min-width: 140px !important;';
      let positionStyle = 'left:0;';
      let paddingStyle = 'padding:10px 16px;';
      if (id === 'empBirthDay') {
        minWidthStyle = 'min-width: 60px !important;';
        paddingStyle = 'padding:10px 8px;';
      } else if (id === 'empBirthYear') {
        minWidthStyle = 'min-width: 70px !important;';
        positionStyle = 'right:0;';
        paddingStyle = 'padding:10px 8px;';
      }

      let optsHtml = '';
      options.forEach(opt => {
        const isSelected = String(opt.value) === String(actualValue);
        const bgStyle = isSelected ? 'background:#eff6ff; color:#2563eb; font-weight:600' : 'background:transparent; color:#64748b';
        optsHtml += `<div onclick="selectFormCustomDropdown('${id}', '${opt.value}', '${opt.label.replace(/'/g, "\\'")}', '${callbackName || ''}')" style="text-align:left !important; ${paddingStyle} font-size:0.85rem; cursor:pointer; border-radius:8px; ${bgStyle}; transition:all 0.1s" onmouseover="this.style.background='#f8fafc'; this.style.color='#24204D'" onmouseout="this.style.background='${isSelected ? '#eff6ff' : 'transparent'}'; this.style.color='${isSelected ? '#2563eb' : '#64748b'}'">${opt.label}</div>`;
      });

      return `
        <div class="custom-dropdown-container form-dropdown-container" style="position:relative; width:100%;">
          <input type="hidden" id="${id}" value="${actualValue}">
          <button type="button" onclick="toggleCustomDropdown('${id}_dropdown')" style="width:100% !important; border-radius:99px !important; border:1px solid #e2e8f0 !important; background:#ffffff !important; color:#24204D !important; font-weight:500 !important; height:42px !important; box-sizing:border-box !important; font-size:0.85rem !important; padding:0 6px 0 12px !important; display:flex !important; align-items:center !important; justify-content:space-between !important; cursor:pointer !important; box-shadow:0 1px 2px rgba(15,23,42,0.04) !important; transition:all 0.2s !important" onmouseover="this.style.borderColor='#cbd5e1'" onmouseout="this.style.borderColor='#e2e8f0'">
            <span id="label_${id}" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">${displayLabel}</span>
            <i data-lucide="chevron-down" style="width:12px; height:12px; color:#94a3b8; flex-shrink:0;"></i>
          </button>
          <div id="${id}_dropdown" class="custom-dropdown-menu" style="display:none; position:absolute; top:46px; ${positionStyle} width:100%; ${minWidthStyle} text-align:left !important; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.08); z-index:99999; overflow-x:hidden; overflow-y:auto; max-height:240px; padding:6px; animation: fadeIn 0.15s ease-out;">
            ${optsHtml}
          </div>
        </div>
      `;
    };
  }

  window.showLeaveModal = function(editId = null) {
    const modalId = 'leaveModal';
    if (document.getElementById(modalId)) document.getElementById(modalId).remove();

    const req = editId ? window.DATA.leaveRequests.find(r => r.id === editId) : null;
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
    <div id="${modalId}" class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:2000; backdrop-filter:blur(4px)">
      <div class="modal-card" style="background: var(--surface); width:100%; max-width:500px; border-radius:20px; box-shadow: var(--shadow); display:flex; flex-direction:column; overflow:hidden; animation: modalIn 0.3s ease-out">
        <div style="padding:24px; background:var(--surface2); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
          <h3 style="font-family:Prompt; font-size:1.1rem; font-weight:700; color:#24204D; margin:0">${editId ? 'แก้ไขรายการลาพนักงาน' : 'เพิ่มรายการลาพนักงาน'}</h3>
          <button onclick="closeLeaveModal()" style="background:none; border:none; color:var(--text-3); cursor:pointer; " class="text-[12px] font-semibold px-4 py-1.5"><i data-lucide="x" style="width:20px; height:20px"></i></button>
        </div>
        <div style="padding:24px; overflow-x:hidden !important; overflow-y:auto; max-height:calc(100vh - 150px); display:flex; flex-direction:column; gap:20px">
          <!-- Mode Selection -->
          <div style="display:flex; gap:20px; padding:12px; background:var(--surface2); border:1px solid var(--border); border-radius:12px; margin-bottom:4px">
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
              <label class="form-label" style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">ชื่อพนักงาน</label>
              <input type="text" id="leaveEmpName" class="form-input" value="${req ? req.name : ''}" style="width:100%; font-family:'Prompt', sans-serif" placeholder="พิมพ์ค้นหาชื่อพนักงาน..." autocomplete="off" onkeyup="filterLeaveEmployees(this.value)">
              <div id="leaveEmpSuggestions" style="position:absolute; top:100%; left:0; width:100%; background:#fff; border:1px solid var(--border); border-radius:8px; margin-top:4px; max-height:200px; overflow-y:auto; z-index:100; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); display:none">
                ${(window.DATA.employees || []).map(e => `
                  <div class="suggestion-item" onclick="selectLeaveEmployee('${e.name}', '${e.dept}')" style="padding:10px 12px; cursor:pointer; font-size:.7rem; border-bottom:1px solid #f1f5f9">
                    <div style="font-weight:600">${e.name}</div>
                    <div style="font-size:.65rem; color:var(--text-3)">${e.dept} | ${e.nickname}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div>
              <label class="form-label" style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">ทีม (Team)</label>
              <input type="text" id="leaveEmpTeam" class="form-input" value="${req ? ((window.DATA.employees || []).find(e => e.name === req.name)?.dept || '-') : ''}" style="width:100%; background:var(--surface2); font-family:'Prompt', sans-serif" readonly placeholder="ทีมพนักงาน...">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:16px; margin-bottom:16px">
            <div id="leaveTypeContainer" style="display: ${isComp ? 'none' : 'block'}">
              <label class="form-label" style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">ประเภทการลา</label>
              ${window.renderFormCustomDropdown('leaveType', 'เลือกประเภทการลา...', [
                { value: 'ลาพักร้อน', label: 'ลาพักร้อน' },
                { value: 'ลากิจ', label: 'ลากิจ' },
                { value: 'ลาป่วย', label: 'ลาป่วย' },
                { value: 'ลาคลอด / ลาเลี้ยงดูบุตร', label: 'ลาคลอด / ลาเลี้ยงดูบุตร' },
                { value: 'ลาเพื่อการฌาปนกิจศพ', label: 'ลาเพื่อการฌาปนกิจศพ' },
                { value: 'อบรม / สัมมนา', label: 'อบรม / สัมมนา' },
                { value: 'อื่นๆ', label: 'อื่นๆ' }
              ], req ? req.type : '', 'handleLeaveTypeChange')}
            </div>
            <div id="compDateContainer" style="display: ${isComp ? 'block' : 'none'}">
              <label class="form-label" style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">ใช้ของวันที่เท่าไร (Ref. Date)</label>
              <div style="position:relative">
                <input type="text" id="leaveRefDate" class="form-input" style="width:100%; font-family:'Prompt', sans-serif" placeholder="เลือกวันที่ชดเชย...">
                <i data-lucide="calendar" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:var(--text-3)"></i>
              </div>
            </div>
          </div>

          <div id="halfDayContainer" style="display: ${(req && (req.type === 'ลาป่วย' || req.type === 'ลาพักร้อน' || req.type === 'ลากิจ')) ? 'block' : 'none'}; margin-bottom:16px">
            <label class="form-label" style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">ระยะเวลาการลา</label>
            <div style="display:flex; gap:16px; padding:10px 12px; background:var(--surface2); border:1px solid var(--border); border-radius:12px">
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:.8rem; font-weight:500; color:#475569">
                <input type="radio" name="leaveDuration" value="full" ${(!req || !req.note || (!req.note.includes('ครึ่งวันเช้า') && !req.note.includes('ครึ่งวันบ่าย'))) ? 'checked' : ''} onclick="updateLeaveDays()" style="width:16px; height:16px; accent-color:var(--primary)">
                <span>เต็มวัน (Full Day)</span>
              </label>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:.8rem; font-weight:500; color:#475569">
                <input type="radio" name="leaveDuration" value="morning" ${(req && req.note && req.note.includes('ครึ่งวันเช้า')) ? 'checked' : ''} onclick="updateLeaveDays()" style="width:16px; height:16px; accent-color:var(--primary)">
                <span>ครึ่งวันเช้า (Morning)</span>
              </label>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:.8rem; font-weight:500; color:#475569">
                <input type="radio" name="leaveDuration" value="afternoon" ${(req && req.note && req.note.includes('ครึ่งวันบ่าย')) ? 'checked' : ''} onclick="updateLeaveDays()" style="width:16px; height:16px; accent-color:var(--primary)">
                <span>ครึ่งวันบ่าย (Afternoon)</span>
              </label>
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
            <div>
              <label class="form-label" style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">วันที่ต้องการลา (เริ่ม)</label>
              <div style="position:relative">
                <input type="text" id="leaveStart" class="form-input" style="width:100%; font-family:'Prompt', sans-serif" placeholder="เลือกวันที่...">
                <i data-lucide="calendar" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:var(--text-3)"></i>
              </div>
            </div>
            <div>
              <label class="form-label" style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">วันที่ต้องการลา (สิ้นสุด)</label>
              <div style="position:relative">
                <input type="text" id="leaveEnd" class="form-input" style="width:100%; font-family:'Prompt', sans-serif" placeholder="เลือกวันที่...">
                <i data-lucide="calendar" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:var(--text-3)"></i>
              </div>
            </div>
          </div>

          <div>
            <label class="form-label" style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">จำนวนวัน</label>
            <input type="text" id="leaveDays" class="form-input" style="width:100%; background:var(--surface2); font-weight:500; font-family:'Prompt', sans-serif" readonly value="${req ? req.days : '0'}">
          </div>

          <div>
            <label class="form-label" style="display:block; font-size:.75rem; font-weight:600; color:#475569; margin-bottom:6px">หมายเหตุ (Note)</label>
            <textarea id="leaveNote" class="form-input" style="width:100%; height:80px; font-family:'Prompt', sans-serif; resize:none; padding:10px" placeholder="ใส่ข้อมูลเพิ่มเติมที่นี่...">${req ? (req.note || '') : ''}</textarea>
          </div>

        </div>
        <div style="padding:20px 28px; background:var(--surface2); border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:8px">
          <button onclick="closeLeaveModal()" class="text-[12px] font-semibold px-4 py-1.5 btn btn-outline" style="font-family:'Prompt', sans-serif">ยกเลิก</button>
          <button onclick="saveLeaveRequest()" class="text-[12px] font-semibold px-4 py-1.5 btn btn-primary" style="font-family:'Prompt', sans-serif; min-width:140px">
            <i data-lucide="save" style="width:16px; height:16px; margin-right:6px; vertical-align:middle"></i>${editId ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
          </button>
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
    window.handleLeaveTypeChange = function(val) {
      const halfDayContainer = document.getElementById('halfDayContainer');
      if (!halfDayContainer) return;
      if (val === 'ลาป่วย' || val === 'ลาพักร้อน' || val === 'ลากิจ') {
        halfDayContainer.style.display = 'block';
      } else {
        halfDayContainer.style.display = 'none';
        const fullDayRadio = document.querySelector('input[name="leaveDuration"][value="full"]');
        if (fullDayRadio) fullDayRadio.checked = true;
      }
      updateLeaveDays();
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
    const teamEl = document.getElementById('leaveEmpTeam');
    if (!q) { 
      container.style.display = 'none'; 
      if (teamEl) teamEl.value = '';
      return; 
    }

    const query = q.toLowerCase();
    
    // Auto-fill team if exact match or clear it if typing
    const exactEmp = (window.DATA.employees || []).find(e => e.name.toLowerCase() === query);
    if (exactEmp && teamEl) {
      teamEl.value = exactEmp.dept || '-';
    }

    const items = container.querySelectorAll('.suggestion-item');
    let hasMatch = false;

    items.forEach(item => {
      const isMatch = item.textContent.toLowerCase().includes(query);
      item.style.display = isMatch ? 'block' : 'none';
      if (isMatch) hasMatch = true;
    });

    container.style.display = hasMatch ? 'block' : 'none';
  }

  window.selectLeaveEmployee = function(name, dept) {
    document.getElementById('leaveEmpName').value = name;
    const teamEl = document.getElementById('leaveEmpTeam');
    if (teamEl) teamEl.value = dept || '-';
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
      let finalDays = diff >= 0 ? diff + 1 : 0;

      // Handle Half Day selection
      const durationEl = document.querySelector('input[name="leaveDuration"]:checked');
      if (durationEl && durationEl.value !== 'full' && finalDays === 1) {
        finalDays = 0.5;
      }

      document.getElementById('leaveDays').value = finalDays;
    }
  }

  window.saveLeaveRequest = function() {
    const empName = document.getElementById('leaveEmpName').value;
    const mode = document.querySelector('input[name="leaveMode"]:checked').value;
    const type = mode === 'leave' ? document.getElementById('leaveType').value : 'วันหยุดชดเชย';
    const refInput = document.getElementById('leaveRefDate');
    const refDate = mode === 'comp' ? (refInput._flatpickr ? refInput._flatpickr.input.value : refInput.value) : '';
    let note = document.getElementById('leaveNote').value;

    // Handle Half Day prepend to note
    const durationEl = document.querySelector('input[name="leaveDuration"]:checked');
    if (durationEl && durationEl.value !== 'full' && parseFloat(document.getElementById('leaveDays').value) === 0.5) {
      const labelMap = { morning: 'ครึ่งวันเช้า', afternoon: 'ครึ่งวันบ่าย' };
      const durationLabel = labelMap[durationEl.value];
      if (durationLabel && !note.includes(durationLabel)) {
        note = `[${durationLabel}] ${note}`.trim();
      }
    }

    const start = document.getElementById('leaveStart').value;
    const end = document.getElementById('leaveEnd').value;
    const days = parseFloat(document.getElementById('leaveDays').value);
    const statusEl = document.getElementById('leaveStatus');
    const status = statusEl ? statusEl.value : 'approved';

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
      const todayCount = (window.DATA.leaveRequests || []).filter(r => r.id && r.id.startsWith(todayPrefix)).length;
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
      const idx = window.DATA.leaveRequests.findIndex(r => r.id === id);
      if (idx !== -1) {
        // Format refDate to Thai if it's compensatory
        let refDateStr = refDate;
        if (mode === 'comp' && refDate && refDate.includes('-')) {
          const dRef = new Date(refDate);
          refDateStr = `${dRef.getDate()} ${months[dRef.getMonth()]} ${dRef.getFullYear() + 543}`;
        }

        window.DATA.leaveRequests[idx] = {
          ...window.DATA.leaveRequests[idx],
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
          approvedBy: (status === 'pending' || status === 'รอการอนุมัติ') ? '-' : (window.DATA.leaveRequests[idx].approvedBy === '-' ? 'Admin User' : window.DATA.leaveRequests[idx].approvedBy),
        };

        // Save update to Database
        apiSaveLeave({ ...window.DATA.leaveRequests[idx], action: 'edit' }).then((success) => {
          if (!success) {
            showAlert('Error', 'บันทึกข้อมูลลง Database ไม่สำเร็จ', 'error');
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

      window.DATA.leaveRequests.unshift(newReq);

      // Save to Database
      apiSaveLeave({ ...newReq, action: 'add' }).then((success) => {
        if (!success) {
            showAlert('Error', 'บันทึกข้อมูลลง Database ไม่สำเร็จ', 'error');
        }
      });
    }

    closeLeaveModal();
    if (typeof window.refreshLeaveData === 'function') {
      window.refreshLeaveData();
    }
  }

  // ---------- LEAVE EDIT & DELETE ----------
  window.editLeaveRequest = function(id) {
    showLeaveModal(id);
  }

  window.deleteLeaveRequest = function(id) {
    const req = window.DATA.leaveRequests.find(r => r.id === id);
    if (!req) return;

    showConfirmModal({
      title: 'Confirm Deletion',
      message: `Are you sure you want to permanently delete the leave request for "${req.name}" (${req.id})? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        // Remove from local data
        window.DATA.leaveRequests = window.DATA.leaveRequests.filter(r => r.id !== id);

        // Recalculate stats
        const data = window.DATA.leaveRequests;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const onLeaveToday = data.filter(r =>
          (r.status === 'approved' || r.status === 'อนุมัติแล้ว') &&
          r.startRaw <= todayStr &&
          r.endRaw >= todayStr
        );

        window.DATA.leaveStats = {
          total: data.length,
          approved: data.filter(d => d.status === 'approved' || d.status === 'อนุมัติแล้ว').length,
          pending: data.filter(d => d.status === 'pending' || d.status === 'รอการอนุมัติ').length,
          rejected: data.filter(d => d.status === 'rejected' || d.status === 'ไม่อนุมัติ').length,
          peopleOnLeave: onLeaveToday.length,
          totalDays: data.reduce((sum, d) => sum + d.days, 0)
        };

        if (typeof window.refreshLeaveData === 'function') {
          window.refreshLeaveData();
        }

        try {
          // Send to Google Sheets
          const success = await apiSaveLeave({ id, action: 'delete' });
          if (success) {
            console.log('Leave deletion sent to sheets');
            if (typeof showToast === 'function') showToast('Data deleted successfully', 'success');
            setTimeout(() => { if (typeof window.refreshLeaveData === 'function') window.refreshLeaveData(); }, 2000);
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
  window.pageLeaveManagementV2 = function() {
    setTimeout(() => {
      const contentEl = document.getElementById('pageContent');
      if (contentEl) {
        contentEl.innerHTML = window._renderLeaveManagementContentV2();
        if (window.lucide) window.lucide.createIcons({ root: contentEl });
        if (window._leaveActiveTab === 'overview') { setTimeout(window.initLeaveChartsV2, 150); }
      }
    }, 50);

    return `
    <div style="min-height:400px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-3); gap:12px;">
       <div style="width:30px;height:30px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
       <div style="font-size:0.9rem;font-weight:500;">Loading Leave Data...</div>
    </div>`;
  }

  window._renderLeaveManagementContentV2 = function() {
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

    const allRequests = window.DATA.leaveRequests || [];
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

    const employees = window.DATA.employees || [];
    const totalEmp = employees.length || 1;
    const pctApproved = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : '0.0';
    const pctPending = stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : '0.0';
    const pctRejected = stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(1) : '0.0';

    return `
  <!-- Top Action Bar -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
    <div class="tabs" style="display:flex; gap:8px; background:transparent; padding:0; border:none; border-bottom:none; box-shadow:none; margin-bottom:0; align-items:center">
      <button class="text-[12px] font-semibold px-4 py-1.5 tab-btn ${window._leaveActiveTab !== 'empeo' ? 'active' : ''}" onclick="window._leaveActiveTab='overview'; navigate('leave-management')" style="border-radius:12px; cursor:pointer;  display:flex; align-items:center; gap:8px; transition:all 0.2s">
        <i data-lucide="layout-grid" style="width:18px; height:18px"></i> Overview
      </button>
      <button class="text-[12px] font-semibold px-4 py-1.5 tab-btn ${window._leaveActiveTab === 'empeo' ? 'active' : ''}" onclick="window._leaveActiveTab='empeo'; navigate('leave-management')" style="border-radius:12px; cursor:pointer;  display:flex; align-items:center; gap:8px; transition:all 0.2s">
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
          <input type="text" id="empeoSearch" onkeyup="window.filterEmpeoTable(this.value)" placeholder="ค้นหาพนักงาน, รหัส หรือแผนก..." style="background:none; border:none; outline:none; font-size:.8rem; width:100%; font-family:'Prompt', sans-serif; color:var(--text)">
        </div>` : '',
        '_leaveDateRange'
      )}
    </div>
  </div>

  ${window._leaveActiveTab === 'empeo' ? (typeof window.renderEmpeoReport === 'function' ? window.renderEmpeoReport() : '') : `
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
          <div style="width:32px; height:32px; border-radius: 50%; background:${k.color}15; color:${k.color}; display:flex; align-items:center; justify-content:center">
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
        <button onclick="bulkDeleteLeaves()" class="text-[12px] font-semibold px-4 py-1.5 btn btn-sm" style="background:#ef4444; color:#fff; border:none;  border-radius:30px;   display:flex; align-items:center; gap:6px; margin-left:10px">
          <i data-lucide="trash-2" style="width:14px; height:14px"></i> ลบ
        </button>
      </div>
      <button onclick="toggleSelectAllLeaves(false)" style="background:none; border:none; color:#94a3b8; cursor:pointer;  margin-left:4px" title="ยกเลิกการเลือก" class="text-[12px] font-semibold px-4 py-1.5">
        <i data-lucide="x" style="width:16px; height:16px"></i>
      </button>
  </div>

  <!-- Charts Row -->
  <div class="fade-in" style="display:grid; grid-template-columns:420px 1fr 260px; gap:16px; margin-bottom:24px">
    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">สถิติประเภทการลา</div>
      </div>
      <div style="height:220px">
        <canvas id="leaveTypeChart"></canvas>
      </div>
    </div>

    <div class="card" style="padding:20px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
          <div style="font-size:.9rem;font-weight:700">แนวโน้มการลาในแต่ละเดือน</div>
      </div>
      <div style="height:220px">
        <canvas id="leaveTrendChart"></canvas>
      </div>
    </div>

    <!-- Calendar -->
    <div class="card" style="padding:16px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
        <div style="font-size:.8rem; font-weight:700">ปฏิทินการลา</div>
        <div style="display:flex; gap:6px">
          <button style="background:none; border:none; color:var(--text-3); cursor:pointer" class="text-[12px] font-semibold px-4 py-1.5"><i data-lucide="chevron-left" style="width:12px; height:12px"></i></button>
          <div style="font-size:.7rem; font-weight:700" id="calendarMonthLabel"></div>
          <button style="background:none; border:none; color:var(--text-3); cursor:pointer" class="text-[12px] font-semibold px-4 py-1.5"><i data-lucide="chevron-right" style="width:12px; height:12px"></i></button>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:2px; text-align:center">
        ${['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map(d => `<div style="font-size:.6rem; color:var(--text-3); font-weight:600; padding:2px 0">${d}</div>`).join('')}
        ${(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // current month (0-indexed)
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = now.getDate();

        // Build set of days that have leave requests this month
        const leaveDays = new Set();
        const leaveReqs = (window.DATA && window.DATA.leaveRequests) || [];
        leaveReqs.forEach(r => {
          const parseDate = (s) => {
            if (!s || s === '-') return null;
            if (s.includes('-')) return new Date(s);
            if (s.includes('/')) {
              const parts = s.split('/');
              if (parts.length === 3) {
                let y = parseInt(parts[2]); if (y > 2500) y -= 543;
                return new Date(y, parseInt(parts[1])-1, parseInt(parts[0]));
              }
            }
            return null;
          };
          const start = parseDate(r.fromDate || r.startRaw);
          const end = parseDate(r.toDate || r.endRaw || r.fromDate || r.startRaw);
          if (start && end) {
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
              if (d.getFullYear() === year && d.getMonth() === month) {
                leaveDays.add(d.getDate());
              }
            }
          }
        });

        const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
        // Set label after DOM renders
        setTimeout(() => {
          const lbl = document.getElementById('calendarMonthLabel');
          if (lbl) lbl.textContent = thaiMonths[month] + ' ' + (year + 543);
        }, 0);

        let html = '';
        for (let p = 0; p < firstDay; p++) html += '<div></div>';
        for (let d = 1; d <= daysInMonth; d++) {
          const isToday = d === today;
          const hasLeave = leaveDays.has(d);
          html += `
              <div style="height:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; font-size:.65rem; background:${isToday ? 'var(--primary)' : 'transparent'}; color:${isToday ? '#fff' : 'var(--text-2)'}; border-radius:4px; cursor:pointer">
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
              const emp = (window.DATA.employees || []).find(e => e.name === r.name) || {};
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
        <div id="leaveTableContainer" style="display:none;"></div>
        <div style="display:flex; gap:12px; align-items:center">
          <div class="search-box" style="width:200px; background:#f8fafc; padding:8px 12px; border:1px solid var(--border); border-radius:10px">
            <i data-lucide="search" style="width:14px; height:14px; color:var(--text-3)"></i>
            <input type="text" id="leaveSearch" oninput="window._leaveSearchQuery=this.value; searchLeaveTable()" value="${window._leaveSearchQuery || ''}" placeholder="Search..." style="background:none; border:none; outline:none; font-size:.7rem; width:100%; font-family:'Prompt', sans-serif; color:var(--text)">
          </div>

          <button class="text-[12px] font-semibold px-4 py-1.5 btn btn-primary" onclick="showLeaveModal()" style="display:flex; align-items:center; gap:6px;   ">
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
        const emp = (window.DATA.employees || []).find(e => e.name === r.name) || {};
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
                  <button onclick="toggleActionMenu('leave_${r.id}', event)" style="background:none; border:none; color:var(--text-3); cursor:pointer; " class="text-[12px] font-semibold px-4 py-1.5"><i data-lucide="more-vertical" style="width:14px; height:14px"></i></button>
                  <div id="actionMenu_leave_${r.id}" style="display:none; position:absolute; right:100%; top:50%; transform:translateY(-50%); background:#fff; border:1px solid var(--border); border-radius:8px; box-shadow:var(--shadow-md); z-index:100; min-width:100px; padding:4px">
                    <button onclick="editLeaveRequest('${r.id}')" style="width:100%; text-align:left;  background:none; border:none; font-family:Prompt;  cursor:pointer; color:var(--text-2); border-radius:6px" onmouseover="this.style.background='#f4f7fe'" onmouseout="this.style.background='none'" class="text-[12px] font-semibold px-4 py-1.5"><i data-lucide="edit-2" style="width:12px; height:12px; margin-right:6px; vertical-align:middle"></i> แก้ไข</button>
                    <button onclick="deleteLeaveRequest('${r.id}')" style="width:100%; text-align:left;  background:none; border:none; font-family:Prompt;  cursor:pointer; color:#ef4444; border-radius:6px" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'" class="text-[12px] font-semibold px-4 py-1.5"><i data-lucide="trash-2" style="width:12px; height:12px; margin-right:6px; vertical-align:middle"></i> ลบ</button>
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
            <button onclick="bulkDeleteLeaves()" style=" border-radius:6px; border:1px solid #64748b; background:#64748b15; color:#64748b; cursor:pointer; font-family:inherit; " class="text-[12px] font-semibold px-4 py-1.5">Delete</button>
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
          const req = window.DATA.leaveRequests.find(r => r.id === id);
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
          if (typeof window.initLeaveCharts === 'function') setTimeout(window.initLeaveCharts, 150);
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
        window.DATA.leaveRequests = window.DATA.leaveRequests.filter(r => !ids.includes(r.id));

        // Re-calculate stats and refresh
        if (typeof calculateLeaveStats === 'function') calculateLeaveStats();

        const contentEl = document.getElementById('pageContent');
        if (contentEl) {
          contentEl.innerHTML = pageLeaveManagement();
          if (window.lucide) lucide.createIcons({ root: contentEl });
          if (typeof window.initLeaveCharts === 'function') setTimeout(window.initLeaveCharts, 150);
        }
      }
    });
  }

  window.showOrgEmployeeDetails_DEPRECATED = function(nodeId) {
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
      emp = (window.DATA.employees || []).find(e => e.id === node.empId);
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
        avatarHtml = `<div style="width:90px; height:90px; border-radius:50%; background-color:${posBg}; color:${posText}; display:flex; align-items:center; justify-content:center; font-family:'Prompt', sans-serif; font-weight:600; font-size:32px; border:3px solid #f1f5f9; box-shadow:0 8px 16px rgba(0,0,0,0.1); margin: 0 auto;">${nick.substring(0,4)}</div>`;
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
       let parentEmp = parentNode.empId ? (window.DATA.employees || []).find(e => e.id === parentNode.empId) : null;
       reporting = parentEmp ? parentEmp.name : (parentNode.customName || 'Unassigned');
    }

    // Render premium slide-out sidebar details
    sidebar.innerHTML = `
      <div style="padding: 24px; font-family: 'Prompt', sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <h3 style="margin:0; font-size:1.1rem; font-weight:700; color:var(--text)">Employee Details</h3>
          <button onclick="document.getElementById('teamStructureSidebar').style.display='none'" style="background:none; border:none; color:var(--text-3);  cursor:pointer" class="text-[12px] font-semibold px-4 py-1.5">&times;</button>
        </div>
        <div style="text-align:center; margin-bottom:24px">
          ${avatarHtml}
          <h4 style="margin:12px 0 4px; font-size:1rem; font-weight:700; color:var(--text)">${name}</h4>
          <div style="font-size:0.75rem; color:var(--text-3); font-weight:500">${nameEn}</div>
          <span style="display:inline-block; margin-top:8px; padding:4px 12px; border-radius: 50%; background:var(--primary)15; color:var(--primary); font-size:0.7rem; font-weight:600">${pos}</span>
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
              <button onclick="this.parentNode.parentNode.parentNode.remove()" style=" background:#e2e8f0; border:none; border-radius:8px; cursor:pointer;" class="text-[12px] font-semibold px-4 py-1.5">Close</button>
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
         
         // Populate Title dropdown dynamically from window.DATA.employees
         const titleSelect = document.getElementById('orgEditTitle');
         if (titleSelect && typeof DATA !== 'undefined' && window.DATA.employees) {
             const posOrder = ['director', 'manager', 'assistant manager', 'senior', 'junior'];
             const uniquePositions = [...new Set(window.DATA.employees.map(e => (e.pos || '').trim()).filter(Boolean))].sort((a, b) => {
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
             if (typeof DATA !== 'undefined' && window.DATA.employees) {
                 const q = query.toLowerCase().trim();
                 const emps = window.DATA.employees.filter(e => {
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
                         if (n.empId && typeof DATA !== 'undefined' && window.DATA.employees) {
                             const ids = n.empId.split(',');
                             const emps = ids.map(id => window.DATA.employees.find(x => x.id === id)).filter(Boolean);
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
         if (node.empId && typeof DATA !== 'undefined' && window.DATA.employees) {
             const ids = node.empId.split(',');
             emps = ids.map(id => window.DATA.employees.find(e => e.id === id)).filter(Boolean);
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
                     avatarHtml = `<div style="width:${size}px; height:${size}px; border-radius:50%; background-color:#6c5ce7; color:#ffffff; display:flex; align-items:center; justify-content:center; font-family:'Prompt', sans-serif; font-weight:800; font-size:${nick.length > 5 ? '10px' : (nick.length > 3 ? '12px' : '15px')}; line-height:1.2; border:none; box-shadow:0 6px 12px -2px #6c5ce780; padding:0 4px; box-sizing:border-box; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${nick}</div>`;
                 }
                 
                 cardsHtml += `
                   <div class="card org-card" onclick="if(!window.orgIsEditMode) window.showOrgEmployeeDetails('${node.id}')" style="width:250px; padding:18px; border-radius:20px; border:1px solid rgba(0,0,0,0.04); position:relative; background:#ffffff; box-shadow:0 8px 30px rgba(0,0,0,0.04), 0 2px 10px rgba(0,0,0,0.02); transition:all 0.3s cubic-bezier(0.25, 1, 0.5, 1); cursor:${window.orgIsEditMode ? 'default' : 'pointer'};" onmouseover="this.style.transform='${window.orgIsEditMode?'none':'translateY(-4px) scale(1.02)'}'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.03)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 8px 30px rgba(0,0,0,0.04), 0 2px 10px rgba(0,0,0,0.02)';">
                      ${peopleToRender.length === 1 ? editControls : ''}
                      <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
                         ${avatarHtml}
                         <div style="text-align:left; flex:1; min-width:0;">
                            <div style="font-weight:600; font-size:0.95rem; color:#1c1c1e; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; letter-spacing:-0.01em;" title="${pName}">${pName}</div>
                            <div style="font-size:0.75rem; color:#8e8e93; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${pPos}">${pPos}</div>
                         </div>
                      </div>
                      <div style="border-top:1px solid rgba(0,0,0,0.04); padding-top:12px; font-size:0.75rem; font-weight:600; color:#8e8e93; display:flex; align-items:center; justify-content:center; gap:6px;">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
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
               <div class="card org-card" onclick="if(!window.orgIsEditMode) window.showOrgEmployeeDetails('${node.id}')" style="width:${w}px; padding:${p}; border-radius:18px; border:1px solid rgba(0,0,0,0.04); position:relative; z-index:5; background:#ffffff; box-shadow:0 8px 30px rgba(0,0,0,0.04), 0 2px 10px rgba(0,0,0,0.02); display:flex; flex-direction:column; align-items:flex-start; transition:all 0.3s cubic-bezier(0.25, 1, 0.5, 1); cursor:${window.orgIsEditMode ? 'default' : 'pointer'};" onmouseover="this.style.transform='${window.orgIsEditMode?'none':'translateY(-4px) scale(1.02)'}'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.03)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 8px 30px rgba(0,0,0,0.04), 0 2px 10px rgba(0,0,0,0.02)';">
                  ${editControls}
                  <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px; width:100%;">
                      <div style="width:28px; height:28px; border-radius: 50%; background:${bgAlpha}; color:${bColor}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
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
             const ltc = document.getElementById('leaveTableContainer');
             if (ltc) ltc.innerHTML = ''; // Reverting failed injection
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

  window.initLeaveChartsV2 = function() {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { display: false } }
    };

    // Leave Type Chart (Bar) - Improved counting and spacing
    const leaveTypes = ['ลาพักร้อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอด / ลาเลี้ยงดูบุตร', 'ลาเพื่อการฌาปนกิจศพ', 'อบรม / สัมมนา', 'วันหยุดชดเชย', 'อื่นๆ'];
    const reqs = window._filteredLeaveRequests || window.DATA.leaveRequests || [];

    const typeData = leaveTypes.map(t => {
      const matchingReqs = reqs.filter(r => {
        const rType = (r.type || '').trim();
        if (t === 'วันหยุดชดเชย') return rType === 'วันหยุดชดเชย' || rType === 'Compensatory';
        return rType === t;
      });
      return matchingReqs.reduce((sum, r) => sum + (parseFloat(r.days) || 0), 0);
    });

    // Add count for types not in the list to "อื่นๆ"
    const knownTypes = new Set(['ลาพักร้อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอด / ลาเลี้ยงดูบุตร', 'ลาเพื่อการฌาปนกิจศพ', 'อบรม / สัมมนา', 'วันหยุดชดเชย', 'Compensatory']);
    const otherCount = reqs.filter(r => !knownTypes.has((r.type || '').trim()))
                           .reduce((sum, r) => sum + (parseFloat(r.days) || 0), 0);
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
              '#24204D', // ลาพักร้อน
              '#3F358C', // ลากิจ
              '#5048E5', // ลาป่วย
              '#635BFF', // ลาคลอด / ลาเลี้ยงดูบุตร
              '#818CF8', // ลาเพื่อการฌาปนกิจศพ
              '#9EA5F9', // อบรม / สัมมนา
              '#B4BCFD', // วันหยุดชดเชย
              '#D2D6FF'  // อื่นๆ
            ],
            borderRadius: 6,
            barThickness: 16
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
        labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
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
    const pendingCount = reqs.filter(r => r.status === 'pending' || r.status === 'รอการอนุมัติ').length;
    const approvedCount = reqs.filter(r => r.status === 'approved' || r.status === 'อนุมัติแล้ว').length;
    const rejectedCount = reqs.filter(r => r.status === 'rejected' || r.status === 'ไม่อนุมัติ').length;
    
    // Fallback in case there are no requests to ensure chart renders a placeholder gray ring
    const hasData = pendingCount > 0 || approvedCount > 0 || rejectedCount > 0;
    const chartData = hasData ? [pendingCount, approvedCount, rejectedCount] : [1];
    const chartColors = hasData ? ['#FDE68A', '#7FD1B9', '#FCA5A5'] : ['#e2e8f0'];
    const chartLabels = hasData ? ['รอการอนุมัติ', 'อนุมัติแล้ว', 'ไม่อนุมัติ'] : ['ไม่มีข้อมูล'];

    const statusCtx = document.getElementById('leaveStatusChart')?.getContext('2d');
    if (statusCtx) {
      Chart.getChart(statusCtx.canvas)?.destroy();
      new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: chartLabels,
          datasets: [{
            data: chartData,
            backgroundColor: chartColors,
            borderWidth: 0,
            cutout: '75%'
          }]
        },
        options: {
          ...commonOptions,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: hasData } // Disable tooltips if no data
          }
        }
      });
    }
  }

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

// ============================================================
// Empeo Report (inlined from pages_v6.js to avoid loading 867KB)
// ============================================================

window.renderEmpeoReport = function() {
  if (!window._empeoDataLoaded) {
      window.loadEmpeoData();
      return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; color: var(--text-3);">
          <div style="width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: rotation 1s linear infinite; margin-bottom: 16px;"></div>
          <div style="font-size: 1.1rem; font-weight: 600; font-family: Prompt, sans-serif; color: var(--text-2);">Loading...</div>
        </div>
      `;
  }

  let startDate, endDate;
  if (window._leaveDateRange && window._leaveDateRange.includes(' to ')) {
      const [s, e] = window._leaveDateRange.split(' to ');
      startDate = new Date(s);
      endDate = new Date(e);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          const now = new Date();
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
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
  const deptEmpIds = new Set(deptEmployees.map(e => String(e.id || '').trim()).filter(Boolean));
  const allEmpeoEmployees = window.DATA.empeoEmployees || [];
  const employees = deptEmpIds.size > 0 
      ? allEmpeoEmployees.filter(e => deptEmpIds.has(String(e.id || '').trim()))
      : allEmpeoEmployees;
      
  // Fallback: If no employees match after filtering, use all Empeo employees so data is never blank
  const finalEmployees = employees.length > 0 ? employees : allEmpeoEmployees;
  
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

  const employeeSummaries = {};
  
  finalEmployees.forEach(r => {
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
    const starMark = hName ? `<span style='color:#f97316;font-size:.5rem'>★</span>` : '';
    return `<th class="empeo-day-th" style="font-size:.6rem; text-align:center; position:sticky; top:36px; background:${headerBg(d)}; z-index:10; min-width:26px; padding:3px 2px 4px; border-bottom:2px solid var(--border); white-space:nowrap; line-height:1.4; cursor:${hName?'help':'default'}"${title}>${d.dayNum}${starMark}<br><span style='font-size:.55rem;color:${hName?'#f97316':'var(--text-3)'}'>${d.dayOfWeek}</span></th>`;
  }).join('');
  
  let rowsHtml = finalEmployees.map(r => {
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
          <td style="font-size:.7rem; text-align:center; font-family:'Prompt', sans-serif; position:sticky; left:0; background:#fff; z-index:5; box-shadow: 2px 0 5px -2px rgba(0,0,0,0.05); min-width:60px">${r.id || '-'}</td>
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
          { label: 'ขาดงาน', val: fmt(totalAbsent), unit: 'วัน', sub: 'ไม่รวมวันหยุด', icon: 'user-x', color: '#EF4444', shadow: 'rgba(239,68,68,0.3)' },
          { label: 'มาสาย', val: fmt(totalLateMins), unit: 'นาที', sub: 'รวมทุกทีม', icon: 'clock', color: '#F59E0B', shadow: 'rgba(245,158,11,0.3)' },
          { label: 'กลับก่อน', val: fmt(totalLeaveEarlyMins), unit: 'นาที', sub: 'รวมทุกทีม', icon: 'log-out', color: '#FB923C', shadow: 'rgba(251,146,60,0.3)' },
          { label: 'ลาป่วย', val: fmt(totalSick), unit: 'วัน', sub: 'รวมทุกทีม', icon: 'thermometer', color: '#60A5FA', shadow: 'rgba(96,165,250,0.3)' },
          { label: 'ลากิจ', val: fmt(totalPersonal), unit: 'วัน', sub: 'รวมทุกทีม', icon: 'briefcase', color: '#A78BFA', shadow: 'rgba(167,139,250,0.3)' },
          { label: 'ลาพักร้อน', val: fmt(totalVacation), unit: 'วัน', sub: 'รวมทุกทีม', icon: 'sun', color: '#34D399', shadow: 'rgba(52,211,153,0.3)' },
          { label: 'ลาอื่นๆ', val: fmt(totalOther), unit: 'วัน', sub: 'รวมทุกทีม', icon: 'more-horizontal', color: '#94A3B8', shadow: 'rgba(148,163,184,0.3)' }
      ].map(k => `
      <div class="stat-card" style="padding:18px 16px; display:flex; flex-direction:column; gap:12px">
        <div style="width:40px; height:40px; border-radius:50%; background:${k.color}; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px ${k.shadow}; flex-shrink:0">
          <i data-lucide="${k.icon}" style="width:18px; height:18px"></i>
        </div>
        <div>
          <div style="font-size:.65rem; color:var(--text-3); font-weight:600; margin-bottom:4px; font-family:'Prompt', sans-serif">${k.label}</div>
          <div style="font-size:1.4rem; font-weight:800; color:var(--text); font-family:'Prompt', sans-serif; line-height:1.1">${k.val} <span style="font-size:.7rem; font-weight:400; color:var(--text-3)">${k.unit}</span></div>
          <div style="font-size:.62rem; color:${k.color}; font-weight:600; margin-top:4px">${k.sub}</div>
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

// ============================================================
// Empeo Table Filter
// ============================================================

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
