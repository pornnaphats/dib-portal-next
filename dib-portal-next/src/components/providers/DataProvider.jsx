"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

const DataContext = createContext(null);

export const useData = () => useContext(DataContext);

export default function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState({ employees: [], permissions: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // Only fetch data if logged in

    const fetchData = async () => {
      try {
        // 1. Fetch Employees
        const empUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRIZCYw5SXao0JSAqonVxudnfjIAAJv94yvR88HxlNcPWSyz_oxyZdoYRi3JYliJ4mNxjnq_oUYmW5S/pub?gid=0&single=true&output=csv";
        const empRes = await fetch(empUrl);
        const empText = await empRes.text();
        const empLines = empText.split("\n");
        const employees = [];
        
        if (empLines.length > 1) {
          const headers = empLines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
          for (let i = 1; i < empLines.length; i++) {
            if (!empLines[i].trim()) continue;
            let rowData = [];
            let inQuotes = false;
            let current = "";
            for (let char of empLines[i]) {
              if (char === '"') inQuotes = !inQuotes;
              else if (char === "," && !inQuotes) { rowData.push(current.trim()); current = ""; }
              else current += char;
            }
            rowData.push(current.trim());
            rowData = rowData.map(c => c.replace(/^"|"$/g, ""));
            let emp = {};
            headers.forEach((h, idx) => { emp[h] = rowData[idx] || ""; });
            
            const lowerEmp = {};
            Object.keys(emp).forEach(k => { lowerEmp[k.toLowerCase()] = emp[k]; });
            emp.name = lowerEmp["name"] || lowerEmp["ชื่อ-นามสกุล"] || lowerEmp["ชื่อ-สกุล"] || lowerEmp["ชื่อ"] || emp[Object.keys(emp)[0]] || "Unknown";
            emp.pos = lowerEmp["position"] || lowerEmp["ตำแหน่ง"] || lowerEmp["pos"] || lowerEmp["job title"] || "";
            emp.dept = lowerEmp["department"] || lowerEmp["แผนก"] || lowerEmp["สังกัด"] || lowerEmp["dept"] || lowerEmp["team"] || "";
            emp.nickname = lowerEmp["nickname"] || lowerEmp["ชื่อเล่น"] || "";
            emp.nameEn = lowerEmp["name (eng)"] || lowerEmp["name_en"] || lowerEmp["english name"] || lowerEmp["nameen"] || "";
            employees.push(emp);
          }
        }

        // 2. Fetch Permissions
        const permUrl = "https://docs.google.com/spreadsheets/d/1a5nLyclYZwFUlauF4lXNwv9X2i_6xQQSFJCnOXuyJVE/export?format=csv&gid=1248107333";
        const permRes = await fetch(permUrl);
        const permText = await permRes.text();
        const permLines = permText.split("\n");
        const permissions = {};
        
        if (permLines.length > 1) {
          const headers = permLines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
          for (let i = 1; i < permLines.length; i++) {
            if (!permLines[i].trim()) continue;
            let rowData = [];
            let inQuotes = false;
            let current = "";
            for (let char of permLines[i]) {
              if (char === '"') inQuotes = !inQuotes;
              else if (char === "," && !inQuotes) { rowData.push(current); current = ""; }
              else current += char;
            }
            rowData.push(current);
            rowData = rowData.map(c => c.trim().replace(/^"|"$/g, ""));
            
            const role = (rowData[0] || "").toLowerCase();
            if (!role) continue;
            
            permissions[role] = {};
            for (let j = 1; j < headers.length; j++) {
              const pageKey = headers[j];
              const val = (rowData[j] || "").toUpperCase();
              if (["TRUE", "YES", "1", "Y", "OK", "T", "✓", "X", "TRUE\r"].includes(val.replace(/\r$/, ""))) {
                permissions[role][pageKey.replace(/\r$/, "")] = true;
              }
            }
          }
        }

        setData({ employees, permissions });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading && user) {
    return <div className="min-h-screen flex items-center justify-center">Loading system data...</div>;
  }

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}
