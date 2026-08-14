"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { useAuth } from "../providers/AuthProvider";
import { useData } from "../providers/DataProvider";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Layers,
  RotateCcw,
  User,
  TrendingUp,
} from "lucide-react";

const TEAM_COLORS = {
  ACE: { bg: "#3b82f6", light: "#eff6ff", text: "#1d4ed8" },
  Sertec: { bg: "#8b5cf6", light: "#f5f3ff", text: "#6d28d9" },
  ONIX: { bg: "#ec4899", light: "#fdf2f8", text: "#be185d" },
  "Sale Support": { bg: "#f59e0b", light: "#fffbeb", text: "#b45309" },
  "Call Center": { bg: "#10b981", light: "#ecfdf5", text: "#047857" },
};

const PROJECT_PALETTE = [
  "#2563eb", "#8b5cf6", "#db2777", "#d97706", "#059669",
  "#0d9488", "#e11d48", "#0891b2", "#4f46e5", "#16a34a",
  "#ea580c", "#c026d3", "#0284c7", "#7c3aed", "#dc2626",
];

const monthsTH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const monthsEN = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];
const dayNamesTH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const dayNamesShort = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const getWorkloadColor = (pct) => {
  if (pct === 0) return "#cbd5e1";
  if (pct < 50) return "#ef4444";
  if (pct <= 80) return "#f59e0b";
  if (pct <= 100) return "#22c55e";
  if (pct <= 120) return "#166534";
  return "#991b1b";
};

const getWorkloadLabel = (pct) => {
  if (pct === 0) return "ยังไม่มีงาน";
  if (pct < 50) return "งานน้อย";
  if (pct <= 80) return "งานปานกลาง";
  if (pct <= 100) return "งานพอดี";
  if (pct <= 120) return "งานหนัก";
  return "งานหนักมาก";
};

function toIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatThaiDate(d) {
  return `${dayNamesTH[d.getDay()]} ${d.getDate()} ${monthsTH[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function getWeekStart(d) {
  const dt = new Date(d);
  const day = dt.getDay();
  // Start week on Saturday
  const diff = day === 6 ? 0 : -(day + 1);
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export default function MyPlanView() {
  const { user } = useAuth();
  const { employees } = useData();

  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  // Date range: default current week (Sat-Fri)
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [weekEnd, setWeekEnd] = useState(() => {
    const d = getWeekStart(new Date());
    d.setDate(d.getDate() + 6);
    return d;
  });

  const dateInputRef = useRef(null);
  const fpInstance = useRef(null);

  useEffect(() => {
    if (dateInputRef.current) {
      fpInstance.current = flatpickr(dateInputRef.current, {
        mode: "range",
        dateFormat: "Y-m-d",
        showMonths: 1,
        onClose: (selectedDates) => {
          if (selectedDates.length === 2) {
            setWeekStart(selectedDates[0]);
            setWeekEnd(selectedDates[1]);
          } else if (selectedDates.length === 1) {
            const s = selectedDates[0];
            const e = new Date(s);
            e.setDate(e.getDate() + 6);
            setWeekStart(s);
            setWeekEnd(e);
          }
        }
      });
    }
    return () => {
      if (fpInstance.current) {
        fpInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (fpInstance.current) {
      fpInstance.current.setDate([weekStart, weekEnd], false);
    }
  }, [weekStart]);

  // Find the matched employee
  const userName = user?.name || "";
  const userEmail = user?.email || "";
  const matchedEmp = useMemo(() => {
    if (!employees?.length) return null;
    return employees.find((e) => {
      if (userEmail && e.email?.toLowerCase().trim() === userEmail.toLowerCase().trim()) return true;
      if (userName && e.name?.toLowerCase().trim() === userName.toLowerCase().trim()) return true;
      if (userName && e.nameEn?.toLowerCase().trim() === userName.toLowerCase().trim()) return true;
      return false;
    });
  }, [employees, userName, userEmail]);

  const teamStyle = useMemo(() => {
    const dept = matchedEmp?.dept || matchedEmp?.team || "";
    return TEAM_COLORS[dept] || { bg: "#635BFF", light: "#eef2ff", text: "#4f46e5" };
  }, [matchedEmp]);

  // Build project color map
  const projectColorMap = useMemo(() => {
    const projects = new Set(tasks.map((t) => t.acc?.trim()).filter(Boolean));
    const sorted = Array.from(projects).sort((a, b) => a.localeCompare(b));
    const map = {};
    sorted.forEach((p, i) => { map[p.toUpperCase()] = PROJECT_PALETTE[i % PROJECT_PALETTE.length]; });
    return map;
  }, [tasks]);

  const colorForAcc = (acc) => {
    if (!acc) return "#635BFF";
    return projectColorMap[acc.trim().toUpperCase()] || "#635BFF";
  };

  // Load data via legacyDataFetcher (same as Schedule page) then read from window globals
  useEffect(() => {
    if (!matchedEmp) return;

    const load = async () => {
      setLoading(true);
      try {
      // Initialize window.DATA same as ScheduleView does
        if (typeof window !== "undefined") {
          window.DATA = window.DATA || {};
        }
        // Trigger the same legacy data fetch that Schedule page uses
        const mod = await import("../legacy-pages/legacyDataFetcher.js");
        if (mod?.fetchAndSetLegacyData) {
          await mod.fetchAndSetLegacyData();
        }
      } catch (err) {
        console.warn("legacyDataFetcher error:", err);
      }

      // Read from window.SCHEDULE_TASKS (populated by legacyDataFetcher)
      const allTasks = window.SCHEDULE_TASKS || [];
      const myId = String(matchedEmp.id);
      const myTasks = allTasks.filter((t) => String(t.person) === myId);
      setTasks(
        myTasks.map((t) => ({
          id: t.id,
          date: t.date,
          acc: t.acc || "",
          node: t.node || "Other",
          title: t.title || "",
          hours: parseInt(t.hours) || 0,
          note: t.note || "",
        }))
      );

      // Read leave requests from window.DATA (also populated by legacyDataFetcher)
      const allLeaves = (window.DATA && window.DATA.leaveRequests) || [];
      const myLeaves = allLeaves.filter((r) => {
        const status = (r.status || "").toLowerCase();
        if (status === "rejected" || status === "ไม่อนุมัติ") return false;
        const rName = (r.name || "").toLowerCase().trim();
        const eName = (matchedEmp.name || "").toLowerCase().trim();
        const eNameEn = (matchedEmp.nameEn || "").toLowerCase().trim();
        const eNick = (matchedEmp.nickname || "").toLowerCase().trim();
        if (eName && (rName.includes(eName) || eName.includes(rName))) return true;
        if (eNameEn && (rName.includes(eNameEn) || eNameEn.includes(rName))) return true;
        if (eNick && eNick !== "-" && rName.includes(eNick)) return true;
        return false;
      });
      setLeaves(
        myLeaves.map((r) => ({
          ...r,
          start_date: r.startRaw || r.fromDate,
          end_date: r.endRaw || r.toDate,
        }))
      );

      setLoading(false);
    };

    load();
  }, [matchedEmp]);

  // Build days array for current week
  const days = useMemo(() => {
    const daysArr = [];
    let curr = new Date(weekStart);
    const end = new Date(weekEnd);
    let count = 0;
    while (curr <= end && count < 60) {
      daysArr.push({
        day: dayNamesShort[curr.getDay()],
        dayTH: dayNamesTH[curr.getDay()],
        date: curr.getDate(),
        month: monthsTH[curr.getMonth()],
        monthEN: monthsEN[curr.getMonth()],
        dateIso: toIso(curr),
        dateObj: new Date(curr),
        dayIdx: curr.getDay(),
        isToday: toIso(curr) === toIso(new Date()),
        isWeekend: curr.getDay() === 0 || curr.getDay() === 6,
      });
      curr.setDate(curr.getDate() + 1);
      count++;
    }
    return daysArr;
  }, [weekStart, weekEnd]);

  // Index tasks by date
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.date) return;
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [tasks]);

  // Index leaves by date range
  const leavesByDate = useMemo(() => {
    const map = {};
    leaves.forEach((lv) => {
      if (!lv.start_date && !lv.startRaw) return;
      const start = new Date(lv.start_date || lv.startRaw);
      const end = new Date(lv.end_date || lv.endRaw || lv.start_date || lv.startRaw);
      let curr = new Date(start);
      while (curr <= end) {
        const iso = toIso(curr);
        if (!map[iso]) map[iso] = [];
        map[iso].push(lv);
        curr.setDate(curr.getDate() + 1);
      }
    });
    return map;
  }, [leaves]);

  // Week navigation
  const handlePrev = () => {
    const diff = Math.round((weekEnd - weekStart) / (1000 * 60 * 60 * 24)) + 1;
    const s = new Date(weekStart);
    s.setDate(s.getDate() - diff);
    const e = new Date(weekEnd);
    e.setDate(e.getDate() - diff);
    setWeekStart(s);
    setWeekEnd(e);
    setSelectedDay(null);
  };

  const handleNext = () => {
    const diff = Math.round((weekEnd - weekStart) / (1000 * 60 * 60 * 24)) + 1;
    const s = new Date(weekStart);
    s.setDate(s.getDate() + diff);
    const e = new Date(weekEnd);
    e.setDate(e.getDate() + diff);
    setWeekStart(s);
    setWeekEnd(e);
    setSelectedDay(null);
  };

  const handleToday = () => {
    const s = getWeekStart(new Date());
    const e = new Date(s);
    e.setDate(e.getDate() + 6);
    setWeekStart(s);
    setWeekEnd(e);
    setSelectedDay(null);
  };

  // Summary stats for the week
  const weekStats = useMemo(() => {
    let totalTasks = 0;
    let totalWorkload = 0;
    let activeDays = 0;
    let maxDay = { tasks: 0, date: "" };

    days.forEach((d) => {
      const dayTasks = tasksByDate[d.dateIso] || [];
      if (dayTasks.length > 0) {
        activeDays++;
        totalTasks += dayTasks.length;
        const wl = dayTasks.reduce((s, t) => s + t.hours, 0);
        totalWorkload += wl;
        if (dayTasks.length > maxDay.tasks) {
          maxDay = { tasks: dayTasks.length, date: d.dateIso };
        }
      }
    });

    return {
      totalTasks,
      avgWorkload: activeDays > 0 ? Math.round(totalWorkload / activeDays) : 0,
      activeDays,
      maxDay,
    };
  }, [days, tasksByDate]);

  const selectedDayData = selectedDay
    ? days.find((d) => d.dateIso === selectedDay)
    : null;
  const selectedDayTasks = selectedDay ? tasksByDate[selectedDay] || [] : [];
  const selectedDayLeaves = selectedDay ? leavesByDate[selectedDay] || [] : [];

  // Format Thai date range for header
  const formatWeekRange = () => {
    const s = weekStart;
    const e = weekEnd;
    if (s.getFullYear() === e.getFullYear()) {
      if (s.getMonth() === e.getMonth()) {
        return `${s.getDate()} – ${e.getDate()} ${monthsTH[s.getMonth()]} ${s.getFullYear() + 543}`;
      }
      return `${s.getDate()} ${monthsTH[s.getMonth()]} – ${e.getDate()} ${monthsTH[e.getMonth()]} ${s.getFullYear() + 543}`;
    }
    return `${s.getDate()} ${monthsTH[s.getMonth()]} ${s.getFullYear() + 543} – ${e.getDate()} ${monthsTH[e.getMonth()]} ${e.getFullYear() + 543}`;
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "ME";

  if (!matchedEmp && !loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", flexDirection: "column", gap: "16px" }}>
        <User size={48} style={{ color: "#cbd5e1" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#475569" }}>ไม่พบข้อมูลพนักงาน</div>
          <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "6px" }}>ไม่พบบัญชีของคุณในระบบ กรุณาติดต่อผู้ดูแลระบบ</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ── Header Profile + Week Selector ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "16px",
      }}>
        {/* Left: Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {user?.picture ? (
            <img src={user.picture} alt={userName} referrerPolicy="no-referrer"
              style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover",
                boxShadow: `0 4px 16px ${teamStyle.bg}44` }} />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: `linear-gradient(135deg, ${teamStyle.bg}, ${teamStyle.bg}aa)`,
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "1.1rem",
              boxShadow: `0 4px 16px ${teamStyle.bg}44`,
            }}>
              {initials}
            </div>
          )}
          <div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1e293b" }}>{userName}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
              {matchedEmp && (
                <>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700, color: teamStyle.text,
                    background: teamStyle.light, padding: "2px 10px", borderRadius: "99px",
                    border: `1px solid ${teamStyle.bg}22`,
                  }}>{matchedEmp.dept || matchedEmp.team}</span>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 600, color: "#475569",
                    background: "#f1f5f9", padding: "2px 10px", borderRadius: "99px",
                  }}>{matchedEmp.pos || matchedEmp.position}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Week Navigator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={handleToday} style={{
            height: 34, padding: "0 14px", borderRadius: 99, border: "1px solid #e2e8f0",
            background: "#fff", color: "#475569", fontSize: "0.75rem", fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#635bff"; e.currentTarget.style.color = "#635bff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
          >
            <RotateCcw size={12} /> This Week
          </button>
          <div style={{
            display: "flex", alignItems: "center",
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 99, overflow: "hidden", height: 34,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <button onClick={handlePrev} style={{
              width: 34, height: 34, border: "none", background: "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#94a3b8", borderRight: "1px solid #e2e8f0", transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <ChevronLeft size={14} />
            </button>
            <div 
              onClick={() => fpInstance.current && fpInstance.current.open()}
              style={{
                padding: "0 14px", fontSize: "0.78rem", fontWeight: 600, color: "#1e293b",
                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                cursor: "pointer", userSelect: "none", transition: "background 0.15s",
                position: "relative", height: "100%"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Calendar size={13} color="#635bff" />
              {formatWeekRange()}
              <input 
                ref={dateInputRef} 
                type="text" 
                style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }} 
                readOnly 
              />
            </div>
            <button onClick={handleNext} style={{
              width: 34, height: 34, border: "none", background: "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#94a3b8", borderLeft: "1px solid #e2e8f0", transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
         {[
           {
             icon: <Briefcase size={18} color="#fff" />,
             bg: "#635bff",
             shadow: "rgba(99, 91, 255, 0.3)",
             label: "งานสัปดาห์นี้",
             value: weekStats.totalTasks,
             unit: "งาน",
           },
           {
             icon: <CheckCircle size={18} color="#fff" />,
             bg: "#10b981",
             shadow: "rgba(16, 185, 129, 0.3)",
             label: "วันที่มีงาน",
             value: weekStats.activeDays,
             unit: "วัน",
           },
         ].map((s, i) => (
           <div key={i} style={{
             background: "#fff", borderRadius: 14, padding: "16px 18px",
             border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
             display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s",
           }}
             onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
             onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
           >
             <div style={{
               width: 40, height: 40, borderRadius: "50%",
               background: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
               boxShadow: `0 4px 12px ${s.shadow}`, flexShrink: 0
             }}>
               {s.icon}
             </div>
             <div>
               <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>{s.label}</div>
               <div style={{ fontSize: s.isText ? "0.82rem" : "1.4rem", fontWeight: 800, color: "#1e293b", lineHeight: 1.1, marginTop: 2 }}>
                 {s.isText ? s.value : `${s.value} ${s.unit}`}
               </div>
             </div>
           </div>
         ))}
      </div>

      {/* ── Week Day Cards ── */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12 }}>
          <div style={{ width: 20, height: 20, border: "3px solid #e2e8f0", borderTopColor: "#635bff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>กำลังโหลดข้อมูล...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
          {days.map((d) => {
            const dayTasks = tasksByDate[d.dateIso] || [];
            const dayLeaves = leavesByDate[d.dateIso] || [];
            const totalWl = dayTasks.reduce((s, t) => s + t.hours, 0);
            const wlColor = getWorkloadColor(totalWl);
            const isSelected = selectedDay === d.dateIso;
            const isOff = matchedEmp
              ? (() => {
                  const offDayMap = { อาทิตย์: 0, จันทร์: 1, อังคาร: 2, พุธ: 3, พฤหัสบดี: 4, ศุกร์: 5, เสาร์: 6 };
                  const offStr = matchedEmp.offdays || matchedEmp.dayoff || "";
                  const offDays = offStr.replace(/\s*-\s*/g, ",").split(/[,|]/)
                    .map((x) => offDayMap[x.trim().replace(/^วัน/, "")])
                    .filter((v) => v !== undefined);
                  return offDays.includes(d.dayIdx);
                })()
              : false;

            return (
              <div
                key={d.dateIso}
                onClick={() => setSelectedDay(isSelected ? null : d.dateIso)}
                style={{
                  borderRadius: 14,
                  border: isSelected
                    ? `2px solid ${teamStyle.bg}`
                    : d.isToday
                      ? "2px solid #635bff"
                      : "1px solid #e2e8f0",
                  background: isSelected
                    ? teamStyle.light
                    : d.isToday
                      ? "#faf8ff"
                      : isOff
                        ? "#f8fafc"
                        : "#fff",
                  padding: "12px 10px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  boxShadow: isSelected
                    ? `0 4px 20px ${teamStyle.bg}22`
                    : d.isToday
                      ? "0 4px 16px rgba(99,91,255,0.12)"
                      : "0 2px 6px rgba(0,0,0,0.03)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = d.isToday
                      ? "0 4px 16px rgba(99,91,255,0.12)"
                      : "0 2px 6px rgba(0,0,0,0.03)";
                  }
                }}
              >
                {/* Day header */}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: d.isToday ? "#635bff" : d.isWeekend ? "#94a3b8" : "#94a3b8",
                  }}>{d.day}</div>
                  {d.isToday ? (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: "linear-gradient(135deg, #635BFF, #818cf8)",
                      color: "#fff", padding: "2px 10px", borderRadius: 99,
                      fontSize: "0.78rem", fontWeight: 800, marginTop: 3,
                      boxShadow: "0 4px 10px rgba(99,91,255,0.3)",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.7)", display: "inline-block" }} />
                      {d.date}
                    </div>
                  ) : (
                    <div style={{
                      fontSize: "1rem", fontWeight: 800, color: d.isWeekend ? "#64748b" : "#1e293b", marginTop: 3,
                    }}>{d.date}</div>
                  )}
                  <div style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: 1 }}>{d.monthEN}</div>
                </div>

                {/* Workload bar hidden */}

                {/* Day content */}
                {dayLeaves.length > 0 && dayTasks.length === 0 ? (
                  (() => {
                    const leaveTypeMap = {
                      'ลาพักร้อน': { label: 'Vacation Leave', color: '#0ea5e9' },
                      'ลากิจ': { label: 'Business Leave', color: '#f97316' },
                      'ลาป่วย': { label: 'Sick Leave', color: '#ef4444' },
                      'วันหยุดชดเชย': { label: 'Compensatory', color: '#10b981' },
                      'ลาคลอด / ลาเลี้ยงดูบุตร': { label: 'Maternity Leave', color: '#8b5cf6' },
                      'ลาเพื่อการฌาปนกิจศพ': { label: 'Compassionate', color: '#64748b' },
                      'อบรม / สัมมนา': { label: 'Training', color: '#14b8a6' },
                    };
                    const lvInfo = leaveTypeMap[dayLeaves[0].type] || { label: dayLeaves[0].type || 'On Leave', color: '#635BFF' };
                    return (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                        <div style={{ fontSize: "0.62rem", fontWeight: 800, color: lvInfo.color }}>ON LEAVE</div>
                        <div style={{
                          fontSize: "0.52rem", color: "#fff", fontWeight: 700,
                          background: lvInfo.color, padding: "2px 8px", borderRadius: 99,
                          whiteSpace: "nowrap",
                        }}>{lvInfo.label}</div>
                      </div>
                    );
                  })()
                ) : isOff ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em" }}>DAY OFF</span>
                  </div>
                ) : (dayTasks.length > 0 || dayLeaves.length > 0) ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, overflow: "hidden" }}>
                    {dayLeaves.length > 0 && (() => {
                      const leaveTypeMap = {
                        'ลาพักร้อน': { label: 'Vacation', color: '#0ea5e9' },
                        'ลากิจ': { label: 'Business', color: '#f97316' },
                        'ลาป่วย': { label: 'Sick', color: '#ef4444' },
                        'วันหยุดชดเชย': { label: 'Comp.', color: '#10b981' },
                        'ลาคลอด / ลาเลี้ยงดูบุตร': { label: 'Maternity', color: '#8b5cf6' },
                        'ลาเพื่อการฌาปนกิจศพ': { label: 'Compassionate', color: '#64748b' },
                        'อบรม / สัมมนา': { label: 'Training', color: '#14b8a6' },
                      };
                      const lvInfo = leaveTypeMap[dayLeaves[0].type] || { label: dayLeaves[0].type || 'Leave', color: '#635BFF' };
                      return (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", marginBottom: "4px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "4px", width: "100%" }}>
                          <div style={{ fontSize: "0.55rem", fontWeight: 800, color: lvInfo.color }}>ON LEAVE</div>
                          <div style={{
                            fontSize: "0.48rem", color: "#fff", fontWeight: 700,
                            background: lvInfo.color, padding: "1px 6px", borderRadius: 99,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "80px", textAlign: "center"
                          }} title={dayLeaves[0].type}>{lvInfo.label}</div>
                        </div>
                      );
                    })()}
                    {dayTasks.length > 0 ? (
                      <>
                        {dayTasks.slice(0, dayLeaves.length > 0 ? 2 : 3).map((t, i) => (
                          <div key={i} style={{
                            fontSize: "0.6rem", fontWeight: 600, color: colorForAcc(t.acc),
                            background: `${colorForAcc(t.acc)}12`,
                            borderLeft: `2px solid ${colorForAcc(t.acc)}`,
                            padding: "2px 5px", borderRadius: "0 4px 4px 0",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>{t.title}</div>
                        ))}
                        {dayTasks.length > (dayLeaves.length > 0 ? 2 : 3) && (
                          <div style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 600, textAlign: "right" }}>
                            +{dayTasks.length - (dayLeaves.length > 0 ? 2 : 3)} อีก
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "0.55rem", color: "#e2e8f0", fontWeight: 600, fontStyle: "italic" }}>No task</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "0.55rem", color: "#e2e8f0", fontWeight: 600, fontStyle: "italic" }}>No Task</span>
                  </div>
                )}

                {/* Task count badge */}
                {dayTasks.length > 0 && (
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    width: 18, height: 18, borderRadius: "50%",
                    background: teamStyle.bg, color: "#fff",
                    fontSize: "0.55rem", fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{dayTasks.length}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Day Detail Panel ── */}
      {selectedDayData && (
        <div style={{
          background: "#fff", borderRadius: 16, border: `1px solid ${teamStyle.bg}22`,
          padding: "20px 24px", boxShadow: `0 8px 32px ${teamStyle.bg}12`,
          animation: "slideDown 0.2s ease",
        }}>
          <style>{`
            @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>

          {/* Detail header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${teamStyle.bg}, ${teamStyle.bg}aa)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Calendar size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1e293b" }}>
                  {selectedDayData.dayTH} {selectedDayData.date} {selectedDayData.month} {selectedDayData.dateObj.getFullYear() + 543}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>
                  {selectedDayTasks.length} งาน
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              style={{
                width: 28, height: 28, borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#f8fafc", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#94a3b8",
                fontSize: "1rem", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#fecaca"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >✕</button>
          </div>

          {/* Leave banner */}
          {selectedDayLeaves.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 16 }}>
              {selectedDayLeaves.map((lv, i) => {
                const leaveTypeMap = {
                  'ลาพักร้อน': { label: 'Vacation Leave', color: '#0ea5e9', light: '#e0f2fe' },
                  'ลากิจ': { label: 'Business Leave', color: '#f97316', light: '#ffedd5' },
                  'ลาป่วย': { label: 'Sick Leave', color: '#ef4444', light: '#fee2e2' },
                  'วันหยุดชดเชย': { label: 'Compensatory', color: '#10b981', light: '#dcfce7' },
                  'ลาคลอด / ลาเลี้ยงดูบุตร': { label: 'Maternity Leave', color: '#8b5cf6', light: '#f3e8ff' },
                  'ลาเพื่อการฌาปนกิจศพ': { label: 'Compassionate', color: '#64748b', light: '#f1f5f9' },
                  'อบรม / สัมมนา': { label: 'Training', color: '#14b8a6', light: '#ccfbf1' },
                };
                const lvInfo = leaveTypeMap[lv.type] || { label: lv.type || 'On Leave', color: '#635BFF', light: '#eef2ff' };
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "6px 0", marginBottom: 8,
                    boxSizing: "border-box",
                  }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 800, color: lvInfo.color, letterSpacing: "0.06em", flexShrink: 0 }}>ON LEAVE</div>
                    <div style={{
                      fontSize: "0.58rem", color: "#fff", fontWeight: 700,
                      background: lvInfo.color, padding: "2px 10px", borderRadius: 99,
                      whiteSpace: "nowrap",
                    }}>{lvInfo.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tasks list */}
          {selectedDayTasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
              <Clock size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>ไม่มีงานในวันนี้</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {selectedDayTasks.map((t, i) => {
                const col = colorForAcc(t.acc);
                const wlColor = getWorkloadColor(t.hours);
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "stretch", gap: 0,
                    borderRadius: 12, overflow: "hidden",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = `0 4px 16px ${col}18`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
                  >
                    {/* Color sidebar */}
                    <div style={{ width: 4, background: col, flexShrink: 0 }} />

                    {/* Content */}
                    <div style={{ flex: 1, padding: "12px 14px", background: "#fff" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                            {t.title || "ไม่มีชื่องาน"}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            {t.acc && (
                              <span style={{
                                fontSize: "0.65rem", fontWeight: 700, color: col,
                                background: `${col}15`, padding: "2px 8px", borderRadius: 99,
                              }}>{t.acc}</span>
                            )}
                            {t.node && (
                              <span style={{
                                fontSize: "0.65rem", fontWeight: 600, color: "#64748b",
                                background: "#f1f5f9", padding: "2px 8px", borderRadius: 99,
                              }}>{t.node}</span>
                            )}
                          </div>
                          {t.note && (
                            <div style={{
                              fontSize: "0.72rem", color: "#475569",
                              marginTop: "8px", wordBreak: "break-word", lineHeight: 1.3
                            }}>
                              <span style={{ fontWeight: 700, color: "#635bff" }}>Note: </span>
                              {t.note}
                            </div>
                          )}
                        </div>

                        {/* Workload badge hidden */}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Day total hidden */}
            </div>
          )}
        </div>
      )}

      {/* ── All Tasks Timeline (full list) ── */}
      {!loading && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Briefcase size={16} color={teamStyle.bg} />
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1e293b" }}>This Week's Timeline</span>
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, color: teamStyle.text,
              background: teamStyle.light, padding: "2px 8px", borderRadius: 99,
              marginLeft: 4,
            }}>{weekStats.totalTasks} งาน</span>
          </div>

          {weekStats.totalTasks === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
              <Briefcase size={40} style={{ opacity: 0.2, marginBottom: 10 }} />
              <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>ยังไม่มีงานในสัปดาห์นี้</div>
              <div style={{ fontSize: "0.78rem", marginTop: 4 }}>งานจะปรากฏที่นี่เมื่อมีการกำหนดตารางงาน</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {days.map((d, di) => {
                const dayTasks = tasksByDate[d.dateIso] || [];
                const dayLeaves = leavesByDate[d.dateIso] || [];
                if (dayTasks.length === 0 && dayLeaves.length === 0) return null;
                const totalWl = dayTasks.reduce((s, t) => s + t.hours, 0);
                const wlColor = getWorkloadColor(totalWl);

                return (
                  <div key={d.dateIso} style={{ display: "flex", gap: 0 }}>
                    {/* Timeline column */}
                    <div style={{ width: 80, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: d.isToday
                          ? "linear-gradient(135deg, #635BFF, #818cf8)"
                          : "#f1f5f9",
                        border: d.isToday ? "none" : "1px solid #e2e8f0",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        boxShadow: d.isToday ? "0 4px 12px rgba(99,91,255,0.3)" : "none",
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.06em", color: d.isToday ? "rgba(255,255,255,0.8)" : "#94a3b8", textTransform: "uppercase" }}>{d.day}</span>
                        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: d.isToday ? "#fff" : "#1e293b" }}>{d.date}</span>
                      </div>
                      {di < days.length - 1 && (
                        <div style={{ width: 2, flex: 1, minHeight: 20, background: "linear-gradient(to bottom, #e2e8f0, transparent)", margin: "4px 0" }} />
                      )}
                    </div>

                    {/* Tasks for the day */}
                    <div style={{ flex: 1, paddingBottom: 16, paddingLeft: 8 }}>
                      {dayLeaves.length > 0 && (() => {
                        const leaveTypeMap = {
                          'ลาพักร้อน': { label: 'Vacation Leave', color: '#0ea5e9', light: '#e0f2fe' },
                          'ลากิจ': { label: 'Business Leave', color: '#f97316', light: '#ffedd5' },
                          'ลาป่วย': { label: 'Sick Leave', color: '#ef4444', light: '#fee2e2' },
                          'วันหยุดชดเชย': { label: 'Compensatory', color: '#10b981', light: '#dcfce7' },
                          'ลาคลอด / ลาเลี้ยงดูบุตร': { label: 'Maternity Leave', color: '#8b5cf6', light: '#f3e8ff' },
                          'ลาเพื่อการฌาปนกิจศพ': { label: 'Compassionate', color: '#64748b', light: '#f1f5f9' },
                          'อบรม / สัมมนา': { label: 'Training', color: '#14b8a6', light: '#ccfbf1' },
                        };
                        const lvInfo = leaveTypeMap[dayLeaves[0].type] || { label: dayLeaves[0].type || 'On Leave', color: '#635BFF', light: '#eef2ff' };
                        return (
                          <div style={{
                            display: "flex", alignItems: "center", gap: 12,
                            width: "100%", padding: "6px 0", marginBottom: 8,
                            boxSizing: "border-box",
                          }}>
                            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: lvInfo.color, letterSpacing: "0.06em", flexShrink: 0 }}>ON LEAVE</div>
                            <div style={{
                              fontSize: "0.58rem", color: "#fff", fontWeight: 700,
                              background: lvInfo.color, padding: "2px 10px", borderRadius: 99,
                              whiteSpace: "nowrap",
                            }}>{lvInfo.label}</div>
                          </div>
                        );
                      })()}
                      {dayTasks.map((t, ti) => {
                        const col = colorForAcc(t.acc);
                        return (
                          <div key={ti} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 12px", borderRadius: 8, marginBottom: 6,
                            background: "#f8fafc",
                            border: "1px solid #f1f5f9",
                            borderLeft: `3px solid ${col}`,
                            transition: "all 0.15s",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${col}08`; e.currentTarget.style.borderColor = `${col}44`; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = `${col}`; e.currentTarget.style.borderLeftColor = col; e.currentTarget.style.borderTopColor = "#f1f5f9"; e.currentTarget.style.borderRightColor = "#f1f5f9"; e.currentTarget.style.borderBottomColor = "#f1f5f9"; }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>{t.title}</div>
                              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                {t.acc && (
                                  <span style={{ fontSize: "0.62rem", fontWeight: 700, color: col, background: `${col}15`, padding: "1px 6px", borderRadius: 99 }}>{t.acc}</span>
                                )}
                                {t.node && (
                                  <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", padding: "1px 6px", borderRadius: 99 }}>{t.node}</span>
                                )}
                              </div>
                              {t.note && (
                                <div style={{
                                  fontSize: "0.72rem", color: "#475569",
                                  marginTop: "6px", wordBreak: "break-word", lineHeight: 1.3
                                }}>
                                  <span style={{ fontWeight: 700, color: "#635bff" }}>Note: </span>
                                  {t.note}
                                </div>
                              )}
                            </div>
                            {/* Workload badge hidden */}
                          </div>
                        );
                      })}
                      {/* Timeline day total hidden */}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
