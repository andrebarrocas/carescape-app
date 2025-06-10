'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Color, Comment } from '@/types';
import { MapPin, Calendar, Palette, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface ColorComment {
  text: string;
  date: string;
  author?: string;
}

interface ColorMediaUpload {
  id: string;
  url: string;
  type: 'outcome' | 'landscape' | 'process';
  caption?: string;
  comments?: ColorComment[];
}

interface ColorDetails {
  id: string;
  name: string;
  hex: string;
  description: string;
  location: string;
  sourceMaterial: string;
  type: string;
  application?: string;
  season: string;
  dateCollected: string;
  mediaUploads: ColorMediaUpload[];
  landscapeImage: string;
  processImages: ColorMediaUpload[];
}

const exampleImages = [
  {
    url: '/images/art/vintage-colors.jpg',
    caption: 'The rich earth tones remind me of autumn leaves dancing in the wind, each one telling a story of nature\'s artistry.',
    comments: [
      { author: 'Emma', content: 'This shade perfectly captures the warmth of golden hour!' },
      { author: 'Michael', content: 'I love how this color transitions from deep amber to soft bronze.' }
    ]
  },
  {
    url: '/images/art/vintage-pencils.jpg',
    caption: 'These traditional tools have been used for generations, each mark they make carries the wisdom of ancient techniques.',
    comments: [
      { author: 'Sarah', content: 'The texture in this piece is absolutely mesmerizing.' },
      { author: 'David', content: 'Such a beautiful representation of traditional craftsmanship.' }
    ]
  },
  {
    url: '/images/art/vintage-palette.jpg',
    caption: 'A palette that tells stories of countless paintings, each color mixed with passion and purpose.',
    comments: [
      { author: 'Lisa', content: 'The way these colors blend together is pure magic!' },
      { author: 'James', content: 'This reminds me of my grandmother\'s art studio.' }
    ]
  }
];

export default function ColorDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [color, setColor] = useState<ColorDetails | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ColorMediaUpload | null>(null);

  useEffect(() => {
    const fetchColor = async () => {
      try {
        // Simulated API call
        const response = await fetch(`/api/colors/${id}`);
        const data = await response.json();
        
        // Transform the data to match our new structure
        const transformedColor = {
          ...data,
          landscapeImage: data.mediaUploads?.find((m: ColorMediaUpload) => m.type === 'landscape')?.url || '',
          processImages: data.mediaUploads?.filter((m: ColorMediaUpload) => m.type === 'process') || []
        };
        
        setColor(transformedColor);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching color:', error);
        setIsLoading(false);
      }
    };

    fetchColor();
  }, [id]);

  const handleAddComment = async (mediaId: string) => {
    // Add your comment handling logic here
    console.log('Adding comment for media:', mediaId);
  };

  const handleImageClick = (image: ColorMediaUpload) => {
    setSelectedImage(image);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImage) {
      // Handle comment submission
      console.log('Adding comment:', newComment);
      setNewComment('');
      setSelectedImage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!color) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-2xl text-gray-800">Color not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Color Header */}
          <div className="mb-12">
            <h1 className="font-serif text-4xl text-[#2C3E50] mb-4">{color.name}</h1>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full" style={{ backgroundColor: color.hex }} />
              <p className="font-mono text-lg text-[#2C3E50]">{color.hex}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              {/* About Section */}
              <section className="space-y-4">
                <h2 className="font-serif text-2xl text-[#2C3E50]">About</h2>
                <p className="font-mono text-[#2C3E50] leading-relaxed">{color.description}</p>
              </section>

              {/* Origin Section */}
              <section className="space-y-4">
                <h2 className="font-serif text-2xl text-[#2C3E50]">Origin</h2>
                {color.landscapeImage && (
                  <div className="aspect-square relative border-2 border-[#2C3E50]">
                    <Image
                      src={color.landscapeImage}
                      alt={`Landscape where ${color.name} was found`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <p className="font-mono text-[#2C3E50]">{color.location}</p>
                  <p className="font-mono text-sm text-[#2C3E50]">
                    Collected on {new Date(color.dateCollected).toLocaleDateString()}
                  </p>
                </div>
              </section>

              {/* Process Section */}
              <section className="space-y-4">
                <h2 className="font-serif text-2xl text-[#2C3E50]">Process</h2>
                <div className="space-y-2">
                  <p className="font-mono text-[#2C3E50]">Source: {color.sourceMaterial}</p>
                  <p className="font-mono text-[#2C3E50]">Type: {color.type}</p>
                  {color.application && (
                    <p className="font-mono text-[#2C3E50]">Application: {color.application}</p>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column - Process Images Gallery */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                {color.processImages && color.processImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    style={{
                      transform: `rotate(${Math.random() * 20 - 10}deg)`,
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <div className="aspect-square relative border-2 border-[#2C3E50] bg-white shadow-lg">
                      <Image
                        src={image.url}
                        alt={image.caption || `Process image ${index + 1}`}
                        fill
                        className="object-cover p-2"
                      />
                    </div>
                    {image.caption && (
                      <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-full p-3 bg-black/50 backdrop-blur-sm">
                          <p className="font-mono text-sm text-white">{image.caption}</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => handleImageClick(image)}
                      className="absolute inset-0 w-full h-full opacity-0"
                      aria-label={`View details for ${image.caption || 'process image'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="aspect-square relative border-2 border-[#2C3E50]">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.caption || 'Process image'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-xl text-[#2C3E50]">{selectedImage.caption}</h3>
                <div className="space-y-4">
                  {selectedImage.comments?.map((comment, index) => (
                    <div key={index} className="border-2 border-[#2C3E50] p-4">
                      <p className="font-mono text-sm text-[#2C3E50]">{comment.text}</p>
                      <p className="font-mono text-xs text-[#2C3E50] mt-2">
                        {new Date(comment.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 border-2 border-[#2C3E50] font-mono text-sm resize-none focus:outline-none"
                    rows={3}
                  />
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="px-4 py-2 font-mono text-sm text-[#2C3E50] hover:bg-gray-100"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#2C3E50] text-white font-mono text-sm hover:bg-opacity-90"
                    >
                      Add Comment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 