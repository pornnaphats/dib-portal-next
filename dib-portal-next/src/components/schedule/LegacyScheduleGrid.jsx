"use client";

import React, { useMemo } from "react";
import { Users } from "lucide-react";

// Helpers
const dayNamesFull = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getWorkloadColor = (hours) => {
  if (hours < 50)  return '#ef4444';
  if (hours <= 80) return '#f59e0b';
  if (hours <= 100) return '#22c55e';
  if (hours <= 120) return '#166534';
  return '#991b1b';
};

const getWorkloadGlow = (hours) => {
  if (hours < 50)  return 'rgba(239,68,68,0.35)';
  if (hours <= 80) return 'rgba(245,158,11,0.35)';
  if (hours <= 100) return 'rgba(34,197,94,0.35)';
  if (hours <= 120) return 'rgba(22,101,52,0.35)';
  return 'rgba(153,27,27,0.35)';
};

const TEAM_COLORS = {
  'ACE':          { bg: '#3b82f6', light: '#eff6ff', text: '#1d4ed8' },
  'Sertec':       { bg: '#8b5cf6', light: '#f5f3ff', text: '#6d28d9' },
  'ONIX':         { bg: '#ec4899', light: '#fdf2f8', text: '#be185d' },
  'Sale Support': { bg: '#f59e0b', light: '#fffbeb', text: '#b45309' },
  'Call Center':  { bg: '#10b981', light: '#ecfdf5', text: '#047857' },
};

const getTeamStyle = (team) => TEAM_COLORS[team] || { bg: '#635BFF', light: '#eef2ff', text: '#4f46e5' };

const getPosStyle = (pos) => {
  const p = (pos || '').toLowerCase();
  if (p.includes('director') || p.includes('manager')) return { bg: 'rgba(139,92,246,0.1)', text: '#6d28d9' };
  if (p.includes('senior')) return { bg: 'rgba(59,130,246,0.1)', text: '#1d4ed8' };
  if (p.includes('junior')) return { bg: 'rgba(16,185,129,0.1)', text: '#047857' };
  return { bg: '#f1f5f9', text: '#475569' };
};


const formatScheduleName = (fullNameEn) => {
  if (!fullNameEn || fullNameEn === '-') return '';
  const parts = fullNameEn.trim().split(/\s+/);
  if (parts.length < 2) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
};

// ─── MAIN COMPONENT ───
// Helper: get leave requests from window.DATA
const getLeaveRequestsForDate = (dateIso, p) => {
  if (!p) return [];
  const leaves = (window.DATA && window.DATA.leaveRequests) || [];
  const matches = leaves.filter(r => {
    if (!r.startRaw || !r.endRaw) return false;
    if (r.startRaw > dateIso || r.endRaw < dateIso) return false;
    if (r.name) {
      const rName = r.name.trim().toLowerCase();
      
      // Try to match with Full Name (Thai)
      const eName = (p.fullName || p.name || '').trim().toLowerCase();
      if (eName && (rName.includes(eName) || eName.includes(rName))) return true;

      // Try to match first name (Thai)
      const eFirst = eName.split(' ')[0];
      const rFirst = rName.split(' ')[0];
      if (eFirst && rFirst && (eFirst === rFirst || rName.includes(eFirst) || eName.includes(rFirst))) return true;

      // Try to match English Name
      const eNameEn = (p.nameEn || p.name_en || '').trim().toLowerCase();
      if (eNameEn && (rName.includes(eNameEn) || eNameEn.includes(rName))) return true;
      if (eNameEn) {
        const eFirstEn = eNameEn.split(' ')[0];
        if (eFirstEn && rName.includes(eFirstEn)) return true;
      }

      // Try to match Nickname
      const eNick = (p.nickname || '').trim().toLowerCase();
      if (eNick && eNick !== '-' && (rName.includes(eNick) || eNick === rName)) return true;

      return false;
    }
    return true;
  });
  
  if (matches.length > 0 && process.env.NODE_ENV !== 'production') {
    console.log(`[Leave Match Debug] Date: ${dateIso}, Employee: ${p.fullName}, Matches:`, matches);
  }
  return matches;
};
window.getLeaveRequestsForDate = getLeaveRequestsForDate;

