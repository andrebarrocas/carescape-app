import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { GET as authHandler } from '@/app/api/auth/[...nextauth]/route';
import { Session } from 'next-auth';

interface ExtendedSession extends Session {
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

const authOptions = authHandler.config;

export async function GET() {
  try {
    // Get all colors with their related data using Prisma
    const colors = await prisma.color.findMany({
      include: {
        user: {
          select: {
            pseudonym: true,
          },
        },
        materials: true,
        processes: true,
        mediaUploads: true,
      },
    });

    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession;
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
        locationGeom: {
          type: 'Point',
          coordinates: [data.coordinates.lng, data.coordinates.lat],
        },
        sourceMaterial: data.sourceMaterial,
        type: data.type,
        application: data.application,
        process: data.process,
        season: data.season,
        dateCollected: new Date(data.dateCollected),
        userId: session.user.id,
      },
    });

    // Create media uploads
    if (data.mediaUploads?.length) {
      await prisma.mediaUpload.createMany({
        data: data.mediaUploads.map((media: any) => ({
          colorId: color.id,
          type: media.type,
          url: media.url, // You'll need to handle file uploads separately
          caption: media.caption,
        })),
      });
    }

    return NextResponse.json(color);
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json({ error: 'Failed to create color' }, { status: 500 });
  }
} 