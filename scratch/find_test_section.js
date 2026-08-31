const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

async function findTestSection() {
  const res = await fetch(`${supabaseUrl}/rest/v1/holiday_shifts?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (res.ok) {
    const shifts = await res.json();
    console.log("All holiday shifts total:", shifts.length);
    const testShifts = shifts.filter(s => 
      (s.section && s.section.toLowerCase().includes('test')) || 
      (s.holiday_name && s.holiday_name.toLowerCase().includes('test'))
    );
    console.log("Found shifts matching 'test':", JSON.stringify(testShifts, null, 2));
  } else {
    console.log("Failed to fetch shifts:", await res.text());
  }
}
findTestSection();
