const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function checkOrgText() {
  const structRes = await fetch(`${supabaseUrl}/rest/v1/org_structure?id=eq.default`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (structRes.ok) {
    const data = await structRes.json();
    const str = JSON.stringify(data);
    console.log("Contains 'Call Center':", str.includes("Call Center"));
    console.log("Contains 'Call Center OR':", str.includes("Call Center OR"));
    console.log("Contains 'ETDA':", str.includes("ETDA"));
    console.log("Contains 'OR Call Center':", str.includes("OR Call Center"));
  }
}
checkOrgText();
