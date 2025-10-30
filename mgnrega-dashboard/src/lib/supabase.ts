import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface District {
  id: number;
  state_code: string;
  state_name: string;
  district_code: string;
  district_name: string;
}

export interface DistrictPerformance {
  id: number;
  fin_year: string;
  month: string;
  state_code: string;
  state_name: string;
  district_code: string;
  district_name: string;
  
  // Using exact column names from CSV
  Approved_Labour_Budget: number;
  Average_Wage_rate_per_day_per_person: number;
  Average_days_of_employment_provided_per_Household: number;
  Differently_abled_persons_worked: number;
  Material_and_skilled_Wages: number;
  Number_of_Completed_Works: number;
  Number_of_GPs_with_NIL_exp: number;
  Number_of_Ongoing_Works: number;
  Persondays_of_Central_Liability_so_far: number;
  SC_persondays: number;
  SC_workers_against_active_workers: number;
  ST_persondays: number;
  ST_workers_against_active_workers: number;
  Total_Adm_Expenditure: number;
  Total_Exp: number;
  Total_Households_Worked: number;
  Total_Individuals_Worked: number;
  Total_No_of_Active_Job_Cards: number;
  Total_No_of_Active_Workers: number;
  Total_No_of_HHs_completed_100_Days_of_Wage_Employment: number;
  Total_No_of_JobCards_issued: number;
  Total_No_of_Workers: number;
  Total_No_of_Works_Takenup: number;
  Wages: number;
  Women_Persondays: number;
  percent_of_Category_B_Works: number;
  percent_of_Expenditure_on_Agriculture_Allied_Works: number;
  percent_of_NRM_Expenditure: number;
  percentage_payments_gererated_within_15_days: number;
  Remarks: string;
  
  last_updated: string;
}

export function formatNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`; // Crores
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`; // Lakhs
  if (num >= 1000) return `${(num / 1000).toFixed(2)} K`; // Thousands
  return num.toFixed(0);
}

export function formatCurrency(num: number): string {
  return `₹${formatNumber(num)}`;
}

export function formatNumberForSpeech(num: number): string {
  if (num === 0) return 'shoonya'; // zero
  let absNum = Math.abs(num);
  if (absNum >= 100000) {
    absNum = Math.round(absNum / 1000) * 1000;
  } else if (absNum >= 1000) {
    absNum = Math.round(absNum / 100) * 100;
  }
  let text = '';
  
  if (absNum >= 10000000) {
    const crores = Math.floor(absNum / 10000000);
    const remainderLakhs = Math.round((absNum % 10000000) / 100000);
    
    text += `${crores} Crore`;
    if (remainderLakhs > 0) {
      text += ` ${remainderLakhs} Lakh`;
    }
  } else if (absNum >= 100000) {
    const lakhs = Math.floor(absNum / 100000);
    const remainderThousands = Math.round((absNum % 100000) / 1000);
    
    text += `${lakhs} Lakh`;
    if (remainderThousands > 0) {
      text += ` ${remainderThousands} Hazaar`;
    }
  } else if (absNum >= 1000) {
    const thousands = Math.floor(absNum / 1000);
    const remainder = Math.round(absNum % 1000);

    text += `${thousands} Hazaar`;
    if (remainder > 0) {
      text += ` ${remainder}`;
    }
  } else {
    text = absNum.toFixed(0);
  }
  
  if (num === absNum) {
      return text.trim();
  }
  
  return (num < 0 ? 'minus ' : '') + text.trim();
}



