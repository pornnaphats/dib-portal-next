"use client";

import { useEffect, useRef } from "react";
import * as lucide from "lucide";
import "flatpickr/dist/flatpickr.min.css";

// Static imports for core legacy logic
import "../legacy-pages/legacyGlobalHelpers.js";
import "./legacyEmployeeLogic.js";

export default function EmployeeView() {
  const containerRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Set up minimal globals for first render immediately
    if (!window.DATA) {
      window.DATA = {
        employees: [],
        workshops: [],
        products: [],
        leaveRequests: []
      };
    }
    
    // Attach lucide immediately
    window.lucide = {
      ...lucide,
      createIcons: (params) => (params && params.root === null) ? null : lucide.createIcons({ icons: lucide.icons, ...params })
    };
    
    window.showToast = (message) => console.log(message);
    
    window.navigate = (page) => {
      if (page === 'employee' && containerRef.current) {
        containerRef.current.innerHTML = window.pageEmployee();
        window.lucide.createIcons();
      }
    };

    // RENDER IMMEDIATELY (Zero Promises, Zero Wait)
    if (containerRef.current && typeof window.pageEmployee === "function") {
      containerRef.current.innerHTML = window.pageEmployee();
      window.lucide.createIcons();
    }

    // Defer heavy libs (Chart.js, flatpickr) and background data fetch
    requestIdleCallback(() => {
      Promise.all([
        import("chart.js/auto"),
        import("flatpickr")
      ]).then(([chartModule, flatpickrModule]) => {
        window.Chart = chartModule.default;
        window.flatpickr = flatpickrModule.default;
        if (typeof window.initEmployeeCharts === "function") {
          window.initEmployeeCharts();
        }
      });

      // Background data refresh
      import("../legacy-pages/legacyDataFetcher.js").then(mod => {
        if (mod?.fetchAndSetLegacyData) {
          mod.fetchAndSetLegacyData().then(() => {
            if (containerRef.current && typeof window.pageEmployee === "function") {
              containerRef.current.innerHTML = window.pageEmployee();
              window.lucide.createIcons();
              if (window.Chart && typeof window.initEmployeeCharts === "function") {
                setTimeout(() => window.initEmployeeCharts(), 80);
              }
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
          font-size: 12px !important;
          font-weight: 500 !important;
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
          text-align: left !important;
        }
        .select-input:hover {
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
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
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
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
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .search-box:hover {
          border-color: #cbd5e1 !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
        }
        .search-box:focus-within {
          border-color: #cbd5e1 !important;
          box-shadow: none !important;
        }
        .search-box input {
          font-family: 'Kanit', sans-serif !important;
          font-size: 13px !important;
          color: #24204D !important;
          border: none !important;
          outline: none !important;
          background: transparent !important;
          width: 100% !important;
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
          background: #635BFF !important;
          transform: none !important;
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.2) !important;
        }
        .btn-primary:active {
          transform: none !important;
        }

      `}} />
      <div id="pageContent" ref={containerRef} className="w-full"></div>
    </div>
  );
}
