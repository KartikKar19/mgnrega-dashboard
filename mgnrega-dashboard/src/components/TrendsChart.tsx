import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DistrictPerformance } from '../lib/supabase';

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
    <div className="chart-title-group">
      {/* Workers Trend */}
      <div className="chart-card">
        <h3 className="chart-title">
          कामगार प्रवृत्ति / Workers Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="workers" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Total Workers"
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
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="wages" fill="#10b981" name="Wages (₹ Lakhs)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Households & Women */}
      <div className="chart-card">
        <h3 className="chart-title">
          परिवार और महिला कार्य दिवस / Households & Women Persondays
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="households" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Households Worked"
            />
            <Line 
              type="monotone" 
              dataKey="women" 
              stroke="#ec4899" 
              strokeWidth={2}
              name="Women Persondays"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsChart;