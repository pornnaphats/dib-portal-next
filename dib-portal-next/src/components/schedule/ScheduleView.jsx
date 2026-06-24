"use client";

import { useState } from "react";
import { Search, Filter, Plus, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useData } from "../providers/DataProvider";
import ScheduleGrid from "./ScheduleGrid";

export default function ScheduleView() {
  const { employees, scheduleTasks } = useData();
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  
  // Date range state
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  return (
    <div className="flex flex-col w-full h-full bg-white relative">
      {/* Top Controls */}
      <div className="p-4 border-b border-[#e2e8f0] flex flex-wrap gap-4 items-center justify-between bg-white z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อพนักงาน หรือโปรเจกต์..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="all">ทุกทีม</option>
            <option value="Sertec">Sertec</option>
            <option value="ACE">ACE</option>
            <option value="ONIX">ONIX</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button onClick={handlePrevWeek} className="p-1 hover:bg-gray-200 rounded text-gray-600">
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 py-1 text-sm font-medium text-gray-700 min-w-[120px] text-center">
              {currentDate.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })}
            </div>
            <button onClick={handleNextWeek} className="p-1 hover:bg-gray-200 rounded text-gray-600">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="flex-1 overflow-auto bg-[#f4f7fe] p-4 relative">
        <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
           <ScheduleGrid 
             employees={employees} 
             searchQuery={search} 
             teamFilter={teamFilter}
             scheduleTasks={scheduleTasks} 
             baseDate={currentDate}
           />
        </div>
      </div>
    </div>
  );
}
