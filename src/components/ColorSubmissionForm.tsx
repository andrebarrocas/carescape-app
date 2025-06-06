'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as Dialog from '@radix-ui/react-dialog';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { Upload, X, Camera } from 'lucide-react';

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
  email: z.string().email('Invalid email address'),
  agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
  mediaUploads: z.array(z.object({
    file: z.instanceof(File),
    type: z.enum(['outcome', 'landscape', 'process']),
    caption: z.string().optional(),
  })).optional(),
});

type ColorSubmissionForm = z.infer<typeof colorSubmissionSchema>;

interface ColorSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ColorSubmissionForm) => Promise<void>;
}

export default function ColorSubmissionForm({ isOpen, onClose, onSubmit }: ColorSubmissionFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [mediaFiles, setMediaFiles] = useState<{ file: File; type: string; preview: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ColorSubmissionForm>({
    resolver: zodResolver(colorSubmissionSchema),
  });

  const handleMapClick = useCallback((coords: { lat: number; lng: number }) => {
    setSelectedLocation([coords.lat, coords.lng]);
    setValue('coordinates', coords);
  }, [setValue]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaFiles(prev => [...prev, {
          file,
          type,
          preview: reader.result as string,
        }]);

        // If this is a color outcome photo, try to extract the dominant color
        if (type === 'outcome') {
          // TODO: Implement color extraction
          setValue('hex', '#FF0000'); // Placeholder
        }
      };
      reader.readAsDataURL(file);
    }
  }, [setValue]);

  const handleFormSubmit = async (data: ColorSubmissionForm) => {
    try {
      setSubmitting(true);
      await onSubmit({
        ...data,
        mediaUploads: mediaFiles.map(({ file, type }) => ({
          file,
          type: type as 'outcome' | 'landscape' | 'process',
        })),
      });
      onClose();
    } catch (error) {
      console.error('Error submitting color:', error);
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
                    <img src={file.preview} alt="Color outcome" className="w-full h-40 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => setMediaFiles(prev => prev.filter((_, idx) => idx !== i))}
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
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  {...register('location')}
                  className="w-full border rounded-md p-2"
                  placeholder="Enter location name"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Pin on Map</label>
                <div className="h-60 rounded-md overflow-hidden border">
                  <PigeonMap
                    defaultCenter={[40, -74.5]}
                    defaultZoom={9}
                    onClick={({ latLng }) => handleMapClick({ lat: latLng[0], lng: latLng[1] })}
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
                  <option value="">Select type...</option>
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
                  <input
                    {...register('season')}
                    className="w-full border rounded-md p-2"
                    placeholder="Which season?"
                  />
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
              <h2 className="text-lg font-semibold">5. Media Uploads</h2>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Photos of process and materials, final results, foraging and landscape, drawings,
                  other related inspiring material (optional)
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
                <label className="block text-sm font-medium mb-1">Email</label>
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