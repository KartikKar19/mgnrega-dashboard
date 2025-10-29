import React from 'react';
import type { District } from '../lib/supabase';

interface Props {
  districts: District[];
  selectedDistrict: District | null;
  onChange: (district: District) => void;
}

const DistrictSelector: React.FC<Props> = ({ districts, selectedDistrict, onChange }) => {
  return (
    <div className="relative">
      <select
        value={selectedDistrict?.district_code || ''}
        onChange={(e) => {
          const district = districts.find(d => d.district_code === e.target.value);
          if (district) onChange(district);
        }}
        className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
      >
        <option value="">-- जिला चुनें / Select District --</option>
        {districts.map((district) => (
          <option key={district.district_code} value={district.district_code}>
            {district.district_name} ({district.state_name})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
};

export default DistrictSelector;