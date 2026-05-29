import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './.env.local' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const tables = ['districts', 'district_performance', 'district_names'];

const main = async () => {
  for (const table of tables) {
    const { data, error, status } = await supabase.from(table).select('id').limit(1);
    console.log(table, { status, error: error ? error.message : null, dataLength: data?.length });
  }
};

main().catch(err => { console.error(err); process.exit(1); });
