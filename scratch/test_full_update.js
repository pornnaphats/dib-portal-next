const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function testFullUpdate() {
  const empId = 'RS430';
  
  // 1. Fetch current employee
  const fetchRes = await fetch(`${supabaseUrl}/rest/v1/employees?id=eq.${empId}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const emps = await fetchRes.json();
  const emp = emps[0];
  console.log("Current employee in DB:", emp);

  // 2. Prepare payload matching submitEmployeeData
  const bodyPayload = {
    id: emp.id,
    name: emp.name,
    name_en: emp.name_en,
    nickname: emp.nickname,
    email: emp.email,
    birthdate: emp.birthdate,
    position: emp.position,
    team: 'ETDA Call Center', // New team!
    shift: emp.shift,
    dayoff: emp.dayoff,
    status: emp.status,
    emp_type: emp.emp_type
  };

  // 3. Update
  console.log("Updating RS430 with full payload...");
  const updateRes = await fetch(`${supabaseUrl}/rest/v1/employees?id=eq.${empId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(bodyPayload)
  });
  
  console.log("Update status:", updateRes.status);
  const updateText = await updateRes.text();
  console.log("Update response text:", updateText);
}

testFullUpdate();
