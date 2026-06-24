"use client";

import { useMemo } from "react";

export default function ScheduleGrid({ employees, searchQuery, teamFilter, scheduleTasks, baseDate }) {
  // Generate 7 days starting from baseDate
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dayStr = d.toLocaleDateString('en-GB', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    return {
      dateObj: d,
      displayDate: `${dateStr}`,
      dayName: dayStr,
      id: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    };
  });

  const filteredEmployees = useMemo(() => {
    return (employees || []).filter(emp => {
      // Team filter
      if (teamFilter !== "all" && emp.team?.toLowerCase() !== teamFilter.toLowerCase()) return false;
      
      // Search query
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        emp.name?.toLowerCase().includes(q) || 
        emp.nickname?.toLowerCase().includes(q) ||
        emp.nameEn?.toLowerCase().includes(q)
      );
    });
  }, [employees, teamFilter, searchQuery]);

  // Group filtered employees by team
  const teams = useMemo(() => {
    const grouped = {};
    filteredEmployees.forEach(emp => {
      const teamName = emp.team || "Other";
      if (!grouped[teamName]) grouped[teamName] = [];
      grouped[teamName].push(emp);
    });
    return grouped;
  }, [filteredEmployees]);

  // Fast indexing for tasks
  const tasksByPersonDay = useMemo(() => {
    const map = {};
    (scheduleTasks || []).forEach(t => {
      if (!t.person || !t.date) return;
      const key = `${t.person}_${t.date}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [scheduleTasks]);

  return (
    <div className="w-full h-full min-w-max text-sm bg-white pb-20">
      {/* Table Header */}
      <div className="flex sticky top-0 z-10 bg-gray-50 border-b border-[#e2e8f0] text-gray-700 font-semibold shadow-sm">
        <div className="w-[240px] min-w-[240px] sticky left-0 z-20 bg-gray-50 border-r border-[#e2e8f0] p-4 flex items-center">
          Employee
        </div>
        {dates.map((d) => {
          const isWeekend = d.dayName === 'Sat' || d.dayName === 'Sun';
          return (
            <div key={d.id} className={`flex-1 min-w-[160px] p-3 text-center border-r border-[#e2e8f0] ${isWeekend ? 'bg-orange-50/50' : ''}`}>
              <div className={`text-xs uppercase tracking-wider ${isWeekend ? 'text-orange-600' : 'text-gray-500'}`}>
                {d.dayName}
              </div>
              <div className={`font-bold text-lg ${isWeekend ? 'text-orange-700' : 'text-gray-800'}`}>
                {d.displayDate}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Body */}
      {Object.keys(teams).length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white">No employees found.</div>
      ) : (
        Object.keys(teams).map(teamName => (
          <div key={teamName}>
            {/* Team Header Row */}
            <div className="flex bg-gray-100 border-b border-[#e2e8f0]">
              <div className="w-[240px] min-w-[240px] sticky left-0 z-10 bg-gray-100 border-r border-[#e2e8f0] p-2 font-bold text-indigo-800 pl-4">
                {teamName}
              </div>
              {dates.map(d => (
                <div key={`th_${d.id}`} className="flex-1 min-w-[160px] border-r border-[#e2e8f0]"></div>
              ))}
            </div>

            {/* Employee Rows */}
            {teams[teamName].map((emp) => (
              <div key={emp.id} className="flex border-b border-[#e2e8f0] group hover:bg-indigo-50/30 transition-colors">
                {/* Employee Column */}
                <div className="w-[240px] min-w-[240px] sticky left-0 z-10 bg-white border-r border-[#e2e8f0] p-3 shadow-[2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-indigo-50/30 transition-colors flex flex-col justify-center">
                  <div className="font-medium text-gray-800 truncate" title={emp.name}>
                    {emp.nickname ? `${emp.name} (${emp.nickname})` : emp.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{emp.position || emp.department}</div>
                </div>

                {/* Day Columns */}
                {dates.map((d) => {
                  const cellId = `${emp.id}_${d.id}`;
                  const dailyTasks = tasksByPersonDay[cellId] || [];
                  const totalPercent = dailyTasks.reduce((sum, t) => sum + (t.hours || 0), 0);
                  
                  const isWeekend = d.dayName === 'Sat' || d.dayName === 'Sun';

                  return (
                    <div 
                      key={cellId} 
                      className={`flex-1 min-w-[160px] border-r border-[#e2e8f0] p-2 align-top transition-colors min-h-[100px] ${isWeekend ? 'bg-orange-50/30' : ''}`}
                    >
                      {/* Daily Total Progress */}
                      {totalPercent > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-between text-[10px] mb-1 font-medium">
                            <span className={totalPercent > 100 ? "text-red-600 font-bold" : "text-gray-600"}>Total</span>
                            <span className={totalPercent > 100 ? "text-red-600 font-bold" : "text-indigo-600 font-bold"}>{totalPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full ${totalPercent > 100 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${Math.min(totalPercent, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Tasks */}
                      <div className="flex flex-col gap-1.5 mt-2">
                        {dailyTasks.map((task, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded p-2 text-xs shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-indigo-700 truncate mr-2" title={task.acc}>{task.acc || "Unknown"}</span>
                              <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">{task.hours}%</span>
                            </div>
                            <div className="text-gray-500 text-[10px] mb-1">{task.node}</div>
                            <div className="text-gray-700 leading-tight line-clamp-2" title={task.title}>{task.title}</div>
                          </div>
                        ))}
                        
                        {dailyTasks.length === 0 && (
                          <div className="text-transparent hover:text-indigo-300 text-xs text-center py-4 cursor-pointer">
                            + Add
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
