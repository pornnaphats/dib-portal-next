const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function findTestEmployees() {
  const res = await fetch(`${supabaseUrl}/rest/v1/employees?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (res.ok) {
    const emps = await res.json();
    const testEmps = emps.filter(e => 
      (e.team && e.team.toLowerCase().includes('test')) || 
      (e.name && e.name.toLowerCase().includes('test')) ||
      (e.nickname && e.nickname.toLowerCase().includes('test'))
    );
    console.log("Found employees matching 'test':", JSON.stringify(testEmps, null, 2));
  } else {
    console.log("Failed to fetch employees:", await res.text());
  }

  // Also check org_structure
  const structRes = await fetch(`${supabaseUrl}/rest/v1/org_structure?id=eq.default`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  if (structRes.ok) {
    const data = await structRes.json();
    const str = JSON.stringify(data);
    console.log("Org structure contains 'test' case-insensitive:", /test/i.test(str));
  }
}
findTestEmployees();
