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
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  location: z.string().min(1, 'Location is required'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  sourceMaterial: z.string().min(1, 'Source material is required'),
  type: z.enum(['pigment', 'dye', 'ink']),
  application: z.string().optional(),
  process: z.string().min(1, 'Process description is required').max(5000, 'Process description must be less than 5000 characters'),
  season: z.string().min(1, 'Season is required'),
  dateCollected: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, "Please enter a valid date"),
  authorName: z.string().optional(),
  email: z.string().email('Valid email is required'),
  agreeToTerms: z.boolean().optional(),
  hex: z.string().min(1, 'Hex color is required'),
  mediaUploads: z.array(z.any()).optional(),
});

export type ColorSubmissionForm = z.infer<typeof colorSubmissionSchema> & {
  mediaFiles?: MediaFile[];
};
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
    reset,
  } = useForm<ColorSubmissionForm>({
    resolver: zodResolver(colorSubmissionSchema),
    defaultValues: {
      type: 'pigment',
      season: 'Spring',
    }
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
      setMediaFiles([]);
      setSelectedLocation(null);
      setMapCenter([40, -74.5]);
      setMapZoom(3);
    }
  }, [isOpen, reset]);

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
    console.log('File upload triggered for type:', type);
    console.log('Files selected:', files?.length);
    
    if (!files) return;

    // Handle multiple files for process type
    if (type === 'process') {
      console.log('Processing multiple files for process type');
      
      // Check if we're adding too many files
      const currentProcessFiles = mediaFiles.filter(m => m.type === 'process').length;
      const newFilesCount = files.length;
      const totalFiles = currentProcessFiles + newFilesCount;
      
      console.log('Current process files:', currentProcessFiles);
      console.log('New files to add:', newFilesCount);
      console.log('Total files after addition:', totalFiles);
      
      if (totalFiles > 20) {
        alert('You can only upload up to 20 media photos. Please remove some files first.');
        return;
      }
      
      Array.from(files).forEach(async (file, index) => {
        console.log(`Processing file ${index + 1}:`, file.name, file.size);
        
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Please use files smaller than 10MB.`);
          return;
        }
        
        const preview = URL.createObjectURL(file);
        const newMedia: MediaFile = {
          file,
          type,
          preview,
          caption: '',
        };
        setMediaFiles(prev => {
          const newFiles = [...prev, newMedia];
          console.log('Updated media files count:', newFiles.length);
          return newFiles;
        });
      });
    } else {
      // For outcome and landscape, only handle one file
      const file = files[0];
      console.log('Processing single file:', file.name, file.size);
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Please use files smaller than 10MB.`);
        return;
      }
      
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
    console.log('Form submission started with data:', data);
    console.log('Media files count:', mediaFiles.length);
    console.log('Form errors:', errors);
    console.log('Form is valid:', Object.keys(errors).length === 0);
    
    // Check if form has validation errors
    if (Object.keys(errors).length > 0) {
      console.error('Form has validation errors:', errors);
      alert('Please fix the form errors before submitting.');
      return;
    }
    
    // Check if all required fields are present
    const requiredFields = ['name', 'description', 'location', 'sourceMaterial', 'process', 'season', 'dateCollected', 'email', 'hex'];
    const missingFields = requiredFields.filter(field => !data[field as keyof ColorSubmissionForm]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Check if coordinates are set
    if (!data.coordinates || (data.coordinates.lat === 0 && data.coordinates.lng === 0)) {
      console.warn('No coordinates selected, using default');
    }
    
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

      // Format the date properly
      const formattedDate = new Date(data.dateCollected).toISOString();
      
      // Prepare the color data with media files
      const colorData = {
        ...data,
        dateCollected: formattedDate,
        mediaFiles: mediaFiles, // Include media files for parent to handle
      };

      console.log('Prepared color data:', colorData);

      // Call the parent's onSubmit handler
      await onSubmit(colorData);
      
      // Reset form state
      reset();
      setMediaFiles([]);
      setSelectedLocation(null);
      setMapCenter([40, -74.5]);
      setMapZoom(3);
      
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
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg overflow-y-auto border-2 border-black z-[110]">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-[#2C3E50]" style={{ fontFamily: '"Futura Magazine", monospace' }}>
              Add New Color
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-1.5 hover:bg-black/5">
                <X className="h-5 w-5 text-[#2C3E50]" />
              </button>
            </Dialog.Close>
          </div>
          <form 
            onSubmit={handleSubmit(handleFormSubmit)} 
            className="space-y-8"
            onChange={() => console.log('Form changed, errors:', errors)}
          >
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
                  placeholder="Describe the color and its significance (up to 1000 characters)"
                  rows={4}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <p className="text-red-500 text-xs">{errors.description.message}</p>
                  )}
                  <p className="text-xs text-gray-500 font-mono ml-auto">
                    {watch('description')?.length || 0}/1000 characters
                  </p>
                </div>
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
                    className="absolute z-50 w-full mt-1 bg-white border-2 border-[#2C3E50] max-h-60 overflow-auto shadow-lg"
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
                  className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none min-h-[150px] resize-y"
                  placeholder="Describe the process used to create this color (up to 5000 characters)"
                  rows={6}
                  maxLength={5000}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.process && (
                    <p className="text-red-500 text-xs">{errors.process.message}</p>
                  )}
                  <p className="text-xs text-gray-500 font-mono ml-auto">
                    {watch('process')?.length || 0}/5000 characters
                  </p>
                </div>
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
                  <label className="block font-mono text-sm text-[#2C3E50]">Name (optional)</label>
                  <input
                    {...register('authorName')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                    placeholder="Enter your name"
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
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="mediaUploads" className="text-lg">Add Media Photos</label>
                    <button
                      type="button"
                      onClick={() => document.getElementById('mediaUploads')?.click()}
                      className="bos-button text-lg px-6 py-2 flex items-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Add Media Photos
                    </button>
                    <input
                      type="file"
                      id="mediaUploads"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'process')}
                    />
                  </div>
                </div>

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

            {/* Submit button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="bos-button text-lg px-6 py-2"
                onClick={() => {
                  console.log('Submit button clicked');
                  console.log('Submitting state:', submitting);
                  console.log('Media files count:', mediaFiles.length);
                }}
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