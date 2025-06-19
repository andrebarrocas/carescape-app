'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ExtendedColor } from '@/app/colors/[id]/types';

const editColorSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  sourceMaterial: z.string().min(1, 'Source material is required'),
  type: z.enum(['pigment', 'dye', 'ink']),
  application: z.string().optional(),
  process: z.string().min(1, 'Process description is required'),
  season: z.string().min(1, 'Season is required'),
});

type EditColorForm = z.infer<typeof editColorSchema>;

interface EditColorFormProps {
  color: ExtendedColor;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditColorForm) => Promise<void>;
}

export default function EditColorForm({ color, isOpen, onClose, onSubmit }: EditColorFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditColorForm>({
    resolver: zodResolver(editColorSchema),
    defaultValues: {
      name: color.name || '',
      description: color.description || '',
      location: color.location || '',
      sourceMaterial: color.sourceMaterial || '',
      type: color.type || 'pigment',
      application: color.processes?.[0]?.application || '',
      process: color.processes?.[0]?.notes || '',
      season: color.season || 'Spring',
    },
  });

  const handleFormSubmit = async (data: EditColorForm) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error updating color:', error);
      alert('Failed to update color. Please try again.');
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
                Edit Color
              </Dialog.Title>
              <Dialog.Close className="text-[#2C3E50] hover:text-[#2C3E50]/80">
                <X className="w-6 h-6" />
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                  Color Name
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
                  Source Material
                </label>
                <input
                  {...register('sourceMaterial')}
                  className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
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

              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                  Application (optional)
                </label>
                <input
                  {...register('application')}
                  className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                  Process Description
                </label>
                <textarea
                  {...register('process')}
                  className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none min-h-[100px]"
                />
                {errors.process && (
                  <p className="mt-1 text-red-500 text-xs">{errors.process.message}</p>
                )}
              </div>

              <div>
                <label className="block font-mono text-sm text-[#2C3E50] mb-2">
                  Season
                </label>
                <select
                  {...register('season')}
                  className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm bg-transparent focus:outline-none"
                >
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Autumn">Autumn</option>
                  <option value="Winter">Winter</option>
                </select>
                {errors.season && (
                  <p className="mt-1 text-red-500 text-xs">{errors.season.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="bos-button text-lg px-6 py-2 mt-4"
              >
                Update Color
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 