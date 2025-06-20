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
import MapFilterButtons from './MapFilterButtons';
import Link from "next/link";
import dynamic from 'next/dynamic';
import { animals } from '@/data/animals';
import AnimalSubmissionForm from './AnimalSubmissionForm';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const caveat = Caveat({ subsets: ['latin'], weight: '700', variable: '--font-caveat' });

const EmbeddedColorDetails = dynamic(() => import('@/components/StoryColorDetails'), { ssr: false });
const EmbeddedAnimalDetails = dynamic(() => import('@/components/AnimalDetails'), { ssr: false });

interface MapProps {
  colors: ColorSubmission[];
  titleColor?: string;
}

interface Animal {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  coordinates: string | { lat: number; lng: number };
  image: string;
  date: string;
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
  const [showColorForm, setShowColorForm] = useState(false);
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ColorSubmission | null>(null);
  const router = useRouter();
  const [storyMode, setStoryMode] = useState(false);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [storyColorId, setStoryColorId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMapStyle, setCurrentMapStyle] = useState('all');
  const [currentView, setCurrentView] = useState('all');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  const colorCoords = colors.map(c => parseCoordinates(c.coordinates)).filter(Boolean);
  const defaultCenter = colorCoords.length ? {
    latitude: colorCoords.reduce((sum, c) => sum + c!.lat, 0) / colorCoords.length,
    longitude: colorCoords.reduce((sum, c) => sum + c!.lng, 0) / colorCoords.length,
    zoom: 3
  } : { latitude: 20, longitude: 0, zoom: 2 };
  const [viewport, setViewport] = useState(defaultCenter);

  const mapRef = useRef<any>(null);

  // Map styles using Mapbox's predefined styles
  const mapStyles = {
    animals: 'mapbox://styles/mapbox/navigation-night-v1'  // Blue and orange vintage style
  };

