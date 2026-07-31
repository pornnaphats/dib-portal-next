"use client";

import { useEffect, useRef } from "react";
import * as lucide from "lucide";
import "flatpickr/dist/flatpickr.min.css";

// Static imports for core legacy logic
import "./legacyGlobalHelpers.js";
import "./legacyHolidayLogic.js";

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
            <button type="button" onclick="closeAddHolidayModal()" style="height: 32px; padding: 0 16px; border-radius: 99px; border: 1px solid #eef0f6; background: #f4f4fb; color: #4b5675; font-weight: 500; cursor: pointer; font-size: 0.75rem; display: inline-flex; align-items: center; justify-content: center;">
              ยกเลิก
            </button>
            <button type="submit" id="btnSubmitBatchHoliday" style="height: 32px; padding: 0 16px; border-radius: 99px; border: none; background: #635bff; color: white; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.75rem; box-shadow: 0 2px 8px rgba(99, 91, 255, 0.2);">
              <i data-lucide="save" style="width: 14px; height: 14px;"></i>
              <span>บันทึก</span>
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
    window.lucide.createIcons({ root: document.getElementById("addHolidayModal") });
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

  const lines = batchText.split('\n').filter(line => line.trim() !== "");
  if (lines.length === 0) {
    if (window.showAlert) {
      window.showAlert("แจ้งเตือน", "กรุณากรอกข้อมูลวันหยุดอย่างน้อย 1 รายการ", "warning");
    } else {
      alert("กรุณากรอกข้อมูลวันหยุดอย่างน้อย 1 รายการ");
    }
    return;
  }

  const payloadList = [];
  for (let i = 0; i < lines.length; i++) {
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
  if (window.lucide) window.lucide.createIcons({ root: btnSubmit });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
      import("./legacyDataFetcher.js").then(mod => {
        if (mod?.fetchAndSetLegacyData) {
          mod.fetchAndSetLegacyData().then(() => {
            if (typeof window.navigate === 'function') window.navigate('public-holiday');
            else window.location.reload();
          });
        } else {
          window.location.reload();
        }
      }).catch(() => window.location.reload());

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
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `<i data-lucide="save" style="width: 18px; height: 18px;"></i><span>บันทึก</span>`;
    if (window.lucide) window.lucide.createIcons({ root: btnSubmit });
  }
};

window.deletePublicHoliday = async function(id, holidayName) {
  const performDelete = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      let deletedName = null, deletedDate = null;
      try {
        const infoRes = await fetch(`${supabaseUrl}/rest/v1/public_holidays?id=eq.${id}&select=name,date`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
        });
        if (infoRes.ok) {
          const info = await infoRes.json();
          if (info && info[0]) { deletedName = info[0].name; deletedDate = info[0].date; }
        }
      } catch(e) {}

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
            localShifts = localShifts.filter(ls => {
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
        } catch(e) {}

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

  window.showConfirmDelete(
    "ยืนยันการลบ",
    "คุณต้องการลบวันหยุดนี้ใช่หรือไม่?",
    performDelete
  );
};

// ==========================================
// 🟡 2. REACT COMPONENT WRAPPER
// ==========================================

export default function HolidayView() {
  const containerRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    document.body.dataset.page = "public-holiday";

    if (!window.DATA) {
      window.DATA = { employees: [], scheduleTasks: [], public_holidays: [] };
    }
    if (!window.WS_DATA) {
      window.WS_DATA = { members: [], tasks: [], accounts: [] };
    }
    
    window.lucide = {
      ...lucide,
      createIcons: (params) => (params && params.root === null) ? null : lucide.createIcons({ icons: lucide.icons, ...params })
    };

    window.navigate = (page) => {
      if (page === 'public-holiday' && containerRef.current) {
        containerRef.current.innerHTML = window.pagePublicHoliday();
        window.lucide.createIcons();
      }
    };

    if (containerRef.current && typeof window.pagePublicHoliday === "function") {
      containerRef.current.innerHTML = window.pagePublicHoliday();
      window.lucide.createIcons();
    }

    requestIdleCallback(() => {
      Promise.all([
        import("chart.js/auto"),
        import("flatpickr")
      ]).then(([chartModule, flatpickrModule]) => {
        window.Chart = chartModule.default;
        window.flatpickr = flatpickrModule.default;
      });

      import("./legacyDataFetcher.js").then(mod => {
        if (mod?.fetchAndSetLegacyData) {
          mod.fetchAndSetLegacyData().then(() => {
            if (containerRef.current && typeof window.pagePublicHoliday === "function") {
              containerRef.current.innerHTML = window.pagePublicHoliday();
              window.lucide.createIcons();
            }
          }).catch(() => {});
        }
      }).catch(() => {});
    }, { timeout: 100 });

  }, []);

  return (
    <div className="w-full h-full bg-transparent overflow-y-auto" style={{ padding: '20px' }}>
      <div id="pageContent" ref={containerRef} className="w-full" data-page="public-holiday"></div>
    </div>
  );
}

