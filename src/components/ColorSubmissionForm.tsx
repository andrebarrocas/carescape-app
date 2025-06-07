'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as Dialog from '@radix-ui/react-dialog';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { Upload, X, Camera, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const colorSubmissionSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
  hex: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  sourceMaterial: z.string().min(1, 'Source material is required'),
  type: z.enum(['pigment', 'dye', 'ink']),
  application: z.string().optional(),
  process: z.string().min(1, 'Process description is required'),
  season: z.string().min(1, 'Season is required'),
  dateCollected: z.string(),
  pseudonym: z.string().optional(),
  email: z.string().email('Valid email is required'),
  agreeToTerms: z.boolean().optional(),
  mediaUploads: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    mimetype: z.string(),
    type: z.enum(['outcome', 'landscape', 'process']),
  })).optional(),
});

type ColorSubmissionForm = z.infer<typeof colorSubmissionSchema>;

interface ColorSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ColorSubmissionForm) => Promise<void>;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface MediaFile {
  file: File;
  type: 'outcome' | 'landscape' | 'process';
  preview: string;
}

// Add maptiler provider for better map tiles
const maptilerProvider = (x: number, y: number, z: number) => {
  return `https://api.maptiler.com/maps/basic-v2/256/${z}/${x}/${y}.png?key=YOUR_MAPTILER_KEY`
}

// Use OpenStreetMap provider which is free and reliable
const osmProvider = (x: number, y: number, z: number) => {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
}

