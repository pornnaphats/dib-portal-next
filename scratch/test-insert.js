const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

const bodyPayload = {
  id: 'RS999',
  name: 'ทดสอบ ระบบทีมใหม่',
  name_en: 'Test New Team',
  nickname: 'เทส',
  email: 'test@realsmart.co.th',
  birthdate: '10/10/2540',
  position: 'Junior',
  team: 'New Team Test',
  shift: '09:00 - 18:00',
  dayoff: 'เสาร์ - อาทิตย์',
  status: 'active',
  emp_type: 'พนักงานประจำ'
};

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/employees`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(bodyPayload)
  });
  console.log('Status:', res.status);
  console.log('OK:', res.ok);
  const text = await res.text();
  console.log('Response:', text);
}

run().catch(console.error);