// ==========================================
// 🔵 3. CORE LEGACY LOGIC & PAGE RENDER
// ==========================================

if (typeof window.getTasksFromScope !== 'function') {
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
          hours: item.progress || 0,
          color: typeof window.colorForProject === 'function' ? window.colorForProject(acc.account) : '#6366f1'
        });
      });
    });
    return tasks;
  };
}

window.pagePublicHoliday = function() {
  window.currentPage = 'public-holiday';

  let localShifts = [];
  try {
    localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
  } catch (e) { }

  const sheetHolidays = window.HOLIDAY_LIST || window.DATA?.public_holidays || [];
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
    localShifts = localShifts.filter(ls => 
      sheetHolidays.some(sh => sh.date === ls.date || sh.name === ls.name)
    );
    localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));

    sheetHolidays.forEach(sh => {
      const matched = localShifts.find(ls => ls.date === sh.date || ls.name === sh.name);
      const t = matched ? (matched.tasks || []) : [];
      holidays.push({
        id: sh.id || null,
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

  const yearsSet = new Set();
  holidays.forEach(h => {
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
  const uniqueYears = Array.from(yearsSet).sort((a,b) => b.localeCompare(a));
  const yearOptions = uniqueYears.map(y => `<option value="${y}">ปี ${y}</option>`).join('');

  window.changeHolidayPage = function(p) {
    window.holidayCurrentPage = p;
    if (typeof window.navigate === 'function') {
      window.navigate('public-holiday');
    }
  };

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
    <div class="search-box" style="width: 200px; background: #fff; height: 34px; display: flex; align-items: center; position: relative; border: 1px solid #e4e8ef; border-radius: 99px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04)">
      <i data-lucide="search" style="width: 14px; height: 14px; position: absolute; left: 14px; color: var(--text-3)"></i>
      <input type="text" id="holidaySearch" placeholder="Search..." style="padding: 0 14px 0 32px; height: 100%; width: 100%; border: none; outline: none; background: transparent; font-size: 0.8rem" onkeyup="filterTable('holidayTable', 'holidaySearch')">
    </div>
  `;

  // Set up pagination
  if (typeof window.holidayCurrentPage === 'undefined') window.holidayCurrentPage = 1;
  window.holidayPageSize = 10;
  
  const totalFiltered = holidays.length;
  const totalPages = Math.ceil(totalFiltered / window.holidayPageSize);
  
  if (window.holidayCurrentPage > totalPages && totalPages > 0) {
    window.holidayCurrentPage = totalPages;
  }
  if (window.holidayCurrentPage < 1) window.holidayCurrentPage = 1;
  
  const startIndex = (window.holidayCurrentPage - 1) * window.holidayPageSize;
  const paginatedHolidays = holidays.slice(startIndex, startIndex + window.holidayPageSize);

  const pageStart = totalFiltered > 0 ? startIndex + 1 : 0;
  const pageEnd = Math.min(window.holidayCurrentPage * window.holidayPageSize, totalFiltered);

  let paginationButtonsHtml = `
    <button onclick="changeHolidayPage(${window.holidayCurrentPage - 1})" 
      class="rounded-full border border-slate-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
      style="height: 28px; padding: 0 12px; display: inline-flex; align-items: center; justify-content: center; cursor: ${window.holidayCurrentPage === 1 ? 'not-allowed' : 'pointer'}"
      ${window.holidayCurrentPage === 1 ? 'disabled' : ''}>
      Previous
    </button>
  `;

  const maxVisible = 5;
  let startPage = Math.max(1, window.holidayCurrentPage - 1);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

  if (startPage > 1) {
    paginationButtonsHtml += `
      <button onclick="changeHolidayPage(1)" 
        class="rounded-full text-[11px] font-medium text-gray-500 hover:text-[#635BFF] transition-all" 
        style="width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: none; background-color: transparent;">
        1
      </button>
    `;
    if (startPage > 2) {
      paginationButtonsHtml += `<span class="text-gray-400 text-[10px] px-0.5" style="font-size: 10px; color: #94a3b8; padding: 0 2px;">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const active = i === window.holidayCurrentPage;
    paginationButtonsHtml += `
      <button onclick="changeHolidayPage(${i})" 
        class="rounded-full text-[11px] transition-all" 
        style="width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: none; border-radius: 50%; background-color: ${active ? '#635BFF' : 'transparent'}; color: ${active ? '#ffffff' : '#64748b'}; font-weight: ${active ? '600' : '500'};">
        ${i}
      </button>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationButtonsHtml += `<span class="text-gray-400 text-[10px] px-0.5" style="font-size: 10px; color: #94a3b8; padding: 0 2px;">...</span>`;
    }
    paginationButtonsHtml += `
      <button onclick="changeHolidayPage(${totalPages})" 
        class="rounded-full text-[11px] font-medium text-gray-500 hover:text-[#635BFF] transition-all" 
        style="width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: none; background-color: transparent;">
        ${totalPages}
      </button>
    `;
  }

  paginationButtonsHtml += `
    <button onclick="changeHolidayPage(${window.holidayCurrentPage + 1})" 
      class="rounded-full border border-slate-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
      style="height: 28px; padding: 0 12px; display: inline-flex; align-items: center; justify-content: center; cursor: ${window.holidayCurrentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer'}"
      ${window.holidayCurrentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>
      Next
    </button>
  `;

  let tableBodyHtml = '';
  if (holidays.length === 0) {
    tableBodyHtml = `
      <tr>
        <td colspan="7" style="padding: 32px; text-align: center; color: #94a3b8; font-size: .85rem; font-style: italic">
          ไม่มีข้อมูลวันหยุดนักขัตฤกษ์
        </td>
      </tr>
    `;
  } else {
    let rows = [];
    paginatedHolidays.forEach((h, groupIdx) => {
      const tasks = (h.tasks && h.tasks.length > 0) ? h.tasks : [{ dept: '-', person: '-', time: '-', isEmptyRow: true }];
      tasks.forEach((t, idx) => {
        let rowHtml = '';
        
        // 🟢 เพิ่ม border-bottom ให้แถวทุกแถวเพื่อไม่ให้เส้นคั่นหาย
        rowHtml += `<tr class="holiday-group-${groupIdx}" style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s" onmouseover="document.querySelectorAll('.holiday-group-${groupIdx}').forEach(tr => { tr.style.background='#f1f5f9'; tr.querySelectorAll('td[rowspan]').forEach(td => td.style.background='#f1f5f9'); })" onmouseout="document.querySelectorAll('.holiday-group-${groupIdx}').forEach(tr => { tr.style.background='none'; tr.querySelectorAll('td[rowspan]').forEach(td => td.style.background='#fff'); })">`;
        
        if (idx === 0) {
          rowHtml += `
            <td rowspan="${tasks.length}" style="padding: 16px 24px; font-size: .85rem; color: #1e293b; font-weight: 500; border-bottom: 1px solid #e2e8f0; vertical-align: top; position: sticky; top: 50px; background: var(--surface); z-index: 2; transition: background 0.2s;">${h.date}</td>
            <td rowspan="${tasks.length}" style="padding: 16px 24px; font-size: .85rem; color: #4f46e5; font-weight: 600; width: 200px; max-width: 200px; white-space: normal; line-height: 1.5; border-bottom: 1px solid #e2e8f0; vertical-align: top; position: sticky; top: 50px; background: var(--surface); z-index: 2; transition: background 0.2s;">${h.name}</td>
          `;
        }
        
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
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 8px; box-shadow: var(--shadow); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px -4px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 10px -2px rgba(0,0,0,0.03)'">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 10px; margin-bottom: 12px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <div style="width:28px; height:28px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #818cf8); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem; font-family:'Inter', sans-serif; box-shadow: var(--shadow);">
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
        
        // 🟢 กำหนด border-bottom: 1px solid #e2e8f0 ให้กับทุกช่องเสมอ
        rowHtml += `<td style="padding: 16px 24px; font-size: .8rem; color: #1e293b; font-weight: 600; vertical-align: top; border-bottom: 1px solid #e2e8f0;">${taskHtml}</td>`;
        
        let employeeHtml = '';
        if (t.person !== '-') {
          const emp = (window.DATA.employees || []).find(e => e.name === t.person || e.nameEn === t.person || e.nickname === t.person);
          const teamName = emp ? emp.dept : '';
          const tCol = typeof getTeamColor === 'function' ? getTeamColor(teamName) : '#64748b';
          const posBg = typeof getPosBgColor === 'function' ? getPosBgColor(emp ? emp.pos : '') : '#f1f5f9';
          const posText = typeof getPosTextColor === 'function' ? getPosTextColor(emp ? emp.pos : '') : '#475569';
          
          const line1 = window.getEmployeeDisplayName(emp || t.person);

          const avatarText = (emp && emp.nickname && emp.nickname !== '-') ? emp.nickname : t.person.trim().split(/\s+/)[0];
          const holidayAvatarFontSize = avatarText.length > 5 ? '0.5rem' : (avatarText.length === 5 ? '0.58rem' : (avatarText.length === 4 ? '0.68rem' : '0.78rem'));

          employeeHtml = `
            <div style="display: flex; align-items: center; gap: 12px">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: ${tCol}; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: ${holidayAvatarFontSize}; box-shadow: var(--shadow); flex-shrink: 0; text-align: center; padding: 2px; overflow: hidden; white-space: nowrap; word-break: keep-all">
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
        
        rowHtml += `<td style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0;">${employeeHtml}</td>`;
        
        let timeHtml = '';
        if (t.time !== '-') {
          timeHtml = `
            <div style="font-size: .8rem; font-weight: 600; color: #1e293b">${t.time}</div>
            <div style="font-size: .7rem; color: #94a3b8">(8 ชม.)</div>
          `;
        } else {
          timeHtml = `<span style="color: #94a3b8">-</span>`;
        }
        
        rowHtml += `<td style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0;">${timeHtml}</td>`;
        
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
              <span style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 99px; background: #ffedd5; color: #f59e0b; border: 1px solid #fed7aa; font-size: .72rem; font-weight: 700; white-space: nowrap;">
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
            <td rowspan="${tasks.length}" style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; vertical-align: top; position: sticky; top: 50px; background: var(--surface); z-index: 2; transition: background 0.2s;">
              ${statusHtml}
            </td>
            <td rowspan="${tasks.length}" style="padding: 16px 24px; text-align: center; border-bottom: 1px solid #e2e8f0; vertical-align: top; position: sticky; top: 50px; background: var(--surface); z-index: 2; transition: background 0.2s;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                <button class="btn-icon" onclick="toggleHolidayDropdown(event, ${groupIdx}, '${h.name.replace(/'/g, "\\'")}', '${h.date}', '${h.id || ''}')" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;">
                  <i data-lucide="more-horizontal" style="width: 18px; height: 18px"></i>
                </button>
              </div>
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
    <!-- HEADER ACTION BAR -->
    <div style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:24px; gap:8px">
      <div style="height:38px; display:flex; align-items:center">
        ${typeof renderDateFilter === 'function' ? renderDateFilter("navigate('public-holiday')", 'auto', null, true, searchHtml) : ''}
      </div>
      
      <div style="width: 1px; height: 18px; background: #e4e8ef; margin: 0 4px; flex-shrink: 0;"></div>

      <button onclick="openAddHolidayModal()" class="btn" style="display:flex; align-items:center; gap:6px; padding:6px 14px; border-radius:10px; font-size:.75rem; font-weight:700; flex-shrink:0; background:#635bff; color:#fff; border:1px solid transparent; cursor:pointer; box-shadow: 0 2px 8px rgba(99, 91, 255, 0.3); transition: background 0.2s;" onmouseover="this.style.background='#4f46e5'" onmouseout="this.style.background='#635bff'">
        <i data-lucide="plus" style="width:14px; height:14px"></i> เพิ่มวันหยุด
      </button>

      <button onclick="window.openManageTemplatesModal()" class="btn" style="display:flex; align-items:center; gap:6px; padding:6px 14px; border-radius:10px; font-size:.75rem; font-weight:700; flex-shrink:0; background:#ffffff; color:#635bff; border:1px solid #635bff; cursor:pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(99, 91, 255, 0.08);" onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background='#ffffff'">
        <i data-lucide="settings" style="width:14px; height:14px"></i> จัดการชุดงาน (Templates)
      </button>
    </div>

    <!-- STATS CARDS -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px">
      <div class="stat-card fade-in" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: #6366f1; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4)">
          <i data-lucide="calendar" style="width: 20px; height: 20px"></i>
        </div>
        <div>
          <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">วันหยุดทั้งหมด</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
            ${stats.total} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
          </div>
          <div style="font-size: .65rem; color: #6366f1; font-weight: 600; margin-top: 4px">ข้อมูลทั้งหมด</div>
        </div>
      </div>
      <div class="stat-card fade-in delay-1" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: #10b981; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4)">
          <i data-lucide="check-circle" style="width: 20px; height: 20px"></i>
        </div>
        <div>
          <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">วันหยุดเสร็จสิ้นแล้ว</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
            ${stats.finished} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
          </div>
          <div style="font-size: .65rem; color: #10b981; font-weight: 600; margin-top: 4px">${finishedPct}% ของทั้งหมด</div>
        </div>
      </div>
      <div class="stat-card fade-in delay-2" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: #f59e0b; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4)">
          <i data-lucide="clock" style="width: 20px; height: 20px"></i>
        </div>
        <div>
          <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">วันหยุดกำลังจะถึง</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
            ${stats.upcoming} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
          </div>
          <div style="font-size: .65rem; color: #f59e0b; font-weight: 600; margin-top: 4px">${upcomingPct}% ของทั้งหมด</div>
        </div>
      </div>
      <div class="stat-card fade-in delay-3" style="padding: 14px 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: #818cf8; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(129, 140, 248, 0.4)">
          <i data-lucide="calendar-plus" style="width: 20px; height: 20px"></i>
        </div>
        <div>
          <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">ยังไม่ได้จัดแผน</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
            ${stats.not_scheduled} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">วัน</span>
          </div>
          <div style="font-size: .65rem; color: #818cf8; font-weight: 600; margin-top: 4px">${notScheduledPct}% ของทั้งหมด</div>
        </div>
      </div>
    </div>

    <!-- TABLE CARD -->
    <div class="card" style="padding: 0; border-radius: 20px; overflow: hidden; border: none; box-shadow: 0 8px 30px rgba(0,0,0,0.03)">
      <div style="padding: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center">
        <h3 style="font-size: 1.1rem; font-weight: 700; color: #1e293b">รายการวันหยุดนักขัตฤกษ์</h3>
      </div>
      <div style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 260px);">
        <table id="holidayTable" style="width: 100%; border-collapse: collapse; text-align: left">
          <thead style="background: #f8fafc;">
            <tr>
              <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">วันที่</th>
              <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">วันหยุด</th>
              <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">แผนงาน</th>
              <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">ผู้ปฏิบัติงาน</th>
              <th style="padding: 16px 24px; font-size: .75rem; font-weight: 600; color: #64748b; position: sticky; top: 0; background: #f8fafc; z-index: 10; border-bottom: 1px solid var(--border);">เวลาปฏิบัติงาน</th>
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
      <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/10 shrink-0" style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); background-color: rgba(248, 250, 252, 0.1);">
        <div id="holidayTableInfo" class="text-[11px] text-gray-500 font-medium" style="font-size: 11px; color: #64748b; font-weight: 500;">
          Showing ${pageStart} to ${pageEnd} of ${totalFiltered} entries
        </div>
        <div id="holidayPagination" class="flex items-center gap-1" style="display: flex; align-items: center; gap: 4px;">
          ${paginationButtonsHtml}
        </div>
      </div>
  `;
}

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
        จัดการวันหยุด
      </button>

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
  if (window.lucide) window.lucide.createIcons({ root: document.getElementById('holiday-action-dropdown') });

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
  if (window.lucide) window.lucide.createIcons({ root: document.getElementById(modalId) });

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
    `คุณต้องการลบงานทั้งหมดของวันหยุด "${holidayName}" ใช่หรือไม่?`,
    function() {
      let localShifts = [];
      try {
        localShifts = JSON.parse(localStorage.getItem('holiday_shifts') || '[]');
      } catch (e) {}

      const matched = localShifts.find(ls => ls.name === holidayName && ls.date === holidayDate);
      if (matched && matched.tasks) {
        matched.tasks.forEach(t => {
          if (t.id && typeof window.apiSaveHolidayShift === 'function') {
            window.apiSaveHolidayShift({ action: 'delete', id: t.id });
          }
        });
      }

      localShifts = localShifts.filter(ls => !(ls.name === holidayName && ls.date === holidayDate));
      localStorage.setItem('holiday_shifts', JSON.stringify(localShifts));

      if (window.showToast) window.showToast('ลบรายการงานวันหยุดทั้งหมดเรียบร้อยแล้ว', 'success');
      else if (window.showAlert) window.showAlert('สำเร็จ', 'ลบรายการงานวันหยุดทั้งหมดเรียบร้อยแล้ว', 'success');

      window.HOLIDAY_LIST = null;
      window.HOLIDAY_TEMPLATES = null;
      if (window.DATA) window.DATA.public_holidays = null;
      import("./legacyDataFetcher.js").then(mod => {
        if (mod?.fetchAndSetLegacyData) {
          mod.fetchAndSetLegacyData().then(() => {
            if (typeof window.navigate === 'function') window.navigate('public-holiday');
            else window.location.reload();
          });
        } else {
          window.location.reload();
        }
      }).catch(() => window.location.reload());
    }
  );
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
          <button onclick="window.applyTemplateToHolidayClick('${holidayName.replace(/'/g, "\\'")}', '${holidayDate}')" class="btn" style="background: var(--primary); color: #fff; border: none; padding: 0 14px; border-radius: 99px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 34px; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);">
            <i data-lucide="import" style="width: 14px; height: 14px;"></i> ดึงชุดงาน
          </button>
        </div>
        ` : ''}
      </div>
    </div>
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes dropdownFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    </style>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  if (window.lucide) window.lucide.createIcons({ root: document.getElementById(modalId) });
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
        
        if (taskId && typeof window.apiSaveHolidayShift === 'function') {
          window.apiSaveHolidayShift({ action: 'delete', id: taskId });
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
        import("./legacyDataFetcher.js").then(mod => {
          if (mod?.fetchAndSetLegacyData) {
            mod.fetchAndSetLegacyData().then(() => {
              if (typeof window.navigate === 'function') window.navigate('public-holiday');
              else window.location.reload();
            });
          } else {
            window.location.reload();
          }
        }).catch(() => window.location.reload());
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

  const sheetHolidays = window.HOLIDAY_LIST || (window.DATA && window.DATA.public_holidays) || [];
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

  const employees = (window.DATA && window.DATA.employees) || [];
  const employeeOptions = employees.map(emp => `
    <option value="${emp.name}">${emp.name} (${emp.nickname || emp.pos})</option>
  `).join('');

  const scopeTasks = typeof window.getTasksFromScope === 'function' ? window.getTasksFromScope() : [];
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
            ${employees.map(emp => `
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
          <button type="button" onclick="document.getElementById('${modalId}').remove()" class="btn" style="background:#f1f5f9; color:#475569; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:500; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">ยกเลิก</button>
          <button type="submit" class="btn btn-primary" style="background:var(--primary); color:#fff; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:600; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">${isEditMode ? 'บันทึกการแก้ไข' : 'ถัดไป: เลือกวันหยุด ➔'}</button>
        </div>
      </form>
    </div>
  </div>
  <style>
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  </style>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  if (window.lucide) window.lucide.createIcons({ root: document.getElementById(modalId) });
  
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
  if (window.lucide) window.lucide.createIcons({ root: clone });
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

  const scopeTasks = typeof window.getTasksFromScope === 'function' ? window.getTasksFromScope() : [];
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
    if (typeof TomSelect !== 'undefined') {
      new TomSelect(jobSelect, { create: false, sortField: {field: "text", direction: "asc"} });
    }
    return;
  }

  const scopeTasks = typeof window.getTasksFromScope === 'function' ? window.getTasksFromScope() : [];
  const jobs = scopeTasks.filter(t => t.acc === selectedProj).map(t => t.title);
  const uniqueJobs = [...new Set(jobs)].sort();

  uniqueJobs.forEach(job => {
    const opt = document.createElement('option');
    opt.value = job;
    opt.textContent = job;
    jobSelect.appendChild(opt);
  });
  
  if (typeof TomSelect !== 'undefined') {
    new TomSelect(jobSelect, { create: false, sortField: {field: "text", direction: "asc"} });
  }
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

  if (typeof window.apiSaveHolidayShift === 'function') {
    window.apiSaveHolidayShift({
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
        <button onclick="document.getElementById('${modalId}').remove()" style="background:#f1f5f9; color:#64748b; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:500; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">ยกเลิก</button>
        <button onclick="window.submitHolidayTaskBatch()" style="background:var(--primary); color:#fff; border:none; height:32px; padding:0 16px; border-radius:99px; font-weight:600; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">บันทึก</button>
      </div>
    </div>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
  if (window.lucide) window.lucide.createIcons({ root: document.getElementById(modalId) });
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