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
  description: string | null;
  aiDescription: string | null;
  location: string;
  coordinates: string | null;
  bioregion: string | null;
  bioregionMap: string | null;
  season: string;
  dateCollected: Date;
  userId: string;
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

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      name,
      description,
      aiDescription,
      location,
      coordinates,
      hex,
      sourceMaterial,
      type,
      application,
      process,
      season,
      dateCollected,
      mediaUploads,
      userId,
      authorName,
    } = data;

    // Get or create anonymous user if no userId provided
    let finalUserId = userId;
    if (!finalUserId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        finalUserId = session.user.id;
        // Update user's name if authorName is provided
        if (authorName) {
          await prisma.user.update({
            where: { id: finalUserId },
            data: { name: authorName }
          });
        }
      } else {
        // Create or find anonymous user
        const anonymousUser = await prisma.user.findFirst({
          where: { email: 'anonymous@carespace.app' }
        });

        if (!anonymousUser) {
          const newAnonymousUser = await prisma.user.create({
            data: {
              email: 'anonymous@carespace.app',
              name: authorName || 'Anonymous',
            }
          });
          finalUserId = newAnonymousUser.id;
        } else {
          finalUserId = anonymousUser.id;
          // Update anonymous user's name if authorName is provided
          if (authorName) {
            await prisma.user.update({
              where: { id: finalUserId },
              data: { name: authorName }
            });
          }
        }
      }
    } else if (authorName) {
      // Update existing user's name if authorName is provided
      await prisma.user.update({
        where: { id: finalUserId },
        data: { name: authorName }
      });
    }

    const color = await prisma.color.create({
      data: {
        name,
        description: description || '',
        aiDescription,
        location,
        coordinates: coordinates ? JSON.stringify(coordinates) : null,
        hex,
        dateCollected: new Date(dateCollected),
        season,
        userId: finalUserId,
        materials: {
          create: {
            name: sourceMaterial,
            partUsed: 'whole',
            originNote: '',
          },
        },
        processes: {
          create: {
            technique: type,
            application: application || '',
            notes: process,
          },
        },
        mediaUploads: mediaUploads ? {
          create: mediaUploads.map((upload: any) => ({
            filename: upload.filename,
            mimetype: upload.mimetype,
            type: upload.type,
            caption: upload.caption,
          })),
        } : undefined,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json(
      { error: 'Failed to create color' },
      { status: 500 }
    );
  }
} 