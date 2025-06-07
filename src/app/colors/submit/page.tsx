'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ColorSubmissionForm from '@/components/ColorSubmissionForm';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function SubmitColorPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

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
          
          if (!response.ok) {
            throw new Error('Failed to upload media');
          }
          
          const { url } = await response.json();
          return {
            file: media.file,
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

      // Show success message
      toast({
        title: 'Success!',
        description: 'Your color has been submitted successfully.',
        variant: 'default',
      });

      // Redirect to colors page
      router.push('/colors');
      router.refresh();
    } catch (error) {
      console.error('Error submitting color:', error);
      // Show error message
      toast({
        title: 'Error',
        description: 'Failed to submit color. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    router.push('/colors');
  };

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Submit a New Color</h1>
        <div className="max-w-2xl mx-auto">
          <ColorSubmissionForm
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
      <Toaster />
    </>
  );
} 