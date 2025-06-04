'use client';

import { useState } from 'react';
import ColorMap from '@/components/Map';
import ColorDialog from '@/components/ColorDialog';
import { ColorSubmission, ColorType } from '@/types/colors';
import { ToastProvider } from '@/components/ui/toast';

// TODO: Replace with actual data from your backend
const mockColors: ColorSubmission[] = [
  {
    id: '1',
    name: 'Spring Field Red',
    hexCode: '#FF0000',
    photo: '/path/to/photo.jpg',
    origin: {
      name: 'Spring Field, NY',
      coordinates: [40.1, -74.5],
      photo: '/path/to/location.jpg',
    },
    process: {
      sourceMaterial: 'Red Clay',
      type: 'pigment',
      recipe: 'Collected and processed red clay',
      season: 'Spring 2024',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add more mock colors as needed
];

export default function MapPage() {
  const [selectedTypes, setSelectedTypes] = useState<ColorType[]>(['pigment', 'dye', 'ink']);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleType = (type: ColorType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleMarkerClick = (color: ColorSubmission) => {
    // TODO: Implement color detail view
    console.log('Clicked color:', color);
  };

  return (
    <ToastProvider>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Color Map</h1>
          <div className="flex gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => toggleType('pigment')}
                className={`px-4 py-2 rounded-md ${
                  selectedTypes.includes('pigment')
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Pigments
              </button>
              <button
                onClick={() => toggleType('dye')}
                className={`px-4 py-2 rounded-md ${
                  selectedTypes.includes('dye')
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Dyes
              </button>
              <button
                onClick={() => toggleType('ink')}
                className={`px-4 py-2 rounded-md ${
                  selectedTypes.includes('ink')
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Inks
              </button>
            </div>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
            >
              Submit Color
            </button>
          </div>
        </div>

        <div className="w-full h-[600px] rounded-lg border border-gray-200 overflow-hidden">
          <ColorMap
            colors={mockColors}
            selectedTypes={selectedTypes}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        <div className="bg-card rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-primary mb-4">Legend</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">Pigments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">Dyes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Inks</span>
            </div>
          </div>
        </div>

        <ColorDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </ToastProvider>
  );
} 