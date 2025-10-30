import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DistrictPerformance } from '../lib/supabase';
import { formatNumber } from '../lib/supabase';

interface Props {
  data: DistrictPerformance[];
  language: 'en' | 'hi' | 'pa' | 'bn' | 'ta' | 'te' | 'gu' | 'mr' | 'kn';
}

const TrendsChart: React.FC<Props> = ({ data, language }) => {
  const translations = {
    hi: {
      workersTrend: 'कामगार प्रवृत्ति',
      workersTrendEn: 'Workers Trend',
      wagesTrend: 'वेतन प्रवृत्ति (लाख में)',
      wagesTrendEn: 'Wages Trend (in Lakhs)',
      householdsWomen: 'परिवार और महिला कार्य दिवस',
      householdsWomenEn: 'Households & Women Persondays',
      totalWorkers: 'कुल कामगार',
      wages: 'वेतन (₹ लाख)',
      householdsWorked: 'परिवार जिन्होंने काम किया',
      womenPersondays: 'महिला कार्य दिवस',
      period: 'अवधि'
    },
    en: {
      workersTrend: 'Workers Trend',
      workersTrendEn: 'कामगार प्रवृत्ति',
      wagesTrend: 'Wages Trend (in Lakhs)',
      wagesTrendEn: 'वेतन प्रवृत्ति (लाख में)',
      householdsWomen: 'Households & Women Persondays',
      householdsWomenEn: 'परिवार और महिला कार्य दिवस',
      totalWorkers: 'Total Workers',
      wages: 'Wages (₹ Lakhs)',
      householdsWorked: 'Households Worked',
      womenPersondays: 'Women Persondays',
      period: 'Period'
    },
    mr: {
        workersTrend: 'कामगार कल',
        workersTrendEn: 'Workers Trend',
        wagesTrend: 'वेतन कल (लाखांमध्ये)',
        wagesTrendEn: 'Wages Trend (in Lakhs)',
        householdsWomen: 'कुटुंबे आणि महिला मनुष्यदिवस',
        householdsWomenEn: 'Households & Women Persondays',
        totalWorkers: 'एकूण कामगार',
        wages: 'वेतन (₹ लाख)',
        householdsWorked: 'काम केलेली कुटुंबे',
        womenPersondays: 'महिला मनुष्यदिवस',
        period: 'कालावधी'
    },
    kn: {
        workersTrend: 'ಕಾರ್ಮಿಕರ ಟ್ರೆಂಡ್',
        workersTrendEn: 'Workers Trend',
        wagesTrend: 'ವೇತನ ಟ್ರೆಂಡ್ (ಲಕ್ಷಗಳಲ್ಲಿ)',
        wagesTrendEn: 'Wages Trend (in Lakhs)',
        householdsWomen: 'ಕುಟುಂಬಗಳು ಮತ್ತು ಮಹಿಳಾ ಮಾನವ ದಿನಗಳು',
        householdsWomenEn: 'Households & Women Persondays',
        totalWorkers: 'ಒಟ್ಟು ಕಾರ್ಮಿಕರು',
        wages: 'ವೇತನಗಳು (₹ ಲಕ್ಷಗಳು)',
        householdsWorked: 'ಕೆಲಸ ಮಾಡಿದ ಕುಟುಂಬಗಳು',
        womenPersondays: 'ಮಹಿಳಾ ಮಾನವ ದಿನಗಳು',
        period: 'ಅವಧಿ'
    },
    pa: {
        workersTrend: 'ਕਰਮਚਾਰੀਆਂ ਦਾ ਰੁਝਾਨ',
        workersTrendEn: 'Workers Trend',
        wagesTrend: 'ਤਨਖਾਹ ਦਾ ਰੁਝਾਨ (ਲੱਖਾਂ ਵਿੱਚ)',
        wagesTrendEn: 'Wages Trend (in Lakhs)',
        householdsWomen: 'ਪਰਿਵਾਰ ਅਤੇ ਮਹਿਲਾ ਕਾਰਜ ਦਿਵਸ',
        householdsWomenEn: 'Households & Women Persondays',
        totalWorkers: 'ਕੁੱਲ ਕਰਮਚਾਰੀ',
        wages: 'ਤਨਖਾਹ (₹ ਲੱਖ)',
        householdsWorked: 'ਕੰਮ ਕਰਨ ਵਾਲੇ ਪਰਿਵਾਰ',
        womenPersondays: 'ਮਹਿਲਾ ਕਾਰਜ ਦਿਵਸ',
        period: 'ਸਮਾਂ'
    },
    bn: {
        workersTrend: 'শ্রমিক প্রবণতা',
        workersTrendEn: 'Workers Trend',
        wagesTrend: 'মজুরি প্রবণতা (লাখে)',
        wagesTrendEn: 'Wages Trend (in Lakhs)',
        householdsWomen: 'পরিবার ও মহিলা কর্মদিবস',
        householdsWomenEn: 'Households & Women Persondays',
        totalWorkers: 'মোট শ্রমিক',
        wages: 'মজুরি (₹ লক্ষ)',
        householdsWorked: 'কাজ করা পরিবার',
        womenPersondays: 'মহিলা কর্মদিবস',
        period: 'সময়কাল'
    },
    ta: {
        workersTrend: 'ஊழியர்கள் போக்கு',
        workersTrendEn: 'Workers Trend',
        wagesTrend: 'ஊதியப் போக்கு (இலட்சங்களில்)',
        wagesTrendEn: 'Wages Trend (in Lakhs)',
        householdsWomen: 'குடும்பங்கள் & பெண் நபர்கள் நாட்கள்',
        householdsWomenEn: 'Households & Women Persondays',
        totalWorkers: 'மொத்த ஊழியர்கள்',
        wages: 'ஊதியம் (₹ இலட்சம்)',
        householdsWorked: 'வேலை செய்த குடும்பங்கள்',
        womenPersondays: 'பெண் நபர்கள் நாட்கள்',
        period: 'காலம்'
    },
    te: {
        workersTrend: 'కార్మికుల ట్రెండ్',
        workersTrendEn: 'Workers Trend',
        wagesTrend: 'వేతన ట్రెండ్ (లక్షలలో)',
        wagesTrendEn: 'Wages Trend (in Lakhs)',
        householdsWomen: 'కుటుంబాలు & మహిళా పనిదినాలు',
        householdsWomenEn: 'Households & Women Persondays',
        totalWorkers: 'మొత్తం కార్మికులు',
        wages: 'వేతనాలు (₹ లక్షలు)',
        householdsWorked: 'పనిచేసిన కుటుంబాలు',
        womenPersondays: 'మహిళా పనిదినాలు',
        period: 'కాలం'
    },
    gu: {
        workersTrend: 'કાર્યકર પ્રવૃત્તિ',
        workersTrendEn: 'Workers Trend',
        wagesTrend: 'વેતન પ્રવૃત્તિ (લાખમાં)',
        wagesTrendEn: 'Wages Trend (in Lakhs)',
        householdsWomen: 'પરિવારો અને મહિલા માનવ-દિવસો',
        householdsWomenEn: 'Households & Women Persondays',
        totalWorkers: 'કુલ કાર્યકરો',
        wages: 'વેતન (₹ લાખ)',
        householdsWorked: 'કાર્યરત પરિવારો',
        womenPersondays: 'મહિલા માનવ-દિવસો',
        period: 'સમયગાળો'
    }
  };

  const t = translations[language];

  const chartData = [...data].reverse().map(d => ({
    period: `${d.month.substring(0, 3)} ${d.fin_year.substring(2)}`,
    workers: d.Total_No_of_Workers,
    wages: d.Wages / 100000, 
    households: d.Total_Households_Worked,
    women: d.Women_Persondays
  }));

  return (
    <div className="chart-title-group"> 
      <div className="chart-card">
        <h3 className="chart-title">
          {language === 'hi' ? t.workersTrend : t.workersTrend}
          {language === 'hi' ? ` / ${t.workersTrendEn}` : ` / ${t.workersTrendEn}`}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> 
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis 
                stroke="#6b7280" 
                tickFormatter={(value: number) => formatNumber(value)}
            />
            <Tooltip 
              formatter={(value: number) => [formatNumber(value), t.totalWorkers]}
              labelFormatter={(label) => `${t.period}: ${label}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <Legend iconType="circle" />
            <Line 
              type="monotone" 
              dataKey="workers" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name={t.totalWorkers}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">
          {language === 'hi' ? t.wagesTrend : t.wagesTrend}
          {language === 'hi' ? ` / ${t.wagesTrendEn}` : ` / ${t.wagesTrendEn}`}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} /> 
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value) => `${value} L`} />
            <Tooltip 
              formatter={(value: number) => [`₹${value.toFixed(2)} Lakhs`, t.wages]}
              labelFormatter={(label) => `${t.period}: ${label}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <Legend iconType="circle" />
            <Bar dataKey="wages" fill="#10b981" name={t.wages} radius={[4, 4, 0, 0]} /> 
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">
          {language === 'hi' ? t.householdsWomen : t.householdsWomen}
          {language === 'hi' ? ` / ${t.householdsWomenEn}` : ` / ${t.householdsWomenEn}`}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis 
                stroke="#6b7280" 
                tickFormatter={(value: number) => formatNumber(value)}
            />
            <Tooltip 
              formatter={(value: number) => [formatNumber(value)]}
              labelFormatter={(label) => `${t.period}: ${label}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <Legend iconType="circle" />
            <Line 
              type="monotone" 
              dataKey="households" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name={t.householdsWorked}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="women" 
              stroke="#ec4899" 
              strokeWidth={2}
              name={t.womenPersondays}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsChart;