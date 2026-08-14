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
      <style dangerouslySetInnerHTML={{__html: `
        /* Premium Purple Theme Select Inputs */
        .select-input {
          height: 34px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 99px !important;
          padding: 0 16px !important;
          font-family: 'Kanit', sans-serif !important;
          font-size: 13px !important;
          color: #24204D !important;
          background-color: #ffffff !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          outline: none !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          appearance: none !important;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
          background-repeat: no-repeat !important;
          background-position: right 14px center !important;
          background-size: 14px !important;
          padding-right: 36px !important;
        }
        .select-input:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
          border-color: #cbd5e1 !important;
        }
        .select-input:focus {
          border-color: #cbd5e1 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        button.select-input:focus {
          border-color: #e2e8f0 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        button.select-input:hover {
          border-color: #cbd5e1 !important;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08) !important;
        }

        /* Search Box styling */
        .search-box {
          height: 34px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 99px !important;
          padding: 0 16px !important;
          background-color: #ffffff !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          transition: all 0.2s ease !important;
        }
        .search-box:hover {
          border-color: #cbd5e1 !important;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08) !important;
        }
        .search-box:focus-within {
          border-color: #cbd5e1 !important;
          box-shadow: none !important;
        }
        .search-box input {
          font-family: 'Kanit', sans-serif !important;
          font-size: 13px !important;
          color: #24204D !important;
        }

        /* Premium Buttons */
        .btn-primary {
          background: #635BFF !important;
          color: #ffffff !important;
          font-family: 'Kanit', sans-serif !important;
          font-weight: 600 !important;
          border-radius: 99px !important;
          height: 34px !important;
          padding: 0 20px !important;
          font-size: 13px !important;
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.2) !important;
          transition: all 0.2s ease !important;
        }
        .btn-primary:hover {
          background: #5048E5 !important;
          box-shadow: 0 6px 16px rgba(99, 91, 255, 0.3) !important;
        }
      `}} />
      <div id="pageContent" ref={containerRef} className="w-full" data-page="public-holiday"></div>
    </div>
  );
}
