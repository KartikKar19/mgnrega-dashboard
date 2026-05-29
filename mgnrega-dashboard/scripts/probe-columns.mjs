import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './.env.local' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test(name) {
  const quoteName = `"${name}"`;
  const { data, error, status } = await supabase.from('district_performance').select(quoteName).limit(1);
  console.log(name, status, error ? error.message : null, data);
}

const names = [
  'district_code', 'District_Code', 'DISTRICT_CODE',
  'district_name', 'District_Name', 'DISTRICT_NAME',
  'state_code', 'State_Code', 'STATE_CODE',
  'state_name', 'State_Name', 'STATE_NAME',
  'fin_year', 'Fin_Year', 'FIN_YEAR',
  'Approved_Labour_Budget', 'approved_labour_budget', 'APPROVED_LABOUR_BUDGET'
];

for (const name of names) {
  await test(name);
}
