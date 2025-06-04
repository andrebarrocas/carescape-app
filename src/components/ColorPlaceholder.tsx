'use client';

import { Palette } from 'lucide-react';

interface ColorPlaceholderProps {
  hex: string;
  name?: string;
  showName?: boolean;
}

export default function ColorPlaceholder({ hex, name, showName = true }: ColorPlaceholderProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center">
      <div className="text-center p-4">
        <div
          className="w-24 h-24 mx-auto mb-2 rounded-full shadow-inner flex items-center justify-center"
          style={{ backgroundColor: hex }}
        >
          <Palette className="w-8 h-8 text-white opacity-50" />
        </div>
        {showName && name && (
          <p className="text-sm text-gray-600 px-4 truncate">{name}</p>
        )}
      </div>
    </div>
  );
} 