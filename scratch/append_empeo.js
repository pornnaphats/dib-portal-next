
window.renderEmpeoReport = function() {
  const data = window.DATA.empeoReport || [];
  
  // Calculate totals
  let totalLateMins = 0;
  let totalLeaveEarlyMins = 0;
  let totalAbsent = 0;
  let totalSick = 0;
  let totalVacation = 0;
  let totalPersonal = 0;

  data.forEach(r => {
    totalLateMins += (r.lateMins || 0);
    totalLeaveEarlyMins += (r.leaveEarlyMins || 0);
    totalAbsent += (r.absent || 0);
    totalSick += (r.sickLeave || 0);
    totalVacation += (r.vacationLeave || 0);
    totalPersonal += (r.personalLeave || 0);
  });

  return `
    <!-- KPI Row for Empeo -->
    <div class="fade-in" style="display:grid; grid-template-columns:repeat(6,1fr); gap:16px; margin-bottom:24px">
      ${[
          { label: 'มาสายสะสม', val: totalLateMins + ' นาที', sub: 'รวมทุกคน', icon: 'clock', color: '#F87171' },
          { label: 'กลับก่อนสะสม', val: totalLeaveEarlyMins + ' นาที', sub: 'รวมทุกคน', icon: 'log-out', color: '#FBBF24' },
          { label: 'ขาดงาน', val: totalAbsent + ' วัน', sub: 'รวมทุกคน', icon: 'user-x', color: '#EF4444' },
          { label: 'ลาป่วย', val: totalSick + ' วัน', sub: 'รวมทุกคน', icon: 'thermometer', color: '#60A5FA' },
          { label: 'ลากิจ', val: totalPersonal + ' วัน', sub: 'รวมทุกคน', icon: 'briefcase', color: '#A78BFA' },
          { label: 'ลาพักร้อน', val: totalVacation + ' วัน', sub: 'รวมทุกคน', icon: 'sun', color: '#34D399' }
      ].map(k => `
      <div class="stat-card" style="padding:16px; display:flex; flex-direction:column; gap:8px">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <div style="width:32px; height:32px; border-radius:8px; background:${k.color}15; color:${k.color}; display:flex; align-items:center; justify-content:center">
            <i data-lucide="${k.icon}" style="width:18px; height:18px"></i>
          </div>
        </div>
        <div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--text); margin-bottom:4px; font-family:'Outfit', sans-serif">${k.val}</div>
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
        <div class="search-box" style="width:250px; background:#f8fafc; padding:8px 12px; border:1px solid var(--border); border-radius:10px">
          <i data-lucide="search" style="width:14px; height:14px; color:var(--text-3)"></i>
          <input type="text" id="empeoSearch" onkeyup="window.filterEmpeoTable(this.value)" placeholder="ค้นหาชื่อพนักงาน..." style="background:none; border:none; outline:none; font-size:.7rem; width:100%; font-family:'Kanit', sans-serif; color:var(--text)">
        </div>
      </div>
      <div class="table-wrap" style="overflow-x:auto; max-height: 600px">
        <table class="data-table" id="empeoTable" style="width:100%">
          <thead>
            <tr>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">รหัส</th>
              <th style="font-size:.7rem; text-align:left; position:sticky; top:0; background:#f8fafc; z-index:10">ชื่อ - สกุล</th>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">ขาดงาน<br>(วัน)</th>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">มาสาย<br>(ครั้ง)</th>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">มาสาย<br>(นาที)</th>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">กลับก่อน<br>(ครั้ง)</th>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">กลับก่อน<br>(นาที)</th>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">ลืมรูดเข้า</th>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">ลืมรูดออก</th>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">ลาป่วย</th>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">ลากิจ</th>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">พักร้อน</th>
              <th style="font-size:.7rem; text-align:center; position:sticky; top:0; background:#f8fafc; z-index:10">ลาอื่นๆ</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(r => `
              <tr class="empeo-row">
                <td style="font-size:.75rem; text-align:center; font-family:'Outfit'">${r.id || '-'}</td>
                <td style="font-size:.75rem; font-weight:500" class="emp-name">${r.name || '-'}</td>
                <td style="font-size:.75rem; text-align:center; color:${r.absent > 0 ? '#ef4444' : 'inherit'}; font-weight:${r.absent > 0 ? '700' : 'normal'}">${r.absent || 0}</td>
                <td style="font-size:.75rem; text-align:center; color:${r.lateTimes > 0 ? '#f59e0b' : 'inherit'}; font-weight:${r.lateTimes > 0 ? '700' : 'normal'}">${r.lateTimes || 0}</td>
                <td style="font-size:.75rem; text-align:center; color:${r.lateMins > 0 ? '#f59e0b' : 'inherit'}; font-weight:${r.lateMins > 0 ? '700' : 'normal'}">${r.lateMins || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.leaveEarlyTimes || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.leaveEarlyMins || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.forgetIn || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.forgetOut || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.sickLeave || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.personalLeave || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.vacationLeave || 0}</td>
                <td style="font-size:.75rem; text-align:center">${r.otherLeave || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

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
