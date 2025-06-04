'use client';

import { useEffect, useState } from 'react';
import { Map as PigeonMap, Marker } from 'pigeon-maps';

interface Color {
  id: string;
  name: string;
  hex: string;
  description?: string;
  season: string;
  dateCollected: string;
  locationGeom: {
    type: 'Point';
    coordinates: [number, number];
  };
  user: {
    pseudonym?: string;
  };
  materials?: Array<{
    name: string;
    partUsed: string;
  }>;
  processes?: Array<{
    technique: string;
    application: string;
  }>;
  mediaUploads?: Array<{
    type: string;
    url: string;
    caption?: string;
  }>;
}

export default function ColorMap() {
  const [colors, setColors] = useState<Color[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);

  useEffect(() => {
    // Fetch colors with related data from our API
    fetch('/api/colors')
      .then((response) => response.json())
      .then(setColors)
      .catch((error) => {
        setError('Failed to load colors');
        console.error('Error:', error);
      });
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      <PigeonMap
        defaultCenter={[40, -74.5]}
        defaultZoom={9}
      >
        {colors.map((color) => (
          <Marker
            key={color.id}
            width={50}
            anchor={[color.locationGeom.coordinates[1], color.locationGeom.coordinates[0]]}
            color={color.hex}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </PigeonMap>

      {selectedColor && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <button
            onClick={() => setSelectedColor(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
          <h3 className="text-lg font-bold mb-2">{selectedColor.name}</h3>
          <p className="text-sm text-gray-600">
            Added by: {selectedColor.user.pseudonym || 'Anonymous'}
          </p>
          <div
            className="my-2 w-12 h-12 rounded"
            style={{ backgroundColor: selectedColor.hex }}
          />
          {selectedColor.description && (
            <p className="text-sm mt-2">{selectedColor.description}</p>
          )}
          {selectedColor.materials?.length ? (
            <div className="mt-2">
              <p className="text-sm font-semibold">Materials:</p>
              <ul className="text-sm">
                {selectedColor.materials.map((m, i) => (
                  <li key={i}>{m.name} ({m.partUsed})</li>
                ))}
              </ul>
            </div>
          ) : null}
          {selectedColor.processes?.length ? (
            <div className="mt-2">
              <p className="text-sm font-semibold">Processes:</p>
              <ul className="text-sm">
                {selectedColor.processes.map((p, i) => (
                  <li key={i}>{p.technique} - {p.application}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 