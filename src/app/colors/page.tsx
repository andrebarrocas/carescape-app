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

      // Fetch colors again to update the list
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Colors</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search colors..."
                  className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Name</label>
                <input
                  type="text"
                  value={filters.color}
                  onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Filter by color name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Material</label>
                <input
                  type="text"
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Filter by source"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={filters.place}
                  onChange={(e) => setFilters({ ...filters, place: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Filter by location"
                />
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading colors...</p>
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
                <p className="text-gray-500">No colors found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>

      <AddColorButton onSubmit={handleColorSubmit} />
    </div>
  );
} 