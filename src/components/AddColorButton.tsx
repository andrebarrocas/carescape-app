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
    console.log('AddColorButton handleSubmit called with data:', data);
    console.log('Media files:', data.mediaFiles);
    
    try {
      // Extract media files from the data
      const { mediaFiles, ...colorData } = data;
      
      console.log('Color data to submit:', colorData);
      
      // First, create the color
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(colorData),
      });
      
      console.log('Color creation response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Color creation failed:', errorText);
        throw new Error('Failed to submit color');
      }

      const color = await response.json();
      console.log('Color created successfully:', color);

      // Then, upload media files if any
      if (mediaFiles && mediaFiles.length > 0) {
        console.log('Uploading media files:', mediaFiles.length);
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

          console.log('Media upload response status:', mediaResponse.status);

          if (!mediaResponse.ok) {
            const errorText = await mediaResponse.text();
            console.error('Media upload failed:', errorText);
          } else {
            console.log('Media files uploaded successfully');
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