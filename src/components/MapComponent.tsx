'use client';

import { Map as PigeonMap, Overlay } from 'pigeon-maps';

interface MapComponentProps {
  coordinates: { lat: number; lng: number };
  boundary?: [number, number][];
}

export function MapComponent({ coordinates, boundary }: MapComponentProps) {
  return (
    <div className="relative h-48 w-full rounded-lg overflow-hidden border border-[#2C3E50]/20">
      <PigeonMap
        height={192}
        defaultCenter={[coordinates.lat, coordinates.lng]}
        defaultZoom={11}
        animate={true}
      >
        {/* Bioregion boundary */}
        {boundary && boundary.length > 0 && (
          <Overlay anchor={[coordinates.lat, coordinates.lng]} offset={[0, 0]}>
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <path
                d={`M ${boundary.map(([lat, lng]) => `${lat} ${lng}`).join(' L ')} Z`}
                fill="none"
                stroke="#2C3E50"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          </Overlay>
        )}

        {/* Location marker */}
        <Overlay anchor={[coordinates.lat, coordinates.lng]} offset={[0, 0]}>
          <div 
            className="w-3 h-3 bg-[#2C3E50] rounded-full"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        </Overlay>
      </PigeonMap>
    </div>
  );
} 