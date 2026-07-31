// ===== QC REALCYBER PLAN =====

// --- State ---
window.QC_PLANS = window.QC_PLANS || [];
window._qcDateRange = window._qcDateRange || '';
window._qcSearch = window._qcSearch || '';
window._qcTeamFilter = window._qcTeamFilter || '';

window.QC_GAMBLING_SUBCATS = [
  'ฟุตบอล', 'บาคาร่า', 'สล็อต', 'หวย', 'ไก่ชน', 
  'หวยต่างประเทศ', 'ชกมวย', 'ไฮโลว์', 'ไพ่นอกกระจอก ไพ่', 
  'คาสิโน (พนันออนไลน์)', 'โฆษณาพนัน'
];

window.QC_MAIN_CATEGORIES = [
  'Hate Speech', 'จัดหาแรงงานเถื่อน', 'ดูหมิ่นสถาบัน', 'อาวุธปืน',
  'กระท่อม', 'โฆษณาแอลกอฮอล์', 'หลอกลวง', 'ลามก', 'กัญชา', 'บุหรี่ไฟฟ้า',
  'ค้าประเวณี', 'ลิขสิทธิ์ภาพยนตร์', 'โดเมนการรับตั้งครรภ์แทน', 'โดเมนศาสนา',
  'โดเมนเงินกู้เรียกดอกเบี้ยเกินอัตรา', 'โดเมนรับทำเอกสารปลอม', 'โดเมนเด็กและเยาวชน'
];

window.QC_CATEGORIES = [
  ...window.QC_GAMBLING_SUBCATS,
  ...window.QC_MAIN_CATEGORIES
];

