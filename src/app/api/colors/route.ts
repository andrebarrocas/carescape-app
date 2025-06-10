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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    
    // Create the color first
    const color = await prisma.color.create({
      data: {
        name: "Citrus Yellow",
        hex: "#FFD700",
        description: "A vibrant yellow extracted from fresh lemon peels, capturing the essence of Mediterranean citrus groves.",
        location: "Sorrento Lemon Grove, Amalfi Coast, Italy",
        coordinates: JSON.stringify({ lat: 40.6262, lng: 14.3757 }), // Sorrento coordinates
        bioregion: JSON.stringify({
          description: "Mediterranean coastal citrus-growing region",
          boundary: {
            type: "Polygon",
            coordinates: [[[14.3757, 40.6262], [14.3857, 40.6362], [14.3957, 40.6262], [14.3857, 40.6162], [14.3757, 40.6262]]]
          }
        }),
        season: "Summer",
        dateCollected: new Date("2024-06-15"),
        userId: session.user.id,
        materials: {
          create: [{
            name: "Lemon",
            partUsed: "Peel",
            originNote: "Fresh Sorrento lemons from local groves"
          }]
        },
        processes: {
          create: [{
            technique: "Extraction and grinding",
            application: "Direct pigment extraction",
            notes: "Carefully peeled and ground to extract natural pigments"
          }]
        }
      }
    });

    // Create media uploads
    const mediaUploads = await Promise.all([
      // Landscape image
      prisma.mediaUpload.create({
        data: {
          filename: "sorrento-lemon-grove.jpg",
          mimetype: "image/jpeg",
          type: "landscape",
          data: await imageUrlToBuffer("https://images.unsplash.com/photo-1528821128474-27f963b062bf"),
          caption: "Sorrento lemon grove with the Amalfi Coast in the background",
          colorId: color.id
        }
      }),
      // Process images
      prisma.mediaUpload.create({
        data: {
          filename: "lemon-zest.jpg",
          mimetype: "image/jpeg",
          type: "process",
          data: await imageUrlToBuffer("https://images.unsplash.com/photo-1582087463261-ddea03f80e5d"),
          caption: "Freshly grated lemon zest showing the intense yellow pigment",
          colorId: color.id
        }
      }),
      prisma.mediaUpload.create({
        data: {
          filename: "lemon-cross-section.jpg",
          mimetype: "image/jpeg",
          type: "process",
          data: await imageUrlToBuffer("https://images.unsplash.com/photo-1582087463261-ddea03f80e5d"),
          caption: "Cross-section of Sorrento lemons revealing their structure",
          colorId: color.id
        }
      })
    ]);

    return NextResponse.json({ color, mediaUploads });
  } catch (error) {
    console.error('Error creating color:', error);
    return new NextResponse('Error creating color', { status: 500 });
  }
} 