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
      iconClass: 'icon-blue-500',
      bgClass: 'bg-blue-50'
    },
    {
      title: 'कुल वेतन',
      subtitle: 'Total Wages',
      value: formatCurrency(data.Wages),
      icon: IndianRupee,
      iconClass: 'icon-green-500',
      bgClass: 'bg-green-50'
    },
    {
      title: 'महिला कार्य दिवस',
      subtitle: 'Women Persondays',
      value: formatNumber(data.Women_Persondays),
      icon: UserCheck,
      iconClass: 'icon-pink-500',
      bgClass: 'bg-pink-50'
    },
    {
      title: 'परिवार जिन्होंने काम किया',
      subtitle: 'Households Worked',
      value: formatNumber(data.Total_Households_Worked),
      icon: Home,
      iconClass: 'icon-purple-500',
      bgClass: 'bg-purple-50'
    },
    {
      title: 'पूर्ण कार्य',
      subtitle: 'Completed Works',
      value: formatNumber(data.Number_of_Completed_Works),
      icon: Briefcase,
      iconClass: 'icon-orange-500',
      bgClass: 'bg-orange-50'
    },
    {
      title: 'औसत मजदूरी',
      subtitle: 'Average Wage/Day',
      value: formatCurrency(data.Average_Wage_rate_per_day_per_person),
      icon: TrendingUp,
      iconClass: 'icon-teal-500',
      bgClass: 'bg-teal-50'
    }
  ];

  return (
    <div className="performance-section">
      <div className="district-summary-card">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{districtName}</h2>
        <p className="text-gray-600">
          {data.month} {data.fin_year} का प्रदर्शन / Performance for {data.month} {data.fin_year}
        </p>
      </div>

      <div className="cards-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`card ${card.bgClass}`}
          >
            <div className="card-header">
              <div className={`icon-wrapper ${card.iconClass}`}>
                <card.icon className="text-white" size={28} />
              </div>
            </div>
            <h3 className="card-value">{card.value}</h3>
            <p className="card-title">{card.title}</p>
            <p className="card-subtitle">{card.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceCards;