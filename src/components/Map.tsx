'use client';

import { useState, useRef } from 'react';
import MapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ColorSubmission } from '@/types/colors';
import Image from 'next/image';
import { Menu, X, Plus } from 'lucide-react';
import ColorSubmissionForm from '@/components/ColorSubmissionForm';
import { Caveat } from 'next/font/google';
import { useRouter } from 'next/navigation';
import MenuAndBreadcrumbs from './MenuAndBreadcrumbs';
import Link from "next/link";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const caveat = Caveat({ subsets: ['latin'], weight: '700', variable: '--font-caveat' });

interface MapProps {
  colors: ColorSubmission[];
  titleColor?: string;
}

function parseCoordinates(coords: any): { lat: number; lng: number } | null {
  if (!coords) return null;
  if (typeof coords === 'string') {
    try {
      return JSON.parse(coords);
    } catch {
      return null;
    }
  }
  if (typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
    return coords as { lat: number; lng: number };
  }
  return null;
}

export default function Map({ colors, titleColor }: MapProps) {
  const [hoveredColor, setHoveredColor] = useState<ColorSubmission | null>(null);
  const [homeOverlay, setHomeOverlay] = useState(true);
  const mapRef = useRef<any>(null);
  const [showColorForm, setShowColorForm] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ColorSubmission | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const router = useRouter();
  const [showColorsView, setShowColorsView] = useState(false);

  const getColorImage = (color: ColorSubmission) => {
    if (!color.mediaUploads?.length) return null;
    const landscapeImage = color.mediaUploads.find(media => (media.type === 'landscape') && 'url' in media);
    if (landscapeImage && 'url' in landscapeImage) return (landscapeImage as any).url;
    const firstWithUrl = color.mediaUploads.find(media => 'url' in media);
    return firstWithUrl ? (firstWithUrl as any).url : null;
  };

  const colorCoords = colors.map(c => parseCoordinates(c.coordinates)).filter(Boolean);
  const defaultCenter = colorCoords.length ? {
    latitude: colorCoords.reduce((sum, c) => sum + c!.lat, 0) / colorCoords.length,
    longitude: colorCoords.reduce((sum, c) => sum + c!.lng, 0) / colorCoords.length,
    zoom: colorCoords.length === 1 ? 6 : 2
  } : { latitude: 40, longitude: -74.5, zoom: 1 };
  const [viewport, setViewport] = useState(defaultCenter);

  return (
    <div className="relative w-full h-full">
      {/* Unified Menu and Breadcrumbs */}
      <MenuAndBreadcrumbs />
      {/* Home Overlay */}
      {homeOverlay && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center mb-12">
            <h1
              className={`text-5xl md:text-7xl mb-6 drop-shadow-lg ${caveat.className}`}
              style={titleColor ? { color: titleColor } : {}}
            >
              CAreScape
            </h1>
            <p className="text-xl md:text-2xl font-mono text-white mb-8 drop-shadow">A visual journey through natural colors and their stories</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <button
              onClick={() => { setShowColorsView(true); setHomeOverlay(false); }}
              className="px-12 py-6 bg-white text-[#2C3E50] text-2xl font-handwritten rounded-xl shadow-lg border-2 border-[#2C3E50] hover:bg-[#2C3E50]/10 hover:text-[#2C3E50] transition-colors"
            >
              Colors
            </button>
            <Link
              href="/about"
              className="px-12 py-6 bg-[#2C3E50] text-white text-2xl font-handwritten rounded-xl shadow-lg border-2 border-[#2C3E50] hover:bg-white hover:text-[#2C3E50] transition-colors text-center inline-block"
            >
              About
            </Link>
          </div>
        </div>
      )}

      <MapGL
        ref={mapRef}
        initialViewState={viewport}
        mapStyle={{
          version: 8,
          name: 'Giorgia Lupi Inspired',
          sources: {
            'mapbox-streets': {
              type: 'vector',
              url: 'mapbox://mapbox.mapbox-streets-v8'
            }
          },
          sprite: 'mapbox://sprites/mapbox/light-v11',
          glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: {
                'background-color': '#F5F5F0'
              }
            },
            {
              id: 'land',
              type: 'background',
              paint: {
                'background-color': '#E8E8E0',
                'background-pattern': 'pattern-dots'
              }
            },
            {
              id: 'water',
              type: 'fill',
              source: 'mapbox-streets',
              'source-layer': 'water',
              paint: {
                'fill-color': '#D4E4E8',
                'fill-opacity': 0.8
              }
            },
            {
              id: 'landuse',
              type: 'fill',
              source: 'mapbox-streets',
              'source-layer': 'landuse',
              paint: {
                'fill-color': '#E8E8E0',
                'fill-opacity': 0.6
              }
            },
            {
              id: 'roads',
              type: 'line',
              source: 'mapbox-streets',
              'source-layer': 'road',
              paint: {
                'line-color': '#2C3E50',
                'line-width': 1,
                'line-opacity': 0.4
              }
            },
            {
              id: 'buildings',
              type: 'fill',
              source: 'mapbox-streets',
              'source-layer': 'building',
              paint: {
                'fill-color': '#2C3E50',
                'fill-opacity': 0.2
              }
            }
          ]
        }}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onMove={evt => setViewport(evt.viewState)}
      >
        <NavigationControl position="bottom-right" />
        {colors.map((color) => {
          const coords = parseCoordinates(color.coordinates);
          if (!coords) return null;
          const img = getColorImage(color);
          return (
            <Marker
              key={color.id}
              longitude={coords.lng}
              latitude={coords.lat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedColor(color);
              }}
            >
              <div className="w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer bg-white/80 hover:scale-110 transition-transform">
                {img ? (
                  <img src={img} alt={color.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div style={{backgroundColor: color.hex}} className="w-8 h-8 rounded-full" />
                )}
              </div>
            </Marker>
          );
        })}
      </MapGL>
      {/* Color submission modal */}
      <ColorSubmissionForm
        isOpen={showColorForm}
        onClose={() => setShowColorForm(false)}
        onSubmit={async () => { setShowColorForm(false); }}
      />
      {showColorsView && (
        <button
          className="fixed bottom-8 z-50 bg-[#2C3E50]/10 hover:bg-[#2C3E50]/20 rounded-full p-4 shadow border border-[#2C3E50] flex items-center justify-center transition-colors"
          style={{ right: "5%" }}
          onClick={() => setShowColorForm(true)}
          aria-label="Add new color"
        >
          <Plus className="w-6 h-6 text-[#2C3E50]" strokeWidth={1.2} />
        </button>

      )}
      {selectedColor && (
        <div className="fixed top-0 right-0 h-full w-full md:w-[420px] z-50 bg-white shadow-2xl flex flex-col p-8 overflow-y-auto border-l-4 border-black" style={{fontFamily:'Caveat, cursive'}}>
          <button className="absolute top-4 right-4 text-[#2C3E50] hover:text-[#2C3E50]/80" onClick={() => setSelectedColor(null)}><X className="w-5 h-5" strokeWidth={1.2} /></button>
          <div className="mb-6">
            <h2 className="text-4xl font-handwritten text-black mb-2">{selectedColor.name}</h2>
            <p className="text-sm text-black/70 italic mb-2">{selectedColor.location}</p>
          </div>
          {getColorImage(selectedColor) && (
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-6 border-2 border-black">
              <img src={getColorImage(selectedColor)!} alt={selectedColor.name} className="object-cover w-full h-full" />
            </div>
          )}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full border-2 border-black" style={{backgroundColor: selectedColor.hex}} />
            <span className="font-mono text-lg text-black">{selectedColor.hex}</span>
          </div>
          <blockquote className="text-xl font-handwritten text-black mb-6">{selectedColor.description}</blockquote>
          <button className="mt-4 px-4 py-2 rounded-lg bg-[#2C3E50]/10 hover:bg-[#2C3E50]/20 font-handwritten text-[#2C3E50] text-lg transition-colors" onClick={() => router.push(`/colors/${selectedColor.id}`)}>
            View Full Details
          </button>
        </div>
      )}
    </div>
  );
}
