import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { District } from '../lib/supabase';
import { ChevronDown } from 'lucide-react';

interface Props {
  districts: District[];
  selectedDistrict: District | null;
  onChange: (district: District) => void;
  language: 'hi' | 'en';
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
  

  return (
    <div className="district-select-container" ref={containerRef}>
      <select 
        value={selectedDistrict?.district_code || ''}
        onChange={() => {}}
        className="district-select"
        hidden
      >
        <option value="">-- जिला चुनें / Select District --</option>
      </select>
      
      <div className="district-input-wrapper">
        <input
          type="text"
          placeholder={language === 'hi' ? '-- जिला चुनें / Search District --' : '-- Select District / Search --'}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="district-input"
          autoComplete="off"
        />
        <ChevronDown 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" 
            size={20}
        />
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
              कोई जिला नहीं मिला / No district found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DistrictSelector;