"use client";

import { useEffect, useRef } from "react";
import * as lucide from "lucide";
import "flatpickr/dist/flatpickr.min.css";

import "../legacy-pages/legacyGlobalHelpers.js";
import "../employee/legacyEmployeeLogic.js";

export default function LegacyScheduleView() {
  const containerRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (!window.DATA) window.DATA = { employees: [], leaveRequests: [] };
    if (!window.SCHEDULE_TASKS) window.SCHEDULE_TASKS = [];
    if (!window.QC_PLANS) window.QC_PLANS = [];

    window.lucide = {
      ...lucide,
      createIcons: (params) => (params && params.root === null) ? null : lucide.createIcons({ icons: lucide.icons, ...params })
    };

    window.navigate = (page) => {
      if (page === 'schedule' && containerRef.current) {
        containerRef.current.innerHTML = window.pageSchedule();
        window.lucide.createIcons();
      }
    };

    if (containerRef.current && typeof window.pageSchedule === "function") {
      containerRef.current.innerHTML = window.pageSchedule();
      window.lucide.createIcons();
    }

    requestIdleCallback(() => {
      Promise.all([
        import("flatpickr")
      ]).then(([flatpickrModule]) => {
        window.flatpickr = flatpickrModule.default;
        
        // Re-render once flatpickr is loaded so date filter attaches
        if (containerRef.current && typeof window.pageSchedule === "function") {
          containerRef.current.innerHTML = window.pageSchedule();
          window.lucide.createIcons();
        }
      });

      import("../legacy-pages/legacyDataFetcher.js").then(mod => {
        if (mod?.fetchAndSetLegacyData) {
          mod.fetchAndSetLegacyData().then(() => {
            if (containerRef.current && typeof window.pageSchedule === "function") {
              containerRef.current.innerHTML = window.pageSchedule();
              window.lucide.createIcons();
            }
          }).catch(() => {});
        }
      }).catch(() => {});
    }, { timeout: 100 });

  }, []);

  return (
    <div className="w-full h-full bg-transparent p-6 overflow-y-auto">
      <div id="pageContent" ref={containerRef} className="w-full"></div>
    </div>
  );
}
