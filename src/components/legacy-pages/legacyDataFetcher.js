export async function fetchAndSetLegacyData() {
  const parseCSV = (csv) => {
    const result = [];
    let row = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < csv.length; i++) {
      const ch = csv[i];
      const next = csv[i + 1];
      if (ch === '"') {
        if (inQ && next === '"') { cur += '"'; i++; }
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
  };

  const fetchWithFallback = async (url) => {
    const cacheBustedUrl = url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now();
    try {
      const res = await fetch(cacheBustedUrl, { cache: 'no-store' });
      if (res.ok) return await res.text();
    } catch (e) {}
    try {
      const res2 = await fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(cacheBustedUrl));
      if (res2.ok) return await res2.text();
    } catch (e) {}
    return '';
  };

  if (typeof window !== 'undefined') {
    if (!window.HOLIDAY_TEMPLATES) {
      try {
        const cached = localStorage.getItem('holiday_templates');
        if (cached) window.HOLIDAY_TEMPLATES = JSON.parse(cached);
      } catch (e) {}
    }
    if (!window.DATA) {
      window.DATA = { employees: [], scheduleTasks: [], leaveRequests: [], public_holidays: [] };
    }
    if (window.DATA && (!window.DATA.employees || window.DATA.employees.length === 0)) {
      try {
        const cached = localStorage.getItem('cached_employees');
        if (cached) window.DATA.employees = JSON.parse(cached);
      } catch (e) {}
    }
    if (window.DATA && (!window.DATA.public_holidays || window.DATA.public_holidays.length === 0)) {
      try {
        const cached = localStorage.getItem('cached_public_holidays');
        if (cached) {
          window.DATA.public_holidays = JSON.parse(cached);
          window.HOLIDAY_LIST = window.DATA.public_holidays;
          
          const holidayMap = {};
          window.HOLIDAY_LIST.forEach(row => {
            if (row.date && row.name) {
              const parts = row.date.split('/');
              if (parts.length === 3) {
                holidayMap[`${parseInt(parts[1])}-${parseInt(parts[0])}`] = row.name;
              }
            }
          });
          window.HOLIDAYS = holidayMap;
        }
      } catch (e) {}
    }
  }

  const promises = [];

  promises.push((async () => {
  // 1. Fetch QC Plans
  if (!window.QC_PLANS || window.QC_PLANS.length === 0) {
    const qcCsv = await fetchWithFallback('https://docs.google.com/spreadsheets/d/1NR-PaUK3q7LsMYNrGhmZZE80PJ6i4UXgYc7mBX6LMJ4/export?format=csv&gid=465102760');
    if (qcCsv) {
      const rows = parseCSV(qcCsv);
      if (rows.length > 1) {
        const headers = rows[0].map(h => (h || '').toLowerCase().trim());
        let idIdx = headers.findIndex(h => h === 'id' || h === 'ID' || h === 'รหัส');
        let nameIdx = headers.findIndex(h => h.includes('name') || h.includes('ชื่อ') || h.includes('ผู้รับผิดชอบ'));
        let qcTypeIdx = headers.findIndex(h => h.includes('qc') || h.includes('รอบ'));
        let channelIdx = headers.findIndex(h => h.includes('channel') || h.includes('ช่องทาง'));
        let categoryIdx = headers.findIndex(h => h.includes('category') || h.includes('หมวด'));
        let dateIdx = headers.findIndex(h => h.includes('date') || h.includes('วันที่'));
        let casesIdx = headers.findIndex(h => h.includes('cases') || h.includes('เคส') || h.includes('จำนวน'));
        let targetCasesIdx = headers.findIndex(h => h.includes('target') || h.includes('ต้องทำ') || h.includes('เป้าหมาย'));

        if (idIdx === -1) idIdx = 0;
        if (nameIdx === -1) nameIdx = 1;
        if (qcTypeIdx === -1) qcTypeIdx = 2;
        if (channelIdx === -1) channelIdx = 3;
        if (categoryIdx === -1) categoryIdx = 4;
        if (dateIdx === -1) dateIdx = 5;
        if (casesIdx === -1) casesIdx = 6;
        if (targetCasesIdx === -1) targetCasesIdx = 7;

        const plans = [];
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
                if (y > 2500) y -= 543;
                let month, day;
                if (p0 > 12) { day = p0; month = p1; } 
                else if (p1 > 12) { month = p0; day = p1; } 
                else { day = p0; month = p1; }
                dateIso = `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
             }
          } else if (dateIso.includes('T')) {
             dateIso = dateIso.split('T')[0];
          }
          
          const cases = casesIdx !== -1 ? parseInt(row[casesIdx]) || 0 : 0;
          const targetCases = targetCasesIdx !== -1 ? parseInt(row[targetCasesIdx]) || 0 : 0;
          if (!name || !dateIso) continue;
          
          if ((qcType || '').toLowerCase().includes('manual')) {
            const lowerChan = (channel || '').toLowerCase();
            if (lowerChan !== 'website' && lowerChan !== 'social') {
              continue;
            }
          }
          plans.push({ id, name, qcType, channel, category, date: dateIso, cases, targetCases });
        }
        window.QC_PLANS = plans;
      }
    }
  }

  // 2. Fetch Scope Data from Supabase
  if (!window.PREMIUM_SCOPE_DATA || window.PREMIUM_SCOPE_DATA.length === 0) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        let scopes = [];
        let offset = 0;
        let limit = 1000;
        let hasMore = true;
        while (hasMore) {
          const res = await fetch(`${supabaseUrl}/rest/v1/project_scopes?select=*&limit=${limit}&offset=${offset}`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
          });
          if (res.ok) {
            const chunk = await res.json();
            if (chunk && chunk.length > 0) {
              scopes = scopes.concat(chunk);
              offset += limit;
              if (chunk.length < limit) {
                hasMore = false;
              }
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        if (scopes.length > 0) {
          const grouped = {};
          scopes.forEach(row => {
            const acc = row.project || 'Uncategorized';
            const name = row.work_detail || 'Unnamed';
            const node = row.node || 'Other';
            const progress = parseInt(row.percentage) || 0;

            if (!grouped[acc]) grouped[acc] = { account: acc, items: [] };
            let item = grouped[acc].items.find(it => it.name === name && it.node === node);
            if (!item) {
              item = { name, node, progress, daily: {} };
              grouped[acc].items.push(item);
            }
          });
          window.PREMIUM_SCOPE_DATA = Object.values(grouped);
        }
    } catch (err) {
      console.warn('Error fetching project scopes from Supabase:', err.message || err);
    }
  }

  // 3. Fetch Holiday List from Supabase
  if (!window.HOLIDAY_LIST || window.HOLIDAY_LIST.length === 0) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const res = await fetch(`${supabaseUrl}/rest/v1/public_holidays?select=*&limit=500`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        if (res.ok) {
          const holidays = await res.json();
          const holidayList = [];
          const holidayMap = {};
          holidays.forEach(row => {
            const dateStr = row.date;
            const holidayName = row.name;
            if (dateStr && holidayName) {
              const [y, m, d] = dateStr.split('-');
              const uDateStr = `${parseInt(d)}/${parseInt(m)}/${y}`;
              holidayList.push({ id: row.id, date: uDateStr, name: holidayName });
              holidayMap[`${parseInt(m)}-${parseInt(d)}`] = holidayName;
            }
          });
          window.HOLIDAY_LIST = holidayList;
          window.HOLIDAYS = holidayMap;
          localStorage.setItem('cached_public_holidays', JSON.stringify(holidayList));
        }
      }
    } catch (err) {
      console.warn('Error fetching holidays from Supabase:', err.message || err);
    }
  }

  // 4. Fetch Holiday Shifts & Templates from Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/holiday_shifts?select=*&limit=2000`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      if (res.ok) {
        const shifts = await res.json();
        window.HOLIDAY_TEMPLATES = [];
        const groupedShifts = {};

        shifts.forEach(row => {
          const id = row.id;
          const date = row.date || '';
          const holidayName = row.holiday_name || '';
          const status = row.status || 'upcoming';
          const section = row.section || '';
          const person = row.person || '';
          const time = row.time_shift || '';
          let assignments = row.assignments;
          if (typeof assignments === 'string') {
            try { assignments = JSON.parse(assignments); } catch(e) { assignments = []; }
          }
          if (!Array.isArray(assignments)) assignments = [];

          if (date === 'TEMPLATE' || holidayName === 'TEMPLATE') {
            window.HOLIDAY_TEMPLATES.push({ id, name: (holidayName && holidayName !== 'TEMPLATE') ? holidayName : '', section, time, assignments });
          } else {
            const key = `${date}_${holidayName}`;
            if (!groupedShifts[key]) {
              groupedShifts[key] = { date, name: holidayName, status, tasks: [] };
            }
            groupedShifts[key].tasks.push({
              id, section, person, time, assignments,
              dept: assignments.map(a => `${a.project} - ${a.job}`).join(', '),
              project: assignments[0]?.project || '-',
              job: assignments[0]?.job || '-'
            });
            if (status) groupedShifts[key].status = status;
          }
        });

        window.HOLIDAY_TEMPLATES.sort((a, b) => String(a.id).localeCompare(String(b.id)));
        localStorage.setItem('holiday_templates', JSON.stringify(window.HOLIDAY_TEMPLATES));
        localStorage.setItem('holiday_shifts', JSON.stringify(Object.values(groupedShifts)));
      }
    }
  } catch (err) {
    console.warn('Error fetching holiday shifts from Supabase:', err.message || err);
  }

  // 5. Sync WS_DATA.accounts
  if (window.PREMIUM_SCOPE_DATA && window.WS_DATA) {
    window.PREMIUM_SCOPE_DATA.forEach(group => {
      if (!window.WS_DATA.accounts.find(a => a.name === group.account)) {
        window.WS_DATA.accounts.push({ id: group.account, name: group.account, node: 'N/A' });
      }
    });
  }

  })());

  promises.push((async () => {
  // 6. Fetch Employees from Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/employees?select=*&limit=1000`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      if (res.ok) {
        const rawEmployees = await res.json();
        const newEmployees = rawEmployees.map(row => ({
          id: row.id,
          name: row.name || 'No Name',
          nameEn: row.name_en || '',
          nickname: row.nickname || '-',
          pos: row.position || '-',
          dept: row.team || '-',
          email: row.email || '-',
          shift: row.shift || '-',
          offdays: row.offdays || row.dayoff || '-',
          birthdate: row.birthdate || '-',
          empType: row.emp_type || '-',
          status: row.status || 'active'
        }));
        if (newEmployees.length > 0) {
          window.DATA.employees = newEmployees;
          localStorage.setItem('cached_employees', JSON.stringify(newEmployees));
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch employees from Supabase:', err.message || err);
  }
  })());

  promises.push((async () => {
  // 7. Fetch Leave Requests from Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/leave_requests?select=*&limit=5000`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (res.ok) {
        const leaveData = await res.json();
        
        const formatDateTH = (dateStr) => {
            if (!dateStr || dateStr.trim() === '') return '-';
            try {
              const d = new Date(dateStr);
              if (isNaN(d.getTime())) return dateStr;
              const m = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
              return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`;
            } catch(e) {
              return dateStr;
            }
        };

        window.DATA.leaveRequests = leaveData.map(r => ({
            id: r.id,
            name: r.name,
            type: r.type,
            fromDate: r.start_date,
            toDate: r.end_date,
            startRaw: r.start_date,
            endRaw: r.end_date,
            start: formatDateTH(r.start_date),
            end: formatDateTH(r.end_date),
            requestDate: formatDateTH(r.request_date),
            refDate: r.ref_date ? formatDateTH(r.ref_date) : '-',
            days: parseFloat(r.days) || 1,
            reason: r.note || '-',
            note: r.note || '-',
            status: (r.status || 'pending').toLowerCase(),
            approvedBy: r.approved_by || '-'
        }));
      }
    }
  } catch (err) {
    console.warn('Failed to fetch leave requests from Supabase:', err.message || err);
  }
  })());

  promises.push((async () => {
  // 8. Fetch Schedule Tasks from Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      let rawTasks = [];
      let offset = 0;
      let limit = 1000;
      let hasMore = true;
      while (hasMore) {
        const res = await fetch(`${supabaseUrl}/rest/v1/schedule_tasks?select=*&limit=${limit}&offset=${offset}`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        if (res.ok) {
          const chunk = await res.json();
          if (chunk && chunk.length > 0) {
            rawTasks = rawTasks.concat(chunk);
            offset += limit;
            if (chunk.length < limit) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      if (rawTasks.length > 0) {
        const colorForNode = (node) => {
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
        window.SCHEDULE_TASKS = rawTasks.map(t => {
          const parts = (t.work_detail || '').split(' ||| ');
          return {
            id: t.id,
            date: t.date,
            person: t.person_id,
            acc: t.project || '',
            node: t.node || 'Other',
            title: parts[0] || '',
            hours: parseInt(t.percentage) || 0,
            color: colorForNode(t.node),
            note: parts[1] || ''
          };
        });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch schedule tasks from Supabase:', err.message || err);
  }
  })());

  // 9. Fetch Org Structure from Supabase
  promises.push((async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const res = await fetch(`${supabaseUrl}/rest/v1/org_structure?id=eq.default`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            let struct = data[0].structure;
            if (typeof struct === 'string') {
              try { struct = JSON.parse(struct); } catch (e) {}
            }
            if (struct) {
              window.orgStructureData = struct;
              localStorage.setItem('org_structure', JSON.stringify(struct));
            }
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch org structure from Supabase:', err.message || err);
    }
  })());

  await Promise.all(promises);
}

if (typeof window !== 'undefined') {
  window.fetchAndSetLegacyData = fetchAndSetLegacyData;
}

