import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { District } from '../lib/supabase';

interface Props {
  districts: District[];
  selectedDistrict: District | null;
  onChange: (district: District) => void;
  language: 'en' | 'hi' | 'pa' | 'bn' | 'ta' | 'te' | 'gu' | 'mr' | 'kn';
}

const DistrictSelector: React.FC<Props> = ({ districts, selectedDistrict, onChange, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDistrict) {
      setSearchTerm(selectedDistrict.district_name);
    } else {
      setSearchTerm('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredDistricts = useMemo(() => {
    if (!searchTerm) {
      return districts.slice(0, 100); 
    }
    const lowerCaseSearch = searchTerm.toLowerCase();

    let filtered = districts.filter(d => 
      d.district_name.toLowerCase().includes(lowerCaseSearch) ||
      d.state_name.toLowerCase().includes(lowerCaseSearch)
    );

    filtered.sort((a, b) => {
      const aStarts = a.district_name.toLowerCase().startsWith(lowerCaseSearch);
      const bStarts = b.district_name.toLowerCase().startsWith(lowerCaseSearch);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.district_name.localeCompare(b.district_name);
    });

    return filtered;
  }, [districts, searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleDistrictSelect = (district: District) => {
    setSearchTerm(district.district_name);
    onChange(district);
    setIsOpen(false);
  };
  
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
      setTimeout(() => {
          if (!containerRef.current?.contains(document.activeElement)) {
              if (selectedDistrict && searchTerm === '') {
                  setSearchTerm(selectedDistrict.district_name);
              } else if (!selectedDistrict && searchTerm) {
                  setSearchTerm('');
              }
              
              setIsOpen(false);
          }
      }, 100);
  };
  
  const placeholders = {
    hi: { placeholder: '-- जिला चुनें / Search District --', noData: 'कोई जिला नहीं मिला / No district found' },
    en: { placeholder: '-- Select District / Search --', noData: 'No district found / कोई जिला नहीं मिला' },
    mr: { placeholder: '-- जिल्हा निवडा / Search District --', noData: 'जिल्हा सापडला नाही / No district found' },
    kn: { placeholder: '-- ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ / Search District --', noData: 'ಯಾವುದೇ ಜಿಲ್ಲೆ ಕಂಡುಬಂದಿಲ್ಲ / No district found' },
    pa: { placeholder: '-- ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ / Search District --', noData: 'ਕੋਈ ਜ਼ਿਲ੍ਹਾ ਨਹੀਂ ਲੱਭਿਆ / No district found' },
    bn: { placeholder: '-- জেলা নির্বাচন করুন / Search District --', noData: 'কোন জেলা পাওয়া যায়নি / No district found' },
    ta: { placeholder: '-- மாவட்டத்தைத் தேர்ந்தெடுக்கவும் / Search District --', noData: 'மாவட்டம் எதுவும் கண்டறியப்படவில்லை / No district found' },
    te: { placeholder: '-- జిల్లాను ఎంచుకోండి / Search District --', noData: 'జిల్లా ఏదీ కనుగొనబడలేదు / No district found' },
    gu: { placeholder: '-- જિલ્લો પસંદ કરો / Search District --', noData: 'કોઈ જિલ્લો મળ્યો નથી / No district found' },
  };
  
  const t = placeholders[language] || placeholders.en;

  return (
    <div className="district-select-container" ref={containerRef}>
      <select 
        value={selectedDistrict?.district_code || ''}
        onChange={() => {}}
        className="district-select"
        style={{ display: 'none' }} // Added inline style to ensure default browser arrow is hidden
      >
        <option value="">{placeholders.hi.placeholder}</option>
      </select>
      
      <div className="district-input-wrapper">
        <input
          type="text"
          placeholder={t.placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="district-input"
          autoComplete="off"
        />
        {/* REMOVED ChevronDown icon */}
      </div>

      {isOpen && (
        <div className="district-dropdown">
          {filteredDistricts.length > 0 ? (
            filteredDistricts.map((district) => (
              <div
                key={district.district_code}
                className={`district-option ${selectedDistrict?.district_code === district.district_code ? 'selected' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault(); 
                  handleDistrictSelect(district);
                }}
              >
                {district.district_name} ({district.state_name})
              </div>
            ))
          ) : (
            <div className="district-option placeholder">
              {t.noData}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DistrictSelector;