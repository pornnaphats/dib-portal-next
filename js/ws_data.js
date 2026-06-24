// ===== WORKSHIP DATA =====

// Node mapping: Sheet category → display node
const SHEET_NODE_MAP = {
  'AI':              'AI',
  'CALL CENTER':     'Call Center',
  'Media I Content': 'Content',
  'Media I Graphic': 'Graphic',
  'Content':         'Content',
  'Graphic':         'Graphic',
  'Media':           'Content', // Default Media to Content if not specified
  'Meeting':         'Meeting',
  'Coordinator':     'Coordinator',
  'Internal':        'Internal',
  'Adhoc':           'Adhoc',
  'Other':           'Other',
  'HR':              'Other',
  'Production':      'Production',
  'Report':          'Report',
};

function mapCategoryToNode(category) {
  if (!category) return 'Monitor';
  const catLower = category.toLowerCase();
  
  // 1. Direct Map Check
  const key = Object.keys(SHEET_NODE_MAP).find(k => catLower.includes(k.toLowerCase()));
  if (key) return SHEET_NODE_MAP[key];
  
  // 2. Keyword Fallback
  if (/Meeting/i.test(catLower)) return 'Meeting';
  if (/Coordinator/i.test(catLower)) return 'Coordinator';
  if (/Internal/i.test(catLower)) return 'Internal';
  if (/Adhoc/i.test(catLower)) return 'Adhoc';
  if (/Content/i.test(catLower)) return 'Content';
  if (/Graphic/i.test(catLower)) return 'Graphic';
  if (/Production/i.test(catLower)) return 'Production';
  if (/Report/i.test(catLower)) return 'Report';
  if (/Media/i.test(catLower)) return 'Content';
  if (/AI/i.test(catLower)) return 'AI';
  if (/CC|Call/i.test(catLower)) return 'Call Center';

  return 'Monitor';
}

// WS_DATA — Initialized empty, will be populated from Google Sheets
var WS_DATA = {
  members: [],
  accounts: [],
  tasks: [],
};

var COST_DATA = {
  summary: { staff: 0, software: 0, others: 0, total: 0 },
  projects: [],
  comparison: [], // Added for Real vs Forecast
};

// ===== GOOGLE SHEETS INTEGRATION =====
const SHEET_URL_MASTER = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9v1kwv03ySD8s7-2BD7zXdThQ0YAASWB9AvemCy_pfznL2OTejmKjdktqiU5r4oJ7hGQjvzK0-aFs/pub?gid=0&single=true&output=csv';
const SHEET_URL_POSITION = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9v1kwv03ySD8s7-2BD7zXdThQ0YAASWB9AvemCy_pfznL2OTejmKjdktqiU5r4oJ7hGQjvzK0-aFs/pub?gid=945161006&single=true&output=csv';
const SHEET_URL_COST = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTsBza0mGYxy3v2HiqRkQMcbjTsenAAX794-1Q0r81wuaQPOI5ncc4VBUcV5mQ2lUMDE83R3BcEKA1E/pub?output=csv';
const SHEET_URL_EMPLOYEE = 'https://docs.google.com/spreadsheets/d/1a5nLyclYZwFUlauF4lXNwv9X2i_6xQQSFJCnOXuyJVE/export?format=csv&gid=0';
const SHEET_URL_LEAVE = 'https://docs.google.com/spreadsheets/d/1a5nLyclYZwFUlauF4lXNwv9X2i_6xQQSFJCnOXuyJVE/export?format=csv&gid=1919444706';
const SHEET_URL_HOLIDAY = 'https://docs.google.com/spreadsheets/d/1a5nLyclYZwFUlauF4lXNwv9X2i_6xQQSFJCnOXuyJVE/export?format=csv&gid=1862767690';
const SHEET_URL_HOLIDAY_SHIFTS = 'https://docs.google.com/spreadsheets/d/1NR-PaUK3q7LsMYNrGhmZZE80PJ6i4UXgYc7mBX6LMJ4/export?format=csv&gid=834860902';
const SHEET_URL_HOLIDAY_TEMPLATES = 'https://docs.google.com/spreadsheets/d/1NR-PaUK3q7LsMYNrGhmZZE80PJ6i4UXgYc7mBX6LMJ4/export?format=csv&gid=56666325';
const SHEET_URL_SCOPE = 'https://docs.google.com/spreadsheets/d/1NR-PaUK3q7LsMYNrGhmZZE80PJ6i4UXgYc7mBX6LMJ4/export?format=csv&gid=0';
const SHEET_URL_PROJECT_NODES = 'https://docs.google.com/spreadsheets/d/1NR-PaUK3q7LsMYNrGhmZZE80PJ6i4UXgYc7mBX6LMJ4/export?format=csv&gid=1188484358';
const SHEET_URL_SCHEDULE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQaXD80787sk22egIkym9znE1FAewPZ7qYe4gaL88GWNFAihRmwNO48rxbqC5OhKX_Xarp-Pc0uU90H/pub?gid=290442456&single=true&output=csv';
const SHEET_URL_QC_PLAN = 'https://docs.google.com/spreadsheets/d/1NR-PaUK3q7LsMYNrGhmZZE80PJ6i4UXgYc7mBX6LMJ4/export?format=csv&gid=465102760';
const GAS_URL_LEAVE = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';

// Direct URLs for faster sync (No proxy)
const URL_MASTER = SHEET_URL_MASTER;
const URL_POSITION = SHEET_URL_POSITION;
const URL_COST = SHEET_URL_COST;

function parseFullCSV(csv) {
  const result = [];
  let row = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    const next = csv[i + 1];
    if (ch === '"') {
      if (inQ && next === '"') { cur += '"'; i++; } // Escaped quote
      else { inQ = !inQ; }
    } else if (ch === ',' && !inQ) {
      row.push(cur.trim());
      cur = '';
    } else if ((ch === '\n' || ch === '\r') && !inQ) {
      if (ch === '\r' && next === '\n') { i++; }
      row.push(cur.trim());
      if (row.some(c => c !== '')) result.push(row);
      row = [];
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur || row.length > 0) {
    row.push(cur.trim());
    result.push(row);
  }
  return result;
}
async function fetchWithFallback(url) {
  // Add aggressive cache-busting
  const cacheBustedUrl = url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now() + '&random=' + Math.random();
  try {
    const res = await fetch(cacheBustedUrl, { cache: 'no-store' });
    if (res.ok) return await res.text();
    throw new Error('Direct failed');
  } catch (e) {
    const proxies = [
      'https://api.codetabs.com/v1/proxy?quest=',
      'https://corsproxy.io/?'
    ];
    for (const p of proxies) {
      try {
        const res = await fetch(p + encodeURIComponent(cacheBustedUrl), { cache: 'no-store' });
        if (res.ok) return await res.text();
      } catch (err) {}
    }
    throw new Error('All fetch methods failed');
  }
}

