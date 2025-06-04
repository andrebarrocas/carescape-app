'use client';

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import Map from '@/components/Map';
import { ColorSubmission } from '@/types/colors';
import { ToastProvider } from '@/components/ui/toast';
import AddColorButton from '@/components/AddColorButton';
import { MapPin } from 'lucide-react';

export default function MapPage() {
  const [colors, setColors] = useState<ColorSubmission[]>([]);
  const [filteredColors, setFilteredColors] = useState<ColorSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    color: '',
    source: '',
    place: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchColors();
  }, []);

  useEffect(() => {
    if (colors) {
      filterColors();
    }
  }, [searchTerm, filters, colors]);

  const fetchColors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/colors');
      const data = await response.json();
      setColors(data);
      setFilteredColors(data);
    } catch (error) {
      console.error('Error fetching colors:', error);
      setColors([]);
      setFilteredColors([]);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">Caring Dictionary of Landscape Colors</h1>
            <p className="text-lg opacity-90">Explore natural colors by their geographic origins</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search colors, materials, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filter Panel */}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading colors...</p>
            </div>
          ) : (
            <div className="h-[calc(100vh-24rem)] rounded-xl overflow-hidden shadow-lg">
              <Map colors={filteredColors} />
            </div>
          )}
        </div>

        <AddColorButton />
      </div>
    </ToastProvider>
  );
} 