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

async function getColorDetails(id: string): Promise<ExtendedColor> {
  // First, get the color with basic relations
  const color = await prisma.color.findUnique({
    where: { id },
    include: {
      materials: true,
      processes: true,
      mediaUploads: true
    }
  });

  if (!color) {
    throw new Error('Color not found');
  }

  // Then, get comments for each media upload
  const mediaUploadsWithComments = await Promise.all(
    color.mediaUploads.map(async (media) => {
      const comments = await prisma.comment.findMany({
        where: { mediaId: media.id },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      });

      const { data, ...mediaWithoutData } = media;
      return {
        ...mediaWithoutData,
        comments: comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          user: comment.user
        })),
        createdAt: mediaWithoutData.createdAt.toISOString(),
        type: mediaWithoutData.type as 'outcome' | 'landscape' | 'process',
        caption: mediaWithoutData.caption
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
    type: color.processes[0]?.technique as 'pigment' | 'dye' | 'ink'
  };
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

    // Separate media by type - check for both landscape and outcome types
    const mainImage = color.mediaUploads.find(media => media.type === 'landscape' || media.type === 'outcome');
    const processImages = color.mediaUploads.filter(media => media.type === 'process');

    // Parse coordinates for the map
    const coordinates = color.coordinates ? JSON.parse(color.coordinates) : null;
    const boundary = color.bioregion?.boundary?.coordinates?.[0]?.map(([lng, lat]) => [lat, lng]) as [number, number][] | undefined;

    const content = (
      <main className="min-h-screen bg-[#FFFCF5] py-12">
        <div className="max-w-[1800px] mx-auto px-8">
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
                      {format(new Date(color.dateCollected), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <EditButton />
                </div>
              </div>

               {/* Main Landscape Image */}
               {mainImage && (
                <div className="mb-8">
                  <div className="relative w-full aspect-[4/3] bg-white rounded-lg overflow-hidden">
                    <Image
                      src={`/api/images/${mainImage.id}`}
                      alt={mainImage.caption || 'Landscape'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      unoptimized
                      loading="eager"
                    />
                  </div>
                  {mainImage.caption && (
                    <p className="mt-2 font-handwritten text-base text-[#2C3E50]/80">
                      {mainImage.caption}
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
                  {coordinates && (
                    <div className="pl-4">
                      <MapComponent 
                        coordinates={coordinates}
                        boundary={boundary}
                      />
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
            {/* Right Column - Color Info and Images */}
            <div className="space-y-6">
              {/* Process Images */}
              {processImages.length > 0 && (
                <div className="grid grid-cols-2 gap-6">
                  {processImages.map(media => (
                    <div key={media.id} className="relative">
                      <ImageGalleryWrapper
                        media={{
                          ...media,
                          colorId: color.id
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );

    return (
      <ColorDetailsClient 
        color={color}
        mediaUploads={color.mediaUploads}
      >
        {content}
      </ColorDetailsClient>
    );
  } catch (error) {
    console.error('Error in ColorDetails:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading color details</p>
      </div>
    );
  }
} 