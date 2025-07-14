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
          mediaFiles.forEach((media: unknown) => {
            formData.append('media', (media as any).file);
            formData.append('captions', (media as any).caption || '');
            formData.append('types', (media as any).type);
          });

          const mediaResponse = await fetch(`/api/colors/${color.id}/images`, {
            method: 'POST',
            body: formData,
          });

          console.log('Media upload response status:', mediaResponse.status);

          if (!mediaResponse.ok) {
            const errorText = await mediaResponse.text();
            console.error('Media upload failed:', errorText);
            throw new Error('Failed to upload media files');
          }
          console.log('Media uploaded successfully.');
        } catch (error) {
          console.error('Error uploading media files:', error);
          throw new Error('Failed to upload media files');
        }
      }
      console.log('Color submission process finished.');
    } catch (error) {
      console.error('Error submitting color:', error);
      throw new Error('Failed to submit color');
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        <Plus className="mr-2" /> Add New Color
      </button>

      {isOpen && (
        <ColorSubmissionForm
          isOpen={isOpen}
          onSubmit={handleSubmit}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}