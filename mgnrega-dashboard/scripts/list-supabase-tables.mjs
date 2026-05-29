import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const main = async () => {
  const { data, error } = await supabase.from('information_schema.tables').select('table_schema,table_name').eq('table_schema', 'public').limit(200);
  console.log('error:', error);
  console.log('count:', data?.length);
  console.log(JSON.stringify(data, null, 2));
};

main().catch(err => {
  console.error('fatal:', err);
  process.exit(1);
});
