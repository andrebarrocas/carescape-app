'use client';

import React from 'react';
import Image from 'next/image';
import { MediaUploadWithComments } from '@/app/colors/[id]/types';

interface ProcessImageContainerProps {
  media: MediaUploadWithComments;
  onImageClick: (media: MediaUploadWithComments) => void;
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
        <p className="mt-2 text-sm text-[#2C3E50]/80">
          {media.caption}
        </p>
      )}
    </div>
  );
} 