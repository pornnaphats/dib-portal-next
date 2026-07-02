"use client";

import { useEffect, useRef } from "react";
import * as lucide from "lucide";
import "flatpickr/dist/flatpickr.min.css";

// Static imports for core legacy logic
import "./legacyGlobalHelpers.js";
import "./legacyScopeLogic.js";

export default function ScopeView() {
  const containerRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Set up minimal globals for first render immediately
    if (!window.DATA) {
      window.DATA = {
        employees: [],
        scheduleTasks: [],
        public_holidays: []
      };
    }
    if (!window.WS_DATA) {
      window.WS_DATA = {
        members: [],
        tasks: [],
        accounts: []
      };
    }

    // Attach lucide immediately
    window.lucide = {
      ...lucide,
      createIcons: (params) => (params && params.root === null) ? null : lucide.createIcons({ icons: lucide.icons, ...params })
    };

    window.navigate = (page) => {
      if (page === 'project-scope-portal' && containerRef.current) {
        containerRef.current.innerHTML = window.renderPremiumScopeDashboard();
        window.lucide.createIcons();
      }
    };

    // RENDER IMMEDIATELY (Zero Promises, Zero Wait)
    if (containerRef.current && typeof window.renderPremiumScopeDashboard === "function") {
      containerRef.current.innerHTML = window.renderPremiumScopeDashboard();
      window.lucide.createIcons();
    }

    // Defer heavy libs and background data fetch
    requestIdleCallback(() => {
      Promise.all([
        import("chart.js/auto"),
        import("flatpickr")
      ]).then(([chartModule, flatpickrModule]) => {
        window.Chart = chartModule.default;
        window.flatpickr = flatpickrModule.default;
      });

      // Background data refresh
      import("./legacyDataFetcher.js").then(mod => {
        if (mod?.fetchAndSetLegacyData) {
          mod.fetchAndSetLegacyData().then(() => {
            if (containerRef.current && typeof window.renderPremiumScopeDashboard === "function") {
              containerRef.current.innerHTML = window.renderPremiumScopeDashboard();
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
