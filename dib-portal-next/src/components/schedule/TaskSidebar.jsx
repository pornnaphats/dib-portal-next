"use client";

import { useDraggable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

function DraggableTask({ task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 bg-white border rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-400 transition-colors ${isDragging ? "opacity-50 border-indigo-500" : "border-gray-200"} mb-3`}
    >
      <div className="text-xs font-semibold text-indigo-600 mb-1">{task.code}</div>
      <div className="text-sm text-gray-800 font-medium">{task.name}</div>
      <div className="text-xs text-gray-500 mt-2 bg-gray-100 inline-block px-2 py-1 rounded-md">{task.scope}</div>
    </div>
  );
}

export default function TaskSidebar({ tasks }) {
  return (
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
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
