const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function run() {
  const payload = {
    id: 'TEST_' + Date.now(),
    name: 'Test User',
    type: 'ลาป่วย',
    start_date: '2026-07-06',
    end_date: '2026-07-06',
    days: 1,
    note: 'Test note'
  };

  const res = await fetch(`${supabaseUrl}/rest/v1/leave_requests`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  console.log('Status:', res.status);
  console.log('OK:', res.ok);
  try {
    console.log('Body:', await res.text());
  } catch(e) {
    console.log(e);
  }
}

run();
