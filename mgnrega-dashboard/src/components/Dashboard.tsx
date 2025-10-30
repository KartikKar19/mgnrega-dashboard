import React, { useState, useEffect } from 'react';
import { MapPin, Volume2, VolumeX, Briefcase, Languages } from 'lucide-react';
import { getDistricts, getDistrictPerformance, detectUserLocation, getDistrictFromCoordinates, speakWithGoogleTTS, stopSpeaking } from '../services/api';
import type { District, DistrictPerformance } from '../lib/supabase';
import { numberToHindiWords } from '../lib/supabase';
import DistrictSelector from './DistrictSelector';
import PerformanceCards from './PerformanceCards';
import TrendsChart from './TrendsChart';


const MGNREGA_FULL_FORM = 'Mahatma Gandhi National Rural Employment Guarantee Act';

const Dashboard: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [performanceData, setPerformanceData] = useState<DistrictPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');

  const translations = {
    hi: {
      title: `${MGNREGA_FULL_FORM} Dashboard`,
      subtitle: 'मनरेगा प्रदर्शन डैशबोर्ड',
      selectDistrict: 'अपना जिला चुनें',
      loading: 'लोड हो रहा है...',
      detectingLocation: '📍 आपका स्थान खोजा जा रहा है...',
      noDataTitle: 'कोई डेटा उपलब्ध नहीं',
      noDataMessage: 'इस जिले के लिए प्रदर्शन डेटा उपलब्ध नहीं है।',
      dataSource: 'डेटा स्रोत: ग्रामीण विकास मंत्रालय, भारत सरकार',
      switchToEnglish: 'Switch to English',
      switchToHindi: 'हिंदी में बदलें'
    },
    en: {
      title: `${MGNREGA_FULL_FORM} Dashboard`,
      subtitle: 'MGNREGA Performance Dashboard',
      selectDistrict: 'Select Your District',
      loading: 'Loading...',
      detectingLocation: '📍 Detecting your location...',
      noDataTitle: 'No Data Available',
      noDataMessage: 'Performance data is not available for this district.',
      dataSource: 'Data Source: Ministry of Rural Development, Government of India',
      switchToEnglish: 'Switch to English',
      switchToHindi: 'हिंदी में बदलें'
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
      ? `${oldest.month} ${oldest.fin_year} se lekar ${latest.month} ${latest.fin_year}`
      : `${latest.month} ${latest.fin_year}`;
      
    const periodEnglish = performanceData.length > 1
      ? `from ${oldest.month} ${oldest.fin_year} to ${latest.month} ${latest.fin_year}`
      : `${latest.month} ${latest.fin_year}`;

    if (language === 'hi') {
      const workersWords = numberToHindiWords(latest.Total_No_of_Workers);
      const wagesWords = numberToHindiWords(latest.Wages);
      const womenWords = numberToHindiWords(latest.Women_Persondays);
      const householdsWords = numberToHindiWords(latest.Total_Households_Worked);
      const completedWorksWords = numberToHindiWords(latest.Number_of_Completed_Works);
      const avgWageWords = numberToHindiWords(latest.Average_Wage_rate_per_day_per_person);
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
        Pratidhin prathi vyakti ausat vetan: rupaye ${avgWageWords}.
        
        Parivaar aur karya vivaraṇ:
        Kul parivaar jinhone kaam kiya: ${householdsWords}.
        Poorn kiye gaye karya: ${completedWorksWords}.
        
        Yeh tha aapke jile ka sampurn ${MGNREGA_FULL_FORM} pradarshan vivaraṇ.`;
    } else {
      text = `${MGNREGA_FULL_FORM} performance report for ${selectedDistrict.district_name} district.
        Period: ${periodEnglish}.
        
        Worker Details:
        Total workers: ${latest.Total_No_of_Workers}.
        Women persondays: ${latest.Women_Persondays}.
        Scheduled Caste persondays: ${latest.SC_persondays}.
        Scheduled Tribe persondays: ${latest.ST_persondays}.
        
        Wage Details:
        Total wages (for this period): rupees ${latest.Wages}.
        Average wage per day per person: rupees ${latest.Average_Wage_rate_per_day_per_person}.
        
        Household and Work Details:
        Total households worked: ${latest.Total_Households_Worked}.
        Number of completed works: ${latest.Number_of_Completed_Works}.
        
        This was the complete ${MGNREGA_FULL_FORM} performance summary for your district.`;
    }

    try {
      setIsSpeaking(true);
      await speakWithGoogleTTS(text, language === 'hi' ? 'hi-IN' : 'en-IN');
      
      const estimatedDuration = text.split(' ').length * 400;
      setTimeout(() => setIsSpeaking(false), estimatedDuration);
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
    if (isSpeaking) {
      stopSpeaking();
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
            <button
              onClick={toggleLanguage}
              className="language-button"
              title={language === 'hi' ? t.switchToEnglish : t.switchToHindi}
            >
              <Languages size={20} className="text-gray-700" />
              <span className="language-text">{language === 'hi' ? 'EN' : 'हिं'}</span>
            </button>

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
              data={performanceData[0]} 
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