window.DEFAULT_QC_RATES_V2 = {"default":{"qc1":1,"qc1_conf70":1,"qc1_conf0":1,"qc1_url":1,"qc2":1,"qc2_conf70":1,"qc2_conf0":1,"qc2_url":1,"manual":1},"พนันรวม_Website":{"qc1":"","qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":""},"พนันรวม_Social":{"qc1":"","qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":""},"ฟุตบอล_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"ฟุตบอล_Social":{"qc1":0.2,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.1,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"บาคาร่า_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"บาคาร่า_Social":{"qc1":0.2,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.1,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"สล็อต_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"สล็อต_Social":{"qc1":0.2,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.1,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"หวย_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"หวย_Social":{"qc1":0.2,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.1,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"ไก่ชน_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"ไก่ชน_Social":{"qc1":0.2,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.1,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"หวยต่างประเทศ_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"หวยต่างประเทศ_Social":{"qc1":0.2,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.1,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"ชกมวย_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"ชกมวย_Social":{"qc1":0.2,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.1,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"ไฮโลว์_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"ไฮโลว์_Social":{"qc1":0.2,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.1,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"ไพ่นอกกระจอก ไพ่_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"ไพ่นอกกระจอก ไพ่_Social":{"qc1":0.2,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.1,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"คาสิโน (พนันออนไลน์)_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"คาสิโน (พนันออนไลน์)_Social":{"qc1":0.2,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.1,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"โฆษณาพนัน_Website":{"qc1":0.0065,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"โฆษณาพนัน_Social":{"qc1":0.2,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.1,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"Hate Speech_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0},"Hate Speech_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0},"จัดหาแรงงานเถื่อน_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0},"จัดหาแรงงานเถื่อน_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0},"ดูหมิ่นสถาบัน_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0},"ดูหมิ่นสถาบัน_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0},"อาวุธปืน_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"อาวุธปืน_Social":{"qc1":0.17,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.081,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"กระท่อม_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"กระท่อม_Social":{"qc1":0.17,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.081,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"โฆษณาแอลกอฮอล์_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"โฆษณาแอลกอฮอล์_Social":{"qc1":0.17,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.081,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"หลอกลวง_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"หลอกลวง_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"ลามก_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"ลามก_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"กัญชา_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"กัญชา_Social":{"qc1":0.17,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.081,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"บุหรี่ไฟฟ้า_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"บุหรี่ไฟฟ้า_Social":{"qc1":0.17,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.081,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"ค้าประเวณี_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"ค้าประเวณี_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"ลิขสิทธิ์ภาพยนตร์_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0},"ลิขสิทธิ์ภาพยนตร์_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0},"โดเมนการรับตั้งครรภ์แทน_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"โดเมนการรับตั้งครรภ์แทน_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"โดเมนศาสนา_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"โดเมนศาสนา_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"โดเมนเงินกู้เรียกดอกเบี้ยเกินอัตรา_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"โดเมนเงินกู้เรียกดอกเบี้ยเกินอัตรา_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"โดเมนรับทำเอกสารปลอม_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"โดเมนรับทำเอกสารปลอม_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065},"โดเมนเด็กและเยาวชน_Website":{"qc1":0.09,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":"","qc2_conf70":0.026,"qc2_conf0":0.017,"qc2_url":0.003,"manual":0.087},"โดเมนเด็กและเยาวชน_Social":{"qc1":0.13,"qc1_conf70":"","qc1_conf0":"","qc1_url":"","qc2":0.065,"qc2_conf70":"","qc2_conf0":"","qc2_url":"","manual":0.065}};

// --- Helpers ---
const thaiHolidays = {
  '1-1': 'วันขึ้นปีใหม่', '2-10': 'วันมาฆบูชา', '4-6': 'วันจักรี', '4-13': 'วันสงกรานต์', '4-14': 'วันสงกรานต์', '4-15': 'วันสงกรานต์',
  '5-1': 'วันแรงงานแห่งชาติ', '5-4': 'วันฉัตรมงคล', '5-12': 'วันวิสาขบูชา', '6-3': 'วันเฉลิมพระชนมพรรษา สมเด็จพระราชินี',
  '7-10': 'วันอาสาฬหบูชา', '7-11': 'วันเข้าพรรษา', '7-28': 'วันเฉลิมพระชนมพรรษา ร.10', '8-12': 'วันเฉลิมพระชนมพรรษา สมเด็จพระบรมราชชนนี / วันแม่',
  '10-13': 'วันคล้ายวันสวรรคต ร.9', '10-23': 'วันปิยมหาราช', '12-5': 'วันคล้ายวันพระบรมราชสมภพ ร.9 / วันพ่อ', '12-10': 'วันรัฐธรรมนูญ', '12-31': 'วันสิ้นปี'
};
function qcIsThaiHoliday(dateObj) {
  if (!dateObj) return null;
  const key = `${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
  if (window.HOLIDAYS && window.HOLIDAYS[key]) return window.HOLIDAYS[key];
  return thaiHolidays[key] || null;
}

function qcGetWeekDates(fromStr, toStr) {
  const enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  let start;
  if (fromStr) {
    start = new Date(fromStr);
  } else {
    // Default: current week (Saturday start)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
    start = new Date(now);
    start.setDate(now.getDate() - diff);
  }
  
  let numDays = 7;
  if (fromStr && toStr) {
    const end = new Date(toStr);
    numDays = Math.min(Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1, 14);
    if (numDays < 1) numDays = 7;
  }

  const dates = [];
  const todayStr = new Date().toISOString().split('T')[0];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    dates.push({
      iso: iso,
      dayName: enDays[d.getDay()],
      label: `${d.getDate()} ${enMonths[d.getMonth()]}`,
      isToday: iso === todayStr,
      dateObj: d,
      dayIdx: d.getDay()
    });
  }
  return dates;
}

function qcGetEmployees() {
  if (typeof DATA !== 'undefined' && DATA.employees && DATA.employees.length > 0) {
    return DATA.employees.filter(e => e.status !== 'resigned' && e.status !== 'inactive');
  }
  return [];
}

function qcGroupPlans(plans, dates) {
  // Group by person -> qcType -> channel -> { date: cases }
  const grouped = {};
  plans.forEach(p => {
    const key = `${p.name}|||${p.qcType || ''}|||${p.channel || ''}|||${p.category || ''}`;
    if (!grouped[key]) {
      grouped[key] = { name: p.name, qcType: p.qcType || '', channel: p.channel || '', category: p.category || '', dateCases: {}, targetCases: 0 };
    }
    grouped[key].dateCases[p.date] = (grouped[key].dateCases[p.date] || 0) + p.cases;
    if (p.targetCases) {
      grouped[key].targetCases = Math.max(grouped[key].targetCases, p.targetCases);
    }
  });
  return Object.values(grouped);
}

// --- Main Render ---
window.renderQCWorkPlanDashboard = function() {
  setTimeout(() => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initQCDashboard();
  }, 80);

  // Parse date range
  let fromStr = '', toStr = '';
  if (window._qcDateRange && window._qcDateRange.includes(' to ')) {
    const parts = window._qcDateRange.split(' to ');
    fromStr = parts[0];
    toStr = parts[1];
  }

  const dates = qcGetWeekDates(fromStr, toStr);
  const plans = window.QC_PLANS || [];

  // Filter plans to date range and ensure Manual plans strictly have valid channels (Website/Social only)
  const dateSet = new Set(dates.map(d => d.iso));
  let filteredPlans = fromStr ? plans.filter(p => dateSet.has(p.date)) : plans;
  filteredPlans = filteredPlans.filter(p => {
    if ((p.qcType || '').toLowerCase().includes('manual')) {
      const ch = (p.channel || '').toLowerCase();
      return ch === 'website' || ch === 'social';
    }
    return true;
  });
  
  // Group plans by person+qcType+channel+category (needed for stats/charts and legacy compat)
  const grouped = qcGroupPlans(filteredPlans, dates);

  // Stats
  const totalCases = filteredPlans.reduce((s, p) => s + p.cases, 0);
  const websiteCases = filteredPlans.filter(p => (p.channel || '').toLowerCase().includes('website')).reduce((s, p) => s + p.cases, 0);
  const socialCases = filteredPlans.filter(p => (p.channel || '').toLowerCase().includes('social')).reduce((s, p) => s + p.cases, 0);
  const qc1Cases = filteredPlans.filter(p => (p.qcType || '').toLowerCase().includes('qc1') || (p.qcType || '').includes('1')).reduce((s, p) => s + p.cases, 0);
  const qc2Cases = filteredPlans.filter(p => (p.qcType || '').toLowerCase().includes('qc2') || (p.qcType || '').includes('2')).reduce((s, p) => s + p.cases, 0);
  const manualCases = filteredPlans.filter(p => (p.qcType || '').toLowerCase().includes('manual') && ((p.channel || '').toLowerCase().includes('website') || (p.channel || '').toLowerCase().includes('social'))).reduce((s, p) => s + p.cases, 0);

  // Specific breakdowns for charts
  const qcWebsiteCases = filteredPlans.filter(p => !(p.qcType || '').toLowerCase().includes('manual') && (p.channel || '').toLowerCase().includes('website')).reduce((s, p) => s + p.cases, 0);
  const qcSocialCases = filteredPlans.filter(p => !(p.qcType || '').toLowerCase().includes('manual') && (p.channel || '').toLowerCase().includes('social')).reduce((s, p) => s + p.cases, 0);
  const totalQcCases = qcWebsiteCases + qcSocialCases;

  const qc1WebCases = filteredPlans.filter(p => ((p.qcType || '').toLowerCase().includes('qc1') || (p.qcType || '').includes('1')) && (p.channel || '').toLowerCase().includes('website')).reduce((s, p) => s + p.cases, 0);
  const qc1SocialCases = filteredPlans.filter(p => ((p.qcType || '').toLowerCase().includes('qc1') || (p.qcType || '').includes('1')) && (p.channel || '').toLowerCase().includes('social')).reduce((s, p) => s + p.cases, 0);
  const qc2WebCases = filteredPlans.filter(p => ((p.qcType || '').toLowerCase().includes('qc2') || (p.qcType || '').includes('2')) && (p.channel || '').toLowerCase().includes('website')).reduce((s, p) => s + p.cases, 0);
  const qc2SocialCases = filteredPlans.filter(p => ((p.qcType || '').toLowerCase().includes('qc2') || (p.qcType || '').includes('2')) && (p.channel || '').toLowerCase().includes('social')).reduce((s, p) => s + p.cases, 0);

  const manualWebCases = filteredPlans.filter(p => (p.qcType || '').toLowerCase().includes('manual') && (p.channel || '').toLowerCase().includes('website')).reduce((s, p) => s + p.cases, 0);
  const manualSocialCases = filteredPlans.filter(p => (p.qcType || '').toLowerCase().includes('manual') && (p.channel || '').toLowerCase().includes('social')).reduce((s, p) => s + p.cases, 0);
  const totalManualCases = manualWebCases + manualSocialCases;

  let ratesV2 = {};
  try {
    const raw = localStorage.getItem('qc_workload_rates_v2');
    ratesV2 = (raw && raw !== '{}') ? JSON.parse(raw) : window.DEFAULT_QC_RATES_V2;
  } catch(e) {
    ratesV2 = window.DEFAULT_QC_RATES_V2;
  }

  // Compute category breakdown
  const categoryBreakdown = {};
  filteredPlans.forEach(p => {
    const cat = p.category || 'ไม่ระบุ';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + p.cases;
  });
  const catEntries = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);

  // leave requests
  const leavesByPersonDay = {};
  if (typeof DATA !== 'undefined' && Array.isArray(DATA.leaveRequests)) {
    DATA.leaveRequests.forEach(r => {
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

  // Active employees list & group by team
  const activeEmps = qcGetEmployees();
  const realDayMap = { 'อา.': 0, 'จ.': 1, 'อ.': 2, 'พ.': 3, 'พฤ.': 4, 'ศ.': 5, 'ส.': 6, 'อาทิตย์': 0, 'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัสบดี': 4, 'ศุกร์': 5, 'เสาร์': 6 };
  
  const empMap = {};
  activeEmps.forEach(e => {
    const offdaysStr = e.offdays || '';
    const offDays = offdaysStr.split(/[,|\-]/).map(d => realDayMap[d.trim().replace('วัน', '')]).filter(v => v !== undefined);
    
    empMap[e.name] = {
      id: e.id,
      name: e.name,
      nameEn: e.nameEn || '',
      nickname: e.nickname || '',
      pos: e.pos || 'Staff',
      shift: e.shift || '-',
      offdays: e.offdays || '-',
      dept: e.dept || 'Other',
      offDays: offDays
    };
  });

  // Collect external names from plan list
  filteredPlans.forEach(plan => {
    if (!plan.name) return;
    if (empMap[plan.name]) return;

    const tPerson = plan.name.trim().toLowerCase();
    const matchedEmp = activeEmps.find(e => 
      e.name.trim().toLowerCase() === tPerson ||
      (e.nameEn && e.nameEn.trim().toLowerCase() === tPerson) ||
      (e.nickname && e.nickname.trim().toLowerCase() === tPerson) ||
      e.id.trim().toLowerCase() === tPerson
    );

    if (matchedEmp) {
      empMap[plan.name] = {
        id: matchedEmp.id,
        name: matchedEmp.name,
        nameEn: matchedEmp.nameEn || '',
        nickname: matchedEmp.nickname || '',
        pos: matchedEmp.pos || 'Staff',
        shift: matchedEmp.shift || '-',
        offdays: matchedEmp.offdays || '-',
        dept: matchedEmp.dept || 'Other',
        offDays: matchedEmp.offDays || []
      };
    } else {
      empMap[plan.name] = {
        id: 'QC-' + plan.name,
        name: plan.name,
        nameEn: plan.name,
        nickname: '',
        pos: 'Staff',
        shift: '-',
        offdays: '-',
        dept: 'Other',
        offDays: []
      };
    }
  });

  // Group into departments
  const deptGroups = {};
  
  // Get hidden employees from localStorage
  let hiddenEmps = [];
  try {
    hiddenEmps = JSON.parse(localStorage.getItem('qc_hidden_employees') || '[]');
  } catch(e) {}

  Object.values(empMap).forEach(e => {
    // Check hidden list
    if (hiddenEmps.includes(e.id)) return;

    // Apply search and team filters
    const searchStr = window._qcSearch || '';
    const teamFilter = window._qcTeamFilter || '';

    if (teamFilter && e.dept !== teamFilter) return;

    if (searchStr) {
      const matchName = e.name && e.name.toLowerCase().includes(searchStr);
      const matchNameEn = e.nameEn && e.nameEn.toLowerCase().includes(searchStr);
      const matchNickname = e.nickname && e.nickname.toLowerCase().includes(searchStr);
      if (!(matchName || matchNameEn || matchNickname)) return;
    }

    const dept = e.dept || 'Other';
    if (!deptGroups[dept]) deptGroups[dept] = [];
    deptGroups[dept].push(e);
  });

  // Get employee custom sort order from localStorage (stored as {id: index} map)
  let empOrderMap = {};
  try {
    const stored = JSON.parse(localStorage.getItem('qc_employee_order') || '{}');
    // Handle old array format for backward compat
    if (Array.isArray(stored)) {
      stored.forEach((id, idx) => { empOrderMap[id] = idx; });
    } else {
      empOrderMap = stored;
    }
  } catch(e) {}

  // Sort department groups
  const teamsOrder = ['ACE', 'Sertec', 'ONIX', 'Sale Support', 'Call Center', 'Other'];
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
      name: dept === 'Other' ? 'อื่นๆ / ไม่ระบุทีม' : dept,
      members: deptGroups[dept].sort((a, b) => {
        const idxA = empOrderMap[a.id];
        const idxB = empOrderMap[b.id];
        if (idxA !== undefined && idxB !== undefined) return idxA - idxB;
        if (idxA !== undefined) return -1;
        if (idxB !== undefined) return 1;
        return (a.rank || 999) - (b.rank || 999);
      })
    }));

  // Build table rows
  let tableRows = '';
  let totalEntriesCount = 0;

  if (teams.length === 0) {
    tableRows = `<tr><td colspan="${dates.length + 1}" style="text-align:center; color:#94a3b8; padding:40px; font-size:0.9rem; background:#fff;">
      <i data-lucide="inbox" style="width:40px; height:40px; margin-bottom:8px; opacity:0.5;"></i><br>
      ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไขตัวกรอง
    </td></tr>`;
  } else {
    teams.forEach(team => {
      totalEntriesCount += team.members.length;
      
      // Team row divider
      tableRows += `
        <tr style="background:#f1f5f9">
          <td style="padding:10px 20px; font-size:.78rem; font-weight:700; color:#334155; border-bottom:2px solid #e4e8ef; border-right:1px solid #e4e8ef; position:sticky; left:0; z-index:15; background:#f1f5f9; white-space:nowrap; box-shadow: 2px 0 5px rgba(0,0,0,0.05)">
            <div style="display:flex; align-items:center; gap:8px">
              <div style="width:4px; height:18px; border-radius:4px; background:${window.getTeamColor ? window.getTeamColor(team.name) : '#64748b'}"></div>
              <i data-lucide="users" style="width:13px; height:13px; color:${window.getTeamColor ? window.getTeamColor(team.name) : '#64748b'}"></i>
              <span style="letter-spacing:.3px">${team.name}</span>
              <span style="font-size:.65rem; color:#64748b; font-weight:400">(${team.members.length} คน)</span>
            </div>
          </td>
          <td colspan="${dates.length}" style="border-bottom:2px solid #e4e8ef; background:#f1f5f9"></td>
        </tr>
      `;

      team.members.forEach(p => {
        const tCol = window.getTeamColor ? window.getTeamColor(team.name) : '#64748b';
        const posBg = window.getPosBgColor ? window.getPosBgColor(p.pos) : '#f1f5f9';
        const posText = window.getPosTextColor ? window.getPosTextColor(p.pos) : '#64748b';

        // English Name Formatting (First Name + Last Initial)
        const line1 = window.getEmployeeDisplayName(p);

        const avatarText = (p.nickname && p.nickname !== '-' ? p.nickname : p.name.trim().split(/\s+/)[0]);

        // Aggregate actual and target cases
        const memberPlans = filteredPlans.filter(plan => plan.name === p.name);
        const memberGroups = {};
        memberPlans.forEach(plan => {
          const gKey = `${plan.qcType || ''}|||${plan.channel || ''}|||${plan.category || ''}`;
          if (!memberGroups[gKey]) {
            memberGroups[gKey] = {
              qcType: plan.qcType || '',
              channel: plan.channel || '',
              category: plan.category || '',
              cases: 0,
              targetCases: 0
            };
          }
          memberGroups[gKey].cases += plan.cases;
          if (plan.targetCases) {
            memberGroups[gKey].targetCases = Math.max(memberGroups[gKey].targetCases, plan.targetCases);
          }
        });

        const totalActual = Object.values(memberGroups).reduce((s, g) => s + g.cases, 0);
        const totalTarget = Object.values(memberGroups).reduce((s, g) => s + g.targetCases, 0);

        let percentStr = '-';
        let percentBadgeColor = '#64748b';
        let percentBgColor = '#f1f5f9';

        if (totalTarget > 0) {
          const pct = Math.round((totalActual / totalTarget) * 100);
          percentStr = `${pct}%`;
          if (pct >= 100) {
            percentBadgeColor = '#15803d';
            percentBgColor = '#dcfce7';
          } else if (pct >= 50) {
            percentBadgeColor = '#1d4ed8';
            percentBgColor = '#dbeafe';
          } else {
            percentBadgeColor = '#b45309';
            percentBgColor = '#fef3c7';
          }
        }

        // Render Row
        tableRows += `
          <tr style="background:#fff">
            <!-- Employee Header Cell Sticky -->
            <td style="padding:10px 16px; border-bottom:1px solid #e4e8ef; border-right:1px solid #e4e8ef; background:#fff; position:sticky; left:0; z-index:11; box-shadow: 2px 0 5px rgba(0,0,0,0.03)">
              <div style="display:flex; align-items:center; gap:12px">
                <div style="width:46px; height:46px; border-radius:50%; background:${tCol}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.7rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); flex-shrink:0; text-align:center; padding:2px; overflow:hidden; word-break:break-all">
                  ${avatarText}
                </div>
                <div style="min-width:0; flex:1">
                  <div style="font-size:.85rem; font-weight:700; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${line1}</div>
                  <div style="display:inline-block; padding:2px 10px; border-radius:99px; background:${posBg}; color:${posText}; border:1px solid rgba(0,0,0,0.05); font-size:0.6rem; font-weight:700; margin:3px 0; text-transform:uppercase">${p.pos}</div>
                  <div style="display:flex; align-items:center; gap:4px; font-size:0.62rem; color:#64748b; font-weight:500">
                    <i data-lucide="clock" style="width:11px; height:11px"></i> ${p.shift || '-'}
                  </div>
                  <div style="display:flex; align-items:center; gap:4px; font-size:0.62rem; color:#64748b; font-weight:400; text-transform:uppercase; margin-top:2px">
                    <i data-lucide="calendar-x" style="width:11px; height:11px"></i> ${p.offdays || '-'}
                  </div>
                </div>
              </div>
            </td>
        `;

        // Render Date Cells
        dates.forEach(d => {
          const isWeekend = d.dayIdx === 0 || d.dayIdx === 6;
          const isOff = p.offDays.includes(d.dayIdx);
          const isHoliday = !!qcIsThaiHoliday(d.dateObj);
          
          const leave = leavesByPersonDay[`${p.name.trim().toLowerCase()}_${d.iso}`] ||
                        leavesByPersonDay[`${p.nameEn.trim().toLowerCase()}_${d.iso}`];

          const cellBg = isOff ? '#f1f5f9' : (isHoliday ? '#fff1f2' : (isWeekend ? '#f8fafc' : '#fff'));
          
          const dayPlans = filteredPlans.filter(plan => plan.name === p.name && plan.date === d.iso);
          const scheduleTasks = (window.SCHEDULE_TASKS || []).filter(t => {
            if (t.date !== d.iso) return false;
            const empName = p.name?.trim().toLowerCase();
            const empNick = p.nickname?.trim().toLowerCase();
            const empNameEn = p.nameEn?.trim().toLowerCase();
            const tPerson = (t.person || '').trim().toLowerCase();
            const tPersonId = (p.id || '').trim().toLowerCase();
            const tOldName = (t.oldName || '').trim().toLowerCase();
            return tPerson === tPersonId || tPerson === empName || tPerson === empNick || tPerson === empNameEn || tOldName === empName || tOldName === empNick || tOldName === empNameEn;
          });

          let cellContent = '';
          let totalPct = 0;

          if (leave) {
            const leaveTypeMap = {
              'ลาพักร้อน': { label: 'Vacation Leave', color: '#0ea5e9' },
              'ลากิจ': { label: 'Business Leave', color: '#f97316' },
              'ลาป่วย': { label: 'Sick Leave', color: '#ef4444' },
              'วันหยุดชดเชย': { label: 'Compensatory', color: '#10b981' },
              'ลาคลอด / ลาเลี้ยงดูบุตร': { label: 'Maternity Leave', color: '#8b5cf6' },
              'ลาเพื่อการฌาปนกิจศพ': { label: 'Compassionate', color: '#64748b' },
              'อบรม / สัมมนา': { label: 'Training', color: '#14b8a6' },
            };
            const lvInfo = leaveTypeMap[leave.type] || { label: leave.type || 'On Leave', color: '#635BFF' };
            const tasksCount = dayPlans.length + scheduleTasks.length;
            const tasksText = tasksCount > 0 ? `<div style="font-size:0.5rem; color:#94a3b8; margin-top:2px;">${tasksCount} task(s) scheduled</div>` : '';
            
            cellContent = `
              <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; height:100%; min-height:40px; padding:4px;">
                <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
                  <div style="font-size:0.68rem; font-weight:800; color:${lvInfo.color}; letter-spacing:0.06em;">ON LEAVE</div>
                  <div style="font-size:0.52rem; color:#fff; font-weight:700; background:${lvInfo.color}; padding:2px 8px; border-radius:99px; letter-spacing:0.04em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px; text-align:center;">${lvInfo.label}</div>
                </div>
                ${tasksText}
              </div>
            `;
          } else if (dayPlans.length > 0 || scheduleTasks.length > 0) {
            const totalItems = dayPlans.length + scheduleTasks.length;
            const limit = 2;
            let renderedCount = 0;

            const qcChips = dayPlans.map(dp => {
              const isQc1 = dp.qcType === 'QC1';
              const isQc2 = dp.qcType === 'QC2';
              const isManual = dp.qcType === 'Manual';
              const dpType = isManual ? 'Manual' : (isQc1 ? 'QC1' : 'QC2');
              const pct = (dp.cases || 0) * (typeof window.qcGetRateForTask === 'function' ? window.qcGetRateForTask(ratesV2, dp.category, dp.channel, dpType) : 0);
              totalPct += pct;

              if (totalItems > limit && renderedCount >= limit) return '';
              renderedCount++;

              let badgeBg = '#f1f5f9';
              let badgeColor = '#64748b';
              let badgeBorder = '1px solid #e2e8f0';
              if (isQc1) { badgeBg = '#eff6ff'; badgeColor = '#1d4ed8'; badgeBorder = '1px solid #bfdbfe'; }
              else if (isQc2) { badgeBg = '#f0fdf4'; badgeColor = '#15803d'; badgeBorder = '1px solid #bbf7d0'; }
              else if (isManual) { badgeBg = '#fffbeb'; badgeColor = '#b45309'; badgeBorder = '1px solid #fde68a'; }
              
              const shortChannel = dp.channel === 'Website' ? 'Web' : (dp.channel === 'Social' ? 'Soc' : dp.channel);
              const channelText = shortChannel && shortChannel !== '-' ? ` (${shortChannel})` : '';
              
              if (!dp.id) dp.id = 'QC-LEGACY-' + Math.random();
              const tooltip = `ประเภท: ${dpType} | ช่องทาง: ${dp.channel} | รายละเอียด: ${dp.category || '-'} | จำนวน: ${(dp.cases || 0).toLocaleString('en-US')} เคส`;
              return `
                <div title="${tooltip}" style="background:${badgeBg}; color:${badgeColor}; border:${badgeBorder}; font-size:0.7rem; font-weight:600; padding:4px 6px; border-radius:6px; margin:1px 0; text-align:left; display:flex; justify-content:space-between; align-items:center; gap:6px; box-shadow:0 1px 2px rgba(0,0,0,0.02); position:relative;" onmouseover="this.querySelector('.del-btn-qc').style.display='flex'" onmouseout="this.querySelector('.del-btn-qc').style.display='none'">
                  <div style="display:flex; flex-direction:column; gap:1px; line-height:1.2; overflow:hidden;">
                    <span>${dpType}${channelText}</span>
                    ${dp.category ? `<span style="font-size:0.58rem; color:#64748b; font-weight:500; white-space:normal; word-break:break-word; margin-top:2px;">${dp.category}</span>` : ''}
                  </div>
                  <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                    ${pct > 0 ? `<span style="background:rgba(0,0,0,0.05); padding:0 4px; border-radius:4px; font-size:0.6rem; flex-shrink:0;">${Math.round(pct)}%</span>` : ''}
                    <span style="font-weight:700; background:rgba(255,255,255,0.7); padding:0px 4px; border-radius:4px; min-width:14px; text-align:center;">${(dp.cases || 0).toLocaleString('en-US')}</span>
                    <button class="del-btn-qc" onclick="qcDeletePlanTask('${dp.id}')" style="display:none; background:none; border:none; cursor:pointer; color:#ef4444; padding:0; align-items:center; justify-content:center;" title="ลบงานนี้">
                      <i data-lucide="x" style="width:12px; height:12px;"></i>
                    </button>
                  </div>
                </div>
              `;
            }).join('');

            const scheduleChips = scheduleTasks.map(t => {
              const proj = (t.acc || '').trim();
              const node = (t.node || '').trim();
              const title = (t.title || '').trim();
              const pct = parseInt(t.hours) || parseInt(t.workload) || parseInt(t.percent) || 0;
              totalPct += pct;

              if (totalItems > limit && renderedCount >= limit) return '';
              renderedCount++;

              const label = [proj, node].filter(Boolean).join(' · ') || title || 'งาน';
              const titleAttr = [proj, node, title].filter(Boolean).join(' / ') + (pct ? ` (${pct}%)` : '');
              return `
                <div title="${titleAttr}" style="background:#f5f3ff; color:#6d28d9; border:1px solid #ddd6fe; font-size:0.65rem; font-weight:600; padding:3px 6px; border-radius:6px; margin:1px 0; display:flex; align-items:center; justify-content:space-between; gap:4px; max-width:100%; position:relative;" onmouseover="this.querySelector('.del-btn').style.display='flex'" onmouseout="this.querySelector('.del-btn').style.display='none'">
                  <div style="display:flex; align-items:center; gap:4px; overflow:hidden; white-space:nowrap;">
                    <i data-lucide="calendar-clock" style="width:10px; height:10px; flex-shrink:0;"></i>
                    <span style="overflow:hidden; text-overflow:ellipsis;">${label}</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:2px;">
                    ${pct ? `<span style="background:rgba(109,40,217,0.1); padding:0 4px; border-radius:4px; font-size:0.6rem; flex-shrink:0; color:#5b21b6;">${pct}%</span>` : ''}
                    <button class="del-btn" onclick="qcDeleteScheduleTask('${t.id}')" style="display:none; background:none; border:none; cursor:pointer; color:#ef4444; padding:0; margin-left:2px; align-items:center; justify-content:center;" title="ลบงานนี้">
                      <i data-lucide="x" style="width:12px; height:12px;"></i>
                    </button>
                  </div>
                </div>
              `;
            }).join('');

            let wlColor = typeof window.getWorkloadColor === 'function' ? window.getWorkloadColor(totalPct) : '#10b981';
            if (typeof window.getWorkloadColor !== 'function') {
              if (totalPct === 0) wlColor = '#94a3b8';
              else if (totalPct < 50) wlColor = '#ef4444';
              else if (totalPct <= 80) wlColor = '#facc15';
              else if (totalPct <= 100) wlColor = '#22c55e';
              else if (totalPct <= 120) wlColor = '#166534';
              else wlColor = '#7f1d1d';
            }

            cellContent = `
              <div class="scheduler-scrollbar" style="max-height:108px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; padding-right:2px; height:100%; padding-bottom:26px;">
                ${qcChips}
                ${scheduleChips ? `
                  <div style="margin-top:${dayPlans.length > 0 && renderedCount > dayPlans.length ? '4px' : '0'};">
                    ${scheduleChips}
                  </div>
                ` : ''}
              </div>
              
              <div style="position:absolute; bottom:4px; right:4px; left:4px; display:flex; justify-content:space-between; align-items:center; padding:2px 6px; z-index:1;">
                ${totalItems > 0 ? `
                  <div onclick="window.showQcDayDetailModal('${p.id}', '${p.name.replace(/'/g, "\\'")}', '${(p.nameEn || '').replace(/'/g, "\\'")}', '${(p.nickname || '').replace(/'/g, "\\'")}', '${d.iso}')" style="cursor:pointer; font-size:0.6rem; color:#3b82f6; font-weight:700; display:flex; align-items:center; gap:2px; padding:2px;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
                    <i data-lucide="maximize-2" style="width:8px; height:8px"></i> View More (${totalItems})
                  </div>
                ` : '<div></div>'}
                
                ${totalPct > 0 ? `
                  <div onclick="window.showQcDayDetailModal('${p.id}', '${p.name.replace(/'/g, "\\'")}', '${(p.nameEn || '').replace(/'/g, "\\'")}', '${(p.nickname || '').replace(/'/g, "\\'")}', '${d.iso}')" style="background:${wlColor}; color:#fff; font-size:0.55rem; font-weight:800; padding:1px 8px; border-radius:99px; box-shadow:0 1px 3px rgba(0,0,0,0.1); cursor:pointer; transition:transform 0.2s" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                    ${Math.round(totalPct)}%
                  </div>
                ` : ''}
              </div>
            `;
          } else if (isOff) {
            cellContent = `<div style="flex:1; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:.65rem; font-weight:700; letter-spacing:1px; height:100%; min-height:40px;">DAY OFF</div>`;
          } else {
            cellContent = `<div style="display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:0.55rem; font-weight:500; font-style:italic; height:100%; min-height:40px;">No task</div>`;
          }

          tableRows += `
            <td style="padding:8px; border-bottom:1px solid #e4e8ef; border-right:1px solid #e4e8ef; background:${cellBg}; vertical-align:top; height:140px; position:relative;">
              ${cellContent}
            </td>
          `;
        });

        tableRows += `
          </tr>
        `;
      });
    });
  }

  // Build date headers
  let dateHeaders = '';
  dates.forEach(d => {
    const isWeekend = d.dayIdx === 0 || d.dayIdx === 6;
    const holidayName = qcIsThaiHoliday(d.dateObj);
    const isHoliday = !!holidayName;
    
    // Modern colors and backgrounds
    let bg = '#ffffff';
    let dateColor = '#1e293b'; // Premium dark slate for date numbers
    let dayColor = '#94a3b8';  // Slate-gray for day name
    let borderBottom = '1px solid #e4e8ef';
    let shadowStyle = 'box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 #e4e8ef';
    
    if (d.isToday) {
      bg = '#faf8ff'; // Light purple tint for today
      dateColor = '#635BFF';
      dayColor = '#635BFF'; // Purple
      shadowStyle = 'box-shadow: 0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -2px 0 #635BFF';
    } else if (isHoliday) {
      bg = '#fff1f2'; // Soft rose/pink for holiday
      dateColor = '#be123c'; // Rose-700
      dayColor = '#e11d48';  // Rose-600
    } else if (isWeekend) {
      bg = '#f8fafc'; // Softer weekend slate background
      dateColor = '#475569'; // Darker gray for weekend dates
      dayColor = '#94a3b8';  // Gray for weekend days
    }
    
    // Day name in elegant uppercase and letter-spaced font
    const dayText = `<div style="font-size:0.62rem; color:${dayColor}; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:5px">${d.dayName}</div>`;
    
    // Date badge for today, or simple bold number for others
    let dateText = '';
    if (d.isToday) {
      dateText = `
        <div style="display:inline-flex; align-items:center; justify-content:center; gap:5px; background:linear-gradient(135deg, #635BFF, #818cf8); color:#ffffff; padding:3px 12px; border-radius:99px; font-size:0.78rem; font-weight:700; box-shadow:0 4px 12px rgba(99,91,255,0.35);">
          <span style="width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,0.7); display:inline-block;"></span>
          ${d.label}
        </div>
      `;
    } else {
      dateText = `<div style="font-size:0.82rem; color:${dateColor}; font-weight:700;">${d.label}</div>`;
    }

    const holidayBadge = isHoliday 
      ? `<div style="font-size:0.62rem; color:#be123c; font-weight:600; margin-top:6px; line-height:1.2; width:100%; word-break:break-word; text-align:center">${holidayName}</div>`
      : '';

    dateHeaders += `
      <th style="padding:18px 12px; border-bottom:${borderBottom}; border-right:1px solid #e4e8ef; text-align:center; background:${bg}; width:150px; min-width:150px; position:sticky; top:0; z-index:10; vertical-align:middle; ${shadowStyle}" ${isHoliday ? `title="${holidayName}"` : ''}>
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:48px;">
          ${dayText}
          ${dateText}
          ${holidayBadge}
        </div>
      </th>
    `;
  });

  const fadeClass = 'fade-in';

  return `
    <style>
      .qc-dashboard {
        font-family: 'Kanit', sans-serif;
        background: transparent;
        display: flex;
        flex-direction: column;
        gap: 16px;
        color: #1e293b;
      }
      
      .qc-card {
        background: #ffffff;
        border-radius: var(--radius, 14px);
        padding: 16px;
        box-shadow: var(--shadow, 0 2px 16px rgba(0,0,0,.07));
        border: 1px solid var(--border, #e4e8ef);
      }

      /* Top Row Grid */
      .qc-top-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }

      .qc-stat-card {
        border-radius: var(--radius, 14px);
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100px;
        box-shadow: var(--shadow, 0 2px 16px rgba(0,0,0,.07));
        border: 1px solid var(--border, #e4e8ef);
      }
      .stat-card-title { font-size: 0.85rem; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
      .stat-card-value { font-size: 1.8rem; font-weight: 700; display: flex; align-items: baseline; gap: 8px; }
      .stat-card-unit { font-size: 0.9rem; font-weight: 500; color: #475569; }
      
      .stat-icon {
        width: 32px; height: 32px;
        display: inline-flex; align-items: center; justify-content: center;
        border-radius: 50%; margin-right: 8px;
      }

      /* Specific Card Colors */
      .card-total { background: linear-gradient(135deg, #f8fafc, #e0f2fe); border: 1px solid #bae6fd; }
      .card-total .stat-icon { color: #fff; background-color: #0284c7; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.4); }
      .card-qc1 { background-color: #eff6ff; border: 1px solid #bfdbfe; }
      .card-qc1 .stat-icon { color: #fff; background-color: #3b82f6; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4); }
      .card-qc2 { background-color: #f0fdf4; border: 1px solid #bbf7d0; }
      .card-qc2 .stat-icon { color: #fff; background-color: #22c55e; box-shadow: 0 4px 10px rgba(34, 197, 94, 0.4); }
      .card-web { background-color: #faf5ff; border: 1px solid #e9d5ff; }
      .card-web .stat-icon { color: #fff; background-color: #8b5cf6; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4); }
      .card-manual { background-color: #fffbeb; border: 1px solid #fde68a; }
      .card-manual .stat-icon { color: #fff; background-color: #d97706; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.4); }
      
      .stat-footer { display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; margin-top: 12px; align-items: center; }

      .qc-section-title { font-size: 1rem; font-weight: 600; margin-bottom: 16px; color: #0f172a; }

      /* Timeline Scrollbar & Table styles */
      .scheduler-scrollbar::-webkit-scrollbar { width: 3px !important; height: 3px !important; }
      .scheduler-scrollbar::-webkit-scrollbar-track { background: transparent !important; }
      .scheduler-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1 !important; border-radius: 10px !important; }
      .scheduler-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8 !important; }
      .scheduler-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
      
      .table-wrap {
        overflow-x: auto;
        overflow-y: auto;
        max-height: calc(100vh - 240px);
        background: #fff;
        width: 100%;
        border-radius: 12px;
      }
      
      .qc-timeline-table {
        width: max-content;
        min-width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-family: 'Kanit', sans-serif;
      }
      
      .qc-timeline-table th {
        font-size: 0.8rem;
        font-weight: 600;
        color: #475569;
        border-bottom: 1px solid #e4e8ef;
        border-right: 1px solid #e4e8ef;
      }
      
      .qc-timeline-table td {
        border-bottom: 1px solid #e4e8ef;
        border-right: 1px solid #e4e8ef;
        font-size: 0.8rem;
        color: #334155;
        vertical-align: top;
      }

      /* Charts Area */
      .qc-charts-area { display: flex; flex-direction: column; gap: 16px; }
      .chart-container { height: 200px; position: relative; width: 100%; }
      .legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }

      /* Add Plan Button */
      .btn-add-plan {
        display: inline-flex; align-items: center; gap: 6px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: #fff; border: none; border-radius: 8px;
        padding: 8px 16px; font-size: 0.8rem; font-weight: 600;
        cursor: pointer; font-family: 'Kanit', sans-serif;
        box-shadow: 0 2px 8px rgba(59,130,246,0.3);
        transition: all 0.2s;
        height: 34px;
      }
      .btn-add-plan:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }

      /* Modal */
      .qc-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
        z-index: 9999; display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.2s ease;
      }
      .qc-modal {
        background: #fff; border-radius: 16px; padding: 28px;
        width: 520px; max-width: 95vw; max-height: 90vh; overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        animation: slideUp 0.3s ease;
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

      .qc-modal h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 20px 0; color: #0f172a; display: flex; align-items: center; gap: 8px; }
      .qc-form-group { margin-bottom: 16px; }
      .qc-form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: #475569; margin-bottom: 6px; }
      .qc-form-group select, .qc-form-group input {
        width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0;
        border-radius: 10px; font-family: 'Kanit', sans-serif; font-size: 0.85rem;
        background: #f8fafc; outline: none; transition: border-color 0.2s;
      }
      .qc-form-group select:focus, .qc-form-group input:focus { border-color: #3b82f6; background: #fff; }
      .qc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .qc-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
      .btn-modal-cancel { padding: 10px 20px; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; font-family: 'Kanit'; font-size: 0.85rem; color: #64748b; }
      .btn-modal-cancel:hover { background: #f8fafc; }
      .btn-modal-save { padding: 10px 24px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none; border-radius: 10px; cursor: pointer; font-family: 'Kanit'; font-size: 0.85rem; font-weight: 600; box-shadow: 0 2px 8px rgba(59,130,246,0.3); }
      .btn-modal-save:hover { box-shadow: 0 4px 12px rgba(59,130,246,0.4); }

      /* Date Input Grid in Modal */
      .qc-date-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; }
      .qc-date-grid-item { display: flex; flex-direction: column; gap: 4px; }
      .qc-date-grid-item label { font-size: 0.72rem; color: #64748b; text-align: center; margin-bottom: 0; }
      .qc-date-grid-item input { text-align: center; padding: 8px 4px; }
    </style>

    <div class="qc-dashboard">
      <!-- HEADER with Date Filter, Search and Team filters -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:4px;">
        <div style="font-size:0.8rem; color:#64748b; font-weight:500;">
          แผนงาน RealCyber Plan · จัดการและติดตามเคส
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-left:auto;">
          <div style="height:34px; display:flex; align-items:center">
             ${renderDateFilter('qcReloadPlan()', 'auto', null, false)}
          </div>
          <div class="search-box" style="width:160px; background:#fff; height:34px; display:flex; align-items:center; position:relative; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden">
            <i data-lucide="search" style="width:14px; height:14px; position:absolute; left:12px; color:#64748b"></i>
            <input id="qcSearchInput" type="text" placeholder="ค้นหาพนักงาน..." value="${window._qcSearch || ''}" onkeyup="qcFilterUI()" style="padding:0 12px 0 32px; height:100%; width:100%; border:none; outline:none; background:transparent; font-size:0.8rem; font-family:'Kanit', sans-serif;">
          </div>
          <select id="qcTeamFilter" class="select-input" onchange="qcFilterUI()" style="height:34px; width:150px; padding:0 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:.8rem; font-family:Kanit; outline:none; background:#fff; cursor:pointer">
            <option value="">ทุกทีม (All Teams)</option>
            ${['ACE', 'Sertec', 'ONIX', 'Sale Support', 'Call Center'].map(t => `<option value="${t}" ${window._qcTeamFilter === t ? 'selected' : ''}>ทีม ${t}</option>`).join('')}
          </select>
          ${(window._qcSearch || window._qcTeamFilter || window._qcDateRange) ? `
          <button onclick="qcClearFilters()" style="height:34px; padding:0 12px; font-size:.75rem; border:none; color:#ef4444; display:flex; align-items:center; gap:4px; cursor:pointer; font-weight:700; background:none; font-family:'Kanit';">
             <span style="font-weight:bold;font-size:13px">✕</span> Clear
          </button>
          ` : ''}
          <div style="width:1px; height:20px; background:#e2e8f0; margin:0 2px"></div>

          <button class="btn" onclick="qcShowManageEmployeesModal()" style="padding:6px 12px; font-size:.7rem; border-radius:10px; background:#fff; color:#475569; border:1px solid #cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-family:'Kanit';">
             <i data-lucide="users" style="width:14px; height:14px"></i> จัดการพนักงาน
          </button>
          
          <button class="btn" onclick="qcShowSettingsModal()" style="padding:6px 12px; font-size:.7rem; border-radius:10px; background:#fff; color:#475569; border:1px solid #cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-family:'Kanit';">
             <i data-lucide="settings" style="width:14px; height:14px"></i> ตั้งค่า % งาน
          </button>


          <button class="btn-auto-plan" onclick="qcShowAutoPlanModal()" style="display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg, #8b5cf6, #6d28d9); color:#fff; border:none; border-radius:10px; padding:6px 12px; font-size:.7rem; font-weight:600; cursor:pointer; font-family:'Kanit'; box-shadow:0 2px 8px rgba(139,92,246,0.2); margin-top:0; transition: all 0.2s;">
            <i data-lucide="zap" style="width:14px; height:14px;"></i> จัดแผนงานอัตโนมัติ
          </button>

        </div>
      </div>

      <!-- TOP ROW: Stat Cards -->
      <div class="qc-top-row">
        <!-- Card 1: เคสทั้งหมด -->
        <div class="qc-stat-card card-total" style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #0284c7; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.4)">
            <i data-lucide="layers" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">เคสทั้งหมด</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
              ${(totalCases || 0).toLocaleString('en-US')} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">เคส</span>
            </div>
            <div class="stat-footer" style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; line-height: 1.3; margin-top: 4px;">
              <div style="font-weight: 700; color: #0284c7;">QC: ${(totalQcCases || 0).toLocaleString('en-US')} เคส | Manual: ${(totalManualCases || 0).toLocaleString('en-US')} เคส</div>
              <div style="font-size: 0.68rem; opacity: 0.85;">Website: ${(websiteCases || 0).toLocaleString('en-US')} | Social: ${(socialCases || 0).toLocaleString('en-US')}</div>
            </div>
          </div>
        </div>

        <!-- Card 2: QC1 -->
        <div class="qc-stat-card card-qc1" style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4)">
            <i data-lucide="file-text" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">QC1</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
              ${(qc1Cases || 0).toLocaleString('en-US')} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">เคส</span>
            </div>
            <div class="stat-footer" style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; line-height: 1.3; margin-top: 4px;">
              <div style="font-weight: 600; opacity: 0.9;">${Math.round(totalCases > 0 ? qc1Cases / totalCases * 100 : 0)}% ของทั้งหมด</div>
              <div style="font-size: 0.65rem; opacity: 0.85; margin-top: 2px;">Website: ${(qc1WebCases || 0).toLocaleString('en-US')} | Social: ${(qc1SocialCases || 0).toLocaleString('en-US')}</div>
            </div>
          </div>
        </div>

        <!-- Card 3: QC2 -->
        <div class="qc-stat-card card-qc2" style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #22c55e; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(34, 197, 94, 0.4)">
            <i data-lucide="shield-check" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">QC2</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
              ${(qc2Cases || 0).toLocaleString('en-US')} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">เคส</span>
            </div>
            <div class="stat-footer" style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; line-height: 1.3; margin-top: 4px;">
              <div style="font-weight: 600; opacity: 0.9;">${Math.round(totalCases > 0 ? qc2Cases / totalCases * 100 : 0)}% ของทั้งหมด</div>
              <div style="font-size: 0.65rem; opacity: 0.85; margin-top: 2px;">Website: ${(qc2WebCases || 0).toLocaleString('en-US')} | Social: ${(qc2SocialCases || 0).toLocaleString('en-US')}</div>
            </div>
          </div>
        </div>

        <!-- Card 4: Manual Cases -->
        <div class="qc-stat-card card-manual" style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #d97706; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.4)">
            <i data-lucide="hand" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">Manual Cases</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--text)">
              ${(manualCases || 0).toLocaleString('en-US')} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">เคส</span>
            </div>
            <div class="stat-footer" style="margin-top: 4px;">
              <span>${Math.round(totalCases > 0 ? manualCases / totalCases * 100 : 0)}% ของทั้งหมด</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CHARTS ROW 2: Donuts + Overview -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px; align-items: stretch;">
        <div class="qc-card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 16px;">
          <div class="qc-section-title" style="margin-bottom: 12px;">สถิติการ QC ตามช่องทาง</div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex: 1;">
            <div style="position: relative; width: 100px; height: 100px; flex-shrink: 0;">
               <canvas id="qcDonutChart"></canvas>
               <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; line-height:1.2; width: 100%;">
                 <strong style="font-size:1.1rem; color:#1e293b;">${(totalQcCases || 0).toLocaleString('en-US')}</strong><br>
                 <span style="font-size:0.6rem; color:#64748b; white-space:nowrap;">QC ทั้งหมด</span>
               </div>
            </div>
            <div style="font-size: 0.78rem; flex: 1; padding-left: 8px;">
               <div style="margin-bottom: 8px; display:flex; align-items:center; gap:6px;">
                 <span class="legend-dot" style="background:#3b82f6; flex-shrink:0;"></span>
                 <span style="width: 50px; color:#64748b;">Website</span>
                 <strong>${(qcWebsiteCases || 0).toLocaleString('en-US')}</strong>
                 <span style="color:#64748b; font-size:0.7rem; margin-left:auto;">(${totalQcCases > 0 ? Math.round(qcWebsiteCases / totalQcCases * 100) : 0}%)</span>
               </div>
               <div style="display:flex; align-items:center; gap:6px;">
                 <span class="legend-dot" style="background:#22c55e; flex-shrink:0;"></span>
                 <span style="width: 50px; color:#64748b;">Social</span>
                 <strong>${(qcSocialCases || 0).toLocaleString('en-US')}</strong>
                 <span style="color:#64748b; font-size:0.7rem; margin-left:auto;">(${totalQcCases > 0 ? Math.round(qcSocialCases / totalQcCases * 100) : 0}%)</span>
               </div>
            </div>
          </div>
        </div>

        <div class="qc-card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 16px;">
          <div class="qc-section-title" style="margin-bottom: 12px;">สถิติการ Manual ตามช่องทาง</div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex: 1;">
            <div style="position: relative; width: 100px; height: 100px; flex-shrink: 0;">
               <canvas id="qcManualDonutChart"></canvas>
               <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; line-height:1.2; width: 100%;">
                 <strong style="font-size:1.1rem; color:#1e293b;">${(totalManualCases || 0).toLocaleString('en-US')}</strong><br>
                 <span style="font-size:0.6rem; color:#64748b; white-space:nowrap;">Manual รวม</span>
               </div>
            </div>
            <div style="font-size: 0.78rem; flex: 1; padding-left: 8px;">
               <div style="margin-bottom: 8px; display:flex; align-items:center; gap:6px;">
                 <span class="legend-dot" style="background:#3b82f6; flex-shrink:0;"></span>
                 <span style="width: 50px; color:#64748b; white-space:nowrap;">Website</span>
                 <strong>${(manualWebCases || 0).toLocaleString('en-US')}</strong>
                 <span style="color:#64748b; font-size:0.7rem; margin-left:auto;">(${totalManualCases > 0 ? Math.round(manualWebCases / totalManualCases * 100) : 0}%)</span>
               </div>
               <div style="display:flex; align-items:center; gap:6px;">
                 <span class="legend-dot" style="background:#22c55e; flex-shrink:0;"></span>
                 <span style="width: 50px; color:#64748b; white-space:nowrap;">Social</span>
                 <strong>${(manualSocialCases || 0).toLocaleString('en-US')}</strong>
                 <span style="color:#64748b; font-size:0.7rem; margin-left:auto;">(${totalManualCases > 0 ? Math.round(manualSocialCases / totalManualCases * 100) : 0}%)</span>
               </div>
            </div>
          </div>
        </div>

        <!-- Overview Card -->
        <div class="qc-card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 16px;">
          <div class="qc-section-title" style="margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="info" style="width: 16px; height: 16px; color: var(--primary);"></i>
            <span>ภาพรวมรายละเอียดงาน</span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 12px; flex: 1; font-size: 0.78rem;">
            <!-- 1. Work Info Date -->
            <div style="display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <i data-lucide="calendar" style="width: 16px; height: 16px; color: #4f46e5; flex-shrink:0;"></i>
              <div>
                <div style="font-size: 0.6rem; color: #64748b; font-weight: 500;">วันที่ข้อมูลของงาน</div>
                <strong style="color: #1e293b;">${dates.length > 0 ? `${dates[0].label} - ${dates[dates.length - 1].label}` : '-'}</strong>
              </div>
            </div>

            <!-- 2. Case Count -->
            <div style="display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <i data-lucide="layers" style="width: 16px; height: 16px; color: #10b981; flex-shrink:0;"></i>
              <div>
                <div style="font-size: 0.6rem; color: #64748b; font-weight: 500;">จำนวนเคสทั้งหมด</div>
                <strong style="color: #1e293b;">${(totalCases || 0).toLocaleString('en-US')} เคส</strong>
              </div>
            </div>

            <!-- 3. Category Breakdown -->
            <div>
              <div style="font-size: 0.72rem; color: #64748b; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">หมวดหมู่</div>
              <div class="scheduler-scrollbar" style="max-height: 80px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 4px;">
                ${catEntries.length > 0 
                  ? catEntries.map(([cat, val]) => `
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem;">
                      <span style="color:#64748b; display:flex; align-items:center; gap:4px;">
                        <span style="width:6px; height:6px; border-radius:50%; background:#818cf8; display:inline-block;"></span>
                        ${cat}
                      </span>
                      <strong style="color:#1e293b;">${(val || 0).toLocaleString('en-US')} เคส</strong>
                    </div>
                  `).join('')
                  : `<span style="font-style:italic; color:#94a3b8; font-size:0.7rem;">ไม่มีข้อมูลหมวดหมู่</span>`
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CHARTS ROW 3: Trend Line -->
      <div class="qc-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
          <div class="qc-section-title" style="margin:0;">แนวโน้มการ QC และคาดการณ์ส่ง WebD</div>
          <div style="font-size:0.75rem; color:#64748b;">
            <span class="legend-dot" style="background:#3b82f6;"></span>Website &nbsp;
            <span class="legend-dot" style="background:#22c55e;"></span>Social &nbsp;
            <span class="legend-dot" style="background:#f59e0b;"></span>ส่ง WebD
          </div>
        </div>
        <div class="chart-container" style="height: 180px;">
          <canvas id="qcLineChart"></canvas>
        </div>
      </div>
      <!-- WEEKLY TABLE -->
      <div class="${fadeClass}" style="width:100%; overflow:hidden; margin-top: 8px;">
        <div class="qc-card" style="padding:0; overflow:hidden">
          <div id="qcTableWrap" class="table-wrap scheduler-scrollbar" style="overflow-x:auto; overflow-y:auto; max-height:calc(100vh - 240px); background:#fff; width:100%">
            <table class="qc-timeline-table">
              <thead>
                <tr style="background:#fff">
                  <th style="width:260px; min-width:260px; padding:18px 20px; border-bottom:1px solid #e4e8ef; border-right:1px solid #e4e8ef; text-align:left; font-size:.85rem; color:#1e293b; font-weight:700; background:#fff; position:sticky; left:0; top:0; z-index:21; vertical-align:middle; box-shadow:0 4px 6px -4px rgba(0,0,0,0.12), inset 0 -1px 0 #e4e8ef">
                    <div style="display:flex; align-items:center; gap:8px; height:100%;">
                      <i data-lucide="user-check" style="width:16px; height:16px; color:#475569;"></i>
                      <span>ผู้รับผิดชอบ</span>
                    </div>
                  </th>
                  ${dateHeaders}
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `;
}

// --- Date Filter Reload ---
window.qcReloadPlan = function() {
  // Save active element and selection range before re-render to prevent focus bouncing
  const activeId = document.activeElement ? document.activeElement.id : null;
  let selectionStart = 0, selectionEnd = 0;
  if (activeId && document.activeElement instanceof HTMLInputElement) {
    selectionStart = document.activeElement.selectionStart;
    selectionEnd = document.activeElement.selectionEnd;
  }

  // Get the date range from the flatpickr hidden input
  const wrapper = document.querySelector('#pageContent .date-range-wrapper input[type="text"][id^="drp_"]');
  if (wrapper && wrapper.value) {
    window._qcDateRange = wrapper.value;
  } else {
    window._qcDateRange = window._currentDateRange || '';
  }
  const contentEl = document.getElementById('pageContent');
  if (contentEl) {
    contentEl.innerHTML = renderQCWorkPlanDashboard();
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: contentEl });
  }

  // Restore focus and cursor selection range
  if (activeId) {
    const newActiveEl = document.getElementById(activeId);
    if (newActiveEl) {
      newActiveEl.focus();
      if (newActiveEl instanceof HTMLInputElement && newActiveEl.type === 'text') {
        newActiveEl.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }
};


window.qcFilterUI = function() {
  window._qcSearch = document.getElementById('qcSearchInput')?.value.toLowerCase() || '';
  window._qcTeamFilter = document.getElementById('qcTeamFilter')?.value || '';
  qcReloadPlan();
};

window.qcClearFilters = function() {
  // 1. Clear search input
  window._qcSearch = '';
  const searchInput = document.getElementById('qcSearchInput');
  if (searchInput) searchInput.value = '';

  // 2. Clear team filter
  window._qcTeamFilter = '';
  const teamSelect = document.getElementById('qcTeamFilter');
  if (teamSelect) {
    teamSelect.value = '';
    teamSelect.selectedIndex = 0;
  }

  // 3. Clear calendar date picker (preserving default current week logic)
  try {
    const wrapper = document.querySelector('#pageContent .date-range-wrapper input[type="text"][id^="drp_"]');
    window._currentDateRange = '';
    window._qcDateRange = '';
    if (wrapper && wrapper._flatpickr) {
      wrapper._flatpickr.clear();
      const id = wrapper.id;
      const fromEl = document.getElementById(id + '_from');
      const toEl = document.getElementById(id + '_to');
      if (fromEl) {
        const span = fromEl.querySelector('span');
        if (span) span.textContent = 'From';
        fromEl.style.color = 'var(--text-3)';
      }
      if (toEl) {
        const span = toEl.querySelector('span');
        if (span) span.textContent = 'To';
        toEl.style.color = 'var(--text-3)';
      }
    }
  } catch (err) {
    console.error("Error clearing calendar picker:", err);
  }

  // 4. Reload dashboard directly with reset window states
  qcReloadPlan();
};


// --- Add Plan Modal ---
window.qcShowAddModal = function(preSelectedName = '') {
  // Get dates for the form
  let fromStr = '', toStr = '';
  if (window._qcDateRange && window._qcDateRange.includes(' to ')) {
    const parts = window._qcDateRange.split(' to ');
    fromStr = parts[0];
    toStr = parts[1];
  }
  const dates = qcGetWeekDates(fromStr, toStr);
  const employees = qcGetEmployees();
  
  const empOptions = employees.length > 0
    ? employees.map(e => {
        const isSelected = e.name === preSelectedName ? 'selected' : '';
        return `<option value="${e.name}" ${isSelected}>${e.name}${e.nickname && e.nickname !== '-' ? ' (' + e.nickname + ')' : ''}</option>`;
      }).join('')
    : '<option value="">ไม่พบข้อมูลพนักงาน</option>';

  const dateInputs = dates.map(d => `
    <div class="qc-date-grid-item">
      <label>${d.dayName}<br>${d.label}</label>
      <input type="number" min="0" id="qc_case_${d.iso}" placeholder="0" value="">
    </div>
  `).join('');

  const modalHtml = `
    <div class="qc-modal-overlay" id="qcAddModal" onclick="if(event.target===this) this.remove()">
      <div class="qc-modal">
        <h3><i data-lucide="plus-circle" style="width:22px; height:22px; color:#3b82f6;"></i> เพิ่มแผนงาน RealCyber Plan</h3>
        
        <div class="qc-form-group">
          <label>ผู้รับผิดชอบ</label>
          <select id="qcModalPerson">
            <option value="">-- เลือกผู้รับผิดชอบ --</option>
            ${empOptions}
          </select>
        </div>

        <div class="qc-form-row">
          <div class="qc-form-group">
            <label>รอบ / ประเภท</label>
            <select id="qcModalQcType" onchange="qcUpdateAddModalSuboptions()">
              <option value="">-- เลือกรอบ / ประเภท --</option>
              <option value="QC1">QC1</option>
              <option value="QC2">QC2</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          <div class="qc-form-group">
            <label>ช่องทาง</label>
            <select id="qcModalChannel" onchange="qcUpdateAddModalSuboptions()">
              <option value="">-- เลือกช่องทาง --</option>
              <option value="Website">Website</option>
              <option value="Social">Social</option>
            </select>
          </div>
        </div>



        <div class="qc-form-group">
          <label>หมวด</label>
          <select id="qcModalCategory">
            <option value="">-- เลือกหมวด --</option>
            ${window.QC_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>

        <div class="qc-form-group">
          <label>จำนวนเคสที่ต้องทำ (เป้าหมาย)</label>
          <input type="number" min="0" id="qcModalTargetCases" placeholder="ระบุจำนวนเคสเป้าหมายแมนนวล เช่น 20" value="">
        </div>
        
        <div class="qc-form-group">
          <label>จำนวนเคสรายวัน</label>
          <div class="qc-date-grid">
            ${dateInputs}
          </div>
        </div>

        <div class="qc-modal-actions">
          <button class="btn-modal-cancel" onclick="document.getElementById('qcAddModal').remove()">ยกเลิก</button>
          <button class="btn-modal-save" onclick="qcSavePlan()">
            <i data-lucide="save" style="width:14px; height:14px;"></i> บันทึก
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  window.qcUpdateAddModalSuboptions = function() {
    const qcType = document.getElementById('qcModalQcType')?.value;
    const channel = document.getElementById('qcModalChannel')?.value;
    const subGroup = document.getElementById('qcModalSuboptionsGroup');
    if (subGroup) {
      const confMode = localStorage.getItem('qc_web_conf_mode') === 'conf';
      const confQc1 = localStorage.getItem('qc_web_conf_qc1') === 'true';
      const confQc2 = localStorage.getItem('qc_web_conf_qc2') === 'true';
      
      const showForQc1 = (qcType === 'QC1' && confMode && confQc1);
      const showForQc2 = (qcType === 'QC2' && confMode && confQc2);

      if ((showForQc1 || showForQc2) && channel === 'Website') {
        subGroup.style.display = 'block';
        const label = subGroup.querySelector('label');
        if (label) {
          label.textContent = `เงื่อนไข Website ${qcType}`;
        }
      } else {
        subGroup.style.display = 'none';
      }
    }
  };
};

// --- Save Plan ---
window.qcSavePlan = function() {
  const person = document.getElementById('qcModalPerson')?.value;
  let qcType = document.getElementById('qcModalQcType')?.value;
  const channel = document.getElementById('qcModalChannel')?.value;
  const category = document.getElementById('qcModalCategory')?.value;

  if (!person) { window.showToast && window.showToast('กรุณาเลือกผู้รับผิดชอบ', 'warning'); return; }
  if (!qcType) { window.showToast && window.showToast('กรุณาเลือกรอบ QC / ประเภท', 'warning'); return; }
  if (!channel) { window.showToast && window.showToast('กรุณาเลือกช่องทาง', 'warning'); return; }

  // Subcondition radio overrides removed as they are now handled via dynamic categories

  const finalChannel = channel;

  let fromStr = '', toStr = '';
  if (window._qcDateRange && window._qcDateRange.includes(' to ')) {
    const parts = window._qcDateRange.split(' to ');
    fromStr = parts[0];
    toStr = parts[1];
  }
  const dates = qcGetWeekDates(fromStr, toStr);

  const targetCasesVal = parseInt(document.getElementById('qcModalTargetCases')?.value) || 0;

  // Let's check if they put any daily cases
  let hasDailyCases = false;
  dates.forEach(d => {
    const input = document.getElementById('qc_case_' + d.iso);
    if (input && (parseInt(input.value) || 0) > 0) {
      hasDailyCases = true;
    }
  });

  let addedAny = false;
  if (hasDailyCases) {
    dates.forEach(d => {
      const input = document.getElementById('qc_case_' + d.iso);
      const cases = input ? parseInt(input.value) || 0 : 0;
      if (cases > 0) {
        const id = 'QC-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const plan = {
          id: id,
          name: person,
          qcType: qcType,
          channel: finalChannel,
          category: category || '',
          date: d.iso,
          cases: cases,
          targetCases: targetCasesVal
        };
        window.QC_PLANS.push(plan);
        if (typeof window.qcSaveLocalPlan === 'function') window.qcSaveLocalPlan(plan);
        if (typeof apiSaveQcPlan === 'function') {
          apiSaveQcPlan({ action: 'add', ...plan });
        }
        if (typeof window.qcSyncPlanToSchedule === 'function') {
          window.qcSyncPlanToSchedule('add', plan);
        }
        addedAny = true;
      }
    });
  } else if (targetCasesVal > 0) {
    // No daily cases entered, but target cases specified. Let's add a single entry on the first day of the dates list.
    const id = 'QC-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const plan = {
      id: id,
      name: person,
      qcType: qcType,
      channel: finalChannel,
      category: category || '',
      date: dates[0].iso,
      cases: 0,
      targetCases: targetCasesVal
    };
    window.QC_PLANS.push(plan);
    if (typeof window.qcSaveLocalPlan === 'function') window.qcSaveLocalPlan(plan);
    if (typeof apiSaveQcPlan === 'function') {
      apiSaveQcPlan({ action: 'add', ...plan });
    }
    if (typeof window.qcSyncPlanToSchedule === 'function') {
      window.qcSyncPlanToSchedule('add', plan);
    }
    addedAny = true;
  }

  if (!addedAny) {
    window.showToast && window.showToast('กรุณาใส่จำนวนเคสอย่างน้อย 1 วัน หรือระบุจำนวนเคสที่ต้องทำ (เป้าหมาย)', 'warning');
    return;
  }

  // Close modal
  document.getElementById('qcAddModal')?.remove();

  // Show success
  if (typeof window.showToast === 'function') {
    window.showToast('เพิ่มแผนงานเรียบร้อยแล้ว!', 'success');
  }

  // Re-render
  qcReloadPlan();
};

// --- Delete Plan Row ---
window.qcDeleteRow = async function(name, qcType, channel, category) {
  const confirmed = await window.qcCustomConfirm({
    title: 'ยืนยันการลบแผนงาน',
    message: `คุณต้องการลบแผนงานของ ${name} (${qcType} - ${channel}) ใช่หรือไม่?`,
    confirmText: 'ลบข้อมูล',
    cancelText: 'ยกเลิก',
    isDanger: true
  });
  if (!confirmed) return;
  
  // Update local memory state
  window.QC_PLANS = window.QC_PLANS.filter(p => !(p.name === name && p.qcType === qcType && p.channel === channel && (p.category || '') === category));
  
  if (typeof window.qcDeleteLocalPlan === 'function') {
    window.qcDeleteLocalPlan({ name, qcType, channel, category });
  }

  // Call GAS to delete all matching rows from Google Sheet
  if (typeof apiSaveQcPlan === 'function') {
    apiSaveQcPlan({
      action: 'delete_qc_plan',
      name: name,
      qcType: qcType,
      channel: channel,
      category: category
    });
  }
  
  if (typeof window.showToast === 'function') {
    window.showToast('ลบแผนงานเรียบร้อยแล้ว!', 'success');
  }
  
};

// --- Auto-Planner Wizard ---
window.qcShowAutoPlanModal = function() {
  let fromStr = '', toStr = '';
  if (window._qcDateRange && window._qcDateRange.includes(' to ')) {
    const parts = window._qcDateRange.split(' to ');
    fromStr = parts[0];
    toStr = parts[1];
  }
  const dates = qcGetWeekDates(fromStr, toStr);

  // Default ISO date values
  const dObj = new Date();
  const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const pad = n => String(n).padStart(2, '0');
  const defaultDataDateIso = `${dObj.getFullYear()}-${pad(dObj.getMonth()+1)}-${pad(dObj.getDate())}`;
  const defaultDataDate = `${dObj.getDate()} ${thaiMonthsShort[dObj.getMonth()]}`;
  // Allowed work dates: the dates visible in the scheduler
  const allowedWorkDates = dates.map(d => d.iso);

  const qcCategories = window.QC_CATEGORIES;

  // Manual excludes these 4 categories
  const manualExcluded = ['Hate Speech', 'จัดหาแรงงานเถื่อน', 'ดูหมิ่นสถาบัน', 'ลิขสิทธิ์ภาพยนตร์'];
  const manualCategories = qcCategories.filter(c => !manualExcluded.includes(c));

  const buildCatGrid = (cats) => cats.map((cat, idx) => `
    <div style="background: #f8fafc; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between; gap: 8px;">
      <label style="font-size: 0.75rem; font-weight: 700; color: #334155; margin: 0; display: flex; align-items: flex-start; gap: 6px; line-height: 1.4;" title="${cat}">
        <span style="display:inline-flex; width:18px; height:18px; background:#e0e7ff; color:#4f46e5; border-radius:50%; align-items:center; justify-content:center; font-size:0.6rem; font-weight:800; flex-shrink:0; margin-top: 1px;">${idx+1}</span>
        <span style="word-break: break-word;">${cat}</span>
      </label>
      <div style="display: flex; align-items: center; gap: 4px;">
        <input type="number" min="0" placeholder="0" class="qc-auto-cat-input" data-category="${cat}" oninput="qcAutoPlanRecalculateTotals()" style="flex:1; padding: 4px 6px; font-size:0.75rem; border-radius: 6px; border:1px solid #cbd5e1; outline:none; text-align:right; width:60px;">
        <span class="qc-auto-cat-perc" data-category="${cat}" style="font-size: 0.65rem; font-weight: 700; color: #64748b; min-width: 28px; text-align: right;">0%</span>
      </div>
    </div>
  `).join('');

  const qcCategoryGridHtml   = buildCatGrid(qcCategories);
  const manualCategoryGridHtml = buildCatGrid(manualCategories);

  const modalHtml = `
    <div class="qc-modal-overlay" id="qcAutoPlanModal" onclick="if(event.target===this) this.remove()">
      <div class="qc-modal" style="width: 760px; max-width: 95vw; padding: 24px; font-family:'Kanit', sans-serif;">
        <!-- Close Button Header -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 8px; margin-top: -8px; margin-right: -8px;">
          <button onclick="document.getElementById('qcAutoPlanModal').remove()" style="background: transparent; border: none; cursor: pointer; color: #94a3b8; padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;" onmouseover="this.style.background='#fee2e2'; this.style.color='#ef4444';" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8';" title="ปิดหน้าต่าง">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
        <!-- Stepper Indicator -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; background:#f1f5f9; padding: 12px 20px; border-radius: 12px;">
          <div id="qcAutoStepIndicator1" style="font-size: 0.78rem; font-weight: 700; color: #4f46e5; display:flex; align-items:center; gap:6px;">
            <span style="width:20px; height:20px; background:#4f46e5; color:#fff; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:0.7rem;">1</span>
            ตั้งค่าแผนงาน
          </div>
          <div style="width: 40px; height: 2px; background: #cbd5e1;"></div>
          <div id="qcAutoStepIndicator2" style="font-size: 0.78rem; font-weight: 700; color: #64748b; display:flex; align-items:center; gap:6px;">
            <span style="width:20px; height:20px; background:#cbd5e1; color:#fff; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:0.7rem;">2</span>
            จำนวนเคส
          </div>
          <div style="width: 40px; height: 2px; background: #cbd5e1;"></div>
          <div id="qcAutoStepIndicator3" style="font-size: 0.78rem; font-weight: 700; color: #64748b; display:flex; align-items:center; gap:6px;">
            <span style="width:20px; height:20px; background:#cbd5e1; color:#fff; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:0.7rem;">3</span>
            จัดสรร & ยืนยัน
          </div>
        </div>

        <h3 style="margin-top: 0; display:flex; align-items:center; gap:8px; font-size:1.1rem; color:#1e293b; font-weight:700;">
          <i data-lucide="zap" style="width:22px; height:22px; color:#8b5cf6;"></i>
          <span>ระบบจัดแผนงานอัตโนมัติ (Auto-Planner Wizard)</span>
        </h3>

        <!-- STEP 1 PANE -->
        <div id="qcAutoPane1" class="qc-auto-pane" style="display: block;">
          <div class="qc-form-row" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="qc-form-group">
              <label style="display:block; font-size:0.8rem; font-weight:600; color:#475569; margin-bottom:6px;">ประเภทแผนงาน</label>
              <select id="qcAutoPlanType" onchange="qcAutoPlanToggleQcSubtype()" style="width:100%; padding:10px; border-radius:10px; border:1px solid #cbd5e1; font-family:Kanit; font-size:0.82rem; background:#f8fafc;">
                <option value="" disabled selected hidden>กรุณาเลือกประเภทแผนงาน...</option>
                <option value="QC">QC</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div class="qc-form-group" id="qcAutoQcSubtypeGroup" style="display:none;">
              <label style="display:block; font-size:0.8rem; font-weight:600; color:#475569; margin-bottom:6px;">รอบการ QC</label>
              <select id="qcAutoQcSubtype" onchange="qcUpdateAutoModalSuboptions()" style="width:100%; padding:10px; border-radius:10px; border:1px solid #cbd5e1; font-family:Kanit; font-size:0.82rem; background:#f8fafc;">
                <option value="" disabled selected hidden>กรุณาเลือกรอบ...</option>
                <option value="QC1">QC1</option>
                <option value="QC2">QC2</option>
              </select>
            </div>
          </div>

          <div class="qc-form-row" style="display:grid; grid-template-columns:1fr; gap:12px; margin-bottom:12px;">
            <div class="qc-form-group">
              <label style="display:block; font-size:0.8rem; font-weight:600; color:#475569; margin-bottom:6px;">ช่องทาง (Channel)</label>
              <select id="qcAutoChannel" onchange="qcUpdateAutoModalSuboptions()" style="width:100%; padding:10px; border-radius:10px; border:1px solid #cbd5e1; font-family:Kanit; font-size:0.82rem; background:#f8fafc;">
                <option value="" disabled selected hidden>กรุณาเลือกช่องทาง...</option>
                <option value="Website">Website</option>
                <option value="Social">Social</option>
              </select>
            </div>
          </div>



          <div class="qc-form-row" style="display:grid; grid-template-columns:1.5fr 1fr 1.5fr; gap:12px; margin-bottom:16px;">
            <div class="qc-form-group">
              <label style="display:block; font-size:0.8rem; font-weight:600; color:#475569; margin-bottom:6px;">วันของข้อมูล</label>
              <div style="position:relative;">
                <input type="text" id="qcAutoDataDateDisplay" readonly placeholder="เลือกวันของข้อมูล" style="width:100%; padding: 8px 10px 8px 36px; border-radius: 10px; border:1px solid #cbd5e1; font-family:Kanit; font-size:0.82rem; background:#fff; cursor:pointer; box-sizing:border-box;">
                <i data-lucide="calendar" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:#8b5cf6; pointer-events:none;"></i>
                <input type="hidden" id="qcAutoDataDate" value="">
              </div>
            </div>
            <div class="qc-form-group">
              <label style="display:block; font-size:0.8rem; font-weight:600; color:#475569; margin-bottom:6px;">ช่วงเวลา (ถ้ามี)</label>
              <div style="display:flex; align-items:center; background:#fff; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden; padding: 3px 4px; box-sizing:border-box; height: 35px; transition: border-color 0.2s;" onmouseover="this.style.borderColor='#94a3b8'" onmouseout="this.style.borderColor='#cbd5e1'">
                <div style="padding: 0 6px 0 8px; color: #8b5cf6; display: flex; align-items: center;">
                  <i data-lucide="clock" style="width:16px; height:16px;"></i>
                </div>
                <input type="text" id="qcAutoStartTime" placeholder="00:00" maxlength="5" style="flex:1; width:100%; min-width:0; border:none; outline:none; background:transparent; font-family:Kanit; font-size:0.82rem; color:#1e293b; padding: 0; text-align:center; cursor:pointer;" title="เวลาเริ่มต้น" oninput="this.value=this.value.replace(/[^0-9:]/g,'')">
                <div style="color:#cbd5e1; font-weight:700; padding: 0 2px;">-</div>
                <input type="text" id="qcAutoEndTime" placeholder="23:59" maxlength="5" style="flex:1; width:100%; min-width:0; border:none; outline:none; background:transparent; font-family:Kanit; font-size:0.82rem; color:#1e293b; padding: 0; text-align:center; cursor:pointer;" title="เวลาสิ้นสุด" oninput="this.value=this.value.replace(/[^0-9:]/g,'')">
              </div>
            </div>
            <div class="qc-form-group">
              <label style="display:block; font-size:0.8rem; font-weight:600; color:#475569; margin-bottom:6px;">วันที่ปฏิบัติงานจริง</label>
              <div style="position:relative;">
                <input type="text" id="qcAutoWorkDateDisplay" readonly placeholder="เลือกวันที่ปฏิบัติงาน" style="width:100%; padding: 8px 10px 8px 36px; border-radius: 10px; border:1px solid #cbd5e1; font-family:Kanit; font-size:0.82rem; background:#fff; cursor:pointer; box-sizing:border-box;">
                <i data-lucide="calendar-check" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:#8b5cf6; pointer-events:none;"></i>
                <input type="hidden" id="qcAutoWorkDate" value="">
              </div>
            </div>
          </div>

          <div class="qc-modal-actions" style="margin-top:24px; display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn-modal-cancel" onclick="document.getElementById('qcAutoPlanModal').remove()" style="padding:10px 20px; border:1px solid #cbd5e1; background:#fff; border-radius:10px; cursor:pointer; font-family:Kanit; font-size:0.82rem; color:#64748b;">ยกเลิก</button>
            <button class="btn-modal-save" onclick="qcAutoPlanGoToStep(2)" style="padding:10px 24px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color:#fff; border:none; border-radius:10px; cursor:pointer; font-family:Kanit; font-size:0.82rem; font-weight:600; box-shadow: 0 2px 8px rgba(139,92,246,0.3); display:flex; align-items:center; gap:6px;">ถัดไป <i data-lucide="arrow-right" style="width:14px; height:14px;"></i></button>
          </div>
        </div>

        <!-- STEP 2 PANE -->
        <div id="qcAutoPane2" class="qc-auto-pane" style="display: none;">
          
          <!-- Info banner: plan type, data date, work date -->
          <div id="qcAutoPane2InfoBanner" style="margin-bottom:14px;">
          </div>

          <!-- Header bar -->
          <div style="background: linear-gradient(135deg, #eff6ff, #f0fdf4); border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px 16px; margin-bottom: 14px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:8px; height:8px; border-radius:50%; background:#4f46e5;"></div>
              <span style="font-size:0.82rem; font-weight:700; color:#1e293b;">ระบุจำนวนเคสของแต่ละหมวดหมู่</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button onclick="qcClearAutoPlanInputs()" style="display:inline-flex; align-items:center; gap:4px; border:1px solid #fca5a5; background:#fff5f5; color:#dc2626; padding: 4px 10px; border-radius: 6px; cursor:pointer; font-family:Kanit; font-size:0.75rem; font-weight:600; transition:all 0.2s;" onmouseover="this.style.background='#fee2e2'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='#fff5f5'; this.style.transform='none';">
                <i data-lucide="trash-2" style="width:13px; height:13px;"></i> ล้างค่า
              </button>
              <span style="font-size: 0.82rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); color:#fff; padding: 5px 14px; border-radius: 20px; display:inline-flex; align-items:center; gap:5px; font-weight:700; box-shadow:0 2px 6px rgba(79,70,229,0.3);">
                <i data-lucide="hash" style="width:13px; height:13px;"></i>
                รวม: <strong id="qcAutoPlanTotalCases" style="font-size:1rem;">0</strong> เคส
              </span>
            </div>
          </div>

          <div class="scheduler-scrollbar" style="max-height: 280px; overflow-y: auto; padding-right: 4px; margin-bottom: 16px;">
            <!-- QC Grid: dynamically filled -->
            <div id="qcCatGridQC" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px;">
              ${qcCategoryGridHtml}
            </div>
            <!-- Manual Grid -->
            <div id="qcCatGridManual" style="display:none; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px;">
              ${manualCategoryGridHtml}
            </div>
          </div>

          <div class="qc-modal-actions" style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn-modal-cancel" onclick="qcAutoPlanGoToStep(1)" style="padding:10px 20px; border:1px solid #cbd5e1; background:#fff; border-radius:10px; cursor:pointer; font-family:Kanit; font-size:0.82rem; color:#64748b; display:flex; align-items:center; gap:6px;"><i data-lucide="arrow-left" style="width:14px; height:14px;"></i> ย้อนกลับ</button>
            <button class="btn-modal-save" onclick="qcAutoPlanGoToStep(3)" style="padding:10px 24px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color:#fff; border:none; border-radius:10px; cursor:pointer; font-family:Kanit; font-size:0.82rem; font-weight:600; box-shadow: 0 2px 8px rgba(139,92,246,0.3); display:flex; align-items:center; gap:6px;">วิเคราะห์และจัดสรร <i data-lucide="wand-2" style="width:14px; height:14px;"></i></button>
          </div>
        </div>


        <!-- STEP 3 PANE -->
        <div id="qcAutoPane3" class="qc-auto-pane" style="display: none;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; font-size: 0.78rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div><strong>ประเภท:</strong> <span id="qcAutoPlanSummaryType">-</span></div>
            <div><strong>วันของข้อมูล:</strong> <span id="qcAutoPlanSummaryDataDate">-</span></div>
            <div><strong>เคสทั้งหมด:</strong> <span id="qcAutoPlanSummaryTotalCases">-</span> เคส</div>
          </div>

          <div id="qcAutoPlanAlert" style="display:none; background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:8px 12px; margin-bottom:12px; font-size:0.72rem; color:#b45309; font-weight:600; align-items:center; gap:6px;">
            <i data-lucide="alert-triangle" style="width:14px; height:14px; color:#d97706; flex-shrink:0;"></i>
            <span id="qcAutoPlanAlertText">ความจุรวมของพนักงานไม่พอรองรับจำนวนเคส</span>
          </div>

          <div style="font-size:0.78rem; font-weight:700; color:#334155; margin-bottom:6px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:4px;">
              <i data-lucide="users" style="width:14px; height:14px; color:#8b5cf6;"></i>
              ข้อเสนอการจัดสรรภาระงาน:
            </div>
            <div style="font-size:0.72rem; color:#4f46e5; background:#e0e7ff; padding:2px 10px; border-radius:20px;">
              ผู้รับเคสรวม <span id="qcAutoPlanTotalPeopleCount">0</span> คน
            </div>
          </div>

          <div class="scheduler-scrollbar" style="max-height: 220px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 10px; background:#fff; margin-bottom:16px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; text-align: left;">
              <thead>
                <tr style="background:#f1f5f9; border-bottom: 1px solid #e2e8f0; font-weight:700; color:#475569;">
                  <th style="padding: 8px; width: 40px; text-align: center;"><input type="checkbox" id="qcAutoPlanSelectAll" checked onchange="qcAutoPlanToggleSelectAll(this)"></th>
                  <th style="padding: 8px; width: 140px;">พนักงาน</th>
                  <th style="padding: 8px; width: 220px; text-align:center;">ภาระงานเดิม (%)</th>
                  <th style="padding: 8px;">จำนวนคดีที่ระบบจัดสรรให้</th>
                </tr>
              </thead>
              <tbody id="qcAutoPlanProposalTable">
                <!-- Proposal Rows dynamically loaded -->
              </tbody>
            </table>
          </div>

          <div class="qc-modal-actions" style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn-modal-cancel" onclick="qcAutoPlanGoToStep(2)" style="padding:10px 20px; border:1px solid #cbd5e1; background:#fff; border-radius:10px; cursor:pointer; font-family:Kanit; font-size:0.82rem; color:#64748b; display:flex; align-items:center; gap:6px;"><i data-lucide="arrow-left" style="width:14px; height:14px;"></i> ย้อนกลับ</button>
            <button class="btn-modal-save" onclick="qcSaveAutoPlan()" style="padding:10px 24px; background: linear-gradient(135deg, #10b981, #059669); color:#fff; border:none; border-radius:10px; cursor:pointer; font-family:Kanit; font-size:0.82rem; font-weight:600; box-shadow: 0 2px 8px rgba(16,185,129,0.3); display:flex; align-items:center; gap:6px;"><i data-lucide="save" style="width:14px; height:14px;"></i> ยืนยันสร้างแผนงาน</button>
          </div>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Initialize Global Auto Plan State
  window.QC_AUTO_PLAN_STATE = {
    step: 1,
    categories: {},
    planType: '',
    qcSubtype: '',
    channel: '',
    workDate: '',
    dataDate: '',
    allocations: []
  };

  // Initialize Flatpickr for Data Date (วันของข้อมูล)
  if (typeof flatpickr !== 'undefined') {
    // Inject high z-index CSS for flatpickr calendar so it always floats above modal overlay
    if (!document.getElementById('qc-flatpickr-zindex-style')) {
      const fpStyle = document.createElement('style');
      fpStyle.id = 'qc-flatpickr-zindex-style';
      fpStyle.textContent = `
        .flatpickr-calendar { z-index: 999999 !important; font-family: 'Kanit', sans-serif !important; border-radius: 12px !important; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important; border: 1px solid #e2e8f0 !important; padding: 0 !important; }
        .flatpickr-calendar.hasTime.noCalendar { width: 160px !important; background: #fff !important; }
        .flatpickr-time { border-top: none !important; border-radius: 12px !important; height: 60px !important; line-height: 60px !important; display: flex !important; justify-content: center !important; align-items: center !important; max-height: 60px !important; background: #fff !important; }
        .flatpickr-time input.flatpickr-hour, .flatpickr-time input.flatpickr-minute { font-weight: 700 !important; font-size: 1.25rem !important; color: #4f46e5 !important; background: transparent !important; padding: 0 !important; text-align: center !important; }
        .flatpickr-time .numInputWrapper { height: 100% !important; width: 55px !important; }
        .flatpickr-time .flatpickr-time-separator { font-weight: 700 !important; font-size: 1.25rem !important; color: #94a3b8 !important; height: 100% !important; display: flex !important; align-items: center !important; margin: 0 4px !important; }
        .flatpickr-time .numInputWrapper span.arrowUp:after { border-bottom-color: #8b5cf6 !important; }
        .flatpickr-time .numInputWrapper span.arrowDown:after { border-top-color: #8b5cf6 !important; }
        .flatpickr-time input:hover, .flatpickr-time input:focus { background: #f1f5f9 !important; border-radius: 8px !important; color: #6d28d9 !important; }
        .flatpickr-time .numInputWrapper:hover { background: transparent !important; }
      `;
      document.head.appendChild(fpStyle);
    }

    const dataDateDisplay = document.getElementById('qcAutoDataDateDisplay');
    const dataDateHidden = document.getElementById('qcAutoDataDate');
    if (dataDateDisplay && dataDateHidden) {
      flatpickr(dataDateDisplay, {
        dateFormat: 'Y-m-d',
        locale: 'th',
        disableMobile: true,
        appendTo: document.body,    // Render outside modal to avoid clipping
        onReady: function(selectedDates) {
          // Leave it empty initially
          dataDateDisplay.value = '';
          dataDateHidden.value = '';
        },
        onChange: function(selectedDates, dateStr) {
          if (selectedDates.length > 0) {
            const d = selectedDates[0];
            const display = `${d.getDate()} ${thaiMonthsShort[d.getMonth()]}`;
            dataDateDisplay.value = display;
            dataDateHidden.value = dateStr;
            window.QC_AUTO_PLAN_STATE.dataDate = display;
          }
        }
      });
    }

    // Initialize Flatpickr for Work Date (วันที่ปฏิบัติงาน)
    const workDateDisplay = document.getElementById('qcAutoWorkDateDisplay');
    const workDateHidden = document.getElementById('qcAutoWorkDate');
    if (workDateDisplay && workDateHidden) {
      flatpickr(workDateDisplay, {
        dateFormat: 'Y-m-d',
        locale: 'th',
        disableMobile: true,
        appendTo: document.body,
        position: 'above',
        onReady: function(selectedDates) {
          // Leave it empty initially
          workDateDisplay.value = '';
          workDateHidden.value = '';
        },
        onChange: function(selectedDates, dateStr) {
          if (selectedDates.length > 0) {
            const d = selectedDates[0];
            const enDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            const enMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            workDateDisplay.value = `${enDays[d.getDay()]} (${d.getDate()} ${enMonths[d.getMonth()]})`;
            workDateHidden.value = dateStr;
            window.QC_AUTO_PLAN_STATE.workDate = dateStr;
          }
        }
      });
    }

    // Initialize flatpickr for time fields (24-hour format)
    const startTimeEl = document.getElementById('qcAutoStartTime');
    const endTimeEl = document.getElementById('qcAutoEndTime');
    if (startTimeEl && typeof flatpickr !== 'undefined') {
      flatpickr(startTimeEl, {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true,
        disableMobile: true,
        appendTo: document.body,
        placeholder: '00:00',
      });
    }
    if (endTimeEl && typeof flatpickr !== 'undefined') {
      flatpickr(endTimeEl, {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true,
        disableMobile: true,
        appendTo: document.body,
        placeholder: '23:59',
      });
    }
  }
};

window.qcAutoPlanToggleQcSubtype = function() {
  const type = document.getElementById('qcAutoPlanType')?.value;
  const subGroup = document.getElementById('qcAutoQcSubtypeGroup');
  const gridQC = document.getElementById('qcCatGridQC');
  const gridManual = document.getElementById('qcCatGridManual');

  if (type === 'QC') {
    if (subGroup) subGroup.style.display = 'block';
    if (gridQC) { gridQC.style.display = 'grid'; }
    if (gridManual) { gridManual.style.display = 'none'; }
  } else if (type === 'Manual') {
    if (subGroup) subGroup.style.display = 'none';
    if (gridQC) { gridQC.style.display = 'none'; }
    if (gridManual) { gridManual.style.display = 'grid'; }
  } else {
    if (subGroup) subGroup.style.display = 'none';
    if (gridQC) { gridQC.style.display = 'none'; }
    if (gridManual) { gridManual.style.display = 'none'; }
  }

  if (typeof window.qcUpdateAutoModalSuboptions === 'function') {
    window.qcUpdateAutoModalSuboptions();
  }
};

window.qcUpdateAutoModalSuboptions = function() {
  const type = document.getElementById('qcAutoPlanType')?.value;
  const subType = document.getElementById('qcAutoQcSubtype')?.value;
  const channel = document.getElementById('qcAutoChannel')?.value;
  const subGroup = document.getElementById('qcAutoSuboptionsGroup');
  if (subGroup) {
    const confMode = localStorage.getItem('qc_web_conf_mode') === 'conf';
    const confQc1 = localStorage.getItem('qc_web_conf_qc1') === 'true';
    const confQc2 = localStorage.getItem('qc_web_conf_qc2') === 'true';

    const showForQc1 = (subType === 'QC1' && confMode && confQc1);
    const showForQc2 = (subType === 'QC2' && confMode && confQc2);

    if (type === 'QC' && (showForQc1 || showForQc2) && channel === 'Website') {
      subGroup.style.display = 'block';
      const label = subGroup.querySelector('label');
      if (label) {
        label.textContent = `เงื่อนไข Website ${subType}`;
      }
    } else {
      subGroup.style.display = 'none';
    }
  }
};

window.qcGetDynamicCategories = function(qcType, subType, channel) {
  if (qcType === 'Manual') {
    return ['จำนวนเคสทั้งหมด'];
  }
  
  if (subType === 'QC1') {
    if (channel === 'Website') {
      return ['โฆษณาพนัน', 'อื่นๆ ยกเว้นโฆษณาพนัน'];
    } else if (channel === 'Social') {
      return ['พนัน', 'อื่นๆ ที่ไม่ใช่หมวดพนันและหมวดสินค้า (12 หมวด)', 'สินค้า (5 หมวด มี กัญชา บุหรี่ไฟฟ่้า แอลกอฮอล์ กระท่อม ปืน)'];
    }
  } else if (subType === 'QC2') {
    if (channel === 'Website') {
      return ['Confidence 70-100', 'Confidence 0-69', 'URL'];
    } else if (channel === 'Social') {
      return ['พนัน', 'สินค้า', 'อื่นๆ ที่ไม่ใช่หมวดพนันและหมวดสินค้า (12 หมวด)'];
    }
  }
  
  return window.QC_CATEGORIES || [];
};

window.qcAutoPlanGoToStep = function(stepNum) {
  // Validate and read fields for Step 1
  if (stepNum === 2) {
    const type = document.getElementById('qcAutoPlanType').value;
    let subType = document.getElementById('qcAutoQcSubtype')?.value || '';
    const channel = document.getElementById('qcAutoChannel').value;
    
    if (!type) {
      if (typeof window.showToast === 'function') window.showToast('กรุณาเลือกประเภทแผนงาน', 'warning');
      return;
    }
    if (type === 'QC' && !subType) {
      if (typeof window.showToast === 'function') window.showToast('กรุณาเลือกรอบการ QC', 'warning');
      return;
    }
    if (!channel) {
      if (typeof window.showToast === 'function') window.showToast('กรุณาเลือกช่องทาง (Channel)', 'warning');
      return;
    }

    const confMode = localStorage.getItem('qc_web_conf_mode') === 'conf';
    const confQc1 = localStorage.getItem('qc_web_conf_qc1') === 'true';
    const confQc2 = localStorage.getItem('qc_web_conf_qc2') === 'true';
    const showForQc1 = (subType === 'QC1' && confMode && confQc1);
    const showForQc2 = (subType === 'QC2' && confMode && confQc2);
    // Subcondition radio overrides removed as they are now handled via dynamic categories

    // dataDate: read Thai format from display field (e.g. "22 พ.ค."), fallback to hidden ISO value
    const dataDateDisplay = document.getElementById('qcAutoDataDateDisplay')?.value?.trim();
    const dataDateIso = document.getElementById('qcAutoDataDate')?.value?.trim();
    const startTime = document.getElementById('qcAutoStartTime')?.value;
    const endTime = document.getElementById('qcAutoEndTime')?.value;
    let dataTime = '';
    if (startTime && endTime) {
      dataTime = `${startTime}-${endTime}`;
    } else if (startTime) {
      dataTime = `ตั้งแต่ ${startTime}`;
    } else if (endTime) {
      dataTime = `ถึง ${endTime}`;
    }
    const workDate = document.getElementById('qcAutoWorkDate')?.value?.trim();

    // Convert ISO to Thai if display is empty
    const thaiMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    let dataDate = dataDateDisplay;
    if (!dataDate && dataDateIso) {
      const d = new Date(dataDateIso);
      dataDate = `${d.getDate()} ${thaiMonths[d.getMonth()]}`;
    }

    if (!dataDate) {
      if (typeof window.showToast === 'function') window.showToast('กรุณาเลือกวันของข้อมูล', 'warning');
      return;
    }
    
    if (dataTime) {
      dataDate += ` (${dataTime})`;
    }

    if (!workDate) {
      if (typeof window.showToast === 'function') window.showToast('กรุณาเลือกวันที่ปฏิบัติงาน', 'warning');
      return;
    }

    window.QC_AUTO_PLAN_STATE.planType = type;
    window.QC_AUTO_PLAN_STATE.qcSubtype = subType;
    window.QC_AUTO_PLAN_STATE.channel = channel;
    window.QC_AUTO_PLAN_STATE.dataDate = dataDate;
    window.QC_AUTO_PLAN_STATE.workDate = workDate;
  }

  // Validate and run allocation for Step 3
  if (stepNum === 3) {
    // Read categories only from the active grid
    const activeGrid = window.QC_AUTO_PLAN_STATE.planType === 'Manual' ? document.getElementById('qcCatGridManual') : document.getElementById('qcCatGridQC');
    const inputs = activeGrid ? activeGrid.querySelectorAll('.qc-auto-cat-input') : [];
    let total = 0;
    const enteredCats = {};
    inputs.forEach(inp => {
      const cat = inp.getAttribute('data-category');
      const val = parseInt((inp.value || '').replace(/,/g, ''), 10) || 0;
      if (val > 0) {
        enteredCats[cat] = val;
        total += val;
      }
    });

    if (total === 0) {
      if (typeof window.showToast === 'function') window.showToast('กรุณากรอกจำนวนเคสอย่างน้อย 1 หมวดหมู่', 'warning');
      return;
    }

    window.QC_AUTO_PLAN_STATE.categories = enteredCats;
    
    // Reset unchecked employees if entering Step 3 fresh (optional, but good practice)
    if (!window.QC_AUTO_PLAN_STATE.uncheckedIds) {
      window.QC_AUTO_PLAN_STATE.uncheckedIds = [];
    }

    // Summary
    const summaryType = window.QC_AUTO_PLAN_STATE.planType === 'QC' 
      ? `${window.QC_AUTO_PLAN_STATE.qcSubtype} (${window.QC_AUTO_PLAN_STATE.channel})`
      : `Manual (${window.QC_AUTO_PLAN_STATE.channel})`;
      
    document.getElementById('qcAutoPlanSummaryType').textContent = summaryType;
    document.getElementById('qcAutoPlanSummaryDataDate').textContent = window.QC_AUTO_PLAN_STATE.dataDate;
    document.getElementById('qcAutoPlanSummaryTotalCases').textContent = total.toLocaleString('en-US');

    // Run allocation
    qcAutoPlanRunAllocation(total, enteredCats);
  }

  // Toggle visible pane
  document.querySelectorAll('.qc-auto-pane').forEach(el => el.style.display = 'none');
  document.getElementById('qcAutoPane' + stepNum).style.display = 'block';

  if (stepNum === 2) {
    const state = window.QC_AUTO_PLAN_STATE;
    const cats = window.qcGetDynamicCategories(state.planType, state.qcSubtype, state.channel);

    // --- Populate Info Banner ---
    const planTypeLabel = state.planType === 'QC' ? `${state.qcSubtype}` : 'Manual';
    const channelColor = state.channel === 'Website' ? '#0ea5e9' : '#8b5cf6';
    const channelBg = state.channel === 'Website' ? '#e0f2fe' : '#ede9fe';
    const channelIcon = state.channel === 'Website' ? 'globe' : 'share-2';
    const typeColor = state.planType === 'Manual' ? '#f59e0b' : (state.qcSubtype === 'QC1' ? '#10b981' : '#4f46e5');
    const typeBg = state.planType === 'Manual' ? '#fef3c7' : (state.qcSubtype === 'QC1' ? '#d1fae5' : '#ede9fe');

    // Work date & Data date display
    const workDateDisplay = document.getElementById('qcAutoWorkDateDisplay')?.value || document.getElementById('qcAutoWorkDate')?.value || '-';
    const dataDateDisplay = document.getElementById('qcAutoDataDateDisplay')?.value || document.getElementById('qcAutoDataDate')?.value || '-';
    const startTime = document.getElementById('qcAutoStartTime')?.value || '';
    const endTime = document.getElementById('qcAutoEndTime')?.value || '';
    let timeText = '';
    if (startTime && endTime) timeText = `${startTime} – ${endTime} น.`;
    else if (startTime) timeText = `ตั้งแต่ ${startTime} น.`;
    else if (endTime) timeText = `ถึง ${endTime} น.`;

    const banner = document.getElementById('qcAutoPane2InfoBanner');
    if (banner) {
      banner.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:8px;">
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; gap:3px;">
            <span style="font-size:0.65rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">ประเภทงาน</span>
            <span style="font-size:0.82rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:5px;">
              <span style="background:${typeBg}; color:${typeColor}; padding:2px 8px; border-radius:20px; font-size:0.75rem; font-weight:700;">${planTypeLabel}</span>
            </span>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; gap:3px;">
            <span style="font-size:0.65rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">ช่องทาง</span>
            <span style="background:${channelBg}; color:${channelColor}; padding:2px 8px; border-radius:20px; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:4px; width:fit-content; margin-top:2px;">
              <i data-lucide="${channelIcon}" style="width:11px; height:11px;"></i> ${state.channel}
            </span>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; gap:3px;">
            <span style="font-size:0.65rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">วันของข้อมูล</span>
            <span style="font-size:0.8rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:4px;">
              <i data-lucide="calendar" style="width:12px; height:12px; color:#8b5cf6;"></i> ${dataDateDisplay || '-'}
            </span>
          </div>
          ${timeText ? `
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; gap:3px;">
            <span style="font-size:0.65rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">ช่วงเวลา</span>
            <span style="font-size:0.8rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:4px;">
              <i data-lucide="clock" style="width:12px; height:12px; color:#0ea5e9;"></i> ${timeText}
            </span>
          </div>` : ''}
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; gap:3px;">
            <span style="font-size:0.65rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">วันทำงาน</span>
            <span style="font-size:0.8rem; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:4px;">
              <i data-lucide="briefcase" style="width:12px; height:12px; color:#f59e0b;"></i> ${workDateDisplay || '-'}
            </span>
          </div>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // --- Populate Grid ---
    const catColors = ['#4f46e5','#0ea5e9','#10b981','#f59e0b','#e11d48','#8b5cf6','#06b6d4','#84cc16'];
    const gridHtml = cats.map((cat, idx) => {
      const accent = catColors[idx % catColors.length];
      const prevVal = state.categories && state.categories[cat] ? state.categories[cat] : '';
      const formattedPrevVal = prevVal ? Number(prevVal).toLocaleString('en-US') : '';
      return `
        <div style="background:#fff; border:1.5px solid #e2e8f0; border-radius:12px; padding:14px 12px; display:flex; flex-direction:column; gap:8px; transition:all 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.05);"
             onmouseover="this.style.borderColor='${accent}'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'; this.style.transform='translateY(-2px)';"
             onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'; this.style.transform='none';">
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="width:8px; height:8px; border-radius:50%; background:${accent}; flex-shrink:0;"></div>
            <label style="font-size:0.73rem; color:#334155; font-weight:700; line-height:1.3;">${cat}</label>
          </div>
          <div style="position:relative;">
            <input type="text" inputmode="numeric" class="qc-auto-cat-input" data-category="${cat}" placeholder="0"
              value="${formattedPrevVal}"
              oninput="window.qcAutoPlanOnInputCat(this); this.parentElement.querySelector('.unit-badge').style.color='${accent}';"
              style="width:100%; padding:8px 36px 8px 10px; border-radius:8px; border:1.5px solid #e2e8f0; font-family:Kanit; font-size:1rem; font-weight:700; text-align:center; background:#f8fafc; box-sizing:border-box; outline:none; transition:border 0.2s;"
              onfocus="this.style.borderColor='${accent}'; this.style.background='#fff';"
              onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';">
            <span class="unit-badge" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:0.65rem; color:#94a3b8; font-weight:600; pointer-events:none;">เคส</span>
          </div>
        </div>
      `;
    }).join('');

    const activeGrid = state.planType === 'Manual' ? document.getElementById('qcCatGridManual') : document.getElementById('qcCatGridQC');
    const inactiveGrid = state.planType === 'Manual' ? document.getElementById('qcCatGridQC') : document.getElementById('qcCatGridManual');
    
    if (activeGrid) {
      activeGrid.innerHTML = gridHtml;
      activeGrid.style.display = 'grid';
    }
    if (inactiveGrid) {
      inactiveGrid.style.display = 'none';
    }

    qcAutoPlanRecalculateTotals();
  }

  // Toggle indicators
  for (let i = 1; i <= 3; i++) {
    const ind = document.getElementById('qcAutoStepIndicator' + i);
    const badge = ind.querySelector('span');
    if (i === stepNum) {
      ind.style.color = '#4f46e5';
      badge.style.background = '#4f46e5';
    } else if (i < stepNum) {
      ind.style.color = '#10b981';
      badge.style.background = '#10b981';
    } else {
      ind.style.color = '#64748b';
      badge.style.background = '#cbd5e1';
    }
  }

  window.QC_AUTO_PLAN_STATE.step = stepNum;
};

window.qcClearAutoPlanInputs = async function() {
  const activeGrid = window.QC_AUTO_PLAN_STATE.planType === 'Manual' ? document.getElementById('qcCatGridManual') : document.getElementById('qcCatGridQC');
  const inputs = activeGrid ? activeGrid.querySelectorAll('.qc-auto-cat-input') : [];
  let hasValue = false;
  inputs.forEach(inp => {
    if (inp.value.trim() !== '') hasValue = true;
  });
  if (!hasValue) return;

  const confirmed = await window.qcCustomConfirm({
    title: 'ยืนยันการล้างข้อมูล',
    message: 'คุณต้องการล้างจำนวนเคสที่กรอกไว้ทั้งหมดใช่หรือไม่?',
    confirmText: 'ล้างข้อมูล',
    cancelText: 'ยกเลิก',
    isDanger: true
  });

  if (confirmed) {
    inputs.forEach(inp => {
      inp.value = '';
    });
    window.qcAutoPlanRecalculateTotals();
    if (typeof window.showToast === 'function') {
      window.showToast('ล้างจำนวนเคสทั้งหมดแล้ว', 'info');
    }
  }
};

window.qcAutoPlanRecalculateTotals = function() {
  const activeGrid = window.QC_AUTO_PLAN_STATE.planType === 'Manual' ? document.getElementById('qcCatGridManual') : document.getElementById('qcCatGridQC');
  const inputs = activeGrid ? activeGrid.querySelectorAll('.qc-auto-cat-input') : [];
  let total = 0;
  inputs.forEach(inp => {
    total += parseInt((inp.value || '').replace(/,/g, ''), 10) || 0;
  });

  const totalEl = document.getElementById('qcAutoPlanTotalCases');
  if (totalEl) totalEl.textContent = total.toLocaleString('en-US');

  const channel = window.QC_AUTO_PLAN_STATE.channel || '';
  const qcSubtype = window.QC_AUTO_PLAN_STATE.qcSubtype || '';

  let ratesV2 = {};
  try {
    const raw = localStorage.getItem('qc_workload_rates_v2');
    ratesV2 = (raw && raw !== '{}') ? JSON.parse(raw) : window.DEFAULT_QC_RATES_V2;
  } catch(e) {
    ratesV2 = window.DEFAULT_QC_RATES_V2;
  }

  // Update percentages based on actual configured workload rates
  inputs.forEach(inp => {
    const cat = inp.getAttribute('data-category');
    const val = parseInt((inp.value || '').replace(/,/g, ''), 10) || 0;
    const percEl = activeGrid ? activeGrid.querySelector(`.qc-auto-cat-perc[data-category="${cat}"]`) : null;
    if (percEl) {
      if (val > 0) {
        const rate = window.qcGetRateForTask(ratesV2, cat, channel, qcSubtype);
        const totalPct = val * rate;
        const formattedPct = Math.round(totalPct);
        percEl.textContent = `${formattedPct}%`;
        percEl.style.color = '#4f46e5';
      } else {
        percEl.textContent = '0%';
        percEl.style.color = '#64748b';
      }
    }
  });
};

function qcAutoPlanRunAllocation(totalCases, categoriesMap) {
  const selectedWorkDateStr = window.QC_AUTO_PLAN_STATE.workDate;
  const workDate = new Date(selectedWorkDateStr);

  // Active employees list
  let activeEmps = qcGetEmployees();

  // Filter hidden employees
  try {
    const hiddenEmps = JSON.parse(localStorage.getItem('qc_hidden_employees') || '[]');
    if (hiddenEmps.length > 0) {
      activeEmps = activeEmps.filter(e => !hiddenEmps.includes(e.id));
    }
  } catch(e) {}

  // Load Leaves
  const leavesByPersonDay = {};
  if (typeof DATA !== 'undefined' && Array.isArray(DATA.leaveRequests)) {
    DATA.leaveRequests.forEach(r => {
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
        leavesByPersonDay[`${(r.name || '').trim().toLowerCase()}_${dIso}`] = r;
        dCurr.setDate(dCurr.getDate() + 1);
      }
    });
  }

  const realDayMap = { 'อา.': 0, 'จ.': 1, 'อ.': 2, 'พ.': 3, 'พฤ.': 4, 'ศ.': 5, 'ส.': 6, 'อาทิตย์': 0, 'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัสบดี': 4, 'ศุกร์': 5, 'เสาร์': 6 };
  
  // Find available employees
  const availableEmployees = [];
  activeEmps.forEach(e => {
    const offdaysStr = e.offdays || '';
    const offDays = offdaysStr.split(/[,|\-]/).map(d => realDayMap[d.trim().replace('วัน', '')]).filter(v => v !== undefined);
    
    const isOff = offDays.includes(workDate.getDay());
    const leave = leavesByPersonDay[`${e.name.trim().toLowerCase()}_${selectedWorkDateStr}`] ||
                  leavesByPersonDay[`${(e.nameEn || '').trim().toLowerCase()}_${selectedWorkDateStr}`];

    // Exclude if off or on leave
    if (isOff || leave) return;

    // Load existing plans for employee on this date
    const empPlans = (window.QC_PLANS || []).filter(p => p.name === e.name && p.date === selectedWorkDateStr);
    const currentCases = empPlans.reduce((s, p) => s + p.cases, 0);

    let ratesV2 = {};
    try {
      const raw = localStorage.getItem('qc_workload_rates_v2');
      ratesV2 = (raw && raw !== '{}') ? JSON.parse(raw) : window.DEFAULT_QC_RATES_V2;
    } catch(e) {
      ratesV2 = window.DEFAULT_QC_RATES_V2;
    }

    let qcPercent = 0;
    empPlans.forEach(dp => {
      qcPercent += dp.cases * window.qcGetRateForTask(ratesV2, dp.category, dp.channel, dp.qcType);
    });

    // Calculate SCHEDULE_TASKS percentage
    const scheduleTasks = (window.SCHEDULE_TASKS || []).filter(t => {
      if (t.date !== selectedWorkDateStr) return false;
      const empName = e.name?.trim().toLowerCase();
      const empNick = e.nickname?.trim().toLowerCase();
      const empNameEn = e.nameEn?.trim().toLowerCase();
      const tName = (t.oldName || '').trim().toLowerCase();
      const tPerson = (t.person || '').trim().toLowerCase();
      const tPersonId = (e.id || '').trim().toLowerCase();
      return tName === empName || tName === empNick || tName === empNameEn ||
             tPerson === tPersonId || tPerson === empName;
    });
    const currentPercent = scheduleTasks.reduce((s, t) => s + (parseInt(t.hours) || parseInt(t.workload) || parseInt(t.percent) || 0), 0) + qcPercent;

    if (currentPercent >= 100) return; // Exclude fully loaded employees

    availableEmployees.push({
      employee: e,
      name: e.name,
      team: e.dept || '-',
      shift: e.shift || '-',
      currentCases: currentCases,
      currentPercent: currentPercent,
      scheduleTasks: scheduleTasks,
      empPlans: empPlans,
      isUnchecked: (window.QC_AUTO_PLAN_STATE.uncheckedIds || []).includes(e.id),
      allocatedCases: {}, // Map of category -> cases
      totalAllocated: 0
    });
  });

  if (availableEmployees.length > 0) {
    const checkedEmployees = availableEmployees.filter(e => !e.isUnchecked);
    
    if (checkedEmployees.length > 0) {
      // Sort employees by currentPercent ascending to prioritize those with less workload
      checkedEmployees.sort((a, b) => a.currentPercent - b.currentPercent);

      let ratesV2 = {};
      try {
        const raw = localStorage.getItem('qc_workload_rates_v2');
        ratesV2 = (raw && raw !== '{}') ? JSON.parse(raw) : window.DEFAULT_QC_RATES_V2;
      } catch(e) {
        ratesV2 = window.DEFAULT_QC_RATES_V2;
      }
      const planChan = window.QC_AUTO_PLAN_STATE.channel || '';
      const planType = window.QC_AUTO_PLAN_STATE.planType === 'QC' ? window.QC_AUTO_PLAN_STATE.qcSubtype : 'Manual';

      let remainingCasesMap = { ...categoriesMap };
      let currentEmpIndex = 0;
      window.QC_AUTO_PLAN_CAPACITY_EXCEEDED = false;

      for (const [cat, count] of Object.entries(remainingCasesMap)) {
        let rem = count;
        
        const ratePerCase = typeof window.qcGetRateForTask === 'function' 
          ? window.qcGetRateForTask(ratesV2, cat, planChan, planType) 
          : 0.1;

        while (rem > 0 && currentEmpIndex < checkedEmployees.length) {
          const emp = checkedEmployees[currentEmpIndex];
          
          let newlyAllocatedPercent = 0;
          for (const [aCat, aVal] of Object.entries(emp.allocatedCases)) {
             const aRate = typeof window.qcGetRateForTask === 'function' ? window.qcGetRateForTask(ratesV2, aCat, planChan, planType) : 0.1;
             newlyAllocatedPercent += aVal * aRate;
          }
          
          const totalEmpPercent = emp.currentPercent + newlyAllocatedPercent;
          const remainingPercent = 120 - totalEmpPercent;
          
          let spaceLeftCases = ratePerCase > 0 ? Math.floor(remainingPercent / ratePerCase) : rem;
          
          if (spaceLeftCases <= 0) {
            currentEmpIndex++;
            continue;
          }

          const give = Math.min(rem, spaceLeftCases);
          emp.allocatedCases[cat] = (emp.allocatedCases[cat] || 0) + give;
          emp.totalAllocated += give;
          rem -= give;

          if (rem > 0) {
            currentEmpIndex++;
          }
        }
        
        // If we ran out of employees but still have cases, it means capacity exceeded
        if (rem > 0) {
          window.QC_AUTO_PLAN_CAPACITY_EXCEEDED = true;
          // Distribute remaining cases evenly to those with least workload
          while (rem > 0 && checkedEmployees.length > 0) {
            checkedEmployees.sort((a, b) => {
               let pctA = a.currentPercent;
               for(let c in a.allocatedCases) pctA += a.allocatedCases[c] * (typeof window.qcGetRateForTask === 'function' ? window.qcGetRateForTask(ratesV2, c, planChan, planType) : 0.1);
               let pctB = b.currentPercent;
               for(let c in b.allocatedCases) pctB += b.allocatedCases[c] * (typeof window.qcGetRateForTask === 'function' ? window.qcGetRateForTask(ratesV2, c, planChan, planType) : 0.1);
               return pctA - pctB;
            });
            const topEmp = checkedEmployees[0];
            topEmp.allocatedCases[cat] = (topEmp.allocatedCases[cat] || 0) + 1;
            topEmp.totalAllocated += 1;
            rem -= 1;
          }
        }
      }
    }
  }

  const alertEl = document.getElementById('qcAutoPlanAlert');
  if (alertEl) {
    alertEl.style.display = window.QC_AUTO_PLAN_CAPACITY_EXCEEDED ? 'flex' : 'none';
    const alertText = document.getElementById('qcAutoPlanAlertText');
    if (alertText && window.QC_AUTO_PLAN_CAPACITY_EXCEEDED) {
      alertText.textContent = 'ความจุรวมของพนักงานเกิน 120% แล้ว ระบบได้ทำการกระจายเคสส่วนเกินให้เท่าๆ กัน';
    }
  }

  // Populate UI table
  const tbody = document.getElementById('qcAutoPlanProposalTable');
  if (tbody) {
    if (availableEmployees.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:30px;">
        <i data-lucide="user-x" style="width:30px; height:30px; opacity:0.5; margin-bottom:6px; display:inline-block;"></i><br>
        ไม่มีพนักงานปฏิบัติงานในวันนี้ หรือทุกคนติดลางาน/วันหยุดประจำสัปดาห์
      </td></tr>`;
      if (typeof lucide !== 'undefined') lucide.createIcons({ root: tbody });
      return;
    }

    window.QC_AUTO_PLAN_STATE.allocations = availableEmployees;
    
    const checkedCount = availableEmployees.filter(e => !e.isUnchecked).length;
    const chkAll = document.getElementById('qcAutoPlanSelectAll');
    if (chkAll && availableEmployees.length > 0) {
      chkAll.checked = (checkedCount === availableEmployees.length);
    }

    // Sort for display using custom order
    let empOrderMap = {};
    try {
      const stored = JSON.parse(localStorage.getItem('qc_employee_order') || '{}');
      if (Array.isArray(stored)) {
        stored.forEach((id, idx) => { empOrderMap[id] = idx; });
      } else {
        empOrderMap = stored;
      }
    } catch(e) {}

    availableEmployees.sort((a, b) => {
      const idxA = empOrderMap[a.employee.id];
      const idxB = empOrderMap[b.employee.id];
      if (idxA !== undefined && idxB !== undefined) return idxA - idxB;
      if (idxA !== undefined) return -1;
      if (idxB !== undefined) return 1;
      return (a.employee.rank || 999) - (b.employee.rank || 999);
    });

    let rows = '';
    availableEmployees.forEach((emp, idx) => {

      let newPercent = 0;
      const planType = window.QC_AUTO_PLAN_STATE.planType === 'QC' ? window.QC_AUTO_PLAN_STATE.qcSubtype : 'Manual';
      const planChan = window.QC_AUTO_PLAN_STATE.channel;
      let rV2 = {};
      try {
        const raw = localStorage.getItem('qc_workload_rates_v2');
        rV2 = (raw && raw !== '{}') ? JSON.parse(raw) : window.DEFAULT_QC_RATES_V2;
      } catch(e) { rV2 = window.DEFAULT_QC_RATES_V2; }

      const allocatedString = Object.entries(emp.allocatedCases)
        .map(([cat, val]) => {
          if (typeof window.qcGetRateForTask === 'function') {
            newPercent += val * window.qcGetRateForTask(rV2, cat, planChan, planType);
          }
          return `
          <div class="qc-alloc-chip" style="display:inline-flex; align-items:center; gap:6px; background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; padding:2px 8px; border-radius:6px; margin:2px; font-weight:700;">
            <span>${cat}:</span>
            <input type="hidden" class="qc-proposal-val" data-emp="${emp.name}" data-category="${cat}" value="${val}">
            <span style="font-weight:800; color:#1d4ed8;">${Number(val).toLocaleString('en-US')}</span>
            <button type="button" onclick="qcAutoPlanRemoveAllocationItem(this, '${idx}', '${cat}')" style="background:#fee2e2; border:none; cursor:pointer; color:#ef4444; width:16px; height:16px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-left:6px; transition:all 0.15s; outline:none;" onmouseover="this.style.background='#fca5a5'; this.style.color='#b91c1c';" onmouseout="this.style.background='#fee2e2'; this.style.color='#ef4444';" title="ลบรายการนี้">
              <span style="font-size:9px; font-weight:900; font-family:system-ui, sans-serif; line-height:1; transform:translateY(-0.5px);">✕</span>
            </button>
          </div>
        `;
        }).join('');
      
      const combinedPct = emp.currentPercent + newPercent;
      const formattedCombinedPct = Math.round(combinedPct);
      const combinedColor = typeof window.getWorkloadColor === 'function' ? window.getWorkloadColor(combinedPct) : (combinedPct > 100 ? '#ef4444' : '#10b981');

      const scheduleChipsHtml = (emp.scheduleTasks || []).map(t => {
        const proj = (t.acc || '').trim();
        const node = (t.node || '').trim();
        const title = (t.title || '').trim();
        const pct = parseInt(t.hours) || parseInt(t.workload) || parseInt(t.percent) || 0;
        const label = [proj, node].filter(Boolean).join(' · ') || title || 'งาน';
        return `
          <div style="background:#f5f3ff; color:#6d28d9; border:1px solid #ddd6fe; font-size:0.6rem; font-weight:600; padding:2px 4px; border-radius:4px; margin-bottom:2px; display:flex; align-items:center; justify-content:space-between; gap:4px;">
            <div style="display:flex; align-items:center; gap:2px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; max-width: 140px;" title="${label}">
              <i data-lucide="calendar-clock" style="width:10px; height:10px; flex-shrink:0;"></i>
              <span style="overflow:hidden; text-overflow:ellipsis;">${label}</span>
            </div>
            ${pct ? `<span style="background:rgba(109,40,217,0.1); padding:0 3px; border-radius:3px; font-size:0.55rem; flex-shrink:0;">${pct}%</span>` : ''}
          </div>
        `;
      }).join('');
      
      const qcChipsHtml = (emp.empPlans || []).map(dp => {
        const dpType = dp.qcType || '';
        const cat = dp.category || '';
        const shortChannel = dp.channel === 'Website' ? 'Web' : (dp.channel === 'Social' ? 'Soc' : dp.channel);
        const channelText = shortChannel && shortChannel !== '-' && !dpType.includes('(') ? ` (${shortChannel})` : '';
        const displayType = `${dpType}${channelText}`;
        const displayCat = cat && cat !== '-' ? ` - ${cat}` : '';
        const fullText = `${displayType}${displayCat}`;

        return `
          <div style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:0.6rem; font-weight:600; padding:4px; border-radius:4px; margin-bottom:2px; display:flex; justify-content:space-between; align-items:center; gap:4px; line-height:1.2;">
            <span style="word-break:break-word;" title="${fullText}">${fullText}</span>
            <span style="font-weight:700; background:rgba(255,255,255,0.7); padding:0px 4px; border-radius:4px; flex-shrink:0; margin-left:auto;">${(dp.cases || 0).toLocaleString('en-US')}</span>
          </div>
        `;
      }).join('');

      const isChecked = !emp.isUnchecked;
      rows += `
        <tr style="border-bottom: 1px solid #e2e8f0; vertical-align:middle; transition: opacity 0.2s; opacity: ${isChecked ? '1' : '0.4'};" id="qc_prop_row_${idx}">
          <td style="padding: 8px; text-align: center; vertical-align:middle;">
            <input type="checkbox" class="qc-proposal-checkbox" data-idx="${idx}" data-emp-id="${emp.employee.id}" ${isChecked ? 'checked' : ''} onchange="qcAutoPlanToggleEmpRow(this);" style="cursor:pointer;">
          </td>
          <td style="padding: 8px; font-weight:700; color:#1e293b; vertical-align:middle;">
            ${emp.name} ${emp.employee && emp.employee.nickname && emp.employee.nickname !== '-' ? '(' + emp.employee.nickname + ')' : ''}<br>
            <span style="font-size:0.65rem; color:#64748b; font-weight:400;">ทีม ${emp.team} | กะ ${emp.shift}</span>
          </td>
          <td style="padding: 8px; vertical-align:top; width: 220px; background: #f8fafc;">
            ${scheduleChipsHtml || qcChipsHtml ? `
              <div class="scheduler-scrollbar" style="max-height:80px; overflow-y:auto; padding-right:2px; margin-bottom:4px;">
                ${qcChipsHtml}
                ${scheduleChipsHtml}
              </div>
            ` : ''}
            <div style="display:flex; align-items:center; justify-content:flex-end; gap:6px; margin-top:4px;">
              ${emp.currentCases > 0 ? `<div style="font-size:0.6rem; color:#64748b; font-weight:600; background:#fff; border:1px solid #cbd5e1; padding:2px 6px; border-radius:4px;">${(emp.currentCases || 0).toLocaleString('en-US')} เคส</div>` : ''}
              ${emp.currentPercent > 0 ? `
                <div style="background:${typeof window.getWorkloadColor === 'function' ? window.getWorkloadColor(emp.currentPercent) : (emp.currentPercent > 100 ? '#ef4444' : '#10b981')}; color:#fff; font-size:0.65rem; font-weight:800; padding:2px 8px; border-radius:99px; display:inline-block; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  รวม ${Math.round(emp.currentPercent)}%
                </div>
              ` : (emp.currentCases === 0 ? '<span style="color:#94a3b8; font-size:0.7rem; font-style:italic;">ว่าง</span>' : '')}
            </div>
          </td>
          <td style="padding: 8px; vertical-align:middle;" id="qc_proposal_chips_${emp.name}">
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div>
                ${allocatedString || '<span style="color:#94a3b8; font-style:italic;">ไม่ได้จัดสรรงานเพิ่ม</span>'}
              </div>
              ${newPercent > 0 ? `
              <div style="display:flex; align-items:center; gap:6px; margin-top:4px; margin-bottom:2px;">
                <span style="font-size:0.7rem; color:#475569; font-weight:600;">ภาระงานเคสใหม่:</span>
                <div style="background:#eff6ff; color:#1d4ed8; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:99px; border:1px solid #bfdbfe;">
                  ${Math.round(newPercent)}%
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                <span style="font-size:0.7rem; color:#475569; font-weight:600;">รวมภาระงานทั้งหมด:</span>
                <div style="background:${combinedColor}; color:#fff; font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:99px; display:inline-block; box-shadow:0 1px 3px rgba(0,0,0,0.15);">
                  ${formattedCombinedPct}%
                </div>
              </div>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rows;
    window.QC_AUTO_PLAN_STATE.allocations = availableEmployees;
    if (typeof qcAutoPlanUpdatePeopleCount === 'function') {
      qcAutoPlanUpdatePeopleCount();
    }
  }
}

window.qcAutoPlanRecalculateEmpTotal = function(name) {
  // Simple listener just in case they change it.
};

window.qcAutoPlanToggleSelectAll = function(el) {
  if (!window.QC_AUTO_PLAN_STATE) return;
  if (el.checked) {
    window.QC_AUTO_PLAN_STATE.uncheckedIds = [];
  } else {
    const checkboxes = document.querySelectorAll('.qc-proposal-checkbox');
    window.QC_AUTO_PLAN_STATE.uncheckedIds = Array.from(checkboxes).map(cb => cb.getAttribute('data-emp-id'));
  }
  qcAutoPlanReRun();
};

window.qcAutoPlanToggleEmpRow = function(cb) {
  if (!window.QC_AUTO_PLAN_STATE) return;
  const empId = cb.getAttribute('data-emp-id');
  if (!window.QC_AUTO_PLAN_STATE.uncheckedIds) window.QC_AUTO_PLAN_STATE.uncheckedIds = [];
  
  if (cb.checked) {
    window.QC_AUTO_PLAN_STATE.uncheckedIds = window.QC_AUTO_PLAN_STATE.uncheckedIds.filter(id => id !== empId);
  } else {
    if (!window.QC_AUTO_PLAN_STATE.uncheckedIds.includes(empId)) {
      window.QC_AUTO_PLAN_STATE.uncheckedIds.push(empId);
    }
  }
  qcAutoPlanReRun();
};

window.qcAutoPlanReRun = function() {
  const categories = window.QC_AUTO_PLAN_STATE.categories || {};
  const total = Object.values(categories).reduce((a, b) => a + b, 0);
  qcAutoPlanRunAllocation(total, categories);
};

window.qcAutoPlanUpdatePeopleCount = function() {
  const checkboxes = document.querySelectorAll('.qc-proposal-checkbox:checked');
  let countWithCases = 0;
  checkboxes.forEach(cb => {
    const idx = parseInt(cb.getAttribute('data-idx'));
    const empAlloc = window.QC_AUTO_PLAN_STATE?.allocations?.[idx];
    if (empAlloc && empAlloc.allocatedCases) {
      const hasCases = Object.values(empAlloc.allocatedCases).some(v => (parseInt(v) || 0) > 0);
      if (hasCases) {
        countWithCases++;
      }
    }
  });
  const cnt = document.getElementById('qcAutoPlanTotalPeopleCount');
  if (cnt) cnt.textContent = countWithCases;
};

window.qcSaveAutoPlan = function() {
  const state = window.QC_AUTO_PLAN_STATE;
  const checkboxes = document.querySelectorAll('.qc-proposal-checkbox');
  let savedAny = false;

  const type = state.planType === 'QC' ? state.qcSubtype : 'Manual';
  const channel = state.channel;
  const dataDate = state.dataDate;
  const workDateStr = state.workDate;

  checkboxes.forEach(cb => {
    if (!cb.checked) return;
    const idx = parseInt(cb.getAttribute('data-idx'));
    const empAlloc = state.allocations[idx];
    if (!empAlloc) return;

    // Gather inputs from the chips inside this employee's table cell
    const inputs = document.querySelectorAll(`.qc-proposal-val[data-emp="${empAlloc.name}"]`);
    inputs.forEach(inp => {
      const cat = inp.getAttribute('data-category');
      const val = parseInt((inp.value || '').replace(/,/g, ''), 10) || 0;
      if (val > 0) {
        // Create plan entry
        const id = 'QC-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        // Append data date to category
        const finalCategory = `${cat} (ข้อมูล ${dataDate})`;
        
        const plan = {
          id: id,
          name: empAlloc.name,
          qcType: type,
          channel: channel,
          category: finalCategory,
          date: workDateStr,
          cases: val,
          targetCases: state.dailyCapacity
        };

        window.QC_PLANS.push(plan);
        if (typeof window.qcSaveLocalPlan === 'function') window.qcSaveLocalPlan(plan);
        if (typeof apiSaveQcPlan === 'function') {
          apiSaveQcPlan({ action: 'add', ...plan });
        }
        if (typeof window.qcSyncPlanToSchedule === 'function') {
          window.qcSyncPlanToSchedule('add', plan);
        }
        savedAny = true;
      }
    });
  });

  if (!savedAny) {
    if (typeof window.showToast === 'function') window.showToast('กรุณาเลือกจัดสรรคดีอย่างน้อย 1 รายการ', 'warning');
    return;
  }

  // Remove Modal
  document.getElementById('qcAutoPlanModal')?.remove();

  // Show Success
  if (typeof window.showToast === 'function') {
    window.showToast('จัดแผนงานอัตโนมัติเรียบร้อยแล้ว!', 'success');
  }

  // Reload
  qcReloadPlan();
};

// --- Chart Init ---
function initQCDashboard() {
  if (typeof Chart === 'undefined') return;

  let fromStr = '', toStr = '';
  if (window._qcDateRange && window._qcDateRange.includes(' to ')) {
    const parts = window._qcDateRange.split(' to ');
    fromStr = parts[0];
    toStr = parts[1];
  }
  const dates = qcGetWeekDates(fromStr, toStr);
  const plans = window.QC_PLANS || [];
  const dateSet = new Set(dates.map(d => d.iso));
  let filteredPlans = fromStr ? plans.filter(p => dateSet.has(p.date)) : plans;
  filteredPlans = filteredPlans.filter(p => {
    if ((p.qcType || '').toLowerCase().includes('manual')) {
      const ch = (p.channel || '').toLowerCase();
      return ch === 'website' || ch === 'social';
    }
    return true;
  });

  // Compute chart data per date
  const labels = dates.map(d => d.label);
  const webData = dates.map(d => filteredPlans.filter(p => p.date === d.iso && (p.channel || '').toLowerCase().includes('website')).reduce((s, p) => s + p.cases, 0));
  const socialData = dates.map(d => filteredPlans.filter(p => p.date === d.iso && (p.channel || '').toLowerCase().includes('social')).reduce((s, p) => s + p.cases, 0));
  const webdData = dates.map(d => filteredPlans.filter(p => p.date === d.iso && (p.qcType || '').toUpperCase() === 'QC2' && (p.category || '').toUpperCase().includes('URL')).reduce((s, p) => s + p.cases, 0));

  // For QC Donut (Excluding Manual)
  const qcWeb = filteredPlans.filter(p => !(p.qcType || '').toLowerCase().includes('manual') && (p.channel || '').toLowerCase().includes('website')).reduce((s, p) => s + p.cases, 0);
  const qcSocial = filteredPlans.filter(p => !(p.qcType || '').toLowerCase().includes('manual') && (p.channel || '').toLowerCase().includes('social')).reduce((s, p) => s + p.cases, 0);
  const qcHasData = qcWeb > 0 || qcSocial > 0;
  const qcDatasetData = qcHasData ? [qcWeb, qcSocial] : [1];
  const qcColors = qcHasData ? ['#3b82f6', '#22c55e'] : ['#e2e8f0'];

  // For Manual Donut
  const manWeb = filteredPlans.filter(p => (p.qcType || '').toLowerCase().includes('manual') && (p.channel || '').toLowerCase().includes('website')).reduce((s, p) => s + p.cases, 0);
  const manSocial = filteredPlans.filter(p => (p.qcType || '').toLowerCase().includes('manual') && (p.channel || '').toLowerCase().includes('social')).reduce((s, p) => s + p.cases, 0);
  const manHasData = manWeb > 0 || manSocial > 0;
  const manDatasetData = manHasData ? [manWeb, manSocial] : [1];
  const manColors = manHasData ? ['#3b82f6', '#22c55e'] : ['#e2e8f0'];

  // 1. Bar + Line Chart
  const lineCtx = document.getElementById('qcLineChart');
  if (lineCtx) {
    new Chart(lineCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'line', label: 'คาดการณ์ส่ง WebD',
            data: webdData,
            borderColor: '#f59e0b', backgroundColor: '#f59e0b',
            borderWidth: 2, borderDash: [5, 5], tension: 0.3,
            pointRadius: 4, order: 0
          },
          {
            type: 'bar', label: 'Website',
            data: webData,
            backgroundColor: '#3b82f6', borderRadius: 4,
            stack: 'Stack 0', order: 1
          },
          {
            type: 'bar', label: 'Social',
            data: socialData,
            backgroundColor: '#22c55e', borderRadius: 4,
            stack: 'Stack 0', order: 2
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false },
          tooltip: {
            mode: 'index', 
            intersect: false,
            titleFont: { family: "'Kanit', sans-serif", size: 14 },
            bodyFont: { family: "'Kanit', sans-serif", size: 13 },
            usePointStyle: true,
            boxPadding: 4,
            callbacks: {
              labelPointStyle: function(context) {
                return {
                  pointStyle: context.dataset.label === 'คาดการณ์ส่ง WebD' ? 'circle' : 'rect',
                  rotation: 0
                };
              },
              labelColor: function(context) {
                return {
                  borderColor: context.dataset.backgroundColor,
                  backgroundColor: context.dataset.backgroundColor,
                  borderWidth: context.dataset.label === 'คาดการณ์ส่ง WebD' ? 2 : 0
                };
              }
            }
          }
        },
        scales: {
          y: { stacked: true, beginAtZero: true, ticks: { stepSize: 10, font: { size: 10 } }, grid: { color: '#f1f5f9' } },
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  // 2. QC Donut Chart
  const donutCtx = document.getElementById('qcDonutChart');
  if (donutCtx) {
    new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: qcHasData ? ['Website', 'Social'] : ['ไม่มีข้อมูล'],
        datasets: [{ data: qcDatasetData, backgroundColor: qcColors, borderWidth: 0, cutout: '75%' }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, datalabels: { display: false }, tooltip: { enabled: qcHasData } }
      }
    });
  }

  // 3. Manual Donut Chart
  const manualDonutCtx = document.getElementById('qcManualDonutChart');
  if (manualDonutCtx) {
    new Chart(manualDonutCtx, {
      type: 'doughnut',
      data: {
        labels: manHasData ? ['Website', 'Social'] : ['ไม่มีข้อมูล'],
        datasets: [{ data: manDatasetData, backgroundColor: manColors, borderWidth: 0, cutout: '75%' }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, datalabels: { display: false }, tooltip: { enabled: manHasData } }
      }
    });
  }
}

window.qcShowManageEmployeesModal = function(context = 'qc') {
  const allEmps = qcGetEmployees();
  let hiddenEmps = [];
  let empOrder = [];
  const hiddenKey = context === 'schedule' ? 'schedule_hidden_employees' : 'qc_hidden_employees';
  const orderKey = context === 'schedule' ? 'schedule_employee_order' : 'qc_employee_order';
  try {
    hiddenEmps = JSON.parse(localStorage.getItem(hiddenKey) || '[]');
    const stored = JSON.parse(localStorage.getItem(orderKey) || '{}');
    if (Array.isArray(stored)) {
      stored.forEach((id, idx) => { const o = {}; o[id] = idx; Object.assign(empOrder, o); });
      empOrder = stored; // keep as array for modal sorting
    } else {
      empOrder = Object.keys(stored).sort((a, b) => stored[a] - stored[b]);
    }
  } catch(e) {}

  const deptMap = {};
  allEmps.forEach(e => {
    const d = e.dept || 'Other';
    if (!deptMap[d]) deptMap[d] = [];
    deptMap[d].push(e);
  });

  const teamsOrder = ['ACE', 'Sertec', 'ONIX', 'Sale Support', 'Call Center', 'Other'];
  const teams = Object.keys(deptMap).sort((a,b) => {
    let idxA = teamsOrder.indexOf(a), idxB = teamsOrder.indexOf(b);
    if(idxA === -1) idxA = 99; if(idxB === -1) idxB = 99;
    return idxA - idxB;
  });

  let listHtml = '';
  teams.forEach(t => {
    listHtml += `<div style="margin-bottom: 16px;">
      <h4 style="margin: 0 0 10px; font-size: 0.85rem; font-weight: 700; color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">ทีม ${t === 'Other' ? 'อื่นๆ' : t}</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px;">`;
    
    deptMap[t].sort((a,b) => {
      const idxA = empOrder.indexOf(a.id);
      const idxB = empOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.rank||99)-(b.rank||99);
    }).forEach(e => {
      const isChecked = !hiddenEmps.includes(e.id);
      listHtml += `
        <div class="qc-emp-item" data-name="${e.id}" 
             draggable="true" 
             ondragstart="qcHandleEmpDragStart(event, '${e.id}')" 
             ondragover="event.preventDefault(); this.style.borderColor='#4f46e5'; this.style.transform='scale(1.02)';" 
             ondragleave="this.style.borderColor='#e2e8f0'; this.style.transform='scale(1)';" 
             ondrop="this.style.borderColor='#e2e8f0'; this.style.transform='scale(1)'; qcHandleEmpDrop(event, '${e.id}')"
             ondragend="qcHandleEmpDragEnd(event)"
             style="display:flex; align-items:center; justify-content:space-between; padding: 6px 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; transition: all 0.2s; cursor: grab;" 
             onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
          
          <div style="display:flex; align-items:center; gap: 8px; flex:1;">
            <i data-lucide="grip-vertical" style="width:16px; height:16px; color:#cbd5e1; cursor:grab;"></i>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #334155; cursor: pointer; flex:1; margin:0;">
              <input type="checkbox" class="qc-emp-visibility-cb" value="${e.id}" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #4f46e5; cursor: pointer;">
              ${e.name} ${e.nickname && e.nickname !== '-' ? `(${e.nickname})` : ''}
            </label>
          </div>
        </div>
      `;
    });
    listHtml += `</div></div>`;
  });

  const modalHtml = `
    <div id="qcManageEmployeesModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:11000; backdrop-filter:blur(4px); animation: fadeIn 0.2s ease-out;">
      <div style="background:#fff; width: 700px; max-width: 95vw; max-height: 90vh; display:flex; flex-direction:column; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); font-family: 'Kanit', sans-serif;">
        <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="users" style="width: 20px; height: 20px; color: #4f46e5;"></i>
            จัดการการแสดงผลและลำดับรายชื่อ
          </h3>
          <button onclick="document.getElementById('qcManageEmployeesModal').remove()" 
                  style="width:36px; height:36px; border-radius:50%; background:#ffffff; border:1px solid #f1f5f9; box-shadow:0 4px 12px rgba(15, 23, 42, 0.08); cursor:pointer; display:flex; align-items:center; justify-content:center; color:#64748b; transition:all 0.2s;"
                  onmouseover="this.style.boxShadow='0 6px 16px rgba(15, 23, 42, 0.12)'; this.style.transform='translateY(-1px)'; this.style.color='#0f172a'"
                  onmouseout="this.style.boxShadow='0 4px 12px rgba(15, 23, 42, 0.08)'; this.style.transform='translateY(0)'; this.style.color='#64748b'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="padding: 12px 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; gap: 12px;">
          <button onclick="document.querySelectorAll('.qc-emp-visibility-cb').forEach(cb => cb.checked = true)" style="background: #fff; border: 1px solid #cbd5e1; padding: 6px 16px; border-radius: 99px; font-size: 0.75rem; font-weight: 500; color: #475569; cursor: pointer; font-family: 'Kanit'; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#fff'">แสดงทั้งหมด</button>
          <button onclick="document.querySelectorAll('.qc-emp-visibility-cb').forEach(cb => cb.checked = false)" style="background: #fff; border: 1px solid #cbd5e1; padding: 6px 16px; border-radius: 99px; font-size: 0.75rem; font-weight: 500; color: #475569; cursor: pointer; font-family: 'Kanit'; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#fff'">ซ่อนทั้งหมด</button>
          <span style="margin-left: auto; font-size: 0.75rem; color: #64748b; display: flex; align-items: center;">
            <i data-lucide="info" style="width:14px; height:14px; margin-right:4px;"></i> ลากและวางเพื่อจัดเรียงลำดับรายชื่อพนักงาน
          </span>
        </div>
        <div class="scheduler-scrollbar" style="padding: 20px 24px; overflow-y: auto; flex: 1;">
          ${listHtml}
        </div>
        <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; background: #f8fafc; border-radius: 0 0 20px 20px;">
          <button onclick="document.getElementById('qcManageEmployeesModal').remove()" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 8px 24px; border-radius: 99px; font-size: 0.8rem; font-weight: 500; cursor: pointer; font-family: 'Kanit'; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">ยกเลิก</button>
          <button onclick="qcSaveManageEmployees('${context}')" style="background: #635bff; color: #fff; border: none; padding: 8px 28px; border-radius: 99px; font-size: 0.8rem; font-weight: 500; cursor: pointer; font-family: 'Kanit'; display: flex; align-items: center; gap: 8px; transition: all 0.2s;" onmouseover="this.style.background='#5046e5'" onmouseout="this.style.background='#635bff'">
            <i data-lucide="save" style="width: 16px; height: 16px;"></i>
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (typeof lucide !== 'undefined') lucide.createIcons({ root: document.getElementById('qcManageEmployeesModal') });
};

window.qcHandleEmpDragStart = function(e, name) {
  window._qcDraggedEmpName = name;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', name);
  setTimeout(() => { if(e.target.style) e.target.style.opacity = '0.5'; }, 0);
};

window.qcHandleEmpDragEnd = function(e) {
  e.target.style.opacity = '1';
};

window.qcMoveEmpItem = function(button, direction) {
  const item = button.closest('.qc-emp-item');
  if (!item) return;
  const parent = item.parentNode;
  if (!parent) return;
  
  if (direction === 'up') {
    const prev = item.previousElementSibling;
    if (prev && prev.classList.contains('qc-emp-item')) {
      parent.insertBefore(item, prev);
    }
  } else if (direction === 'down') {
    const next = item.nextElementSibling;
    if (next && next.classList.contains('qc-emp-item')) {
      parent.insertBefore(item, next.nextSibling);
    }
  }
};

window.qcHandleEmpDrop = function(e, dropName) {
  e.preventDefault();
  const dragName = window._qcDraggedEmpName;
  if (!dragName || dragName === dropName) return;

  const targetItem = e.target.closest('.qc-emp-item');
  if (!targetItem) return;
  const container = targetItem.parentNode;
  
  const items = Array.from(container.querySelectorAll('.qc-emp-item'));
  const dragEl = items.find(el => el.dataset.name === dragName);
  const dropEl = items.find(el => el.dataset.name === dropName);

  if (dragEl && dropEl && dragEl.parentNode === dropEl.parentNode) {
    const dragIndex = items.indexOf(dragEl);
    const dropIndex = items.indexOf(dropEl);
    
    if (dragIndex < dropIndex) {
      dropEl.parentNode.insertBefore(dragEl, dropEl.nextSibling);
    } else {
      dropEl.parentNode.insertBefore(dragEl, dropEl);
    }
  }
  window._qcDraggedEmpName = null;
};

window.qcSaveManageEmployees = function(context = 'qc') {
  const checkboxes = document.querySelectorAll('.qc-emp-visibility-cb');
  const hiddenEmps = [];
  checkboxes.forEach(cb => {
    if (!cb.checked) {
      hiddenEmps.push(cb.value);
    }
  });
  const hiddenKey = context === 'schedule' ? 'schedule_hidden_employees' : 'qc_hidden_employees';
  localStorage.setItem(hiddenKey, JSON.stringify(hiddenEmps));

  // Save employee order as { id: index } map for easy lookup in both pages
  const items = document.querySelectorAll('.qc-emp-item');
  const empOrderMap = {};
  items.forEach((item, idx) => { empOrderMap[item.dataset.name] = idx; });
  const orderKey = context === 'schedule' ? 'schedule_employee_order' : 'qc_employee_order';
  localStorage.setItem(orderKey, JSON.stringify(empOrderMap));

  document.getElementById('qcManageEmployeesModal').remove();
  
  if (typeof window.showToast === 'function') {
    window.showToast('อัปเดตการแสดงผลและลำดับรายชื่อเรียบร้อยแล้ว', 'success');
  }

  // Reload the correct page
  if (context === 'schedule' && typeof window.filterScheduleUI === 'function') {
    window.filterScheduleUI();
  } else {
    qcReloadPlan();
  }
};

window.qcDeletePlanTask = async function(taskId) {
  const confirmed = await window.qcCustomConfirm({
    title: 'ยืนยันการลบแผนงาน',
    message: 'คุณแน่ใจหรือไม่ว่าต้องการลบแผนงานนี้?',
    confirmText: 'ลบข้อมูล',
    cancelText: 'ยกเลิก',
    isDanger: true
  });
  if (!confirmed) return;
  const taskIndex = window.QC_PLANS.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    const plan = window.QC_PLANS[taskIndex];
    window.QC_PLANS.splice(taskIndex, 1);
    if (typeof window.qcDeleteLocalPlan === 'function') {
      window.qcDeleteLocalPlan({ id: plan.id });
    }
    if (typeof apiSaveQcPlan === 'function') {
      apiSaveQcPlan({ action: 'delete', id: plan.id });
    }
    if (typeof window.qcSyncPlanToSchedule === 'function') {
      window.qcSyncPlanToSchedule('delete', plan);
    }
    qcReloadPlan();
    if (typeof window.showToast === 'function') window.showToast('ลบงานเรียบร้อยแล้ว', 'success');
  }
};

window.qcDeleteScheduleTask = async function(taskId) {
  const confirmed = await window.qcCustomConfirm({
    title: 'ยืนยันการลบงาน',
    message: 'คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้ออกจากตาราง?',
    confirmText: 'ลบข้อมูล',
    cancelText: 'ยกเลิก',
    isDanger: true
  });
  if (!confirmed) return;
  const taskIndex = window.SCHEDULE_TASKS.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    window.SCHEDULE_TASKS.splice(taskIndex, 1);
    qcReloadPlan();
    if (typeof window.showToast === 'function') window.showToast('ลบงานเรียบร้อยแล้ว', 'success');
  }
};

window.qcGetRateForTask = function(rates, category, channel, type) {
  let cat = (category || '').split(' (')[0].trim();
  let chan = (channel || '').trim();
  let tStr = type || '';
  
  if (['Confidence 70-100', 'Confidence 0-69', 'URL'].includes(cat)) {
    if (cat === 'Confidence 70-100') tStr = 'QC2_Conf70';
    if (cat === 'Confidence 0-69') tStr = 'QC2_Conf0';
    if (cat === 'URL') tStr = 'QC2_URL';
    cat = 'โฆษณาพนัน'; 
  } else if (cat === 'อื่นๆ ยกเว้นโฆษณาพนัน' || cat === 'อื่นๆ ที่ไม่ใช่หมวดพนันและหมวดสินค้า (12 หมวด)') {
    cat = 'Hate Speech';
  } else if (cat.includes('สินค้า')) {
    cat = 'อาวุธปืน';
  } else if (cat === 'จำนวนเคสทั้งหมด') {
    cat = 'โฆษณาพนัน';
  }
  
  const confMode = localStorage.getItem('qc_web_conf_mode') === 'conf';
  const confQc1 = localStorage.getItem('qc_web_conf_qc1') === 'true';
  const confQc2 = localStorage.getItem('qc_web_conf_qc2') === 'true';

  const useConf1 = confMode && confQc1;
  const useConf2 = confMode && confQc2;

  let typeKey = 'manual';
  // tStr is already declared above
  if (tStr.includes('QC1') || tStr === '1') {
    if (chan === 'Social') {
      typeKey = 'qc1';
    } else {
      // Website channel
      if (useConf1 && (tStr.includes('70') || tStr.includes('Conf70'))) {
        typeKey = 'qc1_conf70';
      } else if (useConf1 && (tStr.includes('0-69') || tStr.includes('Conf0'))) {
        typeKey = 'qc1_conf0';
      } else if (useConf1 && (tStr.includes('URL') || tStr.includes('url'))) {
        typeKey = 'qc1_url';
      } else {
        typeKey = 'qc1'; // Fallback to normal QC1 Website if no specific condition
      }
    }
  } else if (tStr.includes('QC2') || tStr === '2') {
    if (chan === 'Social') {
      typeKey = 'qc2';
    } else {
      // Website channel
      if (useConf2 && (tStr.includes('70') || tStr.includes('Conf70'))) {
        typeKey = 'qc2_conf70';
      } else if (useConf2 && (tStr.includes('0-69') || tStr.includes('Conf0'))) {
        typeKey = 'qc2_conf0';
      } else if (useConf2 && (tStr.includes('URL') || tStr.includes('url'))) {
        typeKey = 'qc2_url';
      } else {
        typeKey = 'qc2'; // Fallback to normal QC2 Website if no specific condition
      }
    }
  } else {
    typeKey = 'manual';
  }

  // Helper function to check if rate is defined
  const getVal = (k, tk) => {
    if (rates[k] && rates[k][tk] !== '' && rates[k][tk] !== undefined) {
      return parseFloat(rates[k][tk]);
    }
    return null;
  };

  // 1. Check exact match: Category + Channel
  let keyExact = `${cat}_${chan}`;
  let val = getVal(keyExact, typeKey);
  if (val !== null) return val;

  // Fallback from detailed Web QC1/QC2 keys to standard qc1/qc2 key if not specified
  if (chan === 'Website') {
    if (typeKey.startsWith('qc1_')) {
      val = getVal(keyExact, 'qc1');
      if (val !== null) return val;
    } else if (typeKey.startsWith('qc2_')) {
      val = getVal(keyExact, 'qc2');
      if (val !== null) return val;
    }
  }

  // 2. Check Category + All channels
  let keyAllChan = `${cat}_All`;
  val = getVal(keyAllChan, typeKey);
  if (val !== null) return val;
  if (chan === 'Website') {
    if (typeKey.startsWith('qc1_')) {
      val = getVal(keyAllChan, 'qc1');
      if (val !== null) return val;
    } else if (typeKey.startsWith('qc2_')) {
      val = getVal(keyAllChan, 'qc2');
      if (val !== null) return val;
    }
  }

  // 2.5. Check Parent Category (พนันรวม) if category is a gambling subcategory
  if (window.QC_GAMBLING_SUBCATS.includes(cat)) {
    let keyParent = `พนันรวม_${chan}`;
    val = getVal(keyParent, typeKey);
    if (val !== null) return val;
    if (chan === 'Website') {
      if (typeKey.startsWith('qc1_')) {
        val = getVal(keyParent, 'qc1');
        if (val !== null) return val;
      } else if (typeKey.startsWith('qc2_')) {
        val = getVal(keyParent, 'qc2');
        if (val !== null) return val;
      }
    }

    let keyParentAll = `พนันรวม_All`;
    val = getVal(keyParentAll, typeKey);
    if (val !== null) return val;
    if (chan === 'Website') {
      if (typeKey.startsWith('qc1_')) {
        val = getVal(keyParentAll, 'qc1');
        if (val !== null) return val;
      } else if (typeKey.startsWith('qc2_')) {
        val = getVal(keyParentAll, 'qc2');
        if (val !== null) return val;
      }
    }
  }

  // 3. Check Default
  let defKey = 'default';
  val = getVal(defKey, typeKey);
  if (val !== null) return val;
  if (chan === 'Website') {
    if (typeKey.startsWith('qc1_')) {
      val = getVal(defKey, 'qc1');
      if (val !== null) return val;
    } else if (typeKey.startsWith('qc2_')) {
      val = getVal(defKey, 'qc2');
      if (val !== null) return val;
    }
  }

  return 0;
};

window.qcShowSettingsModal = function() {
  let rates = {};
  try {
    const raw = localStorage.getItem('qc_workload_rates_v2');
    rates = (raw && raw !== '{}') ? JSON.parse(raw) : window.DEFAULT_QC_RATES_V2;
  } catch(e) {
    rates = window.DEFAULT_QC_RATES_V2;
  }

  let v1Rates = { qc1: 1, qc2: 1, manual: 1 };
  try { v1Rates = JSON.parse(localStorage.getItem('qc_workload_rates')) || v1Rates; } catch(e){}

  const dRate = rates['default'] || {};
  const defRate = {
    qc1: dRate.qc1 !== undefined && dRate.qc1 !== '' ? dRate.qc1 : v1Rates.qc1,
    qc1_conf70: dRate.qc1_conf70 !== undefined && dRate.qc1_conf70 !== '' ? dRate.qc1_conf70 : (dRate.qc1 !== undefined && dRate.qc1 !== '' ? dRate.qc1 : v1Rates.qc1),
    qc1_conf0: dRate.qc1_conf0 !== undefined && dRate.qc1_conf0 !== '' ? dRate.qc1_conf0 : (dRate.qc1 !== undefined && dRate.qc1 !== '' ? dRate.qc1 : v1Rates.qc1),
    qc1_url: dRate.qc1_url !== undefined && dRate.qc1_url !== '' ? dRate.qc1_url : (dRate.qc1 !== undefined && dRate.qc1 !== '' ? dRate.qc1 : v1Rates.qc1),
    qc2: dRate.qc2 !== undefined && dRate.qc2 !== '' ? dRate.qc2 : v1Rates.qc2,
    qc2_conf70: dRate.qc2_conf70 !== undefined && dRate.qc2_conf70 !== '' ? dRate.qc2_conf70 : (dRate.qc2 !== undefined && dRate.qc2 !== '' ? dRate.qc2 : v1Rates.qc2),
    qc2_conf0: dRate.qc2_conf0 !== undefined && dRate.qc2_conf0 !== '' ? dRate.qc2_conf0 : (dRate.qc2 !== undefined && dRate.qc2 !== '' ? dRate.qc2 : v1Rates.qc2),
    qc2_url: dRate.qc2_url !== undefined && dRate.qc2_url !== '' ? dRate.qc2_url : (dRate.qc2 !== undefined && dRate.qc2 !== '' ? dRate.qc2 : v1Rates.qc2),
    manual: dRate.manual !== undefined && dRate.manual !== '' ? dRate.manual : v1Rates.manual
  };

  let rowsHtml = '';
  // 1. พนันรวม
  rowsHtml += qcBuildMatrixRow('พนันรวม', rates, false);
  window.QC_GAMBLING_SUBCATS.forEach(sub => {
    rowsHtml += qcBuildMatrixRow(sub, rates, true);
  });
  // 2. Main Categories
  window.QC_MAIN_CATEGORIES.forEach(cat => {
    rowsHtml += qcBuildMatrixRow(cat, rates, false);
  });

  let confMode = localStorage.getItem('qc_web_conf_mode') || 'normal';
  if (!localStorage.getItem('qc_web_conf_mode') && localStorage.getItem('qc_detail_web_qc2_enabled') === 'true') {
    confMode = 'conf';
  }
  const confQc1 = localStorage.getItem('qc_web_conf_qc1') === 'true';
  const confQc2 = localStorage.getItem('qc_web_conf_qc2') === 'true';

  const modalHtml = `
    <div class="qc-modal-overlay" id="qcSettingsModal" onclick="if(event.target===this) this.remove()">
      <style>
        /* Glassmorphic backdrop */
        .qc-modal-overlay {
          background: rgba(15, 23, 42, 0.45) !important;
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: all 0.2s ease-in-out;
        }

        /* Sleek card styling */
        .qc-modal {
          background: #ffffff !important;
          border-radius: 16px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          overflow: hidden;
          padding: 24px !important;
          font-family: 'Kanit', sans-serif;
          animation: qcModalEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes qcModalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Modernized table wrapper */
        .qc-table-wrapper {
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          background: #ffffff;
        }

        /* Table structural styling */
        #qcSettingsTable {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
          min-width: 1000px;
          font-family: 'Kanit', sans-serif;
        }

        /* Soft, clean table elements */
        #qcSettingsTable th {
          font-weight: 600;
          vertical-align: middle;
          padding: 10px 8px;
          font-size: 0.78rem;
          border-bottom: 1px solid #cbd5e1;
        }

        #qcSettingsTable td {
          padding: 6px 8px;
          vertical-align: middle;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.15s ease;
        }

        /* Modern Header Badge Styles */
        .qc-hdr-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 0.72rem;
          font-weight: 600;
          line-height: 1;
        }
        .qc-hdr-badge-qc1 {
          background: rgba(59, 130, 246, 0.08) !important;
          color: #1d4ed8 !important;
          border: 1px solid rgba(59, 130, 246, 0.2) !important;
        }
        .qc-hdr-badge-qc2 {
          background: rgba(34, 197, 94, 0.08) !important;
          color: #15803d !important;
          border: 1px solid rgba(34, 197, 94, 0.2) !important;
        }
        .qc-hdr-badge-manual {
          background: rgba(245, 158, 11, 0.08) !important;
          color: #b45309 !important;
          border: 1px solid rgba(245, 158, 11, 0.2) !important;
        }

        /* Modern input styling */
        .qc-rate-input {
          width: 100%;
          max-width: 60px;
          height: 26px;
          padding: 2px 4px;
          font-size: 0.78rem;
          font-family: 'Kanit', sans-serif;
          text-align: center;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background-color: #f8fafc;
          color: #1e293b;
          outline: none;
          transition: all 0.15s ease-in-out;
          box-sizing: border-box;
          min-width: 55px;
        }

        .qc-rate-input:hover {
          border-color: #cbd5e1;
          background-color: #f1f5f9;
        }

        /* Colored focus rings */
        .qc-rate-input-qc1:focus {
          background-color: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          color: #1e3a8a;
        }
        .qc-rate-input-qc2:focus {
          background-color: #ffffff;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
          color: #064e3b;
        }
        .qc-rate-input-manual:focus {
          background-color: #ffffff;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
          color: #78350f;
        }

        /* Highlight default fallback input style */
        .qc-rate-input-default {
          font-weight: 700;
          color: #1e293b;
          border-color: #94a3b8;
          background-color: #ffffff;
        }

        /* Sticky category column - SaaS styled */
        .qc-sticky-cat {
          position: sticky;
          left: 0;
          z-index: 5;
          text-align: left !important;
          font-weight: 600;
          color: #334155;
          background-color: #ffffff;
          border-right: 2px solid #e2e8f0 !important;
          box-shadow: 3px 0 6px -3px rgba(0,0,0,0.05);
        }

        /* Keep sticky background correct on hover / sub rows */
        tr:hover .qc-sticky-cat {
          background-color: #f8fafc !important;
        }

        /* Highlighted rows */
        .qc-default-row td {
          background-color: #f0f4ff !important;
        }
        .qc-default-row:hover td {
          background-color: #e0ebff !important;
        }
        .qc-default-row .qc-sticky-cat {
          background-color: #f0f4ff !important;
          color: #2563eb;
          font-weight: 700;
        }
        .qc-default-row:hover .qc-sticky-cat {
          background-color: #e0ebff !important;
        }

        /* Nested Subcategory Styling */
        .qc-setting-gambling-sub td {
          background-color: #fafbfc;
        }
        .qc-setting-gambling-sub:hover td {
          background-color: #f1f5f9 !important;
        }
        .qc-setting-gambling-sub .qc-sticky-cat {
          background-color: #fafbfc;
        }
        .qc-setting-gambling-sub:hover .qc-sticky-cat {
          background-color: #f1f5f9 !important;
        }

        /* Segmented Controller (Mode Selector) */
        .qc-segmented-control {
          display: flex;
          align-items: center;
          gap: 2px;
          background: #f1f5f9;
          padding: 3px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          width: fit-content;
        }
        .qc-segmented-control button {
          padding: 6px 14px;
          border: none;
          border-radius: 6px;
          font-family: 'Kanit', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: #64748b;
          background: transparent;
        }
        .qc-segmented-control button.active {
          background: #ffffff;
          color: #1e293b;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .qc-segmented-control button:hover:not(.active) {
          color: #334155;
        }

        /* Beautiful Pills for Target Checkboxes */
        .qc-pills-container {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 4px 12px;
          border-radius: 10px;
        }
        .qc-pill-label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          color: #1e293b;
          margin: 0;
          user-select: none;
        }
        .qc-pill-label input[type="checkbox"] {
          width: 14px;
          height: 14px;
          accent-color: #10b981;
          cursor: pointer;
        }

        /* Action Buttons */
        .qc-btn-secondary {
          padding: 8px 14px;
          border: 1px solid #cbd5e1;
          background: #f1f5f9;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Kanit', sans-serif;
          font-size: 0.75rem;
          color: #475569;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .qc-btn-secondary:hover {
          background: #e2e8f0;
          color: #1e293b;
          border-color: #cbd5e1;
        }
        
        .qc-btn-cancel {
          padding: 8px 16px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Kanit', sans-serif;
          font-size: 0.82rem;
          color: #64748b;
          font-weight: 500;
          transition: all 0.15s;
        }
        .qc-btn-cancel:hover {
          background: #f1f5f9;
          color: #334155;
          border-color: #cbd5e1;
        }

        .qc-btn-save {
          padding: 8px 20px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Kanit', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .qc-btn-save:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          transform: translateY(-1px);
        }
      </style>
      
      <div class="qc-modal" style="width: 90%; max-width: 1200px; max-height: 90vh; display: flex; flex-direction: column;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(59, 130, 246, 0.08); display: flex; align-items: center; justify-content: center;">
              <i data-lucide="settings" style="width: 18px; height: 18px; color: #2563eb;"></i>
            </div>
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0;">ตั้งค่าสัดส่วนภาระงาน (%)</h3>
              <p style="font-size: 0.75rem; color: #64748b; margin: 2px 0 0 0;">กำหนดค่าคงที่หรือใช้ค่า Confidence สำหรับการประเมินภาระงาน QC</p>
            </div>
          </div>
          <button onclick="document.getElementById('qcSettingsModal').remove()" style="background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 50%; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'; this.style.color='#475569';" onmouseout="this.style.background='none'; this.style.color='#94a3b8';">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
        
        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 14px; line-height:1.5; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span style="font-size: 0.82rem; font-weight: 600; color: #475569;">รูปแบบการตั้งค่า:</span>
            <div class="qc-segmented-control">
              <button type="button" id="btnQc2WebNormal" class="qc2-web-type-btn ${confMode === 'normal' ? 'active' : ''}" onclick="qcSelectWebQc2Type('normal')">
                แบบธรรมดา (Normal)
              </button>
              <button type="button" id="btnQc2WebDetail" class="qc2-web-type-btn ${confMode === 'conf' ? 'active' : ''}" onclick="qcSelectWebQc2Type('conf')">
                แบบมีค่า Confidence (Confidence-based)
              </button>
            </div>
            
            <div id="qcConfTargetsContainer" class="qc-pills-container" style="display: ${confMode === 'conf' ? 'flex' : 'none'};">
              <span style="font-size: 0.78rem; font-weight: 600; color: #166534;">ใช้กับ:</span>
              <label class="qc-pill-label">
                <input type="checkbox" id="chkQcUseConf1" onchange="qcUpdateConfTargets()" ${confQc1 ? 'checked' : ''}> QC1
              </label>
              <label class="qc-pill-label">
                <input type="checkbox" id="chkQcUseConf2" onchange="qcUpdateConfTargets()" ${confQc2 ? 'checked' : ''}> QC2
              </label>
            </div>
          </div>
        </div>

        <div class="qc-table-wrapper" style="overflow-x: auto; overflow-y: auto; flex-grow: 1; margin-bottom: 16px; max-height: 55vh;">
          <table id="qcSettingsTable">
            <thead style="background: #f8fafc; position: sticky; top: 0; z-index: 10; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <tr>
                <th rowspan="2" class="qc-sticky-cat" style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 8px; font-size: 0.8rem;">หมวดคดี</th>
                <th colspan="2" id="qc1HeaderCol" style="padding: 8px; font-size: 0.8rem; border-left: 2px solid #cbd5e1; font-weight: 700;">
                  <span class="qc-hdr-badge qc-hdr-badge-qc1">
                    <i data-lucide="activity" style="width:13px; height:13px;"></i> QC1
                  </span>
                </th>
                <th colspan="2" id="qc2HeaderCol" style="padding: 8px; font-size: 0.8rem; border-left: 2px solid #cbd5e1; font-weight: 700;">
                  <span class="qc-hdr-badge qc-hdr-badge-qc2">
                    <i data-lucide="shield-check" style="width:13px; height:13px;"></i> QC2
                  </span>
                </th>
                <th colspan="2" style="padding: 8px; font-size: 0.8rem; border-left: 2px solid #cbd5e1; font-weight: 700;">
                  <span class="qc-hdr-badge qc-hdr-badge-manual">
                    <i data-lucide="hand" style="width:13px; height:13px;"></i> Manual
                  </span>
                </th>
              </tr>
              <tr>
                <!-- QC1 Website single/normal -->
                <th class="qc1-web-normal" style="padding: 6px; font-size: 0.72rem; border-left: 2px solid #cbd5e1; font-weight: 600;">Website</th>
                
                <!-- QC1 Website detailed -->
                <th class="qc1-web-detail" style="display: none; padding: 6px; font-size: 0.72rem; border-left: 2px solid #cbd5e1; font-weight: 600;">Website<br>(Conf 70-100)</th>
                <th class="qc1-web-detail" style="display: none; padding: 6px; font-size: 0.72rem; font-weight: 600;">Website<br>(Conf 0-69)</th>
                <th class="qc1-web-detail" style="display: none; padding: 6px; font-size: 0.72rem; font-weight: 600;">Website<br>(URL)</th>
                
                <th style="padding: 6px; font-size: 0.72rem; font-weight: 600; border-left: 1px solid #cbd5e1;">Social</th>
                
                <!-- QC2 Website single/normal -->
                <th class="qc2-web-normal" style="padding: 6px; font-size: 0.72rem; border-left: 2px solid #cbd5e1; font-weight: 600;">Website</th>
                
                <!-- QC2 Website detailed -->
                <th class="qc2-web-detail" style="display: none; padding: 6px; font-size: 0.72rem; border-left: 2px solid #cbd5e1; font-weight: 600;">Website<br>(Conf 70-100)</th>
                <th class="qc2-web-detail" style="display: none; padding: 6px; font-size: 0.72rem; font-weight: 600;">Website<br>(Conf 0-69)</th>
                <th class="qc2-web-detail" style="display: none; padding: 6px; font-size: 0.72rem; font-weight: 600;">Website<br>(URL)</th>
                
                <!-- QC2 Social standard -->
                <th style="padding: 6px; font-size: 0.72rem; font-weight: 600; border-left: 1px solid #cbd5e1;">Social</th>
                
                <th style="padding: 6px; font-size: 0.72rem; border-left: 2px solid #cbd5e1; font-weight: 600;">Website</th>
                <th style="padding: 6px; font-size: 0.72rem; font-weight: 600;">Social</th>
              </tr>
            </thead>
            <tbody id="qcSettingsTbody">
              <tr class="qc-default-row" style="font-weight: bold;">
                <td class="qc-sticky-cat">ค่าเริ่มต้น (Default)</td>
                
                <!-- QC1 Website single/normal -->
                <td class="qc1-web-normal" style="padding: 6px; border-left: 2px solid #cbd5e1;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Website" data-type="qc1" value="${defRate.qc1 || ''}" class="qc-rate-input qc-rate-input-qc1 qc-rate-input-default"></td>
                
                <!-- QC1 Website detailed -->
                <td class="qc1-web-detail" style="display: none; padding: 6px; border-left: 2px solid #cbd5e1;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Website" data-type="qc1_conf70" value="${defRate.qc1_conf70 || ''}" class="qc-rate-input qc-rate-input-qc1 qc-rate-input-default"></td>
                <td class="qc1-web-detail" style="display: none; padding: 6px;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Website" data-type="qc1_conf0" value="${defRate.qc1_conf0 || ''}" class="qc-rate-input qc-rate-input-qc1 qc-rate-input-default"></td>
                <td class="qc1-web-detail" style="display: none; padding: 6px;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Website" data-type="qc1_url" value="${defRate.qc1_url || ''}" class="qc-rate-input qc-rate-input-qc1 qc-rate-input-default"></td>
                
                <td style="padding: 6px; border-left: 1px solid #cbd5e1;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Social" data-type="qc1" value="${defRate.qc1 || ''}" class="qc-rate-input qc-rate-input-qc1 qc-rate-input-default"></td>
                
                <!-- QC2 Website single/normal -->
                <td class="qc2-web-normal" style="padding: 6px; border-left: 2px solid #cbd5e1;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Website" data-type="qc2" value="${defRate.qc2 || ''}" class="qc-rate-input qc-rate-input-qc2 qc-rate-input-default"></td>
                
                <!-- QC2 Website detailed -->
                <td class="qc2-web-detail" style="display: none; padding: 6px; border-left: 2px solid #cbd5e1;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Website" data-type="qc2_conf70" value="${defRate.qc2_conf70 || ''}" class="qc-rate-input qc-rate-input-qc2 qc-rate-input-default"></td>
                <td class="qc2-web-detail" style="display: none; padding: 6px;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Website" data-type="qc2_conf0" value="${defRate.qc2_conf0 || ''}" class="qc-rate-input qc-rate-input-qc2 qc-rate-input-default"></td>
                <td class="qc2-web-detail" style="display: none; padding: 6px;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Website" data-type="qc2_url" value="${defRate.qc2_url || ''}" class="qc-rate-input qc-rate-input-qc2 qc-rate-input-default"></td>
                
                <!-- QC2 Social standard -->
                <td style="padding: 6px; border-left: 1px solid #cbd5e1;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Social" data-type="qc2" value="${defRate.qc2 || ''}" class="qc-rate-input qc-rate-input-qc2 qc-rate-input-default"></td>
                
                <td style="padding: 6px; border-left: 2px solid #cbd5e1;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Website" data-type="manual" value="${defRate.manual || ''}" class="qc-rate-input qc-rate-input-manual qc-rate-input-default"></td>
                <td style="padding: 6px;"><input type="number" step="0.1" min="0" data-cat="default" data-chan="Social" data-type="manual" value="${defRate.manual || ''}" class="qc-rate-input qc-rate-input-manual qc-rate-input-default"></td>
              </tr>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <div class="qc-modal-actions" style="margin-top: 10px; display:flex; justify-content:space-between; gap:10px; width:100%;">
          <div style="display:flex; gap:10px;">
            <button class="qc-btn-secondary" onclick="qcExportRates()">
              <i data-lucide="copy" style="width:14px; height:14px;"></i> ส่งค่าให้โปรแกรมเมอร์ (Export)
            </button>
            <button class="qc-btn-secondary" onclick="qcClearSettingsInputs()" style="color: #dc2626; border-color: #fca5a5; background: #fff5f5; font-weight: 600;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fff5f5'">
              <i data-lucide="trash-2" style="width:14px; height:14px; color: #dc2626;"></i> ล้างค่าทั้งหมด
            </button>
          </div>
          
          <div style="display:flex; gap:10px;">
            <button class="qc-btn-cancel" onclick="document.getElementById('qcSettingsModal').remove()">ยกเลิก</button>
            <button class="qc-btn-save" onclick="qcSaveSettingsV3()">
              <i data-lucide="save" style="width:14px; height:14px;"></i> บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  window.qcSelectWebQc2Type = function(mode) {
    localStorage.setItem('qc_web_conf_mode', mode);
    const btnNormal = document.getElementById('btnQc2WebNormal');
    const btnDetail = document.getElementById('btnQc2WebDetail');
    const targetsCont = document.getElementById('qcConfTargetsContainer');
    
    if (mode === 'conf') {
      if (btnNormal) btnNormal.classList.remove('active');
      if (btnDetail) btnDetail.classList.add('active');
      if (targetsCont) targetsCont.style.display = 'flex';
    } else {
      if (btnNormal) btnNormal.classList.add('active');
      if (btnDetail) btnDetail.classList.remove('active');
      if (targetsCont) targetsCont.style.display = 'none';
    }
    window.qcToggleDetailWebQc2();
  };

  window.qcUpdateConfTargets = function() {
    const chk1 = document.getElementById('chkQcUseConf1');
    const chk2 = document.getElementById('chkQcUseConf2');
    localStorage.setItem('qc_web_conf_qc1', chk1 && chk1.checked ? 'true' : 'false');
    localStorage.setItem('qc_web_conf_qc2', chk2 && chk2.checked ? 'true' : 'false');
    window.qcToggleDetailWebQc2();
  };

  window.qcToggleDetailWebQc2 = function() {
    const confMode = localStorage.getItem('qc_web_conf_mode') === 'conf';
    const confQc1 = localStorage.getItem('qc_web_conf_qc1') === 'true';
    const confQc2 = localStorage.getItem('qc_web_conf_qc2') === 'true';

    const useConf1 = confMode && confQc1;
    const useConf2 = confMode && confQc2;

    const normal1Els = document.querySelectorAll('.qc1-web-normal');
    const detail1Els = document.querySelectorAll('.qc1-web-detail');
    const qc1Header = document.getElementById('qc1HeaderCol');

    const normal2Els = document.querySelectorAll('.qc2-web-normal');
    const detail2Els = document.querySelectorAll('.qc2-web-detail');
    const qc2Header = document.getElementById('qc2HeaderCol');
    
    if (useConf1) {
      normal1Els.forEach(el => el.style.display = 'none');
      detail1Els.forEach(el => el.style.display = 'table-cell');
      if (qc1Header) qc1Header.setAttribute('colspan', '4');
    } else {
      normal1Els.forEach(el => el.style.display = 'table-cell');
      detail1Els.forEach(el => el.style.display = 'none');
      if (qc1Header) qc1Header.setAttribute('colspan', '2');
    }

    if (useConf2) {
      normal2Els.forEach(el => el.style.display = 'none');
      detail2Els.forEach(el => el.style.display = 'table-cell');
      if (qc2Header) qc2Header.setAttribute('colspan', '4');
    } else {
      normal2Els.forEach(el => el.style.display = 'table-cell');
      detail2Els.forEach(el => el.style.display = 'none');
      if (qc2Header) qc2Header.setAttribute('colspan', '2');
    }
  };

  // Restore state
  window.qcToggleDetailWebQc2();
};

window.qcBuildMatrixRow = function(cat, rates, isSub = false) {
  const rWeb = rates[`${cat}_Website`] || { qc1: '', qc1_conf70: '', qc1_conf0: '', qc1_url: '', qc2: '', qc2_conf70: '', qc2_conf0: '', qc2_url: '', manual: '' };
  const rSoc = rates[`${cat}_Social`] || { qc1: '', qc2: '', manual: '' };
  
  const indent = isSub ? '&nbsp;&nbsp;&nbsp;&nbsp; <span style="color: #cbd5e1; margin-right: 4px;">↳</span> ' : '';
  const rowStyle = isSub ? 'display: none;' : '';
  const rowClass = isSub ? 'qc-setting-gambling-sub' : '';
  
  let labelHtml = cat;
  if (cat === 'พนันรวม') {
    labelHtml = `
      <div class="qc-gambling-toggle" onclick="qcToggleGamblingSubs(this)">
        <i data-lucide="chevron-right" class="qc-gambling-icon" style="width:14px; height:14px; transition: transform 0.2s;"></i>
        <span>พนันรวม</span>
      </div>
    `;
  } else {
    labelHtml = indent + cat;
  }

  const isParentGambling = (cat === 'พนันรวม');

  const renderInput = (chan, type, value) => {
    const parentClass = isParentGambling ? 'qc-parent-gambling-input' : '';
    let specificTypeClass = 'qc-rate-input-manual';
    if (type.startsWith('qc1')) specificTypeClass = 'qc-rate-input-qc1';
    else if (type.startsWith('qc2')) specificTypeClass = 'qc-rate-input-qc2';
    
    return `<input type="number" step="0.1" min="0" class="qc-rate-input ${specificTypeClass} ${parentClass}" data-cat="${cat}" data-chan="${chan}" data-type="${type}" value="${value || ''}">`;
  };

  return `
    <tr class="${rowClass}" style="${rowStyle}">
      <td class="qc-sticky-cat" style="font-weight: ${isSub?'normal':'600'}; color: ${isSub?'#64748b':'#334155'}; padding: 4px 12px; padding-left: ${isSub?'24px':'12px'}; font-size: 0.75rem;">
        ${labelHtml}
      </td>
      
      <!-- QC1 Website single/normal -->
      <td class="qc1-web-normal" style="padding: 4px; border-left: 2px solid #cbd5e1;">${renderInput('Website', 'qc1', rWeb.qc1)}</td>
      
      <!-- QC1 Website detailed -->
      <td class="qc1-web-detail" style="display: none; border-left: 2px solid #cbd5e1;">${renderInput('Website', 'qc1_conf70', rWeb.qc1_conf70)}</td>
      <td class="qc1-web-detail" style="display: none;">${renderInput('Website', 'qc1_conf0', rWeb.qc1_conf0)}</td>
      <td class="qc1-web-detail" style="display: none;">${renderInput('Website', 'qc1_url', rWeb.qc1_url)}</td>
      
      <td style="border-left: 1px solid #cbd5e1;">${renderInput('Social', 'qc1', rSoc.qc1)}</td>
      
      <!-- QC2 Website single/normal -->
      <td class="qc2-web-normal" style="border-left: 2px solid #cbd5e1;">${renderInput('Website', 'qc2', rWeb.qc2)}</td>
      
      <!-- QC2 Website detailed -->
      <td class="qc2-web-detail" style="display: none; border-left: 2px solid #cbd5e1;">${renderInput('Website', 'qc2_conf70', rWeb.qc2_conf70)}</td>
      <td class="qc2-web-detail" style="display: none;">${renderInput('Website', 'qc2_conf0', rWeb.qc2_conf0)}</td>
      <td class="qc2-web-detail" style="display: none;">${renderInput('Website', 'qc2_url', rWeb.qc2_url)}</td>
      
      <!-- QC2 Social standard -->
      <td style="border-left: 1px solid #cbd5e1;">${renderInput('Social', 'qc2', rSoc.qc2)}</td>
      
      <td style="border-left: 2px solid #cbd5e1;">${renderInput('Website', 'manual', rWeb.manual)}</td>
      <td style="padding: 4px;">${renderInput('Social', 'manual', rSoc.manual)}</td>
    </tr>
  `;
};

window.qcToggleGamblingSubs = function(el) {
  if (!el) return;
  const icon = el.querySelector('.qc-gambling-icon');
  const subs = document.querySelectorAll('.qc-setting-gambling-sub');
  const parentInputs = document.querySelectorAll('.qc-parent-gambling-input');
  
  if (icon.style.transform === 'rotate(90deg)') {
    icon.style.transform = 'rotate(0deg)';
    subs.forEach(s => s.style.display = 'none');
    parentInputs.forEach(inp => inp.style.display = ''); // Show parent inputs
  } else {
    icon.style.transform = 'rotate(90deg)';
    subs.forEach(s => s.style.display = 'table-row');
    parentInputs.forEach(inp => inp.style.display = 'none'); // Hide parent inputs
  }
};

window.qcExportRates = function() {
  let rates = localStorage.getItem('qc_workload_rates_v2');
  if (!rates || rates === '{}') {
    rates = JSON.stringify(window.DEFAULT_QC_RATES_V2);
  }
  navigator.clipboard.writeText(rates).then(() => {
    if (typeof window.showToast === 'function') {
      window.showToast('คัดลอกค่าการตั้งค่าสำเร็จ! นำไปส่งให้โปรแกรมเมอร์ได้เลย', 'success');
    } else {
      alert('คัดลอกค่าการตั้งค่าสำเร็จ! นำไปส่งให้โปรแกรมเมอร์ได้เลย');
    }
  }).catch(err => {
    prompt('คัดลอกข้อความด้านล่างนี้ไปส่งให้โปรแกรมเมอร์:', rates);
  });
};

window.qcSaveSettingsV3 = function() {
  const inputs = document.querySelectorAll('#qcSettingsTable input[type="number"]');
  const rates = {};
  
  inputs.forEach(inp => {
    const cat = inp.dataset.cat;
    const chan = inp.dataset.chan;
    const type = inp.dataset.type;
    const val = inp.value.trim() !== '' ? parseFloat(inp.value) : '';
    
    if (cat === 'default') {
      if (!rates['default']) rates['default'] = { qc1: '', qc1_conf70: '', qc1_conf0: '', qc1_url: '', qc2: '', qc2_conf70: '', qc2_conf0: '', qc2_url: '', manual: '' };
      if (chan === 'Website') rates['default'][type] = val;
    } else {
      const key = `${cat}_${chan}`;
      if (!rates[key]) rates[key] = { qc1: '', qc1_conf70: '', qc1_conf0: '', qc1_url: '', qc2: '', qc2_conf70: '', qc2_conf0: '', qc2_url: '', manual: '' };
      rates[key][type] = val;
    }
  });

  localStorage.setItem('qc_workload_rates_v2', JSON.stringify(rates));
  document.getElementById('qcSettingsModal').remove();
  
  if (typeof window.showToast === 'function') {
    window.showToast('บันทึกการตั้งค่าภาระงานเรียบร้อยแล้ว', 'success');
  }
  qcReloadPlan();
};

window.qcClearSettingsInputs = async function() {
  const confirmed = await window.qcCustomConfirm({
    title: 'ยืนยันการล้างการตั้งค่า',
    message: 'คุณต้องการล้างการตั้งค่าทั้งหมดใช่หรือไม่?\n(ค่าเริ่มต้นจะถูกปรับเป็น 1 และค่าการตั้งค่าหมวดหมู่เฉพาะจะถูกล้าง)',
    confirmText: 'ล้างการตั้งค่า',
    cancelText: 'ยกเลิก',
    isDanger: true
  });

  if (confirmed) {
    const inputs = document.querySelectorAll('#qcSettingsTable input[type="number"]');
    inputs.forEach(inp => {
      const cat = inp.dataset.cat;
      if (cat === 'default') {
        inp.value = 1;
      } else {
        inp.value = '';
      }
    });
    if (typeof window.showToast === 'function') {
      window.showToast('ล้างค่าการตั้งค่าเรียบร้อยแล้ว (กรุณากดบันทึกเพื่อบันทึกการเปลี่ยนแปลง)', 'info');
    }
  }
};

window.qcCustomConfirm = function(options) {
  return new Promise((resolve) => {
    const { title, message, confirmText, cancelText, isDanger } = options;
    
    // Create elements
    const overlay = document.createElement('div');
    overlay.id = 'qcConfirmModal';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(15, 23, 42, 0.45)';
    overlay.style.backdropFilter = 'blur(6px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999999';
    overlay.style.fontFamily = "'Kanit', sans-serif";
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s ease';
    
    const iconColor = isDanger ? '#ef4444' : '#f59e0b';
    const iconBg = isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
    const iconName = isDanger ? 'trash-2' : 'alert-triangle';
    const confirmBtnBg = isDanger ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)';
    const confirmBtnShadow = isDanger ? 'rgba(239, 68, 68, 0.3)' : 'rgba(37, 99, 235, 0.3)';

    overlay.innerHTML = `
      <div class="qc-confirm-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; width: 420px; max-width: 90%; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); transform: scale(0.95); transition: transform 0.2s ease; display: flex; flex-direction: column; align-items: center; text-align: center; box-sizing: border-box;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: ${iconBg}; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <i data-lucide="${iconName}" style="width: 24px; height: 24px; color: ${iconColor};"></i>
        </div>
        <h4 style="margin: 0 0 8px 0; font-size: 1.05rem; font-weight: 700; color: #0f172a;">${title || 'ยืนยันการทำรายการ'}</h4>
        <p style="margin: 0 0 24px 0; font-size: 0.82rem; color: #64748b; line-height: 1.5; white-space: pre-line;">${message || ''}</p>
        <div style="display: flex; gap: 12px; width: 100%;">
          <button id="qcConfirmCancelBtn" style="flex: 1; padding: 10px 16px; border: 1px solid #cbd5e1; background: #ffffff; color: #475569; border-radius: 10px; cursor: pointer; font-family: 'Kanit', sans-serif; font-size: 0.82rem; font-weight: 600; transition: all 0.15s; outline: none;">
            ${cancelText || 'ยกเลิก'}
          </button>
          <button id="qcConfirmOkBtn" style="flex: 1; padding: 10px 16px; border: none; background: ${confirmBtnBg}; color: #ffffff; border-radius: 10px; cursor: pointer; font-family: 'Kanit', sans-serif; font-size: 0.82rem; font-weight: 600; box-shadow: 0 2px 8px ${confirmBtnShadow}; transition: all 0.15s; outline: none;">
            ${confirmText || 'ตกลง'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: overlay });

    // Trigger transitions
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.querySelector('.qc-confirm-card').style.transform = 'scale(1)';
    });

    const closeConfirm = (result) => {
      overlay.style.opacity = '0';
      overlay.querySelector('.qc-confirm-card').style.transform = 'scale(0.95)';
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 200);
    };

    overlay.querySelector('#qcConfirmCancelBtn').onclick = () => closeConfirm(false);
    overlay.querySelector('#qcConfirmOkBtn').onclick = () => closeConfirm(true);
    
    // Add hover effects
    const cancelBtn = overlay.querySelector('#qcConfirmCancelBtn');
    cancelBtn.onmouseover = () => {
      cancelBtn.style.background = '#f8fafc';
      cancelBtn.style.borderColor = '#94a3b8';
    };
    cancelBtn.onmouseout = () => {
      cancelBtn.style.background = '#ffffff';
      cancelBtn.style.borderColor = '#cbd5e1';
    };

    const okBtn = overlay.querySelector('#qcConfirmOkBtn');
    okBtn.onmouseover = () => {
      okBtn.style.transform = 'translateY(-1px)';
      okBtn.style.boxShadow = `0 4px 12px ${confirmBtnShadow}`;
    };
    okBtn.onmouseout = () => {
      okBtn.style.transform = 'none';
      okBtn.style.boxShadow = `0 2px 8px ${confirmBtnShadow}`;
    };
  });
};

window.qcSaveLocalPlan = function(plan) {
  try {
    const added = JSON.parse(localStorage.getItem('qc_plans_added') || '[]');
    added.push(plan);
    localStorage.setItem('qc_plans_added', JSON.stringify(added));
    
    // Clean from deleted list just in case
    let deleted = JSON.parse(localStorage.getItem('qc_plans_deleted') || '[]');
    deleted = deleted.filter(ld => ld.id !== plan.id);
    localStorage.setItem('qc_plans_deleted', JSON.stringify(deleted));
  } catch(e) {}
};

window.qcDeleteLocalPlan = function(filter) {
  try {
    const deleted = JSON.parse(localStorage.getItem('qc_plans_deleted') || '[]');
    deleted.push(filter);
    localStorage.setItem('qc_plans_deleted', JSON.stringify(deleted));
    
    // Clean from added list just in case
    let added = JSON.parse(localStorage.getItem('qc_plans_added') || '[]');
    added = added.filter(la => {
      if (filter.id && filter.id === la.id) return false;
      if (filter.name === la.name && filter.qcType === la.qcType && filter.channel === la.channel && (filter.category || '') === (la.category || '')) {
        return false;
      }
      return true;
    });
    localStorage.setItem('qc_plans_added', JSON.stringify(added));
  } catch(e) {}
};

window.qcAutoPlanRemoveAllocationItem = function(btn, empIdx, cat) {
  const state = window.QC_AUTO_PLAN_STATE;
  const idx = parseInt(empIdx);
  const emp = state.allocations[idx];
  if (!emp) return;

  // Set the allocation value to 0
  if (emp.allocatedCases && emp.allocatedCases[cat] !== undefined) {
    emp.allocatedCases[cat] = 0;
  }

  // Remove the chip element
  const chip = btn.closest('.qc-alloc-chip');
  const parent = chip.parentNode;
  chip.remove();

  // If no chips remain, show placeholder
  if (parent && parent.querySelectorAll('.qc-alloc-chip').length === 0) {
    parent.innerHTML = '<span style="color:#94a3b8; font-style:italic;">ไม่ได้จัดสรรงานเพิ่ม</span>';
  }

  // Recalculate and update the workload display for this employee
  let ratesV2 = {};
  try {
    const raw = localStorage.getItem('qc_workload_rates_v2');
    ratesV2 = (raw && raw !== '{}') ? JSON.parse(raw) : window.DEFAULT_QC_RATES_V2;
  } catch(e) {
    ratesV2 = window.DEFAULT_QC_RATES_V2;
  }

  const planType = state.planType === 'QC' ? state.qcSubtype : 'Manual';
  const planChan = state.channel;

  let newPercent = 0;
  for (const [aCat, aVal] of Object.entries(emp.allocatedCases)) {
    const aRate = typeof window.qcGetRateForTask === 'function' ? window.qcGetRateForTask(ratesV2, aCat, planChan, planType) : 0.1;
    newPercent += aVal * aRate;
  }

  const combinedPct = emp.currentPercent + newPercent;
  const formattedCombinedPct = Math.round(combinedPct);
  const combinedColor = typeof window.getWorkloadColor === 'function' ? window.getWorkloadColor(combinedPct) : (combinedPct > 100 ? '#ef4444' : '#10b981');

  // Find the parent row
  const row = document.getElementById('qc_prop_row_' + idx);
  if (row) {
    const proposalChipsCol = document.getElementById('qc_proposal_chips_' + emp.name) || row.cells[3];
    if (proposalChipsCol) {
      if (newPercent > 0) {
        let displaysHtml = `
          <div style="display:flex; align-items:center; gap:6px; margin-top:4px; margin-bottom:2px;">
            <span style="font-size:0.7rem; color:#475569; font-weight:600;">ภาระงานเคสใหม่:</span>
            <div style="background:#eff6ff; color:#1d4ed8; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:99px; border:1px solid #bfdbfe;">
              ${Math.round(newPercent)}%
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
            <span style="font-size:0.7rem; color:#475569; font-weight:600;">รวมภาระงานทั้งหมด:</span>
            <div style="background:${combinedColor}; color:#fff; font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:99px; display:inline-block; box-shadow:0 1px 3px rgba(0,0,0,0.15);">
              ${formattedCombinedPct}%
            </div>
          </div>
        `;
        
        // Remove old displays if they exist
        const oldDisplays = proposalChipsCol.querySelectorAll('div[style*="display:flex; align-items:center"]');
        oldDisplays.forEach(od => od.remove());
        
        // Append new displays
        proposalChipsCol.insertAdjacentHTML('beforeend', displaysHtml);
      } else {
        // If newPercent is 0, clean all workload displays from this column
        const oldDisplays = proposalChipsCol.querySelectorAll('div[style*="display:flex; align-items:center"]');
        oldDisplays.forEach(od => od.remove());
      }
    }
  }

  // Update total people count
  if (typeof qcAutoPlanUpdatePeopleCount === 'function') {
    qcAutoPlanUpdatePeopleCount();
  }
};

window.qcAutoPlanOnInputCat = function(el) {
  var raw = el.value.replace(/[^0-9]/g, '');
  el.value = raw ? parseInt(raw, 10).toLocaleString('en-US') : '';
  
  // Save directly to dynamic categories state map
  var cat = el.getAttribute('data-category');
  var val = parseInt(raw, 10) || 0;
  
  if (!window.QC_AUTO_PLAN_STATE.categories) {
    window.QC_AUTO_PLAN_STATE.categories = {};
  }
  
  if (val > 0) {
    window.QC_AUTO_PLAN_STATE.categories[cat] = val;
  } else {
    delete window.QC_AUTO_PLAN_STATE.categories[cat];
  }
  
  qcAutoPlanRecalculateTotals();
};

// --- Show QC & Schedule Day Detail Modal ---
window.showQcDayDetailModal = function (personId, empName, empNameEn, empNick, dateIso) {
  const plans = window.QC_PLANS || [];
  
  // Robustly filter dayPlans
  const dayPlans = plans.filter(plan => plan.name === empName && plan.date === dateIso);
  
  // Robustly filter scheduleTasks
  const scheduleTasks = (window.SCHEDULE_TASKS || []).filter(t => {
    if (t.date !== dateIso) return false;
    const eName = empName?.trim().toLowerCase();
    const eNick = empNick?.trim().toLowerCase();
    const eNameEn = empNameEn?.trim().toLowerCase();
    const tPerson = (t.person || '').trim().toLowerCase();
    const tPersonId = (personId || '').trim().toLowerCase();
    const tOldName = (t.oldName || '').trim().toLowerCase();
    return tPerson === tPersonId || tPerson === eName || tPerson === eNick || tPerson === eNameEn || tOldName === eName || tOldName === eNick || tOldName === eNameEn;
  });

  // Calculate total workload
  let ratesV2 = {};
  try {
    const raw = localStorage.getItem('qc_workload_rates_v2');
    ratesV2 = (raw && raw !== '{}') ? JSON.parse(raw) : window.DEFAULT_QC_RATES_V2;
  } catch(e) {
    ratesV2 = window.DEFAULT_QC_RATES_V2;
  }

  let totalPct = 0;
  dayPlans.forEach(dp => {
    const isQc1 = dp.qcType === 'QC1';
    const isQc2 = dp.qcType === 'QC2';
    const isManual = dp.qcType === 'Manual';
    const dpType = isManual ? 'Manual' : (isQc1 ? 'QC1' : 'QC2');
    const pct = (dp.cases || 0) * (typeof window.qcGetRateForTask === 'function' ? window.qcGetRateForTask(ratesV2, dp.category, dp.channel, dpType) : 0);
    totalPct += pct;
  });

  scheduleTasks.forEach(t => {
    const pct = parseInt(t.hours) || parseInt(t.workload) || parseInt(t.percent) || 0;
    totalPct += pct;
  });

  let wlColor = typeof window.getWorkloadColor === 'function' ? window.getWorkloadColor(totalPct) : '#10b981';
  if (typeof window.getWorkloadColor !== 'function') {
    if (totalPct === 0) wlColor = '#94a3b8';
    else if (totalPct < 50) wlColor = '#ef4444';
    else if (totalPct <= 80) wlColor = '#facc15';
    else if (totalPct <= 100) wlColor = '#22c55e';
    else if (totalPct <= 120) wlColor = '#166534';
    else wlColor = '#7f1d1d';
  }

  const modalId = 'qcDayDetailModal';
  const html = `
  <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:12000; animation:fadeIn 0.2s ease">
    <div style="background:#fff; width:100%; max-width:550px; border-radius:28px; box-shadow:0 30px 60px -12px rgba(0,0,0,0.2); overflow:hidden; animation:modalBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); font-family: 'Inter', 'Kanit', sans-serif;">
      <div style="padding:24px 32px; background:#f8fafc; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center">
        <div>
          <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#1e293b;">${empNameEn || empName} ${empNick ? `(${empNick})` : ''}</h3>
          <div style="font-size:0.8rem; color:#64748b; font-weight:500; margin-top:2px">${new Date(dateIso).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <button onclick="document.getElementById('${modalId}').remove()" 
                style="width:36px; height:36px; border-radius:50%; background:#ffffff; border:1px solid #f1f5f9; box-shadow:0 4px 12px rgba(15, 23, 42, 0.08); cursor:pointer; display:flex; align-items:center; justify-content:center; color:#64748b; transition:all 0.2s;"
                onmouseover="this.style.boxShadow='0 6px 16px rgba(15, 23, 42, 0.12)'; this.style.transform='translateY(-1px)'; this.style.color='#0f172a'"
                onmouseout="this.style.boxShadow='0 4px 12px rgba(15, 23, 42, 0.08)'; this.style.transform='translateY(0)'; this.style.color='#64748b'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div style="padding:32px; max-height:65vh; overflow-y:auto">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
          <span style="font-size:0.85rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px">งานและภาระงานทั้งหมด</span>
          <div style="background:${wlColor}; color:#fff; font-size:0.75rem; font-weight:800; padding:4px 14px; border-radius:99px">Total Workload: ${Math.round(totalPct)}%</div>
        </div>
        
        <!-- QC Tasks Section -->
        <h4 style="margin:16px 0 10px 0; font-size:0.85rem; color:#1e293b; font-weight:700; display:flex; align-items:center; gap:8px">
          <i data-lucide="shield-check" style="width:16px; height:16px; color:#2563eb"></i> งานเคส QC / Manual (${dayPlans.length})
        </h4>
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px">
          ${dayPlans.length === 0 ? `
            <div style="padding:20px; text-align:center; background:#f8fafc; border:2px dashed #e2e8f0; border-radius:16px; color:#94a3b8; font-size:0.8rem; font-weight:500">ไม่มีงานเคสในวันนี้</div>
          ` : dayPlans.map(dp => {
            const isQc1 = dp.qcType === 'QC1';
            const isQc2 = dp.qcType === 'QC2';
            const isManual = dp.qcType === 'Manual';
            const dpType = isManual ? 'Manual' : (isQc1 ? 'QC1' : 'QC2');
            const pct = (dp.cases || 0) * (typeof window.qcGetRateForTask === 'function' ? window.qcGetRateForTask(ratesV2, dp.category, dp.channel, dpType) : 0);
            
            let badgeBg = '#f1f5f9';
            let badgeColor = '#64748b';
            let badgeBorder = '1px solid #e2e8f0';
            if (isQc1) { badgeBg = '#eff6ff'; badgeColor = '#1d4ed8'; badgeBorder = '1px solid #bfdbfe'; }
            else if (isQc2) { badgeBg = '#f0fdf4'; badgeColor = '#15803d'; badgeBorder = '1px solid #bbf7d0'; }
            else if (isManual) { badgeBg = '#fffbeb'; badgeColor = '#b45309'; badgeBorder = '1px solid #fde68a'; }
            
            const shortChannel = dp.channel === 'Website' ? 'Web' : (dp.channel === 'Social' ? 'Soc' : dp.channel);
            const channelText = shortChannel && shortChannel !== '-' ? ` (${shortChannel})` : '';
            return `
              <div style="padding:14px; border-radius:16px; background:#fff; border:1px solid #f1f5f9; border-left:4px solid ${badgeColor}; box-shadow:0 4px 6px -1px rgba(0,0,0,0.03); display:flex; justify-content:space-between; align-items:center">
                <div style="min-width:0; flex:1">
                  <div style="font-weight:700; color:#1e293b; font-size:0.88rem; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
                    <span style="background:${badgeBg}; color:${badgeColor}; border:${badgeBorder}; padding:2px 8px; border-radius:6px; font-size:0.65rem; font-weight:700;">${dpType}${channelText}</span>
                    <span>${(dp.cases || 0).toLocaleString('en-US')} เคส</span>
                  </div>
                  ${dp.category ? `<div style="font-size:0.75rem; color:#64748b; font-weight:500; word-break:break-word;">${dp.category}</div>` : ''}
                </div>
                <div style="display:flex; align-items:center; gap:12px; margin-left:10px;">
                  <div style="font-size:0.85rem; font-weight:800; color:#1e293b">${Math.round(pct)}%</div>
                  <button onclick="qcDeletePlanTask('${dp.id}'); document.getElementById('${modalId}').remove()" style="background:#fef2f2; color:#ef4444; border:none; width:32px; height:32px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                    <i data-lucide="trash-2" style="width:16px; height:16px"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Schedule Tasks Section -->
        <h4 style="margin:16px 0 10px 0; font-size:0.85rem; color:#1e293b; font-weight:700; display:flex; align-items:center; gap:8px">
          <i data-lucide="calendar-clock" style="width:16px; height:16px; color:#8b5cf6"></i> งานจากตาราง Schedule (${scheduleTasks.length})
        </h4>
        <div style="display:flex; flex-direction:column; gap:10px">
          ${scheduleTasks.length === 0 ? `
            <div style="padding:20px; text-align:center; background:#f8fafc; border:2px dashed #e2e8f0; border-radius:16px; color:#94a3b8; font-size:0.8rem; font-weight:500">ไม่มีงานเวียนในวันนี้</div>
          ` : scheduleTasks.map(t => {
            const proj = (t.acc || '').trim();
            const node = (t.node || '').trim();
            const title = (t.title || '').trim();
            const pct = parseInt(t.hours) || parseInt(t.workload) || parseInt(t.percent) || 0;
            const label = [proj, node].filter(Boolean).join(' · ') || title || 'งาน';
            return `
              <div style="padding:14px; border-radius:16px; background:#fff; border:1px solid #f1f5f9; border-left:4px solid #8b5cf6; box-shadow:0 4px 6px -1px rgba(0,0,0,0.03); display:flex; justify-content:space-between; align-items:center">
                <div style="min-width:0; flex:1">
                  <div style="font-weight:700; color:#1e293b; font-size:0.88rem; margin-bottom:4px">${label}</div>
                  ${title && title !== label ? `<div style="font-size:0.75rem; color:#64748b; font-weight:500;">${title}</div>` : ''}
                </div>
                <div style="display:flex; align-items:center; gap:12px; margin-left:10px;">
                  <div style="font-size:0.85rem; font-weight:800; color:#1e293b">${pct}%</div>
                  <button onclick="qcDeleteScheduleTask('${t.id}'); document.getElementById('${modalId}').remove()" style="background:#fef2f2; color:#ef4444; border:none; width:32px; height:32px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                    <i data-lucide="trash-2" style="width:16px; height:16px"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
  if (window.lucide) lucide.createIcons({ root: document.getElementById(modalId) });
};

// --- Automatically Sync QC/Manual Plan to Schedule ---
window.qcSyncPlanToSchedule = function(action, plan) {
  if (typeof window.apiSaveScheduleTask !== 'function') return;
  
  const personObj = (typeof DATA !== 'undefined' && DATA.employees || []).find(e => {
    const eName = (e.name || '').trim().toLowerCase();
    const eNameEn = (e.nameEn || '').trim().toLowerCase();
    const eNick = (e.nickname || '').trim().toLowerCase();
    const pName = (plan.name || '').trim().toLowerCase();
    return eName === pName || eNameEn === pName || eNick === pName;
  });
  if (!personObj) return;

  // Clean the person object so nickname is not '-'
  const cleanedPerson = {
    ...personObj,
    nickname: (personObj.nickname && personObj.nickname.trim() !== '-') ? personObj.nickname.trim() : personObj.name
  };

  const shortChannel = plan.channel === 'Website' ? 'Web' : (plan.channel === 'Social' ? 'Soc' : plan.channel);
  const channelText = shortChannel && shortChannel !== '-' ? ` (${shortChannel})` : '';
  const dpType = plan.qcType === 'Manual' ? 'Manual' : (plan.qcType === 'QC1' ? 'QC1' : 'QC2');
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

  if (action === 'add') {
    const schedTask = {
      id: 'SCH-' + plan.id,
      acc: 'ตรวจจับ',
      node: 'Monitor',
      title: workDetail,
      hours: pct
    };
    
    // Check if already in local window.SCHEDULE_TASKS to avoid duplicates
    if (window.SCHEDULE_TASKS) {
      const exists = window.SCHEDULE_TASKS.some(t => t.id === schedTask.id);
      if (!exists) {
        window.SCHEDULE_TASKS.push({
          id: schedTask.id,
          date: plan.date,
          person: cleanedPerson.id,
          acc: schedTask.acc,
          node: schedTask.node,
          title: schedTask.title,
          hours: schedTask.hours
        });
      }
    }
    
    window.apiSaveScheduleTask(schedTask, cleanedPerson, plan.date);
  } else if (action === 'delete') {
    const schedTask = {
      date: plan.date,
      title: workDetail
    };
    
    // Remove from local window.SCHEDULE_TASKS
    if (window.SCHEDULE_TASKS) {
      const idx = window.SCHEDULE_TASKS.findIndex(t => t.id === 'SCH-' + plan.id);
      if (idx !== -1) window.SCHEDULE_TASKS.splice(idx, 1);
    }
    
    if (typeof window.apiDeleteScheduleTask === 'function') {
      window.apiDeleteScheduleTask(schedTask, cleanedPerson);
    }
  }
};
