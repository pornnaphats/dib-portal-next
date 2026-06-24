"use client";

import { useState } from "react";
import { Search, Filter, Plus, Calendar } from "lucide-react";
import { useData } from "../providers/DataProvider";

export default function ScheduleView() {
  const { employees } = useData();
  const [search, setSearch] = useState("");

  return (
    <div className="flex w-full h-full">
      {/* Main Schedule Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative border-r border-[#e2e8f0]">
        
        {/* Top Controls */}
        <div className="p-4 border-b border-[#e2e8f0] flex flex-wrap gap-4 items-center bg-[#f8fafc] z-10 sticky top-0">
          <div className="flex items-center gap-2 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อพนักงาน..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-md border border-gray-200">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> All Good
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></div> Moderate
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2"></div> Crisis
            </div>
          </div>
        </div>

        {/* Schedule Grid (Placeholder) */}
        <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center text-gray-400">
          <Calendar size={48} className="mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Schedule Grid is being migrated</h3>
          <p className="text-sm text-center max-w-md">
            We are currently converting the complex Vanilla JS drag-and-drop schedule grid into a robust React component.
            Loaded {employees?.length || 0} employees from DataContext.
          </p>
        </div>
      </div>

      {/* Task Sidebar */}
      <div className="w-[320px] bg-white flex flex-col h-full border-l border-[#e2e8f0] shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-20">
        <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#334155] flex items-center gap-2">
              <Plus size={18} className="text-indigo-500" />
              Add Task
            </h2>
          </div>
          
          <div className="space-y-3">
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white">
              <option value="all">All Projects</option>
            </select>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white">
              <option value="all">All Scopes</option>
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          <div className="text-sm text-gray-500 text-center mt-10">
            Task items will appear here
          </div>
        </div>
      </div>
    </div>
  );
}
