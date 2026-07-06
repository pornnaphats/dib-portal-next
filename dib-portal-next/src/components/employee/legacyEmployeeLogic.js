const getWorkloadColor = (hours) => {
  if (typeof window !== 'undefined' && typeof window.getWorkloadColor === 'function' && window.getWorkloadColor !== getWorkloadColor) {
    return window.getWorkloadColor(hours);
  }
  if (hours === 0) return 'var(--text-3)';
  if (hours < 50) return '#ef4444';
  if (hours <= 80) return '#facc15';
  if (hours <= 100) return '#22c55e';
  if (hours <= 120) return '#166534';
  return '#991b1b';
};
if (typeof window !== 'undefined') {
  window.getWorkloadColor = getWorkloadColor;
}


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
    <div class="card fade-in" style="padding:0; overflow:visible">
      <div class="toolbar" style="padding:16px 20px; border-bottom:1px solid var(--border); display:flex; gap:10px; align-items:center; flex-wrap:wrap; overflow:visible">
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
        <button onclick="clearEmployeeFilters()" style="background:#fef2f2; border:1px solid #fecaca; color:#ef4444; font-family:Kanit; font-size:.7rem; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:99px; white-space:nowrap; transition:all 0.2s" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
          <i data-lucide="rotate-ccw" style="width:14px; height:14px"></i> Clear All Filter
        </button>
        <div style="width:1px; height:20px; background:var(--border); margin:0 4px"></div>
        <button onclick="openEmployeeModal()" class="btn btn-primary" style="display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:99px; font-size:.7rem; flex-shrink:0">
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

        // Save update to Database
        apiSaveLeave({ ...DATA.leaveRequests[idx], action: 'edit' }).then((success) => {
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

      DATA.leaveRequests.unshift(newReq);

      // Save to Database
      apiSaveLeave({ ...newReq, action: 'add' }).then((success) => {
        if (!success) {
            showAlert('Error', 'บันทึกข้อมูลลง Database ไม่สำเร็จ', 'error');
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

    return `
    <tr style="background:#fff; position: sticky; top: 0; z-index: 20;">
      <th style="width: 300px; min-width: 300px; padding: 18px 20px; text-align: left; position: sticky; left: 0; top: 0; z-index: 22; background: #fff; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); color: #1e293b; font-weight: 700; vertical-align: middle; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
        <div style="display:flex; align-items:center; gap:8px; height:100%;">
          <i data-lucide="layers" style="width:16px; height:16px; color:#475569;"></i>
          <span>Project / Scope</span>
        </div>
      </th>
      <th style="width: 120px; min-width: 120px; padding: 18px 12px; text-align: center; position: sticky; left: 300px; top: 0; z-index: 22; background: #fff; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); color: #1e293b; font-weight: 700; vertical-align: middle; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
        <div style="display:flex; align-items:center; justify-content:center; gap:6px; height:100%;">
          <i data-lucide="git-branch" style="width:14px; height:14px; color:#64748b;"></i>
          <span>Node</span>
        </div>
      </th>
      <th style="width: 130px; min-width: 130px; padding: 18px 12px; text-align: center; position: sticky; left: 420px; top: 0; z-index: 22; background: #fff; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); color: #1e293b; font-weight: 700; vertical-align: middle; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 var(--border)">
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
    if (!data || data.length === 0) {
      return `<tr><td colspan="${3 + days.length}" style="padding: 40px; text-align: center; color: var(--text-3)">No data found matching the selected criteria</td></tr>`;
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
      <td style="padding: 12px 20px; font-weight: 800; color: #2563eb; border-bottom: 1px solid var(--border); position: sticky; left: 0; z-index: 15; background: #f0f7ff">
        <div style="display: flex; align-items: center; gap: 8px">
          <i data-lucide="layers" style="width: 16px; height: 16px"></i>
          ${group.account}
        </div>
      </td>
      <td colspan="${2 + days.length}" style="border-bottom: 1px solid var(--border); background: #f0f7ff"></td>
    </tr>
    ${group.items.map(item => `
      <tr class="modern-row">
        <td style="padding: 14px 20px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--surface); position: sticky; left: 0; z-index: 10; box-shadow: 2px 0 5px rgba(0,0,0,0.02)">
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
        <td style="padding: 8px 8px; text-align: center; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--surface); position: sticky; left: 300px; z-index: 10; box-shadow: 2px 0 5px rgba(0,0,0,0.02)">
          ${renderNodeBadge(item.node)}
        </td>
        <td style="padding: 8px 8px; text-align: center; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--surface); position: sticky; left: 420px; z-index: 10; box-shadow: 2px 0 5px rgba(0,0,0,0.02)">
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
        <h3 class="section-title" style="margin: 0">Scope Workload Details</h3>
        <button onclick="showAddWorkshipScopeModal()" class="btn btn-primary" style="height: 34px; font-size: 0.8rem">
          <i data-lucide="plus-circle" style="width: 16px; height: 16px"></i> Add Scope
        </button>
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

      if (typeof window.filterScheduleUI === 'function') {
        window.filterScheduleUI();
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
    if (typeof window.showToast === 'function') {
      window.showToast('Saving schedule data...', 'success');
    }

    // 2. Sync to Supabase
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const headers = {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        };
        const dbPayload = {
          id: task.id || ('TASK_' + Date.now()),
          date: dateIso,
          person_id: person.id,
          project: task.acc || '',
          node: task.node || '',
          work_detail: task.title || '',
          percentage: parseInt(task.hours) || 0
        };
        await fetch(`${supabaseUrl}/rest/v1/schedule_tasks`, {
          method: 'POST',
          headers,
          body: JSON.stringify(dbPayload)
        });
        console.log("Schedule saved to Supabase successfully.");
      }
    } catch (err) {
      console.error('Error saving schedule to Supabase:', err);
      if (typeof window.showToast === 'function') {
        window.showToast('Error saving to database', 'error');
      }
    }
  };

  window.apiDeleteScheduleTask = async function (task, person) {
    if (typeof window.showToast === 'function') {
      window.showToast('Task removed from schedule', 'success');
    }

    // 2. Sync to Supabase
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        await fetch(`${supabaseUrl}/rest/v1/schedule_tasks?id=eq.${task.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        console.log("Schedule deleted from Supabase successfully.");
      }
    } catch (err) {
      console.error('Error deleting schedule from Supabase:', err);
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
    const wlColor = (window.getWorkloadColor || getWorkloadColor)(combinedTotalHours);

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
            <input type="text" id="sidebarSearch" placeholder="Search tasks or projects..." onkeyup="filterSidebarTasks()" 
                   style="width:100%; height:44px; padding:0 12px 0 42px; border-radius:14px; border:1.5px solid #f1f5f9; font-size:0.85rem; outline:none; background:#f8fafc; font-family:inherit; transition:all 0.2s; color:#1e293b">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
            <div style="position:relative">
              <select id="sidebarProjectFilter" onchange="filterSidebarTasks()" 
                      style="width:100%; height:40px; padding:0 12px; border-radius:12px; border:1.5px solid #f1f5f9; font-size:0.75rem; font-weight:600; outline:none; background:#f8fafc; cursor:pointer; appearance:none; color:#475569">
                <option value="all">All Projects</option>
                ${projects.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
              <i data-lucide="chevron-down" style="width:14px; height:14px; position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none"></i>
            </div>
            <div style="position:relative">
              <select id="sidebarNodeFilter" onchange="filterSidebarTasks()" 
                      style="width:100%; height:40px; padding:0 12px; border-radius:12px; border:1.5px solid #f1f5f9; font-size:0.75rem; font-weight:600; outline:none; background:#f8fafc; cursor:pointer; appearance:none; color:#475569">
                <option value="all">All Nodes</option>
                ${nodes.map(n => `<option value="${n}">${n}</option>`).join('')}
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
        ${renderUnassignedTasks(tasks)}
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
    const s = document.getElementById('sidebarSearch');
    const p = document.getElementById('sidebarProjectFilter');
    const n = document.getElementById('sidebarNodeFilter');
    if (s) s.value = '';
    if (p) p.value = 'all';
    if (n) n.value = 'all';
    filterSidebarTasks();
  };

  window.filterSidebarTasks = function () {
    const q = document.getElementById('sidebarSearch')?.value.toLowerCase() || '';
    const proj = document.getElementById('sidebarProjectFilter')?.value || 'all';
    const node = document.getElementById('sidebarNodeFilter')?.value || 'all';

    const allTasks = getTasksFromScope();
    const filtered = allTasks.filter(t => {
      const matchQ = t.title.toLowerCase().includes(q) || t.acc.toLowerCase().includes(q);
      const matchProj = proj === 'all' || t.acc === proj;
      const matchNode = node === 'all' || t.node === node;
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
          const wlColor = (window.getWorkloadColor || getWorkloadColor)(totalHours);

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
          const wlColorHoliday = (window.getWorkloadColor || getWorkloadColor)(holidayTotalPct);

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

  window.openEmployeeModal = function (editId = "") {
    const isEdit = !!editId;
    const modalId = 'addEmployeeModal';
    const dataObj = window.DATA || DATA || {};
    const emp = isEdit ? (dataObj.employees || []).find(e => e.id === editId) : null;

    if (isEdit && !emp) {
      if (typeof window.showAlert === 'function') {
        window.showAlert('ไม่พบข้อมูล', 'ไม่พบข้อมูลพนักงานที่ต้องการแก้ไข', 'error');
      } else {
        alert('ไม่พบข้อมูลพนักงานที่ต้องการแก้ไข');
      }
      return;
    }

    const posOrder = ['director', 'manager', 'assistant manager', 'senior', 'junior'];
    const uniquePositions = [...new Set((dataObj.employees || []).map(e => (e.pos || '').trim()).filter(Boolean))].sort((a, b) => {
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
      @keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    </style>
  `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) window.lucide.createIcons({ root: document.getElementById(modalId) });

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
      window.handlePosChange();
    };

    window.handleTeamChange = function () {
      window.handlePosChange();
    };

    // Initial call if editing
    if (isEdit) window.handlePosChange();
  };

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
    const birth = (bDay && bMonth) ? `${bDay}/${bMonth}/${bYear || '-'}` : "-";

    const pos = document.getElementById('empPos').value;
    const team = document.getElementById('empTeam').value;
    const status = document.getElementById('empStatus').value;
    const shift = document.getElementById('empShift').value;
    const off = document.getElementById('empOff').value;
    const empType = document.getElementById('empType').value;

    const emailUser = document.getElementById('empEmailUser').value.trim();
    const email = emailUser ? `${emailUser}@realsmart.co.th` : '';

    const alertFn = window.showAlert || (typeof showAlert === 'function' ? showAlert : alert);

    if (!digits || !name || !nick) { alertFn('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกรหัส ชื่อ และชื่อเล่นพนักงาน', 'warning'); return; }

    if ((bDay || bMonth) && (!bDay || !bMonth)) {
      alertFn('ข้อมูลไม่สมบูรณ์', 'กรุณาเลือกทั้งวันและเดือนเกิดให้ครบถ้วน', 'warning');
      return;
    }
    if (!pos) { alertFn('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกตำแหน่งของพนักงาน', 'warning'); return; }

    if (pos !== 'Director' && empType !== 'พนักงานสัญญาจ้าง' && !team) { alertFn('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกทีมที่พนักงานสังกัด', 'warning'); return; }
    if (team !== 'Call Center' && !shift) { alertFn('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกกะเวลาทำงาน', 'warning'); return; }
    if (team !== 'Call Center' && !off) { alertFn('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกวันหยุดพนักงาน', 'warning'); return; }

    if (!empType) { alertFn('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกประเภทพนักงาน', 'warning'); return; }
    if (!status) { alertFn('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกสถานะปัจจุบัน', 'warning'); return; }

    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="spin" data-lucide="refresh-cw" style="width:16px; height:16px; animation:spin 1s linear infinite"></i> กำลังบันทึก...';
    btn.disabled = true;
    if (window.lucide) window.lucide.createIcons({ root: btn });

    const payload = {
      action: isEdit ? 'edit' : 'add',
      id: id.trim(),
      name: name.trim(),
      nameEn: nameEn.trim(),
      nickname: nick || '-',
      email: email || '-',
      birthdate: birth || '-',
      position: pos || '-',
      team: team || '-',
      shift: shift || '-',
      offdays: off || '-',
      status: status,
      empType: empType
    };

    const dataObj = window.DATA || DATA || {};

    try {
      const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';

      console.log("Submitting Employee Data...", payload);

      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });

      console.log("Sync request sent to Google Sheets");

      if (isEdit) {
        const idx = (dataObj.employees || []).findIndex(e => e.id === editId);
        if (idx !== -1) {
          dataObj.employees[idx] = {
            ...dataObj.employees[idx],
            ...payload,
            dept: payload.team,
            pos: payload.position
          };
        }
      } else {
        if (!dataObj.employees) dataObj.employees = [];
        dataObj.employees.push({
          ...payload,
          dept: payload.team,
          pos: payload.position
        });
      }

      if (document.getElementById('addEmployeeModal')) {
        document.getElementById('addEmployeeModal').remove();
      }
      const contentEl = document.getElementById('pageContent');
      if (contentEl) {
        contentEl.innerHTML = window.pageEmployee();
        if (window.lucide) window.lucide.createIcons({ root: contentEl });
        if (typeof window.initEmployeeCharts === 'function') {
          setTimeout(window.initEmployeeCharts, 100);
        }
      }

      if (typeof window.showToast === 'function') {
        window.showToast(isEdit ? 'Data updated successfully' : 'New employee added successfully', 'success');
      }

    } catch (err) {
      console.error("Submission Error:", err);
      if (typeof window.showToast === 'function') window.showToast('Error submitting data', 'error');
    } finally {
      if (btn) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        if (window.lucide) window.lucide.createIcons({ root: btn });
      }
    }
  };

  window.editEmployee = function (id) {
    window.openEmployeeModal(id);
  };

  window.deleteEmployee = async function (id) {
    const confirmFn = window.showConfirmModal || showConfirmModal;
    const dataObj = window.DATA || DATA || {};
    
    if (typeof confirmFn === 'function') {
      confirmFn({
        title: 'Confirm Deletion',
        message: 'Are you sure you want to permanently delete employee ' + id + '? This action cannot be undone.',
        confirmText: 'Delete Permanently',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: async () => {
          try {
            const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';

            await fetch(WEB_APP_URL, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({ action: 'delete', id: id })
            });

            if (dataObj.employees) {
              dataObj.employees = dataObj.employees.filter(e => e.id !== id);
              if (window.DATA) window.DATA.employees = dataObj.employees;
            }

            const contentEl = document.getElementById('pageContent');
            if (contentEl) {
              contentEl.innerHTML = window.pageEmployee();
              if (window.lucide) window.lucide.createIcons({ root: contentEl });
              if (typeof window.initEmployeeCharts === 'function') {
                setTimeout(window.initEmployeeCharts, 100);
              }
            }

            if (typeof window.showToast === 'function') {
              window.showToast('Data deleted successfully', 'success');
            }
          } catch (err) {
            console.error("Error deleting employee:", err);
            if (typeof window.showToast === 'function') {
              window.showToast('Error deleting data', 'error');
            }
          }
        }
      });
    } else {
      if (confirm('Are you sure you want to permanently delete employee ' + id + '? This action cannot be undone.')) {
        try {
          const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';
          await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'delete', id: id })
          });
          if (dataObj.employees) {
            dataObj.employees = dataObj.employees.filter(e => e.id !== id);
            if (window.DATA) window.DATA.employees = dataObj.employees;
          }
          const contentEl = document.getElementById('pageContent');
          if (contentEl) {
            contentEl.innerHTML = window.pageEmployee();
            if (window.lucide) window.lucide.createIcons({ root: contentEl });
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  