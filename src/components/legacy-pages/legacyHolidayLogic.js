


// ==========================================
// 🟢 1. HELPER FUNCTIONS สำหรับจัดการวันหยุด (BULK IMPORT ONLY)
// ==========================================
// ฟังก์ชันเปิด Modal - รูปแบบกรอกหลายวันอย่างเดียว คลุมเต็มจอ 100%
window.openAddHolidayModal = function() {
    const existing = document.getElementById("addHolidayModal");
    if (existing) existing.remove();
    const modalHtml = `
    <div id="addHolidayModal" style="
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: modalFadeIn 0.2s ease-out;
    ">
      <div style="
        background: #ffffff;
        border-radius: 20px;
        padding: 28px;
        width: 100%;
        max-width: 520px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        font-family: Prompt, sans-serif;
        position: relative;
        z-index: 1000000;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #24204D;">เพิ่มวันหยุดนักขัตฤกษ์</h3>
          <button onclick="closeAddHolidayModal()" style="background: none; border: none; cursor: pointer; color: #8f97b0; padding: 4px;">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>

        <form id="formBatchHoliday" onsubmit="submitBatchHolidays(event)" style="display: flex; flex-direction: column; gap: 16px;">
          <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 12px 14px; font-size: 0.78rem; color: #4338ca; line-height: 1.6;">
            💡 <strong>รูปแบบการกรอก:</strong> วันที่ (YYYY-MM-DD), ชื่อวันหยุด (1 วันต่อ 1 บรรทัด)<br/>
            <u>ตัวอย่าง:</u><br/>
            2026-01-01, วันขึ้นปีใหม่<br/>
            2026-04-13, วันสงกรานต์
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #4b5675; margin-bottom: 6px;">รายชื่อวันหยุดนักขัตฤกษ์</label>
            <textarea id="batchHolidayText" rows="8" required style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #eef0f6; font-size: 0.85rem; outline: none; box-sizing: border-box; font-family: monospace; line-height: 1.5;"></textarea>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 6px; justify-content: flex-end;">
            <button type="button" onclick="closeAddHolidayModal()" style="height: 32px; padding: 0 16px; border-radius: 99px; border: 1px solid #eef0f6; background: #f4f4fb; color: #4b5675; font-weight: 500; cursor: pointer; font-size: 0.75rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
              <i data-lucide="x" style="width: 14px; height: 14px;"></i>
              Cancel
            </button>
            <button type="submit" id="btnSubmitBatchHoliday" style="height: 32px; padding: 0 16px; border-radius: 99px; border: none; background: #635bff; color: white; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.75rem; box-shadow: 0 2px 8px rgba(99, 91, 255, 0.2);">
              <i data-lucide="save" style="width: 14px; height: 14px;"></i>
              <span>Save</span>
            </button>
          </div>
        </form>

      </div>
    </div>
    <style>
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    </style>
  `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) {
        window.lucide.createIcons({
            root: document.getElementById("addHolidayModal")
        });
    }
};
window.closeAddHolidayModal = function() {
    const modal = document.getElementById("addHolidayModal");
    if (modal) modal.remove();
};
// บันทึกรายการวันหยุดหลายๆ วันพร้อมกัน (Bulk Insert)
window.submitBatchHolidays = async function(e) {
    e.preventDefault();
    const batchText = document.getElementById("batchHolidayText")?.value || "";
    const btnSubmit = document.getElementById("btnSubmitBatchHoliday");
    const lines = batchText.split('\
').filter((line)=>line.trim() !== "");
    if (lines.length === 0) {
        if (window.showAlert) {
            window.showAlert("แจ้งเตือน", "กรุณากรอกข้อมูลวันหยุดอย่างน้อย 1 รายการ", "warning");
        } else {
            alert("กรุณากรอกข้อมูลวันหยุดอย่างน้อย 1 รายการ");
        }
        return;
    }
    const payloadList = [];
    for(let i = 0; i < lines.length; i++){
        const parts = lines[i].split(',');
        if (parts.length < 2) {
            const msg = `บรรทัดที่ ${i + 1} รูปแบบไม่ถูกต้อง (ต้องเป็น: YYYY-MM-DD, ชื่อวันหยุด)`;
            if (window.showAlert) {
                window.showAlert("รูปแบบข้อมูลไม่ถูกต้อง", msg, "danger");
            } else {
                alert(msg);
            }
            return;
        }
        const dateStr = parts[0].trim();
        const nameStr = parts.slice(1).join(',').trim();
        if (!dateStr || !nameStr) {
            const msg = `บรรทัดที่ ${i + 1} กรอกข้อมูลไม่ครบถ้วน`;
            if (window.showAlert) {
                window.showAlert("ข้อมูลไม่ครบถ้วน", msg, "danger");
            } else {
                alert(msg);
            }
            return;
        }
        const generatedId = `hol_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`;
        payloadList.push({
            id: generatedId,
            date: dateStr,
            name: nameStr
        });
    }
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i data-lucide="loader-2" class="animate-spin" style="width: 18px; height: 18px;"></i><span>กำลังบันทึก (${payloadList.length})...</span>`;
    if (window.lucide) window.lucide.createIcons({
        root: btnSubmit
    });
    const supabaseUrl = "https://jfxesvvswpgeaxhhnnyt.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E";
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/public_holidays`, {
            method: "POST",
            headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
                Prefer: "return=representation"
            },
            body: JSON.stringify(payloadList)
        });
        if (res.ok) {
            const successMsg = `บันทึกสำเร็จทั้งหมด ${payloadList.length} วันหยุดเรียบร้อยแล้ว!`;
            if (window.showAlert) {
                window.showAlert("บันทึกสำเร็จ", successMsg, "success");
            } else {
                alert(successMsg);
            }
            window.closeAddHolidayModal();
            window.HOLIDAY_LIST = null;
            window.HOLIDAY_TEMPLATES = null;
            __webpack_require__.e(/*! import() */ "_app-pages-browser_src_components_legacy-pages_legacyDataFetcher_js").then(__webpack_require__.bind(__webpack_require__, /*! ./legacyDataFetcher.js */ "(app-pages-browser)/./src/components/legacy-pages/legacyDataFetcher.js")).then((mod)=>{
                if (mod?.fetchAndSetLegacyData) {
                    mod.fetchAndSetLegacyData().then(()=>{
                        if (typeof window.navigate === 'function') window.navigate('public-holiday');
                        else window.location.reload();
                    });
                } else {
                    window.location.reload();
                }
            }).catch(()=>window.location.reload());
        } else {
            const errData = await res.json();
            const errMsg = `บันทึกไม่สำเร็จ: ${errData.message || JSON.stringify(errData)}`;
            if (window.showAlert) {
                window.showAlert("เกิดข้อผิดพลาด", errMsg, "danger");
            } else {
                alert(errMsg);
            }
        }
    } catch (error) {
        const errMsg = `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${error.message}`;
        if (window.showAlert) {
            window.showAlert("เกิดข้อผิดพลาด", errMsg, "danger");
        } else {
            alert(errMsg);
        }
    } finally{
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i data-lucide="save" style="width: 18px; height: 18px;"></i><span>Save</span>`;
        if (window.lucide) window.lucide.createIcons({
            root: btnSubmit
        });
    }
};
window.deletePublicHoliday = async function(id, holidayName) {
    const performDelete = async ()=>{
        const supabaseUrl = "https://jfxesvvswpgeaxhhnnyt.supabase.co";
        const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E";
        try {
            let deletedName = null, deletedDate = null;
            try {
                const infoRes = await fetch(`${supabaseUrl}/rest/v1/public_holidays?id=eq.${id}&select=name,date`, {
                    headers: {
                        apikey: supabaseKey,
                        Authorization: `Bearer ${supabaseKey}`
                    }
                });
                if (infoRes.ok) {
                    const info = await infoRes.json();
                    if (info && info[0]) {
                        deletedName = info[0].name;
                        deletedDate = info[0].date;
                    }
                }
            } catch (e) {}
            const validId = id && id !== 'null' && id !== 'undefined' && id !== '';
            let deleteUrl;
            if (validId) {
                deleteUrl = `${supabaseUrl}/rest/v1/public_holidays?id=eq.${id}`;
            } else if (deletedName) {
                deleteUrl = `${supabaseUrl}/rest/v1/public_holidays?name=eq.${encodeURIComponent(deletedName)}`;
            } else if (holidayName) {
                deleteUrl = `${supabaseUrl}/rest/v1/public_holidays?name=eq.${encodeURIComponent(holidayName)}`;
            } else {
                if (window.showToast) window.showToast('ไม่พบรหัสวันหยุด ไม่สามารถลบได้', 'danger');
                return;
            }
            const res = await fetch(deleteUrl, {
                method: "DELETE",
                headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`
                }
            });
            if (res.ok) {
                window.HOLIDAY_LIST = null;
                window.HOLIDAY_TEMPLATES = null;
                if (window.DATA) window.DATA.public_holidays = null;
                try {
                    let localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
                    const targetName = deletedName || holidayName;
                    if (targetName || deletedDate) {
                        localShifts = localShifts.filter((ls)=>{
                            if (targetName && ls.name === targetName) return false;
                            if (deletedDate) {
                                const [y, m, d] = deletedDate.split('-');
                                const formatted = `${parseInt(d)}/${parseInt(m)}/${y}`;
                                if (ls.date === formatted || ls.date === deletedDate) return false;
                            }
                            return true;
                        });
                    } else {
                        localShifts = [];
                    }
                    localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));
                } catch (e) {}
                if (window.showToast) {
                    window.showToast('ลบวันหยุดเรียบร้อยแล้ว', 'success');
                }
                if (typeof window.navigate === 'function') {
                    window.navigate('public-holiday');
                } else {
                    window.location.reload();
                }
            } else {
                const err = await res.json();
                const errMsg = `ลบไม่สำเร็จ: ${err.message || JSON.stringify(err)}`;
                if (window.showAlert) {
                    window.showAlert("เกิดข้อผิดพลาด", errMsg, "danger");
                } else {
                    alert(errMsg);
                }
            }
        } catch (err) {
            const errMsg = `เกิดข้อผิดพลาด: ${err.message}`;
            if (window.showAlert) {
                window.showAlert("เกิดข้อผิดพลาด", errMsg, "danger");
            } else {
                alert(errMsg);
            }
        }
    };
    window.showConfirmDelete("ยืนยันการลบ", "คุณต้องการลบวันหยุดนี้ใช่หรือไม่?", performDelete);
};
// ==========================================
// ==========================================
// 🔵 3. CORE LEGACY LOGIC & PAGE RENDER
// ==========================================
if (typeof window.getTasksFromScope !== 'function') {
    window.getTasksFromScope = function() {
        const scopeData = window.PREMIUM_SCOPE_DATA || [];
        const tasks = [];
        scopeData.forEach((acc)=>{
            if (!acc.items) return;
            acc.items.forEach((item, idx)=>{
                tasks.push({
                    id: `scope-${acc.account.replace(/\s+/g, '-')}-${idx}`,
                    title: item.name,
                    acc: acc.account,
                    node: item.node || 'Other',
                    hours: item.progress || 0,
                    color: typeof window.colorForProject === 'function' ? window.colorForProject(acc.account) : '#6366f1'
                });
            });
        });
        return tasks;
    };
}
// Person picker: opens a floating dropdown for selecting an employee for a holiday template cell
window.openPersonPicker = function(triggerEl, holidayName, holidayDate, taskId, section, time) {
    const existing = document.getElementById('personPickerDropdown');
    if (existing) {
        existing.remove();
        return;
    }
    const employees = (window.DATA?.employees || []).filter((e)=>e.name && e.name !== '-');
    const rect = triggerEl.getBoundingClientRect();
    const dropdown = document.createElement('div');
    dropdown.id = 'personPickerDropdown';
    // Calculate if it overflows viewport bottom
    const pickerHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    let topPosition = rect.bottom + 6;
    if (spaceBelow < pickerHeight && rect.top > pickerHeight) {
        topPosition = rect.top - pickerHeight - 6;
    }
    dropdown.style.cssText = `
    position: fixed;
    top: ${topPosition}px;
    left: ${rect.left}px;
    z-index: 99999;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    width: 240px;
    height: ${pickerHeight}px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: Kanit, sans-serif;
  `;
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'ค้นหาชื่อ...';
    searchInput.style.cssText = `
    padding: 10px 14px; border: none; border-bottom: 1px solid #f1f5f9;
    font-size: 0.78rem; font-family: Kanit, sans-serif; outline: none;
    background: #f8fafc; border-radius: 16px 16px 0 0;
  `;
    const list = document.createElement('div');
    list.style.cssText = 'overflow-y: auto; max-height: 260px; padding: 6px;';
    function renderList(filter) {
        list.innerHTML = '';
        const clearItem = document.createElement('div');
        clearItem.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;cursor:pointer;font-size:0.78rem;color:#94a3b8;transition:background 0.15s;';
        clearItem.innerHTML = '<span style="width:28px;height:28px;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:0.7rem;">✕</span> ยังไม่กำหนด';
        clearItem.onmouseenter = ()=>clearItem.style.background = '#f8fafc';
        clearItem.onmouseleave = ()=>clearItem.style.background = '';
        clearItem.onclick = ()=>{
            window.savePersonToTask(holidayName, holidayDate, taskId, section, time, '-');
            dropdown.remove();
        };
        list.appendChild(clearItem);
        const filtered = filter ? employees.filter((e)=>e.name.toLowerCase().includes(filter.toLowerCase()) || (e.nickname || '').toLowerCase().includes(filter.toLowerCase())) : employees;
        filtered.forEach((emp)=>{
            const item = document.createElement('div');
            item.style.cssText = 'display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:10px;cursor:pointer;transition:background 0.15s;';
            const abbr = (emp.nickname && emp.nickname !== '-' ? emp.nickname : emp.name.split(' ')[0] || '?').slice(0, 6);
            const col = typeof getTeamColor === 'function' ? getTeamColor(emp.dept || '') : '#6366f1';
            item.innerHTML = `
        <div style="width:28px;height:28px;border-radius:50%;background:${col};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.55rem;font-weight:700;flex-shrink:0;">${abbr}</div>
        <div style="min-width:0;">
          <div style="font-size:0.78rem;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">${emp.name}</div>
          ${emp.nickname && emp.nickname !== '-' ? `<div style="font-size:0.65rem;color:#64748b;">${emp.nickname}</div>` : ''}
        </div>`;
            item.onmouseenter = ()=>item.style.background = '#f8fafc';
            item.onmouseleave = ()=>item.style.background = '';
            item.onclick = ()=>{
                window.savePersonToTask(holidayName, holidayDate, taskId, section, time, emp.name);
                dropdown.remove();
            };
            list.appendChild(item);
        });
    }
    searchInput.oninput = ()=>renderList(searchInput.value.trim());
    dropdown.appendChild(searchInput);
    dropdown.appendChild(list);
    renderList('');
    document.body.appendChild(dropdown);
    setTimeout(()=>{
        function dismissPicker(e) {
            if (!dropdown.contains(e.target) && e.target !== triggerEl && !triggerEl.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('mousedown', dismissPicker);
            }
        }
        document.addEventListener('mousedown', dismissPicker);
    }, 50);
    searchInput.focus();
};
// Save person assignment to localStorage then re-render grid
window.savePersonToTask = function(holidayName, holidayDate, taskId, section, time, personName) {
    let localShifts = [];
    try {
        localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) {}
    const allTemplates = window.HOLIDAY_TEMPLATES || [];
    let matched = localShifts.find((ls)=>ls.name === holidayName && ls.date === holidayDate);
    if (!matched) {
        // Create a full shift entry from ALL templates, each with unique tplId
        matched = {
            date: holidayDate,
            name: holidayName,
            status: 'upcoming',
            tasks: allTemplates.map((t)=>({
                    id: `HS-TPL-${t.id}-${holidayDate.replace(/[\s/-]+/g, '_')}`,
                    tplId: String(t.id),
                    section: t.section,
                    time: t.time,
                    person: '-',
                    assignments: t.assignments || [],
                    dept: (t.assignments || []).map((a)=>`${a.project} - ${a.job}`).join(', '),
                    project: t.assignments?.[0]?.project || '-',
                    job: t.assignments?.[0]?.job || '-'
                }))
        };
        localShifts.push(matched);
    }
    if (!matched.tasks) matched.tasks = [];
    // Find task strictly by taskId (never fall back to section+time to prevent cross-template collision)
    let task = taskId ? matched.tasks.find((t)=>t.id === taskId) : null;
    if (task) {
        task.person = personName;
    } else {
        // Task not found: extract tplId from taskId (format: HS-TPL-{tplId}-{date}) 
        let tplId = null;
        if (taskId && taskId.startsWith('HS-TPL-')) {
            const parts = taskId.split('-');
            tplId = parts[2];
        }
        const tpl = tplId ? allTemplates.find((t)=>String(t.id) === String(tplId)) : allTemplates.find((t)=>t.section === section && t.time === time);
        task = {
            id: taskId || 'HS-' + Date.now(),
            tplId: tplId || (tpl ? String(tpl.id) : ''),
            section,
            time,
            person: personName,
            assignments: tpl?.assignments || [],
            dept: (tpl?.assignments || []).map((a)=>`${a.project} - ${a.job}`).join(', '),
            project: tpl?.assignments?.[0]?.project || '-',
            job: tpl?.assignments?.[0]?.job || '-'
        };
        matched.tasks.push(task);
    }
    localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));
    if (typeof window.apiSaveHolidayShift === 'function' && task?.id) {
        window.apiSaveHolidayShift({
            action: 'edit',
            id: task.id,
            date: holidayDate,
            holidayName,
            status: matched.status || 'upcoming',
            section,
            person: personName,
            time,
            assignments: JSON.stringify(task.assignments || [])
        });
    }
    if (typeof window.navigate === 'function') {
        // If router handles it, try to maintain scroll if possible, or fallback
        const gridScroll = document.getElementById('holidayGridScroll');
        const scrollLeft = gridScroll ? gridScroll.scrollLeft : 0;
        const scrollTop = gridScroll ? gridScroll.scrollTop : 0;
        const winScrollTop = window.scrollY || document.documentElement.scrollTop;
        window.navigate('public-holiday');
        setTimeout(()=>{
            const newGrid = document.getElementById('holidayGridScroll');
            if (newGrid) {
                newGrid.scrollLeft = scrollLeft;
                newGrid.scrollTop = scrollTop;
            }
            window.scrollTo(0, winScrollTop);
        }, 50);
    } else if (typeof window.pagePublicHoliday === 'function') {
        const container = document.getElementById('pageContent');
        if (container) {
            const gridScroll = document.getElementById('holidayGridScroll');
            const scrollLeft = gridScroll ? gridScroll.scrollLeft : 0;
            const scrollTop = gridScroll ? gridScroll.scrollTop : 0;
            const winScrollTop = window.scrollY || document.documentElement.scrollTop;
            container.innerHTML = window.pagePublicHoliday();
            if (window.lucide) window.lucide.createIcons();
            const newGrid = document.getElementById('holidayGridScroll');
            if (newGrid) {
                newGrid.scrollLeft = scrollLeft;
                newGrid.scrollTop = scrollTop;
            }
            window.scrollTo(0, winScrollTop);
        }
    }
};
window.pagePublicHoliday = function() {
    window.currentPage = 'public-holiday';
    let localShifts = [];
    try {
        localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) {}
    const sheetHolidays = window.HOLIDAY_LIST || window.DATA?.public_holidays || [];
    const holidays = [];
    function getDynamicHolidayStatus(dateStr, tasks) {
        if (!tasks || tasks.length === 0) return 'not_scheduled';
        const s = String(dateStr || '').replace(/[^0-9a-zA-Z\u0E00-\u0E7F\.]/g, '').toLowerCase();
        const thaiMonthsFull = {
            'มกราคม': '01',
            'กุมภาพันธ์': '02',
            'มีนาคม': '03',
            'เมษายน': '04',
            'พฤษภาคม': '05',
            'มิถุนายน': '06',
            'กรกฎาคม': '07',
            'สิงหาคม': '08',
            'กันยายน': '09',
            'ตุลาคม': '10',
            'พฤศจิกายน': '11',
            'ธันวาคม': '12'
        };
        const thaiMonthsShort = {
            'ม.ค.': '01',
            'ก.พ.': '02',
            'มี.ค.': '03',
            'เม.ย.': '04',
            'พ.ค.': '05',
            'มิ.ย.': '06',
            'ก.ค.': '07',
            'ส.ค.': '08',
            'ก.ย.': '09',
            'ต.ค.': '10',
            'พ.ย.': '11',
            'ธ.ค.': '12'
        };
        const engMonths = {
            'jan': '01',
            'feb': '02',
            'mar': '03',
            'apr': '04',
            'may': '05',
            'jun': '06',
            'jul': '07',
            'aug': '08',
            'sep': '09',
            'oct': '10',
            'nov': '11',
            'dec': '12'
        };
        const mFull = s.match(/^(\d{1,2})(.+?)(\d{2,4})$/);
        let isoDate = null;
        if (mFull) {
            const day = mFull[1].padStart(2, '0');
            const monStr = mFull[2];
            const yearVal = parseInt(mFull[3], 10);
            let mon = thaiMonthsFull[monStr] || thaiMonthsShort[monStr] || engMonths[monStr.substring(0, 3)];
            let year = yearVal;
            if (year > 2500) year -= 543;
            else if (year < 100) year += 2000;
            if (mon) isoDate = `${year}-${mon}-${day}`;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
            isoDate = s;
        } else if (!isNaN(new Date(dateStr).getTime())) {
            const d = new Date(dateStr);
            isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        const now = new Date();
        const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (!isoDate) {
            window._debugHolidayFail = (window._debugHolidayFail || '') + `|failed:${dateStr}`;
            return 'upcoming';
        }
        return isoDate < todayIso ? 'finished' : 'upcoming';
    }
    const templates = window.HOLIDAY_TEMPLATES || [];
    if (sheetHolidays.length > 0) {
        localShifts = localShifts.filter((ls)=>sheetHolidays.some((sh)=>sh.date === ls.date || sh.name === ls.name));
        localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));
        sheetHolidays.forEach((sh)=>{
            // Match strictly by date first; fall back to name only if no date-based shift exists
            const matchedByDate = localShifts.find((ls)=>ls.date === sh.date);
            const matchedByName = !matchedByDate ? localShifts.find((ls)=>ls.name === sh.name && !localShifts.some((ls2)=>ls2.date === sh.date)) : null;
            const matched = matchedByDate || matchedByName;
            let t = matched ? matched.tasks || [] : [];
            if (t.length === 0 && templates.length > 0) {
                t = templates.map((tpl)=>({
                        id: `HS-TPL-${tpl.id}-${sh.date.replace(/[\s/-]+/g, '_')}`,
                        tplId: String(tpl.id),
                        section: tpl.section,
                        time: tpl.time,
                        person: '-',
                        assignments: tpl.assignments || [],
                        dept: (tpl.assignments || []).map((a)=>`${a.project} - ${a.job}`).join(', '),
                        project: tpl.assignments?.[0]?.project || '-',
                        job: tpl.assignments?.[0]?.job || '-'
                    }));
            }
            holidays.push({
                id: sh.id || null,
                date: sh.date,
                name: sh.name,
                tasks: t,
                status: getDynamicHolidayStatus(sh.date, t)
            });
        });
        localShifts.forEach((ls)=>{
            const exists = holidays.some((h)=>h.date === ls.date || h.name === ls.name);
            if (!exists) {
                let t = ls.tasks || [];
                if (t.length === 0 && templates.length > 0) {
                    t = templates.map((tpl)=>({
                            id: `HS-TPL-${tpl.id}-${ls.date.replace(/[\s/-]+/g, '_')}`,
                            section: tpl.section,
                            time: tpl.time,
                            person: '-',
                            assignments: tpl.assignments || [],
                            dept: (tpl.assignments || []).map((a)=>`${a.project} - ${a.job}`).join(', '),
                            project: tpl.assignments?.[0]?.project || '-',
                            job: tpl.assignments?.[0]?.job || '-'
                        }));
                }
                holidays.push({
                    ...ls,
                    tasks: t,
                    status: getDynamicHolidayStatus(ls.date, t)
                });
            }
        });
    } else {
        holidays.push(...localShifts.map((ls)=>{
            let t = ls.tasks || [];
            if (t.length === 0 && templates.length > 0) {
                t = templates.map((tpl)=>({
                        id: `HS-TPL-${tpl.id}-${ls.date.replace(/[\s/-]+/g, '_')}`,
                        section: tpl.section,
                        time: tpl.time,
                        person: '-',
                        assignments: tpl.assignments || [],
                        dept: (tpl.assignments || []).map((a)=>`${a.project} - ${a.job}`).join(', '),
                        project: tpl.assignments?.[0]?.project || '-',
                        job: tpl.assignments?.[0]?.job || '-'
                    }));
            }
            return {
                ...ls,
                tasks: t,
                status: getDynamicHolidayStatus(ls.date, t)
            };
        }));
    }
    if (typeof window.holidaySearchQuery === 'undefined') {
        window.holidaySearchQuery = '';
    }
    if (typeof window.selectedHolidayYear === 'undefined') {
        window.selectedHolidayYear = String(new Date().getFullYear());
    }
    const yearsSet = new Set();
    holidays.forEach((h)=>{
        const match = h.date?.match(/\d{4}/);
        if (match) {
            yearsSet.add(match[0]);
        } else if (h.date) {
            const parts = h.date.split(/[\s/-]+/);
            const lastPart = parts[parts.length - 1];
            if (lastPart && lastPart.length === 4) {
                yearsSet.add(lastPart);
            }
        }
    });
    const uniqueYears = Array.from(yearsSet).sort((a, b)=>b.localeCompare(a));
    let filteredHolidays = holidays;
    // 1. Year filter
    if (window.selectedHolidayYear) {
        filteredHolidays = filteredHolidays.filter((h)=>{
            return h.date && h.date.includes(window.selectedHolidayYear);
        });
    }
    // 2. Search query filter (filtering dataset directly before render so it matches stats)
    if (window.holidaySearchQuery) {
        const q = window.holidaySearchQuery.toLowerCase().trim();
        const employees = window.DATA?.employees || [];
        filteredHolidays = filteredHolidays.filter((h)=>{
            // a. Match holiday name or date
            const nameMatch = h.name && h.name.toLowerCase().includes(q);
            const dateMatch = h.date && h.date.toLowerCase().includes(q);
            if (nameMatch || dateMatch) return true;
            // b. Match assigned person name (check Nickname, EngName, FullName), or job details
            const tasksList = h.tasks || [];
            const hasTaskMatch = tasksList.some((t)=>{
                const personName = t.person || '';
                let personMatch = false;
                if (personName && personName !== '-') {
                    if (personName.toLowerCase().includes(q)) {
                        personMatch = true;
                    }
                    // Also look up employee profile for nickname / English name matching
                    const emp = employees.find((e)=>{
                        const nLower = (e.name || '').toLowerCase();
                        const nEnLower = (e.nameEn || '').toLowerCase();
                        const nickLower = (e.nickname || '').toLowerCase();
                        return nLower === personName.toLowerCase() || nEnLower === personName.toLowerCase() || nickLower === personName.toLowerCase();
                    });
                    if (emp) {
                        const nicknameMatch = emp.nickname && emp.nickname.toLowerCase().includes(q);
                        const nameEnMatch = emp.nameEn && emp.nameEn.toLowerCase().includes(q);
                        const deptMatch = emp.dept && emp.dept.toLowerCase().includes(q);
                        if (nicknameMatch || nameEnMatch || deptMatch) {
                            personMatch = true;
                        }
                    }
                }
                const projectMatch = t.project && t.project.toLowerCase().includes(q);
                const jobMatch = t.job && t.job.toLowerCase().includes(q);
                // Also search in nested assignments array
                const nestedAssignments = t.assignments || [];
                const hasAssignmentMatch = nestedAssignments.some((a)=>{
                    const aProjMatch = a.project && a.project.toLowerCase().includes(q);
                    const aJobMatch = a.job && a.job.toLowerCase().includes(q);
                    return aProjMatch || aJobMatch;
                });
                return personMatch || projectMatch || jobMatch || hasAssignmentMatch;
            });
            return hasTaskMatch;
        });
    }
    const stats = {
        total: filteredHolidays.length,
        finished: filteredHolidays.filter((h)=>h.status === 'finished').length,
        upcoming: filteredHolidays.filter((h)=>h.status === 'upcoming').length,
        not_scheduled: filteredHolidays.filter((h)=>h.status === 'not_scheduled').length
    };
    const finishedPct = stats.total > 0 ? (stats.finished / stats.total * 100).toFixed(2) : '0.00';
    const upcomingPct = stats.total > 0 ? (stats.upcoming / stats.total * 100).toFixed(2) : '0.00';
    const notScheduledPct = stats.total > 0 ? (stats.not_scheduled / stats.total * 100).toFixed(2) : '0.00';
    window.changeHolidayPage = function(p) {
        window.holidayCurrentPage = p;
        if (typeof window.navigate === 'function') {
            window.navigate('public-holiday');
        }
    };
    window.changeHolidayYearFilter = function(year) {
        window.selectedHolidayYear = year;
        window.holidayCurrentPage = 1;
        if (typeof window.navigate === 'function') {
            window.navigate('public-holiday');
        }
    };
    window.updateHolidayClearButtonVisibility = function() {
        const clearBtn = document.getElementById('clearHolidayFiltersBtn');
        if (!clearBtn) return;
        const hasYearFilter = window.selectedHolidayYear && window.selectedHolidayYear !== '';
        if (window.holidaySearchQuery || hasYearFilter && window.selectedHolidayYear !== String(new Date().getFullYear())) {
            clearBtn.style.display = 'inline-flex';
        } else {
            clearBtn.style.display = 'none';
        }
    };
    window.clearHolidayFilters = function() {
        window.selectedHolidayYear = String(new Date().getFullYear());
        window.holidaySearchQuery = '';
        window.holidayCurrentPage = 1;
        if (typeof window.navigate === 'function') {
            window.navigate('public-holiday');
        }
    };
    const searchHtml = `
    <div class="search-box" style="width: 220px; flex-shrink: 0; border-radius: 9999px !important;">
      <i data-lucide="search" style="width: 14px; height: 14px; color: var(--text-3); flex-shrink: 0;"></i>
      <input type="text" id="holidaySearch" placeholder="Search..." value="${window.holidaySearchQuery || ''}" style="padding: 0; border: none; outline: none; background: transparent;" oninput="window.filterHolidayRows(this.value); window.updateHolidayClearButtonVisibility();">
    </div>
  `;
    const yearSelectHtml = `
    <select id="holidayYearFilter" class="select-input" onchange="window.changeHolidayYearFilter(this.value)" style="width: 120px; flex-shrink: 0; border-radius: 9999px !important;">
      <option value="">All Years</option>
      ${uniqueYears.map((y)=>`<option value="${y}" ${window.selectedHolidayYear === y ? 'selected' : ''}>Year ${y}</option>`).join('')}
    </select>
  `;
    const showClearStyle = window.selectedHolidayYear && window.selectedHolidayYear !== String(new Date().getFullYear()) || window.holidaySearchQuery ? 'display: inline-flex;' : 'display: none;';
    let filterTimeout = null;
    window.filterHolidayRows = function(q) {
        window.holidaySearchQuery = q;
        if (filterTimeout) clearTimeout(filterTimeout);
        filterTimeout = setTimeout(()=>{
            if (typeof window.navigate === 'function') {
                window.navigate('public-holiday', {
                    bypassFetch: true
                });
                // Re-focus and restore cursor position after render
                setTimeout(()=>{
                    const inputEl = document.getElementById('holidaySearch');
                    if (inputEl) {
                        inputEl.focus();
                        // Put cursor at the end of the text
                        const valLen = inputEl.value.length;
                        inputEl.setSelectionRange(valLen, valLen);
                    }
                }, 50);
            }
        }, 150);
    };
    // ── Template column color palette helper ──────────────────────────
    const getTemplateColor = (tplSection, tplName)=>{
        const secLower = (tplSection || '').toLowerCase();
        const nameLower = (tplName || '').toLowerCase();
        // If the Section is Operation -> ALWAYS PURPLE
        if (secLower.includes('operation')) {
            return {
                hdr: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                light: '#f5f3ff',
                accent: '#7c3aed',
                border: '#ddd6fe',
                text: '#4c1d95'
            };
        }
        // If Section is Content or Graphics -> ORANGE
        if (secLower.includes('content') || secLower.includes('graphics') || nameLower.includes('content') || nameLower.includes('graphics')) {
            return {
                hdr: 'linear-gradient(135deg,#f97316,#ea580c)',
                light: '#fff7ed',
                accent: '#f97316',
                border: '#fed7aa',
                text: '#7c2d12'
            };
        }
        // If Section/Name is ETDA (and not Operation) -> GREEN
        if (secLower.includes('etda') || nameLower.includes('etda')) {
            return {
                hdr: 'linear-gradient(135deg,#10b981,#059669)',
                light: '#ecfdf5',
                accent: '#10b981',
                border: '#a7f3d0',
                text: '#064e3b'
            };
        }
        // If Section/Name is OR (and not Operation) -> BLUE
        if (secLower.includes('or') || nameLower.includes('or')) {
            return {
                hdr: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                light: '#eff6ff',
                accent: '#3b82f6',
                border: '#bfdbfe',
                text: '#1e3a8a'
            };
        }
        // If name contains operation
        if (nameLower.includes('operation')) {
            return {
                hdr: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                light: '#f5f3ff',
                accent: '#7c3aed',
                border: '#ddd6fe',
                text: '#4c1d95'
            };
        }
        // Default fallback
        return {
            hdr: 'linear-gradient(135deg,#64748b,#475569)',
            light: '#f8fafc',
            accent: '#64748b',
            border: '#e2e8f0',
            text: '#0f172a'
        };
    };
    const COL_W = 220; // px width of each template column
    const LEFT_W = 280; // px width of the fixed left holiday column
    // ── Build template column headers (Now containing the assignments details inside!) ────────────────
    let tplHeadersHtml = '';
    if (templates.length === 0) {
        tplHeadersHtml = `
      <div style="width:${COL_W}px; flex-shrink:0; display:flex; align-items:center; justify-content:center; padding:16px; color:#94a3b8; font-size:0.75rem; text-align:center; border-left:1px solid #e2e8f0;">
        ยังไม่มีชุดงาน<br/>กด Manage Templates
      </div>`;
    } else {
        tplHeadersHtml = templates.map((tpl, ti)=>{
            const col = getTemplateColor(tpl.section, tpl.name);
            const list = tpl.assignments || [];
            const totalPct = list.reduce((s, a)=>s + (parseInt(a.percent) || 0), 0);
            // Determine if this column matches search query
            let matchesQuery = true;
            if (window.holidaySearchQuery) {
                const sq = window.holidaySearchQuery.toLowerCase().trim();
                const hasProjMatch = list.some((a)=>a.project && a.project.toLowerCase().includes(sq) || a.job && a.job.toLowerCase().includes(sq));
                const sectionMatch = tpl.section && tpl.section.toLowerCase().includes(sq);
                const nameMatch = tpl.name && tpl.name.toLowerCase().includes(sq);
                matchesQuery = hasProjMatch || sectionMatch || nameMatch;
            }
            const colOpacity = matchesQuery ? '1.0' : '0.15';
            return `
        <div style="
          width:${COL_W - 10}px; flex-shrink:0;
          display:flex; flex-direction:column;
          margin:0 5px;
          border-radius:14px;
          overflow:hidden;
          border:1px solid ${col.border};
          box-shadow:0 2px 8px rgba(0,0,0,0.06);
          background:#fff;
          opacity:${colOpacity};
          transition:opacity 0.2s;
        ">
          <div style="background:${col.hdr};color:#fff;padding:9px 14px;display:flex;align-items:center;gap:8px;">
            <div style="width:18px;height:18px;border-radius:50%;background:#fff;color:${col.accent};display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:900;flex-shrink:0;">
              ${ti + 1}
            </div>
            <div style="min-width:0;flex:1;">
              <div style="font-size:0.58rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${tpl.section || '-'}</div>
              <div style="font-size:0.82rem;font-weight:800;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${tpl.name || tpl.section || '-'}">${tpl.name || tpl.section || '-'}</div>
            </div>
          </div>
          <!-- Shift/time band -->
          <div style="background:${col.light};padding:5px 14px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.66rem;font-weight:700;color:${col.text};">${tpl.time || '09.00-18.00'}</span>
            <span style="background:rgba(255,255,255,0.85);color:${col.accent};font-size:0.59rem;font-weight:800;padding:2px 7px;border-radius:99px;">รวม ${totalPct}%</span>
          </div>
        </div>`;
        }).join('');
    }
    // ── Build assignment-detail sub-header row (non-sticky, scrolls with body) ───
    let tplDetailHtml = '';
    if (templates.length > 0) {
        const detailCols = templates.map((tpl, ti)=>{
            const col = getTemplateColor(tpl.section, tpl.name);
            const list = tpl.assignments || [];
            // Determine if this column matches search query
            let matchesQuery = true;
            if (window.holidaySearchQuery) {
                const sq = window.holidaySearchQuery.toLowerCase().trim();
                const hasProjMatch = list.some((a)=>a.project && a.project.toLowerCase().includes(sq) || a.job && a.job.toLowerCase().includes(sq));
                const sectionMatch = tpl.section && tpl.section.toLowerCase().includes(sq);
                const nameMatch = tpl.name && tpl.name.toLowerCase().includes(sq);
                matchesQuery = hasProjMatch || sectionMatch || nameMatch;
            }
            const colOpacity = matchesQuery ? '1.0' : '0.15';
            const assignRows = list.map((a)=>`
        <div style="margin-bottom:6px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
            <span style="font-size:0.68rem;font-weight:700;color:${col.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;" title="${a.project}">${a.project}</span>
            <span style="font-size:0.65rem;font-weight:800;color:${col.accent};flex-shrink:0;margin-left:4px;">${a.percent || 100}%</span>
          </div>
          ${a.job && a.job !== '-' ? `<div style="font-size:0.62rem;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:190px;margin-bottom:2px;" title="${a.job}">${a.job}</div>` : ''}
          <div style="height:4px;background:#e2e8f0;border-radius:99px;overflow:hidden;">
            <div style="height:100%;width:${Math.min(a.percent || 100, 100)}%;background:${col.accent};border-radius:99px;"></div>
          </div>
        </div>`).join('');
            return `
        <div style="width:${COL_W}px; flex-shrink:0; display:flex; flex-direction:column; opacity:${colOpacity}; transition:opacity 0.2s;">
          <div style="
            margin:6px 5px 8px 5px;
            padding:10px 14px;
            background:#fff;
            border:1px solid ${col.border};
            border-radius:14px;
            box-shadow:0 2px 8px rgba(0,0,0,0.04);
            box-sizing:border-box;
            flex:1;
          ">
            ${assignRows || '<div style="font-size:0.65rem;color:#94a3b8;font-style:italic;">ไม่มีงานในแผน</div>'}
          </div>
        </div>`;
        }).join('');
        tplDetailHtml = `
      <div style="display:flex; min-width:${LEFT_W + COL_W * Math.max(templates.length, 1)}px; background:#fff; align-items:stretch;">
        <!-- Spacer for left column -->
        <div style="width:${LEFT_W}px; flex-shrink:0; position:sticky; left:0; z-index:25; background:#fff; align-self:stretch;"></div>
        ${detailCols}
      </div>`;
    }
    // ── Build holiday rows ──────────────────────────────────────
    let rowsHtml = '';
    if (filteredHolidays.length === 0) {
        rowsHtml = `
      <div style="display:flex; align-items:center; justify-content:center; padding:48px; color:#94a3b8; font-size:0.85rem; font-style:italic; min-width:${LEFT_W + COL_W * Math.max(templates.length, 1)}px;">
        ไม่พบข้อมูลวันหยุดนักขัตฤกษ์
      </div>`;
    } else {
        rowsHtml = filteredHolidays.map((h, hi)=>{
            let dateObj = null;
            if (h.date) {
                if (h.date.includes('/')) {
                    const parts = h.date.split('/');
                    if (parts.length === 3) {
                        dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    }
                } else if (h.date.includes('-')) {
                    const parts = h.date.split('-');
                    if (parts.length === 3) {
                        dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    }
                }
            }
            if (!dateObj || isNaN(dateObj.getTime())) {
                dateObj = new Date(h.date);
            }
            const dayNames = [
                'อาทิตย์',
                'จันทร์',
                'อังคาร',
                'พุธ',
                'พฤหัสบดี',
                'ศุกร์',
                'เสาร์'
            ];
            const dayTH = !isNaN(dateObj) ? [
                'อา.',
                'จ.',
                'อ.',
                'พ.',
                'พฤ.',
                'ศ.',
                'ส.'
            ][dateObj.getDay()] : '';
            const dayName = !isNaN(dateObj) ? dayNames[dateObj.getDay()] : '';
            const isWeekend = !isNaN(dateObj) && (dateObj.getDay() === 0 || dateObj.getDay() === 6);
            let dayDisplayNum = '';
            if (h.date) {
                if (h.date.includes('-')) {
                    dayDisplayNum = h.date.split('-')[2];
                } else if (h.date.includes('/')) {
                    dayDisplayNum = h.date.split('/')[0];
                }
            }
            let statusBadge = '';
            if (h.status === 'finished') {
                statusBadge = `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:99px;background:#ecfdf5;color:#10b981;border:1px solid #a7f3d0;font-size:0.6rem;font-weight:700;"><i data-lucide="check-circle" style="width:9px;height:9px;"></i>เสร็จแล้ว</span>`;
            } else if (h.status === 'upcoming') {
                statusBadge = `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:99px;background:#ffedd5;color:#f59e0b;border:1px solid #fed7aa;font-size:0.6rem;font-weight:700;"><i data-lucide="clock" style="width:9px;height:9px;"></i>กำลังจะถึง</span>`;
            } else {
                statusBadge = `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:99px;background:#f1f5f9;color:#64748b;border:1px solid #cbd5e1;font-size:0.6rem;font-weight:700;"><i data-lucide="minus-circle" style="width:9px;height:9px;"></i>ยังไม่กำหนด</span>`;
            }
            // Left cell: holiday info — STICKY left column
            const leftCell = `
        <div style="
          width:${LEFT_W}px; flex-shrink:0;
          padding:12px 16px;
          background:#ffffff;
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          position:sticky; left:0; z-index:25;
          box-sizing:border-box;
        ">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
            <div style="
              width:44px;height:44px;border-radius:14px;flex-shrink:0;
              background:${h.status === 'upcoming' ? 'linear-gradient(135deg,#818cf8,#6366f1)' : h.status === 'finished' ? 'linear-gradient(135deg,#34d399,#059669)' : '#e2e8f0'};
              color:#fff;
              display:flex;flex-direction:column;align-items:center;justify-content:center;
              font-size:0.55rem;font-weight:700;line-height:1.1;
              box-shadow:0 4px 10px rgba(99,102,241,0.12);
            ">
              <span style="font-size:0.95rem;font-weight:800;line-height:1;margin-bottom:2px;">${dayDisplayNum || ''}</span>
              <span style="font-size:0.58rem;opacity:0.9;text-transform:uppercase;">${dayTH || ''}</span>
            </div>
            <div style="min-width:0;flex:1;">
              <div style="font-size:0.85rem;font-weight:700;color:#1e293b;white-space:normal;word-break:break-word;line-height:1.3;" title="${h.name}">${h.name}</div>
              <div style="font-size:0.68rem;color:#94a3b8;font-weight:500;margin-top:2px;">${h.date}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
            <button onclick="toggleHolidayDropdown(event, ${hi}, '${h.name.replace(/'/g, "\\'")}', '${h.date}', '${h.id || ''}')" style="background:#f1f5f9;border:none;color:#94a3b8;cursor:pointer;padding:0;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.background='#e2e8f0';this.style.color='#475569'" onmouseout="this.style.background='#f1f5f9';this.style.color='#94a3b8'">
              <i data-lucide="more-horizontal" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </div>`;
            // Template cells (Modern rounded card style per cell)
            let templateCells = '';
            if (templates.length === 0) {
                templateCells = `<div style="width:${COL_W}px;flex-shrink:0;padding:12px 8px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;font-size:0.75rem;font-style:italic;">-</div>`;
            } else {
                templateCells = templates.map((tpl, ti)=>{
                    const col = getTemplateColor(tpl.section, tpl.name);
                    // Find task: first try exact template-ID match, then fall back to section-only (for manually saved tasks)
                    const taskById = (h.tasks || []).find((t)=>t.id?.includes(`HS-TPL-${tpl.id}-`));
                    const taskBySection = !taskById ? (h.tasks || []).find((t)=>t.section === tpl.section && t.tplId === String(tpl.id)) : null;
                    const task = taskById || taskBySection || null;
                    let cellContent = '';
                    const safeHNameNoTask = h.name.replace(/'/g, "\\'");
                    if (!task) {
                        // No saved task for this template column yet — show clickable "ยังไม่กำหนด"
                        const templateTaskId = `HS-TPL-${tpl.id}-${h.date.replace(/[\s/-]+/g, '_')}`;
                        cellContent = `
              <div onclick="window.openPersonPicker(this, '${safeHNameNoTask}', '${h.date}', '${templateTaskId}', '${tpl.section}', '${tpl.time}')" style="
                display:flex;align-items:center;gap:6px;color:#94a3b8;font-size:0.7rem;font-weight:500;justify-content:center;
                background:#f8fafc;
                padding:8px 12px;
                border-radius:12px;
                border:1px dashed #cbd5e1;
                cursor:pointer;
                transition:all 0.2s;
              " onmouseover="this.style.borderColor='#6366f1';this.style.color='#6366f1';this.style.background='#f0f0ff'" onmouseout="this.style.borderColor='#cbd5e1';this.style.color='#94a3b8';this.style.background='#f8fafc'">
                <i data-lucide="user-plus" style="width:13px;height:13px;"></i>ยังไม่กำหนด
              </div>`;
                    } else {
                        const personName = task.person && task.person !== '-' ? task.person : null;
                        if (personName) {
                            const emp = (window.DATA?.employees || []).find((e)=>e.name === personName || e.nameEn === personName || e.nickname === personName);
                            const nickname = emp?.nickname && emp.nickname !== '-' ? emp.nickname : '';
                            const avatarText = nickname || personName.trim().split(/\s+/)[0];
                            const avatarFs = avatarText.length > 5 ? '0.45rem' : avatarText.length >= 4 ? '0.52rem' : '0.62rem';
                            const teamCol = typeof getTeamColor === 'function' ? getTeamColor(emp?.dept || '') : col.accent;
                            const displayName = window.getEmployeeDisplayName ? window.getEmployeeDisplayName(emp || personName) : personName;
                            const safeHNameAssigned = h.name.replace(/'/g, "\\'");
                            cellContent = `
                <div onclick="window.openPersonPicker(this, '${safeHNameAssigned}', '${h.date}', '${task.id || ''}', '${tpl.section}', '${tpl.time}')" style="
                  display:flex;align-items:center;gap:10px;
                  background:#fff;
                  padding:8px 12px;
                  border-radius:12px;
                  border:1px solid #e2e8f0;
                  box-shadow:0 2px 6px rgba(0,0,0,0.02);
                  transition:all 0.2s;
                  cursor:pointer;
                " onmouseover="this.style.borderColor='${col.border}';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.05)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.boxShadow='0 2px 6px rgba(0,0,0,0.02)'">
                  <div style="width:34px;height:34px;border-radius:50%;flex-shrink:0;background:${teamCol};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${avatarFs};box-shadow:0 2px 6px rgba(0,0,0,0.08);text-align:center;padding:2px;overflow:hidden;white-space:nowrap;">
                    ${avatarText}
                  </div>
                  <div style="min-width:0;text-align:left;flex:1;">
                    <div style="font-size:0.8rem;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${personName}">
                      ${displayName}
                    </div>
                    ${emp?.pos ? `<div style="font-size:0.65rem;color:#64748b;font-weight:500;margin-top:1px;">${emp.pos}</div>` : ''}
                  </div>
                </div>`;
                        } else {
                            const safeHName = h.name.replace(/'/g, "\\'");
                            cellContent = `
                <div onclick="window.openPersonPicker(this, '${safeHName}', '${h.date}', '${task?.id || ''}', '${tpl.section}', '${tpl.time}')" style="
                  display:flex;align-items:center;gap:6px;color:#94a3b8;font-size:0.7rem;font-weight:500;justify-content:center;
                  background:#f8fafc;
                  padding:8px 12px;
                  border-radius:12px;
                  border:1px dashed #cbd5e1;
                  cursor:pointer;
                  transition:all 0.2s;
                " onmouseover="this.style.borderColor='#6366f1';this.style.color='#6366f1';this.style.background='#f0f0ff'" onmouseout="this.style.borderColor='#cbd5e1';this.style.color='#94a3b8';this.style.background='#f8fafc'">
                  <i data-lucide="user-plus" style="width:13px;height:13px;"></i>ยังไม่กำหนด
                </div>`;
                        }
                    }
                    // Determine if this column matches search query
                    let matchesQuery = true;
                    if (window.holidaySearchQuery) {
                        const sq = window.holidaySearchQuery.toLowerCase().trim();
                        const list = tpl.assignments || [];
                        const hasProjMatch = list.some((a)=>a.project && a.project.toLowerCase().includes(sq) || a.job && a.job.toLowerCase().includes(sq));
                        const sectionMatch = tpl.section && tpl.section.toLowerCase().includes(sq);
                        const nameMatch = tpl.name && tpl.name.toLowerCase().includes(sq);
                        // Check if employee name on cell matches
                        let employeeMatch = false;
                        if (task && task.person && task.person !== '-') {
                            employeeMatch = task.person.toLowerCase().includes(sq);
                            const emp = (window.DATA?.employees || []).find((e)=>e.name === task.person || e.nameEn === task.person || e.nickname === task.person);
                            if (emp) {
                                const nickMatch = emp.nickname && emp.nickname.toLowerCase().includes(sq);
                                const enMatch = emp.nameEn && emp.nameEn.toLowerCase().includes(sq);
                                if (nickMatch || enMatch) employeeMatch = true;
                            }
                        }
                        matchesQuery = hasProjMatch || sectionMatch || nameMatch || employeeMatch;
                    }
                    const colOpacity = matchesQuery ? '1.0' : '0.15';
                    return `
            <div style="
              width:${COL_W - 8}px; flex-shrink:0;
              margin:0 4px;
              padding:8px 12px;
              display:flex;
              align-items:center;
              justify-content:center;
              box-sizing:border-box;
              opacity:${colOpacity};
              transition:opacity 0.2s;
            ">
              <div style="width:100%;">
                ${cellContent}
              </div>
            </div>`;
                }).join('');
            }
            return `
        <div data-holiday-row="${h.name} ${h.date}" style="
          display:flex; min-width:${LEFT_W + COL_W * Math.max(templates.length, 1)}px;
          padding:6px 0;
          align-items:center;
          border-bottom:1px solid #f1f5f9;
          position:relative;
        ">
          ${leftCell}
          ${templateCells}
        </div>`;
        }).join('');
    }
    const minGridW = `${LEFT_W + COL_W * Math.max(templates.length, 1)}px`;
    return `
  <div>
    <!-- HEADER ACTION BAR -->
    <div class="toolbar" style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:20px; gap:8px">
      ${searchHtml}
      ${yearSelectHtml}
      <button id="clearHolidayFiltersBtn" onclick="window.clearHolidayFilters()" style="${showClearStyle} background:none; border:none; color:#ef4444; font-family:Kanit; font-size:.75rem; font-weight:700; cursor:pointer; align-items:center; gap:4px; padding:0 12px; height:34px; white-space:nowrap;">✕ Clear</button>
      <div style="width:1px;height:18px;background:#e4e8ef;margin:0 4px;flex-shrink:0;"></div>
      <button onclick="openAddHolidayModal()" class="btn" style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:10px;font-size:.75rem;font-weight:700;flex-shrink:0;background:#635bff;color:#fff;border:1px solid transparent;cursor:pointer;box-shadow:0 2px 8px rgba(99,91,255,0.3);transition:background 0.2s;" onmouseover="this.style.background='#4f46e5'" onmouseout="this.style.background='#635bff'">
        <i data-lucide="plus" style="width:14px;height:14px"></i> Add Holiday
      </button>
      <button onclick="window.openManageTemplatesModal()" class="btn" style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:10px;font-size:.75rem;font-weight:700;flex-shrink:0;background:#ffffff;color:#635bff;border:1px solid #635bff;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(99,91,255,0.08);" onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background='#ffffff'">
        <i data-lucide="settings" style="width:14px;height:14px"></i> Manage Templates
      </button>
    </div>

    <!-- STATS CARDS (COMPACT ROW WITH ICON LEFT, TEXT RIGHT) -->
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:12px;">
      <div class="stat-card" style="padding:14px 18px;display:flex !important;flex-direction:row !important;align-items:center !important;gap:12px;min-height:64px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;box-shadow:0 2px 4px rgba(0,0,0,0.02)">
        <div style="width:36px;height:36px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(99,102,241,0.25);flex-shrink:0;"><i data-lucide="calendar" style="width:18px;height:18px"></i></div>
        <div style="display:flex;flex-direction:column;min-width:0;align-items:flex-start;">
          <div style="font-size:.65rem;color:var(--text-3);font-weight:600;text-transform:uppercase;letter-spacing:0.03em;">Total</div>
          <div style="font-size:1.1rem;font-weight:700;color:var(--text);line-height:1.2;">${stats.total} <span style="font-size:.68rem;font-weight:400;color:var(--text-3);">days</span></div>
        </div>
      </div>
      <div class="stat-card" style="padding:14px 18px;display:flex !important;flex-direction:row !important;align-items:center !important;gap:12px;min-height:64px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;box-shadow:0 2px 4px rgba(0,0,0,0.02)">
        <div style="width:36px;height:36px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(16,185,129,0.25);flex-shrink:0;"><i data-lucide="check-circle" style="width:18px;height:18px"></i></div>
        <div style="display:flex;flex-direction:column;min-width:0;align-items:flex-start;">
          <div style="font-size:.65rem;color:var(--text-3);font-weight:600;text-transform:uppercase;letter-spacing:0.03em;">Finished</div>
          <div style="font-size:1.1rem;font-weight:700;color:var(--text);line-height:1.2;">${stats.finished} <span style="font-size:.68rem;font-weight:400;color:var(--text-3);">days</span> <span style="font-size:.62rem;color:#10b981;font-weight:700;margin-left:4px;">${finishedPct}%</span></div>
        </div>
      </div>
      <div class="stat-card" style="padding:14px 18px;display:flex !important;flex-direction:row !important;align-items:center !important;gap:12px;min-height:64px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;box-shadow:0 2px 4px rgba(0,0,0,0.02)">
        <div style="width:36px;height:36px;border-radius:50%;background:#f59e0b;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(245,158,11,0.25);flex-shrink:0;"><i data-lucide="clock" style="width:18px;height:18px"></i></div>
        <div style="display:flex;flex-direction:column;min-width:0;align-items:flex-start;">
          <div style="font-size:.65rem;color:var(--text-3);font-weight:600;text-transform:uppercase;letter-spacing:0.03em;">Upcoming</div>
          <div style="font-size:1.1rem;font-weight:700;color:var(--text);line-height:1.2;">${stats.upcoming} <span style="font-size:.68rem;font-weight:400;color:var(--text-3);">days</span> <span style="font-size:.62rem;color:#f59e0b;font-weight:700;margin-left:4px;">${upcomingPct}%</span></div>
        </div>
      </div>
      <div class="stat-card" style="padding:14px 18px;display:flex !important;flex-direction:row !important;align-items:center !important;gap:12px;min-height:64px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;box-shadow:0 2px 4px rgba(0,0,0,0.02)">
        <div style="width:36px;height:36px;border-radius:50%;background:#818cf8;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(129,140,248,0.25);flex-shrink:0;"><i data-lucide="calendar-plus" style="width:18px;height:18px"></i></div>
        <div style="display:flex;flex-direction:column;min-width:0;align-items:flex-start;">
          <div style="font-size:.65rem;color:var(--text-3);font-weight:600;text-transform:uppercase;letter-spacing:0.03em;">Not Scheduled</div>
          <div style="font-size:1.1rem;font-weight:700;color:var(--text);line-height:1.2;">${stats.not_scheduled} <span style="font-size:.68rem;font-weight:400;color:var(--text-3);">days</span> <span style="font-size:.62rem;color:#818cf8;font-weight:700;margin-left:4px;">${notScheduledPct}%</span></div>
        </div>
      </div>
      <div class="stat-card" onclick="window.navigate('holiday-summary')" style="padding:14px 18px;display:flex !important;flex-direction:row !important;align-items:center !important;gap:12px;min-height:64px;background:#f5f3ff;border-radius:14px;border:1px solid #ddd6fe;box-shadow:0 2px 8px rgba(99,91,255,0.08);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='#ebe8ff';this.style.transform='translateY(-2px)';" onmouseout="this.style.background='#f5f3ff';this.style.transform='none';">
        <div style="width:36px;height:36px;border-radius:50%;background:#635bff;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(99,91,255,0.25);flex-shrink:0;"><i data-lucide="bar-chart-3" style="width:18px;height:18px"></i></div>
        <div style="display:flex;flex-direction:column;min-width:0;align-items:flex-start;">
          <div style="font-size:.65rem;color:#635bff;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;">Holiday Summary</div>
          <div style="font-size:.85rem;font-weight:700;color:#1e293b;margin-top:2px;">คลิกเพื่อดูหน้าสรุป ➔</div>
        </div>
      </div>
    </div>

    <!-- SPREADSHEET MATRIX GRID -->
    <div style="
      background:#fff;
      border-radius:14px;
      border:1.5px solid #e2e8f0;
      box-shadow:0 4px 20px -4px rgba(0,0,0,0.06);
      overflow:clip;
    ">
      <!-- Container offering horizontal scroll and vertical scroll to fit on one screen -->
      <div style="overflow-x:auto; overflow-y:auto; max-height:calc(100vh - 250px); width:100%; display:block; scrollbar-width:thin; scrollbar-color:#cbd5e1 transparent;" id="holidayGridScroll">
        <div style="min-width:${minGridW}; width:max-content;">

          <!-- Header: fixed holiday col + template col headers (Sticky Top!) -->
          <div style="display:flex; min-width:${minGridW}; position:sticky; top:0; z-index:40; background:#f8fafc; align-items:stretch; gap:0;">
            <!-- Fixed left header — STICKY -->
            <div style="
              width:${LEFT_W}px; flex-shrink:0;
              padding:20px;
              background:#f8fafc;
              display:flex; align-items:center; gap:8px;
              position:sticky; left:0; z-index:35;
              box-sizing:border-box;
            ">
              <i data-lucide="calendar-days" style="width:14px;height:14px;color:#6366f1;"></i>
              <span style="font-size:0.75rem;font-weight:700;color:#475569;">วันหยุดนักขัตฤกษ์</span>
            </div>
            <!-- Template column headers wrapper -->
            <div style="display:flex; align-items:center; gap:0; padding:8px 0;">
              ${tplHeadersHtml}
            </div>
          </div>

          <!-- Holiday rows body -->
          <div id="holidayGridBody">
            ${tplDetailHtml}
            ${rowsHtml}
          </div>

        </div>
      </div>
    </div>
  </div>
  `;
};
// ==========================================
// 🟣 4. HOLIDAY TASK MANAGEMENT
// ==========================================
// ==========================================
// 🟣 4. HOLIDAY TASK MANAGEMENT
// ==========================================
// Floating Dropdown menu for Three-dot Action button
window.toggleHolidayDropdown = function(event, groupIdx, holidayName, holidayDate, holidayId) {
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
      <button onclick="document.getElementById('holiday-action-dropdown')?.remove(); deletePublicHoliday('${holidayId}', '${holidayName.replace(/'/g, "\\'")}')" style="
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
        ลบวันหยุด
      </button>
    </div>
  `;
    document.body.insertAdjacentHTML('beforeend', dropdownHtml);
    if (window.lucide) window.lucide.createIcons({
        root: document.getElementById('holiday-action-dropdown')
    });
    const closeDropdown = function(e) {
        if (!e.target.closest('#holiday-action-dropdown') && !e.target.closest('.btn-icon')) {
            const el = document.getElementById('holiday-action-dropdown');
            if (el) el.remove();
            document.removeEventListener('click', closeDropdown);
            window.currentActiveDropdownGroup = null;
        }
    };
    setTimeout(()=>{
        document.addEventListener('click', closeDropdown);
    }, 50);
};
// Custom styled confirmation delete modal
window.showConfirmDelete = function(title, message, onConfirm) {
    const modalId = 'confirmDeleteModal';
    const color = '#ef4444';
    const bgLight = color + '10';
    const icon = 'trash-2';
    const html = `
  <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:150000; backdrop-filter:blur(6px); animation: fadeIn 0.2s ease-out">
    <div class="modal-card" style="background:#fff; width:380px; border-radius:24px; padding:28px 24px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.2); font-family:Prompt, Kanit, sans-serif">
      <div style="width:56px; height:56px; border-radius:18px; background:${bgLight}; color:${color}; display:flex; align-items:center; justify-content:center; margin:0 auto 16px">
        <i data-lucide="${icon}" style="width:28px; height:28px"></i>
      </div>
      <h3 style="margin:0 0 8px; font-size:1.1rem; font-weight:700; color:#1e293b;">${title}</h3>
      <p style="margin:0 0 20px; font-size:.8rem; color:#64748b; line-height:1.5;">${message}</p>
      <div style="display:flex; gap:10px; justify-content:center; align-items:center;">
        <button onclick="document.getElementById('${modalId}').remove()" style="height:32px; padding:0 20px; border-radius:99px; background:#f1f5f9; color:#475569; border:none; font-weight:600; cursor:pointer; font-size:.75rem; transition: background 0.2s; display:inline-flex; align-items:center; justify-content:center;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">ยกเลิก</button>
        <button id="confirmDeleteBtn" style="height:32px; padding:0 20px; border-radius:99px; background:${color}; color:#fff; border:none; font-weight:600; cursor:pointer; font-size:.75rem; box-shadow: 0 2px 8px ${color}30; transition: opacity 0.2s; display:inline-flex; align-items:center; justify-content:center;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">ลบ</button>
      </div>
    </div>
  </div>
  <style>
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  </style>
  `;
    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) window.lucide.createIcons({
        root: document.getElementById(modalId)
    });
    document.getElementById('confirmDeleteBtn').onclick = function() {
        document.getElementById(modalId).remove();
        if (typeof onConfirm === 'function') onConfirm();
    };
};
// Delete all tasks for this holiday
window.deleteHolidayAllTasks = function(holidayName, holidayDate) {
    const dropdown = document.getElementById('holiday-action-dropdown');
    if (dropdown) dropdown.remove();
    window.showConfirmDelete('ยืนยันการลบงานทั้งหมด', `คุณต้องการลบงานทั้งหมดของวันหยุด "${holidayName}" ใช่หรือไม่?`, function() {
        let localShifts = [];
        try {
            localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
        } catch (e) {}
        const matched = localShifts.find((ls)=>ls.name === holidayName && ls.date === holidayDate);
        if (matched && matched.tasks) {
            matched.tasks.forEach((t)=>{
                if (t.id && typeof window.apiSaveHolidayShift === 'function') {
                    window.apiSaveHolidayShift({
                        action: 'delete',
                        id: t.id
                    });
                }
            });
        }
        localShifts = localShifts.filter((ls)=>!(ls.name === holidayName && ls.date === holidayDate));
        localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));
        if (window.showToast) window.showToast('ลบรายการงานวันหยุดทั้งหมดเรียบร้อยแล้ว', 'success');
        else if (window.showAlert) window.showAlert('สำเร็จ', 'ลบรายการงานวันหยุดทั้งหมดเรียบร้อยแล้ว', 'success');
        window.HOLIDAY_LIST = null;
        window.HOLIDAY_TEMPLATES = null;
        if (window.DATA) window.DATA.public_holidays = null;
        __webpack_require__.e(/*! import() */ "_app-pages-browser_src_components_legacy-pages_legacyDataFetcher_js").then(__webpack_require__.bind(__webpack_require__, /*! ./legacyDataFetcher.js */ "(app-pages-browser)/./src/components/legacy-pages/legacyDataFetcher.js")).then((mod)=>{
            if (mod?.fetchAndSetLegacyData) {
                mod.fetchAndSetLegacyData().then(()=>{
                    if (typeof window.navigate === 'function') window.navigate('public-holiday');
                    else window.location.reload();
                });
            } else {
                window.location.reload();
            }
        }).catch(()=>window.location.reload());
    });
};
window.applyTemplateToHolidayClick = function(holidayName, holidayDate) {
    const select = document.getElementById('applyTemplateSelect');
    const tplId = select ? select.value : '';
    if (!tplId) {
        if (window.showToast) window.showToast('กรุณาเลือกชุดงานมาตรฐานก่อน', 'warning');
        else if (window.showAlert) window.showAlert('คำแนะนำ', 'กรุณาเลือกชุดงานมาตรฐานก่อน', 'warning');
        return;
    }
    const modal = document.getElementById('manageHolidayModal');
    if (modal) modal.remove();
    window.openAddHolidayTaskModal(holidayName, holidayDate, null, tplId);
};
// Manage Holiday Tasks modal
window.openManageHolidayModal = function(hName, hDate) {
    const modal = document.getElementById('manageHolidayModal');
    if (modal) modal.remove();
};
window.oldOpenManageHolidayModal = function(holidayName, holidayDate) {
    const dropdown = document.getElementById('holiday-action-dropdown');
    if (dropdown) dropdown.remove();
    const modalId = 'manageHolidayModal';
    const existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();
    let localShifts = [];
    try {
        localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) {}
    const matched = localShifts.find((ls)=>ls.name === holidayName && ls.date === holidayDate);
    const tasks = matched && matched.tasks ? matched.tasks : [];
    const templates = window.HOLIDAY_TEMPLATES || [];
    let tasksHtml = '';
    if (tasks.length === 0) {
        tasksHtml = `
      <div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 0.85rem; font-style: italic;">
        ยังไม่มีชุดงานที่กำหนดสำหรับวันหยุดนี้
      </div>
    `;
    } else {
        tasksHtml = tasks.map((t, idx)=>{
            const list = t.assignments && t.assignments.length > 0 ? t.assignments : t.project && t.project !== '-' ? [
                {
                    project: t.project,
                    job: t.job || '-',
                    percent: t.percent || 100
                }
            ] : [];
            const totalPct = list.reduce((sum, a)=>sum + (parseInt(a.percent) || 0), 0);
            // Get template info by looking at the task ID suffix or by matching properties
            let templateIndex = -1;
            let template = null;
            if (t.id && t.id.startsWith('HS-TPL-')) {
                const parts = t.id.split('-');
                const tplId = parts[2];
                templateIndex = templates.findIndex((tpl)=>String(tpl.id) === String(tplId));
                template = templates.find((tpl)=>String(tpl.id) === String(tplId));
            }
            if (templateIndex === -1) {
                templateIndex = templates.findIndex((tpl)=>tpl.section === t.section && tpl.time === t.time);
                template = templates.find((tpl)=>tpl.section === t.section && tpl.time === t.time);
            }
            const templateName = template && template.name ? template.name : '';
            const displayTitle = templateName ? `Template ${templateIndex + 1} • ${templateName}` : `Template ${templateIndex + 1} • ${t.section}`;
            return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: ${idx === tasks.length - 1 ? 'none' : '1px solid var(--border)'};">
        <div style="min-width: 0; flex: 1; padding-right: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-weight: 700; font-size: 0.85rem; color: #1e293b;">${displayTitle}</span>
            ${templateName ? `<span style="background: #f1e9ff; color: #635bff; padding: 1px 6px; border-radius: 99px; font-size: 0.6rem; font-weight: 700;">${t.section}</span>` : ''}
            <span style="background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 99px; font-size: 0.6rem; font-weight: 800; display: inline-flex; align-items: center; gap: 2px;">
              รวม ${totalPct}%
            </span>
          </div>
          <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">
            ผู้ดำเนินการ: <span style="font-weight: 600; color: #334155;">${t.person}</span> | กะ: <span style="font-weight: 600; color: #334155;">${t.time}</span>
          </div>
          <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 4px; line-height: 1.3;">
            งาน: ${list.map((a)=>`${a.project} (${a.job || '-'} - ${a.percent}%)`).join(', ') || '-'}
          </div>
        </div>
        <div style="display: flex; gap: 6px; flex-shrink: 0; align-items: center;">
          <button onclick="document.getElementById('manageHolidayModal').remove(); openAddHolidayTaskModal('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}', ${idx});" style="
            background: #e0e7ff;
            color: #4f46e5;
            border: none;
            padding: 4px 10px;
            border-radius: 99px;
            font-size: 0.7rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            height: 24px;
            transition: all 0.2s;
          " onmouseover="this.style.background='#c7d2fe'" onmouseout="this.style.background='#e0e7ff'">
            <i data-lucide="edit-2" style="width: 11px; height: 11px;"></i> แก้ไข
          </button>
          <button onclick="deleteSingleHolidayTask('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}', ${idx});" style="
            background: #fee2e2;
            color: #ef4444;
            border: none;
            padding: 4px 10px;
            border-radius: 99px;
            font-size: 0.7rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            height: 24px;
            transition: all 0.2s;
          " onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
            <i data-lucide="trash-2" style="width: 11px; height: 11px;"></i> ลบ
          </button>
        </div>
      </div>
    `;
        }).join('');
    }
    const html = `
    <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:11000; backdrop-filter:blur(6px); animation: fadeIn 0.2s ease-out">
      <div class="modal-card" style="background:#fff; width:550px; border-radius:24px; padding:32px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.2); font-family:Kanit, sans-serif">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin:0; font-size:1.2rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px">
            <i data-lucide="settings" style="width:22px; height:22px; color:var(--primary)"></i> จัดการงานวันหยุด
          </h3>
          <button onclick="document.getElementById('${modalId}').remove()" style="background: none; border: none; cursor: pointer; color: #8f97b0; padding: 4px;">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 20px;">
          วันหยุด: <span style="font-weight: 700; color: #4f46e5;">${holidayName}</span> (${holidayDate})
        </div>
        
        <div style="max-height: 380px; overflow-y: auto; border: 1px solid var(--border); border-radius: 12px; background: #f8fafc;">
          ${tasksHtml}
        </div>
      </div>
    </div>
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes dropdownFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    </style>
  `;
    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) window.lucide.createIcons({
        root: document.getElementById(modalId)
    });
};
// Delete a single task inside a holiday
window.deleteSingleHolidayTask = function(holidayName, holidayDate, taskIdx) {
    window.showConfirmDelete('ยืนยันการลบชุดงาน', 'คุณต้องการลบชุดงานนี้ใช่หรือไม่?', function() {
        let localShifts = [];
        try {
            localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
        } catch (e) {}
        const matchedIdx = localShifts.findIndex((ls)=>ls.name === holidayName && ls.date === holidayDate);
        if (matchedIdx !== -1) {
            const taskToDelete = localShifts[matchedIdx].tasks[taskIdx];
            const taskId = taskToDelete ? taskToDelete.id : null;
            if (taskId && typeof window.apiSaveHolidayShift === 'function') {
                window.apiSaveHolidayShift({
                    action: 'delete',
                    id: taskId
                });
            }
            localShifts[matchedIdx].tasks.splice(taskIdx, 1);
            if (localShifts[matchedIdx].tasks.length === 0) {
                localShifts.splice(matchedIdx, 1);
            }
            localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));
            if (window.showToast) window.showToast('ลบชุดงานเรียบร้อยแล้ว', 'success');
            else if (window.showAlert) window.showAlert('สำเร็จ', 'ลบชุดงานเรียบร้อยแล้ว', 'success');
            const manageModal = document.getElementById('manageHolidayModal');
            if (manageModal) manageModal.remove();
            window.HOLIDAY_LIST = null;
            window.HOLIDAY_TEMPLATES = null;
            __webpack_require__.e(/*! import() */ "_app-pages-browser_src_components_legacy-pages_legacyDataFetcher_js").then(__webpack_require__.bind(__webpack_require__, /*! ./legacyDataFetcher.js */ "(app-pages-browser)/./src/components/legacy-pages/legacyDataFetcher.js")).then((mod)=>{
                if (mod?.fetchAndSetLegacyData) {
                    mod.fetchAndSetLegacyData().then(()=>{
                        if (typeof window.navigate === 'function') window.navigate('public-holiday');
                        else window.location.reload();
                    });
                } else {
                    window.location.reload();
                }
            }).catch(()=>window.location.reload());
        }
    });
};
// Modal handler window globals - Pre-filled Edit and Add Task Modal
window.openAddHolidayTaskModal = function(editHolidayName, editHolidayDate, editTaskIdx, templateId) {
    const isEditMode = typeof editHolidayName !== 'undefined';
    const isTaskEdit = typeof editTaskIdx !== 'undefined' && editTaskIdx !== null;
    const modalId = 'addHolidayTaskModal';
    const existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();
    let localShifts = [];
    try {
        localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) {}
    const sheetHolidays = window.HOLIDAY_LIST || window.DATA && window.DATA.public_holidays || [];
    const holidays = [];
    function getDynamicHolidayStatus(dateStr, tasks) {
        if (!tasks || tasks.length === 0) return 'not_scheduled';
        const s = String(dateStr || '').replace(/[^0-9a-zA-Z\u0E00-\u0E7F\.]/g, '').toLowerCase();
        const thaiMonthsFull = {
            'มกราคม': '01',
            'กุมภาพันธ์': '02',
            'มีนาคม': '03',
            'เมษายน': '04',
            'พฤษภาคม': '05',
            'มิถุนายน': '06',
            'กรกฎาคม': '07',
            'สิงหาคม': '08',
            'กันยายน': '09',
            'ตุลาคม': '10',
            'พฤศจิกายน': '11',
            'ธันวาคม': '12'
        };
        const thaiMonthsShort = {
            'ม.ค.': '01',
            'ก.พ.': '02',
            'มี.ค.': '03',
            'เม.ย.': '04',
            'พ.ค.': '05',
            'มิ.ย.': '06',
            'ก.ค.': '07',
            'ส.ค.': '08',
            'ก.ย.': '09',
            'ต.ค.': '10',
            'พ.ย.': '11',
            'ธ.ค.': '12'
        };
        const engMonths = {
            'jan': '01',
            'feb': '02',
            'mar': '03',
            'apr': '04',
            'may': '05',
            'jun': '06',
            'jul': '07',
            'aug': '08',
            'sep': '09',
            'oct': '10',
            'nov': '11',
            'dec': '12'
        };
        const mFull = s.match(/^(\d{1,2})(.+?)(\d{2,4})$/);
        let isoDate = null;
        if (mFull) {
            const day = mFull[1].padStart(2, '0');
            const monStr = mFull[2];
            const yearVal = parseInt(mFull[3], 10);
            let mon = thaiMonthsFull[monStr] || thaiMonthsShort[monStr] || engMonths[monStr.substring(0, 3)];
            let year = yearVal;
            if (year > 2500) year -= 543;
            else if (year < 100) year += 2000;
            if (mon) isoDate = `${year}-${mon}-${day}`;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
            isoDate = s;
        } else if (!isNaN(new Date(dateStr).getTime())) {
            const d = new Date(dateStr);
            isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        const now = new Date();
        const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (!isoDate) {
            window._debugHolidayFail = (window._debugHolidayFail || '') + `|failed:${dateStr}`;
            return 'upcoming';
        }
        return isoDate < todayIso ? 'finished' : 'upcoming';
    }
    const templates = window.HOLIDAY_TEMPLATES || [];
    if (sheetHolidays.length > 0) {
        sheetHolidays.forEach((sh)=>{
            const matched = localShifts.find((ls)=>ls.date === sh.date || ls.name === sh.name);
            let t = matched ? matched.tasks || [] : [];
            if (t.length === 0 && templates.length > 0) {
                t = templates.map((tpl, tplIdx)=>({
                        id: `HS-TPL-${tpl.id}-${sh.date.replace(/[\s/-]+/g, '_')}`,
                        section: tpl.section,
                        time: tpl.time,
                        person: '-',
                        assignments: tpl.assignments || [],
                        dept: (tpl.assignments || []).map((a)=>`${a.project} - ${a.job}`).join(', '),
                        project: tpl.assignments?.[0]?.project || '-',
                        job: tpl.assignments?.[0]?.job || '-'
                    }));
            }
            holidays.push({
                date: sh.date,
                name: sh.name,
                tasks: t,
                status: getDynamicHolidayStatus(sh.date, t)
            });
        });
        localShifts.forEach((ls)=>{
            const exists = holidays.some((h)=>h.date === ls.date || h.name === ls.name);
            if (!exists) {
                let t = ls.tasks || [];
                if (t.length === 0 && templates.length > 0) {
                    t = templates.map((tpl, tplIdx)=>({
                            id: `HS-TPL-${tpl.id}-${ls.date.replace(/[\s/-]+/g, '_')}`,
                            section: tpl.section,
                            time: tpl.time,
                            person: '-',
                            assignments: tpl.assignments || [],
                            dept: (tpl.assignments || []).map((a)=>`${a.project} - ${a.job}`).join(', '),
                            project: tpl.assignments?.[0]?.project || '-',
                            job: tpl.assignments?.[0]?.job || '-'
                        }));
                }
                holidays.push({
                    ...ls,
                    tasks: t,
                    status: getDynamicHolidayStatus(ls.date, t)
                });
            }
        });
    } else {
        holidays.push(...localShifts.map((ls)=>{
            let t = ls.tasks || [];
            if (t.length === 0 && templates.length > 0) {
                t = templates.map((tpl, tplIdx)=>({
                        id: `HS-TPL-${tpl.id}-${ls.date.replace(/[\s/-]+/g, '_')}`,
                        section: tpl.section,
                        time: tpl.time,
                        person: '-',
                        assignments: tpl.assignments || [],
                        dept: (tpl.assignments || []).map((a)=>`${a.project} - ${a.job}`).join(', '),
                        project: tpl.assignments?.[0]?.project || '-',
                        job: tpl.assignments?.[0]?.job || '-'
                    }));
            }
            return {
                ...ls,
                tasks: t,
                status: getDynamicHolidayStatus(ls.date, t)
            };
        }));
    }
    let matchedHoliday = null;
    let matchedTask = null;
    // Pre-populate from standard templates (Templates)
    const chosenTpl = templateId ? (window.HOLIDAY_TEMPLATES || []).find((t)=>t.id === templateId) : null;
    if (chosenTpl) {
        matchedTask = {
            section: chosenTpl.section,
            assignments: chosenTpl.assignments || [],
            time: chosenTpl.time || '',
            person: ''
        };
    }
    if (isEditMode) {
        matchedHoliday = holidays.find((h)=>h.name === editHolidayName && h.date === editHolidayDate);
        if (matchedHoliday && isTaskEdit) {
            matchedTask = matchedHoliday.tasks[editTaskIdx];
            if (matchedTask && (!matchedTask.assignments || matchedTask.assignments.length === 0)) {
                if (matchedTask.project && matchedTask.project !== '-') {
                    matchedTask.assignments = [
                        {
                            project: matchedTask.project,
                            job: matchedTask.job || '-',
                            percent: matchedTask.percent || 100
                        }
                    ];
                }
            }
        }
        window.editingHolidayTask = {
            name: editHolidayName,
            date: editHolidayDate,
            idx: editTaskIdx
        };
    } else {
        window.editingHolidayTask = null;
    }
    // Extract unique years from the holidays list
    const yearsSet = new Set();
    holidays.forEach((h)=>{
        const match = h.date.match(/\d{4}/);
        if (match) {
            yearsSet.add(match[0]);
        } else {
            const parts = h.date.split(/[\s/-]+/);
            if (parts.length > 0) yearsSet.add(parts[parts.length - 1]);
        }
    });
    const uniqueYears = Array.from(yearsSet).sort((a, b)=>b.localeCompare(a));
    const yearOptions = uniqueYears.map((y)=>`<option value="${y}">${y}</option>`).join('');
    // Save for the dropdown change event
    window.currentModalHolidays = holidays;
    const employees = window.DATA && window.DATA.employees || [];
    const employeeOptions = employees.map((emp)=>`
    <option value="${emp.name}">${emp.name} (${emp.nickname || emp.pos})</option>
  `).join('');
    const scopeTasks = typeof window.getTasksFromScope === 'function' ? window.getTasksFromScope() : [];
    const uniqueProjects = [
        ...new Set(scopeTasks.map((t)=>t.acc))
    ].sort();
    const projectOptions = uniqueProjects.map((proj)=>`
    <option value="${proj}">${proj}</option>
  `).join('');
    const uniqueJobsByProject = {};
    scopeTasks.forEach((t)=>{
        if (!uniqueJobsByProject[t.acc]) {
            uniqueJobsByProject[t.acc] = new Set();
        }
        uniqueJobsByProject[t.acc].add(t.title);
    });
    for(const proj in uniqueJobsByProject){
        uniqueJobsByProject[proj] = Array.from(uniqueJobsByProject[proj]).sort();
    }
    let projectRowsHtml = '';
    if (matchedTask && matchedTask.assignments && matchedTask.assignments.length > 0) {
        projectRowsHtml = matchedTask.assignments.map((a, idx)=>{
            return `
      <div class="project-row" style="display:grid; grid-template-columns:1fr 1fr 80px auto; gap:12px; margin-bottom:12px; align-items:center;">
        <select class="htProject" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:9999px; font-size:.8rem; outline:none" onchange="window.onHolidayProjectChange(this)">
          <option value="">-- เลือกโครงการ --</option>
          ${uniqueProjects.map((proj)=>`<option value="${proj}" ${proj === a.project ? 'selected' : ''}>${proj}</option>`).join('')}
        </select>
        <input type="text" class="htJob" placeholder="ชื่องาน" value="${a.job || ''}" style="width:100%; padding:10px 16px; border:1px solid var(--border); border-radius:9999px; font-size:.8rem; outline:none; box-sizing:border-box;">
        <div style="position:relative;">
          <input type="number" class="htPercent" value="${a.percent || 100}" min="0" max="100" style="width:100%; padding:10px 24px 10px 10px; border:1px solid var(--border); border-radius:9999px; font-size:.8rem; outline:none; text-align:center;" oninput="window.calcHolidayTaskTotalPercent()">
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
      <select class="htProject" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:9999px; font-size:.8rem; outline:none" onchange="window.onHolidayProjectChange(this)">
        <option value="">-- เลือกโครงการ --</option>
        ${uniqueProjects.map((proj)=>`<option value="${proj}">${proj}</option>`).join('')}
      </select>
      <input type="text" class="htJob" placeholder="ชื่องาน" value="" style="width:100%; padding:10px 16px; border:1px solid var(--border); border-radius:9999px; font-size:.8rem; outline:none; box-sizing:border-box;">
      <div style="position:relative;">
        <input type="number" class="htPercent" value="100" min="0" max="100" style="width:100%; padding:10px 24px 10px 10px; border:1px solid var(--border); border-radius:9999px; font-size:.8rem; outline:none; text-align:center;" oninput="window.calcHolidayTaskTotalPercent()">
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
      <div style="padding:24px 32px 16px; border-bottom:1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h3 style="margin:0 0 8px; font-size:1.25rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px">
            <i data-lucide="calendar-plus" style="width:24px; height:24px; color:var(--primary)"></i>
            ${isEditMode ? 'แก้ไขรายการวันหยุดปฏิบัติงาน' : 'เพิ่มรายการวันหยุดปฏิบัติงาน'}
          </h3>
          <p style="margin:0; font-size:.8rem; color:#64748b">กรอกข้อมูลโครงการ งาน และกะเวลาสำหรับวันหยุดนักขัตฤกษ์</p>
        </div>
        <button onclick="document.getElementById('${modalId}').remove()" style="background: none; border: none; cursor: pointer; color: #8f97b0; padding: 4px;">
          <i data-lucide="x" style="width: 20px; height: 20px;"></i>
        </button>
      </div>
      
      <form id="htTaskForm" onsubmit="event.preventDefault(); window.submitHolidayTaskForm();" style="padding:32px; overflow-y:auto; margin:0; display:flex; flex-direction:column; gap:16px">
        
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
          <select id="htSection" class="section-select" data-prev-value="${matchedTask ? matchedTask.section || '' : ''}"
            onchange="window.onSectionSelectChange(this); this.dataset.prevValue = this.value !== '_add_new_section_' ? this.value : this.dataset.prevValue;"
            style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; background:#fff">
            ${window.buildSectionOptions(matchedTask ? matchedTask.section || '' : '')}
          </select>
        </div>

        <div style="margin-bottom:16px;">
          <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">โครงการและงาน (Project & Job)</label>
          <div id="htProjectContainer">
            ${projectRowsHtml}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <button type="button" onclick="window.addHolidayTaskProjectRow()" style="background:none; border:none; color:var(--primary); font-size:.7rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px; padding:0;">
              <i data-lucide="plus" style="width:12px; height:12px"></i> Add another task
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

        <div style="margin-bottom:16px">
          <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">ผู้ดำเนินการ</label>
          <select id="htPerson" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; background:#fff">
            <option value="">-- เลือกพนักงาน (ไม่ระบุ = ยังไม่กำหนด) --</option>
            ${employees.map((emp)=>`
              <option value="${emp.name}" ${matchedTask && matchedTask.person === emp.name ? 'selected' : ''}>${emp.name} (${emp.nickname || emp.pos})</option>
            `).join('')}
          </select>
        </div>

        <div style="margin-bottom:24px">
          <label style="display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:6px">สถานะ</label>
          <select id="htStatus" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-size:.8rem; outline:none; background:#fff">
            <option value="upcoming" ${matchedHoliday && matchedHoliday.status === 'upcoming' ? 'selected' : ''}>กำลังจะถึง (Upcoming)</option>
            <option value="finished" ${matchedHoliday && matchedHoliday.status === 'finished' ? 'selected' : ''}>เสร็จสิ้นแล้ว (Finished)</option>
          </select>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px">
          <button type="button" onclick="document.getElementById('${modalId}').remove()" class="btn" style="background:#f1f5f9; color:#475569; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:500; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px;"><i data-lucide="x" style="width:14px;height:14px"></i>Cancel</button>
          <button type="submit" class="btn btn-primary" style="background:var(--primary); color:#fff; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:600; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px;">${isEditMode ? '<i data-lucide="save" style="width:14px;height:14px"></i>Save Changes' : '<i data-lucide="arrow-right" style="width:14px;height:14px"></i>Next: Select Holiday'}</button>
        </div>
      </form>
    </div>
  </div>
  <style>
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  </style>
  `;
    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) window.lucide.createIcons({
        root: document.getElementById(modalId)
    });
    if (typeof TomSelect !== 'undefined') {
        document.querySelectorAll('#' + modalId + ' select.htJob').forEach((el)=>{
            new TomSelect(el, {
                create: false,
                sortField: {
                    field: "text",
                    direction: "asc"
                }
            });
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
window.onHolidayYearChange = function(year) {
    const sel = document.getElementById('htHolidaySelect');
    if (!sel || !window.currentModalHolidays) return;
    const filtered = window.currentModalHolidays.filter((h)=>h.date.includes(year));
    let opts = '<option value="" disabled selected>-- เลือกวันหยุด --</option>';
    filtered.forEach((h)=>{
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
    const tsWrappers = clone.querySelectorAll('.ts-wrapper');
    tsWrappers.forEach((ts)=>ts.remove());
    const selects = clone.querySelectorAll('select.htProject');
    selects.forEach((s)=>{
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
    if (window.lucide) window.lucide.createIcons({
        root: clone
    });
    window.calcHolidayTaskTotalPercent();
};
window.calcHolidayTaskTotalPercent = function() {
    let total = 0;
    document.querySelectorAll('.htPercent').forEach((input)=>{
        total += parseInt(input.value) || 0;
    });
    const label = document.getElementById('htTotalPercent');
    if (label) {
        label.textContent = `รวม: ${total}%`;
        label.style.color = 'var(--primary)';
    }
};
window.onHolidayJobChange = function(el) {
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
    const scopeTasks = typeof window.getTasksFromScope === 'function' ? window.getTasksFromScope() : [];
    const matchedTask = scopeTasks.find((t)=>t.acc === selectedProj && t.title === selectedJob);
    if (matchedTask) {
        pctInput.value = matchedTask.hours || 0;
    } else {
        pctInput.value = '0';
    }
    window.calcHolidayTaskTotalPercent();
};
window.onHolidayProjectChange = function(el) {
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
        if (typeof TomSelect !== 'undefined') {
            new TomSelect(jobSelect, {
                create: false,
                sortField: {
                    field: "text",
                    direction: "asc"
                }
            });
        }
        return;
    }
    const scopeTasks = typeof window.getTasksFromScope === 'function' ? window.getTasksFromScope() : [];
    const jobs = scopeTasks.filter((t)=>t.acc === selectedProj).map((t)=>t.title);
    const uniqueJobs = [
        ...new Set(jobs)
    ].sort();
    uniqueJobs.forEach((job)=>{
        const opt = document.createElement('option');
        opt.value = job;
        opt.textContent = job;
        jobSelect.appendChild(opt);
    });
    if (typeof TomSelect !== 'undefined') {
        new TomSelect(jobSelect, {
            create: false,
            sortField: {
                field: "text",
                direction: "asc"
            }
        });
    }
};
window.submitHolidayTaskForm = function() {
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
    projectRows.forEach((row)=>{
        const p = row.querySelector('.htProject').value;
        const j = row.querySelector('.htJob').value;
        const pct = parseInt(row.querySelector('.htPercent').value) || 0;
        if (p && j) {
            assignments.push({
                project: p,
                job: j,
                percent: pct
            });
            totalPct += pct;
        }
    });
    if (isEdit && (!holidayName || !holidayDate)) {
        if (window.showToast) window.showToast('กรุณาเลือกปีและชื่อวันหยุดให้ครบถ้วน', 'danger');
        else if (window.showAlert) window.showAlert('ผิดพลาด', 'กรุณาเลือกปีและชื่อวันหยุดให้ครบถ้วน', 'danger');
        return;
    }
    if (!section) {
        if (window.showToast) window.showToast('กรุณาเลือก Section', 'danger');
        else if (window.showAlert) window.showAlert('ผิดพลาด', 'กรุณาเลือก Section', 'danger');
        return;
    }
    if (assignments.length === 0) {
        if (window.showToast) window.showToast('กรุณาเลือกโครงการและงานให้ครบถ้วนอย่างน้อย 1 รายการ', 'danger');
        else if (window.showAlert) window.showAlert('ผิดพลาด', 'กรุณาเลือกโครงการและงานให้ครบถ้วนอย่างน้อย 1 รายการ', 'danger');
        return;
    }
    if (!time) {
        if (window.showToast) window.showToast('กรุณาเลือกกะเวลาปฏิบัติงาน', 'danger');
        else if (window.showAlert) window.showAlert('ผิดพลาด', 'กรุณาเลือกกะเวลาปฏิบัติงาน', 'danger');
        return;
    }
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
    const dept = assignments.map((a)=>`${a.project} - ${a.job}`).join(', ');
    const project = assignments[0].project;
    const job = assignments[0].job;
    let localShifts = [];
    try {
        localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) {}
    let taskId = '';
    const editInfo = window.editingHolidayTask || {};
    const isActualTaskEdit = editInfo.idx !== undefined && editInfo.idx !== null && editInfo.idx !== '';
    if (isEdit) {
        let matched = localShifts.find((ls)=>ls.name === editInfo.name && ls.date === editInfo.date);
        if (matched) {
            if (!matched.tasks) matched.tasks = [];
            if (isActualTaskEdit) {
                const oldTask = matched.tasks[editInfo.idx] || {};
                taskId = oldTask.id || 'HS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
                const updatedTask = {
                    id: taskId,
                    dept,
                    project,
                    job,
                    assignments,
                    section,
                    person,
                    time
                };
                matched.tasks[editInfo.idx] = updatedTask;
            } else {
                taskId = 'HS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
                matched.tasks.push({
                    id: taskId,
                    dept,
                    project,
                    job,
                    assignments,
                    section,
                    person,
                    time
                });
            }
            matched.status = status;
        } else {
            taskId = 'HS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            localShifts.push({
                date: holidayDate,
                name: holidayName,
                status: status,
                tasks: [
                    {
                        id: taskId,
                        dept,
                        project,
                        job,
                        assignments,
                        section,
                        person,
                        time
                    }
                ]
            });
        }
        window.editingHolidayTask = null;
    } else {
        taskId = 'HS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        let matched = localShifts.find((ls)=>ls.name === holidayName && ls.date === holidayDate);
        if (matched) {
            if (!matched.tasks) matched.tasks = [];
            matched.tasks.push({
                id: taskId,
                dept,
                project,
                job,
                assignments,
                section,
                person,
                time
            });
            matched.status = status;
        } else {
            localShifts.push({
                date: holidayDate,
                name: holidayName,
                status: status,
                tasks: [
                    {
                        id: taskId,
                        dept,
                        project,
                        job,
                        assignments,
                        section,
                        person,
                        time
                    }
                ]
            });
        }
    }
    localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));
    if (typeof window.apiSaveHolidayShift === 'function') {
        window.apiSaveHolidayShift({
            action: isEdit && isActualTaskEdit ? 'edit' : 'add',
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
    if (window.showToast) {
        window.showToast(isEdit ? 'แก้ไขชุดงานวันหยุดเรียบร้อย' : 'เพิ่มชุดงานวันหยุดเรียบร้อย', 'success');
    } else if (window.showAlert) {
        window.showAlert('สำเร็จ', isEdit ? 'แก้ไขชุดงานวันหยุดเรียบร้อย' : 'เพิ่มชุดงานวันหยุดเรียบร้อย', 'success');
    }
    if (typeof window.navigate === 'function') {
        window.navigate('public-holiday');
    } else {
        window.location.reload();
    }
};
window.openSelectHolidaysModal = function() {
    const holidays = window.currentModalHolidays || [];
    if (holidays.length === 0) {
        if (window.showToast) window.showToast('ไม่พบข้อมูลวันหยุด', 'danger');
        else if (window.showAlert) window.showAlert('ผิดพลาด', 'ไม่พบข้อมูลวันหยุด', 'danger');
        return;
    }
    const grouped = {};
    holidays.forEach((h)=>{
        const match = h.date.match(/\d{4}/);
        const year = match ? match[0] : h.date.split(/[\s/-]+/).pop();
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(h);
    });
    const years = Object.keys(grouped).sort((a, b)=>b.localeCompare(a));
    let listHtml = '';
    years.forEach((year)=>{
        listHtml += `
      <div style="margin-bottom:16px;">
        <h4 style="margin:0 0 10px; font-size:.9rem; font-weight:700; color:var(--primary); border-bottom:1px solid var(--border); padding-bottom:6px;">ปี ${year}</h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
    `;
        grouped[year].forEach((h)=>{
            listHtml += `
        <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:8px 12px; border-radius:8px; border:1px solid var(--border); transition:all 0.2s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='none'">
          <input type="checkbox" class="ht-holiday-checkbox" value='${JSON.stringify({
                name: h.name,
                date: h.date
            }).replace(/'/g, "&#39;")}' style="width:16px; height:16px; accent-color:var(--primary); cursor:pointer;">
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
      <div style="padding:24px 32px 16px; border-bottom:1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h3 style="margin:0 0 8px; font-size:1.25rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px">
            <i data-lucide="calendar-check" style="width:24px; height:24px; color:var(--primary)"></i> เลือกวันหยุดที่ต้องการเพิ่มงาน
          </h3>
          <p style="margin:0; font-size:.8rem; color:#64748b">กรอกข้อมูลโครงการ งาน และกะเวลาสำหรับวันหยุดนักขัตฤกษ์</p>
        </div>
        <button onclick="document.getElementById('${modalId}').remove()" style="background: none; border: none; cursor: pointer; color: #8f97b0; padding: 4px;">
          <i data-lucide="x" style="width: 20px; height: 20px;"></i>
        </button>
      </div>
      <div style="flex:1; overflow-y:auto; padding:24px 32px;">
        ${listHtml}
      </div>
      <div style="padding:16px 32px 24px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:8px;">
        <button onclick="document.getElementById('${modalId}').remove()" style="background:#f1f5f9; color:#64748b; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:500; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px;"><i data-lucide="x" style="width:14px;height:14px"></i>Cancel</button>
        <button onclick="window.submitHolidayTaskBatch()" style="background:var(--primary); color:#fff; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:600; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px;"><i data-lucide="save" style="width:14px;height:14px"></i>Save</button>
      </div>
    </div>
  </div>
  `;
    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) window.lucide.createIcons({
        root: document.getElementById(modalId)
    });
};
window.submitHolidayTaskBatch = function() {
    const checkboxes = document.querySelectorAll('.ht-holiday-checkbox:checked');
    if (checkboxes.length === 0) {
        if (window.showToast) window.showToast('กรุณาเลือกวันหยุดอย่างน้อย 1 วัน', 'danger');
        else if (window.showAlert) window.showAlert('ผิดพลาด', 'กรุณาเลือกวันหยุดอย่างน้อย 1 วัน', 'danger');
        return;
    }
    const pending = window.pendingHolidayTask;
    if (!pending) {
        if (window.showToast) window.showToast('ไม่พบข้อมูลงานที่รอดำเนินการ', 'danger');
        else if (window.showAlert) window.showAlert('ผิดพลาด', 'ไม่พบข้อมูลงานที่รอดำเนินการ', 'danger');
        return;
    }
    const selectedHolidays = [];
    checkboxes.forEach((cb)=>{
        try {
            selectedHolidays.push(JSON.parse(cb.value));
        } catch (e) {}
    });
    let localShifts = [];
    try {
        localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) {}
    selectedHolidays.forEach((h)=>{
        const holidayName = h.name;
        const holidayDate = h.date;
        const dept = pending.assignments.map((a)=>`${a.project} - ${a.job}`).join(', ');
        const project = pending.assignments[0].project;
        const job = pending.assignments[0].job;
        const taskId = 'HS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        let matched = localShifts.find((ls)=>ls.name === holidayName && ls.date === holidayDate);
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
                tasks: [
                    {
                        id: taskId,
                        dept,
                        project,
                        job,
                        assignments: pending.assignments,
                        section: pending.section,
                        person: pending.person,
                        time: pending.time
                    }
                ]
            });
        }
        if (typeof window.apiSaveHolidayShift === 'function') {
            window.apiSaveHolidayShift({
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
    if (window.showToast) {
        window.showToast(`เพิ่มชุดงานลงใน ${selectedHolidays.length} วันหยุดเรียบร้อยแล้ว`, 'success');
    } else if (window.showAlert) {
        window.showAlert('สำเร็จ', `เพิ่มชุดงานลงใน ${selectedHolidays.length} วันหยุดเรียบร้อยแล้ว`, 'success');
    }
    if (typeof window.navigate === 'function') {
        window.navigate('public-holiday');
    } else {
        window.location.reload();
    }
};
// ==========================================
// 🟣 5. HOLIDAY ASSIGNMENT SUMMARY & TARGETS
// ==========================================
// Helper to determine if holiday is "Special" (สิ้นปี, ขึ้นปีใหม่, สงกรานต์)
window.isSpecialHoliday = function(holidayName) {
    if (!holidayName) return false;
    const name = holidayName.toLowerCase();
    return name.includes('สิ้นปี') || name.includes('ปีใหม่') || name.includes('สงกรานต์') || name.includes('new year') || name.includes('songkran');
};
// Open settings modal to configure required working days per role & section (Grouped by Section)
window.openHolidayTargetsModal = function() {
    const existing = document.getElementById('holidayTargetsModal');
    if (existing) existing.remove();
    // Get current targets or set defaults
    let targets = {};
    try {
        targets = JSON.parse(localStorage.getItem('holiday_working_targets_v2') || '{}');
    } catch (e) {}
    // Roles per section — use dynamic sections, fallback role list covers all
    const defaultRoles = [
        'Assistant Manager',
        'Senior',
        'Junior',
        'Probation'
    ];
    const sections = typeof window.getHolidaySections === 'function' ? window.getHolidaySections() : [
        'Operation',
        'Content',
        'Graphics',
        'ETDA Call Center',
        'OR Call Center'
    ];
    // Try to get saved custom roles-per-section, else use defaults
    let sectionRolesMap = {};
    try {
        const saved = JSON.parse(localStorage.getItem('holiday_section_roles') || '{}');
        sections.forEach((sec)=>{
            sectionRolesMap[sec] = saved[sec] && saved[sec].length > 0 ? saved[sec] : [
                ...defaultRoles
            ];
        });
    } catch (e) {
        sections.forEach((sec)=>{
            sectionRolesMap[sec] = [
                ...defaultRoles
            ];
        });
    }
    let rowsHtml = '';
    sections.forEach((sec)=>{
        const roles = sectionRolesMap[sec];
        rowsHtml += `
      <div style="background:#ffffff; padding:16px; border-radius:16px; border:1px solid #e2e8f0; margin-bottom:16px; box-shadow: 0 4px 12px rgba(0,0,0,0.01);">
        <div style="font-weight:700; font-size:.85rem; color:#4f46e5; border-bottom:1px solid #f1f5f9; padding-bottom:8px; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
          <span style="width:6px; height:6px; border-radius:50%; background:#4f46e5;"></span>
          ${sec}
        </div>
    `;
        roles.forEach((role)=>{
            const key = `${role}_${sec}`;
            const normalVal = targets[key]?.normal !== undefined ? targets[key].normal : 0;
            const specialVal = targets[key]?.special !== undefined ? targets[key].special : 0;
            rowsHtml += `
        <div style="display:grid; grid-template-columns:1.8fr 1fr 1fr; gap:16px; align-items:center; margin-bottom:8px">
          <span style="font-weight:600; font-size:.78rem; color:#475569; padding-left:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${role}">${role}</span>
          <div style="position:relative; display:flex; align-items:center;">
            <input type="number" min="0" id="target_normal_${key.replace(/[^a-zA-Z0-9]/g, '_')}" value="${normalVal}" style="width:100%; box-sizing:border-box; padding:5px 12px; border:1px solid #cbd5e1; border-radius:99px; font-family:Kanit; font-size:.8rem; outline:none; text-align:center; transition: all 0.2s; background:#f8fafc;" onfocus="this.style.borderColor='#635bff'; this.style.background='#fff';" onblur="this.style.borderColor='#cbd5e1'; this.style.background='#f8fafc';">
          </div>
          <div style="position:relative; display:flex; align-items:center;">
            <input type="number" min="0" id="target_special_${key.replace(/[^a-zA-Z0-9]/g, '_')}" value="${specialVal}" style="width:100%; box-sizing:border-box; padding:5px 12px; border:1px solid #cbd5e1; border-radius:99px; font-family:Kanit; font-size:.8rem; outline:none; text-align:center; transition: all 0.2s; background:#f8fafc;" onfocus="this.style.borderColor='#635bff'; this.style.background='#fff';" onblur="this.style.borderColor='#cbd5e1'; this.style.background='#f8fafc';">
          </div>
        </div>
      `;
        });
        rowsHtml += `</div>`;
    });
    const modalHtml = `
    <div id="holidayTargetsModal" style="position:fixed; inset:0; background:rgba(15, 23, 42, 0.4); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:99999; display:flex; align-items:center; justify-content:center; font-family:'Kanit', sans-serif;">
      <div style="background:#ffffff; width:540px; border-radius:28px; box-shadow:0 24px 64px rgba(15,23,42,0.15); overflow:hidden; padding:32px; box-sizing:border-box; border: 1px solid rgba(226, 232, 240, 0.8)">
        <h3 style="margin:0 0 8px 0; font-size:1.15rem; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:8px">
          <i data-lucide="settings" style="width:22px; height:22px; color:#635bff"></i> Set Workday Targets by Section
        </h3>
        <p style="font-size:0.8rem; color:#64748b; margin-top:0; margin-bottom:24px;">Define target days for each employee role within each section.</p>

        <div style="display:grid; grid-template-columns:1.8fr 1fr 1fr; gap:16px; margin-bottom:12px; font-weight:700; font-size:.8rem; color:#475569; padding:0 16px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
          <span>Position</span>
          <span style="text-align:center">Regular Days</span>
          <span style="text-align:center">Special Days*</span>
        </div>

        <div style="max-height:360px; overflow-y:auto; padding-right:8px; box-sizing:border-box; margin-bottom:16px;">
          ${rowsHtml}
        </div>

        <div style="font-size:.7rem; color:#94a3b8; line-height:1.4; padding-top:8px; border-top:1px solid #f1f5f9; margin-bottom:24px;">
          <strong>Note:</strong> *Special Days include New Year's Eve, New Year's Day, and Songkran.
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button onclick="document.getElementById('holidayTargetsModal').remove()" style="height:32px; padding:0 16px; border:1px solid #e2e8f0; background:#f1f5f9; border-radius:99px; cursor:pointer; font-family:'Kanit'; font-size:0.75rem; font-weight:500; color:#64748b; display:inline-flex; align-items:center; gap:6px;"><i data-lucide="x" style="width:14px;height:14px"></i>Cancel</button>
          <button onclick="window.saveHolidayTargets()" style="height:32px; padding:0 16px; background:#635bff; color:#fff; border:none; border-radius:99px; cursor:pointer; font-family:'Kanit'; font-size:0.75rem; font-weight:600; display:inline-flex; align-items:center; gap:6px; box-shadow: 0 4px 12px rgba(99,91,255,0.25);"><i data-lucide="save" style="width:14px;height:14px"></i>Save</button>
        </div>
      </div>
    </div>
  `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons({
        root: document.getElementById('holidayTargetsModal')
    });
};
// Save target config to localStorage
window.saveHolidayTargets = function() {
    const defaultRoles = [
        'Assistant Manager',
        'Senior',
        'Junior',
        'Probation'
    ];
    const sections = typeof window.getHolidaySections === 'function' ? window.getHolidaySections() : [
        'Operation',
        'Content',
        'Graphics',
        'ETDA Call Center',
        'OR Call Center'
    ];
    let sectionRolesMap = {};
    try {
        const saved = JSON.parse(localStorage.getItem('holiday_section_roles') || '{}');
        sections.forEach((sec)=>{
            sectionRolesMap[sec] = saved[sec] && saved[sec].length > 0 ? saved[sec] : [
                ...defaultRoles
            ];
        });
    } catch (e) {
        sections.forEach((sec)=>{
            sectionRolesMap[sec] = [
                ...defaultRoles
            ];
        });
    }
    const targets = {};
    Object.entries(sectionRolesMap).forEach(([sec, roles])=>{
        roles.forEach((role)=>{
            const key = `${role}_${sec}`;
            const normalVal = parseInt(document.getElementById(`target_normal_${key.replace(/[^a-zA-Z0-9]/g, '_')}`)?.value || '0', 10);
            const specialVal = parseInt(document.getElementById(`target_special_${key.replace(/[^a-zA-Z0-9]/g, '_')}`)?.value || '0', 10);
            targets[key] = {
                normal: normalVal,
                special: specialVal
            };
        });
    });
    localStorage.setItem('holiday_working_targets_v2', JSON.stringify(targets));
    document.getElementById('holidayTargetsModal').remove();
    if (window.showToast) window.showToast('Saved successfully', 'success');
    // Re-render Summary Page
    if (typeof window.navigate === 'function') window.navigate('holiday-summary');
};
// Main Holiday Summary Page Renderer
window.pageHolidaySummary = function() {
    window.currentPage = 'holiday-summary';
    // 1. Get shift data from local shifts
    let localShifts = [];
    try {
        localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
    } catch (e) {}
    // 2. Fetch targets or use fallback defaults
    let targets = {};
    try {
        targets = JSON.parse(localStorage.getItem('holiday_working_targets_v2') || '{}');
        // Migrate legacy keys: copy "Content & Graphics" targets to separate "Content" and "Graphics" if missing
        let migrated = false;
        Object.entries(targets).forEach(([key, val])=>{
            const match = key.match(/^(.+?)_Content & Graphics$/i);
            if (match) {
                const role = match[1];
                const contentKey = `${role}_Content`;
                const graphicsKey = `${role}_Graphics`;
                if (targets[contentKey] === undefined) {
                    targets[contentKey] = {
                        ...val
                    };
                    migrated = true;
                }
                if (targets[graphicsKey] === undefined) {
                    targets[graphicsKey] = {
                        ...val
                    };
                    migrated = true;
                }
            }
        });
        if (migrated) {
            localStorage.setItem('holiday_working_targets_v2', JSON.stringify(targets));
        }
    } catch (e) {}
    // Filter states
    const selectedStatus = window.holidaySummaryFilterStatus || 'all';
    const selectedPos = window.holidaySummaryFilterPosition || '';
    window.changeHolidaySummaryFilter = function(type, value) {
        if (type === 'status') {
            window.holidaySummaryFilterStatus = value;
        } else if (type === 'position') {
            window.holidaySummaryFilterPosition = value;
        }
        if (typeof window.navigate === 'function') {
            window.navigate('holiday-summary');
        }
    };
    window.clearHolidaySummaryFilters = function() {
        window.holidaySummaryFilterStatus = 'all';
        window.holidaySummaryFilterPosition = '';
        if (typeof window.navigate === 'function') {
            window.navigate('holiday-summary');
        }
    };
    // 3. Collect all employee list, filtering out Directors and Managers
    const baseEmployees = (window.DATA?.employees || []).filter((e)=>{
        if (!e.name || e.name === '-') return false;
        const pos = String(e.pos || '').toLowerCase();
        if (pos.includes('director')) return false;
        if (pos.includes('manager') && !pos.includes('assistant manager')) return false;
        return true;
    });
    const allPositions = [
        ...new Set(baseEmployees.map((e)=>e.pos || '-'))
    ].filter((p)=>p && p !== '-').sort();
    const employees = baseEmployees.filter((e)=>{
        if (selectedPos && e.pos !== selectedPos) return false;
        return true;
    });
    // Dynamic sections based on Section Manager config
    const sections = typeof window.getHolidaySections === 'function' ? window.getHolidaySections() : [
        'Operation',
        'Content',
        'Graphics',
        'ETDA Call Center',
        'OR Call Center'
    ];
    // 4. Map structure dynamically based on configured sections
    const summaryMap = {};
    employees.forEach((emp)=>{
        const normalShifts = {};
        const specialShifts = {};
        sections.forEach((sec)=>{
            normalShifts[sec] = [];
            specialShifts[sec] = [];
        });
        summaryMap[emp.name] = {
            normalShifts,
            specialShifts,
            pos: emp.pos || 'Other'
        };
    });
    // Helper: normalize section names to match current dynamic sections or legacy fallbacks
    const normalizeSection = (sec)=>{
        if (!sec) return 'Operation';
        const found = sections.find((s)=>s.toLowerCase() === sec.toLowerCase());
        if (found) return found;
        // Legacy fallback mapping
        const lower = sec.toLowerCase();
        if (lower === 'content & graphics' || lower === 'content/graphics') {
            if (sections.includes('Content')) return 'Content';
            if (sections.includes('Graphics')) return 'Graphics';
        }
        if (lower === 'call center') {
            if (sections.includes('ETDA Call Center')) return 'ETDA Call Center';
            if (sections.includes('OR Call Center')) return 'OR Call Center';
        }
        return sec;
    };
    // Populate shift data
    localShifts.forEach((shift)=>{
        const isSpecial = window.isSpecialHoliday(shift.name);
        if (shift.tasks && Array.isArray(shift.tasks)) {
            shift.tasks.forEach((t)=>{
                if (t.person && t.person !== '-') {
                    const cleanStr = (s)=>String(s || '').trim().replace(/[\s\u00a0]+/g, '').toLowerCase();
                    const pClean = cleanStr(t.person);
                    const emp = employees.find((e)=>cleanStr(e.name) === pClean || cleanStr(e.nameEn) === pClean || cleanStr(e.nickname) === pClean);
                    if (emp) {
                        const entry = {
                            date: shift.date,
                            name: shift.name
                        };
                        const sec = normalizeSection(t.section);
                        const targetMap = isSpecial ? summaryMap[emp.name].specialShifts : summaryMap[emp.name].normalShifts;
                        if (targetMap) {
                            if (!targetMap[sec]) {
                                targetMap[sec] = [];
                            }
                            if (!targetMap[sec].some((d)=>d.date === shift.date)) {
                                targetMap[sec].push(entry);
                            }
                        }
                    }
                }
            });
        }
    });
    // Sort employee summary rows by Employee ID (e.g., DIB001, DIB002)
    const sortedEmployees = [
        ...employees
    ].sort((a, b)=>{
        const idA = String(a.id || '');
        const idB = String(b.id || '');
        return idA.localeCompare(idB, undefined, {
            numeric: true,
            sensitivity: 'base'
        });
    });
    let totalNormalTarget = 0;
    let totalNormalActual = 0;
    let totalSpecialTarget = 0;
    let totalSpecialActual = 0;
    let rowsHtml = '';
    sortedEmployees.forEach((emp)=>{
        const data = summaryMap[emp.name];
        const role = data.pos;
        // Check completion across all configured Sections
        let overallMet = true;
        let sectionsNormalHtml = '';
        let sectionsSpecialHtml = '';
        // Determine the single section this employee belongs to
        let empSection = 'Operation';
        // Check if the employee has any actual scheduled shifts first (override default fallback)
        const activeNormal = Object.keys(data.normalShifts).filter((s)=>data.normalShifts[s] && data.normalShifts[s].length > 0);
        const activeSpecial = Object.keys(data.specialShifts).filter((s)=>data.specialShifts[s] && data.specialShifts[s].length > 0);
        const activeSections = [
            ...new Set([
                ...activeNormal,
                ...activeSpecial
            ])
        ];
        if (activeSections.length > 0) {
            empSection = activeSections[0];
        } else {
            let rawSec = emp.dept || emp.team || '';
            let normalized = normalizeSection(rawSec);
            if (sections.includes(normalized)) {
                empSection = normalized;
            } else if (emp.pos) {
                const posLower = emp.pos.toLowerCase();
                const matchedSec = sections.find((s)=>posLower.includes(s.toLowerCase()));
                if (matchedSec) {
                    empSection = matchedSec;
                } else if (posLower.includes('content') || posLower.includes('graphics')) {
                    empSection = sections.includes('Content') ? 'Content' : sections.includes('Graphics') ? 'Graphics' : 'Operation';
                } else if (posLower.includes('call center')) {
                    empSection = sections.includes('ETDA Call Center') ? 'ETDA Call Center' : sections.includes('OR Call Center') ? 'OR Call Center' : 'Operation';
                }
            }
        }
        const sectionsToRender = [
            empSection
        ];
        sectionsToRender.forEach((sec)=>{
            const key = `${role}_${sec}`;
            const roleTargets = targets[key] || {
                normal: 0,
                special: 0
            };
            const normalCount = data.normalShifts[sec]?.length || 0;
            const specialCount = data.specialShifts[sec]?.length || 0;
            const normalMet = normalCount >= roleTargets.normal;
            const specialMet = specialCount >= roleTargets.special;
            if (!normalMet || !specialMet) {
                overallMet = false;
            }
            if (roleTargets.normal > 0 || normalCount > 0) {
                sectionsNormalHtml += `
          <div style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:center; justify-content:center; gap:6px;">
            <span style="color:#64748b; font-weight:500;">${sec}:</span>
            <span style="font-weight:700; color:${normalMet ? '#10b981' : '#f59e0b'}">${normalCount}</span>
            <span style="color:#94a3b8">/</span>
            <span style="color:#64748b">${roleTargets.normal}</span>
            ${normalMet ? '<i data-lucide="check" style="width:12px; height:12px; color:#10b981"></i>' : '<i data-lucide="alert-circle" style="width:12px; height:12px; color:#f59e0b"></i>'}
          </div>
        `;
            }
            if (roleTargets.special > 0 || specialCount > 0) {
                sectionsSpecialHtml += `
          <div style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:center; justify-content:center; gap:6px;">
            <span style="color:#64748b; font-weight:500;">${sec}:</span>
            <span style="font-weight:700; color:${specialMet ? '#10b981' : '#f59e0b'}">${specialCount}</span>
            <span style="color:#94a3b8">/</span>
            <span style="color:#64748b">${roleTargets.special}</span>
            ${specialMet ? '<i data-lucide="check" style="width:12px; height:12px; color:#10b981"></i>' : '<i data-lucide="alert-circle" style="width:12px; height:12px; color:#f59e0b"></i>'}
          </div>
        `;
            }
        });
        if (!sectionsNormalHtml) sectionsNormalHtml = '<span style="color:#cbd5e1">-</span>';
        if (!sectionsSpecialHtml) sectionsSpecialHtml = '<span style="color:#cbd5e1">-</span>';
        const isEmpty = sectionsNormalHtml === '<span style="color:#cbd5e1">-</span>' && sectionsSpecialHtml === '<span style="color:#cbd5e1">-</span>';
        // Filter by target status
        if (selectedStatus === 'met') {
            if (isEmpty || !overallMet) return;
        } else if (selectedStatus === 'incomplete') {
            if (isEmpty || overallMet) return;
        } else if (selectedStatus === 'none') {
            if (!isEmpty) return;
        }
        // Accumulate totals for rendered rows
        sectionsToRender.forEach((sec)=>{
            const key = `${role}_${sec}`;
            const roleTargets = targets[key] || {
                normal: 0,
                special: 0
            };
            const normalCount = data.normalShifts[sec]?.length || 0;
            const specialCount = data.specialShifts[sec]?.length || 0;
            totalNormalTarget += roleTargets.normal;
            totalNormalActual += normalCount;
            totalSpecialTarget += roleTargets.special;
            totalSpecialActual += specialCount;
        });
        const statusBadge = isEmpty ? `<span style="color:#cbd5e1">-</span>` : overallMet ? `<span style="background:#dcfce7; color:#15803d; padding:4px 12px; border-radius:99px; font-weight:700; font-size:0.7rem; display:inline-flex; align-items:center; gap:4px;"><i data-lucide="check" style="width:12px; height:12px"></i> Met Target</span>` : `<span style="background:#fff3cd; color:#b45309; padding:4px 12px; border-radius:99px; font-weight:700; font-size:0.7rem; display:inline-flex; align-items:center; gap:4px;"><i data-lucide="alert-circle" style="width:12px; height:12px"></i> Incomplete</span>`;
        const avatarText = emp.nickname && emp.nickname !== '-' ? emp.nickname : emp.name.trim().split(/\s+/)[0];
        const avatarFs = avatarText.length > 5 ? '0.52rem' : avatarText.length === 5 ? '0.6rem' : avatarText.length === 4 ? '0.68rem' : '0.78rem';
        const teamCol = typeof window.getTeamColor === 'function' ? window.getTeamColor(emp.dept || '') : '#6366f1';
        const avatarHtml = `
      <div style="width:36px; height:36px; border-radius:50%; background:${teamCol}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:${avatarFs}; box-shadow:0 2px 6px rgba(0,0,0,0.08); flex-shrink:0; text-align:center; white-space:nowrap; word-break:keep-all; line-height:1;">
        ${avatarText}
      </div>
    `;
        const getPosStyle = (pos)=>{
            const p = (pos || '').toLowerCase();
            if (p.includes('director') || p.includes('manager')) return {
                bg: 'rgba(139,92,246,0.1)',
                text: '#6d28d9'
            };
            if (p.includes('senior')) return {
                bg: 'rgba(59,130,246,0.1)',
                text: '#1d4ed8'
            };
            if (p.includes('junior')) return {
                bg: 'rgba(16,185,129,0.1)',
                text: '#047857'
            };
            return {
                bg: '#f1f5f9',
                text: '#475569'
            };
        };
        const posStyle = getPosStyle(emp.pos);
        rowsHtml += `
      <tr style="background:#fff">
        <td style="padding:14px 20px; border-bottom:1px solid #e2e8f0; vertical-align:middle;">
          <div style="display:flex; align-items:center; gap:12px;">
            ${avatarHtml}
            <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
              <div style="font-weight:700; color:#1e293b; font-size:.85rem; line-height:1.2;">
                ${emp.name}
              </div>
              <div style="margin-top:2px;">
                <span style="background:${posStyle.bg}; color:${posStyle.text}; padding:2px 10px; border-radius:99px; font-size:0.6rem; font-weight:700; border:none; display:inline-block; font-family:'Kanit', sans-serif; text-transform:uppercase; letter-spacing:0.04em;">${emp.pos || 'Other'}</span>
              </div>
            </div>
          </div>
        </td>
        <td style="padding:14px 20px; border-bottom:1px solid #e2e8f0; text-align:center;">
          ${sectionsNormalHtml}
        </td>
        <td style="padding:14px 20px; border-bottom:1px solid #e2e8f0; text-align:center;">
          ${sectionsSpecialHtml}
        </td>
        <td style="padding:14px 20px; border-bottom:1px solid #e2e8f0; text-align:center;">
          ${statusBadge}
        </td>
      </tr>
    `;
    });
    return `
    <div style="font-family:'Kanit', sans-serif; display: flex; flex-direction: column; height: 100%;">
      <!-- TOP NAVIGATION BAR -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-shrink: 0;">
          <div style="display:flex; align-items:center; gap:16px;">
            <button onclick="window.navigate('public-holiday')" class="btn" style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:10px;font-size:.75rem;font-weight:700;background:#ffffff;color:#635bff;border:1px solid #635bff;cursor:pointer;transition:all 0.2s;height:34px;box-shadow:0 1px 2px rgba(15,23,42,0.04);" onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background='#ffffff'">
              <i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back to Public Holiday
            </button>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <select id="filterHolidayStatus" class="select-input" style="width:140px; height:34px; border-radius:99px; font-size:0.75rem; border:1px solid #cbd5e1; outline:none;" onchange="window.changeHolidaySummaryFilter('status', this.value)">
              <option value="all" ${selectedStatus === 'all' ? 'selected' : ''}>All Status</option>
              <option value="met" ${selectedStatus === 'met' ? 'selected' : ''}>Met Target</option>
              <option value="incomplete" ${selectedStatus === 'incomplete' ? 'selected' : ''}>Incomplete</option>
              <option value="none" ${selectedStatus === 'none' ? 'selected' : ''}>No Target / Shift</option>
            </select>
            
            <select id="filterHolidayPosition" class="select-input" style="width:160px; height:34px; border-radius:99px; font-size:0.75rem; border:1px solid #cbd5e1; outline:none;" onchange="window.changeHolidaySummaryFilter('position', this.value)">
              <option value="" ${selectedPos === '' ? 'selected' : ''}>All Positions</option>
              ${allPositions.map((p)=>`<option value="${p}" ${selectedPos === p ? 'selected' : ''}>${p}</option>`).join('')}
            </select>

            ${selectedStatus !== 'all' || selectedPos !== '' ? `
              <button onclick="window.clearHolidaySummaryFilters()" style="background:none; border:none; color:#ef4444; font-family:Kanit; font-size:.75rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; padding:0 12px; height:34px; white-space:nowrap;">✕ Clear</button>
            ` : ''}

            <button onclick="window.openHolidayTargetsModal()" class="btn" style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:10px;font-size:.75rem;font-weight:700;background:#635bff;color:#fff;border:1px solid transparent;cursor:pointer;box-shadow:0 2px 8px rgba(99,91,255,0.3);transition:all 0.2s;" onmouseover="this.style.background='#4f46e5'" onmouseout="this.style.background='#635bff'">
              <i data-lucide="settings" style="width:14px;height:14px"></i> Set Targets
            </button>
          </div>
        </div>

      <!-- KPI CARDS -->
      <div style="display: flex; gap: 16px; margin-bottom: 24px; flex-shrink: 0;">
        <!-- Card 1: Regular Days -->
        <div class="stat-card" style="flex: 1; padding: 16px; display: flex; align-items: center; gap: 12px; flex-direction: row;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="calendar" style="width: 20px; height: 20px;"></i>
          </div>
          <div>
            <div style="font-size: 0.65rem; color: var(--text-3); font-weight: 600; margin-bottom: 2px;">Regular Days (วันธรรมดา)</div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font-size: 1.3rem; font-weight: 700; color: var(--text);">${totalNormalActual}</span>
              <span style="font-size: 0.75rem; color: var(--text-3); font-weight: 500;">/ Target: ${totalNormalTarget}</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Special Days -->
        <div class="stat-card" style="flex: 1; padding: 16px; display: flex; align-items: center; gap: 12px; flex-direction: row;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: #fdf2f8; color: #db2777; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="sparkles" style="width: 20px; height: 20px;"></i>
          </div>
          <div>
            <div style="font-size: 0.65rem; color: var(--text-3); font-weight: 600; margin-bottom: 2px;">Special Days (วันพิเศษ)</div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font-size: 1.3rem; font-weight: 700; color: var(--text);">${totalSpecialActual}</span>
              <span style="font-size: 0.75rem; color: var(--text-3); font-weight: 500;">/ Target: ${totalSpecialTarget}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SUMMARY TABLE WITH WORKABLE SCROLL -->
      <div class="table-wrap" style="background:#fff; border-radius:16px; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.01); overflow-y:auto; flex: 1; max-height: calc(100vh - 270px);">
        <table class="data-table" style="width:100%; border-collapse:collapse;">
          <thead style="position: sticky; top: 0; z-index: 10; background: #f8fafc; box-shadow: 0 1px 0 #e2e8f0;">
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
              <th style="padding:14px 20px; text-align:left; font-weight:700; font-size:.8rem; color:#475569">Employee / Position</th>
              <th style="padding:14px 20px; text-align:center; font-weight:700; font-size:.8rem; color:#475569">Regular Days</th>
              <th style="padding:14px 20px; text-align:center; font-weight:700; font-size:.8rem; color:#475569">Special Days</th>
              <th style="padding:14px 20px; text-align:center; font-weight:700; font-size:.8rem; color:#475569">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="4" style="text-align:center; padding:40px; color:#94a3b8">No employees found</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
};


