'use client';

import React from 'react';
import { MediaUploadWithComments } from '@/app/colors/[id]/types';

interface ClickableImageProps {
  media: MediaUploadWithComments;
  onImageClick: (media: MediaUploadWithComments) => void;
  children: React.ReactNode;
}

export function ClickableImage({ media, onImageClick, children }: ClickableImageProps) {
  return (
    <div 
      className="relative w-full aspect-square bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => onImageClick(media)}
    >
      {children}
    </div>
  );
} 