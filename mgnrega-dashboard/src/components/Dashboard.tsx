import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Volume2, VolumeX, Briefcase } from 'lucide-react';
import { getDistricts, getDistrictPerformance, detectUserLocation, getDistrictFromCoordinates, speakWithGoogleTTS, stopSpeaking } from '../services/api';
import type { District, DistrictPerformance } from '../lib/supabase';
import { numberToHindiWords } from '../lib/supabase';
import DistrictSelector from './DistrictSelector';
import PerformanceCards from './PerformanceCards';
import TrendsChart from './TrendsChart';


const MGNREGA_FULL_FORM = 'Mahatma Gandhi National Rural Employment Guarantee Act';

type LanguageCode = 'en' | 'hi' | 'pa' | 'bn' | 'ta' | 'te' | 'gu' | 'mr' | 'kn';

const SUPPORTED_LANGUAGES: { code: LanguageCode; name: string; localName: string; ttsCode: string }[] = [
    { code: 'en', name: 'English', localName: 'English', ttsCode: 'en-IN' },
    { code: 'hi', name: 'Hindi', localName: 'हिन्दी', ttsCode: 'hi-IN' },
    { code: 'mr', name: 'Marathi', localName: 'मराठी', ttsCode: 'mr-IN' },
    { code: 'kn', name: 'Kannada', localName: 'ಕನ್ನಡ', ttsCode: 'kn-IN' },
    { code: 'pa', name: 'Punjabi', localName: 'ਪੰਜਾਬੀ', ttsCode: 'pa-IN' },
    { code: 'bn', name: 'Bengali', localName: 'বাংলা', ttsCode: 'bn-IN' },
    { code: 'ta', name: 'Tamil', localName: 'தமிழ்', ttsCode: 'ta-IN' },
    { code: 'te', name: 'Telugu', localName: 'తెలుగు', ttsCode: 'te-IN' },
    { code: 'gu', name: 'Gujarati', localName: 'ગુજરાતી', ttsCode: 'gu-IN' },
];

const extractYear = (fy: string) => fy.substring(0, 4);

interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (code: LanguageCode) => void;
  translations: Record<LanguageCode, { [key: string]: string }>;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange, translations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ttsLang = useMemo(() => SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)!, [currentLanguage]);
  const t = translations[currentLanguage];

  const handleSelect = (code: LanguageCode) => {
    onLanguageChange(code);
    setIsOpen(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="district-select-container" style={{ width: '10rem', flexShrink: 0 }} ref={containerRef}>
        <div className="district-input-wrapper">
          <input
            type="text"
            readOnly
            placeholder={t.switchToMenu || 'Change Language'}
            value={ttsLang.localName}
            onClick={() => setIsOpen(!isOpen)}
            className="district-input cursor-pointer pl-10"
          />
        </div>
        
        {isOpen && (
            <div className="district-dropdown" style={{ width: '12rem', right: 0, left: 'unset' }}>
                {SUPPORTED_LANGUAGES.map(lang => (
                    <div
                        key={lang.code}
                        onMouseDown={(e) => {
                            e.preventDefault(); 
                            handleSelect(lang.code);
                        }}
                        className={`district-option ${lang.code === currentLanguage ? 'selected' : ''}`}
                    >
                        {lang.localName} ({lang.name})
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};


const Dashboard: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [performanceData, setPerformanceData] = useState<DistrictPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('hi');
  //const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const ttsLang = SUPPORTED_LANGUAGES.find(l => l.code === language)!;

  const translations: Record<LanguageCode, {
    title: string;
    subtitle: string;
    selectDistrict: string;
    loading: string;
    detectingLocation: string;
    noDataTitle: string;
    noDataMessage: string;
    dataSource: string;
    switchToMenu: string;
    searchDistrict: string;
    noDistrictFound: string;
  }> = {
    en: {
      title: `${MGNREGA_FULL_FORM} Dashboard`,
      subtitle: 'MGNREGA Performance Dashboard',
      selectDistrict: 'Select Your District',
      loading: 'Loading...',
      detectingLocation: '📍 Detecting your location...',
      noDataTitle: 'No Data Available',
      noDataMessage: 'Performance data is not available for this district.',
      dataSource: 'Data Source: Ministry of Rural Development, Government of India',
      switchToMenu: 'Change Language',
      searchDistrict: '-- Select District / Search --',
      noDistrictFound: 'No district found'
    },
    hi: {
      title: `${MGNREGA_FULL_FORM} Dashboard`,
      subtitle: 'मनरेगा प्रदर्शन डैशबोर्ड',
      selectDistrict: 'अपना जिला चुनें',
      loading: 'लोड हो रहा है...',
      detectingLocation: '📍 आपका स्थान खोजा जा रहा है...',
      noDataTitle: 'कोई डेटा उपलब्ध नहीं',
      noDataMessage: 'इस जिले के लिए प्रदर्शन डेटा उपलब्ध नहीं है।',
      dataSource: 'डेटा स्रोत: ग्रामीण विकास मंत्रालय, भारत सरकार',
      switchToMenu: 'भाषा बदलें',
      searchDistrict: '-- जिला चुनें / Search District --',
      noDistrictFound: 'कोई जिला नहीं मिला / No district found'
    },
    mr: {
      title: `${MGNREGA_FULL_FORM} डॅशबोर्ड`,
      subtitle: 'मनरेगा कार्यप्रदर्शन डॅशबोर्ड',
      selectDistrict: 'आपला जिल्हा निवडा',
      loading: 'लोड होत आहे...',
      detectingLocation: '📍 आपले स्थान शोधले जात आहे...',
      noDataTitle: 'डेटा उपलब्ध नाही',
      noDataMessage: 'या जिल्ह्यासाठी कार्यप्रदर्शन डेटा उपलब्ध नाही.',
      dataSource: 'डेटा स्त्रोत: ग्रामीण विकास मंत्रालय, भारत सरकार',
      switchToMenu: 'भाषा बदला',
      searchDistrict: '-- जिल्हा निवडा / Search District --',
      noDistrictFound: 'जिल्हा सापडला नाही'
    },
    kn: {
      title: `${MGNREGA_FULL_FORM} ಡ್ಯಾಶ್‌ಬೋರ್ಡ್`,
      subtitle: 'MGNREGA ಕಾರ್ಯಕ್ಷಮತೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      selectDistrict: 'ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      detectingLocation: '📍 ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...',
      noDataTitle: 'ಯಾವುದೇ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ',
      noDataMessage: 'ಈ ಜಿಲ್ಲೆಗೆ ಕಾರ್ಯಕ್ಷಮತೆ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.',
      dataSource: 'ಡೇಟಾ ಮೂಲ: ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ ಸಚಿವಾಲಯ, ಭಾರತ ಸರ್ಕಾರ',
      switchToMenu: 'ಭಾಷೆ ಬದಲಾಯಿಸಿ',
      searchDistrict: '-- ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ / Search District --',
      noDistrictFound: 'ಯಾವುದೇ ಜಿಲ್ಲೆ ಕಂಡುಬಂದಿಲ್ಲ'
    },
    pa: {
      title: `${MGNREGA_FULL_FORM} ਡੈਸ਼ਬੋਰਡ`,
      subtitle: 'ਮਗਨਰੇਗਾ ਕਾਰਗੁਜ਼ਾਰੀ ਡੈਸ਼ਬੋਰਡ',
      selectDistrict: 'ਆਪਣਾ ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ',
      loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      detectingLocation: '📍 ਤੁਹਾਡਾ ਸਥਾਨ ਖੋਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
      noDataTitle: 'ਕੋਈ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ',
      noDataMessage: 'ਇਸ ਜ਼ਿਲ੍ਹੇ ਲਈ ਕਾਰਗੁਜ਼ਾਰੀ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।',
      dataSource: 'ਡਾਟਾ ਸਰੋਤ: ਪੇਂਡੂ ਵਿਕਾਸ ਮੰਤਰਾਲਾ, ਭਾਰਤ ਸਰਕਾਰ',
      switchToMenu: 'ਭਾਸ਼ਾ ਬਦਲੋ',
      searchDistrict: '-- ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ / Search District --',
      noDistrictFound: 'ਕੋਈ ਜ਼ਿਲ੍ਹਾ ਨਹੀਂ ਲੱਭਿਆ'
    },
    bn: {
      title: `${MGNREGA_FULL_FORM} ড্যাশবোর্ড`,
      subtitle: 'মনরেগা পারফরম্যান্স ড্যাশবোর্ড',
      selectDistrict: 'আপনার জেলা নির্বাচন করুন',
      loading: 'লোড হচ্ছে...',
      detectingLocation: '📍 আপনার অবস্থান সনাক্ত করা হচ্ছে...',
      noDataTitle: 'কোন তথ্য নেই',
      noDataMessage: 'এই জেলার জন্য কর্মক্ষমতা ডেটা উপলব্ধ নয়।',
      dataSource: 'তথ্য সূত্র: গ্রামীণ উন্নয়ন মন্ত্রক, ভারত সরকার',
      switchToMenu: 'ভাষা পরিবর্তন করুন',
      searchDistrict: '-- জেলা নির্বাচন করুন / Search District --',
      noDistrictFound: 'কোন জেলা পাওয়া যায়নি'
    },
    ta: {
      title: `${MGNREGA_FULL_FORM} டாஷ்போர்டு`,
      subtitle: 'மகாத்மா காந்தி தேசிய ஊரக வேலை உறுதிச் சட்ட செயல்திறன் டாஷ்போர்டு',
      selectDistrict: 'உங்கள் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்',
      loading: 'ஏற்றப்படுகிறது...',
      detectingLocation: '📍 உங்கள் இருப்பிடம் கண்டறியப்படுகிறது...',
      noDataTitle: 'தரவு எதுவும் கிடைக்கவில்லை',
      noDataMessage: 'இந்த மாவட்டத்திற்கான செயல்திறன் தரவு கிடைக்கவில்லை.',
      dataSource: 'தரவு ஆதாரம்: ஊரக வளர்ச்சி அமைச்சகம், இந்திய அரசு',
      switchToMenu: 'மொழியை மாற்று',
      searchDistrict: '-- மாவட்டத்தைத் தேர்ந்தெடுக்கவும் / Search District --',
      noDistrictFound: 'மாவட்டம் எதுவும் கண்டறியப்படவில்லை'
    },
    te: {
      title: `${MGNREGA_FULL_FORM} డాష్‌బోర్డ్`,
      subtitle: 'MGNREGA పనితీరు డాష్‌బోర్డ్',
      selectDistrict: 'మీ జిల్లాను ఎంచుకోండి',
      loading: 'లోడ్ అవుతోంది...',
      detectingLocation: '📍 మీ స్థానం గుర్తిస్తోంది...',
      noDataTitle: 'డేటా అందుబాటులో లేదు',
      noDataMessage: 'ఈ జిల్లాకు పనితీరు డేటా అందుబాటులో లేదు.',
      dataSource: 'డేటా మూలం: గ్రామీణాభివృద్ధి మంత్రిత్వ శాఖ, భారత ప్రభుత్వం',
      switchToMenu: 'భాష మార్చండి',
      searchDistrict: '-- జిల్లాను ఎంచుకోండి / Search District --',
      noDistrictFound: 'జిల్లా ఏదీ కనుగొనబడలేదు'
    },
    gu: {
      title: `${MGNREGA_FULL_FORM} ડેશબોર્ડ`,
      subtitle: 'MGNREGA પ્રદર્શન ડેશબોર્ડ',
      selectDistrict: 'તમારો જિલ્લો પસંદ કરો',
      loading: 'લોડ થાય છે...',
      detectingLocation: '📍 તમારું સ્થાન શોધાઈ રહ્યું છે...',
      noDataTitle: 'કોઈ ડેટા ઉપલબ્ધ નથી',
      noDataMessage: 'આ જિલ્લા માટે પ્રદર્શન ડેટા ઉપલબ્ધ નથી.',
      dataSource: 'ડેટા સ્ત્રોત: ગ્રામીણ વિકાસ મંત્રાલય, ભારત સરકાર',
      switchToMenu: 'ભાષા બદલો',
      searchDistrict: '-- જિલ્લો પસંદ કરો / Search District --',
      noDistrictFound: 'કોઈ જિલ્લો મળ્યો નથી'
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    autoDetectDistrict();
  }, [districts]);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      const data = await getDistricts();
      setDistricts(data);
    } catch (err) {
      setError('Failed to load districts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const autoDetectDistrict = async () => {
    if (districts.length === 0) return;
    
    try {
      setDetectingLocation(true);
      const location = await detectUserLocation();
      
      if (location) {
        const districtName = await getDistrictFromCoordinates(location.lat, location.lng);
        
        if (districtName) {
          const matchedDistrict = districts.find(d => 
            d.district_name.toLowerCase().includes(districtName.toLowerCase()) ||
            districtName.toLowerCase().includes(d.district_name.toLowerCase())
          );
          
          if (matchedDistrict) {
            setSelectedDistrict(matchedDistrict);
            loadPerformanceData(matchedDistrict.district_code);
          }
        }
      }
    } catch (err) {
      console.log('Could not auto-detect location:', err);
    } finally {
      setDetectingLocation(false);
    }
  };

  const loadPerformanceData = async (districtCode: string) => {
    try {
      setLoading(true);
      const data = await getDistrictPerformance(districtCode);
      setPerformanceData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load performance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictChange = (district: District) => {
    setSelectedDistrict(district);
    loadPerformanceData(district.district_code);
    stopSpeaking();
    setIsSpeaking(false);
  };

  const handleLanguageSelect = (code: LanguageCode) => {
    setLanguage(code);
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    if (!selectedDistrict || performanceData.length === 0) return;

    const latest = performanceData[0];
    const oldest = performanceData[performanceData.length - 1];
    let text = '';
    
    const startYear = extractYear(oldest.fin_year);
    const endYear = extractYear(latest.fin_year);
    
    const periodHindi = performanceData.length > 1
      ? `${oldest.month} ${startYear} se lekar ${latest.month} ${endYear}`
      : `${latest.month} ${endYear}`;
      
    const periodEnglish = performanceData.length > 1
      ? `from ${oldest.month} ${startYear} to ${latest.month} ${endYear}`
      : `${latest.month} ${endYear}`;

    if (language === 'hi') {
      const workersWords = numberToHindiWords(latest.Total_No_of_Workers);
      const wagesWords = numberToHindiWords(latest.Wages);
      const womenWords = numberToHindiWords(latest.Women_Persondays);
      const householdsWords = numberToHindiWords(latest.Total_Households_Worked);
      const completedWorksWords = numberToHindiWords(latest.Number_of_Completed_Works);
      //const avgWageWords = numberToHindiWords(latest.Average_Wage_rate_per_day_per_person);
      const scPersondaysWords = numberToHindiWords(latest.SC_persondays);
      const stPersondaysWords = numberToHindiWords(latest.ST_persondays);

      text = `${selectedDistrict.district_name} jile ka ${MGNREGA_FULL_FORM} pradarshan report.
        Mahina: ${periodHindi}.
        
        Kaamgaar vivaraṇ:
        Kul kaamgaar: ${workersWords}.
        Mahila karya divas: ${womenWords}.
        Anusoochit jaati karya divas: ${scPersondaysWords}.
        Anusoochit janjati karya divas: ${stPersondaysWords}.
        
        Vetan vivaraṇ:
        Is mahine ka kul vetan: rupaye ${wagesWords}.
        
        Parivaar aur karya vivaraṇ:
        Kul parivaar jinhone kaam kiya: ${householdsWords}.
        Poorn kiye gaye karya: ${completedWorksWords}.
        
        Yeh tha aapke jile ka sampurn ${MGNREGA_FULL_FORM} pradarshan vivaraṇ.`;
    } else {
      const workers = latest.Total_No_of_Workers.toFixed(0);
      const wages = latest.Wages.toFixed(0);
      const women = latest.Women_Persondays.toFixed(0);
      const households = latest.Total_Households_Worked.toFixed(0);
      const completedWorks = latest.Number_of_Completed_Works.toFixed(0);
      const avgWage = latest.Average_Wage_rate_per_day_per_person.toFixed(2);
      const scPersondays = latest.SC_persondays.toFixed(0);
      const stPersondays = latest.ST_persondays.toFixed(0);

      const scriptTranslations: Record<LanguageCode, string[]> = {
          hi: [''],
          en: [
              `${MGNREGA_FULL_FORM} performance report for ${selectedDistrict.district_name} district. Period: ${periodEnglish}.`,
              `Worker Details: Total workers: ${workers}. Women persondays: ${women}. Scheduled Caste persondays: ${scPersondays}. Scheduled Tribe persondays: ${stPersondays}.`,
              `Wage Details: Total wages (for this period): rupees ${wages}. Average wage per day per person: rupees ${avgWage}.`,
              `Household and Work Details: Total households worked: ${households}. Number of completed works: ${completedWorks}.`,
              `This was the complete ${MGNREGA_FULL_FORM} performance summary for your district.`
          ],
          mr: [
              `${selectedDistrict.district_name} जिल्ह्यासाठी ${MGNREGA_FULL_FORM} कार्यप्रदर्शन अहवाल. कालावधी: ${periodEnglish}.`,
              `कामगार तपशील: एकूण कामगार: ${workers}. महिलांचे मनुष्यदिवस: ${women}. अनुसूचित जातीचे मनुष्यदिवस: ${scPersondays}. अनुसूचित जमातीचे मनुष्यदिवस: ${stPersondays}.`,
              `वेतन तपशील: एकूण वेतन (या कालावधीसाठी): रुपये ${wages}. प्रति व्यक्ती दररोज सरासरी वेतन: रुपये ${avgWage}.`,
              `कुटुंब आणि कामाचा तपशील: एकूण काम केलेली कुटुंबे: ${households}. पूर्ण झालेल्या कामांची संख्या: ${completedWorks}.`,
              `हा तुमच्या जिल्ह्याचा संपूर्ण ${MGNREGA_FULL_FORM} कार्यप्रदर्शन सारांश होता.`
          ],
          kn: [
              `${selectedDistrict.district_name} ಜಿಲ್ಲೆಗೆ ${MGNREGA_FULL_FORM} ಕಾರ್ಯಕ್ಷಮತೆ ವರದಿ. ಅವಧಿ: ${periodEnglish}.`,
              `ಕಾರ್ಮಿಕರ ವಿವರಗಳು: ಒಟ್ಟು ಕಾರ್ಮಿಕರು: ${workers}. ಮಹಿಳಾ ಮಾನವ ದಿನಗಳು: ${women}. ಪರಿಶಿಷ್ಟ ಜಾತಿ ಮಾನವ ದಿನಗಳು: ${scPersondays}. ಪರಿಶಿಷ್ಟ ಪಂಗಡ ಮಾನವ ದಿನಗಳು: ${stPersondays}.`,
              `ವೇತನ ವಿವರಗಳು: ಒಟ್ಟು ವೇತನ (ಈ ಅವಧಿಗೆ): ರೂಪಾಯಿ ${wages}. ಒಬ್ಬರಿಗೆ ದಿನಕ್ಕೆ ಸರಾಸರಿ ವೇತನ: ರೂಪಾಯಿ ${avgWage}.`,
              `ಕುಟುಂಬ ಮತ್ತು ಕೆಲಸದ ವಿವರಗಳು: ಒಟ್ಟು ಕೆಲಸ ಮಾಡಿದ ಕುಟುಂಬಗಳು: ${households}. ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳ ಸಂಖ್ಯೆ: ${completedWorks}.`,
              `ಇದು ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ${MGNREGA_FULL_FORM} ಕಾರ್ಯಕ್ಷಮತೆಯ ಸಂಪೂರ್ಣ ಸಾರಾಂಶವಾಗಿದೆ.`
          ],
          pa: [
              `${MGNREGA_FULL_FORM} ਦੀ ਕਾਰਗੁਜ਼ਾਰੀ ਰਿਪੋਰਟ ${selectedDistrict.district_name} ਜ਼ਿਲ੍ਹੇ ਲਈ। ਸਮਾਂ: ${periodEnglish}.`,
              `ਕਰਮਚਾਰੀ ਵੇਰਵੇ: ਕੁੱਲ ਕਰਮਚਾਰੀ: ${workers}। ਮਹਿਲਾ ਕਾਰਜ ਦਿਵਸ: ${women}। ਅਨੁਸੂਚਿਤ ਜਾਤੀ ਕਾਰਜ ਦਿਵਸ: ${scPersondays}। ਅਨੁਸੂਚਿਤ ਕਬੀਲੇ ਕਾਰਜ ਦਿਵਸ: ${stPersondays}।`,
              `ਤਨਖਾਹ ਵੇਰਵੇ: ਕੁੱਲ ਤਨਖਾਹ (ਇਸ ਸਮੇਂ ਲਈ): ਰੁਪਏ ${wages}। ਪ੍ਰਤੀ ਦਿਨ ਔਸਤ ਤਨਖਾਹ: ਰੁਪਏ ${avgWage}।`,
              `ਪਰਿਵਾਰ ਅਤੇ ਕੰਮ ਦੇ ਵੇਰਵੇ: ਕੁੱਲ ਕੰਮ ਕਰਨ ਵਾਲੇ ਪਰਿਵਾਰ: ${households}। ਮੁਕੰਮਲ ਹੋਏ ਕਾਰਜਾਂ ਦੀ ਗਿਣਤੀ: ${completedWorks}।`,
              `ਇਹ ਤੁਹਾਡੇ ਜ਼ਿਲ੍ਹੇ ਦੀ ${MGNREGA_FULL_FORM} ਦੀ ਸੰਪੂਰਨ ਕਾਰਗੁਜ਼ਾਰੀ ਸੰਖੇਪ ਜਾਣਕਾਰੀ ਸੀ।`
          ],
          bn: [
              `${MGNREGA_FULL_FORM} কর্মক্ষমতা রিপোর্ট ${selectedDistrict.district_name} জেলার জন্য। সময়কাল: ${periodEnglish}.`,
              `শ্রমিক বিবরণ: মোট শ্রমিক: ${workers}. মহিলা কর্মদিবস: ${women}. তফসিলি জাতি কর্মদিবস: ${scPersondays}. তফসিলি উপজাতি কর্মদিবস: ${stPersondays}.`,
              `মজুরি বিবরণ: মোট মজুরি (এই সময়ের জন্য): রুপি ${wages}. প্রতিদিন প্রতি ব্যক্তির গড় মজুরি: রুপি ${avgWage}.`,
              `পরিবার এবং কাজের বিবরণ: মোট কাজ করা পরিবার: ${households}. সমাপ্ত কাজের সংখ্যা: ${completedWorks}।`,
              `এটি আপনার জেলার ${MGNREGA_FULL_FORM} এর সম্পূর্ণ পারফরম্যান্স সারাংশ ছিল।`
          ],
          ta: [
              `${MGNREGA_FULL_FORM} செயல்திறன் அறிக்கை ${selectedDistrict.district_name} மாவட்டத்திற்காக. காலம்: ${periodEnglish}.`,
              `ஊழியர் விவரங்கள்: மொத்த ஊழியர்கள்: ${workers}. பெண் நபர்கள் நாட்கள்: ${women}. பட்டியல் சாதி நபர்கள் நாட்கள்: ${scPersondays}. பட்டியல் பழங்குடி நபர்கள் நாட்கள்: ${stPersondays}.`,
              `ஊதிய விவரங்கள்: மொத்த ஊதியம் (இந்த காலகட்டத்திற்கு): ரூபாய் ${wages}. ஒரு நபருக்கு ஒரு நாள் சராசரி ஊதியம்: ரூபாய் ${avgWage}.`,
              `குடும்பம் மற்றும் வேலை விவரங்கள்: வேலை செய்த மொத்த குடும்பங்கள்: ${households}. முடிக்கப்பட்ட வேலைகளின் எண்ணிக்கை: ${completedWorks}.`,
              `இது உங்கள் மாவட்டத்திற்கான ${MGNREGA_FULL_FORM} இன் முழுமையான செயல்திறன் சுருக்கம்.`
          ],
          te: [
              `${MGNREGA_FULL_FORM} పనితీరు నివేదన ${selectedDistrict.district_name} జిల్లా కోసం. కాలం: ${periodEnglish}.`,
              `కార్మికుల వివరాలు: మొత్తం కార్మికులు: ${workers}. మహిళా పనిదినాలు: ${women}. షెడ్యూల్డ్ కులాల పనిదినాలు: ${scPersondays}. షెడ్యూల్డ్ తెగల పనిదినాలు: ${stPersondays}.`,
              `వేతన వివరాలు: మొత్తం వేతనాలు (ఈ కాలానికి): రూపాయలు ${wages}. రోజుకు సగటు వేతనం: రూపాయలు ${avgWage}.`,
              `కుటుంబం మరియు పని వివరాలు: మొత్తం పనిచేసిన కుటుంబాలు: ${households}. పూర్తయిన పనుల సంఖ్య: ${completedWorks}.`,
              `ఇది మీ జిల్లాకు ${MGNREGA_FULL_FORM} యొక్క పూర్తి పనితీరు సారాంశం.`
          ],
          gu: [
              `${MGNREGA_FULL_FORM} પ્રદર્શન અહેવાલ ${selectedDistrict.district_name} જિલ્લા માટે. સમયગાળો: ${periodEnglish}.`,
              `કાર્યકરની વિગતો: કુલ કાર્યકરો: ${workers}. મહિલાઓના માનવ-દિવસો: ${women}. અનુસૂચિત જાતિના માનવ-દિવસો: ${scPersondays}. અનુસૂચિત જનજાતિના માનવ-દિવસો: ${stPersondays}.`,
              `વેતનની વિગતો: કુલ વેતન (આ સમયગાળા માટે): રૂપિયા ${wages}. વ્યક્તિ દીઠ સરેરાશ દૈનિક વેતન: રૂપિયા ${avgWage}.`,
              `પરિવાર અને કાર્યની વિગતો: કુલ કાર્યરત પરિવારો: ${households}. પૂર્ણ થયેલ કાર્યોની સંખ્યા: ${completedWorks}.`,
              `આ તમારા જિલ્લા માટે ${MGNREGA_FULL_FORM} નો સંપૂર્ણ પ્રદર્શન સારાંશ હતો.`
          ]
      };
      
      text = scriptTranslations[language].join(' ');
    }

    try {
      setIsSpeaking(true);
      await speakWithGoogleTTS(text, ttsLang.ttsCode);
      
      const estimatedDuration = text.split(' ').length * 400;
      setTimeout(() => setIsSpeaking(false), estimatedDuration);
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };


  if (loading && districts.length === 0) {
    return (
      <div className="loading-screen">
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p className="loading-text">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <header className="header-sticky">
        <div className="header-content">
          <div className="header-logo-group">
            <div>
              <h1 className="header-title">{t.title}</h1>
              <p className="header-subtitle">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="header-actions">
            <LanguageSelector 
              currentLanguage={language}
              onLanguageChange={handleLanguageSelect}
              translations={translations}
            />

            {selectedDistrict && (
              <button
                onClick={handleSpeak}
                className={`speech-button ${isSpeaking ? 'stop' : 'speak'}`}
                title={isSpeaking ? 'रोकें / Stop' : 'सुनें / Listen'}
              >
                {isSpeaking ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="selector-card">
          <div className="selector-header">
            <MapPin className="selector-header-icon" size={24} />
            <h2 className="selector-title">{t.selectDistrict}</h2>
          </div>
          
          {detectingLocation && (
            <div className="location-status">
              <p className="text-blue-700 text-sm">{t.detectingLocation}</p>
            </div>
          )}
          
          <DistrictSelector
            districts={districts}
            selectedDistrict={selectedDistrict}
            onChange={handleDistrictChange}
            language={language}
          />
        </div>

        {selectedDistrict && performanceData.length > 0 && (
          <>
            <PerformanceCards 
              performanceData={performanceData} // UPDATED: Pass full array
              districtName={selectedDistrict.district_name}
              language={language}
            />
            
            <div className="my-8">
              <TrendsChart data={performanceData} language={language} />
            </div>
          </>
        )}

        {selectedDistrict && performanceData.length === 0 && !loading && (
          <div className="no-data-card text-center">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {t.noDataTitle}
            </h3>
            <p className="text-gray-500">
              {t.noDataMessage}
            </p>
          </div>
        )}

        {error && (
          <div className="error-box mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>{t.dataSource}</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;