export default function ColorSubmissionForm({ isOpen, onClose, onSubmit }: ColorSubmissionFormProps) {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40, -74.5]);
  const [mapZoom, setMapZoom] = useState(9);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ColorSubmissionForm>({
    resolver: zodResolver(colorSubmissionSchema),
    defaultValues: {
      hex: '#000000',
      type: 'pigment',
      season: 'Spring',
    }
  });

  const handleMapClick = useCallback((coords: { lat: number; lng: number }) => {
    setSelectedLocation([coords.lat, coords.lng]);
    setMapCenter([coords.lat, coords.lng]);
    setValue('coordinates', coords);
    
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
      .then(response => response.json())
      .then(data => {
        if (data.display_name) {
          setValue('location', data.display_name);
        }
      })
      .catch(error => {
        console.error('Error reverse geocoding:', error);
      });
  }, [setValue]);

  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setLocationSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const handleLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setValue('location', query);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      searchLocation(query);
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    setValue('location', suggestion.display_name);
    setValue('coordinates', { lat, lng });
    setSelectedLocation([lat, lng]);
    setMapCenter([lat, lng]);
    setMapZoom(12);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'outcome' | 'landscape' | 'process') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL
    const preview = URL.createObjectURL(file);

    // If it's an outcome image, generate hex code
    if (type === 'outcome') {
      const hex = await getAverageColor(file);
      setValue('hex', hex);
    }

    // Create a new media file object
    const newMedia: MediaFile = {
      file,
      preview,
      type,
    };

    // Add to media files
    setMediaFiles(prev => [...prev, newMedia]);
  };

  const getAverageColor = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve('#000000');
            return;
          }

          // Set canvas size to match image
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image on canvas
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          let r = 0, g = 0, b = 0;
          const pixelCount = data.length / 4;

          // Sum up all RGB values
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }

          // Calculate average
          r = Math.round(r / pixelCount);
          g = Math.round(g / pixelCount);
          b = Math.round(b / pixelCount);

          // Convert to hex
          const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
          resolve(hex);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: ColorSubmissionForm) => {
    try {
      if (!selectedLocation) {
        throw new Error('Please select a location on the map');
      }
      
      setSubmitting(true);
      
      // First, upload all media files
      const mediaUploads = await Promise.all(
        mediaFiles.map(async (media) => {
          const formData = new FormData();
          formData.append('file', new Blob([media.file], { type: media.file.type }));
          formData.append('type', media.type);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload media');
          }
          
          const uploadedMedia = await response.json();
          return {
            id: uploadedMedia.id,
            filename: uploadedMedia.filename,
            mimetype: uploadedMedia.mimetype,
            type: uploadedMedia.type
          };
        })
      );

      // Create materials and processes arrays
      const materials = [{
        name: data.sourceMaterial,
        partUsed: 'whole', // Default value
        originNote: data.description,
      }];

      const processes = [{
        technique: data.type,
        application: data.application || data.type,
        notes: data.process,
      }];

      // Then submit the color data with media files
      const formData = {
        ...data,
        materials,
        processes,
        mediaUploads,
        coordinates: { lat: selectedLocation[0], lng: selectedLocation[1] }
      };

      await onSubmit(formData);
      onClose();
      router.refresh(); // Refresh the page after successful submission
    } catch (error) {
      console.error('Error submitting color:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
          <Dialog.Title className="text-2xl font-bold mb-6">Color Submission Form</Dialog.Title>
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* 1. Color Name */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">1. Color Name</h2>
              <div>
                <label className="block text-sm font-medium mb-1">What would you call this color?</label>
                <input
                  {...register('name')}
                  className="w-full border rounded-md p-2"
                  placeholder="Enter color name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
            </div>

            {/* 2. Color Outcome */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">2. Color Outcome</h2>
              <div className="border rounded-md p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'outcome')}
                  className="hidden"
                  id="outcome-upload"
                />
                <label
                  htmlFor="outcome-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-gray-50"
                >
                  <Camera className="w-8 h-8 mb-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Upload photo of the final color</span>
                  <span className="text-xs text-gray-400 mt-1">Hex code will be generated automatically</span>
                </label>
                {mediaFiles.filter(f => f.type === 'outcome').map((file, i) => (
                  <div key={i} className="relative mt-4">
                    <img 
                      src={file.preview} 
                      alt="Color outcome" 
                      className="w-full object-cover rounded-md"
                      style={{ height: '160px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Origins */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">3. Origins</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Describe landscape, place or environment</label>
                <textarea
                  {...register('description')}
                  className="w-full border rounded-md p-2"
                  rows={3}
                  placeholder="Describe the environment where you found this color"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Location</label>
                <div className="relative">
                  <input
                    {...register('location')}
                    onChange={handleLocationInput}
                    className="w-full border rounded-md p-2 pr-10"
                    placeholder="Search for a location"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                {errors.coordinates && <p className="text-red-500 text-sm mt-1">Please select a location on the map</p>}
                
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg border max-h-60 overflow-y-auto"
                  >
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-60 rounded-md overflow-hidden border">
                <PigeonMap
                  provider={osmProvider}
                  center={mapCenter}
                  zoom={mapZoom}
                  onClick={({ latLng }) => handleMapClick({ lat: latLng[0], lng: latLng[1] })}
                  animate={true}
                >
                  {selectedLocation && (
                    <Marker
                      width={50}
                      anchor={selectedLocation}
                      color={watch('hex') || '#000000'}
                    />
                  )}
                </PigeonMap>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Landscape Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'landscape')}
                  className="hidden"
                  id="landscape-upload"
                />
                <label
                  htmlFor="landscape-upload"
                  className="flex items-center justify-center border-2 border-dashed rounded-md p-4 cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="w-6 h-6 mr-2" />
                  <span>Upload photo of landscape</span>
                </label>
                
                {/* Display landscape photos */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {mediaFiles
                    .filter(file => file.type === 'landscape')
                    .map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={file.preview}
                          alt="Landscape"
                          className="w-full object-cover rounded-md"
                          style={{ 
                            height: mediaFiles.find(f => f.type === 'outcome') ? '160px' : '160px' // Match the height of outcome photo
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(mediaFiles.findIndex(f => f === file))}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* 4. Process */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">4. Process</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Source Material</label>
                <input
                  {...register('sourceMaterial')}
                  className="w-full border rounded-md p-2"
                  placeholder="What material did you use?"
                />
                {errors.sourceMaterial && <p className="text-red-500 text-sm mt-1">{errors.sourceMaterial.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select {...register('type')} className="w-full border rounded-md p-2">
                  <option value="pigment">Pigment</option>
                  <option value="dye">Dye</option>
                  <option value="ink">Ink</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Application (optional)</label>
                <input
                  {...register('application')}
                  className="w-full border rounded-md p-2"
                  placeholder="How was the color applied?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Process / Recipe</label>
                <textarea
                  {...register('process')}
                  className="w-full border rounded-md p-2"
                  rows={4}
                  placeholder="How did you gather and prepare your color?"
                />
                {errors.process && <p className="text-red-500 text-sm mt-1">{errors.process.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Season</label>
                  <select {...register('season')} className="w-full border rounded-md p-2">
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
                  </select>
                  {errors.season && <p className="text-red-500 text-sm mt-1">{errors.season.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date Collected</label>
                  <input
                    type="date"
                    {...register('dateCollected')}
                    className="w-full border rounded-md p-2"
                  />
                  {errors.dateCollected && <p className="text-red-500 text-sm mt-1">{errors.dateCollected.message}</p>}
                </div>
              </div>
            </div>

            {/* 5. Media Uploads */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">5. Media Uploads (Optional)</h2>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Photos of process and materials, final results, foraging and landscape, drawings,
                  other related inspiring material
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'process')}
                  className="hidden"
                  id="process-upload"
                />
                <label
                  htmlFor="process-upload"
                  className="flex items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="w-8 h-8 mr-2" />
                  <span>Upload additional photos</span>
                </label>
              </div>
            </div>

            {/* 6. Personal Data */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">6. Personal Data</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Name or pseudonym (optional)</label>
                <input
                  {...register('pseudonym')}
                  className="w-full border rounded-md p-2"
                  placeholder="Enter your name or pseudonym"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  {...register('email')}
                  className="w-full border rounded-md p-2"
                  type="email"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('agreeToTerms')}
                  id="terms"
                  className="rounded border-gray-300"
                />
                <label htmlFor="terms" className="text-sm">
                  I agree to the terms and conditions
                </label>
                {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-all duration-200"
              >
                {submitting ? 'Submitting...' : 'Submit Color'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 