const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateWithClient() {
  console.log("Fetching RS430 using Supabase client...");
  const { data: selectData, error: selectError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', 'RS430');

  if (selectError) {
    console.error("Select error:", selectError);
    return;
  }
  console.log("Select data:", selectData);

  console.log("Updating RS430 using Supabase client...");
  const { data: updateData, error: updateError } = await supabase
    .from('employees')
    .update({ team: 'ETDA Call Center' })
    .eq('id', 'RS430')
    .select();

  if (updateError) {
    console.error("Update error:", updateError);
    return;
  }
  console.log("Update response data:", updateData);
}

updateWithClient();