export function numberToHindiWords(num: number): string {
  let absNum = Math.abs(num); 
  
  if (absNum >= 100000) {
    absNum = Math.round(absNum / 1000) * 1000;
  } else if (absNum >= 1000) {
    absNum = Math.round(absNum / 100) * 100;
  }
  if (absNum === 0) return 'shunya'; 
  
  let words = '';
  if (absNum >= 10000000) {
    const crores = Math.floor(absNum / 10000000);
    words += `${numberToWordsUnder100(crores)} crore `;
    const remainder = absNum % 10000000;
    if (remainder >= 100000) {
      const lakhs = Math.floor(remainder / 100000);
      words += `${numberToWordsUnder100(lakhs)} lakh `;
      const finalRemainder = remainder % 100000;
      if (finalRemainder >= 1000) {
        const thousands = Math.floor(finalRemainder / 1000);
        words += `${numberToWordsUnder100(thousands)} hazaar `;
        const lastDigits = finalRemainder % 1000;
        if (lastDigits > 0) {
          words += `${numberToWordsUnder1000(lastDigits)} `;
        }
      }
    }
  }
  // Lakhs (100,000)
  else if (absNum >= 100000) {
    const lakhs = Math.floor(absNum / 100000);
    words += `${numberToWordsUnder100(lakhs)} lakh `;
    const remainder = absNum % 100000;
    if (remainder >= 1000) {
      const thousands = Math.floor(remainder / 1000);
      words += `${numberToWordsUnder100(thousands)} hazaar `;
      const lastDigits = remainder % 1000;
      if (lastDigits > 0) {
        words += `${numberToWordsUnder1000(lastDigits)} `;
      }
    }
  }
  else if (absNum >= 1000) {
    const thousands = Math.floor(absNum / 1000);
    words += `${numberToWordsUnder100(thousands)} hazaar `;
    const remainder = absNum % 1000;
    if (remainder > 0) {
      words += `${numberToWordsUnder1000(remainder)} `;
    }
  }
  else {
    words = numberToWordsUnder1000(absNum);
  }
  
  return words.trim();
}

function numberToWordsUnder100(num: number): string {
  const ones = ['', 'ek', 'do', 'teen', 'chaar', 'paanch', 'chhey', 'saat', 'aath', 'nau'];
  const teens = ['das', 'gyarah', 'barah', 'terah', 'chaudah', 'pandrah', 'solah', 'satrah', 'atharah', 'unees'];
  const tens = ['', '', 'bees', 'tees', 'chaalees', 'pachaas', 'saath', 'sattar', 'assi', 'nabbe'];
  
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  
  const tenDigit = Math.floor(num / 10);
  const oneDigit = num % 10;
  
  const special: { [key: number]: string } = {
    21: 'ikkees', 22: 'baees', 23: 'teyees', 24: 'chaubees', 25: 'pachchees',
    26: 'chhabbees', 27: 'sattaees', 28: 'atthaees', 29: 'untees',
    31: 'iktees', 32: 'battees', 33: 'taintees', 34: 'chautees', 35: 'paintees',
    36: 'chhattees', 37: 'sayntees', 38: 'adtees', 39: 'untaalees',
    41: 'iktaalees', 42: 'bayaalees', 43: 'taintaalees', 44: 'chavaalees', 45: 'paintaalees',
    46: 'chhiyaalees', 47: 'sayntaalees', 48: 'adtaalees', 49: 'unchaas',
    51: 'ikyaavan', 52: 'baavan', 53: 'tirpan', 54: 'chauvan', 55: 'pachpan',
    56: 'chhappan', 57: 'sattaavan', 58: 'athavan', 59: 'unsath',
    61: 'iksath', 62: 'baasath', 63: 'tirsath', 64: 'chausath', 65: 'painsath',
    66: 'chhiyaasath', 67: 'sadsath', 68: 'adsath', 69: 'unhattar',
    71: 'ikhattar', 72: 'bahattar', 73: 'tihattar', 74: 'chauhattar', 75: 'pachhattar',
    76: 'chhihattar', 77: 'satattar', 78: 'athattar', 79: 'unassi',
    81: 'ikyaasi', 82: 'bayaasi', 83: 'tiraasi', 84: 'chauraasi', 85: 'panchaasi',
    86: 'chhiyaasi', 87: 'sataasi', 88: 'athaasi', 89: 'navasi',
    91: 'ikyaanve', 92: 'baanve', 93: 'tiraanve', 94: 'chauraanve', 95: 'panchaanve',
    96: 'chhiyaanve', 97: 'sataanve', 98: 'athaanve', 99: 'ninyaanve'
  };
  
  if (special[num]) return special[num];
  
  return oneDigit === 0 ? tens[tenDigit] : `${tens[tenDigit]} ${ones[oneDigit]}`;
}

function numberToWordsUnder1000(num: number): string {
  if (num < 100) return numberToWordsUnder100(num);
  
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  
  const ones = ['', 'ek', 'do', 'teen', 'chaar', 'paanch', 'chhey', 'saat', 'aath', 'nau'];
  let words = `${ones[hundreds]} sau`;
  
  if (remainder > 0) {
    words += ` ${numberToWordsUnder100(remainder)}`;
  }
  
  return words;
}