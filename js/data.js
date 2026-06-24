// ===== MOCK DATA =====

if (window.logLoad) logLoad("data.js: Loading...");
var DATA = {
  stats: {
    revenue: '฿4,280,000',
    expense: '฿1,950,000',
    profit: '฿2,330,000',
    deals: 23,
  },

  costs: [
    { id:'C001', name:'ค่าเช่าสำนักงาน', category:'Fixed', amount: 55000, month:'เม.ย. 2026', status:'paid' },
    { id:'C002', name:'ค่าไฟฟ้า / น้ำ', category:'Utility', amount: 12300, month:'เม.ย. 2026', status:'paid' },
    { id:'C003', name:'Software License', category:'IT', amount: 28000, month:'เม.ย. 2026', status:'pending' },
    { id:'C004', name:'ค่าจ้างพนักงาน Part-time', category:'HR', amount: 42000, month:'เม.ย. 2026', status:'paid' },
    { id:'C005', name:'Marketing / Ads', category:'Marketing', amount: 35000, month:'มี.ค. 2026', status:'pending' },
  ],

  procurement: [
    { id:'PR001', item:'Notebook Dell Latitude', qty: 3, unit:'เครื่อง', price: 45000, vendor:'Dell Thailand', status:'approved', date:'10/04/2026' },
    { id:'PR002', item:'Office Chair Ergonomic', qty: 10, unit:'ตัว', price: 8500, vendor:'Office Pro', status:'pending', date:'12/04/2026' },
    { id:'PR003', item:'Server NAS 16TB', qty: 1, unit:'ชุด', price: 95000, vendor:'Synology TH', status:'approved', date:'08/04/2026' },
    { id:'PR004', item:'Printer Laser Color', qty: 2, unit:'เครื่อง', price: 22000, vendor:'HP Thailand', status:'review', date:'15/04/2026' },
  ],

  pipeline: {
    lead: [
      { name:'บริษัท ไทยออโต้ จำกัด', value:'฿850,000', owner:'ก้อง', date:'20/04' },
      { name:'PTT Digital', value:'฿1,200,000', owner:'มีน', date:'22/04' },
    ],
    qualified: [
      { name:'SCG Cement', value:'฿2,500,000', owner:'ก้อง', date:'18/04' },
      { name:'True Corp', value:'฿980,000', owner:'แอน', date:'19/04' },
    ],
    proposal: [
      { name:'Kasikorn Bank', value:'฿4,100,000', owner:'มีน', date:'15/04' },
    ],
    negotiation: [
      { name:'CPALL', value:'฿1,750,000', owner:'แอน', date:'12/04' },
    ],
    won: [
      { name:'BTS Group', value:'฿3,200,000', owner:'ก้อง', date:'05/04' },
    ],
  },

  estimateItems: [
    { id:1, desc:'Project Manager (2 เดือน)', unit:'เดือน', qty: 2, rate: 80000, total: 160000 },
    { id:2, desc:'Senior Developer (3 เดือน)', unit:'เดือน', qty: 3, rate: 65000, total: 195000 },
    { id:3, desc:'Designer UX/UI', unit:'เดือน', qty: 2, rate: 45000, total: 90000 },
    { id:4, desc:'Server & Infrastructure', unit:'ครั้ง', qty: 1, rate: 120000, total: 120000 },
    { id:5, desc:'Testing & QA', unit:'เดือน', qty: 1, rate: 35000, total: 35000 },
  ],

  saleSupport: [
    { id: 'SUP-2025-0045', subject: 'ขอตรวจสอบ BOQ โครงการใหม่', project: 'DIB-Solar Rooftop', requester: 'Jirawat P.', category: 'ตรวจสอบเอกสาร', priority: 'high', due: '31 พ.ค. 2568', status: 'inprog', assignee: 'Sutthida M.' },
    { id: 'SUP-2025-0044', subject: 'ประสานงานเข้าพบลูกค้า (Site Visit)', project: 'DIB-Office Building', requester: 'Kannika S.', category: 'ประสานงาน', priority: 'medium', due: '30 พ.ค. 2568', status: 'approved', assignee: 'Nattapol K.' },
    { id: 'SUP-2025-0043', subject: 'ตรวจสอบสัญญาว่าจ้าง (Draft)', project: 'DIB-Warehouse', requester: 'Jirawat P.', category: 'ตรวจสอบเอกสาร', priority: 'high', due: '28 พ.ค. 2568', status: 'review', assignee: 'Kannika S.' },
    { id: 'SUP-2025-0042', subject: 'เตรียม Presentation งานประมูล', project: 'DIB-Data Center', requester: 'Nattapol K.', category: 'เตรียมการขาย', priority: 'medium', due: '27 พ.ค. 2568', status: 'pending', assignee: 'Phisit T.' },
    { id: 'SUP-2025-0041', subject: 'ตอบคำถามทางเทคนิคเรื่องระบบ HVAC', project: 'DIB-Retrofit', requester: 'Sutthida M.', category: 'ข้อมูลเทคนิค', priority: 'low', due: '26 พ.ค. 2568', status: 'done', assignee: 'Jirawat P.' },
    { id: 'SUP-2025-0040', subject: 'ขอข้อมูล Supplier ระบบ Solar', project: 'DIB-Solar Farm', requester: 'Kannika S.', category: 'หาข้อมูล', priority: 'medium', due: '25 พ.ค. 2568', status: 'approved', assignee: 'Nattapol K.' },
    { id: 'SUP-2025-0039', subject: 'จัดหาตัวอย่างวัสดุ (Material Sample)', project: 'DIB-Office Building', requester: 'Jirawat P.', category: 'ประสานงาน', priority: 'low', due: '24 พ.ค. 2568', status: 'cancelled', assignee: 'Sutthida M.' },
    { id: 'SUP-2025-0038', subject: 'ตรวจสอบเงื่อนไขการรับประกัน', project: 'DIB-Warehouse', requester: 'Nattapol K.', category: 'ตรวจสอบเอกสาร', priority: 'medium', due: '23 พ.ค. 2568', status: 'pending', assignee: 'Kannika S.' },
  ],

  documents: [
    { name:'Company Profile 2026.pdf', type:'PDF', size:'2.4 MB', updated:'15/04/2026', by:'Admin' },
    { name:'Price List Q2-2026.xlsx', type:'Excel', size:'540 KB', updated:'10/04/2026', by:'Finance' },
    { name:'Proposal Template v3.docx', type:'Word', size:'1.1 MB', updated:'08/04/2026', by:'Sales' },
    { name:'NDA Standard.pdf', type:'PDF', size:'320 KB', updated:'01/04/2026', by:'Legal' },
    { name:'Technical Brochure.pdf', type:'PDF', size:'5.8 MB', updated:'20/03/2026', by:'Marketing' },
  ],

  skills: [
    { name:'Cloud Architecture', level: 85 },
    { name:'Data Analytics', level: 72 },
    { name:'Project Management', level: 90 },
    { name:'Cybersecurity', level: 60 },
    { name:'AI / ML', level: 55 },
    { name:'DevOps', level: 78 },
  ],

  employees: [],

  workshops: [
    { date:'22/04/2026', title:'Workshop: AI Tools for Sales', trainer:'External', participants: 12, status:'upcoming' },
    { date:'15/04/2026', title:'Core Value Alignment Session', trainer:'HR Team', participants: 30, status:'done' },
    { date:'08/04/2026', title:'Technical Training: Cloud Security', trainer:'AWS Partner', participants: 8, status:'done' },
    { date:'01/05/2026', title:'Leadership Development Program', trainer:'Consultant', participants: 6, status:'planned' },
    { date:'15/05/2026', title:'Customer Success Strategies', trainer:'Sales Lead', participants: 15, status:'planned' },
  ],

  careerPaths: [
    { role:'Junior Developer', level: 1, req:'HTML, CSS, JS Basics, Git' },
    { role:'Developer', level: 2, req:'React/Vue, REST API, Unit Test' },
    { role:'Senior Developer', level: 3, req:'System Design, Code Review, Mentoring' },
    { role:'Tech Lead', level: 4, req:'Architecture, Team Lead, Agile' },
    { role:'CTO / Director', level: 5, req:'Strategy, Budget, Stakeholder Mgmt' },
  ],

  products: [
    { id: 'PS001', name: 'Solar Installation System', category: 'Energy Solution', revenue: 4200000, projects: 12, customers: 8, usage: 82, status: 'active', desc: 'บริการออกแบบ ติดตั้ง และบำรุงรักษาระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์แบบครบวงจรสำหรับธุรกิจและโรงงาน', img: 'https://images.unsplash.com/photo-1509391366360-fe5bb650582d?auto=format&fit=crop&q=80&w=400', updated: '20 พ.ค. 2568' },
    { id: 'PS002', name: 'IT Infrastructure', category: 'Technology Solution', revenue: 2800000, projects: 8, customers: 6, usage: 75, status: 'active', desc: 'บริการออกแบบและติดตั้งระบบโครงสร้างพื้นฐานด้านไอที และระบบเครือข่ายสำหรับองค์กร', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=400', updated: '19 พ.ค. 2568' },
    { id: 'PS003', name: 'Business Consulting', category: 'Consulting Service', revenue: 2150000, projects: 18, customers: 15, usage: 78, status: 'active', desc: 'บริการให้คำปรึกษาด้านกลยุทธ์องค์กร การบริหารจัดการ และเพิ่มประสิทธิภาพการดำเนินงาน', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400', updated: '18 พ.ค. 2568' },
    { id: 'PS004', name: 'Preventive Maintenance', category: 'Maintenance Service', revenue: 1350000, projects: 14, customers: 10, usage: 68, status: 'maintenance', desc: 'บริการบำรุงรักษาเชิงป้องกัน ตรวจเช็คระบบ และเครื่องจักรตามแผน เพื่อยืดอายุการใช้งาน', img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400', updated: '17 พ.ค. 2568' },
    { id: 'PS005', name: 'Security System', category: 'Security Solution', revenue: 950000, projects: 7, customers: 5, usage: 70, status: 'active', desc: 'บริการออกแบบ ติดตั้ง และดูแลระบบรักษาความปลอดภัย กล้องวงจรปิด และระบบควบคุมการเข้า-ออก', img: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?auto=format&fit=crop&q=80&w=400', updated: '16 พ.ค. 2568' },
    { id: 'PS006', name: 'Other Services', category: 'Others', revenue: 700000, projects: 5, customers: 4, usage: 45, status: 'active', desc: 'บริการอื่นๆ ที่เกี่ยวข้องกับการดำเนินงานและการบริหารจัดการภายในองค์กร', img: 'https://images.unsplash.com/photo-1454165833767-02a698d1316d?auto=format&fit=crop&q=80&w=400', updated: '15 พ.ค. 2568' },
  ],

  costEstimates: [
    { id: 'CE-2025-0042', name: 'Solar Rooftop 500kW', project: 'DIB-Solar Factory', customer: 'บริษัท พลังงาน จำกัด', category: 'งานระบบโซลาร์', value: 3450000, status: 'inprog', created: '20 พ.ค. 2568', due: '31 พ.ค. 2568', owner: 'Nattapol K.' },
    { id: 'CE-2025-0041', name: 'Electrical System Upgrade', project: 'DIB-Office Building', customer: 'บริษัท ดีไซน์บิลด์-ดีเวลลอปเม้นท์', category: 'งานระบบไฟฟ้า', value: 2950000, status: 'approved', created: '19 พ.ค. 2568', due: '30 พ.ค. 2568', owner: 'Kannika S.' },
    { id: 'CE-2025-0040', name: 'HVAC System', project: 'DIB-Warehouse', customer: 'บริษัท โลจิสติกส์ อินโนเวท', category: 'งานระบบเครื่องกล', value: 1850000, status: 'inprog', created: '18 พ.ค. 2568', due: '28 พ.ค. 2568', owner: 'Jirawat P.' },
    { id: 'CE-2025-0039', name: 'CCTV & Security System', project: 'DIB-Data Center', customer: 'บริษัท เทคโนโลยี อินโนเวท', category: 'งานระบบไอที', value: 980000, status: 'pending', created: '17 พ.ค. 2568', due: '27 พ.ค. 2568', owner: 'Sutthida M.' },
    { id: 'CE-2025-0038', name: 'Solar Carport 250kW', project: 'DIB-Solar Carport', customer: 'บริษัท กรีน เอ็นเนอร์ยี่ จำกัด', category: 'งานระบบโซลาร์', value: 2150000, status: 'approved', created: '16 พ.ค. 2568', due: '26 พ.ค. 2568', owner: 'Nattapol K.' },
    { id: 'CE-2025-0037', name: 'Generator & ATS System', project: 'DIB-Hospital Project', customer: 'โรงพยาบาลบางนา', category: 'งานระบบไฟฟ้า', value: 1620000, status: 'inprog', created: '15 พ.ค. 2568', due: '25 พ.ค. 2568', owner: 'Phisit T.' },
    { id: 'CE-2025-0036', name: 'Fire Alarm System', project: 'DIB-Office Building', customer: 'บริษัท ดีไซน์บิลด์-ดีเวลลอปเม้นท์', category: 'งานระบบไอที', value: 750000, status: 'cancelled', created: '14 พ.ค. 2568', due: '24 พ.ค. 2568', owner: 'Kannika S.' },
    { id: 'CE-2025-0035', name: 'Plumbing System', project: 'DIB-Warehouse', customer: 'บริษัท โลจิสติกส์ อินโนเวท', category: 'งานระบบเครื่องกล', value: 920000, status: 'pending', created: '13 พ.ค. 2568', due: '23 พ.ค. 2568', owner: 'Jirawat P.' },
  ],

  leaveStats: {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    peopleOnLeave: 0,
    totalDays: 0
  },
  leaveRequests: []
};

window.loadDetailEmployees = async function() {
  try {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIZCYw5SXao0JSAqonVxudnfjIAAJv94yvR88HxlNcPWSyz_oxyZdoYRi3JYliJ4mNxjnq_oUYmW5S/pub?gid=0&single=true&output=csv';
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n');
    if (lines.length > 1) {
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const newEmployees = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        let rowData = [];
        let inQuotes = false;
        let current = '';
        for (let char of lines[i]) {
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) { rowData.push(current.trim()); current = ''; }
            else current += char;
        }
        rowData.push(current.trim());
        rowData = rowData.map(c => c.replace(/^"|"$/g, ''));
        let emp = {};
        headers.forEach((h, idx) => { emp[h] = rowData[idx] || ''; });
        const lowerEmp = {};
        Object.keys(emp).forEach(k => { lowerEmp[k.toLowerCase()] = emp[k]; });
        emp.name = lowerEmp['name'] || lowerEmp['ชื่อ-นามสกุล'] || lowerEmp['ชื่อ-สกุล'] || lowerEmp['ชื่อ'] || emp[Object.keys(emp)[0]] || 'Unknown';
        emp.pos = lowerEmp['position'] || lowerEmp['ตำแหน่ง'] || lowerEmp['pos'] || lowerEmp['job title'] || '';
        emp.dept = lowerEmp['department'] || lowerEmp['แผนก'] || lowerEmp['สังกัด'] || lowerEmp['dept'] || lowerEmp['team'] || '';
        emp.nickname = lowerEmp['nickname'] || lowerEmp['ชื่อเล่น'] || '';
        emp.nameEn = lowerEmp['name (eng)'] || lowerEmp['name_en'] || lowerEmp['english name'] || lowerEmp['nameen'] || '';
        newEmployees.push(emp);
      }
      DATA.employees = newEmployees;
      console.log('Loaded', newEmployees.length, 'employees from Detail sheet.');
      // Debug: log first few nameEn values to verify proper loading
      if (newEmployees.length > 0) {
        console.log('Sample nameEn values:', newEmployees.slice(0,3).map(e => ({id:e.id, nameEn:e.nameEn})));
      }
    }
  } catch(e) { console.error("Failed to load Detail sheet:", e); }
};

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
    if (emp.nickname && emp.nickname !== '-' && emp.nickname.trim() !== '') {
      return emp.nickname.trim();
    }
    const targetName = (emp.nameEn && emp.nameEn !== '-') ? emp.nameEn : emp.name;
    const parts = targetName.trim().split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
    }
    return parts[0];
  }
  
  if (empOrName && typeof empOrName === 'string') {
    const cleanName = empOrName.trim();
    if (/^[A-Za-z\s]+$/.test(cleanName)) {
      const parts = cleanName.split(/\s+/);
      if (parts.length > 1) {
        return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
      }
      return parts[0];
    }
    return cleanName.split(' ')[0];
  }
  
  return '-';
};

window.DATA = window.DATA || {};
window.GAS_URL_PERMISSIONS = 'https://script.google.com/macros/s/AKfycbyYxEwn7rjqLSoDdb50Tl9nj7MQjgvn8iI77tokOgPWYsXOWcc9ljHsyUq1uY7iOMsU/exec';
window.PERMISSIONS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1a5nLyclYZwFUlauF4lXNwv9X2i_6xQQSFJCnOXuyJVE/export?format=csv&gid=1248107333';

window.loadPermissions = async function() {
    if (!window.PERMISSIONS_CSV_URL) return;
    try {
        const response = await fetch(window.PERMISSIONS_CSV_URL);
        const text = await response.text();
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.error("Permissions Sync: Received HTML instead of CSV. Please check the Google Sheet Publish URL.");
            return;
        }
        const lines = text.split('\n');
        if (lines.length < 2) return;
        
        const newPerms = {};
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            let rowData = [];
            let inQuotes = false;
            let current = '';
            for (let char of lines[i]) {
                if (char === '"') inQuotes = !inQuotes;
                else if (char === ',' && !inQuotes) { rowData.push(current); current = ''; }
                else current += char;
            }
            rowData.push(current);
            rowData = rowData.map(c => c.trim().replace(/^"|"$/g, ''));
            
            const role = (rowData[0] || '').toLowerCase(); // First column: Email or Role
            if (!role) continue;
            
            newPerms[role] = {};
            for (let j = 1; j < headers.length; j++) {
                const pageKey = headers[j];
                const val = (rowData[j] || '').toUpperCase();
                if (['TRUE', 'YES', '1', 'Y', 'OK', 'T', '✓', 'X', 'TRUE\r'].includes(val.replace(/\r$/, ''))) {
                    newPerms[role][pageKey.replace(/\r$/, '')] = true;
                }
            }
        }
        
        // Only override if we parsed something
        if (Object.keys(newPerms).length > 0) {
            DATA.permissions = newPerms;
            console.log("Permissions loaded from Google Sheet:", DATA.permissions);
            try {
                localStorage.setItem('DIB_PERMS_CACHE', JSON.stringify(DATA.permissions));
            } catch(e) {}
        }
    } catch(e) {
        console.error("Failed to load permissions:", e);
    }
};

