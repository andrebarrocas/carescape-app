'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ColorSubmissionForm, { ColorSubmissionForm as ColorSubmissionFormType } from './ColorSubmissionForm';

interface AddColorButtonProps {
  onSubmit: (data: ColorSubmissionFormType) => Promise<void>;
}

export default function AddColorButton({ onSubmit }: AddColorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: ColorSubmissionFormType) => {
    try {
      // Extract media files from the data
      const { mediaFiles, ...colorData } = data;
      
      // First, create the color
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(colorData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit color');
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

      await onSubmit(data);
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting color:', error);
      // Show error message to user
      alert('Failed to submit color. Please try again.');
      throw error;
    }
  };

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="bos-button flex items-center gap-2"
      >
        <Plus className="w-4 h-4 text-[#2C3E50]" strokeWidth={1.2} />
        <span>Add Color</span>
      </button>

      <ColorSubmissionForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
} 