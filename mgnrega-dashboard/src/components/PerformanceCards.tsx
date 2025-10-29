import React from 'react';
import { Users, Briefcase, IndianRupee, TrendingUp, UserCheck, Home } from 'lucide-react';
import type { DistrictPerformance } from '../lib/supabase';
import { formatNumber, formatCurrency } from '../lib/supabase';

interface Props {
  data: DistrictPerformance;
  districtName: string;
}

const PerformanceCards: React.FC<Props> = ({ data, districtName }) => {
  const cards = [
    {
      title: 'कुल कामगार',
      subtitle: 'Total Workers',
      value: formatNumber(data.Total_No_of_Workers),
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50'
    },
    {
      title: 'कुल वेतन',
      subtitle: 'Total Wages',
      value: formatCurrency(data.Wages),
      icon: IndianRupee,
      color: 'bg-green-500',
      bgLight: 'bg-green-50'
    },
    {
      title: 'महिला कार्य दिवस',
      subtitle: 'Women Persondays',
      value: formatNumber(data.Women_Persondays),
      icon: UserCheck,
      color: 'bg-pink-500',
      bgLight: 'bg-pink-50'
    },
    {
      title: 'परिवार जिन्होंने काम किया',
      subtitle: 'Households Worked',
      value: formatNumber(data.Total_Households_Worked),
      icon: Home,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50'
    },
    {
      title: 'पूर्ण कार्य',
      subtitle: 'Completed Works',
      value: formatNumber(data.Number_of_Completed_Works),
      icon: Briefcase,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50'
    },
    {
      title: 'औसत मजदूरी',
      subtitle: 'Average Wage/Day',
      value: formatCurrency(data.Average_Wage_rate_per_day_per_person),
      icon: TrendingUp,
      color: 'bg-teal-500',
      bgLight: 'bg-teal-50'
    }
  ];

  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{districtName}</h2>
        <p className="text-gray-600">
          {data.month} {data.fin_year} का प्रदर्शन / Performance for {data.month} {data.fin_year}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgLight} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-xl`}>
                <card.icon className="text-white" size={28} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">{card.value}</h3>
            <p className="text-gray-700 font-semibold">{card.title}</p>
            <p className="text-gray-500 text-sm">{card.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceCards;