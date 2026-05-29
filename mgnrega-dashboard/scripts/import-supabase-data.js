import fs from 'fs';
import readline from 'readline';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

let csvPath = null;
let limitRows = -1;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--limit') {
    limitRows = parseInt(args[i + 1], 10);
    i++;
  } else {
    csvPath = args[i];
  }
}

if (!csvPath) {
  csvPath = process.env.CSV_PATH || path.resolve(process.cwd(), '../raw_mgnrega_data.csv');
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


const numericFields = new Set([
  'approved_labour_budget',
  'persondays_of_central_liability_so_far',
  'percentage_payments_gererated_within_15_days',
  'total_no_of_active_workers',
  'total_no_of_workers'
]);

const HINDI_DISTRICTS_MAP = {
  "araria": "अररिया",
  "arwal": "अरवल",
  "aurangabad": "औरंगाबाद",
  "banka": "बांका",
  "begusarai": "बेगूसराय",
  "bhagalpur": "भागलपुर",
  "bhojpur": "भोजपुर",
  "buxar": "बक्सर",
  "darbhanga": "दरभंगा",
  "gaya": "गया",
  "gopalganj": "गोपालगंज",
  "jamui": "जमुई",
  "jehanabad": "जहानाबाद",
  "kaimur": "कैमूर",
  "katihar": "कटिहार",
  "khagaria": "खगड़िया",
  "kishanganj": "किशनगंज",
  "lakhisarai": "लखीसराय",
  "madhepura": "मधेपुरा",
  "madhubani": "मधुबनी",
  "munger": "मुंगेर",
  "muzaffarpur": "मुजफ्फरपुर",
  "nalanda": "नालंदा",
  "nawada": "नवादा",
  "patna": "पटना",
  "purnia": "पूर्णिया",
  "rohtas": "रोहतास",
  "saharsa": "सहरसा",
  "samastipur": "समस्तीपुर",
  "saran": "सारण",
  "sheikhpura": "शेखपुरा",
  "sheohar": "शिवहर",
  "sitamarhi": "सीतामढ़ी",
  "siwan": "सीवान",
  "supaul": "सुपौल",
  "vaishali": "वैशाली",
  "west champaran": "पश्चिम चम्पारण",
  "east champaran": "पूर्वी चम्पारण"
};

function getHindiDistrictName(englishName) {
  if (!englishName) return '';
  const cleanName = englishName.trim().toLowerCase();
  
  // Try direct lookup
  if (HINDI_DISTRICTS_MAP[cleanName]) {
    return HINDI_DISTRICTS_MAP[cleanName];
  }
  
  // Phonetic rules fallback
  const rules = [
    { eng: 'bh', hin: 'भ' },
    { eng: 'ch', hin: 'च' },
    { eng: 'dh', hin: 'ध' },
    { eng: 'gh', hin: 'घ' },
    { eng: 'jh', hin: 'झ' },
    { eng: 'kh', hin: 'ख' },
    { eng: 'ph', hin: 'फ' },
    { eng: 'sh', hin: 'श' },
    { eng: 'th', hin: 'थ' },
    { eng: 'zh', hin: 'झ' },
    { eng: 'a', hin: 'ा' },
    { eng: 'b', hin: 'ब' },
    { eng: 'c', hin: 'क' },
    { eng: 'd', hin: 'द' },
    { eng: 'e', hin: 'े' },
    { eng: 'f', hin: 'फ' },
    { eng: 'g', hin: 'ग' },
    { eng: 'h', hin: 'ह' },
    { eng: 'i', hin: 'ि' },
    { eng: 'j', hin: 'ज' },
    { eng: 'k', hin: 'क' },
    { eng: 'l', hin: 'ल' },
    { eng: 'm', hin: 'म' },
    { eng: 'n', hin: 'न' },
    { eng: 'o', hin: 'ो' },
    { eng: 'p', hin: 'प' },
    { eng: 'q', hin: 'क' },
    { eng: 'r', hin: 'र' },
    { eng: 's', hin: 'स' },
    { eng: 't', hin: 'त' },
    { eng: 'u', hin: 'ु' },
    { eng: 'v', hin: 'व' },
    { eng: 'w', hin: 'व' },
    { eng: 'x', hin: 'क्स' },
    { eng: 'y', hin: 'य' },
    { eng: 'z', hin: 'ज़' }
  ];
  
  let result = '';
  let i = 0;
  const name = cleanName;
  
  while (i < name.length) {
    let matched = false;
    for (const rule of rules) {
      if (rule.eng.length === 2 && name.substring(i, i + 2) === rule.eng) {
        let ch = rule.hin;
        if (i === 0) {
          if (rule.eng === 'a') ch = 'अ';
        }
        result += ch;
        i += 2;
        matched = true;
        break;
      }
    }
    if (!matched) {
      for (const rule of rules) {
        if (rule.eng.length === 1 && name[i] === rule.eng) {
          let ch = rule.hin;
          if (i === 0) {
            if (rule.eng === 'a') ch = 'अ';
            else if (rule.eng === 'i') ch = 'इ';
            else if (rule.eng === 'u') ch = 'उ';
            else if (rule.eng === 'e') ch = 'ए';
            else if (rule.eng === 'o') ch = 'ओ';
          }
          result += ch;
          i += 1;
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      result += name[i];
      i += 1;
    }
  }
  
  return result.charAt(0).toUpperCase() + result.slice(1);
}

const monthMap = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  january: '01', february: '02', march: '03', april: '04', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
};

function getReportingMonth(finYear, monthStr) {
  const cleanMonth = String(monthStr).trim().toLowerCase();
  const mm = monthMap[cleanMonth] || '01';
  
  const years = String(finYear).match(/\d{4}/g);
  if (!years || years.length === 0) {
    return '2024-01-01';
  }
  const yearStart = parseInt(years[0], 10);
  const yearEnd = years[1] ? parseInt(years[1], 10) : yearStart + 1;
  
  const monthNum = parseInt(mm, 10);
  const calendarYear = monthNum >= 4 ? yearStart : yearEnd;
  
  return `${calendarYear}-${mm}-01`;
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function parseNumeric(value) {
  if (value === undefined || value === null) return 0;
  const cleaned = String(value).trim().replace(/,/g, '');
  if (cleaned === '' || /^NA$/i.test(cleaned)) return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeKey(key) {
  return key.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, '_');
}

function normalizeRow(values, headers) {
  const row = {};

  for (let index = 0; index < headers.length; index++) {
    const originalHeader = headers[index] || '';
    const normalizedHeader = normalizeKey(originalHeader);
    if (!normalizedHeader) continue;
    const raw = values[index] === undefined ? '' : values[index].trim();

    row[normalizedHeader] = numericFields.has(normalizedHeader)
      ? parseNumeric(raw)
      : raw === 'NA'
      ? null
      : raw;
  }

  return row;
}

async function readCsvRows(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let headers = null;
  const rows = [];
  let count = 0;

  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }

    if (!line.trim()) continue;

    const values = parseCsvLine(line);
    const row = normalizeRow(values, headers);
    rows.push(row);
    count++;

    if (limitRows > 0 && count >= limitRows) {
      break;
    }
  }

  return rows;
}

function buildPerformanceRow(row) {
  const target = row.approved_labour_budget ? parseNumeric(row.approved_labour_budget) : 0;
  const achieved = row.persondays_of_central_liability_so_far ? parseNumeric(row.persondays_of_central_liability_so_far) : 0;
  
  // Cap timeliness percentage at 100.0 to prevent DB overflow from anomalous CSV values
  const rawTimeliness = row.percentage_payments_gererated_within_15_days ? parseNumeric(row.percentage_payments_gererated_within_15_days) : 0;
  const timeliness = Math.min(rawTimeliness, 100);
  
  const fund_utilization_pct = target > 0 ? Math.min((achieved / target) * 100, 100) : 0;
  const avgGrade = (timeliness + fund_utilization_pct) / 2;
  const gradeOutof10 = avgGrade / 10;
  const overall_grade = Number(Math.min(gradeOutof10, 9.9).toFixed(1));

  return {
    district_name_en: row.district_name || '',
    district_name_hi: getHindiDistrictName(row.district_name),
    reporting_month: getReportingMonth(row.fin_year, row.month),
    persondays_target: target,
    persondays_achieved: achieved,
    wage_payment_timeliness_pct: timeliness,
    fund_utilization_pct: fund_utilization_pct,
    overall_grade: overall_grade,
    work_demand: row.total_no_of_active_workers ? parseNumeric(row.total_no_of_active_workers) : 0,
    work_allocated: row.total_no_of_workers ? parseNumeric(row.total_no_of_workers) : 0
  };
}

function buildDistrictRow(row) {
  return {
    district_name_en: row.district_name || '',
    district_name_hi: getHindiDistrictName(row.district_name),
  };
}

async function importData() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Reading CSV rows from', csvPath);
  if (limitRows > 0) {
    console.log(`Limiting parsing to first ${limitRows} rows.`);
  }
  const csvRows = await readCsvRows(csvPath);
  console.log(`Parsed ${csvRows.length} rows from CSV.`);

  const districtsMap = new Map();
  const performanceMap = new Map();

  for (const row of csvRows) {
    if (!row.district_name) continue;
    const districtKey = row.district_name.trim().toLowerCase();
    if (!districtsMap.has(districtKey)) {
      districtsMap.set(districtKey, buildDistrictRow(row));
    }
    const perfRow = buildPerformanceRow(row);
    const perfKey = `${perfRow.district_name_en.toLowerCase()}|${perfRow.reporting_month}`;
    performanceMap.set(perfKey, perfRow);
  }

  const performanceRows = Array.from(performanceMap.values());
  const districtRows = Array.from(districtsMap.values());
  console.log(`Found ${districtRows.length} unique districts and ${performanceRows.length} unique performance records.`);

  console.log('Clearing existing performance data...');
  const deletePerformance = await supabase.from('district_performance').delete().neq('id', 0);
  if (deletePerformance.error) {
    console.error('Error deleting existing performance rows:', deletePerformance.error.message || deletePerformance.error);
  }

  async function tableExists(tableName) {
    const { error } = await supabase.from(tableName).select('district_name_en').limit(1);
    if (!error) return true;
    if (error.message?.includes("Could not find the table 'public.")) {
      return false;
    }
    // Try a simple select of any column to check if missing
    return false;
  }

  const hasDistrictsTable = await tableExists('districts');
  if (hasDistrictsTable) {
    console.log('Upserting districts...');
    const districtsResult = await supabase.from('districts').upsert(districtRows, { onConflict: 'district_name_en' });
    if (districtsResult.error) {
      console.error('Error upserting districts:', districtsResult.error.message || districtsResult.error);
      process.exit(1);
    }
  } else {
    console.log('Skipping districts upsert because the `districts` table does not exist.');
  }

  const hasDistrictNamesTable = await tableExists('district_names');
  if (hasDistrictNamesTable) {
    console.log('Clearing existing district_names...');
    const deleteDistNames = await supabase.from('district_names').delete().neq('district_name_en', '');
    if (deleteDistNames.error) {
      console.error('Error clearing district_names:', deleteDistNames.error.message || deleteDistNames.error);
    }
    
    console.log('Inserting unique districts into district_names...');
    const dBatchSize = 100;
    for (let i = 0; i < districtRows.length; i += dBatchSize) {
      const batch = districtRows.slice(i, i + dBatchSize);
      const districtsResult = await supabase.from('district_names').insert(batch);
      if (districtsResult.error) {
        console.error('Error inserting unique districts into district_names:', districtsResult.error.message || districtsResult.error);
        process.exit(1);
      }
    }
  } else {
    console.log('Skipping district_names upsert because the `district_names` table does not exist.');
  }

  console.log('Inserting performance rows in batches...');
  const batchSize = 200;
  for (let i = 0; i < performanceRows.length; i += batchSize) {
    const batch = performanceRows.slice(i, i + batchSize);
    const insertResult = await supabase.from('district_performance').insert(batch);
    if (insertResult.error) {
      console.error('Error inserting batch', i, insertResult.error.message || insertResult.error);
      process.exit(1);
    }
    process.stdout.write(`Inserted ${i + batch.length}/${performanceRows.length}\r`);
  }

  console.log(`\nImport complete! Inserted ${performanceRows.length} performance rows and ${districtRows.length} districts.`);
}

importData().catch((error) => {
  console.error('Import script failed:', error);
  process.exit(1);
});
