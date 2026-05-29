import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './.env.local' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { count, error, status } = await supabase
    .from('district_names')
    .select('*', { count: 'exact', head: true });
  console.log('district_names count result:', { status, error, count });
}

main().catch(console.error);
