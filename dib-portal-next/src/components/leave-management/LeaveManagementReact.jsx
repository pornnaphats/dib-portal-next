import React, { useState, useEffect } from 'react';

// ── Empeo Report Panel ──────────────────────────────────────────────────────
function EmpeoReportPanel() {
    const reportRef = React.useRef(null);
    const [empeoSearch, setEmpeoSearch] = useState('');
    const [empeoMonth, setEmpeoMonth] = useState(() => {
        const n = new Date();
        return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
    });
    const [empeoMonthOpen, setEmpeoMonthOpen] = useState(false);
    const [reportHtml, setReportHtml] = useState('');

    // Stable render function — useCallback ensures same reference across renders
    const renderReport = React.useCallback(() => {
        const html = typeof window.renderEmpeoReport === 'function'
            ? window.renderEmpeoReport()
            : '<div class="p-8 text-center text-gray-400">Loading Empeo Report...</div>';
        setReportHtml(html);
    }, []); // no deps → stable reference, always uses latest window globals

    // Update global date range + re-render when month changes
    useEffect(() => {
        const [y, m] = empeoMonth.split('-').map(Number);
        const start = new Date(y, m - 1, 1);
        const end   = new Date(y, m, 0);
        const fmt   = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        window._leaveDateRange = `${fmt(start)} to ${fmt(end)}`;
        renderReport();
    }, [empeoMonth, renderReport]);

    // Listen for Empeo data load — registered ONCE (renderReport is stable)
    useEffect(() => {
        // Clear stuck loading states on component mount to force a clean load
        window._empeoDataLoading = false;
        
        if (typeof window.loadEmpeoData === 'function' && (!window._empeoDataLoaded || !window.DATA?.empeoCalendar)) {
            window._empeoDataLoaded = false;
            window.loadEmpeoData();
        }

        if (window._empeoDataLoaded) renderReport();

        window.addEventListener('empeoDataLoaded', renderReport);
        return () => window.removeEventListener('empeoDataLoaded', renderReport);
    }, [renderReport]);

    // Re-init lucide icons AFTER React commits HTML to the DOM
    useEffect(() => {
        if (!reportHtml || !reportRef.current) return;
        if (window.lucide) {
            window.lucide.createIcons({ root: reportRef.current });
        }
    }, [reportHtml]);

    // Force icon refresh when month filter state changes (e.g. closing dropdown or selecting month)
    useEffect(() => {
        if (window.lucide && reportRef.current) {
            window.lucide.createIcons({ root: reportRef.current });
        }
    }, [empeoMonth, empeoMonthOpen]);

    // Live name search
    useEffect(() => {
        if (typeof window.filterEmpeoTable === 'function') {
            window.filterEmpeoTable(empeoSearch);
        }
    }, [empeoSearch, reportHtml]);

    // Month dropdown options — last 12 months
    const thaiMonthNames = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        return {
            val:   `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
            label: `${thaiMonthNames[d.getMonth()]} ${d.getFullYear()+543}`
        };
    });
    const selectedMonthLabel = monthOptions.find(o => o.val === empeoMonth)?.label || empeoMonth;

    return (
        <div>
            {/* Empeo Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                {/* Month Filter Dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setEmpeoMonthOpen(!empeoMonthOpen)}
                        style={{ borderRadius: '99px', border: '1px solid #e2e8f0', background: '#fff', color: '#24204D', fontWeight: '500', height: '34px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        {selectedMonthLabel}
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    {empeoMonthOpen && (
                        <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setEmpeoMonthOpen(false)} />
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', width: '160px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', zIndex: 9999, padding: '4px', maxHeight: '260px', overflowY: 'auto' }}>
                                {monthOptions.map(o => (
                                    <div
                                        key={o.val}
                                        onClick={() => { setEmpeoMonth(o.val); setEmpeoMonthOpen(false); }}
                                        style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', fontWeight: o.val === empeoMonth ? '700' : '500', color: o.val === empeoMonth ? '#635BFF' : '#64748b', background: o.val === empeoMonth ? '#eff6ff' : 'transparent' }}
                                        onMouseOver={e => { if (o.val !== empeoMonth) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#24204D'; }}}
                                        onMouseOut={e =>  { if (o.val !== empeoMonth) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}}
                                    >
                                        {o.label}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                {/* Search Box */}
                <div style={{ width: '220px', background: '#fff', padding: '0 12px', border: '1px solid #e2e8f0', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', height: '34px', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8', flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อพนักงาน..."
                        value={empeoSearch}
                        onChange={e => setEmpeoSearch(e.target.value)}
                        style={{ fontSize: '13px', border: 'none', outline: 'none', background: 'transparent', width: '100%', color: '#24204D' }}
                    />
                </div>
            </div>
            {/* Empeo Report (injected from legacy renderEmpeoReport) */}
            <div ref={reportRef} dangerouslySetInnerHTML={{ __html: reportHtml }} />
        </div>
    );
}


export default function LeaveManagementReact() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('all');
    const [selectedLeaveType, setSelectedLeaveType] = useState('all');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
    const [leaveTypeDropdownOpen, setLeaveTypeDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const tableCardRef = React.useRef(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedTeam, selectedLeaveType]);
    useEffect(() => {
        if (tableCardRef.current) {
            const container = tableCardRef.current.closest('.overflow-y-auto');
            if (container) {
                const cardTop = tableCardRef.current.offsetTop;
                container.scrollTo({
                    top: cardTop - 20,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentPage]);


    useEffect(() => {
        const fetchLeaves = async (skipLoading = false) => {
            if (!skipLoading) setLoading(true);
            try {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                if (!supabaseUrl || !supabaseKey) return;
                
                const res = await fetch(`${supabaseUrl}/rest/v1/leave_requests?select=*&limit=5000`, {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    
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

                    const mapped = data.map(r => ({
                        id: r.id,
                        name: r.name,
                        type: r.type,
                        fromDate: r.start_date,
                        toDate: r.end_date,
                        startRaw: r.start_date,
                        endRaw: r.end_date,
                        start: formatDateTH(r.start_date),
                        end: formatDateTH(r.end_date),
                        requestDate: formatDateTH(r.request_date || r.created_at),
                        refDate: r.ref_date ? formatDateTH(r.ref_date) : '-',
                        days: parseFloat(r.days) || 1,
                        reason: r.note || '-',
                        note: r.note || '-',
                        status: (r.status || 'pending').toLowerCase(),
                        approvedBy: r.approved_by || '-'
                    }));

                    setRequests(mapped);
                    if (window.DATA) {
                        window.DATA.leaveRequests = mapped;
                    }
                }
            } catch (error) {
                console.error("Error fetching leaves:", error);
            } finally {
                if (!skipLoading) setLoading(false);
            }
        };

        fetchLeaves();

        window.refreshLeaveData = () => {
            if (window.DATA && window.DATA.leaveRequests) {
                const localMapped = window.DATA.leaveRequests.map(r => ({
                    id: r.id,
                    name: r.name,
                    type: r.type,
                    fromDate: r.startRaw || r.start,
                    toDate: r.endRaw || r.end,
                    startRaw: r.startRaw || r.start,
                    endRaw: r.endRaw || r.end,
                    start: r.start,
                    end: r.end,
                    requestDate: r.requestDate || r.request_date,
                    refDate: r.refDate || r.ref_date || '-',
                    days: parseFloat(r.days) || 1,
                    reason: r.note || r.reason || '-',
                    note: r.note || '-',
                    status: (r.status || 'pending').toLowerCase(),
                    approvedBy: r.approvedBy || r.approved_by || '-'
                }));
                setRequests(localMapped);
            }
            fetchLeaves(true);
        };

        const handleOutsideClick = (e) => {
            if (!e.target.closest('[id^="react_actionMenu_leave_"]') && !e.target.closest('.action-menu-trigger')) {
                document.querySelectorAll('[id^="react_actionMenu_leave_"]').forEach(el => {
                    el.style.display = 'none';
                });
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            delete window.refreshLeaveData;
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const getEmployeeAvatar = (name) => {
        const cleanName = (name || '').trim().split(/\s+/)[0];
        const emp = (window.DATA && window.DATA.employees || []).find(e => 
            e.name.includes(cleanName) || (e.nameEn && e.nameEn.toLowerCase().includes(cleanName.toLowerCase()))
        );
        if (emp && emp.avatar && emp.avatar.startsWith('http') && !emp.avatar.includes('ui-avatars.com')) {
            return emp.avatar;
        }
        return null;
    };

    const getEmployeeNickname = (name) => {
        const cleanName = (name || '').trim().split(/\s+/)[0];
        const emp = (window.DATA && window.DATA.employees || []).find(e => 
            e.name.includes(cleanName) || (e.nameEn && e.nameEn.toLowerCase().includes(cleanName.toLowerCase()))
        );
        if (emp && emp.nickname && emp.nickname !== '-') {
            return emp.nickname;
        }
        return cleanName;
    };

    const getEmployeeTeam = (name) => {
        const cleanName = (name || '').trim().split(/\s+/)[0];
        const emp = (window.DATA && window.DATA.employees || []).find(e => 
            e.name.includes(cleanName) || (e.nameEn && e.nameEn.toLowerCase().includes(cleanName.toLowerCase()))
        );
        return emp ? emp.dept : '';
    };

    const filteredRequests = requests.filter(r => {
        const nickname = getEmployeeNickname(r.name);
        const team = getEmployeeTeam(r.name);
        const matchesSearch = (
            r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const matchesTeam = selectedTeam === 'all' || team === selectedTeam;
        const matchesLeaveType = selectedLeaveType === 'all' || r.type === selectedLeaveType;
        return matchesSearch && matchesTeam && matchesLeaveType;
    });

    const totalFiltered = filteredRequests.length;
    const totalPages = Math.ceil(totalFiltered / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + pageSize);

    const stats = {
        total: filteredRequests.length,
        approved: filteredRequests.filter(d => d.status === 'approved' || d.status === 'อนุมัติแล้ว').length,
        pending: filteredRequests.filter(d => d.status === 'pending' || d.status === 'รอการอนุมัติ').length,
        rejected: filteredRequests.filter(d => d.status === 'rejected' || d.status === 'ไม่อนุมัติ').length,
        totalDays: filteredRequests.reduce((sum, d) => sum + (d.days || 0), 0)
    };

    const teams = Array.from(new Set(
        (window.DATA && window.DATA.employees || [])
            .map(e => e.dept)
            .filter(Boolean)
    )).sort();

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const onLeaveToday = requests.filter(r =>
        r.startRaw <= todayStr && r.endRaw >= todayStr
    );
    const totalEmployees = (window.DATA && window.DATA.employees || []).length;
    const activeToday = totalEmployees - onLeaveToday.length;
    const presenceRate = totalEmployees > 0 ? Math.round((activeToday / totalEmployees) * 100) : 100;
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    const onLeaveTomorrow = requests.filter(r =>
        r.startRaw <= tomorrowStr && r.endRaw >= tomorrowStr
    );
    const todayDisplay = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
    const today = now.getDate();
    const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

    const leaveDaysMap = new Map();
    requests.forEach(r => {
        const start = r.startRaw ? new Date(r.startRaw) : null;
        const end = r.endRaw ? new Date(r.endRaw) : start;
        if (start && end) {
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                if (d.getFullYear() === year && d.getMonth() === month) {
                    const dayNum = d.getDate();
                    if (!leaveDaysMap.has(dayNum)) {
                        leaveDaysMap.set(dayNum, []);
                    }
                    if (!leaveDaysMap.get(dayNum).includes(r.type)) {
                        leaveDaysMap.get(dayNum).push(r.type);
                    }
                }
            }
        }
    });

    const pctApproved = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : '0.0';
    const pctPending = stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : '0.0';
    const pctRejected = stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(1) : '0.0';

    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!loading && activeTab === 'overview' && window.Chart && typeof window.initLeaveChartsV2 === 'function') {
            setTimeout(() => {
                window.initLeaveChartsV2();
            }, 150);
        }
        if (!loading && window.lucide) {
            setTimeout(() => {
                window.lucide.createIcons();
            }, 50);
        }
    }, [loading, activeTab, requests]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 gap-3">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="text-sm font-medium">Loading Leave Data...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 fade-in">
            {/* Top Action Bar with Tabs */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 bg-[#f1f5f9] p-1.5 rounded-full">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-[0.85rem] transition-all font-semibold ${activeTab === 'overview' ? 'bg-[#635BFF] text-white shadow-md' : 'text-gray-500 hover:text-[#635BFF]'}`}
                    >
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('empeo')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-[0.85rem] transition-all font-semibold ${activeTab === 'empeo' ? 'bg-[#635BFF] text-white shadow-md' : 'text-gray-500 hover:text-[#635BFF]'}`}
                    >
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        Empeo Report
                    </button>
                </div>
            </div>

            {activeTab === 'empeo' ? (
                <EmpeoReportPanel />
            ) : (
                <>
                    {/* KPI Row */}
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'ยอดการลาทั้งหมด', val: stats.total, unit: 'รายการ', sub: 'รายการทั้งหมดในระบบ', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>, color: '#ffffff', bg: '#635BFF', shadow: 'rgba(99,91,255,0.3)', subColor: '#635BFF' },
                            { label: 'จำนวนผู้ลาวันนี้', val: onLeaveToday.length, unit: 'คน', sub: 'ที่ลางานวันนี้', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>, color: '#ffffff', bg: '#ef4444', shadow: 'rgba(239,68,68,0.3)', subColor: '#ef4444' },
                            { label: 'อัตราการมาทำงานวันนี้', val: `${presenceRate}%`, unit: '', sub: `${activeToday} จากทั้งหมด ${totalEmployees} คน`, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>, color: '#ffffff', bg: '#10b981', shadow: 'rgba(16,185,129,0.3)', subColor: '#10b981' },
                            { label: 'การลาในวันพรุ่งนี้', val: onLeaveTomorrow.length, unit: 'คน', sub: 'ผู้มีกำหนดลาวันพรุ่งนี้', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>, color: '#ffffff', bg: '#f59e0b', shadow: 'rgba(245,158,11,0.3)', subColor: '#f59e0b' }
                        ].map((stat, i) => (
                            <div key={i} className="stat-card" style={{ padding: '20px', alignItems: 'flex-start', gap: '8px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${stat.shadow}`, flexShrink: 0 }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: '.7rem', color: 'var(--text-3)', fontWeight: '600', marginBottom: '4px' }}>{stat.label}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>
                                        {stat.val} {stat.unit && <span style={{ fontSize: '.75rem', fontWeight: '400', color: 'var(--text-3)' }}>{stat.unit}</span>}
                                    </div>
                                    <div style={{ fontSize: '.65rem', color: stat.subColor, fontWeight: '600', marginTop: '4px' }}>{stat.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Charts and Calendar Row */}
                    <div className="grid grid-cols-[320px_1fr_320px_240px] gap-4 mb-6">
                        {/* Leave Type Chart */}
                        <div key="chart-type" className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border-0 h-[280px] flex flex-col">
                            <div className="text-sm font-bold text-gray-800 mb-4">สถิติประเภทการลา</div>
                            <div className="h-[190px] w-full relative">
                                <canvas id="leaveTypeChart"></canvas>
                            </div>
                        </div>

                        {/* Trend Chart */}
                        <div key="chart-trend" className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border-0 h-[280px] flex flex-col">
                            <div className="text-sm font-bold text-gray-800 mb-4">แนวโน้มการลาในแต่ละเดือน</div>
                            <div className="h-[190px] w-full relative">
                                <canvas id="leaveTrendChart"></canvas>
                            </div>
                        </div>

                        {/* On Leave Today & Tomorrow Card */}
                        <div key="on-leave-today" className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border-0 flex flex-col h-[280px]">
                            <div className="flex items-center justify-between mb-3 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div style={{ width: '34px', height: '34px', minWidth: '34px', minHeight: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.25)', flexShrink: 0, aspectRatio: '1/1' }}>
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                                            <circle cx="9" cy="7" r="4" strokeWidth="2" />
                                            <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points="16 11 18 13 22 9" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-800 whitespace-nowrap">ผู้ลางาน (On Leave)</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                                {/* วันนี้ */}
                                <div>
                                    <div className="text-[9px] font-extrabold text-rose-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                        วันนี้ (Today)
                                    </div>
                                    {onLeaveToday.length === 0 ? (
                                        <div className="text-center text-[10px] text-gray-400 italic py-2 bg-slate-50/50 rounded-lg">ไม่มีผู้ลาวันนี้</div>
                                    ) : (
                                        <div className="flex flex-col gap-1.5">
                                            {onLeaveToday.map(r => {
                                                const leaveColor = r.type === 'ลาพักร้อน' ? 'text-[#0ea5e9] bg-[#0ea5e9]/15' : r.type === 'ลากิจ' ? 'text-[#f97316] bg-[#f97316]/15' : r.type === 'ลาป่วย' ? 'text-[#ef4444] bg-[#ef4444]/15' : r.type === 'วันหยุดชดเชย' ? 'text-[#10b981] bg-[#10b981]/15' : 'text-[#8b5cf6] bg-[#8b5cf6]/15';
                                                const leaveLabel = r.type === 'ลาพักร้อน' ? 'Vacation Leave' : r.type === 'ลากิจ' ? 'Business Leave' : r.type === 'ลาป่วย' ? 'Sick Leave' : r.type === 'วันหยุดชดเชย' ? 'Compensatory Leave' : r.type === 'ลาคลอด / ลาเลี้ยงดูบุตร' ? 'Maternity Leave' : r.type === 'ลาเพื่อการฌาปนกิจศพ' ? 'Compassionate Leave' : r.type === 'อบรม / สัมมนา' ? 'Training Leave' : 'Other';
                                                const avatarUrl = getEmployeeAvatar(r.name);
                                                return (
                                                    <div key={r.id} className="flex items-center gap-2 bg-[#f8fafc] border border-slate-100 rounded-xl px-2.5 py-1.5 min-w-0">
                                                        {avatarUrl ? (
                                                            <img src={avatarUrl} style={{ width: '26px', height: '26px', minWidth: '26px', minHeight: '26px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, aspectRatio: '1/1' }} />
                                                        ) : (
                                                            <div style={{ width: '26px', height: '26px', minWidth: '26px', minHeight: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: getEmployeeNickname(r.name).length > 5 ? '6px' : (getEmployeeNickname(r.name).length > 3 ? '7px' : '9px'), flexShrink: 0, aspectRatio: '1/1', padding: '0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {getEmployeeNickname(r.name)}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[11px] font-bold text-gray-800 truncate">{r.name}</div>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className={`px-2 py-0.5 rounded-full text-[7px] font-bold ${leaveColor}`}>{leaveLabel}</span>
                                                                <span className="text-[8px] text-gray-500">{r.days > 1 ? `${r.start} - ${r.end}` : r.start}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* พรุ่งนี้ */}
                                <div>
                                    <div className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                        พรุ่งนี้ (Tomorrow)
                                    </div>
                                    {onLeaveTomorrow.length === 0 ? (
                                        <div className="text-center text-[10px] text-gray-400 italic py-2 bg-slate-50/50 rounded-lg">ไม่มีผู้ลาพรุ่งนี้</div>
                                    ) : (
                                        <div className="flex flex-col gap-1.5">
                                            {onLeaveTomorrow.map(r => {
                                                const leaveColor = r.type === 'ลาพักร้อน' ? 'text-[#0ea5e9] bg-[#0ea5e9]/15' : r.type === 'ลากิจ' ? 'text-[#f97316] bg-[#f97316]/15' : r.type === 'ลาป่วย' ? 'text-[#ef4444] bg-[#ef4444]/15' : r.type === 'วันหยุดชดเชย' ? 'text-[#10b981] bg-[#10b981]/15' : 'text-[#8b5cf6] bg-[#8b5cf6]/15';
                                                const leaveLabel = r.type === 'ลาพักร้อน' ? 'Vacation Leave' : r.type === 'ลากิจ' ? 'Business Leave' : r.type === 'ลาป่วย' ? 'Sick Leave' : r.type === 'วันหยุดชดเชย' ? 'Compensatory Leave' : r.type === 'ลาคลอด / ลาเลี้ยงดูบุตร' ? 'Maternity Leave' : r.type === 'ลาเพื่อการฌาปนกิจศพ' ? 'Compassionate Leave' : r.type === 'อบรม / สัมมนา' ? 'Training Leave' : 'Other';
                                                const avatarUrl = getEmployeeAvatar(r.name);
                                                return (
                                                    <div key={r.id} className="flex items-center gap-2 bg-[#f8fafc] border border-slate-100 rounded-xl px-2.5 py-1.5 min-w-0">
                                                        {avatarUrl ? (
                                                            <img src={avatarUrl} style={{ width: '26px', height: '26px', minWidth: '26px', minHeight: '26px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, aspectRatio: '1/1' }} />
                                                        ) : (
                                                            <div style={{ width: '26px', height: '26px', minWidth: '26px', minHeight: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: getEmployeeNickname(r.name).length > 5 ? '6px' : (getEmployeeNickname(r.name).length > 3 ? '7px' : '9px'), flexShrink: 0, aspectRatio: '1/1', padding: '0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {getEmployeeNickname(r.name)}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[11px] font-bold text-gray-800 truncate">{r.name}</div>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className={`px-2 py-0.5 rounded-full text-[7px] font-bold ${leaveColor}`}>{leaveLabel}</span>
                                                                <span className="text-[8px] text-gray-500">{r.days > 1 ? `${r.start} - ${r.end}` : r.start}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div key="calendar" className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100/80 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-[0.8rem] font-extrabold text-gray-800 tracking-tight">ปฏิทินการลา</div>
                                <div className="flex gap-1.5 items-center">
                                    <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="w-6 h-6 rounded-full border border-slate-100 flex items-center justify-center text-gray-400 hover:text-[#635BFF] hover:bg-slate-50 transition-all">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                                    </button>
                                    <div className="text-[0.7rem] font-bold text-gray-800 mx-1">{thaiMonths[month]} {year + 543}</div>
                                    <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="w-6 h-6 rounded-full border border-slate-100 flex items-center justify-center text-gray-400 hover:text-[#635BFF] hover:bg-slate-50 transition-all">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center mb-3">
                                {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((d, index) => {
                                    const colorClass = index === 0 ? 'text-red-500' : index === 6 ? 'text-[#635BFF]' : 'text-gray-400';
                                    return (
                                        <div key={d} className={`text-[0.65rem] ${colorClass} font-bold py-1`}>{d}</div>
                                    );
                                })}
                                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const d = i + 1;
                                    const isToday = isCurrentMonth && d === today;
                                    const dayLeaves = leaveDaysMap.get(d) || [];
                                    const hasLeave = dayLeaves.length > 0;
                                    return (
                                        <div key={d} className="h-8 w-full flex items-center justify-center relative">
                                            <div className={`w-7 h-7 rounded-full flex flex-col items-center justify-center text-[0.7rem] transition-all ${
                                                isToday 
                                                    ? 'bg-[#635BFF] text-white font-extrabold shadow-[0_4px_10px_rgba(99,91,255,0.3)]' 
                                                    : 'text-gray-700 hover:bg-slate-50 cursor-pointer font-medium'
                                            }`} style={{ lineHeight: '1' }}>
                                                <span style={{ transform: hasLeave ? 'translateY(1px)' : 'none' }}>{d}</span>
                                                {hasLeave && (
                                                    <div className="flex gap-[2.5px] justify-center mt-[1px]">
                                                        {dayLeaves.slice(0, 3).map((type, idx) => {
                                                            const dotColor = type === 'ลาพักร้อน' ? 'bg-[#635BFF]' : type === 'ลากิจ' ? 'bg-[#f97316]' : type === 'ลาป่วย' ? 'bg-[#ef4444]' : type === 'วันหยุดชดเชย' ? 'bg-[#10b981]' : 'bg-[#8b5cf6]';
                                                            return <div key={idx} className={`w-[2.5px] h-[2.5px] rounded-full ${isToday ? 'bg-white' : dotColor}`}></div>;
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-x-2 gap-y-1 justify-center shrink-0">
                                {[
                                    { label: 'ลาพักร้อน', color: 'bg-[#635BFF]' },
                                    { label: 'ลากิจ', color: 'bg-[#f97316]' },
                                    { label: 'ลาป่วย', color: 'bg-[#ef4444]' },
                                    { label: 'วันชดเชย', color: 'bg-[#10b981]' },
                                    { label: 'อื่นๆ', color: 'bg-[#8b5cf6]' }
                                ].map(l => (
                                    <div key={l.label} className="flex items-center gap-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${l.color}`}></div>
                                        <span className="text-[0.6rem] text-gray-500 font-medium">{l.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div ref={tableCardRef} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                        <div className="p-5 flex justify-between items-center">
                            <div className="text-sm font-bold text-gray-800">รายการลาทั้งหมด</div>
                            <div className="flex items-center gap-3">
                                <div 
                                    style={{ 
                                        width: '200px', 
                                        backgroundColor: '#ffffff', 
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: '99px', 
                                        height: '34px', 
                                        boxSizing: 'border-box', 
                                        padding: '0 12px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)';
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px) scale(0.97)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.04)';
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                                    }}
                                >
                                    <svg className="w-[14px] h-[14px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    <input 
                                        type="text" 
                                        placeholder="ค้นหา..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ fontSize: '13px', border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', color: '#24204D' }}
                                    />
                                </div>
                                <div style={{ position: 'relative', width: '150px', flexShrink: 0 }}>
                                    <button 
                                        onClick={() => setLeaveTypeDropdownOpen(!leaveTypeDropdownOpen)} 
                                        style={{ 
                                            width: '100%', 
                                            borderRadius: '99px', 
                                            border: '1px solid #e2e8f0', 
                                            backgroundColor: '#ffffff', 
                                            color: '#24204D', 
                                            fontWeight: '500', 
                                            height: '34px', 
                                            boxSizing: 'border-box', 
                                            fontSize: '12px', 
                                            padding: '0 12px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            cursor: 'pointer', 
                                            boxShadow: '0 1px 2px rgba(15,23,42,0.04)', 
                                            transition: 'all 0.2s' 
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                        onMouseDown={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-1px) scale(0.97)';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.04)';
                                        }}
                                        onMouseUp={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                                        }}
                                    >
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {selectedLeaveType === 'all' ? 'ประเภทการลาทั้งหมด' : selectedLeaveType}
                                        </span>
                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>
                                    {leaveTypeDropdownOpen && (
                                        <>
                                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }} onClick={() => setLeaveTypeDropdownOpen(false)}></div>
                                            <div style={{ 
                                                position: 'absolute', 
                                                top: '100%', 
                                                right: 0, 
                                                marginTop: '6px', 
                                                width: '180px', 
                                                backgroundColor: '#ffffff', 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: '12px', 
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.08)', 
                                                zIndex: 9999, 
                                                overflowX: 'hidden', 
                                                overflowY: 'auto', 
                                                maxHeight: '240px', 
                                                padding: '4px' 
                                            }}>
                                                <div 
                                                    onClick={() => { setSelectedLeaveType('all'); setLeaveTypeDropdownOpen(false); }} 
                                                    style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', color: '#64748b', fontWeight: '500', backgroundColor: 'transparent', transition: 'all 0.1s' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#24204D'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                                                >
                                                    ประเภทการลาทั้งหมด
                                                </div>
                                                {['ลาพักร้อน', 'ลากิจ', 'ลาป่วย', 'วันหยุดชดเชย', 'ลาคลอด / ลาเลี้ยงดูบุตร', 'ลาเพื่อการฌาปนกิจศพ', 'อบรม / สัมมนา', 'อื่นๆ'].map(t => (
                                                    <div 
                                                        key={t}
                                                        onClick={() => { setSelectedLeaveType(t); setLeaveTypeDropdownOpen(false); }} 
                                                        style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', color: '#64748b', fontWeight: '500', backgroundColor: 'transparent', transition: 'all 0.1s' }}
                                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#24204D'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                                                    >
                                                        {t}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div style={{ position: 'relative', width: '140px', flexShrink: 0 }}>
                                    <button 
                                        onClick={() => setTeamDropdownOpen(!teamDropdownOpen)} 
                                        style={{ 
                                            width: '100%', 
                                            borderRadius: '99px', 
                                            border: '1px solid #e2e8f0', 
                                            backgroundColor: '#ffffff', 
                                            color: '#24204D', 
                                            fontWeight: '500', 
                                            height: '34px', 
                                            boxSizing: 'border-box', 
                                            fontSize: '12px', 
                                            padding: '0 12px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            cursor: 'pointer', 
                                            boxShadow: '0 1px 2px rgba(15,23,42,0.04)', 
                                            transition: 'all 0.2s' 
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                        onMouseDown={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-1px) scale(0.97)';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.04)';
                                        }}
                                        onMouseUp={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                                        }}
                                    >
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                                            {selectedTeam === 'all' ? 'ทีมทั้งหมด' : selectedTeam}
                                        </span>
                                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7"></path></svg>
                                    </button>
                                    {teamDropdownOpen && (
                                        <>
                                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }} onClick={() => setTeamDropdownOpen(false)} />
                                            <div style={{ 
                                                position: 'absolute', 
                                                top: '38px', 
                                                left: 0, 
                                                width: '100%', 
                                                backgroundColor: '#ffffff', 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: '12px', 
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.08)', 
                                                zIndex: 9999, 
                                                overflowX: 'hidden', 
                                                overflowY: 'auto', 
                                                maxHeight: '240px', 
                                                padding: '4px' 
                                            }}>
                                                <div 
                                                    onClick={() => { setSelectedTeam('all'); setTeamDropdownOpen(false); }} 
                                                    style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', color: '#64748b', fontWeight: '500', backgroundColor: 'transparent', transition: 'all 0.1s' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#24204D'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                                                >
                                                    ทีมทั้งหมด
                                                </div>
                                                {teams.map(t => (
                                                    <div 
                                                        key={t}
                                                        onClick={() => { setSelectedTeam(t); setTeamDropdownOpen(false); }} 
                                                        style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', color: '#64748b', fontWeight: '500', backgroundColor: 'transparent', transition: 'all 0.1s' }}
                                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#24204D'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                                                    >
                                                        {t}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div style={{ width: '1px', height: '20px', backgroundColor: '#cbd5e1', margin: '0 4px' }}></div>
                                <button 
                                    onClick={() => { setSearchQuery(''); setSelectedTeam('all'); setSelectedLeaveType('all'); }} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px', 
                                        borderRadius: '99px', 
                                        backgroundColor: '#ffffff', 
                                        border: '1px solid #e2e8f0', 
                                        color: '#64748b', 
                                        cursor: 'pointer', 
                                        boxShadow: '0 1px 2px rgba(15,23,42,0.04)', 
                                        height: '34px', 
                                        boxSizing: 'border-box', 
                                        padding: '0 16px', 
                                        fontSize: '12px', 
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                        e.currentTarget.style.color = '#24204D';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)';
                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.color = '#64748b';
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px) scale(0.97)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.04)';
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                                    }}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                        <path d="M3 3v5h5" />
                                    </svg>
                                    Clear All Filter
                                </button>
                                <button 
                                    onClick={() => typeof window.showLeaveModal === 'function' && window.showLeaveModal()} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px', 
                                        borderRadius: '99px', 
                                        flexShrink: 0, 
                                        backgroundColor: '#635BFF', 
                                        color: '#ffffff', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        boxShadow: '0 4px 12px rgba(99,91,255,0.25)', 
                                        height: '34px', 
                                        boxSizing: 'border-box', 
                                        padding: '0 16px', 
                                        fontSize: '12px', 
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(99,91,255,0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,91,255,0.25)';
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px) scale(0.97)';
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                >
                                    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    เพิ่มการลา
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto" style={{ minHeight: '572px' }}>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 tracking-wider border-b border-slate-100">
                                        <th className="px-4 py-3 whitespace-nowrap">Request Date</th>
                                        <th className="px-4 py-3">Employee</th>
                                        <th className="px-4 py-3">Leave Type</th>
                                        <th className="px-4 py-3">Comp. Day</th>
                                        <th className="px-4 py-3">Leave Period</th>
                                        <th className="px-4 py-3 text-center">Days</th>
                                        <th className="px-4 py-3">Note</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedRequests.length > 0 ? paginatedRequests.map(r => {
                                        const avatarUrl = getEmployeeAvatar(r.name);
                                        return (
                                            <tr key={r.id} className="hover:bg-[#f8fafc] transition-colors">
                                                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{r.requestDate}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {avatarUrl ? (
                                                            <img src={avatarUrl} style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', flexShrink: 0, aspectRatio: '1/1' }} />
                                                         ) : (
                                                             <div style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: getEmployeeNickname(r.name).length > 5 ? '8px' : (getEmployeeNickname(r.name).length > 3 ? '9px' : '11px'), boxShadow: '0 4px 10px rgba(99,102,241,0.18)', flexShrink: 0, aspectRatio: '1/1', padding: '0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                 {getEmployeeNickname(r.name)}
                                                             </div>
                                                         )}
                                                        <div className="flex-col">
                                                            <div className="text-xs font-bold text-gray-800">{r.name}</div>
                                                            <div className="text-[10px] text-indigo-600 font-semibold">{r.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {(() => {
                                                        const badgeStyle = 
                                                            r.type === 'ลาพักร้อน' ? { bg: 'bg-[#e0f2fe]', text: 'text-[#0369a1]', dot: 'bg-[#0ea5e9]' } :
                                                            r.type === 'ลากิจ' ? { bg: 'bg-[#ffedd5]', text: 'text-[#c2410c]', dot: 'bg-[#f97316]' } :
                                                            r.type === 'ลาป่วย' ? { bg: 'bg-[#fee2e2]', text: 'text-[#b91c1c]', dot: 'bg-[#ef4444]' } :
                                                            r.type === 'วันหยุดชดเชย' ? { bg: 'bg-[#e6f4ea]', text: 'text-[#137333]', dot: 'bg-[#10b981]' } :
                                                            { bg: 'bg-[#f3e8ff]', text: 'text-[#6b21a8]', dot: 'bg-[#a855f7]' };
                                                        return (
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${badgeStyle.bg} ${badgeStyle.text} border border-black/[0.02]`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`}></span>
                                                                {r.type}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{r.refDate}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{r.days > 1 ? `${r.start} - ${r.end}` : r.start}</td>
                                                <td className="px-4 py-3 text-xs text-gray-600 font-medium text-center">{r.days}</td>
                                                <td className="px-4 py-3 text-xs text-gray-400 max-w-[150px] truncate" title={r.note}>{r.note}</td>
                                                <td className="px-4 py-3 text-center relative">
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        document.querySelectorAll('[id^="react_actionMenu_leave_"]').forEach(el => {
                                                            if (el.id !== `react_actionMenu_leave_${r.id}`) {
                                                                el.style.display = 'none';
                                                            }
                                                        });
                                                        const menu = document.getElementById(`react_actionMenu_leave_${r.id}`);
                                                        if (menu) {
                                                            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                                                        }
                                                    }} className="text-gray-400 hover:text-[#635BFF] transition-colors p-1 action-menu-trigger">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                                    </button>
                                                    <div id={`react_actionMenu_leave_${r.id}`} style={{ display: 'none', position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 100, minWidth: '100px', padding: '4px' }}>
                                                        <button onClick={() => {
                                                            const menu = document.getElementById(`react_actionMenu_leave_${r.id}`);
                                                            if (menu) menu.style.display = 'none';
                                                            typeof window.editLeaveRequest === 'function' && window.editLeaveRequest(r.id);
                                                        }} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', borderRadius: '6px', display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '6px', fontSize: '12px', padding: '6px 12px', fontWeight: '500' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f4f7fe'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                            <svg className="w-[12px] h-[12px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                            แก้ไข
                                                        </button>
                                                        <button onClick={() => {
                                                            const menu = document.getElementById(`react_actionMenu_leave_${r.id}`);
                                                            if (menu) menu.style.display = 'none';
                                                            typeof window.deleteLeaveRequest === 'function' && window.deleteLeaveRequest(r.id);
                                                        }} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: '6px', display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '6px', fontSize: '12px', padding: '6px 12px', fontWeight: '500' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                            <svg className="w-[12px] h-[12px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            ลบ
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-12 text-center text-gray-400 text-sm">
                                                ไม่มีข้อมูลการลา
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100 bg-slate-50/10 shrink-0">
                                <div className="text-[11px] text-gray-500 font-medium">
                                    Showing {totalFiltered > 0 ? startIndex + 1 : 0} to {Math.min(currentPage * pageSize, totalFiltered)} of {totalFiltered} entries
                                </div>
                                <div className="flex items-center gap-1">
                                    {/* Previous Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                                        disabled={currentPage === 1}
                                        className="h-[26px] px-3 rounded-full border border-slate-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Previous
                                    </button>
                                    
                                    {/* Page Numbers */}
                                    {(() => {
                                        const btns = [];
                                        const maxVisible = 5;
                                        let startPage = Math.max(1, currentPage - 1);
                                        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                                        if (endPage - startPage < maxVisible - 1) {
                                            startPage = Math.max(1, endPage - maxVisible + 1);
                                        }

                                        if (startPage > 1) {
                                            btns.push(
                                                <button
                                                    type="button"
                                                    key={1}
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(1); }}
                                                    className="w-[26px] h-[26px] rounded-full text-[11px] font-medium text-gray-500 hover:text-[#635BFF] transition-all"
                                                >
                                                    1
                                                </button>
                                            );
                                            if (startPage > 2) {
                                                btns.push(<span key="dots-start" className="text-gray-400 text-[10px] px-0.5">...</span>);
                                            }
                                        }

                                        for (let i = startPage; i <= endPage; i++) {
                                            const active = i === currentPage;
                                            btns.push(
                                                <button
                                                    type="button"
                                                    key={i}
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(i); }}
                                                    className={`w-[26px] h-[26px] rounded-full text-[11px] transition-all ${
                                                        active
                                                            ? 'bg-[#635BFF] text-white hover:bg-[#5247f5] font-semibold'
                                                            : 'text-gray-500 hover:text-[#635BFF] font-medium'
                                                    }`}
                                                >
                                                    {i}
                                                </button>
                                            );
                                        }

                                        if (endPage < totalPages) {
                                            if (endPage < totalPages - 1) {
                                                btns.push(<span key="dots-end" className="text-gray-400 text-[10px] px-0.5">...</span>);
                                            }
                                            btns.push(
                                                <button
                                                    type="button"
                                                    key={totalPages}
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(totalPages); }}
                                                    className="w-[26px] h-[26px] rounded-full text-[11px] font-medium text-gray-500 hover:text-[#635BFF] transition-all"
                                                >
                                                    {totalPages}
                                                </button>
                                            );
                                        }

                                        return btns;
                                    })()}

                                    {/* Next Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                                        disabled={currentPage === totalPages}
                                        className="h-[26px] px-3 rounded-full border border-slate-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
