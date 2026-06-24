const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI4NDI1NCwiZXhwIjoyMDk3ODYwMjU0fQ.KIxnsNJiAwxHrJ-kLjUIAEOrhsr3tzUPPaIWu_hqzXs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrateData() {
  console.log("Starting Data Migration...");

  try {
    // 1. Fetch Employees from Google Sheets
    console.log("Fetching employees from Google Sheets...");
    const empUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRIZCYw5SXao0JSAqonVxudnfjIAAJv94yvR88HxlNcPWSyz_oxyZdoYRi3JYliJ4mNxjnq_oUYmW5S/pub?gid=0&single=true&output=csv";
    const empRes = await fetch(empUrl);
    const empText = await empRes.text();
    const empLines = empText.split("\n");
    const employeesToInsert = [];
    
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
        
        const employee_id = emp["ID"] || emp["id"] || `TEMP-${i}`;
        const name = lowerEmp["name"] || lowerEmp["ชื่อ-นามสกุล"] || lowerEmp["ชื่อ-สกุล"] || lowerEmp["ชื่อ"] || emp[Object.keys(emp)[0]] || "Unknown";
        const position = lowerEmp["position"] || lowerEmp["ตำแหน่ง"] || lowerEmp["pos"] || lowerEmp["job title"] || "";
        const department = lowerEmp["department"] || lowerEmp["แผนก"] || lowerEmp["สังกัด"] || lowerEmp["dept"] || lowerEmp["team"] || "";
        const nickname = lowerEmp["nickname"] || lowerEmp["ชื่อเล่น"] || "";
        const name_en = lowerEmp["name (eng)"] || lowerEmp["name_en"] || lowerEmp["english name"] || lowerEmp["nameen"] || "";

        employeesToInsert.push({
          employee_id,
          name,
          nickname,
          position,
          department,
          name_en
        });
      }
    }

    console.log(`Parsed ${employeesToInsert.length} employees.`);

    // Check if they already exist to avoid unique constraint errors
    const { data: existingEmployees, error: fetchError } = await supabase.from('employees').select('employee_id');
    if (fetchError) {
      console.error("Fetch existing employees error:", fetchError);
    }
    
    const existingIds = new Set(existingEmployees?.map(e => e.employee_id) || []);
    const newEmployees = employeesToInsert.filter(e => !existingIds.has(e.employee_id));

    if (newEmployees.length > 0) {
      const { error } = await supabase.from('employees').insert(newEmployees);
      if (error) {
        console.error("Error inserting employees:", error);
      } else {
        console.log(`Successfully inserted ${newEmployees.length} employees.`);
      }
    } else {
      console.log("No new employees to insert.");
    }

    console.log("Migration Script Completed!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrateData();
