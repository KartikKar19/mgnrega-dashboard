import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Users, Briefcase, Volume2, VolumeX } from 'lucide-react';
import { getDistricts, getDistrictPerformance, detectUserLocation, getDistrictFromCoordinates, speakText, stopSpeaking } from '../services/api';
import type { District, DistrictPerformance } from '../lib/supabase';
import { formatNumber, formatCurrency } from '../lib/supabase';
import DistrictSelector from './DistrictSelector';
import PerformanceCards from './PerformanceCards';
import TrendsChart from './TrendsChart';

const Dashboard: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [performanceData, setPerformanceData] = useState<DistrictPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load districts on mount
  useEffect(() => {
    loadDistricts();
  }, []);

  // Auto-detect location on mount
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
          // Find matching district
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

  const handleSpeak = () => {
    if (!selectedDistrict || performanceData.length === 0) return;
    
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const latest = performanceData[0];
      const text = `${selectedDistrict.district_name} जिले में MGNREGA प्रदर्शन। 
        कुल कामगार: ${formatNumber(latest.Total_No_of_Workers)}। 
        कुल वेतन: ${formatCurrency(latest.Wages)}। 
        महिला कार्य दिवस: ${formatNumber(latest.Women_Persondays)}।`;
      
      speakText(text, 'hi-IN');
      setIsSpeaking(true);
      
      // Reset after speaking
      setTimeout(() => setIsSpeaking(false), 5000);
    }
  };

  if (loading && districts.length === 0) {
    return (
      <div className="loading-screen">
        <div className="loading-indicator">
          <div className="animate-spin loading-spinner"></div>
          <p className="loading-text">लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="header-sticky">
        <div className="header-content">
          <div className="header-logo-group">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png" 
              alt="India Flag" 
              className="h-10 w-15"
            />
            <div>
              <h1 className="header-title">MGNREGA Dashboard</h1>
              <p className="header-subtitle">मनरेगा प्रदर्शन डैशबोर्ड</p>
            </div>
          </div>
          
          {selectedDistrict && (
            <button
              onClick={handleSpeak}
              className={`speech-button ${isSpeaking ? 'stop' : 'speak'}`}
              title={isSpeaking ? 'रोकें' : 'सुनें'}
            >
              {isSpeaking ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
            </button>
          )}
        </div>
      </header>

      <main className="main-content">
        {/* District Selector */}
        <div className="selector-card">
          <div className="selector-header">
            <MapPin className="selector-header-icon" size={24} />
            <h2 className="selector-title">
              अपना जिला चुनें / Select Your District
            </h2>
          </div>
          
          {detectingLocation && (
            <div className="location-status">
              <p className="text-blue-700 text-sm">📍 आपका स्थान खोजा जा रहा है...</p>
            </div>
          )}
          
          <DistrictSelector
            districts={districts}
            selectedDistrict={selectedDistrict}
            onChange={handleDistrictChange}
          />
        </div>

        {/* Performance Data */}
        {selectedDistrict && performanceData.length > 0 && (
          <>
            <PerformanceCards 
              data={performanceData[0]} 
              districtName={selectedDistrict.district_name}
            />
            
            <TrendsChart data={performanceData} />
          </>
        )}

        {/* No Data State */}
        {selectedDistrict && performanceData.length === 0 && !loading && (
          <div className="no-data-card text-center">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              कोई डेटा उपलब्ध नहीं
            </h3>
            <p className="text-gray-500">
              इस जिले के लिए प्रदर्शन डेटा उपलब्ध नहीं है।
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-box mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>Data Source: Ministry of Rural Development, Government of India</p>
          <p className="mt-1">डेटा स्रोत: ग्रामीण विकास मंत्रालय, भारत सरकार</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;