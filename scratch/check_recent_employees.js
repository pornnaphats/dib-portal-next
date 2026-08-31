const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function checkRecent() {
  const res = await fetch(`${supabaseUrl}/rest/v1/employees?select=*&order=id.desc&limit=10`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (res.ok) {
    const emps = await res.json();
    console.log("Recent employees in DB:", emps.map(e => ({ id: e.id, name: e.name, team: e.team })));
  } else {
    console.log("Failed to fetch employees:", await res.text());
  }
}
checkRecent();
