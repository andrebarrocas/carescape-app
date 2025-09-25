import { useState } from 'react';
import Link from 'next/link';
import { Filter } from 'lucide-react';

interface MapFilterButtonsProps {
  onFilterChange: (filter: string) => void;
  onColorFilterChange?: (filters: { color: string; material: string; location: string }) => void;
}

export default function MapFilterButtons({ onFilterChange, onColorFilterChange }: MapFilterButtonsProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  const handleCareScapeClick = () => {
    handleFilterClick('all');
  };

  // Call when any color filter changes
  const handleColorFilterChange = (field: 'color' | 'material' | 'location', value: string) => {
    if (field === 'color') setColor(value);
    if (field === 'material') setMaterial(value);
    if (field === 'location') setLocation(value);
    if (onColorFilterChange) {
      onColorFilterChange({
        color: field === 'color' ? value : color,
        material: field === 'material' ? value : material,
        location: field === 'location' ? value : location,
      });
    }
  };

  return (
    <>
      {/* Navigation buttons (left) */}
      <div className="fixed top-6 left-6 z-50 flex gap-4">
        <button 
          onClick={handleCareScapeClick}
          className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white text-2xl px-8 py-3 font-bold tracking-wider hover:opacity-90 transition-opacity"
        >
          CareScape
        </button>
        <Link 
          href="/about" 
          className="bg-[#A0A0A0] text-white text-2xl px-8 py-3 font-bold tracking-wider hover:bg-[#8A8A8A] transition-colors"
        >
          About
        </Link>
      </div>
      {/* Filter Icon and UI (right, above menu) */}
      <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-2 min-w-[220px]">
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`bg-white/90 border border-gray-300 rounded-full shadow p-2 flex items-center justify-center hover:bg-gray-100 transition-colors ${showFilters ? 'ring-2 ring-blue-400' : ''}`}
          aria-label="Show filters"
        >
          <Filter className="w-6 h-6 text-gray-700" />
        </button>
        {showFilters && (
          <div className="bg-white/90 border border-gray-300 rounded-lg shadow p-2 flex flex-col gap-2 w-full max-w-xs mt-2">
            <input
              type="text"
              placeholder="Filter by color name"
              value={color}
              onChange={e => handleColorFilterChange('color', e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
            />
            <input
              type="text"
              placeholder="Filter by material"
              value={material}
              onChange={e => handleColorFilterChange('material', e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
            />
            <input
              type="text"
              placeholder="Filter by location"
              value={location}
              onChange={e => handleColorFilterChange('location', e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
            />
          </div>
        )}
        {/* Existing right-side menu remains below */}
        {/*
        <div className="flex gap-4 mt-2">
          <button
            onClick={() => handleFilterClick('colors')}
            className={`text-white text-2xl px-8 py-3 font-bold tracking-wider transition-colors ${
              activeFilter === 'colors'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-[#A0A0A0] hover:bg-[#8A8A8A]'
            }`}
          >
            Colors
          </button>
          <button
            onClick={() => handleFilterClick('animals')}
            className={`text-white text-2xl px-8 py-3 font-bold tracking-wider transition-colors ${
              activeFilter === 'animals'
                ? 'bg-gray-800 hover:bg-gray-900'
                : 'bg-[#A0A0A0] hover:bg-[#8A8A8A]'
            }`}
          >
            Biodiversity
          </button>
        </div>
        */}
      </div>
    </>
  );
} 