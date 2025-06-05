'use client';

import { useEffect, useState, useRef } from 'react';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { ColorSubmission } from '@/types/colors';
import Image from 'next/image';

interface MapProps {
  colors: ColorSubmission[];
}

interface MarkerEventProps {
  event: MouseEvent;
  anchor: [number, number];
  payload: any;
}

export default function Map({ colors }: MapProps) {
  const [hoveredColor, setHoveredColor] = useState<ColorSubmission | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipDimensions, setTooltipDimensions] = useState({ width: 384, height: 400 }); // Default dimensions

  useEffect(() => {
    if (tooltipRef.current) {
      const { offsetWidth, offsetHeight } = tooltipRef.current;
      setTooltipDimensions({ width: offsetWidth, height: offsetHeight });
    }
  }, [hoveredColor]); // Update dimensions when hovered color changes

  const getMarkerColor = (color: ColorSubmission) => {
    return color.hex || '#6B7280';
  };

  const calculateTooltipPosition = (markerRect: DOMRect) => {
    // Use actual tooltip dimensions if available, otherwise use defaults
    const tooltipWidth = tooltipDimensions.width;
    const tooltipHeight = tooltipDimensions.height;
    
    // Calculate centered position above marker
    let x = markerRect.left + (markerRect.width / 2) - (tooltipWidth / 2);
    let y = markerRect.top - tooltipHeight - 16; // 16px gap above marker

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    
    // Ensure tooltip stays within horizontal bounds
    if (x + tooltipWidth > viewportWidth - 20) {
      x = viewportWidth - tooltipWidth - 20;
    }
    if (x < 20) {
      x = 20;
    }

    // Ensure minimum distance from top of viewport
    if (y < 20) {
      y = 20;
    }

    return { x, y };
  };

  const handleMarkerHover = (color: ColorSubmission) => ({ event }: MarkerEventProps) => {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Calculate position immediately with current dimensions
    const position = calculateTooltipPosition(rect);
    
    // Update state in a single batch
    setHoveredColor(color);
    setTooltipPosition(position);
  };

  const getColorImage = (color: ColorSubmission) => {
    if (!color.mediaUploads?.length) return null;
    const outcomeImage = color.mediaUploads.find(media => media.type === 'outcome');
    return outcomeImage ? outcomeImage.url : color.mediaUploads[0].url;
  };

  return (
    <div className="relative w-full h-full" ref={mapContainerRef}>
      <PigeonMap
        defaultCenter={[40, -74.5]}
        defaultZoom={3}
        minZoom={2}
        maxZoom={8}
        onClick={() => setHoveredColor(null)}
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
              onMouseOver={handleMarkerHover(color)}
              onMouseOut={() => setHoveredColor(null)}
            />
          );
        })}
      </PigeonMap>

      {hoveredColor && (
        <div 
          ref={tooltipRef}
          className="fixed z-50 w-96 bg-white rounded-xl shadow-2xl overflow-hidden"
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
            opacity: 1,
            transform: 'translateY(0)',
            pointerEvents: 'auto',
            transition: 'opacity 0.2s ease-out',
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
          }}
          onMouseLeave={() => setHoveredColor(null)}
        >
          {/* Tooltip Arrow */}
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `8px solid ${hoveredColor.hex}`,
            }}
          />

          {/* Color Preview Banner */}
          <div 
            className="w-full h-3"
            style={{ backgroundColor: hoveredColor.hex }}
          />

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {/* Header with Cultural Context */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{hoveredColor.name}</h2>
              {hoveredColor.location && (
                <p className="text-sm text-gray-600 italic">
                  Discovered in {hoveredColor.location}
                </p>
              )}
            </div>

            {/* Image and Color Information Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Left Column: Image */}
              {getColorImage(hoveredColor) && (
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={getColorImage(hoveredColor)!}
                    alt={`Cultural context of ${hoveredColor.name}`}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              )}

              {/* Right Column: Color Story */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg shadow-lg transform hover:scale-110 transition-transform"
                    style={{ backgroundColor: hoveredColor.hex }}
                  />
                  <div>
                    <p className="font-mono text-sm">{hoveredColor.hex}</p>
                    <p className="text-xs text-gray-500">HEX Code</p>
                  </div>
                </div>

                {hoveredColor.description && (
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    "{hoveredColor.description}"
                  </p>
                )}
              </div>
            </div>

            {/* Cultural Elements */}
            <div className="space-y-3">
              {/* Materials */}
              {hoveredColor.materials && hoveredColor.materials.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Traditional Materials</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {hoveredColor.materials.map((material) => (
                      <span
                        key={material.id}
                        className="px-2 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors"
                      >
                        {material.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Processes */}
              {hoveredColor.processes && hoveredColor.processes.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Cultural Techniques</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {hoveredColor.processes.map((process) => (
                      <span
                        key={process.id}
                        className="px-2 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors"
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
