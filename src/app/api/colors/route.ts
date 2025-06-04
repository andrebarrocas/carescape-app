import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

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
        tags: {
          include: {
            tag: true,
          },
        },
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
    const body = await request.json();

    // Create the color and all related data in a single transaction
    const color = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => {
      // Create the color
      const newColor = await tx.color.create({
        data: {
          name: body.name,
          hex: body.hex,
          description: body.description,
          season: body.season,
          dateCollected: new Date(body.dateCollected),
          locationGeom: body.locationGeom,
          userId: body.userId,
          // Create materials if provided
          materials: body.materials?.length ? {
            create: body.materials,
          } : undefined,
          // Create processes if provided
          processes: body.processes?.length ? {
            create: body.processes,
          } : undefined,
          // Create media uploads if provided
          mediaUploads: body.mediaUploads?.length ? {
            create: body.mediaUploads,
          } : undefined,
          // Create tag connections if provided
          tags: body.tags?.length ? {
            create: body.tags.map((tagId: string) => ({
              tag: {
                connect: { id: tagId },
              },
            })),
          } : undefined,
        },
        include: {
          user: {
            select: {
              pseudonym: true,
            },
          },
          materials: true,
          processes: true,
          mediaUploads: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return newColor;
    });

    return NextResponse.json(color, { status: 201 });
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json({ error: 'Failed to create color' }, { status: 500 });
  }
} 