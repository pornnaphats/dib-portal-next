"use client";

import { useDroppable } from "@dnd-kit/core";

function DroppableCell({ id, taskId, taskData }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-24 min-w-[120px] border-b border-r border-[#e2e8f0] p-1 transition-colors ${
        isOver ? "bg-indigo-50 border-indigo-200" : "bg-white hover:bg-gray-50"
      }`}
    >
      {taskId && taskData && (
        <div className="w-full h-full bg-indigo-100 border border-indigo-200 rounded p-1 text-xs overflow-hidden shadow-sm">
          <div className="font-semibold text-indigo-700 truncate">{taskData.code}</div>
          <div className="text-gray-700 leading-tight line-clamp-2 mt-0.5">{taskData.name}</div>
        </div>
      )}
    </div>
  );
}

export default function ScheduleGrid({ employees, searchQuery, scheduleData, tasks }) {
  // Generate dates for the week (starting from today)
  const today = new Date();
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      dateObj: d,
      displayDate: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      id: d.toISOString().split('T')[0]
    };
  });

  const filteredEmployees = (employees || []).filter(emp => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (emp.name?.toLowerCase().includes(q) || emp.nickname?.toLowerCase().includes(q));
  });

  return (
    <div className="w-full h-full overflow-auto">
      {/* Header Row */}
      <div className="flex sticky top-0 z-10 bg-white shadow-sm border-b border-[#e2e8f0]">
        <div className="w-[200px] min-w-[200px] sticky left-0 z-20 bg-white border-r border-[#e2e8f0] p-4 font-semibold text-gray-600 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
          Employee
        </div>
        {dates.map((d) => (
          <div key={d.id} className="flex-1 min-w-[120px] p-3 text-center border-r border-[#e2e8f0] bg-gray-50/80">
            <div className="text-xs text-gray-500 uppercase tracking-wider">{d.dayName}</div>
            <div className="font-medium text-gray-800">{d.displayDate}</div>
          </div>
        ))}
      </div>

      {/* Grid Rows */}
      {filteredEmployees.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No employees found.</div>
      ) : (
        <div className="flex flex-col">
          {filteredEmployees.map((emp) => (
            <div key={emp.employee_id || emp.name} className="flex group">
              {/* Employee Column */}
              <div className="w-[200px] min-w-[200px] sticky left-0 z-10 bg-white border-r border-b border-[#e2e8f0] p-3 flex flex-col justify-center shadow-[2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-gray-50/50 transition-colors">
                <div className="font-medium text-gray-800 truncate" title={emp.name}>
                  {emp.nickname ? `${emp.name} (${emp.nickname})` : emp.name}
                </div>
                <div className="text-xs text-gray-500 truncate">{emp.position || emp.department}</div>
              </div>

              {/* Day Columns (Droppable Cells) */}
              {dates.map((d) => {
                const cellId = `${emp.employee_id || emp.name}_${d.id}`;
                const taskId = scheduleData[cellId];
                const taskData = taskId ? tasks.find(t => t.id === taskId) : null;
                
                return (
                  <DroppableCell 
                    key={cellId} 
                    id={cellId} 
                    taskId={taskId} 
                    taskData={taskData} 
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
