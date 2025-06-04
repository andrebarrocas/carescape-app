'use client';

import { Palette } from 'lucide-react';

interface ColorPlaceholderProps {
  hex: string;
  showSwatch?: boolean;
}

export default function ColorPlaceholder({ hex, showSwatch = true }: ColorPlaceholderProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
      <div className="text-center">
        {showSwatch && (
          <div
            className="w-12 h-12 mx-auto mb-2 rounded-full"
            style={{ backgroundColor: hex }}
          />
        )}
        <div className="flex items-center justify-center gap-2">
          <Palette className="w-5 h-5" />
          <span>No image</span>
        </div>
      </div>
    </div>
  );
} 