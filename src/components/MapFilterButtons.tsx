import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MapFilterButtonsProps {
  onFilterChange: (filter: string) => void;
}

export default function MapFilterButtons({ onFilterChange }: MapFilterButtonsProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  return (
    <>
      {/* Navigation buttons */}
      <div className="fixed top-6 left-6 z-50 flex gap-4">
        <Link 
          href="/" 
          className="bg-black text-white text-2xl px-8 py-3 font-bold tracking-wider hover:bg-gray-900 transition-colors"
        >
          BoS Manifesto
        </Link>
        <Link 
          href="/About" 
          className="bg-red-600 text-white text-2xl px-8 py-3 font-bold tracking-wider hover:bg-red-700 transition-colors"
        >
          About
        </Link>
      </div>

      {/* Filter buttons */}
      <div className="fixed top-24 right-8 z-50 flex flex-col gap-4">
        {/* All Button - Shows both colors and animals */}
        <button
          onClick={() => handleFilterClick('all')}
          className={`bos-button text-lg px-6 py-2 flex items-center justify-center transition-colors ${
            activeFilter === 'all' ? 'bg-black text-white' : ''
          }`}
        >
          All
        </button>

        {/* Colors Button - Shows only color markers */}
        <button
          onClick={() => handleFilterClick('colors')}
          className={`bos-button text-lg px-6 py-2 flex items-center justify-center transition-colors ${
            activeFilter === 'colors' ? 'bg-red-500 text-white' : ''
          }`}
        >
          Colors
        </button>

        {/* Animals Button - Shows only animal markers */}
        <button
          onClick={() => handleFilterClick('animals')}
          className={`bos-button text-lg px-6 py-2 flex items-center justify-center transition-colors ${
            activeFilter === 'animals' ? 'bg-gray-800 text-white' : ''
          }`}
        >
          Animals
        </button>
      </div>
    </>
  );
} 