import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { GET as authHandler } from '@/app/api/auth/[...nextauth]/route';
import { Session } from 'next-auth';

interface ColorWithMedia {
  id: string;
  name: string;
  hex: string;
  description: string;
  location: string;
  coordinates: string;
  season: string;
  dateCollected: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  materials: any[];
  processes: any[];
  mediaUploads: {
    id: string;
    filename: string;
    mimetype: string;
    type: string;
  }[];
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
        dateCollected: 'desc',
      },
    });

    // Add debug logging
    console.log('Fetched colors:', colors);

    // Transform the response to include image URLs
    const transformedColors = colors.map((color: ColorWithMedia) => {
      const transformed = {
        ...color,
        mediaUploads: color.mediaUploads.map(media => ({
          ...media,
          url: `/api/images/${media.id}`,
        })),
      };
      console.log('Transformed color:', transformed);
      return transformed;
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authHandler.config) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Create the color entry
    const color = await prisma.color.create({
      data: {
        name: data.name,
        hex: data.hex,
        description: data.description,
        location: data.location,
        coordinates: JSON.stringify({ lat: data.coordinates.lat, lng: data.coordinates.lng }),
        season: data.season,
        dateCollected: new Date(data.dateCollected),
        userId: session.user.id,
        materials: {
          create: data.materials,
        },
        processes: {
          create: data.processes,
        },
      },
      include: {
        materials: true,
        processes: true,
        mediaUploads: true,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json({ error: 'Failed to create color' }, { status: 500 });
  }
} 