'use client';

import Image from 'next/image';
import { MediaUploadWithComments } from '@/app/colors/[id]/types';

interface ImageGalleryProps {
  media: MediaUploadWithComments;
  onCommentsClick: () => void;
}

// Utility function to truncate text
function truncateText(text: string, maxLength: number) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

export function ImageGallery({ media, onCommentsClick }: ImageGalleryProps) {
  return (
    <div className="relative group cursor-pointer" onClick={onCommentsClick}>
      <div className="relative aspect-square">
        <Image
          src={`/api/images/${media.id}`}
          alt={media.caption || 'Image'}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white text-sm bg-black/50 px-3 py-1.5 rounded-full">
            {media.comments.length} {media.comments.length === 1 ? 'comment' : 'comments'}
          </div>
        </div>
      </div>
      
      {/* Caption */}
      {media.caption && (
        <p className="mt-2 text-sm text-[#2C3E50]/80" title={media.caption}>
          {truncateText(media.caption, 80)}
        </p>
      )}
    </div>
  );
} 