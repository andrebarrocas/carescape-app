'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ColorSubmissionForm from './ColorSubmissionForm';
import { useRouter } from 'next/navigation';

export default function AddColorButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      // First, upload all media files
      const mediaUploads = await Promise.all(
        data.mediaUploads?.map(async (media: any) => {
          const formData = new FormData();
          formData.append('file', media.file);
          formData.append('type', media.type);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          const { url } = await response.json();
          return {
            type: media.type,
            url,
            caption: media.caption,
          };
        }) || []
      );

      // Then submit the color data with media URLs
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          mediaUploads,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit color');
      }

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('Error submitting color:', error);
      throw error;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full p-6 shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-200 z-50 flex items-center gap-2 group"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
        <span className="text-lg font-semibold">Add New Color</span>
      </button>

      <ColorSubmissionForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
} 