'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditColorForm from '@/components/EditColorForm';
import { ImageGalleryWrapper } from '@/components/ImageGalleryWrapper';
import { ExtendedColor, MediaUploadWithComments } from '@/app/colors/[id]/types';
import { Pencil } from 'lucide-react';
import React from 'react';

interface ColorDetailsClientProps {
  children: React.ReactNode;
  color: ExtendedColor;
  mediaUploads: MediaUploadWithComments[];
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

export function ColorDetailsClient({ children, color, mediaUploads }: ColorDetailsClientProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-[#2C3E50] p-2 rounded-lg hover:bg-[#2C3E50]/90 transition-colors group flex items-center gap-2 text-white"
            >
              <Pencil className="w-5 h-5" />
              <span className="text-sm">Edit Color</span>
            </button>
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
                      colorId: color.id
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
      <div className="relative">
        {enhancedChildren}
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
    </>
  );
} 