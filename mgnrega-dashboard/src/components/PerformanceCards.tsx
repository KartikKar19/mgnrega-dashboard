import React from 'react';
import { Users, Briefcase, IndianRupee, UserCheck, Home, Award } from 'lucide-react';
import type { DistrictPerformance } from '../lib/supabase';
import { formatNumber } from '../lib/supabase';

interface Props {
  performanceData: DistrictPerformance[];
  districtName: string;
  language: 'en' | 'hi' | 'pa' | 'bn' | 'ta' | 'te' | 'gu' | 'mr' | 'kn';
}

const getMonthAndYear = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[monthNum - 1] || 'Jan'} ${year}`;
};

const PerformanceCards: React.FC<Props> = ({ performanceData, districtName, language }) => {
  if (!performanceData || performanceData.length === 0) return null;

  const data = performanceData[0];
  const oldest = performanceData[performanceData.length - 1];

  let periodDisplay = '';
  if (performanceData.length > 1) {
    periodDisplay = `${getMonthAndYear(oldest.reporting_month)} - ${getMonthAndYear(data.reporting_month)}`;
  } else {
    periodDisplay = getMonthAndYear(data.reporting_month);
  }

  const translations = {
    hi: {
      performance: 'का प्रदर्शन',
      performanceFor: 'Performance for',
      overallGrade: 'समग्र ग्रेड',
      overallGradeSub: 'Overall Grade',
      persondaysTarget: 'कार्य दिवस लक्ष्य',
      persondaysTargetSub: 'Persondays Target',
      persondaysAchieved: 'प्राप्त कार्य दिवस',
      persondaysAchievedSub: 'Persondays Achieved',
      wagePaymentTimeliness: 'समय पर भुगतान',
      wagePaymentTimelinessSub: 'Wage Payment Timeliness',
      fundUtilization: 'नधि उपयोगिता',
      fundUtilizationSub: 'Fund Utilization',
      workDemand: 'काम की मांग (परिवार)',
      workDemandSub: 'Households Demanding Work',
      workAllocated: 'काम का आवंटन (परिवार)',
      workAllocatedSub: 'Households Provided Work',
    },
    en: {
      performance: 'Performance for',
      performanceFor: 'का प्रदर्शन',
      overallGrade: 'Overall Grade',
      overallGradeSub: 'समग्र ग्रेड',
      persondaysTarget: 'Persondays Target',
      persondaysTargetSub: 'कार्य दिवस लक्ष्य',
      persondaysAchieved: 'Persondays Achieved',
      persondaysAchievedSub: 'प्राप्त कार्य दिवस',
      wagePaymentTimeliness: 'Wage Payment Timeliness',
      wagePaymentTimelinessSub: 'समय पर भुगतान',
      fundUtilization: 'Fund Utilization',
      fundUtilizationSub: 'नधि उपयोगिता',
      workDemand: 'Work Demand',
      workDemandSub: 'काम की मांग (परिवार)',
      workAllocated: 'Work Allocated',
      workAllocatedSub: 'काम का आवंटन (परिवार)',
    },
    mr: {
      performance: 'चे कार्यप्रदर्शन',
      performanceFor: 'Performance for',
      overallGrade: 'एकूण ग्रेड',
      overallGradeSub: 'Overall Grade',
      persondaysTarget: 'मनुष्यदिवस लक्ष्य',
      persondaysTargetSub: 'Persondays Target',
      persondaysAchieved: 'मनुष्यदिवस प्राप्त',
      persondaysAchievedSub: 'Persondays Achieved',
      wagePaymentTimeliness: 'वेळेत वेतन देण्याचे प्रमाण',
      wagePaymentTimelinessSub: 'Wage Payment Timeliness',
      fundUtilization: 'निधीचा वापर',
      fundUtilizationSub: 'Fund Utilization',
      workDemand: 'कामाची मागणी (कुटुंबे)',
      workDemandSub: 'Households Demanding Work',
      workAllocated: 'काम पुरवलेली कुटुंबे',
      workAllocatedSub: 'Households Provided Work',
    },
    kn: {
      performance: 'ರ ಕಾರ್ಯಕ್ಷಮತೆ',
      performanceFor: 'Performance for',
      overallGrade: 'ಒಟ್ಟಾರೆ ಗ್ರೇಡ್',
      overallGradeSub: 'Overall Grade',
      persondaysTarget: 'ಮಾನವ ದಿನಗಳ ಗುರಿ',
      persondaysTargetSub: 'Persondays Target',
      persondaysAchieved: 'ಮಾನವ ದಿನಗಳ ಸಾಧನೆ',
      persondaysAchievedSub: 'Persondays Achieved',
      wagePaymentTimeliness: 'ಸಮಯಕ್ಕೆ ವೇತನ ಪಾವತಿ',
      wagePaymentTimelinessSub: 'Wage Payment Timeliness',
      fundUtilization: 'ಹಣ ಬಳಕೆ',
      fundUtilizationSub: 'Fund Utilization',
      workDemand: 'ಕೆಲಸ ಕೇಳಿದ ಕುಟುಂಬಗಳು',
      workDemandSub: 'Households Demanding Work',
      workAllocated: 'ಕೆಲಸ ಒದಗಿಸಿದ ಕುಟುಂಬಗಳು',
      workAllocatedSub: 'Households Provided Work',
    },
    pa: {
      performance: 'ਦਾ ਪ੍ਰਦਰਸ਼ਨ',
      performanceFor: 'Performance for',
      overallGrade: 'ਸਮੁੱਚੀ ਗ੍ਰੇਡ',
      overallGradeSub: 'Overall Grade',
      persondaysTarget: 'ਕਾਰਜ ਦਿਵਸ ਟੀਚਾ',
      persondaysTargetSub: 'Persondays Target',
      persondaysAchieved: 'ਕਾਰਜ ਦਿਵਸ ਪ੍ਰਾਪਤ',
      persondaysAchievedSub: 'Persondays Achieved',
      wagePaymentTimeliness: 'ਸਮੇਂ ਸਿਰ ਭੁਗਤਾਨ',
      wagePaymentTimelinessSub: 'Wage Payment Timeliness',
      fundUtilization: 'ਫੰਡ ਦੀ ਵਰਤੋਂ',
      fundUtilizationSub: 'Fund Utilization',
      workDemand: 'ਕੰਮ ਮੰਗਣ ਵਾਲੇ ਪਰਿਵਾਰ',
      workDemandSub: 'Households Demanding Work',
      workAllocated: 'ਕੰਮ ਦਿੱਤੇ ਗਏ ਪਰਿਵਾਰ',
      workAllocatedSub: 'Households Provided Work',
    },
    bn: {
      performance: 'এর কর্মক্ষমতা',
      performanceFor: 'Performance for',
      overallGrade: 'সামগ্রিক গ্রেড',
      overallGradeSub: 'Overall Grade',
      persondaysTarget: 'কর্মদিবস লক্ষ্য',
      persondaysTargetSub: 'Persondays Target',
      persondaysAchieved: 'কর্মদিবস অর্জিত',
      persondaysAchievedSub: 'Persondays Achieved',
      wagePaymentTimeliness: 'সময়মতো মজুরি প্রদান',
      wagePaymentTimelinessSub: 'Wage Payment Timeliness',
      fundUtilization: 'তহবিল ব্যবহার',
      fundUtilizationSub: 'Fund Utilization',
      workDemand: 'কাজ চাওয়া পরিবার',
      workDemandSub: 'Households Demanding Work',
      workAllocated: 'কাজ দেওয়া পরিবার',
      workAllocatedSub: 'Households Provided Work',
    },
    ta: {
      performance: 'இன் செயல்திறன்',
      performanceFor: 'Performance for',
      overallGrade: 'ஒட்டுமொத்த தரம்',
      overallGradeSub: 'Overall Grade',
      persondaysTarget: 'மனித நாட்கள் இலக்கு',
      persondaysTargetSub: 'Persondays Target',
      persondaysAchieved: 'மனித நாட்கள் சாதித்தது',
      persondaysAchievedSub: 'Persondays Achieved',
      wagePaymentTimeliness: 'சரியான நேரத்தில் ஊதியம்',
      wagePaymentTimelinessSub: 'Wage Payment Timeliness',
      fundUtilization: 'நிதி பயன்பாடு',
      fundUtilizationSub: 'Fund Utilization',
      workDemand: 'வேலை கோரும் குடும்பங்கள்',
      workDemandSub: 'Households Demanding Work',
      workAllocated: 'வேலை வழங்கப்பட்ட குடும்பங்கள்',
      workAllocatedSub: 'Households Provided Work',
    },
    te: {
      performance: 'యొక్క పనితీరు',
      performanceFor: 'Performance for',
      overallGrade: 'మొత్తం గ్రేడ్',
      overallGradeSub: 'Overall Grade',
      persondaysTarget: 'పనిదినాల లక్ష్యం',
      persondaysTargetSub: 'Persondays Target',
      persondaysAchieved: 'పనిదినాల సాధన',
      persondaysAchievedSub: 'Persondays Achieved',
      wagePaymentTimeliness: 'సమయానికి వేతన చెల్లింపులు',
      wagePaymentTimelinessSub: 'Wage Payment Timeliness',
      fundUtilization: 'నిధుల వినియోగం',
      fundUtilizationSub: 'Fund Utilization',
      workDemand: 'పని కోరిన కుటుంబాలు',
      workDemandSub: 'Households Demanding Work',
      workAllocated: 'పని కల్పించిన కుటుంబాలు',
      workAllocatedSub: 'Households Provided Work',
    },
    gu: {
      performance: 'નું પ્રદર્શન',
      performanceFor: 'Performance for',
      overallGrade: 'એકંદર ગ્રેડ',
      overallGradeSub: 'Overall Grade',
      persondaysTarget: 'માનવ-દિવસ લક્ષ્ય',
      persondaysTargetSub: 'Persondays Target',
      persondaysAchieved: 'માનવ-દિવસ પ્રાપ્ત',
      persondaysAchievedSub: 'Persondays Achieved',
      wagePaymentTimeliness: 'સમયસર વેતન ચૂકવણી',
      wagePaymentTimelinessSub: 'Wage Payment Timeliness',
      fundUtilization: 'ભંડોળનો વપરાશ',
      fundUtilizationSub: 'Fund Utilization',
      workDemand: 'કામ માંગતા પરિવારો',
      workDemandSub: 'Households Demanding Work',
      workAllocated: 'કામ આપેલા પરિવારો',
      workAllocatedSub: 'Households Provided Work',
    }
  };

  const t = translations[language] || translations.en;

  const cards = [
    {
      title: t.overallGrade,
      subtitle: t.overallGradeSub,
      value: `${(data.overall_grade * 10).toFixed(0)} / 100`,
      icon: Award,
      iconClass: 'icon-gold-500',
      bgClass: 'bg-amber-50'
    },
    {
      title: t.persondaysTarget,
      subtitle: t.persondaysTargetSub,
      value: formatNumber(data.persondays_target),
      icon: Home,
      iconClass: 'icon-blue-500',
      bgClass: 'bg-blue-50'
    },
    {
      title: t.persondaysAchieved,
      subtitle: t.persondaysAchievedSub,
      value: formatNumber(data.persondays_achieved),
      icon: UserCheck,
      iconClass: 'icon-green-500',
      bgClass: 'bg-green-50'
    },
    {
      title: t.wagePaymentTimeliness,
      subtitle: t.wagePaymentTimelinessSub,
      value: `${data.wage_payment_timeliness_pct.toFixed(1)}%`,
      icon: IndianRupee,
      iconClass: 'icon-teal-500',
      bgClass: 'bg-teal-50'
    },
    {
      title: t.fundUtilization,
      subtitle: t.fundUtilizationSub,
      value: `${data.fund_utilization_pct.toFixed(1)}%`,
      icon: Briefcase,
      iconClass: 'icon-orange-500',
      bgClass: 'bg-orange-50'
    },
    {
      title: t.workDemand,
      subtitle: t.workDemandSub,
      value: formatNumber(data.work_demand),
      icon: Users,
      iconClass: 'icon-purple-500',
      bgClass: 'bg-purple-50'
    },
    {
      title: t.workAllocated,
      subtitle: t.workAllocatedSub,
      value: formatNumber(data.work_allocated),
      icon: Users,
      iconClass: 'icon-pink-500',
      bgClass: 'bg-pink-50'
    }
  ];

  return (
    <div className="performance-section">
      <div className="district-summary-card">
        <h2 className="text-2xl font-bold mb-2">{districtName}</h2>
        <p style={{ opacity: 0.9 }}>
          {language === 'hi' 
            ? `${periodDisplay} ${t.performance}` 
            : `${t.performance} ${periodDisplay}`
          }
        </p>
      </div>

      <div className="cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
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