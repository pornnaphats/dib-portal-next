"use client";

import { useEffect, useRef } from "react";
import * as lucide from "lucide";
import "flatpickr/dist/flatpickr.min.css";

// Static imports for core legacy logic
import "./legacyGlobalHelpers.js";
import "../employee/legacyEmployeeLogic.js";
import "./legacyQcPlanLogic.js";

export default function QcAutoPlanView() {
  const containerRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    document.body.dataset.page = "auto-assign-plan";
    window.currentPage = "auto-assign-plan";

    // Set up minimal globals
    if (!window.DATA) {
      window.DATA = { employees: [], scheduleTasks: [], public_holidays: [] };
    }
    if (!window.WS_DATA) {
      window.WS_DATA = { members: [], tasks: [], accounts: [] };
    }

    // Attach lucide
    window.lucide = {
      ...lucide,
      createIcons: (params) => (params && params.root === null) ? null : lucide.createIcons({ icons: lucide.icons, ...params })
    };

    // Render Auto Plan Page content
    if (containerRef.current && typeof window.renderQCAutoPlanPage === "function") {
      containerRef.current.innerHTML = window.renderQCAutoPlanPage();
      window.lucide.createIcons();

      // Initialize state and dropdowns
      window.QC_AUTO_PLAN_STATE = {
        step: 1,
        categories: {},
        planType: '',
        qcSubtype: '',
        channel: '',
        workDate: '',
        dataDate: '',
        allocations: []
      };

      if (typeof window.qcInitAutoPlanFlatpickr === "function") {
        window.qcInitAutoPlanFlatpickr();
      }
      if (typeof window.qcPopulateImportedDropdown === "function") {
        window.qcPopulateImportedDropdown();
      }
      if (typeof window.qcFetchImportedSummariesFromSupabase === "function") {
        window.qcFetchImportedSummariesFromSupabase();
      }
    }

    // Defer heavy libs and background data fetch
    requestIdleCallback(() => {
      Promise.all([
        import("chart.js/auto"),
        import("flatpickr")
      ]).then(([chartModule, flatpickrModule]) => {
        window.Chart = chartModule.default;
        window.flatpickr = flatpickrModule.default;
        if (typeof window.qcInitAutoPlanFlatpickr === "function") {
          window.qcInitAutoPlanFlatpickr();
        }
      });

      import("./legacyDataFetcher.js").then(mod => {
        if (mod?.fetchAndSetLegacyData) {
          mod.fetchAndSetLegacyData().then(() => {
            if (typeof window.qcPopulateImportedDropdown === "function") {
              window.qcPopulateImportedDropdown();
            }
          }).catch(() => {});
        }
      }).catch(() => {});
    }, { timeout: 100 });

  }, []);

  return (
    <div className="w-full h-full bg-transparent overflow-y-auto" style={{ padding: '0px' }}>
      <div id="pageContent" ref={containerRef} className="w-full" data-page="auto-assign-plan"></div>
    </div>
  );
}
