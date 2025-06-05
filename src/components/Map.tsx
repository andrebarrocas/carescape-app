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

  const getMarkerColor = (color: ColorSubmission) => {
    return color.hex || '#6B7280';
  };

  const calculateTooltipPosition = (markerRect: DOMRect) => {
    if (!tooltipRef.current) return { x: 0, y: 0 };

    const tooltipHeight = tooltipRef.current.offsetHeight;
    const tooltipWidth = tooltipRef.current.offsetWidth;
    
    // Calculate initial position (centered above marker)
    let x = markerRect.left + (markerRect.width / 2) - (tooltipWidth / 2);
    let y = markerRect.top - tooltipHeight - 10; // 10px gap

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Ensure tooltip stays within horizontal bounds
    if (x + tooltipWidth > viewportWidth - 20) {
      x = viewportWidth - tooltipWidth - 20; // 20px padding from right
    }
    if (x < 20) {
      x = 20; // 20px padding from left
    }

    // If tooltip would go above viewport, position it below the marker instead
    if (y < 20) {
      y = markerRect.bottom + 10; // 10px gap below marker
    }

    // Ensure tooltip stays within vertical bounds
    if (y + tooltipHeight > viewportHeight - 20) {
      y = viewportHeight - tooltipHeight - 20;
    }

    return { x, y };
  };

  const handleMarkerHover = (color: ColorSubmission) => ({ event }: MarkerEventProps) => {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // First set the color to trigger the tooltip render
    setHoveredColor(color);
    
    // Use requestAnimationFrame to wait for the tooltip to render before calculating position
    requestAnimationFrame(() => {
      const position = calculateTooltipPosition(rect);
      setTooltipPosition(position);
    });
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
          className="fixed z-50 w-96 bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-200 ease-out"
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
            opacity: hoveredColor ? 1 : 0,
            transform: `translateY(${hoveredColor ? '0' : '10px'})`,
            pointerEvents: 'auto'
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            // Keep the tooltip visible while hovering over it
          }}
          onMouseLeave={() => setHoveredColor(null)}
        >
          {/* Color Preview Banner */}
          <div 
            className="w-full h-3"
            style={{ backgroundColor: hoveredColor.hex }}
          />

          <div className="p-4 max-h-[70vh] overflow-y-auto">
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
