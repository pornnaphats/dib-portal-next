import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
// anon key from .env.local
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateEmployees() {
  console.log("Fetching Employees from Google Sheets...");
  const empUrl = "https://docs.google.com/spreadsheets/d/1a5nLyclYZwFUlauF4lXNwv9X2i_6xQQSFJCnOXuyJVE/export?format=csv&gid=0";
  const empRes = await fetch(empUrl);
  const empText = await empRes.text();
  const empLines = empText.split("\n");
  const employees = [];
  
  if (empLines.length > 1) {
    const headers = empLines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
    const idIdx = headers.findIndex(h => h.includes('id') || h === 'no.');
    const nameIdx = headers.findIndex(h => h.includes('name') && !h.includes('en'));
    const nameEnIdx = headers.findIndex(h => h.includes('name') && h.includes('en'));
    const nickIdx = headers.findIndex(h => h.includes('nick'));
    const emailIdx = headers.findIndex(h => h.includes('email'));
    const posIdx = headers.findIndex(h => h.includes('position'));
    const teamIdx = headers.findIndex(h => h.includes('team') || h.includes('dept'));
    
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
      
      const id = rowData[idIdx] || `EMP-${i}`;
      employees.push({
        id: id,
        name: rowData[nameIdx] || "Unknown",
        name_en: nameEnIdx >= 0 ? rowData[nameEnIdx] : null,
        nickname: nickIdx >= 0 ? rowData[nickIdx] : null,
        email: emailIdx >= 0 ? rowData[emailIdx] : null,
        position: posIdx >= 0 ? rowData[posIdx] : null,
        team: teamIdx >= 0 ? rowData[teamIdx] : null,
      });
    }
  }

  console.log(`Found ${employees.length} employees. Inserting into Supabase...`);
  const { data, error } = await supabase.from('employees').upsert(employees, { onConflict: 'id' });
  if (error) {
    console.error("Error inserting employees:", error);
  } else {
    console.log("Employees inserted successfully.");
  }
  return employees;
}

async function migrateScheduleTasks(employees) {
  console.log("Fetching Schedule Tasks from Google Sheets...");
  const schedUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQaXD80787sk22egIkym9znE1FAewPZ7qYe4gaL88GWNFAihRmwNO48rxbqC5OhKX_Xarp-Pc0uU90H/pub?gid=290442456&single=true&output=csv";
  const schedRes = await fetch(schedUrl);
  const schedText = await schedRes.text();
  const schedLines = schedText.split("\n");
  const tasks = [];
  
  if (schedLines.length > 1) {
    const headers = schedLines[0].split(",").map(h => h.trim().toLowerCase());
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const projIdx = headers.findIndex(h => h.includes('project'));
    const nodeIdx = headers.findIndex(h => h.includes('node'));
    const detailIdx = headers.findIndex(h => h.includes('detail') || h.includes('work'));
    const pctIdx = headers.findIndex(h => h.includes('percent'));
    
    for (let i = 1; i < schedLines.length; i++) {
      if (!schedLines[i].trim()) continue;
      let rowData = [];
      let inQuotes = false;
      let current = "";
      for (let char of schedLines[i]) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) { rowData.push(current); current = ""; }
        else current += char;
      }
      rowData.push(current);
      rowData = rowData.map(c => c.trim().replace(/^"|"$/g, ""));
      
      let dateIso = rowData[dateIdx] || "";
      if (!dateIso) continue;
      if (dateIso.includes('/')) {
         const parts = dateIso.split('/');
         if (parts.length === 3) {
            const p0 = parseInt(parts[0]);
            const p1 = parseInt(parts[1]);
            let y = parseInt(parts[2]);
            if (y > 2500) y -= 543;
            let month, day;
            if (p0 > 12) { day = p0; month = p1; }
            else if (p1 > 12) { month = p0; day = p1; }
            else { day = p0; month = p1; }
            dateIso = `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
         }
      } else if (dateIso.includes('T')) {
         dateIso = dateIso.split('T')[0];
      }
      if (!dateIso.match(/^\d{4}-\d{2}-\d{2}$/)) continue;
      
      const nickname = rowData[nameIdx] || "";
      let personId = null;
      
      if (nickname) {
        const tPerson = nickname.trim().toLowerCase();
        const emp = employees.find(e => 
          (e.id && String(e.id).trim().toLowerCase() === tPerson) ||
          (e.nickname && e.nickname.trim().toLowerCase() === tPerson) || 
          (e.name && e.name.trim().toLowerCase() === tPerson) || 
          (e.name_en && e.name_en.trim().toLowerCase() === tPerson)
        );
        if (emp) personId = emp.id;
      }
      
      tasks.push({
        id: `TASK_${i}_${Date.now()}`,
        date: dateIso,
        person_id: personId,
        project: rowData[projIdx] || "",
        node: rowData[nodeIdx] || "",
        work_detail: rowData[detailIdx] || "",
        percentage: parseInt(rowData[pctIdx]) || 0
      });
    }
  }

  console.log(`Found ${tasks.length} tasks. Inserting into Supabase...`);
  // Insert in batches of 500 to avoid limits
  for (let i = 0; i < tasks.length; i += 500) {
    const batch = tasks.slice(i, i + 500);
    const { data, error } = await supabase.from('schedule_tasks').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Error inserting batch ${i}:`, error);
    }
  }
  console.log("Schedule Tasks inserted successfully.");
}

async function run() {
  const employees = await migrateEmployees();
  await migrateScheduleTasks(employees);
  console.log("Migration Complete!");
}

run();
