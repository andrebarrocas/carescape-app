'use client';

import { useState, useRef, useEffect } from 'react';
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
import dynamic from 'next/dynamic';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const caveat = Caveat({ subsets: ['latin'], weight: '700', variable: '--font-caveat' });

const EmbeddedColorDetails = dynamic(() => import('@/components/StoryColorDetails'), { ssr: false });

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
  const router = useRouter();
  const [storyMode, setStoryMode] = useState(false);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [storyColorId, setStoryColorId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Animate map to current color in story mode
  useEffect(() => {
    if (storyMode && colors[currentColorIndex]) {
      const coords = parseCoordinates(colors[currentColorIndex].coordinates);
      if (coords && mapRef.current) {
        setIsAnimating(true);
        mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 6, speed: 1.2, curve: 1.5 });
        setTimeout(() => setIsAnimating(false), 1200);
      }
      setStoryColorId(colors[currentColorIndex].id);
    }
  }, [storyMode, currentColorIndex, colors]);

  // Keyboard navigation for story mode
  useEffect(() => {
    if (!storyMode) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentColorIndex(i => Math.min(i + 1, colors.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentColorIndex(i => Math.max(i - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [storyMode, colors.length]);

  return (
    <div className="relative w-full h-full">
      {/* Unified Menu and Breadcrumbs */}
      <MenuAndBreadcrumbs />
      
      {/* Home Overlay */}
      {homeOverlay && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl mb-6 text-white">CareScape</h1>
            <p className="text-xl md:text-2xl text-white mb-8">
              A visual journey through natural colors and their stories
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <button
              onClick={() => setHomeOverlay(false)}
              className="bos-button"
            >
              Colors
            </button>
            <Link href="/about" className="bos-button">About</Link>
          </div>
        </div>
      )}

      {/* Map */}
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
        {colors.map((color, idx) => {
          const coords = parseCoordinates(color.coordinates);
          if (!coords) return null;
          return (
            <Marker
              key={color.id}
              longitude={coords.lng}
              latitude={coords.lat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setStoryMode(true);
                setCurrentColorIndex(idx);
                setSelectedColor(null);
              }}
            >
              <div
                className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform ${storyMode && idx === currentColorIndex ? 'ring-4 ring-[#2C3E50]' : ''}`}
                style={{ backgroundColor: color.hex }}
              />
            </Marker>
          );
        })}
      </MapGL>

      {/* Add Color Button */}
      {!homeOverlay && (
        <button
          className="fixed bottom-8 z-50 bg-[#DCDCDC] hover:opacity-80 rounded-full p-4 shadow border border-black flex items-center justify-center transition-opacity"
          style={{ right: "5%" }}
          onClick={() => setShowColorForm(true)}
          aria-label="Add new color"
        >
          <Plus className="w-6 h-6" strokeWidth={1.2} />
        </button>
      )}

      {/* Color Form Modal */}
      <ColorSubmissionForm
        isOpen={showColorForm}
        onClose={() => setShowColorForm(false)}
        onSubmit={async () => { setShowColorForm(false); }}
      />

      {/* Story Mode Overlay */}
      {storyMode && storyColorId && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setStoryMode(false)}
          />
          <div 
            className="fixed top-0 right-0 h-full w-full md:w-[600px] z-50 bg-white/95 shadow-2xl flex flex-col p-0 overflow-y-auto border-l-1 border-black transition-all duration-700" 
            style={{ fontFamily: 'Futura Magazine, monospace' }}
          >
            <div className="flex-1 overflow-y-auto p-6">
              <EmbeddedColorDetails colorId={storyColorId} />
            </div>
            <div className="flex items-center justify-between p-6 border-t border-black/10 bg-gradient-to-r from-white to-[#FFFCF5]">
              <button
                onClick={() => setCurrentColorIndex(i => Math.max(i - 1, 0))}
                disabled={currentColorIndex === 0 || isAnimating}
                className="bos-button disabled:opacity-40"
              >
                Previous
              </button>
              <div className="flex gap-1 items-center">
                {colors.map((_, idx) => (
                  <span key={idx} className={`inline-block w-2 h-2 rounded-full ${idx === currentColorIndex ? 'bg-black' : 'bg-black/20'}`}></span>
                ))}
              </div>
              <button
                onClick={() => setCurrentColorIndex(i => Math.min(i + 1, colors.length - 1))}
                disabled={currentColorIndex === colors.length - 1 || isAnimating}
                className="bos-button disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
