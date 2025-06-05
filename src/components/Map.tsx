'use client';

import { useState } from 'react';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { ColorSubmission } from '@/types/colors';
import { motion, AnimatePresence } from 'framer-motion';
import ColorPlaceholder from '@/components/ColorPlaceholder';
import { MapPin, Calendar, X, Palette, Leaf, Beaker, Globe } from 'lucide-react';

interface MapProps {
  colors: ColorSubmission[];
  selectedTypes?: string[];
  onMarkerClick?: (color: ColorSubmission) => void;
}

export default function Map({ colors, selectedTypes = [], onMarkerClick }: MapProps) {
  const [selectedColor, setSelectedColor] = useState<ColorSubmission | null>(null);
  const [zoom, setZoom] = useState<number>(3);

  const getCoordinates = (color: ColorSubmission): [number, number] | null => {
    try {
      if (!color.coordinates) return null;
      const coords = typeof color.coordinates === 'string'
        ? JSON.parse(color.coordinates)
        : color.coordinates;

      if (coords?.lat && coords?.lng) {
        return [Number(coords.lat), Number(coords.lng)];
      }
      return null;
    } catch {
      return null;
    }
  };

  const getFirstValidCoordinate = (): [number, number] => {
    for (const color of colors) {
      const coords = getCoordinates(color);
      if (coords) return coords;
    }
    return [20, 0]; // fallback
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const visibleColors = () => {
    if (zoom <= 2) return colors.slice(0, 300);
    if (zoom <= 3) return colors.slice(0, 200);
    if (zoom <= 4) return colors.slice(0, 100);
    return colors;
  };

  const handleMarkerClick = (color: ColorSubmission, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedColor(color);
    onMarkerClick?.(color);
  };

  return (
    <div className="relative w-full h-full">
      <PigeonMap
        defaultCenter={getFirstValidCoordinate()}
        defaultZoom={3} // Zoomed out to show more circles
        minZoom={2}
        maxZoom={8}
        onBoundsChanged={({ zoom }) => setZoom(zoom)}
        attribution={false}
      >
        {visibleColors().map((color) => {
          const coords = getCoordinates(color);
          if (!coords) return null;

          return (
            <Marker
              key={color.id}
              width={40}
              anchor={coords}
              onClick={(e) => handleMarkerClick(color, e as unknown as React.MouseEvent)}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="relative group cursor-pointer"
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs px-2 py-1 bg-white text-black rounded shadow opacity-0 group-hover:opacity-100 transition">
                  {color.name}
                </div>
              </motion.div>
            </Marker>
          );
        })}
      </PigeonMap>

      <AnimatePresence>
        {selectedColor && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedColor(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* Close button */}
                <button
                  onClick={() => setSelectedColor(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white z-10 transition"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Hero section */}
                <div className="relative h-72 bg-gray-100">
                  {selectedColor.mediaUploads?.[0]?.url ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${selectedColor.mediaUploads[0].url})` }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ColorPlaceholder hex={selectedColor.hex} name={selectedColor.name} showName={false} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-6">
                      <div
                        className="w-20 h-20 rounded-xl shadow-lg border-4 border-white"
                        style={{ backgroundColor: selectedColor.hex }}
                      />
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{selectedColor.name}</h2>
                        <div className="flex items-center text-white/80">
                          <MapPin className="w-4 h-4 mr-2" />
                          {selectedColor.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal body */}
                <div className="p-8 grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                        <Globe className="w-5 h-5 mr-2" />
                        Origin Story
                      </h3>
                      <p className="text-gray-600">
                        {selectedColor.description ||
                          `${selectedColor.name} originates from ${selectedColor.location}, reflecting its natural essence.`}
                      </p>
                    </div>
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                        <Leaf className="w-5 h-5 mr-2" />
                        Source Materials
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedColor.materials.map((m) => (
                          <span key={m.id} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                        <Beaker className="w-5 h-5 mr-2" />
                        Traditional Process
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedColor.processes.map((p) => (
                          <span key={p.id} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                            {p.application}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                        <Calendar className="w-5 h-5 mr-2" />
                        Collection Details
                      </h3>
                      <div className="bg-gray-100 rounded-xl p-4 space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Date</span>
                          <span className="font-medium">{formatDate(selectedColor.dateCollected)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hex</span>
                          <span className="font-medium">{selectedColor.hex.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
