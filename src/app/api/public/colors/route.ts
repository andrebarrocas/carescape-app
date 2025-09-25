import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ColorWithMedia {
  id: string;
  name: string;
  hex: string;
  description: string | null;
  aiDescription: string | null;
  location: string;
  coordinates: string | null;
  bioregion: string | null;
  bioregionMap: string | null;
  season: string;
  dateCollected: Date;
  userId: string;
  authorName: string | null;
  type: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    pseudonym: string | null;
  };
  materials: {
    id: string;
    name: string;
    partUsed: string;
    originNote: string;
    colorId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  processes: {
    id: string;
    technique: string;
    application: string;
    notes: string;
    colorId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  mediaUploads: {
    id: string;
    filename: string;
    mimetype: string;
    type: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  bioregionId: string | null;
}

interface TransformedColor extends Omit<ColorWithMedia, 'coordinates'> {
  coordinates: { lat: number; lng: number } | null;
  mediaUploads: Array<ColorWithMedia['mediaUploads'][0] & { url: string }>;
}

export async function GET() {
  try {
    // Public endpoint - no authentication required
    const colors = await prisma.color.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            pseudonym: true,
          },
        },
        materials: true,
        processes: true,
        mediaUploads: {
          select: {
            id: true,
            filename: true,
            mimetype: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the response to include image URLs and parse coordinates
    const transformedColors: TransformedColor[] = colors.map((color: ColorWithMedia) => {
      // Parse coordinates from string to object
      let parsedCoordinates = null;
      if (color.coordinates) {
        try {
          parsedCoordinates = JSON.parse(color.coordinates) as { lat: number; lng: number };
        } catch (e) {
          console.error('Failed to parse coordinates for color:', color.name, e);
        }
      }

      return {
        ...color,
        type: color.type || 'pigment', // Ensure type is never null
        coordinates: parsedCoordinates,
        mediaUploads: color.mediaUploads.map(media => ({
          ...media,
          url: `/api/images/${media.id}`,
        })),
      };
    });

    return NextResponse.json(transformedColors);
  } catch (error) {
    console.error('Error fetching public colors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch colors' },
      { status: 500 }
    );
  }
}
