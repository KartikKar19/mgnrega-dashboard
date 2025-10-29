import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DistrictPerformance } from '../lib/supabase';
import { formatNumber } from '../lib/supabase'; // FIX: Import formatNumber

interface Props {
  data: DistrictPerformance[];
}

const TrendsChart: React.FC<Props> = ({ data }) => {
  // Prepare data for charts (reverse to show oldest to newest)
  const chartData = [...data].reverse().map(d => ({
    period: `${d.month.substring(0, 3)} ${d.fin_year.substring(2)}`,
    workers: d.Total_No_of_Workers,
    wages: d.Wages / 100000, // Convert to lakhs
    households: d.Total_Households_Worked,
    women: d.Women_Persondays
  }));

  return (
    // Updated to use the new CSS classes for grid layout and card styling
    <div className="chart-title-group"> 
      {/* Workers Trend */}
      <div className="chart-card">
        <h3 className="chart-title">
          कामगार प्रवृत्ति / Workers Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> 
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis 
                stroke="#6b7280" 
                tickFormatter={(value: number) => formatNumber(value)} // Use imported function
            />
            <Tooltip 
              formatter={(value: number) => [formatNumber(value), 'Total Workers']}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <Legend iconType="circle" />
            <Line 
              type="monotone" 
              dataKey="workers" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Total Workers"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Wages Trend */}
      <div className="chart-card">
        <h3 className="chart-title">
          वेतन प्रवृत्ति (लाख में) / Wages Trend (in Lakhs)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} /> 
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value) => `${value} L`} />
            <Tooltip 
              formatter={(value: number) => [`₹${value.toFixed(2)} Lakhs`, 'Wages (₹ Lakhs)']}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <Legend iconType="circle" />
            <Bar dataKey="wages" fill="#10b981" name="Wages (₹ Lakhs)" radius={[4, 4, 0, 0]} /> 
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Households & Women */}
      <div className="chart-card">
        <h3 className="chart-title">
          परिवार और महिला कार्य दिवस / Households & Women Persondays
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis 
                stroke="#6b7280" 
                tickFormatter={(value: number) => formatNumber(value)} // Use imported function
            />
            <Tooltip 
              formatter={(value: number) => [formatNumber(value)]}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <Legend iconType="circle" />
            <Line 
              type="monotone" 
              dataKey="households" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Households Worked"
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="women" 
              stroke="#ec4899" 
              strokeWidth={2}
              name="Women Persondays"
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