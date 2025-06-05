'use client';

import { useEffect, useState } from 'react';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { ColorSubmission } from '@/types/colors';
import Image from 'next/image';

interface MapProps {
  colors: ColorSubmission[];
}

export default function Map({ colors }: MapProps) {
  const [selectedColor, setSelectedColor] = useState<ColorSubmission | null>(null);

  useEffect(() => {
    console.log('Map received colors:', colors);
    if (colors.length > 0) {
      console.log('Sample color data structure:', colors[0]);
    }
  }, [colors]);

  const getMarkerColor = (color: ColorSubmission) => {
    return color.hex || '#6B7280';
  };

  const handleMarkerClick = (color: ColorSubmission) => {
    console.log('Marker clicked, full color data:', color);
    console.log('Media uploads:', color.mediaUploads);
    setSelectedColor(color);
  };

  // Helper function to get the first outcome image
  const getColorImage = (color: ColorSubmission) => {
    if (!color.mediaUploads?.length) {
      console.log('No media uploads found');
      return null;
    }

    // Try to find an 'outcome' type image first
    const outcomeImage = color.mediaUploads.find(media => media.type === 'outcome');
    if (outcomeImage) {
      console.log('Found outcome image:', outcomeImage);
      return outcomeImage.url;
    }

    // Fallback to the first image
    console.log('Using first available image:', color.mediaUploads[0]);
    return color.mediaUploads[0].url;
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
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">{selectedColor.name}</h2>
              <button
                onClick={() => setSelectedColor(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                {/* Debug info */}
                <div className="text-xs text-gray-500">
                  <p>Debug: Has mediaUploads: {Boolean(selectedColor.mediaUploads)?.toString()}</p>
                  <p>Debug: MediaUploads length: {selectedColor.mediaUploads?.length || 0}</p>
                  {selectedColor.mediaUploads && selectedColor.mediaUploads.length > 0 && (
                    <p>Debug: First media URL: {selectedColor.mediaUploads[0].url}</p>
                  )}
                </div>

                {/* Image */}
                {getColorImage(selectedColor) && (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={getColorImage(selectedColor)!}
                      alt={`Image of ${selectedColor.name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                )}

                {/* Color sample and location */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-16 h-16 rounded-lg shadow-md"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{selectedColor.hex}</p>
                    {selectedColor.location && (
                      <p className="text-sm text-gray-500">{selectedColor.location}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedColor.description && (
                  <p className="text-sm text-gray-700">{selectedColor.description}</p>
                )}

                {/* Materials */}
                {selectedColor.materials && selectedColor.materials.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Materials</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedColor.materials.map((material) => (
                        <span
                          key={material.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                          {material.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Processes */}
                {selectedColor.processes && selectedColor.processes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Processes</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedColor.processes.map((process) => (
                        <span
                          key={process.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
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
        </div>
      )}
    </div>
  );
}
