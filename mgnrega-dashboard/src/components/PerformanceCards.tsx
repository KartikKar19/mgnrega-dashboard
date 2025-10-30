import React from 'react';
import { Users, Briefcase, IndianRupee, TrendingUp, UserCheck, Home } from 'lucide-react';
import type { DistrictPerformance } from '../lib/supabase';
import { formatNumber, formatCurrency } from '../lib/supabase';

interface Props {
  data: DistrictPerformance;
  districtName: string;
  language: 'en' | 'hi' | 'pa' | 'bn' | 'ta' | 'te' | 'gu' | 'mr' | 'kn';
}

const PerformanceCards: React.FC<Props> = ({ data, districtName, language }) => {
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
    },
    mr: {
        totalWorkers: 'एकूण कामगार',
        totalWorkersEn: 'Total Workers',
        totalWages: 'एकूण वेतन',
        totalWagesEn: 'Total Wages',
        womenPersondays: 'महिला मनुष्यदिवस',
        womenPersondaysEn: 'Women Persondays',
        householdsWorked: 'काम केलेली कुटुंबे',
        householdsWorkedEn: 'Households Worked',
        completedWorks: 'पूर्ण झालेली कामे',
        completedWorksEn: 'Completed Works',
        averageWage: 'सरासरी वेतन',
        averageWageEn: 'Average Wage/Day',
        performance: 'चे कार्यप्रदर्शन',
        performanceFor: 'Performance for'
    },
    kn: {
        totalWorkers: 'ಒಟ್ಟು ಕಾರ್ಮಿಕರು',
        totalWorkersEn: 'Total Workers',
        totalWages: 'ಒಟ್ಟು ವೇತನಗಳು',
        totalWagesEn: 'Total Wages',
        womenPersondays: 'ಮಹಿಳಾ ಮಾನವ ದಿನಗಳು',
        womenPersondaysEn: 'Women Persondays',
        householdsWorked: 'ಕೆಲಸ ಮಾಡಿದ ಕುಟುಂಬಗಳು',
        householdsWorkedEn: 'Households Worked',
        completedWorks: 'ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳು',
        completedWorksEn: 'Completed Works',
        averageWage: 'ಸರಾಸರಿ ವೇತನ',
        averageWageEn: 'Average Wage/Day',
        performance: 'ರ ಕಾರ್ಯಕ್ಷಮತೆ',
        performanceFor: 'Performance for'
    },
    pa: {
        totalWorkers: 'ਕੁੱਲ ਕਰਮਚਾਰੀ',
        totalWorkersEn: 'Total Workers',
        totalWages: 'ਕੁੱਲ ਤਨਖਾਹ',
        totalWagesEn: 'Total Wages',
        womenPersondays: 'ਮਹਿਲਾ ਕਾਰਜ ਦਿਵਸ',
        womenPersondaysEn: 'Women Persondays',
        householdsWorked: 'ਕੰਮ ਕਰਨ ਵਾਲੇ ਪਰਿਵਾਰ',
        householdsWorkedEn: 'Households Worked',
        completedWorks: 'ਮੁਕੰਮਲ ਕਾਰਜ',
        completedWorksEn: 'Completed Works',
        averageWage: 'ਔਸਤ ਤਨਖਾਹ',
        averageWageEn: 'Average Wage/Day',
        performance: 'ਦਾ ਪ੍ਰਦਰਸ਼ਨ',
        performanceFor: 'Performance for'
    },
    bn: {
        totalWorkers: 'মোট শ্রমিক',
        totalWorkersEn: 'Total Workers',
        totalWages: 'মোট মজুরি',
        totalWagesEn: 'Total Wages',
        womenPersondays: 'মহিলা কর্মদিবস',
        womenPersondaysEn: 'Women Persondays',
        householdsWorked: 'কাজ করা পরিবার',
        householdsWorkedEn: 'Households Worked',
        completedWorks: 'সমাপ্ত কাজ',
        completedWorksEn: 'Completed Works',
        averageWage: 'গড় মজুরি',
        averageWageEn: 'Average Wage/Day',
        performance: 'এর কর্মক্ষমতা',
        performanceFor: 'Performance for'
    },
    ta: {
        totalWorkers: 'மொத்த ஊழியர்கள்',
        totalWorkersEn: 'Total Workers',
        totalWages: 'மொத்த ஊதியம்',
        totalWagesEn: 'Total Wages',
        womenPersondays: 'பெண் நபர்கள் நாட்கள்',
        womenPersondaysEn: 'Women Persondays',
        householdsWorked: 'வேலை செய்த குடும்பங்கள்',
        householdsWorkedEn: 'Households Worked',
        completedWorks: 'முடிக்கப்பட்ட பணிகள்',
        completedWorksEn: 'Completed Works',
        averageWage: 'சராசரி ஊதியம்',
        averageWageEn: 'Average Wage/Day',
        performance: 'இன் செயல்திறன்',
        performanceFor: 'Performance for'
    },
    te: {
        totalWorkers: 'మొత్తం కార్మికులు',
        totalWorkersEn: 'Total Workers',
        totalWages: 'మొత్తం వేతనాలు',
        totalWagesEn: 'Total Wages',
        womenPersondays: 'మహిళా పనిదినాలు',
        womenPersondaysEn: 'Women Persondays',
        householdsWorked: 'పనిచేసిన కుటుంబాలు',
        householdsWorkedEn: 'Households Worked',
        completedWorks: 'పూర్తయిన పనులు',
        completedWorksEn: 'Completed Works',
        averageWage: 'సగటు వేతనం',
        averageWageEn: 'Average Wage/Day',
        performance: 'యొక్క పనితీరు',
        performanceFor: 'Performance for'
    },
    gu: {
        totalWorkers: 'કુલ કાર્યકરો',
        totalWorkersEn: 'Total Workers',
        totalWages: 'કુલ વેતન',
        totalWagesEn: 'Total Wages',
        womenPersondays: 'મહિલા માનવ-દિવસો',
        womenPersondaysEn: 'Women Persondays',
        householdsWorked: 'કાર્યરત પરિવારો',
        householdsWorkedEn: 'Households Worked',
        completedWorks: 'પૂર્ણ થયેલ કાર્યો',
        completedWorksEn: 'Completed Works',
        averageWage: 'સરેરાશ વેતન',
        averageWageEn: 'Average Wage/Day',
        performance: 'નું પ્રદર્શન',
        performanceFor: 'Performance for'
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