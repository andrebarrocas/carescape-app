'use client';

import { useState, useEffect, useRef } from 'react';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { ColorSubmission } from '@/types/colors';
import { motion, AnimatePresence } from 'framer-motion';

interface MapProps {
  colors: ColorSubmission[];
  selectedTypes?: string[];
  onMarkerClick?: (color: ColorSubmission) => void;
}

export default function Map({ colors, selectedTypes = [], onMarkerClick }: MapProps) {
  const [selectedColor, setSelectedColor] = useState<ColorSubmission | null>(null);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState(2);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate the center based on available markers
    if (colors.length > 0) {
      const validCoordinates = colors
        .map(color => getCoordinates(color))
        .filter((coords): coords is [number, number] => coords !== null);

      if (validCoordinates.length > 0) {
        const avgLat = validCoordinates.reduce((sum, [lat]) => sum + lat, 0) / validCoordinates.length;
        const avgLng = validCoordinates.reduce((sum, [, lng]) => sum + lng, 0) / validCoordinates.length;
        setCenter([avgLat, avgLng]);
        setZoom(3);
      }
    }
  }, [colors]);

  const getCoordinates = (color: ColorSubmission): [number, number] | null => {
    try {
      if (!color.coordinates) return null;
      
      if (typeof color.coordinates === 'string') {
        const parsed = JSON.parse(color.coordinates);
        if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          return [parsed.lat, parsed.lng];
        }
      }
      
      if (typeof color.coordinates === 'object' && 
          'lat' in color.coordinates && 
          'lng' in color.coordinates &&
          typeof color.coordinates.lat === 'number' &&
          typeof color.coordinates.lng === 'number') {
        return [color.coordinates.lat, color.coordinates.lng];
      }

      return null;
    } catch (error) {
      console.error('Error parsing coordinates:', error);
      return null;
    }
  };

  const filteredColors = selectedTypes.length > 0
    ? colors.filter(color => {
        const processType = color.processes[0]?.application.toLowerCase();
        return selectedTypes.includes(processType);
      })
    : colors;

  return (
    <div className="relative w-full h-full" ref={mapRef}>
      <PigeonMap
        center={center}
        zoom={zoom}
        attribution={false}
        onBoundsChanged={({ center, zoom }) => {
          setCenter(center);
          setZoom(zoom);
        }}
      >
        {filteredColors.map((color) => {
          const coords = getCoordinates(color);
          if (!coords) return null;
          
          return (
            <Marker
              key={color.id}
              width={50}
              anchor={coords}
            >
              <div
                className="relative"
                onMouseEnter={() => setSelectedColor(color)}
                onMouseLeave={() => setSelectedColor(null)}
                onClick={() => onMarkerClick?.(color)}
              >
                <div
                  className="w-6 h-6 rounded-full transition-all duration-200 hover:scale-125 hover:shadow-lg cursor-pointer"
                  style={{ backgroundColor: color.hex }}
                />
                <AnimatePresence>
                  {selectedColor?.id === color.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-72 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-gray-100"
                      style={{ zIndex: 1000 }}
                    >
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <div
                            className="w-full h-full rounded-lg shadow-md overflow-hidden"
                            style={{
                              backgroundColor: color.hex,
                              backgroundImage: color.mediaUploads?.[0]?.url
                                ? `url(${color.mediaUploads[0].url})`
                                : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          >
                            {!color.mediaUploads?.[0]?.url && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                  className="w-10 h-10 rounded-full shadow-inner"
                                  style={{ backgroundColor: color.hex }}
                                />
                              </div>
                            )}
                          </div>
                          <div
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-lg"
                            style={{ backgroundColor: color.hex }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base truncate mb-0.5">
                            {color.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate mb-0.5">
                            {color.materials[0]?.name}
                          </p>
                          <p className="text-sm text-gray-600 truncate mb-2">
                            {color.location}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {color.processes.map(process => (
                              <span
                                key={process.id}
                                className="px-2 py-1 text-xs bg-gray-100/80 backdrop-blur-sm text-gray-700 rounded-full"
                              >
                                {process.application}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Marker>
          );
        })}
      </PigeonMap>
    </div>
  );
} 