"use client";

import { useState } from "react";
import { Search, Filter, Plus, Calendar } from "lucide-react";
import { useData } from "../providers/DataProvider";
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import TaskSidebar from "./TaskSidebar";
import ScheduleGrid from "./ScheduleGrid";

export default function ScheduleView() {
  const { employees } = useData();
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState([
    { id: "T1", code: "T-001", name: "Design UI", scope: "UX/UI", status: "pending" },
    { id: "T2", code: "T-002", name: "Develop API", scope: "Backend", status: "pending" },
    { id: "T3", code: "T-003", name: "Write Tests", scope: "QA", status: "pending" },
  ]);
  const [scheduleData, setScheduleData] = useState({}); // { "empId-date": "T1" }
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    // over.id should be in format "empId_date"
    const targetCellId = String(over.id);
    if (targetCellId.includes("_")) {
      const taskId = active.id;
      setScheduleData((prev) => ({
        ...prev,
        [targetCellId]: taskId,
      }));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
          </div>

          {/* Schedule Grid */}
          <div className="flex-1 overflow-auto bg-[#f8fafc]">
            <ScheduleGrid employees={employees} searchQuery={search} scheduleData={scheduleData} tasks={tasks} />
          </div>
        </div>

        {/* Task Sidebar */}
        <TaskSidebar tasks={tasks} />

        {/* Drag Overlay for smooth animation */}
        <DragOverlay>
          {activeId ? (
            <div className="p-2 bg-white border border-indigo-500 rounded-md shadow-lg text-sm font-medium text-indigo-700">
              {tasks.find(t => t.id === activeId)?.name || "Task"}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