async function loadWorkshipFromSheets() {
  const statusEl = document.getElementById('syncStatus');
  if (statusEl) { statusEl.style.display = 'block'; statusEl.textContent = '🔄 Syncing...'; }
  console.log("Sync: Starting...");


  try {
    const [csvPos, csvCost] = await Promise.all([
      fetchWithFallback(SHEET_URL_POSITION),
      fetchWithFallback(SHEET_URL_COST)
    ]);
    console.log("Sync: CSVs fetched successfully.");

    // 1. Process Position
    const dataPos = parseFullCSV(csvPos);
    if (dataPos.length > 1) {
      const headers = dataPos[0];
      const nameIdx = headers.findIndex(h => /name/i.test(h));
      const posIdx = headers.findIndex(h => /positon|position/i.test(h));
      if (nameIdx !== -1) {
        const newMembers = [];
        for(let i=1; i<dataPos.length; i++) {
          const cols = dataPos[i];
          const name = cols[nameIdx]?.trim();
          const position = posIdx !== -1 ? cols[posIdx]?.trim() : '';
          if (!name) continue;
          
          // Map position to Node Type
          let type = mapCategoryToNode(position); // Reuse existing mapper
          if (type === 'Monitor') {
             // Fallback to name check if position is vague
             if (name.includes('CC')) type = 'Call Center';
             else if (name.includes('DI')) type = 'Media';
          }

          newMembers.push({ id: name, name: name, type, level: position, account: [] });
        }
        if (newMembers.length > 0) WS_DATA.members = newMembers;
      }
    }

    // 3. Process Cost (Advanced Comparison Section)
    const dataCost = parseFullCSV(csvCost);
    console.log(`Sync: Cost Sheet parsed into ${dataCost.length} rows.`);
    const cleanNum = (str) => parseFloat(str?.replace(/,/g,'').replace(/฿/g,'').trim()) || 0;

    // Helper to find section indices
    const findSection = (label) => dataCost.findIndex(r => r.some(c => c?.toLowerCase().includes(label.toLowerCase())));
    
    const realStart = findSection('REAL COST');
    const forecastStart = findSection('Forecast COST');
    const diffStart = findSection('DIFF COST');

    // --- Parse Real Section ---
    const realProjects = [];
    if (realStart !== -1) {
      const realDetailIdx = dataCost.findIndex((r, i) => i > realStart && r.some(c => c?.toLowerCase().includes('cost detail by project')));
      if (realDetailIdx !== -1) {
        for (let i = realDetailIdx + 1; i < (forecastStart !== -1 ? forecastStart : dataCost.length); i++) {
          const cols = dataCost[i];
          const name = cols[2];
          if (!name || name === 'Project Name' || name === 'งบส่วนกลาง' || name.toLowerCase().includes('total')) continue;
          realProjects.push({ id: cols[1], name, total: cleanNum(cols[12]), rev: cleanNum(cols[14]), gp: cleanNum(cols[15]) });
        }
      }
    }

    // --- Parse Forecast Section ---
    if (forecastStart !== -1) {
      const forecastRows = dataCost.slice(forecastStart, diffStart !== -1 ? diffStart : undefined);
      
      // Summary Row
      const sumRowIdx = forecastRows.findIndex(r => r.some(c => c?.toLowerCase().includes('total cost')));
      if (sumRowIdx !== -1) {
        const valRow = forecastRows.find((r, idx) => idx > sumRowIdx && !isNaN(cleanNum(r[1])));
        if (valRow) {
          COST_DATA.summary = {
            total:    cleanNum(valRow[1]),
            staff:    cleanNum(valRow[5]),
            software: cleanNum(valRow[7]),
            others:   cleanNum(valRow[9]),
          };
        }
      }

      // Detail Table
      const detailRowIdx = forecastRows.findIndex(r => r.some(c => c?.toLowerCase().includes('cost detail by project')));
      if (detailRowIdx !== -1) {
         const newProjects = [];
         const newComparison = [];
         for(let i = detailRowIdx + 1; i < forecastRows.length; i++) {
            const cols = forecastRows[i];
            const name = cols[2];
            if (!name || name === 'Project Name' || name === 'งบส่วนกลาง' || name.toLowerCase().includes('total')) continue;
            
            const totalF = cleanNum(cols[12]);
            const revF = cleanNum(cols[14]);
            if (totalF === 0 && revF === 0) continue;

            const p = { 
              id: cols[1], name, size: cols[3], 
              staff: cleanNum(cols[6]), 
              staffPerf: cleanNum(cols[6]), // Column 6
              soft: cleanNum(cols[7]), 
              other: cleanNum(cols[8]), 
              clKA: cleanNum(cols[10]), // Column 10
              clKB: cleanNum(cols[11]), // Column 11
              total: totalF, rev: revF, gp: cleanNum(cols[15]) 
            };
            newProjects.push(p);

            // Match with Real
            const real = realProjects.find(r => r.name === name || (r.id && r.id === p.id));
            newComparison.push({
              id: p.id, name: p.name, size: p.size,
              forecast: { total: totalF, rev: revF, gp: p.gp, staffPerf: p.staffPerf, clKA: p.clKA, clKB: p.clKB },
              real: real ? { total: real.total, rev: real.rev, gp: real.gp } : { total: 0, rev: 0, gp: 0 }
            });
         }
         COST_DATA.projects = newProjects;
         COST_DATA.comparison = newComparison;
         console.log(`Sync: Loaded ${newProjects.length} projects and ${newComparison.length} comparison items.`);
      }
    } else {
      console.warn("Sync: 'Forecast COST' section not found.");
    }

    console.log(`Workship: Loaded ${WS_DATA.members.length} members, ${WS_DATA.accounts.length} accounts, ${WS_DATA.tasks.length} tasks`);
    console.log(`Cost: Loaded ${COST_DATA.projects.length} projects`);
    if (statusEl) {
      statusEl.style.display = 'none';
    }
  } catch (e) {
    console.error('Workship Sync Error:', e);
    if (statusEl) statusEl.innerHTML = '<span style="color:var(--danger)">❌ Sync Error</span>';
  }

  const activeNav = document.querySelector('.nav-item.active');
  if (activeNav && activeNav.dataset.page === 'workship') {
    if (typeof navigate === 'function') navigate('workship');
  }
}

