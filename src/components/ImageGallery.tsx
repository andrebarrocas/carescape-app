'use client';

import Image from 'next/image';
import { MediaUploadWithComments } from '@/app/colors/[id]/types';
import { useState } from 'react';

interface ImageGalleryProps {
  media: MediaUploadWithComments;
  onCommentsClick: () => void;
  priority?: boolean;
}

// Utility function to truncate text
function truncateText(text: string, maxLength: number) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

export function ImageGallery({ media, onCommentsClick, priority = false }: ImageGalleryProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Memoize the comment count to prevent unnecessary re-renders
  const commentCount = media.comments.length;

  return (
    <div className="relative group cursor-pointer" onClick={onCommentsClick}>
      <div className="relative aspect-square bg-gray-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#2C3E50] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-gray-500 text-sm">Image unavailable</div>
          </div>
        ) : (
          <Image
            src={`/api/images/${media.id}`}
            alt={media.caption || 'Image'}
            fill
            className={`object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-[1.02] transition-transform duration-200`}
            loading={priority ? "eager" : "lazy"}
            sizes={priority ? "(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            priority={priority}
            quality={85}
          />
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white text-sm bg-black/50 px-3 py-1.5 rounded-full">
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </div>
        </div>
      </div>
      
      {/* Caption */}
      {media.caption && (
        <p className="mt-2 text-sm text-[#2C3E50]/80" title={media.caption}>
          {truncateText(media.caption, 40)}
        </p>
      )}
    </div>
  );
} 