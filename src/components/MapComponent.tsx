'use client';

import { Map as PigeonMap, Overlay } from 'pigeon-maps';

interface MapComponentProps {
  coordinates: { lat: number; lng: number };
  boundary?: [number, number][];
  onClick?: (args: { latLng: [number, number] }) => void;
}

export function MapComponent({ coordinates, boundary, onClick }: MapComponentProps) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-[#2C3E50]/20">
      <PigeonMap
        defaultCenter={[coordinates.lat, coordinates.lng]}
        defaultZoom={13}
        animate={true}
        center={[coordinates.lat, coordinates.lng]}
        onClick={onClick}
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
            className="w-4 h-4 bg-[#2C3E50] rounded-full shadow-lg"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        </Overlay>
      </PigeonMap>
    </div>
  );
} 