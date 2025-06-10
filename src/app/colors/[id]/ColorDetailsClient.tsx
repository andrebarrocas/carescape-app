'use client';

import { useState } from 'react';
import { CommentsModal } from '@/components/CommentsModal';
import type { MediaUploadWithComments } from './types';

interface ColorDetailsClientProps {
  children: React.ReactNode;
  mediaUploads: MediaUploadWithComments[];
}

export function ColorDetailsClient({ children, mediaUploads }: ColorDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState<MediaUploadWithComments | null>(null);

  const handleAddComment = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/colors/${mediaId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'New comment',
          mediaId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Refresh the page to show the new comment
      window.location.reload();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <>
      {children}
      
      {selectedImage && (
        <CommentsModal
          media={{
            ...selectedImage,
            url: `/api/images/${selectedImage.id}`
          }}
          onClose={() => setSelectedImage(null)}
          onAddComment={handleAddComment}
        />
      )}
    </>
  );
} 