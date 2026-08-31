const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';

async function syncViaGoogleSheets() {
  console.log("Fetching employees from Supabase...");
  const fetchRes = await fetch(`${supabaseUrl}/rest/v1/employees?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!fetchRes.ok) {
    console.error("Failed to fetch employees:", await fetchRes.text());
    return;
  }

  const emps = await fetchRes.json();
  console.log(`Fetched ${emps.length} employees.`);

  const callCenterEmps = emps.filter(e => e.team === 'Call Center');
  const callCenterOrEmps = emps.filter(e => e.team === 'Call Center OR');

  console.log(`Found ${callCenterEmps.length} Call Center employees.`);
  console.log(`Found ${callCenterOrEmps.length} Call Center OR employees.`);

  // Update Call Center -> ETDA Call Center
  for (const emp of callCenterEmps) {
    console.log(`Syncing ${emp.id}: ${emp.name} to 'ETDA Call Center'...`);
    const payload = {
      action: 'edit',
      id: emp.id,
      name: emp.name,
      nameEn: emp.name_en || '-',
      nickname: emp.nickname || '-',
      email: emp.email || '-',
      birthdate: emp.birthdate || '-',
      position: emp.position || '-',
      team: 'ETDA Call Center',
      shift: emp.shift || '-',
      offdays: emp.dayoff || '-',
      status: emp.status || 'active',
      empType: emp.emp_type || '-'
    };

    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    console.log(`Result for ${emp.id}:`, res.status);
  }

  // Update Call Center OR -> OR Call Center
  for (const emp of callCenterOrEmps) {
    console.log(`Syncing ${emp.id}: ${emp.name} to 'OR Call Center'...`);
    const payload = {
      action: 'edit',
      id: emp.id,
      name: emp.name,
      nameEn: emp.name_en || '-',
      nickname: emp.nickname || '-',
      email: emp.email || '-',
      birthdate: emp.birthdate || '-',
      position: emp.position || '-',
      team: 'OR Call Center',
      shift: emp.shift || '-',
      offdays: emp.dayoff || '-',
      status: emp.status || 'active',
      empType: emp.emp_type || '-'
    };

    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    console.log(`Result for ${emp.id}:`, res.status);
  }

  console.log("All update requests sent to Google Sheets.");
}

syncViaGoogleSheets();
