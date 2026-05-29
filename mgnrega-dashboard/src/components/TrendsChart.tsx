import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DistrictPerformance } from '../lib/supabase';
import { formatNumber } from '../lib/supabase';

interface Props {
  data: DistrictPerformance[];
  language: 'en' | 'hi' | 'pa' | 'bn' | 'ta' | 'te' | 'gu' | 'mr' | 'kn';
}

const getPeriodLabel = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const year = parts[0].substring(2); // '24' from '2024'
  const monthNum = parseInt(parts[1], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[monthNum - 1] || 'Jan'} '${year}`;
};

const TrendsChart: React.FC<Props> = ({ data, language }) => {
  const translations = {
    hi: {
      chart1Title: 'कार्य मांग और आवंटन प्रवृत्ति',
      chart1TitleSub: 'Work Demand & Allocation Trend',
      chart2Title: 'कार्य दिवस: प्राप्त बनाम लक्ष्य',
      chart2TitleSub: 'Persondays Achieved vs Target',
      chart3Title: 'भुगतान समयबद्धता और निधि उपयोगिता',
      chart3TitleSub: 'Timeliness & Utilization Trend',
      workDemand: 'कार्य की मांग (परिवार)',
      workAllocated: 'काम का आवंटन (परिवार)',
      persondaysTarget: 'लक्ष्य कार्य दिवस',
      persondaysAchieved: 'प्राप्त कार्य दिवस',
      timeliness: 'समय पर भुगतान %',
      utilization: 'निधि उपयोगिता %',
      period: 'अवधि'
    },
    en: {
      chart1Title: 'Work Demand & Allocation Trend',
      chart1TitleSub: 'कार्य मांग और आवंटन प्रवृत्ति',
      chart2Title: 'Persondays Achieved vs Target',
      chart2TitleSub: 'कार्य दिवस: प्राप्त बनाम लक्ष्य',
      chart3Title: 'Timeliness & Utilization Trend',
      chart3TitleSub: 'भुगतान समयबद्धता और निधि उपयोगिता',
      workDemand: 'Work Demand (HHs)',
      workAllocated: 'Work Allocated (HHs)',
      persondaysTarget: 'Target Persondays',
      persondaysAchieved: 'Achieved Persondays',
      timeliness: 'Wage Payment Timeliness %',
      utilization: 'Fund Utilization %',
      period: 'Period'
    },
    mr: {
      chart1Title: 'कामाची मागणी आणि वाटप कल',
      chart1TitleSub: 'Work Demand & Allocation Trend',
      chart2Title: 'मनुष्यदिवस: लक्ष्य विरुद्ध प्राप्त',
      chart2TitleSub: 'Persondays Achieved vs Target',
      chart3Title: 'वेतन वेळ आणि निधी वापर कल',
      chart3TitleSub: 'Timeliness & Utilization Trend',
      workDemand: 'कामाची मागणी (कुटुंबे)',
      workAllocated: 'काम वाटप (कुटुंबे)',
      persondaysTarget: 'लक्ष्य मनुष्यदिवस',
      persondaysAchieved: 'प्राप्त मनुष्यदिवस',
      timeliness: 'वेळेत वेतन %',
      utilization: 'निधी वापर %',
      period: 'कालावधी'
    },
    kn: {
      chart1Title: 'ಕೆಲಸದ ಬೇಡಿಕೆ ಮತ್ತು ಹಂಚಿಕೆ ಪ್ರವೃತ್ತಿ',
      chart1TitleSub: 'Work Demand & Allocation Trend',
      chart2Title: 'ಮಾನವ ದಿನಗಳು: ಗುರಿ ವಿರುದ್ಧ ಸಾಧನೆ',
      chart2TitleSub: 'Persondays Achieved vs Target',
      chart3Title: 'ವೇತನ ಸಮಯ ಮತ್ತು ಹಣ ಬಳಕೆ ಪ್ರವೃತ್ತಿ',
      chart3TitleSub: 'Timeliness & Utilization Trend',
      workDemand: 'ಕೆಲಸದ ಬೇಡಿಕೆ (ಕುಟುಂಬಗಳು)',
      workAllocated: 'ಕೆಲಸದ ಹಂಚಿಕೆ (ಕುಟುಂಬಗಳು)',
      persondaysTarget: 'ಗುರಿ ಮಾನವ ದಿನಗಳು',
      persondaysAchieved: 'ಸಾಧಿಸಿದ ಮಾನವ ದಿನಗಳು',
      timeliness: 'ಸಮಯಕ್ಕೆ ವೇತನ ಪಾವತಿ %',
      utilization: 'ಹಣ ಬಳಕೆ %',
      period: 'ಅವಧಿ'
    },
    pa: {
      chart1Title: 'ਕੰਮ ਦੀ ਮੰਗ ਅਤੇ ਅਲਾਟਮੈਂਟ ਰੁਝਾਨ',
      chart1TitleSub: 'Work Demand & Allocation Trend',
      chart2Title: 'ਕਾਰਜ ਦਿਵਸ: ਪ੍ਰਾਪਤ ਬਨਾਮ ਨਿਸ਼ਾਨਾ',
      chart2TitleSub: 'Persondays Achieved vs Target',
      chart3Title: 'ਤਨਖਾਹ ਭੁਗਤਾਨ ਅਤੇ ਫੰਡ ਦੀ ਵਰਤੋਂ ਦਾ ਰੁਝਾਨ',
      chart3TitleSub: 'Timeliness & Utilization Trend',
      workDemand: 'ਕੰਮ ਦੀ ਮੰਗ (ਪਰਿਵਾਰ)',
      workAllocated: 'ਕੰਮ ਦੀ ਵੰਡ (ਪਰਿਵਾਰ)',
      persondaysTarget: 'ਨਿਸ਼ਾਨਾ ਕਾਰਜ ਦਿਵਸ',
      persondaysAchieved: 'ਪ੍ਰਾਪਤ ਕਾਰਜ ਦਿਵਸ',
      timeliness: 'ਸਮੇਂ ਸਿਰ ਭੁਗਤਾਨ %',
      utilization: 'ਫੰਡ ਵਰਤੋਂ %',
      period: 'ਸਮਾਂ'
    },
    bn: {
      chart1Title: 'কাজের চাহিদা ও বরাদ্দ প্রবণতা',
      chart1TitleSub: 'Work Demand & Allocation Trend',
      chart2Title: 'কর্মদিবস: অর্জিত বনাম লক্ষ্য',
      chart2TitleSub: 'Persondays Achieved vs Target',
      chart3Title: 'মজুরি প্রদান ও তহবিল ব্যবহার প্রবণতা',
      chart3TitleSub: 'Timeliness & Utilization Trend',
      workDemand: 'কাজের চাহিদা (পরিবার)',
      workAllocated: 'কাজ বরাদ্দ (পরিবার)',
      persondaysTarget: 'লক্ষ্য কর্মদিবস',
      persondaysAchieved: 'অর্জিত কর্মদিবস',
      timeliness: 'সময়মতো মজুরি প্রদান %',
      utilization: 'তহবিল ব্যবহার %',
      period: 'সময়কাল'
    },
    ta: {
      chart1Title: 'வேலை தேவை மற்றும் ஒதுக்கீடு போக்கு',
      chart1TitleSub: 'Work Demand & Allocation Trend',
      chart2Title: 'மனித நாட்கள்: சாதித்தது மற்றும் இலக்கு',
      chart2TitleSub: 'Persondays Achieved vs Target',
      chart3Title: 'ஊதிய காலம் மற்றும் நிதி பயன்பாட்டு போக்கு',
      chart3TitleSub: 'Timeliness & Utilization Trend',
      workDemand: 'வேலை தேவை (குடும்பங்கள்)',
      workAllocated: 'வேலை ஒதுக்கீடு (குடும்பங்கள்)',
      persondaysTarget: 'இலக்கு மனித நாட்கள்',
      persondaysAchieved: 'சாதித்த மனித நாட்கள்',
      timeliness: 'சரியான நேரத்தில் ஊதியம் %',
      utilization: 'நிதி பயன்பாடு %',
      period: 'காலம்'
    },
    te: {
      chart1Title: 'పని డిమాండ్ మరియు కేటాయింపు ట్రెండ్',
      chart1TitleSub: 'Work Demand & Allocation Trend',
      chart2Title: 'పనిదినాలు: సాధించినవి వర్సెస్ లక్ష్యం',
      chart2TitleSub: 'Persondays Achieved vs Target',
      chart3Title: 'చెల్లింపుల సమయం మరియు నిధుల వినియోగం ట్రెండ్',
      chart3TitleSub: 'Timeliness & Utilization Trend',
      workDemand: 'పని డిమాండ్ (కుటుంబాలు)',
      workAllocated: 'పని కేటాయింపు (కుటుంబాలు)',
      persondaysTarget: 'లక్ష్యం పనిదినాలు',
      persondaysAchieved: 'సాధించిన పనిదినాలు',
      timeliness: 'సమయానికి చెల్లింపు %',
      utilization: 'నిధుల వినియోగం %',
      period: 'కాలం'
    },
    gu: {
      chart1Title: 'કામની માંગ અને ફાળવણીની પ્રવૃત્તિ',
      chart1TitleSub: 'Work Demand & Allocation Trend',
      chart2Title: 'માનવ-દિવસો: પ્રાપ્ત વિરુદ્ધ લક્ષ્ય',
      chart2TitleSub: 'Persondays Achieved vs Target',
      chart3Title: 'ચૂકવણી સમય અને ભંડોળ વપરાશ પ્રવૃત્તિ',
      chart3TitleSub: 'Timeliness & Utilization Trend',
      workDemand: 'કામની માંગ (પરિવારો)',
      workAllocated: 'કામ ફાળવણી (પરિવારો)',
      persondaysTarget: 'લક્ષ્યાંકિત માનવ-દિવસો',
      persondaysAchieved: 'પ્રાપ્ત માનવ-દિવસો',
      timeliness: 'સમયસર ચૂકવણી %',
      utilization: 'ભંડોળ વપરાશ %',
      period: 'સમયગાળો'
    }
  };

  const t = translations[language] || translations.en;

  const chartData = [...data].reverse().map(d => ({
    period: getPeriodLabel(d.reporting_month),
    workDemand: d.work_demand,
    workAllocated: d.work_allocated,
    persondaysTarget: d.persondays_target,
    persondaysAchieved: d.persondays_achieved,
    timeliness: d.wage_payment_timeliness_pct,
    utilization: d.fund_utilization_pct
  }));

  return (
    <div className="chart-title-group">
      {/* Chart 1: Work Demand & Allocation Trend */}
      <div className="chart-card">
        <h3 className="chart-title text-lg font-bold mb-4">
          {t.chart1Title} <span className="text-gray-400 font-normal">/ {t.chart1TitleSub}</span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value: number) => formatNumber(value)} />
            <Tooltip
              formatter={(value: number) => [formatNumber(value)]}
              labelFormatter={(label) => `${t.period}: ${label}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <Legend iconType="circle" />
            <Line
              type="monotone"
              dataKey="workDemand"
              stroke="#8b5cf6"
              strokeWidth={3}
              name={t.workDemand}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="workAllocated"
              stroke="#ec4899"
              strokeWidth={3}
              name={t.workAllocated}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Persondays Achieved vs Target */}
      <div className="chart-card">
        <h3 className="chart-title text-lg font-bold mb-4">
          {t.chart2Title} <span className="text-gray-400 font-normal">/ {t.chart2TitleSub}</span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value: number) => formatNumber(value)} />
            <Tooltip
              formatter={(value: number) => [formatNumber(value)]}
              labelFormatter={(label) => `${t.period}: ${label}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <Legend iconType="circle" />
            <Bar dataKey="persondaysTarget" fill="#3b82f6" name={t.persondaysTarget} radius={[4, 4, 0, 0]} />
            <Bar dataKey="persondaysAchieved" fill="#10b981" name={t.persondaysAchieved} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: Timeliness & Utilization Trend */}
      <div className="chart-card">
        <h3 className="chart-title text-lg font-bold mb-4">
          {t.chart3Title} <span className="text-gray-400 font-normal">/ {t.chart3TitleSub}</span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value: number) => `${value}%`} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`]}
              labelFormatter={(label) => `${t.period}: ${label}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <Legend iconType="circle" />
            <Line
              type="monotone"
              dataKey="timeliness"
              stroke="#06b6d4"
              strokeWidth={3}
              name={t.timeliness}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="utilization"
              stroke="#f59e0b"
              strokeWidth={3}
              name={t.utilization}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsChart;