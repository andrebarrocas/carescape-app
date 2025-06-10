'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface ProcessImage {
  url: string;
  caption: string;
  comments: Comment[];
}

interface ColorImageGalleryProps {
  images: ProcessImage[];
}

export default function ColorImageGallery({ images }: ColorImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ProcessImage | null>(null);

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div
          key={index}
          className="relative h-[120px] cursor-pointer group"
          onClick={() => setSelectedImage(image)}
        >
          <Image
            src={image.url}
            alt={image.caption}
            fill
            className="object-cover rounded-md transition-transform group-hover:scale-105"
          />
        </div>
      ))}

      {/* New Minimal Popup */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden w-[200px]"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute right-1 top-1 z-10 p-0.5 bg-black/10 rounded-full hover:bg-black/20 transition-colors"
              >
                <X className="w-2.5 h-2.5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="p-2.5 space-y-2">
                <p className="text-[10px] text-gray-600 font-serif leading-relaxed border-l-2 border-gray-200 pl-2">
                  {selectedImage.caption}
                </p>

                {/* Comments */}
                <div className="max-h-[70px] overflow-y-auto space-y-2 pr-1">
                  {selectedImage.comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-gray-100 pl-2">
                      <p className="text-[9px] text-gray-500 leading-relaxed">{comment.text}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[7px] text-gray-400 font-medium">{comment.author}</span>
                        <span className="text-[7px] text-gray-300">•</span>
                        <span className="text-[7px] text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 