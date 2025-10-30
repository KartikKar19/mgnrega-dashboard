import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DistrictPerformance } from '../lib/supabase';
import { formatNumber } from '../lib/supabase';

interface Props {
  data: DistrictPerformance[];
  language: 'hi' | 'en';
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