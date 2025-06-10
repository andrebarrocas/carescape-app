'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ColorCard from '@/components/ColorCard';
import AddColorButton from '@/components/AddColorButton';
import { Filter } from 'lucide-react';
import { ColorSubmission } from '@/types/colors';

export default function ColorsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [colors, setColors] = useState<ColorSubmission[]>([]);
  const [filteredColors, setFilteredColors] = useState<ColorSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    color: '',
    source: '',
    place: '',
  });

  useEffect(() => {
    setMounted(true);
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/colors');
      if (!response.ok) {
        throw new Error('Failed to fetch colors');
      }
      const data = await response.json();
      setColors(data);
      setFilteredColors(data);
    } catch (error) {
      console.error('Error fetching colors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filterColors();
  }, [searchTerm, filters, colors]);

  const handleColorSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit color');
      }

      await fetchColors();
      router.refresh();
    } catch (error) {
      console.error('Error submitting color:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    setColors(prevColors => prevColors.filter(color => color.id !== id));
    setFilteredColors(prevColors => prevColors.filter(color => color.id !== id));
  };

  const filterColors = () => {
    if (!Array.isArray(colors)) {
      return;
    }

    let filtered = [...colors];

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(color =>
        color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.materials.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        color.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Color filter
    if (filters.color) {
      filtered = filtered.filter(color =>
        color.name.toLowerCase().includes(filters.color.toLowerCase())
      );
    }

    // Source filter
    if (filters.source) {
      filtered = filtered.filter(color =>
        color.materials.some(m => m.name.toLowerCase().includes(filters.source.toLowerCase()))
      );
    }

    // Place filter
    if (filters.place) {
      filtered = filtered.filter(color =>
        color.location.toLowerCase().includes(filters.place.toLowerCase())
      );
    }

    setFilteredColors(filtered);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFFCF5]">
      <div className="container mx-auto px-4 py-8">
        <div className="relative mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-serif text-[#2C3E50] mb-2">Colors</h1>
              <p className="font-mono text-sm text-[#2C3E50] opacity-80">
                Explore and document natural colors from around the world
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search colors..."
                  className="w-64 px-4 py-2 border-2 border-[#2C3E50] rounded-none bg-transparent font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#2C3E50]"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 text-[#2C3E50] hover:bg-[#2C3E50] hover:text-[#FFFCF5] border-2 border-[#2C3E50] transition-colors font-mono text-sm"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-6 border-2 border-[#2C3E50] bg-[#FFFCF5]">
              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">Color Name</label>
                <input
                  type="text"
                  value={filters.color}
                  onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                  className="w-full p-2 border-2 border-[#2C3E50] bg-transparent font-mono text-sm"
                  placeholder="Filter by color name"
                />
              </div>
              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">Source Material</label>
                <input
                  type="text"
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  className="w-full p-2 border-2 border-[#2C3E50] bg-transparent font-mono text-sm"
                  placeholder="Filter by source"
                />
              </div>
              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">Location</label>
                <input
                  type="text"
                  value={filters.place}
                  onChange={(e) => setFilters({ ...filters, place: e.target.value })}
                  className="w-full p-2 border-2 border-[#2C3E50] bg-transparent font-mono text-sm"
                  placeholder="Filter by location"
                />
              </div>
            </div>
          )}
          
          {/* Add Color Button - Fixed Position */}
          <div className="fixed bottom-8 right-8 z-50">
            <AddColorButton onSubmit={handleColorSubmit} />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="relative w-12 h-12 mx-auto">
              <svg className="animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#2C3E50"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="#2C3E50"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p className="mt-4 font-mono text-sm text-[#2C3E50]">Loading colors...</p>
          </div>
        ) : (
          <>
            {/* Color Grid */}
            {Array.isArray(filteredColors) && filteredColors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredColors.map((color) => (
                  <ColorCard
                    key={color.id}
                    color={color}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="font-mono text-[#2C3E50]">No colors found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 