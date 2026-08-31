const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function updateTeams() {
  console.log("Fetching current employees...");
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

  // Find employees with team 'Call Center'
  const callCenterEmps = emps.filter(e => e.team === 'Call Center');
  console.log(`Found ${callCenterEmps.length} employees with team 'Call Center'.`);

  // Find employees with team 'Call Center OR'
  const callCenterOrEmps = emps.filter(e => e.team === 'Call Center OR');
  console.log(`Found ${callCenterOrEmps.length} employees with team 'Call Center OR'.`);

  // Update Call Center -> ETDA Call Center
  if (callCenterEmps.length > 0) {
    console.log("Updating 'Call Center' -> 'ETDA Call Center'...");
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/employees?team=eq.Call%20Center`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ team: 'ETDA Call Center' })
    });
    console.log("Update Call Center Status:", updateRes.status);
    console.log("Update Call Center Response:", await updateRes.text());
  }

  // Update Call Center OR -> OR Call Center
  if (callCenterOrEmps.length > 0) {
    console.log("Updating 'Call Center OR' -> 'OR Call Center'...");
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/employees?team=eq.Call%20Center%20OR`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ team: 'OR Call Center' })
    });
    console.log("Update Call Center OR Status:", updateRes.status);
    console.log("Update Call Center OR Response:", await updateRes.text());
  }

  // Update org_structure table as well
  console.log("Fetching org structure...");
  const structRes = await fetch(`${supabaseUrl}/rest/v1/org_structure?id=eq.default`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (structRes.ok) {
    const structData = await structRes.json();
    if (structData && structData[0]) {
      let struct = structData[0].structure;
      if (typeof struct === 'string') {
        struct = JSON.parse(struct);
      }
      
      let changed = false;
      function renameNode(node) {
        if (node.title === 'Call Center') {
          node.title = 'ETDA Call Center';
          changed = true;
        }
        if (node.dept === 'Call Center') {
          node.dept = 'ETDA Call Center';
          changed = true;
        }
        if (node.title === 'Call Center OR') {
          node.title = 'OR Call Center';
          changed = true;
        }
        if (node.dept === 'Call Center OR') {
          node.dept = 'OR Call Center';
          changed = true;
        }
        if (node.children) {
          node.children.forEach(renameNode);
        }
      }
      
      renameNode(struct);
      
      if (changed) {
        console.log("Updating org structure in DB...");
        const updateStructRes = await fetch(`${supabaseUrl}/rest/v1/org_structure?id=eq.default`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ structure: struct })
        });
        console.log("Update Org Structure Status:", updateStructRes.status, await updateStructRes.text());
      }
    }
  }
}

updateTeams();
