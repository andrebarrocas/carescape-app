'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import EditColorForm from '@/components/EditColorForm';
import { ImageGalleryWrapper } from '@/components/ImageGalleryWrapper';
import { ExtendedColor, MediaUploadWithComments } from '@/app/colors/[id]/types';
import { Pencil, Palette, X, Plus, Leaf } from 'lucide-react';
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import PigmentAnalysis from '@/components/PigmentAnalysis';
import SustainableDesignButton from './SustainableDesignButton';
import { format } from 'date-fns';
import Image from 'next/image';
import SustainabilityAnalysis from '@/components/SustainabilityAnalysis';

interface ColorDetailsClientProps {
  children?: React.ReactNode;
  color: ExtendedColor;
  mediaUploads: MediaUploadWithComments[];
  session?: any;
}



export function ColorDetailsClient({ children, color, mediaUploads: initialMediaUploads, session }: ColorDetailsClientProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPigmentModalOpen, setPigmentModalOpen] = useState(false);
  const [isSustainabilityModalOpen, setSustainabilityModalOpen] = useState(false);
  const [isAddMediaOpen, setAddMediaOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaUploads, setMediaUploads] = useState(initialMediaUploads);

  // Memoize filtered media uploads to avoid recalculation
  const mainImage = useMemo(() => {
    return mediaUploads.find(media => media.type === 'landscape');
  }, [mediaUploads]);

  const processImages = useMemo(() => {
    return mediaUploads.filter(media => media.type === 'process');
  }, [mediaUploads]);

  const handleAddComment = async (mediaId: string, content: string) => {
    try {
      const response = await fetch(`/api/colors/${color.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mediaId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Refresh the page to show the new comment
      router.refresh();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleEditSubmit = async (data: {
    name: string;
    description: string;
    location: string;
    season: string;
    sourceMaterial: string;
    type: 'pigment' | 'dye' | 'ink';
    application?: string;
    process: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/colors/${color.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          location: data.location,
          season: data.season,
          material: {
            name: data.sourceMaterial,
            partUsed: data.application || 'Not specified',
            originNote: data.process
          },
          process: {
            technique: data.type,
            application: data.application || 'Not specified',
            notes: data.process
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update color');
      }

      router.refresh();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating color:', error);
      alert('Failed to update color. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setMediaFiles(files);
    setCaptions(files.map(() => ''));
  };

  const handleCaptionChange = (idx: number, value: string) => {
    setCaptions(captions => captions.map((c, i) => (i === idx ? value : c)));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData();
      mediaFiles.forEach((file, idx) => {
        formData.append('media', file);
        formData.append('captions', captions[idx] || '');
      });
      const res = await fetch(`/api/colors/${color.id}/images`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const { uploads } = await res.json();
        setMediaUploads(prev => [...uploads, ...prev]);
        setAddMediaOpen(false);
        setMediaFiles([]);
        setCaptions([]);
      }
    } finally {
      setIsUploading(false);
    }
  };



  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column - Color Information */}
        <div className="relative">
          {/* Title */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-6xl text-[#2C3E50] mb-3 leading-tight">
                  {color.name}
                </h1>
                {/* Color Swatch and Hex moved here */}
                <div className="flex items-center gap-4 mb-3">
                  <div 
                    className="w-16 h-16 rounded-full shadow-lg"
                    style={{ backgroundColor: color.hex }}
                  />
                </div>
                <p className="text-base text-[#2C3E50]/80 italic">
                  by {color.user?.name || color.user?.pseudonym || 'Anonymous'}
                </p>
                <p className="text-base text-[#2C3E50]/60">
                  {color.dateCollected ? format(new Date(color.dateCollected), 'MMMM d, yyyy') : ''}
                  {color.season ? `, ${color.season}` : ''}
                </p>
                
                {/* Materials Section - Bioregional Connection */}
                <div className="mt-6 mb-4">
                  <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
                    Materials to make the color:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {color.materials.map((material, index) => (
                      <div
                        key={material.id}
                        className="bg-[#2C3E50]/10 border border-[#2C3E50]/20 rounded-full px-4 py-2 text-sm font-medium text-[#2C3E50]"
                      >
                        {material.name}
                        {material.partUsed && (
                          <span className="text-[#2C3E50]/70 ml-1">
                            ({material.partUsed})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {color.materials[0]?.originNote && (
                    <p className="text-sm text-[#2C3E50]/70 mt-2 italic">
                      {color.materials[0].originNote}
                    </p>
                  )}
                </div>
                
                <div className="mt-4">
                  
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  aria-label="Edit Color"
                  className="p-1 rounded-full hover:bg-[#f3f3f3] focus:outline-none transition-colors"
                  style={{ border: 'none', background: 'none', boxShadow: 'none', color: '#2C3E50' }}
                >
                  <Pencil className="w-7 h-7" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {/* Main Landscape Image */}
          {mainImage && (
            <div className="mb-8">
              <div className="relative w-full aspect-[4/3] bg-white overflow-hidden">
                <ImageGalleryWrapper
                  media={{
                    ...mainImage,
                    colorId: color.id,
                    id: mainImage.id,
                    filename: mainImage.filename,
                    mimetype: mainImage.mimetype,
                    comments: mainImage.comments,
                    createdAt: mainImage.createdAt,
                    type: mainImage.type,
                    caption: mainImage.caption
                  }}
                />
              </div>
              {mainImage.caption && (
                <p className="mt-2 text-base text-[#2C3E50]/80">
                  {mainImage.caption}
                </p>
              )}
            </div>
          )}

          {/* Personal Description */}
          <div className="mb-10">

            <p className="mt-2 text-base text-[#2C3E50]/80">
              "{color.description}"
            </p>
          </div>

          {/* Landscape Details */}
          <div className="mb-10">
            <h2 className="text-2xl text-[#2C3E50] mb-4 pb-2">
              Landscape Details
            </h2>
            <div className="space-y-4 text-black font-sans text-base">
              <p>- Specific Location: {color.location}</p>
              {color.coordinates && (
                <div className="pl-4">
                  {/* MapComponent can be added here if needed */}
                </div>
              )}
              {color.bioregion?.description && (
                <p>- Bioregion: {color.bioregion.description}</p>
              )}
              <p>- Particular element used: {color.materials[0]?.partUsed}</p>
            </div>
          </div>

          {/* Color Data */}
          <div>
            <h2 className="text-2xl text-[#2C3E50] mb-4 pb-2">
              Color Data
            </h2>
            <div className="space-y-4 text-black font-sans text-base">
              <p>- Type: {color.type ? color.type.charAt(0).toUpperCase() + color.type.slice(1) : 'Not specified'}</p>
              {color.processes.map(process => (
                <div key={process.id}>
                  <p>- Application: {process.application}</p>
                  <p>- Process: {process.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Process Images */}
        <div className="space-y-6">
          {/* Process Images */}
          {processImages.length > 0 && (
            <div className="grid grid-cols-2 gap-6">
              {processImages.map(media => (
                <div key={media.id} className="relative">
                  <ImageGalleryWrapper
                    media={{
                      ...media,
                      colorId: color.id,
                      comments: media.comments ?? [],
                      caption: media.caption ?? ''
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditColorForm
          color={color}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Sustainability Analysis Modal */}
      <Dialog.Root open={isSustainabilityModalOpen} onOpenChange={setSustainabilityModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-[800px] max-w-full z-50 bg-white shadow-2xl rounded-2xl flex flex-col p-8 overflow-y-auto border-2 border-[#2C3E50]"
        style={{ fontFamily: 'Caveat, cursive', maxHeight: '90vh' }}
      >
  <Dialog.Title className="sr-only">Sustainability Analysis</Dialog.Title>
            <button className="absolute top-4 right-4 text-[#2C3E50] hover:text-[#2C3E50]/80" onClick={() => setSustainabilityModalOpen(false)}><X className="w-5 h-5" strokeWidth={1.2} /></button>
            <SustainabilityAnalysis
              color={color.name}
              hex={color.hex}
              location={color.location}
              materials={color.materials.map(m => m.name).join(', ')}
              date={color.dateCollected}
              season={color.season}
              bioregion={color.bioregion?.description || ''}
              colorId={color.id}
              onOpenChat={() => {
                setSustainabilityModalOpen(false);
                setPigmentModalOpen(true);
              }}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Pigment Analysis Modal */}
      <Dialog.Root open={isPigmentModalOpen} onOpenChange={setPigmentModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full md:w-[500px] max-w-full z-50 bg-white shadow-2xl rounded-t-2xl flex flex-col p-8 overflow-y-auto border-t-4 border-black" style={{fontFamily:'Caveat, cursive', maxHeight: '80vh'}}>
            <button className="absolute top-4 right-4 text-[#2C3E50] hover:text-[#2C3E50]/80" onClick={() => setPigmentModalOpen(false)}><X className="w-5 h-5" strokeWidth={1.2} /></button>
            <PigmentAnalysis
              color={color.name}
              hex={color.hex}
              location={color.location}
              materials={color.materials.map(m => m.name).join(', ')}
              date={color.dateCollected}
              season={color.season}
              bioregion={color.bioregion?.description || ''}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Add Media Modal */}
      <Dialog.Root open={isAddMediaOpen} onOpenChange={setAddMediaOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 z-50 flex flex-col gap-6 border-2 border-[#2C3E50]">
            <Dialog.Title className="text-3xl text-[#2C3E50] mb-4">Add Media Photos</Dialog.Title>
            <form onSubmit={handleUpload} className="flex flex-col gap-6">
              <input type="file" accept="image/*" multiple onChange={handleMediaChange} className="mb-4" />
              {mediaFiles.length > 0 && (
                <div className="flex flex-col gap-4">
                  {mediaFiles.map((file, idx) => (
                    <div key={idx} className="flex flex-col gap-2 border-b pb-4">
                      <div className="flex items-center gap-4">
                        <Image src={URL.createObjectURL(file)} alt="preview" width={80} height={80} className="object-cover" />
                        <input
                          type="text"
                          placeholder="Caption for this image"
                          value={captions[idx] || ''}
                          onChange={e => handleCaptionChange(idx, e.target.value)}
                          className="flex-1 border rounded-lg px-3 py-2 font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-center gap-4 mt-4">
                <Dialog.Close asChild>
                  <button type="button" className="bos-button" style={{ fontSize: '1.5rem', padding: '0.75rem 2rem', fontWeight: 700, letterSpacing: '1px' }}>Cancel</button>
                </Dialog.Close>
                <button type="submit" disabled={isUploading || mediaFiles.length === 0} className="bos-button disabled:opacity-50" style={{ fontSize: '1.5rem', padding: '0.75rem 2rem', fontWeight: 700, letterSpacing: '1px' }}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
} 