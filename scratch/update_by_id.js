const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function updateById() {
  const idsToEtda = [
    'RS430', 'RS426', 'RS434', 'RS442', 'RS452', 'RS453', 'RS454', 'RS459',
    'RS488', 'RS511', 'RS530', 'RS538', 'RS539', 'RS543', 'RS549', 'RS554', 'RS555'
  ];
  
  const idsToOr = [
    'RS728'
  ];

  console.log("Updating Call Center employees to ETDA Call Center by ID...");
  for (const id of idsToEtda) {
    const res = await fetch(`${supabaseUrl}/rest/v1/employees?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ team: 'ETDA Call Center' })
    });
    console.log(`Update ${id}: status = ${res.status}`);
  }

  console.log("Updating Call Center OR employees to OR Call Center by ID...");
  for (const id of idsToOr) {
    const res = await fetch(`${supabaseUrl}/rest/v1/employees?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ team: 'OR Call Center' })
    });
    console.log(`Update ${id}: status = ${res.status}`);
  }
}

updateById();