  // Fetch animals
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await fetch('/api/animals', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setAnimals(data);
      } catch (error) {
        console.error('Error fetching animals:', error);
        // Fallback to static data if API fails
        setAnimals(animals);
      }
    };

    fetchAnimals();
  }, []);

  const handleFilterChange = (filter: string) => {
    setCurrentMapStyle(filter);
    setCurrentView(filter);
  };

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

  // Update story color ID when index changes
  useEffect(() => {
    if (storyMode && colors[currentColorIndex]) {
      setStoryColorId(colors[currentColorIndex].id);
    }
  }, [storyMode, currentColorIndex, colors]);

  return (
    <div className="relative w-full h-full">
      {/* Map Filter Buttons */}
      <MapFilterButtons onFilterChange={handleFilterChange} />

      {/* Map */}
      <MapGL
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        initialViewState={{
          ...viewport,
          pitch: 0,
          bearing: 0
        }}
        mapStyle={currentView === 'animals' ? mapStyles.animals : {
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
        onMove={evt => setViewport(evt.viewState)}
      >
        <NavigationControl position="bottom-right" />

        {/* Render Color Markers */}
        {(currentView === 'all' || currentView === 'colors') && colors.map((color, idx) => {
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

        {/* Render Animal Markers */}
        {(currentView === 'all' || currentView === 'animals') && animals.map((animal) => {
          let coords;
          try {
            if (typeof animal.coordinates === 'string') {
              coords = JSON.parse(animal.coordinates);
            } else {
              coords = animal.coordinates;
            }
          } catch (error) {
            console.error('Error parsing animal coordinates:', error);
            return null;
          }
          
          if (!coords || !coords.lat || !coords.lng) {
            return null;
          }
          
          return (
            <Marker
              key={animal.id}
              longitude={coords.lng}
              latitude={coords.lat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedAnimal(animal);
                setStoryMode(false);
                setSelectedColor(null);
              }}
            >
              <div 
                className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform bg-white p-1 overflow-hidden"
                style={{ border: '2px solid #2C3E50' }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={animal.image}
                    alt={animal.name}
                    fill
                    className="object-cover rounded-full"
                    sizes="48px"
                    onError={(e) => {
                      // Fallback to a colored background if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.style.backgroundColor = '#FF6B6B';
                        parent.innerHTML = `<div class="flex items-center justify-center w-full h-full text-white text-xs font-bold">${animal.name.charAt(0)}</div>`;
                      }
                    }}
                  />
                </div>
              </div>
            </Marker>
          );
        })}
      </MapGL>

      {/* Color Form Modal */}
      <ColorSubmissionForm
        isOpen={showColorForm}
        onClose={() => setShowColorForm(false)}
        onSubmit={async (data) => {
          try {
            const response = await fetch('/api/colors', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });
            
            if (!response.ok) {
              throw new Error('Failed to submit color');
            }

            setShowColorForm(false);
            router.refresh();
          } catch (error) {
            console.error('Error submitting color:', error);
          }
        }}
      />

      {/* Story Mode Overlay */}
      {storyMode && storyColorId && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setStoryMode(false)}
          />
          <div 
            className="fixed top-0 right-0 h-full w-full md:w-[600px] z-50 bg-white shadow-2xl flex flex-col p-0 overflow-y-auto border-l border-black" 
            style={{ fontFamily: 'Futura Magazine, monospace' }}
          >
            <div className="flex-1 overflow-y-auto p-6">
              <EmbeddedColorDetails colorId={storyColorId} />
            </div>
            <div className="flex items-center justify-between p-6 border-t border-black">
  {/* Previous */}
  <button
    onClick={() => setCurrentColorIndex(i => Math.max(i - 1, 0))}
    disabled={currentColorIndex === 0 || isAnimating}
    className="bos-button tracking-wider disabled:opacity-40"
    style={{
      fontSize: '1rem',        // ≈ text-xl
      padding: '0.75rem 2rem', // ≈ px-8 py-4
      lineHeight: '1.5'
    }}
  >
    Previous
  </button>

  {/* dots */}
  <div className="flex gap-1 items-center">
    {colors.map((_, idx) => (
      <span
        key={idx}
        className={`inline-block w-2 h-2 rounded-full ${
          idx === currentColorIndex ? 'bg-black' : 'bg-black/20'
        }`}
      />
    ))}
  </div>

  {/* Next */}
  <button
    onClick={() =>
      setCurrentColorIndex(i => Math.min(i + 1, colors.length - 1))
    }
    disabled={currentColorIndex === colors.length - 1 || isAnimating}
    className="bos-button tracking-wider disabled:opacity-40"
    style={{
      fontSize: '1rem',
      padding: '0.75rem 2rem',
      lineHeight: '1.5'
    }}
  >
    Next
  </button>
</div>

          </div>
        </>
      )}

      {/* Animal Details Modal */}
      {selectedAnimal && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setSelectedAnimal(null)}
          />
          <div 
            className="fixed top-0 right-0 h-full w-full md:w-[600px] z-50 bg-white/95 shadow-2xl flex flex-col p-0 overflow-y-auto border-l border-black transition-all duration-700" 
            style={{ fontFamily: 'Futura Magazine, monospace' }}
          >
            <button
              onClick={() => setSelectedAnimal(null)}
              className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors"
              aria-label="Close animal details"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex-1 overflow-y-auto p-6">
              <EmbeddedAnimalDetails animalId={selectedAnimal.id} />
            </div>
          </div>
        </>
      )}

      {/* Add Color Button */}
      {!storyMode && currentView === 'colors' && (
        <button
          className="bos-button text-xl px-8 py-3 fixed bottom-8 z-50 rounded-full shadow-lg flex items-center justify-center transition-opacity"
          style={{ right: "5%" }}
          onClick={() => setShowColorForm(true)}
          aria-label="Add new color"
        >
          <Plus className="w-6 h-6" strokeWidth={1.2} />
          <span className="ml-2">Add Color</span>
        </button>
      )}

      {/* Add Animal Button */}
      {!storyMode && currentView === 'animals' && (
        <button
          className="bos-button text-xl px-8 py-3 fixed bottom-8 z-50 rounded-full shadow-lg flex items-center justify-center transition-opacity"
          style={{ right: "5%" }}
          onClick={() => setShowAnimalForm(true)}
          aria-label="Add new animal"
        >
          <Plus className="w-6 h-6" strokeWidth={1.2} />
          <span className="ml-2">Add Animal</span>
        </button>
      )}

      {/* Animal Form Modal */}
      <AnimalSubmissionForm
        isOpen={showAnimalForm}
        onClose={() => setShowAnimalForm(false)}
        onSubmit={async (data) => {
          try {
            const response = await fetch('/api/animals', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              throw new Error('Failed to submit animal');
            }

            setShowAnimalForm(false);
            // Refresh animals list
            const animalsResponse = await fetch('/api/animals');
            const newAnimals = await animalsResponse.json();
            setAnimals(newAnimals);
          } catch (error) {
            console.error('Error submitting animal:', error);
            alert('Failed to submit animal. Please try again.');
          }
        }}
      />
    </div>
  );
}
