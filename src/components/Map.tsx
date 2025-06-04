'use client';

import { useState, useEffect, useRef } from 'react';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { ColorSubmission } from '@/types/colors';
import { motion, AnimatePresence } from 'framer-motion';
import ColorPlaceholder from '@/components/ColorPlaceholder';

interface MapProps {
  colors: ColorSubmission[];
  selectedTypes?: string[];
  onMarkerClick?: (color: ColorSubmission) => void;
}

export default function Map({ colors, selectedTypes = [], onMarkerClick }: MapProps) {
  const [hoveredColor, setHoveredColor] = useState<ColorSubmission | null>(null);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState(2);
  const mapRef = useRef<HTMLDivElement>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const getCoordinates = (color: ColorSubmission): [number, number] | null => {
    try {
      if (!color.coordinates) return null;
      
      let coords;
      if (typeof color.coordinates === 'string') {
        coords = JSON.parse(color.coordinates);
      } else {
        coords = color.coordinates;
      }

      if (coords && typeof coords === 'object' && 
          'lat' in coords && 'lng' in coords &&
          typeof coords.lat === 'number' &&
          typeof coords.lng === 'number') {
        return [coords.lat, coords.lng];
      }

      console.warn('Invalid coordinates format for color:', color.name, coords);
      return null;
    } catch (error) {
      console.error('Error parsing coordinates for color:', color.name, error);
      return null;
    }
  };

  useEffect(() => {
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

  const handleImageError = (colorId: string) => {
    setImageLoadErrors(prev => ({ ...prev, [colorId]: true }));
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
              width={24}
              anchor={coords}
            >
              <div
                className="relative group"
                onMouseEnter={() => setHoveredColor(color)}
                onMouseLeave={() => setHoveredColor(null)}
                onClick={() => onMarkerClick?.(color)}
              >
                <div
                  className="w-6 h-6 rounded-full shadow-lg cursor-pointer transform transition-transform duration-200 hover:scale-125"
                  style={{ backgroundColor: color.hex }}
                />
                
                <AnimatePresence>
                  {hoveredColor?.id === color.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-white rounded-xl shadow-2xl p-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-4">
                        <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                          {color.mediaUploads && color.mediaUploads.length > 0 && !imageLoadErrors[color.id] ? (
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{
                                backgroundColor: color.hex,
                                backgroundImage: `url(${color.mediaUploads[0].url})`,
                              }}
                              onError={() => handleImageError(color.id)}
                            />
                          ) : (
                            <ColorPlaceholder hex={color.hex} name={color.name} showName={false} />
                          )}
                          <div
                            className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white shadow-lg"
                            style={{ backgroundColor: color.hex }}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{color.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">{color.location}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {color.processes.map(process => (
                              <span
                                key={process.id}
                                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
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