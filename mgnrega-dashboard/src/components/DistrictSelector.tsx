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

  // Set initial search term to the selected district's name
  useEffect(() => {
    if (selectedDistrict) {
      setSearchTerm(selectedDistrict.district_name);
    } else {
      setSearchTerm('');
    }
  }, [selectedDistrict]);

  // Handle clicks outside the component to close the dropdown
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

  // Filter and sort districts based on the search term (type-ahead logic)
  const filteredDistricts = useMemo(() => {
    if (!searchTerm) {
      return districts.slice(0, 100); // Limit unsearched list size for performance
    }
    const lowerCaseSearch = searchTerm.toLowerCase();

    // 1. Filter: include districts where name or state includes the search term
    let filtered = districts.filter(d => 
      d.district_name.toLowerCase().includes(lowerCaseSearch) ||
      d.state_name.toLowerCase().includes(lowerCaseSearch)
    );

    // 2. Sort: prioritize districts that start with the search term (e.g., "guru" brings "Gurugram" to top)
    filtered.sort((a, b) => {
      const aStarts = a.district_name.toLowerCase().startsWith(lowerCaseSearch);
      const bStarts = b.district_name.toLowerCase().startsWith(lowerCaseSearch);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.district_name.localeCompare(b.district_name); // Secondary sort by name
    });

    return filtered;
  }, [districts, searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    // Note: We intentionally DO NOT call onChange here, only on selection.
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
      // Small delay to allow click on dropdown option to register before closing
      setTimeout(() => {
          if (!containerRef.current?.contains(document.activeElement)) {
              // If nothing was selected, revert to the last selected district name or clear
              
              // FIX: Only revert the search term to the selected district's name if 
              // the user explicitly cleared the input (searchTerm === ''). 
              // This allows new search terms to persist on blur.
              if (selectedDistrict && searchTerm === '') {
                  setSearchTerm(selectedDistrict.district_name);
              } else if (!selectedDistrict && searchTerm) {
                   // If they typed something but didn't select and no district is selected, clear the input
                   setSearchTerm('');
              }
              
              setIsOpen(false);
          }
      }, 100);
  };
  

  return (
    <div className="district-select-container" ref={containerRef}>
      {/* The original select and arrow classes are now hidden by CSS */}
      <select 
        value={selectedDistrict?.district_code || ''}
        onChange={() => {}} // Dummy onChange to satisfy the original component structure/typing
        className="district-select"
        hidden // Explicitly hide the old select element
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
                onMouseDown={(e) => { // Use onMouseDown to prevent blur from closing before click registers
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