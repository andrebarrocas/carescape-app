'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: File) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageCropper({ imageSrc, onCrop, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCrop = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // The crop area is a square of size cropSize (in px) in the container
    const cropSize = Math.min(container.offsetWidth, container.offsetHeight);

    // Calculate the aspect ratios
    const imageAspect = naturalWidth / naturalHeight;
    const containerAspect = container.offsetWidth / container.offsetHeight;

    // Calculate the actual rendered image size in the container (objectFit: 'contain')
    let renderedWidth, renderedHeight;
    if (imageAspect > containerAspect) {
      renderedWidth = container.offsetWidth * scale;
      renderedHeight = renderedWidth / imageAspect;
    } else {
      renderedHeight = container.offsetHeight * scale;
      renderedWidth = renderedHeight * imageAspect;
    }

    // Calculate the top-left of the rendered image in the container
    const imageLeft = (container.offsetWidth - renderedWidth) / 2 + position.x;
    const imageTop = (container.offsetHeight - renderedHeight) / 2 + position.y;

    // Calculate the top-left of the crop area in container coordinates
    const cropLeft = (container.offsetWidth - cropSize) / 2;
    const cropTop = (container.offsetHeight - cropSize) / 2;

    // The crop area in image coordinates
    const sx = ((cropLeft - imageLeft) / renderedWidth) * naturalWidth;
    const sy = ((cropTop - imageTop) / renderedHeight) * naturalHeight;
    const sWidth = (cropSize / renderedWidth) * naturalWidth;
    const sHeight = (cropSize / renderedHeight) * naturalHeight;

    // Clamp to image bounds
    const sxClamped = Math.max(0, Math.min(naturalWidth - sWidth, sx));
    const syClamped = Math.max(0, Math.min(naturalHeight - sHeight, sy));

    // Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      img,
      sxClamped,
      syClamped,
      sWidth,
      sHeight,
      0,
      0,
      cropSize,
      cropSize
    );
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        onCrop(file);
      }
    }, 'image/jpeg', 0.9);
  };

  // Add event listeners for mouse movement
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-lg max-w-full w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-[#2C3E50]">Crop & Adjust Image</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 p-4 border-b">
          <button
            onClick={handleZoomOut}
            className="flex items-center gap-2 px-3 py-2 border border-[#2C3E50] rounded hover:bg-gray-50"
          >
            <ZoomOut className="w-4 h-4" />
            Zoom Out
          </button>
          <button
            onClick={handleZoomIn}
            className="flex items-center gap-2 px-3 py-2 border border-[#2C3E50] rounded hover:bg-gray-50"
          >
            <ZoomIn className="w-4 h-4" />
            Zoom In
          </button>
          <button
            onClick={handleRotate}
            className="flex items-center gap-2 px-3 py-2 border border-[#2C3E50] rounded hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Rotate
          </button>
          <div className="text-sm text-gray-600">
            Scale: {scale.toFixed(1)}x
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <div
            ref={containerRef}
            className="relative border-2 border-dashed border-[#2C3E50] bg-gray-100"
            style={{
              width: '100%',
              maxWidth: 'min(80vw,400px)',
              height: 'auto',
              maxHeight: 'min(60vh,400px)',
              aspectRatio: aspectRatio,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {imageSrc && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                className="absolute cursor-move select-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                onMouseDown={handleMouseDown}
                draggable={false}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-4 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="px-6 py-2 bg-[#2C3E50] text-white rounded hover:bg-[#34495E]"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
} 