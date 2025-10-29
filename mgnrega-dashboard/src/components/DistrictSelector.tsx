import React from 'react';
import type { District } from '../lib/supabase';

interface Props {
  districts: District[];
  selectedDistrict: District | null;
  onChange: (district: District) => void;
}

const DistrictSelector: React.FC<Props> = ({ districts, selectedDistrict, onChange }) => {
  return (
    <div className="district-select-container">
      <select
        value={selectedDistrict?.district_code || ''}
        onChange={(e) => {
          const district = districts.find(d => d.district_code === e.target.value);
          if (district) onChange(district);
        }}
        className="district-select"
      >
        <option value="">-- जिला चुनें / Select District --</option>
        {districts.map((district) => (
          <option key={district.district_code} value={district.district_code}>
            {district.district_name} ({district.state_name})
          </option>
        ))}
      </select>
      <div className="select-arrow">
        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
};

export default DistrictSelector;