try {
    const cachedPerms = localStorage.getItem('DIB_PERMS_CACHE');
    if (cachedPerms) {
        DATA.permissions = JSON.parse(cachedPerms);
        console.log("Permissions preloaded from cache.");
    }
} catch(e) {}





// ===== SYSTEM PERMISSIONS =====
DATA.permissions = {
  "all": {},
  "manager": {
    "structure-team": true,
    "employee": true,
    "leave-management": true,
    "workship": true,
    "schedule": true,
    "project-scope-portal": true,
    "qc-realcyber-plan": true,
    "public-holiday": true
  },
  "director": {
    "structure-team": true,
    "employee": true,
    "leave-management": true,
    "workship": true,
    "schedule": true,
    "project-scope-portal": true,
    "qc-realcyber-plan": true,
    "public-holiday": true
  },
  "assistant manager": {
    "employee": true,
    "leave-management": true,
    "workship": true,
    "schedule": true,
    "project-scope-portal": true,
    "qc-realcyber-plan": true,
    "public-holiday": true,
    "structure-team": true
  },
  "senior": {
    "company-system": false,
    "learning-skills": false,
    "career-path": false,
    "core-values": false,
    "product-service": false,
    "structure-team": true,
    "employee": true,
    "leave-management": true,
    "workship": true,
    "schedule": true,
    "project-scope-portal": true,
    "qc-realcyber-plan": true,
    "public-holiday": true
  },
  "junior": {}
};