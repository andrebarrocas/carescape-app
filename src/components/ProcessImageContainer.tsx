'use client';

import React from 'react';
import Image from 'next/image';
import { MediaUploadWithComments } from '@/app/colors/[id]/types';

interface ProcessImageContainerProps {
  media: MediaUploadWithComments;
  onImageClick: (media: MediaUploadWithComments) => void;
}

// Utility function to truncate text
function truncateText(text: string) {
  if (!text) return '';
  // For captions, limit to 2-3 words
  const words = text.split(' ').slice(0, 3);
  return words.join(' ');
}

export function ProcessImageContainer({ media, onImageClick }: ProcessImageContainerProps) {
  return (
    <div className="relative">
      <div 
        className="relative w-full aspect-square bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onImageClick(media)}
      >
        <Image
          src={`/api/images/${media.id}`}
          alt={media.caption || 'Process image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized
          loading="eager"
        />
      </div>
      {media.caption && (
        <p className="mt-1 text-xs text-[#2C3E50]/70" title={media.caption}>
          {truncateText(media.caption)}
        </p>
      )}
    </div>
  );
} 