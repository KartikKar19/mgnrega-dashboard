import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapPin, Volume2, VolumeX, Briefcase } from 'lucide-react';
import { getDistricts, getDistrictPerformance, detectUserLocation, getDistrictFromCoordinates, getDistrictFromIP, speakWithGoogleTTS, stopSpeaking } from '../services/api';
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

const getMonthAndYear = (dateStr: string, isHindi: boolean) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const monthsEng = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsHi = ['Janvari', 'Farvari', 'March', 'April', 'Mayi', 'Joon', 'Julayi', 'Agast', 'Sitambar', 'Aktubar', 'Navambar', 'Disambar'];
  return isHindi 
    ? `${monthsHi[monthNum - 1] || 'Janvari'} ${year}`
    : `${monthsEng[monthNum - 1] || 'Jan'} ${year}`;
};

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

const matchDistrict = (detectedName: string, districts: District[]): District | undefined => {
  if (!detectedName || districts.length === 0) return undefined;

  const normalize = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const removeSuffixes = (name: string): string => {
    return name
      .replace(/\b(district|city|town|urban|rural|suburban|division)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const synonymMap: { [key: string]: string } = {
    'bangalore': 'bengaluru',
    'bengaluru urban': 'bengaluru',
    'bengaluru rural': 'bengaluru rural',
    'allahabad': 'prayagraj',
    'banaras': 'varanasi',
    'benares': 'varanasi',
    'bombay': 'mumbai',
    'calcutta': 'kolkata',
    'madras': 'chennai',
    'pondicherry': 'puducherry',
    'baroda': 'vadodara',
    'poona': 'pune',
    'gauhati': 'guwahati',
    'trivandrum': 'thiruvananthapuram',
    'tehri': 'tehri garhwal',
    'garwal': 'garhwal'
  };

  const cleanDetected = normalize(detectedName);
  
  // Resolve synonyms for detected name
  let mappedDetected = cleanDetected;
  for (const [synonym, standard] of Object.entries(synonymMap)) {
    if (cleanDetected === synonym || cleanDetected.includes(synonym)) {
      mappedDetected = standard;
      break;
    }
  }

  const baseDetected = removeSuffixes(mappedDetected);

  console.log(`[Matching] Cleaned detected name: "${cleanDetected}", Mapped: "${mappedDetected}", Base: "${baseDetected}"`);

  // 1. Exact matches on full normalized name (English or Hindi)
  let match = districts.find(d => {
    const en = normalize(d.district_name_en);
    const hi = normalize(d.district_name_hi);
    return en === cleanDetected || hi === cleanDetected;
  });
  if (match) {
    console.log(`[Matching] Step 1 match found: "${match.district_name_en}"`);
    return match;
  }

  // 2. Exact matches on mapped/resolved synonym name
  match = districts.find(d => {
    const en = normalize(d.district_name_en);
    return en === mappedDetected;
  });
  if (match) {
    console.log(`[Matching] Step 2 match found: "${match.district_name_en}"`);
    return match;
  }

  // 3. Match on base names (removing "district", "urban", "rural" etc.)
  match = districts.find(d => {
    const enBase = removeSuffixes(normalize(d.district_name_en));
    const hiBase = removeSuffixes(normalize(d.district_name_hi));
    return enBase === baseDetected || hiBase === baseDetected;
  });
  if (match) {
    console.log(`[Matching] Step 3 match found: "${match.district_name_en}"`);
    return match;
  }

  // 4. Substring check: Does one contain the other?
  match = districts.find(d => {
    const en = normalize(d.district_name_en);
    const hi = normalize(d.district_name_hi);
    const enBase = removeSuffixes(en);
    return en.includes(baseDetected) || 
           baseDetected.includes(enBase) || 
           hi.includes(baseDetected);
  });
  
  if (match) {
    console.log(`[Matching] Step 4 match found: "${match.district_name_en}"`);
  } else {
    console.log(`[Matching] No match found for "${detectedName}"`);
  }
  return match;
};

const Dashboard: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [performanceData, setPerformanceData] = useState<DistrictPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [autoDetectMessage, setAutoDetectMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('hi');

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
    detectLocation: string;
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
      noDistrictFound: 'No district found',
      detectLocation: 'Detect Location'
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
      noDistrictFound: 'कोई जिला नहीं मिला / No district found',
      detectLocation: 'स्थान पहचानें'
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
      noDistrictFound: 'जिल्हा सापडला नाही',
      detectLocation: 'स्थान शोधा'
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
      noDistrictFound: 'ಯಾವುದೇ ಜಿಲ್ಲೆ ಕಂಡುಬಂದಿಲ್ಲ',
      detectLocation: 'ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ'
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
      noDistrictFound: 'ਕੋਈ ਜ਼ਿਲ੍ਹਾ ਨਹੀਂ ਲੱਭਿਆ',
      detectLocation: 'ਸਥਾਨ ਲੱਭੋ'
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
      noDistrictFound: 'কোন জেলা পাওয়া যায়নি',
      detectLocation: 'স্থান সনাক্তকরণ'
    },
    ta: {
      title: `${MGNREGA_FULL_FORM} டாஷ்போர்டு`,
      subtitle: 'மகாத்மா காந்தி தேசிய ஊரக வேலை உறுதிச் Sagar செயல்திறன் டாஷ்போர்டு',
      selectDistrict: 'உங்கள் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்',
      loading: 'ஏற்றப்படுகிறது...',
      detectingLocation: '📍 உங்கள் இருப்பிடம் கண்டறியப்படுகிறது...',
      noDataTitle: 'தரவு எதுவும் கிடைக்கவில்லை',
      noDataMessage: 'இந்த மாவட்டத்திற்கான செயல்திறன் தரவு கிடைக்கவில்லை.',
      dataSource: 'தரவு ஆதாரம்: ஊரக வளர்ச்சி அமைச்சகம், இந்திய அரசு',
      switchToMenu: 'மொழியை மாற்று',
      searchDistrict: '-- மாவட்டத்தைத் தேர்ந்தெடுக்கவும் / Search District --',
      noDistrictFound: 'மாவட்டம் எதுவும் கண்டறியப்படவில்லை',
      detectLocation: 'இருப்பிடத்தைக் கண்டுபிடி'
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
      noDistrictFound: 'జిల్లా ఏదీ కనుగొనబడలేదు',
      detectLocation: 'స్థానాన్ని కనుగొను'
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
      noDistrictFound: 'કોઈ જિલ્લો મળ્યો નથી',
      detectLocation: 'સ્થાન શોધો'
    }
  };

  const t = translations[language];

  const loadPerformanceData = useCallback(async (districtNameEn: string) => {
    try {
      setLoading(true);
      const data = await getDistrictPerformance(districtNameEn);
      setPerformanceData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load performance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDistricts = useCallback(async () => {
    try {
      setLoading(true);
      setAutoDetectMessage(null);
      const data = await getDistricts();
      setDistricts(data);
    } catch (err) {
      setError('Failed to load districts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const autoDetectDistrict = useCallback(async (isManual: boolean = false) => {
    if (districts.length === 0) return;
    setAutoDetectMessage(null);

    try {
      setDetectingLocation(true);
      let districtName: string | null = null;
      let matchedDistrict: District | undefined;

      // 1. Try browser geolocation
      try {
        const location = await detectUserLocation();
        if (location) {
          districtName = await getDistrictFromCoordinates(location.lat, location.lng);
        }
      } catch (geoErr) {
        console.warn('Browser geolocation failed/denied, trying IP geolocation...', geoErr);
      }

      // 2. Try IP-based location if geolocation failed/denied or returned nothing
      if (!districtName) {
        try {
          districtName = await getDistrictFromIP();
        } catch (ipErr) {
          console.warn('IP geolocation failed...', ipErr);
        }
      }

      // 3. Match against loaded districts list
      if (districtName) {
        console.log(`[AutoDetect] Attempting to match detected name: "${districtName}"`);
        matchedDistrict = matchDistrict(districtName, districts);
        if (matchedDistrict) {
          console.log(`[AutoDetect] Successfully matched to: "${matchedDistrict.district_name_en}"`);
        } else {
          console.warn(`[AutoDetect] Could not find any district match for: "${districtName}"`);
        }
      }

      // 4. Set selected district or handle failure
      if (matchedDistrict) {
        setSelectedDistrict(matchedDistrict);
        await loadPerformanceData(matchedDistrict.district_name_en);
        if (isManual) {
          setAutoDetectMessage(
            language === 'hi' 
              ? `📍 आपका स्थान खोजा गया: ${matchedDistrict.district_name_hi}`
              : `📍 Location detected: ${matchedDistrict.district_name_en}`
          );
        }
      } else {
        // Fallback to BENGALURU if available, otherwise districts[0]
        const fallbackDistrict = districts.find(d => d.district_name_en.toUpperCase() === 'BENGALURU') || districts[0];
        setSelectedDistrict(fallbackDistrict);
        await loadPerformanceData(fallbackDistrict.district_name_en);
        
        if (isManual) {
          setAutoDetectMessage(
            language === 'hi'
              ? 'स्थान की पहचान नहीं हो सकी। डिफ़ॉल्ट जिला डेटा दिखाया जा रहा है।'
              : 'Location auto-detect did not resolve. Showing default district data.'
          );
        } else {
          setAutoDetectMessage(
            language === 'hi'
              ? 'ऑटो स्थान पहचान विफल। डिफ़ॉल्ट जिला डेटा दिखाया जा रहा है।'
              : 'Location auto-detect did not resolve. Showing default district data.'
          );
        }
      }
    } catch (err) {
      console.error('Could not auto-detect location:', err);
      const fallbackDistrict = districts.find(d => d.district_name_en.toUpperCase() === 'BENGALURU') || districts[0];
      setSelectedDistrict(fallbackDistrict);
      await loadPerformanceData(fallbackDistrict.district_name_en);
      setAutoDetectMessage(
        language === 'hi'
          ? 'स्थान पहचान त्रुटि। डिफ़ॉल्ट जिला डेटा दिखाया जा रहा है।'
          : 'Location detection failed. Showing default district data.'
      );
    } finally {
      setDetectingLocation(false);
    }
  }, [districts, loadPerformanceData, language]);

  const hasAutoDetected = useRef(false);

  useEffect(() => {
    loadDistricts();
  }, [loadDistricts]);

  useEffect(() => {
    if (districts.length > 0 && !hasAutoDetected.current) {
      hasAutoDetected.current = true;
      autoDetectDistrict(false);
    }
  }, [districts, autoDetectDistrict]);

  const handleDistrictChange = (district: District) => {
    setSelectedDistrict(district);
    loadPerformanceData(district.district_name_en);
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
    
    const periodHindi = performanceData.length > 1
      ? `${getMonthAndYear(oldest.reporting_month, true)} se lekar ${getMonthAndYear(latest.reporting_month, true)}`
      : getMonthAndYear(latest.reporting_month, true);
      
    const periodEnglish = performanceData.length > 1
      ? `from ${getMonthAndYear(oldest.reporting_month, false)} to ${getMonthAndYear(latest.reporting_month, false)}`
      : getMonthAndYear(latest.reporting_month, false);

    const districtName = language === 'hi' ? selectedDistrict.district_name_hi : selectedDistrict.district_name_en;

    if (language === 'hi') {
      const demand = numberToHindiWords(latest.work_demand);
      const allocated = numberToHindiWords(latest.work_allocated);
      const target = numberToHindiWords(latest.persondays_target);
      const achieved = numberToHindiWords(latest.persondays_achieved);
      const timeliness = latest.wage_payment_timeliness_pct.toFixed(0);
      const utilization = latest.fund_utilization_pct.toFixed(0);
      const grade = latest.overall_grade.toFixed(1);

      text = `${districtName} jile ka ${MGNREGA_FULL_FORM} pradarshan report.
        Reporting avadhi: ${periodHindi}.
        
        Kaamgaar vivaraṇ:
        Kaam ki maang karne wale kul parivaar: ${demand}.
        Kaam paane wale kul parivaar: ${allocated}.
        Nirdharit karyadivas: ${target}.
        Praapt kiye gaye karyadivas: ${achieved}.
        
        Karyadakshta aur bhugtan:
        Samay par bhugtan ka pratishat: ${timeliness} pratishat.
        Nidhi upayogita ka pratishat: ${utilization} pratishat.
        
        Jile ka kul pradarshan ank hai das mein se ${grade}.
        Yeh tha aapke jile ka sampurn pradarshan vivaraṇ.`;
    } else {
      const demand = latest.work_demand.toFixed(0);
      const allocated = latest.work_allocated.toFixed(0);
      const target = latest.persondays_target.toFixed(0);
      const achieved = latest.persondays_achieved.toFixed(0);
      const timeliness = latest.wage_payment_timeliness_pct.toFixed(0);
      const utilization = latest.fund_utilization_pct.toFixed(0);
      const grade = latest.overall_grade.toFixed(1);

      const scriptTranslations: Record<LanguageCode, string[]> = {
          hi: [''],
          en: [
              `Mahatma Gandhi National Rural Employment Guarantee Act performance report for ${districtName} district. Period: ${periodEnglish}.`,
              `Work Details: Households demanding work: ${demand}. Households provided work: ${allocated}.`,
              `Persondays Details: Target persondays: ${target}. Achieved persondays: ${achieved}.`,
              `Efficiency: Wage payment timeliness: ${timeliness} percent. Fund utilization: ${utilization} percent.`,
              `The overall performance score is ${grade} out of 10.`,
              `This was the complete performance summary for your district.`
          ],
          mr: [
            `${districtName} जिल्ह्यासाठी मनरेगा कार्यप्रदर्शन अहवाल. कालावधी: ${periodEnglish}.`,
            `कामाचा तपशील: कामाची मागणी करणारी कुटुंबे: ${demand}. काम पुरवलेली कुटुंबे: ${allocated}.`,
            `मनुष्यदिवस तपशील: लक्ष्य मनुष्यदिवस: ${target}. पूर्ण झालेले मनुष्यदिवस: ${achieved}.`,
            `कार्यक्षमता: वेळेत वेतन देण्याचे प्रमाण: ${timeliness} टक्के. निधीचा वापर: ${utilization} टक्के.`,
            `एकूण कार्यप्रदर्शन धावसंख्या १० पैकी ${grade} आहे.`,
            `हा तुमच्या जिल्ह्याचा संपूर्ण कार्यप्रदर्शन सारांश होता.`
          ],
          kn: [
              `${districtName} ಜಿಲ್ಲೆಯ ಮಗನರೇಗಾ ಕಾರ್ಯಕ್ಷಮತೆ ವರದಿ. ಅವಧಿ: ${periodEnglish}.`,
              `ಕೆಲಸದ ವಿವರಗಳು: ಕೆಲಸಕ್ಕಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ಕುಟುಂಬಗಳು: ${demand}. ಕೆಲಸ ಒದಗಿಸಿದ ಕುಟುಂಬಗಳು: ${allocated}.`,
              `ಮಾನವ ದಿನಗಳ ವಿವರಗಳು: ಗುರಿ ಮಾನವ ದಿನಗಳು: ${target}. ಸಾಧಿಸಿದ ಮಾನವ ದಿನಗಳು: ${achieved}.`,
              `ದಕ್ಷತೆ: સમયಕ್ಕೆ ವೇತನ ಪಾವತಿ: ಶೇಕಡಾ ${timeliness}. ಹಣ ಬಳಕೆ: ಶೇಕಡಾ ${utilization}.`,
              `ಒಟ್ಟು ಕಾರ್ಯಕ್ಷಮತೆಯ ಸ್ಕೋರ್ ೧೦ ಕ್ಕೆ ${grade} ಆಗಿದೆ.`,
              `ಇದು ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಕಾರ್ಯಕ್ಷಮತೆಯ ಸಂಪೂರ್ಣ ಸಾರಾಂಶವಾಗಿದೆ.`
          ],
          pa: [
              `ਮਨਰੇਗਾ ਦੀ ਕਾਰਗੁਜ਼ਾਰੀ ਰਿਪੋਰਟ ${districtName} ਜ਼ਿਲ੍ਹੇ ਲਈ। ਸਮਾਂ: ${periodEnglish}.`,
              `ਕੰਮ ਦੇ ਵੇਰਵੇ: ਕੰਮ ਮੰਗਣ ਵਾਲੇ ਪਰਿਵਾਰ: ${demand}। ਕੰਮ ਦਿੱਤੇ ਗਏ ਪਰਿਵਾਰ: ${allocated}।`,
              `ਕਾਰਜ ਦਿਵਸ ਵੇਰਵੇ: ਨਿਸ਼ਾਨਾ ਕਾਰਜ ਦਿਵਸ: ${target}। ਪ੍ਰਾਪਤ ਕੀਤੇ ਕਾਰਜ ਦਿਵਸ: ${achieved}।`,
              `ਕਾਰਜਕੁਸ਼ਲਤਾ: ਸਮੇਂ ਸਿਰ ਭੁਗਤਾਨ: ${timeliness} ਪ੍ਰਤੀਸ਼ਤ। ਫੰਡ ਦੀ ਵਰਤੋਂ: ${utilization} ਪ੍ਰਤੀਸ਼ਤ।`,
              `ਕੁੱਲ ਕਾਰਗੁਜ਼ਾਰੀ ਸਕੋਰ 10 ਵਿੱਚੋਂ ${grade} ਹੈ।`,
              `ਇਹ ਤੁਹਾਡੇ ਜ਼ਿਲ੍ਹੇ ਦੀ ਕਾਰਗੁਜ਼ਾਰੀ ਦਾ ਸੰਪੂਰਨ ਸਾਰਾਂਸ਼ ਸੀ।`
          ],
          bn: [
              `মনরেগা কর্মক্ষমতা রিপোর্ট ${districtName} জেলার জন্য। সময়কাল: ${periodEnglish}.`,
              `কাজের বিবরণ: কাজ চাওয়া পরিবার: ${demand}. কাজ দেওয়া পরিবার: ${allocated}.`,
              `কর্মদিবসের বিবরণ: লক্ষ্য কর্মদিবস: ${target}. অর্জিত কর্মদিবস: ${achieved}.`,
              `দক্ষতা: সময়মতো মজুরি প্রদান: ${timeliness} শতাংশ. তহবিল ব্যবহার: ${utilization} শতাংশ.`,
              `সামগ্রিক কর্মক্ষমতা স্কোর ১০ এর মধ্যে ${grade}.`,
              `এটি আপনার জেলার সম্পূর্ণ পারফরম্যান্স সারাংশ ছিল।`
          ],
          ta: [
              `வேலை உறுதிச் சட்ட செயல்திறன் அறிக்கை ${districtName} மாவட்டத்திற்காக. காலம்: ${periodEnglish}.`,
              `வேலை விவரங்கள்: வேலை கோரும் குடும்பங்கள்: ${demand}. வேலை வழங்கப்பட்ட குடும்பங்கள்: ${allocated}.`,
              `மனித நாட்கள் விவரங்கள்: இலக்கு மனித நாட்கள்: ${target}. சாதித்த மனித நாட்கள்: ${achieved}.`,
              `திறன்: சரியான நேரத்தில் ஊதியம் வழங்குதல்: ${timeliness} சதவீதம். நிதி பயன்பாடு: ${utilization} சதவீதம்.`,
              `ஒட்டுமொத்த செயல்திறன் மதிப்பெண் 10க்கு ${grade} ஆகும்.`,
              `இது உங்கள் மாவட்டத்திற்கான முழுமையான செயல்திறன் சுருக்கம்.`
          ],
          te: [
              `మగనరేగా పనితీరు నివేదన ${districtName} జిల్లా కోసం. కాలం: ${periodEnglish}.`,
              `కార్మికుల వివరాలు: పని కోరిన కుటుంబాలు: ${demand}. పని కల్పించిన కుటుంబాలు: ${allocated}.`,
              `పనిదినాల వివరాలు: లక్ష్యం పనిదినాలు: ${target}. సాధించిన పనిదినాలు: ${achieved}.`,
              `సామర్థ్యం: సమయానికి వేతన చెల్లింపులు: ${timeliness} శాతం. నిధుల వినియోగం: ${utilization} శాతం.`,
              `మొత్తం పనితీరు స్కోరు 10 కి ${grade}.`,
              `ఇది మీ జిల్లా యొక్క పూర్తి పనితీరు సారాంశం.`
          ],
          gu: [
              `મનરેગા પ્રદર્શન અહેવાલ ${districtName} જિલ્લા માટે. સમયગાળો: ${periodEnglish}.`,
              `કાર્યની વિગતો: કામ માંગતા પરિવારો: ${demand}. કામ આપેલા પરિવારો: ${allocated}.`,
              `માનવ-દિવસોની વિગતો: લક્ષ્યાંકિત માનવ-દિવસો: ${target}. પ્રાપ્ત થયેલ માનવ-照顾દવસો: ${achieved}.`,
              `કાર્યક્ષમતા: સમયસર વેતન ચૂકવણી: ${timeliness} ટકા. ભંડોળનો વપરાશ: ${utilization} ટકા.`,
              `એકંદર કામગીરીનો સ્કોર ૧૦ માંથી ${grade} છે.`,
              `આ તમારા જિલ્લા માટે પ્રદર્શનનો સંપૂર્ણ સારાંશ હતો.`
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

  const currentDistrictName = selectedDistrict 
    ? (language === 'hi' ? selectedDistrict.district_name_hi : selectedDistrict.district_name_en)
    : '';

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
            <div className="selector-header-title-group">
              <MapPin className="selector-header-icon" size={24} />
              <h2 className="selector-title">{t.selectDistrict}</h2>
            </div>
            <button
              onClick={() => autoDetectDistrict(true)}
              disabled={detectingLocation}
              className="detect-location-btn"
              title={t.detectLocation}
            >
              {detectingLocation ? '...' : t.detectLocation}
            </button>
          </div>
          
          {detectingLocation && (
            <div className="location-status">
              <p className="text-blue-700 text-sm">{t.detectingLocation}</p>
            </div>
          )}
          {autoDetectMessage && (
            <div className="location-status">
              <p className="text-orange-600 text-sm">{autoDetectMessage}</p>
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
              performanceData={performanceData}
              districtName={currentDistrictName}
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