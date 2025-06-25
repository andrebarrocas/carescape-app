import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MapFilterButtonsProps {
  onFilterChange: (filter: string) => void;
}

export default function MapFilterButtons({ onFilterChange }: MapFilterButtonsProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isExploreHovered, setIsExploreHovered] = useState(false);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  const handleCareScapeClick = () => {
    handleFilterClick('all');
  };

  return (
    <>
      {/* Navigation buttons */}
      <div className="fixed top-6 left-6 z-50 flex gap-4">
        <button 
          onClick={handleCareScapeClick}
          className="bg-gradient-to-r from-red-500 via-blue-600 via-cyan-500 via-green-500 to-yellow-500 text-white text-2xl px-8 py-3 font-bold tracking-wider hover:opacity-90 transition-opacity"
        >
          CareScape
        </button>
        <Link 
          href="/about" 
          className="bg-[#A0A0A0] text-white text-2xl px-8 py-3 font-bold tracking-wider hover:bg-[#8A8A8A] transition-colors"
        >
          About
        </Link>
        {/* Explore dropdown button hidden */}
        {/*
        <div 
          className="relative"
          onMouseEnter={() => setIsExploreHovered(true)}
          onMouseLeave={() => setIsExploreHovered(false)}
        >
          <button className="bg-[#A0A0A0] text-white text-2xl px-8 py-3 font-bold tracking-wider hover:bg-[#8A8A8A] transition-colors">
            Explore
          </button>
          
          {isExploreHovered && (
            <div className="absolute top-full left-0 flex flex-row gap-2 pt-2">
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
          )}
        </div>
        */}
      </div>
    </>
  );
} 