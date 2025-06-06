'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import AddColorButton from '@/components/AddColorButton';
import { ColorSubmission } from '@/types/colors';
import ColorPlaceholder from '@/components/ColorPlaceholder';
import { useRouter } from 'next/navigation';

export default function ColorsPage() {
  const [mounted, setMounted] = useState(false);
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
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
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
      const response = await fetch(`${window.location.origin}/api/colors`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch colors: ${errorText}`);
      }
      const data = await response.json();
      console.log('Fetched colors:', data);
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

  const handleImageError = (colorId: string, imageUrl: string) => {
    console.log('Image load error:', { colorId, imageUrl }); // Debug log
    setImageLoadErrors(prev => ({ ...prev, [colorId]: true }));
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

  const handleAddColor = () => {
    router.push('/colors/new');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Caring Dictionary of Landscape Colors</h1>
          <p className="text-lg opacity-90">Discover the beauty of natural colors from around the world</p>
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
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading colors...</p>
          </div>
        ) : (
          <>
            {/* Color Grid */}
            {Array.isArray(filteredColors) && filteredColors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredColors.map((color) => (
                  <div
                    key={color.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200"
                  >
                    <div className="relative aspect-square">
                      {color.mediaUploads && color.mediaUploads.length > 0 && !imageLoadErrors[color.id] ? (
                        <div 
                          className="w-full h-full bg-cover bg-center rounded-t-xl"
                          style={{
                            backgroundColor: color.hex,
                            backgroundImage: `url(${color.mediaUploads[0].url})`,
                          }}
                          onError={() => handleImageError(color.id, color.mediaUploads[0].url)}
                        />
                      ) : (
                        <div className="w-full h-full">
                          <ColorPlaceholder hex={color.hex} name={color.name} />
                        </div>
                      )}
                      <div
                        className="absolute bottom-4 right-4 w-12 h-12 rounded-full shadow-lg border-4 border-white"
                        style={{ backgroundColor: color.hex }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">{color.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {color.materials.map(m => m.name).join(', ')}
                      </p>
                      <p className="text-sm text-gray-500">{color.location}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {color.processes.map(p => (
                          <span
                            key={p.id}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {p.application}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
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

      <AddColorButton />
    </div>
  );
} 