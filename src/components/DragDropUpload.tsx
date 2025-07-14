'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface DragDropUploadProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function DragDropUpload({
  onFilesSelected,
  multiple = false,
  accept = 'image/*',
  maxFiles = 20,
  className = '',
  children
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please drop image files only.');
      return;
    }

    if (!multiple && imageFiles.length > 1) {
      alert('Please drop only one image file.');
      return;
    }

    if (imageFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files at once.`);
      return;
    }

    // Check file sizes (limit to 10MB each)
    const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Some files are too large. Please use files smaller than 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    onFilesSelected(imageFiles);
  }, [multiple, maxFiles, onFilesSelected]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragOver 
            ? 'border-[#2C3E50] bg-[#2C3E50]/5 scale-105' 
            : 'border-gray-300 hover:border-[#2C3E50] hover:bg-gray-50'
          }
        `}
        onClick={handleClick}
      >
        {children || (
          <>
            <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-[#2C3E50]' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDragOver ? 'text-[#2C3E50]' : 'text-gray-600'}`}>
              {isDragOver ? 'Drop images here' : 'Click to browse or drag images here'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {multiple ? `Up to ${maxFiles} images, max 10MB each` : 'Single image, max 10MB'}
            </p>
          </>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
} 