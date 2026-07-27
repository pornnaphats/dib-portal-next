window.loadEmpeoData = async function() {
    if (window._empeoDataLoaded || window._empeoDataLoading) return;
    window._empeoDataLoading = true;
    
    // Re-render to show loading state if currently on empeo tab
    if (window._leaveActiveTab === 'empeo' && typeof navigate === 'function') navigate('leave-management');
    
    try {
        let json;
        const cacheKey = 'DIB_EMPEO_CACHE_v1';
        const cacheTimeKey = 'DIB_EMPEO_CACHE_TIME_v1';
        const now = Date.now();
        const cachedStr = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        
        // Cache for 60 minutes
        if (cachedStr && cachedTime && (now - parseInt(cachedTime) < 60 * 60 * 1000)) {
            json = JSON.parse(cachedStr);
            console.log("Empeo data loaded from cache.");
        } else {
            console.log("Fetching Empeo data from API...");
            const res = await fetch('/api/empeo-attendance');
            json = await res.json();
            try {
                localStorage.setItem(cacheKey, JSON.stringify(json));
                localStorage.setItem(cacheTimeKey, now.toString());
            } catch(e) { console.warn("Could not cache Empeo data", e); }
        }
        
        window.DATA.empeoRaw = json;
        
        let calendar = {}; // empId -> { 'YYYY-MM-DD': status }
        let summariesByMonth = {}; // empId -> { 'YYYY-MM': { absent: 0... } }
        let employeesMap = {}; 
        let dailyLateMins = {}; // empId -> { 'YYYY-MM-DD': mins }
        let dailyLeaveEarlyMins = {}; // empId -> { 'YYYY-MM-DD': mins }
        
        const keys = Object.keys(json);
        
        keys.forEach(fileKey => {
            const fileData = json[fileKey];
            if (!fileData || !fileData.employees) return;
            
            // Extract file date from Monthly_Attendance_Report_DDMMYYYY_TH
            const m = fileKey.match(/_(\d{2})(\d{2})(\d{4})/);
            if (!m) return;
            
            const fileD = parseInt(m[1], 10);
            const fileM = parseInt(m[2], 10) - 1;
            const fileY = parseInt(m[3], 10);
            const fileDate = new Date(fileY, fileM, fileD);
            const monthKey = `${fileY}-${String(fileM + 1).padStart(2, '0')}`;
            
            const daysArr = fileData.days;
            let targetIdx = daysArr.indexOf(String(fileD));
            if (targetIdx === -1) targetIdx = daysArr.length - 1; // fallback
            
            let dateRefs = [];
            let currDate = new Date(fileY, fileM, fileD);
            currDate.setDate(currDate.getDate() - targetIdx);
            
            const toLocalISOString = (date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            };
            for (let i = 0; i < daysArr.length; i++) {
                let d = new Date(currDate);
                d.setDate(d.getDate() + i);
                dateRefs.push(toLocalISOString(d));
            }
            
            fileData.employees.forEach(emp => {
                if (!employeesMap[emp.id]) {
                    employeesMap[emp.id] = { id: emp.id, name: emp.name };
                    calendar[emp.id] = {};
                    summariesByMonth[emp.id] = {};
                    dailyLateMins[emp.id] = {};
                    dailyLeaveEarlyMins[emp.id] = {};
                }
                
                // Count how many 'L' and 'E' in the daily statuses of this file to distribute minutes proportionally
                let fileLateCount = 0;
                let fileLeaveEarlyCount = 0;
                for (let i = 0; i < dateRefs.length; i++) {
                    let st = emp.daily[i] ? String(emp.daily[i]).trim() : '';
                    if (st === 'L') fileLateCount++;
                    if (st === 'E') fileLeaveEarlyCount++;
                }
                
                let lateMinsPerDay = fileLateCount > 0 ? (emp.lateMins || 0) / fileLateCount : 0;
                let leaveEarlyMinsPerDay = fileLeaveEarlyCount > 0 ? (emp.leaveEarlyMins || 0) / fileLeaveEarlyCount : 0;
                
                // Merge daily
                for (let i = 0; i < dateRefs.length; i++) {
                    let st = emp.daily[i];
                    if (st && st !== '' && st !== '-') {
                        calendar[emp.id][dateRefs[i]] = st;
                        if (st === 'L') {
                            dailyLateMins[emp.id][dateRefs[i]] = lateMinsPerDay;
                        }
                        if (st === 'E') {
                            dailyLeaveEarlyMins[emp.id][dateRefs[i]] = leaveEarlyMinsPerDay;
                        }
                    }
                }
                
                // Merge summary into the month of this file
                if (!summariesByMonth[emp.id][monthKey]) {
                    summariesByMonth[emp.id][monthKey] = {
                        present: 0, absent: 0, lateTimes: 0, lateMins: 0,
                        leaveEarlyTimes: 0, leaveEarlyMins: 0, forgetIn: 0, forgetOut: 0,
                        sickLeave: 0, personalLeave: 0, vacationLeave: 0, otherLeave: 0
                    };
                }
                let s = summariesByMonth[emp.id][monthKey];
                s.present += emp.present || 0;
                s.absent += emp.absent || 0;
                s.lateTimes += emp.lateTimes || 0;
                s.lateMins += emp.lateMins || 0;
                s.leaveEarlyTimes += emp.leaveEarlyTimes || 0;
                s.leaveEarlyMins += emp.leaveEarlyMins || 0;
                s.forgetIn += emp.forgetIn || 0;
                s.forgetOut += emp.forgetOut || 0;
                s.sickLeave += emp.sickLeave || 0;
                s.personalLeave += emp.personalLeave || 0;
                s.vacationLeave += emp.vacationLeave || 0;
                s.otherLeave += emp.otherLeave || 0;
            });
        });
        
        window.DATA.empeoCalendar = calendar;
        window.DATA.empeoSummariesByMonth = summariesByMonth;
        window.DATA.empeoDailyLateMins = dailyLateMins;
        window.DATA.empeoDailyLeaveEarlyMins = dailyLeaveEarlyMins;
        window.DATA.empeoEmployees = Object.values(employeesMap);
        
        window._empeoDataLoaded = true;
        window.dispatchEvent(new Event('empeoDataLoaded'));
    } catch(e) {
        console.error("Failed to load Empeo data", e);
        // Force loaded to true to prevent infinite loop of loading if API fails
        window._empeoDataLoaded = true; 
        window.dispatchEvent(new Event('empeoDataLoaded'));
        window.DATA.empeoReport = [];
        window.DATA.empeoDays = [];
    } finally {
        window._empeoDataLoading = false;
        if (window._leaveActiveTab === 'empeo' && typeof navigate === 'function') navigate('leave-management'); // Re-render with data or empty
    }
};
