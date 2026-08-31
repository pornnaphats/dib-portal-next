const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function checkTeams() {
  const res = await fetch(`${supabaseUrl}/rest/v1/employees?select=id,name,team`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (res.ok) {
    const emps = await res.json();
    const uniqueTeams = [...new Set(emps.map(e => e.team))];
    console.log("Unique teams in DB:", uniqueTeams);
  } else {
    console.log("Failed to fetch employees:", await res.text());
  }
}
checkTeams();
