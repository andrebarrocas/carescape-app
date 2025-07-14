'use client';

import { ImageGallery } from './ImageGallery';
import { MediaUploadWithComments } from '@/app/colors/[id]/types';
import { useState, useMemo } from 'react';
import { CommentsModal } from './CommentsModal';

interface ImageGalleryWrapperProps {
  media: MediaUploadWithComments;
  onCommentAdded?: () => void;
}

export function ImageGalleryWrapper({ media, onCommentAdded }: ImageGalleryWrapperProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const handleAddComment = useMemo(() => async (mediaId: string, content: string, parentId?: string) => {
    try {
      const response = await fetch(`/api/colors/${media.colorId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mediaId,
          parentId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Call the callback instead of refreshing the entire page
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  }, [media.colorId, onCommentAdded]);

  const handleModalClose = () => {
    setIsCommentsOpen(false);
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
          onClose={handleModalClose}
          onAddComment={handleAddComment}
        />
      )}
    </>
  );
} 