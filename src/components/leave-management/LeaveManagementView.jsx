"use client";

import { useEffect, useRef } from "react";
import * as lucide from "lucide";
import "flatpickr/dist/flatpickr.min.css";

// Static imports for core legacy logic (needed for initial render)
import "../legacy-pages/legacyGlobalHelpers.js";
import "./legacyLeaveLogic.js";
import "../legacy-pages/legacyEmpeoFetch.js"; // Real Empeo data fetcher

import LeaveManagementReact from "./LeaveManagementReact";

export default function LeaveManagementView() {
  const containerRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    document.body.dataset.page = "leave-management";

    // Set up minimal globals for first render immediately
    if (!window.DATA) {
      window.DATA = {
        employees: [],
        leaveRequests: [],
        empeoEmployees: [],
        empeoCalendar: {},
        empeoDailyLateMins: {},
        empeoDailyLeaveEarlyMins: {},
        leaveStats: { pending: 0, approved: 0, rejected: 0 }
      };
    }
    if (!window.apiSaveLeave) window.apiSaveLeave = async (req) => { 
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return false;

        const headers = {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        };

        const { action } = req;
        const dbPayload = {
            id: req.id,
            name: req.name,
            type: req.type,
            start_date: req.startRaw,
            end_date: req.endRaw,
            days: req.days,
            ref_date: req.refDateRaw || req.refDate || null,
            note: req.note || req.reason || '-'
        };

        let url = `${supabaseUrl}/rest/v1/leave_requests`;
        let method = 'POST';

        if (action === 'delete') {
            url += `?id=eq.${req.id}`;
            method = 'DELETE';
            const res = await fetch(url, { method, headers });
            return res.ok;
        } else if (action === 'edit') {
            url += `?id=eq.${req.id}`;
            method = 'PATCH';
        }

        const res = await fetch(url, {
            method,
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify(dbPayload)
        });

        return res.ok;
      } catch (err) {
        console.error("apiSaveLeave error", err);
        return false;
      }
    };
    
    // Attach lucide immediately since we static imported it
    window.lucide = {
      ...lucide,
      createIcons: (params) => (params && params.root === null) ? null : lucide.createIcons({ icons: lucide.icons, ...params })
    };

    window.navigate = (page) => {
      // Stub for legacy code compatibility
    };



    // Defer heavy libs (Chart.js, flatpickr) — load AFTER page is visible
    requestIdleCallback(() => {
      Promise.all([
        import("chart.js/auto"),
        import("flatpickr")
      ]).then(([chartModule, flatpickrModule]) => {
        window.Chart = chartModule.default;
        window.flatpickr = flatpickrModule.default;
        if (typeof window.initLeaveCharts === "function") {
          window.initLeaveCharts();
        }
      });

      // Background data refresh for Empeo
      import("../legacy-pages/legacyDataFetcher.js").then(mod => {
        if (mod?.fetchAndSetLegacyData) {
          mod.fetchAndSetLegacyData().catch(() => {});
        }
      }).catch(() => {});
    }, { timeout: 100 });

  }, []);

  return (
    <div className="w-full h-full bg-transparent overflow-y-auto" style={{ padding: '20px' }} data-page="leave-management">
      <LeaveManagementReact />
    </div>
  );
}
