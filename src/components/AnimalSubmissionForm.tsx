'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

const animalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  image: z.string().min(1, 'Image is required'),
  date: z.string().min(1, 'Date is required'),
  scientificName: z.string().min(1, 'Scientific name is required'),
  habitat: z.string().min(1, 'Habitat is required'),
  diet: z.string().min(1, 'Diet is required'),
  behavior: z.string().min(1, 'Behavior is required'),
  conservation: z.string().min(1, 'Conservation status is required')
});

type AnimalForm = z.infer<typeof animalSchema>;

interface AnimalSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AnimalForm) => Promise<void>;
}

export default function AnimalSubmissionForm({ isOpen, onClose, onSubmit }: AnimalSubmissionFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<AnimalForm>({
    resolver: zodResolver(animalSchema)
  });

  const handleFormSubmit = async (data: AnimalForm) => {
    setSubmitting(true);
    try {
      await onSubmit({
        ...data,
        coordinates: coordinates || { lat: 0, lng: 0 }
      });
      reset();
      setImagePreview(null);
      setCoordinates(null);
    } catch (error) {
      console.error('Error submitting animal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await response.json();
      setValue('image', url);
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={() => {}}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg overflow-y-auto border-2 border-black z-[110]">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-[#2C3E50]" style={{ fontFamily: '"Futura Magazine", monospace' }}>
              Add New Animal
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-black/5" onClick={onClose}>
              <X className="h-5 w-5 text-[#2C3E50]" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                    Name
                  </label>
                  <input
                    {...register('name')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  />
                  {errors.name && (
                    <p className="mt-1 text-red-500 text-xs">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                    Scientific Name
                  </label>
                  <input
                    {...register('scientificName')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  />
                  {errors.scientificName && (
                    <p className="mt-1 text-red-500 text-xs">{errors.scientificName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                    Type
                  </label>
                  <input
                    {...register('type')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  />
                  {errors.type && (
                    <p className="mt-1 text-red-500 text-xs">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                    Location
                  </label>
                  <input
                    {...register('location')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  />
                  {errors.location && (
                    <p className="mt-1 text-red-500 text-xs">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                    Date Observed
                  </label>
                  <input
                    type="date"
                    {...register('date')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  />
                  {errors.date && (
                    <p className="mt-1 text-red-500 text-xs">{errors.date.message}</p>
                  )}
                </div>
              </div>

              {/* Detailed Information */}
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none min-h-[100px]"
                  />
                  {errors.description && (
                    <p className="mt-1 text-red-500 text-xs">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                    Habitat
                  </label>
                  <textarea
                    {...register('habitat')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none min-h-[100px]"
                  />
                  {errors.habitat && (
                    <p className="mt-1 text-red-500 text-xs">{errors.habitat.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                    Diet
                  </label>
                  <textarea
                    {...register('diet')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  />
                  {errors.diet && (
                    <p className="mt-1 text-red-500 text-xs">{errors.diet.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                    Behavior
                  </label>
                  <textarea
                    {...register('behavior')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  />
                  {errors.behavior && (
                    <p className="mt-1 text-red-500 text-xs">{errors.behavior.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                    Conservation Status
                  </label>
                  <textarea
                    {...register('conservation')}
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                  />
                  {errors.conservation && (
                    <p className="mt-1 text-red-500 text-xs">{errors.conservation.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                Image
              </label>
              <div className="relative aspect-square w-full max-w-[300px] border-2 border-[#2C3E50] rounded-lg overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-[#2C3E50]" />
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="mt-1 text-red-500 text-xs">{errors.image.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="bos-button text-lg px-6 py-2"
                style={{ fontSize: '1.125rem' }}
              >
                {submitting ? 'Submitting...' : 'Submit Animal'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 