async function loadEmployeesFromSheets() {
  console.log("Sync: Loading Employees...");
  try {

    // For non-published URLs, always use proxy to avoid CORS/Redirect issues
    let csv = await fetchWithFallback(SHEET_URL_EMPLOYEE);
    
    // Clean BOM if present
    if (csv.charCodeAt(0) === 0xFEFF) {
      csv = csv.substring(1);
    }
    
    // Check if we got HTML instead of CSV (Google Login redirect)
    if (csv.trim().startsWith('<!DOCTYPE') || csv.trim().startsWith('<html')) {
      console.error("Sync: Received HTML instead of CSV. Please ensure the sheet is shared as 'Anyone with the link can view'.");
      return;
    }

    const data = parseFullCSV(csv);
    console.log("Sync: CSV Data Rows:", data.length);
    
    if (data.length > 0) {
      const row1 = data[0].map(h => h.replace(/^"|"$/g, '').toLowerCase().trim());
      // Support both English and Thai keywords for header detection
      const isHeader = row1.some(h => 
        h.includes('id') || h.includes('รหัส') || 
        h.includes('name') || h.includes('ชื่อ') || 
        h.includes('team') || h.includes('ทีม') ||
        h.includes('แผนก') || h.includes('rank') || h.includes('order') || h.includes('ลำดับ')
      );
      
      let idIdx, nameIdx, nameEnIdx, nickIdx, posIdx, teamIdx, emailIdx, statusIdx, shiftIdx, offIdx, birthIdx, empTypeIdx;
      let startIndex = 1;

      if (isHeader) {
        console.log("Sync: Header row detected:", row1);
        idIdx = row1.findIndex(h => h.includes('id') || h.includes('รหัส'));
        nameIdx = row1.findIndex(h => (h.includes('name') || h.includes('ชื่อ')) && !h.includes('en') && !h.includes('อังกฤษ'));
        nameEnIdx = row1.findIndex(h => (h.includes('name') || h.includes('ชื่อ')) && (h.includes('en') || h.includes('อังกฤษ')));
        nickIdx = row1.findIndex(h => h.includes('nick') || h.includes('ชื่อเล่น'));
        posIdx = row1.findIndex(h => h.includes('pos') || h.includes('ตำแหน่ง'));
        teamIdx = row1.findIndex(h => h.includes('team') || h.includes('ทีม') || h.includes('แผนก'));
        shiftIdx = row1.findIndex(h => h.includes('shift') || h.includes('กะ'));
        offIdx = row1.findIndex(h => h.includes('dayoff') || h.includes('off') || h.includes('หยุด'));
        birthIdx = row1.findIndex(h => h.includes('birth') || h.includes('เกิด'));
        emailIdx = row1.findIndex(h => h.includes('email') || h.includes('e-mail') || h.includes('mail') || h.includes('เมล'));
        empTypeIdx = row1.findIndex(h => h.includes('type') || h.includes('ประเภท'));
        statusIdx = row1.findIndex(h => h.includes('status') || h.includes('สถานะ'));
        const rankIdx = row1.findIndex(h => h.includes('rank') || h.includes('order') || h.includes('ลำดับ'));
        window._rankColumnIdx = rankIdx; 
        startIndex = 1;
      } else {
        console.log("Sync: No header detected, using fixed mapping");
        // 0:id | 1:name | 2:nameEn | 3:nickname | 4:e-mail | 5:birthdate | 6:position | 7:team | 8:shift | 9:dayoff | 10:empType | 11:status | 12:rank
        idIdx = 0; nameIdx = 1; nameEnIdx = 2; nickIdx = 3; emailIdx = 4;
        birthIdx = 5; posIdx = 6; teamIdx = 7; shiftIdx = 8; offIdx = 9;
        empTypeIdx = 10; statusIdx = 11;
        window._rankColumnIdx = 12; 
        startIndex = 0;
      }

      const newEmployees = [];
      for (let i = startIndex; i < data.length; i++) {
        const row = data[i].map(c => c.replace(/^"|"$/g, '').trim());
        if (!row[nameIdx] && !row[nameEnIdx]) continue;
        
        newEmployees.push({
          id: row[idIdx] || ('RS' + String(i + 1).padStart(3, '0')),
          name: row[nameIdx] || row[nameEnIdx] || 'No Name',
          nameEn: nameEnIdx !== -1 ? (row[nameEnIdx] || '') : '',
          nickname: row[nickIdx] || '-',
          pos: row[posIdx] || '-',
          dept: row[teamIdx] || '-',
          email: emailIdx !== -1 ? (row[emailIdx] || '-') : '-',
          shift: shiftIdx !== -1 ? (row[shiftIdx] || '-') : (row[8] || '-'),
          offdays: offIdx !== -1 ? (row[offIdx] || '-') : (row[9] || '-'),
          birthdate: birthIdx !== -1 ? (row[birthIdx] || '-') : (row[4] || '-'),
          empType: empTypeIdx !== -1 ? (row[empTypeIdx] || '-') : (row[10] || '-'),
          status: statusIdx !== -1 ? (row[statusIdx] || 'active') : (row[11] || 'active'),
          rank: (window._rankColumnIdx !== undefined && window._rankColumnIdx !== -1) ? (parseInt(row[window._rankColumnIdx]) || 999) : 999
        });
      }
      
      if (newEmployees.length > 0) {
        DATA.employees = newEmployees;
        console.log(`Sync: Loaded ${newEmployees.length} employees.`);
        
        // Refresh UI if on employee page
        if (window.currentPage === 'employee') {
           const contentEl = document.getElementById('pageContent');
           if (contentEl) {
             contentEl.innerHTML = pageEmployee();
             if (window.lucide) lucide.createIcons({ root: contentEl });
           }
        }
      }
    }
  } catch (e) {
    console.error("Sync: Failed to load employees:", e);
  }
}


