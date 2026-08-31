const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function checkEmployees() {
  const fetchRes = await fetch(`${supabaseUrl}/rest/v1/employees?select=id,name,team`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (fetchRes.ok) {
    const emps = await fetchRes.json();
    console.log("ETDA Call Center Emps:", emps.filter(e => e.team === 'ETDA Call Center').map(e => `${e.id}: ${e.name} (${e.team})`));
    console.log("OR Call Center Emps:", emps.filter(e => e.team === 'OR Call Center').map(e => `${e.id}: ${e.name} (${e.team})`));
    console.log("Call Center Emps:", emps.filter(e => e.team === 'Call Center').map(e => `${e.id}: ${e.name} (${e.team})`));
    console.log("Call Center OR Emps:", emps.filter(e => e.team === 'Call Center OR').map(e => `${e.id}: ${e.name} (${e.team})`));
  }
}
checkEmployees();
