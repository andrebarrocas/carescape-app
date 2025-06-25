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
import PigmentAnalysis from '@/components/PigmentAnalysis';
import SustainabilityAnalysis from '@/components/SustainabilityAnalysis';
import * as Dialog from '@radix-ui/react-dialog';

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
  const [currentView, setCurrentView] = useState('colors');
  const [animals, setBiodiversity] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isPigmentModalOpen, setPigmentModalOpen] = useState(false);
  const [isSustainabilityModalOpen, setSustainabilityModalOpen] = useState(false);
  const [isAddMediaOpen, setAddMediaOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const colorCoords = colors.map(c => parseCoordinates(c.coordinates)).filter(Boolean);
  const defaultCenter = colorCoords.length ? {
    latitude: colorCoords.reduce((sum, c) => sum + c!.lat, 0) / colorCoords.length,
    longitude: colorCoords.reduce((sum, c) => sum + c!.lng, 0) / colorCoords.length,
    zoom: 3
  } : { latitude: 20, longitude: 0, zoom: 2 };
  const [viewport, setViewport] = useState(defaultCenter);

  const mapRef = useRef<any>(null);

  // Map styles using Mapbox's predefined styles
  const mapStyles: Record<string, any> = {
    animals: {
      version: 8,
      name: 'Artistic Wildlife Style',
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
            'background-color': '#F7F3E9'  // Warm cream background
          }
        },
        {
          id: 'land',
          type: 'background',
          paint: {
            'background-color': '#E8D5B7',  // Earthy beige
            'background-pattern': 'pattern-dots'
          }
        },
        {
          id: 'water',
          type: 'fill',
          source: 'mapbox-streets',
          'source-layer': 'water',
          paint: {
            'fill-color': '#B8D4E3',  // Soft blue-green
            'fill-opacity': 0.7
          }
        },
        {
          id: 'landuse',
          type: 'fill',
          source: 'mapbox-streets',
          'source-layer': 'landuse',
          paint: {
            'fill-color': '#D4C4A8',  // Warm tan
            'fill-opacity': 0.5
          }
        },
        {
          id: 'parks',
          type: 'fill',
          source: 'mapbox-streets',
          'source-layer': 'landuse',
          filter: ['==', ['get', 'class'], 'park'],
          paint: {
            'fill-color': '#A8C4A8',  // Soft green for parks
            'fill-opacity': 0.6
          }
        },
        {
          id: 'roads',
          type: 'line',
          source: 'mapbox-streets',
          'source-layer': 'road',
          paint: {
            'line-color': '#8B7355',  // Warm brown
            'line-width': 1,
            'line-opacity': 0.3
          }
        },
        {
          id: 'buildings',
          type: 'fill',
          source: 'mapbox-streets',
          'source-layer': 'building',
          paint: {
            'fill-color': '#6B5B47',  // Darker brown
            'fill-opacity': 0.15
          }
        },
        {
          id: 'labels',
          type: 'symbol',
          source: 'mapbox-streets',
          'source-layer': 'place_label',
          paint: {
            'text-color': '#5D4E37',  // Warm dark brown
            'text-halo-color': '#F7F3E9',
            'text-halo-width': 1
          }
        }
      ]
    }
  };

  // Fetch animals
  useEffect(() => {
    const fetchBiodiversity = async () => {
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
        setBiodiversity(data);
      } catch (error) {
        console.error('Error fetching animals:', error);
        // Fallback to static data if API fails
        setBiodiversity(animals);
      }
    };

    fetchBiodiversity();
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

  // Handle viewport animation for story mode
  useEffect(() => {
    if (storyMode && colors[currentColorIndex]) {
      const coords = parseCoordinates(colors[currentColorIndex].coordinates);
      if (coords && mapRef.current) {
        setIsAnimating(true);
        mapRef.current.flyTo({
          center: [coords.lng, coords.lat],
          zoom: 8,
          duration: 2000,
          essential: true
        });
        
        // Reset animation state after animation completes
        setTimeout(() => {
          setIsAnimating(false);
        }, 2000);
      }
    }
  }, [storyMode, currentColorIndex, colors]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setMediaFiles(files);
    setCaptions(files.map(() => ''));
  };

  const handleCaptionChange = (idx: number, value: string) => {
    setCaptions(captions => captions.map((c, i) => (i === idx ? value : c)));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData();
      mediaFiles.forEach((file, idx) => {
        formData.append('media', file);
        formData.append('captions', captions[idx] || '');
      });
      if (!storyColorId) return;
      const res = await fetch(`/api/colors/${storyColorId}/images`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setAddMediaOpen(false);
        setMediaFiles([]);
        setCaptions([]);
      }
    } finally {
      setIsUploading(false);
    }
  };

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
            {/* Separator line and action bar */}
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-lg mx-auto my-3">
                <hr className="border-t border-gray-300 rounded-full" />
              </div>
              <div className="w-full px-6 pb-6 flex flex-col items-center">
                <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full max-w-lg">
                  {/* Row 1, Col 1: AI Analysis */}
                  <button
                    onClick={() => setSustainabilityModalOpen(true)}
                    className="bg-green-600 text-white text-base font-mono font-bold tracking-wider px-6 py-4 rounded-none transition-opacity h-14 w-full row-start-1 col-start-1"
                  >
                    AI Analysis
                  </button>
                  {/* Row 1, Col 2: Add Content */}
                  <button
                    onClick={() => setAddMediaOpen(true)}
                    className="bg-[#5C5954] text-white text-base font-mono font-bold tracking-wider px-6 py-4 rounded-none transition-opacity h-14 w-full row-start-1 col-start-2"
                  >
                    + Add Content
                  </button>
                  {/* Row 2, Col 1: AI Design Ideas */}
                  <button
                    onClick={() => setPigmentModalOpen(true)}
                    className="bg-cyan-600 text-white text-base font-mono font-bold tracking-wider px-6 py-4 rounded-none transition-opacity h-14 w-full row-start-2 col-start-1"
                  >
                    AI Design Ideas
                  </button>
                  {/* Row 2, Col 2: Navigation arrows */}
                  <div className="flex gap-4 w-full h-14 row-start-2 col-start-2">
                    <button
                      onClick={() => setCurrentColorIndex(i => Math.max(i - 1, 0))}
                      disabled={currentColorIndex === 0 || isAnimating}
                      className="bg-[#A7A39E] text-white text-2xl font-mono font-bold px-6 py-4 rounded-none transition-opacity disabled:opacity-40 h-14 w-1/2"
                    >
                      {'<'}
                    </button>
                    <button
                      onClick={() => setCurrentColorIndex(i => Math.min(i + 1, colors.length - 1))}
                      disabled={currentColorIndex === colors.length - 1 || isAnimating}
                      className="bg-[#A7A39E] text-white text-2xl font-mono font-bold px-6 py-4 rounded-none transition-opacity disabled:opacity-40 h-14 w-1/2"
                    >
                      {'>'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Modals for story mode */}
            {/* Sustainability Analysis Modal */}
            <Dialog.Root open={isSustainabilityModalOpen} onOpenChange={setSustainabilityModalOpen}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                <Dialog.Content
                  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-[800px] max-w-full z-50 bg-white shadow-2xl rounded-2xl flex flex-col p-8 overflow-y-auto border-2 border-[#2C3E50]"
                  style={{ fontFamily: 'Caveat, cursive', maxHeight: '90vh' }}
                >
                  <Dialog.Title className="sr-only">Sustainability Analysis</Dialog.Title>
                  <button className="absolute top-4 right-4 text-[#2C3E50] hover:text-[#2C3E50]/80" onClick={() => setSustainabilityModalOpen(false)}><X className="w-5 h-5" strokeWidth={1.2} /></button>
                  {storyColorId && (
                    <SustainabilityAnalysis
                      color={colors[currentColorIndex]?.name}
                      hex={colors[currentColorIndex]?.hex}
                      location={colors[currentColorIndex]?.location}
                      materials={colors[currentColorIndex]?.materials?.map(m => m.name).join(', ')}
                      date={colors[currentColorIndex]?.dateCollected}
                      season={colors[currentColorIndex]?.season}
                      bioregion={colors[currentColorIndex]?.bioregion?.description || ''}
                      onOpenChat={() => {
                        setSustainabilityModalOpen(false);
                        setPigmentModalOpen(true);
                      }}
                    />
                  )}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            {/* Pigment Analysis Modal */}
            <Dialog.Root open={isPigmentModalOpen} onOpenChange={setPigmentModalOpen}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                <Dialog.Content className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full md:w-[500px] max-w-full z-50 bg-white shadow-2xl rounded-t-2xl flex flex-col p-8 overflow-y-auto border-t-4 border-black" style={{fontFamily:'Caveat, cursive', maxHeight: '80vh'}}>
                  <Dialog.Title className="sr-only">AI Design Ideas</Dialog.Title>
                  <button className="absolute top-4 right-4 text-[#2C3E50] hover:text-[#2C3E50]/80" onClick={() => setPigmentModalOpen(false)}><X className="w-5 h-5" strokeWidth={1.2} /></button>
                  {storyColorId && (
                    <PigmentAnalysis
                      color={colors[currentColorIndex]?.name}
                      hex={colors[currentColorIndex]?.hex}
                      location={colors[currentColorIndex]?.location}
                      materials={colors[currentColorIndex]?.materials?.map(m => m.name).join(', ')}
                      date={colors[currentColorIndex]?.dateCollected}
                      season={colors[currentColorIndex]?.season}
                      bioregion={colors[currentColorIndex]?.bioregion?.description || ''}
                    />
                  )}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            {/* Add Media Modal */}
            <Dialog.Root open={isAddMediaOpen} onOpenChange={setAddMediaOpen}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 z-50 flex flex-col gap-6 border-2 border-[#2C3E50]">
                  <Dialog.Title className="text-3xl text-[#2C3E50] mb-4">Add Media Photos</Dialog.Title>
                  <form onSubmit={handleUpload} className="flex flex-col gap-6">
                    <input type="file" accept="image/*" multiple onChange={handleMediaChange} className="mb-4" />
                    {mediaFiles.length > 0 && (
                      <div className="flex flex-col gap-4">
                        {mediaFiles.map((file, idx) => (
                          <div key={idx} className="flex flex-col gap-2 border-b pb-4">
                            <div className="flex items-center gap-4">
                              <Image src={URL.createObjectURL(file)} alt="preview" width={80} height={80} className="object-cover" />
                              <input
                                type="text"
                                placeholder="Caption for this image"
                                value={captions[idx] || ''}
                                onChange={e => handleCaptionChange(idx, e.target.value)}
                                className="flex-1 border rounded-lg px-3 py-2 font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-end gap-4 mt-4">
                      <Dialog.Close asChild>
                        <button type="button" className="bos-button text-lg px-6 py-2">Cancel</button>
                      </Dialog.Close>
                      <button type="submit" disabled={isUploading || mediaFiles.length === 0} className="bos-button text-lg px-6 py-2 disabled:opacity-50">
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
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
          className="bos-button text-xl px-8 py-3 fixed bottom-8 z-50 shadow-lg flex items-center justify-center transition-opacity"
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
          className="bos-button text-xl px-8 py-3 fixed bottom-8 z-50 shadow-lg flex items-center justify-center transition-opacity"
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
            const newBiodiversity = await animalsResponse.json();
            setBiodiversity(newBiodiversity);
          } catch (error) {
            console.error('Error submitting animal:', error);
            alert('Failed to submit animal. Please try again.');
          }
        }}
      />
    </div>
  );
}
