'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import Map from '@/components/Map';
import { ColorSubmission } from '@/types/colors';
import { ToastProvider } from '@/components/ui/toast';
import AddColorButton from '@/components/AddColorButton';
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ColorSubmissionForm from '@/components/ColorSubmissionForm';

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
  const [isFormOpen, setIsFormOpen] = useState(false);
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

      setIsFormOpen(false);
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
    <main className="min-h-screen bg-white">
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
          <div className="border-2 border-[#2C3E50] overflow-hidden h-[calc(50vh-12rem)] min-h-[300px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#2C3E50] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-mono text-sm text-[#2C3E50]">Loading colors...</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0">
                <Map colors={filteredColors} />
              </div>
            )}
          </div>

          {/* Add Color Button - Fixed Position */}
          <div className="fixed bottom-8 right-8 z-50">
            <AddColorButton onSubmit={handleSubmit} />
          </div>
        </div>
      </div>

      {/* Color Submission Form Modal */}
      {isFormOpen && (
        <ColorSubmissionForm
          isOpen={isFormOpen}
          onSubmit={handleSubmit}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </main>
  );
} 