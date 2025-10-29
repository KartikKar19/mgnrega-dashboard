import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching your CSV structure
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

// Helper function to format numbers for display
export function formatNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`; // Crores
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`; // Lakhs
  if (num >= 1000) return `${(num / 1000).toFixed(2)} K`; // Thousands
  return num.toFixed(0);
}

// Helper to format currency
export function formatCurrency(num: number): string {
  return `₹${formatNumber(num)}`;
}

// 🟢 NEW: Helper function to format numbers into Hindi text for speech (Lakhs/Crores)
export function formatNumberForSpeech(num: number): string {
  if (num === 0) return 'shoonya'; // zero

  // Use absolute value for calculation, append negative sign later if needed
  const absNum = Math.abs(num);
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
  
  // Prepend "Rupay" for currency
  if (num === absNum) {
      // Clean up extra spaces
      return text.trim();
  }
  
  return (num < 0 ? 'minus ' : '') + text.trim();
}