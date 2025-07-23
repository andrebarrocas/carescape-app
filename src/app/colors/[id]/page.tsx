import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import { format } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { MapComponent } from '../../../components/MapComponent';
import { ColorDetailsClient } from './ColorDetailsClient';
import { ImageGalleryWrapper } from '@/components/ImageGalleryWrapper';
import type { ExtendedColor, MediaUploadWithComments } from './types';
import { EditButton } from './EditButton';
import { Palette } from 'lucide-react';
import MenuAndBreadcrumbs from '@/components/MenuAndBreadcrumbs';
import dynamic from 'next/dynamic';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import PigmentAnalysis from '@/components/PigmentAnalysis';
import { X } from 'lucide-react';
import { Metadata } from 'next';

async function getColorDetails(id: string): Promise<ExtendedColor> {
  // First, get the color with basic relations
  const color = await prisma.color.findUnique({
    where: { id },
    include: {
      materials: true,
      processes: true,
      mediaUploads: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          pseudonym: true,
        }
      }
    }
  });

  if (!color) {
    throw new Error('Color not found');
  }

  // Then, get comments for each media upload with proper threading and user data
  const mediaUploadsWithComments = await Promise.all(
    color.mediaUploads.map(async (media) => {
      const comments = await prisma.comment.findMany({
        where: { 
          mediaId: media.id,
          parentId: null // Only get top-level comments
        },
        include: {
          user: {
            select: {
              name: true,
              pseudonym: true,
              email: true,
              image: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  name: true,
                  pseudonym: true,
                  email: true,
                  image: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Helper function to get display name
      const getDisplayName = (user: any): string => {
        if (user.pseudonym) {
          return user.pseudonym;
        } else if (user.name) {
          return user.name;
        } else if (user.email && user.email !== 'anonymous@carespace.app') {
          return user.email.split('@')[0];
        }
        return 'Anonymous';
      };

      const { data, ...mediaWithoutData } = media;
      return {
        ...mediaWithoutData,
        comments: comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          user: {
            ...comment.user,
            displayName: getDisplayName(comment.user)
          },
          replies: comment.replies.map(reply => ({
            id: reply.id,
            content: reply.content,
            createdAt: reply.createdAt.toISOString(),
            user: {
              ...reply.user,
              displayName: getDisplayName(reply.user)
            }
          }))
        })),
        createdAt: mediaWithoutData.createdAt.toISOString(),
        type: mediaWithoutData.type as 'outcome' | 'landscape' | 'process',
        caption: mediaWithoutData.caption ?? ''
      };
    })
  );

  // Parse bioregion data from string
  const bioregion = color.bioregion ? JSON.parse(color.bioregion) : null;

  return {
    id: color.id,
    name: color.name,
    hex: color.hex,
    description: color.description,
    location: color.location,
    coordinates: color.coordinates,
    bioregion,
    dateCollected: color.dateCollected.toISOString(),
    season: color.season,
    materials: color.materials.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString()
    })),
    processes: color.processes.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    })),
    mediaUploads: mediaUploadsWithComments,
    createdAt: color.createdAt.toISOString(),
    updatedAt: color.updatedAt.toISOString(),
    userId: color.userId,
    sourceMaterial: color.materials[0]?.name || '',
    type: (color.processes[0]?.technique || color.type) as 'pigment' | 'dye' | 'ink',
    user: color.user
  };
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const color = await getColorDetails(id);
    const mainImage = color.mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome');
    
    return {
      title: `${color.name} - CareScape`,
      description: color.description || `Color details for ${color.name}`,
      other: {
        ...(mainImage && {
          'link[rel="preload"]': `href="/api/images/${mainImage.id}" as="image"`,
        })
      }
    };
  } catch (error) {
    return {
      title: 'Color Details - CareScape',
      description: 'Color details page'
    };
  }
}

export default async function ColorDetails({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  try {
    const { id } = await params;
    const [session, color] = await Promise.all([
      getServerSession(authOptions),
      getColorDetails(id)
    ]);

    // Modal state will be handled in a client component below

    // Separate media by type - check for both landscape and outcome types
    const mainImage = color.mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome');
    const processImages = color.mediaUploads.filter(media => media.type === 'process');

    // Parse coordinates for the map
    const coordinates = color.coordinates ? JSON.parse(color.coordinates) : null;
    const boundary = color.bioregion?.boundary?.coordinates?.[0]?.map(([lng, lat]) => [lat, lng]) as [number, number][] | undefined;

    const content = (
      <main className="min-h-screen bg-[#FFFCF5] py-12 pt-24">
        <MenuAndBreadcrumbs />
        <div className="flex w-full min-h-[80vh]">
          <div className="w-1/3 h-[80vh] sticky top-0">
            <MapComponent coordinates={coordinates} boundary={boundary} />
          </div>
          <div className="w-2/3 h-[80vh] overflow-y-auto">
            <ColorDetailsClient
              color={color}
              mediaUploads={color.mediaUploads}
              session={session}
            />
          </div>
        </div>
      </main>
    );

    return content;
  } catch (error) {
    console.error('Error in ColorDetails:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading color details</p>
      </div>
    );
  }
} 