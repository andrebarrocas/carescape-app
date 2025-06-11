'use client';

import React from 'react';
import { MediaUploadWithComments } from '@/app/colors/[id]/types';

interface ProcessImageProps {
  media: MediaUploadWithComments | undefined;
  children: React.ReactNode;
  onImageClick: (media: MediaUploadWithComments) => void;
}

export function ProcessImage({ media, children, onImageClick }: ProcessImageProps) {
  if (!media) return <>{children}</>;

  return (
    <div 
      className="cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => onImageClick(media)}
    >
      {children}
    </div>
  );
} 