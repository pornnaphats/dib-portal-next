"use client";

import { useEffect, useRef } from "react";
import * as lucide from "lucide";
import "flatpickr/dist/flatpickr.min.css";

// Static imports for core legacy logic
import "./legacyGlobalHelpers.js";
import "./legacyHolidayLogic.js";

export default function HolidayView() {
  const containerRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    document.body.dataset.page = "public-holiday";

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
      if (page === 'public-holiday' && containerRef.current) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        const doRender = () => {
          if (containerRef.current && typeof window.pagePublicHoliday === "function") {
            containerRef.current.innerHTML = window.pagePublicHoliday();
            window.lucide.createIcons();
          }
        };

        // Always fetch fresh data directly — bypass any cache guards
        if (supabaseUrl && supabaseKey) {
          fetch(`${supabaseUrl}/rest/v1/public_holidays?select=*&limit=500&order=date.asc`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
          }).then(res => res.ok ? res.json() : []).then(holidays => {
            const holidayList = [];
            const holidayMap = {};
            holidays.forEach(row => {
              if (row.date && row.name) {
                const [y, m, d] = row.date.split('-');
                holidayList.push({ id: row.id, date: `${parseInt(d)}/${parseInt(m)}/${y}`, name: row.name });
                holidayMap[`${parseInt(m)}-${parseInt(d)}`] = row.name;
              }
            });
            window.HOLIDAY_LIST = holidayList;
            window.HOLIDAYS = holidayMap;
            if (window.DATA) window.DATA.public_holidays = holidayList;
            doRender();
          }).catch(() => doRender());
        } else {
          doRender();
        }
      }
    };

    // RENDER IMMEDIATELY (Zero Promises, Zero Wait)
    if (containerRef.current && typeof window.pagePublicHoliday === "function") {
      containerRef.current.innerHTML = window.pagePublicHoliday();
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
            if (containerRef.current && typeof window.pagePublicHoliday === "function") {
              containerRef.current.innerHTML = window.pagePublicHoliday();
              window.lucide.createIcons();
            }
          }).catch(() => {});
        }
      }).catch(() => {});
    }, { timeout: 100 });

  }, []);

  return (
    <div className="w-full h-full bg-transparent overflow-y-auto" style={{ padding: '20px' }}>
      <div id="pageContent" ref={containerRef} className="w-full" data-page="public-holiday"></div>
    </div>
  );
}
