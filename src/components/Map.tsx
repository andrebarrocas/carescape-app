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
  const [menuOpen, setMenuOpen] = useState(false);
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

  // Overlay/modal handlers
  const openColors = () => {
    setHomeOverlay(false);
    setMenuOpen(false);
    // TODO: Show colors overlay/modal
  };
  const openAbout = () => {
    setHomeOverlay(false);
    setMenuOpen(false);
    // TODO: Show about overlay/modal
  };
  const goHome = () => {
    setHomeOverlay(true);
    setMenuOpen(false);
    setHoveredColor(null);
    // TODO: Hide overlays
  };

  const colorCoords = colors.map(c => parseCoordinates(c.coordinates)).filter(Boolean);
  const defaultCenter = colorCoords.length ? {
    latitude: colorCoords.reduce((sum, c) => sum + c!.lat, 0) / colorCoords.length,
    longitude: colorCoords.reduce((sum, c) => sum + c!.lng, 0) / colorCoords.length,
    zoom: colorCoords.length === 1 ? 8 : 4
  } : { latitude: 40, longitude: -74.5, zoom: 3 };
  const [viewport, setViewport] = useState(defaultCenter);

  return (
    <div className="relative w-full h-full">
      {/* Floating Hamburger Menu */}
      <button
        className="fixed top-6 left-6 z-50 bg-black/60 rounded-full p-3 shadow-lg hover:bg-black/80 transition-colors"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        style={{ display: menuOpen ? 'none' : 'block' }}
      >
        <Menu className="w-7 h-7 text-white" />
      </button>
      {/* Side Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex" onClick={()=>setMenuOpen(false)}>
          <div className="w-72 bg-[#FFFCF5] h-full p-10 flex flex-col gap-10 shadow-2xl rounded-r-3xl border-r-4 border-[#D4A373] relative" onClick={e=>e.stopPropagation()}>
            <button className="absolute top-6 right-6 text-[#2C3E50] hover:text-[#D4A373] text-3xl" onClick={()=>setMenuOpen(false)} aria-label="Close menu"><X className="w-8 h-8" /></button>
            <div className="mt-20">
              <nav className="flex flex-col gap-4 bg-white/80 rounded-xl shadow p-6 border border-[#D4A373]">
                <button onClick={goHome} className="text-2xl font-handwritten text-[#2C3E50] hover:text-[#D4A373] text-left transition-colors px-2 py-1 rounded hover:bg-[#E9EDC9]">Home</button>
                <button onClick={() => { setShowColorsView(true); setHomeOverlay(false); setMenuOpen(false); }} className="text-2xl font-handwritten text-[#2C3E50] hover:text-[#D4A373] text-left transition-colors px-2 py-1 rounded hover:bg-[#E9EDC9]">Colors</button>
                <button onClick={()=>{setShowFullDetails(true);setMenuOpen(false);}} className="text-2xl font-handwritten text-[#2C3E50] hover:text-[#D4A373] text-left transition-colors px-2 py-1 rounded hover:bg-[#E9EDC9]">About</button>
              </nav>
            </div>
          </div>
        </div>
      )}

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
            <button onClick={() => { setShowColorsView(true); setHomeOverlay(false); setMenuOpen(false); }} className="px-12 py-6 bg-[#D4A373] text-[#181c1f] text-2xl font-mono rounded-lg shadow-lg hover:bg-[#b98a5a] transition-colors border-2 border-[#fff]">Colors</button>
            <button onClick={()=>{setShowFullDetails(true);setHomeOverlay(false);}} className="px-12 py-6 bg-[#E9EDC9] text-[#181c1f] text-2xl font-mono rounded-lg shadow-lg hover:bg-[#bfc7a1] transition-colors border-2 border-[#fff]">About</button>
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
          className="fixed bottom-8 right-8 z-50 bg-[#D4A373] hover:bg-[#b98a5a] text-[#181c1f] rounded-full p-5 shadow-xl border-2 border-white flex items-center justify-center"
          onClick={() => setShowColorForm(true)}
          aria-label="Add new color"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}
      {selectedColor && (
        <div className="fixed top-0 right-0 h-full w-full md:w-[420px] z-50 bg-white/95 shadow-2xl flex flex-col p-8 overflow-y-auto border-l-4 border-[#D4A373]" style={{fontFamily:'Caveat, cursive'}}>
          <button className="absolute top-4 right-4 text-gray-500 hover:text-black" onClick={() => setSelectedColor(null)}><X className="w-6 h-6" /></button>
          <div className="mb-6">
            <h2 className="text-4xl font-handwritten text-[#2C3E50] mb-2">{selectedColor.name}</h2>
            <p className="text-sm text-[#2C3E50]/70 italic mb-2">{selectedColor.location}</p>
          </div>
          {getColorImage(selectedColor) && (
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-6">
              <img src={getColorImage(selectedColor)!} alt={selectedColor.name} className="object-cover w-full h-full" />
            </div>
          )}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full border-2 border-[#D4A373]" style={{backgroundColor: selectedColor.hex}} />
            <span className="font-mono text-lg text-[#2C3E50]">{selectedColor.hex}</span>
          </div>
          <blockquote className="text-xl font-handwritten text-[#2C3E50] mb-6">{selectedColor.description}</blockquote>
          <button className="mt-4 px-6 py-3 bg-[#D4A373] text-[#181c1f] rounded-lg font-mono text-lg shadow hover:bg-[#b98a5a] transition-colors"
            onClick={() => router.push(`/colors/${selectedColor.id}`)}>
            View Full Details
          </button>
        </div>
      )}
    </div>
  );
}
