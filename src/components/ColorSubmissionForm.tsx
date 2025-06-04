'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Map, Marker } from 'pigeon-maps';
import { ColorType } from '@/types/colors';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/types/supabase';

interface ColorSubmissionFormProps {
  onSuccess?: () => void;
}

const colorSubmissionSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
  photo: z.instanceof(File).optional(),
  hexCode: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex code'),
  origin: z.object({
    name: z.string().min(1, 'Location name is required'),
    coordinates: z.tuple([z.number(), z.number()]),
    photo: z.instanceof(File).optional(),
  }),
  process: z.object({
    sourceMaterial: z.string().min(1, 'Source material is required'),
    type: z.enum(['pigment', 'dye', 'ink']),
    application: z.string().optional(),
    recipe: z.string().min(1, 'Process/Recipe is required'),
    season: z.string().min(1, 'Season is required'),
  }),
  mediaUploads: z.array(z.instanceof(File)).optional(),
  submittedBy: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email address'),
  }),
  termsAgreed: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
});

type ColorSubmissionForm = z.infer<typeof colorSubmissionSchema>;

export default function ColorSubmissionForm({ onSuccess }: ColorSubmissionFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [colorPhoto, setColorPhoto] = useState<string | null>(null);
  const [locationPhoto, setLocationPhoto] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ColorSubmissionForm>({
    resolver: zodResolver(colorSubmissionSchema),
  });

  const onSubmit = async (data: ColorSubmissionForm) => {
    try {
      setIsSubmitting(true);

      // Upload color photo
      let colorPhotoUrl = '';
      if (data.photo) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('colors')
          .upload(`colors/${Date.now()}-${data.photo.name}`, data.photo);

        if (uploadError) throw uploadError;
        colorPhotoUrl = uploadData.path;
      }

      // Upload location photo
      let locationPhotoUrl = '';
      if (data.origin.photo) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('colors')
          .upload(`locations/${Date.now()}-${data.origin.photo.name}`, data.origin.photo);

        if (uploadError) throw uploadError;
        locationPhotoUrl = uploadData.path;
      }

      // Upload media files
      const mediaUrls: string[] = [];
      if (data.mediaUploads?.length) {
        for (const file of data.mediaUploads) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('colors')
            .upload(`media/${Date.now()}-${file.name}`, file);

          if (uploadError) throw uploadError;
          mediaUrls.push(uploadData.path);
        }
      }

      // Insert color data into database
      const { error: insertError } = await supabase
        .from('colors')
        .insert({
          name: data.name,
          hex_code: data.hexCode,
          photo_url: colorPhotoUrl,
          origin: {
            name: data.origin.name,
            coordinates: data.origin.coordinates,
            photo_url: locationPhotoUrl,
          },
          process: {
            source_material: data.process.sourceMaterial,
            type: data.process.type,
            application: data.process.application,
            recipe: data.process.recipe,
            season: data.process.season,
          },
          media_urls: mediaUrls,
          submitted_by: data.submittedBy,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Success!',
        description: 'Your color has been submitted successfully.',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting color:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit color. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleColorPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setColorPhoto(reader.result as string);
        // TODO: Implement color detection to get hex code
        setValue('hexCode', '#000000');
      };
      reader.readAsDataURL(file);
      setValue('photo', file);
    }
  };

  const handleLocationPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocationPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue('origin.photo', file);
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newMediaFiles = files.map(file => URL.createObjectURL(file));
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
    setValue('mediaUploads', files);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Color Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Color Name</label>
        <input
          type="text"
          {...register('name')}
          className="w-full p-2 border rounded"
          placeholder="What would you call this color?"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* Color Outcome */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Color Outcome</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleColorPhotoChange}
          className="w-full"
        />
        {colorPhoto && (
          <img src={colorPhoto} alt="Color preview" className="w-32 h-32 object-cover rounded" />
        )}
        {errors.photo && (
          <p className="text-red-500 text-sm">{errors.photo.message}</p>
        )}
        <input
          type="text"
          {...register('hexCode')}
          className="w-full p-2 border rounded"
          placeholder="Hex code (auto-generated)"
          readOnly
        />
      </div>

      {/* Origins */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Origins</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Location Name</label>
          <input
            type="text"
            {...register('origin.name')}
            className="w-full p-2 border rounded"
            placeholder="Describe landscape, place or environment"
          />
          {errors.origin?.name && (
            <p className="text-red-500 text-sm">{errors.origin.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLocationPhotoChange}
            className="w-full"
          />
          {locationPhoto && (
            <img src={locationPhoto} alt="Location preview" className="w-32 h-32 object-cover rounded" />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Pin Location on Map</label>
          <div className="h-[300px] rounded-lg overflow-hidden border">
            <Map
              defaultCenter={[40, -74.5]}
              defaultZoom={9}
              onClick={({ latLng }) => {
                setSelectedLocation(latLng);
                setValue('origin.coordinates', latLng);
              }}
            >
              {selectedLocation && (
                <Marker width={50} anchor={selectedLocation} />
              )}
            </Map>
          </div>
        </div>
      </div>

      {/* Process */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Process</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Source Material</label>
          <input
            type="text"
            {...register('process.sourceMaterial')}
            className="w-full p-2 border rounded"
          />
          {errors.process?.sourceMaterial && (
            <p className="text-red-500 text-sm">{errors.process.sourceMaterial.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <select
            {...register('process.type')}
            className="w-full p-2 border rounded"
          >
            <option value="pigment">Pigment</option>
            <option value="dye">Dye</option>
            <option value="ink">Ink</option>
          </select>
          {errors.process?.type && (
            <p className="text-red-500 text-sm">{errors.process.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Application (optional)</label>
          <input
            type="text"
            {...register('process.application')}
            className="w-full p-2 border rounded"
            placeholder="In case final result applied to any material"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Process / Recipe</label>
          <textarea
            {...register('process.recipe')}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="How did you gather and prepare your color?"
          />
          {errors.process?.recipe && (
            <p className="text-red-500 text-sm">{errors.process.recipe.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Season</label>
          <input
            type="text"
            {...register('process.season')}
            className="w-full p-2 border rounded"
          />
          {errors.process?.season && (
            <p className="text-red-500 text-sm">{errors.process.season.message}</p>
          )}
        </div>
      </div>

      {/* Media Uploads */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Additional Media (optional)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleMediaUpload}
          className="w-full"
        />
        <div className="grid grid-cols-4 gap-2 mt-2">
          {mediaFiles.map((file, index) => (
            <img
              key={index}
              src={file}
              alt={`Media upload ${index + 1}`}
              className="w-full h-24 object-cover rounded"
            />
          ))}
        </div>
      </div>

      {/* Personal Data */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Data</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Name or Pseudonym (optional)</label>
          <input
            type="text"
            {...register('submittedBy.name')}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            {...register('submittedBy.email')}
            className="w-full p-2 border rounded"
          />
          {errors.submittedBy?.email && (
            <p className="text-red-500 text-sm">{errors.submittedBy.email.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('termsAgreed')}
            id="terms"
            className="rounded"
          />
          <label htmlFor="terms" className="text-sm">
            I agree to the terms and conditions
          </label>
        </div>
        {errors.termsAgreed && (
          <p className="text-red-500 text-sm">{errors.termsAgreed.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Color'}
      </button>
    </form>
  );
} 