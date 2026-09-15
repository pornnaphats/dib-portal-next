"use client";

import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Calendar, 
  Globe, 
  Share2, 
  Layers, 
  Trash2, 
  Eye, 
  RefreshCw, 
  History, 
  FileText,
  X,
  Check
} from "lucide-react";

export default function QcImportView() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedSummary, setParsedSummary] = useState(null);
  const [error, setError] = useState(null);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "history"
  const [selectedSummaryDetail, setSelectedSummaryDetail] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const fileInputRef = useRef(null);

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  const showToast = (title, message, type = "success") => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Load saved summaries from localStorage on mount
  useEffect(() => {
    loadSavedSummaries();
    if (typeof document !== "undefined") {
      document.querySelectorAll(".flatpickr-calendar").forEach(el => el.remove());
    }
  }, []);

  const loadSavedSummaries = () => {
    try {
      const stored = localStorage.getItem("qc_imported_summaries");
      if (stored) {
        setSavedSummaries(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved summaries:", e);
    }
  };

  // Helper: Format date string to English friendly format
  const formatEngDate = (dateStr) => {
    if (!dateStr || dateStr === "-") return "-";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1;
        const d = parseInt(parts[2]);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${d} ${months[m]} ${y}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  // Helper: Format category date span
  const formatCategoryDateSpan = (dateRange, fallbackMin, fallbackMax) => {
    let min = dateRange && dateRange.min && dateRange.min !== "-" ? dateRange.min : fallbackMin;
    let max = dateRange && dateRange.max && dateRange.max !== "-" ? dateRange.max : fallbackMax;
    if (!min || min === "-") return "-";
    if (min === max) return formatEngDate(min);
    return `${formatEngDate(min)} - ${formatEngDate(max)}`;
  };

  // Helper: Parse cell date to YYYY-MM-DD
  const parseCellDate = (cellVal) => {
    if (cellVal === null || cellVal === undefined || cellVal === "") return null;
    
    // 1. If cellVal is a JS Date instance
    if (cellVal instanceof Date && !isNaN(cellVal.getTime())) {
      const y = cellVal.getUTCHours() === 0 ? cellVal.getUTCFullYear() : cellVal.getFullYear();
      const m = String((cellVal.getUTCHours() === 0 ? cellVal.getUTCMonth() : cellVal.getMonth()) + 1).padStart(2, "0");
      const d = String((cellVal.getUTCHours() === 0 ? cellVal.getUTCDate() : cellVal.getDate())).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    // 2. If cellVal is an Excel numeric date serial (e.g. 30000 - 70000)
    if (typeof cellVal === "number" && cellVal > 30000 && cellVal < 70000) {
      const dateObj = XLSX.SSF.parse_date_code(cellVal);
      if (dateObj && dateObj.y && dateObj.m && dateObj.d) {
        const y = dateObj.y;
        const m = String(dateObj.m).padStart(2, "0");
        const d = String(dateObj.d).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    }

    // Normalize string: replace NBSP (\u00A0) and trim
    let str = String(cellVal).replace(/\u00A0/g, " ").trim();
    if (!str) return null;

    // 3. Thai / English textual month dates FIRST (e.g. "14 ก.ย. 2569", "14 ก.ย. 69", "14 ก. ย. 2569", "14 กรกฎาคม 2569", "14 Sep 2026")
    const THAI_MONTH_MAP = {
      "ม.ค.": 1, "ม.ค": 1, "มกราคม": 1, "มกรา": 1, "january": 1, "jan": 1,
      "ก.พ.": 2, "ก.พ": 2, "กุมภาพันธ์": 2, "กุมภา": 2, "february": 2, "feb": 2,
      "มี.ค.": 3, "มี.ค": 3, "มีนาคม": 3, "มีนา": 3, "march": 3, "mar": 3,
      "เม.ย.": 4, "เม.ย": 4, "เมษายน": 4, "เมษา": 4, "april": 4, "apr": 4,
      "พ.ค.": 5, "พ.ค": 5, "พฤษภาคม": 5, "พฤษภา": 5, "may": 5,
      "มิ.ย.": 6, "มิ.ย": 6, "มิถุนายน": 6, "มิถุนา": 6, "june": 6, "jun": 6,
      "ก.ค.": 7, "ก.ค": 7, "กรกฎาคม": 7, "กรกฎา": 7, "july": 7, "jul": 7,
      "ส.ค.": 8, "ส.ค": 8, "สิงหาคม": 8, "สิงหา": 8, "august": 8, "aug": 8,
      "ก.ย.": 9, "ก.ย": 9, "กันยายน": 9, "กันยา": 9, "september": 9, "sept": 9, "sep": 9,
      "ต.ค.": 10, "ต.ค": 10, "ตุลาคม": 10, "ตุลา": 10, "october": 10, "oct": 10,
      "พ.ย.": 11, "พ.ย": 11, "พฤศจิกายน": 11, "พฤศจิกา": 11, "november": 11, "nov": 11,
      "ธ.ค.": 12, "ธ.ค": 12, "ธันวาคม": 12, "ธันวา": 12, "december": 12, "dec": 12
    };

    const cleanLower = str.toLowerCase().replace(/\.\s+/g, ".").replace(/\s+/g, " ");
    const thaiMonthKeys = Object.keys(THAI_MONTH_MAP).sort((a, b) => b.length - a.length);
    for (const k of thaiMonthKeys) {
      if (cleanLower.includes(k) || cleanLower.replace(/\s+/g, "").includes(k.replace(/\s+/g, ""))) {
        const monthNum = THAI_MONTH_MAP[k];
        const remainingNums = cleanLower.replace(k, " ").match(/\d+/g);
        if (remainingNums && remainingNums.length >= 1) {
          let day = parseInt(remainingNums[0]);
          let year = remainingNums.length >= 2 ? parseInt(remainingNums[1]) : new Date().getFullYear();
          if (year < 100) {
            year += 2500; // e.g. 69 -> 2569
          }
          if (year > 2500) {
            year -= 543; // e.g. 2569 -> 2026
          }
          if (day >= 1 && day <= 31 && monthNum >= 1 && monthNum <= 12 && year >= 1990 && year <= 2100) {
            return `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          }
        }
      }
    }

    // 4. Standard ISO YYYY-MM-DD or YYYY/MM/DD
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
      const parts = str.split(/[-/]/);
      let y = parseInt(parts[0]);
      let m = parseInt(parts[1]);
      let d = parseInt(parts[2]);
      if (y > 2500) y -= 543;
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }

    // 5. Slash / Dash / Dot numeric formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    if (str.includes("/") || str.includes("-") || str.includes(".")) {
      const parts = str.split(/[/.-]/);
      if (parts.length >= 3) {
        let p0 = parseInt(parts[0]);
        let p1 = parseInt(parts[1]);
        let y = parseInt(parts[2]);
        if (!isNaN(p0) && !isNaN(p1) && !isNaN(y)) {
          if (y > 2500) y -= 543;
          else if (y < 100) y += 2000;

          let day, month;
          if (p0 > 12) { day = p0; month = p1; }
          else if (p1 > 12) { month = p0; day = p1; }
          else { day = p0; month = p1; }

          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          }
        }
      }
    }

    // 6. Standard JS Date string (e.g. "Tue Sep 15 2026..." or "2026-09-15T00:00:00Z")
    const dObj = new Date(str);
    if (!isNaN(dObj.getTime()) && str.length > 8 && (str.includes("T") || str.includes("GMT") || /[a-zA-Z]/.test(str))) {
      const y = dObj.getFullYear();
      if (y > 1990 && y < 2100) {
        const m = String(dObj.getMonth() + 1).padStart(2, "0");
        const d = String(dObj.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    }

    return null;
  };

  // Helper: Clean cell text
  const cleanCellText = (cellVal) => {
    if (cellVal === null || cellVal === undefined) return "";
    const str = String(cellVal).trim();
    if (!str || str === "-" || str === "N/A" || str === "n/a" || str === "undefined" || str === "null") return "";
    return str;
  };

  // Helper: Check if cell value is a header term
  const isHeaderTerm = (val) => {
    if (val === null || val === undefined) return false;
    const str = String(val).trim().toLowerCase();
    if (!str) return false;

    // If cell string contains digits (e.g. 15/09/2026), it's data, NOT a header!
    if (/\d/.test(str)) return false;

    const exactHeaders = [
      "หมวด", "คดี", "หมวดคดี", "หมวดหมู่", "หมวดหมู่คดี", "category", "cat", "ประเภท", "ประเภทคดี",
      "วันที่", "date", "วันที่รับแจ้ง", "วันที่นำส่ง", "date range", "dd/mm/yyyy",
      "ลำดับ", "no", "no.", "id", "case id", "เลขที่", "เลขที่คดี",
      "url", "link", "ลิงก์", "ช่องทาง", "channel", "website", "social",
      "หัวข้อ", "รายละเอียด", "title", "subject", "details",
      "สถานะ", "status", "ผู้รับผิดชอบ", "assignee"
    ];
    if (exactHeaders.includes(str)) return true;
    if ((str.startsWith("หมวด") || str.startsWith("category") || str.startsWith("วันที่")) && str.length < 20) return true;
    return false;
  };

  // Helper: Detect Date and Category column indexes intelligently
  const detectColumns = (jsonRows) => {
    let dateColIdx = -1;
    let catColIdx = -1;

    const colDateScores = {};
    const colTextScores = {};

    // 1. Inspect actual row cell values in first 60 rows
    for (let r = 0; r < Math.min(60, jsonRows.length); r++) {
      const row = jsonRows[r] || [];
      row.forEach((cell, idx) => {
        if (parseCellDate(cell) !== null) {
          colDateScores[idx] = (colDateScores[idx] || 0) + 1;
        } else {
          const str = cleanCellText(cell);
          if (str && !isHeaderTerm(str) && str.length >= 2) {
            colTextScores[idx] = (colTextScores[idx] || 0) + 1;
          }
        }
      });
    }

    let maxDateScore = 0;
    Object.keys(colDateScores).forEach(col => {
      if (colDateScores[col] > maxDateScore) {
        maxDateScore = colDateScores[col];
        dateColIdx = parseInt(col);
      }
    });

    // 2. Scan header rows (0-5)
    for (let h = 0; h < Math.min(6, jsonRows.length); h++) {
      const hRow = jsonRows[h] || [];
      hRow.forEach((cell, idx) => {
        const str = String(cell || "").trim().toLowerCase();
        if (!str) return;

        if (dateColIdx === -1 && (
          str.includes("วันที่") || str.includes("date") || str.includes("time") ||
          str.includes("เวลา") || str.includes("timestamp") || str.includes("created")
        )) {
          dateColIdx = idx;
        }

        if (catColIdx === -1 && idx !== dateColIdx && (
          str.includes("หมวด") || str.includes("คดี") || str.includes("category") ||
          str.includes("cat") || str.includes("ประเภท")
        )) {
          catColIdx = idx;
        }
      });
    }

    // 3. Fallback for category column from text scores
    if (catColIdx === -1 || catColIdx === dateColIdx) {
      let maxTextScore = 0;
      Object.keys(colTextScores).forEach(col => {
        const cIdx = parseInt(col);
        if (cIdx !== dateColIdx && colTextScores[col] > maxTextScore) {
          maxTextScore = colTextScores[col];
          catColIdx = cIdx;
        }
      });
    }

    // Defaults
    if (dateColIdx === -1 && catColIdx === 4) dateColIdx = 22;
    else if (dateColIdx === -1) dateColIdx = 4;

    if (catColIdx === -1 && dateColIdx === 4) catColIdx = 0;
    else if (catColIdx === -1) catColIdx = 4;

    return { dateColIdx, catColIdx };
  };

  // Helper: Find index of row containing column headers
  const findHeaderRowIndex = (jsonRows) => {
    if (!jsonRows || jsonRows.length <= 1) return 0;
    for (let r = 0; r < Math.min(6, jsonRows.length); r++) {
      const row = jsonRows[r] || [];
      let matchCount = 0;
      row.forEach(cell => {
        if (isHeaderTerm(cell)) matchCount++;
      });
      if (matchCount >= 1) return r;
    }
    return 0;
  };

  // Main File Processor
  const processExcelFile = (fileObj) => {
    setIsProcessing(true);
    setError(null);
    setParsedSummary(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true, cellNF: false, cellText: false });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error("File has no sheet data");
        }

        let websiteSheetName = null;
        let socialSheetName = null;

        // Smart sheet name detection
        workbook.SheetNames.forEach((name) => {
          const lower = name.toLowerCase();
          if (lower.includes("web") || lower.includes("เว็บ")) websiteSheetName = name;
          if (lower.includes("social") || lower.includes("โซเชียล")) socialSheetName = name;
        });

        // Single-sheet vs Multi-sheet workbook handling (prevent same sheet from being parsed twice)
        if (workbook.SheetNames.length === 1) {
          const singleName = workbook.SheetNames[0].toLowerCase();
          if (singleName.includes("web") || singleName.includes("เว็บ")) {
            websiteSheetName = workbook.SheetNames[0];
            socialSheetName = null;
          } else {
            socialSheetName = workbook.SheetNames[0];
            websiteSheetName = null;
          }
        } else {
          if (!websiteSheetName && !socialSheetName) {
            websiteSheetName = workbook.SheetNames[0];
            socialSheetName = workbook.SheetNames[1];
          } else if (websiteSheetName && !socialSheetName) {
            const other = workbook.SheetNames.find(n => n !== websiteSheetName);
            socialSheetName = other || null;
          } else if (!websiteSheetName && socialSheetName) {
            const other = workbook.SheetNames.find(n => n !== socialSheetName);
            websiteSheetName = other || null;
          } else if (websiteSheetName === socialSheetName) {
            socialSheetName = null;
          }
        }

        const categoryStats = {};
        const dailyStats = {};
        let websiteCases = 0;
        let socialCases = 0;
        const allDates = [];

        // Parse Sheet 1: Website
        if (websiteSheetName && workbook.Sheets[websiteSheetName]) {
          const sheet = workbook.Sheets[websiteSheetName];
          const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

          if (jsonRows.length > 0) {
            const { dateColIdx, catColIdx } = detectColumns(jsonRows);
            const headerRowIdx = findHeaderRowIndex(jsonRows);

            for (let r = headerRowIdx + 1; r < jsonRows.length; r++) {
              const row = jsonRows[r];
              if (!row || row.length === 0) continue;

              const hasAnyData = row.some(c => cleanCellText(c) !== "");
              if (!hasAnyData) continue;

              let cleanCat = cleanCellText(row[catColIdx]);
              let cleanDateStr = cleanCellText(row[dateColIdx]);

              // Skip header row if category or date contains column header terms
              if (isHeaderTerm(cleanCat) || isHeaderTerm(cleanDateStr)) continue;

              let dateIso = parseCellDate(row[dateColIdx]);

              // Fallback cell search for date in row if target cell doesn't parse
              if (!dateIso) {
                for (let c = 0; c < row.length; c++) {
                  const candidate = parseCellDate(row[c]);
                  if (candidate) {
                    dateIso = candidate;
                    break;
                  }
                }
              }

              // Fallback category search if cleanCat is empty
              if (!cleanCat) {
                for (let c = 0; c < row.length; c++) {
                  const txt = cleanCellText(row[c]);
                  if (txt && !isHeaderTerm(txt) && !parseCellDate(row[c]) && !txt.startsWith("http") && !txt.startsWith("www") && !/^\d+$/.test(txt)) {
                    cleanCat = txt;
                    break;
                  }
                }
              }

              const rawCat = cleanCat || "Unspecified Category";

              websiteCases++;

              if (!categoryStats[rawCat]) categoryStats[rawCat] = { category: rawCat, website: 0, social: 0, total: 0, dates: [] };
              categoryStats[rawCat].website++;
              categoryStats[rawCat].total++;

              if (dateIso) {
                categoryStats[rawCat].dates.push(dateIso);
                allDates.push(dateIso);
                if (!dailyStats[dateIso]) dailyStats[dateIso] = { date: dateIso, website: 0, social: 0, total: 0 };
                dailyStats[dateIso].website++;
                dailyStats[dateIso].total++;
              }
            }
          }
        }

        // Parse Sheet 2: Social
        if (socialSheetName && workbook.Sheets[socialSheetName]) {
          const sheet = workbook.Sheets[socialSheetName];
          const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

          if (jsonRows.length > 0) {
            const { dateColIdx, catColIdx } = detectColumns(jsonRows);
            const headerRowIdx = findHeaderRowIndex(jsonRows);

            for (let r = headerRowIdx + 1; r < jsonRows.length; r++) {
              const row = jsonRows[r];
              if (!row || row.length === 0) continue;

              const hasAnyData = row.some(c => cleanCellText(c) !== "");
              if (!hasAnyData) continue;

              let cleanCat = cleanCellText(row[catColIdx]);
              let cleanDateStr = cleanCellText(row[dateColIdx]);

              // Skip header row if category or date contains column header terms
              if (isHeaderTerm(cleanCat) || isHeaderTerm(cleanDateStr)) continue;

              let dateIso = parseCellDate(row[dateColIdx]);

              // Fallback cell search for date in row if target cell doesn't parse
              if (!dateIso) {
                for (let c = 0; c < row.length; c++) {
                  const candidate = parseCellDate(row[c]);
                  if (candidate) {
                    dateIso = candidate;
                    break;
                  }
                }
              }

              // Fallback category search if cleanCat is empty
              if (!cleanCat) {
                for (let c = 0; c < row.length; c++) {
                  const txt = cleanCellText(row[c]);
                  if (txt && !isHeaderTerm(txt) && !parseCellDate(row[c]) && !txt.startsWith("http") && !txt.startsWith("www") && !/^\d+$/.test(txt)) {
                    cleanCat = txt;
                    break;
                  }
                }
              }

              const rawCat = cleanCat || "Unspecified Category";

              socialCases++;

              if (!categoryStats[rawCat]) categoryStats[rawCat] = { category: rawCat, website: 0, social: 0, total: 0, dates: [] };
              categoryStats[rawCat].social++;
              categoryStats[rawCat].total++;

              if (dateIso) {
                categoryStats[rawCat].dates.push(dateIso);
                allDates.push(dateIso);
                if (!dailyStats[dateIso]) dailyStats[dateIso] = { date: dateIso, website: 0, social: 0, total: 0 };
                dailyStats[dateIso].social++;
                dailyStats[dateIso].total++;
              }
            }
          }
        }

        const totalCases = websiteCases + socialCases;
        if (totalCases === 0) {
          throw new Error("No data found in file or invalid data format");
        }

        let minDate = "-";
        let maxDate = "-";
        if (allDates.length > 0) {
          allDates.sort();
          minDate = allDates[0];
          maxDate = allDates[allDates.length - 1];
        }

        const sortedCategories = Object.values(categoryStats).map(cat => {
          let catMin = "-";
          let catMax = "-";
          if (cat.dates && cat.dates.length > 0) {
            cat.dates.sort();
            catMin = cat.dates[0];
            catMax = cat.dates[cat.dates.length - 1];
          } else if (minDate !== "-") {
            catMin = minDate;
            catMax = maxDate;
          }
          return {
            category: cat.category,
            website: cat.website,
            social: cat.social,
            total: cat.total,
            dateRange: { min: catMin, max: catMax }
          };
        }).sort((a, b) => b.total - a.total);
        const sortedDaily = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));

        const summaryObj = {
          id: `IMP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          fileName: fileObj.name,
          importedAt: new Date().toISOString(),
          websiteSheet: websiteSheetName || "Sheet 1",
          socialSheet: socialSheetName || "Sheet 2",
          totalCases,
          websiteCases,
          socialCases,
          dateRange: { min: minDate, max: maxDate },
          categoryBreakdown: sortedCategories,
          dailyBreakdown: sortedDaily
        };

        setParsedSummary(summaryObj);
        showToast("File Analyzed Successfully!", `Processed a total of ${totalCases.toLocaleString()} cases successfully.`, "success");
      } catch (err) {
        console.error("File process error:", err);
        setError(err.message || "An error occurred while processing the file");
        showToast("Error", err.message || "Unable to read file", "error");
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError("Unable to read file. Please try again.");
      setIsProcessing(false);
      showToast("Error", "Unable to read file. Please try again.", "error");
    };

    reader.readAsArrayBuffer(fileObj);
  };

  // Drag and drop handlers
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      processExcelFile(selectedFile);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      processExcelFile(droppedFile);
    }
  };

  // Save Aggregated Summary to Storage
  const handleSaveSummary = () => {
    if (!parsedSummary) return;

    try {
      const existing = JSON.parse(localStorage.getItem("qc_imported_summaries") || "[]");
      const updated = [parsedSummary, ...existing];
      localStorage.setItem("qc_imported_summaries", JSON.stringify(updated));
      setSavedSummaries(updated);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        fetch(`${supabaseUrl}/rest/v1/qc_imported_summaries`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(parsedSummary)
        }).catch(err => console.warn("Supabase summary sync notice:", err));
      }

      showToast("Saved Successfully!", "Summary totals have been saved to the system (raw file data not stored).", "success");
      setActiveTab("history");
    } catch (e) {
      console.error("Save summary error:", e);
      showToast("Save Error", "An error occurred while saving data. Please try again.", "error");
    }
  };

  // Confirm Delete Handler
  const confirmDeleteSummary = (id) => {
    try {
      const updated = savedSummaries.filter(item => item.id !== id);
      localStorage.setItem("qc_imported_summaries", JSON.stringify(updated));
      setSavedSummaries(updated);
      if (selectedSummaryDetail && selectedSummaryDetail.id === id) {
        setSelectedSummaryDetail(null);
      }
      setDeleteConfirmId(null);
      showToast("Deleted Successfully", "Import summary record has been deleted successfully.", "success");
    } catch (e) {
      console.error("Delete error:", e);
      showToast("Error", "Unable to delete record.", "error");
    }
  };

  return (
    <div style={{ padding: "28px", fontFamily: "'Kanit', sans-serif", background: "#f4f6fa", minHeight: "100%", boxSizing: "border-box", position: "relative" }}>
      
      {/* ===== CUSTOM TOAST NOTIFICATION ===== */}
      {toast.show && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 99999,
          background: "#ffffff",
          color: "#0f172a",
          borderRadius: "16px",
          padding: "16px 20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          maxWidth: "420px",
          animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: toast.type === "success" ? "#dcfce7" : "#fee2e2",
            color: toast.type === "success" ? "#16a34a" : "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            {toast.type === "success" ? <CheckCircle2 style={{ width: "22px", height: "22px" }} /> : <AlertCircle style={{ width: "22px", height: "22px" }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>{toast.title}</div>
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{toast.message}</div>
          </div>
          <button onClick={() => setToast(prev => ({ ...prev, show: false }))} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deleteConfirmId && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(6px)",
          zIndex: 99998, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "24px", padding: "32px",
            width: "420px", maxWidth: "90vw", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            textAlign: "center"
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%", background: "#fee2e2",
              color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px auto"
            }}>
              <Trash2 style={{ width: "28px", height: "28px" }} />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
              Confirm Record Deletion?
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 24px 0", lineHeight: 1.5 }}>
              You are about to delete this summary record from the system. This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0",
                  background: "#fff", color: "#64748b", fontSize: "0.88rem", fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteSummary(deleteConfirmId)}
                style={{
                  flex: 1, padding: "12px", borderRadius: "12px", border: "none",
                  background: "#ef4444", color: "#fff", fontSize: "0.88rem", fontWeight: 700,
                  cursor: "pointer", boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)"
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB NAVIGATION BAR (Clean Right-Aligned Pill Shape) ===== */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", background: "#e2e8f0", padding: "4px 6px", borderRadius: "9999px", gap: "4px" }}>
          <button
            onClick={() => setActiveTab("upload")}
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              border: "none",
              background: activeTab === "upload" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
              color: activeTab === "upload" ? "#ffffff" : "#64748b",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: activeTab === "upload" ? "0 4px 12px rgba(99, 102, 241, 0.35)" : "none",
              transition: "all 0.2s"
            }}
          >
            <UploadCloud style={{ width: "16px", height: "16px" }} />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              border: "none",
              background: activeTab === "history" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
              color: activeTab === "history" ? "#ffffff" : "#64748b",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: activeTab === "history" ? "0 4px 12px rgba(99, 102, 241, 0.35)" : "none",
              transition: "all 0.2s"
            }}
          >
            <History style={{ width: "16px", height: "16px" }} />
            Import History ({savedSummaries.length})
          </button>
        </div>
      </div>

      {/* ===== UPLOAD TAB CONTENT ===== */}
      {activeTab === "upload" && (
        <div style={{ display: "grid", gridTemplateColumns: parsedSummary ? "380px 1fr" : "1fr", gap: "28px" }}>
          
          {/* File Drag & Drop Box */}
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "#e0e7ff", color: "#4338ca", padding: "8px", borderRadius: "12px" }}>
                <UploadCloud style={{ width: "20px", height: "20px" }} />
              </div>
              Upload File
            </h2>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "20px",
                padding: "40px 24px",
                textAlign: "center",
                background: "#f8fafc",
                cursor: "pointer",
                transition: "all 0.25s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#eeeffe"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />

              <div style={{ width: "60px", height: "60px", borderRadius: "20px", background: "#e0e7ff", color: "#4338ca", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.3)" }}>
                <FileSpreadsheet style={{ width: "30px", height: "30px", margin: "auto" }} />
              </div>

              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
                {file ? file.name : "Click or drag & drop file here"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                Supports .xlsx, .xls, .csv files
              </div>
            </div>

            {isProcessing && (
              <div style={{ marginTop: "20px", padding: "14px", borderRadius: "14px", background: "#eeeffe", border: "1px solid #c7d2fe", color: "#4338ca", fontSize: "0.88rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <RefreshCw className="spin" style={{ animation: "spin 1s linear infinite", width: "20px", height: "20px" }} />
                Reading & analyzing file statistics...
              </div>
            )}
          </div>

          {/* Aggregated Preview Dashboard */}
          {parsedSummary && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Stat Summary Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "18px" }}>
                
                {/* Total Cases Card */}
                <div style={{ background: "#ffffff", borderRadius: "20px", padding: "22px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>
                    Total Imported Cases
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>
                    {parsedSummary.totalCases.toLocaleString()} <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#64748b" }}>cases</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700, marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Check style={{ width: "14px", height: "14px" }} /> Analyzed Successfully
                  </div>
                </div>

                {/* Website Card */}
                <div style={{ background: "#ffffff", borderRadius: "20px", padding: "22px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Globe style={{ width: "15px", height: "15px" }} /> Website Channel
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#2563eb" }}>
                    {parsedSummary.websiteCases.toLocaleString()} <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#64748b" }}>cases</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px" }}>
                    Share: {Math.round((parsedSummary.websiteCases / parsedSummary.totalCases) * 100)}% of total
                  </div>
                </div>

                {/* Social Card */}
                <div style={{ background: "#ffffff", borderRadius: "20px", padding: "22px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Share2 style={{ width: "15px", height: "15px" }} /> Social Channel
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#16a34a" }}>
                    {parsedSummary.socialCases.toLocaleString()} <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#64748b" }}>cases</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px" }}>
                    Share: {Math.round((parsedSummary.socialCases / parsedSummary.totalCases) * 100)}% of total
                  </div>
                </div>

                {/* Date Range Card */}
                <div style={{ background: "#ffffff", borderRadius: "20px", padding: "22px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: "0.78rem", color: "#d97706", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar style={{ width: "15px", height: "15px" }} /> Collection Date Range
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a", marginTop: "4px", lineHeight: 1.5 }}>
                    {parsedSummary.dateRange.min === parsedSummary.dateRange.max ? (
                      formatEngDate(parsedSummary.dateRange.min)
                    ) : (
                      <>
                        {formatEngDate(parsedSummary.dateRange.min)}
                        <br />
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 500 }}>To</span> {formatEngDate(parsedSummary.dateRange.max)}
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Bar */}
              <div style={{ background: "#eef2ff", borderRadius: "20px", padding: "20px 24px", border: "1px solid #c7d2fe", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ fontSize: "0.88rem", color: "#312e81", fontWeight: 600 }}>
                  💡 The system will only save these aggregated summary numbers (raw row-by-row data will not be saved).
                </div>
                <button
                  onClick={handleSaveSummary}
                  style={{
                    height: "36px",
                    padding: "0 20px",
                    borderRadius: "9999px",
                    border: "none",
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
                >
                  <Database style={{ width: "16px", height: "16px" }} />
                  Save Summary to System
                </button>
              </div>

              {/* Category Breakdown Table */}
              <div style={{ background: "#ffffff", borderRadius: "24px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Layers style={{ width: "20px", height: "20px", color: "#4338ca" }} />
                  Summary by Category
                </h3>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "12px 16px", fontWeight: 700, color: "#475569" }}>Category</th>
                        <th style={{ padding: "12px 16px", fontWeight: 700, color: "#d97706", textAlign: "center" }}>Date</th>
                        <th style={{ padding: "12px 16px", fontWeight: 700, color: "#2563eb", textAlign: "right" }}>Website</th>
                        <th style={{ padding: "12px 16px", fontWeight: 700, color: "#16a34a", textAlign: "right" }}>Social</th>
                        <th style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a", textAlign: "right" }}>Total Cases</th>
                        <th style={{ padding: "12px 16px", fontWeight: 700, color: "#64748b", textAlign: "right", width: "200px" }}>Share (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedSummary.categoryBreakdown.map((item, idx) => {
                        const pct = Math.round((item.total / parsedSummary.totalCases) * 100);
                        return (
                          <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{item.category}</td>
                            <td style={{ padding: "12px 16px", color: "#d97706", fontWeight: 600, fontSize: "0.82rem", textAlign: "center" }}>
                              {formatCategoryDateSpan(item.dateRange, parsedSummary?.dateRange?.min, parsedSummary?.dateRange?.max)}
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "right", color: "#2563eb", fontWeight: 600 }}>{item.website.toLocaleString()}</td>
                            <td style={{ padding: "12px 16px", textAlign: "right", color: "#16a34a", fontWeight: 600 }}>{item.social.toLocaleString()}</td>
                            <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: "#0f172a" }}>{item.total.toLocaleString()}</td>
                            <td style={{ padding: "12px 16px", textAlign: "right" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
                                <div style={{ flex: 1, height: "7px", background: "#f1f5f9", borderRadius: "99px", overflow: "hidden", maxWidth: "110px" }}>
                                  <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #4338ca, #6366f1)", borderRadius: "99px" }}></div>
                                </div>
                                <span style={{ fontWeight: 700, color: "#64748b", fontSize: "0.82rem" }}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ===== HISTORY LOG TAB CONTENT ===== */}
      {activeTab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <History style={{ width: "22px", height: "22px", color: "#4338ca" }} />
                Saved Import History Logs
              </h2>


            </div>

            {savedSummaries.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8", fontSize: "0.95rem" }}>
                No saved summary records found in system
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "#475569" }}>File Name</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "#475569" }}>Import Date</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "#475569" }}>Collection Date Range</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "#2563eb", textAlign: "right" }}>Website</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "#16a34a", textAlign: "right" }}>Social</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "#0f172a", textAlign: "right" }}>Total</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "#64748b", textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedSummaries.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}>
                          <FileText style={{ width: "18px", height: "18px", color: "#4338ca" }} />
                          {item.fileName}
                        </td>
                        <td style={{ padding: "14px 18px", color: "#64748b" }}>
                          {new Date(item.importedAt).toLocaleString("en-US")}
                        </td>
                        <td style={{ padding: "14px 18px", color: "#334155", fontWeight: 600 }}>
                          {formatEngDate(item.dateRange.min)} - {formatEngDate(item.dateRange.max)}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right", color: "#2563eb", fontWeight: 700 }}>
                          {item.websiteCases.toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right", color: "#16a34a", fontWeight: 700 }}>
                          {item.socialCases.toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: 800, color: "#0f172a" }}>
                          {item.totalCases.toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            <button
                              onClick={() => setSelectedSummaryDetail(item)}
                              style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#2563eb", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}
                            >
                              <Eye style={{ width: "14px", height: "14px" }} /> View Stats
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              style={{ padding: "8px 10px", borderRadius: "10px", border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", cursor: "pointer" }}
                              title="Delete Record"
                            >
                              <Trash2 style={{ width: "15px", height: "15px" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Detail View for Selected Saved Summary */}
          {selectedSummaryDetail && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(6px)", zIndex: 99997, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
              <div style={{ background: "#ffffff", borderRadius: "24px", width: "740px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", padding: "32px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      Imported Statistics Summary Details
                    </h3>
                    <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px" }}>
                      File: {selectedSummaryDetail.fileName}
                    </div>
                  </div>
                  <button onClick={() => setSelectedSummaryDetail(null)} style={{ border: "none", background: "#f1f5f9", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", fontWeight: "bold", color: "#64748b" }}>✕</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Total Cases</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>{selectedSummaryDetail.totalCases.toLocaleString()}</div>
                  </div>
                  <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "16px", border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: "0.75rem", color: "#1e40af", fontWeight: 600 }}>Website</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2563eb", marginTop: "4px" }}>{selectedSummaryDetail.websiteCases.toLocaleString()}</div>
                  </div>
                  <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "16px", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 600 }}>Social</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#16a34a", marginTop: "4px" }}>{selectedSummaryDetail.socialCases.toLocaleString()}</div>
                  </div>
                </div>

                <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", marginBottom: "14px" }}>Summary by Category</h4>
                <div style={{ overflowX: "auto", marginBottom: "24px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700 }}>Category</th>
                        <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#d97706" }}>Date</th>
                        <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#2563eb" }}>Website</th>
                        <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#16a34a" }}>Social</th>
                        <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSummaryDetail.categoryBreakdown.map((cat, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px 12px", fontWeight: 600, color: "#0f172a" }}>{cat.category}</td>
                          <td style={{ padding: "10px 12px", color: "#d97706", fontWeight: 600, fontSize: "0.8rem", textAlign: "center" }}>
                            {formatCategoryDateSpan(cat.dateRange, selectedSummaryDetail?.dateRange?.min, selectedSummaryDetail?.dateRange?.max)}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: "#2563eb", fontWeight: 600 }}>{cat.website.toLocaleString()}</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: "#16a34a", fontWeight: 600 }}>{cat.social.toLocaleString()}</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, color: "#0f172a" }}>{cat.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ textAlign: "right" }}>
                  <button onClick={() => setSelectedSummaryDetail(null)} style={{ padding: "10px 24px", borderRadius: "12px", border: "none", background: "#4338ca", color: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700 }}>Close</button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
