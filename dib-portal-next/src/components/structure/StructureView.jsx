"use client";

import { useEffect, useRef } from "react";
import * as lucide from "lucide";

// Static imports for core legacy logic
import "../employee/legacyEmployeeLogic.js";
import { initModernOrg } from "./legacyOrgLogic.js";

export default function StructureView() {
  const containerRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Set up minimal globals for first render immediately
    if (!window.DATA) {
      window.DATA = { employees: [] };
    }

    // Initialize modern org logic every time to override legacy scripts
    initModernOrg();

    // Attach lucide immediately
    window.lucide = {
      ...lucide,
      createIcons: (params) => (params && params.root === null) ? null : lucide.createIcons({ icons: lucide.icons, ...params })
    };

    window.navigate = (page) => {
      if (page === 'structure-team' && containerRef.current) {
        containerRef.current.innerHTML = window.pageStructureTeam();
        window.lucide.createIcons();
      }
    };

    // RENDER IMMEDIATELY (Zero Promises, Zero Wait)
    if (containerRef.current && typeof window.pageStructureTeam === "function") {
      containerRef.current.innerHTML = window.pageStructureTeam();
      window.lucide.createIcons();
    }

    // Background data refresh
    requestIdleCallback(() => {
      import("../legacy-pages/legacyDataFetcher.js").then(mod => {
        if (mod?.fetchAndSetLegacyData) {
          mod.fetchAndSetLegacyData().then(() => {
            if (containerRef.current && typeof window.pageStructureTeam === "function") {
              containerRef.current.innerHTML = window.pageStructureTeam();
              window.lucide.createIcons();
            }
          }).catch(() => {});
        }
      }).catch(() => {});
    }, { timeout: 100 });

  }, []);

  return (
    <div className="w-full h-full bg-transparent">
      <div ref={containerRef} className="w-full h-full"></div>
    </div>
  );
}
