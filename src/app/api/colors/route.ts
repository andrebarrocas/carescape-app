import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { GET as authHandler } from '@/app/api/auth/[...nextauth]/route';
import { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ColorWithMedia {
  id: string;
  name: string;
  hex: string;
  description: string;
  location: string;
  coordinates: string | null;
  season: string;
  dateCollected: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
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
}

interface TransformedColor extends Omit<ColorWithMedia, 'coordinates'> {
  coordinates: { lat: number; lng: number } | null;
  mediaUploads: Array<ColorWithMedia['mediaUploads'][0] & { url: string }>;
}

export async function GET() {
  try {
    const colors = await prisma.color.findMany({
      include: {
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
        coordinates: parsedCoordinates,
        mediaUploads: color.mediaUploads.map(media => ({
          ...media,
          url: `/api/images/${media.id}`,
        })),
      };
    });

    return NextResponse.json(transformedColors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch colors' },
      { status: 500 }
    );
  }
}

// Function to convert image URL to Buffer
async function imageUrlToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Get or create the anonymous user
    let anonymousUser = await prisma.user.findFirst({
      where: { email: 'anonymous@carespace.app' }
    });

    if (!anonymousUser) {
      anonymousUser = await prisma.user.create({
        data: {
          email: 'anonymous@carespace.app',
          name: 'Anonymous User',
        }
      });
    }
    
    // Create the color using the anonymous user
    const color = await prisma.color.create({
      data: {
        name: data.name,
        hex: data.hex,
        description: data.description,
        location: data.location,
        coordinates: JSON.stringify(data.coordinates),
        season: data.season,
        dateCollected: new Date(data.dateCollected),
        userId: anonymousUser.id,
        materials: {
          create: [{
            name: data.sourceMaterial,
            partUsed: data.application || 'Not specified',
            originNote: data.process || 'Not specified'
          }]
        },
        processes: {
          create: [{
            technique: data.type,
            application: data.application || 'Not specified',
            notes: data.process
          }]
        }
      }
    });

    // Update media uploads with the color ID if any were provided
    if (data.mediaUploads && data.mediaUploads.length > 0) {
      await Promise.all(
        data.mediaUploads.map((media: { id: string }) =>
          prisma.mediaUpload.update({
            where: { id: media.id },
            data: { colorId: color.id }
          })
        )
      );
    }

    // Return the created color with its media uploads
    const createdColor = await prisma.color.findUnique({
      where: { id: color.id },
      include: {
        materials: true,
        processes: true,
        mediaUploads: {
          select: {
            id: true,
            filename: true,
            mimetype: true,
            type: true,
            caption: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, color: createdColor });
  } catch (error) {
    console.error('Error creating color:', error);
    return new NextResponse(error instanceof Error ? error.message : 'Error creating color', { status: 500 });
  }
} 