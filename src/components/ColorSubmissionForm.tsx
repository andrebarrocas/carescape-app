'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as Dialog from '@radix-ui/react-dialog';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { Upload, X, Camera, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const colorSubmissionSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
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
  dateCollected: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, "Please enter a valid date"),
  pseudonym: z.string().optional(),
  email: z.string().email('Valid email is required'),
  agreeToTerms: z.boolean().optional(),
  hex: z.string().min(1, 'Hex color is required'),
  mediaUploads: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    mimetype: z.string(),
    type: z.enum(['outcome', 'landscape', 'process']),
    caption: z.string().optional(),
  })).optional(),
});

export type ColorSubmissionForm = z.infer<typeof colorSubmissionSchema>;
export { colorSubmissionSchema };

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
  caption: string;
}

interface ProcessImage {
  file: File;
  preview: string;
  caption: string;
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
  const [mapZoom, setMapZoom] = useState(3);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [processImages, setProcessImages] = useState<ProcessImage[]>([]);
  const [currentCaption, setCurrentCaption] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ColorSubmissionForm>({
    resolver: zodResolver(colorSubmissionSchema),
    defaultValues: {
      type: 'pigment',
      season: 'Spring',
    }
  });

  const handleMapClick = useCallback((coords: { lat: number; lng: number }) => {
    const newLocation: [number, number] = [coords.lat, coords.lng];
    setSelectedLocation(newLocation);
    setMapCenter(newLocation);
    setMapZoom(6);
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
    const newLocation: [number, number] = [lat, lng];
    
    setValue('location', suggestion.display_name);
    setValue('coordinates', { lat, lng });
    setSelectedLocation(newLocation);
    setMapCenter(newLocation);
    setMapZoom(6);
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
    const files = e.target.files;
    if (!files) return;

    // Handle multiple files for process type
    if (type === 'process') {
      Array.from(files).forEach(async (file) => {
        const preview = URL.createObjectURL(file);
        const newMedia: MediaFile = {
          file,
          type,
          preview,
          caption: '',
        };
        setMediaFiles(prev => [...prev, newMedia]);
      });
    } else {
      // For outcome and landscape, only handle one file
      const file = files[0];
      const preview = URL.createObjectURL(file);

      // If it's an outcome image, generate hex code
      if (type === 'outcome') {
        const hex = await getAverageColor(file);
        setValue('hex', hex); // Set the hex value in the form
        const newMedia: MediaFile = {
          file,
          type,
          preview,
          caption: hex,
        };
        // Remove any existing outcome image
        setMediaFiles(prev => [...prev.filter(m => m.type !== 'outcome'), newMedia]);
      } else {
        const newMedia: MediaFile = {
          file,
          type,
          preview,
          caption: '',
        };
        // Remove any existing landscape image
        setMediaFiles(prev => [...prev.filter(m => m.type !== 'landscape'), newMedia]);
      }
    }
  };

  const getAverageColor = async (file: File): Promise<string> => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
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

  const handleCaptionChange = (index: number, caption: string) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = { ...newFiles[index], caption };
      return newFiles;
    });
  };

  const handleProcessImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setProcessImages(prev => [...prev, { file, preview, caption: '' }]);
  };

  const handleProcessImageCaptionChange = (index: number, caption: string) => {
    setProcessImages(prev => prev.map((img, i) => 
      i === index ? { ...img, caption } : img
    ));
  };

  const handleRemoveProcessImage = (index: number) => {
    setProcessImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: ColorSubmissionForm) => {
    setSubmitting(true);
    try {
      // Set default coordinates if not selected
      if (!data.coordinates) {
        data.coordinates = { lat: 0, lng: 0 };
      }

      // Set a default hex color if not set
      if (!data.hex) {
        data.hex = '#000000';
      }

      // Define the type for media uploads
      type MediaUpload = {
        id: string;
        filename: string;
        mimetype: string;
        type: 'outcome' | 'landscape' | 'process';
        caption?: string;
      };

      // If there are media files, try to upload them
      let mediaUploads: MediaUpload[] = [];
      if (mediaFiles.length > 0) {
        try {
          const mediaUploadPromises = mediaFiles.map(async (media) => {
            const formData = new FormData();
            formData.append('file', media.file);
            formData.append('type', media.type);
            if (media.caption) {
              formData.append('caption', media.caption);
            }
            
            try {
              const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });
              
              if (!response.ok) {
                throw new Error('Failed to upload media');
              }
              
              const uploadedFile = await response.json();
              
              return {
                id: uploadedFile.id,
                filename: media.file.name,
                mimetype: media.file.type,
                type: media.type,
                caption: media.caption,
              } as MediaUpload;
            } catch (error) {
              console.error('Error uploading media:', error);
              return null;
            }
          });

          mediaUploads = (await Promise.all(mediaUploadPromises))
            .filter((upload): upload is MediaUpload => upload !== null);
        } catch (error) {
          console.error('Error handling media uploads:', error);
          // Continue with form submission even if media upload fails
        }
      }
      
      // Format the date properly
      const formattedDate = new Date(data.dateCollected).toISOString();
      
      // Add uploaded media to form data if any were successfully uploaded
      const formData = {
        ...data,
        dateCollected: formattedDate,
        mediaUploads: mediaUploads.length > 0 ? mediaUploads : undefined,
      };

      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg overflow-y-auto">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="flex justify-between items-start">
              <Dialog.Title className="text-2xl font-serif text-[#2C3E50]">
                Add New Color
              </Dialog.Title>
              <Dialog.Close className="text-[#2C3E50] hover:text-[#2C3E50]/80">
                <X className="w-6 h-6" />
              </Dialog.Close>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                  Color Name
                </label>
                <input
                  {...register('name')}
                  className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  placeholder="Enter color name"
                />
                {errors.name && (
                  <p className="mt-1 text-red-500 text-xs">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none min-h-[100px]"
                  placeholder="Describe the color and its significance"
                />
                {errors.description && (
                  <p className="mt-1 text-red-500 text-xs">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                  Source Material
                </label>
                <input
                  {...register('sourceMaterial')}
                  className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  placeholder="Enter source material"
                />
                {errors.sourceMaterial && (
                  <p className="mt-1 text-red-500 text-xs">{errors.sourceMaterial.message}</p>
                )}
              </div>

              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                  Type
                </label>
                <select
                  {...register('type')}
                  className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                >
                  <option value="pigment">Pigment</option>
                  <option value="dye">Dye</option>
                  <option value="ink">Ink</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-red-500 text-xs">{errors.type.message}</p>
                )}
              </div>

              <div className="relative">
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                  Location
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C3E50] w-4 h-4" />
                  <input
                    {...register('location')}
                    onChange={handleLocationInput}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                    placeholder="Search for a location..."
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-red-500 text-xs">{errors.location.message}</p>
                )}
                {/* Location suggestions dropdown */}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white border-2 border-[#2C3E50] max-h-60 overflow-auto"
                  >
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full p-2 text-left hover:bg-gray-100 font-mono text-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.display_name}
                      </button>
                    ))}
                  </div>
                )}
                {/* Map for location selection */}
                <div className="mt-4 h-[300px] border-2 border-[#2C3E50] rounded-lg overflow-hidden">
                  <PigeonMap
                    center={mapCenter}
                    zoom={mapZoom}
                    defaultCenter={[40, -74.5]}
                    defaultZoom={3}
                    minZoom={2}
                    maxZoom={8}
                    onClick={({ latLng }) => handleMapClick({ lat: latLng[0], lng: latLng[1] })}
                    boxClassname="w-full h-full"
                  >
                    {selectedLocation && (
                      <Marker
                        width={50}
                        anchor={selectedLocation}
                        color="#2C3E50"
                        className="cursor-pointer transition-transform hover:scale-110"
                      />
                    )}
                  </PigeonMap>
                </div>
              </div>

              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                  Process Description
                </label>
                <textarea
                  {...register('process')}
                  className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none min-h-[100px]"
                  placeholder="Describe the process used to create this color"
                  rows={4}
                />
                {errors.process && (
                  <p className="mt-1 text-red-500 text-xs">{errors.process.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-mono text-sm text-[#2C3E50]">Application (optional)</label>
                  <input
                    {...register('application')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-sm text-[#2C3E50]">Season</label>
                  <select
                    {...register('season')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  >
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Autumn">Autumn</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-sm text-[#2C3E50]">Date Collected</label>
                  <input
                    {...register('dateCollected')}
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  />
                  {errors.dateCollected && (
                    <p className="mt-1 text-red-500 text-xs">{errors.dateCollected.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-sm text-[#2C3E50]">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-red-500 text-xs">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-sm text-[#2C3E50]">Pseudonym (optional)</label>
                  <input
                    {...register('pseudonym')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                    placeholder="Enter a pseudonym"
                  />
                </div>
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="space-y-6">
              <h3 className="font-serif text-xl text-[#2C3E50]">Media Upload</h3>
              {/* Hidden hex input */}
              <input type="hidden" {...register('hex')} />
              {errors.hex && (
                <p className="mt-1 text-red-500 text-xs">{errors.hex.message}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Outcome Image Upload */}
                <div className="space-y-2">
                  <span className="font-mono text-sm text-[#2C3E50] block">Color Outcome</span>
                  <div className="max-w-[300px]">
                    <label className="block w-full aspect-square border-2 border-[#2C3E50] relative cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'outcome')}
                        className="hidden"
                      />
                      {mediaFiles.find(m => m.type === 'outcome') ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={mediaFiles.find(m => m.type === 'outcome')?.preview || ''}
                            alt="Color outcome preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(mediaFiles.findIndex(m => m.type === 'outcome'))}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg z-10"
                          >
                            <X className="w-4 h-4 text-[#2C3E50]" />
                          </button>
                          {mediaFiles.find(m => m.type === 'outcome')?.caption && (
                            <div className="absolute bottom-2 left-2 right-2 bg-white/90 p-2 rounded text-xs font-mono">
                              Hex: {mediaFiles.find(m => m.type === 'outcome')?.caption}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-[#2C3E50] group-hover:scale-110 transition-transform" />
                        </div>
                      )}
                    </label>
                  </div>
                  <p className="font-mono text-xs text-[#2C3E50]">Upload an image to generate the hex color code</p>
                </div>

                {/* Landscape Image Upload */}
                <div className="space-y-2">
                  <span className="font-mono text-sm text-[#2C3E50] block">Landscape Photo</span>
                  <div className="max-w-[300px]">
                    <label className="block w-full aspect-square border-2 border-[#2C3E50] relative cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'landscape')}
                        className="hidden"
                      />
                      {mediaFiles.find(m => m.type === 'landscape') ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={mediaFiles.find(m => m.type === 'landscape')?.preview || ''}
                            alt="Landscape preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(mediaFiles.findIndex(m => m.type === 'landscape'))}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg z-10"
                          >
                            <X className="w-4 h-4 text-[#2C3E50]" />
                          </button>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-[#2C3E50] group-hover:scale-110 transition-transform" />
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Media Images Upload */}
              <div className="space-y-4">
                <span className="font-mono text-sm text-[#2C3E50] block">Media Images</span>
                <label className="block cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'process')}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 px-6 py-3 border-2 border-[#2C3E50] font-mono text-sm hover:bg-[#2C3E50] hover:text-white transition-colors">
                    <Upload className="w-5 h-5" />
                    <span>Add Images</span>
                  </div>
                </label>

                {mediaFiles.filter(m => m.type === 'process').length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaFiles
                      .filter(m => m.type === 'process')
                      .map((media, index) => {
                        // Find the actual index in the full mediaFiles array
                        const actualIndex = mediaFiles.findIndex(m => m === media);
                        return (
                          <div key={actualIndex} className="space-y-4">
                            <div className="relative aspect-square border-2 border-[#2C3E50]">
                              <Image
                                src={media.preview}
                                alt={`Media image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(actualIndex)}
                                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg"
                              >
                                <X className="w-4 h-4 text-[#2C3E50]" />
                              </button>
                            </div>
                            <textarea
                              placeholder="Add caption..."
                              value={media.caption}
                              onChange={(e) => handleCaptionChange(actualIndex, e.target.value)}
                              className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm resize-none focus:outline-none"
                              rows={4}
                            />
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2C3E50]/10 hover:bg-[#2C3E50]/20 font-handwritten text-[#2C3E50] transition-colors disabled:opacity-50"
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