export default function LegacyScheduleGrid({ employees, searchQuery, teamFilter, scheduleTasks, startDate, endDate }) {
  const projectColorMap = useMemo(() => {
    const projects = new Set();
    if (typeof window !== "undefined" && window.PREMIUM_SCOPE_DATA) {
      window.PREMIUM_SCOPE_DATA.forEach(group => {
        if (group.account) projects.add(group.account.trim());
      });
    }
    if (scheduleTasks) {
      scheduleTasks.forEach(t => {
        if (t.acc) projects.add(t.acc.trim());
      });
    }
    if (typeof window !== "undefined" && window.SCHEDULE_TASKS) {
      window.SCHEDULE_TASKS.forEach(t => {
        if (t.acc) projects.add(t.acc.trim());
      });
    }
    const sortedProjects = Array.from(projects).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    const map = {};
    const PALETTE = [
      '#2563eb', '#8b5cf6', '#db2777', '#d97706', '#059669', '#0d9488', '#e11d48', '#0891b2',
      '#4f46e5', '#16a34a', '#ea580c', '#c026d3', '#0284c7', '#7c3aed', '#dc2626', '#0f766e',
      '#1d4ed8', '#7e22ce', '#be185d', '#b45309', '#047857', '#0e7490', '#be123c', '#0369a1',
      '#4338ca', '#15803d', '#c2410c', '#a21caf', '#6d28d9', '#b91c1c', '#115e59',
      '#1e40af', '#5b21b6', '#9d174d', '#92400e', '#166534', '#065f46', '#9f1239', '#075985',
      '#3730a3', '#064e3b', '#7f1d1d', '#7c2d12', '#78350f', '#14532d', '#134e5e', '#581c87'
    ];
    sortedProjects.forEach((proj, index) => {
      map[proj.toUpperCase()] = PALETTE[index % PALETTE.length];
    });
    return map;
  }, [scheduleTasks]);

  const colorForAcc = (acc) => {
    if (!acc) return '#635BFF';
    return projectColorMap[acc.trim().toUpperCase()] || '#635BFF';
  };

  const { days, teams, tasksByPersonDay } = useMemo(() => {
    const daysArr = [];
    let curr = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    while (curr <= end && count < 60) {
      daysArr.push({
        day: dayNamesFull[curr.getDay()],
        date: `${curr.getDate()} ${monthNamesShort[curr.getMonth()]}`,
        dateIso: `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`,
        dateObj: new Date(curr),
        dayIdx: curr.getDay()
      });
      curr.setDate(curr.getDate() + 1);
      count++;
    }

    const tasksMap = {};
    (scheduleTasks || []).forEach(t => {
      if (!t.person || !t.date) return;
      const key = `${t.person}_${t.date}`;
      if (!tasksMap[key]) tasksMap[key] = [];
      tasksMap[key].push(t);
    });

    const deptGroups = {};
    (employees || []).forEach(e => {
      const dept = e.team ? e.team.trim() : (e.dept ? e.dept.trim() : '');
      if (!dept || dept === '-' || dept === 'Other') return;
      if (teamFilter && teamFilter !== 'all' && dept !== teamFilter) return;
      const posStr = String(e.position || e.pos || '').trim().toLowerCase();
      if (posStr === 'manager') return;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = e.name && e.name.toLowerCase().includes(q);
        const matchNameEn = e.name_en && e.name_en.toLowerCase().includes(q);
        const matchNickname = e.nickname && e.nickname.toLowerCase().includes(q);
        if (!(matchName || matchNameEn || matchNickname)) return;
      }
      if (!deptGroups[dept]) deptGroups[dept] = [];
      const parseOffDays = (raw) => {
        if (!raw || raw === '-' || raw === '') return [];
        // Handles formats: "เสาร์ - อาทิตย์" (form format), "เสาร์,อาทิตย์", "วันเสาร์,วันอาทิตย์", English names
        const thaiMap = { 'อาทิตย์': 0, 'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัสบดี': 4, 'ศุกร์': 5, 'เสาร์': 6 };
        const enMap = { 'sun': 0, 'sunday': 0, 'mon': 1, 'monday': 1, 'tue': 2, 'tuesday': 2, 'wed': 3, 'wednesday': 3, 'thu': 4, 'thursday': 4, 'fri': 5, 'friday': 5, 'sat': 6, 'saturday': 6 };
        // Normalize: replace " - " (space-dash-space) with comma, then split
        const normalized = raw.replace(/\s*-\s*/g, ',');
        return normalized.split(/[,|]/).map(d => {
          const t = d.trim().replace(/^วัน/, '');
          if (!t) return undefined;
          if (thaiMap[t] !== undefined) return thaiMap[t];
          const lower = t.toLowerCase();
          if (enMap[lower] !== undefined) return enMap[lower];
          return undefined;
        }).filter(v => v !== undefined);
      };
      const offDayRawDebug = e.dayoff || e.offdays || '';
      const offDays = parseOffDays(offDayRawDebug);
      deptGroups[dept].push({
        id: e.id,
        name: formatScheduleName(e.name_en || e.nameEn) || e.name,
        fullName: e.name,
        nameEn: e.name_en || e.nameEn,
        nickname: e.nickname,
        pos: e.position || e.pos,
        shift: e.shift,
        offdays: e.dayoff || e.offdays,
        offDays: offDays,
        rank: e.rank || 999
      });
    });

    const teamsOrder = ['ACE', 'Sertec', 'ONIX', 'Sale Support', 'Call Center'];
    const teamsArr = Object.keys(deptGroups)
      .sort((a, b) => {
        const idxA = teamsOrder.indexOf(a), idxB = teamsOrder.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      })
      .map(dept => ({ name: dept, members: deptGroups[dept] }));

    return { days: daysArr, teams: teamsArr, tasksByPersonDay: tasksMap };
  }, [employees, searchQuery, teamFilter, scheduleTasks, startDate, endDate]);

  const todayStr = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  })();

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <style>{`
        /* Narrower custom scrollbars for task cells */
        .cell-task-list::-webkit-scrollbar {
          width: 2px !important;
        }
        .cell-task-list::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .cell-task-list::-webkit-scrollbar-thumb {
          background: rgba(99, 91, 255, 0.15) !important;
          border-radius: 4px !important;
        }
        .cell-task-list::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 91, 255, 0.3) !important;
        }
        .cell-task-list {
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 91, 255, 0.15) transparent;
        }

        /* Main schedule scrollbar wrapper styling */
        .schedule-scroll-wrapper::-webkit-scrollbar {
          width: 6px !important;
          height: 6px !important;
        }
        .schedule-scroll-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9 !important;
        }
        .schedule-scroll-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 99px !important;
        }
        .schedule-scroll-wrapper::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
        }
      `}</style>
      <div className="schedule-scroll-wrapper" style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, minHeight: 0, width: '100%' }}>
        <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          {/* ── HEADER ── */}
          <thead>
            <tr>
              {/* Employee col header */}
              <th style={{
                width: '260px', minWidth: '260px',
                padding: '16px 20px',
                textAlign: 'left',
                fontSize: '0.75rem', fontWeight: 700, color: '#24204D',
                background: '#ffffff',
                position: 'sticky', left: 0, top: 0, zIndex: 21,
                borderRight: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '2px 0 8px rgba(0,0,0,0.04), 0 4px 0 rgba(99,91,255,0.06), inset 0 -2px 0 rgba(99,91,255,0.12)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={14} style={{ color: '#635BFF' }} />
                  Employee
                </div>
              </th>

              {/* Day col headers */}
              {days.map((d, i) => {
                const isWeekend = d.dayIdx === 0 || d.dayIdx === 6;
                const isToday = d.dateIso === todayStr;

                return (
                  <th key={i} style={{
                    padding: '14px 10px',
                    textAlign: 'center',
                    width: '150px', minWidth: '150px',
                    position: 'sticky', top: 0, zIndex: 10,
                    background: isToday ? '#faf8ff' : isWeekend ? '#f8fafc' : '#ffffff',
                    borderRight: '1px solid rgba(0,0,0,0.04)',
                    boxShadow: isToday 
                      ? '0 4px 0 rgba(0,0,0,0.02), inset 0 -2px 0 #635BFF' 
                      : '0 4px 0 rgba(0,0,0,0.02), inset 0 -1px 0 rgba(0,0,0,0.05)',
                    verticalAlign: 'middle',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: isToday ? '#635BFF' : isWeekend ? '#94a3b8' : '#94a3b8',
                      }}>{d.day}</span>
                      {isToday ? (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: 'linear-gradient(135deg, #635BFF, #818cf8)',
                          color: '#ffffff',
                          padding: '3px 12px', borderRadius: '99px',
                          fontSize: '0.78rem', fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(99,91,255,0.35)',
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                          {d.date}
                        </div>
                      ) : (
                        <span style={{
                          fontSize: '0.82rem', fontWeight: 700,
                          color: isWeekend ? '#475569' : '#1e293b',
                        }}>{d.date}</span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── BODY ── */}
          <tbody>
            {teams.map((team, tIdx) => {
              const ts = getTeamStyle(team.name);
              return (
                <React.Fragment key={tIdx}>
                  {/* Team header row */}
                  <tr>
                    <td style={{
                      padding: '10px 20px',
                      background: ts.light,
                      position: 'sticky', left: 0, zIndex: 15,
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      borderRight: '1px solid rgba(0,0,0,0.04)',
                      boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
                      whiteSpace: 'nowrap',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '5px', height: '20px', borderRadius: '99px', background: ts.bg, boxShadow: `0 2px 8px ${ts.bg}55` }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ts.text, letterSpacing: '0.02em' }}>{team.name}</span>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 600, color: ts.bg,
                          background: `${ts.bg}18`,
                          padding: '2px 8px', borderRadius: '99px',
                        }}>{team.members.length} คน</span>
                      </div>
                    </td>
                    <td colSpan={days.length} style={{ background: ts.light, borderBottom: '1px solid rgba(0,0,0,0.05)' }} />
                  </tr>

                  {/* Member rows */}
                  {team.members.map((p, pIdx) => {
                    const posStyle = getPosStyle(p.pos);
                    const line1 = p.fullName;
                    const avatarText = p.nickname && p.nickname !== '-' ? p.nickname : p.fullName.trim().split(/\s+/)[0];
                    const avatarFontSize = avatarText.length > 5 ? '0.52rem' : avatarText.length === 5 ? '0.62rem' : avatarText.length === 4 ? '0.72rem' : '0.82rem';

                    return (
                      <tr key={pIdx} style={{ transition: 'background 0.15s' }}
                        onMouseOver={e => { [...e.currentTarget.cells].forEach(c => { c.style.background = c.dataset.hoverbg || '#faf8ff'; }); }}
                        onMouseOut={e => { [...e.currentTarget.cells].forEach(c => { c.style.background = c.dataset.basebg || '#ffffff'; }); }}
                      >
                        {/* Employee cell */}
                        <td
                          data-basebg="#ffffff"
                          data-hoverbg="#faf8ff"
                          style={{
                          padding: '10px 14px',
                          background: '#ffffff',
                          position: 'sticky', left: 0, zIndex: 11,
                          borderBottom: '1px solid rgba(0,0,0,0.04)',
                          borderRight: '1px solid rgba(0,0,0,0.04)',
                          boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Avatar */}
                            <div style={{
                              width: '48px', height: '48px', borderRadius: '50%',
                              background: `linear-gradient(135deg, ${ts.bg}ee, ${ts.bg}aa)`,
                              color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: avatarFontSize,
                              boxShadow: `0 4px 12px ${ts.bg}44`,
                              flexShrink: 0, textAlign: 'center',
                              overflow: 'hidden', whiteSpace: 'nowrap',
                            }}>
                              {avatarText}
                            </div>
                            {/* Info */}
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '3px' }}>{line1}</div>
                              <div style={{
                                display: 'inline-block', padding: '2px 10px', borderRadius: '99px',
                                background: posStyle.bg, color: posStyle.text,
                                fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                                marginBottom: '3px',
                              }}>{p.pos || 'Employee'}</div>
                              {(p.shift && p.shift !== '-') && (
                                <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                  <span>{p.shift}</span>
                                </div>
                              )}
                              {(p.offdays && p.offdays !== '-') && (
                                <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                  <span>{p.offdays}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

        {/* Day cells */}
                        {days.map((d, dIdx) => {
                          const isWeekend = d.dayIdx === 0 || d.dayIdx === 6;
                          const isOff = p.offDays.includes(d.dayIdx);
                          const isToday = d.dateIso === todayStr;
                          const dayTasks = tasksByPersonDay[`${p.id}_${d.dateIso}`] || [];
                          const baseBg = isOff ? '#f8fafc' : '#ffffff';
                          const totalHours = dayTasks.reduce((sum, t) => sum + (Number(t.hours) || 0), 0);
                          const wlColor = getWorkloadColor(totalHours);
                          const wlGlow = getWorkloadGlow(totalHours);
                          // Check leave requests for this person on this date
                          const approvedLeaves = getLeaveRequestsForDate(d.dateIso, p);

                          return (
                            <td
                              key={dIdx}
                              data-basebg={baseBg}
                              data-hoverbg="#faf8ff"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                if (typeof window.handleTaskDrop === 'function') {
                                  window.handleTaskDrop(e, p.id, d.dateIso);
                                }
                              }}
                              style={{
                                padding: 0,
                                background: baseBg,
                                borderBottom: '1px solid rgba(0,0,0,0.04)',
                                borderRight: '1px solid rgba(0,0,0,0.04)',
                                borderLeft: 'none',
                                verticalAlign: 'top',
                                height: '160px',
                                maxWidth: '150px',
                                transition: 'background 0.15s',
                              }}
                            >
                              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '6px', position: 'relative', overflow: 'hidden' }}>
                                {approvedLeaves.length > 0 ? (
                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    {approvedLeaves.map((lv, lvIdx) => {
                                      const leaveTypeMap = {
                                        'ลาพักร้อน': { label: 'Vacation Leave', color: '#0ea5e9' },
                                        'ลากิจ': { label: 'Business Leave', color: '#f97316' },
                                        'ลาป่วย': { label: 'Sick Leave', color: '#ef4444' },
                                        'วันหยุดชดเชย': { label: 'Compensatory', color: '#10b981' },
                                        'ลาคลอด / ลาเลี้ยงดูบุตร': { label: 'Maternity Leave', color: '#8b5cf6' },
                                        'ลาเพื่อการฌาปนกิจศพ': { label: 'Compassionate', color: '#64748b' },
                                        'อบรม / สัมมนา': { label: 'Training', color: '#14b8a6' },
                                      };
                                      const lvInfo = leaveTypeMap[lv.type] || { label: lv.type || 'On Leave', color: '#635BFF' };
                                      return (
                                        <div key={lvIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: lvInfo.color, letterSpacing: '0.06em' }}>ON LEAVE</div>
                                          <div style={{ fontSize: '0.52rem', color: '#fff', fontWeight: 700, background: lvInfo.color, padding: '2px 8px', borderRadius: '99px', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px', textAlign: 'center' }}>{lvInfo.label}</div>
                                        </div>
                                      );
                                    })}
                                    {dayTasks.length > 0 && (
                                      <div style={{ fontSize: '0.5rem', color: '#94a3b8', marginTop: '2px' }}>{dayTasks.length} task(s) scheduled</div>
                                    )}
                                  </div>
                                ) : dayTasks.length > 0 ? (
                                  <>
                                    <div className="cell-task-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '115px', marginBottom: '24px', paddingRight: '2px' }}>
                                      {dayTasks.map((t, taskIdx) => {
                                        const nodeCol = colorForAcc(t.acc);
                                        return (
                                          <div
                                            key={taskIdx}
                                            draggable="true"
                                            onDragStart={(e) => {
                                              if (typeof window.handleTaskDragStart === 'function') {
                                                window.handleTaskDragStart(e, 'scheduled-' + t.id);
                                              }
                                            }}
                                            onDragEnd={(e) => {
                                              if (typeof window.handleTaskDragEnd === 'function') {
                                                window.handleTaskDragEnd(e);
                                              }
                                            }}
                                            style={{
                                              padding: '5px 8px',
                                              borderRadius: '8px',
                                              background: '#ffffff',
                                              border: '1px solid rgba(0,0,0,0.05)',
                                              borderLeft: `3px solid ${nodeCol}`,
                                              fontSize: '0.62rem',
                                              cursor: 'grab',
                                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                              transition: 'all 0.15s'
                                            }}
                                          >
                                            <div style={{ fontWeight: 700, color: nodeCol, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px', marginBottom: '2px' }}>{t.title}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', gap: '4px' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.52rem', color: nodeCol, fontWeight: 700, background: `${nodeCol}12`, padding: '1px 6px', borderRadius: '99px', whiteSpace: 'nowrap' }}>{t.acc || ''}</span>
                                                {t.node && (
                                                  <span style={{ fontSize: '0.52rem', color: '#64748b', fontWeight: 500, background: '#f1f5f9', padding: '1px 6px', borderRadius: '99px', whiteSpace: 'nowrap' }}>{t.node}</span>
                                                )}
                                              </div>
                                              <span style={{ fontSize: '0.58rem', fontWeight: 700, color: nodeCol, flexShrink: 0 }}>{t.hours || 0}%</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {/* Footer bar */}
                                    <div style={{ position: 'absolute', bottom: '4px', right: '6px', left: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div
                                        onClick={() => {
                                          if (typeof window.showDayDetailModal === 'function') {
                                            window.showDayDetailModal(p.id, d.dateIso);
                                          }
                                        }}
                                        style={{ cursor: 'pointer', fontSize: '0.55rem', color: '#635BFF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}
                                        onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                                        onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                                      >
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                        <span>View More ({dayTasks.length})</span>
                                      </div>
                                      <div
                                        onClick={() => {
                                          if (typeof window.showDayDetailModal === 'function') {
                                            window.showDayDetailModal(p.id, d.dateIso);
                                          }
                                        }}
                                        style={{
                                          background: wlColor,
                                          color: '#fff',
                                          fontSize: '0.55rem', fontWeight: 800,
                                          padding: '2px 8px', borderRadius: '99px',
                                          boxShadow: `0 2px 8px ${wlGlow}`,
                                          cursor: 'pointer',
                                          transition: 'transform 0.2s',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                      >
                                        {totalHours}%
                                      </div>
                                    </div>
                                  </>
                                ) : isOff ? (
                                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em' }}>DAY OFF</div>
                                  </div>
                                ) : (
                                  <div style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '0.55rem', color: '#cbd5e1', fontWeight: 600, fontStyle: 'italic' }}>
                                    No task
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
