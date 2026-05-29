import type { District, DistrictPerformance } from '../lib/supabase';

export const FALLBACK_DISTRICTS: District[] = [
  { district_name_en: 'BENGALURU', district_name_hi: 'बेंगलुरु' },
  { district_name_en: 'BENGALURU RURAL', district_name_hi: 'बेंगलुरु ग्रामीण' },
  { district_name_en: 'PATNA', district_name_hi: 'पटना' },
  { district_name_en: 'GAYA', district_name_hi: 'गया' },
  { district_name_en: 'DARBHANGA', district_name_hi: 'दरभंगा' },
  { district_name_en: 'MUZAFFARPUR', district_name_hi: 'मुजफ्फरपुर' },
  { district_name_en: 'PUNE', district_name_hi: 'पुणे' },
  { district_name_en: 'NAGPUR', district_name_hi: 'नागपुर' },
  { district_name_en: 'NASHIK', district_name_hi: 'नाशिक' },
  { district_name_en: 'THANE', district_name_hi: 'ठाणे' },
  { district_name_en: 'AURANGABAD', district_name_hi: 'औरंगाबाद' },
  { district_name_en: 'JAIPUR', district_name_hi: 'जयपुर' },
  { district_name_en: 'JODHPUR', district_name_hi: 'जोधपुर' },
  { district_name_en: 'UDAIPUR', district_name_hi: 'उदयपुर' },
  { district_name_en: 'KOTA', district_name_hi: 'कोटा' },
  { district_name_en: 'AJMER', district_name_hi: 'अजमेर' },
  { district_name_en: 'LUCKNOW', district_name_hi: 'लखनऊ' },
  { district_name_en: 'VARANASI', district_name_hi: 'वाराणसी' },
  { district_name_en: 'KANPUR', district_name_hi: 'कानपुर' },
  { district_name_en: 'AGRA', district_name_hi: 'आगरा' },
  { district_name_en: 'PRAYAGRAJ', district_name_hi: 'प्रयागराज' },
  { district_name_en: 'BHOPAL', district_name_hi: 'भोपाल' },
  { district_name_en: 'INDORE', district_name_hi: 'इंदौर' },
  { district_name_en: 'GWALIOR', district_name_hi: 'ग्वालियर' },
  { district_name_en: 'JABALPUR', district_name_hi: 'जबलपुर' },
  { district_name_en: 'RAIPUR', district_name_hi: 'रायपुर' },
  { district_name_en: 'BILASPUR', district_name_hi: 'बिलासपुर' },
  { district_name_en: 'RANCHI', district_name_hi: 'रांची' },
  { district_name_en: 'JAMSHEDPUR', district_name_hi: 'जमशेदपुर' },
  { district_name_en: 'DHANBAD', district_name_hi: 'धनबाद' },
  { district_name_en: 'AHMEDABAD', district_name_hi: 'अहमदाबाद' },
  { district_name_en: 'SURAT', district_name_hi: 'सूरत' },
  { district_name_en: 'VADODARA', district_name_hi: 'वडोदरा' },
  { district_name_en: 'RAJKOT', district_name_hi: 'राजकोट' },
  { district_name_en: 'CHENNAI', district_name_hi: 'चेन्नई' },
  { district_name_en: 'COIMBATORE', district_name_hi: 'कोइम्बटूर' },
  { district_name_en: 'MADURAI', district_name_hi: 'मदुरै' },
  { district_name_en: 'SALEM', district_name_hi: 'सलेम' },
  { district_name_en: 'HYDERABAD', district_name_hi: 'हैदराबाद' },
  { district_name_en: 'WARANGAL', district_name_hi: 'वरंगल' },
  { district_name_en: 'NIZAMABAD', district_name_hi: 'निजामाबाद' },
  { district_name_en: 'VISAKHAPATNAM', district_name_hi: 'विशाखापत्तनम' },
  { district_name_en: 'VIJAYAWADA', district_name_hi: 'विजयवाड़ा' },
  { district_name_en: 'GUNTUR', district_name_hi: 'गुंटूर' },
  { district_name_en: 'NELLORE', district_name_hi: 'नेलोर' },
  { district_name_en: 'AMRITSAR', district_name_hi: 'अमृतसर' },
  { district_name_en: 'LUDHIANA', district_name_hi: 'लुधियाना' },
  { district_name_en: 'JALANDHAR', district_name_hi: 'जालंधर' },
  { district_name_en: 'PATIALA', district_name_hi: 'पटियाला' },
  { district_name_en: 'BATHINDA', district_name_hi: 'बठिंडा' }
];

export function getFallbackPerformance(districtNameEn: string): DistrictPerformance[] {
  const normalized = districtNameEn.toUpperCase().trim();
  const district = FALLBACK_DISTRICTS.find(d => d.district_name_en === normalized);
  if (!district) return [];

  // Deterministic seed based on district name to generate realistic data variation
  let seed = 0;
  for (let i = 0; i < normalized.length; i++) {
    seed += normalized.charCodeAt(i);
  }

  const months = [
    { name: 'Nov', date: '2024-11-01' },
    { name: 'Oct', date: '2024-10-01' },
    { name: 'Sep', date: '2024-09-01' },
    { name: 'Aug', date: '2024-08-01' },
    { name: 'Jul', date: '2024-07-01' },
    { name: 'Jun', date: '2024-06-01' },
  ];

  return months.map((m, idx) => {
    const baseTarget = 12000 + (seed % 8000);
    const persondays_target = Math.round(baseTarget * (1 - idx * 0.04));
    const persondays_achieved = Math.round(persondays_target * (0.65 + ((seed + idx) % 28) / 100));
    
    // Vary timeliness realistically
    const timelinessBase = 70 + (seed % 20);
    const wage_payment_timeliness_pct = Math.min(timelinessBase + ((idx * 3) % 10), 100);
    
    const fund_utilization_pct = Math.min((persondays_achieved / persondays_target) * 100, 100);
    
    const avgGrade = (wage_payment_timeliness_pct + fund_utilization_pct) / 2;
    const overall_grade = Number(Math.min(avgGrade / 10, 9.9).toFixed(1));
    
    const work_demand = Math.round(persondays_achieved * 0.14);
    const work_allocated = Math.round(work_demand * (0.88 + ((seed - idx) % 12) / 100));

    return {
      id: seed + idx,
      district_name_en: district.district_name_en,
      district_name_hi: district.district_name_hi,
      reporting_month: m.date,
      overall_grade,
      persondays_target,
      persondays_achieved,
      wage_payment_timeliness_pct,
      fund_utilization_pct,
      work_demand,
      work_allocated
    };
  });
}
