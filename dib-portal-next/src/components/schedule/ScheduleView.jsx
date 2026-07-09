"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw, Users, Download } from "lucide-react";
import { useData } from "../providers/DataProvider";
import LegacyScheduleGrid from "./LegacyScheduleGrid";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

export default function ScheduleView() {
  const { employees } = useData();
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [leaveLoaded, setLeaveLoaded] = useState(false);
  const [tasks, setTasks] = useState([]);
  const dateInputRef = useRef(null);
  const fpInstance = useRef(null);

  // Default: current week Sat–Fri (starts on Saturday)
  const getWeekStart = (d) => {
    const dt = new Date(d);
    const day = dt.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    // To find the previous Saturday:
    // If today is Saturday (6), diff is 0. If Sunday (0), diff is -1. If Monday (1), diff is -2, etc.
    const diff = day === 6 ? 0 : -(day + 1);
    dt.setDate(dt.getDate() + diff);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [weekEnd, setWeekEnd] = useState(() => {
    const d = getWeekStart(new Date());
    d.setDate(d.getDate() + 6);
    return d;
  });

  // Format date to Thai format: "27 มิถุนายน 2569"
  const formatThaiDateRange = (start, end) => {
    const monthsTH = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const startDay = start.getDate();
    const startMonth = monthsTH[start.getMonth()];
    const startYear = start.getFullYear() + 543;

    const endDay = end.getDate();
    const endMonth = monthsTH[end.getMonth()];
    const endYear = end.getFullYear() + 543;

    if (startYear === endYear) {
      if (start.getMonth() === end.getMonth()) {
        return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
      }
      return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
    }
    return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
  };

  const toIso = (d) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  const handlePrev = () => {
    const diff = Math.round((weekEnd - weekStart) / (1000 * 60 * 60 * 24)) + 1;
    const s = new Date(weekStart);
    s.setDate(s.getDate() - diff);
    const e = new Date(weekEnd);
    e.setDate(e.getDate() - diff);
    setWeekStart(s);
    setWeekEnd(e);
  };

  const handleNext = () => {
    const diff = Math.round((weekEnd - weekStart) / (1000 * 60 * 60 * 24)) + 1;
    const s = new Date(weekStart);
    s.setDate(s.getDate() + diff);
    const e = new Date(weekEnd);
    e.setDate(e.getDate() + diff);
    setWeekStart(s);
    setWeekEnd(e);
  };

  // Initialize Flatpickr for range selection on the date capsule click
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
    // Initialize window.DATA if not exists to avoid undefined error
    if (typeof window !== "undefined") {
      window.DATA = window.DATA || {};
      window.flatpickr = flatpickr;
      // Ensure window.lucide is bound so legacy HTML templates/modals can render icons
      import("lucide").then(lucide => {
        window.lucide = {
          ...lucide,
          createIcons: (params) => (params && params.root === null) ? null : lucide.createIcons({ icons: lucide.icons, ...params })
        };
      }).catch(() => {});
    }
    // Fetch legacy data (leaves) from Supabase on mount
    import("../legacy-pages/legacyDataFetcher.js").then(mod => {
      if (mod?.fetchAndSetLegacyData) {
        mod.fetchAndSetLegacyData().then(() => {
          setLeaveLoaded(true);
        }).catch(() => {});
      }
    }).catch(() => {});

    // Import legacy modal logic so qcShowManageEmployeesModal is available
    import("../legacy-pages/legacyQcPlanLogic.js").catch(() => {});

    // Import legacy employee & sidebar logic
    import("../employee/legacyEmployeeLogic.js").then(() => {
      // Sync tasks state initially
      setTasks([...(window.SCHEDULE_TASKS || [])]);

      // Wrap window functions to keep React state in sync
      const origHandleTaskDrop = window.handleTaskDrop;
      window.handleTaskDrop = function(...args) {
        if (typeof origHandleTaskDrop === 'function') {
          origHandleTaskDrop(...args);
        }
        setTasks([...(window.SCHEDULE_TASKS || [])]);
      };

      const origDeleteScheduledTask = window.deleteScheduledTask;
      window.deleteScheduledTask = function(...args) {
        if (typeof origDeleteScheduledTask === 'function') {
          origDeleteScheduledTask(...args);
        }
        setTasks([...(window.SCHEDULE_TASKS || [])]);
      };
      
      window.refreshReactSchedule = () => {
        setTasks([...(window.SCHEDULE_TASKS || [])]);
      };
    }).catch(() => {});

    return () => {
      if (fpInstance.current) {
        fpInstance.current.destroy();
      }
    };
  }, []);

  // Update flatpickr default date when weekStart changes
  useEffect(() => {
    if (fpInstance.current) {
      fpInstance.current.setDate([weekStart, weekEnd], false);
    }
  }, [weekStart]);

  // Sync tasks when leaves or general data finishes loading
  useEffect(() => {
    if (typeof window !== "undefined" && window.SCHEDULE_TASKS) {
      setTasks([...window.SCHEDULE_TASKS]);
    }
  }, [leaveLoaded]);

  // Unique teams from employees (filter out "-" and invalid values)
  const teams = [...new Set((employees || []).map(e => e.dept || e.team || "").filter(t => t && t !== "-"))].sort();

  return (
    <div id="scheduleMainContent" style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#f4f5fb", transition: "padding-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
      {/* Top Controls */}
      <div style={{
        padding: "12px 16px 8px 16px",
        background: "transparent",
        display: "flex",
        flexWrap: "nowrap",
        gap: "8px",
        alignItems: "center",
        justifyContent: "flex-end",
        position: "sticky",
        top: 0,
        zIndex: 20,
        minWidth: 0
      }}>
        {/* Left: Date Picker with Arrows */}
        <div 
          className="date-picker-container"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            background: "#fff", 
            border: "1px solid #e4e8ef", 
            borderRadius: "9999px", 
            overflow: "hidden", 
            height: "38px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            transition: "all 0.2s",
            flexShrink: 0
          }}
        >
          <button 
            onClick={handlePrev} 
            style={{ 
              padding: "0 12px", 
              border: "none", 
              background: "transparent", 
              cursor: "pointer", 
              color: "#5a6282", 
              display: "flex", 
              alignItems: "center",
              height: "100%",
              borderRight: "1px solid #eef2f6",
              transition: "background 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <ChevronLeft size={16} />
          </button>
          
          {/* Flatpickr trigger wrapper */}
          <div 
            onClick={() => fpInstance.current && fpInstance.current.open()}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              padding: "0 16px", 
              fontSize: "0.82rem", 
              fontWeight: 700, 
              color: "#24204D", 
              cursor: "pointer",
              userSelect: "none",
              height: "100%",
              transition: "background 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <CalendarIcon size={16} color="#635bff" />
            <span>{formatThaiDateRange(weekStart, weekEnd)}</span>
            <input 
              ref={dateInputRef} 
              type="text" 
              style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }} 
              readOnly 
            />
          </div>

          <button 
            onClick={handleNext} 
            style={{ 
              padding: "0 12px", 
              border: "none", 
              background: "transparent", 
              cursor: "pointer", 
              color: "#5a6282", 
              display: "flex", 
              alignItems: "center",
              height: "100%",
              borderLeft: "1px solid #eef2f6",
              transition: "background 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right Controls: Search & Team Filters */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", minWidth: 0, overflow: "hidden" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "100px", maxWidth: "280px" }}>
            <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#b0b8cc" }} size={14} />
            <input
              type="text"
              placeholder="ค้นหาชื่อพนักงาน..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                paddingLeft: "30px", paddingRight: "10px", paddingTop: "7px", paddingBottom: "7px",
                border: "1px solid #e4e8ef", borderRadius: "9999px",
                fontSize: "0.78rem", outline: "none", width: "100%",
                background: "#fff", color: "#24204D",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.2s"
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#635bff"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(99,91,255,0.15)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#e4e8ef"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
            />
          </div>

          {/* Team pill filters */}
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            gap: "2px",
            background: "#f0f0f8",
            borderRadius: "9999px",
            padding: "3px",
            flexShrink: 1,
            minWidth: 0,
            overflow: "hidden"
          }}>
            <button
              onClick={() => setTeamFilter("all")}
              style={{
                padding: "6px 14px",
                borderRadius: "9999px",
                border: "none",
                fontSize: "0.73rem",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
                background: teamFilter === "all" ? "#635bff" : "transparent",
                color: teamFilter === "all" ? "#fff" : "#5a6282",
                boxShadow: teamFilter === "all" ? "0 4px 12px rgba(99,91,255,0.35)" : "none"
              }}
              onMouseEnter={e => { if (teamFilter !== "all") e.currentTarget.style.color = "#635bff"; }}
              onMouseLeave={e => { if (teamFilter !== "all") e.currentTarget.style.color = "#5a6282"; }}
            >
              All Teams
            </button>
            {teams.map(t => (
              <button
                key={t}
                onClick={() => setTeamFilter(t)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  border: "none",
                  fontSize: "0.73rem",
                  fontWeight: teamFilter === t ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  background: teamFilter === t ? "#635bff" : "transparent",
                  color: teamFilter === t ? "#fff" : "#5a6282",
                  boxShadow: teamFilter === t ? "0 4px 12px rgba(99,91,255,0.35)" : "none"
                }}
                onMouseEnter={e => { if (teamFilter !== t) e.currentTarget.style.color = "#635bff"; }}
                onMouseLeave={e => { if (teamFilter !== t) e.currentTarget.style.color = "#5a6282"; }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ width: "1px", height: "18px", background: "#e4e8ef", margin: "0 2px", flexShrink: 0 }}></div>

          {/* Action buttons */}
          <button 
            onClick={() => {
              setSearch("");
              setTeamFilter("all");
              const s = getWeekStart(new Date());
              const e = new Date(s);
              e.setDate(e.getDate() + 6);
              setWeekStart(s);
              setWeekEnd(e);
            }}
            style={{
              height: "34px", padding: "0 14px", fontSize: "0.72rem", borderRadius: "9999px",
              background: "#ffffff", color: "#64748b", border: "1px solid #e8eaf0",
              display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.2s", flexShrink: 0, whiteSpace: "nowrap"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8f9fc"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.10)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)"; }}
          >
            <RotateCcw size={13} color="#94a3b8" />
            Clear All Filter
          </button>
          
          <button 
            onClick={() => {
              if (typeof window.toggleTaskSidebar === "function") {
                window.toggleTaskSidebar();
              }
            }}
            style={{
              height: "34px", padding: "0 14px", fontSize: "0.72rem", borderRadius: "9999px",
              background: "#635bff", color: "#fff", border: "none",
              display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", fontWeight: 700,
              boxShadow: "0 4px 12px rgba(99,91,255,0.25)",
              transition: "all 0.2s", flexShrink: 0, whiteSpace: "nowrap"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(99,91,255,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#635bff"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,91,255,0.25)"; }}
          >
            <span style={{ fontSize: "1rem", lineHeight: 1, fontWeight: 400 }}>+</span>
            <span>Add Task</span>
          </button>

          <button 
            onClick={() => {
              if (typeof window.openExportScheduleModal === "function") {
                window.openExportScheduleModal();
              }
            }}
            style={{
              height: "34px", padding: "0 16px", fontSize: "0.72rem", borderRadius: "9999px",
              background: "linear-gradient(135deg, #10b981, #059669)", color: "#ffffff", border: "none",
              display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 700,
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4), 0 2px 6px rgba(16, 185, 129, 0.25)",
              transition: "all 0.2s", flexShrink: 0, whiteSpace: "nowrap"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, #059669, #047857)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.5), 0 4px 8px rgba(16, 185, 129, 0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, #10b981, #059669)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(16, 185, 129, 0.4), 0 2px 6px rgba(16, 185, 129, 0.25)"; }}
          >
            <Download size={13} color="#ffffff" />
            Export แพลนงาน
          </button>

          <button 
            onClick={() => {
              if (typeof window.qcShowManageEmployeesModal === "function") {
                window.qcShowManageEmployeesModal("schedule");
              }
            }}
            style={{
              height: "34px", padding: "0 14px", fontSize: "0.72rem", borderRadius: "9999px",
              background: "#ffffff", color: "#64748b", border: "1px solid #e8eaf0",
              display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.2s", flexShrink: 0, whiteSpace: "nowrap"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8f9fc"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.10)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)"; }}
          >
            <Users size={13} color="#94a3b8" />
            จัดการพนักงาน
          </button>
        </div>
      </div>

      {/* Schedule Grid & Legend */}
      <div style={{ flex: 1, overflow: "hidden", padding: "8px 16px 16px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Workload Legend Indicators */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", alignItems: "center", padding: "0 4px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8f97b0" }}>Workload:</span>
          {[
            { label: "< 50%", color: "#ef4444" },
            { label: "50–80%", color: "#facc15" },
            { label: "81–100%", color: "#22c55e" },
            { label: "101–120%", color: "#166534" },
            { label: "> 120%", color: "#991b1b" }
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: l.color, display: "inline-block" }}></span>
              <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "#4b5675" }}>{l.label}</span>
            </div>
          ))}
        </div>

        <div style={{ 
          background: "#fff", 
          borderRadius: "16px", 
          boxShadow: "0 10px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.02)", 
          overflow: "hidden",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column"
        }}>
          <LegacyScheduleGrid
            employees={employees}
            searchQuery={search}
            teamFilter={teamFilter}
            scheduleTasks={tasks}
            startDate={toIso(weekStart)}
            endDate={toIso(weekEnd)}
          />
        </div>
      </div>

      {/* Sidebar right placeholder */}
      <div 
        id="taskSidebarContainer" 
        style={{ 
          position: "fixed", 
          top: 0, 
          right: "-380px", 
          width: "380px", 
          height: "100vh", 
          background: "#fff", 
          boxShadow: "-10px 0 30px rgba(0,0,0,0.1)", 
          zIndex: 10000, 
          transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)" 
        }} 
      />
    </div>
  );
}
