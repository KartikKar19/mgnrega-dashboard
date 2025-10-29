import React from 'react';
import { Users, Briefcase, IndianRupee, TrendingUp, UserCheck, Home } from 'lucide-react';
import type { DistrictPerformance } from '../lib/supabase';
import { formatNumber, formatCurrency } from '../lib/supabase';

interface Props {
  data: DistrictPerformance;
  districtName: string;
  language: 'hi' | 'en'; // ADDED
}

const PerformanceCards: React.FC<Props> = ({ data, districtName, language }) => {
  // ADDED: Translation object for card labels
  const translations = {
    hi: {
      totalWorkers: 'कुल कामगार',
      totalWorkersEn: 'Total Workers',
      totalWages: 'कुल वेतन',
      totalWagesEn: 'Total Wages',
      womenPersondays: 'महिला कार्य दिवस',
      womenPersondaysEn: 'Women Persondays',
      householdsWorked: 'परिवार जिन्होंने काम किया',
      householdsWorkedEn: 'Households Worked',
      completedWorks: 'पूर्ण कार्य',
      completedWorksEn: 'Completed Works',
      averageWage: 'औसत मजदूरी',
      averageWageEn: 'Average Wage/Day',
      performance: 'का प्रदर्शन',
      performanceFor: 'Performance for'
    },
    en: {
      totalWorkers: 'Total Workers',
      totalWorkersEn: 'कुल कामगार',
      totalWages: 'Total Wages',
      totalWagesEn: 'कुल वेतन',
      womenPersondays: 'Women Persondays',
      womenPersondaysEn: 'महिला कार्य दिवस',
      householdsWorked: 'Households Worked',
      householdsWorkedEn: 'परिवार जिन्होंने काम किया',
      completedWorks: 'Completed Works',
      completedWorksEn: 'पूर्ण कार्य',
      averageWage: 'Average Wage/Day',
      averageWageEn: 'औसत मजदूरी',
      performance: 'Performance for',
      performanceFor: 'का प्रदर्शन'
    }
  };

  const t = translations[language];

  const cards = [
    {
      title: language === 'hi' ? t.totalWorkers : t.totalWorkers,
      subtitle: language === 'hi' ? t.totalWorkersEn : t.totalWorkersEn,
      value: formatNumber(data.Total_No_of_Workers),
      icon: Users,
      iconClass: 'icon-blue-500',
      bgClass: 'bg-blue-50'
    },
    {
      title: language === 'hi' ? t.totalWages : t.totalWages,
      subtitle: language === 'hi' ? t.totalWagesEn : t.totalWagesEn,
      value: formatCurrency(data.Wages),
      icon: IndianRupee,
      iconClass: 'icon-green-500',
      bgClass: 'bg-green-50'
    },
    {
      title: language === 'hi' ? t.womenPersondays : t.womenPersondays,
      subtitle: language === 'hi' ? t.womenPersondaysEn : t.womenPersondaysEn,
      value: formatNumber(data.Women_Persondays),
      icon: UserCheck,
      iconClass: 'icon-pink-500',
      bgClass: 'bg-pink-50'
    },
    {
      title: language === 'hi' ? t.householdsWorked : t.householdsWorked,
      subtitle: language === 'hi' ? t.householdsWorkedEn : t.householdsWorkedEn,
      value: formatNumber(data.Total_Households_Worked),
      icon: Home,
      iconClass: 'icon-purple-500',
      bgClass: 'bg-purple-50'
    },
    {
      title: language === 'hi' ? t.completedWorks : t.completedWorks,
      subtitle: language === 'hi' ? t.completedWorksEn : t.completedWorksEn,
      value: formatNumber(data.Number_of_Completed_Works),
      icon: Briefcase,
      iconClass: 'icon-orange-500',
      bgClass: 'bg-orange-50'
    },
    {
      title: language === 'hi' ? t.averageWage : t.averageWage,
      subtitle: language === 'hi' ? t.averageWageEn : t.averageWageEn,
      value: formatCurrency(data.Average_Wage_rate_per_day_per_person),
      icon: TrendingUp,
      iconClass: 'icon-teal-500',
      bgClass: 'bg-teal-50'
    }
  ];

  return (
    <div className="performance-section">
      <div className="district-summary-card">
        <h2 className="text-2xl font-bold mb-2">{districtName}</h2>
        <p style={{ opacity: 0.9 }}>
          {language === 'hi' 
            ? `${data.month} ${data.fin_year} ${t.performance}` 
            : `${t.performance} ${data.month} ${data.fin_year}`
          }
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