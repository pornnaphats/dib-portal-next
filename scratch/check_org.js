const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function checkOrg() {
  const structRes = await fetch(`${supabaseUrl}/rest/v1/org_structure?id=eq.default`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (structRes.ok) {
    const data = await structRes.json();
    console.log("Org Structure Data:", JSON.stringify(data, null, 2));
  } else {
    console.log("Failed to fetch org:", await structRes.text());
  }
}
checkOrg();