async function loadLeavesFromSheets() {
  try {
    let csv = await fetchWithFallback(SHEET_URL_LEAVE);

    // Clean BOM if present
    if (csv.charCodeAt(0) === 0xFEFF) {
      csv = csv.substring(1);
    }

    // Check if we got HTML instead of CSV
    if (csv.trim().startsWith('<!DOCTYPE') || csv.trim().startsWith('<html')) {
      console.error("Leave: Received HTML instead of CSV. Sheet may not be shared properly.");
      return;
    }

    const rows = parseFullCSV(csv);
    if (rows.length < 2) return;

    // Strip quotes from values
    const data = rows.slice(1).map(r => {
      const start = (r[3] || '').replace(/^"|"$/g, '').trim();
      const end = (r[4] || '').replace(/^"|"$/g, '').trim();
      
      const parseToIso = (str) => {
        if (!str) return '';
        if (str.includes('-')) return str; // Already ISO format
        if (str.includes('/')) {
          const parts = str.split('/');
          if (parts.length === 3) {
            let y = parseInt(parts[2]);
            if (y > 2500) y -= 543; // Convert Thai year to Christian
            return `${y}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
        const parts = str.split(' ');
        if (parts.length < 3) return '';
        const day = parts[0].padStart(2, '0');
        const monthMap = {'ม.ค.':'01','ก.พ.':'02','มี.ค.':'03','เม.ย.':'04','พ.ค.':'05','มิ.ย.':'06','ก.ค.':'07','ส.ค.':'08','ก.ย.':'09','ต.ค.':'10','พ.ย.':'11','ธ.ค.':'12'};
        const month = monthMap[parts[1]] || '01';
        const year = parseInt(parts[2]) - 543;
        return `${year}-${month}-${day}`;
      };

      return {
        id: (r[0] || '').replace(/^"|"$/g, '').trim(),
        name: (r[1] || '').replace(/^"|"$/g, '').trim(),
        type: (r[2] || '').replace(/^"|"$/g, '').trim(),
        start,
        end,
        startRaw: parseToIso(start),
        endRaw: parseToIso(end),
        days: parseInt((r[5] || '0').replace(/^"|"$/g, '').trim()) || 0,
        refDate: (r[6] || '').replace(/^"|"$/g, '').trim(),
        refDateRaw: parseToIso((r[6] || '').replace(/^"|"$/g, '').trim()),
        status: (r[7] || 'pending').replace(/^"|"$/g, '').trim().toLowerCase(),
        approvedBy: (r[8] || '-').replace(/^"|"$/g, '').trim(),
        requestDate: (r[9] || '').replace(/^"|"$/g, '').trim(),
        note: (r[10] || '').replace(/^"|"$/g, '').trim(),
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent((r[1] || '').replace(/^"|"$/g, '').trim()) + '&background=random'
      };
    }).filter(d => d.name);

    DATA.leaveRequests = data;
    
    // Calculate Stats
    DATA.leaveStats = {
      total: data.length,
      approved: data.filter(d => d.status === 'approved' || d.status === 'อนุมัติแล้ว').length,
      pending: data.filter(d => d.status === 'pending' || d.status === 'รอการอนุมัติ').length,
      rejected: data.filter(d => d.status === 'rejected' || d.status === 'ไม่อนุมัติ').length,
      peopleOnLeave: data.filter(d => d.status === 'approved' || d.status === 'อนุมัติแล้ว').length,
      totalDays: data.reduce((sum, d) => sum + (Number(d.days) || 0), 0)
    };

    console.log('Leaves loaded:', DATA.leaveRequests.length);

    // Refresh UI if on leave page
    if (window.currentPage === 'leave-management') {
       const contentEl = document.getElementById('pageContent');
       if (contentEl) {
         contentEl.innerHTML = pageLeaveManagement();
         if (window.lucide) lucide.createIcons({ root: contentEl });
         if (typeof initLeaveCharts === 'function') setTimeout(initLeaveCharts, 100);
       }
    }
  } catch (err) {
    console.error('Error loading leaves:', err);
  }
}

async function loadHolidaysFromSheets() {
  console.log("Sync: Loading Holidays...");
  try {
    let csv = await fetchWithFallback(SHEET_URL_HOLIDAY);
    
    if (csv.charCodeAt(0) === 0xFEFF) {
      csv = csv.substring(1);
    }

    const rows = parseFullCSV(csv);
    if (rows.length < 2) return;

    const holidayMap = {};
    const headers = rows[0].map(h => h.toLowerCase().trim());
    let dateIdx = headers.findIndex(h => h.includes('date') || h.includes('วันที่'));
    let nameIdx = headers.findIndex(h => 
      h.includes('holiday') || 
      h.includes('วันหยุด') || 
      h.includes('วันนักขัต') || 
      h.includes('เทศกาล') || 
      h.includes('รายการ') || 
      h.includes('name') || 
      h.includes('ชื่อ')
    );

    // Robust fallback if matching headers fails
    if (dateIdx === -1) dateIdx = 0;
    if (nameIdx === -1) nameIdx = 1;

    if (dateIdx < rows[0].length && nameIdx < rows[0].length) {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const dateStr = row[dateIdx];
        const holidayName = row[nameIdx];
        if (!dateStr || !holidayName) continue;

        // Parse date. Expecting various formats. Try to extract day and month.
        // Format example: "1 Jan 2026" or "01/01/2026"
        let d, m;
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          d = parseInt(parts[0]);
          m = parseInt(parts[1]);
        } else if (dateStr.includes('-')) {
          const parts = dateStr.split('-');
          if (parts[0].length === 4) { // YYYY-MM-DD
            d = parseInt(parts[2]);
            m = parseInt(parts[1]);
          } else { // DD-MM-YYYY
            d = parseInt(parts[0]);
            m = parseInt(parts[1]);
          }
        } else {
          const parts = dateStr.split(' ');
          d = parseInt(parts[0]);
          const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
          const monthsTh = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
          const mStr = parts[1]?.toLowerCase().trim();
          
          m = months.findIndex(x => mStr?.includes(x)) + 1;
          if (m === 0) {
            // Check Thai month, handle cases with or without trailing dots
            m = monthsTh.findIndex(x => mStr === x || mStr === x.replace('.','') || x === mStr.replace('.','')) + 1;
          }
        }

        if (d && m) {
          holidayMap[`${m}-${d}`] = holidayName;
        }
      }
      window.HOLIDAYS = holidayMap;
      
      // Store a structured list for the Public Holiday page
      const holidayList = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const dateStr = row[dateIdx];
        const holidayName = row[nameIdx];
        if (dateStr && holidayName) {
          holidayList.push({ date: dateStr, name: holidayName });
        }
      }
      window.HOLIDAY_LIST = holidayList;
      
      console.log('Sync: Holidays loaded:', Object.keys(holidayMap).length);

      // Refresh UI if on schedule or holiday page
      if (window.currentPage === 'schedule') {
         const contentEl = document.getElementById('pageContent');
         if (contentEl) {
           contentEl.innerHTML = pageSchedule();
           if (window.lucide) lucide.createIcons({ root: contentEl });
         }
      } else if (window.currentPage === 'public-holiday') {
         const contentEl = document.getElementById('pageContent');
         if (contentEl) {
           contentEl.innerHTML = pagePublicHoliday();
           if (window.lucide) lucide.createIcons({ root: contentEl });
         }
      }
    }
  } catch (e) {
    console.error("Sync: Failed to load holidays:", e);
  }
}

async function apiSaveLeave(leaveData) {
  if (GAS_URL_LEAVE.includes('YOUR_GAS_WEBAPP_URL_HERE')) {
    console.warn('GAS URL not configured. Saving locally only.');
    return true;
  }
  
  try {
    // Use Hidden Form method to bypass CORS and ensure reliability with GAS
    let iframe = document.getElementById('hidden_leave_sync_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'hidden_leave_sync_iframe';
      iframe.name = 'hidden_leave_sync_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GAS_URL_LEAVE;
    form.target = 'hidden_leave_sync_iframe';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(leaveData);
    form.appendChild(input);
    
    document.body.appendChild(form);
    form.submit();
    
    // Cleanup
    setTimeout(() => {
      if (form.parentNode) document.body.removeChild(form);
    }, 1000);

    console.log("Leave Sync: Sent via Hidden Form (Bypass Mode)");
    return true;
  } catch (err) {
    console.error('Error saving leave via Hidden Form:', err);
    return false;
  }
}

async function apiSaveHolidayShift(holidayShiftData) {
  if (GAS_URL_LEAVE.includes('YOUR_GAS_WEBAPP_URL_HERE')) {
    console.warn('GAS URL not configured. Saving locally only.');
    return true;
  }
  
  try {
    let iframe = document.getElementById('hidden_holiday_sync_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'hidden_holiday_sync_iframe';
      iframe.name = 'hidden_holiday_sync_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GAS_URL_LEAVE;
    form.target = 'hidden_holiday_sync_iframe';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(holidayShiftData);
    form.appendChild(input);
    
    document.body.appendChild(form);
    form.submit();
    
    setTimeout(() => {
      if (form.parentNode) document.body.removeChild(form);
    }, 1000);

    console.log("Holiday Shift Sync: Sent via Hidden Form");
    return true;
  } catch (err) {
    console.error('Error saving holiday shift via GAS:', err);
    return false;
  }
}

async function apiSaveQcPlan(qcPlanData) {
  if (GAS_URL_LEAVE.includes('YOUR_GAS_WEBAPP_URL_HERE')) {
    console.warn('GAS URL not configured. Saving locally only.');
    return true;
  }
  
  try {
    // Generate a unique iframe ID to support parallel synchronous loop submissions
    const uniqueIFrameId = 'hidden_qc_sync_iframe_' + Math.random().toString(36).substring(2, 11);
    
    const iframe = document.createElement('iframe');
    iframe.id = uniqueIFrameId;
    iframe.name = uniqueIFrameId;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GAS_URL_LEAVE;
    form.target = uniqueIFrameId;
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(qcPlanData);
    form.appendChild(input);
    
    document.body.appendChild(form);
    form.submit();
    
    // Cleanup both form and unique iframe
    setTimeout(() => {
      if (form.parentNode) document.body.removeChild(form);
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 10000);

    console.log("QC Plan Sync: Sent via Unique Hidden Form");
    return true;
  } catch (err) {
    console.error('Error saving QC Plan via Unique Hidden Form:', err);
    return false;
  }
}

async function loadHolidayShiftsFromSheets() {
  console.log("Sync: Loading Holiday Shifts and Templates from Sheets...");
  const holidayTemplates = [];
  const groupedShifts = {};

  // 1. Fetch & Parse Holiday Calendar Shifts
  try {
    let csv = await fetchWithFallback(SHEET_URL_HOLIDAY_SHIFTS);
    if (csv.charCodeAt(0) === 0xFEFF) {
      csv = csv.substring(1);
    }
    
    if (!csv.trim().startsWith('<!DOCTYPE') && !csv.trim().startsWith('<html')) {
      const rows = parseFullCSV(csv);
      if (rows.length >= 2) {
        const headers = rows[0].map(h => h.toLowerCase().trim());
        const idIdx = headers.indexOf('id');
        const dateIdx = headers.indexOf('date');
        const nameIdx = headers.indexOf('holiday name');
        const statusIdx = headers.indexOf('status');
        const sectionIdx = headers.indexOf('section');
        const personIdx = headers.indexOf('person');
        const timeIdx = headers.indexOf('time shift');
        const assignIdx = headers.indexOf('assignments');

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < 2) continue;

          const id = row[idIdx] || ('HS-' + Date.now() + '-' + i);
          const date = row[dateIdx] || '';
          const holidayName = row[nameIdx] || '';
          const status = row[statusIdx] || 'upcoming';
          const section = row[sectionIdx] || '';
          const person = row[personIdx] || '';
          const time = row[timeIdx] || '';
          const assignmentsStr = row[assignIdx] || '[]';

          let assignments = [];
          try {
            assignments = JSON.parse(assignmentsStr);
          } catch (e) {
            assignments = [];
          }

          if (date === 'TEMPLATE' || holidayName === 'TEMPLATE') {
            // Backward compatibility
            holidayTemplates.push({
              id: id,
              section: section,
              assignments: assignments
            });
            continue;
          }

          const key = `${date}_${holidayName}`;
          if (!groupedShifts[key]) {
            groupedShifts[key] = {
              date: date,
              name: holidayName,
              status: status,
              tasks: []
            };
          }

          groupedShifts[key].tasks.push({
            id: id,
            section: section,
            person: person,
            time: time,
            assignments: assignments,
            dept: assignments.map(a => `${a.project} - ${a.job}`).join(', '),
            project: assignments[0]?.project || '-',
            job: assignments[0]?.job || '-'
          });

          if (status) groupedShifts[key].status = status;
        }
      }
    }
  } catch (e) {
    console.error("Sync: Failed to load holiday shifts:", e);
  }

  // 2. Fetch & Parse dedicated Templates Sheet
  try {
    let tplCsv = await fetchWithFallback(SHEET_URL_HOLIDAY_TEMPLATES);
    if (tplCsv.charCodeAt(0) === 0xFEFF) {
      tplCsv = tplCsv.substring(1);
    }

    if (!tplCsv.trim().startsWith('<!DOCTYPE') && !tplCsv.trim().startsWith('<html')) {
      const tplRows = parseFullCSV(tplCsv);
      if (tplRows.length >= 2) {
        const headers = tplRows[0].map(h => h.toLowerCase().trim());
        const idIdx = headers.indexOf('id');
        const sectionIdx = headers.indexOf('section');
        let timeIdx = headers.indexOf('time shift');
        if (timeIdx === -1) timeIdx = headers.indexOf('time');
        const assignIdx = headers.indexOf('assignments');

        for (let i = 1; i < tplRows.length; i++) {
          const row = tplRows[i];
          if (row.length < 2) continue;

          const id = row[idIdx] || ('HS-TPL-' + Date.now() + '-' + i);
          const section = row[sectionIdx] || '';
          const time = timeIdx !== -1 ? (row[timeIdx] || '') : '';
          const assignmentsStr = row[assignIdx] || '[]';

          let assignments = [];
          try {
            assignments = JSON.parse(assignmentsStr);
          } catch (e) {
            assignments = [];
          }

          // Avoid duplicates by ID
          if (!holidayTemplates.some(t => t.id === id)) {
            holidayTemplates.push({
              id: id,
              section: section,
              time: time,
              assignments: assignments
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("Sync: Failed to load holiday templates from dedicated sheet:", e);
  }

  // Merge with local templates in case Google Sheets CSV cache is stale
  let localTemplates = [];
  try {
    localTemplates = JSON.parse(localStorage.getItem('holiday_templates') || '[]');
  } catch (e) {}
  
  localTemplates.forEach(lt => {
    const idx = holidayTemplates.findIndex(ht => ht.id === lt.id);
    if (idx === -1) {
      holidayTemplates.push(lt);
    } else {
      holidayTemplates[idx] = lt;
    }
  });

  // Filter out deleted templates
  let deletedIds = [];
  try {
    deletedIds = JSON.parse(localStorage.getItem('deleted_template_ids') || '[]');
  } catch (e) {}
  if (deletedIds.length > 0) {
    holidayTemplates = holidayTemplates.filter(t => !deletedIds.includes(t.id));
  }

  window.HOLIDAY_TEMPLATES = holidayTemplates;
  localStorage.setItem('holiday_templates', JSON.stringify(holidayTemplates));
  const shiftsArray = Object.values(groupedShifts);
  localStorage.setItem('holiday_shifts', JSON.stringify(shiftsArray));
  console.log("Sync: Holiday shifts synced to localStorage:", shiftsArray.length, "holidays, and templates:", holidayTemplates.length);
}



async function loadScopeFromSheets() {
  console.log("Sync: Loading Scope Data...");
  try {
    const csv = await fetchWithFallback(SHEET_URL_SCOPE);
    const rows = parseFullCSV(csv);
    if (rows.length < 2) return;

    // Structure from User: Timestamp | Project Name | Node Type | Work Detail | Percentage
    const headers = rows[0].map(h => h.toLowerCase().trim());
    console.log("Sync: Scope Headers found:", headers);

    const accIdx = headers.findIndex(h => h.includes('project'));
    const nodeIdx = headers.findIndex(h => h.includes('node'));
    const nameIdx = headers.findIndex(h => h.includes('detail') || h.includes('work'));
    const progIdx = headers.findIndex(h => h.includes('percent'));
    const dateIdx = headers.findIndex(h => h.includes('time'));
    const personIdx = -1;

    console.log("Sync: Column mapping:", { accIdx, nodeIdx, nameIdx, progIdx, dateIdx });

    if (accIdx === -1 || nodeIdx === -1) {
      console.warn("Sync: Missing critical columns in Scope Sheet. Check headers.");
      return;
    }

    const grouped = {};
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue; // Skip empty rows

      const acc = row[accIdx] ? row[accIdx].trim() : 'Uncategorized';
      const name = row[nameIdx] ? row[nameIdx].trim() : 'Unnamed';
      const node = row[nodeIdx] ? row[nodeIdx].trim() : 'Other';
      const progress = parseInt(row[progIdx]) || 0;
      const dateRaw = dateIdx !== -1 ? row[dateIdx] : null;
      const person = row[personIdx];

      // Hide if recently deleted (within 5 minutes)
      const deletedScopes = JSON.parse(localStorage.getItem('ws_deleted_scopes') || '[]');
      const isDeleted = deletedScopes.some(d => d.account === acc && d.name === name && (Date.now() - d.time < 5 * 60 * 1000));
      if (isDeleted) continue;

      if (!grouped[acc]) grouped[acc] = { account: acc, items: [] };
      
      let item = grouped[acc].items.find(it => it.name === name && it.node === node);
      if (!item) {
        item = { name, node, progress, daily: {} };
        grouped[acc].items.push(item);
      }
      
      if (dateRaw && person) {
        // Simple date parsing or use as-is if already ISO
        item.daily[dateRaw] = person;
      }
    }

    const finalData = Object.values(grouped);
    if (finalData.length > 0) {
      window.PREMIUM_SCOPE_DATA = finalData;
      console.log('Sync: Scope data updated:', finalData.length, 'accounts');
      
      // Refresh UI if on scope page
      if (window.currentPage === 'project-scope-portal') {
         if (typeof renderPremiumScopeDashboard === 'function') {
            const contentEl = document.getElementById('pageContent');
            if (contentEl) {
              contentEl.innerHTML = renderPremiumScopeDashboard();
              if (window.lucide) lucide.createIcons({ root: contentEl });
            }
         }
      }
    }
  } catch (e) {
    console.error("Sync: Failed to load scope data:", e);
  }
}

window.PROJECT_NODES = ['Adhoc', 'AE', 'AI', 'Content', 'Coordinator', 'Graphic', 'Internal', 'Meeting', 'Monitor', 'Other', 'Production', 'Report', 'Seminar'];
window.PROJECT_ACCOUNTS = ['AFNC', 'ETDA', 'CALL CENTER', 'Media I Graphic', 'Media I Content', 'TCP', 'GC', 'AI', 'MOC', 'ตรวจจับ'];

async function loadProjectNodesFromSheets() {
  console.log("Sync: Loading Project Settings (Nodes & Accounts)...");
  try {

    let csv = await fetchWithFallback(SHEET_URL_PROJECT_NODES + '&t=' + Date.now());
    
    // Clean BOM if present
    if (csv.charCodeAt(0) === 0xFEFF) {
      csv = csv.substring(1);
    }

    const rows = parseFullCSV(csv);
    console.log("Sync: Project Settings CSV rows:", rows.length);
    if (rows.length < 2) return;

    const headers = rows[0].map(h => h.toLowerCase().trim());
    console.log("Sync: Project Settings Headers:", headers);
    
    const nodeIdx = headers.findIndex(h => h.includes('node') || h.includes('หัวข้อ'));
    const projIdx = headers.findIndex(h => h.includes('project') || h.includes('โปรเจค') || h.includes('account'));

    if (nodeIdx === -1) {
      console.warn("Sync: 'node' column not found in Project Settings Sheet.");
    }

    const fetchedNodes = [];
    const fetchedAccounts = [];
    for (let i = 1; i < rows.length; i++) {
      // Extract Nodes
      if (nodeIdx !== -1) {
        const nodeVal = rows[i][nodeIdx]?.trim();
        if (nodeVal && !fetchedNodes.includes(nodeVal)) {
          fetchedNodes.push(nodeVal);
        }
      }

      // Extract Project Accounts
      if (projIdx !== -1) {
        const projVal = rows[i][projIdx]?.trim();
        if (projVal && !fetchedAccounts.includes(projVal)) {
          fetchedAccounts.push(projVal);
        }
      }
    }

    if (fetchedNodes.length > 0) {
      window.PROJECT_NODES = fetchedNodes;
      console.log('Sync: Project nodes updated:', fetchedNodes);
    }
    if (fetchedAccounts.length > 0) {
      window.PROJECT_ACCOUNTS = fetchedAccounts;
      console.log('Sync: Project accounts updated:', fetchedAccounts);
    }
  } catch (e) {
    console.error("Sync: Failed to load project settings:", e);
  }
}

async function loadScheduleFromSheets() {
  console.log("Sync: Loading Schedule Data...");
  try {
    const csv = await fetchWithFallback(SHEET_URL_SCHEDULE);
    const rows = parseFullCSV(csv);
    
    if (rows.length < 2) {
      window.SCHEDULE_TASKS = [];
      return;
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const projIdx = headers.findIndex(h => h.includes('project'));
    const nodeIdx = headers.findIndex(h => h.includes('node'));
    const detailIdx = headers.findIndex(h => h.includes('detail') || h.includes('work'));
    const pctIdx = headers.findIndex(h => h.includes('percent'));

    const tasks = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2 || !row[dateIdx]) continue;
      
      let dateIso = row[dateIdx];
      if (dateIso.includes('/')) {
         const parts = dateIso.split('/');
         if (parts.length === 3) {
            const p0 = parseInt(parts[0]);
            const p1 = parseInt(parts[1]);
            let y = parseInt(parts[2]);
            if (y > 2500) y -= 543; // Convert Thai Buddhist year
            let month, day;
            // If p0 > 12 it MUST be a day, so format is DD/MM/YYYY
            // If p0 <= 12 and p1 > 12, format is MM/DD/YYYY
            // If both <=12, assume DD/MM/YYYY (Thai Google Sheets default)
            if (p0 > 12) {
               day = p0; month = p1;
            } else if (p1 > 12) {
               month = p0; day = p1;
            } else {
               day = p0; month = p1;
            }
            dateIso = `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
         }
      } else if (dateIso.includes('T')) {
         dateIso = dateIso.split('T')[0];
      }
      
      // Skip rows with invalid/unparseable dates
      if (!dateIso.match(/^\d{4}-\d{2}-\d{2}$/)) continue;
      
      const nickname = row[nameIdx];
      let personId = nickname || 'unknown';
      if (DATA.employees && nickname) {
        const tPerson = nickname.trim().toLowerCase();
        const formatScheduleName = (fullNameEn) => {
          if (!fullNameEn || fullNameEn === '-') return '';
          const parts = fullNameEn.trim().split(/\s+/);
          if (parts.length < 2) return parts[0];
          return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
        };

        const emp = DATA.employees.find(e => 
          (e.id && String(e.id).trim().toLowerCase() === tPerson) ||
          (e.nickname && e.nickname.trim().toLowerCase() === tPerson) || 
          (e.name && e.name.trim().toLowerCase() === tPerson) || 
          (e.nameEn && e.nameEn.trim().toLowerCase() === tPerson) ||
          (formatScheduleName(e.nameEn).trim().toLowerCase() === tPerson)
        );
        if (emp) personId = emp.id;
      }
      
      tasks.push({
        id: 'sync_' + i + '_' + Date.now() + Math.floor(Math.random() * 1000),
        date: dateIso,
        person: personId,
        acc: row[projIdx],
        node: row[nodeIdx],
        title: row[detailIdx],
        hours: parseInt(row[pctIdx]) || 0,
        oldDate: dateIso,
        oldName: nickname
      });
    }
    
    window.SCHEDULE_TASKS = tasks;
    console.log(`Sync: Loaded ${tasks.length} schedule tasks.`);

    // Map window.SCHEDULE_TASKS to WS_DATA.tasks for the Workship page
    const formatScheduleNameLocal = (fullNameEn) => {
      if (!fullNameEn || fullNameEn === '-') return '';
      const parts = fullNameEn.trim().split(/\s+/);
      if (parts.length < 2) return parts[0];
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    };

    WS_DATA.tasks = tasks.map(t => {
      let memberName = t.oldName || t.person;
      
      const member = WS_DATA.members.find(m => 
        m.name.toLowerCase() === memberName.toLowerCase() ||
        m.id.toLowerCase() === memberName.toLowerCase()
      );
      
      if (member) {
        memberName = member.name;
      } else if (DATA.employees) {
        const emp = DATA.employees.find(e => 
          e.id === t.person || 
          e.nickname.toLowerCase() === memberName.toLowerCase() || 
          e.name.toLowerCase() === memberName.toLowerCase() || 
          (e.nameEn && e.nameEn.toLowerCase() === memberName.toLowerCase())
        );
        if (emp) {
          const matchedMem = WS_DATA.members.find(m => 
            m.name.toLowerCase() === emp.name.toLowerCase() ||
            (emp.nameEn && m.name.toLowerCase() === emp.nameEn.toLowerCase()) ||
            m.name.toLowerCase() === emp.nickname.toLowerCase() ||
            (emp.nameEn && m.name.toLowerCase() === formatScheduleNameLocal(emp.nameEn).toLowerCase())
          );
          if (matchedMem) memberName = matchedMem.name;
        }
      }
      
      return {
        date: t.date,
        acc: t.acc,
        member: memberName,
        node: t.node,
        hours: t.hours
      };
    });

    // Populate WS_DATA.accounts from Schedule tasks
    const seenProj = new Set();
    const newAccounts = [];
    tasks.forEach(t => {
      if (t.acc && !seenProj.has(t.acc)) {
        seenProj.add(t.acc);
        newAccounts.push({ id: t.acc, name: t.acc, node: t.node || 'Monitor', category: t.node || 'Monitor' });
      }
    });
    if (newAccounts.length > 0) {
      WS_DATA.accounts = newAccounts;
    }

    // Sync member accounts
    WS_DATA.members.forEach(m => m.account = []);
    tasks.forEach(t => {
      const memberName = t.oldName || t.person;
      const member = WS_DATA.members.find(m => 
        m.name.toLowerCase() === memberName.toLowerCase() || 
        m.id.toLowerCase() === t.person.toLowerCase()
      );
      if (member && t.acc && !member.account.includes(t.acc)) {
        member.account.push(t.acc);
      }
    });
    
    if (window.currentPage === 'schedule') {
       if (typeof window.filterScheduleUI === 'function') {
         window.filterScheduleUI();
       }
    }
  } catch (e) {
    console.error("Sync: Failed to load schedule tasks:", e);
  }
}


// Initial Sync will be called from app.js

async function loadQcPlanFromSheets() {
  console.log("Sync: Loading QC Plan Data...");
  try {
    const csv = await fetchWithFallback(SHEET_URL_QC_PLAN);
    const rows = parseFullCSV(csv);
    
    if (rows.length < 2) {
      window.QC_PLANS = [];
      return;
    }

    const headers = rows[0].map(h => (h || '').toLowerCase().trim());
    console.log("Sync: QC Plan Headers:", headers);

    // Find column indices (flexible matching)
    let idIdx = headers.findIndex(h => h === 'id' || h === 'ID' || h === 'รหัส');
    let nameIdx = headers.findIndex(h => h.includes('name') || h.includes('ชื่อ') || h.includes('ผู้รับผิดชอบ'));
    let qcTypeIdx = headers.findIndex(h => h.includes('qc') || h.includes('รอบ'));
    let channelIdx = headers.findIndex(h => h.includes('channel') || h.includes('ช่องทาง'));
    let categoryIdx = headers.findIndex(h => h.includes('category') || h.includes('หมวด'));
    let dateIdx = headers.findIndex(h => h.includes('date') || h.includes('วันที่'));
    let casesIdx = headers.findIndex(h => h.includes('cases') || h.includes('เคส') || h.includes('จำนวน'));
    let targetCasesIdx = headers.findIndex(h => h.includes('target') || h.includes('ต้องทำ') || h.includes('เป้าหมาย'));

    // Robust fallback if matching headers fails
    if (idIdx === -1) idIdx = 0;
    if (nameIdx === -1) nameIdx = 1;
    if (qcTypeIdx === -1) qcTypeIdx = 2;
    if (channelIdx === -1) channelIdx = 3;
    if (categoryIdx === -1) categoryIdx = 4;
    if (dateIdx === -1) dateIdx = 5;
    if (casesIdx === -1) casesIdx = 6;
    if (targetCasesIdx === -1) targetCasesIdx = 7;

    let plans = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue;
      const id = (row[idIdx] || '').trim();
      const name = (row[nameIdx] || '').trim();
      const qcType = (row[qcTypeIdx] || '').trim();
      const channel = (row[channelIdx] || '').trim();
      const category = (row[categoryIdx] || '').trim();
      let dateIso = (row[dateIdx] || '').trim();
      if (dateIso.includes('/')) {
         const parts = dateIso.split('/');
         if (parts.length === 3) {
            const p0 = parseInt(parts[0]);
            const p1 = parseInt(parts[1]);
            let y = parseInt(parts[2]);
            if (y > 2500) y -= 543; // Convert Thai Buddhist year
            let month, day;
            if (p0 > 12) {
               day = p0; month = p1;
            } else if (p1 > 12) {
               month = p0; day = p1;
            } else {
               day = p0; month = p1;
            }
            dateIso = `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
         }
      } else if (dateIso.includes('T')) {
         dateIso = dateIso.split('T')[0];
      }
      
      const cases = casesIdx !== -1 ? parseInt(row[casesIdx]) || 0 : 0;
      const targetCases = targetCasesIdx !== -1 ? parseInt(row[targetCasesIdx]) || 0 : 0;
      if (!name || !dateIso) continue;
      
      // Exclude Manual plans with invalid/other channels
      if ((qcType || '').toLowerCase().includes('manual')) {
        const lowerChan = (channel || '').toLowerCase();
        if (lowerChan !== 'website' && lowerChan !== 'social') {
          continue; // Skip loading this entry
        }
      }
      
      plans.push({ id, name, qcType, channel, category, date: dateIso, cases, targetCases });
    }

    // --- Apply Local Overlay Cache (added / deleted list) ---
    let localAdded = [];
    let localDeleted = [];
    try {
      localAdded = JSON.parse(localStorage.getItem('qc_plans_added') || '[]');
      localDeleted = JSON.parse(localStorage.getItem('qc_plans_deleted') || '[]');
    } catch(e) {}

    // Clean up localAdded if they are now in the fetched plans list (means they are fully published)
    localAdded = localAdded.filter(la => {
      const isAlreadySynced = plans.some(p => p.id === la.id);
      return !isAlreadySynced;
    });
    localStorage.setItem('qc_plans_added', JSON.stringify(localAdded));

    // Filter out any deleted plans from the fetched plans list
    plans = plans.filter(p => {
      const isDeleted = localDeleted.some(ld => {
        if (ld.id && ld.id === p.id) return true;
        if (ld.name === p.name && ld.qcType === p.qcType && ld.channel === p.channel && (ld.category || '') === (p.category || '')) {
          return true;
        }
        return false;
      });
      return !isDeleted;
    });

    // Filter out deleted plans from localAdded as well
    localAdded = localAdded.filter(la => {
      const isDeleted = localDeleted.some(ld => {
        if (ld.id && ld.id === la.id) return true;
        if (ld.name === la.name && ld.qcType === la.qcType && ld.channel === la.channel && (ld.category || '') === (la.category || '')) {
          return true;
        }
        return false;
      });
      return !isDeleted;
    });

    // Combine fetched plans with remaining local additions
    const finalPlans = [...plans, ...localAdded];

    window.QC_PLANS = finalPlans;
    console.log(`Sync: Loaded ${finalPlans.length} QC Plan entries (including local overlay).`);

    // Re-render QC page if active
    if (window.currentPage === 'qc-realcyber-plan') {
      const contentEl = document.getElementById('pageContent');
      if (contentEl && typeof renderQCWorkPlanDashboard === 'function') {
        contentEl.innerHTML = renderQCWorkPlanDashboard();
        if (window.lucide) lucide.createIcons({ root: contentEl });
      }
    }
  } catch (e) {
    console.error("Sync: Failed to load QC Plan:", e);
    window.QC_PLANS = [];
  }
}

async function syncAllData() {
  console.log("Sync: Starting all data sync...");
  try {
    await Promise.all([
      loadWorkshipFromSheets(),
      (typeof window.loadDetailEmployees === 'function' ? window.loadDetailEmployees() : Promise.resolve()),
      loadEmployeesFromSheets(),
      loadLeavesFromSheets(),
      loadHolidaysFromSheets(),
      loadScopeFromSheets(),
      loadProjectNodesFromSheets(),
      loadHolidayShiftsFromSheets()
    ]);
    
    // Load Schedule AFTER employees are loaded so personId mapping works
    await loadScheduleFromSheets();
    
    // Load QC Plan data
    await loadQcPlanFromSheets();
    
    console.log("Sync: All data sync complete.");
    console.log("Final PROJECT_ACCOUNTS:", window.PROJECT_ACCOUNTS);
    console.log("Final PROJECT_NODES:", window.PROJECT_NODES);

    // Re-render current page or initial navigate
    if (typeof navigate === 'function') {
      const targetPage = window.currentPage || 'dashboard';
      console.log("Sync: Navigating to page:", targetPage);
      navigate(targetPage);
    }
    
    // Preload Empeo Data silently in background so it's instant when clicked
    if (typeof window.loadEmpeoData === 'function') {
        setTimeout(() => window.loadEmpeoData(), 1000);
    }
    
    // No notification on success as per user request
    console.log("Sync: Success toast skipped.");
  } catch (err) {
    console.error("Sync: Sync failed:", err);
    if (typeof window.showToast === 'function') {
      window.showToast('เกิดข้อผิดพลาดในการดึงข้อมูล', 'danger');
    }
  }
}
if (window.logLoad) logLoad("ws_data.js: Loaded.");