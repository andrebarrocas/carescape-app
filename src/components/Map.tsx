'use client';

import { useEffect, useState } from 'react';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { ColorSubmission } from '@/types/colors';

interface MapProps {
  colors: ColorSubmission[];
}

export default function Map({ colors }: MapProps) {
  const [selectedColor, setSelectedColor] = useState<ColorSubmission | null>(null);

  useEffect(() => {
    console.log('Map received colors:', colors);
  }, [colors]);

  const getMarkerColor = (color: ColorSubmission) => {
    // Use the color's hex value for the marker
    return color.hex || '#6B7280'; // fallback to gray if no hex value
  };

  const handleMarkerClick = (color: ColorSubmission) => {
    console.log('Marker clicked:', color);
    setSelectedColor(color);
  };

  return (
    <div className="relative w-full h-full">
      <PigeonMap
        defaultCenter={[40, -74.5]}
        defaultZoom={3}
        minZoom={2}
        maxZoom={8}
        onClick={() => setSelectedColor(null)}
      >
        {colors.map((color) => {
          if (!color.coordinates) return null;
          const coords = [color.coordinates.lat, color.coordinates.lng] as [number, number];

          return (
            <Marker
              key={color.id}
              width={50}
              anchor={coords}
              color={getMarkerColor(color)}
              onClick={() => handleMarkerClick(color)}
            />
          );
        })}
      </PigeonMap>

      {selectedColor && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedColor(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{selectedColor.name}</h2>
              <button
                onClick={() => setSelectedColor(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-6 mb-8">
                <div
                  className="w-24 h-24 rounded-xl shadow-lg"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <div>
                  <p className="text-2xl font-bold">{selectedColor.hex}</p>
                  {selectedColor.location && (
                    <p className="text-gray-600 mt-1">{selectedColor.location}</p>
                  )}
                </div>
              </div>

              {selectedColor.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{selectedColor.description}</p>
                </div>
              )}

              {selectedColor.materials && selectedColor.materials.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Materials</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedColor.materials.map((material) => (
                      <span
                        key={material.id}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {material.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedColor.processes && selectedColor.processes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Processes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedColor.processes.map((process) => (
                      <span
                        key={process.id}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {process.application}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
