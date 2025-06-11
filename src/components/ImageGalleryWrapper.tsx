'use client';

import { ImageGallery } from './ImageGallery';
import { MediaUploadWithComments } from '@/app/colors/[id]/types';
import { useState } from 'react';
import { CommentsModal } from './CommentsModal';
import { useRouter } from 'next/navigation';

interface ImageGalleryWrapperProps {
  media: MediaUploadWithComments;
}

export function ImageGalleryWrapper({ media }: ImageGalleryWrapperProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const router = useRouter();

  const handleAddComment = async (mediaId: string, content: string) => {
    try {
      const response = await fetch(`/api/colors/${media.colorId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mediaId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Refresh the page to show the new comment
      router.refresh();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  return (
    <>
      <ImageGallery
        media={media}
        onCommentsClick={() => setIsCommentsOpen(true)}
      />
      {isCommentsOpen && (
        <CommentsModal
          media={media}
          onClose={() => setIsCommentsOpen(false)}
          onAddComment={handleAddComment}
        />
      )}
    </>
  );
} 