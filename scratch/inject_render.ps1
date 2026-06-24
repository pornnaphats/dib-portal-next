$content = Get-Content js/pages.js -Raw -Encoding UTF8

$empeoLogic = @"
function renderEmpeoReport() {
    if (!window.DATA || !window.DATA.empeoReport) return '<div style="padding:24px; text-align:center;">No Empeo Data Available. Please include empeo_data.js.</div>';
    const report = window.DATA.empeoReport;
    
    let totalPresent = 0, totalAbsent = 0, totalLateTimes = 0, totalLateMins = 0;
    let sortedLates = [...report].sort((a, b) => b.lateMins - a.lateMins);
    let sortedAbsents = [...report].sort((a, b) => b.absent - a.absent);

    report.forEach(r => {
        totalPresent += r.present;
        totalAbsent += r.absent;
        totalLateTimes += r.lateTimes;
        totalLateMins += r.lateMins;
    });

    return \`
        <!-- Empeo KPI -->
        <div class="fade-in" style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px">
            <div class="stat-card" style="padding:20px; display:flex; flex-direction:column; gap:8px">
                <div style="font-size:.75rem; color:var(--text-3); font-weight:600">พนักงานเข้างานรวม</div>
                <div style="font-size:1.8rem; font-weight:800; color:var(--text-1)">\${totalPresent} <span style="font-size:.9rem; font-weight:500; color:var(--text-3)">วัน</span></div>
            </div>
            <div class="stat-card" style="padding:20px; display:flex; flex-direction:column; gap:8px">
                <div style="font-size:.75rem; color:var(--text-3); font-weight:600">มาสายรวมทั้งหมด</div>
                <div style="font-size:1.8rem; font-weight:800; color:#F59E0B">\${totalLateTimes} <span style="font-size:.9rem; font-weight:500; color:var(--text-3)">ครั้ง (\${totalLateMins} นาที)</span></div>
            </div>
            <div class="stat-card" style="padding:20px; display:flex; flex-direction:column; gap:8px">
                <div style="font-size:.75rem; color:var(--text-3); font-weight:600">ขาดงานรวมทั้งหมด</div>
                <div style="font-size:1.8rem; font-weight:800; color:#EF4444">\${totalAbsent} <span style="font-size:.9rem; font-weight:500; color:var(--text-3)">วัน</span></div>
            </div>
            <div class="stat-card" style="padding:20px; display:flex; flex-direction:column; gap:8px">
                <div style="font-size:.75rem; color:var(--text-3); font-weight:600">พนักงานในรายงาน</div>
                <div style="font-size:1.8rem; font-weight:800; color:var(--text-1)">\${report.length} <span style="font-size:.9rem; font-weight:500; color:var(--text-3)">คน</span></div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px">
            <!-- Top 5 Late -->
            <div class="card" style="padding:20px;">
                <div style="font-size:.9rem; font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:8px; color:#F59E0B">
                    <i data-lucide="clock" style="width:18px; height:18px;"></i> Top 5 พนักงานมาสายบ่อยสุด
                </div>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    \${sortedLates.slice(0, 5).map(emp => \`
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:#f8f9fb; border-radius:8px">
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-weight:600; font-size:.85rem">\${emp.name}</span>
                                <span style="font-size:.7rem; color:var(--text-3)">\${emp.id}</span>
                            </div>
                            <div style="text-align:right">
                                <span style="font-weight:700; color:#F59E0B">\${emp.lateMins}</span> <span style="font-size:.7rem; color:var(--text-3)">นาที</span>
                                <div style="font-size:.65rem; color:var(--text-3)">\${emp.lateTimes} ครั้ง</div>
                            </div>
                        </div>
                    \`).join('')}
                </div>
            </div>

            <!-- Top 5 Absent -->
            <div class="card" style="padding:20px;">
                <div style="font-size:.9rem; font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:8px; color:#EF4444">
                    <i data-lucide="user-x" style="width:18px; height:18px;"></i> Top 5 พนักงานขาดงานบ่อยสุด
                </div>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    \${sortedAbsents.slice(0, 5).map(emp => \`
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:#f8f9fb; border-radius:8px">
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-weight:600; font-size:.85rem">\${emp.name}</span>
                                <span style="font-size:.7rem; color:var(--text-3)">\${emp.id}</span>
                            </div>
                            <div style="text-align:right">
                                <span style="font-weight:700; color:#EF4444">\${emp.absent}</span> <span style="font-size:.7rem; color:var(--text-3)">วัน</span>
                            </div>
                        </div>
                    \`).join('')}
                </div>
            </div>
        </div>

        <!-- Data Table -->
        <div class="card" style="padding:20px; overflow-x:auto;">
            <div style="font-size:1rem; font-weight:700; margin-bottom:16px;">สถิติรายบุคคล</div>
            <table style="width:100%; border-collapse:collapse; min-width:800px;">
                <thead style="background:#f8f9fb;">
                    <tr>
                        <th style="padding:12px; text-align:left; font-size:.75rem; color:var(--text-3);">รหัสพนักงาน</th>
                        <th style="padding:12px; text-align:left; font-size:.75rem; color:var(--text-3);">ชื่อ-นามสกุล</th>
                        <th style="padding:12px; text-align:center; font-size:.75rem; color:var(--text-3);">มาทำงาน</th>
                        <th style="padding:12px; text-align:center; font-size:.75rem; color:var(--text-3);">สาย (นาที)</th>
                        <th style="padding:12px; text-align:center; font-size:.75rem; color:var(--text-3);">ขาดงาน</th>
                        <th style="padding:12px; text-align:center; font-size:.75rem; color:var(--text-3);">ป่วย/กิจ/พักร้อน</th>
                    </tr>
                </thead>
                <tbody>
                    \${report.map(r => \`
                        <tr style="border-bottom:1px solid #f1f5f9;">
                            <td style="padding:12px; font-size:.8rem; font-weight:600">\${r.id}</td>
                            <td style="padding:12px; font-size:.8rem;">\${r.name}</td>
                            <td style="padding:12px; text-align:center; font-size:.8rem;">\${r.present}</td>
                            <td style="padding:12px; text-align:center; font-size:.8rem; color:\${r.lateMins>0?'#F59E0B':''}">\${r.lateMins}</td>
                            <td style="padding:12px; text-align:center; font-size:.8rem; color:\${r.absent>0?'#EF4444':''}">\${r.absent}</td>
                            <td style="padding:12px; text-align:center; font-size:.8rem;">\${r.sickLeave}/\${r.personalLeave}/\${r.vacationLeave}</td>
                        </tr>
                    \`).join('')}
                </tbody>
            </table>
        </div>
    \`;
}
"@

$oldTarget = "  <!-- KPI Row -->"
$newTarget = "  \`${window._leaveActiveTab === 'empeo' ? renderEmpeoReport() : \``n  <!-- KPI Row -->"

# Now we need to close the backtick at the very end of the Overview tab template string.
# The overview template ends with:
#             if (onConfirm) onConfirm();
#         }, 100);
#       };
#     }
#   
#   function initLeaveCharts() {

# Wait, `pageLeaveManagement` returns a massive template string. We need to find where it ends.
# Let's find the closing backtick of `pageLeaveManagement()` return string.
