'use client';

import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN is required!');
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Color {
  _id: string;
  name: string;
  hex: string;
  description?: string;
  season: string;
  dateCollected: string;
  locationGeom: {
    type: 'Point';
    coordinates: [number, number];
  };
  userId: {
    _id: string;
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

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-74.5, 40],
      zoom: 9,
    });

    // Fetch colors with related data from our MongoDB API
    fetch('/api/colors')
      .then((response) => response.json())
      .then((data) => {
        setColors(data);
        
        // Add markers for each color
        data.forEach((color: Color) => {
          const [lng, lat] = color.locationGeom.coordinates;
          
          // Create marker element
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundColor = color.hex;
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 0 2px rgba(0,0,0,0.3)';
          
          // Create popup content with more details
          const popupContent = `
            <div class="p-4">
              <h3 class="text-lg font-bold mb-2">${color.name}</h3>
              <p class="text-sm text-gray-600">Added by: ${color.userId.pseudonym || 'Anonymous'}</p>
              <div class="my-2" style="background-color: ${color.hex}; width: 50px; height: 50px;"></div>
              ${color.description ? `<p class="text-sm mt-2">${color.description}</p>` : ''}
              ${color.materials?.length ? `
                <div class="mt-2">
                  <p class="text-sm font-semibold">Materials:</p>
                  <ul class="text-sm">
                    ${color.materials.map(m => `<li>${m.name} (${m.partUsed})</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${color.processes?.length ? `
                <div class="mt-2">
                  <p class="text-sm font-semibold">Processes:</p>
                  <ul class="text-sm">
                    ${color.processes.map(p => `<li>${p.technique} - ${p.application}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `;

          // Add popup
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(popupContent);

          // Add marker to map
          new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);
        });
      })
      .catch((error) => {
        setError('Failed to load colors');
        console.error('Error:', error);
      });

    return () => map.remove();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div id="map" className="w-full h-[calc(100vh-64px)]" />
  );
} 