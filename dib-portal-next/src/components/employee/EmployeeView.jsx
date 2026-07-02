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
    
    window.showConfirmModal = (opts) => { if (confirm(opts.message)) opts.onConfirm(); };
    window.showAlert = (title, message) => alert(message);
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
    <div className="w-full h-full bg-transparent p-6 overflow-y-auto">
      <style dangerouslySetInnerHTML={{__html: `
        /* Premium Purple Theme Select Inputs */
        .select-input {
          height: 38px !important;
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
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.08) !important;
          border-color: #635BFF !important;
        }
        .select-input:focus {
          border-color: #635BFF !important;
          box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.15) !important;
        }

        /* Search Box styling */
        .search-box {
          height: 38px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 99px !important;
          padding: 0 16px !important;
          background-color: #ffffff !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          transition: all 0.2s ease !important;
        }
        .search-box:focus-within {
          border-color: #635BFF !important;
          box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.15) !important;
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
          height: 38px !important;
          padding: 0 20px !important;
          font-size: 13px !important;
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.2) !important;
          transition: all 0.2s ease !important;
        }
        .btn-primary:hover {
          background: #5048E5 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 16px rgba(99, 91, 255, 0.3) !important;
        }
        .btn-primary:active {
          transform: translateY(0) scale(0.98) !important;
        }

        /* Clear Filter Button */
        button[onclick="clearEmployeeFilters()"] {
          height: 38px !important;
          border-radius: 99px !important;
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
          background-color: rgba(239, 68, 68, 0.06) !important;
          color: #ef4444 !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          padding: 0 20px !important;
          transition: all 0.2s ease !important;
        }
        button[onclick="clearEmployeeFilters()"]:hover {
          background-color: rgba(239, 68, 68, 0.1) !important;
          border-color: #ef4444 !important;
          transform: translateY(-1px) !important;
        }
      `}} />
      <div id="pageContent" ref={containerRef} className="w-full"></div>
    </div>
  );
}
