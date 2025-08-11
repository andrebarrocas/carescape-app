'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
import { clusterMarkers, parseCoordinates, MapMarker, applyZoomScaling } from '@/lib/map';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const caveat = Caveat({ subsets: ['latin'], weight: '700', variable: '--font-caveat' });

const EmbeddedColorDetails = dynamic(() => import('@/components/StoryColorDetails'), { ssr: false });
const EmbeddedAnimalDetails = dynamic(() => import('@/components/AnimalDetails'), { ssr: false });

interface MapProps {
  colors: ColorSubmission[];
  titleColor?: string;
  onColorSelect?: (color: ColorSubmission) => void;
  selectedColorForFilter?: ColorSubmission | null;
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

export default function Map({ colors, titleColor, onColorSelect, selectedColorForFilter }: MapProps) {
  const [hoveredColor, setHoveredColor] = useState<ColorSubmission | null>(null);
  const [showColorForm, setShowColorForm] = useState(false);
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ColorSubmission | null>(null);
  const router = useRouter();
  const [storyMode, setStoryMode] = useState(false);
  const [currentColorId, setCurrentColorId] = useState<string | null>(null);
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
  const [colorFilter, setColorFilter] = useState({ color: '', material: '', location: '' });

  // Filtered colors for map markers
  const filteredColors = useMemo(() => {
    return colors.filter(c => {
      const matchColor = colorFilter.color ? c.name.toLowerCase().includes(colorFilter.color.toLowerCase()) : true;
      const matchMaterial = colorFilter.material ? c.materials.some(m => m.name.toLowerCase().includes(colorFilter.material.toLowerCase())) : true;
      const matchLocation = colorFilter.location ? c.location.toLowerCase().includes(colorFilter.location.toLowerCase()) : true;
      return matchColor && matchMaterial && matchLocation;
    });
  }, [colors, colorFilter]);

  const colorCoords = filteredColors.map(c => parseCoordinates(c.coordinates)).filter(Boolean);
  const defaultCenter = colorCoords.length ? {
    latitude: colorCoords.reduce((sum, c) => sum + c!.lat, 0) / colorCoords.length,
    longitude: colorCoords.reduce((sum, c) => sum + c!.lng, 0) / colorCoords.length + 0.02, // Offset to center markers on left
    zoom: 3
  } : { latitude: 20, longitude: 0, zoom: 2 };
  const [viewport, setViewport] = useState(defaultCenter);

  // Process colors for clustering with zoom-based scaling
  const clusteredColors = useMemo(() => {
    const colorMarkers: MapMarker[] = filteredColors
      .map(color => {
        const coords = parseCoordinates(color.coordinates);
        if (!coords) return null;
        return {
          id: color.id,
          lat: coords.lat,
          lng: coords.lng,
          data: color,
        };
      })
      .filter(Boolean) as MapMarker[];

    // Enhanced threshold calculation for better clustering when zoomed out
    let threshold: number;
    if (viewport.zoom < 4) {
      threshold = 0.08; // Very low zoom: cluster colors that are quite far apart
    } else if (viewport.zoom < 6) {
      threshold = 0.06; // Low zoom: cluster colors with medium distance
    } else if (viewport.zoom < 8) {
      threshold = 0.04; // Medium zoom: cluster colors that are closer
    } else if (viewport.zoom < 10) {
      threshold = 0.025; // High zoom: cluster only very close colors
    } else {
      threshold = 0.015; // Very high zoom: minimal clustering
    }
    const baseClustered = clusterMarkers(colorMarkers, threshold);
    return applyZoomScaling(baseClustered, viewport.zoom);
  }, [filteredColors, viewport.zoom]);

  // Get current color index for navigation
  const currentColorIndex = useMemo(() => {
    if (!currentColorId) return 0;
    return filteredColors.findIndex(color => color.id === currentColorId);
  }, [currentColorId, filteredColors]);

  // Get current color object
  const currentColor = useMemo(() => {
    return filteredColors[currentColorIndex] || null;
  }, [filteredColors, currentColorIndex]);

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
        // Roads layer removed to disable road network display
        // {
        //   id: 'roads',
        //   type: 'line',
        //   source: 'mapbox-streets',
        //   'source-layer': 'road',
        //   paint: {
        //     'line-color': '#8B7355',  // Warm brown
        //     'line-width': 1,
        //     'line-opacity': 0.3
        //   }
        // },
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

  // Handle keyboard navigation
  useEffect(() => {
    if (!storyMode) return;
    
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const nextIndex = Math.min(currentColorIndex + 1, filteredColors.length - 1);
        setCurrentColorId(filteredColors[nextIndex]?.id || null);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const prevIndex = Math.max(currentColorIndex - 1, 0);
        setCurrentColorId(filteredColors[prevIndex]?.id || null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [storyMode, currentColorIndex, filteredColors]);

  // Update story color ID when current color changes
  useEffect(() => {
    if (storyMode && currentColor) {
      setStoryColorId(currentColor.id);
    }
  }, [storyMode, currentColor]);

  // Handle viewport animation for story mode
  useEffect(() => {
    if (storyMode && currentColor) {
      const coords = parseCoordinates(currentColor.coordinates);
      if (coords && mapRef.current) {
        setIsAnimating(true);
        
        // Calculate a center point that keeps markers visible on the left side
        // Offset the center slightly to the right so markers appear on the left
        const offsetLng = coords.lng + 0.02; // Small offset to center markers on left
        
        mapRef.current.flyTo({
          center: [offsetLng, coords.lat],
          zoom: 10, // Reduced zoom to keep more markers visible
          duration: 2000,
          essential: true
        });
        
        // Reset animation state after animation completes
        setTimeout(() => {
          setIsAnimating(false);
        }, 2000);
      }
    }
  }, [storyMode, currentColor]);

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
        formData.append('types', 'process'); // Default type for additional media uploads
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
      <MapFilterButtons 
        onFilterChange={handleFilterChange}
        onColorFilterChange={setColorFilter}
      />

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
            // Roads layer removed to disable road network display
            // {
            //   id: 'roads',
            //   type: 'line',
            //   source: 'mapbox-streets',
            //   'source-layer': 'road',
            //   paint: {
            //     'line-color': '#2C3E50',
            //     'line-width': 1,
            //     'line-opacity': 0.4
            //   }
            // },
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
        {(currentView === 'all' || currentView === 'colors') && clusteredColors.map((cluster, idx) => {
          const coords = parseCoordinates(cluster.data.coordinates);
          if (!coords) return null;
          
          // Apply offset if this marker is part of a cluster
          const adjustedLat = coords.lat + (cluster.offset?.y || 0);
          const adjustedLng = coords.lng + (cluster.offset?.x || 0);
          
          // Calculate marker size based on zoom level
          const baseSize = 40; // 10 * 4 (w-10 = 40px)
          const zoomFactor = Math.max(0.5, Math.min(2, viewport.zoom / 8)); // Scale between 0.5x and 2x based on zoom
          const markerSize = baseSize * zoomFactor;
          
          return (
            <Marker
              key={cluster.id}
              longitude={adjustedLng}
              latitude={adjustedLat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setStoryMode(true);
                setCurrentColorId(cluster.data.id);
                setSelectedColor(null);
                
                // Immediately center the map on the selected color with proper offset
                const coords = parseCoordinates(cluster.data.coordinates);
                if (coords && mapRef.current) {
                  const offsetLng = coords.lng + 0.02; // Offset to center markers on left
                  mapRef.current.flyTo({
                    center: [offsetLng, coords.lat],
                    zoom: 10,
                    duration: 1500,
                    essential: true
                  });
                }
                
                // Call the onColorSelect callback if provided
                if (onColorSelect) {
                  onColorSelect(cluster.data);
                }
              }}
            >
              <div className="relative">
                <div
                  className={`rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200 ${
                    storyMode && cluster.data.id === currentColorId ? 'ring-4 ring-[#2C3E50]' : ''
                  } ${
                    selectedColorForFilter && selectedColorForFilter.id === cluster.data.id ? 'ring-4 ring-green-500 ring-opacity-75' : ''
                  }`}
                  style={{ 
                    backgroundColor: cluster.data.hex,
                    width: `${markerSize}px`,
                    height: `${markerSize}px`
                  }}
                  title={cluster.isClustered && cluster.clusterSize ? `${cluster.clusterSize} colors at this location` : cluster.data.name}
                />
                {/* Show cluster indicator if this marker is part of a cluster */}
                {/* No badge, always show all markers offset and visible */}
              </div>
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
          
          // Calculate marker size based on zoom level
          const baseSize = 48; // 12 * 4 (w-12 = 48px)
          const zoomFactor = Math.max(0.5, Math.min(2, viewport.zoom / 8)); // Scale between 0.5x and 2x based on zoom
          const markerSize = baseSize * zoomFactor;
          
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
                className="rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200 bg-white p-1 overflow-hidden"
                style={{ 
                  border: '2px solid #2C3E50',
                  width: `${markerSize}px`,
                  height: `${markerSize}px`
                }}
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
            // Extract media files from the data
            const { mediaFiles, ...colorData } = data;
            
            console.log('Submitting color data:', colorData);
            console.log('Media files:', mediaFiles);
            
            // First, create the color
            const response = await fetch('/api/colors', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(colorData),
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('API error response:', errorText);
              throw new Error(`Failed to submit color: ${errorText}`);
            }

            const color = await response.json();

            // Then, upload media files if any
            if (mediaFiles && mediaFiles.length > 0) {
              try {
                const formData = new FormData();
                mediaFiles.forEach((media: any) => {
                  formData.append('media', media.file);
                  formData.append('captions', media.caption || '');
                  formData.append('types', media.type);
                });

                const mediaResponse = await fetch(`/api/colors/${color.id}/images`, {
                  method: 'POST',
                  body: formData,
                });

                if (!mediaResponse.ok) {
                  console.error('Failed to upload media files');
                }
              } catch (error) {
                console.error('Error uploading media files:', error);
                // Continue even if media upload fails
              }
            }

            setShowColorForm(false);
            router.refresh();
          } catch (error) {
            console.error('Error submitting color:', error);
            alert(`Failed to submit color: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            className="fixed top-0 right-0 h-full w-full md:w-[650px] z-50 bg-white shadow-2xl flex flex-col p-0 overflow-y-auto border-l border-black" 
            style={{ fontFamily: 'Futura Magazine, monospace' }}
          >
            <div className="flex-1 overflow-y-auto p-6">
              <EmbeddedColorDetails colorId={storyColorId} />
            </div>
            {/* Separator line and action bar */}
            <div className="w-full flex flex-col items-center">
              <div className="w-full my-3">
                <div className="w-full h-px bg-black"></div>
              </div>
              <div className="w-full px-6 pb-6 flex flex-col items-center">
                <div className="flex flex-row gap-2 w-full items-center justify-center">
                  {/* AI Buttons Group */}
                  <button
                    onClick={() => setSustainabilityModalOpen(true)}
                    className="bg-green-600 text-white text-sm font-mono font-bold tracking-wider px-2 py-3 rounded-none transition-opacity h-12 flex-1 min-w-0"
                  >
                    Eco Analysis
                  </button>
                  <button
                    onClick={() => setPigmentModalOpen(true)}
                    className="bg-blue-500 text-white text-sm font-mono font-bold tracking-wider px-2 py-3 rounded-none transition-opacity h-12 flex-1 min-w-0"
                  >
                    + Bioregional
                  </button>
                  {/* Add Content Button */}
                  <button
                    onClick={() => setAddMediaOpen(true)}
                    className="bg-[#5C5954] text-white text-sm font-mono font-bold tracking-wider px-2 py-3 rounded-none transition-opacity h-12 flex-1 min-w-0"
                  >
                    + Add Content
                  </button>
                  {/* Navigation arrows */}
                  <button
                    onClick={() => {
                      const prevIndex = Math.max(currentColorIndex - 1, 0);
                      setCurrentColorId(filteredColors[prevIndex]?.id || null);
                    }}
                    disabled={currentColorIndex === 0 || isAnimating}
                    className="bg-[#A7A39E] text-white text-xl font-mono font-bold px-0 py-3 rounded-none transition-opacity disabled:opacity-40 h-12 w-12 flex-shrink-0"
                  >
                    {'<'}
                  </button>
                  <button
                    onClick={() => {
                      const nextIndex = Math.min(currentColorIndex + 1, filteredColors.length - 1);
                      setCurrentColorId(filteredColors[nextIndex]?.id || null);
                    }}
                    disabled={currentColorIndex === filteredColors.length - 1 || isAnimating}
                    className="bg-[#A7A39E] text-white text-xl font-mono font-bold px-0 py-3 rounded-none transition-opacity disabled:opacity-40 h-12 w-12 flex-shrink-0"
                  >
                    {'>'}
                  </button>
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
                      color={currentColor?.name}
                      hex={currentColor?.hex}
                      location={currentColor?.location}
                      materials={currentColor?.materials?.map(m => m.name).join(', ')}
                      date={currentColor?.dateCollected}
                      season={currentColor?.season}
                      bioregion={currentColor?.bioregion?.description || ''}
                      colorId={currentColor?.id || ''}
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
                  <Dialog.Title className="sr-only">More Bioregional</Dialog.Title>
                  <button className="absolute top-4 right-4 text-[#2C3E50] hover:text-[#2C3E50]/80" onClick={() => setPigmentModalOpen(false)}><X className="w-5 h-5" strokeWidth={1.2} /></button>
                  {storyColorId && (
                    <PigmentAnalysis
                      color={currentColor?.name}
                      hex={currentColor?.hex}
                      location={currentColor?.location}
                      materials={currentColor?.materials?.map(m => m.name).join(', ')}
                      date={currentColor?.dateCollected}
                      season={currentColor?.season}
                      bioregion={currentColor?.bioregion?.description || ''}
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
                  
                  {/* Black line separator - full width like modal border */}
                  <div className="w-full h-0.5 bg-black"></div>
                  
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
                    <div className="flex justify-center gap-4 mt-4">
                      <Dialog.Close asChild>
                        <button type="button" className="bg-[#5C5954] text-white text-base font-mono font-bold tracking-wider px-6 py-4 h-14 w-full rounded-none">Cancel</button>
                      </Dialog.Close>
                      <button type="submit" disabled={isUploading || mediaFiles.length === 0} className="bg-green-600 text-white text-base font-mono font-bold tracking-wider px-6 py-4 h-14 w-full rounded-none disabled:opacity-50">
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
          className="bg-black text-white text-2xl px-8 py-3 font-bold tracking-wider rounded-none fixed bottom-8 z-50 shadow-lg flex items-center justify-center transition-opacity"
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
