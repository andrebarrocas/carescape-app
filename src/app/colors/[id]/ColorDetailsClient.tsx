'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditColorForm from '@/components/EditColorForm';
import { ImageGalleryWrapper } from '@/components/ImageGalleryWrapper';
import { ExtendedColor, MediaUploadWithComments } from '@/app/colors/[id]/types';
import { Pencil, Palette, X } from 'lucide-react';
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import PigmentAnalysis from '@/components/PigmentAnalysis';
import SustainableDesignButton from './SustainableDesignButton';
import { format } from 'date-fns';

interface ColorDetailsClientProps {
  children?: React.ReactNode;
  color: ExtendedColor;
  mediaUploads: MediaUploadWithComments[];
  session?: any;
}

interface TitleContainerProps {
  className?: string;
  children: React.ReactNode;
}

interface ImageContainerProps {
  className?: string;
  children: React.ReactNode;
  key: string;
}

export function ColorDetailsClient({ children, color, mediaUploads, session }: ColorDetailsClientProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPigmentModalOpen, setPigmentModalOpen] = useState(false);

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

  const handleEditSubmit = async (data: any) => {
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

  // Find the h1 element in children and wrap it with the edit button
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childElement = child as React.ReactElement<TitleContainerProps | ImageContainerProps>;
      
      // Handle the title container
      if (childElement.props.className?.includes('mb-12')) {
        return React.cloneElement(childElement, { className: childElement.props.className }, (
          <div className="flex items-center justify-between">
            <div className="flex-1">{childElement.props.children}</div>
            <div className="flex gap-2">
              <SustainableDesignButton
                color={color.name}
                hex={color.hex}
                location={color.location}
                materials={color.materials.map(m => m.name).join(', ')}
                date={color.dateCollected}
                season={color.season}
                bioregion={color.bioregion?.description || ''}
              />
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-[#2C3E50] p-2 rounded-lg hover:bg-[#2C3E50]/90 transition-colors group flex items-center gap-2 text-white"
              >
                <Pencil className="w-5 h-5" />
                <span className="text-sm">Edit Color</span>
              </button>
            </div>
          </div>
        ));
      }

      // Handle the process images container
      if (childElement.props.className?.includes('grid-cols-2')) {
        const imageChildren = React.Children.map(childElement.props.children, (imageChild) => {
          if (React.isValidElement(imageChild)) {
            const imageElement = imageChild as React.ReactElement<ImageContainerProps>;
            const media = mediaUploads.find(m => m.id === imageElement.key);
            
            if (media) {
              return React.cloneElement(imageElement, {
                className: imageElement.props.className,
                children: (
                  <ImageGalleryWrapper
                    media={{
                      ...media,
                      colorId: color.id,
                      comments: media.comments ?? [],
                      createdAt: media.createdAt ?? '',
                      type: media.type || 'outcome',
                      caption: media.caption ?? ''
                    }}
                  />
                )
              });
            }
          }
          return imageChild;
        });

        return React.cloneElement(childElement, { className: childElement.props.className }, imageChildren);
      }
    }
    return child;
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column - Color Information */}
        <div className="relative">
          {/* Title */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-handwritten text-6xl text-[#2C3E50] mb-3 leading-tight">
                  {color.name}
                </h1>
                <p className="font-handwritten text-xl text-[#2C3E50]/80 italic">
                  by {session?.user?.name || 'Anonymous'}
                </p>
                <p className="font-handwritten text-lg text-[#2C3E50]/60">
                  {color.dateCollected ? format(new Date(color.dateCollected), 'MMMM d, yyyy') : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <SustainableDesignButton
                  color={color.name}
                  hex={color.hex}
                  location={color.location}
                  materials={color.materials.map(m => m.name).join(', ')}
                  date={color.dateCollected}
                  season={color.season}
                  bioregion={color.bioregion?.description || ''}
                />
                
              </div>
            </div>
          </div>

          {/* Main Landscape Image */}
          {mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome') && (
            <div className="mb-8">
              <div className="relative w-full aspect-[4/3] bg-white rounded-lg overflow-hidden">
                <ImageGalleryWrapper
                  media={{
                    ...mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome'),
                    colorId: color.id,
                    id: mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome')?.id ?? '',
                    filename: mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome')?.filename ?? '',
                    mimetype: mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome')?.mimetype ?? '',
                    comments: mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome')?.comments ?? [],
                    createdAt: mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome')?.createdAt || '',
                    type: mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome')?.type || 'outcome',
                    caption: mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome')?.caption ?? ''
                  }}
                />
              </div>
              {mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome')?.caption && (
                <p className="mt-2 font-handwritten text-base text-[#2C3E50]/80">
                  {mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome')?.caption}
                </p>
              )}
            </div>
          )}

          {/* Color Swatch and Hex */}
          <div className="flex items-start gap-4 mb-8">
            <div 
              className="w-16 h-16 rounded-lg shadow-lg"
              style={{ backgroundColor: color.hex }}
            />
            <p className="font-mono text-base text-[#2C3E50]">
              HEX: {color.hex}
            </p>
          </div>

          {/* Personal Description */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full border-2 border-[#2C3E50] flex items-center justify-center">
                <span className="text-[#2C3E50] font-serif">ℹ</span>
              </div>
              <h2 className="font-handwritten text-2xl text-[#2C3E50]">
                Personal description of original landscape & source material
              </h2>
            </div>
            <p className="font-serif text-lg text-[#2C3E50] pl-10 leading-relaxed">
              {color.description}
            </p>
          </div>

          {/* Landscape Details */}
          <div className="mb-10">
            <h2 className="font-handwritten text-2xl text-[#2C3E50] mb-4 border-b border-[#2C3E50]/20 pb-2">
              LANDSCAPE DETAILS
            </h2>
            <div className="space-y-4 text-data">
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
            <h2 className="font-handwritten text-2xl text-[#2C3E50] mb-4 border-b border-[#2C3E50]/20 pb-2">
              COLOR DATA
            </h2>
            <div className="space-y-4 text-data">
              <p>- Type: {color.materials[0]?.name}</p>
              {color.processes.map(process => (
                <div key={process.id}>
                  <p>- Application: {process.application}</p>
                  <p>- Process/Recipe: {process.technique}</p>
                  <p className="text-sm text-[#2C3E50]/80 pl-4 italic">{process.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Process Images */}
        <div className="space-y-6">
          {/* Process Images */}
          {mediaUploads.filter(media => media.type === 'process').length > 0 && (
            <div className="grid grid-cols-2 gap-6">
              {mediaUploads.filter(media => media.type === 'process').map(media => (
                <div key={media.id} className="relative">
                  <ImageGalleryWrapper
                    media={{
                      ...media,
                      colorId: color.id,
                      comments: media.comments ?? []
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

      {/* Pigment Analysis Modal */}
      <Dialog.Root open={isPigmentModalOpen} onOpenChange={setPigmentModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-0 right-0 h-full w-full md:w-[420px] z-50 bg-white shadow-2xl flex flex-col p-8 overflow-y-auto border-l-4 border-black" style={{fontFamily:'Caveat, cursive'}}>
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
    </>
  );
} 