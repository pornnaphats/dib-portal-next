const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function testSingleUpdate() {
  const empId = 'RS430';
  
  // 1. Update
  console.log("Updating RS430...");
  const updateRes = await fetch(`${supabaseUrl}/rest/v1/employees?id=eq.${empId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation' // Let's try this to see if it returns error or updated row!
    },
    body: JSON.stringify({ team: 'ETDA Call Center' })
  });
  
  console.log("Update status:", updateRes.status);
  const updateText = await updateRes.text();
  console.log("Update response text:", updateText);

  // 2. Fetch with cache buster
  const cb = Date.now();
  const fetchRes = await fetch(`${supabaseUrl}/rest/v1/employees?id=eq.${empId}&select=id,name,team&cb=${cb}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  console.log("Fetch status:", fetchRes.status);
  console.log("Fetch response:", await fetchRes.json());
}

testSingleUpdate();
