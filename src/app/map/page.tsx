'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter } from 'lucide-react';
import Map from '@/components/Map';
import { ColorSubmission } from '@/types/colors';
import AddColorButton from '@/components/AddColorButton';
import { useRouter } from 'next/navigation';

export default function MapPage() {
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
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isMapFilterOpen, setIsMapFilterOpen] = useState(false);
  const [selectedColorForFilter, setSelectedColorForFilter] = useState<ColorSubmission | null>(null);
  const router = useRouter();
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchColors();
  }, []);

  useEffect(() => {
    if (colors) {
      filterColors();
    }
  }, [searchTerm, filters, colors]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsMapFilterOpen(false);
      }
    };

    if (isMapFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMapFilterOpen]);

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

  const handleMapFilter = (filterType: string) => {
    if (selectedFilter === filterType) {
      setSelectedFilter(null);
      setFilteredColors(colors);
    } else {
      setSelectedFilter(filterType);
      // Apply the filter based on the selected color
      const referenceColor = selectedColorForFilter;
      if (referenceColor) {
        let filtered: ColorSubmission[] = [];
        
        switch (filterType) {
          case 'same-color':
            filtered = colors.filter(color => 
              color.name.toLowerCase() === referenceColor.name.toLowerCase()
            );
            break;
          case 'same-material':
            const referenceMaterials = referenceColor.materials.map(m => m.name.toLowerCase());
            filtered = colors.filter(color => 
              color.materials.some(material => 
                referenceMaterials.includes(material.name.toLowerCase())
              )
            );
            break;
          case 'same-location':
            filtered = colors.filter(color => 
              color.location.toLowerCase() === referenceColor.location.toLowerCase()
            );
            break;
          default:
            filtered = colors;
        }
        setFilteredColors(filtered);
      } else {
        // If no reference color is available, show a message or reset
        console.warn('No reference color available for filtering');
        setSelectedFilter(null);
        // Don't close the dropdown, let the user see the message
        return;
      }
    }
    setIsMapFilterOpen(false);
  };

  const handleColorSelect = (color: ColorSubmission) => {
    setSelectedColorForFilter(color);
  };

  const handleSubmit = async (data: any) => {
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

      router.refresh();
    } catch (error) {
      console.error('Error submitting color:', error);
      throw error;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="font-serif text-4xl text-[#2C3E50]">Color Map</h1>
            <p className="font-mono text-sm text-[#2C3E50] max-w-2xl">
              Explore the geographic distribution of natural colors across the world. Each point represents a documented color and its origin.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="border-2 border-[#2C3E50] p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C3E50]" />
                <input
                  type="text"
                  placeholder="Search colors, materials, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-6 py-3 border-2 border-[#2C3E50] font-mono text-sm hover:bg-[#2C3E50] hover:text-white transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filter Panel */}
            {isFilterOpen && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t-2 border-[#2C3E50]">
                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">Color Name</label>
                  <input
                    type="text"
                    value={filters.color}
                    onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                    placeholder="Filter by color name"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">Source Material</label>
                  <input
                    type="text"
                    value={filters.source}
                    onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                    placeholder="Filter by source"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">Location</label>
                  <input
                    type="text"
                    value={filters.place}
                    onChange={(e) => setFilters({ ...filters, place: e.target.value })}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                    placeholder="Filter by location"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Map Container */}
          <div className="border-2 border-[#2C3E50] overflow-hidden min-h-[500px] h-[60vh] relative">
            {/* Filter Status Indicator */}
            {selectedFilter && (
              <div className="absolute top-4 left-4 z-20 bg-white border-2 border-[#2C3E50] px-3 py-2 font-mono text-sm shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Filtered by: {selectedFilter.replace('same-', '')}</span>
                  <span className="text-gray-500">({filteredColors.length} results)</span>
                </div>
              </div>
            )}
            {/* --- MAP FILTER BUTTON: Always visible, high z-index, debug border --- */}
            <div className="absolute top-4 right-4 z-50 bg-white border-4 border-blue-500 rounded shadow-lg p-1">
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setIsMapFilterOpen(!isMapFilterOpen)}
                  className="bg-white border-2 border-[#2C3E50] px-4 py-2 font-mono text-sm hover:bg-[#2C3E50] hover:text-white transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                  {selectedFilter && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  <span className="text-xs text-gray-500 ml-1">
                    ({filteredColors.length})
                  </span>
                </button>
                {/* Map Filter Dropdown */}
                {isMapFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white border-2 border-[#2C3E50] shadow-lg z-50 min-w-[280px]">
                    <div className="p-4">
                      <div className="text-sm font-mono text-[#2C3E50] mb-3 font-bold">
                        Filter by same:
                      </div>
                      {/* Show selected color info */}
                      {selectedColorForFilter ? (
                        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                          <div className="text-xs font-mono text-[#2C3E50] mb-2 font-bold">Reference color:</div>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 rounded border-2 border-gray-300 shadow-sm"
                              style={{ backgroundColor: selectedColorForFilter.hex }}
                            ></div>
                            <div>
                              <span className="font-mono text-sm text-[#2C3E50] font-bold">
                                {selectedColorForFilter.name}
                              </span>
                              <div className="text-xs text-gray-600 mt-1">
                                {selectedColorForFilter.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="text-xs font-mono text-blue-700 flex items-center gap-2">
                            <span className="text-blue-600">💡</span>
                            <div>
                              <div className="font-bold mb-1">How to use filters:</div>
                              <div>1. Click on any color marker on the map</div>
                              <div>2. Select a filter type below</div>
                              <div>3. View similar colors, materials, or locations</div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleMapFilter('same-color')}
                          disabled={!selectedColorForFilter}
                          className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors rounded ${
                            selectedFilter === 'same-color' 
                              ? 'bg-[#2C3E50] text-white' 
                              : selectedColorForFilter 
                                ? 'text-[#2C3E50] hover:bg-gray-100' 
                                : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>🎨 Same Color Name</span>
                            {selectedColorForFilter && (
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {colors.filter(color => 
                                  color.name.toLowerCase() === selectedColorForFilter.name.toLowerCase()
                                ).length}
                              </span>
                            )}
                          </div>
                        </button>
                        <button
                          onClick={() => handleMapFilter('same-material')}
                          disabled={!selectedColorForFilter}
                          className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors rounded ${
                            selectedFilter === 'same-material' 
                              ? 'bg-[#2C3E50] text-white' 
                              : selectedColorForFilter 
                                ? 'text-[#2C3E50] hover:bg-gray-100' 
                                : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>🧱 Same Material</span>
                            {selectedColorForFilter && (
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {colors.filter(color => 
                                  color.materials.some(material => 
                                    selectedColorForFilter.materials.some(m => 
                                      m.name.toLowerCase() === material.name.toLowerCase()
                                    )
                                  )
                                ).length}
                              </span>
                            )}
                          </div>
                        </button>
                        <button
                          onClick={() => handleMapFilter('same-location')}
                          disabled={!selectedColorForFilter}
                          className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors rounded ${
                            selectedFilter === 'same-location' 
                              ? 'bg-[#2C3E50] text-white' 
                              : selectedColorForFilter 
                                ? 'text-[#2C3E50] hover:bg-gray-100' 
                                : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>📍 Same Location</span>
                            {selectedColorForFilter && (
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {colors.filter(color => 
                                  color.location.toLowerCase() === selectedColorForFilter.location.toLowerCase()
                                ).length}
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                      {(selectedFilter || selectedColorForFilter) && (
                        <div className="border-t border-gray-300 mt-4 pt-4">
                          {selectedFilter && (
                            <div className="text-xs font-mono text-[#2C3E50] mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                              Active filter: <span className="font-bold">{selectedFilter.replace('same-', '')}</span>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setSelectedFilter(null);
                              setSelectedColorForFilter(null);
                              setFilteredColors(colors);
                              setIsMapFilterOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 font-mono text-sm text-red-600 hover:bg-red-50 transition-colors rounded"
                          >
                            🗑️ Clear All Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#2C3E50] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-mono text-sm text-[#2C3E50]">Loading colors...</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0">
                <Map 
                  colors={filteredColors} 
                  onColorSelect={handleColorSelect}
                  selectedColorForFilter={selectedColorForFilter}
                />
              </div>
            )}
          </div>

          {/* Add Color Button - Fixed Position */}
          <div className="fixed bottom-8 right-8 z-50">
            <AddColorButton onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </main>
  );
} 